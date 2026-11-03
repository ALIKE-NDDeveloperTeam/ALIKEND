import { ArrowLeft, Heart, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import GlassIconButton from '../components/GlassIconButton';

interface WishlistPageProps {
  wishlist: Product[];
  onRemoveWishlistItem: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onNavigate: (view: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function WishlistPage({
  wishlist,
  onRemoveWishlistItem,
  onAddToCart,
  onSelectProduct,
  onNavigate,
  onBack,
  showBackButton = true,
  showToast: _showToast,
  isLightMode = false,
}: WishlistPageProps) {
  return (
    <div
      id="wishlist-page-root"
      className={`min-h-screen pb-24 transition-colors duration-300 ${
        isLightMode ? 'bg-[#FAF8F5] text-neutral-900' : 'bg-[#060B18] text-white'
      }`}
    >
      {/* 1. Sub-Header Navigation Ribbon with Conditional Back */}
      <div
        className={`border-b transition-colors ${
          isLightMode
            ? 'bg-white/80 border-[#EADFC9]'
            : 'bg-[#0A0F24]/80 border-[#162744]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Back button & Breadcrumbs */}
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                id="wishlist-back-btn"
                type="button"
                onClick={onBack}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 border cursor-pointer ${
                  isLightMode
                    ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-[#EADFC9] hover:border-[#F5A623] hover:text-[#0F1A3C]'
                    : 'bg-[#0B1B32] hover:bg-[#122644] text-neutral-200 border-[#162744] hover:border-[#F5A623] hover:text-[#F5A623]'
                }`}
                title="Go Back"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>← Back</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-xs">
              <span className={`font-semibold ${isLightMode ? 'text-neutral-500' : 'text-neutral-400'}`}>Alike ND</span>
              <span className="text-neutral-400">&gt;</span>
              <span className="font-bold text-[#F5A623]">Saved Wishlist</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono font-bold">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
              <span>My Saved Wishlist</span>
            </h1>
            <p className={`text-xs mt-1 ${isLightMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Your personally curated collection of saved products. Items remain saved here across your browsing sessions.
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div
            id="wishlist-empty-state"
            className={`text-center py-20 px-4 rounded-3xl border border-dashed ${
              isLightMode
                ? 'bg-white border-[#EADFC9] text-neutral-600'
                : 'bg-[#0B1B32]/40 border-[#162744] text-neutral-400'
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className={`text-base font-bold mb-1 ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
              Your Wishlist is Empty
            </h2>
            <p className="text-xs max-w-md mx-auto mb-6">
              You haven't saved any items yet. Click the heart icon on any product card or details page to add it to your wishlist.
            </p>
            <button
              type="button"
              id="wishlist-browse-catalog-btn"
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#F5A623] hover:bg-[#D48806] text-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Products</span>
            </button>
          </div>
        ) : (
          <div
            id="wishlist-products-grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {wishlist.map((p) => {
              const discountPercent = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
              return (
                <div
                  key={p.id}
                  id={`wishlist-card-${p.id}`}
                  className={`group rounded-2xl p-3 border relative transition-all duration-200 flex flex-col justify-between hover:shadow-lg ${
                    isLightMode
                      ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]'
                      : 'bg-[#0B1B32] border-[#162744] hover:border-[#F5A623]'
                  }`}
                >
                  {/* Remove Button */}
                  <GlassIconButton
                    id={`wishlist-remove-btn-${p.id}`}
                    icon={Trash2}
                    onClick={() => onRemoveWishlistItem(p)}
                    variant="danger"
                    size="sm"
                    className="absolute top-3 right-3 z-10"
                    title="Remove from wishlist"
                    aria-label="Remove from wishlist"
                    isLightMode={isLightMode}
                  />

                  {/* Product Image */}
                  <div
                    className="aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden cursor-pointer relative mb-3"
                    onClick={() => onSelectProduct(p)}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      {p.brand && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5A623]">
                          {p.brand}
                        </span>
                      )}
                      <h3
                        onClick={() => onSelectProduct(p)}
                        className={`text-xs font-bold line-clamp-2 cursor-pointer transition-colors ${
                          isLightMode ? 'text-neutral-900 hover:text-[#B48C28]' : 'text-white hover:text-[#F5A623]'
                        }`}
                        title={p.name}
                      >
                        {p.name}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className={`font-black text-sm ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.mrp > p.price && (
                          <span className="text-[11px] line-through text-neutral-400">
                            ₹{p.mrp.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        id={`wishlist-add-to-bag-${p.id}`}
                        onClick={() => onAddToCart(p)}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer bg-[#F5A623] hover:bg-[#D48806] text-black shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
