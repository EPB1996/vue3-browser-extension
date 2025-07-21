import { MessageService } from "@/service/messaging/message.service"
import { MESSAGE_TYPES, PORT_NAMES } from "@/service/messaging/message.types"
import { createDriveApp } from "@/ui/drive-script"

console.info("Drive script loaded")

const driveMessageService = new MessageService(PORT_NAMES.DRIVE_SCRIPT)

let portName: string = PORT_NAMES.DRIVE_SCRIPT

// GMAIL content script get tab id and create connection to background script
window.addEventListener("load", async () => {
  console.info("Gmail content script loaded")
  driveMessageService.sendOneTimeMessage(
    MESSAGE_TYPES.PAGE_LOADED,
    {},
    PORT_NAMES.BACKGROUND,
    {},
    (response) => {
      portName = `${PORT_NAMES.DRIVE_SCRIPT}-${response.tabId}`
      driveMessageService.connectToBackground(portName)
    },
  )
})

// INIT_PORT from background script
driveMessageService.onMessage(
  MESSAGE_TYPES.INIT_PORT,
  (payload, senderId, port) => {
    console.info(`Drive Script received INIT_PORT from ${senderId}.`)

    // Add context menu items:
    /*   driveMessageService.sendMessage(
      portName,
      MESSAGE_TYPES.BACKGROUND_FUNCTION,
      {
        functionName: "createContextMenu",
        args: [
          {
            id: "translatePdf",
            title: "Translate PDF",
            contexts: ["all"],
          },
        ],
      },
    ) */
  },
)

driveMessageService.onMessage(
  MESSAGE_TYPES.BACKGROUND_FUNCTION_RESPONSE,
  (payload, senderId, port) => {
    console.info(
      `Drive Script received BACKGROUND_FUNCTION_RESPONSE from ${senderId}. Payload: ${JSON.stringify(payload)}`,
    )
  },
)

// listen on item clicked in drive
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement

  // add to target itself
  if (target.children) {
    Array.from(target.children).forEach((child) => {
      const dataId = (child as HTMLElement).getAttribute("data-id")
      if (dataId) {
        const svgTitle = child.querySelector("svg title")?.textContent
        if (svgTitle === "Google Docs") {
          console.info("Google Docs item clicked with data-id:", dataId)
          addButtonToDriveSelectionBar(dataId)
        } else removeAndUnmount()
      }
    })
  }

  // add to selected item bar on top
})

function removeAndUnmount() {
  const existingDiv = document.querySelector("#drive-script-app")
  if (existingDiv) {
    existingDiv.remove()
  }
}

const addButtonToDriveSelectionBar = (dataId: string) => {
  // Find the element with aria-label "More actions"
  const moreActionsButton = document.querySelector(
    'div[aria-label="More actions"]',
  ) as HTMLElement

  if (moreActionsButton) {
    const thirdParent =
      moreActionsButton?.parentElement?.parentElement?.parentElement
    // Check if a div with id "drive-script-app" already exists
    const existingDiv = thirdParent?.querySelector("#drive-script-app")
    if (!existingDiv) {
      // Create 1a div element
      const div = document.createElement("div")
      div.id = "drive-script-app"
      div.style.margin = "4px 6px"

      const app = createDriveApp()
      // Mount the Vue app to the div
      app.mount(div)

      // Append the div to the parent of the "More actions" button
      thirdParent?.appendChild(div)
    }
  }
}
