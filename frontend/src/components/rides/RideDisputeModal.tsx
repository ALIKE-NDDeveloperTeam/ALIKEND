import React, { useState } from 'react';
import { X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface RideDisputeModalProps {
  bookingId: string;
  totalFare: number;
  onSubmitDispute: (reason: string, claimedRefund: number, notes?: string) => Promise<void>;
  onClose: () => void;
  isLightMode?: boolean;
}

const DISPUTE_REASONS = [
  'Driver took a significantly longer route than suggested',
  'Incorrect toll or parking fee was added',
  'Charged for waiting time when driver was delayed',
  'Driver demanded extra cash payment above total fare',
  'Ride ended far from destination address',
  'Promotional coupon discount was not applied correctly',
];

export const RideDisputeModal: React.FC<RideDisputeModalProps> = ({
  bookingId,
  totalFare,
  onSubmitDispute,
  onClose,
  isLightMode = false,
}) => {
  const [selectedReason, setSelectedReason] = useState(DISPUTE_REASONS[0]);
  const [claimedRefund, setClaimedRefund] = useState(Math.round(totalFare * 0.3));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      await onSubmitDispute(selectedReason, claimedRefund, notes);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black text-neutral-900 dark:text-neutral-100">
              Report Fare Dispute
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

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">
              Dispute Registered
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto">
              Our audit desk is reviewing the GPS telemetry for Booking #{bookingId}. Refund adjustments will credit to your wallet within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-neutral-500">
              Disputed trip #{bookingId} • Total Charged: <span className="font-bold text-neutral-900 dark:text-neutral-100">₹{totalFare}</span>
            </p>

            {/* Select Reason */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Issue Category
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none text-neutral-800 dark:text-neutral-200"
              >
                {DISPUTE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Claimed Refund Amount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Claimed Refund Amount (₹)
              </label>
              <input
                type="number"
                min={1}
                max={totalFare}
                value={claimedRefund}
                onChange={(e) => setClaimedRefund(Number(e.target.value))}
                className="w-full p-3 rounded-xl text-xs font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Details & Remarks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explain what happened during the trip..."
                rows={3}
                className="w-full p-3 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none"
              />
            </div>

            {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Claim...</span>
                </>
              ) : (
                <span>Submit Dispute for Review</span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
