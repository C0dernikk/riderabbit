import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  IconBuildingBank,
  IconDeviceMobile,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { vendorService } from "../../../services/vendor";
import { updateUser } from "../../../features/auth/authSlice";

const VendorPayouts = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  // Initialize state with current user's payout details if they exist
  const initialPayouts = currentUser?.payoutDetails || {};

  const [activeTab, setActiveTab] = useState("bank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bankName: initialPayouts.bankName || "",
    accountName: initialPayouts.accountName || "",
    accountNumber: initialPayouts.accountNumber || "",
    ifscCode: initialPayouts.ifscCode || "",
    upiId: initialPayouts.upiId || "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await vendorService.updatePayoutDetails(formData);

      if (res.success) {
        // Update Redux state with new payout details
        dispatch(
          updateUser({ ...currentUser, payoutDetails: res.payoutDetails })
        );
        toast.success("Payout details updated successfully!");
      } else {
        toast.error(res.message || "Failed to update payout details");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 leading-tight">
          Payout <span className="text-primary-600">Settings</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Manage how you receive your rental earnings
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-1 shadow-sm border border-slate-100 bg-white inline-flex mb-2">
            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "bank"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <IconBuildingBank size={18} />
              Bank Transfer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upi")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                activeTab === "upi"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <IconDeviceMobile size={18} />
              UPI
            </button>
          </Card>

          <Card className="p-6 md:p-8 bg-white border border-slate-100 shadow-premium">
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === "bank" ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <IconBuildingBank className="text-primary-600" />
                    Bank Account Details
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        placeholder="e.g. HDFC Bank"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        placeholder="Name on bank account"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter account number"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={formData.ifscCode}
                        onChange={handleInputChange}
                        placeholder="e.g. HDFC0001234"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none uppercase"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <IconDeviceMobile className="text-primary-600" />
                    UPI Details
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      name="upiId"
                      value={formData.upiId}
                      onChange={handleInputChange}
                      placeholder="e.g. yourname@upi"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-primary-600/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </motion.div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8"
                >
                  <IconCheck size={18} />
                  Save Payout Details
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-blue-50/50 border border-blue-100/50">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="text-blue-500 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-bold text-blue-900">How payouts work</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Your earnings are calculated automatically after each successful trip. 
                  Payouts are processed manually by the admin team every Friday.
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Please ensure your details are accurate to avoid any delays in receiving your funds.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorPayouts;
