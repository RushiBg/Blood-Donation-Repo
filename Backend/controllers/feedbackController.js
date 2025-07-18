const Feedback = require("../models/Feedback");

const submitFeedback = async (req, res) => {
  const { message, rating } = req.body;
  const feedback = await Feedback.create({
    userId: req.user._id,
    message,
    rating
  });
  res.status(201).json(feedback);
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch feedback", error: err.message });
  }
};

module.exports = { submitFeedback, getAllFeedback }; 