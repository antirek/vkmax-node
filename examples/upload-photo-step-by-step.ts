import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { MaxClient, OPCODES, generateRandomId } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID чата с Василием
const VASILIY_CHAT_ID = 60815114;

/**
 * Пошаговый пример загрузки фото
 */
async function uploadPhotoStepByStep() {
    console.log('📋 Начинаем пошаговую загрузку фото...\n');
    
    // Шаг 1: Создаем клиент
    console.log('1️⃣ Создаем MaxClient...');
    const client = new MaxClient();
    console.log('✅ MaxClient создан\n');
    
    // Шаг 2: Читаем токен авторизации
    console.log('2️⃣ Читаем токен авторизации из login_token.txt...');
    try {
        const tokenPath = path.join(__dirname, 'login_token.txt');
        const token = await fs.readFile(tokenPath, 'utf-8');
        const cleanToken = token.trim();
        console.log('✅ Токен прочитан:', cleanToken.substring(0, 20) + '...\n');
        
        // Шаг 3: Подключаемся к серверу
        console.log('3️⃣ Подключаемся к серверу...');
        await client.connect();
        console.log('✅ Подключение установлено\n');
        
        // Шаг 4: Авторизуемся
        console.log('4️⃣ Авторизуемся по токену...');
        await client.loginByToken(cleanToken);
        console.log('✅ Авторизация успешна\n');
        
        // Шаг 5: Проверяем файл фото
        console.log('5️⃣ Проверяем файл test-photo.jpg...');
        const photoPath = path.join(__dirname, 'test-photo.jpg');
        
        try {
            const stats = await fs.stat(photoPath);
            console.log('✅ Файл найден:', {
                размер: `${Math.round(stats.size / 1024 * 100) / 100} KB`,
                путь: photoPath
            });
        } catch (error) {
            console.log('❌ Файл test-photo.jpg не найден');
            console.log('💡 Создаем тестовый файл...');
            
            // Создаем тестовое изображение если его нет
            const { execSync } = await import('child_process');
            try {
                execSync(`convert -size 300x200 -background lightblue -fill darkblue -gravity center -pointsize 24 label:"VK MAX\\nTest Photo\\n$(date '+%Y-%m-%d')" "${photoPath}"`);
                console.log('✅ Тестовое изображение создано');
            } catch (convertError) {
                console.log('❌ Не удалось создать изображение с помощью ImageMagick');
                console.log('💡 Создаем простой текстовый файл как заглушку...');
                await fs.writeFile(photoPath, 'Test photo content');
            }
        }
        
        // Шаг 6: Читаем файл фото
        console.log('6️⃣ Читаем файл фото...');
        const photoData = await fs.readFile(photoPath);
        console.log('✅ Файл прочитан:', {
            размер: `${Math.round(photoData.length / 1024 * 100) / 100} KB`,
            байт: photoData.length
        });
        console.log('');

        // Шаг 7: Запрашиваем URL для загрузки (opcode 80)
        console.log('7️⃣ Запрашиваем URL для загрузки файла...');
        const uploadUrlResponse = await client.invokeMethod(OPCODES.REQUEST_UPLOAD_URL, { count: 1 });
        
        if (!uploadUrlResponse.payload?.url) {
            throw new Error('Не удалось получить URL для загрузки');
        }
        
        const uploadUrl = uploadUrlResponse.payload.url;
        console.log('✅ URL получен:', uploadUrl.substring(0, 50) + '...');
        
        // Извлекаем параметры из URL
        const urlObj = new URL(uploadUrl);
        const apiToken = urlObj.searchParams.get('apiToken');
        const photoIds = urlObj.searchParams.get('photoIds');
        console.log('✅ Параметры извлечены:', {
            hasApiToken: !!apiToken,
            hasPhotoIds: !!photoIds
        });
        console.log('');

        // Шаг 8: Загружаем файл через HTTP
        console.log('8️⃣ Загружаем файл на сервер...');
        
        // Создаем Blob из данных файла (как в браузере)
        const blob = new Blob([photoData as any], { type: 'image/jpeg' });
        
        // Создаем FormData
        const formData = new FormData();
        formData.append('file', blob, 'test-photo.jpg');
        
        // Отправляем HTTP запрос
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`HTTP ошибка: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }
        
        const uploadResult = await uploadResponse.json();
        console.log('✅ Файл загружен на сервер!');
        console.log('📊 Результат загрузки:', uploadResult);
        
        // Извлекаем данные фото
        const photoKey = Object.keys(uploadResult.photos || {})[0];
        const photoToken = uploadResult.photos?.[photoKey]?.token;
        
        if (!photoKey || !photoToken) {
            throw new Error('Не удалось получить photoKey или photoToken из ответа сервера');
        }
        
        console.log('✅ Данные фото получены:', {
            photoKey: photoKey.substring(0, 20) + '...',
            hasToken: !!photoToken
        });
        console.log('');

        // Шаг 9: Отправляем сообщение с фото
        console.log('9️⃣ Отправляем сообщение с фото Василию...');
        
        const messagePayload = {
            chatId: VASILIY_CHAT_ID,
            message: {
                text: '📷 Фото загружено пошагово через наш Node.js клиент!',
                cid: generateRandomId(),
                elements: [],
                attaches: [{
                    _type: 'PHOTO',
                    type: 'PHOTO',
                    photoId: photoKey,
                    photoToken: photoToken,
                    width: 300,
                    height: 200,
                    baseUrl: `https://i.oneme.ru/i?r=${photoKey}`
                }]
            },
            notify: true
        };
        
        const sendResponse = await client.invokeMethod(OPCODES.SEND_MESSAGE, messagePayload);
        console.log('✅ Сообщение с фото отправлено!');
        console.log('📨 Ответ сервера:', {
            success: sendResponse.payload ? 'Да' : 'Нет',
            hasAttaches: sendResponse.payload?.message?.attaches?.length > 0
        });
        
        console.log('\n🎉 ВСЕ ШАГИ ВЫПОЛНЕНЫ УСПЕШНО!');
        console.log('📱 Проверьте чат с Василием - там должно появиться новое фото!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error instanceof Error ? error.message : String(error));
    } finally {
        // Шаг 10: Закрываем соединение
        console.log('🔟 Закрываем соединение...');
        if (client.isConnected) {
            client.disconnect();
        }
        console.log('✅ Соединение закрыто');
    }
}

// Запускаем пример
uploadPhotoStepByStep().catch(console.error);
