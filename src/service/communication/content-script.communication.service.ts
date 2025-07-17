import { Message } from "@/model/message"

class ContentScriptCommunicationService {
  private static instance: ContentScriptCommunicationService

  private constructor() {}
  public static getInstance(): ContentScriptCommunicationService {
    if (!ContentScriptCommunicationService.instance) {
      ContentScriptCommunicationService.instance =
        new ContentScriptCommunicationService()
    }
    return ContentScriptCommunicationService.instance
  }

  // Send message to content script and return a promise that resolves with the response
  sendToContentScript(tabId: number, message: Message): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, {}, (response) => {
        if (response) resolve(response)
      })
    })
  }
}

export default ContentScriptCommunicationService
