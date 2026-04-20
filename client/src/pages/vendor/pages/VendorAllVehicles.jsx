import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconCar,
  IconCheck,
  IconClock,
  IconX,
  IconChevronRight,
} from "@tabler/icons-react";

import {
  setVendorVehicles,
} from "../../../features/vehicles/vehiclesSlice";
import { vendorService } from "../../../services/vendor";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const VendorAllVehicles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  const { isAddVehicleClicked } = useSelector((state) => state.ui);
  const { vendorVehicles } = useSelector((state) => state.vehicles);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await vendorService.getMyVehicles();
        dispatch(setVendorVehicles(data.vehicles || []));
      } catch (error) {
        toast.error("Failed to fetch vehicles");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dispatch, isAddVehicleClicked]);

  const handleEditVehicle = (vehicle_id) => {
    navigate(
      `/vendorDashboard/vendorEditProductComponent?vehicle_id=${vehicle_id}`,
    );
  };

  const handleDeleteVehicles = (vehicle_id) => {
    navigate(
      `/vendorDashboard/vendorDeleteVehicleModal?vehicle_id=${vehicle_id}`,
    );
  };

  const getStatusBadge = (vehicle) => {
    if (vehicle.isRejected) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-red-700 text-[10px] font-black uppercase tracking-widest">
          <IconX size={12} strokeWidth={3} />
          Rejected
        </div>
      );
    }
    if (vehicle.isApproved) {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
          <IconCheck size={12} strokeWidth={3} />
          Approved
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest">
        <IconClock size={12} strokeWidth={3} />
        Pending
      </div>
    );
  };

  const activeVehicles = vendorVehicles?.filter((v) => !v.isDeleted) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            My <span className="text-primary-600">Fleet</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage and track your listed vehicles
          </p>
        </div>
        <Button
          onClick={() => navigate("/vendorDashboard/vendorAddProduct")}
          className="flex items-center gap-2"
        >
          <IconPlus size={20} />
          Add New Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : activeVehicles.length > 0 ? (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vehicle
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Reg Number
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Price/Day
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {activeVehicles.map((vehicle, idx) => (
                    <motion.tr
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1 group-hover:scale-105 transition-transform">
                            <img
                              src={vehicle.images?.[0]}
                              alt={vehicle.model}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 capitalize">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              {vehicle.carType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {vehicle.registrationNumber}
                        </span>
                      </td>
                      <td className="px-8 py-4">{getStatusBadge(vehicle)}</td>
                      <td className="px-8 py-4">
                        <div className="font-black text-primary-600">
                          ₹{vehicle.price}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditVehicle(vehicle._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-600/10 transition-all"
                            title="Edit Vehicle"
                          >
                            <IconEdit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteVehicles(vehicle._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete Vehicle"
                          >
                            <IconTrash size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 px-6 text-center border-none shadow-premium bg-white">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <IconCar size={48} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            No Vehicles Found
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            You haven't added any vehicles to your fleet yet. Start by adding
            your first vehicle.
          </p>
          <Button onClick={() => navigate("/vendorDashboard/vendorAddProduct")}>
            Add Your First Vehicle
          </Button>
        </Card>
      )}
    </div>
  );
};

export default VendorAllVehicles;
