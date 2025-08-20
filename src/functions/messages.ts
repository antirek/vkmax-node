import { OPCODES, generateRandomId } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse, SendMessagePayload, EditMessagePayload, DeleteMessagePayload, ReadMessagePayload, GetMessagesPayload } from '../types.js';

/**
 * Message functions for VK MAX client
 */

/**
 * Send message to specified chat
 */
export async function sendMessage(
    client: MaxClient, 
    chatId: string, 
    text: string, 
    notify: boolean = true
): Promise<RpcResponse> {
    const payload: SendMessagePayload = {
        chatId: chatId,
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
 * Edit the specified message
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
 * Delete the specified message
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
 * Read message
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
 * Get messages from chat
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
 * Reply to message in the chat
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