import { useState, useEffect, useRef, useMemo, FormEvent, ChangeEvent, TouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { Star, ShieldCheck, Truck, RotateCcw, RotateCw, Heart, ShoppingBag, ShoppingCart, Plus, Minus, Check, Users, Loader2, Building2, Percent, Camera, X, ArrowLeft, Zap, Clock, Sparkles, MessageSquare, PenLine, Info, Lock, Share2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Play, Pause, Maximize2, ZoomIn, ZoomOut, QrCode, MapPin, FileText, Sliders, HelpCircle, ThumbsUp, Search, Navigation, Compass, Store, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';
import { CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import GlassCloseButton from '../components/GlassCloseButton';
import FavoriteButton from '../components/FavoriteButton';
import { useAdminEdit } from '../context/AdminEditContext';

const POPULAR_LOCATIONS = [
  { city: 'New Delhi', pincode: '110001', state: 'Delhi' },
  { city: 'Mumbai', pincode: '400001', state: 'Maharashtra' },
  { city: 'Bengaluru', pincode: '560001', state: 'Karnataka' },
  { city: 'Kolkata', pincode: '700001', state: 'West Bengal' },
  { city: 'Chennai', pincode: '600001', state: 'Tamil Nadu' },
  { city: 'Hyderabad', pincode: '500001', state: 'Telangana' },
  { city: 'Pune', pincode: '411001', state: 'Maharashtra' },
  { city: 'Ahmedabad', pincode: '380001', state: 'Gujarat' },
  { city: 'Jaipur', pincode: '302001', state: 'Rajasthan' },
  { city: 'Lucknow', pincode: '226001', state: 'Uttar Pradesh' },
  { city: 'Chandigarh', pincode: '160017', state: 'Punjab' },
  { city: 'Surat', pincode: '395001', state: 'Gujarat' },
  { city: 'Patna', pincode: '800001', state: 'Bihar' },
  { city: 'Kochi', pincode: '682001', state: 'Kerala' },
  { city: 'Indore', pincode: '452001', state: 'Madhya Pradesh' },
  { city: 'Guwahati', pincode: '781001', state: 'Assam' }
];

/**
 * Maps common e-commerce color names to authentic hex/gradient values for swatch display
 */
export function getColorSwatchStyle(colorName: string): { background: string; isLight: boolean } {
  const norm = (colorName || '').trim().toLowerCase();

  // Multi-tone split colors
  if (norm.includes('gold-black') || norm.includes('black-gold')) {
    return { background: 'linear-gradient(135deg, #D4AF37 50%, #111111 50%)', isLight: false };
  }
  if (norm.includes('white-gold')) {
    return { background: 'linear-gradient(135deg, #FFFFFF 50%, #D4AF37 50%)', isLight: true };
  }
  if (norm.includes('rgb') || norm.includes('rainbow')) {
    return { background: 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6)', isLight: false };
  }
  if (norm.includes('gold luxury tint')) {
    return { background: 'linear-gradient(135deg, #D4AF37 0%, #F5A623 100%)', isLight: false };
  }

  // Exact & partial color definitions
  const COLOR_MAP: Record<string, { hex: string; isLight: boolean }> = {
    // Blacks & Grays
    'black': { hex: '#111111', isLight: false },
    'classic black': { hex: '#111111', isLight: false },
    'onyx': { hex: '#111111', isLight: false },
    'onyx black': { hex: '#111111', isLight: false },
    'jet black': { hex: '#0A0A0A', isLight: false },
    'matte black': { hex: '#1A1A1A', isLight: false },
    'space black': { hex: '#1C1C1E', isLight: false },
    'space gray': { hex: '#4A4A4A', isLight: false },
    'charcoal': { hex: '#333333', isLight: false },
    'graphite': { hex: '#383838', isLight: false },
    'titanium': { hex: '#878681', isLight: false },
    'titanium gray': { hex: '#878681', isLight: false },
    'gray': { hex: '#6B7280', isLight: false },
    'grey': { hex: '#6B7280', isLight: false },
    'dark gray': { hex: '#374151', isLight: false },
    'light gray': { hex: '#D1D5DB', isLight: true },
    'silver': { hex: '#E5E7EB', isLight: true },
    'sterling silver': { hex: '#E2E8F0', isLight: true },
    'platinum': { hex: '#E5E4E2', isLight: true },

    // Whites & Creams
    'white': { hex: '#FFFFFF', isLight: true },
    'frost white': { hex: '#F8FAFC', isLight: true },
    'pure white': { hex: '#FFFFFF', isLight: true },
    'glossy white': { hex: '#F9FAFB', isLight: true },
    'pearl white': { hex: '#F3F4F6', isLight: true },
    'starlight': { hex: '#F0EADE', isLight: true },
    'ivory': { hex: '#FFFFF0', isLight: true },
    'beige': { hex: '#F5F5DC', isLight: true },
    'cream': { hex: '#FFFDD0', isLight: true },

    // Golds & Metallics
    'gold': { hex: '#D4AF37', isLight: false },
    'pure gold': { hex: '#FFD700', isLight: true },
    'yellow gold': { hex: '#D4AF37', isLight: false },
    'champagne gold': { hex: '#F7E7CE', isLight: true },
    'rose gold': { hex: '#B76E79', isLight: false },
    'imperial amber': { hex: '#F5A623', isLight: false },
    'amber': { hex: '#F59E0B', isLight: false },
    'bronze': { hex: '#CD7F32', isLight: false },
    'copper': { hex: '#B87333', isLight: false },

    // Blues
    'blue': { hex: '#2563EB', isLight: false },
    'royal blue': { hex: '#1D4ED8', isLight: false },
    'navy': { hex: '#0F1A3C', isLight: false },
    'midnight': { hex: '#191970', isLight: false },
    'midnight blue': { hex: '#191970', isLight: false },
    'sapphire blue': { hex: '#0F52BA', isLight: false },
    'sky blue': { hex: '#38BDF8', isLight: true },
    'light blue': { hex: '#7DD3FC', isLight: true },
    'cyan': { hex: '#06B6D4', isLight: false },
    'teal': { hex: '#0D9488', isLight: false },

    // Greens
    'green': { hex: '#10B981', isLight: false },
    'emerald': { hex: '#059669', isLight: false },
    'emerald green': { hex: '#059669', isLight: false },
    'forest green': { hex: '#22543D', isLight: false },
    'olive': { hex: '#556B2F', isLight: false },
    'mint': { hex: '#6EE7B7', isLight: true },
    'mint green': { hex: '#6EE7B7', isLight: true },
    'sage': { hex: '#9CA3AF', isLight: true },

    // Reds & Pinks
    'red': { hex: '#DC2626', isLight: false },
    'ruby red': { hex: '#BE123C', isLight: false },
    'crimson': { hex: '#991B1B', isLight: false },
    'maroon': { hex: '#800000', isLight: false },
    'burgundy': { hex: '#800020', isLight: false },
    'wine': { hex: '#722F37', isLight: false },
    'pink': { hex: '#EC4899', isLight: false },
    'rose': { hex: '#F43F5E', isLight: false },
    'coral': { hex: '#FF7F50', isLight: false },
    'salmon': { hex: '#FA8072', isLight: false },

    // Yellows & Oranges
    'yellow': { hex: '#EAB308', isLight: true },
    'orange': { hex: '#F97316', isLight: false },
    'peach': { hex: '#FFDAB9', isLight: true },

    // Purples
    'purple': { hex: '#8B5CF6', isLight: false },
    'violet': { hex: '#7C3AED', isLight: false },
    'lavender': { hex: '#C084FC', isLight: true },
    'lilac': { hex: '#C8A2C8', isLight: true },
    'plum': { hex: '#581C87', isLight: false },

    // Browns & Earth
    'brown': { hex: '#78350F', isLight: false },
    'tan': { hex: '#D2B48C', isLight: true },
    'khaki': { hex: '#C3B091', isLight: true },
    'chocolate': { hex: '#3E2723', isLight: false },
    'coffee': { hex: '#4A2C2A', isLight: false },

    // Standard fallback
    'standard': { hex: '#64748B', isLight: false },
  };

  // Direct map lookup
  if (COLOR_MAP[norm]) {
    return { background: COLOR_MAP[norm].hex, isLight: COLOR_MAP[norm].isLight };
  }

  // Keyword match
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (norm.includes(key)) {
      return { background: val.hex, isLight: val.isLight };
    }
  }

  // Graceful fallback for unmapped/branded color names
  return { 
    background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)', 
    isLight: false 
  };
}

// ---------------------------------------------------------------------------
// FREQUENTLY BOUGHT TOGETHER (FBT) SMART RELEVANCE & COMPATIBILITY HELPERS
// ---------------------------------------------------------------------------
const FBT_STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'wholesale', 'alike', 'premium', 'luxury', 'pro', 'ultra', 'royal', 'edition',
  'piece', 'pieces', 'pack', 'set', 'bulk', 'gold', 'standard', 'fast', 'delivery',
  'high', 'new', 'hot', 'sale', 'official', 'original'
]);

type ProductDomain =
  | 'food_grocery'
  | 'electronics_tech'
  | 'fashion_jewellery'
  | 'home_hardware'
  | 'beauty_wellness'
  | 'general';

function getProductDomain(p: Product): ProductDomain {
  const cat = (p.category || '').toLowerCase();
  const subCat = (p.subCategory || '').toLowerCase();
  const text = `${p.name || ''} ${p.brand || ''} ${p.description || ''} ${subCat}`.toLowerCase();

  // 1. Food, Spices & Grocery
  if (
    cat === 'grocery' ||
    cat === 'food_delivery' ||
    cat === 'delivery' ||
    /\b(saffron|spice|spices|ghee|bilona|biryani|pizza|caviar|almond|almonds|walnut|walnuts|cashew|cashews|tea|coffee|rice|dal|oil|snack|food|edible|honey|grain|flour|fruit|fruits|curry|masala)\b/i.test(text)
  ) {
    return 'food_grocery';
  }

  // 2. Electronics, Gadgets, Gaming & Computing
  if (
    cat === 'electronics' ||
    cat === 'gaming' ||
    cat === 'mobiles' ||
    cat === 'laptops' ||
    /\b(charger|chargers|type-c|cable|cables|usb|adapter|keyboard|controller|mouse|headphone|headphones|earphone|earphones|audio|sound|speaker|speakers|purifier|laptop|laptops|mobile|phone|oled|ram|ssd|battery|wireless|bluetooth|tech)\b/i.test(text)
  ) {
    return 'electronics_tech';
  }

  // 3. Fashion, Apparel, Jewellery & Accessories
  if (
    cat === 'fashion' ||
    cat === 'jewellery' ||
    cat === 'luxury' ||
    /\b(watch|watches|chronograph|necklace|chain|pendant|gown|dress|silk|satin|velvet|ribbon|ribbons|earring|earrings|ring|rings|bracelet|couture|fabric|attire|apparel)\b/i.test(text)
  ) {
    return 'fashion_jewellery';
  }

  // 4. Beauty, Wellness & Fragrance
  if (
    cat === 'beauty' ||
    /\b(serum|facial|glow|skin|skincare|cream|lotion|fragrance|perfume|candle|amber|oud|wellness)\b/i.test(text)
  ) {
    return 'beauty_wellness';
  }

  // 5. Furniture, Home & Hardware/Tools
  if (
    cat === 'furniture' ||
    cat === 'hardware' ||
    /\b(sofa|chair|ottoman|espresso|coffee maker|machine|tool|tools|toolkit|wrench|hardware|furniture|decor|table)\b/i.test(text)
  ) {
    return 'home_hardware';
  }

  return 'general';
}

function areDomainsIncompatible(d1: ProductDomain, d2: ProductDomain): boolean {
  if (d1 === 'general' || d2 === 'general') return false;
  if (d1 === d2) return false;

  // Strict domain clashes (e.g. food cannot be paired with electronics or hardware)
  const strictClashes: Record<ProductDomain, ProductDomain[]> = {
    food_grocery: ['electronics_tech', 'home_hardware', 'fashion_jewellery', 'beauty_wellness'],
    electronics_tech: ['food_grocery', 'beauty_wellness', 'fashion_jewellery'],
    fashion_jewellery: ['food_grocery', 'home_hardware'],
    home_hardware: ['food_grocery', 'beauty_wellness'],
    beauty_wellness: ['electronics_tech', 'home_hardware', 'food_grocery'],
    general: []
  };

  return strictClashes[d1]?.includes(d2) || false;
}

function computeFbtRelevanceScore(base: Product, candidate: Product): number {
  if (candidate.id === base.id) return -1;

  const baseDomain = getProductDomain(base);
  const candDomain = getProductDomain(candidate);

  // Eliminate completely incompatible domains (e.g. food + electronics charger)
  if (areDomainsIncompatible(baseDomain, candDomain)) {
    return -1;
  }

  let score = 0;

  // Tier 1: Exact subCategory match (e.g. Biryani -> Biryani, Oil & Ghee -> Oil & Ghee)
  const baseSubCat = (base.subCategory || '').trim().toLowerCase();
  const candSubCat = (candidate.subCategory || '').trim().toLowerCase();
  const hasSubCatMatch = Boolean(baseSubCat && candSubCat && baseSubCat === candSubCat);
  if (hasSubCatMatch) {
    score += 50;
  }

  // Tier 2: Same primary category
  const isSameCategory = (base.category || '').toLowerCase() === (candidate.category || '').toLowerCase();
  if (isSameCategory) {
    score += 20;
  }

  // Tier 3: Same brand atelier
  const baseBrand = (base.brand || '').trim().toLowerCase();
  const candBrand = (candidate.brand || '').trim().toLowerCase();
  const isSameBrand = Boolean(baseBrand && candBrand && baseBrand === candBrand);
  if (isSameBrand) {
    score += 25;
  }

  // Tier 4: Shared product domain affinity
  if (baseDomain !== 'general' && baseDomain === candDomain) {
    score += 15;
  }

  // Tier 5: Title Keyword overlap
  const getKeywords = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !FBT_STOP_WORDS.has(w));

  const baseKeywords = new Set(getKeywords(base.name));
  const candKeywords = getKeywords(candidate.name);

  let overlapCount = 0;
  for (const kw of candKeywords) {
    if (baseKeywords.has(kw)) {
      overlapCount++;
    }
  }
  score += overlapCount * 12;

  // Tier 6: Fast delivery affinity (customers like bundling 20-min delivery items)
  if (base.eligibleFor20MinDelivery && candidate.eligibleFor20MinDelivery) {
    score += 10;
  }

  // Strict check for broad categories like "wholesale":
  // Since "wholesale" naturally aggregates disparate product types, enforce that candidates
  // MUST share either a subCategory, brand, matching domain, or direct keyword overlap.
  if (base.category === 'wholesale' || candidate.category === 'wholesale') {
    const hasMeaningfulAffinity =
      hasSubCatMatch ||
      isSameBrand ||
      (baseDomain !== 'general' && baseDomain === candDomain) ||
      overlapCount > 0;

    if (!hasMeaningfulAffinity) {
      return -1;
    }
  }

  // Minimum threshold to prevent irrelevant pairings
  if (score < 20) {
    return -1;
  }

  return score;
}

export function getFrequentlyBoughtTogether(currentProduct: Product, allProducts: Product[]): Product[] {
  if (!allProducts || allProducts.length <= 1) return [];

  // Preference order:
  // 1. Same subCategory candidates first (if available)
  // 2. Same category candidates ranked by relevance score
  const scored = allProducts
    .filter((p) => p.id !== currentProduct.id)
    .map((candidate) => ({
      product: candidate,
      score: computeFbtRelevanceScore(currentProduct, candidate),
      sameSubCat: Boolean(
        currentProduct.subCategory &&
        candidate.subCategory &&
        currentProduct.subCategory.trim().toLowerCase() === candidate.subCategory.trim().toLowerCase()
      ),
      sameCat: (candidate.category || '').toLowerCase() === (currentProduct.category || '').toLowerCase()
    }))
    .filter((item) => item.score > 0);

  // Sort by:
  // - Same subCategory first
  // - Same category second
  // - Highest relevance score third
  scored.sort((a, b) => {
    if (a.sameSubCat !== b.sameSubCat) {
      return a.sameSubCat ? -1 : 1;
    }
    if (a.sameCat !== b.sameCat) {
      return a.sameCat ? -1 : 1;
    }
    return b.score - a.score;
  });

  return scored.slice(0, 2).map((item) => item.product);
}

interface ProductDetailProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (p: Product, qty: number, color?: string, size?: string) => void;
  onAddToCartAndCheckout: (p: Product, qty: number, color?: string, size?: string) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  isWishlisted: boolean;
  wishlistedIds?: number[];
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function ProductDetail({
  product,
  allProducts,
  onAddToCart,
  onAddToCartAndCheckout,
  onToggleWishlist,
  onSelectProduct,
  isWishlisted,
  wishlistedIds = [],
  showToast,
  isLightMode = false,
  onBack,
  showBackButton = true,
}: ProductDetailProps) {
  const { isAdmin, isEditMode, openEditProduct, openDeleteProduct, toggleProductVisibility } = useAdminEdit();
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const {
    id,
    name,
    brand,
    price,
    mrp,
    rating,
    reviewsCount,
    image,
    images: rawImages = [image],
    description,
    specifications,
    colors = ['Standard'],
    sizes = ['Fits All'],
    hsnCode = product.hsnCode,
    gstRate = product.gstRate ?? 18,
    countryOfOrigin = product.countryOfOrigin || 'India',
    manufacturerDetails = product.manufacturerDetails,
    packInfo = product.packInfo,
  } = product;

  const images = useMemo(() => {
    if (Array.isArray(rawImages) && rawImages.length > 0) return rawImages;
    if (image) return [image];
    return [];
  }, [rawImages, image]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [is360Active, setIs360Active] = useState(false);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [isFullScreenModalOpen, setIsFullScreenModalOpen] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0); // 0° to 359°
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);
  const [spinSpeed, setSpinSpeed] = useState(1);
  const [spinDirection, setSpinDirection] = useState<'cw' | 'ccw'>('cw');
  const [zoom360, setZoom360] = useState(1);
  const [fullScreenZoom, setFullScreenZoom] = useState(1);
  const [isDragging360, setIsDragging360] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartAngleRef = useRef(0);

  // Lock body scroll when either 360 or Full Screen modal is open
  useEffect(() => {
    const isAnyModalOpen = is360ModalOpen || isFullScreenModalOpen || Boolean(lightboxImage);
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [is360ModalOpen, isFullScreenModalOpen, lightboxImage]);

  // Keyboard accessibility: Escape to close modals, Arrow keys to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIs360ModalOpen(false);
        setIsFullScreenModalOpen(false);
        setLightboxImage(null);
      }
      if (isFullScreenModalOpen) {
        if (e.key === 'ArrowLeft') {
          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, images.length - 1)));
        } else if (e.key === 'ArrowRight') {
          setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [is360ModalOpen, isFullScreenModalOpen, images.length]);

  // Smooth continuous auto-rotation loop for 360 interactive viewer
  useEffect(() => {
    if (!is360ModalOpen || !isAutoSpinning || isDragging360) return;
    const interval = setInterval(() => {
      setSpinAngle((prev) => {
        const step = 1.6 * spinSpeed * (spinDirection === 'cw' ? 1 : -1);
        return (prev + step + 3600) % 360;
      });
    }, 28);
    return () => clearInterval(interval);
  }, [is360ModalOpen, isAutoSpinning, isDragging360, spinSpeed, spinDirection]);

  // Keep inline small 360 thumbnail animated if active
  useEffect(() => {
    let interval: any;
    if (is360Active && images.length > 1) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      }, 600);
    }
    return () => clearInterval(interval);
  }, [is360Active, images.length]);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  
  // Dynamic Dispatch & Delivery calculations
  const [timeLeft, setTimeLeft] = useState(4 * 3600 + 12 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 4 * 3600 + 12 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h} hrs ${m} mins ${s} secs`;
  };

  const getTomorrowFormattedDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc');
  const [openQuestions, setOpenQuestions] = useState<number[]>([0, 1, 2, 3]);

  const toggleQuestion = (idx: number) => {
    setOpenQuestions((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAllQuestions = () => {
    if (openQuestions.length === 4) {
      setOpenQuestions([]);
    } else {
      setOpenQuestions([0, 1, 2, 3]);
    }
  };

  // Mobile touch swipe gestures for main image carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeWidth = 50;

    if (Math.abs(diffX) > minSwipeWidth) {
      if (diffX > 0) {
        // Swiped left -> next
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swiped right -> prev
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Delivery Destination Location State & Modal
  const [deliveryLocation, setDeliveryLocation] = useState<{
    city: string;
    pincode: string;
    state?: string;
  }>(() => {
    const saved = localStorage.getItem('alike_delivery_location');
    return saved ? JSON.parse(saved) : { city: 'New Delhi', pincode: '110001', state: 'Delhi' };
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [customPincodeInput, setCustomPincodeInput] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const getDeliveryEstimateText = (pincodeStr: string) => {
    const today = new Date();
    let minDays = 2;
    let maxDays = 4;
    if (pincodeStr.startsWith('11') || pincodeStr.startsWith('12') || pincodeStr.startsWith('20')) {
      minDays = 1;
      maxDays = 2;
    } else if (pincodeStr.startsWith('40') || pincodeStr.startsWith('56') || pincodeStr.startsWith('70') || pincodeStr.startsWith('60')) {
      minDays = 2;
      maxDays = 3;
    } else {
      minDays = 3;
      maxDays = 5;
    }
    const d1 = new Date(today);
    d1.setDate(today.getDate() + minDays);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + maxDays);

    const m1 = d1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const m2 = d2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Guaranteed by ${m1} - ${m2}`;
  };

  const handleSelectLocation = (loc: { city: string; pincode: string; state?: string }) => {
    setDeliveryLocation(loc);
    localStorage.setItem('alike_delivery_location', JSON.stringify(loc));
    setIsLocationModalOpen(false);
    showToast(`Delivery location updated to ${loc.city}, ${loc.pincode}`, 'success');
  };

  const handleApplyCustomPincode = (e: FormEvent) => {
    e.preventDefault();
    const pin = customPincodeInput.trim();
    if (!pin || pin.length !== 6 || isNaN(Number(pin))) {
      showToast('Please enter a valid 6-digit Pincode (e.g. 400001)', 'warning');
      return;
    }
    const matched = POPULAR_LOCATIONS.find((l) => l.pincode === pin);
    const city = matched ? matched.city : `Region ${pin.slice(0, 2)}`;
    const state = matched ? matched.state : 'India';
    handleSelectLocation({ city, pincode: pin, state });
    setCustomPincodeInput('');
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsDetectingLocation(false);
          const autoLoc = { city: 'Bengaluru', pincode: '560001', state: 'Karnataka' };
          handleSelectLocation(autoLoc);
        },
        () => {
          setIsDetectingLocation(false);
          const autoLoc = { city: 'New Delhi', pincode: '110001', state: 'Delhi' };
          handleSelectLocation(autoLoc);
        },
        { timeout: 3500 }
      );
    } else {
      setTimeout(() => {
        setIsDetectingLocation(false);
        handleSelectLocation({ city: 'New Delhi', pincode: '110001', state: 'Delhi' });
      }, 500);
    }
  };

  const showEmiPlansToast = () => {
    const monthlyEmi = Math.round(price / 12);
    const sixEmi = Math.round(price / 6);
    showToast(`EMI Options: 3 Months No-Cost EMI @ ₹${(price/3).toLocaleString('en-IN')}/mo | 6 Months @ ₹${sixEmi.toLocaleString('en-IN')}/mo | 12 Months @ ₹${monthlyEmi.toLocaleString('en-IN')}/mo`, 'info');
  };

  // Related products under same category
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discountPercent = Math.round(((mrp - price) / mrp) * 100);

  const handleQtyChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    showToast(`Added ${quantity}x ${name} to your cart successfully!`, 'success');
  };

  const handleBuyNow = () => {
    onAddToCartAndCheckout(product, quantity, selectedColor, selectedSize);
  };

  // Load initial reviews from localStorage or default
  const getInitialReviews = () => {
    try {
      const saved = localStorage.getItem(`alike_reviews_prod_${product.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore
    }
    return [
      { 
        id: 1, 
        name: 'Kunal Sen', 
        rating: 5, 
        date: '2026-06-15', 
        comment: 'Undeniably the premier luxury purchase I have made here! Precision is incredible.',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80'
        ]
      },
      { 
        id: 2, 
        name: 'Ankita Roy', 
        rating: 4, 
        date: '2026-06-10', 
        comment: 'Extremely stunning packaging and finish. Highly satisfied, came in pristine order.',
        images: []
      },
      { 
        id: 3, 
        name: 'Nikhil Mehta', 
        rating: 5, 
        date: '2026-06-02', 
        comment: 'Absolutely authentic! Hand-checked seal was intact. Customer support was incredibly swift.',
        images: []
      }
    ];
  };

  const [reviewsList, setReviewsList] = useState(getInitialReviews);

  useEffect(() => {
    setReviewsList(getInitialReviews());
  }, [product.id]);

  // Form states for custom reviews
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5); // Default to 5 stars for high user satisfaction starting point
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newReviewImages, setNewReviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [helpfulMap, setHelpfulMap] = useState<Record<number, { count: number; userLiked: boolean }>>({
    1: { count: 18, userLiked: false },
    2: { count: 11, userLiked: false },
    3: { count: 7, userLiked: false },
  });

  const toggleHelpful = (reviewId: number) => {
    setHelpfulMap((prev) => {
      const curr = prev[reviewId] || { count: 4, userLiked: false };
      const nextLiked = !curr.userLiked;
      const nextCount = nextLiked ? curr.count + 1 : Math.max(0, curr.count - 1);
      if (nextLiked) {
        showToast('Marked as helpful review', 'success');
      }
      return {
        ...prev,
        [reviewId]: { count: nextCount, userLiked: nextLiked }
      };
    });
  };

  const scrollToSection = (id: 'desc' | 'reviews' | 'qa') => {
    setActiveTab(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections: Array<'desc' | 'reviews' | 'qa'> = ['desc', 'reviews', 'qa'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(`section-${secId}`);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(secId);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const [fbtMainChecked, setFbtMainChecked] = useState(true);
  const [fbt1Checked, setFbt1Checked] = useState(true);
  const [fbt2Checked, setFbt2Checked] = useState(true);

  useEffect(() => {
    setFbtMainChecked(true);
    setFbt1Checked(true);
    setFbt2Checked(true);
    setActiveImageIndex(0);
    setSelectedColor(colors[0] || 'Standard');
    setSelectedSize(sizes[0] || 'Fits All');
    setQuantity(1);
  }, [product.id, colors, sizes]);

  const getLoggedInUserName = () => {
    try {
      const saved = localStorage.getItem('alike_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch (e) {
      // Ignore
    }
    return 'Guest User';
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map(file => URL.createObjectURL(file as Blob));
      setNewReviewImages(prev => [...prev, ...newUrls]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setNewReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostReview = (e: FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || newRating === 0) {
      showToast('Please write a comment and select a rating star', 'error');
      return;
    }

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const finalName = reviewerName.trim() || getLoggedInUserName() || 'Verified Customer';

    const newRev = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: finalName,
      rating: newRating,
      date: formattedDate,
      comment: newReviewText,
      images: newReviewImages
    };

    const updatedReviews = [newRev, ...reviewsList];
    setReviewsList(updatedReviews);
    try {
      localStorage.setItem(`alike_reviews_prod_${product.id}`, JSON.stringify(updatedReviews));
    } catch (err) {
      // Ignore
    }

    // Reset Form
    setNewReviewText('');
    setReviewerName('');
    setNewRating(5); // Reset to default 5 stars
    setNewHoverRating(0);
    setNewReviewImages([]);
    setShowWriteForm(false);
    showToast('Your comment and review have been posted successfully!', 'success');
  };

  const handleClose = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div id="product-detail-root" className={`relative w-full font-['Inter',sans-serif] text-xs pb-16 transition-colors duration-200 overflow-visible ${
      isLightMode ? 'bg-[#FAFAF7] text-[#0F172A]' : 'bg-[#011014] text-[#E2E8F0]'
    }`}>
      {/* 1. TOP BAR: Sovereign brand logo hot-pink hairline accent at the very top */}
      <div className="h-[2px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] w-full" />

      {/* Top Header & Navigation Bar */}
      <div className={`px-4 sm:px-6 lg:px-8 py-3 space-y-2 border-b relative z-20 transition-colors ${
        isLightMode ? 'bg-white/80 border-[#EADFC9] backdrop-blur-md' : 'bg-[#0A0F24]/80 border-[#162744] backdrop-blur-md'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                id="premium-back-button"
                type="button"
                onClick={handleClose}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold cursor-pointer text-xs transition-all shadow-xs active:scale-95 border ${
                  isLightMode 
                    ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-[#EADFC9] hover:border-[#F5A623] hover:text-[#0F1A3C]' 
                    : 'bg-[#0B1B32] hover:bg-[#122644] text-neutral-200 border-[#162744] hover:border-[#F5A623] hover:text-[#F5A623]'
                }`}
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-[#F5A623]" />
                <span>← Back</span>
              </button>
            )}

            {/* Categories dropdown with chevron icon */}
            <div className="relative">
              <button
                id="product-detail-categories-dropdown-btn"
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className={`flex items-center gap-1.5 font-bold text-xs cursor-pointer select-none transition-colors px-3 py-2 rounded-xl border ${
                  isLightMode 
                    ? 'bg-white border-neutral-300 text-[#0F172A] hover:text-[#B48C28]' 
                    : 'bg-[#0B1B32] border-[#162744] text-[#F5A623] hover:text-[#FBD088]'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div className={`absolute top-full left-0 mt-1.5 w-56 rounded-xl shadow-2xl z-50 py-2 border animate-fade-in ${
                  isLightMode ? 'bg-white border-[#EADFC9] text-gray-800' : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0]'
                }`}>
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    isLightMode ? 'text-gray-400' : 'text-[#F5A623]/80'
                  }`}>Explore Catalog</div>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoriesDropdownOpen(false);
                        if (onBack) onBack();
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        isLightMode ? 'hover:bg-[#F5A623]/10 hover:text-[#B48C28]' : 'hover:bg-[#162744] hover:text-[#F5A623]'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumb: Category > Subcategory > Product name */}
        <div className={`flex items-center gap-1.5 text-[11px] flex-wrap ${
          isLightMode ? 'text-gray-500' : 'text-slate-400'
        }`}>
          <span className={`hover:underline cursor-pointer ${isLightMode ? 'text-[#0F172A] hover:text-[#B48C28]' : 'text-[#D3E8ED] hover:text-[#F5A623]'}`} onClick={handleClose}>
            {product.category ? product.category.toUpperCase() : 'BOUTIQUE'}
          </span>
          <span>&gt;</span>
          <span className={`hover:underline cursor-pointer ${isLightMode ? 'text-[#0F172A] hover:text-[#B48C28]' : 'text-[#D3E8ED] hover:text-[#F5A623]'}`} onClick={handleClose}>
            {brand || 'Atelier Signature'}
          </span>
          <span>&gt;</span>
          <span className={`font-medium truncate max-w-[240px] sm:max-w-md ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{name}</span>
        </div>
      </div>

      {/* 2. LAYOUT: 3-column grid (image gallery | product details | delivery/purchase sidebar) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 border-b transition-colors ${
        isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
      }`}>
        
        {/* =======================================================
            COLUMN 1: IMAGE GALLERY (left, lg:col-span-4)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-4 p-4 lg:p-5 border-r space-y-4 transition-colors ${
          isLightMode ? 'border-[#EADFC9] bg-white' : 'border-[#162744] bg-[#0A0F24]/50'
        }`}>
          {/* Main Display Image Frame */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLightboxImage(images[activeImageIndex] || image);
              setIsFullScreenModalOpen(true);
              setFullScreenZoom(1);
            }}
            title="Click to view full screen"
            className={`relative aspect-square w-full rounded-2xl overflow-hidden group select-none border transition-all duration-300 cursor-zoom-in ${
            isLightMode 
              ? 'bg-[#FAFAF7] border-[#EADFC9] hover:border-[#F5A623]/60 shadow-sm' 
              : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#F5A623]/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
          }`}>
            
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={images[activeImageIndex] || image}
                alt={name}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105 origin-center"
                referrerPolicy="no-referrer"
                id="main-product-display-image"
              />
            </AnimatePresence>
          </div>

          {/* Clean Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scrollbar py-1">
              {images.map((img, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <button
                    key={idx}
                    id={`thumb-image-btn-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setIs360Active(false);
                    }}
                    className={`relative w-14 h-14 rounded-xl shrink-0 cursor-pointer overflow-hidden transition-all duration-200 border-2 ${
                      isActive 
                        ? 'border-[#F5A623] ring-2 ring-[#F5A623]/30 scale-105 shadow-md' 
                        : isLightMode 
                          ? 'border-[#EADFC9] bg-white hover:border-gray-400 opacity-70 hover:opacity-100' 
                          : 'border-[#162744] bg-[#0B1B32] hover:border-[#F5A623]/40 opacity-70 hover:opacity-100'
                    }`}
                    title={`View image ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Action buttons below main image */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              id="product-360-view-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIs360ModalOpen(true);
                setIsAutoSpinning(true);
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                is360ModalOpen 
                  ? 'bg-[#F5A623] text-black border-[#F5A623] shadow-md shadow-amber-500/20' 
                  : isLightMode 
                    ? 'bg-white border-[#EADFC9] text-[#0F172A] hover:bg-amber-50 hover:border-amber-400' 
                    : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0] hover:border-[#F5A623]/60 hover:bg-[#0E223F]'
              }`}
            >
              <RotateCw className="w-4 h-4 text-amber-500" />
              <span>360° View</span>
            </button>
            <button
              type="button"
              id="product-full-screen-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFullScreenModalOpen(true);
                setFullScreenZoom(1);
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                isFullScreenModalOpen
                  ? 'bg-[#F5A623] text-black border-[#F5A623] shadow-md shadow-amber-500/20'
                  : isLightMode 
                    ? 'bg-white border-[#EADFC9] text-[#0F172A] hover:bg-amber-50 hover:border-amber-400' 
                    : 'bg-[#0B1B32] border-[#162744] text-[#E2E8F0] hover:border-[#F5A623]/60 hover:bg-[#0E223F]'
              }`}
            >
              <Maximize2 className="w-4 h-4 text-amber-500" />
              <span>Full Screen</span>
            </button>
          </div>
        </div>

        {/* =======================================================
            COLUMN 2: PRODUCT DETAILS (middle, lg:col-span-5)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-5 p-4 lg:p-6 border-r space-y-4 transition-colors ${
          isLightMode ? 'border-[#EADFC9] bg-white' : 'border-[#162744] bg-[#0A0F24]/30'
        }`}>
          
          {/* Sovereign Atelier Reserve / Flash Deal Banner */}
          <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 shadow-md transition-all ${
            isLightMode
              ? 'bg-gradient-to-r from-[#FF007F]/15 via-[#FFF5F9] to-[#FAFAF7] border-[#FF007F]/30 text-[#0F172A]'
              : 'bg-gradient-to-r from-[#1B0B1D] via-[#2A102E] to-[#0A0F24] border-[#FF007F]/40 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,0,127,0.18)]'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF007F]/20 flex items-center justify-center text-[#FF007F]">
                <Zap className="w-4 h-4 fill-[#FF007F]" />
              </div>
              <div>
                <span className="font-black uppercase tracking-wider text-xs block text-[#FF007F]">ATELIER RESERVE SALE</span>
                <span className="text-[10px] opacity-70">Exclusive Vault Pricing</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="text-[10px] opacity-80">Ends in:</div>
              <div className="bg-black/60 px-2.5 py-1 rounded-lg text-[#FF007F] font-bold font-mono text-xs border border-[#FF007F]/30 shadow-inner">
                {formatTimeLeft(timeLeft)}
              </div>
            </div>

            <div className="w-full flex items-center justify-between text-[10px] pt-1.5 border-t border-black/10 dark:border-white/10 mt-0.5">
              <span className="opacity-80 font-medium">342 reserved in last 24 hours</span>
              <div className="w-28 bg-black/40 rounded-full h-1.5 overflow-hidden border border-[#FF007F]/20">
                <div className="bg-gradient-to-r from-[#FF1990] to-[#FF007F] h-full w-[78%]" />
              </div>
            </div>
          </div>

          {/* Title & Brand badge */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#F5A623] text-[#0A0F24] flex items-center justify-center font-black text-[10px] uppercase shrink-0 shadow-xs">
                  {brand ? brand.charAt(0) : 'A'}
                </div>
                <span className={`text-[11px] font-semibold tracking-wide ${
                  isLightMode ? 'text-gray-500' : 'text-[#D3E8ED]/80'
                }`}>{brand || 'Official Atelier Flagship'}</span>
              </div>

              {/* Multi-Seller Shop Tag */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.subCategory && (
                  <span className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300 text-neutral-800' : 'bg-neutral-900 border-neutral-700 text-neutral-200'
                  }`}>
                    {product.subCategory}
                  </span>
                )}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                  isLightMode ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                }`}>
                  <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                  <span>Sold by: <strong className="font-bold">{product.sellerShopName || 'ALIKE-ND Official'}</strong></span>
                  {product.sellerVerified && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold ml-1"
                      title="Verified Seller — Admin-reviewed NID & Face Verification"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>Verified Seller</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Live Controls */}
            {isAdmin && isEditMode && (
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <button
                  id="admin-edit-product-details-btn"
                  type="button"
                  onClick={() => openEditProduct(product)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer hover:scale-102 active:scale-98"
                  title="Edit product name, images, prices, specs, stock directly"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Product Details</span>
                </button>

                <button
                  id="admin-toggle-visibility-btn"
                  type="button"
                  disabled={togglingVisibility}
                  onClick={async () => {
                    setTogglingVisibility(true);
                    await toggleProductVisibility(product);
                    setTogglingVisibility(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                    product.isHidden || product.isPublished === false
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-500/30'
                  }`}
                  title={
                    product.isHidden || product.isPublished === false
                      ? 'Publish product (make visible to customers)'
                      : 'Hide / Unpublish product from public customers'
                  }
                >
                  {product.isHidden || product.isPublished === false ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Publish Product</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      <span>Hide / Unpublish</span>
                    </>
                  )}
                </button>

                <button
                  id="admin-delete-product-btn"
                  type="button"
                  onClick={() => openDeleteProduct(product)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  title="Delete product permanently from catalog"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Product</span>
                </button>

                {(product.isHidden || product.isPublished === false) && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                    UNPUBLISHED
                  </span>
                )}
              </div>
            )}

            {/* Product title */}
            <h1 id="product-detail-name" className={`text-lg sm:text-xl font-bold font-serif leading-snug line-clamp-2 ${
              isLightMode ? 'text-[#0F172A]' : 'text-white'
            }`}>
              {name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 fill-current ${
                        i < Math.floor(rating) ? 'text-[#F5A623] fill-[#F5A623]' : 'text-gray-400 opacity-40'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`hover:underline cursor-pointer font-bold transition-colors ${
                    isLightMode ? 'text-[#B48C28]' : 'text-[#F5A623]'
                  }`}
                  onClick={() => {
                    setActiveTab('reviews');
                    document.getElementById("tab-btn-reviews")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  {rating} ({reviewsCount} Ratings)
                </span>
                <span className="opacity-30">|</span>
                <span
                  className={`hover:underline cursor-pointer font-medium transition-colors ${
                    isLightMode ? 'text-gray-600' : 'text-[#D3E8ED]'
                  }`}
                  onClick={() => {
                    setActiveTab('qa');
                    document.getElementById("tab-btn-qa")?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  128 Answered Questions
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast("Product link copied!", "success");
                  }}
                  className={`p-2 rounded-xl border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                    isLightMode 
                      ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-700' 
                      : 'bg-[#0B1B32] border-[#162744] text-slate-300 hover:text-[#F5A623] hover:border-[#F5A623]/40'
                  }`}
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  id={`wishlist-btn-${id}`}
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs product-action-btn ${
                    isWishlisted 
                      ? 'bg-red-500/15 border-red-400 text-red-500 hover:bg-red-500/25' 
                      : isLightMode 
                        ? 'bg-white hover:bg-neutral-50 border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-700' 
                        : 'bg-[#0B1B32] border-[#162744] text-slate-300 hover:text-[#F5A623] hover:border-[#F5A623]/40'
                  }`}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart className={`w-3.5 h-3.5 transition-transform ${isWishlisted ? 'fill-red-500 text-red-500 hover:text-red-600 animate-heart-pop' : 'text-current'}`} />
                </button>
              </div>
            </div>

            {/* Brand row */}
            <div className={`flex items-center gap-1.5 text-[11px] pt-0.5 ${
              isLightMode ? 'text-gray-500' : 'text-slate-400'
            }`}>
              <span>Brand:</span>
              <span className={`font-bold hover:underline cursor-pointer ${
                isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
              }`}>{brand || 'ALIKE ATELIER'}</span>
              <span className="opacity-30 mx-1">|</span>
              <span className={`hover:underline cursor-pointer ${
                isLightMode ? 'text-[#B48C28]' : 'text-[#D3E8ED]'
              }`}>More products from this guild</span>
            </div>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Price: Luxury Price display */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span id="detail-price-tag" className={`text-3xl sm:text-4xl font-black tracking-tight font-serif ${
                isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
              }`}>
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm line-through opacity-50">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
              {discountPercent > 0 && (
                <span className="bg-gradient-to-r from-[#FF1990] to-[#FF007F] text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-60">Curated Sovereign Price inclusive of all duties and GST taxes.</p>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Variant selector: Color Swatches */}
          {colors && colors.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-75 font-medium flex items-center justify-between">
                <div>
                  Color Family: <span className={`font-bold ml-1 ${isLightMode ? 'text-black' : 'text-white'}`}>{selectedColor}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 items-center py-1">
                {colors.map((col) => {
                  const isSelected = col === selectedColor;
                  const swatch = getColorSwatchStyle(col);

                  return (
                    <button
                      key={col}
                      id={`color-swatch-${col.replace(/\s+/g, '-').toLowerCase()}`}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      title={col}
                      aria-label={`Select color ${col}`}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full relative flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-90 hover:scale-110 shrink-0 ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-[#F5A623] dark:ring-offset-neutral-900 shadow-md scale-105'
                          : isLightMode
                          ? 'border border-black/20 hover:border-[#F5A623] shadow-2xs'
                          : 'border border-white/25 hover:border-[#F5A623]/70 shadow-2xs'
                      }`}
                      style={{ background: swatch.background }}
                    >
                      {/* Subtle inner highlight rim for depth */}
                      <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/15 pointer-events-none" />

                      {/* Checkmark indicator for selected state */}
                      {isSelected && (
                        <Check
                          className={`w-4 h-4 stroke-[3] transition-transform duration-200 drop-shadow-sm ${
                            swatch.isLight ? 'text-neutral-950' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes Selection */}
          {sizes && sizes.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs opacity-75 font-medium">
                Size Variant: <span className={`font-bold ml-1 ${isLightMode ? 'text-black' : 'text-white'}`}>{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    id={`size-pill-${sz}`}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      sz === selectedSize
                        ? 'border-2 border-[#F5A623] bg-[#F5A623]/15 text-[#B48C28] dark:text-[#F5A623] shadow-xs'
                        : isLightMode
                          ? 'border-[#EADFC9] bg-white text-gray-700 hover:border-gray-400'
                          : 'border-[#162744] bg-[#0B1B32] text-slate-300 hover:border-[#F5A623]/40'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4 text-xs">
            <span className="opacity-75 font-medium w-20">Quantity</span>
            <div className={`inline-flex items-center rounded-xl border overflow-hidden ${
              isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0B1B32] border-[#162744]'
            }`}>
              <button
                type="button"
                onClick={() => handleQtyChange(quantity - 1)}
                className={`w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  isLightMode ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' : 'bg-[#162744] hover:bg-[#1f365c] text-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className={`w-12 text-center font-extrabold text-xs select-none ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQtyChange(quantity + 1)}
                className={`w-8 h-8 flex items-center justify-center font-bold cursor-pointer transition-colors ${
                  isLightMode ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800' : 'bg-[#162744] hover:bg-[#1f365c] text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS: Match site's signature buttons */}
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button
              id="buy-now-action-btn"
              onClick={handleBuyNow}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,0,127,0.35)] active:scale-[0.98] transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Buy Now</span>
            </button>

            <button
              id="add-to-cart-action-btn"
              onClick={handleAddToCart}
              className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-2 active:scale-[0.98] ${
                isLightMode
                  ? 'border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white'
                  : 'bg-[#0B1B32] border-[#F5A623]/60 text-[#F5A623] hover:bg-[#F5A623]/15 shadow-sm'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Quick Indian Statutory Marketplace Badges */}
          <div className={`p-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono ${
            isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9] text-neutral-600' : 'bg-[#0B1B32]/40 border-[#162744] text-slate-300'
          }`}>
            <span className="flex items-center gap-1 font-semibold">
              <span className="text-amber-500">🇮🇳</span> Origin: <strong className={isLightMode ? 'text-neutral-900' : 'text-white'}>{countryOfOrigin || 'India'}</strong>
            </span>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-1 font-semibold">
              <span>🧾</span> GST: <strong className="text-amber-600 dark:text-amber-400">{gstRate}% Incl.</strong>
            </span>
            {hsnCode && (
              <>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1 font-semibold">
                  <span>🏷️</span> HSN: <strong className={isLightMode ? 'text-neutral-900' : 'text-white'}>{hsnCode}</strong>
                </span>
              </>
            )}
            {packInfo && (
              <>
                <span className="opacity-30">|</span>
                <span className="flex items-center gap-1 font-semibold">
                  <span>📦</span> Qty: <strong className={isLightMode ? 'text-neutral-900' : 'text-white'}>{packInfo}</strong>
                </span>
              </>
            )}
          </div>

        </div>

        {/* =======================================================
            COLUMN 3: DELIVERY SIDEBAR (right, lg:col-span-3)
            ======================================================= */}
        <div className={`col-span-1 lg:col-span-3 p-4 space-y-4 text-xs transition-colors ${
          isLightMode ? 'bg-[#FAFAF7]' : 'bg-[#0A0F24]/80'
        }`}>
          
          {/* Delivery Options Header */}
          <div className={`flex items-center justify-between border-b pb-2.5 ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <span className={`font-bold font-serif text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Delivery Corridor</span>
            <span title="Delivery details" className="inline-flex items-center">
              <Info className="w-3.5 h-3.5 opacity-50 cursor-pointer" />
            </span>
          </div>

          {/* Location row */}
          <div className="flex items-start justify-between gap-2 text-[11px]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <span className={`leading-snug ${isLightMode ? 'text-gray-800' : 'text-slate-200'}`}>
                Deliver to <strong>{deliveryLocation.city}, {deliveryLocation.pincode}</strong>
              </span>
            </div>
            <button
              type="button"
              id="change-location-btn"
              onClick={() => setIsLocationModalOpen(true)}
              className={`font-black text-[10px] uppercase tracking-wider shrink-0 cursor-pointer hover:underline ${
                isLightMode ? 'text-[#B48C28]' : 'text-[#F5A623]'
              }`}
            >
              CHANGE
            </button>
          </div>

          {/* Delivery speed row */}
          <div className={`flex items-start justify-between gap-2 text-[11px] pt-2 border-t ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <div className="flex items-start gap-2">
              <Truck className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <div>
                <div className={`font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>White-Glove Delivery</div>
                <div className="opacity-60 text-[10px]">{getDeliveryEstimateText(deliveryLocation.pincode)}</div>
              </div>
            </div>
            <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>₹49</span>
          </div>

          {/* Cash on Delivery row */}
          <div className={`flex items-center gap-2 text-[11px] pt-2 border-t ${
            isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className={isLightMode ? 'text-gray-700' : 'text-slate-200'}>Cash on Delivery Available</span>
          </div>

          {/* Divider */}
          <div className={`border-b ${isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'}`} />

          {/* Merchant Section */}
          <div className={`p-3 rounded-xl border space-y-2.5 text-[11px] ${
            isLightMode 
              ? 'bg-white border-[#EADFC9]' 
              : 'bg-[#0B1B32] border-[#162744]'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="opacity-50 text-[10px] block">Sold By</span>
                <div className={`font-bold truncate max-w-[140px] flex items-center gap-1.5 ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                  <Store className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
                  <span className="truncate">{product.sellerShopName || 'ALIKE-ND Official'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast(`Connected to ${product.sellerShopName || 'ALIKE-ND Official'} customer support!`, "info")}
                className="bg-[#F5A623] hover:bg-[#e0951a] text-[#0A0F24] text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>

            <div className={`grid grid-cols-2 gap-2 text-[10px] pt-2 border-t ${
              isLightMode ? 'border-gray-100' : 'border-[#162744]'
            }`}>
              <div>
                <span className="opacity-50 block">Positive Rating</span>
                <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>98%</span>
              </div>
              <div>
                <span className="opacity-50 block">On-time Delivery</span>
                <span className={`font-black text-xs ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>99%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

        {/* Product Sections with Sticky ScrollSpy Indicator Bar */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Scrollable Section Navigation Indicator Bar */}
          <div className={`border rounded-2xl p-1.5 sm:p-2 shadow-sm flex items-center gap-1.5 sm:gap-3 overflow-x-auto scrollbar-none whitespace-nowrap flex-nowrap select-none transition-colors ${
            isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/80 border-[#162744]'
          }`}>
            <button
              id="tab-btn-desc"
              type="button"
              onClick={() => scrollToSection('desc')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'desc' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#F5A623] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-4 h-4 text-current" />
              <span>Product Description</span>
              {activeTab === 'desc' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]" />
              )}
            </button>

            <button
              id="tab-btn-reviews"
              type="button"
              onClick={() => scrollToSection('reviews')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'reviews' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#FF007F] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="w-4 h-4 fill-current text-current" />
              <span>Reviews & Ratings ({reviewsList.length})</span>
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]" />
              )}
            </button>

            <button
              id="tab-btn-qa"
              type="button"
              onClick={() => scrollToSection('qa')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer relative flex items-center gap-2 shrink-0 rounded-xl ${
                activeTab === 'qa' 
                  ? isLightMode
                    ? 'bg-white text-[#0F172A] shadow-sm'
                    : 'bg-[#162744] text-[#FF007F] shadow-sm'
                  : isLightMode
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-black/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-current" />
              <span>Questions & Answers</span>
              {activeTab === 'qa' && (
                <span className="absolute bottom-0 left-3 right-3 h-[3px] bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] rounded-full shadow-[0_0_8px_rgba(255,0,127,0.6)]" />
              )}
            </button>
          </div>

          {/* Section 1: Product Description */}
          <div id="section-desc" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <FileText className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Product Description
                  </h3>
                  <p className="text-xs opacity-60">Overview, materials, and authenticity details</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                Atelier Verified
              </span>
            </div>

            <div className={`p-5 sm:p-7 rounded-xl border space-y-4 ${
              isLightMode 
                ? 'bg-[#FAFAF7] border-[#EADFC9]' 
                : 'bg-[#0B1B32]/60 border-[#162744]'
            }`}>
              {/* Key Highlights if configured in Daraz Studio */}
              {Array.isArray(product.highlights) && product.highlights.filter(Boolean).length > 0 && (
                <div className={`p-4 rounded-xl border space-y-2 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/70 border-[#162744]'
                }`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F5A623]">
                    Key Product Highlights
                  </div>
                  <ul className={`list-disc list-inside text-xs sm:text-sm space-y-1.5 ${
                    isLightMode ? 'text-gray-700' : 'text-slate-200'
                  }`}>
                    {product.highlights.filter(Boolean).map((hl, idx) => (
                      <li key={idx}>{hl}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/<[a-z][\s\S]*>/i.test(description) ? (
                <div
                  className={`prose prose-sm max-w-none leading-relaxed ${isLightMode ? 'text-gray-700' : 'text-slate-200'}`}
                  dangerouslySetInnerHTML={{
                    __html: description
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                      .replace(/\son\w+\s*=/gi, ''),
                  }}
                />
              ) : (
                <p className={`text-sm sm:text-base leading-relaxed ${isLightMode ? 'text-gray-700' : 'text-slate-200'}`}>
                  {description}
                </p>
              )}

              {(product.whatsInTheBox || product.careInstructions || product.warrantyConfig?.warrantyDuration) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {product.whatsInTheBox && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/70 border-[#162744]'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-0.5">
                        What's in the Box
                      </span>
                      <span className="font-semibold">{product.whatsInTheBox}</span>
                    </div>
                  )}
                  {product.careInstructions && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/70 border-[#162744]'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-0.5">
                        Care Instructions
                      </span>
                      <span className="font-semibold">{product.careInstructions}</span>
                    </div>
                  )}
                  {product.warrantyConfig?.warrantyDuration && (
                    <div className={`p-3 rounded-xl border text-xs ${
                      isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/70 border-[#162744]'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-0.5">
                        Warranty Coverage
                      </span>
                      <span className="font-semibold">
                        {product.warrantyConfig.warrantyDuration} ({product.warrantyConfig.warrantyType || 'Manufacturer'})
                      </span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
                Crafted to high standards, this product offers superior reliability and style. Sourced directly from authorized distributors ensuring authentic product quality and verified craftsmanship.
              </p>

              {/* Highlight Features Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>100% Authentic</p>
                    <p className="text-[11px] opacity-60">Direct from atelier</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Express Delivery</p>
                    <p className="text-[11px] opacity-60">Insured luxury transit</p>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/80 border-[#162744]'
                }`}>
                  <div className="p-2 rounded-xl bg-[#F5A623]/15 text-[#F5A623]">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>Easy Returns</p>
                    <p className="text-[11px] opacity-60">Complimentary 7-day guarantee</p>
                  </div>
                </div>
              </div>

              {/* Product Specifications & Statutory Information Table (Rule 6, Consumer Protection E-Commerce Rules 2020) */}
              <div className={`mt-4 rounded-xl border overflow-hidden ${
                isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/90 border-[#162744]'
              }`}>
                <div className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between ${
                  isLightMode ? 'bg-amber-50/70 border-[#EADFC9]' : 'bg-[#0B1B32] border-[#162744]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-500" />
                    <h4 className={`text-xs sm:text-sm font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                      Product Specifications & Regulatory Compliance
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Statutory Details
                  </span>
                </div>

                <div className="divide-y divide-black/5 dark:divide-white/5 text-xs">
                  {/* Brand Atelier */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400">Brand</span>
                    <span className={`sm:col-span-2 font-medium ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                      {brand || 'ALIKE ATELIER'}
                    </span>
                  </div>

                  {/* Country of Origin */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400">Country of Origin</span>
                    <span className={`sm:col-span-2 font-bold ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                      {countryOfOrigin || 'India'}
                    </span>
                  </div>

                  {/* GST Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400">GST Rate</span>
                    <span className="sm:col-span-2 font-bold text-amber-600 dark:text-amber-400 font-mono">
                      Inclusive of {gstRate || 18}% GST
                    </span>
                  </div>

                  {/* HSN / SAC Code */}
                  {hsnCode && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400">HSN Code</span>
                      <span className={`sm:col-span-2 font-mono font-medium ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                        {hsnCode}
                      </span>
                    </div>
                  )}

                  {/* Pack / Net Quantity Info */}
                  {packInfo && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400">Pack / Net Quantity</span>
                      <span className={`sm:col-span-2 font-medium ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                        {packInfo}
                      </span>
                    </div>
                  )}

                  {/* Manufacturer / Importer Details */}
                  {manufacturerDetails && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400">Manufacturer / Packer</span>
                      <span className={`sm:col-span-2 text-[11px] leading-relaxed ${isLightMode ? 'text-neutral-800' : 'text-slate-200'}`}>
                        {manufacturerDetails}
                      </span>
                    </div>
                  )}

                  {/* Dynamic specifications map */}
                  {specifications && typeof specifications === 'object' && Object.entries(specifications).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                      <span className="font-semibold text-neutral-500 dark:text-neutral-400 capitalize">{key}</span>
                      <span className={`sm:col-span-2 font-medium ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                        {String(val)}
                      </span>
                    </div>
                  ))}

                  {/* Marketplace Seller */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 px-4 sm:px-5 py-2.5">
                    <span className="font-semibold text-neutral-500 dark:text-neutral-400">Sold By</span>
                    <span className={`sm:col-span-2 font-medium ${isLightMode ? 'text-neutral-900' : 'text-slate-100'}`}>
                      {product.sellerShopName || 'ALIKE-ND Official Marketplace'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Customer Reviews & Ratings */}
          <div id="section-reviews" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <Star className="w-5 h-5 fill-[#F5A623] text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Reviews & Ratings ({reviewsList.length})
                  </h3>
                  <p className="text-xs opacity-60">Genuine client experiences and ratings</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                Verified Feedback
              </span>
            </div>

            {/* Rating Summary Card */}
            <div className={`p-5 sm:p-6 rounded-xl border shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Big Score Display */}
                <div className="text-center sm:text-left shrink-0">
                  <span className={`text-4xl sm:text-5xl font-black font-serif ${
                    isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'
                  }`}>
                    {reviewsList.length > 0 
                      ? (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
                      : (rating || 4.8)}
                  </span>
                  <span className="text-xs opacity-60 block font-semibold mt-0.5">out of 5.0</span>
                </div>

                <div className={`h-16 w-[1px] hidden sm:block ${isLightMode ? 'bg-[#EADFC9]' : 'bg-[#162744]'}`} />

                {/* Stars & Breakdown Bars */}
                <div className="space-y-2 flex-grow min-w-[220px]">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avgVal = reviewsList.length > 0 
                        ? reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length 
                        : (rating || 4.8);
                      return (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.round(avgVal) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-400 opacity-40'}`} 
                        />
                      );
                    })}
                    <span className={`text-xs font-bold ml-2 ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                      {reviewsList.length} Verified {reviewsList.length === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>

                  {/* Progress Breakdown */}
                  <div className="space-y-1 pt-1 max-w-xs">
                    {[
                      { stars: 5, pct: 82 },
                      { stars: 4, pct: 12 },
                      { stars: 3, pct: 4 },
                      { stars: 2, pct: 1 },
                      { stars: 1, pct: 1 },
                    ].map((item) => (
                      <div key={item.stars} className="flex items-center gap-2 text-[11px] opacity-75">
                        <span className="w-3 font-bold text-right">{item.stars}★</span>
                        <div className={`flex-grow h-2 rounded-full overflow-hidden ${isLightMode ? 'bg-gray-200' : 'bg-black/40'}`}>
                          <div 
                            className="h-full bg-gradient-to-r from-[#F5A623] to-[#D4AF37] rounded-full transition-all duration-500" 
                            style={{ width: `${item.pct}%` }} 
                          />
                        </div>
                        <span className="w-7 font-mono text-right">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="write-review-toggle-btn"
                onClick={() => setShowWriteForm(!showWriteForm)}
                className={`group px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer self-start lg:self-auto active:scale-95 border ${
                  showWriteForm
                    ? isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-[#162744] hover:bg-[#1C3256] text-neutral-200 border-[#223E68]'
                    : isLightMode
                    ? 'bg-[#0F172A] hover:bg-black text-[#F5A623] hover:text-[#FFB84D] border-[#0F172A] hover:shadow-md'
                    : 'bg-gradient-to-r from-[#0F1B30] to-[#162744] hover:from-[#13233E] hover:to-[#1C3256] text-[#F5A623] hover:text-[#FFB84D] border-[#203A60] hover:border-[#F5A623]/60 shadow-lg shadow-black/40'
                }`}
              >
                <PenLine className="w-4 h-4 text-[#F5A623] group-hover:scale-110 transition-transform" />
                <span>{showWriteForm ? 'Cancel Review' : 'Write a Product Review'}</span>
              </button>
            </div>

            {/* Review Form */}
            {showWriteForm && (
              <form
                onSubmit={handlePostReview}
                className={`p-5 sm:p-6 rounded-xl border space-y-4 shadow-sm ${
                  isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/80 border-[#162744]'
                }`}
              >
                <h4 className={`text-sm font-bold border-b pb-2 flex items-center gap-2 ${
                  isLightMode ? 'border-[#EADFC9] text-[#0F172A]' : 'border-[#162744] text-white'
                }`}>
                  <Sparkles className="w-4 h-4 text-[#F5A623]" />
                  <span>Leave Your Genuine Feedback</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs opacity-75 font-semibold">
                      Your Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border focus:outline-none transition-all ${
                        isLightMode 
                          ? 'bg-white border-[#EADFC9] text-gray-900 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20' 
                          : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30'
                      }`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs opacity-75 font-semibold">
                      Your Star Rating
                    </label>
                    <div className="flex items-center gap-2 h-[42px]" onMouseLeave={() => setNewHoverRating(0)}>
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const v = idx + 1;
                        const isLit = v <= (newHoverRating || newRating);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewRating(v)}
                            onMouseEnter={() => setNewHoverRating(v)}
                            className="focus:outline-none cursor-pointer hover:scale-125 transition-transform duration-150"
                            title={`Rate ${v} stars`}
                          >
                            <Star
                              className={`w-6 h-6 transition-colors ${
                                isLit ? 'fill-[#F5A623] text-[#F5A623] drop-shadow-[0_0_6px_rgba(245,166,35,0.5)]' : 'text-gray-400 opacity-40'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs opacity-75 font-semibold">
                    Your Review Comment
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="What did you like or appreciate about this product?"
                    className={`w-full text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border focus:outline-none transition-all ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] text-gray-900 focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20' 
                        : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/30'
                    }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold opacity-75">
                    📸 Attach Photos (Optional)
                  </label>
                  <div className="grid grid-cols-1">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 ${
                        isLightMode 
                          ? 'border-[#EADFC9] bg-white hover:border-[#F5A623]' 
                          : 'border-[#162744] bg-[#0A0F24] hover:border-[#F5A623]'
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        multiple
                        accept="image/*"
                        className="hidden"
                      />
                      <Camera className="w-5 h-5 text-gray-400" />
                      <span className="text-xs font-semibold">Upload Photos</span>
                    </div>
                  </div>

                  {newReviewImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {newReviewImages.map((src, idx) => (
                        <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#F5A623]/40">
                          <img src={src} alt="Thumb" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeSelectedImage(idx)}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 text-white rounded-full cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    id="submit-comment-button"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-md shadow-[#FF007F]/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Review Cards List */}
            <div className="space-y-4">
              {reviewsList.map((rev, rIdx) => {
                const hInfo = helpfulMap[rev.id] || { count: 6, userLiked: false };
                return (
                  <div 
                    key={`review-${rev.id}-${rIdx}`} 
                    className={`p-5 sm:p-6 rounded-2xl border shadow-2xs space-y-3 relative overflow-hidden transition-all ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] hover:border-[#FF007F]/60' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#FF007F]/40'
                    }`}
                  >
                    {/* Vertical Hot-Pink Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[#FF1990] to-[#FF007F]" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Avatar with Pink Accent */}
                        <div className="w-9 h-9 rounded-xl bg-[#FF007F] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>{rev.name}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Verified Client
                            </span>
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-400 opacity-40'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs opacity-50">{rev.date}</span>
                    </div>

                    <p className={`text-sm leading-relaxed pt-1 ${isLightMode ? 'text-gray-700' : 'text-slate-200'}`}>
                      {rev.comment}
                    </p>

                    {rev.images && rev.images.length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {rev.images.map((imgUrl, imgIdx) => (
                          <div
                            key={imgIdx}
                            onClick={() => setLightboxImage(imgUrl)}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-[#F5A623]/30 cursor-pointer hover:scale-105 transition-transform duration-200 shadow-2xs"
                          >
                            <img src={imgUrl} alt="Review attachment" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer action row */}
                    <div className={`pt-2 flex items-center justify-between border-t ${
                      isLightMode ? 'border-gray-100' : 'border-[#162744]'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleHelpful(rev.id)}
                        className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hInfo.userLiked 
                            ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623]' 
                            : isLightMode
                              ? 'bg-[#FAFAF7] border-gray-200 text-gray-600 hover:border-[#F5A623] hover:text-[#B48C28]'
                              : 'bg-[#0A0F24] border-[#162744] text-slate-300 hover:border-[#F5A623] hover:text-[#F5A623]'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hInfo.userLiked ? 'fill-[#F5A623] text-[#F5A623]' : ''}`} />
                        <span>Helpful ({hInfo.count})</span>
                      </button>

                      <span className="text-[11px] opacity-50">ALIKE Verified Atelier Buyer</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Questions & Answers */}
          <div id="section-qa" className={`border rounded-2xl p-5 sm:p-8 shadow-sm space-y-6 scroll-mt-28 transition-all ${
            isLightMode 
              ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
              : 'bg-[#0A0F24]/50 border-[#162744] hover:border-[#F5A623]/40'
          }`}>
            <div className={`flex items-center justify-between border-b pb-4 ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#F5A623]/15 text-[#F5A623] shadow-2xs">
                  <HelpCircle className="w-5 h-5 text-[#F5A623]" />
                </div>
                <div>
                  <h3 className={`text-base sm:text-lg font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Questions & Answers
                  </h3>
                  <p className="text-xs opacity-60">Verified concierge answers to client inquiries</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="qa-toggle-all-btn"
                  onClick={toggleAllQuestions}
                  className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                      : 'bg-[#122442] hover:bg-[#1A3358] text-amber-400 border-[#1F3A60]'
                  }`}
                >
                  {openQuestions.length === 4 ? 'Collapse All' : 'Expand All'}
                </button>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#B48C28] dark:text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/30 px-3 py-1 rounded-full hidden sm:inline-block">
                  Concierge Q&A
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                {
                  q: "Does this product come with domestic manufacturer warranty?",
                  a: "Yes, it includes a 1-Year Sovereign Brand Warranty covering any technical defects. Contact atelier concierge directly for seamless claims."
                },
                {
                  q: "What is the expected delivery duration for tier 1 cities?",
                  a: "For metro cities (such as New Delhi, Mumbai, Bengaluru), white-glove delivery is completed within 24 to 48 hours."
                },
                {
                  q: "Are these materials authentic and verified?",
                  a: "Yes, every item undergoes strict multi-point authentication before storage in our secure temperature-regulated vault."
                },
                {
                  q: "Is Cash on Delivery (COD) available?",
                  a: "Yes, Cash on Delivery is available across most serviceable pin codes during checkout."
                }
              ].map((item, idx) => {
                const isOpen = openQuestions.includes(idx);
                return (
                  <div key={idx} className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isOpen
                      ? isLightMode
                        ? 'bg-white border-amber-500/40 shadow-xs'
                        : 'bg-[#0B1B32] border-amber-500/40 shadow-md'
                      : isLightMode 
                        ? 'bg-[#FAFAF7] border-[#EADFC9] hover:border-amber-500/30' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-amber-500/30'
                  }`}>
                    <button
                      type="button"
                      id={`qa-item-${idx}`}
                      onClick={() => toggleQuestion(idx)}
                      className={`w-full text-left flex items-start justify-between gap-3 font-semibold text-xs sm:text-sm focus:outline-none cursor-pointer ${
                        isLightMode ? 'text-neutral-900' : 'text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/20">
                          Q
                        </span>
                        <span className="font-bold text-xs sm:text-sm">{item.q}</span>
                      </span>
                      <span className={`p-1 rounded-lg transition-transform duration-200 shrink-0 ${
                        isLightMode ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-800 text-neutral-300'
                      } ${isOpen ? 'rotate-180 text-amber-500' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className={`mt-3.5 pt-3.5 border-t pl-2 sm:pl-3 space-y-2 text-xs sm:text-sm transition-all ${
                        isLightMode ? 'border-neutral-200/80' : 'border-neutral-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                            A
                          </span>
                          <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Concierge Answer
                          </span>
                        </div>
                        <p className={`pl-8 leading-relaxed font-medium ${isLightMode ? 'text-neutral-700' : 'text-neutral-200'}`}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Frequently Bought Together Section */}
        <div className="p-4 sm:p-6 lg:p-8 pt-0">
          {(() => {
          const fbtProducts = getFrequentlyBoughtTogether(product, allProducts);

          if (fbtProducts.length === 0) return null;

          let fbtTotalPrice = 0;
          if (fbtMainChecked) fbtTotalPrice += product.price;
          if (fbtProducts[0] && fbt1Checked) fbtTotalPrice += fbtProducts[0].price;
          if (fbtProducts[1] && fbt2Checked) fbtTotalPrice += fbtProducts[1].price;

          let fbtTotalMrp = 0;
          if (fbtMainChecked) fbtTotalMrp += product.mrp;
          if (fbtProducts[0] && fbt1Checked) fbtTotalMrp += fbtProducts[0].mrp;
          if (fbtProducts[1] && fbt2Checked) fbtTotalMrp += fbtProducts[1].mrp;

          const handleAddFbtBundleToCart = () => {
            let addedCount = 0;
            if (fbtMainChecked) {
              onAddToCart(product, 1);
              addedCount++;
            }
            if (fbtProducts[0] && fbt1Checked) {
              onAddToCart(fbtProducts[0], 1);
              addedCount++;
            }
            if (fbtProducts[1] && fbt2Checked) {
              onAddToCart(fbtProducts[1], 1);
              addedCount++;
            }

            if (addedCount > 0) {
              showToast(`Added ${addedCount} bundle item(s) to your cart!`, 'success');
            } else {
              showToast('Please select at least one product.', 'warning');
            }
          };

          return (
            <div className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${
              isLightMode ? 'bg-white border-[#EADFC9]' : 'bg-[#0A0F24]/50 border-[#162744]'
            }`}>
              <div className={`border-b pb-3 flex items-center justify-between ${
                isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
              }`}>
                <h3 className={`text-base font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                  Frequently Curated Together
                </h3>
                <span className="text-[10px] uppercase font-black tracking-wider text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-1 rounded-full border border-[#F5A623]/30">
                  Bundle & Save
                </span>
              </div>

              <div className="flex flex-col xl:flex-row items-center gap-4 justify-between">
                {/* Items row */}
                <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
                  
                  {/* Item 1 */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                    isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                  }`}>
                    <input
                      type="checkbox"
                      checked={fbtMainChecked}
                      onChange={(e) => setFbtMainChecked(e.target.checked)}
                      className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                      id="fbt-check-main"
                    />
                    <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] opacity-60 font-medium block">Current Piece</span>
                      <h4 className={`text-xs font-bold truncate ${isLightMode ? 'text-gray-900' : 'text-white'}`}>{product.name}</h4>
                      <span className="text-xs font-black text-[#F5A623]">₹{product.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* + Separator */}
                  {fbtProducts[0] && (
                    <div className="text-[#F5A623] font-bold text-base shrink-0">+</div>
                  )}

                  {/* Item 2 */}
                  {fbtProducts[0] && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={fbt1Checked}
                        onChange={(e) => setFbt1Checked(e.target.checked)}
                        className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        id="fbt-check-1"
                      />
                      <img src={fbtProducts[0].image} alt={fbtProducts[0].name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] opacity-60 font-medium block">{fbtProducts[0].brand}</span>
                        <h4 className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                          isLightMode ? 'text-gray-900 hover:text-[#B48C28]' : 'text-white hover:text-[#F5A623]'
                        }`} onClick={() => onSelectProduct(fbtProducts[0])}>{fbtProducts[0].name}</h4>
                        <span className="text-xs font-black text-[#F5A623]">₹{fbtProducts[0].price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}

                  {/* + Separator */}
                  {fbtProducts[1] && (
                    <div className="text-[#F5A623] font-bold text-base shrink-0">+</div>
                  )}

                  {/* Item 3 */}
                  {fbtProducts[1] && (
                    <div className={`flex items-center gap-3 p-3 rounded-xl border flex-1 w-full ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32]/70 border-[#162744]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={fbt2Checked}
                        onChange={(e) => setFbt2Checked(e.target.checked)}
                        className="w-4 h-4 accent-[#F5A623] cursor-pointer"
                        id="fbt-check-2"
                      />
                      <img src={fbtProducts[1].image} alt={fbtProducts[1].name} className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] opacity-60 font-medium block">{fbtProducts[1].brand}</span>
                        <h4 className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                          isLightMode ? 'text-gray-900 hover:text-[#B48C28]' : 'text-white hover:text-[#F5A623]'
                        }`} onClick={() => onSelectProduct(fbtProducts[1])}>{fbtProducts[1].name}</h4>
                        <span className="text-xs font-black text-[#F5A623]">₹{fbtProducts[1].price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary Box */}
                <div className={`p-4 rounded-xl border w-full xl:w-72 space-y-3 shrink-0 ${
                  isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0B1B32] border-[#162744]'
                }`}>
                  <div>
                    <span className="text-xs opacity-60 font-medium block">Bundle Total:</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>
                        ₹{fbtTotalPrice.toLocaleString('en-IN')}
                      </span>
                      {fbtTotalMrp - fbtTotalPrice > 0 && (
                        <span className="text-xs line-through opacity-50">₹{fbtTotalMrp.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    id="add-all-fbt-to-cart-btn"
                    onClick={handleAddFbtBundleToCart}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF1990] to-[#FF007F] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-sm shadow-[#FF007F]/20 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Add Bundle to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
        </div>

        {/* Recommended Products Section */}
        {related.length > 0 && (
          <div className="p-4 sm:p-6 lg:p-8 pt-0 space-y-4">
            <div className={`border-b pb-3 flex items-center justify-between ${
              isLightMode ? 'border-[#EADFC9]' : 'border-[#162744]'
            }`}>
              <h3 className={`text-base font-bold font-serif ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                Clients Also Explored
              </h3>
              <span className="text-xs opacity-50">Curated recommendations</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {related.map((p) => {
                const isRelWishlisted = wishlistedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className={`group cursor-pointer rounded-2xl border p-3.5 space-y-2.5 transition-all hover:scale-[1.02] shadow-sm relative ${
                      isLightMode 
                        ? 'bg-white border-[#EADFC9] hover:border-[#F5A623]/60' 
                        : 'bg-[#0B1B32]/70 border-[#162744] hover:border-[#F5A623]/50'
                    }`}
                  >
                    <div className={`aspect-square overflow-hidden relative rounded-xl border ${
                      isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
                    }`}>
                      <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      <div className={`absolute top-2 right-2 z-10 ${isRelWishlisted ? 'opacity-100' : 'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'} transition-opacity`}>
                        <FavoriteButton
                          id={`wishlist-btn-${p.id}`}
                          isLiked={isRelWishlisted}
                          onToggle={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(p);
                          }}
                          title={isRelWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-60 block">{p.brand}</span>
                      <h4 className={`text-xs font-bold line-clamp-2 transition-colors ${
                        isLightMode ? 'text-gray-900 group-hover:text-[#B48C28]' : 'text-white group-hover:text-[#F5A623]'
                      }`}>{p.name}</h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className={`text-sm font-black ${isLightMode ? 'text-[#0F172A]' : 'text-[#F5A623]'}`}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] opacity-50 line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Delivery Location Selector Modal */}
      {isLocationModalOpen && (
        <div
          id="location-picker-modal-backdrop"
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-55 flex items-center justify-center p-4 animate-premium-fade-in"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            id="location-picker-modal-panel"
            className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh] animate-slide-up ${
              isLightMode 
                ? 'bg-white border-[#EADFC9] text-gray-900' 
                : 'bg-[#0B1B32] border-[#162744] text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5A623]/20 border border-[#F5A623]/40 flex items-center justify-center text-[#F5A623]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold font-serif leading-tight ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                    Choose Delivery Destination
                  </h3>
                  <p className="text-xs opacity-60">Select location for accurate delivery window & estimates</p>
                </div>
              </div>
              <GlassCloseButton
                onClick={() => setIsLocationModalOpen(false)}
                isLightMode={isLightMode}
                size="sm"
                title="Close"
              />
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
              
              {/* 1. Instant Location Detection Button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="w-full p-3.5 rounded-xl border border-dashed border-[#F5A623]/50 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 text-[#F5A623] flex items-center justify-between transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F5A623] text-[#0A0F24] flex items-center justify-center">
                    {isDetectingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <span className={`text-xs font-bold block ${isLightMode ? 'text-[#0F172A]' : 'text-white'}`}>
                      {isDetectingLocation ? 'Detecting coordinates...' : 'Use Current Coordinates'}
                    </span>
                    <span className="text-[11px] opacity-70">Auto-detect GPS location</span>
                  </div>
                </div>
                <span className="text-xs font-bold group-hover:translate-x-0.5 transition-transform text-[#F5A623]">Detect →</span>
              </button>

              {/* 2. Manual Pincode & City Search Form */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-75 block">
                  Search City / Pincode
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 opacity-40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    placeholder="Type city name or 6-digit pincode (e.g. Mumbai, 400001)..."
                    className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border transition-all ${
                      isLightMode 
                        ? 'bg-gray-50 border-gray-300 text-gray-900 focus:bg-white focus:border-[#F5A623]' 
                        : 'bg-[#0A0F24] border-[#162744] text-white focus:border-[#F5A623]'
                    }`}
                  />
                  {locationSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setLocationSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 3. Direct Custom Pincode Apply Form */}
              <form onSubmit={handleApplyCustomPincode} className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Enter Exact 6-Digit PIN</span>
                  <span className="text-[10px] opacity-60 font-mono">India Post Network</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={customPincodeInput}
                    onChange={(e) => setCustomPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter PIN (e.g. 560001)"
                    className={`flex-1 px-3.5 py-2 text-xs rounded-lg border font-mono tracking-wider ${
                      isLightMode ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0B1B32] border-[#162744] text-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F5A623] hover:bg-[#e0951a] text-[#0A0F24] text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Apply PIN
                  </button>
                </div>
              </form>

              {/* 4. Popular Cities / Matched Results List */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-[11px] opacity-75">
                    {locationSearchQuery ? 'Matching Locations' : 'Popular Delivery Destinations'}
                  </span>
                  <span className="text-[11px] opacity-50 font-mono">
                    {POPULAR_LOCATIONS.filter(l =>
                      !locationSearchQuery ||
                      l.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                      l.pincode.includes(locationSearchQuery) ||
                      l.state.toLowerCase().includes(locationSearchQuery.toLowerCase())
                    ).length} locations
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {POPULAR_LOCATIONS
                    .filter((l) =>
                      !locationSearchQuery ||
                      l.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
                      l.pincode.includes(locationSearchQuery) ||
                      l.state.toLowerCase().includes(locationSearchQuery.toLowerCase())
                    )
                    .map((loc) => {
                      const isSelected = deliveryLocation.pincode === loc.pincode;
                      return (
                        <button
                          key={loc.pincode}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623] shadow-xs'
                              : isLightMode
                                ? 'bg-white border-[#EADFC9] hover:border-gray-400 text-gray-800'
                                : 'bg-[#0A0F24] border-[#162744] hover:border-[#F5A623]/40 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#F5A623]' : 'opacity-40'}`} />
                              <span className="font-bold text-xs truncate">{loc.city}</span>
                            </div>
                            <span className="text-[10px] opacity-60 font-mono block pl-5">
                              {loc.pincode} • {loc.state}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#F5A623] text-[#0A0F24] flex items-center justify-center shrink-0 font-black">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t flex items-center justify-between text-xs opacity-75 ${
              isLightMode ? 'bg-[#FAFAF7] border-[#EADFC9]' : 'bg-[#0A0F24] border-[#162744]'
            }`}>
              <span>Current: <strong className={isLightMode ? 'text-black' : 'text-white'}>{deliveryLocation.city} ({deliveryLocation.pincode})</strong></span>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className={`px-4 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                  isLightMode 
                    ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100' 
                    : 'bg-[#0B1B32] border-[#162744] text-white hover:bg-[#162744]'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. 360° INTERACTIVE 3D ROTATION MODAL */}
      {is360ModalOpen && typeof document !== 'undefined' && createPortal(
        <div
          id="product-360-viewer-modal"
          className="fixed inset-0 z-[999999] bg-neutral-950/98 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 select-none animate-modal-backdrop text-white"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIs360ModalOpen(false);
            }
          }}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 py-2.5 px-4 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title & 360 Angle Readout */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">{name}</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-amber-400/50 text-amber-300 font-mono text-[11px] font-bold shadow-[0_0_12px_rgba(245,166,35,0.3)] shrink-0">
                <RotateCw className={`w-3.5 h-3.5 ${isAutoSpinning ? 'animate-spin' : ''}`} />
                <span>{Math.round(spinAngle)}° / 360°</span>
              </div>
            </div>

            {/* Exit / Close Button */}
            <button
              type="button"
              id="close-360-view-btn"
              onClick={() => setIs360ModalOpen(false)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
              <span>Back to Product</span>
            </button>
          </div>

          {/* Central 360 Canvas with Interactive Drag & Ambient Stage */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-2 overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              setIsDragging360(true);
              dragStartXRef.current = e.clientX;
              dragStartAngleRef.current = spinAngle;
              setIsAutoSpinning(false);
            }}
            onMouseMove={(e) => {
              if (!isDragging360) return;
              const deltaX = e.clientX - dragStartXRef.current;
              setSpinAngle((dragStartAngleRef.current + deltaX * 0.75 + 36000) % 360);
            }}
            onMouseUp={() => setIsDragging360(false)}
            onMouseLeave={() => setIsDragging360(false)}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                setIsDragging360(true);
                dragStartXRef.current = e.touches[0].clientX;
                dragStartAngleRef.current = spinAngle;
                setIsAutoSpinning(false);
              }
            }}
            onTouchMove={(e) => {
              if (!isDragging360 || e.touches.length !== 1) return;
              const deltaX = e.touches[0].clientX - dragStartXRef.current;
              setSpinAngle((dragStartAngleRef.current + deltaX * 0.85 + 36000) % 360);
            }}
            onTouchEnd={() => setIsDragging360(false)}
          >
            {/* Ambient circular radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-gradient-to-br from-amber-500/15 via-transparent to-transparent blur-3xl pointer-events-none" />
            </div>

            {/* Left Manual Step Button */}
            <button
              type="button"
              onClick={() => {
                setSpinAngle((prev) => (prev - 45 + 360) % 360);
                setIsAutoSpinning(false);
              }}
              className="absolute left-2 sm:left-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
              title="Rotate Left 45°"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* 360 Rotating Product Showcase */}
            {(() => {
              const numFrames = images && images.length > 0 ? images.length : 1;
              const frameIdx = Math.floor((spinAngle / 360) * numFrames) % numFrames;
              const current360Img = images[frameIdx] || image;
              // Perspective calculation for tactile 3D feel
              const subStep = (spinAngle % (360 / Math.max(1, numFrames))) - (180 / Math.max(1, numFrames));
              const perspectiveRotateY = numFrames > 1 ? subStep * 0.35 : ((spinAngle % 360) - 180) * 0.35;

              return (
                <div
                  className="relative max-w-full max-h-[58vh] sm:max-h-[64vh] flex items-center justify-center p-3 transition-transform duration-75"
                  style={{
                    transform: `scale(${zoom360}) perspective(1000px) rotateY(${perspectiveRotateY}deg)`,
                  }}
                >
                  <img
                    src={current360Img}
                    alt={`${name} 360 spin view`}
                    className="max-w-full max-h-[55vh] sm:max-h-[60vh] object-contain rounded-2xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] select-none pointer-events-none"
                    draggable={false}
                    referrerPolicy="no-referrer"
                  />
                </div>
              );
            })()}

            {/* Right Manual Step Button */}
            <button
              type="button"
              onClick={() => {
                setSpinAngle((prev) => (prev + 45) % 360);
                setIsAutoSpinning(false);
              }}
              className="absolute right-2 sm:right-4 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
              title="Rotate Right 45°"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Floating Interaction Hint Banner */}
            <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none">
              <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 text-[11px] font-medium shadow-md">
                ↔ Click & Drag horizontally or use controls to spin 360°
              </span>
            </div>
          </div>

          {/* Interactive Controls & Scrub Toolbar */}
          <div
            className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 py-3 px-4 sm:px-6 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 360 Degree Scrubber Track */}
            <div className="w-full flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-400 font-bold shrink-0">0°</span>
              <input
                type="range"
                min="0"
                max="359"
                value={Math.round(spinAngle)}
                onChange={(e) => {
                  setSpinAngle(Number(e.target.value));
                  setIsAutoSpinning(false);
                }}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">360°</span>
            </div>

            {/* Action Buttons Group */}
            <div className="w-full flex items-center justify-between gap-3 pt-1 border-t border-white/10">
              {/* Auto Spin Toggle */}
              <button
                type="button"
                onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoSpinning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(245,166,35,0.25)]'
                    : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                }`}
              >
                {isAutoSpinning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoSpinning ? 'Pause Spin' : 'Auto Spin'}</span>
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl border border-neutral-700">
                <button
                  type="button"
                  onClick={() => setZoom360((prev) => Math.max(0.8, prev - 0.2))}
                  className="w-7 h-7 rounded-lg hover:bg-neutral-700 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1.5 text-neutral-300 font-bold">{Math.round(zoom360 * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom360((prev) => Math.min(2.5, prev + 0.2))}
                  className="w-7 h-7 rounded-lg hover:bg-neutral-700 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 2. FULL SCREEN HIGH-RESOLUTION MODAL */}
      {(isFullScreenModalOpen || Boolean(lightboxImage)) && typeof document !== 'undefined' && createPortal(
        <div
          id="product-fullscreen-viewer-modal"
          className="fixed inset-0 z-[999999] bg-neutral-950/98 backdrop-blur-2xl flex flex-col justify-between p-3 sm:p-6 select-none animate-modal-backdrop text-white"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFullScreenModalOpen(false);
              setLightboxImage(null);
            }
          }}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 py-2.5 px-4 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Title & Image Counter */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs">{name}</span>
              <span className="px-2.5 py-1 rounded-full bg-neutral-800 text-amber-300 font-mono text-[11px] font-bold border border-neutral-700 shrink-0">
                Image {activeImageIndex + 1} of {images.length}
              </span>
            </div>

            {/* Exit / Close Button */}
            <button
              type="button"
              id="close-fullscreen-view-btn"
              onClick={() => {
                setIsFullScreenModalOpen(false);
                setLightboxImage(null);
              }}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
              <span>Back to Product</span>
            </button>
          </div>

          {/* Main Full-Screen Visual Area */}
          <div
            className="relative flex-1 w-full max-w-5xl mx-auto flex items-center justify-center my-2 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Nav Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                className="absolute left-2 sm:left-4 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
                title="Previous Photo (← key)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* High-Resolution Centered Image with Smooth Zoom */}
            <div
              className="relative max-w-full max-h-[66vh] sm:max-h-[72vh] flex items-center justify-center p-2 transition-transform duration-200"
              style={{ transform: `scale(${fullScreenZoom})` }}
            >
              <img
                src={images[activeImageIndex] || image}
                alt={`${name} full resolution view`}
                className="max-w-full max-h-[64vh] sm:max-h-[70vh] object-contain rounded-2xl shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Nav Arrow */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                className="absolute right-2 sm:right-4 z-20 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 hover:border-amber-400 flex items-center justify-center transition-all shadow-xl active:scale-95 cursor-pointer"
                title="Next Photo (→ key)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Floating Zoom HUD */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-1.5 rounded-xl border border-white/20 shadow-lg">
              <button
                type="button"
                onClick={() => setFullScreenZoom((prev) => Math.max(1, prev - 0.5))}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono px-2 text-amber-300 font-bold">{Math.round(fullScreenZoom * 100)}%</span>
              <button
                type="button"
                onClick={() => setFullScreenZoom((prev) => Math.min(3, prev + 0.5))}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {fullScreenZoom > 1 && (
                <button
                  type="button"
                  onClick={() => setFullScreenZoom(1)}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white ml-1 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div
              className="w-full max-w-3xl mx-auto flex flex-col items-center gap-2 py-2.5 px-4 bg-neutral-900/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar max-w-full py-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setFullScreenZoom(1);
                    }}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      idx === activeImageIndex
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/25'
                        : 'border-neutral-700 opacity-60 hover:opacity-100 hover:border-neutral-400'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] font-mono text-white px-1">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}

      {/* Modal Backdrop Animation */}
      <style>{`
        @keyframes modalBackdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-modal-backdrop {
          animation: modalBackdropFadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
