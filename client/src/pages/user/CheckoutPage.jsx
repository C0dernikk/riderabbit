import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  IconShieldCheck,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconDiscount2,
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";

import { displayRazorpay } from "./Razorpay";
import { bookingService } from "../../services/bookings";
import { setPageLoading } from "../../features/ui/uiSlice";
import { setPaymentStatus } from "../../features/bookings/bookingsSlice";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Please enter a valid address"),
  coupon: z.string().optional(),
});

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const singleVehicleDetail = useSelector(
    (state) => state.vehicles.singleVehicleDetail,
  );
  const bookingData = useSelector((state) => state.bookings.searchParams);
  const { isPageLoading } = useSelector((state) => state.ui);
  const { latestBooking, isPaymentDone: paymentDone } = useSelector(
    (state) => state.bookings,
  );

  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: currentUser?.email || "",
      phoneNumber: currentUser?.phoneNumber || "",
      address: currentUser?.address || "",
      coupon: "",
    },
  });

  const couponValue = watch("coupon");

  // Calculate rental duration
  const start = new Date(bookingData.pickupDate?.humanReadable || new Date());
  const end = new Date(bookingData.dropoffDate?.humanReadable || new Date());
  const days = Math.max(1, Math.round((end - start) / (1000 * 3600 * 24)));

  const basePrice = (singleVehicleDetail?.price || 0) * days;
  const serviceFee = 50;
  const totalPrice = basePrice + serviceFee - discount;

  const handleApplyCoupon = () => {
    if (couponValue === "WELCOME50") {
      setDiscount(50);
      setCouponApplied(true);
      toast.success("Coupon applied! You saved ₹50");
    } else {
      setDiscount(0);
      setCouponApplied(false);
      toast.error("Invalid coupon code");
    }
  };

  const onPlaceOrder = async (data) => {
    const defaultPickUp = new Date();
    const defaultDropOff = new Date();
    defaultDropOff.setDate(defaultDropOff.getDate() + 1);

    const orderData = {
      user_id: currentUser._id,
      vehicle_id: singleVehicleDetail._id,
      totalPrice,
      pickUpDate: bookingData.pickupDate?.humanReadable || defaultPickUp.toISOString(),
      dropOffDate: bookingData.dropoffDate?.humanReadable || defaultDropOff.toISOString(),
      pickup_district: bookingData.pickup_district || singleVehicleDetail.district,
      pickUpLocation: bookingData.pickup_location || singleVehicleDetail.location,
      dropOffLocation: bookingData.dropoff_location || singleVehicleDetail.location,
    };

    try {
      dispatch(setPageLoading(true));
      const response = await displayRazorpay(orderData, navigate, dispatch);

      if (!response?.ok) {
        toast.error(response?.message || "Payment failed to initialize");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  useEffect(() => {
    if (paymentDone && latestBooking) {
      const finalizeBooking = async () => {
        try {
          await bookingService.sendBookingEmail(latestBooking._id);
          toast.success("Booking confirmed! Check your email for details.");
        } catch (error) {
          console.error("Email notification failed", error);
        } finally {
          dispatch(setPaymentStatus(false));
        }
      };
      finalizeBooking();
    }
  }, [paymentDone, latestBooking, dispatch]);

  if (!singleVehicleDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-24 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Checkout...</h2>
          <p className="text-slate-500">Please wait while we prepare your booking details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          to="/vehicleDetails"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold mb-8 transition-colors group"
        >
          <IconArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Details
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: Checkout Details */}
          <div className="lg:col-span-7 space-y-8">
            <h1 className="text-4xl font-black text-slate-900 leading-tight">
              Complete Your{" "}
              <span className="text-primary-600">Booking</span>
            </h1>

            {/* Rental Details Summary */}
            <Card className="p-8 border-none shadow-premium bg-white">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <IconCalendar className="text-primary-600" />
                Rental Schedule
              </h3>
              <div className="grid md:grid-cols-2 gap-8 relative">
                <div className="space-y-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Pick-up
                  </div>
                  <div className="flex items-start gap-3">
                    <IconMapPin className="text-accent-500 shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-slate-900 capitalize">
                        {bookingData.pickup_district || singleVehicleDetail.district}
                      </div>
                      <div className="text-sm text-slate-500 capitalize">
                        {bookingData.pickup_location || singleVehicleDetail.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <IconClock className="text-accent-500" />
                    <div className="text-sm font-bold text-slate-700">
                      {bookingData.pickupDate?.humanReadable}
                    </div>
                  </div>
                </div>

                <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <IconArrowRight className="text-slate-300" />
                  </div>
                </div>

                <div className="space-y-4 text-right md:text-left">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Drop-off
                  </div>
                  <div className="flex items-start md:items-start justify-end md:justify-start gap-3">
                    <IconMapPin className="text-accent-500 shrink-0 mt-1" />
                    <div>
                      <div className="font-bold text-slate-900 capitalize">
                        {bookingData.pickup_district || singleVehicleDetail.district}
                      </div>
                      <div className="text-sm text-slate-500 capitalize">
                        {bookingData.dropoff_location || singleVehicleDetail.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end md:justify-start gap-3">
                    <IconClock className="text-accent-500" />
                    <div className="text-sm font-bold text-slate-700">
                      {bookingData.dropoffDate?.humanReadable}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information Form */}
            <Card className="p-8 border-none shadow-premium bg-white">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <IconShieldCheck className="text-primary-600" />
                Personal Information
              </h3>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="1234567890"
                    error={errors.phoneNumber?.message}
                    {...register("phoneNumber")}
                  />
                </div>
                <Input
                  label="Full Address"
                  placeholder="Street, City, Zip Code"
                  error={errors.address?.message}
                  {...register("address")}
                />
              </form>
            </Card>
          </div>

          {/* Right: Price Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <Card className="p-8 border-none shadow-premium bg-primary-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <h3 className="text-xl font-bold mb-8">Price Summary</h3>

                {/* Car Preview */}
                <div className="flex items-center gap-4 mb-8 p-4 rounded-2xl bg-white/10 border border-white/10">
                  <img
                    src={singleVehicleDetail.images?.[0]}
                    alt=""
                    className="w-20 h-20 object-contain"
                  />
                  <div>
                    <div className="font-black text-lg leading-tight capitalize">
                      {singleVehicleDetail.brand} {singleVehicleDetail.model}
                    </div>
                    <div className="text-sm text-white/60 font-medium">
                      ₹{singleVehicleDetail.price} / day
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-white/70 font-medium">
                    <span>
                      Base Fare (₹{singleVehicleDetail.price} × {days} days)
                    </span>
                    <span>₹{basePrice}</span>
                  </div>
                  <div className="flex justify-between text-white/70 font-medium">
                    <span>Service & Insurance Fee</span>
                    <span>₹{serviceFee}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Discount (WELCOME50)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-lg font-bold">Total Amount</span>
                    <span className="text-3xl font-black text-accent-500">
                      ₹{totalPrice}
                    </span>
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="flex gap-2 mb-8">
                  <div className="flex-1 relative">
                    <IconDiscount2
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      {...register("coupon")}
                      className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:bg-white/20 transition-all placeholder:text-white/30"
                    />
                  </div>
                  <Button
                    variant="accent"
                    className="py-3 px-6 text-sm"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </Button>
                </div>

                <Button
                  onClick={handleSubmit(onPlaceOrder)}
                  variant="accent"
                  className="w-full py-5 text-xl font-black shadow-xl"
                  isLoading={isPageLoading}
                >
                  Proceed to Payment
                </Button>

                <p className="text-center text-[10px] text-white/40 mt-6 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <IconShieldCheck size={14} />
                  Secure Encryption by Razorpay
                </p>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IconCheck size={20} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Free Cancellation
                  </span>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <IconShieldCheck size={20} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    Secure Payment
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
