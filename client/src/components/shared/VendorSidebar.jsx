import { NavLink } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconCar,
  IconCalendarEvent,
  IconUsers,
  IconSettings,
  IconLogout,
  IconChevronRight,
  IconPlus,
  IconWallet,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import { openInbox } from "../../features/ui/uiSlice";
import { IconMessage } from "@tabler/icons-react";
import { toast } from "sonner";

const VendorSidebar = () => {
  const dispatch = useDispatch();

  const menuItems = [
    {
      icon: <IconLayoutDashboard size={20} />,
      label: "Overview",
      path: "/vendorDashboard",
    },
    {
      icon: <IconCar size={20} />,
      label: "My Fleet",
      path: "/vendorDashboard/vendorAllVeihcles",
    },
    {
      icon: <IconPlus size={20} />,
      label: "Add Vehicle",
      path: "/vendorDashboard/vendorAddProduct",
    },
    {
      icon: <IconCalendarEvent size={20} />,
      label: "Bookings",
      path: "/vendorDashboard/bookings",
    },
    {
      icon: <IconSettings size={20} />,
      label: "Profile",
      path: "/vendorDashboard/profile",
    },
    {
      icon: <IconWallet size={20} />,
      label: "Payouts",
      path: "/vendorDashboard/payouts",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-black tracking-tighter text-white">
          Vendor<span className="text-primary-600">Panel</span>
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
        <button
          onClick={() => dispatch(openInbox())}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <div className="flex items-center gap-3">
            <IconMessage size={20} />
            <span className="font-bold text-sm">Messages Inbox</span>
          </div>
          <IconChevronRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1 opacity-0 group-hover:opacity-100"
          />
        </button>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/vendorDashboard"}
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

export default VendorSidebar;
