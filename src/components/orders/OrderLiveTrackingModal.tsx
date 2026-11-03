import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Radio,
  Clock,
  Store,
  Truck,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import GlassCloseButton from '../GlassCloseButton';
import { Order } from '../../types';

interface OrderLiveTrackingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export default function OrderLiveTrackingModal({
  order,
  isOpen,
  onClose,
  showToast,
  isLightMode = false,
}: OrderLiveTrackingModalProps) {
  // Tracking & Location States
  const [isSharingCustomerLocation, setIsSharingCustomerLocation] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastCustomerUpdate, setLastCustomerUpdate] = useState<Date | null>(null);

  // Seller Data
  const [sellerLivePoint, setSellerLivePoint] = useState<{ lat: number; lng: number; ageSeconds?: number } | null>(null);
  const [sellerSharing, setSellerSharing] = useState(false);
  const [shopLocation, setShopLocation] = useState<{ lat: number; lng: number; shopName: string; shopAddress: string } | null>(null);
  const [liveDistanceKm, setLiveDistanceKm] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>(order.status || 'Processing');
  const [pollingActive, setPollingActive] = useState(true);

  // Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const sellerMarkerRef = useRef<L.Marker | null>(null);
  const shopMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Geolocation watch ref & throttle timer
  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);
  const isComponentMounted = useRef<boolean>(true);

  const orderId = order.id || (order as any).orderNumber;
  const isOrderActive = !['Delivered', 'Cancelled', 'delivered', 'cancelled'].includes(orderStatus);

  // Auth token helper
  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('alike_user_token') : null;
  };

  // 1. Initial Leaflet Map Setup
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is painted
    const initTimer = setTimeout(() => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const initialLat = order.deliveryLocation?.lat || 28.6315;
      const initialLng = order.deliveryLocation?.lng || 77.2167;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        customerMarkerRef.current = null;
        sellerMarkerRef.current = null;
        shopMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, [isOpen, order]);

  // 2. Poll Seller Location & Tracking Data (Short polling 6 seconds, paused when hidden)
  const fetchTrackingData = useCallback(async () => {
    if (!isOpen || !isOrderActive || document.visibilityState === 'hidden') {
      return;
    }

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${orderId}/tracking`, { headers });
      if (!res.ok) return;

      const data = await res.json();
      if (!data) return;

      if (data.status) setOrderStatus(data.status);
      if (data.shop) setShopLocation(data.shop);
      if (typeof data.distanceKm === 'number') setLiveDistanceKm(data.distanceKm);

      if (data.liveTracking?.sellerSharing && data.liveTracking?.sellerPoint) {
        setSellerSharing(true);
        setSellerLivePoint({
          lat: data.liveTracking.sellerPoint.lat,
          lng: data.liveTracking.sellerPoint.lng,
        });
      } else {
        setSellerSharing(false);
      }

      // Update map markers
      const map = mapInstanceRef.current;
      if (map) {
        const bounds: L.LatLngExpression[] = [];

        // Shop Marker
        if (data.shop?.lat && data.shop?.lng) {
          bounds.push([data.shop.lat, data.shop.lng]);
          const shopIcon = L.divIcon({
            className: 'custom-shop-pin',
            html: `
              <div style="background-color: #0F1A3C; color: #F5A623; border: 2px solid #F5A623; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.4); font-size: 16px;">
                🏬
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          if (!shopMarkerRef.current) {
            shopMarkerRef.current = L.marker([data.shop.lat, data.shop.lng], { icon: shopIcon })
              .addTo(map)
              .bindPopup(`<b>${data.shop.shopName || 'Store Atelier'}</b><br/><span style="font-size:11px;">${data.shop.shopAddress || ''}</span>`);
          } else {
            shopMarkerRef.current.setLatLng([data.shop.lat, data.shop.lng]);
          }
        }

        // Seller Moving Delivery Marker
        if (data.liveTracking?.sellerSharing && data.liveTracking?.sellerPoint) {
          const sLat = data.liveTracking.sellerPoint.lat;
          const sLng = data.liveTracking.sellerPoint.lng;
          bounds.push([sLat, sLng]);

          const sellerIcon = L.divIcon({
            className: 'custom-delivery-pin',
            html: `
              <div style="background-color: #10B981; color: white; border: 2px solid white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(16,185,129,0.7); animation: pulse 2s infinite;">
                🛵
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          if (!sellerMarkerRef.current) {
            sellerMarkerRef.current = L.marker([sLat, sLng], { icon: sellerIcon })
              .addTo(map)
              .bindPopup('<b>Seller Delivery Partner</b><br/><span style="font-size:11px;">En Route</span>');
          } else {
            sellerMarkerRef.current.setLatLng([sLat, sLng]);
          }
        }

        if (bounds.length > 0 && !customerMarkerRef.current) {
          map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
        }
      }
    } catch (err) {
      // Graceful background poll fallback
    }
  }, [isOpen, orderId, isOrderActive]);

  useEffect(() => {
    if (!isOpen || !isOrderActive) return;

    fetchTrackingData();
    const pollInterval = setInterval(() => {
      fetchTrackingData();
    }, 6000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTrackingData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen, isOrderActive, fetchTrackingData]);

  // 3. Send Customer Location Update (Throttled to 10-15s)
  const sendCustomerLocationToServer = async (lat: number, lng: number, accuracy?: number, isSharing: boolean = true) => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${orderId}/live-location/customer`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          lat,
          lng,
          accuracy,
          sharing: isSharing,
        }),
      });

      if (res.ok) {
        lastSentTimeRef.current = Date.now();
        setLastCustomerUpdate(new Date());
      }
    } catch (e) {
      // Suppress network jitter
    }
  };

  // 4. Opt-in Toggle Handler for Customer GPS
  const handleToggleCustomerSharing = () => {
    if (isSharingCustomerLocation) {
      // STOP SHARING
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharingCustomerLocation(false);
      sendCustomerLocationToServer(0, 0, undefined, false);
      if (customerMarkerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(customerMarkerRef.current);
        customerMarkerRef.current = null;
      }
      showToast('Live location sharing stopped.', 'info');
      return;
    }

    // START SHARING: Check browser support
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setGpsError(null);
    setPermissionDenied(false);

    // Initial position request with explicit user opt-in
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setIsSharingCustomerLocation(true);
        updateCustomerMarkerOnMap(latitude, longitude);
        sendCustomerLocationToServer(latitude, longitude, accuracy, true);
        showToast('Live location sharing is now active with the seller!', 'success');

        // Start watchPosition throttled to 12s
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const now = Date.now();
            const wLat = watchPos.coords.latitude;
            const wLng = watchPos.coords.longitude;
            const wAcc = watchPos.coords.accuracy;

            updateCustomerMarkerOnMap(wLat, wLng);

            // Throttle network dispatch to at least 12 seconds
            if (now - lastSentTimeRef.current >= 12000) {
              sendCustomerLocationToServer(wLat, wLng, wAcc, true);
            }
          },
          (err) => {
            console.warn('Geolocation watch notice:', err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 15000,
          }
        );
      },
      (err) => {
        if (err.code === 1) {
          setPermissionDenied(true);
          setGpsError('Location permission was denied. You can still track your order using the delivery address.');
          showToast('Location permission denied. Please allow location access in your browser settings to share your live pin.', 'warning');
        } else {
          setGpsError('Unable to acquire GPS signal. Please check device location settings.');
          showToast('Could not acquire GPS position.', 'error');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      }
    );
  };

  // Helper to place/move customer pin on map
  const updateCustomerMarkerOnMap = (lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const customerIcon = L.divIcon({
      className: 'custom-customer-pin',
      html: `
        <div style="background-color: #FF007F; color: white; border: 2px solid white; border-radius: 9999px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px rgba(255,0,127,0.8); animation: bounce 1.5s infinite;">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker([lat, lng], { icon: customerIcon })
        .addTo(map)
        .bindPopup('<b>You (Delivery Destination)</b>');
    } else {
      customerMarkerRef.current.setLatLng([lat, lng]);
    }

    // If shop exists, draw polyline
    if (shopLocation?.lat && shopLocation?.lng) {
      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          [shopLocation.lat, shopLocation.lng],
          [lat, lng],
        ]);
      } else {
        routeLineRef.current = L.polyline(
          [
            [shopLocation.lat, shopLocation.lng],
            [lat, lng],
          ],
          {
            color: '#FF007F',
            weight: 3,
            dashArray: '6, 8',
            opacity: 0.7,
          }
        ).addTo(map);
      }
    }
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl transition-all ${
          isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-neutral-950 border-neutral-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF007F] to-rose-400 text-white flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-black text-base sm:text-lg uppercase tracking-wider">
                  Live Delivery & Seller Tracking
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF007F]/10 text-[#FF007F] border border-[#FF007F]/20">
                  Order #{orderId}
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Real-time dispatch coordination with OpenStreetMap
              </p>
            </div>
          </div>

          <GlassCloseButton onClick={onClose} size="md" title="Close Live Tracking" />
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* 1. Live Status & Distance Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Status */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Status</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {orderStatus}
                </span>
              </div>
            </div>

            {/* Distance */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#F5A623]/10 text-[#F5A623]">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Atelier Distance</span>
                <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                  {typeof liveDistanceKm === 'number' ? `${liveDistanceKm} km away` : 'Calculating...'}
                </span>
              </div>
            </div>

            {/* Seller Live Status */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${sellerSharing ? 'bg-sky-500/10 text-sky-500 animate-pulse' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'}`}>
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Seller Live GPS</span>
                <span className={`text-xs font-bold ${sellerSharing ? 'text-sky-500' : 'text-neutral-400'}`}>
                  {sellerSharing ? 'Broadcasting Live' : 'Atelier Fixed Pin'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. CUSTOMER OPT-IN PRIVACY CARD (Phase 2 Requirement) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-[#FF007F]/30 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FF007F]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
                    Share my live location with the seller until my order is delivered
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 leading-snug">
                  Default is <strong>OFF</strong>. When enabled, your moving GPS coordinates are shared exclusively with the seller fulfilling this active order. No location history is saved. Sharing automatically revokes when delivered.
                </p>
              </div>

              {/* Status Indicator & Action Toggle */}
              <div className="flex items-center gap-2 shrink-0">
                {isSharingCustomerLocation ? (
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>SHARING ON</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleToggleCustomerSharing}
                      className="px-3.5 py-1.5 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer border border-neutral-300 dark:border-neutral-700"
                    >
                      Stop Sharing
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleToggleCustomerSharing}
                    disabled={!isOrderActive}
                    className="px-4 py-2 rounded-xl bg-[#FF007F] hover:bg-[#D80068] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Enable Live GPS
                  </button>
                )}
              </div>
            </div>

            {/* Error or Denied Notice */}
            {permissionDenied && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Location access was blocked. Your delivery address (<strong>{order.address?.street}, {order.address?.city}</strong>) will be used for delivery without live tracking.
                </span>
              </div>
            )}

            {lastCustomerUpdate && isSharingCustomerLocation && (
              <div className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>Last updated with seller: {lastCustomerUpdate.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {/* 3. LEAFLET INTERACTIVE MAP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>{shopLocation?.shopName || 'Store Atelier'} • {shopLocation?.shopAddress || 'Delhi Fulfillment Center'}</span>
              </span>
              <span className="font-mono text-[10px]">OpenStreetMap Live Canvas</span>
            </div>

            <div
              ref={mapContainerRef}
              className="w-full h-80 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 relative shadow-inner z-0"
              style={{ minHeight: '320px' }}
            />
          </div>

          {/* 4. Map Legend & Privacy Safeguards */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#0F1A3C] border border-[#F5A623]"></span>
                <span className="text-neutral-600 dark:text-neutral-300">Seller Shop / Terminal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#FF007F]"></span>
                <span className="text-neutral-600 dark:text-neutral-300">Your Live Position</span>
              </span>
              {sellerSharing && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-neutral-600 dark:text-neutral-300">Seller Live Delivery Partner</span>
                </span>
              )}
            </div>

            <span className="text-[10px] text-neutral-400 font-mono">
              🔒 TLS Encrypted • 2-Min TTL Cache
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
