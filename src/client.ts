import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { WS_HOST, RPC_VERSION, USER_AGENT, OPCODES } from './constants.js';
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
 * MaxClient - WebSocket client for VK MAX messenger
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
     * Connect to WebSocket server
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
     * Disconnect from WebSocket server
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
     * Invoke method on server
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
     * Set callback for incoming events
     */
    async setCallback(callback: IncomingEventCallback): Promise<void> {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        this._incomingEventCallback = callback;
    }

    /**
     * Start receiving loop
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
     * Send keepalive packet
     */
    private async _sendKeepalivePacket(): Promise<RpcResponse> {
        if (!this._connection) {
            throw new Error("WebSocket not connected. Call .connect() first.");
        }
        
        const payload: KeepalivePayload = { interactive: false };
        return await this.invokeMethod(OPCODES.KEEPALIVE, payload);
    }

    /**
     * Start keepalive loop
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
     * Stop keepalive task
     */
    private async _stopKeepaliveTask(): Promise<void> {
        if (this._keepaliveTask) {
            clearInterval(this._keepaliveTask);
            this._keepaliveTask = null;
            console.log('keepalive task stopped');
        }
    }

    /**
     * Send hello packet
     */
    async _sendHelloPacket(): Promise<RpcResponse> {
        const payload: HelloPayload = {
            userAgent: USER_AGENT,
            deviceId: uuidv4()
        };
        return await this.invokeMethod(OPCODES.HELLO, payload);
    }

    /**
     * Send SMS code to phone number
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
     * Sign in with SMS code
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
     * Login by token
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
     * Check if client is logged in
     */
    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    /**
     * Check if client is connected
     */
    get isConnected(): boolean {
        return this._isConnected;
    }
} 