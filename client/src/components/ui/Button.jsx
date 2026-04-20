import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  isLoading,
  disabled,
  ...props
}) => {
  const cn = (...inputs) => twMerge(clsx(inputs));

  const variants = {
    primary: "bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:shadow-lg active:scale-95",
    secondary: "bg-white border border-border text-foreground hover:bg-muted active:scale-95",
    outline: "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:scale-95",
    ghost: "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95",
    accent: "bg-accent-500 text-white shadow-md hover:bg-sky-600 hover:shadow-lg active:scale-95",
    danger: "bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-95",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseStyles = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : children}
    </motion.button>
  );
};

export default Button;
