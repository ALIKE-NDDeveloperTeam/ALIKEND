import React, { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Flame,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  PackageOpen,
  ArrowUp,
  ArrowDown,
  Tag,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../pages/adminTypes';
import { adminApi } from '../pages/adminApi';
import FlashCountdown from './FlashCountdown';

export interface AdminFlashSaleManagerProps {
  products: Product[];
  onProductsRefresh?: () => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  isSuperAdmin?: boolean;
}

export const AdminFlashSaleManager: React.FC<AdminFlashSaleManagerProps> = ({
  products,
  onProductsRefresh,
  onFlashSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Flash Sale Settings State
  const [title, setTitle] = useState('FLASH PREMIUM HOURS');
  const [subtitle, setSubtitle] = useState('Uncompromised pricing on luxury gear');
  const [bannerText, setBannerText] = useState("⚡ Deals Refresh Every 24 Hours — Don't Miss Out!");
  const [targetEndTime, setTargetEndTime] = useState<string>(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  const [activeFlashProducts, setActiveFlashProducts] = useState<any[]>([]);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customFlashPrice, setCustomFlashPrice] = useState<number | string>('');
  const [customDiscount, setCustomDiscount] = useState<number | string>(45);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  useEffect(() => {
    if (isAddModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isAddModalOpen]);

  // Load existing configuration from API
  const loadFlashSaleData = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFlashSale();
      if (res && res.success && res.config) {
        setTitle(res.config.title || 'FLASH PREMIUM HOURS');
        setSubtitle(res.config.subtitle || 'Uncompromised pricing on luxury gear');
        setBannerText(res.config.bannerText || "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!");
        if (res.config.targetEndTime) {
          const d = new Date(res.config.targetEndTime);
          if (!isNaN(d.getTime())) {
            setTargetEndTime(
              new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
            );
          }
        }
        setActiveFlashProducts(res.products || []);
      }
    } catch (err: any) {
      console.warn('Could not load flash sale data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlashSaleData();
  }, []);

  // Quick preset end-time buttons
  const setQuickPreset = (hours: number) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    setTargetEndTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const isoTarget = new Date(targetEndTime).toISOString();
      await adminApi.updateFlashSaleConfig({
        title: title.trim(),
        subtitle: subtitle.trim(),
        bannerText: bannerText.trim(),
        targetEndTime: isoTarget,
      });
      onFlashSuccess('Flash Sale configuration updated successfully!');
      loadFlashSaleData();
    } catch (err: any) {
      onError(err.message || 'Failed to update flash sale settings');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      onError('Please select a product from the catalog');
      return;
    }

    setSubmittingProduct(true);
    try {
      const matched = products.find(
        (p) => String(p._id) === selectedProductId || String(p.id) === selectedProductId
      );
      const flashPriceNum = customFlashPrice ? Number(customFlashPrice) : matched ? Math.round(matched.price * 0.8) : undefined;
      const discountNum = customDiscount ? Number(customDiscount) : 40;

      await adminApi.addFlashSaleProduct({
        productId: selectedProductId,
        flashPrice: flashPriceNum,
        discountPercent: discountNum,
        isFeatured,
        order: activeFlashProducts.length + 1,
      });

      onFlashSuccess(`Product added to Flash Sale successfully!`);
      setIsAddModalOpen(false);
      setSelectedProductId('');
      setCustomFlashPrice('');
      setCustomDiscount(45);
      setIsFeatured(false);
      loadFlashSaleData();
      if (onProductsRefresh) onProductsRefresh();
    } catch (err: any) {
      onError(err.message || 'Failed to add product to flash sale');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleRemoveProduct = async (id: string | number) => {
    try {
      await adminApi.removeFlashSaleProduct(id);
      onFlashSuccess('Product removed from Flash Sale');
      setActiveFlashProducts((prev) => prev.filter((p) => String(p._id) !== String(id) && String(p.id) !== String(id)));
      if (onProductsRefresh) onProductsRefresh();
    } catch (err: any) {
      onError(err.message || 'Failed to remove product from flash sale');
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-[#F5A623]/10 to-transparent p-5 sm:p-6 rounded-2xl border border-[#F5A623]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F5A623] text-neutral-950 rounded-xl shadow-md">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-wide">
              Flash Premium Hours Manager
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Configure real-time countdown deadlines, promotional text badges, and curated sale inventory.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadFlashSaleData}
          disabled={loading}
          className="px-3.5 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Flash Sale Settings & Live Countdown Preview Card */}
      <form onSubmit={handleSaveConfig} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F5A623]" />
              <span>Event Timing & Promotional Headlines</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Changes reflect immediately on the storefront homepage and product card countdown badges.
            </p>
          </div>

          <button
            type="submit"
            disabled={savingConfig}
            className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingConfig ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Banner Title */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Banner Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. FLASH PREMIUM HOURS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              required
              placeholder="e.g. Uncompromised pricing on luxury gear"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Top Notice Badge Text */}
          <div>
            <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
              Notice Badge Text
            </label>
            <input
              type="text"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              placeholder="e.g. ⚡ Deals Refresh Every 24 Hours — Don't Miss Out!"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-[#F5A623]"
            />
          </div>

          {/* Countdown Target End Date & Time */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Target Countdown Deadline (Local)
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setQuickPreset(12)}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#F5A623] cursor-pointer"
                >
                  +12h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPreset(24)}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#F5A623] cursor-pointer"
                >
                  +24h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickPreset(48)}
                  className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#F5A623] cursor-pointer"
                >
                  +48h
                </button>
              </div>
            </div>
            <input
              type="datetime-local"
              value={targetEndTime}
              onChange={(e) => setTargetEndTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono font-bold outline-none focus:border-[#F5A623]"
            />
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-[#F5A623] font-bold block">
              Storefront Live Preview
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-black text-neutral-900 dark:text-white uppercase">{title}</span>
              {bannerText && (
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/30">
                  {bannerText}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="shrink-0">
            <FlashCountdown targetEndTime={targetEndTime} />
          </div>
        </div>
      </form>

      {/* 3. Product Manager Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#F5A623]" />
              <span>Curated Flash Sale Inventory ({activeFlashProducts.length})</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Assign customized deal pricing and discount badges to flagship items.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product to Flash Sale</span>
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          {activeFlashProducts.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-extrabold">
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Catalog Price</th>
                  <th className="py-3 px-3">Flash Price</th>
                  <th className="py-3 px-3">Discount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {activeFlashProducts.map((p, idx) => (
                  <tr key={`${p._id || p.id}-${idx}`} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                    {/* Product & Image */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <PackageOpen className="w-5 h-5 text-neutral-400 opacity-60" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-mono font-bold text-amber-600 dark:text-[#F5A623]">
                            {p.brand}
                          </span>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-xs">
                            {p.name}
                          </h4>
                        </div>
                      </div>
                    </td>

                    {/* Catalog Price */}
                    <td className="py-3 px-3 font-mono font-medium text-neutral-500">
                      ₹{(p.originalPrice || p.price)?.toLocaleString('en-IN')}
                    </td>

                    {/* Flash Price */}
                    <td className="py-3 px-3 font-mono font-black text-neutral-900 dark:text-white">
                      ₹{(p.price)?.toLocaleString('en-IN')}
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-500/20">
                        {p.discountPercent || 40}% OFF
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-[#F5A623]">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Live Deal</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(p._id || p.id)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                        title="Remove from Flash Sale"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-neutral-500">
              <PackageOpen className="w-10 h-10 mx-auto opacity-40 mb-2 text-[#F5A623]" />
              <p className="text-xs font-medium">No items assigned to Flash Sale yet.</p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-[#F5A623] text-neutral-950 font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Product</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Add Product Modal */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#F5A623] fill-current" />
                <span>Add Product to Flash Sale</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Select Product from Catalog
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedProductId(id);
                    const found = products.find((p) => String(p._id) === id || String(p.id) === id);
                    if (found) {
                      setCustomFlashPrice(Math.round(found.price * 0.75));
                    }
                  }}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-bold outline-none focus:border-[#F5A623]"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p._id || p.id} value={String(p._id || p.id)}>
                      {p.name} ({p.brand}) — ₹{p.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Flash Price & Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Flash Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    value={customFlashPrice}
                    onChange={(e) => setCustomFlashPrice(e.target.value)}
                    placeholder="e.g. 14999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono font-bold outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Discount Badge (%)
                  </label>
                  <input
                    type="number"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    placeholder="e.g. 50"
                    min="1"
                    max="95"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white text-xs font-mono font-bold outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-neutral-300 text-[#F5A623] focus:ring-[#F5A623]"
                />
                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Feature in Hero Spotlight
                </span>
              </label>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {submittingProduct ? 'Adding...' : 'Add to Flash Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminFlashSaleManager;
