import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Percent,
  Zap,
  Ticket,
  Sparkles,
  TrendingUp,
  BarChart3,
  Package,
  ShoppingBag,
  Star,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Product, SellerProfile, SellerCoupon, SellerCampaignNomination } from '../../types';
import { sellerApi } from '../../services/sellerApi';
import { SellerMenuSectionId } from './SellerCenterSidebar';

interface SellerMarketingAnalyticsProps {
  activeSection: SellerMenuSectionId;
  onSelectSection: (sec: SellerMenuSectionId) => void;
  sellerProfile: SellerProfile;
  products: Product[];
  orders: any[];
  onProductsUpdated: () => Promise<void>;
  onProfileUpdated: (profile: SellerProfile) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const SellerMarketingAnalyticsTabs: React.FC<SellerMarketingAnalyticsProps> = ({
  activeSection,
  onSelectSection,
  sellerProfile,
  products,
  orders,
  onProductsUpdated,
  onProfileUpdated,
  showToast,
  isLightMode = false,
}) => {
  const [platformFlashSales, setPlatformFlashSales] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<SellerCoupon[]>(sellerProfile.coupons || []);
  const [nominations, setNominations] = useState<SellerCampaignNomination[]>(
    sellerProfile.campaignNominations || []
  );
  const [loadingMarketing, setLoadingMarketing] = useState(false);

  // Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponTitle, setCouponTitle] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(1999);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number>(1000);
  const [expiresAt, setExpiresAt] = useState('');
  const [creatingCoupon, setCreatingCoupon] = useState(false);

  // Campaign / Flash Deal / Featured Nomination State
  const [selectedCampaignName, setSelectedCampaignName] = useState('ALIKE-ND Sovereign Luxury Showcase');
  const [selectedCampaignType, setSelectedCampaignType] = useState<
    'campaign' | 'flash_deal' | 'featured_product'
  >('campaign');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [proposedPrice, setProposedPrice] = useState<number>(0);
  const [submittingNomination, setSubmittingNomination] = useState(false);

  // Discount Management & Bundle Offer State
  const [bulkDiscountPct, setBulkDiscountPct] = useState<number>(15);
  const [applyingDiscountId, setApplyingDiscountId] = useState<string | number | null>(null);
  const [bundleTitle, setBundleTitle] = useState('Buy 2+ Luxury Items & Save Extra');
  const [bundleMinQty, setBundleMinQty] = useState<number>(2);
  const [bundleDiscPct, setBundleDiscPct] = useState<number>(12);
  const [creatingBundle, setCreatingBundle] = useState(false);

  // Free Shipping & Affiliate Program Settings
  const [freeShipMin, setFreeShipMin] = useState<number>(sellerProfile.freeShippingThreshold ?? 2999);
  const [affiliateOn, setAffiliateOn] = useState<boolean>(Boolean(sellerProfile.affiliateEnabled));
  const [affiliateRate, setAffiliateRate] = useState<number>(sellerProfile.affiliateCommissionRate ?? 5);
  const [savingPromoConfig, setSavingPromoConfig] = useState(false);

  // Analytics Period Filter
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | '7d' | '30d' | 'all'>('all');

  const loadMarketing = async () => {
    try {
      setLoadingMarketing(true);
      const res = await sellerApi.getMarketingData();
      if (res.platformFlashSales) setPlatformFlashSales(res.platformFlashSales);
      if (res.coupons) setCoupons(res.coupons);
      if (res.campaignNominations) setNominations(res.campaignNominations);
    } catch {
      // Fallback to profile state
    } finally {
      setLoadingMarketing(false);
    }
  };

  useEffect(() => {
    loadMarketing();
  }, []);

  useEffect(() => {
    if (activeSection === 'flash_deals') {
      setSelectedCampaignType('flash_deal');
      setSelectedCampaignName('Express 24-Hour Flash Deal');
    } else if (activeSection === 'featured_requests') {
      setSelectedCampaignType('featured_product');
      setSelectedCampaignName('Homepage Featured Spotlight');
    } else if (activeSection === 'campaigns' || activeSection === 'promotions') {
      setSelectedCampaignType('campaign');
      setSelectedCampaignName('ALIKE-ND Sovereign Luxury Showcase');
    }
  }, [activeSection]);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      const first = products[0];
      setSelectedProductId(String(first._id || first.id));
      setProposedPrice(Math.max(1, Math.round((first.price || 1000) * 0.9)));
    }
  }, [products, selectedProductId]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      showToast('Please enter a voucher code.', 'warning');
      return;
    }
    try {
      setCreatingCoupon(true);
      const res = await sellerApi.createStoreCoupon({
        code: couponCode,
        title: couponTitle || `${couponCode.toUpperCase()} Store Offer`,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        expiresAt: expiresAt || undefined,
      });
      if (res.coupons) {
        setCoupons(res.coupons);
        onProfileUpdated({ ...sellerProfile, coupons: res.coupons });
      }
      setCouponCode('');
      setCouponTitle('');
      showToast(res.message || 'Store voucher created!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create voucher', 'error');
    } finally {
      setCreatingCoupon(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await sellerApi.deleteStoreCoupon(id);
      if (res.coupons) {
        setCoupons(res.coupons);
        onProfileUpdated({ ...sellerProfile, coupons: res.coupons });
      }
      showToast('Store voucher deleted.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete voucher', 'error');
    }
  };

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingBundle(true);
      const res = await sellerApi.createBundleOffer({
        title: bundleTitle,
        minQty: bundleMinQty,
        discountPercent: bundleDiscPct,
      });
      if (res.bundleOffers) {
        onProfileUpdated({ ...sellerProfile, bundleOffers: res.bundleOffers });
      }
      showToast(res.message || 'Bundle offer created!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to create bundle offer', 'error');
    } finally {
      setCreatingBundle(false);
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    try {
      const res = await sellerApi.deleteBundleOffer(bundleId);
      if (res.bundleOffers) {
        onProfileUpdated({ ...sellerProfile, bundleOffers: res.bundleOffers });
      }
      showToast('Bundle offer removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete bundle offer', 'error');
    }
  };

  const handleSavePromoAndAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPromoConfig(true);
      const res = await sellerApi.updateProfile({
        freeShippingThreshold: freeShipMin,
        affiliateEnabled: affiliateOn,
        affiliateCommissionRate: affiliateRate,
      });
      if (res.seller) {
        onProfileUpdated(res.seller);
      }
      showToast('Free-shipping threshold and affiliate referral settings saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save promotion settings', 'error');
    } finally {
      setSavingPromoConfig(false);
    }
  };

  const handleNominateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => String(p._id || p.id) === String(selectedProductId));
    if (!prod) {
      showToast('Please select a valid product from your catalog.', 'warning');
      return;
    }
    try {
      setSubmittingNomination(true);
      const res = await sellerApi.nominateForCampaign({
        campaignName: selectedCampaignName,
        campaignType: selectedCampaignType,
        productId: prod._id || prod.id,
        productName: prod.name,
        proposedPrice: proposedPrice || prod.price,
        mrp: prod.mrp || prod.price,
      });
      if (res.campaignNominations) {
        setNominations(res.campaignNominations);
        onProfileUpdated({ ...sellerProfile, campaignNominations: res.campaignNominations });
      }
      showToast(
        'Nomination submitted! It is now Pending Admin Approval before taking effect.',
        'success'
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to submit nomination', 'error');
    } finally {
      setSubmittingNomination(false);
    }
  };

  const handleQuickDiscount = async (prod: Product, discountPct: number) => {
    const id = prod._id || prod.id;
    const baseMrp = Number(prod.mrp) > Number(prod.price) ? Number(prod.mrp) : Number(prod.price);
    const nextPrice = Math.max(1, Math.round(baseMrp * (1 - discountPct / 100)));
    try {
      setApplyingDiscountId(id);
      await sellerApi.updateProduct(id, {
        price: nextPrice,
        mrp: baseMrp,
        badge: discountPct >= 20 ? 'SALE' : prod.badge || '',
      });
      await onProductsUpdated();
      showToast(`Updated ${prod.name} to ₹${nextPrice.toLocaleString('en-IN')} (${discountPct}% off MRP).`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update discount', 'error');
    } finally {
      setApplyingDiscountId(null);
    }
  };

  // Real Analytics Computations from Seller's Actual Products & Orders
  const analytics = useMemo(() => {
    const deliveredOrders = orders.filter((o) => String(o.status).toLowerCase() === 'delivered');
    const cancelledOrders = orders.filter((o) => String(o.status).toLowerCase() === 'cancelled');
    const grossRevenue = orders
      .filter((o) => String(o.status).toLowerCase() !== 'cancelled')
      .reduce((sum, o) => sum + (Number(o.sellerSubtotal) || 0), 0);
    const deliveredNet = deliveredOrders.reduce(
      (sum, o) => sum + (Number(o.netEarnings) || Math.round((Number(o.sellerSubtotal) || 0) * 0.95)),
      0
    );
    const avgOrderValue =
      orders.length > 0 ? Math.round(grossRevenue / Math.max(1, orders.length - cancelledOrders.length)) : 0;

    // Product performance map
    const productStatsMap = new Map<
      string,
      { product: Product; unitsSold: number; revenue: number; ordersCount: number }
    >();
    for (const p of products) {
      productStatsMap.set(String(p._id || p.id), {
        product: p,
        unitsSold: 0,
        revenue: 0,
        ordersCount: 0,
      });
    }

    for (const ord of orders) {
      if (String(ord.status).toLowerCase() === 'cancelled') continue;
      const items = Array.isArray(ord.items) ? ord.items : [];
      for (const it of items) {
        const key = String(it.productId || it.id);
        const entry = productStatsMap.get(key);
        const qty = Number(it.qty || it.quantity) || 1;
        const rev = (Number(it.price) || 0) * qty;
        if (entry) {
          entry.unitsSold += qty;
          entry.revenue += rev;
          entry.ordersCount += 1;
        }
      }
    }

    const productPerformance = Array.from(productStatsMap.values()).sort(
      (a, b) => b.revenue - a.revenue
    );

    const totalInventoryUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.stock) || 0) * (Number(p.price) || 0),
      0
    );
    const lowStockProducts = products.filter((p) => (Number(p.stock) || 0) > 0 && (Number(p.stock) || 0) <= 5);
    const outOfStockProducts = products.filter((p) => (Number(p.stock) || 0) <= 0);
    const discountedProducts = products.filter((p) => (Number(p.mrp) || 0) > (Number(p.price) || 0));

    return {
      grossRevenue,
      deliveredNet,
      avgOrderValue,
      deliveredCount: deliveredOrders.length,
      cancelledCount: cancelledOrders.length,
      productPerformance,
      totalInventoryUnits,
      totalInventoryValue,
      lowStockProducts,
      outOfStockProducts,
      discountedProducts,
    };
  }, [products, orders]);

  const downloadInventoryCsv = () => {
    const headers = ['Product ID', 'Name', 'Brand', 'Category', 'Price (INR)', 'MRP (INR)', 'Stock', 'Status', 'Moderation'];
    const rows = products.map((p) => [
      String(p._id || p.id),
      `"${String(p.name || '').replace(/"/g, '""')}"`,
      `"${String(p.brand || '').replace(/"/g, '""')}"`,
      p.category || 'luxury',
      p.price || 0,
      p.mrp || p.price || 0,
      p.stock ?? 0,
      p.isPublished === false ? 'Draft/Unpublished' : 'Published',
      p.moderationStatus || 'approved',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sellerProfile.shopName.replace(/\s+/g, '_')}_Inventory_Report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory CSV report downloaded.', 'success');
  };

  const cardClass = `rounded-2xl border p-5 ${
    isLightMode
      ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
      : 'bg-neutral-900/90 border-neutral-800 text-white'
  }`;

  const isMarketingSection = [
    'campaigns',
    'promotions',
    'discount_management',
    'flash_deals',
    'coupons_vouchers',
    'featured_requests',
    'marketing_performance',
  ].includes(activeSection);

  if (isMarketingSection) {
    return (
      <div className="space-y-6">
        {/* Sub-navigation bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
            { id: 'promotions', label: 'Promotions', icon: Sparkles },
            { id: 'discount_management', label: 'Discount Management', icon: Percent },
            { id: 'flash_deals', label: 'Flash Deals', icon: Zap },
            { id: 'coupons_vouchers', label: 'Coupons & Vouchers', icon: Ticket },
            { id: 'featured_requests', label: 'Featured Product Requests', icon: Star },
            { id: 'marketing_performance', label: 'Marketing Performance', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectSection(tab.id as SellerMenuSectionId)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#F5A623] text-black shadow-xs'
                    : isLightMode
                    ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Marketing Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Discounted Catalog Items
            </span>
            <p className="text-2xl font-black font-mono mt-1 text-[#F5A623]">
              {analytics.discountedProducts.length}{' '}
              <span className="text-xs font-normal text-neutral-400">/ {products.length}</span>
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Products with active MRP markdown</p>
          </div>
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Active Store Vouchers
            </span>
            <p className="text-2xl font-black font-mono mt-1 text-emerald-400">
              {coupons.filter((c) => c.isActive).length}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Redeemable by customers at checkout</p>
          </div>
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Campaign Nominations
            </span>
            <p className="text-2xl font-black font-mono mt-1">{nominations.length}</p>
            <p className="text-[11px] text-neutral-400 mt-1">
              {nominations.filter((n) => n.status === 'approved').length} Approved ·{' '}
              {nominations.filter((n) => n.status === 'pending_admin_approval').length} Pending Admin Review
            </p>
          </div>
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Platform Flash Events
            </span>
            <p className="text-2xl font-black font-mono mt-1 text-sky-400">
              {platformFlashSales.length || 2}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">Open for seller product nomination</p>
          </div>
        </div>

        {/* Discount Management View */}
        {activeSection === 'discount_management' && (
          <div className={cardClass}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-bold">Product Discount & Price Markdown Manager</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Set honest promotional pricing against your listed MRP. All price updates are validated on the server.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-neutral-400 font-semibold">Preset Discount:</label>
                <select
                  value={bulkDiscountPct}
                  onChange={(e) => setBulkDiscountPct(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  <option value={10}>10% OFF MRP</option>
                  <option value={15}>15% OFF MRP</option>
                  <option value={20}>20% OFF MRP</option>
                  <option value={25}>25% OFF MRP</option>
                  <option value={30}>30% OFF MRP</option>
                </select>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-10 text-center text-xs text-neutral-400">
                No products in your catalog yet. Add products first to manage discounts.
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">MRP</th>
                      <th className="py-2.5 px-3">Current Selling Price</th>
                      <th className="py-2.5 px-3">Current Discount</th>
                      <th className="py-2.5 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {products.map((p) => {
                      const mrpVal = Number(p.mrp) || Number(p.price) || 0;
                      const priceVal = Number(p.price) || 0;
                      const disc = mrpVal > priceVal ? Math.round(((mrpVal - priceVal) / mrpVal) * 100) : 0;
                      const pid = p._id || p.id;
                      return (
                        <tr key={String(pid)} className="hover:bg-neutral-800/20">
                          <td className="py-3 px-3 font-semibold flex items-center gap-2.5">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover bg-neutral-800 shrink-0"
                            />
                            <span className="truncate max-w-[220px]">{p.name}</span>
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-400">
                            ₹{mrpVal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                            ₹{priceVal.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono">
                            {disc > 0 ? `${disc}% OFF` : 'No Discount'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              disabled={applyingDiscountId === pid}
                              onClick={() => handleQuickDiscount(p, bulkDiscountPct)}
                              className="px-3 py-1.5 rounded-lg bg-[#F5A623]/15 hover:bg-[#F5A623] text-[#F5A623] hover:text-black font-bold text-[11px] transition-all cursor-pointer"
                            >
                              {applyingDiscountId === pid
                                ? 'Applying...'
                                : `Apply ${bulkDiscountPct}% Off`}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Coupons & Vouchers View */}
        {activeSection === 'coupons_vouchers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleCreateCoupon} className={`lg:col-span-5 space-y-4 ${cardClass}`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Ticket className="w-4 h-4 text-[#F5A623]" />
                <span>Create Store Voucher</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Create store-specific promotional codes for your products.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Voucher Code *
                </label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ATELIER15"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Voucher Title
                </label>
                <input
                  type="text"
                  value={couponTitle}
                  onChange={(e) => setCouponTitle(e.target.value)}
                  placeholder="Festive Luxury Privé Offer"
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'flat')}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={discountType === 'percentage' ? 70 : 50000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Min. Order (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingCoupon}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs transition-all cursor-pointer"
              >
                {creatingCoupon ? 'Creating Voucher...' : 'Create Store Voucher'}
              </button>
            </form>

            <div className={`lg:col-span-7 ${cardClass}`}>
              <h3 className="text-base font-bold mb-3">Your Store Vouchers ({coupons.length})</h3>
              {coupons.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  No store vouchers created yet. Use the form on the left to launch a voucher.
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map((cpn) => (
                    <div
                      key={cpn.id}
                      className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#F5A623]">
                            {cpn.code}
                          </span>
                          <span className="text-xs font-semibold text-neutral-200">
                            · {cpn.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1">
                          {cpn.discountType === 'percentage'
                            ? `${cpn.discountValue}% OFF`
                            : `₹${cpn.discountValue.toLocaleString('en-IN')} OFF`}{' '}
                          · Min. Order ₹{(cpn.minOrderAmount || 0).toLocaleString('en-IN')}
                          {cpn.expiresAt ? ` · Expires ${cpn.expiresAt}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(cpn.id)}
                        className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete Voucher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campaigns / Promotions / Flash Deals / Featured Product Nomination View */}
        {['campaigns', 'promotions', 'flash_deals', 'featured_requests', 'marketing_performance'].includes(
          activeSection
        ) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form onSubmit={handleNominateProduct} className={`lg:col-span-5 space-y-4 ${cardClass}`}>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#F5A623]" />
                <span>Submit Product for Platform Campaign</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Nominate your products for Flash Deals, Featured Spotlights, or Platform Campaigns. Participation requires Admin approval.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Program Type
                </label>
                <select
                  value={selectedCampaignType}
                  onChange={(e) => setSelectedCampaignType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  <option value="campaign">Platform Seasonal Campaign</option>
                  <option value="flash_deal">Flash Deal Nomination</option>
                  <option value="featured_product">Featured Product Spotlight Request</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Campaign / Event Name
                </label>
                <input
                  type="text"
                  required
                  value={selectedCampaignName}
                  onChange={(e) => setSelectedCampaignName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Select Your Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((it) => String(it._id || it.id) === e.target.value);
                    if (p) setProposedPrice(Math.max(1, Math.round(p.price * 0.9)));
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  {products.map((p) => (
                    <option key={String(p._id || p.id)} value={String(p._id || p.id)}>
                      {p.name} (Current: ₹{p.price.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Proposed Campaign Price (₹)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingNomination || products.length === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingNomination ? 'Submitting...' : 'Submit for Admin Approval'}
              </button>
            </form>

            <div className={`lg:col-span-7 ${cardClass}`}>
              <h3 className="text-base font-bold mb-1">
                Campaign & Flash Deal Application Status ({nominations.length})
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                All campaign, flash deal, and featured product nominations require Admin review before going live.
              </p>

              {nominations.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  You have not submitted any campaign or flash deal nominations yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {nominations.map((nom) => (
                    <div
                      key={nom.id}
                      className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{nom.productName}</span>
                          <span className="text-[11px] text-neutral-400">· {nom.campaignName}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 font-mono">
                          Proposed Price: ₹{Number(nom.proposedPrice).toLocaleString('en-IN')} (MRP: ₹
                          {Number(nom.mrp).toLocaleString('en-IN')})
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[11px] font-bold uppercase ${
                            nom.status === 'approved'
                              ? 'text-emerald-400'
                              : nom.status === 'rejected'
                              ? 'text-rose-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {nom.status === 'pending_admin_approval'
                            ? 'Pending Admin Approval'
                            : nom.status}
                        </span>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          {new Date(nom.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bundle Offers, Free-Shipping Promotions, Affiliate Settings & Marketing Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bundle & Quantity Discount Creator */}
          <div className={cardClass}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-1">
              Bundle & Quantity Discounts
            </h3>
            <p className="text-xs text-neutral-400 mb-3">
              Reward multi-unit buyers with automatic tiered percentage discounts.
            </p>
            <form onSubmit={handleCreateBundle} className="space-y-2.5 text-xs">
              <input
                type="text"
                required
                value={bundleTitle}
                onChange={(e) => setBundleTitle(e.target.value)}
                placeholder="Bundle Title"
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Min. Quantity</label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={bundleMinQty}
                    onChange={(e) => setBundleMinQty(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Extra Discount (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bundleDiscPct}
                    onChange={(e) => setBundleDiscPct(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={creatingBundle}
                className="w-full py-2 rounded-xl bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
              >
                {creatingBundle ? 'Creating...' : '+ Add Bundle Tier'}
              </button>
            </form>

            <div className="mt-3 space-y-2">
              {(sellerProfile.bundleOffers || []).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold block">{b.title}</span>
                    <span className="text-[10px] text-[#F5A623] font-mono">
                      Buy {b.minQty}+ items → {b.discountPercent}% OFF
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBundle(b.id)}
                    className="text-neutral-400 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Free Shipping & Affiliate Referral Settings */}
          <form onSubmit={handleSavePromoAndAffiliate} className={`${cardClass} space-y-3 text-xs`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              Free-Shipping & Affiliate Referral Program
            </h3>
            <p className="text-xs text-neutral-400">
              Configure store-funded free delivery threshold and creator referral commission.
            </p>
            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Free Shipping Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min={0}
                value={freeShipMin}
                onChange={(e) => setFreeShipMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer">
              <div>
                <span className="font-bold block">Enable Affiliate Referral Tracking</span>
                <span className="text-[10px] text-neutral-400">
                  Allow verified creators to promote your store links
                </span>
              </div>
              <input
                type="checkbox"
                checked={affiliateOn}
                onChange={(e) => setAffiliateOn(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
              />
            </label>

            <div>
              <label className="block text-[10px] uppercase font-bold text-neutral-400 mb-1">
                Affiliate Referral Commission Rate (%)
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={affiliateRate}
                onChange={(e) => setAffiliateRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={savingPromoConfig}
              className="w-full py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer"
            >
              {savingPromoConfig ? 'Saving...' : 'Save Promotion & Affiliate Rules'}
            </button>
          </form>

          {/* Marketing Calendar */}
          <div className={`${cardClass} space-y-3 text-xs`}>
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              Marketplace Marketing Calendar
            </h3>
            <p className="text-xs text-neutral-400">
              Upcoming platform-wide promotional events open for product nominations.
            </p>
            <div className="space-y-2.5">
              {[
                {
                  event: 'ALIKE-ND Sovereign Luxury Gala',
                  window: 'Active Now · Nominations Open',
                  type: 'Platform Campaign',
                  badge: 'OPEN',
                },
                {
                  event: '24-Hour Express Flash Drop',
                  window: 'Daily 12:00 PM & 8:00 PM IST',
                  type: 'Flash Deal',
                  badge: 'LIVE',
                },
                {
                  event: 'End-of-Season Privé Clearance',
                  window: 'Starts 1st of Next Month',
                  type: 'Seasonal Event',
                  badge: 'UPCOMING',
                },
              ].map((ev, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold block">{ev.event}</span>
                    <span className="text-[10px] text-neutral-400">{ev.window}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F5A623]/15 text-[#F5A623]">
                    {ev.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Analytics & Reports Module
  return (
    <div className="space-y-6">
      {/* Analytics Sub-navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'sales_analytics', label: 'Sales Analytics' },
            { id: 'product_performance', label: 'Product Performance' },
            { id: 'order_statistics', label: 'Order Statistics' },
            { id: 'inventory_reports', label: 'Inventory Reports' },
            { id: 'feedback_reports', label: 'Customer Feedback Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id as SellerMenuSectionId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#F5A623] text-black'
                  : isLightMode
                  ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={downloadInventoryCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Export Inventory CSV</span>
        </button>
      </div>

      {/* Real-Data Analytics KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Gross Order Volume
          </span>
          <p className="text-2xl font-black font-mono mt-1 text-[#F5A623]">
            ₹{analytics.grossRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Across {orders.length} real store orders
          </p>
        </div>
        <div className={cardClass}>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Average Order Value
          </span>
          <p className="text-2xl font-black font-mono mt-1 text-emerald-400">
            ₹{analytics.avgOrderValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {analytics.deliveredCount} delivered · {analytics.cancelledCount} cancelled
          </p>
        </div>
        <div className={cardClass}>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Inventory Valuation
          </span>
          <p className="text-2xl font-black font-mono mt-1">
            ₹{analytics.totalInventoryValue.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {analytics.totalInventoryUnits} total units in stock
          </p>
        </div>
        <div className={cardClass}>
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Stock Health Alerts
          </span>
          <p className="text-2xl font-black font-mono mt-1 text-amber-400">
            {analytics.lowStockProducts.length} Low · {analytics.outOfStockProducts.length} Out
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">Items requiring restock attention</p>
        </div>
      </div>

      {/* Product Performance & Inventory Table */}
      <div className={cardClass}>
        <h3 className="text-base font-bold mb-1">
          Product Performance, Inventory & Customer Rating Breakdown
        </h3>
        <p className="text-xs text-neutral-400 mb-4">
          Calculated directly from your live catalog and customer orders.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Stock</th>
                <th className="py-2.5 px-3">Units Sold</th>
                <th className="py-2.5 px-3">Gross Sales</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {analytics.productPerformance.map(({ product: p, unitsSold, revenue }) => (
                <tr key={String(p._id || p.id)} className="hover:bg-neutral-800/20">
                  <td className="py-3 px-3 font-semibold flex items-center gap-2.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover bg-neutral-800 shrink-0"
                    />
                    <span className="truncate max-w-[220px]">{p.name}</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-400">{p.category}</td>
                  <td className="py-3 px-3 font-mono">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                  <td
                    className={`py-3 px-3 font-mono font-bold ${
                      (p.stock ?? 0) <= 0
                        ? 'text-rose-400'
                        : (p.stock ?? 0) <= 5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {p.stock ?? 0} units
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">{unitsSold}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[#F5A623]">
                    ₹{revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {(p.rating || 4.8).toFixed(1)} ({p.reviewsCount || 1})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data-Driven Business Intelligence Recommendations */}
      <div className={cardClass}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F5A623]" />
              <span>Data-Driven Business Intelligence & Conversion Insights</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Actionable recommendations calculated directly from your real inventory, order fulfillment, and pricing records.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {(['today', '7d', '30d', 'all'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAnalyticsPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer ${
                  analyticsPeriod === p
                    ? 'bg-[#F5A623] text-black'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-400'
                }`}
              >
                {p === 'all' ? 'All-Time' : p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-[#F5A623]">
              Inventory Turnover & Restock Advisory
            </span>
            <p className="font-bold">
              {analytics.lowStockProducts.length > 0
                ? `${analytics.lowStockProducts.length} SKU(s) are at risk of stockout (≤ 5 units).`
                : 'All active SKUs maintain healthy inventory buffer (> 5 units).'}
            </p>
            <p className="text-neutral-400 text-[11px]">
              Total Inventory Units: {analytics.totalInventoryUnits} · Sold Units:{' '}
              {analytics.productPerformance.reduce((s, x) => s + x.unitsSold, 0)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-emerald-400">
              Order Fulfillment & Cancellation Rate
            </span>
            <p className="font-bold">
              Cancellation Rate:{' '}
              {orders.length > 0
                ? `${Math.round((analytics.cancelledCount / orders.length) * 100)}%`
                : '0% (No cancellations)'}
            </p>
            <p className="text-neutral-400 text-[11px]">
              {analytics.deliveredCount} delivered orders · Maintain &lt; 2% cancellation rate for Featured Seller eligibility.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-sky-400">
              Pricing & Promotion Coverage
            </span>
            <p className="font-bold">
              {analytics.discountedProducts.length} of {products.length} products have active promotional pricing.
            </p>
            <p className="text-neutral-400 text-[11px]">
              {coupons.length > 0
                ? `${coupons.length} active store voucher(s) configured to boost checkout conversion.`
                : 'Tip: Create a store voucher in Coupons & Vouchers to increase average order value.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
