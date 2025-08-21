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
  chatId: string;
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

// Types are already exported above 