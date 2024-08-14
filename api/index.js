const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config(); // If you use environment variables
const cors = require('cors');
const corsOptions = {
    origin: '*', // Allow all origins; restrict this in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
};
const app = express();
app.use(cors(corsOptions));


const port = process.env.PORT || 8080;

app.use(bodyParser.json());

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

app.post('/send-mail', (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).send('All fields are required');
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'New User Visited',
        text: `You have a new contact submission:\n\nFirst Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\nMessage : ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email sent successfully');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
