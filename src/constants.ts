/**
 * Константы и утилиты для VK MAX клиента
 * 
 * Содержит все необходимые константы для работы с VK MAX API,
 * включая коды операций, настройки User-Agent и утилитарные функции.
 */

// WebSocket configuration
/** WebSocket URL сервера VK MAX */
export const WS_HOST = "wss://ws-api.oneme.ru/websocket";

/** Версия RPC протокола */
export const RPC_VERSION = 11;

/** Версия приложения */
export const APP_VERSION = "25.6.8";

// Opcodes for different operations
/**
 * Коды операций для различных действий в VK MAX API
 * 
 * Каждый код соответствует определенной операции на сервере.
 */
export const OPCODES = {
    // Keepalive
    /** Отправка keepalive пакета для поддержания соединения */
    KEEPALIVE: 1,
    
    // Authentication
    /** Приветственный пакет с информацией об устройстве */
    HELLO: 6,
    /** Начало процесса аутентификации через SMS */
    START_AUTH: 17,
    /** Подтверждение SMS кода */
    VERIFY_CODE: 18,
    /** Вход по сохраненному токену */
    LOGIN_BY_TOKEN: 19,
    
    // Profile
    /** Обновление настроек профиля */
    UPDATE_SETTINGS: 22,
    
    // Contacts
    /** Получение информации о контактах */
    GET_CONTACTS: 32,
    /** Добавление контакта */
    ADD_CONTACT: 34,
    
    // Messages
    /** Получение сообщений из чата */
    GET_MESSAGES: 49,
    /** Отметка сообщения как прочитанного */
    READ_MESSAGE: 50,
    /** Изменение настроек группы */
    CHANGE_GROUP_SETTINGS: 55,
    /** Присоединение к группе по ссылке */
    JOIN_BY_LINK: 57,
    /** Получение участников группы */
    GET_GROUP_MEMBERS: 59,
    /** Отправка сообщения */
    SEND_MESSAGE: 64,
    /** Удаление сообщения */
    DELETE_MESSAGE: 66,
    /** Редактирование сообщения */
    EDIT_MESSAGE: 67,
    /** Управление пользователями в группе */
    MANAGE_USERS: 77,
    /** Получение информации по ссылке */
    RESOLVE_LINK: 89,
    
    // Reactions
    /** Добавление реакции к сообщению */
    ADD_REACTION: 178,
    /** Получение реакций на сообщение */
    GET_REACTIONS: 181,
    
    // File upload
    /** Запрос URL для загрузки изображений */
    REQUEST_UPLOAD_URL: 80, // Opcode для запроса ссылки загрузки изображений
    /** Запрос URL для загрузки файлов */
    REQUEST_FILE_UPLOAD_URL: 87, // Opcode для запроса ссылки загрузки файлов
    /** Уведомление о загрузке файла */
    FILE_UPLOAD_NOTIFICATION: 65, // Opcode для уведомления о загрузке файла
    /** Запрос URL для загрузки видео */
    REQUEST_VIDEO_UPLOAD_URL: 82, // Opcode для запроса ссылки загрузки видео
    
    // Events
    /** Получение нового сообщения */
    MESSAGE_RECEIVED: 128,
    /** Уведомление о готовности файла */
    FILE_READY_NOTIFICATION: 136
} as const;

// User agent configuration
/**
 * Конфигурация User-Agent для имитации веб-клиента
 * 
 * Используется для идентификации клиента на сервере VK MAX.
 */
export const USER_AGENT = {
    /** Тип устройства */
    deviceType: "WEB",
    /** Локаль */
    locale: "ru_RU",
    /** Версия операционной системы */
    osVersion: "macOS",
    /** Название устройства */
    deviceName: "vkmax Node.js",
    /** User-Agent заголовок */
    headerUserAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
    /** Локаль устройства */
    deviceLocale: "ru-RU",
    /** Версия приложения */
    appVersion: APP_VERSION,
    /** Разрешение экрана */
    screen: "956x1470 2.0x",
    /** Часовой пояс */
    timezone: "Asia/Vladivostok"
} as const;

// Privacy settings
/**
 * Настройки приватности для профиля пользователя
 * 
 * Используются для управления видимостью профиля и возможностями взаимодействия.
 */
export const PRIVACY_SETTINGS = {
    /** Доступно всем пользователям */
    ALL: "ALL",
    /** Доступно только контактам */
    CONTACTS: "CONTACTS"
} as const;

// Message types
/**
 * Типы сообщений в VK MAX
 * 
 * Определяют различные типы сообщений, которые можно отправлять.
 */
export const MESSAGE_TYPES = {
    /** Обычное текстовое сообщение */
    TEXT: "TEXT",
    /** Ответ на сообщение */
    REPLY: "REPLY"
} as const;

// Type definitions for constants
/** Тип для кодов операций */
export type Opcode = typeof OPCODES[keyof typeof OPCODES];

/** Тип для настроек приватности */
export type PrivacySetting = typeof PRIVACY_SETTINGS[keyof typeof PRIVACY_SETTINGS];

/** Тип для типов сообщений */
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

// Utility functions
/**
 * Генерация случайного ID
 * 
 * Генерирует случайный числовой ID в диапазоне, используемом VK MAX.
 * 
 * @returns {number} Случайный ID в диапазоне 1750000000000-2000000000000
 * 
 * @example
 * ```typescript
 * const id = generateRandomId();
 * console.log('Сгенерированный ID:', id);
 * ```
 */
export function generateRandomId(): number {
    return Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000);
}

/**
 * Валидация номера телефона
 * 
 * Проверяет корректность номера телефона в международном формате.
 * 
 * @param phone - Номер телефона для проверки
 * @returns {boolean} true если номер корректный, false в противном случае
 * 
 * @example
 * ```typescript
 * if (validatePhoneNumber('+79001234567')) {
 *   console.log('Номер телефона корректный');
 * }
 * ```
 */
export function validatePhoneNumber(phone: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

/**
 * Валидация SMS кода
 * 
 * Проверяет корректность SMS кода (4-6 цифр).
 * 
 * @param code - SMS код для проверки (может быть строкой или числом)
 * @returns {boolean} true если код корректный, false в противном случае
 * 
 * @example
 * ```typescript
 * if (validateSmsCode('1234')) {
 *   console.log('SMS код корректный');
 * }
 * 
 * if (validateSmsCode(123456)) {
 *   console.log('SMS код корректный');
 * }
 * ```
 */
export function validateSmsCode(code: string | number): boolean {
    // SMS code should be 4-6 digits
    const codeRegex = /^\d{4,6}$/;
    return codeRegex.test(String(code));
}

// Media upload endpoints
/**
 * Endpoints для загрузки медиафайлов
 */
export const UPLOAD_ENDPOINTS = {
    /** Endpoint для загрузки изображений */
    IMAGES: 'https://iu.oneme.ru/uploadImage',
    /** Endpoint для загрузки файлов */
    FILES: 'https://fu.oneme.ru/api/upload.do'
} as const;

// MIME types
/**
 * Поддерживаемые MIME типы для разных типов медиафайлов
 */
export const MIME_TYPES = {
    /** MIME типы изображений */
    IMAGES: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff'
    ],
    /** MIME типы видео */
    VIDEOS: [
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'video/flv',
        'video/webm',
        'video/mkv',
        'video/3gp'
    ],
    /** MIME типы аудио */
    AUDIO: [
        'audio/mp3',
        'audio/wav',
        'audio/flac',
        'audio/aac',
        'audio/ogg',
        'audio/wma',
        'audio/m4a'
    ],
    /** MIME типы документов */
    DOCUMENTS: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/rar',
        'application/7z'
    ]
} as const;

// File size limits
/**
 * Ограничения размера файлов (в байтах)
 */
export const FILE_SIZE_LIMITS = {
    /** Максимальный размер изображения (10 МБ) */
    IMAGE: 10 * 1024 * 1024,
    /** Максимальный размер видео (100 МБ) */
    VIDEO: 100 * 1024 * 1024,
    /** Максимальный размер аудио (50 МБ) */
    AUDIO: 50 * 1024 * 1024,
    /** Максимальный размер документа (4 ГБ) */
    DOCUMENT: 4 * 1024 * 1024 * 1024
} as const;

/**
 * Определение типа медиафайла по MIME типу
 * 
 * @param mimeType - MIME тип файла
 * @returns Тип медиафайла или undefined если не поддерживается
 * 
 * @example
 * ```typescript
 * const type = getMediaTypeFromMime('image/jpeg'); // 'image'
 * const type = getMediaTypeFromMime('video/mp4'); // 'video'
 * ```
 */
export function getMediaTypeFromMime(mimeType: string): 'image' | 'video' | 'audio' | 'document' | undefined {
    if (MIME_TYPES.IMAGES.includes(mimeType as any)) {
        return 'image';
    }
    if (MIME_TYPES.VIDEOS.includes(mimeType as any)) {
        return 'video';
    }
    if (MIME_TYPES.AUDIO.includes(mimeType as any)) {
        return 'audio';
    }
    if (MIME_TYPES.DOCUMENTS.includes(mimeType as any)) {
        return 'document';
    }
    return undefined;
}

/**
 * Валидация размера файла
 * 
 * @param size - Размер файла в байтах
 * @param mediaType - Тип медиафайла
 * @returns true если размер допустимый, false в противном случае
 * 
 * @example
 * ```typescript
 * if (validateFileSize(fileSize, 'image')) {
 *   console.log('Размер изображения допустимый');
 * }
 * ```
 */
export function validateFileSize(size: number, mediaType: 'image' | 'video' | 'audio' | 'document'): boolean {
    switch (mediaType) {
        case 'image':
            return size <= FILE_SIZE_LIMITS.IMAGE;
        case 'video':
            return size <= FILE_SIZE_LIMITS.VIDEO;
        case 'audio':
            return size <= FILE_SIZE_LIMITS.AUDIO;
        case 'document':
            return size <= FILE_SIZE_LIMITS.DOCUMENT;
        default:
            return false;
    }
} 