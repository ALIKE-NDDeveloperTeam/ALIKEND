import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Zap, Clock, Loader2, Search, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { adminApi } from '../../pages/adminApi';

interface AdminFlashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onSaveSuccess: () => void;
}

export const AdminFlashSaleModal: React.FC<AdminFlashSaleModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onSaveSuccess,
}) => {
  const [config, setConfig] = useState({
    title: 'FLASH PREMIUM HOURS',
    subtitle: 'Uncompromised pricing on luxury gear',
    bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
    targetEndTime: '',
  });

  const [flashProducts, setFlashProducts] = useState<any[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [customFlashPrice, setCustomFlashPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      adminApi
        .getFlashSale()
        .then((res: any) => {
          if (res && res.config) {
            const rawEnd = res.config.targetEndTime ? new Date(res.config.targetEndTime) : null;
            const formattedDate = rawEnd && !isNaN(rawEnd.getTime())
              ? new Date(rawEnd.getTime() - rawEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
              : '';

            setConfig({
              title: res.config.title || 'FLASH PREMIUM HOURS',
              subtitle: res.config.subtitle || 'Uncompromised pricing on luxury gear',
              bannerText: res.config.bannerText || "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
              targetEndTime: formattedDate,
            });
          }

          if (res && Array.isArray(res.products)) {
            setFlashProducts(res.products);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch flash sale config');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfigSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await adminApi.updateFlashSaleConfig({
        title: config.title.trim(),
        subtitle: config.subtitle.trim(),
        bannerText: config.bannerText.trim(),
        targetEndTime: config.targetEndTime ? new Date(config.targetEndTime).toISOString() : undefined,
      });

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update flash sale settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProductToFlash = async () => {
    if (!selectedProductToAdd) return;
    setSaving(true);
    setError(null);

    try {
      const targetId = selectedProductToAdd._id || selectedProductToAdd.id;
      const originalPrice = selectedProductToAdd.price;
      const priceToSet = typeof customFlashPrice === 'number' && customFlashPrice > 0
        ? customFlashPrice
        : Math.round(originalPrice * 0.7); // 30% discount default

      const calculatedDiscount = selectedProductToAdd.mrp && selectedProductToAdd.mrp > priceToSet
        ? Math.round(((selectedProductToAdd.mrp - priceToSet) / selectedProductToAdd.mrp) * 100)
        : Math.round(((originalPrice - priceToSet) / originalPrice) * 100);

      await adminApi.addFlashSaleProduct({
        productId: targetId,
        flashPrice: priceToSet,
        discountPercent: calculatedDiscount > 0 ? calculatedDiscount : 30,
        isFeatured: true,
        order: flashProducts.length + 1,
      });

      // Refetch flash deals
      const refreshed: any = await adminApi.getFlashSale();
      if (refreshed && Array.isArray(refreshed.products)) {
        setFlashProducts(refreshed.products);
      }
      setSelectedProductToAdd(null);
      setCustomFlashPrice('');
      setSearchProductQuery('');
      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add product to flash sale');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFlashProduct = async (prodId: string | number) => {
    setSaving(true);
    setError(null);

    try {
      await adminApi.removeFlashSaleProduct(prodId);
      setFlashProducts((prev) => prev.filter((p) => String(p._id) !== String(prodId) && String(p.id) !== String(prodId)));
      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to remove product from flash sale');
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalog = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
      String(p.id).includes(searchProductQuery)
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-amber-500/10 dark:bg-amber-500/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-black shadow-md">
              <Zap className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                Flash Deals & Countdown Manager
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure countdown timers, discounts, and active deals live
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl shrink-0">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            <span className="text-xs font-semibold">Loading Flash Deals...</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 1. Campaign Settings Form */}
            <form onSubmit={handleConfigSave} className="space-y-4 bg-neutral-50 dark:bg-neutral-800/40 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-750">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Flash Sale Campaign Schedule & Banner
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Section Headline
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-bold"
                    placeholder="FLASH PREMIUM HOURS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Countdown Target End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={config.targetEndTime}
                    onChange={(e) => setConfig({ ...config, targetEndTime: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                    placeholder="Uncompromised pricing on luxury gear"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Pill Badge Alert
                  </label>
                  <input
                    type="text"
                    value={config.bannerText}
                    onChange={(e) => setConfig({ ...config, bannerText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                    placeholder="⚡ Deals Refresh Every 24 Hours"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-neutral-900 hover:bg-black text-white dark:bg-neutral-100 dark:text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Schedule & Texts</span>
                </button>
              </div>
            </form>

            {/* 2. Add Products to Flash Sale Section */}
            <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/80 dark:border-neutral-750">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-amber-500" /> Add Product to Flash Sale
              </h4>

              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchProductQuery}
                  onChange={(e) => setSearchProductQuery(e.target.value)}
                  placeholder="Search catalog by name or brand to add..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              {searchProductQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1 bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs">
                  {filteredCatalog.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductToAdd(p);
                        setCustomFlashPrice(Math.round(p.price * 0.7));
                      }}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        selectedProductToAdd?.id === p.id
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold'
                          : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={p.image} alt={p.name} className="w-6 h-6 rounded object-cover shrink-0" />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className="font-mono font-bold shrink-0 ml-2">₹{p.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <p className="p-2 text-neutral-400 text-center">No matching products found.</p>
                  )}
                </div>
              )}

              {selectedProductToAdd && (
                <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg">
                  <div className="min-w-0">
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">
                      Selected Item
                    </span>
                    <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">
                      {selectedProductToAdd.name} (Original: ₹{selectedProductToAdd.price.toLocaleString('en-IN')})
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Flash Price (₹)</span>
                      <input
                        type="number"
                        min="1"
                        value={customFlashPrice}
                        onChange={(e) => setCustomFlashPrice(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-xs bg-white dark:bg-neutral-900 border border-amber-400 rounded text-neutral-900 dark:text-white font-mono font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddProductToFlash}
                      disabled={saving}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Add Deal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Current Active Flash Products List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Active Flash Sale Products ({flashProducts.length})
                </h4>
              </div>

              <div className="space-y-2">
                {flashProducts.map((fp) => (
                  <div
                    key={fp.id || fp._id}
                    className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={fp.image}
                        alt={fp.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                      />
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-neutral-900 dark:text-white truncate">{fp.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-black text-amber-500">
                            ₹{Number(fp.price).toLocaleString('en-IN')}
                          </span>
                          {fp.originalPrice && (
                            <span className="text-[10px] text-neutral-400 line-through">
                              ₹{Number(fp.originalPrice).toLocaleString('en-IN')}
                            </span>
                          )}
                          {fp.discountPercent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                              {fp.discountPercent}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFlashProduct(fp._id || fp.id)}
                      disabled={saving}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove from Flash Deals"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {flashProducts.length === 0 && (
                  <div className="p-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                    No products currently in Flash Sale. Add products using the search box above.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
