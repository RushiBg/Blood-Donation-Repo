const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const requestController = require("../controllers/requestController");

// Placeholder for getMyRequests if not implemented
const getMyRequests = (req, res) => res.status(501).json({ message: 'Not implemented' });

router.get("/my", protect, requestController.getMyRequests || getMyRequests);
router.get("/", protect, requestController.getRequests);
router.post("/", protect, requestController.createRequest);
router.put("/:id", protect, requestController.updateRequestStatus);
router.delete("/:id", protect, requestController.deleteRequest);
router.get("/fulfilled/today", protect, async (req, res) => {
  const Request = require("../models/Request");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  try {
    const requests = await Request.find({
      status: "fulfilled",
      $or: [
        { updatedAt: { $gte: today, $lt: tomorrow } },
        { createdAt: { $gte: today, $lt: tomorrow } }
      ]
    }).populate("fulfilledBy");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fulfilled requests", error: err.message });
  }
});

module.exports = router; 