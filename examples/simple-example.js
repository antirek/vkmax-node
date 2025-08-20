import { MaxClient, sendMessage } from '../src/index.js';

/**
 * Simple example of using VK MAX client
 */
async function simpleExample() {
    const client = new MaxClient();

    try {
        // Connect to WebSocket
        await client.connect();
        console.log('Connected to VK MAX');

        // Example: Send hello packet (required before authentication)
        await client._sendHelloPacket();
        console.log('Hello packet sent');

        // Note: In a real application, you would need to authenticate first
        // using either SMS code or saved token
        
        console.log('Example completed');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.disconnect();
    }
}

// Run the example
simpleExample().catch(console.error); 