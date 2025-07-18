const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = (req, res) => {
  res.json({ message: 'Admin registered (demo)' });
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: 'Failed to login', error: err.message });
  }
};

const getDashboardStats = (req, res) => {
  res.json({ users: 10, donors: 5, requests: 3 });
};

const sendNotification = (req, res) => {
  res.json({ message: 'Notification sent (demo)' });
};

module.exports = { registerAdmin, loginAdmin, getDashboardStats, sendNotification }; 