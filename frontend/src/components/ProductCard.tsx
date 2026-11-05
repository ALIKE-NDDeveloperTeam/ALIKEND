import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, GitCompare, ShoppingCart, Star, PackageOpen, Check, Store, Zap, Edit, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';
import { useAdminEdit } from '../context/AdminEditContext';

export interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  isWishlisted: boolean;
  key?: number | string;
  className?: string;
  index?: number;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  isWishlisted,
  className = '',
  index = 0,
}: ProductCardProps) {
  const { isAdmin, isEditMode, openEditProduct, openDeleteProduct, toggleProductVisibility } = useAdminEdit();
  const { id, name, brand, price, mrp, rating, reviewsCount, image, badge } = product;
  const isHiddenOrUnpublished = product.isHidden === true || product.isPublished === false;
  const [imageError, setImageError] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);

  // Calculate discount percentage
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  // Stock Indicator logic (respects database/admin defined stockStatus & stock)
  const getStockStatus = (p: Product) => {
    if (p.stockStatus) {
      const isOut = p.stockStatus.toLowerCase().includes('out of stock') || p.stock === 0;
      const isLow = p.stockStatus.toLowerCase().includes('left') || (p.stock !== undefined && p.stock <= 3 && p.stock > 0);
      const isExpress = p.stockStatus.toLowerCase().includes('express') || p.stockStatus.toLowerCase().includes('delivery');

      let badgeClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      if (isOut) {
        badgeClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25';
      } else if (isLow) {
        badgeClass = 'text-amber-500 bg-amber-500/10 border-amber-500/25 animate-pulse';
      } else if (isExpress) {
        badgeClass = 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25';
      }
      let displayLabel = p.stockStatus;
      if (displayLabel === '20-Min Express' || displayLabel === '20 Min Express') {
        displayLabel = 'Express';
      }
      return { label: displayLabel, class: badgeClass, isOut };
    }

    const pId = p.id || 1;
    const is20Min = p.eligibleFor20MinDelivery || p.category === 'delivery' || p.category === 'grocery' || p.category === 'food_delivery';
    if (p.stock !== undefined && p.stock <= 0) {
      return { label: 'Out of Stock', class: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25', isOut: true };
    }
    if (is20Min) {
      return { label: '⚡ Express', class: 'text-amber-500 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 font-bold', isOut: false };
    }
    if (pId % 4 === 0) return { label: '2 left', class: 'text-amber-500 bg-amber-500/10 border-amber-500/25 animate-pulse', isOut: false };
    return { label: 'In Stock', class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25', isOut: false };
  };
  const stock = getStockStatus(product);

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <motion.div
      id={`product-card-${id}`}
      onClick={() => onSelectProduct(product)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10px' }}
      transition={{ duration: 0.35, delay: Math.min((index % 8) * 0.05, 0.4), ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col ${className.includes('w-') ? '' : 'w-[140px] sm:w-[160px]'} shrink-0 bg-white dark:bg-neutral-900 border border-solid border-neutral-200/90 dark:border-neutral-800 hover:border-[#F5A623] dark:hover:border-[#F5A623] rounded-xl overflow-hidden transition-colors duration-200 hover:shadow-[0_6px_20px_rgba(245,166,35,0.18)] cursor-pointer select-none snap-start ${className}`}
    >
      {/* 1. Image Container (Square aspect ratio for ultra-compact layout) */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-950 shrink-0">
        {/* Tiny Badges overlay positioned inside image container */}
        <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {isHiddenOrUnpublished && (
            <span
              className="px-1 py-0.2 text-[7px] font-black tracking-wider uppercase rounded shadow bg-rose-600 text-white border border-rose-400"
              title="Hidden from public customers"
            >
              HIDDEN
            </span>
          )}
          {badge && (
            <span
              id={`product-badge-${id}`}
              className={`px-1.5 py-0.5 text-[7.5px] font-black tracking-wider uppercase rounded shadow backdrop-blur-xs ${
                badge === 'HOT'
                  ? 'bg-red-600 text-white shadow-red-600/30'
                  : badge === 'SALE'
                  ? 'bg-amber-500 text-black shadow-amber-500/30'
                  : badge === 'NEW'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-black text-white dark:bg-white dark:text-black'
              }`}
            >
              {badge}
            </span>
          )}
          {product.quickDelivery && (
            <span
              id={`product-quick-badge-${id}`}
              className="px-1.5 py-0.5 text-[7.5px] font-black uppercase rounded shadow bg-amber-400 text-black border border-amber-300 flex items-center gap-0.5"
              title={product.deliveryEtaText || 'Quick Delivery'}
            >
              <Zap className="w-2.5 h-2.5 fill-black text-black shrink-0" />
              <span>{product.etaMin && product.etaMax ? `${product.etaMin}-${product.etaMax}m` : '15m'}</span>
            </span>
          )}
        </div>

        {/* Live Admin In-Place Editing Toolbar */}
        {isAdmin && isEditMode && (
          <div
            className="absolute bottom-1.5 left-1.5 z-20 flex items-center gap-0.5 p-0.5 bg-neutral-950/90 border border-amber-500/40 rounded-lg shadow-xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditProduct(product);
              }}
              className="p-1 rounded text-amber-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title="Edit Product"
            >
              <Edit className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              disabled={togglingVisibility}
              onClick={async (e) => {
                e.stopPropagation();
                setTogglingVisibility(true);
                await toggleProductVisibility(product);
                setTogglingVisibility(false);
              }}
              className={`p-1 rounded transition-all cursor-pointer ${
                isHiddenOrUnpublished
                  ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                  : 'text-neutral-300 hover:text-emerald-400 hover:bg-white/20'
              }`}
              title={isHiddenOrUnpublished ? 'Unpublished: Click to Make Live' : 'Live: Click to Hide'}
            >
              {isHiddenOrUnpublished ? (
                <EyeOff className="w-2.5 h-2.5 text-rose-400" />
              ) : (
                <Eye className="w-2.5 h-2.5 text-emerald-400" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteProduct(product);
              }}
              className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
              title="Delete Product"
            >
              <Trash2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        {/* Image with subtle zoom on card hover */}
        {!imageError && image ? (
          <img
            id={`product-image-${id}`}
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            width="160"
            height="160"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-106 block"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-400 gap-1 p-2 select-none border border-dashed border-neutral-800">
            <PackageOpen className="w-6 h-6 opacity-60 text-[#F5A623]" />
            <span className="text-[8px] font-mono text-neutral-300 font-extrabold uppercase tracking-wider">{brand || 'Atelier'}</span>
          </div>
        )}

        {/* Action Buttons overlay positioned inside image container */}
        <div className={`absolute top-1.5 right-1.5 flex flex-col gap-1 ${isWishlisted ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'} transition-opacity duration-200 z-10 items-center`}>
          <FavoriteButton
            id={`wishlist-btn-${id}`}
            isLiked={isWishlisted}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            size="sm"
          />
          <button
            id={`quickview-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickView) {
                onQuickView(product);
              } else {
                onSelectProduct(product);
              }
            }}
            className="hidden sm:flex p-1 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
            title="Quick View"
          >
            <Eye className="w-2.5 h-2.5" />
          </button>
          <button
            id={`compare-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCompare(product);
            }}
            className="hidden sm:flex p-1 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
            title="Compare Product"
          >
            <GitCompare className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* 2. Content Container (Ultra-compact p-2, readable, no overflow) */}
      <div className="flex flex-col flex-1 p-2 bg-white dark:bg-neutral-900 min-w-0">
        {/* Brand & Stock Status */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[8px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-extrabold font-mono truncate block max-w-[75px] sm:max-w-[85px]">
            {brand}
          </span>
          <span className={`px-1 py-0.2 text-[8px] font-bold rounded-sm border border-solid shrink-0 ${stock.class}`}>
            {stock.label}
          </span>
        </div>

        {/* Product Title (11px, font-semibold, 2-line clamp with fixed h-7 sm:h-8) */}
        <h3
          id={`product-title-${id}`}
          className="text-[11px] font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-[#F5A623] transition-colors leading-tight line-clamp-2 h-7 sm:h-8 mb-1"
          title={name}
        >
          {name}
        </h3>

        {/* Rating and Discount Row (9-10px) */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-0.5" id={`product-reviews-${id}`}>
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-[9.5px] font-extrabold text-neutral-800 dark:text-neutral-200">{rating.toFixed(1)}</span>
            <span className="text-neutral-400 text-[8.5px]">({reviewsCount})</span>
          </div>

          {discountPercent > 0 && (
            <span className="text-[8px] font-black px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20 shrink-0">
              {discountPercent}%
            </span>
          )}
        </div>

        {/* Price & Old Price Row */}
        <div className="mt-auto flex items-baseline gap-1 min-w-0 mb-1">
          <span className="text-sm font-bold text-neutral-950 dark:text-white truncate" id={`price-${id}`}>
            ₹{price.toLocaleString('en-IN')}
          </span>
          {mrp > price && (
            <span className="text-[9px] text-neutral-400 line-through truncate font-medium" id={`mrp-${id}`}>
              ₹{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Sold By Merchant Display (Compact 8px) */}
        <div className="flex items-center gap-1 text-[8px] text-neutral-500 dark:text-neutral-400 truncate mb-1.5">
          <Store className="w-2.5 h-2.5 text-amber-600/80 dark:text-amber-400/80 shrink-0" />
          <span className="truncate">{product.sellerShopName || 'ALIKE-ND Official'}</span>
          {product.sellerVerified && (
            <span title="Verified Seller" className="inline-flex items-center">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
            </span>
          )}
        </div>

        {/* Short Add to Cart Button (h-7, text-[10px], with whileTap animation) */}
        <motion.button
          id={`add-to-cart-card-${id}`}
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handleCartClick}
          disabled={stock.isOut}
          className={`w-full h-7 px-2 border border-solid rounded-lg transition-colors duration-200 flex items-center justify-center gap-1 shadow-xs text-[10px] font-bold ${
            stock.isOut
              ? 'bg-neutral-100 border-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-500 cursor-not-allowed'
              : addedAnim
              ? 'bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/30 font-black'
              : 'bg-[#0d0d0d] hover:bg-black text-white border-[#0d0d0d] hover:border-[#F5A623] cursor-pointer'
          }`}
        >
          {stock.isOut ? (
            <>
              <ShoppingCart className="w-3 h-3 text-neutral-400 opacity-60" />
              <span>Sold Out</span>
            </>
          ) : addedAnim ? (
            <>
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3 h-3 stroke-[2] text-[#F5A623]" />
              <span>Add to Cart</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
