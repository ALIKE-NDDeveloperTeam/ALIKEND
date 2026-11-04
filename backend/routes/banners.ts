import { Router } from "express";
import Banner from "../models/Banner";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

// GET /api/admin/banners - Fetch all banners (active + inactive) sorted by order
router.get("/", async (_req, res) => {
  try {
    let list: any[] = [];
    if (isMongoConnected()) {
      try {
        const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
        if (banners && banners.length > 0) {
          list = banners.map((b) => (b.toObject ? b.toObject() : b));
        }
      } catch (err) {
        console.warn("MongoDB fetch banners error, falling back to memory:", err);
      }
    }

    if (!list || list.length === 0) {
      list = [...(memoryStore.banners || [])].sort((a, b) => a.order - b.order);
    }

    const sanitized = list.map((b: any) => ({
      ...b,
      linkUrl: b.linkUrl || b.link || "",
      link: b.link || b.linkUrl || "",
      isActive: b.active !== false && b.isActive !== false,
      active: b.active !== false && b.isActive !== false,
      isCenterFeatured: Boolean(b.isCenterFeatured),
    }));

    return res.json(sanitized);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch banners" });
  }
});

// POST /api/admin/banners - Add new banner slide
router.post("/", async (req, res) => {
  try {
    const {
      imageUrl,
      title = "",
      subtitle = "",
      description = "",
      buttonText = "",
      link = "",
      linkUrl = "",
      order,
      active,
      isActive,
      isCenterFeatured = false,
    } = req.body;

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const finalLink = (linkUrl || link || "").trim();
    const finalActive = active !== undefined ? Boolean(active) : isActive !== undefined ? Boolean(isActive) : true;
    const finalCenter = Boolean(isCenterFeatured);

    let calculatedOrder = Number(order);
    if (isNaN(calculatedOrder)) {
      if (isMongoConnected()) {
        try {
          const maxOrderDoc = await Banner.findOne().sort({ order: -1 }).select("order");
          calculatedOrder = maxOrderDoc && typeof maxOrderDoc.order === "number" ? maxOrderDoc.order + 1 : 1;
        } catch {
          calculatedOrder = (memoryStore.banners?.length || 0) + 1;
        }
      } else {
        calculatedOrder = (memoryStore.banners?.length || 0) + 1;
      }
    }

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await Banner.create({
          imageUrl: imageUrl.trim(),
          title: title.trim(),
          subtitle: subtitle.trim(),
          description: description.trim(),
          buttonText: buttonText.trim(),
          link: finalLink,
          linkUrl: finalLink,
          order: calculatedOrder,
          active: finalActive,
          isCenterFeatured: finalCenter,
        });
      } catch (dbErr) {
        console.warn("MongoDB create banner fallback to memory:", dbErr);
      }
    }

    const newBanner = {
      _id: createdDoc ? String(createdDoc._id) : `ban_${Date.now()}`,
      imageUrl: imageUrl.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      buttonText: buttonText.trim(),
      link: finalLink,
      linkUrl: finalLink,
      order: calculatedOrder,
      active: finalActive,
      isActive: finalActive,
      isCenterFeatured: finalCenter,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!memoryStore.banners) memoryStore.banners = [];
    memoryStore.banners.push(newBanner);

    const docObj = createdDoc && typeof createdDoc.toObject === "function" ? createdDoc.toObject() : newBanner;
    return res.status(201).json({
      ...docObj,
      linkUrl: docObj.linkUrl || docObj.link || "",
      link: docObj.link || docObj.linkUrl || "",
      isActive: docObj.active !== false,
      isCenterFeatured: Boolean(docObj.isCenterFeatured),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create banner" });
  }
});

// PUT /api/admin/banners/reorder - Bulk reorder banners
router.put("/reorder", async (req, res) => {
  try {
    const { bannerIds } = req.body;
    if (!Array.isArray(bannerIds)) {
      return res.status(400).json({ error: "bannerIds array is required for reordering" });
    }

    if (isMongoConnected()) {
      try {
        const updateOps = bannerIds.map((id, index) =>
          Banner.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
        );
        await Promise.all(updateOps);
      } catch (err) {
        console.warn("MongoDB reorder banners error:", err);
      }
    }

    // Update in memoryStore
    if (memoryStore.banners) {
      bannerIds.forEach((id, index) => {
        const item = memoryStore.banners.find((b) => b._id === id);
        if (item) item.order = index + 1;
      });
      memoryStore.banners.sort((a, b) => a.order - b.order);
    }

    return res.json({ success: true, message: "Banners reordered successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to reorder banners" });
  }
});

// PATCH /api/admin/banners/:id/toggle - Toggle banner active state
router.patch("/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        const doc = await Banner.findById(id);
        if (doc) {
          doc.active = !doc.active;
          await doc.save();
          return res.json(doc.toObject());
        }
      } catch (err) {
        console.warn("MongoDB toggle banner fallback to memory:", err);
      }
    }

    const item = (memoryStore.banners || []).find((b) => b._id === id);
    if (item) {
      item.active = !item.active;
      item.updatedAt = new Date();
      return res.json(item);
    }

    return res.status(404).json({ error: "Banner not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle banner status" });
  }
});

// PUT /api/admin/banners/:id - Edit existing banner slide
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      imageUrl,
      title,
      subtitle,
      description,
      buttonText,
      link,
      linkUrl,
      order,
      active,
      isActive,
      isCenterFeatured,
    } = req.body;

    const updateData: any = {};
    if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
    if (title !== undefined) updateData.title = String(title).trim();
    if (subtitle !== undefined) updateData.subtitle = String(subtitle).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (buttonText !== undefined) updateData.buttonText = String(buttonText).trim();
    if (linkUrl !== undefined) {
      updateData.linkUrl = String(linkUrl).trim();
      updateData.link = String(linkUrl).trim();
    } else if (link !== undefined) {
      updateData.link = String(link).trim();
      updateData.linkUrl = String(link).trim();
    }
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) {
      updateData.active = Boolean(isActive);
      updateData.isActive = Boolean(isActive);
    } else if (active !== undefined) {
      updateData.active = Boolean(active);
      updateData.isActive = Boolean(active);
    }
    if (isCenterFeatured !== undefined) updateData.isCenterFeatured = Boolean(isCenterFeatured);

    if (isMongoConnected()) {
      try {
        const updated = await Banner.findByIdAndUpdate(id, updateData, { new: true });
        if (updated) {
          const docObj = updated.toObject();
          return res.json({
            ...docObj,
            linkUrl: docObj.linkUrl || docObj.link || "",
            link: docObj.link || docObj.linkUrl || "",
            isActive: docObj.active !== false,
            isCenterFeatured: Boolean(docObj.isCenterFeatured),
          });
        }
      } catch (err) {
        console.warn("MongoDB update banner fallback to memory:", err);
      }
    }

    const item = (memoryStore.banners || []).find((b) => b._id === id);
    if (item) {
      Object.assign(item, updateData, { updatedAt: new Date() });
      return res.json({
        ...item,
        linkUrl: item.linkUrl || item.link || "",
        link: item.link || item.linkUrl || "",
        isActive: item.active !== false,
        isCenterFeatured: Boolean(item.isCenterFeatured),
      });
    }

    return res.status(404).json({ error: "Banner not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update banner" });
  }
});

// DELETE /api/admin/banners/:id - Delete banner slide
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        await Banner.findByIdAndDelete(id);
      } catch (err) {
        console.warn("MongoDB delete banner fallback to memory:", err);
      }
    }

    if (memoryStore.banners) {
      const idx = memoryStore.banners.findIndex((b) => b._id === id);
      if (idx !== -1) {
        memoryStore.banners.splice(idx, 1);
      }
    }

    return res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete banner" });
  }
});

export default router;
