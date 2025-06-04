const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { requestOTP, verifyOTP } = require('./Controller/otpController');
const { sendMail } = require('./Controller/sendmailController');
const app = express();

// Set up CORS options
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000';

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 200
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
