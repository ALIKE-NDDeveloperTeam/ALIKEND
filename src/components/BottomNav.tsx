import React from 'react';
import { Home, ShoppingCart, User, Sparkles, Crown } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface BottomNavProps {
  currentView: string;
  selectedCategory?: string;
  cartCount: number;
  wishlistCount?: number;
  user: UserProfile | null;
  isLightMode: boolean;
  onNavigate: (view: string, category?: string) => void;
  onOpenAuthModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  selectedCategory,
  cartCount,
  user,
  isLightMode,
  onNavigate,
  onOpenAuthModal,
}) => {
  const isLuxuryActive =
    (currentView === 'category_search' || currentView === 'search') &&
    selectedCategory === 'luxury';

  const isPremiumActive =
    (currentView === 'category_search' || currentView === 'search') &&
    (selectedCategory === 'vip' || selectedCategory === 'premium');

  const isSimpleActive =
    !isLuxuryActive &&
    !isPremiumActive &&
    (currentView === 'home' ||
      ((currentView === 'category_search' || currentView === 'search') &&
        (!selectedCategory || selectedCategory === 'all' || selectedCategory === 'simple')));

  return (
    <nav
      id="mobile-bottom-navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-solid transition-colors duration-200 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] ${
        isLightMode
          ? 'bg-white/95 border-neutral-200 text-neutral-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
          : 'bg-black/95 border-neutral-800 text-white shadow-[0_-4px_25px_rgba(0,0,0,0.8)]'
      }`}
    >
      <div className="max-w-md mx-auto grid grid-cols-5 h-14">
        {/* 1. Simple Tab */}
        <button
          id="bottom-nav-simple"
          type="button"
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isSimpleActive
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${isSimpleActive ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight">Simple</span>
        </button>

        {/* 2. Premium Tab */}
        <button
          id="bottom-nav-premium"
          type="button"
          onClick={() => onNavigate('category_search', 'vip')}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isPremiumActive
              ? 'text-violet-500 font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-violet-600'
              : 'text-neutral-400 hover:text-violet-300'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${isPremiumActive ? 'scale-110 text-violet-400 fill-violet-400 animate-pulse' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight">Premium</span>
        </button>

        {/* 3. Luxury Tab */}
        <button
          id="bottom-nav-luxury"
          type="button"
          onClick={() => onNavigate('category_search', 'luxury')}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            isLuxuryActive
              ? 'text-amber-500 font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-amber-600'
              : 'text-neutral-400 hover:text-amber-400'
          }`}
        >
          <Crown className={`w-5 h-5 ${isLuxuryActive ? 'scale-110 text-amber-500 fill-amber-500' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight">Luxury</span>
        </button>

        {/* 4. Cart Tab */}
        <button
          id="bottom-nav-cart"
          type="button"
          onClick={() => onNavigate('cart')}
          className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'cart'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`w-5 h-5 ${currentView === 'cart' ? 'scale-110' : ''} transition-transform`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1.5 -right-2 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow ${
                isLightMode ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </button>

        {/* 5. User Account Tab */}
        <button
          id="bottom-nav-account"
          type="button"
          onClick={() => (user ? onNavigate('profile') : onOpenAuthModal())}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
            currentView === 'profile'
              ? isLightMode
                ? 'text-black font-extrabold'
                : 'text-white font-extrabold'
              : isLightMode
              ? 'text-neutral-500 hover:text-black'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 ${currentView === 'profile' ? 'scale-110' : ''} transition-transform`} />
          <span className="text-[10px] tracking-tight truncate max-w-[56px]">
            {user ? user.name.split(' ')[0] : 'Account'}
          </span>
        </button>
      </div>
    </nav>
  );
};
