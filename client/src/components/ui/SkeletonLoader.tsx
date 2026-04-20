import React from "react";
import { cn } from "../utils/cn";

/**
 * Modern, flexible Skeleton Loader with pulse animation.
 */
const SkeletonLoader = ({ className, count = 1, variant = "card" }) => {
  const CardSkeleton = () => (
    <div className="space-y-4">
      <div className="aspect-[16/10] bg-slate-200 rounded-3xl animate-pulse" />
      <div className="space-y-2 px-2">
        <div className="h-4 bg-slate-200 rounded-lg w-1/4 animate-pulse" />
        <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
        <div className="grid grid-cols-3 gap-2 py-4">
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-12 bg-slate-200 rounded-2xl w-full animate-pulse" />
      </div>
    </div>
  );

  const ListSkeleton = () => (
    <div className="flex items-center gap-6 p-4 rounded-3xl bg-white shadow-sm border border-slate-100">
      <div className="w-48 h-32 bg-slate-200 rounded-2xl animate-pulse" />
      <div className="flex-1 space-y-3">
        <div className="h-6 bg-slate-200 rounded-lg w-1/3 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
        <div className="flex gap-4">
          <div className="w-16 h-4 bg-slate-50 rounded-lg animate-pulse" />
          <div className="w-16 h-4 bg-slate-50 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="w-32 h-12 bg-slate-200 rounded-xl animate-pulse mr-4" />
    </div>
  );

  return (
    <div className={cn("grid gap-8", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>
          {variant === "card" ? <CardSkeleton /> : <ListSkeleton />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SkeletonLoader;