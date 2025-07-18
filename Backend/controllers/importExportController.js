const Donor = require("../models/Donor");
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const fs = require('fs');

const importDonors = async (req, res) => {
  try {
    const donors = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => donors.push(row))
      .on('end', async () => {
        await Donor.insertMany(donors);
        res.json({ message: 'Donors imported' });
      });
  } catch (err) {
    res.status(500).json({ message: 'Failed to import donors', error: err.message });
  }
};

const exportDonors = async (req, res) => {
  try {
    const donors = await Donor.find();
    const parser = new Parser();
    const csvData = parser.parse(donors);
    res.header('Content-Type', 'text/csv');
    res.attachment('donors.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export donors', error: err.message });
  }
};

module.exports = { importDonors, exportDonors }; 