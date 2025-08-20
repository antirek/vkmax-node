import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { WS_HOST, RPC_VERSION, APP_VERSION, USER_AGENT, OPCODES } from './constants.js';

/**
 * MaxClient - WebSocket client for VK MAX messenger
 */
export class MaxClient extends EventEmitter {
    constructor() {
        super();
        this._connection = null;
        this._isLoggedIn = false;
        this._seq = 1;
        this._keepaliveTask = null;
        this._recvTask = null;
        this._incomingEventCallback = null;
        this._pending = new Map();
        this._isConnected = false;
    }

    /**
     * Connect to WebSocket server
     */
    async connect() {
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
                resolve(this._connection);
            });
            
            this._connection.on('error', (error) => {
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
     * Disconnect from WebSocket server
     */
    async disconnect() {
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
     * Invoke method on server
     */
    async invokeMethod(opcode, payload) {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }

        const seq = this._seq++;
        const request = {
            ver: RPC_VERSION,
            cmd: 0,
            seq: seq,
            opcode: opcode,
            payload: payload
        };
        
        console.log(`-> REQUEST: ${JSON.stringify(request)}`);

        return new Promise((resolve, reject) => {
            this._pending.set(seq, { resolve, reject });
            
            this._connection.send(JSON.stringify(request));
            
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
     * Set callback for incoming events
     */
    async setCallback(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        this._incomingEventCallback = callback;
    }

    /**
     * Start receiving loop
     */
    _startRecvLoop() {
        this._connection.on('message', async (data) => {
            try {
                const packet = JSON.parse(data.toString());
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
                            this._incomingEventCallback(this, packet);
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }

    /**
     * Send keepalive packet
     */
    async _sendKeepalivePacket() {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this.invokeMethod(OPCODES.KEEPALIVE, { interactive: false });
    }

    /**
     * Start keepalive loop
     */
    async _startKeepaliveTask() {
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
     * Stop keepalive task
     */
    async _stopKeepaliveTask() {
        if (this._keepaliveTask) {
            clearInterval(this._keepaliveTask);
            this._keepaliveTask = null;
            console.log('keepalive task stopped');
        }
    }

    /**
     * Send hello packet
     */
    async _sendHelloPacket() {
        return await this.invokeMethod(OPCODES.HELLO, {
            userAgent: USER_AGENT,
            deviceId: uuidv4()
        });
    }

    /**
     * Send SMS code to phone number
     */
    async sendCode(phone) {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this._sendHelloPacket();
        const startAuthResponse = await this.invokeMethod(OPCODES.START_AUTH, {
            phone: phone,
            type: "START_AUTH",
            language: "ru"
        });
        return startAuthResponse.payload.token;
    }

    /**
     * Sign in with SMS code
     */
    async signIn(smsToken, smsCode) {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        const verificationResponse = await this.invokeMethod(OPCODES.VERIFY_CODE, {
            token: smsToken,
            verifyCode: String(smsCode),
            authTokenType: "CHECK_CODE"
        });

        if (verificationResponse.payload.error) {
            throw new Error(verificationResponse.payload.error);
        }

        console.log(`Successfully logged in as ${verificationResponse.payload.profile.phone}`);

        this._isLoggedIn = true;
        await this._startKeepaliveTask();

        return verificationResponse;
    }

    /**
     * Login by token
     */
    async loginByToken(token) {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        await this._sendHelloPacket();
        console.log("using session");
        
        const loginResponse = await this.invokeMethod(OPCODES.LOGIN_BY_TOKEN, {
            interactive: true,
            token: token,
            chatsSync: 0,
            contactsSync: 0,
            presenceSync: 0,
            draftsSync: 0,
            chatsCount: 40
        });

        if (loginResponse.payload.error) {
            throw new Error(loginResponse.payload.error);
        }

        console.log(`Successfully logged in as ${loginResponse.payload.profile.phone}`);

        this._isLoggedIn = true;
        await this._startKeepaliveTask();

        return loginResponse;
    }

    /**
     * Check if client is logged in
     */
    get isLoggedIn() {
        return this._isLoggedIn;
    }

    /**
     * Check if client is connected
     */
    get isConnected() {
        return this._isConnected;
    }
}