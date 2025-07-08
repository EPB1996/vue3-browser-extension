<template>
  <div>
    <h1>Gmail Page</h1>

    <UButton
      v-if="!userEmail"
      icon="ph:login"
      variant="solid"
      @click="() => userStore.login()"
    >
      Login
    </UButton>
    <UButton
      v-if="userEmail"
      icon="ph:login"
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
    <UButton
      icon="ph:envelope-simple"
      variant="solid"
      @click="fetchEmails"
    >
      Fetch Emails
    </UButton>
    <div v-if="emails">
      <h2 class="text-lg font-semibold mb-2">Emails</h2>
      <pre>{{ emails }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import IdentityService from "@/service/identity.service"

const userStore = useUserStore()
const backgroundPort = chrome.runtime.connect({ name: "sidepanel" })

const { userEmail } = storeToRefs(userStore)

const identityService = new IdentityService()

const emails = ref<any>(null)

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
</script>

<style scoped></style>
