const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3001;

app.use(express.json());

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    // client.initialize(); // Optional: Restart client?
});

client.initialize();

// API Endpoint to send message
app.post('/send-message', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ status: 'error', message: 'Phone and message are required' });
    }

    try {
        // Format phone for whatsapp-web.js (needs @c.us suffix and no +)
        const chatId = `${phone}@c.us`;

        // Check if number is registered
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            console.log(`Number not registered: ${chatId}`);
        }

        await client.sendMessage(chatId, message);
        console.log(`Message sent to ${chatId}`);
        res.json({ status: 'success', message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Status Endpoint
app.get('/status', async (req, res) => {
    try {
        const state = await client.getState();
        res.json({
            status: 'online',
            whatsapp_state: state,
            info: client.info
        });
    } catch (e) {
        res.json({ status: 'offline', error: e.message });
    }
});

app.listen(port, () => {
    console.log(`WhatsApp Local Gateway running on port ${port}`);
});
