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
        @click="getThreadIdFromContentScript()"
      >
        Fetch Thread Manually
      </UButton>
      <UButton
        icon="ph:envelope-simple"
        variant="solid"
        @click="fetchUnreadMessages(10)"
      >
        Fetch Unread Messages
      </UButton>
      <UButton
        icon="ph:envelope-simple"
        variant="solid"
        @click="createDraft()"
      >
        Create Draft
      </UButton>
    </div>

    <div v-if="gmailServiceResponse">
      <h2 class="text-lg font-semibold mb-2">Gmail Service Response</h2>
      <pre>{{ gmailServiceResponse }}</pre>
    </div>

    <div v-if="apiError">
      <h2 class="text-lg font-semibold mb-2">Error</h2>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message, MessageType } from "@/model/message"
import { GmailService } from "@/service/gmail.service"

import IdentityService from "@/service/identity.service"
import MessageService from "@/service/message.service"

const userStore = useUserStore()
const sidePanelStore = useSidepanelStore()

const { userEmail } = storeToRefs(userStore)
const { threadId } = storeToRefs(sidePanelStore)

const identityService = new IdentityService()
const gmailService = new GmailService()
const messageService = new MessageService()

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
const tabId = tab.id

const apiError = ref<any>(null)
const gmailServiceResponse = ref<any>(null)

watch(threadId, async (newThreadId) => {
  if (newThreadId) {
    await getThreadIdFromContentScript()
  }
})

const getThreadIdFromContentScript = async () => {
  const response = await messageService.sendMessageToContentScript(
    tabId as number,
    {
      type: MessageType.CONTENT_SCRIPT_FUNCTION,
      timestamp: Date.now(),
      data: {
        tabId: tabId,
        functionName: "getThreadId",
        args: [],
      },
    } as Message,
  )

  const threadId = response.threadId

  fetchThread(threadId)
}

const fetchThread = async (threadId: string) => {
  gmailService.updateAccessToken(await identityService.getAccessToken())

  gmailService
    .getThread(threadId, {
      format: "full",
    })
    .then((thread) => {
      console.info("Fetched thread:", thread)
      const decodedMessages = thread.data.messages.map((message) => {
        const decodedParts = message.payload.parts?.map((part) => {
          if (part.mimeType !== "text/plain") {
            return
          }
          if (part.body.data) {
            const decodedData = atob(
              part.body.data.replace(/-/g, "+").replace(/_/g, "/"),
            )
            return decodedData
              .replace(/Ã©/g, "é")
              .replace(/Ã¨/g, "è")
              .replace(/Ã´/g, "ô")
              .replace(/Ãª/g, "ê")
              .replace(/Ã§/g, "ç")
              .replace(/Ã«/g, "ë")
              .replace(/Ã¼/g, "ü")
              .replace(/Ã /g, "à")
              .replace(/Ã©/g, "é")
              .replace(/Ã¯/g, "ï")
              .replace(/Ã¤/g, "ä")
              .replace(/Ã¶/g, "ö")
              .replace(/Ã¹/g, "ù")
              .replace(/Ã»/g, "û")
              .replace(/Ã¡/g, "á")
              .replace(/Ã³/g, "ó")
              .replace(/Ã­/g, "í")
              .replace(/Ã±/g, "ñ")
              .replace(/Ãº/g, "ú")
          }
        })

        return {
          id: message.id,
          snippet: message.snippet,
          decodedParts,
        }
      })
      gmailServiceResponse.value = decodedMessages
    })
    .catch((error) => {
      console.error("Error fetching thread:", error)
      apiError.value = error
    })
}

const fetchMessage = async (messageId: string) => {
  gmailService.updateAccessToken(await identityService.getAccessToken())

  gmailService
    .getMessage(messageId, {
      format: "full",
    })
    .then((message) => {
      console.info("Fetched message:", message)
      gmailServiceResponse.value = message
    })
    .catch((error) => {
      console.error("Error fetching message:", error)
      apiError.value = error
    })
}

const fetchUnreadMessages = async (maxResults: number = 10) => {
  gmailService.updateAccessToken(await identityService.getAccessToken())
  gmailService
    .listMessages({
      q: "is:unread",
      maxResults: maxResults,
    })
    .then((messages) => {
      console.info("Fetched unread messages:", messages)
      gmailServiceResponse.value = messages
    })
    .catch((error) => {
      console.error("Error fetching unread messages:", error)
      apiError.value = error
    })
}

const createDraft = async () => {
  gmailService.updateAccessToken(await identityService.getAccessToken())

  const rawEmail = `To: recipient@example.com
          Subject: Test Subject
          Content-Type: text/plain; charset=UTF-8

          Hello, this is a test email body.`

  gmailService
    .createDraftFromRaw(rawEmail)
    .then(async ({ response, urls }) => {
      console.info("Draft created successfully:", response)
      gmailServiceResponse.value = urls
    })
    .catch((error) => {
      console.error("Error creating draft:", error)
      apiError.value = error
    })
}

const fetchDraft = async (draftId: string) => {
  gmailService.updateAccessToken(await identityService.getAccessToken())
  gmailService
    .getDraft(draftId)
    .then((draft) => {
      console.info("Fetched draft:", draft)
      gmailServiceResponse.value = draft
    })
    .catch((error) => {
      console.error("Error fetching draft:", error)
      apiError.value = error
    })
}
</script>

<style scoped></style>
