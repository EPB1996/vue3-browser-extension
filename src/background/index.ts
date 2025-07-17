import { Message, MessageType } from "@/model/message"
import SidePanelHandler from "./handlers/sidepanel"
import ContentScriptHandler from "./handlers/content"

chrome.runtime.onInstalled.addListener(async (opt) => {
  // Check if reason is install or update. Eg: opt.reason === 'install' // If extension is installed.
  // opt.reason === 'update' // If extension is updated.
  if (opt.reason === "install") {
    chrome.tabs.create({
      active: true,
      // Open the setup page and append `?type=install` to the URL so frontend
      // can know if we need to show the install page or update page.
      url: chrome.runtime.getURL("src/ui/setup/index.html"),
    })

    return
  }

  if (opt.reason === "update") {
    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL("src/ui/setup/index.html?type=update"),
    })

    return
  }
})
// activate side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background")

const sidePanelHandler = new SidePanelHandler()

const contentScriptHandler = new ContentScriptHandler()

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Example: Notify sidepanel when a tab's URL changes

  const message: Message = {
    type: MessageType.TAB_UPDATED,
    timestamp: Date.now(),
    data: {
      tabId,
      url: changeInfo.url || tab.url || "",
    },
  }
  sidePanelHandler.postMessage(message)
})

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  const message: Message = {
    type: MessageType.TAB_ACTIVATED,
    timestamp: Date.now(),
    data: {
      tabId: activeInfo.tabId,
      url: tab.url || "",
    },
  }
  sidePanelHandler.postMessage(message)
})

export {}
