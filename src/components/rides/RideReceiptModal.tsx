import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Car } from 'lucide-react';
import { DigitalReceipt } from '../../types';

interface RideReceiptModalProps {
  receipt: DigitalReceipt;
  onClose: () => void;
  isLightMode?: boolean;
}

export const RideReceiptModal: React.FC<RideReceiptModalProps> = ({
  receipt,
  onClose,
  isLightMode = false,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(receipt.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                Official Tax Invoice
              </span>
              <span className="text-xs font-mono text-neutral-400">#{receipt.invoiceNumber}</span>
            </div>
            <h2 className="text-lg font-black text-neutral-900 dark:text-neutral-100 mt-1">
              Trip Receipt
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

        {/* Customer & Driver Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850 text-xs">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Passenger</p>
            <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{receipt.customer.name}</p>
            <p className="text-neutral-500 text-[11px] font-mono">{receipt.customer.phone}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Driver Partner</p>
            <p className="font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">{receipt.driver.name}</p>
            <p className="text-neutral-500 text-[11px] font-mono">{receipt.driver.vehicleNumber} ({receipt.driver.vehicleModel})</p>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Pickup Location</p>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">{receipt.trip.pickup}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></span>
            <div>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Destination</p>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">{receipt.trip.destination}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] text-neutral-500 font-mono">
            <span>Distance: <strong>{receipt.trip.distanceKm} km</strong></span>
            <span>Duration: <strong>{receipt.trip.durationMinutes} mins</strong></span>
            {receipt.trip.waitingMinutes > 0 && (
              <span>Wait: <strong>{receipt.trip.waitingMinutes} mins</strong></span>
            )}
          </div>
        </div>

        {/* Itemized Fare Breakdown */}
        <div className="space-y-2 border-t border-b border-neutral-200 dark:border-neutral-800 py-3 text-xs">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Base Fare</span>
            <span className="font-mono">₹{receipt.breakdown.baseFare}</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Distance Fare ({receipt.trip.distanceKm} km)</span>
            <span className="font-mono">₹{receipt.breakdown.distanceFare}</span>
          </div>
          {receipt.breakdown.timeFare > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Time Fare ({receipt.trip.durationMinutes} mins)</span>
              <span className="font-mono">₹{receipt.breakdown.timeFare}</span>
            </div>
          )}
          {receipt.breakdown.waitingFare > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Waiting Charge ({receipt.trip.waitingMinutes} mins)</span>
              <span className="font-mono">₹{receipt.breakdown.waitingFare}</span>
            </div>
          )}
          {receipt.breakdown.tollCharges > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Expressway Toll Surcharge</span>
              <span className="font-mono">₹{receipt.breakdown.tollCharges}</span>
            </div>
          )}
          {receipt.breakdown.airportCharges > 0 && (
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Airport Commercial Vehicle Fee</span>
              <span className="font-mono">₹{receipt.breakdown.airportCharges}</span>
            </div>
          )}
          {receipt.breakdown.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Promo Discount ({receipt.breakdown.promoCode || 'PROMO'})</span>
              <span className="font-mono">-₹{receipt.breakdown.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between text-neutral-500 text-[11px]">
            <span>Goods & Service Tax ({receipt.breakdown.gstRate})</span>
            <span className="font-mono">₹{receipt.breakdown.gstAmount}</span>
          </div>
          <div className="flex justify-between text-neutral-500 text-[11px]">
            <span>Platform Safety & Tech Fee</span>
            <span className="font-mono">₹{receipt.breakdown.safetyFee}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-black text-neutral-900 dark:text-neutral-100 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <span>Total Paid</span>
            <span className="text-base text-emerald-600 dark:text-emerald-400 font-mono">
              ₹{receipt.breakdown.totalFare}
            </span>
          </div>
        </div>

        {/* Payment & GSTIN Details */}
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-850 flex items-center justify-between text-xs">
          <div>
            <p className="text-[10px] font-bold text-neutral-400 uppercase">Payment Method</p>
            <p className="font-bold uppercase text-neutral-800 dark:text-neutral-200">
              {receipt.payment.method === 'cash' ? '💵 Cash to Driver' : `⚡ ${receipt.payment.method.toUpperCase()}`}
            </p>
            {receipt.payment.reference && (
              <p className="text-[10px] text-neutral-400 font-mono">Ref: {receipt.payment.reference}</p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>PAID</span>
            </span>
            <p className="text-[10px] text-neutral-400 font-mono mt-1">GSTIN: {receipt.platform.gstin}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-colors cursor-pointer text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
