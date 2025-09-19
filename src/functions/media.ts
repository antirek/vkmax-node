import { OPCODES, UPLOAD_ENDPOINTS, getMediaTypeFromMime, validateFileSize } from '../constants.js';
import type { MaxClient } from '../client.js';
import type { 
    RpcResponse, 
    MediaFile, 
    ImageUploadResponse, 
    FileUploadResponse,
    MediaAttachment,
    SendMessagePayload,
    Message,
    UploadUrlResponse
} from '../types.js';

/**
 * Функции для работы с медиафайлами в VK MAX
 */

/**
 * Запрос URL для загрузки медиафайла
 * 
 * Отправляет запрос на сервер VK MAX для получения URL и параметров
 * для загрузки медиафайла. Это первый шаг в процессе отправки медиа.
 * 
 * @param client - Экземпляр MaxClient
 * @param mediaFile - Медиафайл для загрузки
 * @returns Promise<UploadUrlResponse> - URL и параметры для загрузки
 * @throws {Error} Если не подключен или не авторизован
 * 
 * @example
 * ```typescript
 * const mediaFile = await createMediaFileFromPath('/path/to/image.jpg');
 * const uploadInfo = await requestUploadUrl(client, mediaFile);
 * 
 * console.log('URL для загрузки:', uploadInfo.uploadUrl);
 * console.log('Параметры:', uploadInfo.uploadParams);
 * ```
 */
export async function requestUploadUrl(
    client: MaxClient,
    _mediaFile: MediaFile,
    _chatId: string | number
): Promise<UploadUrlResponse> {
    if (!client.isConnected) {
        throw new Error("WebSocket not connected. Call .connect() first.");
    }
    
    if (!client.isLoggedIn) {
        throw new Error("Not logged in. Call .loginByToken() or .signIn() first.");
    }

    const payload = {
        count: 1
    };

    try {
        // Пробуем разные opcodes для запроса URL загрузки
        // Начинаем с предполагаемого opcode 65
        const response = await client.invokeMethod(OPCODES.REQUEST_UPLOAD_URL, payload);
        
        // Парсим ответ и извлекаем URL и параметры
        const responsePayload = response.payload as any;
        
        if (responsePayload.error) {
            throw new Error(`Server error: ${responsePayload.error}`);
        }
        
        // Проверяем, что получили URL
        if (!responsePayload.url) {
            throw new Error('Invalid server response: missing upload URL');
        }
        
        // Парсим URL и извлекаем параметры
        const url = new URL(responsePayload.url);
        const uploadParams: any = {};
        
        // Извлекаем все параметры из URL
        for (const [key, value] of url.searchParams.entries()) {
            uploadParams[key] = decodeURIComponent(value);
        }
        
        return {
            uploadUrl: `${url.protocol}//${url.host}${url.pathname}`,
            uploadParams: uploadParams,
            fileId: responsePayload.fileId || responsePayload.photoId,
            error: responsePayload.error
        };
        
    } catch (error) {
        console.error('Request upload URL error:', error);
        return {
            uploadUrl: '',
            uploadParams: {},
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Загрузка изображения на сервер VK MAX
 * 
 * Загружает изображение через специальный endpoint для изображений.
 * Поддерживает форматы: JPEG, PNG, GIF, WebP, BMP, TIFF.
 * 
 * @param client - Экземпляр MaxClient
 * @param mediaFile - Медиафайл для загрузки
 * @param apiToken - API токен для аутентификации
 * @param photoIds - ID фотографий (получается от сервера)
 * @returns Promise<ImageUploadResponse> - Результат загрузки
 * @throws {Error} Если файл не является изображением
 * @throws {Error} Если размер файла превышает лимит
 * 
 * @example
 * ```typescript
 * const imageFile: MediaFile = {
 *   type: 'image',
 *   data: imageBuffer,
 *   filename: 'photo.jpg',
 *   mimeType: 'image/jpeg',
 *   size: imageBuffer.length
 * };
 * 
 * const result = await uploadImage(client, imageFile, apiToken, photoIds);
 * if (result.success) {
 *   console.log('Изображение загружено:', result.imageId);
 * }
 * ```
 */
export async function uploadImage(
    _client: MaxClient,
    mediaFile: MediaFile,
    apiToken: string,
    photoIds: string
): Promise<ImageUploadResponse> {
    if (mediaFile.type !== 'image') {
        throw new Error('File is not an image');
    }

    if (!validateFileSize(mediaFile.size, 'image')) {
        throw new Error('Image file size exceeds limit (10MB)');
    }

    try {
        // Создаем FormData для multipart/form-data запроса
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        
        form.append('file', Buffer.from(mediaFile.data), {
            filename: mediaFile.filename,
            contentType: mediaFile.mimeType
        });

        // Выполняем HTTP запрос
        const response = await fetch(`${UPLOAD_ENDPOINTS.IMAGES}?apiToken=${encodeURIComponent(apiToken)}&photoIds=${encodeURIComponent(photoIds)}`, {
            method: 'POST',
            body: form as any
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        return {
            success: true,
            imageId: result.id || result.photoId,
            url: result.url || result.link,
            error: result.error
        };
    } catch (error) {
        console.error('Image upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Загрузка файла на сервер VK MAX
 * 
 * Загружает файл через универсальный endpoint для файлов.
 * Поддерживает документы, видео, аудио и другие типы файлов.
 * 
 * @param client - Экземпляр MaxClient
 * @param mediaFile - Медиафайл для загрузки
 * @param sig - Подпись для авторизации
 * @param expires - Время истечения
 * @param clientType - Тип клиента
 * @param id - ID
 * @param userId - ID пользователя
 * @returns Promise<FileUploadResponse> - Результат загрузки
 * @throws {Error} Если размер файла превышает лимит
 * 
 * @example
 * ```typescript
 * const documentFile: MediaFile = {
 *   type: 'document',
 *   data: fileBuffer,
 *   filename: 'document.pdf',
 *   mimeType: 'application/pdf',
 *   size: fileBuffer.length
 * };
 * 
 * const result = await uploadFile(client, documentFile, sig, expires, 6, id, userId);
 * if (result.success) {
 *   console.log('Файл загружен:', result.fileId);
 * }
 * ```
 */
export async function uploadFile(
    _client: MaxClient,
    mediaFile: MediaFile,
    sig: string,
    expires: number,
    clientType: number,
    id: number,
    userId: number
): Promise<FileUploadResponse> {
    if (!validateFileSize(mediaFile.size, mediaFile.type)) {
        const limits = {
            image: '10MB',
            video: '100MB', 
            audio: '50MB',
            document: '4GB'
        };
        throw new Error(`File size exceeds limit (${limits[mediaFile.type]})`);
    }

    try {
        // Создаем FormData для multipart/form-data запроса
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        
        form.append('file', Buffer.from(mediaFile.data), {
            filename: mediaFile.filename,
            contentType: mediaFile.mimeType
        });

        // Строим URL с параметрами
        const url = new URL(UPLOAD_ENDPOINTS.FILES);
        url.searchParams.append('sig', sig);
        url.searchParams.append('expires', expires.toString());
        url.searchParams.append('clientType', clientType.toString());
        url.searchParams.append('id', id.toString());
        url.searchParams.append('userId', userId.toString());

        // Выполняем HTTP запрос
        const response = await fetch(url.toString(), {
            method: 'POST',
            body: form as any
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        return {
            success: true,
            fileId: result.id || result.fileId,
            url: result.url || result.link,
            size: mediaFile.size,
            error: result.error
        };
    } catch (error) {
        console.error('File upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Автоматическая загрузка медиафайла
 * 
 * Автоматически определяет тип файла и использует соответствующий метод загрузки.
 * Для изображений использует uploadImage, для остальных файлов - uploadFile.
 * 
 * @param client - Экземпляр MaxClient  
 * @param mediaFile - Медиафайл для загрузки
 * @param uploadParams - Параметры для загрузки (зависят от типа файла)
 * @returns Promise<ImageUploadResponse | FileUploadResponse> - Результат загрузки
 * 
 * @example
 * ```typescript
 * const file: MediaFile = {
 *   type: 'image',
 *   data: buffer,
 *   filename: 'photo.jpg',
 *   mimeType: 'image/jpeg',
 *   size: buffer.length
 * };
 * 
 * const result = await uploadMedia(client, file, { apiToken, photoIds });
 * ```
 */
export async function uploadMedia(
    client: MaxClient,
    mediaFile: MediaFile,
    uploadParams: any
): Promise<ImageUploadResponse | FileUploadResponse> {
    if (mediaFile.type === 'image') {
        return await uploadImage(
            client,
            mediaFile,
            uploadParams.apiToken,
            uploadParams.photoIds
        );
    } else {
        return await uploadFile(
            client,
            mediaFile,
            uploadParams.sig,
            uploadParams.expires,
            uploadParams.clientType,
            uploadParams.id,
            uploadParams.userId
        );
    }
}

/**
 * Отправка сообщения с медиафайлом (полный процесс)
 * 
 * Выполняет полный процесс отправки медиафайла:
 * 1. Запрашивает URL для загрузки у сервера
 * 2. Загружает файл по полученному URL
 * 3. Отправляет сообщение с вложением
 * 
 * @param client - Экземпляр MaxClient
 * @param chatId - ID чата для отправки сообщения
 * @param mediaFile - Медиафайл для отправки
 * @param text - Текст сообщения (опционально)
 * @param notify - Отправлять ли уведомление (по умолчанию true)
 * @returns Promise<RpcResponse> - Ответ от сервера
 * 
 * @example
 * ```typescript
 * const imageFile = await createMediaFileFromPath('/path/to/vacation.jpg');
 * 
 * await sendMediaMessage(
 *   client, 
 *   60815114, 
 *   imageFile, 
 *   'Фото с отпуска!'
 * );
 * ```
 */
export async function sendMediaMessage(
    client: MaxClient,
    chatId: string | number,
    mediaFile: MediaFile,
    text: string = '',
    notify: boolean = true
): Promise<RpcResponse> {
    console.log('📤 Начинаем процесс отправки медиафайла...');
    
    // Шаг 1: Запрашиваем URL для загрузки
    console.log('🔗 Запрашиваем URL для загрузки...');
    const uploadInfo = await requestUploadUrl(client, mediaFile, chatId);
    
    if (uploadInfo.error) {
        throw new Error(`Failed to get upload URL: ${uploadInfo.error}`);
    }
    
    console.log('✅ Получен URL для загрузки:', uploadInfo.uploadUrl);
    
    // Шаг 2: Загружаем файл
    console.log('⬆️  Загружаем файл...');
    const uploadResult = await uploadMedia(client, mediaFile, uploadInfo.uploadParams);
    
    if (!uploadResult.success) {
        throw new Error(`Failed to upload media: ${uploadResult.error}`);
    }
    
    console.log('✅ Файл загружен успешно');

    // Определяем fileId в зависимости от типа результата
    let fileId: string = '';
    if ('fileId' in uploadResult && uploadResult.fileId) {
        fileId = uploadResult.fileId;
    } else if ('imageId' in uploadResult && uploadResult.imageId) {
        fileId = uploadResult.imageId;
    }

    // Создаем правильное вложение в зависимости от типа медиа
    let mediaAttachment: any;
    
    if (mediaFile.type === 'image') {
        // Для изображений используем структуру PHOTO
        mediaAttachment = {
            _type: 'PHOTO',
            photoId: parseInt(fileId) || 0,
            photoToken: uploadInfo.uploadParams.photoIds || '',
            width: 300, // Примерные значения, в реальности нужно получить от сервера
            height: 200,
            baseUrl: uploadResult.url || ''
        };
    } else {
        // Для файлов используем структуру FILE
        mediaAttachment = {
            _type: 'FILE',
            name: mediaFile.filename,
            size: mediaFile.size,
            fileId: parseInt(fileId) || 0,
            token: uploadInfo.uploadParams.sig || ''
        };
    }

    // Создаем сообщение с медиавложением
    const message: Message = {
        text: text,
        cid: Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000),
        elements: [],
        attaches: [mediaAttachment]
    };

    const payload: SendMessagePayload = {
        chatId: typeof chatId === 'string' ? parseInt(chatId) : chatId,
        message: message,
        notify: notify
    };

    console.log('📨 Отправляем сообщение с медиавложением...');
    return await client.invokeMethod(OPCODES.SEND_MESSAGE, payload);
}

/**
 * Отправка сообщения с медиафайлом (устаревший метод с готовыми параметрами)
 * 
 * @deprecated Используйте sendMediaMessage() для автоматического получения параметров
 */
export async function sendMediaMessageLegacy(
    client: MaxClient,
    chatId: string | number,
    mediaFile: MediaFile,
    text: string = '',
    uploadParams: any,
    notify: boolean = true
): Promise<RpcResponse> {
    // Сначала загружаем медиафайл
    const uploadResult = await uploadMedia(client, mediaFile, uploadParams);
    
    if (!uploadResult.success) {
        throw new Error(`Failed to upload media: ${uploadResult.error}`);
    }

    // Определяем fileId в зависимости от типа результата
    let fileId: string = '';
    if ('fileId' in uploadResult && uploadResult.fileId) {
        fileId = uploadResult.fileId;
    } else if ('imageId' in uploadResult && uploadResult.imageId) {
        fileId = uploadResult.imageId;
    }

    // Создаем вложение медиафайла
    const mediaAttachment: MediaAttachment = {
        _type: 'MEDIA',
        type: 'FILE', // Базовый тип для MessageAttachment
        mediaType: mediaFile.type,
        fileId: fileId,
        url: uploadResult.url || '',
        filename: mediaFile.filename,
        size: mediaFile.size
    };

    // Создаем сообщение с медиавложением
    const message: Message = {
        text: text,
        cid: Math.floor(Math.random() * (2000000000000 - 1750000000000) + 1750000000000),
        elements: [],
        attaches: [mediaAttachment]
    };

    const payload: SendMessagePayload = {
        chatId: typeof chatId === 'string' ? parseInt(chatId) : chatId,
        message: message,
        notify: notify
    };

    return await client.invokeMethod(OPCODES.SEND_MESSAGE, payload);
}

/**
 * Создание MediaFile из файла на диске
 * 
 * Читает файл с диска и создает объект MediaFile.
 * Автоматически определяет MIME тип по расширению файла.
 * 
 * @param filePath - Путь к файлу
 * @returns Promise<MediaFile> - Объект медиафайла
 * @throws {Error} Если файл не найден или не поддерживается
 * 
 * @example
 * ```typescript
 * const mediaFile = await createMediaFileFromPath('/path/to/image.jpg');
 * console.log('Тип файла:', mediaFile.type);
 * console.log('Размер файла:', mediaFile.size);
 * ```
 */
export async function createMediaFileFromPath(filePath: string): Promise<MediaFile> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
        const data = await fs.readFile(filePath);
        const filename = path.basename(filePath);
        const extension = path.extname(filename).toLowerCase();
        
        // Определяем MIME тип по расширению
        const mimeTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
            '.tiff': 'image/tiff',
            '.mp4': 'video/mp4',
            '.avi': 'video/avi',
            '.mov': 'video/mov',
            '.wmv': 'video/wmv',
            '.flv': 'video/flv',
            '.webm': 'video/webm',
            '.mkv': 'video/mkv',
            '.3gp': 'video/3gp',
            '.mp3': 'audio/mp3',
            '.wav': 'audio/wav',
            '.flac': 'audio/flac',
            '.aac': 'audio/aac',
            '.ogg': 'audio/ogg',
            '.wma': 'audio/wma',
            '.m4a': 'audio/m4a',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.txt': 'text/plain',
            '.csv': 'text/csv',
            '.zip': 'application/zip',
            '.rar': 'application/rar',
            '.7z': 'application/7z'
        };
        
        const mimeType = mimeTypeMap[extension] || 'application/octet-stream';
        const mediaType = getMediaTypeFromMime(mimeType);
        
        if (!mediaType) {
            throw new Error(`Unsupported file type: ${extension}`);
        }
        
        return {
            type: mediaType,
            data: data,
            filename: filename,
            mimeType: mimeType,
            size: data.length
        };
    } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Создание MediaFile из Buffer
 * 
 * Создает объект MediaFile из Buffer с указанными параметрами.
 * 
 * @param data - Данные файла в виде Buffer
 * @param filename - Имя файла
 * @param mimeType - MIME тип файла
 * @returns MediaFile - Объект медиафайла
 * @throws {Error} Если MIME тип не поддерживается
 * 
 * @example
 * ```typescript
 * const buffer = Buffer.from('Hello, world!');
 * const mediaFile = createMediaFileFromBuffer(buffer, 'hello.txt', 'text/plain');
 * ```
 */
export function createMediaFileFromBuffer(
    data: Buffer,
    filename: string,
    mimeType: string
): MediaFile {
    const mediaType = getMediaTypeFromMime(mimeType);
    
    if (!mediaType) {
        throw new Error(`Unsupported MIME type: ${mimeType}`);
    }
    
    return {
        type: mediaType,
        data: data,
        filename: filename,
        mimeType: mimeType,
        size: data.length
    };
}
