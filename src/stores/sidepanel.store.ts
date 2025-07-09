export const useSidepanelStore = defineStore("sidepanel", () => {
  const { data: threadId } = useBrowserLocalStorage("threadID", "")

  const setThreadId = (newThreadId: string) => {
    threadId.value = newThreadId
  }

  return {
    threadId,
    setThreadId,
  }
})
