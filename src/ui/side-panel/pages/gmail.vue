<template>
  <div>
    <h1>Gmail Page</h1>

    <UButton
      v-if="!userEmail"
      variant="solid"
      @click="() => userStore.login()"
    >
      Login
    </UButton>
    <UButton
      v-if="userEmail"
      variant="solid"
      @click="() => userStore.logout()"
    >
      Logout
    </UButton>
    <div>
      <h2>Welcome, {{ userEmail }}</h2>
    </div>
  </div>

  <div>
    <div class="flex flex-col gap-2">
      <UButton
        icon="ph:envelope-simple"
        variant="solid"
        @click="fetchEmails"
      >
        Fetch Emails
      </UButton>

      <UButton
        icon="ph:envelope-simple"
        variant="solid"
        @click="fetchThread()"
      >
        Fetch Thread
      </UButton>
    </div>
    <div v-if="thread">
      <div class="flex flex-row justify-between items-center">
        <h2 class="text-lg font-semibold mb-2">Thread</h2>
        <div>{{ Array.from(thread.messages).length }}</div>
      </div>
      <pre>{{ thread.messages }}</pre>
    </div>
    <div v-if="emails">
      <h2 class="text-lg font-semibold mb-2">Emails</h2>
      <pre>{{ emails }}</pre>
    </div>

    <div v-if="apiError">
      <h2 class="text-lg font-semibold mb-2">Error</h2>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { ContentScriptFunctionMessage, Message } from "@/model/message"
import IdentityService from "@/service/identity.service"
import MessageService from "@/service/message.service"

const userStore = useUserStore()

const { userEmail } = storeToRefs(userStore)

const identityService = new IdentityService()
const messageService = new MessageService()

const apiError = ref<any>(null)
const emails = ref<any>(null)
const thread = ref<any>(null)

const fetchEmails = async () => {
  try {
    const accessToken = await identityService.getAccessToken()

    const response = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )
    console.info("Response:", response)
    emails.value = await response.json()
  } catch (error) {
    console.error("Error fetching Gmail messages:", error)
  }
}

const fetchThread = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tab.id

  const response = await messageService.sendMessageToContentScript(
    tabId as number,
    {
      type: "CONTENT_SCRIPT_FUNCTION",
      timestamp: Date.now(),
      data: {
        tabId: tabId,
        functionName: "getThreadId",
        args: [],
      },
    } as Message,
  )

  const threadId = response.threadId

  apiError.value = `threadID: ${threadId}`

  try {
    const accessToken = await identityService.getAccessToken()

    const response = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      apiError.value = response.statusText
    }
    console.info("Response:", response)
    thread.value = await response.json()
  } catch (error) {
    console.error("Error fetching Gmail thread:", error)
    apiError.value = error
  }
}
</script>

<style scoped></style>
