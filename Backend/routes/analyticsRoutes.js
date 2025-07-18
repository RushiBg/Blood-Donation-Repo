const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const { getDonationsThisYear } = require("../controllers/appointmentStats");
const { getAllAppointments } = require("../controllers/allAppointments");
const { getAllPayments } = require("../controllers/allPayments");
const { getStats } = require("../controllers/analyticsController");

router.get("/donations-this-year", protect, adminOnly, getDonationsThisYear);
router.get("/appointments", protect, adminOnly, getAllAppointments);
router.get("/payments", protect, adminOnly, getAllPayments);
router.get("/stats", protect, adminOnly, getStats);

module.exports = router; 