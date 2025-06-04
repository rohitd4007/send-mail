const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');
const app = express();

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Function to generate 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to store OTP with expiration
function storeOTP(email, otp) {
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 30000 // 30 seconds
    });
}

// Function to validate OTP
function validateOTP(email, otp) {
    const storedData = otpStore.get(email);
    // console.log(email, otp, storedData, storedData.otp);
    if (!storedData) return false;
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return false;
    }
    return storedData.otp === otp;
}

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

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4,
});

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'Hello from Vercel!' });
});

// Mail sending route
app.post('/api/send-mail', (req, res) => {
    console.log('Received request body:', req.body);

    // Normalize field names to lowercase
    const normalizedBody = {
        firstname: req.body.firstName || req.body.firstname,
        lastname: req.body.lastName || req.body.lastname,
        email: req.body.email,
        mailsubject: req.body.mailSubject || req.body.mailsubject,
        mailbody: req.body.mailBody || req.body.mailbody
    };

    console.log('Normalized body:', normalizedBody);

    // Validate required fields
    if (!normalizedBody.firstname || !normalizedBody.lastname || !normalizedBody.email ||
        !normalizedBody.mailsubject || !normalizedBody.mailbody) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['firstName', 'lastName', 'email', 'mailSubject', 'mailBody'],
            received: req.body,
            normalized: normalizedBody
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedBody.email,
        subject: normalizedBody.mailsubject,
        text: normalizedBody.mailbody.split('\n').map(line => `\n${line}`).join(''),
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Mail error:', error);
            return res.status(500).json({ error: 'Error sending email', details: error.message });
        }
        res.status(200).json({ message: 'Email sent successfully' });
    });
});

// New route to request OTP
app.post('/api/request-otp', (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            error: 'Email is required',
            usage: 'Send a POST request with email in the body'
        });
    }

    const otp = generateOTP();
    storeOTP(email, otp);

    const mailOptions = {
        from: '"Team TeeFlect" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: 'Your OTP',
        text: `\nYour OTP is: ${otp}\n\nThis OTP is valid for 15 seconds.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: 'Error sending OTP', details: error.message });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
    });
});

// New route to verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({
            error: 'Email and OTP are required',
            usage: 'Send a POST request with email and otp in the body'
        });
    }

    const isValid = validateOTP(email, otp);
    if (isValid) {
        otpStore.delete(email); // Clear OTP after successful verification
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ error: 'Invalid or expired OTP' });
    }
});

// Handle preflight requests
app.options('/api/send-mail', cors(corsOptions));

// Export the app for server.js to use
module.exports = app;
