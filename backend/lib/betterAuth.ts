import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import BetterAuthSession from "../models/BetterAuthSession";
import { isMongoConnected, memoryStore } from "../store";
import { connectToMongoDatabase } from "./mongodb";
import { getJwtSecret } from "../config/jwt";

export interface BetterAuthUserPayload {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BetterAuthSessionPayload {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const inMemorySessions = new Map<
  string,
  {
    session: BetterAuthSessionPayload;
    user: BetterAuthUserPayload;
  }
>();

function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift()?.trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join("=").trim());
    }
  });
  return list;
}

export function extractSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req.headers.cookie);
  return (
    cookies["better-auth.session_token"] ||
    cookies["better_auth_session"] ||
    (req.headers["x-better-auth-token"] as string) ||
    null
  );
}

export async function resolveBetterAuthSession(req: Request): Promise<{
  session: BetterAuthSessionPayload;
  user: BetterAuthUserPayload;
} | null> {
  const token = extractSessionToken(req);
  if (!token) return null;

  await connectToMongoDatabase();

  // 1. Check MongoDB BetterAuthSession collection
  if (isMongoConnected()) {
    try {
      const dbSession = await BetterAuthSession.findOne({
        sessionToken: token,
        expiresAt: { $gt: new Date() },
      }).lean();

      if (dbSession) {
        const dbUser = await User.findById(dbSession.userId).select("-passwordHash").lean();
        if (dbUser) {
          return {
            session: {
              id: String(dbSession._id),
              token: dbSession.sessionToken,
              userId: String(dbUser._id),
              expiresAt: new Date(dbSession.expiresAt),
              ipAddress: dbSession.ipAddress,
              userAgent: dbSession.userAgent,
            },
            user: {
              id: String(dbUser._id),
              email: dbUser.email,
              name: dbUser.fullName || dbUser.username || dbUser.email.split("@")[0],
              image: dbUser.avatar || null,
              emailVerified: Boolean(dbUser.verified),
              createdAt: dbUser.createdAt || new Date(),
              updatedAt: new Date(),
            },
          };
        }
      }
    } catch (err) {
      console.warn("[BetterAuth] Session lookup warning:", (err as Error)?.message);
    }
  }

  // 2. Check in-memory session cache
  const cached = inMemorySessions.get(token);
  if (cached && cached.session.expiresAt > new Date()) {
    return cached;
  }

  // 3. Also accept JWT tokens signed with JWT_SECRET for unified auth interoperability
  const secret = getJwtSecret();
  if (secret) {
    try {
      const decoded: any = jwt.verify(token, secret);
      if (decoded && (decoded.userId || decoded.id || decoded.email)) {
        const uid = String(decoded.userId || decoded.id || decoded.sub);
        return {
          session: {
            id: `jwt_${uid}`,
            token,
            userId: uid,
            expiresAt: new Date((decoded.exp || Math.floor(Date.now() / 1000) + 86400) * 1000),
          },
          user: {
            id: uid,
            email: decoded.email || "",
            name: decoded.fullName || decoded.name || (decoded.email ? decoded.email.split("@")[0] : "User"),
            image: decoded.avatar || null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        };
      }
    } catch {
      // Invalid JWT
    }
  }

  return null;
}

export const betterAuthRouter = Router();

/**
 * Better Auth: POST /api/better-auth/sign-up/email
 * Registers a user in MongoDB and creates a Better Auth session.
 */
betterAuthRouter.post(["/sign-up/email", "/sign-up"], async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { email, password, name, fullName, image, country, mobileNumber } = req.body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const displayName = String(name || fullName || cleanEmail.split("@")[0] || "").trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return res.status(400).json({
        error: { message: "A valid email address is required.", code: "INVALID_EMAIL" },
      });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({
        error: { message: "Password must be at least 6 characters.", code: "PASSWORD_TOO_SHORT" },
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    let userDoc: any = null;

    if (isMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          error: { message: "User with this email already exists in MongoDB.", code: "USER_ALREADY_EXISTS" },
        });
      }

      userDoc = await User.create({
        fullName: displayName,
        username: cleanEmail.split("@")[0],
        email: cleanEmail,
        country: country || "Bangladesh",
        mobileNumber: mobileNumber || "",
        passwordHash,
        tier: "Silver",
        verified: true,
        avatar: image || "",
      });
    } else {
      const existingMem = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existingMem) {
        return res.status(409).json({
          error: { message: "User with this email already exists.", code: "USER_ALREADY_EXISTS" },
        });
      }
      userDoc = {
        _id: `usr_${crypto.randomBytes(8).toString("hex")}`,
        fullName: displayName,
        email: cleanEmail,
        country: country || "Bangladesh",
        mobileNumber: mobileNumber || "",
        passwordHash,
        tier: "Silver" as const,
        verified: true,
        avatar: image || "",
        createdAt: new Date(),
      };
      memoryStore.users.push(userDoc);
    }

    const sessionToken = `ba_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    if (isMongoConnected()) {
      await BetterAuthSession.create({
        sessionToken,
        userId: String(userDoc._id),
        userEmail: cleanEmail,
        userName: displayName,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        expiresAt,
      });
    }

    const userPayload: BetterAuthUserPayload = {
      id: String(userDoc._id),
      email: cleanEmail,
      name: displayName,
      image: userDoc.avatar || null,
      emailVerified: true,
      createdAt: userDoc.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const sessionPayload: BetterAuthSessionPayload = {
      id: `sess_${crypto.randomBytes(8).toString("hex")}`,
      token: sessionToken,
      userId: String(userDoc._id),
      expiresAt,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    };

    inMemorySessions.set(sessionToken, { session: sessionPayload, user: userPayload });

    res.setHeader(
      "Set-Cookie",
      `better-auth.session_token=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
        SESSION_DURATION_MS / 1000
      )}`
    );

    return res.status(201).json({
      token: sessionToken,
      user: userPayload,
      session: sessionPayload,
    });
  } catch (err: any) {
    console.error("[BetterAuth] Sign-up error:", err);
    return res.status(500).json({
      error: { message: err?.message || "Failed to register user", code: "INTERNAL_SERVER_ERROR" },
    });
  }
});

/**
 * Better Auth: POST /api/better-auth/sign-in/email
 * Authenticates user against MongoDB and creates a Better Auth session.
 */
betterAuthRouter.post(["/sign-in/email", "/sign-in"], async (req: Request, res: Response) => {
  try {
    await connectToMongoDatabase();
    const { email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !password) {
      return res.status(400).json({
        error: { message: "Email and password are required.", code: "MISSING_CREDENTIALS" },
      });
    }

    let userDoc: any = null;
    if (isMongoConnected()) {
      userDoc = await User.findOne({ email: cleanEmail });
    }
    if (!userDoc) {
      userDoc = memoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!userDoc) {
      return res.status(401).json({
        error: { message: "Invalid email or password.", code: "INVALID_EMAIL_OR_PASSWORD" },
      });
    }

    const passwordValid = await bcrypt.compare(String(password), userDoc.passwordHash || "");
    if (!passwordValid) {
      return res.status(401).json({
        error: { message: "Invalid email or password.", code: "INVALID_EMAIL_OR_PASSWORD" },
      });
    }

    const sessionToken = `ba_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const displayName = userDoc.fullName || userDoc.username || cleanEmail.split("@")[0];

    if (isMongoConnected()) {
      await BetterAuthSession.create({
        sessionToken,
        userId: String(userDoc._id),
        userEmail: cleanEmail,
        userName: displayName,
        ipAddress: req.ip || "",
        userAgent: req.headers["user-agent"] || "",
        expiresAt,
      });
    }

    const userPayload: BetterAuthUserPayload = {
      id: String(userDoc._id),
      email: cleanEmail,
      name: displayName,
      image: userDoc.avatar || null,
      emailVerified: Boolean(userDoc.verified),
      createdAt: userDoc.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const sessionPayload: BetterAuthSessionPayload = {
      id: `sess_${crypto.randomBytes(8).toString("hex")}`,
      token: sessionToken,
      userId: String(userDoc._id),
      expiresAt,
      ipAddress: req.ip || "",
      userAgent: req.headers["user-agent"] || "",
    };

    inMemorySessions.set(sessionToken, { session: sessionPayload, user: userPayload });

    res.setHeader(
      "Set-Cookie",
      `better-auth.session_token=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(
        SESSION_DURATION_MS / 1000
      )}`
    );

    return res.json({
      token: sessionToken,
      user: userPayload,
      session: sessionPayload,
    });
  } catch (err: any) {
    console.error("[BetterAuth] Sign-in error:", err);
    return res.status(500).json({
      error: { message: err?.message || "Failed to sign in", code: "INTERNAL_SERVER_ERROR" },
    });
  }
});

/**
 * Better Auth: GET /api/better-auth/get-session (or /session)
 * Returns active Better Auth session and MongoDB user profile.
 */
betterAuthRouter.get(["/get-session", "/session"], async (req: Request, res: Response) => {
  try {
    const resolved = await resolveBetterAuthSession(req);
    if (!resolved) {
      return res.json({ session: null, user: null });
    }
    return res.json(resolved);
  } catch (err: any) {
    return res.status(500).json({
      error: { message: err?.message || "Failed to get session" },
    });
  }
});

/**
 * Better Auth: POST /api/better-auth/sign-out
 * Revokes active session in MongoDB and clears session cookie.
 */
betterAuthRouter.post("/sign-out", async (req: Request, res: Response) => {
  try {
    const token = extractSessionToken(req);
    if (token) {
      inMemorySessions.delete(token);
      if (isMongoConnected()) {
        await BetterAuthSession.deleteOne({ sessionToken: token }).catch(() => {});
      }
    }
    res.setHeader(
      "Set-Cookie",
      "better-auth.session_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({
      error: { message: err?.message || "Sign-out failed" },
    });
  }
});

/**
 * Optional Express middleware to attach Better Auth user/session if present
 */
export async function attachBetterAuthUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const resolved = await resolveBetterAuthSession(req);
    if (resolved) {
      (req as any).betterAuthUser = resolved.user;
      (req as any).betterAuthSession = resolved.session;
    }
  } catch {
    // Continue unauthenticated
  }
  next();
}

export default betterAuthRouter;
