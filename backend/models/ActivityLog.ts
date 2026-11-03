import mongoose, { Schema, Document, Model } from "mongoose";

export interface IActivityLog extends Document {
  eventType: string;
  userName: string;
  email: string;
  status: "success" | "failed";
  ipAddress: string;
  deviceInfo: string;
  browser?: string;
  os?: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    userName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    status: { type: String, required: true, enum: ["success", "failed"], default: "success" },
    ipAddress: { type: String, default: "127.0.0.1" },
    deviceInfo: { type: String, default: "Web Browser" },
    browser: { type: String },
    os: { type: String },
    details: { type: String },
  },
  {
    timestamps: true,
    collection: "activity_logs", // Explicitly ensure target collection is "activity_logs" in alikendshop
  }
);

// Add descending index on createdAt for fast sorting by newest first
ActivityLogSchema.index({ createdAt: -1 });

const ActivityLog: Model<IActivityLog> =
  (mongoose.models.ActivityLog as Model<IActivityLog>) ||
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema, "activity_logs");

export default ActivityLog;
