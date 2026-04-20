import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  IconArrowRight,
  IconLock,
  IconMail,
  IconArrowLeft,
} from "@tabler/icons-react";

import { loginUser } from "../../features/auth/authSlice";
import OAuth from "../../components/OAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData) => {
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      toast.success("Welcome back!");

      const role = result.role;
      if (role === "admin") {
        navigate("/adminDashboard");
      } else if (role === "vendor") {
        navigate("/vendorDashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error || "An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-primary-600/10 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-accent-500 transition-colors mb-8 group"
        >
          <IconArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </Link>

        <Card className="p-8 md:p-12 border border-slate-100 shadow-2xl rounded-[2.5rem] bg-white hover:shadow-emerald-500/5 transition-all duration-500">
          <div className="text-center mb-10">
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center group hover:rotate-6 transition-all duration-500">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl rotate-6 group-hover:rotate-12 transition-all duration-500 opacity-40 blur-md" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-emerald-500 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4" />
                <span className="relative text-white font-black text-4xl italic tracking-tighter drop-shadow-md z-10 flex items-center">
                  R<span className="text-emerald-300 -ml-2">R</span>
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your bookings and explore new rides.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                type="email"
                error={errors.email?.message}
                {...register("email")}
                className="bg-slate-50 border-slate-100"
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  placeholder="••••••••"
                  type="password"
                  error={errors.password?.message}
                  {...register("password")}
                  className="bg-slate-50 border-slate-100"
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-bold text-emerald-500 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full h-14 rounded-2xl text-lg font-black bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl shadow-emerald-600/20"
            >
              Sign In
            </Button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <OAuth />

            <p className="text-center text-sm font-medium text-slate-500 pt-6">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-emerald-500 font-black hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </Card>

        {/* Vendor Link */}
        <div className="mt-8 text-center">
          <Link
            to="/vendorSignin"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
          >
            Are you a vendor?{" "}
            <span className="text-primary-600 underline decoration-emerald-500/30 decoration-2 underline-offset-4">
              Vendor Portal
            </span>
            <IconArrowRight size={16} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default SignIn;
