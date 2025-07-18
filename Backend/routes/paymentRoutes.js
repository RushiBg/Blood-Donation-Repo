const express = require("express");
const router = express.Router();
const { createCheckoutSession } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const Payment = require("../models/Payment");
const User = require("../models/User");
const crypto = require("crypto");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/create-session", protect, createCheckoutSession);
router.get("/success", async (req, res) => {
  const { email, amount, currency } = req.query;
  const displayCurrency = (currency || "USD").toUpperCase();
  // DEMO: Create Payment record if not already exists for this email+amount+today
  try {
    if (email && amount) {
      const user = await User.findOne({ email });
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await Payment.findOne({
          userId: user._id,
          amount: Number(amount),
          createdAt: { $gte: today }
        });
        if (!existing) {
          await Payment.create({
            paymentId: crypto.randomBytes(8).toString("hex"),
            userId: user._id,
            amount: Number(amount)
          });
        }
      }
    }
  } catch (err) {
    console.error("Failed to record payment:", err);
  }
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Success</title>
        <script>
          window.onload = function() {
            alert("Payment successful!");
          }
        </script>
      </head>
      <body>
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment.</p>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Email</th>
            <th>Amount</th>
            <th>Currency</th>
          </tr>
          <tr>
            <td>${email || "N/A"}</td>
            <td>${amount || "N/A"}</td>
            <td>${displayCurrency}</td>
          </tr>
        </table>
      </body>
    </html>
  `);
});

router.get("/cancel", (req, res) => {
  const { email, amount, currency } = req.query;
  const displayCurrency = (currency || "USD").toUpperCase();
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Cancelled</title>
        <script>
          window.onload = function() {
            alert("Payment cancelled.");
          }
        </script>
      </head>
      <body> 
        <h2>Payment Cancelled</h2>
        <p>Your payment has been cancelled.</p>
        <table border="1" cellpadding="8" cellspacing="0">
          <tr>
            <th>Email</th>
            <th>Amount</th>
            <th>Currency</th>
          </tr>
          <tr>
            <td>${email || "N/A"}</td>
            <td>${amount || "N/A"}</td>
            <td>${displayCurrency}</td>
          </tr>
        </table>
      </body>
    </html> 
  `);
});

// Stripe webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const email = session.customer_email;
      const amount = session.amount_total / 100;
      const user = await User.findOne({ email });
      if (user) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await Payment.findOne({
          userId: user._id,
          amount: amount,
          createdAt: { $gte: today }
        });
        if (!existing) {
          await Payment.create({
            paymentId: session.id,
            userId: user._id,
            amount: amount
          });
        }
      }
    } catch (err) {
      console.error('Failed to record payment from Stripe webhook:', err);
    }
  }
  res.status(200).json({ received: true });
});

module.exports = router; 