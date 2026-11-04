import mongoose, { Schema, Document } from "mongoose";

export type SellerWithdrawalStatus = "pending" | "approved" | "rejected";

export interface ISellerWithdrawal extends Document {
  sellerId: mongoose.Types.ObjectId | string;
  sellerEmail: string;
  sellerShopName: string;
  amount: number;
  payoutDetails?: string;
  note?: string;
  status: SellerWithdrawalStatus;
  rejectionReason?: string;
  requestedAt: Date;
  processedAt?: Date;
  processedByAdminEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SellerWithdrawalSchema = new Schema<ISellerWithdrawal>(
  {
    sellerId: { type: Schema.Types.Mixed, ref: "Seller", required: true, index: true },
    sellerEmail: { type: String, required: true, trim: true, lowercase: true },
    sellerShopName: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    payoutDetails: { type: String, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: { type: String, trim: true },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedByAdminEmail: { type: String, trim: true },
  },
  { timestamps: true, collection: "seller_withdrawals" }
);

export default mongoose.model<ISellerWithdrawal>("SellerWithdrawal", SellerWithdrawalSchema);
