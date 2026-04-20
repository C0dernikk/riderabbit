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
  IconSearch,
  IconDotsVertical,
} from "@tabler/icons-react";

import { adminService } from "../../../services/admin";
import {
  setUserAllVehicles,
  setVehicles as setVehiclesAction,
} from "../../../features/vehicles/vehiclesSlice";
import { vehicleService } from "../../../services/vehicles";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

function AllVehicles() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [allVehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchBase] = useState("");

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getVehicles();
      const vehiclesList = data.vehicles || data;
      setVehicles(vehiclesList);
      dispatch(setVehiclesAction(vehiclesList));
      dispatch(setUserAllVehicles(vehiclesList));
    } catch (error) {
      toast.error("Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleDelete = async (vehicle_id) => {
    try {
      await vehicleService.adminDeleteVehicle(vehicle_id);
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle_id));
      toast.success("Vehicle deleted successfully");
    } catch (error) {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleEditVehicle = (vehicle_id) => {
    navigate(`/adminDashboard/editProducts?vehicle_id=${vehicle_id}`);
  };

  const filteredVehicles = allVehicles.filter(
    (v) =>
      !v.isDeleted &&
      v.isApproved &&
      (v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Vehicle <span className="text-primary-600">Inventory</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Overview of all approved vehicles in the system
          </p>
        </div>
        <Button
          onClick={() => navigate("/adminDashboard/addProducts")}
          className="flex items-center gap-2"
        >
          <IconPlus size={20} />
          Add Vehicle
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <IconSearch
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by brand, model, or reg number..."
            value={searchTerm}
            onChange={(e) => setSearchBase(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-3xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vehicle Details
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Registration
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Pricing
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredVehicles.map((vehicle, idx) => (
                    <motion.tr
                      key={vehicle._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1">
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
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {vehicle.carType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {vehicle.registrationNumber}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="font-black text-primary-600">
                          ₹{vehicle.price}
                          <span className="text-[10px] text-slate-400 ml-1">
                            /day
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditVehicle(vehicle._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-primary-600 hover:bg-primary-600/10 transition-all"
                            title="Edit"
                          >
                            <IconEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Delete"
                          >
                            <IconTrash size={18} />
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
            {searchTerm
              ? "No vehicles match your search criteria."
              : "There are no approved vehicles in the system yet."}
          </p>
          {searchTerm && (
            <Button variant="secondary" onClick={() => setSearchBase("")}>
              Clear Search
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}

export default AllVehicles;
