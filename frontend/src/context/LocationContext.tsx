import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  savedAt: number;
}

export interface NearbySeller {
  id: string;
  shopName: string;
  logo?: string;
  category?: string;
  distanceKm: number;
  etaMin: number;
  etaMax: number;
  quickDelivery: boolean;
  verifiedBadge?: boolean;
  rating?: number;
  shopAddress?: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface LocationContextType {
  location: UserLocation | null;
  nearbySellers: NearbySeller[];
  hasQuickDelivery: boolean;
  quickDeliveryEta: string | null;
  isLoadingNearby: boolean;
  showLocationModal: boolean;
  setShowLocationModal: (open: boolean) => void;
  setLocation: (loc: UserLocation | null, remember?: boolean) => Promise<void>;
  clearLocation: () => Promise<void>;
  promptLocationCapture: () => void;
  refreshNearby: () => Promise<void>;
}

const STORAGE_KEY = 'alike_user_location';
const PROMPT_SHOWN_KEY = 'alike_location_prompt_seen';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<UserLocation | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
          return parsed;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    return null;
  });

  const [nearbySellers, setNearbySellers] = useState<NearbySeller[]>([]);
  const [hasQuickDelivery, setHasQuickDelivery] = useState(false);
  const [quickDeliveryEta, setQuickDeliveryEta] = useState<string | null>(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Fetch nearby sellers when location changes
  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    setIsLoadingNearby(true);
    try {
      const res = await fetch(`/api/sellers/nearby?lat=${lat}&lng=${lng}&radiusKm=10&limit=30`);
      if (res.ok) {
        const data = await res.json();
        setNearbySellers(data.sellers || []);
        setHasQuickDelivery(Boolean(data.hasQuickDelivery));
        setQuickDeliveryEta(data.quickDeliveryEta || null);
      } else {
        setNearbySellers([]);
        setHasQuickDelivery(false);
        setQuickDeliveryEta(null);
      }
    } catch (err) {
      console.warn('Failed to fetch nearby sellers:', err);
      setNearbySellers([]);
      setHasQuickDelivery(false);
      setQuickDeliveryEta(null);
    } finally {
      setIsLoadingNearby(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearby(location.lat, location.lng);
    } else {
      setNearbySellers([]);
      setHasQuickDelivery(false);
      setQuickDeliveryEta(null);
    }
  }, [location, fetchNearby]);

  // Check if we should prompt new visitors/logged-in users for location
  useEffect(() => {
    if (!location) {
      const seen = sessionStorage.getItem(PROMPT_SHOWN_KEY);
      if (!seen) {
        // Show after 1.5s delay to allow initial page render to settle
        const timer = setTimeout(() => {
          setShowLocationModal(true);
          sessionStorage.setItem(PROMPT_SHOWN_KEY, 'true');
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  const setLocation = async (loc: UserLocation | null, remember = false) => {
    setLocationState(loc);
    if (loc) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      } catch {}

      if (remember) {
        const token = localStorage.getItem('alike_user_token');
        if (token) {
          fetch('/api/auth/profile/location', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ location: loc }),
          }).catch(() => {});
        }
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const clearLocation = async () => {
    setLocationState(null);
    setNearbySellers([]);
    setHasQuickDelivery(false);
    setQuickDeliveryEta(null);
    localStorage.removeItem(STORAGE_KEY);

    const token = localStorage.getItem('alike_user_token');
    if (token) {
      fetch('/api/auth/profile/location', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clear: true }),
      }).catch(() => {});
    }
  };

  const promptLocationCapture = () => {
    setShowLocationModal(true);
  };

  const refreshNearby = async () => {
    if (location) {
      await fetchNearby(location.lat, location.lng);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        nearbySellers,
        hasQuickDelivery,
        quickDeliveryEta,
        isLoadingNearby,
        showLocationModal,
        setShowLocationModal,
        setLocation,
        clearLocation,
        promptLocationCapture,
        refreshNearby,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
