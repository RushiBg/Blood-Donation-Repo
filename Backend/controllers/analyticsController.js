const User = require("../models/User");
const Donor = require("../models/Donor");
const Appointment = require("../models/Appointment");

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const admins = await User.countDocuments({ role: 'admin' });
    const totalDonors = await Donor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const verifiedUsers = await User.countDocuments({ verified: true });
    // Donations today: count fulfilled appointments today
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);
    const donationsToday = await Appointment.countDocuments({ status: 'fulfilled', date: { $gte: start, $lte: end } });
    res.json({ totalUsers, admins, totalDonors, totalAppointments, verifiedUsers, donationsToday });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

module.exports = { getStats }; 