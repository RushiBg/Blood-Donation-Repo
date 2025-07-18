const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  bloodGroup: String,
  address: String,
  donations: { type: Number, default: 0 },
  lastDonationDate: Date
});

module.exports = mongoose.model('Donor', donorSchema); 