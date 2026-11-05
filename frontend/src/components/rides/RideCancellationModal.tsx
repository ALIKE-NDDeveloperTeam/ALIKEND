import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface RideCancellationModalProps {
  bookingId: string;
  onConfirmCancel: (reason: string) => Promise<void>;
  onClose: () => void;
  isLightMode?: boolean;
}

const CANCELLATION_REASONS = [
  'Driver is taking too long to arrive',
  'Driver requested to cancel the ride',
  'Driver went in the wrong direction',
  'Entered wrong pickup or dropoff address',
  'Found alternative transport',
  'My plans changed / Ride not needed anymore',
  'Selected wrong vehicle category',
  'Other reason',
];

export const RideCancellationModal: React.FC<RideCancellationModalProps> = ({
  bookingId,
  onConfirmCancel,
  onClose,
  isLightMode = false,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    try {
      setCancelling(true);
      setError('');
      const reasonToSubmit =
        selectedReason === 'Other reason' && customReason.trim()
          ? customReason.trim()
          : selectedReason;
      await onConfirmCancel(reasonToSubmit);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel ride');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-base font-black text-neutral-900 dark:text-neutral-100">
              Cancel Ride #{bookingId}
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

        <p className="text-xs text-neutral-500">
          Please let us know why you need to cancel this ride. No fee applies if driver is more than 5 minutes delayed.
        </p>

        {/* Reasons List */}
        <div className="space-y-2">
          {CANCELLATION_REASONS.map((reason) => (
            <label
              key={reason}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-xs cursor-pointer transition-colors ${
                selectedReason === reason
                  ? 'border-rose-500/50 bg-rose-500/10 text-neutral-900 dark:text-neutral-100 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <input
                type="radio"
                name="cancellationReason"
                checked={selectedReason === reason}
                onChange={() => setSelectedReason(reason)}
                className="accent-rose-500 w-4 h-4"
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        {selectedReason === 'Other reason' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Please specify your reason..."
            rows={2}
            className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:border-rose-500"
          />
        )}

        {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Don't Cancel
          </button>
          <button
            type="button"
            disabled={cancelling}
            onClick={handleCancel}
            className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
          >
            {cancelling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Confirm Cancel</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
