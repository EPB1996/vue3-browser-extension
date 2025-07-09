class ContentScriptHandler {
  constructor() {
    this.init()
  }

  private init() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.info("Background received from content script:", message)

      if (message.type === "OPEN_SIDE_PANEL") {
        this.openSidePanel(sender.tab?.id)
      }

      if (message.type === "PAGE_LOADED") {
        this.handlePageLoaded(message.data)
      }

      // Return true to indicate we'll send a response asynchronously
      return true
    })
  }

  private openSidePanel(tabId?: number) {
    chrome.sidePanel
      .open({ tabId })
      .then(() => {
        console.info("Side panel opened for tab:", tabId)
      })
      .catch((error) => {
        console.error("Error opening side panel:", error)
      })
  }

  private handlePageLoaded(data: any) {
    console.info("Page load received:", data)
  }
}

export default ContentScriptHandler
