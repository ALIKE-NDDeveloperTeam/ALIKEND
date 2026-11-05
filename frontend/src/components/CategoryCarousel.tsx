import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Sparkles } from 'lucide-react';
import { DynamicCategory } from '../types';

export interface CategoryCarouselProps {
  categories?: DynamicCategory[];
  onNavigate?: (view: string, filter?: string) => void;
  isLightMode?: boolean;
  onOpenAllCategories?: () => void;
  className?: string;
}

// Fallback high-definition curated category cards if API response is loading or offline
const DEFAULT_CAROUSEL_CATEGORIES: DynamicCategory[] = [
  {
    _id: 'cat-1',
    titleEn: 'Luxury Atelier',
    titleBn: 'বিলাসবহুল সংগ্রহ',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#EF4444',
    redirectUrl: 'category_search',
    order: 1,
    isActive: true,
  },
  {
    _id: 'cat-2',
    titleEn: 'VIP Membership',
    titleBn: 'ভিআইপি মেম্বারশিপ',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'EXCLUSIVE',
    badgeColor: '#8B5CF6',
    redirectUrl: 'category_search',
    order: 2,
    isActive: true,
  },
  {
    _id: 'cat-3',
    titleEn: 'Flagship Mobiles',
    titleBn: 'ফ্ল্যাগশিপ মোবাইল',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#3B82F6',
    redirectUrl: 'category_search',
    order: 3,
    isActive: true,
  },
  {
    _id: 'cat-4',
    titleEn: 'Performance Laptops',
    titleBn: 'ল্যাপটপ ও গ্যাজেট',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'GEAR',
    badgeColor: '#10B981',
    redirectUrl: 'category_search',
    order: 4,
    isActive: true,
  },
  {
    _id: 'cat-5',
    titleEn: 'Haute Couture Fashion',
    titleBn: 'ফ্যাশন পোশাক',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TRENDING',
    badgeColor: '#EC4899',
    redirectUrl: 'category_search',
    order: 5,
    isActive: true,
  },
  {
    _id: 'cat-6',
    titleEn: 'Artisan Fine Jewellery',
    titleBn: 'আভিজাত্য জুয়েলারি',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#F59E0B',
    redirectUrl: 'category_search',
    order: 6,
    isActive: true,
  },
  {
    _id: 'cat-7',
    titleEn: 'Pro Tier Gaming',
    titleBn: 'প্রো গেমিং গিয়ার',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'GEAR',
    badgeColor: '#6366F1',
    redirectUrl: 'category_search',
    order: 7,
    isActive: true,
  },
  {
    _id: 'cat-8',
    titleEn: 'Fast Delivery Express',
    titleBn: 'দ্রুত ডেলিভারি',
    imageUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'ACTIVE',
    badgeColor: '#10B981',
    redirectUrl: 'category_search',
    order: 8,
    isActive: true,
  },
  {
    _id: 'cat-9',
    titleEn: 'Curated Living & Decor',
    titleBn: 'ফার্নিচার ও সাজসজ্জা',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TRENDING',
    badgeColor: '#14B8A6',
    redirectUrl: 'category_search',
    order: 9,
    isActive: true,
  },
  {
    _id: 'cat-10',
    titleEn: 'Prestige Beauty',
    titleBn: 'সৌন্দর্য ও প্রসাধন',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#F43F5E',
    redirectUrl: 'category_search',
    order: 10,
    isActive: true,
  },
  {
    _id: 'cat-11',
    titleEn: 'Industrial Hardware',
    titleBn: 'হার্ডওয়্যার ও টুলস',
    imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'ACTIVE',
    badgeColor: '#F97316',
    redirectUrl: 'category_search',
    order: 11,
    isActive: true,
  },
  {
    _id: 'cat-12',
    titleEn: 'Fresh Gourmet Grocery',
    titleBn: 'মুদি ও গ্রোসারি',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'ACTIVE',
    badgeColor: '#84CC16',
    redirectUrl: 'category_search',
    order: 12,
    isActive: true,
  },
  {
    _id: 'cat-13',
    titleEn: 'Mobiles & Tablets',
    titleBn: 'মোবাইল ও ট্যাবলেট',
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#EF4444',
    redirectUrl: 'category_search',
    order: 13,
    isActive: true,
  },
  {
    _id: 'cat-14',
    titleEn: 'Electronics & Appliances',
    titleBn: 'ইলেকট্রনিক্স ও যন্ত্রপাতি',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TOP',
    badgeColor: '#6366F1',
    redirectUrl: 'category_search',
    order: 14,
    isActive: true,
  },
  {
    _id: 'cat-15',
    titleEn: 'Computers & Accessories',
    titleBn: 'কম্পিউটার ও এক্সেসরিজ',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'GEAR',
    badgeColor: '#0EA5E9',
    redirectUrl: 'category_search',
    order: 15,
    isActive: true,
  },
  {
    _id: 'cat-16',
    titleEn: "Men's Fashion",
    titleBn: 'পুরুষের ফ্যাশন',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TRENDING',
    badgeColor: '#EC4899',
    redirectUrl: 'category_search',
    order: 16,
    isActive: true,
  },
  {
    _id: 'cat-17',
    titleEn: "Women's Fashion",
    titleBn: 'মহিলাদের ফ্যাশন',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#F43F5E',
    redirectUrl: 'category_search',
    order: 17,
    isActive: true,
  },
  {
    _id: 'cat-18',
    titleEn: 'Kids & Baby',
    titleBn: 'শিশু ও বেবি পণ্য',
    imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#3B82F6',
    redirectUrl: 'category_search',
    order: 18,
    isActive: true,
  },
  {
    _id: 'cat-19',
    titleEn: 'Watches & Eyewear',
    titleBn: 'ঘড়ি ও চশমা',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'SALE',
    badgeColor: '#F59E0B',
    redirectUrl: 'category_search',
    order: 19,
    isActive: true,
  },
  {
    _id: 'cat-20',
    titleEn: 'Bags, Shoes & Footwear',
    titleBn: 'ব্যাগ ও জুতা',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TOP',
    badgeColor: '#8B5CF6',
    redirectUrl: 'category_search',
    order: 20,
    isActive: true,
  },
  {
    _id: 'cat-21',
    titleEn: 'Beauty & Personal Care',
    titleBn: 'বিউটি ও পার্সোনাল কেয়ার',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TRENDING',
    badgeColor: '#D946EF',
    redirectUrl: 'category_search',
    order: 21,
    isActive: true,
  },
  {
    _id: 'cat-22',
    titleEn: 'Health & Wellness',
    titleBn: 'স্বাস্থ্য ও সুস্থতা',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'ACTIVE',
    badgeColor: '#10B981',
    redirectUrl: 'category_search',
    order: 22,
    isActive: true,
  },
  {
    _id: 'cat-23',
    titleEn: 'Groceries & Daily Essentials',
    titleBn: 'মুদি ও নিত্যপণ্য',
    imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#EA580C',
    redirectUrl: 'category_search',
    order: 23,
    isActive: true,
  },
  {
    _id: 'cat-24',
    titleEn: 'Fresh Food & Bakery',
    titleBn: 'তাজা খাবার ও বেকারি',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 24,
    isActive: true,
  },
  {
    _id: 'cat-25',
    titleEn: 'Home & Kitchen',
    titleBn: 'হোম ও কিচেন',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TOP',
    badgeColor: '#059669',
    redirectUrl: 'category_search',
    order: 25,
    isActive: true,
  },
  {
    _id: 'cat-26',
    titleEn: 'Furniture',
    titleBn: 'আসবাবপত্র',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 26,
    isActive: true,
  },
  {
    _id: 'cat-27',
    titleEn: 'Home Decor & Lighting',
    titleBn: 'হোম ডেকোর ও লাইটিং',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#EAB308',
    redirectUrl: 'category_search',
    order: 27,
    isActive: true,
  },
  {
    _id: 'cat-28',
    titleEn: 'Books & Stationery',
    titleBn: 'বই ও স্টেশনারি',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 28,
    isActive: true,
  },
  {
    _id: 'cat-29',
    titleEn: 'Sports & Fitness',
    titleBn: 'খেলাধুলা ও ফিটনেস',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'ACTIVE',
    badgeColor: '#0284C7',
    redirectUrl: 'category_search',
    order: 29,
    isActive: true,
  },
  {
    _id: 'cat-30',
    titleEn: 'Toys & Games',
    titleBn: 'খেলনা ও গেমস',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#84CC16',
    redirectUrl: 'category_search',
    order: 30,
    isActive: true,
  },
  {
    _id: 'cat-31',
    titleEn: 'Automotive & Bike Accessories',
    titleBn: 'গাড়ি ও বাইক এক্সেসরিজ',
    imageUrl: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'GEAR',
    badgeColor: '#475569',
    redirectUrl: 'category_search',
    order: 31,
    isActive: true,
  },
  {
    _id: 'cat-32',
    titleEn: 'Tools & Hardware',
    titleBn: 'টুলস ও হার্ডওয়্যার',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 32,
    isActive: true,
  },
  {
    _id: 'cat-33',
    titleEn: 'Pet Supplies',
    titleBn: 'পোষা প্রাণীর পণ্য',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TRENDING',
    badgeColor: '#F97316',
    redirectUrl: 'category_search',
    order: 33,
    isActive: true,
  },
  {
    _id: 'cat-34',
    titleEn: 'Gifts & Flowers',
    titleBn: 'গিফট ও ফুল',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'SALE',
    badgeColor: '#E11D48',
    redirectUrl: 'category_search',
    order: 34,
    isActive: true,
  },
  {
    _id: 'cat-35',
    titleEn: 'Travel & Luggage',
    titleBn: 'ভ্রমণ ও লাগেজ',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 35,
    isActive: true,
  },
  {
    _id: 'cat-36',
    titleEn: 'Musical Instruments',
    titleBn: 'বাদ্যযন্ত্র',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'TOP',
    badgeColor: '#7C3AED',
    redirectUrl: 'category_search',
    order: 36,
    isActive: true,
  },
  {
    _id: 'cat-37',
    titleEn: 'Art, Craft & Handmade',
    titleBn: 'আর্ট, ক্রাফট ও হস্তশিল্প',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'NEW',
    badgeColor: '#10B981',
    redirectUrl: 'category_search',
    order: 37,
    isActive: true,
  },
  {
    _id: 'cat-38',
    titleEn: 'Garden & Outdoor',
    titleBn: 'বাগান ও আউটডোর',
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: '',
    badgeColor: '#F5A623',
    redirectUrl: 'category_search',
    order: 38,
    isActive: true,
  },
  {
    _id: 'cat-39',
    titleEn: 'Festive & Occasion Wear',
    titleBn: 'উৎসব ও অনুষ্ঠানের পোশাক',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=500&fm=webp',
    badgeText: 'HOT',
    badgeColor: '#DC2626',
    redirectUrl: 'category_search',
    order: 39,
    isActive: true,
  },
];

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories: propCategories,
  onNavigate,
  isLightMode = false,
  onOpenAllCategories,
  className = '',
}) => {
  const [items, setItems] = useState<DynamicCategory[]>(() => {
    if (propCategories && propCategories.length > 0) return propCategories;
    try {
      const cached = localStorage.getItem('alike_cache_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_CAROUSEL_CATEGORIES;
  });
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Carousel interactive DOM refs
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollbarTrackRef = useRef<HTMLDivElement>(null);

  // Scrolling & Button state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1

  // Drag tracking refs
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const resumeTimerRef = useRef<any>(null);

  // Fetch dynamic categories from Express backend API
  useEffect(() => {
    let isMounted = true;
    if (propCategories && propCategories.length > 0) {
      setItems(propCategories);
      return;
    }

    setLoading(true);
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        const fresh =
          data && data.success && Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
            : Array.isArray(data) && data.length > 0
            ? data
            : null;
        if (fresh) {
          setItems(fresh);
          try {
            localStorage.setItem('alike_cache_categories', JSON.stringify(fresh));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Categories fetch fallback active:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propCategories]);

  // Update navigation button states and custom scrollbar thumb progress
  const updateScrollStatus = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < maxScroll - 6);

    if (maxScroll > 0) {
      const prog = Math.min(Math.max(el.scrollLeft / maxScroll, 0), 1);
      setScrollProgress(prog);
    } else {
      setScrollProgress(0);
    }
  }, []);

  // Update on scroll & resize
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollStatus();
    window.addEventListener('resize', updateScrollStatus);
    return () => window.removeEventListener('resize', updateScrollStatus);
  }, [items, updateScrollStatus]);

  // Smooth scroll left / right by a fixed responsive width
  const handleScroll = (direction: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;

    setIsHovered(true);
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsHovered(false), 3000);

    // Scroll by ~2-3 cards depending on container width
    const scrollAmount = Math.max(280, Math.floor(el.clientWidth * 0.72));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Requirement: Isolate mouse wheel scroll so horizontal carousel responds without interfering vertically
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If user scrolls mouse wheel over carousel, route wheel deltas to horizontal scrolling
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const canLeft = el.scrollLeft > 0 && e.deltaY < 0;
        const canRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
        if (canLeft || canRight) {
          e.preventDefault();
          setIsHovered(true);
          clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = setTimeout(() => setIsHovered(false), 2500);

          el.scrollLeft += e.deltaY * 0.95;
          updateScrollStatus();
        }
      } else if (Math.abs(e.deltaX) > 0) {
        setIsHovered(true);
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => setIsHovered(false), 2500);
        updateScrollStatus();
      }
    };

    // Attach non-passive listener to properly isolate vertical mouse wheel over carousel
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [updateScrollStatus]);

  // Requirement: Auto-Play / Auto-Scroll on desktop that gently slides categories and pauses on hover / drag
  // Disabled on mobile (< 768px) so native touch momentum scrolling is never interrupted
  useEffect(() => {
    const el = trackRef.current;
    if (!el || items.length === 0) return;
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;

    let animId: number;
    let lastTime = performance.now();

    const autoSlide = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Auto-slide runs only when not hovering, not dragging, and has scrollable width
      if (!isHovered && !isDragging && el && window.innerWidth >= 768) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 5) {
          // Continuous gentle auto-drift (approx 28px/second)
          el.scrollLeft += 28 * delta;

          // If reached the right end, smoothly wrap back to beginning
          if (el.scrollLeft >= maxScroll - 1) {
            el.scrollLeft = 0;
          }
          updateScrollStatus();
        }
      }

      animId = requestAnimationFrame(autoSlide);
    };

    animId = requestAnimationFrame(autoSlide);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resumeTimerRef.current);
    };
  }, [isHovered, isDragging, items.length, updateScrollStatus]);

  // Dragging interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setIsHovered(true);
    dragStartXRef.current = e.pageX;
    dragStartScrollLeftRef.current = trackRef.current.scrollLeft;
    hasDraggedRef.current = false;
    clearTimeout(resumeTimerRef.current);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const el = trackRef.current;
      if (!el) return;
      const walk = (e.pageX - dragStartXRef.current) * 1.4;
      if (Math.abs(walk) > 4) {
        hasDraggedRef.current = true;
      }
      el.scrollLeft = dragStartScrollLeftRef.current - walk;
      updateScrollStatus();
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => setIsHovered(false), 2000);
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 120);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateScrollStatus]);

  // Custom scrollbar track click / drag to jump to position
  const handleScrollbarTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const trackBar = scrollbarTrackRef.current;
    const scrollContainer = trackRef.current;
    if (!trackBar || !scrollContainer) return;

    const rect = trackBar.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;

    scrollContainer.scrollTo({
      left: clickRatio * maxScroll,
      behavior: 'smooth',
    });
  };

  // Card click navigation handler
  const handleCardClick = (cat: DynamicCategory) => {
    if (hasDraggedRef.current) return;
    if (onNavigate) {
      const target = cat.redirectUrl || 'category_search';
      if (target === 'category_search' || target.startsWith('category_')) {
        onNavigate('category_search', cat.redirectUrl || cat.titleEn.toLowerCase());
      } else {
        onNavigate(target, cat.titleEn.toLowerCase());
      }
    }
  };

  return (
    <section
      id="category-carousel-section"
      className={`max-w-7xl mx-auto px-3 sm:px-6 space-y-2 sm:space-y-2.5 select-none ${className}`}
    >
      {/* Framework Header: Fixed layout controls (Title, Live Badge, View All) */}
      <div className="flex items-center justify-between gap-3 px-1 sm:px-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3
            className={`text-base sm:text-lg md:text-xl font-extrabold tracking-tight flex items-center gap-2 ${
              isLightMode ? 'text-[#0F1A3C]' : 'text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5A623]" />
            <span>
              Browse <span className="text-[#F5A623]">Categories</span>
            </span>
          </h3>

          {/* Live Dynamic Catalog Indicator */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border shadow-2xs transition-colors ${
              isLightMode
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live Catalog</span>
          </span>
        </div>

        {/* View All Categories Link */}
        {onOpenAllCategories && (
          <button
            type="button"
            id="view-all-categories-btn"
            onClick={onOpenAllCategories}
            className="group/btn text-xs text-[#F5A623] hover:text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1 py-1 px-2.5 rounded-lg transition-all duration-300 hover:translate-x-1 cursor-pointer"
          >
            <span>View All</span>
            <span className="hidden sm:inline">Categories</span>
            <ChevronRight className="w-4 h-4 text-[#F5A623] transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Main Carousel Wrapper with Navigation Arrows */}
      <div
        className="relative group/carousel py-0.5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          if (!isDragging) {
            clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => setIsHovered(false), 2000);
          }
        }}
      >
        {/* Left Navigation Button (<) - Compact w-8 h-8 sm:w-9 sm:h-9 with w-4 h-4 icon */}
        <button
          type="button"
          id="category-nav-left"
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`hidden sm:flex absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
            isLightMode
              ? 'bg-white text-neutral-800 border-2 border-amber-400 hover:bg-amber-50 hover:text-[#F5A623] hover:border-[#F5A623]'
              : 'bg-[#0B1330] text-[#F5A623] border-2 border-[#F5A623]/60 hover:bg-[#121E4A] hover:border-[#F5A623] hover:shadow-[0_0_15px_rgba(245,166,35,0.45)]'
          } ${canScrollLeft ? 'opacity-100 cursor-pointer scale-100' : 'opacity-25 cursor-not-allowed scale-90'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Right Navigation Button (>) - Compact w-8 h-8 sm:w-9 sm:h-9 with w-4 h-4 icon */}
        <button
          type="button"
          id="category-nav-right"
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`hidden sm:flex absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center transition-all duration-300 shadow-xl active:scale-95 ${
            isLightMode
              ? 'bg-white text-neutral-800 border-2 border-amber-400 hover:bg-amber-50 hover:text-[#F5A623] hover:border-[#F5A623]'
              : 'bg-[#0B1330] text-[#F5A623] border-2 border-[#F5A623]/60 hover:bg-[#121E4A] hover:border-[#F5A623] hover:shadow-[0_0_15px_rgba(245,166,35,0.45)]'
          } ${canScrollRight ? 'opacity-100 cursor-pointer scale-100' : 'opacity-25 cursor-not-allowed scale-90'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Subtle Horizontal Edge Fades */}
        <div
          className={`hidden sm:block pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-r ${
            isLightMode ? 'from-white/85 to-transparent' : 'from-[#0B1330]/85 to-transparent'
          }`}
        />
        <div
          className={`hidden sm:block pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 z-10 bg-gradient-to-l ${
            isLightMode ? 'from-white/85 to-transparent' : 'from-[#0B1330]/85 to-transparent'
          }`}
        />

        {/* Two-Row Horizontal Scroll Grid Track (grid grid-rows-2 grid-flow-col auto-cols-max gap-x-3 gap-y-3) */}
        <div
          ref={trackRef}
          onScroll={updateScrollStatus}
          onMouseDown={handleMouseDown}
          className={`grid ${
            items.length <= 3 ? 'grid-rows-1' : 'grid-rows-2'
          } grid-flow-col auto-cols-max gap-x-3 gap-y-3 overflow-x-auto scrollbar-none py-1.5 px-3 sm:px-6 cursor-grab active:cursor-grabbing touch-pan-y`}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((cat, idx) => {
            const badgeColor = cat.badgeColor || '#F5A623';
            const badgeText = cat.badgeText?.trim();

            return (
              <div
                key={cat._id || `cat-${idx}`}
                id={`category-card-${cat._id || idx}`}
                onClick={() => handleCardClick(cat)}
                className="group/card relative cursor-pointer w-20 sm:w-24 md:w-28 shrink-0 flex flex-col items-center select-none transition-all duration-300 transform-gpu active:scale-95"
              >
                {/* Thumbnail Container (w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28) */}
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden transition-all duration-300 group-hover/card:-translate-y-1 ${
                    isLightMode
                      ? 'border border-neutral-200/90 bg-neutral-100 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06)] group-hover/card:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.14)]'
                      : 'border border-white/10 bg-neutral-800 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.4)] group-hover/card:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.65)]'
                  }`}
                >
                  {/* Overlay Badge/Tag (text-[6.5px] sm:text-[7.5px], px-1.5 py-px, top-1 right-1) */}
                  {badgeText && (
                    <span
                      className="absolute top-1 right-1 px-1.5 py-px rounded-full text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider text-white shadow-md z-20 pointer-events-none transition-transform duration-300 group-hover/card:scale-105"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {badgeText}
                    </span>
                  )}

                  {/* High Quality Category Photo with onError fallback */}
                  <div className="relative w-full h-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {failedImages[cat._id || cat.titleEn] ? (
                      <div
                        className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center transition-transform duration-500 group-hover/card:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${badgeColor}33 0%, ${badgeColor}88 100%)`,
                        }}
                      >
                        <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 drop-shadow-md mb-0.5" />
                        <span className="text-[8px] sm:text-[9px] font-bold text-white uppercase tracking-wider drop-shadow-sm line-clamp-1 px-0.5">
                          {cat.titleEn}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img
                          src={cat.imageUrl}
                          alt={cat.titleEn}
                          loading="lazy"
                          decoding="async"
                          onError={() => {
                            setFailedImages((prev) => ({
                              ...prev,
                              [cat._id || cat.titleEn]: true,
                            }));
                          }}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        {/* Soft gradient bottom grounding overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Title in English & Subtitle in Bengali (mt-1.5, text-[10px] sm:text-[11px] / text-[9px] sm:text-[10px]) */}
                <div className="mt-1.5 px-0.5 w-full text-center">
                  <h4
                    className={`font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wide truncate transition-colors duration-200 ${
                      isLightMode
                        ? 'text-neutral-900 group-hover/card:text-[#F5A623]'
                        : 'text-neutral-100 group-hover/card:text-[#F5A623]'
                    }`}
                    title={cat.titleEn}
                  >
                    {cat.titleEn}
                  </h4>

                  <p
                    className={`text-[9px] sm:text-[10px] font-medium truncate mt-0.5 transition-colors ${
                      isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                    }`}
                    title={cat.titleBn || cat.titleEn}
                  >
                    {cat.titleBn || cat.titleEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom horizontal scrollbar at bottom for manual dragging & tracking */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto pt-0.5 pb-1 px-4 flex items-center justify-center">
        <div
          ref={scrollbarTrackRef}
          onClick={handleScrollbarTrackClick}
          className={`relative w-full h-1.5 sm:h-2 rounded-full cursor-pointer transition-colors ${
            isLightMode ? 'bg-neutral-200/90 hover:bg-neutral-300/80' : 'bg-neutral-800 hover:bg-neutral-700/80'
          }`}
          title="Drag or click to jump horizontally"
        >
          {/* Draggable progress indicator bar */}
          <div
            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-amber-400 to-[#F5A623] shadow-xs transition-all duration-150"
            style={{
              width: '28%',
              left: `${scrollProgress * 72}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default CategoryCarousel;
