import React, { useState } from 'react';
import { X, Calendar, Clock, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface RideScheduleModalProps {
  onScheduleConfirm: (dateStr: string) => void;
  onClose: () => void;
  isLightMode?: boolean;
}

export const RideScheduleModal: React.FC<RideScheduleModalProps> = ({
  onScheduleConfirm,
  onClose,
  isLightMode = false,
}) => {
  // Default to tomorrow 9:00 AM
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleConfirm = () => {
    const combined = new Date(`${selectedDate}T${selectedTime}:00`);
    onScheduleConfirm(combined.toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Advance Reservation</span>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
              Schedule Your Ride
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Card */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span>Guaranteed On-Time Dispatch</span>
          </p>
          <p className="text-[11px] text-neutral-500">
            We will lock in your fare now and dispatch your driver partner 15 minutes before the scheduled pickup time.
          </p>
        </div>

        {/* Date and Time Pickers */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Select Date</span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium text-sm outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Select Time</span>
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium text-sm outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          <span>Confirm Schedule</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
