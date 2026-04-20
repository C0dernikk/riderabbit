# Developer Reference Guide

Welcome to the RideRabbit developer guide! This document is designed as a personal reference for navigating, fixing, or adding new features to the platform. It covers the technical conventions, state management logic, and step-by-step workflows for extending the codebase.

---

## 1. Local Environment Setup

Before writing any code, ensure your local environment is configured correctly.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas connection string)
- Git

### Environment Variables
You will need two `.env` files. Do **not** commit these to version control.

**`backend/.env`**
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/riderabbit_dev
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=12h
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URLS=http://localhost:5173
# Required for feature testing:
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RESEND_API_KEY=...
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:3000/api
VITE_RAZORPAY_KEY_ID=your_test_key_here
```

---

## 2. Frontend Conventions (React + Vite)

### State Management (Redux Toolkit)
We use Redux heavily to prevent prop-drilling and manage global states.
- **Location**: `/client/src/features/`
- **When to use Redux**: Only for data shared across multiple pages (e.g., `currentUser` auth state, `isGlobalChatOpen` UI state, cached `availableVehicles`).
- **When to use Local State (`useState`)**: For component-specific toggles (e.g., opening a dropdown, form input values).

### Styling (Tailwind CSS)
- We use a custom utility `cn()` (located in `src/utils/cn.js`) using `clsx` and `tailwind-merge` to conditionally merge classes without conflicts.
- **Rule**: Always use `cn()` when passing `className` props to reusable UI components.
  ```jsx
  // Correct
  <div className={cn("px-4 py-2 bg-primary-500", customClass)}>
  ```

### API Calls
- Always use the predefined Axios services in `/client/src/services/`.
- The Axios instance automatically attaches the `accessToken` and handles credentials for cross-origin cookies.
- **Do not** use raw `fetch()` or `axios.get()` directly inside React components. Create a service function instead.

---

## 3. Backend Conventions (Node + Express)

### Adding a New Route
When building a new API feature, follow this exact flow:

1. **Model** (`/models/`): Define your Mongoose schema. Ensure you add timestamps (`{ timestamps: true }`).
2. **Controller** (`/controllers/`): Write your business logic. 
   - Always wrap your async functions in `try/catch` blocks.
   - Always return standard JSON responses: `res.status(200).json({ success: true, data: ... })`.
3. **Route Definition** (`/routes/`): Hook the controller to an endpoint.
   - Import the necessary RBAC middleware from `/utils/verifyUser.js` (e.g., `verifyUser`, `verifyAdmin`).
   - *Example*: `router.post("/add", verifyVendor, myControllerFunction);`
4. **Server** (`server.js`): Register the new route prefix if it's a completely new domain.

### Error Handling
Do not crash the server on expected errors. Use Express error handling:
```javascript
catch (error) {
  console.error("Error in myController:", error);
  res.status(500).json({ success: false, message: "Internal server error" });
}
```

---

## 4. Working with the Database (MongoDB)

### Geospatial Queries
RideRabbit relies on MongoDB's `$near` operator for vehicle searches.
- The `Vehicle` schema has a `locationPoint` field with a `2dsphere` index.
- If you manually seed vehicles into the database, **you must include the exact GeoJSON format**, otherwise they will not appear in user searches:
  ```json
  "locationPoint": {
    "type": "Point",
    "coordinates": [76.2711, 10.8505] // Note: MongoDB expects [Longitude, Latitude]
  }
  ```

---

## 5. Branching & Commit Workflow

We follow standard Git flow principles:
1. **Never push directly to `main`**.
2. **Create a Feature Branch**: `git checkout -b feature/add-new-payment-method` or `git checkout -b fix/header-alignment`.
3. **Commit Messages**: Write clear, descriptive commit messages.
   - `feat: Added pagination to vendor dashboard`
   - `fix: Resolved memory leak in Socket.io connection`
   - `chore: Updated npm dependencies`
4. **Push and PR**: Push your branch and open a Pull Request against the `main` branch. Ensure you have tested both the Admin and Vendor roles before requesting a review.

---

## 6. Testing

While we do not currently mandate 100% unit test coverage, you **must** manually verify:
1. **Cross-Role Integrity**: If you change a generic component (like `VehicleCard.jsx`), log in as both a User and an Admin to ensure you didn't break their specific views.
2. **Mobile Responsiveness**: Test UI changes using Chrome DevTools device toolbar. RideRabbit is a mobile-first application.
3. **WebSocket Disconnection**: If touching `MessengerHub.jsx`, ensure the app does not crash if the Socket.io server goes offline temporarily.

Happy Coding! 🚀
