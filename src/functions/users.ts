import { OPCODES } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse } from '../types.js';

/**
 * Функции для работы с пользователями в VK MAX
 */

/**
 * Получение информации о контактах
 * 
 * Загружает информацию о пользователях по их ID.
 * 
 * @param client - Экземпляр MaxClient
 * @param contactIds - Массив ID пользователей для получения информации
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о контактах
 * 
 * @example
 * ```typescript
 * const contacts = await getContacts(client, ['user123', 'user456']);
 * console.log('Информация о контактах:', contacts.payload);
 * ```
 */
export async function getContacts(
    client: MaxClient, 
    contactIds: string[]
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.GET_CONTACTS, {
        contactIds: contactIds
    });
}

/**
 * Добавление пользователя в контакты
 * 
 * Добавляет пользователя в список контактов.
 * 
 * @param client - Экземпляр MaxClient
 * @param contactId - ID пользователя для добавления в контакты
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await addContact(client, 'user123');
 * console.log('Пользователь добавлен в контакты');
 * ```
 */
export async function addContact(
    client: MaxClient, 
    contactId: string
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.ADD_CONTACT, {
        contactId: contactId,
        action: "ADD"
    });
}

/**
 * Реакция на сообщение
 * 
 * Добавляет эмодзи-реакцию к сообщению и получает список всех реакций.
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата с сообщением
 * @param messageId - ID сообщения для добавления реакции
 * @param reaction - Эмодзи-реакция (например, "👍", "❤️", "😂")
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * // Добавить лайк к сообщению
 * await reactToMessage(client, 'chat123', 'msg456', '👍');
 * 
 * // Добавить сердечко
 * await reactToMessage(client, 'chat123', 'msg456', '❤️');
 * ```
 */
export async function reactToMessage(
    client: MaxClient, 
    chatId: string, 
    messageId: string | number, 
    reaction: string
): Promise<void> {
    await client.invokeMethod(OPCODES.ADD_REACTION, {
        chatId: chatId,
        messageId: String(messageId),
        reaction: {
            reactionType: "EMOJI",
            id: reaction
        }
    });
    
    await client.invokeMethod(OPCODES.GET_REACTIONS, {
        chatId: chatId,
        messageId: String(messageId),
        count: 100
    });
} 