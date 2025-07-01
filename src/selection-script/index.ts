// This import css file is used to style the iframe that is injected into the page
import "./index.css"
import { name } from "~/package.json"

const src = chrome.runtime.getURL("src/ui/selection-script-iframe/index.html")

const selectionIframe = new DOMParser().parseFromString(
  `<iframe class="selx-iframe ${name}" src="${src}" title="${name}"></iframe>`,
  "text/html",
).body.firstElementChild as HTMLIFrameElement
selectionIframe.style.display = "none"
document.body.appendChild(selectionIframe)

let selectionTimeout: ReturnType<typeof setTimeout> | null = null

document.addEventListener("selectionchange", () => {
  if (selectionTimeout) {
    clearTimeout(selectionTimeout)
  }

  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection()
    const selectedText = selection?.toString()

    if (selectedText) {
      console.info("Selected text:", selectedText)
      const range = selection?.getRangeAt(0)
      if (range) {
        const rect = range.getBoundingClientRect()
        console.info("Selection rectangle:", rect)
        selectionIframe.style.display = "block"
        selectionIframe.style.top = `${rect.top + window.scrollY}px`
        selectionIframe.style.left = `${rect.left + window.scrollX}px`
      }
    }
  }, 1000)
})

document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement
  if (!selectionIframe.contains(target)) {
    selectionIframe.style.display = "none"
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.info(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension",
  )
  if (request.message === "closeIframe") {
    const iframes = document.querySelectorAll(`selx-iframe`)
    console.info("Closing iframes:", iframes)
    iframes.forEach((iframe) => {
      iframe.remove()
    })
  }
  return true
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from selection-script")
