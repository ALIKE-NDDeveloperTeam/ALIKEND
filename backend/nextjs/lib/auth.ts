/**
 * Better Auth Server Configuration for Next.js + MongoDB
 * ------------------------------------------------------
 * For standalone Next.js projects:
 *   npm install better-auth mongodb mongoose
 */
import { connectDB } from "./mongodb";
import User from "../../models/User";
import BetterAuthSession from "../../models/BetterAuthSession";

export interface BetterAuthConfig {
  database: string;
  secret: string;
  emailAndPassword: {
    enabled: boolean;
    autoSignIn: boolean;
  };
}

export const betterAuthConfig: BetterAuthConfig = {
  database: "mongodb",
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || "",
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
};

export async function getBetterAuthDbModels() {
  await connectDB();
  return {
    User,
    BetterAuthSession,
  };
}
