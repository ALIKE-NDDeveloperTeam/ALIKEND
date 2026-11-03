import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, AlertCircle, Sparkles } from 'lucide-react';
import GlassCloseButton from './GlassCloseButton';

export interface ToastItem {
  id: string;
  message?: string;
  msg?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[100000] flex flex-col gap-3 max-w-md w-[calc(100%-2rem)] md:w-96 pointer-events-none">
      {toasts.map((toast, idx) => (
        <ToastCard key={`${toast.id || 'toast'}-${idx}`} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void; key?: any }) {
  const { id, type } = toast;
  const message = toast.message || toast.msg || '';
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsLight(document.body.classList.contains('light-mode'));
    };
    updateTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const config = {
    success: {
      borderColor: isLight ? 'border-[#FF007F]/40' : 'border-[#FF007F]/50',
      icon: <Sparkles className={`w-5 h-5 shrink-0 ${isLight ? 'text-[#FF007F]' : 'text-[#FF1990]'}`} />,
      glow: isLight ? 'shadow-[0_10px_25px_rgba(255,0,127,0.15)]' : 'shadow-[0_10px_30px_rgba(255,0,127,0.22)]',
      badge: 'SUCCESS',
      badgeColor: isLight ? 'bg-[#FF007F]/10 text-[#FF007F]' : 'bg-[#FF007F]/20 text-[#FF007F]'
    },
    error: {
      borderColor: 'border-rose-500/50',
      icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
      glow: 'shadow-[0_10px_25px_rgba(244,63,94,0.15)]',
      badge: 'ERROR',
      badgeColor: 'bg-rose-500/15 text-rose-400'
    },
    warning: {
      borderColor: 'border-amber-500/50',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
      glow: 'shadow-[0_10px_25px_rgba(245,158,11,0.15)]',
      badge: 'WARNING',
      badgeColor: 'bg-amber-500/15 text-amber-400'
    },
    info: {
      borderColor: isLight ? 'border-[#FF007F]/30' : 'border-neutral-700',
      icon: <Info className={`w-5 h-5 shrink-0 ${isLight ? 'text-neutral-600' : 'text-neutral-400'}`} />,
      glow: 'shadow-[0_10px_25px_rgba(0,0,0,0.1)]',
      badge: 'NOTICE',
      badgeColor: isLight ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-800 text-neutral-300'
    },
  }[type];

  return (
    <div
      id={`toast-${id}`}
      className={`pointer-events-auto flex gap-3.5 p-4 rounded-xl border border-solid ${config.borderColor} ${
        isLight 
          ? 'bg-white/95 text-[#1A2238]' 
          : 'bg-neutral-950/95 text-white'
      } ${config.glow} backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-fade-in-up items-start`}
    >
      <div className="pt-0.5">{config.icon}</div>
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded ${config.badgeColor}`}>
            {config.badge}
          </span>
          <span className={`text-[10px] ${isLight ? 'text-neutral-400' : 'text-neutral-500'} font-bold`}>SYSTEM SECURE</span>
        </div>
        <p className={`text-xs ${isLight ? 'text-neutral-800' : 'text-neutral-200'} font-medium leading-relaxed mt-1`}>
          {message}
        </p>
      </div>
      <GlassCloseButton
        id={`toast-close-${id}`}
        onClick={() => onDismiss(id)}
        isLightMode={isLight}
        size="sm"
        title="Dismiss Toast"
        aria-label="Dismiss Toast"
      />

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
