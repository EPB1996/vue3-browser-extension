<script setup lang="ts">
const router = useRouter()

defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="flex items-center gap-2 p-2 bg-neutral">
    <UButton
      icon="ph:arrow-left"
      @click="router.back()"
    >
      {{ label || "Go Back" }}
    </UButton>
    <p class="text-sm text-gray-500">{{ router.currentRoute.value.name }}</p>
  </div>
</template>

<style scoped></style>
