import React, { useState } from 'react';
import { AlertTriangle, X, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface OrderCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  orderNumber?: string;
  onCancelled: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const OrderCancellationModal: React.FC<OrderCancellationModalProps> = ({
  isOpen,
  onClose,
  taskId,
  orderNumber,
  onCancelled,
  showToast,
  isLightMode = false,
}) => {
  const [category, setCategory] = useState<string>('vehicle_breakdown');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast?.('Please specify the cancellation reason.', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await deliveryPartnerApi.cancelOrder(taskId, {
        category,
        reason: reason.trim(),
      });

      if (res.compensationRecord?.cancellationCompensation > 0) {
        showToast?.(
          `Order cancelled. ₹${res.compensationRecord.cancellationCompensation} arrival compensation credited to your wallet!`,
          'success'
        );
      } else {
        showToast?.('Order cancelled successfully.', 'info');
      }

      onCancelled();
      onClose();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to cancel order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative space-y-4 ${
          isLightMode
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black">Cancel Delivery Assignment</h3>
            <p className="text-xs text-neutral-400">Order: {orderNumber || taskId}</p>
          </div>
        </div>

        {/* Cancellation compensation notice */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span>
            <strong>Rider Protection Rule:</strong> If you already arrived at the store doorstep, you will automatically receive ₹35 guaranteed compensation.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              Reason Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="vehicle_breakdown">🛵 Vehicle Breakdown (Puncture / Engine)</option>
              <option value="extreme_weather">🌧️ Extreme Weather / Heavy Waterlogging</option>
              <option value="customer_unreachable">📵 Customer Unreachable (Waited 8+ mins)</option>
              <option value="store_closed">🏪 Store Closed / Merchant Denied Order</option>
              <option value="health_emergency">🩺 Personal Health Emergency</option>
              <option value="other">⚠️ Other Operational Constraint</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">
              Detailed Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Rear tyre punctured near Delhi Gate, unable to ride further safely..."
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
            >
              Back to Duty
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>Confirm Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
