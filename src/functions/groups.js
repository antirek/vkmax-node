import { OPCODES } from '../constants.js';

/**
 * Group functions for VK MAX client
 */

/**
 * Get group info
 */
export async function getGroupInfo(client, groupId) {
    return await client.invokeMethod(OPCODES.GET_GROUP_INFO, {
        groupId: groupId
    });
}

/**
 * Join group
 */
export async function joinGroup(client, groupId) {
    return await client.invokeMethod(OPCODES.JOIN_GROUP, {
        groupId: groupId
    });
}

/**
 * Leave group
 */
export async function leaveGroup(client, groupId) {
    return await client.invokeMethod(OPCODES.LEAVE_GROUP, {
        groupId: groupId
    });
}

/**
 * Get group members
 */
export async function getGroupMembers(client, groupId, offset = 0, count = 50) {
    return await client.invokeMethod(OPCODES.GET_GROUP_MEMBERS, {
        groupId: groupId,
        offset: offset,
        count: count
    });
}

/**
 * Invite user to group
 */
export async function inviteUserToGroup(client, groupId, userId) {
    return await client.invokeMethod(OPCODES.INVITE_USER_TO_GROUP, {
        groupId: groupId,
        userId: userId
    });
}

/**
 * Remove user from group
 */
export async function removeUserFromGroup(client, groupId, userId) {
    return await client.invokeMethod(OPCODES.REMOVE_USER_FROM_GROUP, {
        groupId: groupId,
        userId: userId
    });
}

/**
 * Change group settings
 */
export async function changeGroupSettings(client, groupId, settings) {
    return await client.invokeMethod(OPCODES.CHANGE_GROUP_SETTINGS, {
        groupId: groupId,
        settings: settings
    });
}

/**
 * Get group chats
 */
export async function getGroupChats(client, groupId) {
    return await client.invokeMethod(OPCODES.GET_GROUP_CHATS, {
        groupId: groupId
    });
}

/**
 * Create group chat
 */
export async function createGroupChat(client, groupId, title, description = "") {
    return await client.invokeMethod(OPCODES.CREATE_GROUP_CHAT, {
        groupId: groupId,
        title: title,
        description: description
    });
}

/**
 * Delete group chat
 */
export async function deleteGroupChat(client, groupId, chatId) {
    return await client.invokeMethod(OPCODES.DELETE_GROUP_CHAT, {
        groupId: groupId,
        chatId: chatId
    });
} 