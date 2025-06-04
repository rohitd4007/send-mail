const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { requestOTP, verifyOTP } = require('./Controller/otpController');
const { sendMail } = require('./Controller/sendmailController');
const app = express();

// Set up CORS options
const corsOptions = {
    origin: 'https://rohit-devhare-portfolio.netlify.app', // Allow only your frontend origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Vercel!' });
});

// Mail sending route
app.post('/api/send-mail', sendMail);

// OTP routes
app.post('/api/request-otp', requestOTP);
app.post('/api/verify-otp', verifyOTP);


// Handle preflight requests
app.options('/api/send-mail', cors(corsOptions));

// Export the app for server.js to use
module.exports = app;
