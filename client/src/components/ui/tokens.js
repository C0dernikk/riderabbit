import { cn } from "../utils/cn";

export const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/25";

export const labelError = "mt-1.5 text-xs font-medium text-red-600";

export function btnPrimary(extra) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl bg-primary-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-900/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-900",
    extra,
  );
}

export function btnSecondary(extra) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
    extra,
  );
}

export function btnDark(extra) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400",
    extra,
  );
}

export function linkSubtle(extra) {
  return cn(
    "text-sm font-medium text-primary-600 underline-offset-4 hover:text-primary-600/80 hover:underline",
    extra,
  );
}
