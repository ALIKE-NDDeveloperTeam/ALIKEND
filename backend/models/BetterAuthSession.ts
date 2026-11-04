import mongoose, { Schema, Document } from "mongoose";

export interface IBetterAuthSession extends Document {
  sessionToken: string;
  userId: string;
  userEmail: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BetterAuthSessionSchema = new Schema<IBetterAuthSession>(
  {
    sessionToken: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    userName: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
    collection: "better_auth_sessions",
  }
);

export const BetterAuthSession: mongoose.Model<IBetterAuthSession> =
  (mongoose.models.BetterAuthSession as mongoose.Model<IBetterAuthSession>) ||
  mongoose.model<IBetterAuthSession>("BetterAuthSession", BetterAuthSessionSchema);

export default BetterAuthSession;
