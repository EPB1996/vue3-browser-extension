// Import necessary modules and styles
import app from "@/ui/selection-script-iframe"
import "./index.css"
import { name } from "~/package.json"

// Create and configure the selection iframe element
function createSelectionElement(): HTMLDivElement {
  const element = new DOMParser().parseFromString(
    `<div class="selx-iframe">
      <div id="app"></div>
      <span class="selx-close-btn">&times;</span>
    </div>`,
    "text/html",
  ).body.firstElementChild as HTMLDivElement

  element.style.display = "none" // Hide the iframe initially

  const closeButton = element.querySelector(
    ".selx-close-btn",
  ) as HTMLButtonElement
  closeButton.addEventListener("click", () => {
    element.style.display = "none"
  })

  return element
}

// Mount the Vue app into the iframe
function mountApp(element: HTMLDivElement) {
  const appContainer = element.querySelector("#app") as HTMLElement
  app.mount(appContainer)
}

// Handle selection changes and position the iframe
function handleSelectionChange(selectionElement: HTMLDivElement) {
  // Initialize the selection store
  const selectionStore = useSelectionStore()
  let selectionTimeout: ReturnType<typeof setTimeout> | null = null

  document.addEventListener("selectionchange", () => {
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }

    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection()
      const selectedText = selection?.toString()

      if (selectedText) {
        selectionStore.setSelection(selectedText)
        const range = selection?.getRangeAt(0)
        if (range) {
          const rect = range.getBoundingClientRect()
          selectionElement.style.display = "block"
          selectionElement.style.top = `${rect.bottom}px`
          selectionElement.style.left = `${rect.left}px`
        }
      }
    }, 500)
  })
}

// Add an "Insert" button to the document
function addInsertButton() {
  const insertButton = document.createElement("button")
  insertButton.textContent = "Insert 'hello there'"
  insertButton.classList.add("insert-button")

  insertButton.addEventListener("click", () => {
    const targetElement = document.querySelector(
      'div[aria-label="Message Body"]',
    )
    if (targetElement) {
      targetElement.innerHTML += "<div>hello there</div>"
    } else {
      console.warn("Element not found")
    }
  })

  document.body.appendChild(insertButton)
}

// Global error handler
function setupErrorHandler() {
  self.onerror = function (message, source, lineno, colno, error) {
    console.info("Error: " + message)
    console.info("Source: " + source)
    console.info("Line: " + lineno)
    console.info("Column: " + colno)
    console.info("Error object: " + error)
  }
}

// Main initialization function
function initialize() {
  console.info("hello world from selection-script")

  const selectionElement = createSelectionElement()
  mountApp(selectionElement)
  document.body.appendChild(selectionElement)

  handleSelectionChange(selectionElement)

  //addInsertButton();
  setupErrorHandler()
}

// Initialize the script
initialize()
