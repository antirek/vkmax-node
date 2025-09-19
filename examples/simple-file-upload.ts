/**
 * Пример простой загрузки файла через метод MaxClient.uploadAndSendFile()
 * 
 * Этот пример демонстрирует:
 * - Чтение токена авторизации из файла
 * - Подключение к VK MAX
 * - Загрузку и отправку файла одним методом
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
    console.log('📄 Простая загрузка файла через метод MaxClient.uploadAndSendFile()\n');

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
        
        // Читаем файл документа
        console.log('📁 Читаем файл test-document.pdf...');
        const filePath = path.join(__dirname, 'test-document.pdf');
        const fileData = await fs.readFile(filePath);
        console.log('✅ Файл прочитан:', `${Math.round(fileData.length / 1024 * 100) / 100} KB\n`);
        
        // Загружаем и отправляем файл одним методом
        console.log('🚀 Загружаем и отправляем PDF файл одним методом...');
        const response = await client.uploadAndSendFile(
            VASILIY_CHAT_ID,
            fileData,
            'test-document.pdf'
        );
        
        console.log('✅ УСПЕХ! Файл отправлен!');
        console.log('📨 ID сообщения:', response.payload?.message?.id);
        console.log('📎 Количество вложений:', response.payload?.message?.attaches?.length || 0);
        
        // Выводим детали файла, если доступны
        const fileAttach = response.payload?.message?.attaches?.[0];
        if (fileAttach && fileAttach._type === 'FILE') {
            console.log('📋 Детали файла:', { 
                _type: fileAttach._type, 
                fileId: fileAttach.fileId, 
                name: fileAttach.name,
                size: fileAttach.size,
                token: fileAttach.token ? `${fileAttach.token.substring(0, 20)}...` : undefined
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
