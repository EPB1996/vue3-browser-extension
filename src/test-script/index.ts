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

// Add a button to the page for user interaction
const button = document.createElement("button")
button.textContent = "Open Side Panel"
button.style.position = "fixed"
button.style.bottom = "10px"
button.style.right = "10px"
button.style.zIndex = "1000"
document.body.appendChild(button)

// Send a message to the background script when the button is clicked
button.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" }, (response: any) => {
    console.info("Response from background:", response)
  })
})

// Add another button to send PAGE_DATA event
const pageDataButton = document.createElement("button")
pageDataButton.textContent = "Send Page Data"
pageDataButton.style.position = "fixed"
pageDataButton.style.bottom = "50px"
pageDataButton.style.right = "10px"
pageDataButton.style.zIndex = "1000"
document.body.appendChild(pageDataButton)

// Send a PAGE_DATA message when the button is clicked
pageDataButton.addEventListener("click", () => {
  const pageData = {
    message: "content data sent!",
  }

  chrome.runtime.sendMessage(
    { type: "PAGE_DATA", data: pageData },
    (response: any) => {
      console.info("Response from background:", response)
    },
  )
})
