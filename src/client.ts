import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { WS_HOST, RPC_VERSION, USER_AGENT, OPCODES, generateRandomId } from './constants.js';
import type {
    RpcRequest,
    RpcResponse,
    AuthToken,
    VerificationPayload,
    LoginPayload,
    IncomingEventCallback,
    PendingRequest,
    HelloPayload,
    KeepalivePayload,
    LoginByTokenPayload,
    StartAuthPayload,
    VerifyCodePayload
} from './types.js';

/**
 * MaxClient - WebSocket клиент для VK MAX мессенджера
 * 
 * Основной класс для работы с VK MAX API через WebSocket соединение.
 * Поддерживает аутентификацию через SMS и токены, отправку сообщений,
 * обработку входящих событий и управление соединением.
 * 
 * @example
 * ```typescript
 * const client = new MaxClient();
 * await client.connect();
 * await client.sendCode('+79001234567');
 * await client.signIn(token, '1234');
 * ```
 */
export class MaxClient extends EventEmitter {
    private _connection: WebSocket | null = null;
    private _isLoggedIn: boolean = false;
    private _seq: number = 1;
    private _keepaliveTask: NodeJS.Timeout | null = null;
    private _recvTask: NodeJS.Timeout | null = null;
    private _incomingEventCallback: IncomingEventCallback | null = null;
    private _pending: Map<number, PendingRequest> = new Map();
    private _isConnected: boolean = false;

    /**
     * Подключение к WebSocket серверу VK MAX
     * 
     * Устанавливает WebSocket соединение с сервером VK MAX.
     * Должен быть вызван перед любыми другими операциями.
     * 
     * @returns Promise<WebSocket> - Promise с WebSocket соединением
     * @throws {Error} Если уже подключен
     * @throws {Error} При ошибке WebSocket соединения
     * 
     * @example
     * ```typescript
     * const client = new MaxClient();
     * const connection = await client.connect();
     * console.log('Подключено к VK MAX');
     * ```
     */
    async connect(): Promise<WebSocket> {
        if (this._connection) {
            throw new Error("Already connected");
        }

        console.log(`Connecting to ${WS_HOST}...`);
        
        return new Promise((resolve, reject) => {
            this._connection = new WebSocket(WS_HOST);
            
            this._connection.on('open', () => {
                console.log('Connected. Receive task started.');
                this._isConnected = true;
                this._startRecvLoop();
                resolve(this._connection!);
            });
            
            this._connection.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
                reject(error);
            });
            
            this._connection.on('close', () => {
                console.log('WebSocket connection closed');
                this._isConnected = false;
                this._connection = null;
            });
        });
    }

    /**
     * Отключение от WebSocket сервера
     * 
     * Закрывает WebSocket соединение и останавливает все фоновые задачи.
     * 
     * @returns Promise<void>
     * @throws {Error} Если не подключен
     * 
     * @example
     * ```typescript
     * await client.disconnect();
     * console.log('Отключено от сервера');
     * ```
     */
    async disconnect(): Promise<void> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this._stopKeepaliveTask();
        if (this._recvTask) {
            clearInterval(this._recvTask);
        }
        this._connection.close();
        this._isConnected = false;
    }

    /**
     * Вызов метода на сервере
     * 
     * Отправляет RPC запрос на сервер VK MAX и ждет ответа.
     * Используется внутренне для всех API вызовов.
     * 
     * @param opcode - Код операции (см. OPCODES)
     * @param payload - Данные запроса
     * @returns Promise<RpcResponse> - Ответ от сервера
     * @throws {Error} Если не подключен
     * @throws {Error} При таймауте запроса (30 секунд)
     * 
     * @example
     * ```typescript
     * const response = await client.invokeMethod(OPCODES.SEND_MESSAGE, {
     *   chatId: 'chat123',
     *   message: { text: 'Hello' }
     * });
     * ```
     */
    async invokeMethod(opcode: number, payload: any): Promise<RpcResponse> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }

        const seq = this._seq++;
        const request: RpcRequest = {
            ver: RPC_VERSION,
            cmd: 0,
            seq: seq,
            opcode: opcode,
            payload: payload
        };
        
        console.log(`-> REQUEST: ${JSON.stringify(request)}`);

        return new Promise((resolve, reject) => {
            this._pending.set(seq, { resolve, reject });
            
            this._connection!.send(JSON.stringify(request));
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this._pending.has(seq)) {
                    this._pending.delete(seq);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }

    /**
     * Установка callback для входящих событий
     * 
     * Устанавливает функцию обратного вызова, которая будет вызываться
     * при получении входящих событий от сервера (сообщения, уведомления и т.д.).
     * 
     * @param callback - Функция обратного вызова
     * @returns Promise<void>
     * @throws {TypeError} Если callback не является функцией
     * 
     * @example
     * ```typescript
     * await client.setCallback(async (client, packet) => {
     *   if (packet.opcode === 128) { // MESSAGE_RECEIVED
     *     console.log('Получено сообщение:', packet.payload);
     *   }
     * });
     * ```
     */
    async setCallback(callback: IncomingEventCallback): Promise<void> {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        this._incomingEventCallback = callback;
    }

    /**
     * Запуск цикла приема сообщений
     * 
     * Настраивает обработчик входящих WebSocket сообщений.
     * Вызывается автоматически при подключении.
     * 
     * @private
     */
    private _startRecvLoop(): void {
        if (!this._connection) {
            throw new Error("WebSocket not connected");
        }

        this._connection.on('message', async (data: Buffer) => {
            try {
                const packet: RpcResponse = JSON.parse(data.toString());
                const seq = packet.seq;
                const pending = this._pending.get(seq);
                
                if (pending) {
                    this._pending.delete(seq);
                    console.log(`<- RESPONSE: ${JSON.stringify(packet)}`);
                    pending.resolve(packet);
                } else {
                    if (this._incomingEventCallback) {
                        // Run callback asynchronously
                        setImmediate(() => {
                            this._incomingEventCallback!(this, packet);
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }

    /**
     * Отправка keepalive пакета
     * 
     * Отправляет пинг-пакет для поддержания соединения активным.
     * 
     * @private
     * @returns Promise<RpcResponse>
     * @throws {Error} Если не подключен
     */
    private async _sendKeepalivePacket(): Promise<RpcResponse> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        const payload: KeepalivePayload = { interactive: false };
        return await this.invokeMethod(OPCODES.KEEPALIVE, payload);
    }

    /**
     * Запуск задачи keepalive
     * 
     * Запускает периодическую отправку keepalive пакетов каждые 30 секунд.
     * 
     * @private
     * @returns Promise<void>
     * @throws {Error} Если задача уже запущена
     */
    private async _startKeepaliveTask(): Promise<void> {
        if (this._keepaliveTask) {
            throw new Error('Keepalive task already started');
        }

        console.log('keepalive task started');
        this._keepaliveTask = setInterval(async () => {
            try {
                await this._sendKeepalivePacket();
            } catch (error) {
                console.error('Keepalive error:', error);
            }
        }, 30000);
    }

    /**
     * Остановка задачи keepalive
     * 
     * Останавливает периодическую отправку keepalive пакетов.
     * 
     * @private
     * @returns Promise<void>
     */
    private async _stopKeepaliveTask(): Promise<void> {
        if (this._keepaliveTask) {
            clearInterval(this._keepaliveTask);
            this._keepaliveTask = null;
            console.log('keepalive task stopped');
        }
    }

    /**
     * Отправка hello пакета
     * 
     * Отправляет приветственный пакет на сервер с информацией об устройстве.
     * Требуется перед аутентификацией.
     * 
     * @returns Promise<RpcResponse>
     * 
     * @example
     * ```typescript
     * await client._sendHelloPacket();
     * console.log('Hello пакет отправлен');
     * ```
     */
    async _sendHelloPacket(): Promise<RpcResponse> {
        const payload: HelloPayload = {
            userAgent: USER_AGENT,
            deviceId: uuidv4()
        };
        return await this.invokeMethod(OPCODES.HELLO, payload);
    }

    /**
     * Отправка SMS кода на номер телефона
     * 
     * Инициирует процесс аутентификации через SMS.
     * Сначала отправляет hello пакет, затем запрашивает SMS код.
     * 
     * @param phone - Номер телефона в международном формате
     * @returns Promise<string> - Токен для подтверждения SMS кода
     * @throws {Error} Если не подключен
     * @throws {Error} При ошибке сервера
     * 
     * @example
     * ```typescript
     * const token = await client.sendCode('+79001234567');
     * console.log('SMS код отправлен, токен:', token);
     * ```
     */
    async sendCode(phone: string): Promise<string> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this._sendHelloPacket();
        const payload: StartAuthPayload = {
            phone: phone,
            type: "START_AUTH",
            language: "ru"
        };
        const startAuthResponse = await this.invokeMethod(OPCODES.START_AUTH, payload);
        return (startAuthResponse.payload as AuthToken).token;
    }

    /**
     * Вход в систему по SMS коду
     * 
     * Подтверждает SMS код и выполняет вход в систему.
     * После успешного входа запускает keepalive задачу.
     * 
     * @param smsToken - Токен, полученный от sendCode()
     * @param smsCode - SMS код, полученный на телефон
     * @returns Promise<RpcResponse> - Данные аккаунта
     * @throws {Error} Если не подключен
     * @throws {Error} При неверном SMS коде
     * @throws {Error} При ошибке сервера
     * 
     * @example
     * ```typescript
     * const token = await client.sendCode('+79001234567');
     * const accountData = await client.signIn(token, '1234');
     * console.log('Успешно вошли в систему');
     * ```
     */
    async signIn(smsToken: string, smsCode: string | number): Promise<RpcResponse> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        const payload: VerifyCodePayload = {
            token: smsToken,
            verifyCode: String(smsCode),
            authTokenType: "CHECK_CODE"
        };
        const verificationResponse = await this.invokeMethod(OPCODES.VERIFY_CODE, payload);

        const responsePayload = verificationResponse.payload as VerificationPayload;
        if (responsePayload.error) {
            throw new Error(responsePayload.error);
        }

        if (responsePayload.profile) {
            console.log(`Successfully logged in as ${responsePayload.profile.phone}`);
        }

        this._isLoggedIn = true;
        await this._startKeepaliveTask();

        return verificationResponse;
    }

    /**
     * Вход в систему по сохраненному токену
     * 
     * Выполняет вход в систему используя ранее сохраненный токен.
     * Позволяет избежать повторной SMS аутентификации.
     * 
     * @param token - Сохраненный токен входа
     * @returns Promise<RpcResponse> - Данные аккаунта
     * @throws {Error} Если не подключен
     * @throws {Error} При недействительном токене
     * @throws {Error} При ошибке сервера
     * 
     * @example
     * ```typescript
     * await client.loginByToken('saved_token_here');
     * console.log('Успешно вошли по токену');
     * ```
     */
    async loginByToken(token: string): Promise<RpcResponse> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this._sendHelloPacket();
        console.log("using session");
        
        const payload: LoginByTokenPayload = {
            interactive: true,
            token: token,
            chatsSync: 0,
            contactsSync: 0,
            presenceSync: 0,
            draftsSync: 0,
            chatsCount: 40
        };
        const loginResponse = await this.invokeMethod(OPCODES.LOGIN_BY_TOKEN, payload);

        const responsePayload = loginResponse.payload as LoginPayload;
        if (responsePayload.error) {
            throw new Error(responsePayload.error);
        }

        if (responsePayload.profile) {
            console.log(`Successfully logged in as ${responsePayload.profile.phone}`);
        }

        this._isLoggedIn = true;
        await this._startKeepaliveTask();

        return loginResponse;
    }

    /**
     * Проверка статуса входа в систему
     * 
     * @returns {boolean} true если пользователь вошел в систему
     * 
     * @example
     * ```typescript
     * if (client.isLoggedIn) {
     *   console.log('Пользователь вошел в систему');
     * }
     * ```
     */
    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    /**
     * Проверка статуса подключения
     * 
     * @returns {boolean} true если подключен к серверу
     * 
     * @example
     * ```typescript
     * if (client.isConnected) {
     *   console.log('Подключен к серверу');
     * }
     * ```
     */
    get isConnected(): boolean {
        return this._isConnected;
    }

    /**
     * Загрузка и отправка фото в чат
     * 
     * Выполняет полный процесс загрузки фото:
     * 1. Запрашивает URL для загрузки через WebSocket (opcode 80)
     * 2. Загружает файл на сервер через HTTP
     * 3. Отправляет сообщение с PHOTO вложением
     * 
     * @param chatId - ID чата для отправки
     * @param photoData - Данные фото (Buffer)
     * @param filename - Имя файла
     * @param text - Текст сообщения (опционально)
     * @returns Promise<RpcResponse> - Ответ сервера с отправленным сообщением
     * @throws {Error} Если не подключен или не авторизован
     * 
     * @example
     * ```typescript
     * import fs from 'fs/promises';
     * 
     * const photoData = await fs.readFile('photo.jpg');
     * const response = await client.uploadAndSendPhoto(
     *   60815114, 
     *   photoData, 
     *   'photo.jpg', 
     *   'Красивое фото!'
     * );
     * console.log('Фото отправлено:', response.payload?.message?.id);
     * ```
     */
    async uploadAndSendPhoto(
        chatId: number,
        photoData: Buffer,
        filename: string,
        text: string = ''
    ): Promise<RpcResponse> {
        if (!this.isConnected) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        if (!this.isLoggedIn) {
            throw new Error("Not logged in. Call .loginByToken() or .signIn() first.");
        }

        try {
            // Шаг 1: Запрашиваем URL для загрузки (opcode 80)
            const uploadUrlResponse = await this.invokeMethod(OPCODES.REQUEST_UPLOAD_URL, { count: 1 });
            
            if (!uploadUrlResponse.payload?.url) {
                throw new Error('Не удалось получить URL для загрузки');
            }
            
            const uploadUrl = uploadUrlResponse.payload.url;
            
            // Шаг 2: Загружаем файл через HTTP
            const blob = new Blob([photoData as any], { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('file', blob, filename);
            
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!uploadResponse.ok) {
                throw new Error(`HTTP ошибка загрузки: ${uploadResponse.status} ${uploadResponse.statusText}`);
            }
            
            const uploadResult = await uploadResponse.json();
            
            // Извлекаем данные фото
            const photoKey = Object.keys(uploadResult.photos || {})[0];
            const photoToken = uploadResult.photos?.[photoKey]?.token;
            
            if (!photoKey || !photoToken) {
                throw new Error('Не удалось получить photoKey или photoToken из ответа сервера');
            }
            
            // Шаг 3: Отправляем сообщение с фото
            const messagePayload = {
                chatId: chatId,
                message: {
                    text: text,
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
            
            return await this.invokeMethod(OPCODES.SEND_MESSAGE, messagePayload);
            
        } catch (error) {
            throw new Error(`Ошибка загрузки и отправки фото: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
} 