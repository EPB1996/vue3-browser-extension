export const useSidepanelStore = defineStore("sidepanel", () => {
  const { data: activeApp } = useBrowserLocalStorage("activeApp", "default")

  const setActiveApp = (app: string) => {
    activeApp.value = app
  }

  return {
    activeApp,
    setActiveApp,
  }
})
