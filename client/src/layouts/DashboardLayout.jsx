import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../components/shared/AdminSidebar";
import VendorSidebar from "../components/shared/VendorSidebar";
import UserSidebar from "../components/shared/UserSidebar";

/**
 * Flexible Dashboard Layout that handles different sidebars based on route.
 */
const DashboardLayout = () => {
  const location = useLocation();

  // Determine which sidebar to show
  let sidebar = null;
  if (location.pathname.startsWith("/adminDashboard"))
    sidebar = <AdminSidebar />;
  else if (location.pathname.startsWith("/vendorDashboard"))
    sidebar = <VendorSidebar />;
  else if (location.pathname.startsWith("/profile")) sidebar = <UserSidebar />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-72 h-full flex-col bg-slate-900 text-white shadow-xl z-20">
        {sidebar}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`dashboard-${location.pathname}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
