import React, { useEffect, useState, useMemo } from 'react';
import { Crown, Sparkles, Diamond } from 'lucide-react';

export interface PageLoaderProps {
  /**
   * Display mode:
   * - 'full': Fixed viewport overlay with ambient glassmorphic chassis
   * - 'inline': Centered container for inline Suspense boundaries or sub-panels
   * - 'skeleton': Luxury shimmering card grid placeholder
   */
  variant?: 'full' | 'inline' | 'skeleton';
  /** Primary title/status message */
  label?: string;
  /** Secondary subtitle or brand kicker */
  subLabel?: string;
  /** Explicit progress percentage (0 - 100). When omitted, smooth progress simulation runs */
  progress?: number;
  /** Whether to simulate natural progressive increment (0% -> 98%) */
  simulateProgress?: boolean;
  /** Show the progress bar and percentage metric */
  showProgress?: boolean;
  /** Whether to enable glassmorphic backdrop blur */
  blurBackdrop?: boolean;
  /** External trigger to initiate smooth fade-out exit transition */
  isExiting?: boolean;
  /** Callback fired after exit fade-out transition concludes */
  onLoaded?: () => void;
  /** Size scale of central emblem */
  size?: 'sm' | 'md' | 'lg';
  /** Additional container classes */
  className?: string;
  /** Custom sequential phase messages to cycle through */
  phases?: string[];
}

const DEFAULT_PHASES = [
  'Curating Atelier catalog...',
  'Connecting secure data enclave...',
  'Synthesizing luxury collections...',
  'Rendering bespoke experience...',
];

/**
 * Modern, High-Performance Page Loader Component
 *
 * Features:
 * - Counter-rotating dual orbital rings with gradient luminescence
 * - Pulsing brand core with gold/amber/obsidian ambient light spill
 * - Smooth asymptotic progress simulator with tabular-digits
 * - Sequential micro-status message cross-fades
 * - Zero-flicker exit transition with accessibility reduced-motion compliance
 */
export const PageLoader: React.FC<PageLoaderProps> = ({
  variant = 'full',
  label,
  subLabel = 'ALIKE-ND ATELIER',
  progress: explicitProgress,
  simulateProgress = true,
  showProgress = true,
  blurBackdrop = true,
  isExiting: externalExiting = false,
  onLoaded,
  size = 'md',
  className = '',
  phases = DEFAULT_PHASES,
}) => {
  const [internalProgress, setInternalProgress] = useState(12);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Compute active progress value
  const currentProgress = useMemo(() => {
    if (typeof explicitProgress === 'number') {
      return Math.min(100, Math.max(0, Math.round(explicitProgress)));
    }
    return internalProgress;
  }, [explicitProgress, internalProgress]);

  // Handle smooth asymptotic progress simulation
  useEffect(() => {
    if (explicitProgress !== undefined || !simulateProgress) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 96) return 96;
        // Asymptotically decelerate as it approaches 96%
        const remaining = 96 - prev;
        const step = Math.max(0.5, remaining * 0.12);
        return Math.min(96, Math.round((prev + step) * 10) / 10);
      });
    }, 140);

    return () => clearInterval(interval);
  }, [explicitProgress, simulateProgress]);

  // Cycle through phase descriptions periodically
  useEffect(() => {
    if (phases.length <= 1) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [phases]);

  // Handle exit transition trigger
  useEffect(() => {
    if (externalExiting || currentProgress >= 100) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        if (onLoaded) onLoaded();
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [externalExiting, currentProgress, onLoaded]);

  // Size mapping
  const sizeConfig = {
    sm: {
      outerRing: 'w-16 h-16',
      innerRing: 'w-12 h-12',
      core: 'w-8 h-8',
      iconSize: 'w-4 h-4',
    },
    md: {
      outerRing: 'w-24 h-24',
      innerRing: 'w-20 h-20',
      core: 'w-14 h-14',
      iconSize: 'w-6 h-6',
    },
    lg: {
      outerRing: 'w-32 h-32',
      innerRing: 'w-24 h-24',
      core: 'w-16 h-16',
      iconSize: 'w-8 h-8',
    },
  }[size];

  // Render Skeleton Variant
  if (variant === 'skeleton') {
    return (
      <div className={`w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 ${className}`}>
        {/* Top Hero Banner Skeleton */}
        <div className="w-full h-48 sm:h-72 rounded-3xl bg-neutral-900/60 dark:bg-white/[0.03] border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-beam" />
          <div className="p-8 h-full flex flex-col justify-end space-y-3">
            <div className="w-32 h-4 rounded-md bg-white/10" />
            <div className="w-2/3 max-w-md h-8 rounded-lg bg-white/15" />
            <div className="w-1/3 max-w-xs h-4 rounded-md bg-white/10" />
          </div>
        </div>

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-neutral-900/40 dark:bg-white/[0.02] border border-white/5 p-3.5 space-y-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-beam" />
              <div className="w-full aspect-square rounded-xl bg-white/5" />
              <div className="space-y-1.5 pt-1">
                <div className="w-3/4 h-3.5 rounded bg-white/10" />
                <div className="w-1/2 h-3 rounded bg-white/5" />
                <div className="w-1/3 h-4 rounded bg-amber-500/20 pt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Base Content Element
  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`relative z-10 flex flex-col items-center justify-center p-6 sm:p-10 max-w-sm text-center select-none transition-all duration-400 ${
        isFadingOut ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
      }`}
    >
      {/* Ambient Radial Aura Glow */}
      <div className="absolute -top-12 inset-x-0 h-44 bg-gradient-to-b from-[#F5A623]/20 via-[#FF1878]/10 to-transparent blur-3xl pointer-events-none animate-glow-aura" />

      {/* Central Emblem & Orbital Rings */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer Orbital Ring (Clockwise) */}
        <div
          className={`${sizeConfig.outerRing} rounded-full border-2 border-transparent border-t-[#F5A623] border-r-[#F5A623]/30 border-b-transparent border-l-transparent animate-orbit-cw shadow-[0_0_20px_rgba(245,166,35,0.25)]`}
        />

        {/* Inner Orbital Ring (Counter-Clockwise) */}
        <div
          className={`absolute ${sizeConfig.innerRing} rounded-full border-2 border-transparent border-b-[#FF1878] border-l-[#FF1878]/30 border-t-transparent border-r-transparent animate-orbit-ccw shadow-[0_0_18px_rgba(255,24,120,0.2)]`}
        />

        {/* Central Core with Luxury Glassmorphism & Brand Emblem */}
        <div
          className={`absolute ${sizeConfig.core} rounded-full bg-gradient-to-b from-[#0F1A3C] via-[#0A1128] to-[#050914] border border-[#F5A623]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_25px_rgba(0,0,0,0.6)] flex items-center justify-center`}
        >
          <div className="relative text-amber-400 flex items-center justify-center">
            <Crown className={`${sizeConfig.iconSize} drop-shadow-[0_0_8px_rgba(245,166,35,0.6)] animate-pulse`} />
            <Sparkles className="absolute -top-1.5 -right-1.5 w-3 h-3 text-[#FF1878] animate-bounce" />
          </div>
        </div>
      </div>

      {/* Text Hierarchy */}
      <div className="space-y-1.5 mb-5 w-full">
        {subLabel && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.25em] font-mono uppercase text-amber-400/90 font-bold">
            <Diamond className="w-2.5 h-2.5 text-amber-400 animate-spin" />
            <span>{subLabel}</span>
            <Diamond className="w-2.5 h-2.5 text-amber-400 animate-spin" />
          </div>
        )}

        <h3 className="text-sm sm:text-base font-serif font-semibold text-neutral-900 dark:text-neutral-100 min-h-[1.5rem] flex items-center justify-center gap-1.5">
          <span className="key-phrase transition-all duration-300 animate-micro-fade-in" key={label || phaseIndex}>
            {label || phases[phaseIndex]}
          </span>
        </h3>
      </div>

      {/* Modern Micro Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-[220px] space-y-2">
          {/* Track */}
          <div className="w-full h-1.5 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5 relative border border-neutral-300/40 dark:border-white/10">
            {/* Active Fill */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#F5A623] via-[#FF1878] to-[#F5A623] transition-all duration-300 ease-out relative overflow-hidden shadow-[0_0_10px_rgba(245,166,35,0.5)]"
              style={{ width: `${currentProgress}%` }}
            >
              {/* Shimmer Light Beam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer-beam" />
            </div>
          </div>

          {/* Metric Counter & Live Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400 px-0.5">
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
            <span className="tabular-nums font-semibold tracking-wider text-neutral-700 dark:text-neutral-300">
              {Math.round(currentProgress)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // Full Screen Viewport Overlay
  if (variant === 'full') {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-400 ${
          blurBackdrop ? 'backdrop-blur-2xl' : ''
        } ${
          isFadingOut
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100 pointer-events-auto'
        } bg-[#0A1128]/85 dark:bg-[#050914]/90 ${className}`}
      >
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        {content}
      </div>
    );
  }

  // Inline / Suspense Fallback
  return (
    <div
      className={`w-full min-h-[320px] flex items-center justify-center p-6 ${className}`}
    >
      {content}
    </div>
  );
};

export default PageLoader;
