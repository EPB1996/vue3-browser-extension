import { HttpResponse, HttpService } from "./http.service"

// Gmail API Types
export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  historyId: string
  internalDate: string
  payload: {
    partId: string
    mimeType: string
    filename: string
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      attachmentId?: string
      size: number
      data?: string
    }
    parts?: any[]
  }
  sizeEstimate: number
  raw?: string
}
export interface GmailDraft {
  id: string
  message: GmailMessage
}

export interface GmailDraftRequest {
  message: {
    raw?: string
    payload?: {
      headers: Array<{
        name: string
        value: string
      }>
      body?: {
        data: string
      }
    }
    threadId?: string
  }
}

export interface GmailThread {
  id: string
  snippet: string
  historyId: string
  messages: GmailMessage[]
}

export interface GmailLabel {
  id: string
  name: string
  messageListVisibility: string
  labelListVisibility: string
  type: string
  messagesTotal?: number
  messagesUnread?: number
  threadsTotal?: number
  threadsUnread?: number
  color?: {
    textColor: string
    backgroundColor: string
  }
}

export interface GmailListResponse<T> {
  messages?: T[]
  threads?: T[]
  labels?: T[]
  nextPageToken?: string
  resultSizeEstimate?: number
}

export interface GmailListOptions {
  includeSpamTrash?: boolean
  labelIds?: string[]
  maxResults?: number
  pageToken?: string
  q?: string
}

export interface GmailMessageOptions {
  format?: "minimal" | "full" | "raw" | "metadata"
  metadataHeaders?: string[]
}

// Gmail Service
export class GmailService {
  private httpService: HttpService
  private userId: string

  constructor(userId: string = "me") {
    this.httpService = new HttpService(
      "https://gmail.googleapis.com/gmail/v1",
      {
        "Content-Type": "application/json",
      },
    )
    this.userId = userId
  }

  // Update access token
  updateAccessToken(accessToken: string): void {
    this.httpService.setDefaultHeader("Authorization", `Bearer ${accessToken}`)
  }

  // Get user profile
  async getProfile(): Promise<HttpResponse<any>> {
    return this.httpService.get(`/users/${this.userId}/profile`)
  }

  // List messages
  async listMessages(
    options: GmailListOptions = {},
  ): Promise<
    HttpResponse<GmailListResponse<{ id: string; threadId: string }>>
  > {
    const params: Record<string, string> = {}

    if (options.includeSpamTrash) params.includeSpamTrash = "true"
    if (options.labelIds) params.labelIds = options.labelIds.join(",")
    if (options.maxResults) params.maxResults = options.maxResults.toString()
    if (options.pageToken) params.pageToken = options.pageToken
    if (options.q) params.q = options.q

    return this.httpService.get(`/users/${this.userId}/messages`, { params })
  }

  // Get message by ID
  async getMessage(
    messageId: string,
    options: GmailMessageOptions = {},
  ): Promise<HttpResponse<GmailMessage>> {
    const params: Record<string, string> = {}

    if (options.format) params.format = options.format
    if (options.metadataHeaders)
      params.metadataHeaders = options.metadataHeaders.join(",")

    return this.httpService.get(`/users/${this.userId}/messages/${messageId}`, {
      params,
    })
  }

  // List threads
  async listThreads(
    options: GmailListOptions = {},
  ): Promise<
    HttpResponse<
      GmailListResponse<{ id: string; snippet: string; historyId: string }>
    >
  > {
    const params: Record<string, string> = {}

    if (options.includeSpamTrash) params.includeSpamTrash = "true"
    if (options.labelIds) params.labelIds = options.labelIds.join(",")
    if (options.maxResults) params.maxResults = options.maxResults.toString()
    if (options.pageToken) params.pageToken = options.pageToken
    if (options.q) params.q = options.q

    return this.httpService.get(`/users/${this.userId}/threads`, { params })
  }

  // Get thread by ID
  async getThread(
    threadId: string,
    options: GmailMessageOptions = {},
  ): Promise<HttpResponse<GmailThread>> {
    const params: Record<string, string> = {}

    if (options.format) params.format = options.format
    if (options.metadataHeaders)
      params.metadataHeaders = options.metadataHeaders.join(",")

    return this.httpService.get(`/users/${this.userId}/threads/${threadId}`, {
      params,
    })
  }

  // Get message attachment
  async getAttachment(
    messageId: string,
    attachmentId: string,
  ): Promise<HttpResponse<{ data: string; size: number }>> {
    return this.httpService.get(
      `/users/${this.userId}/messages/${messageId}/attachments/${attachmentId}`,
    )
  }

  // Draft operations

  // List drafts
  async listDrafts(options: GmailListOptions = {}): Promise<
    HttpResponse<
      GmailListResponse<{
        id: string
        message: { id: string; threadId: string }
      }>
    >
  > {
    const params: Record<string, string> = {}

    if (options.includeSpamTrash) params.includeSpamTrash = "true"
    if (options.maxResults) params.maxResults = options.maxResults.toString()
    if (options.pageToken) params.pageToken = options.pageToken
    if (options.q) params.q = options.q

    return this.httpService.get(`/users/${this.userId}/drafts`, { params })
  }

  // Get draft by ID
  async getDraft(
    draftId: string,
    options: GmailMessageOptions = {},
  ): Promise<HttpResponse<GmailDraft>> {
    const params: Record<string, string> = {}

    if (options.format) params.format = options.format
    if (options.metadataHeaders)
      params.metadataHeaders = options.metadataHeaders.join(",")

    return this.httpService.get(`/users/${this.userId}/drafts/${draftId}`, {
      params,
    })
  }

  // Create draft
  async createDraft(
    draft: GmailDraftRequest,
  ): Promise<HttpResponse<GmailDraft>> {
    return this.httpService.post(`/users/${this.userId}/drafts`, draft)
  }

  // Helper method to create a draft from raw RFC 2822 email
  async createDraftFromRaw(rawEmail: string): Promise<{
    response: HttpResponse<GmailDraft>
    urls: {
      draftsList: string
      messageUrl: string
      composeUrl: string
    }
  }> {
    // Encode raw email in base64url
    const encodedRaw = btoa(rawEmail)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "")

    const draftRequest: GmailDraftRequest = {
      message: {
        raw: encodedRaw,
      },
    }

    const response = await this.createDraft(draftRequest)

    const draftId = response.data.id
    const messageId = response.data.message.id

    const urls = this.generateDraftUrls(draftId, messageId)

    return {
      response,
      urls,
    }
  }

  // Helper method to generate Gmail URLs for drafts
  generateDraftUrls(
    draftId: string,
    messageId?: string,
  ): {
    draftsList: string
    messageUrl: string
    composeUrl: string
  } {
    const baseUrl = "https://mail.google.com/mail/u/0"

    return {
      // Opens Gmail drafts list with the specific draft highlighted
      draftsList: `${baseUrl}/#drafts/${draftId}`,

      // Opens the draft using message ID (may open in drafts list)
      messageUrl: messageId
        ? `${baseUrl}/#drafts/${messageId}`
        : `${baseUrl}/#drafts/${draftId}`,

      // Attempt to open in compose mode (may not work consistently)
      composeUrl: `${baseUrl}/#compose?d=${draftId}`,
    }
  }
}
