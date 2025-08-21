import { OPCODES, PRIVACY_SETTINGS } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse, SettingsPayload } from '../types.js';

/**
 * Функции для управления профилем пользователя в VK MAX
 */

/**
 * Скрыть или показать статус "последний раз в сети"
 * 
 * Управляет видимостью времени последнего посещения для других пользователей.
 * 
 * @param client - Экземпляр MaxClient
 * @param hidden - true для скрытия, false для показа
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Скрыть время последнего посещения
 * await changeOnlineStatusVisibility(client, true);
 * 
 * // Показать время последнего посещения
 * await changeOnlineStatusVisibility(client, false);
 * ```
 */
export async function changeOnlineStatusVisibility(
    client: MaxClient, 
    hidden: boolean
): Promise<RpcResponse> {
    const payload: SettingsPayload = {
        settings: {
            user: {
                HIDDEN: hidden
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * Настройка поиска профиля по номеру телефона
 * 
 * Позволяет сделать профиль доступным для поиска по номеру телефона
 * или ограничить поиск только контактами.
 * 
 * @param client - Экземпляр MaxClient
 * @param findable - true для доступности всем, false только для контактов
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Разрешить поиск всем пользователям
 * await setIsFindableByPhone(client, true);
 * 
 * // Разрешить поиск только контактам
 * await setIsFindableByPhone(client, false);
 * ```
 */
export async function setIsFindableByPhone(
    client: MaxClient, 
    findable: boolean
): Promise<RpcResponse> {
    const findableValue = findable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                SEARCH_BY_PHONE: findableValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * Настройка приватности звонков
 * 
 * Управляет возможностью получения входящих звонков от других пользователей.
 * 
 * @param client - Экземпляр MaxClient
 * @param canBeCalled - true для разрешения звонков всем, false только контактам
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Разрешить звонки всем пользователям
 * await setCallsPrivacy(client, true);
 * 
 * // Разрешить звонки только контактам
 * await setCallsPrivacy(client, false);
 * ```
 */
export async function setCallsPrivacy(
    client: MaxClient, 
    canBeCalled: boolean
): Promise<RpcResponse> {
    const canBeCalledValue = canBeCalled ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                INCOMING_CALL: canBeCalledValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * Настройка приглашений в чаты
 * 
 * Управляет возможностью приглашения пользователя в групповые чаты.
 * 
 * @param client - Экземпляр MaxClient
 * @param invitable - true для разрешения приглашений всем, false только контактам
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Разрешить приглашения всем пользователям
 * await invitePrivacy(client, true);
 * 
 * // Разрешить приглашения только контактам
 * await invitePrivacy(client, false);
 * ```
 */
export async function invitePrivacy(
    client: MaxClient, 
    invitable: boolean
): Promise<RpcResponse> {
    const invitableValue = invitable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                CHATS_INVITE: invitableValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
} 