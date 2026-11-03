import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformSetting extends Document {
  key: string; // e.g. "commission_settings"
  commissionRate: number; // e.g. 5 for 5%
  platformBalance: number; // running balance credited
  totalCommissionEarned: number; // lifetime commission earned
  pricing?: any;
  categories?: any;
  data?: any;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingSchema = new Schema<IPlatformSetting>(
  {
    key: { type: String, required: true, unique: true, default: "commission_settings", index: true },
    commissionRate: { type: Number, default: 5, min: 0, max: 100 },
    platformBalance: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    pricing: { type: Schema.Types.Mixed },
    categories: { type: Schema.Types.Mixed },
    data: { type: Schema.Types.Mixed },
    updatedBy: { type: String, default: "superadmin" },
  },
  { timestamps: true, collection: "platform_settings", strict: false }
);

export default mongoose.model<IPlatformSetting>("PlatformSetting", PlatformSettingSchema);

