import { MessageType } from "@/model/message"

console.info("Test script loaded")

// Example of content script initiating communication
window.addEventListener("load", async () => {
  chrome.runtime.sendMessage({
    type: "PAGE_LOADED",
    data: {
      url: window.location.href,
      title: document.title,
      loadTime: Date.now(),
    },
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MessageType.CONTENT_SCRIPT_FUNCTION) {
    // Handle function calls from the background script
    const { functionName, args } = message.data

    if (functionName === "getThreadId") {
      // Example function to get Gmail thread ID
      const threadId = document
        .querySelector('[role="main"] [data-legacy-thread-id]')
        ?.getAttribute("data-legacy-thread-id")

      sendResponse({ threadId: threadId || null })
    }
  }
  return true
})
