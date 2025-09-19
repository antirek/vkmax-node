/**
 * VK MAX Node.js Client
 * Main entry point and exports
 */

export { MaxClient } from './client.js';

// Export all functions
export * from './functions/messages.js';
export * from './functions/profile.js';
export * from './functions/users.js';
export * from './functions/groups.js';
export * from './functions/channels.js';
export * from './functions/media.js';

// Export constants and types
export * from './constants.js';
export * from './types.js'; 