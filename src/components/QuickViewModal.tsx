import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  PackageOpen,
  Check,
  Zap,
  Store,
} from 'lucide-react';
import { Product } from '../types';
import GlassCloseButton from './GlassCloseButton';
import InteractiveWishlistButton from './InteractiveWishlistButton';

export interface QuickViewModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onNavigateToDetail: (product: Product) => void;
  isLightMode?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen = true,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onNavigateToDetail,
  isLightMode = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Sync state whenever active product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      setImageError(false);
      setIsAdded(false);
      setQuantity(1);

      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0]);
      } else {
        setSelectedColor('');
      }

      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }
    }
  }, [product]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product || !isOpen) return null;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const discountPercent =
    product.mrp && product.price && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  const handleDeepViewClick = () => {
    onClose();
    onNavigateToDetail(product);
  };

  // Stock status badge label
  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) ||
    product.stockStatus?.toLowerCase().includes('out of stock');

  return (
    <AnimatePresence>
      <div
        id="quickview-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/80 dark:bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id={`quickview-modal-${product.id}`}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className={`relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-solid shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col p-5 sm:p-7 lg:p-9 ${
            isLightMode
              ? 'bg-white border-[#EADFC9] text-[#0F1A3C]'
              : 'bg-[#080D21] border-[#F5A623]/30 text-white'
          }`}
        >
          {/* Top Floating Close Button */}
          <GlassCloseButton
            id="quickview-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 z-30"
            size="md"
            title="Close Quick View"
          />

          {/* 12-Column Responsive Grid: 7 Cols for Image Preview, 5 Cols for Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">
            
            {/* LEFT: 7 COLUMNS - High-Impact Image Showcase */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Main Image Container */}
              <div
                className={`relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] xl:min-h-[480px] rounded-2xl overflow-hidden border border-solid group/preview select-none flex items-center justify-center ${
                  isLightMode
                    ? 'bg-gradient-to-br from-neutral-50 to-neutral-100 border-[#EADFC9]'
                    : 'bg-gradient-to-br from-[#040714] to-[#0A1028] border-[#162744]'
                }`}
              >
                {/* Floating Wishlist Button */}
                <div className="absolute top-4 left-4 z-20">
                  <InteractiveWishlistButton
                    id={`quickview-wishlist-${product.id}`}
                    isWishlisted={isWishlisted}
                    onToggle={() => onToggleWishlist(product)}
                    size="lg"
                    showTooltip={true}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  />
                </div>

                {/* Floating Badge (Hot / Sale / New) */}
                {product.badge && (
                  <div className="absolute top-4 right-14 z-20">
                    <span
                      className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg backdrop-blur-xs ${
                        product.badge === 'HOT'
                          ? 'bg-red-600 text-white shadow-red-600/30'
                          : product.badge === 'SALE'
                          ? 'bg-amber-500 text-black shadow-amber-500/30'
                          : product.badge === 'NEW'
                          ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                          : 'bg-black text-white dark:bg-white dark:text-black'
                      }`}
                    >
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Product Image Display with Smooth Zoom Transition */}
                {!imageError && selectedImage ? (
                  <motion.img
                    key={selectedImage}
                    src={selectedImage}
                    alt={product.name}
                    initial={{ opacity: 0.4, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    onError={() => setImageError(true)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-106"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-neutral-500 gap-2">
                    <PackageOpen className="w-12 h-12 opacity-40 text-amber-500" />
                    <span className="text-xs font-mono font-bold tracking-wider">{product.brand}</span>
                  </div>
                )}

                {/* Subtle Image Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Multi-Image Thumbnails Carousel (if more than 1 image) */}
              {imagesList.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  {imagesList.map((img, idx) => {
                    const isSelected = selectedImage === img;
                    return (
                      <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedImage(img);
                          setImageError(false);
                        }}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                          isSelected
                            ? 'border-[#F5A623] shadow-md scale-102 ring-2 ring-[#F5A623]/30'
                            : isLightMode
                            ? 'border-neutral-200 opacity-70 hover:opacity-100 hover:border-amber-400'
                            : 'border-[#162744] opacity-65 hover:opacity-100 hover:border-[#F5A623]/60'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} thumb ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Trust & Guarantee Perks */}
              <div className="hidden sm:grid grid-cols-3 gap-3 pt-2 text-[11px] font-semibold">
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                    isLightMode
                      ? 'bg-neutral-50 border-neutral-200/80 text-neutral-700'
                      : 'bg-[#0B1530]/60 border-[#162744] text-neutral-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <span>100% Verified Authentic</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                    isLightMode
                      ? 'bg-neutral-50 border-neutral-200/80 text-neutral-700'
                      : 'bg-[#0B1530]/60 border-[#162744] text-neutral-300'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <span>Fast Courier Dispatch</span>
                </div>
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                    isLightMode
                      ? 'bg-neutral-50 border-neutral-200/80 text-neutral-700'
                      : 'bg-[#0B1530]/60 border-[#162744] text-neutral-300'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-[#F5A623] shrink-0" />
                  <span>7-Day Return Guarantee</span>
                </div>
              </div>
            </div>

            {/* RIGHT: 5 COLUMNS - Luxury Product Details & Actions */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              {/* Header: Brand, Title, Rating, Stock */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-amber-600 dark:text-[#F5A623] uppercase tracking-widest font-black font-mono">
                    {product.brand}
                  </span>
                  {product.eligibleFor20MinDelivery && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>20-MIN EXPRESS</span>
                    </span>
                  )}
                </div>

                <h1
                  className={`text-2xl sm:text-3xl xl:text-3xl font-black font-sans leading-tight tracking-tight ${
                    isLightMode ? 'text-[#0F1A3C]' : 'text-white'
                  }`}
                >
                  {product.name}
                </h1>

                {/* Sold By & Verified Seller Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                    isLightMode ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  }`}>
                    <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                    <span>Sold by: <strong>{product.sellerShopName || 'ALIKE-ND Official'}</strong></span>
                  </div>
                  {product.sellerVerified && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-[11px] font-bold"
                      title="Verified Seller — Admin-reviewed NID & Face Verification"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified Seller</span>
                    </span>
                  )}
                </div>

                {/* Rating & Review Counter */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className={`flex items-center px-2.5 py-1 border border-solid rounded-lg ${
                      isLightMode
                        ? 'bg-amber-500/10 border-amber-500/25 text-[#0F1A3C]'
                        : 'bg-[#F5A623]/10 border-[#F5A623]/30 text-white'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                    <span className="text-xs font-black ml-1.5">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-neutral-400 text-xs font-mono">·</span>
                  <span className={`text-xs font-medium ${isLightMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                    {product.reviewsCount} verified reviews
                  </span>
                  <span className="text-neutral-400 text-xs font-mono">·</span>
                  <span
                    className={`text-xs font-bold ${
                      isOutOfStock ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'
                    }`}
                  >
                    {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready'}
                  </span>
                </div>
              </div>

              {/* Price Block */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border ${
                  isLightMode
                    ? 'bg-amber-500/5 border-[#EADFC9]'
                    : 'bg-[#0B1530]/80 border-[#162744]'
                }`}
              >
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className={`text-3xl sm:text-4xl font-black tracking-tight ${
                      isLightMode ? 'text-[#0F1A3C]' : 'text-white'
                    }`}
                  >
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.mrp && product.mrp > product.price && (
                    <>
                      <span className="text-base text-neutral-400 dark:text-neutral-500 line-through font-medium">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="bg-gradient-to-r from-[#FF1990] to-[#FF007F] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                  Inclusive of all Indian marketplace taxes and GST. Fast local shipping available.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-amber-700/80 dark:text-[#F5A623]/80 uppercase font-mono tracking-widest font-extrabold">
                  Atelier Description
                </span>
                <p
                  className={`text-xs sm:text-sm leading-relaxed font-sans line-clamp-4 ${
                    isLightMode ? 'text-neutral-700' : 'text-neutral-300'
                  }`}
                >
                  {product.description}
                </p>
              </div>

              {/* Variant Selections: Size & Color */}
              {(() => {
                const productSizes =
                  product.sizes && product.sizes.length > 0 ? product.sizes : ['Standard'];
                const productColors =
                  product.colors && product.colors.length > 0 ? product.colors : ['Default'];

                const isGenericSize = (s: string) =>
                  ['standard', 'fits all', 'one size', 'regular', 'default'].includes(s.toLowerCase());
                const isGenericColor = (c: string) =>
                  ['standard', 'default', 'none', 'regular'].includes(c.toLowerCase());

                const hasSizes = productSizes.length > 1 || !isGenericSize(productSizes[0]);
                const hasColors = productColors.length > 1 || !isGenericColor(productColors[0]);

                if (!hasSizes && !hasColors) return null;

                return (
                  <div
                    className={`space-y-4 pt-3 border-t ${
                      isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
                    }`}
                  >
                    {/* Size Selector */}
                    {hasSizes && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-700/80 dark:text-[#F5A623]/80 uppercase font-mono tracking-wider font-extrabold text-[11px]">
                            Select Size
                          </span>
                          {selectedSize && (
                            <span className={isLightMode ? 'text-neutral-700' : 'text-neutral-300'}>
                              {selectedSize}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {productSizes.map((size) => {
                            const isSelected = selectedSize === size;
                            return (
                              <button
                                key={size}
                                type="button"
                                onClick={() => setSelectedSize(size)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border border-solid transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-2 border-[#F5A623] bg-[#F5A623]/15 text-[#B48C28] dark:text-[#F5A623] font-black shadow-sm scale-102'
                                    : isLightMode
                                    ? 'border-[#EADFC9] bg-white text-gray-700 hover:border-amber-400'
                                    : 'border-[#162744] bg-[#0B1B32] text-slate-300 hover:border-[#F5A623]/40'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Color Selector */}
                    {hasColors && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-amber-700/80 dark:text-[#F5A623]/80 uppercase font-mono tracking-wider font-extrabold text-[11px]">
                            Select Color / Variant
                          </span>
                          {selectedColor && (
                            <span className={isLightMode ? 'text-neutral-700' : 'text-neutral-300'}>
                              {selectedColor}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {productColors.map((color) => {
                            const isSelected = selectedColor === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl border border-solid transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-2 border-[#F5A623] bg-[#F5A623]/15 text-[#B48C28] dark:text-[#F5A623] font-black shadow-sm scale-102'
                                    : isLightMode
                                    ? 'border-[#EADFC9] bg-white text-gray-700 hover:border-amber-400'
                                    : 'border-[#162744] bg-[#0B1B32] text-slate-300 hover:border-[#F5A623]/40'
                                }`}
                              >
                                {color}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Action Buttons: Add to Cart / Reserve & Deep View */}
              <div
                className={`pt-4 border-t space-y-3 ${
                  isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Reserve / Add to Cart Button */}
                  <motion.button
                    id={`quickview-add-to-cart-${product.id}`}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={handleAddToCartClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-grow py-3.5 sm:py-4 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer select-none ${
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed bg-neutral-600 text-white'
                        : isAdded
                        ? 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-[#0F1A3C] to-[#162744] hover:from-[#162744] hover:to-[#0F1A3C] text-white border border-[#F5A623]/60 hover:border-[#F5A623] shadow-amber-500/10'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-300" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 text-[#F5A623]" />
                        <span>Reserve Signature Copy</span>
                      </>
                    )}
                  </motion.button>

                  {/* Deep View Button */}
                  <motion.button
                    id={`quickview-deep-view-${product.id}`}
                    type="button"
                    onClick={handleDeepViewClick}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className={`py-3.5 sm:py-4 px-6 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-solid shrink-0 select-none ${
                      isLightMode
                        ? 'bg-white hover:bg-neutral-50 text-[#0F1A3C] border-[#EADFC9] hover:border-[#F5A623] shadow-sm'
                        : 'bg-[#0B1B32] hover:bg-[#162744] text-slate-200 border-[#162744] hover:border-[#F5A623]/60 hover:text-[#F5A623]'
                    }`}
                  >
                    <span>Deep View</span>
                    <ArrowRight className="w-4 h-4 text-[#F5A623]" />
                  </motion.button>
                </div>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickViewModal;
