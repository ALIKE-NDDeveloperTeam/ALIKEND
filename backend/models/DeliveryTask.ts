import mongoose, { Schema, Document } from "mongoose";

export type DeliveryServiceType =
  | "quick_delivery"
  | "normal_delivery"
  | "food_delivery"
  | "nearby_store"
  | "wholesale";

export type DeliveryTaskStatus =
  | "order_placed"
  | "store_accepted"
  | "preparing"
  | "ready_for_pickup"
  | "partner_assigned"
  | "arrived_at_store"
  | "picked_up"
  | "out_for_delivery"
  | "arrived_at_customer"
  | "delivered"
  | "order_cancelled"
  | "pickup_failed"
  | "customer_unavailable"
  | "delivery_failed"
  | "return_initiated"
  | "returned_to_store"
  // Legacy aliases
  | "store_packing"
  | "pickup_pending"
  | "arriving_soon"
  | "cancelled";

export interface IDeliveryTask extends Document {
  taskId: string;
  orderNumber?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: DeliveryServiceType;
  store: {
    storeId?: string;
    name: string;
    address: string;
    phone?: string;
    category?: string;
  };
  deliveryAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    landmark?: string;
  };
  itemsSummary: string;
  itemCount: number;
  totalAmount: number;
  deliveryFee: number;
  estimatedMinutes: number;
  status: DeliveryTaskStatus;
  pickupCode: string; // Unique store pickup verification code
  pickupVerified: boolean;
  pickupVerifiedAt?: Date;
  pickupAttempts?: number;
  deliveryOtp: string; // 4-digit customer delivery OTP
  deliveryOtpVerified: boolean;
  deliveryVerifiedAt?: Date;
  deliveryOtpAttempts?: number;
  failureReason?: string;
  deliveryPartner?: {
    partnerId: string;
    name: string;
    phone: string;
    avatar?: string;
    vehicleType: string;
    vehicleNumber?: string;
    rating: number;
    completedDeliveries: number;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
  pickupNotes?: string;
  pickupPhoto?: string;
  deliveryNotes?: string;
  deliveryPhotoProof?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  packageDetails?: {
    weightKg?: number;
    packageType?: string;
    requiresVan?: boolean;
    dimensions?: string;
  };
  reassignmentCount?: number;
  rejectionHistory?: Array<{
    partnerId: string;
    rejectedAt: Date;
    reason: string;
  }>;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "cash_on_delivery";
  timeline: Array<{
    status: DeliveryTaskStatus;
    timestamp: Date;
    description: string;
  }>;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryTaskSchema = new Schema<IDeliveryTask>(
  {
    taskId: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, index: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    serviceType: {
      type: String,
      required: true,
      enum: ["quick_delivery", "normal_delivery", "food_delivery", "nearby_store", "wholesale"],
      default: "quick_delivery",
      index: true,
    },
    store: {
      storeId: String,
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: String,
      category: String,
    },
    deliveryAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      landmark: String,
    },
    itemsSummary: { type: String, required: true },
    itemCount: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0 },
    estimatedMinutes: { type: Number, default: 20 },
    status: {
      type: String,
      required: true,
      enum: [
        "order_placed",
        "store_accepted",
        "preparing",
        "ready_for_pickup",
        "partner_assigned",
        "arrived_at_store",
        "picked_up",
        "out_for_delivery",
        "arrived_at_customer",
        "delivered",
        "order_cancelled",
        "pickup_failed",
        "customer_unavailable",
        "delivery_failed",
        "return_initiated",
        "returned_to_store",
        "store_packing",
        "pickup_pending",
        "arriving_soon",
        "cancelled",
      ],
      default: "order_placed",
      index: true,
    },
    pickupCode: { type: String, required: true },
    pickupVerified: { type: Boolean, default: false },
    pickupVerifiedAt: Date,
    pickupAttempts: { type: Number, default: 0 },
    deliveryOtp: { type: String, required: true },
    deliveryOtpVerified: { type: Boolean, default: false },
    deliveryVerifiedAt: Date,
    deliveryOtpAttempts: { type: Number, default: 0 },
    failureReason: String,
    deliveryPartner: {
      partnerId: String,
      name: String,
      phone: String,
      avatar: String,
      vehicleType: { type: String, default: "Motorcycle" },
      vehicleNumber: String,
      rating: { type: Number, default: 4.9 },
      completedDeliveries: { type: Number, default: 450 },
      currentLocation: {
        lat: Number,
        lng: Number,
      },
    },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    pickupNotes: String,
    pickupPhoto: String,
    deliveryNotes: String,
    deliveryPhotoProof: String,
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, default: 0 },
        sku: String,
      },
    ],
    packageDetails: {
      weightKg: { type: Number, default: 1.5 },
      packageType: { type: String, default: "Bag" },
      requiresVan: { type: Boolean, default: false },
      dimensions: String,
    },
    reassignmentCount: { type: Number, default: 0 },
    rejectionHistory: [
      {
        partnerId: String,
        rejectedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash_on_delivery"],
      default: "pending",
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, required: true },
      },
    ],
    instructions: String,
  },
  {
    timestamps: true,
    collection: "delivery_tasks",
  }
);

DeliveryTaskSchema.index({ customerPhone: 1, createdAt: -1 });

export const DeliveryTaskModel: mongoose.Model<IDeliveryTask> =
  (mongoose.models.DeliveryTask as mongoose.Model<IDeliveryTask>) ||
  mongoose.model<IDeliveryTask>("DeliveryTask", DeliveryTaskSchema);

export default DeliveryTaskModel;
