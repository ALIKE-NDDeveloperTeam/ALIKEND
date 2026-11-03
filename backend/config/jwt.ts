import crypto from "crypto";

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
