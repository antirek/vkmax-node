import { OPCODES, generateRandomId } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse } from '../types.js';

/**
 * Channel functions for VK MAX client
 */

/**
 * Resolve channel by username
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
 * Resolve channel by ID
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
 * Join channel by username
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
 * Create channel
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
 * Mute or unmute channel
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