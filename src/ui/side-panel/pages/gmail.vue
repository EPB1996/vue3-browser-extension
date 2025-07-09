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
        @click="fetchThread()"
      >
        Fetch Thread Manually
      </UButton>
    </div>

    <div v-if="thread">
      <div class="py-2 flex flex-row justify-between items-center">
        <div class="text-lg font-semibold mb-2">Thread ({{ threadId }})</div>
        <div>{{ Array.from(thread.messages).length }}</div>
      </div>
      <!-- <pre>{{ thread.messages }}</pre> -->
      <div class="flex flex-col gap-2">
        <div
          v-for="message in Array.from(thread.messages)"
          :key="message.id"
          class="px-2 border rounded bg-gray-100 border-gray-300 shadow-sm"
          style="margin-left: 5px"
        >
          <p>
            {{
              message.snippet.length > 100
                ? message.snippet.slice(0, 100) + "..."
                : message.snippet
            }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="apiError">
      <h2 class="text-lg font-semibold mb-2">Error</h2>
      <pre>{{ apiError }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Message, MessageType } from "@/model/message"
import IdentityService from "@/service/identity.service"
import MessageService from "@/service/message.service"

const userStore = useUserStore()
const sidePanelStore = useSidepanelStore()

const { userEmail } = storeToRefs(userStore)
const { threadId } = storeToRefs(sidePanelStore)

const identityService = new IdentityService()
const messageService = new MessageService()

const apiError = ref<any>(null)
const thread = ref<any>(null)

watch(threadId, async (newThreadId) => {
  if (newThreadId) {
    await fetchThread()
  }
})

const fetchThread = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const tabId = tab.id

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
