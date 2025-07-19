import { MessageType } from "@/model/message"
import { MessageService } from "@/service/messaging/message.service"
import { MESSAGE_TYPES, PORT_NAMES } from "@/service/messaging/message.types"
import { send } from "vite"
import { threadId } from "worker_threads"

console.info("Gmail script loaded")

const gmailScriptMessageService = new MessageService(PORT_NAMES.GMAIL_SCRIPT)
gmailScriptMessageService.listenForOneTimeMessages()

let portName: string = PORT_NAMES.GMAIL_SCRIPT

// GMAIL content script get tab id and create connection to background script
window.addEventListener("load", async () => {
  console.info("Gmail content script loaded")
  gmailScriptMessageService.sendOneTimeMessage(
    MESSAGE_TYPES.PAGE_LOADED,
    {},
    PORT_NAMES.BACKGROUND,
    {},
    (response) => {
      portName = `${PORT_NAMES.GMAIL_SCRIPT}-${response.tabId}`
      gmailScriptMessageService.connectToBackground(portName)
    },
  )
})

// INIT_PORT from background script
gmailScriptMessageService.onMessage(
  MESSAGE_TYPES.INIT_PORT,
  (payload, senderId, port) => {
    console.info(`Gmail Script received INIT_PORT from ${senderId}.`)
  },
)

// CONTENT_SCRIPT_FUNCTION Handler
gmailScriptMessageService.onMessage(
  MESSAGE_TYPES.CONTENT_SCRIPT_FUNCTION,
  (payload: {
    origin: string
    targetTabId: string
    functionName: string
    args: []
  }) => {
    console.info(
      `Gmail Script received CONTENT_SCRIPT_FUNCTION. Function: ${payload.functionName}`,
    )
    const { functionName, args } = payload
    let response = {}

    if (functionName === "getThreadId") {
      // Example function to get Gmail thread ID
      response = {
        threadId:
          document
            .querySelector('[role="main"] [data-legacy-thread-id]')
            ?.getAttribute("data-legacy-thread-id") || null,
      }
    }

    gmailScriptMessageService.sendMessage(
      portName,
      MESSAGE_TYPES.CONTENT_SCRIPT_FUNCTION_RESPONSE,
      {
        origin: payload.origin,
        targetTabId: payload.targetTabId,
        functionName: functionName,
        args: args,
        response: response,
      },
    )
  },
)

// Listen on one-time messages
gmailScriptMessageService.onOneTimeMessage(
  MessageType.CONTENT_SCRIPT_FUNCTION,
  (payload, sender, sendResponse) => {
    console.info(
      `Gmail Script received one-time CONTENT_SCRIPT_FUNCTION. Function: ${payload.functionName}`,
    )
    const { functionName, args } = payload
    let response = {}
    if (functionName === "getThreadId") {
      // Example function to get Gmail thread ID
      response = {
        threadId:
          document
            .querySelector('[role="main"] [data-legacy-thread-id]')
            ?.getAttribute("data-legacy-thread-id") || null,
      }
    }
    if (sendResponse) sendResponse(response)
  },
)
