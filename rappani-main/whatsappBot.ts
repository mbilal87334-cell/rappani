import makeWASocket, { DisconnectReason, initAuthCreds, BufferJSON, proto } from '@whiskeysockets/baileys';
import mongoose from 'mongoose';
import { Boom } from '@hapi/boom';
import path from 'path';
import QRCode from 'qrcode';
import pino from 'pino';

// State management for QR and connection
export let waSocket: any = null;
export let waQrCode: string | null = null;
export let isWaConnected = false;

// Create the logger
const logger = pino({ level: 'silent' });


const useMongoDBAuthState = async () => {
    const WhatsAppAuth = mongoose.model('WhatsAppAuth');

    const writeData = async (data, id) => {
        const serialized = JSON.stringify(data, BufferJSON.replacer);
        await WhatsAppAuth.findByIdAndUpdate(id, { data: serialized }, { upsert: true });
    };

    const readData = async (id) => {
        const doc = await WhatsAppAuth.findById(id);
        if (doc) {
            return JSON.parse(doc.data, BufferJSON.reviver);
        }
        return null;
    };

    const removeData = async (id) => {
        await WhatsAppAuth.findByIdAndDelete(id);
    };

    let creds = await readData('creds');
    if (!creds) {
        creds = initAuthCreds();
        await writeData(creds, 'creds');
    }

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async id => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            tasks.push(value ? writeData(value, key) : removeData(key));
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => writeData(creds, 'creds')
    };
};

export async function connectToWhatsApp() {
    const { state, saveCreds } = await useMongoDBAuthState();

    waSocket = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger,
        browser: ['Rappani Store Bot', 'Chrome', '1.0.0']
    });

    waSocket.ev.on('creds.update', saveCreds);

    waSocket.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Generate base64 QR code image
            try {
                waQrCode = await QRCode.toDataURL(qr);
                isWaConnected = false;
                console.log('[WhatsApp] Generated new QR Code for Admin Panel');
            } catch (err) {
                console.error('[WhatsApp] QR code generation error:', err);
            }
        }

        if (connection === 'close') {
            isWaConnected = false;
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[WhatsApp] Connection closed due to', lastDisconnect?.error, ', reconnecting:', shouldReconnect);
            
            // Reconnect if not logged out
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('[WhatsApp] Logged out. Scan QR again to reconnect.');
                waQrCode = null;
                // Delete auth info to force new QR
                mongoose.model('WhatsAppAuth').deleteMany({}).catch(console.error);
            }
        } else if (connection === 'open') {
            console.log('[WhatsApp] Successfully Connected!');
            isWaConnected = true;
            waQrCode = null;
        }
    });

    // Handle incoming messages (auto-reply can go here)
    waSocket.ev.on('messages.upsert', async (m: any) => {
        if (m.type !== 'notify') return;
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        console.log('[WhatsApp] Received msg from', msg.key.remoteJid, ':', msg.message.conversation || msg.message.extendedTextMessage?.text);
        
        // Optional: Simple auto-reply
        // const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        // if (text.toLowerCase().includes('hello')) {
        //     await waSocket.sendMessage(msg.key.remoteJid, { text: 'Hello from Rappani Store! How can we help you today?' });
        // }
    });
}

// Helper function to send messages
export async function sendWhatsAppMessage(phone: string, text: string) {
    if (!isWaConnected || !waSocket) {
        console.warn('[WhatsApp] Bot is not connected. Cannot send message to', phone);
        return false;
    }
    try {
        // Format phone number to JID
        const formattedPhone = phone.replace(/\D/g, '');
        const jid = `${formattedPhone}@s.whatsapp.net`;
        
        const [result] = await waSocket.onWhatsApp(jid);
        if (!result?.exists) {
            console.warn(`[WhatsApp] Number ${formattedPhone} is not registered on WhatsApp`);
            return false;
        }

        await waSocket.sendMessage(jid, { text });
        console.log(`[WhatsApp] Message sent successfully to ${formattedPhone}`);
        return true;
    } catch (err) {
        console.error(`[WhatsApp] Failed to send message to ${phone}:`, err);
        return false;
    }
}
