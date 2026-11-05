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
  Upload,
  Layers,
  Eye,
  Sliders,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  Tag,
} from 'lucide-react';
import { DynamicCategory } from '../types';
import { adminApi } from '../pages/adminApi';

export interface AdminCategoryManagerProps {
  categories: DynamicCategory[];
  onCategoriesChange: (categories: DynamicCategory[]) => void;
  onFlashSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}

const PRESET_CATEGORY_IMAGES = [
  {
    name: 'Luxury Atelier',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'VIP Membership',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Flagship Mobiles',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Performance Laptops',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Haute Couture Fashion',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Artisan Fine Jewellery',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Pro Tier Gaming',
    url: 'https://images.unsplash.com/photo-1612287233219-c90a18413a96?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: '20-Min Express Courier',
    url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Curated Living & Furniture',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Prestige Beauty & Serums',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Industrial Precision Tools',
    url: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
  {
    name: 'Fresh Gourmet Grocery',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500&fm=webp',
  },
];

const PRESET_BADGE_COLORS = [
  { name: 'Red (Hot/Alert)', color: '#EF4444' },
  { name: 'Amber (Warm Gold)', color: '#F59E0B' },
  { name: 'Emerald (Active/Fresh)', color: '#10B981' },
  { name: 'Blue (New/Tech)', color: '#3B82F6' },
  { name: 'Purple (VIP/Exclusive)', color: '#8B5CF6' },
  { name: 'Pink (Trending/Glam)', color: '#EC4899' },
  { name: 'Teal (Living)', color: '#14B8A6' },
];

export const AdminCategoryManager: React.FC<AdminCategoryManagerProps> = ({
  categories,
  onCategoriesChange,
  onFlashSuccess,
  onError,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DynamicCategory | null>(null);
  const [formData, setFormData] = useState({
    titleEn: '',
    titleBn: '',
    imageUrl: '',
    badgeText: 'HOT',
    badgeColor: '#EF4444',
    redirectUrl: 'category_search',
    order: 1,
    isActive: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DynamicCategory | null>(null);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  useEffect(() => {
    if (modalOpen || categoryToDelete) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [modalOpen, categoryToDelete]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      titleEn: '',
      titleBn: '',
      imageUrl: '',
      badgeText: 'HOT',
      badgeColor: '#EF4444',
      redirectUrl: 'category_search',
      order: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (cat: DynamicCategory) => {
    setEditingCategory(cat);
    setFormData({
      titleEn: cat.titleEn,
      titleBn: cat.titleBn || '',
      imageUrl: cat.imageUrl,
      badgeText: cat.badgeText || '',
      badgeColor: cat.badgeColor || '#EF4444',
      redirectUrl: cat.redirectUrl || 'category_search',
      order: cat.order,
      isActive: cat.isActive !== false,
    });
    setModalOpen(true);
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.titleEn.trim()) {
      onError('Please enter an English title');
      return;
    }
    if (!formData.titleBn.trim()) {
      onError('Please enter a Bengali title');
      return;
    }
    if (!formData.imageUrl.trim()) {
      onError('Please provide a category image URL');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updated = await adminApi.updateCategory(editingCategory._id, formData);
        const nextList = categories.map((c) =>
          c._id === editingCategory._id ? (updated.category || { ...c, ...formData }) : c
        );
        onCategoriesChange(nextList);
        onFlashSuccess(`Category "${formData.titleEn}" updated successfully.`);
      } else {
        // Create new category
        const created = await adminApi.createCategory(formData);
        const newCat = created.category || {
          _id: `cat_temp_${Date.now()}`,
          ...formData,
        };
        const nextList = [...categories, newCat].sort((a, b) => a.order - b.order);
        onCategoriesChange(nextList);
        onFlashSuccess(`Category "${formData.titleEn}" created successfully.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      onError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Category Active status
  const handleToggleActive = async (cat: DynamicCategory) => {
    try {
      const nextActive = !cat.isActive;
      await adminApi.updateCategory(cat._id, { isActive: nextActive });
      const nextList = categories.map((c) =>
        c._id === cat._id ? { ...c, isActive: nextActive } : c
      );
      onCategoriesChange(nextList);
      onFlashSuccess(`Category "${cat.titleEn}" is now ${nextActive ? 'Active' : 'Disabled'}.`);
    } catch (err: any) {
      onError(err.message || 'Failed to toggle category status');
    }
  };

  // Delete Category
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setIsSaving(true);
    try {
      await adminApi.deleteCategory(categoryToDelete._id);
      const nextList = categories.filter((c) => c._id !== categoryToDelete._id);
      onCategoriesChange(nextList);
      onFlashSuccess(`Category "${categoryToDelete.titleEn}" deleted successfully.`);
      setCategoryToDelete(null);
    } catch (err: any) {
      onError(err.message || 'Failed to delete category');
    } finally {
      setIsSaving(false);
    }
  };

  // Move Category Up / Down
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const reordered = [...categories];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign contiguous order indexes
    const updatedWithOrder = reordered.map((cat, i) => ({
      ...cat,
      order: i + 1,
    }));

    onCategoriesChange(updatedWithOrder);

    try {
      await adminApi.reorderCategories(
        updatedWithOrder.map((c) => ({ id: c._id, order: c.order }))
      );
      onFlashSuccess('Category sequence updated successfully.');
    } catch (err: any) {
      onError(err.message || 'Failed to sync category order');
    }
  };

  // Handle image upload from computer (converts to base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onError('Image size must be less than 5MB');
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

  const filteredCategories = categories.filter((c) => {
    const q = searchFilter.toLowerCase();
    return (
      c.titleEn.toLowerCase().includes(q) ||
      (c.titleBn && c.titleBn.toLowerCase().includes(q)) ||
      (c.badgeText && c.badgeText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Framework vs Dynamic Data Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Dynamic Category Carousel Control:</strong> Navigation arrows, smooth momentum scrolling, mouse-wheel isolation, and bottom tracking scrollbars are fixed framework controls. Category cards, titles (English & Bengali), badges, redirect routes, and card ordering are dynamic and managed directly below.
        </div>
      </div>

      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-neutral-900/80 p-4 sm:p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F5A623]" />
            <span>Category Carousel Management</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage interactive category cards, multilingual titles, tags, and display sequence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showLivePreview
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showLivePreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            id="add-category-btn"
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Live Interactive Carousel Preview */}
      {showLivePreview && categories.length > 0 && (
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Live Storefront Preview ({categories.filter((c) => c.isActive !== false).length} Active Cards)
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 font-mono">
              Desktop 6-7 / Tablet 3-4 / Mobile 2 items
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin py-3 px-2 flex gap-4">
            {categories
              .filter((c) => c.isActive !== false)
              .map((c, i) => (
                <div
                  key={c._id || i}
                  className="w-32 sm:w-36 shrink-0 flex flex-col items-center group cursor-default"
                >
                  <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-900 shadow-md">
                    {c.badgeText && (
                      <span
                        className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-md z-10"
                        style={{ backgroundColor: c.badgeColor || '#EF4444' }}
                      >
                        {c.badgeText}
                      </span>
                    )}
                    <img
                      src={c.imageUrl}
                      alt={c.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  <div className="mt-2 text-center w-full px-1">
                    <h5 className="font-extrabold text-xs uppercase tracking-wide truncate text-neutral-900 dark:text-white">
                      {c.titleEn}
                    </h5>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {c.titleBn || c.titleEn}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder="Filter categories by English, Bengali, or Badge..."
          className="w-full sm:max-w-sm px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#F5A623]"
        />
        <div className="text-xs font-mono text-neutral-500">
          Showing {filteredCategories.length} of {categories.length}
        </div>
      </div>

      {/* Categories Cards List / Reorder Matrix */}
      <div className="space-y-2.5">
        {filteredCategories.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 text-xs">
            No categories found matching your search. Click "Add Category" to create one.
          </div>
        ) : (
          filteredCategories.map((cat, index) => (
            <div
              key={cat._id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                cat.isActive !== false
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800/60 opacity-60'
              }`}
            >
              {/* Left Side: Order Controls, Thumbnail & Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Reorder Up/Down Buttons */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Move up in sequence"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1 rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Move down in sequence"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Order Index Pill */}
                <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  #{cat.order}
                </span>

                {/* Category Thumbnail */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0 border border-neutral-200 dark:border-neutral-700">
                  <img
                    src={cat.imageUrl}
                    alt={cat.titleEn}
                    className="w-full h-full object-cover"
                  />
                  {cat.badgeText && (
                    <span
                      className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full text-[7px] font-black uppercase text-white shadow-xs"
                      style={{ backgroundColor: cat.badgeColor || '#EF4444' }}
                    >
                      {cat.badgeText}
                    </span>
                  )}
                </div>

                {/* Name, Bangla Name, Link Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white truncate">
                      {cat.titleEn}
                    </h4>
                    {cat.badgeText && (
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white shadow-2xs"
                        style={{ backgroundColor: cat.badgeColor || '#EF4444' }}
                      >
                        {cat.badgeText}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate mt-0.5">
                    বাংলা: <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{cat.titleBn || '—'}</span>
                  </p>
                  <p className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                    Target: /{cat.redirectUrl || 'category_search'}
                  </p>
                </div>
              </div>

              {/* Right Side: Status Toggle, Edit & Delete */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleActive(cat)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    cat.isActive !== false
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                  }`}
                  title="Toggle card active status"
                >
                  {cat.isActive !== false ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Disabled</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  title="Edit Category Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setCategoryToDelete(cat)}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                  {editingCategory ? 'Edit Category Item' : 'Add New Category Card'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Configure titles, badge tags, and destination link for the carousel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: English Title & Bengali Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    English Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g. Flagship Mobiles"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Bangla Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titleBn}
                    onChange={(e) => setFormData({ ...formData, titleBn: e.target.value })}
                    placeholder="e.g. ফ্ল্যাগশিপ মোবাইল"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              {/* Row 2: Image URL & Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Category Image <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/... or paste image URL"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                  <label className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preset image selectors */}
                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-neutral-500 mb-1.5">Or choose from curated luxury presets:</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {PRESET_CATEGORY_IMAGES.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 shrink-0 cursor-pointer transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview Box */}
                {formData.imageUrl && (
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-900 mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {formData.badgeText && (
                      <span
                        className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white shadow-md"
                        style={{ backgroundColor: formData.badgeColor }}
                      >
                        {formData.badgeText}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Row 3: Overlay Badge Text & Badge Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Overlay Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value.toUpperCase() })}
                    placeholder="e.g. HOT, NEW, GEAR, TRENDING"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['HOT', 'NEW', 'GEAR', 'TRENDING', 'ACTIVE', 'EXCLUSIVE'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData({ ...formData, badgeText: tag })}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-neutral-700 cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Badge Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-700"
                    />
                    <input
                      type="text"
                      value={formData.badgeColor}
                      onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                      placeholder="#EF4444"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {PRESET_BADGE_COLORS.map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setFormData({ ...formData, badgeColor: c.color })}
                        style={{ backgroundColor: c.color }}
                        className="w-5 h-5 rounded-full cursor-pointer transition-transform hover:scale-125 border border-white/40 shadow-xs"
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 4: Target Redirect Link & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Target Redirect Link
                  </label>
                  <input
                    type="text"
                    value={formData.redirectUrl}
                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                    placeholder="category_search or moblies"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Route name or category ID (e.g. category_search, luxury, laptops)
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
              </div>

              {/* Row 5: Active Status */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="category-is-active"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                />
                <label
                  htmlFor="category-is-active"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Publish and make active in Category Carousel
                </label>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {isSaving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in" onClick={() => setCategoryToDelete(null)}>
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-black uppercase tracking-wider text-neutral-900 dark:text-white">
                Delete Category
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="text-neutral-900 dark:text-white">"{categoryToDelete.titleEn}"</strong>? This will remove the card from the carousel on the storefront immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 cursor-pointer disabled:opacity-50 transition-all"
              >
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminCategoryManager;
