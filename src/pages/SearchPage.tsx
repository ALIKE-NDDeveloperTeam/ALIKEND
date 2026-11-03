import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  Check,
  Star,
  RefreshCw,
  ChevronRight,
  X,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Zap,
  Tag,
  Flame,
  Watch,
  Smartphone,
  Shirt,
  Utensils,
  Package,
  Layers,
  Heart,
  ShoppingCart,
  Eye,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import FavoriteButton from '../components/FavoriteButton';

interface SearchPageProps {
  products: Product[];
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  onAddToCart: (p: Product, quantity?: number) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  wishlistedIds: number[];
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigate?: (view: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onBack?: () => void;
  isLightMode?: boolean;
}

const TRENDING_KEYWORDS = [
  { text: 'Aurelia Gold Watch', tag: 'Hot', icon: Flame },
  { text: 'iPhone 16 Pro Max', tag: 'Trending', icon: Zap },
  { text: 'Organic A2 Pure Ghee', tag: 'Popular', icon: Sparkles },
  { text: 'Royal Velvet Blazer', tag: 'Luxury', icon: Tag },
  { text: 'Diamond Cluster Ring', tag: 'Elite', icon: Sparkles },
  { text: 'Italian Leather Bag', tag: 'New', icon: Flame }
];

export default function SearchPage({
  products,
  initialCategory = 'all',
  onCategoryChange,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  wishlistedIds,
  searchQuery: externalSearchQuery = '',
  onSearchChange,
  onNavigate,
  showToast,
  onBack,
  isLightMode = false,
}: SearchPageProps) {
  const [internalQuery, setInternalQuery] = useState(externalSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('relevance');
<<<<<<< HEAD
  const [quickDeliveryOnly, setQuickDeliveryOnly] = useState<boolean>(false);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  const [isGridView, setIsGridView] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync external query if updated
  useEffect(() => {
    setInternalQuery(externalSearchQuery);
  }, [externalSearchQuery]);

  // Sync category if updated from external navigation/header
  useEffect(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    if (onCategoryChange) {
      onCategoryChange(catId);
    }
  };

  const handleQuerySubmit = (q: string) => {
    setInternalQuery(q);
    if (onSearchChange) onSearchChange(q);
  };

  const handleClearQuery = () => {
    setInternalQuery('');
    if (onSearchChange) onSearchChange('');
    searchInputRef.current?.focus();
  };

  const handleResetFilters = () => {
    setInternalQuery('');
    if (onSearchChange) onSearchChange('');
    handleCategorySelect('all');
    setSortBy('relevance');
<<<<<<< HEAD
    setQuickDeliveryOnly(false);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    showToast('Search reset to catalog default.', 'info');
  };

  // Filtered Products Calculation
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category Filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'wholesale') {
            if (!p.isWholesale) return false;
          } else if (selectedCategory === 'luxury') {
            if (p.category !== 'luxury') return false;
<<<<<<< HEAD
          } else if (selectedCategory === 'vip' || selectedCategory === 'premium') {
            if (p.category !== 'vip' && p.category !== 'electronics' && p.category !== 'mobiles' && p.category !== 'laptops' && p.badge !== 'HOT') return false;
          } else if (selectedCategory === 'simple') {
            if (p.category === 'luxury') return false;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
          } else if (selectedCategory === 'delivery') {
            if (!p.eligibleFor20MinDelivery && p.category !== 'delivery' && p.category !== 'grocery' && p.category !== 'food_delivery') return false;
          } else if (selectedCategory === 'jewellery' || selectedCategory === 'watches') {
            if (p.category !== 'jewellery' && p.category !== 'watches') return false;
          } else if (selectedCategory === 'grocery' || selectedCategory === 'gourmet' || selectedCategory === 'kirana') {
            if (p.category !== 'grocery' && p.category !== 'gourmet' && p.category !== 'kirana') return false;
          } else if (selectedCategory === 'food_delivery' || selectedCategory === 'food') {
            if (p.category !== 'food_delivery' && p.category !== 'food') return false;
          } else {
            if (p.category !== selectedCategory) return false;
          }
        }

<<<<<<< HEAD
        // Quick Delivery Only Filter
        if (quickDeliveryOnly && !p.quickDelivery) {
          return false;
        }

=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        // Search Query Filter
        if (internalQuery.trim()) {
          const q = internalQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
          const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
          const matchSub = p.subCategory ? p.subCategory.toLowerCase().includes(q) : false;
          const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
<<<<<<< HEAD
          const matchShop = p.sellerShopName ? p.sellerShopName.toLowerCase().includes(q) : false;
          if (!matchName && !matchBrand && !matchCat && !matchSub && !matchDesc && !matchShop) return false;
=======
          if (!matchName && !matchBrand && !matchCat && !matchSub && !matchDesc) return false;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        }

        return true;
      })
      .sort((a, b) => {
<<<<<<< HEAD
        if (sortBy === 'nearest') return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'discount') {
          const discA = a.mrp > a.price ? Math.round(((a.mrp - a.price) / a.mrp) * 100) : 0;
          const discB = b.mrp > b.price ? Math.round(((b.mrp - b.price) / b.mrp) * 100) : 0;
          return discB - discA;
        }
        if (sortBy === 'newest') return b.id - a.id;
        return 0; // Default relevance
      });
  }, [
    products,
    selectedCategory,
    internalQuery,
<<<<<<< HEAD
    sortBy,
    quickDeliveryOnly
=======
    sortBy
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  ]);

  return (
    <div
      id="dedicated-search-page"
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        isLightMode ? 'bg-[#FAF8F5] text-neutral-900' : 'bg-[#060B18] text-white'
      }`}
    >
      {/* 1. Sub-Header Navigation & Discovery Control Ribbon */}
      <div
        className={`border-b transition-colors ${
          isLightMode
            ? 'bg-white/80 border-[#EADFC9]'
            : 'bg-[#0A0F24]/80 border-[#162744]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
          {/* Desktop Top Row: Back button & Breadcrumbs & Quick Stats */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  id="search-page-back-btn"
                  onClick={onBack}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 border cursor-pointer ${
                    isLightMode
                      ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-300 hover:border-amber-500'
                      : 'bg-[#0B1B32] hover:bg-[#122644] text-neutral-200 border-[#162744] hover:border-amber-400'
                  }`}
                  title="Return to Home"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-amber-500" />
                  <span>Back to Home</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
                <span>Alike Catalog</span>
                <ChevronRight className="w-3 h-3 text-neutral-500" />
                <span className="font-bold text-amber-500">
                  {internalQuery ? `Search: "${internalQuery}"` : selectedCategory === 'all' ? 'All Collections' : selectedCategory}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                  {filteredProducts.length} items
                </span>
              </div>
            </div>

            {/* Right side controls: Reset Search */}
            {(internalQuery || selectedCategory !== 'all') && (
              <div className="flex items-center gap-2">
                <button
                  id="search-page-reset-all-top-btn"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-amber-500 hover:bg-amber-500/10 font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Search</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Search Bar (Rendered only on mobile where top header search is hidden) */}
          <div className="md:hidden relative flex items-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4 text-amber-500" />
            </div>
            <input
              ref={searchInputRef}
              id="dedicated-search-page-mobile-input"
              type="text"
              value={internalQuery}
              onChange={(e) => {
                setInternalQuery(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuerySubmit(internalQuery);
                }
              }}
              placeholder="Search luxury products, watches, attire..."
              className={`w-full py-2 pl-9 pr-16 rounded-full text-xs font-medium outline-none border transition-all ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-300 focus:border-amber-500 text-neutral-900 placeholder-neutral-400'
                  : 'bg-[#070D1F] border-[#1A2D50] focus:border-amber-400 text-white placeholder-neutral-500'
              }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {internalQuery && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="p-1 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleQuerySubmit(internalQuery)}
                className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-[10px] font-black uppercase tracking-wider hover:bg-neutral-800"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Search Page Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">

        {/* 3. Product Results Area */}
        <main className="w-full space-y-4">
          
          {/* Results Header Bar: Count + Active Filter Tags + Sort + Layout toggles */}
          <div
            className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
            }`}
          >
            {/* Left: Results Count & Active Query Tag */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-extrabold text-sm">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Creation' : 'Creations'}
              </span>
              {internalQuery && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold flex items-center gap-1">
                  "{internalQuery}"
                  <button type="button" onClick={handleClearQuery} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold capitalize">
                  {selectedCategory}
                </span>
              )}
            </div>

<<<<<<< HEAD
            {/* Right: Quick Delivery Filter + Sort Dropdown + View Toggle (Grid / List) */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Quick Delivery Only Toggle */}
              <button
                id="search-quick-delivery-filter-btn"
                type="button"
                onClick={() => setQuickDeliveryOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  quickDeliveryOnly
                    ? 'bg-amber-400 text-black border-amber-300 shadow-sm'
                    : isLightMode
                    ? 'bg-white border-neutral-300 text-neutral-700 hover:border-amber-500'
                    : 'bg-[#0B1B32] border-[#162744] text-amber-400 hover:border-amber-400'
                }`}
              >
                <span>⚡ Quick Delivery only</span>
              </button>

=======
            {/* Right: Sort Dropdown + View Toggle (Grid / List) */}
            <div className="flex items-center gap-2.5">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
                <select
                  id="search-page-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                    isLightMode
                      ? 'bg-white border-neutral-300 text-neutral-800 focus:border-amber-500'
                      : 'bg-[#0B1B32] border-[#162744] text-white focus:border-amber-400'
                  }`}
                >
                  <option value="relevance">Sort: Relevance</option>
<<<<<<< HEAD
                  <option value="nearest">Sort by: Nearest</option>
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className={`flex items-center p-0.5 rounded-xl border ${
                isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-[#0B1B32] border-[#162744]'
              }`}>
                <button
                  id="search-view-grid-btn"
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    isGridView
                      ? 'bg-amber-500 text-[#0A0F24] shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  id="search-view-list-btn"
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    !isGridView
                      ? 'bg-amber-500 text-[#0A0F24] shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-white'
                  }`}
                  title="Detailed List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Cards Container */}
          {filteredProducts.length > 0 ? (
            isGridView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={(p) => onAddToCart(p, 1)}
                      onToggleWishlist={onToggleWishlist}
                      onSelectProduct={onSelectProduct}
                      onCompare={onCompare}
                      onQuickView={onQuickView}
                      isWishlisted={wishlistedIds.includes(product.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Detailed List View */
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const isWish = wishlistedIds.includes(product.id);
                    const disc = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => onSelectProduct(product)}
                        className={`p-4 rounded-2xl border transition-all hover:scale-[1.008] duration-200 cursor-pointer flex flex-col sm:flex-row items-center gap-5 group ${
                          isLightMode
                            ? 'bg-white border-[#EADFC9] hover:border-amber-400 shadow-xs'
                            : 'bg-[#0A0F24] border-[#162744] hover:border-amber-500 shadow-md'
                        }`}
                      >
                        {/* Image */}
                        <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative group/thumb">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          {disc > 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-[#0A0F24] font-black text-[10px] uppercase">
                              {disc}% OFF
                            </span>
                          )}
                          <div className={`absolute top-2 right-2 z-10 ${isWish ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover/thumb:opacity-100'} transition-opacity`}>
                            <FavoriteButton
                              id={`wishlist-btn-thumb-${product.id}`}
                              isLiked={isWish}
                              onToggle={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(product);
                              }}
                              title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            />
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">
                              {product.brand}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{product.rating.toFixed(1)}</span>
                              <span className="text-neutral-400 text-[10px]">({product.reviewsCount})</span>
                            </div>
                          </div>

                          <h4 className="font-bold text-sm sm:text-base leading-snug group-hover:text-amber-500 transition-colors">
                            {product.name}
                          </h4>

                          <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {product.description || 'Exclusive boutique selection with certified authenticity and luxury packaging.'}
                          </p>

                          {/* Price & Actions */}
                          <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono font-extrabold text-base sm:text-lg text-amber-500">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {product.mrp > product.price && (
                                <span className="text-xs text-neutral-400 line-through">
                                  ₹{product.mrp.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                id={`wishlist-btn-${product.id}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleWishlist(product);
                                }}
                                className={`p-2 rounded-xl border transition-all active:scale-90 cursor-pointer product-action-btn ${
                                  isWish
                                    ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
                                    : isLightMode
                                    ? 'border-neutral-200 text-neutral-600 hover:text-red-500 hover:border-red-300'
                                    : 'border-[#162744] text-neutral-400 hover:text-red-400 hover:border-red-500/40'
                                }`}
                                title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              >
                                <Heart className={`w-4 h-4 transition-transform ${isWish ? 'fill-red-500 text-red-500 hover:text-red-600 animate-heart-pop' : ''}`} />
                              </button>

                              {onQuickView && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickView(product);
                                  }}
                                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                    isLightMode ? 'border-neutral-200 hover:bg-neutral-100' : 'border-[#162744] hover:bg-[#122644]'
                                  }`}
                                  title="Quick View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(product, 1);
                                }}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-[#0A0F24] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add to Bag
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* Zero Results Modern State */
              <div
                className={`p-12 text-center rounded-3xl border space-y-4 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold">No Luxury Pieces Found</h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    We could not find any items matching "{internalQuery || selectedCategory}". Try searching with different keywords or browse our curated categories above.
                  </p>
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0F24] font-extrabold text-xs uppercase tracking-wider shadow-md hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }
