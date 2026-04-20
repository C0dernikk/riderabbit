import { motion } from "framer-motion";
import {
  IconUsers,
  IconGasStation,
  IconManualGearbox,
  IconStarFilled,
  IconArrowRight,
} from "@tabler/icons-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

const VehicleCard = ({ vehicle, onClick }) => {
  const {
    brand,
    model,
    price,
    images,
    seats,
    fuelType,
    transmission,
    rating = 0,
    totalReviews = 0,
    carType = "Premium",
  } = vehicle;

  return (
    <Card
      className="p-0 group flex flex-col h-full overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-500 bg-card"
      animate={true}
      hoverEffect={false}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-50 p-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <motion.img
          src={images?.[0] || "/placeholder-car.png"}
          alt={`${brand} ${model}`}
          className="w-full h-full object-contain drop-shadow-xl"
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
            {carType}
          </span>
          {rating >= 4.5 && totalReviews > 0 && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
              Top Rated
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md border border-white/20 shadow-sm flex items-center gap-1">
          <IconStarFilled size={12} className="text-emerald-400" />
          <span className="text-xs font-bold text-slate-900">{rating > 0 ? rating : "New"}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-0.5">
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              {brand}
            </p>
            <h3 className="text-xl font-black text-slate-900 leading-tight tracking-tight">
              {model}
            </h3>
          </div>
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-sm font-bold text-slate-400">₹</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">
                {price}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              / Day
            </p>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-slate-100 mb-6 mt-auto">
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors duration-300">
            <IconUsers
              size={18}
              className="text-slate-400 group-hover:text-emerald-600"
            />
            <span className="text-[10px] font-bold text-slate-600 uppercase">
              {seats} Seats
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors duration-300">
            <IconGasStation
              size={18}
              className="text-slate-400 group-hover:text-emerald-600"
            />
            <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-full">
              {fuelType}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 group-hover:bg-emerald-50 transition-colors duration-300">
            <IconManualGearbox
              size={18}
              className="text-slate-400 group-hover:text-emerald-600"
            />
            <span className="text-[10px] font-bold text-slate-600 uppercase truncate max-w-full">
              {transmission}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onClick}
            variant="secondary"
            className="flex-1 h-12 text-xs font-bold uppercase tracking-wider"
          >
            Details
          </Button>
          <Button
            onClick={onClick}
            variant="primary"
            className="flex-[2] group/btn relative overflow-hidden h-12 text-xs font-bold uppercase tracking-wider"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Book Now
              <IconArrowRight
                size={16}
                className="group-hover/btn:translate-x-1 transition-transform"
              />
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VehicleCard;
