const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { sendCode, confirmCode } = require("../controllers/verifyController");

router.post("/send", protect, sendCode);
router.post("/confirm", protect, confirmCode);

module.exports = router; 