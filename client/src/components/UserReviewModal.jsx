import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX, IconStarFilled, IconStar } from "@tabler/icons-react";
import { toast } from "sonner";
import { bookingService } from "../services/bookings";
import Button from "./ui/Button";

export default function UserReviewModal({ isOpen, onClose, bookingId, vehicleName, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }

    try {
      setIsSubmitting(true);
      await bookingService.createReview(bookingId, { rating, comment });
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] grid h-screen w-screen place-items-center bg-black/60 backdrop-blur-sm px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-900">
                Rate your trip
              </h3>
              <button
                onClick={onClose}
                className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <IconX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Vehicle
                </p>
                <h4 className="text-lg font-bold text-slate-900 mb-6 capitalize">
                  {vehicleName || "Your Ride"}
                </h4>

                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      {star <= (hoverRating || rating) ? (
                        <IconStarFilled className="text-yellow-400 w-10 h-10 drop-shadow-sm" />
                      ) : (
                        <IconStar className="text-slate-200 w-10 h-10" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-500">
                  {rating === 0
                    ? "Tap a star to rate"
                    : ["Terrible", "Poor", "Average", "Good", "Excellent"][rating - 1]}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  Share your experience (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none h-32"
                  placeholder="How was the car? Did the vendor communicate well?"
                />
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-14 rounded-2xl text-lg font-black bg-primary-600 hover:bg-primary-700"
              >
                Submit Review
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
