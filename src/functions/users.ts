import { OPCODES } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse } from '../types.js';

/**
 * User functions for VK MAX client
 */

/**
 * Get contacts
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
 * Add contact
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
 * React to message
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