<template>
  <div class="flex flex-col gap-2 p-2">
    <div
      v-for="(icon, label) in labels"
      :key="label"
    >
      <UButton
        :icon="icon"
        variant="solid"
        @click="
          () => {
            labelRef = label
            loading = true
          }
        "
      >
        {{ label }}
      </UButton>
    </div>
  </div>
  <div class="mt-4">
    <h2 class="text-lg font-semibold mb-2">Clicked item</h2>
    <div>
      {{ clickedElement }}
    </div>
  </div>

  <div class="mt-4">
    <h2 class="text-lg font-semibold mb-2">Current Selection</h2>
    {{ t }}
    <textarea
      v-model="selection"
      class="w-full h-40 p-2 border rounded resize-none"
      readonly
    ></textarea>
  </div>

  <div
    v-if="loading || response"
    class="p-2 rounded-lg"
    style="background-color: grey"
  >
    <div
      v-if="loading"
      class="rounded-lg flex items-center gap-2"
    >
      <span class="font-bold">{{ labelRef }}</span>
    </div>
    <div v-if="response">
      <h3 class="font-bold">Response:</h3>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectionStore = useSelectionStore()
const { setSelection } = selectionStore
const { selection, clickedElement } = storeToRefs(selectionStore)

watch(clickedElement, (newElement) => {
  if (newElement) {
    console.info("new")
  }
})

const t = ref()

const labels = {
  Translation: "ph:translate",
  OTHERS: "ph:acorn",
}

const labelRef = ref("")
const open = ref(false)
const loading = ref(false)
const response = ref("")

watch(labelRef, async (newLabel) => {
  if (newLabel && loading.value) {
    const responses = [
      `AI response part 1 for "${newLabel}"`,
      `AI response part 2 for "${newLabel}"`,
      `AI response part 3 for "${newLabel}"`,
    ]
    response.value = ""
    loading.value = true

    responses.forEach((res, index) => {
      setTimeout(
        () => {
          response.value += `${res}\n`
          if (index === responses.length - 1) {
            loading.value = false
          }
        },
        1000 * (index + 1),
      ) // Simulate a delay for each response part
    })
  }
})
</script>
