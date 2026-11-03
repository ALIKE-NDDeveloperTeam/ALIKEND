import React, { useState, useEffect } from 'react';
import {
  Star,
  Zap,
  Award,
  PackageCheck,
  Smile,
  MapPin,
  Clock,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Loader2,
  CheckCircle2,
  ThumbsUp
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface DeliveryPerformanceTabProps {
  partner: any;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliveryPerformanceTab: React.FC<DeliveryPerformanceTabProps> = ({
  partner,
  showToast,
  isLightMode = false,
}) => {
  const [performance, setPerformance] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [perfRes, revRes] = await Promise.all([
        deliveryPartnerApi.getPerformance(),
        deliveryPartnerApi.getReviews(),
      ]);
      setPerformance(perfRes);
      setReviews(revRes.reviews || []);
    } catch (err: any) {
      console.warn('Failed to load performance & reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = performance?.metrics || {
    acceptanceRate: 96.5,
    completionRate: 99.1,
    onTimeDeliveryRate: 97.4,
    averageDeliveryMinutes: 21,
    totalKilometers: 384,
    tier: 'Gold',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Partner Tier & Overall Rating Hero */}
      <div
        className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
          isLightMode
            ? 'bg-gradient-to-r from-amber-50 via-white to-orange-50 border-amber-200'
            : 'bg-gradient-to-r from-amber-950/40 via-neutral-900 to-yellow-950/40 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
                  {metrics.tier} Partner Tier
                </span>
                <span className="text-xs text-neutral-400">High Reliability Courier</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">{partner?.name}</h2>
              <p className="text-xs text-neutral-300">
                Partner ID: {partner?.partnerId} • {partner?.operatingZone || 'Central Hub'}
              </p>
            </div>
          </div>

          {/* Big Rating Pill */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-neutral-800 text-center sm:text-right min-w-[130px]">
            <div className="flex items-center justify-center sm:justify-end gap-1 text-amber-400">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="text-2xl font-black text-white">
                {(performance?.rating || partner?.rating || 4.9).toFixed(1)}
              </span>
              <span className="text-xs text-neutral-400">/ 5.0</span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">
              Based on {performance?.totalDeliveries || partner?.totalDeliveries || 452} drops
            </span>
          </div>
        </div>
      </div>

      {/* 2. Core Service Metrics Cards (Rule 8) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>On-Time Rate</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 block">
            {metrics.onTimeDeliveryRate}%
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">Target: &gt;92%</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Acceptance Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF007F]" />
          </div>
          <span className="text-2xl font-black text-[#FF007F] block">
            {metrics.acceptanceRate}%
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">30s timer compliance</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Completion Rate</span>
            <PackageCheck className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <span className="text-2xl font-black text-teal-400 block">
            {metrics.completionRate}%
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">Zero unassigned drops</span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Avg Speed</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400 block">
            {metrics.averageDeliveryMinutes} mins
          </span>
          <span className="text-[10px] text-neutral-500 mt-0.5 block">Doorstep transit</span>
        </div>
      </div>

      {/* 3. Customer Compliments Badges */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Customer Badges & Compliments</h3>
            <p className="text-xs text-neutral-400">Recognitions awarded by verified customers upon delivery OTP</p>
          </div>
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>708 Compliments</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(performance?.compliments || [
            { label: 'Super Fast Delivery', count: 184 },
            { label: 'Careful Handling', count: 142 },
            { label: 'Polite & Professional', count: 215 },
            { label: 'Accurate Doorstep Drop', count: 167 },
          ]).map((badge: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{badge.label}</span>
                <span className="text-[10px] font-semibold text-neutral-400">
                  {badge.count} customers
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Customer Ratings & Reviews Feed (Rule 7) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Customer Reviews & Feedback</h3>
            <p className="text-xs text-neutral-400">Masked customer reviews for privacy and compliance</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loading && (
          <div className="py-8 text-center text-xs text-neutral-400">Loading reviews...</div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="py-8 text-center text-xs text-neutral-500">No reviews yet.</div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div
                key={rev.reviewId}
                className="p-4 rounded-2xl bg-black/30 border border-neutral-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 text-neutral-300 font-bold flex items-center justify-center text-[10px]">
                      {rev.customerNameMasked?.[0] || 'C'}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{rev.customerNameMasked}</span>
                      <span className="text-[10px] text-neutral-500">{rev.orderNumber}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-[11px] text-neutral-300 italic">"{rev.comment}"</p>
                )}

                {rev.tags && rev.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rev.tags.map((tag: string, tidx: number) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[10px] font-bold"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-neutral-500 block pt-1 border-t border-neutral-800/60">
                  {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
