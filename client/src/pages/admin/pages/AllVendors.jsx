import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUsers,
  IconUser,
  IconMail,
  IconTrash,
  IconSearch,
  IconMoodSad,
  IconUserCheck,
  IconMapPin,
  IconBuildingBank,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { adminService } from "../../../services/admin";
import Card from "../../../components/ui/Card";

const AllVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllVendors();
      setVendors(data || []);
    } catch (error) {
      toast.error("Failed to fetch vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleDeleteVendor = async (vendorId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this vendor? This will also affect their vehicle listings.",
      )
    )
      return;
    try {
      await adminService.deleteUser(vendorId);
      setVendors((prev) => prev.filter((v) => v._id !== vendorId));
      toast.success("Vendor deleted successfully");
    } catch (error) {
      toast.error("Failed to delete vendor");
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.role === "vendor" &&
      (v.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight">
            Partner <span className="text-primary-600">Vendors</span>
          </h1>
          <p className="text-slate-500 font-medium">
            Manage all registered car rental partners
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
          <IconUserCheck className="text-primary-600" size={20} />
          <span className="font-bold text-slate-700">
            {filteredVendors.length} Active Vendors
          </span>
        </div>
      </div>

      <div className="relative">
        <IconSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search vendors by name, email or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-primary-600/20 outline-none transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl animate-pulse shadow-sm border border-slate-100"
            />
          ))}
        </div>
      ) : filteredVendors.length > 0 ? (
        <Card className="p-0 overflow-hidden border-none shadow-premium bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Vendor Info
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Contact Details
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Location
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Payout Info
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredVendors.map((vendor, idx) => (
                    <motion.tr
                      key={vendor._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-600 overflow-hidden">
                            {vendor.profilePicture ? (
                              <img
                                src={vendor.profilePicture}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <IconUser size={20} />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {vendor.username}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              ID: {vendor._id?.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                            <IconMail size={14} className="text-slate-300" />
                            {vendor.email}
                          </div>
                          {vendor.phoneNumber && (
                            <div className="text-xs text-slate-400 font-bold">
                              {vendor.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <IconMapPin size={16} className="text-slate-300" />
                          {vendor.address || "Not specified"}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 bg-emerald-50 w-max px-2.5 py-1 rounded-md text-emerald-700 font-black border border-emerald-100 shadow-sm">
                            <span>₹{vendor.totalRevenue?.toLocaleString() || 0}</span>
                            <span className="text-[9px] uppercase tracking-widest opacity-80">Revenue</span>
                          </div>
                          
                          {vendor.payoutDetails?.bankName ? (
                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 min-w-[160px]">
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="p-1 bg-white rounded shadow-sm">
                                  <IconBuildingBank size={14} className="text-slate-600" />
                                </div>
                                <span className="text-xs text-slate-700 font-black truncate max-w-[110px]">{vendor.payoutDetails.bankName}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[10px] text-slate-500 font-bold truncate max-w-[140px]" title={vendor.payoutDetails.accountName}>
                                  {vendor.payoutDetails.accountName}
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">A/C</span>
                                  <span className="text-[10px] text-slate-600 font-medium font-mono">{vendor.payoutDetails.accountNumber}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">IFSC</span>
                                  <span className="text-[10px] text-slate-600 font-medium font-mono uppercase">{vendor.payoutDetails.ifscCode}</span>
                                </div>
                              </div>
                            </div>
                          ) : vendor.payoutDetails?.upiId ? (
                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 min-w-[160px]">
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <div className="p-1 bg-white rounded shadow-sm">
                                  <IconDeviceMobile size={14} className="text-slate-600" />
                                </div>
                                <span className="text-xs text-slate-700 font-black">UPI Details</span>
                              </div>
                              <div className="text-[10px] text-slate-600 font-medium font-mono bg-white px-2 py-1.5 rounded border border-slate-100 break-all">
                                {vendor.payoutDetails.upiId}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 border-dashed text-center min-w-[160px]">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Not Configured</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button
                          onClick={() => handleDeleteVendor(vendor._id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete Vendor"
                        >
                          <IconTrash size={18} />
                        </button>
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
            No Vendors Found
          </h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            {searchTerm
              ? "No vendors match your search."
              : "There are no registered vendors in the system yet."}
          </p>
        </Card>
      )}
    </div>
  );
};

export default AllVendors;
