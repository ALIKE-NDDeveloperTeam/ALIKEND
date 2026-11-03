import { Router } from "express";
import Product from "../models/Product";
<<<<<<< HEAD
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";
=======
<<<<<<< HEAD
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";
=======
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

const router = Router();
router.use(requireAdmin);

// GET /api/admin/products
router.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const products = await Product.find().sort({ createdAt: -1 });
        if (products && products.length > 0) {
          const sanitized = products.map((p) => {
            const doc = p.toObject();
            return {
              ...doc,
              sellerId: doc.sellerId || "admin",
              sellerShopName: doc.sellerShopName || (doc.sellerId === "admin" || !doc.sellerId ? "ALIKE-ND Official" : (doc.brand || "Atelier")),
            };
          });
          return res.json(sanitized);
        }
      } catch (err) {
        console.warn("MongoDB fetch products failed, using in-memory store:", err);
      }
    }
    const sanitizedMem = memoryStore.products.map((p) => ({
      ...p,
      sellerId: p.sellerId || "admin",
      sellerShopName: p.sellerShopName || "ALIKE-ND Official",
    }));
    return res.json(sanitizedMem);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch products" });
  }
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// Helper to sanitize rich HTML description against XSS / script injection
function sanitizeRichHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript\s*:/gi, "");
}

// POST /api/admin/products/upload-media
router.post("/upload-media", async (req: AuthedRequest, res) => {
  try {
    const { dataUrl, fileName = "product-media", mimeType = "image/jpeg", mediaType = "image" } = req.body;
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Media dataUrl or URL is required" });
    }
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (mediaType === "image" && dataUrl.startsWith("data:") && !allowedImageTypes.some((t) => dataUrl.startsWith(`data:${t}`))) {
      return res.status(400).json({ error: "Unsupported image format. Allowed formats: JPG, PNG, WebP." });
    }
    if (mediaType === "video" && dataUrl.startsWith("data:") && !allowedVideoTypes.some((t) => dataUrl.startsWith(`data:${t}`))) {
      return res.status(400).json({ error: "Unsupported video format. Allowed formats: MP4, WebM." });
    }
    // Check approximate base64 payload size (max ~8MB)
    if (dataUrl.length > 11 * 1024 * 1024) {
      return res.status(400).json({ error: "File exceeds maximum allowed size (8MB)." });
    }
    return res.json({
      success: true,
      url: dataUrl,
      fileName,
      mimeType,
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Media upload validation failed" });
  }
});

// POST /api/admin/products
router.post("/", async (req: AuthedRequest, res) => {
  try {
    const body = req.body || {};
    const isDraft = Boolean(body.isDraft);
    const {
      name = "",
      localizedName = "",
      brand = "Alike Sovereign",
      category = "fashion",
      subCategory = "",
      nestedCategory = "",
      audience = "unisex",
      productType = "physical",
      condition = "new",
      modelNumber = "",
      internalProductId = "",
      internalSearchTags = [],
      projectReference = "",
      seoTitle = "",
      seoDescription = "",
      seoKeywords = [],
      tags = [],
      eligibleFor20MinDelivery,
      price = 0,
      mrp,
      costPrice = 0,
      saleStartDate = "",
      saleEndDate = "",
      minOrderQty = 1,
      maxOrderQty = 50,
      bundleInfo = "",
      lowStockThreshold = 5,
<<<<<<< HEAD
=======
=======
// POST /api/admin/products
router.post("/", async (req, res) => {
  try {
    const {
      name,
      brand = "Alike Sovereign",
      category,
      subCategory = "",
      eligibleFor20MinDelivery,
      price,
      mrp,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      rating = 4.8,
      reviewsCount = 120,
      stock = 10,
      stockStatus = "In Stock",
      badge = "",
      isFlashSale = false,
      image = "",
      images = [],
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      whiteBgImage = "",
      promoBannerImage = "",
      videoUrl = "",
      description = "",
      highlights = [],
      benefitsUseCases = "",
      technicalSummary = "",
      whatsInTheBox = "",
      careInstructions = "",
      comparisonTable = [],
      manualUrl = "",
      specifications = {},
      customSpecifications = [],
      variants = [],
      variantOptionGroups = [],
<<<<<<< HEAD
=======
=======
      description = "",
      specifications = {},
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      isWholesale = false,
      wholesalePrice = 0,
      wholesaleMinQty = 1,
      colors = [],
      sizes = [],
      emoji = "📦",
      sellerId = "admin",
      sellerShopName = "ALIKE-ND Official",
      hsnCode = "",
      gstRate = 18,
      countryOfOrigin = "India",
      manufacturerDetails = "",
      packInfo = "",
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      sku = "",
      deliveryCharge = 0,
      packageWeightKg = 0.5,
      packageLengthCm = 20,
      packageWidthCm = 15,
      packageHeightCm = 10,
      badgesConfig = {},
      flashSaleConfig = {},
      shippingConfig = {},
      warrantyConfig = {},
      fulfilmentConfig = {},
      contentScore = 0,
      isPublished,
      isHidden = false,
      moderationStatus,
    } = body;

    const cleanName = String(name || "").trim() || (isDraft ? "Untitled Draft Product" : "");
    const cleanCategory = String(category || "").trim() || (isDraft ? "general" : "");

    if (!isDraft && (!cleanName || !cleanCategory)) {
      return res.status(400).json({ error: "Product name and category are required to publish." });
    }

    const numericPrice = Number(price) || 0;
    if (!isDraft && (isNaN(numericPrice) || numericPrice <= 0)) {
      return res.status(400).json({ error: "Product price must be a valid positive number greater than 0." });
    }

    const numericMrp = mrp !== undefined && mrp !== null && Number(mrp) > 0 ? Number(mrp) : numericPrice;
    if (!isDraft && (isNaN(numericMrp) || numericMrp < numericPrice)) {
      return res.status(400).json({ error: "Regular Price (MRP) must be greater than or equal to the selling/special price." });
    }

    // Validate variants if provided
    const cleanVariants = Array.isArray(variants) ? variants : [];
    if (!isDraft && cleanVariants.length > 0) {
      for (const v of cleanVariants) {
        if (Number(v.price) <= 0) {
          return res.status(400).json({ error: `Variant "${v.name || v.sku}" must have a price greater than 0.` });
        }
        if (v.specialPrice && Number(v.specialPrice) > Number(v.price)) {
          return res.status(400).json({ error: `Variant "${v.name || v.sku}" special price cannot exceed its regular price.` });
        }
      }
    }

    const totalVariantStock =
      cleanVariants.length > 0
        ? cleanVariants.reduce((acc: number, v: any) => acc + Math.max(0, Math.floor(Number(v.stock) || 0)), 0)
        : Math.max(0, Math.floor(Number(stock) || 0));

    const numericStock = totalVariantStock;
    const numericLowThreshold = Math.max(1, Number(lowStockThreshold) || 5);
    const computedStockStatus =
      numericStock <= 0
        ? "Out of Stock"
        : numericStock <= numericLowThreshold
        ? `Low Stock (${numericStock} left)`
        : stockStatus || "In Stock";

    const numericRating = Math.min(5, Math.max(0, Number(rating) || 4.8));
    const numericReviews = Math.max(0, Math.floor(Number(reviewsCount) || 0));

    const is20Min =
      eligibleFor20MinDelivery !== undefined
        ? Boolean(eligibleFor20MinDelivery)
        : Boolean(badgesConfig?.fastDelivery) ||
          cleanCategory === "grocery" ||
          cleanCategory === "food_delivery" ||
          cleanCategory === "delivery";

    const cleanImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const primaryImage = image || cleanImages[0] || whiteBgImage || "";
    const finalImages = cleanImages.length > 0 ? cleanImages : primaryImage ? [primaryImage] : [];

    const sanitizedDescription = sanitizeRichHtml(description);
    const generatedInternalId =
      String(internalProductId || "").trim() || `ALK-PRD-${Date.now().toString().slice(-6)}`;
    const generatedSku =
      String(sku || fulfilmentConfig?.sellerSku || "").trim() || `SKU-${Date.now().toString().slice(-6)}`;

    const actorName = req.admin?.name || req.admin?.email || "Admin";
    const initialHistory = [
      {
        action: isDraft ? "Draft Saved" : "Product Published",
        actedBy: actorName,
        note: isDraft ? "Saved as draft in Add Product Studio" : "Published live via Add Product Studio",
        createdAt: new Date(),
      },
    ];

    const initialInventoryLog = [
      {
        id: `inv_${Date.now()}`,
        timestamp: new Date().toISOString(),
        adjustment: numericStock,
        previousStock: 0,
        newStock: numericStock,
        reason: isDraft ? "Initial draft inventory" : "Initial product creation",
        actor: actorName,
      },
    ];

    const productPayload: any = {
      name: cleanName,
      localizedName: String(localizedName || "").trim(),
      brand: String(brand || "Alike Sovereign").trim(),
      category: cleanCategory,
      subCategory: String(subCategory || "").trim(),
      nestedCategory: String(nestedCategory || "").trim(),
      audience: String(audience || "unisex").trim().toLowerCase(),
      productType: String(productType || "physical"),
      condition: String(condition || "new"),
      modelNumber: String(modelNumber || "").trim(),
      internalProductId: generatedInternalId,
      internalSearchTags: Array.isArray(internalSearchTags) ? internalSearchTags : [],
      projectReference: String(projectReference || "").trim(),
      seoTitle: String(seoTitle || "").trim(),
      seoDescription: String(seoDescription || "").trim(),
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
      tags: Array.isArray(tags) ? tags : [],
      eligibleFor20MinDelivery: is20Min,
      price: numericPrice,
      mrp: numericMrp,
      costPrice: Math.max(0, Number(costPrice) || 0),
      saleStartDate: String(saleStartDate || ""),
      saleEndDate: String(saleEndDate || ""),
      minOrderQty: Math.max(1, Number(minOrderQty) || 1),
      maxOrderQty: Math.max(1, Number(maxOrderQty) || 50),
      bundleInfo: String(bundleInfo || "").trim(),
      lowStockThreshold: numericLowThreshold,
      rating: numericRating,
      reviewsCount: numericReviews,
      stock: numericStock,
      stockStatus: computedStockStatus,
      badge: String(badge || ""),
      isFlashSale: Boolean(isFlashSale || badgesConfig?.flashSale || flashSaleConfig?.enabled),
      image: primaryImage,
      images: finalImages,
      whiteBgImage: String(whiteBgImage || ""),
      promoBannerImage: String(promoBannerImage || ""),
      videoUrl: String(videoUrl || "").trim(),
      description: sanitizedDescription,
      highlights: Array.isArray(highlights) ? highlights.filter(Boolean) : [],
      benefitsUseCases: sanitizeRichHtml(benefitsUseCases),
      technicalSummary: String(technicalSummary || "").trim(),
      whatsInTheBox: String(whatsInTheBox || "").trim(),
      careInstructions: String(careInstructions || "").trim(),
      comparisonTable: Array.isArray(comparisonTable) ? comparisonTable : [],
      manualUrl: String(manualUrl || "").trim(),
      specifications: specifications && typeof specifications === "object" ? specifications : {},
      customSpecifications: Array.isArray(customSpecifications) ? customSpecifications : [],
      variants: cleanVariants,
      variantOptionGroups: Array.isArray(variantOptionGroups) ? variantOptionGroups : [],
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      emoji: emoji || "📦",
      sellerId: sellerId || "admin",
      sellerShopName: sellerShopName || "ALIKE-ND Official",
      hsnCode: String(hsnCode || "").trim(),
      gstRate: Number(gstRate) ?? 18,
      countryOfOrigin: String(countryOfOrigin || "India").trim(),
      manufacturerDetails: String(manufacturerDetails || "").trim(),
      packInfo: String(packInfo || "").trim(),
      sku: generatedSku,
      deliveryCharge: Number(deliveryCharge) || 0,
      packageWeightKg: Number(packageWeightKg) || 0.5,
      packageLengthCm: Number(packageLengthCm) || 20,
      packageWidthCm: Number(packageWidthCm) || 15,
      packageHeightCm: Number(packageHeightCm) || 10,
      badgesConfig: badgesConfig && typeof badgesConfig === "object" ? badgesConfig : {},
      flashSaleConfig: flashSaleConfig && typeof flashSaleConfig === "object" ? flashSaleConfig : {},
      shippingConfig: shippingConfig && typeof shippingConfig === "object" ? shippingConfig : {},
      warrantyConfig: warrantyConfig && typeof warrantyConfig === "object" ? warrantyConfig : {},
      fulfilmentConfig: fulfilmentConfig && typeof fulfilmentConfig === "object" ? fulfilmentConfig : {},
      inventoryHistory: initialInventoryLog,
      isDraft,
      isPublished: isDraft ? false : isPublished !== undefined ? Boolean(isPublished) : true,
      isHidden: isDraft ? true : Boolean(isHidden),
      moderationStatus: isDraft ? "draft" : moderationStatus || "approved",
      contentScore: Number(contentScore) || 0,
      lastDraftSavedAt: isDraft ? new Date() : undefined,
      changeHistory: initialHistory,
    };
<<<<<<< HEAD
=======
=======
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "Product name and category are required" });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: "Product price must be a valid positive number greater than 0." });
    }

    const numericMrp = mrp !== undefined && mrp !== null ? Number(mrp) : numericPrice;
    if (isNaN(numericMrp) || numericMrp < numericPrice) {
      return res.status(400).json({ error: "MRP must be greater than or equal to the selling price." });
    }

    const numericStock = Math.max(0, Math.floor(Number(stock) || 0));
    const numericRating = Math.min(5, Math.max(0, Number(rating) || 4.8));
    const numericReviews = Math.max(0, Math.floor(Number(reviewsCount) || 0));

    const is20Min = eligibleFor20MinDelivery !== undefined
      ? Boolean(eligibleFor20MinDelivery)
      : (category.trim() === 'grocery' || category.trim() === 'food_delivery' || category.trim() === 'delivery');
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

    let createdProduct: any = null;

    if (isMongoConnected()) {
      try {
<<<<<<< HEAD
        createdProduct = await Product.create(productPayload);
=======
<<<<<<< HEAD
        createdProduct = await Product.create(productPayload);
=======
        createdProduct = await Product.create({
          name: name.trim(),
          brand: brand.trim(),
          category: category.trim(),
          subCategory: String(subCategory || "").trim(),
          eligibleFor20MinDelivery: is20Min,
          price: numericPrice,
          mrp: numericMrp,
          rating: numericRating,
          reviewsCount: Number(reviewsCount) || 120,
          stock: numericStock,
          stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
          badge,
          isFlashSale: Boolean(isFlashSale),
          image: image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
          images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600"],
          description,
          specifications,
          isWholesale: Boolean(isWholesale),
          wholesalePrice: Number(wholesalePrice) || 0,
          wholesaleMinQty: Number(wholesaleMinQty) || 1,
          colors,
          sizes,
          emoji: emoji || "📦",
          sellerId: sellerId || "admin",
          sellerShopName: sellerShopName || "ALIKE-ND Official",
          hsnCode: String(hsnCode || "").trim(),
          gstRate: Number(gstRate) || 18,
          countryOfOrigin: String(countryOfOrigin || "India").trim(),
          manufacturerDetails: String(manufacturerDetails || "").trim(),
          packInfo: String(packInfo || "").trim(),
        });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      } catch (err) {
        console.warn("MongoDB create product failed, storing in-memory:", err);
      }
    }

    const newProd = {
      _id: createdProduct ? String(createdProduct._id) : `prod_${Date.now()}`,
      id: Date.now(),
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      ...productPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.products.unshift(newProd);

    logActivity(
      {
        eventType: (isDraft ? "Product Draft Saved" : "Product Created") as any,
        userName: actorName,
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `${isDraft ? "Saved draft" : "Published product"} "${cleanName}" (${newProd._id})`,
      },
      req
    ).catch(() => {});

<<<<<<< HEAD
=======
=======
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      subCategory: String(subCategory || "").trim(),
      eligibleFor20MinDelivery: is20Min,
      price: numericPrice,
      mrp: numericMrp,
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 120,
      stock: numericStock,
      stockStatus: stockStatus || (numericStock <= 0 ? "Out of Stock" : numericStock <= 3 ? "Only 2 left!" : "In Stock"),
      badge,
      isFlashSale: Boolean(isFlashSale),
      image: image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600",
      images: Array.isArray(images) && images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600"],
      description,
      specifications,
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      colors,
      sizes,
      emoji: emoji || "📦",
      sellerId: sellerId || "admin",
      sellerShopName: sellerShopName || "ALIKE-ND Official",
      hsnCode: String(hsnCode || "").trim(),
      gstRate: Number(gstRate) || 18,
      countryOfOrigin: String(countryOfOrigin || "India").trim(),
      manufacturerDetails: String(manufacturerDetails || "").trim(),
      packInfo: String(packInfo || "").trim(),
      createdAt: new Date(),
    };

    memoryStore.products.unshift(newProd);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    return res.status(201).json(createdProduct || newProd);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create product" });
  }
});

// PUT /api/admin/products/:id
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
router.put("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = String(body.name || "").trim();
    if (body.localizedName !== undefined) updateData.localizedName = String(body.localizedName || "").trim();
    if (body.brand !== undefined) updateData.brand = String(body.brand || "").trim();
    if (body.category !== undefined) updateData.category = String(body.category || "").trim();
    if (body.subCategory !== undefined) updateData.subCategory = String(body.subCategory || "").trim();
    if (body.nestedCategory !== undefined) updateData.nestedCategory = String(body.nestedCategory || "").trim();
    if (body.audience !== undefined) updateData.audience = String(body.audience || "unisex").trim().toLowerCase();
    if (body.productType !== undefined) updateData.productType = body.productType;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.modelNumber !== undefined) updateData.modelNumber = String(body.modelNumber || "").trim();
    if (body.internalProductId !== undefined) updateData.internalProductId = String(body.internalProductId || "").trim();
    if (body.internalSearchTags !== undefined) updateData.internalSearchTags = Array.isArray(body.internalSearchTags) ? body.internalSearchTags : [];
    if (body.projectReference !== undefined) updateData.projectReference = String(body.projectReference || "").trim();
    if (body.seoTitle !== undefined) updateData.seoTitle = String(body.seoTitle || "").trim();
    if (body.seoDescription !== undefined) updateData.seoDescription = String(body.seoDescription || "").trim();
    if (body.seoKeywords !== undefined) updateData.seoKeywords = Array.isArray(body.seoKeywords) ? body.seoKeywords : [];
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.eligibleFor20MinDelivery !== undefined) updateData.eligibleFor20MinDelivery = Boolean(body.eligibleFor20MinDelivery);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
    if (body.costPrice !== undefined) updateData.costPrice = Math.max(0, Number(body.costPrice) || 0);
    if (body.saleStartDate !== undefined) updateData.saleStartDate = String(body.saleStartDate || "");
    if (body.saleEndDate !== undefined) updateData.saleEndDate = String(body.saleEndDate || "");
    if (body.minOrderQty !== undefined) updateData.minOrderQty = Math.max(1, Number(body.minOrderQty) || 1);
    if (body.maxOrderQty !== undefined) updateData.maxOrderQty = Math.max(1, Number(body.maxOrderQty) || 50);
    if (body.bundleInfo !== undefined) updateData.bundleInfo = String(body.bundleInfo || "").trim();
    if (body.lowStockThreshold !== undefined) updateData.lowStockThreshold = Math.max(1, Number(body.lowStockThreshold) || 5);
<<<<<<< HEAD
=======
=======
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.brand !== undefined) updateData.brand = body.brand.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.subCategory !== undefined) updateData.subCategory = body.subCategory.trim();
    if (body.eligibleFor20MinDelivery !== undefined) updateData.eligibleFor20MinDelivery = Boolean(body.eligibleFor20MinDelivery);
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.mrp !== undefined) updateData.mrp = Number(body.mrp);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (body.rating !== undefined) updateData.rating = Number(body.rating);
    if (body.reviewsCount !== undefined) updateData.reviewsCount = Number(body.reviewsCount);
    if (body.stock !== undefined) updateData.stock = Number(body.stock);
    if (body.stockStatus !== undefined) updateData.stockStatus = body.stockStatus;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.isFlashSale !== undefined) updateData.isFlashSale = Boolean(body.isFlashSale);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.images !== undefined) updateData.images = body.images;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (body.whiteBgImage !== undefined) updateData.whiteBgImage = body.whiteBgImage;
    if (body.promoBannerImage !== undefined) updateData.promoBannerImage = body.promoBannerImage;
    if (body.videoUrl !== undefined) updateData.videoUrl = String(body.videoUrl || "").trim();
    if (body.description !== undefined) updateData.description = sanitizeRichHtml(body.description);
    if (body.highlights !== undefined) updateData.highlights = Array.isArray(body.highlights) ? body.highlights.filter(Boolean) : [];
    if (body.benefitsUseCases !== undefined) updateData.benefitsUseCases = sanitizeRichHtml(body.benefitsUseCases);
    if (body.technicalSummary !== undefined) updateData.technicalSummary = String(body.technicalSummary || "").trim();
    if (body.whatsInTheBox !== undefined) updateData.whatsInTheBox = String(body.whatsInTheBox || "").trim();
    if (body.careInstructions !== undefined) updateData.careInstructions = String(body.careInstructions || "").trim();
    if (body.comparisonTable !== undefined) updateData.comparisonTable = Array.isArray(body.comparisonTable) ? body.comparisonTable : [];
    if (body.manualUrl !== undefined) updateData.manualUrl = String(body.manualUrl || "").trim();
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.customSpecifications !== undefined) updateData.customSpecifications = Array.isArray(body.customSpecifications) ? body.customSpecifications : [];
    if (body.variants !== undefined) updateData.variants = Array.isArray(body.variants) ? body.variants : [];
    if (body.variantOptionGroups !== undefined) updateData.variantOptionGroups = Array.isArray(body.variantOptionGroups) ? body.variantOptionGroups : [];
<<<<<<< HEAD
=======
=======
    if (body.description !== undefined) updateData.description = body.description;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (body.isWholesale !== undefined) updateData.isWholesale = Boolean(body.isWholesale);
    if (body.wholesalePrice !== undefined) updateData.wholesalePrice = Number(body.wholesalePrice);
    if (body.wholesaleMinQty !== undefined) updateData.wholesaleMinQty = Number(body.wholesaleMinQty);
    if (body.colors !== undefined) updateData.colors = body.colors;
    if (body.sizes !== undefined) updateData.sizes = body.sizes;
    if (body.emoji !== undefined) updateData.emoji = body.emoji;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (body.sellerId !== undefined) updateData.sellerId = body.sellerId;
    if (body.sellerShopName !== undefined) updateData.sellerShopName = body.sellerShopName;
    if (body.hsnCode !== undefined) updateData.hsnCode = String(body.hsnCode || "").trim();
    if (body.gstRate !== undefined) updateData.gstRate = Number(body.gstRate) ?? 18;
    if (body.countryOfOrigin !== undefined) updateData.countryOfOrigin = String(body.countryOfOrigin || "India").trim();
    if (body.manufacturerDetails !== undefined) updateData.manufacturerDetails = String(body.manufacturerDetails || "").trim();
    if (body.packInfo !== undefined) updateData.packInfo = String(body.packInfo || "").trim();
    if (body.sku !== undefined) updateData.sku = String(body.sku || "").trim();
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);
    if (body.isHidden !== undefined) updateData.isHidden = Boolean(body.isHidden);
    if (body.deliveryCharge !== undefined) updateData.deliveryCharge = Number(body.deliveryCharge) || 0;
    if (body.packageWeightKg !== undefined) updateData.packageWeightKg = Number(body.packageWeightKg) || 0.5;
    if (body.packageLengthCm !== undefined) updateData.packageLengthCm = Number(body.packageLengthCm) || 20;
    if (body.packageWidthCm !== undefined) updateData.packageWidthCm = Number(body.packageWidthCm) || 15;
    if (body.packageHeightCm !== undefined) updateData.packageHeightCm = Number(body.packageHeightCm) || 10;
    if (body.badgesConfig !== undefined) updateData.badgesConfig = body.badgesConfig;
    if (body.flashSaleConfig !== undefined) updateData.flashSaleConfig = body.flashSaleConfig;
    if (body.shippingConfig !== undefined) updateData.shippingConfig = body.shippingConfig;
    if (body.warrantyConfig !== undefined) updateData.warrantyConfig = body.warrantyConfig;
    if (body.fulfilmentConfig !== undefined) updateData.fulfilmentConfig = body.fulfilmentConfig;
    if (body.isDraft !== undefined) {
      updateData.isDraft = Boolean(body.isDraft);
      if (body.isDraft) {
        updateData.lastDraftSavedAt = new Date();
        updateData.isPublished = false;
        updateData.moderationStatus = "draft";
        updateData.approvalStatus = "draft";
      } else if (body.isPublished === undefined) {
        updateData.isPublished = true;
        updateData.isHidden = false;
        updateData.moderationStatus = body.moderationStatus || "approved";
        updateData.approvalStatus = body.moderationStatus || "approved";
      }
    }
    if (body.scheduledPublishAt !== undefined) updateData.scheduledPublishAt = String(body.scheduledPublishAt || "");
    if (body.contentScore !== undefined) updateData.contentScore = Number(body.contentScore) || 0;
    if (body.moderationStatus !== undefined) {
      updateData.moderationStatus = body.moderationStatus;
      updateData.approvalStatus = body.moderationStatus;
    }
    if (body.rejectionReason !== undefined) {
      updateData.rejectionReason = String(body.rejectionReason || "");
      updateData.moderationNote = String(body.rejectionReason || "");
    }
    if (body.inventoryHistory !== undefined) updateData.inventoryHistory = body.inventoryHistory;

    const actorName = req.admin?.name || req.admin?.email || "Admin";
<<<<<<< HEAD
=======
=======
    if (body.hsnCode !== undefined) updateData.hsnCode = String(body.hsnCode || "").trim();
    if (body.gstRate !== undefined) updateData.gstRate = Number(body.gstRate) || 18;
    if (body.countryOfOrigin !== undefined) updateData.countryOfOrigin = String(body.countryOfOrigin || "India").trim();
    if (body.manufacturerDetails !== undefined) updateData.manufacturerDetails = String(body.manufacturerDetails || "").trim();
    if (body.packInfo !== undefined) updateData.packInfo = String(body.packInfo || "").trim();
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

    let updatedMongo: any = null;
    if (isMongoConnected()) {
      try {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        updatedMongo = await Product.findByIdAndUpdate(
          id,
          {
            $set: updateData,
            $push: {
              changeHistory: {
                action: updateData.isDraft ? "Draft Updated" : "Product Updated",
                actedBy: actorName,
                note: body.changeNote || "Updated via Admin Product Studio",
                createdAt: new Date(),
              },
            },
          },
          { new: true }
        );
<<<<<<< HEAD
=======
=======
        updatedMongo = await Product.findByIdAndUpdate(id, updateData, { new: true });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      } catch (err) {
        console.warn("MongoDB update product failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      const existingHistory = Array.isArray((memoryStore.products[index] as any).changeHistory)
        ? (memoryStore.products[index] as any).changeHistory
        : [];
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...updateData,
        changeHistory: [
          ...existingHistory,
          {
            action: updateData.isDraft ? "Draft Updated" : "Product Updated",
            actedBy: actorName,
            note: body.changeNote || "Updated via Admin Product Studio",
            createdAt: new Date(),
          },
        ],
        updatedAt: new Date(),
      };
      const result = updatedMongo || memoryStore.products[index];
      logActivity(
        {
          eventType: "Product Updated" as any,
          userName: actorName,
          email: req.admin?.email || "admin@alike.com",
          status: "success",
          details: `Updated product "${result.name || id}" (${id})`,
        },
        req
      ).catch(() => {});
      return res.json(result);
    }

    if (updatedMongo) {
      logActivity(
        {
          eventType: "Product Updated" as any,
          userName: actorName,
          email: req.admin?.email || "admin@alike.com",
          status: "success",
          details: `Updated product "${updatedMongo.name || id}" (${id})`,
        },
        req
      ).catch(() => {});
<<<<<<< HEAD
=======
=======
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...updateData,
        updatedAt: new Date(),
      };
      return res.json(updatedMongo || memoryStore.products[index]);
    }

    if (updatedMongo) {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      return res.json(updatedMongo);
    }

    return res.status(404).json({ error: "Product not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update product" });
  }
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// POST /api/admin/products/:id/duplicate - Duplicate a product as a Draft copy
router.post("/:id/duplicate", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const actorName = req.admin?.name || req.admin?.email || "Admin";

    let sourceProd: any = null;
    if (isMongoConnected()) {
      try {
        sourceProd = await Product.findOne({
          $or: [
            ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
            { id: Number(id) || -1 },
          ],
        }).lean();
      } catch {}
    }
    if (!sourceProd) {
      sourceProd = memoryStore.products.find(
        (p) => String(p._id) === String(id) || String(p.id) === String(id)
      );
    }
    if (!sourceProd) {
      return res.status(404).json({ error: "Source product not found" });
    }

    const newNumericId = Date.now();
    const copyPayload: any = {
      ...sourceProd,
      _id: undefined,
      id: newNumericId,
      name: `${sourceProd.name} (Copy)`,
      sku: sourceProd.sku ? `${sourceProd.sku}-COPY` : `SKU-${String(newNumericId).slice(-6)}`,
      internalProductId: `ALK-PRD-${String(newNumericId).slice(-6)}`,
      isDraft: true,
      isPublished: false,
      isHidden: true,
      moderationStatus: "draft",
      approvalStatus: "draft",
      lastDraftSavedAt: new Date(),
      changeHistory: [
        {
          action: "Product Duplicated as Draft",
          actedBy: actorName,
          note: `Duplicated from "${sourceProd.name}" (${id})`,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    delete copyPayload._id;

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await Product.create(copyPayload);
      } catch {}
    }

    const memCopy = {
      ...copyPayload,
      _id: createdDoc ? String(createdDoc._id) : `prod_dup_${newNumericId}`,
    };
    memoryStore.products.unshift(memCopy);

    const finalProduct = createdDoc ? (createdDoc.toObject ? createdDoc.toObject() : createdDoc) : memCopy;
    return res.status(201).json({
      success: true,
      product: finalProduct,
      message: `Duplicated "${sourceProd.name}" as a draft copy.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to duplicate product" });
  }
});

// PATCH /api/admin/products/:id/status - Approve, Reject, Archive, Restore, Publish, Unpublish
router.patch("/:id/status", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason = "" } = req.body || {};
    const actorName = req.admin?.name || req.admin?.email || "Admin";

    const validActions = ["approve", "reject", "archive", "restore", "publish", "unpublish"];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({ error: "Invalid status action" });
    }

    const updates: any = {};
    let historyAction = "";
    let historyNote = "";

    if (action === "approve") {
      updates.moderationStatus = "approved";
      updates.approvalStatus = "approved";
      updates.isDraft = false;
      updates.isPublished = true;
      updates.isHidden = false;
      updates.rejectionReason = "";
      updates.moderationNote = "Approved by Admin";
      historyAction = "Product Approved & Published";
      historyNote = "Approved by administrator for live catalog";
    } else if (action === "reject") {
      const reason = String(rejectionReason || "Does not meet catalog quality standards").trim();
      updates.moderationStatus = "rejected";
      updates.approvalStatus = "rejected";
      updates.isPublished = false;
      updates.isHidden = true;
      updates.rejectionReason = reason;
      updates.moderationNote = reason;
      historyAction = "Product Rejected";
      historyNote = `Reason: ${reason}`;
    } else if (action === "archive") {
      updates.moderationStatus = "archived";
      updates.approvalStatus = "archived";
      updates.isPublished = false;
      updates.isHidden = true;
      historyAction = "Product Archived";
      historyNote = "Archived from active catalog";
    } else if (action === "restore" || action === "publish") {
      updates.moderationStatus = "approved";
      updates.approvalStatus = "approved";
      updates.isDraft = false;
      updates.isPublished = true;
      updates.isHidden = false;
      historyAction = action === "restore" ? "Product Restored" : "Product Published";
      historyNote = "Published live to customer storefront";
    } else if (action === "unpublish") {
      updates.isPublished = false;
      updates.isHidden = true;
      historyAction = "Product Unpublished";
      historyNote = "Hidden from customer storefront";
    }

    let updatedDoc: any = null;
    if (isMongoConnected()) {
      try {
        const doc = await Product.findOneAndUpdate(
          {
            $or: [
              ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
              { id: Number(id) || -1 },
            ],
          },
          {
            $set: updates,
            $push: {
              changeHistory: {
                action: historyAction,
                actedBy: actorName,
                note: historyNote,
                createdAt: new Date(),
              },
            },
          },
          { new: true }
        );
        if (doc) updatedDoc = doc.toObject ? doc.toObject() : doc;
      } catch {}
    }

    const index = memoryStore.products.findIndex((p) => String(p._id) === String(id) || String(p.id) === String(id));
    if (index !== -1) {
      const existingHistory = Array.isArray((memoryStore.products[index] as any).changeHistory)
        ? (memoryStore.products[index] as any).changeHistory
        : [];
      memoryStore.products[index] = {
        ...memoryStore.products[index],
        ...updates,
        changeHistory: [
          ...existingHistory,
          {
            action: historyAction,
            actedBy: actorName,
            note: historyNote,
            createdAt: new Date(),
          },
        ],
        updatedAt: new Date(),
      };
      if (!updatedDoc) updatedDoc = memoryStore.products[index];
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      success: true,
      product: updatedDoc,
      message: `${historyAction}: "${updatedDoc.name}"`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update product status" });
  }
});

// POST /api/admin/products/import-csv - Bulk CSV / Excel Import for Admin
router.post("/import-csv", async (req: AuthedRequest, res) => {
  try {
    const { items } = req.body || {};
    const actorName = req.admin?.name || req.admin?.email || "Admin";
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No valid product rows found in import payload." });
    }

    const importedProducts: any[] = [];
    for (let i = 0; i < Math.min(items.length, 100); i++) {
      const row = items[i];
      if (!row.name || !String(row.name).trim()) continue;
      const numId = Date.now() + i;
      const price = Math.max(1, Number(row.price) || 999);
      const mrp = Math.max(price, Number(row.mrp) || price);
      const stock = Math.max(0, Number(row.stock) ?? 15);

      const prodData: any = {
        id: numId,
        name: String(row.name).trim(),
        localizedName: String(row.localizedName || "").trim(),
        brand: String(row.brand || "Alike Sovereign").trim(),
        category: String(row.category || "fashion").trim().toLowerCase(),
        subCategory: String(row.subCategory || "").trim(),
        sku: String(row.sku || `SKU-${String(numId).slice(-6)}`).trim(),
        internalProductId: `ALK-PRD-${String(numId).slice(-6)}`,
        price,
        mrp,
        stock,
        stockStatus: stock <= 0 ? "Out of Stock" : stock <= 5 ? `Low Stock (${stock} left)` : "In Stock",
        image:
          String(row.image || "").trim() ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        images: [
          String(row.image || "").trim() ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        ],
        description: String(row.description || "Authentic catalog listing imported via Admin Bulk Studio.").trim(),
        hsnCode: String(row.hsnCode || "7113").trim(),
        gstRate: Number(row.gstRate) || 18,
        countryOfOrigin: String(row.countryOfOrigin || "India").trim(),
        packageWeightKg: Number(row.packageWeightKg) || 0.5,
        sellerId: String(row.sellerId || "admin"),
        sellerShopName: String(row.sellerShopName || "ALIKE-ND Official"),
        isDraft: false,
        isPublished: true,
        isHidden: false,
        moderationStatus: "approved",
        approvalStatus: "approved",
        contentScore: 75,
        changeHistory: [
          {
            action: "Bulk CSV Imported",
            actedBy: actorName,
            note: "Imported via Admin Bulk CSV Upload",
            createdAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let savedDoc: any = null;
      if (isMongoConnected()) {
        try {
          savedDoc = await Product.create(prodData);
        } catch {}
      }

      const memItem = {
        ...prodData,
        _id: savedDoc ? String(savedDoc._id) : `prod_csv_${numId}`,
      };
      memoryStore.products.unshift(memItem);
      importedProducts.push(savedDoc ? (savedDoc.toObject ? savedDoc.toObject() : savedDoc) : memItem);
    }

    return res.status(201).json({
      success: true,
      importedCount: importedProducts.length,
      products: importedProducts,
      message: `Successfully imported ${importedProducts.length} product(s) into the catalog.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to import CSV products" });
  }
});

// POST /api/admin/products/:id/adjust-stock - Manual stock adjustment with reason log
router.post("/:id/adjust-stock", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { adjustment = 0, newStock, reason = "Manual inventory adjustment" } = req.body;
    const actorName = req.admin?.name || req.admin?.email || "Admin";

    let targetProd: any = null;
    if (isMongoConnected()) {
      try {
        targetProd = await Product.findById(id);
      } catch {}
    }
    const memIdx = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (!targetProd && memIdx === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const prevStock = Number(targetProd ? targetProd.stock : memoryStore.products[memIdx].stock) || 0;
    const computedNewStock =
      newStock !== undefined ? Math.max(0, Math.floor(Number(newStock))) : Math.max(0, prevStock + Math.floor(Number(adjustment)));
    const delta = computedNewStock - prevStock;
    const lowThresh = Number(targetProd?.lowStockThreshold || (memoryStore.products[memIdx] as any)?.lowStockThreshold || 5);
    const nextStatus =
      computedNewStock <= 0 ? "Out of Stock" : computedNewStock <= lowThresh ? `Low Stock (${computedNewStock} left)` : "In Stock";

    const logItem = {
      id: `inv_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adjustment: delta,
      previousStock: prevStock,
      newStock: computedNewStock,
      reason: String(reason || "Manual adjustment").trim(),
      actor: actorName,
    };

    if (targetProd) {
      targetProd.stock = computedNewStock;
      targetProd.stockStatus = nextStatus;
      const existingLogs = Array.isArray(targetProd.inventoryHistory) ? targetProd.inventoryHistory : [];
      targetProd.inventoryHistory = [logItem, ...existingLogs];
      await targetProd.save();
    }

    if (memIdx !== -1) {
      const existingLogs = Array.isArray((memoryStore.products[memIdx] as any).inventoryHistory)
        ? (memoryStore.products[memIdx] as any).inventoryHistory
        : [];
      memoryStore.products[memIdx].stock = computedNewStock;
      memoryStore.products[memIdx].stockStatus = nextStatus;
      (memoryStore.products[memIdx] as any).inventoryHistory = [logItem, ...existingLogs];
    }

    logActivity(
      {
        eventType: "Inventory Adjusted" as any,
        userName: actorName,
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `Adjusted stock for product (${id}): ${prevStock} → ${computedNewStock} (${reason})`,
      },
      req
    ).catch(() => {});

    return res.json({
      success: true,
      stock: computedNewStock,
      stockStatus: nextStatus,
      logItem,
      product: targetProd ? targetProd.toObject() : memoryStore.products[memIdx],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to adjust stock" });
  }
});

// PATCH /api/admin/products/:id/toggle-visibility - Hide/Unpublish or Show product
router.patch("/:id/toggle-visibility", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    let updatedDoc: any = null;
    let newIsPublished = true;
    let newIsHidden = false;

    if (isMongoConnected()) {
      try {
        const prod = await Product.findById(id);
        if (prod) {
          const currentHidden = Boolean(prod.isHidden) || prod.isPublished === false;
          prod.isHidden = !currentHidden;
          prod.isPublished = currentHidden;
          await prod.save();
          updatedDoc = prod.toObject();
          newIsPublished = prod.isPublished!;
          newIsHidden = prod.isHidden!;
        }
      } catch (err) {
        console.warn("MongoDB toggle product visibility fallback:", err);
      }
    }

    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
      const currentHidden = Boolean((memoryStore.products[index] as any).isHidden) || (memoryStore.products[index] as any).isPublished === false;
      (memoryStore.products[index] as any).isHidden = !currentHidden;
      (memoryStore.products[index] as any).isPublished = currentHidden;
      (memoryStore.products[index] as any).updatedAt = new Date();
      if (!updatedDoc) {
        updatedDoc = memoryStore.products[index];
        newIsPublished = currentHidden;
        newIsHidden = !currentHidden;
      }
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "Product not found" });
    }

    logActivity(
      {
        eventType: "Product Visibility Toggled" as any,
        userName: req.admin?.name || req.admin?.email || "Admin",
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `${newIsHidden ? "Hidden / Unpublished" : "Published and live"} product "${updatedDoc.name}" (${id})`,
      },
      req
    ).catch(() => {});

    return res.json({
      success: true,
      message: `Product is now ${newIsHidden ? "Hidden / Unpublished" : "Published and live"}`,
      isPublished: newIsPublished,
      isHidden: newIsHidden,
      product: updatedDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle product visibility" });
  }
});

// DELETE /api/admin/products/:id
router.delete("/:id", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    let deletedTitle = "";

    if (isMongoConnected()) {
      try {
        const doc = await Product.findByIdAndDelete(id);
        if (doc) deletedTitle = doc.name;
<<<<<<< HEAD
=======
=======
// DELETE /api/admin/products/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        await Product.findByIdAndDelete(id);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      } catch (err) {
        console.warn("MongoDB delete product failed, checking in-memory store:", err);
      }
    }

    const index = memoryStore.products.findIndex((p) => p._id === id || String(p.id) === id);
    if (index !== -1) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      if (!deletedTitle) deletedTitle = memoryStore.products[index].name;
      memoryStore.products.splice(index, 1);
    }

    logActivity(
      {
        eventType: "Product Deleted" as any,
        userName: req.admin?.name || req.admin?.email || "Admin",
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `Permanently removed product "${deletedTitle || id}" (${id}) from catalog`,
      },
      req
    ).catch(() => {});

    return res.json({ ok: true, message: `Product "${deletedTitle || id}" removed from catalog` });
<<<<<<< HEAD
=======
=======
      memoryStore.products.splice(index, 1);
    }

    return res.json({ ok: true, message: "Product removed from catalog" });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete product" });
  }
});

export default router;

<<<<<<< HEAD

=======
<<<<<<< HEAD

=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
