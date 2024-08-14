const express = require('express');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Simple POST route
app.post('/submit', (req, res) => {
    const { name } = req.body;

    // Check if the 'name' field is provided
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    // Respond with a message
    res.status(200).json({ message: `Hello, ${name}! Your data has been received.` });
});

app.get('/', (req, res) => {
    res.status(200).json({ message: `Hello, GET` });
})

module.exports = app; // Export the app for Vercel
