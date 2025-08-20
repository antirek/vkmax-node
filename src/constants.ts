/**
 * Constants and utilities for VK MAX client
 */

// WebSocket configuration
export const WS_HOST = "wss://ws-api.oneme.ru/websocket";
export const RPC_VERSION = 11;
export const APP_VERSION = "25.6.8";

// Opcodes for different operations
export const OPCODES = {
    // Keepalive
    KEEPALIVE: 1,
    
    // Authentication
    HELLO: 6,
    START_AUTH: 17,
    VERIFY_CODE: 18,
    LOGIN_BY_TOKEN: 19,
    
    // Profile
    UPDATE_SETTINGS: 22,
    
    // Contacts
    GET_CONTACTS: 32,
    ADD_CONTACT: 34,
    
    // Messages
    GET_MESSAGES: 49,
    READ_MESSAGE: 50,
    CHANGE_GROUP_SETTINGS: 55,
    JOIN_BY_LINK: 57,
    GET_GROUP_MEMBERS: 59,
    SEND_MESSAGE: 64,
    DELETE_MESSAGE: 66,
    EDIT_MESSAGE: 67,
    MANAGE_USERS: 77,
    RESOLVE_LINK: 89,
    
    // Reactions
    ADD_REACTION: 178,
    GET_REACTIONS: 181,
    
    // Events
    MESSAGE_RECEIVED: 128
} as const;

// User agent configuration
export const USER_AGENT = {
    deviceType: "WEB",
    locale: "ru_RU",
    osVersion: "macOS",
    deviceName: "vkmax Node.js",
    headerUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    deviceLocale: "ru-RU",
    appVersion: APP_VERSION,
    screen: "956x1470 2.0x",
    timezone: "Asia/Vladivostok"
} as const;

// Privacy settings
export const PRIVACY_SETTINGS = {
    ALL: "ALL",
    CONTACTS: "CONTACTS"
} as const;

// Message types
export const MESSAGE_TYPES = {
    TEXT: "TEXT",
    REPLY: "REPLY"
} as const;

// Type definitions for constants
export type Opcode = typeof OPCODES[keyof typeof OPCODES];
export type PrivacySetting = typeof PRIVACY_SETTINGS[keyof typeof PRIVACY_SETTINGS];
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Utility functions
export function generateRandomId(): number {
    return Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000);
}

export function validatePhoneNumber(phone: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

export function validateSmsCode(code: string | number): boolean {
    // SMS code should be 4-6 digits
    const codeRegex = /^\d{4,6}$/;
    return codeRegex.test(String(code));
} 