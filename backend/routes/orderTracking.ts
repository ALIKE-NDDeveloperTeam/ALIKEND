import { Router, Response } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import Order, { IOrder } from "../models/Order";
import Product from "../models/Product";
import Seller from "../models/Seller";
import { isMongoConnected, memoryStore } from "../store";
import { requireCustomerAuth, CustomerAuthedRequest } from "../middleware/auth";
import { requireSellerAuth, SellerAuthedRequest } from "./sellerPortal";
import { isValidCoordinate, haversineDistanceKm } from "../services/geoService";

const router = Router();

// Rate limit: max 12 updates per minute per IP for location updates
const locationUpdateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
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
  message: { error: "Location update rate limit exceeded. Max 12 updates per minute." },
});

/**
 * Finds an order in MongoDB or in-memory fallback by _id or orderNumber
 */
async function findOrderDoc(id: string) {
  if (isMongoConnected()) {
    try {
      let doc = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        doc = await Order.findById(id);
      }
      if (!doc) {
        doc = await Order.findOne({ orderNumber: id });
      }
      if (doc) return doc;
    } catch (e) {}
  }
  const mem = (memoryStore.orders || []).find(
    (o) => o._id === id || o.orderNumber === id || String(o._id) === String(id)
  );
  return mem || null;
}

/**
 * Validates whether the logged-in customer is the owner of the order
 */
function verifyCustomerOwnership(req: CustomerAuthedRequest, order: any): boolean {
  const verifiedEmail = (req.userEmail || req.user?.email || "").toLowerCase().trim();
  const orderEmail = (order.memberEmail || "").toLowerCase().trim();
  if (verifiedEmail && orderEmail && verifiedEmail === orderEmail) {
    return true;
  }
  const userId = req.userId || (req.user as any)?._id;
  if (userId && order.userId && String(userId) === String(order.userId)) {
    return true;
  }
  return false;
}

/**
 * Validates whether the logged-in seller has items in this order
 */
async function verifySellerOwnership(sellerId: string, order: any): Promise<boolean> {
  const items = Array.isArray(order.items) ? order.items : [];
  if (items.some((it: any) => it.sellerId && String(it.sellerId) === String(sellerId))) {
    return true;
  }

  const productIds = items.map((it: any) => it.productId).filter(Boolean);
  if (productIds.length > 0) {
    if (isMongoConnected()) {
      try {
        const found = await Product.findOne({
          _id: { $in: productIds },
          sellerId: String(sellerId),
        });
        if (found) return true;
      } catch (e) {}
    }
    const memFound = (memoryStore.products || []).some(
      (p) =>
        productIds.some((pid) => String(pid) === String(p._id) || String(pid) === String(p.id)) &&
        String(p.sellerId) === String(sellerId)
    );
    if (memFound) return true;
  }

  // Fallback for demo merchant or default single-seller platform
  const memSeller = (memoryStore.sellers || []).find((s) => s._id === sellerId);
  if (memSeller && (memSeller.status === "approved" || memSeller.shopName)) {
    return true;
  }

  return false;
}

/**
 * Resolves seller shop location for the order's seller
 */
async function getSellerShopLocation(order: any): Promise<{ lat: number; lng: number; shopName: string; shopAddress: string } | null> {
  const items = Array.isArray(order.items) ? order.items : [];
  let sellerId = items.find((it: any) => it.sellerId)?.sellerId;

  if (!sellerId && items.length > 0) {
    const pId = items[0].productId;
    if (isMongoConnected() && pId) {
      try {
        const pDoc = await Product.findById(pId).lean();
        if (pDoc?.sellerId) sellerId = pDoc.sellerId;
      } catch (e) {}
    }
    if (!sellerId && pId) {
      const pMem = (memoryStore.products || []).find((p) => String(p._id) === String(pId) || String(p.id) === String(pId));
      if (pMem?.sellerId) sellerId = pMem.sellerId;
    }
  }

  let sellerDoc: any = null;
  if (sellerId && isMongoConnected()) {
    try {
      sellerDoc = await Seller.findById(sellerId).lean();
    } catch (e) {}
  }
  if (!sellerDoc && sellerId) {
    sellerDoc = (memoryStore.sellers || []).find((s) => s._id === sellerId);
  }
  if (!sellerDoc && (memoryStore.sellers || []).length > 0) {
    sellerDoc = (memoryStore.sellers || [])[0];
  }

  if (sellerDoc) {
    const coords = sellerDoc.location?.coordinates;
    const lat = Array.isArray(coords) && coords.length >= 2 ? coords[1] : 28.6315;
    const lng = Array.isArray(coords) && coords.length >= 2 ? coords[0] : 77.2167;
    return {
      lat,
      lng,
      shopName: sellerDoc.shopName || sellerDoc.storefront || "ALIKE Atelier",
      shopAddress: sellerDoc.shopAddress || sellerDoc.businessAddress || "Connaught Place, New Delhi",
    };
  }

  // Default Delhi atelier coordinates if seller record not attached
  return {
    lat: 28.6315,
    lng: 77.2167,
    shopName: "ALIKE Atelier & Fulfillment Terminal",
    shopAddress: "Inner Circle, Connaught Place, New Delhi 110001",
  };
}

// =========================================================================
// 1. PATCH /api/orders/:id/live-location/customer
// Customer updates their live location (or opts out/stops sharing)
// =========================================================================
router.patch(
  "/:id/live-location/customer",
  requireCustomerAuth as any,
  locationUpdateLimiter,
  async (req: CustomerAuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { lat, lng, accuracy, sharing } = req.body;

      const order = await findOrderDoc(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!verifyCustomerOwnership(req, order)) {
        return res.status(403).json({ error: "Unauthorized: You can only update live location for your own orders." });
      }

      const statusLower = (order.status || "").toLowerCase();
      const isActive = ["pending", "processing", "shipped"].includes(statusLower);
      if (!isActive) {
        return res.status(400).json({
          error: "Live tracking is disabled because this order has ended (Delivered or Cancelled).",
        });
      }

      // If opting out / stopping sharing
      if (sharing === false) {
        if (order.liveTracking?.customer) {
          order.liveTracking.customer.sharing = false;
        }
        if (isMongoConnected() && (order as any).save) {
          await (order as any).save();
        }
        return res.json({ success: true, sharing: false });
      }

      // Validating coordinates
      if (!isValidCoordinate(lat, lng)) {
        return res.status(400).json({
          error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
        });
      }

      const numLat = Number(lat);
      const numLng = Number(lng);
      const numAcc = accuracy !== undefined ? Number(accuracy) : undefined;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 120000); // 2 minutes TTL

      if (!order.liveTracking) {
        order.liveTracking = {};
      }

      // Overwrite latest point only - strictly NO coordinate history trail
      order.liveTracking.customer = {
        lat: numLat,
        lng: numLng,
        accuracy: numAcc,
        updatedAt: now,
        sharing: true,
      };
      order.liveTracking.expiresAt = expiresAt;

      if (isMongoConnected() && (order as any).save) {
        await (order as any).save();
      }

      return res.json({
        success: true,
        sharing: true,
        updatedAt: now.toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update customer live location" });
    }
  }
);

// =========================================================================
// 2. GET /api/orders/:id/live-location/seller
// Customer queries the seller's live moving location
// =========================================================================
router.get(
  "/:id/live-location/seller",
  requireCustomerAuth as any,
  async (req: CustomerAuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const order = await findOrderDoc(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!verifyCustomerOwnership(req, order)) {
        return res.status(403).json({ error: "Unauthorized: You can only view tracking for your own orders." });
      }

      const statusLower = (order.status || "").toLowerCase();
      const isActive = ["pending", "processing", "shipped"].includes(statusLower);
      const shopInfo = await getSellerShopLocation(order);

      if (!isActive) {
        return res.json({
          sharing: false,
          active: false,
          shopLocation: shopInfo,
          message: "Order has completed. Live delivery tracking is ended.",
        });
      }

      const sellerPoint = order.liveTracking?.seller;
      const isSharing = Boolean(sellerPoint?.sharing);
      const updatedAtTime = sellerPoint?.updatedAt ? new Date(sellerPoint.updatedAt).getTime() : 0;
      const isFresh = Date.now() - updatedAtTime <= 120000; // Under 2 minutes

      if (isSharing && isFresh && sellerPoint) {
        let distanceKm: number | null = null;
        if (order.deliveryLocation?.lat && order.deliveryLocation?.lng) {
          distanceKm = Number(
            haversineDistanceKm(sellerPoint.lat, sellerPoint.lng, order.deliveryLocation.lat, order.deliveryLocation.lng).toFixed(2)
          );
        } else if (order.liveTracking?.customer?.lat && order.liveTracking?.customer?.lng) {
          distanceKm = Number(
            haversineDistanceKm(sellerPoint.lat, sellerPoint.lng, order.liveTracking.customer.lat, order.liveTracking.customer.lng).toFixed(2)
          );
        }

        const ageSeconds = Math.max(0, Math.floor((Date.now() - updatedAtTime) / 1000));

        return res.json({
          sharing: true,
          sellerLive: {
            lat: sellerPoint.lat,
            lng: sellerPoint.lng,
            updatedAt: sellerPoint.updatedAt,
            ageSeconds,
          },
          shopLocation: shopInfo,
          distanceKm,
        });
      }

      return res.json({
        sharing: false,
        shopLocation: shopInfo,
        reason: isSharing ? "Seller location update is stale (> 2 min)" : "Seller is not currently sharing live delivery location",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to fetch seller live location" });
    }
  }
);

// =========================================================================
// 3. GET /api/orders/:id/tracking
// Full customer order tracking status payload with shop and live data
// =========================================================================
router.get(
  "/:id/tracking",
  requireCustomerAuth as any,
  async (req: CustomerAuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const order = await findOrderDoc(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (!verifyCustomerOwnership(req, order)) {
        return res.status(403).json({ error: "Unauthorized: You can only view tracking for your own orders." });
      }

      const shopInfo = await getSellerShopLocation(order);
      const custPoint = order.liveTracking?.customer;
      const sellerPoint = order.liveTracking?.seller;

      const custSharing = Boolean(custPoint?.sharing);
      const custFresh = custPoint?.updatedAt ? Date.now() - new Date(custPoint.updatedAt).getTime() <= 120000 : false;

      const sellerSharing = Boolean(sellerPoint?.sharing);
      const sellerFresh = sellerPoint?.updatedAt ? Date.now() - new Date(sellerPoint.updatedAt).getTime() <= 120000 : false;

      let distanceKm: number | null = null;
      if (shopInfo) {
        const destLat = custPoint?.lat || order.deliveryLocation?.lat;
        const destLng = custPoint?.lng || order.deliveryLocation?.lng;
        if (destLat && destLng) {
          distanceKm = Number(haversineDistanceKm(shopInfo.lat, shopInfo.lng, destLat, destLng).toFixed(2));
        }
      }

      return res.json({
        orderNumber: order.orderNumber,
        status: order.status,
        trackingStep: order.trackingStep || 2,
        deliveryType: order.deliveryType || "standard",
        deliveryEtaText: order.deliveryEtaText || "Arriving in 15-25 Mins",
        deliveryLocation: order.deliveryLocation || null,
        shop: shopInfo,
        distanceKm,
        liveTracking: {
          customerSharing: custSharing && custFresh,
          sellerSharing: sellerSharing && sellerFresh,
          sellerPoint: sellerSharing && sellerFresh ? sellerPoint : null,
          customerPoint: custSharing && custFresh ? custPoint : null,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to load tracking data" });
    }
  }
);

// =========================================================================
// 4. GET /api/seller/orders/:id/live-location
// Seller queries customer's live moving location
// =========================================================================
router.get(
  "/seller/:id/live-location",
  requireSellerAuth as any,
  async (req: SellerAuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const sellerId = req.sellerId!;

      const order = await findOrderDoc(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const ownsItem = await verifySellerOwnership(sellerId, order);
      if (!ownsItem) {
        return res.status(403).json({ error: "Unauthorized: You may only view tracking for orders containing your products." });
      }

      const statusLower = (order.status || "").toLowerCase();
      const isActive = ["pending", "processing", "shipped"].includes(statusLower);
      if (!isActive) {
        return res.status(400).json({
          sharing: false,
          reason: "Order is completed (Delivered/Cancelled). Live tracking is closed.",
        });
      }

      const custPoint = order.liveTracking?.customer;
      const isSharing = Boolean(custPoint?.sharing);
      const updatedAtTime = custPoint?.updatedAt ? new Date(custPoint.updatedAt).getTime() : 0;
      const isFresh = Date.now() - updatedAtTime <= 120000; // Under 2 minutes

      const shopInfo = await getSellerShopLocation(order);

      if (isSharing && isFresh && custPoint) {
        let distanceKm: number | null = null;
        if (shopInfo) {
          distanceKm = Number(haversineDistanceKm(shopInfo.lat, shopInfo.lng, custPoint.lat, custPoint.lng).toFixed(2));
        }

        const ageSeconds = Math.max(0, Math.floor((Date.now() - updatedAtTime) / 1000));

        return res.json({
          sharing: true,
          customer: {
            lat: custPoint.lat,
            lng: custPoint.lng,
            accuracy: custPoint.accuracy,
            updatedAt: custPoint.updatedAt,
            ageSeconds,
          },
          shopLocation: shopInfo,
          distanceKm,
          orderStatus: order.status,
        });
      }

      return res.json({
        sharing: false,
        shopLocation: shopInfo,
        reason: isSharing ? "Customer location update is stale (> 2 min)" : "Customer is not currently sharing live location",
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to fetch customer live location" });
    }
  }
);

// =========================================================================
// 5. PATCH /api/seller/orders/:id/live-location
// Seller opts in to share their delivery moving location
// =========================================================================
router.patch(
  "/seller/:id/live-location",
  requireSellerAuth as any,
  locationUpdateLimiter,
  async (req: SellerAuthedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const sellerId = req.sellerId!;
      const { lat, lng, sharing } = req.body;

      const order = await findOrderDoc(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const ownsItem = await verifySellerOwnership(sellerId, order);
      if (!ownsItem) {
        return res.status(403).json({ error: "Unauthorized: You can only update live delivery for your own orders." });
      }

      const statusLower = (order.status || "").toLowerCase();
      const isActive = ["pending", "processing", "shipped"].includes(statusLower);
      if (!isActive) {
        return res.status(400).json({
          error: "Order is completed (Delivered/Cancelled). Live tracking is closed.",
        });
      }

      if (sharing === false) {
        if (order.liveTracking?.seller) {
          order.liveTracking.seller.sharing = false;
        }
        if (isMongoConnected() && (order as any).save) {
          await (order as any).save();
        }
        return res.json({ success: true, sharing: false });
      }

      if (!isValidCoordinate(lat, lng)) {
        return res.status(400).json({
          error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
        });
      }

      const numLat = Number(lat);
      const numLng = Number(lng);
      const now = new Date();

      if (!order.liveTracking) {
        order.liveTracking = {};
      }

      // Overwrite latest point only
      order.liveTracking.seller = {
        lat: numLat,
        lng: numLng,
        updatedAt: now,
        sharing: true,
      };

      if (isMongoConnected() && (order as any).save) {
        await (order as any).save();
      }

      return res.json({
        success: true,
        sharing: true,
        updatedAt: now.toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Failed to update seller live location" });
    }
  }
);

export default router;
