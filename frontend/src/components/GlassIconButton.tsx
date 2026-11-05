import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface GlassIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'danger';
  className?: string;
  isLightMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  iconSize?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
}

/**
 * Premium unified glassmorphic icon button with frosted translucent glass background,
 * subtle border, hover elevation/scale, and theme/variant awareness.
 */
export const GlassIconButton: React.FC<GlassIconButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'default',
  className = '',
  isLightMode = false,
  size = 'md',
  iconSize,
  'aria-label': ariaLabel,
  title,
  type = 'button',
  disabled = false,
  ...rest
}) => {
  // Dimension definitions
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-9 h-9 sm:w-10 sm:h-10'
  }[size];

  // Icon sizing
  const iconClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    lg: 'w-4.5 h-4.5 sm:w-5 sm:h-5'
  }[iconSize || (size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md')];

  // Theme & variant styling
  let themeClasses = '';
  if (variant === 'danger') {
    themeClasses = isLightMode
      ? 'bg-white/80 hover:bg-rose-500/20 text-neutral-700 hover:text-rose-600 border-white/60 hover:border-rose-400/50 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.22)]'
      : 'bg-black/60 hover:bg-rose-600/30 text-white/90 hover:text-rose-400 border-white/20 hover:border-rose-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.3)]';
  } else {
    themeClasses = isLightMode
      ? 'bg-white/70 hover:bg-white/95 text-neutral-800 border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]'
      : 'bg-black/40 hover:bg-black/60 text-white/90 hover:text-white border-white/20 hover:border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.35)]';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || title}
      title={title}
      className={`rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer select-none shrink-0 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 ${sizeClasses} ${themeClasses} ${className}`}
      {...rest}
    >
      <Icon className={`${iconClasses} stroke-[2.25] transition-transform duration-200`} />
    </button>
  );
};

export default GlassIconButton;
