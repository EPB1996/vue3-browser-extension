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

// Handle messages from sidepanel
async function handleSidepanelMessage(message: { type: string; action: any }) {
  if (message.type === "REQUEST_PAGE_DATA") {
    // Get active tab and request data from content script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]) {
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id!, {
          type: "GET_PAGE_DATA",
        })

        // Send response back to sidepanel
        if (sidePanelPort) {
          sidePanelPort.postMessage({
            type: "PAGE_DATA_RESPONSE",
            data: response,
          })
        }
      } catch (error) {
        console.error("Error communicating with content script:", error)
        if (sidePanelPort) {
          sidePanelPort.postMessage({
            type: "ERROR",
            message: "Could not communicate with page",
          })
        }
      }
    }
  }

  if (message.type === "INJECT_SCRIPT") {
    // Example of sidepanel requesting background to inject script
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs[0]) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id!, {
          type: "EXECUTE_ACTION",
          action: message.action,
        })
      } catch (error) {
        console.error("Error injecting script:", error)
      }
    }
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.info("Background received from content script:", message)

  if (message.type === "PAGE_DATA") {
    console.info("Forwarding PAGE_DATA to sidepanel:", message.data)
    // Forward page data to sidepanel
    if (sidePanelPort) {
      sidePanelPort.postMessage({
        type: "PAGE_DATA",
        data: message.data,
        tabId: sender.tab!.id,
      })
    }

    // Send response back to content script
    sendResponse({ success: true, message: "Data received" })
  }

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
    sendResponse({
      success: true,
      data: {
        "Page load received successfully": message.data,
      },
    })
  }

  // Return true to indicate we'll send a response asynchronously
  return true
})

export {}
