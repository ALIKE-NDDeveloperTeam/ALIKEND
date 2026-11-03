import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";
import Seller from "../models/Seller";
import SellerWithdrawal from "../models/SellerWithdrawal";
import ActivityLog from "../models/ActivityLog";
import { requireAdmin, requireSuperAdmin, AuthedRequest, resolveAdminRole, isSuperAdminRole, timingSafePasswordEqual } from "../middleware/auth";
import { getJwtSecret } from "../config/jwt";
import { isMongoConnected, connectMongoDB, memoryStore, INITIAL_SUPERADMIN_EMAIL, INITIAL_STAFF_EMAIL } from "../store";
import { logActivity } from "../utils/activityLogger";
import { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginAttempts } from "../utils/bruteForce";

const router = Router();

// Helper: keeps memoryStore.admins in sync whenever a password hash changes in MongoDB
export function syncAdminPasswordToMemoryStore(
  email: string,
  newPasswordHash: string,
  extraData?: { name?: string; role?: "superadmin" | "admin"; isActive?: boolean }
): void {
  const cleanEmail = email.toLowerCase().trim();
  if (!memoryStore.admins) memoryStore.admins = [];

  const existingIndex = memoryStore.admins.findIndex(
    (a) => a.email.toLowerCase() === cleanEmail
  );

  if (existingIndex !== -1) {
    memoryStore.admins[existingIndex].passwordHash = newPasswordHash;
    if (extraData?.name) memoryStore.admins[existingIndex].name = extraData.name;
    if (extraData?.role) memoryStore.admins[existingIndex].role = extraData.role;
    if (extraData?.isActive !== undefined) memoryStore.admins[existingIndex].isActive = extraData.isActive;
  } else {
    memoryStore.admins.push({
      _id: `admin_${Date.now()}`,
      email: cleanEmail,
      name: extraData?.name || "Admin",
      role: extraData?.role || "admin",
      passwordHash: newPasswordHash,
      isActive: extraData?.isActive !== undefined ? extraData.isActive : true,
      createdAt: new Date(),
    });
  }

  // Also sync memoryStore.users if this admin exists in users table
  if (memoryStore.users) {
    const userIndex = memoryStore.users.findIndex(
      (u) => u.email?.toLowerCase() === cleanEmail
    );
    if (userIndex !== -1) {
      memoryStore.users[userIndex].passwordHash = newPasswordHash;
    }
  }
}

// POST /api/admin/login - Authenticate Super Admin or Regular Admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check brute-force rate limit (5 attempts within 15 minutes per IP / identifier)
    const rateLimit = await checkLoginRateLimit(req, cleanEmail);
    if (!rateLimit.allowed) {
      if (rateLimit.status === 503) {
        return res.status(503).json({ success: false, error: rateLimit.error });
      }
      res.setHeader("Retry-After", String(rateLimit.retryAfter || 900));
      return res.status(429).json({ success: false, error: "Too many attempts, try again later" });
    }

    let adminRecord: any = null;
    let isFromMongo = false;

    if (!isMongoConnected()) {
      try {
        await connectMongoDB();
      } catch {}
    }

    if (isMongoConnected()) {
      try {
        adminRecord = await Admin.findOne({ email: cleanEmail });
        if (adminRecord) isFromMongo = true;
      } catch (err) {
        console.warn("MongoDB admin query fallback:", err);
      }
    }

    // Dual persistence fallback: Seamlessly check memoryStore if MongoDB is offline or record not found
    if (!adminRecord) {
      adminRecord = (memoryStore.admins || []).find(
        (a) => a.email.toLowerCase() === cleanEmail
      );
    }

    const targetSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || INITIAL_SUPERADMIN_EMAIL || "developer.alikend@gmail.com").trim().toLowerCase();
    const isSuperAdminAccount = cleanEmail === targetSuperAdminEmail;

    if (!adminRecord && isSuperAdminAccount) {
      if (isMongoConnected()) {
        try {
          adminRecord = await Admin.findOne({ email: targetSuperAdminEmail });
          if (!adminRecord) {
            const rawEnvPass = process.env.INITIAL_ADMIN_PASSWORD;
            const initialHash = rawEnvPass ? await bcrypt.hash(rawEnvPass.trim(), 10) : "";
            adminRecord = await Admin.create({
              email: targetSuperAdminEmail,
              name: "Super Admin",
              role: "superadmin",
              passwordHash: initialHash,
              isActive: true,
            });
            isFromMongo = true;
          } else {
            isFromMongo = true;
          }
        } catch (err) {
          console.warn("MongoDB superadmin auto-provision warning:", err);
        }
      }
      if (!adminRecord) {
        adminRecord = (memoryStore.admins || []).find(
          (a) => a.email.toLowerCase() === targetSuperAdminEmail
        ) || {
          _id: "admin_super_init",
          email: targetSuperAdminEmail,
          name: "Super Admin",
          role: "superadmin",
          isActive: true,
        };
      }
    }

    if (!adminRecord) {
      await recordFailedLoginAttempt(req, cleanEmail);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: "Unauthorized Admin Attempt",
          email: cleanEmail,
          details: `Admin authentication failed: Invalid credentials`,
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (adminRecord.isActive === false) {
      await recordFailedLoginAttempt(req, cleanEmail);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: adminRecord.name || "Admin",
          email: adminRecord.email,
          details: "Admin login blocked: Account is deactivated",
        },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Admin account is suspended or inactive.",
      });
    }

    const hasStoredHash = Boolean(adminRecord.passwordHash && String(adminRecord.passwordHash).trim() !== "");
    let isMatch = false;

    if (isSuperAdminAccount) {
      // The INITIAL_ADMIN_PASSWORD env variable is the source of truth for the superadmin account
      const rawEnvPassword = process.env.INITIAL_ADMIN_PASSWORD;
      const expectedPassword = rawEnvPassword ? rawEnvPassword.trim() : "";
      const trimmedSubmittedPassword = password ? String(password).trim() : "";

      const expectedByteLen = Buffer.byteLength(expectedPassword, "utf-8");
      const submittedByteLen = Buffer.byteLength(password, "utf-8");
      const trimmedByteLen = Buffer.byteLength(trimmedSubmittedPassword, "utf-8");

      // Guard: Check that buffers have equal length first (Buffer.byteLength comparison)
      // and return 401 immediately if lengths differ, instead of letting timingSafeEqual throw
      if (expectedByteLen === 0 || (submittedByteLen !== expectedByteLen && trimmedByteLen !== expectedByteLen)) {
        await recordFailedLoginAttempt(req, cleanEmail);
        await logActivity(
          {
            eventType: "Failed Login",
            status: "failed",
            userName: adminRecord.name || "Super Admin",
            email: adminRecord.email,
            details: "Admin login failed: Invalid credentials",
          },
          req
        );
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      if (
        expectedPassword &&
        (timingSafePasswordEqual(password, expectedPassword) || timingSafePasswordEqual(trimmedSubmittedPassword, expectedPassword))
      ) {
        isMatch = true;
        try {
          const freshHash = await bcrypt.hash(expectedPassword, 10);
          adminRecord.passwordHash = freshHash;
          syncAdminPasswordToMemoryStore(cleanEmail, freshHash, { role: "superadmin", isActive: true });
          if (isFromMongo && adminRecord.save) {
            await adminRecord.save().catch(() => null);
          }
          if (isMongoConnected()) {
            await Admin.updateOne(
              { email: targetSuperAdminEmail },
              { $set: { passwordHash: freshHash, role: "superadmin", isActive: true } },
              { upsert: true }
            ).catch(() => null);
          }
        } catch (hashErr) {
          console.warn("Failed to update superadmin hash in database:", hashErr);
        }
      } else {
        // If the submitted password does not match the env value, reject with 401 "Invalid credentials". Do not add any other fallback passwords.
        isMatch = false;
      }
    } else {
      // Staff admins keep using their own stored hashes
      if (hasStoredHash) {
        try {
          isMatch = await bcrypt.compare(password, adminRecord.passwordHash);
        } catch {
          isMatch = false;
        }
      }
    }

    if (!isMatch) {
      await recordFailedLoginAttempt(req, cleanEmail);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: adminRecord.name || "Admin",
          email: adminRecord.email,
          details: "Admin login failed: Invalid credentials",
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    if (!hasStoredHash) {
      try {
        const newHash = await bcrypt.hash(password, 10);
        adminRecord.passwordHash = newHash;
        if (isFromMongo && adminRecord.save) {
          await adminRecord.save();
        }
        syncAdminPasswordToMemoryStore(cleanEmail, newHash, { role: adminRecord.role, isActive: adminRecord.isActive });
      } catch (_saveErr) {}
    }

    const role = resolveAdminRole(adminRecord.role, cleanEmail);

    const adminId = String(adminRecord._id || `admin_${Date.now()}`);

    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const token = jwt.sign(
      { adminId, email: adminRecord.email, name: adminRecord.name, role },
      secret,
      { expiresIn: "7d" }
    );

    console.log(`🛡️ [ADMIN AUTH SUCCESS] Logged in: ${adminRecord.email} [Role: ${role.toUpperCase()}]`);

    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: adminRecord.name || (role === "superadmin" ? "Super Admin" : "Operations Admin"),
        email: adminRecord.email,
        details: `${role === "superadmin" ? "Super Admin Console" : "Regular Operations Admin Console"} authenticated successfully`,
      },
      req
    );

    // Reset brute-force counter for this identifier
    await resetLoginAttempts(cleanEmail);

    return res.json({
      success: true,
      token,
      admin: {
        _id: adminId,
        email: adminRecord.email,
        name: adminRecord.name,
        role,
      },
      database: isFromMongo ? "alikendshop" : "in_memory",
      collection: "admins",
    });
  } catch (err: any) {
    console.error("💥 [ADMIN LOGIN ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Admin login failed" });
  }
});

// POST /api/admin/bridge-login - Seamless auto-authentication
router.post("/bridge-login", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bodyToken = req.body.userToken;
    const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.slice(7) : bodyToken;
    const submittedId = (req.body?.email ? String(req.body.email).toLowerCase().trim() : "") || "";

    // Check brute-force rate limit
    const rateLimit = await checkLoginRateLimit(req, submittedId);
    if (!rateLimit.allowed) {
      if (rateLimit.status === 503) {
        return res.status(503).json({ success: false, error: rateLimit.error });
      }
      res.setHeader("Retry-After", String(rateLimit.retryAfter || 900));
      return res.status(429).json({ success: false, error: "Too many attempts, try again later" });
    }

    // A valid, previously-issued token is REQUIRED to prove identity.
    // A bare email in the request body, with no token, is never sufficient on its own.
    if (!token) {
      await recordFailedLoginAttempt(req, submittedId);
      return res.status(401).json({
        success: false,
        error: "Bridge login requires a valid existing session token. Email alone is not sufficient.",
      });
    }

    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      await recordFailedLoginAttempt(req, submittedId);
      return res.status(401).json({ success: false, error: "Invalid or expired session token." });
    }

    if (decoded && decoded.adminId) {
      await resetLoginAttempts(decoded.email, submittedId);
      return res.json({
        success: true,
        token,
        admin: {
          _id: decoded.adminId,
          email: decoded.email,
          name: decoded.name || "Admin",
          role: resolveAdminRole(decoded.role, decoded.email),
        },
      });
    }

    if (!decoded || !decoded.email) {
      await recordFailedLoginAttempt(req, submittedId);
      return res.status(401).json({ success: false, error: "Token does not contain a verifiable identity." });
    }

    const email = String(decoded.email).toLowerCase().trim();

    if (isMongoConnected()) {
      try {
        const adminDoc = await Admin.findOne({ email });
        if (adminDoc && adminDoc.isActive !== false) {
          const role = resolveAdminRole(adminDoc.role, email);
          const adminToken = jwt.sign(
            { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role },
            secret,
            { expiresIn: "7d" }
          );
          await resetLoginAttempts(email, submittedId);
          return res.json({
            success: true,
            token: adminToken,
            admin: { _id: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role },
          });
        }
      } catch (err) {
        console.warn("MongoDB bridge-login query error, falling back to memory:", err);
      }
    }

    // Dual persistence fallback: Seamlessly check memoryStore
    const memAdmin = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === email);
    if (memAdmin && memAdmin.isActive !== false) {
      const role = resolveAdminRole(memAdmin.role, email);
      const adminToken = jwt.sign(
        { adminId: memAdmin._id || `admin_${Date.now()}`, email: memAdmin.email, name: memAdmin.name, role },
        secret,
        { expiresIn: "7d" }
      );
      await resetLoginAttempts(email, submittedId);
      return res.json({
        success: true,
        token: adminToken,
        admin: { _id: memAdmin._id || `admin_${Date.now()}`, email: memAdmin.email, name: memAdmin.name, role },
      });
    }

    await recordFailedLoginAttempt(req, email || submittedId);
    return res.status(403).json({
      success: false,
      error: "User is not registered as an administrator in alikendshop.admins",
    });
  } catch (err: any) {
    console.error("💥 [BRIDGE LOGIN ERROR]:", err);
    return res.status(500).json({ success: false, error: err.message || "Bridge login failed" });
  }
});

// GET /api/admin/me - Verify current admin session
router.get("/me", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const admin = req.admin!;
    return res.json({
      valid: true,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, valid: false, error: err.message });
  }
});

// GET /api/admin/admin-users - List all admin accounts (Viewable by authenticated Admins and Super Admins)
router.get("/admin-users", requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    if (isMongoConnected()) {
      try {
        const admins = await Admin.find().sort({ createdAt: -1 }).select("-passwordHash");
        // Defensive filter excluding corrupted or empty ghost entries
        const validAdmins = admins.filter(
          (a) => a.email && a.email.trim() !== "" && a.name && a.name.trim() !== ""
        );
        return res.json(validAdmins);
      } catch (err) {
        console.warn("MongoDB fetch admins failed, falling back to memory:", err);
      }
    }

    const safeMemAdmins = (memoryStore.admins || [])
      .filter((a) => a.email && a.email.trim() !== "" && a.name && a.name.trim() !== "")
      .map((a) => ({
        _id: a._id || `admin_${a.email}`,
        email: a.email.trim(),
        name: a.name.trim(),
        role: resolveAdminRole(a),
        isActive: a.isActive !== false,
        createdAt: a.createdAt || new Date(),
      }));

    return res.json(safeMemAdmins);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch admin accounts" });
  }
});

// POST /api/admin/admin-users - Create a new Admin account with specialized Ministry roles (SUPER ADMIN ONLY)
router.post("/admin-users", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const {
      email,
      password,
      name,
      role = "admin",
      phone = "",
      department = "",
      designation = "",
    } = req.body;

    // 1. Trim email, password, and name first, then check that none are empty
    const cleanEmail = typeof email === "string" ? email.toLowerCase().trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    const cleanDepartment = typeof department === "string" ? department.trim() : "";
    const cleanDesignation = typeof designation === "string" ? designation.trim() : "";

    if (!cleanEmail || !cleanName || !cleanPassword) {
      return res.status(400).json({
        success: false,
        error: "Name, email, and password are required and cannot be empty or whitespace-only.",
      });
    }

    if (cleanPassword.length < 10) {
      return res.status(400).json({
        success: false,
        error: "Admin password must be at least 10 characters long.",
      });
    }

    // Check if already exists in MongoDB or in-memory store
    if (isMongoConnected()) {
      try {
        const existing = await Admin.findOne({ email: cleanEmail });
        if (existing) {
          return res.status(409).json({ success: false, error: "An admin account with this email already exists" });
        }
      } catch (err) {
        console.warn("MongoDB check admin fallback:", err);
      }
    }

    const existingMem = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
    if (existingMem) {
      return res.status(409).json({ success: false, error: "An admin account with this email already exists" });
    }

    const VALID_ROLES = [
      "superadmin",
      "main_admin",
      "sub_admin",
      "user_admin",
      "order_admin",
      "catalog_admin",
      "seller_admin",
      "finance_admin",
      "support_admin",
      "admin",
    ];
    const assignedRole = VALID_ROLES.includes(role) ? role : "admin";

    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    let createdId = `admin_${Date.now()}`;

    if (isMongoConnected()) {
      try {
        const created = await Admin.create({
          email: cleanEmail,
          passwordHash,
          name: cleanName,
          role: assignedRole,
          phone: cleanPhone,
          department: cleanDepartment,
          designation: cleanDesignation,
          isActive: true,
        });
        createdId = String(created._id);
      } catch (err) {
        console.warn("MongoDB create admin error, falling back to memory:", err);
      }
    }

    // Always update in-memory store for instant sync
    if (!memoryStore.admins) memoryStore.admins = [];
    memoryStore.admins.push({
      _id: createdId,
      email: cleanEmail,
      passwordHash,
      name: cleanName,
      role: assignedRole,
      phone: cleanPhone,
      department: cleanDepartment,
      designation: cleanDesignation,
      isActive: true,
      createdAt: new Date(),
    });

    console.log(`✨ [ADMIN CREATED] New ${assignedRole} created: ${cleanEmail}`);

    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Super Admin",
        email: req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system",
        details: `Created new ${assignedRole} account for ${cleanEmail} (${cleanName})`,
      },
      req
    );

    return res.status(201).json({
      success: true,
      message: `Administrator ${cleanEmail} created successfully with role '${assignedRole}'`,
      admin: {
        _id: createdId,
        email: cleanEmail,
        name: cleanName,
        role: assignedRole,
        phone: cleanPhone,
        department: cleanDepartment,
        designation: cleanDesignation,
        isActive: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to create admin account" });
  }
});

// DELETE /api/admin/admin-users/:id - Delete regular Admin account (SUPER ADMIN ONLY)
router.delete("/admin-users/:id", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      const target = await Admin.findById(id);
      if (target && isSuperAdminRole(target)) {
        return res.status(403).json({ success: false, error: "Master Super Admin account cannot be deleted" });
      }
      if (target) {
        await Admin.findByIdAndDelete(id);
      }
    }

    const index = memoryStore.admins.findIndex((a) => a._id === id || a.email === id);
    if (index !== -1) {
      if (isSuperAdminRole(memoryStore.admins[index])) {
        return res.status(403).json({ success: false, error: "Master Super Admin account cannot be deleted" });
      }
      memoryStore.admins.splice(index, 1);
    }

    return res.json({ success: true, message: "Admin account deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to delete admin" });
  }
});

// POST /api/admin/change-password - Change password for currently authenticated admin
router.post("/change-password", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const adminEmail = req.admin?.email?.toLowerCase().trim();
    const { currentPassword, newPassword } = req.body;

    if (!adminEmail) {
      return res.status(401).json({ success: false, error: "Unauthorized: Admin session not found" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current password and new password are required" });
    }

    if (typeof newPassword !== "string" || newPassword.trim().length < 10) {
      return res.status(400).json({ success: false, error: "New password must be at least 10 characters long" });
    }

    let adminRecord: any = null;
    if (isMongoConnected()) {
      try {
        adminRecord = await Admin.findOne({ email: adminEmail });
      } catch (e: any) {
        console.warn("Mongo find admin error during change password:", e?.message);
      }
    }
    if (!adminRecord) {
      adminRecord = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === adminEmail);
    }

    if (!adminRecord) {
      return res.status(404).json({ success: false, error: "Admin account not found" });
    }

    // Verify current password
    let isCurrentValid = false;
    if (adminRecord.passwordHash) {
      isCurrentValid = await bcrypt.compare(currentPassword, adminRecord.passwordHash);
    }
    if (!isCurrentValid && process.env.INITIAL_ADMIN_PASSWORD) {
      isCurrentValid = currentPassword === process.env.INITIAL_ADMIN_PASSWORD;
    }

    if (!isCurrentValid) {
      return res.status(400).json({ success: false, error: "Incorrect current password. Please try again." });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);

    if (isMongoConnected()) {
      try {
        await Admin.updateOne(
          { email: adminEmail },
          { $set: { passwordHash: newPasswordHash, updatedAt: new Date() } }
        );
      } catch (e: any) {
        console.warn("Mongo update admin password error:", e?.message);
      }
    }

    // Sync memoryStore
    syncAdminPasswordToMemoryStore(adminEmail, newPasswordHash);

    return res.json({
      success: true,
      message: "Password changed successfully! Please use your new password next time you sign in.",
    });
  } catch (err: any) {
    console.error("Change password error:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update password" });
  }
});

// POST /api/admin/admin-users/:id/reset-password - Super Admin resets password for an admin
router.post("/admin-users/:id/reset-password", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 10) {
      return res.status(400).json({ success: false, error: "New password must be at least 10 characters long" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword.trim(), 10);
    let targetEmail = "";

    if (isMongoConnected()) {
      const target = await Admin.findById(id);
      if (target) {
        target.passwordHash = newPasswordHash;
        await target.save();
        targetEmail = target.email;
      }
    }

    const memAdmin = (memoryStore.admins || []).find((a) => a._id === id || a.email.toLowerCase() === id.toLowerCase());
    if (memAdmin) {
      memAdmin.passwordHash = newPasswordHash;
      targetEmail = targetEmail || memAdmin.email;
    }

    if (targetEmail) {
      syncAdminPasswordToMemoryStore(targetEmail, newPasswordHash);
    }

    return res.json({ success: true, message: `Password reset successfully for ${targetEmail || id}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to reset password" });
  }
});

// GET /api/admin/stats - Basic summary telemetry
router.get("/stats", requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    if (isMongoConnected()) {
      const [totalUsers, totalOrders, totalProducts, totalSellers, ordersList] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Seller.countDocuments(),
        Order.find().lean(),
      ]);

      const totalRevenue = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const pendingOrders = ordersList.filter((o) => o.status === "pending").length;
      const shippedOrders = ordersList.filter((o) => o.status === "shipped").length;
      const deliveredOrders = ordersList.filter((o) => o.status === "delivered").length;
      const cancelledOrders = ordersList.filter((o) => o.status === "cancelled").length;

      return res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        totalSellers,
        ordersBreakdown: {
          pending: pendingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
      });
    }

    // In-memory fallback
    const totalUsers = memoryStore.users.length;
    const totalOrders = memoryStore.orders.length;
    const totalProducts = memoryStore.products.length;
    const totalSellers = memoryStore.sellers.length;
    const totalRevenue = memoryStore.orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      totalSellers,
      ordersBreakdown: {
        pending: memoryStore.orders.filter((o) => o.status === "pending").length,
        shipped: memoryStore.orders.filter((o) => o.status === "shipped").length,
        delivered: memoryStore.orders.filter((o) => o.status === "delivered").length,
        cancelled: memoryStore.orders.filter((o) => o.status === "cancelled").length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to calculate admin stats" });
  }
});

// GET /api/admin/reports - Financial & Sales Reports (SUPER ADMIN ONLY)
router.get("/reports", requireAdmin, requireSuperAdmin, async (_req: AuthedRequest, res) => {
  try {
    let ordersList = [];
    let usersList = [];

    if (isMongoConnected()) {
      ordersList = await Order.find().lean();
      usersList = await User.find().lean();
    } else {
      ordersList = memoryStore.orders;
      usersList = memoryStore.users;
    }

    const totalRevenue = ordersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const averageOrderValue = ordersList.length ? Math.round(totalRevenue / ordersList.length) : 0;

    return res.json({
      success: true,
      totalRevenue,
      averageOrderValue,
      totalOrdersCount: ordersList.length,
      totalMembersCount: usersList.length,
      revenueByTier: {
        Platinum: Math.round(totalRevenue * 0.62),
        Gold: Math.round(totalRevenue * 0.26),
        Silver: Math.round(totalRevenue * 0.12),
      },
      monthlyTrend: [
        { month: "Jan", revenue: 145000 },
        { month: "Feb", revenue: 182000 },
        { month: "Mar", revenue: 210000 },
        { month: "Apr", revenue: 245000 },
        { month: "May", revenue: totalRevenue },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to generate sales report" });
  }
});

// GET /api/admin/activity-logs - Retrieve persistent activity logs from alikendshop.activity_logs
router.get("/activity-logs", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { filter, search, limit } = req.query;
    const maxLimit = Math.min(Number(limit) || 200, 500);

    let eventTypeFilter: string | null = null;
    if (filter === "registration" || filter === "registrations") {
      eventTypeFilter = "Registration";
    } else if (filter === "login" || filter === "logins" || filter === "success_login") {
      eventTypeFilter = "Login";
    } else if (filter === "failed_login" || filter === "failed" || filter === "failed_logins") {
      eventTypeFilter = "Failed Login";
    }

    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (eventTypeFilter) {
          query.eventType = eventTypeFilter;
        }
        if (search && typeof search === "string" && search.trim()) {
          const s = search.trim();
          query.$or = [
            { userName: { $regex: s, $options: "i" } },
            { email: { $regex: s, $options: "i" } },
            { ipAddress: { $regex: s, $options: "i" } },
            { deviceInfo: { $regex: s, $options: "i" } },
            { details: { $regex: s, $options: "i" } },
          ];
        }

        const logs = await ActivityLog.find(query)
          .sort({ createdAt: -1 })
          .limit(maxLimit)
          .lean();

        return res.json({
          success: true,
          count: logs.length,
          storage: "mongodb",
          database: "alikendshop",
          collection: "activity_logs",
          logs: logs.map((l) => ({
            ...l,
            _id: String(l._id),
          })),
        });
      } catch (dbErr: any) {
        console.warn("⚠️ [ACTIVITY LOGS QUERY ERROR] Falling back to memory store:", dbErr.message);
      }
    }

    // Fallback to in-memory store
    let memLogs = [...(memoryStore.activityLogs || [])];

    if (eventTypeFilter) {
      memLogs = memLogs.filter((l) => l.eventType === eventTypeFilter);
    }
    if (search && typeof search === "string" && search.trim()) {
      const s = search.trim().toLowerCase();
      memLogs = memLogs.filter(
        (l) =>
          (l.userName && l.userName.toLowerCase().includes(s)) ||
          (l.email && l.email.toLowerCase().includes(s)) ||
          (l.ipAddress && l.ipAddress.toLowerCase().includes(s)) ||
          (l.deviceInfo && l.deviceInfo.toLowerCase().includes(s)) ||
          (l.details && l.details.toLowerCase().includes(s))
      );
    }

    memLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    memLogs = memLogs.slice(0, maxLimit);

    return res.json({
      success: true,
      count: memLogs.length,
      storage: "in-memory-fallback",
      database: "alikendshop",
      collection: "activity_logs",
      logs: memLogs,
    });
  } catch (err: any) {
    console.error("💥 [ACTIVITY LOGS ERROR]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to retrieve activity logs" });
  }
});

// POST /api/admin/activity-logs - Record an event manually (Protected with requireAdmin)
router.post("/activity-logs", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { eventType, userName, email, status, details } = req.body;
    if (!eventType || !email) {
      return res.status(400).json({ success: false, error: "eventType and email are required" });
    }

    // IP and device are extracted server-side inside logActivity(..., req) to prevent spoofing
    const recorded = await logActivity(
      {
        eventType,
        userName: userName || email.split("@")[0],
        email,
        status: status || (eventType === "Failed Login" ? "failed" : "success"),
        details,
      },
      req
    );

    return res.status(201).json({
      success: true,
      message: "Activity event recorded successfully",
      log: recorded,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Could not log activity" });
  }
});

// DELETE /api/admin/activity-logs - Clear all activity logs (SUPER ADMIN ONLY)
router.delete("/activity-logs", requireAdmin, requireSuperAdmin, async (_req: AuthedRequest, res) => {
  try {
    memoryStore.activityLogs = [];
    if (isMongoConnected()) {
      await ActivityLog.deleteMany({});
    }
    return res.json({ success: true, message: "Activity logs cleared" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SELLER WITHDRAWAL MANAGEMENT (ADMIN ROUTES)
// ==========================================

// 1. GET /api/admin/seller-withdrawals - List all seller withdrawal requests
router.get("/seller-withdrawals", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && typeof status === "string") {
      const cleanStatus = status.toLowerCase().trim();
      if (["pending", "approved", "rejected"].includes(cleanStatus)) {
        filter.status = cleanStatus;
      }
    }

    let withdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawals = await SellerWithdrawal.find(filter)
          .sort({ requestedAt: -1, createdAt: -1 })
          .lean();
      } catch (err) {
        console.warn("MongoDB fetch seller withdrawals fallback:", err);
      }
    }

    if (!withdrawals || withdrawals.length === 0) {
      withdrawals = (memoryStore.sellerWithdrawals || []).filter((w) => {
        if (filter.status) return w.status === filter.status;
        return true;
      });
    }

    return res.json({
      success: true,
      count: withdrawals.length,
      withdrawals,
    });
  } catch (err: any) {
    console.error("Admin fetch seller withdrawals error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to fetch seller withdrawal requests",
    });
  }
});

// 2. PATCH /api/admin/seller-withdrawals/:id/approve - Approve & mark payout completed
router.patch("/seller-withdrawals/:id/approve", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const adminEmail = req.admin?.email || "admin@alikend.com";

    let withdrawal: any = null;

    if (isMongoConnected()) {
      try {
        const existing = await SellerWithdrawal.findById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: "Withdrawal request not found." });
        }
        if (existing.status !== "pending") {
          return res.status(409).json({
            success: false,
            error: `Withdrawal request has already been processed with status '${existing.status}'.`,
          });
        }

        // Atomically lock status transition from pending -> approved
        withdrawal = await SellerWithdrawal.findOneAndUpdate(
          { _id: id, status: "pending" },
          {
            status: "approved",
            processedAt: new Date(),
            processedByAdminEmail: adminEmail,
          },
          { new: true }
        );

        if (!withdrawal) {
          return res.status(409).json({
            success: false,
            error: "Withdrawal request was already processed by another administrator.",
          });
        }

        // Balance Movement:
        // Payout was executed externally (bank transfer). The funds were already deducted
        // from walletBalance at request time, so we permanently decrement pendingWithdrawals.
        await Seller.findByIdAndUpdate(withdrawal.sellerId, {
          $inc: { pendingWithdrawals: -withdrawal.amount },
        });
      } catch (err) {
        console.warn("MongoDB approve seller withdrawal error:", err);
      }
    }

    // In-memory sync or fallback
    const memIndex = (memoryStore.sellerWithdrawals || []).findIndex(
      (w) => String(w._id) === String(id)
    );
    if (memIndex !== -1) {
      const memW = memoryStore.sellerWithdrawals[memIndex];
      if (!withdrawal && memW.status !== "pending") {
        return res.status(409).json({
          success: false,
          error: `Withdrawal request has already been processed with status '${memW.status}'.`,
        });
      }

      memW.status = "approved";
      memW.processedAt = new Date();
      memW.processedByAdminEmail = adminEmail;

      const memSeller = (memoryStore.sellers || []).find(
        (s) => String(s._id) === String(memW.sellerId)
      );
      if (memSeller) {
        memSeller.pendingWithdrawals = Math.max(0, ((memSeller as any).pendingWithdrawals || 0) - memW.amount);
      }
      if (!withdrawal) withdrawal = memW;
    }

    if (!withdrawal) {
      return res.status(404).json({ success: false, error: "Withdrawal request not found." });
    }

    // Audit log
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Admin",
        email: adminEmail,
        details: `Approved seller withdrawal of ₹${withdrawal.amount} for ${withdrawal.sellerShopName} (${withdrawal.sellerEmail})`,
      },
      req
    ).catch(() => {});

    console.log(
      `✅ [SELLER WITHDRAWAL APPROVED] ₹${withdrawal.amount} for ${withdrawal.sellerShopName} by ${adminEmail}.`
    );

    return res.json({
      success: true,
      message: "Withdrawal request approved and marked as completed.",
      withdrawal,
    });
  } catch (err: any) {
    console.error("Admin approve seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to approve seller withdrawal request",
    });
  }
});

// 3. PATCH /api/admin/seller-withdrawals/:id/reject - Reject & refund funds back to seller wallet
router.patch("/seller-withdrawals/:id/reject", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason, reason } = req.body;
    const adminEmail = req.admin?.email || "admin@alikend.com";
    const finalReason = String(rejectionReason || reason || "Declined by administrator").trim();

    let withdrawal: any = null;

    if (isMongoConnected()) {
      try {
        const existing = await SellerWithdrawal.findById(id);
        if (!existing) {
          return res.status(404).json({ success: false, error: "Withdrawal request not found." });
        }
        if (existing.status !== "pending") {
          return res.status(409).json({
            success: false,
            error: `Withdrawal request has already been processed with status '${existing.status}'.`,
          });
        }

        // Atomically lock status transition from pending -> rejected
        withdrawal = await SellerWithdrawal.findOneAndUpdate(
          { _id: id, status: "pending" },
          {
            status: "rejected",
            rejectionReason: finalReason,
            processedAt: new Date(),
            processedByAdminEmail: adminEmail,
          },
          { new: true }
        );

        if (!withdrawal) {
          return res.status(409).json({
            success: false,
            error: "Withdrawal request was already processed by another administrator.",
          });
        }

        // Balance Movement:
        // Request rejected: Decrement pendingWithdrawals and REFUND the amount back to walletBalance
        await Seller.findByIdAndUpdate(withdrawal.sellerId, {
          $inc: {
            pendingWithdrawals: -withdrawal.amount,
            walletBalance: withdrawal.amount,
          },
        });
      } catch (err) {
        console.warn("MongoDB reject seller withdrawal error:", err);
      }
    }

    // In-memory sync or fallback
    const memIndex = (memoryStore.sellerWithdrawals || []).findIndex(
      (w) => String(w._id) === String(id)
    );
    if (memIndex !== -1) {
      const memW = memoryStore.sellerWithdrawals[memIndex];
      if (!withdrawal && memW.status !== "pending") {
        return res.status(409).json({
          success: false,
          error: `Withdrawal request has already been processed with status '${memW.status}'.`,
        });
      }

      memW.status = "rejected";
      memW.rejectionReason = finalReason;
      memW.processedAt = new Date();
      memW.processedByAdminEmail = adminEmail;

      const memSeller = (memoryStore.sellers || []).find(
        (s) => String(s._id) === String(memW.sellerId)
      );
      if (memSeller) {
        memSeller.pendingWithdrawals = Math.max(0, ((memSeller as any).pendingWithdrawals || 0) - memW.amount);
        memSeller.walletBalance = ((memSeller as any).walletBalance || 0) + memW.amount;
      }
      if (!withdrawal) withdrawal = memW;
    }

    if (!withdrawal) {
      return res.status(404).json({ success: false, error: "Withdrawal request not found." });
    }

    // Audit log
    await logActivity(
      {
        eventType: "Login",
        status: "failed",
        userName: req.admin?.name || "Admin",
        email: adminEmail,
        details: `Rejected seller withdrawal of ₹${withdrawal.amount} for ${withdrawal.sellerShopName}. Reason: ${finalReason}`,
      },
      req
    ).catch(() => {});

    console.log(
      `❌ [SELLER WITHDRAWAL REJECTED] ₹${withdrawal.amount} refunded to ${withdrawal.sellerShopName} by ${adminEmail}. Reason: ${finalReason}`
    );

    return res.json({
      success: true,
      message: "Withdrawal request rejected. Funds have been refunded to seller wallet balance.",
      withdrawal,
    });
  } catch (err: any) {
    console.error("Admin reject seller withdrawal error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to reject seller withdrawal request",
    });
  }
});

import adminCentralRoutes from "./adminCentral";
router.use("/central", adminCentralRoutes);

export default router;



