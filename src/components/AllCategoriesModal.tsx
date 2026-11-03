import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutGrid,
  ChevronRight,
  Crown,
  Boxes,
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  ShoppingBasket,
  Utensils,
  Gamepad2,
  Wrench,
  Sparkles,
  Sofa,
  Zap,
  Flame,
} from 'lucide-react';
import GlassCloseButton from './GlassCloseButton';
import { CATEGORIES } from '../data/mockData';
import { CategoryItem } from '../types';

interface AllCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  isLightMode?: boolean;
}

export const getModalCategoryTheme = (catId: string) => {
  switch (catId) {
    case 'luxury':
      return {
        gradient: 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700',
        glow: 'bg-amber-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(245,166,35,0.4)]',
        border: 'border-amber-300/40',
      };
    case 'vip':
      return {
        gradient: 'bg-gradient-to-br from-purple-500 via-indigo-600 to-violet-800',
        glow: 'bg-purple-500/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(139,92,246,0.4)]',
        border: 'border-purple-300/40',
      };
    case 'delivery':
      return {
        gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
        glow: 'bg-orange-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)]',
        border: 'border-orange-300/40',
      };
    case 'electronics':
      return {
        gradient: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600',
        glow: 'bg-cyan-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(6,182,212,0.4)]',
        border: 'border-cyan-300/40',
      };
    case 'mobiles':
      return {
        gradient: 'bg-gradient-to-br from-blue-400 via-indigo-500 to-violet-600',
        glow: 'bg-blue-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(59,130,246,0.4)]',
        border: 'border-blue-300/40',
      };
    case 'laptops':
      return {
        gradient: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600',
        glow: 'bg-slate-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(100,116,139,0.4)]',
        border: 'border-slate-300/40',
      };
    case 'fashion':
      return {
        gradient: 'bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-600',
        glow: 'bg-pink-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(236,72,153,0.4)]',
        border: 'border-pink-300/40',
      };
    case 'wholesale':
      return {
        gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-700',
        glow: 'bg-indigo-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)]',
        border: 'border-indigo-300/40',
      };
    case 'jewellery':
      return {
        gradient: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500',
        glow: 'bg-yellow-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(234,179,8,0.4)]',
        border: 'border-yellow-300/40',
      };
    case 'gaming':
      return {
        gradient: 'bg-gradient-to-br from-fuchsia-500 via-purple-600 to-indigo-700',
        glow: 'bg-fuchsia-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(217,70,239,0.4)]',
        border: 'border-fuchsia-300/40',
      };
    case 'hardware':
      return {
        gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600',
        glow: 'bg-orange-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(249,115,22,0.4)]',
        border: 'border-orange-300/40',
      };
    case 'beauty':
      return {
        gradient: 'bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500',
        glow: 'bg-pink-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(236,72,153,0.4)]',
        border: 'border-pink-300/40',
      };
    case 'perfumes':
      return {
        gradient: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-800',
        glow: 'bg-purple-500/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]',
        border: 'border-purple-300/40',
      };
    case 'personal_care':
      return {
        gradient: 'bg-gradient-to-br from-sky-400 via-cyan-500 to-teal-600',
        glow: 'bg-cyan-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(6,182,212,0.4)]',
        border: 'border-cyan-300/40',
      };
    case 'furniture':
      return {
        gradient: 'bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-700',
        glow: 'bg-teal-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(20,184,166,0.4)]',
        border: 'border-teal-300/40',
      };
    case 'grocery':
      return {
        gradient: 'bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-700',
        glow: 'bg-emerald-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]',
        border: 'border-emerald-300/40',
      };
    case 'food_delivery':
      return {
        gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-600',
        glow: 'bg-amber-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)]',
        border: 'border-amber-300/40',
      };
    default:
      return {
        gradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600',
        glow: 'bg-amber-400/25',
        shadow: 'shadow-[0_8px_20px_-4px_rgba(245,166,35,0.4)]',
        border: 'border-amber-300/40',
      };
  }
};

export const renderCategoryIcon = (iconName: string, className = 'w-6 h-6') => {
  switch (iconName) {
    case 'Crown': return <Crown className={className} />;
    case 'Boxes': return <Boxes className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Smartphone': return <Smartphone className={className} />;
    case 'Laptop': return <Laptop className={className} />;
    case 'Shirt': return <Shirt className={className} />;
    case 'Gem': return <Gem className={className} />;
    case 'ShoppingBasket': return <ShoppingBasket className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Gamepad2': return <Gamepad2 className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Sofa': return <Sofa className={className} />;
    case 'Zap': return <Zap className={className} />;
    default: return <LayoutGrid className={className} />;
  }
};

export default function AllCategoriesModal({
  isOpen,
  onClose,
  onSelectCategory,
  isLightMode = false,
}: AllCategoriesModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.classList.remove('overflow-hidden');
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Functional categories list
  const categoriesList = useMemo(() => {
    return CATEGORIES.filter((c) => c.id !== 'all');
  }, []);

  if (!isOpen) return null;

  const modalElement = (
    <div
      id="all-categories-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container with max height and internal column layout */}
      <div
        id="all-categories-modal-content"
        className={`relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isLightMode
            ? 'bg-white border-neutral-200 text-[#0F1A3C]'
            : 'bg-[#0F1A3C] border-[#F5A623]/30 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="all-categories-title"
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b ${
            isLightMode
              ? 'border-neutral-200 bg-neutral-50/70'
              : 'border-white/10 bg-[#0B1330]/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/25">
              <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="all-categories-title"
                  className={`text-lg sm:text-xl md:text-2xl font-black tracking-tight ${
                    isLightMode ? 'text-[#0F1A3C]' : 'text-white'
                  }`}
                >
                  All <span className="text-[#F5A623]">Categories</span>
                </h2>
                <span
                  className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLightMode
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').length} Departments
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                Browse every department, atelier boutique, and specialty delivery channel
              </p>
            </div>
          </div>

          {/* Close button */}
          <GlassCloseButton
            id="close-all-categories-modal"
            onClick={onClose}
            isLightMode={isLightMode}
            size="md"
            aria-label="Close all categories modal"
          />
        </div>

        {/* Modal Body: Responsive Grid of Categories */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-4">
            {categoriesList.map((cat: CategoryItem) => {
                const theme = getModalCategoryTheme(cat.id);
                return (
                  <button
                    key={cat.id}
                    id={`all-categories-item-${cat.id}`}
                    type="button"
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className={`group relative flex flex-col items-center p-3 sm:p-4 rounded-2xl border text-center transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] active:scale-95 cursor-pointer ${
                      isLightMode
                        ? 'bg-white hover:bg-amber-50/40 border-neutral-200 hover:border-[#F5A623]/60 shadow-xs hover:shadow-md'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#F5A623]/50 shadow-xs hover:shadow-lg'
                    }`}
                  >
                    {/* 20 Min Delivery Pill */}
                    {cat.eligibleFor20MinDelivery && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-xs">
                        20M
                      </span>
                    )}

                    {/* Glossy 3D Lucide Icon Badge */}
                    <div className="relative w-11 h-11 sm:w-13 sm:h-13 mx-auto mb-2.5 flex items-center justify-center">
                      <div
                        className={`absolute inset-0 rounded-2xl blur-md transition-all group-hover:scale-125 opacity-60 group-hover:opacity-90 ${theme.glow}`}
                      />
                      <div
                        className={`relative w-full h-full rounded-2xl overflow-hidden flex items-center justify-center ${theme.shadow} border-t border-white/40 shadow-inner transition-transform duration-300 group-hover:rotate-3 ${theme.gradient} text-white`}
                      >
                        {renderCategoryIcon(cat.icon, 'w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]')}
                      </div>
                    </div>

                    {/* Category Label */}
                    <span
                      className={`text-xs sm:text-sm font-bold tracking-tight line-clamp-1 group-hover:text-[#F5A623] transition-colors ${
                        isLightMode ? 'text-[#0F1A3C]' : 'text-white'
                      }`}
                    >
                      {cat.label}
                    </span>

                    {/* Micro Subcategory count or Explore hint */}
                    <span
                      className={`text-[10px] mt-1 flex items-center gap-0.5 font-medium transition-opacity ${
                        isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                      }`}
                    >
                      {cat.subCategories && cat.subCategories.length > 0 ? (
                        <span>{cat.subCategories.length} items</span>
                      ) : (
                        <span>Explore</span>
                      )}
                      <ChevronRight className="w-2.5 h-2.5 text-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </button>
                );
              })}
            </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`flex items-center justify-between px-5 sm:px-7 py-3 sm:py-3.5 border-t text-xs ${
            isLightMode
              ? 'border-neutral-200 bg-neutral-50 text-neutral-600'
              : 'border-white/10 bg-[#0B1330]/80 text-neutral-400'
          }`}
        >
          <span className="hidden sm:inline">
            Click any department to view matching items & discounts
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-1 ml-auto sm:ml-0"
          >
            <span>Browse All Items & Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalElement, document.body)
    : modalElement;
}
