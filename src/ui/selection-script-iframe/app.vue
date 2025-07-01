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
  <div class="flex flex-row gap-2 items-start">
    <div
      class="px-2 flex flex-row items-center justify-between rounded-lg gap-1"
      style="background-color: red"
    >
      <DropdownMenu
        class="z-10"
        v-model:open="open"
      >
        <DropdownMenuTrigger as-child>
          <UButton
            variant="ghost"
            size="sm"
          >
            <MoreHorizontal />
          </UButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          class="w-[200px]"
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem
              @select="
                (ev) => {
                  labelRef = 'Translation'
                  open = false
                  loading = true
                }
              "
            >
              <Languages class="h-4 w-4"></Languages>
              Translate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Sparkles class="h-4 w-4 me-2"></Sparkles>
                AI functions
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent class="p-0">
                <Command>
                  <CommandInput
                    placeholder="Filter label..."
                    auto-focus
                  />
                  <CommandList>
                    <CommandEmpty>No label found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        v-for="label in labels"
                        :key="label"
                        :value="label"
                        @select="
                          (ev) => {
                            labelRef = ev.detail.value as string
                            open = false
                            loading = true
                          }
                        "
                      >
                        {{ label }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div
      v-if="loading || response"
      class="bg-primary p-2 rounded-lg"
    >
      <div
        v-if="loading"
        class="rounded-lg flex items-center gap-2"
      >
        <Sparkles class="h-4 w-4 animate-spin" />
        <span class="font-bold">{{ labelRef }}</span>
      </div>
      <div v-if="response">
        <h3 class="font-bold">Response:</h3>
        <pre>{{ response }}</pre>
      </div>
    </div>
  </div>
</template>
