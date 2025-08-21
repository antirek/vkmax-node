import { OPCODES, generateRandomId } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse } from '../types.js';

/**
 * Функции для работы с группами в VK MAX
 */

/**
 * Создание новой группы
 * 
 * Создает групповой чат с указанным названием и участниками.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupName - Название группы
 * @param participantIds - Массив ID пользователей для добавления в группу
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о созданной группе
 * 
 * @example
 * ```typescript
 * const group = await createGroup(client, 'Моя группа', ['user123', 'user456']);
 * console.log('Группа создана:', group.payload);
 * ```
 */
export async function createGroup(
    client: MaxClient, 
    groupName: string, 
    participantIds: string[]
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, {
        message: {
            cid: generateRandomId(),
            attaches: [
                {
                    "_type": "CONTROL",
                    "event": "new",
                    "chatType": "CHAT",
                    "title": groupName,
                    "userIds": participantIds
                }
            ]
        },
        notify: true
    });
}

/**
 * Приглашение пользователей в группу
 * 
 * Добавляет пользователей в существующую группу.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param participantIds - Массив ID пользователей для приглашения
 * @param showHistory - Показывать ли историю сообщений новым участникам (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await inviteUsers(client, 'group123', ['user789', 'user012']);
 * console.log('Пользователи приглашены в группу');
 * ```
 */
export async function inviteUsers(
    client: MaxClient, 
    groupId: string, 
    participantIds: string[], 
    showHistory: boolean = true
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: participantIds,
        showHistory: showHistory,
        operation: "add"
    });
}

/**
 * Удаление пользователей из группы
 * 
 * Исключает пользователей из группы с возможностью удаления их сообщений.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param participantIds - Массив ID пользователей для удаления
 * @param deleteMessages - Удалить ли сообщения удаляемых пользователей (по умолчанию false)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Удалить пользователя без удаления сообщений
 * await removeUsers(client, 'group123', ['user789']);
 * 
 * // Удалить пользователя с удалением сообщений
 * await removeUsers(client, 'group123', ['user789'], true);
 * ```
 */
export async function removeUsers(
    client: MaxClient, 
    groupId: string, 
    participantIds: string[], 
    deleteMessages: boolean = false
): Promise<RpcResponse> {
    const deleteMessagesValue = deleteMessages ? -1 : 0;
    
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: participantIds,
        operation: "remove",
        cleanMsgPeriod: deleteMessagesValue
    });
}

/**
 * Добавление администратора в группу
 * 
 * Назначает пользователей администраторами группы с различными правами.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param adminIds - Массив ID пользователей для назначения администраторами
 * @param deletingMessages - Право на удаление сообщений (по умолчанию false)
 * @param controlParticipants - Право на управление участниками (по умолчанию false)
 * @param controlAdmins - Право на управление администраторами (по умолчанию false)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Добавить администратора с базовыми правами
 * await addAdmin(client, 'group123', ['user456']);
 * 
 * // Добавить администратора с полными правами
 * await addAdmin(client, 'group123', ['user456'], true, true, true);
 * ```
 */
export async function addAdmin(
    client: MaxClient, 
    groupId: string, 
    adminIds: string[], 
    deletingMessages: boolean = false, 
    controlParticipants: boolean = false, 
    controlAdmins: boolean = false
): Promise<RpcResponse> {
    let permissions = 120;
    
    if (deletingMessages && !controlParticipants && !controlAdmins) permissions = 121;
    else if (deletingMessages && controlParticipants && !controlAdmins) permissions = 123;
    else if (!deletingMessages && !controlParticipants && controlAdmins) permissions = 124;
    else if (deletingMessages && !controlParticipants && controlAdmins) permissions = 125;
    else if (!deletingMessages && controlParticipants && !controlAdmins) permissions = 250;
    else if (deletingMessages && controlParticipants && !controlAdmins) permissions = 251;
    else if (!deletingMessages && controlParticipants && controlAdmins) permissions = 254;
    else if (deletingMessages && controlParticipants && controlAdmins) permissions = 255;
    
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: adminIds,
        type: "ADMIN",
        operation: "add",
        permissions: permissions
    });
}

/**
 * Удаление администратора из группы
 * 
 * Снимает права администратора с пользователей.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param adminIds - Массив ID администраторов для удаления
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * await removeAdmin(client, 'group123', ['user456']);
 * console.log('Администратор удален из группы');
 * ```
 */
export async function removeAdmin(
    client: MaxClient, 
    groupId: string, 
    adminIds: string[]
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: adminIds,
        type: "ADMIN",
        operation: "remove"
    });
}

/**
 * Получение участников группы
 * 
 * Загружает список участников группы с поддержкой пагинации.
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param marker - Маркер для пагинации (по умолчанию 0)
 * @param count - Количество участников для загрузки (максимум 500, по умолчанию 500)
 * @returns Promise<RpcResponse> - Ответ от сервера со списком участников
 * @throws {Error} Если count больше 500
 * 
 * @example
 * ```typescript
 * // Получить первых 100 участников
 * const members = await getGroupMembers(client, 'group123', 0, 100);
 * 
 * // Получить следующих 50 участников
 * const members = await getGroupMembers(client, 'group123', 100, 50);
 * ```
 */
export async function getGroupMembers(
    client: MaxClient, 
    groupId: string, 
    marker: number = 0, 
    count: number = 500
): Promise<RpcResponse> {
    if (count > 500) {
        throw new Error("Maximum available count is 500");
    }
    
    return await client.invokeMethod(OPCODES.GET_GROUP_MEMBERS, {
        type: "MEMBER",
        marker: marker,
        chatId: groupId,
        count: count
    });
}

/**
 * Изменение настроек группы
 * 
 * Настраивает различные параметры группы (кто может закреплять сообщения,
 * кто может изменять иконку и название, кто может добавлять участников).
 * 
 * @param client - Экземпляр MaxClient
 * @param groupId - ID группы
 * @param allCanPinMessage - Все участники могут закреплять сообщения (по умолчанию false)
 * @param onlyOwnerCanChangeIconTitle - Только владелец может изменять иконку и название (по умолчанию true)
 * @param onlyAdminCanAddMember - Только администраторы могут добавлять участников (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * // Разрешить всем участникам закреплять сообщения
 * await changeGroupSettings(client, 'group123', true, true, true);
 * 
 * // Ограничить права только владельцу
 * await changeGroupSettings(client, 'group123', false, true, true);
 * ```
 */
export async function changeGroupSettings(
    client: MaxClient, 
    groupId: string, 
    allCanPinMessage: boolean = false, 
    onlyOwnerCanChangeIconTitle: boolean = true, 
    onlyAdminCanAddMember: boolean = true
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.CHANGE_GROUP_SETTINGS, {
        chatId: groupId,
        options: {
            "ONLY_OWNER_CAN_CHANGE_ICON_TITLE": onlyOwnerCanChangeIconTitle,
            "ALL_CAN_PIN_MESSAGE": allCanPinMessage,
            "ONLY_ADMIN_CAN_ADD_MEMBER": onlyAdminCanAddMember
        }
    });
}

/**
 * Присоединение к группе по ссылке
 * 
 * Присоединяется к группе используя хеш ссылки.
 * Автоматически подписывается на чат и загружает сообщения.
 * 
 * @param client - Экземпляр MaxClient
 * @param linkHash - Хеш ссылки для присоединения к группе
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о группе
 * 
 * @example
 * ```typescript
 * const groupInfo = await joinGroupByLink(client, 'abc123def456');
 * console.log('Присоединились к группе:', groupInfo.payload);
 * ```
 */
export async function joinGroupByLink(
    client: MaxClient, 
    linkHash: string
): Promise<RpcResponse> {
    const data = await client.invokeMethod(OPCODES.JOIN_BY_LINK, {
        link: `join/${linkHash}`
    });
    
    const chatId = (data.payload as any).chat.id;
    const cid = (data.payload as any).chat.cid;
    
    // Subscribe to the new chat
    await client.invokeMethod(75, {
        chatId: chatId,
        subscribe: true
    });
    
    // Get messages
    await client.invokeMethod(OPCODES.GET_MESSAGES, {
        chatId: chatId,
        from: cid,
        forward: 0,
        backward: 30,
        getMessages: true
    });
    
    return data;
}

/**
 * Получение информации о группе по ссылке
 * 
 * Получает информацию о группе без присоединения к ней.
 * 
 * @param client - Экземпляр MaxClient
 * @param linkHash - Хеш ссылки группы
 * @returns Promise<RpcResponse> - Ответ от сервера с информацией о группе
 * 
 * @example
 * ```typescript
 * const groupInfo = await resolveGroupByLink(client, 'abc123def456');
 * console.log('Информация о группе:', groupInfo.payload);
 * ```
 */
export async function resolveGroupByLink(
    client: MaxClient, 
    linkHash: string
): Promise<RpcResponse> {
    return await client.invokeMethod(OPCODES.RESOLVE_LINK, {
        link: `join/${linkHash}`
    });
} 