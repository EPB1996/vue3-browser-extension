import { Message, MessageType } from "@/model/message"

export class SidepanelCommunicationService {
  private static instance: SidepanelCommunicationService
  private backgroundPort: chrome.runtime.Port | null = null
  private messageHandlers: Map<
    MessageType,
    (message: Message) => Promise<void>
  > = new Map()

  private constructor() {}

  public static getInstance(): SidepanelCommunicationService {
    if (!SidepanelCommunicationService.instance) {
      SidepanelCommunicationService.instance =
        new SidepanelCommunicationService()
    }
    return SidepanelCommunicationService.instance
  }

  public initialize(portName: string): void {
    this.initializeConnection(portName)
  }

  // Initialize background connections and create named port
  private initializeConnection(portName: string): void {
    this.backgroundPort = chrome.runtime.connect({ name: portName })

    // Listen for messages from background script
    this.backgroundPort.onMessage.addListener((message) => {
      this.handleBackgroundMessage(message)
    })

    // Handle disconnection
    this.backgroundPort.onDisconnect.addListener(() => {
      console.info(portName, " disconnected")
      this.backgroundPort = null

      // Try to reconnect after a delay
      setTimeout(() => this.initializeConnection(portName), 2000)
    })

    console.info(
      "Connection established with background script on port:",
      portName,
    )
  }

  private async handleBackgroundMessage(message: Message): Promise<void> {
    const response: Message = {
      type: MessageType.RESPONSE,
      timestamp: Date.now(),
      data: {
        message: "Message received by side panel",
        originalType: message.type,
        originalData: message.data ?? {},
      },
    }

    // Check if there's a registered handler for this message type
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      try {
        await handler(message)
      } catch (error) {
        console.error(`Error handling message type ${message.type}:`, error)
      }
    } else {
      console.warn(`No handler registered for message type: ${message.type}`)
    }

    // Send a response back to the background script
    this.sendToBackground(response)
  }

  public sendToBackground(message: Message): void {
    if (this.backgroundPort) {
      this.backgroundPort.postMessage(message)
    } else {
      console.error("No connection to background script")
    }
  }

  public sendInitialMessage(): void {
    setTimeout(() => {
      this.sendToBackground({
        type: MessageType.SIDEPANEL_READY,
        timestamp: Date.now(),
      })
    }, 500)
  }

  public registerMessageHandler(
    messageType: MessageType,
    handler: (message: Message) => Promise<void>,
  ): void {
    this.messageHandlers.set(messageType, handler)
  }

  public unregisterMessageHandler(messageType: MessageType): void {
    this.messageHandlers.delete(messageType)
  }

  public reconnectIfNeeded(portName: string): void {
    if (document.visibilityState === "visible" && !this.backgroundPort) {
      this.initializeConnection(portName)
    }
  }

  public isConnected(portName: string): boolean {
    return this.backgroundPort !== null
  }
}
