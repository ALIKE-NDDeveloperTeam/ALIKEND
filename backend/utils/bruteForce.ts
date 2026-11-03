import { Request } from "express";
import LoginAttempt from "../models/LoginAttempt";
import { connectMongoDB, isMongoConnected } from "../store";

export const MAX_FAILED_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window

export function getClientIp(req: Request): string {
  // 1. Vercel's trusted edge header (cannot be spoofed by client)
  const vercelForwarded = req.headers["x-vercel-forwarded-for"];
  if (typeof vercelForwarded === "string" && vercelForwarded.trim()) {
    const first = vercelForwarded.split(",")[0].trim();
    if (first) return first;
  }
  if (Array.isArray(vercelForwarded) && vercelForwarded[0]) {
    const first = vercelForwarded[0].split(",")[0].trim();
    if (first) return first;
  }

  // 2. Standard proxy header: take only the FIRST comma-separated value (client IP)
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(",")[0].trim();
    if (first) return first;
  }

  // 3. Fallback to x-real-ip
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    const first = realIp.split(",")[0].trim();
    if (first) return first;
  }
  if (Array.isArray(realIp) && realIp[0]) {
    const first = realIp[0].split(",")[0].trim();
    if (first) return first;
  }

  // 4. Socket remote address fallback
  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
}

export interface RateLimitResult {
  allowed: boolean;
  status?: number;
  error?: string;
  retryAfter?: number;
}

/**
 * Checks if a login attempt should be blocked due to brute-force limits.
 * Rate limit: 5 failed attempts within 15 minutes per IP or submitted identifier.
 * Returns { allowed: false, status: 429, retryAfter: ... } if limit exceeded.
 * In production: fails closed with status 503 if MongoDB is unavailable.
 * In non-production: falls back gracefully (allows the request).
 */
export async function checkLoginRateLimit(
  req: Request,
  identifier?: string
): Promise<RateLimitResult> {
  if (!isMongoConnected()) {
    try {
      await connectMongoDB();
    } catch {}
  }

  if (!isMongoConnected()) {
    if (process.env.NODE_ENV === "production") {
      return {
        allowed: false,
        status: 503,
        error: "Authentication service is temporarily unavailable. Please try again shortly.",
      };
    }
    return { allowed: true };
  }

  try {
    const now = new Date();
    const ip = getClientIp(req);
    const ipKey = `ip:${ip.toLowerCase()}`;
    const cleanId = identifier ? identifier.trim().toLowerCase() : "";
    const idKey = cleanId ? `id:${cleanId}` : null;

    const [ipCount, idCount] = await Promise.all([
      LoginAttempt.countDocuments({ key: ipKey, expiresAt: { $gt: now } }),
      idKey ? LoginAttempt.countDocuments({ key: idKey, expiresAt: { $gt: now } }) : Promise.resolve(0),
    ]);

    if (ipCount >= MAX_FAILED_ATTEMPTS || idCount >= MAX_FAILED_ATTEMPTS) {
      const blockedKey = ipCount >= MAX_FAILED_ATTEMPTS ? ipKey : idKey!;
      const oldestAttempt = await LoginAttempt.findOne({
        key: blockedKey,
        expiresAt: { $gt: now },
      }).sort({ expiresAt: 1 });

      const retryAfter = oldestAttempt
        ? Math.max(1, Math.ceil((oldestAttempt.expiresAt.getTime() - now.getTime()) / 1000))
        : Math.ceil(WINDOW_MS / 1000);

      return {
        allowed: false,
        status: 429,
        error: "Too many attempts, try again later",
        retryAfter,
      };
    }

    return { allowed: true };
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      return {
        allowed: false,
        status: 503,
        error: "Authentication service is temporarily unavailable. Please try again shortly.",
      };
    }
    return { allowed: true };
  }
}

/**
 * Records a failed login attempt in MongoDB for both client IP and identifier.
 * Expire automatically after 15 minutes via TTL index.
 */
export async function recordFailedLoginAttempt(
  req: Request,
  identifier?: string
): Promise<void> {
  if (!isMongoConnected()) {
    try {
      await connectMongoDB();
    } catch {}
  }

  if (!isMongoConnected()) {
    return;
  }

  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + WINDOW_MS);
    const ip = getClientIp(req);
    const ipKey = `ip:${ip.toLowerCase()}`;
    const cleanId = identifier ? identifier.trim().toLowerCase() : "";

    const docsToInsert: Array<{
      key: string;
      type: "ip" | "identifier";
      value: string;
      createdAt: Date;
      expiresAt: Date;
    }> = [
      {
        key: ipKey,
        type: "ip",
        value: ip,
        createdAt: now,
        expiresAt,
      },
    ];

    if (cleanId) {
      docsToInsert.push({
        key: `id:${cleanId}`,
        type: "identifier",
        value: cleanId,
        createdAt: now,
        expiresAt,
      });
    }

    await LoginAttempt.insertMany(docsToInsert);
  } catch (err) {
    console.warn("Failed to record failed login attempt in MongoDB:", err);
  }
}

/**
 * Resets failed attempt counters for specified identifiers upon successful login.
 */
export async function resetLoginAttempts(
  ...identifiers: Array<string | undefined | null>
): Promise<void> {
  if (!isMongoConnected()) {
    try {
      await connectMongoDB();
    } catch {}
  }

  if (!isMongoConnected()) {
    return;
  }

  try {
    const keysToDelete: string[] = [];
    for (const id of identifiers) {
      if (id && typeof id === "string") {
        const clean = id.trim().toLowerCase();
        if (clean) {
          keysToDelete.push(`id:${clean}`);
        }
      }
    }

    if (keysToDelete.length > 0) {
      await LoginAttempt.deleteMany({ key: { $in: keysToDelete } });
    }
  } catch (err) {
    console.warn("Failed to reset login attempts in MongoDB:", err);
  }
}
