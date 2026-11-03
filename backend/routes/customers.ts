import { Router } from "express";
<<<<<<< HEAD
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import Customer from "../models/Customer";
import Order from "../models/Order";
import ReturnRequest from "../models/ReturnRequest";
import { Ticket } from "../models/CustomerCare";
=======
import User from "../models/User";
import Customer from "../models/Customer";
import Order from "../models/Order";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
import { requireAdmin, requireSuperAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();
router.use(requireAdmin);

<<<<<<< HEAD
// Standard 12 individual restriction keys
export const VALID_RESTRICTIONS = [
  "login_block",
  "discount_card_block",
  "coupon_block",
  "order_block",
  "cod_block",
  "online_payment_block",
  "refund_block",
  "return_block",
  "review_block",
  "messaging_block",
  "loyalty_block",
  "other_feature_block",
] as const;

// Helper to get performing admin name
function getAdminInfo(req: any) {
  return {
    email: req.admin?.email || req.user?.email || "admin@alike-nd.com",
    name: req.admin?.name || req.user?.name || "Administrator",
    role: req.admin?.role || (req.admin?.isSuperAdmin ? "superadmin" : "admin"),
  };
}

// =========================================================================
// 1. GET /api/admin/customers - List all registered customers with stats
// =========================================================================
=======
// GET /api/admin/customers - Fetch all registered users (Admins & Superadmins)
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
router.get("/", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const users = await User.find().sort({ createdAt: -1 });
        const orders = await Order.find().lean();

<<<<<<< HEAD
        const formattedUsers = users.map((u) => {
          const userOrders = orders.filter(
            (o) =>
              o.memberName?.toLowerCase() === u.fullName?.toLowerCase() ||
              o.memberEmail?.toLowerCase() === u.email?.toLowerCase()
          );
          const spend = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          const isAutoVip = userOrders.length > 10;
          const normalizedTier =
            u.tier === "VIP" || u.tier === "Platinum" || isAutoVip ? "VIP" : (u.tier || "Normal");

          const restrictions = (u.restrictions as any) || {};
          const activeRestrictionsCount = Object.values(restrictions).filter(
            (r: any) => r && r.enabled
          ).length;
=======
        // Map users with calculated order stats
        const formattedUsers = users.map((u) => {
          const userOrders = orders.filter(
            (o) => o.memberName?.toLowerCase() === u.fullName?.toLowerCase() || o.memberEmail?.toLowerCase() === u.email?.toLowerCase()
          );
          const spend = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
          const isAutoVip = userOrders.length > 10;
          const normalizedTier = (u.tier === "VIP" || u.tier === "Platinum" || isAutoVip) ? "VIP" : "Normal";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

          return {
            _id: String(u._id),
            name: u.fullName,
<<<<<<< HEAD
            fullName: u.fullName,
            email: u.email,
            phone: u.phone || `${u.country || "+880"} ${u.mobileNumber || ""}`,
            country: u.country || "+880",
            mobileNumber: u.mobileNumber || "",
            avatar: u.avatar || "",
            tier: normalizedTier,
            isBlocked: Boolean(u.isBlocked || restrictions?.login_block?.enabled),
            verified: Boolean(u.verified),
            ordersCount: userOrders.length,
            lifetimeSpend: spend,
            activeRestrictionsCount,
            restrictions,
            adminNotes: u.adminNotes || "",
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
=======
            email: u.email,
            phone: u.phone || `${u.country} ${u.mobileNumber}`,
            country: u.country,
            mobileNumber: u.mobileNumber,
            tier: normalizedTier,
            isBlocked: Boolean(u.isBlocked),
            verified: Boolean(u.verified),
            ordersCount: userOrders.length,
            lifetimeSpend: spend,
            createdAt: u.createdAt,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
          };
        });

        return res.json(formattedUsers);
      } catch (err) {
<<<<<<< HEAD
        console.warn("MongoDB fetch users failed, checking in-memory:", err);
=======
        console.warn("MongoDB fetch users failed, checking Customer collection or in-memory:", err);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      }
    }

    // In-memory fallback
    const memList = (memoryStore.users || []).map((u) => {
      const userOrders = (memoryStore.orders || []).filter(
<<<<<<< HEAD
        (o) =>
          o.memberName?.toLowerCase() === u.fullName?.toLowerCase() ||
          o.memberEmail?.toLowerCase() === u.email?.toLowerCase()
      );
      const spend = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const isAutoVip = userOrders.length > 10;
      const restrictions = (u.restrictions as any) || {};
      const activeRestrictionsCount = Object.values(restrictions).filter(
        (r: any) => r && r.enabled
      ).length;

      return {
        _id: u._id,
        name: u.fullName,
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || `${u.country || "+880"} ${u.mobileNumber || ""}`,
        country: u.country || "+880",
        mobileNumber: u.mobileNumber || "",
        avatar: u.avatar || "",
        tier:
          (u.tier as string) === "VIP" || u.tier === "Platinum" || isAutoVip
            ? "VIP"
            : (u.tier || "Normal"),
        isBlocked: Boolean(u.isBlocked || restrictions?.login_block?.enabled),
        verified: u.verified !== false,
        ordersCount: userOrders.length,
        lifetimeSpend: spend,
        activeRestrictionsCount,
        restrictions,
        adminNotes: u.adminNotes || "",
        createdAt: u.createdAt,
        updatedAt: u.createdAt,
      };
    });

    return res.json(memList);
=======
        (o) => o.memberName?.toLowerCase() === u.fullName?.toLowerCase() || o.memberEmail?.toLowerCase() === u.email?.toLowerCase()
      );
      const isAutoVip = userOrders.length > 10;
      return {
        _id: u._id,
        name: u.fullName,
        email: u.email,
        phone: u.phone || `${u.country} ${u.mobileNumber}`,
        country: u.country,
        mobileNumber: u.mobileNumber,
        tier: ((u.tier as string) === "VIP" || u.tier === "Platinum" || isAutoVip) ? "VIP" : "Normal",
        isBlocked: false,
        verified: true,
        ordersCount: userOrders.length,
        lifetimeSpend: userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
        createdAt: u.createdAt,
      };
    });

    return res.json(memList.length > 0 ? memList : memoryStore.customers);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch customer list" });
  }
});

<<<<<<< HEAD
// =========================================================================
// 2. GET /api/admin/customers/:id - Detailed customer dossier with tabs
// =========================================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let userDoc: any = null;
    let ordersList: any[] = [];
    let ticketsList: any[] = [];
    let returnsList: any[] = [];

    if (isMongoConnected()) {
      try {
        userDoc = await User.findById(id).lean();
        if (!userDoc) {
          userDoc = await User.findOne({ email: id.toLowerCase() }).lean();
        }

        if (userDoc) {
          ordersList = await Order.find({
            $or: [
              { memberEmail: userDoc.email.toLowerCase() },
              { memberName: userDoc.fullName },
            ],
          })
            .sort({ createdAt: -1 })
            .lean();

          ticketsList = await Ticket.find({
            $or: [
              { customerEmail: userDoc.email.toLowerCase() },
              { customerId: String(userDoc._id) },
            ],
          })
            .sort({ createdAt: -1 })
            .lean();

          returnsList = await ReturnRequest.find({
            $or: [
              { customerEmail: userDoc.email.toLowerCase() },
              { customerId: String(userDoc._id) },
            ],
          })
            .sort({ createdAt: -1 })
            .lean();
        }
      } catch (dbErr) {
        console.warn("MongoDB fetch single user error, checking memory:", dbErr);
      }
    }

    if (!userDoc) {
      userDoc = (memoryStore.users || []).find(
        (u) => u._id === id || u.email.toLowerCase() === id.toLowerCase()
      );
      if (userDoc) {
        ordersList = (memoryStore.orders || []).filter(
          (o) =>
            o.memberEmail?.toLowerCase() === userDoc.email.toLowerCase() ||
            o.memberName?.toLowerCase() === userDoc.fullName?.toLowerCase()
        );
        ticketsList = (memoryStore.tickets || []).filter(
          (t) =>
            t.customerEmail?.toLowerCase() === userDoc.email.toLowerCase() ||
            t.customerId === userDoc._id
        );
        returnsList = (memoryStore.returnRequests || []).filter(
          (r) =>
            r.customerEmail?.toLowerCase() === userDoc.email.toLowerCase() ||
            r.customerId === userDoc._id
        );
      }
    }

    if (!userDoc) {
      return res.status(404).json({ error: "Customer not found in registry" });
    }

    const spend = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const isAutoVip = ordersList.length > 10;
    const normalizedTier =
      userDoc.tier === "VIP" || userDoc.tier === "Platinum" || isAutoVip
        ? "VIP"
        : (userDoc.tier || "Normal");

    const restrictions = userDoc.restrictions || {};

    return res.json({
      customer: {
        _id: String(userDoc._id),
        name: userDoc.fullName,
        fullName: userDoc.fullName,
        username: userDoc.username || "",
        email: userDoc.email,
        phone: userDoc.phone || `${userDoc.country || "+880"} ${userDoc.mobileNumber || ""}`,
        country: userDoc.country || "+880",
        mobileNumber: userDoc.mobileNumber || "",
        avatar: userDoc.avatar || "",
        tier: normalizedTier,
        verified: Boolean(userDoc.verified),
        isBlocked: Boolean(userDoc.isBlocked || restrictions?.login_block?.enabled),
        adminNotes: userDoc.adminNotes || "",
        addresses: userDoc.addresses || [
          {
            name: userDoc.fullName,
            street: "74 Gulshan Avenue",
            city: "Dhaka",
            state: "Dhaka Division",
            zip: "1212",
            phone: userDoc.phone || userDoc.mobileNumber || "",
            isDefault: true,
          },
        ],
        restrictions,
        restrictionAuditLog: userDoc.restrictionAuditLog || [],
        securityAuditLog: userDoc.securityAuditLog || [],
        ordersCount: ordersList.length,
        lifetimeSpend: spend,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt || userDoc.createdAt,
      },
      orders: ordersList,
      tickets: ticketsList,
      returns: returnsList,
      discountCards: [
        {
          id: "card_atelier_vip",
          title: "Atelier Guild VIP Card",
          code: normalizedTier === "VIP" ? "VIP-PRIVILEGE-15" : "MEMBER-PERK-05",
          discountPercent: normalizedTier === "VIP" ? 15 : 5,
          active: !restrictions?.discount_card_block?.enabled,
          expiry: "2027-12-31",
        },
        {
          id: "card_welcome_tier",
          title: "Seasonal Luxury Allowance",
          code: "LUXE-SPRING-10",
          discountPercent: 10,
          active: !restrictions?.discount_card_block?.enabled,
          expiry: "2026-12-31",
        },
      ],
      paymentStats: {
        codAllowed: !restrictions?.cod_block?.enabled,
        onlinePaymentAllowed: !restrictions?.online_payment_block?.enabled,
        refundsAllowed: !restrictions?.refund_block?.enabled,
        returnsAllowed: !restrictions?.return_block?.enabled,
        preferredMethod: ordersList[0]?.paymentMethod || "CARD",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch customer profile dossier" });
  }
});

// =========================================================================
// 3. PUT /api/admin/customers/:id/profile - Edit permitted profile fields
// =========================================================================
router.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, mobileNumber, country, phone, tier, adminNotes, addresses, verified } =
      req.body;

    const admin = getAdminInfo(req);

    const updateFields: any = {};
    if (fullName !== undefined) updateFields.fullName = String(fullName).trim();
    if (mobileNumber !== undefined) updateFields.mobileNumber = String(mobileNumber).trim();
    if (country !== undefined) updateFields.country = String(country).trim();
    if (phone !== undefined) updateFields.phone = String(phone).trim();
    if (tier !== undefined) updateFields.tier = tier;
    if (adminNotes !== undefined) updateFields.adminNotes = String(adminNotes);
    if (Array.isArray(addresses)) updateFields.addresses = addresses;
    if (verified !== undefined) updateFields.verified = Boolean(verified);

    const auditEntry = {
      action: "PROFILE_UPDATED",
      performedBy: `${admin.name} (${admin.email})`,
      details: `Profile fields modified by admin: ${Object.keys(updateFields).join(", ")}`,
      timestamp: new Date(),
    };

    if (isMongoConnected()) {
      const user = await User.findById(id);
      if (user) {
        Object.assign(user, updateFields);
        user.securityAuditLog = user.securityAuditLog || [];
        user.securityAuditLog.unshift(auditEntry);
        await user.save();

        // Also update Customer summary roster collection if exists
        try {
          await Customer.findOneAndUpdate(
            { email: user.email },
            {
              name: user.fullName,
              tier: user.tier,
            }
          );
        } catch {}

        return res.json({
          success: true,
          message: "Customer profile information updated successfully.",
          user,
=======
// PATCH /api/admin/customers/:id/block - Block or Unblock a customer account (SUPER ADMIN ONLY)
router.patch("/:id/block", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({ error: "isBlocked boolean field is required" });
    }

    if (isMongoConnected()) {
      const updatedUser = await User.findByIdAndUpdate(id, { isBlocked }, { new: true });
      if (updatedUser) {
        console.log(`🛡️ [SUPER ADMIN ACTION] User ${updatedUser.email} isBlocked set to ${isBlocked}`);
        return res.json({
          success: true,
          message: `User ${updatedUser.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
          user: {
            _id: String(updatedUser._id),
            name: updatedUser.fullName,
            email: updatedUser.email,
            isBlocked: updatedUser.isBlocked,
            tier: updatedUser.tier,
          },
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        });
      }
    }

    // In-memory fallback
<<<<<<< HEAD
    const memUser = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (memUser) {
      Object.assign(memUser, updateFields);
      memUser.securityAuditLog = memUser.securityAuditLog || [];
      memUser.securityAuditLog.unshift(auditEntry);

      const memCust = (memoryStore.customers || []).find((c) => c.email === memUser.email);
      if (memCust) {
        if (updateFields.fullName) memCust.name = updateFields.fullName;
        if (updateFields.tier) memCust.tier = updateFields.tier as any;
      }

      return res.json({
        success: true,
        message: "Customer profile updated in memory store.",
        user: memUser,
      });
    }

    return res.status(404).json({ error: "Customer record not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile information" });
  }
});

// =========================================================================
// 4. POST /api/admin/customers/:id/restrictions - Toggle individual restriction
// =========================================================================
router.post("/:id/restrictions", async (req, res) => {
  try {
    const { id } = req.params;
    const { restrictionKey, enabled, reason, adminNote, expiresAt } = req.body;

    if (!restrictionKey || typeof enabled !== "boolean") {
      return res.status(400).json({
        error: "Both restrictionKey and enabled (boolean) parameters are required.",
      });
    }

    if (!VALID_RESTRICTIONS.includes(restrictionKey)) {
      return res.status(400).json({
        error: `Invalid restriction key. Allowed values: ${VALID_RESTRICTIONS.join(", ")}`,
      });
    }

    const admin = getAdminInfo(req);

    // If restricting login, require super admin
    if (restrictionKey === "login_block" && admin.role !== "superadmin") {
      return res.status(403).json({
        error: "Account Login Block is reserved for Super Administrators.",
      });
    }

    const auditEntry = {
      restrictionKey,
      action: enabled ? ("enabled" as const) : ("disabled" as const),
      reason: reason || "Administrative intervention",
      adminNote: adminNote || "",
      performedBy: `${admin.name} (${admin.email})`,
      timestamp: new Date(),
    };

    const restrictionObj = {
      enabled,
      reason: reason || "",
      adminNote: adminNote || "",
      appliedBy: `${admin.name} (${admin.email})`,
      appliedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    };

    if (isMongoConnected()) {
      const user = await User.findById(id);
      if (user) {
        user.restrictions = user.restrictions || {};
        user.restrictions[restrictionKey] = restrictionObj;

        // Keep isBlocked backward compatibility in sync if login_block changed
        if (restrictionKey === "login_block") {
          user.isBlocked = enabled;
        }

        user.restrictionAuditLog = user.restrictionAuditLog || [];
        user.restrictionAuditLog.unshift(auditEntry);
        user.markModified("restrictions");
        user.markModified("restrictionAuditLog");
        await user.save();

        return res.json({
          success: true,
          message: `Restriction "${restrictionKey}" has been ${enabled ? "applied" : "removed"}.`,
          restrictions: user.restrictions,
          auditLog: user.restrictionAuditLog,
=======
    const userInMem = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (userInMem) {
      return res.json({
        success: true,
        message: `User ${userInMem.email} has been ${isBlocked ? "blocked" : "unblocked"}.`,
        user: { ...userInMem, isBlocked },
      });
    }

    return res.status(404).json({ error: "User document not found in database" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user block status" });
  }
});

// PATCH /api/admin/customers/:id/tier - Update member loyalty tier (SUPER ADMIN ONLY)
router.patch("/:id/tier", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { tier } = req.body;
    if (!["VIP", "Normal", "Silver", "Gold", "Platinum"].includes(tier)) {
      return res.status(400).json({ error: "Invalid tier value" });
    }
    const finalTier = tier === "VIP" ? "VIP" : "Normal";

    if (isMongoConnected()) {
      const updatedUser = await User.findByIdAndUpdate(id, { tier: finalTier }, { new: true });
      if (updatedUser) {
        return res.json({
          success: true,
          user: {
            ...updatedUser.toObject(),
            tier: finalTier,
          },
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        });
      }
    }

<<<<<<< HEAD
    // In-memory fallback
    const memUser = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (memUser) {
      memUser.restrictions = memUser.restrictions || {};
      memUser.restrictions[restrictionKey] = restrictionObj;
      if (restrictionKey === "login_block") {
        memUser.isBlocked = enabled;
      }
      memUser.restrictionAuditLog = memUser.restrictionAuditLog || [];
      memUser.restrictionAuditLog.unshift(auditEntry);

      return res.json({
        success: true,
        message: `Restriction "${restrictionKey}" has been ${enabled ? "applied" : "removed"}.`,
        restrictions: memUser.restrictions,
        auditLog: memUser.restrictionAuditLog,
      });
    }

    return res.status(404).json({ error: "Customer not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update user restriction" });
  }
});

// =========================================================================
// 5. POST /api/admin/customers/:id/change-email - Secure Email Update
// =========================================================================
router.post("/:id/change-email", async (req, res) => {
  try {
    const { id } = req.params;
    const { newEmail, reason } = req.body;

    if (!newEmail || !String(newEmail).includes("@")) {
      return res.status(400).json({ error: "A valid new email address is required." });
    }

    const cleanNewEmail = String(newEmail).trim().toLowerCase();
    const admin = getAdminInfo(req);

    if (isMongoConnected()) {
      // Check if new email already belongs to another user
      const conflict = await User.findOne({ email: cleanNewEmail, _id: { $ne: id } });
      if (conflict) {
        return res.status(409).json({ error: `The email "${cleanNewEmail}" is already registered to another customer.` });
      }

      const user = await User.findById(id);
      if (user) {
        const oldEmail = user.email;
        user.email = cleanNewEmail;
        user.securityAuditLog = user.securityAuditLog || [];
        user.securityAuditLog.unshift({
          action: "EMAIL_CHANGED",
          performedBy: `${admin.name} (${admin.email})`,
          details: `Email changed from ${oldEmail} to ${cleanNewEmail}. Reason: ${reason || "Admin update"}`,
          timestamp: new Date(),
        });
        await user.save();

        // Sync Customer record if exists
        try {
          await Customer.findOneAndUpdate({ email: oldEmail }, { email: cleanNewEmail });
        } catch {}

        return res.json({
          success: true,
          message: `Customer email successfully updated to ${cleanNewEmail}.`,
          oldEmail,
          newEmail: cleanNewEmail,
        });
      }
    }

    // In-memory fallback
    const memUser = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (memUser) {
      const conflict = (memoryStore.users || []).find((u) => u.email.toLowerCase() === cleanNewEmail && u._id !== memUser._id);
      if (conflict) {
        return res.status(409).json({ error: `The email "${cleanNewEmail}" is already registered to another user.` });
      }

      const oldEmail = memUser.email;
      memUser.email = cleanNewEmail;
      memUser.securityAuditLog = memUser.securityAuditLog || [];
      memUser.securityAuditLog.unshift({
        action: "EMAIL_CHANGED",
        performedBy: `${admin.name} (${admin.email})`,
        details: `Email changed from ${oldEmail} to ${cleanNewEmail}. Reason: ${reason || "Admin update"}`,
        timestamp: new Date(),
      });

      return res.json({
        success: true,
        message: `Customer email successfully updated to ${cleanNewEmail}.`,
        oldEmail,
        newEmail: cleanNewEmail,
      });
    }

    return res.status(404).json({ error: "Customer not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update email address" });
  }
});

// =========================================================================
// 6. POST /api/admin/customers/:id/change-phone - Secure Mobile Update
// =========================================================================
router.post("/:id/change-phone", async (req, res) => {
  try {
    const { id } = req.params;
    const { newMobileNumber, country = "+880", reason } = req.body;

    if (!newMobileNumber || String(newMobileNumber).trim().length < 6) {
      return res.status(400).json({ error: "A valid mobile number is required." });
    }

    const cleanPhone = String(newMobileNumber).trim().replace(/[^\d]/g, "");
    const cleanCountry = String(country).trim();
    const formattedPhone = `${cleanCountry} ${cleanPhone}`;
    const admin = getAdminInfo(req);

    if (isMongoConnected()) {
      const user = await User.findById(id);
      if (user) {
        const oldPhone = user.phone || `${user.country} ${user.mobileNumber}`;
        user.mobileNumber = cleanPhone;
        user.country = cleanCountry;
        user.phone = formattedPhone;
        user.securityAuditLog = user.securityAuditLog || [];
        user.securityAuditLog.unshift({
          action: "PHONE_CHANGED",
          performedBy: `${admin.name} (${admin.email})`,
          details: `Phone changed from ${oldPhone} to ${formattedPhone}. Reason: ${reason || "Admin update"}`,
          timestamp: new Date(),
        });
        await user.save();

        return res.json({
          success: true,
          message: `Customer mobile number updated to ${formattedPhone}.`,
          oldPhone,
          newPhone: formattedPhone,
        });
      }
    }

    // In-memory fallback
    const memUser = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (memUser) {
      const oldPhone = memUser.phone || `${memUser.country} ${memUser.mobileNumber}`;
      memUser.mobileNumber = cleanPhone;
      memUser.country = cleanCountry;
      memUser.phone = formattedPhone;
      memUser.securityAuditLog = memUser.securityAuditLog || [];
      memUser.securityAuditLog.unshift({
        action: "PHONE_CHANGED",
        performedBy: `${admin.name} (${admin.email})`,
        details: `Phone changed from ${oldPhone} to ${formattedPhone}. Reason: ${reason || "Admin update"}`,
        timestamp: new Date(),
      });

      return res.json({
        success: true,
        message: `Customer mobile number updated to ${formattedPhone}.`,
        oldPhone,
        newPhone: formattedPhone,
      });
    }

    return res.status(404).json({ error: "Customer not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update mobile number" });
  }
});

// =========================================================================
// 7. POST /api/admin/customers/:id/password-reset - Secure Password Reset
// =========================================================================
router.post("/:id/password-reset", async (req, res) => {
  try {
    const { id } = req.params;
    const { mode = "link", reason } = req.body; // "link" | "temporary"
    const admin = getAdminInfo(req);

    let targetEmail = "";
    let userName = "";

    // Generate temporary password or reset link token
    const resetToken = crypto.randomBytes(24).toString("hex");
    const tempPassword = `Alike#${crypto.randomInt(100000, 999999)}`;
    const newHash = bcrypt.hashSync(tempPassword, 10);

    if (isMongoConnected()) {
      const user = await User.findById(id);
      if (user) {
        targetEmail = user.email;
        userName = user.fullName;

        if (mode === "temporary") {
          user.passwordHash = newHash;
        }

        user.securityAuditLog = user.securityAuditLog || [];
        user.securityAuditLog.unshift({
          action: mode === "temporary" ? "TEMP_PASSWORD_GENERATED" : "RESET_LINK_DISPATCHED",
          performedBy: `${admin.name} (${admin.email})`,
          details: `Password reset initiated via ${mode}. Reason: ${reason || "Customer request"}`,
          timestamp: new Date(),
        });
        await user.save();
      }
    } else {
      const memUser = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
      if (memUser) {
        targetEmail = memUser.email;
        userName = memUser.fullName;

        if (mode === "temporary") {
          memUser.passwordHash = newHash;
        }

        memUser.securityAuditLog = memUser.securityAuditLog || [];
        memUser.securityAuditLog.unshift({
          action: mode === "temporary" ? "TEMP_PASSWORD_GENERATED" : "RESET_LINK_DISPATCHED",
          performedBy: `${admin.name} (${admin.email})`,
          details: `Password reset initiated via ${mode}. Reason: ${reason || "Customer request"}`,
          timestamp: new Date(),
        });
      }
    }

    if (!targetEmail) {
      return res.status(404).json({ error: "Customer not found" });
    }

    if (mode === "temporary") {
      return res.json({
        success: true,
        mode: "temporary",
        message: `Temporary password generated for ${userName} (${targetEmail}). The customer must change this password upon first login.`,
        tempPassword,
      });
    }

    // Default: Reset link mode
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}&email=${encodeURIComponent(targetEmail)}`;
    return res.json({
      success: true,
      mode: "link",
      message: `Password reset workflow triggered for ${userName} (${targetEmail}). A secure reset notice has been logged.`,
      resetUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to initiate password reset" });
  }
});

// =========================================================================
// 8. GET /api/admin/customers/:id/preview-data - Safe admin preview snapshot
// =========================================================================
router.get("/:id/preview-data", async (req, res) => {
  try {
    const { id } = req.params;

    let userDoc: any = null;
    let ordersList: any[] = [];

    if (isMongoConnected()) {
      userDoc = await User.findById(id).lean();
      if (!userDoc) userDoc = await User.findOne({ email: id.toLowerCase() }).lean();
      if (userDoc) {
        ordersList = await Order.find({
          $or: [
            { memberEmail: userDoc.email.toLowerCase() },
            { memberName: userDoc.fullName },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
      }
    }

    if (!userDoc) {
      userDoc = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
      if (userDoc) {
        ordersList = (memoryStore.orders || []).filter(
          (o) =>
            o.memberEmail?.toLowerCase() === userDoc.email.toLowerCase() ||
            o.memberName?.toLowerCase() === userDoc.fullName?.toLowerCase()
        );
      }
    }

    if (!userDoc) {
      return res.status(404).json({ error: "Customer not found" });
    }

    return res.json({
      previewUser: {
        _id: String(userDoc._id),
        name: userDoc.fullName,
        email: userDoc.email,
        phone: userDoc.phone || `${userDoc.country} ${userDoc.mobileNumber}`,
        tier: userDoc.tier,
        avatar: userDoc.avatar || "",
        addresses: userDoc.addresses || [],
        restrictions: userDoc.restrictions || {},
      },
      orders: ordersList,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to generate preview snapshot" });
=======
    const userInMem = (memoryStore.users || []).find((u) => u._id === id || u.email === id);
    if (userInMem) {
      userInMem.tier = finalTier as any;
      return res.json({ success: true, user: userInMem });
    }

    return res.status(404).json({ error: "User document not found in database" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update member tier" });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  }
});

export default router;
<<<<<<< HEAD
=======


>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
