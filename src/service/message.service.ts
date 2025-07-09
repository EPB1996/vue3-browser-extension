import { Message } from "@/model/message"

class MessageService {
  sendMessageToContentScript(tabId: number, message: Message): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, {}, (response) => {
        if (response) resolve(response)
      })
    })
  }
}

export default MessageService
