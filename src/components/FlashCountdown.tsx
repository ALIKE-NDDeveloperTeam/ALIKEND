import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Flame } from 'lucide-react';

export interface FlashCountdownProps {
  targetEndTime?: string | Date | null;
  onExpire?: () => void;
  autoResetEvery24h?: boolean;
  className?: string;
  showLabels?: boolean;
}

export const FlashCountdown: React.FC<FlashCountdownProps> = ({
  targetEndTime,
  onExpire,
  autoResetEvery24h = true,
  className = '',
  showLabels = true,
}) => {
  // Normalize target end timestamp
  const targetTimestamp = useMemo(() => {
    if (!targetEndTime) {
      // Default to 24 hours from today's midnight if not specified
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      return endOfDay.getTime();
    }
    const t = new Date(targetEndTime).getTime();
    return isNaN(t) ? Date.now() + 24 * 60 * 60 * 1000 : t;
  }, [targetEndTime]);

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>(() => calculateTimeLeft(targetTimestamp, autoResetEvery24h));

  function calculateTimeLeft(target: number, autoReset: boolean) {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      if (autoReset) {
        // Automatically roll over 24-hour cycle
        const dayMs = 24 * 60 * 60 * 1000;
        const cyclesPassed = Math.floor(Math.abs(diff) / dayMs) + 1;
        diff = target + cyclesPassed * dayMs - now;
      } else {
        return { hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
    }

    const totalSecs = Math.max(0, Math.floor(diff / 1000));
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    return { hours, minutes, seconds, isExpired: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const res = calculateTimeLeft(targetTimestamp, autoResetEvery24h);
      setTimeLeft(res);
      if (res.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp, autoResetEvery24h, onExpire]);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono tracking-wider ${className}`}>
        <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
        <span>OFFER EXPIRED</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {showLabels && (
        <span className="text-[10px] sm:text-xs uppercase font-extrabold text-neutral-600 dark:text-neutral-400 tracking-wider flex items-center gap-1 mr-0.5 font-mono">
          <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Ends In:</span>
        </span>
      )}

      <div className="flex items-center gap-1 sm:gap-1.5 font-mono text-xs sm:text-sm">
        {/* Hours Box */}
        <div className="flex flex-col items-center">
          <div className="min-w-[34px] sm:min-w-[40px] px-2 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-[#0A1028] text-[#0F1A3C] dark:text-[#F5A623] border border-neutral-300/80 dark:border-[#F5A623]/30 font-black text-center shadow-xs">
            {pad(timeLeft.hours)}
          </div>
          <span className="text-[8px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">HRS</span>
        </div>

        <span className="self-start mt-1 text-[#F5A623] font-black">:</span>

        {/* Minutes Box */}
        <div className="flex flex-col items-center">
          <div className="min-w-[34px] sm:min-w-[40px] px-2 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-[#0A1028] text-[#0F1A3C] dark:text-[#F5A623] border border-neutral-300/80 dark:border-[#F5A623]/30 font-black text-center shadow-xs">
            {pad(timeLeft.minutes)}
          </div>
          <span className="text-[8px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">MIN</span>
        </div>

        <span className="self-start mt-1 text-[#F5A623] font-black">:</span>

        {/* Seconds Box */}
        <div className="flex flex-col items-center">
          <div className="min-w-[34px] sm:min-w-[40px] px-2 py-1 sm:py-1.5 rounded-lg bg-white dark:bg-[#0A1028] text-[#0F1A3C] dark:text-[#F5A623] border border-neutral-300/80 dark:border-[#F5A623]/30 font-black text-center shadow-xs">
            {pad(timeLeft.seconds)}
          </div>
          <span className="text-[8px] font-bold text-neutral-500 dark:text-neutral-400 mt-0.5">SEC</span>
        </div>
      </div>
    </div>
  );
};

export default FlashCountdown;
