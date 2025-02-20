require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let generatedOTP = null;  // Stores OTP temporarily

// Generate OTP and send it via SMS
app.post("/send-otp", async (req, res) => {
    const { phone } = req.body;
    generatedOTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Use an SMS API (e.g., Fast2SMS, Twilio) to send OTP
    const SMS_API_URL = "https://www.fast2sms.com/dev/bulkV2";
    const SMS_API_KEY = process.env.SMS_API_KEY; // Store API Key in .env file

    try {
        await axios.post(SMS_API_URL, {
            route: "otp",
            variables_values: generatedOTP,
            numbers: phone
        }, {
            headers: { "authorization": SMS_API_KEY }
        });

        res.json({ success: true, message: "OTP Sent Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error Sending OTP" });
    }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
    const { otp } = req.body;
    if (parseInt(otp) === generatedOTP) {
        res.json({ success: true, message: "OTP Verified" });
        generatedOTP = null;  // Reset OTP after verification
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});