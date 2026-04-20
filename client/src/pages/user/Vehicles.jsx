import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  IconFilter,
  IconCar,
  IconMoodSad,
  IconLayoutGrid,
  IconLayoutList,
  IconAdjustmentsHorizontal,
  IconSearch,
} from "@tabler/icons-react";

import { cn } from "../../components/utils/cn";
import {
  fetchAllVehicles,
  fetchVehicleById,
  setVariants,
} from "../../features/vehicles/vehiclesSlice";
import Filter from "../../components/Filter";
import Sort from "../../components/Sort";
import VehicleCard from "../../components/shared/VehicleCard";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import SkeletonLoader from "../../components/ui/SkeletonLoader";

/**
 * Shared helper to fetch vehicle details and navigate to details page.
 */
export const onVehicleDetail = async (id, dispatch, navigate) => {
  try {
    const res = await dispatch(fetchVehicleById(id));
    if (res.payload) {
      navigate("/vehicleDetails");
    } else {
      toast.error("Failed to fetch vehicle details");
    }
  } catch (error) {
    toast.error(error.message || "An error occurred");
  }
};

const Vehicles = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filteredVehicles: displayData, isLoading } = useSelector(
    (state) => state.vehicles,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    dispatch(setVariants(null));
    dispatch(fetchAllVehicles());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Page Header */}
        <div className="mb-12">
          <div className="bg-emerald-50 px-8 py-6 md:py-8 rounded-[2rem] border border-emerald-100/50 relative overflow-hidden flex flex-col md:flex-row justify-between md:items-end gap-6 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 mb-4 relative z-10"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600">
                  <IconCar size={20} />
                </div>
                <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">
                  Our Collection
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tighter relative z-10"
              >
                Available <span className="text-emerald-600">Fleet</span>
              </motion.h1>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="hidden md:flex bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-emerald-100 shadow-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-emerald-600 text-white shadow-md" : "text-emerald-700/50 hover:text-emerald-700"}`}
                >
                  <IconLayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-emerald-600 text-white shadow-md" : "text-emerald-700/50 hover:text-emerald-700"}`}
                >
                  <IconLayoutList size={20} />
                </button>
              </div>
              <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                variant="secondary"
                className="md:hidden h-11 px-4 gap-2 border-emerald-200 bg-white text-emerald-700"
              >
                <IconAdjustmentsHorizontal size={20} />
                Filters
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              "md:w-1/4 transition-all duration-300",
              isSidebarOpen ? "block" : "hidden md:block",
            )}
          >
            <div className="sticky top-28 space-y-6">
              <Card className="p-0 overflow-hidden border-none shadow-premium bg-white rounded-3xl">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconFilter className="text-primary-600" size={20} />
                    <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                      Filters
                    </h2>
                  </div>
                  <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">
                    Reset
                  </button>
                </div>
                <div className="p-6">
                  <Filter />
                </div>
              </Card>

              {/* Promo Card */}
              <Card className="bg-gradient-to-br from-slate-900 via-primary-900 to-emerald-900 p-8 border-none shadow-premium relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <h4 className="text-white font-black text-xl mb-3 leading-tight">
                    Join as a Vendor?
                  </h4>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Turn your vehicle into a high-growth revenue engine.
                  </p>
                  <Button
                    onClick={() => navigate("/enterprise")}
                    variant="secondary"
                    className="w-full h-11 text-xs uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 border-none text-white shadow-xl shadow-emerald-500/20"
                  >
                    Learn More
                  </Button>
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="md:w-3/4 flex flex-col gap-8">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] shadow-premium border border-slate-100">
              <div className="flex-1 max-w-md relative">
                <IconSearch
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search brand or model..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Sort By:
                </span>
                <Sort />
              </div>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <SkeletonLoader
                count={6}
                className={cn(
                  "grid gap-8",
                  viewMode === "grid"
                    ? "md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1",
                )}
                variant={viewMode === "grid" ? "card" : "list"}
              />
            ) : displayData?.length > 0 ? (
              <motion.div
                layout
                className={cn(
                  "grid gap-8",
                  viewMode === "grid"
                    ? "md:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1",
                )}
              >
                <AnimatePresence>
                  {displayData.map((vehicle) => (
                    <motion.div
                      key={vehicle._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VehicleCard
                        vehicle={vehicle}
                        onClick={() =>
                          onVehicleDetail(vehicle._id, dispatch, navigate)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-24 px-6 text-center border-dashed border-2 border-slate-200 bg-transparent">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
                  <IconMoodSad size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  No Vehicles Found
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">
                  We couldn't find any vehicles matching your current filters.
                  Try adjusting them.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="secondary"
                  className="px-8 rounded-xl border-slate-200"
                >
                  Clear All Filters
                </Button>
              </Card>
            )}

            {/* Pagination / Load More */}
            {displayData?.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="secondary"
                  className="px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-sm bg-white border-slate-200 hover:border-primary-600/30"
                >
                  Load More Vehicles
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
