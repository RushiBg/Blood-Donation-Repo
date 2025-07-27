const User = require("../models/User");
const crypto = require('crypto');
const sendEmail = require("../utils/email");

// Store verification codes in memory (in production, use Redis or database)
const verificationCodes = new Map();

const sendCode = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiration (5 minutes)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Send verification email
    const emailSubject = 'Blood Donation System - Verification Code';
    const emailMessage = `
      <h3>Your Verification Code</h3>
      <p>Hello ${user.name},</p>
      <p>Your verification code is: <strong style="font-size: 24px; color: #e74c3c; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${code}</strong></p>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;

    await sendEmail(email, emailSubject, emailMessage);

    res.json({ message: 'Verification code sent to your email' });
  } catch (err) {
    console.error('Send code error:', err);
    res.status(500).json({ message: 'Failed to send verification code', error: err.message });
  }
};

const confirmCode = async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already verified
    if (user.verified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Get stored verification code
    const storedData = verificationCodes.get(email);
    if (!storedData) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Check if code is expired
    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check if code matches
    if (storedData.code !== token) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Mark user as verified
    await User.findByIdAndUpdate(user._id, { verified: true });
    
    // Remove the used code
    verificationCodes.delete(email);

    // Send confirmation email
    const emailSubject = 'Blood Donation System - Account Verified';
    const emailMessage = `
      <h3>Account Successfully Verified!</h3>
      <p>Hello ${user.name},</p>
      <p>Your account has been successfully verified. You can now log in to the Blood Donation System.</p>
      <p>Thank you for joining our community!</p>
    `;

    await sendEmail(email, emailSubject, emailMessage);

    res.json({ message: 'Account verified successfully' });
  } catch (err) {
    console.error('Confirm code error:', err);
    res.status(500).json({ message: 'Failed to verify account', error: err.message });
  }
};

module.exports = { sendCode, confirmCode }; 