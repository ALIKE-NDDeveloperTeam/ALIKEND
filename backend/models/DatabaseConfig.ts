import mongoose, { Schema, Document } from "mongoose";

export interface IDatabaseProviderConfig {
  id: "mongodb" | "firebase" | "supabase" | "cloudinary" | "aws_s3" | "appwrite";
  name: string;
  type: "database" | "media_storage" | "backend_as_a_service";
  enabled: boolean;
  isPrimary: boolean;
  status: "connected" | "standby" | "disabled" | "error";
  plan: string;
  monthlyCost: number;
  currency: string;
  storageUsedMB: number;
  storageQuotaMB: number;
  recordsCount: number;
  latencyMs: number;
  lastTestedAt?: Date;
  lastBackupAt?: Date;
  credentials: Record<string, string>;
}

export interface IMigrationLog {
  id: string;
  from: string;
  to: string;
  recordsCount: number;
  status: "completed" | "failed" | "in_progress";
  timestamp: Date;
  note?: string;
}

export interface IDatabaseHubSettings extends Document {
  key: string;
  primaryDatabase: string;
  primaryMediaStorage: string;
  dualWriteEnabled: boolean;
  autoFailoverEnabled: boolean;
  autoBackupInterval: "disabled" | "hourly" | "daily" | "weekly";
  providers: IDatabaseProviderConfig[];
  migrationHistory: IMigrationLog[];
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DatabaseProviderConfigSchema = new Schema<IDatabaseProviderConfig>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    isPrimary: { type: Boolean, default: false },
    status: { type: String, default: "standby" },
    plan: { type: String, default: "Free Tier" },
    monthlyCost: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    storageUsedMB: { type: Number, default: 0 },
    storageQuotaMB: { type: Number, default: 512 },
    recordsCount: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 24 },
    lastTestedAt: { type: Date },
    lastBackupAt: { type: Date },
    credentials: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const MigrationLogSchema = new Schema<IMigrationLog>(
  {
    id: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    recordsCount: { type: Number, default: 0 },
    status: { type: String, default: "completed" },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const DatabaseHubSettingsSchema = new Schema<IDatabaseHubSettings>(
  {
    key: { type: String, required: true, unique: true, default: "database_hub_settings" },
    primaryDatabase: { type: String, default: "mongodb" },
    primaryMediaStorage: { type: String, default: "cloudinary" },
    dualWriteEnabled: { type: Boolean, default: true },
    autoFailoverEnabled: { type: Boolean, default: true },
    autoBackupInterval: { type: String, default: "daily" },
    providers: [DatabaseProviderConfigSchema],
    migrationHistory: [MigrationLogSchema],
    updatedBy: { type: String, default: "superadmin" },
  },
  { timestamps: true, collection: "database_hub_settings" }
);

export default mongoose.model<IDatabaseHubSettings>("DatabaseHubSetting", DatabaseHubSettingsSchema);
