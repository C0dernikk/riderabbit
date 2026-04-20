import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconChevronRight,
  IconMoodSad,
  IconReceipt2,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";
import { bookingService } from "../../services/bookings";
import { setOrderModalOpen, setSingleOrderDetails, openGlobalChat } from "../../features/ui/uiSlice";
import { IconMessage } from "@tabler/icons-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import UserOrderDetailsModal from "../../components/UserOrderDetailsModal";
import UserReviewModal from "../../components/UserReviewModal";

export default function Orders() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await bookingService.getUserBookings();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        toast.error("Failed to load your bookings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleLeaveReview = (booking) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    // Refresh bookings after review submission so the button disappears
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getUserBookings();
        if (data.success) {
          setBookings(data.bookings);
        }
      } catch (error) {
        console.error("Failed to refresh bookings");
      }
    };
    fetchBookings();
  };

  const handleViewDetails = (booking) => {
    dispatch(setSingleOrderDetails(booking));
    dispatch(setOrderModalOpen(true));
  };

  const handleOpenChat = (e, booking) => {
    e.stopPropagation();
    if (booking) {
      dispatch(
        openGlobalChat({
          bookingId: booking._id,
          otherPartyId: booking.vehicle?.addedBy,
          otherPartyName: "Vendor",
        })
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "confirmed":
        return "bg-emerald-50 text-emerald-600";
      case "pending":
        return "bg-primary-100 text-primary-700";
      case "cancelled":
        return "bg-slate-200 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      <UserOrderDetailsModal />
      <UserReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        bookingId={selectedBookingForReview?._id}
        vehicleName={selectedBookingForReview?.vehicle?.model}
        onSuccess={handleReviewSuccess}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Booking <span className="text-accent-500">History</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track your car rentals
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <IconReceipt2 className="text-accent-500" size={20} />
          <span className="font-bold text-slate-700">
            {bookings.length} Total Bookings
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="grid gap-6">
          <AnimatePresence>
            {bookings.map((booking, idx) => {
              const pickupDate = new Date(booking.pickUpDate);
              const dropoffDate = new Date(booking.dropOffDate);

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-0 overflow-hidden border-none shadow-premium group">
                    <div className="flex flex-col md:flex-row">
                      {/* Car Preview */}
                      <div className="md:w-64 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100">
                        <img
                          src={
                            booking.vehicle?.images?.[0] ||
                            booking.vehicle?.image?.[0]
                          }
                          alt={booking.vehicle?.model}
                          className="w-full h-auto object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-black text-slate-900 capitalize">
                                {booking.vehicle?.brand}{" "}
                                {booking.vehicle?.model}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(booking.status || "confirmed")}`}
                              >
                                {booking.status || "Confirmed"}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              Booking ID:{" "}
                              <span className="text-slate-600">
                                #{booking._id.slice(-8)}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-accent-500">
                              ₹{booking.totalPrice}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Total Paid
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-6">
                          <div className="space-y-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              Pick-up
                            </div>
                            <div className="flex items-start gap-2">
                              <IconCalendar
                                size={16}
                                className="text-brand-accent mt-0.5"
                              />
                              <div className="text-sm font-bold text-slate-700">
                                {pickupDate.toDateString()}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <IconMapPin
                                size={16}
                                className="text-brand-accent mt-0.5"
                              />
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
                              <IconCalendar
                                size={16}
                                className="text-brand-accent mt-0.5"
                              />
                              <div className="text-sm font-bold text-slate-700">
                                {dropoffDate.toDateString()}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <IconMapPin
                                size={16}
                                className="text-brand-accent mt-0.5"
                              />
                              <div className="text-sm font-medium text-slate-500 truncate max-w-[150px]">
                                {booking.dropOffLocation}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                          <Button
                            variant="primary"
                            className="px-6 py-2.5 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            onClick={(e) => handleOpenChat(e, booking)}
                          >
                            <IconMessage size={14} />
                            Chat
                          </Button>
                          {booking.status === "TRIP_COMPLETED" && !booking.review && (
                            <Button
                              variant="primary"
                              className="px-6 py-2.5 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                              onClick={() => handleLeaveReview(booking)}
                            >
                              Leave a Review
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            className="px-6 py-2.5 rounded-xl text-xs"
                            onClick={() => handleViewDetails(booking)}
                          >
                            View Details & Receipt
                            <IconChevronRight size={14} className="ml-1" />
                          </Button>
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
            No Bookings Yet
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            You haven't booked any rides yet. Start your journey by exploring
            our premium fleet.
          </p>
          <Button onClick={() => navigate("/vehicles")}>Browse Vehicles</Button>
        </Card>
      )}
    </div>
  );
}
