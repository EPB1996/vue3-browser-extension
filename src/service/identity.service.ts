import { rejects } from "node:assert"
import { StringLiteral } from "typescript"

class IdentityService {
  async getAccessToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (token === undefined) {
          reject(new Error("Token could not be retrieved."))
        } else {
          resolve(token)
        }
      })
    })
  }

  async getUserProfile(): Promise<chrome.identity.ProfileUserInfo> {
    return new Promise((resolve, reject) => {
      chrome.identity
        .getProfileUserInfo()
        .then((profile) => {
          resolve(profile)
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}

export default IdentityService
