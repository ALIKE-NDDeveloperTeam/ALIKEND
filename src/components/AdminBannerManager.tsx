import React, { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Crown,
  Upload,
  Layers,
  Eye,
  Sliders,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Banner } from '../pages/adminTypes';
import { adminApi } from '../pages/adminApi';

export interface AdminBannerManagerProps {
  banners: Banner[];
  onBannersChange: (banners: Banner[]) => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
  isSuperAdmin?: boolean;
}

const PRESET_BANNER_IMAGES = [
  {
    name: 'Luxury Atelier',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
  {
    name: 'Express Courier',
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
  {
    name: 'Wholesale Procurement',
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
  {
    name: 'Haute Couture Lookbook',
    url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
  {
    name: 'Swiss Chronograph',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
  {
    name: 'High-End Audio',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=75&fm=webp',
  },
];

export const AdminBannerManager: React.FC<AdminBannerManagerProps> = ({
  banners,
  onBannersChange,
  onFlashSuccess,
  onError,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    subtitle: '',
    description: '',
    buttonText: 'Shop Now',
    linkUrl: 'category_search',
    order: 1,
    isActive: true,
    isCenterFeatured: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [previewTab, setPreviewTab] = useState<'table' | 'visual3'>('visual3');

  useEffect(() => {
    if (modalOpen || bannerToDelete) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [modalOpen, bannerToDelete]);

  const activeCount = banners.filter((b) => b.active !== false && b.isActive !== false).length;
  const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Determine top 3 banners for 3-banner carousel preview
  const previewTriad = sortedBanners.filter((b) => b.active !== false && b.isActive !== false).slice(0, 3);
  const centerItem = previewTriad.find((b) => b.isCenterFeatured) || previewTriad[0];

  function openCreateModal() {
    const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) + 1 : 1;
    setEditingBanner(null);
    setFormData({
      imageUrl: '',
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Shop Now',
      linkUrl: 'category_search',
      order: nextOrder,
      isActive: true,
      isCenterFeatured: banners.length === 0,
    });
    setModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl || '',
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      buttonText: banner.buttonText || 'Shop Now',
      linkUrl: banner.linkUrl || banner.link || 'category_search',
      order: banner.order || 1,
      isActive: banner.active !== false && banner.isActive !== false,
      isCenterFeatured: Boolean(banner.isCenterFeatured),
    });
    setModalOpen(true);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onError('Image file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setFormData((prev) => ({ ...prev, imageUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  async function handleToggleStatus(banner: Banner) {
    try {
      const updated = await adminApi.toggleBanner(banner._id);
      const newBanners = banners.map((b) =>
        b._id === banner._id
          ? {
              ...b,
              active: updated.active,
              isActive: updated.active,
            }
          : b
      );
      onBannersChange(newBanners);
      onFlashSuccess(`Banner "${banner.title || 'Slide'}" status updated.`);
    } catch (err: any) {
      onError(err.message || 'Failed to toggle banner status');
    }
  }

  async function handleSetAsCenter(bannerId: string) {
    try {
      // Set target banner isCenterFeatured to true, all others to false
      const updatedList = await Promise.all(
        banners.map(async (b) => {
          const isTarget = b._id === bannerId;
          if (b.isCenterFeatured !== isTarget) {
            return adminApi.updateBanner(b._id, { isCenterFeatured: isTarget });
          }
          return b;
        })
      );
      onBannersChange(updatedList);
      onFlashSuccess('Center Featured Banner selected successfully!');
    } catch (err: any) {
      onError(err.message || 'Failed to update center banner');
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sortedBanners.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sortedBanners];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const reorderedIds = reordered.map((b) => b._id);

    setIsReordering(true);
    try {
      await adminApi.reorderBanners(reorderedIds);
      const updated = reordered.map((b, i) => ({ ...b, order: i + 1 }));
      onBannersChange(updated);
      onFlashSuccess('Banner display order updated.');
    } catch (err: any) {
      onError(err.message || 'Failed to reorder banners');
    } finally {
      setIsReordering(false);
    }
  }

  async function handleOrderInputChange(bannerId: string, newOrder: number) {
    if (isNaN(newOrder) || newOrder < 1) return;
    try {
      const updated = await adminApi.updateBanner(bannerId, { order: newOrder });
      const newBanners = banners.map((b) => (b._id === bannerId ? { ...b, order: newOrder } : b));
      onBannersChange(newBanners);
      onFlashSuccess(`Banner order updated to #${newOrder}`);
    } catch (err: any) {
      onError(err.message || 'Failed to update banner order');
    }
  }

  async function handleDeleteConfirm() {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteBanner(bannerToDelete._id);
      const remaining = banners.filter((b) => b._id !== bannerToDelete._id);
      onBannersChange(remaining);
      setBannerToDelete(null);
      onFlashSuccess('Banner deleted successfully.');
    } catch (err: any) {
      onError(err.message || 'Failed to delete banner');
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveBanner(e: FormEvent) {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      onError('Please provide an image URL or upload an image file.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        imageUrl: formData.imageUrl.trim(),
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim() || 'Shop Now',
        link: formData.linkUrl.trim() || 'category_search',
        linkUrl: formData.linkUrl.trim() || 'category_search',
        order: Number(formData.order) || 1,
        active: Boolean(formData.isActive),
        isActive: Boolean(formData.isActive),
        isCenterFeatured: Boolean(formData.isCenterFeatured),
      };

      if (editingBanner) {
        const updated = await adminApi.updateBanner(editingBanner._id, payload);
        const newBanners = banners.map((b) => (b._id === editingBanner._id ? updated : b));
        onBannersChange(newBanners);
        onFlashSuccess('Banner updated successfully.');
      } else {
        const created = await adminApi.createBanner(payload);
        onBannersChange([...banners, created]);
        onFlashSuccess('New banner added successfully.');
      }
      setModalOpen(false);
    } catch (err: any) {
      onError(err.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="ap-card bg-neutral-900 border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-serif font-bold text-white">3-Banner Carousel Manager</h2>
          </div>
          <p className="text-xs text-neutral-400">
            Configure the 3 featured banners shown simultaneously on the desktop storefront. The Center Banner is elevated with a gold highlight aura.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewTab('visual3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'visual3'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Live 3-Banner Preview
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'table'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1" />
              Catalog List ({banners.length})
            </button>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          VISUAL 3-BANNER CAROUSEL SIMULATOR
          ======================================================== */}
      {previewTab === 'visual3' && (
        <div className="ap-card bg-black/50 border border-white/10 p-5 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-serif font-bold text-white">Live Storefront Triad Simulation</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Banners: {activeCount}
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">Desktop 3-in-1 Viewport Simulation</span>
          </div>

          {previewTriad.length < 3 ? (
            <div className="p-8 rounded-2xl bg-neutral-900/50 border border-dashed border-white/15 text-center space-y-2">
              <Layers className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="text-xs text-neutral-300 font-semibold">
                You have {previewTriad.length} active banner{previewTriad.length === 1 ? '' : 's'}.
              </p>
              <p className="text-[11px] text-neutral-500">
                At least 3 active banners are recommended to populate the full 3-banner carousel layout.
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-2 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold"
              >
                + Add Another Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3 items-center py-2">
              {/* Left Sim */}
              <div className="col-span-3 rounded-2xl overflow-hidden relative h-[160px] opacity-75 border border-white/10">
                <img
                  src={previewTriad[0].imageUrl}
                  alt={previewTriad[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 p-2 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-amber-400 font-bold truncate">LEFT BANNER</span>
                  <span className="text-xs font-bold text-white truncate">{previewTriad[0].title}</span>
                </div>
              </div>

              {/* Center Sim (Elevated) */}
              <div className="col-span-6 rounded-2xl overflow-hidden relative h-[210px] border-2 border-amber-400 shadow-[0_0_30px_rgba(245,166,35,0.3)]">
                <img
                  src={centerItem.imageUrl}
                  alt={centerItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono text-amber-300 font-bold flex items-center gap-1 border border-amber-400/50">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>CENTER FOCUS BANNER</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                  <span className="text-[10px] font-mono text-amber-400 tracking-wider uppercase font-bold">
                    {centerItem.subtitle || 'FEATURED'}
                  </span>
                  <h4 className="text-base font-serif font-bold text-white truncate">{centerItem.title}</h4>
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-1 rounded bg-amber-500 text-black text-[10px] font-bold uppercase">
                      {centerItem.buttonText || 'Shop Now'} ➔
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Sim */}
              <div className="col-span-3 rounded-2xl overflow-hidden relative h-[160px] opacity-75 border border-white/10">
                <img
                  src={previewTriad[2]?.imageUrl || previewTriad[1]?.imageUrl}
                  alt="Right banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 p-2 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-amber-400 font-bold truncate">RIGHT BANNER</span>
                  <span className="text-xs font-bold text-white truncate">
                    {previewTriad[2]?.title || previewTriad[1]?.title}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          BANNER TABLE & REORDERING LIST
          ======================================================== */}
      <div className="ap-card bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-300 uppercase font-mono tracking-wider">
            All Configured Banners ({sortedBanners.length})
          </span>
          <span className="text-[11px] text-neutral-500">
            Use the <Crown className="w-3 h-3 inline text-amber-400" /> button to designate the Center Highlight banner.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-900/60 text-neutral-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/5">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Order</th>
                <th className="py-3 px-4 w-28">Preview</th>
                <th className="py-3 px-4">Title & Subtitle</th>
                <th className="py-3 px-4">Link URL</th>
                <th className="py-3 px-4 text-center">Center Banner</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {sortedBanners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-500">
                    No banners configured. Click "Add Banner" to create your first slide.
                  </td>
                </tr>
              ) : (
                sortedBanners.map((banner, index) => (
                  <tr key={banner._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={sortedBanners.length + 5}
                          value={banner.order || index + 1}
                          onChange={(e) => handleOrderInputChange(banner._id, parseInt(e.target.value))}
                          className="w-11 text-center py-1 bg-black/60 border border-white/15 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-400"
                        />
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={index === 0 || isReordering}
                            onClick={() => handleMove(index, 'up')}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp className="w-3 h-3 text-neutral-400" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sortedBanners.length - 1 || isReordering}
                            onClick={() => handleMove(index, 'down')}
                            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown className="w-3 h-3 text-neutral-400" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-24 h-14 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 relative">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        {banner.isCenterFeatured && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-black">
                            <Crown className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Content */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block truncate max-w-xs">
                          {banner.subtitle || 'NO SUBTITLE'}
                        </span>
                        <span className="font-serif font-bold text-white text-sm block truncate max-w-xs">
                          {banner.title || 'Untitled Banner'}
                        </span>
                        {banner.description && (
                          <span className="text-[11px] text-neutral-500 line-clamp-1 max-w-xs">
                            {banner.description}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Link */}
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <ExternalLink className="w-3 h-3 shrink-0 text-neutral-500" />
                        <span className="truncate">{banner.linkUrl || banner.link || 'category_search'}</span>
                      </div>
                    </td>

                    {/* Center Featured Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleSetAsCenter(banner._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          banner.isCenterFeatured
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                            : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                        title={banner.isCenterFeatured ? 'Currently center featured' : 'Click to make this the center banner'}
                      >
                        <Crown className="w-3 h-3" />
                        <span>{banner.isCenterFeatured ? 'CENTER' : 'Make Center'}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(banner)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold cursor-pointer ${
                          banner.active !== false && banner.isActive !== false
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {banner.active !== false && banner.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(banner)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBannerToDelete(banner)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 transition-colors cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          CREATE / EDIT BANNER MODAL
          ======================================================== */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-xl bg-neutral-900 border border-white/15 rounded-3xl p-6 text-white space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>{editingBanner ? 'Edit Banner Slide' : 'Add New Banner Slide'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Image Input Options */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-neutral-300 font-bold">
                  Banner Image URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                {/* Preset Image Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] text-neutral-400 block mb-1 font-mono">Curated Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNER_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 border border-white/10"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {formData.imageUrl && (
                  <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={() => onError('Image URL could not be loaded. Please verify link.')}
                    />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sovereign Atelier"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Subtitle (Kicker)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DEMAND PERFECTION"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short engaging description for the hero overlay..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* CTA Button Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    CTA Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. category_search or /products"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Order & Center Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-300 font-bold mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2 pt-2 sm:pt-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCenterFeatured}
                      onChange={(e) => setFormData({ ...formData, isCenterFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-black border-white/20 focus:ring-amber-400"
                    />
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Set as Center / Featured Banner
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-black border-white/20 focus:ring-emerald-400"
                    />
                    <span className="text-xs text-neutral-300">Active (Visible on Storefront)</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL
          ======================================================== */}
      {bannerToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setBannerToDelete(null)}>
          <div className="w-full max-w-md bg-neutral-900 border border-rose-500/30 rounded-3xl p-6 text-white space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-serif font-bold text-white">Delete Banner Slide</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">"{bannerToDelete.title || 'Untitled Banner'}"</strong>? This will remove it from the 3-banner carousel on the storefront.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase shadow-lg cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminBannerManager;
