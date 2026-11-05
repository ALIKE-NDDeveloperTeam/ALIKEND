import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Zap,
  Clock,
  Store,
  Navigation,
  ChevronRight,
  Star,
  Map as MapIcon,
  Grid,
  ShieldCheck,
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

const shopMarkerIcon = L.divIcon({
  html: `
    <div style="
      background-color: #10B981;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 14px;
        font-weight: bold;
      ">🏪</div>
    </div>
  `,
  className: 'custom-leaflet-shop-pin',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface NearbySellersSectionProps {
  onSelectSeller?: (sellerId: string, shopName?: string) => void;
  onNavigateDelivery?: () => void;
}

export const NearbySellersSection: React.FC<NearbySellersSectionProps> = ({
  onSelectSeller,
  onNavigateDelivery,
}) => {
  const { location, nearbySellers, isLoadingNearby, promptLocationCapture } = useLocation();
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  if (!location) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-neutral-900 to-neutral-900 border border-amber-500/30 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Express Hyperlocal Delivery (10-20 Min)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Discover Luxury Ateliers & Boutiques Near You
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
              Set your location to see open sellers within 5-10 km, instant delivery ETAs, and verified atelier stock.
            </p>
          </div>
          <button
            type="button"
            onClick={promptLocationCapture}
            className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer active:scale-95"
          >
            <Navigation className="w-4 h-4 fill-black text-black" />
            <span>Set Delivery Location</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 my-10 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Sellers Near You
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-[11px] font-mono text-neutral-400">
              {nearbySellers.length} ateliers
            </span>
          </div>
          <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Delivering to: <strong className="text-neutral-200">{location.label}</strong></span>
            <button
              onClick={promptLocationCapture}
              className="ml-1 text-amber-400 hover:underline font-semibold cursor-pointer"
            >
              (Change)
            </button>
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'map'
                ? 'bg-neutral-800 text-white shadow'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoadingNearby && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-neutral-900/60 border border-neutral-800/60 animate-pulse p-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-neutral-800" />
              <div className="w-3/4 h-4 bg-neutral-800 rounded" />
              <div className="w-1/2 h-3 bg-neutral-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoadingNearby && nearbySellers.length === 0 && (
        <div className="p-8 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
          <Store className="w-10 h-10 text-neutral-600 mx-auto" />
          <h4 className="text-base font-semibold text-neutral-200">No active sellers within 20 km</h4>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            We couldn't find any express ateliers near <span className="text-white font-medium">{location.label}</span>. Standard delivery orders are still fulfilled nationwide.
          </p>
          <button
            onClick={promptLocationCapture}
            className="text-xs text-amber-400 hover:underline font-semibold cursor-pointer"
          >
            Try selecting a different area or city
          </button>
        </div>
      )}

      {/* Cards View */}
      {!isLoadingNearby && nearbySellers.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbySellers.map((seller) => (
            <div
              key={seller.id}
              onClick={() => onSelectSeller?.(seller.id, seller.shopName)}
              className="group relative p-4 rounded-2xl bg-neutral-900/80 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-800 border border-neutral-700/80 shrink-0 flex items-center justify-center">
                    {seller.logo ? (
                      <img src={seller.logo} alt={seller.shopName} className="w-full h-full object-cover" />
                    ) : (
                      <Store className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {seller.quickDelivery ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                        <span>⚡ Quick Delivery</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 text-[10px] font-medium">
                        <span>Standard</span>
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-300 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-amber-400" />
                      <span>{seller.etaMin}-{seller.etaMax} min</span>
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {seller.shopName}
                    </h4>
                    {seller.verifiedBadge && (
                      <span
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold shrink-0"
                        title="Admin-Verified Seller (NID & Face Verified)"
                      >
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    {seller.category || 'Luxury Goods & Ateliers'}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300">
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>{seller.distanceKm} km away</span>
                </div>
                {seller.rating && (
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{seller.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View */}
      {!isLoadingNearby && nearbySellers.length > 0 && viewMode === 'map' && (
        <div className="relative w-full h-80 rounded-2xl overflow-hidden border border-neutral-800 shadow-xl">
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Customer Location Marker */}
            <Marker
              position={[location.lat, location.lng]}
              icon={L.divIcon({
                html: `
                  <div style="
                    background-color: #3B82F6;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
                  </div>
                `,
                className: 'customer-pos-pin',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            >
              <Popup>
                <div className="text-xs">
                  <strong>Your Delivery Address</strong>
                  <p className="text-neutral-600 m-0">{location.label}</p>
                </div>
              </Popup>
            </Marker>

            {/* Seller Markers with rounded coordinates */}
            {nearbySellers.map((s) => {
              if (!s.location?.coordinates || s.location.coordinates.length < 2) return null;
              // GeoJSON is [lng, lat]
              const shopLng = s.location.coordinates[0];
              const shopLat = s.location.coordinates[1];
              return (
                <Marker
                  key={s.id}
                  position={[shopLat, shopLng]}
                  icon={shopMarkerIcon}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-1">
                      <div className="font-bold text-neutral-900">{s.shopName}</div>
                      <div className="text-emerald-700 font-semibold">{s.distanceKm} km away</div>
                      {s.quickDelivery && (
                        <div className="text-amber-600 font-bold">⚡ Quick Delivery ({s.etaMin}-{s.etaMax} min)</div>
                      )}
                      <button
                        onClick={() => onSelectSeller?.(s.id, s.shopName)}
                        className="mt-1 block text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Browse Storefront &rarr;
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
};
