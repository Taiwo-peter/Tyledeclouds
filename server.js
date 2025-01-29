require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https'); 
const fs = require('fs'); 
const mysql = require('mysql2');

const app = express();
const PORT = 443; 
const HOST = '0.0.0.0';

// Load SSL certificate files with error handling
let options = {};
try {
    options = {
        key: fs.readFileSync('/etc/ssl/private/key.pem'),
        cert: fs.readFileSync('/etc/ssl/certs/cert.pem'),
    };
    console.log('SSL certificates loaded successfully.');
} catch (err) {
    console.error('Failed to load SSL certificates:', err.message);
    process.exit(1); // Exit if SSL files are missing
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('frontend'));

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Routes
app.get('/', (req, res) => {
    res.send('Hello, HTTPS world!');
});

// Secure HTTPS server creation
const server = https.createServer(options, app);
server.listen(PORT, HOST, () => {
    console.log(`Server is running on https://${HOST}:${PORT}`);
});
