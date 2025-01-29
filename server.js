require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const https = require('https'); // Import HTTPS module
const fs = require('fs'); // Import FS module to read certificate files
const mysql = require('mysql2'); // Import MySQL package

const app = express(); // Declare the app variable only once
const PORT = 443; // Port number
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Load SSL certificate files
const options = {
    key: fs.readFileSync('/etc/ssl/private/key.pem'), // Path to your private key
    cert: fs.readFileSync('/etc/ssl/certs/cert.pem'), // Path to your certificate
};

// Middleware
app.use(cors()); // Enables cross-origin requests
app.use(bodyParser.json()); // Parses JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded data
app.use(express.static('frontend')); // Serves static files from the "frontend" folder

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Your MySQL host
    user: process.env.DB_USER, // Your MySQL username
    password: process.env.DB_PASSWORD, // Your MySQL password
    database: process.env.DB_NAME // Your MySQL database name
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Middleware and routes
app.get('/', (req, res) => {
    res.send('Hello, HTTPS world!');
});

// API to handle contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Save contact message to database (optional)
    const query = 'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)';
    db.query(query, [name, email, message], (err) => {
        if (err) {
            console.error('Error saving contact message:', err);
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
    });

    console.log(`New contact form submission: Name: ${name}, Email: ${email}, Message: ${message}`);
    res.status(200).json({ message: 'Your message has been received. We will get back to you soon!' });
});

// API to handle sign-up form submission
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    // Check password strength
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if the user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking user existence:', err);
            return res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        try {
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Add user to the database
            const insertUserQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(insertUserQuery, [email, hashedPassword], (err) => {
                if (err) {
                    console.error('Error during sign-up:', err);
                    return res.status(500).json({ error: 'Internal server error. Please try again later.' });
                }
                console.log(`New user signed up: Email: ${email}`);
                res.status(201).json({ message: 'Sign-up successful! Welcome to Tyledeclouds.' });
            });
        } catch (error) {
            console.error('Error during password hashing:', error);
            res.status(500).json({ error: 'Internal server error. Please try again later.' });
        }
    });
});

// Example endpoint
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Create HTTPS server
const server = https.createServer(options, app);

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server is running on https://${HOST}:${PORT}`);
});
