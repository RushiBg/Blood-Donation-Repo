const sendEmail = require("../utils/email");

const sendVerificationEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    await sendEmail(email, 'Verification Code', `Your code: ${code}`);
    res.json({ message: 'Verification email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send verification email', error: err.message });
  }
};

const sendReminderEmail = async (req, res) => {
  const { email, message } = req.body;
  try {
    await sendEmail(email, 'Appointment Reminder', message);
    res.json({ message: 'Reminder email sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send reminder email', error: err.message });
  }
};

module.exports = { sendVerificationEmail, sendReminderEmail }; 