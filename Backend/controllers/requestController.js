const Request = require("../models/Request");
const AuditLog = require("../models/AuditLog");
const Donor = require("../models/Donor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const logAction = async (admin, action, targetModel, targetId) => {
  await AuditLog.create({
    adminId: admin._id,
    adminEmail: admin.email,
    action,
    targetModel,
    targetId
  });
};

const createRequest = async (req, res) => {
  try {
    const { requesterName, requesterEmail, bloodGroupNeeded, quantity } = req.body;
    const newRequest = await Request.create({
      requesterName,
      requesterEmail,
      bloodGroupNeeded,
      quantity
    });
    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: "Failed to create request", error: err.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('fulfilledBy');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requesterEmail: req.user.email }).populate('fulfilledBy');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your requests", error: err.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const allowedStatuses = ["pending", "fulfilled", "cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const update = { status: req.body.status };
    if (req.body.status === "fulfilled" && req.body.fulfilledBy) {
      update.fulfilledBy = req.body.fulfilledBy;
    }
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    // Update donor's lastDonationDate and donations count if fulfilled
    if (req.body.status === "fulfilled" && req.body.fulfilledBy) {
      try {
        const fulfillmentDate = request && request.updatedAt ? request.updatedAt : new Date();
        const donor = await Donor.findById(req.body.fulfilledBy);
        if (donor) {
          donor.lastDonationDate = fulfillmentDate;
          donor.donations = (donor.donations || 0) + 1;
          await donor.save();
        }
        // Create a fulfilled appointment for today if not already exists
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await Appointment.findOne({
          donorId: req.body.fulfilledBy,
          status: "fulfilled",
          date: { $gte: today }
        });
        if (!existing) {
          let userId = null;
          if (request && request.requesterEmail) {
            const user = await User.findOne({ email: request.requesterEmail });
            if (user) userId = user._id;
          }
          await Appointment.create({
            donorId: req.body.fulfilledBy,
            userId,
            date: new Date(),
            status: "fulfilled"
          });
        }
      } catch (err) {
        // log error but don't block
      }
    }
    // If cancelling a previously fulfilled request, update today's fulfilled appointment to status 'cancelled'
    if (req.body.status === "cancelled" && request && request.status === "fulfilled") {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let userId = null;
        if (request.requesterEmail) {
          const user = await User.findOne({ email: request.requesterEmail });
          if (user) userId = user._id;
        }
        const apptQuery = {
          donorId: request.fulfilledBy,
          userId,
          status: "fulfilled",
          date: { $gte: today }
        };
        await Appointment.findOneAndUpdate(apptQuery, { status: "cancelled" }, { new: true });
      } catch (err) {}
    }
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    await logAction(req.user, "UPDATE", "Request", req.params.id);
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to update request", error: err.message });
  }
};

const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete request", error: err.message });
  }
};

module.exports = { createRequest, getRequests, updateRequestStatus, deleteRequest, getMyRequests }; 