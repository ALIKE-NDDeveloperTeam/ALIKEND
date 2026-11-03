import { Router } from "express";
import Advertisement from "../models/Advertisement";
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";

const router = Router();

// Default advertisements (empty by default so only admin-created ads are shown)
export const DEFAULT_ADVERTISEMENTS: any[] = [];

const LEGACY_REMOVED_AD_TITLES = new Set([
  "Jewellery & Watches",
  "Curated VIP Selection",
  "Imperial Sovereign Chronograph",
]);

// Helper to check if an ad is currently within its schedule
function isAdActiveAndCurrent(ad: any): boolean {
  if (ad.active === false || ad.isActive === false) return false;
  const now = new Date();
  if (ad.startDate) {
    const start = new Date(ad.startDate);
    if (!isNaN(start.getTime()) && now < start) return false;
  }
  if (ad.endDate) {
    const end = new Date(ad.endDate);
    if (!isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

// 1. GET /api/advertisements - Public list of active, scheduled advertisements
router.get("/", async (req, res) => {
  try {
    let ads: any[] = [];
    if (isMongoConnected()) {
      try {
        await Advertisement.deleteMany({
          title: { $in: Array.from(LEGACY_REMOVED_AD_TITLES) },
          tagline: { $in: ["CERTIFIED LUXURY", "HAUTE COUTURE", "EXCLUSIVE RELEASE"] },
        });
        ads = await Advertisement.find().sort({ order: 1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB fetch advertisements fallback to memory:", err);
      }
    }

    if (!ads || ads.length === 0) {
      if (!memoryStore.advertisements) {
        memoryStore.advertisements = [];
      } else {
        memoryStore.advertisements = memoryStore.advertisements.filter(
          (a: any) => !LEGACY_REMOVED_AD_TITLES.has(a?.title)
        );
      }
      ads = memoryStore.advertisements;
    }

    // Check if requester has admin token; if so, return all ads with isExpired/isScheduled flags
    const authHeader = req.headers.authorization;
    const isAdmin = Boolean(authHeader && authHeader.startsWith("Bearer "));

    if (isAdmin) {
      const enriched = ads.map((ad: any) => ({
        ...ad,
        isCurrentlyLive: isAdActiveAndCurrent(ad),
      }));
      return res.json(enriched);
    }

    // Public visitor: filter out disabled and expired ads
    const publicAds = ads
      .filter(isAdActiveAndCurrent)
      .map((ad: any) => ({
        ...ad,
        isCurrentlyLive: true,
      }));

    return res.json(publicAds);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch advertisements" });
  }
});

// 2. GET /api/admin/advertisements - Admin list of all advertisements
router.get("/all", requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    let ads: any[] = [];
    if (isMongoConnected()) {
      try {
        await Advertisement.deleteMany({
          title: { $in: Array.from(LEGACY_REMOVED_AD_TITLES) },
          tagline: { $in: ["CERTIFIED LUXURY", "HAUTE COUTURE", "EXCLUSIVE RELEASE"] },
        });
        ads = await Advertisement.find().sort({ order: 1, createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB admin fetch advertisements fallback:", err);
      }
    }
    if (!ads || ads.length === 0) {
      if (!memoryStore.advertisements) {
        memoryStore.advertisements = [];
      } else {
        memoryStore.advertisements = memoryStore.advertisements.filter(
          (a: any) => !LEGACY_REMOVED_AD_TITLES.has(a?.title)
        );
      }
      ads = memoryStore.advertisements;
    }
    const enriched = ads.map((ad: any) => ({
      ...ad,
      isCurrentlyLive: isAdActiveAndCurrent(ad),
    }));
    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch all advertisements" });
  }
});

// 3. POST /api/admin/advertisements - Create new advertisement
router.post("/", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const {
      title,
      subtitle = "",
      tagline = "",
      badge = "EXCLUSIVE",
      imageUrl,
      destinationUrl,
      buttonText = "Explore Now",
      position = "mid_promo",
      startDate = "",
      endDate = "",
      active = true,
      order = 1,
    } = req.body;

    if (!title || !imageUrl || !destinationUrl) {
      return res.status(400).json({ error: "Title, image URL, and destination URL are required" });
    }

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await Advertisement.create({
          title: String(title).trim(),
          subtitle: String(subtitle).trim(),
          tagline: String(tagline).trim(),
          badge: String(badge).trim(),
          imageUrl: String(imageUrl).trim(),
          destinationUrl: String(destinationUrl).trim(),
          buttonText: String(buttonText).trim(),
          position: String(position).trim(),
          startDate: String(startDate || "").trim(),
          endDate: String(endDate || "").trim(),
          active: Boolean(active),
          order: Number(order) || 1,
          clickCount: 0,
          viewCount: 0,
        });
      } catch (err) {
        console.warn("MongoDB create ad fallback to memory:", err);
      }
    }

    const newAd = createdDoc ? createdDoc.toObject() : {
      _id: `ad_${Date.now()}`,
      id: `ad_${Date.now()}`,
      title: String(title).trim(),
      subtitle: String(subtitle).trim(),
      tagline: String(tagline).trim(),
      badge: String(badge).trim(),
      imageUrl: String(imageUrl).trim(),
      destinationUrl: String(destinationUrl).trim(),
      buttonText: String(buttonText).trim(),
      position: String(position).trim(),
      startDate: String(startDate || "").trim(),
      endDate: String(endDate || "").trim(),
      active: Boolean(active),
      order: Number(order) || 1,
      clickCount: 0,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!memoryStore.advertisements) memoryStore.advertisements = [...DEFAULT_ADVERTISEMENTS];
    memoryStore.advertisements.unshift(newAd);

    // Audit log
    await logActivity(
      {
        eventType: "Ad Created",
        userName: req.admin?.name || req.admin?.email || "Admin",
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `Created new advertisement: "${title}" (Position: ${position})`,
      },
      req
    ).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Advertisement created successfully",
      advertisement: newAd,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to create advertisement" });
  }
});

// 4. PUT /api/admin/advertisements/:id - Edit advertisement
router.put("/:id", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.subtitle !== undefined) updateData.subtitle = String(body.subtitle).trim();
    if (body.tagline !== undefined) updateData.tagline = String(body.tagline).trim();
    if (body.badge !== undefined) updateData.badge = String(body.badge).trim();
    if (body.imageUrl !== undefined) updateData.imageUrl = String(body.imageUrl).trim();
    if (body.destinationUrl !== undefined) updateData.destinationUrl = String(body.destinationUrl).trim();
    if (body.buttonText !== undefined) updateData.buttonText = String(body.buttonText).trim();
    if (body.position !== undefined) updateData.position = String(body.position).trim();
    if (body.startDate !== undefined) updateData.startDate = String(body.startDate || "").trim();
    if (body.endDate !== undefined) updateData.endDate = String(body.endDate || "").trim();
    if (body.active !== undefined) updateData.active = Boolean(body.active);
    if (body.order !== undefined) updateData.order = Number(body.order);

    let updatedDoc: any = null;
    if (isMongoConnected()) {
      try {
        updatedDoc = await Advertisement.findByIdAndUpdate(id, updateData, { new: true }).lean();
      } catch (err) {
        console.warn("MongoDB update ad fallback to memory:", err);
      }
    }

    if (!memoryStore.advertisements) memoryStore.advertisements = [...DEFAULT_ADVERTISEMENTS];
    const idx = memoryStore.advertisements.findIndex((a) => a._id === id || String(a.id) === id);
    if (idx !== -1) {
      memoryStore.advertisements[idx] = {
        ...memoryStore.advertisements[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      if (!updatedDoc) updatedDoc = memoryStore.advertisements[idx];
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    // Audit log
    await logActivity(
      {
        eventType: "Ad Updated",
        userName: req.admin?.name || req.admin?.email || "Admin",
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `Updated advertisement "${updatedDoc.title}" (${id})`,
      },
      req
    ).catch(() => {});

    return res.json({
      success: true,
      message: "Advertisement updated successfully",
      advertisement: updatedDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update advertisement" });
  }
});

// 5. PATCH /api/admin/advertisements/:id/toggle - Toggle active status
router.patch("/:id/toggle", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    let currentStatus = true;

    if (isMongoConnected()) {
      try {
        const doc = await Advertisement.findById(id);
        if (doc) {
          doc.active = !doc.active;
          await doc.save();
          currentStatus = doc.active;

          await logActivity(
            {
              eventType: "Ad Status Toggled",
              userName: req.admin?.name || req.admin?.email || "Admin",
              email: req.admin?.email || "admin@alike.com",
              status: "success",
              details: `Toggled ad "${doc.title}" to ${doc.active ? "Active" : "Disabled"}`,
            },
            req
          ).catch(() => {});

          return res.json({ success: true, active: doc.active, advertisement: doc.toObject() });
        }
      } catch (err) {
        console.warn("MongoDB toggle ad fallback to memory:", err);
      }
    }

    if (!memoryStore.advertisements) memoryStore.advertisements = [...DEFAULT_ADVERTISEMENTS];
    const item = memoryStore.advertisements.find((a) => a._id === id || String(a.id) === id);
    if (item) {
      item.active = !item.active;
      currentStatus = item.active;

      await logActivity(
        {
          eventType: "Ad Status Toggled",
          userName: req.admin?.name || req.admin?.email || "Admin",
          email: req.admin?.email || "admin@alike.com",
          status: "success",
          details: `Toggled ad "${item.title}" to ${item.active ? "Active" : "Disabled"}`,
        },
        req
      ).catch(() => {});

      return res.json({ success: true, active: currentStatus, advertisement: item });
    }

    return res.status(404).json({ error: "Advertisement not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle advertisement" });
  }
});

// 6. DELETE /api/admin/advertisements/:id - Delete advertisement
router.delete("/:id", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    let deletedTitle = "";
    if (isMongoConnected()) {
      try {
        const doc = await Advertisement.findByIdAndDelete(id);
        if (doc) deletedTitle = doc.title;
      } catch (err) {
        console.warn("MongoDB delete ad fallback to memory:", err);
      }
    }

    if (!memoryStore.advertisements) memoryStore.advertisements = [...DEFAULT_ADVERTISEMENTS];
    const idx = memoryStore.advertisements.findIndex((a) => a._id === id || String(a.id) === id);
    if (idx !== -1) {
      if (!deletedTitle) deletedTitle = memoryStore.advertisements[idx].title;
      memoryStore.advertisements.splice(idx, 1);
    }

    // Audit log
    await logActivity(
      {
        eventType: "Ad Deleted",
        userName: req.admin?.name || req.admin?.email || "Admin",
        email: req.admin?.email || "admin@alike.com",
        status: "success",
        details: `Permanently deleted advertisement "${deletedTitle || id}"`,
      },
      req
    ).catch(() => {});

    return res.json({ success: true, message: "Advertisement deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to delete advertisement" });
  }
});

// 7. POST /api/advertisements/:id/click - Increment click metric safely
router.post("/:id/click", async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        await Advertisement.findByIdAndUpdate(id, { $inc: { clickCount: 1 } });
      } catch {}
    }
    if (memoryStore.advertisements) {
      const ad = memoryStore.advertisements.find((a) => a._id === id || String(a.id) === id);
      if (ad) ad.clickCount = (ad.clickCount || 0) + 1;
    }
    return res.json({ success: true });
  } catch {
    return res.json({ success: false });
  }
});

export default router;
