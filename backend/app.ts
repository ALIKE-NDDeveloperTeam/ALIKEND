import express from "express";
import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

import authRoutes from "./routes/auth";
import userAuthRoutes from "./routes/userAuth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import sellerRoutes from "./routes/sellers";
import sellerPortalRoutes from "./routes/sellerPortal";
import customerRoutes from "./routes/customers";
import bannerRoutes from "./routes/banners";
import commissionRoutes, { getActiveCommissionRate } from "./routes/commission";
<<<<<<< HEAD
import { calculateOrderCommissionSnapshot } from "./services/commissionEngine";
=======
<<<<<<< HEAD
import { calculateOrderCommissionSnapshot } from "./services/commissionEngine";
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import flashSaleRoutes from "./routes/flashSale";
import categoryRoutes from "./routes/categories";
import databaseHubRoutes from "./routes/databaseHub";
import customerCareRoutes from "./routes/customerCare";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import returnRoutes from "./routes/returns";
import advertisementRoutes from "./routes/advertisements";
import ridesRoutes from "./routes/rides";
import driverAuthRoutes from "./routes/driverAuth";
import deliveryRoutes from "./routes/delivery";
import deliveryPartnerRoutes from "./routes/deliveryPartner";
import nearbyRoutes from "./routes/nearby";
import orderTrackingRoutes from "./routes/orderTracking";
import adminCentralRoutes from "./routes/adminCentral";
import jwt from "jsonwebtoken";
import { requireAdmin, requireCustomerAuth, CustomerAuthedRequest, ALL_ADMIN_ROLES, getJwtSecret } from "./middleware/auth";
import { connectMongoDB, isMongoConnected, memoryStore, syncDatabaseWithMemory } from "./store";
<<<<<<< HEAD
=======
=======
import { requireAdmin, requireCustomerAuth, CustomerAuthedRequest } from "./middleware/auth";
import { connectMongoDB, isMongoConnected, memoryStore } from "./store";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { startOrderAutomationJob, progressOrderStatuses } from "./services/orderAutomation";
import { dispatchOrderNotificationEmails } from "./services/mailer";
import Product from "./models/Product";
import Order from "./models/Order";
import Banner from "./models/Banner";
import PlatformSetting from "./models/PlatformSetting";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import User from "./models/User";
import Seller from "./models/Seller";
import FlashSale from "./models/FlashSale";
import { PRODUCTS as STATIC_CATALOG_PRODUCTS } from "../src/data/mockData";
import { isValidCoordinate, calculateDeliveryMetrics } from "./services/geoService";
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

dotenv.config({ override: true });

// Initialize MongoDB connection safely with graceful fallback
connectMongoDB()
  .then(() => {
    // Start background order progression scheduler
    startOrderAutomationJob(30000);
  })
  .catch((err) => {
    console.warn("MongoDB initial connection error:", err?.message || err);
    startOrderAutomationJob(30000);
  });

const app = express();
<<<<<<< HEAD
app.set("trust proxy", 1);
=======
<<<<<<< HEAD
app.set("trust proxy", 1);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

// Configurable CORS origins with fallback to local development defaults
const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const envAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));
if (process.env.APP_URL) {
  const cleanAppUrl = process.env.APP_URL.trim();
  if (cleanAppUrl && !allowedOrigins.includes(cleanAppUrl)) {
    allowedOrigins.push(cleanAppUrl);
  }
}

const isOriginAllowed = (origin: string): boolean => {
  if (!origin) return true;
  const clean = origin.replace(/\/$/, "").toLowerCase();

  // Allow localhost / loopback on any port
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
    return true;
  }

  // Allow all Google Cloud Run dev and shared preview environments (*.run.app)
  if (/^https?:\/\/.*\.run\.app$/.test(clean)) {
    return true;
  }

  // Allow Google AI Studio iframe domains
  if (/^https?:\/\/.*\.googleusercontent\.com$/.test(clean) || /^https?:\/\/.*\.google\.com$/.test(clean)) {
    return true;
  }

<<<<<<< HEAD
  // Allow all Vercel deployments (*.vercel.app) and official custom domain (alikend.shop)
  if (/^https?:\/\/.*\.vercel\.app$/.test(clean) || /^https?:\/\/(www\.)?alikend\.shop$/.test(clean)) {
=======
  // Allow all Vercel deployments (*.vercel.app)
  if (/^https?:\/\/.*\.vercel\.app$/.test(clean)) {
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    return true;
  }

  // Allow any explicitly configured origin
  return allowedOrigins.some((allowed) => allowed.replace(/\/$/, "").toLowerCase() === clean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, same-origin) or matching origins
      if (!origin || isOriginAllowed(origin)) {
        return callback(null, true);
      }
      // Silently disallow untrusted third-party origins without throwing a 500 error
      return callback(null, false);
    },
    credentials: true,
  })
);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Prevent container Nginx proxy (which has `proxy_intercept_errors on; error_page 403 = /forbidden.html; error_page 502 503 504 = /warmup.html;`)
// from intercepting Express JSON API error responses and replacing them with raw HTML pages.
app.use("/api", (_req, res, next) => {
  const originalStatus = res.status.bind(res);
  res.status = ((code: number) => {
    if (code === 403) {
      return originalStatus(401);
    }
    if (code === 503) {
      return originalStatus(500);
    }
    return originalStatus(code);
  }) as any;
  next();
});
<<<<<<< HEAD
=======
=======
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

// Health check endpoints for ingress and container probes
app.get(["/api/health", "/health", "/healthz"], (_req, res) => {
  res.json({ status: "ok" });
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// Database & Persistence Diagnostic Endpoint
app.get("/api/db-status", async (_req, res) => {
  const mongoActive = isMongoConnected();
  return res.json({
    status: "ok",
    database: {
      type: "MongoDB / Mongoose",
      connected: mongoActive,
      inMemoryFallbackActive: !mongoActive,
    },
    counts: {
      products: memoryStore.products?.length || 0,
      orders: memoryStore.orders?.length || 0,
      users: memoryStore.users?.length || 0,
      sellers: memoryStore.sellers?.length || 0,
      categories: memoryStore.categories?.length || 0,
      banners: memoryStore.banners?.length || 0,
    },
    timestamp: new Date().toISOString(),
  });
});

// Admin Route to trigger on-demand database <-> in-memory synchronization
app.post("/api/admin/db-sync", requireAdmin, async (_req, res) => {
  try {
    const result = await syncDatabaseWithMemory();
    return res.json({
      success: true,
      message: result.synced
        ? "MongoDB collections successfully synchronized with in-memory store."
        : "Database is in local in-memory fallback mode.",
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Sync failed" });
  }
});

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// Public User Authentication & Registration Routes (MongoDB 'users' collection)
app.use("/api/auth", userAuthRoutes);

// Public & Authenticated Multi-Seller Marketplace Routes (Registration, Login, My Products, Wallet)
app.use(["/api/sellers", "/api/seller"], sellerPortalRoutes);

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// Public & Admin Storefront Products Route (Synced with Super Admin / Admin catalog)
app.get("/api/products", async (req, res) => {
  try {
    let isAdmin = false;
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      try {
        const secret = getJwtSecret();
        if (secret) {
          const payload: any = jwt.verify(header.slice(7), secret);
          if (payload && payload.adminId && ALL_ADMIN_ROLES.includes(payload.role)) {
            isAdmin = true;
          }
        }
      } catch {}
    }

    const rawLat = req.query.nearLat ?? req.query.lat;
    const rawLng = req.query.nearLng ?? req.query.lng;
    const hasCoords = rawLat !== undefined && rawLng !== undefined && isValidCoordinate(rawLat, rawLng);
    const nLat = hasCoords ? Number(rawLat) : 0;
    const nLng = hasCoords ? Number(rawLng) : 0;

    // Build seller lookup map for shop names, verified badge status, and optional distance/quickDelivery metrics
    const sellerInfoMap = new Map<
      string,
      { shopName: string; verifiedBadge: boolean; metrics: ReturnType<typeof calculateDeliveryMetrics> }
    >();
    let allSellers: any[] = [];
    if (isMongoConnected()) {
      try {
        allSellers = await Seller.find({ status: "approved" })
          .select("-password -identityVerification.nidFrontImage -identityVerification.nidBackImage -identityVerification.facePhotoImage -identityVerification.nidNumber")
          .lean();
      } catch {}
    }
    if (!allSellers || allSellers.length === 0) {
      allSellers = (memoryStore.sellers || []).filter((s) => s.status === "approved");
    }
    for (const s of allSellers) {
      const sid = String(s._id || s.id);
      const metrics =
        hasCoords && s.isOpen !== false ? calculateDeliveryMetrics(s, nLat, nLng) : null;
      const vStatus = s.verificationStatus || s.identityVerification?.status || "not_submitted";
      const isVerifiedBadge =
        Boolean(s.verifiedBadge || s.identityVerification?.verifiedBadge) && vStatus === "approved";

      sellerInfoMap.set(sid, {
        shopName: s.shopName || s.storefront || "Atelier",
        verifiedBadge: isVerifiedBadge,
        metrics,
      });
    }

    let prods: any[] = [];
    if (isMongoConnected()) {
      try {
        const filter = isAdmin
          ? {}
          : { isHidden: { $ne: true }, isPublished: { $ne: false }, isDraft: { $ne: true } };
        prods = await Product.find(filter).sort({ createdAt: -1 });
<<<<<<< HEAD
=======
=======
// Public Storefront Products Route (Synced with Super Admin / Admin catalog)
app.get("/api/products", async (_req, res) => {
  try {
    let prods: any[] = [];
    if (isMongoConnected()) {
      try {
        prods = await Product.find().sort({ createdAt: -1 });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      } catch (e) {
        console.warn("MongoDB fetch storefront products fallback:", e);
      }
    }
    if (!prods || prods.length === 0) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      prods = isAdmin
        ? (memoryStore.products || [])
        : (memoryStore.products || []).filter(
            (p: any) => p.isHidden !== true && p.isPublished !== false && p.isDraft !== true
          );
    }

    // Also map memoryStore products by id so seeded sellerId is preserved if DB product had "admin"
    const seedSellerById = new Map<number, { sellerId: string; sellerShopName: string }>();
    for (const mp of memoryStore.products || []) {
      if (mp.id && mp.sellerId && mp.sellerId !== "admin") {
        seedSellerById.set(Number(mp.id), {
          sellerId: String(mp.sellerId),
          sellerShopName: String(mp.sellerShopName || ""),
        });
      }
    }

    const sanitized = prods.map((p: any) => {
      const doc = p && typeof p.toObject === "function" ? p.toObject() : { ...p };
      const seedFallback = doc.id ? seedSellerById.get(Number(doc.id)) : undefined;
      const effectiveSellerId =
        doc.sellerId && doc.sellerId !== "admin"
          ? String(doc.sellerId)
          : seedFallback?.sellerId || doc.sellerId || "admin";
      const sInfo = sellerInfoMap.get(effectiveSellerId);
      const metrics = sInfo?.metrics || null;

      // Never expose private admin-only fields in public customer-facing APIs
      if (!isAdmin) {
        delete doc.costPrice;
        delete doc.internalSearchTags;
        delete doc.projectReference;
        delete doc.inventoryHistory;
        delete doc.changeHistory;
      }

      return {
        ...doc,
        sellerId: effectiveSellerId,
        sellerShopName:
          sInfo?.shopName ||
          doc.sellerShopName ||
          seedFallback?.sellerShopName ||
          (effectiveSellerId === "admin" ? "ALIKE-ND Official" : doc.brand || "Atelier"),
        sellerVerified: Boolean(sInfo?.verifiedBadge),
        distanceKm: metrics ? metrics.distanceKm : undefined,
        quickDelivery: metrics ? metrics.quickDelivery : false,
        etaMin: metrics ? metrics.etaMin : undefined,
        etaMax: metrics ? metrics.etaMax : undefined,
        deliveryEtaText: metrics
          ? metrics.quickDelivery
            ? `${metrics.etaMin}-${metrics.etaMax} min`
            : `${metrics.etaMin}-${metrics.etaMax} min`
          : undefined,
      };
    });

    if (hasCoords && req.query.sort === "nearest") {
      sanitized.sort((a: any, b: any) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    }

<<<<<<< HEAD
=======
=======
      prods = memoryStore.products;
    }
    const sanitized = prods.map((p: any) => {
      const doc = p && typeof p.toObject === "function" ? p.toObject() : { ...p };
      return {
        ...doc,
        sellerId: doc.sellerId || "admin",
        sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : (doc.brand || "Atelier")),
      };
    });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public Hero Carousel Banners Route (Dynamic banners sorted by order, active only)
app.get("/api/banners", async (_req, res) => {
  try {
    let banners: any[] = [];
    if (isMongoConnected()) {
      try {
        banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: 1 });
      } catch (e) {
        console.warn("MongoDB fetch storefront banners fallback:", e);
      }
    }
    if (!banners || banners.length === 0) {
      banners = (memoryStore.banners || []).filter((b) => b.active);
    }
    const sanitized = (banners || []).map((b: any) => {
      const doc = b && typeof b.toObject === "function" ? b.toObject() : { ...b };
      let finalImg = doc.imageUrl || "";
      if (!finalImg || finalImg.includes("photo-1580907115718-4c8abd021ae5")) {
        finalImg = "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80";
      }
      return {
        ...doc,
        imageUrl: finalImg,
        linkUrl: doc.linkUrl || doc.link || "",
        link: doc.link || doc.linkUrl || "",
        isActive: doc.active !== false && doc.isActive !== false,
        active: doc.active !== false && doc.isActive !== false,
        isCenterFeatured: Boolean(doc.isCenterFeatured),
      };
    });
    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Rate limiter to prevent order spam and email flood (Task 5: max 20 requests per 15 minutes per IP)
const orderRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many order requests from this IP address. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public Orders Placement Route (Persists customer orders to MongoDB 'orders' collection)
app.post("/api/orders", orderRateLimiter, async (req, res) => {
  try {
    const {
      items = [],
      address = {},
      paymentMethod = "CARD",
      memberEmail: rawMemberEmail,
<<<<<<< HEAD
      deliveryLocation,
      deliveryType: clientRequestedDeliveryType = "standard",
      deliveryEtaText: clientEtaText,
=======
<<<<<<< HEAD
      deliveryLocation,
      deliveryType: clientRequestedDeliveryType = "standard",
      deliveryEtaText: clientEtaText,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one valid item." });
    }

    if (!address || !address.name || !address.street || !address.city) {
      return res.status(400).json({ error: "Complete delivery address is required." });
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    // Validate deliveryLocation coordinates if provided
    let verifiedDeliveryLocation: { lat: number; lng: number; address?: string } | undefined = undefined;
    if (deliveryLocation && deliveryLocation.lat !== undefined && deliveryLocation.lng !== undefined) {
      if (!isValidCoordinate(deliveryLocation.lat, deliveryLocation.lng)) {
        return res.status(400).json({ error: "Invalid delivery coordinates." });
      }
      verifiedDeliveryLocation = {
        lat: Number(deliveryLocation.lat),
        lng: Number(deliveryLocation.lng),
        address: String(deliveryLocation.address || `${address.street}, ${address.city}`).slice(0, 250),
      };
    }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    // Problem #26: Securely generate collision-resistant order ID on server (do not trust client ID)
    const orderNumber = `ALK-${Date.now().toString().slice(-6)}${crypto.randomInt(100, 999)}`;
    const memberName = String(address.name || "Valued Client").trim();
    const memberEmail = String(address.email || rawMemberEmail || "").trim().toLowerCase();

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    // Backend Restrictions Enforcement (Problem #2)
    if (memberEmail) {
      let orderingUser: any = null;
      if (isMongoConnected()) {
        try {
          orderingUser = await User.findOne({ email: memberEmail }).lean();
        } catch (e) {}
      } else {
        orderingUser = (memoryStore.users || []).find((u) => u.email?.toLowerCase() === memberEmail);
      }

      if (orderingUser) {
        const restrictions = orderingUser.restrictions || {};
        if (restrictions.order_block?.enabled) {
          return res.status(403).json({
            error: `New order placement is restricted on your account. Reason: ${restrictions.order_block.reason || "Administrative restriction"}. Please contact Customer Support.`,
          });
        }

        const isCod = String(paymentMethod).toUpperCase().includes("COD") || String(paymentMethod).toUpperCase().includes("CASH");
        if (isCod && restrictions.cod_block?.enabled) {
          return res.status(403).json({
            error: `Cash on Delivery (COD) is disabled for this account. Reason: ${restrictions.cod_block.reason || "Excessive return/cancellation history"}. Please choose an online payment method.`,
          });
        }

        if (!isCod && restrictions.online_payment_block?.enabled) {
          return res.status(403).json({
            error: `Online payment is restricted for this account. Reason: ${restrictions.online_payment_block.reason || "Administrative restriction"}. Please contact support.`,
          });
        }
      }
    }

    // Strict Server-Side Product & Price Verification (Zero Client Price Fallback)
<<<<<<< HEAD
=======
=======
    // Look up real product prices from DB where possible (Problem #6)
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    const productIds = items
      .map((it: any) => it.product?._id || it.product?.id || it.productId)
      .filter(Boolean);

<<<<<<< HEAD
    const dbProductMap = new Map<string, any>();
=======
<<<<<<< HEAD
    const dbProductMap = new Map<string, any>();
=======
    let dbProductMap = new Map<string, any>();
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (isMongoConnected() && productIds.length > 0) {
      try {
        const found = await Product.find({
          $or: [
            { _id: { $in: productIds.filter((p: any) => typeof p === "string" && p.length === 24) } },
            { id: { $in: productIds.map((p: any) => Number(p)).filter((n: number) => !isNaN(n)) } },
          ],
        }).lean();
        for (const p of found) {
          if (p._id) dbProductMap.set(String(p._id), p);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          if (p.id !== undefined && p.id !== null) dbProductMap.set(String(p.id), p);
        }
      } catch (e) {
        console.warn("Product price verification DB lookup warning:", e);
      }
    }
    for (const mp of memoryStore.products || []) {
      if (mp._id && !dbProductMap.has(String(mp._id))) dbProductMap.set(String(mp._id), mp);
      if (mp.id !== undefined && mp.id !== null && !dbProductMap.has(String(mp.id))) {
        dbProductMap.set(String(mp.id), mp);
      }
    }
    for (const sp of STATIC_CATALOG_PRODUCTS || []) {
      if (sp.id !== undefined && sp.id !== null && !dbProductMap.has(String(sp.id))) {
        dbProductMap.set(String(sp.id), sp);
      }
    }

    // Load active server-side Flash Sale prices (if any) so legitimate flash deals are verified on server
    const flashPriceMap = new Map<string, number>();
    try {
      let flashCfg: any = null;
      if (isMongoConnected()) {
        flashCfg = await FlashSale.findOne().lean();
      }
      if (!flashCfg && memoryStore.flashSaleConfig) {
        flashCfg = memoryStore.flashSaleConfig;
      }
      if (flashCfg && Array.isArray(flashCfg.activeProducts)) {
        const endTime = flashCfg.targetEndTime ? new Date(flashCfg.targetEndTime).getTime() : Date.now() + 3600000;
        if (endTime > Date.now()) {
          for (const fp of flashCfg.activeProducts) {
            const fPrice = Number(fp.flashPrice);
            if (fp.productId && Number.isFinite(fPrice) && fPrice > 0) {
              flashPriceMap.set(String(fp.productId), fPrice);
            }
          }
        }
      }
    } catch {}

    let calculatedSubtotal = 0;
    const itemSellerIds = new Set<string>();
    const requestedQtyByPid = new Map<string, { targetProd: any; totalQty: number; canonicalPid: string }>();
    const formattedItems: Array<{
      productId: any;
      sellerId: string;
      name: string;
      qty: number;
      price: number;
      image: string;
      color: string;
      size: string;
    }> = [];

    for (const it of items) {
      const pid = it.product?._id ?? it.product?.id ?? it.productId ?? null;
      if (pid === null || pid === undefined || String(pid).trim() === "") {
        return res.status(400).json({
          error: "Invalid order item: Product ID is missing. Client-supplied unverified items are not permitted.",
        });
      }

      const pidKey = String(pid).trim();
      const matched = dbProductMap.get(pidKey);
      const memFallback = (memoryStore.products || []).find(
        (mp: any) => String(mp.id) === pidKey || String(mp._id) === pidKey
      );
      const targetProd = matched || memFallback;

      // Reject immediately if product does not exist in server catalog — NEVER fall back to client price
      if (!targetProd) {
        return res.status(400).json({
          error: `Product (ID: "${pidKey}") could not be verified in the official catalog. Order rejected for security.`,
        });
      }

      if (targetProd.isHidden === true || targetProd.isDraft === true || targetProd.isPublished === false) {
        return res.status(400).json({
          error: `Product "${targetProd.name || pidKey}" is currently unavailable for purchase.`,
        });
      }

      const rawQty = Number(it.quantity ?? it.qty ?? 1);
      if (!Number.isFinite(rawQty) || rawQty < 1) {
        return res.status(400).json({
          error: `Invalid quantity requested for "${targetProd.name || pidKey}".`,
        });
      }
      const qty = Math.floor(rawQty);

      const minOrderQty = Number(targetProd.minOrderQty) > 1 ? Number(targetProd.minOrderQty) : 1;
      const maxOrderQty = Number(targetProd.maxOrderQty) > 0 ? Number(targetProd.maxOrderQty) : 500;
      if (qty < minOrderQty || qty > maxOrderQty) {
        return res.status(400).json({
          error: `Quantity for "${targetProd.name}" must be between ${minOrderQty} and ${maxOrderQty}.`,
        });
      }

      // Resolve authoritative price exclusively from server-side product / variant / flash sale records
      let verifiedPrice = Number(targetProd.price);

      // Check if a specific server-side variant applies
      if (Array.isArray(targetProd.variants) && targetProd.variants.length > 0) {
        const reqVariantId = it.variantId || it.variant?.id || it.sku || "";
        const reqColor = String(it.selectedColor || it.color || "").trim().toLowerCase();
        const reqSize = String(it.selectedSize || it.size || "").trim().toLowerCase();

        const matchedVariant = targetProd.variants.find((v: any) => {
          if (reqVariantId && (String(v.id) === String(reqVariantId) || String(v.sku) === String(reqVariantId))) {
            return true;
          }
          if (v.options && typeof v.options === "object") {
            const optVals = Object.values(v.options).map((val: any) => String(val).trim().toLowerCase());
            if (reqColor && reqSize && optVals.includes(reqColor) && optVals.includes(reqSize)) return true;
            if (reqColor && !reqSize && optVals.includes(reqColor)) return true;
            if (reqSize && !reqColor && optVals.includes(reqSize)) return true;
          }
          return false;
        });

        if (matchedVariant) {
          if (matchedVariant.available === false || (typeof matchedVariant.stock === "number" && matchedVariant.stock < qty)) {
            return res.status(400).json({
              error: `Selected variant "${matchedVariant.name || matchedVariant.sku}" for "${targetProd.name}" is out of stock.`,
            });
          }
          const vSpecial = Number(matchedVariant.specialPrice);
          const vBase = Number(matchedVariant.price);
          if (Number.isFinite(vSpecial) && vSpecial > 0 && (!Number.isFinite(vBase) || vSpecial <= vBase)) {
            verifiedPrice = vSpecial;
          } else if (Number.isFinite(vBase) && vBase > 0) {
            verifiedPrice = vBase;
          }
        }
      }

      // Check server-side wholesale pricing tier
      if (
        targetProd.isWholesale &&
        Number(targetProd.wholesalePrice) > 0 &&
        qty >= (Number(targetProd.wholesaleMinQty) || 1)
      ) {
        verifiedPrice = Number(targetProd.wholesalePrice);
      }

      // Check server-side active Flash Sale price
      const flashOverride =
        (targetProd._id ? flashPriceMap.get(String(targetProd._id)) : undefined) ??
        (targetProd.id !== undefined ? flashPriceMap.get(String(targetProd.id)) : undefined);
      if (flashOverride !== undefined && Number.isFinite(flashOverride) && flashOverride > 0) {
        verifiedPrice = flashOverride;
      }

      if (!Number.isFinite(verifiedPrice) || verifiedPrice <= 0) {
        return res.status(400).json({
          error: `Product "${targetProd.name || pidKey}" has an invalid server price configuration and cannot be ordered.`,
        });
      }

      // Accumulate quantity per canonical product to prevent split-line stock bypass
      const canonicalKey = String(targetProd._id || targetProd.id || pidKey);
      const prevEntry = requestedQtyByPid.get(canonicalKey);
      const cumulativeQty = (prevEntry ? prevEntry.totalQty : 0) + qty;
      const availableStock = typeof targetProd.stock === "number" ? targetProd.stock : 25;

      if (targetProd.inStock === false || availableStock < cumulativeQty) {
        return res.status(400).json({
          error: `Insufficient stock for "${targetProd.name || "item"}". Requested: ${cumulativeQty}, Available: ${Math.max(0, availableStock)}.`,
        });
      }

      requestedQtyByPid.set(canonicalKey, {
        targetProd,
        totalQty: cumulativeQty,
        canonicalPid: pidKey,
      });

      calculatedSubtotal += verifiedPrice * qty;

      const resolvedSellerId =
        (targetProd.sellerId && targetProd.sellerId !== "admin" ? String(targetProd.sellerId) : null) ||
        (memFallback?.sellerId && memFallback.sellerId !== "admin" ? String(memFallback.sellerId) : null) ||
        "admin";
      itemSellerIds.add(resolvedSellerId);

      formattedItems.push({
        productId: targetProd.id ?? targetProd._id ?? pid,
        sellerId: resolvedSellerId,
        name: String(targetProd.name || "Luxury Product").trim(),
        qty,
        price: verifiedPrice,
        image: targetProd.image || (Array.isArray(targetProd.images) ? targetProd.images[0] : "") || "",
        color: String(it.selectedColor || it.color || "").slice(0, 60),
        size: String(it.selectedSize || it.size || "").slice(0, 60),
      });
    }

    // Apply stock reservations/deductions across MongoDB and memoryStore only after all items pass validation
    for (const [, entry] of requestedQtyByPid) {
      const availableStock = typeof entry.targetProd.stock === "number" ? entry.targetProd.stock : 25;
      const newStock = Math.max(0, availableStock - entry.totalQty);
      const pidStr = entry.canonicalPid;

      if (isMongoConnected()) {
        try {
          await Product.findOneAndUpdate(
            {
              $or: [
                { id: Number(pidStr) || -1 },
                ...(pidStr.length === 24 ? [{ _id: pidStr }] : []),
              ],
            },
            {
              $set: {
                stock: newStock,
                inStock: newStock > 0,
              },
            }
          );
        } catch {}
      }
      const memP = (memoryStore.products || []).find(
        (mp: any) => String(mp.id) === pidStr || String(mp._id) === pidStr
      );
      if (memP) {
        (memP as any).stock = newStock;
        memP.inStock = newStock > 0;
      }
    }

    // Server-side verification of Quick Delivery (10-20 min) eligibility:
    // NEVER trust the browser's quick-delivery flag. Every item in the order must belong to an approved,
    // open seller whose calculated distance & ETA qualify for Quick Delivery.
    let verifiedDeliveryType: "quick" | "standard" = "standard";
    let verifiedEtaText = "Standard Delivery";

    if (clientRequestedDeliveryType === "quick" && verifiedDeliveryLocation) {
      let allSellersLookup: any[] = [];
      if (isMongoConnected()) {
        try {
          allSellersLookup = await Seller.find({ status: "approved" }).lean();
        } catch {}
      }
      if (!allSellersLookup || allSellersLookup.length === 0) {
        allSellersLookup = (memoryStore.sellers || []).filter((s) => s.status === "approved");
      }
      const sellerMap = new Map<string, any>();
      for (const s of allSellersLookup) {
        sellerMap.set(String(s._id || s.id), s);
      }
      for (const ms of memoryStore.sellers || []) {
        if (ms.status === "approved" && !sellerMap.has(String(ms._id))) {
          sellerMap.set(String(ms._id), ms);
        }
      }

      let allEligibleForQuick = itemSellerIds.size > 0;
      let maxEtaMin = 10;
      let maxEtaMax = 16;

      for (const sid of itemSellerIds) {
        const sellerDoc = sellerMap.get(sid);
        if (!sellerDoc || sellerDoc.isOpen === false) {
          allEligibleForQuick = false;
          break;
        }
        const metrics = calculateDeliveryMetrics(
          sellerDoc,
          verifiedDeliveryLocation.lat,
          verifiedDeliveryLocation.lng
        );
        if (!metrics || !metrics.quickDelivery) {
          allEligibleForQuick = false;
          break;
        }
        if (metrics.etaMin > maxEtaMin) maxEtaMin = metrics.etaMin;
        if (metrics.etaMax > maxEtaMax) maxEtaMax = metrics.etaMax;
      }

      if (allEligibleForQuick) {
        verifiedDeliveryType = "quick";
        verifiedEtaText = `${maxEtaMin}-${Math.min(20, maxEtaMax)} min`;
      }
    } else if (clientEtaText && verifiedDeliveryType === "standard") {
      verifiedEtaText = "Standard Delivery";
    }
<<<<<<< HEAD
=======
=======
          if (p.id) dbProductMap.set(String(p.id), p);
        }
      } catch (e) {
        console.warn("Product price verification warning:", e);
      }
    }

    // Format items with verified or trusted positive price
    let calculatedSubtotal = 0;
    const formattedItems = items.map((it: any) => {
      const pid = it.product?._id || it.product?.id || it.productId || null;
      const matched = pid ? dbProductMap.get(String(pid)) : null;
      const verifiedPrice = matched ? Number(matched.price) : Math.max(0, Number(it.product?.price || it.price || 0));
      const qty = Math.max(1, Math.floor(Number(it.quantity || it.qty || 1)));
      calculatedSubtotal += verifiedPrice * qty;

      return {
        productId: pid,
        name: String(matched?.name || it.product?.name || it.name || "Luxury Product").trim(),
        qty,
        price: verifiedPrice,
        image: it.product?.image || it.image || matched?.image || "",
        color: it.selectedColor || it.color || "",
        size: it.selectedSize || it.size || "",
      };
    });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

    const calculatedTax = Math.round(calculatedSubtotal * 0.18);
    const calculatedDelivery = calculatedSubtotal > 50000 ? 0 : 250;
    const calculatedDiscount = 0;
    const calculatedTotal = calculatedSubtotal + calculatedTax + calculatedDelivery - calculatedDiscount;

    const subtotal = calculatedSubtotal;
    const tax = calculatedTax;
    const delivery = calculatedDelivery;
    const discount = calculatedDiscount;
    const orderTotal = calculatedTotal;

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    const commissionSnapshot = await calculateOrderCommissionSnapshot({
      items: formattedItems,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      tax: calculatedTax,
      delivery: calculatedDelivery,
<<<<<<< HEAD
      productLookupMap: dbProductMap,
=======
      productLookupMap: productMap,
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    });
    const activeCommissionRate = commissionSnapshot.effectiveAverageRate;
    const commissionAmount = commissionSnapshot.totalCommissionAmount;
    const sellerPayout = commissionSnapshot.totalSellerPayout;
<<<<<<< HEAD
=======
=======
    const activeCommissionRate = await getActiveCommissionRate();
    const commissionAmount = Math.round((calculatedTotal * activeCommissionRate) / 100);
    const sellerPayout = Math.max(0, calculatedTotal - commissionAmount);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

    let createdDoc: any = null;
    const nowApprovedAt = new Date();

    if (isMongoConnected()) {
      try {
        createdDoc = await Order.create({
          orderNumber,
          memberName,
          memberEmail,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          userId: String(req.body.userId || ""),
          deliveryLocation: verifiedDeliveryLocation,
          deliveryType: verifiedDeliveryType,
          deliveryEtaText: verifiedEtaText,
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          total: calculatedTotal,
          status: "processing", // Automatically approved on confirmed payment
          items: formattedItems,
          address: {
            name: String(address.name || ""),
            phone: String(address.phone || ""),
            street: String(address.street || ""),
            city: String(address.city || ""),
            state: String(address.state || ""),
            zip: String(address.zip || ""),
          },
          paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
          subtotal: calculatedSubtotal,
          tax: calculatedTax,
          discount: 0,
          delivery: calculatedDelivery,
          trackingStep: 2, // Step 2: Approved / Processing
          approvedAt: nowApprovedAt,
          commissionRate: activeCommissionRate,
          commissionAmount,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          eligibleCommissionAmount: commissionSnapshot.totalEligibleAmount,
          refundedCommissionAmount: 0,
          commissionReversed: false,
          sellerPayout,
          commissionStatus: "pending",
          commissionBreakdown: commissionSnapshot.breakdown,
<<<<<<< HEAD
=======
=======
          sellerPayout,
          commissionStatus: "credited",
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        });
        console.log(`✨ [ORDER PERSISTED & APPROVED] Order ${orderNumber} created in alikendshop.orders for ${memberName}`);

        // Credit to platform balance in MongoDB
        try {
          await PlatformSetting.findOneAndUpdate(
            { key: "commission_settings" },
            {
              $inc: {
                platformBalance: commissionAmount,
                totalCommissionEarned: commissionAmount,
              },
            },
            { upsert: true }
          );
        } catch (setErr) {
          console.warn("MongoDB PlatformSetting balance update notice:", setErr);
        }
      } catch (dbErr: any) {
        console.error("MongoDB order persistence error:", dbErr);
        if (process.env.NODE_ENV === "production") {
          return res.status(500).json({ error: "Failed to persist order to database. Please try again." });
        }
      }
    }

    // Update in-memory platform wallet
    if (memoryStore.platformSettings) {
      memoryStore.platformSettings.platformBalance += commissionAmount;
      memoryStore.platformSettings.totalCommissionEarned += commissionAmount;
    }

    const memoryOrder = {
      _id: createdDoc ? String(createdDoc._id) : `ord_${Date.now()}`,
      orderNumber,
      memberName,
      memberEmail,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      userId: String(req.body.userId || ""),
      deliveryLocation: verifiedDeliveryLocation,
      deliveryType: verifiedDeliveryType,
      deliveryEtaText: verifiedEtaText,
      total: orderTotal,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      discount: calculatedDiscount,
      delivery: calculatedDelivery,
      items: formattedItems,
<<<<<<< HEAD
=======
=======
      total: orderTotal,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      status: "processing" as const,
      trackingStep: 2,
      approvedAt: nowApprovedAt,
      commissionRate: activeCommissionRate,
      commissionAmount,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      eligibleCommissionAmount: commissionSnapshot.totalEligibleAmount,
      refundedCommissionAmount: 0,
      commissionReversed: false,
      sellerPayout,
      commissionStatus: "credited" as const,
      commissionBreakdown: commissionSnapshot.breakdown,
<<<<<<< HEAD
=======
=======
      sellerPayout,
      commissionStatus: "credited" as const,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      paymentMethod: String(paymentMethod || "CARD").toUpperCase(),
      createdAt: new Date(),
    };

    memoryStore.orders.unshift(memoryOrder);

    // Asynchronously dispatch real-time Seller/Admin Order Alert and Customer Confirmation emails
    dispatchOrderNotificationEmails({
      orderNumber,
      id: orderNumber,
      memberName,
      memberEmail,
      total: orderTotal,
      items: formattedItems,
      address,
      paymentMethod,
      subtotal,
      tax,
      discount,
      delivery,
      sellerPayout,
      commissionAmount,
    }).catch((mailErr) => {
      console.warn("Order notification email dispatch notice:", mailErr);
    });

    return res.status(201).json({
      success: true,
      order: createdDoc || {
        ...memoryOrder,
        items: formattedItems,
        address,
        paymentMethod,
        subtotal,
        tax,
        discount,
        delivery,
      },
    });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return res.status(500).json({ error: err.message || "Failed to place order" });
  }
});

// Dedicated Real-time Order Notification Dispatch Route (Protected with requireAdmin to prevent public email spam abuse)
app.post("/api/orders/notify", requireAdmin as any, async (req, res) => {
  try {
    const result = await dispatchOrderNotificationEmails(req.body);
    return res.json(result);
  } catch (err: any) {
    console.error("Manual order notify error:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch order notification" });
  }
});

// Get most recent order details (Protected with requireAdmin to prevent customer data leak)
app.get("/api/orders/latest", requireAdmin as any, async (_req, res) => {
  try {
    await progressOrderStatuses().catch(() => {});
    if (isMongoConnected()) {
      const latest = await Order.findOne().sort({ createdAt: -1 }).lean();
      if (latest) return res.json(latest);
    }
    const latestMem = memoryStore.orders[0];
    return res.json(latestMem || null);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/user - Fetch orders specifically for the logged-in customer (Protected with requireCustomerAuth to prevent IDOR)
app.get("/api/orders/user", requireCustomerAuth as any, async (req: CustomerAuthedRequest, res) => {
  try {
    const verifiedEmail = req.userEmail || req.user?.email;
    if (!verifiedEmail) {
      return res.status(401).json({ success: false, error: "Authentication required to access customer orders" });
    }

    const email = verifiedEmail.toLowerCase().trim();

    // Trigger real-time progression so user sees freshest status on refresh
    await progressOrderStatuses().catch(() => {});

    if (isMongoConnected()) {
      try {
        const userOrders = await Order.find({
          memberEmail: email,
        }).sort({ createdAt: -1 }).lean();

        const formatted = userOrders.map((o: any) => ({
          id: o.orderNumber,
          date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          items: (o.items || []).map((it: any) => ({
            product: {
              id: it.productId || 1,
              name: it.name,
              price: it.price,
              image: it.image || "",
            },
            quantity: it.qty || 1,
            selectedColor: it.color || "",
            selectedSize: it.size || "",
          })),
          subtotal: o.subtotal || 0,
          tax: o.tax || 0,
          discount: o.discount || 0,
          delivery: o.delivery || 0,
          total: o.total || 0,
          status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : "Pending",
          address: o.address || {},
          paymentMethod: o.paymentMethod || "CARD",
          trackingStep: o.trackingStep || 1,
          memberEmail: o.memberEmail,
        }));
        return res.json(formatted);
      } catch (dbErr) {
        console.warn("MongoDB user orders fetch fallback:", dbErr);
      }
    }

    const filteredMem = (memoryStore.orders as any[])
      .filter((o: any) => o.memberEmail && o.memberEmail.toLowerCase() === email)
      .map((o: any) => ({
        id: o.orderNumber,
        date: o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        items: (o.items || []).map((it: any) => ({
          product: {
            id: it.productId || 1,
            name: it.name,
            price: it.price,
            image: it.image || "",
          },
          quantity: it.qty || 1,
          selectedColor: it.color || "",
          selectedSize: it.size || "",
        })),
        subtotal: o.subtotal || 0,
        tax: o.tax || 0,
        discount: o.discount || 0,
        delivery: o.delivery || 0,
        total: o.total || 0,
        status: o.status ? (o.status.charAt(0).toUpperCase() + o.status.slice(1)) : "Pending",
        address: o.address || {},
        paymentMethod: o.paymentMethod || "CARD",
        trackingStep: o.trackingStep || 1,
        memberEmail: o.memberEmail,
      }));
    return res.json(filteredMem);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch user orders" });
  }
});

// Public Flash Sale Route
app.use("/api/flash-sale", flashSaleRoutes);

// MongoDB-backed Admin Panel Routes
app.use("/api/admin", authRoutes);          // POST /api/admin/login
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/sellers", sellerRoutes);
app.use("/api/admin/customers", customerRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/admin/commission", commissionRoutes);
app.use("/api/admin/flash-sale", flashSaleRoutes);
app.use("/api/admin/database-hub", databaseHubRoutes);
app.use("/api/admin/customer-care", customerCareRoutes);
app.use(["/api/hotlines", "/api/support"], customerCareRoutes);
app.use(["/api/categories", "/api/admin/categories"], categoryRoutes);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
app.use(["/api/returns", "/api/admin/returns"], returnRoutes);
app.use(["/api/advertisements", "/api/admin/advertisements"], advertisementRoutes);
app.use(["/api/rides", "/api/admin/rides"], ridesRoutes);
app.use("/api/driver", driverAuthRoutes);
app.use(["/api/delivery", "/api/admin/delivery"], deliveryRoutes);
app.use("/api/delivery-partner", deliveryPartnerRoutes);
app.use("/api", nearbyRoutes);
app.use(["/api/admin/central", "/api/central"], adminCentralRoutes);

// Live Location Tracking Routes (Phase 2)
app.use("/api/orders", orderTrackingRoutes);
app.get("/api/seller/orders/:id/live-location", (req, res, next) => {
  req.url = `/seller/${req.params.id}/live-location`;
  orderTrackingRoutes(req, res, next);
});
app.patch("/api/seller/orders/:id/live-location", (req, res, next) => {
  req.url = `/seller/${req.params.id}/live-location`;
  orderTrackingRoutes(req, res, next);
});
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

// Track Gemini request counts per IP to prevent quota starvation
const geminiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

// API Route for Gemini AI Sovereign Engine (Rate limited and prompt length validated)
app.post("/api/gemini/engine", async (req, res) => {
  try {
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "127.0.0.1";
    const now = Date.now();
    const rateData = geminiRateLimitMap.get(clientIp);

    if (rateData && now < rateData.resetAt) {
      if (rateData.count >= 20) {
        return res.status(429).json({
          error: "Rate limit exceeded for AI Sovereign Engine. Please wait a few moments before trying again.",
        });
      }
      rateData.count += 1;
    } else {
      geminiRateLimitMap.set(clientIp, { count: 1, resetAt: now + 60000 }); // 20 requests per minute
    }

    const { mode, prompt, orderVolume, materialRarity, customizationText, lookbookTheme } = req.body;
    
    // Validate maximum input lengths to prevent prompt injection or billing exhaustion
    if (prompt && String(prompt).length > 2000) {
      return res.status(400).json({ error: "Prompt exceeds maximum allowed length of 2000 characters." });
    }
    if (customizationText && String(customizationText).length > 1000) {
      return res.status(400).json({ error: "Customization text exceeds maximum length of 1000 characters." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required on the server." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    let systemInstruction = "";
    let userPrompt = prompt || "Introduce yourself as the ultimate Alike-ND Sovereign AI Engine.";

    if (mode === "concierge") {
      systemInstruction = `You are the elite AI concierge for Alike-ND. Your tone must be sophisticated, welcoming, and highly professional. Help wholesale buyers with their inquiries, guide them through our luxury collections (like silk, premium knitwear, and bespoke tailoring), and explain our Minimum Order Quantity (MOQ) process. Do not use casual slang; maintain the prestige of a high-end fashion guild. Respond in beautifully formatted markdown with clean bullet points and elegant structure.`;
    } else if (mode === "analyst") {
      systemInstruction = `You are an expert wholesale business analyst for Alike-ND. Your job is to process custom design requests from corporate clients. Evaluate if their requested customization matches our luxury atelier standards. Help calculate bulk pricing tiers based on order volume and material rarity (e.g., Cashmere, Egyptian Cotton), and politely inform them about our production timelines. Be realistic, numerical, precise, and professional. Show cost estimation equations or clear breakdowns. Respond in beautifully structured markdown.`;
      userPrompt = `Process Custom Design Request:
- Customization Details: ${customizationText || "Standard monogram embroidery on cuffs"}
- Target Order Volume: ${orderVolume || 100} units
- Chosen Material / Fabric Rarity: ${materialRarity || "Cashmere"}
- Additional Client Instructions: ${prompt || "None"}`;
    } else if (mode === "copywriter") {
      systemInstruction = `You are the chief creative copywriter for Alike-ND Sovereign Luxury Guild. Write breathtaking, high-end descriptions for our seasonal lookbooks. Focus heavily on heritage craftsmanship, sustainable premium textiles, and the exclusive nature of our wholesale atelier. Use elegant, typography-focused vocabulary that appeals to international fashion houses. Respond in beautiful, evocative, and poetically structured markdown.`;
      userPrompt = `Draft seasonal Lookbook Copy for:
- Collection Theme/Name: ${lookbookTheme || "Autumnal Mist Atelier"}
- Additional Copy Directives: ${prompt || "Emphasize fluid drapes and hand-woven stitching"}`;
    } else {
      systemInstruction = `You are the ultimate AI Engine for Alike-ND — Sovereign Luxury & Wholesale Atelier Guild. 
Your core operational parameters are:
1. TONE: Absolute refinement, elite, and business-focused (strictly no casual language).
2. CLIENTS: High-end international fashion buyers, boutiques, and corporate retail brands.
3. KNOWLEDGE: Expert in heritage craftsmanship, premium fabrics (Mulberry Silk, Cashmere, Velvet), and bulk B2B ordering tiers (MOQ).
4. MISSION: Professionally answer wholesale inquiries, generate high-end lookbook copy, and analyze custom atelier requests based on input metrics.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ result: response.text });
  } catch (err: any) {
    console.error("Gemini Engine error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during generation." });
  }
});

export default app;
