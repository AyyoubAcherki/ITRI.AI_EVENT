require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./reservations.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    }
});

// Configure NodeMailer transporter (Replace with your SMTP settings)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Reservation Endpoint
app.post('/api/reservations', async (req, res) => {
    const { name, phone, email, event_date, event_time } = req.body;

    if (!name || !phone || !email || !event_date || !event_time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1️⃣ Save to database
    const sql = `INSERT INTO reservations (name, phone, email, event_date, event_time) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, phone, email, event_date, event_time], async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        try {
            // 2️⃣ Send WhatsApp message via UltraMsg
            const instanceId = 'instance162815';
            const token = 'bplyfzxy1ruqi862';

            const whatsappMessage = `Bonjour ${name} 👋 Votre réservation pour l’événement est enregistrée ✅ Veuillez vérifier votre email pour confirmer votre réservation.`;

            const parsedPhone = phone.replace(/[^0-9]/g, ''); // Ensure numbers only

            await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
                token: token,
                to: parsedPhone,
                body: whatsappMessage
            });
            console.log('WhatsApp message sent to =', parsedPhone);

            // 3️⃣ Send Confirmation Email
            const mailOptions = {
                from: `"Event Registration" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Confirmation de votre réservation',
                html: `
          <h2>Bonjour ${name} 👋</h2>
          <p>Votre réservation pour l’événement est enregistrée ✅</p>
          <p><strong>Détails :</strong></p>
          <ul>
            <li>Date : ${event_date}</li>
            <li>Heure : ${event_time}</li>
            <li>Téléphone : ${phone}</li>
          </ul>
          <p>Merci et à bientôt !</p>
        `
            };

            if (process.env.SMTP_USER) {
                await transporter.sendMail(mailOptions);
                console.log('Email sent to =', email);
            } else {
                console.log('Skipping email: SMTP credentials not provided in .env');
            }

            res.status(201).json({
                message: 'Reservation created successfully',
                id: this.lastID
            });

        } catch (error) {
            console.error('API Error:', error.message);
            // Still return success even if messages fail so the user is recorded
            res.status(201).json({
                message: 'Reservation saved, but failed to send notifications',
                error: error.message
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Reservation server running on port ${PORT}`);
});
