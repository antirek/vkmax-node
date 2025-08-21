import { OPCODES, generateRandomId } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse } from '../types.js';

/**
 * Функции для работы с каналами в VK MAX
 */

/**
 * Получение информации о канале по username
 * 
 * Получает информацию о канале используя его username без подписки.
 * 
 * @param client - Экземпляр MaxClient
 * @param username - Username канала (без @)
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о канале
 * 
 * @example
 * ```typescript
 * const channelInfo = await resolveChannelUsername(client, 'my_channel');
 * console.log('Информация о канале:', channelInfo.payload);
 * ```
 */
export async function resolveChannelUsername(
    client: MaxClient, 
    username: string
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.RESOLVE_LINK, {
        link: `https://max.ru/${username}`
    });
}

/**
 * Получение информации о канале по ID
 * 
 * Получает информацию о канале используя его ID.
 * 
 * @param client - Экземпляр MaxClient
 * @param channelId - ID канала
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о канале
 * 
 * @example
 * ```typescript
 * const channelInfo = await resolveChannelId(client, 'channel123');
 * console.log('Информация о канале:', channelInfo.payload);
 * ```
 */
export async function resolveChannelId(
    client: MaxClient, 
    channelId: string
): Promise<RpcResponse> {
    return await client.invokeMethod(48, {
        chatIds: [channelId]
    });
}

/**
 * Подписка на канал по username
 * 
 * Подписывается на канал используя его username.
 * 
 * @param client - Экземпляр MaxClient
 * @param username - Username канала (без @)
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о канале
 * 
 * @example
 * ```typescript
 * const channelInfo = await joinChannel(client, 'my_channel');
 * console.log('Подписались на канал:', channelInfo.payload);
 * ```
 */
export async function joinChannel(
    client: MaxClient, 
    username: string
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.JOIN_BY_LINK, {
        link: `https://max.ru/${username}`
    });
}

/**
 * Создание нового канала
 * 
 * Создает новый канал с указанным названием.
 * 
 * @param client - Экземпляр MaxClient
 * @param channelName - Название канала
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о созданном канале
 * 
 * @example
 * ```typescript
 * const channel = await createChannel(client, 'Мой канал');
 * console.log('Канал создан:', channel.payload);
 * ```
 */
export async function createChannel(
    client: MaxClient, 
    channelName: string
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, {
        message: {
            cid: generateRandomId(),
            attaches: [
                {
                    "_type": "CONTROL",
                    "event": "new",
                    "title": channelName,
                    "chatType": "CHANNEL"
                }
            ],
            text: ""
        }
    });
}

/**
 * Отключение уведомлений канала
 * 
 * Включает или отключает уведомления от канала.
 * 
 * @param client - Экземпляр MaxClient
 * @param channelId - ID канала
 * @param mute - true для отключения уведомлений, false для включения (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Отключить уведомления от канала
 * await muteChannel(client, 'channel123', true);
 * 
 * // Включить уведомления от канала
 * await muteChannel(client, 'channel123', false);
 * ```
 */
export async function muteChannel(
    client: MaxClient, 
    channelId: string, 
    mute: boolean = true
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, {
        settings: {
            chats: {
                [String(channelId)]: {
                    dontDisturbUntil: mute ? -1 : 0
                }
            }
        }
    });
} 