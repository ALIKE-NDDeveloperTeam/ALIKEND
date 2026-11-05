import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutGrid,
  Search,
  X,
  Package,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import GlassCloseButton from './GlassCloseButton';
import { DynamicCategory } from '../types';

export interface AllCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (categoryId: string) => void;
  isLightMode?: boolean;
  categories?: DynamicCategory[];
}

const FALLBACK_CATEGORIES: DynamicCategory[] = [
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

export default function AllCategoriesModal({
  isOpen,
  onClose,
  onSelectCategory,
  isLightMode = false,
  categories: propCategories,
}: AllCategoriesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [categoryList, setCategoryList] = useState<DynamicCategory[]>(() => {
    if (propCategories && propCategories.length > 0) return propCategories;
    try {
      const cached = localStorage.getItem('alike_cache_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return FALLBACK_CATEGORIES;
  });

  // Fetch fresh dynamic categories from API when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (propCategories && propCategories.length > 0) {
      setCategoryList(propCategories);
      return;
    }

    let isMounted = true;
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
          setCategoryList(fresh);
          try {
            localStorage.setItem('alike_cache_categories', JSON.stringify(fresh));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('AllCategoriesModal API fetch fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, propCategories]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => {
        document.body.classList.remove('overflow-hidden');
        document.body.style.overflow = originalOverflow;
      };
    } else {
      setSearchQuery('');
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

  // Filter categories by English or Bengali title
  const activeCategories = useMemo(() => {
    return categoryList.filter((c) => c.isActive !== false);
  }, [categoryList]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return activeCategories;
    return activeCategories.filter((cat) => {
      const matchEn = cat.titleEn?.toLowerCase().includes(q);
      const matchBn = cat.titleBn?.toLowerCase().includes(q);
      const matchBadge = cat.badgeText?.toLowerCase().includes(q);
      return matchEn || matchBn || matchBadge;
    });
  }, [activeCategories, searchQuery]);

  const handleImageError = (key: string) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  const handleCardClick = (cat: DynamicCategory) => {
    const target = cat.redirectUrl || cat.titleEn || cat._id;
    onSelectCategory(target);
    onClose();
  };

  if (!isOpen) return null;

  const modalElement = (
    <div
      id="all-categories-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6"
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered Modal Container with column layout and max height */}
      <div
        id="all-categories-modal-content"
        className={`relative z-10 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
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
          className={`px-5 sm:px-7 pt-5 pb-4 border-b ${
            isLightMode
              ? 'border-neutral-200 bg-neutral-50/80'
              : 'border-white/10 bg-[#0B1330]/90'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLightMode
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {filteredCategories.length} Departments
                  </span>
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`}
                >
                  Browse all marketplace categories, collections & express channels
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

          {/* Search Box to filter by English or Bangla title */}
          <div className="relative mt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              id="all-categories-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category name (e.g. Mobiles, ফ্যাশন, Gaming, বই)..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                isLightMode
                  ? 'bg-white border-neutral-300 text-neutral-900 placeholder:text-neutral-400 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20'
                  : 'bg-white/5 border-white/15 text-white placeholder:text-neutral-400 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/25'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-white transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Responsive Grid of Categories */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {filteredCategories.length === 0 ? (
            <div className="py-14 px-4 text-center">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-base font-bold mb-1">No categories match your search</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                We couldn't find any department matching &ldquo;{searchQuery}&rdquo;. Try another keyword in English or Bangla.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-amber-500 text-black text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
              {filteredCategories.map((cat, idx) => {
                const badgeColor = cat.badgeColor || '#F5A623';
                const badgeText = cat.badgeText?.trim();
                const imageKey = cat._id || `cat-${idx}-${cat.titleEn}`;
                const hasFailed = failedImages[imageKey];

                return (
                  <button
                    key={cat._id || `cat-modal-${idx}`}
                    id={`all-categories-item-${cat._id || idx}`}
                    type="button"
                    onClick={() => handleCardClick(cat)}
                    className={`group/card relative flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border text-center transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 cursor-pointer select-none ${
                      isLightMode
                        ? 'bg-white hover:bg-amber-50/40 border-neutral-200/90 hover:border-[#F5A623]/70 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#F5A623]/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)] hover:shadow-xl'
                    }`}
                  >
                    {/* Badge Tag */}
                    {badgeText && (
                      <span
                        className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-white shadow-md z-20 pointer-events-none transition-transform duration-300 group-hover/card:scale-105"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {badgeText}
                      </span>
                    )}

                    {/* Thumbnail Photo Container with onError Fallback */}
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-neutral-900 flex items-center justify-center">
                      {hasFailed ? (
                        <div
                          className="w-full h-full flex flex-col items-center justify-center p-2 text-center transition-transform duration-500 group-hover/card:scale-105"
                          style={{
                            background: `linear-gradient(135deg, ${badgeColor}33 0%, ${badgeColor}88 100%)`,
                          }}
                        >
                          <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-white/90 drop-shadow-md mb-1" />
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider line-clamp-1">
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
                            onError={() => handleImageError(imageKey)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          {/* Soft bottom grounding gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </>
                      )}
                    </div>

                    {/* Category Label: English primary & Bangla subtitle */}
                    <div className="w-full px-0.5">
                      <span
                        className={`block text-[11px] sm:text-xs font-black tracking-tight uppercase line-clamp-1 group-hover/card:text-[#F5A623] transition-colors ${
                          isLightMode ? 'text-[#0F1A3C]' : 'text-white'
                        }`}
                        title={cat.titleEn}
                      >
                        {cat.titleEn}
                      </span>
                      <span
                        className={`block text-[9.5px] sm:text-[10.5px] font-medium line-clamp-1 mt-0.5 ${
                          isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                        }`}
                        title={cat.titleBn || cat.titleEn}
                      >
                        {cat.titleBn || cat.titleEn}
                      </span>
                    </div>

                    {/* Explore chevron indicator on hover */}
                    <span className="text-[9.5px] text-[#F5A623] mt-1.5 flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity font-bold">
                      <span>Explore</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          )}
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
            Click any department to view matching items & curated products
          </span>
          <button
            type="button"
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className="text-xs font-bold text-[#F5A623] hover:underline flex items-center gap-1 ml-auto sm:ml-0 cursor-pointer"
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
