import React, { useState, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { adminApi } from '../../pages/adminApi';

interface AdminBannerEditModalProps {
  banner: any | null;
  isOpen: boolean;
  isCreating?: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const AdminBannerEditModal: React.FC<AdminBannerEditModalProps> = ({
  banner,
  isOpen,
  isCreating = false,
  onClose,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    linkUrl: '',
    imageUrl: '',
    order: 1,
    active: true,
    isCenterFeatured: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (banner && !isCreating) {
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        description: banner.description || '',
        buttonText: banner.buttonText || '',
        linkUrl: banner.linkUrl || banner.link || '',
        imageUrl: banner.imageUrl || '',
        order: Number(banner.order || 1),
        active: banner.active !== false && banner.isActive !== false,
        isCenterFeatured: Boolean(banner.isCenterFeatured),
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        buttonText: 'Explore Collection',
        linkUrl: '',
        imageUrl: '',
        order: 1,
        active: true,
        isCenterFeatured: false,
      });
    }
    setError(null);
  }, [banner, isCreating, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      setError('Banner image URL is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        link: formData.linkUrl.trim(),
        linkUrl: formData.linkUrl.trim(),
        imageUrl: formData.imageUrl.trim(),
        order: Number(formData.order),
        active: Boolean(formData.active),
        isCenterFeatured: Boolean(formData.isCenterFeatured),
      };

      if (isCreating || !banner?._id) {
        await adminApi.createBanner(payload);
      } else {
        await adminApi.updateBanner(banner._id, payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save banner slide.');
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
                {isCreating ? 'Add Hero Carousel Banner' : 'Edit Hero Banner Slide'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Update homepage carousel slides in real time
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
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Banner Image URL *
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              placeholder="https://images.unsplash.com/photo-..."
              required
            />
          </div>

          {/* Live Image Preview */}
          {formData.imageUrl && (
            <div className="relative aspect-[21/9] sm:aspect-[16/7] rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-900">
              <img
                src={formData.imageUrl}
                alt="Banner Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono font-bold">
                  {formData.subtitle || 'SUBTITLE PREVIEW'}
                </span>
                <h4 className="text-base sm:text-lg font-black">{formData.title || 'Main Headline Title'}</h4>
                <p className="text-xs text-neutral-300 line-clamp-1">{formData.description || 'Description preview'}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Main Headline Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. Imperial Haute Horlogerie"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Subtitle / Badge
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. EXCLUSIVE ATELIER RELEASE"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Caption
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
              placeholder="e.g. Certified Swiss automatic tourbillons crafted in 18k solid gold."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. Discover Timepieces"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Destination Link
              </label>
              <input
                type="text"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                placeholder="e.g. category_search:watches or /shop"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Active Slide (Visible on Homepage)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCenterFeatured}
                onChange={(e) => setFormData({ ...formData, isCenterFeatured: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Center / Hero Featured Slide
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
                  <span>Saving Slide...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isCreating ? 'Create Banner' : 'Save Banner'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
