import React, { useState } from 'react';
import Logo from './Logo';
import FeaturesSection from './FeaturesSection';
import { 
  Mail, 
  Send, 
  ChevronRight, 
  Headphones, 
  Truck, 
  RotateCcw, 
  CheckCircle2,
  LayoutGrid,
  Tag,
  Percent,
  HelpCircle,
  ArrowLeft,
  Crown,
  Store,
  FileText,
  Shield,
  Scale,
  FileCheck
} from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, filter?: string) => void;
  onBack?: () => void;
  isLightMode?: boolean;
  showBackButton?: boolean;
  currentView?: string;
}

export default function Footer({ 
  onNavigate, 
  onBack,
  isLightMode = false,
  showBackButton = false,
  currentView: _currentView 
}: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com',
      hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.598 0 9 1.582 9 4.615V8z"/>
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com',
      hoverClass: 'hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white hover:border-transparent',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com',
      hoverClass: 'hover:bg-black hover:text-white hover:border-black',
      icon: (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com',
      hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com',
      hoverClass: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  const shopLinks = [
    { label: 'Become a Seller', icon: Store, action: () => onNavigate('seller_register') },
    { label: 'Delivery Partner Portal', icon: Truck, action: () => onNavigate('delivery_partner') },
    { label: 'Seller Terms & Policy', icon: FileCheck, action: () => onNavigate('seller_policy') },
    { label: 'All Categories', icon: LayoutGrid, action: () => onNavigate('category_search', 'all') },
    { label: 'Curated Brands', icon: Crown, action: () => onNavigate('category_search', 'luxury') },
    { label: 'Special Offers', icon: Percent, action: () => onNavigate('category_search', 'wholesale') }
  ];

  const customerServiceLinks = [
    { label: 'Track Your Order', icon: Truck, action: () => onNavigate('orders') },
    { label: 'Returns & Refunds', icon: RotateCcw, action: () => onNavigate('return_refund_policy') },
    { label: 'Grievance Redressal', icon: Scale, action: () => onNavigate('grievance_policy') },
    { label: 'Terms & Conditions', icon: FileText, action: () => onNavigate('terms_conditions') },
    { label: 'Privacy Policy', icon: Shield, action: () => onNavigate('privacy_policy') },
    { label: 'FAQs & Help Center', icon: HelpCircle, action: () => onNavigate('support') },
    { label: 'Contact Us & Hotlines', icon: Headphones, action: () => onNavigate('support') }
  ];

  return (
    <footer className={`relative border-t transition-colors duration-300 overflow-hidden ${
      isLightMode 
        ? 'bg-gradient-to-b from-[#FBF9F5] via-[#F6F2EA] to-[#EFE9DD] border-[#E8DEC9] text-[#1D2433]' 
        : 'bg-gradient-to-b from-[#0A1128] via-[#0F1A3C] to-[#070D1F] border-[#FF007F]/20 text-neutral-300'
    }`}>
      {/* Ambient top-edge subtle brand light spill */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF007F]/60 dark:via-[#FF1990]/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-1/4 h-24 bg-gradient-to-b from-[#FF007F]/10 to-transparent blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* Column 1: Brand Logo & Information (Span 4) */}
          <div className="lg:col-span-4 space-y-4 pr-0 lg:pr-6">
            {/* Website Brand Logo */}
            <div
              id="footer-logo-brand"
              onClick={() => onNavigate('home')}
              className="cursor-pointer group select-none inline-flex transform hover:scale-[1.02] transition-transform duration-200"
            >
              <Logo size="lg" isLightMode={isLightMode} />
            </div>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isLightMode ? 'text-neutral-600' : 'text-neutral-300/85'
            }`}>
              Shop the latest trends, curated luxury collections, top atelier brands, and exclusive deals all in one place. We make online shopping easy, secure, and exceptional for everyone.
            </p>

            {/* Follow Us Section */}
            <div className="pt-2">
              <span className={`text-[11px] uppercase font-black tracking-[0.18em] block mb-3.5 ${
                isLightMode ? 'text-[#0F1A3C]' : 'text-[#FF007F]'
              }`}>
                FOLLOW US
              </span>
              <div className="flex flex-wrap gap-2.5 items-center">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs cursor-pointer border ${
                      isLightMode
                        ? 'bg-white border-[#E5DAC4] text-neutral-700 hover:border-[#FF007F] hover:text-[#FF007F] hover:shadow-[0_4px_12px_rgba(255,0,127,0.25)] hover:-translate-y-0.5 active:scale-95'
                        : 'bg-[#142145]/90 border-white/10 text-neutral-300 hover:border-[#FF007F] hover:text-[#FF007F] hover:shadow-[0_4px_14px_rgba(255,0,127,0.3)] hover:-translate-y-0.5 active:scale-95'
                    } ${social.hoverClass}`}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: SHOP Links (Span 3) */}
          <div className="lg:col-span-2 sm:col-span-1 space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.18em] ${
                isLightMode ? 'text-[#0F1A3C]' : 'text-white'
              }`}>
                SHOP
              </h4>
              <div className="h-0.5 w-6 bg-gradient-to-r from-[#FF1990] to-[#FF007F] rounded-full mt-1.5" />
            </div>

            <ul className="space-y-2 text-xs font-medium pt-1">
              {shopLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.action}
                      className={`w-full flex items-center justify-between py-1 transition-all duration-200 group text-left cursor-pointer ${
                        isLightMode 
                          ? 'text-neutral-600 hover:text-[#FF007F]' 
                          : 'text-neutral-300 hover:text-[#FF007F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-[#FF007F] group-hover:scale-115 transition-transform duration-200 shrink-0" />
                        <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF007F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: CUSTOMER SERVICE Links (Span 3) */}
          <div className="lg:col-span-3 sm:col-span-1 space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.18em] ${
                isLightMode ? 'text-[#0F1A3C]' : 'text-white'
              }`}>
                CUSTOMER SERVICE
              </h4>
              <div className="h-0.5 w-6 bg-gradient-to-r from-[#FF1990] to-[#FF007F] rounded-full mt-1.5" />
            </div>

            <ul className="space-y-2 text-xs font-medium pt-1">
              {customerServiceLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={item.action}
                      className={`w-full flex items-center justify-between py-1 transition-all duration-200 group text-left cursor-pointer ${
                        isLightMode 
                          ? 'text-neutral-600 hover:text-[#FF007F]' 
                          : 'text-neutral-300 hover:text-[#FF007F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-[#FF007F] group-hover:scale-115 transition-transform duration-200 shrink-0" />
                        <span className="truncate group-hover:translate-x-0.5 transition-transform duration-200">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF007F] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 4: STAY UPDATED (Span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-[0.18em] ${
                isLightMode ? 'text-[#0F1A3C]' : 'text-white'
              }`}>
                STAY UPDATED
              </h4>
              <div className="h-0.5 w-6 bg-gradient-to-r from-[#FF1990] to-[#FF007F] rounded-full mt-1.5" />
            </div>

            <p className={`text-xs leading-relaxed ${
              isLightMode ? 'text-neutral-600' : 'text-neutral-300/85'
            }`}>
              Subscribe to get special offers, complimentary gifts, and once-in-a-lifetime private atelier deals.
            </p>

            {/* Newsletter Input & Submit */}
            <form onSubmit={handleSubscribe} className="space-y-3 pt-1">
              <div className="relative flex items-center group">
                <Mail className="w-4 h-4 text-[#FF007F] absolute left-3.5 pointer-events-none group-focus-within:text-[#FF1990] transition-colors" />
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs outline-none transition-all font-medium border shadow-xs ${
                    isLightMode
                      ? 'bg-white border-[#E0D5BE] text-neutral-900 placeholder-neutral-400 focus:border-[#FF007F] focus:ring-2 focus:ring-[#FF007F]/20'
                      : 'bg-[#142145]/80 border-white/15 text-white placeholder-neutral-400 focus:border-[#FF007F] focus:ring-2 focus:ring-[#FF007F]/25'
                  }`}
                />
              </div>

              <button
                id="newsletter-subscribe-btn"
                type="submit"
                className={`w-full py-2.5 font-black text-xs uppercase tracking-[0.14em] rounded-xl shadow-md active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${
                  subscribed
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                    : 'bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:brightness-110 text-white border-[#FF007F] shadow-[0_4px_16px_rgba(255,0,127,0.35)]'
                }`}
                title="Subscribe to Newsletter"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subscribed Successfully!</span>
                  </>
                ) : (
                  <>
                    <span>SUBSCRIBE NOW</span>
                    <Send className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Promo Card: Get 10% Off Your First Order! */}
            <div className={`relative p-3.5 rounded-2xl border transition-all overflow-hidden ${
              isLightMode 
                ? 'bg-gradient-to-br from-rose-500/15 via-pink-500/5 to-white border-rose-500/30 shadow-xs' 
                : 'bg-gradient-to-br from-[#FF007F]/15 via-[#18264D] to-[#0F1A3C] border-[#FF007F]/35 shadow-[0_8px_20px_-6px_rgba(255,0,127,0.15)]'
            }`}>
              {/* Subtle upper sheen streak */}
              <div className="absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

              <div className="flex items-start gap-3 relative z-10">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF1990] to-[#FF007F] text-white flex items-center justify-center shrink-0 shadow-md ring-1 ring-inset ring-white/40">
                  <Tag className="w-4.5 h-4.5 stroke-[2.25]" />
                </div>
                <div className="space-y-0.5">
                  <h5 className={`text-xs font-black tracking-wide ${isLightMode ? 'text-[#D80068]' : 'text-pink-300'}`}>
                    Get 10% Off Your First Order!
                  </h5>
                  <p className={`text-[11px] leading-snug ${isLightMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
                    Join our newsletter and enjoy exclusive discounts, early access, and secret atelier drop alerts.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Feature / Trust Badges Card */}
        <FeaturesSection isLightMode={isLightMode} className="!my-0 !px-0" />

        {/* Bottom Hairline Divider */}
        <div className={`h-px w-full ${isLightMode ? 'bg-[#E5DAC4]' : 'bg-gradient-to-r from-transparent via-white/10 to-transparent'}`} />

        {/* Bottom Copyright & Payment Badges Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Left: Copyright */}
          <div className="text-center md:text-left text-neutral-400 text-xs">
            <p className={isLightMode ? 'text-neutral-600' : 'text-neutral-400'}>
              © 2026 <strong className={isLightMode ? 'text-[#0F1A3C]' : 'text-white'}>ALIKE-ND</strong>. All rights reserved. Crafted with excellence for discerning collectors.
            </p>
          </div>

          {/* Center/Right: We Accept Payment Cards */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.15em] mr-1 ${
              isLightMode ? 'text-neutral-500' : 'text-neutral-400'
            }`}>
              WE ACCEPT
            </span>

            {/* Payment Chips */}
            {[
              { label: 'VISA', color: 'text-blue-500' },
              { label: 'Mastercard', color: 'text-amber-500' },
              { label: 'American Express', color: 'text-sky-400' },
              { label: 'PayPal', color: 'text-blue-400' },
              { label: 'UPI', color: 'text-emerald-400' },
              { label: 'RuPay', color: 'text-orange-400' }
            ].map((chip) => (
              <span
                key={chip.label}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider shadow-2xs border ${
                  isLightMode 
                    ? 'bg-white border-[#E0D5BE] text-neutral-800' 
                    : 'bg-[#142145]/90 border-white/10 text-neutral-200'
                }`}
              >
                <span className={chip.color}>{chip.label}</span>
              </span>
            ))}
          </div>

          {/* Far Right: Back button (if enabled) */}
          {showBackButton && onBack && (
            <div className="flex items-center justify-center md:justify-end gap-2">
              <button
                type="button"
                id="footer-back-button"
                onClick={onBack}
                className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-xs cursor-pointer flex items-center gap-1.5 ${
                  isLightMode 
                    ? 'bg-white hover:bg-neutral-100 border-[#E0D5BE] text-[#0F1A3C] hover:border-[#FF007F]' 
                    : 'bg-[#142145] hover:bg-[#1A2A57] border-white/10 text-neutral-200 hover:text-[#FF007F] hover:border-[#FF007F]/40'
                }`}
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 text-[#FF007F]" />
                <span className="text-[11px] font-bold">Back</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </footer>
  );
}
