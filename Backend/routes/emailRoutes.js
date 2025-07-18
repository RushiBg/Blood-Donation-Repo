const express = require("express");
const router = express.Router();
const { sendVerificationEmail, sendReminderEmail } = require("../controllers/emailController");

router.post("/verify", sendVerificationEmail);
router.post("/reminder", sendReminderEmail);

module.exports = router; 