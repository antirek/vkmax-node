import { OPCODES, generateRandomId } from '../constants.js';

/**
 * Channel functions for VK MAX client
 */

/**
 * Resolve channel by username
 */
export async function resolveChannelUsername(client, username) {
    return await client.invokeMethod(OPCODES.RESOLVE_LINK, {
        link: `https://max.ru/${username}`
    });
}

/**
 * Resolve channel by ID
 */
export async function resolveChannelId(client, channelId) {
    return await client.invokeMethod(48, {
        chatIds: [channelId]
    });
}

/**
 * Join channel by username
 */
export async function joinChannel(client, username) {
    return await client.invokeMethod(OPCODES.JOIN_BY_LINK, {
        link: `https://max.ru/${username}`
    });
}

/**
 * Create channel
 */
export async function createChannel(client, channelName) {
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
 * Mute or unmute channel
 */
export async function muteChannel(client, channelId, mute = true) {
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