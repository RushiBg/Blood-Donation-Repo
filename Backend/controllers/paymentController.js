const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const { amount, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Blood Donation',
            },
            unit_amount: Math.round(Number(amount) * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:3000/api/payment/success?email=${encodeURIComponent(email)}&amount=${amount}`,
      cancel_url: "http://localhost:3000/api/payment/cancel",
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Stripe session creation failed', error: err.message });
  }
};

module.exports = { createCheckoutSession }; 