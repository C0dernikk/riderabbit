import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import VendorOAuth from "../../../components/VendorAuth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "../../../services/auth";
import AuthCard from "../../../components/ui/AuthCard";
import AuthDivider from "../../../components/ui/AuthDivider";
import { btnDark, inputBase, labelError } from "../../../components/ui/tokens";

const schema = z.object({
  name: z.string().min(2, { message: "Full name is required" }),
  username: z.string().min(3, { message: "Use at least 3 characters" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Enter a valid email",
    }),
  password: z.string().min(4, { message: "Use at least 4 characters" }),
});

function VendorSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.vendorSignup(formData);
      setLoading(false);
      if (data.success === false) {
        setError(true);
        return;
      }
      navigate("/vendorSignin");
    } catch {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <AuthCard
      title="Vendor registration"
      badge="Partner portal"
      variant="vendor"
      closeTo="/"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className={inputBase}
            placeholder="John Doe"
            {...register("name")}
          />
          {errors.name ? (
            <p className={labelError}>{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="username"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            className={inputBase}
            placeholder="vendor_name"
            {...register("username")}
          />
          {errors.username ? (
            <p className={labelError}>{errors.username.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputBase}
            placeholder="fleet@company.com"
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
            id="password"
            type="password"
            autoComplete="new-password"
            className={inputBase}
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password ? (
            <p className={labelError}>{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          className={btnDark("w-full")}
          disabled={isLoading}
        >
          {isLoading ? "Submitting…" : "Register"}
        </button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Already registered?{" "}
            <Link
              to="/vendorSignin"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
          {isError ? (
            <p className="text-sm font-medium text-red-600">
              Could not register. Try again.
            </p>
          ) : null}
        </div>
      </form>

      <AuthDivider />
      <VendorOAuth />
    </AuthCard>
  );
}

export default VendorSignup;
