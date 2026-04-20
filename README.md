<div align="center">
  <img src="./client/src/pages/admin/data/welcome-bg.svg" alt="RideRabbit Logo" width="200" />
  <h1>RideRabbit</h1>
  <p><strong>Premium P2P Vehicle Rental & Fleet Management Platform</strong></p>
  <p>
    <img src="https://img.shields.io/badge/MERN-Stack-green" alt="MERN Stack">
    <img src="https://img.shields.io/badge/Status-Production_Ready-blue" alt="Production Ready">
    <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License">
  </p>
</div>

---

## 🚀 Overview

**RideRabbit** is a scalable, end-to-end multi-tenant vehicle rental platform. It bridges the gap between everyday users looking for short-term transportation and vehicle owners (vendors) looking to monetize their idle assets.

### 💡 The Problem It Solves
Traditional car rental services are plagued by rigid locations, high overheads, and antiquated software. RideRabbit solves this by providing a hyper-local, peer-to-peer marketplace powered by modern geospatial search. Vendors can list vehicles anywhere, and users can instantly discover available cars precisely near their location.

---

## ✨ Features

### ✅ Implemented Features
* **Geospatial Discovery (`$near`)**: Dynamic address-to-coordinate resolution using OpenStreetMap (Nominatim API) allowing users to find vehicles exactly near them.
* **Role-Based Workflows**: Segregated dashboards and experiences for **Users**, **Vendors**, and **Administrators**.
* **Real-Time Communication**: Integrated WebSocket (Socket.io) "Messenger Hub" for instant User ↔ Vendor coordination.
* **Automated Payments & Payouts**: Secure checkout pipeline using **Razorpay**, tracking vendor lifetime earnings.
* **Smart Filtering & Variants**: Advanced Redux state management to filter vehicles by transmission, fuel type, seating capacity, and car type.
* **Cloud Infrastructure**: Scalable image storage using **Cloudinary** for RC documents, vehicle profiles, and avatars.
* **Transactional Emails**: Automated receipts and welcome emails delivered via the **Resend API**.

### 🚧 Roadmap & Future Improvements (For Production Scaling)
* **Automated KYC**: Integration with third-party Identity Verification APIs (e.g., Onfido) to automate driver license checks.
* **Dynamic Pricing Engine**: Algorithmic surge pricing based on weekend demand or regional vehicle scarcity.
* **Push Notifications**: Progressive Web App (PWA) configuration for native mobile push alerts.
* **Analytics Export**: CSV/PDF generation for Admin financial reporting.

---

## 🛠️ Tech Stack & Technologies Used

<div align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=mongodb,express,react,nodejs&theme=light" alt="MERN Stack" />
  </a>
  <br><br>
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=vite,redux,tailwind,framer,git,github,vercel&theme=light" alt="Tools & Services" />
  </a>
</div>

<br>

### 💻 Frontend Architecture
* **Core Framework**: React 18 powered by Vite for blazing-fast HMR and optimized production builds.
* **State Management**: Redux Toolkit for predictable global state management (Auth, UI states, Booking parameters).
* **Styling Engine**: Tailwind CSS utilized for highly customized, responsive layouts featuring modern glassmorphism UI elements.
* **Animations**: Framer Motion orchestrates complex micro-interactions, page transitions, and responsive modal behaviors.
* **Routing**: React Router v6 handling protected routes, role-based redirects, and nested layouts.

### ⚙️ Backend Architecture
* **Runtime**: Node.js executing an Express.js RESTful API architecture.
* **Database**: MongoDB hosted on Atlas, utilizing Mongoose ORM for strict schema validation and advanced geospatial querying (`$near`).
* **Real-Time Engine**: Socket.io enabling bidirectional, event-driven communication for the User-Vendor chat hub.
* **Authentication**: Industry-standard JSON Web Tokens (JWT). Access tokens are memory-bound (12h TTL), while Refresh tokens are secured via `HttpOnly`, `SameSite=None` cookies.

### 🔌 Third-Party API Integrations
* **Payments**: Razorpay handling seamless checkout sessions, webhooks, and vendor tracking.
* **Emails**: Resend API routing high-deliverability transactional emails via custom HTML templates.
* **Storage**: Cloudinary managing and optimizing dynamic multipart form uploads (Images/Documents).
* **Geolocation**: Nominatim (OpenStreetMap) providing free, precise forward-geocoding for maps.

---

## 📂 Repository Structure

The project follows a scalable Monorepo structure:

```text
RideRabbit/
│
├── backend/                  # Express/Node.js API
│   ├── config/               # DB & Environment setup
│   ├── controllers/          # Business logic (Admin, User, Vendor)
│   ├── models/               # Mongoose Schemas
│   ├── routes/               # API Endpoints
│   ├── services/             # Background Tasks & Cron
│   ├── utils/                # JWT Auth, Multer, Cloudinary
│   ├── server.js             # Entry Point
│   └── socket.js             # WebSocket Configuration
│
├── client/                   # Vite/React Frontend
│   ├── src/
│   │   ├── app/              # Redux Store Configuration
│   │   ├── components/       # Reusable UI Elements
│   │   ├── features/         # Redux Slices (auth, vehicles, ui)
│   │   ├── pages/            # View Components
│   │   └── services/         # Axios API Wrappers
│   └── index.html            # HTML Template
│
├── .env.example              # Centralized environment variables guide
├── CONTRIBUTING.md           # Developer contributing guidelines
├── DOCUMENTATION.md          # In-depth architectural overview
└── README.md                 # Project Overview
```

---

## 💻 Setup Instructions

Follow these steps to run the platform locally.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/riderabbit.git
cd riderabbit
```

### 2. Install Dependencies
You need to install packages for both the frontend and backend.
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Variables
Copy the `.env.example` file located in the root directory and create two new files:
1. `backend/.env`
2. `client/.env`

Fill in the required values (MongoDB URI, Cloudinary API Keys, Razorpay Test Keys, etc.).

### 4. Start the Application
Open two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
# Server will start on http://localhost:3000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client will start on http://localhost:5173
```

---

## 🌐 API Overview

The RESTful API is structured around primary domain entities. Below is a high-level overview.

| Domain | Method | Route | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/register` | Register a new user/vendor | No |
| **Auth** | `POST` | `/api/auth/login` | Authenticate and retrieve JWT | No |
| **Auth** | `POST` | `/api/auth/refresh` | Renew Access Token via secure cookie | Yes |
| **Vehicles** | `GET` | `/api/user/vehicles/search` | Search vehicles via geospatial `$near` query | No |
| **Vehicles** | `POST` | `/api/vendor/vehicle` | Add a new vehicle to fleet | Yes (Vendor) |
| **Bookings** | `POST` | `/api/bookings/create` | Initialize Razorpay booking session | Yes (User) |
| **Bookings** | `POST` | `/api/bookings/webhook` | Process Razorpay payment success | No (Webhook) |
| **Messages** | `GET` | `/api/messages/inbox/all` | Fetch all active chat threads | Yes |

*See `/backend/routes` for complete endpoint configurations.*

---

## 🔒 Security Best Practices

This project strictly adheres to modern security standards:
* **JWT Access/Refresh Flow**: Access tokens are short-lived (12h) and stored in memory/headers. Refresh tokens are long-lived (7d) and stored in `HttpOnly`, `Secure`, `SameSite=None` cookies to mitigate XSS and CSRF attacks.
* **Role-Based Access Control (RBAC)**: Custom Express middlewares (`verifyUser`, `verifyVendor`, `verifyAdmin`) validate both the token and the user's role hierarchy before processing requests.
* **Input Sanitization**: Mongoose schemas enforce strict type checking and `enum` validations.
* **Geospatial Integrity**: Vehicle coordinates are structurally validated as GeoJSON `Point` arrays before insertion.

---

## ☁️ Deployment Guide

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Set the Root Directory to `/client`.
4. Add your frontend Environment Variables.
5. Deploy.
6. **Domain Setup**: Bind your custom domain (e.g., `rentrabbit.app`).

### Backend Deployment (Render)
1. Import the repository in Render as a "Web Service".
2. Set Root Directory to `backend`, Build Command to `npm install`, and Start Command to `npm start`.
3. Add backend Environment Variables (Set `NODE_ENV=production` and `CLIENT_URLS=https://rentrabbit.app`).
4. **Domain Setup**: Add an API subdomain (e.g., `api.rentrabbit.app`) via CNAME to avoid Safari third-party cookie blocking.
5. **MongoDB**: Ensure `0.0.0.0/0` is whitelisted in MongoDB Atlas Network Access.

---

## 🔧 Code Quality & Refactoring

**Current Focus Areas for Contributors:**
* **Modularization**: Move raw HTML email templates from `/utils/sendEmail.js` into dedicated `.hbs` or React-Email template files.
* **Naming Conventions**: Standardize payload variable names between the frontend slices and backend controllers (e.g., preferring `registrationNumber` over `registeration_number`).
* **Axios Interceptors**: While the frontend handles 401s, implementing a global Axios interceptor in `/client/src/utils/api.js` to automatically refresh tokens would clean up the Redux actions.

---

## 🤝 Copyright & License

This is a **proprietary, closed-source** project built and maintained exclusively for RideRabbit. 

The source code, architecture, and intellectual property are not open for public distribution, modification, or community contribution. All rights are strictly reserved.

---

<p align="center">
  Built with ❤️ by the <b>RideRabbit</b> Team.
</p>
