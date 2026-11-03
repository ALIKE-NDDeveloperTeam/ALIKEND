import mongoose, { Schema, Document } from "mongoose";

export type VehicleCategory =
  | "bike"
  | "auto"
  | "cab"
  | "car_mini"
  | "car_sedan"
  | "car_suv"
  | "car_premium"
  | "car_xl"
  | "car_green";

export type DriverStatus = "pending" | "approved" | "suspended" | "rejected";
export type VerificationStatus = "pending" | "verified" | "rejected";

export interface IDriver extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  loginOtp?: string;
  loginOtpExpiresAt?: Date;
  photoUrl?: string;

  // Vehicle Details
  vehicleType: VehicleCategory;
  vehicleNumber: string;
  vehicleModel?: string;
  seatingCapacity: number;

  // Verification Documents
  licenseNumber: string;
  licenseExpiryDate?: Date;
  licenseDocUrl?: string;
  licenseStatus: VerificationStatus;

  aadhaarNumberMasked?: string;
  aadhaarDocUrl?: string;
  identityStatus: VerificationStatus;

  rcNumber?: string;
  rcDocUrl?: string;
  rcStatus: VerificationStatus;

  insurancePolicyNumber?: string;
  insuranceExpiryDate?: Date;
  insuranceDocUrl?: string;
  insuranceStatus: VerificationStatus;

  permitNumber?: string;
  permitExpiryDate?: Date;
  permitDocUrl?: string;
  permitStatus: VerificationStatus;

  // Banking & Payouts
  bankDetails?: {
    accountNumberMasked?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };

  // Status & Duty
  status: DriverStatus;
  suspensionReason?: string;
  suspendedAt?: Date;
  isOnline: boolean;
  dutyStartTime?: Date;

  // Real-time Geo
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  locationUpdatedAt?: Date;

  // Performance & Stats
  rating: number;
  totalRides: number;
  earningsToday: number;
  totalEarnings: number;
  currentRideId?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String },
    loginOtp: { type: String },
    loginOtpExpiresAt: { type: Date },
    photoUrl: { type: String, default: "" },

    // Vehicle Details
    vehicleType: {
      type: String,
      enum: [
        "bike",
        "auto",
        "cab",
        "car_mini",
        "car_sedan",
        "car_suv",
        "car_premium",
        "car_xl",
        "car_green",
      ],
      required: true,
      default: "auto",
      index: true,
    },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleModel: { type: String, default: "" },
    seatingCapacity: { type: Number, default: 3 },

    // Documents & Verification
    licenseNumber: { type: String, required: true, uppercase: true, trim: true },
    licenseExpiryDate: { type: Date },
    licenseDocUrl: { type: String, default: "" },
    licenseStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    aadhaarNumberMasked: { type: String, default: "" },
    aadhaarDocUrl: { type: String, default: "" },
    identityStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    rcNumber: { type: String, default: "" },
    rcDocUrl: { type: String, default: "" },
    rcStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    insurancePolicyNumber: { type: String, default: "" },
    insuranceExpiryDate: { type: Date },
    insuranceDocUrl: { type: String, default: "" },
    insuranceStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    permitNumber: { type: String, default: "" },
    permitExpiryDate: { type: Date },
    permitDocUrl: { type: String, default: "" },
    permitStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    // Banking & Payout
    bankDetails: {
      accountNumberMasked: { type: String, default: "" },
      ifscCode: { type: String, default: "" },
      bankName: { type: String, default: "" },
      upiId: { type: String, default: "" },
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "suspended", "rejected"],
      default: "pending",
      index: true,
    },
    suspensionReason: { type: String },
    suspendedAt: { type: Date },
    isOnline: { type: Boolean, default: false, index: true },
    dutyStartTime: { type: Date },

    // Geospatial Coordinates
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139],
      },
    },
    locationUpdatedAt: { type: Date, default: Date.now },

    // Performance
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    totalRides: { type: Number, default: 0, min: 0 },
    earningsToday: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    currentRideId: { type: String, default: null },
  },
  {
    timestamps: true,
    collection: "drivers",
  }
);

// 2dsphere index for geospatial proximity queries ($near within radius)
DriverSchema.index({ location: "2dsphere" });

export default mongoose.model<IDriver>("Driver", DriverSchema);
