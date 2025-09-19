/**
 * TypeScript типы для VK MAX клиента
 * 
 * Содержит все типы и интерфейсы, используемые в VK MAX клиенте.
 * Включает типы для WebSocket соединений, RPC запросов/ответов,
 * сообщений, аутентификации и других компонентов.
 */

// WebSocket connection types
/**
 * Интерфейс WebSocket соединения
 * 
 * Определяет методы для работы с WebSocket соединением.
 */
export interface WebSocketConnection {
  /** Обработчик события открытия соединения */
  on(event: 'open', listener: () => void): void;
  /** Обработчик события ошибки */
  on(event: 'error', listener: (error: Error) => void): void;
  /** Обработчик события закрытия соединения */
  on(event: 'close', listener: () => void): void;
  /** Обработчик события получения сообщения */
  on(event: 'message', listener: (data: Buffer) => void): void;
  /** Отправка данных */
  send(data: string): void;
  /** Закрытие соединения */
  close(): void;
}

// RPC packet types
/**
 * Интерфейс RPC запроса
 * 
 * Структура запроса к серверу VK MAX.
 */
export interface RpcRequest {
  /** Версия протокола */
  ver: number;
  /** Команда (обычно 0 для запросов) */
  cmd: number;
  /** Последовательный номер запроса */
  seq: number;
  /** Код операции */
  opcode: number;
  /** Данные запроса */
  payload: any;
}

/**
 * Интерфейс RPC ответа
 * 
 * Структура ответа от сервера VK MAX.
 */
export interface RpcResponse {
  /** Версия протокола */
  ver: number;
  /** Команда (обычно 1 для ответов) */
  cmd: number;
  /** Последовательный номер ответа */
  seq: number;
  /** Код операции */
  opcode: number;
  /** Данные ответа */
  payload: any;
  /** Ошибка (если есть) */
  error?: string;
}

// Authentication types
/**
 * Интерфейс токена аутентификации
 * 
 * Содержит токен для подтверждения SMS кода.
 */
export interface AuthToken {
  /** Токен для подтверждения */
  token: string;
}

/**
 * Интерфейс данных верификации
 * 
 * Содержит результат верификации SMS кода.
 */
export interface VerificationPayload {
  /** Ошибка верификации (если есть) */
  error?: string;
  /** Информация о профиле пользователя */
  profile?: {
    /** Номер телефона */
    phone: string;
    /** Дополнительные данные профиля */
    [key: string]: any;
  };
}

/**
 * Интерфейс данных входа
 * 
 * Содержит результат входа в систему.
 */
export interface LoginPayload {
  /** Ошибка входа (если есть) */
  error?: string;
  /** Информация о профиле пользователя */
  profile?: {
    /** Номер телефона */
    phone: string;
    /** Дополнительные данные профиля */
    [key: string]: any;
  };
}

// Message types
/**
 * Интерфейс элемента сообщения
 * 
 * Представляет элемент сообщения (например, форматирование, ссылки).
 */
export interface MessageElement {
  /** Тип элемента */
  type: string;
  /** Дополнительные данные элемента */
  [key: string]: any;
}

/**
 * Интерфейс вложения сообщения
 * 
 * Представляет вложение к сообщению (файл, изображение и т.д.).
 */
export interface MessageAttachment {
  /** Тип вложения */
  type: string;
  /** Дополнительные данные вложения */
  [key: string]: any;
}

/**
 * Интерфейс ссылки сообщения
 * 
 * Представляет ссылку на другое сообщение (для ответов).
 */
export interface MessageLink {
  /** Тип ссылки */
  type: string;
  /** ID сообщения, на которое ссылаемся */
  messageId: string;
}

/**
 * Интерфейс сообщения
 * 
 * Полная структура сообщения в VK MAX.
 */
export interface Message {
  /** Текст сообщения */
  text: string;
  /** Уникальный ID сообщения */
  cid: number;
  /** Элементы сообщения */
  elements: MessageElement[];
  /** Вложения сообщения */
  attaches: MessageAttachment[];
  /** Ссылка на другое сообщение (для ответов) */
  link?: MessageLink;
}

/**
 * Интерфейс данных отправки сообщения
 * 
 * Структура данных для отправки сообщения.
 */
export interface SendMessagePayload {
  /** ID чата */
  chatId: string | number;
  /** Сообщение для отправки */
  message: Message;
  /** Отправлять ли уведомление */
  notify: boolean;
}

/**
 * Интерфейс данных редактирования сообщения
 * 
 * Структура данных для редактирования сообщения.
 */
export interface EditMessagePayload {
  /** ID чата */
  chatId: string;
  /** ID сообщения для редактирования */
  messageId: string;
  /** Новый текст сообщения */
  text: string;
  /** Элементы сообщения */
  elements: MessageElement[];
  /** Вложения сообщения */
  attachments: MessageAttachment[];
}

/**
 * Интерфейс данных удаления сообщения
 * 
 * Структура данных для удаления сообщений.
 */
export interface DeleteMessagePayload {
  /** ID чата */
  chatId: string;
  /** Массив ID сообщений для удаления */
  messageIds: string[];
  /** Удалить только для себя */
  forMe: boolean;
}

/**
 * Интерфейс данных отметки сообщения как прочитанного
 * 
 * Структура данных для отметки сообщения как прочитанного.
 */
export interface ReadMessagePayload {
  /** Тип операции */
  type: string;
  /** ID чата */
  chatId: string;
  /** ID сообщения */
  messageId: string;
  /** Маркер для отслеживания */
  mark: number;
}

/**
 * Интерфейс данных получения сообщений
 * 
 * Структура данных для получения сообщений из чата.
 */
export interface GetMessagesPayload {
  /** ID чата */
  chatId: string;
  /** ID сообщения для начала загрузки */
  from?: string | undefined;
  /** Количество сообщений вперед */
  forward: number;
  /** Количество сообщений назад */
  backward: number;
  /** Флаг получения сообщений */
  getMessages: boolean;
}

// Profile settings types
/**
 * Интерфейс настроек пользователя
 * 
 * Содержит различные настройки приватности пользователя.
 */
export interface UserSettings {
  /** Скрыть время последнего посещения */
  HIDDEN?: boolean;
  /** Настройка поиска по номеру телефона */
  SEARCH_BY_PHONE?: string;
  /** Настройка входящих звонков */
  INCOMING_CALL?: string;
  /** Настройка приглашений в чаты */
  CHATS_INVITE?: string;
}

/**
 * Интерфейс данных настроек
 * 
 * Структура данных для обновления настроек профиля.
 */
export interface SettingsPayload {
  /** Настройки */
  settings: {
    /** Настройки пользователя */
    user: UserSettings;
  };
}

// Hello packet types
/**
 * Интерфейс данных hello пакета
 * 
 * Структура данных для приветственного пакета.
 */
export interface HelloPayload {
  /** Информация об устройстве */
  userAgent: UserAgent;
  /** Уникальный ID устройства */
  deviceId: string;
}

/**
 * Интерфейс User-Agent
 * 
 * Содержит информацию об устройстве и клиенте.
 */
export interface UserAgent {
  /** Тип устройства */
  deviceType: string;
  /** Локаль */
  locale: string;
  /** Версия операционной системы */
  osVersion: string;
  /** Название устройства */
  deviceName: string;
  /** User-Agent заголовок */
  headerUserAgent: string;
  /** Локаль устройства */
  deviceLocale: string;
  /** Версия приложения */
  appVersion: string;
  /** Разрешение экрана */
  screen: string;
  /** Часовой пояс */
  timezone: string;
}

// Keepalive types
/**
 * Интерфейс данных keepalive пакета
 * 
 * Структура данных для пакета поддержания соединения.
 */
export interface KeepalivePayload {
  /** Интерактивный режим */
  interactive: boolean;
}

// Login by token types
/**
 * Интерфейс данных входа по токену
 * 
 * Структура данных для входа по сохраненному токену.
 */
export interface LoginByTokenPayload {
  /** Интерактивный режим */
  interactive: boolean;
  /** Токен для входа */
  token: string;
  /** Синхронизация чатов */
  chatsSync: number;
  /** Синхронизация контактов */
  contactsSync: number;
  /** Синхронизация присутствия */
  presenceSync: number;
  /** Синхронизация черновиков */
  draftsSync: number;
  /** Количество чатов */
  chatsCount: number;
}

// Start auth types
/**
 * Интерфейс данных начала аутентификации
 * 
 * Структура данных для начала процесса SMS аутентификации.
 */
export interface StartAuthPayload {
  /** Номер телефона */
  phone: string;
  /** Тип аутентификации */
  type: string;
  /** Язык */
  language: string;
}

// Verify code types
/**
 * Интерфейс данных подтверждения кода
 * 
 * Структура данных для подтверждения SMS кода.
 */
export interface VerifyCodePayload {
  /** Токен аутентификации */
  token: string;
  /** SMS код для подтверждения */
  verifyCode: string;
  /** Тип токена аутентификации */
  authTokenType: string;
}

// Event callback types
/**
 * Тип callback для входящих событий
 * 
 * Функция, которая вызывается при получении входящих событий от сервера.
 */
export type IncomingEventCallback = (client: any, packet: RpcResponse) => void;

// Pending request types
/**
 * Интерфейс ожидающего запроса
 * 
 * Содержит Promise для ожидающего RPC запроса.
 */
export interface PendingRequest {
  /** Функция разрешения Promise */
  resolve: (value: RpcResponse) => void;
  /** Функция отклонения Promise */
  reject: (reason: Error) => void;
}

// Client state types
/**
 * Интерфейс состояния клиента
 * 
 * Содержит внутреннее состояние MaxClient.
 */
export interface ClientState {
  /** WebSocket соединение */
  connection: WebSocketConnection | null;
  /** Статус входа в систему */
  isLoggedIn: boolean;
  /** Последовательный номер */
  seq: number;
  /** Задача keepalive */
  keepaliveTask: NodeJS.Timeout | null;
  /** Задача приема сообщений */
  recvTask: NodeJS.Timeout | null;
  /** Callback для входящих событий */
  incomingEventCallback: IncomingEventCallback | null;
  /** Ожидающие запросы */
  pending: Map<number, PendingRequest>;
  /** Статус подключения */
  isConnected: boolean;
}

// File upload types
/**
 * Интерфейс для загрузки изображений
 * 
 * Структура данных для загрузки изображений через uploadImage API.
 */
export interface ImageUploadPayload {
  /** API токен для аутентификации */
  apiToken: string;
  /** ID фотографий */
  photoIds: string;
  /** Файл изображения */
  file: Buffer | Uint8Array;
  /** Имя файла */
  filename: string;
  /** MIME тип */
  mimeType: string;
}

/**
 * Интерфейс для загрузки файлов
 * 
 * Структура данных для загрузки файлов через upload.do API.
 */
export interface FileUploadPayload {
  /** Подпись для авторизации */
  sig: string;
  /** Время истечения */
  expires: number;
  /** Тип клиента */
  clientType: number;
  /** ID */
  id: number;
  /** ID пользователя */
  userId: number;
  /** Файл для загрузки */
  file: Buffer | Uint8Array;
  /** Имя файла */
  filename: string;
  /** MIME тип */
  mimeType: string;
}

/**
 * Интерфейс ответа загрузки изображения
 */
export interface ImageUploadResponse {
  /** Успешность загрузки */
  success: boolean;
  /** ID загруженного изображения */
  imageId?: string;
  /** URL изображения */
  url?: string;
  /** Ошибка (если есть) */
  error?: string;
}

/**
 * Интерфейс ответа загрузки файла
 */
export interface FileUploadResponse {
  /** Успешность загрузки */
  success: boolean;
  /** ID загруженного файла */
  fileId?: string;
  /** URL файла */
  url?: string;
  /** Размер файла */
  size?: number;
  /** Ошибка (если есть) */
  error?: string;
}

/**
 * Интерфейс запроса URL для загрузки файла
 */
export interface RequestUploadUrlPayload {
  /** Тип файла */
  fileType: 'image' | 'video' | 'audio' | 'document';
  /** Имя файла */
  filename: string;
  /** Размер файла в байтах */
  size: number;
  /** MIME тип файла */
  mimeType: string;
}

/**
 * Интерфейс ответа с URL для загрузки
 */
export interface UploadUrlResponse {
  /** URL для загрузки файла */
  uploadUrl: string;
  /** Параметры для загрузки */
  uploadParams: {
    /** API токен (для изображений) */
    apiToken?: string;
    /** Photo IDs (для изображений) */
    photoIds?: string;
    /** Подпись (для файлов) */
    sig?: string;
    /** Время истечения (для файлов) */
    expires?: number;
    /** Тип клиента (для файлов) */
    clientType?: number;
    /** ID (для файлов) */
    id?: number;
    /** ID пользователя (для файлов) */
    userId?: number;
  };
  /** ID файла для последующего использования */
  fileId?: string;
  /** Ошибка (если есть) */
  error?: string;
}

/**
 * Тип поддерживаемых медиафайлов
 */
export type MediaType = 'image' | 'video' | 'audio' | 'document';

/**
 * Интерфейс медиафайла
 */
export interface MediaFile {
  /** Тип медиафайла */
  type: MediaType;
  /** Содержимое файла */
  data: Buffer | Uint8Array;
  /** Имя файла */
  filename: string;
  /** MIME тип */
  mimeType: string;
  /** Размер файла в байтах */
  size: number;
}

/**
 * Интерфейс вложения медиафайла в сообщение
 */
export interface MediaAttachment extends MessageAttachment {
  /** Тип вложения - всегда MEDIA */
  _type: 'MEDIA';
  /** Тип медиафайла */
  mediaType: MediaType;
  /** ID загруженного файла */
  fileId: string;
  /** URL файла */
  url: string;
  /** Имя файла */
  filename: string;
  /** Размер файла */
  size: number;
  /** Превью (для изображений и видео) */
  thumbnail?: string;
  /** Ширина (для изображений и видео) */
  width?: number;
  /** Высота (для изображений и видео) */
  height?: number;
  /** Длительность (для аудио и видео) */
  duration?: number;
}

// Types are already exported above 