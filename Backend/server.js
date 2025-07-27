const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require("helmet");
const compression = require("compression");

const securityFilter = require('./middleware/securityFilter');
const { generalLimiter, authLimiter, dashboardLimiter } = require('./middleware/rateLimiter');
const errorLogger = require('./middleware/errorLogger');
const upload = require('./middleware/uploadMiddleware');

const app = express();

// Core middlewares
app.use(helmet());
app.use(compression());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(securityFilter);
app.use(generalLimiter);

// Import/Export routes
app.post('/api/data/import/donors', upload.single('file'), require('./controllers/importExportController').importDonors);
app.get('/api/data/export/donors', require('./controllers/importExportController').exportDonors);

// API routes
app.use('/api/users', authLimiter, require('./routes/userRoutes'));
app.use('/api/admin', authLimiter, require('./routes/adminRoutes'));
app.use('/api/verify', authLimiter, require('./routes/verifyRoutes'));
app.use('/api/analytics', dashboardLimiter, require('./routes/analyticsRoutes'));
app.use('/api/reminder', require('./routes/reminderRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));

// Final error handler
app.use((err, req, res, next) => {
  console.error("Internal error:", err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  app.listen(3000, () => console.log("Server running on http://localhost:3000"));
}).catch(err => console.error("MongoDB Error:", err));

// Error logging (once)
app.use(errorLogger);
