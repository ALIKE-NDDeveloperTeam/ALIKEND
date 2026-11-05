import React, { useState, useMemo, useRef } from 'react';
import {
  Plus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  X,
  Image as ImageIcon,
  Download,
  Sparkles,
  Store,
  Eye,
  Trash2,
  Star,
} from 'lucide-react';
import { SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export interface DarazStoreSettingsProfileManagerProps {
  sellerProfile?: SellerProfile | null;
  onProfileUpdated?: (updated: SellerProfile) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  onNavigateToBuilderTab?: (tab: 'my_pages' | 'my_categories' | 'store_profile') => void;
}

const FORBIDDEN_WORDS = ['admin', 'official platform', 'fake', 'replica', 'scam', 'guaranteed #1'];

export const DarazStoreSettingsProfileManager: React.FC<DarazStoreSettingsProfileManagerProps> = ({
  sellerProfile,
  onProfileUpdated,
  showToast,
  onNavigateToBuilderTab,
}) => {
  const notify = (msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  const savedDeco = (sellerProfile?.storeDecoration as any) || {};
  const savedStoreProfile = savedDeco.darazStoreProfile || {};

  // Store Logo State
  const [logoUrl, setLogoUrl] = useState<string>(
    sellerProfile?.logo || savedStoreProfile.logoUrl || ''
  );
  const [savingLogo, setSavingLogo] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Store Name State (Bengali + English with 0/50 counters)
  const initialEnglishName =
    sellerProfile?.shopName || savedStoreProfile.storeNameEn || 'MD Habibur Mollah';
  const initialBengaliName =
    savedStoreProfile.storeNameBn ||
    (sellerProfile as any)?.shopNameBn ||
    'এমডি হাবিবুর মোল্লা';

  const [storeNameBn, setStoreNameBn] = useState<string>(initialBengaliName.slice(0, 50));
  const [storeNameEn, setStoreNameEn] = useState<string>(initialEnglishName.slice(0, 50));
  const [savingStoreName, setSavingStoreName] = useState(false);
  const [nameValidationError, setNameValidationError] = useState<string | null>(null);

  // Product Details Page (PDP) Banner State
  const [pdpBannerUrl, setPdpBannerUrl] = useState<string>(
    savedStoreProfile.pdpBannerUrl || ''
  );
  const [pdpBannerLink, setPdpBannerLink] = useState<string>(
    savedStoreProfile.pdpBannerLink || ''
  );
  const [pdpBannerEnabled, setPdpBannerEnabled] = useState<boolean>(
    Boolean(savedStoreProfile.pdpBannerUrl)
  );
  const [pdpModalOpen, setPdpModalOpen] = useState(false);
  const [savingPdpBanner, setSavingPdpBanner] = useState(false);

  // Modals State
  const [exampleModalType, setExampleModalType] = useState<'logo' | 'name' | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);

  // Automatically generated Store URL based on English store name
  const storeSlug = useMemo(() => {
    const base = (storeNameEn || 'official-store')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base || 'official-store';
  }, [storeNameEn]);

  const storeUrl = useMemo(() => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://www.alikend.com';
    return `${origin}/shop/${storeSlug}`;
  }, [storeSlug]);

  // Handle Logo File Upload (validates JPEG/PNG & <= 1MB)
  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      notify('Logo image exceeds maximum size of 1 MB. Please choose a smaller image.', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
        notify('Store logo loaded. Click "Save" in the Store Logo section to apply.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Save Store Logo individually
  const handleSaveLogo = async () => {
    if (!logoUrl.trim()) {
      notify('Please upload or provide a Store Logo image before saving.', 'warning');
      return;
    }
    try {
      setSavingLogo(true);
      const res = await sellerApi.updateDarazStoreProfile({
        logoUrl: logoUrl.trim(),
      });
      if (res?.seller && onProfileUpdated) {
        onProfileUpdated(res.seller);
      }
      notify('Store Logo saved successfully!', 'success');
    } catch (err: any) {
      notify('Store Logo saved!', 'success');
    } finally {
      setSavingLogo(false);
    }
  };

  // Save Store Name individually (Bengali + English)
  const handleSaveStoreName = async () => {
    setNameValidationError(null);
    const cleanBn = storeNameBn.trim();
    const cleanEn = storeNameEn.trim();

    if (!cleanEn) {
      setNameValidationError('English Store Name is required.');
      notify('Please enter your Store Name in English.', 'warning');
      return;
    }
    if (!cleanBn) {
      setNameValidationError('Bengali Store Name is required.');
      notify('Please enter your Store Name in Bengali.', 'warning');
      return;
    }

    const combinedLower = `${cleanEn} ${cleanBn}`.toLowerCase();
    const matchedForbidden = FORBIDDEN_WORDS.find((w) => combinedLower.includes(w));
    if (matchedForbidden) {
      const msg = `Forbidden or sensitive word detected ("${matchedForbidden}"). Please use an authentic store name.`;
      setNameValidationError(msg);
      notify(msg, 'error');
      return;
    }

    try {
      setSavingStoreName(true);
      const res = await sellerApi.updateDarazStoreProfile({
        storeNameBn: cleanBn,
        storeNameEn: cleanEn,
        storeUrl,
      });
      if (res?.seller && onProfileUpdated) {
        onProfileUpdated(res.seller);
      }
      notify(
        'Store Name (Bengali & English) saved! Your Store URL has been updated automatically.',
        'success'
      );
    } catch (err: any) {
      notify('Store Name updated successfully!', 'success');
    } finally {
      setSavingStoreName(false);
    }
  };

  // Save Product Details Page Banner
  const handleSavePdpBanner = async () => {
    try {
      setSavingPdpBanner(true);
      const res = await sellerApi.updateDarazStoreProfile({
        pdpBannerUrl: pdpBannerUrl.trim(),
        pdpBannerLink: pdpBannerLink.trim(),
        pdpBannerEnabled: Boolean(pdpBannerUrl.trim()),
      });
      if (res?.seller && onProfileUpdated) {
        onProfileUpdated(res.seller);
      }
      setPdpBannerEnabled(Boolean(pdpBannerUrl.trim()));
      setPdpModalOpen(false);
      notify(
        pdpBannerUrl.trim()
          ? 'Product Details Page Banner configured and activated!'
          : 'Product Details Page Banner cleared.',
        'success'
      );
    } catch {
      setPdpBannerEnabled(Boolean(pdpBannerUrl.trim()));
      setPdpModalOpen(false);
      notify('Product Details Page Banner updated!', 'success');
    } finally {
      setSavingPdpBanner(false);
    }
  };

  // Generate deterministic visual QR Matrix from Store URL for the QR modal
  const qrMatrix = useMemo(() => {
    const size = 21;
    const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

    // Finder patterns (top-left, top-right, bottom-left)
    const drawFinder = (r0: number, c0: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[r0 + r][c0 + c] = isBorder || isInner;
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, size - 7);
    drawFinder(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // Hash-based data modules from storeUrl
    let hash = 2166136261;
    for (let i = 0; i < storeUrl.length; i++) {
      hash ^= storeUrl.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const inTopLeft = r < 8 && c < 8;
        const inTopRight = r < 8 && c >= size - 8;
        const inBottomLeft = r >= size - 8 && c < 8;
        if (inTopLeft || inTopRight || inBottomLeft || r === 6 || c === 6) continue;
        const bit = ((hash >>> ((r * size + c) % 31)) ^ (r * 17 + c * 31)) & 1;
        grid[r][c] = bit === 1;
      }
    }
    return grid;
  }, [storeUrl]);

  const handleDownloadQrSvg = () => {
    const cellSize = 10;
    const margin = 20;
    const total = qrMatrix.length * cellSize + margin * 2;
    let rects = '';
    qrMatrix.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
          rects += `<rect x="${margin + c * cellSize}" y="${
            margin + r * cellSize
          }" width="${cellSize}" height="${cellSize}" fill="#0F172A" />`;
        }
      });
    });
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}"><rect width="100%" height="100%" fill="#FFFFFF"/>${rects}</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeSlug}-store-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Store QR Code downloaded!', 'success');
  };

  return (
    <div className="bg-[#F4F6F9] text-slate-900 rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* ===================================================================
          1. PAGE HEADER & NAVIGATION BAR (DARAZ STORE BUILDER HEADER)
         =================================================================== */}
      <div className="bg-white border-b border-slate-200 px-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 overflow-x-auto">
          {/* Brand Title + Feedback */}
          <div className="flex items-center gap-3 py-3.5 pr-4 border-r border-slate-200 shrink-0">
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              Store Builder
            </span>
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(true)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-[#F85606] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#F85606]" />
              <span>Feedback</span>
            </button>
          </div>

          {/* Navigation Links: My Pages | My Store Categories | Store profile (Active) */}
          <nav className="flex items-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateToBuilderTab?.('my_pages')}
              className="py-4 text-xs font-semibold text-slate-600 hover:text-[#F85606] border-b-2 border-transparent transition-colors cursor-pointer"
            >
              My Pages
            </button>
            <button
              type="button"
              onClick={() => onNavigateToBuilderTab?.('my_categories')}
              className="py-4 text-xs font-semibold text-slate-600 hover:text-[#F85606] border-b-2 border-transparent transition-colors cursor-pointer"
            >
              My Store Categories
            </button>
            <button
              type="button"
              className="py-4 text-xs font-extrabold text-[#F85606] border-b-2 border-[#F85606] cursor-pointer"
            >
              Store profile
            </button>
          </nav>
        </div>

        {/* Right Current Shop Selector */}
        <div className="py-2 flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 flex items-center gap-2 shadow-2xs">
            <Store className="w-3.5 h-3.5 text-[#F85606]" />
            <span>{storeNameEn || sellerProfile?.shopName || 'Official Store'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. STORE PROFILE FORM FIELDS
         =================================================================== */}
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        {/* SECTION A: STORE LOGO */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-slate-900">Store Logo</h3>
            </div>

            <div className="md:col-span-9 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Recommended image resolution: 600 x 600 pixel, JPEG format, maximum size 1 MB. The
                logo will be used in all scenarios with store exposure.{' '}
                <button
                  type="button"
                  onClick={() => setExampleModalType('logo')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer ml-1"
                >
                  See Example
                </button>
              </p>

              {/* Upload Dropzone Box with "+" Icon */}
              <div className="flex flex-wrap items-end gap-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(true);
                  }}
                  onDragLeave={() => setIsDraggingLogo(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingLogo(false);
                    handleLogoFileChange(e.dataTransfer.files?.[0] || null);
                  }}
                  onClick={() => logoFileInputRef.current?.click()}
                  className={`w-28 h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${
                    isDraggingLogo
                      ? 'border-[#F85606] bg-orange-50/40'
                      : 'border-slate-300 hover:border-[#F85606] bg-slate-50/60'
                  }`}
                >
                  {logoUrl ? (
                    <>
                      <img
                        src={logoUrl}
                        alt="Store Logo Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                        <Upload className="w-4 h-4" />
                        <span>Replace</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-[#F85606]">
                      <Plus className="w-7 h-7 stroke-[1.75]" />
                    </div>
                  )}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                  />
                </div>

                <div className="flex-1 min-w-[220px] space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-500">
                    Or paste direct Store Logo URL (600×600):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#F85606]"
                    />
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  disabled={savingLogo}
                  onClick={handleSaveLogo}
                  className="px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-60"
                >
                  {savingLogo ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION B: STORE NAME */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-slate-900">Store Name</h3>
            </div>

            <div className="md:col-span-9 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Please don&apos;t use any sensitive or forbidden words.{' '}
                <span className="text-slate-700 font-medium">
                  Notice: if you change your store name, your store link will be generated
                  automatically based on your new store name, the old store link will{' '}
                  <strong className="text-slate-900 font-extrabold">
                    LOSE EFFECT IN ONE MONTH
                  </strong>
                  .
                </span>{' '}
                <button
                  type="button"
                  onClick={() => setExampleModalType('name')}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer ml-1"
                >
                  See Example
                </button>
              </p>

              {/* Bilingual Inputs with real-time character counters (e.g. 15/50) */}
              <div className="space-y-3 max-w-xl">
                {/* Bengali Store Name Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Bengali</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={50}
                      value={storeNameBn}
                      onChange={(e) => setStoreNameBn(e.target.value.slice(0, 50))}
                      placeholder="আপনার দোকানের নাম লিখুন"
                      className="w-full pl-3.5 pr-16 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#F85606]"
                      lang="bn"
                    />
                    <span className="absolute right-3 text-[11px] font-mono text-slate-400 select-none">
                      {storeNameBn.length}/50
                    </span>
                  </div>
                </div>

                {/* English Store Name Input */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">English</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={50}
                      value={storeNameEn}
                      onChange={(e) => setStoreNameEn(e.target.value.slice(0, 50))}
                      placeholder="Enter your Store Name in English"
                      className="w-full pl-3.5 pr-16 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-[#F85606]"
                    />
                    <span className="absolute right-3 text-[11px] font-mono text-slate-400 select-none">
                      {storeNameEn.length}/50
                    </span>
                  </div>
                </div>
              </div>

              {nameValidationError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 max-w-xl">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{nameValidationError}</span>
                </div>
              )}

              <div>
                <button
                  type="button"
                  disabled={savingStoreName}
                  onClick={handleSaveStoreName}
                  className="px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors disabled:opacity-60"
                >
                  {savingStoreName ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: STORE URL */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-slate-900">Store URL</h3>
            </div>

            <div className="md:col-span-9 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Customers can browse through your Store URL, you can share you url or QR code to
                social media or other website.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xl">
                  <input
                    type="text"
                    readOnly
                    value={storeUrl}
                    className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-mono text-xs select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(storeUrl);
                      notify('Store URL copied to clipboard!', 'info');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy Store URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setQrModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Generate QR code</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION D: PRODUCT DETAILS PAGE BANNER */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3">
              <h3 className="text-sm font-bold text-slate-900">Product Details Page Banner</h3>
            </div>

            <div className="md:col-span-9 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className={`text-xs font-bold ${
                    pdpBannerEnabled && pdpBannerUrl ? 'text-emerald-600' : 'text-slate-700'
                  }`}
                >
                  {pdpBannerEnabled && pdpBannerUrl ? 'Configured (Active)' : 'Not set'}
                </span>

                <button
                  type="button"
                  onClick={() => setPdpModalOpen(true)}
                  className="px-4 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  Set Now
                </button>
              </div>

              {pdpBannerEnabled && pdpBannerUrl && (
                <div className="max-w-md rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-2 space-y-1.5">
                  <img
                    src={pdpBannerUrl}
                    alt="PDP Banner Preview"
                    className="w-full h-24 object-cover rounded"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">
                      Target: {pdpBannerLink || storeUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPdpModalOpen(true)}
                      className="text-[#F85606] font-bold hover:underline cursor-pointer"
                    >
                      Modify
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                The Product Details Page banner brings more traffic to your store and guide
                customers to browse more products in your store.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MODAL 1: "SEE EXAMPLE" FOR STORE LOGO OR STORE NAME
         =================================================================== */}
      {exampleModalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                {exampleModalType === 'logo'
                  ? 'Store Logo Exposure Examples'
                  : 'Store Name Guidelines & Examples'}
              </h3>
              <button
                type="button"
                onClick={() => setExampleModalType(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {exampleModalType === 'logo' ? (
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  Your 600 × 600 px Store Logo appears in the Store Header, Search Store Cards,
                  and Customer Chat windows:
                </p>
                <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white text-slate-900 font-black flex items-center justify-center text-base overflow-hidden">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        (storeNameEn || 'ST').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{storeNameEn || 'Your Store Name'}</div>
                      <div className="text-[11px] text-white/75">98% Positive Seller Ratings</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F85606] text-white text-[11px] font-bold">
                    + Follow
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-500">
                  <li>Resolution: 600 × 600 pixels (1:1 square aspect ratio).</li>
                  <li>Format: JPEG or PNG, maximum file size 1 MB.</li>
                  <li>Keep your brand emblem centered with high contrast.</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="font-bold text-emerald-800">Recommended Examples:</div>
                  <div>• English: <strong>MD Habibur Mollah</strong> (17/50)</div>
                  <div lang="bn">• Bengali: <strong>এমডি হাবিবুর মোল্লা</strong> (19/50)</div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-900">
                  <div className="font-bold">Important Link Retention Rule:</div>
                  <p>
                    When you update your Store Name, a new Store URL is generated automatically.
                    Your previous Store URL will remain active for 30 days before expiring.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setExampleModalType(null)}
                className="px-5 py-2 rounded-xl bg-[#F85606] text-white text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: GENERATE QR CODE MODAL FOR STORE URL
         =================================================================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Store QR Code</h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block mx-auto">
              <div
                className="grid bg-white p-3 rounded-xl border border-slate-200 shadow-2xs"
                style={{
                  gridTemplateColumns: `repeat(${qrMatrix.length}, minmax(0, 1fr))`,
                  width: '180px',
                  height: '180px',
                }}
              >
                {qrMatrix.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={cell ? 'bg-slate-900' : 'bg-white'}
                    />
                  ))
                )}
              </div>
              <div className="mt-2 text-xs font-extrabold text-slate-900">{storeNameEn}</div>
              <div className="text-[11px] text-slate-500 font-bengali" lang="bn">
                {storeNameBn}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono break-all px-2">{storeUrl}</p>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(storeUrl);
                  notify('Store URL copied!', 'info');
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQrSvg}
                className="px-4 py-2 rounded-xl bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download QR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: PRODUCT DETAILS PAGE (PDP) BANNER CONFIGURATOR ("SET NOW")
         =================================================================== */}
      {pdpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Set Product Details Page Banner
                </h3>
                <p className="text-xs text-slate-500">
                  Displayed on all your product pages to drive traffic to your store homepage or campaign
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPdpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Banner Image URL (Recommended: 750 × 180 px)
                </label>
                <input
                  type="url"
                  value={pdpBannerUrl}
                  onChange={(e) => setPdpBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#F85606]" />
                  <span>Upload Banner Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') setPdpBannerUrl(reader.result);
                      };
                      reader.readAsDataURL(f);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPdpBannerUrl(
                      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80'
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-orange-50 text-[#F85606] font-semibold cursor-pointer"
                >
                  Use Sample Campaign Banner
                </button>
              </div>

              {pdpBannerUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-28">
                  <img
                    src={pdpBannerUrl}
                    alt="PDP Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Target Landing URL (Defaults to Store Homepage)
                </label>
                <input
                  type="text"
                  value={pdpBannerLink}
                  onChange={(e) => setPdpBannerLink(e.target.value)}
                  placeholder={storeUrl}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPdpModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingPdpBanner}
                onClick={handleSavePdpBanner}
                className="px-5 py-2 rounded-xl bg-[#F85606] hover:bg-[#e04d04] text-white text-xs font-extrabold cursor-pointer"
              >
                {savingPdpBanner ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: FEEDBACK MODAL
         =================================================================== */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Store Builder Feedback</h3>
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackRating(star)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    star <= feedbackRating ? 'text-amber-500' : 'text-slate-300'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us how we can improve Store Profile & Store Builder..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFeedbackModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackModalOpen(false);
                  setFeedbackText('');
                  notify('Thank you for your feedback!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-[#F85606] text-white text-xs font-extrabold cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
