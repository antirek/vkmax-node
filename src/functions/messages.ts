import { OPCODES, generateRandomId } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse, SendMessagePayload, EditMessagePayload, DeleteMessagePayload, ReadMessagePayload, GetMessagesPayload } from '../types.js';

/**
 * Функции для работы с сообщениями в VK MAX
 */

/**
 * Отправка сообщения в указанный чат
 * 
 * Отправляет текстовое сообщение в чат. Поддерживает уведомления.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата для отправки сообщения
 * @param text - Текст сообщения
 * @param notify - Отправлять ли уведомление (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await sendMessage(client, 'chat123', 'Привет, мир!');
 * await sendMessage(client, 'chat123', 'Тихий привет', false);
 * ```
 */
export async function sendMessage(
    client: MaxClient, 
    chatId: string | number, 
    text: string, 
    notify: boolean = true
): Promise<RpcResponse> {
    const payload: SendMessagePayload = {
        chatId: typeof chatId === 'string' ? parseInt(chatId) : chatId,
        message: {
            text: text,
            cid: generateRandomId(),
            elements: [],
            attaches: []
        },
        notify: notify
    };
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, payload);
}

/**
 * Редактирование указанного сообщения
 * 
 * Изменяет текст существующего сообщения в чате.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата с сообщением
 * @param messageId - ID сообщения для редактирования
 * @param text - Новый текст сообщения
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await editMessage(client, 'chat123', 'msg456', 'Исправленный текст');
 * ```
 */
export async function editMessage(
    client: MaxClient, 
    chatId: string, 
    messageId: string | number, 
    text: string
): Promise<RpcResponse> {
    const payload: EditMessagePayload = {
        chatId: chatId,
        messageId: String(messageId),
        text: text,
        elements: [],
        attachments: []
    };
    return await client.invokeMethod(OPCODES.EDIT_MESSAGE, payload);
}

/**
 * Удаление указанных сообщений
 * 
 * Удаляет одно или несколько сообщений из чата.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата с сообщениями
 * @param messageIds - Массив ID сообщений для удаления
 * @param deleteForMe - Удалить только для себя (по умолчанию false)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Удалить сообщение для всех
 * await deleteMessage(client, 'chat123', ['msg456']);
 * 
 * // Удалить сообщение только для себя
 * await deleteMessage(client, 'chat123', ['msg456'], true);
 * ```
 */
export async function deleteMessage(
    client: MaxClient, 
    chatId: string, 
    messageIds: string[], 
    deleteForMe: boolean = false
): Promise<RpcResponse> {
    const payload: DeleteMessagePayload = {
        chatId: chatId,
        messageIds: messageIds,
        forMe: deleteForMe
    };
    return await client.invokeMethod(OPCODES.DELETE_MESSAGE, payload);
}

/**
 * Отметка сообщения как прочитанного
 * 
 * Помечает сообщение как прочитанное в указанном чате.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата с сообщением
 * @param messageId - ID сообщения для отметки как прочитанного
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await readMessage(client, 'chat123', 'msg456');
 * ```
 */
export async function readMessage(
    client: MaxClient, 
    chatId: string, 
    messageId: string | number
): Promise<RpcResponse> {
    const payload: ReadMessagePayload = {
        type: "READ_MESSAGE",
        chatId: chatId,
        messageId: String(messageId),
        mark: generateRandomId()
    };
    return await client.invokeMethod(OPCODES.READ_MESSAGE, payload);
}

/**
 * Получение сообщений из чата
 * 
 * Загружает сообщения из указанного чата с поддержкой пагинации.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата для получения сообщений
 * @param from - ID сообщения для начала загрузки (опционально)
 * @param forward - Количество сообщений вперед (по умолчанию 0)
 * @param backward - Количество сообщений назад (по умолчанию 30)
 * @returns Promise<RpcResponse> - Ответ от сервера с сообщениями
 * 
 * @example
 * ```typescript
 * // Получить последние 30 сообщений
 * const messages = await getMessages(client, 'chat123');
 * 
 * // Получить сообщения с определенной точки
 * const messages = await getMessages(client, 'chat123', 'msg456', 0, 50);
 * ```
 */
export async function getMessages(
    client: MaxClient, 
    chatId: string, 
    from?: string, 
    forward: number = 0, 
    backward: number = 30
): Promise<RpcResponse> {
    const payload: GetMessagesPayload = {
        chatId: chatId,
        from: from,
        forward: forward,
        backward: backward,
        getMessages: true
    };
    return await client.invokeMethod(OPCODES.GET_MESSAGES, payload);
}

/**
 * Ответ на сообщение в чате
 * 
 * Отправляет сообщение с привязкой к другому сообщению (reply).
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата для отправки ответа
 * @param text - Текст ответного сообщения
 * @param replyToMessageId - ID сообщения, на которое отвечаем
 * @param notify - Отправлять ли уведомление (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await replyMessage(client, 'chat123', 'Это ответ!', 'msg456');
 * ```
 */
export async function replyMessage(
    client: MaxClient, 
    chatId: string, 
    text: string, 
    replyToMessageId: string | number, 
    notify: boolean = true
): Promise<RpcResponse> {
    const payload: SendMessagePayload = {
        chatId: chatId,
        message: {
            text: text,
            cid: generateRandomId(),
            elements: [],
            link: {
                type: "REPLY",
                messageId: String(replyToMessageId)
            },
            attaches: []
        },
        notify: notify
    };
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, payload);
} 