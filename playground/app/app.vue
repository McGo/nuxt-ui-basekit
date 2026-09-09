<script setup lang="ts">
// The confirmation lives globally in the tree — otherwise `useConfirm()` has
// nothing to open. This is exactly how it belongs in a real application too.
</script>

<template>
  <UApp>
    <NuxtPage />
    <BaseKitConfirmModal />
  </UApp>
</template>
