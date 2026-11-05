import { useState, useMemo } from 'react';
import { SlidersHorizontal, Grid, List, ChevronRight, ArrowLeft, Zap, Sparkles, Heart, Users, X } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import FavoriteButton from '../components/FavoriteButton';

// Categories where "Who is it for" audience filter is functionally meaningful
export const AUDIENCE_FILTER_CATEGORIES = ['fashion', 'jewellery', 'beauty'] as const;

export const AUDIENCE_OPTIONS = [
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'boys', label: 'Boys' },
  { id: 'girls', label: 'Girls' },
  { id: 'kids', label: 'Kids' },
  { id: 'unisex', label: 'Unisex' },
] as const;

export const getProductAudience = (p: Product): string => {
  if (p.audience) return p.audience.toLowerCase().trim();
  const lowerText = `${p.name} ${p.description || ''} ${p.brand || ''}`.toLowerCase();
  if (/\b(women|woman|ladies|female|gown|saree|lehenga|skirt|heels|bra|necklace)\b/i.test(lowerText)) return 'women';
  if (/\b(men|man|gentlemen|male|suit|tuxedo|blazer|shaving|beard)\b/i.test(lowerText)) return 'men';
  if (/\b(boy|boys)\b/i.test(lowerText)) return 'boys';
  if (/\b(girl|girls)\b/i.test(lowerText)) return 'girls';
  if (/\b(kid|kids|child|children|toddler|baby|infant)\b/i.test(lowerText)) return 'kids';
  return 'unisex';
};

export const checkAudienceMatch = (productAudience: string, selectedAudiences: string[]): boolean => {
  if (selectedAudiences.length === 0) return true;
  return selectedAudiences.some((sel) => {
    if (productAudience === sel) return true;
    if (sel === 'kids' && (productAudience === 'boys' || productAudience === 'girls')) return true;
    return false;
  });
};

interface CategorySearchProps {
  products: Product[];
  initialCategory?: string;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  wishlistedIds: number[];
  searchQuery?: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onBack?: () => void;
  isLightMode?: boolean;
}

export default function CategorySearch({
  products,
  initialCategory = 'all',
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  wishlistedIds,
  searchQuery = '',
  showToast,
  onBack,
  isLightMode = false,
}: CategorySearchProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isGridView, setIsGridView] = useState<boolean>(true);

  // Check if current category qualifies for audience/gender filtering
  const isAudienceFilterApplicable = useMemo(() => {
    return AUDIENCE_FILTER_CATEGORIES.includes(selectedCategory as any);
  }, [selectedCategory]);

  // Category selection handler
  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubCategory('all');
    setSelectedAudiences([]);
  };

  const handleToggleAudience = (audienceId: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(audienceId)
        ? prev.filter((a) => a !== audienceId)
        : [...prev, audienceId]
    );
  };

  const currentCategoryObj = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategory);
  }, [selectedCategory]);

  const subCategories = currentCategoryObj?.subCategories || [];
  const is20MinEligibleCategory = currentCategoryObj?.eligibleFor20MinDelivery || selectedCategory === 'delivery';

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    setSelectedAudiences([]);
    setSortBy('relevance');
    showToast('Category and audience filters reset.', 'info');
  };

  // Filter products in memory
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category Filter
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'wholesale') {
            if (!p.isWholesale) return false;
          } else if (selectedCategory === 'luxury') {
            if (p.category !== 'luxury') return false;
          } else if (selectedCategory === 'vip' || selectedCategory === 'premium') {
            if (p.category !== 'vip' && p.category !== 'electronics' && p.category !== 'mobiles' && p.category !== 'laptops' && p.badge !== 'HOT') return false;
          } else if (selectedCategory === 'simple') {
            if (p.category === 'luxury') return false;
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

        // Sub-category Filter
        if (selectedSubCategory !== 'all') {
          if (p.subCategory !== selectedSubCategory) return false;
        }

        // Audience / Demographic Filter (only applied on designated wearable/personal categories)
        if (isAudienceFilterApplicable && selectedAudiences.length > 0) {
          const prodAudience = getProductAudience(p);
          if (!checkAudienceMatch(prodAudience, selectedAudiences)) {
            return false;
          }
        }

        // Search Query Filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
          const matchCat = p.category ? p.category.toLowerCase().includes(q) : false;
          const matchSub = p.subCategory ? p.subCategory.toLowerCase().includes(q) : false;
          if (!matchName && !matchBrand && !matchCat && !matchSub) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return b.id - a.id; // simulation
        return 0; // relevance
      });
  }, [products, selectedCategory, selectedSubCategory, isAudienceFilterApplicable, selectedAudiences, searchQuery, sortBy]);

  const renderAudienceFilterContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#F5A623]" />
          <h3 className={`text-xs font-black uppercase tracking-wider ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
            Who is it for?
          </h3>
        </div>
        {selectedAudiences.length > 0 && (
          <button
            type="button"
            id="clear-audience-sidebar-btn"
            onClick={() => setSelectedAudiences([])}
            className="text-[11px] text-[#F5A623] hover:text-amber-500 font-bold cursor-pointer flex items-center gap-1 transition-colors"
            title="Clear audience filters"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear ({selectedAudiences.length})</span>
          </button>
        )}
      </div>

      <div className="space-y-2">
        {AUDIENCE_OPTIONS.map((opt) => {
          const isChecked = selectedAudiences.includes(opt.id);
          const count = products.filter((p) => {
            if (selectedCategory !== 'all') {
              if (selectedCategory === 'wholesale' && !p.isWholesale) return false;
              if (p.category !== selectedCategory) return false;
            }
            if (selectedSubCategory !== 'all' && p.subCategory !== selectedSubCategory) return false;
            const aud = getProductAudience(p);
            return checkAudienceMatch(aud, [opt.id]);
          }).length;

          return (
            <button
              key={opt.id}
              type="button"
              id={`audience-btn-${opt.id}`}
              onClick={() => handleToggleAudience(opt.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs transition-all duration-200 cursor-pointer active:scale-98 select-none ${
                isChecked
                  ? 'bg-[#F5A623] text-black border-[#F5A623] shadow-xs font-extrabold'
                  : isLightMode
                  ? 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 font-semibold'
                  : 'bg-neutral-900/80 text-neutral-300 border-neutral-800 hover:border-neutral-700 hover:text-white font-semibold'
              }`}
              title={`Filter by ${opt.label}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isChecked ? 'bg-black scale-110 shadow-xs' : 'bg-neutral-400/40'
                  }`}
                />
                <span className="tracking-wide">{opt.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition-colors ${
                  isChecked
                    ? 'bg-black/20 text-black font-black'
                    : isLightMode
                    ? 'bg-neutral-100 text-neutral-500 font-medium'
                    : 'bg-neutral-800 text-neutral-400 font-medium'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div id="category-search-root" className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumbs with Back button */}
      <div className="flex items-center gap-4 pb-6">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 border border-solid border-neutral-800 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 hover:bg-neutral-850 transition-all duration-200 active:scale-95 flex items-center justify-center cursor-pointer shrink-0 shadow-sm"
            title="Go Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <span className="hover:text-white cursor-pointer" onClick={() => handleCategorySelect('all')}>Alike Marketplace</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
          <span className="text-white uppercase tracking-wider font-semibold">
            {CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All Items'}
          </span>
          {searchQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-neutral-400 italic">Searched: "{searchQuery}"</span>
            </>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className={`flex flex-col ${isAudienceFilterApplicable ? 'lg:flex-row gap-6 items-start' : ''}`}>
          {/* Desktop Left Sidebar: Only rendered for Fashion, Jewellery, Beauty */}
          {isAudienceFilterApplicable && (
            <aside className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-24">
              <div className={`p-4 rounded-2xl border transition-all ${
                isLightMode
                  ? 'bg-white border-[#EADFC9] shadow-sm'
                  : 'bg-neutral-900/90 border-neutral-800 shadow-xl backdrop-blur-md'
              }`}>
                {renderAudienceFilterContent()}
              </div>
            </aside>
          )}

          {/* Main: Search Results / Sorting & Grid list */}
          <section className="flex-1 min-w-0 w-full space-y-6">
          {/* Fast Delivery Express Banner */}
          {is20MinEligibleCategory && (
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md ${
              isLightMode
                ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-amber-300 text-amber-950'
                : 'bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-amber-900/20 border-amber-500/40 text-amber-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-xs">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm uppercase tracking-wide">
                      ⚡ Fast Speed Delivery Available
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-600 text-white">
                      Express
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isLightMode ? 'text-amber-900/80' : 'text-amber-300/80'}`}>
                    Items in this category qualify for rapid doorstep dispatch with fast delivery.
                  </p>
                </div>
              </div>
              <div className="text-[11px] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Courier Tracking</span>
              </div>
            </div>
          )}

          {/* Sub-categories horizontal pill bar if available */}
          {subCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isLightMode ? 'text-neutral-700' : 'text-neutral-300'}`}>
                  Browse by Sub-Category ({subCategories.length})
                </span>
                {selectedSubCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedSubCategory('all')}
                    className="text-xs text-amber-500 hover:underline font-semibold cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  onClick={() => setSelectedSubCategory('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedSubCategory === 'all'
                      ? 'bg-[#F5A623] text-black border-[#F5A623] shadow-xs'
                      : isLightMode
                        ? 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  All ({filteredProducts.length})
                </button>
                {subCategories.map((sub) => {
                  const count = products.filter(
                    (p) =>
                      (selectedCategory === 'all' ||
                        p.category === selectedCategory ||
                        (selectedCategory === 'delivery' && p.eligibleFor20MinDelivery) ||
                        (selectedCategory === 'grocery' && (p.category === 'grocery' || p.category === 'kirana')) ||
                        (selectedCategory === 'food_delivery' && (p.category === 'food_delivery' || p.category === 'food'))) &&
                      p.subCategory === sub
                  ).length;
                  const isSelected = selectedSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(isSelected ? 'all' : sub)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#F5A623] text-black border-[#F5A623] shadow-xs font-bold'
                          : isLightMode
                            ? 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-300'
                            : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {sub} {count > 0 && <span className="opacity-70 ml-1 text-[10px]">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`p-4 border rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] shadow-sm' 
              : 'bg-neutral-900 border-neutral-850'
          }`}>
            <div className="space-y-1">
              <h2 className={`text-md sm:text-lg font-bold uppercase tracking-wide ${
                isLightMode ? 'text-neutral-900' : 'text-white'
              }`}>
                Showing {filteredProducts.length} Luxury Item{filteredProducts.length !== 1 ? 's' : ''}
              </h2>
              <p className={`text-xs ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Curated specifically according to strict client preferences</p>
            </div>

            {/* Sorting and view option toggles */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile "Audience Filter" trigger button (only visible on mobile if audience filter is applicable) */}
              {isAudienceFilterApplicable && (
                <button
                  id="open-audience-filters-mobile"
                  type="button"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className={`lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-2xs cursor-pointer transition-all active:scale-95 ${
                    selectedAudiences.length > 0
                      ? 'bg-[#F5A623] text-black border-[#F5A623]'
                      : isLightMode
                      ? 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400'
                      : 'bg-[#0B1B32] text-neutral-100 border-[#162744] hover:border-[#F5A623]/40'
                  }`}
                  title="Filter by Audience"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Audience</span>
                  {selectedAudiences.length > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black text-[#F5A623] text-[9px] font-black">
                      {selectedAudiences.length}
                    </span>
                  )}
                </button>
              )}

              <div className="relative">
                <select
                  id="sort-select-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold appearance-none pr-9 cursor-pointer transition-all border shadow-2xs focus:outline-none ${
                    isLightMode
                      ? 'bg-white text-neutral-900 border-neutral-300 hover:border-neutral-400 focus:border-[#F5A623]'
                      : 'bg-[#0B1B32] text-neutral-100 border-[#162744] hover:border-[#F5A623]/40 focus:border-[#F5A623]'
                  }`}
                  title="Sort Order"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: Highest Elite</option>
                  <option value="newest">Catalog: New Arrival</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#F5A623]">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Grid / List controls */}
              <div className={`flex p-1 rounded-xl border shadow-2xs items-center ${
                isLightMode
                  ? 'bg-neutral-100 border-neutral-300'
                  : 'bg-[#0B1B32] border-[#162744]'
              }`}>
                <button
                  id="toggle-grid-view"
                  onClick={() => setIsGridView(true)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    isGridView 
                      ? isLightMode
                        ? 'bg-white text-[#B48C28] shadow-xs font-bold'
                        : 'bg-[#F5A623]/20 text-[#F5A623] shadow-xs font-bold border border-[#F5A623]/40'
                      : isLightMode
                        ? 'text-neutral-500 hover:text-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Grid visual layout"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  id="toggle-list-view"
                  onClick={() => setIsGridView(false)}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                    !isGridView 
                      ? isLightMode
                        ? 'bg-white text-[#B48C28] shadow-xs font-bold'
                        : 'bg-[#F5A623]/20 text-[#F5A623] shadow-xs font-bold border border-[#F5A623]/40'
                      : isLightMode
                        ? 'text-neutral-500 hover:text-neutral-800'
                        : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="List details layout"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Audience Filter Badges with Quick 'X' Remove */}
          {isAudienceFilterApplicable && selectedAudiences.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Audience:
              </span>
              {selectedAudiences.map((audId) => {
                const opt = AUDIENCE_OPTIONS.find((o) => o.id === audId);
                return (
                  <button
                    key={audId}
                    type="button"
                    onClick={() => handleToggleAudience(audId)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F5A623] text-black shadow-2xs hover:brightness-95 transition-all cursor-pointer group active:scale-95"
                    title={`Remove ${opt?.label || audId} filter`}
                  >
                    <span>{opt?.label || audId}</span>
                    <X className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                  </button>
                );
              })}
              <button
                type="button"
                id="clear-audience-bar-btn"
                onClick={() => setSelectedAudiences([])}
                className="inline-flex items-center gap-1 text-xs text-[#F5A623] hover:underline font-bold ml-1 cursor-pointer"
                title="Clear all audience filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Audience ({selectedAudiences.length})</span>
              </button>
            </div>
          )}

          {/* Empty Search Fallback */}
          {filteredProducts.length === 0 ? (
            <div id="empty-search-state" className={`p-12 sm:p-16 border border-dashed rounded-3xl text-center space-y-4 ${
              isLightMode ? 'border-neutral-300 bg-neutral-50/50' : 'border-neutral-800 bg-neutral-900/30'
            }`}>
              <span className={`inline-flex p-5 rounded-full border ${
                isLightMode ? 'bg-white border-neutral-200 text-[#F5A623]' : 'bg-neutral-950 border-neutral-800 text-[#F5A623]'
              }`}>
                <SlidersHorizontal className="w-8.5 h-8.5" />
              </span>
              <div className="space-y-1">
                <h3 className={`text-lg font-bold ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                  {selectedAudiences.length > 0
                    ? 'No Items Found For Selected Audience'
                    : 'No Matching Luxury Items Found'}
                </h3>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {selectedAudiences.length > 0
                    ? `No products match the selected audience (${selectedAudiences
                        .map((a) => AUDIENCE_OPTIONS.find((o) => o.id === a)?.label || a)
                        .join(', ')}). You can clear this audience filter to view all products in this collection.`
                    : 'We could not locate items meeting these parameters. Try clearing the search query or selecting another collection.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {selectedAudiences.length > 0 && (
                  <button
                    id="clear-audience-filter-empty-btn"
                    type="button"
                    onClick={() => setSelectedAudiences([])}
                    className="px-5 py-2.5 bg-[#F5A623] hover:brightness-110 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Audience Filter ({selectedAudiences.length})</span>
                  </button>
                )}
                <button
                  id="reset-filters-empty"
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          ) : (
            /* Products display based on layout view */
            <div
              id="marketplace-products-list"
              className={
                isGridView
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 items-stretch'
                  : 'space-y-4'
              }
            >
              {filteredProducts.map((p) => {
                const isWishlisted = wishlistedIds.includes(p.id);
                if (isGridView) {
                  return (
                    <ProductCard
                      key={p.id}
                      product={p}
                      className="w-full"
                      onAddToCart={onAddToCart}
                      onToggleWishlist={onToggleWishlist}
                      onSelectProduct={onSelectProduct}
                      onCompare={onCompare}
                      onQuickView={onQuickView}
                      isWishlisted={isWishlisted}
                    />
                  );
                } else {
                  // Interactive List view
                  const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);
                  return (
                    <div
                      key={p.id}
                      id={`list-item-${p.id}`}
                      className={`group p-4 border rounded-2xl flex flex-col sm:flex-row gap-5 transition-all duration-300 hover:shadow-md cursor-pointer ${
                        isLightMode 
                          ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]' 
                          : 'bg-neutral-900 border-neutral-850 hover:border-[#F5A623]/50'
                      }`}
                      onClick={() => onSelectProduct(p)}
                    >
                      <div className={`w-full sm:w-40 aspect-square rounded-xl overflow-hidden cursor-pointer shrink-0 relative group/thumb ${
                        isLightMode ? 'bg-neutral-100' : 'bg-neutral-950'
                      }`}>
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
                        <div className={`absolute top-2 right-2 z-10 ${isWishlisted ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover/thumb:opacity-100'} transition-opacity`}>
                          <FavoriteButton
                            id={`wishlist-btn-thumb-${p.id}`}
                            isLiked={isWishlisted}
                            onToggle={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(p);
                            }}
                            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[10px] text-[#B48C28] dark:text-[#F5A623] font-mono tracking-widest font-extrabold block uppercase">{p.brand}</span>
                              <h3 className={`text-md font-bold mt-0.5 leading-tight transition-colors ${
                                isLightMode ? 'text-neutral-900 group-hover:text-amber-800' : 'text-white group-hover:text-[#F5A623]'
                              }`}>{p.name}</h3>
                            </div>
                            <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-md">
                              {discountPercent}% OFF
                            </span>
                          </div>
                          <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                            isLightMode ? 'text-neutral-600' : 'text-neutral-400'
                          }`}>
                            {p.description}
                          </p>
                        </div>
                        <div className="flex items-end justify-between mt-4">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-lg font-black ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>₹{p.price.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-neutral-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              id={`wishlist-btn-${p.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist(p);
                              }}
                              className={`p-2 rounded-xl border transition-all active:scale-90 cursor-pointer product-action-btn ${
                                isWishlisted
                                  ? 'bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20'
                                  : isLightMode
                                  ? 'border-neutral-200 text-neutral-600 hover:text-red-500 hover:border-red-300'
                                  : 'border-[#162744] text-neutral-400 hover:text-red-400 hover:border-red-500/40'
                              }`}
                              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            >
                              <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-red-500 text-red-500 hover:text-red-600 animate-heart-pop' : ''}`} />
                            </button>
                            <button
                              id={`list-btn-add-${p.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(p);
                              }}
                              className="px-4.5 py-2 bg-gradient-to-r from-[#FF1990] to-[#FF007F] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
          </section>
        </div>
      </div>

      {/* Mobile Audience Filter Drawer (Sheet) */}
      {isAudienceFilterApplicable && isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className={`relative z-10 w-full max-h-[85vh] rounded-t-3xl border-t p-6 overflow-y-auto animate-slide-up shadow-2xl ${
            isLightMode
              ? 'bg-[#FAF9F6] border-[#EADFC9] text-neutral-900'
              : 'bg-[#070D1E] border-white/10 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#FF007F]" />
                <h2 className="text-sm font-black uppercase tracking-wider">Refine By Audience</h2>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderAudienceFilterContent()}

            <div className="pt-5 mt-5 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              {selectedAudiences.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedAudiences([])}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition-all cursor-pointer text-center"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#FF1990] to-[#FF007F] text-white text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer text-center"
              >
                Show {filteredProducts.length} Result{filteredProducts.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
