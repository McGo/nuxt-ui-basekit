<script setup lang="ts">
// Die Rückfrage hängt global im Baum — sonst hat `useConfirm()` nichts zum
// Öffnen. Genau so gehört sie auch in eine echte Anwendung.
</script>

<template>
  <UApp>
    <NuxtPage />
    <BaseKitConfirmModal />
  </UApp>
</template>
