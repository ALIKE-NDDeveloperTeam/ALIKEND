import { Router } from "express";
import Category from "../models/Category";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();

// GET /api/categories - Public & Admin fetch categories (sorted by order: 1)
router.get("/", async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    let list: any[] = [];

    if (isMongoConnected()) {
      try {
        const query: any = showAll ? {} : { isActive: true };
        const categories = await (Category as any).find(query).sort({ order: 1, createdAt: 1 });
        if (categories && categories.length > 0) {
          list = categories.map((c) => (c.toObject ? c.toObject() : c));
        }
      } catch (err) {
        console.warn("MongoDB fetch categories error, falling back to memory:", err);
      }
    }

    if (!list || list.length === 0) {
      const allMem = memoryStore.categories || [];
      list = (showAll ? allMem : allMem.filter((c) => c.isActive !== false)).sort(
        (a, b) => a.order - b.order
      );
    }

    const sanitized = list.map((c: any) => ({
      _id: String(c._id),
      id: String(c._id),
      titleEn: c.titleEn || c.label || "Category",
      titleBn: c.titleBn || c.labelBn || c.titleEn || "",
      imageUrl: c.imageUrl || c.image || "",
      badgeText: c.badgeText || (c.badge ? c.badge.text : "") || "",
      badgeColor: c.badgeColor || (c.badge ? c.badge.color : "") || "#F5A623",
      redirectUrl: c.redirectUrl || c.link || "category_search",
      order: typeof c.order === "number" ? c.order : 0,
      isActive: c.isActive !== false,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.json({
      success: true,
      categories: sanitized,
    });
  } catch (err: any) {
    console.error("GET /api/categories error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch categories" });
  }
});

// GET /api/categories/:id - Get single category
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let found: any = null;

    if (isMongoConnected()) {
      try {
        found = await (Category as any).findById(id);
      } catch {
        // Fallback or invalid ObjectId
      }
    }

    if (!found) {
      found = (memoryStore.categories || []).find((c) => String(c._id) === String(id));
    }

    if (!found) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    const doc = found.toObject ? found.toObject() : found;
    return res.json({ success: true, category: doc });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch category" });
  }
});

// Admin-only endpoints below: requireAdmin
router.use(requireAdmin);

// POST /api/categories - Create new category
router.post("/", async (req, res) => {
  try {
    const {
      titleEn,
      titleBn,
      imageUrl,
      badgeText = "",
      badgeColor = "#F5A623",
      redirectUrl = "category_search",
      order,
      isActive = true,
    } = req.body;

    if (!titleEn || typeof titleEn !== "string" || !titleEn.trim()) {
      return res.status(400).json({ success: false, error: "English Title (titleEn) is required." });
    }

    if (!titleBn || typeof titleBn !== "string" || !titleBn.trim()) {
      return res.status(400).json({ success: false, error: "Bengali Title (titleBn) is required." });
    }

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ success: false, error: "Image URL (imageUrl) is required." });
    }

    const cleanOrder = typeof order === "number" ? order : ((memoryStore.categories?.length || 0) + 1);

    let createdDoc: any = null;

    if (isMongoConnected()) {
      try {
        createdDoc = await Category.create({
          titleEn: titleEn.trim(),
          titleBn: titleBn.trim(),
          imageUrl: imageUrl.trim(),
          badgeText: (badgeText || "").trim().toUpperCase(),
          badgeColor: badgeColor || "#F5A623",
          redirectUrl: (redirectUrl || "category_search").trim(),
          order: cleanOrder,
          isActive: Boolean(isActive),
        });
      } catch (dbErr) {
        console.warn("MongoDB create category error, saving to memoryStore:", dbErr);
      }
    }

    // Always maintain dual-persistence sync in memoryStore
    const memoryItem = {
      _id: createdDoc ? String(createdDoc._id) : `cat_mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      titleEn: titleEn.trim(),
      titleBn: titleBn.trim(),
      imageUrl: imageUrl.trim(),
      badgeText: (badgeText || "").trim().toUpperCase(),
      badgeColor: badgeColor || "#F5A623",
      redirectUrl: (redirectUrl || "category_search").trim(),
      order: cleanOrder,
      isActive: Boolean(isActive),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!memoryStore.categories) memoryStore.categories = [];
    memoryStore.categories.push(memoryItem);

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: createdDoc ? (createdDoc.toObject ? createdDoc.toObject() : createdDoc) : memoryItem,
    });
  } catch (err: any) {
    console.error("POST /api/categories error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to create category" });
  }
});

// PUT /api/categories/reorder - Batch reorder categories
router.put("/reorder", async (req, res) => {
  try {
    const { items } = req.body; // Array of { id: string, order: number }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: "Items array is required for reordering" });
    }

    if (isMongoConnected()) {
      try {
        const updateOps = items.map((item) => ({
          updateOne: {
            filter: { _id: item.id },
            update: { $set: { order: Number(item.order) } },
          },
        }));
        await (Category as any).bulkWrite(updateOps);
      } catch (dbErr) {
        console.warn("MongoDB bulk reorder error, updating in memory:", dbErr);
      }
    }

    // Sync memoryStore
    if (memoryStore.categories) {
      items.forEach((item) => {
        const found = memoryStore.categories.find((c) => String(c._id) === String(item.id));
        if (found) {
          found.order = Number(item.order);
          found.updatedAt = new Date();
        }
      });
      memoryStore.categories.sort((a, b) => a.order - b.order);
    }

    return res.json({
      success: true,
      message: "Category order updated successfully",
    });
  } catch (err: any) {
    console.error("PUT /api/categories/reorder error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to reorder categories" });
  }
});

// PUT /api/categories/:id - Update existing category
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titleEn,
      titleBn,
      imageUrl,
      badgeText,
      badgeColor,
      redirectUrl,
      order,
      isActive,
    } = req.body;

    let updatedDoc: any = null;

    if (isMongoConnected()) {
      try {
        const updateData: any = {};
        if (titleEn !== undefined) updateData.titleEn = String(titleEn).trim();
        if (titleBn !== undefined) updateData.titleBn = String(titleBn).trim();
        if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
        if (badgeText !== undefined) updateData.badgeText = String(badgeText).trim().toUpperCase();
        if (badgeColor !== undefined) updateData.badgeColor = String(badgeColor).trim();
        if (redirectUrl !== undefined) updateData.redirectUrl = String(redirectUrl).trim();
        if (order !== undefined) updateData.order = Number(order);
        if (isActive !== undefined) updateData.isActive = Boolean(isActive);

        updatedDoc = await (Category as any).findByIdAndUpdate(id, updateData, { new: true });
      } catch (dbErr) {
        console.warn("MongoDB update category error, falling back to memory:", dbErr);
      }
    }

    // Sync memoryStore
    const memItem = (memoryStore.categories || []).find((c) => String(c._id) === String(id));
    if (memItem) {
      if (titleEn !== undefined) memItem.titleEn = String(titleEn).trim();
      if (titleBn !== undefined) memItem.titleBn = String(titleBn).trim();
      if (imageUrl !== undefined) memItem.imageUrl = String(imageUrl).trim();
      if (badgeText !== undefined) memItem.badgeText = String(badgeText).trim().toUpperCase();
      if (badgeColor !== undefined) memItem.badgeColor = String(badgeColor).trim();
      if (redirectUrl !== undefined) memItem.redirectUrl = String(redirectUrl).trim();
      if (order !== undefined) memItem.order = Number(order);
      if (isActive !== undefined) memItem.isActive = Boolean(isActive);
      memItem.updatedAt = new Date();
    }

    if (!updatedDoc && !memItem) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    return res.json({
      success: true,
      message: "Category updated successfully",
      category: updatedDoc ? (updatedDoc.toObject ? updatedDoc.toObject() : updatedDoc) : memItem,
    });
  } catch (err: any) {
    console.error("PUT /api/categories/:id error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update category" });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (isMongoConnected()) {
      try {
        const resDb = await (Category as any).findByIdAndDelete(id);
        if (resDb) deleted = true;
      } catch (dbErr) {
        console.warn("MongoDB delete category error:", dbErr);
      }
    }

    if (memoryStore.categories) {
      const idx = memoryStore.categories.findIndex((c) => String(c._id) === String(id));
      if (idx !== -1) {
        memoryStore.categories.splice(idx, 1);
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    return res.json({
      success: true,
      message: "Category deleted successfully",
      deletedId: id,
    });
  } catch (err: any) {
    console.error("DELETE /api/categories/:id error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to delete category" });
  }
});

export default router;
