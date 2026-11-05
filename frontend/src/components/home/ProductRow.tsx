import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

export interface ProductRowProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onToggleWishlist: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onCompare: (p: Product) => void;
  onQuickView: (p: Product) => void;
  wishlistedIds: number[];
  isLightMode?: boolean;
  autoScroll?: boolean;
  autoScrollSpeed?: number;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  products,
  onAddToCart,
  onToggleWishlist,
  onSelectProduct,
  onCompare,
  onQuickView,
  wishlistedIds,
  isLightMode = false,
  autoScroll = false,
  autoScrollSpeed = 0.5,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [products, updateScrollButtons]);

  // Optional auto-scroll: slowly moves continuously, pauses on hover or touch, respects prefers-reduced-motion
  useEffect(() => {
    if (!autoScroll) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isInteractingRef.current && container) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (maxScroll > 10) {
          if (container.scrollLeft >= maxScroll - 1) {
            container.scrollLeft = 0;
          } else {
            container.scrollLeft += (autoScrollSpeed * delta) / 16;
          }
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoScroll, autoScrollSpeed]);

  const scrollByDirection = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.max(container.clientWidth * 0.7, 280);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <div
      className="relative group/row w-full"
      onMouseEnter={() => {
        isInteractingRef.current = true;
      }}
      onMouseLeave={() => {
        isInteractingRef.current = false;
      }}
      onTouchStart={() => {
        isInteractingRef.current = true;
      }}
      onTouchEnd={() => {
        // Small delay after touch before resuming auto-scroll
        setTimeout(() => {
          isInteractingRef.current = false;
        }, 1500);
      }}
    >
      {/* Left Navigation Arrow (desktop) */}
      <button
        type="button"
        onClick={() => scrollByDirection('left')}
        disabled={!canScrollLeft}
        aria-label="Previous products"
        className={`hidden md:flex absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
          isLightMode
            ? 'bg-white text-neutral-800 border-2 border-amber-400 hover:bg-amber-50 hover:text-[#F5A623] hover:border-[#F5A623]'
            : 'bg-[#0B1330] text-[#F5A623] border-2 border-[#F5A623]/70 hover:bg-[#121E4A] hover:border-[#F5A623] hover:shadow-[0_0_15px_rgba(245,166,35,0.45)]'
        } ${canScrollLeft ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-90'}`}
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5A623]" />
      </button>

      {/* Right Navigation Arrow (desktop) */}
      <button
        type="button"
        onClick={() => scrollByDirection('right')}
        disabled={!canScrollRight}
        aria-label="Next products"
        className={`hidden md:flex absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
          isLightMode
            ? 'bg-white text-neutral-800 border-2 border-amber-400 hover:bg-amber-50 hover:text-[#F5A623] hover:border-[#F5A623]'
            : 'bg-[#0B1330] text-[#F5A623] border-2 border-[#F5A623]/70 hover:bg-[#121E4A] hover:border-[#F5A623] hover:shadow-[0_0_15px_rgba(245,166,35,0.45)]'
        } ${canScrollRight ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none scale-90'}`}
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5A623]" />
      </button>

      {/* Single Horizontal Flex Row with Snap Scrolling and Hidden Scrollbar */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory py-2 px-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product, index) => {
          const isWishlisted = wishlistedIds.includes(product.id);
          return (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              onSelectProduct={onSelectProduct}
              onCompare={onCompare}
              onQuickView={onQuickView}
              isWishlisted={isWishlisted}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductRow;
