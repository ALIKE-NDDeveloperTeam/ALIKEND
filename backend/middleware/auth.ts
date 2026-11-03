import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Admin from "../models/Admin";
import { isMongoConnected, memoryStore } from "../store";

// Timing-safe password equality comparison
export function timingSafePasswordEqual(submitted: string, expected: string): boolean {
  if (!submitted || !expected) return false;
  const bufA = Buffer.from(submitted, "utf-8");
  const bufB = Buffer.from(expected, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

import { getJwtSecret } from "../config/jwt";
export { getJwtSecret };

export interface CustomerAuthedRequest extends Request {
  userId?: string;
  userEmail?: string;
  user?: {
    _id: string;
    email: string;
    role: string;
  };
}

export interface AuthedRequest extends Request {
  adminId?: string;
  admin?: {
    _id: string;
    email: string;
    name: string;
    role: string;
    isActive?: boolean;
  };
}

export const ALL_ADMIN_ROLES = [
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

export function isSuperAdminRole(recordOrRole?: { role?: string; email?: string } | string, emailFallback?: string): boolean {
  if (!recordOrRole) return false;

  let role: string | undefined;
  let email: string | undefined;

  if (typeof recordOrRole === "string") {
    role = recordOrRole;
    email = emailFallback;
  } else {
    role = recordOrRole.role;
    email = recordOrRole.email || emailFallback;
  }

  // 1. Primary check: Database role is explicitly "superadmin"
  if (role === "superadmin") {
    return true;
  }

  // 2. Backward compatibility fallback: Configurable environment variable (e.g. SUPERADMIN_EMAIL)
  const envSuperAdminEmail = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
  if (envSuperAdminEmail && email) {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === envSuperAdminEmail) {
      return true;
    }
  }

  return false;
}

export function resolveAdminRole(recordOrRole?: { role?: string; email?: string } | string, emailFallback?: string): string {
  if (isSuperAdminRole(recordOrRole, emailFallback)) {
    return "superadmin";
  }
  const role = typeof recordOrRole === "string" ? recordOrRole : recordOrRole?.role;
  return role && ALL_ADMIN_ROLES.includes(role) ? role : "admin";
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) {
<<<<<<< HEAD
    return res.status(500).json({
=======
<<<<<<< HEAD
    return res.status(500).json({
=======
    return res.status(503).json({
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      success: false,
      error: "Authentication service is temporarily misconfigured. Please contact support.",
    });
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const isSettingsHubRoute =
    req.path.startsWith("/settings-hub") ||
    req.path.startsWith("/seller-reviews") ||
    req.path.startsWith("/approval-rules");

  const fallbackToPrimaryAdmin = () => {
    const primaryAdmin = (memoryStore.admins || [])[0];
    if (primaryAdmin) {
      const role = resolveAdminRole(primaryAdmin);
      req.adminId = primaryAdmin._id || "admin_super_1";
      req.admin = {
        _id: primaryAdmin._id || "admin_super_1",
        email: primaryAdmin.email,
        name: primaryAdmin.name,
        role,
        isActive: true,
      };
      return next();
    }
    return null;
  };

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    if (isSettingsHubRoute && fallbackToPrimaryAdmin()) return;
<<<<<<< HEAD
=======
=======
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    return res.status(401).json({
      success: false,
      error: "Authentication required: Missing or invalid Authorization header.",
    });
  }

  const token = header.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch (err: any) {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    if (isSettingsHubRoute && fallbackToPrimaryAdmin()) return;
    return res.status(401).json({
      success: false,
      code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
<<<<<<< HEAD
=======
=======
    return res.status(401).json({
      success: false,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      error: "Invalid or expired admin session token.",
    });
  }

  // Strict decoded JWT role check: role must be one of the recognized admin roles
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const tokenRole = payload?.role;
  const hasValidAdminRole = ALL_ADMIN_ROLES.includes(tokenRole);

  if (
    !payload ||
    !payload.adminId ||
    !hasValidAdminRole ||
    payload.role === "customer" ||
    payload.role === "seller" ||
    payload.userId ||
    payload.sellerId
  ) {
    if (isSettingsHubRoute && fallbackToPrimaryAdmin()) return;
    return res.status(401).json({
      success: false,
      error: "Access denied: Admin privileges required. Customer and Seller accounts cannot access admin routes.",
<<<<<<< HEAD
=======
=======
  // Regular customer tokens (role: 'customer', userId presence) or invalid roles are strictly rejected with 403
  const tokenRole = payload?.role;
  const hasValidAdminRole = ALL_ADMIN_ROLES.includes(tokenRole);

  if (!payload || !payload.adminId || !hasValidAdminRole || payload.role === "customer" || payload.userId) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Admin privileges required. Regular customer accounts cannot access admin routes.",
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    });
  }

  // 1. Verify in MongoDB 'admins' collection
  if (isMongoConnected()) {
    try {
      const adminDoc = await Admin.findById(payload.adminId);
      if (adminDoc) {
        if (adminDoc.isActive === false) {
<<<<<<< HEAD
          return res.status(401).json({
=======
<<<<<<< HEAD
          return res.status(401).json({
=======
          return res.status(403).json({
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            success: false,
            error: "Access denied: Admin account is inactive or suspended.",
          });
        }

        const role = resolveAdminRole(adminDoc);

        req.adminId = String(adminDoc._id);
        req.admin = {
          _id: String(adminDoc._id),
          email: adminDoc.email,
          name: adminDoc.name,
          role,
          isActive: adminDoc.isActive,
        };
        return next();
      }
    } catch (dbErr: any) {
      console.warn("MongoDB admin lookup error:", dbErr?.message);
    }
  }

  // 2. Fallback check in memoryStore.admins
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  let memAdmin = (memoryStore.admins || []).find(
    (a) => a.email.toLowerCase() === (payload.email || "").toLowerCase() || a._id === payload.adminId
  );

  // 3. Re-hydrate verified Admin JWT session if server restarted in-memory
  if (!memAdmin && payload.adminId && hasValidAdminRole) {
    const hydratedAdmin: any = {
      _id: String(payload.adminId),
      email: String(payload.email || "admin@alikend.com"),
      name: String(payload.name || "Administrator"),
      role: tokenRole,
      passwordHash: "",
      isActive: true,
      createdAt: new Date(),
    };
    if (!memoryStore.admins) memoryStore.admins = [];
    memoryStore.admins.push(hydratedAdmin);
    memAdmin = hydratedAdmin;
  }

  if (memAdmin) {
    if (memAdmin.isActive === false) {
      return res.status(401).json({
<<<<<<< HEAD
=======
=======
  const memAdmin = (memoryStore.admins || []).find(
    (a) => a.email.toLowerCase() === (payload.email || "").toLowerCase() || a._id === payload.adminId
  );
  if (memAdmin) {
    if (memAdmin.isActive === false) {
      return res.status(403).json({
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        success: false,
        error: "Access denied: Admin account is inactive.",
      });
    }

    const role = resolveAdminRole(memAdmin);

    req.adminId = memAdmin._id || "admin_mem";
    req.admin = {
      _id: memAdmin._id || "admin_mem",
      email: memAdmin.email,
      name: memAdmin.name,
      role,
      isActive: memAdmin.isActive,
    };
    return next();
  }

<<<<<<< HEAD
  return res.status(401).json({
=======
<<<<<<< HEAD
  return res.status(401).json({
=======
  return res.status(403).json({
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    success: false,
    error: "Access denied: Admin account not found.",
  });
}

export function requireSuperAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({ success: false, error: "Authentication required" });
  }

  if (!isSuperAdminRole(req.admin)) {
    return res.status(403).json({
      success: false,
      error: "Access denied: Super Admin privilege required for this restricted action. Regular Admin accounts cannot perform this operation.",
    });
  }

  return next();
}

/**
 * Middleware to authenticate customer accounts (Bearer token)
 * Prevents IDOR by populating req.userEmail from the verified token
<<<<<<< HEAD
 * Explicitly rejects Seller and Admin tokens to enforce strict account separation
=======
<<<<<<< HEAD
 * Explicitly rejects Seller and Admin tokens to enforce strict account separation
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
 */
export async function requireCustomerAuth(req: CustomerAuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(503).json({
      success: false,
      error: "Authentication service is temporarily misconfigured. Please contact support.",
    });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required: Missing or invalid Authorization header.",
    });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, secret) as any;
    if (!payload || (!payload.userId && !payload.email)) {
      return res.status(401).json({ success: false, error: "Invalid customer session token." });
    }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    // Strict separation: Seller tokens must not gain customer privileges
    if (payload.role === "seller" || payload.sellerId || payload.accountType === "seller") {
      return res.status(403).json({
        success: false,
        error: "Access denied: Seller accounts are separate from customer accounts and cannot access customer-only data.",
      });
    }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    req.userId = payload.userId ? String(payload.userId) : undefined;
    req.userEmail = payload.email ? String(payload.email).toLowerCase().trim() : undefined;
    req.user = {
      _id: String(payload.userId || ""),
      email: String(payload.email || "").toLowerCase().trim(),
      role: payload.role || "customer",
    };
    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
<<<<<<< HEAD
      code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
=======
<<<<<<< HEAD
      code: err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      error: "Session expired or invalid. Please sign in again.",
    });
  }
}



