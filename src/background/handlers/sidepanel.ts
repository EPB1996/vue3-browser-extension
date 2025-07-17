import { Message, MessageType } from "@/model/message"

class SidePanelHandler {
  private sidePanelPort: chrome.runtime.Port | null = null

  constructor() {
    this.init()
  }

  private init() {
    // Handle connections from sidepanel
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === "sidepanel") {
        this.sidePanelPort = port
        console.info("Sidepanel connected")

        // Listen for messages from sidepanel
        port.onMessage.addListener((message) => {
          this.handleMessage(message)
        })

        // Handle sidepanel disconnect
        port.onDisconnect.addListener(() => {
          console.info("Sidepanel disconnected")
          this.sidePanelPort = null
        })
      }
    })
  }

  private async handleMessage(message: Message) {
    // Handle other message types as needed
    switch (message.type) {
      case MessageType.SIDEPANEL_READY: {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        })
        if (tabs.length > 0) {
          const activeTab = tabs[0]
          const responseMessage: Message = {
            type: MessageType.TAB_ACTIVATED,
            timestamp: Date.now(),
            data: {
              tabId: activeTab.id!,
              url: activeTab.url || "",
            },
          }
          this.postMessage(responseMessage)
        }
        break
      }
      case MessageType.RESPONSE: {
        // Handle response messages from sidepanel
        /* console.info("Response from sidepanel:", message.data) */
        break
      }

      case MessageType.CONTENT_SCRIPT_FUNCTION: {
        // Handle request for Gmail thread ID
        console.info("Requesting Gmail thread ID for tab:", message.data.tabId)
        chrome.tabs.sendMessage(message.data.tabId, {
          type: MessageType.CONTENT_SCRIPT_FUNCTION,
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

  public postMessage(message: Message) {
    if (this.sidePanelPort) {
      this.sidePanelPort.postMessage(message)
    } else {
      console.warn("No sidepanel port connected. Unable to send message.")
    }
  }
}

export default SidePanelHandler
