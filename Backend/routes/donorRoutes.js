const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getDonors, createDonor, updateDonor, deleteDonor } = require("../controllers/donorController");

router.get("/", protect, getDonors);
router.post("/", protect, createDonor);
router.put("/:id", protect, updateDonor);
router.delete("/:id", protect, deleteDonor);

module.exports = router; 