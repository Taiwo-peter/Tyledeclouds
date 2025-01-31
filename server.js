require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql2/promise');  // Changed to promise-based interface

const app = express();
const PORT = 443;
const HOST = '0.0.0.0';

// Load SSL certificate files with validation
const certPath = '/etc/ssl/certs/cert.pem';
const keyPath = '/etc/ssl/private/key.pem';

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('SSL certificate files are missing!');
    process.exit(1);
}

const options = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
};

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('frontend'));

// MySQL connection pool setup
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verify connection on startup
pool.getConnection()
    .then(conn => {
        console.log('Connected to MySQL database');
        conn.release();
    })
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

// Routes
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).send('OK');
    } catch (err) {
        res.status(500).send();
    }
});

app.get('/', (req, res) => {
    res.send('Hello, HTTPS world!');
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        await pool.query(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        console.log(`New contact submission: ${name}, ${email}, ${message}`);
        res.status(200).json({ message: 'Message received successfully!' });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be ≥6 characters' });
        }

        // Check existing user
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length > 0) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        console.log(`New user: ${email}`);
        res.status(201).json({ message: 'Signup successful!' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/data', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

// Create HTTPS server
const server = https.createServer(options, app);
server.listen(PORT, HOST, () => {
    console.log(`Server running on https://${HOST}:${PORT}`);
});