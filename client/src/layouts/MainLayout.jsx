import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";

/**
 * Main application layout with smooth page transitions.
 */
const MainLayout = () => {
  const location = useLocation();

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
