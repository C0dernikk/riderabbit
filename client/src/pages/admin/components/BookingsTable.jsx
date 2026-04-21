import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCalendar,
  IconMapPin,
  IconChevronDown,
  IconMoodSad,
  IconReceipt2,
  IconCurrencyRupee,
  IconHistory,
  IconListCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { adminService } from "../../../services/admin";
import Card from "../../../components/ui/Card";

const TERMINAL_STATUSES = ["TRIP_COMPLETED", "CANCELED", "NOT_PICKED"];

const statusOptions = [
  "NOT_BOOKED",
  "BOOKED",
  "PICKED_UP",
  "ON_TRIP",
  "TRIP_ENDED",
  "TRIP_COMPLETED",
  "NOT_PICKED",
  "CANCELED",
  "OVERDUE",
];

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "trip_completed":
      return "bg-emerald-100 text-emerald-700";
    case "booked":
      return "bg-emerald-50 text-emerald-600";
    case "on_trip":
    case "picked_up":
      return "bg-primary-100 text-primary-700";
    case "canceled":
    case "not_picked":
      return "bg-rose-100 text-rose-700";
    case "overdue":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const BookingsTable = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all_time");
  const [activeTab, setActiveTab] = useState("active");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllBookings();
      setAllBookings(data?.bookings || []);
    } catch (error) {
      toast.error("Failed to fetch all bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (e, bookingId) => {
    const newStatus = e.target.value;
    try {
      await adminService.updateBookingStatus(bookingId, newStatus);
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      fetchBookings();
    } catch (error) {
      // api.js interceptor unwraps errors into plain Error objects
      toast.error(error.message || "Failed to update status");
    }
  };

  const getDateFilteredBookings = (bookings) => {
    if (dateFilter === "all_time") return bookings;
    const now = new Date();
    const cutoff = new Date();
    switch (dateFilter) {
      case "this_week":
        cutoff.setDate(now.getDate() - 7);
        break;
      case "last_30_days":
        cutoff.setDate(now.getDate() - 30);
        break;
      case "last_6_months":
        cutoff.setMonth(now.getMonth() - 6);
        break;
      case "a_year":
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return bookings;
    }
    return bookings.filter((b) => new Date(b.createdAt) >= cutoff);
  };

  const dateFiltered = getDateFilteredBookings(allBookings);
  const activeBookings = dateFiltered.filter(
    (b) => !TERMINAL_STATUSES.includes(b.status)
  );
  const historyBookings = dateFiltered.filter((b) =>
    TERMINAL_STATUSES.includes(b.status)
  );

  const displayedBookings = activeTab === "active" ? activeBookings : historyBookings;

  const tabs = [
    {
      id: "active",
      label: "Active Bookings",
      count: activeBookings.length,
      icon: <IconListCheck size={16} />,
    },
    {
      id: "history",
      label: "History",
      count: historyBookings.length,
      icon: <IconHistory size={16} />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            {activeTab === "active" ? (
              <>System <span className="text-primary-600">Bookings</span></>
            ) : (
              <>Booking <span className="text-primary-600">History</span></>
            )}
          </h1>
          <p className="text-slate-500 font-medium">
            {activeTab === "active"
              ? "Overview of all active vehicle rentals across the platform"
              : "Completed and cancelled booking records"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Date Filter */}
          <div className="relative inline-block">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="this_week">This Week</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="a_year">A Year</option>
              <option value="all_time">All Time</option>
            </select>
            <IconChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
            <IconReceipt2 className="text-primary-600" size={20} />
            <span className="font-bold text-slate-700">
              {displayedBookings.length}{" "}
              {activeTab === "active" ? "Active" : "Historical"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === tab.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : displayedBookings.length > 0 ? (
        <div className="grid gap-6">
          <AnimatePresence>
            {displayedBookings.map((booking, idx) => {
              const pickupDate = new Date(booking.pickUpDate || booking.pickupDate);
              const dropoffDate = new Date(booking.dropOffDate);
              const isHistory = activeTab === "history";

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`p-0 overflow-hidden border-none shadow-premium group ${isHistory ? "opacity-80" : ""}`}>
                    <div className="flex flex-col lg:flex-row">
                      {/* Car Preview */}
                      <div className="lg:w-64 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100">
                        <img
                          src={booking.vehicleDetails?.images?.[0]}
                          alt={booking.vehicleDetails?.brand}
                          className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-slate-900 capitalize">
                                {booking.vehicleDetails?.brand}{" "}
                                {booking.vehicleDetails?.model}
                              </h3>
                              {/* Admin always sees status dropdown for override capability */}
                              <div className="relative inline-block">
                                <select
                                  value={booking.status || "BOOKED"}
                                  onChange={(e) => handleStatusChange(e, booking._id)}
                                  className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest outline-none border-none cursor-pointer transition-colors ${getStatusColor(booking.status || "BOOKED")}`}
                                >
                                  {statusOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt.replace(/_/g, " ")}
                                    </option>
                                  ))}
                                </select>
                                <IconChevronDown
                                  size={10}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Booking ID:{" "}
                                <span className="text-slate-600">
                                  #{booking._id.slice(-8)}
                                </span>
                              </p>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Customer:{" "}
                                <span className="text-primary-600 font-black">
                                  {booking.customer?.username || "System User"}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-primary-600 flex items-center justify-end">
                              <IconCurrencyRupee size={24} />
                              {booking.totalPrice}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Total Transaction
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-6">
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Pick-up
                            </div>
                            <div className="flex items-start gap-2">
                              <IconCalendar size={16} className="text-accent-500 mt-0.5" />
                              <div className="text-sm font-bold text-slate-700">
                                {pickupDate.toDateString()}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <IconMapPin size={16} className="text-accent-500 mt-0.5" />
                              <div className="text-sm font-medium text-slate-500 truncate max-w-[150px]">
                                {booking.pickUpLocation}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Drop-off
                            </div>
                            <div className="flex items-start gap-2">
                              <IconCalendar size={16} className="text-accent-500 mt-0.5" />
                              <div className="text-sm font-bold text-slate-700">
                                {dropoffDate.toDateString()}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <IconMapPin size={16} className="text-accent-500 mt-0.5" />
                              <div className="text-sm font-medium text-slate-500 truncate max-w-[150px]">
                                {booking.dropOffLocation}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 px-6 text-center border-none shadow-premium bg-white">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <IconMoodSad size={48} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            {activeTab === "active" ? "No Active Bookings" : "No History Yet"}
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            {activeTab === "active"
              ? "There are no active bookings recorded in the system yet."
              : "Completed and cancelled bookings will appear here."}
          </p>
        </Card>
      )}
    </div>
  );
};

export default BookingsTable;
