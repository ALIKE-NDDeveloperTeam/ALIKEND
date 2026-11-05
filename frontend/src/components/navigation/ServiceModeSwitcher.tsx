import { ShoppingBag, Sparkles, Crown, Store } from 'lucide-react';

interface ServiceModeSwitcherProps {
  currentView: string;
  selectedCategory?: string;
  onNavigate: (view: string, categoryFilter?: string) => void;
  isLightMode?: boolean;
}

export const ServiceModeSwitcher: React.FC<ServiceModeSwitcherProps> = ({
  currentView,
  selectedCategory,
  onNavigate,
  isLightMode = false,
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
    <div
      id="service-mode-switcher-bar"
      className={`w-full border-b select-none transition-colors duration-200 ${
        isLightMode
          ? 'bg-neutral-100/95 border-neutral-200'
          : 'bg-neutral-950/95 border-neutral-850'
      }`}
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-3 py-1 sm:py-1.5 overflow-x-auto no-scrollbar">
        {/* 3 Main Mode Switcher Buttons: Simple, Premium, Luxury */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* 1. Simple Button */}
          <button
            id="mode-btn-simple"
            type="button"
            onClick={() => onNavigate('home')}
            className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
              isSimpleActive
                ? isLightMode
                  ? 'bg-neutral-900 text-white shadow-sm shadow-neutral-900/15 ring-1 ring-neutral-900'
                  : 'bg-white text-neutral-950 shadow-sm shadow-white/10 ring-1 ring-white'
                : isLightMode
                ? 'text-neutral-700 hover:text-black hover:bg-neutral-200/80 border border-neutral-300/80'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-850 border border-neutral-800'
            }`}
            title="Simple everyday shopping"
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <ShoppingBag
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isSimpleActive
                    ? isLightMode
                      ? 'text-white'
                      : 'text-neutral-950'
                    : 'text-emerald-500'
                }`}
              />
              <span className="uppercase tracking-wider">Simple</span>
            </div>
            <span
              className={`hidden sm:inline text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                isSimpleActive
                  ? isLightMode
                    ? 'bg-white/20 text-white'
                    : 'bg-black/15 text-neutral-900'
                  : 'bg-emerald-500/15 text-emerald-500'
              }`}
            >
              Regular
            </span>
          </button>

          {/* 2. Premium Button */}
          <button
            id="mode-btn-premium"
            type="button"
            onClick={() => onNavigate('category_search', 'vip')}
            className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
              isPremiumActive
                ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/25 ring-1 ring-purple-400'
                : isLightMode
                ? 'text-neutral-700 hover:text-purple-600 hover:bg-purple-50 border border-neutral-300/80'
                : 'text-neutral-300 hover:text-purple-300 hover:bg-neutral-850 border border-neutral-800'
            }`}
            title="Curated VIP & Flagship Selection"
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Sparkles
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isPremiumActive ? 'text-yellow-300 fill-yellow-300' : 'text-purple-400'
                }`}
              />
              <span className="uppercase tracking-wider">Premium</span>
            </div>
            <span
              className={`hidden sm:inline text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                isPremiumActive
                  ? 'bg-black/25 text-white'
                  : 'bg-purple-500/15 text-purple-400'
              }`}
            >
              VIP
            </span>
          </button>

          {/* 3. Luxury Button */}
          <button
            id="mode-btn-luxury"
            type="button"
            onClick={() => onNavigate('category_search', 'luxury')}
            className={`group relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide transition-all duration-200 cursor-pointer ${
              isLuxuryActive
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black shadow-sm shadow-amber-500/30 ring-1 ring-amber-300 font-extrabold'
                : isLightMode
                ? 'text-neutral-700 hover:text-amber-600 hover:bg-amber-50 border border-neutral-300/80'
                : 'text-neutral-300 hover:text-amber-400 hover:bg-neutral-850 border border-neutral-800'
            }`}
            title="Bespoke Luxury & Haute Horlogerie"
          >
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Crown
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                  isLuxuryActive ? 'text-black fill-black' : 'text-amber-500'
                }`}
              />
              <span className="uppercase tracking-wider">Luxury</span>
            </div>
            <span
              className={`hidden sm:inline text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                isLuxuryActive
                  ? 'bg-black/20 text-black'
                  : 'bg-amber-500/15 text-amber-500'
              }`}
            >
              Elite
            </span>
          </button>
        </div>

        {/* Right side: Seller Panel & Certified Collection tag */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            id="mode-btn-seller-panel"
            type="button"
            onClick={() => onNavigate('seller_dashboard')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs border ${
              currentView === 'seller_dashboard'
                ? 'bg-amber-500 text-black border-amber-400 font-extrabold shadow-sm'
                : isLightMode
                ? 'border-amber-400/60 bg-amber-50 hover:bg-amber-100 text-amber-950'
                : 'border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300'
            }`}
            title="Open Seller Panel (সেলার প্যানেল)"
          >
            <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 shrink-0" />
            <span className="font-extrabold">Seller Panel</span>
          </button>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-neutral-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-mono uppercase tracking-wider text-[10px]">
              ALIKE ND Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
