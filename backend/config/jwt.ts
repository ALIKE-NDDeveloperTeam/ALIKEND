import crypto from "crypto";

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

