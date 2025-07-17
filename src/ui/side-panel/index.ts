// src/index.ts
import { i18n } from "src/utils/i18n"
import { pinia } from "src/utils/pinia"
import { appRouter } from "src/utils/router"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"
import { BackgroundCommunicationService } from "@/service/communication/background.communication.service"
import { MessageHandlers } from "@/service/communication/handlers/sidepanel.handlers"

appRouter.addRoute({
  path: "/",
  redirect: "/side-panel",
})

const app = createApp(App).use(i18n).use(ui).use(pinia).use(appRouter)

app.mount("#app")

const selectionStore = useSelectionStore()
const sidePanelStore = useSidepanelStore()

// Initialize background communication service
const backgroundService = BackgroundCommunicationService.getInstance()

// Initialize message handlers
const sidePanelMessageHandlers = new MessageHandlers(sidePanelStore)
sidePanelMessageHandlers.registerAllHandlers()

export default app

// Global error handler
self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  backgroundService.initialize("sidepanel")
  console.info("Background communication service initialized")
  backgroundService.sendInitialMessage()
})

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  backgroundService.reconnectIfNeeded("sidepanel")
})
