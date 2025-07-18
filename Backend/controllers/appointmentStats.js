const Appointment = require("../models/Appointment");
const Donor = require("../models/Donor");

// Returns an array of { donorId, donationsThisYear }
const getDonationsThisYear = async (req, res) => {
  try {
    // Aggregate all fulfilled appointments by donor (ignore year for demo)
    const stats = await Appointment.aggregate([
      { $match: { status: "fulfilled" } },
      { $group: { _id: "$donorId", donationsThisYear: { $sum: 1 } } }
    ]);
    // Map to donorId: count
    const map = {};
    stats.forEach(s => { map[s._id?.toString()] = s.donationsThisYear; });
    // Optionally, return all donors with 0 if not present
    const donors = await Donor.find();
    const result = donors.map(d => ({
      donorId: d._id,
      donationsThisYear: map[d._id.toString()] || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};

module.exports = { getDonationsThisYear }; 