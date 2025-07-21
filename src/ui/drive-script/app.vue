<script setup lang="ts">
import { XIcon, MoreHorizontal, Languages, Sparkles } from "lucide-vue-next"
import { ref } from "vue"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const labels = [
  "Summary",
  "Text generation",
  "Image generation",
  "Sentiment analysis",
  "Data extraction",
  "Translation",
]

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

<template>
  <div class="flex justify-center items-center h-full">
    <UButton>
      <Languages class="h-4 w-4"></Languages>
      Translate
    </UButton>
  </div>
</template>
