import mongoose, { Schema, Document } from "mongoose";

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_pickup"
  | "ready_for_shipment"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "rejected";

export interface ILivePoint {
  lat: number;
  lng: number;
  accuracy?: number;
  updatedAt: Date;
  sharing: boolean;
}

export interface ILiveTracking {
  customer?: ILivePoint;
  seller?: {
    lat: number;
    lng: number;
    updatedAt: Date;
    sharing: boolean;
  };
  expiresAt?: Date;
}
<<<<<<< HEAD
=======
=======
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

export interface IOrder extends Document {
  orderNumber: string;
  memberName: string;
  memberEmail?: string;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  userId?: string;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  courierName?: string;
  items?: { productId?: any; name: string; qty: number; price: number; image?: string; color?: string; size?: string; sellerId?: string }[];
<<<<<<< HEAD
=======
=======
  total: number;
  status: OrderStatus;
  items?: { productId?: any; name: string; qty: number; price: number; image?: string; color?: string; size?: string }[];
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  address?: {
    name?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  deliveryLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  deliveryType?: "quick" | "standard";
  deliveryEtaText?: string;
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  paymentMethod?: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  delivery?: number;
  trackingStep?: number;
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  liveTracking?: ILiveTracking;
  commissionRate?: number;
  commissionAmount?: number;
  eligibleCommissionAmount?: number;
  refundedCommissionAmount?: number;
  commissionReversed?: boolean;
  sellerPayout?: number;
  commissionStatus?:
    | "credited"
    | "pending"
    | "settled"
    | "reversed"
    | "refunded"
    | "partially_refunded";
  commissionBreakdown?: Array<{
    productId?: any;
    productName: string;
    category: string;
    subCategory?: string;
    sellerId?: string;
    sellerShopName?: string;
    qty: number;
    sellingPrice: number;
    grossItemAmount: number;
    discountShare: number;
    eligibleAmount: number;
    commissionRate: number;
    appliedRuleType: string;
    appliedRuleId: string;
    appliedRuleLabel: string;
    commissionAmount: number;
    sellerNetAmount: number;
  }>;
<<<<<<< HEAD
=======
=======
  commissionRate?: number;
  commissionAmount?: number;
  sellerPayout?: number;
  commissionStatus?: "credited" | "pending";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  approvedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  walletCredited?: boolean;
  manualOverride?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    memberName: { type: String, required: true },
    memberEmail: { type: String },
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    userId: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "ready_for_pickup",
        "ready_for_shipment",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "processing",
    },
    trackingNumber: { type: String },
    courierName: { type: String },
    items: [
      {
        productId: { type: Schema.Types.Mixed },
        sellerId: { type: String },
<<<<<<< HEAD
=======
=======
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },
    items: [
      {
        productId: { type: Schema.Types.Mixed },
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        name: String,
        qty: Number,
        price: Number,
        image: String,
        color: String,
        size: String,
      },
    ],
    address: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      zip: String,
    },
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    deliveryLocation: {
      lat: Number,
      lng: Number,
      address: String,
    },
    deliveryType: { type: String, enum: ["quick", "standard"], default: "standard" },
    deliveryEtaText: { type: String },
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    paymentMethod: { type: String, default: "CARD" },
    subtotal: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 },
    trackingStep: { type: Number, default: 2 },
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    liveTracking: {
      customer: {
        lat: Number,
        lng: Number,
        accuracy: Number,
        updatedAt: Date,
        sharing: { type: Boolean, default: false },
      },
      seller: {
        lat: Number,
        lng: Number,
        updatedAt: Date,
        sharing: { type: Boolean, default: false },
      },
      expiresAt: Date,
    },
    commissionRate: { type: Number, default: 5 },
    commissionAmount: { type: Number, default: 0 },
    eligibleCommissionAmount: { type: Number, default: 0 },
    refundedCommissionAmount: { type: Number, default: 0 },
    commissionReversed: { type: Boolean, default: false },
    sellerPayout: { type: Number, default: 0 },
    commissionStatus: {
      type: String,
      enum: [
        "credited",
        "pending",
        "settled",
        "reversed",
        "refunded",
        "partially_refunded",
      ],
      default: "credited",
    },
    commissionBreakdown: { type: [Schema.Types.Mixed], default: [] },
<<<<<<< HEAD
=======
=======
    commissionRate: { type: Number, default: 5 },
    commissionAmount: { type: Number, default: 0 },
    sellerPayout: { type: Number, default: 0 },
    commissionStatus: { type: String, enum: ["credited", "pending"], default: "credited" },
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    approvedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    walletCredited: { type: Boolean, default: false },
    manualOverride: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "orders" }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
