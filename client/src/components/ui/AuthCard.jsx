import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconArrowLeft } from "@tabler/icons-react";
import { cn } from "../utils/cn";

/**
 * Shared chrome for sign-in / sign-up flows (user + vendor).
 */
export default function AuthCard({
  title,
  badge,
  variant = "user",
  closeTo = "/",
  children,
}) {
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
          to={closeTo}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-emerald-500 transition-colors mb-8 group"
        >
          <IconArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Home
        </Link>

        <div className="p-8 md:p-12 border border-slate-100 shadow-2xl rounded-[2.5rem] bg-white hover:shadow-emerald-500/5 transition-all duration-500">
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
              {title}
            </h1>
            {badge ? (
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs">
                {badge}
              </p>
            ) : null}
          </div>
          
          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
