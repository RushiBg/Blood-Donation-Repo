const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor" },
  date: Date,
  status: { type: String, enum: ["scheduled", "rescheduled", "cancelled", "fulfilled"], default: "scheduled" },
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema); 