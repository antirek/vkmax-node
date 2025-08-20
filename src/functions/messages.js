import { OPCODES, generateRandomId } from '../constants.js';

/**
 * Message functions for VK MAX client
 */

/**
 * Send message to specified chat
 */
export async function sendMessage(client, chatId, text, notify = true) {
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, {
        chatId: chatId,
        message: {
            text: text,
            cid: generateRandomId(),
            elements: [],
            attaches: []
        },
        notify: notify
    });
}

/**
 * Edit the specified message
 */
export async function editMessage(client, chatId, messageId, text) {
    return await client.invokeMethod(OPCODES.EDIT_MESSAGE, {
        chatId: chatId,
        messageId: String(messageId),
        text: text,
        elements: [],
        attachments: []
    });
}

/**
 * Delete the specified message
 */
export async function deleteMessage(client, chatId, messageIds, deleteForMe = false) {
    return await client.invokeMethod(OPCODES.DELETE_MESSAGE, {
        chatId: chatId,
        messageIds: messageIds,
        forMe: deleteForMe
    });
}

/**
 * Pin message in the chat
 */
export async function pinMessage(client, chatId, messageId, notify = false) {
    return await client.invokeMethod(OPCODES.PIN_MESSAGE, {
        chatId: chatId,
        notifyPin: notify,
        pinMessageId: String(messageId)
    });
}

/**
 * Reply to message in the chat
 */
export async function replyMessage(client, chatId, text, replyToMessageId, notify = true) {
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, {
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
    });
} 