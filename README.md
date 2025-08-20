# vkmax-node

Node.js client for VK MAX messenger (OneMe)

## What is VK MAX?
MAX (internal code name OneMe) is another project by the Russian government in an attempt to create a unified domestic messaging platform with features such as login via the government services account (Gosuslugi/ESIA).  
It is developed by VK Group.  

## What is `vkmax-node`?
This is a Node.js client library for MAX, allowing to create userbots and custom clients.  
An example of a simple userbot that retrieves weather can be found at [examples/weather-userbot.js](examples/weather-userbot.js).

## Installation
```bash
npm install
```

## Usage

### Basic Example
```javascript
import { MaxClient, sendMessage } from './src/index.js';

const client = new MaxClient();

// Connect to WebSocket
await client.connect();

// Send hello packet (required before authentication)
await client._sendHelloPacket();

// Authenticate with SMS
const phoneNumber = '+79001234567';
const smsToken = await client.sendCode(phoneNumber);
const accountData = await client.signIn(smsToken, 123456);

// Send a message
await sendMessage(client, chatId, 'Hello, World!');

// Disconnect
await client.disconnect();
```

### Weather Userbot Example
```bash
npm run example
```

This will start a userbot that responds to:
- `.info` - Shows connection status
- `.weather <city>` - Shows weather for the specified city

## Features

### Authentication
- SMS-based authentication
- Token-based authentication (saves login token to file)
- Automatic keepalive

### Messages
- Send messages
- Edit messages
- Delete messages
- Reply to messages
- Pin messages

### Profile
- Change profile information
- Manage privacy settings
- Control online status visibility

### Users
- Get user information
- Get user status

### Groups
- Join/leave groups
- Get group information
- Manage group members
- Create/delete group chats

### Channels
- Subscribe/unsubscribe to channels
- Get channel posts
- Create/edit/delete channel posts

## API Reference

### MaxClient

#### Methods
- `connect()` - Connect to WebSocket server
- `disconnect()` - Disconnect from server
- `sendCode(phone)` - Send SMS code to phone number
- `signIn(smsToken, smsCode)` - Sign in with SMS code
- `loginByToken(token)` - Login using saved token
- `setCallback(callback)` - Set callback for incoming events
- `invokeMethod(opcode, payload)` - Invoke method on server

#### Properties
- `isLoggedIn` - Check if client is logged in
- `isConnected` - Check if client is connected

### Message Functions
- `sendMessage(client, chatId, text, notify)`
- `editMessage(client, chatId, messageId, text)`
- `deleteMessage(client, chatId, messageIds, deleteForMe)`
- `replyMessage(client, chatId, text, replyToMessageId, notify)`
- `pinMessage(client, chatId, messageId, notify)`

### Profile Functions
- `changeProfile(client, firstName, lastName, bio)`
- `changeOnlineStatusVisibility(client, hidden)`
- `setIsFindableByPhone(client, findable)`
- `setCallsPrivacy(client, canBeCalled)`
- `invitePrivacy(client, invitable)`

## Error Handling

The client throws errors for various conditions:
- Connection errors
- Authentication failures
- Invalid method calls
- Timeout errors

Always wrap your code in try-catch blocks:

```javascript
try {
    await client.connect();
    // ... your code
} catch (error) {
    console.error('Error:', error.message);
}
```

## Event Handling

The client extends EventEmitter and emits various events:

```javascript
client.on('error', (error) => {
    console.error('Client error:', error);
});

client.on('close', () => {
    console.log('Connection closed');
});
```

## License

MIT 