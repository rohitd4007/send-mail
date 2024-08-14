const express = require('express');
const app = express();

app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Vercel!' });
});

app.post('/submit', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    res.json({ message: `Hello, ${name}! Your data has been received.` });
});

module.exports = app;
