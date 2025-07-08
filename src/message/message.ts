export interface BaseMessage {
  type: string
  timestamp: number
}

export interface SidePanelReadyMessage extends BaseMessage {
  type: "SIDEPANEL_READY"
}

export interface PageDataMessage extends BaseMessage {
  type: "PAGE_DATA"
  data: {
    message: string
  }
}

export interface TabUpdatedMessage extends BaseMessage {
  type: "TAB_UPDATED"
  data: {
    tabId: number
    url: string
  }
}
export interface TabActivateddMessage extends BaseMessage {
  type: "TAB_ACTIVATED"
  data: {
    tabId: number
    url: string
  }
}

export interface ResponseMessage extends BaseMessage {
  type: "RESPONSE"
  data: {
    message: string
    originalType: string
    originalData: object
  }
}

export interface ErrorMessage extends BaseMessage {
  type: "ERROR"
  data: {
    error: string
  }
}

export type Message =
  | SidePanelReadyMessage
  | PageDataMessage
  | TabUpdatedMessage
  | TabActivateddMessage
  | ResponseMessage
  | ErrorMessage
