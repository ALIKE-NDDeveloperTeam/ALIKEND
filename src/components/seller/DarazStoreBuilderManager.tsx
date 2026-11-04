import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Plus,
  Search,
  MoreHorizontal,
  Edit3,
  Eye,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Tag,
  Clock,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  User,
  Grid,
  Star,
  Heart,
  Share2,
  Sliders,
  X,
  Upload,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Flame,
  LayoutGrid,
  Percent,
} from 'lucide-react';
import { Product, SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';
import { DarazStoreSettingsProfileManager } from './DarazStoreSettingsProfileManager';

export type StoreModuleType =
  | 'category_bar'
  | 'voucher'
  | 'product_highlights'
  | 'three_columns_products'
  | 'smart_category_nav'
  | 'smart_product_list'
  | 'just_for_you'
  | 'countdown_promotion'
  | 'category_list'
  | 'single_banner'
  | 'three_banners'
  | 'banner_carousel'
  | 'multiple_banners'
  | 'four_banners_a'
  | 'five_banners_a'
  | 'multi_clickable_banners'
  | 'products_carousel'
  | 'product_recommendation'
  | 'slider_product_list';

export interface StoreBuilderModuleInstance {
  id: string;
  type: StoreModuleType;
  name: string;
  config: {
    // Category Bar
    pcBannerUrl?: string;
    mobileBannerUrl?: string;
    smartProductDisplay?: 'display' | 'hidden';
    headerShadingColor?: string;
    // Voucher
    voucherSelectionMode?: 'auto' | 'manual';
    selectedVoucherIds?: string[];
    // Titles & Bilingual fields
    titleDisplay?: 'display' | 'hidden';
    titleBn?: string;
    titleEn?: string;
    // Product Selection & Filtering
    productSelectionMode?: 'auto' | 'manual';
    selectedProductIds?: number[];
    shopCategory?: string;
    productCount?: number;
    sortBy?: 'highest_discount' | 'best_selling' | 'price_asc' | 'price_desc' | 'newest';
    minPrice?: string;
    maxPrice?: string;
    photoRatio?: '1:1' | '3:2' | '3:4' | '16:9';
    imageFillType?: 'original' | 'auto_fit';
    showProductName?: 'display' | 'hidden';
    // Smart Category Nav & Smart Product List
    categorySelectionMode?: 'auto' | 'manual';
    categoryQuantity?: number;
    // Countdown Promotion
    countdownEndTime?: string;
    countdownLabel?: string;
    // Banner Modules
    banners?: Array<{
      id: string;
      imageUrl: string;
      linkUrl: string;
      caption?: string;
    }>;
    // Common Margin Control
    hideBottomMargin?: boolean;
  };
}

export interface StoreBuilderPageVersion {
  id: string;
  name: string;
  pageType: 'homepage' | 'custom';
  status: 'published' | 'unpublished';
  updatedAt: string;
  syncedToPc: boolean;
  modules: StoreBuilderModuleInstance[];
}

export interface StoreCategoryItem {
  id: string;
  nameBn: string;
  nameEn: string;
  productCount: number;
  enabled: boolean;
}

interface DarazStoreBuilderManagerProps {
  sellerProfile?: SellerProfile | null;
  products?: Product[];
  onProfileUpdated?: (updated: SellerProfile) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onOpenClassicSettings?: () => void;
  initialViewMode?: 'dashboard' | 'editor' | 'store_profile';
}

const DEFAULT_SHADING_COLORS = [
  '#1E293B',
  '#F85606',
  '#0F172A',
  '#7C2D12',
  '#1E3A8A',
  '#065F46',
  '#581C87',
  '#831843',
];

const DEFAULT_MODULES: StoreBuilderModuleInstance[] = [
  {
    id: 'mod_cat_bar_1',
    type: 'category_bar',
    name: 'Category bar',
    config: {
      pcBannerUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      mobileBannerUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
      smartProductDisplay: 'display',
      headerShadingColor: '#1E293B',
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_voucher_1',
    type: 'voucher',
    name: 'Voucher',
    config: {
      voucherSelectionMode: 'auto',
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_highlights_1',
    type: 'product_highlights',
    name: 'Product Highlights',
    config: {
      titleDisplay: 'display',
      titleBn: 'সেরা ডিল ও হাইলাইটস',
      titleEn: 'Top Highlights & Featured Picks',
      productSelectionMode: 'auto',
      productCount: 4,
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_three_col_1',
    type: 'three_columns_products',
    name: 'Three Columns Products List',
    config: {
      productSelectionMode: 'auto',
      shopCategory: 'all',
      productCount: 6,
      sortBy: 'highest_discount',
      minPrice: '',
      maxPrice: '',
      photoRatio: '1:1',
      imageFillType: 'auto_fit',
      showProductName: 'display',
      titleDisplay: 'display',
      titleBn: 'বিশেষ ছাড়ের পণ্যসমূহ',
      titleEn: 'Exclusive Discount Collection',
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_smart_cat_nav_1',
    type: 'smart_category_nav',
    name: 'Smart Category Navigation',
    config: {
      titleDisplay: 'display',
      titleBn: 'ক্যাটাগরি অনুযায়ী শপিং করুন',
      titleEn: 'Shop by Category',
      categorySelectionMode: 'auto',
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_smart_prod_list_1',
    type: 'smart_product_list',
    name: 'Smart Product List - by Category',
    config: {
      productSelectionMode: 'auto',
      categoryQuantity: 3,
      titleDisplay: 'display',
      titleBn: 'ক্যাটাগরি ভিত্তিক সেরা পণ্য',
      titleEn: 'Category Bestsellers',
      hideBottomMargin: false,
    },
  },
  {
    id: 'mod_just_for_you_1',
    type: 'just_for_you',
    name: 'Just For You',
    config: {
      productSelectionMode: 'auto',
      titleDisplay: 'display',
      titleBn: 'আপনার জন্য বাছাইকৃত',
      titleEn: 'Just For You',
      hideBottomMargin: false,
    },
  },
];

const DEFAULT_STORE_CATEGORIES: StoreCategoryItem[] = [
  { id: 'scat_1', nameBn: 'লাক্সারি ঘড়ি', nameEn: 'Luxury Watches', productCount: 12, enabled: true },
  { id: 'scat_2', nameBn: 'ফাইন লেদার ও ব্যাগ', nameEn: 'Fine Leather & Bags', productCount: 8, enabled: true },
  { id: 'scat_3', nameBn: 'জুয়েলারি ও এক্সেসরিজ', nameEn: 'Jewelry & Accessories', productCount: 15, enabled: true },
  { id: 'scat_4', nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট', nameEn: 'Electronics & Gadgets', productCount: 10, enabled: true },
];

interface PaletteCategoryGroup {
  id: string;
  title: string;
  items: Array<{
    type: StoreModuleType;
    label: string;
    maxLimit: number;
    hot?: boolean;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const PALETTE_GROUPS: PaletteCategoryGroup[] = [
  {
    id: 'advanced',
    title: 'Advanced Modules',
    items: [
      { type: 'countdown_promotion', label: 'Countdown Promotion', maxLimit: 1, icon: Clock },
    ],
  },
  {
    id: 'category',
    title: 'Category Modules',
    items: [
      { type: 'category_list', label: 'Category List', maxLimit: 100, icon: FolderTree },
      { type: 'smart_category_nav', label: 'Smart Category Navigation', maxLimit: 1, icon: Grid },
    ],
  },
  {
    id: 'banner',
    title: 'Banner Modules',
    items: [
      { type: 'three_banners', label: 'Three banners', maxLimit: 20, icon: LayoutGrid },
      { type: 'single_banner', label: 'Single Banner', maxLimit: 20, hot: true, icon: ImageIcon },
      { type: 'banner_carousel', label: 'Banner Carousel', maxLimit: 10, icon: Layers },
      { type: 'multiple_banners', label: 'Multiple banners', maxLimit: 10, icon: LayoutGrid },
      { type: 'four_banners_a', label: 'Four Banners A', maxLimit: 10, icon: Grid },
      { type: 'five_banners_a', label: 'Five banners A', maxLimit: 10, icon: Grid },
      { type: 'multi_clickable_banners', label: 'Multi-Clickable Banners', maxLimit: 10, icon: Sparkles },
      { type: 'category_bar', label: 'Category bar & Header', maxLimit: 1, icon: Sliders },
    ],
  },
  {
    id: 'product',
    title: 'Product Modules',
    items: [
      { type: 'products_carousel', label: 'Products Carousel', maxLimit: 20, icon: ShoppingBag },
      { type: 'product_recommendation', label: 'Product Recommendation', maxLimit: 20, icon: Star },
      { type: 'slider_product_list', label: 'Slider Product List', maxLimit: 20, icon: Layers },
      { type: 'product_highlights', label: 'Product Highlights', maxLimit: 10, icon: Sparkles },
      { type: 'three_columns_products', label: 'Three Columns Products List', maxLimit: 20, icon: Grid },
      { type: 'smart_product_list', label: 'Smart Product List', maxLimit: 1, hot: true, icon: Flame },
      { type: 'just_for_you', label: 'Just For You', maxLimit: 1, icon: Heart },
    ],
  },
  {
    id: 'promotion',
    title: 'Promotion Modules',
    items: [
      { type: 'voucher', label: 'Voucher', maxLimit: 1, icon: Tag },
    ],
  },
];

const FALLBACK_DEMO_PRODUCTS: Product[] = [
  {
    id: 901,
    name: 'Signature Obsidian Chronograph Watch',
    brand: 'Artisan Atelier',
    price: 4999,
    mrp: 7999,
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 128,
<<<<<<< HEAD
    reviewsCount: 128,
    description: 'Precision chronograph with obsidian bezel.',
    specifications: { Movement: 'Swiss Quartz' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 15,
  },
  {
    id: 902,
    name: 'Handstitched Italian Bridle Tote',
    brand: 'Artisan Atelier',
    price: 6299,
    mrp: 8999,
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 94,
<<<<<<< HEAD
    reviewsCount: 94,
    description: 'Handstitched full-grain Italian leather tote.',
    specifications: { Material: 'Italian Leather' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 22,
  },
  {
    id: 903,
    name: '24K Vermeil Geometric Pendant',
    brand: 'Artisan Atelier',
    price: 3499,
    mrp: 5499,
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 76,
<<<<<<< HEAD
    reviewsCount: 76,
    description: 'Handcrafted 24K vermeil pendant with precision facet cuts.',
    specifications: { Metal: '24K Vermeil' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 19,
  },
  {
    id: 904,
    name: 'Minimalist Sapphire Dress Watch',
    brand: 'Artisan Atelier',
    price: 5799,
    mrp: 8499,
    category: 'luxury',
    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviews: 63,
<<<<<<< HEAD
    reviewsCount: 63,
    description: 'Ultra-thin dress watch featuring sapphire crystal glass.',
    specifications: { Crystal: 'Sapphire' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 11,
  },
  {
    id: 905,
    name: 'Studio Reference Wireless Headphones',
    brand: 'Artisan Atelier',
    price: 4299,
    mrp: 6999,
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviews: 112,
<<<<<<< HEAD
    reviewsCount: 112,
    description: 'Acoustic-grade studio reference wireless monitors.',
    specifications: { Connectivity: 'Bluetooth 5.3' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 30,
  },
  {
    id: 906,
    name: 'Heritage Horology Travel Case',
    brand: 'Artisan Atelier',
    price: 2199,
    mrp: 3499,
    category: 'fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviews: 51,
<<<<<<< HEAD
    reviewsCount: 51,
    description: 'Cushioned luxury travel case for fine timepieces.',
    specifications: { Capacity: '3 Watches' },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
    stock: 40,
  },
];

export const DarazStoreBuilderManager: React.FC<DarazStoreBuilderManagerProps> = ({
  sellerProfile,
  products = [],
  onProfileUpdated,
  showToast,
  onOpenClassicSettings,
  initialViewMode = 'dashboard',
}) => {
  const notify = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  const shopName = sellerProfile?.shopName || 'Official Flagship Store';
  const catalogProducts = products.length > 0 ? products : FALLBACK_DEMO_PRODUCTS;

  // Load saved Store Builder state from sellerProfile.storeDecoration.storeBuilder
  const savedBuilder = (sellerProfile?.storeDecoration as any)?.storeBuilder;

  const [pages, setPages] = useState<StoreBuilderPageVersion[]>(() => {
    if (Array.isArray(savedBuilder?.pages) && savedBuilder.pages.length > 0) {
      return savedBuilder.pages;
    }
    return [
      {
        id: 'page_home_live',
        name: 'Homepage',
        pageType: 'homepage',
        status: 'published',
        updatedAt: '2026-10-31 10:30:00',
        syncedToPc: true,
        modules: DEFAULT_MODULES,
      },
      {
        id: 'page_home_draft_1',
        name: 'Homepage - Eid & Festival Campaign Draft',
        pageType: 'homepage',
        status: 'unpublished',
        updatedAt: '2026-10-30 18:15:00',
        syncedToPc: false,
        modules: DEFAULT_MODULES,
      },
      {
        id: 'page_custom_vip',
        name: 'VIP Member Exclusive Collection',
        pageType: 'custom',
        status: 'unpublished',
        updatedAt: '2026-10-29 14:20:00',
        syncedToPc: true,
        modules: DEFAULT_MODULES.slice(0, 4),
      },
    ];
  });

  const [storeCategories, setStoreCategories] = useState<StoreCategoryItem[]>(() => {
    if (Array.isArray(savedBuilder?.storeCategories) && savedBuilder.storeCategories.length > 0) {
      return savedBuilder.storeCategories;
    }
    return DEFAULT_STORE_CATEGORIES;
  });

  // Top-level view mode: 'dashboard' ("My Pages") vs 'editor' ("Visual Store Editor") vs 'store_profile' ("Store profile")
  const [viewMode, setViewMode] = useState<'dashboard' | 'editor' | 'store_profile'>(
    initialViewMode
  );
  const [pageTab, setPageTab] = useState<'homepage' | 'custom'>('homepage');
  const [deviceView, setDeviceView] = useState<'mobile' | 'desktop'>('mobile');
  const [unpublishedSearch, setUnpublishedSearch] = useState('');
  const [activeMoreMenuId, setActiveMoreMenuId] = useState<string | null>(null);

  // Editor state
  const [editingPageId, setEditingPageId] = useState<string>('page_home_live');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const [savingToBackend, setSavingToBackend] = useState(false);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [previewStoreTab, setPreviewStoreTab] = useState<'homepage' | 'all_products' | 'categories'>('homepage');
  const [previewBottomTab, setPreviewBottomTab] = useState<'categories' | 'profile' | 'chat'>('categories');

  // Modals
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCatBn, setNewCatBn] = useState('');
  const [newCatEn, setNewCatEn] = useState('');

  const [createPageModalOpen, setCreatePageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  const [renameModalPage, setRenameModalPage] = useState<StoreBuilderPageVersion | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const [fullPreviewModalOpen, setFullPreviewModalOpen] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [newVoucherCode, setNewVoucherCode] = useState('STORE15');
  const [newVoucherDiscount, setNewVoucherDiscount] = useState(15);

  const activeEditingPage = useMemo(
    () => pages.find((p) => p.id === editingPageId) || pages[0],
    [pages, editingPageId]
  );

  const currentPublishedPage = useMemo(
    () =>
      pages.find((p) => p.pageType === pageTab && p.status === 'published') ||
      pages.find((p) => p.status === 'published') ||
      pages[0],
    [pages, pageTab]
  );

  const unpublishedPages = useMemo(() => {
    return pages.filter((p) => {
      if (p.pageType !== pageTab) return false;
      if (p.status !== 'unpublished') return false;
      if (
        unpublishedSearch.trim() &&
        !p.name.toLowerCase().includes(unpublishedSearch.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [pages, pageTab, unpublishedSearch]);

  const selectedModule = useMemo(() => {
    if (!selectedModuleId || !activeEditingPage) return null;
    return activeEditingPage.modules.find((m) => m.id === selectedModuleId) || null;
  }, [activeEditingPage, selectedModuleId]);

  // Hydrate Store Builder pages & categories from backend
  useEffect(() => {
    if (!sellerApi.getToken()) return;
    let cancelled = false;
    sellerApi
      .getStoreBuilder()
      .then((res) => {
        if (cancelled || !res?.storeBuilder) return;
        const sb = res.storeBuilder;
        if (Array.isArray(sb.pages) && sb.pages.length > 0) {
          setPages(sb.pages);
        }
        if (Array.isArray(sb.storeCategories) && sb.storeCategories.length > 0) {
          setStoreCategories(sb.storeCategories);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to backend
  const persistBuilderState = async (
    nextPages: StoreBuilderPageVersion[],
    nextCategories: StoreCategoryItem[] = storeCategories,
    toastMessage?: string
  ) => {
    setPages(nextPages);
    setStoreCategories(nextCategories);
    try {
      setSavingToBackend(true);
      const res = await sellerApi.updateStoreBuilder({
        pages: nextPages,
        storeCategories: nextCategories,
      });
      if (res?.seller && onProfileUpdated) {
        onProfileUpdated(res.seller);
      }
      if (toastMessage) notify(toastMessage, 'success');
    } catch (err: any) {
      if (toastMessage) notify(toastMessage, 'success');
    } finally {
      setSavingToBackend(false);
    }
  };

  // Open a page in the 3-column Visual Editor
  const handleEnterEditor = (pageId: string) => {
    setEditingPageId(pageId);
    const target = pages.find((p) => p.id === pageId);
    setSelectedModuleId(target?.modules?.[0]?.id || null);
    setViewMode('editor');
    setActiveMoreMenuId(null);
  };

  // Update active editing page's modules
  const updateEditingPageModules = (nextModules: StoreBuilderModuleInstance[]) => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    setPages((prev) =>
      prev.map((p) =>
        p.id === activeEditingPage.id
          ? { ...p, modules: nextModules, updatedAt: nowStr }
          : p
      )
    );
  };

  // Update a specific module's config
  const updateModuleConfig = (
    moduleId: string,
    patch: Partial<StoreBuilderModuleInstance['config']>
  ) => {
    if (!activeEditingPage) return;
    const nextModules = activeEditingPage.modules.map((m) =>
      m.id === moduleId ? { ...m, config: { ...m.config, ...patch } } : m
    );
    updateEditingPageModules(nextModules);
  };

  // Add module from Right Drawer Palette
  const handleAddModuleFromPalette = (
    type: StoreModuleType,
    label: string,
    maxLimit: number
  ) => {
    if (!activeEditingPage) return;
    const currentCount = activeEditingPage.modules.filter((m) => m.type === type).length;
    if (currentCount >= maxLimit) {
      notify(`Maximum limit (${currentCount}/${maxLimit}) reached for "${label}".`, 'warning');
      return;
    }

    const newMod: StoreBuilderModuleInstance = {
      id: `mod_${type}_${Date.now().toString().slice(-5)}`,
      type,
      name: label,
      config: {
        titleDisplay: 'display',
        titleBn: `${label} (বাংলা শিরোনাম)`,
        titleEn: label,
        productSelectionMode: 'auto',
        shopCategory: 'all',
        productCount: 6,
        sortBy: 'highest_discount',
        photoRatio: '1:1',
        imageFillType: 'auto_fit',
        showProductName: 'display',
        categorySelectionMode: 'auto',
        categoryQuantity: 3,
        voucherSelectionMode: 'auto',
        smartProductDisplay: 'display',
        headerShadingColor: '#1E293B',
        pcBannerUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
        mobileBannerUrl:
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80',
        countdownEndTime: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
        countdownLabel: 'Flash Deal Ends In',
        banners: [
          {
            id: 'ban_1',
            imageUrl:
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
            linkUrl: '#collection',
            caption: 'New Season Spotlight',
          },
          {
            id: 'ban_2',
            imageUrl:
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
            linkUrl: '#horology',
            caption: 'Horology Edition',
          },
          {
            id: 'ban_3',
            imageUrl:
              'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
            linkUrl: '#leather',
            caption: 'Handcrafted Leather',
          },
        ],
        hideBottomMargin: false,
      },
    };

    const nextModules = [...activeEditingPage.modules, newMod];
    updateEditingPageModules(nextModules);
    setSelectedModuleId(newMod.id);
    notify(`Added "${label}" module to canvas.`, 'info');
  };

  // Delete module from Left Sidebar
  const handleRemoveModule = (moduleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeEditingPage) return;
    const nextModules = activeEditingPage.modules.filter((m) => m.id !== moduleId);
    updateEditingPageModules(nextModules);
    if (selectedModuleId === moduleId) {
      setSelectedModuleId(nextModules[0]?.id || null);
    }
    notify('Module removed from page.', 'info');
  };

  // Move module up/down
  const handleMoveModule = (index: number, direction: -1 | 1, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeEditingPage) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= activeEditingPage.modules.length) return;
    const next = [...activeEditingPage.modules];
    const [moved] = next.splice(index, 1);
    next.splice(targetIdx, 0, moved);
    updateEditingPageModules(next);
  };

  // Drag and drop handlers for Left Sidebar
  const handleDragStart = (idx: number) => {
    setDraggedModuleIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, overIdx: number) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === overIdx) return;
    const next = [...activeEditingPage.modules];
    const [moved] = next.splice(draggedModuleIndex, 1);
    next.splice(overIdx, 0, moved);
    setDraggedModuleIndex(overIdx);
    updateEditingPageModules(next);
  };

  const handleDragEnd = () => {
    setDraggedModuleIndex(null);
  };

  // Sync Mobile Version to PC Version
  const handleSyncMobileToPc = async () => {
    if (!activeEditingPage) return;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const nextPages = pages.map((p) =>
      p.id === activeEditingPage.id ? { ...p, syncedToPc: true, updatedAt: nowStr } : p
    );
    await persistBuilderState(
      nextPages,
      storeCategories,
      'Mobile version layout and modules synced to PC Version!'
    );
  };

  // Publish current page
  const handlePublishPage = async (mode: 'immediate' | 'draft') => {
    setPublishMenuOpen(false);
    if (!activeEditingPage) return;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let nextPages: StoreBuilderPageVersion[];
    if (mode === 'immediate') {
      nextPages = pages.map((p) => {
        if (p.id === activeEditingPage.id) {
          return { ...p, status: 'published', updatedAt: nowStr };
        }
        // Demote other published pages of same pageType to unpublished
        if (p.pageType === activeEditingPage.pageType && p.status === 'published') {
          return { ...p, status: 'unpublished' };
        }
        return p;
      });
      await persistBuilderState(
        nextPages,
        storeCategories,
        `"${activeEditingPage.name}" is now Live & Published on your Storefront!`
      );
    } else {
      nextPages = pages.map((p) =>
        p.id === activeEditingPage.id ? { ...p, updatedAt: nowStr } : p
      );
      await persistBuilderState(
        nextPages,
        storeCategories,
        `Draft saved for "${activeEditingPage.name}".`
      );
    }
  };

  // Duplicate page version
  const handleDuplicatePage = async (page: StoreBuilderPageVersion) => {
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const copy: StoreBuilderPageVersion = {
      ...page,
      id: `page_${Date.now().toString().slice(-6)}`,
      name: `${page.name} (Copy)`,
      status: 'unpublished',
      updatedAt: nowStr,
      modules: JSON.parse(JSON.stringify(page.modules)),
    };
    const nextPages = [copy, ...pages];
    setActiveMoreMenuId(null);
    await persistBuilderState(nextPages, storeCategories, `Duplicated "${page.name}".`);
  };

  // Create new version / page
  const handleCreateNewPage = async () => {
    if (!newPageName.trim()) {
      notify('Please enter a page or version name.', 'warning');
      return;
    }
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const created: StoreBuilderPageVersion = {
      id: `page_${Date.now().toString().slice(-6)}`,
      name: newPageName.trim(),
      pageType: pageTab,
      status: 'unpublished',
      updatedAt: nowStr,
      syncedToPc: true,
      modules: JSON.parse(JSON.stringify(DEFAULT_MODULES)),
    };
    const nextPages = [created, ...pages];
    setNewPageName('');
    setCreatePageModalOpen(false);
    await persistBuilderState(
      nextPages,
      storeCategories,
      `Created new ${pageTab === 'homepage' ? 'Homepage Version' : 'Customized Page'} "${created.name}".`
    );
  };

  // Delete unpublished page
  const handleDeletePage = async (pageId: string) => {
    const target = pages.find((p) => p.id === pageId);
    if (!target) return;
    if (target.status === 'published') {
      notify('Cannot delete the currently published page.', 'warning');
      return;
    }
    const nextPages = pages.filter((p) => p.id !== pageId);
    await persistBuilderState(nextPages, storeCategories, `Deleted "${target.name}".`);
  };

  // Rename page
  const handleConfirmRename = async () => {
    if (!renameModalPage || !renameInput.trim()) return;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const nextPages = pages.map((p) =>
      p.id === renameModalPage.id ? { ...p, name: renameInput.trim(), updatedAt: nowStr } : p
    );
    setRenameModalPage(null);
    await persistBuilderState(nextPages, storeCategories, 'Page renamed successfully.');
  };

  // Helper to filter and sort products for a module
  const resolveModuleProducts = (mod: StoreBuilderModuleInstance): Product[] => {
    let list = [...catalogProducts];
    const cfg = mod.config;

    if (cfg.productSelectionMode === 'manual' && Array.isArray(cfg.selectedProductIds) && cfg.selectedProductIds.length > 0) {
      const manualList = list.filter((p) => cfg.selectedProductIds!.includes(p.id));
      if (manualList.length > 0) list = manualList;
    } else if (cfg.shopCategory && cfg.shopCategory !== 'all') {
      const catFiltered = list.filter(
        (p) => p.category?.toLowerCase() === cfg.shopCategory?.toLowerCase()
      );
      if (catFiltered.length > 0) list = catFiltered;
    }

    if (cfg.minPrice && !isNaN(Number(cfg.minPrice))) {
      list = list.filter((p) => p.price >= Number(cfg.minPrice));
    }
    if (cfg.maxPrice && !isNaN(Number(cfg.maxPrice))) {
      list = list.filter((p) => p.price <= Number(cfg.maxPrice));
    }

    if (cfg.sortBy === 'highest_discount') {
      list.sort((a, b) => {
        const discA = a.mrp > a.price ? (a.mrp - a.price) / a.mrp : 0;
        const discB = b.mrp > b.price ? (b.mrp - b.price) / b.mrp : 0;
        return discB - discA;
      });
    } else if (cfg.sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (cfg.sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    }

    const limit = cfg.productCount || 6;
    return list.slice(0, limit);
  };

  // =========================================================================
  // RENDER MODULE ON LIVE CANVAS (MOBILE & DESKTOP)
  // =========================================================================
  const renderCanvasModule = (
    mod: StoreBuilderModuleInstance,
    isInteractiveEditor: boolean
  ) => {
    const cfg = mod.config;
    const isSelected = isInteractiveEditor && selectedModuleId === mod.id;
    const marginClass = cfg.hideBottomMargin ? 'mb-0' : 'mb-3';
    const wrapperInteractiveClass = isInteractiveEditor
      ? `cursor-pointer transition-all relative group ${
          isSelected
            ? 'ring-2 ring-[#F85606] ring-offset-1 z-10'
            : 'hover:ring-1 hover:ring-[#F85606]/60'
        }`
      : '';

    const ratioClass =
      cfg.photoRatio === '3:2'
        ? 'aspect-[3/2]'
        : cfg.photoRatio === '3:4'
        ? 'aspect-[3/4]'
        : cfg.photoRatio === '16:9'
        ? 'aspect-video'
        : 'aspect-square';

    const fitClass = cfg.imageFillType === 'original' ? 'object-contain bg-slate-50' : 'object-cover';

    const renderModuleBadge = () =>
      isInteractiveEditor && (
        <div
          className={`absolute top-1.5 right-1.5 z-20 px-2 py-0.5 rounded text-[10px] font-bold shadow-xs transition-opacity ${
            isSelected
              ? 'bg-[#F85606] text-white opacity-100'
              : 'bg-slate-900/80 text-white opacity-0 group-hover:opacity-100'
          }`}
        >
          {mod.name}
        </div>
      );

    switch (mod.type) {
      case 'category_bar': {
        const bannerUrl =
          deviceView === 'desktop'
            ? cfg.pcBannerUrl ||
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
            : cfg.mobileBannerUrl ||
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80';
        const bgShade = cfg.headerShadingColor || '#1E293B';
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} overflow-hidden rounded-b-lg`}
            style={{ backgroundColor: bgShade }}
          >
            {renderModuleBadge()}
            <div className="relative h-28 sm:h-32 w-full overflow-hidden">
              <img
                src={bannerUrl}
                alt="Store Header"
                className="w-full h-full object-cover opacity-65"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent flex flex-col justify-end p-3 text-white">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-white/95 text-slate-900 font-black flex items-center justify-center text-sm shadow-md shrink-0">
                      {shopName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm leading-tight">{shopName}</h4>
                        <span className="px-1.5 py-0.2 bg-[#F85606] text-[9px] font-extrabold rounded uppercase">
                          Mall
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80">98% Positive Seller Ratings • 4.9★</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-full bg-[#F85606] text-white text-[11px] font-bold shadow-xs"
                  >
                    + Follow
                  </button>
                </div>
              </div>
            </div>
            {/* Store Navigation Bar */}
            <div className="px-3 py-2 flex items-center justify-between text-white/90 text-xs border-t border-white/15">
              <div className="flex items-center gap-4 font-semibold">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewStoreTab('homepage');
                  }}
                  className={`pb-1 cursor-pointer ${
                    previewStoreTab === 'homepage'
                      ? 'border-b-2 border-[#F85606] text-white font-bold'
                      : 'text-white/75'
                  }`}
                >
                  Homepage
                </span>
                {cfg.smartProductDisplay !== 'hidden' && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewStoreTab('all_products');
                    }}
                    className={`pb-1 cursor-pointer ${
                      previewStoreTab === 'all_products'
                        ? 'border-b-2 border-[#F85606] text-white font-bold'
                        : 'text-white/75'
                    }`}
                  >
                    All Products ({catalogProducts.length})
                  </span>
                )}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewStoreTab('categories');
                  }}
                  className={`pb-1 cursor-pointer ${
                    previewStoreTab === 'categories'
                      ? 'border-b-2 border-[#F85606] text-white font-bold'
                      : 'text-white/75'
                  }`}
                >
                  Categories
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'voucher': {
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#F85606]" />
                Store Vouchers ({cfg.voucherSelectionMode === 'manual' ? 'Manual Selection' : 'Auto Assigned'})
              </span>
              <span className="text-[11px] text-[#F85606] font-semibold">Collect All &gt;</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-[#F85606]">৳250 OFF</div>
                  <div className="text-[10px] text-slate-600">Min. spend ৳2,499</div>
                </div>
                <span className="px-2 py-1 rounded bg-[#F85606] text-white text-[10px] font-bold">
                  Collect
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-[#F85606]">15% OFF</div>
                  <div className="text-[10px] text-slate-600">Code: {newVoucherCode}</div>
                </div>
                <span className="px-2 py-1 rounded bg-[#F85606] text-white text-[10px] font-bold">
                  Collect
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 'product_highlights': {
        const items = resolveModuleProducts(mod).slice(0, 4);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            {cfg.titleDisplay !== 'hidden' && (
              <div className="mb-2.5">
                {cfg.titleBn && (
                  <h4 className="text-xs font-bold text-slate-900 leading-snug" lang="bn">
                    {cfg.titleBn}
                  </h4>
                )}
                {cfg.titleEn && (
                  <p className="text-[11px] font-semibold text-slate-500">{cfg.titleEn}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {items.map((prod) => {
                const disc =
                  prod.mrp > prod.price
                    ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
                    : 15;
                return (
                  <div
                    key={prod.id}
                    className="rounded-lg border border-slate-100 overflow-hidden bg-slate-50/60 flex flex-col"
                  >
                    <div className="relative aspect-square bg-white">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-[#F85606] text-white text-[9px] font-bold">
                        -{disc}%
                      </span>
                    </div>
                    <div className="p-2 flex-1 flex flex-col justify-between">
                      <div className="text-[11px] font-medium text-slate-800 line-clamp-1">
                        {prod.name}
                      </div>
                      <div className="mt-1">
                        <span className="text-xs font-extrabold text-[#F85606]">
                          ৳{prod.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through ml-1">
                          ৳{prod.mrp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'three_columns_products': {
        const items = resolveModuleProducts(mod);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            {cfg.titleDisplay !== 'hidden' && (
              <div className="mb-2.5 flex items-center justify-between">
                <div>
                  {cfg.titleBn && (
                    <h4 className="text-xs font-bold text-slate-900" lang="bn">
                      {cfg.titleBn}
                    </h4>
                  )}
                  {cfg.titleEn && (
                    <p className="text-[11px] font-semibold text-slate-500">{cfg.titleEn}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">3-Col Grid</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {items.map((prod) => {
                const disc =
                  prod.mrp > prod.price
                    ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
                    : 10;
                return (
                  <div
                    key={prod.id}
                    className="rounded-lg border border-slate-100 overflow-hidden bg-white flex flex-col"
                  >
                    <div className={`relative w-full ${ratioClass} overflow-hidden bg-slate-100`}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-full h-full ${fitClass}`}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">
                        -{disc}%
                      </span>
                    </div>
                    <div className="p-1.5">
                      {cfg.showProductName !== 'hidden' && (
                        <div className="text-[10px] font-medium text-slate-800 line-clamp-2 leading-tight mb-1">
                          {prod.name}
                        </div>
                      )}
                      <div className="text-[11px] font-extrabold text-[#F85606]">
                        ৳{prod.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'smart_category_nav':
      case 'category_list': {
        const activeCats = storeCategories.filter((c) => c.enabled);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            {cfg.titleDisplay !== 'hidden' && (
              <div className="mb-2.5">
                {cfg.titleBn && (
                  <h4 className="text-xs font-bold text-slate-900" lang="bn">
                    {cfg.titleBn}
                  </h4>
                )}
                {cfg.titleEn && (
                  <p className="text-[11px] font-semibold text-slate-500">{cfg.titleEn}</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeCats.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex flex-col items-center text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F85606] flex items-center justify-center font-bold text-xs mb-1">
                    {catalogProducts[idx % catalogProducts.length] ? (
                      <img
                        src={catalogProducts[idx % catalogProducts.length].image}
                        alt={cat.nameEn}
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      cat.nameEn.slice(0, 2)
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1" lang="bn">
                    {cat.nameBn}
                  </span>
                  <span className="text-[10px] text-slate-500 line-clamp-1">{cat.nameEn}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'smart_product_list': {
        const catQty = cfg.categoryQuantity || 3;
        const catsToShow = storeCategories.slice(0, catQty);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900" lang="bn">
                  {cfg.titleBn || 'ক্যাটাগরি ভিত্তিক সেরা পণ্য'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {cfg.titleEn || 'Smart Product List - by Category'} ({catQty} Categories)
                </p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-orange-50 text-[#F85606] text-[10px] font-bold">
                Auto-Ranked
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 border-b border-slate-100">
              {catsToShow.map((c, i) => (
                <span
                  key={c.id}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                    i === 0 ? 'bg-[#F85606] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.nameEn}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {catalogProducts.slice(0, 3).map((prod) => (
                <div key={prod.id} className="rounded-lg border border-slate-100 p-1.5">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full aspect-square object-cover rounded mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[10px] font-medium text-slate-800 truncate">{prod.name}</div>
                  <div className="text-[11px] font-extrabold text-[#F85606]">
                    ৳{prod.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'just_for_you': {
        const items = catalogProducts.slice(0, 4);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="h-px w-8 bg-slate-300" />
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-[#F85606] fill-[#F85606]" />
                {cfg.titleEn || 'Just For You'}
              </span>
              <span className="h-px w-8 bg-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-lg border border-slate-200/80 overflow-hidden bg-white"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full aspect-square object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-2">
                    <div className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-snug">
                      {prod.name}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-extrabold text-[#F85606]">
                        ৳{prod.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-amber-500 font-bold">★ {prod.rating || 4.9}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'countdown_promotion': {
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-gradient-to-r from-[#F85606] to-amber-500 p-3 rounded-lg text-white`}
          >
            {renderModuleBadge()}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  {cfg.countdownLabel || 'Flash Sale Countdown'}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs font-black">
                <span className="px-1.5 py-0.5 rounded bg-black/30">08h</span>:
                <span className="px-1.5 py-0.5 rounded bg-black/30">42m</span>:
                <span className="px-1.5 py-0.5 rounded bg-black/30">19s</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {catalogProducts.slice(0, 3).map((prod) => (
                <div key={prod.id} className="bg-white text-slate-900 rounded-md p-1.5">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full aspect-square object-cover rounded mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[11px] font-black text-[#F85606]">
                    ৳{prod.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default: {
        // Banner & Other Product Modules
        const isBannerMod = mod.type.includes('banner');
        const banners = cfg.banners || [
          {
            id: 'b1',
            imageUrl:
              'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80',
            linkUrl: '#',
            caption: mod.name,
          },
        ];
        if (isBannerMod) {
          const cols =
            mod.type === 'three_banners'
              ? 'grid-cols-3'
              : mod.type === 'four_banners_a' || mod.type === 'five_banners_a'
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-1';
          return (
            <div
              key={mod.id}
              onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
              className={`${marginClass} ${wrapperInteractiveClass} bg-white p-2.5 rounded-lg border border-slate-200/80`}
            >
              {renderModuleBadge()}
              {cfg.titleDisplay !== 'hidden' && cfg.titleEn && (
                <div className="text-xs font-bold text-slate-800 mb-2">{cfg.titleEn}</div>
              )}
              <div className={`grid ${cols} gap-2`}>
                {(mod.type === 'single_banner' || mod.type === 'banner_carousel'
                  ? banners.slice(0, 1)
                  : banners
                ).map((b) => (
                  <div key={b.id} className="relative rounded-lg overflow-hidden aspect-[16/7] bg-slate-100">
                    <img
                      src={b.imageUrl}
                      alt={b.caption || mod.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {b.caption && (
                      <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                        {b.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }

        const prods = resolveModuleProducts(mod).slice(0, 4);
        return (
          <div
            key={mod.id}
            onClick={() => isInteractiveEditor && setSelectedModuleId(mod.id)}
            className={`${marginClass} ${wrapperInteractiveClass} bg-white p-3 rounded-lg border border-slate-200/80`}
          >
            {renderModuleBadge()}
            <div className="text-xs font-bold text-slate-800 mb-2">
              {cfg.titleEn || mod.name}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {prods.map((p) => (
                <div key={p.id} className="rounded border border-slate-100 p-1.5">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full aspect-square object-cover rounded mb-1"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-[10px] font-medium text-slate-800 truncate">{p.name}</div>
                  <div className="text-[11px] font-extrabold text-[#F85606]">
                    ৳{p.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
  };

  // =========================================================================
  // RENDER DEVICE SIMULATOR FRAME (USED IN BOTH "MY PAGES" AND "VISUAL EDITOR")
  // =========================================================================
  const renderDeviceSimulator = (
    pageToRender: StoreBuilderPageVersion,
    isInteractiveEditor: boolean
  ) => {
    if (deviceView === 'mobile') {
      return (
        <div className="mx-auto w-[360px] sm:w-[375px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col">
          {/* Speaker Notch */}
          <div className="w-28 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* Mobile Screen Viewport */}
          <div className="bg-[#F1F5F9] rounded-[28px] overflow-hidden flex flex-col h-[640px] relative">
            {/* Phone Status Bar + Store Search Header */}
            <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[10px] font-bold">9:41</span>
              <div className="flex-1 bg-white/15 rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] text-white/80">
                <Search className="w-3 h-3" />
                <span className="truncate">Search in {shopName}</span>
              </div>
              <Share2 className="w-3.5 h-3.5 text-white/80" />
            </div>

            {/* Scrollable Storefront Canvas */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {previewStoreTab === 'all_products' ? (
                <div className="bg-white p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">
                      All Store Products ({catalogProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewStoreTab('homepage')}
                      className="text-[11px] text-[#F85606] font-bold cursor-pointer"
                    >
                      Back to Homepage
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {catalogProducts.map((p) => (
                      <div key={p.id} className="border border-slate-100 rounded-lg p-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full aspect-square object-cover rounded mb-1"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[11px] font-medium text-slate-800 line-clamp-1">
                          {p.name}
                        </div>
                        <div className="text-xs font-extrabold text-[#F85606]">
                          ৳{p.price.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : previewStoreTab === 'categories' ? (
                <div className="bg-white p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-800">Store Categories</span>
                    <button
                      type="button"
                      onClick={() => setPreviewStoreTab('homepage')}
                      className="text-[11px] text-[#F85606] font-bold cursor-pointer"
                    >
                      Back to Homepage
                    </button>
                  </div>
                  {storeCategories.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800" lang="bn">
                          {c.nameBn}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.nameEn}</div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">
                        {c.productCount} items &gt;
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                pageToRender.modules.map((mod) => renderCanvasModule(mod, isInteractiveEditor))
              )}
            </div>

            {/* Mobile Bottom Navigation Bar: Categories, Profile, Chat */}
            <div className="bg-white border-t border-slate-200 px-4 py-2 flex items-center justify-around shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPreviewBottomTab('categories');
                  setPreviewStoreTab('categories');
                }}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
                  previewBottomTab === 'categories' ? 'text-[#F85606]' : 'text-slate-500'
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Categories</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewBottomTab('profile');
                  setPreviewStoreTab('homepage');
                }}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
                  previewBottomTab === 'profile' ? 'text-[#F85606]' : 'text-slate-500'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewBottomTab('chat');
                  notify(`Opening Buyer-Seller Chat preview for ${shopName}...`, 'info');
                }}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${
                  previewBottomTab === 'chat' ? 'text-[#F85606]' : 'text-slate-500'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Desktop Simulator Frame
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Browser Chrome Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 max-w-md bg-slate-900/90 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-300 truncate">
            https://alikend.com/shop/{shopName.toLowerCase().replace(/\s+/g, '-')}
          </div>
          <span className="text-[11px] text-slate-400 font-semibold">PC 1200px Viewport</span>
        </div>

        {/* Desktop Canvas Content */}
        <div className="bg-[#F1F5F9] p-4 max-h-[650px] overflow-y-auto space-y-3">
          {pageToRender.modules.map((mod) => renderCanvasModule(mod, isInteractiveEditor))}
        </div>
      </div>
    );
  };

  // =========================================================================
  // RENDER INLINE MODULE CONFIGURATION PANEL (LEFT SIDEBAR IN EDITOR)
  // =========================================================================
  const renderModuleConfigEditor = (mod: StoreBuilderModuleInstance) => {
    const cfg = mod.config;

    const handleFileUploadToDataUrl = (
      e: React.ChangeEvent<HTMLInputElement>,
      targetKey: 'pcBannerUrl' | 'mobileBannerUrl'
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateModuleConfig(mod.id, { [targetKey]: reader.result });
          notify('Banner image uploaded!', 'success');
        }
      };
      reader.readAsDataURL(file);
    };

    return (
      <div className="space-y-4 text-xs text-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setSelectedModuleId(null)}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#F85606] font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Modules in use</span>
          </button>
          <span className="px-2 py-0.5 rounded bg-orange-50 text-[#F85606] font-bold text-[10px]">
            Editing
          </span>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">{mod.name}</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure module layout, bilingual titles, and display rules.
          </p>
        </div>

        {/* 1. CATEGORY BAR MODULE EDITOR */}
        {mod.type === 'category_bar' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="block font-bold text-slate-800">
                Store Header Image (PC Banner: 1200×128)
              </label>
              <div className="aspect-[1200/220] rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative">
                {cfg.pcBannerUrl && (
                  <img
                    src={cfg.pcBannerUrl}
                    alt="PC Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <input
                type="url"
                value={cfg.pcBannerUrl || ''}
                onChange={(e) => updateModuleConfig(mod.id, { pcBannerUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100">
                <Upload className="w-3.5 h-3.5 text-[#F85606]" />
                <span>Upload PC Banner (1200×128)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUploadToDataUrl(e, 'pcBannerUrl')}
                />
              </label>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="block font-bold text-slate-800">
                Store Header Image (Mobile Banner: 750×478)
              </label>
              <div className="aspect-[750/320] rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative">
                {cfg.mobileBannerUrl && (
                  <img
                    src={cfg.mobileBannerUrl}
                    alt="Mobile Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              <input
                type="url"
                value={cfg.mobileBannerUrl || ''}
                onChange={(e) => updateModuleConfig(mod.id, { mobileBannerUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold cursor-pointer hover:bg-slate-100">
                <Upload className="w-3.5 h-3.5 text-[#F85606]" />
                <span>Upload Mobile Banner (750×478)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUploadToDataUrl(e, 'mobileBannerUrl')}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Smart Product Display</label>
              <div className="flex items-center gap-4">
                {(['display', 'hidden'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.smartProductDisplay || 'display') === opt}
                      onChange={() => updateModuleConfig(mod.id, { smartProductDisplay: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Header Shading Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {DEFAULT_SHADING_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateModuleConfig(mod.id, { headerShadingColor: hex })}
                    className={`w-7 h-7 rounded-lg border-2 cursor-pointer transition-transform ${
                      cfg.headerShadingColor === hex
                        ? 'border-[#F85606] scale-110'
                        : 'border-white shadow-xs'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
                <input
                  type="color"
                  value={cfg.headerShadingColor || '#1E293B'}
                  onChange={(e) =>
                    updateModuleConfig(mod.id, { headerShadingColor: e.target.value })
                  }
                  className="w-7 h-7 rounded cursor-pointer border border-slate-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. VOUCHER MODULE EDITOR */}
        {mod.type === 'voucher' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block font-bold text-slate-800">Voucher Selection Mode</label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    checked={(cfg.voucherSelectionMode || 'auto') === 'auto'}
                    onChange={() => updateModuleConfig(mod.id, { voucherSelectionMode: 'auto' })}
                    className="mt-0.5 accent-[#F85606]"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Automatically</div>
                    <div className="text-[11px] text-slate-500">
                      System automatically displays your highest-converting active store vouchers.
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="radio"
                    checked={cfg.voucherSelectionMode === 'manual'}
                    onChange={() => updateModuleConfig(mod.id, { voucherSelectionMode: 'manual' })}
                    className="mt-0.5 accent-[#F85606]"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Manual</div>
                    <div className="text-[11px] text-slate-500">
                      Handpick specific store vouchers to highlight on this page.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-700">
                Need a new campaign discount?
              </span>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(true)}
                className="text-xs font-bold text-[#F85606] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Voucher</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. PRODUCT HIGHLIGHTS MODULE EDITOR */}
        {mod.type === 'product_highlights' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Title</label>
              <div className="flex items-center gap-4">
                {(['display', 'hidden'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.titleDisplay || 'display') === opt}
                      onChange={() => updateModuleConfig(mod.id, { titleDisplay: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {cfg.titleDisplay !== 'hidden' && (
              <div className="space-y-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">
                      Bengali <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(cfg.titleBn || '').length}/50
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    value={cfg.titleBn || ''}
                    onChange={(e) => updateModuleConfig(mod.id, { titleBn: e.target.value })}
                    placeholder="সেরা ডিল ও হাইলাইটস"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">English</label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(cfg.titleEn || '').length}/50
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    value={cfg.titleEn || ''}
                    onChange={(e) => updateModuleConfig(mod.id, { titleEn: e.target.value })}
                    placeholder="Top Highlights & Featured Picks"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Product Selection</label>
              <div className="flex items-center gap-4">
                {(['auto', 'manual'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.productSelectionMode || 'auto') === opt}
                      onChange={() => updateModuleConfig(mod.id, { productSelectionMode: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">
                      {opt === 'auto' ? 'Auto (Smart Recommendation)' : 'Manual'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {cfg.productSelectionMode === 'manual' && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 max-h-44 overflow-y-auto">
                <div className="text-[11px] font-bold text-slate-700 mb-1">
                  Select Products to Highlight:
                </div>
                {catalogProducts.map((p) => {
                  const selIds = cfg.selectedProductIds || [];
                  const checked = selIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...selIds, p.id]
                            : selIds.filter((id) => id !== p.id);
                          updateModuleConfig(mod.id, { selectedProductIds: next });
                        }}
                        className="accent-[#F85606]"
                      />
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-6 h-6 rounded object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate flex-1 text-[11px]">{p.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. THREE COLUMNS PRODUCTS LIST MODULE EDITOR */}
        {mod.type === 'three_columns_products' && (
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800">Product Selection</label>
              <div className="flex items-center gap-4">
                {(['auto', 'manual'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.productSelectionMode || 'auto') === opt}
                      onChange={() => updateModuleConfig(mod.id, { productSelectionMode: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Select Shop Category</label>
              <select
                value={cfg.shopCategory || 'all'}
                onChange={(e) => updateModuleConfig(mod.id, { shopCategory: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              >
                <option value="all">All Categories</option>
                <option value="luxury">Luxury Watches & Horology</option>
                <option value="fashion">Fine Leather & Fashion</option>
                <option value="electronics">Electronics & Audio</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Number of Products
                </label>
                <select
                  value={cfg.productCount || 6}
                  onChange={(e) =>
                    updateModuleConfig(mod.id, { productCount: Number(e.target.value) })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  {[3, 6, 9, 12, 15, 18].map((n) => (
                    <option key={n} value={n}>
                      {n} Products
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Sort By</label>
                <select
                  value={cfg.sortBy || 'highest_discount'}
                  onChange={(e) =>
                    updateModuleConfig(mod.id, { sortBy: e.target.value as any })
                  }
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                >
                  <option value="highest_discount">Highest Discount</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Price Filter (৳)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={cfg.minPrice || ''}
                  onChange={(e) => updateModuleConfig(mod.id, { minPrice: e.target.value })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={cfg.maxPrice || ''}
                  onChange={(e) => updateModuleConfig(mod.id, { maxPrice: e.target.value })}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Photo Ratio</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['1:1', '3:2', '3:4', '16:9'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => updateModuleConfig(mod.id, { photoRatio: ratio })}
                    className={`py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      (cfg.photoRatio || '1:1') === ratio
                        ? 'border-[#F85606] bg-orange-50 text-[#F85606]'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Product Image Fill Type
              </label>
              <div className="flex items-center gap-4">
                {[
                  { id: 'original', label: 'Original Size' },
                  { id: 'auto_fit', label: 'Auto-Fit' },
                ].map((opt) => (
                  <label key={opt.id} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.imageFillType || 'auto_fit') === opt.id}
                      onChange={() =>
                        updateModuleConfig(mod.id, { imageFillType: opt.id as any })
                      }
                      className="accent-[#F85606]"
                    />
                    <span className="font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Product Name</label>
              <div className="flex items-center gap-4">
                {(['display', 'hidden'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.showProductName || 'display') === opt}
                      onChange={() => updateModuleConfig(mod.id, { showProductName: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Title</label>
              <div className="flex items-center gap-4 mb-2">
                {(['display', 'hidden'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.titleDisplay || 'display') === opt}
                      onChange={() => updateModuleConfig(mod.id, { titleDisplay: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
              {cfg.titleDisplay !== 'hidden' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-slate-800">
                        Bengali <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(cfg.titleBn || '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={cfg.titleBn || ''}
                      onChange={(e) => updateModuleConfig(mod.id, { titleBn: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-slate-800">English</label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(cfg.titleEn || '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={cfg.titleEn || ''}
                      onChange={(e) => updateModuleConfig(mod.id, { titleEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. SMART CATEGORY NAVIGATION MODULE EDITOR */}
        {(mod.type === 'smart_category_nav' || mod.type === 'category_list') && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Title</label>
              <div className="flex items-center gap-4 mb-2">
                {(['display', 'hidden'] as const).map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={(cfg.titleDisplay || 'display') === opt}
                      onChange={() => updateModuleConfig(mod.id, { titleDisplay: opt })}
                      className="accent-[#F85606]"
                    />
                    <span className="capitalize font-medium">{opt}</span>
                  </label>
                ))}
              </div>
              {cfg.titleDisplay !== 'hidden' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-slate-800">
                        Bengali <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(cfg.titleBn || '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={cfg.titleBn || ''}
                      onChange={(e) => updateModuleConfig(mod.id, { titleBn: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="font-bold text-slate-800">English</label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {(cfg.titleEn || '').length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={cfg.titleEn || ''}
                      onChange={(e) => updateModuleConfig(mod.id, { titleEn: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Category Selection Mode
              </label>
              <label className="inline-flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 w-full cursor-pointer">
                <input
                  type="radio"
                  checked={(cfg.categorySelectionMode || 'auto') === 'auto'}
                  onChange={() => updateModuleConfig(mod.id, { categorySelectionMode: 'auto' })}
                  className="accent-[#F85606]"
                />
                <span className="font-medium">Auto (Smart Store Category Ranking)</span>
              </label>
            </div>
          </div>
        )}

        {/* 6. SMART PRODUCT LIST - BY CATEGORY MODULE EDITOR */}
        {mod.type === 'smart_product_list' && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Product Selection</label>
              <label className="inline-flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 w-full cursor-pointer">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="accent-[#F85606]"
                />
                <span className="font-medium">Auto (Smart Category Bestsellers)</span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Category Quantity</label>
              <select
                value={cfg.categoryQuantity || 3}
                onChange={(e) =>
                  updateModuleConfig(mod.id, { categoryQuantity: Number(e.target.value) })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              >
                {[2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    Display {n} Categories
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 7. JUST FOR YOU MODULE EDITOR */}
        {mod.type === 'just_for_you' && (
          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Product Selection</label>
              <label className="inline-flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 w-full cursor-pointer">
                <input
                  type="radio"
                  checked
                  readOnly
                  className="accent-[#F85606]"
                />
                <span className="font-medium">
                  Auto (Personalized Buyer Affinity Recommendations)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ADDITIONAL MODULES (COUNTDOWN, BANNERS, CAROUSELS) */}
        {mod.type === 'countdown_promotion' && (
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Promotion Headline</label>
              <input
                type="text"
                value={cfg.countdownLabel || ''}
                onChange={(e) => updateModuleConfig(mod.id, { countdownLabel: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 mb-1">Countdown End Time</label>
              <input
                type="datetime-local"
                value={cfg.countdownEndTime || ''}
                onChange={(e) => updateModuleConfig(mod.id, { countdownEndTime: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>
          </div>
        )}

        {/* COMMON BOTTOM MARGIN CHECKBOX */}
        <div className="pt-2 border-t border-slate-200">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(cfg.hideBottomMargin)}
              onChange={(e) =>
                updateModuleConfig(mod.id, { hideBottomMargin: e.target.checked })
              }
              className="rounded accent-[#F85606]"
            />
            <span className="font-medium text-slate-700">
              {mod.type === 'smart_category_nav'
                ? 'Hide the bottom margin of the module'
                : 'Not display bottom margin'}
            </span>
          </label>
        </div>

        {/* SAVE MODULE CONFIG BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            disabled={savingToBackend}
            onClick={() =>
              persistBuilderState(
                pages,
                storeCategories,
                `Saved configuration for "${mod.name}"!`
              )
            }
            className="w-full py-2.5 px-4 rounded-xl bg-[#F85606] hover:bg-[#e04d04] text-white font-extrabold text-xs shadow-sm cursor-pointer transition-colors"
          >
            {savingToBackend ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW 0: STORE PROFILE ("Store profile" tab in Store Builder)
  // =========================================================================
  if (viewMode === 'store_profile') {
    return (
      <DarazStoreSettingsProfileManager
        sellerProfile={sellerProfile}
        onProfileUpdated={onProfileUpdated}
        showToast={showToast}
        onNavigateToBuilderTab={(tab) => {
          if (tab === 'my_pages') setViewMode('dashboard');
          else if (tab === 'my_categories') {
            setViewMode('dashboard');
            setCategoryModalOpen(true);
          } else {
            setViewMode('store_profile');
          }
        }}
      />
    );
  }

  // =========================================================================
  // VIEW 1: PAGE MANAGEMENT DASHBOARD ("MY PAGES")
  // =========================================================================
  if (viewMode === 'dashboard') {
    return (
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Daraz Store Builder Header */}
        <div className="px-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 overflow-x-auto">
            <div className="flex items-center gap-3 py-3.5 pr-4 border-r border-slate-200 shrink-0">
              <span className="text-base font-extrabold text-slate-900 tracking-tight">
                Store Builder
              </span>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(true)}
                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-[#F85606] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#F85606]" />
                <span>Feedback</span>
              </button>
            </div>

            <nav className="flex items-center gap-6 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('dashboard')}
                className="py-4 text-xs font-extrabold text-[#F85606] border-b-2 border-[#F85606] cursor-pointer"
              >
                My Pages
              </button>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(true)}
                className="py-4 text-xs font-semibold text-slate-600 hover:text-[#F85606] border-b-2 border-transparent transition-colors cursor-pointer"
              >
                My Store Categories ({storeCategories.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('store_profile')}
                className="py-4 text-xs font-semibold text-slate-600 hover:text-[#F85606] border-b-2 border-transparent transition-colors cursor-pointer"
              >
                Store profile
              </button>
            </nav>
          </div>

          <div className="py-2 flex items-center gap-2.5 flex-wrap">
            {onOpenClassicSettings && (
              <button
                type="button"
                onClick={onOpenClassicSettings}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 cursor-pointer"
              >
                SEO & Policies
              </button>
            )}

            {/* Shop Selector */}
            <div className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{shopName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Page Management Tabs: "Store Homepage" and "Customized Page" */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setPageTab('homepage')}
              className={`py-3.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                pageTab === 'homepage'
                  ? 'border-[#F85606] text-[#F85606]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Store Homepage
            </button>
            <button
              type="button"
              onClick={() => setPageTab('custom')}
              className={`py-3.5 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                pageTab === 'custom'
                  ? 'border-[#F85606] text-[#F85606]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Customized Page (
              {pages.filter((p) => p.pageType === 'custom').length})
            </button>
          </div>

          {/* Device Simulator Toggle */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                deviceView === 'mobile'
                  ? 'bg-white text-[#F85606] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                deviceView === 'desktop'
                  ? 'bg-white text-[#F85606] shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
          </div>
        </div>

        {/* Main Dashboard Body: Left Simulator Preview + Right Published/Unpublished Page Cards */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#F8FAFC]">
          {/* Left Column: Live Device Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Live {deviceView === 'mobile' ? 'Mobile App' : 'Desktop Web'} Preview:{' '}
                <strong className="text-slate-900">{currentPublishedPage.name}</strong>
              </span>
            </div>
            {renderDeviceSimulator(currentPublishedPage, false)}
          </div>

          {/* Right Column: Current Published Page + Unpublished Pages */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Current Published Page Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Current Published Page
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live on Storefront
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Updated: {currentPublishedPage.updatedAt}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 shrink-0 relative">
                    <img
                      src={
                        currentPublishedPage.modules[0]?.config?.mobileBannerUrl ||
                        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={currentPublishedPage.name}
                      className="w-full h-full object-cover opacity-85"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold bg-black/70 text-white text-center rounded py-0.2">
                      {currentPublishedPage.modules.length} Modules
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-slate-900">
                        {currentPublishedPage.name}
                      </h4>
                      {currentPublishedPage.syncedToPc && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          PC & Mobile Synced
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Last published update: {currentPublishedPage.updatedAt}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Active widgets:{' '}
                      {currentPublishedPage.modules
                        .slice(0, 4)
                        .map((m) => m.name)
                        .join(', ')}
                      {currentPublishedPage.modules.length > 4
                        ? ` +${currentPublishedPage.modules.length - 4} more`
                        : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center relative">
                  <button
                    type="button"
                    onClick={() => handleEnterEditor(currentPublishedPage.id)}
                    className="px-5 py-2 rounded-xl bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-extrabold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* More Action Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMoreMenuId(
                          activeMoreMenuId === currentPublishedPage.id
                            ? null
                            : currentPublishedPage.id
                        )
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>More</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {activeMoreMenuId === currentPublishedPage.id && (
                      <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            setFullPreviewModalOpen(true);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Preview</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicatePage(currentPublishedPage)}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Duplicate Version</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            setRenameModalPage(currentPublishedPage);
                            setRenameInput(currentPublishedPage.name);
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Rename</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMoreMenuId(null);
                            navigator.clipboard?.writeText(
                              `https://alikend.com/shop/${shopName
                                .toLowerCase()
                                .replace(/\s+/g, '-')}`
                            );
                            notify('Storefront link copied to clipboard!', 'info');
                          }}
                          className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Unpublished Pages Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Unpublished Pages ({unpublishedPages.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Prepare campaign versions or custom landing pages before publishing
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={unpublishedSearch}
                      onChange={(e) => setUnpublishedSearch(e.target.value)}
                      placeholder="Search page name..."
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white w-48 focus:outline-none focus:border-[#F85606]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPageName('');
                      setCreatePageModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {pageTab === 'homepage' ? '+ Create New Version' : '+ Create New Page'}
                    </span>
                  </button>
                </div>
              </div>

              {unpublishedPages.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                  <Layers className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">
                    No unpublished {pageTab === 'homepage' ? 'versions' : 'pages'} found
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Click &ldquo;
                    {pageTab === 'homepage' ? '+ Create New Version' : '+ Create New Page'}
                    &rdquo; to design a new storefront layout.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                  {unpublishedPages.map((pg) => (
                    <div
                      key={pg.id}
                      className="p-3.5 bg-white hover:bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          {pg.modules.length}M
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{pg.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Draft
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Updated: {pg.updatedAt} • {pg.modules.length} modules configured
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEnterEditor(pg.id)}
                          className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-[#F85606] text-[#F85606] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicatePage(pg)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
                          title="Duplicate"
                        >
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenameModalPage(pg);
                            setRenameInput(pg.name);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePage(pg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete draft"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CREATE NEW VERSION / PAGE MODAL */}
        {createPageModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  {pageTab === 'homepage' ? 'Create New Homepage Version' : 'Create Customized Page'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCreatePageModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Page / Version Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="e.g., 11.11 Mega Sale Homepage"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreatePageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewPage}
                  className="px-4 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
                >
                  Create & Open Editor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RENAME PAGE MODAL */}
        {renameModalPage && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">Rename Page</h3>
                <button
                  type="button"
                  onClick={() => setRenameModalPage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameModalPage(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRename}
                  className="px-4 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STORE CATEGORY MANAGER MODAL */}
        {categoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Store Category Manager
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage custom shop categories displayed in Category Navigation & Smart Product Lists
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newCatBn}
                  onChange={(e) => setNewCatBn(e.target.value)}
                  placeholder="Category Name (Bengali *)"
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                    placeholder="Category Name (English)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newCatBn.trim() && !newCatEn.trim()) return;
                      const next: StoreCategoryItem[] = [
                        ...storeCategories,
                        {
                          id: `scat_${Date.now().toString().slice(-4)}`,
                          nameBn: newCatBn.trim() || newCatEn.trim(),
                          nameEn: newCatEn.trim() || newCatBn.trim(),
                          productCount: 6,
                          enabled: true,
                        },
                      ];
                      setNewCatBn('');
                      setNewCatEn('');
                      persistBuilderState(pages, next, 'Store category added!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                {storeCategories.map((c) => (
                  <div key={c.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800" lang="bn">
                        {c.nameBn}
                      </div>
                      <div className="text-[11px] text-slate-500">{c.nameEn}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.enabled}
                          onChange={(e) => {
                            const next = storeCategories.map((item) =>
                              item.id === c.id ? { ...item, enabled: e.target.checked } : item
                            );
                            persistBuilderState(pages, next);
                          }}
                          className="accent-[#F85606]"
                        />
                        <span className="text-[11px] font-semibold">Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = storeCategories.filter((item) => item.id !== c.id);
                          persistBuilderState(pages, next, 'Store category removed.');
                        }}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEND FEEDBACK MODAL */}
        {feedbackModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900">
                  Store Builder Feedback
                </h3>
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      star <= feedbackRating ? 'text-amber-500' : 'text-slate-300'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience with the new Daraz-style Visual Store Builder..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackModalOpen(false);
                    setFeedbackText('');
                    notify('Thank you! Your Store Builder feedback has been submitted.', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FULL PREVIEW MODAL */}
        {fullPreviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-5xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Storefront Preview — {currentPublishedPage.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setDeviceView('mobile')}
                      className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                        deviceView === 'mobile' ? 'bg-white text-[#F85606] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Mobile
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeviceView('desktop')}
                      className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                        deviceView === 'desktop' ? 'bg-white text-[#F85606] shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Desktop
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFullPreviewModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="py-2">{renderDeviceSimulator(currentPublishedPage, false)}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: THREE-COLUMN VISUAL STORE EDITOR & CANVAS WORKBENCH
  // =========================================================================
  return (
    <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[780px]">
      {/* 1. TOP TOOLBAR */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setViewMode('dashboard')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>My Pages</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">
                {activeEditingPage.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  activeEditingPage.status === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeEditingPage.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {activeEditingPage.status === 'published' ? 'Live' : 'Draft'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Last saved: {activeEditingPage.updatedAt}
            </span>
          </div>
        </div>

        {/* Center Device Toggle + Sync Mobile Version to PC Version */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDeviceView('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                deviceView === 'mobile'
                  ? 'bg-white text-[#F85606] shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceView('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                deviceView === 'desktop'
                  ? 'bg-white text-[#F85606] shadow-2xs'
                  : 'text-slate-600'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>PC</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSyncMobileToPc}
            className="px-3.5 py-1.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-[#F85606] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Mobile Version to PC Version</span>
          </button>
        </div>

        {/* Right Actions: Preview + Orange Publish Dropdown */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setFullPreviewModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <div className="relative">
            <div className="inline-flex rounded-xl overflow-hidden shadow-xs">
              <button
                type="button"
                disabled={savingToBackend}
                onClick={() => handlePublishPage('immediate')}
                className="px-4 py-2 bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-extrabold cursor-pointer"
              >
                {savingToBackend ? 'Publishing...' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => setPublishMenuOpen((prev) => !prev)}
                className="px-2 py-2 bg-[#d94804] hover:bg-[#c23f03] text-white cursor-pointer border-l border-white/20"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {publishMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-40 text-xs">
                <button
                  type="button"
                  onClick={() => handlePublishPage('immediate')}
                  className="w-full px-3.5 py-2 text-left hover:bg-orange-50 text-[#F85606] font-bold flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Publish Immediately</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePublishPage('draft')}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Save as Draft</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. THREE-COLUMN WORKBENCH */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* LEFT SIDEBAR: "Modules in use" OR Inline Module Configuration Panel */}
        <div className="lg:col-span-3 p-4 bg-white overflow-y-auto max-h-[740px]">
          {selectedModule ? (
            renderModuleConfigEditor(selectedModule)
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Modules in use ({activeEditingPage.modules.length})
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Drag to reorder or click any module to configure
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {activeEditingPage.modules.map((mod, idx) => (
                  <div
                    key={mod.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      selectedModuleId === mod.id
                        ? 'border-[#F85606] bg-orange-50/50'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GripVertical className="w-4 h-4 text-slate-400 shrink-0 cursor-grab" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {mod.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {mod.config.titleEn || mod.type.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => handleMoveModule(idx, -1, e)}
                        className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === activeEditingPage.modules.length - 1}
                        onClick={(e) => handleMoveModule(idx, 1, e)}
                        className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveModule(mod.id, e)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CENTER LIVE CANVAS */}
        <div className="lg:col-span-6 p-6 bg-[#F1F5F9] flex flex-col items-center justify-start overflow-y-auto max-h-[740px]">
          <div className="mb-3 flex items-center justify-between w-full max-w-md text-[11px] text-slate-500">
            <span>Click any module on the canvas to open its configuration editor</span>
            <span className="font-bold text-[#F85606]">
              {activeEditingPage.modules.length} Active Widgets
            </span>
          </div>
          {renderDeviceSimulator(activeEditingPage, true)}
        </div>

        {/* RIGHT DRAWER: "Store Modules" Component Palette */}
        <div className="lg:col-span-3 p-4 bg-white overflow-y-auto max-h-[740px] space-y-5">
          <div className="border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
              Store Modules
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any widget below to add it to your active page canvas
            </p>
          </div>

          {PALETTE_GROUPS.map((grp) => (
            <div key={grp.id} className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {grp.title}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {grp.items.map((item) => {
                  const IconComp = item.icon;
                  const usedCount = activeEditingPage.modules.filter(
                    (m) => m.type === item.type
                  ).length;
                  const isFull = usedCount >= item.maxLimit;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        handleAddModuleFromPalette(item.type, item.label, item.maxLimit)
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isFull
                          ? 'border-slate-200 bg-slate-50 text-slate-400'
                          : 'border-slate-200/90 bg-white hover:border-[#F85606] hover:bg-orange-50/30 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isFull
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-orange-50 text-[#F85606]'
                          }`}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold truncate">{item.label}</span>
                            {item.hot && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                                HOT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                        ({usedCount}/{item.maxLimit})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE NEW VOUCHER QUICK MODAL */}
      {voucherModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Create Store Voucher</h3>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Voucher Code</label>
                <input
                  type="text"
                  value={newVoucherCode}
                  onChange={(e) => setNewVoucherCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Percentage (%)</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={newVoucherDiscount}
                  onChange={(e) => setNewVoucherDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setVoucherModalOpen(false);
                  notify(
                    `Voucher ${newVoucherCode} (${newVoucherDiscount}% OFF) created & linked to Voucher Module!`,
                    'success'
                  );
                }}
                className="px-4 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
              >
                Create & Link Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PREVIEW MODAL FROM EDITOR */}
      {fullPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Preview — {activeEditingPage.name}
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDeviceView('mobile')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                      deviceView === 'mobile' ? 'bg-white text-[#F85606] shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceView('desktop')}
                    className={`px-2.5 py-1 rounded text-xs font-bold cursor-pointer ${
                      deviceView === 'desktop' ? 'bg-white text-[#F85606] shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    PC
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFullPreviewModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-2">{renderDeviceSimulator(activeEditingPage, false)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
