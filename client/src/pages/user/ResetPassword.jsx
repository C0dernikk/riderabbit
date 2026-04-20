import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { IconArrowLeft, IconLock } from "@tabler/icons-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("Please fill in all fields");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setIsLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      if (res.data.success) {
        toast.success("Password reset successfully! Please sign in.");
        navigate("/signin");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-primary-600/10 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="p-8 md:p-12 border border-slate-100 shadow-2xl rounded-[2.5rem] bg-white hover:shadow-emerald-500/5 transition-all duration-500">
          <div className="text-center mb-10">
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center group hover:rotate-6 transition-all duration-500">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-all duration-500 opacity-40 blur-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10 text-white">
                <IconLock size={28} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Reset Password
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="New Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50 border-slate-100"
            />
            <Input
              label="Confirm New Password"
              placeholder="••••••••"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-slate-50 border-slate-100"
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-14 rounded-2xl text-lg font-black bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-600/20"
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default ResetPassword;
