import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconMenu2,
  IconX,
  IconSmartHome,
  IconCar,
  IconBuildingSkyscraper,
  IconPhoneCall,
} from "@tabler/icons-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { navLinks } from "../../constants";
import Button from "../ui/Button";

const cn = (...inputs) => twMerge(clsx(inputs));

function Navbar() {
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isAuthPage = [
    "/signin",
    "/signup",
    "/vendorSignin",
    "/vendorSignup",
  ].includes(location.pathname);
  if (isAuthPage) return null;

  const isAdmin = currentUser?.role === "admin";
  const isVendor = currentUser?.role === "vendor";

  const getIcon = (title) => {
    switch (title) {
      case "Home":
        return <IconSmartHome size={18} />;
      case "Vehicles":
        return <IconCar size={18} />;
      case "Enterprise":
        return <IconBuildingSkyscraper size={18} />;
      case "Contact":
        return <IconPhoneCall size={18} />;
      default:
        return null;
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "py-3 px-6" : "py-5 px-8",
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-md border border-slate-200/50"
            : location.pathname === "/"
              ? "bg-transparent"
              : "bg-white/50 backdrop-blur-md border border-white/10",
        )}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 flex items-center justify-center group-hover:rotate-6 transition-all duration-500">
            <div className="absolute inset-0 bg-emerald-500 rounded-xl rotate-6 group-hover:rotate-12 transition-all duration-500 opacity-40 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
              <span className="relative text-white font-black text-xl italic tracking-tighter drop-shadow-md z-10 flex items-center">
                R<span className="text-emerald-300 -ml-1">R</span>
              </span>
            </div>
          </div>
          <span
            className={cn(
              "text-2xl font-black tracking-tighter transition-colors duration-300",
              isScrolled || location.pathname !== "/"
                ? "text-slate-900"
                : "text-slate-900",
            )}
          >
            Ride<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-emerald-500">Rabbit</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          {navLinks.map((link) => (
            <NavLink
              key={link.id}
              to={link.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-white text-primary-600 shadow-sm"
                    : isScrolled || location.pathname !== "/"
                      ? "text-slate-600 hover:text-primary-600 hover:bg-white/50"
                      : "text-slate-900 font-black hover:text-primary-600 hover:bg-black/5",
                )
              }
            >
              {getIcon(link.title)}
              {link.title}
            </NavLink>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {currentUser ? (
            <Link
              to={
                isAdmin
                  ? "/adminDashboard"
                  : isVendor
                    ? "/vendorDashboard"
                    : "/profile"
              }
              className={cn(
                "flex items-center gap-3 p-1 pr-4 rounded-xl transition-all duration-300 border group",
                isScrolled || location.pathname !== "/"
                  ? "bg-white border-slate-200 text-slate-900 hover:border-primary-600/30 hover:bg-slate-50"
                  : "bg-white/50 backdrop-blur-md border-white/40 text-slate-900 hover:bg-white/80 shadow-sm",
              )}
            >
              <img
                src={currentUser.profilePicture || "https://i.pravatar.cc/150"}
                alt="profile"
                className="w-9 h-9 rounded-lg border-2 border-primary-600 object-cover shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-black text-xs leading-none mb-0.5 truncate max-w-[100px]">
                  {currentUser.username}
                </span>
                <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none">
                  {isAdmin ? "Admin" : isVendor ? "Vendor" : "Member"}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/signin"
                className={cn(
                  "text-sm font-bold px-5 py-2.5 rounded-xl transition-all",
                  isScrolled || location.pathname !== "/"
                    ? "text-slate-600 hover:text-primary-600 hover:bg-slate-100"
                    : "text-slate-900 font-black hover:text-primary-600 hover:bg-black/5",
                )}
              >
                Sign In
              </Link>
              <Button
                onClick={() => (window.location.href = "/signup")}
                variant="primary"
                className="px-6 py-2.5 rounded-xl text-sm h-auto"
              >
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={cn(
            "lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isScrolled || location.pathname !== "/"
              ? "bg-slate-100 text-slate-900"
              : "bg-slate-200/50 text-slate-900 hover:bg-slate-300/50",
          )}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <IconX size={24} /> : <IconMenu2 size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-6 right-6 mt-4 p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 lg:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.id}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-black transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-600 hover:bg-slate-50",
                    )
                  }
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      location.pathname === link.path
                        ? "bg-primary-600 text-white"
                        : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {getIcon(link.title)}
                  </div>
                  {link.title}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
              {currentUser ? (
                <Link
                  to={
                    isAdmin
                      ? "/adminDashboard"
                      : isVendor
                        ? "/vendorDashboard"
                        : "/profile"
                  }
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <img
                    src={
                      currentUser.profilePicture || "https://i.pravatar.cc/150"
                    }
                    alt="profile"
                    className="w-12 h-12 rounded-xl border-2 border-primary-600 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900">
                      {currentUser.username}
                    </span>
                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">
                      {isAdmin
                        ? "Admin Dashboard"
                        : isVendor
                          ? "Vendor Dashboard"
                          : "My Profile"}
                    </span>
                  </div>
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="w-full py-4 rounded-2xl bg-slate-50 text-slate-900 font-black text-center"
                  >
                    Sign In
                  </Link>
                  <Button
                    onClick={() => (window.location.href = "/signup")}
                    className="w-full py-4 rounded-2xl h-auto"
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
