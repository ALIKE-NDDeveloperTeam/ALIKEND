import React, { useState, useEffect, useRef, useMemo } from 'react';
import Logo from './Logo';
import {
  Search,
  X,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  ShoppingCart,
  Star,
  Zap,
  SlidersHorizontal,
  CornerDownLeft,
  Check,
  Tag,
  Flame,
  Watch,
  Smartphone,
  Shirt,
  Utensils,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import GlassCloseButton from './GlassCloseButton';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, category?: string) => void;
  onNavigate?: (view: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  products: Product[];
  isLightMode?: boolean;
  initialQuery?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Items', icon: Layers },
  { id: 'luxury', label: 'Luxury Edition', icon: Sparkles },
  { id: 'watches', label: 'Watches & Jewels', icon: Watch },
  { id: 'electronics', label: 'Tech & Phones', icon: Smartphone },
  { id: 'fashion', label: 'Designer Wear', icon: Shirt },
  { id: 'wholesale', label: 'B2B Wholesale', icon: Package }
];

const PRICE_FILTERS = [
  { id: 'all', label: 'Any Price', min: 0, max: Infinity },
  { id: 'under_2k', label: 'Under ₹2,000', min: 0, max: 2000 },
  { id: '2k_10k', label: '₹2,000 - ₹10,000', min: 2000, max: 10000 },
  { id: '10k_50k', label: '₹10,000 - ₹50,000', min: 10000, max: 50000 },
  { id: 'luxury', label: '₹50,000+', min: 50000, max: Infinity }
];

const TRENDING_KEYWORDS = [
  { text: 'Aurelia Gold Watch', tag: 'Hot', icon: Flame },
  { text: 'iPhone 16 Pro Max', tag: 'Trending', icon: Zap },
  { text: 'Organic A2 Pure Ghee', tag: 'Popular', icon: Sparkles },
  { text: 'Royal Velvet Blazer', tag: 'Luxury', icon: Tag },
  { text: 'Diamond Cluster Ring', tag: 'Elite', icon: Sparkles },
  { text: 'Italian Leather Bag', tag: 'New', icon: Flame }
];

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  onNavigate,
  onSelectProduct,
  onAddToCart,
  products,
  isLightMode = false,
  initialQuery = ''
}: SearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Auto focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialQuery]);

  // Keyboard shortcut listener: ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleExecuteSearch = (searchTerm: string, category: string = selectedCategory) => {
    onSearch(searchTerm, category);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() || selectedCategory !== 'all') {
      handleExecuteSearch(query, selectedCategory);
    }
  };

  // Live filtered products based on query, category, and price range
  const liveResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const currentPriceConfig = PRICE_FILTERS.find(f => f.id === selectedPriceRange) || PRICE_FILTERS[0];

    return products.filter((p) => {
      // Category check
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'wholesale') {
          if (!p.isWholesale) return false;
        } else if (selectedCategory === 'luxury') {
          if (p.category !== 'luxury') return false;
        } else if (selectedCategory === 'delivery') {
          if (!p.eligibleFor20MinDelivery && p.category !== 'delivery' && p.category !== 'grocery' && p.category !== 'food_delivery') return false;
        } else if (selectedCategory === 'grocery') {
          if (p.category !== 'grocery' && p.category !== 'kirana') return false;
        } else if (selectedCategory === 'food_delivery') {
          if (p.category !== 'food_delivery' && p.category !== 'food') return false;
        } else {
          if (p.category !== selectedCategory) return false;
        }
      }

      // Price check
      if (p.price < currentPriceConfig.min || p.price > currentPriceConfig.max) {
        return false;
      }

      // Query check
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
        const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
        const matchSub = p.subCategory ? p.subCategory.toLowerCase().includes(q) : false;
        const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
        if (!matchName && !matchBrand && !matchCat && !matchSub && !matchDesc) {
          return false;
        }
      }

      return true;
    });
  }, [products, query, selectedCategory, selectedPriceRange]);

  if (!isOpen) return null;

  return (
    <div
      id="search-experience-modal-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-xl transition-all duration-300 animate-fade-in bg-black/75"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Search Modal Window */}
      <div
        ref={modalContainerRef}
        className={`w-full max-w-3xl my-auto rounded-2xl md:rounded-3xl border border-solid shadow-2xl overflow-hidden flex flex-col transition-all duration-300 transform animate-page-in ${
          isLightMode
            ? 'bg-[#FAF9F6] border-[#E5D7B7] text-[#0F1A3C] shadow-[0_25px_60px_rgba(15,26,60,0.22)]'
            : 'bg-[#070D1E] border-[#D3E8ED]/30 text-white shadow-[0_25px_70px_rgba(0,0,0,0.85)]'
        }`}
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar / Header with Search Brand Badge & Close Button */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between border-b border-solid ${
            isLightMode
              ? 'bg-white/80 border-[#EADFC9]'
              : 'bg-[#0B142B]/90 border-[#D3E8ED]/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Logo size="xs" showText={false} isLightMode={isLightMode} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight font-serif bg-gradient-to-r from-[#E91E63] to-[#FF2A85] bg-clip-text text-transparent">ALIKE-ND</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                    isLightMode
                      ? 'bg-[#0F1A3C]/10 text-[#0F1A3C] border-[#0F1A3C]/20'
                      : 'bg-[#D3E8ED]/15 text-[#D3E8ED] border-[#D3E8ED]/30'
                  }`}
                >
                  Universal Search
                </span>
              </div>
              <p
                className={`text-[10px] hidden sm:block ${
                  isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                }`}
              >
                Instant luxury catalog & verified boutiques
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dedicated Top Back Button */}
            <button
              id="search-modal-header-back-btn"
              onClick={onClose}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-solid transition-all font-bold text-xs cursor-pointer hover:scale-105 active:scale-95 ${
                isLightMode
                  ? 'bg-[#0d0d0d] border-[#0d0d0d] text-white hover:bg-black shadow-xs'
                  : 'bg-[#0d0d0d] border-neutral-700 text-white hover:bg-black shadow-xs'
              }`}
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span
              className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-md border ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-300 text-neutral-500'
                  : 'bg-neutral-900 border-neutral-700 text-neutral-400'
              }`}
            >
              <span>ESC</span>
            </span>
            <GlassCloseButton
              id="search-modal-close-btn"
              onClick={onClose}
              isLightMode={isLightMode}
              size="md"
              title="Close Search"
            />
          </div>
        </div>

        {/* Big Search Input Field Section */}
        <div className={`p-4 md:p-5 border-b border-solid ${
          isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A1024] border-[#D3E8ED]/20'
        }`}>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Direct Arrow Back Button on Search Bar */}
            <button
              type="button"
              id="search-input-back-btn"
              onClick={onClose}
              className={`p-3 md:p-3.5 rounded-2xl border border-solid flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 ${
                isLightMode
                  ? 'bg-[#0d0d0d] border-[#0d0d0d] text-white hover:bg-black shadow-xs'
                  : 'bg-[#0d0d0d] border-neutral-700 text-white hover:bg-black shadow-xs'
              }`}
              title="Back to Store"
              aria-label="Back to Store"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit} className="relative flex-1 flex items-center">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search
                  className={`w-5 h-5 ${
                    isLightMode ? 'text-[#0d0d0d]' : 'text-neutral-300'
                  }`}
                />
              </div>

              <input
                ref={inputRef}
                id="modal-dedicated-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search watches, jewellery, tech, fashion, organic foods..."
                className={`w-full pl-12 pr-28 py-3.5 md:py-4 rounded-2xl text-sm md:text-base font-medium outline-none transition-all border ${
                  isLightMode
                    ? 'bg-[#FAF9F6] border-neutral-300 text-[#0d0d0d] placeholder-neutral-400 focus:border-[#0d0d0d] focus:ring-2 focus:ring-[#0d0d0d]/10 shadow-inner'
                    : 'bg-[#141414] border-neutral-700 text-white placeholder-neutral-500 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/25 shadow-inner'
                }`}
              />

              {/* Input Action Controls (Clear, Submit) */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className={`p-1.5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer ${
                      isLightMode ? 'hover:bg-neutral-200 hover:text-black' : 'hover:bg-neutral-800'
                    }`}
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Enter / Submit Button */}
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm border bg-[#0d0d0d] text-white border-[#0d0d0d] hover:bg-black"
                >
                  <span className="hidden sm:inline">Search</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Scrollable Results & Suggestions Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* If there are matching results */}
          {liveResults.length > 0 ? (
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-solid border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-4 h-4 ${isLightMode ? 'text-[#0F1A3C]' : 'text-[#D3E8ED]'}`} />
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isLightMode ? 'text-[#0F1A3C]' : 'text-[#D3E8ED]'
                  }`}>
                    Matching Items ({liveResults.length})
                  </span>
                </div>
                <button
                  onClick={() => handleExecuteSearch(query, selectedCategory)}
                  className={`text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer ${
                    isLightMode ? 'text-[#0F1A3C]' : 'text-[#D3E8ED]'
                  }`}
                >
                  <span>Open Full Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {liveResults.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className={`group rounded-2xl p-3 border border-solid transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between ${
                      isLightMode
                        ? 'bg-white border-[#EADFC9] hover:border-[#0F1A3C] hover:shadow-lg shadow-sm'
                        : 'bg-[#0B142B]/80 border-[#D3E8ED]/20 hover:border-[#D3E8ED] hover:bg-[#0E1A38]'
                    }`}
                  >
                    <div>
                      {/* Product Thumbnail & Badges */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {product.badge && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md text-[#D3E8ED] font-mono text-[9px] font-black uppercase tracking-wider rounded-md border border-[#D3E8ED]/30">
                            {product.badge}
                          </span>
                        )}
                        {product.category === 'delivery' && (
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-amber-500 text-black font-black text-[9px] uppercase tracking-wider rounded-md flex items-center gap-0.5">
                            <Zap className="w-2.5 h-2.5 fill-current" /> 20m
                          </span>
                        )}
                      </div>

                      {/* Brand & Name */}
                      <span className={`text-[10px] font-mono uppercase tracking-wider font-extrabold block truncate ${
                        isLightMode ? 'text-neutral-500' : 'text-[#D3E8ED]/80'
                      }`}>
                        {product.brand}
                      </span>
                      <h4 className={`text-xs font-bold line-clamp-2 leading-tight mt-0.5 group-hover:underline ${
                        isLightMode ? 'text-neutral-900' : 'text-white'
                      }`}>
                        {product.name}
                      </h4>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex items-center text-amber-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-bold text-amber-500 ml-1">
                            {product.rating.toFixed(1)}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-400">({product.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Price & Add to Bag */}
                    <div className="pt-2.5 mt-2 border-t border-solid border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                      <div>
                        <span className={`text-xs md:text-sm font-black ${
                          isLightMode ? 'text-[#0F1A3C]' : 'text-[#D3E8ED]'
                        }`}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-neutral-400 line-through block -mt-0.5">
                            ₹{product.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        className={`p-2 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm border ${
                          isLightMode
                            ? 'bg-[#0F1A3C] text-[#D3E8ED] border-[#0F1A3C] hover:bg-[#1A2A56]'
                            : 'bg-[#D3E8ED] text-[#070D1E] border-[#D3E8ED] font-bold'
                        }`}
                        title="Add to Shopping Bag"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {liveResults.length > 6 && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => handleExecuteSearch(query, selectedCategory)}
                    className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                      isLightMode
                        ? 'bg-[#0F1A3C] text-[#D3E8ED] border-[#0F1A3C] hover:bg-[#1A2A56]'
                        : 'bg-[#D3E8ED] text-[#070D1E] border-[#D3E8ED] shadow-lg'
                    }`}
                  >
                    <span>View all {liveResults.length} luxury results</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No Results state */
            <div className={`py-8 text-center rounded-2xl border border-dashed ${
              isLightMode ? 'bg-white border-neutral-300' : 'bg-[#0B142B]/40 border-neutral-800'
            }`}>
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-neutral-800/30 text-neutral-400 mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className={`text-sm font-black uppercase tracking-wider ${
                isLightMode ? 'text-neutral-800' : 'text-neutral-200'
              }`}>
                No exact match found for "{query}"
              </h3>
              <p className={`text-xs mt-1 max-w-md mx-auto ${
                isLightMode ? 'text-neutral-500' : 'text-neutral-400'
              }`}>
                Try adjusting your search terms, removing filters, or browsing our hot luxury tags below.
              </p>
              <button
                onClick={() => {
                  setQuery('');
                  setSelectedCategory('all');
                  setSelectedPriceRange('all');
                }}
                className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer border ${
                  isLightMode
                    ? 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-neutral-200'
                    : 'bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800'
                }`}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
