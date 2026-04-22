import { NavLink } from "react-router-dom";
import {
  IconUser,
  IconHistory,
  IconHeart,
  IconSettings,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { signOut } from "../../features/auth/authSlice";
import { openInbox } from "../../features/ui/uiSlice";
import { IconMessage } from "@tabler/icons-react";
import { userService } from "../../services/user";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UserSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <IconUser size={20} />, label: "My Profile", path: "/profile" },
    {
      icon: <IconHistory size={20} />,
      label: "Booking History",
      path: "/profile/orders",
    },
    {
      icon: <IconHeart size={20} />,
      label: "Favorites",
      path: "/profile/favorites",
    },
    {
      icon: <IconSettings size={20} />,
      label: "Settings",
      path: "/profile/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await userService.signOut();
    } finally {
      dispatch(signOut());
      navigate("/signin");
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tighter text-white">
          My<span className="text-primary-600">Account</span>
        </h2>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-400/10 transition-all duration-200 font-bold text-sm"
        >
          <IconLogout size={18} />
          Logout
        </button>
      </div>

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
            end={item.path === "/profile"}
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

export default UserSidebar;
