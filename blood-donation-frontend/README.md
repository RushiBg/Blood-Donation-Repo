# Blood Donation Frontend

A modern React (Vite) frontend for the Blood Donation platform.

## Features
- Material-UI (MUI) design
- Authentication (JWT)
- User/Admin dashboards
- Blood availability map
- Gamification (badges, leaderboard)
- Dark/Light mode
- Notifications
- Responsive & accessible

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and set your environment variables:
   - `VITE_API_BASE_URL` (e.g., http://localhost:3000/api)
   - `VITE_MAP_API_KEY` (if using a map provider)
   - `VITE_STRIPE_PUBLIC_KEY` (for payments)
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/api/` - API calls
- `src/components/` - Reusable UI
- `src/context/` - Context providers
- `src/features/` - Feature modules
- `src/pages/` - Route pages
- `src/routes/` - Route definitions
- `src/theme/` - MUI theme config

---

Connect this frontend to your backend API for a full-stack experience!
