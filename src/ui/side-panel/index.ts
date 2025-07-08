import { i18n } from "src/utils/i18n"
import { pinia } from "src/utils/pinia"
import { appRouter } from "src/utils/router"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"
import { BaseMessage, Message } from "@/message/message"

appRouter.addRoute({
  path: "/",
  redirect: "/side-panel",
})

const app = createApp(App).use(i18n).use(ui).use(pinia).use(appRouter)

app.mount("#app")

const selectionStore = useSelectionStore()
const sidePanelStore = useSidepanelStore()

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

function handleBackgroundMessage(message: Message) {
  const response: Message = {
    type: "RESPONSE",
    timestamp: Date.now(),
    data: {
      message: "Message received by side panel",
      originalType: message.type,
      originalData: message.data,
    },
  }
  switch (message.type) {
    case "PAGE_DATA":
      selectionStore.setSelection(message.data.message)
      break
    case "TAB_UPDATED":
      console.info("Tab updated:", message.data.tabId, message.data.url)
      break
    case "TAB_ACTIVATED":
      console.info("Tab activated:", message.data.tabId, message.data.url)
      // if mail app route to gmail page
      if (message.data.url.startsWith("https://mail.google.com")) {
        appRouter.push({
          path: "/side-panel/gmail",
        })
      }
      // if docs app route to docs page
      else if (message.data.url.startsWith("https://docs.google.com")) {
        appRouter.push({
          path: "/side-panel/docs",
        })
      }
      // default to index
      else {
        appRouter.push({
          path: "/side-panel",
        })
      }

      break
    case "ERROR":
      console.error("Error from background:", message.data)
      break
  }
  // Send a response back to the background script
  sendToBackground(response)
}

function sendToBackground(message: Message) {
  if (backgroundPort) {
    backgroundPort.postMessage(message)
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
