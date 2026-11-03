import mongoose, { Schema, Document } from "mongoose";

export type MemberTier = "Silver" | "Gold" | "Platinum";

export interface ICustomer extends Document {
  name: string;
  email: string;
  tier: MemberTier;
  ordersCount: number;
  lifetimeSpend: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    ordersCount: { type: Number, default: 0 },
    lifetimeSpend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
