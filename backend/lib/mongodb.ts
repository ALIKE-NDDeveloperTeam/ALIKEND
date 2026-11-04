import mongoose from "mongoose";
import { connectMongoDB, isMongoConnected } from "../store";

interface GlobalMongoCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseNextCache: GlobalMongoCache | undefined;
}

const cached: GlobalMongoCache = globalThis.__mongooseNextCache || {
  conn: null,
  promise: null,
};

if (!globalThis.__mongooseNextCache) {
  globalThis.__mongooseNextCache = cached;
}

/**
 * Next.js & Express compatible MongoDB connection helper.
 * Uses process.env.MONGO_URI with connection pooling & hot-reload caching.
 */
export async function connectToMongoDatabase(): Promise<typeof mongoose | null> {
  if (isMongoConnected() && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    console.warn("[MongoDB] MONGO_URI is not defined. Running with in-memory fallback.");
    return null;
  }

  if (!cached.promise) {
    cached.promise = (async () => {
      try {
        await connectMongoDB();
        if (mongoose.connection.readyState === 1) {
          return mongoose;
        }
        const instance = await mongoose.connect(mongoUri, {
          bufferCommands: false,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 8000,
        });
        return instance;
      } catch (err) {
        cached.promise = null;
        console.warn("[MongoDB] Connection warning:", (err as Error)?.message || err);
        return null;
      }
    })();
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function getNativeMongoDb() {
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    return mongoose.connection.db;
  }
  return null;
}
