import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformWithdrawal extends Document {
  amount: number;
  note?: string;
  adminEmail: string;
  adminName: string;
  date: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlatformWithdrawalSchema = new Schema<IPlatformWithdrawal>(
  {
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    adminEmail: { type: String, required: true },
    adminName: { type: String, default: "Super Admin" },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "Completed" },
  },
  { timestamps: true, collection: "platform_withdrawals" }
);

export default mongoose.model<IPlatformWithdrawal>("PlatformWithdrawal", PlatformWithdrawalSchema);
