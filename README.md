# Eatoes Admin Dashboard

A full-stack restaurant admin dashboard for managing menu items and orders.

## Features
- Menu Management: Add, edit, delete, search, and filter menu items by name, ingredient, course, and availability.
- Orders Dashboard: View, filter, and update order statuses with detailed order info.
- Responsive, modern UI with Tailwind CSS.
- Toast notifications for all actions and errors.
- Optimistic UI for availability toggling.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, react-hot-toast
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Deployment:** Netlify (frontend), Render/MongoDB Atlas (backend/db)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB)

### Backend Setup
1. `cd backend`
2. Copy `.env.example` to `.env` and set your MongoDB URI.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the database (optional, for demo data):
   ```bash
   node seed.js
   ```
5. Start the backend:
   ```bash
   npm start
   ```

### Frontend Setup
1. `cd frontend/eatoes`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and set your API URL (e.g. `VITE_API_URL=http://localhost:5000/api`)
4. Start the frontend:
   ```bash
   npm run dev
   ```

### Deployment
- **Frontend (Netlify):**
  - Build command: `npm run build`
  - Publish directory: `dist`
- **Backend (Render):**
  - Connect your repo, set build/start commands, and add environment variables.

## Folder Structure
```
backend/
  app.js
  models/
  routes/
  seed.js
  ...
frontend/
  eatoes/
    src/
    public/
    ...
```

## Environment Variables
- **Backend:**
  - `MONGO_ATLAS_URI` (MongoDB connection string)
  - `PORT` (default: 5000)
- **Frontend:**
  - `VITE_API_URL` (API base URL)

## License
MIT

---

Built with ❤️ for restaurant owners and staff.
