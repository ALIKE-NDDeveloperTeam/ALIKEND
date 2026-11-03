import mongoose, { Schema, Document } from "mongoose";

export type SellerStatus = "pending" | "approved" | "rejected" | "suspended" | "review";
<<<<<<< HEAD
export type SellerStoreStatus = "active" | "temporarily_disabled" | "closed";
export type SellerVerificationStatus =
  | "not_submitted"
  | "pending_admin_review"
  | "under_review"
  | "resubmission_required"
  | "approved"
  | "rejected";

export interface SellerPermissions {
  canAddProducts: boolean;
  canEditProducts: boolean;
  canManageOrders: boolean;
  canWithdrawPayouts: boolean;
  canMakeNewSales?: boolean;
}

export interface SellerAdminNote {
  id: string;
  note: string;
  authorName: string;
  authorEmail: string;
  createdAt: Date;
}

export interface SellerApplicationHistoryEntry {
  id: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
  actedBy: string;
  actedByEmail: string;
  createdAt: Date;
}

export interface SellerVerificationHistoryEntry {
  id: string;
  action: string;
  previousStatus: SellerVerificationStatus;
  newStatus: SellerVerificationStatus;
  reason?: string;
  reviewerAdminId?: string;
  reviewerAdminName?: string;
  reviewerAdminEmail?: string;
  createdAt: Date;
}

export interface SellerNotificationEntry {
  id: string;
  type: "verification" | "account" | "order" | "payout" | "system";
  title: string;
  message: string;
  status?: string;
  read?: boolean;
  createdAt: Date;
}

export interface SellerCoupon {
  id: string;
  code: string;
  title: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface SellerCampaignNomination {
  id: string;
  campaignName: string;
  campaignType: "campaign" | "flash_deal" | "featured_product";
  productId: string;
  productName: string;
  proposedPrice: number;
  mrp: number;
  status: "pending_admin_approval" | "approved" | "rejected";
  adminNote?: string;
  createdAt: Date;
}

export interface SellerStoreDecoration {
  heroHeadline?: string;
  heroSubtext?: string;
  highlightColor?: string;
  layoutStyle?: "editorial" | "grid" | "boutique";
  showVerifiedBanner?: boolean;
}

export interface SellerNotificationPreferences {
  orderAlerts: boolean;
  payoutAlerts: boolean;
  verificationAlerts: boolean;
  lowStockAlerts: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

export interface SellerIdentityVerification {
  status: SellerVerificationStatus;
  verifiedBadge: boolean;
  nidNumber?: string;
  nidFullName?: string;
  nidDateOfBirth?: string;
  nidAddress?: string;
  nidFrontImage?: string;
  nidBackImage?: string;
  facePhotoImage?: string;
  consentGiven?: boolean;
  consentTimestamp?: Date;
  consentPolicyVersion?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedByAdminId?: string;
  reviewedByAdminName?: string;
  reviewedByAdminEmail?: string;
  decisionReason?: string;
  retentionExpiresAt?: Date;
  history?: SellerVerificationHistoryEntry[];
}

export interface SellerBundleOffer {
  id: string;
  title: string;
  minQty: number;
  discountPercent: number;
  isActive: boolean;
  createdAt: Date;
}

export interface SellerWarehouseNode {
  id: string;
  warehouseCode?: string;
  name: string;
  contactPerson?: string;
  countryCode?: string;
  phone?: string;
  contactPhone: string;
  email?: string;
  countryRegion?: string;
  city: string;
  address: string;
  addressLine?: string;
  pincode: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  mapPinLabel?: string;
  isPrimary: boolean;
  isDefaultPickup?: boolean;
  isReturnAddress?: boolean;
  holidayMode?: boolean;
  holidayStartDate?: string;
  holidayEndDate?: string;
  holidayDateStatus?: string;
}

export interface SellerStaffMember {
  id: string;
  name: string;
  email: string;
  role: "Store Manager" | "Catalog Editor" | "Order Fulfillment" | "Finance Viewer";
  status: "active" | "invited" | "revoked";
  invitedAt: Date;
}

export interface SellerReviewReply {
  id: string;
  productId: string;
  productName?: string;
  reviewerName: string;
  replyText: string;
  createdAt: Date;
}
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

export interface ISeller extends Document {
  shopName: string;
  storefront: string;
  ownerName: string;
  ownerEmail: string;
  email: string;
  mobileNumber: string;
  businessAddress: string;
<<<<<<< HEAD
  shopAddress?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  isOpen?: boolean;
  storeStatus?: SellerStoreStatus;
  storePolicy?: string;
  quickDeliveryEnabled?: boolean;
  prepTimeMin?: number;
  deliveryRadiusKm?: number;
  category?: string;
  logo?: string;
  bannerUrl?: string;
  tagline?: string;
  storeDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  freeShippingThreshold?: number;
  fulfillmentMode?: "seller_managed" | "marketplace_fulfilled";
  affiliateEnabled?: boolean;
  affiliateCommissionRate?: number;
  storeDecoration?: SellerStoreDecoration;
  shippingPolicy?: string;
  returnPolicyText?: string;
  coupons?: SellerCoupon[];
  bundleOffers?: SellerBundleOffer[];
  campaignNominations?: SellerCampaignNomination[];
  warehouses?: SellerWarehouseNode[];
  staffMembers?: SellerStaffMember[];
  reviewReplies?: SellerReviewReply[];
  closureRequest?: {
    requested: boolean;
    reason?: string;
    requestedAt?: Date;
    status?: "pending_admin_review" | "approved" | "rejected";
  };
  notificationPreferences?: SellerNotificationPreferences;
  rating?: number;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  panNumber: string;
  gstin?: string;
  bankAccountHolderName: string;
  bankAccountNumber: string;
  bankIFSC: string;
  bankName: string;
  kycVerified: boolean;
<<<<<<< HEAD
  emailVerified: boolean;
  agreedToTerms: boolean;
  agreedToTermsAt?: Date;
  verificationStatus?: SellerVerificationStatus;
  verifiedBadge?: boolean;
  identityVerification?: SellerIdentityVerification;
  notifications?: SellerNotificationEntry[];
  permissions?: SellerPermissions;
  rejectionReason?: string;
  infoRequestMessage?: string;
  tokenVersion?: number;
  lastLoginAt?: Date;
  lastPasswordResetAt?: Date;
  adminNotes?: SellerAdminNote[];
  applicationHistory?: SellerApplicationHistoryEntry[];
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  password?: string;
  listingsCount: number;
  status: SellerStatus;
  walletBalance: number;
  totalEarnings: number;
  pendingWithdrawals: number;
<<<<<<< HEAD
  settingsHub?: Record<string, any>;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  createdAt: Date;
  updatedAt: Date;
}

<<<<<<< HEAD
const SellerAdminNoteSchema = new Schema<SellerAdminNote>(
  {
    id: { type: String, required: true },
    note: { type: String, required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SellerApplicationHistorySchema = new Schema<SellerApplicationHistoryEntry>(
  {
    id: { type: String, required: true },
    action: { type: String, required: true },
    previousStatus: { type: String },
    newStatus: { type: String },
    reason: { type: String },
    actedBy: { type: String, required: true },
    actedByEmail: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SellerVerificationHistorySchema = new Schema<SellerVerificationHistoryEntry>(
  {
    id: { type: String, required: true },
    action: { type: String, required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    reason: { type: String },
    reviewerAdminId: { type: String },
    reviewerAdminName: { type: String },
    reviewerAdminEmail: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SellerNotificationSchema = new Schema<SellerNotificationEntry>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ["verification", "account", "order", "payout", "system"],
      default: "system",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SellerIdentityVerificationSchema = new Schema<SellerIdentityVerification>(
  {
    status: {
      type: String,
      enum: [
        "not_submitted",
        "pending_admin_review",
        "under_review",
        "resubmission_required",
        "approved",
        "rejected",
      ],
      default: "not_submitted",
    },
    verifiedBadge: { type: Boolean, default: false },
    nidNumber: { type: String, trim: true },
    nidFullName: { type: String, trim: true },
    nidDateOfBirth: { type: String, trim: true },
    nidAddress: { type: String, trim: true },
    nidFrontImage: { type: String },
    nidBackImage: { type: String },
    facePhotoImage: { type: String },
    consentGiven: { type: Boolean, default: false },
    consentTimestamp: { type: Date },
    consentPolicyVersion: { type: String, default: "v1.0-2026" },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedByAdminId: { type: String },
    reviewedByAdminName: { type: String },
    reviewedByAdminEmail: { type: String },
    decisionReason: { type: String },
    retentionExpiresAt: { type: Date },
    history: { type: [SellerVerificationHistorySchema], default: [] },
  },
  { _id: false }
);

=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
const SellerSchema = new Schema<ISeller>(
  {
    shopName: { type: String, required: true, trim: true },
    storefront: { type: String, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerEmail: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true },
<<<<<<< HEAD
    businessAddress: { type: String, default: "", trim: true },
    shopAddress: { type: String, trim: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined,
      },
    },
    isOpen: { type: Boolean, default: true },
    storeStatus: {
      type: String,
      enum: ["active", "temporarily_disabled", "closed"],
      default: "active",
    },
    storePolicy: {
      type: String,
      default: "Standard 7-Day Return & Authenticity Guarantee under ALIKE-ND Merchant SLA.",
    },
    quickDeliveryEnabled: { type: Boolean, default: true },
    prepTimeMin: { type: Number, default: 8, min: 2, max: 60 },
    deliveryRadiusKm: { type: Number, default: 5, min: 1, max: 30 },
    category: { type: String, default: "Boutique & Retail" },
    logo: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    tagline: { type: String, default: "" },
    storeDescription: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    freeShippingThreshold: { type: Number, default: 2999 },
    fulfillmentMode: {
      type: String,
      enum: ["seller_managed", "marketplace_fulfilled"],
      default: "seller_managed",
    },
    affiliateEnabled: { type: Boolean, default: false },
    affiliateCommissionRate: { type: Number, default: 5, min: 0, max: 50 },
    storeDecoration: {
      heroHeadline: { type: String, default: "" },
      heroSubtext: { type: String, default: "" },
      highlightColor: { type: String, default: "#F5A623" },
      layoutStyle: { type: String, default: "editorial" },
      showVerifiedBanner: { type: Boolean, default: true },
    },
    shippingPolicy: {
      type: String,
      default: "Same-day dispatch on confirmed orders before 4:00 PM IST. Express 20-minute hyperlocal delivery available within configured radius.",
    },
    returnPolicyText: {
      type: String,
      default: "7-day return & replacement guarantee on unused items with original luxury packaging and tags intact.",
    },
    coupons: { type: [Schema.Types.Mixed], default: [] },
    bundleOffers: { type: [Schema.Types.Mixed], default: [] },
    campaignNominations: { type: [Schema.Types.Mixed], default: [] },
    warehouses: { type: [Schema.Types.Mixed], default: [] },
    staffMembers: { type: [Schema.Types.Mixed], default: [] },
    reviewReplies: { type: [Schema.Types.Mixed], default: [] },
    closureRequest: {
      requested: { type: Boolean, default: false },
      reason: { type: String, default: "" },
      requestedAt: { type: Date },
      status: { type: String, default: "pending_admin_review" },
    },
    notificationPreferences: {
      orderAlerts: { type: Boolean, default: true },
      payoutAlerts: { type: Boolean, default: true },
      verificationAlerts: { type: Boolean, default: true },
      lowStockAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true },
    },
    rating: { type: Number, default: 4.8 },
    panNumber: { type: String, default: "", uppercase: true, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    bankAccountHolderName: { type: String, default: "", trim: true },
    bankAccountNumber: { type: String, default: "", trim: true },
    bankIFSC: { type: String, default: "", uppercase: true, trim: true },
    bankName: { type: String, default: "", trim: true },
    kycVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    agreedToTerms: { type: Boolean, default: true },
    agreedToTermsAt: { type: Date },
    verificationStatus: {
      type: String,
      enum: [
        "not_submitted",
        "pending_admin_review",
        "under_review",
        "resubmission_required",
        "approved",
        "rejected",
      ],
      default: "not_submitted",
    },
    verifiedBadge: { type: Boolean, default: false },
    identityVerification: { type: SellerIdentityVerificationSchema, default: () => ({ status: "not_submitted", verifiedBadge: false, history: [] }) },
    notifications: { type: [SellerNotificationSchema], default: [] },
    permissions: {
      canAddProducts: { type: Boolean, default: true },
      canEditProducts: { type: Boolean, default: true },
      canManageOrders: { type: Boolean, default: true },
      canWithdrawPayouts: { type: Boolean, default: true },
      canMakeNewSales: { type: Boolean, default: true },
    },
    rejectionReason: { type: String, default: "" },
    infoRequestMessage: { type: String, default: "" },
    tokenVersion: { type: Number, default: 1 },
    lastLoginAt: { type: Date },
    lastPasswordResetAt: { type: Date },
    adminNotes: { type: [SellerAdminNoteSchema], default: [] },
    applicationHistory: { type: [SellerApplicationHistorySchema], default: [] },
=======
    businessAddress: { type: String, required: true, trim: true },
    panNumber: { type: String, required: true, uppercase: true, trim: true },
    gstin: { type: String, uppercase: true, trim: true },
    bankAccountHolderName: { type: String, required: true, trim: true },
    bankAccountNumber: { type: String, required: true, trim: true },
    bankIFSC: { type: String, required: true, uppercase: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    kycVerified: { type: Boolean, default: false },
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    password: { type: String, required: true },
    listingsCount: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    pendingWithdrawals: { type: Number, default: 0, min: 0 },
<<<<<<< HEAD
    settingsHub: { type: Schema.Types.Mixed, default: {} },
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended", "review"],
      default: "pending",
    },
  },
<<<<<<< HEAD
  { timestamps: true, collection: "sellers", strict: false }
);

// 2dsphere index for geospatial distance querying
SellerSchema.index({ location: "2dsphere" }, { sparse: true });
SellerSchema.index({ mobileNumber: 1 });

=======
  { timestamps: true, collection: "sellers" }
);

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
export default mongoose.model<ISeller>("Seller", SellerSchema);
