#!/usr/bin/env python3
"""Shoots every component from the playground on its own, light and dark.

Requires the playground to be running:

    cd playground && npm run dev
    python3 scripts/shots.py

The script looks for blocks carrying `data-shot` and writes two files per block
under `docs/media/`. Adding a component means adding a block in the playground —
nothing to change here.

Three components show nothing but a button while closed and would be worthless
as a screenshot. They are listed in OPENED below: the script clicks them open
and shoots the trigger together with the panel.
"""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3000"
OUT = Path(__file__).resolve().parent.parent / "docs" / "media"
WIDTH = 1100
SCALE = 2

# Components that only show something once opened.
#
# name: (trigger, panel, with_trigger)
#
# `with_trigger` decides the crop. The icon picker opens right below its
# button, and only both together make the picture. The two modals sit centred
# over the page, far from their trigger; a union would drag the crop across
# half the page.
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
    """Bounding box of two rectangles, with a little air around it."""
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
    """Hides every block but one.

    Without this, the crop of an opened dialog carries half the page behind it
    — dashed upload boxes, arrows, half-words at the edge.
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
            print(f"  ! no trigger for {name} ({trigger_sel})")
            continue
        trigger.scroll_into_view_if_needed()
        page.wait_for_timeout(120)
        trigger.click()
        try:
            page.wait_for_selector(panel_sel, state="visible", timeout=3000)
        except Exception:
            print(f"  ! {name} does not open")
            page.keyboard.press("Escape")
            continue
        page.wait_for_timeout(400)
        # The search field takes focus on open and then wears a green ring.
        # In a screenshot that reads like an error.
        page.evaluate("() => document.activeElement instanceof HTMLElement && document.activeElement.blur()")
        page.wait_for_timeout(150)

        panel = page.query_selector(panel_sel)
        box = panel.bounding_box()
        if with_trigger:
            # Only this block stays standing, the rest disappears.
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
        # The Markdown editor and the charts only build themselves after
        # hydration — without this pause, empty boxes end up in the images.
        page.wait_for_timeout(2000)

        total = 0
        for dark in (False, True):
            suffix = "dark" if dark else "light"
            set_theme(page, dark)
            print(f"{suffix}:")
            n = shoot_static(page, suffix)
            m = shoot_opened(page, suffix)
            print(f"  {n} static, {m} opened")
            total += n + m

        browser.close()
    print(f"\n{total} screenshots under {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())