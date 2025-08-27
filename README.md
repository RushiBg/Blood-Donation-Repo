# Blood Donation Platform

A full-stack web application for managing blood donations, donor appointments, requests, analytics, and payments. Built with React (frontend) and Node.js/Express/MongoDB (backend).

_Deployed on [Render](https://render.com/) for both frontend and backend._

---

## Features
- User and Admin authentication (JWT-based)
- Donor registration and profile management
- Appointment scheduling and rescheduling
- Blood request creation and fulfillment
- Admin dashboard with analytics and audit logs
- Feedback system
- Stripe payment integration for donations
- Email notifications
- Secure, rate-limited, and CORS-enabled backend

---

## Tech Stack
- **Frontend:** React, Vite, Context API, Axios
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Payments:** Stripe
- **Other:** Multer (file uploads), JWT, CORS, dotenv

---

## Project Structure

```
Blood Donation/
  ├── Backend/                # Node.js/Express/MongoDB backend
  └── blood-donation-frontend/ # React frontend
```

---

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB (local or Atlas)
- Stripe account (for payments)

### 1. Clone the Repository
```sh
git clone https://github.com/RushiBg/Blood-Donation-Repo.git
cd Blood\ Donation
```

### 2. Backend Setup
```sh
cd Backend
npm install
```

#### Environment Variables
Create a `.env` file in `Backend/` with the following:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:5173
```

#### Start Backend
```sh
npm start
# or
node server.js
```

### 3. Frontend Setup
```sh
cd ../blood-donation-frontend
npm install
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

---

## Deployment

The entire site (both frontend and backend) is deployed on [Render](https://blood-donation-frontend-0lc5.onrender.com). You can set up continuous deployment by connecting your GitHub repository to Render and configuring both frontend and backend web services according to your project structure.

---

## Stripe Integration
- The backend uses Stripe Checkout for payments.
- Set up a webhook endpoint in your Stripe dashboard to point to `/api/payment/webhook` on your backend.
- Use the webhook secret in your `.env` file.

---

## API Endpoints (Examples)
- `POST /api/users/login` — User login
- `POST /api/admin/login` — Admin login
- `POST /api/users` — User registration
- `GET /api/appointments` — List all appointments
- `POST /api/appointments` — Schedule appointment
- `PUT /api/appointments/:id/reschedule` — Reschedule appointment
- `GET /api/analytics/stats` — Admin analytics
- `POST /api/payment/create-checkout-session` — Create Stripe Checkout session
- `POST /api/payment/webhook` — Stripe webhook

---

## Contribution
1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---
