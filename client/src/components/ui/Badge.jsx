import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Badge = ({ children, variant = "default", className, ...props }) => {
  const cn = (...inputs) => twMerge(clsx(inputs));

  const variants = {
    default: "bg-primary-100 text-primary-800 border-primary-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    outline: "bg-transparent text-foreground border-border",
    secondary: "bg-slate-100 text-slate-800 border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
