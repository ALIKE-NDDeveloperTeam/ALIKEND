import React, { useEffect, useMemo, useState } from 'react';
import {
  Store,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Search,
  ShoppingBag,
  Tag,
  Truck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Product } from '../types';

interface PublicSellerStoreProps {
  sellerId: string;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onBack: () => void;
  showToast?: (msg: string) => void;
}

export const PublicSellerStore: React.FC<PublicSellerStoreProps> = ({
  sellerId,
  allProducts,
  onSelectProduct,
  onAddToCart,
  onBack,
  showToast,
}) => {
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any | null>(null);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [activeSection, setActiveSection] = useState<'products' | 'policies' | 'reviews'>('products');

  useEffect(() => {
    let active = true;
    const fetchStore = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/sellers/public/store/${encodeURIComponent(sellerId)}`);
        if (res.ok) {
          const data = await res.json();
          if (active && data?.store) {
            setStoreData(data.store);
            setStoreProducts(Array.isArray(data.products) ? data.products : []);
            if (data.store.seoMetaTitle) {
              document.title = data.store.seoMetaTitle;
            }
          }
        } else {
          // Fallback from client products if seller is seeded
          const fallbackProds = allProducts.filter(
            (p) =>
              String(p.sellerId) === String(sellerId) ||
              String(p.sellerShopName || '').toLowerCase() === String(sellerId).toLowerCase()
          );
          if (active && fallbackProds.length > 0) {
            const first = fallbackProds[0];
            setStoreData({
              _id: sellerId,
              shopName: first.sellerShopName || 'ALIKE-ND Partner Storefront',
              category: first.category || 'Luxury & Lifestyle',
              shopDescription: `Official ${first.sellerShopName || 'Partner'} collection on ALIKE-ND Marketplace.`,
              verifiedBadge: Boolean(first.sellerVerified),
              isOpen: true,
              businessHours: '10:00 AM – 09:00 PM IST',
              storePolicy: '100% Authentic Merchandise • 7-Day Quality Assurance & Easy Returns',
              avgRating: 4.8,
              totalReviews: fallbackProds.length * 4,
              coupons: [],
              bundleOffers: [],
            });
            setStoreProducts(fallbackProds);
          }
        }
      } catch {
        // Ignore network errors
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStore();
    return () => {
      active = false;
    };
  }, [sellerId, allProducts]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    storeProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['all', ...Array.from(set)];
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    let list = [...storeProducts];
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price_asc') list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortBy === 'price_desc') list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    if (sortBy === 'rating') list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return list;
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  const storeReviews = useMemo(() => {
    const list: Array<{ productName: string; review: any }> = [];
    storeProducts.forEach((p: any) => {
      if (Array.isArray(p.reviews)) {
        p.reviews.forEach((r: any) => {
          list.push({ productName: p.name, review: r });
        });
      }
    });
    return list;
  }, [storeProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-white flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#F5A623] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Loading Official Storefront...</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-[#070B14] text-white flex flex-col items-center justify-center p-8">
        <Store className="w-12 h-12 text-[#F5A623] mb-3" />
        <h1 className="text-xl font-serif">Storefront Not Found</h1>
        <p className="text-xs text-slate-400 mt-1 mb-6">
          This seller storefront may be unavailable or temporarily offline.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[#F5A623] text-black text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white pb-20">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-[#F5A623] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>
        <div className="text-[11px] text-slate-400">
          Official Seller Storefront · <span className="text-[#F5A623] font-semibold">{storeData.shopName}</span>
        </div>
      </div>

      {/* Store Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D1322]">
          <div className="h-48 sm:h-64 w-full relative bg-gradient-to-r from-[#090F20] via-[#131E38] to-[#1D1528]">
            {storeData.bannerUrl && (
              <img
                src={storeData.bannerUrl}
                alt={storeData.shopName}
                className="w-full h-full object-cover opacity-55"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090F20] via-[#090F20]/50 to-transparent" />
          </div>

          <div className="p-6 sm:p-8 -mt-16 sm:-mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#090F20] border-2 border-[#F5A623] overflow-hidden flex items-center justify-center shadow-2xl shrink-0">
                {storeData.logoUrl ? (
                  <img src={storeData.logoUrl} alt={storeData.shopName} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-10 h-10 text-[#F5A623]" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{storeData.shopName}</h1>
                  {storeData.verifiedBadge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Seller
                    </span>
                  )}
                  {!storeData.isOpen && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" /> Temporarily Closed / Holiday Mode
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl">{storeData.shopDescription}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {storeData.avgRating || '4.8'} Store Rating (
                    {storeData.totalReviews || 0} reviews)
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {storeData.businessHours}
                  </span>
                  {storeData.shopAddress && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {storeData.shopAddress}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                <div className="text-lg font-bold text-white">{storeProducts.length}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Active Listings</div>
              </div>
              {storeData.freeShippingThreshold > 0 && (
                <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Truck className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">Free Shipping</div>
                    <div className="text-[10px] text-emerald-200/80">
                      Orders above ₹{Number(storeData.freeShippingThreshold).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Store Coupons & Bundle Deals Strip */}
          {((Array.isArray(storeData.coupons) && storeData.coupons.length > 0) ||
            (Array.isArray(storeData.bundleOffers) && storeData.bundleOffers.length > 0)) && (
            <div className="px-6 sm:px-8 py-4 bg-white/[0.02] border-t border-white/10 flex flex-wrap items-center gap-3">
              <span className="text-[11px] uppercase tracking-wider text-[#F5A623] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Store Vouchers & Bundle Deals:
              </span>
              {Array.isArray(storeData.coupons) &&
                storeData.coupons.map((c: any) => (
                  <button
                    key={c.id || c.code}
                    onClick={() => {
                      navigator.clipboard?.writeText(c.code);
                      showToast?.(`Copied voucher code: ${c.code}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/40 text-amber-200 text-xs flex items-center gap-2 hover:bg-[#F5A623]/25 transition-colors cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span className="font-mono font-bold text-white">{c.code}</span>
                    <span>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                    </span>
                    {c.minOrderAmount > 0 && (
                      <span className="text-[10px] text-amber-300/80">(Min ₹{c.minOrderAmount})</span>
                    )}
                  </button>
                ))}
              {Array.isArray(storeData.bundleOffers) &&
                storeData.bundleOffers.map((b: any) => (
                  <span
                    key={b.id}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-medium"
                  >
                    {b.title}: Buy {b.minQuantity}+ items & save {b.discountPercent}%
                  </span>
                ))}
            </div>
          )}

          {/* Store Navigation Tabs */}
          <div className="px-6 sm:px-8 border-t border-white/10 flex items-center gap-6">
            {[
              { id: 'products', label: `All Products (${storeProducts.length})` },
              { id: 'reviews', label: `Store & Product Reviews (${storeReviews.length})` },
              { id: 'policies', label: 'Store Info & Policies' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSection(t.id as any)}
                className={`py-3.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeSection === t.id
                    ? 'border-[#F5A623] text-[#F5A623]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        {activeSection === 'products' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0D1322] border border-white/10 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#F5A623] text-black font-semibold'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in this store..."
                    className="pl-8 pr-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#F5A623]"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-black/40 border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#F5A623]"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#0D1322] border border-white/10 rounded-2xl p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-300">No matching products in this store.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="group bg-[#0D1322] border border-white/10 rounded-2xl overflow-hidden hover:border-[#F5A623]/50 transition-all flex flex-col"
                  >
                    <div
                      onClick={() => onSelectProduct(product)}
                      className="aspect-square w-full bg-black/40 overflow-hidden cursor-pointer relative"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#F5A623] text-black text-[10px] font-bold uppercase tracking-wider rounded">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          {product.category} · ★ {product.rating || '4.8'}
                        </div>
                        <h3
                          onClick={() => onSelectProduct(product)}
                          className="text-sm font-semibold text-white mt-1 line-clamp-2 cursor-pointer hover:text-[#F5A623]"
                        >
                          {product.name}
                        </h3>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-base font-bold text-[#F5A623]">
                            ₹{Number(product.price || 0).toLocaleString('en-IN')}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-[10px] text-slate-500 line-through">
                              ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onAddToCart(product, 1)}
                          disabled={product.inStock === false || !storeData.isOpen}
                          className="px-3 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#e09612] disabled:opacity-40 text-black text-xs font-bold cursor-pointer"
                        >
                          {product.inStock === false ? 'Sold Out' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="bg-[#0D1322] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Verified Customer Reviews & Seller Responses</h2>
            {storeReviews.length === 0 ? (
              <p className="text-xs text-slate-400 py-6">
                No customer reviews posted yet for this storefront&apos;s products.
              </p>
            ) : (
              <div className="space-y-3">
                {storeReviews.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {item.review.userName || item.review.user || 'Verified Buyer'} ·{' '}
                        <span className="text-[#F5A623]">{item.productName}</span>
                      </span>
                      <span className="text-amber-400 font-semibold">★ {item.review.rating || 5}/5</span>
                    </div>
                    <p className="text-xs text-slate-300">{item.review.comment}</p>
                    {item.review.sellerReply && (
                      <div className="pl-3 border-l-2 border-[#F5A623] bg-[#F5A623]/5 p-2.5 rounded-r-lg text-xs">
                        <div className="text-[10px] uppercase tracking-wider text-[#F5A623] font-bold">
                          Official Seller Response
                        </div>
                        <p className="text-slate-200 mt-0.5">{item.review.sellerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'policies' && (
          <div className="bg-[#0D1322] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Store Policies, Authenticity & Fulfillment</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Return & Quality Policy
                </div>
                <p className="text-slate-200 leading-relaxed">{storeData.storePolicy}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                <div className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                  Operating Hours & Dispatch
                </div>
                <p className="text-slate-200">Business Hours: {storeData.businessHours}</p>
                <p className="text-slate-400 flex items-center gap-1.5 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified by ALIKE-ND Marketplace Governance
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicSellerStore;
