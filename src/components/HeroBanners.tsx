import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAdminEdit } from '../context/AdminEditContext';
=======
<<<<<<< HEAD
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAdminEdit } from '../context/AdminEditContext';
=======
import { ChevronLeft, ChevronRight } from 'lucide-react';
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

export interface BannerItem {
  _id?: string;
  id?: string | number;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  imageUrl: string;
  link?: string;
  linkUrl?: string;
  order?: number;
  active?: boolean;
  isActive?: boolean;
  isCenterFeatured?: boolean;
}

export interface HeroBannersProps {
  banners: BannerItem[];
  onNavigate: (view: string, filter?: string) => void;
  isLightMode?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

const FALLBACK_BANNER_IMG =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80';

const getSafeImageUrl = (url?: string): string => {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('photo-1580907115718-4c8abd021ae5')) {
    return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80';
  }
  return url;
};

export const HeroBanners: React.FC<HeroBannersProps> = ({
  banners = [],
  onNavigate,
  isLightMode = false,
  autoPlayInterval = 3800,
  className = '',
}) => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const { isAdmin, isEditMode, openEditBanner, openDeleteBanner, openCreateBanner } = useAdminEdit();

  // In admin edit mode, show all banners (active and inactive) so admin can re-activate or modify them
  const activeBanners = useMemo(() => {
    if (isAdmin && isEditMode) {
      return banners.length > 0 ? banners : [];
    }
    const list = banners.filter((b) => b.active !== false && b.isActive !== false);
    return list.length > 0 ? list : banners;
  }, [banners, isAdmin, isEditMode]);
<<<<<<< HEAD
=======
=======
  // Filter active banners and ensure at least 1 banner exists
  const activeBanners = useMemo(() => {
    const list = banners.filter((b) => b.active !== false && b.isActive !== false);
    return list.length > 0 ? list : banners;
  }, [banners]);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Center / Featured index
  const [currentIndex, setCurrentIndex] = useState(() => {
    const featuredIdx = activeBanners.findIndex((b) => b.isCenterFeatured);
    return featuredIdx !== -1 ? featuredIdx : 0;
  });

  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const total = activeBanners.length;

  // Handlers for circular carousel movement
  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Smooth, high-performance auto-play slideshow (pauses gracefully on hover)
  useEffect(() => {
    if (total <= 1 || isHovered) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [total, isHovered, autoPlayInterval, nextSlide]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartXRef.current = null;
  };

  // Safe image error handler to prevent broken image icons
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.src = FALLBACK_BANNER_IMG;
  };

  if (total === 0) return null;

  const handleBannerClick = (banner: BannerItem) => {
    const destination = banner.linkUrl || banner.link || 'category_search';
    onNavigate(destination);
  };

  /**
   * Calculates GPU-accelerated 3D carousel position for each banner slide on Desktop.
   * Gives a butter-smooth 60fps sliding motion when auto-running or clicking!
   */
  const getDesktopCardStyle = (index: number) => {
    let diff = (index - currentIndex + total) % total;
    if (diff > total / 2) diff -= total;

    if (diff === 0) {
      // CENTER HERO (Prominent, scale 1.04, golden highlight aura)
      return {
        transform: 'translate(-50%, 0) scale(1.04)',
        left: '50%',
        zIndex: 25,
        opacity: 1,
        pointerEvents: 'auto' as const,
        boxShadow: isLightMode
          ? '0 20px 50px rgba(245, 166, 35, 0.28), 0 0 35px rgba(245, 166, 35, 0.2)'
          : '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 40px rgba(245, 166, 35, 0.35)',
        borderColor: '#F5A623',
      };
    } else if (diff === -1) {
      // LEFT PREVIEW CARD (Flanking, scale 0.92, offset to left)
      return {
        transform: 'translate(-142%, 0) scale(0.92)',
        left: '50%',
        zIndex: 10,
        opacity: 0.78,
        pointerEvents: 'auto' as const,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        borderColor: isLightMode ? '#E8DEC9' : 'rgba(255, 255, 255, 0.12)',
      };
    } else if (diff === 1) {
      // RIGHT PREVIEW CARD (Flanking, scale 0.92, offset to right)
      return {
        transform: 'translate(42%, 0) scale(0.92)',
        left: '50%',
        zIndex: 10,
        opacity: 0.78,
        pointerEvents: 'auto' as const,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        borderColor: isLightMode ? '#E8DEC9' : 'rgba(255, 255, 255, 0.12)',
      };
    } else if (diff < -1) {
      // OFF-SCREEN LEFT (Sliding out to the left)
      return {
        transform: 'translate(-230%, 0) scale(0.8)',
        left: '50%',
        zIndex: 5,
        opacity: 0,
        pointerEvents: 'none' as const,
        boxShadow: 'none',
        borderColor: 'transparent',
      };
    } else {
      // OFF-SCREEN RIGHT (Sliding in from the right)
      return {
        transform: 'translate(130%, 0) scale(0.8)',
        left: '50%',
        zIndex: 5,
        opacity: 0,
        pointerEvents: 'none' as const,
        boxShadow: 'none',
        borderColor: 'transparent',
      };
    }
  };

  /**
   * Calculates mobile slide position with smooth sliding motion
   */
  const getMobileCardStyle = (index: number) => {
    let diff = (index - currentIndex + total) % total;
    if (diff > total / 2) diff -= total;

    if (diff === 0) {
      return {
        transform: 'translate(-50%, 0) scale(1)',
        left: '50%',
        zIndex: 20,
        opacity: 1,
        pointerEvents: 'auto' as const,
      };
    } else if (diff === -1) {
      return {
        transform: 'translate(-150%, 0) scale(0.92)',
        left: '50%',
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    } else if (diff === 1) {
      return {
        transform: 'translate(50%, 0) scale(0.92)',
        left: '50%',
        zIndex: 10,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    } else {
      return {
        transform: 'translate(150%, 0) scale(0.85)',
        left: '50%',
        zIndex: 5,
        opacity: 0,
        pointerEvents: 'none' as const,
      };
    }
  };

  return (
    <section
      id="hero-carousel-root"
      aria-label="Featured Collections Carousel"
      className={`hero-banner-isolate w-full max-w-7xl mx-auto px-3 sm:px-6 select-none relative pt-2 pb-4 ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      {/* Admin Mode: Add Banner shortcut button */}
      {isAdmin && isEditMode && (
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={openCreateBanner}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer"
            title="Add new banner slide to the homepage carousel"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Banner Slide (Live Admin)</span>
          </button>
        </div>
      )}

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      {/* ========================================================
          DESKTOP 3-BANNER SLIDING TRACK (md / lg screens)
          Cards physically slide across the screen with smooth 60fps easing
          ======================================================== */}
      <div className="hidden md:block relative w-full h-[390px] lg:h-[440px] overflow-hidden py-3">
        {activeBanners.map((banner, idx) => {
          const style = getDesktopCardStyle(idx);
          const isCenter = idx === currentIndex;

          return (
            <div
              key={banner._id || idx}
              onClick={() => {
                if (isCenter) {
                  handleBannerClick(banner);
                } else {
                  goToSlide(idx);
                }
              }}
              title={isCenter ? 'Click to explore collection' : 'Click to bring to center'}
              style={style}
              className={`absolute top-3 w-[50%] lg:w-[52%] h-[365px] lg:h-[415px] rounded-2xl lg:rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group ${
                isCenter
                  ? 'bg-neutral-950 ring-1 ring-amber-400/30'
                  : isLightMode
                    ? 'bg-neutral-900 border-[#E8DEC9]'
                    : 'bg-neutral-950 border-white/10'
              }`}
            >
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              {/* Admin Banner Controls Overlay */}
              {isAdmin && isEditMode && (
                <div
                  className="absolute top-3 right-3 z-40 flex items-center gap-1.5 p-1.5 bg-neutral-950/90 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  {(banner.active === false || banner.isActive === false) && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-600 text-white uppercase tracking-wider">
                      INACTIVE
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditBanner(banner);
                    }}
                    className="p-1 rounded text-amber-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                    title="Edit Banner (Image, Headline, Buttons, Link...)"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteBanner(banner);
                    }}
                    className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-all cursor-pointer"
                    title="Delete Banner Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              {/* Center Radiant Top Light Spill Accent */}
              {isCenter && (
                <>
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#F5A623] to-transparent z-30" />
                  <div className="absolute -top-12 inset-x-1/4 h-24 bg-[#F5A623]/30 blur-3xl pointer-events-none z-10" />
                </>
              )}

              {/* High-Resolution Clean Banner Image */}
              <img
                src={getSafeImageUrl(banner.imageUrl)}
                alt=""
                loading={isCenter ? 'eager' : 'lazy'}
                onError={handleImgError}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle Ambient Vignette for Depth */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
                  isCenter ? 'bg-black/10' : 'bg-black/25'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MOBILE SLIDING CAROUSEL (Responsive Swipeable Track)
          ======================================================== */}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      <div className="md:hidden relative w-full h-[200px] sm:h-[260px] overflow-hidden py-1">
        {activeBanners.map((banner, idx) => {
          const style = getMobileCardStyle(idx);
          const isCurrent = idx === currentIndex;
<<<<<<< HEAD
=======
=======
      <div className="md:hidden relative w-full h-[230px] sm:h-[290px] overflow-hidden py-2">
        {activeBanners.map((banner, idx) => {
          const style = getMobileCardStyle(idx);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

          return (
            <div
              key={banner._id || idx}
              onClick={() => handleBannerClick(banner)}
              style={style}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              className="absolute top-1 w-[94%] h-[188px] sm:h-[248px] rounded-2xl overflow-hidden shadow-lg border-2 border-[#F5A623] cursor-pointer bg-neutral-950 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              {/* Mobile Admin Controls */}
              {isAdmin && isEditMode && (
                <div
                  className="absolute top-2 right-2 z-40 flex items-center gap-1 p-1 bg-neutral-950/90 border border-amber-500/50 rounded-lg shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditBanner(banner);
                    }}
                    className="p-1 rounded text-amber-400 hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteBanner(banner);
                    }}
                    className="p-1 rounded text-rose-400 hover:text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <img
                src={getSafeImageUrl(banner.imageUrl)}
                alt={banner.title || 'Featured Banner'}
                loading={isCurrent ? 'eager' : 'lazy'}
                fetchPriority={isCurrent ? 'high' : 'auto'}
                decoding="async"
                onError={handleImgError}
                className="w-full h-full object-cover object-center"
              />
              {/* Bottom pagination dots on mobile */}
              {total > 1 && isCurrent && (
                <div
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeBanners.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => goToSlide(dotIdx)}
                      aria-label={`Slide ${dotIdx + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIdx === currentIndex ? 'w-4 bg-[#F5A623]' : 'w-1.5 bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
<<<<<<< HEAD
=======
=======
              className="absolute top-2 w-[92%] h-[215px] sm:h-[275px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#F5A623] cursor-pointer bg-neutral-950 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            >
              <img
                src={getSafeImageUrl(banner.imageUrl)}
                alt=""
                loading="lazy"
                onError={handleImgError}
                className="w-full h-full object-cover object-center"
              />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            </div>
          );
        })}
      </div>

      {/* ========================================================
          SLICK NAVIGATION ARROWS (Clean, luxury frosted chevrons)
          ======================================================== */}
      {/* Previous Arrow */}
      <button
        type="button"
        onClick={prevSlide}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        className="absolute left-3.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/55 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
<<<<<<< HEAD
=======
=======
        className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:scale-108 active:scale-95 cursor-pointer"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      </button>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={nextSlide}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        className="absolute right-3.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/55 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
<<<<<<< HEAD
=======
=======
        className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:scale-108 active:scale-95 cursor-pointer"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6 text-white" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      </button>
    </section>
  );
};

export default HeroBanners;
