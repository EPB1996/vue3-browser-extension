import { i18n } from "src/utils/i18n"
import { pinia } from "src/utils/pinia"
import { appRouter } from "src/utils/router"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"

appRouter.addRoute({
  path: "/",
  redirect: "/side-panel",
})

const app = createApp(App).use(i18n).use(ui).use(pinia).use(appRouter)

app.mount("#app")

const selectionStore = useSelectionStore()

export default app

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

let backgroundPort: chrome.runtime.Port | null = null
// Initialize connection to background script
function initializeConnection() {
  backgroundPort = chrome.runtime.connect({ name: "sidepanel" })

  // Listen for messages from background script
  backgroundPort.onMessage.addListener((message) => {
    console.info("Sidepanel received:", message)
    handleBackgroundMessage(message)
    console.info("Received message from background:", message)
  })

  // Handle disconnection
  backgroundPort.onDisconnect.addListener(() => {
    console.info("Background script disconnected")

    backgroundPort = null

    // Try to reconnect after a delay
    setTimeout(initializeConnection, 2000)
  })

  console.info("BACKGROUND <--> SIDE PANEL: Connection established")
}

function handleBackgroundMessage(message: { type: any; data: any }) {
  switch (message.type) {
    case "PAGE_DATA":
      selectionStore.setSelection(message.data.message)
      break
    case "TAB_UPDATED":
      console.info("Tab updated:", message.data)
      break

    case "ERROR":
      console.error("Error from background:", message.data)
      break

    default:
      console.info("Unknown message type:", message.type)
  }
}

function sendToBackground(message: any) {
  if (backgroundPort) {
    backgroundPort.postMessage(message)
    console.info("Sent to background:", message)
  } else {
    console.error("No connection to background script")
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeConnection()

  // Send initial message
  setTimeout(() => {
    sendToBackground({
      type: "SIDEPANEL_READY",
      timestamp: Date.now(),
    })
  }, 500)
})

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !backgroundPort) {
    initializeConnection()
  }
})
