import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Bike,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  Power,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowRight,
  TrendingUp,
  History,
  Lock,
  User,
  LogOut,
  RotateCw,
  X,
  CreditCard,
  Compass,
  AlertTriangle,
  ShieldAlert,
  Award,
  Zap,
  Users,
  ExternalLink,
  FileText,
  Check,
} from 'lucide-react';
import { driverApi, DriverProfile, RideOffer } from '../services/driverApi';

interface DriverPortalProps {
  onNavigateHome: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

const VEHICLE_OPTIONS = [
  { key: 'bike', label: 'Bike Taxi', capacity: 1, icon: '🏍️' },
  { key: 'auto', label: 'Auto Rickshaw', capacity: 3, icon: '🛺' },
  { key: 'car_mini', label: 'Hatchback (Mini)', capacity: 4, icon: '🚗' },
  { key: 'car_sedan', label: 'Sedan Car', capacity: 4, icon: '🚘' },
  { key: 'car_suv', label: 'SUV Prime (6-Seater)', capacity: 6, icon: '🚙' },
  { key: 'car_premium', label: 'Luxury Premium', capacity: 4, icon: '✨' },
  { key: 'car_xl', label: 'Family XL (7-Seater)', capacity: 7, icon: '🚐' },
  { key: 'car_green', label: 'Green Electric (EV)', capacity: 4, icon: '⚡' },
];

export const DriverPortal: React.FC<DriverPortalProps> = ({
  onNavigateHome,
  showToast,
  isLightMode = false,
}) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('alike_driver_token'));
  const [driver, setDriver] = useState<DriverProfile | null>(() => {
    try {
      const saved = localStorage.getItem('alike_driver_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Auth Mode State (Login / Register / OTP Login)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'otp_login'>('login');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regVehicleType, setRegVehicleType] = useState('auto');
  const [regVehicleNumber, setRegVehicleNumber] = useState('');
  const [regVehicleModel, setRegVehicleModel] = useState('');
  const [regSeatingCapacity, setRegSeatingCapacity] = useState(3);
  const [regLicenseNumber, setRegLicenseNumber] = useState('');
  const [regLicenseExpiry, setRegLicenseExpiry] = useState('');
  const [regAadhaarNumber, setRegAadhaarNumber] = useState('');
  const [regRcNumber, setRegRcNumber] = useState('');
  const [regInsurancePolicy, setRegInsurancePolicy] = useState('');
  const [regInsuranceExpiry, setRegInsuranceExpiry] = useState('');
  const [regPermitNumber, setRegPermitNumber] = useState('');
  const [regBankAcc, setRegBankAcc] = useState('');
  const [regIfsc, setRegIfsc] = useState('');
  const [regUpiId, setRegUpiId] = useState('');
  const [regPhotoUrl, setRegPhotoUrl] = useState('');

  // Login Fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // OTP Login Fields
  const [otpLoginPhone, setOtpLoginPhone] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtpCode, setDebugOtpCode] = useState<string | null>(null);

  // Dashboard State
  const [isOnline, setIsOnline] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<RideOffer | null>(null);
  const [offerCountdown, setOfferCountdown] = useState(30);
  const [activeRide, setActiveRide] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('alike_driver_active_ride');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Ride OTP verification state
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showCashCollectedModal, setShowCashCollectedModal] = useState<number | null>(null);

  // Safety Modals State
  const [showSosModal, setShowSosModal] = useState(false);
  const [showAccidentModal, setShowAccidentModal] = useState(false);
  const [accidentSeverity, setAccidentSeverity] = useState<'minor' | 'moderate' | 'critical'>('minor');
  const [accidentDesc, setAccidentDesc] = useState('');
  const [showRatePassengerModal, setShowRatePassengerModal] = useState(false);
  const [passengerRatingStars, setPassengerRatingStars] = useState(5);
  const [passengerFeedback, setPassengerFeedback] = useState('');

  // Location tracking state
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const watchIdRef = useRef<number | null>(null);

  // Sync token & profile to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('alike_driver_token', token);
    } else {
      localStorage.removeItem('alike_driver_token');
    }
  }, [token]);

  useEffect(() => {
    if (driver) {
      localStorage.setItem('alike_driver_profile', JSON.stringify(driver));
      setIsOnline(driver.isOnline);
    } else {
      localStorage.removeItem('alike_driver_profile');
    }
  }, [driver]);

  useEffect(() => {
    if (activeRide) {
      localStorage.setItem('alike_driver_active_ride', JSON.stringify(activeRide));
    } else {
      localStorage.removeItem('alike_driver_active_ride');
    }
  }, [activeRide]);

  // Initial load: Fetch freshest profile if token exists
  useEffect(() => {
    if (token) {
      driverApi
        .getMe(token)
        .then((res) => {
          setDriver(res.driver);
          setIsOnline(res.driver.isOnline);
          if (res.activeRide) {
            setActiveRide(res.activeRide);
          }
        })
        .catch((err) => {
          console.warn('Driver session expired:', err);
          handleLogout();
        });
    }
  }, [token]);

  // GPS Location Watcher when Online
  useEffect(() => {
    if (isOnline && token) {
      if ('geolocation' in navigator) {
        setGpsActive(true);
        setGpsError('');

        // Immediate one-time position
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            driverApi.updateLocation(latitude, longitude, token).catch(() => {});
          },
          (err) => {
            console.warn('Geolocation initial error:', err.message);
            setGpsError('Please enable GPS location to receive nearby rides.');
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );

        // Continuous watch
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            driverApi.updateLocation(latitude, longitude, token).catch(() => {});
          },
          (err) => {
            console.warn('Geolocation watch error:', err.message);
            setGpsError('GPS connection weak or lost.');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
        watchIdRef.current = id;
      } else {
        setGpsError('Geolocation is not supported by your browser.');
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsActive(false);
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isOnline, token]);

  // Poll for incoming ride offers every 4 seconds when Online and not on active ride
  useEffect(() => {
    if (!token || !isOnline || activeRide) return;

    const interval = setInterval(async () => {
      try {
        const data = await driverApi.getOffers(token);
        if (data.activeRide) {
          setActiveRide(data.activeRide);
          setCurrentOffer(null);
        } else if (data.hasOffer && data.offer) {
          setCurrentOffer(data.offer);
          setOfferCountdown(data.secondsRemaining || 30);
        } else {
          setCurrentOffer(null);
        }
      } catch (err) {
        console.error('Failed to poll ride offers:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [token, isOnline, activeRide]);

  // Countdown for offer expiration
  useEffect(() => {
    if (!currentOffer) return;

    const timer = setInterval(() => {
      setOfferCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentOffer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOffer]);

  // Handle Logout
  const handleLogout = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setToken(null);
    setDriver(null);
    setActiveRide(null);
    setCurrentOffer(null);
    setIsOnline(false);
    localStorage.removeItem('alike_driver_token');
    localStorage.removeItem('alike_driver_profile');
    localStorage.removeItem('alike_driver_active_ride');
  };

  // Toggle Online/Offline
  const handleToggleOnline = async () => {
    if (!token || !driver) return;
    setTogglingStatus(true);
    try {
      const nextStatus = !isOnline;
      const res = await driverApi.updateStatus(nextStatus, token);
      setIsOnline(res.isOnline);
      setDriver((prev) => (prev ? { ...prev, isOnline: res.isOnline } : null));
      if (showToast) showToast(res.message, res.isOnline ? 'success' : 'info');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setTogglingStatus(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await driverApi.register({
        name: regName,
        phone: regPhone,
        email: regEmail || undefined,
        password: regPassword,
        vehicleType: regVehicleType,
        vehicleNumber: regVehicleNumber,
        vehicleModel: regVehicleModel || undefined,
        seatingCapacity: Number(regSeatingCapacity) || 4,
        licenseNumber: regLicenseNumber,
        licenseExpiryDate: regLicenseExpiry || undefined,
        aadhaarNumber: regAadhaarNumber || undefined,
        rcNumber: regRcNumber || undefined,
        insurancePolicyNumber: regInsurancePolicy || undefined,
        insuranceExpiryDate: regInsuranceExpiry || undefined,
        permitNumber: regPermitNumber || undefined,
        photoUrl: regPhotoUrl || undefined,
        bankDetails: regBankAcc
          ? {
              accountNumber: regBankAcc,
              ifscCode: regIfsc,
              upiId: regUpiId,
            }
          : undefined,
      });

      setAuthSuccess(res.message);
      setDriver(res.driver);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      const res = await driverApi.login(loginPhone, loginPassword);
      setToken(res.token);
      setDriver(res.driver);
      setIsOnline(res.driver.isOnline);
      if (showToast) showToast(`Welcome back, Captain ${res.driver.name}!`, 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP for Login
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await driverApi.sendOtp(otpLoginPhone);
      setOtpSent(true);
      setDebugOtpCode(res.debugOtp || null);
      if (showToast) showToast(res.message, 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP Login
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const res = await driverApi.verifyOtp(otpLoginPhone, otpCodeInput);
      setToken(res.token);
      setDriver(res.driver);
      setIsOnline(res.driver.isOnline);
      if (showToast) showToast(`OTP verified! Welcome, Captain ${res.driver.name}!`, 'success');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Accept Ride Offer
  const handleAcceptOffer = async () => {
    if (!currentOffer || !token) return;
    setLoading(true);
    try {
      const ride = await driverApi.acceptRide(currentOffer.bookingId || currentOffer._id, token);
      setActiveRide(ride);
      setCurrentOffer(null);
      if (showToast) showToast('Ride accepted! Navigate to pickup point.', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reject Ride Offer
  const handleRejectOffer = async () => {
    if (!currentOffer || !token) return;
    try {
      await driverApi.rejectRide(currentOffer.bookingId || currentOffer._id, token);
      setCurrentOffer(null);
      if (showToast) showToast('Ride offer declined.', 'info');
    } catch (err: any) {
      setCurrentOffer(null);
    }
  };

  // Mark Arrival at Pickup
  const handleMarkArrived = async () => {
    if (!activeRide || !token) return;
    setLoading(true);
    try {
      const ride = await driverApi.markArrived(activeRide.bookingId || activeRide._id, token);
      setActiveRide(ride);
      if (showToast) showToast('Arrival marked! Ask passenger for their 4-digit ride OTP.', 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Start Ride with OTP
  const handleStartRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide || !token) return;
    setVerifyingOtp(true);
    setOtpError('');

    try {
      const ride = await driverApi.startRide(
        activeRide.bookingId || activeRide._id,
        otpInput.trim(),
        token
      );
      setActiveRide(ride);
      setOtpInput('');
      if (showToast) showToast('OTP Verified! Trip has started. Drive safely.', 'success');
    } catch (err: any) {
      setOtpError(err.message || 'Incorrect OTP code.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Complete Ride
  const handleCompleteRide = async () => {
    if (!activeRide || !token) return;
    setLoading(true);
    try {
      const res = await driverApi.completeRide(
        activeRide.bookingId || activeRide._id,
        token,
        activeRide.distanceKm,
        activeRide.durationMinutes
      );

      if (activeRide.paymentMethod === 'cash') {
        setShowCashCollectedModal(activeRide.fare?.totalFare || 0);
      }

      setDriver((prev) =>
        prev
          ? {
              ...prev,
              totalRides: prev.totalRides + 1,
              earningsToday: prev.earningsToday + (res.driverEarnings || 0),
              totalEarnings: prev.totalEarnings + (res.driverEarnings || 0),
            }
          : null
      );

      setActiveRide(null);
      setShowRatePassengerModal(true);
      if (showToast) showToast(`Trip completed! ₹${res.driverEarnings} credited to wallet.`, 'success');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Emergency SOS
  const handleTriggerSos = async () => {
    if (!activeRide || !token) return;
    setLoading(true);
    try {
      const coords = driver?.location?.coordinates;
      const res = await driverApi.triggerSos(
        activeRide.bookingId || activeRide._id,
        token,
        coords ? coords[1] : undefined,
        coords ? coords[0] : undefined,
        'Captain pressed in-app Emergency SOS'
      );
      setShowSosModal(false);
      if (showToast) showToast(res.message, 'warning');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Report Accident
  const handleReportAccident = async () => {
    if (!activeRide || !token) return;
    setLoading(true);
    try {
      await driverApi.reportAccident(
        activeRide.bookingId || activeRide._id,
        accidentSeverity,
        accidentDesc,
        token
      );
      setShowAccidentModal(false);
      if (showToast) showToast('Incident reported to central safety dispatch.', 'info');
    } catch (err: any) {
      if (showToast) showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Submit Passenger Rating
  const handleSubmitPassengerRating = async () => {
    if (!token) return;
    try {
      await driverApi.ratePassenger(
        activeRide?.bookingId || 'recent',
        passengerRatingStars,
        passengerFeedback,
        ['Polite', 'Punctual'],
        token
      );
      setShowRatePassengerModal(false);
      if (showToast) showToast('Passenger rating recorded!', 'success');
    } catch (err: any) {
      setShowRatePassengerModal(false);
    }
  };

  // Open Navigation in External Maps
  const handleOpenNavigation = (lat?: number, lng?: number, address?: string) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else if (address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  // Fetch Ride History
  const handleOpenHistory = async () => {
    if (!token) return;
    setLoadingHistory(true);
    setShowHistoryModal(true);
    try {
      const rides = await driverApi.getHistory(token);
      setRideHistory(rides);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className={`min-h-screen ${isLightMode ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-950 text-neutral-100'} font-sans pb-16`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-neutral-900/80 border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="text-xs font-mono font-bold text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← <span className="hidden sm:inline">Storefront</span>
            </button>
            <div className="h-4 w-px bg-neutral-800" />
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Car className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-sm font-black tracking-tight flex items-center gap-1.5">
                  <span>Alike Captain Portal</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                    Phase 6 Live
                  </span>
                </h1>
                <p className="text-[10px] text-neutral-400 font-mono">
                  Driver Onboarding • GPS Availability • OTP Verification • Safety
                </p>
              </div>
            </div>
          </div>

          {token && driver && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenHistory}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                title="Ride History"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-rose-400 hover:bg-rose-950 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* VIEW 1: AUTHENTICATION (Login / OTP Login / Register)                     */}
        {/* ========================================================================= */}
        {!token ? (
          <div className="max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95">
            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 p-1 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-bold font-mono">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-emerald-500 text-black font-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp_login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'otp_login' ? 'bg-emerald-500 text-black font-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                OTP Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'register' ? 'bg-emerald-500 text-black font-black shadow' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Apply as Captain
              </button>
            </div>

            {/* Notifications */}
            {authError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* TAB 1: PASSWORD LOGIN */}
            {authMode === 'login' && (
              <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-white">Captain Account Login</h2>
                  <p className="text-xs text-neutral-400">Sign in with your registered mobile phone number and password.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9811234567"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In as Captain'}
                </button>
              </form>
            )}

            {/* TAB 2: OTP LOGIN */}
            {authMode === 'otp_login' && (
              <div className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-4">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-white">OTP-Based Instant Login</h2>
                  <p className="text-xs text-neutral-400">Receive a one-time 6-digit verification code directly on your mobile.</p>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendLoginOtp} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Registered Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 9811234567"
                        value={otpLoginPhone}
                        onChange={(e) => setOtpLoginPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : 'Send 6-Digit OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
                      <div className="flex justify-between text-neutral-400">
                        <span>Code sent to:</span>
                        <span className="text-white font-bold">{otpLoginPhone}</span>
                      </div>
                      {debugOtpCode && (
                        <div className="flex justify-between text-amber-400 font-bold">
                          <span>Testing OTP:</span>
                          <span>{debugOtpCode}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="6-digit code"
                        value={otpCodeInput}
                        onChange={(e) => setOtpCodeInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-neutral-800 text-base font-mono font-bold tracking-widest text-center text-emerald-400 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs hover:bg-neutral-700 cursor-pointer"
                      >
                        Change Number
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow transition-all disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify & Enter'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: DRIVER REGISTRATION (Module 2E) */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-5">
                <div className="space-y-1">
                  <h2 className="text-base font-black text-white">Join Alike Driver Guild</h2>
                  <p className="text-xs text-neutral-400">
                    Complete registration with your vehicle, commercial driving licence, and bank details for admin approval.
                  </p>
                </div>

                {/* Section A: Personal & Account */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    1. Personal & Credentials
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Mobile Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit phone"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Aadhaar / National ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1234 5678 9012"
                        value={regAadhaarNumber}
                        onChange={(e) => setRegAadhaarNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Vehicle Category & Capacity */}
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    2. Vehicle Class & Registration
                  </span>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Select Vehicle Category *</label>
                    <select
                      value={regVehicleType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegVehicleType(val);
                        const found = VEHICLE_OPTIONS.find((v) => v.key === val);
                        if (found) setRegSeatingCapacity(found.capacity);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500 font-bold"
                    >
                      {VEHICLE_OPTIONS.map((v) => (
                        <option key={v.key} value={v.key}>
                          {v.icon} {v.label} ({v.capacity} passenger capacity)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Plate Number (RC) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL 01 AB 1234"
                        value={regVehicleNumber}
                        onChange={(e) => setRegVehicleNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono uppercase text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Vehicle Model</label>
                      <input
                        type="text"
                        placeholder="e.g. Maruti Dzire White"
                        value={regVehicleModel}
                        onChange={(e) => setRegVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Passenger Capacity</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        value={regSeatingCapacity}
                        onChange={(e) => setRegSeatingCapacity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Driving License & Regulatory Documents */}
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    3. Legal Documents & Expiries
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Driving Licence Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. DL-0420110012345"
                        value={regLicenseNumber}
                        onChange={(e) => setRegLicenseNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono uppercase text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Licence Expiry Date</label>
                      <input
                        type="date"
                        value={regLicenseExpiry}
                        onChange={(e) => setRegLicenseExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Insurance Policy No.</label>
                      <input
                        type="text"
                        placeholder="e.g. POL-998822"
                        value={regInsurancePolicy}
                        onChange={(e) => setRegInsurancePolicy(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Insurance Expiry Date</label>
                      <input
                        type="date"
                        value={regInsuranceExpiry}
                        onChange={(e) => setRegInsuranceExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section D: Direct Bank & UPI Settlement */}
                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    4. Payout Banking & UPI (85% Ride Fare Earnings)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Bank Account No.</label>
                      <input
                        type="text"
                        placeholder="Account number"
                        value={regBankAcc}
                        onChange={(e) => setRegBankAcc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Bank IFSC Code</label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC0001234"
                        value={regIfsc}
                        onChange={(e) => setRegIfsc(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono uppercase text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Instant UPI VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi"
                        value={regUpiId}
                        onChange={(e) => setRegUpiId(e.target.value.toLowerCase())}
                        className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-xl shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Captain Application'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: ACTIVE CAPTAIN DASHBOARD & LIVE DISPATCH                          */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Top Captain Card & Duty Switch */}
            <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xl overflow-hidden shrink-0">
                  {driver.photoUrl ? (
                    <img src={driver.photoUrl} alt={driver.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{VEHICLE_OPTIONS.find((v) => v.key === driver.vehicleType)?.icon || '🚗'}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">{driver.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono font-bold uppercase">
                      {driver.vehicleType}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono mt-0.5">
                    <span className="font-bold text-white">{driver.vehicleNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-current" />
                      {(driver.rating || 5.0).toFixed(1)}
                    </span>
                    <span>•</span>
                    <span>{driver.totalRides || 0} rides</span>
                  </div>
                </div>
              </div>

              {/* Duty Toggle Button (Module 2F.1) */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 block">Duty Status</span>
                  <span className={`text-xs font-black font-mono flex items-center gap-1.5 ${isOnline ? 'text-emerald-400' : 'text-neutral-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'}`} />
                    {isOnline ? 'ON DUTY' : 'OFFLINE'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleOnline}
                  disabled={togglingStatus}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all ${
                    isOnline
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/20'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isOnline ? 'Go Offline' : 'Go Online'}</span>
                </button>
              </div>
            </div>

            {/* Document Expiry Warnings (Module 2E.12) */}
            {driver.documentExpiryAlerts && driver.documentExpiryAlerts.some((a) => a.status !== 'valid') && (
              <div className="space-y-2">
                {driver.documentExpiryAlerts
                  .filter((a) => a.status !== 'valid')
                  .map((alert, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl flex items-center justify-between text-xs font-bold ${
                        alert.status === 'expired'
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{alert.message}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-black/40">
                        {alert.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* GPS Warning if weak */}
            {gpsError && isOnline && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2 font-mono">
                <Compass className="w-4 h-4 shrink-0 animate-spin" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Daily Earnings Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Earnings Today</span>
                <p className="text-xl font-black font-mono text-emerald-400">₹{driver.earningsToday || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Total Lifetime</span>
                <p className="text-xl font-black font-mono text-white">₹{driver.totalEarnings || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Trips Completed</span>
                <p className="text-xl font-black font-mono text-white">{driver.totalRides || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-400">Captain Rating</span>
                <p className="text-xl font-black font-mono text-amber-400 flex items-center gap-1">
                  ★ {(driver.rating || 5.0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* INCOMING RIDE OFFER MODAL / CARD (Module 2F.3 - 2F.6)                  */}
            {/* ===================================================================== */}
            {currentOffer && !activeRide && (
              <div className="p-6 rounded-3xl bg-neutral-900 border-2 border-emerald-500/60 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-black font-mono font-black text-xs uppercase animate-pulse">
                      New Ride Offer
                    </span>
                    <span className="text-xs font-mono text-neutral-400">{currentOffer.bookingId}</span>
                  </div>

                  {/* Countdown Timer (Module 2F.10) */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{offerCountdown}s remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Route */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Pickup Passenger</span>
                        <p className="text-xs font-bold text-white line-clamp-2">{currentOffer.pickup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Destination</span>
                        <p className="text-xs font-bold text-white line-clamp-2">{currentOffer.destination.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fare & Passenger */}
                  <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Estimated Fare</span>
                      <p className="text-2xl font-black font-mono text-emerald-400">
                        ₹{currentOffer.fare?.totalFare}
                        <span className="text-xs font-normal text-neutral-500 font-mono ml-2">({currentOffer.distanceKm} km)</span>
                      </p>
                      <p className="text-[10px] font-mono text-neutral-400 mt-1">
                        Settlement: 85% payout (₹{Math.round((currentOffer.fare?.totalFare || 0) * 0.85)})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-900 mt-2 text-[11px] font-mono text-neutral-400 flex justify-between">
                      <span>Passenger: {currentOffer.customerName || 'Customer'}</span>
                      <span className="uppercase text-amber-400">{currentOffer.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Accept or Reject */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRejectOffer}
                    className="py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Decline (Pass)
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptOffer}
                    disabled={loading}
                    className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-xl shadow-emerald-500/20 active:scale-98 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Accepting...' : 'Accept Ride Now'}
                  </button>
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* ACTIVE RIDE WORKFLOW (Module 2G & 2H)                                  */}
            {/* ===================================================================== */}
            {activeRide && (
              <div className="p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {activeRide.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{activeRide.bookingId}</span>
                  </div>

                  {/* Safety Actions Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAccidentModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Report Issue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSosModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SOS Emergency</span>
                    </button>
                  </div>
                </div>

                {/* Passenger Info & Dial */}
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Passenger Details</span>
                    <h3 className="text-sm font-black text-white">{activeRide.customerName}</h3>
                    <p className="text-xs text-neutral-400 font-mono">{activeRide.customerPhone}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${activeRide.customerPhone}`}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Passenger</span>
                    </a>
                  </div>
                </div>

                {/* Pickup & Destination Addresses */}
                <div className="space-y-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Pickup Point</span>
                        <p className="font-bold text-white">{activeRide.pickup?.address}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenNavigation(
                          activeRide.pickup?.lat,
                          activeRide.pickup?.lng,
                          activeRide.pickup?.address
                        )
                      }
                      className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 text-[11px] font-bold flex items-center gap-1 hover:text-white cursor-pointer shrink-0"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Navigate</span>
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-3 pt-2 border-t border-neutral-900">
                    <div className="flex items-start gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Dropoff Destination</span>
                        <p className="font-bold text-white">{activeRide.destination?.address}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenNavigation(
                          activeRide.destination?.lat,
                          activeRide.destination?.lng,
                          activeRide.destination?.address
                        )
                      }
                      className="px-3 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-emerald-400 text-[11px] font-bold flex items-center gap-1 hover:text-white cursor-pointer shrink-0"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Navigate</span>
                    </button>
                  </div>
                </div>

                {/* TRIP ACTIONS: ARRIVED -> ENTER OTP -> COMPLETE */}
                <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
                  {/* STEP 1: Driver Arrives at Pickup */}
                  {['accepted', 'arriving'].includes(activeRide.status) && (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-400 font-mono">
                        Navigate to passenger pickup address above. Click when you have safely parked at pickup spot.
                      </p>
                      <button
                        type="button"
                        onClick={handleMarkArrived}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'I Have Arrived at Pickup'}
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Passenger Pickup Verification OTP (Module 2G) */}
                  {activeRide.status === 'arrived' && (
                    <form onSubmit={handleStartRide} className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs font-black text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          <span>Passenger Pickup OTP Verification</span>
                        </span>
                        <p className="text-xs text-neutral-400">
                          Ask passenger for their 4-digit ride OTP. Do NOT start driving until the code is verified.
                        </p>
                      </div>

                      {otpError && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                          {otpError}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="4-digit OTP"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="w-40 px-4 py-2.5 rounded-xl bg-black border border-neutral-800 text-center font-mono text-lg font-black tracking-widest text-emerald-400 outline-none focus:border-emerald-500"
                        />
                        <button
                          type="submit"
                          disabled={verifyingOtp || otpInput.length !== 4}
                          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                        >
                          {verifyingOtp ? 'Verifying...' : 'Verify OTP & Start Trip'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: En Route & Complete Trip (Module 2H) */}
                  {['started', 'in_progress'].includes(activeRide.status) && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span>Trip in Progress</span>
                        <span className="text-emerald-400 font-bold">₹{activeRide.fare?.totalFare} Billed</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCompleteRide}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-xl shadow-purple-600/30 transition-all disabled:opacity-50"
                      >
                        {loading ? 'Completing...' : 'Dropoff Passenger & Settle Trip'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* CASH COLLECTED POPUP MODAL                                                */}
      {/* ========================================================================= */}
      {showCashCollectedModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Collect Cash from Passenger</h3>
            <p className="text-3xl font-black font-mono text-emerald-400">₹{showCashCollectedModal}</p>
            <p className="text-xs text-neutral-400">
              Please collect exact cash fare from passenger before they exit the vehicle.
            </p>
            <button
              type="button"
              onClick={() => setShowCashCollectedModal(null)}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Cash Collected
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMERGENCY SOS MODAL (Module 2I.1)                                         */}
      {/* ========================================================================= */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-rose-500/40 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-rose-400 uppercase tracking-wider">Emergency SOS Trigger</h3>
              <p className="text-xs text-neutral-300">
                This broadcasts an immediate critical safety alarm to the Central Dispatch desk with your live GPS location.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900 text-xs font-mono text-left space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>National Emergency:</span>
                <a href="tel:112" className="text-white font-bold underline">112</a>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Alike Safety Desk:</span>
                <a href="tel:+911140007433" className="text-emerald-400 font-bold underline">+91 11-4000-RIDE</a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="py-3 rounded-2xl bg-neutral-800 text-neutral-300 font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerSos}
                disabled={loading}
                className="py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-xl shadow-rose-600/40"
              >
                Confirm SOS Broadcast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACCIDENT / BREAKDOWN MODAL (Module 2I.7)                                  */}
      {/* ========================================================================= */}
      {showAccidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Report Breakdown / Incident</span>
              </h3>
              <button onClick={() => setShowAccidentModal(false)} className="text-neutral-500 hover:text-white text-sm">✕</button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Severity</label>
                <select
                  value={accidentSeverity}
                  onChange={(e) => setAccidentSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none"
                >
                  <option value="minor">Minor Breakdown (Flat tyre, engine issue)</option>
                  <option value="moderate">Moderate Collision / Road Blockage</option>
                  <option value="critical">Critical Accident / Medical Emergency</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase font-mono text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={accidentDesc}
                  onChange={(e) => setAccidentDesc(e.target.value)}
                  placeholder="Explain what happened and what assistance is needed..."
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAccidentModal(false)}
                className="py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs uppercase"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleReportAccident}
                disabled={loading}
                className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RATE PASSENGER MODAL (Module 2I.9)                                        */}
      {/* ========================================================================= */}
      {showRatePassengerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-neutral-900 border border-neutral-800 text-center space-y-4">
            <h3 className="text-base font-black text-white">Rate Passenger</h3>
            <p className="text-xs text-neutral-400">How was your experience with this rider?</p>

            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setPassengerRatingStars(star)}
                  className="text-2xl transition-transform hover:scale-125 cursor-pointer"
                >
                  {star <= passengerRatingStars ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Optional rider feedback..."
              value={passengerFeedback}
              onChange={(e) => setPassengerFeedback(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none"
            />

            <button
              type="button"
              onClick={handleSubmitPassengerRating}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIDE HISTORY MODAL                                                        */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between sticky top-0 bg-neutral-900 py-2 border-b border-neutral-800">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <span>Captain Trip History</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-neutral-500 hover:text-white text-sm">✕</button>
            </div>

            {loadingHistory ? (
              <p className="text-center py-8 text-neutral-500 text-xs font-mono">Loading trip records...</p>
            ) : rideHistory.length === 0 ? (
              <p className="text-center py-8 text-neutral-500 text-xs font-mono">No past rides recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {rideHistory.map((r) => (
                  <div key={r._id} className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs space-y-2">
                    <div className="flex justify-between items-center font-mono">
                      <span className="font-bold text-white">{r.bookingId}</span>
                      <span className="text-emerald-400 font-bold">₹{r.fare?.driverEarnings || Math.round((r.fare?.totalFare || 0) * 0.85)} earned</span>
                    </div>
                    <p className="text-neutral-400 text-[11px] truncate">{r.pickup?.address} → {r.destination?.address}</p>
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Status: {r.status}</span>
                      <span>{r.distanceKm} km • {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPortal;
