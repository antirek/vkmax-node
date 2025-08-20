import { OPCODES } from '../constants.js';

/**
 * User functions for VK MAX client
 */

/**
 * Get contacts
 */
export async function getContacts(client, contactIds) {
    return await client.invokeMethod(OPCODES.GET_CONTACTS, {
        contactIds: contactIds
    });
}

/**
 * Add contact
 */
export async function addContact(client, contactId) {
    return await client.invokeMethod(OPCODES.ADD_CONTACT, {
        contactId: contactId,
        action: "ADD"
    });
}

/**
 * React to message
 */
export async function reactToMessage(client, chatId, messageId, reaction) {
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