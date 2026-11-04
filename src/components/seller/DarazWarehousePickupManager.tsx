import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Info,
  Plus,
  Search,
  MapPin,
  ChevronDown,
  X,
  Check,
  Navigation,
  Calendar,
  Building2,
  Trash2,
  LocateFixed,
} from 'lucide-react';
import { SellerProfile, SellerWarehouseNode } from '../../types';
import { sellerApi } from '../../services/sellerApi';

export interface DarazWarehousePickupManagerProps {
  theme?: 'light' | 'dark';
  warehousesProp?: SellerWarehouseNode[];
  onChangeWarehouses?: (next: SellerWarehouseNode[]) => void;
  sellerProfile?: SellerProfile | null;
  onProfileUpdate?: (updated: SellerProfile) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const COUNTRY_CODES = [
  { code: '+880', label: 'BD (+880)' },
  { code: '+91', label: 'IN (+91)' },
  { code: '+92', label: 'PK (+92)' },
  { code: '+977', label: 'NP (+977)' },
  { code: '+94', label: 'LK (+94)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+1', label: 'US (+1)' },
];

const REGIONAL_DISTRICTS: Array<{
  region: string;
  lat: number;
  lng: number;
}> = [
  { region: "Chattogram / Cox's Bazar / Ukhia / Ukhia Sadar", lat: 21.2448, lng: 92.1342 },
  { region: "Chattogram / Cox's Bazar / Cox's Bazar Sadar", lat: 21.4272, lng: 92.0058 },
  { region: "Chattogram / Cox's Bazar / Teknaf", lat: 20.8583, lng: 92.2977 },
  { region: "Chattogram / Cox's Bazar / Chakaria", lat: 21.7611, lng: 92.0778 },
  { region: 'Chattogram / Chattogram / Agrabad / Double Mooring', lat: 22.3264, lng: 91.8155 },
  { region: 'Chattogram / Chattogram / Nasirabad / Panchlaish', lat: 22.3636, lng: 91.8219 },
  { region: 'Chattogram / Chattogram / Halishahar', lat: 22.3372, lng: 91.7798 },
  { region: 'Chattogram / Cumilla / Cumilla Sadar', lat: 23.4607, lng: 91.1809 },
  { region: 'Chattogram / Noakhali / Maijdee Court', lat: 22.8724, lng: 91.0973 },
  { region: 'Chattogram / Feni / Feni Sadar', lat: 23.0159, lng: 91.3976 },
  { region: 'Dhaka / Dhaka North / Uttara', lat: 23.8759, lng: 90.3795 },
  { region: 'Dhaka / Dhaka North / Gulshan / Banani', lat: 23.7925, lng: 90.4078 },
  { region: 'Dhaka / Dhaka North / Mirpur', lat: 23.8223, lng: 90.3654 },
  { region: 'Dhaka / Dhaka North / Tejgaon Industrial Area', lat: 23.7639, lng: 90.3994 },
  { region: 'Dhaka / Dhaka South / Dhanmondi', lat: 23.7461, lng: 90.3742 },
  { region: 'Dhaka / Dhaka South / Motijheel', lat: 23.733, lng: 90.4172 },
  { region: 'Dhaka / Dhaka South / Jatrabari / Keraniganj', lat: 23.7104, lng: 90.4348 },
  { region: 'Dhaka / Gazipur / Tongi / Gazipur Sadar', lat: 23.9999, lng: 90.4203 },
  { region: 'Dhaka / Narayanganj / Narayanganj Sadar', lat: 23.6238, lng: 90.5 },
  { region: 'Dhaka / Savar / Ashulia', lat: 23.8583, lng: 90.2667 },
  { region: 'Sylhet / Sylhet / Zindabazar / Sylhet Sadar', lat: 24.8949, lng: 91.8687 },
  { region: 'Sylhet / Moulvibazar / Sreemangal', lat: 24.3065, lng: 91.7296 },
  { region: 'Rajshahi / Rajshahi / Boalia / Rajshahi Sadar', lat: 24.3745, lng: 88.6042 },
  { region: 'Rajshahi / Bogura / Bogura Sadar', lat: 24.8481, lng: 89.373 },
  { region: 'Khulna / Khulna / Sonadanga / Khulna Sadar', lat: 22.8456, lng: 89.5403 },
  { region: 'Khulna / Jashore / Jashore Sadar', lat: 23.1664, lng: 89.2081 },
  { region: 'Barishal / Barishal / Barishal Sadar', lat: 22.701, lng: 90.3535 },
  { region: 'Rangpur / Rangpur / Rangpur Sadar', lat: 25.7439, lng: 89.2752 },
  { region: 'Mymensingh / Mymensingh / Mymensingh Sadar', lat: 24.7471, lng: 90.4203 },
];

interface WarehouseFormState {
  id: string;
  warehouseCode: string;
  name: string;
  contactPerson: string;
  countryCode: string;
  phoneLocal: string;
  email: string;
  mapSearchQuery: string;
  lat: number;
  lng: number;
  mapPinLabel: string;
  countryRegion: string;
  address: string;
  postalCode: string;
  isReturnAddress: boolean;
  isPrimary: boolean;
}

const EMPTY_FORM_STATE: WarehouseFormState = {
  id: '',
  warehouseCode: '',
  name: '',
  contactPerson: '',
  countryCode: '+880',
  phoneLocal: '',
  email: '',
  mapSearchQuery: '',
  lat: 23.8103,
  lng: 90.4125,
  mapPinLabel: '',
  countryRegion: '',
  address: '',
  postalCode: '',
  isReturnAddress: true,
  isPrimary: false,
};

function sanitizeWarehouses(rawList: any[]): SellerWarehouseNode[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .filter((w) => {
      if (!w) return false;
      // Filter out any legacy hardcoded demo records
      const isLegacyConnaught =
        String(w.id) === 'WH-1001' && String(w.address || '').includes('42 Connaught Place');
      const isLegacyUkhiaDemo =
        String(w.id) === 'WH-BD-0001' &&
        String(w.address || '').includes('Ukhia Sadar Main Road, Near Station Market');
      return !isLegacyConnaught && !isLegacyUkhiaDemo;
    })
    .map((w, idx) => {
      const code = w.warehouseCode || w.id || `WH-BD-${String(idx + 1).padStart(4, '0')}`;
      const rawPhone = String(w.phone || w.contactPhone || '').trim();
      const rawPostal = String(w.postalCode || w.pincode || '').trim();
      const rawAddr = String(w.address || w.addressLine || '').trim();
      const rawRegion = String(w.countryRegion || w.city || '').trim();
      return {
        id: String(w.id || code),
        warehouseCode: String(code),
        name: String(w.name || '').trim(),
        contactPerson: String(w.contactPerson || '').trim(),
        countryCode: String(w.countryCode || '+880').trim(),
        phone: rawPhone,
        contactPhone: rawPhone,
        email: String(w.email || '').trim(),
        countryRegion: rawRegion,
        city: String(w.city || (rawRegion ? rawRegion.split('/')[1]?.trim() || rawRegion : '')).trim(),
        address: rawAddr,
        addressLine: rawAddr,
        pincode: rawPostal,
        postalCode: rawPostal,
        lat: typeof w.lat === 'number' ? w.lat : undefined,
        lng: typeof w.lng === 'number' ? w.lng : undefined,
        mapPinLabel: String(w.mapPinLabel || '').trim(),
        isPrimary: Boolean(w.isPrimary ?? w.isDefaultPickup ?? idx === 0),
        isDefaultPickup: Boolean(w.isDefaultPickup ?? w.isPrimary ?? idx === 0),
        isReturnAddress: w.isReturnAddress !== undefined ? Boolean(w.isReturnAddress) : idx === 0,
        holidayMode: Boolean(w.holidayMode),
        holidayStartDate: String(w.holidayStartDate || '').trim(),
        holidayEndDate: String(w.holidayEndDate || '').trim(),
        holidayDateStatus:
          String(w.holidayDateStatus || '').trim() ||
          (w.holidayMode && w.holidayStartDate && w.holidayEndDate
            ? `${w.holidayStartDate} ~ ${w.holidayEndDate}`
            : w.holidayMode
            ? 'Holiday Active'
            : 'Not Set'),
      };
    });
}

function splitPhoneCode(fullPhone: string): { countryCode: string; phoneLocal: string } {
  const trimmed = String(fullPhone || '').trim();
  if (!trimmed) return { countryCode: '+880', phoneLocal: '' };
  for (const item of COUNTRY_CODES) {
    if (trimmed.startsWith(item.code)) {
      return {
        countryCode: item.code,
        phoneLocal: trimmed.slice(item.code.length).trim(),
      };
    }
  }
  return { countryCode: '+880', phoneLocal: trimmed };
}

export const DarazWarehousePickupManager: React.FC<DarazWarehousePickupManagerProps> = ({
  theme = 'light',
  warehousesProp,
  onChangeWarehouses,
  sellerProfile,
  onProfileUpdate,
  showToast,
}) => {
  const isDark = theme === 'dark';

  const initialList = useMemo(
    () => sanitizeWarehouses(warehousesProp ?? sellerProfile?.warehouses ?? []),
    [warehousesProp, sellerProfile?.warehouses]
  );

  const [warehouses, setWarehouses] = useState<SellerWarehouseNode[]>(initialList);
  const [selectedWhFilter, setSelectedWhFilter] = useState<string>('ALL');
  const [whSearchTerm, setWhSearchTerm] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Add / Modify Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'modify_warehouse' | 'modify_return'>('add');
  const [editingWarehouseId, setEditingWarehouseId] = useState<string | null>(null);
  const [formState, setFormState] = useState<WarehouseFormState>(EMPTY_FORM_STATE);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Holiday Date Range inline editor for per WH
  const [editingHolidayWhId, setEditingHolidayWhId] = useState<string | null>(null);
  const [holidayDatesDraft, setHolidayDatesDraft] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    setWarehouses(sanitizeWarehouses(warehousesProp ?? sellerProfile?.warehouses ?? []));
  }, [warehousesProp, sellerProfile?.warehouses]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (showToast) showToast(msg, type);
  };

  const syncWarehousesState = (next: SellerWarehouseNode[]) => {
    setWarehouses(next);
    if (onChangeWarehouses) {
      onChangeWarehouses(next);
    }
  };

  // Return Address rows: warehouses marked isReturnAddress, or primary warehouse if exists
  const returnAddressRow = useMemo(() => {
    if (warehouses.length === 0) return null;
    return warehouses.find((w) => w.isReturnAddress) || warehouses[0];
  }, [warehouses]);

  // Searchable dropdown options for Warehouse Name filter
  const dropdownFilteredWarehouses = useMemo(() => {
    const q = whSearchTerm.trim().toLowerCase();
    if (!q) return warehouses;
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        String(w.warehouseCode || w.id).toLowerCase().includes(q) ||
        String(w.address || '').toLowerCase().includes(q)
    );
  }, [warehouses, whSearchTerm]);

  // Filtered rows in Warehouse Address table
  const visibleWarehouses = useMemo(() => {
    if (selectedWhFilter === 'ALL') return warehouses;
    return warehouses.filter(
      (w) => w.id === selectedWhFilter || w.warehouseCode === selectedWhFilter || w.name === selectedWhFilter
    );
  }, [warehouses, selectedWhFilter]);

  // Open Modal with completely blank fields for "+ Add New Warehouse"
  const handleOpenAddModal = (asReturnAddress = false) => {
    setModalMode(asReturnAddress ? 'modify_return' : 'add');
    setEditingWarehouseId(null);
    setFormError(null);
    setFormState({
      ...EMPTY_FORM_STATE,
      isReturnAddress: asReturnAddress || warehouses.length === 0,
      isPrimary: warehouses.length === 0,
    });
    setModalOpen(true);
  };

  // Open Modal for "Modify" on existing row (or blank if no return address exists yet)
  const handleOpenModifyModal = (
    wh: SellerWarehouseNode | null,
    mode: 'modify_warehouse' | 'modify_return'
  ) => {
    setFormError(null);
    if (!wh) {
      // No return address or warehouse saved yet -> open clean blank template
      handleOpenAddModal(mode === 'modify_return');
      return;
    }

    const { countryCode, phoneLocal } = splitPhoneCode(wh.phone || wh.contactPhone || '');
    setModalMode(mode);
    setEditingWarehouseId(wh.id);
    setFormState({
      id: wh.id,
      warehouseCode: wh.warehouseCode || wh.id,
      name: wh.name || '',
      contactPerson: wh.contactPerson || '',
      countryCode: wh.countryCode || countryCode,
      phoneLocal,
      email: wh.email || '',
      mapSearchQuery: wh.mapPinLabel || '',
      lat: typeof wh.lat === 'number' ? wh.lat : 23.8103,
      lng: typeof wh.lng === 'number' ? wh.lng : 90.4125,
      mapPinLabel: wh.mapPinLabel || '',
      countryRegion: wh.countryRegion || '',
      address: wh.address || wh.addressLine || '',
      postalCode: wh.postalCode || wh.pincode || '',
      isReturnAddress: Boolean(wh.isReturnAddress ?? mode === 'modify_return'),
      isPrimary: Boolean(wh.isPrimary ?? wh.isDefaultPickup),
    });
    setModalOpen(true);
  };

  // Map search lookup handler
  const handleMapSearchLookup = () => {
    const query = formState.mapSearchQuery.trim();
    if (!query) return;

    const matchedDistrict = REGIONAL_DISTRICTS.find((d) =>
      d.region.toLowerCase().includes(query.toLowerCase())
    );

    if (matchedDistrict) {
      setFormState((prev) => ({
        ...prev,
        lat: matchedDistrict.lat,
        lng: matchedDistrict.lng,
        mapPinLabel: `${query} (${matchedDistrict.lat.toFixed(4)}, ${matchedDistrict.lng.toFixed(4)})`,
        countryRegion: prev.countryRegion || matchedDistrict.region,
      }));
    } else {
      // Deterministic offset from query hash so user sees real pin movement on lookup
      let hash = 0;
      for (let i = 0; i < query.length; i++) {
        hash = (hash << 5) - hash + query.charCodeAt(i);
        hash |= 0;
      }
      const nextLat = Number((23.75 + ((Math.abs(hash) % 180) - 90) * 0.004).toFixed(4));
      const nextLng = Number((90.38 + (((Math.abs(hash) >> 3) % 180) - 90) * 0.004).toFixed(4));
      setFormState((prev) => ({
        ...prev,
        lat: nextLat,
        lng: nextLng,
        mapPinLabel: `${query} (${nextLat.toFixed(4)}, ${nextLng.toFixed(4)})`,
      }));
    }
  };

  // Click on Interactive Map Canvas to set Pin Location
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));
    const nextLat = Number((24.2 - relY * 3.0).toFixed(4));
    const nextLng = Number((89.0 + relX * 3.4).toFixed(4));
    const label = formState.mapSearchQuery.trim()
      ? `${formState.mapSearchQuery.trim()} (${nextLat}, ${nextLng})`
      : `Pinned Location (${nextLat}, ${nextLng})`;

    setFormState((prev) => ({
      ...prev,
      lat: nextLat,
      lng: nextLng,
      mapPinLabel: label,
    }));
  };

  // Submit Add / Modify Form
  const handleSubmitWarehouseForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanWhName = formState.name.trim();
    const cleanFullName = formState.contactPerson.trim();
    const cleanPhoneLocal = formState.phoneLocal.trim();
    const cleanEmail = formState.email.trim();
    const cleanRegion = formState.countryRegion.trim();
    const cleanAddress = formState.address.trim();
    const cleanPostal = formState.postalCode.trim();

    if (!cleanWhName) {
      setFormError('Warehouse Name is required.');
      return;
    }
    if (!cleanFullName) {
      setFormError('First and Last Name is required.');
      return;
    }
    if (!cleanRegion) {
      setFormError('Please select or enter a Country Region / District.');
      return;
    }
    if (!cleanAddress) {
      setFormError('Detailed Street / Area Address is required.');
      return;
    }
    if (!cleanPostal) {
      setFormError('Postal Code is required.');
      return;
    }

    const formattedPhone = cleanPhoneLocal
      ? `${formState.countryCode} ${cleanPhoneLocal}`
      : '';
    const derivedCity =
      cleanRegion
        .split('/')
        .map((s) => s.trim())
        .filter(Boolean)[1] || cleanRegion;

    setSubmitting(true);
    try {
      if (editingWarehouseId) {
        // Modify existing warehouse / return address
        const existingItem = warehouses.find((w) => w.id === editingWarehouseId);
        const updatedItem: SellerWarehouseNode = {
          ...(existingItem || ({} as SellerWarehouseNode)),
          id: editingWarehouseId,
          warehouseCode:
            formState.warehouseCode ||
            existingItem?.warehouseCode ||
            `WH-BD-${String(warehouses.length).padStart(4, '0')}`,
          name: cleanWhName,
          contactPerson: cleanFullName,
          countryCode: formState.countryCode,
          phone: formattedPhone,
          contactPhone: formattedPhone,
          email: cleanEmail,
          countryRegion: cleanRegion,
          city: derivedCity,
          address: cleanAddress,
          addressLine: cleanAddress,
          pincode: cleanPostal,
          postalCode: cleanPostal,
          lat: formState.lat,
          lng: formState.lng,
          mapPinLabel:
            formState.mapPinLabel ||
            (formState.mapSearchQuery
              ? `${formState.mapSearchQuery} (${formState.lat.toFixed(4)}, ${formState.lng.toFixed(4)})`
              : ''),
          isPrimary: Boolean(existingItem?.isPrimary ?? formState.isPrimary),
          isDefaultPickup: Boolean(existingItem?.isDefaultPickup ?? formState.isPrimary),
          isReturnAddress:
            modalMode === 'modify_return'
              ? true
              : Boolean(existingItem?.isReturnAddress ?? formState.isReturnAddress),
          holidayMode: Boolean(existingItem?.holidayMode),
          holidayStartDate: existingItem?.holidayStartDate || '',
          holidayEndDate: existingItem?.holidayEndDate || '',
          holidayDateStatus: existingItem?.holidayDateStatus || 'Not Set',
        };

        let nextList = warehouses.map((w) =>
          w.id === editingWarehouseId
            ? updatedItem
            : modalMode === 'modify_return'
            ? { ...w, isReturnAddress: false }
            : w
        );

        try {
          const apiRes = await sellerApi.updateWarehouse(editingWarehouseId, updatedItem);
          if (Array.isArray(apiRes?.warehouses)) {
            nextList = sanitizeWarehouses(apiRes.warehouses);
          }
          if (onProfileUpdate) {
            const me = await sellerApi.getMe();
            if (me?.seller) onProfileUpdate(me.seller);
          }
        } catch {
          // Fallback to local state if in admin preview or offline
        }

        syncWarehousesState(nextList);
        notify(
          modalMode === 'modify_return'
            ? `Return Address "${cleanWhName}" updated.`
            : `Warehouse "${cleanWhName}" updated.`,
          'success'
        );
      } else {
        // Add New Warehouse (or initial Return Address)
        const nextIndex = warehouses.length + 1;
        const generatedCode = `WH-BD-${String(nextIndex).padStart(4, '0')}`;
        const newWhPayload: SellerWarehouseNode = {
          id: `wh_${Date.now()}`,
          warehouseCode: generatedCode,
          name: cleanWhName,
          contactPerson: cleanFullName,
          countryCode: formState.countryCode,
          phone: formattedPhone,
          contactPhone: formattedPhone,
          email: cleanEmail,
          countryRegion: cleanRegion,
          city: derivedCity,
          address: cleanAddress,
          addressLine: cleanAddress,
          pincode: cleanPostal,
          postalCode: cleanPostal,
          lat: formState.lat,
          lng: formState.lng,
          mapPinLabel:
            formState.mapPinLabel ||
            (formState.mapSearchQuery
              ? `${formState.mapSearchQuery} (${formState.lat.toFixed(4)}, ${formState.lng.toFixed(4)})`
              : ''),
          isPrimary: warehouses.length === 0 ? true : formState.isPrimary,
          isDefaultPickup: warehouses.length === 0 ? true : formState.isPrimary,
          isReturnAddress:
            modalMode === 'modify_return' || warehouses.length === 0
              ? true
              : formState.isReturnAddress,
          holidayMode: false,
          holidayStartDate: '',
          holidayEndDate: '',
          holidayDateStatus: 'Not Set',
        };

        let nextList = [...warehouses, newWhPayload];

        try {
          const apiRes = await sellerApi.addWarehouse(newWhPayload);
          if (Array.isArray(apiRes?.warehouses)) {
            nextList = sanitizeWarehouses(apiRes.warehouses);
          }
          if (onProfileUpdate) {
            const me = await sellerApi.getMe();
            if (me?.seller) onProfileUpdate(me.seller);
          }
        } catch {
          // Keep local state update
        }

        syncWarehousesState(nextList);
        notify(`Warehouse "${cleanWhName}" added successfully.`, 'success');
      }

      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Holiday Mode per WH
  const handleToggleWarehouseHoliday = async (wh: SellerWarehouseNode) => {
    const nextHoliday = !Boolean(wh.holidayMode);
    const defaultStart = wh.holidayStartDate || new Date().toISOString().slice(0, 10);
    const defaultEnd =
      wh.holidayEndDate ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const nextDateStatus = nextHoliday ? `${defaultStart} ~ ${defaultEnd}` : 'Not Set';

    const updatedWh: SellerWarehouseNode = {
      ...wh,
      holidayMode: nextHoliday,
      holidayStartDate: nextHoliday ? defaultStart : '',
      holidayEndDate: nextHoliday ? defaultEnd : '',
      holidayDateStatus: nextDateStatus,
    };

    let nextList = warehouses.map((item) => (item.id === wh.id ? updatedWh : item));
    syncWarehousesState(nextList);

    try {
      const apiRes = await sellerApi.updateWarehouse(wh.id, {
        holidayMode: nextHoliday,
        holidayStartDate: updatedWh.holidayStartDate,
        holidayEndDate: updatedWh.holidayEndDate,
        holidayDateStatus: nextDateStatus,
      });
      if (Array.isArray(apiRes?.warehouses)) {
        syncWarehousesState(sanitizeWarehouses(apiRes.warehouses));
      }
      if (onProfileUpdate) {
        const me = await sellerApi.getMe();
        if (me?.seller) onProfileUpdate(me.seller);
      }
    } catch {
      // Keep local update
    }

    notify(
      `Holiday Mode ${nextHoliday ? 'enabled' : 'disabled'} for "${wh.name}".`,
      'info'
    );
  };

  const handleSaveHolidayDates = async (wh: SellerWarehouseNode) => {
    const start = holidayDatesDraft.start.trim();
    const end = holidayDatesDraft.end.trim();
    const nextStatus = start && end ? `${start} ~ ${end}` : wh.holidayMode ? 'Holiday Active' : 'Not Set';

    const updatedWh: SellerWarehouseNode = {
      ...wh,
      holidayMode: Boolean(start && end) ? true : Boolean(wh.holidayMode),
      holidayStartDate: start,
      holidayEndDate: end,
      holidayDateStatus: nextStatus,
    };

    const nextList = warehouses.map((item) => (item.id === wh.id ? updatedWh : item));
    syncWarehousesState(nextList);
    setEditingHolidayWhId(null);

    try {
      await sellerApi.updateWarehouse(wh.id, {
        holidayMode: updatedWh.holidayMode,
        holidayStartDate: start,
        holidayEndDate: end,
        holidayDateStatus: nextStatus,
      });
    } catch {}

    notify(`Holiday schedule updated for "${wh.name}".`, 'success');
  };

  const handleDeleteWarehouse = async (wh: SellerWarehouseNode) => {
    const nextList = warehouses.filter((item) => item.id !== wh.id);
    syncWarehousesState(nextList);
    if (selectedWhFilter === wh.id) {
      setSelectedWhFilter('ALL');
    }

    try {
      const apiRes = await sellerApi.deleteWarehouse(wh.id);
      if (Array.isArray(apiRes?.warehouses)) {
        syncWarehousesState(sanitizeWarehouses(apiRes.warehouses));
      }
      if (onProfileUpdate) {
        const me = await sellerApi.getMe();
        if (me?.seller) onProfileUpdate(me.seller);
      }
    } catch {}

    notify(`Warehouse "${wh.name}" removed.`, 'info');
  };

  const formatFullAddressDisplay = (wh: SellerWarehouseNode) => {
    const parts = [
      wh.address || wh.addressLine,
      wh.countryRegion || wh.city,
      wh.postalCode || wh.pincode,
    ]
      .map((p) => String(p || '').trim())
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const selectedDropdownLabel = useMemo(() => {
    if (selectedWhFilter === 'ALL') return 'Warehouse Name';
    const found = warehouses.find(
      (w) => w.id === selectedWhFilter || w.warehouseCode === selectedWhFilter || w.name === selectedWhFilter
    );
    return found ? found.name : 'Warehouse Name';
  }, [selectedWhFilter, warehouses]);

  // Calculate visual pin position on the interactive map preview
  const mapPinPosition = useMemo(() => {
    const normX = Math.max(12, Math.min(88, ((formState.lng - 88.5) / 4.0) * 100));
    const normY = Math.max(14, Math.min(86, ((25.5 - formState.lat) / 4.5) * 100));
    return { left: `${normX}%`, top: `${normY}%` };
  }, [formState.lat, formState.lng]);

  return (
    <div className="space-y-6">
      {/* 1. Informational Banner */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-[13px] ${
          isDark
            ? 'bg-sky-950/40 border-sky-800/70 text-sky-200'
            : 'bg-[#EBF5FF] border-[#BAE0FF] text-slate-800'
        }`}
      >
        <Info
          size={17}
          className={`shrink-0 ${isDark ? 'text-sky-400' : 'text-[#1677FF]'}`}
        />
        <span>
          New feature Pickup Address Group aims at solving multiple Shipping Provider and First Mile Type problems.
        </span>
      </div>

      {/* 2. Return Address Section */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}
        >
          <h3
            className={`text-[15px] font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Return Address
          </h3>
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
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Address</th>
                <th className="py-3 px-5">Phone</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-neutral-800 text-neutral-200' : 'divide-slate-200 text-slate-800'
              }`}
            >
              {returnAddressRow ? (
                <tr className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'}>
                  <td className="py-3.5 px-5 font-medium">
                    <div>{returnAddressRow.contactPerson || returnAddressRow.name || '—'}</div>
                    {returnAddressRow.contactPerson && returnAddressRow.name && (
                      <div className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                        {returnAddressRow.name}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-5 max-w-md">
                    {formatFullAddressDisplay(returnAddressRow)}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    {returnAddressRow.phone || returnAddressRow.contactPhone || '—'}
                  </td>
                  <td className="py-3.5 px-5">
                    {returnAddressRow.email || '—'}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModifyModal(returnAddressRow, 'modify_return')}
                      className={`font-semibold cursor-pointer hover:underline ${
                        isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                      }`}
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ) : (
                <tr className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'}>
                  <td className={`py-3.5 px-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>—</td>
                  <td className={`py-3.5 px-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    No return address configured yet
                  </td>
                  <td className={`py-3.5 px-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>—</td>
                  <td className={`py-3.5 px-5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>—</td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenModifyModal(null, 'modify_return')}
                      className={`font-semibold cursor-pointer hover:underline ${
                        isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                      }`}
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Warehouse Address Section */}
      <div
        className={`rounded-xl border ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <h3
              className={`text-[15px] font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Warehouse Address
            </h3>

            {/* Searchable "Warehouse Name" Dropdown Filter */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((v) => !v)}
                className={`inline-flex items-center justify-between gap-3 min-w-[210px] px-3 py-1.5 rounded-lg border text-[13px] transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-700 text-neutral-200 hover:border-neutral-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                <span className="truncate">{selectedDropdownLabel}</span>
                <ChevronDown size={14} className="shrink-0 opacity-70" />
              </button>

              {dropdownOpen && (
                <div
                  className={`absolute left-0 mt-1.5 w-72 rounded-xl border shadow-xl z-30 p-2 space-y-1.5 ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="relative">
                    <Search
                      size={14}
                      className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-neutral-500' : 'text-slate-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={whSearchTerm}
                      onChange={(e) => setWhSearchTerm(e.target.value)}
                      placeholder="Search warehouse name..."
                      className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-[12px] focus:outline-none ${
                        isDark
                          ? 'bg-neutral-900 border-neutral-800 text-white focus:border-[#F5A623]'
                          : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-transparent">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWhFilter('ALL');
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium flex items-center justify-between cursor-pointer ${
                        selectedWhFilter === 'ALL'
                          ? isDark
                            ? 'bg-[#F5A623]/15 text-[#F5A623]'
                            : 'bg-blue-50 text-blue-700'
                          : isDark
                          ? 'hover:bg-neutral-900 text-neutral-300'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>All Warehouses ({warehouses.length})</span>
                      {selectedWhFilter === 'ALL' && <Check size={13} />}
                    </button>

                    {dropdownFilteredWarehouses.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWhFilter(w.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[12px] flex items-center justify-between cursor-pointer ${
                          selectedWhFilter === w.id
                            ? isDark
                              ? 'bg-[#F5A623]/15 text-[#F5A623] font-semibold'
                              : 'bg-blue-50 text-blue-700 font-semibold'
                            : isDark
                            ? 'hover:bg-neutral-900 text-neutral-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="truncate">{w.name}</div>
                          <div className="text-[10px] opacity-65 font-mono">
                            {w.warehouseCode || w.id}
                          </div>
                        </div>
                        {selectedWhFilter === w.id && <Check size={13} className="shrink-0" />}
                      </button>
                    ))}

                    {dropdownFilteredWarehouses.length === 0 && (
                      <div className="px-3 py-3 text-center text-[12px] opacity-60">
                        No matching warehouse found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddModal(false)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer self-start sm:self-auto ${
              isDark
                ? 'bg-[#F5A623] text-black hover:bg-[#e09612]'
                : 'bg-[#F85606] hover:bg-[#d94800] text-white shadow-2xs'
            }`}
          >
            <Plus size={15} />
            <span>Add New Warehouse</span>
          </button>
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
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Warehouse Code</th>
                <th className="py-3 px-5">Address</th>
                <th className="py-3 px-5">Phone</th>
                <th className="py-3 px-5">Email</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-neutral-800 text-neutral-200' : 'divide-slate-200 text-slate-800'
              }`}
            >
              {visibleWarehouses.length > 0 ? (
                visibleWarehouses.map((wh) => (
                  <tr
                    key={wh.id}
                    className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'}
                  >
                    <td className="py-3.5 px-5 font-medium">
                      <div>{wh.name || '—'}</div>
                      {wh.contactPerson && (
                        <div
                          className={`text-[11px] mt-0.5 ${
                            isDark ? 'text-neutral-400' : 'text-slate-500'
                          }`}
                        >
                          Contact: {wh.contactPerson}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[12px]">
                      {wh.warehouseCode || wh.id}
                    </td>
                    <td className="py-3.5 px-5 max-w-md">{formatFullAddressDisplay(wh)}</td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {wh.phone || wh.contactPhone || '—'}
                    </td>
                    <td className="py-3.5 px-5">{wh.email || '—'}</td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenModifyModal(wh, 'modify_warehouse')}
                          className={`font-semibold cursor-pointer hover:underline ${
                            isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                          }`}
                        >
                          Modify
                        </button>
                        {warehouses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteWarehouse(wh)}
                            title="Remove Warehouse"
                            className="text-rose-500 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className={`py-8 px-5 text-center ${
                      isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    No warehouse address added yet. Click{' '}
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(false)}
                      className={`font-semibold underline cursor-pointer ${
                        isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                      }`}
                    >
                      + Add New Warehouse
                    </button>{' '}
                    to configure your regional pickup address.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Holiday Mode for per WH Section */}
      <div
        className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-neutral-900/90 border-neutral-800' : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}
        >
          <h3
            className={`text-[15px] font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Holiday Mode for per WH
          </h3>
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
                <th className="py-3 px-5">Name</th>
                <th className="py-3 px-5">Date Status</th>
                <th className="py-3 px-5 text-right">Holiday Mode</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? 'divide-neutral-800 text-neutral-200' : 'divide-slate-200 text-slate-800'
              }`}
            >
              {warehouses.length > 0 ? (
                warehouses.map((wh) => {
                  const isOn = Boolean(wh.holidayMode);
                  const isEditingDates = editingHolidayWhId === wh.id;
                  return (
                    <tr
                      key={wh.id}
                      className={isDark ? 'hover:bg-neutral-800/40' : 'hover:bg-slate-50/80'}
                    >
                      <td className="py-3.5 px-5 font-medium">{wh.name}</td>
                      <td className="py-3.5 px-5">
                        {isEditingDates ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              value={holidayDatesDraft.start}
                              onChange={(e) =>
                                setHolidayDatesDraft((p) => ({ ...p, start: e.target.value }))
                              }
                              className={`px-2.5 py-1 rounded border text-[12px] ${
                                isDark
                                  ? 'bg-neutral-950 border-neutral-700 text-white'
                                  : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                            <span>~</span>
                            <input
                              type="date"
                              value={holidayDatesDraft.end}
                              onChange={(e) =>
                                setHolidayDatesDraft((p) => ({ ...p, end: e.target.value }))
                              }
                              className={`px-2.5 py-1 rounded border text-[12px] ${
                                isDark
                                  ? 'bg-neutral-950 border-neutral-700 text-white'
                                  : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveHolidayDates(wh)}
                              className="px-2.5 py-1 rounded bg-blue-600 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingHolidayWhId(null)}
                              className="px-2 py-1 text-[11px] opacity-70 hover:opacity-100 cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            <span
                              className={
                                isOn
                                  ? isDark
                                    ? 'text-amber-400 font-medium'
                                    : 'text-amber-700 font-medium'
                                  : isDark
                                  ? 'text-neutral-400'
                                  : 'text-slate-500'
                              }
                            >
                              {isOn
                                ? wh.holidayDateStatus && wh.holidayDateStatus !== 'Not Set'
                                  ? wh.holidayDateStatus
                                  : 'Holiday Active'
                                : 'Not Set'}
                            </span>
                            {isOn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingHolidayWhId(wh.id);
                                  setHolidayDatesDraft({
                                    start:
                                      wh.holidayStartDate || new Date().toISOString().slice(0, 10),
                                    end:
                                      wh.holidayEndDate ||
                                      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                        .toISOString()
                                        .slice(0, 10),
                                  });
                                }}
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold underline cursor-pointer ${
                                  isDark ? 'text-[#F5A623]' : 'text-[#1677FF]'
                                }`}
                              >
                                <Calendar size={12} />
                                <span>Set Dates</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-2.5">
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
                            {isOn ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isOn}
                            onClick={() => handleToggleWarehouseHoliday(wh)}
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
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className={`py-6 px-5 text-center ${
                      isDark ? 'text-neutral-400' : 'text-slate-500'
                    }`}
                  >
                    No warehouses added yet. Add a warehouse above to manage per-warehouse Holiday Mode.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add / Modify Warehouse Modal Form (Dynamic & Blank Fields by Default) */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-8 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b flex items-center justify-between ${
                isDark ? 'border-neutral-800 bg-neutral-950/60' : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2
                  size={18}
                  className={isDark ? 'text-[#F5A623]' : 'text-[#F85606]'}
                />
                <h3 className="text-[16px] font-bold">
                  {modalMode === 'add'
                    ? 'Add New Warehouse'
                    : modalMode === 'modify_return'
                    ? 'Modify Return Address'
                    : 'Modify Warehouse Address'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-[13px] font-medium">
                  {formError}
                </div>
              )}

              {/* Row 1: Warehouse Name & First and Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    required
                    value={formState.name}
                    onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter warehouse name"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
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
                    First and Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.contactPerson}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, contactPerson: e.target.value }))
                    }
                    placeholder="Enter first and last name"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Row 2: Phone Number (+880 selector) & Email Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Phone Number
                  </label>
                  <div className="flex items-center">
                    <select
                      value={formState.countryCode}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, countryCode: e.target.value }))
                      }
                      className={`px-2.5 py-2 rounded-l-lg border border-r-0 text-[13px] font-medium focus:outline-none ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-700 text-neutral-200'
                          : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formState.phoneLocal}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, phoneLocal: e.target.value }))
                      }
                      placeholder="1XXXXXXXXX"
                      className={`w-full px-3.5 py-2 rounded-r-lg border text-[13px] focus:outline-none ${
                        isDark
                          ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Enter email address"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>
              </div>

              {/* Row 3: Pin Location / Map Integration */}
              <div>
                <label
                  className={`block text-[13px] font-medium mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  Pin Location / Map Integration
                </label>
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search
                        size={15}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-neutral-500' : 'text-slate-400'
                        }`}
                      />
                      <input
                        type="text"
                        value={formState.mapSearchQuery}
                        onChange={(e) =>
                          setFormState((p) => ({ ...p, mapSearchQuery: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleMapSearchLookup();
                          }
                        }}
                        placeholder="Search address, area, or landmark to pin on map..."
                        className={`w-full pl-9 pr-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                          isDark
                            ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                            : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMapSearchLookup}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-[12px] font-semibold cursor-pointer ${
                        isDark
                          ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-700'
                          : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Navigation size={13} />
                      <span>Locate</span>
                    </button>
                  </div>

                  {/* Interactive Visual Map Picker Preview */}
                  <div
                    onClick={handleMapCanvasClick}
                    title="Click anywhere on the map to adjust pin location"
                    className={`relative h-44 w-full rounded-xl border overflow-hidden cursor-crosshair select-none ${
                      isDark ? 'border-neutral-700 bg-neutral-950' : 'border-slate-300 bg-[#EEF3F8]'
                    }`}
                  >
                    {/* Map Grid & Road Network SVG */}
                    <svg
                      className="w-full h-full opacity-75"
                      viewBox="0 0 600 220"
                      preserveAspectRatio="none"
                    >
                      <rect
                        width="600"
                        height="220"
                        fill={isDark ? '#141c24' : '#e9f0f6'}
                      />
                      <path
                        d="M 0 45 Q 180 65 340 40 T 600 70"
                        stroke={isDark ? '#1e3a5f' : '#bfd8f2'}
                        strokeWidth="18"
                        fill="none"
                      />
                      <path
                        d="M 40 220 L 210 110 L 420 125 L 580 20"
                        stroke={isDark ? '#334155' : '#ffffff'}
                        strokeWidth="8"
                        fill="none"
                      />
                      <path
                        d="M 0 140 L 600 115"
                        stroke={isDark ? '#475569' : '#fde68a'}
                        strokeWidth="5"
                        fill="none"
                      />
                      <path
                        d="M 160 0 L 195 220 M 390 0 L 365 220"
                        stroke={isDark ? '#293548' : '#ffffff'}
                        strokeWidth="4"
                        fill="none"
                      />
                    </svg>

                    {/* Draggable / Clickable Pin Marker */}
                    <div
                      style={{ left: mapPinPosition.left, top: mapPinPosition.top }}
                      className="absolute -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-150"
                    >
                      <div className="flex flex-col items-center">
                        <div className="px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-medium whitespace-nowrap shadow-md mb-1">
                          {formState.mapPinLabel ||
                            `${formState.lat.toFixed(4)}, ${formState.lng.toFixed(4)}`}
                        </div>
                        <MapPin
                          size={28}
                          className="text-[#F85606] drop-shadow-md fill-[#F85606]/20"
                        />
                      </div>
                    </div>

                    {/* Bottom Map Status Bar */}
                    <div
                      className={`absolute bottom-2 left-2.5 right-2.5 px-3 py-1.5 rounded-lg text-[11px] flex items-center justify-between ${
                        isDark
                          ? 'bg-neutral-900/90 text-neutral-300 border border-neutral-800'
                          : 'bg-white/90 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <LocateFixed size={12} className="text-[#F85606] shrink-0" />
                        <span className="truncate">
                          {formState.mapPinLabel
                            ? `Pinned: ${formState.mapPinLabel}`
                            : 'Click on the map or search above to pin your exact warehouse location'}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] opacity-75 shrink-0 ml-2">
                        {formState.lat.toFixed(4)}, {formState.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Country Region / District Dropdown Selector */}
              <div>
                <label
                  className={`block text-[13px] font-medium mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  Country Region / District <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formState.countryRegion}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = REGIONAL_DISTRICTS.find((d) => d.region === val);
                    setFormState((p) => ({
                      ...p,
                      countryRegion: val,
                      lat: found ? found.lat : p.lat,
                      lng: found ? found.lng : p.lng,
                    }));
                  }}
                  className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                >
                  <option value="">Select Country Region / District...</option>
                  {REGIONAL_DISTRICTS.map((d) => (
                    <option key={d.region} value={d.region}>
                      {d.region}
                    </option>
                  ))}
                  {formState.countryRegion &&
                    !REGIONAL_DISTRICTS.some((d) => d.region === formState.countryRegion) && (
                      <option value={formState.countryRegion}>{formState.countryRegion}</option>
                    )}
                </select>
              </div>

              {/* Row 5: Detailed Address Textarea */}
              <div>
                <label
                  className={`block text-[13px] font-medium mb-1.5 ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formState.address}
                  onChange={(e) => setFormState((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Enter detailed street, road, house/plot number, and local area address"
                  className={`w-full px-3.5 py-2 rounded-lg border text-[13px] focus:outline-none ${
                    isDark
                      ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                  }`}
                />
              </div>

              {/* Row 6: Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label
                    className={`block text-[13px] font-medium mb-1.5 ${
                      isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.postalCode}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, postalCode: e.target.value }))
                    }
                    placeholder="Enter postal code"
                    className={`w-full px-3.5 py-2 rounded-lg border text-[13px] font-mono focus:outline-none ${
                      isDark
                        ? 'bg-neutral-950 border-neutral-700 text-white focus:border-[#F5A623]'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600'
                    }`}
                  />
                </div>

                <label className="flex items-center gap-2.5 py-2 cursor-pointer select-none text-[13px]">
                  <input
                    type="checkbox"
                    checked={formState.isReturnAddress}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, isReturnAddress: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-[#F85606] focus:ring-[#F85606]"
                  />
                  <span className={isDark ? 'text-neutral-300' : 'text-slate-700'}>
                    Use as default Return Address
                  </span>
                </label>
              </div>

              {/* Action Buttons: Cancel and Submit */}
              <div
                className={`pt-4 border-t flex items-center justify-end gap-3 ${
                  isDark ? 'border-neutral-800' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
                  disabled={submitting}
                  onClick={(e) => handleSubmitWarehouseForm(e as any)}
                  className={`px-6 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                    isDark
                      ? 'bg-[#F5A623] hover:bg-[#e09612] text-black'
                      : 'bg-[#F85606] hover:bg-[#d94800] text-white shadow-xs'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DarazWarehousePickupManager;
