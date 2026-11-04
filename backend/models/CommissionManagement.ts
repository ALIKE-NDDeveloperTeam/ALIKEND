import mongoose, { Schema, Document, Model } from "mongoose";

export type CommissionRuleType =
  | "category"
  | "subcategory"
  | "product_override"
  | "seller_override";

export interface ICommissionRule extends Document {
  ruleId: string;
  ruleType: CommissionRuleType;
  level: 1 | 2 | 3;
  categoryId: string;
  categoryName: string;
  categoryNameBn?: string;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  commissionRate: number;
  minCommissionAmount?: number;
  maxCommissionAmount?: number;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  isActive: boolean;
  updatedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionRuleSchema = new Schema<ICommissionRule>(
  {
    ruleId: { type: String, required: true, unique: true, index: true },
    ruleType: {
      type: String,
      enum: ["category", "subcategory", "product_override", "seller_override"],
      required: true,
      index: true,
    },
    level: { type: Number, enum: [1, 2, 3], default: 1 },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, required: true, trim: true },
    categoryNameBn: { type: String, default: "", trim: true },
    parentCategoryId: { type: String, default: null, index: true },
    parentCategoryName: { type: String, default: null },
    targetId: { type: String, default: null, index: true },
    targetName: { type: String, default: null },
    commissionRate: { type: Number, required: true, min: 0, max: 100 },
    minCommissionAmount: { type: Number, default: 0, min: 0 },
    maxCommissionAmount: { type: Number, default: 0, min: 0 },
    effectiveStartDate: { type: String, default: "" },
    effectiveEndDate: { type: String, default: "" },
    isActive: { type: Boolean, default: true, index: true },
    updatedBy: { type: String, default: "Super Admin" },
    notes: { type: String, default: "" },
  },
  { timestamps: true, collection: "commission_rules" }
);

export const CommissionRule: Model<ICommissionRule> =
  (mongoose.models.CommissionRule as Model<ICommissionRule>) ||
  mongoose.model<ICommissionRule>("CommissionRule", CommissionRuleSchema);

export interface ICommissionAuditLog extends Document {
  auditId: string;
  actionType:
    | "rule_created"
    | "rate_updated"
    | "status_toggled"
    | "rule_deleted"
    | "config_updated"
    | "commission_reversed"
    | "commission_refunded";
  targetType: "global" | "category" | "subcategory" | "product" | "seller" | "order";
  targetId: string;
  targetName: string;
  previousRate: number | null;
  newRate: number | null;
  reason: string;
  adminName: string;
  adminEmail: string;
  createdAt: Date;
}

const CommissionAuditLogSchema = new Schema<ICommissionAuditLog>(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    actionType: {
      type: String,
      enum: [
        "rule_created",
        "rate_updated",
        "status_toggled",
        "rule_deleted",
        "config_updated",
        "commission_reversed",
        "commission_refunded",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["global", "category", "subcategory", "product", "seller", "order"],
      required: true,
    },
    targetId: { type: String, required: true },
    targetName: { type: String, required: true },
    previousRate: { type: Number, default: null },
    newRate: { type: Number, default: null },
    reason: { type: String, default: "Administrative commission update" },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
  },
  { timestamps: true, collection: "commission_audit_logs" }
);

export const CommissionAuditLog: Model<ICommissionAuditLog> =
  (mongoose.models.CommissionAuditLog as Model<ICommissionAuditLog>) ||
  mongoose.model<ICommissionAuditLog>("CommissionAuditLog", CommissionAuditLogSchema);
