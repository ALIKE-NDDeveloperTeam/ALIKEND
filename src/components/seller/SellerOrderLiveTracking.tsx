import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Radio,
  Truck,
  Store,
  Navigation,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { sellerApi } from '../../services/sellerApi';

interface SellerOrderLiveTrackingProps {
  orderId: string;
  orderNumber?: string;
  orderStatus: string;
  customerName: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function SellerOrderLiveTracking({
  orderId,
  orderNumber,
  orderStatus,
  customerName,
  showToast,
  isLightMode = false,
}: SellerOrderLiveTrackingProps) {
  const [customerSharing, setCustomerSharing] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
    updatedAt: string;
    ageSeconds?: number;
  } | null>(null);
  const [shopLocation, setShopLocation] = useState<{ lat: number; lng: number; shopName: string } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [notSharingReason, setNotSharingReason] = useState<string>('Customer is not currently sharing live location');
  const [loading, setLoading] = useState(true);

  // Seller delivery sharing state
  const [sellerSharing, setSellerSharing] = useState(false);
  const [sellerWatchId, setSellerWatchId] = useState<number | null>(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const shopMarkerRef = useRef<L.Marker | null>(null);
  const sellerMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);

  const isOrderActive = !['Delivered', 'Cancelled', 'delivered', 'cancelled'].includes(orderStatus);

  // 1. Fetch Customer Live Location from Server
  const fetchLiveLocation = useCallback(async () => {
    if (!isOrderActive || document.visibilityState === 'hidden') return;

    try {
      const token = sellerApi.getToken();
      if (!token) return;

      const res = await fetch(`/api/seller/orders/${orderId}/live-location`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setNotSharingReason('Live location access denied or order does not belong to your store.');
        }
        return;
      }

      const data = await res.json();
      if (data.shopLocation) {
        setShopLocation(data.shopLocation);
      }

      if (data.sharing && data.customer) {
        setCustomerSharing(true);
        setCustomerLocation(data.customer);
        if (typeof data.distanceKm === 'number') {
          setDistanceKm(data.distanceKm);
        }

        // Update map markers
        const map = mapInstanceRef.current;
        if (map) {
          // Shop Marker
          if (data.shopLocation?.lat && data.shopLocation?.lng && !shopMarkerRef.current) {
            const shopIcon = L.divIcon({
              className: 'custom-seller-shop-icon',
              html: `
                <div style="background-color: #0F1A3C; color: #F5A623; border: 2px solid #F5A623; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 15px;">
                  🏬
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });
            shopMarkerRef.current = L.marker([data.shopLocation.lat, data.shopLocation.lng], { icon: shopIcon })
              .addTo(map)
              .bindPopup(`<b>Your Store Atelier</b>`);
          }

          // Customer Live Marker
          const custIcon = L.divIcon({
            className: 'custom-seller-customer-icon',
            html: `
              <div style="background-color: #FF007F; color: white; border: 2px solid white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(255,0,127,0.7); animation: bounce 1.5s infinite;">
                📍
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          if (!customerMarkerRef.current) {
            customerMarkerRef.current = L.marker([data.customer.lat, data.customer.lng], { icon: custIcon })
              .addTo(map)
              .bindPopup(`<b>${customerName}</b><br/><span style="font-size:11px;">Live Moving Location</span>`);
          } else {
            customerMarkerRef.current.setLatLng([data.customer.lat, data.customer.lng]);
          }

          // Connecting line
          if (data.shopLocation?.lat && data.shopLocation?.lng) {
            if (lineRef.current) {
              lineRef.current.setLatLngs([
                [data.shopLocation.lat, data.shopLocation.lng],
                [data.customer.lat, data.customer.lng],
              ]);
            } else {
              lineRef.current = L.polyline(
                [
                  [data.shopLocation.lat, data.shopLocation.lng],
                  [data.customer.lat, data.customer.lng],
                ],
                { color: '#FF007F', weight: 2, dashArray: '5, 8' }
              ).addTo(map);
            }

            map.fitBounds(
              L.latLngBounds([
                [data.shopLocation.lat, data.shopLocation.lng],
                [data.customer.lat, data.customer.lng],
              ]),
              { padding: [30, 30], maxZoom: 15 }
            );
          }
        }
      } else {
        setCustomerSharing(false);
        if (data.reason) setNotSharingReason(data.reason);
        if (customerMarkerRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(customerMarkerRef.current);
          customerMarkerRef.current = null;
        }
        if (lineRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(lineRef.current);
          lineRef.current = null;
        }
      }
    } catch (e) {
      // background poll error
    } finally {
      setLoading(false);
    }
  }, [orderId, customerName, isOrderActive]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [28.6315, 77.2167],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      fetchLiveLocation();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        customerMarkerRef.current = null;
        shopMarkerRef.current = null;
        sellerMarkerRef.current = null;
        lineRef.current = null;
      }
    };
  }, [fetchLiveLocation]);

  // 3. Short Polling Interval (6 seconds, paused when hidden)
  useEffect(() => {
    if (!isOrderActive) return;

    const interval = setInterval(fetchLiveLocation, 6000);
    const handleVisChange = () => {
      if (document.visibilityState === 'visible') fetchLiveLocation();
    };
    document.addEventListener('visibilitychange', handleVisChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [fetchLiveLocation, isOrderActive]);

  // 4. Seller Toggle: Share delivery location with customer
  const handleToggleSellerLocationSharing = () => {
    if (sellerSharing) {
      if (sellerWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(sellerWatchId);
        setSellerWatchId(null);
      }
      setSellerSharing(false);
      patchSellerLocation(0, 0, false);
      showToast('Delivery location sharing stopped.', 'info');
      return;
    }

    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSellerSharing(true);
        patchSellerLocation(latitude, longitude, true);
        showToast('Now broadcasting your delivery location to customer!', 'success');

        const wId = navigator.geolocation.watchPosition(
          (wPos) => {
            patchSellerLocation(wPos.coords.latitude, wPos.coords.longitude, true);
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );
        setSellerWatchId(wId);
      },
      (err) => {
        showToast('Location permission denied or GPS unavailable.', 'error');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const patchSellerLocation = async (lat: number, lng: number, sharing: boolean) => {
    try {
      const token = sellerApi.getToken();
      if (!token) return;

      await fetch(`/api/seller/orders/${orderId}/live-location`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lat, lng, sharing }),
      });
    } catch (e) {}
  };

  return (
    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
      {/* Top Bar: Title & Status Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FF007F]/10 text-[#FF007F]">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white block">
              Live Customer Tracking
            </span>
            <span className="text-[10px] text-neutral-400">
              Dispatched order coordination with customer
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customerSharing ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Customer Sharing Live GPS</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              Customer Not Sharing Live GPS
            </span>
          )}

          <button
            type="button"
            onClick={fetchLiveLocation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh location"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row if Customer is Sharing */}
      {customerSharing && customerLocation && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block">Current Distance</span>
            <span className="font-mono font-black text-xs text-[#FF007F]">
              {typeof distanceKm === 'number' ? `${distanceKm} km from atelier` : 'In range'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block">GPS Freshness</span>
            <span className="font-mono font-bold text-xs text-neutral-700 dark:text-neutral-300">
              {typeof customerLocation.ageSeconds === 'number'
                ? `Updated ${customerLocation.ageSeconds}s ago`
                : 'Live Signal'}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[9px] uppercase font-bold text-neutral-400 block">GPS Accuracy</span>
            <span className="font-mono font-bold text-xs text-emerald-500">
              {customerLocation.accuracy ? `±${Math.round(customerLocation.accuracy)}m` : 'High Precision'}
            </span>
          </div>
        </div>
      )}

      {/* When Customer is not sharing: Informational Banner */}
      {!customerSharing && (
        <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-start gap-2.5 text-xs text-neutral-500">
          <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-neutral-700 dark:text-neutral-300 block">
              Customer is not sharing live location
            </span>
            <span className="text-[11px] leading-relaxed block">
              The customer has not opted in to live GPS or the 2-minute activity signal has timed out. Deliver to the verified order destination address.
            </span>
          </div>
        </div>
      )}

      {/* Interactive Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative z-0"
        style={{ minHeight: '220px' }}
      />

      {/* Seller Delivery GPS Broadcast Toggle */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Truck className="w-3.5 h-3.5 text-[#F5A623]" />
          <span>Dispatch Delivery Broadcast:</span>
        </div>

        <button
          type="button"
          onClick={handleToggleSellerLocationSharing}
          disabled={!isOrderActive}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            sellerSharing
              ? 'bg-emerald-500 text-black shadow-xs'
              : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700'
          }`}
        >
          {sellerSharing ? '✓ Sharing Delivery GPS (ON)' : 'Broadcast Driver GPS'}
        </button>
      </div>
    </div>
  );
}
