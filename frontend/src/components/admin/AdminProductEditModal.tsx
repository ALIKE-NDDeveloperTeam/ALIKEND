import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Eye, EyeOff, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { adminApi } from '../../pages/adminApi';

interface AdminProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (updatedProduct: Product) => void;
}

export const AdminProductEditModal: React.FC<AdminProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaveSuccess,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [specsList, setSpecsList] = useState<Array<{ key: string; value: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'images' | 'specs'>('basic');

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        deliveryCharge: product.deliveryCharge ?? 0,
        isHidden: product.isHidden ?? false,
        isPublished: product.isPublished ?? true,
      });

      const imgs = Array.isArray(product.images) && product.images.length > 0
        ? [...product.images]
        : product.image
        ? [product.image]
        : [];
      setGalleryImages(imgs);

      setSizesInput(Array.isArray(product.sizes) ? product.sizes.join(', ') : '');
      setColorsInput(Array.isArray(product.colors) ? product.colors.join(', ') : '');

      if (product.specifications && typeof product.specifications === 'object') {
        const entries = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setSpecsList(entries);
      } else {
        setSpecsList([]);
      }
      setError(null);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleInputChange = (field: keyof Product, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleAddGalleryImage = () => {
    if (newGalleryUrl.trim()) {
      setGalleryImages((prev) => [...prev, newGalleryUrl.trim()]);
      setNewGalleryUrl('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSpec = () => {
    setSpecsList((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, key: string, value: string) => {
    setSpecsList((prev) => {
      const copy = [...prev];
      copy[index] = { key, value };
      return copy;
    });
  };

  const handleRemoveSpec = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const calculatedDiscount =
    formData.mrp && formData.price && formData.mrp > formData.price
      ? Math.round(((formData.mrp - formData.price) / formData.mrp) * 100)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Product price must be greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedSpecs: Record<string, string> = {};
      specsList.forEach((s) => {
        if (s.key.trim()) parsedSpecs[s.key.trim()] = s.value.trim();
      });

      const parsedSizes = sizesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedColors = colorsInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const primaryImage = galleryImages[0] || formData.image || '';

      const payload = {
        name: formData.name.trim(),
        brand: formData.brand || 'Alike Sovereign',
        category: formData.category || 'luxury',
        subCategory: formData.subCategory || '',
        price: Number(formData.price),
        mrp: Number(formData.mrp || formData.price),
        stock: Number(formData.stock ?? 10),
        stockStatus: formData.stockStatus || (Number(formData.stock) <= 0 ? 'Out of Stock' : 'In Stock'),
        badge: formData.badge || '',
        isFlashSale: Boolean(formData.isFlashSale),
        eligibleFor20MinDelivery: Boolean(formData.eligibleFor20MinDelivery),
        image: primaryImage,
        images: galleryImages.length > 0 ? galleryImages : [primaryImage],
        description: formData.description || '',
        specifications: parsedSpecs,
        sizes: parsedSizes,
        colors: parsedColors,
        deliveryCharge: Number(formData.deliveryCharge || 0),
        isPublished: formData.isPublished !== false,
        isHidden: Boolean(formData.isHidden),
      };

      const targetId = product._id || String(product.id);
      const res = await adminApi.updateProduct(targetId, payload);

      const updatedObj: Product = {
        ...product,
        ...payload,
        id: product.id,
        _id: product._id || (res && res._id),
      };

      onSaveSuccess(updatedObj);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                Edit Product
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  ID: #{product.id}
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Modify catalog details directly on the live website
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

        {/* Tab navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-6 gap-2 bg-white dark:bg-neutral-900 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'basic'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Basic Info & Category
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Pricing & Inventory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'images'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Images & Gallery ({galleryImages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-extrabold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Specs & Variants
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs rounded-xl shrink-0">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                  placeholder="Enter full luxury product title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.brand || ''}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. Alike Sovereign"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. electronics, luxury, grocery, fashion"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Sub-Category / Segment
                  </label>
                  <input
                    type="text"
                    value={formData.subCategory || ''}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. Watches, Smartphones, Audio"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Product Badge
                  </label>
                  <select
                    value={formData.badge || ''}
                    onChange={(e) => handleInputChange('badge', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                  >
                    <option value="">No Badge</option>
                    <option value="HOT">HOT</option>
                    <option value="SALE">SALE</option>
                    <option value="NEW">NEW</option>
                    <option value="TRENDING">TRENDING</option>
                    <option value="LIMITED">LIMITED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                  placeholder="Detailed product story, craftsmanship, materials..."
                />
              </div>

              {/* Visibility and Delivery Switches */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished !== false && !formData.isHidden}
                    onChange={(e) => {
                      const published = e.target.checked;
                      handleInputChange('isPublished', published);
                      handleInputChange('isHidden', !published);
                    }}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-neutral-900 dark:text-white">Public Status</span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {formData.isHidden ? 'Hidden (Unpublished)' : 'Live & Visible'}
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.eligibleFor20MinDelivery)}
                    onChange={(e) => handleInputChange('eligibleFor20MinDelivery', e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-neutral-900 dark:text-white">20-Min Express</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Hyperlocal Delivery</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFlashSale)}
                    onChange={(e) => handleInputChange('isFlashSale', e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold block text-neutral-900 dark:text-white">Flash Deal</span>
                    <span className="text-neutral-500 dark:text-neutral-400">Include in Flash Sale</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.price ?? ''}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    MRP / List Price (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.mrp ?? ''}
                    onChange={(e) => handleInputChange('mrp', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Calculated Discount
                  </label>
                  <div className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-extrabold">
                    {calculatedDiscount > 0 ? `${calculatedDiscount}% OFF` : '0% (At MRP)'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock ?? 10}
                    onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Stock Status Label
                  </label>
                  <input
                    type="text"
                    value={formData.stockStatus || ''}
                    onChange={(e) => handleInputChange('stockStatus', e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. In Stock, Only 2 left!, Out of Stock"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryCharge ?? 0}
                    onChange={(e) => handleInputChange('deliveryCharge', Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white font-mono"
                    placeholder="0 for Free Delivery"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Add Image URL to Gallery
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Gallery Preview Grid */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                  Gallery Images (First image is primary thumbnail)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {galleryImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800"
                    >
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-amber-400 text-[9px] font-black tracking-wider uppercase backdrop-blur-xs">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer shadow-md"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {galleryImages.length === 0 && (
                    <div className="col-span-full py-8 text-center text-xs text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                      No images added. Please paste an image URL above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Available Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. S, M, L, XL, Free Size"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Available Colors (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:border-amber-500 text-neutral-900 dark:text-white"
                    placeholder="e.g. Gold, Black, Silver, Rose Gold"
                  />
                </div>
              </div>

              {/* Specifications Key-Value */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Product Specifications
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs text-amber-500 hover:text-amber-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Attribute
                  </button>
                </div>
                <div className="space-y-2">
                  {specsList.map((spec, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Key (e.g. Movement, Material)"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(i, e.target.value, spec.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Swiss Automatic)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(i, spec.key, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {specsList.length === 0 && (
                    <p className="text-xs text-neutral-400 italic">No custom specifications added.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
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
                  <span>Saving Live...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
