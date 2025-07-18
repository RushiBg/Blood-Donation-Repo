const Donor = require("../models/Donor");

const getDonors = async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch donors', error: err.message });
  }
};

const createDonor = async (req, res) => {
  try {
    const donor = await Donor.create(req.body);
    res.status(201).json(donor);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create donor', error: err.message });
  }
};

const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(donor);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update donor', error: err.message });
  }
};

const deleteDonor = async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donor deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete donor', error: err.message });
  }
};

module.exports = { getDonors, createDonor, updateDonor, deleteDonor }; 