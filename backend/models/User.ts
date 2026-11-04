import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserRestriction {
  enabled: boolean;
  reason?: string;
  adminNote?: string;
  appliedBy?: string;
  appliedAt?: Date;
  expiresAt?: Date | null;
}

export interface IRestrictionAuditEntry {
  restrictionKey: string;
  action: "enabled" | "disabled";
  reason?: string;
  adminNote?: string;
  performedBy: string;
  timestamp: Date;
}

export interface ISecurityAuditEntry {
  action: string;
  performedBy: string;
  details: string;
  timestamp: Date;
}

export interface IUserAddress {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface ISavedLocation {
  lat: number;
  lng: number;
  label: string;
  updatedAt: Date;
}

export interface IUser extends Document {
  fullName: string;
  username?: string;
  email: string;
  country: string;
  mobileNumber: string;
  phone?: string;
  passwordHash: string;
  tier: "Silver" | "Gold" | "Platinum" | "VIP" | "Normal";
  verified: boolean;
  isBlocked: boolean;
  avatar?: string;
  addresses?: IUserAddress[];
  savedLocation?: ISavedLocation | null;
  adminNotes?: string;
  restrictions?: Record<string, IUserRestriction>;
  restrictionAuditLog?: IRestrictionAuditEntry[];
  securityAuditLog?: ISecurityAuditEntry[];
<<<<<<< HEAD
  metadata?: Record<string, any>;
  customData?: Record<string, any>;
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    country: { type: String, required: false, default: "Bangladesh", trim: true },
    mobileNumber: { type: String, required: false, default: "", trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum", "VIP", "Normal"], default: "Normal" },
    verified: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    avatar: { type: String },
    addresses: [
      {
        name: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        phone: String,
        isDefault: Boolean,
      },
    ],
    savedLocation: {
      lat: { type: Number },
      lng: { type: Number },
      label: { type: String },
      updatedAt: { type: Date },
    },
    adminNotes: { type: String, default: "" },
    restrictions: { type: Schema.Types.Mixed, default: {} },
    restrictionAuditLog: [
      {
        restrictionKey: String,
        action: String,
        reason: String,
        adminNote: String,
        performedBy: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    securityAuditLog: [
      {
        action: String,
        performedBy: String,
        details: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
<<<<<<< HEAD
    metadata: { type: Schema.Types.Mixed, default: {} },
    customData: { type: Schema.Types.Mixed, default: {} },
=======
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
  },
  {
    timestamps: true,
    collection: "users", // Explicitly ensure target collection is "users"
  }
);

// Explicitly register model with collection name "users"
const User: Model<IUser> = mongoose.models.User as Model<IUser> || mongoose.model<IUser>("User", UserSchema, "users");
export default User;
