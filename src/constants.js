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
    GET_PROFILE: 16,
    UPDATE_SETTINGS: 22,
    
    // Users
    GET_USER_INFO: 20,
    GET_USER_STATUS: 21,
    
    // Groups
    GET_GROUP_INFO: 30,
    JOIN_GROUP: 31,
    LEAVE_GROUP: 32,
    GET_GROUP_MEMBERS: 33,
    INVITE_USER_TO_GROUP: 34,
    REMOVE_USER_FROM_GROUP: 35,
    CHANGE_GROUP_SETTINGS: 36,
    GET_GROUP_CHATS: 37,
    CREATE_GROUP_CHAT: 38,
    DELETE_GROUP_CHAT: 39,
    
    // Channels
    GET_CHANNEL_INFO: 40,
    SUBSCRIBE_TO_CHANNEL: 41,
    UNSUBSCRIBE_FROM_CHANNEL: 42,
    GET_CHANNEL_POSTS: 43,
    GET_CHANNEL_SUBSCRIBERS: 44,
    CREATE_CHANNEL_POST: 45,
    EDIT_CHANNEL_POST: 46,
    DELETE_CHANNEL_POST: 47,
    
    // Messages
    PIN_MESSAGE: 55,
    SEND_MESSAGE: 64,
    DELETE_MESSAGE: 66,
    EDIT_MESSAGE: 67,
    
    // Events
    MESSAGE_RECEIVED: 128
};

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
};

// Privacy settings
export const PRIVACY_SETTINGS = {
    ALL: "ALL",
    CONTACTS: "CONTACTS"
};

// Message types
export const MESSAGE_TYPES = {
    TEXT: "TEXT",
    REPLY: "REPLY"
};

// Utility functions
export function generateRandomId() {
    return Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000);
}

export function validatePhoneNumber(phone) {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

export function validateSmsCode(code) {
    // SMS code should be 4-6 digits
    const codeRegex = /^\d{4,6}$/;
    return codeRegex.test(String(code));
} 