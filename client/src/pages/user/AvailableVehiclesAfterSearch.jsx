import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { IconMoodSad, IconCar, IconMap, IconList } from "@tabler/icons-react";

import { setVariants, setFilters, filterVehicles } from "../../features/vehicles/vehiclesSlice";
import VehicleCard from "../../components/shared/VehicleCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import MapComponent from "../../components/MapComponent";

const AvailableVehiclesAfterSearch = () => {
  const { availableVehicles: availableCars } = useSelector((state) => state.vehicles);
  const { searchParams } = useSelector((state) => state.bookings);
  const { pickup_district, pickup_location, pickupDate, dropoffDate } = searchParams;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  const handleShowVariants = async (model) => {
    try {
      const filters = {
        pickup_district,
        pickup_location,
        pickUpDate: pickupDate.humanReadable,
        dropOffDate: dropoffDate.humanReadable,
        model,
      };
      
      const result = await dispatch(filterVehicles(filters)).unwrap();
      
      if (result) {
        dispatch(setVariants(result));
        dispatch(setFilters({ model }));
        navigate("/allVariants");
      } else {
        toast.error("No variants found");
      }
    } catch (error) {
      toast.error(error || "Failed to fetch vehicle variants");
    }
  };

  return (
    <div className="min-h-screen bg-bg-secondary pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {availableCars && availableCars.length > 0 ? (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="max-w-2xl space-y-2">
                <h1 className="text-4xl font-black text-slate-900 leading-tight">
                  Choose Your <span className="text-accent-500">Perfect Ride</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  We found {availableCars.length} available options based on your search criteria. Select a vehicle to see more details.
                </p>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    viewMode === "list" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <IconList size={18} />
                  List View
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    viewMode === "map" 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <IconMap size={18} />
                  Map View
                </button>
              </div>
            </div>

            {viewMode === "map" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full"
              >
                <MapComponent 
                  vehicles={availableCars.filter(v => !v.isDeleted)} 
                  onVehicleClick={handleShowVariants}
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
              {availableCars.map((vehicle, idx) => (
                !vehicle.isDeleted && (
                  <VehicleCard 
                    key={vehicle._id || idx} 
                    vehicle={vehicle} 
                    onClick={() => handleShowVariants(vehicle.model)}
                  />
                )
              ))}
              </motion.div>
            )}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-24 px-6 text-center border-none shadow-premium bg-white">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <IconMoodSad size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Vehicles Available</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
              Unfortunately, we couldn't find any vehicles available for your selected dates and location. Try adjusting your search criteria.
            </p>
            <Button onClick={() => navigate("/")}>Change Search</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AvailableVehiclesAfterSearch;
