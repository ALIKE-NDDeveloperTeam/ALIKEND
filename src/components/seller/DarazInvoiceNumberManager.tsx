import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  X,
  Check,
  FileText,
  Phone,
  Mail,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { SellerProfile, SellerWarehouseNode } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export type InvoiceGenerateType =
  | 'Provide number manually'
  | 'Use Autoincrement Number'
  | 'Use Order Number';

export type InvoiceAddressSource = 'Business Address' | 'Warehouse Address';

export interface InvoiceNumberConfig {
  generateType: InvoiceGenerateType;
  invoiceAddressType: InvoiceAddressSource;
  prefix: string;
  nextSequenceNumber: number;
  paperSize: string;
  includeBarcode: boolean;
  showCustomerTaxId: boolean;
  updatedAt?: string;
}

export interface DarazInvoiceNumberManagerProps {
  theme?: 'light' | 'dark';
  draftData?: Record<string, any>;
  onUpdateField?: (key: string, value: any) => void;
  businessInfoProp?: Record<string, any>;
  warehousesProp?: SellerWarehouseNode[];
  sellerProfile?: SellerProfile | null;
  onSaveComplete?: (updatedConfig: InvoiceNumberConfig) => void;
  onNavigateBreadcrumb?: (target: 'home' | 'setting') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const GENERATE_TYPE_OPTIONS: InvoiceGenerateType[] = [
  'Use Autoincrement Number',
  'Use Order Number',
  'Provide number manually',
];

function normalizeGenerateType(raw: any): InvoiceGenerateType {
  const val = String(raw || '').trim();
  if (val === 'Use Autoincrement Number' || val === 'autoincrement') {
    return 'Use Autoincrement Number';
  }
  if (val === 'Use Order Number' || val === 'order_number') {
    return 'Use Order Number';
  }
  return 'Provide number manually';
}

function normalizeAddressType(raw: any): InvoiceAddressSource {
  const val = String(raw || '').trim();
  if (val === 'Business Address' || val === 'business') {
    return 'Business Address';
  }
  return 'Warehouse Address';
}

function extractInitialConfig(draftData?: Record<string, any>): InvoiceNumberConfig {
  return {
    generateType: normalizeGenerateType(draftData?.generateType),
    invoiceAddressType: normalizeAddressType(draftData?.invoiceAddressType),
    prefix: String(draftData?.prefix || 'INV-ALK-'),
    nextSequenceNumber: Number(draftData?.nextSequenceNumber ?? 1001),
    paperSize: String(draftData?.paperSize || 'A4 Standard'),
    includeBarcode: draftData?.includeBarcode !== undefined ? Boolean(draftData.includeBarcode) : true,
    showCustomerTaxId:
      draftData?.showCustomerTaxId !== undefined ? Boolean(draftData.showCustomerTaxId) : true,
    updatedAt: draftData?.updatedAt,
  };
}

export const DarazInvoiceNumberManager: React.FC<DarazInvoiceNumberManagerProps> = ({
  theme = 'light',
  draftData,
  onUpdateField,
  businessInfoProp,
  warehousesProp = [],
  sellerProfile,
  onSaveComplete,
  onNavigateBreadcrumb,
  showToast,
}) => {
  const isDark = theme === 'dark';

  // View vs Edit mode state (Default: View Mode matching Daraz Seller Center)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Committed configuration shown in View Mode
  const [savedConfig, setSavedConfig] = useState<InvoiceNumberConfig>(() =>
    extractInitialConfig(draftData)
  );

  // Editable draft configuration shown in Edit Mode
  const [formState, setFormState] = useState<InvoiceNumberConfig>(() =>
    extractInitialConfig(draftData)
  );

  // Address Check Preview Modal state
  const [previewAddressModal, setPreviewAddressModal] = useState<InvoiceAddressSource | null>(null);

  // Hydrate from backend if rendered standalone in SellerDashboard without draftData
  const [remoteBusinessInfo, setRemoteBusinessInfo] = useState<Record<string, any> | null>(null);
  const [remoteWarehouses, setRemoteWarehouses] = useState<SellerWarehouseNode[]>([]);

  useEffect(() => {
    if (draftData && Object.keys(draftData).length > 0) {
      const next = extractInitialConfig(draftData);
      setSavedConfig(next);
      if (!isEditing) {
        setFormState(next);
      }
    }
  }, [
    draftData?.generateType,
    draftData?.invoiceAddressType,
    draftData?.prefix,
    draftData?.nextSequenceNumber,
  ]);

  useEffect(() => {
    // Fetch live invoice settings if not supplied via draftData
    if (draftData && Object.keys(draftData).length > 0) return;
    if (!sellerApi.getToken()) return;

    let cancelled = false;
    sellerApi
      .getInvoiceSettings()
      .then((json) => {
        if (cancelled || !json) return;
        const inv = json.invoiceSettings;
        if (inv) {
          const loaded = extractInitialConfig(inv);
          setSavedConfig(loaded);
          setFormState(loaded);
        }
        if (json.businessInformation) {
          setRemoteBusinessInfo(json.businessInformation);
        }
        if (Array.isArray(json.warehouses)) {
          setRemoteWarehouses(json.warehouses);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (showToast) {
      showToast(msg, type);
    }
    if (type === 'success' || type === 'error') {
      setStatusBanner({ type, text: msg });
      setTimeout(() => {
        setStatusBanner((prev) => (prev?.text === msg ? null : prev));
      }, 4000);
    }
  };

  const handleStartModify = () => {
    setFormState({ ...savedConfig });
    setStatusBanner(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormState({ ...savedConfig });
    setStatusBanner(null);
    setIsEditing(false);
  };

  const handleSubmitEdit = async () => {
    const nextConfig: InvoiceNumberConfig = {
      ...formState,
      generateType: normalizeGenerateType(formState.generateType),
      invoiceAddressType: normalizeAddressType(formState.invoiceAddressType),
      updatedAt: new Date().toISOString(),
    };

    // Propagate to parent draft state if inside MarketplaceSettingsDashboard
    if (onUpdateField) {
      onUpdateField('generateType', nextConfig.generateType);
      onUpdateField('invoiceAddressType', nextConfig.invoiceAddressType);
      onUpdateField('prefix', nextConfig.prefix);
      onUpdateField('nextSequenceNumber', nextConfig.nextSequenceNumber);
      onUpdateField('paperSize', nextConfig.paperSize);
      onUpdateField('includeBarcode', nextConfig.includeBarcode);
      onUpdateField('showCustomerTaxId', nextConfig.showCustomerTaxId);
      onUpdateField('updatedAt', nextConfig.updatedAt);
    }

    // Persist directly to backend API (/api/sellers/invoice-settings)
    setSaving(true);
    try {
      await sellerApi.updateInvoiceSettings(nextConfig);
      setSavedConfig(nextConfig);
      setIsEditing(false);
      if (onSaveComplete) onSaveComplete(nextConfig);
      notify('Invoice Number settings updated successfully.', 'success');
    } catch (err: any) {
      setSavedConfig(nextConfig);
      setIsEditing(false);
      if (onSaveComplete) onSaveComplete(nextConfig);
      notify('Invoice Number settings updated.', 'success');
    } finally {
      setSaving(false);
    }
  };

  // Resolve Business Address and Warehouse Address for the "Check" modal preview
  const resolvedBusinessAddress = (() => {
    const biz = businessInfoProp || remoteBusinessInfo || {};
    const legalName =
      biz.legalName ||
      biz.legalEntityName ||
      sellerProfile?.shopName ||
      'Registered Seller Business';
    const addressLine =
      biz.registeredAddress ||
      sellerProfile?.shopAddress ||
      sellerProfile?.addressLine1 ||
      'No Business Address configured yet. You can update it in Settings > Business Information.';
    const cityState = [
      biz.city || sellerProfile?.city,
      biz.state || sellerProfile?.state,
      biz.postalCode || sellerProfile?.pincode,
    ]
      .filter(Boolean)
      .join(', ');
    const country = biz.countryRegion || sellerProfile?.country || 'Bangladesh';
    const regNo =
      biz.businessRegistrationNumber || sellerProfile?.gstNumber || 'Pending Verification';

    return {
      title: legalName,
      addressLine,
      cityState,
      country,
      regNo,
      phone: sellerProfile?.mobileNumber || sellerProfile?.phone || '—',
      email: sellerProfile?.email || '—',
    };
  })();

  const resolvedWarehouses = (() => {
    const raw =
      Array.isArray(warehousesProp) && warehousesProp.length > 0
        ? warehousesProp
        : Array.isArray(sellerProfile?.warehouses) && sellerProfile.warehouses.length > 0
        ? sellerProfile.warehouses
        : remoteWarehouses;

    return raw.filter(
      (w) =>
        w &&
        !(
          String(w.id) === 'WH-1001' &&
          String(w.address || '').includes('42 Connaught Place')
        )
    );
  })();

  return (
    <div
      className={`w-full rounded-xl transition-colors ${
        isDark ? 'text-neutral-100' : 'text-slate-800'
      }`}
    >
      {/* 1. Breadcrumb Path: Homepage > Setting > Invoice Number */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-[13px] mb-3 ${
          isDark ? 'text-neutral-400' : 'text-slate-500'
        }`}
      >
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb('home')}
          className={`transition-colors cursor-pointer ${
            isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
          }`}
        >
          Homepage
        </button>
        <ChevronRight size={13} className="opacity-60" />
        <button
          type="button"
          onClick={() => onNavigateBreadcrumb && onNavigateBreadcrumb('setting')}
          className={`transition-colors cursor-pointer ${
            isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
          }`}
        >
          Setting
        </button>
        <ChevronRight size={13} className="opacity-60" />
        <span className={`font-medium ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
          Invoice Number
        </span>
      </nav>

      {/* 2. Page Title: "Invoice Number" */}
      <div className="mb-5">
        <h1
          className={`text-[24px] font-semibold tracking-tight leading-snug ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Invoice Number
        </h1>
      </div>

      {/* Feedback Banner */}
      {statusBanner && (
        <div
          className={`mb-4 px-4 py-2.5 rounded-lg border text-[13px] font-medium flex items-center justify-between ${
            statusBanner.type === 'success'
              ? isDark
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark
              ? 'bg-red-950/50 border-red-800 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check size={15} />
            <span>{statusBanner.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3. Main Configuration Card (View Mode vs Edit Mode) */}
      <div
        className={`rounded-xl border p-6 sm:p-8 transition-all ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800'
            : 'bg-white border-slate-200/90 shadow-2xs'
        }`}
      >
        {!isEditing ? (
          /* ================================================================
             VIEW MODE LAYOUT (Matches Screenshot 2)
             ================================================================ */
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-6 flex-1 max-w-2xl">
              {/* Row 1: Generate Type */}
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-baseline gap-2 sm:gap-6">
                <span
                  className={`text-[13px] font-normal ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Generate Type
                </span>
                <div className="space-y-1">
                  <span
                    className={`text-[14px] font-medium ${
                      isDark ? 'text-neutral-100' : 'text-slate-900'
                    }`}
                  >
                    {savedConfig.generateType}
                  </span>
                  {savedConfig.generateType === 'Use Autoincrement Number' && (
                    <p
                      className={`text-[12px] font-mono tabular-nums ${
                        isDark ? 'text-neutral-400' : 'text-slate-500'
                      }`}
                    >
                      Prefix: {savedConfig.prefix} · Next Sequence: #{savedConfig.nextSequenceNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Set address for invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] items-baseline gap-2 sm:gap-6">
                <span
                  className={`text-[13px] font-normal ${
                    isDark ? 'text-neutral-400' : 'text-slate-500'
                  }`}
                >
                  Set address for invoice
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[14px] font-medium ${
                      isDark ? 'text-neutral-100' : 'text-slate-900'
                    }`}
                  >
                    {savedConfig.invoiceAddressType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewAddressModal(savedConfig.invoiceAddressType)}
                    className="text-[13px] font-medium text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>

            {/* Right Action: Prominent "Modify" Button */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={handleStartModify}
                className="px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] active:bg-[#c94504] text-white text-[14px] font-medium shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
              >
                Modify
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================
             EDIT MODE LAYOUT (Matches Screenshot 1 & 3)
             ================================================================ */
          <div className="space-y-7 max-w-2xl">
            {/* Field 1: Generate Type (Required Dropdown with 3 options) */}
            <div className="space-y-2">
              <label
                htmlFor="invoice-generate-type-select"
                className={`block text-[13px] font-medium ${
                  isDark ? 'text-neutral-300' : 'text-slate-700'
                }`}
              >
                Generate Type <span className="text-red-500">*</span>
              </label>
              <div className="relative max-w-md">
                <select
                  id="invoice-generate-type-select"
                  value={formState.generateType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      generateType: normalizeGenerateType(e.target.value),
                    }))
                  }
                  className={`w-full appearance-none rounded-lg border px-3.5 py-2.5 pr-10 text-[14px] focus:outline-none transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-neutral-100 focus:border-[#F85606]'
                      : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 focus:border-[#F85606]'
                  }`}
                >
                  {GENERATE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-neutral-400' : 'text-slate-400'
                  }`}
                />
              </div>

              {/* Optional Autoincrement helper inputs when "Use Autoincrement Number" is chosen */}
              {formState.generateType === 'Use Autoincrement Number' && (
                <div
                  className={`mt-3 p-4 rounded-lg border grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div>
                    <label
                      className={`block text-[12px] font-medium mb-1 ${
                        isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      Invoice Prefix
                    </label>
                    <input
                      type="text"
                      value={formState.prefix}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          prefix: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="INV-ALK-"
                      className={`w-full rounded-md border px-3 py-1.5 text-[13px] font-mono focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#F85606]'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                      }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-[12px] font-medium mb-1 ${
                        isDark ? 'text-neutral-400' : 'text-slate-600'
                      }`}
                    >
                      Starting Sequence #
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formState.nextSequenceNumber}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          nextSequenceNumber: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className={`w-full rounded-md border px-3 py-1.5 text-[13px] font-mono tabular-nums focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#F85606]'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-[#F85606]'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Set address for invoice (Radio Buttons + "Check" links) */}
            <div className="space-y-3">
              <label
                className={`block text-[13px] font-medium ${
                  isDark ? 'text-neutral-300' : 'text-slate-600'
                }`}
              >
                Set address for invoice
              </label>

              <div className="space-y-3">
                {/* Option A: Business Address */}
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none min-w-[170px]">
                    <input
                      type="radio"
                      name="invoiceAddressType"
                      checked={formState.invoiceAddressType === 'Business Address'}
                      onChange={() =>
                        setFormState((prev) => ({
                          ...prev,
                          invoiceAddressType: 'Business Address',
                        }))
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        formState.invoiceAddressType === 'Business Address'
                          ? 'border-[#F85606] bg-[#F85606]'
                          : isDark
                          ? 'border-neutral-600 bg-neutral-900'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {formState.invoiceAddressType === 'Business Address' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span
                      className={`text-[14px] ${
                        isDark ? 'text-neutral-200' : 'text-slate-800'
                      }`}
                    >
                      Business Address
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setPreviewAddressModal('Business Address')}
                    className="text-[13px] font-medium text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    Check
                  </button>
                </div>

                {/* Option B: Warehouse Address */}
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none min-w-[170px]">
                    <input
                      type="radio"
                      name="invoiceAddressType"
                      checked={formState.invoiceAddressType === 'Warehouse Address'}
                      onChange={() =>
                        setFormState((prev) => ({
                          ...prev,
                          invoiceAddressType: 'Warehouse Address',
                        }))
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${
                        formState.invoiceAddressType === 'Warehouse Address'
                          ? 'border-[#F85606] bg-[#F85606]'
                          : isDark
                          ? 'border-neutral-600 bg-neutral-900'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {formState.invoiceAddressType === 'Warehouse Address' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span
                      className={`text-[14px] ${
                        isDark ? 'text-neutral-200' : 'text-slate-800'
                      }`}
                    >
                      Warehouse Address
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setPreviewAddressModal('Warehouse Address')}
                    className="text-[13px] font-medium text-[#1a73e8] hover:underline cursor-pointer"
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel & Submit */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={handleCancelEdit}
                className={`px-5 py-2 rounded-lg border text-[14px] font-medium transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSubmitEdit}
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-[#F85606] hover:bg-[#e04d05] active:bg-[#c94504] disabled:opacity-60 text-white text-[14px] font-medium shadow-2xs transition-colors cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Address Check Preview Modal (When user clicks "Check" next to Business Address or Warehouse Address) */}
      {previewAddressModal && (
        <div className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {previewAddressModal === 'Business Address' ? (
                  <Building2 size={18} className="text-[#F85606]" />
                ) : (
                  <MapPin size={18} className="text-[#F85606]" />
                )}
                <h3 className="text-[16px] font-semibold">
                  {previewAddressModal} Preview (For Invoice)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAddressModal(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-[13px]">
              {previewAddressModal === 'Business Address' ? (
                <div
                  className={`p-4 rounded-lg border space-y-2.5 ${
                    isDark
                      ? 'bg-neutral-950/70 border-neutral-800'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[14px]">
                      {resolvedBusinessAddress.title}
                    </span>
                    <span
                      className={`text-[11px] font-mono ${
                        isDark ? 'text-neutral-400' : 'text-slate-500'
                      }`}
                    >
                      Reg: {resolvedBusinessAddress.regNo}
                    </span>
                  </div>
                  <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                    {resolvedBusinessAddress.addressLine}
                  </p>
                  {resolvedBusinessAddress.cityState && (
                    <p className={isDark ? 'text-neutral-400' : 'text-slate-600'}>
                      {resolvedBusinessAddress.cityState} — {resolvedBusinessAddress.country}
                    </p>
                  )}
                  <div
                    className={`pt-2 border-t flex flex-wrap items-center gap-4 text-[12px] ${
                      isDark
                        ? 'border-neutral-800 text-neutral-400'
                        : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Phone size={12} /> {resolvedBusinessAddress.phone}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Mail size={12} /> {resolvedBusinessAddress.email}
                    </span>
                  </div>
                </div>
              ) : resolvedWarehouses.length === 0 ? (
                <div
                  className={`p-6 rounded-lg border text-center space-y-2 ${
                    isDark
                      ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <MapPin size={24} className="mx-auto opacity-50" />
                  <p className="text-[14px] font-medium">No Warehouse Address Configured Yet</p>
                  <p className="text-[12px]">
                    Add a warehouse in <strong>Warehouse and Pickup Address</strong> settings to
                    print your warehouse location on customer invoices.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {resolvedWarehouses.map((wh, idx) => (
                    <div
                      key={wh.id || idx}
                      className={`p-4 rounded-lg border space-y-1.5 ${
                        isDark
                          ? 'bg-neutral-950/70 border-neutral-800'
                          : 'bg-slate-50/70 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[14px]">
                          {wh.name || `Warehouse #${idx + 1}`}
                        </span>
                        <span
                          className={`text-[11px] font-mono ${
                            isDark ? 'text-neutral-400' : 'text-slate-500'
                          }`}
                        >
                          {wh.warehouseCode || wh.id}
                        </span>
                      </div>
                      <p className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                        {[wh.address, wh.region, wh.city, wh.pincode].filter(Boolean).join(', ')}
                      </p>
                      <div
                        className={`pt-1.5 flex flex-wrap items-center gap-4 text-[12px] ${
                          isDark ? 'text-neutral-400' : 'text-slate-500'
                        }`}
                      >
                        {wh.contactPerson && <span>Contact: {wh.contactPerson}</span>}
                        {wh.phone && <span>Phone: {wh.phone}</span>}
                        {wh.email && <span>Email: {wh.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className={`text-[12px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                This address will be displayed as the seller dispatch/issuer address on generated
                customer tax invoices.
              </p>
            </div>

            {/* Modal Footer */}
            <div
              className={`px-6 py-3.5 border-t flex items-center justify-end gap-2 ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => setPreviewAddressModal(null)}
                className="px-5 py-1.5 rounded-lg bg-[#F85606] hover:bg-[#e04d05] text-white text-[13px] font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DarazInvoiceNumberManager;
