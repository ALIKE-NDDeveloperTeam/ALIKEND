import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReturnPolicy extends Document {
  key: string;
  eligibilityDays: number;
  returnFee: number;
  requireEvidence: boolean;
  eligibleCategories: string[];
  nonReturnableCategories: string[];
  reasons: string[];
  pickupEnabled: boolean;
  autoApproveVip: boolean;
  updatedBy?: string;
  updatedAt: Date;
}

const ReturnPolicySchema = new Schema<IReturnPolicy>(
  {
    key: { type: String, required: true, unique: true, default: "default_policy" },
    eligibilityDays: { type: Number, default: 7 },
    returnFee: { type: Number, default: 0 },
    requireEvidence: { type: Boolean, default: true },
    eligibleCategories: {
      type: [String],
      default: [
        "Electronics & Gadgets",
        "Fashion & Apparel",
        "Home & Living",
        "Watches & Accessories",
        "Footwear",
      ],
    },
    nonReturnableCategories: {
      type: [String],
      default: ["Intimates & Swimwear", "Custom / Bespoke Atelier Items", "Perishable Goods"],
    },
    reasons: {
      type: [String],
      default: [
        "Damaged / Defective on Arrival",
        "Size Does Not Fit",
        "Item Different from Photos / Description",
        "Incorrect Item Delivered",
        "Quality Did Not Meet Expectations",
        "Changed Mind / No Longer Needed",
      ],
    },
    pickupEnabled: { type: Boolean, default: true },
    autoApproveVip: { type: Boolean, default: false },
    updatedBy: { type: String, default: "System Admin" },
  },
  {
    timestamps: true,
    collection: "return_policies",
  }
);

const ReturnPolicy: Model<IReturnPolicy> =
  mongoose.models.ReturnPolicy as Model<IReturnPolicy> ||
  mongoose.model<IReturnPolicy>("ReturnPolicy", ReturnPolicySchema, "return_policies");

export default ReturnPolicy;
