import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, ShieldCheck, Power, Zap, Save, CheckCircle2, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { sellerApi } from '../../services/sellerApi';
import { SellerProfile } from '../../types';

// Fix Leaflet marker icon asset paths
const defaultStoreIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

interface ShopLocationTabProps {
  sellerProfile: SellerProfile | null;
  onProfileUpdate: (updated: SellerProfile) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ShopLocationTab({ sellerProfile, onProfileUpdate, showToast }: ShopLocationTabProps) {
  const [lat, setLat] = useState<number>(() => {
    if (sellerProfile?.location?.coordinates && sellerProfile.location.coordinates.length >= 2) {
      return sellerProfile.location.coordinates[1]; // GeoJSON [lng, lat]
    }
    return 28.6315; // Connaught Place, New Delhi default
  });

  const [lng, setLng] = useState<number>(() => {
    if (sellerProfile?.location?.coordinates && sellerProfile.location.coordinates.length >= 2) {
      return sellerProfile.location.coordinates[0];
    }
    return 77.2167;
  });

  const [shopAddress, setShopAddress] = useState(
    sellerProfile?.shopAddress || sellerProfile?.businessAddress || 'Block B, Inner Circle, Connaught Place, New Delhi 110001'
  );
  const [isOpen, setIsOpen] = useState(sellerProfile?.isOpen !== false);
  const [quickDeliveryEnabled, setQuickDeliveryEnabled] = useState(sellerProfile?.quickDeliveryEnabled !== false);
  const [prepTimeMin, setPrepTimeMin] = useState(sellerProfile?.prepTimeMin ?? 7);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState(sellerProfile?.deliveryRadiusKm ?? 5);

  const [saving, setSaving] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Fetch current stored location on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchLocation() {
      try {
        setLoadingInitial(true);
        const res = await sellerApi.getLocation();
        if (isMounted && res && res.data) {
          if (res.data.location?.coordinates) {
            setLng(res.data.location.coordinates[0]);
            setLat(res.data.location.coordinates[1]);
          }
          if (res.data.shopAddress) setShopAddress(res.data.shopAddress);
          if (res.data.isOpen !== undefined) setIsOpen(res.data.isOpen);
          if (res.data.quickDeliveryEnabled !== undefined) setQuickDeliveryEnabled(res.data.quickDeliveryEnabled);
          if (res.data.prepTimeMin !== undefined) setPrepTimeMin(res.data.prepTimeMin);
          if (res.data.deliveryRadiusKm !== undefined) setDeliveryRadiusKm(res.data.deliveryRadiusKm);
        }
      } catch (e) {
        // Fallback to local profile state
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }
    fetchLocation();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Number(pos.coords.latitude.toFixed(6));
        const newLng = Number(pos.coords.longitude.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        setFetchingGps(false);
        showToast(`Store GPS updated to: ${newLat}, ${newLng}`, 'success');
      },
      (err) => {
        setFetchingGps(false);
        showToast(`Could not access device location: ${err.message}`, 'error');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = async () => {
    if (!shopAddress.trim()) {
      showToast('Please enter your store address.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await sellerApi.updateLocation({
        lat,
        lng,
        shopAddress: shopAddress.trim(),
        isOpen,
        quickDeliveryEnabled,
        prepTimeMin,
        deliveryRadiusKm,
      });

      if (res && res.data) {
        if (sellerProfile) {
          const updated: SellerProfile = {
            ...sellerProfile,
            shopAddress: res.data.shopAddress,
            location: res.data.location,
            isOpen: res.data.isOpen,
            quickDeliveryEnabled: res.data.quickDeliveryEnabled,
            prepTimeMin: res.data.prepTimeMin,
            deliveryRadiusKm: res.data.deliveryRadiusKm,
          };
          sellerApi.setStoredProfile(updated);
          onProfileUpdate(updated);
        }
        showToast('Store location & quick delivery configuration saved successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update shop location', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF007F]" />
            <h2 className="text-lg font-bold font-serif text-neutral-900 dark:text-white">
              Shop Location & Quick Delivery Settings
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Configure your physical store coordinates, live operational status, packing SLA, and local delivery radius.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveLocation}
          disabled={saving}
          className="px-5 py-2.5 bg-[#FF007F] hover:bg-[#d80068] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                Live Store Location Map
              </h3>
              <p className="text-[11px] text-neutral-400">Drag the pin or click anywhere on the map to pin your storefront</p>
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={fetchingGps}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 text-[#FF007F] ${fetchingGps ? 'animate-spin' : ''}`} />
              <span>{fetchingGps ? 'Detecting GPS...' : 'Use my current location'}</span>
            </button>
          </div>

          <div className="h-[360px] sm:h-[420px] w-full relative">
            {loadingInitial ? (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-950">
                <RefreshCw className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : (
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter lat={lat} lng={lng} />
                <MapClickHandler
                  onSelect={(newLat, newLng) => {
                    setLat(newLat);
                    setLng(newLng);
                  }}
                />
                <Marker
                  position={[lat, lng]}
                  icon={defaultStoreIcon}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const marker = e.target;
                      const pos = marker.getLatLng();
                      setLat(Number(pos.lat.toFixed(6)));
                      setLng(Number(pos.lng.toFixed(6)));
                    },
                  }}
                >
                  <Popup>
                    <div className="text-xs">
                      <strong>{sellerProfile?.shopName || 'Your Storefront'}</strong>
                      <p>{shopAddress}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            )}
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-neutral-400">Latitude:</span>{' '}
              <strong className="text-neutral-900 dark:text-white font-bold">{lat}</strong>
            </div>
            <div>
              <span className="text-neutral-400">Longitude:</span>{' '}
              <strong className="text-neutral-900 dark:text-white font-bold">{lng}</strong>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Valid Pin</span>
            </div>
          </div>
        </div>

        {/* Right Column: Operational Controls & Delivery Rules */}
        <div className="lg:col-span-5 space-y-5">
          {/* Store Address Form */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF007F]" />
              <span>Physical Store Address</span>
            </h3>
            <textarea
              rows={3}
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
              placeholder="Full shop number, floor, building name, street, locality, landmark, pincode..."
              className="w-full px-3 py-2.5 bg-neutral-50 dark:bg-black border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs text-neutral-900 dark:text-white outline-none focus:border-[#FF007F] resize-none"
            />
          </div>

          {/* Store Status Switches */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              Storefront Operational Status
            </h3>

            {/* Open / Close Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isOpen ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    {isOpen ? 'Store is Open & Accepting Orders' : 'Store is Closed'}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    {isOpen ? 'Customers can place instant orders' : 'Orders paused temporarily'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isOpen ? 'bg-emerald-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    isOpen ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Quick 20-Min Delivery Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    quickDeliveryEnabled ? 'bg-amber-500/20 text-amber-500' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white">
                    20-Minute Quick Dispatch
                  </p>
                  <p className="text-[10px] text-neutral-400">Eligible nearby items delivered within 20 mins</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickDeliveryEnabled(!quickDeliveryEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  quickDeliveryEnabled ? 'bg-amber-500' : 'bg-neutral-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    quickDeliveryEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sliders: Prep Time & Delivery Radius */}
          <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              SLA & Dispatch Boundaries
            </h3>

            {/* Prep Time Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-neutral-400" />
                  Order Packing Time:
                </span>
                <span className="font-bold font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  {prepTimeMin} minutes
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={60}
                value={prepTimeMin}
                onChange={(e) => setPrepTimeMin(Number(e.target.value))}
                className="w-full accent-[#FF007F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Fast (2m)</span>
                <span>Standard (15m)</span>
                <span>Max (60m)</span>
              </div>
            </div>

            {/* Delivery Radius Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-neutral-400" />
                  Quick Delivery Coverage Radius:
                </span>
                <span className="font-bold font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {deliveryRadiusKm} km
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={deliveryRadiusKm}
                onChange={(e) => setDeliveryRadiusKm(Number(e.target.value))}
                className="w-full accent-[#FF007F] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Local (1 km)</span>
                <span>Standard (5 km)</span>
                <span>Citywide (30 km)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
