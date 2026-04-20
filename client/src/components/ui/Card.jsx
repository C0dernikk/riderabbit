import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ 
  children, 
  className, 
  animate = true, 
  hoverEffect = false,
  glass = false,
  ...props 
}) => {
  const cn = (...inputs) => twMerge(clsx(inputs));

  const baseStyles = 'rounded-xl p-6 shadow-md border overflow-hidden';
  const colorStyles = glass ? 'bg-white/70 backdrop-blur-md border-white/20' : 'bg-card border-border';
  const hoverStyles = hoverEffect ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : '';

  if (!animate) {
    return (
      <div className={cn(baseStyles, colorStyles, hoverStyles, className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(baseStyles, colorStyles, hoverStyles, className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
