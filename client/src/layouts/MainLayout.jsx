import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

/**
 * Main application layout with smooth page transitions.
 */
const MainLayout = () => {
  const location = useLocation();
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  if (isAuthenticated && currentUser) {
    if (currentUser.role === "admin") {
      return <Navigate to="/adminDashboard" replace />;
    }
    if (currentUser.role === "vendor") {
      return <Navigate to="/vendorDashboard" replace />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary-500/30 selection:text-primary-900">
      <Navbar />

      <main className="flex-1 w-full pt-20">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
