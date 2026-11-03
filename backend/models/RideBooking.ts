import mongoose, { Schema, Document } from "mongoose";

export type RideServiceType =
  | "bike"
  | "auto"
  | "cab"
  | "car_mini"
  | "car_sedan"
  | "car_suv"
  | "car_premium"
  | "car_xl"
  | "car_green";

export type RideStatus =
  | "requested"
  | "searching"
  | "driver_assigned"
  | "accepted"
  | "arriving"
  | "arrived"
  | "started"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_driver_found"
  | "driver_unavailable"
  | "passenger_no_show"
  | "payment_pending"
  | "payment_completed"
  | "support_required";

export interface IRideBooking extends Document {
  bookingId: string;
  invoiceNumber?: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: RideServiceType;
  pickup: {
    address: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    landmark?: string;
    lat: number;
    lng: number;
  };
  distanceKm: number;
  actualDistanceKm?: number;
  estimatedDurationMin: number;
  actualDurationMin?: number;
  waitingMinutes?: number;
  isScheduled?: boolean;
  scheduledFor?: Date;
  fare: {
    baseFare: number;
    distanceFare: number;
    timeFare?: number;
    waitingFare?: number;
    surgeMultiplier: number;
    tollCharges?: number;
    airportCharges?: number;
    discountAmount?: number;
    promoCode?: string;
    tax: number;
    totalFare: number;
    driverEarnings?: number;
    platformCommission?: number;
  };
  status: RideStatus;
  rideOtp: string; // 4-digit secure server generated code
  driver?: {
    driverId: string;
    name: string;
    phone: string;
    avatar?: string;
    vehicleType?: string;
    vehicleNumber: string;
    vehicleModel?: string;
    rating: number;
    totalRides: number;
    currentLocation?: {
      lat: number;
      lng: number;
    };
  };
  currentOfferDriverId?: string;
  offerExpiresAt?: Date;
  candidateDriverIds?: string[];
  candidateIndex?: number;
  paymentMethod: "cash" | "wallet" | "upi" | "card";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  upiReference?: string;
  paidAt?: Date;
  cancellationReason?: string;
  cancelledBy?: "customer" | "driver" | "system";
  passengerNoShowTime?: Date;
  rating?: number;
  feedback?: string;
  dispute?: {
    disputeId?: string;
    status: "none" | "submitted" | "under_review" | "resolved" | "rejected";
    reason: string;
    claimedRefund: number;
    actualRefund?: number;
    refundAmount?: number;
    notes?: string;
    resolutionNotes?: string;
    submittedAt?: Date;
    resolvedAt?: Date;
  };
  sosAlert?: {
    triggeredBy: "customer" | "driver";
    triggeredAt: Date;
    location?: { lat: number; lng: number };
    status: "active" | "investigating" | "resolved";
    notes?: string;
  };
  complaint?: {
    category: string;
    description: string;
    filedAt: Date;
    filedBy: "customer" | "driver";
    status: "open" | "resolved";
    resolutionNotes?: string;
  };
  lostItemReport?: {
    itemCategory: string;
    description: string;
    contactPhone: string;
    reportedAt: Date;
    status: "reported" | "found" | "closed";
    returnNotes?: string;
  };
  accidentReport?: {
    severity: "minor" | "moderate" | "critical";
    description: string;
    reportedBy: "customer" | "driver";
    reportedAt: Date;
    status: "open" | "resolved";
  };
  shareableTripToken?: string;
  routeDeviation?: {
    detected: boolean;
    deviationKm?: number;
    detectedAt?: Date;
  };
  startLocation?: { lat: number; lng: number };
  passengerRating?: {
    rating: number;
    tags?: string[];
    feedback?: string;
    ratedAt?: Date;
  };
  driverRating?: {
    rating: number;
    tags?: string[];
    feedback?: string;
    ratedAt?: Date;
  };
  supportTicket?: {
    id: string;
    issue: string;
    status: "open" | "resolved";
    createdAt: Date;
  };
  idempotencyKey?: string;
  acceptedAt?: Date;
  arrivedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RideBookingSchema = new Schema<IRideBooking>(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    invoiceNumber: { type: String, index: true },
    userId: { type: String, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    customerEmail: { type: String, lowercase: true, trim: true },
    serviceType: {
      type: String,
      required: true,
      enum: [
        "bike",
        "auto",
        "cab",
        "car_mini",
        "car_sedan",
        "car_suv",
        "car_premium",
        "car_xl",
        "car_green",
      ],
      default: "auto",
    },
    pickup: {
      address: { type: String, required: true },
      landmark: { type: String },
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    destination: {
      address: { type: String, required: true },
      landmark: { type: String },
      lat: { type: Number, default: 28.5355 },
      lng: { type: Number, default: 77.391 },
    },
    distanceKm: { type: Number, required: true, min: 0.1 },
    actualDistanceKm: { type: Number },
    estimatedDurationMin: { type: Number, required: true, min: 1 },
    actualDurationMin: { type: Number },
    waitingMinutes: { type: Number, default: 0 },
    isScheduled: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    fare: {
      baseFare: { type: Number, required: true, min: 0 },
      distanceFare: { type: Number, required: true, min: 0 },
      timeFare: { type: Number, default: 0 },
      waitingFare: { type: Number, default: 0 },
      surgeMultiplier: { type: Number, default: 1 },
      tollCharges: { type: Number, default: 0 },
      airportCharges: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      promoCode: { type: String },
      tax: { type: Number, default: 0 },
      totalFare: { type: Number, required: true, min: 0 },
      driverEarnings: { type: Number, default: 0 },
      platformCommission: { type: Number, default: 0 },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "requested",
        "searching",
        "driver_assigned",
        "accepted",
        "arriving",
        "arrived",
        "started",
        "in_progress",
        "completed",
        "cancelled",
        "no_driver_found",
        "driver_unavailable",
        "passenger_no_show",
        "payment_pending",
        "payment_completed",
        "support_required",
      ],
      default: "requested",
      index: true,
    },
    rideOtp: { type: String, required: true },
    driver: {
      driverId: String,
      name: String,
      phone: String,
      avatar: String,
      vehicleType: String,
      vehicleNumber: String,
      vehicleModel: String,
      rating: { type: Number, default: 4.8 },
      totalRides: { type: Number, default: 120 },
      currentLocation: {
        lat: Number,
        lng: Number,
      },
    },
    currentOfferDriverId: { type: String, index: true },
    offerExpiresAt: { type: Date },
    candidateDriverIds: [{ type: String }],
    candidateIndex: { type: Number, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "wallet", "upi", "card"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    upiReference: { type: String },
    paidAt: { type: Date },
    cancellationReason: { type: String },
    cancelledBy: { type: String, enum: ["customer", "driver", "system"] },
    passengerNoShowTime: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    dispute: {
      disputeId: { type: String },
      status: {
        type: String,
        enum: ["none", "submitted", "under_review", "resolved", "rejected"],
        default: "none",
      },
      reason: { type: String },
      claimedRefund: { type: Number, default: 0 },
      actualRefund: { type: Number, default: 0 },
      refundAmount: { type: Number, default: 0 },
      notes: { type: String },
      resolutionNotes: { type: String },
      submittedAt: { type: Date },
      resolvedAt: { type: Date },
    },
    sosAlert: {
      triggeredBy: { type: String, enum: ["customer", "driver"] },
      triggeredAt: { type: Date },
      location: {
        lat: { type: Number },
        lng: { type: Number },
      },
      status: { type: String, enum: ["active", "investigating", "resolved"], default: "active" },
      notes: { type: String },
    },
    complaint: {
      category: { type: String },
      description: { type: String },
      filedAt: { type: Date },
      filedBy: { type: String, enum: ["customer", "driver"] },
      status: { type: String, enum: ["open", "resolved"], default: "open" },
      resolutionNotes: { type: String },
    },
    lostItemReport: {
      itemCategory: { type: String },
      description: { type: String },
      contactPhone: { type: String },
      reportedAt: { type: Date },
      status: { type: String, enum: ["reported", "found", "closed"], default: "reported" },
      returnNotes: { type: String },
    },
    accidentReport: {
      severity: { type: String, enum: ["minor", "moderate", "critical"] },
      description: { type: String },
      reportedBy: { type: String, enum: ["customer", "driver"] },
      reportedAt: { type: Date },
      status: { type: String, enum: ["open", "resolved"], default: "open" },
    },
    shareableTripToken: { type: String, index: true },
    routeDeviation: {
      detected: { type: Boolean, default: false },
      deviationKm: { type: Number },
      detectedAt: { type: Date },
    },
    startLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    passengerRating: {
      rating: { type: Number, min: 1, max: 5 },
      tags: [{ type: String }],
      feedback: { type: String },
      ratedAt: { type: Date },
    },
    driverRating: {
      rating: { type: Number, min: 1, max: 5 },
      tags: [{ type: String }],
      feedback: { type: String },
      ratedAt: { type: Date },
    },
    supportTicket: {
      id: { type: String },
      issue: { type: String },
      status: { type: String, enum: ["open", "resolved"], default: "open" },
      createdAt: { type: Date },
    },
    idempotencyKey: { type: String, index: true },
    acceptedAt: { type: Date },
    arrivedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: "ride_bookings",
  }
);

// Indexes for query performance
RideBookingSchema.index({ customerPhone: 1, createdAt: -1 });
RideBookingSchema.index({ status: 1, createdAt: -1 });

export const RideBookingModel: mongoose.Model<IRideBooking> =
  (mongoose.models.RideBooking as mongoose.Model<IRideBooking>) ||
  mongoose.model<IRideBooking>("RideBooking", RideBookingSchema);

export default RideBookingModel;
