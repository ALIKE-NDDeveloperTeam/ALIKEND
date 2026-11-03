import React, { useState, useMemo, useEffect } from 'react';
import {
  Info,
  Search,
  RotateCcw,
  ChevronRight,
  Inbox,
  Plus,
  Truck,
  Building2,
  Trash2,
} from 'lucide-react';
import { SellerProfile, SellerWarehouseNode } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export interface ShopLevelDeliveryServiceItem {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface WarehouseDeliveryServiceRow {
  id: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseAddress?: string;
  serviceId: string;
  serviceName: string;
  enabled: boolean;
}

export interface DarazDeliveryServiceManagerProps {
  theme?: 'light' | 'dark';
  draftData?: Record<string, any>;
  onUpdateField?: (key: string, value: any) => void;
  warehousesProp?: SellerWarehouseNode[];
  sellerProfile?: SellerProfile | null;
  onNavigateBreadcrumb?: (target: 'home' | 'setting') => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const AVAILABLE_DELIVERY_SERVICES = [
  {
    id: 'standardDelivery',
    name: 'Standard Delivery',
    description: 'Nationwide standard parcel fulfillment (3–5 business days)',
  },
  {
    id: 'expressDelivery',
    name: 'Express Delivery',
    description: 'Priority next-day air & metro express dispatch',
  },
  {
    id: 'sameDayDelivery',
    name: 'Same-Day Delivery',
    description: 'Same-day rapid doorstep delivery for local metro orders',
  },
  {
    id: 'cashOnDelivery',
    name: 'Cash on Delivery (COD)',
    description: 'Collect cash payment upon parcel handoff at buyer address',
  },
  {
    id: 'economyDelivery',
    name: 'Economy Surface Delivery',
    description: 'Cost-effective ground freight for heavy or bulk shipments',
  },
  {
    id: 'sellerOwnFleet',
    name: 'Seller Own Fleet (SOF)',
    description: 'Direct delivery managed by seller internal logistics team',
  },
];

function buildInitialShopServices(draftData?: Record<string, any>): ShopLevelDeliveryServiceItem[] {
  if (Array.isArray(draftData?.shopLevelServices)) {
    return draftData.shopLevelServices;
  }
  return [
    {
      id: 'standardDelivery',
      name: 'Standard Delivery',
      description: 'Nationwide standard parcel fulfillment (3–5 business days)',
      enabled: draftData?.standardDelivery !== undefined ? Boolean(draftData.standardDelivery) : true,
    },
    {
      id: 'expressDelivery',
      name: 'Express Delivery',
      description: 'Priority next-day air & metro express dispatch',
      enabled: draftData?.expressDelivery !== undefined ? Boolean(draftData.expressDelivery) : true,
    },
    {
      id: 'sameDayDelivery',
      name: 'Same-Day Delivery',
      description: 'Same-day rapid doorstep delivery for local metro orders',
      enabled: draftData?.sameDayDelivery !== undefined ? Boolean(draftData.sameDayDelivery) : true,
    },
    {
      id: 'cashOnDelivery',
      name: 'Cash on Delivery (COD)',
      description: 'Collect cash payment upon parcel handoff at buyer address',
      enabled: draftData?.cashOnDelivery !== undefined ? Boolean(draftData.cashOnDelivery) : true,
    },
  ];
}

function buildInitialWarehouseServices(
  draftData?: Record<string, any>,
  warehouses?: SellerWarehouseNode[]
): WarehouseDeliveryServiceRow[] {
  const savedRows: WarehouseDeliveryServiceRow[] = Array.isArray(draftData?.warehouseLevelServices)
    ? draftData.warehouseLevelServices
    : [];

  const cleanWhList = (Array.isArray(warehouses) ? warehouses : []).filter((w) => {
    if (!w) return false;
    const isLegacyConnaught =
      String(w.id) === 'WH-1001' && String(w.address || '').includes('42 Connaught Place');
    return !isLegacyConnaught;
  });

  if (savedRows.length > 0) {
    return savedRows;
  }

  if (cleanWhList.length === 0) {
    return [];
  }

  const generated: WarehouseDeliveryServiceRow[] = [];
  cleanWhList.forEach((wh, idx) => {
    const code = wh.warehouseCode || wh.id || `WH-BD-${String(idx + 1).padStart(4, '0')}`;
    const addr = [wh.address || wh.addressLine, wh.countryRegion || wh.city, wh.postalCode || wh.pincode]
      .filter(Boolean)
      .join(', ');

    generated.push(
      {
        id: `${code}_standardDelivery`,
        warehouseId: wh.id,
        warehouseCode: code,
        warehouseName: wh.name || `Warehouse #${idx + 1}`,
        warehouseAddress: addr,
        serviceId: 'standardDelivery',
        serviceName: 'Standard Delivery',
        enabled: true,
      },
      {
        id: `${code}_expressDelivery`,
        warehouseId: wh.id,
        warehouseCode: code,
        warehouseName: wh.name || `Warehouse #${idx + 1}`,
        warehouseAddress: addr,
        serviceId: 'expressDelivery',
        serviceName: 'Express Delivery',
        enabled: true,
      }
    );
  });

  return generated;
}

export const DarazDeliveryServiceManager: React.FC<DarazDeliveryServiceManagerProps> = ({
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

  const [shopServices, setShopServices] = useState<ShopLevelDeliveryServiceItem[]>(() =>
    buildInitialShopServices(draftData)
  );

  const [warehouseServices, setWarehouseServices] = useState<WarehouseDeliveryServiceRow[]>(() =>
    buildInitialWarehouseServices(draftData, effectiveWarehouses)
  );

  // Filter / Search state for Warehouse-Level Settings
  const [warehouseCodeInput, setWarehouseCodeInput] = useState<string>('');
  const [appliedWarehouseCodeQuery, setAppliedWarehouseCodeQuery] = useState<string>('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('');

  // Quick Add Warehouse Service Row state
  const [addingWhRowOpen, setAddingWhRowOpen] = useState<boolean>(false);
  const [newWhCode, setNewWhCode] = useState<string>('');
  const [newWhName, setNewWhName] = useState<string>('');
  const [newWhAddress, setNewWhAddress] = useState<string>('');
  const [newWhServiceId, setNewWhServiceId] = useState<string>('standardDelivery');

  // Add Shop-Level Service selector
  const [selectedNewShopServiceId, setSelectedNewShopServiceId] = useState<string>('');

  useEffect(() => {
    if (Array.isArray(draftData?.shopLevelServices)) {
      setShopServices(draftData.shopLevelServices);
    }
  }, [draftData?.shopLevelServices]);

  useEffect(() => {
    if (Array.isArray(draftData?.warehouseLevelServices)) {
      setWarehouseServices(draftData.warehouseLevelServices);
    } else if (effectiveWarehouses.length > 0 && warehouseServices.length === 0) {
      setWarehouseServices(buildInitialWarehouseServices(draftData, effectiveWarehouses));
    }
  }, [draftData?.warehouseLevelServices, effectiveWarehouses]);

  // Hydrate from backend API when rendered standalone
  useEffect(() => {
    if (draftData && Object.keys(draftData).length > 0) return;
    if (!sellerApi.getToken()) return;

    let cancelled = false;
    sellerApi
      .getDeliveryServices()
      .then((res) => {
        if (cancelled || !res?.deliveryServices) return;
        const ds = res.deliveryServices;
        if (Array.isArray(ds.shopLevelServices) && ds.shopLevelServices.length > 0) {
          setShopServices(ds.shopLevelServices);
        }
        if (Array.isArray(ds.warehouseLevelServices) && ds.warehouseLevelServices.length > 0) {
          setWarehouseServices(ds.warehouseLevelServices);
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

  const syncShopServices = (next: ShopLevelDeliveryServiceItem[]) => {
    setShopServices(next);
    if (onUpdateField) {
      onUpdateField('shopLevelServices', next);
      // Also keep top-level boolean flags in sync for backwards compatibility
      for (const item of next) {
        if (
          item.id === 'standardDelivery' ||
          item.id === 'expressDelivery' ||
          item.id === 'sameDayDelivery' ||
          item.id === 'cashOnDelivery'
        ) {
          onUpdateField(item.id, item.enabled);
        }
      }
    }
    if (sellerApi.getToken()) {
      sellerApi
        .updateDeliveryServices({
          shopLevelServices: next,
          warehouseLevelServices: warehouseServices,
        })
        .catch(() => {});
    }
  };

  const syncWarehouseServices = (next: WarehouseDeliveryServiceRow[]) => {
    setWarehouseServices(next);
    if (onUpdateField) {
      onUpdateField('warehouseLevelServices', next);
    }
    if (sellerApi.getToken()) {
      sellerApi
        .updateDeliveryServices({
          shopLevelServices: shopServices,
          warehouseLevelServices: next,
        })
        .catch(() => {});
    }
  };

  // Toggle Shop-Level Service
  const handleToggleShopService = (serviceId: string) => {
    const next = shopServices.map((s) =>
      s.id === serviceId ? { ...s, enabled: !s.enabled } : s
    );
    const target = next.find((s) => s.id === serviceId);
    syncShopServices(next);
    if (target) {
      notify(
        `Shop-level "${target.name}" ${target.enabled ? 'activated' : 'deactivated'}.`,
        'info'
      );
    }
  };

  const handleAddShopService = () => {
    if (!selectedNewShopServiceId) return;
    const found = AVAILABLE_DELIVERY_SERVICES.find((s) => s.id === selectedNewShopServiceId);
    if (!found) return;
    if (shopServices.some((s) => s.id === found.id)) {
      notify(`"${found.name}" is already in Shop-Level Settings.`, 'info');
      return;
    }
    const next = [
      ...shopServices,
      {
        id: found.id,
        name: found.name,
        description: found.description,
        enabled: true,
      },
    ];
    syncShopServices(next);
    setSelectedNewShopServiceId('');
    notify(`Added "${found.name}" to Shop-Level Settings.`, 'success');
  };

  const handleRemoveShopService = (serviceId: string) => {
    const next = shopServices.filter((s) => s.id !== serviceId);
    syncShopServices(next);
  };

  // Toggle Warehouse-Level Service status
  const handleToggleWarehouseService = (rowId: string) => {
    const next = warehouseServices.map((row) =>
      row.id === rowId ? { ...row, enabled: !row.enabled } : row
    );
    const target = next.find((r) => r.id === rowId);
    syncWarehouseServices(next);
    if (target) {
      notify(
        `${target.warehouseCode} — "${target.serviceName}" ${
          target.enabled ? 'activated' : 'deactivated'
        }.`,
        'info'
      );
    }
  };

  // Search button click handler for Warehouse Code
  const handleSearchWarehouse = () => {
    setAppliedWarehouseCodeQuery(warehouseCodeInput.trim());
  };

  // Reset button click handler
  const handleResetFilters = () => {
    setWarehouseCodeInput('');
    setAppliedWarehouseCodeQuery('');
    setSelectedServiceFilter('');
  };

  // Add custom Warehouse-Level Delivery Service rule
  const handleAddWarehouseServiceRow = () => {
    const cleanCode = newWhCode.trim() || `WH-BD-${String(warehouseServices.length + 1).padStart(4, '0')}`;
    const cleanName = newWhName.trim();
    if (!cleanName) {
      notify('Please enter a Warehouse Name.', 'error');
      return;
    }
    const serviceObj =
      AVAILABLE_DELIVERY_SERVICES.find((s) => s.id === newWhServiceId) ||
      AVAILABLE_DELIVERY_SERVICES[0];

    const newRow: WarehouseDeliveryServiceRow = {
      id: `${cleanCode}_${serviceObj.id}_${Date.now()}`,
      warehouseId: cleanCode,
      warehouseCode: cleanCode,
      warehouseName: cleanName,
      warehouseAddress: newWhAddress.trim(),
      serviceId: serviceObj.id,
      serviceName: serviceObj.name,
      enabled: true,
    };

    const next = [...warehouseServices, newRow];
    syncWarehouseServices(next);
    setNewWhCode('');
    setNewWhName('');
    setNewWhAddress('');
    setAddingWhRowOpen(false);
    notify(`Added "${serviceObj.name}" for warehouse ${cleanCode}.`, 'success');
  };

  const handleDeleteWarehouseRow = (rowId: string) => {
    const next = warehouseServices.filter((r) => r.id !== rowId);
    syncWarehouseServices(next);
  };

  // Filtered Warehouse-Level rows based on Warehouse Code search & Select Service dropdown
  const filteredWarehouseRows = useMemo(() => {
    return warehouseServices.filter((row) => {
      const codeQuery = appliedWarehouseCodeQuery.toLowerCase();
      const matchesCode =
        !codeQuery ||
        row.warehouseCode.toLowerCase().includes(codeQuery) ||
        row.warehouseName.toLowerCase().includes(codeQuery) ||
        String(row.warehouseAddress || '').toLowerCase().includes(codeQuery);

      const matchesService =
        !selectedServiceFilter ||
        row.serviceId === selectedServiceFilter ||
        row.serviceName.toLowerCase() === selectedServiceFilter.toLowerCase();

      return matchesCode && matchesService;
    });
  }, [warehouseServices, appliedWarehouseCodeQuery, selectedServiceFilter]);

  const unaddedShopServices = useMemo(
    () => AVAILABLE_DELIVERY_SERVICES.filter((a) => !shopServices.some((s) => s.id === a.id)),
    [shopServices]
  );

  // Reusable Empty State ("No data") view matching Daraz Seller Center
  const renderEmptyState = (caption = 'No data') => (
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center select-none">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center mb-2.5 ${
          isDark ? 'bg-neutral-800/70 text-neutral-500' : 'bg-slate-100 text-slate-300'
        }`}
      >
        <Inbox size={28} strokeWidth={1.5} />
      </div>
      <p className={`text-[13px] font-medium ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
        {caption}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Instruction Banner */}
      <div className="space-y-3">
        {/* Breadcrumb Path: Homepage > Setting > Delivery Service */}
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
            Delivery Service
          </span>
        </nav>

        {/* Page Title: Delivery Service */}
        <h2
          className={`text-[22px] font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Delivery Service
        </h2>

        {/* Instruction Banner */}
        <div
          className={`flex items-start sm:items-center gap-3 px-4 py-3 rounded-lg border text-[13px] ${
            isDark
              ? 'bg-sky-950/40 border-sky-800/70 text-sky-200'
              : 'bg-[#EBF5FF] border-[#BAE0FF] text-slate-700'
          }`}
        >
          <Info
            size={17}
            className={`shrink-0 mt-0.5 sm:mt-0 ${
              isDark ? 'text-sky-400' : 'text-[#1677FF]'
            }`}
          />
          <span>
            In this section, you can see the services activated for each of your warehouses. You can decide to activate or deactivate services by toggling the switch per row.
          </span>
        </div>
      </div>

      {/* 2. Shop-Level Settings Section */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3
              className={`text-[15px] font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Shop-Level Settings
            </h3>
            <span
              className={`text-[12px] ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              Once active the service
            </span>
          </div>

          {/* Optional Add Service control so seller can add/restore shop services */}
          {unaddedShopServices.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedNewShopServiceId}
                onChange={(e) => setSelectedNewShopServiceId(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-[12px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
                    : 'bg-white border-slate-300 text-slate-700'
                }`}
              >
                <option value="">+ Add Delivery Service...</option>
                {unaddedShopServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {selectedNewShopServiceId && (
                <button
                  type="button"
                  onClick={handleAddShopService}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer ${
                    isDark
                      ? 'bg-[#F5A623] text-black hover:bg-[#e09612]'
                      : 'bg-[#F85606] text-white hover:bg-[#d94800]'
                  }`}
                >
                  Add
                </button>
              )}
            </div>
          )}
        </div>

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
                <th className="py-3 px-5">Delivery Service Name</th>
                <th className="py-3 px-5 text-right w-48">Status</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark
                  ? 'divide-neutral-800 text-neutral-200'
                  : 'divide-slate-200 text-slate-800'
              }`}
            >
              {shopServices.length > 0 ? (
                shopServices.map((service) => {
                  const isOn = Boolean(service.enabled);
                  return (
                    <tr
                      key={service.id}
                      className={
                        isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                      }
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <Truck
                            size={15}
                            className={
                              isOn
                                ? isDark
                                  ? 'text-[#F5A623]'
                                  : 'text-[#F85606]'
                                : isDark
                                ? 'text-neutral-500'
                                : 'text-slate-400'
                            }
                          />
                          <div>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div
                                className={`text-[11px] mt-0.5 ${
                                  isDark ? 'text-neutral-400' : 'text-slate-500'
                                }`}
                              >
                                {service.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-3">
                          <span
                            className={`text-[11px] font-semibold ${
                              isOn
                                ? isDark
                                  ? 'text-[#F5A623]'
                                  : 'text-[#F85606]'
                                : isDark
                                ? 'text-neutral-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {isOn ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isOn}
                            onClick={() => handleToggleShopService(service.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isOn
                                ? isDark
                                  ? 'bg-[#F5A623]'
                                  : 'bg-[#F85606]'
                                : isDark
                                ? 'bg-neutral-700'
                                : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                isOn ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveShopService(service.id)}
                            title="Remove from Shop-Level list"
                            className={`p-1 rounded opacity-50 hover:opacity-100 cursor-pointer ${
                              isDark ? 'text-neutral-400 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                            }`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={2}>{renderEmptyState('No data')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Warehouse-Level Settings Section */}
      <div
        className={`rounded-xl border overflow-hidden p-5 space-y-4 ${
          isDark
            ? 'bg-neutral-900/90 border-neutral-800'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3
              className={`text-[15px] font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Warehouse-Level Settings
            </h3>
            <span
              className={`text-[12px] ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              Edit this table to set the delivery service
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              const firstWh = effectiveWarehouses[0];
              setNewWhCode(
                firstWh?.warehouseCode ||
                  firstWh?.id ||
                  `WH-BD-${String(warehouseServices.length + 1).padStart(4, '0')}`
              );
              setNewWhName(firstWh?.name || '');
              setNewWhAddress(firstWh?.address || firstWh?.addressLine || '');
              setAddingWhRowOpen((v) => !v);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-colors cursor-pointer self-start sm:self-auto ${
              isDark
                ? 'border-neutral-700 bg-neutral-950 hover:bg-neutral-800 text-neutral-200'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Plus size={14} />
            <span>Add Warehouse Service</span>
          </button>
        </div>

        {/* Notification Banner: "This deactivation will not effect your shop-level settings" */}
        <div
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-[13px] ${
            isDark
              ? 'bg-sky-950/35 border-sky-800/60 text-sky-200'
              : 'bg-[#EBF5FF] border-[#BAE0FF] text-slate-700'
          }`}
        >
          <Info
            size={16}
            className={`shrink-0 ${isDark ? 'text-sky-400' : 'text-[#1677FF]'}`}
          />
          <span>This deactivation will not effect your shop-level settings</span>
        </div>

        {/* Optional Inline Add Warehouse Delivery Service Panel */}
        {addingWhRowOpen && (
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDark
                ? 'bg-neutral-950/80 border-neutral-800'
                : 'bg-slate-50/80 border-slate-200'
            }`}
          >
            <div className="text-[13px] font-semibold flex items-center gap-2">
              <Building2 size={15} className={isDark ? 'text-[#F5A623]' : 'text-[#F85606]'} />
              <span>Assign Delivery Service to Warehouse</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                value={newWhCode}
                onChange={(e) => setNewWhCode(e.target.value)}
                placeholder="Warehouse Code (e.g. WH-BD-0001)"
                className={`px-3 py-2 rounded-lg border text-[13px] font-mono focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <input
                type="text"
                value={newWhName}
                onChange={(e) => setNewWhName(e.target.value)}
                placeholder="Warehouse Name *"
                className={`px-3 py-2 rounded-lg border text-[13px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <input
                type="text"
                value={newWhAddress}
                onChange={(e) => setNewWhAddress(e.target.value)}
                placeholder="Warehouse Address (optional)"
                className={`px-3 py-2 rounded-lg border text-[13px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
              <select
                value={newWhServiceId}
                onChange={(e) => setNewWhServiceId(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-[13px] focus:outline-none ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                {AVAILABLE_DELIVERY_SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddingWhRowOpen(false)}
                className={`px-3.5 py-1.5 rounded-lg border text-[12px] font-semibold cursor-pointer ${
                  isDark
                    ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                    : 'border-slate-300 text-slate-600 hover:bg-white'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddWarehouseServiceRow}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer ${
                  isDark
                    ? 'bg-[#F5A623] text-black hover:bg-[#e09612]'
                    : 'bg-[#F85606] text-white hover:bg-[#d94800]'
                }`}
              >
                Save Rule
              </button>
            </div>
          </div>
        )}

        {/* Filter / Search Controls: Warehouse Code search input with search button, Select Service dropdown, Reset button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Warehouse Code Search Input + Search Button */}
          <div className="flex items-center">
            <input
              type="text"
              value={warehouseCodeInput}
              onChange={(e) => {
                setWarehouseCodeInput(e.target.value);
                if (!e.target.value.trim()) {
                  setAppliedWarehouseCodeQuery('');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearchWarehouse();
                }
              }}
              placeholder="Warehouse Code"
              className={`w-52 sm:w-60 px-3.5 py-2 rounded-l-lg border border-r-0 text-[13px] focus:outline-none ${
                isDark
                  ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
              }`}
            />
            <button
              type="button"
              onClick={handleSearchWarehouse}
              title="Search Warehouse Code"
              className={`px-3.5 py-2 rounded-r-lg border text-[13px] inline-flex items-center justify-center gap-1.5 font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search size={15} />
            </button>
          </div>

          {/* Select Service Dropdown Filter */}
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className={`min-w-[190px] px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-neutral-950 border-neutral-700 text-neutral-200 focus:border-[#F5A623]'
                : 'bg-white border-slate-300 text-slate-700 focus:border-blue-600'
            }`}
          >
            <option value="">Select Service</option>
            {AVAILABLE_DELIVERY_SERVICES.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

          {/* Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[13px] font-medium transition-colors cursor-pointer ${
              isDark
                ? 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300'
                : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
            }`}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Data Table: Columns "Warehouse Info", "Delivery Service", and "Status" */}
        <div
          className={`rounded-xl border overflow-hidden ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
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
                  <th className="py-3 px-5">Warehouse Info</th>
                  <th className="py-3 px-5">Delivery Service</th>
                  <th className="py-3 px-5 text-right w-48">Status</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark
                    ? 'divide-neutral-800 text-neutral-200'
                    : 'divide-slate-200 text-slate-800'
                }`}
              >
                {filteredWarehouseRows.length > 0 ? (
                  filteredWarehouseRows.map((row) => {
                    const isOn = Boolean(row.enabled);
                    return (
                      <tr
                        key={row.id}
                        className={
                          isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'
                        }
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-semibold">
                            {row.warehouseName}{' '}
                            <span
                              className={`font-mono text-[11px] px-1.5 py-0.5 rounded ml-1 ${
                                isDark
                                  ? 'bg-neutral-800 text-neutral-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {row.warehouseCode}
                            </span>
                          </div>
                          {row.warehouseAddress && (
                            <div
                              className={`text-[11px] mt-0.5 ${
                                isDark ? 'text-neutral-400' : 'text-slate-500'
                              }`}
                            >
                              {row.warehouseAddress}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-medium">{row.serviceName}</td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center justify-end gap-3">
                            <span
                              className={`text-[11px] font-semibold ${
                                isOn
                                  ? isDark
                                    ? 'text-[#F5A623]'
                                    : 'text-[#F85606]'
                                  : isDark
                                  ? 'text-neutral-500'
                                  : 'text-slate-400'
                              }`}
                            >
                              {isOn ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={isOn}
                              onClick={() => handleToggleWarehouseService(row.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isOn
                                  ? isDark
                                    ? 'bg-[#F5A623]'
                                    : 'bg-[#F85606]'
                                  : isDark
                                  ? 'bg-neutral-700'
                                  : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  isOn ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWarehouseRow(row.id)}
                              title="Remove Warehouse Rule"
                              className={`p-1 rounded opacity-50 hover:opacity-100 cursor-pointer ${
                                isDark
                                  ? 'text-neutral-400 hover:text-rose-400'
                                  : 'text-slate-400 hover:text-rose-600'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>{renderEmptyState('No data')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarazDeliveryServiceManager;
