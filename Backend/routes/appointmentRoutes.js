const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getAllAppointments } = require("../controllers/allAppointments");
const Appointment = require("../models/Appointment");

// Get user's appointments
router.get("/my", protect, async (req, res) => {
  try {
    const appts = await Appointment.find({ userId: req.user._id });
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Get all appointments (all authenticated users)
router.get("/", protect, getAllAppointments);

// Schedule a new appointment
router.post("/", protect, async (req, res) => {
  try {
    const { date, reason } = req.body;
    const appt = await Appointment.create({
      userId: req.user._id,
      date,
      reason,
      status: "scheduled"
    });
    res.status(201).json(appt);
  } catch (err) {
    res.status(500).json({ message: "Failed to schedule appointment", error: err.message });
  }
});

// Reschedule an appointment
router.put("/:id/reschedule", protect, async (req, res) => {
  try {
    const { date, reason } = req.body;
    const appt = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { date, reason, status: "rescheduled" },
      { new: true }
    );
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: "Failed to reschedule appointment", error: err.message });
  }
});

module.exports = router; 