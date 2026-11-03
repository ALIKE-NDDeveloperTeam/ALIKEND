import mongoose, { Schema, Document } from "mongoose";

// ==========================================
// 1. EARNINGS RECORD (Module 1F: 1-8, 10)
// ==========================================
export interface IEarningsBreakdown {
  basePayment: number;              // Rule 3: Minimum delivery guarantee payment (e.g. ₹40)
  distancePayment: number;          // Rule 2: Distance-based delivery earnings
  additionalDistancePayment: number;// Rule 4: Additional distance payment beyond standard threshold
  heavyPackageFee: number;          // Rule 5: Heavy-package payment rules
  waitingTimeCompensation: number;  // Rule 6: Waiting-time compensation at store or doorstep
  peakHourIncentive: number;        // Rule 7: Peak-hour incentives
  promotionalBonus: number;         // Rule 8: Promotional bonuses
  tips: number;
  totalEarnings: number;            // Rule 1: Earnings per completed order
}

export interface IDeliveryEarningsRecord extends Document {
  recordId: string;
  partnerId: string;
  taskId: string;
  orderNumber: string;
  serviceType: string;
  status: "completed" | "cancelled" | "compensation_paid";
  date: Date;
  distanceKm: number;
  weightKg: number;
  waitingMinutes: number;
  isPeakHour: boolean;
  breakdown: IEarningsBreakdown;
  cancellationCompensation?: number;
  cancellationReason?: string;
  cancelledBy?: "customer" | "store" | "partner" | "system";
  paymentStatus: "settled_to_wallet" | "withdrawn" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryEarningsRecordSchema = new Schema<IDeliveryEarningsRecord>(
  {
    recordId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    taskId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    serviceType: { type: String, default: "quick_delivery" },
    status: {
      type: String,
      enum: ["completed", "cancelled", "compensation_paid"],
      default: "completed",
      index: true,
    },
    date: { type: Date, default: Date.now, index: true },
    distanceKm: { type: Number, default: 0 },
    weightKg: { type: Number, default: 1.0 },
    waitingMinutes: { type: Number, default: 0 },
    isPeakHour: { type: Boolean, default: false },
    breakdown: {
      basePayment: { type: Number, default: 40 },
      distancePayment: { type: Number, default: 0 },
      additionalDistancePayment: { type: Number, default: 0 },
      heavyPackageFee: { type: Number, default: 0 },
      waitingTimeCompensation: { type: Number, default: 0 },
      peakHourIncentive: { type: Number, default: 0 },
      promotionalBonus: { type: Number, default: 0 },
      tips: { type: Number, default: 0 },
      totalEarnings: { type: Number, required: true },
    },
    cancellationCompensation: { type: Number, default: 0 },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ["customer", "store", "partner", "system"] },
    paymentStatus: {
      type: String,
      enum: ["settled_to_wallet", "withdrawn", "pending"],
      default: "settled_to_wallet",
    },
  },
  { timestamps: true, collection: "delivery_earnings_records" }
);

export const DeliveryEarningsRecordModel =
  (mongoose.models.DeliveryEarningsRecord as mongoose.Model<IDeliveryEarningsRecord>) ||
  mongoose.model<IDeliveryEarningsRecord>("DeliveryEarningsRecord", DeliveryEarningsRecordSchema);


// ==========================================
// 2. PAYOUT RECORD (Module 1F: 11-12)
// ==========================================
export interface IDeliveryPayoutRecord extends Document {
  payoutId: string;
  partnerId: string;
  amount: number;
  method: "bank_transfer" | "upi";
  recipientDetailsMasked: string; // e.g. "••••••••4589" or "rah***@upi"
  bankName?: string;
  ifsc?: string;
  utrReference?: string; // Bank UTR or UPI RRN reference number
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: Date;
  processedAt?: Date;
  failureReason?: string;
  type: "on_demand" | "weekly_auto" | "instant_bonus";
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryPayoutRecordSchema = new Schema<IDeliveryPayoutRecord>(
  {
    payoutId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    method: {
      type: String,
      enum: ["bank_transfer", "upi"],
      required: true,
    },
    recipientDetailsMasked: { type: String, required: true },
    bankName: { type: String },
    ifsc: { type: String },
    utrReference: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    failureReason: { type: String },
    type: {
      type: String,
      enum: ["on_demand", "weekly_auto", "instant_bonus"],
      default: "on_demand",
    },
  },
  { timestamps: true, collection: "delivery_payout_records" }
);

export const DeliveryPayoutRecordModel =
  (mongoose.models.DeliveryPayoutRecord as mongoose.Model<IDeliveryPayoutRecord>) ||
  mongoose.model<IDeliveryPayoutRecord>("DeliveryPayoutRecord", DeliveryPayoutRecordSchema);


// ==========================================
// 3. EARNINGS ADJUSTMENT AUDIT (Module 1F: 13)
// ==========================================
export interface IDeliveryAdjustment extends Document {
  adjustmentId: string;
  partnerId: string;
  type: "credit" | "debit";
  amount: number;
  reason: string;
  category: "dispute_resolution" | "wait_time_correction" | "toll_reimbursement" | "penalty" | "promotional_grant" | "other";
  referenceOrderNumber?: string;
  adjustedBy: string; // e.g. "Super Admin" or "Ops Manager"
  timestamp: Date;
  auditNote: string;
  createdAt: Date;
}

const DeliveryAdjustmentSchema = new Schema<IDeliveryAdjustment>(
  {
    adjustmentId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
    category: {
      type: String,
      enum: ["dispute_resolution", "wait_time_correction", "toll_reimbursement", "penalty", "promotional_grant", "other"],
      default: "dispute_resolution",
    },
    referenceOrderNumber: { type: String },
    adjustedBy: { type: String, default: "Operations Admin" },
    timestamp: { type: Date, default: Date.now },
    auditNote: { type: String, required: true },
  },
  { timestamps: true, collection: "delivery_adjustments" }
);

export const DeliveryAdjustmentModel =
  (mongoose.models.DeliveryAdjustment as mongoose.Model<IDeliveryAdjustment>) ||
  mongoose.model<IDeliveryAdjustment>("DeliveryAdjustment", DeliveryAdjustmentSchema);


// ==========================================
// 4. SAFETY INCIDENT & SOS (Module 1G: 1, 3, 4)
// ==========================================
export interface IDeliveryIncident extends Document {
  incidentId: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  type:
    | "emergency_sos"
    | "accident"
    | "vehicle_breakdown"
    | "customer_complaint"
    | "store_complaint"
    | "safety_hazard"
    | "medical_emergency";
  severity: "critical" | "high" | "medium" | "low";
  taskId?: string;
  orderNumber?: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  policeNotified: boolean;
  ambulanceRequested: boolean;
  replacementRiderRequested: boolean;
  photos?: string[];
  status: "active" | "investigating" | "resolved" | "dismissed";
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const DeliveryIncidentSchema = new Schema<IDeliveryIncident>(
  {
    incidentId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    partnerName: { type: String, required: true },
    partnerPhone: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "emergency_sos",
        "accident",
        "vehicle_breakdown",
        "customer_complaint",
        "store_complaint",
        "safety_hazard",
        "medical_emergency",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    taskId: { type: String },
    orderNumber: { type: String },
    description: { type: String, required: true },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
    policeNotified: { type: Boolean, default: false },
    ambulanceRequested: { type: Boolean, default: false },
    replacementRiderRequested: { type: Boolean, default: false },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "investigating", "resolved", "dismissed"],
      default: "active",
      index: true,
    },
    resolutionNotes: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true, collection: "delivery_incidents" }
);

export const DeliveryIncidentModel =
  (mongoose.models.DeliveryIncident as mongoose.Model<IDeliveryIncident>) ||
  mongoose.model<IDeliveryIncident>("DeliveryIncident", DeliveryIncidentSchema);


// ==========================================
// 5. DELIVERY DISPUTE (Module 1G: 6)
// ==========================================
export interface IDeliveryDispute extends Document {
  disputeId: string;
  partnerId: string;
  orderNumber: string;
  taskId?: string;
  category:
    | "missing_payout"
    | "incorrect_distance"
    | "heavy_item_compensation"
    | "waiting_time_underpaid"
    | "unfair_cancellation_penalty"
    | "customer_rating_dispute";
  claimedAmount?: number;
  description: string;
  status: "submitted" | "under_review" | "approved_refunded" | "rejected";
  adminResponse?: string;
  adjustedAmount?: number;
  createdAt: Date;
  resolvedAt?: Date;
}

const DeliveryDisputeSchema = new Schema<IDeliveryDispute>(
  {
    disputeId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    taskId: { type: String },
    category: {
      type: String,
      enum: [
        "missing_payout",
        "incorrect_distance",
        "heavy_item_compensation",
        "waiting_time_underpaid",
        "unfair_cancellation_penalty",
        "customer_rating_dispute",
      ],
      required: true,
    },
    claimedAmount: { type: Number, default: 0 },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved_refunded", "rejected"],
      default: "submitted",
      index: true,
    },
    adminResponse: { type: String },
    adjustedAmount: { type: Number, default: 0 },
    resolvedAt: { type: Date },
  },
  { timestamps: true, collection: "delivery_disputes" }
);

export const DeliveryDisputeModel =
  (mongoose.models.DeliveryDispute as mongoose.Model<IDeliveryDispute>) ||
  mongoose.model<IDeliveryDispute>("DeliveryDispute", DeliveryDisputeSchema);


// ==========================================
// 6. CUSTOMER RATINGS & REVIEWS (Module 1G: 7)
// ==========================================
export interface IDeliveryReview extends Document {
  reviewId: string;
  partnerId: string;
  orderNumber: string;
  customerNameMasked: string; // e.g. "Priya K."
  rating: number; // 1 to 5
  tags: string[]; // e.g. ["Super Fast", "Handled with Care", "Polite", "Safe Driving"]
  comment?: string;
  createdAt: Date;
}

const DeliveryReviewSchema = new Schema<IDeliveryReview>(
  {
    reviewId: { type: String, required: true, unique: true, index: true },
    partnerId: { type: String, required: true, index: true },
    orderNumber: { type: String, required: true },
    customerNameMasked: { type: String, default: "Customer" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: [{ type: String }],
    comment: { type: String },
  },
  { timestamps: true, collection: "delivery_reviews" }
);

export const DeliveryReviewModel =
  (mongoose.models.DeliveryReview as mongoose.Model<IDeliveryReview>) ||
  mongoose.model<IDeliveryReview>("DeliveryReview", DeliveryReviewSchema);


// ==========================================
// 7. ANNOUNCEMENT & NOTIFICATIONS (Module 1G: 9)
// ==========================================
export interface IDeliveryAnnouncement extends Document {
  announcementId: string;
  title: string;
  category: "incentive" | "safety" | "operational" | "weather" | "system";
  priority: "high" | "normal";
  badge?: string;
  content: string;
  readBy: string[]; // partnerIds
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
}

const DeliveryAnnouncementSchema = new Schema<IDeliveryAnnouncement>(
  {
    announcementId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["incentive", "safety", "operational", "weather", "system"],
      default: "incentive",
    },
    priority: { type: String, enum: ["high", "normal"], default: "normal" },
    badge: { type: String },
    content: { type: String, required: true },
    readBy: [{ type: String }],
    effectiveFrom: { type: Date, default: Date.now },
    effectiveTo: { type: Date },
  },
  { timestamps: true, collection: "delivery_announcements" }
);

export const DeliveryAnnouncementModel =
  (mongoose.models.DeliveryAnnouncement as mongoose.Model<IDeliveryAnnouncement>) ||
  mongoose.model<IDeliveryAnnouncement>("DeliveryAnnouncement", DeliveryAnnouncementSchema);
