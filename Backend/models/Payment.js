const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema); 