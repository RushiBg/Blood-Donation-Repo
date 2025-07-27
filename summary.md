# Project Summary: Blood Donation Platform

**Summary:**  
This project demonstrates my ability to build a robust, secure, and user-friendly web application for a real-world use case, handling both backend logic and frontend experience, with standout features that add significant value for users and administrators—including advanced admin tools for monitoring, compliance, and security.

## Features
- Material-UI (MUI) design
- Authentication (JWT)
- User/Admin dashboards
- Blood availability map
- Gamification (badges, leaderboard)
- Dark/Light mode (all new and updated UI components are styled for both)
- Notifications
- Responsive & accessible
- AI-powered features (Smart Matching, Health Screening, Sentiment Analysis)

## Dashboards
- **Admin Dashboard**:
  - **Analytics**: Real-time stats for users, donors, appointments, verified users, and donations today.
  - **Audit Logs**: Modern, scrollable card-style UI with zebra striping, icons, and a visible scroll icon when overflowed. Enhanced readability and works in both dark and light mode.
  - **Donor Management**: Add, edit, delete, import/export donors.
  - **Blood Requests**: Manage and fulfill blood requests with AI-powered smart matching.
  - **Appointments**: View all appointments.
  - **Payments**: All user payments are now shown in the Payments tab (quick demo fix; for production, a Stripe webhook is recommended).
  - **Feedback**: New Feedback tab displays all user feedback with user name, user ID, rating, message, and date. The table matches the look and feel of the user appointments section for consistency.
  - **Reminders**: Manual appointment reminders.
- **User Dashboard**:
  - Profile, appointment booking/history, blood request submission/history, feedback form, leaderboard/gamification, payment section, and reminders info.
  - AI Health Screening: Interactive chatbot for health assessment before appointments.
  - Smart Matching: AI-powered donor-recipient matching for blood requests.
  - Sentiment Analysis: Real-time feedback sentiment detection.
  - Reminders info: Users are informed that reminders are sent automatically before appointments.

## Backend/API
- Feedback fetching for admin now populates user info (name, ID) for display in the admin dashboard.
- Payments are recorded and shown in the admin dashboard after user payment (demo logic).

## User Experience
- Real-time feedback and notifications (snackbars, alerts)
- Intuitive navigation and clear separation of admin/user features
- Responsive layout for all devices
- Enhanced accessibility and modern typography
- Improved UI clarity: Reminders, audit logs, and feedback are visually separated and styled for better usability.

## Technologies Used
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer, Stripe
- **Frontend**: React, Material UI, Axios, React Router, Context API, Google Fonts

## What Makes This Project Stand Out
- **AI-powered features**: Smart donor matching, health screening chatbot, and sentiment analysis
- **Admin analytics dashboard** for real-time insights
- **Bulk donor import/export via CSV**
- **Real-time feedback and notification system**
- **Session-based authentication with 24-hour expiry** for enhanced security
- **Payment integration** for donations
- **Modern, responsive UI with custom fonts**
- **Leaderboard and gamification** to encourage donations
- **Email verification and automated reminders**
- **Audit logging and advanced security features**
- **Admin dashboard tools for monitoring and compliance** (audit logs table, reminders control, feedback review)

## What I Did / Learned
- Designed and implemented a full-stack app from scratch
- Built secure authentication and role-based access
- Developed complex CRUD/data management for admins and users
- Integrated third-party services (email, payments)
- Implemented AI-powered features for enhanced user experience
- Focused on clean, modern UI/UX and responsive design
- Applied best practices in code, security, and user experience
- Built user-friendly admin tools for monitoring, compliance, and traceability

## Recent Updates
- **AI Analytics Dashboard Removed**: Simplified admin interface by removing the AI Analytics tab
- **Streamlined Admin Experience**: Focused on core functionality while maintaining AI features in user-facing components
- **Enhanced Error Handling**: Improved rate limiting and request management
- **UI/UX Improvements**: Modern design updates with red theme, better spacing, and enhanced visual appeal

---