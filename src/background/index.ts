import {
  Message,
  TabActivateddMessage,
  TabUpdatedMessage,
} from "src/message/message"

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

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background")

let sidePanelPort: chrome.runtime.Port | null = null

// Handle extension icon click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id })
})

// Handle connections from sidepanel
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidepanel") {
    sidePanelPort = port
    console.info("Sidepanel connected")

    // Listen for messages from sidepanel
    port.onMessage.addListener((message) => {
      console.info("Background received from sidepanel:", message)
      handleSidepanelMessage(message)
    })

    // Handle sidepanel disconnect
    port.onDisconnect.addListener(() => {
      console.info("Sidepanel disconnected")
      sidePanelPort = null
    })
  }
})

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Example: Notify sidepanel when a tab's URL changes

  const message: TabUpdatedMessage = {
    type: "TAB_UPDATED",
    timestamp: Date.now(),
    data: {
      tabId,
      url: changeInfo.url || tab.url || "",
    },
  }

  if (sidePanelPort) {
    sidePanelPort.postMessage(message)
  }
})

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  const message: TabActivateddMessage = {
    type: "TAB_ACTIVATED",
    timestamp: Date.now(),
    data: {
      tabId: activeInfo.tabId,
      url: tab.url || "",
    },
  }
  if (sidePanelPort) {
    sidePanelPort.postMessage(message)
  }
})

// Handle messages from sidepanel
async function handleSidepanelMessage(message: Message) {
  // Handle other message types as needed
  switch (message.type) {
    case "SIDEPANEL_READY": {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tabs.length > 0) {
        const activeTab = tabs[0]
        const message: Message = {
          type: "TAB_ACTIVATED",
          timestamp: Date.now(),
          data: {
            tabId: activeTab.id!,
            url: activeTab.url || "",
          },
        }
        if (sidePanelPort) {
          sidePanelPort.postMessage(message)
        }
      }
      break
    }
    case "RESPONSE": {
      // Handle response messages from sidepanel
      console.info("Response from sidepanel:", message.data)
      break
    }

    case "CONTENT_SCRIPT_FUNCTION": {
      // Handle request for Gmail thread ID
      console.info("Requesting Gmail thread ID for tab:", message.data.tabId)
      chrome.tabs.sendMessage(message.data.tabId, {
        type: "CONTENT_SCRIPT_FUNCTION",
        functionName: message.data.functionName,
        args: message.data.args,
      })

      break
    }

    default:
      console.warn("Unknown message type from sidepanel:", message.type)
      break
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.info("Background received from content script:", message)

  if (message.type === "OPEN_SIDE_PANEL") {
    // Open the side panel in the current tab
    chrome.sidePanel
      .open({ tabId: sender.tab?.id })
      .then(() => {
        console.info("Side panel opened for tab:", sender.tab?.id)
      })
      .catch((error) => {
        console.error("Error opening side panel:", error)
      })
  }

  if (message.type === "PAGE_LOADED") {
    console.info("Page load received:", message.data)
  }

  // Return true to indicate we'll send a response asynchronously
  return true
})

export {}
