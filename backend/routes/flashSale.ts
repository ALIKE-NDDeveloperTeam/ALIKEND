import { Router, Request, Response } from "express";
import FlashSale from "../models/FlashSale";
import Product from "../models/Product";
import { isMongoConnected, memoryStore } from "../store";
import { requireAdmin, AuthedRequest } from "../middleware/auth";

const router = Router();

// Helper to get fallback or existing configuration
async function getOrCreateFlashConfig() {
  if (isMongoConnected()) {
    try {
      let config = await FlashSale.findOne();
      if (!config) {
        const defaultEndTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
        config = await FlashSale.create({
          title: "FLASH PREMIUM HOURS",
          subtitle: "Uncompromised pricing on luxury gear",
          bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
          targetEndTime: defaultEndTime,
          activeProducts: [
            { productId: "prod_2", flashPrice: 89999, discountPercent: 44, isFeatured: true, order: 1 },
            { productId: "prod_7", flashPrice: 19999, discountPercent: 43, isFeatured: true, order: 2 },
            { productId: "prod_9", flashPrice: 17999, discountPercent: 38, isFeatured: false, order: 3 },
            { productId: "prod_10", flashPrice: 12999, discountPercent: 35, isFeatured: false, order: 4 },
            { productId: "prod_11", flashPrice: 1299, discountPercent: 48, isFeatured: false, order: 5 },
          ],
        });
      }
      return config;
    } catch (err) {
      console.warn("MongoDB getOrCreateFlashConfig warning:", err);
    }
  }

  // In-memory fallback
  if (!memoryStore.flashSaleConfig) {
    memoryStore.flashSaleConfig = {
      title: "FLASH PREMIUM HOURS",
      subtitle: "Uncompromised pricing on luxury gear",
      bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
      targetEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      activeProducts: [
        { productId: "prod_2", flashPrice: 89999, discountPercent: 44, isFeatured: true, order: 1 },
        { productId: "prod_7", flashPrice: 19999, discountPercent: 43, isFeatured: true, order: 2 },
        { productId: "prod_9", flashPrice: 17999, discountPercent: 38, isFeatured: false, order: 3 },
        { productId: "prod_10", flashPrice: 12999, discountPercent: 35, isFeatured: false, order: 4 },
        { productId: "prod_11", flashPrice: 1299, discountPercent: 48, isFeatured: false, order: 5 },
      ],
      updatedAt: new Date(),
    };
  }
  return memoryStore.flashSaleConfig;
}

// 1. GET /api/flash-sale - Public endpoint to retrieve active flash sale configuration and products
router.get("/", async (_req: Request, res: Response) => {
  try {
    const configRaw: any = await getOrCreateFlashConfig();
    const config = configRaw && typeof configRaw.toObject === "function" ? configRaw.toObject() : { ...configRaw };

    // Fetch all catalog products to populate flash items
    let allProducts: any[] = [];
    if (isMongoConnected()) {
      try {
        allProducts = await Product.find().lean();
      } catch (e) {
        console.warn("MongoDB fetch products for flash sale fallback:", e);
      }
    }
    if (!allProducts || allProducts.length === 0) {
      allProducts = memoryStore.products || [];
    }

    const activeList = config.activeProducts || [];
    const populatedProducts: any[] = [];

    // Map each flash entry with catalog product data
    for (const item of activeList) {
      const prod = allProducts.find(
        (p) => String(p._id) === String(item.productId) || String(p.id) === String(item.productId)
      );
      if (prod) {
        const calculatedDiscount =
          item.discountPercent ||
          (prod.mrp && prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 40);
        const calculatedPrice = item.flashPrice || prod.price;

        populatedProducts.push({
          ...prod,
          price: calculatedPrice,
          originalPrice: prod.price,
          mrp: prod.mrp || Math.round(calculatedPrice * 1.6),
          discountPercent: calculatedDiscount,
          isFlashSale: true,
          badge: "SALE",
          isFeatured: Boolean(item.isFeatured),
          flashOrder: item.order ?? 0,
        });
      }
    }

    // Sort by order
    populatedProducts.sort((a, b) => (a.flashOrder || 0) - (b.flashOrder || 0));

    // Fallback: If no products mapped yet, select products marked as flash or SALE
    if (populatedProducts.length === 0) {
      const defaultFlash = allProducts.filter((p) => p.badge === "SALE" || p.isFlashSale).slice(0, 5);
      defaultFlash.forEach((p, idx) => {
        populatedProducts.push({
          ...p,
          isFlashSale: true,
          badge: "SALE",
          discountPercent: p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 45,
          flashOrder: idx + 1,
        });
      });
    }

    return res.json({
      success: true,
      config: {
        title: config.title || "FLASH PREMIUM HOURS",
        subtitle: config.subtitle || "Uncompromised pricing on luxury gear",
        bannerText: config.bannerText || "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
        targetEndTime: config.targetEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
        activeProducts: config.activeProducts || [],
      },
      products: populatedProducts,
    });
  } catch (err: any) {
    console.error("Fetch flash sale error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch flash sale" });
  }
});

// 2. PUT /api/admin/flash-sale/config - Admin updates countdown end-time, title, banner texts
router.put("/config", requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { title, subtitle, bannerText, targetEndTime } = req.body;

    let parsedEndTime: Date | null = null;
    if (targetEndTime) {
      const d = new Date(targetEndTime);
      if (!isNaN(d.getTime())) {
        parsedEndTime = d;
      }
    }

    let updatedConfig: any = null;

    if (isMongoConnected()) {
      try {
        const updateFields: any = { updatedAt: new Date() };
        if (title !== undefined) updateFields.title = String(title).trim();
        if (subtitle !== undefined) updateFields.subtitle = String(subtitle).trim();
        if (bannerText !== undefined) updateFields.bannerText = String(bannerText).trim();
        if (parsedEndTime) updateFields.targetEndTime = parsedEndTime;

        updatedConfig = await (FlashSale as any).findOneAndUpdate({}, { $set: updateFields }, { new: true, upsert: true });
      } catch (err) {
        console.warn("MongoDB update flash config warning:", err);
      }
    }

    // In-memory sync
    if (!memoryStore.flashSaleConfig) {
      await getOrCreateFlashConfig();
    }
    if (memoryStore.flashSaleConfig) {
      if (title !== undefined) memoryStore.flashSaleConfig.title = String(title).trim();
      if (subtitle !== undefined) memoryStore.flashSaleConfig.subtitle = String(subtitle).trim();
      if (bannerText !== undefined) memoryStore.flashSaleConfig.bannerText = String(bannerText).trim();
      if (parsedEndTime) memoryStore.flashSaleConfig.targetEndTime = parsedEndTime;
      memoryStore.flashSaleConfig.updatedAt = new Date();

      if (!updatedConfig) {
        updatedConfig = memoryStore.flashSaleConfig;
      }
    }

    return res.json({
      success: true,
      message: "Flash sale configuration updated successfully.",
      config: updatedConfig,
    });
  } catch (err: any) {
    console.error("Admin update flash sale config error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update flash sale settings" });
  }
});

// 3. POST /api/admin/flash-sale/products - Admin adds/updates a product in the flash sale list
router.post("/products", requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { productId, flashPrice, discountPercent, isFeatured, order } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, error: "Product ID is required" });
    }

    const cleanProductId = String(productId);
    const newEntry = {
      productId: cleanProductId,
      flashPrice: flashPrice !== undefined && Number(flashPrice) > 0 ? Number(flashPrice) : undefined,
      discountPercent: discountPercent !== undefined && Number(discountPercent) > 0 ? Number(discountPercent) : undefined,
      isFeatured: Boolean(isFeatured),
      order: order !== undefined ? Number(order) : 0,
    };

    let updatedConfig: any = null;

    if (isMongoConnected()) {
      try {
        let config = await FlashSale.findOne();
        if (!config) {
          config = await FlashSale.create({
            title: "FLASH PREMIUM HOURS",
            subtitle: "Uncompromised pricing on luxury gear",
            bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
            targetEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
            activeProducts: [],
          });
        }

        const existingIdx = config.activeProducts.findIndex(
          (p) => String(p.productId) === cleanProductId
        );
        if (existingIdx !== -1) {
          config.activeProducts[existingIdx] = { ...config.activeProducts[existingIdx], ...newEntry };
        } else {
          config.activeProducts.push(newEntry);
        }

        await config.save();
        updatedConfig = config;

        // Mark product in MongoDB Product collection as isFlashSale: true
        await Product.findOneAndUpdate(
          { $or: [{ _id: cleanProductId }, { id: Number(cleanProductId) || 0 }] },
          { $set: { isFlashSale: true, badge: "SALE" } }
        );
      } catch (err) {
        console.warn("MongoDB add flash product warning:", err);
      }
    }

    // In-memory sync
    if (!memoryStore.flashSaleConfig) {
      await getOrCreateFlashConfig();
    }
    if (memoryStore.flashSaleConfig) {
      const memList = memoryStore.flashSaleConfig.activeProducts || [];
      const memIdx = memList.findIndex((p) => String(p.productId) === cleanProductId);
      if (memIdx !== -1) {
        memList[memIdx] = { ...memList[memIdx], ...newEntry };
      } else {
        memList.push(newEntry);
      }
      memoryStore.flashSaleConfig.activeProducts = memList;
      memoryStore.flashSaleConfig.updatedAt = new Date();
      if (!updatedConfig) updatedConfig = memoryStore.flashSaleConfig;
    }

    // Mark product in memoryStore.products as isFlashSale: true
    const memProd = (memoryStore.products || []).find(
      (p) => String(p._id) === cleanProductId || String(p.id) === cleanProductId
    );
    if (memProd) {
      memProd.isFlashSale = true;
      memProd.badge = "SALE";
    }

    return res.status(201).json({
      success: true,
      message: `Product ${cleanProductId} added to Flash Sale.`,
      config: updatedConfig,
    });
  } catch (err: any) {
    console.error("Admin add flash product error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to add product to flash sale" });
  }
});

// 4. DELETE /api/admin/flash-sale/products/:id - Admin removes product from flash sale list
router.delete("/products/:id", requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cleanId = String(id);

    let updatedConfig: any = null;

    if (isMongoConnected()) {
      try {
        const config = await FlashSale.findOne();
        if (config) {
          config.activeProducts = config.activeProducts.filter(
            (p) => String(p.productId) !== cleanId
          );
          await config.save();
          updatedConfig = config;
        }

        // Unset isFlashSale on product in catalog
        await Product.findOneAndUpdate(
          { $or: [{ _id: cleanId }, { id: Number(cleanId) || 0 }] },
          { $set: { isFlashSale: false } }
        );
      } catch (err) {
        console.warn("MongoDB delete flash product warning:", err);
      }
    }

    // In-memory sync
    if (memoryStore.flashSaleConfig) {
      memoryStore.flashSaleConfig.activeProducts = (
        memoryStore.flashSaleConfig.activeProducts || []
      ).filter((p) => String(p.productId) !== cleanId);
      memoryStore.flashSaleConfig.updatedAt = new Date();
      if (!updatedConfig) updatedConfig = memoryStore.flashSaleConfig;
    }

    const memProd = (memoryStore.products || []).find(
      (p) => String(p._id) === cleanId || String(p.id) === cleanId
    );
    if (memProd) {
      memProd.isFlashSale = false;
    }

    return res.json({
      success: true,
      message: `Product ${cleanId} removed from Flash Sale.`,
      config: updatedConfig,
    });
  } catch (err: any) {
    console.error("Admin remove flash product error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to remove product from flash sale" });
  }
});

export default router;
