import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Power,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Lock,
  User,
  Truck,
  CreditCard,
  FileText,
  Phone,
  Eye,
  EyeOff,
  ChevronRight,
  Loader2,
  Wifi,
  WifiOff,
  Bell,
  Navigation,
  Compass,
  ArrowRight,
  X,
  Sparkles,
  LogOut,
  Coffee,
  Check,
  Building2,
  DollarSign,
  Edit3,
  Package,
  Store,
  MessageSquare,
  Camera,
  QrCode,
  AlertOctagon,
  ExternalLink,
  Wallet,
  ShieldAlert,
  Award,
  Settings,
  HelpCircle
} from 'lucide-react';
import {
  deliveryPartnerApi,
  DeliveryPartnerProfile,
  IncomingOrderRequest,
} from '../services/deliveryPartnerApi';
import { DeliveryEarningsTab } from '../components/delivery/DeliveryEarningsTab';
import { DeliverySafetyTab } from '../components/delivery/DeliverySafetyTab';
import { DeliveryPerformanceTab } from '../components/delivery/DeliveryPerformanceTab';
import { DeliverySupportTab } from '../components/delivery/DeliverySupportTab';
import { DeliveryPrivacyTab } from '../components/delivery/DeliveryPrivacyTab';
import { EmergencySosModal } from '../components/delivery/EmergencySosModal';
import { OrderCancellationModal } from '../components/delivery/OrderCancellationModal';

interface DeliveryPartnerPortalProps {
  onNavigateHome: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliveryPartnerPortal: React.FC<DeliveryPartnerPortalProps> = ({
  onNavigateHome,
  showToast,
  isLightMode = false,
}) => {
  // Auth state
  const [partner, setPartner] = useState<DeliveryPartnerProfile | null>(() =>
    deliveryPartnerApi.getSavedProfile()
  );
  const [token, setToken] = useState<string | null>(() =>
    deliveryPartnerApi.getToken()
  );
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // Loading & Network state
  const [loading, setLoading] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);
  const [locationPermGranted, setLocationPermGranted] = useState(false);

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('9810122334');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Register Form State (Multi-step wizard)
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [regData, setRegData] = useState({
    name: 'Mohit Chauhan',
    phone: '9810122334',
    email: 'mohit.chauhan@alike.delivery',
    password: '',
    otp: '123456',
    city: 'New Delhi',
    operatingZone: 'South Delhi / Saket Hub',
    dob: '1996-08-15',
    bloodGroup: 'B+',
    address: 'H.No 42, Saket Extension, New Delhi',
    emergencyContactName: 'Rajesh Chauhan (Brother)',
    emergencyContactPhone: '9871255667',
    vehicleType: 'scooter' as 'bicycle' | 'ebike' | 'scooter' | 'motorcycle',
    vehicleModel: 'Hero Electric Optima CX',
    registrationNumber: 'DL 08 EF 4310',
    identityType: 'aadhaar' as 'aadhaar' | 'pan',
    identityNumber: '892144321098',
    drivingLicenseNumber: 'DL-1420180054321',
    drivingLicenseExpiry: '2034-05-20',
    accountHolderName: 'Mohit Chauhan',
    accountNumber: '501002348912',
    confirmAccountNumber: '501002348912',
    ifsc: 'HDFC0001234',
    bankName: 'HDFC Bank Saket Branch',
    upiId: 'mohit.chauhan@okhdfcbank',
  });

  // Online / Availability & Break state
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [breakModalOpen, setBreakModalOpen] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(30);

  // Incoming Order & Dispatch state
  const [incomingOrder, setIncomingOrder] = useState<IncomingOrderRequest | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const [acceptingOrder, setAcceptingOrder] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<any | null>(null);

  // Active Delivery Workflow State
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [verifyingPickup, setVerifyingPickup] = useState(false);
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [verifyingDeliveryOtp, setVerifyingDeliveryOtp] = useState(false);
  const [confirmingArrival, setConfirmingArrival] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState<'store' | 'customer'>('store');
  const [issueType, setIssueType] = useState('store_delay');
  const [issueDelayMinutes, setIssueDelayMinutes] = useState(10);
  const [issueDetails, setIssueDetails] = useState('');
  const [reportingIssue, setReportingIssue] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'partner' | 'customer'; text: string; time: string }>>([
    { id: '1', sender: 'customer', text: 'Hi! Please ring the doorbell upon arrival at Flat 402.', time: 'Just now' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [deliverySuccessModalOpen, setDeliverySuccessModalOpen] = useState(false);
  const [lastCompletedDelivery, setLastCompletedDelivery] = useState<any | null>(null);

  // Profile Update & Security Modal State
  const [profileEditModalOpen, setProfileEditModalOpen] = useState(false);
  const [editOperatingZone, setEditOperatingZone] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editUpiId, setEditUpiId] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Synthesized notification chime for incoming orders
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1320, now + 0.15);
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.6);
    } catch {
      // Audio playback may be restricted before interaction
    }
  };

  // Active Tab inside Portal (Module 1F & 1G)
  const [activeTab, setActiveTab] = useState<
    'duty' | 'earnings' | 'safety' | 'performance' | 'support' | 'profile'
  >('duty');

  // Emergency SOS & Cancellation Modals
  const [globalSosOpen, setGlobalSosOpen] = useState<boolean>(false);
  const [cancellationModalOpen, setCancellationModalOpen] = useState<boolean>(false);

  // Network recovery listener
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOnline(true);
      showToast?.('Internet connection restored.', 'success');
    };
    const handleOffline = () => {
      setIsNetworkOnline(false);
      showToast?.('Internet connection lost. Pausing order dispatch.', 'warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Load Partner Profile on mount if token exists
  useEffect(() => {
    if (token) {
      deliveryPartnerApi
        .getProfile()
        .then((p) => setPartner(p))
        .catch((err) => {
          console.warn('Failed to load profile on mount:', err);
          if (err.message.includes('expired') || err.message.includes('token')) {
            deliveryPartnerApi.logout();
            setToken(null);
            setPartner(null);
          }
        });
    }
  }, [token]);

  // Periodic heartbeat & Incoming order polling when online
  useEffect(() => {
    if (!token || !partner || !partner.isOnline || partner.isOnBreak) {
      setIncomingOrder(null);
      return;
    }

    // Attempt GPS update
    if (navigator.geolocation && !locationPermGranted) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationPermGranted(true);
          deliveryPartnerApi.updateLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.heading || 0,
            pos.coords.accuracy || 10
          );
        },
        () => {
          // Fallback to default hub coordinates if denied
          setLocationPermGranted(false);
        }
      );
    }

    const interval = setInterval(async () => {
      try {
        const res = await deliveryPartnerApi.getIncomingOrders();
        if (res.activeDelivery) {
          setActiveDelivery(res.activeDelivery);
          setIncomingOrder(null);
        } else if (res.incomingOrder && !activeDelivery) {
          setIncomingOrder((prev) => {
            if (!prev || prev.requestId !== res.incomingOrder.requestId) {
              playOrderChime();
            }
            return res.incomingOrder;
          });
        }
      } catch (err) {
        console.warn('Incoming orders poll error:', err);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [token, partner, locationPermGranted, activeDelivery]);

  // Countdown timer for incoming order request
  useEffect(() => {
    if (!incomingOrder) {
      setCountdownSeconds(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-reject / pass on timeout
          deliveryPartnerApi.rejectOrder(incomingOrder.requestId, 'Timer expired');
          setIncomingOrder(null);
          showToast?.('Order request expired and reassigned.', 'info');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [incomingOrder, showToast]);

  // Handle Login OTP request
  const handleSendLoginOtp = async () => {
    if (!loginPhone || loginPhone.length < 10) {
      showToast?.('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await deliveryPartnerApi.sendLoginOtp(loginPhone);
      setOtpSent(true);
      setOtpCountdown(60);
      setLoginOtp(res.demoOtp || '123456');
      showToast?.(res.message || 'OTP sent successfully (Use 123456 in dev)', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Verify
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (loginMethod === 'otp') {
        res = await deliveryPartnerApi.verifyLoginOtp(loginPhone, loginOtp);
      } else {
        res = await deliveryPartnerApi.loginWithPassword(loginPhone, loginPassword);
      }
      setToken(res.token);
      setPartner(res.partner);
      showToast?.(res.message || `Welcome back, ${res.partner.name}!`, 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async () => {
    if (regData.accountNumber !== regData.confirmAccountNumber) {
      showToast?.('Bank account numbers do not match.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: regData.name,
        phone: regData.phone,
        email: regData.email,
        password: regData.password,
        otp: regData.otp,
        city: regData.city,
        operatingZone: regData.operatingZone,
        dob: regData.dob,
        bloodGroup: regData.bloodGroup,
        address: regData.address,
        emergencyContact: {
          name: regData.emergencyContactName,
          phone: regData.emergencyContactPhone,
        },
        vehicle: {
          type: regData.vehicleType,
          model: regData.vehicleModel,
          registrationNumber: regData.registrationNumber,
        },
        identity: {
          type: regData.identityType,
          number: regData.identityNumber,
          drivingLicenseNumber: regData.drivingLicenseNumber,
          drivingLicenseExpiry: regData.drivingLicenseExpiry,
        },
        payout: {
          accountHolderName: regData.accountHolderName,
          accountNumber: regData.accountNumber,
          ifsc: regData.ifsc,
          bankName: regData.bankName,
          upiId: regData.upiId,
        },
      };

      const res = await deliveryPartnerApi.registerPartner(payload);
      setToken(res.token);
      setPartner(res.partner);
      showToast?.('Application submitted! Your account is under verification.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to submit registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    if (!partner) return;
    setTogglingOnline(true);
    try {
      const newStatus = !partner.isOnline;
      const res = await deliveryPartnerApi.setAvailability(newStatus);
      setPartner((prev) => (prev ? { ...prev, isOnline: res.isOnline } : null));
      showToast?.(res.message, res.isOnline ? 'success' : 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to toggle status', 'error');
    } finally {
      setTogglingOnline(false);
    }
  };

  // Fast-track demo approval for evaluation
  const handleFastTrackApproval = async () => {
    setLoading(true);
    try {
      const res = await deliveryPartnerApi.adminFastTrackDemo();
      setPartner(res.partner);
      showToast?.('Partner account approved! You can now go online.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Fast-track failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Accept incoming order
  const handleAcceptOrder = async () => {
    if (!incomingOrder) return;
    setAcceptingOrder(true);
    try {
      const res = await deliveryPartnerApi.acceptOrder(incomingOrder.requestId);
      showToast?.('Order accepted! Proceed to store for pickup verification.', 'success');
      const task = res.task || {
        taskId: incomingOrder.requestId,
        store: { name: incomingOrder.storeName, address: incomingOrder.storeAddress, phone: '+91 9811002233' },
        deliveryAddress: { street: incomingOrder.customerAddress, name: incomingOrder.customerName, phone: '+91 9811223344' },
        itemsSummary: incomingOrder.itemsSummary,
        itemCount: incomingOrder.itemCount,
        status: 'partner_assigned',
        totalPayout: incomingOrder.totalPayout,
        pickupCode: 'PU-8291',
        deliveryOtp: '4921',
      };
      setActiveDelivery(task);
      setPickupCodeInput('');
      setDeliveryOtpInput('');
      setIncomingOrder(null);
    } catch (err: any) {
      showToast?.(err.message || 'Failed to accept order', 'error');
    } finally {
      setAcceptingOrder(false);
    }
  };

  // 1. Confirm Arrival at Store
  const handleArrivedAtStore = async () => {
    if (!activeDelivery) return;
    setConfirmingArrival(true);
    try {
      await deliveryPartnerApi.confirmArrivalAtStore(activeDelivery.taskId);
      setActiveDelivery((prev: any) => ({ ...prev, status: 'arrived_at_store' }));
      showToast?.('Arrived at store counter. Please verify Pickup Code with store staff.', 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to confirm arrival', 'error');
    } finally {
      setConfirmingArrival(false);
    }
  };

  // 2. Mandatory Store Pickup Verification
  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !pickupCodeInput.trim()) {
      showToast?.('Please enter the store pickup code.', 'error');
      return;
    }
    setVerifyingPickup(true);
    try {
      await deliveryPartnerApi.verifyPickup(activeDelivery.taskId, pickupCodeInput.trim());
      setActiveDelivery((prev: any) => ({
        ...prev,
        status: 'out_for_delivery',
        pickupVerified: true,
      }));
      showToast?.('Pickup code verified! Package handed over. Proceed to customer.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Incorrect pickup code', 'error');
    } finally {
      setVerifyingPickup(false);
    }
  };

  // 3. Confirm Arrival at Customer Doorstep
  const handleArrivedAtCustomer = async () => {
    if (!activeDelivery) return;
    setConfirmingArrival(true);
    try {
      await deliveryPartnerApi.confirmArrivalAtCustomer(activeDelivery.taskId);
      setActiveDelivery((prev: any) => ({ ...prev, status: 'arrived_at_customer' }));
      showToast?.('Arrived at doorstep. Ask customer for 4-digit Delivery OTP.', 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to confirm arrival', 'error');
    } finally {
      setConfirmingArrival(false);
    }
  };

  // 4. Mandatory Customer Delivery OTP Verification
  const handleVerifyDeliveryOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery || !deliveryOtpInput.trim()) {
      showToast?.('Please enter the 4-digit customer delivery OTP.', 'error');
      return;
    }
    setVerifyingDeliveryOtp(true);
    try {
      const res = await deliveryPartnerApi.verifyDeliveryOtp(activeDelivery.taskId, deliveryOtpInput.trim());
      setLastCompletedDelivery(activeDelivery);
      setDeliverySuccessModalOpen(true);
      if (res.partner) {
        setPartner(res.partner);
      } else {
        setPartner((prev) => (prev ? {
          ...prev,
          totalDeliveries: (prev.totalDeliveries || 0) + 1,
          earningsToday: (prev.earningsToday || 0) + (activeDelivery.totalPayout || 90),
        } : null));
      }
      setActiveDelivery(null);
      setDeliveryOtpInput('');
      setPickupCodeInput('');
      showToast?.(res.message || 'Delivery verified and completed!', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Incorrect delivery OTP', 'error');
    } finally {
      setVerifyingDeliveryOtp(false);
    }
  };

  // 5. Report Issue / Problem
  const handleOpenIssueModal = (category: 'store' | 'customer') => {
    setIssueCategory(category);
    setIssueType(category === 'store' ? 'store_delay' : 'customer_unreachable');
    setIssueDelayMinutes(10);
    setIssueDetails('');
    setIssueModalOpen(true);
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDelivery) return;
    setReportingIssue(true);
    try {
      if (issueCategory === 'store') {
        await deliveryPartnerApi.reportPickupIssue(
          activeDelivery.taskId,
          issueType,
          issueDelayMinutes,
          issueDetails
        );
        showToast?.('Store issue reported. Support and dispatch alerted.', 'info');
      } else {
        await deliveryPartnerApi.reportFailedDelivery(
          activeDelivery.taskId,
          issueType,
          issueDetails
        );
        setActiveDelivery((prev: any) => ({
          ...prev,
          status: 'return_initiated',
          failureReason: issueType,
        }));
        showToast?.('Delivery flagged as failed. Please return package to store.', 'warning');
      }
      setIssueModalOpen(false);
    } catch (err: any) {
      showToast?.(err.message || 'Failed to submit report', 'error');
    } finally {
      setReportingIssue(false);
    }
  };

  // 6. Confirm Return to Store
  const handleConfirmReturnToStore = async () => {
    if (!activeDelivery) return;
    try {
      await deliveryPartnerApi.confirmReturnToStore(activeDelivery.taskId);
      showToast?.('Package safely returned to merchant. Return verified.', 'success');
      setActiveDelivery(null);
    } catch (err: any) {
      showToast?.(err.message || 'Failed to confirm return', 'error');
    }
  };

  // 7. In-App Customer Chat
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: 'partner' as const,
      text: chatInput.trim(),
      time: 'Just now',
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'customer',
          text: 'Thank you! I have my Delivery OTP ready on my phone.',
          time: 'Just now',
        },
      ]);
    }, 1500);
  };

  // Decline incoming order
  const handleDeclineOrder = async () => {
    if (!incomingOrder) return;
    try {
      await deliveryPartnerApi.rejectOrder(incomingOrder.requestId, 'Declined by partner');
      setIncomingOrder(null);
      showToast?.('Order declined.', 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to decline order', 'error');
    }
  };

  // Take a break
  const handleConfirmBreak = async () => {
    try {
      const res = await deliveryPartnerApi.takeBreak(breakMinutes);
      setPartner((prev) =>
        prev ? { ...prev, isOnBreak: true, breakUntil: res.breakUntil } : null
      );
      setBreakModalOpen(false);
      showToast?.(res.message, 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to take break', 'error');
    }
  };

  // Logout
  const handleLogout = () => {
    deliveryPartnerApi.logout();
    setPartner(null);
    setToken(null);
    showToast?.('Logged out from delivery partner portal.', 'info');
  };

  // Open Profile & Security Edit Modal
  const handleOpenEditModal = () => {
    if (!partner) return;
    setEditOperatingZone(partner.operatingZone || '');
    setEditEmergencyName(partner.emergencyContact?.name || '');
    setEditEmergencyPhone(partner.emergencyContact?.phone || '');
    setEditUpiId(partner.payout?.upiId || '');
    setEditNewPassword('');
    setProfileEditModalOpen(true);
  };

  // Save Profile & Security Updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload: any = {
        operatingZone: editOperatingZone,
        emergencyContact: {
          name: editEmergencyName,
          phone: editEmergencyPhone,
        },
        upiId: editUpiId,
      };
      if (editNewPassword.trim()) {
        payload.newPassword = editNewPassword.trim();
      }
      const res = await deliveryPartnerApi.updateProfile(payload);
      setPartner(res.partner);
      setProfileEditModalOpen(false);
      showToast?.('Profile details and security credentials updated.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isLightMode ? 'bg-neutral-50 text-neutral-900' : 'bg-neutral-950 text-neutral-100'
    }`}>
      {/* 1. Header Bar */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 py-3 flex items-center justify-between ${
        isLightMode ? 'bg-white/90 border-neutral-200' : 'bg-neutral-900/90 border-neutral-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-black font-black shadow-md shadow-amber-500/20">
            <Zap className="w-5 h-5 fill-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs uppercase font-black tracking-widest text-amber-500">ALIKE ND</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black uppercase bg-amber-500/20 text-amber-400">
                Partner App
              </span>
            </div>
            <h1 className="text-sm font-bold tracking-tight">Delivery Partner Portal</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Emergency SOS Quick Trigger in Header */}
          {partner && (
            <button
              type="button"
              onClick={() => setGlobalSosOpen(true)}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-rose-600/30 cursor-pointer animate-pulse transition-all"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SOS</span>
            </button>
          )}

          {/* Network status badge */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isNetworkOnline
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
          }`}>
            {isNetworkOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isNetworkOnline ? 'Connected' : 'Offline'}</span>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isLightMode
                ? 'border-neutral-300 hover:bg-neutral-100'
                : 'border-neutral-700 hover:bg-neutral-800'
            }`}
          >
            Storefront
          </button>
        </div>
      </header>

      {/* Primary Tab Navigation for Logged-In Partner */}
      {partner && (
        <nav className={`border-b sticky top-14 z-20 backdrop-blur-md ${
          isLightMode ? 'bg-white/95 border-neutral-200' : 'bg-neutral-950/90 border-neutral-800'
        }`}>
          <div className="max-w-4xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none text-xs font-bold">
            {[
              { id: 'duty', label: 'Duty Console', icon: Zap },
              { id: 'earnings', label: 'Earnings & Payouts', icon: Wallet },
              { id: 'safety', label: 'Safety & SOS', icon: ShieldAlert },
              { id: 'performance', label: 'Performance & Reviews', icon: Award },
              { id: 'support', label: 'Support & Notices', icon: Bell },
              { id: 'profile', label: 'Profile & Privacy', icon: Lock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF007F] text-white shadow-md shadow-[#FF007F]/20'
                      : isLightMode
                      ? 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Network Offline Alert */}
      {!isNetworkOnline && (
        <div className="bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>No internet connection. Order requests paused until network is restored.</span>
        </div>
      )}

      {/* 2. Main Portal Container */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* ============================================================ */}
        {/* VIEW A: NOT LOGGED IN — LOGIN OR REGISTRATION WIZARD        */}
        {/* ============================================================ */}
        {!partner ? (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Mode Switcher */}
            <div className={`p-1 rounded-xl flex border ${
              isLightMode ? 'bg-neutral-200 border-neutral-300' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authView === 'login'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Delivery Partner Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  authView === 'register'
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Join as Partner (Register)
              </button>
            </div>

            {/* --- SIGN IN SUB-VIEW --- */}
            {authView === 'login' && (
              <div className={`p-6 rounded-2xl border space-y-5 shadow-xl ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div>
                  <h2 className="text-lg font-black tracking-tight">Partner Login</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Enter your registered mobile number to access your delivery dashboard.
                  </p>
                </div>

                {/* Login Method Toggle */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      loginMethod === 'otp'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-neutral-700 text-neutral-400'
                    }`}
                  >
                    Quick OTP Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      loginMethod === 'password'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-neutral-700 text-neutral-400'
                    }`}
                  >
                    Password Login
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-neutral-400">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-neutral-400">+91</span>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className={`w-full pl-12 pr-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:border-amber-500 transition-colors ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {loginMethod === 'otp' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-neutral-400">
                          6-Digit Verification OTP
                        </label>
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={loading}
                          className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                        >
                          {otpSent ? 'Resend OTP' : 'Send OTP'}
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none tracking-widest text-center focus:border-amber-500 transition-colors ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                        required
                      />
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Development verification mock: Use <span className="font-bold text-amber-400">123456</span>.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold mb-1.5 text-neutral-400">
                        Account Password
                      </label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your partner password"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold border outline-none focus:border-amber-500 transition-colors ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                        required
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    <span>Sign In to Delivery Dashboard</span>
                  </button>
                </form>

                {/* Demo Quick Fill */}
                <div className="pt-2 border-t border-neutral-800 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginPhone('9810122334');
                      setLoginOtp('123456');
                      setLoginMethod('otp');
                      showToast?.('Demo partner credentials filled! Tap Sign In.', 'info');
                    }}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
                  >
                    ⚡ Quick-Fill Verified Demo Partner (Mohit Chauhan)
                  </button>
                </div>
              </div>
            )}

            {/* --- REGISTRATION WIZARD --- */}
            {authView === 'register' && (
              <div className={`p-6 rounded-2xl border space-y-6 shadow-xl ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black uppercase text-amber-500">Step {regStep} of 5</span>
                    <span className="text-xs text-neutral-400 font-bold">Partner Onboarding</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${(regStep / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step 1: Personal & Phone */}
                {regStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-500" />
                      <span>Personal Information & Mobile</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Full Name</label>
                      <input
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        placeholder="As shown on identity proof"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Mobile Number</label>
                      <input
                        type="tel"
                        value={regData.phone}
                        onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                        placeholder="10-digit mobile number"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">City</label>
                        <input
                          type="text"
                          value={regData.city}
                          onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">Operating Zone</label>
                        <input
                          type="text"
                          value={regData.operatingZone}
                          onChange={(e) => setRegData({ ...regData, operatingZone: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">Emergency Contact</label>
                        <input
                          type="text"
                          value={regData.emergencyContactName}
                          onChange={(e) => setRegData({ ...regData, emergencyContactName: e.target.value })}
                          placeholder="Name & relation"
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">Emergency Phone</label>
                        <input
                          type="tel"
                          value={regData.emergencyContactPhone}
                          onChange={(e) => setRegData({ ...regData, emergencyContactPhone: e.target.value })}
                          placeholder="Phone number"
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-full mt-2 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      Continue to Vehicle Details &rarr;
                    </button>
                  </div>
                )}

                {/* Step 2: Vehicle Selection */}
                {regStep === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500" />
                      <span>Vehicle & Fleet Category</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Vehicle Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { type: 'scooter', label: 'Scooter / Activa', note: 'DL Required' },
                          { type: 'motorcycle', label: 'Motorcycle / Bike', note: 'DL Required' },
                          { type: 'ebike', label: 'Electric Bike / EV', note: 'Eco Friendly' },
                          { type: 'bicycle', label: 'Bicycle / Cycle', note: 'No DL Required' },
                        ].map((v) => (
                          <button
                            key={v.type}
                            type="button"
                            onClick={() => setRegData({ ...regData, vehicleType: v.type as any })}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              regData.vehicleType === v.type
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-neutral-700 hover:border-neutral-600'
                            }`}
                          >
                            <span className="block text-xs font-black">{v.label}</span>
                            <span className="text-[10px] text-neutral-400">{v.note}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Vehicle Model / Name</label>
                      <input
                        type="text"
                        value={regData.vehicleModel}
                        onChange={(e) => setRegData({ ...regData, vehicleModel: e.target.value })}
                        placeholder="e.g. Honda Activa 6G / Hero Electric"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">
                        Registration Plate Number (RC)
                      </label>
                      <input
                        type="text"
                        value={regData.registrationNumber}
                        onChange={(e) => setRegData({ ...regData, registrationNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. DL 08 EF 4310"
                        className={`w-full px-3.5 py-2 rounded-xl text-sm uppercase font-mono border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(1)}
                        className="py-2.5 px-4 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(3)}
                        className="flex-1 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        Continue to Identity Proof &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Identity & Driving Licence */}
                {regStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Identity Verification & Driving Licence</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Document Type</label>
                      <div className="flex gap-2">
                        {(['aadhaar', 'pan'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setRegData({ ...regData, identityType: t })}
                            className={`flex-1 py-2 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                              regData.identityType === t
                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                : 'border-neutral-700 text-neutral-400'
                            }`}
                          >
                            {t} Card
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">
                        {regData.identityType.toUpperCase()} Number
                      </label>
                      <input
                        type="text"
                        value={regData.identityNumber}
                        onChange={(e) => setRegData({ ...regData, identityNumber: e.target.value })}
                        placeholder={regData.identityType === 'aadhaar' ? '12-digit Aadhaar' : '10-digit PAN'}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                      <p className="text-[10px] text-neutral-500 mt-1">
                        🔒 Stored securely with end-to-end masking (only last 4 digits visible).
                      </p>
                    </div>

                    {regData.vehicleType !== 'bicycle' && (
                      <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/50 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Driving Licence Details</span>
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1 text-neutral-400">DL Number</label>
                          <input
                            type="text"
                            value={regData.drivingLicenseNumber}
                            onChange={(e) => setRegData({ ...regData, drivingLicenseNumber: e.target.value.toUpperCase() })}
                            placeholder="e.g. DL-1420180054321"
                            className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border outline-none ${
                              isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold mb-1 text-neutral-400">DL Expiry Date</label>
                          <input
                            type="date"
                            value={regData.drivingLicenseExpiry}
                            onChange={(e) => setRegData({ ...regData, drivingLicenseExpiry: e.target.value })}
                            className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                              isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(2)}
                        className="py-2.5 px-4 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(4)}
                        className="flex-1 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        Continue to Bank & UPI &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Bank Account & UPI */}
                {regStep === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      <span>Bank Payout Details & UPI</span>
                    </h3>

                    <div>
                      <label className="block text-xs font-bold mb-1 text-neutral-400">Account Holder Name</label>
                      <input
                        type="text"
                        value={regData.accountHolderName}
                        onChange={(e) => setRegData({ ...regData, accountHolderName: e.target.value })}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">Account Number</label>
                        <input
                          type="password"
                          value={regData.accountNumber}
                          onChange={(e) => setRegData({ ...regData, accountNumber: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">Confirm Account</label>
                        <input
                          type="text"
                          value={regData.confirmAccountNumber}
                          onChange={(e) => setRegData({ ...regData, confirmAccountNumber: e.target.value })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">IFSC Code</label>
                        <input
                          type="text"
                          value={regData.ifsc}
                          onChange={(e) => setRegData({ ...regData, ifsc: e.target.value.toUpperCase() })}
                          className={`w-full px-3.5 py-2 rounded-xl text-sm uppercase font-mono border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1 text-neutral-400">UPI ID for Daily Payout</label>
                        <input
                          type="text"
                          value={regData.upiId}
                          onChange={(e) => setRegData({ ...regData, upiId: e.target.value })}
                          placeholder="e.g. mobile@paytm"
                          className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                            isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-800 border-neutral-700'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(3)}
                        className="py-2.5 px-4 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegStep(5)}
                        className="flex-1 py-2.5 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        Review Application &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Summary & Submit */}
                {regStep === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Review & Submit Application</span>
                    </h3>

                    <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Partner Name:</span>
                        <span className="font-bold">{regData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Mobile:</span>
                        <span className="font-bold">+91 {regData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Vehicle:</span>
                        <span className="font-bold capitalize">{regData.vehicleType} ({regData.vehicleModel})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Identity:</span>
                        <span className="font-bold capitalize">{regData.identityType} (Verified via OTP)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Payout Account:</span>
                        <span className="font-mono">••••••••{regData.accountNumber.slice(-4)} ({regData.ifsc})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">UPI ID:</span>
                        <span className="font-bold">{regData.upiId}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      By submitting, you agree to ALIKE ND Partner Terms & Code of Conduct. Your account will undergo background verification by our operations team before activation.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep(4)}
                        className="py-2.5 px-4 rounded-xl border border-neutral-700 text-xs font-bold cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleRegisterSubmit}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        <span>Submit Partner Application</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW B: LOGGED IN — ACTIVE PARTNER DASHBOARD & AVAILABILITY   */
          /* ============================================================ */
          <div className="space-y-6">
            {/* 1. Status Banner: Pending Verification Notification */}
            {partner.status === 'pending_approval' && (
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-amber-400">Application Under Verification</h4>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                      Your identity documents and vehicle credentials are being verified by ALIKE Operations. You will be able to toggle Online once approved.
                    </p>
                  </div>
                </div>

                {/* Demo Evaluation Instant-Approve Shortcut */}
                <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-300/80">
                    Testing Mode: Instant review simulation available.
                  </span>
                  <button
                    type="button"
                    onClick={handleFastTrackApproval}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-black tracking-wide hover:bg-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>⚡ Test Instant Approval (Fast-Track)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Primary Duty & Availability Card (Tab: Duty Console) */}
            {activeTab === 'duty' && (
              <>
                <div className={`p-6 rounded-2xl border shadow-xl ${
                  isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
                }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Partner Profile Badge */}
                <div className="flex items-center gap-3">
                  <img
                    src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                    alt={partner.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black">{partner.name}</h2>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{partner.rating.toFixed(1)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      ID: {partner.partnerId} • {partner.operatingZone}
                    </p>
                  </div>
                </div>

                {/* Big Go Online / Go Offline Toggle Switch */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {partner.isOnline && (
                    <button
                      type="button"
                      onClick={() => setBreakModalOpen(true)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        partner.isOnBreak
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : isLightMode
                          ? 'border-neutral-300 hover:bg-neutral-100'
                          : 'border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      <Coffee className="w-4 h-4" />
                      <span>{partner.isOnBreak ? 'On Break' : 'Take Break'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleToggleOnline}
                    disabled={togglingOnline || partner.status !== 'approved'}
                    className={`px-5 py-3 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                      partner.isOnline
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/25 ring-4 ring-emerald-500/20'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
                    }`}
                  >
                    <Power className={`w-4 h-4 ${partner.isOnline ? 'animate-pulse' : ''}`} />
                    <span>{partner.isOnline ? 'ONLINE' : 'GO ONLINE'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Status Strip */}
              <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    partner.isOnline
                      ? partner.isOnBreak
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-emerald-400 animate-ping'
                      : 'bg-neutral-500'
                  }`} />
                  <span className="font-bold text-neutral-300">
                    Status:{' '}
                    {partner.isOnline
                      ? partner.isOnBreak
                        ? 'Temporarily Paused (On Break)'
                        : 'Active — Searching for nearby store orders'
                      : 'Offline — Toggle Online to receive orders'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  <span>GPS Tracking: {locationPermGranted ? 'Live GPS Active' : 'Metro Hub Simulated'}</span>
                </div>
              </div>
            </div>

            {/* 3. Live Incoming Order Request Card with 30s Countdown */}
            {incomingOrder && (
              <div className="p-6 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 via-neutral-900 to-neutral-900 shadow-2xl space-y-4 animate-bounce-short">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="text-xs uppercase font-black tracking-widest text-amber-400">
                      NEW DELIVERY REQUEST
                    </span>
                  </div>

                  {/* Circular / Pill Countdown Display */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-amber-500/40 text-amber-400 font-mono font-black text-sm">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>{countdownSeconds}s</span>
                  </div>
                </div>

                {/* Progress bar of countdown */}
                <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdownSeconds / 30) * 100}%` }}
                  />
                </div>

                {/* Payout Banner */}
                <div className="flex items-baseline justify-between p-3 rounded-xl bg-black/30 border border-neutral-800">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-semibold block">Estimated Payout</span>
                    <span className="text-2xl font-black text-emerald-400">₹{incomingOrder.totalPayout}</span>
                    <span className="text-[10px] text-amber-400 ml-1.5 font-bold">
                      (Includes ₹{incomingOrder.surgeBonus} Peak Bonus)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-neutral-400 font-semibold block">Distance</span>
                    <span className="text-sm font-black">{incomingOrder.totalDistanceKm} km total</span>
                  </div>
                </div>

                {/* Store Pickup & Customer Drop Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      P
                    </div>
                    <div>
                      <span className="font-bold block text-neutral-200">Pickup: {incomingOrder.storeName}</span>
                      <span className="text-neutral-400">{incomingOrder.storeAddress} ({incomingOrder.storeDistanceKm} km away)</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      D
                    </div>
                    <div>
                      <span className="font-bold block text-neutral-200">Delivery: {incomingOrder.customerName}</span>
                      <span className="text-neutral-400">{incomingOrder.customerAddress} ({incomingOrder.customerDistanceKm} km from store)</span>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-2.5 rounded-lg bg-neutral-800/60 text-[11px] text-neutral-300">
                  <span className="font-bold text-neutral-400 block mb-0.5">Items ({incomingOrder.itemCount}):</span>
                  <span>{incomingOrder.itemsSummary}</span>
                </div>

                {/* Actions: Accept or Decline */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleDeclineOrder}
                    className="flex-1 py-3 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={acceptingOrder}
                    onClick={handleAcceptOrder}
                    className="flex-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm tracking-wide shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {acceptingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    <span>Accept Order Request</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Active Delivery Task In-Flight Card (Multi-Stage Lifecycle) */}
            {activeDelivery && (
              <div className="p-5 sm:p-6 rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-neutral-900 to-neutral-950 space-y-5 shadow-2xl animate-fade-in">
                {/* Header with Status Pill and Payout */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-800">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                        ACTIVE TASK #{activeDelivery.taskId}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-white">
                        {activeDelivery.status === 'partner_assigned' && 'Step 1: Proceed to Pickup Store'}
                        {activeDelivery.status === 'arrived_at_store' && 'Step 2: Verify Store Pickup Code'}
                        {(activeDelivery.status === 'out_for_delivery' || activeDelivery.status === 'picked_up') && 'Step 3: Head to Customer Address'}
                        {activeDelivery.status === 'arrived_at_customer' && 'Step 4: Verify Doorstep Delivery OTP'}
                        {activeDelivery.status === 'return_initiated' && 'Return Package to Merchant'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-xs">
                      Payout: ₹{activeDelivery.totalPayout || 90}
                    </span>
                  </div>
                </div>

                {/* Lifecycle Progress Pipeline */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
                  <div className={`p-2 rounded-xl border ${
                    activeDelivery.status === 'partner_assigned'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  }`}>
                    1. Accept
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    activeDelivery.status === 'arrived_at_store'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 animate-pulse'
                      : activeDelivery.status === 'out_for_delivery' || activeDelivery.status === 'arrived_at_customer' || activeDelivery.status === 'delivered'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                  }`}>
                    2. Pickup Code
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    activeDelivery.status === 'out_for_delivery'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 animate-pulse'
                      : activeDelivery.status === 'arrived_at_customer' || activeDelivery.status === 'delivered'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                  }`}>
                    3. En Route
                  </div>
                  <div className={`p-2 rounded-xl border ${
                    activeDelivery.status === 'arrived_at_customer'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300 animate-pulse'
                      : activeDelivery.status === 'delivered'
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-500'
                  }`}>
                    4. Delivery OTP
                  </div>
                </div>

                {/* STAGE A: Store Pickup Mode (partner_assigned OR arrived_at_store) */}
                {(activeDelivery.status === 'partner_assigned' || activeDelivery.status === 'arrived_at_store') && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-black text-amber-400">Pickup Counter</span>
                            <h4 className="font-bold text-sm text-neutral-100">{activeDelivery.store?.name}</h4>
                            <p className="text-neutral-400 mt-0.5">{activeDelivery.store?.address}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 shrink-0">
                          Ready for Pickup
                        </span>
                      </div>

                      {/* Store Quick Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                        <a
                          href={`tel:${activeDelivery.store?.phone || '+919811002233'}`}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <span>Call Store</span>
                        </a>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.store?.address || 'Saket New Delhi')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Navigate</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenIssueModal('store')}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Report Delay</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancellationModalOpen(true)}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    {/* Items in Package */}
                    <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                        Package Contents ({activeDelivery.itemCount || 3} items):
                      </span>
                      <p className="text-neutral-200 font-medium">{activeDelivery.itemsSummary}</p>
                    </div>

                    {/* Step Action Buttons */}
                    {activeDelivery.status === 'partner_assigned' ? (
                      <button
                        type="button"
                        disabled={confirmingArrival}
                        onClick={handleArrivedAtStore}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {confirmingArrival ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        <span>I Have Arrived at Store Counter</span>
                      </button>
                    ) : (
                      /* Mandatory Store Pickup Code Verification Box */
                      <form onSubmit={handleVerifyPickup} className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                              Mandatory Store Pickup Verification
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Store Code: <strong className="text-amber-300 font-black">{activeDelivery.pickupCode || 'PU-8291'}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300">
                          Verify the pickup code with the store manager before taking custody of the parcel.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pickupCodeInput}
                            onChange={(e) => setPickupCodeInput(e.target.value.toUpperCase())}
                            placeholder="Enter Code (e.g. PU-8291)"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black border border-amber-500/40 text-amber-300 font-mono font-black text-sm uppercase tracking-widest placeholder:text-neutral-600 focus:outline-none focus:border-amber-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setPickupCodeInput(activeDelivery.pickupCode || 'PU-8291')}
                            className="px-3 py-2 rounded-xl bg-neutral-800 text-[11px] font-bold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                          >
                            Autofill
                          </button>
                          <button
                            type="submit"
                            disabled={verifyingPickup}
                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {verifyingPickup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            <span>Verify & Pickup</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* STAGE B: Out for Delivery to Customer (out_for_delivery OR arrived_at_customer) */}
                {(activeDelivery.status === 'out_for_delivery' || activeDelivery.status === 'arrived_at_customer') && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-black text-emerald-400">Customer Drop</span>
                            <h4 className="font-bold text-sm text-neutral-100">{activeDelivery.deliveryAddress?.name || activeDelivery.customer?.name}</h4>
                            <p className="text-neutral-300 mt-0.5">{activeDelivery.deliveryAddress?.street || activeDelivery.customer?.address}</p>
                            {activeDelivery.deliveryAddress?.landmark && (
                              <p className="text-amber-400/90 text-[11px] mt-0.5 font-medium">Landmark: {activeDelivery.deliveryAddress.landmark}</p>
                            )}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 shrink-0">
                          {activeDelivery.status === 'arrived_at_customer' ? 'At Doorstep' : 'In Transit'}
                        </span>
                      </div>

                      {/* Customer Communication & Navigation Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-800">
                        <a
                          href={`tel:${activeDelivery.deliveryAddress?.phone || activeDelivery.customer?.phone || '+919811223344'}`}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Call Customer</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setChatModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                          <span>In-App Chat</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.deliveryAddress?.street || activeDelivery.customer?.address || 'Green Park New Delhi')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-amber-400" />
                          <span>Navigate</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleOpenIssueModal('customer')}
                          className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-rose-400 font-bold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Customer Unavailable</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCancellationModalOpen(true)}
                          className="px-2.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    {/* Step Action Buttons */}
                    {activeDelivery.status === 'out_for_delivery' ? (
                      <button
                        type="button"
                        disabled={confirmingArrival}
                        onClick={handleArrivedAtCustomer}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {confirmingArrival ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                        <span>I Have Arrived at Customer Doorstep</span>
                      </button>
                    ) : (
                      /* Mandatory Doorstep Delivery OTP Verification Box */
                      <form onSubmit={handleVerifyDeliveryOtp} className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
                              Mandatory Doorstep Delivery OTP Verification
                            </h4>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-400">
                            Customer OTP: <strong className="text-emerald-300 font-black">{activeDelivery.deliveryOtp || '4921'}</strong>
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300">
                          Ask the customer for the 4-digit code shown on their app to verify handover and complete delivery.
                        </p>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={deliveryOtpInput}
                            onChange={(e) => setDeliveryOtpInput(e.target.value)}
                            placeholder="4-digit OTP"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-black border border-emerald-500/40 text-emerald-300 font-mono font-black text-center text-lg tracking-widest placeholder:text-neutral-600 focus:outline-none focus:border-emerald-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setDeliveryOtpInput(activeDelivery.deliveryOtp || '4921')}
                            className="px-3 py-2 rounded-xl bg-neutral-800 text-[11px] font-bold text-neutral-300 hover:bg-neutral-700 cursor-pointer"
                          >
                            Autofill
                          </button>
                          <button
                            type="submit"
                            disabled={verifyingDeliveryOtp}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {verifyingDeliveryOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Verify OTP & Handover</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* STAGE C: Return to Store Mode (return_initiated) */}
                {activeDelivery.status === 'return_initiated' && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-rose-400 font-black uppercase">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Delivery Failed • Return to Store Initiated</span>
                    </div>
                    <p className="text-neutral-300">
                      Reason: <strong className="text-rose-300">{activeDelivery.failureReason || 'Customer unavailable'}</strong>.
                      Please safely return the intact parcel back to {activeDelivery.store?.name}.
                    </p>
                    <div className="flex gap-2 pt-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeDelivery.store?.address || 'Saket New Delhi')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-center flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5 text-amber-400" />
                        <span>Navigate to Store</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleConfirmReturnToStore}
                        className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-black uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Confirm Package Returned</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Metrics & Daily Performance Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-4 rounded-xl border ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <span className="text-[11px] text-neutral-400 font-bold block mb-1">Today's Payout</span>
                <span className="text-xl font-black text-emerald-400">₹{partner.earningsToday || 0}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">Instant UPI Payout</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <span className="text-[11px] text-neutral-400 font-bold block mb-1">Orders Delivered</span>
                <span className="text-xl font-black text-amber-400">{partner.totalDeliveries || 0}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">100% on-time</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <span className="text-[11px] text-neutral-400 font-bold block mb-1">Partner Rating</span>
                <span className="text-xl font-black text-amber-400 flex items-center gap-1">
                  <span>{partner.rating.toFixed(1)}</span>
                  <Star className="w-4 h-4 fill-amber-400" />
                </span>
                <span className="text-[10px] text-neutral-500 block mt-0.5">5-Star Standards</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
              }`}>
                <span className="text-[11px] text-neutral-400 font-bold block mb-1">Active Fleet</span>
                <span className="text-xl font-black capitalize text-neutral-200">{partner.vehicle?.type}</span>
                <span className="text-[10px] text-neutral-500 block mt-0.5 font-mono">{partner.vehicle?.registrationNumber || 'EXEMPT'}</span>
              </div>
            </div>

            {/* 6. Partner Profile & Security Section */}
            <div className={`p-6 rounded-2xl border space-y-4 ${
              isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Verified Credentials & Payout Security</span>
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile & Security</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
                  <span className="text-neutral-400 font-bold block">Identity Document</span>
                  <div className="flex justify-between items-center">
                    <span className="capitalize font-semibold">{partner.identity?.type} Card:</span>
                    <span className="font-mono text-neutral-200">{partner.identity?.numberMasked}</span>
                  </div>
                  {partner.identity?.drivingLicenseNumberMasked && (
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Driving Licence:</span>
                      <span className="font-mono text-neutral-200">{partner.identity.drivingLicenseNumberMasked}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-400">Document Status:</span>
                    <span className="font-bold text-emerald-400 uppercase text-[10px] px-2 py-0.5 rounded bg-emerald-500/10">
                      {partner.identity?.verificationStatus || 'Verified'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
                  <span className="text-neutral-400 font-bold block">Payout Destination</span>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Bank Account:</span>
                    <span className="font-mono text-neutral-200">{partner.payout?.accountNumberMasked}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">IFSC Code:</span>
                    <span className="font-mono text-neutral-200">{partner.payout?.ifsc}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Daily UPI ID:</span>
                    <span className="font-bold text-amber-400">{partner.payout?.upiId || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Earnings & Payment Records (Module 1F) */}
        {activeTab === 'earnings' && (
          <DeliveryEarningsTab
            partner={partner}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* TAB 3: Safety, Incidents & SOS (Module 1G) */}
        {activeTab === 'safety' && (
          <DeliverySafetyTab
            partner={partner}
            activeTaskId={activeDelivery?.taskId}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* TAB 4: Performance & Customer Reviews (Module 1G) */}
        {activeTab === 'performance' && (
          <DeliveryPerformanceTab
            partner={partner}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* TAB 5: Announcements & Support Chat (Module 1G) */}
        {activeTab === 'support' && (
          <DeliverySupportTab
            partner={partner}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}

        {/* TAB 6: Privacy & Location Sharing Controls (Module 1G) */}
        {activeTab === 'profile' && (
          <DeliveryPrivacyTab
            partner={partner}
            onUpdatePartner={setPartner}
            showToast={showToast}
            isLightMode={isLightMode}
          />
        )}
      </div>
    )}
      </main>

      {/* Break Selection Modal */}
      {breakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-2xl border space-y-4 shadow-2xl ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-500" />
                <span>Take a Break</span>
              </h3>
              <button
                type="button"
                onClick={() => setBreakModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 cursor-pointer text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Select break duration. You will not receive order dispatch notifications while on break.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setBreakMinutes(mins)}
                  className={`py-3 rounded-xl border text-center transition-all cursor-pointer ${
                    breakMinutes === mins
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-black'
                      : 'border-neutral-700 text-neutral-400'
                  }`}
                >
                  <span className="block text-sm">{mins}m</span>
                  <span className="text-[10px]">{mins === 60 ? '1 Hour' : 'Rest'}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleConfirmBreak}
              className="w-full py-2.5 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
            >
              Start {breakMinutes}-Minute Break
            </button>
          </div>
        </div>
      )}

      {/* Profile & Security Edit Modal */}
      {profileEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border space-y-4 shadow-2xl ${
            isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-500" />
                <span>Update Profile & Account Security</span>
              </h3>
              <button
                type="button"
                onClick={() => setProfileEditModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 cursor-pointer text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 font-bold mb-1">Operating Hub / Zone</label>
                <input
                  type="text"
                  value={editOperatingZone}
                  onChange={(e) => setEditOperatingZone(e.target.value)}
                  placeholder="e.g. South Delhi / Saket Hub"
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={editEmergencyName}
                    onChange={(e) => setEditEmergencyName(e.target.value)}
                    placeholder="Contact Name"
                    className={`w-full px-3 py-2 rounded-xl border font-medium ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-bold mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={editEmergencyPhone}
                    onChange={(e) => setEditEmergencyPhone(e.target.value)}
                    placeholder="10-digit number"
                    className={`w-full px-3 py-2 rounded-xl border font-medium ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Instant Payout UPI ID</label>
                <input
                  type="text"
                  value={editUpiId}
                  onChange={(e) => setEditUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-bold mb-1">
                  Change Account Password <span className="font-normal text-[10px] text-neutral-500">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className={`w-full px-3 py-2 rounded-xl border font-medium ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300' : 'bg-neutral-950 border-neutral-700'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 font-bold text-neutral-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-2 py-2.5 bg-amber-500 text-black font-black uppercase tracking-wider rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Issue Reporting Modal (Store Delays, Damaged Packages, Customer Unavailable) */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border space-y-4 shadow-2xl ${
            isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {issueCategory === 'store' ? 'Report Store Pickup Issue' : 'Report Delivery Problem'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIssueModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 cursor-pointer text-neutral-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-4 text-xs">
              {issueCategory === 'store' ? (
                <>
                  <div>
                    <label className="block text-neutral-400 font-bold mb-2">Issue Type</label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'store_delay', label: 'Store is still packing / delayed' },
                        { id: 'missing_items', label: 'Item out of stock or missing from order' },
                        { id: 'damaged_package', label: 'Package leaked, squashed or damaged' },
                        { id: 'store_closed', label: 'Store closed or unreachable' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                            issueType === item.id
                              ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                              : 'border-neutral-800 hover:bg-neutral-800/50 text-neutral-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="issueType"
                            checked={issueType === item.id}
                            onChange={() => setIssueType(item.id)}
                            className="text-amber-500"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {issueType === 'store_delay' && (
                    <div>
                      <label className="block text-neutral-400 font-bold mb-1">Estimated Store Delay</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 15].map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setIssueDelayMinutes(mins)}
                            className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                              issueDelayMinutes === mins
                                ? 'border-amber-500 bg-amber-500 text-black font-black'
                                : 'border-neutral-700 text-neutral-400'
                            }`}
                          >
                            +{mins} Mins
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-neutral-400 font-bold mb-2">Failed Delivery Reason</label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'customer_unreachable', label: 'Customer phone switched off / not answering' },
                      { id: 'incorrect_address', label: 'Incorrect / incomplete address or locked gate' },
                      { id: 'customer_refused', label: 'Customer refused to accept parcel or OTP' },
                      { id: 'damaged_in_transit', label: 'Accident / package damaged during transit' },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          issueType === item.id
                            ? 'border-rose-500 bg-rose-500/10 text-rose-300 font-bold'
                            : 'border-neutral-800 hover:bg-neutral-800/50 text-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          checked={issueType === item.id}
                          onChange={() => setIssueType(item.id)}
                          className="text-rose-500"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-neutral-400 font-bold mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  value={issueDetails}
                  onChange={(e) => setIssueDetails(e.target.value)}
                  placeholder="Describe the situation for dispatch support..."
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-700 text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 font-bold text-neutral-400 hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportingIssue}
                  className={`flex-2 py-2.5 font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                    issueCategory === 'store'
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-rose-500 hover:bg-rose-400 text-black'
                  }`}
                >
                  {reportingIssue ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                    issueCategory === 'store' ? 'Notify Support & Store' : 'Initiate Return to Store'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Customer Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md h-[500px] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {activeDelivery?.deliveryAddress?.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">
                    {activeDelivery?.deliveryAddress?.name || activeDelivery?.customer?.name || 'Customer'}
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online for Delivery #{activeDelivery?.taskId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'partner' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                      msg.sender === 'partner'
                        ? 'bg-amber-500 text-black font-semibold rounded-br-xs'
                        : 'bg-neutral-800 text-neutral-100 rounded-bl-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick Response Chips */}
            <div className="p-2 border-t border-neutral-800 bg-neutral-950/40 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              {[
                'I have arrived downstairs',
                'Please share building gate code',
                '5 mins away, on the way',
                'Waiting at your doorstep',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setChatMessages((prev) => [
                      ...prev,
                      { id: Date.now().toString(), sender: 'partner', text: chip, time: 'Just now' },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap cursor-pointer transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Footer Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-neutral-800 flex gap-2 bg-neutral-950">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to customer..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Success Celebratory Modal */}
      {deliverySuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-sm p-6 rounded-3xl border text-center space-y-4 shadow-2xl ${
            isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-900 border-neutral-800 text-white'
          }`}>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce-short">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                DELIVERY COMPLETED
              </span>
              <h3 className="text-lg font-black text-white">Handover Verified!</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Customer delivery OTP verified. The package was successfully delivered on time.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-neutral-800 space-y-1">
              <span className="text-[11px] text-neutral-400 font-semibold block">Earnings Credited</span>
              <span className="text-3xl font-black text-emerald-400">
                +₹{lastCompletedDelivery?.totalPayout || 90}
              </span>
              <span className="text-[10px] text-neutral-500 block">Instant UPI settlement balance updated</span>
            </div>

            <button
              type="button"
              onClick={() => setDeliverySuccessModalOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-500 transition-all cursor-pointer"
            >
              Ready for Next Delivery
            </button>
          </div>
        </div>
      )}

      {/* Global Floating Emergency SOS Trigger Button (Module 1G: Rule 1) */}
      {partner && (
        <button
          type="button"
          onClick={() => setGlobalSosOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-2xl shadow-rose-600/50 flex items-center gap-2 border-2 border-white/20 cursor-pointer animate-pulse transition-all active:scale-95"
          title="Emergency SOS Distress Signal"
        >
          <AlertOctagon className="w-5 h-5 fill-white text-rose-600" />
          <span className="font-mono tracking-widest font-black">SOS HELP</span>
        </button>
      )}

      {/* Emergency SOS Modal (Module 1G: Rule 1) */}
      <EmergencySosModal
        isOpen={globalSosOpen}
        onClose={() => setGlobalSosOpen(false)}
        partner={partner}
        activeTaskId={activeDelivery?.taskId}
        showToast={showToast}
        isLightMode={isLightMode}
      />

      {/* Order Cancellation Reason Modal (Module 1G: Rule 5) */}
      {activeDelivery && (
        <OrderCancellationModal
          isOpen={cancellationModalOpen}
          onClose={() => setCancellationModalOpen(false)}
          taskId={activeDelivery.taskId}
          orderNumber={activeDelivery.orderNumber || activeDelivery.taskId}
          onCancelled={() => {
            setActiveDelivery(null);
            deliveryPartnerApi.getProfile().then((p) => setPartner(p));
          }}
          showToast={showToast}
          isLightMode={isLightMode}
        />
      )}
    </div>
  );
};
