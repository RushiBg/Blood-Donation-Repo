const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requesterName: String,
  requesterEmail: String,
  bloodGroupNeeded: String,
  quantity: Number,
  status: { type: String, enum: ['pending', 'fulfilled', 'cancelled'], default: 'pending' },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', requestSchema); 