console.info("Test script loaded")

// Example of content script initiating communication
window.addEventListener("load", () => {
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
  console.info("Content script received:", message)

  if (message.type === "GET_PAGE_DATA") {
    // Collect page data
    const pageData = {
      title: document.title,
      url: window.location.href,
      headings: Array.from(document.querySelectorAll("h1, h2, h3")).map(
        (h) => h.textContent,
      ),
      links: Array.from(document.querySelectorAll("a")).length,
      images: Array.from(document.querySelectorAll("img")).length,
      textContent: document.body.textContent!.substring(0, 500) + "...",
    }

    sendResponse(pageData)
  }
  return true
})
