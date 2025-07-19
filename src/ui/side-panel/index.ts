// src/index.ts
import { i18n } from "src/utils/i18n"
import { pinia } from "src/utils/pinia"
import { appRouter } from "src/utils/router"
import {
  messageServicePlugin,
  sidepanelMessageService,
} from "@/utils/message/MessageServicePlugin"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"
import { MESSAGE_TYPES, PORT_NAMES } from "@/service/messaging/message.types"

appRouter.addRoute({
  path: "/",
  redirect: "/side-panel",
})

const app = createApp(App)
  .use(i18n)
  .use(ui)
  .use(pinia)
  .use(appRouter)
  .use(messageServicePlugin)

app.mount("#app")

export default app

const selectionStore = useSelectionStore()
const sidePanelStore = useSidepanelStore()

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
  sidepanelMessageService.connectToBackground(PORT_NAMES.SIDEPANEL)
})

// INIT_PORT from background script
sidepanelMessageService.onMessage(
  MESSAGE_TYPES.INIT_PORT,
  (payload, senderId, port) => {
    console.info(`Sidepanel received INIT_PORT from ${senderId}.`)
  },
)

// TAB_ACTIVATED Handler
sidepanelMessageService.onMessage(
  MESSAGE_TYPES.TAB_ACTIVATED,
  (payload: { tabId: number; url: string }, senderId, port) => {
    // If mail app route to gmail page
    if (payload.url.startsWith("https://mail.google.com")) {
      if (payload.url.includes("#inbox")) {
        sidepanelMessageService.sendMessageToTab(
          payload.tabId,
          MESSAGE_TYPES.CONTENT_SCRIPT_FUNCTION,
          {
            targetTabId: payload.tabId,
            functionName: "getThreadId",
            args: [],
          },
          {},
          (response) => {
            sidePanelStore.setThreadId(response.threadId)
          },
        )
      }

      appRouter.push({
        path: "/side-panel/gmail",
      })
    }
    // If docs app route to docs page
    else if (payload.url.startsWith("https://docs.google.com")) {
      appRouter.push({
        path: "/side-panel/docs",
      })
    }
    // Default to index
    else {
      appRouter.push({
        path: "/side-panel",
      })
    }
  },
)

// TAB_UPDATED Handler
sidepanelMessageService.onMessage(
  MESSAGE_TYPES.TAB_UPDATED,
  async (payload: { tabId: number; url: string }, senderId, port) => {
    if (payload.url.includes("#inbox")) {
      // call contentscript function with one-time message
      sidepanelMessageService.sendMessageToTab(
        payload.tabId,
        MESSAGE_TYPES.CONTENT_SCRIPT_FUNCTION,
        {
          targetTabId: payload.tabId,
          functionName: "getThreadId",
          args: [],
        },
        {},
        (response) => {
          sidePanelStore.setThreadId(response.threadId)
        },
      )
    }
  },
)

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  //sidepanelCommunicationService.reconnectIfNeeded("sidepanel")
})
