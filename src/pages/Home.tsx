import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Tv,
  Smartphone,
  Laptop,
  Shirt,
  Gem,
  ShoppingBag,
  Gamepad2,
  Wrench,
  Sparkles,
  Armchair,
  Diamond,
  PackageOpen,
  LayoutGrid,
  Crown,
  Boxes,
  ShoppingBasket,
  Utensils,
  Sofa,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  Check,
  Download,
  Tag,
  Flame,
<<<<<<< HEAD
  Store,
  Edit,
  Trash2,
  Plus
=======
  Store
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
} from 'lucide-react';
import { Product, Job, Testimonial, Banner } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import AllCategoriesModal from '../components/AllCategoriesModal';
import HeroBanners from '../components/HeroBanners';
import FlashCountdown from '../components/FlashCountdown';
import CategoryCarousel from '../components/CategoryCarousel';
<<<<<<< HEAD
import { NearbySellersSection } from '../components/home/NearbySellersSection';
import { useAdminEdit } from '../context/AdminEditContext';
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

// High-fidelity fallback photographic images for categories if no product is listed yet
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  luxury: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&fm=webp',
  vip: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400&fm=webp',
  delivery: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=400&fm=webp',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&fm=webp',
  food_delivery: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400&fm=webp',
  wholesale: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400&fm=webp',
  electronics: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&fm=webp',
  mobiles: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&fm=webp',
  laptops: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&fm=webp',
  fashion: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400&fm=webp',
  jewellery: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400&fm=webp',
  gaming: 'https://images.unsplash.com/photo-1612287233219-c90a18413a96?auto=format&fit=crop&q=80&w=400&fm=webp',
  hardware: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400&fm=webp',
  beauty: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400&fm=webp',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400&fm=webp',
};

interface HomeProps {
  products: Product[];
  jobs: Job[];
  testimonials: Testimonial[];
  onSelectProduct: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onNavigate: (view: string, filter?: string) => void;
  wishlistedIds: number[];
  onCompare: (p: Product) => void;
  onQuickView: (p: Product) => void;
  isLightMode?: boolean;
}

// Fallback modern WebP banner assets in case network is pending
const DEFAULT_HERO_BANNERS: Banner[] = [
  {
    _id: "default-1",
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Luxury Atelier Collection",
    subtitle: "NEW ARRIVALS",
    description: "Curated premium fashion, accessories, and bespoke luxury goods.",
    buttonText: "Shop Collection",
    link: "category_search",
    order: 1,
    active: true,
  },
  {
    _id: "default-2",
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Global Express Logistics",
    subtitle: "FAST COURIER",
    description: "Worldwide white-glove logistics directly to your doorstep.",
    buttonText: "Explore Now",
    link: "category_search",
    order: 2,
    active: true,
  },
  {
    _id: "default-3",
    imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80",
    title: "B2B Wholesale Procurement",
    subtitle: "DIRECT FROM SOURCE",
    description: "Bulk pricing advantages with escrow payment protection.",
    buttonText: "Join Wholesale",
    link: "category_search",
    order: 3,
    active: true,
  },
  {
    _id: "default-4",
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Haute Couture Lookbook",
    subtitle: "EXCLUSIVE ACCESS",
    description: "Discover signature collections designed by celebrated master couturiers.",
    buttonText: "View Lookbook",
    link: "category_search",
    order: 4,
    active: true,
  },
];

interface CategoryDealCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView: (p: Product) => void;
  isWishlisted: boolean;
}

export function CategoryDealCard({
  product,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  isWishlisted,
}: CategoryDealCardProps) {
  return (
    <ProductCard
      product={product}
      onAddToCart={onAddToCart}
      onToggleWishlist={onToggleWishlist}
      onSelectProduct={onSelectProduct}
      onCompare={onCompare}
      onQuickView={onQuickView}
      isWishlisted={isWishlisted}
    />
  );
}

interface CategoryMeta {
  emoji: string;
  titlePrefix: string;
  titleAccent: string;
  subtitle: string;
  exploreText: string;
}

const CATEGORY_META_MAP: Record<string, CategoryMeta> = {
  luxury: {
    emoji: '✨',
    titlePrefix: 'Selected',
    titleAccent: 'Luxury Goods',
    subtitle: 'Our crown elite catalog with masterclass platinum grades',
    exploreText: 'Explore Luxury',
  },
  delivery: {
    emoji: '⚡',
    titlePrefix: 'Express',
    titleAccent: 'Fast Delivery',
    subtitle: 'Direct door-to-door expedited delivery within 20 minutes',
    exploreText: 'Explore Fast Delivery',
  },
  grocery: {
    emoji: '🌿',
    titlePrefix: 'Fresh Organic',
    titleAccent: 'Grocery & Kirana',
    subtitle: 'Farm-pure staples, cold-pressed oils, and daily kitchen provisions',
    exploreText: 'Explore Grocery',
  },
  food_delivery: {
    emoji: '🍽️',
    titlePrefix: 'Gourmet Kitchen',
    titleAccent: 'Food Delivery',
    subtitle: 'Artisanal chef feasts, wood-fired pizzas, and fragrant royal delicacies',
    exploreText: 'Explore Food',
  },
  wholesale: {
    emoji: '📦',
    titlePrefix: 'Wholesale',
    titleAccent: 'Bulk Catalog',
    subtitle: 'High volume bulk purchasing straight from atelier factories',
    exploreText: 'Explore Wholesale',
  },
  electronics: {
    emoji: '🎧',
    titlePrefix: 'Next-Gen',
    titleAccent: 'Electronics & Audio',
    subtitle: 'Acoustic precision, gold-plated components, and smart ambient innovations',
    exploreText: 'Explore Electronics',
  },
  mobiles: {
    emoji: '📱',
    titlePrefix: 'Flagship',
    titleAccent: 'Mobiles & Devices',
    subtitle: 'Grade-5 titanium builds, computational optics, and flagship performance',
    exploreText: 'Explore Mobiles',
  },
  laptops: {
    emoji: '💻',
    titlePrefix: 'Performance',
    titleAccent: 'Laptops & Computing',
    subtitle: 'Studio-grade workstations and lightweight powerhouses engineered for creators',
    exploreText: 'Explore Laptops',
  },
  fashion: {
    emoji: '👗',
    titlePrefix: 'Haute Couture',
    titleAccent: 'Fashion & Apparel',
    subtitle: 'Hand-stitched mulberry silk, bespoke tailoring, and evening statement collections',
    exploreText: 'Explore Fashion',
  },
  jewellery: {
    emoji: '💎',
    titlePrefix: 'Artisan Fine',
    titleAccent: 'Jewellery & Gems',
    subtitle: '18-karat gold dipped chains, conflict-free stones, and timeless heirloom adornments',
    exploreText: 'Explore Jewellery',
  },
  gaming: {
    emoji: '🎮',
    titlePrefix: 'Pro Tier',
    titleAccent: 'Gaming & Esports',
    subtitle: 'Ultra-low-latency peripherals, mechanical key switches, and tactical combat gear',
    exploreText: 'Explore Gaming',
  },
  hardware: {
    emoji: '🛠️',
    titlePrefix: 'Industrial Precision',
    titleAccent: 'Hardware & Tools',
    subtitle: 'Chrome-vanadium toolkits, workshop essentials, and masterclass trade equipment',
    exploreText: 'Explore Hardware',
  },
  beauty: {
    emoji: '✨',
    titlePrefix: 'Prestige Radiance',
    titleAccent: 'Beauty & Wellness',
    subtitle: '24k micro gold extracts, botanical serums, and therapeutic fragrances',
    exploreText: 'Explore Beauty',
  },
  furniture: {
    emoji: '🛋️',
    titlePrefix: 'Curated Living',
    titleAccent: 'Furniture & Decor',
    subtitle: 'Velvet ottoman upholstery, brass metallic accents, and refined interior architecture',
    exploreText: 'Explore Furniture',
  },
};

interface CategorySectionProps {
  category: { id: string; label: string; icon?: string };
  products: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView: (p: Product) => void;
  wishlistedIds: number[];
  onNavigate: (view: string, filter?: string) => void;
  isLightMode?: boolean;
}

export function CategorySection({
  category,
  products,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  wishlistedIds,
  onNavigate,
  isLightMode,
}: CategorySectionProps) {
  if (!products || products.length === 0) return null;

  const meta = CATEGORY_META_MAP[category.id] || {
    emoji: '✨',
    titlePrefix: 'Curated',
    titleAccent: category.label,
    subtitle: `Verified premier quality and exclusive collections in ${category.label}`,
    exploreText: `Explore ${category.label}`,
  };

  return (
<<<<<<< HEAD
    <section id={`category-section-${category.id}`} className="max-w-7xl mx-auto px-3 sm:px-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="min-w-0">
          <h3 className={`text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight truncate ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
            {meta.emoji} {meta.titlePrefix} <span className="text-[#F5A623]">{meta.titleAccent}</span>
          </h3>
          <p className={`text-[11px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-1 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>
=======
    <section id={`category-section-${category.id}`} className="max-w-7xl mx-auto px-6 space-y-6">
      <div className="flex justify-between items-end border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
        <div>
          <h3 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
            {meta.emoji} {meta.titlePrefix} <span className="text-[#F5A623]">{meta.titleAccent}</span>
          </h3>
          <p className={`text-xs mt-1 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            {meta.subtitle}
          </p>
        </div>
        <button
          id={`view-all-${category.id}`}
          onClick={() => onNavigate('category_search', category.id)}
<<<<<<< HEAD
          className="self-start sm:self-auto shrink-0 text-[11px] sm:text-xs text-[#F5A623] hover:text-amber-600 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-300 hover:translate-x-1 active:scale-95 cursor-pointer"
        >
          {meta.exploreText} <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5A623]" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 items-stretch">
=======
          className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-300 hover:translate-x-1.5 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {meta.exploreText} <ChevronRight className="w-4 h-4 text-[#F5A623]" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        {products.slice(0, 5).map((p) => {
          const isWishlisted = wishlistedIds.includes(p.id);
          return (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onSelectProduct={onSelectProduct}
              onCompare={onCompare}
              onQuickView={onQuickView}
              isWishlisted={isWishlisted}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function Home({
  products,
  jobs,
  testimonials,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  onNavigate,
  wishlistedIds,
  onCompare,
  onQuickView,
  isLightMode,
}: HomeProps) {
<<<<<<< HEAD
  // Admin Edit Live Website Context
  const {
    isAdmin,
    isEditMode,
    openEditAd,
    openDeleteAd,
    openCreateAd,
    openFlashSaleModal,
    refreshTrigger,
  } = useAdminEdit();

  // Dynamic Hero Banners State (hydrated immediately from localStorage cache for 0ms reload)
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const cached = localStorage.getItem('alike_cache_banners');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_HERO_BANNERS;
  });

  // Dynamic Advertisements State (hydrated immediately from localStorage cache)
  const [advertisements, setAdvertisements] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('alike_cache_ads');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
=======
  // Dynamic Hero Banners State
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_HERO_BANNERS);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  // Fetch active banners dynamically from backend
  useEffect(() => {
    let isMounted = true;
<<<<<<< HEAD
    const url = isAdmin && isEditMode ? '/api/admin/banners' : '/api/banners';
    const token = localStorage.getItem('alikend_admin_token') || sessionStorage.getItem('alikend_admin_token');
    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
=======
    fetch("/api/banners")
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBanners(data);
<<<<<<< HEAD
          try {
            localStorage.setItem('alike_cache_banners', JSON.stringify(data));
          } catch {}
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        }
      })
      .catch((err) => console.warn("Failed to fetch dynamic banners:", err));

    return () => {
      isMounted = false;
    };
<<<<<<< HEAD
  }, [refreshTrigger, isAdmin, isEditMode]);

  // Fetch active advertisements dynamically from backend
  useEffect(() => {
    let isMounted = true;
    const url = isAdmin && isEditMode ? '/api/admin/advertisements/all' : '/api/advertisements';
    const token = localStorage.getItem('alikend_admin_token') || sessionStorage.getItem('alikend_admin_token');
    fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAdvertisements(data);
          try {
            localStorage.setItem('alike_cache_ads', JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => console.warn("Failed to fetch advertisements:", err));

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger, isAdmin, isEditMode]);
=======
  }, []);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  const activeBanners = useMemo(() => {
    const activeList = banners.filter((b) => b.active);
    return activeList.length > 0 ? activeList : DEFAULT_HERO_BANNERS;
  }, [banners]);

  // Left Banner Image Index State
  const [leftImageIndex, setLeftImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Keep index within bounds if activeBanners length changes
  useEffect(() => {
    if (leftImageIndex >= activeBanners.length) {
      setLeftImageIndex(0);
    }
  }, [activeBanners.length, leftImageIndex]);

  const handleBannerTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleBannerTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setLeftImageIndex((prev) => (prev + 1) % activeBanners.length);
    } else if (diff < -40) {
      setLeftImageIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  // Flash Sale Timer State (24 hours standard initial)
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60);

  // VIP Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

<<<<<<< HEAD
  // All categories full modal view state
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] = useState(false);
  const [selectedNearbySeller, setSelectedNearbySeller] = useState<{ id: string; shopName: string } | null>(null);
=======
  // Browse Categories interactive scroll & drag state
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(true);
  const [isCatInteracting, setIsCatInteracting] = useState(false);
  const [isDraggingCategory, setIsDraggingCategory] = useState(false);
  const categoryDragStartXRef = useRef(0);
  const categoryDragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const touchStartXRef = useRef(0);
  const touchHasMovedRef = useRef(false);
  const autoScrollResumeTimerRef = useRef<any>(null);

  const updateCategoryScrollButtons = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollCatLeft(el.scrollLeft > 10);
    setCanScrollCatRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const handleCategoryScroll = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    // Seamless -50% duplicated track infinite wrap during manual scrolling
    if (halfWidth > 0) {
      if (el.scrollLeft >= halfWidth * 1.5) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 5 && (isCatInteracting || isDraggingCategory)) {
        el.scrollLeft += halfWidth;
      }
    }
    updateCategoryScrollButtons();
  };

  const handleScrollCategory = (direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setIsCatInteracting(true);
    clearTimeout(autoScrollResumeTimerRef.current);
    autoScrollResumeTimerRef.current = setTimeout(() => setIsCatInteracting(false), 3500);

    const scrollAmount = Math.max(260, Math.floor(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    updateCategoryScrollButtons();
    window.addEventListener('resize', updateCategoryScrollButtons);
    return () => window.removeEventListener('resize', updateCategoryScrollButtons);
  }, []);

  // Desktop horizontal wheel scrolling (allows standard mouse wheel to scroll horizontally)
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If user is scrolling mouse wheel vertically over category carousel
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canLeft = el.scrollLeft > 0 && e.deltaY < 0;
        const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
        if (canLeft || canRight) {
          e.preventDefault();
          setIsCatInteracting(true);
          clearTimeout(autoScrollResumeTimerRef.current);
          autoScrollResumeTimerRef.current = setTimeout(() => setIsCatInteracting(false), 2500);
          el.scrollLeft += e.deltaY * 0.95;
          updateCategoryScrollButtons();
        }
      } else if (Math.abs(e.deltaX) > 0) {
        setIsCatInteracting(true);
        clearTimeout(autoScrollResumeTimerRef.current);
        autoScrollResumeTimerRef.current = setTimeout(() => setIsCatInteracting(false), 2500);
        updateCategoryScrollButtons();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Window-level mouse move & mouse up during drag to ensure buttery smooth dragging without losing tracking
  useEffect(() => {
    if (!isDraggingCategory) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = categoryScrollRef.current;
      if (!el) return;
      const walk = (e.pageX - categoryDragStartXRef.current) * 1.5;
      if (Math.abs(walk) > 5) {
        hasDraggedRef.current = true;
      }
      el.scrollLeft = categoryDragStartScrollLeftRef.current - walk;
      updateCategoryScrollButtons();
    };

    const handleMouseUp = () => {
      setIsDraggingCategory(false);
      clearTimeout(autoScrollResumeTimerRef.current);
      autoScrollResumeTimerRef.current = setTimeout(() => setIsCatInteracting(false), 2000);
      // Keep hasDragged true briefly so the subsequent click on the card is blocked
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCategory]);

  // Gentle auto-drift when completely idle that yields 100% to user scroll/touch/drag
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isCatInteracting && !isDraggingCategory && el) {
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0) {
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
          el.scrollLeft += 24 * delta; // Smooth, continuous cinematic marquee drift
        }
        updateCategoryScrollButtons();
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(autoScrollResumeTimerRef.current);
    };
  }, [isCatInteracting, isDraggingCategory]);

  // All categories full modal view state
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] = useState(false);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  useEffect(() => {
    if (activeBanners.length <= 1) return;

    const leftInterval = setInterval(() => {
      setLeftImageIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(leftInterval);
  }, [activeBanners.length]);

  // Dynamic Flash Sale State synced with Admin Panel
  const [flashConfig, setFlashConfig] = useState<{
    title: string;
    subtitle: string;
    bannerText: string;
    targetEndTime: string | Date;
  }>({
    title: "FLASH PREMIUM HOURS",
    subtitle: "Uncompromised pricing on luxury gear",
    bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
    targetEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
<<<<<<< HEAD
  const [dynamicFlashProducts, setDynamicFlashProducts] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('alike_cache_flash_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
=======
  const [dynamicFlashProducts, setDynamicFlashProducts] = useState<Product[]>([]);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  useEffect(() => {
    fetch('/api/flash-sale')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.config) {
          setFlashConfig(data.config);
          if (Array.isArray(data.products) && data.products.length > 0) {
            setDynamicFlashProducts(data.products);
<<<<<<< HEAD
            try {
              localStorage.setItem('alike_cache_flash_products', JSON.stringify(data.products));
            } catch {}
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
          }
        }
      })
      .catch((err) => console.warn('Could not load flash sale config:', err));
<<<<<<< HEAD
  }, [refreshTrigger]);
=======
  }, []);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      hours: h.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      seconds: s.toString().padStart(2, '0')
    };
  };

  const timer = formatTime(timeLeft);

  // Filters for Homepage displays (5 products in a line on PC)
  const isFlash = (p: Product) => p.badge === 'SALE' || p.isFlashSale === true;
  const activeFlashCatalog = dynamicFlashProducts.length > 0 ? dynamicFlashProducts : products.filter(isFlash);
  const flashSaleProducts = (activeFlashCatalog.length >= 5 
    ? activeFlashCatalog 
    : [...activeFlashCatalog, ...products.filter(p => !isFlash(p))]).slice(0, 5);

  const featuredProducts = (products.filter(p => p.category === 'luxury' || p.badge === 'HOT').length >= 5
    ? products.filter(p => p.category === 'luxury' || p.badge === 'HOT')
    : products).slice(0, 5);

  const wholesaleProducts = (products.filter(p => p.isWholesale).length >= 5
    ? products.filter(p => p.isWholesale)
    : [...products.filter(p => p.isWholesale), ...products.filter(p => !p.isWholesale)]).slice(0, 5);

  // Filter products by category adhering to the existing standard codebase filtering logic
  const filterProductsByCategory = (catId: string): Product[] => {
    return products.filter((p) => {
      if (catId === 'all') return true;
      if (catId === 'wholesale') return !!p.isWholesale;
      if (catId === 'luxury') return p.category === 'luxury';
      if (catId === 'delivery') {
        return !!p.eligibleFor20MinDelivery || p.category === 'delivery' || p.category === 'grocery' || p.category === 'food_delivery';
      }
      if (catId === 'grocery') return p.category === 'grocery' || p.category === 'kirana';
      if (catId === 'food_delivery') return p.category === 'food_delivery' || p.category === 'food';
      return p.category === catId;
    });
  };

  // Group categories with non-empty product lists
  const categoryDealsList = useMemo(() => {
    return CATEGORIES
      .filter((cat) => cat.id !== 'all')
      .map((cat) => ({
        category: cat,
        products: filterProductsByCategory(cat.id),
      }))
      .filter((item) => item.products.length > 0);
  }, [products]);

  const getCategoryTheme = (catId: string) => {
    switch (catId) {
      case 'luxury':
        return {
          gradient: 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(245,158,11,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(245,158,11,0.55)]',
          glow: 'bg-amber-400/30',
          border: 'border-amber-300/40',
        };
      case 'vip':
        return {
          gradient: 'bg-gradient-to-br from-purple-400 via-violet-600 to-indigo-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(139,92,246,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(139,92,246,0.55)]',
          glow: 'bg-purple-500/30',
          border: 'border-purple-300/40',
        };
      case 'delivery':
        return {
          gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(249,115,22,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(249,115,22,0.55)]',
          glow: 'bg-orange-500/30',
          border: 'border-orange-300/40',
        };
      case 'wholesale':
        return {
          gradient: 'bg-gradient-to-br from-blue-400 via-indigo-600 to-slate-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(79,70,229,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(79,70,229,0.55)]',
          glow: 'bg-indigo-500/30',
          border: 'border-indigo-300/40',
        };
      case 'electronics':
        return {
          gradient: 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(14,165,233,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(14,165,233,0.55)]',
          glow: 'bg-cyan-400/30',
          border: 'border-cyan-300/40',
        };
      case 'mobiles':
        return {
          gradient: 'bg-gradient-to-br from-violet-400 via-purple-600 to-indigo-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(147,51,234,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(147,51,234,0.55)]',
          glow: 'bg-purple-400/30',
          border: 'border-purple-300/40',
        };
      case 'laptops':
        return {
          gradient: 'bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(37,99,235,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(37,99,235,0.55)]',
          glow: 'bg-sky-400/30',
          border: 'border-sky-300/40',
        };
      case 'fashion':
        return {
          gradient: 'bg-gradient-to-br from-rose-400 via-pink-600 to-rose-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(225,29,72,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(225,29,72,0.55)]',
          glow: 'bg-rose-400/30',
          border: 'border-rose-300/40',
        };
      case 'jewellery':
        return {
          gradient: 'bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(234,179,8,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(234,179,8,0.55)]',
          glow: 'bg-yellow-400/30',
          border: 'border-yellow-300/40',
        };
      case 'gaming':
        return {
          gradient: 'bg-gradient-to-br from-fuchsia-400 via-purple-600 to-indigo-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(192,38,211,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(192,38,211,0.55)]',
          glow: 'bg-fuchsia-400/30',
          border: 'border-fuchsia-300/40',
        };
      case 'hardware':
        return {
          gradient: 'bg-gradient-to-br from-orange-400 via-amber-600 to-orange-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(234,88,12,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(234,88,12,0.55)]',
          glow: 'bg-orange-400/30',
          border: 'border-orange-300/40',
        };
      case 'beauty':
        return {
          gradient: 'bg-gradient-to-br from-pink-400 via-rose-500 to-purple-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(219,39,119,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(219,39,119,0.55)]',
          glow: 'bg-pink-400/30',
          border: 'border-pink-300/40',
        };
      case 'furniture':
        return {
          gradient: 'bg-gradient-to-br from-emerald-400 via-teal-600 to-slate-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(13,148,136,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(13,148,136,0.55)]',
          glow: 'bg-teal-400/30',
          border: 'border-teal-300/40',
        };
      case 'grocery':
        return {
          gradient: 'bg-gradient-to-br from-emerald-400 via-green-600 to-teal-800',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(5,150,105,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(5,150,105,0.55)]',
          glow: 'bg-emerald-400/30',
          border: 'border-emerald-300/40',
        };
      case 'food_delivery':
        return {
          gradient: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-600',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(234,88,12,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(234,88,12,0.55)]',
          glow: 'bg-orange-400/30',
          border: 'border-orange-300/40',
        };
      default:
        return {
          gradient: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700',
          shadow: 'shadow-[0_10px_20px_-3px_rgba(245,158,11,0.4)]',
          hoverShadow: 'group-hover/card:shadow-[0_14px_28px_-3px_rgba(245,158,11,0.55)]',
          glow: 'bg-amber-400/30',
          border: 'border-amber-300/40',
        };
    }
  };

  const getCategoryIcon = (iconName: string, className = "w-5 h-5", strokeWidth = 2.4) => {
    const iconProps = { className, strokeWidth };
    switch (iconName) {
      case 'Crown': return <Crown {...iconProps} />;
      case 'Boxes': return <Boxes {...iconProps} />;
      case 'Tv': return <Tv {...iconProps} />;
      case 'Smartphone': return <Smartphone {...iconProps} />;
      case 'Laptop': return <Laptop {...iconProps} />;
      case 'Shirt': return <Shirt {...iconProps} />;
      case 'Gem': return <Gem {...iconProps} />;
      case 'ShoppingBasket': return <ShoppingBasket {...iconProps} />;
      case 'Utensils': return <Utensils {...iconProps} />;
      case 'Gamepad2': return <Gamepad2 {...iconProps} />;
      case 'Wrench': return <Wrench {...iconProps} />;
      case 'Sparkles': return <Sparkles {...iconProps} />;
      case 'Sofa': return <Sofa {...iconProps} />;
      case 'Zap': return <Zap {...iconProps} />;
      default: return <LayoutGrid {...iconProps} />;
    }
  };

  return (
<<<<<<< HEAD
    <div id="homepage-root" className="space-y-8 sm:space-y-12 pb-12 sm:pb-16">
      {/* Hero Banner & Categories Carousel: Grouped with tighter 16-20px spacing */}
      <div id="hero-and-categories-group" className="space-y-3 sm:space-y-5">
=======
    <div id="homepage-root" className="space-y-12 pb-16">
      {/* Hero Banner & Categories Carousel: Grouped with tighter 16-20px spacing */}
      <div id="hero-and-categories-group" className="space-y-4 sm:space-y-5">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        {/* 1. Interactive 3-Banner Carousel Section */}
        <HeroBanners
          banners={activeBanners}
          onNavigate={onNavigate}
          isLightMode={isLightMode}
        />

        {/* 2. Interactive Category Carousel */}
        <CategoryCarousel
          onNavigate={onNavigate}
          isLightMode={isLightMode}
          onOpenAllCategories={() => setIsAllCategoriesModalOpen(true)}
        />
      </div>

<<<<<<< HEAD
      {/* 3. Top Banner Features & Dynamic Advertisements */}
      {(() => {
        const displayAds =
          isAdmin && isEditMode
            ? advertisements
            : advertisements.filter((a) => a.active !== false && a.isActive !== false);
        if (displayAds.length === 0 && !(isAdmin && isEditMode)) return null;
        return (
          <section className="w-full max-w-7xl mx-auto px-4 sm:px-6">
            {isAdmin && isEditMode && (
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={openCreateAd}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  title="Add new advertisement creative to homepage"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Advertisement Card (Live Admin)</span>
                </button>
              </div>
            )}

            {displayAds.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {displayAds.map((ad, idx) => (
                  <div
                    key={ad._id || ad.id || idx}
                    onClick={() => {
                      if (ad.destinationUrl) {
                        if (ad.destinationUrl.startsWith('category_search:')) {
                          onNavigate('category_search', ad.destinationUrl.split(':')[1]);
                        } else if (ad.destinationUrl.startsWith('/')) {
                          onNavigate(ad.destinationUrl.replace('/', ''));
                        } else {
                          onNavigate('category_search', ad.destinationUrl);
                        }
                      }
                    }}
                    className={`relative cursor-pointer group flex items-start gap-4 p-5 sm:p-6 backdrop-blur-md border border-solid rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${
                      isLightMode
                        ? 'bg-white border-neutral-200 hover:border-[#FF007F] hover:shadow-[0_4px_20px_rgba(255,0,127,0.15)] text-neutral-900'
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-[#FF007F]/80 hover:shadow-[0_0_20px_rgba(255,0,127,0.18)] text-white'
                    }`}
                  >
                    {/* Admin Editing Controls Overlay */}
                    {isAdmin && isEditMode && (
                      <div
                        className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1 bg-neutral-950/90 border border-[#FF007F]/40 rounded-xl shadow-lg backdrop-blur-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(ad.active === false || ad.isActive === false) && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-600 text-white uppercase tracking-wider">
                            INACTIVE
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditAd(ad);
                          }}
                          className="p-1 rounded text-[#FF007F] hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                          title="Edit Advertisement Card"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteAd(ad);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete Advertisement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-14 h-14 rounded-xl object-cover border border-[#FF007F]/30 shrink-0"
                      />
                    ) : (
                      <div className="p-3.5 bg-[#FF007F]/10 text-[#FF007F] rounded-xl group-hover:scale-105 group-hover:bg-[#FF007F] group-hover:text-white transition-all duration-300 shrink-0">
                        {idx % 2 === 0 ? <Gem className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {ad.tagline && (
                        <span className="text-[9px] uppercase tracking-widest font-black text-[#FF007F] block font-mono">
                          {ad.tagline}
                        </span>
                      )}
                      <h4
                        className={`font-bold text-sm sm:text-base group-hover:text-[#FF007F] transition-all ${
                          isLightMode ? 'text-neutral-900' : 'text-white'
                        }`}
                      >
                        {ad.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                        {ad.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })()}

      {/* 4. Flash Sale Section (With Real-Time Countdown & Dynamic Config) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <section className="p-3.5 sm:p-6 bg-[#E9E9E7] dark:bg-neutral-900 border border-solid border-[#FF007F]/40 rounded-2xl shadow-md text-[#0F1A3C] dark:text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-solid border-neutral-300/80 dark:border-neutral-800 pb-3.5 sm:pb-4 mb-4 sm:mb-6">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="p-2 rounded-xl bg-white dark:bg-[#0A1028] text-[#FF007F] border border-[#FF007F]/30 shadow-2xs shrink-0">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-[#FF007F] text-[#FF007F]" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h3 className="text-base sm:text-xl md:text-2xl font-black text-[#0F1A3C] dark:text-white tracking-wide uppercase">
                    {flashConfig.title}
                  </h3>
                  {flashConfig.bannerText && (
                    <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9.5px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] text-white shadow-[0_2px_10px_rgba(255,0,127,0.35)] border border-[#FF007F]/40 select-none">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-white shrink-0" />
                      <span className="font-extrabold truncate max-w-[200px] sm:max-w-none">{flashConfig.bannerText}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
                  {flashConfig.subtitle}
                </p>
              </div>
            </div>

            {/* Live Countdown timer & Admin Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {isAdmin && isEditMode && (
                <button
                  type="button"
                  onClick={openFlashSaleModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#FF1990] to-[#FF007F] hover:brightness-110 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  title="Manage Flash Deals, products, discounts, and countdown schedule"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Flash Deals</span>
                </button>
              )}
              <FlashCountdown targetEndTime={flashConfig.targetEndTime} />
            </div>
          </div>

          {/* Dynamic products in grid (2 on mobile, 5 in a row on PC) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4 items-stretch">
            {flashSaleProducts.map((p) => {
              const isWishlisted = wishlistedIds.includes(p.id);
              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  onSelectProduct={onSelectProduct}
                  onCompare={onCompare}
                  onQuickView={onQuickView}
                  isWishlisted={isWishlisted}
                />
              );
            })}
          </div>
        </section>
      </div>
=======
      {/* 3. Top Banner Features (2 Service Cards) */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div
          onClick={() => onNavigate('category_search', 'jewellery')}
          className={`cursor-pointer group flex items-start gap-4 p-5 sm:p-6 backdrop-blur-md border border-solid rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] text-neutral-900'
              : 'bg-neutral-900/40 border-neutral-800 hover:border-[#D4AF37]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] text-white'
          }`}
        >
          <div className="p-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 shrink-0">
            <Gem className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`font-bold text-sm sm:text-base group-hover:text-[#D4AF37] transition-all ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              Jewellery & Watches
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Certified authentic jewels and precision artisan timepieces.
            </p>
          </div>
        </div>

        <div
          onClick={() => onNavigate('category_search', 'luxury')}
          className={`cursor-pointer group flex items-start gap-4 p-5 sm:p-6 backdrop-blur-md border border-solid rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-[#D4AF37] hover:shadow-[0_4px_20px_rgba(212,175,55,0.15)] text-neutral-900'
              : 'bg-neutral-900/40 border-neutral-800 hover:border-[#D4AF37]/80 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] text-white'
          }`}
        >
          <div className="p-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl group-hover:scale-105 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`font-bold text-sm sm:text-base group-hover:text-[#D4AF37] transition-all ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              Curated VIP Selection
            </h4>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
              Exclusive luxury edition items handpicked for distinguished clients.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Flash Sale Section (With Real-Time Countdown & Dynamic Config) */}
      <section className="max-w-7xl mx-auto px-6 p-6 bg-[#E9E9E7] dark:bg-neutral-900 border border-solid border-[#F5A623]/40 rounded-2xl shadow-md text-[#0F1A3C] dark:text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-solid border-neutral-300/80 dark:border-neutral-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white dark:bg-[#0A1028] text-[#F5A623] border border-[#F5A623]/30 shadow-2xs">
              <Zap className="w-6 h-6 fill-[#F5A623] text-[#F5A623]" />
            </span>
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <h3 className="text-xl md:text-2xl font-black text-[#0F1A3C] dark:text-white tracking-wide uppercase">
                  {flashConfig.title}
                </h3>
                {flashConfig.bannerText && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black tracking-wider uppercase bg-gradient-to-r from-amber-500 via-[#F5A623] to-[#D4AF37] text-white shadow-[0_2px_10px_rgba(245,166,35,0.35)] border border-amber-300/60 select-none">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-white shrink-0" />
                    <span className="font-extrabold">{flashConfig.bannerText}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
                {flashConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Golden Real-time Live Countdown timer */}
          <FlashCountdown targetEndTime={flashConfig.targetEndTime} />
        </div>

        {/* Dynamic products in grid (5 in a row on PC) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 items-stretch">
          {flashSaleProducts.map((p) => {
            const isWishlisted = wishlistedIds.includes(p.id);
            return (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onSelectProduct={onSelectProduct}
                onCompare={onCompare}
                onQuickView={onQuickView}
                isWishlisted={isWishlisted}
              />
            );
          })}
        </div>
      </section>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

      {/* 5. Dynamic Per-Category Showcase Sections (Rendered for all categories that have active products) */}
      {categoryDealsList.map(({ category, products: catProducts }) => {
        if (!catProducts || catProducts.length === 0) return null;
        return (
          <CategorySection
            key={category.id}
            category={category}
            products={catProducts}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            onSelectProduct={onSelectProduct}
            onCompare={onCompare}
            onQuickView={onQuickView}
            wishlistedIds={wishlistedIds}
            onNavigate={onNavigate}
            isLightMode={isLightMode}
          />
        );
      })}

      {/* 6. Alike Premium Jobs Preview */}
<<<<<<< HEAD
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <section className={`p-4 sm:p-6 md:p-8 rounded-2xl border border-solid ${
          isLightMode ? 'bg-white border-neutral-200 shadow-md' : 'bg-neutral-950 border-neutral-800'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4 mb-5 sm:mb-6">
            <div>
              <h3 className={`text-lg sm:text-xl md:text-2xl font-black flex items-center gap-2 ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
                <Briefcase className="w-5 h-5 text-[#F5A623]" /> Careers @ <span className="text-[#F5A623]">Alike-ND Group</span>
              </h3>
              <p className={`text-xs mt-0.5 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>
                Join one of India's fastest scaling hyper-local luxury delivery channels
              </p>
            </div>
            <button
              id="view-all-jobs"
              onClick={() => onNavigate('jobs')}
              className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline font-bold uppercase tracking-wider flex items-center gap-1 transition-all duration-300 hover:translate-x-1 active:scale-95 cursor-pointer"
            >
              Go to Careers Center <ChevronRight className="w-4 h-4 text-[#F5A623]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {jobs.slice(0, 2).map((job) => (
              <div
                key={job.id}
                onClick={() => onNavigate('jobs')}
                className={`group cursor-pointer p-4 sm:p-5 rounded-xl flex items-start gap-3.5 sm:gap-4 transition-all duration-300 border border-solid ${
                  isLightMode
                    ? 'bg-white border-neutral-200 hover:border-[#F5A623] hover:shadow-md'
                    : 'bg-neutral-900 border-neutral-800 hover:border-[#F5A623]'
                }`}
              >
                <img
                  src={job.logo}
                  alt={job.company}
                  loading="lazy"
                  decoding="async"
                  width="48"
                  height="48"
                  className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-950 border border-solid border-neutral-200 dark:border-neutral-800 shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[9px] uppercase tracking-wider text-[#0F1A3C] dark:text-neutral-300 rounded-full font-bold">
                    {job.type}
                  </span>
                  <h4 className={`text-sm font-bold transition-colors truncate ${
                    isLightMode ? 'text-[#0F1A3C] group-hover:text-[#F5A623]' : 'text-white group-hover:text-[#F5A623]'
                  }`}>
                    {job.title}
                  </h4>
                  <p className={`text-xs font-semibold ${isLightMode ? 'text-[#4B5563]' : 'text-neutral-400'}`}>{job.company}</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-[#6B7280] font-mono pt-1">
                    <span>📍 {job.location}</span>
                    <span>|</span>
                    <span className="text-[#F5A623] font-bold">💰 {job.salary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 9. Client Testimonials */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 space-y-5 sm:space-y-6">
        <div className="text-center border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4">
          <span className="text-[10px] uppercase tracking-widest font-mono font-extrabold text-[#F5A623]">Atelier Endorsements</span>
          <h3 className={`text-xl sm:text-2xl md:text-3xl font-extrabold mt-1 tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
=======
      <section className={`max-w-7xl mx-auto px-6 p-6 md:p-8 rounded-2xl border border-solid ${
        isLightMode ? 'bg-white border-neutral-200 shadow-md' : 'bg-neutral-950 border-neutral-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4 mb-6">
          <div>
            <h3 className={`text-xl md:text-2xl font-black flex items-center gap-2 ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
              <Briefcase className="w-5.5 h-5.5 text-[#F5A623]" /> Careers @ <span className="text-[#F5A623]">Alike-ND Group</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-400'}`}>
              Join one of India's fastest scaling hyper-local luxury delivery channels
            </p>
          </div>
          <button
            id="view-all-jobs"
            onClick={() => onNavigate('jobs')}
            className="text-xs text-[#F5A623] hover:text-amber-600 hover:underline font-bold uppercase tracking-wider flex items-center gap-1 transition-all duration-300 hover:translate-x-1 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Go to Careers Center <ChevronRight className="w-4 h-4 text-[#F5A623]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.slice(0, 2).map((job) => (
            <div
              key={job.id}
              onClick={() => onNavigate('jobs')}
              className={`group cursor-pointer p-5 rounded-xl flex items-start gap-4 transition-all duration-300 border border-solid ${
                isLightMode
                  ? 'bg-white border-neutral-200 hover:border-[#F5A623] hover:shadow-md'
                  : 'bg-neutral-900 border-neutral-800 hover:border-[#F5A623]'
              }`}
            >
              <img
                src={job.logo}
                alt={job.company}
                loading="lazy"
                decoding="async"
                width="48"
                height="48"
                className="w-12 h-12 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-950 border border-solid border-neutral-200 dark:border-neutral-800 shrink-0"
              />
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-[9px] uppercase tracking-wider text-[#0F1A3C] dark:text-neutral-300 rounded-full font-bold">
                  {job.type}
                </span>
                <h4 className={`text-sm font-bold transition-colors ${
                  isLightMode ? 'text-[#0F1A3C] group-hover:text-[#F5A623]' : 'text-white group-hover:text-[#F5A623]'
                }`}>
                  {job.title}
                </h4>
                <p className={`text-xs font-semibold ${isLightMode ? 'text-[#4B5563]' : 'text-neutral-400'}`}>{job.company}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-[#6B7280] font-mono pt-1">
                  <span>📍 {job.location}</span>
                  <span>|</span>
                  <span className="text-[#F5A623] font-bold">💰 {job.salary}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Client Testimonials */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="text-center border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4">
          <span className="text-[10px] uppercase tracking-widest font-mono font-extrabold text-[#F5A623]">Atelier Endorsements</span>
          <h3 className={`text-2xl md:text-3xl font-extrabold mt-1 tracking-tight ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            What Our <span className="text-[#F5A623]">Luxury Clients</span> Experience
          </h3>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className={`relative p-5 sm:p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 border border-solid ${
=======
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test) => (
            <div
              key={test.id}
              className={`relative p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 border border-solid ${
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                isLightMode
                  ? 'bg-white border-neutral-200 shadow-sm hover:border-[#F5A623]'
                  : 'bg-neutral-900/40 backdrop-blur-md border-neutral-800 hover:border-[#F5A623]/70'
              }`}
            >
              <span className="absolute top-5 right-5 text-neutral-300 dark:text-neutral-850">
                <Quote className="w-8 h-8 rotate-180" />
              </span>
              <div className="space-y-3">
                <div className="flex gap-0.5 text-[#F5A623]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className={`text-xs italic leading-relaxed ${isLightMode ? 'text-[#374151]' : 'text-neutral-300'}`}>
                  "{test.content}"
                </p>
              </div>
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-solid border-neutral-200 dark:border-neutral-800">
                <img
                  src={test.avatar}
                  alt={test.name}
                  loading="lazy"
                  decoding="async"
                  width="36"
                  height="36"
                  className="w-9 h-9 rounded-full object-cover border border-solid border-[#F5A623]"
                />
                <div>
                  <h5 className={`text-xs font-bold ${isLightMode ? 'text-[#0F1A3C]' : 'text-white'}`}>{test.name}</h5>
                  <p className={`text-[10px] ${isLightMode ? 'text-[#6B7280]' : 'text-neutral-500'}`}>{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. VIP Membership Section */}
<<<<<<< HEAD
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="p-5 sm:p-8 bg-[#0B1330] border border-solid border-[#F5A623]/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 relative overflow-hidden shadow-2xl text-white">
          <div className="space-y-1.5 z-10 text-center md:text-left">
            <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-widest block font-mono">VIP CLIENT MEMBERSHIP</span>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white">Unlock Exclusive Voucher Codes</h3>
=======
      <section className="max-w-7xl mx-auto px-6">
        <div className="p-8 bg-[#0B1330] border border-solid border-[#F5A623]/40 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-2xl text-white">
          <div className="space-y-1.5 z-10 text-center md:text-left">
            <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-widest block font-mono">VIP CLIENT MEMBERSHIP</span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white">Unlock Exclusive Voucher Codes</h3>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            <p className="text-xs text-[#D1D5DB] max-w-md">
              Sign up today and receive a flat 10% coupon valid on your next order, including limited timepiece catalogs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2.5 z-10 shrink-0">
            {newsletterSubscribed ? (
              <div className="px-6 py-3.5 bg-[#F5A623]/20 border border-solid border-[#F5A623]/50 text-[#F5A623] rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span>Greetings! Welcome to the premium Alike Group VIP Club.</span>
              </div>
            ) : (
              <>
                <input
                  id="newsletter-sub-main-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 bg-white text-[#1F2937] placeholder-[#6B7280] border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#F5A623] w-full md:w-64 transition-all duration-300 font-medium"
                />
                <button
                  id="newsletter-sub-main-btn"
                  onClick={() => {
                    if (newsletterEmail.trim().includes('@')) {
                      setNewsletterSubscribed(true);
<<<<<<< HEAD
                    }
                  }}
                  className="px-6 py-3 bg-[#0d0d0d] hover:bg-black text-white border border-[#0d0d0d] font-extrabold text-xs uppercase tracking-wider rounded-xl active:scale-95 transition-all duration-300 select-none cursor-pointer shadow-md"
=======
                    } else {
                      alert('Please enter a valid luxury partner email address.');
                    }
                  }}
                  className="px-6 py-3 bg-[#0d0d0d] hover:bg-black text-white border border-[#0d0d0d] font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 select-none cursor-pointer shadow-md"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                  title="Join Membership Club"
                >
                  Join VIP Club
                </button>
              </>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A623]/10 blur-3xl rounded-full"></div>
        </div>
      </section>

      {/* All Categories Modal */}
      <AllCategoriesModal
        isOpen={isAllCategoriesModalOpen}
        onClose={() => setIsAllCategoriesModalOpen(false)}
        onSelectCategory={(categoryId) => onNavigate('category_search', categoryId)}
        isLightMode={isLightMode}
      />
    </div>
  );
}
