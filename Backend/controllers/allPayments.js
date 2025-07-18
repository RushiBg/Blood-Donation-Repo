const Payment = require("../models/Payment");
const User = require("../models/User");

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments", error: err.message });
  }
};

module.exports = { getAllPayments }; 