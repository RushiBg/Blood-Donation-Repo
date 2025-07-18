const User = require("../models/User");

const sendCode = async (req, res) => {
  // For demo, just return success
  res.json({ message: 'Verification code sent' });
};

const confirmCode = async (req, res) => {
  // For demo, just set verified true
  try {
    await User.findByIdAndUpdate(req.user._id, { verified: true });
    res.json({ message: 'Account verified' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify', error: err.message });
  }
};

module.exports = { sendCode, confirmCode }; 