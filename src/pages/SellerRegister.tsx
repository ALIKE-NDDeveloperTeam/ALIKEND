<<<<<<< HEAD
import { useState, useEffect, FormEvent } from 'react';
=======
import { useState, FormEvent } from 'react';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  BadgePercent,
<<<<<<< HEAD
=======
  CheckCircle,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  TrendingUp,
  CreditCard,
  Building,
  FileCheck,
  Landmark,
<<<<<<< HEAD
  KeyRound,
  ChevronDown,
  ChevronUp,
  RefreshCw,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
} from 'lucide-react';
import Logo from '../components/Logo';
import { sellerApi, RegisterSellerPayload } from '../services/sellerApi';
import { SellerProfile } from '../types';

<<<<<<< HEAD
export type SellerAuthMode = 'login' | 'signup' | 'forgot_password';

interface SellerRegisterProps {
  initialMode?: SellerAuthMode;
=======
interface SellerRegisterProps {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  onRegisterSuccess?: (seller: SellerProfile) => void;
  onLoginSuccess?: (seller: SellerProfile) => void;
  onNavigateToDashboard?: () => void;
  onNavigateHome?: () => void;
<<<<<<< HEAD
  onNavigate?: (view: string) => void;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function SellerRegister({
<<<<<<< HEAD
  initialMode = 'login',
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  onRegisterSuccess,
  onLoginSuccess,
  onNavigateToDashboard,
  onNavigateHome,
<<<<<<< HEAD
  onNavigate,
  showToast,
  isLightMode = false,
}: SellerRegisterProps) {
  const [mode, setMode] = useState<SellerAuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
  }, [initialMode]);

  const switchMode = (nextMode: SellerAuthMode) => {
    setMode(nextMode);
    setErrorMsg('');
    if (onNavigate) {
      if (nextMode === 'login') onNavigate('seller_login');
      else if (nextMode === 'signup') onNavigate('seller_signup');
      else if (nextMode === 'forgot_password') onNavigate('seller_forgot_password');
    }
  };

  // ==========================================
  // 1. SIGN UP FORM STATE
  // ==========================================
=======
  showToast,
  isLightMode = false,
}: SellerRegisterProps) {
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Registration Form State - Basic Info
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
<<<<<<< HEAD
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [businessAddress, setBusinessAddress] = useState('');

  // Optional KYC & Bank Details (can be provided at signup or later in Seller Dashboard)
  const [showKycFields, setShowKycFields] = useState(false);
=======
  const [businessAddress, setBusinessAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State - KYC & Bank Details
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  const [panNumber, setPanNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [bankAccountHolderName, setBankAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [bankName, setBankName] = useState('');

<<<<<<< HEAD
  // Post-Signup Email Verification State
  const [registeredSeller, setRegisteredSeller] = useState<SellerProfile | null>(null);
  const [verificationOtpInput, setVerificationOtpInput] = useState('');
  const [sandboxOtpPreview, setSandboxOtpPreview] = useState<string | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailVerifiedDone, setEmailVerifiedDone] = useState(false);

  // ==========================================
  // 2. SIGN IN FORM STATE (Email or Mobile + Password)
  // ==========================================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // ==========================================
  // 3. FORGOT PASSWORD STATE
  // ==========================================
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [resetDevOtp, setResetDevOtp] = useState<string | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
=======
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
<<<<<<< HEAD

  // Password Strength Evaluation
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperOrLower: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    matchesConfirm: confirmPassword.length > 0 && password === confirmPassword,
  };

  // ==========================================
  // HANDLER: SELLER SIGN UP
  // ==========================================
=======
  const [successSubmitted, setSuccessSubmitted] = useState<SellerProfile | null>(null);

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

<<<<<<< HEAD
    if (!ownerName.trim() || !shopName.trim() || !email.trim() || !mobileNumber.trim()) {
      setErrorMsg('Please fill out Full Name, Store Name, Email Address, and Mobile Number.');
      showToast('Please complete all required seller fields.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMsg('Password must be at least 8 characters long and contain both letters and numbers.');
      showToast('Please choose a stronger password (min 8 chars with letters & numbers).', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('You must agree to the Seller Terms and Conditions to create a seller account.');
      showToast('Please accept the Seller Terms & Conditions.', 'warning');
      return;
    }

    // Optional KYC validations if user expanded KYC section and entered values
    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(cleanPan)) {
        setErrorMsg('Invalid PAN format. Expected format: ABCDE1234F (10 characters).');
        return;
      }
=======
    if (!shopName.trim() || !ownerName.trim() || !mobileNumber.trim() || !email.trim() || !businessAddress.trim()) {
      setErrorMsg('All basic merchant registration fields are required.');
      showToast('Please fill out all required merchant fields.', 'warning');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Please choose a secure password of at least 6 characters.');
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    // Client-side KYC validations
    const cleanPan = panNumber.trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!cleanPan) {
      setErrorMsg('PAN number is required for KYC compliance.');
      showToast('PAN number is required.', 'warning');
      return;
    }
    if (!panRegex.test(cleanPan)) {
      setErrorMsg('Invalid PAN format. Expected format: ABCDE1234F (10 characters: 5 letters, 4 digits, 1 letter).');
      showToast('Invalid PAN number format.', 'error');
      return;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    }

    const cleanGstin = gstin.trim().toUpperCase();
    if (cleanGstin) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(cleanGstin)) {
        setErrorMsg('Invalid GSTIN format. Expected format: 22ABCDE1234F1Z5 (15 characters).');
<<<<<<< HEAD
=======
        showToast('Invalid GSTIN format.', 'error');
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        return;
      }
    }

<<<<<<< HEAD
    const cleanIfsc = bankIFSC.trim().toUpperCase();
    if (cleanIfsc) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(cleanIfsc)) {
        setErrorMsg('Invalid IFSC code format. Expected format: SBIN0001234 (11 characters).');
        return;
      }
=======
    if (!bankAccountHolderName.trim()) {
      setErrorMsg('Bank account holder name is required.');
      showToast('Bank account holder name is required.', 'warning');
      return;
    }
    if (!bankAccountNumber.trim()) {
      setErrorMsg('Bank account number is required for payout settlements.');
      showToast('Bank account number is required.', 'warning');
      return;
    }
    const cleanIfsc = bankIFSC.trim().toUpperCase();
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!cleanIfsc || !ifscRegex.test(cleanIfsc)) {
      setErrorMsg('Invalid IFSC code format. Expected format: SBIN0001234 (11 characters).');
      showToast('Invalid IFSC code format.', 'error');
      return;
    }
    if (!bankName.trim()) {
      setErrorMsg('Bank name is required.');
      showToast('Bank name is required.', 'warning');
      return;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    }

    setLoading(true);
    try {
      const payload: RegisterSellerPayload = {
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim().toLowerCase(),
<<<<<<< HEAD
        password,
        confirmPassword,
        agreedToTerms: true,
        businessAddress: businessAddress.trim() || undefined,
        panNumber: cleanPan || undefined,
        gstin: cleanGstin || undefined,
        bankAccountHolderName: bankAccountHolderName.trim() || undefined,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        bankIFSC: cleanIfsc || undefined,
        bankName: bankName.trim() || undefined,
=======
        businessAddress: businessAddress.trim(),
        password,
        panNumber: cleanPan,
        gstin: cleanGstin || undefined,
        bankAccountHolderName: bankAccountHolderName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankIFSC: cleanIfsc,
        bankName: bankName.trim(),
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      };

      const res = await sellerApi.register(payload);
      setLoading(false);

      if (res.success && res.seller) {
<<<<<<< HEAD
        setRegisteredSeller(res.seller);
        if (res.verificationOtpPreview) {
          setSandboxOtpPreview(res.verificationOtpPreview);
          setVerificationOtpInput(res.verificationOtpPreview);
        }
        showToast('Seller account registered! Status: Pending Administrator Approval.', 'success');
=======
        setSuccessSubmitted(res.seller);
        showToast('Application submitted! Your seller application is pending admin approval.', 'success');
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        if (onRegisterSuccess) {
          onRegisterSuccess(res.seller);
        }
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setLoading(false);
<<<<<<< HEAD
      const msg = err.message || 'Network error occurred while submitting seller registration.';
=======
      const msg = err.message || 'Network error occurred while submitting seller application.';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

<<<<<<< HEAD
  const handleVerifySignupEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!verificationOtpInput.trim()) {
      setErrorMsg('Please enter the 6-digit email verification code.');
      return;
    }
    setVerifyingEmail(true);
    setErrorMsg('');
    try {
      await sellerApi.verifyEmail(verificationOtpInput.trim());
      setEmailVerifiedDone(true);
      if (registeredSeller) {
        const updated = { ...registeredSeller, emailVerified: true };
        setRegisteredSeller(updated);
        sellerApi.setStoredProfile(updated);
      }
      showToast('Email ownership verified! Redirecting to Seller Dashboard...', 'success');
      setTimeout(() => {
        if (onNavigateToDashboard) onNavigateToDashboard();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid verification code.');
      showToast(err.message || 'Verification failed', 'error');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // ==========================================
  // HANDLER: SELLER SIGN IN (Email or Mobile + Password)
  // ==========================================
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

<<<<<<< HEAD
    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter both your Seller Email or Mobile Number and your Password.');
=======
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both your seller email and password.');
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      return;
    }

    setLoading(true);
    try {
<<<<<<< HEAD
      const res = await sellerApi.login(loginIdentifier.trim(), loginPassword, rememberMe);
      setLoading(false);

      if (res.success && res.seller) {
        showToast(`Welcome, ${res.seller.shopName || res.seller.ownerName}!`, 'success');
=======
      const res = await sellerApi.login(loginEmail.trim().toLowerCase(), loginPassword);
      setLoading(false);

      if (res.success && res.seller) {
        showToast(`Welcome back, ${res.seller.shopName || res.seller.ownerName}!`, 'success');
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        if (onLoginSuccess) {
          onLoginSuccess(res.seller);
        }
        if (onNavigateToDashboard) {
          onNavigateToDashboard();
        }
      } else {
<<<<<<< HEAD
        setErrorMsg(res.message || 'Invalid email/mobile number or password.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Invalid email/mobile number or password.';
=======
        setErrorMsg(res.message || 'Login failed. Please verify your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      const msg = err.message || 'Invalid credentials or pending approval.';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      setErrorMsg(msg);
      showToast(msg, 'error');
    }
  };

<<<<<<< HEAD
  // ==========================================
  // HANDLER: SELLER FORGOT & RESET PASSWORD
  // ==========================================
  const handleRequestPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetIdentifier.trim()) {
      setErrorMsg('Please enter your registered Seller Email Address or Mobile Number.');
      return;
    }

    setLoading(true);
    try {
      const res = await sellerApi.forgotPassword(resetIdentifier.trim());
      setLoading(false);
      setResetStep('verify');
      if (res.devOtp) {
        setResetDevOtp(res.devOtp);
        setResetOtp(res.devOtp);
      }
      showToast(res.message || 'Password recovery code sent!', 'info');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Could not process password reset request.');
    }
  };

  const handleConfirmPasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetOtp.trim() || !newResetPassword) {
      setErrorMsg('Please enter the 6-digit recovery code and your new password.');
      return;
    }
    if (newResetPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await sellerApi.resetPassword({
        identifier: resetIdentifier.trim(),
        otp: resetOtp.trim(),
        newPassword: newResetPassword,
        confirmPassword: confirmResetPassword,
      });
      setLoading(false);
      showToast(res.message || 'Password reset successful! Please sign in.', 'success');
      setLoginIdentifier(resetIdentifier.trim());
      setResetStep('request');
      setResetOtp('');
      setResetDevOtp(null);
      setNewResetPassword('');
      setConfirmResetPassword('');
      switchMode('login');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to reset password.');
    }
  };

  return (
    <div
      id="seller-portal-root"
      className="min-h-[85vh] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center animate-fade-in"
    >
      {/* Top Bar: Back to Storefront & Route Indicator */}
      <div className="w-full mb-3 flex items-center justify-between gap-2 flex-wrap">
=======
  return (
    <div id="seller-portal-root" className="min-h-[85vh] py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center justify-center animate-fade-in">
      {/* Back to Home Navigation Button (Desktop & Mobile) */}
      <div className="w-full mb-3 flex items-center justify-start">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        <button
          type="button"
          id="seller-back-home-btn"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold text-neutral-700 hover:text-black dark:text-neutral-200 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs cursor-pointer group active:scale-95"
        >
          <span className="text-base font-bold leading-none transition-transform group-hover:-translate-x-1">←</span>
<<<<<<< HEAD
          <span>Back to Storefront</span>
        </button>

        {/* Dedicated Seller Portal Mode Tabs */}
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#E91269] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Seller Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#E91269] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Seller Sign Up
          </button>
          <button
            type="button"
            onClick={() => switchMode('forgot_password')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              mode === 'forgot_password'
                ? 'bg-[#E91269] text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Forgot Password
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container Card */}
      <div className="w-full bg-white dark:bg-[#121214] rounded-3xl sm:rounded-[32px] shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col lg:flex-row transition-all duration-300 min-h-[640px]">
        {/* LEFT PANEL: Branding & Dedicated Seller Portal Identity */}
        <div className="w-full lg:w-[42%] bg-gradient-to-br from-[#0e0e11] via-[#2b0819] to-[#E91269] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FF1E82]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E91269]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <Logo size="md" isLightMode={false} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white/90">
                <Store className="w-3.5 h-3.5 text-[#FF479C]" />
                <span>Dedicated Seller Portal</span>
              </div>
            </div>

            <div className="pt-2 sm:pt-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#FF479C]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ALIKE-ND Merchant Network</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight tracking-tight">
                {mode === 'signup'
                  ? 'Create Your Seller Account'
                  : mode === 'forgot_password'
                  ? 'Seller Account Recovery'
                  : 'Seller Portal Sign In'}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                {mode === 'signup'
                  ? 'Register your independent merchant storefront. New seller accounts undergo administrator verification before product publishing is unlocked.'
                  : mode === 'forgot_password'
                  ? 'Reset your seller portal password securely using your registered business email or mobile number.'
                  : 'Sign in with your registered Seller Email or Mobile Number and Password to access your dedicated Merchant Dashboard.'}
              </p>
            </div>

            <div className="pt-2 space-y-2.5 hidden sm:block">
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Separate Seller Identity & Isolated Permissions</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <BadgePercent className="w-3.5 h-3.5" />
                </div>
                <span>5% Introductory Commission & Direct Bank Payouts</span>
=======
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Split-Screen Container Card */}
      <div className="w-full bg-white dark:bg-[#121214] rounded-3xl sm:rounded-[32px] shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden flex flex-col lg:flex-row transition-all duration-300 min-h-[660px]">
        
        {/* ========================================================
            LEFT PANEL: Colorful Gradient Background (Fixed / Sticky)
            ======================================================== */}
        <div className="w-full lg:w-[44%] xl:w-[42%] bg-gradient-to-br from-[#0e0e11] via-[#2b0819] to-[#E91269] text-white p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Subtle Ambient Glow Overlays */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FF1E82]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#E91269]/25 rounded-full blur-3xl pointer-events-none" />

          {/* Top Section: Branding & Tagline */}
          <div className="relative z-10 space-y-6">
            {/* ALIKE ND Official Logo */}
            <div className="flex items-center justify-between">
              <Logo size="md" isLightMode={false} />
              
              {/* Merchant Portal Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white/90">
                <Store className="w-3.5 h-3.5 text-[#FF479C]" />
                <span>Merchant Hub</span>
              </div>
            </div>

            {/* Portal Heading & Description */}
            <div className="pt-2 sm:pt-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#FF479C]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ALIKE Merchant Marketplace</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-bold text-white leading-tight tracking-tight">
                {mode === 'register' ? 'Join the Alike Marketplace' : 'Welcome Back, Merchant'}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
                List and sell your luxury products, electronics, and fashion directly to verified buyers across India.
              </p>
            </div>

            {/* Merchant Highlights */}
            <div className="pt-2 space-y-2.5 hidden sm:block">
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <BadgePercent className="w-3.5 h-3.5" />
                </div>
                <span>5% Commission on introductory boutique collections</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
<<<<<<< HEAD
                <span>10–20 Min Quick Delivery & Pan-India Dispatch</span>
=======
                <span>Automated logistics & pan-India courier settlements</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-lg bg-[#E91269]/30 flex items-center justify-center shrink-0 text-[#FF479C]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Verified buyer network with guaranteed payouts</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              </div>
            </div>
          </div>

<<<<<<< HEAD
          <div className="relative z-10 pt-6 border-t border-white/10 mt-6">
            <div className="text-xs text-neutral-300 mb-2 font-medium">
              {mode === 'signup' ? 'Already have a seller account?' : 'New merchant looking to sell on Alike-ND?'}
=======
          {/* Bottom Action: Mode Switcher Pill Button */}
          <div className="relative z-10 pt-6 sm:pt-8 border-t border-white/10 mt-6">
            <div className="text-xs text-neutral-300 mb-2 font-medium">
              {mode === 'register' ? 'Existing registered partner?' : 'Want to sell on Alike?'}
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
            </div>
            <button
              type="button"
              id="seller-mode-toggle-btn"
<<<<<<< HEAD
              onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs tracking-wide uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>{mode === 'signup' ? 'Go to Seller Sign In' : 'Create Seller Account'}</span>
=======
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setErrorMsg('');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs tracking-wide uppercase transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>{mode === 'register' ? 'Already a Seller? Sign In' : 'New Merchant? Apply to Sell'}</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              <ArrowRight className="w-3.5 h-3.5 text-[#E91269]" />
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* RIGHT PANEL: Form Views */}
        <div className="w-full lg:w-[58%] bg-white dark:bg-[#121214] p-6 sm:p-8 lg:p-10 flex flex-col justify-center overflow-y-auto">
          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs">
=======
        {/* ========================================================
            RIGHT PANEL: White Background with Form Fields
            ======================================================== */}
        <div className="w-full lg:w-[56%] xl:w-[58%] bg-white dark:bg-[#121214] p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-center overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs animate-shake">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

<<<<<<< HEAD
          {/* ========================================================
              VIEW 1: SELLER SIGN IN (/seller/login) — NO GOOGLE LOGIN
              ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto w-full animate-fade-in">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E91269]/10 text-[#E91269] mb-2">
                  <Lock className="w-3 h-3" /> Dedicated Seller Authentication
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Seller Sign In
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Enter your registered Seller Email Address or 10-digit Mobile Number and Password.
                </p>
              </div>

              <div className="space-y-4">
                {/* Email or Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Email Address or Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-identifier"
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="e.g. sara@example.com or 9876543210"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetIdentifier(loginIdentifier);
                        switchMode('forgot_password');
                      }}
                      className="text-[11px] font-bold text-[#E91269] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your seller password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#E91269] cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="seller-login-submit-btn"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Seller Dashboard</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Notice: Separate from Customer & No Social Login */}
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1">
                <div className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E91269]" />
                  <span>Merchant Security Policy</span>
                </div>
                <p>
                  Seller accounts are strictly separate from customer accounts. Social/Google sign-in is disabled for merchant portals — a verified Seller Email/Mobile and Password are required.
                </p>
                <p className="font-mono text-[10px] text-neutral-400 pt-1">
                  Demo Seller: <strong className="text-neutral-700 dark:text-neutral-200">sara@example.com</strong> (or <strong className="text-neutral-700 dark:text-neutral-200">9876543210</strong>) / <strong className="text-neutral-700 dark:text-neutral-200">seller123</strong>
                </p>
              </div>

              <div className="pt-2 text-center text-xs text-neutral-500 dark:text-neutral-400">
                Don&apos;t have a seller account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-bold text-[#E91269] hover:underline cursor-pointer"
                >
                  Create a Seller Account
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              VIEW 2: SELLER SIGN UP (/seller/signup)
              ======================================================== */}
          {mode === 'signup' && (
            <div>
              {registeredSeller ? (
                <div className="space-y-5 py-2 max-w-lg mx-auto animate-fade-in">
                  <div className="text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400/40 shadow-md">
                      {emailVerifiedDone ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : <Clock className="w-7 h-7" />}
                    </div>
                    <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                      Seller Account Created — Pending Approval
                    </h2>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      Your seller account for <strong className="text-neutral-900 dark:text-white">{registeredSeller.shopName}</strong> has been created with status{' '}
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-mono font-bold text-[11px]">
                        PENDING REVIEW
                      </span>.
                    </p>
                  </div>

                  {/* Email Verification Step */}
                  {!emailVerifiedDone ? (
                    <form
                      onSubmit={handleVerifySignupEmail}
                      className="p-4 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-[#E91269]" />
                          Step 1: Verify Email Ownership ({registeredSeller.email})
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        Enter the 6-digit verification code sent to your email address before sensitive seller features are unlocked.
                      </p>
                      {sandboxOtpPreview && (
                        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 font-mono flex items-center justify-between">
                          <span>Verification Code: <strong>{sandboxOtpPreview}</strong></span>
                          <button
                            type="button"
                            onClick={() => setVerificationOtpInput(sandboxOtpPreview)}
                            className="underline font-bold cursor-pointer"
                          >
                            Use Code
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          required
                          placeholder="6-digit OTP"
                          value={verificationOtpInput}
                          onChange={(e) => setVerificationOtpInput(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 px-3.5 py-2 bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono tracking-widest text-center focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                        />
                        <button
                          type="submit"
                          disabled={verifyingEmail}
                          className="px-4 py-2 bg-[#E91269] hover:bg-[#c90e59] text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                        >
                          {verifyingEmail ? 'Verifying...' : 'Verify Email'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Email ownership verified! Redirecting to your Seller Dashboard...</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToDashboard) onNavigateToDashboard();
                      }}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Continue to Seller Dashboard (Pending View)</span>
                      <ArrowRight className="w-4 h-4" />
=======
          {/* VIEW 1: REGISTRATION FORM */}
          {mode === 'register' && (
            <div>
              {successSubmitted ? (
                <div className="space-y-6 text-center py-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border-2 border-amber-400/40 shadow-md">
                    <Clock className="w-8 h-8 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-serif font-bold text-neutral-900 dark:text-white">
                      Seller Application Submitted!
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                      Thank you for applying to sell with <strong className="text-neutral-900 dark:text-white">ALIKE-ND</strong>.
                      Your storefront application for <strong className="text-amber-600 dark:text-amber-400 font-serif font-bold">{successSubmitted.shopName}</strong> has been saved with status:
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full font-mono text-xs font-bold border border-amber-300 dark:border-amber-700">
                      <Clock className="w-3.5 h-3.5" /> STATUS: PENDING ADMIN APPROVAL
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-left text-xs space-y-2 max-w-md mx-auto">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200 border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                      Application Summary
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Shop Name:</span>
                      <span className="col-span-2 font-medium text-neutral-900 dark:text-white">{successSubmitted.shopName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Owner:</span>
                      <span className="col-span-2 font-medium text-neutral-900 dark:text-white">{successSubmitted.ownerName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Email:</span>
                      <span className="col-span-2 font-mono text-neutral-900 dark:text-white">{successSubmitted.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Mobile:</span>
                      <span className="col-span-2 font-mono text-neutral-900 dark:text-white">{successSubmitted.mobileNumber}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-neutral-500">Address:</span>
                      <span className="col-span-2 text-neutral-700 dark:text-neutral-300">{successSubmitted.businessAddress}</span>
                    </div>
                    {successSubmitted.panNumber && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">PAN Number:</span>
                        <span className="col-span-2 font-mono font-bold text-neutral-900 dark:text-white">{successSubmitted.panNumber}</span>
                      </div>
                    )}
                    {successSubmitted.gstin && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">GSTIN:</span>
                        <span className="col-span-2 font-mono text-neutral-900 dark:text-white">{successSubmitted.gstin}</span>
                      </div>
                    )}
                    {successSubmitted.bankName && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-neutral-500">Settlement Bank:</span>
                        <span className="col-span-2 font-medium text-neutral-900 dark:text-white">
                          {successSubmitted.bankName} (A/C: •••• {successSubmitted.bankAccountNumber ? successSubmitted.bankAccountNumber.slice(-4) : '••••'})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl text-blue-800 dark:text-blue-300 text-xs leading-relaxed max-w-md mx-auto">
                    💡 <strong>Next Step:</strong> The Marketplace Administrator will review your details in the Admin Panel. Once approved, you can log in using your registered email and password to access your dedicated Seller Dashboard.
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLoginEmail(successSubmitted.email);
                        setSuccessSubmitted(null);
                      }}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      Go to Seller Login
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                    </button>
                  </div>
                </div>
              ) : (
<<<<<<< HEAD
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fade-in">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2.5 mb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      Seller Sign Up
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Create a separate Seller Portal account. All new seller accounts require administrator approval.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Full Name <span className="text-rose-500">*</span>
=======
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Right Panel Header */}
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                      Seller Onboarding Application
                    </h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Submit your business details for marketplace onboarding. All applications are verified by admin review.
                    </p>
                  </div>

                  {/* Grid of Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {/* Shop Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Shop / Storefront Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-shop-name"
                          type="text"
                          required
                          placeholder="e.g. Zenith Horology, Royal Bengal Silks"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Owner Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Business Owner Name <span className="text-rose-500">*</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-owner-name"
                          type="text"
                          required
                          placeholder="e.g. Rajesh Sharma"
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
<<<<<<< HEAD
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Store Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Store Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Store className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-shop-name"
                          type="text"
                          required
                          placeholder="e.g. Zenith Horology Atelier"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-email"
                          type="email"
                          required
                          placeholder="e.g. merchant@store.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
=======
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
<<<<<<< HEAD
                    <div className="space-y-1">
=======
                    <div className="space-y-1.5">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-mobile"
                          type="tel"
                          required
                          placeholder="e.g. 9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
<<<<<<< HEAD
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono"
=======
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono transition-colors"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        />
                      </div>
                    </div>

<<<<<<< HEAD
                    {/* Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Password <span className="text-rose-500">*</span>
=======
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Official Business Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-email"
                          type="email"
                          required
                          placeholder="e.g. contact@zenithboutique.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password for Seller Dashboard */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Seller Portal Password <span className="text-rose-500">*</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-password"
                          type={showPassword ? 'text' : 'password'}
                          required
<<<<<<< HEAD
                          minLength={8}
                          placeholder="Min 8 chars (letters & numbers)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
=======
                          minLength={6}
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
<<<<<<< HEAD
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
=======
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

<<<<<<< HEAD
                    {/* Confirm Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Confirm Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          id="seller-reg-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Indicators */}
                    {password.length > 0 && (
                      <div className="sm:col-span-2 flex flex-wrap gap-2 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${passwordChecks.minLength ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                          ✓ 8+ characters
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${passwordChecks.hasUpperOrLower ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                          ✓ Letters included
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${passwordChecks.hasNumber ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                          ✓ Numbers included
                        </span>
                        {confirmPassword.length > 0 && (
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${passwordChecks.matchesConfirm ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-500'}`}>
                            {passwordChecks.matchesConfirm ? '✓ Passwords match' : '✕ Passwords do not match'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Business Address */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Store / Pickup Address
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          id="seller-reg-address"
                          type="text"
                          placeholder="Street, Shop Number, City, State, PIN Code"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
=======
                    {/* Business Address */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Registered Business / Warehouse Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-3 pointer-events-none" />
                        <textarea
                          id="seller-reg-address"
                          required
                          rows={2}
                          placeholder="Street, Suite / Shop Number, City, State, PIN Code"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white resize-none transition-colors"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                        />
                      </div>
                    </div>
                  </div>

<<<<<<< HEAD
                  {/* Collapsible KYC & Bank Details */}
                  <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setShowKycFields(!showKycFields)}
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#E91269]" />
                        <span>KYC & Bank Payout Details (Optional now — can be completed in Dashboard)</span>
                      </span>
                      {showKycFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showKycFields && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#121214]">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            PAN Number
                          </label>
                          <div className="relative">
                            <CreditCard className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength={10}
                              placeholder="ABCDE1234F"
                              value={panNumber}
                              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                              className="w-full pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono uppercase text-neutral-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            GSTIN (Optional)
                          </label>
                          <div className="relative">
                            <Building className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              maxLength={15}
                              placeholder="22ABCDE1234F1Z5"
                              value={gstin}
                              onChange={(e) => setGstin(e.target.value.toUpperCase())}
                              className="w-full pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono uppercase text-neutral-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            Bank Account Holder
                          </label>
                          <input
                            type="text"
                            placeholder="Account Holder Name"
                            value={bankAccountHolderName}
                            onChange={(e) => setBankAccountHolderName(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            Bank Name
                          </label>
                          <div className="relative">
                            <Landmark className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="e.g. HDFC Bank, SBI"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              className="w-full pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs text-neutral-900 dark:text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            Bank Account Number
                          </label>
                          <input
                            type="text"
                            placeholder="Account Number"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value.trim())}
                            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono text-neutral-900 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                            IFSC Code
                          </label>
                          <input
                            type="text"
=======
                  {/* Section Divider: KYC & Business Verification */}
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCheck className="w-4 h-4 text-[#E91269]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                        KYC & Business Verification
                      </h3>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                      Required by marketplace regulations for seller onboarding, tax compliance, and automated payouts.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* PAN Number */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Permanent Account Number (PAN) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-pan"
                            type="text"
                            required
                            maxLength={10}
                            placeholder="ABCDE1234F"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono uppercase transition-colors"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400">10-character alphanumeric (5 letters, 4 digits, 1 letter)</p>
                      </div>

                      {/* GSTIN (Optional) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            GSTIN
                          </label>
                          <span className="text-[10px] text-neutral-400 font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                            Optional (For Registered Businesses)
                          </span>
                        </div>
                        <div className="relative">
                          <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-gstin"
                            type="text"
                            maxLength={15}
                            placeholder="22ABCDE1234F1Z5"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono uppercase transition-colors"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400">15-digit GST identification number if registered</p>
                      </div>
                    </div>
                  </div>

                  {/* Section Divider: Bank Account & Payout Details */}
                  <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Landmark className="w-4 h-4 text-[#E91269]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                        Bank Account & Payout Details
                      </h3>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                      Your store earnings and sales settlements will be transferred directly to this bank account.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      {/* Bank Account Holder Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Account Holder Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-bank-holder"
                            type="text"
                            required
                            placeholder="Name as printed in bank passbook"
                            value={bankAccountHolderName}
                            onChange={(e) => setBankAccountHolderName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                          />
                        </div>
                      </div>

                      {/* Bank Name */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Bank Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Landmark className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-bank-name"
                            type="text"
                            required
                            placeholder="e.g. State Bank of India, HDFC Bank, ICICI Bank"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                          />
                        </div>
                      </div>

                      {/* Bank Account Number */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Account Number <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <CreditCard className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-bank-acc"
                            type="text"
                            required
                            placeholder="e.g. 123456789012"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value.trim())}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono transition-colors"
                          />
                        </div>
                      </div>

                      {/* Bank IFSC Code */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Bank IFSC Code <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            id="seller-reg-bank-ifsc"
                            type="text"
                            required
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                            maxLength={11}
                            placeholder="SBIN0001234"
                            value={bankIFSC}
                            onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
<<<<<<< HEAD
                            className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg text-xs font-mono uppercase text-neutral-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Agreement to Seller Terms and Conditions */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                      <input
                        id="seller-reg-terms"
                        type="checkbox"
                        required
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#E91269] cursor-pointer"
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate('seller_policy')}
                          className="font-bold text-[#E91269] hover:underline cursor-pointer"
                        >
                          Alike-ND Seller Terms and Conditions
                        </button>{' '}
                        and confirm that this is a dedicated merchant account subject to administrator verification.
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
=======
                            className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white font-mono uppercase transition-colors"
                          />
                        </div>
                        <p className="text-[10px] text-neutral-400">11 characters: e.g. SBIN0001234, HDFC0000123</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                    <button
                      type="submit"
                      id="seller-reg-submit-btn"
                      disabled={loading}
<<<<<<< HEAD
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Creating Seller Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Seller Account</span>
=======
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span>Submitting Application...</span>
                      ) : (
                        <>
                          <span>Submit Seller Application</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
<<<<<<< HEAD

                  <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                    Already registered as a seller?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-bold text-[#E91269] hover:underline cursor-pointer"
                    >
                      Sign In Here
                    </button>
                  </div>
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
                </form>
              )}
            </div>
          )}

<<<<<<< HEAD
          {/* ========================================================
              VIEW 3: FORGOT PASSWORD (/seller/forgot-password)
              ======================================================== */}
          {mode === 'forgot_password' && (
            <div className="max-w-md mx-auto w-full space-y-4 animate-fade-in">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 mb-2">
                  <KeyRound className="w-3 h-3" /> Password Recovery
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Reset Seller Password
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {resetStep === 'request'
                    ? 'Enter your registered Seller Email Address or Mobile Number to receive a 6-digit recovery code.'
                    : 'Enter the 6-digit recovery code and choose a new strong password for your seller account.'}
                </p>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Registered Email or Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="seller-reset-identifier"
                        type="text"
                        required
                        placeholder="e.g. sara@example.com or 9876543210"
                        value={resetIdentifier}
                        onChange={(e) => setResetIdentifier(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Sending Recovery Code...' : 'Send Recovery Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleConfirmPasswordReset} className="space-y-3.5">
                  {resetDevOtp && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 font-mono flex items-center justify-between">
                      <span>Recovery Code: <strong>{resetDevOtp}</strong></span>
                      <button
                        type="button"
                        onClick={() => setResetOtp(resetDevOtp)}
                        className="underline font-bold cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      6-Digit Recovery Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit code"
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-mono tracking-widest text-center focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      New Seller Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        placeholder="Min 8 characters"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Re-enter new password"
                      value={confirmResetPassword}
                      onChange={(e) => setConfirmResetPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResetStep('request')}
                      className="px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-[#E91269] hover:bg-[#c90e59] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Updating Password...' : 'Reset Seller Password'}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  ← Return to Seller Sign In
                </button>
              </div>
            </div>
          )}
        </div>
=======
          {/* VIEW 2: APPROVED SELLER LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-md mx-auto w-full animate-fade-in">
              <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 mb-4 text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                  Approved Seller Login
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Log in to your approved merchant dashboard to manage your catalog listings and orders.
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Seller Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-email"
                      type="email"
                      required
                      placeholder="e.g. seller@boutique.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="seller-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your seller account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs focus:border-[#E91269] focus:outline-none text-neutral-900 dark:text-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  id="seller-login-submit-btn"
                  disabled={loading}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Access Seller Dashboard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      </div>
    </div>
  );
}
<<<<<<< HEAD
=======

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
