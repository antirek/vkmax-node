/**
 * Пример простой загрузки видео через метод MaxClient.uploadAndSendVideo()
 * 
 * Этот пример демонстрирует:
 * - Чтение токена авторизации из файла
 * - Подключение к VK MAX
 * - Загрузку и отправку видео файла одним методом
 * - Обработку ошибок
 */

import { MaxClient } from '../src/index.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID чата Василия для тестирования
const VASILIY_CHAT_ID = 60815114;

async function main() {
    console.log('🎬 Простая загрузка видео через метод MaxClient.uploadAndSendVideo()\n');

    try {
        // Создаем клиент
        const client = new MaxClient();

        // Читаем токен авторизации
        console.log('🔐 Читаем токен и подключаемся...');
        const tokenPath = path.join(__dirname, 'login_token.txt');
        const token = await fs.readFile(tokenPath, 'utf8');
        const cleanToken = token.trim();

        // Подключаемся и авторизуемся
        await client.connect();
        await client.loginByToken(cleanToken);
        console.log('✅ Подключение и авторизация выполнены\n');
        
        // Читаем файл видео
        console.log('📁 Читаем файл test-video.mp4...');
        const videoPath = path.join(__dirname, 'test-video.mp4');
        const videoData = await fs.readFile(videoPath);
        console.log('✅ Файл прочитан:', `${Math.round(videoData.length / 1024 * 100) / 100} KB\n`);
        
        // Загружаем и отправляем видео одним методом
        console.log('🚀 Загружаем и отправляем MP4 видео одним методом...');
        const response = await client.uploadAndSendVideo(
            VASILIY_CHAT_ID,
            videoData,
            'test-video.mp4',
            '🎬 MP4 видео отправлено через uploadAndSendVideo()!'
        );
        
        console.log('✅ УСПЕХ! Видео отправлено!');
        console.log('📨 ID сообщения:', response.payload?.message?.id);
        console.log('🎬 Количество вложений:', response.payload?.message?.attaches?.length || 0);
        
        // Выводим детали видео, если доступны
        const videoAttach = response.payload?.message?.attaches?.[0];
        if (videoAttach && videoAttach._type === 'VIDEO') {
            console.log('🎥 Детали видео:', { 
                type: videoAttach.type, 
                videoId: videoAttach.videoId, 
                width: videoAttach.width, 
                height: videoAttach.height,
                duration: videoAttach.duration
            });
        }
        
        console.log('\n🎉 Готово! Проверьте чат с Василием!');
        
        // Закрываем соединение
        client.disconnect();
        
    } catch (error) {
        console.error('❌ Ошибка:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

// Запускаем основную функцию
main().catch(console.error);
