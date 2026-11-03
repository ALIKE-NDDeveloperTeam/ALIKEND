import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Product, CartItem, Order, Notification, WalletTransaction, Contact } from './types';
import { PRODUCTS, JOBS, TESTIMONIALS, INITIAL_NOTIFICATIONS, INITIAL_TRANSACTIONS, INITIAL_CONTACTS } from './data/mockData';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Shared Layout Components (eagerly loaded for instant shell)
import Toast from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import { BottomNav } from './components/BottomNav';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

// Primary Landing Page (eagerly loaded for zero-delay First Contentful Paint)
import Home from './pages/Home';
import { useLocation } from './context/LocationContext';

// Live Website Admin Editing System
import { useAdminEdit } from './context/AdminEditContext';
import { ServiceModeSwitcher } from './components/navigation/ServiceModeSwitcher';

// Resilient code-splitting loader with automatic retry for dynamic imports
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3,
  interval = 600
) {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      let attempts = 0;
      const execute = () => {
        factory()
          .then(resolve)
          .catch((error) => {
            attempts++;
            if (attempts <= retries) {
              setTimeout(execute, interval * attempts);
            } else {
              const isChunkError =
                error?.name === 'ChunkLoadError' ||
                /failed to fetch dynamically imported module/i.test(error?.message || '') ||
                /loading chunk/i.test(error?.message || '') ||
                /importing a module script failed/i.test(error?.message || '');

              const reloadKey = 'lazy_chunk_reload_' + window.location.pathname;
              if (isChunkError && typeof window !== 'undefined' && !sessionStorage.getItem(reloadKey)) {
                sessionStorage.setItem(reloadKey, 'true');
                window.location.reload();
                return;
              }
              reject(error);
            }
          });
      };
      execute();
    })
  );
}

// On-demand code-split sub-pages and modals with resilient retry
const ProductDetail = lazyWithRetry(() => import('./pages/ProductDetail'));
const SearchPage = lazyWithRetry(() => import('./pages/SearchPage'));
const Cart = lazyWithRetry(() => import('./pages/Cart'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const WishlistPage = lazyWithRetry(() => import('./pages/Wishlist'));
const Messenger = lazyWithRetry(() => import('./pages/Messenger'));
const JobsPortal = lazyWithRetry(() => import('./pages/JobsPortal'));
const TermsAndConditions = lazyWithRetry(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const ReturnRefundPolicy = lazyWithRetry(() => import('./pages/ReturnRefundPolicy'));
const GrievanceRedressalPolicy = lazyWithRetry(() => import('./pages/GrievanceRedressalPolicy'));
const SellerPolicy = lazyWithRetry(() => import('./pages/SellerPolicy'));
const SellerDashboard = lazyWithRetry(() => import('./pages/SellerDashboard'));
const SellerRegister = lazyWithRetry(() => import('./pages/SellerRegister'));
const NotificationsPage = lazyWithRetry(() => import('./pages/Notifications'));
const AIRecommendations = lazyWithRetry(() => import('./pages/AIRecommendations'));
const AdminPanel = lazyWithRetry(() => import('./pages/AdminPanel'));
const SuperAdminLogin = lazyWithRetry(() => import('./pages/SuperAdminLogin'));
const StaffAdminLogin = lazyWithRetry(() => import('./pages/StaffAdminLogin'));
const SupportCenter = lazyWithRetry(() => import('./pages/SupportCenter'));
const SearchModal = lazyWithRetry(() => import('./components/SearchModal'));
const RideBookingPage = lazyWithRetry(() => import('./pages/RideBookingPage').then(m => ({ default: m.RideBookingPage })));
const DriverPortal = lazyWithRetry(() => import('./pages/DriverPortal').then(m => ({ default: m.DriverPortal })));
const DeliveryHubPage = lazyWithRetry(() => import('./pages/DeliveryHubPage').then(m => ({ default: m.DeliveryHubPage })));
const DeliveryPartnerPortal = lazyWithRetry(() => import('./pages/DeliveryPartnerPortal').then(m => ({ default: m.DeliveryPartnerPortal })));
const PublicSellerStore = lazyWithRetry(() => import('./pages/PublicSellerStore'));
const LoginModal = lazyWithRetry(() => import('./components/LoginModal'));
const LocationCaptureModal = lazyWithRetry(() => import('./components/location/LocationCaptureModal').then(m => ({ default: m.LocationCaptureModal })));
const QuickViewModal = lazyWithRetry(() => import('./components/QuickViewModal'));
const ComparisonCorridorBar = lazyWithRetry(() => import('./components/ComparisonCorridorBar'));
const AdminProductEditModal = lazyWithRetry(() => import('./components/admin/AdminProductEditModal').then(m => ({ default: m.AdminProductEditModal })));
const AdminBannerEditModal = lazyWithRetry(() => import('./components/admin/AdminBannerEditModal').then(m => ({ default: m.AdminBannerEditModal })));
const AdminAdEditModal = lazyWithRetry(() => import('./components/admin/AdminAdEditModal').then(m => ({ default: m.AdminAdEditModal })));
const AdminFlashSaleModal = lazyWithRetry(() => import('./components/admin/AdminFlashSaleModal').then(m => ({ default: m.AdminFlashSaleModal })));
const AdminConfirmDeleteModal = lazyWithRetry(() => import('./components/admin/AdminConfirmDeleteModal').then(m => ({ default: m.AdminConfirmDeleteModal })));
<<<<<<< HEAD
=======
=======
import LoginModal from './components/LoginModal';

// Primary Landing Page (eagerly loaded for zero-delay First Contentful Paint)
import Home from './pages/Home';

// On-demand code-split sub-pages and modals
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));
const Messenger = lazy(() => import('./pages/Messenger'));
const JobsPortal = lazy(() => import('./pages/JobsPortal'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const ReturnRefundPolicy = lazy(() => import('./pages/ReturnRefundPolicy'));
const GrievanceRedressalPolicy = lazy(() => import('./pages/GrievanceRedressalPolicy'));
const SellerPolicy = lazy(() => import('./pages/SellerPolicy'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const SellerRegister = lazy(() => import('./pages/SellerRegister'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const AIRecommendations = lazy(() => import('./pages/AIRecommendations'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const SuperAdminLogin = lazy(() => import('./pages/SuperAdminLogin'));
const StaffAdminLogin = lazy(() => import('./pages/StaffAdminLogin'));
const SupportCenter = lazy(() => import('./pages/SupportCenter'));
const SearchModal = lazy(() => import('./components/SearchModal'));
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { adminApi } from './pages/adminApi';

// Dedicated secret administration path (prevents unauthorized discovery of the ops console)
export const ADMIN_ROUTE_PATH = '/ops-console-x7k2m9';

/**
 * URL Scheme & Route Parser
 * 
 * - Home: '/' -> view: 'home'
 * - Admin: '/ops-console-x7k2m9' or '/admin' -> view: 'admin'
 * - Product detail: '/product/:id' (e.g. '/product/12') -> view: 'detail', productId: 12
 * - Search / Category: '/search?category=mobiles&q=iphone' -> view: 'search', category: 'mobiles', searchQuery: 'iphone'
 *   (Also supports direct path '/category/:id' e.g. '/category/mobiles')
 * - Named views: '/cart', '/checkout', '/profile', '/jobs', '/seller_register', '/seller_dashboard', '/notifications', '/ai_recs', '/superadmin_login', '/staffadmin_login'
 */
export interface ParsedRoute {
  view: string;
  category: string;
  searchQuery: string;
  productId: number | null;
}

export function parseRouteFromUrl(): ParsedRoute {
  if (typeof window === 'undefined') {
    return { view: 'home', category: 'all', searchQuery: '', productId: null };
  }

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // 1. Admin route (secret console path or /admin)
  if (pathname === ADMIN_ROUTE_PATH || pathname === '/admin') {
    return { view: 'admin', category: 'all', searchQuery: '', productId: null };
  }

  // 2. Product Detail: /product/:id (e.g. /product/123)
  const productMatch = pathname.match(/^\/product\/(\d+)$/);
  if (productMatch) {
    const pId = Number(productMatch[1]);
    return {
      view: 'detail',
      category: 'all',
      searchQuery: '',
      productId: Number.isFinite(pId) ? pId : null,
    };
  }

  // 3. Search & Category Browse: /search?category=...&q=...
  if (pathname === '/search') {
    const cat = searchParams.get('category') || 'all';
    const q = searchParams.get('q') || '';
    return {
      view: 'search',
      category: cat,
      searchQuery: q,
      productId: null,
    };
  }

  // Also support direct category URL like /category/:id
  const categoryMatch = pathname.match(/^\/category\/([a-zA-Z0-9_-]+)$/);
  if (categoryMatch) {
    const cat = categoryMatch[1];
    const q = searchParams.get('q') || '';
    return {
      view: 'search',
      category: cat,
      searchQuery: q,
      productId: null,
    };
  }

  // 4. Dedicated feature sub-routes
  if (pathname === '/cart') return { view: 'cart', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/checkout') return { view: 'checkout', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/profile') {
    const tabParam = searchParams.get('tab') || 'all';
    return { view: 'profile', category: tabParam, searchQuery: '', productId: null };
  }
  if (pathname === '/wishlist') return { view: 'wishlist', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/jobs') return { view: 'jobs', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/terms' || pathname === '/terms-and-conditions' || pathname === '/terms_conditions') return { view: 'terms_conditions', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/privacy' || pathname === '/privacy-policy' || pathname === '/privacy_policy') return { view: 'privacy_policy', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/returns' || pathname === '/return-refund-policy' || pathname === '/return_refund_policy' || pathname === '/refunds') return { view: 'return_refund_policy', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/grievance' || pathname === '/grievance-redressal' || pathname === '/grievance_policy' || pathname === '/grievance-policy') return { view: 'grievance_policy', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller-policy' || pathname === '/seller_policy' || pathname === '/merchant-policy') return { view: 'seller_policy', category: 'all', searchQuery: '', productId: null };
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (pathname === '/seller/login' || pathname === '/seller-login' || pathname === '/seller_login') return { view: 'seller_login', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller/signup' || pathname === '/seller-signup' || pathname === '/seller_signup') return { view: 'seller_signup', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller/forgot-password' || pathname === '/seller-forgot-password' || pathname === '/seller_forgot_password') return { view: 'seller_forgot_password', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller_register' || pathname === '/seller-register' || pathname === '/seller') return { view: 'seller_register', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller/dashboard' || pathname === '/seller_dashboard' || pathname === '/seller-dashboard') return { view: 'seller_dashboard', category: 'all', searchQuery: '', productId: null };
<<<<<<< HEAD
=======
=======
  if (pathname === '/seller_register' || pathname === '/seller-register') return { view: 'seller_register', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/seller_dashboard' || pathname === '/seller-dashboard') return { view: 'seller_dashboard', category: 'all', searchQuery: '', productId: null };
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (pathname === '/notifications') return { view: 'notifications', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/support' || pathname === '/help' || pathname === '/customer-care') return { view: 'support', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/ai_recs' || pathname === '/ai-recs') return { view: 'ai_recs', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/superadmin_login') return { view: 'superadmin_login', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/staffadmin_login') return { view: 'staffadmin_login', category: 'all', searchQuery: '', productId: null };
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (pathname === '/rides' || pathname === '/book-ride' || pathname === '/ride') return { view: 'rides', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/driver' || pathname === '/driver-portal' || pathname === '/driver_portal') return { view: 'driver_portal', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/delivery' || pathname === '/delivery-hub' || pathname === '/quick-delivery') return { view: 'delivery', category: 'all', searchQuery: '', productId: null };
  if (pathname === '/delivery-partner' || pathname === '/delivery_partner' || pathname === '/rider' || pathname === '/partner') return { view: 'delivery_partner', category: 'all', searchQuery: '', productId: null };

  const storeMatch = pathname.match(/^\/store\/([^/]+)$/);
  if (storeMatch) {
    return {
      view: 'seller_store',
      category: decodeURIComponent(storeMatch[1]),
      searchQuery: '',
      productId: null,
    };
  }
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Default to home
  return { view: 'home', category: 'all', searchQuery: '', productId: null };
}

export function buildRouteUrl(
  view: string,
  category: string = 'all',
  searchQuery: string = '',
  productId: number | null = null
): string {
  // Admin route preservation
  if (view === 'admin') {
    return ADMIN_ROUTE_PATH;
  }

  // Product detail view: /product/:id
  if (view === 'detail' || view.startsWith('product_')) {
    const pId = productId ?? (view.startsWith('product_') ? Number(view.replace('product_', '')) : null);
    return pId ? `/product/${pId}` : '/';
  }

  // Search or category browse view: /search?category=...&q=...
  if (view === 'search' || view === 'category_search' || view.startsWith('category_')) {
    const cat = view.startsWith('category_') ? view.replace('category_', '') : category;
    const params = new URLSearchParams();
    if (cat && cat !== 'all') {
      params.set('category', cat);
    }
    if (searchQuery && searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    const qs = params.toString();
    return qs ? `/search?${qs}` : '/search';
  }

  // Home view
  if (view === 'home') {
    return '/';
  }

  // Specific routes
  if (view === 'cart') return '/cart';
  if (view === 'checkout') return '/checkout';
  if (view === 'profile') {
    if (category && category !== 'all' && category !== 'orders') {
      return `/profile?tab=${category}`;
    }
    return '/profile';
  }
  if (view === 'wishlist') return '/wishlist';
  if (view === 'jobs') return '/jobs';
  if (view === 'terms_conditions' || view === 'terms') return '/terms';
  if (view === 'privacy_policy' || view === 'privacy') return '/privacy';
  if (view === 'return_refund_policy' || view === 'returns') return '/returns';
  if (view === 'grievance_policy' || view === 'grievance') return '/grievance';
  if (view === 'seller_policy') return '/seller-policy';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (view === 'seller_login') return '/seller/login';
  if (view === 'seller_signup') return '/seller/signup';
  if (view === 'seller_forgot_password') return '/seller/forgot-password';
  if (view === 'seller_register') return '/seller/login';
  if (view === 'seller_dashboard') return '/seller/dashboard';
<<<<<<< HEAD
=======
=======
  if (view === 'seller_register') return '/seller_register';
  if (view === 'seller_dashboard') return '/seller_dashboard';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (view === 'notifications') return '/notifications';
  if (view === 'support' || view === 'help') return '/support';
  if (view === 'ai_recs') return '/ai_recs';
  if (view === 'superadmin_login') return '/superadmin_login';
  if (view === 'staffadmin_login') return '/staffadmin_login';
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  if (view === 'rides') return '/rides';
  if (view === 'driver_portal' || view === 'driver') return '/driver';
  if (view === 'delivery') return '/delivery';
  if (view === 'delivery_partner') return '/delivery-partner';
  if (view === 'seller_store' || view.startsWith('store_')) {
    const sid = view.startsWith('store_') ? view.replace('store_', '') : category;
    return sid ? `/store/${encodeURIComponent(sid)}` : '/';
  }
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  return '/';
}

import { X, ShoppingCart, Star, Heart, ArrowRight } from 'lucide-react';
import GlassCloseButton from './components/GlassCloseButton';
import FavoriteButton from './components/FavoriteButton';
<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
import QuickViewModal from './components/QuickViewModal';
import ComparisonCorridorBar from './components/ComparisonCorridorBar';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import PageLoader from './components/PageLoader';

const PageLoadingFallback = () => (
  <PageLoader
    variant="inline"
    label="Curating Atelier Segment..."
    subLabel="ALIKE-ND BESPOKE"
  />
);

const SearchModalLoadingFallback = () => (
  <div
    id="search-experience-modal-overlay-loading"
    className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 backdrop-blur-xl bg-black/75 animate-fade-in"
    aria-label="Loading search dialog"
  >
    <div className="w-full max-w-xl my-auto rounded-3xl border border-white/10 bg-[#070D1E]/95 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-8 flex flex-col items-center justify-center min-h-[260px] text-center">
      <PageLoader
        variant="inline"
        size="sm"
        label="Opening Atelier Search Catalog..."
        subLabel="CURATED ARCHIVE"
      />
    </div>
  </div>
);

const MessengerLoadingFallback = () => (
  <div
    id="chat-widget-loading"
    className="fixed bottom-6 right-6 z-[90] w-[380px] max-w-[calc(100vw-32px)] h-[min(580px,calc(100vh-100px))] rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center bg-white dark:bg-[#070D1E] animate-slide-up"
    aria-label="Loading live chat concierge"
  >
    <PageLoader
      variant="inline"
      size="sm"
      label="Connecting Concierge..."
      subLabel="24/7 LIVE SUPPORT"
    />
  </div>
);

export default function App() {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const { location, setLocation, showLocationModal, setShowLocationModal, promptLocationCapture } = useLocation();
  // Live Website Admin Editing System Hook
  const {
    adminUser,
    loginAdmin,
    logoutAdmin,
    editingProduct,
    closeEditProduct,
    deletingProduct,
    closeDeleteProduct,
    editingBanner,
    isCreatingBanner,
    closeEditBanner,
    deletingBanner,
    closeDeleteBanner,
    editingAd,
    isCreatingAd,
    closeEditAd,
    deletingAd,
    closeDeleteAd,
    isFlashSaleModalOpen,
    closeFlashSaleModal,
    triggerRefresh,
    refreshTrigger,
  } = useAdminEdit();
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Core Persistent State with database-backed session validation
  const [user, setUser] = useState<{ _id?: string; name: string; email: string; phone: string; avatar?: string; tier?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('alike_user');
      const token = localStorage.getItem('alike_user_token');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        // Only load if it has a real MongoDB _id or token and is not a mock guest user
        if (parsed && parsed._id && parsed.email && parsed.email !== 'guest@alike.com' && parsed.email !== 'facebook.guest@alike.com') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Storage load error for user:", e);
    }
    return null;
  });

  // Auto-bridge admin token in background whenever authenticated user changes
  useEffect(() => {
    if (user && user.email) {
      const userToken = localStorage.getItem('alike_user_token') || undefined;
      adminApi.bridgeLogin(userToken, user.email)
        .then((res) => {
          if (res && res.success && res.token) {
            adminApi.setToken(res.token);
<<<<<<< HEAD
            if (res.admin) {
              loginAdmin(res.admin, res.token);
            }
=======
<<<<<<< HEAD
            if (res.admin) {
              loginAdmin(res.admin, res.token);
            }
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            console.log("👑 [ADMIN AUTO-AUTHENTICATED] Admin privileges bridged for:", user.email);
          }
        })
        .catch(() => {});
    }
<<<<<<< HEAD
  }, [user, loginAdmin]);
=======
<<<<<<< HEAD
  }, [user, loginAdmin]);
=======
  }, [user]);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  const [isSeller, setIsSeller] = useState<boolean>(() => {
    try {
      return localStorage.getItem('alike_is_seller') === 'true';
    } catch {
      return false;
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const savedUser = localStorage.getItem('alike_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email) {
          const userWallet = localStorage.getItem(`alike_wallet_${u.email.toLowerCase()}`);
          if (userWallet !== null && !isNaN(Number(userWallet))) {
            return Number(userWallet);
          }
        }
      }
    } catch {}
    return 0;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('alike_products');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for products:", e);
    }
    return PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('alike_cart');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for cart:", e);
    }
    return [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('alike_wishlist');
      if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Storage load error for wishlist:", e);
    }
    return [];
  });

  // Orders are customer-specific and start completely empty for newly registered accounts
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedUser = localStorage.getItem('alike_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.email) {
          const saved = localStorage.getItem(`alike_orders_${u.email.toLowerCase()}`);
          if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
          }
        }
      }
    } catch (e) {
      console.warn("Storage load error for orders:", e);
    }
    return [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('alike_contacts_v2');
    if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_CONTACTS;
  });

  const [lastNonMessengerView, setLastNonMessengerView] = useState('home');
  const [lastNonMessengerScroll, setLastNonMessengerScroll] = useState(0);

  const [toastList, setToastList] = useState<{ id: string; msg: string; type: 'success' | 'error' | 'warning' | 'info' }[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [pendingWishlistProduct, setPendingWishlistProduct] = useState<Product | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const handleProductsChange = (updatedProds: any[]) => {
    if (!Array.isArray(updatedProds)) return;
    const normalized: Product[] = updatedProds.map((p: any) => ({
      id: p.id || (typeof p._id === 'string' ? parseInt(p._id.replace(/\D/g, '').slice(0, 8) || '1', 10) : 1),
      _id: p._id,
      name: p.name,
      brand: p.brand || "Alike Sovereign",
      category: p.category,
<<<<<<< HEAD
      subCategory: p.subCategory,
=======
<<<<<<< HEAD
      subCategory: p.subCategory,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      price: p.price,
      mrp: p.mrp || p.price,
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 120,
      stock: p.stock !== undefined ? p.stock : 15,
      stockStatus: p.stockStatus || (p.stock > 0 ? "In Stock" : "Out of Stock"),
      badge: p.badge || (p.isFlashSale ? "SALE" : undefined),
      isFlashSale: p.isFlashSale ?? (p.badge === "SALE"),
      flashEndsAt: p.flashEndsAt,
      image: p.image,
      images: p.images || [p.image],
      description: p.description,
      specifications: p.specifications,
      isWholesale: p.isWholesale,
      wholesalePrice: p.wholesalePrice,
      wholesaleMinQty: p.wholesaleMinQty,
      colors: p.colors || ['Black', 'Gold', 'Silver'],
      sizes: p.sizes || ['Standard'],
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      emoji: p.emoji || '✨',
      sellerId: p.sellerId,
      sellerShopName: p.sellerShopName,
      eligibleFor20MinDelivery: p.eligibleFor20MinDelivery,
      distanceKm: p.distanceKm,
      quickDelivery: Boolean(p.quickDelivery),
      etaMin: p.etaMin,
      etaMax: p.etaMax,
      deliveryEtaText: p.deliveryEtaText,
    }));
    setProducts(normalized);
    // Keep cart product snapshots synchronized with latest distance & quickDelivery flags
    setCart((prevCart) =>
      prevCart.map((ci) => {
        const freshProd = normalized.find((np) => np.id === ci.product.id);
        return freshProd ? { ...ci, product: freshProd } : ci;
      })
    );
    localStorage.setItem('alike_products', JSON.stringify(normalized));
  };

  // Sync catalog live from MongoDB storefront /api/products (enriched with seller distance & quickDelivery when location is set)
  useEffect(() => {
    const token = localStorage.getItem('alikend_admin_token') || sessionStorage.getItem('alikend_admin_token');
    const query =
      location && typeof location.lat === 'number' && typeof location.lng === 'number'
        ? `?nearLat=${location.lat}&nearLng=${location.lng}`
        : '';
    fetch(`/api/products${query}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
<<<<<<< HEAD
=======
=======
      emoji: p.emoji || '✨'
    }));
    setProducts(normalized);
    localStorage.setItem('alike_products', JSON.stringify(normalized));
  };

  // Sync catalog live from MongoDB storefront /api/products
  useEffect(() => {
    fetch('/api/products')
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          handleProductsChange(data);
        }
      })
      .catch((err) => console.warn('Storefront products API fallback:', err));
<<<<<<< HEAD
  }, [refreshTrigger, adminUser, location?.lat, location?.lng]);
=======
<<<<<<< HEAD
  }, [refreshTrigger, adminUser, location?.lat, location?.lng]);
=======
  }, []);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Global keyboard shortcut for search experience (⌘K or Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const headerInput = document.getElementById('search-input-header') as HTMLInputElement | null;
        if (headerInput) {
          headerInput.focus();
          headerInput.select();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 2.1 Quick View & 2.5 Product Compare state layers
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [isCompareBarDismissed, setIsCompareBarDismissed] = useState<boolean>(false);
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('Standard');
  const [selectedColor, setSelectedColor] = useState<string>('Standard');

  // Synchronize selected size and color whenever a new product is opened in Quick View
  useEffect(() => {
    if (quickViewProduct) {
      const initialSizes = quickViewProduct.sizes && quickViewProduct.sizes.length > 0
        ? quickViewProduct.sizes
        : ['Fits All'];
      setSelectedSize(initialSizes[0]);

      const initialColors = quickViewProduct.colors && quickViewProduct.colors.length > 0
        ? quickViewProduct.colors
        : ['Standard'];
      setSelectedColor(initialColors[0]);
    }
  }, [quickViewProduct]);

  // App Routing Visibility & URL Navigation state
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [currentAdminUser, setCurrentAdminUser] = useState<{ _id?: string; name: string; email: string; role: string } | null>(() => adminUser);

  useEffect(() => {
    if (adminUser) {
      setCurrentAdminUser(adminUser);
    } else {
      setCurrentAdminUser(null);
    }
  }, [adminUser]);
<<<<<<< HEAD
=======
=======
  const [currentAdminUser, setCurrentAdminUser] = useState<{ _id?: string; name: string; email: string; role: string } | null>(null);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // (a) Route State Initialization: restores view, category, product ID, and search query on reload or direct link
  const [currentView, setCurrentView] = useState<string>(() => parseRouteFromUrl().view);
  const [selectedCategory, setSelectedCategory] = useState<string>(() => parseRouteFromUrl().category);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(() => parseRouteFromUrl().productId);
  const [searchQuery, setSearchQuery] = useState<string>(() => parseRouteFromUrl().searchQuery);
  const [profileInitialTab, setProfileInitialTab] = useState<'orders' | 'addresses' | 'settings' | 'wishlist'>(() => {
    const parsed = parseRouteFromUrl();
    if (parsed.view === 'profile' && (parsed.category === 'settings' || parsed.category === 'addresses' || parsed.category === 'orders' || parsed.category === 'wishlist')) {
      return parsed.category;
    }
    return 'orders';
  });
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(2);

  // Pure Light Mode Enforced Across Entire Application
  const isLightMode = true;

  // (b) Popstate Listener: synchronizes view state on browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRouteFromUrl();
      setCurrentView(parsed.view);
      setSelectedCategory(parsed.category);
      setSelectedProductId(parsed.productId);
      setSearchQuery(parsed.searchQuery);
      if (parsed.view === 'profile' && (parsed.category === 'settings' || parsed.category === 'addresses' || parsed.category === 'orders' || parsed.category === 'wishlist')) {
        setProfileInitialTab(parsed.category);
      }
      setNavigationHistory((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.body.classList.add('light-mode');
    document.documentElement.classList.add('light-mode');
    document.documentElement.classList.remove('dark');
    localStorage.setItem('alike_theme', 'light');
  }, []);

<<<<<<< HEAD
=======
<<<<<<< HEAD
=======
  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      }, { threshold: 0.08 });

      const elts = document.querySelectorAll('.product-card, .category-card, .section-header, .reveal-entry');
      elts.forEach(el => {
        el.classList.add('reveal-entry');
        observer.observe(el);
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [currentView]);

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  // Close floating chat widget on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (!isChatOpen) return;
      const target = e.target as HTMLElement;
      
      // If click is inside the chat widget container, ignore
      const widget = document.getElementById('chat-widget-container');
      if (widget && widget.contains(target)) {
        return;
      }
      
      // If click is on any element that opens or triggers messenger, ignore
      const isTrigger = target.closest('#nav-messenger-btn') || 
                        target.closest('#mobile-nav-messenger-btn') ||
                        target.closest('[title*="Messenger"]') ||
                        target.closest('.messenger-trigger-btn') ||
                        target.closest('button')?.innerText?.toLowerCase().includes('messenger');
      
      if (isTrigger) {
        return;
      }

      // Check if click is on any dialog modals overlay (e.g. Confirm block, Confirm clear)
      if (target.closest('.fixed.inset-0.z-50')) {
        return;
      }

      setIsChatOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isChatOpen]);

  // Synchronize with Firebase Auth session shifts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          _id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          avatar: firebaseUser.photoURL || undefined,
          tier: 'Silver',
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Strict session verification against live MongoDB alikendshop.users collection on mount
  useEffect(() => {
    const verifyDatabaseSession = async () => {
      const token = localStorage.getItem('alike_user_token');
      if (!token) {
        // Clear any orphaned unverified session without a valid token
        const saved = localStorage.getItem('alike_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (!parsed?._id) {
              setUser(null);
              localStorage.removeItem('alike_user');
            }
          } catch {
            setUser(null);
            localStorage.removeItem('alike_user');
          }
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.valid && data.user) {
          setUser({
            _id: String(data.user._id),
            name: data.user.name,
            email: data.user.email,
            phone: data.user.phone,
            tier: data.user.tier,
          });
          setIsSeller(Boolean(data.isSeller));
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          if (!location && data.user.savedLocation && typeof data.user.savedLocation.lat === 'number' && typeof data.user.savedLocation.lng === 'number') {
            setLocation(
              {
                lat: data.user.savedLocation.lat,
                lng: data.user.savedLocation.lng,
                label: data.user.savedLocation.label || 'Saved Location',
                savedAt: Date.now(),
              },
              false
            );
          }
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        } else {
          // Token or user not found in MongoDB
          console.warn("Session verification failed against MongoDB. Resetting session:", data?.error);
          setUser(null);
          localStorage.removeItem('alike_user');
          localStorage.removeItem('alike_user_token');
        }
      } catch (err) {
        console.warn("Could not verify session with MongoDB:", err);
      }
    };

    verifyDatabaseSession();
  }, []);

  // Fetch and synchronize user-specific orders and wallet from database and scoped storage
  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setWalletBalance(0);
      return;
    }
    const cleanEmail = user.email.toLowerCase();

    // 1. Load local wallet balance for this user (defaults to 0)
    try {
      const savedWallet = localStorage.getItem(`alike_wallet_${cleanEmail}`);
      if (savedWallet !== null && !isNaN(Number(savedWallet))) {
        setWalletBalance(Number(savedWallet));
      } else {
        setWalletBalance(0);
      }
    } catch {
      setWalletBalance(0);
    }

    // Check live seller approval status for accurate dropdown rendering
    fetch(`/api/sellers/status-check?email=${encodeURIComponent(cleanEmail)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res && typeof res.isSeller === 'boolean') {
          setIsSeller(res.isSeller);
        }
      })
      .catch(() => {});

    // 2. Load cached orders for this user (defaults to [])
    try {
      const savedOrders = localStorage.getItem(`alike_orders_${cleanEmail}`);
      if (savedOrders && savedOrders.trim() !== '' && savedOrders !== 'null') {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }

    // 3. Fetch real orders from database for this specific user (authenticated with JWT to prevent IDOR)
    const userToken = localStorage.getItem("alike_user_token");
    if (!userToken) {
      return;
    }

    fetch("/api/orders/user", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
          try {
            localStorage.setItem(`alike_orders_${cleanEmail}`, JSON.stringify(data));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn("Could not fetch user orders:", err);
      });
  }, [user?.email]);

  // Scoped orders filtered exclusively for the logged-in customer
  const userOrders = useMemo(() => {
    if (!user || !user.email) return [];
    const cleanEmail = user.email.toLowerCase();
    return orders.filter(
      (o) => o.memberEmail && o.memberEmail.toLowerCase() === cleanEmail
    );
  }, [orders, user]);

  const [activeCoupon, setActiveCoupon] = useState<string | undefined>(undefined);

  // Persists states in localStorage upon state updates safely
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('alike_user', JSON.stringify(user));
        if (user.email) {
          localStorage.setItem(`alike_wallet_${user.email.toLowerCase()}`, String(walletBalance));
          localStorage.setItem(`alike_orders_${user.email.toLowerCase()}`, JSON.stringify(orders));
        }
      } else {
        localStorage.removeItem('alike_user');
      }
      localStorage.setItem('alike_is_seller', String(isSeller));
      localStorage.setItem('alike_products', JSON.stringify(products));
      localStorage.setItem('alike_cart', JSON.stringify(cart));
      localStorage.setItem('alike_wishlist', JSON.stringify(wishlist));
      localStorage.setItem('alike_contacts_v2', JSON.stringify(contacts));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [user, isSeller, walletBalance, products, cart, wishlist, orders, contacts]);

  // Global Toast Dispatcher
  const showToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const freshToken = { id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, msg, type };
    setToastList((prev) => [...prev, freshToken]);
  };

  const removeToast = (id: string) => {
    setToastList((prev) => prev.filter((t) => t.id !== id));
  };

  // State mutation wrappers
  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    // Check if combined key exists
    const index = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
    );

    if (index > -1) {
      const fresh = [...cart];
      fresh[index].quantity += quantity;
      setCart(fresh);
    } else {
      setCart([...cart, { product, quantity, selectedColor: color, selectedSize: size }]);
    }
    showToast(`Added ${quantity}x ${product.name} to checkout bag!`, 'success');
  };

  const handleUpdateQuantity = (id: number, qty: number, color?: string, size?: string) => {
    if (qty < 1) {
      handleRemoveFromCart(id, color, size);
      return;
    }
    setCart(
      cart.map((item) =>
        item.product.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const handleRemoveFromCart = (id: number, color?: string, size?: string) => {
    setCart(
      cart.filter(
        (item) =>
          !(item.product.id === id && item.selectedColor === color && item.selectedSize === size)
      )
    );
    showToast('Removed item from shopping bag.', 'info');
  };

  const handleToggleWishlist = (product: Product) => {
    if (!user) {
      setPendingWishlistProduct(product);
      setLoginOpen(true);
      showToast('Please sign in to save items to your wishlist.', 'info');
      return;
    }

    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
      showToast('Removed product from wishlist.', 'info');
    } else {
      setWishlist([...wishlist, product]);
      showToast('Starred item into your saved wishlist.', 'success');
    }
  };

  const handleToggleCompare = (product: Product) => {
    const exists = comparedProducts.some((p) => p.id === product.id);
    if (exists) {
      setComparedProducts(comparedProducts.filter((p) => p.id !== product.id));
      showToast(`Removed "${product.name}" from compare matrix.`, 'info');
    } else {
      if (comparedProducts.length >= 3) {
        showToast('Maximum of 3 creations can be compared at once!', 'warning');
        return;
      }
      setComparedProducts([...comparedProducts, product]);
      setIsCompareBarDismissed(false);
      showToast(`Added "${product.name}" to compare matrix.`, 'success');
    }
  };

  const handleAddMultipleToCart = (items: Product[]) => {
    const freshCart = [...cart];
    items.forEach((p) => {
      const index = freshCart.findIndex((item) => item.product.id === p.id);
      if (index > -1) {
        freshCart[index].quantity += 1;
      } else {
        freshCart.push({ product: p, quantity: 1 });
      }
    });
    setCart(freshCart);
  };

  const handleDeductWallet = (amt: number): boolean => {
    if (walletBalance < amt) return false;
    setWalletBalance((prev) => prev - amt);
    return true;
  };

  const handleAddWalletBalance = (amt: number) => {
    setWalletBalance((prev) => prev + amt);
  };

  const handlePlaceOrder = (newOrder: Order) => {
    const orderWithUser: Order = {
      ...newOrder,
      memberEmail: user?.email ? user.email.toLowerCase() : (newOrder.memberEmail || ''),
      userId: user?._id || newOrder.userId || '',
    };
    setOrders((prev) => [orderWithUser, ...prev]);
    if (user?.email) {
      try {
        const cleanEmail = user.email.toLowerCase();
        const updated = [orderWithUser, ...orders.filter((o) => o.memberEmail?.toLowerCase() === cleanEmail)];
        localStorage.setItem(`alike_orders_${cleanEmail}`, JSON.stringify(updated));
      } catch {}
    }
    setCart([]); // Reset basket
    setActiveCoupon(undefined);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status'], step: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, trackingStep: step } : o))
    );
  };

  // (c) Manual Client-Side Navigation Wrapper with window.history.pushState
  const handleNavigate = (view: string, categoryFilter?: string) => {
    // Ensure any open modals are dismissed upon navigation
    setLoginOpen(false);
    setSearchModalOpen(false);

    // Messenger triggers floating chat widget without altering the page route
    if (view === 'messenger') {
      setIsChatOpen((prev) => {
        const next = !prev;
        if (next) {
          setUnreadMessagesCount(0);
        }
        return next;
      });
      return;
    }

    let nextView = view;
    let nextCategory = selectedCategory;
    let nextProductId: number | null = null;
    let nextQuery = searchQuery;

    // Reset search query when navigating away from search and product detail views
    if (
      view !== 'search' &&
      view !== 'category_search' &&
      !view.startsWith('category_') &&
      view !== 'detail' &&
      !view.startsWith('product_')
    ) {
      nextQuery = '';
      setSearchQuery('');
    }

    if (view === 'admin') {
      nextView = 'admin';
    } else if (view === 'home') {
      nextView = 'home';
      nextCategory = 'all';
      nextProductId = null;
      setSelectedCategory('all');
      setSelectedProductId(null);
    } else if (view === 'category_search' || view === 'search') {
      nextView = 'search';
      nextCategory = categoryFilter !== undefined ? categoryFilter : (selectedCategory || 'all');
      nextProductId = null;
      setSelectedCategory(nextCategory);
      setSelectedProductId(null);
    } else if (view.startsWith('category_')) {
      nextView = 'search';
      nextCategory = view.replace('category_', '');
      nextProductId = null;
      setSelectedCategory(nextCategory);
      setSelectedProductId(null);
    } else if (view.startsWith('product_')) {
      nextView = 'detail';
      const pId = Number(view.replace('product_', ''));
      nextProductId = Number.isFinite(pId) ? pId : null;
      setSelectedProductId(nextProductId);
    } else if (view === 'detail') {
      nextView = 'detail';
      nextProductId = selectedProductId;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    } else if (view === 'profile' || view === 'orders') {
      nextView = 'profile';
      nextProductId = null;
      setSelectedProductId(null);
      if (view === 'orders') {
        setProfileInitialTab('orders');
      } else if (categoryFilter === 'settings' || categoryFilter === 'addresses' || categoryFilter === 'orders' || categoryFilter === 'wishlist') {
<<<<<<< HEAD
=======
=======
    } else if (view === 'profile') {
      nextView = 'profile';
      nextProductId = null;
      setSelectedProductId(null);
      if (categoryFilter === 'settings' || categoryFilter === 'addresses' || categoryFilter === 'orders' || categoryFilter === 'wishlist') {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        setProfileInitialTab(categoryFilter);
      } else {
        setProfileInitialTab('orders');
      }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    } else if (view.startsWith('store_') || view === 'seller_store') {
      nextView = 'seller_store';
      nextCategory = view.startsWith('store_') ? view.replace('store_', '') : (categoryFilter || selectedCategory);
      nextProductId = null;
      setSelectedCategory(nextCategory);
      setSelectedProductId(null);
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    } else {
      nextView = view;
      nextProductId = null;
      setSelectedProductId(null);
    }

    // Record previous view in navigation stack for accurate Back navigation
    if (nextView !== currentView) {
      setNavigationHistory((prev) => [...prev, currentView]);
    }

    setCurrentView(nextView);

    // Synchronize browser history and address bar URL with window.history.pushState
    if (typeof window !== 'undefined') {
      const targetUrl = buildRouteUrl(nextView, nextCategory, nextQuery, nextProductId);
      const currentUrl = window.location.pathname + window.location.search;
      if (currentUrl !== targetUrl) {
        window.history.pushState({ view: nextView, category: nextCategory, productId: nextProductId }, '', targetUrl);
      }
    }

    // Scroll smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back navigation handler: pops prior view from in-app stack or falls back to 'home'
  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const historyCopy = [...navigationHistory];
      const prevView = historyCopy.pop()!;
      setNavigationHistory(historyCopy);
      handleNavigate(prevView);
    } else {
      handleNavigate('home');
    }
  };

  const activeProduct = selectedProductId
    ? products.find((p) => p.id === selectedProductId) || products[0]
    : products[0];

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-neutral-200 font-sans selection:bg-[#D1D1D1] selection:text-black antialiased relative">

      {/* 2. Global Toast and Login overlays */}
      <Toast toasts={toastList} onDismiss={removeToast} />
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

      {/* Customer Location Capture Modal */}
      {showLocationModal && (
        <Suspense fallback={null}>
          <LocationCaptureModal
            isOpen={showLocationModal}
            onClose={() => setShowLocationModal(false)}
          />
        </Suspense>
      )}
      
      {loginOpen && (
        <Suspense fallback={null}>
<<<<<<< HEAD
=======
=======
      
      {loginOpen && (
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        <LoginModal
          isOpen={loginOpen}
          onClose={() => setLoginOpen(false)}
          onNavigate={handleNavigate}
          onLoginSuccess={(userData, isNewRegistration) => {
            const cleanEmail = userData.email.toLowerCase();

            // If user has Administrator privileges, log directly into Admin Panel
            if ((userData as any).isAdmin || (userData as any).adminToken) {
              const adminRole = (userData as any).adminRole || 'superadmin';
              const adminObj = {
                _id: userData._id || 'admin_user',
                email: userData.email,
                name: userData.name || 'Administrator',
                role: adminRole,
              };
              setCurrentAdminUser(adminObj);
<<<<<<< HEAD
              loginAdmin(adminObj, (userData as any).adminToken);
=======
<<<<<<< HEAD
              loginAdmin(adminObj, (userData as any).adminToken);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              setUser({
                _id: userData._id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                tier: 'Platinum',
              });
              setLoginOpen(false);
              handleNavigate('admin');
              showToast(`Welcome Master Administrator, ${userData.name}! Opening Admin Console...`, 'success');
              return;
            }

            // Setup active customer session tied to MongoDB document
            setUser({
              _id: userData._id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              tier: userData.tier || 'Silver',
            });
            setIsSeller(Boolean((userData as any)?.isSeller));
            if (isNewRegistration) {
              setWalletBalance(0);
              setOrders([]);
              try {
                localStorage.setItem(`alike_wallet_${cleanEmail}`, '0');
                localStorage.setItem(`alike_orders_${cleanEmail}`, '[]');
                localStorage.removeItem(`alike_addresses_${cleanEmail}`);
                localStorage.removeItem(`alike_cards_${cleanEmail}`);
              } catch {}
            } else {
              try {
                const savedWallet = localStorage.getItem(`alike_wallet_${cleanEmail}`);
                setWalletBalance(savedWallet !== null && !isNaN(Number(savedWallet)) ? Number(savedWallet) : 0);
              } catch {
                setWalletBalance(0);
              }
            }
            setLoginOpen(false);

            // Automatically add pending product to wishlist if user was prompted to sign in
            if (pendingWishlistProduct) {
              setWishlist((prevWishlist) => {
                if (!prevWishlist.some((p) => p.id === pendingWishlistProduct.id)) {
                  return [...prevWishlist, pendingWishlistProduct];
                }
                return prevWishlist;
              });
              showToast(`Added "${pendingWishlistProduct.name}" to your wishlist!`, 'success');
              setPendingWishlistProduct(null);
            } else if (isNewRegistration) {
              setCurrentView('profile');
              showToast(`Luxury account created successfully! Welcome to your profile, ${userData.name}!`, 'success');
            } else {
              showToast(`Welcome inside Alike luxury corridors, ${userData.name}!`, 'success');
            }
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

            // Restore savedLocation from user profile if available, or prompt location capture after login
            const savedLoc = (userData as any)?.savedLocation;
            if (!location && savedLoc && typeof savedLoc.lat === 'number' && typeof savedLoc.lng === 'number') {
              setLocation(
                {
                  lat: savedLoc.lat,
                  lng: savedLoc.lng,
                  label: savedLoc.label || 'Saved Location',
                  savedAt: Date.now(),
                },
                false
              );
            } else if (!location) {
              setTimeout(() => promptLocationCapture(), 500);
            }
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          }}
          onShowForgotPassword={() => {
            setLoginOpen(false);
            showToast('An OTP check corridor link has been triggered to coordinates.', 'info');
          }}
          showToast={showToast}
          isLightMode={isLightMode}
        />
<<<<<<< HEAD
        </Suspense>
=======
<<<<<<< HEAD
        </Suspense>
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      )}

      {/* Global Search Modal Experience */}
      {searchModalOpen && (
        <Suspense fallback={<SearchModalLoadingFallback />}>
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            onNavigate={handleNavigate}
            onSearch={(q, cat) => {
              setSearchQuery(q);
              if (cat) setSelectedCategory(cat);
              handleNavigate('category_search', cat || 'all');
            }}
            onSelectProduct={(p) => {
              handleNavigate('product_' + p.id);
            }}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            products={products}
            isLightMode={isLightMode}
            initialQuery={searchQuery}
          />
        </Suspense>
      )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      {/* 3. Sticky top navigational Header block (hidden inside standalone Seller/Admin workspaces) */}
      {currentView !== 'seller_dashboard' && currentView !== 'admin' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={unreadNotificationsCount}
          onClearUnreadMessages={() => setUnreadMessagesCount(0)}
          onClearUnreadNotifications={() => setUnreadNotificationsCount(0)}
          user={user}
          isSeller={isSeller}
          onLogout={() => {
            localStorage.removeItem('alike_user');
            localStorage.removeItem('alike_user_token');
            localStorage.removeItem('alikend_admin_token');
            adminApi.clearToken();
            logoutAdmin();
            signOut(auth)
              .then(() => {
                setUser(null);
                setIsSeller(false);
                setWalletBalance(0);
                setCart([]);
                setWishlist([]);
                setOrders([]);
                showToast('Logged out of luxury segment session.', 'info');
                handleNavigate('home');
              })
              .catch((err) => {
                console.error("Firebase signOut failed:", err);
                setUser(null);
                setIsSeller(false);
                setWalletBalance(0);
                setCart([]);
                setWishlist([]);
                setOrders([]);
                showToast('Logged out of luxury segment session.', 'info');
                handleNavigate('home');
              });
          }}
          onOpenAuthModal={(tab) => {
            setLoginOpen(true);
          }}
          onSearch={(q) => {
            setSearchQuery(q);
            if (typeof window !== 'undefined') {
              const targetUrl = buildRouteUrl('search', selectedCategory, q, null);
              const currentUrl = window.location.pathname + window.location.search;
              if (currentUrl !== targetUrl) {
                window.history.pushState({ view: 'search', q, category: selectedCategory }, '', targetUrl);
              }
            }
            if (currentView !== 'search') {
              setCurrentView('search');
            }
          }}
          onOpenSearchModal={(initialQ) => {
            if (initialQ !== undefined) setSearchQuery(initialQ);
            setSearchModalOpen(true);
          }}
          isLightMode={isLightMode}
          selectedCategory={selectedCategory}
        />
      )}

      {/* ALIKE ND Mode Switcher: Simple • Premium • Luxury */}
      {currentView !== 'admin' && currentView !== 'seller_dashboard' && (
        <ServiceModeSwitcher
          currentView={currentView}
          selectedCategory={selectedCategory}
          onNavigate={handleNavigate}
          isLightMode={isLightMode}
        />
      )}

      {/* 4. Sub-page router dispatcher */}
      <main className={`flex-grow pt-0 relative z-10 ${currentView === 'seller_dashboard' || currentView === 'admin' ? 'pb-0' : 'pb-16'}`} id="main-spa-body">
<<<<<<< HEAD
=======
=======
      {/* 3. Sticky top navigational Header block */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onClearUnreadMessages={() => setUnreadMessagesCount(0)}
        onClearUnreadNotifications={() => setUnreadNotificationsCount(0)}
        user={user}
        isSeller={isSeller}
        onLogout={() => {
          localStorage.removeItem('alike_user');
          localStorage.removeItem('alike_user_token');
          localStorage.removeItem('alikend_admin_token');
          adminApi.clearToken();
          signOut(auth)
            .then(() => {
              setUser(null);
              setIsSeller(false);
              setWalletBalance(0);
              setCart([]);
              setWishlist([]);
              setOrders([]);
              showToast('Logged out of luxury segment session.', 'info');
              handleNavigate('home');
            })
            .catch((err) => {
              console.error("Firebase signOut failed:", err);
              setUser(null);
              setIsSeller(false);
              setWalletBalance(0);
              setCart([]);
              setWishlist([]);
              setOrders([]);
              showToast('Logged out of luxury segment session.', 'info');
              handleNavigate('home');
            });
        }}
        onOpenAuthModal={(tab) => {
          setLoginOpen(true);
        }}
        onSearch={(q) => {
          setSearchQuery(q);
          if (typeof window !== 'undefined') {
            const targetUrl = buildRouteUrl('search', selectedCategory, q, null);
            const currentUrl = window.location.pathname + window.location.search;
            if (currentUrl !== targetUrl) {
              window.history.pushState({ view: 'search', q, category: selectedCategory }, '', targetUrl);
            }
          }
          if (currentView !== 'search') {
            setCurrentView('search');
          }
        }}
        onOpenSearchModal={(initialQ) => {
          if (initialQ !== undefined) setSearchQuery(initialQ);
          setSearchModalOpen(true);
        }}
        isLightMode={isLightMode}
        selectedCategory={selectedCategory}
      />

      {/* 4. Sub-page router dispatcher */}
      <main className="flex-grow pt-0 pb-16 relative z-10" id="main-spa-body">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        <div key={currentView} className="animate-page-in">
          {currentView === 'home' && (
          <Home
            products={products}
            jobs={JOBS}
            testimonials={TESTIMONIALS}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onToggleWishlist={handleToggleWishlist}
            wishlistedIds={wishlist.map((p) => p.id)}
            onNavigate={handleNavigate}
            onCompare={handleToggleCompare}
            onQuickView={setQuickViewProduct}
            isLightMode={isLightMode}
          />
        )}

        {currentView !== 'home' && (
          <Suspense fallback={<PageLoadingFallback />}>
            {currentView === 'detail' && (
              <ProductDetail
            product={activeProduct}
            allProducts={products}
            onAddToCart={handleAddToCart}
            onAddToCartAndCheckout={(p, qty, color, size) => {
              handleAddToCart(p, qty, color, size);
              handleNavigate('checkout');
            }}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            isWishlisted={wishlist.some((p) => p.id === activeProduct.id)}
            wishlistedIds={wishlist.map((p) => p.id)}
            showToast={showToast}
            isLightMode={isLightMode}
            onBack={handleBack}
            showBackButton={true}
          />
        )}

        {(currentView === 'search' || currentView === 'category_search') && (
          <SearchPage
            products={products}
            initialCategory={selectedCategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              if (typeof window !== 'undefined') {
                const targetUrl = buildRouteUrl('search', cat, searchQuery, null);
                const currentUrl = window.location.pathname + window.location.search;
                if (currentUrl !== targetUrl) {
                  window.history.replaceState({ view: 'search', category: cat, q: searchQuery }, '', targetUrl);
                }
              }
            }}
            onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
            onToggleWishlist={handleToggleWishlist}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onCompare={handleToggleCompare}
            onQuickView={setQuickViewProduct}
            wishlistedIds={wishlist.map((p) => p.id)}
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              if (typeof window !== 'undefined') {
                const targetUrl = buildRouteUrl('search', selectedCategory, q, null);
                const currentUrl = window.location.pathname + window.location.search;
                if (currentUrl !== targetUrl) {
                  window.history.replaceState({ view: 'search', category: selectedCategory, q }, '', targetUrl);
                }
              }
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
            onBack={() => handleNavigate('home')}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'cart' && (
          <Cart
            cartItems={cart}
            allProducts={products}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onProceedToCheckout={(coupon) => {
              if (coupon) setActiveCoupon(coupon);
              handleNavigate('checkout');
            }}
            showToast={showToast}
            onBack={() => handleNavigate('home')}
          />
        )}

        {currentView === 'checkout' && (
          <Checkout
            cartItems={cart}
            couponCode={activeCoupon}
            walletBalance={walletBalance}
            onDeductWallet={handleDeductWallet}
            onPlaceOrder={handlePlaceOrder}
            onNavigate={handleNavigate}
            showToast={showToast}
            user={user}
          />
        )}

        {currentView === 'profile' && (
          <Profile
            user={user}
            onUpdateUser={(u) => setUser(u)}
            orders={userOrders}
            wishlist={wishlist}
            onRemoveWishlistItem={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onNavigate={handleNavigate}
            onBack={handleBack}
            showBackButton={true}
            initialTab={profileInitialTab}
            walletBalance={walletBalance}
            transactions={INITIAL_TRANSACTIONS}
            onAddWalletBalance={handleAddWalletBalance}
            showToast={showToast}
            isLightMode={isLightMode}
            onOpenLogin={() => setLoginOpen(true)}
          />
        )}

        {currentView === 'wishlist' && (
          <WishlistPage
            wishlist={wishlist}
            onRemoveWishlistItem={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onNavigate={handleNavigate}
            onBack={handleBack}
            showBackButton={true}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'messenger' && (
          <Messenger
            contacts={contacts}
            setContacts={setContacts}
            showToast={showToast}
            user={user}
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'jobs' && (
          <JobsPortal
            jobs={JOBS}
            showToast={showToast}
          />
        )}

        {currentView === 'support' && (
          <SupportCenter
            user={user}
            onNavigate={handleNavigate}
            onOpenAuthModal={() => setLoginOpen(true)}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'terms_conditions' && (
          <TermsAndConditions
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'privacy_policy' && (
          <PrivacyPolicy
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'return_refund_policy' && (
          <ReturnRefundPolicy
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'grievance_policy' && (
          <GrievanceRedressalPolicy
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'seller_policy' && (
          <SellerPolicy
            onNavigate={handleNavigate}
            isLightMode={isLightMode}
          />
        )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        {(currentView === 'seller_register' ||
          currentView === 'seller_login' ||
          currentView === 'seller_signup' ||
          currentView === 'seller_forgot_password') && (
          <SellerRegister
            initialMode={
              currentView === 'seller_signup'
                ? 'signup'
                : currentView === 'seller_forgot_password'
                ? 'forgot_password'
                : 'login'
            }
            onNavigate={handleNavigate}
            onRegisterSuccess={() => {
              setIsSeller(true);
            }}
            onLoginSuccess={() => {
<<<<<<< HEAD
=======
=======
        {currentView === 'seller_register' && (
          <SellerRegister
            onRegisterSuccess={(seller) => {
              if (seller && seller.status === 'approved') {
                setIsSeller(true);
                handleNavigate('seller_dashboard');
              }
            }}
            onLoginSuccess={(seller) => {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              setIsSeller(true);
              handleNavigate('seller_dashboard');
            }}
            onNavigateToDashboard={() => handleNavigate('seller_dashboard')}
            onNavigateHome={() => handleNavigate('home')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {currentView === 'seller_dashboard' && (
          <SellerDashboard
            products={products}
            onAddProduct={(p) => {
              setProducts([p, ...products]);
              try {
                localStorage.setItem('alike_products', JSON.stringify([p, ...products]));
              } catch {}
            }}
            onRemoveProduct={(id) => {
              const updated = products.filter((p) => p.id !== id);
              setProducts(updated);
              try {
                localStorage.setItem('alike_products', JSON.stringify(updated));
              } catch {}
            }}
            onUpdateProduct={(p) => {
              const updated = products.map((item) => (item.id === p.id ? p : item));
              setProducts(updated);
              try {
                localStorage.setItem('alike_products', JSON.stringify(updated));
              } catch {}
            }}
            onNavigate={handleNavigate}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        {currentView === 'seller_store' && (
          <PublicSellerStore
            sellerId={selectedCategory}
            allProducts={products}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            onAddToCart={(p, qty) => handleAddToCart(p, qty || 1)}
            onBack={handleBack}
            showToast={(msg) => showToast(msg, 'success')}
          />
        )}

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        {currentView === 'notifications' && (
          <NotificationsPage
            notifications={INITIAL_NOTIFICATIONS}
            showToast={showToast}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'ai_recs' && (
          <AIRecommendations
            products={products}
            onAddMultipleToCart={handleAddMultipleToCart}
            onSelectProduct={(p) => handleNavigate('product_' + p.id)}
            showToast={showToast}
          />
        )}

        {currentView === 'admin' && (
          <div className="w-full">
            <div className="bg-[#241129] border-b border-white/10 px-6 py-2.5 flex items-center justify-between text-xs">
              <span className="font-mono text-pink-300 tracking-wider">ALIKE ND Administrator Console</span>
              <button
                onClick={() => handleNavigate('home')}
                className="font-medium text-amber-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>←</span> Return to Galleria Store
              </button>
            </div>
            <AdminPanel 
              onNavigateHome={() => handleNavigate('home')} 
              user={user} 
              initialAdmin={currentAdminUser}
              onProductsChange={handleProductsChange}
            />
          </div>
        )}

        {currentView === 'superadmin_login' && (
          <div className="w-full">
            <SuperAdminLogin
              onLoginSuccess={(admin) => {
                setCurrentAdminUser(admin);
<<<<<<< HEAD
                loginAdmin(admin);
=======
<<<<<<< HEAD
                loginAdmin(admin);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                showToast(`Welcome Master Administrator, ${admin.name}.`, 'success');
              }}
              onSuccess={() => {
                handleNavigate('admin');
              }}
              onNavigate={handleNavigate}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          </div>
        )}

        {currentView === 'staffadmin_login' && (
          <div className="w-full">
            <StaffAdminLogin
              onLoginSuccess={(admin) => {
                setCurrentAdminUser(admin);
<<<<<<< HEAD
                loginAdmin(admin);
=======
<<<<<<< HEAD
                loginAdmin(admin);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                showToast(`Welcome Operations Staff, ${admin.name}.`, 'success');
              }}
              onSuccess={() => {
                handleNavigate('admin');
              }}
              onNavigate={handleNavigate}
              showToast={showToast}
              isLightMode={isLightMode}
            />
          </div>
        )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

        {/* ALIKE ND Rides Passenger Booking View */}
        {currentView === 'rides' && (
          <RideBookingPage
            user={user}
            onNavigateHome={() => handleNavigate('home')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* ALIKE ND Driver Partner Portal (Bike / Auto / Cab) */}
        {currentView === 'driver_portal' && (
          <DriverPortal
            onNavigateHome={() => handleNavigate('home')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* ALIKE ND Delivery Hub View (Quick 10-20m, Food, Stores, Wholesale) */}
        {currentView === 'delivery' && (
          <DeliveryHubPage
            user={user}
            onNavigateHome={() => handleNavigate('home')}
            onNavigateCatalog={(cat) => handleNavigate('category_search', cat)}
            onNavigatePartner={() => handleNavigate('delivery_partner')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* ALIKE ND Dedicated Delivery Partner Portal */}
        {currentView === 'delivery_partner' && (
          <DeliveryPartnerPortal
            onNavigateHome={() => handleNavigate('home')}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          </Suspense>
        )}
        </div>
      </main>

      {/* 5. Elegant footer of the unified platform */}
      {(() => {
        // Explicit view classification:
        // Sub-pages/detail views where a "Back" button is meaningful:
        // - 'detail': Product Detail page (browsing flow)
        // - 'search' / 'category_search': Category catalogue & search results
        // - 'cart': Shopping Cart (shopping flow)
        // - 'checkout': Checkout funnel (order flow)
        // - 'profile': User Account, order tracking & settings
        // - 'wishlist': Saved products wishlist
        // - 'notifications': Notifications tray
        // - 'ai_recs': AI Recommendations & Style Guide
        // Top-level entry points / standalone portals where "Back" is omitted / hidden:
        // - 'home': Store homepage (root landing page)
        // - 'seller_dashboard': Standalone vendor management workstation
        // - 'admin': Master Administrator console (has built-in "Return to Store" action)
        // - 'superadmin_login': Dedicated admin login screen
        // - 'staffadmin_login': Dedicated staff login screen
        // - 'jobs': Standalone careers portal
        // - 'seller_register': Standalone seller onboarding portal
        // - 'messenger': Standalone chat / message view
        const subPageViews = ['detail', 'search', 'category_search', 'cart', 'checkout', 'profile', 'wishlist', 'notifications', 'ai_recs', 'terms_conditions', 'privacy_policy', 'return_refund_policy', 'grievance_policy', 'seller_policy'];
        const shouldShowBackButton = subPageViews.includes(currentView) && (navigationHistory.length > 0 || currentView !== 'home');

        return (
          <Footer 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            isLightMode={isLightMode} 
            currentView={currentView}
            showBackButton={shouldShowBackButton}
          />
        );
      })()}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      {/* Mobile Sticky Bottom Navigation Bar (Simple • Premium • Luxury • Cart • Account) */}
      {currentView !== 'seller_dashboard' && currentView !== 'admin' && (
        <BottomNav
          currentView={currentView}
          selectedCategory={selectedCategory}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          user={user}
          isLightMode={isLightMode}
          onNavigate={handleNavigate}
          onOpenAuthModal={() => setLoginOpen(true)}
        />
      )}

      {/* 2.1 Product Quick View Modal */}
      {quickViewProduct && (
        <Suspense fallback={null}>
          <QuickViewModal
            product={quickViewProduct}
            isOpen={Boolean(quickViewProduct)}
            onClose={() => setQuickViewProduct(null)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={Boolean(quickViewProduct && wishlist.some((p) => p.id === quickViewProduct.id))}
            onNavigateToDetail={(p) => handleNavigate('product_' + p.id)}
            isLightMode={isLightMode}
          />
        </Suspense>
      )}

      {/* 2.5 Compare Sticky Bottom Drawer Panel */}
      {comparedProducts.length > 0 && !isCompareBarDismissed && (
        <Suspense fallback={null}>
          <ComparisonCorridorBar
            selectedItems={comparedProducts}
            onRemoveItem={(id) => {
              const next = comparedProducts.filter((item) => item.id !== id);
              setComparedProducts(next);
              if (next.length === 0) setIsCompareBarDismissed(false);
            }}
            onCloseBar={() => setIsCompareBarDismissed(true)}
            onPurge={() => {
              setComparedProducts([]);
              setIsCompareBarDismissed(false);
            }}
            onCompare={() => setShowCompareModal(true)}
          />
        </Suspense>
<<<<<<< HEAD
=======
=======
      {/* Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        user={user}
        isLightMode={isLightMode}
        onNavigate={handleNavigate}
        onOpenAuthModal={() => setLoginOpen(true)}
      />

      {/* 2.1 Product Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={Boolean(quickViewProduct && wishlist.some((p) => p.id === quickViewProduct.id))}
        onNavigateToDetail={(p) => handleNavigate('product_' + p.id)}
        isLightMode={isLightMode}
      />

      {/* 2.5 Compare Sticky Bottom Drawer Panel */}
      {comparedProducts.length > 0 && !isCompareBarDismissed && (
        <ComparisonCorridorBar
          selectedItems={comparedProducts}
          onRemoveItem={(id) => {
            const next = comparedProducts.filter((item) => item.id !== id);
            setComparedProducts(next);
            if (next.length === 0) setIsCompareBarDismissed(false);
          }}
          onCloseBar={() => setIsCompareBarDismissed(true)}
          onPurge={() => {
            setComparedProducts([]);
            setIsCompareBarDismissed(false);
          }}
          onCompare={() => setShowCompareModal(true)}
        />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      )}

      {/* 2.5 Detailed Attribute Compare Specification Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4 overflow-y-auto animate-fade-in" onClick={() => setShowCompareModal(false)}>
          <div className="bg-neutral-950 border-2 border-solid border-[#D1D1D1]/40 rounded-3xl w-full max-w-5xl max-h-[85vh] overflow-y-auto shadow-2xl glass-panel relative p-6 scale-in animate-page-in" onClick={(e) => e.stopPropagation()}>
            <GlassCloseButton
              onClick={() => setShowCompareModal(false)}
              className="absolute top-4 right-4 z-10"
              size="md"
              title="Close Compare"
            />

            <h2 className="text-xl font-mono uppercase tracking-wider mb-6 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] bg-clip-text text-transparent font-extrabold">Detailed Spec Comparison Matrix</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300 border-collapse">
                <thead>
                  <tr className="border-b border-solid border-neutral-900">
                    <th className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono w-48">Spec Key</th>
                    {comparedProducts.map((p, pIdx) => (
                      <th key={`cmp-head-${p.id}-${pIdx}`} className="py-4 px-4 w-64 min-w-[200px]">
                        <div className="space-y-2">
                          <img src={p.image} alt={p.name} className="w-24 h-24 rounded-lg object-cover bg-neutral-900 border border-solid border-neutral-800" referrerPolicy="no-referrer" />
                          <h4 className="font-bold text-white font-sans text-sm line-clamp-1">{p.name}</h4>
                          <span className="text-[9px] uppercase font-mono tracking-wider text-[#D1D1D1] bg-[#D1D1D1]/20 px-2 py-0.5 rounded-full">{p.brand}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">Price Point</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-price-${p.id}-${pIdx}`} className="py-4 px-4 text-sm font-black text-[#D1D1D1]">₹{p.price.toLocaleString('en-IN')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">MRP Value</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-mrp-${p.id}-${pIdx}`} className="py-4 px-4 text-xs text-neutral-400 line-through">₹{p.mrp.toLocaleString('en-IN')}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Atelier Rating</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-rating-${p.id}-${pIdx}`} className="py-4 px-4">
                        <div className="flex items-center text-[#D1D1D1] font-bold">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {p.rating.toFixed(1)} / 5.0
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Reviews Count</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-reviews-${p.id}-${pIdx}`} className="py-4 px-4">{p.reviewsCount} buyers</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Level Layer</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-cat-${p.id}-${pIdx}`} className="py-4 px-4 capitalize font-mono text-[11px] text-[#D1D1D1]">{p.category}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono font-black">Description notes</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-desc-${p.id}-${pIdx}`} className="py-4 px-4 text-neutral-400 text-[11px] leading-relaxed max-w-[200px] line-clamp-3">{p.description}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4 uppercase text-[10px] tracking-wider text-neutral-500 font-extrabold font-mono">Action Corridor</td>
                    {comparedProducts.map((p, pIdx) => (
                      <td key={`cmp-action-${p.id}-${pIdx}`} className="py-4 px-4">
                        <button
                          onClick={() => {
                            handleAddToCart(p);
                            setShowCompareModal(false);
                            setComparedProducts([]);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-[#ffffff] to-[#D1D1D1] hover:opacity-90 text-black font-black uppercase text-[10px] tracking-wider rounded-lg transition-all shadow cursor-pointer"
                        >
                          Add to Bag
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Floating Messenger Side Widget/Popup */}
      {isChatOpen && (
        <Suspense fallback={<MessengerLoadingFallback />}>
<<<<<<< HEAD
          <div id="chat-widget-container" className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-[90] w-[380px] max-w-[calc(100vw-24px)] h-[min(540px,calc(100vh-120px))] rounded-3xl overflow-hidden shadow-2xl border-2 border-solid border-[#D1D1D1]/40 flex flex-col bg-white animate-slide-up animate-page-in">
=======
<<<<<<< HEAD
          <div id="chat-widget-container" className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-[90] w-[380px] max-w-[calc(100vw-24px)] h-[min(540px,calc(100vh-120px))] rounded-3xl overflow-hidden shadow-2xl border-2 border-solid border-[#D1D1D1]/40 flex flex-col bg-white animate-slide-up animate-page-in">
=======
          <div id="chat-widget-container" className="fixed bottom-6 right-6 z-[90] w-[380px] max-w-[calc(100vw-32px)] h-[min(580px,calc(100vh-100px))] rounded-3xl overflow-hidden shadow-2xl border-2 border-solid border-[#D1D1D1]/40 flex flex-col bg-white animate-slide-up animate-page-in">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <Messenger
                contacts={contacts}
                setContacts={setContacts}
                showToast={showToast}
                user={user}
                onNavigate={handleNavigate}
                isLightMode={isLightMode}
                isWidget={true}
                onClose={() => setIsChatOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

      <Suspense fallback={null}>
        {/* Product Edit Modal */}
        {editingProduct && (
          <AdminProductEditModal
            product={editingProduct}
            isOpen={Boolean(editingProduct)}
            onClose={closeEditProduct}
            onSaveSuccess={(updated) => {
              handleProductsChange(
                products.map((p) => (p.id === updated.id || (p._id && p._id === updated._id) ? updated : p))
              );
              triggerRefresh();
              showToast(`Product "${updated.name}" updated successfully live!`, 'success');
            }}
          />
        )}

        {/* Product Delete Confirmation Modal */}
        {deletingProduct && (
          <AdminConfirmDeleteModal
            isOpen={Boolean(deletingProduct)}
            onClose={closeDeleteProduct}
            title="Delete Product from Catalog"
            itemTitle={deletingProduct?.name || ''}
            itemSubtitle={`ID: #${deletingProduct?.id} • ₹${deletingProduct?.price}`}
            imageUrl={deletingProduct?.image}
            warningText="Are you sure you want to permanently remove this product from the live catalog? This action will not break previous order history."
            onConfirm={async () => {
              if (!deletingProduct) return;
              const targetId = deletingProduct._id || String(deletingProduct.id);
              await adminApi.deleteProduct(targetId);
              handleProductsChange(products.filter((p) => p.id !== deletingProduct.id && p._id !== deletingProduct._id));
              if (selectedProductId === deletingProduct.id) {
                handleNavigate('home');
              }
              triggerRefresh();
              showToast(`Product "${deletingProduct.name}" removed from catalog.`, 'info');
            }}
          />
        )}

        {/* Banner Edit Modal */}
        {(editingBanner || isCreatingBanner) && (
          <AdminBannerEditModal
            banner={editingBanner}
            isOpen={Boolean(editingBanner) || isCreatingBanner}
            isCreating={isCreatingBanner}
            onClose={closeEditBanner}
            onSaveSuccess={() => {
              triggerRefresh();
              showToast(isCreatingBanner ? 'New banner slide added!' : 'Banner slide updated live!', 'success');
            }}
          />
        )}

        {/* Banner Delete Confirmation Modal */}
        {deletingBanner && (
          <AdminConfirmDeleteModal
            isOpen={Boolean(deletingBanner)}
            onClose={closeDeleteBanner}
            title="Delete Hero Banner Slide"
            itemTitle={deletingBanner?.title || 'Hero Banner Slide'}
            itemSubtitle={deletingBanner?.subtitle}
            imageUrl={deletingBanner?.imageUrl}
            warningText="Are you sure you want to remove this slide from the homepage hero carousel?"
            onConfirm={async () => {
              if (!deletingBanner?._id) return;
              await adminApi.deleteBanner(deletingBanner._id);
              triggerRefresh();
              showToast('Banner slide deleted successfully.', 'info');
            }}
          />
        )}

        {/* Advertisement Edit Modal */}
        {(editingAd || isCreatingAd) && (
          <AdminAdEditModal
            ad={editingAd}
            isOpen={Boolean(editingAd) || isCreatingAd}
            isCreating={isCreatingAd}
            onClose={closeEditAd}
            onSaveSuccess={() => {
              triggerRefresh();
              showToast(isCreatingAd ? 'New advertisement created!' : 'Advertisement updated live!', 'success');
            }}
          />
        )}

        {/* Advertisement Delete Confirmation Modal */}
        {deletingAd && (
          <AdminConfirmDeleteModal
            isOpen={Boolean(deletingAd)}
            onClose={closeDeleteAd}
            title="Delete Advertisement Creative"
            itemTitle={deletingAd?.title || 'Advertisement'}
            itemSubtitle={deletingAd?.subtitle}
            imageUrl={deletingAd?.imageUrl}
            warningText="Are you sure you want to permanently delete this advertisement from the website?"
            onConfirm={async () => {
              if (!deletingAd) return;
              const targetId = deletingAd._id || deletingAd.id;
              await adminApi.deleteAdvertisement(targetId);
              triggerRefresh();
              showToast('Advertisement deleted successfully.', 'info');
            }}
          />
        )}

        {/* Flash Deals Management Modal */}
        {isFlashSaleModalOpen && (
          <AdminFlashSaleModal
            isOpen={isFlashSaleModalOpen}
            onClose={closeFlashSaleModal}
            allProducts={products}
            onSaveSuccess={() => {
              triggerRefresh();
              showToast('Flash deals & schedule updated live!', 'success');
            }}
          />
        )}
      </Suspense>
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    </div>
  );
}
