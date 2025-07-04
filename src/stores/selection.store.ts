export const useSelectionStore = defineStore("selection", () => {
  const { data: selection } = useBrowserLocalStorage(
    "selection",
    "No last selection",
  )

  const setSelection = (text: string) => {
    selection.value = text
  }

  const clearSelection = () => {
    selection.value = "No last selection"
  }

  const { data: clickedElement } = useBrowserLocalStorage(
    "clickedElement",
    null as HTMLElement | null,
  )

  const setClickedElement = (element: HTMLElement | null) => {
    console.info("Setting clicked element:", element)
    clickedElement.value = element
  }

  const clearClickedElement = () => {
    clickedElement.value = null
  }

  return {
    selection,
    setSelection,
    clearSelection,
    clickedElement,
    setClickedElement,
    clearClickedElement,
  }
})
