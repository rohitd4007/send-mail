const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config(); // If you use environment variables

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'rohitdevare400@gmail.com',
        pass: 'vnhk xkfw rhda xcsr',
    },
    tls: {
        ciphers: 'SSLv3',
    },
    family: 4,
});

app.post('/send-mail', (req, res) => {
    const { firstname, lastname, email } = req.body;

    if (!firstname || !lastname || !email) {
        return res.status(400).send('All fields are required');
    }

    const mailOptions = {
        from: 'rohitdevare400@gmail.com',
        to: 'rohitodeka07@gmail.com',
        subject: 'New Contact Form Submission',
        text: `You have a new contact submission:\n\nFirst Name: ${firstname}\nLast Name: ${lastname}\nEmail: ${email}`,
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
