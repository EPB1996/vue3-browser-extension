import { appRouter } from "src/utils/router"
import { SidepanelCommunicationService } from "../sidepanel.communication.service"
import {
  ErrorMessage,
  Message,
  MessageType,
  TabActivatedMessage,
  TabUpdatedMessage,
} from "@/model/message"
import ContentScriptCommunicationService from "../content-script.communication.service"

export class MessageHandlers {
  private sidePanelCommunicationService: SidepanelCommunicationService
  private contentScriptService: ContentScriptCommunicationService
  private sidePanelStore: any // Replace with actual type

  constructor(sidePanelStore: any) {
    this.sidePanelCommunicationService =
      SidepanelCommunicationService.getInstance()
    this.contentScriptService = ContentScriptCommunicationService.getInstance()
    this.sidePanelStore = sidePanelStore
  }

  public registerAllHandlers(): void {
    this.sidePanelCommunicationService.registerMessageHandler(
      MessageType.TAB_UPDATED,
      this.handleTabUpdated.bind(this),
    )
    this.sidePanelCommunicationService.registerMessageHandler(
      MessageType.TAB_ACTIVATED,
      this.handleTabActivated.bind(this),
    )
    this.sidePanelCommunicationService.registerMessageHandler(
      MessageType.ERROR,
      this.handleError.bind(this),
    )
  }

  private async handleTabUpdated(message: Message): Promise<void> {
    const updateMessage = message as TabUpdatedMessage
    console.info(
      "Tab updated:",
      updateMessage.data.tabId,
      updateMessage.data.url,
    )

    if (updateMessage.data.url.includes("#inbox")) {
      // Ask content script to get threadID via background
      const contentScriptMessage: Message = {
        type: MessageType.CONTENT_SCRIPT_FUNCTION,
        timestamp: Date.now(),
        data: {
          tabId: updateMessage.data.tabId,
          functionName: "getThreadId",
          args: [],
        },
      }

      const response = await this.contentScriptService.sendToContentScript(
        updateMessage.data.tabId,
        contentScriptMessage,
      )

      this.sidePanelStore.setThreadId(response.threadId || null)
    }
  }

  private async handleTabActivated(message: Message): Promise<void> {
    const activatedMessage = message as TabActivatedMessage
    console.info(
      "Tab activated:",
      activatedMessage.data.tabId,
      activatedMessage.data.url,
    )

    // If mail app route to gmail page
    if (activatedMessage.data.url.startsWith("https://mail.google.com")) {
      appRouter.push({
        path: "/side-panel/gmail",
      })
    }
    // If docs app route to docs page
    else if (activatedMessage.data.url.startsWith("https://docs.google.com")) {
      appRouter.push({
        path: "/side-panel/docs",
      })
    }
    // Default to index
    else {
      appRouter.push({
        path: "/side-panel",
      })
    }
  }

  private async handleError(message: Message): Promise<void> {
    const errorMessage = message as ErrorMessage
    console.error("Error from background:", errorMessage.data)
  }
}
