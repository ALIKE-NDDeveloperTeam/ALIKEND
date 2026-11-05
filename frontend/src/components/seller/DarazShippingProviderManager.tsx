import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  HelpCircle,
  History,
  Inbox,
  Plus,
  Edit2,
  Sliders,
  Trash2,
  X,
  Check,
  Truck,
  Clock,
} from 'lucide-react';
import { SellerProfile, SellerWarehouseNode } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export interface ShippingProviderMappingRow {
  id: string;
  warehouseId: string;
  warehouseName: string;
  logisticsService: string;
  packageProfile: string;
  firstMileType: string;
  shippingProvider: string;
  additional3plProviders: string[];
  updatedAt?: string;
}

export interface ShippingProviderHistoryEntry {
  id: string;
  timestamp: string;
  warehouseId: string;
  warehouseName: string;
  action: string;
  details: string;
  operator: string;
}

export interface DarazShippingProviderManagerProps {
  theme?: 'light' | 'dark';
  draftData?: Record<string, any>;
  onUpdateField?: (key: string, value: any) => void;
  warehousesProp?: SellerWarehouseNode[];
  sellerProfile?: SellerProfile | null;
  onNavigateBreadcrumb?: (target: 'home' | 'setting') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const SHIPPING_PARTNERS = [
  'Steadfast',
  'RedX',
  'Pathao',
  'Paperfly',
  'eCourier',
  'DEX (Express)',
  'Sundarban Courier',
];

const LOGISTICS_SERVICES = [
  'Standard',
  'Express',
  'Same-Day Delivery',
  'Economy Surface',
  'Bulky & Heavy',
];

const PACKAGE_PROFILES = [
  'Standard Parcel (0.1–5 kg)',
  'Small & Light Parcel (< 1 kg)',
  'Medium Box (5–15 kg)',
  'Bulky / Heavy Cargo (> 15 kg)',
  'Fragile / High-Value Merchandise',
];

const FIRST_MILE_TYPES = ['Pick-up', 'Drop-off', 'Pick-up & Drop-off'];

function buildInitialProviderRows(
  draftData?: Record<string, any>,
  warehouses?: SellerWarehouseNode[]
): ShippingProviderMappingRow[] {
  if (Array.isArray(draftData?.providerMappings)) {
    return draftData.providerMappings;
  }

  const cleanWhList = (Array.isArray(warehouses) ? warehouses : []).filter((w) => {
    if (!w) return false;
    const isLegacyConnaught =
      String(w.id) === 'WH-1001' && String(w.address || '').includes('42 Connaught Place');
    return !isLegacyConnaught;
  });

  if (cleanWhList.length > 0) {
    return cleanWhList.map((wh, idx) => {
      const code = wh.warehouseCode || wh.id || `WH-BD-${String(idx + 1).padStart(4, '0')}`;
      const primaryPartner = SHIPPING_PARTNERS[idx % 5];
      const backupPartners = SHIPPING_PARTNERS.filter((p) => p !== primaryPartner).slice(0, 3);
      return {
        id: `spm_${code}_${idx}`,
        warehouseId: code,
        warehouseName: wh.name || `Warehouse #${idx + 1}`,
        logisticsService: 'Standard',
        packageProfile: 'Standard Parcel (0.1–5 kg)',
        firstMileType: 'Pick-up',
        shippingProvider: primaryPartner,
        additional3plProviders: backupPartners,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  return [];
}

function buildInitialHistory(draftData?: Record<string, any>): ShippingProviderHistoryEntry[] {
  if (Array.isArray(draftData?.providerHistory)) {
    return draftData.providerHistory;
  }
  return [];
}

const HeaderTooltip: React.FC<{ label: string; tip: string; isDark: boolean }> = ({
  label,
  tip,
  isDark,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Info about ${label}`}
        className={`inline-flex items-center justify-center rounded-full cursor-pointer focus:outline-none ${
          isDark
            ? 'text-neutral-400 hover:text-neutral-200'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <HelpCircle size={13.5} />
      </button>
      {open && (
        <div
          className={`absolute left-0 top-full mt-1.5 w-60 p-2.5 rounded-lg border shadow-lg text-[11px] font-normal leading-relaxed z-30 pointer-events-none ${
            isDark
              ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          {tip}
        </div>
      )}
    </div>
  );
};

export const DarazShippingProviderManager: React.FC<DarazShippingProviderManagerProps> = ({
  theme = 'light',
  draftData,
  onUpdateField,
  warehousesProp,
  sellerProfile,
  onNavigateBreadcrumb,
  showToast,
}) => {
  const isDark = theme === 'dark';

  const effectiveWarehouses = useMemo(
    () => warehousesProp ?? sellerProfile?.warehouses ?? [],
    [warehousesProp, sellerProfile?.warehouses]
  );

  const [rows, setRows] = useState<ShippingProviderMappingRow[]>(() =>
    buildInitialProviderRows(draftData, effectiveWarehouses)
  );
  const [historyList, setHistoryList] = useState<ShippingProviderHistoryEntry[]>(() =>
    buildInitialHistory(draftData)
  );

  // View History Modal state
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  // Add / Edit / Configure Row Modal state
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    warehouseId: string;
    warehouseName: string;
    logisticsService: string;
    packageProfile: string;
    firstMileType: string;
    shippingProvider: string;
    additional3plProviders: string[];
  }>({
    warehouseId: '',
    warehouseName: '',
    logisticsService: 'Standard',
    packageProfile: 'Standard Parcel (0.1–5 kg)',
    firstMileType: 'Pick-up',
    shippingProvider: 'Steadfast',
    additional3plProviders: ['RedX', 'Pathao', 'Paperfly'],
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (Array.isArray(draftData?.providerMappings)) {
      setRows(draftData.providerMappings);
    } else if (effectiveWarehouses.length > 0 && rows.length === 0) {
      setRows(buildInitialProviderRows(draftData, effectiveWarehouses));
    }
  }, [draftData?.providerMappings, effectiveWarehouses]);

  useEffect(() => {
    if (Array.isArray(draftData?.providerHistory)) {
      setHistoryList(draftData.providerHistory);
    }
  }, [draftData?.providerHistory]);

  // Hydrate from backend API when rendered standalone
  useEffect(() => {
    if (draftData && Object.keys(draftData).length > 0) return;
    if (!sellerApi.getToken()) return;

    let cancelled = false;
    sellerApi
      .getShippingProviders()
      .then((res) => {
        if (cancelled || !res?.shippingProviders) return;
        const sp = res.shippingProviders;
        if (Array.isArray(sp.providerMappings)) {
          setRows(sp.providerMappings);
        }
        if (Array.isArray(sp.providerHistory)) {
          setHistoryList(sp.providerHistory);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  const syncRowsAndHistory = (
    nextRows: ShippingProviderMappingRow[],
    newHistoryItem?: ShippingProviderHistoryEntry
  ) => {
    setRows(nextRows);
    const nextHistory = newHistoryItem ? [newHistoryItem, ...historyList] : historyList;
    if (newHistoryItem) {
      setHistoryList(nextHistory);
    }
    if (onUpdateField) {
      onUpdateField('providerMappings', nextRows);
      if (newHistoryItem) {
        onUpdateField('providerHistory', nextHistory);
      }
    }
    if (sellerApi.getToken()) {
      sellerApi
        .updateShippingProviders({
          providerMappings: nextRows,
          providerHistory: nextHistory,
        })
        .catch(() => {});
    }
  };

  // Open Configure / Edit Modal
  const handleOpenConfigureModal = (row: ShippingProviderMappingRow | null) => {
    setFormError(null);
    if (row) {
      setEditingRowId(row.id);
      setFormState({
        warehouseId: row.warehouseId,
        warehouseName: row.warehouseName,
        logisticsService: row.logisticsService || 'Standard',
        packageProfile: row.packageProfile || 'Standard Parcel (0.1–5 kg)',
        firstMileType: row.firstMileType || 'Pick-up',
        shippingProvider: row.shippingProvider || 'Steadfast',
        additional3plProviders: Array.isArray(row.additional3plProviders)
          ? row.additional3plProviders
          : [],
      });
    } else {
      const firstWh = effectiveWarehouses[0];
      const nextCode =
        firstWh?.warehouseCode ||
        firstWh?.id ||
        `WH-BD-${String(rows.length + 1).padStart(4, '0')}`;
      setEditingRowId(null);
      setFormState({
        warehouseId: nextCode,
        warehouseName: firstWh?.name || '',
        logisticsService: 'Standard',
        packageProfile: 'Standard Parcel (0.1–5 kg)',
        firstMileType: 'Pick-up',
        shippingProvider: 'Steadfast',
        additional3plProviders: ['RedX', 'Pathao', 'Paperfly', 'eCourier'],
      });
    }
    setConfigModalOpen(true);
  };

  const handleToggleAdditional3pl = (partnerName: string) => {
    setFormState((prev) => {
      const exists = prev.additional3plProviders.includes(partnerName);
      return {
        ...prev,
        additional3plProviders: exists
          ? prev.additional3plProviders.filter((p) => p !== partnerName)
          : [...prev.additional3plProviders, partnerName],
      };
    });
  };

  const handleSaveRowConfiguration = () => {
    setFormError(null);
    const cleanWhId = formState.warehouseId.trim();
    const cleanWhName = formState.warehouseName.trim();

    if (!cleanWhId) {
      setFormError('Warehouse ID is required.');
      return;
    }
    if (!cleanWhName) {
      setFormError('Warehouse Name is required.');
      return;
    }

    const operatorName =
      sellerProfile?.ownerName || sellerProfile?.shopName || 'Seller Account';

    if (editingRowId) {
      const prevRow = rows.find((r) => r.id === editingRowId);
      const updatedRow: ShippingProviderMappingRow = {
        id: editingRowId,
        warehouseId: cleanWhId,
        warehouseName: cleanWhName,
        logisticsService: formState.logisticsService,
        packageProfile: formState.packageProfile,
        firstMileType: formState.firstMileType,
        shippingProvider: formState.shippingProvider,
        additional3plProviders: formState.additional3plProviders.filter(
          (p) => p !== formState.shippingProvider
        ),
        updatedAt: new Date().toISOString(),
      };

      const nextRows = rows.map((r) => (r.id === editingRowId ? updatedRow : r));
      const historyEntry: ShippingProviderHistoryEntry = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        warehouseId: cleanWhId,
        warehouseName: cleanWhName,
        action: 'Updated Shipping Provider Mapping',
        details: `Primary: ${prevRow?.shippingProvider || '—'} → ${
          updatedRow.shippingProvider
        } | First Mile: ${updatedRow.firstMileType} | 3PLs: ${
          updatedRow.additional3plProviders.join(', ') || 'None'
        }`,
        operator: operatorName,
      };

      syncRowsAndHistory(nextRows, historyEntry);
      notify(`Updated shipping provider for "${cleanWhName}".`, 'success');
    } else {
      const newRow: ShippingProviderMappingRow = {
        id: `spm_${Date.now()}`,
        warehouseId: cleanWhId,
        warehouseName: cleanWhName,
        logisticsService: formState.logisticsService,
        packageProfile: formState.packageProfile,
        firstMileType: formState.firstMileType,
        shippingProvider: formState.shippingProvider,
        additional3plProviders: formState.additional3plProviders.filter(
          (p) => p !== formState.shippingProvider
        ),
        updatedAt: new Date().toISOString(),
      };

      const nextRows = [...rows, newRow];
      const historyEntry: ShippingProviderHistoryEntry = {
        id: `hist_${Date.now()}`,
        timestamp: new Date().toISOString(),
        warehouseId: cleanWhId,
        warehouseName: cleanWhName,
        action: 'Mapped Shipping Provider',
        details: `Primary: ${newRow.shippingProvider} | Service: ${
          newRow.logisticsService
        } | First Mile: ${newRow.firstMileType} | Additional 3PLs: ${
          newRow.additional3plProviders.join(', ') || 'None'
        }`,
        operator: operatorName,
      };

      syncRowsAndHistory(nextRows, historyEntry);
      notify(`Mapped shipping provider "${newRow.shippingProvider}" to "${cleanWhName}".`, 'success');
    }

    setConfigModalOpen(false);
  };

  const handleDeleteRow = (row: ShippingProviderMappingRow) => {
    const nextRows = rows.filter((r) => r.id !== row.id);
    const historyEntry: ShippingProviderHistoryEntry = {
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      warehouseId: row.warehouseId,
      warehouseName: row.warehouseName,
      action: 'Removed Shipping Provider Mapping',
      details: `Removed mapping for ${row.shippingProvider} (${row.logisticsService})`,
      operator: sellerProfile?.ownerName || sellerProfile?.shopName || 'Seller Account',
    };
    syncRowsAndHistory(nextRows, historyEntry);
    notify(`Removed shipping provider mapping for "${row.warehouseName}".`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Actions */}
      <div className="space-y-3">
        {/* Breadcrumb Path: Homepage > Setting > Shipping Provider */}
        <nav
          aria-label="Breadcrumb"
          className={`flex items-center gap-1.5 text-[12px] ${
            isDark ? 'text-neutral-400' : 'text-slate-500'
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigateBreadcrumb?.('home')}
            className={`hover:underline cursor-pointer ${
              isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
            }`}
          >
            Homepage
          </button>
          <ChevronRight size={13} className="opacity-60" />
          <button
            type="button"
            onClick={() => onNavigateBreadcrumb?.('setting')}
            className={`hover:underline cursor-pointer ${
              isDark ? 'hover:text-neutral-200' : 'hover:text-slate-800'
            }`}
          >
            Setting
          </button>
          <ChevronRight size={13} className="opacity-60" />
          <span
            className={`font-medium ${
              isDark ? 'text-neutral-200' : 'text-slate-800'
            }`}
          >
            Shipping Provider
          </span>
        </nav>

        {/* Page Title & Prominent "View History" Button at Top Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2
            className={`text-[22px] font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Shipping Provider
          </h2>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleOpenConfigureModal(null)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200'
                  : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Plus size={14} />
              <span>Map Shipping Provider</span>
            </button>

            <button
              type="button"
              onClick={() => setHistoryModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#F5A623] hover:bg-[#e09612] text-black'
                  : 'bg-[#F85606] hover:bg-[#d94800] text-white shadow-2xs'
              }`}
            >
              <History size={15} />
              <span>View History</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Shipping Provider Table Structure */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr
                className={`border-b font-semibold ${
                  isDark
                    ? 'bg-neutral-950/70 border-neutral-800 text-neutral-400'
                    : 'bg-[#FAFAFA] border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-3.5 px-4 whitespace-nowrap">
                  <HeaderTooltip
                    label="Warehouse ID"
                    tip="Unique system identifier code assigned to your pickup or fulfillment warehouse."
                    isDark={isDark}
                  />
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">Warehouse Name</th>
                <th className="py-3.5 px-4 whitespace-nowrap">
                  <HeaderTooltip
                    label="Logistics Service"
                    tip="Delivery speed and fulfillment tier mapped to this warehouse."
                    isDark={isDark}
                  />
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">Package Profile</th>
                <th className="py-3.5 px-4 whitespace-nowrap">First Mile Type</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Shipping Provider</th>
                <th className="py-3.5 px-4 whitespace-nowrap">
                  <HeaderTooltip
                    label="List of Additional 3PL Providers"
                    tip="Backup third-party logistics (3PL) couriers eligible for automatic parcel allocation."
                    isDark={isDark}
                  />
                </th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark
                  ? 'divide-neutral-800 text-neutral-200'
                  : 'divide-slate-200 text-slate-800'
              }`}
            >
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                    }
                  >
                    <td className="py-3.5 px-4 font-mono text-[12px] whitespace-nowrap">
                      {row.warehouseId}
                    </td>
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                      {row.warehouseName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.logisticsService}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.packageProfile}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {row.firstMileType}
                    </td>
                    <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Truck
                          size={14}
                          className={isDark ? 'text-[#F5A623]' : 'text-[#F85606]'}
                        />
                        <span>{row.shippingProvider}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {Array.isArray(row.additional3plProviders) &&
                      row.additional3plProviders.length > 0 ? (
                        <span
                          className={`text-[12px] ${
                            isDark ? 'text-neutral-300' : 'text-slate-600'
                          }`}
                        >
                          {row.additional3plProviders.join(' · ')}
                        </span>
                      ) : (
                        <span
                          className={`text-[12px] ${
                            isDark ? 'text-neutral-500' : 'text-slate-400'
                          }`}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenConfigureModal(row)}
                          className={`inline-flex items-center gap-1 font-semibold cursor-pointer hover:underline ${
                            isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                          }`}
                        >
                          <Edit2 size={13} />
                          <span>Edit / Configure</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row)}
                          title="Remove Mapping"
                          className={`p-1 rounded opacity-50 hover:opacity-100 cursor-pointer ${
                            isDark
                              ? 'text-neutral-400 hover:text-rose-400'
                              : 'text-slate-400 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 size={13.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    {/* Empty State ("No Data" view when no provider is mapped) */}
                    <div className="py-16 px-4 flex flex-col items-center justify-center text-center select-none">
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                          isDark
                            ? 'bg-neutral-800/70 text-neutral-500'
                            : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        <Inbox size={32} strokeWidth={1.5} />
                      </div>
                      <p
                        className={`text-[13px] font-medium ${
                          isDark ? 'text-neutral-400' : 'text-slate-400'
                        }`}
                      >
                        No Data
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenConfigureModal(null)}
                        className={`mt-3 text-[12px] font-semibold underline cursor-pointer ${
                          isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                        }`}
                      >
                        + Map a Shipping Provider to your Warehouse
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Edit / Configure Shipping Provider Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark
                  ? 'border-neutral-800 bg-neutral-950/60'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders
                  size={17}
                  className={isDark ? 'text-[#F5A623]' : 'text-[#F85606]'}
                />
                <h3 className="text-[16px] font-bold">
                  {editingRowId
                    ? 'Edit / Configure Shipping Provider'
                    : 'Map Shipping Provider to Warehouse'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConfigModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (div instead of form to avoid nested form issues) */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] font-medium">
                  {formError}
                </div>
              )}

              {/* Quick Warehouse Selector if seller has existing warehouses */}
              {effectiveWarehouses.length > 0 && !editingRowId && (
                <div>
                  <label
                    className={`block text-[12px] font-medium mb-1 ${
                      isDark ? 'text-neutral-400' : 'text-slate-600'
                    }`}
                  >
                    Select Existing Warehouse
                  </label>
                  <select
                    value={formState.warehouseId}
                    onChange={(e) => {
                      const code = e.target.value;
                      const matched = effectiveWarehouses.find(
                        (w) => (w.warehouseCode || w.id) === code
                      );
                      if (matched) {
                        setFormState((p) => ({
                          ...p,
                          warehouseId: matched.warehouseCode || matched.id,
                          warehouseName: matched.name,
                        }));
                      }
                    }}
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {effectiveWarehouses.map((w) => {
                      const code = w.warehouseCode || w.id;
                      return (
                        <option key={code} value={code}>
                          {w.name} ({code})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Warehouse ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState.warehouseId}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, warehouseId: e.target.value }))
                    }
                    placeholder="e.g. WH-BD-0001"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] font-mono focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Warehouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState.warehouseName}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, warehouseName: e.target.value }))
                    }
                    placeholder="Enter warehouse name"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Logistics Service
                  </label>
                  <select
                    value={formState.logisticsService}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, logisticsService: e.target.value }))
                    }
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {LOGISTICS_SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Package Profile
                  </label>
                  <select
                    value={formState.packageProfile}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, packageProfile: e.target.value }))
                    }
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {PACKAGE_PROFILES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    First Mile Type
                  </label>
                  <select
                    value={formState.firstMileType}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, firstMileType: e.target.value }))
                    }
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {FIRST_MILE_TYPES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Primary Shipping Provider
                  </label>
                  <select
                    value={formState.shippingProvider}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, shippingProvider: e.target.value }))
                    }
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {SHIPPING_PARTNERS.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  className={`block text-[13px] font-medium mb-2 ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  List of Additional 3PL Providers
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SHIPPING_PARTNERS.filter((p) => p !== formState.shippingProvider).map(
                    (partner) => {
                      const checked = formState.additional3plProviders.includes(partner);
                      return (
                        <button
                          key={partner}
                          type="button"
                          onClick={() => handleToggleAdditional3pl(partner)}
                          className={`px-3 py-2 rounded-lg border text-[12px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            checked
                              ? isDark
                                ? 'bg-[#F5A623]/15 border-[#F5A623] text-[#F5A623]'
                                : 'bg-blue-50 border-blue-500 text-blue-700'
                              : isDark
                              ? 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate">{partner}</span>
                          {checked && <Check size={13} className="shrink-0" />}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              <div
                className={`pt-4 border-t flex items-center justify-end gap-3 ${
                  isDark ? 'border-neutral-800' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className={`px-5 py-2 rounded-lg border text-[13px] font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveRowConfiguration}
                  className={`px-6 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#F5A623] hover:bg-[#e09612] text-black'
                      : 'bg-[#F85606] hover:bg-[#d94800] text-white shadow-xs'
                  }`}
                >
                  Save Mapping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. View History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark
                  ? 'border-neutral-800 bg-neutral-950/60'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History
                  size={18}
                  className={isDark ? 'text-[#F5A623]' : 'text-[#F85606]'}
                />
                <h3 className="text-[16px] font-bold">
                  Shipping Provider Change History
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {historyList.length > 0 ? (
                <div className="overflow-x-auto border rounded-xl border-slate-200 dark:border-neutral-800">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr
                        className={`border-b font-semibold ${
                          isDark
                            ? 'bg-neutral-950 border-neutral-800 text-neutral-400'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Warehouse</th>
                        <th className="py-3 px-4">Action</th>
                        <th className="py-3 px-4">Details</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${
                        isDark ? 'divide-neutral-800' : 'divide-slate-200'
                      }`}
                    >
                      {historyList.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] opacity-75">
                            <div className="inline-flex items-center gap-1">
                              <Clock size={12} />
                              <span>{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold">{item.warehouseName}</div>
                            <div className="font-mono text-[11px] opacity-70">
                              {item.warehouseId}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium">{item.action}</td>
                          <td className="py-3 px-4 opacity-85">{item.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Inbox
                    size={30}
                    className={`mx-auto mb-2 ${
                      isDark ? 'text-neutral-600' : 'text-slate-300'
                    }`}
                  />
                  <p
                    className={`text-[13px] ${
                      isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    No shipping provider history records found.
                  </p>
                </div>
              )}
            </div>

            <div
              className={`px-6 py-3.5 border-t flex justify-end ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className={`px-5 py-2 rounded-lg border text-[13px] font-semibold cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
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

export default DarazShippingProviderManager;
