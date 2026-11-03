import React, { useState } from 'react';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { Eye, Heart, GitCompare, ShoppingCart, Star, PackageOpen, Check, Store, Zap, Edit, EyeOff, Trash2, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';
import { useAdminEdit } from '../context/AdminEditContext';
<<<<<<< HEAD
=======
=======
import { Eye, Heart, GitCompare, ShoppingCart, Star, PackageOpen, Check, Store, Zap } from 'lucide-react';
import { Product } from '../types';
import FavoriteButton from './FavoriteButton';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  isWishlisted: boolean;
  key?: number | string;
}

export default function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  isWishlisted,
}: ProductCardProps) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const { isAdmin, isEditMode, openEditProduct, openDeleteProduct, toggleProductVisibility } = useAdminEdit();
  const { id, name, brand, price, mrp, rating, reviewsCount, image, badge } = product;
  const isHiddenOrUnpublished = product.isHidden === true || product.isPublished === false;
  const [imageError, setImageError] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
<<<<<<< HEAD
=======
=======
  const { id, name, brand, price, mrp, rating, reviewsCount, image, badge } = product;
  const [imageError, setImageError] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Calculate discount percentage
  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  // Stock Indicator logic (respects database/admin defined stockStatus & stock)
  const getStockStatus = (p: Product) => {
    if (p.stockStatus) {
      const isOut = p.stockStatus.toLowerCase().includes('out of stock') || p.stock === 0;
      const isLow = p.stockStatus.toLowerCase().includes('left') || (p.stock !== undefined && p.stock <= 3 && p.stock > 0);
      const isExpress = p.stockStatus.toLowerCase().includes('express') || p.stockStatus.toLowerCase().includes('delivery');
      
      let badgeClass = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-bold';
      if (isOut) {
        badgeClass = 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-bold';
      } else if (isLow) {
        badgeClass = 'text-amber-500 bg-amber-500/10 border-amber-500/25 font-bold animate-pulse';
      } else if (isExpress) {
        badgeClass = 'text-sky-500 dark:text-sky-400 bg-sky-500/10 border-sky-500/25 font-bold';
      }
      let displayLabel = p.stockStatus;
      if (displayLabel === '20-Min Express' || displayLabel === '20 Min Express') {
        displayLabel = 'Fast Express';
      }
      return { label: displayLabel, class: badgeClass, isOut };
    }

    const pId = p.id || 1;
    const is20Min = p.eligibleFor20MinDelivery || p.category === 'delivery' || p.category === 'grocery' || p.category === 'food_delivery';
    if (p.stock !== undefined && p.stock <= 0) {
      return { label: 'Out of Stock', class: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/25 font-bold', isOut: true };
    }
    if (is20Min) {
      return { label: '⚡ Fast Express', class: 'text-amber-500 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 font-black', isOut: false };
    }
    if (pId % 4 === 0) return { label: 'Only 2 left!', class: 'text-amber-500 bg-amber-500/10 border-amber-500/25 font-bold animate-pulse', isOut: false };
    return { label: 'In Stock', class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25 font-bold', isOut: false };
  };
  const stock = getStockStatus(product);

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div
      id={`product-card-${id}`}
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col w-full bg-white dark:bg-neutral-900 border border-solid border-neutral-200/90 dark:border-neutral-800 hover:border-[#F5A623] dark:hover:border-[#F5A623] rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer select-none"
    >
      {/* 1. Image Container (Balanced 4:3 aspect ratio) */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-950 shrink-0">
        {/* Badge positioned inside image container */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          {isHiddenOrUnpublished && (
            <span
              className="px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-md shadow-md bg-rose-600 text-white border border-rose-400"
              title="This product is hidden from public customers"
            >
              HIDDEN
            </span>
          )}
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          {badge && (
            <span
              id={`product-badge-${id}`}
              className={`px-2 py-0.5 text-[8px] font-black tracking-widest uppercase rounded-md shadow-md backdrop-blur-xs ${
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          {product.quickDelivery && (
            <span
              id={`product-quick-badge-${id}`}
              className="px-2 py-0.5 text-[8px] font-black tracking-wider uppercase rounded-md shadow-md bg-amber-400 text-black border border-amber-300 flex items-center gap-0.5"
              title={product.deliveryEtaText ? `Quick Delivery: ${product.deliveryEtaText}` : 'Quick Delivery (10-20 min)'}
            >
              <span>⚡ Quick Delivery</span>
              {product.etaMin && product.etaMax ? (
                <span className="font-mono text-[7.5px] opacity-90">({product.etaMin}-{product.etaMax}m)</span>
              ) : null}
            </span>
          )}
        </div>

        {/* Live Admin In-Place Editing Toolbar */}
        {isAdmin && isEditMode && (
          <div
            className="absolute bottom-2 left-2 z-20 flex items-center gap-1 p-1 bg-neutral-950/90 border border-amber-500/40 rounded-lg shadow-xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openEditProduct(product);
              }}
              className="p-1 rounded text-amber-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              title="Edit Product (Name, price, images, specs, stock...)"
            >
              <Edit className="w-3.5 h-3.5" />
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
              title={isHiddenOrUnpublished ? 'Unpublished: Click to Make Live' : 'Live: Click to Hide / Unpublish'}
            >
              {isHiddenOrUnpublished ? (
                <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteProduct(product);
              }}
              className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
              title="Delete Product from Catalog"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

<<<<<<< HEAD
=======
=======
        </div>

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        {!imageError && image ? (
          <img
            id={`product-image-${id}`}
            src={image}
            alt={name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            width="320"
            height="240"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 block"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-neutral-400 gap-1.5 p-4 select-none border border-dashed border-neutral-800">
            <PackageOpen className="w-8 h-8 opacity-60 text-[#F5A623]" />
            <span className="text-[10px] font-mono text-neutral-300 font-extrabold uppercase tracking-wider">{brand || 'Atelier'}</span>
            <span className="text-[9.5px] text-neutral-500 font-medium text-center line-clamp-1">{name}</span>
          </div>
        )}

        {/* Action Buttons overlay positioned inside image container */}
        <div className={`absolute top-2 right-2 flex flex-col gap-1.5 ${isWishlisted ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'} transition-all duration-200 z-10 items-center`}>
          <FavoriteButton
            id={`wishlist-btn-${id}`}
            isLiked={isWishlisted}
            onToggle={(e) => {
              e.stopPropagation();
              onToggleWishlist(product);
            }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
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
<<<<<<< HEAD
            className="hidden sm:flex p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
=======
<<<<<<< HEAD
            className="hidden sm:flex p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
=======
            className="p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            id={`compare-btn-${id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCompare(product);
            }}
<<<<<<< HEAD
            className="hidden sm:flex p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
=======
<<<<<<< HEAD
            className="hidden sm:flex p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
=======
            className="p-1.5 rounded-full border border-solid border-white/20 bg-black/75 hover:bg-[#F5A623] text-white hover:text-[#0F1A3C] transition-all shadow-md active:scale-90 cursor-pointer product-action-btn backdrop-blur-xs"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            title="Compare Product"
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Content Container (Spacious, elegant, with readable 2-line title) */}
<<<<<<< HEAD
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 bg-white dark:bg-neutral-900 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0">
=======
<<<<<<< HEAD
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 bg-white dark:bg-neutral-900 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0">
=======
      <div className="flex flex-col flex-1 p-3 bg-white dark:bg-neutral-900 min-w-0">
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            <span className="text-[8.5px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-extrabold font-mono truncate block">
              {brand}
            </span>
            {product.subCategory && (
              <span className="text-[8px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-[110px] hidden sm:inline-block">
                {product.subCategory}
              </span>
            )}
          </div>
          {/* Stock Badge */}
          <span className={`px-1.5 py-0.5 text-[7.5px] sm:text-[8px] font-bold rounded-full border border-solid shrink-0 ${stock.class}`}>
            {stock.label}
          </span>
        </div>
        
        {/* Product Title: 2 lines with consistent height so titles are never clipped abruptly */}
        <h3
          id={`product-title-${id}`}
          className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#F5A623] transition-colors leading-snug line-clamp-2 h-8 sm:h-9 mb-1.5"
          title={name}
        >
          {name}
        </h3>

        {/* Rating and Discount Row */}
<<<<<<< HEAD
        <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1" id={`product-reviews-${id}`}>
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
=======
<<<<<<< HEAD
        <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1" id={`product-reviews-${id}`}>
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
=======
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1" id={`product-reviews-${id}`}>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            <span className="text-[10px] font-extrabold text-neutral-800 dark:text-neutral-200">{rating.toFixed(1)}</span>
            <span className="text-neutral-400 text-[9px]">({reviewsCount})</span>
          </div>

          {discountPercent > 0 && (
            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-solid border-emerald-500/20 shrink-0">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Price & MRP Row */}
        <div className="mt-auto flex items-baseline gap-1.5 min-w-0 mb-1.5">
          <span className="text-sm sm:text-base font-black text-neutral-950 dark:text-white truncate" id={`price-${id}`}>
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-neutral-400 line-through truncate font-medium" id={`mrp-${id}`}>
            ₹{mrp.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Sold By Merchant Display */}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        <div className="flex items-center gap-1 text-[9px] sm:text-[9.5px] text-neutral-500 dark:text-neutral-400 truncate mb-2">
          <Store className="w-3 h-3 text-amber-600/80 dark:text-amber-400/80 shrink-0" />
          <span className="truncate">
            <span className="hidden sm:inline">Sold by: </span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.sellerShopName || 'ALIKE-ND Official'}</span>
          </span>
          {product.sellerVerified && (
            <span
              className="inline-flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[8px] sm:text-[8.5px] font-bold shrink-0"
              title="Verified Seller (Admin-Reviewed Identity & Face Verification)"
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Verified</span>
            </span>
          )}
<<<<<<< HEAD
=======
=======
        <div className="flex items-center gap-1 text-[9.5px] text-neutral-500 dark:text-neutral-400 truncate mb-2">
          <Store className="w-3 h-3 text-amber-600/80 dark:text-amber-400/80 shrink-0" />
          <span className="truncate">
            Sold by: <span className="font-semibold text-neutral-800 dark:text-neutral-200">{product.sellerShopName || 'ALIKE-ND Official'}</span>
          </span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        </div>

        {/* Sleek Action Button */}
        <button
          id={`add-to-cart-card-${id}`}
          type="button"
          onClick={handleCartClick}
          disabled={stock.isOut}
<<<<<<< HEAD
          className={`w-full py-2 px-2.5 sm:px-3 border border-solid rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-[10px] sm:text-[11px] tracking-wider font-extrabold active:scale-[0.96] min-h-[36px] ${
=======
<<<<<<< HEAD
          className={`w-full py-2 px-2.5 sm:px-3 border border-solid rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-[10px] sm:text-[11px] tracking-wider font-extrabold active:scale-[0.96] min-h-[36px] ${
=======
          className={`w-full py-2 px-3 border border-solid rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-[10px] sm:text-[11px] tracking-wider font-extrabold active:scale-[0.96] ${
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            stock.isOut
              ? 'bg-neutral-100 border-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 cursor-not-allowed'
              : addedAnim
              ? 'bg-emerald-500 border-emerald-400 text-black scale-[0.98] shadow-emerald-500/30 font-black'
              : 'bg-[#0d0d0d] hover:bg-black text-white border-[#0d0d0d] hover:shadow-md cursor-pointer'
          }`}
        >
          {stock.isOut ? (
            <>
              <ShoppingCart className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 opacity-60" />
              <span>Sold Out</span>
            </>
          ) : addedAnim ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : (
            <>
<<<<<<< HEAD
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5] text-[#F5A623]" />
=======
<<<<<<< HEAD
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5] text-[#F5A623]" />
=======
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.5] text-[#0F1A3C]" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

