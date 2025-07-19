import { inject } from "vue"
import {
  MessageServicePlugin,
  sidepanelMessageService,
} from "@/utils/message/MessageServicePlugin"

export function useMessageService() {
  // Try to get from Vue context first (for components)
  const messageServices = inject<MessageServicePlugin>("messageServices")

  if (messageServices) {
    return messageServices
  }

  // Fallback to direct instances (for use outside Vue components)
  return {
    sidepanel: sidepanelMessageService,
  }
}
