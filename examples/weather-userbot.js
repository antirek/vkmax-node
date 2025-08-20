import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import readline from 'readline';

import { MaxClient, editMessage } from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get weather information for a city
 */
async function getWeather(city) {
    try {
        const response = await fetch(`https://ru.wttr.in/${encodeURIComponent(city)}?Q&T&format=3`);
        return await response.text();
    } catch (error) {
        console.error('Error fetching weather:', error);
        return 'Ошибка получения погоды';
    }
}

/**
 * Create readline interface for user input
 */
function createReadline() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Ask user for input
 */
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

/**
 * Packet callback handler
 */
async function packetCallback(client, packet) {
            if (packet.opcode === 128) { // MESSAGE_RECEIVED
        console.log('ii', packet.payload.message);
        const messageText = packet.payload.message.text;

        
        if (!['.info', '.weather'].some(cmd => messageText.startsWith(cmd))) {
            return;
        }

        let text;
        
        if (messageText === ".info") {
            text = "Userbot connected";
        } else if (messageText.startsWith(".weather")) {
            const parts = messageText.split(' ');
            if (parts.length < 2) {
                text = "Использование: .weather <город>";
                await editMessage(
                    client,
                    packet.payload.chatId,
                    packet.payload.message.id,
                    text
                );
                return;
            }
            const city = parts.slice(1).join(' ');
            text = await getWeather(city);
        }

        await editMessage(
            client,
            packet.payload.chatId,
            packet.payload.message.id,
            text
        );
    }
}

/**
 * Main function
 */
async function main() {
    const client = new MaxClient();
    const rl = createReadline();

    try {
        await client.connect();

        const loginTokenFile = path.join(__dirname, 'login_token.txt');

        try {
            const loginTokenFromFile = await fs.readFile(loginTokenFile, 'utf-8');
            const token = loginTokenFromFile.trim();
            
            try {
                await client.loginByToken(token);
                console.log('Successfully logged in using saved token');
            } catch (error) {
                console.log("Couldn't login by token. Falling back to SMS login");
                throw error;
            }
        } catch (error) {
            // File doesn't exist or login failed, proceed with SMS login
            const phoneNumber = await askQuestion(rl, 'Your phone number: ');
            const smsLoginToken = await client.sendCode(phoneNumber);
            
            const smsCode = await askQuestion(rl, 'Enter SMS code: ');
            const accountData = await client.signIn(smsLoginToken, parseInt(smsCode));

            const loginToken = accountData.payload.tokenAttrs.LOGIN.token;
            await fs.writeFile(loginTokenFile, loginToken, 'utf-8');
            console.log('Login token saved to file');
        }

        await client.setCallback(packetCallback);
        console.log('Userbot started. Send .info or .weather <city> to test.');

        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\nShutting down...');
            await client.disconnect();
            rl.close();
            process.exit(0);
        });

        // Keep alive
        await new Promise(() => {}); // This will never resolve

    } catch (error) {
        console.error('Error:', error);
        rl.close();
        process.exit(1);
    }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
} 