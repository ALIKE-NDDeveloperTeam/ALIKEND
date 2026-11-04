import React, { useState } from 'react';
import { X, DollarSign, QrCode, Wallet, CreditCard, ShieldCheck, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface RidePaymentModalProps {
  bookingId: string;
  totalFare: number;
  driverName?: string;
  onConfirmPayment: (method: 'cash' | 'upi' | 'wallet' | 'card', upiId?: string) => Promise<void>;
  onClose: () => void;
  isLightMode?: boolean;
}

export const RidePaymentModal: React.FC<RidePaymentModalProps> = ({
  bookingId,
  totalFare,
  driverName = 'Driver Partner',
  onConfirmPayment,
  onClose,
  isLightMode = false,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'upi' | 'wallet' | 'card'>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    try {
      setProcessing(true);
      setError('');
      await onConfirmPayment(selectedMethod, selectedMethod === 'upi' ? upiId : undefined);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Trip Settlement</span>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100">
              Select Payment Option
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

        {/* Total Amount Due */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Total Payable to {driverName}
          </p>
          <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100 font-mono">
            ₹{totalFare}
          </p>
          <p className="text-[11px] text-neutral-500">Booking ID: {bookingId}</p>
        </div>

        {/* Payment Methods List */}
        <div className="space-y-2.5">
          {/* 1. UPI */}
          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              selectedMethod === 'upi'
                ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-neutral-100'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black">UPI Instant Pay</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                  Zero Fee
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">GPay, PhonePe, Paytm or UPI ID</p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'upi' ? 'border-amber-500 bg-amber-500' : 'border-neutral-400'
              }`}
            >
              {selectedMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            </div>
          </button>

          {/* 2. Cash to Driver */}
          <button
            type="button"
            onClick={() => setSelectedMethod('cash')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              selectedMethod === 'cash'
                ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-neutral-100'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black">Cash to Driver</p>
              <p className="text-[11px] text-neutral-500">Hand physical currency to {driverName}</p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'cash' ? 'border-amber-500 bg-amber-500' : 'border-neutral-400'
              }`}
            >
              {selectedMethod === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            </div>
          </button>

          {/* 3. Alike Wallet */}
          <button
            type="button"
            onClick={() => setSelectedMethod('wallet')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              selectedMethod === 'wallet'
                ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-neutral-100'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black">Alike Wallet</p>
              <p className="text-[11px] text-neutral-500">Available Balance: ₹1,450.00</p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'wallet' ? 'border-amber-500 bg-amber-500' : 'border-neutral-400'
              }`}
            >
              {selectedMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            </div>
          </button>

          {/* 4. Credit/Debit Card */}
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
              selectedMethod === 'card'
                ? 'border-amber-500 bg-amber-500/10 text-neutral-900 dark:text-neutral-100'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black">Credit / Debit Card</p>
              <p className="text-[11px] text-neutral-500">Visa, Mastercard, RuPay & Amex</p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                selectedMethod === 'card' ? 'border-amber-500 bg-amber-500' : 'border-neutral-400'
              }`}
            >
              {selectedMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
            </div>
          </button>
        </div>

        {/* UPI Input if selected */}
        {selectedMethod === 'upi' && (
          <div className="space-y-1 text-xs">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Your UPI ID (VPA)</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi"
              className="w-full px-3.5 py-2.5 rounded-xl font-mono text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 outline-none focus:border-amber-500"
            />
          </div>
        )}

        {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

        {/* Pay Button */}
        <button
          type="button"
          disabled={processing}
          onClick={handlePay}
          className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirming Payment...</span>
            </>
          ) : (
            <>
              <span>Pay ₹{totalFare} via {selectedMethod.toUpperCase()}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
