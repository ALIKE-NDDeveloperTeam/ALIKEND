import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Search,
  Bell,
  Heart,
  ShoppingCart,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
  Menu,
  X,
  CreditCard,
  Briefcase,
  Store,
  Wallet,
  Settings,
  Headphones,
  Sun,
  Moon,
  Home,
  Sparkles,
  Zap,
  Package,
  Layers,
  Watch,
  Smartphone,
  Shield,
  ShieldAlert,
  Edit3,
  Shirt,
  Utensils,
  Car,
  MapPin,
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import Logo from './Logo';
import { useAdminEdit } from '../context/AdminEditContext';
import { rideApi } from '../services/rideApi';
import { useLocation } from '../context/LocationContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, categoryFilter?: string) => void;
  cartCount: number;
  wishlistCount?: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  onClearUnreadMessages?: () => void;
  onClearUnreadNotifications?: () => void;
  user: { name: string; email: string; phone: string; isSeller?: boolean; sellerStatus?: string | null; avatar?: string } | null;
  isSeller?: boolean;
  onLogout: () => void;
  onOpenAuthModal: (tab?: 'password' | 'otp' | 'register') => void;
  onSearch: (query: string) => void;
  onOpenSearchModal?: (initialQuery?: string) => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
  selectedCategory?: string;
}

export default function Header({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  unreadMessagesCount,
  unreadNotificationsCount,
  onClearUnreadMessages,
  onClearUnreadNotifications,
  user,
  isSeller = false,
  onLogout,
  onOpenAuthModal,
  onSearch,
  onOpenSearchModal,
  isLightMode = false,
  onToggleTheme = () => {},
  selectedCategory = 'all',
}: HeaderProps) {
  const { isAdmin, isEditMode, toggleEditMode } = useAdminEdit();
  const { location, hasQuickDelivery, quickDeliveryEta, promptLocationCapture } = useLocation();
  const isApprovedSeller = Boolean(isSeller || user?.isSeller === true || user?.sellerStatus === 'approved');

  // Dynamic header badge text per Phase 1 specs:
  // - without location: "Enable location"
  // - with location and quick-delivery seller nearby: "Quick Delivery 12-18 min" (or dynamic ETA)
  // - with location but none nearby: "Standard delivery"
  const quickDeliveryBadgeText = !location
    ? 'Enable location'
    : hasQuickDelivery
    ? `Quick Delivery ${quickDeliveryEta || '10-20 min'}`
    : 'Standard delivery';

  const handleQuickDeliveryClick = () => {
    if (!location) {
      promptLocationCapture();
    } else {
      onNavigate('delivery');
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Smooth smart-header scroll state
  const [isScrolled, setIsScrolled] = useState(false);
  const [onlineRideTypes, setOnlineRideTypes] = useState<string[]>(['BIKE', 'AUTO', 'CAB']);

  useEffect(() => {
    rideApi.getOnlineTypes().then((res) => {
      if (res?.availableTypes && res.availableTypes.length > 0) {
        setOnlineRideTypes(res.availableTypes.map((t: string) => t.toUpperCase()));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setIsScrolled(currentY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      onSearch('');
      onNavigate('search');
      return;
    }
    onSearch(searchQuery.trim());
    onNavigate('search');
  };

  // Autocomplete Suggestions logic
  const filteredSuggestions = searchQuery.trim() === ''
    ? []
    : PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

  const [headerNotifications, setHeaderNotifications] = useState([
    { id: 'n1', title: 'Luxury Dispatch Confirmed', desc: 'Your Aurelia Gold Watch is dispatched via high-efficiency segment 200.', time: '10 mins ago', unread: true, targetView: 'orders' },
    { id: 'n2', title: 'Atelier Coupon Unlocked', desc: 'Use premium code ALIKE10 to avail 10% loyalty discount on your cart.', time: '2 hours ago', unread: true, targetView: 'profile' },
    { id: 'n3', title: 'Secure Wallet Credit Active', desc: '₹15,000 complimentary segmented reserve is ready to checkout items.', time: '1 day ago', unread: false, targetView: 'profile' }
  ]);

  const activeUnreadCount = headerNotifications.filter(n => n.unread).length;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b border-solid transition-all duration-300 ease-in-out ${
      isScrolled
        ? isLightMode
          ? 'shadow-md shadow-neutral-900/5 border-neutral-200'
          : 'shadow-lg shadow-black/80 border-neutral-800'
        : 'shadow-none border-transparent'
    } ${
      isLightMode
        ? 'bg-white/95 text-black border-neutral-200'
        : 'bg-black/95 text-white border-neutral-800'
    }`}>
      {/* Real Top Storefront Banner (Quick Delivery 10-20M & Alike Rides Badges) */}
      <div className={`w-full border-b select-none transition-colors duration-200 ${
        isLightMode
          ? 'bg-neutral-100/90 border-neutral-200/80'
          : 'bg-neutral-950/95 border-neutral-900'
      }`}>
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 py-1 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dynamic Yellow Badge: Quick Delivery */}
            <button
              id="top-banner-quick-delivery-btn"
              type="button"
              onClick={handleQuickDeliveryClick}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-[9.5px] sm:text-[10px] tracking-wide uppercase transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title={location ? "Express 10-20 min hyperlocal delivery" : "Click to allow location for quick delivery"}
            >
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-black text-black shrink-0" />
              <span className="truncate max-w-[115px] sm:max-w-none">{quickDeliveryBadgeText}</span>
            </button>

            {/* Location Selector & Area Name Pill */}
            <button
              id="top-banner-location-btn"
              type="button"
              onClick={promptLocationCapture}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold tracking-tight transition-all cursor-pointer border shrink-0 ${
                location
                  ? isLightMode
                    ? 'bg-neutral-200/80 hover:bg-neutral-300/80 text-neutral-800 border-neutral-300'
                    : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-750'
                  : 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-700 dark:text-amber-300 border-amber-400/50'
              }`}
              title={location ? `Delivering to: ${location.label}. Click to change.` : 'Set your delivery location'}
            >
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />
              <span className="truncate max-w-[85px] sm:max-w-[170px]">
                {location ? location.label : 'Location'}
              </span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60 shrink-0" />
            </button>

            {/* Green Badge: Alike Rides BIKE • AUTO • CAB */}
            <button
              id="top-banner-alike-rides-btn"
              type="button"
              onClick={() => onNavigate('rides')}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9.5px] sm:text-[10px] tracking-wide uppercase transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Book Alike Rides (Bike, Auto, Cab)"
            >
              <Car className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span className="sm:hidden">Rides</span>
              <span className="hidden sm:inline">
                Alike Rides {onlineRideTypes.length > 0 ? onlineRideTypes.join(' • ') : 'BIKE • AUTO • CAB'}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 shrink-0 ml-auto">
            <button
              id="top-banner-driver-partner-btn"
              type="button"
              onClick={() => onNavigate('driver_portal')}
              className={`flex items-center gap-1 text-[10px] font-bold tracking-tight cursor-pointer transition-colors ${
                isLightMode ? 'text-neutral-600 hover:text-black' : 'text-neutral-400 hover:text-emerald-400'
              }`}
              title="Driver Partner Registration & Ops Portal"
            >
              <span>Driver Partner Portal</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Header (~80px height standard, shrinks on scroll) */}
      <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ease-in-out ${
        isScrolled ? 'py-1.5 md:py-2' : 'py-2 sm:py-3'
      }`}>
        {/* Official ALIKE ND Brand Logo */}
        <div
          id="alike-logo-container"
          onClick={() => onNavigate('home')}
          className="cursor-pointer group select-none shrink-0 flex items-center"
        >
          <Logo size={isScrolled ? "sm" : "md"} isLightMode={isLightMode} />
        </div>

        {/* Search Bar: Clean, Unified, Minimal Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl min-w-[200px] mx-2 lg:mx-4 relative" ref={searchRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative group"
            id="header-search-form"
          >
            {/* Left Search Icon */}
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center transition-colors">
              <Search className={`transition-all duration-300 text-neutral-400 group-hover:text-[#FF007F] ${
                isScrolled ? 'w-3.5 h-3.5' : 'w-4 h-4'
              }`} />
            </div>

            {/* Main Input Field */}
            <input
              id="search-input-header"
              type="text"
              placeholder="Search luxury products, brands, deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full font-sans tracking-wide transition-all duration-300 ease-in-out border border-solid outline-none ${
                isScrolled
                  ? 'py-1.5 pl-9 pr-24 rounded-full text-xs'
                  : 'py-2.5 pl-10 pr-28 rounded-full text-xs'
              } ${
                isLightMode
                  ? 'bg-neutral-100/90 text-black border-neutral-300 focus:border-[#FF007F] focus:bg-white focus:ring-2 focus:ring-[#FF007F]/20 shadow-xs placeholder-neutral-500'
                  : 'bg-neutral-900/90 text-white border-neutral-750 focus:border-[#FF007F] focus:bg-neutral-850 focus:ring-2 focus:ring-[#FF007F]/20 shadow-inner placeholder-neutral-400'
              }`}
            />
            
            {/* Right Controls: Clear button + Keyboard shortcut + Search Action Button */}
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Keyboard shortcut hint */}
              <div className="pointer-events-none hidden xl:flex items-center">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isLightMode
                    ? 'bg-neutral-200 border-neutral-300 text-neutral-600'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                }`}>
                  ⌘K
                </span>
              </div>

              {/* Styled #0d0d0d Search Action Pill */}
              <button
                id="search-submit-btn-header"
                type="submit"
                className={`flex items-center justify-center gap-1 px-3.5 py-1 bg-[#0d0d0d] hover:bg-black text-white font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-[#0d0d0d] ${
                  isScrolled ? 'h-6.5 text-[10px] px-2.5' : 'h-7.5'
                }`}
                title="Execute Search"
              >
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Side Icons & Auth Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          {/* Desktop Only Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Direct Seller Panel Link */}
            <button
              id="header-nav-seller-panel-btn"
              type="button"
              onClick={() => onNavigate('seller_dashboard')}
              className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                currentView === 'seller_dashboard'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                  : isLightMode
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-600/40'
              }`}
              title="Seller Panel"
            >
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>Seller Panel</span>
            </button>

            {/* Notifications with interactive Dropdown panel */}
            <div className="relative" ref={notificationRef}>
              <button
                id="nav-notifications-btn"
                onClick={() => {
                  const nextState = !notificationsDropdownOpen;
                  setNotificationsDropdownOpen(nextState);
                  if (nextState) {
                    onClearUnreadNotifications?.();
                  }
                }}
                className={`rounded-full relative border border-solid border-transparent transition-all duration-300 ease-in-out active:scale-95 ${
                  isScrolled ? 'p-2' : 'p-2.5'
                } ${
                  isLightMode 
                    ? 'text-neutral-700 hover:text-black hover:bg-neutral-100' 
                    : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                } ${
                  notificationsDropdownOpen 
                    ? isLightMode 
                      ? 'text-black bg-neutral-100 border-neutral-300' 
                      : 'text-white bg-neutral-900 border-neutral-700' 
                    : ''
                }`}
                title="Notifications Panel"
              >
                <Bell className={`transition-all duration-300 ${isScrolled ? 'w-4.5 h-4.5' : 'w-[22px] h-[22px]'}`} />
                {activeUnreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-white font-extrabold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black border border-white/40 shadow-sm">
                    {activeUnreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notificationsDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-80 border border-solid rounded-2xl shadow-2xl z-50 overflow-hidden text-xs py-1 animate-fade-in divide-y ${
                  isLightMode
                    ? 'bg-white border-neutral-200 divide-neutral-100 shadow-[0_10px_30px_rgba(0,0,0,0.15)] text-neutral-800'
                    : 'bg-neutral-950 border-neutral-800 divide-neutral-900 text-white shadow-2xl'
                }`}>
                  <div className={`px-4 py-2.5 flex justify-between items-center ${isLightMode ? 'bg-neutral-50' : 'bg-neutral-900'}`}>
                    <span className="font-extrabold uppercase text-[10px] tracking-wider text-neutral-400 font-mono">My Notifications</span>
                    <div className="flex items-center gap-2">
                      {headerNotifications.some(n => n.unread) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeaderNotifications(headerNotifications.map(n => ({ ...n, unread: false })));
                            onClearUnreadNotifications?.();
                          }}
                          className="text-[9px] font-bold text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold ${isLightMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        {activeUnreadCount} New
                      </span>
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto divide-y divide-neutral-800/20">
                    {headerNotifications.map((notif, idx) => (
                      <div
                        key={`header-notif-${notif.id || 'notif'}-${idx}`}
                        onClick={() => {
                          setHeaderNotifications(headerNotifications.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                          onNavigate(notif.targetView);
                          setNotificationsDropdownOpen(false);
                        }}
                        className={`p-3.5 transition-colors cursor-pointer space-y-1 ${
                          isLightMode
                            ? notif.unread ? 'bg-neutral-100/80 hover:bg-neutral-200/70' : 'hover:bg-neutral-50'
                            : notif.unread ? 'bg-neutral-900 hover:bg-neutral-800' : 'hover:bg-neutral-900/60'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className={`font-bold transition-all ${
                            isLightMode 
                              ? notif.unread ? 'text-black font-extrabold' : 'text-neutral-600'
                              : notif.unread ? 'text-white font-extrabold' : 'text-neutral-400'
                          }`}>
                            {notif.title}
                            {notif.unread && <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-neutral-400"></span>}
                          </p>
                          <span className="text-[8px] text-neutral-400 shrink-0 font-mono mt-0.5">{notif.time}</span>
                        </div>
                        <p className="text-neutral-400 text-[10px] leading-relaxed">{notif.desc}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`p-2.5 text-center ${isLightMode ? 'bg-neutral-50' : 'bg-neutral-900'}`}>
                    <button
                      onClick={() => {
                        onNavigate('notifications');
                        setNotificationsDropdownOpen(false);
                      }}
                      className="w-full py-1 text-xs font-black hover:underline tracking-wide cursor-pointer"
                    >
                      Enter Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              id="nav-cart-btn"
              onClick={() => onNavigate('cart')}
              className={`rounded-full relative border border-solid border-transparent transition-all duration-300 ease-in-out active:scale-95 ${
                isScrolled ? 'p-2' : 'p-2.5'
              } ${
                isLightMode 
                  ? 'text-neutral-700 hover:text-black hover:bg-neutral-100' 
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
              } ${
                currentView === 'cart' ? (isLightMode ? 'text-black bg-neutral-100 border-neutral-300' : 'text-white bg-neutral-900 border-neutral-700') : ''
              }`}
              title="Cart"
            >
              <ShoppingCart className={`transition-all duration-300 ${isScrolled ? 'w-4.5 h-4.5' : 'w-[22px] h-[22px]'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-white font-extrabold text-[9px] w-[18px] h-[18px] rounded-full flex items-center justify-center bg-black border border-white/40 shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile / Picture Account Option */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-menu-dropdown-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-1.5 rounded-full border border-solid transition-all duration-300 ease-in-out font-bold ${
                    isScrolled ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                  } ${
                    isLightMode
                      ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-black shadow-xs'
                      : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                  title="Account Settings"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'Account'}
                      className={`rounded-full object-cover border border-amber-500/40 shrink-0 ${
                        isScrolled ? 'w-4 h-4' : 'w-5 h-5'
                      }`}
                    />
                  ) : (
                    <div className={`rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-black shrink-0 ${
                      isScrolled ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.name || 'Account'}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {/* Dropdown Box for Logged In User */}
                {userDropdownOpen && (
                  <div
                    id="user-menu-dropdown"
                    className={`absolute right-0 mt-2 w-56 border border-solid rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-fade-in ${
                      isLightMode
                        ? 'bg-white border-neutral-200 text-neutral-800 shadow-xl'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-200 shadow-2xl'
                    }`}
                  >
                    <div className={`px-4 py-3 border-b border-solid flex items-center gap-3 ${
                      isLightMode
                        ? 'border-neutral-100 bg-neutral-50'
                        : 'border-neutral-800 bg-neutral-950'
                    }`}>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-amber-500/40 shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 text-black font-extrabold flex items-center justify-center text-sm shrink-0 shadow-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Account</p>
                        <p className={`text-xs font-black truncate ${isLightMode ? 'text-black' : 'text-white'}`}>{user.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      id="menu-btn-profile"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>My Profile</span>
                    </button>

                    <button
                      id="menu-btn-orders"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span>Order History</span>
                    </button>

                    {/* Saved Wishlist Option */}
                    <button
                      id="menu-btn-wishlist"
                      onClick={() => {
                        onNavigate('wishlist');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors font-medium ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 shrink-0" />
                        <span>Saved Wishlist</span>
                      </div>
                      {(wishlistCount !== undefined && wishlistCount > 0) ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white shadow-xs">
                          {wishlistCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">0</span>
                      )}
                    </button>

                    {/* Admin Live Edit Mode (ON / OFF) Button */}
                    <button
                      id="menu-btn-admin-edit-toggle"
                      type="button"
                      onClick={() => {
                        toggleEditMode();
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between font-bold transition-colors ${
                        isEditMode
                          ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                          : isLightMode
                          ? 'text-neutral-700 hover:bg-neutral-50'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Edit3 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Admin Edit Mode</span>
                      </div>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider transition-colors shadow-xs ${
                        isEditMode ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        {isEditMode ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      id="menu-btn-wallet"
                      onClick={() => {
                        onNavigate('profile');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span>Alike Wallet</span>
                    </button>

                    <button
                      id="menu-btn-settings"
                      onClick={() => {
                        onNavigate('profile', 'settings');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5 shrink-0" />
                      <span>Settings</span>
                    </button>

                    <button
                      id="menu-btn-support"
                      onClick={() => {
                        onNavigate('support');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Support</span>
                    </button>

                    {/* Admin Console Shortcut */}
                    <button
                      id="menu-btn-admin-console"
                      onClick={() => {
                        onNavigate('admin');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 font-bold text-amber-500 hover:text-amber-400 transition-colors ${
                        isLightMode ? 'hover:bg-amber-50' : 'hover:bg-neutral-800'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Admin Console</span>
                    </button>

                    {/* Seller Option */}
                    <button
                      id="menu-btn-seller-dash"
                      type="button"
                      onClick={() => {
                        onNavigate('seller_dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors font-medium cursor-pointer ${
                        isLightMode ? 'hover:bg-amber-50 text-amber-950' : 'hover:bg-neutral-800 text-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Seller Panel</span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-500">
                        {isApprovedSeller ? 'Merchant' : 'Portal'}
                      </span>
                    </button>

                    {!isApprovedSeller && (
                      <button
                        id="menu-btn-seller-reg"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setUserDropdownOpen(false);
                          onNavigate('seller_register');
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                          isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Register New Shop</span>
                      </button>
                    )}

                    <div className={`border-t border-solid my-1 ${isLightMode ? 'border-neutral-100' : 'border-neutral-800'}`}></div>
                    <button
                      id="menu-btn-logout"
                      onClick={() => {
                        onLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50/50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-3.5 h-3.5 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center gap-1.5">
                  <button
                    id="user-menu-dropdown-trigger"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 rounded-full border border-solid transition-all duration-300 ease-in-out font-bold ${
                      isScrolled ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                    } ${
                      isLightMode
                        ? 'bg-neutral-100 hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
                    }`}
                    title="Account Options"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  <button
                    id="header-login-btn"
                    type="button"
                    onClick={() => onOpenAuthModal('password')}
                    className={`px-3 py-1.5 uppercase font-extrabold text-[11px] tracking-wider rounded-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                      isLightMode
                        ? 'bg-black text-white hover:bg-neutral-800'
                        : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                {/* Dropdown Box for Guest User */}
                {userDropdownOpen && (
                  <div
                    id="user-guest-menu-dropdown"
                    className={`absolute right-0 mt-2 w-56 border border-solid rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-fade-in ${
                      isLightMode
                        ? 'bg-white border-neutral-200 text-neutral-800 shadow-xl'
                        : 'bg-neutral-900 border-neutral-700 text-neutral-200 shadow-2xl'
                    }`}
                  >
                    <div className={`px-4 py-3 border-b border-solid flex items-center gap-2.5 ${
                      isLightMode ? 'border-neutral-100 bg-neutral-50' : 'border-neutral-800 bg-neutral-950'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 font-bold text-xs">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Account</p>
                        <p className={`text-xs font-bold ${isLightMode ? 'text-black' : 'text-white'}`}>Guest Options</p>
                      </div>
                    </div>

                    <div className="p-2 border-b border-solid border-neutral-100 dark:border-neutral-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAuthModal('password');
                        }}
                        className="w-full py-2 px-3 text-xs font-extrabold rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors text-center"
                      >
                        Sign In / Register
                      </button>
                    </div>

                    {/* Saved Wishlist */}
                    <button
                      id="guest-menu-btn-wishlist"
                      onClick={() => {
                        onNavigate('wishlist');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors font-medium ${
                        isLightMode ? 'hover:bg-neutral-100 text-neutral-800' : 'hover:bg-neutral-800 hover:text-white text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />
                        <span>Saved Wishlist</span>
                      </div>
                      {(wishlistCount !== undefined && wishlistCount > 0) ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white">
                          {wishlistCount}
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">0</span>
                      )}
                    </button>

                    {/* Admin Live Edit Mode (ON / OFF) Switch */}
                    <button
                      id="guest-menu-btn-admin-edit-toggle"
                      type="button"
                      onClick={() => {
                        toggleEditMode();
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between font-bold transition-colors ${
                        isEditMode
                          ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                          : isLightMode
                          ? 'text-neutral-700 hover:bg-neutral-100'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Edit3 className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Admin Edit Mode</span>
                      </div>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-black tracking-wider transition-colors ${
                        isEditMode ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-neutral-300'
                      }`}>
                        {isEditMode ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    {/* Admin Console Shortcut */}
                    <button
                      id="guest-menu-btn-admin-console"
                      onClick={() => {
                        onNavigate('admin');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 font-bold text-amber-500 hover:text-amber-400 transition-colors ${
                        isLightMode ? 'hover:bg-amber-50' : 'hover:bg-neutral-800'
                      }`}
                    >
                      <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Admin Console</span>
                    </button>

                    {/* Seller Panel Option for Guests */}
                    <button
                      id="guest-menu-btn-seller-dash"
                      type="button"
                      onClick={() => {
                        onNavigate('seller_dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors font-medium cursor-pointer ${
                        isLightMode ? 'hover:bg-amber-50 text-amber-950' : 'hover:bg-neutral-800 text-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Store className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Seller Panel</span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-black bg-amber-500/20 text-amber-500">
                        Merchant
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('support');
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 transition-colors ${
                        isLightMode ? 'hover:bg-neutral-50 text-neutral-700' : 'hover:bg-neutral-800 hover:text-white text-neutral-300'
                      }`}
                    >
                      <Headphones className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Support Center</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Only Header Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick Seller Panel Pill on Mobile */}
            <button
              id="mobile-header-seller-btn"
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('seller_dashboard');
              }}
              className={`h-9 px-2.5 rounded-full flex items-center gap-1 text-[11px] font-extrabold border transition-all active:scale-95 cursor-pointer ${
                isLightMode
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
              }`}
              title="Seller Panel"
            >
              <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Seller</span>
            </button>

            {/* Cart (Mobile - 40px touch hitbox) */}
            <button
              id="mobile-nav-cart-btn"
              onClick={() => {
                onNavigate('cart');
                setMobileMenuOpen(false);
              }}
              className={`w-10 h-10 rounded-full relative transition-all duration-200 border border-solid active:scale-90 flex items-center justify-center cursor-pointer shadow-xs ${
                isLightMode 
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
              } ${
                currentView === 'cart' 
                  ? isLightMode 
                    ? 'ring-2 ring-black font-bold'
                    : 'ring-2 ring-white font-bold' 
                  : ''
              }`}
              title="Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 text-white dark:text-black font-mono font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center bg-black dark:bg-white border border-white/60 dark:border-black/60 shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Toggle (40px touch hitbox) */}
            <button
              id="mobile-nav-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`w-10 h-10 rounded-full transition-all duration-200 border border-solid active:scale-90 flex items-center justify-center cursor-pointer shadow-xs ${
                isLightMode 
                  ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-neutral-300' 
                  : 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-700'
              }`}
              title={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Search Bar (Always visible on mobile below top header bar) */}
      <div className={`md:hidden px-3 transition-all duration-200 ease-in-out ${
        isScrolled ? 'pb-1.5 pt-0' : 'pb-2 pt-0.5'
      }`}>
        <form
          onSubmit={(e) => {
            handleSearchSubmit(e);
          }}
          className="relative w-full group"
          id="mobile-header-search-form"
        >
          {/* Left Search Icon */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
            <Search className="w-4 h-4 text-neutral-400 group-hover:text-[#FF007F] transition-colors" />
          </div>

          <input
            id="mobile-header-search-input"
            type="text"
            placeholder="Search products, brands, deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full font-sans transition-all duration-200 ease-in-out border border-solid outline-none ${
              isScrolled
                ? 'py-1.5 pl-9 pr-20 rounded-full text-xs'
                : 'py-2 pl-9 pr-20 rounded-full text-xs'
            } ${
              isLightMode
                ? 'bg-neutral-100/95 text-black border-neutral-300 focus:border-[#FF007F] focus:bg-white placeholder-neutral-500 shadow-xs'
                : 'bg-neutral-900/95 text-white border-neutral-750 focus:border-[#FF007F] placeholder-neutral-400 shadow-inner'
            }`}
          />
          <button
            id="mobile-header-search-submit"
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center px-3 h-7 bg-[#0d0d0d] hover:bg-black text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer shadow-xs active:scale-95 border border-[#0d0d0d]"
            title="Search"
          >
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Mobile Drawer Slide-out/Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t border-solid py-4 px-4 animate-slide-down shadow-2xl relative z-55 max-h-[80vh] overflow-y-auto space-y-5 ${
          isLightMode
            ? 'bg-white border-neutral-200 text-neutral-900 shadow-2xl'
            : 'bg-black border-neutral-800 text-white shadow-2xl'
        }`}>

          {/* Direct Store Modes */}
          <div className="flex flex-col gap-2">
            <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold border-b pb-1.5 ${isLightMode ? 'text-neutral-500 border-neutral-200' : 'text-neutral-400 border-neutral-800'}`}>Store Modes</h4>
            
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('home'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                currentView === 'home' && (!selectedCategory || selectedCategory === 'all')
                  ? isLightMode ? 'bg-black text-white font-extrabold' : 'bg-white text-black font-extrabold' 
                  : isLightMode 
                    ? 'hover:bg-neutral-100 text-neutral-800' 
                    : 'hover:bg-neutral-900 text-neutral-300'
              }`}
            >
              <span>🛍️ Simple Store</span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase">Regular</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('category_search', 'vip'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-between border border-solid transition-all ${
                currentView === 'category_search' && (selectedCategory === 'vip' || selectedCategory === 'premium')
                  ? 'bg-violet-600 text-white border-violet-500 shadow-sm' 
                  : isLightMode
                    ? 'text-neutral-900 hover:bg-neutral-100 border-neutral-200'
                    : 'text-white hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <span>✨ Premium VIP</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Curated</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onNavigate('category_search', 'luxury'); }}
              className={`w-full text-left py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-between border border-solid transition-all ${
                currentView === 'category_search' && selectedCategory === 'luxury' 
                  ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black border-amber-400 shadow-sm' 
                  : isLightMode
                    ? 'text-neutral-900 hover:bg-neutral-100 border-neutral-200'
                    : 'text-white hover:bg-neutral-900 border-neutral-800'
              }`}
            >
              <span>👑 Luxury Edition</span>
              <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">Elite</span>
            </button>
          </div>

          {/* Account and Dashboard Links */}
          <div className="flex flex-col gap-2 pt-2">
            <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold border-b pb-1.5 ${isLightMode ? 'text-neutral-500 border-neutral-200' : 'text-neutral-400 border-neutral-800'}`}>Account & Controls</h4>
            {user ? (
              <div className="space-y-1">
                <div className={`px-3 py-2 rounded-xl mb-2 ${isLightMode ? 'bg-neutral-100' : 'bg-neutral-900'}`}>
                  <p className="text-[10px] font-medium text-neutral-500">Logged in client</p>
                  <p className={`text-xs font-black truncate ${isLightMode ? 'text-black' : 'text-white'}`}>{user.name}</p>
                </div>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Order History</span>
                </button>

                <button
                  id="mobile-menu-btn-wishlist"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <span>Saved Wishlist</span>
                  </div>
                  {(wishlistCount !== undefined && wishlistCount > 0) && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Alike Wallet</span>
                </button>

                <button
                  id="mobile-menu-btn-settings"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('profile', 'settings'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>

                <button
                  id="mobile-menu-btn-support"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('support'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-amber-500" />
                  <span>Support Center</span>
                </button>

                {/* Mobile Admin Controls & Live Edit Mode */}
                <button
                  id="mobile-menu-btn-admin-edit-toggle"
                  type="button"
                  onClick={() => {
                    toggleEditMode();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                    isEditMode ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    <span>Admin Edit Mode</span>
                  </div>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${
                    isEditMode ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-neutral-300'
                  }`}>
                    {isEditMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  id="mobile-menu-btn-admin-console"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('admin'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 text-amber-500 transition-colors ${
                    isLightMode ? 'hover:bg-amber-50' : 'hover:bg-neutral-800'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span>Admin Console</span>
                </button>

                {/* Mobile Seller Option - CONDITIONAL */}
                {isApprovedSeller ? (
                  <button
                    id="mobile-menu-seller-dash"
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('seller_dashboard'); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Seller Dashboard</span>
                  </button>
                ) : (
                  <button
                    id="mobile-menu-seller-reg"
                    type="button"
                    onClick={() => { setMobileMenuOpen(false); onNavigate('seller_register'); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2.5 transition-colors ${
                      isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                    }`}
                  >
                    <Store className="w-4 h-4 text-amber-500" />
                    <span>Become a Seller</span>
                  </button>
                )}

                <div className={`border-t border-solid my-2 pt-2 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}></div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center gap-2.5 text-red-500 hover:bg-red-50/50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Mobile Guest Wishlist */}
                <button
                  id="mobile-guest-wishlist-btn"
                  onClick={() => { setMobileMenuOpen(false); onNavigate('wishlist'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center justify-between transition-colors ${
                    isLightMode ? 'text-neutral-800 hover:bg-neutral-100' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    <span>Saved Wishlist</span>
                  </div>
                  {(wishlistCount !== undefined && wishlistCount > 0) && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>

                {/* Mobile Guest Admin Edit Mode */}
                <button
                  id="mobile-guest-admin-edit-toggle"
                  type="button"
                  onClick={() => {
                    toggleEditMode();
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${
                    isEditMode ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-300 hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    <span>Admin Edit Mode</span>
                  </div>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-black ${
                    isEditMode ? 'bg-amber-500 text-black' : 'bg-neutral-700 text-neutral-300'
                  }`}>
                    {isEditMode ? 'ON' : 'OFF'}
                  </span>
                </button>

                <button
                  id="mobile-seller-panel-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('seller_dashboard');
                  }}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    isLightMode
                      ? 'border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100'
                      : 'border-amber-500/30 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>Seller Panel (মার্চেন্ট প্যানেল)</span>
                </button>

                <button
                  id="mobile-become-seller-btn"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMobileMenuOpen(false);
                    onNavigate('seller_register');
                  }}
                  className={`w-full py-2 text-xs font-medium rounded-xl text-center flex items-center justify-center gap-2 border cursor-pointer ${
                    isLightMode
                      ? 'border-neutral-200 bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-amber-500" />
                  <span>Become a Seller</span>
                </button>
                <button
                  id="mobile-login-btn"
                  type="button"
                  onClick={() => { setMobileMenuOpen(false); onOpenAuthModal('password'); }}
                  className={`w-full py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-xl text-center shadow-md cursor-pointer ${
                    isLightMode
                      ? 'bg-black text-white hover:bg-neutral-800'
                      : 'bg-white text-black hover:bg-neutral-200'
                  }`}
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
