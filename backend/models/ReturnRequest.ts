import mongoose, { Schema, Document, Model } from "mongoose";

export type ReturnStatus =
  | "Requested"
  | "Under Review"
  | "Approved"
  | "Pickup Scheduled"
  | "Picked Up"
  | "In Transit"
  | "Received"
  | "Inspection in Progress"
  | "Refund Pending"
  | "Completed"
  | "Rejected"
  | "Cancelled";

export interface IReturnRequest extends Document {
  returnId: string;
  orderNumber: string;
  orderId?: any;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productId?: any;
  productName: string;
  productImage?: string;
  variant?: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  purchaseDate?: Date;
  deliveryDate?: Date;
  returnReason: string;
  customerDescription: string;
  evidenceImages: string[];
  requestedResolution: "refund" | "replacement" | "exchange";
  status: ReturnStatus;
  assignedStaff?: {
    id?: string;
    name?: string;
    email?: string;
  };
  courierName?: string;
  trackingNumber?: string;
  pickupScheduledDate?: Date;
  pickupCompletedDate?: Date;
  inspectionResult?: "pending" | "resalable" | "damaged" | "defective";
  inspectionNotes?: string;
  restocked: boolean;
  refundMethod?: "original_payment" | "wallet" | "cod_manual";
  refundAmount: number;
  refundDeduction: number;
  refundDeductionReason?: string;
  refundTransactionRef?: string;
  refundStatus: "pending" | "processed" | "failed" | "not_applicable";
  rejectionReason?: string;
  internalNotes: Array<{
    id: string;
    author: string;
    note: string;
    createdAt: Date;
  }>;
  auditLog: Array<{
    action: string;
    performedBy: string;
    timestamp: Date;
    notes?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnRequestSchema = new Schema<IReturnRequest>(
  {
    returnId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    orderId: { type: Schema.Types.Mixed },
    customerId: { type: String, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true, lowercase: true, index: true },
    customerPhone: { type: String },
    productId: { type: Schema.Types.Mixed },
    productName: { type: String, required: true },
    productImage: { type: String, default: "" },
    variant: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    unitPrice: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    purchaseDate: { type: Date },
    deliveryDate: { type: Date },
    returnReason: { type: String, required: true },
    customerDescription: { type: String, default: "" },
    evidenceImages: [{ type: String }],
    requestedResolution: {
      type: String,
      enum: ["refund", "replacement", "exchange"],
      default: "refund",
    },
    status: {
      type: String,
      enum: [
        "Requested",
        "Under Review",
        "Approved",
        "Pickup Scheduled",
        "Picked Up",
        "In Transit",
        "Received",
        "Inspection in Progress",
        "Refund Pending",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      default: "Requested",
      index: true,
    },
    assignedStaff: {
      id: String,
      name: String,
      email: String,
    },
    courierName: { type: String, default: "Alike Express Courier" },
    trackingNumber: { type: String, default: "" },
    pickupScheduledDate: { type: Date },
    pickupCompletedDate: { type: Date },
    inspectionResult: {
      type: String,
      enum: ["pending", "resalable", "damaged", "defective"],
      default: "pending",
    },
    inspectionNotes: { type: String, default: "" },
    restocked: { type: Boolean, default: false },
    refundMethod: {
      type: String,
      enum: ["original_payment", "wallet", "cod_manual"],
      default: "wallet",
    },
    refundAmount: { type: Number, default: 0 },
    refundDeduction: { type: Number, default: 0 },
    refundDeductionReason: { type: String, default: "" },
    refundTransactionRef: { type: String, default: "" },
    refundStatus: {
      type: String,
      enum: ["pending", "processed", "failed", "not_applicable"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    internalNotes: [
      {
        id: String,
        author: String,
        note: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    auditLog: [
      {
        action: String,
        performedBy: String,
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "return_requests",
  }
);

const ReturnRequest: Model<IReturnRequest> =
  mongoose.models.ReturnRequest as Model<IReturnRequest> ||
  mongoose.model<IReturnRequest>("ReturnRequest", ReturnRequestSchema, "return_requests");

export default ReturnRequest;
