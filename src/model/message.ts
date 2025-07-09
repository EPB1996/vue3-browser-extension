export enum MessageType {
  SIDEPANEL_READY = "SIDEPANEL_READY",
  PAGE_DATA = "PAGE_DATA",
  TAB_UPDATED = "TAB_UPDATED",
  TAB_ACTIVATED = "TAB_ACTIVATED",
  RESPONSE = "RESPONSE",
  ERROR = "ERROR",
  CONTENT_SCRIPT_FUNCTION = "CONTENT_SCRIPT_FUNCTION",
}

export interface BaseMessage {
  type: MessageType
  timestamp: number
}

// General
export interface SidePanelReadyMessage extends BaseMessage {
  type: MessageType.SIDEPANEL_READY
}

export interface PageDataMessage extends BaseMessage {
  type: MessageType.PAGE_DATA
  data: {
    message: string
  }
}

export interface TabUpdatedMessage extends BaseMessage {
  type: MessageType.TAB_UPDATED
  data: {
    tabId: number
    url: string
  }
}

export interface TabActivatedMessage extends BaseMessage {
  type: MessageType.TAB_ACTIVATED
  data: {
    tabId: number
    url: string
  }
}

export interface ResponseMessage extends BaseMessage {
  type: MessageType.RESPONSE
  data: {
    message: string
    originalType: string
    originalData: object
  }
}

export interface ErrorMessage extends BaseMessage {
  type: MessageType.ERROR
  data: {
    error: string
  }
}

export interface ContentScriptFunctionMessage extends BaseMessage {
  type: MessageType.CONTENT_SCRIPT_FUNCTION
  data: {
    tabId: number
    functionName: string
    args: any[]
  }
}

export type Message =
  | SidePanelReadyMessage
  | PageDataMessage
  | TabUpdatedMessage
  | TabActivatedMessage
  | ResponseMessage
  | ErrorMessage
  | ContentScriptFunctionMessage
