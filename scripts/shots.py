#!/usr/bin/env python3
"""Nimmt jede Komponente aus dem Playground einzeln auf — hell und dunkel.

Voraussetzung: der Playground läuft.

    cd playground && npm run dev
    python3 scripts/shots.py

Das Skript sucht im Schaubild nach Blöcken mit `data-shot` und legt für jeden
zwei Dateien unter `docs/media/` ab. Wer eine Komponente hinzufügt, ergänzt im
Playground einen Block — hier ist nichts nachzutragen.

Drei Komponenten zeigen geschlossen nur einen Knopf und wären als Aufnahme
wertlos. Für sie steht unten eine kleine Liste: das Skript klickt sie auf und
nimmt Auslöser und aufgeklappten Inhalt zusammen auf.
"""

import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
OUT = Path(__file__).resolve().parent.parent / "docs" / "media"
WIDTH = 1100
SCALE = 2

# Komponenten, die erst im geöffneten Zustand etwas zeigen.
#
# name: (Auslöser, Inhalt, mit_ausloeser)
#
# `mit_ausloeser` entscheidet über den Ausschnitt. Beim Symbolwähler klappt der
# Inhalt direkt unter dem Knopf auf — beide zusammen ergeben erst das Bild.
# Die beiden Modale liegen mittig über der Seite, weit weg von ihrem Auslöser;
# eine Vereinigung zöge den Ausschnitt über die halbe Seite.
OPENED = {
    "BaseKitIconPicker": ('[data-shot="BaseKitIconPicker"] button', '[data-reka-popper-content-wrapper]', True),
    "BaseKitRecordPicker": ('[data-shot="BaseKitRecordPicker"] button', '[role="dialog"]', False),
    "BaseKitConfirmModal": ('[data-shot="BaseKitConfirmModal-trigger"] button', '[role="dialog"]', False),
}


def set_theme(page, dark: bool) -> None:
    page.evaluate(
        "(dark) => { const c = document.documentElement.classList;"
        " c.toggle('dark', dark); document.documentElement.style.colorScheme = dark ? 'dark' : 'light' }",
        dark,
    )
    page.wait_for_timeout(250)


def union(a: dict, b: dict) -> dict:
    """Umschließendes Rechteck zweier Kästen, mit etwas Luft."""
    left = min(a["x"], b["x"]) - 12
    top = min(a["y"], b["y"]) - 12
    right = max(a["x"] + a["width"], b["x"] + b["width"]) + 12
    bottom = max(a["y"] + a["height"], b["y"] + b["height"]) + 12
    return {"x": max(0, left), "y": max(0, top), "width": right - left, "height": bottom - top}


def shoot_static(page, suffix: str) -> int:
    count = 0
    for handle in page.query_selector_all("[data-shot]"):
        name = handle.get_attribute("data-shot")
        if name.endswith("-trigger"):
            continue
        handle.scroll_into_view_if_needed()
        page.wait_for_timeout(120)
        handle.screenshot(path=str(OUT / f"{name}-{suffix}.png"))
        count += 1
    return count


def isolate(page, keep: str | None) -> None:
    """Blendet alle Blöcke bis auf einen aus.

    Ohne das steht im Ausschnitt eines aufgeklappten Dialogs die halbe Seite
    dahinter — gestrichelte Upload-Kästen, Pfeile, halbe Wörter am Rand.
    """
    page.evaluate(
        "(keep) => document.querySelectorAll('[data-shot]').forEach((el) => {"
        " el.style.visibility = el.getAttribute('data-shot') === keep ? '' : 'hidden' })",
        keep,
    )


def restore(page) -> None:
    page.evaluate("() => document.querySelectorAll('[data-shot]').forEach((el) => { el.style.visibility = '' })")


def shoot_opened(page, suffix: str) -> int:
    count = 0
    for name, (trigger_sel, panel_sel, with_trigger) in OPENED.items():
        trigger = page.query_selector(trigger_sel)
        if trigger is None:
            print(f"  ! kein Auslöser für {name} ({trigger_sel})")
            continue
        trigger.scroll_into_view_if_needed()
        page.wait_for_timeout(120)
        trigger.click()
        try:
            page.wait_for_selector(panel_sel, state="visible", timeout=3000)
        except Exception:
            print(f"  ! {name} klappt nicht auf")
            page.keyboard.press("Escape")
            continue
        page.wait_for_timeout(400)
        # Der Suchschlitz zieht beim Öffnen den Fokus und trägt dann einen
        # grünen Ring. Im Bild sieht das nach Fehlermeldung aus.
        page.evaluate("() => document.activeElement instanceof HTMLElement && document.activeElement.blur()")
        page.wait_for_timeout(150)

        panel = page.query_selector(panel_sel)
        box = panel.bounding_box()
        if with_trigger:
            # Nur der eigene Block bleibt stehen, der Rest verschwindet.
            isolate(page, name)
            page.wait_for_timeout(120)
            trigger_box = trigger.bounding_box()
            clip = union(box, trigger_box) if trigger_box else box
        else:
            isolate(page, None)
            page.wait_for_timeout(120)
            clip = box

        page.screenshot(path=str(OUT / f"{name}-{suffix}.png"), clip=clip)
        restore(page)
        count += 1
        page.keyboard.press("Escape")
        page.wait_for_timeout(300)
    return count


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(
            viewport={"width": WIDTH, "height": 1400},
            device_scale_factor=SCALE,
        )
        page.goto(URL, wait_until="networkidle")
        # Der Markdown-Editor und die Diagramme bauen sich erst nach der
        # Hydration auf — ohne diese Pause landen leere Kästen in den Bildern.
        page.wait_for_timeout(2000)

        total = 0
        for dark in (False, True):
            suffix = "dark" if dark else "light"
            set_theme(page, dark)
            print(f"{suffix}:")
            n = shoot_static(page, suffix)
            m = shoot_opened(page, suffix)
            print(f"  {n} statisch, {m} aufgeklappt")
            total += n + m

        browser.close()
    print(f"\n{total} Aufnahmen unter {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())