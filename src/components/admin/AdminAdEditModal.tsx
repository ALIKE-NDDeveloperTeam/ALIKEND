import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader2, Sparkles, Calendar } from 'lucide-react';
import { adminApi } from '../../pages/adminApi';

interface AdminAdEditModalProps {
  ad: any | null;
  isOpen: boolean;
  isCreating?: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const AdminAdEditModal: React.FC<AdminAdEditModalProps> = ({
  ad,
  isOpen,
  isCreating = false,
  onClose,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tagline: '',
    badge: '',
    imageUrl: '',
    destinationUrl: '',
    buttonText: '',
    position: 'hero_sub_left',
    startDate: '',
    endDate: '',
    order: 1,
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ad && !isCreating) {
      setFormData({
        title: ad.title || '',
        subtitle: ad.subtitle || '',
        tagline: ad.tagline || '',
        badge: ad.badge || '',
        imageUrl: ad.imageUrl || '',
        destinationUrl: ad.destinationUrl || '',
        buttonText: ad.buttonText || 'Discover Now',
        position: ad.position || 'hero_sub_left',
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
        order: Number(ad.order || 1),
        active: ad.active !== false && ad.isActive !== false,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        tagline: 'VIP ATELIER',
        badge: 'EXCLUSIVE',
        imageUrl: '',
        destinationUrl: '',
        buttonText: 'Explore More',
        position: 'hero_sub_left',
        startDate: '',
        endDate: '',
        order: 1,
        active: true,
      });
    }
    setError(null);
  }, [ad, isCreating, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Advertisement title is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        tagline: formData.tagline.trim(),
        badge: formData.badge.trim(),
        imageUrl: formData.imageUrl.trim(),
        destinationUrl: formData.destinationUrl.trim(),
        buttonText: formData.buttonText.trim(),
        position: formData.position,
        startDate: formData.startDate || '',
        endDate: formData.endDate || '',
        order: Number(formData.order),
        active: Boolean(formData.active),
      };

      const targetId = ad?._id || ad?.id;
      if (isCreating || !targetId) {
        await adminApi.createAdvertisement(payload);
      } else {
        await adminApi.updateAdvertisement(targetId, payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save advertisement creative.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {isCreating ? 'Create Advertisement Card' : 'Edit Website Advertisement'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage promotional banners, creatives, and schedule
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
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Ad Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. Jewellery & Watches"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Tagline / Header Badge
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. CERTIFIED LUXURY"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              placeholder="e.g. Certified authentic jewels and precision artisan timepieces."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Creative Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              placeholder="https://images.unsplash.com/photo-..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Destination URL / Action
              </label>
              <input
                type="text"
                value={formData.destinationUrl}
                onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. category_search:jewellery or /shop"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Position Placement
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              >
                <option value="hero_sub_left">Hero Sub Left Box</option>
                <option value="hero_sub_right">Hero Sub Right Box</option>
                <option value="mid_promo">Middle Promotional Banner</option>
                <option value="sidebar">Sidebar Promo</option>
              </select>
            </div>
          </div>

          {/* Schedule Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Active Advertisement (Visible to Public)
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Creative...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Create Advertisement' : 'Save Advertisement'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
