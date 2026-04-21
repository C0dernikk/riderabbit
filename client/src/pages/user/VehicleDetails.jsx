import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { vehicleService } from "../../services/vehicles";
import { setSearchParams } from "../../features/bookings/bookingsSlice";
import {
  IconArrowLeft,
  IconStarFilled,
  IconUsers,
  IconGasStation,
  IconManualGearbox,
  IconShieldCheck,
  IconCalendarEvent,
  IconSteeringWheel,
  IconCheck,
} from "@tabler/icons-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const VehicleDetails = () => {
  const { singleVehicleDetail } = useSelector(
    (state) => state.vehicles,
  );
  const searchParams = useSelector((state) => state.bookings.searchParams);

  // Helper to format date for datetime-local input safely
  const formatForInput = (dateValue) => {
    if (!dateValue) return "";
    try {
      if (dateValue.$d) return new Date(dateValue.$d).toISOString().slice(0, 16); // dayjs object
      if (dateValue.toDate) return new Date(dateValue.toDate()).toISOString().slice(0, 16);
      if (dateValue.humanReadable) return new Date(dateValue.humanReadable).toISOString().slice(0, 16);
      if (typeof dateValue === "string" || dateValue instanceof Date) {
        return new Date(dateValue).toISOString().slice(0, 16);
      }
      return "";
    } catch {
      return "";
    }
  };

  const [pickUpDate, setPickUpDate] = useState(() => formatForInput(searchParams?.pickuptime || searchParams?.pickupDate));
  const [dropOffDate, setDropOffDate] = useState(() => formatForInput(searchParams?.dropofftime || searchParams?.dropoffDate));
  const [activeImage, setActiveImage] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBooking = async () => {
    if (!pickUpDate || !dropOffDate) {
      toast.error("Please select both pick-up and drop-off dates");
      return;
    }

    const now = new Date();
    // Allow a small grace period of 1 hour in the past to avoid edge cases with timezones/immediate bookings
    now.setHours(now.getHours() - 1); 

    if (new Date(pickUpDate) < now) {
      toast.error("Pick-up date cannot be in the past");
      return;
    }

    if (new Date(pickUpDate) >= new Date(dropOffDate)) {
      toast.error("Drop-off date must be after pick-up date");
      return;
    }

    setIsChecking(true);
    try {
      const response = await vehicleService.checkAvailability({
        vehicleId: singleVehicleDetail._id,
        pickUpDate: new Date(pickUpDate).toISOString(),
        dropOffDate: new Date(dropOffDate).toISOString(),
      });

      if (response.available) {
        dispatch(setSearchParams({
          pickupDate: { humanReadable: new Date(pickUpDate).toISOString() },
          dropoffDate: { humanReadable: new Date(dropOffDate).toISOString() },
        }));
        navigate("/checkoutPage");
      } else {
        toast.error(response.message || "Vehicle is not available for these dates");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error checking availability");
    } finally {
      setIsChecking(false);
    }
  };

  if (!singleVehicleDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
          <Link to="/vehicles">
            <Button>Back to Fleet</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = singleVehicleDetail.images || singleVehicleDetail.image || [];

  const specs = [
    {
      icon: <IconUsers size={20} />,
      label: "Seats",
      value: `${singleVehicleDetail.seats} Adults`,
    },
    {
      icon: <IconGasStation size={20} />,
      label: "Fuel",
      value: singleVehicleDetail.fuelType,
    },
    {
      icon: <IconManualGearbox size={20} />,
      label: "Transmission",
      value: singleVehicleDetail.transmission || "Manual",
    },
    {
      icon: <IconCalendarEvent size={20} />,
      label: "Year",
      value: singleVehicleDetail.yearMade,
    },
    {
      icon: <IconSteeringWheel size={20} />,
      label: "Type",
      value: singleVehicleDetail.carType,
    },
  ];

  const features = [
    "Comprehensive Insurance",
    "24/7 Roadside Assistance",
    "Free Cancellation (up to 24h)",
    "Clean & Sanitized Vehicle",
    "GPS Navigation Included",
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <Link
          to="/vehicles"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold mb-8 transition-colors group"
        >
          <IconArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Fleet
        </Link>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              layoutId="main-image"
              className="aspect-[16/10] bg-white rounded-[2.5rem] shadow-premium border border-slate-100 overflow-hidden relative"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[activeImage]}
                  alt={singleVehicleDetail.model}
                  className="w-full h-full object-contain p-8"
                />
              </AnimatePresence>
              <div className="absolute top-6 right-6 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-2">
                <IconStarFilled size={16} className="text-yellow-400" />
                <span className="font-bold text-slate-900">
                  {singleVehicleDetail.rating > 0 ? singleVehicleDetail.rating : "New"} {singleVehicleDetail.totalReviews > 0 ? `(${singleVehicleDetail.totalReviews} Reviews)` : ""}
                </span>
              </div>
            </motion.div>

            <div className="grid grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square rounded-2xl border-2 transition-all overflow-hidden bg-white p-2 ${
                    activeImage === idx
                      ? "border-primary-600 shadow-lg"
                      : "border-transparent hover:border-slate-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Details & Booking */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex px-3 py-1 rounded-lg bg-primary-600/10 text-primary-600 text-xs font-black uppercase tracking-widest">
                {singleVehicleDetail.brand}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                {singleVehicleDetail.brand} {singleVehicleDetail.model}
              </h1>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary-600">
                  ₹{singleVehicleDetail.price}
                </span>
                <span className="text-slate-500 font-bold">/ day</span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2"
                >
                  <div className="text-primary-600">{spec.icon}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {spec.label}
                  </div>
                  <div className="text-sm font-bold text-slate-800 capitalize">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Features List */}
            <Card className="p-6 border-none shadow-premium bg-white/50 backdrop-blur-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <IconShieldCheck className="text-accent-500" />
                Included in your rental
              </h3>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-slate-600 font-medium"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <IconCheck size={12} strokeWidth={4} />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Booking CTA */}
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Pick-up Date & Time</label>
                  <input
                    type="datetime-local"
                    value={pickUpDate}
                    onChange={(e) => setPickUpDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 outline-none text-sm font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Drop-off Date & Time</label>
                  <input
                    type="datetime-local"
                    value={dropOffDate}
                    onChange={(e) => setDropOffDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-600 outline-none text-sm font-bold bg-white"
                  />
                </div>
              </div>
              <Button
                onClick={handleBooking}
                variant="accent"
                isLoading={isChecking}
                className="w-full py-5 text-xl font-black shadow-xl"
              >
                Book This Ride Now
              </Button>
              <p className="text-center text-xs text-slate-400 mt-4 font-bold flex items-center justify-center gap-2">
                <IconShieldCheck size={14} />
                Secure Checkout & Instant Confirmation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
