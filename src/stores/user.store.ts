import IdentityService from "@/service/identity.service"
import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", () => {
  const { data: userEmail } = useBrowserLocalStorage("userEmail", "")
  const identityService = new IdentityService()

  // You should probably use chrome.storage API instead of localStorage since localStorage history can be cleared by the user.
  // See https://developer.chrome.com/docs/extensions/reference/api/storage

  const login = async () => {
    const userProfile: chrome.identity.ProfileUserInfo =
      await identityService.getUserProfile()
    await identityService.getAccessToken()
    userEmail.value = userProfile.email
    chrome.storage.sync.set({ user: userProfile })
  }
  const logout = () => {
    userEmail.value = ""
    chrome.storage.sync.set({ user: null })
  }

  return {
    userEmail,
    login,
    logout,
  }
})
