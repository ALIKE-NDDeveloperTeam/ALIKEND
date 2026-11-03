import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformSetting extends Document {
  key: string; // e.g. "commission_settings"
  commissionRate: number; // e.g. 5 for 5%
  platformBalance: number; // running balance credited
  totalCommissionEarned: number; // lifetime commission earned
<<<<<<< HEAD
  pricing?: any;
  categories?: any;
  data?: any;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformSettingSchema = new Schema<IPlatformSetting>(
  {
<<<<<<< HEAD
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

=======
    key: { type: String, required: true, unique: true, default: "commission_settings" },
    commissionRate: { type: Number, default: 5, min: 0, max: 100 },
    platformBalance: { type: Number, default: 0 },
    totalCommissionEarned: { type: Number, default: 0 },
    updatedBy: { type: String, default: "superadmin" },
  },
  { timestamps: true, collection: "platform_settings" }
);

export default mongoose.model<IPlatformSetting>("PlatformSetting", PlatformSettingSchema);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
