import React, { useState, useEffect } from 'react';
import {
  Zap,
  Utensils,
  Store,
  Package,
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  ArrowRight,
  Loader2,
  Search,
  MapPin,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Headphones,
  Key,
  MessageSquare,
  Send,
  X,
} from 'lucide-react';
import { DeliveryServiceType, DeliveryTask, DeliveryTaskStatus } from '../types';
import { deliveryApi, CreateDeliveryParams } from '../services/deliveryApi';

interface DeliveryHubPageProps {
  user?: { name?: string; email?: string; phone?: string; _id?: string } | null;
  onNavigateHome: () => void;
  onNavigateCatalog: (category?: string) => void;
  onNavigatePartner?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

const SERVICE_CARDS = [
  {
    type: 'quick_delivery' as DeliveryServiceType,
    title: 'Quick 10-20 Min Delivery',
    tagline: 'Instant Groceries & Essentials',
    speed: '10-20 mins',
    badge: 'BLINKIT SPEED',
    badgeColor: 'bg-amber-500 text-black',
    icon: '⚡',
    description: 'Milk, bread, fresh veggies, cold drinks, snacks & personal care delivered in minutes.',
    categoryFilter: 'delivery',
    popularItems: ['Amul Gold Milk', 'Coca Cola 750ml', 'Lays Classic Salted', 'Brown Bread', 'Farm Eggs'],
  },
  {
    type: 'food_delivery' as DeliveryServiceType,
    title: 'Gourmet Food Delivery',
    tagline: 'Hot Meals from Top Restaurants',
    speed: '25-35 mins',
    badge: 'SWIGGY / ZOMATO TASTE',
    badgeColor: 'bg-rose-500 text-white',
    icon: '🍲',
    description: 'Fresh aromatic biryanis, wood-fired pizzas, sizzlers, desserts & beverages.',
    categoryFilter: 'food_delivery',
    popularItems: ['Hyderabadi Dum Biryani', 'Margherita Cheese Pizza', 'Butter Chicken Naan', 'Gulab Jamun'],
  },
  {
    type: 'nearby_store' as DeliveryServiceType,
    title: 'Nearby Store Orders',
    tagline: 'Neighborhood Chemists & Specialty',
    speed: '30-45 mins',
    badge: 'LOCAL NEIGHBORHOOD',
    badgeColor: 'bg-sky-500 text-white',
    icon: '🏪',
    description: 'Order from trusted local pharmacies, pet supply shops, bakeries and hardware stores.',
    categoryFilter: 'grocery',
    popularItems: ['Medicines & First Aid', 'Artisan Croissants', 'Pedigree Dog Food', 'Stationery Notebooks'],
  },
  {
    type: 'normal_delivery' as DeliveryServiceType,
    title: 'Standard Catalog Delivery',
    tagline: 'Lifestyle, Fashion & Electronics',
    speed: 'Same/Next Day',
    badge: 'PREMIUM SHOPPING',
    badgeColor: 'bg-purple-600 text-white',
    icon: '📦',
    description: 'Curated luxury fashion, electronics, designer accessories with insured transit.',
    categoryFilter: 'luxury',
    popularItems: ['Smartwatches', 'Chronograph Watches', 'Leather Handbags', 'Silk Sarees'],
  },
  {
    type: 'wholesale' as DeliveryServiceType,
    title: 'Wholesale & B2B Delivery',
    tagline: 'Bulk Savings for Retailers',
    speed: 'Scheduled Slot',
    badge: 'BULK PRICING',
    badgeColor: 'bg-emerald-600 text-white',
    icon: '🏢',
    description: 'Tiered wholesale volume discounts on FMCG cartons, grains, and wholesale staples.',
    categoryFilter: 'wholesale',
    popularItems: ['Basmati Rice 25kg', 'Refined Oil Tins', 'FMCG Master Cartons', 'Office Supplies'],
  },
];

export const DeliveryHubPage: React.FC<DeliveryHubPageProps> = ({
  user,
  onNavigateHome,
  onNavigateCatalog,
  onNavigatePartner,
  showToast,
  isLightMode = false,
}) => {
  // Active Delivery Task (saved in local storage)
  const [activeDelivery, setActiveDelivery] = useState<DeliveryTask | null>(() => {
    try {
      const saved = localStorage.getItem('alike_active_delivery');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [creatingQuickOrder, setCreatingQuickOrder] = useState(false);

  // In-app chat state with delivery partner
  const [customerChatOpen, setCustomerChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'customer' | 'partner'; text: string; time: string }>>([
    { sender: 'partner', text: "Namaste! I have picked up your package from the store and am en route.", time: "Just now" },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'customer', text: msg, time: 'Just now' }]);
    setChatInput('');
    // Realistic simulated partner response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'partner', text: "Understood! Arriving shortly. Please have the 4-digit Delivery OTP ready at your doorstep.", time: 'Just now' },
      ]);
    }, 1500);
  };

  // Delivery Address form state
  const [streetAddress, setStreetAddress] = useState('Flat 402, Royal Residency, Connaught Place');
  const [phoneInput, setPhoneInput] = useState(user?.phone || '+91 98100 12345');
  const [nameInput, setNameInput] = useState(user?.name || 'Vikram Malhotra');

  // Persist active delivery
  useEffect(() => {
    if (activeDelivery) {
      localStorage.setItem('alike_active_delivery', JSON.stringify(activeDelivery));
    } else {
      localStorage.removeItem('alike_active_delivery');
    }
  }, [activeDelivery]);

  // Polling delivery status
  useEffect(() => {
    if (!activeDelivery || activeDelivery.status === 'delivered' || activeDelivery.status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      deliveryApi
        .trackDelivery(activeDelivery.taskId)
        .then((updated) => {
          if (updated) setActiveDelivery(updated);
        })
        .catch(() => {});
    }, 4500);

    return () => clearInterval(interval);
  }, [activeDelivery]);

  // Instant Sample Quick Order Creator (to test full flow on Android/desktop)
  const handleDispatchSampleOrder = async (serviceType: DeliveryServiceType, serviceTitle: string) => {
    setCreatingQuickOrder(true);
    try {
      const task = await deliveryApi.createDeliveryTask({
        serviceType,
        customerName: nameInput,
        customerPhone: phoneInput,
        customerEmail: user?.email,
        deliveryAddress: {
          name: nameInput,
          phone: phoneInput,
          street: streetAddress,
          city: 'New Delhi',
          state: 'Delhi',
          zip: '110001',
          landmark: 'Opposite Central Park',
        },
        storeName: serviceType === 'food_delivery' ? 'Alike Royal Dum Handi' : 'Alike 15-Min Dark Store #10',
        storeAddress: 'Barakhamba Road, Connaught Place, New Delhi',
        itemsSummary: serviceType === 'food_delivery' ? '1x Lucknowi Dum Biryani + 2x Butter Garlic Naan' : '2x Amul Gold Milk + 1x Brown Bread + 1x Eggs Tray (6 pcs)',
        itemCount: 3,
        totalAmount: serviceType === 'food_delivery' ? 480 : 215,
        paymentMethod: 'Cash on Delivery',
        instructions: 'Please ring bell and verify 4-digit Delivery OTP upon delivery',
      });

      setActiveDelivery(task);
      if (showToast) {
        showToast(`Instant order dispatched! Share OTP ${task.deliveryOtp} with delivery partner upon arrival.`, 'success');
      }
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to dispatch order', 'error');
    } finally {
      setCreatingQuickOrder(false);
    }
  };

  const handleProgressDeliverySimulation = async (targetStatus?: string) => {
    if (!activeDelivery) return;
    try {
      const updated = await deliveryApi.progressDelivery(activeDelivery.taskId, targetStatus);
      setActiveDelivery(updated);
      if (showToast) showToast(`Delivery status: ${updated.status.replace(/_/g, ' ')}`, 'info');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Failed to progress delivery', 'error');
    }
  };

  const handleVerifyDeliveryOtpSimulation = async () => {
    if (!activeDelivery) return;
    setVerifyingOtp(true);
    try {
      const updated = await deliveryApi.verifyDeliveryOtp(activeDelivery.taskId, deliveryOtpInput || activeDelivery.deliveryOtp);
      setActiveDelivery(updated);
      setDeliveryOtpInput('');
      if (showToast) showToast('Doorstep Delivery OTP verified! Order delivered successfully.', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message || 'Incorrect delivery OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className={`min-h-screen py-4 sm:py-6 px-3 sm:px-6 font-sans transition-colors duration-200 ${
      isLightMode ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-950 text-white'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25">
              <Zap className="w-6 h-6 fill-black" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">ALIKE ND DELIVERY HUB</h1>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-[#FF007F]/10 text-[#FF007F] border border-[#FF007F]/20">
                  Quick • Food • Stores
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                10-20 min lightning delivery, top restaurants, local shops, and wholesale orders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-[#FF007F]/40 text-neutral-700 dark:text-neutral-300"
            >
              Back to Mall
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE LIVE DELIVERY TRACKER (If user has an active order)    */}
        {/* ------------------------------------------------------------- */}
        {activeDelivery && (
          <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-[#FF007F]/30 shadow-2xl space-y-5 animate-in fade-in duration-300">
            {/* Header Status */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF007F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF007F]"></span>
                </span>
                <span className="text-sm font-black uppercase tracking-wider text-[#FF007F]">
                  {activeDelivery.status === 'order_placed' && '1. Order Confirmed at Store'}
                  {activeDelivery.status === 'store_packing' && '2. Store Packing Items'}
                  {activeDelivery.status === 'pickup_pending' && '3. Delivery Partner Arrived at Store'}
                  {activeDelivery.status === 'out_for_delivery' && '4. Out for Delivery — En Route to You!'}
                  {activeDelivery.status === 'arriving_soon' && '5. Delivery Partner Arrived at Your Doorstep'}
                  {activeDelivery.status === 'delivered' && '🎉 Order Delivered Successfully!'}
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                {activeDelivery.taskId}
              </span>
            </div>

            {/* Dual Security Credentials: Store Pickup Code & Doorstep Delivery OTP */}
            {activeDelivery.status !== 'delivered' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Store Pickup Code (Store & Partner Handover) */}
                <div className="p-4 rounded-2xl bg-neutral-900 border border-[#FF007F]/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FF007F]/20 text-[#FF007F] font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF007F]">
                          Store Pickup Code
                        </span>
                        {activeDelivery.pickupVerified || activeDelivery.status === 'out_for_delivery' || activeDelivery.status === 'arrived_at_customer' ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                            Verified ✓
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF007F]/20 text-[#FF007F]">
                            Awaiting Store
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Merchant verifies with rider before handover
                      </p>
                    </div>
                  </div>
                  <div className="bg-black px-3.5 py-1.5 rounded-xl border border-[#FF007F]/40 font-mono font-black text-[#FF007F] text-base tracking-wider">
                    {activeDelivery.pickupCode || 'PU-8291'}
                  </div>
                </div>

                {/* 2. Customer Delivery OTP (Doorstep Handover) */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                        Doorstep Delivery OTP
                      </span>
                      <p className="text-[11px] text-neutral-400">
                        Share with driver upon doorstep arrival
                      </p>
                    </div>
                  </div>
                  <div className="bg-black px-4 py-1.5 rounded-xl border border-emerald-500/40 font-mono font-black text-emerald-400 text-xl tracking-widest shadow-inner">
                    {activeDelivery.deliveryOtp}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Partner Profile Card */}
            {activeDelivery.deliveryPartner && (
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-850/60 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={activeDelivery.deliveryPartner.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                    alt={activeDelivery.deliveryPartner.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-[#FF007F] shadow-md shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{activeDelivery.deliveryPartner.name}</span>
                      <span className="text-[11px] text-[#FF007F] font-black flex items-center gap-0.5">
                        ★ {activeDelivery.deliveryPartner.rating.toFixed(2)}
                      </span>
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {activeDelivery.deliveryPartner.vehicleType} • {activeDelivery.deliveryPartner.vehicleNumber}
                    </p>
                    <a
                      href={`tel:${activeDelivery.deliveryPartner.phone}`}
                      className="inline-flex items-center gap-1 text-xs text-[#FF007F] font-bold hover:underline mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{activeDelivery.deliveryPartner.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-mono font-bold text-emerald-500 block">
                    ETA: ~{activeDelivery.status === 'out_for_delivery' ? '7' : '15'} mins
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
                    {activeDelivery.itemsSummary}
                  </span>
                  <span className="text-xs font-black text-[#FF007F] block mt-1">
                    ₹{activeDelivery.totalAmount} ({activeDelivery.paymentMethod})
                  </span>
                </div>
              </div>
            )}

            {/* Test Simulation Controls */}
            <div className="p-3.5 rounded-2xl bg-[#FF007F]/5 border border-[#FF007F]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#FF007F] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Delivery Partner & Doorstep Simulator (Test Controls)</span>
                </span>
                <span className="text-[10px] text-neutral-400">Step through order lifecycle</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeDelivery.status === 'order_placed' && (
                  <button
                    type="button"
                    onClick={() => handleProgressDeliverySimulation('store_packing')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    1. Store Accepted & Packing
                  </button>
                )}

                {activeDelivery.status === 'store_packing' && (
                  <button
                    type="button"
                    onClick={() => handleProgressDeliverySimulation('arrived_at_store')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    2. Partner Arrived at Store Counter
                  </button>
                )}

                {activeDelivery.status === 'arrived_at_store' && (
                  <button
                    type="button"
                    onClick={() => handleProgressDeliverySimulation('out_for_delivery')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    3. Verify Store Pickup Code ({activeDelivery.pickupCode || 'PU-8291'}) & Take Package
                  </button>
                )}

                {activeDelivery.status === 'out_for_delivery' && (
                  <button
                    type="button"
                    onClick={() => handleProgressDeliverySimulation('arriving_soon')}
                    className="px-3 py-1.5 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white font-extrabold text-xs transition-colors cursor-pointer"
                  >
                    4. Partner Arrived at Customer Doorstep
                  </button>
                )}

                {(activeDelivery.status === 'arriving_soon' || activeDelivery.status === 'arrived_at_customer') && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="4-digit Delivery OTP"
                      value={deliveryOtpInput}
                      onChange={(e) => setDeliveryOtpInput(e.target.value)}
                      maxLength={4}
                      className="w-36 px-3 py-1.5 text-xs rounded-xl bg-neutral-900 border border-neutral-700 font-mono text-center text-emerald-400 font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setDeliveryOtpInput(activeDelivery.deliveryOtp)}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-800 text-[10px] font-bold text-neutral-300 hover:bg-neutral-700"
                    >
                      Autofill OTP
                    </button>
                    <button
                      type="button"
                      disabled={verifyingOtp}
                      onClick={handleVerifyDeliveryOtpSimulation}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {verifyingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>5. Verify Doorstep OTP & Deliver</span>
                    </button>
                  </div>
                )}

                {activeDelivery.status === 'delivered' && (
                  <button
                    type="button"
                    onClick={() => setActiveDelivery(null)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs cursor-pointer ml-auto"
                  >
                    Close Delivery Tracker
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SERVICE HUBS GRID (Quick, Food, Stores, Normal, Wholesale)     */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                Choose Delivery Service
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Select your preferred mode of instant dispatch or schedule
              </p>
            </div>
            <span className="text-xs font-bold text-[#FF007F]">Live Delivery in NCR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_CARDS.map((svc) => (
              <div
                key={svc.type}
                className="group relative p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-[#FF007F]/50 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-2xl shadow-sm">
                      {svc.icon}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${svc.badgeColor}`}>
                      {svc.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-neutral-900 dark:text-white group-hover:text-[#FF007F] transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                      {svc.description}
                    </p>
                  </div>

                  {/* Popular Items Chips */}
                  <div className="pt-2">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                      Popular:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {svc.popularItems.map((item) => (
                        <span
                          key={item}
                          className="px-2 py-0.5 text-[10px] rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{svc.speed}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Browse Catalog with Filter */}
                    <button
                      type="button"
                      onClick={() => onNavigateCatalog(svc.categoryFilter)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      Catalog
                    </button>

                    {/* Test Instant Dispatch Button */}
                    <button
                      type="button"
                      disabled={creatingQuickOrder}
                      onClick={() => handleDispatchSampleOrder(svc.type, svc.title)}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:brightness-110 text-white shadow-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Order</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliver with ALIKE ND Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#FF007F]/10 via-[#FF1990]/5 to-transparent border border-[#FF007F]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="p-3.5 rounded-2xl bg-[#FF007F] text-white shadow-lg shadow-[#FF007F]/20 shrink-0">
              <Truck className="w-6 h-6" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF007F]/20 text-[#FF007F] text-[10px] font-bold uppercase tracking-wider mb-1">
                <span>Earn With ALIKE ND</span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                Become an ALIKE ND Delivery Partner
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl">
                Deliver quick groceries, restaurant meals, store pickups, and earn up to ₹25,000/month with flexible slots, insurance coverage, and instant weekly payouts.
              </p>
            </div>
          </div>
          {onNavigatePartner && (
            <button
              onClick={onNavigatePartner}
              className="px-5 py-2.5 rounded-2xl font-bold text-xs bg-[#FF007F] hover:bg-[#D80068] text-white shadow-lg shadow-[#FF007F]/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>Partner Onboarding Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Delivery Guarantee & Helpline Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[#FF007F]/10 text-[#FF007F] border border-[#FF007F]/20">
              <Headphones className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                ALIKE ND Delivery Partner Support
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Live delivery delay resolution, contactless delivery requests, and doorstep OTP assistance.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#FF007F] bg-[#FF007F]/10 px-3 py-1.5 rounded-xl border border-[#FF007F]/20">
            Toll Free: 1800-ALIKE-DELIVERY
          </span>
        </div>
      </div>
    </div>
  );
};
