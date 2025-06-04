const { transporter } = require('../utils/nodemail-transporter');
require('dotenv').config();

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Function to generate 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

const validateOTP = (email, otp) => {
    const storedData = otpStore.get(email);
    // console.log(email, otp, storedData, storedData.otp);
    if (!storedData) return false;
    if (Date.now() > storedData.expiresAt) {
        otpStore.delete(email);
        return false;
    }
    return storedData.otp === otp;
}

// Function to store OTP with expiration
function storeOTP(email, otp) {
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 30000 // 30 seconds
    });
}

// New route to request OTP
const requestOTP = (req, res) => {
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
};

// New route to verify OTP
const verifyOTP = (req, res) => {
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
};

module.exports = { requestOTP, verifyOTP };
