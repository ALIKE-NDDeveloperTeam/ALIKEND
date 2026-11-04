import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

// Custom clean pin icon to avoid Vite Leaflet asset resolution bugs
const customPinIcon = L.divIcon({
  html: `
    <div style="
      background-color: #FF007F;
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #ffffff;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  className: 'custom-leaflet-pin',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

interface LocationCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Subcomponent to handle map clicks and sync center
function DraggableMarkerController({
  position,
  setPosition,
  onPositionChange,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          onPositionChange(newPos.lat, newPos.lng);
        }
      },
    }),
    [setPosition, onPositionChange]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customPinIcon}
    />
  );
}

function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
}

export const LocationCaptureModal: React.FC<LocationCaptureModalProps> = ({ isOpen, onClose }) => {
  const { location, setLocation, clearLocation } = useLocation();

  const [mode, setMode] = useState<'prompt' | 'map'>('prompt');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rememberLocation, setRememberLocation] = useState(true);

  // Manual map state
  const [mapPos, setMapPos] = useState<[number, number]>(() => {
    if (location) return [location.lat, location.lng];
    return [28.6139, 77.209]; // Default New Delhi coordinates
  });
  const [resolvedLabel, setResolvedLabel] = useState(location?.label || 'Connaught Place, New Delhi');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (location) {
      setMapPos([location.lat, location.lng]);
      setResolvedLabel(location.label);
    }
  }, [location]);

  if (!isOpen) return null;

  // 1. Automatic GPS Detection
  const handleAllowLocation = () => {
    setErrorMessage(null);
    setIsDetecting(true);

    if (!('geolocation' in navigator)) {
      setIsDetecting(false);
      setErrorMessage('Geolocation is not supported by your browser. Please choose manually.');
      setMode('map');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsDetecting(false);

        // Reverse geocode to get a human-friendly area name
        let areaLabel = 'My Current Location';
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'AlikeND-Ecommerce-Platform',
              },
            }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address;
            areaLabel =
              addr.suburb ||
              addr.neighbourhood ||
              addr.city ||
              addr.town ||
              addr.village ||
              revData.display_name?.split(',')[0] ||
              'My Current Location';
          }
        } catch {
          // fallback to default label
        }

        await setLocation(
          {
            lat,
            lng,
            label: areaLabel,
            savedAt: Date.now(),
          },
          rememberLocation
        );

        onClose();
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied. You can pick your delivery area on the map.');
        } else if (err.code === err.TIMEOUT) {
          setErrorMessage('Location request timed out. Please select your location on the map.');
        } else {
          setErrorMessage('Unable to retrieve location. Please choose manually on the map.');
        }
        setMode('map');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // 2. Reverse geocode when pin moves on the map
  const handlePositionChange = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'AlikeND-Ecommerce-Platform',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const areaName =
          addr.suburb ||
          addr.neighbourhood ||
          addr.road ||
          addr.city ||
          addr.town ||
          data.display_name?.split(',').slice(0, 2).join(',') ||
          'Selected Location';
        setResolvedLabel(areaName);
      }
    } catch {
      setResolvedLabel('Pinned Location');
    } finally {
      setIsGeocoding(false);
    }
  };

  // 3. Search area / address with Nominatim (debounced)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              'User-Agent': 'AlikeND-Ecommerce-Platform',
            },
          }
        );
        if (res.ok) {
          const results = await res.json();
          setSearchResults(results || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelectSearchResult = (res: { display_name: string; lat: string; lon: string }) => {
    const lat = parseFloat(res.lat);
    const lng = parseFloat(res.lon);
    setMapPos([lat, lng]);
    setResolvedLabel(res.display_name.split(',').slice(0, 2).join(', '));
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirmManualLocation = async () => {
    await setLocation(
      {
        lat: mapPos[0],
        lng: mapPos[1],
        label: resolvedLabel || 'Selected Location',
        savedAt: Date.now(),
      },
      rememberLocation
    );
    onClose();
  };

  const handleClearLocation = async () => {
    await clearLocation();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center border border-amber-400/30">
              <MapPin className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Delivery Location</h2>
              <p className="text-xs text-neutral-400">Discover nearby luxury sellers & 10-20 min quick delivery</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode: Prompt View */}
        {mode === 'prompt' && (
          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-400/30 text-amber-400 mb-1">
                <Navigation className="w-7 h-7 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">Allow location to see nearby sellers and quick delivery</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Allow location to instantly see express sellers near your doorstep, estimated 10-20 min delivery times, and local atelier stock.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Privacy First Guarantee</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Your coordinates are never logged or sold. Only distance and ETA are calculated securely on our server.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberLocation}
                  onChange={(e) => setRememberLocation(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-400 focus:ring-amber-400"
                />
                <span>Remember my location</span>
              </label>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={isDetecting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Detecting current location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-4 h-4 fill-black text-black" />
                    <span>Allow location</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('map')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors border border-neutral-700 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Choose manually</span>
              </button>

              {location && (
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="w-full py-2 text-xs text-neutral-400 hover:text-red-400 transition-colors text-center cursor-pointer"
                >
                  Clear saved location ({location.label})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode: Manual Map & Search View */}
        {mode === 'map' && (
          <div className="p-5 space-y-4">
            {/* Search Box */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search city, area, pincode or landmark..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 animate-spin" />
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-neutral-950 border border-neutral-800 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectSearchResult(res)}
                      className="w-full px-3 py-2 text-left text-xs text-neutral-300 hover:bg-neutral-800 flex items-start gap-2 border-b border-neutral-900 last:border-0 cursor-pointer"
                    >
                      <Building className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="truncate">{res.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive Leaflet Map */}
            <div className="relative w-full h-52 rounded-xl overflow-hidden border border-neutral-800">
              <MapContainer
                center={mapPos}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter position={mapPos} />
                <DraggableMarkerController
                  position={mapPos}
                  setPosition={setMapPos}
                  onPositionChange={handlePositionChange}
                />
              </MapContainer>

              <div className="absolute bottom-2 left-2 z-[400] bg-neutral-950/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-neutral-800 text-[10px] text-neutral-300 shadow">
                Drag marker to adjust location
              </div>
            </div>

            {/* Selected Location Pill */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Selected Area</div>
                  <div className="text-xs font-medium text-white truncate">
                    {isGeocoding ? 'Locating address...' : resolvedLabel}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={isDetecting}
                className="shrink-0 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                title="Use GPS current location"
              >
                <Navigation className="w-3 h-3" />
                <span>GPS</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 px-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberLocation}
                  onChange={(e) => setRememberLocation(e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-800 text-amber-400 focus:ring-amber-400"
                />
                <span>Remember for this device</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setMode('prompt')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmManualLocation}
                className="flex-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs tracking-wide transition-all shadow cursor-pointer"
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
