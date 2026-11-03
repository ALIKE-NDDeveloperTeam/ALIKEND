import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  MapPin,
  Car,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  CreditCard,
  Wallet,
  DollarSign,
  ArrowRight,
  ChevronRight,
  Loader2,
  X,
  History,
  Info,
  Check,
  Compass,
  Calendar,
  Tag,
  FileText,
  AlertCircle,
  HelpCircle,
  Plus,
  Send,
  Zap,
  Bike,
  Share2,
  ShieldAlert,
  Copy,
  PackageSearch,
} from 'lucide-react';
import { FareEstimate, RideBooking, RideServiceType, RideStatus, SavedRidePlace, DigitalReceipt } from '../types';
import { rideApi } from '../services/rideApi';
import { RideReceiptModal } from '../components/rides/RideReceiptModal';
import { RidePaymentModal } from '../components/rides/RidePaymentModal';
import { RideScheduleModal } from '../components/rides/RideScheduleModal';
import { RideCancellationModal } from '../components/rides/RideCancellationModal';
import { RideDisputeModal } from '../components/rides/RideDisputeModal';

interface RideBookingPageProps {
  user?: { name?: string; email?: string; phone?: string; _id?: string } | null;
  onNavigateHome: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

// Popular quick destination shortcuts in Delhi NCR & Metro regions
const POPULAR_DESTINATIONS = [
  { name: 'Indira Gandhi Int. Airport (T3)', address: 'Terminal 3, New Delhi', distanceKm: 16.5 },
  { name: 'New Delhi Railway Station', address: 'Bhavbhuti Marg, Ratan Lal Market', distanceKm: 7.2 },
  { name: 'Cyber Hub, Gurugram', address: 'DLF Cyber City, Sector 24', distanceKm: 22.0 },
  { name: 'Select Citywalk Mall', address: 'Saket District Centre, New Delhi', distanceKm: 11.4 },
  { name: 'Connaught Place (Inner Circle)', address: 'Rajiv Chowk, Central Delhi', distanceKm: 5.8 },
  { name: 'Noida Sector 18 Market', address: 'Sector 18, Noida, Uttar Pradesh', distanceKm: 14.2 },
];

export const RideBookingPage: React.FC<RideBookingPageProps> = ({
  user,
  onNavigateHome,
  showToast,
  isLightMode = false,
}) => {
  // Booking Form State
  const [pickupAddress, setPickupAddress] = useState('Connaught Place, Block B, New Delhi');
  const [pickupLandmark, setPickupLandmark] = useState('Near Metro Gate 4');
  const [destAddress, setDestAddress] = useState('Indira Gandhi Int. Airport (T3)');
  const [destLandmark, setDestLandmark] = useState('Departure Gate 5');
  const [distanceKm, setDistanceKm] = useState(16.5);
  const [selectedService, setSelectedService] = useState<RideServiceType>('auto');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'upi' | 'card'>('cash');

  // Customer contact info
  const [riderName, setRiderName] = useState(user?.name || 'Vikram Malhotra');
  const [riderPhone, setRiderPhone] = useState(user?.phone || '+91 98100 12345');

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Fare Estimates State
  const [estimates, setEstimates] = useState<FareEstimate[]>([]);
  const [loadingEstimates, setLoadingEstimates] = useState(false);
  const [isRushHour, setIsRushHour] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  // Saved Places State
  const [savedPlaces, setSavedPlaces] = useState<SavedRidePlace[]>([]);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [newPlaceLabel, setNewPlaceLabel] = useState<'home' | 'work' | 'airport' | 'favorite'>('favorite');

  // Active Ride State
  const [activeRide, setActiveRide] = useState<RideBooking | null>(() => {
    try {
      const saved = localStorage.getItem('alike_active_ride');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [rideHistory, setRideHistory] = useState<RideBooking[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Modals for Part 5 Workflows
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<DigitalReceipt | null>(null);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportIssueText, setSupportIssueText] = useState('');
  const [submittingSupport, setSubmittingSupport] = useState(false);

  // Rating & Review State after ride completion
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  // OTP Verification state for simulation
  const [otpInput, setOtpInput] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Module 2I Safety & Support State
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [sosBroadcasting, setSosBroadcasting] = useState(false);
  const [sosNotes, setSosNotes] = useState('');
  const [sosSuccessMessage, setSosSuccessMessage] = useState('');

  // Trip Sharing State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareData, setShareData] = useState<{
    shareUrl: string;
    token: string;
    message: string;
    whatsappText?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Lost Item Modal State
  const [lostItemModalOpen, setLostItemModalOpen] = useState(false);
  const [lostItemCategory, setLostItemCategory] = useState('phone');
  const [lostItemDesc, setLostItemDesc] = useState('');
  const [lostItemContact, setLostItemContact] = useState('');
  const [lostItemSuccess, setLostItemSuccess] = useState('');
  const [submittingLostItem, setSubmittingLostItem] = useState(false);

  // Persist active ride state
  useEffect(() => {
    if (activeRide) {
      localStorage.setItem('alike_active_ride', JSON.stringify(activeRide));
    } else {
      localStorage.removeItem('alike_active_ride');
    }
  }, [activeRide]);

  // Update rider info if user prop changes
  useEffect(() => {
    if (user?.name) setRiderName(user.name);
    if (user?.phone) setRiderPhone(user.phone);
  }, [user]);

  // Load Saved Places
  useEffect(() => {
    rideApi.getSavedPlaces(riderPhone).then((places) => {
      if (places.length > 0) setSavedPlaces(places);
    });
  }, [riderPhone]);

  // Fetch Fare Estimates when pickup, destination, or promo changes
  useEffect(() => {
    let isMounted = true;
    setLoadingEstimates(true);

    rideApi
      .getEstimates({
        pickup: { address: pickupAddress, landmark: pickupLandmark },
        destination: { address: destAddress, landmark: destLandmark },
        distanceKm,
        promoCode: appliedPromo || undefined,
      })
      .then((res) => {
        if (!isMounted) return;
        setEstimates(res.estimates);
        setIsRushHour(res.isRushHour);
        setSurgeMultiplier(res.surgeMultiplier);

        // Update selected estimate discount if any
        const match = res.estimates.find((e) => e.serviceType === selectedService);
        if (match && match.fare.discountAmount) {
          setPromoDiscountAmount(match.fare.discountAmount);
        }
      })
      .catch((err) => {
        console.warn('Fare estimate warning:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingEstimates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pickupAddress, destAddress, distanceKm, pickupLandmark, destLandmark, appliedPromo, selectedService]);

  // Polling for active ride updates
  useEffect(() => {
    if (!activeRide || activeRide.status === 'completed' || activeRide.status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      rideApi
        .getRideStatus(activeRide.bookingId)
        .then((updated) => {
          if (updated) {
            setActiveRide(updated);
            if (updated.status === 'completed' && updated.paymentStatus === 'pending') {
              setPaymentModalOpen(true);
            }
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [activeRide]);

  // Apply Promo Coupon
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    try {
      setValidatingPromo(true);
      setPromoError('');
      const currentEst = estimates.find((e) => e.serviceType === selectedService);
      const fareAmount = currentEst ? currentEst.fare.totalFare : 150;
      const res = await rideApi.validatePromo(promoCodeInput.trim(), fareAmount, selectedService);
      setAppliedPromo(res.code);
      setPromoDiscountAmount(res.estimatedDiscount);
      showToast?.(`Coupon '${res.code}' applied! You save ₹${res.estimatedDiscount}`, 'success');
    } catch (err: any) {
      setPromoError(err.message || 'Invalid coupon code');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoDiscountAmount(0);
    setPromoCodeInput('');
  };

  // GPS Current Location Detection (with privacy explanation)
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast?.('Geolocation is not supported by your browser.', 'error');
      return;
    }

    const confirmed = window.confirm(
      'ALIKE ND Rides needs your location to set your pickup point accurately and assign the nearest captain. Do you wish to allow GPS detection?'
    );
    if (!confirmed) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPickupAddress(`Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setPickupLandmark('Accurate to ~15m');
        showToast?.('Pickup location updated to your current position.', 'success');
      },
      (err) => {
        showToast?.('Unable to retrieve location. Please type your pickup address.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Book Ride (Now or Scheduled)
  const handleBookRide = async (isScheduled = false, scheduledFor?: string) => {
    try {
      setBookingInProgress(true);

      const created = await rideApi.bookRide({
        serviceType: selectedService,
        pickup: { address: pickupAddress, landmark: pickupLandmark },
        destination: { address: destAddress, landmark: destLandmark },
        distanceKm,
        customerName: riderName,
        customerPhone: riderPhone,
        customerEmail: user?.email,
        paymentMethod,
        promoCode: appliedPromo || undefined,
        isScheduled,
        scheduledFor,
      });

      setActiveRide(created);
      showToast?.(
        isScheduled
          ? 'Ride scheduled successfully! Captain will arrive on time.'
          : 'Searching for nearby captains... Ride requested!',
        'success'
      );
    } catch (err: any) {
      showToast?.(err.message || 'Could not complete ride booking.', 'error');
    } finally {
      setBookingInProgress(false);
    }
  };

  // Cancel Active Ride
  const handleCancelActiveRide = async (reason: string) => {
    if (!activeRide) return;
    try {
      const updated = await rideApi.cancelRide(activeRide.bookingId, reason);
      setActiveRide(updated);
      showToast?.('Your ride has been cancelled.', 'info');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to cancel ride', 'error');
    }
  };

  // Payment Confirmation
  const handleConfirmPayment = async (method: 'cash' | 'upi' | 'wallet' | 'card', upiId?: string) => {
    if (!activeRide) return;
    const updated = await rideApi.payRide(activeRide.bookingId, method, upiId);
    setActiveRide(updated);
    showToast?.('Payment confirmed! Digital receipt is ready.', 'success');
  };

  // View Receipt
  const handleViewReceipt = async () => {
    if (!activeRide) return;
    try {
      const receipt = await rideApi.getReceipt(activeRide.bookingId);
      setCurrentReceipt(receipt);
      setReceiptModalOpen(true);
    } catch (err: any) {
      showToast?.('Could not load receipt at this time.', 'error');
    }
  };

  // Submit Dispute
  const handleSubmitDispute = async (reason: string, claimedRefund: number, notes?: string) => {
    if (!activeRide) return;
    await rideApi.submitDispute(activeRide.bookingId, reason, claimedRefund, notes);
    showToast?.('Dispute submitted for operational audit.', 'success');
  };

  // Submit Support Ticket
  const handleSubmitSupport = async () => {
    if (!activeRide || !supportIssueText.trim()) return;
    try {
      setSubmittingSupport(true);
      await rideApi.requestSupport(activeRide.bookingId, supportIssueText.trim());
      showToast?.('Support ticket opened. Our safety desk is on it.', 'success');
      setSupportModalOpen(false);
      setSupportIssueText('');
    } catch (err: any) {
      showToast?.('Failed to submit support request', 'error');
    } finally {
      setSubmittingSupport(false);
    }
  };

  // Emergency SOS Broadcast (Module 2I.1)
  const handleTriggerSos = async () => {
    if (!activeRide) return;
    setSosBroadcasting(true);
    try {
      const res = await rideApi.triggerSos(activeRide.bookingId, undefined, undefined, sosNotes);
      setSosSuccessMessage(res.message);
      showToast?.('EMERGENCY SOS BROADCASTED TO SAFETY DISPATCH', 'warning');
    } catch (err: any) {
      showToast?.('Failed to trigger SOS', 'error');
    } finally {
      setSosBroadcasting(false);
    }
  };

  // Share Live Trip Details (Module 2I.2)
  const handleShareTrip = async () => {
    if (!activeRide) return;
    setShareLoading(true);
    setShareModalOpen(true);
    setCopiedLink(false);
    try {
      const res = await rideApi.shareTrip(activeRide.bookingId);
      setShareData(res);
    } catch (err: any) {
      showToast?.('Failed to generate share link', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  // Submit Lost Item Report (Module 2I.6)
  const handleSubmitLostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide) return;
    setSubmittingLostItem(true);
    try {
      const res = await rideApi.reportLostItem(
        activeRide.bookingId,
        lostItemCategory,
        lostItemDesc,
        lostItemContact || activeRide.customerPhone
      );
      setLostItemSuccess(res.message);
      showToast?.('Lost item report filed. Captain notified.', 'success');
      setTimeout(() => {
        setLostItemModalOpen(false);
        setLostItemDesc('');
        setLostItemSuccess('');
      }, 2000);
    } catch (err: any) {
      showToast?.('Failed to report lost item', 'error');
    } finally {
      setSubmittingLostItem(false);
    }
  };

  // Rating Submit
  const handleSubmitRating = async () => {
    if (!activeRide) return;
    try {
      setRatingSubmitting(true);
      await rideApi.rateRide(activeRide.bookingId, ratingScore, ratingComment);
      showToast?.('Thank you for rating your ride!', 'success');
      setShowRatingModal(false);
      setActiveRide(null);
    } catch (err: any) {
      showToast?.('Failed to submit review.', 'error');
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Simulation Triggers for interactive testing
  const handleSimulateAccept = async () => {
    if (!activeRide) return;
    const updated = await rideApi.driverAccept(activeRide.bookingId, {
      driverName: 'Rajesh Kumar',
      driverPhone: '+91 98765 43210',
      vehicleNumber: 'DL 01 AB 4321',
      vehicleModel: 'Maruti Suzuki Dzire',
      rating: 4.9,
    });
    setActiveRide(updated);
  };

  const handleSimulateArrive = async () => {
    if (!activeRide) return;
    const updated = await rideApi.driverArrive(activeRide.bookingId);
    setActiveRide(updated);
  };

  const handleVerifyOtpSimulation = async () => {
    if (!activeRide) return;
    try {
      setOtpVerifying(true);
      setOtpError('');
      const updated = await rideApi.verifyRideOtp(activeRide.bookingId, otpInput.trim() || activeRide.rideOtp);
      setActiveRide(updated);
      setOtpInput('');
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSimulateComplete = async () => {
    if (!activeRide) return;
    const updated = await rideApi.completeRide(activeRide.bookingId, distanceKm, 22, 4);
    setActiveRide(updated);
    setPaymentModalOpen(true);
  };

  // Add Saved Place
  const handleSavePlace = async () => {
    if (!newPlaceName.trim() || !newPlaceAddress.trim()) return;
    try {
      const created = await rideApi.addSavedPlace({
        customName: newPlaceName.trim(),
        address: newPlaceAddress.trim(),
        label: newPlaceLabel,
        phone: riderPhone,
      });
      setSavedPlaces([created, ...savedPlaces]);
      setShowAddPlaceModal(false);
      setNewPlaceName('');
      setNewPlaceAddress('');
      showToast?.(`Saved "${created.customName}" to your shortcuts!`, 'success');
    } catch (err: any) {
      showToast?.('Failed to save place', 'error');
    }
  };

  // Helper for vehicle category icons
  const renderVehicleIcon = (icon: string, className = 'w-6 h-6') => {
    if (icon === 'bike') return <Bike className={className} />;
    return <Car className={className} />;
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors ${
      isLightMode ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-950 text-neutral-100'
    }`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Title Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="p-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Passenger Mobility
                </span>
                <span className="text-xs text-neutral-400">• Free Cancellation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                Alike Rides
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setHistoryModalOpen(true);
                setLoadingHistory(true);
                rideApi.getUserRides(riderPhone).then((res) => {
                  setRideHistory(res);
                  setLoadingHistory(false);
                });
              }}
              className="px-4 py-2.5 rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <History className="w-4 h-4 text-amber-500" />
              <span>Ride History</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ACTIVE RIDE SCREEN (If Ride In Progress / Searching / Completed)          */}
        {/* ========================================================================= */}
        {activeRide ? (
          <div className="space-y-6 animate-fade-in">
            {/* Status Hero Card */}
            <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">#{activeRide.bookingId}</span>
                    <span className="text-xs text-neutral-400">• {activeRide.serviceType.toUpperCase()}</span>
                    {activeRide.isScheduled && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        SCHEDULED
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white capitalize">
                    {activeRide.status === 'requested' && 'Searching for Captain...'}
                    {activeRide.status === 'arriving' && 'Captain is Arriving at Pickup'}
                    {activeRide.status === 'arrived' && 'Captain has Arrived!'}
                    {activeRide.status === 'in_progress' && 'Trip In Progress'}
                    {activeRide.status === 'completed' && 'Trip Completed'}
                    {activeRide.status === 'cancelled' && 'Ride Cancelled'}
                    {activeRide.status === 'no_driver_found' && 'No Captains Available Nearby'}
                  </h2>
                </div>

                {/* Secure Ride OTP Badge */}
                {['requested', 'accepted', 'arriving', 'arrived'].includes(activeRide.status) && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Share with Captain
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-widest">
                      {activeRide.rideOtp}
                    </p>
                    <span className="text-[9px] text-neutral-400 block font-mono">4-digit Ride OTP</span>
                    <p className="text-[9px] text-amber-400/80 font-medium pt-1 border-t border-amber-500/20 max-w-xs mx-auto">
                      🛡️ Share OTP only after verifying Captain {activeRide.driver?.name || 'identity'} and Vehicle Plate {activeRide.driver?.vehicleNumber || 'number'}.
                    </p>
                  </div>
                )}
              </div>

              {/* Driver Details Card (If driver assigned) */}
              {activeRide.driver && (
                <div className="p-4 rounded-2xl bg-neutral-850 border border-neutral-750 flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={activeRide.driver.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt={activeRide.driver.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-white">{activeRide.driver.name}</h3>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{activeRide.driver.rating || 4.9}</span>
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 font-bold">
                        {activeRide.driver.vehicleNumber} • {activeRide.driver.vehicleModel}
                      </p>
                      <p className="text-[11px] text-neutral-500">Verified ALIKE-ND Captain</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${activeRide.driver.phone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Captain</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleShareTrip}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Share Trip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSosModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-rose-600/30"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SOS Emergency</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupportModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Support</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Trip Route Details */}
              <div className="space-y-3 text-xs border-t border-neutral-800 pt-4">
                <div className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Pickup Location</span>
                    <p className="font-medium text-neutral-200">{activeRide.pickup.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></span>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase">Dropoff Destination</span>
                    <p className="font-medium text-neutral-200">{activeRide.destination.address}</p>
                  </div>
                </div>
              </div>

              {/* Fare Summary & Invoice Link */}
              <div className="p-4 rounded-2xl bg-neutral-800/50 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Total Fare</span>
                  <p className="text-xl font-black text-amber-400 font-mono">
                    ₹{activeRide.fare.totalFare}
                  </p>
                  <p className="text-[10px] text-neutral-400 uppercase">
                    Payment: {activeRide.paymentMethod.toUpperCase()} ({activeRide.paymentStatus.toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeRide.status === 'completed' && (
                    <>
                      <button
                        type="button"
                        onClick={handleViewReceipt}
                        className="px-3.5 py-2 rounded-xl bg-neutral-750 hover:bg-neutral-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Tax Invoice</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDisputeModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Dispute Fare
                      </button>
                      <button
                        type="button"
                        onClick={() => setLostItemModalOpen(true)}
                        className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <PackageSearch className="w-3.5 h-3.5 text-amber-400" />
                        <span>Lost Item</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRatingModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate Ride</span>
                      </button>
                    </>
                  )}

                  {['requested', 'arriving', 'arrived'].includes(activeRide.status) && (
                    <button
                      type="button"
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel Ride
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Simulation Sandbox Bar for Testers */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>Interactive Simulation Controls</span>
                  </span>
                  <span className="text-[10px] text-neutral-500">Live test runner for Part 5 transitions</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {activeRide.status === 'requested' && (
                    <button
                      type="button"
                      onClick={handleSimulateAccept}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      1. Captain Accepts Ride
                    </button>
                  )}

                  {activeRide.status === 'arriving' && (
                    <button
                      type="button"
                      onClick={handleSimulateArrive}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                    >
                      2. Captain Arrives at Pickup
                    </button>
                  )}

                  {activeRide.status === 'arrived' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder={activeRide.rideOtp}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-24 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs font-mono text-center text-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtpSimulation}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                      >
                        3. Verify OTP & Start Trip
                      </button>
                    </div>
                  )}

                  {activeRide.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={handleSimulateComplete}
                      className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-xs hover:bg-purple-500 transition-colors cursor-pointer"
                    >
                      4. Complete Trip & Settle Fare
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveRide(null)}
                    className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 ml-auto cursor-pointer"
                  >
                    Reset Active Ride
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* RIDE BOOKING FORM (Route Info, Saved Places, 8 Vehicles & Promo)          */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Route, Saved Places & Vehicle Selector */}
            <div className="lg:col-span-7 space-y-5">
              {/* Route Input Box */}
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    Pickup & Destination
                  </h2>
                  <button
                    type="button"
                    onClick={handleCurrentLocation}
                    className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Use Current Location</span>
                  </button>
                </div>

                {/* Pickup Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Pickup Address</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      placeholder="Enter pickup address"
                      className="sm:col-span-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 focus:border-amber-500 outline-none"
                    />
                    <input
                      type="text"
                      value={pickupLandmark}
                      onChange={(e) => setPickupLandmark(e.target.value)}
                      placeholder="Landmark (Gate/Tower)"
                      className="px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Destination Address */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Drop Destination</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={destAddress}
                      onChange={(e) => setDestAddress(e.target.value)}
                      placeholder="Enter destination address"
                      className="sm:col-span-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 focus:border-amber-500 outline-none"
                    />
                    <input
                      type="text"
                      value={destLandmark}
                      onChange={(e) => setDestLandmark(e.target.value)}
                      placeholder="Landmark (Optional)"
                      className="px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Saved Places Bar */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Saved Locations & Shortcuts
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddPlaceModal(true)}
                      className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Saved Place</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {savedPlaces.map((place) => (
                      <button
                        key={place.placeId}
                        type="button"
                        onClick={() => {
                          setDestAddress(place.address);
                          showToast?.(`Destination set to ${place.customName}`, 'info');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-amber-500/10 hover:border-amber-500/30 border border-neutral-200 dark:border-neutral-750 text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-amber-500" />
                        <span>{place.customName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vehicle Options Comparison (Module 2A) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    Available Vehicle Categories ({estimates.length})
                  </h3>
                  {isRushHour && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Peak Demand Surge Active (1.2x)</span>
                    </span>
                  )}
                </div>

                {loadingEstimates ? (
                  <div className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                    <p className="text-xs text-neutral-400 font-bold">Computing fastest route & captain availability...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {estimates.map((est) => {
                      const isSelected = selectedService === est.serviceType;
                      return (
                        <div
                          key={est.serviceType}
                          onClick={() => setSelectedService(est.serviceType)}
                          className={`p-4 rounded-3xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                              : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700'
                          }`}
                        >
                          {est.badge && (
                            <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest bg-amber-500/20 text-amber-600 dark:text-amber-400 uppercase">
                              {est.badge}
                            </span>
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-2xl ${
                              isSelected
                                ? 'bg-amber-500 text-neutral-950'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                            }`}>
                              {renderVehicleIcon(est.icon)}
                            </div>

                            <div className="flex-1 pr-12">
                              <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100">
                                {est.name}
                              </h4>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                <span>{est.capacity} seats</span>
                                <span>•</span>
                                <span>{est.etaArrivalMin} mins away</span>
                              </div>
                              <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                                {est.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                            <span className="text-[11px] text-neutral-500">
                              Estimated Trip: ~{est.estimatedDurationMin} mins
                            </span>
                            <div className="text-right">
                              <span className="text-base font-black text-neutral-900 dark:text-neutral-100 font-mono">
                                ₹{est.fare.totalFare}
                              </span>
                              {est.fare.discountAmount && est.fare.discountAmount > 0 ? (
                                <p className="text-[10px] text-emerald-500 font-bold">
                                  -₹{est.fare.discountAmount} promo applied
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Fare Summary, Promo Code, Payment & Action */}
            <div className="lg:col-span-5 space-y-5">
              {/* Fare Breakdown Card */}
              <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-400">
                    Fare Calculation
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono">{distanceKm} km commute</span>
                </div>

                {/* Selected Vehicle Summary */}
                {(() => {
                  const currentEst = estimates.find((e) => e.serviceType === selectedService);
                  if (!currentEst) return null;
                  const f = currentEst.fare;
                  return (
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Base Fare</span>
                        <span className="font-mono">₹{f.baseFare}</span>
                      </div>
                      <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                        <span>Distance Fare ({distanceKm} km)</span>
                        <span className="font-mono">₹{f.distanceFare}</span>
                      </div>
                      {f.timeFare && f.timeFare > 0 ? (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Travel Time Rate</span>
                          <span className="font-mono">₹{f.timeFare}</span>
                        </div>
                      ) : null}
                      {f.tollCharges && f.tollCharges > 0 ? (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Expressway Toll</span>
                          <span className="font-mono">₹{f.tollCharges}</span>
                        </div>
                      ) : null}
                      {f.airportCharges && f.airportCharges > 0 ? (
                        <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                          <span>Airport Vehicle Surcharge</span>
                          <span className="font-mono">₹{f.airportCharges}</span>
                        </div>
                      ) : null}
                      {f.discountAmount && f.discountAmount > 0 ? (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                          <span>Promo Coupon Discount</span>
                          <span className="font-mono">-₹{f.discountAmount}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between text-neutral-500 text-[11px]">
                        <span>Taxes (5% IGST) & Tech Fee</span>
                        <span className="font-mono">₹{f.tax + (f.safetyFee || 5)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-black text-neutral-900 dark:text-neutral-100 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <span>Estimated Fare</span>
                        <span className="text-xl text-amber-500 font-mono">₹{f.totalFare}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Promo Code Input */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-500" />
                    <span>Apply Promo Code</span>
                  </label>

                  {appliedPromo ? (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-500">{appliedPromo}</span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Saving ₹{promoDiscountAmount} on this ride</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="e.g. ALIKE50, FESTIVE100"
                        className="flex-1 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        disabled={validatingPromo}
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {validatingPromo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}

                  {promoError && <p className="text-xs text-rose-500 font-bold">{promoError}</p>}
                </div>

                {/* Passenger Contact Info */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Passenger Contact
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      placeholder="Your Name"
                      className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 outline-none"
                    />
                    <input
                      type="text"
                      value={riderPhone}
                      onChange={(e) => setRiderPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-300 dark:border-neutral-750 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Booking Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    disabled={bookingInProgress}
                    onClick={() => handleBookRide(false)}
                    className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-amber-500/20"
                  >
                    {bookingInProgress ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Finding Captains...</span>
                      </>
                    ) : (
                      <>
                        <span>Book Ride Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setScheduleModalOpen(true)}
                    className="w-full py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>Schedule for Later</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALS: SCHEDULE, PAYMENT, RECEIPT, DISPUTE, CANCEL, HISTORY              */}
        {/* ========================================================================= */}
        {scheduleModalOpen && (
          <RideScheduleModal
            onScheduleConfirm={(dateStr) => handleBookRide(true, dateStr)}
            onClose={() => setScheduleModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}

        {cancelModalOpen && activeRide && (
          <RideCancellationModal
            bookingId={activeRide.bookingId}
            onConfirmCancel={handleCancelActiveRide}
            onClose={() => setCancelModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}

        {paymentModalOpen && activeRide && (
          <RidePaymentModal
            bookingId={activeRide.bookingId}
            totalFare={activeRide.fare.totalFare}
            driverName={activeRide.driver?.name}
            onConfirmPayment={handleConfirmPayment}
            onClose={() => setPaymentModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}

        {receiptModalOpen && currentReceipt && (
          <RideReceiptModal
            receipt={currentReceipt}
            onClose={() => setReceiptModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}

        {disputeModalOpen && activeRide && (
          <RideDisputeModal
            bookingId={activeRide.bookingId}
            totalFare={activeRide.fare.totalFare}
            onSubmitDispute={handleSubmitDispute}
            onClose={() => setDisputeModalOpen(false)}
            isLightMode={isLightMode}
          />
        )}

        {/* Support Modal */}
        {supportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Ride Safety & Customer Support</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSupportModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-rose-400">Emergency Helpline</p>
                    <p className="text-[11px] text-neutral-400">Police 112 & Alike Safety Desk</p>
                  </div>
                  <a
                    href="tel:112"
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xs"
                  >
                    Call 112
                  </a>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Describe Your Issue</label>
                  <textarea
                    value={supportIssueText}
                    onChange={(e) => setSupportIssueText(e.target.value)}
                    placeholder="Tell us what you need help with regarding this trip..."
                    rows={3}
                    className="w-full p-3 rounded-xl text-xs bg-neutral-850 border border-neutral-750 text-white outline-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={submittingSupport}
                  onClick={handleSubmitSupport}
                  className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  {submittingSupport ? 'Opening Ticket...' : 'Submit Support Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* EMERGENCY SOS MODAL (Module 2I.1)                                         */}
        {/* ========================================================================= */}
        {sosModalOpen && activeRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-950 border border-rose-500/50 p-6 space-y-5 shadow-2xl text-center">
              <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-600/50 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-rose-400 uppercase tracking-wider">
                  Emergency SOS Alarm
                </h3>
                <p className="text-xs text-neutral-300">
                  Broadcasts your live trip coordinates ({activeRide.driver?.lat || activeRide.pickup?.lat || 'GPS'}, {activeRide.driver?.lng || activeRide.pickup?.lng || 'GPS'}) to central safety dispatch.
                </p>
              </div>

              {sosSuccessMessage ? (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 space-y-2">
                  <p>🚨 {sosSuccessMessage}</p>
                  <p className="text-[11px] text-neutral-400">Emergency dispatch response team has been alerted.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Optional situation note (e.g. medical emergency, driver deviation)..."
                    value={sosNotes}
                    onChange={(e) => setSosNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white outline-none focus:border-rose-500"
                  />

                  {/* Immediate Emergency Helplines */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <a
                      href="tel:112"
                      className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Dial 112 (Police)</span>
                    </a>
                    <a
                      href="tel:+911140007433"
                      className="py-2.5 px-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Alike Safety Desk</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSosModalOpen(false);
                    setSosSuccessMessage('');
                  }}
                  className="py-2.5 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Close
                </button>
                {!sosSuccessMessage && (
                  <button
                    type="button"
                    onClick={handleTriggerSos}
                    disabled={sosBroadcasting}
                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                  >
                    {sosBroadcasting ? 'Broadcasting...' : 'Broadcast SOS Alert'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SHARE TRIP MODAL (Module 2I.2)                                            */}
        {/* ========================================================================= */}
        {shareModalOpen && activeRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  <span>Share Live Trip with Trusted Contact</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShareModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-neutral-400">
                  <span>Captain:</span>
                  <span className="text-white font-bold">{activeRide.driver?.name || 'Assigned Captain'}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Vehicle:</span>
                  <span className="text-white font-bold">{activeRide.driver?.vehicleNumber || activeRide.serviceType}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Destination:</span>
                  <span className="text-emerald-400 font-bold truncate max-w-[200px]">{activeRide.destination?.address}</span>
                </div>
              </div>

              {shareLoading ? (
                <p className="text-center py-4 text-xs font-mono text-neutral-400">Generating secure tracking link...</p>
              ) : shareData ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-black border border-neutral-800 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-neutral-400 truncate">{shareData.shareUrl}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (shareData.shareUrl) {
                          navigator.clipboard.writeText(shareData.shareUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }
                      }}
                      className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?text=${shareData.whatsappText || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 transition-all"
                  >
                    <span>Share via WhatsApp</span>
                  </a>

                  <p className="text-[10px] text-neutral-400 text-center">
                    Your contact can monitor live vehicle movement and route progress safely in their web browser.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* REPORT LOST ITEM MODAL (Module 2I.6)                                      */}
        {/* ========================================================================= */}
        {lostItemModalOpen && activeRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <PackageSearch className="w-4 h-4 text-amber-400" />
                  <span>Report Lost Item in Vehicle</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setLostItemModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {lostItemSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold space-y-1">
                  <p>✅ {lostItemSuccess}</p>
                  <p className="text-[11px] text-neutral-400">Our safety desk and Captain {activeRide.driver?.name} have received your ticket.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitLostItem} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Item Category</label>
                    <select
                      value={lostItemCategory}
                      onChange={(e) => setLostItemCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-black border border-neutral-800 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Mobile Phone / Electronics">Mobile Phone / Electronics / Laptop</option>
                      <option value="Wallet / Purse / Cards">Wallet / Purse / ID Cards / Cash</option>
                      <option value="Keys / Bags / Luggage">Keys / Backpack / Suitcase</option>
                      <option value="Eyewear / Watch / Jewelry">Eyewear / Watch / Jewelry</option>
                      <option value="Other Personal Belonging">Other Personal Belonging</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Item Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={lostItemDesc}
                      onChange={(e) => setLostItemDesc(e.target.value)}
                      placeholder="Describe color, brand, where you left it in the vehicle..."
                      className="w-full p-2.5 rounded-xl bg-black border border-neutral-800 text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Best Callback Number</label>
                    <input
                      type="tel"
                      value={lostItemContact}
                      onChange={(e) => setLostItemContact(e.target.value)}
                      placeholder={activeRide.customerPhone || 'Your phone number'}
                      className="w-full p-2.5 rounded-xl bg-black border border-neutral-800 text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLostItem || !lostItemDesc.trim()}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                  >
                    {submittingLostItem ? 'Submitting Report...' : 'Submit Lost Item Ticket'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Add Saved Place Modal */}
        {showAddPlaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-sm font-black text-white">Add Saved Place</h3>
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Place Label (e.g. Gym, Client Office)</label>
                  <input
                    type="text"
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    placeholder="Enter place label"
                    className="w-full p-2.5 rounded-xl bg-neutral-850 border border-neutral-750 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase">Full Address</label>
                  <input
                    type="text"
                    value={newPlaceAddress}
                    onChange={(e) => setNewPlaceAddress(e.target.value)}
                    placeholder="Enter full address"
                    className="w-full p-2.5 rounded-xl bg-neutral-850 border border-neutral-750 text-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSavePlace}
                  className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Save Location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl text-center">
              <h3 className="text-lg font-black text-white">Rate Your Experience</h3>
              <p className="text-xs text-neutral-400">
                How was your trip with {activeRide?.driver?.name || 'your captain'}?
              </p>

              <div className="flex items-center justify-center gap-2 py-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1.5 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= ratingScore ? 'text-amber-400 fill-current' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Leave feedback on driving, cleanliness or courtesy..."
                rows={2}
                className="w-full p-3 rounded-xl text-xs bg-neutral-850 border border-neutral-750 text-white outline-none"
              />

              <button
                type="button"
                disabled={ratingSubmitting}
                onClick={handleSubmitRating}
                className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        )}

        {/* Ride History Modal */}
        {historyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  <span>Past Ride Bookings</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                </div>
              ) : rideHistory.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-500">
                  No past rides found for {riderPhone}. Book your first ride above!
                </div>
              ) : (
                <div className="space-y-3">
                  {rideHistory.map((r) => (
                    <div
                      key={r.bookingId}
                      className="p-4 rounded-2xl bg-neutral-850 border border-neutral-750 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">#{r.bookingId}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-neutral-800 text-neutral-300">
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-neutral-300 font-medium line-clamp-1">{r.pickup.address} → {r.destination.address}</p>
                      <div className="flex items-center justify-between text-neutral-400 text-[11px] pt-1 border-t border-neutral-800">
                        <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        <span className="font-mono font-bold text-white">₹{r.fare.totalFare}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
