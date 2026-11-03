import React, { useState, FormEvent, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Check,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Shield,
  Phone,
  RefreshCw,
  CheckCircle2,
  Send,
} from 'lucide-react';
import GlassCloseButton from './GlassCloseButton';
import { auth, googleProvider, appleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import Logo from './Logo';
import { COUNTRIES, COUNTRIES_BY_LETTER, DEFAULT_COUNTRY, getInstantDetectedCountry, detectUserCountryAsync } from '../data/countries';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'password' | 'register';
  onLoginSuccess: (userData: { _id?: string; name: string; email: string; phone: string; tier?: string; isAdmin?: boolean; adminRole?: string | null; adminToken?: string | null }, isNewRegistration?: boolean) => void;
  onShowForgotPassword?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
  onToggleTheme?: () => void;
  onNavigate?: (view: string) => void;
}

const FASHION_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Tailored Blush Blazer Couture Look',
    label: '01/05',
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
    alt: 'Minimalist Autumn Silk Atelier',
    label: '02/05',
  },
  {
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Bespoke Evening Runway',
    label: '03/05',
  },
  {
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop',
    alt: 'Sovereign Cashmere Outerwear',
    label: '04/05',
  },
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
    alt: 'Global Designer Editorial',
    label: '05/05',
  },
];

export default function LoginModal({
  isOpen,
  onClose,
  initialTab = 'password',
  onLoginSuccess,
  showToast,
  isLightMode = false,
  onNavigate,
}: LoginModalProps) {
  // Navigation mode: 'password' | 'register' | 'forgot'
  const [modalMode, setModalMode] = useState<'password' | 'register' | 'forgot'>(
    initialTab === 'register' ? 'register' : 'password'
  );

  // Fashion slides carousel index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Form states for password login
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password flow states
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false);
  const [isVerifyingForgotOtp, setIsVerifyingForgotOtp] = useState(false);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Registration Method: 'phone' (Mobile Number) or 'email' (Gmail)
  const [regMethod, setRegMethod] = useState<'phone' | 'email'>('phone');
  const [userManuallySelectedCountry, setUserManuallySelectedCountry] = useState(false);
  const [selectedCountryIso, setSelectedCountryIso] = useState<string>(() => getInstantDetectedCountry().iso);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(() => getInstantDetectedCountry().code);
  const [regMobileNumber, setRegMobileNumber] = useState('');
  const [regEmailAddress, setRegEmailAddress] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPasswordVal, setRegPasswordVal] = useState('');
  const [regConfirmPasswordVal, setRegConfirmPasswordVal] = useState('');
  const [regAcceptTermsVal, setRegAcceptTermsVal] = useState(false);

  // Email / Gmail OTP states
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regOtpVerified, setRegOtpVerified] = useState(false);
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync initial tab
  useEffect(() => {
    if (isOpen) {
      setModalMode(initialTab === 'register' ? 'register' : 'password');
    }
  }, [isOpen, initialTab]);

  // Handle escape key to exit full display
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoggingIn && !isSubmittingReg) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoggingIn, isSubmittingReg, onClose]);

  // Auto-detect user country based on device location / timezone / IP geo
  useEffect(() => {
    if (isOpen && !userManuallySelectedCountry) {
      let active = true;
      detectUserCountryAsync().then((country) => {
        if (active && country && !userManuallySelectedCountry) {
          setSelectedCountryIso(country.iso);
          setSelectedCountryCode(country.code);
        }
      });
      return () => {
        active = false;
      };
    }
  }, [isOpen, userManuallySelectedCountry]);

  if (!isOpen) return null;

  // Safe JSON parser to prevent "Unexpected token '<', "<!doctype "... is not valid JSON" errors
  const safeParseJson = async (res: Response) => {
    try {
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch {
        return { error: `Server response error (${res.status}). Please try again in a moment.` };
      }
    } catch {
      return { error: 'Network communication error. Please check your connection.' };
    }
  };

  // Handle password login
  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    const cleanIdentifier = emailOrPhone.trim();
    if (!cleanIdentifier || !password) {
      showToast('Please enter your username/email and password.', 'error');
      return;
    }

    setIsLoggingIn(true);

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanIdentifier, password }),
      });

      let data = await safeParseJson(res);

      // If /api/auth/login was not successful and identifier looks like an email, try /api/admin/login
      if ((!res.ok || !data.success) && cleanIdentifier.includes('@')) {
        try {
          const adminRes = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanIdentifier.toLowerCase(), password }),
          });
          const adminData = await safeParseJson(adminRes);
          if (adminRes.ok && adminData.success) {
            res = adminRes;
            data = {
              success: true,
              isAdmin: true,
              adminRole: adminData.admin?.role || 'superadmin',
              adminToken: adminData.token,
              token: adminData.token,
              user: {
                _id: String(adminData.admin?._id || 'admin_user'),
                name: adminData.admin?.name || 'Administrator',
                email: adminData.admin?.email || cleanIdentifier,
                phone: '',
                tier: 'Platinum',
              },
            };
          }
        } catch {}
      }

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('alike_user_token', data.token);
        }
        if (data.adminToken) {
          localStorage.setItem('alikend_admin_token', data.adminToken);
        }
        const loggedUser = {
          _id: String(data.user?._id || ''),
          name: data.user?.name || data.user?.fullName || (cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : cleanIdentifier),
          email: data.user?.email || cleanIdentifier,
          phone: data.user?.phone || '',
          tier: data.user?.tier || 'Silver',
          isAdmin: Boolean(data.isAdmin),
          adminRole: data.adminRole || null,
          adminToken: data.adminToken || null,
        };
        onLoginSuccess(loggedUser);
        if (data.isAdmin || data.adminToken) {
          showToast(`Welcome Administrator, ${loggedUser.name}! Opening Admin Console...`, 'success');
          if (onNavigate) {
            onNavigate('admin');
          }
        } else {
          showToast(`Welcome back, ${loggedUser.name}!`, 'success');
        }
        onClose();
        setIsLoggingIn(false);
        return;
      } else {
        const errorMsg = data?.error || data?.message || 'Invalid username or password. Please verify your credentials.';
        showToast(errorMsg, 'error');
        setIsLoggingIn(false);
        return;
      }
    } catch (apiErr: any) {
      showToast(apiErr?.message || 'Authentication server connection error. Please try again.', 'error');
      setIsLoggingIn(false);
      return;
    }
  };

  // Handle forgot password OTP request via Gmail SMTP (host: smtp.gmail.com)
  const handleSendForgotOtp = async () => {
    const cleanEmail = forgotIdentifier.trim().toLowerCase();
    if (!cleanEmail) {
      showToast('Please enter your registered Gmail/email address.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      showToast('Password reset is only available via email. Please enter your registered Gmail/email address.', 'error');
      return;
    }
    setIsSendingRegOtp(true);
    setForgotOtpVerified(false);
    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanEmail }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setForgotOtpSent(true);
        showToast(data.message || `Verification code sent to ${data.email || cleanEmail}`, 'success');
      } else {
        showToast(data.error || 'Failed to dispatch verification code.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to connect to authentication service.', 'error');
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  // Handle verifying forgot password OTP code before unlocking password input
  const handleVerifyForgotOtp = async () => {
    if (!forgotIdentifier.trim()) {
      showToast('Please enter your registered email or mobile number.', 'error');
      return;
    }
    const cleanOtp = forgotOtpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      showToast('Please enter the complete 6-digit OTP code sent to your email.', 'error');
      return;
    }
    setIsVerifyingForgotOtp(true);
    try {
      const res = await fetch('/api/auth/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          otp: cleanOtp,
        }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setForgotOtpVerified(true);
        showToast('OTP verified successfully! Please enter your new password.', 'success');
      } else {
        setForgotOtpVerified(false);
        showToast(data.error || 'Invalid or expired OTP code. Please check and retry.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'OTP verification error. Please retry.', 'error');
    } finally {
      setIsVerifyingForgotOtp(false);
    }
  };

  // Handle password reset submission using real 6-digit OTP verification
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotOtpSent) {
      showToast('Please request an OTP verification code first.', 'error');
      return;
    }
    if (!forgotOtpVerified) {
      showToast('Please verify your 6-digit OTP code before setting a new password.', 'error');
      return;
    }
    if (!forgotOtpCode.trim() || forgotOtpCode.trim().length !== 6) {
      showToast('Please enter the 6-digit OTP code sent to your email.', 'error');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setIsSubmittingReg(true);
    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          otp: forgotOtpCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        showToast(data.message || 'Password reset successful! You may now login.', 'success');
        setModalMode('password');
        setEmailOrPhone(forgotIdentifier.trim());
        setPassword(forgotNewPassword);
        setForgotOtpSent(false);
        setForgotOtpVerified(false);
        setForgotOtpCode('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
      } else {
        showToast(data.error || 'Password reset failed.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reach server.', 'error');
    } finally {
      setIsSubmittingReg(false);
    }
  };

  // Handle sending OTP to Gmail during registration
  const handleSendRegistrationOtp = async () => {
    const cleanEmail = regEmailAddress.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid Gmail / email address.', 'error');
      return;
    }
    setIsSendingRegOtp(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose: 'registration' }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setRegOtpSent(true);
        setOtpCountdown(60);
        showToast(data.message || `6-digit OTP sent to ${cleanEmail}. Check your Gmail!`, 'success');
      } else {
        showToast(data.error || 'Failed to send OTP code to Gmail.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch verification email.', 'error');
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  // Handle verifying 6-digit OTP code for Gmail
  const handleVerifyRegistrationOtp = async () => {
    const cleanEmail = regEmailAddress.trim().toLowerCase();
    const cleanOtp = regOtpCode.trim();
    if (!cleanEmail) {
      showToast('Please enter your Gmail address.', 'error');
      return;
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      showToast('Please enter the complete 6-digit verification code.', 'error');
      return;
    }
    setIsVerifyingRegOtp(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp, purpose: 'registration' }),
      });
      const data = await safeParseJson(res);
      if (res.ok && data.success) {
        setRegOtpVerified(true);
        showToast('Gmail address verified successfully!', 'success');
      } else {
        showToast(data.error || 'Invalid or expired OTP code. Please retry.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'OTP verification error.', 'error');
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  // Handle unified registration submission (Phone or Gmail)
  const handleDirectRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const name = regFullName.trim();
    if (!name) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    let finalPhone = '';
    if (regMethod === 'phone') {
      const cleanMob = regMobileNumber.replace(/[\s\-+()]/g, '');
      if (!cleanMob || cleanMob.length < 4) {
        showToast('Please enter a valid mobile number.', 'error');
        return;
      }
      finalPhone = `${selectedCountryCode}${cleanMob}`;
    } else {
      const cleanMail = regEmailAddress.trim().toLowerCase();
      if (!cleanMail || !cleanMail.includes('@')) {
        showToast('Please enter a valid Gmail address.', 'error');
        return;
      }
      if (regOtpSent && !regOtpVerified) {
        showToast('Please verify the 6-digit OTP sent to your Gmail.', 'warning');
        return;
      }
    }

    if (!regPasswordVal || regPasswordVal.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (regPasswordVal !== regConfirmPasswordVal) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (!regAcceptTermsVal) {
      showToast('You must accept the Terms and Conditions to continue.', 'error');
      return;
    }

    setIsSubmittingReg(true);
    try {
      showToast('Creating your account...', 'info');
      const selectedCountryObj = COUNTRIES.find((c) => c.iso === selectedCountryIso) || COUNTRIES.find((c) => c.code === selectedCountryCode);
      const payload = {
        fullName: name,
        country: selectedCountryObj?.name || 'Bangladesh',
        mobileNumber: regMethod === 'phone' ? finalPhone : '',
        email: regMethod === 'email' ? regEmailAddress.trim().toLowerCase() : '',
        password: regPasswordVal,
        registrationMethod: regMethod,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await safeParseJson(res);

      if (!res.ok) {
        const errMsg = responseData.error || responseData.message || 'Registration failed';
        showToast(errMsg, 'error');
        setIsSubmittingReg(false);
        return;
      }

      const newUser = {
        _id: String(responseData.user?._id || ''),
        name: responseData.user?.name || name,
        email: responseData.user?.email || (regMethod === 'email' ? regEmailAddress.trim().toLowerCase() : `${finalPhone.replace(/\D/g, '')}@customer.alike.com`),
        phone: responseData.user?.phone || finalPhone,
        tier: responseData.user?.tier || 'Silver',
      };

      if (responseData.token) {
        localStorage.setItem('alike_user_token', responseData.token);
      }

      showToast(`Registration successful! Welcome, ${newUser.name}.`, 'success');

      setTimeout(() => {
        onLoginSuccess(newUser, true);
        onClose();
        setIsSubmittingReg(false);
      }, 500);
    } catch (netErr: any) {
      showToast(netErr?.message || 'Network error. Could not complete registration.', 'error');
      setIsSubmittingReg(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      showToast('Connecting to Google Auth...', 'info');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const cleanEmail = (user.email || '').toLowerCase().trim();
      const userName = user.displayName || cleanEmail.split('@')[0] || 'Google Member';
      const idToken = await user.getIdToken();

      // Send Firebase idToken to backend for cryptographic verification
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          autoRegister: true,
        }),
      });

      const data = await safeParseJson(res);

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('alike_user_token', data.token);
        }

        const authenticatedUser = {
          _id: data.user?._id || user.uid,
          name: data.user?.name || user.displayName || 'Google Member',
          email: data.user?.email || cleanEmail,
          phone: data.user?.phone || user.phoneNumber || '',
          tier: data.user?.tier || 'Silver',
        };

        if (data.isExisting) {
          // Existing user login
          onLoginSuccess(authenticatedUser, false);
          showToast(`Welcome back, ${authenticatedUser.name}!`, 'success');
        } else {
          // Brand new user auto-registered with verified email
          onLoginSuccess(authenticatedUser, true);
          showToast(`Account created successfully! Welcome, ${authenticatedUser.name}!`, 'success');
        }
        onClose();
        return;
      } else {
        showToast(data?.error || 'Google authentication check failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.warn('Google login notification:', error);
      showToast('Google Popup blocked or cancelled. Please try again or open in a new tab!', 'error');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      showToast('Connecting to Apple ID...', 'info');
      let idToken: string | null = null;
      let cleanEmail = '';
      let userName = 'Apple Member';

      try {
        const result = await signInWithPopup(auth, appleProvider);
        const user = result.user;
        cleanEmail = (user.email || '').toLowerCase().trim();
        userName = user.displayName || cleanEmail.split('@')[0] || 'Apple Member';
        idToken = await user.getIdToken();
      } catch (popupErr: any) {
        console.warn('Apple popup notice (falling back to Apple ID authentication):', popupErr?.message || popupErr);
        if (emailOrPhone && emailOrPhone.includes('@')) {
          cleanEmail = emailOrPhone.trim().toLowerCase();
        } else {
          cleanEmail = 'apple.user@icloud.com';
        }
        userName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ') || 'Apple Member';
      }

      // Send to backend /api/auth/apple to authenticate or register and persist directly in MongoDB
      const res = await fetch('/api/auth/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken,
          email: cleanEmail,
          fullName: userName,
          autoRegister: true,
        }),
      });

      const data = await safeParseJson(res);

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('alike_user_token', data.token);
        }

        const authenticatedUser = {
          _id: data.user?._id || 'apple_usr_' + Date.now(),
          name: data.user?.name || userName,
          email: data.user?.email || cleanEmail,
          phone: data.user?.phone || '',
          tier: data.user?.tier || 'Silver',
        };

        if (data.isExisting) {
          onLoginSuccess(authenticatedUser, false);
          showToast(`Welcome back, ${authenticatedUser.name}! (Connected to MongoDB)`, 'success');
        } else {
          onLoginSuccess(authenticatedUser, true);
          showToast(`Account registered & saved in MongoDB! Welcome, ${authenticatedUser.name}!`, 'success');
        }
        onClose();
        return;
      } else {
        showToast(data?.error || 'Apple authentication failed. Please try again.', 'error');
      }
    } catch (error: any) {
      console.warn('Apple sign in error:', error);
      showToast('Apple sign in encountered an issue. Please try again.', 'error');
    }
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-[9999] w-screen h-screen max-h-screen overflow-hidden flex flex-col lg:flex-row bg-white dark:bg-[#121214] text-neutral-900 dark:text-white select-none animate-fade-in"
    >
      {/* Floating Close Button - matches top-right circular button in reference image */}
      <GlassCloseButton
        id="close-login-modal"
        onClick={onClose}
        disabled={isLoggingIn || isSubmittingReg}
        isLightMode={isLightMode}
        size="lg"
        className="absolute top-4 right-4 sm:top-6 sm:right-7 z-50"
        title="Close (Esc)"
      />

      {/* LEFT COLUMN: Editorial Typography & About Us Card (Desktop / Side-by-side) */}
      <div className="hidden lg:flex w-[48%] xl:w-[46%] h-full flex-col justify-between px-8 sm:px-12 lg:px-12 xl:px-16 py-8 sm:py-10 lg:py-12 bg-white dark:bg-[#121214] border-r border-neutral-100 dark:border-neutral-800/60 overflow-hidden shrink-0">
        <div>
          {/* Official Shop Logo & Name */}
          <div className="mb-6 select-none">
            <Logo size="md" isLightMode={isLightMode} />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[44px] font-black tracking-tight text-neutral-950 dark:text-white leading-[1.08] uppercase">
            OFFERS POWERED<br />
            BY <span className="font-serif italic font-normal text-[#C48C46] dark:text-amber-500">DESIGNERS</span><br />
            AROUND THE WORLD.
          </h1>

          <div className="mt-5 sm:mt-6">
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              {modalMode === 'register' ? 'Already have an account?' : "Don't have account?"}
            </p>
            <button
              id="toggle-account-mode-btn"
              type="button"
              onClick={() => setModalMode(modalMode === 'register' ? 'password' : 'register')}
              className="mt-1 text-sm sm:text-base font-bold text-neutral-950 dark:text-white underline underline-offset-4 hover:opacity-75 transition-opacity inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{modalMode === 'register' ? 'Login to your account' : 'Create account'}</span>
              <span className="text-sm">➔</span>
            </button>
          </div>
        </div>

        {/* Bottom-left About Us Card with Online Shopping Boutique Visual */}
        <div className="rounded-[22px] sm:rounded-[26px] overflow-hidden relative w-full h-[145px] sm:h-[165px] xl:h-[195px] shadow-lg group shrink-0 border border-neutral-200/80 dark:border-neutral-800">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop"
            alt="Alike ND Online Shop"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5 flex flex-col justify-end text-white">
            <p className="text-xs sm:text-sm font-bold text-white mb-0.5">About Alike ND</p>
            <p className="text-[11px] sm:text-xs text-neutral-200 leading-snug line-clamp-2 font-normal">
              Shop bespoke designer luxury, wholesale atelier curation, and reach new heights with your fashion style.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Full-Bleed Online Shopping Background + Centered Floating Card */}
      <div className="w-full lg:w-[52%] xl:w-[54%] h-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
        {/* Full-bleed Luxury Online Shopping Editorial Background */}
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
          alt="Online Shopping Editorial"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Subtle background tint */}
        <div className="absolute inset-0 bg-black/15 dark:bg-black/40 pointer-events-none" />

        {/* Floating Card (Matches reference image) */}
        <div className="relative z-10 bg-white dark:bg-neutral-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.28)] max-w-[360px] sm:max-w-[390px] w-full border border-white/90 dark:border-neutral-800 my-auto animate-fade-in max-h-[92vh] overflow-y-auto no-scrollbar">
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-center text-neutral-900 dark:text-white mb-5 tracking-tight">
            {modalMode === 'register'
              ? 'Create your account'
              : modalMode === 'forgot'
              ? 'Reset your password'
              : 'Login'}
          </h2>

          {/* VIEW 1: PASSWORD LOGIN */}
          {modalMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Username
                </label>
                <input
                  id="login-identifier"
                  type="text"
                  required
                  placeholder="Yofi Dwi Saputra"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 px-3.5 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 cursor-pointer"
                    title="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Row: Remember me + Forget your password? */}
              <div className="flex items-center justify-between pt-0.5 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                  />
                  <span className="font-medium">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setModalMode('forgot')}
                  className="text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-2 cursor-pointer font-medium"
                >
                  Forget your password?
                </button>
              </div>

              {/* Solid Black Pill Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full py-3 px-6 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer mt-4 disabled:opacity-50"
              >
                {isLoggingIn ? 'Logging in...' : 'Login'}
              </button>

              {/* Social Logins Divider & Buttons */}
              <div className="pt-2">
                <div className="relative my-2.5 flex items-center">
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
                  <span className="shrink-0 px-2.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                    or continue with
                  </span>
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
                </div>

                <div className="grid grid-cols-2 gap-2.5" id="social-sign-ins">
                  <button
                    id="google-signin-btn"
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    id="apple-signin-btn"
                    type="button"
                    onClick={handleAppleSignIn}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 2.98 1.07.08 2.16-.54 2.81-1.32z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              {/* Mobile toggle to switch to registration */}
              <div className="lg:hidden text-center pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode('register')}
                  className="text-xs text-neutral-600 dark:text-neutral-400 underline cursor-pointer"
                >
                  Don't have an account? Create account ➔
                </button>
              </div>

              {/* Direct Links for Administrators */}
              <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-4 pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate('superadmin_login');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Super Admin Portal ➔</span>
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">|</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) {
                      onNavigate('staffadmin_login');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Operations Admin ➔</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 2: REGISTER ACCOUNT */}
          {modalMode === 'register' && (
            <form onSubmit={handleDirectRegisterSubmit} className="space-y-2.5">
              {/* 2 Top Buttons: 1. Mobile Number, 2. Gmail */}
              <div className="p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl flex items-center gap-1 border border-neutral-200 dark:border-neutral-700">
                <button
                  id="tab-reg-phone"
                  type="button"
                  onClick={() => setRegMethod('phone')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regMethod === 'phone'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/80 dark:border-neutral-700 scale-[1.01]'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Mobile Number</span>
                </button>

                <button
                  id="tab-reg-gmail"
                  type="button"
                  onClick={() => setRegMethod('email')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    regMethod === 'email'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/80 dark:border-neutral-700 scale-[1.01]'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span>Gmail</span>
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yofi Dwi Saputra"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Conditional: Phone Option with 2 boxes: Country Code Selector + Local Mobile Number */}
              {regMethod === 'phone' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                    Mobile Number
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Box 1: Country Code Select Box */}
                    <div className="relative w-38 sm:w-44 flex-shrink-0">
                      <select
                        id="reg-country-code-select"
                        value={selectedCountryIso}
                        onChange={(e) => {
                          const iso = e.target.value;
                          setUserManuallySelectedCountry(true);
                          const found = COUNTRIES.find((c) => c.iso === iso);
                          if (found) {
                            setSelectedCountryIso(found.iso);
                            setSelectedCountryCode(found.code);
                          }
                        }}
                        className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 px-2 text-xs font-semibold text-neutral-900 dark:text-white outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors cursor-pointer appearance-none pr-6"
                      >
                        {Object.entries(COUNTRIES_BY_LETTER).map(([letter, list]) => (
                          <optgroup key={letter} label={`── ${letter} ──`}>
                            {list.map((c) => (
                              <option
                                key={`${c.iso}-${c.code}`}
                                value={c.iso}
                                className="text-neutral-900 bg-white dark:bg-neutral-900 dark:text-white text-xs py-1"
                              >
                                {c.flag} {c.iso} {c.code} ({c.name})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    {/* Box 2: Local Mobile Number Input Box */}
                    <div className="relative flex-1">
                      <input
                        id="reg-mobile-number-input"
                        type="tel"
                        required
                        placeholder={COUNTRIES.find((c) => c.iso === selectedCountryIso)?.placeholder || "1712345678"}
                        value={regMobileNumber}
                        onChange={(e) => setRegMobileNumber(e.target.value.replace(/[^\d\s-]/g, ''))}
                        className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional: Gmail Option with OTP Verification */}
              {regMethod === 'email' && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5 flex items-center justify-between">
                      <span>Gmail Address</span>
                      {regOtpVerified && (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="email"
                        required
                        placeholder="user@gmail.com"
                        value={regEmailAddress}
                        onChange={(e) => {
                          setRegEmailAddress(e.target.value);
                          setRegOtpVerified(false);
                        }}
                        disabled={regOtpVerified}
                        className="flex-1 bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleSendRegistrationOtp}
                        disabled={isSendingRegOtp || otpCountdown > 0 || !regEmailAddress.trim() || regOtpVerified}
                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {isSendingRegOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>
                          {otpCountdown > 0 ? `${otpCountdown}s` : regOtpSent ? 'Resend' : 'Send OTP'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* 6-Digit OTP Verification Field */}
                  {regOtpSent && !regOtpVerified && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-fadeIn">
                      <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                        Enter 6-Digit Verification Code sent to your Gmail
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="123456"
                          value={regOtpCode}
                          onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="flex-1 bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 rounded-md py-1.5 px-3 text-sm font-mono font-bold tracking-widest text-neutral-900 dark:text-white outline-none focus:border-amber-500 text-center"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyRegistrationOtp}
                          disabled={isVerifyingRegOtp || regOtpCode.length !== 6}
                          className="px-4 py-1.5 rounded-md text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 transition-all shrink-0 cursor-pointer flex items-center gap-1"
                        >
                          {isVerifyingRegOtp ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Verify</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1">
                        Valid for 10 minutes via secure Gmail SMTP verification.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={regPasswordVal}
                    onChange={(e) => setRegPasswordVal(e.target.value)}
                    className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 pl-3 pr-9 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-0.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={regConfirmPasswordVal}
                    onChange={(e) => setRegConfirmPasswordVal(e.target.value)}
                    className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-1.5 pl-3 pr-9 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms & Conditions Checkbox */}
              <div className="pt-0.5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  <input
                    id="register-terms-checkbox"
                    type="checkbox"
                    checked={regAcceptTermsVal}
                    onChange={(e) => setRegAcceptTermsVal(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer accent-black dark:accent-white shrink-0"
                  />
                  <span className="text-[11px] select-none">
                    I agree to{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowTermsModal(true);
                      }}
                      className="font-bold text-neutral-900 dark:text-white underline underline-offset-2 hover:text-[#E91269] dark:hover:text-[#FF479C] transition-colors cursor-pointer inline bg-transparent border-0 p-0"
                    >
                      Terms & Conditions
                    </button>
                  </span>
                </div>
              </div>

              {/* Submit button */}
              <button
                id="btn-register-submit"
                type="submit"
                disabled={isSubmittingReg}
                className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full py-2.5 px-6 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer mt-1 disabled:opacity-50"
              >
                {isSubmittingReg
                  ? 'Creating Account...'
                  : regMethod === 'phone'
                  ? 'Create Account with Mobile Number'
                  : 'Create Account with Gmail'}
              </button>

              {/* Social Registration: Google & Apple */}
              <div className="pt-1">
                <div className="relative my-2.5 flex items-center">
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700" />
                  <span className="shrink-0 px-2.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                    or continue with
                  </span>
                  <div className="flex-grow border-t border-neutral-200 dark:border-neutral-700" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="google-register-btn"
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    id="apple-register-btn"
                    type="button"
                    onClick={handleAppleSignIn}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs font-semibold bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 2.98 1.07.08 2.16-.54 2.81-1.32z" />
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode('password')}
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-2 cursor-pointer font-medium"
                >
                  Already have an account? Login ➔
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: FORGOT PASSWORD */}
          {modalMode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    Email Address
                  </label>
                  {forgotOtpSent && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotOtpSent(false);
                        setForgotOtpVerified(false);
                        setForgotOtpCode('');
                      }}
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                </div>
                <input
                  type="email"
                  required
                  disabled={forgotOtpSent}
                  placeholder="name@gmail.com"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors disabled:opacity-75"
                />
              </div>

              {forgotOtpSent && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                        6-Digit Verification Code
                      </label>
                      {forgotOtpVerified ? (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OTP Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isSendingRegOtp}
                          onClick={handleSendForgotOtp}
                          className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold cursor-pointer"
                        >
                          {isSendingRegOtp ? 'Sending...' : 'Resend Code'}
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        disabled={forgotOtpVerified}
                        placeholder="Enter 6-digit code"
                        value={forgotOtpCode}
                        onChange={(e) => setForgotOtpCode(e.target.value.replace(/\D/g, ''))}
                        className={`flex-1 bg-[#F9FAFB] dark:bg-neutral-800/90 border ${
                          forgotOtpVerified
                            ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                            : 'border-neutral-200 dark:border-neutral-700'
                        } rounded-md py-2 px-3 text-sm font-medium tracking-widest text-neutral-900 dark:text-white placeholder:text-neutral-400 placeholder:tracking-normal outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors`}
                      />
                      {!forgotOtpVerified && (
                        <button
                          type="button"
                          disabled={isVerifyingForgotOtp || forgotOtpCode.trim().length !== 6}
                          onClick={handleVerifyForgotOtp}
                          className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-black rounded-md text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                        >
                          {isVerifyingForgotOtp ? 'Verifying...' : 'Verify Code'}
                        </button>
                      )}
                    </div>
                  </div>

                  {!forgotOtpVerified ? (
                    <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <Lock className="w-4 h-4 flex-shrink-0" />
                      <span>Enter and verify the 6-digit OTP code sent to your email to unlock password creation.</span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="Re-enter password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          className="w-full bg-[#F9FAFB] dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 rounded-md py-2 px-3 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:border-neutral-900 dark:focus:border-amber-400 transition-colors"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {!forgotOtpSent && (
                <button
                  type="button"
                  disabled={isSendingRegOtp || !forgotIdentifier.trim()}
                  onClick={handleSendForgotOtp}
                  className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full py-2.5 px-6 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isSendingRegOtp ? 'Sending Reset Code...' : 'Send Reset Code'}
                </button>
              )}

              {forgotOtpSent && !forgotOtpVerified && (
                <button
                  type="button"
                  disabled={isVerifyingForgotOtp || forgotOtpCode.trim().length !== 6}
                  onClick={handleVerifyForgotOtp}
                  className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-100 rounded-full py-2.5 px-6 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isVerifyingForgotOtp ? 'Verifying Code...' : 'Verify OTP Code'}
                </button>
              )}

              {forgotOtpSent && forgotOtpVerified && (
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-2.5 px-6 text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer mt-2 disabled:opacity-50"
                >
                  {isSubmittingReg ? 'Saving Password...' : 'Save New Password'}
                </button>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setModalMode('password')}
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-2 cursor-pointer font-medium"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* TERMS & CONDITIONS MODAL OVERLAY */}
      {showTermsModal && (
        <div 
          id="terms-conditions-modal-overlay"
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            id="terms-conditions-card"
            className="bg-white dark:bg-[#18181b] text-neutral-900 dark:text-neutral-100 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/70 dark:bg-neutral-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E91269]/10 text-[#E91269] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white leading-tight">
                    Alike ND Terms & Conditions
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Effective: September 2026 • Sovereign Atelier Guild
                  </p>
                </div>
              </div>
              <GlassCloseButton
                id="close-terms-modal-btn"
                onClick={() => setShowTermsModal(false)}
                isLightMode={isLightMode}
                size="sm"
              />
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  1. Acceptance of Terms & Services
                </h4>
                <p>
                  By creating an account, browsing collections, or making purchases on <strong>Alike ND</strong>, you enter into a binding agreement to abide by these Terms & Conditions and all applicable trade guidelines.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  2. Account Security & Verification
                </h4>
                <p>
                  You agree to provide true, accurate, and current information during registration. You are responsible for maintaining the confidentiality of your password and restricting access to your account.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  3. Authentic Designer Curation & Products
                </h4>
                <p>
                  Every luxury apparel, bespoke couture piece, and accessory featured on Alike ND is guaranteed authentic, sourced through authorized designers and verified boutique wholesalers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  4. Orders, Pricing & Payment
                </h4>
                <p>
                  All orders are subject to availability and acceptance. Prices are displayed in local currency. We support secure SSL-encrypted payments via credit/debit card, bKash, Nagad, and verified digital wallets.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  5. Delivery & Return Policy
                </h4>
                <p>
                  Orders are dispatched within 24–48 hours. Items in original condition with tags intact can be returned or exchanged within 7 days of delivery under our hassle-free return guarantee.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm mb-1">
                  6. Privacy & Data Protection
                </h4>
                <p>
                  Your privacy is paramount. We do not sell or lease your personal data. All sensitive communications and customer credentials are encrypted with bank-grade security protocols.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2.5 shrink-0 bg-neutral-50/70 dark:bg-neutral-900/50">
              <button
                id="terms-close-btn"
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                id="terms-accept-btn"
                type="button"
                onClick={() => {
                  setRegAcceptTermsVal(true);
                  setShowTermsModal(false);
                }}
                className="px-5 py-2 text-xs font-bold bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition-opacity shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>I Agree & Accept</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
