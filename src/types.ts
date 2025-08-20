/**
 * TypeScript types for VK MAX client
 */

// WebSocket connection types
export interface WebSocketConnection {
  on(event: 'open', listener: () => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'close', listener: () => void): void;
  on(event: 'message', listener: (data: Buffer) => void): void;
  send(data: string): void;
  close(): void;
}

// RPC packet types
export interface RpcRequest {
  ver: number;
  cmd: number;
  seq: number;
  opcode: number;
  payload: any;
}

export interface RpcResponse {
  ver: number;
  cmd: number;
  seq: number;
  opcode: number;
  payload: any;
  error?: string;
}

// Authentication types
export interface AuthToken {
  token: string;
}

export interface VerificationPayload {
  error?: string;
  profile?: {
    phone: string;
    [key: string]: any;
  };
}

export interface LoginPayload {
  error?: string;
  profile?: {
    phone: string;
    [key: string]: any;
  };
}

// Message types
export interface MessageElement {
  type: string;
  [key: string]: any;
}

export interface MessageAttachment {
  type: string;
  [key: string]: any;
}

export interface MessageLink {
  type: string;
  messageId: string;
}

export interface Message {
  text: string;
  cid: number;
  elements: MessageElement[];
  attaches: MessageAttachment[];
  link?: MessageLink;
}

export interface SendMessagePayload {
  chatId: string;
  message: Message;
  notify: boolean;
}

export interface EditMessagePayload {
  chatId: string;
  messageId: string;
  text: string;
  elements: MessageElement[];
  attachments: MessageAttachment[];
}

export interface DeleteMessagePayload {
  chatId: string;
  messageIds: string[];
  forMe: boolean;
}

export interface ReadMessagePayload {
  type: string;
  chatId: string;
  messageId: string;
  mark: number;
}

export interface GetMessagesPayload {
  chatId: string;
  from?: string | undefined;
  forward: number;
  backward: number;
  getMessages: boolean;
}

// Profile settings types
export interface UserSettings {
  HIDDEN?: boolean;
  SEARCH_BY_PHONE?: string;
  INCOMING_CALL?: string;
  CHATS_INVITE?: string;
}

export interface SettingsPayload {
  settings: {
    user: UserSettings;
  };
}

// Hello packet types
export interface HelloPayload {
  userAgent: UserAgent;
  deviceId: string;
}

export interface UserAgent {
  deviceType: string;
  locale: string;
  osVersion: string;
  deviceName: string;
  headerUserAgent: string;
  deviceLocale: string;
  appVersion: string;
  screen: string;
  timezone: string;
}

// Keepalive types
export interface KeepalivePayload {
  interactive: boolean;
}

// Login by token types
export interface LoginByTokenPayload {
  interactive: boolean;
  token: string;
  chatsSync: number;
  contactsSync: number;
  presenceSync: number;
  draftsSync: number;
  chatsCount: number;
}

// Start auth types
export interface StartAuthPayload {
  phone: string;
  type: string;
  language: string;
}

// Verify code types
export interface VerifyCodePayload {
  token: string;
  verifyCode: string;
  authTokenType: string;
}

// Event callback types
export type IncomingEventCallback = (client: any, packet: RpcResponse) => void;

// Pending request types
export interface PendingRequest {
  resolve: (value: RpcResponse) => void;
  reject: (reason: Error) => void;
}

// Client state types
export interface ClientState {
  connection: WebSocketConnection | null;
  isLoggedIn: boolean;
  seq: number;
  keepaliveTask: NodeJS.Timeout | null;
  recvTask: NodeJS.Timeout | null;
  incomingEventCallback: IncomingEventCallback | null;
  pending: Map<number, PendingRequest>;
  isConnected: boolean;
}

// Types are already exported above 