import { useState, useEffect, FormEvent } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  ChevronRight,
  Settings,
  CreditCard,
  MapPin,
  Plus,
  Trash2,
  Lock,
  Gift,
  Calendar,
  Phone,
  Mail,
  Truck,
  Sparkles,
  Award,
  FileText,
  Check,
  ArrowLeft,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  Radio,
  Navigation,
} from 'lucide-react';
import { Address, Order, Product, WalletTransaction } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import OrderLiveTrackingModal from '../components/orders/OrderLiveTrackingModal';
import PhoneInput from '../components/PhoneInput';
import { useLocation } from '../context/LocationContext';
<<<<<<< HEAD
=======
=======
} from 'lucide-react';
import { Address, Order, Product, WalletTransaction } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import PhoneInput from '../components/PhoneInput';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

interface ProfileProps {
  user: { _id?: string; name: string; email: string; phone: string; avatar?: string; tier?: string; dob?: string } | null;
  onUpdateUser: (userData: { name: string; email: string; phone: string; avatar?: string; tier?: string; dob?: string }) => void;
  orders: Order[];
  wishlist: Product[];
  onRemoveWishlistItem: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onNavigate: (view: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  initialTab?: 'orders' | 'addresses' | 'settings' | 'wishlist';
  walletBalance: number;
  transactions: WalletTransaction[];
  onAddWalletBalance: (amt: number) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
  onOpenLogin?: () => void;
}

export default function Profile({
  user,
  onUpdateUser,
  orders,
  wishlist,
  onRemoveWishlistItem,
  onAddToCart,
  onNavigate,
  onBack,
  showBackButton = true,
  initialTab = 'orders',
  walletBalance,
  transactions,
  onAddWalletBalance,
  showToast,
  isLightMode = false,
  onOpenLogin,
}: ProfileProps) {
<<<<<<< HEAD
  const { location, clearLocation, promptLocationCapture } = useLocation();
=======
<<<<<<< HEAD
  const { location, clearLocation, promptLocationCapture } = useLocation();
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'settings' | 'wishlist'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
<<<<<<< HEAD
  const [liveTrackingOrder, setLiveTrackingOrder] = useState<Order | null>(null);
=======
<<<<<<< HEAD
  const [liveTrackingOrder, setLiveTrackingOrder] = useState<Order | null>(null);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Account Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  // Clean DOB state: starts empty unless user explicitly has saved a real date of birth
  const [dob, setDob] = useState<string>(() => {
    if (user && (user as any).dob) return (user as any).dob;
    if (user && user.email) {
      try {
        const saved = localStorage.getItem(`alike_user_dob_${user.email.toLowerCase()}`);
        if (saved && saved !== '1990-11-20' && saved.trim() !== '') return saved;
      } catch {}
    }
    return '';
  });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // Password change states
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  const handleUpdatePassword = async () => {
    if (!curPass || !newPass) {
      showToast('Please insert current and new password.', 'warning');
      return;
    }
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    setIsUpdatingPass(true);
    try {
      const token = localStorage.getItem('alikend_user_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: curPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }
      showToast(data.message || 'Your security credentials have reset successfully.', 'success');
      setCurPass('');
      setNewPass('');
    } catch (err: any) {
      showToast(err.message || 'Failed to update security password.', 'error');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  // Address catalog states (scoped per user, starts completely empty for new accounts)
  const [addrs, setAddrs] = useState<Address[]>(() => {
    if (user && user.email) {
      try {
        const saved = localStorage.getItem(`alike_addresses_${user.email.toLowerCase()}`);
        if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // Persist user-specific addresses
  useEffect(() => {
    if (user && user.email) {
      try {
        localStorage.setItem(`alike_addresses_${user.email.toLowerCase()}`, JSON.stringify(addrs));
      } catch {}
    }
  }, [addrs, user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-6">
        <div className={`p-8 border border-solid rounded-3xl text-center space-y-4 shadow-xl ${
          isLightMode
            ? 'bg-white border-[#E2D8C7] text-neutral-800'
            : 'bg-neutral-900/90 border-[#D1D1D1]/20 text-white'
        }`}>
          <div className="w-16 h-16 rounded-full bg-[#D1D1D1]/10 border border-[#D1D1D1]/30 flex items-center justify-center mx-auto text-[#D1D1D1]">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold">Client Account Required</h3>
            <p className="text-xs text-neutral-400">
              Sign in or register your account to view your orders, addresses, payment cards, and luxury wallet.
            </p>
          </div>
          <button
            id="profile-authenticate-btn"
            type="button"
            onClick={() => {
              if (onOpenLogin) onOpenLogin();
              else onNavigate('home');
            }}
            className="w-full py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#D1D1D1] to-[#E5E5E5] text-black hover:opacity-90 transition-all shadow-md cursor-pointer"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateAccount = (e: FormEvent) => {
    e.preventDefault();
    if (user && user.email) {
      try {
        if (dob && dob.trim() !== '') {
          localStorage.setItem(`alike_user_dob_${user.email.toLowerCase()}`, dob.trim());
        } else {
          localStorage.removeItem(`alike_user_dob_${user.email.toLowerCase()}`);
        }
      } catch {}
    }
    onUpdateUser({ name, email, phone, avatar, dob: dob.trim() });
    showToast('Your Luxury Client account settings has updated!', 'success');
  };

  const handleRemoveAddress = (id: string) => {
    setAddrs(addrs.filter(a => a.id !== id));
    showToast('Delivery destination address deleted.', 'info');
  };

  const handleAddAddress = () => {
    const fresh: Address = {
      id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: user?.name || 'My Delivery Address',
      phone: user?.phone || '',
      street: '',
      city: '',
      state: '',
      zip: ''
    };
    setAddrs([...addrs, fresh]);
    showToast('New delivery address slot created.', 'info');
  };

  return (
    <div id="profile-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* 0. Top Bar with Conditional Back Button */}
      {showBackButton && (
        <div className="flex items-center gap-3">
          <button
            id="profile-back-btn"
            type="button"
            onClick={onBack ? onBack : () => onNavigate('home')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-xs active:scale-95 ${
              isLightMode
                ? 'bg-white hover:bg-neutral-50 text-neutral-800 border-[#EADFC9] hover:border-[#F5A623] hover:text-[#0F1A3C]'
                : 'bg-[#0B1B32] hover:bg-[#122644] text-neutral-200 border-[#162744] hover:border-[#F5A623] hover:text-[#F5A623]'
            }`}
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#F5A623]" />
            <span>← Back</span>
          </button>
        </div>
      )}

      {/* 1. Profile Elegant Header Card */}
      <div 
        className={`p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border transition-colors relative overflow-hidden ${
          isLightMode 
            ? 'bg-white border-neutral-200 text-neutral-900' 
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`} 
        id="profile-header-card"
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
          {/* Avatar Container */}
          <div className="relative w-20 h-20 shrink-0 select-none">
            <div className={`w-full h-full rounded-full flex items-center justify-center border-2 shadow-sm font-black text-2xl overflow-hidden ${
              isLightMode ? 'bg-neutral-100 border-neutral-200 text-neutral-800' : 'bg-neutral-950 border-neutral-800 text-white'
            }`}>
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <div className="w-full h-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
            {/* Settings cog */}
            <span 
              onClick={() => {
                setActiveTab('settings');
                setTimeout(() => {
                  document.getElementById('profile-panel-settings')?.scrollIntoView({ behavior: 'smooth' });
                }, 150);
              }}
              className={`absolute -bottom-1 -right-1 p-2 rounded-full cursor-pointer z-20 shadow-md transform hover:scale-110 active:scale-95 transition-all flex items-center justify-center border ${
                isLightMode 
                  ? 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800' 
                  : 'bg-white border-white text-neutral-900 hover:bg-neutral-100'
              }`} 
              title="Edit avatar and Account Credentials"
            >
              <Settings className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className={`text-xl sm:text-2xl font-black flex items-center gap-1.5 justify-center sm:justify-start ${
              isLightMode ? 'text-neutral-900' : 'text-white'
            }`}>
              {user.name} <Award className="w-4.5 h-4.5 text-sky-500 hover:scale-110 transition-transform cursor-pointer" />
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">{user.email} · {user.phone}</p>
            <div className="flex gap-2 justify-center sm:justify-start">
              <span className={`px-2.5 py-0.5 border rounded-full text-[9px] uppercase font-mono font-bold ${
                user.tier === 'Platinum'
                  ? 'bg-purple-900/30 border-purple-500/40 text-purple-300'
                  : user.tier === 'Gold'
                  ? 'bg-amber-900/30 border-amber-500/40 text-amber-300'
                  : isLightMode 
                  ? 'bg-neutral-100 border-neutral-200 text-neutral-600' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300'
              }`}>
                {user.tier ? `${user.tier} Tier Member` : 'Silver Tier Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats bar inside Header */}
        <div className="grid grid-cols-3 gap-3 text-center z-10 shrink-0 self-stretch sm:self-auto" id="profile-stats-grid">
          <div className={`p-3 sm:px-4 rounded-xl border transition-colors ${
            isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/70 border-neutral-800'
          }`}>
            <span className={`font-extrabold text-lg block ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{orders.length}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Orders</span>
          </div>
          <div className={`p-3 sm:px-4 rounded-xl border transition-colors ${
            isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/70 border-neutral-800'
          }`}>
            <span className={`font-extrabold text-lg block ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{wishlist.length}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Wishlist</span>
          </div>
          <div className={`p-3 sm:px-4 rounded-xl border transition-colors ${
            isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950/70 border-neutral-800'
          }`}>
            <span className={`font-extrabold text-lg block ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>₹{walletBalance.toLocaleString('en-IN')}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider">Wallet</span>
          </div>
        </div>
      </div>

      {/* 2. Grid for Tabs Navigation and Panel Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side Tab pills */}
        <nav className={`col-span-1 lg:col-span-3 space-y-2 p-3 rounded-2xl border transition-colors ${
          isLightMode ? 'bg-white border-neutral-200/90 shadow-sm' : 'bg-neutral-900 border-neutral-800 shadow-md'
        }`}>
          {[
            { id: 'orders' as const, label: 'My Orders Tracker', icon: ShoppingBag },
            { id: 'addresses' as const, label: 'Saved Destinations', icon: MapPin },
            { id: 'settings' as const, label: 'Account Credentials', icon: Settings },
            { id: 'wishlist' as const, label: `Saved Wishlist (${wishlist.length})`, icon: Heart },
          ].map((tabItem) => {
            const IconComp = tabItem.icon;
            const isTabActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                id={`prof-tab-btn-${tabItem.id}`}
                onClick={() => setActiveTab(tabItem.id)}
                className={`w-full text-left px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer active:scale-98 border ${
                  isTabActive
                    ? isLightMode
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md shadow-neutral-900/15'
                      : 'bg-white text-neutral-950 border-white shadow-md shadow-white/10'
                    : isLightMode
                    ? 'bg-neutral-50/90 hover:bg-neutral-100 text-neutral-700 hover:text-neutral-950 border-neutral-200/80 hover:border-neutral-300'
                    : 'bg-neutral-950/60 hover:bg-neutral-800/80 text-neutral-300 hover:text-white border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComp className={`w-4 h-4 shrink-0 ${
                    isTabActive 
                      ? isLightMode ? 'text-white' : 'text-neutral-950' 
                      : isLightMode ? 'text-neutral-500' : 'text-neutral-400'
                  }`} />
                  <span className="truncate">{tabItem.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isTabActive 
                    ? isLightMode ? 'text-white translate-x-0.5' : 'text-neutral-950 translate-x-0.5' 
                    : 'text-neutral-400 opacity-40'
                }`} />
              </button>
            );
          })}
        </nav>

        {/* Right Side Panel Body context */}
        <section className={`col-span-1 lg:col-span-9 border p-6 rounded-2xl min-h-[350px] transition-colors ${
          isLightMode ? 'bg-white border-neutral-200 shadow-2xs text-neutral-900' : 'bg-neutral-900 border-neutral-800 shadow-md text-white'
        }`}>
          
          {/* TAB 1: MY ORDERS TRACKER */}
          {activeTab === 'orders' && (
            <div className="space-y-6" id="profile-panel-orders">
              <h3 className={`text-sm font-extrabold uppercase tracking-widest border-b pb-3 ${
                isLightMode ? 'text-neutral-900 border-neutral-200' : 'text-white border-neutral-800'
              }`}>
                My Luxury Order History
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  <ShoppingBag className="w-8 h-8 mx-auto text-neutral-400 dark:text-neutral-600 mb-2.5" />
                  No orders processed yet. Explore our luxury collection or electronic catalogs to begin.
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((o, oIdx) => (
                    <div 
                      key={`profile-order-${o.id}-${oIdx}`} 
                      className={`p-5 border rounded-xl space-y-4 animate-fade-in relative transition-colors ${
                        isLightMode ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                      }`}
                    >
                      <div className={`flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-3 text-xs ${
                        isLightMode ? 'border-neutral-200' : 'border-neutral-800'
                      }`}>
                        <div className="space-y-0.5">
                          <span className="text-neutral-500 uppercase tracking-widest text-[9px] font-extrabold">Invoice Ref</span>
                          <h4 className={`font-extrabold tracking-wider ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{o.id}</h4>
                        </div>
                        <div className="flex gap-6">
                          <div className="text-right">
                            <span className="text-neutral-500 block text-[9px] uppercase font-bold">Placed Date</span>
                            <span className={`font-bold ${isLightMode ? 'text-neutral-800' : 'text-neutral-200'}`}>{o.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-neutral-500 block text-[9px] uppercase font-bold">Total Bill</span>
                            <span className={`font-extrabold ${isLightMode ? 'text-neutral-950' : 'text-white'}`}>₹{o.total.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items row */}
                      <div className="space-y-3">
                        {o.items.map((i, iIdx) => (
                          <div key={`order-item-${i.product.id}-${iIdx}`} className="flex gap-3 justify-between items-center text-xs">
                            <div className="flex gap-3 min-w-0 items-center">
                              <img src={i.product.image} alt={i.product.name} className="w-10 h-10 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800" referrerPolicy="no-referrer" />
                              <div className="truncate">
                                <h5 className={`font-bold truncate text-[11px] select-none ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{i.product.name}</h5>
                                <span className="text-neutral-500 text-[10px] block">Qty: {i.quantity} | {o.paymentMethod} Payment</span>
                              </div>
                            </div>
                            <span className={`font-bold ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>₹{(i.product.price * i.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      {/* ORDER SHIPPED MILESTONES REAL TRACKING TIMELINE */}
                      <div className={`pt-4 border-t space-y-3 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase text-neutral-500 font-extrabold tracking-widest block">Real-time Sector Tracker</span>
                          <button
                            onClick={() => setSelectedInvoiceOrder(o)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 ${
                              isLightMode 
                                ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900' 
                                : 'bg-white hover:bg-neutral-100 text-neutral-950 border-white'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download Invoice (PDF)</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-2 relative border-b border-neutral-200 dark:border-neutral-800 pb-2" id={`tracker-steps-${o.id}`}>
                          {[
                            { num: 1, label: 'Placed' },
                            { num: 2, label: 'Packing' },
                            { num: 3, label: 'In Transit' },
                            { num: 4, label: 'Delivered' }
                          ].map((stepMap) => {
                            const active = o.trackingStep >= stepMap.num;
                            return (
                              <div key={stepMap.num} className="text-center relative">
                                <div className={`mx-auto w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] mb-1.5 transition-all ${
                                  active 
                                    ? isLightMode 
                                      ? 'bg-neutral-900 text-white shadow-xs' 
                                      : 'bg-white text-neutral-950 shadow-xs'
                                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                                }`}>
                                  {active ? '✓' : stepMap.num}
                                </div>
                                <span className={`text-[9px] uppercase font-bold tracking-wider ${
                                  active 
                                    ? isLightMode ? 'text-neutral-900' : 'text-white' 
                                    : 'text-neutral-400 dark:text-neutral-600'
                                }`}>
                                  {stepMap.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

                        {/* PHASE 2: LIVE MAP TRACKER TRIGGER */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                            <Navigation className="w-3.5 h-3.5 text-[#FF007F]" />
                            <span>Live Location & Seller Coordinates</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLiveTrackingOrder(o)}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-[#FF007F] to-rose-600 hover:opacity-95 shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                          >
                            <Radio className="w-3 h-3 animate-pulse" />
                            <span>Open Live Map Tracker</span>
                          </button>
                        </div>
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SAVED DESTINATIONS */}
          {activeTab === 'addresses' && (
            <div className="space-y-6" id="profile-panel-addresses">
              <div className={`flex justify-between items-center border-b pb-3 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-widest ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>Saved Delivery Destinations</h3>
                <button
                  id="add-addr-profile-btn"
                  onClick={handleAddAddress}
                  className={`px-3 py-1.5 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 border active:scale-95 ${
                    isLightMode 
                      ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800' 
                      : 'bg-white text-neutral-950 border-white hover:bg-neutral-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Quick Add
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addrs.length === 0 ? (
                  <div className="col-span-1 sm:col-span-2 text-center py-12 text-xs text-neutral-500">
                    <MapPin className="w-8 h-8 mx-auto text-neutral-400 dark:text-neutral-600 mb-2.5" />
                    No delivery destinations saved yet. Use Quick Add or save during checkout.
                  </div>
                ) : (
                  addrs.map((a, aIdx) => (
                  <div key={`profile-addr-${a.id}-${aIdx}`} className={`p-4 rounded-xl border flex justify-between items-start gap-3 transition-colors ${
                    isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                  }`}>
                    <div className="text-xs space-y-1.5">
                      <div className="flex gap-2.5 items-center">
                        <h4 className={`font-bold uppercase text-[10px] tracking-wide ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{a.name}</h4>
                        {a.isDefault && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-[8px] font-black uppercase">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className={`mt-1.5 font-medium ${isLightMode ? 'text-neutral-700' : 'text-neutral-300'}`}>{a.street}</p>
                      <p className="text-neutral-500">{a.city}, {a.state} - {a.zip}</p>
                      <p className="text-neutral-500">📞 {a.phone}</p>
                    </div>
                    <button
                      id={`del-addr-btn-${a.id}`}
                      onClick={() => handleRemoveAddress(a.id)}
                      className="p-1.5 hover:bg-rose-500/10 rounded border border-transparent hover:border-rose-500/20 text-neutral-400 hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                      title="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )))}
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT CREDENTIALS */}
          {activeTab === 'settings' && (
            <div className="space-y-6" id="profile-panel-settings">
              <h3 className={`text-sm font-extrabold uppercase tracking-widest border-b pb-3 ${isLightMode ? 'border-neutral-200 text-neutral-900' : 'border-neutral-800 text-white'}`}>
                Client Credentials Settings
              </h3>
              
              {/* Premium Avatar Manager */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLightMode ? 'bg-neutral-50/80 border-neutral-200' : 'bg-neutral-900/50 border-neutral-800'
              }`}>
                <span className={`text-[10px] uppercase font-black tracking-widest block ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                  Client Profile Picture
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Preview */}
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden shrink-0 shadow-sm ${
                    isLightMode ? 'bg-neutral-200 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                  }`}>
                    {avatar ? (
                      <img src={avatar} className="w-full h-full object-cover" alt="Avatar preview" />
                    ) : (
                      <div className="text-xl font-bold text-neutral-500 uppercase">{name.charAt(0)}</div>
                    )}
                  </div>
                  
                  {/* Select options */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Select a curated avatar or upload an authorized profile picture.</p>
                    
                    {/* Curation Row */}
                    <div className="flex flex-wrap gap-2.5 items-center justify-center sm:justify-start">
                      {[
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatar(preset);
                            showToast('Selected matching luxury avatar!', 'info');
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all active:scale-90 cursor-pointer ${
                            avatar === preset 
                              ? isLightMode ? 'border-neutral-900 scale-105 shadow-sm' : 'border-white scale-105 shadow-sm' 
                              : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-500'
                          }`}
                        >
                          <img src={preset} className="w-full h-full object-cover" alt="preset" referrerPolicy="no-referrer" />
                        </button>
                      ))}

                      {/* Custom upload button */}
                      <label 
                        id="prof-upload-custom-file-btn"
                        className={`cursor-pointer px-3.5 py-2 border rounded-xl text-[10px] font-bold uppercase transition-all tracking-wider inline-flex items-center gap-1.5 active:scale-95 shadow-2xs ${
                          isLightMode 
                            ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-900 shadow-xs' 
                            : 'bg-neutral-950 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Upload Custom File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result && typeof event.target.result === 'string') {
                                  setAvatar(event.target.result);
                                  showToast('Custom profile picture uploaded!', 'success');
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {/* Reset option */}
                      {avatar && (
                        <button
                          type="button"
                          id="prof-clear-avatar-btn"
                          onClick={() => {
                            setAvatar('');
                            showToast('Reset avatar to default initials.', 'info');
                          }}
                          className="px-2.5 py-1.5 text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleUpdateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-bold">Client Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="prof-edit-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl font-medium focus:outline-none transition-colors ${
                        isLightMode 
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs' 
                          : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-bold">VIP Mail Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="prof-edit-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl font-medium focus:outline-none transition-colors ${
                        isLightMode 
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs' 
                          : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-bold">Mobile Device Identification</label>
                  <PhoneInput
                    id="prof-edit-phone"
                    value={phone}
                    onChange={(full) => setPhone(full)}
                    required
                    isLightMode={isLightMode}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-bold">Date of Birth</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      id="prof-edit-dob"
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="YYYY-MM-DD"
                      className={`w-full pl-10 pr-3.5 py-2.5 border rounded-xl font-medium focus:outline-none tracking-widest cursor-pointer transition-colors ${
                        isLightMode 
                          ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-2xs' 
                          : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-3 flex justify-end">
                  <button
                    id="prof-save-account-btn"
                    type="submit"
                    className={`px-7 py-3 text-xs font-extrabold uppercase tracking-wider rounded-xl text-center active:scale-95 transition-all shadow-sm cursor-pointer border flex items-center gap-2 ${
                      isLightMode 
                        ? 'bg-neutral-900 hover:bg-neutral-800 text-white border-neutral-900 shadow-neutral-900/15' 
                        : 'bg-white hover:bg-neutral-100 text-neutral-950 border-white shadow-white/10'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>SAVE ACCOUNT CHANGES</span>
                  </button>
                </div>
              </form>

              {/* Password update segment */}
              <div className={`pt-6 border-t space-y-4 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <span className="text-[10px] uppercase font-black text-rose-500 tracking-widest block">Password Key Reset</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <input
                    id="prof-cur-pass"
                    type="password"
                    placeholder="Current Password Key"
                    value={curPass}
                    onChange={(e) => setCurPass(e.target.value)}
                    className={`p-3 border rounded-xl focus:outline-none transition-colors ${
                      isLightMode 
                        ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900' 
                        : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-400'
                    }`}
                  />
                  <input
                    id="prof-new-pass"
                    type="password"
                    placeholder="New Secure Password Key"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className={`p-3 border rounded-xl focus:outline-none transition-colors ${
                      isLightMode 
                        ? 'bg-white border-neutral-300 text-neutral-900 focus:border-neutral-900' 
                        : 'bg-neutral-950 border-neutral-800 text-white focus:border-neutral-400'
                    }`}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    id="prof-reset-pass-btn"
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPass}
                    className={`px-5 py-2.5 border rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                      isLightMode 
                        ? 'bg-white hover:bg-neutral-100 border-neutral-300 text-neutral-800 shadow-2xs' 
                        : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-white'
                    }`}
                  >
                    <span>{isUpdatingPass ? 'Updating Password...' : 'Update Security Password'}</span>
                  </button>
                </div>
              </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

              {/* Saved Location & Privacy segment */}
              <div className={`pt-6 border-t space-y-3 ${isLightMode ? 'border-neutral-200' : 'border-neutral-800'}`}>
                <span className="text-[10px] uppercase font-black text-amber-500 tracking-widest block">
                  Saved Delivery Location & Privacy
                </span>
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-950 border-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className={`font-bold ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>
                        {location ? location.label : 'No delivery location saved'}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {location
                          ? 'Used to find nearby sellers and calculate 10-20 min quick delivery ETAs.'
                          : 'Set your location to unlock nearby sellers and 10-20 min quick delivery.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => promptLocationCapture()}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-colors cursor-pointer"
                    >
                      {location ? 'Change location' : 'Set location'}
                    </button>
                    {location && (
                      <button
                        type="button"
                        onClick={async () => {
                          await clearLocation();
                          showToast('Saved location cleared from your device and profile.', 'info');
                        }}
                        className="px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Clear saved location
                      </button>
                    )}
                  </div>
                </div>
              </div>
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            </div>
          )}

          {/* TAB 4: SAVED WISHLIST ITEMS */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6" id="profile-panel-wishlist">
              <h3 className={`text-sm font-extrabold uppercase tracking-widest border-b pb-3 ${
                isLightMode ? 'border-neutral-200 text-neutral-900' : 'border-neutral-800 text-white'
              }`}>
                My Saved Product Wishlist
              </h3>
              {wishlist.length === 0 ? (
                <div className="text-center py-12 text-xs text-neutral-500">
                  <Heart className="w-8 h-8 mx-auto text-neutral-400 dark:text-neutral-600 mb-2.5" />
                  Your wishlist is empty. Tap the Heart icon on products to save them here.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" id="wishlist-profile-grid">
                  {wishlist.map((p) => {
                    return (
                      <div 
                        key={p.id} 
                        className={`group rounded-xl p-3 border relative transition-all ${
                          isLightMode ? 'bg-neutral-50 border-neutral-200 hover:border-neutral-400' : 'bg-neutral-950 border-neutral-800 hover:border-neutral-600'
                        }`}
                      >
                        <button
                          id={`wish-del-btn-${p.id}`}
                          onClick={() => onRemoveWishlistItem(p)}
                          className="absolute top-2.5 right-2.5 p-1 bg-black/75 hover:bg-black text-white rounded-full text-neutral-400 hover:text-rose-400 z-10 cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="aspect-square bg-neutral-200 dark:bg-neutral-900 rounded-lg overflow-hidden cursor-pointer" onClick={() => onNavigate('product_' + p.id)}>
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <h4 className={`text-[11px] font-bold truncate mt-2 leading-tight ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>{p.name}</h4>
                        <div className="flex justify-between items-baseline mt-1.5">
                          <span className={`font-extrabold text-xs ${isLightMode ? 'text-neutral-900' : 'text-white'}`}>₹{p.price.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer" onClick={() => onAddToCart(p)}>+ Add Bag</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </section>
      </div>

      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
          showToast={showToast}
        />
      )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

      {liveTrackingOrder && (
        <OrderLiveTrackingModal
          order={liveTrackingOrder}
          isOpen={Boolean(liveTrackingOrder)}
          onClose={() => setLiveTrackingOrder(null)}
          showToast={showToast}
          isLightMode={isLightMode}
        />
      )}
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    </div>
  );
}
