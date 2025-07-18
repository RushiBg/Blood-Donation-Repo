const Appointment = require("../models/Appointment");
const Donor = require("../models/Donor");
const User = require("../models/User");

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('donorId', 'name')
      .populate('userId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
};

module.exports = { getAllAppointments }; 