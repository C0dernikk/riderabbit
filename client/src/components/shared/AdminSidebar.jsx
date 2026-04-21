import { NavLink } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconCar,
  IconUsers,
  IconUserCheck,
  IconCalendarEvent,
  IconClipboardList,
  IconSettings,
  IconLogout,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/auth";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: <IconLayoutDashboard size={20} />,
      label: "Overview",
      path: "/adminDashboard",
    },
    {
      icon: <IconCar size={20} />,
      label: "All Vehicles",
      path: "/adminDashboard/allProduct",
    },
    {
      icon: <IconUsers size={20} />,
      label: "All Users",
      path: "/adminDashboard/allUsers",
    },
    {
      icon: <IconUserCheck size={20} />,
      label: "All Vendors",
      path: "/adminDashboard/allVendors",
    },
    {
      icon: <IconPlus size={20} />,
      label: "Vehicle Requests",
      path: "/adminDashboard/vendorVehicleRequests",
    },
    {
      icon: <IconCalendarEvent size={20} />,
      label: "Bookings",
      path: "/adminDashboard/orders",
    },
  ];

  const handleLogout = async () => {
    try {
      await authService.adminLogout();
    } catch (error) {
      console.error(error);
    } finally {
      dispatch(logout());
      navigate("/signin");
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-black tracking-tighter text-white">
          Admin<span className="text-primary-600">Panel</span>
        </h2>
      </div>

      {/* Logout Button — always visible at top */}
      <button
        onClick={handleLogout}
        className="mb-6 flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200 font-bold text-sm border border-red-400/20"
      >
        <IconLogout size={18} />
        Logout
      </button>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/adminDashboard"}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
              ${
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                <IconChevronRight
                  size={16}
                  className={`transition-transform duration-200 group-hover:translate-x-1 ${isActive ? "opacity-100" : "opacity-0"}`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </div>
  );
};

export default AdminSidebar;
