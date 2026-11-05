import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  Sparkles,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
  Package,
  Layers,
  Info,
  Sliders,
  X
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface DeliveryEarningsTabProps {
  partner: any;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliveryEarningsTab: React.FC<DeliveryEarningsTabProps> = ({
  partner,
  showToast,
  isLightMode = false,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'today' | 'weekly' | 'monthly'>('today');
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Orders history
  const [orderFilter, setOrderFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Payouts & Adjustments
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState<boolean>(false);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loadingAdjustments, setLoadingAdjustments] = useState<boolean>(false);

  // Request Payout Modal
  const [payoutModalOpen, setPayoutModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('400');
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [submittingPayout, setSubmittingPayout] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number>(partner?.walletBalance || 450);

  // Calculator preview simulation state
  const [calcDistance, setCalcDistance] = useState<number>(4.5);
  const [calcWeight, setCalcWeight] = useState<number>(2.0);
  const [calcWaitMins, setCalcWaitMins] = useState<number>(8);
  const [calcIsPeak, setCalcIsPeak] = useState<boolean>(true);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [calculating, setCalculating] = useState<boolean>(false);

  // Load summary on mount
  useEffect(() => {
    loadSummary();
    loadOrders('all');
    loadPayouts();
    loadAdjustments();
  }, []);

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      setSummaryError(null);
      const res = await deliveryPartnerApi.getEarningsSummary();
      setSummary(res.summary);
      if (res.walletBalance !== undefined) {
        setWalletBalance(res.walletBalance);
      }
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to load earnings summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadOrders = async (filter: 'all' | 'completed' | 'cancelled') => {
    try {
      setLoadingOrders(true);
      setOrderFilter(filter);
      const res = await deliveryPartnerApi.getEarningsHistory(filter, 'all');
      setOrders(res.records || []);
    } catch (err: any) {
      console.warn('Failed to load earnings records:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadPayouts = async () => {
    try {
      setLoadingPayouts(true);
      const res = await deliveryPartnerApi.getPayouts();
      setPayouts(res.payouts || []);
      if (res.currentWalletBalance !== undefined) {
        setWalletBalance(res.currentWalletBalance);
      }
    } catch (err: any) {
      console.warn('Failed to load payouts:', err);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const loadAdjustments = async () => {
    try {
      setLoadingAdjustments(true);
      const res = await deliveryPartnerApi.getAdjustments();
      setAdjustments(res.adjustments || []);
    } catch (err: any) {
      console.warn('Failed to load adjustments:', err);
    } finally {
      setLoadingAdjustments(false);
    }
  };

  // Run earnings calculation simulation
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setCalculating(true);
        const res = await deliveryPartnerApi.estimateEarnings({
          distanceKm: calcDistance,
          weightKg: calcWeight,
          waitingMinutes: calcWaitMins,
          isPeakHour: calcIsPeak,
        });
        setCalcResult(res.breakdown);
      } catch {
        // Silently catch
      } finally {
        setCalculating(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [calcDistance, calcWeight, calcWaitMins, calcIsPeak]);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt < 100) {
      showToast?.('Minimum withdrawal amount is ₹100.', 'warning');
      return;
    }
    if (amt > walletBalance) {
      showToast?.(`Amount exceeds your wallet balance of ₹${walletBalance}.`, 'warning');
      return;
    }

    try {
      setSubmittingPayout(true);
      const res = await deliveryPartnerApi.requestPayout(amt, payoutMethod);
      showToast?.(res.message || 'Payout processed successfully!', 'success');
      setWalletBalance(res.remainingBalance);
      setPayoutModalOpen(false);
      loadPayouts();
      loadSummary();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to request payout', 'error');
    } finally {
      setSubmittingPayout(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Wallet Balance & Payout Trigger Banner */}
      <div
        className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
          isLightMode
            ? 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200'
            : 'bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/40 border-emerald-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Instant Settlement Balance
              </span>
              <span className="text-xs text-neutral-400">Daily Payouts Active</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-emerald-400 tracking-tight">
                ₹{walletBalance.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-neutral-400 font-semibold">Available to Withdraw</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Transfers to UPI (Instant 0-2 mins) or Bank IMPS/NEFT (Daily 9 PM Batch)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setWithdrawAmount(Math.min(walletBalance, 500).toString());
                setPayoutModalOpen(true);
              }}
              disabled={walletBalance < 100}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Earnings Reports Tabs (Daily, Weekly, Monthly) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-5 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-black">Earnings & Performance Reports</h3>
            <p className="text-xs text-neutral-400">Itemized reports based on server-verified orders</p>
          </div>

          {/* Timeframe switch */}
          <div
            className={`p-1 rounded-xl flex border ${
              isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}
          >
            {(['today', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setReportPeriod(period)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  reportPeriod === period
                    ? 'bg-[#FF007F] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {period === 'today' ? 'Today' : period === 'weekly' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error States */}
        {loadingSummary && (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-7 h-7 text-[#FF007F] animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading verified income reports...</p>
          </div>
        )}

        {summaryError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{summaryError}</span>
            </div>
            <button
              type="button"
              onClick={loadSummary}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Report Content */}
        {!loadingSummary && summary && (
          <div>
            {reportPeriod === 'today' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Today's Earnings</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    ₹{summary.today.earnings}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">Net credited</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Completed Orders</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {summary.today.completedOrders}
                  </span>
                  <span className="text-[10px] text-emerald-400 mt-0.5 block">100% Handover Rate</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Avg Pay / Order</span>
                  <span className="text-2xl font-black text-[#FF007F] mt-1 block">
                    ₹{summary.today.avgPerOrder || 90}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">Inc. surge & wait</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Active Hours</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {summary.today.activeHours}h
                  </span>
                  <span className="text-[10px] text-amber-400 mt-0.5 block">On-duty GPS tracked</span>
                </div>
              </div>
            )}

            {reportPeriod === 'weekly' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block font-semibold">7-Day Total</span>
                    <span className="text-2xl font-black text-emerald-400 mt-1 block">
                      ₹{summary.weekly.earnings}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Last 7 calendar days</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block font-semibold">Completed Trips</span>
                    <span className="text-2xl font-black text-white mt-1 block">
                      {summary.weekly.completedOrders}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Doorstep drops</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                    <span className="text-[11px] text-neutral-400 block font-semibold">Incentives Earned</span>
                    <span className="text-2xl font-black text-[#FF007F] mt-1 block">
                      ₹{summary.weekly.incentivesEarned}
                    </span>
                    <span className="text-[10px] text-neutral-500 mt-0.5 block">Peak & promo surges</span>
                  </div>
                </div>

                {/* Day-by-Day Bars */}
                <div className="p-4 rounded-2xl bg-black/20 border border-neutral-800">
                  <span className="text-xs font-bold text-neutral-300 block mb-3">Daily Earnings Trend</span>
                  <div className="flex items-end justify-between gap-2 h-24 pt-4">
                    {summary.weekly.dayBreakdown.map((item: any, idx: number) => {
                      const maxAmt = Math.max(...summary.weekly.dayBreakdown.map((d: any) => d.amount), 1);
                      const heightPercent = Math.max(15, (item.amount / maxAmt) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-bold text-emerald-400">₹{item.amount}</span>
                          <div
                            className="w-full bg-gradient-to-t from-emerald-600 to-[#FF007F] rounded-t-md transition-all duration-500"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[10px] font-semibold text-neutral-400">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {reportPeriod === 'monthly' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Monthly Gross</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block">
                    ₹{summary.monthly.grossPayout}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">All trips & tips</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Total Kilometers</span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {summary.monthly.totalDistanceKm} km
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">Verified route GPS</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Customer Tips</span>
                  <span className="text-2xl font-black text-amber-400 mt-1 block">
                    ₹{summary.monthly.tipsCollected}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">100% passed to rider</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/30 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-semibold">Net Disbursed</span>
                  <span className="text-2xl font-black text-teal-400 mt-1 block">
                    ₹{summary.monthly.netDisbursed}
                  </span>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">After welfare & tax</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Interactive Earnings Calculator & Server Rate Card (Rules 1-8) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF007F]" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              ALIKE ND Pay Rules & Rate Card
            </h3>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF007F]/20 text-[#FF007F]">
            Transparent Algorithm
          </span>
        </div>

        {/* 8 Rules Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">1. Min Delivery Pay</span>
            <span className="text-white font-black">₹45 Minimum</span>
            <span className="text-[10px] text-neutral-500 block">Never underpaid</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">2. Distance Rate</span>
            <span className="text-white font-black">₹10 / km</span>
            <span className="text-[10px] text-neutral-500 block">After first 2 km</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">3. Long Distance</span>
            <span className="text-white font-black">₹14 / km</span>
            <span className="text-[10px] text-neutral-500 block">Beyond 4 km threshold</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">4. Heavy Package</span>
            <span className="text-white font-black">+₹25 to +₹100</span>
            <span className="text-[10px] text-neutral-500 block">&gt;5kg, &gt;12kg, &gt;25kg</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">5. Waiting Time</span>
            <span className="text-white font-black">₹3.50 / min</span>
            <span className="text-[10px] text-neutral-500 block">Beyond 7 mins wait</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">6. Peak Hours</span>
            <span className="text-white font-black">+₹25 to +₹35</span>
            <span className="text-[10px] text-neutral-500 block">Lunch & dinner rush</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">7. Promo Bonuses</span>
            <span className="text-white font-black">+₹20 to +₹60</span>
            <span className="text-[10px] text-neutral-500 block">Sprints & wholesale</span>
          </div>
          <div className="p-2.5 rounded-xl bg-black/30 border border-neutral-800">
            <span className="text-neutral-400 block font-semibold">8. Cancellation Pay</span>
            <span className="text-white font-black">₹35 Guaranteed</span>
            <span className="text-[10px] text-neutral-500 block">If reached store</span>
          </div>
        </div>

        {/* Live Calculation Preview Simulator */}
        <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-neutral-300">Live Order Earnings Simulator</span>
            {calculating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF007F]" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-neutral-400 block font-semibold mb-1">
                Distance: {calcDistance} km
              </label>
              <input
                type="range"
                min="0.5"
                max="12"
                step="0.5"
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                className="w-full accent-[#FF007F] cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block font-semibold mb-1">
                Weight: {calcWeight} kg
              </label>
              <input
                type="range"
                min="0.5"
                max="30"
                step="0.5"
                value={calcWeight}
                onChange={(e) => setCalcWeight(Number(e.target.value))}
                className="w-full accent-[#FF007F] cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[10px] text-neutral-400 block font-semibold mb-1">
                Wait Time: {calcWaitMins} mins
              </label>
              <input
                type="range"
                min="0"
                max="25"
                step="1"
                value={calcWaitMins}
                onChange={(e) => setCalcWaitMins(Number(e.target.value))}
                className="w-full accent-[#FF007F] cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2 pt-3">
              <input
                type="checkbox"
                id="calcPeak"
                checked={calcIsPeak}
                onChange={(e) => setCalcIsPeak(e.target.checked)}
                className="w-4 h-4 accent-[#FF007F] rounded cursor-pointer"
              />
              <label htmlFor="calcPeak" className="text-xs font-bold text-neutral-300 cursor-pointer">
                Peak Hour Active (+₹30)
              </label>
            </div>
          </div>

          {calcResult && (
            <div className="p-3 rounded-xl bg-black/60 border border-neutral-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                <span>Base: ₹{calcResult.basePayment}</span>
                <span>• Dist: ₹{calcResult.distancePayment + calcResult.additionalDistancePayment}</span>
                {calcResult.heavyPackageFee > 0 && <span>• Heavy: ₹{calcResult.heavyPackageFee}</span>}
                {calcResult.waitingTimeCompensation > 0 && <span>• Wait: ₹{calcResult.waitingTimeCompensation}</span>}
                {calcResult.peakHourIncentive > 0 && <span>• Peak: ₹{calcResult.peakHourIncentive}</span>}
                <span>• Promo: ₹{calcResult.promotionalBonus}</span>
              </div>
              <div className="flex items-center gap-1.5 font-black text-emerald-400 text-sm">
                <span>Estimated Pay:</span>
                <span className="text-base text-emerald-400">₹{calcResult.totalEarnings}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Completed & Cancelled Order Records (Rules 1, 10) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-black">Order Earnings Records</h3>
            <p className="text-xs text-neutral-400">Itemized history with audit breakdowns</p>
          </div>

          {/* Filter */}
          <div
            className={`p-1 rounded-xl flex border text-xs font-bold ${
              isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
            }`}
          >
            {(['all', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => loadOrders(f)}
                className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  orderFilter === f
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loadingOrders && (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-5 h-5 text-[#FF007F] animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading order records...</p>
          </div>
        )}

        {!loadingOrders && orders.length === 0 && (
          <div className="py-10 text-center space-y-2">
            <Package className="w-8 h-8 text-neutral-600 mx-auto" />
            <h4 className="text-sm font-bold text-neutral-400">No order records found</h4>
            <p className="text-xs text-neutral-500">Completed deliveries and compensations will appear here.</p>
          </div>
        )}

        {!loadingOrders && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((record) => {
              const isExpanded = expandedOrderId === record.recordId;
              const isCompleted = record.status === 'completed';
              const isCancelled = record.status === 'cancelled' || record.status === 'compensation_paid';
              const totalPayout = record.breakdown?.totalEarnings || record.cancellationCompensation || 0;

              return (
                <div
                  key={record.recordId}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLightMode
                      ? 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                      : 'bg-black/30 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : record.recordId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {record.orderNumber || record.taskId}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {record.status === 'compensation_paid'
                            ? 'Cancelled (Compensated)'
                            : record.status}
                        </span>
                        <span className="text-[10px] text-neutral-500">
                          {new Date(record.date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-1">
                        <span>{record.distanceKm || 0} km</span>
                        <span>•</span>
                        <span>{record.weightKg || 1} kg</span>
                        <span>•</span>
                        <span>{record.waitingMinutes || 0} mins wait</span>
                        {record.isPeakHour && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">Peak Rush</span>
                          </>
                        )}
                      </div>

                      {record.cancellationReason && (
                        <p className="text-[11px] text-rose-400/90 mt-1 italic">
                          Reason: {record.cancellationReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-400 block">
                          +₹{totalPayout}
                        </span>
                        <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                          {record.paymentStatus === 'settled_to_wallet' ? 'Settled in Wallet' : 'Processed'}
                        </span>
                      </div>

                      <div className="p-1 rounded-lg text-neutral-400 hover:text-white">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Itemized Breakdown Receipt */}
                  {isExpanded && record.breakdown && (
                    <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2 text-xs">
                      <span className="font-bold text-neutral-300 block text-[11px]">
                        Itemized Pay Breakdown:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-400">
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Base Guarantee:</span>
                          <span className="font-bold text-white block">₹{record.breakdown.basePayment}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Distance ({record.distanceKm}km):</span>
                          <span className="font-bold text-white block">
                            ₹{(record.breakdown.distancePayment || 0) + (record.breakdown.additionalDistancePayment || 0)}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Heavy Item Fee:</span>
                          <span className="font-bold text-white block">₹{record.breakdown.heavyPackageFee || 0}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Wait Compensation:</span>
                          <span className="font-bold text-white block">
                            ₹{record.breakdown.waitingTimeCompensation || 0}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Peak Hour Surge:</span>
                          <span className="font-bold text-amber-400 block">
                            ₹{record.breakdown.peakHourIncentive || 0}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Promotional Bonus:</span>
                          <span className="font-bold text-[#FF007F] block">
                            ₹{record.breakdown.promotionalBonus || 0}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-black/40">
                          <span>Customer Tip:</span>
                          <span className="font-bold text-emerald-400 block">₹{record.breakdown.tips || 0}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
                          <span className="text-emerald-400 font-bold">Total Credited:</span>
                          <span className="font-black text-emerald-400 text-sm block">
                            ₹{record.breakdown.totalEarnings}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Payment History & Bank / UPI Records (Rules 11, 12) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-black">Disbursements & Payment Records</h3>
            <p className="text-xs text-neutral-400">Bank Transfer & UPI Settlement Statuses</p>
          </div>
          <button
            type="button"
            onClick={loadPayouts}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingPayouts && (
          <div className="py-6 text-center text-xs text-neutral-400">Loading payout records...</div>
        )}

        {!loadingPayouts && payouts.length === 0 && (
          <div className="py-6 text-center text-xs text-neutral-500">No payout records yet.</div>
        )}

        {!loadingPayouts && payouts.length > 0 && (
          <div className="space-y-2.5">
            {payouts.map((pay) => (
              <div
                key={pay.payoutId}
                className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      pay.method === 'upi'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {pay.method === 'upi' ? <Sparkles className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                        {pay.method === 'upi' ? 'UPI Instant Pay' : 'NEFT / IMPS Bank Transfer'}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          pay.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : pay.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-400 animate-pulse'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </div>

                    <div className="text-neutral-400 mt-0.5 space-x-2 text-[11px]">
                      <span>Destination: {pay.recipientDetailsMasked}</span>
                      <span>•</span>
                      <span>Ref UTR: {pay.utrReference || 'PENDING'}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(pay.requestedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-base font-black text-white">₹{pay.amount}</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold">
                    {pay.status === 'completed' ? 'Settled' : 'In-Transit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Earnings Adjustments with Audit Trail (Rule 13) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-black">Earnings Adjustments & Audit Trail</h3>
            <p className="text-xs text-neutral-400">Verifiable dispute resolutions & operational adjustments</p>
          </div>
          <button
            type="button"
            onClick={loadAdjustments}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingAdjustments && (
          <div className="py-6 text-center text-xs text-neutral-400">Loading audit trail...</div>
        )}

        {!loadingAdjustments && adjustments.length === 0 && (
          <div className="py-6 text-center text-xs text-neutral-500">No adjustments on your account.</div>
        )}

        {!loadingAdjustments && adjustments.length > 0 && (
          <div className="space-y-2.5">
            {adjustments.map((adj) => (
              <div
                key={adj.adjustmentId}
                className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        adj.type === 'credit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {adj.type === 'credit' ? '+ CREDIT' : '- DEBIT'}
                    </span>
                    <span className="font-bold text-white">{adj.reason}</span>
                  </div>

                  <span
                    className={`font-black text-sm ${
                      adj.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {adj.type === 'credit' ? `+₹${adj.amount}` : `-₹${adj.amount}`}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400">{adj.auditNote}</p>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                  <span>Authorized by: {adj.adjustedBy}</span>
                  <span>
                    {new Date(adj.timestamp).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. Request Payout Modal */}
      {payoutModalOpen && (
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
              onClick={() => setPayoutModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Request Instant Withdrawal</h3>
                <p className="text-xs text-neutral-400">Available: ₹{walletBalance}</p>
              </div>
            </div>

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  Withdrawal Amount (₹) <span className="text-neutral-500">(Min ₹100)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-500 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    max={walletBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {/* Quick amount chips */}
                <div className="flex gap-2 mt-2">
                  {[200, 500, walletBalance].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(Math.min(amt, walletBalance).toString())}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold cursor-pointer"
                    >
                      {amt === walletBalance ? 'All (Max)' : `₹${amt}`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1.5">Disbursement Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left cursor-pointer transition-all ${
                      payoutMethod === 'upi'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Instant UPI</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      VPA: {partner?.payout?.upiId || 'partner***@upi'}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold">Settles in 0-2 mins</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`p-3 rounded-xl border flex flex-col items-start gap-1 text-left cursor-pointer transition-all ${
                      payoutMethod === 'bank_transfer'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Bank NEFT</span>
                    </div>
                    <span className="text-[10px] text-neutral-500">
                      Acct: {partner?.payout?.accountNumberMasked || '••••••••4589'}
                    </span>
                    <span className="text-[9px] text-blue-400 font-bold">Standard bank batch</span>
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-[11px] text-neutral-400">
                <span>UTR/RRN reference will be generated upon confirmation and tracked under Payment Records.</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  disabled={submittingPayout}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || walletBalance < 100}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingPayout ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Confirm Payout</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
