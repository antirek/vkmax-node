import { OPCODES } from '../constants.js';

/**
 * User functions for VK MAX client
 */

/**
 * Get user info by ID
 */
export async function getUserInfo(client, userId) {
    return await client.invokeMethod(OPCODES.GET_USER_INFO, {
        userId: userId
    });
}

/**
 * Get user status
 */
export async function getUserStatus(client, userId) {
    return await client.invokeMethod(OPCODES.GET_USER_STATUS, {
        userId: userId
    });
} 