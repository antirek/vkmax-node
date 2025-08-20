import { OPCODES } from '../constants.js';

/**
 * Channel functions for VK MAX client
 */

/**
 * Get channel info
 */
export async function getChannelInfo(client, channelId) {
    return await client.invokeMethod(OPCODES.GET_CHANNEL_INFO, {
        channelId: channelId
    });
}

/**
 * Subscribe to channel
 */
export async function subscribeToChannel(client, channelId) {
    return await client.invokeMethod(OPCODES.SUBSCRIBE_TO_CHANNEL, {
        channelId: channelId
    });
}

/**
 * Unsubscribe from channel
 */
export async function unsubscribeFromChannel(client, channelId) {
    return await client.invokeMethod(OPCODES.UNSUBSCRIBE_FROM_CHANNEL, {
        channelId: channelId
    });
}

/**
 * Get channel posts
 */
export async function getChannelPosts(client, channelId, offset = 0, count = 20) {
    return await client.invokeMethod(OPCODES.GET_CHANNEL_POSTS, {
        channelId: channelId,
        offset: offset,
        count: count
    });
}

/**
 * Get channel subscribers
 */
export async function getChannelSubscribers(client, channelId, offset = 0, count = 50) {
    return await client.invokeMethod(OPCODES.GET_CHANNEL_SUBSCRIBERS, {
        channelId: channelId,
        offset: offset,
        count: count
    });
}

/**
 * Create channel post
 */
export async function createChannelPost(client, channelId, text, attachments = []) {
    return await client.invokeMethod(OPCODES.CREATE_CHANNEL_POST, {
        channelId: channelId,
        text: text,
        attachments: attachments
    });
}

/**
 * Edit channel post
 */
export async function editChannelPost(client, channelId, postId, text, attachments = []) {
    return await client.invokeMethod(OPCODES.EDIT_CHANNEL_POST, {
        channelId: channelId,
        postId: postId,
        text: text,
        attachments: attachments
    });
}

/**
 * Delete channel post
 */
export async function deleteChannelPost(client, channelId, postId) {
    return await client.invokeMethod(OPCODES.DELETE_CHANNEL_POST, {
        channelId: channelId,
        postId: postId
    });
} 