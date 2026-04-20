import { useSelector } from "react-redux";
import { Outlet, Navigate, Link } from "react-router-dom";
import { IconShieldLock } from "@tabler/icons-react";

/**
 * Protected route for any authenticated user.
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 z-50 fixed inset-0">
        <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <IconShieldLock size={48} strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 text-center">Access Restricted</h1>
        <p className="text-slate-500 max-w-md text-center mb-8">
          This area is specifically restricted to standard user accounts. Since you are logged in as an {currentUser?.role}, you cannot proceed with user bookings.
        </p>
        <Link 
          to={currentUser?.role === "admin" ? "/adminDashboard" : currentUser?.role === "vendor" ? "/vendorDashboard" : "/"}
          className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <Outlet />;
};

/**
 * Route that only allows non-authenticated users (e.g. login/signup).
 */
export const PublicOnlyRoute = () => {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    if (currentUser.role === "admin") return <Navigate to="/adminDashboard" replace />;
    if (currentUser.role === "vendor") return <Navigate to="/vendorDashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
