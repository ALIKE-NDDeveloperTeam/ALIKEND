import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import Seller from "../models/Seller";
import Product from "../models/Product";
import { isMongoConnected, memoryStore } from "../store";
import {
  isValidCoordinate,
  calculateDeliveryMetrics,
  sanitizeNearbySeller,
  haversineDistanceKm,
} from "../services/geoService";

const router = Router();

// Rate limiter for public geospatial discovery (60 requests/min per IP)
const nearbyRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Too many nearby search requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.trim()) {
      return xff.split(",")[0].trim();
    }
    return req.ip || "127.0.0.1";
  },
});

/**
 * GET /api/sellers/nearby
 * Query parameters:
 *  - lat: latitude (-90..90)
 *  - lng: longitude (-180..180)
 *  - radiusKm: max distance in km (default 10, max 50)
 *  - limit: max items (default 30, max 50)
 *
 * Privacy guarantee:
 *  - Never logs customer coordinates.
 *  - Never returns sensitive seller credentials (ownerName, email, phone, bank, etc.).
 *  - Rounds shop coordinates to 3 decimals (~100m) for map markers.
 */
router.get("/sellers/nearby", nearbyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { lat, lng, radiusKm = 10, limit = 30 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Query parameters 'lat' and 'lng' are required." });
    }

    const nLat = Number(lat);
    const nLng = Number(lng);
    if (!isValidCoordinate(nLat, nLng)) {
      return res.status(400).json({
        error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
      });
    }

    const maxRadiusKm = Math.min(Math.max(Number(radiusKm) || 10, 1), 50);
    const maxLimit = Math.min(Math.max(Number(limit) || 30, 1), 50);

    let nearbyList: any[] = [];

    // 1. Try MongoDB $geoNear aggregation
    if (isMongoConnected()) {
      try {
        const radiusMeters = maxRadiusKm * 1000;
        const mongoResults = await Seller.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [nLng, nLat],
              },
              distanceField: "distanceMeters",
              maxDistance: radiusMeters,
              spherical: true,
              query: {
                status: "approved",
                isOpen: { $ne: false },
                "location.coordinates": { $exists: true, $ne: [] },
              },
            },
          },
          { $limit: maxLimit },
        ]);

        if (mongoResults && mongoResults.length > 0) {
          nearbyList = mongoResults
            .map((s) => {
              const metrics = calculateDeliveryMetrics(s, nLat, nLng);
              if (!metrics) return null;
              return sanitizeNearbySeller(s, metrics);
            })
            .filter(Boolean);
        }
      } catch (geoErr: any) {
        console.warn("MongoDB $geoNear error, falling back to memoryStore calculation:", geoErr?.message);
      }
    }

    // 2. In-memory fallback (when Mongo not connected or no geo results returned)
    if (nearbyList.length === 0) {
      const allApproved = (memoryStore.sellers || []).filter(
        (s) =>
          s.status === "approved" &&
          s.isOpen !== false &&
          Array.isArray(s.location?.coordinates) &&
          s.location.coordinates.length >= 2
      );

      nearbyList = allApproved
        .map((s) => {
          const metrics = calculateDeliveryMetrics(s, nLat, nLng);
          if (!metrics || metrics.distanceKm > maxRadiusKm) return null;
          return sanitizeNearbySeller(s, metrics);
        })
        .filter(Boolean)
        .sort((a, b) => (a?.distanceKm || 0) - (b?.distanceKm || 0))
        .slice(0, maxLimit);
    }

    // Sort: quick delivery eligible first, then by distance ascending
    nearbyList.sort((a, b) => {
      if (a.quickDelivery && !b.quickDelivery) return -1;
      if (!a.quickDelivery && b.quickDelivery) return 1;
      return a.distanceKm - b.distanceKm;
    });

    const quickEligible = nearbyList.filter((s) => s.quickDelivery);
    const hasQuickDelivery = quickEligible.length > 0;
    const minEta = hasQuickDelivery ? Math.min(...quickEligible.map((s) => s.etaMin)) : 0;
    const maxEta = minEta > 0 ? Math.min(20, minEta + 6) : 0;

    return res.json({
      success: true,
      count: nearbyList.length,
      hasQuickDelivery,
      quickDeliveryEta: hasQuickDelivery ? `${minEta}-${maxEta} min` : null,
      sellers: nearbyList,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to search nearby sellers" });
  }
});

/**
 * GET /api/products/nearby
 * Query parameters:
 *  - lat: latitude
 *  - lng: longitude
 *  - radiusKm: max distance in km (default 10)
 *  - limit: max items (default 50)
 *  - quickDeliveryOnly: 'true' | 'false' (default false)
 */
router.get("/products/nearby", nearbyRateLimiter, async (req: Request, res: Response) => {
  try {
    const { lat, lng, radiusKm = 10, limit = 50, quickDeliveryOnly = "false" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Query parameters 'lat' and 'lng' are required." });
    }

    const nLat = Number(lat);
    const nLng = Number(lng);
    if (!isValidCoordinate(nLat, nLng)) {
      return res.status(400).json({
        error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
      });
    }

    const maxRadiusKm = Math.min(Math.max(Number(radiusKm) || 10, 1), 50);
    const maxLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const isQuickOnly = quickDeliveryOnly === "true";

    // 1. Gather all approved sellers with their metrics
    let sellerMap = new Map<string, any>();

    if (isMongoConnected()) {
      try {
        const sellers = await Seller.find({
          status: "approved",
          isOpen: { $ne: false },
          "location.coordinates": { $exists: true, $ne: [] },
        }).lean();

        for (const s of sellers) {
          const metrics = calculateDeliveryMetrics(s, nLat, nLng);
          if (metrics && metrics.distanceKm <= maxRadiusKm) {
            sellerMap.set(String(s._id), {
              sellerId: String(s._id),
              shopName: s.shopName || s.storefront,
              metrics,
            });
          }
        }
      } catch (e) {
        console.warn("MongoDB sellers query error for nearby products:", e);
      }
    }

    if (sellerMap.size === 0) {
      const memSellers = (memoryStore.sellers || []).filter(
        (s) =>
          s.status === "approved" &&
          s.isOpen !== false &&
          Array.isArray(s.location?.coordinates) &&
          s.location.coordinates.length >= 2
      );
      for (const s of memSellers) {
        const metrics = calculateDeliveryMetrics(s, nLat, nLng);
        if (metrics && metrics.distanceKm <= maxRadiusKm) {
          sellerMap.set(String(s._id), {
            sellerId: String(s._id),
            shopName: s.shopName || s.storefront,
            metrics,
          });
        }
      }
    }

    // 2. Fetch products belonging to these nearby sellers
    const nearbySellerIds = Array.from(sellerMap.keys());
    let prods: any[] = [];

    if (isMongoConnected() && nearbySellerIds.length > 0) {
      try {
        prods = await Product.find({
          sellerId: { $in: nearbySellerIds },
          isHidden: { $ne: true },
          isPublished: { $ne: false },
        }).lean();
      } catch (e) {
        console.warn("MongoDB products query error for nearby products:", e);
      }
    }

    if (prods.length === 0) {
      prods = (memoryStore.products || []).filter(
        (p: any) =>
          p.isHidden !== true &&
          p.isPublished !== false &&
          (nearbySellerIds.length === 0 || nearbySellerIds.includes(String(p.sellerId)))
      );
    }

    // 3. Attach seller distance and quick delivery attributes to each product
    let enriched = prods.map((p) => {
      const sellerInfo = sellerMap.get(String(p.sellerId));
      const metrics = sellerInfo?.metrics;
      const distanceKm = metrics ? metrics.distanceKm : 999;
      const quickDelivery = metrics ? metrics.quickDelivery : false;
      const etaMin = metrics ? metrics.etaMin : 45;
      const etaMax = metrics ? metrics.etaMax : 60;

      return {
        ...p,
        sellerShopName: sellerInfo?.shopName || p.sellerShopName || p.brand || "Atelier",
        distanceKm,
        quickDelivery,
        etaMin,
        etaMax,
        deliveryEtaText: quickDelivery ? `${etaMin}-${etaMax} min` : "Standard delivery",
      };
    });

    if (isQuickOnly) {
      enriched = enriched.filter((p) => p.quickDelivery);
    }

    // Sort by distance ascending
    enriched.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      count: enriched.length,
      products: enriched.slice(0, maxLimit),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to search nearby products" });
  }
});

export default router;
