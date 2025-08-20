# VK MAX Node.js Client (TypeScript)

Node.js клиент для VK MAX мессенджера (OneMe) с полной поддержкой TypeScript.

## Установка

```bash
npm install
```

## Сборка

```bash
npm run build
```

Для разработки с автоматической пересборкой:

```bash
npm run dev
```

## Использование

### Базовый пример

```typescript
import { MaxClient, sendMessage } from 'vkmax-node';

async function example() {
    const client = new MaxClient();
    
    try {
        // Подключение к WebSocket
        await client.connect();
        
        // Отправка hello пакета (требуется перед аутентификацией)
        await client._sendHelloPacket();
        
        // Аутентификация через SMS
        const phone = '+79001234567';
        const smsToken = await client.sendCode(phone);
        const smsCode = '1234'; // Код из SMS
        await client.signIn(smsToken, smsCode);
        
        // Отправка сообщения
        await sendMessage(client, 'chat_id', 'Привет!');
        
    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await client.disconnect();
    }
}
```

### Аутентификация через токен

```typescript
import { MaxClient } from 'vkmax-node';

async function loginByToken() {
    const client = new MaxClient();
    
    try {
        await client.connect();
        await client.loginByToken('your_saved_token');
        
        console.log('Успешно вошли в систему');
        
    } catch (error) {
        console.error('Ошибка входа:', error);
    }
}
```

### Обработка входящих сообщений

```typescript
import { MaxClient, editMessage } from 'vkmax-node';
import type { RpcResponse } from 'vkmax-node';

async function handleMessages() {
    const client = new MaxClient();
    
    // Установка callback для входящих событий
    await client.setCallback(async (client, packet: RpcResponse) => {
        if (packet.opcode === 128) { // MESSAGE_RECEIVED
            const messageText = (packet.payload as any).message.text;
            const chatId = (packet.payload as any).chatId;
            const messageId = (packet.payload as any).message.id;
            
            if (messageText === '.ping') {
                await editMessage(client, chatId, messageId, 'pong');
            }
        }
    });
    
    // Подключение и аутентификация...
}
```

## API

### MaxClient

Основной класс клиента.

#### Методы

- `connect()` - Подключение к WebSocket серверу
- `disconnect()` - Отключение от сервера
- `sendCode(phone: string)` - Отправка SMS кода на номер телефона
- `signIn(smsToken: string, smsCode: string | number)` - Вход по SMS коду
- `loginByToken(token: string)` - Вход по сохраненному токену
- `setCallback(callback: IncomingEventCallback)` - Установка callback для входящих событий

#### Свойства

- `isLoggedIn: boolean` - Статус входа в систему
- `isConnected: boolean` - Статус подключения

### Функции сообщений

- `sendMessage(client, chatId, text, notify?)` - Отправка сообщения
- `editMessage(client, chatId, messageId, text)` - Редактирование сообщения
- `deleteMessage(client, chatId, messageIds, deleteForMe?)` - Удаление сообщений
- `readMessage(client, chatId, messageId)` - Отметка сообщения как прочитанного
- `getMessages(client, chatId, from?, forward?, backward?)` - Получение сообщений
- `replyMessage(client, chatId, text, replyToMessageId, notify?)` - Ответ на сообщение

### Функции профиля

- `changeOnlineStatusVisibility(client, hidden)` - Скрыть/показать статус онлайн
- `setIsFindableByPhone(client, findable)` - Настройка поиска по номеру телефона
- `setCallsPrivacy(client, canBeCalled)` - Настройка приватности звонков
- `invitePrivacy(client, invitable)` - Настройка приглашений в чаты

### Функции пользователей

- `getContacts(client, contactIds)` - Получение контактов
- `addContact(client, contactId)` - Добавление контакта
- `reactToMessage(client, chatId, messageId, reaction)` - Реакция на сообщение

### Функции групп

- `createGroup(client, groupName, participantIds)` - Создание группы
- `inviteUsers(client, groupId, participantIds, showHistory?)` - Приглашение пользователей
- `removeUsers(client, groupId, participantIds, deleteMessages?)` - Удаление пользователей
- `addAdmin(client, groupId, adminIds, deletingMessages?, controlParticipants?, controlAdmins?)` - Добавление администратора
- `removeAdmin(client, groupId, adminIds)` - Удаление администратора
- `getGroupMembers(client, groupId, marker?, count?)` - Получение участников группы
- `changeGroupSettings(client, groupId, allCanPinMessage?, onlyOwnerCanChangeIconTitle?, onlyAdminCanAddMember?)` - Изменение настроек группы
- `joinGroupByLink(client, linkHash)` - Присоединение к группе по ссылке
- `resolveGroupByLink(client, linkHash)` - Получение информации о группе по ссылке

### Функции каналов

- `resolveChannelUsername(client, username)` - Получение информации о канале по username
- `resolveChannelId(client, channelId)` - Получение информации о канале по ID
- `joinChannel(client, username)` - Присоединение к каналу
- `createChannel(client, channelName)` - Создание канала
- `muteChannel(client, channelId, mute?)` - Отключение уведомлений канала

## Примеры

### Простой пример

```bash
npm run example:simple
```

### Weather Userbot

```bash
npm run example
```

Этот пример демонстрирует создание бота, который отвечает на команды:
- `.info` - показывает статус бота
- `.weather <город>` - показывает погоду в указанном городе

## Типы TypeScript

Проект полностью типизирован с помощью TypeScript. Все функции, классы и интерфейсы имеют строгую типизацию.

### Основные типы

- `MaxClient` - основной класс клиента
- `RpcRequest` / `RpcResponse` - типы для RPC запросов/ответов
- `Message` - тип сообщения
- `IncomingEventCallback` - тип callback для входящих событий

## Константы

- `OPCODES` - коды операций
- `PRIVACY_SETTINGS` - настройки приватности
- `MESSAGE_TYPES` - типы сообщений
- `USER_AGENT` - конфигурация User-Agent

## Требования

- Node.js >= 18.0.0
- TypeScript >= 5.0.0

## Лицензия

MIT 