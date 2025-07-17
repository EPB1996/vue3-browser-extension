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

  constructor(accessToken: string, userId: string = "me") {
    this.httpService = new HttpService(
      "https://gmail.googleapis.com/gmail/v1",
      {
        Authorization: `Bearer ${accessToken}`,
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

  // List labels
  async listLabels(): Promise<HttpResponse<GmailListResponse<GmailLabel>>> {
    return this.httpService.get(`/users/${this.userId}/labels`)
  }

  // Get label by ID
  async getLabel(labelId: string): Promise<HttpResponse<GmailLabel>> {
    return this.httpService.get(`/users/${this.userId}/labels/${labelId}`)
  }

  // Create label
  async createLabel(
    label: Partial<GmailLabel>,
  ): Promise<HttpResponse<GmailLabel>> {
    return this.httpService.post(`/users/${this.userId}/labels`, label)
  }

  // Update label
  async updateLabel(
    labelId: string,
    label: Partial<GmailLabel>,
  ): Promise<HttpResponse<GmailLabel>> {
    return this.httpService.put(
      `/users/${this.userId}/labels/${labelId}`,
      label,
    )
  }

  // Delete label
  async deleteLabel(labelId: string): Promise<HttpResponse<void>> {
    return this.httpService.delete(`/users/${this.userId}/labels/${labelId}`)
  }

  // Send message
  async sendMessage(message: {
    raw: string
  }): Promise<HttpResponse<GmailMessage>> {
    return this.httpService.post(`/users/${this.userId}/messages/send`, message)
  }

  // Modify message labels
  async modifyMessage(
    messageId: string,
    modifications: { addLabelIds?: string[]; removeLabelIds?: string[] },
  ): Promise<HttpResponse<GmailMessage>> {
    return this.httpService.post(
      `/users/${this.userId}/messages/${messageId}/modify`,
      modifications,
    )
  }

  // Trash message
  async trashMessage(messageId: string): Promise<HttpResponse<GmailMessage>> {
    return this.httpService.post(
      `/users/${this.userId}/messages/${messageId}/trash`,
    )
  }

  // Untrash message
  async untrashMessage(messageId: string): Promise<HttpResponse<GmailMessage>> {
    return this.httpService.post(
      `/users/${this.userId}/messages/${messageId}/untrash`,
    )
  }

  // Delete message
  async deleteMessage(messageId: string): Promise<HttpResponse<void>> {
    return this.httpService.delete(
      `/users/${this.userId}/messages/${messageId}`,
    )
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

  // Watch for changes (push notifications)
  async watch(request: {
    labelIds?: string[]
    labelFilterAction?: "include" | "exclude"
    topicName: string
  }): Promise<HttpResponse<{ historyId: string; expiration: string }>> {
    return this.httpService.post(`/users/${this.userId}/watch`, request)
  }

  // Stop watching
  async stopWatching(): Promise<HttpResponse<void>> {
    return this.httpService.post(`/users/${this.userId}/stop`)
  }

  // Get history
  async getHistory(
    startHistoryId: string,
    options: { labelId?: string; maxResults?: number; pageToken?: string } = {},
  ): Promise<HttpResponse<any>> {
    const params: Record<string, string> = {
      startHistoryId,
    }

    if (options.labelId) params.labelId = options.labelId
    if (options.maxResults) params.maxResults = options.maxResults.toString()
    if (options.pageToken) params.pageToken = options.pageToken

    return this.httpService.get(`/users/${this.userId}/history`, { params })
  }
}
