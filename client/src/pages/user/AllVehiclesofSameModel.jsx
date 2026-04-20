import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IconFilter, IconSortDescending, IconMoodSad } from "@tabler/icons-react";
import { useEffect } from "react";

import { onVehicleDetail } from "./Vehicles";
import Filter from "../../components/Filter";
import Sort from "../../components/Sort";
import { setVariantModeOrNot } from "../../features/vehicles/vehiclesSlice";
import VehicleCard from "../../components/shared/VehicleCard";
import Button from "../../components/ui/Button";

const AllVehiclesofSameModel = () => {
  const { allVariants, filteredVehicles: filterdData } = useSelector(
    (state) => state.vehicles,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (allVariants) {
      dispatch(setVariantModeOrNot(true));
    }
  }, [allVariants, dispatch]);

  const displayData = filterdData?.length > 0 ? filterdData : allVariants;

  return (
    <div className="min-h-screen bg-bg-secondary pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="md:w-1/4 space-y-8">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <IconFilter className="text-accent-500" size={24} />
                <h2 className="text-xl font-extrabold text-slate-900">Filters</h2>
              </div>
              <Filter />
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:w-3/4 flex flex-col gap-8">
            {/* Header & Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-premium border border-slate-100">
              <div>
                <h1 className="text-3xl font-black text-slate-900 leading-tight">
                  Available <span className="text-accent-500">Variants</span>
                </h1>
                <p className="text-slate-500 font-medium">
                  Showing {displayData?.length || 0} variants for this model
                </p>
              </div>
              <div className="flex items-center gap-3">
                <IconSortDescending className="text-slate-400" size={20} />
                <Sort />
              </div>
            </div>

            {/* Vehicle Grid */}
            {displayData && displayData.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayData.map((vehicle, idx) => (
                  !vehicle.isDeleted && (
                    <VehicleCard 
                      key={vehicle._id || idx} 
                      vehicle={vehicle} 
                      onClick={(id) => onVehicleDetail(id, dispatch, navigate)}
                    />
                  )
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-[3rem] shadow-premium border border-slate-100 text-center"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <IconMoodSad size={48} className="text-slate-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">No Variants Found</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  Try adjusting your filters or browse other models.
                </p>
                <Button variant="secondary" onClick={() => navigate("/vehicles")}>
                  View All Vehicles
                </Button>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AllVehiclesofSameModel;
