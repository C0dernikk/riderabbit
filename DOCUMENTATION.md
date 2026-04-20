# RideRabbit Platform Architecture & Documentation

Welcome to the technical documentation for **RideRabbit**, a comprehensive, multi-role Vehicle Rental marketplace platform built on the MERN stack. This document is intended to help developers, maintainers, and stakeholders understand the system architecture, code structure, and data flow.

---

## 1. System Overview

RideRabbit connects everyday users seeking rental vehicles with vendors who list their fleets. The platform manages the entire lifecycle of a rental—from geospatial searching and booking, to payment processing, real-time messaging, and administrative oversight.

### Tech Stack
- **Frontend**: React.js (Vite), TailwindCSS, Redux Toolkit, Framer Motion (Animations).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **Real-Time & Websockets**: Socket.io.
- **Third-Party Integrations**:
  - **Razorpay**: Payment gateway for secure checkout and vendor payouts.
  - **Resend**: Transactional email service (Welcome emails, OTPs, receipts).
  - **Cloudinary**: Cloud storage for vehicle images, profile pictures, and RC documents.
  - **Nominatim (OpenStreetMap)**: Free, open-source geocoding for translating addresses into Lat/Lng coordinates.

---

## 2. User Roles & Workflows

The platform supports three distinct user roles, each with specialized dashboards and permissions:

### 👤 1. User (Renter)
- **Search Flow**: Users search for vehicles based on dates and location. The platform uses OpenStreetMap to convert their location into coordinates and queries MongoDB using `$near` to find cars within a 50km radius.
- **Booking Flow**: Users view vehicle details, select variants, and proceed to checkout using Razorpay.
- **Chat Flow**: Once a booking is initiated, users can chat in real-time with the vendor via the "Messenger Hub" to coordinate pickups.

### 🏪 2. Vendor (Vehicle Owner)
- **Fleet Management**: Vendors can add new vehicles to their fleet by uploading details and images. Vehicle locations are converted to coordinates on the fly.
- **Approval Workflow**: Newly added vendor vehicles are marked as `isApproved: false` and placed in a pending state until an Admin reviews them.
- **Earnings**: Vendors have a dashboard displaying their lifetime revenue and booking history.

### 🛡️ 3. Admin (Superuser)
- **Oversight**: Admins have global access to platform metrics (total users, total revenue, active bookings).
- **Moderation**: Admins review and approve/reject pending vehicles submitted by vendors.
- **Master Data**: Admins can add their own "Platform-owned" vehicles directly to the system.

---

## 3. Codebase Structure

The repository is structured as a monorepo containing both the frontend client and the backend server.

### Backend (`/backend`)
Follows a standard Model-View-Controller (MVC) architecture adapted for RESTful APIs.

```text
/backend
 ├── /config           # Database connection and Environment configurations
 ├── /controllers      # Business logic (separated by role: admin, user, vendor)
 │    ├── /adminControllers
 │    ├── /userControllers
 │    └── /vendorControllers
 ├── /models           # Mongoose schemas (User, Vehicle, Booking, Message, etc.)
 ├── /routes           # Express route definitions (API endpoints)
 ├── /services         # Background tasks, Cron jobs, Email services
 ├── /utils            # Helper functions (JWT Auth, Multer, Cloudinary, Email formatters)
 ├── server.js         # Entry point for the Express application
 └── socket.js         # Socket.io configuration for real-time chat
```

### Frontend (`/client`)
Built with Vite and styled with TailwindCSS, utilizing a modular component architecture.

```text
/client
 ├── /src
 │    ├── /app         # Redux store configuration
 │    ├── /components  # Reusable UI elements (Buttons, Inputs, LocationAutocomplete)
 │    ├── /context     # React Contexts (SocketContext for real-time chat)
 │    ├── /features    # Redux slices (authSlice, bookingsSlice, uiSlice, vehiclesSlice)
 │    ├── /pages       # Page-level components organized by role
 │    │    ├── /admin
 │    │    ├── /user
 │    │    └── /vendor
 │    ├── /services    # Axios API wrappers for communicating with the backend
 │    ├── /utils       # Frontend utility functions (cn for Tailwind class merging)
 │    ├── App.jsx      # Root component containing Error Boundaries and Router
 │    └── index.css    # Global CSS and Tailwind directives
```

---

## 4. Key Architectural Decisions

### 📍 Geospatial Searching
Instead of relying on rigid, pre-defined city lists, RideRabbit implements a dynamic geospatial search engine.
1. The frontend `LocationAutocomplete` queries Nominatim to get GPS coordinates for user searches.
2. The backend uses MongoDB's `2dsphere` index and the `$near` operator to fetch vehicles strictly within a defined radius (e.g., 50km).

### 💬 Real-Time Messenger Hub
Real-time chat is decoupled from the main page UI.
- The `MessengerHub.jsx` component sits at the root `<App />` level, meaning it persists across page navigations.
- It leverages Redux to manage global open/close states and unread counts, and listens to `socket.io` events to append new messages instantaneously.

### 🔐 Authentication & Security
- **JWT Strategy**: Short-lived Access Tokens (passed in memory/headers) and long-lived Refresh Tokens (stored in HTTP-only, secure cookies).
- **Role-Based Access Control (RBAC)**: Backend routes are protected by middleware (`verifyUser`, `verifyAdmin`, `verifyVendor`) to ensure users cannot access unauthorized endpoints.

### 🎨 UI/UX Philosophy
- **Aesthetic**: Premium Emerald Green and Primary Blue palette with "Glassmorphism" styling.
- **Micro-interactions**: Extensive use of Framer Motion for page transitions, modal pop-ups, and hover states to create a highly responsive, app-like feel.

---

## 5. Deployment Architecture

The application is designed to be hosted in a decoupled, serverless/cloud environment:
- **Frontend**: Deployed on Vercel (`https://rentrabbit.app`), benefiting from edge caching and fast global CDN delivery.
- **Backend**: Deployed on Render (`https://api.rentrabbit.app`), providing a robust Node.js runtime.
- **Database**: Hosted on MongoDB Atlas, ensuring high availability and automated backups.
- **Cross-Origin Resource Sharing (CORS)**: The backend is strictly configured to only accept requests from the verified frontend domains, mitigating CSRF attacks.

---

## 6. How to Run Locally

1. **Clone the repository.**
2. **Install Dependencies:**
   - Backend: `cd backend && npm install`
   - Frontend: `cd client && npm install`
3. **Environment Setup:** Ensure both `/backend/.env` and `/client/.env` contain the necessary local testing keys.
4. **Start Development Servers:**
   - Backend: `npm run dev` (Runs on port 3000)
   - Frontend: `npm run dev` (Runs on port 5173)

---
*Documentation generated dynamically based on platform architecture as of latest build.*
