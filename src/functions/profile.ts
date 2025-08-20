import { OPCODES, PRIVACY_SETTINGS } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { RpcResponse, SettingsPayload } from '../types.js';

/**
 * Profile functions for VK MAX client
 */

/**
 * Hide or show you last online status
 */
export async function changeOnlineStatusVisibility(
    client: MaxClient, 
    hidden: boolean
): Promise<RpcResponse> {
    const payload: SettingsPayload = {
        settings: {
            user: {
                HIDDEN: hidden
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * You can make your profile findable by phone or not
 */
export async function setIsFindableByPhone(
    client: MaxClient, 
    findable: boolean
): Promise<RpcResponse> {
    const findableValue = findable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                SEARCH_BY_PHONE: findableValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * You can enable or disable calls for everyone
 */
export async function setCallsPrivacy(
    client: MaxClient, 
    canBeCalled: boolean
): Promise<RpcResponse> {
    const canBeCalledValue = canBeCalled ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                INCOMING_CALL: canBeCalledValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
}

/**
 * Changes the possibility of inviting you to other chats
 */
export async function invitePrivacy(
    client: MaxClient, 
    invitable: boolean
): Promise<RpcResponse> {
    const invitableValue = invitable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    const payload: SettingsPayload = {
        settings: {
            user: {
                CHATS_INVITE: invitableValue
            }
        }
    };
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, payload);
} 