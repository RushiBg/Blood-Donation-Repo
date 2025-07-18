const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const securityFilter = require('./middleware/securityFilter');
const rateLimiter = require('./middleware/rateLimiter');
const errorLogger = require('./middleware/errorLogger');
const upload = require('./middleware/uploadMiddleware');
const helmet = require("helmet");
const compression = require("compression");

// Load env vars
dotenv.config();

const app = express();

// CORS: Allow frontend dev server
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(securityFilter);
app.use(rateLimiter);
app.use(errorLogger);

// File upload route (for import)
app.post('/api/data/import/donors', upload.single('file'), require('./controllers/importExportController').importDonors);
app.get('/api/data/export/donors', require('./controllers/importExportController').exportDonors);

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/verify', require('./routes/verifyRoutes'));

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Server error', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  app.listen(3000, () => console.log("Server running on port 3000"));
}).catch(err => console.error(err));
app.use(errorLogger); 