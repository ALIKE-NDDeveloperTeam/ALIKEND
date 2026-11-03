import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOtpVerification extends Document {
  email: string;
  otp: string;
  purpose: "registration" | "verification" | "forgot_password" | "login";
  attempts?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OtpVerificationSchema = new Schema<IOtpVerification>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otp: { type: String, required: true, trim: true },
    purpose: {
      type: String,
      enum: ["registration", "verification", "forgot_password", "login"],
      default: "verification",
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: automatically purges document at expiresAt
    },
  },
  {
    timestamps: true,
    collection: "otp_verifications",
  }
);

const OtpVerification: Model<IOtpVerification> =
  (mongoose.models.OtpVerification as Model<IOtpVerification>) ||
  mongoose.model<IOtpVerification>("OtpVerification", OtpVerificationSchema, "otp_verifications");

export default OtpVerification;
