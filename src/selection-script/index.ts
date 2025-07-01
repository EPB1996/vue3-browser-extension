// This import css file is used to style the iframe that is injected into the page
import app from "@/ui/selection-script-iframe"
import "./index.css"
import { name } from "~/package.json"

const src = chrome.runtime.getURL("src/ui/selection-script-iframe/index.html")

/* const selectionIframe = new DOMParser().parseFromString(
  `<iframe class="selx-iframe ${name}" src="${src}" title="${name}"></iframe>`,
  "text/html",
).body.firstElementChild as HTMLIFrameElement */

const selectionIframe = new DOMParser().parseFromString(
  `<div class="selx-iframe ${name}" title="${name}">
    <div id="app"></div>
    <span class="selx-close-btn">&times;</span>
  
  </div>`,
  "text/html",
).body.firstElementChild as HTMLDivElement

// Add event listener to the close button
const closeButton = selectionIframe.querySelector(
  ".selx-close-btn",
) as HTMLButtonElement
closeButton.addEventListener("click", () => {
  selectionIframe.style.display = "none"
})

app.mount(selectionIframe.querySelector("#app") as HTMLElement)

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
        selectionIframe.style.top = `${rect.bottom}px`
        selectionIframe.style.left = `${rect.left}px`
      }
    }
  }, 500)
})

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from selection-script")
