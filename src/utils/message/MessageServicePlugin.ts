import { MessageService } from "@/service/messaging/message.service"
import { PORT_NAMES } from "@/service/messaging/message.types"
import { App } from "vue"

// Create the instances outside the plugin
export const sidepanelMessageService = new MessageService(PORT_NAMES.SIDEPANEL)
// Add other services as needed
// export const contentMessageService = new MessageService(PORT_NAMES.CONTENT)

export interface MessageServicePlugin {
  sidepanel: MessageService
}

export const messageServicePlugin = {
  install(app: App) {
    const messageServices: MessageServicePlugin = {
      sidepanel: sidepanelMessageService,
    }

    app.provide("messageServices", messageServices)
    app.config.globalProperties.$messageServices = messageServices
  },
}
