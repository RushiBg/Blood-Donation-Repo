const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { submitFeedback, getAllFeedback } = require("../controllers/feedbackController");
const { adminOnly } = require("../middleware/adminMiddleware");

router.post("/", protect, submitFeedback);
router.get("/", protect, adminOnly, getAllFeedback);

module.exports = router; 