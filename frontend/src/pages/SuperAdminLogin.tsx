import { useState, FormEvent, useRef, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Database, Mail, Lock, ArrowLeft } from 'lucide-react';
import { adminApi } from './adminApi';
import Logo from '../components/Logo';

interface SuperAdminLoginProps {
  onLoginSuccess?: (admin: { _id?: string; name: string; email: string; role: string }) => void;
  onSuccess?: () => void;
  onNavigate?: (view: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function SuperAdminLogin({
  onLoginSuccess,
  onSuccess,
  onNavigate,
  showToast,
}: SuperAdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => {
      emailInputRef.current?.focus();
    }, 150);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Please enter a valid master administrator email.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter the master administrator password.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMsg('');

    try {
      const res = await adminApi.login(cleanEmail, password);
      if (res && res.success && res.token) {
        adminApi.setToken(res.token);
        if (rememberMe) {
          localStorage.setItem('alikend_admin_token', res.token);
        } else {
          sessionStorage.setItem('alikend_admin_token', res.token);
        }
        if (showToast) {
          showToast(`Super Admin authenticated: ${res.admin?.name || cleanEmail}`, 'success');
        }
        if (onLoginSuccess && res.admin) {
          onLoginSuccess(res.admin);
        }
        if (onSuccess) {
          onSuccess();
        }
        if (onNavigate) {
          onNavigate('admin');
        }
      } else {
        setError(res?.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="super-admin-login-page"
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none"
    >
      {/* Full-Screen Dark Misty Mountain Landscape Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none scale-105 transform filter brightness-90"
        style={{ backgroundImage: 'url("/admin-mountain-bg.jpg")' }}
      />

      {/* Moody Dark Overcast Atmosphere & Forest Vignette */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-slate-950/50 to-black/80 backdrop-blur-[2px] pointer-events-none" />

      {/* Subtle Radial Depth Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Back to Home Button at Top-Left */}
      {onNavigate && (
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      )}

      {/* Centered Glassmorphic Login Card */}
      <div
        id="super-admin-card"
        className="relative w-full max-w-[440px] my-auto rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl bg-black/40 border border-white/20 text-white shadow-black/80 transition-all duration-300 animate-fadeIn"
      >
        {/* Subtle Top Inner Edge Highlight */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

        <div className="p-6 sm:p-8 pt-8">
          {/* Official Brand Logo */}
          <div className="flex items-center justify-center mb-5">
            <Logo size="md" isLightMode={false} />
          </div>

          {/* Header Badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Super Admin Master Access</span>
            </span>
          </div>

          {/* Heading Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Super Admin Login
            </h1>
            <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
              Unrestricted administrative access to system configurations, sales reports, user management, and security controls.
            </p>
          </div>

          {/* Target Role Info Box */}
          <div className="flex items-center justify-center px-4 py-2.5 rounded-full mb-5 text-xs bg-white/10 border border-white/15 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
              <div className="text-[11px] leading-tight flex items-center gap-1.5">
                <span className="text-white/60">Privilege:</span>
                <span className="font-mono font-bold text-white uppercase tracking-wider text-[10px] bg-purple-500/30 px-2 py-0.5 rounded-full border border-purple-400/30">
                  superadmin
                </span>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          {infoMsg && (
            <div className="p-3 mb-4 rounded-2xl bg-white/10 border border-white/20 text-white/90 text-xs backdrop-blur-md leading-relaxed animate-fadeIn">
              {infoMsg}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs backdrop-blur-md animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5 pl-3 font-mono">
                Master Admin Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  ref={emailInputRef}
                  id="super-admin-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter master administrator email"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-5 py-3 rounded-full text-sm bg-white/10 border border-white/25 text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all backdrop-blur-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/80 mb-1.5 pl-3 font-mono">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="super-admin-password-input"
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-12 py-3 rounded-full text-sm bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all backdrop-blur-md"
                />
                <button
                  id="toggle-superadmin-password-visibility-btn"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/80 pt-1 pb-1 px-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-white/30 bg-white/10 accent-purple-500 cursor-pointer"
                />
                <span className="text-white/75 hover:text-white transition-colors">Remember session</span>
              </label>
            </div>

            <button
              id="submit-super-admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full font-bold text-sm bg-white hover:bg-neutral-100 text-neutral-950 transition-all shadow-xl shadow-black/40 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99] tracking-wide mt-2"
            >
              {loading ? (
                <span>Authenticating with Database...</span>
              ) : (
                <>
                  <span>Sign in as Super Admin</span>
                  <ArrowRight className="w-4 h-4 text-neutral-950" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
