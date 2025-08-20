import { OPCODES, PRIVACY_SETTINGS } from '../constants.js';

/**
 * Profile functions for VK MAX client
 */

/**
 * Hide or show you last online status
 */
export async function changeOnlineStatusVisibility(client, hidden) {
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, {
        settings: {
            user: {
                HIDDEN: hidden
            }
        }
    });
}

/**
 * You can make your profile findable by phone or not
 */
export async function setIsFindableByPhone(client, findable) {
    const findableValue = findable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, {
        settings: {
            user: {
                SEARCH_BY_PHONE: findableValue
            }
        }
    });
}

/**
 * You can enable or disable calls for everyone
 */
export async function setCallsPrivacy(client, canBeCalled) {
    const canBeCalledValue = canBeCalled ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, {
        settings: {
            user: {
                INCOMING_CALL: canBeCalledValue
            }
        }
    });
}

/**
 * Changes the possibility of inviting you to other chats
 */
export async function invitePrivacy(client, invitable) {
    const invitableValue = invitable ? PRIVACY_SETTINGS.ALL : PRIVACY_SETTINGS.CONTACTS;
    
    return await client.invokeMethod(OPCODES.UPDATE_SETTINGS, {
        settings: {
            user: {
                CHATS_INVITE: invitableValue
            }
        }
    });
} 