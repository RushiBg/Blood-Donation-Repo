const Request = require("../models/Request");
const AuditLog = require("../models/AuditLog");
const Donor = require("../models/Donor");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const sendEmail = require("../utils/email");

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
    
    // Get the request before updating to check previous status
    const previousRequest = await Request.findById(req.params.id);
    if (!previousRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    const update = { status: req.body.status };
    if (req.body.status === "fulfilled" && req.body.fulfilledBy) {
      update.fulfilledBy = req.body.fulfilledBy;
    }
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { ...update, updatedAt: new Date() },
      { new: true }
    );
    
    // Send email notification to requester if status has changed
    if (request && request.requesterEmail && previousRequest.status !== req.body.status) {
      const statusMessages = {
        pending: "Your blood request is now pending review.",
        fulfilled: "Great news! Your blood request has been fulfilled.",
        cancelled: "Your blood request has been cancelled."
      };
      
      const statusSubjects = {
        pending: "Blood Request Status Update",
        fulfilled: "Blood Request Fulfilled",
        cancelled: "Blood Request Cancelled"
      };
      
      // Find requester name if available
      let requesterName = request.requesterName || 'Requester';
      try {
        const user = await User.findOne({ email: request.requesterEmail });
        if (user && user.name) {
          requesterName = user.name;
        }
      } catch (err) {
        // Continue with default name if error occurs
      }
      
      // Send status update email with more detailed information
      const bloodGroup = request.bloodGroupNeeded || 'requested blood';
      const quantity = request.quantity ? `${request.quantity} units` : 'requested quantity';
      
      let statusMessage;
      if (request.status === 'fulfilled') {
        statusMessage = `
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="font-weight: bold; color: #27ae60;">Great news! Your blood request has been fulfilled.</p>
          </div>
          <p>Your request for <strong>${quantity}</strong> of <strong>${bloodGroup}</strong> blood type has been successfully fulfilled.</p>
          <p>Thank you for using our Blood Donation System. Your request has been processed on ${new Date().toLocaleDateString()}.</p>
          <p>If you have any questions or need further assistance, please contact our support team.</p>
        `;
      } else if (request.status === 'cancelled') {
        statusMessage = `
          <div style="background-color: #fde8e8; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="font-weight: bold; color: #e53e3e;">Your blood request has been cancelled.</p>
          </div>
          <p>Your request for <strong>${quantity}</strong> of <strong>${bloodGroup}</strong> blood type has been cancelled.</p>
          <p>If this was not expected or if you need to create a new request, please log in to your account.</p>
          <p>If you have any questions or need further assistance, please contact our support team.</p>
        `;
      } else {
        statusMessage = `
          <div style="background-color: #e6f7ff; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
            <p style="font-weight: bold; color: #0066cc;">Your blood request status has been updated to: ${request.status}</p>
          </div>
          <p>Your request for <strong>${quantity}</strong> of <strong>${bloodGroup}</strong> blood type is currently being processed.</p>
          <p>We will notify you of any further updates regarding your request.</p>
          <p>If you have any questions or need further assistance, please contact our support team.</p>
        `;
      }
      
      const statusSubject = statusSubjects[request.status] || "Blood Request Status Update";
      
      await sendEmail(
        request.requesterEmail,
        statusSubject,
        statusMessage,
        requesterName
      );
    }
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