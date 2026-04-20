import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { IconArrowLeft, IconMail } from "@tabler/icons-react";
import { motion } from "framer-motion";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setIsLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.success) {
        setIsSent(true);
        toast.success("Reset link sent to your email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");
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
        <Link
          to="/signin"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-accent-500 transition-colors mb-8 group"
        >
          <IconArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Login
        </Link>

        <Card className="p-8 md:p-12 border border-slate-100 shadow-2xl rounded-[2.5rem] bg-white hover:shadow-emerald-500/5 transition-all duration-500">
          <div className="text-center mb-10">
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center group hover:rotate-6 transition-all duration-500">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-all duration-500 opacity-40 blur-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10 text-white">
                <IconMail size={28} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50 border-slate-100"
              />

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full h-14 rounded-2xl text-lg font-black bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-600/20"
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-800 mb-2">Check your email</h3>
              <p className="text-emerald-600 font-medium mb-6">
                We've sent a password reset link to <br/><strong>{email}</strong>
              </p>
              <Button
                variant="outline"
                onClick={() => setIsSent(false)}
                className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                Try another email
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;
