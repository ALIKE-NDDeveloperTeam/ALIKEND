import { useState, useRef, FormEvent, MouseEvent } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Check,
  Plus,
  CreditCard,
  Smartphone,
  Landmark,
  Wallet,
  Clock,
  Banknote,
  CheckCircle2,
  QrCode,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  FileText,
  Download,
  MapPin,
  Truck,
  ShoppingBag,
  Home,
  Receipt,
  Phone,
  User,
  PackageCheck,
  Trash2,
  Printer,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  Heart,
  Radio,
  Navigation,
  Zap,
} from 'lucide-react';
import { Address, CartItem, Order } from '../types';
import InvoiceModal from '../components/InvoiceModal';
import OrderLiveTrackingModal from '../components/orders/OrderLiveTrackingModal';
import { useLocation } from '../context/LocationContext';
<<<<<<< HEAD
=======
=======
  Heart
} from 'lucide-react';
import { Address, CartItem, Order } from '../types';
import InvoiceModal from '../components/InvoiceModal';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

interface CheckoutProps {
  cartItems: CartItem[];
  couponCode?: string;
  walletBalance: number;
  onDeductWallet: (amt: number) => boolean;
  onPlaceOrder: (order: Order) => void;
  onNavigate: (view: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  user?: { _id?: string; name: string; email: string; phone: string } | null;
}

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' },
];

const ALL_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Federal Bank',
  'YES Bank',
  'Central Bank of India',
  'Indian Bank',
  'Bank of India',
  'UCO Bank',
  'Bank of Maharashtra',
  'South Indian Bank',
  'Karur Vysya Bank',
  'RBL Bank',
];

export default function Checkout({
  cartItems,
  couponCode,
  walletBalance,
  onDeductWallet,
  onPlaceOrder,
  onNavigate,
  showToast,
  user,
}: CheckoutProps) {
<<<<<<< HEAD
  const { location, nearbySellers, promptLocationCapture } = useLocation();
=======
<<<<<<< HEAD
  const { location, nearbySellers, promptLocationCapture } = useLocation();
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [step, setStep] = useState<number>(2); // Start at Step 2 (Address selection)
  
  // Scoped addresses from user storage - new accounts start with ZERO addresses
  const [addresses, setAddresses] = useState<Address[]>(() => {
    if (user && user.email) {
      try {
        const saved = localStorage.getItem(`alike_addresses_${user.email.toLowerCase()}`);
        if (saved && saved.trim() !== '' && saved !== 'null' && saved !== 'undefined') {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    } else {
      try {
        const guestSaved = localStorage.getItem('alike_guest_addresses');
        if (guestSaved && guestSaved.trim() !== '' && guestSaved !== 'null') {
          const parsed = JSON.parse(guestSaved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string>(() => {
    return addresses.length > 0 ? addresses[0].id : '';
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
<<<<<<< HEAD
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState<boolean>(false);
=======
<<<<<<< HEAD
  const [showLiveTrackingModal, setShowLiveTrackingModal] = useState<boolean>(false);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const paymentTabsRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (paymentTabsRef.current) {
      paymentTabsRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  // Address Form State - auto show form when no address is saved
  const [showAddressForm, setShowAddressForm] = useState(() => addresses.length === 0);
  const [newName, setNewName] = useState(user?.name || '');
  const [newPhone, setNewPhone] = useState(user?.phone || '');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZip, setNewZip] = useState('');

  // 1. Cards State
  const [cardType, setCardType] = useState<'credit' | 'debit'>('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  // 2. UPI State
  const [upiSubMode, setUpiSubMode] = useState<'apps' | 'vpa' | 'qr'>('apps');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [upiId, setUpiId] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // 3. Net Banking State
  const [selectedBank, setSelectedBank] = useState<string>('hdfc');

  // 4. Wallets State
  const [selectedWallet, setSelectedWallet] = useState<'alike' | 'paytm' | 'phonepe' | 'amazonpay'>('alike');
  const [walletPhone, setWalletPhone] = useState('9999999999');

  // 5. EMI & Pay Later State
  const [emiCategory, setEmiCategory] = useState<'cc_emi' | 'paylater'>('cc_emi');
  const [emiBank, setEmiBank] = useState<'hdfc' | 'icici' | 'sbi' | 'axis'>('hdfc');
  const [emiTenure, setEmiTenure] = useState<number>(3); // months
  const [payLaterProvider, setPayLaterProvider] = useState<'simpl' | 'lazypay' | 'zestmoney'>('simpl');

  // Calculations (Use active cart items only - no demo/mock fallbacks)
  const activeCheckoutItems = cartItems || [];
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Re-evaluate Quick Delivery (10-20 min) eligibility for every item in the cart
  const quickEligibility = (() => {
    if (!location) {
      return {
        eligible: false,
        etaText: 'Standard Delivery',
        reason: 'Set your delivery location to check if nearby sellers offer 10-20 min Quick Delivery.',
      };
    }
    if (activeCheckoutItems.length === 0) {
      return {
        eligible: false,
        etaText: 'Standard Delivery',
        reason: 'Your bag is empty.',
      };
    }

    const sellerIds = new Set<string>();
    let eligibleCount = 0;
    let maxEtaMin = 10;
    let maxEtaMax = 16;

    for (const item of activeCheckoutItems) {
      const prod = item.product;
      const sid = String(prod.sellerId || 'admin');
      sellerIds.add(sid);

      const nearbyMatch = nearbySellers.find((ns) => String(ns.id) === sid);
      const isItemQuick = Boolean(prod.quickDelivery || nearbyMatch?.quickDelivery);

      if (isItemQuick) {
        eligibleCount++;
        const eMin = prod.etaMin ?? nearbyMatch?.etaMin ?? 10;
        const eMax = prod.etaMax ?? nearbyMatch?.etaMax ?? 16;
        if (eMin > maxEtaMin) maxEtaMin = eMin;
        if (eMax > maxEtaMax) maxEtaMax = eMax;
      }
    }

    if (eligibleCount === activeCheckoutItems.length) {
      return {
        eligible: true,
        etaText: `${maxEtaMin}-${Math.min(20, maxEtaMax)} min`,
        reason: `All ${activeCheckoutItems.length} item(s) in your bag are stocked by nearby Quick Delivery sellers (${location.label}).`,
      };
    }

    if (eligibleCount > 0 && sellerIds.size > 1) {
      return {
        eligible: false,
        etaText: 'Standard Delivery',
        reason:
          'Your cart contains items from multiple sellers and at least one seller is outside the 10-20 min Quick Delivery range. Only Standard Delivery is available for this combined order.',
      };
    }

    return {
      eligible: false,
      etaText: 'Standard Delivery',
      reason:
        'The seller(s) for the items in your bag are outside the 3 km / 20-min Quick Delivery zone for your selected location. Standard Delivery applies.',
    };
  })();

  const [deliveryType, setDeliveryType] = useState<'quick' | 'standard'>(() =>
    quickEligibility.eligible ? 'quick' : 'standard'
  );

  // Automatically sync deliveryType if eligibility changes when location or cart updates
  const effectiveDeliveryType: 'quick' | 'standard' =
    quickEligibility.eligible && deliveryType === 'quick' ? 'quick' : 'standard';

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const subtotal = activeCheckoutItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const discount = couponCode === 'ALIKE10' ? Math.round(subtotal * 0.1) : 0;
  const gst = Math.round((subtotal - discount) * 0.18);
  const delivery = subtotal > 50000 ? 0 : 250;
  const codFee = paymentMethod === 'cod' ? 50 : 0;
  const totalAmount = subtotal - discount + gst + delivery + codFee;

  const handleAddAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || !newStreet || !newCity || !newZip) {
      showToast('Please complete mandatory address lines.', 'error');
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: newName,
      phone: newPhone,
      street: newStreet,
      city: newCity,
      state: newState || 'Maharashtra',
      zip: newZip,
      isDefault: addresses.length === 0,
    };

    const updated = [...addresses, newAddr];
    setAddresses(updated);
    setSelectedAddressId(newAddr.id);
    setShowAddressForm(false);

    try {
      if (user && user.email) {
        localStorage.setItem(`alike_addresses_${user.email.toLowerCase()}`, JSON.stringify(updated));
      } else {
        localStorage.setItem('alike_guest_addresses', JSON.stringify(updated));
      }
    } catch {}

    showToast('New checkout delivery destination saved!', 'success');
  };

  const handlePlaceOrderSubmit = () => {
    if (!activeCheckoutItems || activeCheckoutItems.length === 0) {
      showToast('Your shopping bag is empty. Please select products first.', 'error');
      return;
    }

    const deliveryAddress = addresses.find((a) => a.id === selectedAddressId);
    if (!deliveryAddress) {
      showToast('Please select a valid delivery address.', 'warning');
      return;
    }

    // Payment validation per selected method
    if (paymentMethod === 'card') {
      if (cardNumber.length < 16 || !cardExpiry || cardCVV.length < 3 || !cardHolder) {
        showToast('Please complete card number, holder name, expiry & CVV.', 'error');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (upiSubMode === 'vpa' && (!upiId || !upiId.includes('@'))) {
        showToast('Please enter a valid UPI VPA ID (e.g. name@upi).', 'error');
        return;
      }
    } else if (paymentMethod === 'wallets' && selectedWallet === 'alike') {
      const success = onDeductWallet(totalAmount);
      if (!success) {
        showToast('Insufficient Alike Wallet balance. Top up or select another method.', 'error');
        return;
      }
    }

    // Generate standard order with customer-selected items snapshot
    const orderId = `ALK-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderItemsSnapshot: CartItem[] = activeCheckoutItems.map((ci) => ({
      product: { ...ci.product },
      quantity: ci.quantity,
      selectedColor: ci.selectedColor,
      selectedSize: ci.selectedSize,
    }));

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: orderItemsSnapshot,
      subtotal,
      tax: gst,
      discount,
      delivery,
      total: totalAmount,
      status: 'Pending',
      address: deliveryAddress,
      paymentMethod: paymentMethod.toUpperCase(),
      trackingStep: 1, // Order Placed
      memberEmail: user?.email ? user.email.toLowerCase() : '',
      userId: user?._id || '',
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      deliveryLocation: location
        ? {
            lat: location.lat,
            lng: location.lng,
            address: `${deliveryAddress.street}, ${deliveryAddress.city} (${location.label})`,
          }
        : undefined,
      deliveryType: effectiveDeliveryType,
      deliveryEtaText: effectiveDeliveryType === 'quick' ? quickEligibility.etaText : 'Standard Delivery',
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    };

    // Persist order synchronously to MongoDB alikendshop.orders collection (Problem #13)
    const token = typeof window !== 'undefined' ? localStorage.getItem('alike_user_token') : null;
    const authHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`;
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        items: orderItemsSnapshot,
        address: deliveryAddress,
        paymentMethod: paymentMethod.toUpperCase(),
        memberEmail: user?.email ? user.email.toLowerCase() : '',
        userId: user?._id || '',
<<<<<<< HEAD
        deliveryLocation: newOrder.deliveryLocation,
        deliveryType: effectiveDeliveryType,
        deliveryEtaText: newOrder.deliveryEtaText,
=======
<<<<<<< HEAD
        deliveryLocation: newOrder.deliveryLocation,
        deliveryType: effectiveDeliveryType,
        deliveryEtaText: newOrder.deliveryEtaText,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to confirm order with server');
        }
        return res.json();
      })
      .then((data) => {
        const confirmedOrderNumber = data?.order?.orderNumber || data?.orderNumber || orderId;
        const confirmedOrder: Order = {
          ...newOrder,
          id: confirmedOrderNumber,
          total: data?.order?.total || totalAmount,
<<<<<<< HEAD
          deliveryType: data?.order?.deliveryType || effectiveDeliveryType,
          deliveryEtaText: data?.order?.deliveryEtaText || newOrder.deliveryEtaText,
=======
<<<<<<< HEAD
          deliveryType: data?.order?.deliveryType || effectiveDeliveryType,
          deliveryEtaText: data?.order?.deliveryEtaText || newOrder.deliveryEtaText,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        };
        setPlacedOrder(confirmedOrder);
        onPlaceOrder(confirmedOrder);
        setStep(4); // Advance to completion view only upon verified confirmation
        showToast(`Order Placed Successfully! Invoice Ref: ${confirmedOrderNumber}`, 'success');
      })
      .catch((err) => {
        console.error('Orders API sync error:', err);
        showToast(err.message || 'Error processing your order. Please check your network and try again.', 'error');
      });
  };

  const handleDeleteAddress = (id: string, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const remaining = addresses.filter((a) => a.id !== id);
    setAddresses(remaining);
    try {
      if (user && user.email) {
        localStorage.setItem(`alike_addresses_${user.email.toLowerCase()}`, JSON.stringify(remaining));
      } else {
        localStorage.setItem('alike_guest_addresses', JSON.stringify(remaining));
      }
    } catch {}
    if (selectedAddressId === id) {
      setSelectedAddressId(remaining[0]?.id || '');
    }
    if (remaining.length === 0) {
      setShowAddressForm(true);
    }
    showToast('Address removed successfully.', 'info');
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'card':
        return `${cardType.toUpperCase()} CARD (Ending in ${cardNumber.slice(-4) || '4242'})`;
      case 'upi':
        return upiSubMode === 'apps' ? `UPI APP (${selectedUpiApp.toUpperCase()})` : upiSubMode === 'qr' ? 'UPI SCAN & PAY' : `UPI ID (${upiId})`;
      case 'netbanking':
        return `NET BANKING (${selectedBank.toUpperCase()})`;
      case 'wallets':
        return `WALLET (${selectedWallet.toUpperCase()})`;
      case 'emi':
        return emiCategory === 'cc_emi' ? `EMI (${emiBank.toUpperCase()} ${emiTenure} Months)` : `PAY LATER (${payLaterProvider.toUpperCase()})`;
      case 'cod':
        return 'CASH ON DELIVERY';
      default:
        return method.toUpperCase();
    }
  };

  return (
    <div id="checkout-root" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 4-Step Progress Navigation Header */}
      <div className="flex justify-between items-center max-w-xl mx-auto border-b border-solid border-neutral-200 dark:border-neutral-800 pb-5" id="checkout-progress-bar">
        {[
          { num: 1, label: 'Cart' },
          { num: 2, label: 'Address' },
          { num: 3, label: 'Payment' },
          { num: 4, label: 'Confirm' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => {
              if (s.num === 1) onNavigate('cart');
              else if (s.num === 2 && step === 3) setStep(2);
            }}
            className={`flex flex-col items-center gap-1.5 ${
              (s.num === 1 || (s.num === 2 && step === 3)) ? 'cursor-pointer group' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border border-solid transition-all ${
                s.num === step
                  ? 'bg-[#0F1A3C] text-[#F5A623] border-[#F5A623] shadow-md dark:bg-[#F5A623] dark:text-[#0F1A3C]'
                  : s.num < step
                  ? 'bg-emerald-500 text-white border-emerald-500 group-hover:scale-105'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border-neutral-300 dark:border-neutral-800'
              }`}
            >
              {s.num < step ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[10px] uppercase tracking-wider font-extrabold ${
                s.num === step ? 'text-[#0F1A3C] dark:text-[#F5A623]' : 'text-neutral-400'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {step === 4 ? (
        /* SUCCESS ORDER COMPLETE VIEW REPRESENTATION */
        <div id="checkout-completion-view" className="max-w-2xl mx-auto p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-solid border-[#F5A623] rounded-3xl shadow-2xl space-y-6">
          {/* Top Quick Back and Order ID Bar */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <button
              id="success-top-back-btn"
              type="button"
              onClick={() => onNavigate('home')}
              className="px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-neutral-300 dark:border-neutral-700 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>

            {placedOrder && (
              <span className="text-xs font-mono font-bold text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-lg border border-[#F5A623]/30">
                Order #{placedOrder.id}
              </span>
            )}
          </div>

          {/* Success Animation & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 sm:p-4 rounded-full bg-emerald-500/10 text-emerald-500 shadow-inner">
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
              Order Dispatched Successfully!
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
              Your signature luxury items are packaging at our closest atelier terminal. Progress tracks live inside your order tracker.
            </p>
          </div>

          {/* Location & Delivery Destination Card */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-5 border border-solid border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-2.5 text-left">
            <div className="flex items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-red-500" />
                <span>Delivery Location & Address</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Verified Address
              </span>
            </div>

            {(() => {
              const currentAddr = placedOrder?.address || addresses.find((a) => a.id === selectedAddressId) || addresses[0];
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-medium block">Recipient Name & Contact:</span>
                    <p className="font-extrabold text-neutral-900 dark:text-white text-sm mt-0.5">{currentAddr?.name}</p>
                    <p className="text-neutral-600 dark:text-neutral-300 font-mono text-xs flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-neutral-400" /> +91 {currentAddr?.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 font-medium block">Full Destination Address:</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs mt-0.5 leading-relaxed">
                      {currentAddr?.street}, {currentAddr?.city}, {currentAddr?.state} - <span className="font-mono font-bold text-amber-500">{currentAddr?.zip}</span>
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* OFFICIAL DELIVERY BILL & SHIPMENT CHALLAN */}
          {(() => {
            const displayItems = (placedOrder?.items && placedOrder.items.length > 0) ? placedOrder.items : activeCheckoutItems;
            const displaySubtotal = placedOrder ? placedOrder.subtotal : subtotal;
            const displayDiscount = placedOrder ? placedOrder.discount : discount;
            const displayGst = placedOrder ? placedOrder.tax : gst;
            const displayDelivery = placedOrder ? placedOrder.delivery : delivery;
            const displayTotal = placedOrder ? placedOrder.total : totalAmount;
            const displayPaymentMethod = placedOrder ? placedOrder.paymentMethod : paymentMethod;

            return (
              <>
                <div
                  id="official-delivery-bill-card"
                  className="bg-white dark:bg-neutral-950 border-2 border-dashed border-[#F5A623]/60 rounded-2xl p-4 sm:p-5 text-left space-y-4 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-[#F5A623]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-black text-sm uppercase tracking-wider text-[#0F1A3C] dark:text-white">
                            Official Delivery Bill & Challan
                          </h3>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                            PAID & VERIFIED
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono">
                          Waybill / AWB: BL-{placedOrder?.id || 'ALK-892100'}-X99 • Dispatch: Mumbai Central Atelier
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowInvoiceModal(true)}
                      className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[11px] font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF Slip</span>
                    </button>
                  </div>

                  {/* Ordered Items Table inside Delivery Bill */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 tracking-wider block">
                      Delivered Items List ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}):
                    </span>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80 rounded-xl border border-neutral-200 dark:border-neutral-800/80 overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                      {displayItems.map((item: any, idx) => {
                        const name = item.product?.name || item.name || 'Luxury Product';
                        const sku = item.product?.id || item.product?._id || item.productId || item.id || `SKU-${idx + 1}`;
                        const unitPrice = Number(item.product?.price ?? item.price ?? 0);
                        const quantity = Number(item.quantity ?? item.qty ?? 1);
                        const image = item.product?.image || item.image || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600';
                        const itemTotal = unitPrice * quantity;

                        return (
                          <div key={idx} className="p-2.5 sm:px-3.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                ✓
                              </span>
                              <img
                                src={image}
                                alt={name}
                                className="w-9 h-9 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                              <div className="truncate">
                                <p className="font-bold text-neutral-900 dark:text-white truncate text-xs">
                                  {name}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-mono">
                                  SKU: {sku} • Qty: {quantity} × ₹{unitPrice.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200 text-xs shrink-0">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Full Financial & Expense Breakdown (Khoroch & Charges Total) */}
                <div className="bg-neutral-50 dark:bg-neutral-950 p-4 sm:p-5 border border-solid border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3 text-xs text-left">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <div className="flex items-center gap-2 font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider text-xs">
                      <Receipt className="w-4 h-4 text-amber-500" />
                      <span>Price & Expense Breakdown</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#F5A623] uppercase">
                      {getPaymentLabel(displayPaymentMethod.toLowerCase())}
                    </span>
                  </div>

                  <div className="space-y-2 divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300 pt-1">
                      <span>Items Subtotal ({displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}):</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">₹{displaySubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {displayDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 pt-2">
                        <span>Coupon Savings (ALIKE10):</span>
                        <span className="font-bold font-mono">-₹{displayDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300 pt-2">
                      <span>GST & Duties (18% Included):</span>
                      <span className="font-bold text-neutral-900 dark:text-white font-mono">+₹{displayGst.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-300 pt-2">
                      <span>Delivery & Shipping Charges:</span>
                      <span className={`font-bold font-mono ${displayDelivery === 0 ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'}`}>
                        {displayDelivery === 0 ? 'FREE' : `+₹${displayDelivery}`}
                      </span>
                    </div>

                    {codFee > 0 && displayPaymentMethod.toUpperCase() === 'COD' && (
                      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 pt-2">
                        <span>Cash on Delivery Handling Fee:</span>
                        <span className="font-bold font-mono">+₹{codFee}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t-2 border-neutral-300 dark:border-neutral-700 text-sm">
                      <span className="font-extrabold text-[#0F1A3C] dark:text-white">Total Amount Charged:</span>
                      <span className="font-black text-[#F5A623] text-lg font-mono">
                        ₹{displayTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Custom Thank You Note under Bill */}
                    <div className="mt-3 p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-center flex items-center justify-center space-x-2 shadow-xs">
                      <Heart className="w-4 h-4 text-amber-600 fill-amber-500 dark:text-[#F5A623] dark:fill-[#F5A623] shrink-0" />
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        ALIKE ND te shopping korar jonno Thanks, abar asben shopping korte!
                      </p>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              id="live-tracking-map-btn"
              type="button"
              onClick={() => setShowLiveTrackingModal(true)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FF007F] to-rose-600 hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Track Live Seller & Delivery Coordinates (Map)</span>
            </button>

            <button
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              id="download-pdf-invoice-btn"
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="w-full py-3.5 bg-[#0d0d0d] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 border border-[#0d0d0d]"
            >
              <FileText className="w-4 h-4" />
              <span>View & Download Tax Invoice (PDF)</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="success-track-orders-btn"
                type="button"
                onClick={() => onNavigate('orders')}
                className="flex-1 py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[#F5A623] border-2 border-solid border-[#F5A623] text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Truck className="w-4 h-4 text-[#F5A623]" />
                <span>Track Order Book</span>
              </button>
              <button
                id="success-homepage-btn"
                type="button"
                onClick={() => onNavigate('home')}
                className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-neutral-800 to-black hover:from-neutral-700 hover:to-neutral-900 dark:from-white dark:to-neutral-200 dark:hover:from-neutral-100 dark:hover:to-white text-white dark:text-[#0F1A3C] text-xs font-black uppercase tracking-wider rounded-xl border border-neutral-700 dark:border-white hover:shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Home className="w-4 h-4 text-[#F5A623] dark:text-[#0F1A3C]" />
                <span>Back to Shopping</span>
              </button>
            </div>
          </div>

          {showInvoiceModal && placedOrder && (
            <InvoiceModal
              order={placedOrder}
              onClose={() => setShowInvoiceModal(false)}
              showToast={showToast}
            />
          )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

          {showLiveTrackingModal && placedOrder && (
            <OrderLiveTrackingModal
              order={placedOrder}
              isOpen={showLiveTrackingModal}
              onClose={() => setShowLiveTrackingModal(false)}
              showToast={showToast}
            />
          )}
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        </div>
      ) : activeCheckoutItems.length === 0 ? (
        <div id="checkout-empty-cart-state" className="max-w-xl mx-auto p-10 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center space-y-5 shadow-lg">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-[#F5A623] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-serif font-black text-neutral-900 dark:text-white uppercase tracking-wider">
              Your Checkout Bag is Empty
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Please select authentic luxury items from our storefront or Flash Premium Deals to begin checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-[#0F1A3C] hover:bg-neutral-900 text-[#F5A623] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Explore Storefront Collections
          </button>
        </div>
      ) : (
        /* STEP 2 & 3 DOUBLE INTERACTIVE AREA */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel Context */}
          <div className="lg:col-span-8 space-y-6">
            {step === 2 && (
              /* PANEL A: ADDRESS SELECT */
              <div className="p-6 bg-white dark:bg-neutral-900 border border-solid border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-5 shadow-sm" id="address-selection-panel">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <button
                      id="address-back-to-cart-btn"
                      type="button"
                      onClick={() => onNavigate('cart')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors text-xs font-semibold cursor-pointer active:scale-95 shadow-xs"
                      title="Back to Cart"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Cart</span>
                    </button>
                    <h3 className="text-sm font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                      Select Dispatch Destination
                    </h3>
                  </div>

                  <button
                    id="add-new-address-toggle"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center space-x-1 text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-[#F5A623] dark:hover:underline cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {/* Form to insert custom address */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="p-4 bg-neutral-50 dark:bg-neutral-950 border border-solid border-[#F5A623]/40 rounded-2xl space-y-3 animate-fade-in text-xs">
                    <p className="font-bold text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider text-[10px]">Add physical destination</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        id="addr-form-name"
                        type="text"
                        required
                        placeholder="Receiver Full Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                      />
                      <input
                        id="addr-form-phone"
                        type="tel"
                        required
                        placeholder="Mobile Phone"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                      />
                    </div>
                    <input
                      id="addr-form-street"
                      type="text"
                      required
                      placeholder="Street line and Apartment number"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        id="addr-form-city"
                        type="text"
                        required
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                      />
                      <input
                        id="addr-form-state"
                        type="text"
                        placeholder="State"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                      />
                      <input
                        id="addr-form-zip"
                        type="text"
                        required
                        placeholder="Pincode/ZIP"
                        value={newZip}
                        onChange={(e) => setNewZip(e.target.value)}
                        className="p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        id="addr-form-cancel"
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        id="addr-form-save"
                        type="submit"
                        className="px-4 py-2 bg-[#0F1A3C] text-[#F5A623] font-extrabold rounded-xl cursor-pointer"
                      >
                        Save & Dispatch
                      </button>
                    </div>
                  </form>
                )}

                {/* Empty State when no address exists */}
                {addresses.length === 0 && (
                  <div className="p-8 text-center bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 space-y-3 my-2" id="no-saved-address-notice">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-[#F5A623] flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      No delivery address saved yet.
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                      Please add a delivery destination below.
                    </p>
                    {!showAddressForm && (
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                        className="px-4 py-2 bg-[#0F1A3C] text-[#F5A623] text-xs font-bold rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add New Address
                      </button>
                    )}
                  </div>
                )}

                {/* Pre-saved list */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((addr, aIdx) => (
                      <div
                        key={`checkout-addr-${addr.id || 'addr'}-${aIdx}`}
                        id={`address-card-${addr.id}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`flex items-start justify-between gap-4 p-4 rounded-2xl border border-solid cursor-pointer transition-all select-none group ${
                          selectedAddressId === addr.id
                            ? 'border-[#F5A623] bg-[#F5A623]/10 shadow-sm'
                            : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="radio"
                            id={`radio-addr-${addr.id}`}
                            name="checkout_destination"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 text-[#F5A623] focus:ring-[#F5A623] accent-[#F5A623] cursor-pointer"
                          />
                          <div className="flex-1 text-xs min-w-0">
                            <div className="flex items-center gap-2 font-bold text-[#0F1A3C] dark:text-white uppercase text-[11px] tracking-wide">
                              <span className="truncate">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.2 rounded font-mono font-bold">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-700 dark:text-neutral-300 mt-1 font-medium leading-relaxed">{addr.street}</p>
                            <p className="text-neutral-500 mt-0.5 text-[11px]">
                              {addr.city}, {addr.state} — <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{addr.zip}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-neutral-500 flex items-center gap-1">
                            📞 {addr.phone}
                          </span>

                          <button
                            id={`delete-address-btn-${addr.id}`}
                            type="button"
                            onClick={(e) => handleDeleteAddress(addr.id, e)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20 flex items-center gap-1 text-[11px] font-semibold"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[10px]">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                {/* Delivery Speed Selection (Quick 10-20 min vs Standard Delivery) */}
                <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-xs font-black uppercase tracking-wider text-[#0F1A3C] dark:text-white">
                        Delivery Speed & Dispatch Mode
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => promptLocationCapture()}
                      className="text-[11px] font-bold text-[#F5A623] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{location ? `Pin: ${location.label} (Change)` : 'Set Location on Map'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Quick Delivery (10-20 min) */}
                    <button
                      type="button"
                      disabled={!quickEligibility.eligible}
                      onClick={() => {
                        if (quickEligibility.eligible) setDeliveryType('quick');
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                        !quickEligibility.eligible
                          ? 'opacity-55 cursor-not-allowed border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/50'
                          : effectiveDeliveryType === 'quick'
                          ? 'border-[#F5A623] bg-[#F5A623]/15 shadow-xs cursor-pointer'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#F5A623]/50 cursor-pointer'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#0F1A3C] dark:text-white">
                            ⚡ Quick Delivery (10-20 min)
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500">
                          {quickEligibility.eligible
                            ? `Estimated arrival in ${quickEligibility.etaText}`
                            : 'Unavailable for current cart / location'}
                        </p>
                      </div>
                      {effectiveDeliveryType === 'quick' && (
                        <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0" />
                      )}
                    </button>

                    {/* Option 2: Standard Delivery */}
                    <button
                      type="button"
                      onClick={() => setDeliveryType('standard')}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        effectiveDeliveryType === 'standard'
                          ? 'border-[#F5A623] bg-[#F5A623]/15 shadow-xs'
                          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#F5A623]/50'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-[#0F1A3C] dark:text-white">
                            🚚 Standard Delivery
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500">
                          Regular scheduled courier dispatch
                        </p>
                      </div>
                      {effectiveDeliveryType === 'standard' && (
                        <CheckCircle2 className="w-4 h-4 text-[#F5A623] shrink-0" />
                      )}
                    </button>
                  </div>

                  {/* Explanation message */}
                  <p
                    className={`text-[11px] font-medium leading-relaxed ${
                      quickEligibility.eligible
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {quickEligibility.reason}
                  </p>
                </div>

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                <div className="flex justify-end pt-3">
                  <button
                    id="address-proceed-payment"
                    onClick={() => {
                      if (addresses.length === 0 || !selectedAddressId) {
                        showToast('Please add a delivery destination before proceeding.', 'warning');
                        setShowAddressForm(true);
                        return;
                      }
                      setStep(3);
                    }}
                    className="px-6 py-3 bg-[#0d0d0d] hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:opacity-95 cursor-pointer shadow-md border border-[#0d0d0d]"
                  >
                    Select Secured Payments
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              /* PANEL B: METHOD SELECT */
              <div className="p-6 bg-white dark:bg-neutral-900 border border-solid border-neutral-200 dark:border-neutral-800 rounded-3xl space-y-6 shadow-sm" id="payment-selection-panel">
                <div className="flex items-center gap-2 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-4">
                  <button
                    onClick={() => setStep(2)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl cursor-pointer border border-neutral-200 dark:border-neutral-800 active:scale-95 transition-all"
                    title="Back to Address Select page"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-sm font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                      Secured Payment Gateways (India)
                    </h3>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">
                      Select your preferred payment method with 256-bit PCI-DSS encryption
                    </p>
                  </div>
                </div>

                {/* 6 Horizontal Scrollable Payment Method Tabs with Visible Scrollbar & Quick Navigation */}
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
                      Payment Options (Scroll or use arrows to view all)
                    </span>
                    {/* Navigation arrow buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollTabs('left')}
                        className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                        title="Scroll Left"
                        aria-label="Scroll Payment Options Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollTabs('right')}
                        className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
                        title="Scroll Right"
                        aria-label="Scroll Payment Options Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={paymentTabsRef}
                    className="flex items-center gap-2.5 custom-horizontal-scrollbar whitespace-nowrap pb-3.5 scroll-smooth"
                  >
                    {[
                      { id: 'cod', label: 'Cash on Delivery', icon: <Banknote className="w-4 h-4" />, badge: 'Pay at Door', color: 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400' },
                      { id: 'card', label: 'Cards', icon: <CreditCard className="w-4 h-4" />, badge: 'Debit/Credit', color: 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                      { id: 'upi', label: 'UPI Instant', icon: <Smartphone className="w-4 h-4" />, badge: 'Zero Fee', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                      { id: 'netbanking', label: 'Net Banking', icon: <Landmark className="w-4 h-4" />, badge: '50+ Banks', color: 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                      { id: 'wallets', label: 'Wallets', icon: <Wallet className="w-4 h-4" />, badge: 'Cashback', color: 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
                      { id: 'emi', label: 'EMI / Pay Later', icon: <Clock className="w-4 h-4" />, badge: 'No Cost', color: 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
                    ].map((pay) => {
                      const isActive = paymentMethod === pay.id;
                      return (
                        <button
                          key={pay.id}
                          id={`pay-method-tab-${pay.id}`}
                          onClick={() => setPaymentMethod(pay.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-solid cursor-pointer select-none text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 shadow-xs ${
                            isActive
                              ? 'border-amber-500 bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md scale-[1.02]'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span className={isActive ? 'text-black' : 'text-neutral-500 dark:text-neutral-400'}>{pay.icon}</span>
                          <span>{pay.label}</span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            isActive ? 'bg-black/20 text-black' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                          }`}>
                            {pay.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* DYNAMIC PAYMENT FORM ACCORDING TO SELECTED TAB */}
                <div className="p-5 bg-neutral-50 dark:bg-neutral-950 border border-solid border-neutral-200 dark:border-neutral-800 rounded-2xl min-h-[220px]">
                  
                  {/* TAB 1: CASH ON DELIVERY */}
                  {paymentMethod === 'cod' && (
                    <div className="p-4 sm:p-6 animate-fade-in text-xs space-y-4 max-w-lg mx-auto">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/20">
                          <Banknote className="w-7 h-7" />
                        </div>
                        <h4 className="font-black text-neutral-900 dark:text-white text-base">
                          Cash & UPI on Delivery
                        </h4>
                        <p className="text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed max-w-md">
                          Pay cash in hand or simply scan your delivery executive's UPI QR code using any payment app (GPay, PhonePe, Paytm) upon parcel arrival.
                        </p>
                      </div>

                      {/* Attractive Features Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 font-black" />
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block text-[11px]">Pay at Doorstep</span>
                            <span className="text-[10px] text-neutral-500">Cash or UPI accepted</span>
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-2.5">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white block text-[11px]">Open Box Delivery</span>
                            <span className="text-[10px] text-neutral-500">Inspect before paying</span>
                          </div>
                        </div>
                      </div>

                      {/* Fee Alert */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-[11px]">
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5">
                          🏷️ COD Handling Fee:
                        </span>
                        <span className="font-black text-amber-600 dark:text-amber-400">
                          +₹50 Added
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CARDS (Credit & Debit) */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 animate-fade-in text-xs max-w-md mx-auto w-full">
                      <div className="flex justify-between items-center">
                        <span className="font-black uppercase text-[10px] tracking-wider text-[#0F1A3C] dark:text-[#F5A623]">
                          Credit or Debit Card
                        </span>
                        {/* Card Network Badges */}
                        <div className="flex items-center gap-1.5 opacity-80">
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-600 text-white rounded">VISA</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-orange-600 text-white rounded">MC</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-[#00A1E4] text-white rounded">RuPay</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-black bg-blue-800 text-white rounded">AMEX</span>
                        </div>
                      </div>

                      {/* Credit vs Debit Toggle */}
                      <div className="flex rounded-xl bg-neutral-200 dark:bg-neutral-900 p-1">
                        <button
                          type="button"
                          onClick={() => setCardType('credit')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            cardType === 'credit' ? 'bg-[#0F1A3C] text-white dark:bg-[#F5A623] dark:text-[#0F1A3C]' : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          Credit Card
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardType('debit')}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            cardType === 'debit' ? 'bg-[#0F1A3C] text-white dark:bg-[#F5A623] dark:text-[#0F1A3C]' : 'text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          Debit Card
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Card Number</label>
                          <input
                            id="card-number-input"
                            type="text"
                            maxLength={19}
                            required
                            placeholder="4532 •••• •••• 8920"
                            value={cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(val.replace(/(.{4})/g, '$1 ').trim());
                            }}
                            className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs font-mono tracking-widest text-[#0F1A3C] dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Cardholder Name</label>
                          <input
                            id="card-holder-input"
                            type="text"
                            required
                            placeholder="Name as printed on card"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs text-[#0F1A3C] dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Expiry Date</label>
                            <input
                              id="card-expiry-input"
                              type="text"
                              maxLength={5}
                              required
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                setCardExpiry(v);
                              }}
                              className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs font-mono text-center text-[#0F1A3C] dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">CVV Security</label>
                            <input
                              id="card-cvv-input"
                              type="password"
                              maxLength={4}
                              required
                              placeholder="123"
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                              className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs font-mono text-center tracking-widest text-[#0F1A3C] dark:text-white"
                            />
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="rounded text-[#F5A623] focus:ring-[#F5A623] accent-[#F5A623]"
                          />
                          <span className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                            Save this card securely for future faster checkouts
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: UPI (Instant Transfer / Scan & Pay) */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Sub-mode selector */}
                      <div className="flex gap-2 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('apps')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            upiSubMode === 'apps' ? 'bg-[#0F1A3C] text-[#F5A623]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                          }`}
                        >
                          Popular UPI Apps
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('vpa')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            upiSubMode === 'vpa' ? 'bg-[#0F1A3C] text-[#F5A623]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                          }`}
                        >
                          Enter UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiSubMode('qr')}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            upiSubMode === 'qr' ? 'bg-[#0F1A3C] text-[#F5A623]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" /> Scan & Pay
                        </button>
                      </div>

                      {upiSubMode === 'apps' && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-neutral-500 font-medium">
                            Select your preferred UPI app to launch directly or complete payment:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { id: 'gpay', label: 'Google Pay', color: 'border-blue-500/40 bg-blue-500/5' },
                              { id: 'phonepe', label: 'PhonePe', color: 'border-purple-500/40 bg-purple-500/5' },
                              { id: 'paytm', label: 'Paytm UPI', color: 'border-sky-500/40 bg-sky-500/5' },
                              { id: 'bhim', label: 'BHIM UPI', color: 'border-amber-500/40 bg-amber-500/5' },
                            ].map((app) => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setSelectedUpiApp(app.id as any)}
                                className={`p-3.5 rounded-2xl border border-solid flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                  selectedUpiApp === app.id
                                    ? 'border-[#F5A623] bg-[#F5A623]/20 shadow-md scale-[1.02]'
                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-[#F5A623]/50'
                                }`}
                              >
                                <Smartphone className="w-5 h-5 text-[#F5A623]" />
                                <span className="font-extrabold text-[11px] text-[#0F1A3C] dark:text-white">{app.label}</span>
                              </button>
                            ))}
                          </div>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                            ✓ 100% Zero Convene Fee Instant UPI Auto-Approval
                          </p>
                        </div>
                      )}

                      {upiSubMode === 'vpa' && (
                        <div className="space-y-3 max-w-sm">
                          <p className="text-[11px] text-neutral-500">Enter your Virtual Payment Address (VPA):</p>
                          <input
                            id="upi-address-input"
                            type="text"
                            required
                            placeholder="username@okhdfcbank or 9876543210@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 focus:border-[#F5A623] rounded-xl text-xs font-mono text-[#0F1A3C] dark:text-white focus:outline-none"
                          />
                          <p className="text-[10px] text-neutral-400">
                            Valid formats: mobile@upi, name@ybl, name@icici, user@okaxis.
                          </p>
                        </div>
                      )}

                      {upiSubMode === 'qr' && (
                        <div className="text-center py-3 space-y-3">
                          <div className="p-4 bg-white dark:bg-neutral-900 border-2 border-dashed border-[#F5A623] rounded-2xl max-w-[200px] mx-auto shadow-sm">
                            <QrCode className="w-32 h-32 text-[#0F1A3C] dark:text-[#F5A623] mx-auto" />
                            <span className="text-[9px] font-black text-[#0F1A3C] dark:text-white uppercase mt-2 block tracking-wider">
                              Scan with any UPI App
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                            Open Google Pay, PhonePe, Paytm, or BHIM and scan this QR code to complete payment instantly.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: NET BANKING */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <p className="text-[11px] text-neutral-500 font-medium">Select your preferred Indian bank for direct net banking:</p>
                      
                      {/* Popular Banks Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.id)}
                            className={`p-3 rounded-xl border border-solid flex items-center gap-3 cursor-pointer transition-all ${
                              selectedBank === b.id
                                ? 'border-[#F5A623] bg-[#F5A623]/20 text-[#0F1A3C] dark:text-[#F5A623] shadow-sm font-black'
                                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-[#F5A623]/50'
                            }`}
                          >
                            <Landmark className="w-4 h-4 text-[#F5A623] shrink-0" />
                            <span className="text-[11px] truncate font-bold">{b.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* All Other Banks Dropdown */}
                      <div className="pt-2">
                        <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">
                          Or Choose from All Other Banks:
                        </label>
                        <select
                          value={ALL_BANKS.includes(selectedBank) ? selectedBank : ''}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-[#F5A623] text-xs font-bold text-[#0F1A3C] dark:text-white"
                        >
                          <option value="" disabled>-- Select Other Indian Bank --</option>
                          {ALL_BANKS.map((bank) => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: WALLETS */}
                  {paymentMethod === 'wallets' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <p className="text-[11px] text-neutral-500 font-medium">Choose your digital wallet for rapid checkout:</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Alike Wallet */}
                        <div
                          onClick={() => setSelectedWallet('alike')}
                          className={`p-4 rounded-2xl border border-solid cursor-pointer transition-all ${
                            selectedWallet === 'alike'
                              ? 'border-[#F5A623] bg-[#F5A623]/15 shadow-sm'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-extrabold text-[#0F1A3C] dark:text-white flex items-center gap-1.5">
                              <Wallet className="w-4 h-4 text-[#F5A623]" /> Alike Digital Wallet
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#F5A623] text-[#0F1A3C]">
                              Primary
                            </span>
                          </div>
                          <div className="text-xl font-black text-[#0F1A3C] dark:text-white">
                            ₹{walletBalance.toLocaleString('en-IN')}
                          </div>
                          <p className="text-[10px] mt-1 font-medium">
                            {walletBalance >= totalAmount ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Sufficient Balance locked & ready</span>
                            ) : (
                              <span className="text-rose-500 font-bold">❌ Low balance. Please select another wallet or top up.</span>
                            )}
                          </p>
                        </div>

                        {/* Third party wallets */}
                        {[
                          { id: 'paytm', name: 'Paytm Wallet', desc: 'Link mobile number to deduct' },
                          { id: 'phonepe', name: 'PhonePe Wallet', desc: 'Direct PhonePe cashback balance' },
                          { id: 'amazonpay', name: 'Amazon Pay Balance', desc: 'Use Amazon gift card balance' },
                        ].map((w) => (
                          <div
                            key={w.id}
                            onClick={() => setSelectedWallet(w.id as any)}
                            className={`p-4 rounded-2xl border border-solid cursor-pointer transition-all ${
                              selectedWallet === w.id
                                ? 'border-[#F5A623] bg-[#F5A623]/15 shadow-sm'
                                : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                            }`}
                          >
                            <span className="font-extrabold text-[#0F1A3C] dark:text-white block mb-1">
                              {w.name}
                            </span>
                            <p className="text-[10px] text-neutral-500">{w.desc}</p>
                          </div>
                        ))}
                      </div>

                      {selectedWallet !== 'alike' && (
                        <div className="pt-2 max-w-xs">
                          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Linked Mobile Number</label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={walletPhone}
                            onChange={(e) => setWalletPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full p-2.5 bg-white dark:bg-neutral-900 border border-solid border-neutral-300 dark:border-neutral-800 rounded-xl focus:outline-none text-xs text-[#0F1A3C] dark:text-white font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: EMI & PAY LATER */}
                  {paymentMethod === 'emi' && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      {/* Sub Category Toggle */}
                      <div className="flex gap-2 border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3">
                        <button
                          type="button"
                          onClick={() => setEmiCategory('cc_emi')}
                          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                            emiCategory === 'cc_emi' ? 'bg-[#0F1A3C] text-[#F5A623]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                          }`}
                        >
                          Credit Card EMI
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmiCategory('paylater')}
                          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                            emiCategory === 'paylater' ? 'bg-[#0F1A3C] text-[#F5A623]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-white'
                          }`}
                        >
                          Buy Now Pay Later
                        </button>
                      </div>

                      {emiCategory === 'cc_emi' && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-solid border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                            <Sparkles className="w-4 h-4 shrink-0" />
                            <span>⚡ No-Cost EMI available on HDFC, ICICI, and SBI Credit Cards!</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'hdfc', label: 'HDFC Bank' },
                              { id: 'icici', label: 'ICICI Bank' },
                              { id: 'sbi', label: 'SBI Card' },
                              { id: 'axis', label: 'Axis Bank' },
                            ].map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setEmiBank(b.id as any)}
                                className={`p-2.5 rounded-xl border border-solid text-xs font-bold cursor-pointer ${
                                  emiBank === b.id
                                    ? 'border-[#F5A623] bg-[#F5A623]/20 text-[#0F1A3C] dark:text-[#F5A623]'
                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>

                          <p className="text-[10px] text-neutral-500 font-bold uppercase mt-2">Select Tenure Plan:</p>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { months: 3, rate: 'No-Cost EMI', perMonth: Math.round(totalAmount / 3) },
                              { months: 6, rate: '13% p.a.', perMonth: Math.round((totalAmount * 1.065) / 6) },
                              { months: 12, rate: '14% p.a.', perMonth: Math.round((totalAmount * 1.14) / 12) },
                            ].map((plan) => (
                              <button
                                key={plan.months}
                                type="button"
                                onClick={() => setEmiTenure(plan.months)}
                                className={`p-3 rounded-2xl border border-solid text-left cursor-pointer transition-all ${
                                  emiTenure === plan.months
                                    ? 'border-[#F5A623] bg-[#F5A623]/20 shadow-sm'
                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                                }`}
                              >
                                <span className="font-extrabold text-[#0F1A3C] dark:text-white block text-xs">
                                  {plan.months} Months
                                </span>
                                <span className="text-[11px] font-black text-[#F5A623] block my-0.5">
                                  ₹{plan.perMonth.toLocaleString('en-IN')}/mo
                                </span>
                                <span className="text-[9px] text-neutral-400 font-bold">{plan.rate}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {emiCategory === 'paylater' && (
                        <div className="space-y-3">
                          <p className="text-[11px] text-neutral-500">Pay after 15-30 days or split into 3 interest-free payments:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'simpl', name: 'Simpl Pay', detail: 'Pay in 3 equal monthly installments' },
                              { id: 'lazypay', name: 'LazyPay', detail: 'Pay full bill after 15 days without interest' },
                              { id: 'zestmoney', name: 'ZestMoney', detail: 'Instant pre-approved credit line' },
                            ].map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setPayLaterProvider(p.id as any)}
                                className={`p-3.5 rounded-2xl border border-solid text-left cursor-pointer transition-all ${
                                  payLaterProvider === p.id
                                    ? 'border-[#F5A623] bg-[#F5A623]/20 shadow-sm'
                                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                                }`}
                              >
                                <span className="font-extrabold text-[#0F1A3C] dark:text-white block text-xs mb-1">
                                  {p.name}
                                </span>
                                <span className="text-[10px] text-neutral-500 leading-tight block">{p.detail}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>

                {/* Trust & PCI Compliance Footer Note */}
                <div className="p-3 bg-[#F5A623]/10 border border-solid border-[#F5A623]/30 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#F5A623] shrink-0" />
                    <span className="text-[11px] font-bold text-[#0F1A3C] dark:text-neutral-200">
                      🔒 100% PCI-DSS Compliant & 256-Bit SSL Encrypted
                    </span>
                  </div>
                  <span className="text-[10px] text-[#F5A623] font-mono font-black uppercase hidden sm:inline-block">
                    Verified Gateway
                  </span>
                </div>

                <div className="border-t border-solid border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setStep(2)}
                    className="text-neutral-500 hover:text-[#0F1A3C] dark:hover:text-white uppercase font-bold tracking-wider cursor-pointer"
                  >
                    Select Address
                  </button>

                  {/* Updated High-Contrast Brand #0d0d0d Button */}
                  <button
                    id="place-order-submit-btn"
                    onClick={handlePlaceOrderSubmit}
                    disabled={paymentMethod === 'wallets' && selectedWallet === 'alike' && walletBalance < totalAmount}
                    className="px-8 py-3.5 bg-[#0d0d0d] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-[#0d0d0d]"
                  >
                    Place My Order (₹{totalAmount.toLocaleString('en-IN')})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel Order summary sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="p-6 bg-white dark:bg-neutral-900 border border-solid border-neutral-200 dark:border-neutral-800 rounded-3xl text-xs space-y-5 shadow-sm">
              <h3 className="font-black uppercase text-[11px] tracking-widest border-b border-solid border-neutral-200 dark:border-neutral-800 pb-3 text-[#0F1A3C] dark:text-white">
                Order Items ({activeCheckoutItems.length})
              </h3>

              {/* Items row displays */}
              <div className="max-h-[160px] overflow-y-auto space-y-3.5 pr-1">
                {activeCheckoutItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3 justify-between items-center">
                    <div className="flex gap-2.5 truncate min-w-0">
                      <img src={item.product.image} alt={item.product.name} className="w-9 h-9 rounded-xl object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div className="truncate min-w-0">
                        <h4 className="font-bold text-[#0F1A3C] dark:text-white truncate text-[11px] leading-tight">{item.product.name}</h4>
                        <span className="text-neutral-500 text-[10px]">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-[#0F1A3C] dark:text-white shrink-0">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Bill items */}
              <div className="space-y-2 pt-3 border-t border-solid border-neutral-200 dark:border-neutral-800 font-medium text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#0F1A3C] dark:text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>10% Promo Discount:</span>
                    <span>-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="text-[#0F1A3C] dark:text-white font-bold">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Courier:</span>
                  <span className="text-[#0F1A3C] dark:text-white font-bold">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between text-[#F5A623] font-bold">
                    <span>COD Convenience Fee:</span>
                    <span>₹{codFee}</span>
                  </div>
                )}
              </div>

              {/* Aggregates total with High Contrast dark navy / white label */}
              <div className="flex justify-between items-baseline pt-3 border-t-2 border-solid border-neutral-200 dark:border-neutral-800 uppercase font-black">
                <span className="text-[#0F1A3C] dark:text-white text-xs">Total Outlay:</span>
                <span className="text-xl text-[#0F1A3C] dark:text-[#F5A623] font-black">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="p-3 bg-[#F5A623]/10 border border-solid border-[#F5A623]/30 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#F5A623] shrink-0 mt-0.5" />
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  Secure encryptions safeguard each transit routing loop. Fully certified for Indian payment clearance.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

