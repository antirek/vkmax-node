/**
 * Интерактивный пример использования двухфакторной аутентификации (2FA) в VK MAX
 * 
 * Демонстрирует интерактивный процесс авторизации:
 * 1. Запрос номера телефона у пользователя
 * 2. Отправка SMS кода
 * 3. Ввод SMS кода пользователем
 * 4. Автоматическое определение необходимости 2FA
 * 5. Ввод дополнительного пароля (если требуется 2FA)
 * 6. Отправка тестового сообщения (опционально)
 * 
 * Запуск: npm run example:2fa
 */

import { MaxClient } from '../src/index.js';
import * as readline from 'readline';

/**
 * Создает readline интерфейс для получения пользовательского ввода
 */
function createReadlineInterface(): readline.Interface {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Получает пользовательский ввод с вопросом
 */
function getUserInput(rl: readline.Interface, question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

/**
 * Закрывает readline интерфейс
 */
function closeReadline(rl: readline.Interface): void {
    rl.close();
}

async function example2FA() {
    const client = new MaxClient();
    const rl = createReadlineInterface();
    
    try {
        console.log('🚀 Добро пожаловать в интерактивный пример 2FA для VK MAX!');
        console.log('='.repeat(60));
        
        // Подключение к WebSocket
        console.log('🔌 Подключаемся к VK MAX...');
        await client.connect();
        
        // Отправляем hello пакет
        await client._sendHelloPacket();
        console.log('✅ Подключение установлено');
        
        // Получаем номер телефона от пользователя
        const phone = await getUserInput(rl, '\n📱 Введите номер телефона в международном формате (например, +79001234567): ');
        
        if (!phone.startsWith('+')) {
            console.log('❌ Номер телефона должен начинаться с +');
            closeReadline(rl);
            return;
        }
        
        console.log(`\n📤 Отправляем SMS код на номер ${phone}...`);
        
        try {
            // Шаг 1: Отправляем SMS код
            const smsToken = await client.sendCode(phone);
            console.log('✅ SMS код отправлен!');
            
            // Получаем SMS код от пользователя
            const smsCode = await getUserInput(rl, '\n🔢 Введите SMS код, который пришел на ваш телефон: ');
            
            if (!smsCode || smsCode.length < 4) {
                console.log('❌ SMS код должен содержать минимум 4 цифры');
                closeReadline(rl);
                return;
            }
            
            // Шаг 2: Подтверждаем SMS код
            console.log('\n🔐 Подтверждаем SMS код...');
            const smsResponse = await client.signIn(smsToken, smsCode);
            
            // Проверяем, требуется ли 2FA
            const responsePayload = smsResponse.payload;
            if (responsePayload.passwordChallenge) {
                console.log('\n🔐 Обнаружена двухфакторная аутентификация (2FA)!');
                console.log(`💡 Подсказка для пароля: ${responsePayload.passwordChallenge.hint}`);
                console.log(`📧 Email: ${responsePayload.passwordChallenge.email}`);
                console.log(`🆔 TrackId: ${responsePayload.passwordChallenge.trackId}`);
                
                // Получаем пароль от пользователя
                const password = await getUserInput(rl, '\n🔑 Введите дополнительный пароль: ');
                
                if (!password) {
                    console.log('❌ Пароль не может быть пустым');
                    closeReadline(rl);
                    return;
                }
                
                // Шаг 3: Подтверждаем пароль для 2FA
                console.log('\n🔐 Подтверждаем дополнительный пароль...');
                const passwordResponse = await client.verifyPassword(
                    responsePayload.passwordChallenge.trackId, 
                    password
                );
                
                console.log('\n✅ Успешно вошли в систему с 2FA!');
                console.log('📊 Данные профиля:', passwordResponse.payload.profile);
                
            } else {
                console.log('\n✅ Вход без 2FA успешен!');
                console.log('📊 Данные профиля:', responsePayload.profile);
            }
            
            // Предлагаем отправить тестовое сообщение
            const sendMessage = await getUserInput(rl, '\n📤 Хотите отправить тестовое сообщение? (y/n): ');
            
            if (sendMessage.toLowerCase() === 'y' || sendMessage.toLowerCase() === 'yes') {
                const chatIdInput = await getUserInput(rl, 'Введите ID чата для отправки сообщения (например, 60815114): ');
                const chatId = parseInt(chatIdInput);
                
                if (isNaN(chatId)) {
                    console.log('❌ ID чата должен быть числом');
                    closeReadline(rl);
                    return;
                } else {
                    try {
                        await client.invokeMethod(64, { // SEND_MESSAGE opcode
                            chatId: chatId,
                            message: {
                                text: 'Привет! Это тестовое сообщение с поддержкой 2FA! 🔐',
                                cid: Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000),
                                elements: [],
                                attaches: []
                            },
                            notify: true
                        });
                        console.log('✅ Тестовое сообщение отправлено успешно!');
                    } catch (error) {
                        console.error('❌ Ошибка отправки сообщения:', error);
                    }
                }
            }
            
        } catch (error) {
            console.error('\n❌ Ошибка авторизации:', error instanceof Error ? error.message : String(error));
            
            // Предлагаем попробовать снова
            const retry = await getUserInput(rl, '\n🔄 Хотите попробовать еще раз? (y/n): ');
            if (retry.toLowerCase() === 'y' || retry.toLowerCase() === 'yes') {
                console.log('\n🔄 Перезапускаем процесс...');
                // Закрываем текущий интерфейс и создаем новый
                closeReadline(rl);
                await example2FA();
                return;
            }
        }
        
    } catch (error) {
        console.error('\n❌ Общая ошибка:', error);
    } finally {
        // Отключение
        if (client.isConnected) {
            console.log('\n🔌 Отключаемся от сервера...');
            await client.disconnect();
        }
        
        // Закрываем readline интерфейс
        closeReadline(rl);
        console.log('\n👋 Спасибо за использование примера 2FA!');
    }
}

// Запуск примера
if (import.meta.url === `file://${process.argv[1]}`) {
    example2FA().catch(console.error);
}

export { example2FA };
