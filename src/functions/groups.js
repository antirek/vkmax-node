import { OPCODES, generateRandomId } from '../constants.js';

/**
 * Group functions for VK MAX client
 */

/**
 * Create group
 */
export async function createGroup(client, groupName, participantIds) {
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
 * Invite users to group
 */
export async function inviteUsers(client, groupId, participantIds, showHistory = true) {
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: participantIds,
        showHistory: showHistory,
        operation: "add"
    });
}

/**
 * Remove users from group
 */
export async function removeUsers(client, groupId, participantIds, deleteMessages = false) {
    const deleteMessagesValue = deleteMessages ? -1 : 0;
    
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: participantIds,
        operation: "remove",
        cleanMsgPeriod: deleteMessagesValue
    });
}

/**
 * Add admin to group
 */
export async function addAdmin(client, groupId, adminIds, deletingMessages = false, controlParticipants = false, controlAdmins = false) {
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
 * Remove admin from group
 */
export async function removeAdmin(client, groupId, adminIds) {
    return await client.invokeMethod(OPCODES.MANAGE_USERS, {
        chatId: groupId,
        userIds: adminIds,
        type: "ADMIN",
        operation: "remove"
    });
}

/**
 * Get group members
 */
export async function getGroupMembers(client, groupId, marker = 0, count = 500) {
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
 * Change group settings
 */
export async function changeGroupSettings(client, groupId, allCanPinMessage = false, onlyOwnerCanChangeIconTitle = true, onlyAdminCanAddMember = true) {
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
 * Join group by link
 */
export async function joinGroupByLink(client, linkHash) {
    const data = await client.invokeMethod(OPCODES.JOIN_BY_LINK, {
        link: `join/${linkHash}`
    });
    
    const chatId = data.payload.chat.id;
    const cid = data.payload.chat.cid;
    
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
 * Resolve group by link
 */
export async function resolveGroupByLink(client, linkHash) {
    return await client.invokeMethod(OPCODES.RESOLVE_LINK, {
        link: `join/${linkHash}`
    });
} 