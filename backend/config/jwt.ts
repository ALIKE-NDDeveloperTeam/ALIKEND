import crypto from "crypto";

<<<<<<< HEAD
let fallbackDerivedSecret: string | null = null;

/**
 * Robust getter for JWT_SECRET
 * - Uses process.env.JWT_SECRET if defined and non-empty.
 * - Otherwise derives a deterministic 64-char hex secret so authentication
 *   never fails with 503/500 in production, Cloud Run, or Vercel serverless.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret && secret.length > 0) {
    return secret;
  }

  if (!fallbackDerivedSecret) {
    fallbackDerivedSecret = crypto
      .createHash("sha256")
      .update(
        process.env.MONGO_URI ||
          process.env.FIREBASE_PROJECT_ID ||
          "alikend-sovereign-jwt-fallback-key-2026"
      )
      .digest("hex");
    console.warn(
      "⚠️ [JWT NOTICE]: JWT_SECRET not set or empty. Using deterministic fallback secret."
    );
  }

  return fallbackDerivedSecret;
}

=======
let devEphemeralSecret: string | null = null;

/**
 * Robust getter for JWT_SECRET
 * - In production (NODE_ENV === "production" or VERCEL):
 *   Requires process.env.JWT_SECRET to be defined and >= 32 characters.
 *   Returns null if missing or too short, so calling routes return 503 Service Unavailable.
 * - In development:
 *   Uses process.env.JWT_SECRET if valid, or generates an ephemeral random secret
 *   per process with a console warning. Never uses a fixed hardcoded string.
 */
export function getJwtSecret(): string | null {
  const secret = process.env.JWT_SECRET?.trim();
  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  if (isProduction) {
    if (!secret || secret.length < 32) {
      console.error(
        "❌ [SECURITY ERROR]: JWT_SECRET environment variable is missing or shorter than 32 characters in production."
      );
      return null;
    }
    return secret;
  }

  // Development environment
  if (secret && secret.length >= 8) {
    return secret;
  }

  if (!devEphemeralSecret) {
    devEphemeralSecret = crypto.randomBytes(32).toString("hex");
    console.warn(
      "⚠️ [DEV SECURITY NOTICE]: JWT_SECRET not configured. Using ephemeral random secret for this session."
    );
  }

  return devEphemeralSecret;
}
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
