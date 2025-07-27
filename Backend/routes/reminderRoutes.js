const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { sendReminders } = require("../jobs/reminderJob");

// Test reminder endpoint
router.get("/test-reminder", protect, adminOnly, async (req, res) => {
  try {
    const result = await sendReminders();
    res.json(result);
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ message: 'Failed to send reminders', error: error.message });
  }
});

// Send reminders to all users with upcoming appointments
router.post("/send", protect, adminOnly, async (req, res) => {
  try {
    const result = await sendReminders();
    res.json(result);
  } catch (error) {
    console.error('Reminder error:', error);
    res.status(500).json({ message: 'Failed to send reminders', error: error.message });
  }
});

module.exports = router; 