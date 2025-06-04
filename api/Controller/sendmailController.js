const { transporter } = require('../utils/nodemail-transporter');
require('dotenv').config();

const sendMail = (req, res) => {
    // console.log('Received request body:', req.body);

    // Normalize field names to lowercase
    const normalizedBody = {
        firstname: req.body.firstName || req.body.firstname,
        lastname: req.body.lastName || req.body.lastname,
        email: req.body.email,
        mailsubject: req.body.mailSubject || req.body.mailsubject,
        mailbody: req.body.mailBody || req.body.mailbody
    };

    // console.log('Normalized body:', normalizedBody);

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
}

module.exports = { sendMail };
