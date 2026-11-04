import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginAttempt extends Document {
  key: string;
  type: "ip" | "identifier";
  value: string;
  createdAt: Date;
  expiresAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    key: { type: String, required: true, index: true },
    type: { type: String, enum: ["ip", "identifier"], required: true },
    value: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB automatically purges documents after expiresAt
    },
  },
  {
    timestamps: true,
    collection: "login_attempts",
  }
);

// Compound index for fast querying active attempts within time window
LoginAttemptSchema.index({ key: 1, expiresAt: 1 });

const LoginAttempt: Model<ILoginAttempt> =
  (mongoose.models.LoginAttempt as Model<ILoginAttempt>) ||
  mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema, "login_attempts");

export default LoginAttempt;
