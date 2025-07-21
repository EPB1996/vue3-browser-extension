import { MessageService } from "@/service/messaging/message.service"
import { MESSAGE_TYPES, PORT_NAMES } from "@/service/messaging/message.types"

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

const backgroundMessageService = new MessageService(PORT_NAMES.BACKGROUND)
backgroundMessageService.listenForConnections()
backgroundMessageService.listenForOneTimeMessages()

// INIT_PORT
backgroundMessageService.onMessage(
  MESSAGE_TYPES.INIT_PORT,
  (payload, senderId, port) => {
    if (senderId === PORT_NAMES.SIDEPANEL) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0]
        if (currentTab && currentTab.id) {
          const payload = {
            tabId: currentTab.id,
            url: currentTab.url || "",
          }
          backgroundMessageService.sendMessage(
            PORT_NAMES.SIDEPANEL,
            MESSAGE_TYPES.TAB_ACTIVATED,
            payload,
          )
        }
      })
    }
  },
)

// Listen on one-time PAGE_LOADED message
backgroundMessageService.onOneTimeMessage(
  MESSAGE_TYPES.PAGE_LOADED,
  (payload, sender, sendResponse) => {
    if (sendResponse)
      sendResponse({
        status: "success",
        message: "Page loaded message received in background",
        tabId: sender.tab?.id || null,
      })
  },
)

// Listen for background function calls
backgroundMessageService.onMessage(
  MESSAGE_TYPES.BACKGROUND_FUNCTION,
  (payload, senderId, port) => {
    console.info(
      `Background received BACKGROUND_FUNCTION from ${senderId}. Function: ${payload.functionName}`,
    )
    const { functionName, args } = payload
    let response = {}
    if (functionName === "createContextMenu") {
      // Example function to create context menu items
      args.forEach((item: any) => {
        chrome.contextMenus.create({
          id: item.id,
          title: item.title,
          contexts: item.contexts || ["all"],
          visible: true,
          // Add more properties as needed
        })
      })
      response = {
        status: "success",
        message: "Context menu items created successfully",
      }
    } else {
      response = {
        status: "error", // Handle unknown function calls
        message: `Unknown function: ${functionName}`,
      }
    }
    if (port) {
      backgroundMessageService.sendMessage(
        port.name,
        MESSAGE_TYPES.BACKGROUND_FUNCTION_RESPONSE,
        response,
      )
    }
  },
)

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const payload = {
    tabId,
    url: changeInfo.url || tab.url || "",
  }
  backgroundMessageService.sendMessage(
    PORT_NAMES.SIDEPANEL,
    MESSAGE_TYPES.TAB_UPDATED,
    payload,
  )
})

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId)
  const payload = {
    tabId: activeInfo.tabId,
    url: tab.url || "",
  }

  backgroundMessageService.sendMessage(
    PORT_NAMES.SIDEPANEL,
    MESSAGE_TYPES.TAB_ACTIVATED,
    payload,
  )
})

chrome.contextMenus.create({
  id: "notifyButton",
  title: "Show Notification",
  contexts: ["all"],
})
// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "notifyButton") {
    console.info("Context menu item clicked:", info)
  }
})

export {}
