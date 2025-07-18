const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const AuditLog = require("../models/AuditLog");

const {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  sendNotification
} = require("../controllers/adminController");

// 🔓 Public Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// 🔐 Protected Routes
router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.post("/notify", protect, adminOnly, sendNotification);
router.post("/upload", protect, adminOnly, upload.single("image"), (req, res) => {
  res.json({
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

router.get("/audit-logs", protect, adminOnly, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
});

module.exports = router;