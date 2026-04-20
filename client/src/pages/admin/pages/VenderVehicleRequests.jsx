import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  IconCheck,
  IconX,
  IconClock,
  IconCar,
  IconUser,
  IconChevronRight,
  IconMoodSad,
} from "@tabler/icons-react";

import {
  setVendorRequests,
} from "../../../features/vehicles/vehiclesSlice";
import { adminService } from "../../../services/admin";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

const VenderVehicleRequests = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { vendorRequests: adminVenodrRequest } = useSelector((state) => state.vehicles);
  const dispatch = useDispatch();

  const fetchVendorRequest = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getVendorRequests();
      dispatch(setVendorRequests(data.requests || []));
    } catch (error) {
      toast.error("Failed to fetch vehicle requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorRequest();
  }, [dispatch]);

  const handleApproveRequest = async (id) => {
    try {
      await adminService.approveVendorRequest(id);
      toast.success("Vehicle request approved!");
      fetchVendorRequest();
    } catch (error) {
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminService.rejectVendorRequest(id);
      toast.success("Vehicle request rejected");
      fetchVendorRequest();
    } catch (error) {
      toast.error("Failed to reject request");
    }
  };

  const pendingRequests =
    adminVenodrRequest?.filter(
      (v) => !v.isDeleted && !v.isApproved && !v.isRejected,
    ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 leading-tight">
          Vehicle <span className="text-primary-600">Requests</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Review and manage new vehicle listings from vendors
        </p>
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
      ) : pendingRequests.length > 0 ? (
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
                    Vendor
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {pendingRequests.map((vehicle, idx) => (
                    <motion.tr
                      key={vehicle._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1">
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
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600/10 flex items-center justify-center text-primary-600">
                            <IconUser size={14} />
                          </div>
                          <span className="text-sm font-bold text-slate-700">
                            Vendor ID: {vehicle.vendorId?.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="secondary"
                            className="px-4 py-2 rounded-xl text-xs bg-rose-50 text-red-600 border-none hover:bg-rose-100"
                            onClick={() => handleReject(vehicle._id)}
                          >
                            <IconX size={16} className="mr-1" />
                            Reject
                          </Button>
                          <Button
                            variant="primary"
                            className="px-4 py-2 rounded-xl text-xs bg-emerald-500 hover:bg-emerald-600 border-none shadow-emerald-200"
                            onClick={() => handleApproveRequest(vehicle._id)}
                          >
                            <IconCheck size={16} className="mr-1" />
                            Approve
                          </Button>
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
            <IconMoodSad size={48} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            All Caught Up!
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            There are no pending vehicle requests from vendors at the moment.
          </p>
        </Card>
      )}
    </div>
  );
};

export default VenderVehicleRequests;
