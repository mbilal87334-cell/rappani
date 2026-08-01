import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
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

export async function connectToWhatsApp() {
    const authFolder = path.join(process.cwd(), '.auth_info_baileys');
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);

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
