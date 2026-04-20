import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../../features/auth/authSlice";
import VendorOAuth from "../../../components/VendorAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../../../services/auth";
import AuthCard from "../../../components/ui/AuthCard";
import AuthDivider from "../../../components/ui/AuthDivider";
import { btnDark, inputBase, labelError } from "../../../components/ui/tokens";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Enter a valid email",
    }),
  password: z.string().min(1, { message: "Password is required" }),
});

function VendorSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData) => {
    try {
      dispatch(signInStart());
      const data = await authService.vendorLogin(formData);

      if (data.success === false) {
        dispatch(signInFailure(data));
        return;
      }
      if (data.user.role === "vendor") {
        dispatch(signInSuccess(data.user));
        navigate("/vendorDashboard");
      } else {
        dispatch(signInFailure({ message: "Not authorized as vendor" }));
      }
    } catch (error) {
      dispatch(signInFailure({ message: error.message || "Login failed" }));
    }
  };

  return (
    <AuthCard
      title="Vendor sign in"
      badge="Partner portal"
      variant="vendor"
      closeTo="/"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            autoComplete="email"
            className={inputBase}
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className={labelError}>{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            className={inputBase}
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password ? (
            <p className={labelError}>{errors.password.message}</p>
          ) : null}
          <div className="mt-1 flex justify-end">
            <Link to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className={btnDark("w-full")}
          disabled={isLoading}
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            New vendor?{" "}
            <Link
              to="/vendorSignup"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Create account
            </Link>
          </p>
          {isError ? (
            <p className="text-sm font-medium text-red-600">
              {isError.message || "Something went wrong"}
            </p>
          ) : null}
        </div>
      </form>

      <AuthDivider />
      <VendorOAuth />
    </AuthCard>
  );
}

export default VendorSignin;
