/**
 * Next.js + MongoDB + Better Auth Setup Guide & Ready-to-Use Files
 * ================================================================
 *
 * All files in `/backend` are active right now on this server AND ready for Next.js App Router:
 *
 * 1. Live Express + MongoDB + Better Auth API Endpoints (Active Now):
 *    - POST   /api/better-auth/sign-up/email   -> Register user in MongoDB & start session
 *    - POST   /api/better-auth/sign-in/email   -> Sign in user from MongoDB & start session
 *    - GET    /api/better-auth/get-session     -> Get current logged-in Better Auth user & session
 *    - POST   /api/better-auth/sign-out        -> Sign out & clear session in MongoDB
 *    - GET    /api/projects                    -> Get all projects from MongoDB (`projects` collection)
 *    - POST   /api/projects                    -> Add a new project to MongoDB (`projects` collection)
 *    - GET    /api/projects/:id                -> Get single project by ID or slug
 *    - PATCH  /api/projects/:id                -> Update project in MongoDB
 *    - DELETE /api/projects/:id                -> Delete project from MongoDB
 *    - POST   /api/projects/:id/data           -> Add custom key-value/JSON data inside a project
 *    - GET    /api/data                        -> Get custom API data documents from MongoDB (`api_data` collection)
 *    - POST   /api/data                        -> Add any custom JSON data document to MongoDB (`api_data` collection)
 *    - DELETE /api/data/:id                    -> Delete custom API data document from MongoDB
 *
 * 2. Next.js App Router Ready Files (`/backend/nextjs/`):
 *    - `backend/nextjs/lib/mongodb.ts`               -> MongoDB connection (Mongoose + Native MongoClient)
 *    - `backend/nextjs/lib/auth.ts`                  -> Better Auth server config with `mongodbAdapter`
 *    - `backend/nextjs/lib/auth-client.ts`           -> Better Auth React/Next.js client (`signIn`, `signUp`, `useSession`)
 *    - `backend/nextjs/app/api/auth/[...all]/route.ts` -> Next.js Better Auth Route Handler
 *    - `backend/nextjs/app/api/projects/route.ts`    -> Next.js App Router Projects GET & POST API
 *    - `backend/nextjs/app/api/data/route.ts`        -> Next.js App Router Data GET & POST API
 */

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _nextMongooseCache: GlobalMongoose | undefined;
}

const cached: GlobalMongoose = globalThis._nextMongooseCache || {
  conn: null,
  promise: null,
};

if (!globalThis._nextMongooseCache) {
  globalThis._nextMongooseCache = cached;
}

export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("Please define the MONGO_URI environment variable inside .env");
  }
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getMongoClientDb() {
  const conn = await connectDB();
  return conn.connection.db;
}
