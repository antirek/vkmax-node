import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { MaxClient } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID чата с Василием
const VASILIY_CHAT_ID = 60815114;

/**
 * Простой пример загрузки фото одним методом
 */
async function simplePhotoUpload() {
    console.log('📸 Простая загрузка фото через метод MaxClient.uploadAndSendPhoto()\n');
    
    const client = new MaxClient();
    
    try {
        // Читаем токен авторизации
        console.log('🔐 Читаем токен и подключаемся...');
        const tokenPath = path.join(__dirname, 'login_token.txt');
        const token = await fs.readFile(tokenPath, 'utf-8');
        const cleanToken = token.trim();
        
        // Подключаемся и авторизуемся
        await client.connect();
        await client.loginByToken(cleanToken);
        console.log('✅ Подключение и авторизация выполнены\n');
        
        // Читаем файл фото
        console.log('📁 Читаем файл test-photo.png...');
        const photoPath = path.join(__dirname, 'test-photo.png');
        const photoData = await fs.readFile(photoPath);
        console.log('✅ Файл прочитан:', `${Math.round(photoData.length / 1024 * 100) / 100} KB\n`);
        
        // Загружаем и отправляем фото одним методом
        console.log('🚀 Загружаем и отправляем PNG фото одним методом...');
        const response = await client.uploadAndSendPhoto(
            VASILIY_CHAT_ID,
            photoData,
            'test-photo.png',
            '🖼️ PNG фото отправлено через uploadAndSendPhoto()!'
        );
        
        console.log('✅ УСПЕХ! Фото отправлено!');
        console.log('📨 ID сообщения:', response.payload?.message?.id);
        console.log('📷 Количество вложений:', response.payload?.message?.attaches?.length || 0);
        
        if (response.payload?.message?.attaches?.[0]) {
            const attach = response.payload.message.attaches[0];
            console.log('🖼️ Детали фото:', {
                type: attach._type,
                photoId: attach.photoId,
                width: attach.width,
                height: attach.height
            });
        }
        
        console.log('\n🎉 Готово! Проверьте чат с Василием!');
        
    } catch (error) {
        console.error('❌ Ошибка:', error instanceof Error ? error.message : String(error));
    } finally {
        if (client.isConnected) {
            client.disconnect();
        }
    }
}

// Запускаем пример
simplePhotoUpload().catch(console.error);
