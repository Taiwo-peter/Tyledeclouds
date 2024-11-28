const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5000; // Port number

// Middleware
app.use(cors()); // Enables cross-origin requests
app.use(bodyParser.json()); // Parses JSON data
app.use(bodyParser.urlencoded({ extended: true })); // Parses URL-encoded data

// Serve frontend files
app.use(express.static('frontend')); // Serves static files from the "frontend" folder

// Dummy database for demonstration
const users = [];

// API to handle contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    console.log(`New contact form submission: Name: ${name}, Email: ${email}, Message: ${message}`);
    res.status(200).json({ message: 'Your message has been received. We will get back to you soon!' });
});

// API to handle sign-up form submission
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;

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
    const userExists = users.find((user) => user.email === email);
    if (userExists) {
        return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user to the dummy database
    users.push({ email, password: hashedPassword });
    console.log(`New user signed up: Email: ${email}`);
    res.status(201).json({ message: 'Sign-up successful! Welcome to Tyledeclouds.' });
});

// Example endpoint
app.get('/api/data', (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
