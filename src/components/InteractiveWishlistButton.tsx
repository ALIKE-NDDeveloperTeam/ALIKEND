import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InteractiveWishlistButtonProps {
  id?: string;
  isWishlisted?: boolean;
  isLiked?: boolean; // alias for backwards compatibility
  productId?: number | string;
  onToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onWishlistChange?: (newState: boolean, productId?: number | string) => void | Promise<void>;
  'aria-label'?: string;
  className?: string;
  iconClassName?: string;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
  tooltipText?: string;
  showFeedbackToast?: boolean;
  onShowToast?: (message: string, type: 'success' | 'info') => void;
  stopPropagation?: boolean;
}

export const InteractiveWishlistButton: React.FC<InteractiveWishlistButtonProps> = ({
  id,
  isWishlisted: controlledWishlisted,
  isLiked: controlledLiked,
  productId,
  onToggle,
  onClick,
  onWishlistChange,
  'aria-label': ariaLabel,
  className = '',
  iconClassName = '',
  title,
  size = 'md',
  showTooltip = true,
  tooltipText,
  showFeedbackToast = false,
  onShowToast,
  stopPropagation = true,
}) => {
  // Support both isWishlisted and isLiked prop names
  const effectiveControlled = controlledWishlisted !== undefined ? controlledWishlisted : controlledLiked;
  const [internalState, setInternalState] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [justToggled, setJustToggled] = useState(false);
  const [localNotification, setLocalNotification] = useState<string | null>(null);

  const isLiked = effectiveControlled !== undefined ? effectiveControlled : internalState;

  // Sync internal state if controlled value changes
  useEffect(() => {
    if (effectiveControlled !== undefined) {
      setInternalState(effectiveControlled);
    }
  }, [effectiveControlled]);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }

    const nextState = !isLiked;
    setJustToggled(true);

    // Optimistic UI state update
    if (effectiveControlled === undefined) {
      setInternalState(nextState);
    }

    // Temporary local feedback badge
    const feedbackMsg = nextState ? 'Saved to Wishlist' : 'Removed from Wishlist';
    setLocalNotification(feedbackMsg);
    setTimeout(() => {
      setLocalNotification(null);
    }, 1800);

    setTimeout(() => {
      setJustToggled(false);
    }, 600);

    // External toast callback if provided
    if (onShowToast) {
      onShowToast(feedbackMsg, nextState ? 'success' : 'info');
    }

    // Callbacks
    if (onToggle) {
      onToggle(e);
    }
    if (onClick) {
      onClick(e);
    }
    if (onWishlistChange) {
      try {
        await onWishlistChange(nextState, productId);
      } catch (err) {
        console.error('Failed to sync wishlist to backend:', err);
        // Rollback state if optimistic update fails
        if (effectiveControlled === undefined) {
          setInternalState(!nextState);
        }
      }
    }
  };

  // Dimensions math for button and icon
  const sizeMap = {
    sm: { container: 'w-7 h-7', icon: 14, strokeWidth: 2.2 },
    md: { container: 'w-8.5 h-8.5', icon: 17, strokeWidth: 2 },
    lg: { container: 'w-10 h-10', icon: 20, strokeWidth: 2 },
    xl: { container: 'w-12 h-12', icon: 24, strokeWidth: 1.8 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const tooltipLabel =
    tooltipText || (title ? title : isLiked ? 'Remove from Wishlist' : 'Save to Wishlist');

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        id={id}
        type="button"
        aria-label={ariaLabel || tooltipLabel}
        title={title || tooltipLabel}
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.82 }}
        transition={{ type: 'spring', stiffness: 450, damping: 17 }}
        className={`relative ${currentSize.container} rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200 backdrop-blur-md shadow-md border border-solid ${
          isLiked
            ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300/80 dark:border-rose-500/50 shadow-rose-500/20'
            : 'bg-white/75 dark:bg-neutral-900/75 hover:bg-white dark:hover:bg-neutral-800 border-white/70 dark:border-white/15 text-neutral-700 dark:text-neutral-200 shadow-black/10'
        } ${className}`}
      >
        {/* Animated aura burst effect on click */}
        <AnimatePresence>
          {justToggled && isLiked && (
            <>
              {/* Expanding glowing halo */}
              <motion.span
                initial={{ scale: 0.5, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-red-500 pointer-events-none -z-10 blur-xs"
              />
              {/* Micro-sparkle particle bursts */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos((deg * Math.PI) / 180) * 18,
                    y: Math.sin((deg * Math.PI) / 180) * 18,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
                  className="absolute w-1.5 h-1.5 rounded-full bg-rose-500 pointer-events-none"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Heart Icon SVG with spring pop animation */}
        <motion.div
          animate={
            justToggled
              ? { scale: [1, 0.75, 1.32, 1] }
              : isLiked
              ? { scale: 1 }
              : { scale: 1 }
          }
          transition={{ duration: 0.42, ease: [0.175, 0.885, 0.32, 1.275] }}
          className="flex items-center justify-center pointer-events-none"
        >
          <svg
            width={currentSize.icon}
            height={currentSize.icon}
            viewBox="0 0 24 24"
            className={`transition-all duration-200 ${iconClassName}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={`heartGradient-${id || 'btn'}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              fill={isLiked ? `url(#heartGradient-${id || 'btn'})` : 'none'}
              stroke={isLiked ? '#e11d48' : 'currentColor'}
              strokeWidth={currentSize.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={
                isLiked
                  ? 'drop-shadow-[0_2px_8px_rgba(244,63,94,0.45)]'
                  : 'text-neutral-700 dark:text-neutral-200'
              }
            />
          </svg>
        </motion.div>
      </motion.button>

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && !localNotification && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/95 dark:bg-neutral-800/95 text-white text-[10px] font-bold tracking-tight whitespace-nowrap shadow-lg backdrop-blur-xs border border-white/10 pointer-events-none z-50"
          >
            {tooltipLabel}
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-900/95 dark:bg-neutral-800/95 rotate-45 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Mini Toast on Click */}
      <AnimatePresence>
        {localNotification && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-neutral-950 text-white text-[10px] font-extrabold whitespace-nowrap shadow-xl border border-rose-500/30 flex items-center gap-1 pointer-events-none z-50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
            <span>{localNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveWishlistButton;
