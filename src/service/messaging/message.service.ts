/* eslint-disable @typescript-eslint/no-explicit-any */
import { MESSAGE_TYPES, PORT_NAMES } from "./message.types"

interface Message {
  type: string
  payload: any
  senderId: string
  recipientId?: string | null
  oneTime?: boolean
}

type MessageHandler = (
  payload: any,
  senderId: string,
  port: chrome.runtime.Port,
) => void

type OneTimeMessageHandler = (
  payload: any,
  sender: chrome.runtime.MessageSender,
  sendResponse?: (response: any) => void,
) => void

class MessageService {
  private sourceId: string
  private ports: Map<string, chrome.runtime.Port>
  private messageHandlers: Map<string, MessageHandler>
  private oneTimeMessageHandler: Map<string, OneTimeMessageHandler>

  constructor(sourceId: string) {
    this.sourceId = sourceId
    this.ports = new Map() // Stores active ports
    this.messageHandlers = new Map() // Stores message type handlers
    this.oneTimeMessageHandler = new Map() // Stores one-time message handlers
  }

  // --- Public Methods for Sending Messages ---

  sendMessage(
    portName: string,
    type: string,
    payload: any,
    recipientId: string | null = null,
  ): void {
    const port = this.ports.get(portName)
    if (port) {
      const message: Message = {
        type,
        payload,
        senderId: this.sourceId,
        recipientId,
      }
      port.postMessage(message)
    }
  }

  sendOneTimeMessage(
    type: string,
    payload: any,
    recipientId: string | null = null,
    options: any = {},
    sendResponse?: (response: any) => void,
  ): void {
    const message: Message = {
      type,
      payload,
      senderId: this.sourceId,
      recipientId,
      oneTime: true,
    }
    try {
      chrome.runtime.sendMessage(message, options, (response) => {
        if (sendResponse) {
          sendResponse(response)
        }
      })
    } catch (error) {
      console.error("Error sending one-time message:", error)
    }
  }

  sendMessageToTab(
    tabId: number,
    type: string,
    payload: any,
    options: any = {},
    sendResponse?: (response: any) => void,
  ): void {
    const message: Message = {
      type,
      payload,
      senderId: this.sourceId,
    }
    try {
      chrome.tabs.sendMessage(tabId, message, options, (response) => {
        if (sendResponse) {
          sendResponse(response)
        }
        return true
      })
    } catch (error) {
      console.error("Error sending message to tab:", error)
    }
  }

  // --- Internal Methods for Handling Connections and Messages ---

  private _setupPort(port: chrome.runtime.Port): void {
    this.ports.set(port.name, port)
    console.info(`${this.sourceId} connected to port:`, port.name)

    port.onMessage.addListener((msg) => this._handleMessage(port, msg))
    port.onDisconnect.addListener(() => this._handleDisconnect(port))
  }

  private _handleMessage(port: chrome.runtime.Port, message: Message): void {
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      if (!message.recipientId || message.recipientId === this.sourceId) {
        const response = handler(message.payload, message.senderId, port)
      }
    } else {
      console.warn(
        `${this.sourceId} no handler for message type:`,
        message.type,
        message,
      )
    }
  }

  private _handleOneTimeMessage(
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse?: (response: any) => void,
  ): void {
    const handler = this.oneTimeMessageHandler.get(message.type)
    if (handler) {
      if (!message.recipientId || message.recipientId === this.sourceId) {
        const response = handler(message.payload, sender, sendResponse)
      }
    } else {
      console.warn(
        `${this.sourceId} no handler for message type:`,
        message.type,
        message,
      )
    }
  }

  private _handleDisconnect(port: chrome.runtime.Port): void {
    console.info(`${this.sourceId} disconnected from port:`, port.name)
    this.ports.delete(port.name)
  }

  // --- Public Methods for Registering Handlers ---

  onMessage(type: string, handler: MessageHandler): void {
    if (this.messageHandlers.has(type)) {
      console.warn(
        `Handler for message type "${type}" already registered. Overwriting.`,
      )
    }
    this.messageHandlers.set(type, handler)
  }

  onOneTimeMessage(type: string, handler: OneTimeMessageHandler): void {
    if (this.oneTimeMessageHandler.has(type)) {
      console.warn(
        `One-time handler for message type "${type}" already registered. Overwriting.`,
      )
    }
    this.oneTimeMessageHandler.set(type, handler)
  }

  listenForConnections(): void {
    if (this.sourceId !== PORT_NAMES.BACKGROUND) {
      console.warn(
        "listenForConnections should only be called by the background script.",
      )
      return
    }
    chrome.runtime.onConnect.addListener((port) => {
      console.info("Incoming connection:", port.name)
      if (port.name === "@crx/client") {
        console.info("Ignoring connection from @crx/client")
        return
      }
      this._setupPort(port)
      port.postMessage({
        type: MESSAGE_TYPES.INIT_PORT,
        senderId: this.sourceId,
        payload: { sourceId: PORT_NAMES.BACKGROUND },
      })
    })
  }

  listenForOneTimeMessages(): void {
    chrome.runtime.onMessage.addListener(
      (message: Message, sender, sendResponse) => {
        this._handleOneTimeMessage(message, sender, sendResponse)
      },
    )
  }

  connectToBackground(portName: string): void {
    if (this.sourceId === PORT_NAMES.BACKGROUND) {
      console.warn(
        "connectToBackground should not be called by the background script.",
      )
      return
    }
    const port = chrome.runtime.connect({ name: portName })
    this._setupPort(port)
    this.sendMessage(port.name, MESSAGE_TYPES.INIT_PORT, {
      sourceId: this.sourceId,
    })
  }
}

export { MessageService }
