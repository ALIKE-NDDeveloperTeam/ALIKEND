/**
 * Geospatial, Distance & Delivery Metrics Service
 * Provides Haversine distance, ETA calculations, coordinate validation,
 * and privacy-preserving seller sanitization.
 */

export const SPEED_KMH = 20; // Delivery bike speed in urban areas
export const QUICK_DELIVERY_MAX_KM = Number(process.env.QUICK_DELIVERY_MAX_KM || 3); // Max distance for 10-20 min delivery

/**
 * Validates latitude and longitude strictly.
 * Latitude must be between -90 and 90, longitude between -180 and 180.
 */
export function isValidCoordinate(lat: any, lng: any): boolean {
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (isNaN(nLat) || isNaN(nLng) || !isFinite(nLat) || !isFinite(nLng)) {
    return false;
  }
  return nLat >= -90 && nLat <= 90 && nLng >= -180 && nLng <= 180;
}

/**
 * Great-circle distance using Haversine formula (in kilometers)
 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface SellerDeliveryMetrics {
  distanceKm: number;
  etaMin: number;
  etaMax: number;
  quickDelivery: boolean;
}

/**
 * Server-side computation of delivery metrics and ETA
 */
export function calculateDeliveryMetrics(
  seller: {
    prepTimeMin?: number;
    deliveryRadiusKm?: number;
    quickDeliveryEnabled?: boolean;
    location?: { coordinates?: [number, number] } | any;
  },
  customerLat: number,
  customerLng: number
): SellerDeliveryMetrics | null {
  const coords = seller.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    return null;
  }
  const [sellerLng, sellerLat] = coords;
  if (!isValidCoordinate(sellerLat, sellerLng)) {
    return null;
  }

  const rawDistKm = haversineDistanceKm(customerLat, customerLng, sellerLat, sellerLng);
  const distanceKm = Number(rawDistKm.toFixed(1));

  const prepTime = typeof seller.prepTimeMin === "number" && seller.prepTimeMin >= 2 ? seller.prepTimeMin : 8;
  const deliveryRadius = typeof seller.deliveryRadiusKm === "number" ? seller.deliveryRadiusKm : 5;
  const isQuickEnabled = seller.quickDeliveryEnabled !== false;

  const travelTimeMinutes = (distanceKm / SPEED_KMH) * 60;
  const etaMin = Math.round(prepTime + travelTimeMinutes);
  const etaMax = etaMin + 6;

  // Quick delivery (10-20 min) is available ONLY if:
  // 1. Seller has quick delivery enabled
  // 2. Distance is within min(seller delivery radius, max quick delivery radius)
  // 3. Calculated etaMax does not exceed 20 minutes
  const maxAllowedQuickKm = Math.min(deliveryRadius, QUICK_DELIVERY_MAX_KM);
  const quickDelivery = isQuickEnabled && distanceKm <= maxAllowedQuickKm && etaMax <= 20;

  return {
    distanceKm,
    etaMin,
    etaMax,
    quickDelivery,
  };
}

/**
 * Sanitizes seller data for public nearby listing.
 * Strict privacy rule: NEVER expose ownerName, email, phone, PAN, GSTIN, bank details, or password.
 * Round coordinates to 3 decimals (~100m) for map pin rendering without revealing exact location.
 */
export function sanitizeNearbySeller(seller: any, metrics: SellerDeliveryMetrics) {
  const coords = seller.location?.coordinates || [];
  const roundedCoords =
    coords.length >= 2
      ? [Number(coords[0].toFixed(3)), Number(coords[1].toFixed(3))]
      : undefined;
  const logoImg =
    seller.logo ||
    seller.image ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80";

  const vStatus = seller.verificationStatus || seller.identityVerification?.status || "not_submitted";
  const isVerifiedBadge =
    Boolean(seller.verifiedBadge || seller.identityVerification?.verifiedBadge) && vStatus === "approved";

  return {
    id: String(seller._id || seller.id),
    shopName: seller.shopName || seller.storefront || "Local Boutique",
    logo: logoImg,
    image: logoImg,
    category: seller.category || "Boutique & Retail",
    verifiedBadge: isVerifiedBadge,
    distanceKm: metrics.distanceKm,
    etaMin: metrics.etaMin,
    etaMax: metrics.etaMax,
    etaMinMin: metrics.etaMin,
    etaMinMax: metrics.etaMax,
    quickDelivery: metrics.quickDelivery,
    rating: typeof seller.rating === "number" ? seller.rating : 4.8,
    location: roundedCoords ? { type: "Point", coordinates: roundedCoords } : undefined,
  };
}
