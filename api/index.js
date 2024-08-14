const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cors = require('cors');
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
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).send('All fields are required');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Thank You for Reaching Out! Let's Stay Connected",
        text: `
            \nDear ${firstName},

            \nI hope this message finds you well!

            \nFeel free to check out my GitHub repository for a closer look at my work: https://github.com/rohitd4007. 
            
            \nYou’ll find some of my recent projects, showcasing my skills in action.

            \nLooking forward to connecting with you!

            \nBest regards,

            \nRohit
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        }
        res.status(200).send('Email sent successfully');
    });
});

// Handle preflight requests
app.options('/api/send-mail', cors(corsOptions));

module.exports = app;
