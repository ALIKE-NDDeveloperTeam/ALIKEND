import mongoose, { Schema, Document } from "mongoose";

export type DeliveryPartnerStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "suspended";

export type VehicleType = "bicycle" | "ebike" | "scooter" | "motorcycle";

export interface IDeliveryPartner extends Document {
  partnerId: string;
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  avatar?: string;
  city: string;
  operatingZone: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship?: string;
  };
  vehicle: {
    type: VehicleType;
    model?: string;
    registrationNumber?: string;
    rcDocUrl?: string;
  };
  identity: {
    type: "aadhaar" | "pan" | "voter_id";
    numberMasked: string; // e.g. "XXXX-XXXX-4589"
    documentUrl?: string;
    drivingLicenseNumberMasked?: string;
    drivingLicenseExpiry?: string;
    drivingLicenseUrl?: string;
    verificationStatus: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  };
  payout: {
    accountHolderName: string;
    accountNumberMasked: string; // e.g. "••••••••1234"
    ifsc: string;
    bankName?: string;
    upiId?: string;
  };
  status: DeliveryPartnerStatus;
  rejectionReason?: string;
  isOnline: boolean;
  isOnBreak: boolean;
  breakUntil?: Date;
  currentLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    accuracy?: number;
    lastUpdated?: Date;
  };
  rating: number;
  totalDeliveries: number;
  earningsToday: number;
  walletBalance?: number;
  activeTaskId?: string;
  privacySettings?: {
    locationSharingMode: "always_on_duty" | "active_order_only" | "coarse_zone";
    maskPhoneToCustomer: boolean;
    hideLiveCoordsWhenIdle: boolean;
    emergencyShareLiveGps: boolean;
  };
  performanceMetrics?: {
    acceptanceRate: number;
    completionRate: number;
    onTimeDeliveryRate: number;
    averageDeliveryMinutes: number;
    totalKilometers: number;
    tier: "Silver" | "Gold" | "Diamond";
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPartnerSchema = new Schema<IDeliveryPartner>(
  {
    partnerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String },
    avatar: { type: String },
    city: { type: String, required: true, default: "New Delhi" },
    operatingZone: { type: String, required: true, default: "Central Delhi Hub" },
    dob: { type: String },
    bloodGroup: { type: String },
    address: { type: String },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String },
    },
    vehicle: {
      type: {
        type: String,
        enum: ["bicycle", "ebike", "scooter", "motorcycle"],
        required: true,
        default: "scooter",
      },
      model: { type: String },
      registrationNumber: { type: String },
      rcDocUrl: { type: String },
    },
    identity: {
      type: {
        type: String,
        enum: ["aadhaar", "pan", "voter_id"],
        default: "aadhaar",
      },
      numberMasked: { type: String, required: true },
      documentUrl: { type: String },
      drivingLicenseNumberMasked: { type: String },
      drivingLicenseExpiry: { type: String },
      drivingLicenseUrl: { type: String },
      verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      rejectionReason: { type: String },
    },
    payout: {
      accountHolderName: { type: String, required: true },
      accountNumberMasked: { type: String, required: true },
      ifsc: { type: String, required: true },
      bankName: { type: String },
      upiId: { type: String },
    },
    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected", "suspended"],
      default: "pending_approval",
      index: true,
    },
    rejectionReason: { type: String },
    isOnline: { type: Boolean, default: false, index: true },
    isOnBreak: { type: Boolean, default: false },
    breakUntil: { type: Date },
    currentLocation: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
      heading: { type: Number, default: 0 },
      accuracy: { type: Number, default: 10 },
      lastUpdated: { type: Date, default: Date.now },
    },
    rating: { type: Number, default: 5.0 },
    totalDeliveries: { type: Number, default: 0 },
    earningsToday: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 450 },
    activeTaskId: { type: String },
    privacySettings: {
      locationSharingMode: {
        type: String,
        enum: ["always_on_duty", "active_order_only", "coarse_zone"],
        default: "active_order_only",
      },
      maskPhoneToCustomer: { type: Boolean, default: true },
      hideLiveCoordsWhenIdle: { type: Boolean, default: true },
      emergencyShareLiveGps: { type: Boolean, default: true },
    },
    performanceMetrics: {
      acceptanceRate: { type: Number, default: 96.5 },
      completionRate: { type: Number, default: 99.1 },
      onTimeDeliveryRate: { type: Number, default: 97.4 },
      averageDeliveryMinutes: { type: Number, default: 21 },
      totalKilometers: { type: Number, default: 342 },
      tier: { type: String, enum: ["Silver", "Gold", "Diamond"], default: "Gold" },
    },
  },
  {
    timestamps: true,
    collection: "delivery_partners",
  }
);

DeliveryPartnerSchema.index({ isOnline: 1, status: 1 });
DeliveryPartnerSchema.index({ "currentLocation.lat": 1, "currentLocation.lng": 1 });

export const DeliveryPartnerModel: mongoose.Model<IDeliveryPartner> =
  (mongoose.models.DeliveryPartner as mongoose.Model<IDeliveryPartner>) ||
  mongoose.model<IDeliveryPartner>("DeliveryPartner", DeliveryPartnerSchema);

export default DeliveryPartnerModel;
