import express, { Response } from "express";
import crypto from "crypto";
import { requireAdmin, AuthedRequest, resolveAdminRole, isSuperAdminRole } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import Order from "../models/Order";
import RideBooking from "../models/RideBooking";
import Driver from "../models/Driver";
import Seller from "../models/Seller";
import User from "../models/User";
import PlatformSetting from "../models/PlatformSetting";
import SellerWithdrawal from "../models/SellerWithdrawal";
import ActivityLog from "../models/ActivityLog";
import { platformApprovalRequiredFields, setPlatformApprovalRequiredFields } from "./sellerPortal";
import {
  ensureBankDirectorySeeded,
  queryBankDirectory,
  getBankDirectorySummaryStats,
  addOrUpdateBankInstitution,
  bulkImportBankInstitutions,
} from "../data/globalBankDirectory";

const router = express.Router();

// System configuration defaults stored in-memory and synced
export interface ServiceAreaZone {
  id: string;
  name: string;
  code: string;
  coordinates: { lat: number; lng: number };
  radiusKm: number;
  deliveryActive: boolean;
  ridesActive: boolean;
  baseDeliveryFee: number;
  nightSurgeMultiplier: number;
  surgeActive: boolean;
}

export interface CentralSystemConfig {
  serviceAvailability: {
    deliveryGloballyEnabled: boolean;
    ridesGloballyEnabled: boolean;
    emergencyLockdown: boolean;
    lockdownReason?: string;
  };
  otpRules: {
    expirySeconds: number; // default 300
    maxAttempts: number; // default 3
    cooldownSeconds: number; // default 60
    lockoutDurationMinutes: number; // default 15
  };
  deliveryPricingRules: {
    baseFare: number;
    baseDistanceKm: number;
    perKmRate: number;
    minDeliveryPay: number;
    heavyPackageSurcharge: number; // For >5kg packages
    waitingTimeRatePerMin: number;
    peakHourMultiplier: number;
    maxBroadcastRadiusKm: number;
    autoAssignEnabled: boolean;
  };
  rideVehicleCategories: {
    type: string;
    label: string;
    seatingCapacity: number;
    baseFare: number;
    perKmRate: number;
    perMinRate: number;
    minFare: number;
    platformCommissionPercent: number;
    active: boolean;
  }[];
  emergencyContacts: {
    police: string;
    ambulance: string;
    womenHelpline: string;
    trafficControl: string;
    safetyDeskHotline: string;
    safetyEmail: string;
  };
  deliveryTimeSettings: {
    defaultPrepTimeMinutes: number;
    transitBufferMinutes: number;
    maxDeliveryWindowMinutes: number;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
<<<<<<< HEAD
  entityType: "order" | "ride" | "driver" | "delivery_partner" | "seller" | "customer" | "config" | "dispute" | "security";
=======
  entityType: "order" | "ride" | "driver" | "delivery_partner" | "seller" | "customer" | "config" | "dispute";
>>>>>>> 3f5a3a1673ff92fe6382280c2d42a734871e72c8
  entityId: string;
  details: string;
  ipAddress?: string;
}

// Initial central config
let centralConfig: CentralSystemConfig = {
  serviceAvailability: {
    deliveryGloballyEnabled: true,
    ridesGloballyEnabled: true,
    emergencyLockdown: false,
    lockdownReason: "",
  },
  otpRules: {
    expirySeconds: 300,
    maxAttempts: 3,
    cooldownSeconds: 60,
    lockoutDurationMinutes: 15,
  },
  deliveryPricingRules: {
    baseFare: 30,
    baseDistanceKm: 2,
    perKmRate: 12,
    minDeliveryPay: 35,
    heavyPackageSurcharge: 25,
    waitingTimeRatePerMin: 2,
    peakHourMultiplier: 1.25,
    maxBroadcastRadiusKm: 8,
    autoAssignEnabled: true,
  },
  rideVehicleCategories: [
    { type: "bike_taxi", label: "Bike Taxi (Quick Solo)", seatingCapacity: 1, baseFare: 25, perKmRate: 9, perMinRate: 1.0, minFare: 25, platformCommissionPercent: 10, active: true },
    { type: "auto_rickshaw", label: "Auto Rickshaw (Local 3-Wheeler)", seatingCapacity: 3, baseFare: 35, perKmRate: 13, perMinRate: 1.2, minFare: 35, platformCommissionPercent: 12, active: true },
    { type: "hatchback", label: "Hatchback (Affordable Compact)", seatingCapacity: 4, baseFare: 55, perKmRate: 16, perMinRate: 1.5, minFare: 60, platformCommissionPercent: 15, active: true },
    { type: "sedan", label: "Sedan (Comfort & AC)", seatingCapacity: 4, baseFare: 75, perKmRate: 19, perMinRate: 1.8, minFare: 80, platformCommissionPercent: 15, active: true },
    { type: "suv", label: "SUV (Spacious 6-Seater)", seatingCapacity: 6, baseFare: 110, perKmRate: 24, perMinRate: 2.2, minFare: 120, platformCommissionPercent: 18, active: true },
    { type: "premium", label: "Premium Luxury (Top Executive)", seatingCapacity: 4, baseFare: 160, perKmRate: 32, perMinRate: 3.0, minFare: 180, platformCommissionPercent: 20, active: true },
    { type: "family_van", label: "Family Van / Larger Capacity", seatingCapacity: 8, baseFare: 140, perKmRate: 28, perMinRate: 2.5, minFare: 150, platformCommissionPercent: 18, active: true },
  ],
  emergencyContacts: {
    police: "112 / 100",
    ambulance: "108 / 102",
    womenHelpline: "1091",
    trafficControl: "103",
    safetyDeskHotline: "+91 98000 12345",
    safetyEmail: "safety-response@alikend.com",
  },
  deliveryTimeSettings: {
    defaultPrepTimeMinutes: 20,
    transitBufferMinutes: 10,
    maxDeliveryWindowMinutes: 60,
  },
};

// Initial service areas
let serviceAreas: ServiceAreaZone[] = [
  { id: "zone_north", name: "North Sector & Diplomatic Enclave", code: "ZONE-N1", coordinates: { lat: 28.65, lng: 77.21 }, radiusKm: 12, deliveryActive: true, ridesActive: true, baseDeliveryFee: 35, nightSurgeMultiplier: 1.2, surgeActive: false },
  { id: "zone_central", name: "Central Commercial & Downtown", code: "ZONE-C1", coordinates: { lat: 28.6139, lng: 77.209 }, radiusKm: 8, deliveryActive: true, ridesActive: true, baseDeliveryFee: 30, nightSurgeMultiplier: 1.25, surgeActive: true },
  { id: "zone_south", name: "South Urban & Tech Corridor", code: "ZONE-S1", coordinates: { lat: 28.54, lng: 77.24 }, radiusKm: 15, deliveryActive: true, ridesActive: true, baseDeliveryFee: 40, nightSurgeMultiplier: 1.15, surgeActive: false },
  { id: "zone_west", name: "West Market & Industrial Area", code: "ZONE-W1", coordinates: { lat: 28.64, lng: 77.12 }, radiusKm: 10, deliveryActive: true, ridesActive: true, baseDeliveryFee: 35, nightSurgeMultiplier: 1.2, surgeActive: false },
  { id: "zone_east", name: "East Suburbs & Transit Junction", code: "ZONE-E1", coordinates: { lat: 28.62, lng: 77.29 }, radiusKm: 10, deliveryActive: true, ridesActive: true, baseDeliveryFee: 30, nightSurgeMultiplier: 1.1, surgeActive: false },
];

// Audit logs in-memory / persistent
let centralAuditLogs: AuditLogEntry[] = [
  {
    id: "audit_init_1",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    adminId: "admin_super_1",
    adminEmail: "developer.alikend@gmail.com",
    adminRole: "superadmin",
    action: "SYSTEM_INITIALIZE",
    entityType: "config",
    entityId: "central_rules_v1",
    details: "Central Admin Panel Module 3 Initialized with strict safety and dispatch protocols.",
  },
];

function recordAudit(
  req: AuthedRequest,
  action: string,
  entityType: AuditLogEntry["entityType"],
  entityId: string,
  details: string
) {
  const adminProfile = req.admin || (req as any).user || {};
  const entry: AuditLogEntry = {
    id: `audit_${Date.now()}_${crypto.randomInt(100, 999)}`,
    timestamp: new Date().toISOString(),
    adminId: adminProfile._id || (req as any).adminId || "admin_system",
    adminEmail: adminProfile.email || (req as any).adminEmail || "admin@alikend.com",
    adminRole: adminProfile.role || (req as any).adminRole || "admin",
    action,
    entityType,
    entityId,
    details,
    ipAddress: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1",
  };
  centralAuditLogs.unshift(entry);
  if (centralAuditLogs.length > 500) {
    centralAuditLogs.pop();
  }
}

// -------------------------------------------------------------
// 1. EXECUTIVE SUMMARY & SERVICE BREAKDOWN
// -------------------------------------------------------------
router.get("/summary", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    let totalDeliveryOrders = 0;
    let pendingDeliveryOrders = 0;
    let activeDispatchedOrders = 0;
    let completedDeliveryOrders = 0;
    let cancelledDeliveryOrders = 0;
    let totalDeliveryRevenue = 0;
    let deliveryCodCollected = 0;
    let deliveryOnlineCollected = 0;

    let totalRides = 0;
    let activeRides = 0;
    let completedRides = 0;
    let cancelledRides = 0;
    let totalRideRevenue = 0;
    let rideCashCollected = 0;
    let rideOnlineCollected = 0;
    let totalDriverEarnings = 0;
    let totalPlatformRideCommission = 0;

    let activeEmergencySosCount = 0;

    // Delivery stats
    if (isMongoConnected()) {
      try {
        const orders = await Order.find().lean();
        totalDeliveryOrders = orders.length;
        orders.forEach((o: any) => {
          const st = (o.status || "").toLowerCase();
          if (["pending", "processing", "preparing"].includes(st)) pendingDeliveryOrders++;
          if (["shipped", "out_for_delivery", "assigned"].includes(st)) activeDispatchedOrders++;
          if (st === "delivered") {
            completedDeliveryOrders++;
            totalDeliveryRevenue += o.total || 0;
            if (o.paymentMethod === "COD" || String(o.paymentMethod).toUpperCase().includes("CASH")) {
              deliveryCodCollected += o.total || 0;
            } else {
              deliveryOnlineCollected += o.total || 0;
            }
          }
          if (st === "cancelled") cancelledDeliveryOrders++;
        });
      } catch (e) {}
    } else {
      const orders = (memoryStore.orders as any[]) || [];
      totalDeliveryOrders = orders.length;
      orders.forEach((o: any) => {
        const st = (o.status || "").toLowerCase();
        if (["pending", "processing", "preparing"].includes(st)) pendingDeliveryOrders++;
        if (["shipped", "out_for_delivery", "assigned"].includes(st)) activeDispatchedOrders++;
        if (st === "delivered") {
          completedDeliveryOrders++;
          totalDeliveryRevenue += o.total || 0;
          if (o.paymentMethod === "COD" || String(o.paymentMethod).toUpperCase().includes("CASH")) {
            deliveryCodCollected += o.total || 0;
          } else {
            deliveryOnlineCollected += o.total || 0;
          }
        }
        if (st === "cancelled") cancelledDeliveryOrders++;
      });
    }

    // Ride stats
    if (isMongoConnected()) {
      try {
        const rides = await RideBooking.find().lean();
        totalRides = rides.length;
        rides.forEach((r: any) => {
          const st = (r.status || "").toLowerCase();
          if (["requested", "driver_assigned", "driver_accepted", "accepted", "driver_arriving", "arriving", "driver_arrived", "arrived", "in_progress", "started"].includes(st)) {
            activeRides++;
          }
          if (st === "completed") {
            completedRides++;
            const fare = r.finalFare || r.fare || 0;
            totalRideRevenue += fare;
            if (r.paymentMethod === "cash") {
              rideCashCollected += fare;
            } else {
              rideOnlineCollected += fare;
            }
            totalDriverEarnings += r.driverEarnings || (fare * 0.85);
            totalPlatformRideCommission += r.platformFee || (fare * 0.15);
          }
          if (st === "cancelled") cancelledRides++;
          if (r.emergencyTriggered) activeEmergencySosCount++;
        });
      } catch (e) {}
    } else {
      const rides = (memoryStore.rides as any[]) || [];
      totalRides = rides.length;
      rides.forEach((r: any) => {
        const st = (r.status || "").toLowerCase();
        if (["requested", "driver_assigned", "driver_accepted", "accepted", "driver_arriving", "arriving", "driver_arrived", "arrived", "in_progress", "started"].includes(st)) {
          activeRides++;
        }
        if (st === "completed") {
          completedRides++;
          const fare = r.finalFare || r.fare || 0;
          totalRideRevenue += fare;
          if (r.paymentMethod === "cash") {
            rideCashCollected += fare;
          } else {
            rideOnlineCollected += fare;
          }
          totalDriverEarnings += r.driverEarnings || (fare * 0.85);
          totalPlatformRideCommission += r.platformFee || (fare * 0.15);
        }
        if (st === "cancelled") cancelledRides++;
        if (r.emergencyTriggered) activeEmergencySosCount++;
      });
    }

    // Partner counts
    const deliveryPartners = memoryStore.deliveryPartners || [];
    const drivers = memoryStore.drivers || [];
    const sellers = memoryStore.sellers || [];
    const customers = memoryStore.customers || [];

    return res.json({
      success: true,
      data: {
        delivery: {
          totalOrders: totalDeliveryOrders,
          pending: pendingDeliveryOrders,
          activeDispatch: activeDispatchedOrders,
          completed: completedDeliveryOrders,
          cancelled: cancelledDeliveryOrders,
          revenue: totalDeliveryRevenue,
          codCollected: deliveryCodCollected,
          onlineCollected: deliveryOnlineCollected,
          activePartners: deliveryPartners.filter((p: any) => p.isOnline).length,
          totalPartners: deliveryPartners.length,
          pendingPartnerApprovals: deliveryPartners.filter((p: any) => p.status === "pending").length,
        },
        rides: {
          totalBookings: totalRides,
          activeRides,
          completedRides,
          cancelledRides,
          revenue: totalRideRevenue,
          cashCollected: rideCashCollected,
          onlineCollected: rideOnlineCollected,
          driverEarnings: totalDriverEarnings,
          platformCommission: totalPlatformRideCommission,
          onlineDrivers: drivers.filter((d: any) => d.isOnline).length,
          totalDrivers: drivers.length,
          pendingDriverApprovals: drivers.filter((d: any) => d.status === "pending").length,
          activeSosAlerts: activeEmergencySosCount,
        },
        merchants: {
          total: sellers.length,
          approved: sellers.filter((s: any) => s.status === "approved").length,
          pending: sellers.filter((s: any) => s.status === "pending").length,
        },
        customers: {
          total: customers.length,
        },
        serviceAvailability: centralConfig.serviceAvailability,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to load summary" });
  }
});

// -------------------------------------------------------------
// 2. UNIFIED LIVE DISPATCH (DELIVERIES + RIDES ON ONE SCREEN / MAP)
// -------------------------------------------------------------
router.get("/unified-dispatch", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    // 1. Delivery Tasks
    const deliveryTasks = (memoryStore.deliveryTasks || []).map((t: any) => ({
      ...t,
      entityType: "delivery",
    }));

    // 2. Active Rides
    let ridesList: any[] = [];
    if (isMongoConnected()) {
      try {
        ridesList = await RideBooking.find({
          status: { $in: ["requested", "driver_assigned", "driver_accepted", "accepted", "driver_arriving", "arriving", "driver_arrived", "arrived", "in_progress", "started"] as any },
        }).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    } else {
      ridesList = (memoryStore.rides as any[] || []).filter((r: any) =>
        ["requested", "driver_assigned", "driver_accepted", "accepted", "driver_arriving", "arriving", "driver_arrived", "arrived", "in_progress", "started"].includes(r.status)
      );
    }

    const formattedRides = ridesList.map((r: any) => ({
      _id: r._id,
      rideId: r.rideId || r._id,
      entityType: "ride",
      status: r.status,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      driverId: r.driverId,
      driverName: r.driverName,
      driverPhone: r.driverPhone,
      vehicleType: r.vehicleType,
      vehicleNumber: r.vehicleNumber,
      pickupAddress: r.pickupLocation?.address || "Pickup Point",
      pickupCoords: r.pickupLocation?.coordinates ? { lat: r.pickupLocation.coordinates[1], lng: r.pickupLocation.coordinates[0] } : { lat: 28.6139, lng: 77.209 },
      dropoffAddress: r.dropoffLocation?.address || "Dropoff Point",
      dropoffCoords: r.dropoffLocation?.coordinates ? { lat: r.dropoffLocation.coordinates[1], lng: r.dropoffLocation.coordinates[0] } : { lat: 28.63, lng: 77.22 },
      fare: r.finalFare || r.fare,
      paymentMethod: r.paymentMethod,
      emergencyTriggered: !!r.emergencyTriggered,
      createdAt: r.createdAt,
    }));

    // 3. Online Delivery Partners & Online Drivers for live map pins
    const onlinePartners = (memoryStore.deliveryPartners || [])
      .filter((p: any) => p.isOnline && p.status === "approved")
      .map((p: any) => ({
        id: p.partnerId || p._id,
        name: p.name,
        phone: p.phone,
        type: "delivery_partner",
        vehicleType: p.vehicleType,
        location: p.currentLocation || { lat: 28.6139 + (Math.random() - 0.5) * 0.05, lng: 77.209 + (Math.random() - 0.5) * 0.05 },
        activeOrdersCount: p.activeOrdersCount || 0,
      }));

    const onlineDrivers = (memoryStore.drivers || [])
      .filter((d: any) => d.isOnline && d.status === "approved")
      .map((d: any) => ({
        id: d._id,
        name: d.name,
        phone: d.phone,
        type: "ride_driver",
        vehicleType: d.vehicleType,
        vehicleNumber: d.vehicleNumber,
        location: d.currentLocation ? { lat: d.currentLocation.coordinates[1], lng: d.currentLocation.coordinates[0] } : { lat: 28.6139 + (Math.random() - 0.5) * 0.05, lng: 77.209 + (Math.random() - 0.5) * 0.05 },
        rating: d.rating || 5.0,
      }));

    return res.json({
      success: true,
      deliveries: deliveryTasks,
      rides: formattedRides,
      fleet: {
        deliveryPartners: onlinePartners,
        rideDrivers: onlineDrivers,
      },
      serviceAreas,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to load unified dispatch" });
  }
});

// -------------------------------------------------------------
// 3. STRICT WORKFLOW VALIDATION & STATUS OVERRIDE WITH AUDIT LOG
// -------------------------------------------------------------
const VALID_DELIVERY_TRANSITIONS: Record<string, string[]> = {
  order_placed: ["store_accepted", "cancelled"],
  store_accepted: ["preparing", "cancelled"],
  preparing: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["partner_assigned", "pickup_failed", "cancelled"],
  partner_assigned: ["pickup_otp_verified", "pickup_failed", "cancelled"],
  pickup_otp_verified: ["picked_up", "pickup_failed"],
  picked_up: ["out_for_delivery", "return_initiated"],
  out_for_delivery: ["delivery_otp_verified", "customer_unavailable", "delivery_failed", "return_initiated"],
  delivery_otp_verified: ["delivered"],
  delivered: [],
  customer_unavailable: ["return_initiated", "out_for_delivery"],
  delivery_failed: ["return_initiated"],
  return_initiated: ["returned_to_store"],
  returned_to_store: [],
  cancelled: [],
};

const VALID_RIDE_TRANSITIONS: Record<string, string[]> = {
  requested: ["driver_assigned", "driver_unavailable", "cancelled"],
  driver_assigned: ["driver_accepted", "accepted", "driver_unavailable", "cancelled"],
  driver_accepted: ["driver_arriving", "arriving", "cancelled"],
  accepted: ["driver_arriving", "arriving", "cancelled"],
  driver_arriving: ["driver_arrived", "arrived", "passenger_no_show", "cancelled"],
  arriving: ["driver_arrived", "arrived", "passenger_no_show", "cancelled"],
  driver_arrived: ["ride_otp_verified", "passenger_no_show", "cancelled"],
  arrived: ["ride_otp_verified", "passenger_no_show", "cancelled"],
  ride_otp_verified: ["in_progress", "started"],
  in_progress: ["completed", "support_required"],
  started: ["completed", "support_required"],
  completed: ["payment_pending", "payment_completed"],
  payment_pending: ["payment_completed", "support_required"],
  payment_completed: [],
  support_required: ["completed", "cancelled"],
  passenger_no_show: ["cancelled"],
  driver_unavailable: ["requested", "cancelled"],
  cancelled: [],
};

router.post("/workflow/override", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const { entityType, entityId, targetStatus, reason, bypassValidation } = req.body;

    if (!entityType || !entityId || !targetStatus || !reason) {
      return res.status(400).json({ success: false, error: "entityType, entityId, targetStatus and reason are required." });
    }

    const adminEmail = req.admin?.email || (req as any).user?.email || "admin@alikend.com";

    if (entityType === "delivery") {
      const taskIndex = (memoryStore.deliveryTasks || []).findIndex((t: any) => t.taskId === entityId || t.orderId === entityId);
      if (taskIndex === -1) {
        return res.status(404).json({ success: false, error: "Delivery task not found." });
      }
      const task = memoryStore.deliveryTasks[taskIndex];
      const currentStatus = (task.status || "order_placed").toLowerCase();

      const allowed = VALID_DELIVERY_TRANSITIONS[currentStatus] || [];
      if (!bypassValidation && !allowed.includes(targetStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Invalid delivery workflow transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: ${allowed.join(", ") || "none"}`,
        });
      }

      const prevStatus = task.status;
      task.status = targetStatus;
      task.updatedAt = new Date().toISOString();
      task.timeline = task.timeline || [];
      task.timeline.push({
        status: targetStatus,
        timestamp: new Date().toISOString(),
        note: `Administrative override by ${adminEmail}: ${reason}`,
      });

      const targetOrder = (memoryStore.orders || []).find((o: any) => o.orderNumber === task.orderId || o.id === task.orderId);
      if (targetOrder) {
        if (targetStatus === "delivered") targetOrder.status = "delivered";
        if (targetStatus === "cancelled") targetOrder.status = "cancelled";
      }
      if (isMongoConnected()) {
        try {
          await Order.updateOne(
            { orderNumber: task.orderId },
            { $set: { status: targetStatus === "delivered" ? "delivered" : targetStatus === "cancelled" ? "cancelled" : "processing" } }
          );
        } catch (e) {}
      }

      recordAudit(req, "OVERRIDE_DELIVERY_STATUS", "order", entityId, `Overrode status from '${prevStatus}' to '${targetStatus}'. Reason: ${reason}`);

      return res.json({
        success: true,
        message: `Delivery task ${entityId} status updated to '${targetStatus}'.`,
        task,
      });
    } else if (entityType === "ride") {
      let ride: any = null;
      if (isMongoConnected()) {
        ride = await RideBooking.findById(entityId);
      }
      if (!ride) {
        ride = (memoryStore.rides || []).find((r: any) => r._id === entityId || r.rideId === entityId);
      }
      if (!ride) {
        return res.status(404).json({ success: false, error: "Ride booking not found." });
      }

      const currentStatus = (ride.status || "requested").toLowerCase();
      const allowed = VALID_RIDE_TRANSITIONS[currentStatus] || [];
      if (!bypassValidation && !allowed.includes(targetStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: `Invalid ride workflow transition from '${currentStatus}' to '${targetStatus}'. Allowed next states: ${allowed.join(", ") || "none"}`,
        });
      }

      const prevStatus = ride.status;
      ride.status = targetStatus;
      ride.updatedAt = new Date();

      if (targetStatus === "completed" && !ride.completedAt) {
        ride.completedAt = new Date();
      }
      if (targetStatus === "cancelled" && !ride.cancelledAt) {
        ride.cancelledAt = new Date();
        ride.cancellationReason = `Admin override: ${reason}`;
      }

      if (isMongoConnected() && ride.save) {
        await ride.save();
      }

      recordAudit(req, "OVERRIDE_RIDE_STATUS", "ride", entityId, `Overrode status from '${prevStatus}' to '${targetStatus}'. Reason: ${reason}`);

      return res.json({
        success: true,
        message: `Ride ${entityId} status successfully transitioned to '${targetStatus}'.`,
        ride,
      });
    } else {
      return res.status(400).json({ success: false, error: "Invalid entityType. Must be 'delivery' or 'ride'." });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to execute workflow transition" });
  }
});

// -------------------------------------------------------------
// 4. CROSS-SERVICE CONSOLIDATED REPORTS (JSON & CSV DOWNLOAD)
// -------------------------------------------------------------
router.get("/reports/cross-service", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || "daily";
    const format = (req.query.format as string) || "json";

    const now = new Date();
    let daysToInclude = 7;
    if (period === "daily") daysToInclude = 1;
    if (period === "weekly") daysToInclude = 7;
    if (period === "monthly") daysToInclude = 30;

    const cutoffDate = new Date(now.getTime() - daysToInclude * 24 * 60 * 60 * 1000);

    // Collect orders
    let deliveryOrders: any[] = [];
    if (isMongoConnected()) {
      try {
        deliveryOrders = await Order.find({ createdAt: { $gte: cutoffDate } }).lean();
      } catch (e) {}
    } else {
      deliveryOrders = (memoryStore.orders as any[] || []).filter((o: any) => new Date(o.createdAt || Date.now()) >= cutoffDate);
    }

    // Collect rides
    let rideBookings: any[] = [];
    if (isMongoConnected()) {
      try {
        rideBookings = await RideBooking.find({ createdAt: { $gte: cutoffDate } }).lean();
      } catch (e) {}
    } else {
      rideBookings = (memoryStore.rides as any[] || []).filter((r: any) => new Date(r.createdAt || Date.now()) >= cutoffDate);
    }

    // Grouping and sums
    let deliveryGross = 0;
    let deliveryCod = 0;
    let deliveryOnline = 0;
    let deliveryPartnerPayouts = 0;
    let deliveryRefunds = 0;

    deliveryOrders.forEach((o: any) => {
      const amt = o.total || 0;
      if (o.status === "delivered") {
        deliveryGross += amt;
        const isCod = o.paymentMethod === "COD" || String(o.paymentMethod).toUpperCase().includes("CASH");
        if (isCod) deliveryCod += amt;
        else deliveryOnline += amt;
        deliveryPartnerPayouts += o.delivery || 40;
      }
      if (o.status === "cancelled" || o.status === "returned") {
        deliveryRefunds += amt;
      }
    });

    let rideGross = 0;
    let rideCash = 0;
    let rideOnline = 0;
    let rideDriverEarnings = 0;
    let ridePlatformCommission = 0;
    let rideRefunds = 0;

    rideBookings.forEach((r: any) => {
      const fare = r.finalFare || r.fare || 0;
      if (r.status === "completed") {
        rideGross += fare;
        if (r.paymentMethod === "cash") rideCash += fare;
        else rideOnline += fare;
        const driverAmt = r.driverEarnings || fare * 0.85;
        const feeAmt = r.platformFee || fare * 0.15;
        rideDriverEarnings += driverAmt;
        ridePlatformCommission += feeAmt;
      }
      if (r.status === "cancelled" && r.cancellationFeeCharged) {
        rideGross += r.cancellationFee || 25;
      }
    });

    const netPlatformRevenue = (deliveryGross * 0.10) + ridePlatformCommission;

    const reportData = {
      period,
      generatedAt: new Date().toISOString(),
      dateRange: {
        from: cutoffDate.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      },
      metrics: {
        totalCombinedRevenue: deliveryGross + rideGross,
        netPlatformCommission: netPlatformRevenue,
        totalRefunds: deliveryRefunds + rideRefunds,
      },
      deliveryBreakdown: {
        totalOrdersCount: deliveryOrders.length,
        completedCount: deliveryOrders.filter((o: any) => o.status === "delivered").length,
        cancelledCount: deliveryOrders.filter((o: any) => o.status === "cancelled").length,
        grossSales: deliveryGross,
        codCollected: deliveryCod,
        onlineCollected: deliveryOnline,
        partnerPayouts: deliveryPartnerPayouts,
        refunds: deliveryRefunds,
      },
      rideBreakdown: {
        totalBookingsCount: rideBookings.length,
        completedCount: rideBookings.filter((r: any) => r.status === "completed").length,
        cancelledCount: rideBookings.filter((r: any) => r.status === "cancelled").length,
        grossFares: rideGross,
        cashCollected: rideCash,
        onlineCollected: rideOnline,
        driverEarnings: rideDriverEarnings,
        platformCommission: ridePlatformCommission,
      },
    };

    if (format === "csv") {
      const csvLines = [
        `ALIKE ND CENTRAL EXECUTIVE CONSOLIDATED REPORT`,
        `Generated: ${reportData.generatedAt}`,
        `Period: ${period.toUpperCase()} (${reportData.dateRange.from} to ${reportData.dateRange.to})`,
        ``,
        `Service,Total Count,Completed,Cancelled,Gross Revenue (INR),Cash/COD (INR),Online (INR),Partner/Driver Payout (INR),Platform Net (INR)`,
        `Product & Food Delivery,${reportData.deliveryBreakdown.totalOrdersCount},${reportData.deliveryBreakdown.completedCount},${reportData.deliveryBreakdown.cancelledCount},${deliveryGross},${deliveryCod},${deliveryOnline},${deliveryPartnerPayouts},${(deliveryGross * 0.1).toFixed(2)}`,
        `Alike Rides (Cab/Auto/Bike),${reportData.rideBreakdown.totalBookingsCount},${reportData.rideBreakdown.completedCount},${reportData.rideBreakdown.cancelledCount},${rideGross},${rideCash},${rideOnline},${rideDriverEarnings},${ridePlatformCommission.toFixed(2)}`,
        `TOTAL / CONSOLIDATED,${deliveryOrders.length + rideBookings.length},${reportData.deliveryBreakdown.completedCount + reportData.rideBreakdown.completedCount},${reportData.deliveryBreakdown.cancelledCount + reportData.rideBreakdown.cancelledCount},${(deliveryGross + rideGross).toFixed(2)},${(deliveryCod + rideCash).toFixed(2)},${(deliveryOnline + rideOnline).toFixed(2)},${(deliveryPartnerPayouts + rideDriverEarnings).toFixed(2)},${netPlatformRevenue.toFixed(2)}`,
      ];
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="alike_nd_${period}_report_${Date.now()}.csv"`);
      return res.send(csvLines.join("\n"));
    }

    return res.json({
      success: true,
      report: reportData,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to generate cross-service report" });
  }
});

// -------------------------------------------------------------
// 5. SYSTEM CONFIGURATION & BUSINESS RULES (GET & UPDATE)
// -------------------------------------------------------------
router.get("/config", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  return res.json({
    success: true,
    config: centralConfig,
    serviceAreas,
  });
});

router.put("/config", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  try {
    const {
      serviceAvailability,
      otpRules,
      deliveryPricingRules,
      rideVehicleCategories,
      emergencyContacts,
      deliveryTimeSettings,
    } = req.body;

    if (serviceAvailability) {
      centralConfig.serviceAvailability = {
        ...centralConfig.serviceAvailability,
        ...serviceAvailability,
      };
    }

    if (otpRules) {
      centralConfig.otpRules = {
        ...centralConfig.otpRules,
        ...otpRules,
      };
    }

    if (deliveryPricingRules) {
      centralConfig.deliveryPricingRules = {
        ...centralConfig.deliveryPricingRules,
        ...deliveryPricingRules,
      };
    }

    if (rideVehicleCategories && Array.isArray(rideVehicleCategories)) {
      centralConfig.rideVehicleCategories = rideVehicleCategories;
    }

    if (emergencyContacts) {
      centralConfig.emergencyContacts = {
        ...centralConfig.emergencyContacts,
        ...emergencyContacts,
      };
    }

    if (deliveryTimeSettings) {
      centralConfig.deliveryTimeSettings = {
        ...centralConfig.deliveryTimeSettings,
        ...deliveryTimeSettings,
      };
    }

    recordAudit(req, "UPDATE_SYSTEM_CONFIG", "config", "central_rules", "Updated central business rules and configuration settings.");

    return res.json({
      success: true,
      message: "Central system configuration updated successfully.",
      config: centralConfig,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to update configuration" });
  }
});

// -------------------------------------------------------------
// 6. SERVICE AREAS MANAGEMENT (GET, ADD, UPDATE, TOGGLE)
// -------------------------------------------------------------
router.post("/service-areas", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  try {
    const { name, code, coordinates, radiusKm, deliveryActive, ridesActive, baseDeliveryFee, nightSurgeMultiplier } = req.body;

    if (!name || !code || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ success: false, error: "Name, code, and valid coordinates are required." });
    }

    const newZone: ServiceAreaZone = {
      id: `zone_${Date.now()}`,
      name,
      code: code.toUpperCase(),
      coordinates: { lat: Number(coordinates.lat), lng: Number(coordinates.lng) },
      radiusKm: Number(radiusKm) || 10,
      deliveryActive: deliveryActive !== false,
      ridesActive: ridesActive !== false,
      baseDeliveryFee: Number(baseDeliveryFee) || 30,
      nightSurgeMultiplier: Number(nightSurgeMultiplier) || 1.1,
      surgeActive: false,
    };

    serviceAreas.push(newZone);
    recordAudit(req, "CREATE_SERVICE_AREA", "config", newZone.id, `Created service area zone ${newZone.name} (${newZone.code})`);

    return res.json({
      success: true,
      message: `Service zone ${newZone.name} added.`,
      zone: newZone,
      serviceAreas,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to add service area" });
  }
});

router.put("/service-areas/:id", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const index = serviceAreas.findIndex((z) => z.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: "Service zone not found." });
    }

    serviceAreas[index] = {
      ...serviceAreas[index],
      ...req.body,
    };

    recordAudit(req, "UPDATE_SERVICE_AREA", "config", id, `Updated service area ${serviceAreas[index].name}`);

    return res.json({
      success: true,
      message: `Service zone ${serviceAreas[index].name} updated.`,
      zone: serviceAreas[index],
      serviceAreas,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to update service area" });
  }
});

router.delete("/service-areas/:id", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const zone = serviceAreas.find((z) => z.id === id);
    serviceAreas = serviceAreas.filter((z) => z.id !== id);

    recordAudit(req, "DELETE_SERVICE_AREA", "config", id, `Removed service area ${zone?.name || id}`);

    return res.json({
      success: true,
      message: "Service area zone deleted.",
      serviceAreas,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to delete service area" });
  }
});

// -------------------------------------------------------------
// 7. SYSTEM AUDIT LOGS (GET & FILTER)
// -------------------------------------------------------------
router.get("/audit-logs", requireAdmin as any, (req: AuthedRequest, res: Response) => {
  try {
    const { action, entityType, limit } = req.query;
    let filtered = [...centralAuditLogs];

    if (action) {
      filtered = filtered.filter((l) => l.action.toLowerCase().includes(String(action).toLowerCase()));
    }
    if (entityType) {
      filtered = filtered.filter((l) => l.entityType === entityType);
    }

    const max = Number(limit) || 100;
    return res.json({
      success: true,
      logs: filtered.slice(0, max),
      total: filtered.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to fetch audit logs" });
  }
});

// -------------------------------------------------------------
// 8. ADMIN MARKETPLACE SETTINGS HUB (GET & PUT /settings-hub)
// -------------------------------------------------------------
let cachedAdminSettingsHub: Record<string, any> | null = null;
const adminPendingContactOtps = new Map<
  string,
  { field: "email" | "mobileNumber"; targetValue: string; code: string; expiresAt: number }
>();

function flattenAdminSettingsHub(nestedHub: Record<string, any>) {
  const flat: Record<string, any> = {
    ...nestedHub,
    ...(nestedHub.business_info || {}),
    ...(nestedHub.finance || {}),
    ...(nestedHub.logistics || {}),
    ...(nestedHub.user_management || {}),
    ...(nestedHub.chat || {}),
    ...(nestedHub.system || {}),
    ...(nestedHub.other || {}),
  };
  return flat;
}

function getDefaultAdminSettingsHub(commissionRate = 5) {
  const nested = {
    business_info: {
      seller_profile: {
        sellerId: "ADM-HQ-0001",
        firstName: "ALIKE-ND",
        lastName: "Sovereign Administration",
        ownerName: "ALIKE-ND Sovereign Administration",
        displayName: "ALIKE-ND Flagship Marketplace",
        displayTitle: "Platform Marketplace Directorate",
        bio: "Centralized governance & multi-vendor operations command for ALIKE-ND Official Marketplace.",
        internalContactEmail: "developer.alikend@gmail.com",
        supportEmail: "developer.alikend@gmail.com",
        phoneNumber: "+91 98000 12345",
        alternateContactPhone: "+91 98000 12345",
        avatarUrl: "",
        shopLogo: "",
        holidayMode: false,
        holidayStartDate: "",
        holidayEndDate: "",
        holidayMessage: "Platform maintenance mode is currently inactive.",
        approvalStatus: "approved",
        updatedAt: new Date().toISOString(),
      },
      business_information: {
        sellerType: "Business",
        legalEntityName: "ALIKE-ND Sovereign Commerce Pvt. Ltd.",
        legalForm: "Private Limited Company",
        businessType: "Multi-Vendor Marketplace Operator",
        businessRegistrationNumber: "IND-MKT-2026-0001",
        tradeLicenseNumber: "IND-MKT-2026-0001",
        panNumber: "AAACA9988K",
        gstin: "07AAACA9988K1Z2",
        registeredAddress: "Sovereign Tower, Connaught Place, New Delhi 110001",
        city: "New Delhi",
        district: "Central Delhi",
        postalCode: "110001",
        countryRegion: "India",
        personInChargeName: "Noyon Dey (Director of Marketplace Operations)",
        contactEmail: "developer.alikend@gmail.com",
        contactPhone: "+91 98000 12345",
        identityDocType: "National ID (NID)",
        nationalIdNumber: "998877665544",
        maskedNationalIdNumber: "••••••••5544",
        nidFrontImageUrl: "",
        nidBackImageUrl: "",
        supportingDocUrl: "",
        supportingDocName: "Certificate of Incorporation",
        incorporationYear: "2020",
        verificationStatus: "approved",
        verifiedBadge: true,
        updatedAt: new Date().toISOString(),
      },
      store_information: {
        shopName: "ALIKE-ND Flagship Marketplace",
        tagline: "India's Premier Multi-Vendor Luxury & 20-Min Express Commerce Platform",
        category: "Multi-Category Marketplace",
        storeDescription:
          "Official platform-wide storefront and multi-vendor marketplace governance hub.",
        logo: "",
        bannerUrl: "",
        businessHours: "24/7 Marketplace Operations (Concierge 09:00 AM – 11:00 PM IST)",
        holidayMode: false,
        holidayStartDate: "",
        holidayEndDate: "",
        holidayMessage: "Platform maintenance mode is currently inactive.",
      },
      account_settings: {
        loginEmail: "developer.alikend@gmail.com",
        loginPhone: "+91 98000 12345",
        maskedPassword: "••••••••••••",
        twoFactorEnabled: true,
        storeStatus: "active",
        accountStatus: "approved",
        verificationStatus: "approved",
        verifiedBadge: true,
        autoAcceptOrders: true,
        vacationAutoPauseListings: false,
        closureReason: "Require manual Admin NID & Face verification before granting Verified Seller badge.",
        closureRequested: false,
        activeSessions: [
          {
            id: "adm_sess_current",
            device: "Admin Governance Console (Current Session)",
            ipAddress: "127.0.0.1",
            location: "Primary Operations Desk",
            lastActive: new Date().toISOString(),
            isCurrent: true,
          },
        ],
      },
    },
    finance: {
      bank_account: {
        bankAccountHolderName: "ALIKE-ND Marketplace Escrow Nodal A/C",
        bankName: "HDFC Bank Corporate Treasury",
        branchName: "New Delhi Corporate Hub",
        bankAccountNumber: "50200099887766",
        maskedAccountNumber: "•••• •••• 7766",
        bankIFSC: "HDFC0000001",
        accountType: "Nodal Escrow Current Account",
        upiId: "alikend.treasury@hdfcbank",
        payoutSchedule: "Daily & Weekly Automated Seller Settlements",
        kycVerified: true,
      },
      commission_settings: {
        assignedCommissionRate: commissionRate,
        tierName: "Global Marketplace Default Commission",
        paymentGatewayFeePercent: 1.75,
        shippingSubsidyEligible: true,
        affiliateParticipation: true,
        affiliateCommissionRate: 5,
      },
      tax_invoice_info: {
        defaultGstRate: 18,
        defaultHsnCode: "9983",
        gstinNumber: "07AAACA9988K1Z2",
        panNumber: "AAACA9988K",
        legalBillingName: "ALIKE-ND Sovereign Commerce Pvt. Ltd.",
        authorizedSignatory: "Chief Financial Officer, ALIKE-ND",
        enableAutoTaxInvoice: true,
        tcsDeductionRate: 1.0,
      },
    },
    logistics: {
      warehouse_pickup: {
        warehouses: [
          {
            id: "adm_wh_1",
            name: "ALIKE-ND Central Fulfillment Hub (North)",
            city: "New Delhi",
            address: "Sector 18 Logistics Park, New Delhi NCR",
            pincode: "110001",
            contactPhone: "+91 98000 12345",
            isPrimary: true,
          },
          {
            id: "adm_wh_2",
            name: "ALIKE-ND South Express Dark Store",
            city: "New Delhi",
            address: "Okhla Phase III Industrial Estate, New Delhi",
            pincode: "110020",
            contactPhone: "+91 98000 54321",
            isPrimary: false,
          },
        ],
        returnAddressSameAsPickup: true,
        returnAddress: "Sector 18 Logistics Park, New Delhi NCR 110001",
      },
      delivery_service: {
        quickDeliveryEnabled: centralConfig.serviceAvailability.deliveryGloballyEnabled,
        prepTimeMin: centralConfig.deliveryTimeSettings.defaultPrepTimeMinutes || 20,
        deliveryRadiusKm: centralConfig.deliveryPricingRules.maxBroadcastRadiusKm || 8,
        fulfillmentMode: "marketplace_fulfilled",
        sameDayCutoffHour: "18:00",
        sundayDispatchEnabled: true,
      },
      shipping_provider: {
        preferredCouriers: [
          { id: "alike_express", name: "ALIKE 20-Min Express Fleet", enabled: true, codSupported: true, sla: "15–20 Mins" },
          { id: "bluedart", name: "BlueDart Priority Air", enabled: true, codSupported: true, sla: "1–2 Days" },
          { id: "delhivery", name: "Delhivery Surface & Express", enabled: true, codSupported: true, sla: "2–4 Days" },
          { id: "ecom_express", name: "Ecom Express National", enabled: true, codSupported: true, sla: "3–5 Days" },
          { id: "dtdc", name: "DTDC Plus Priority", enabled: true, codSupported: true, sla: "2–4 Days" },
        ],
        autoAllocateFastestCourier: true,
      },
      shipping_charge_settings: {
        freeShippingThreshold: 2999,
        standardLocalFee: centralConfig.deliveryPricingRules.baseFare || 30,
        nationalShippingFee: 99,
        express20MinSurcharge: 35,
        heavyParcelSurchargePerKg: centralConfig.deliveryPricingRules.heavyPackageSurcharge || 25,
      },
      package_weight_dimensions: {
        defaultWeightKg: 0.5,
        defaultLengthCm: 22,
        defaultWidthCm: 16,
        defaultHeightCm: 10,
        volumetricDivisor: 5000,
        tamperProofPackagingMandatory: true,
      },
      invoice_number_settings: {
        invoicePrefix: "ALK-TAX-",
        financialYearFormat: "2026-27",
        nextSequenceNumber: 50001,
        autoIncrement: true,
        invoiceFooterNote:
          "Official Tax Invoice issued under Rule 46 of CGST Rules. Authorized by ALIKE-ND Marketplace.",
      },
    },
    user_management: {
      manage_users: {
        staffMembers: [
          {
            id: "adm_staff_1",
            name: "Noyon Dey (Super Admin)",
            email: "noyondey176@gmail.com",
            role: "Store Manager",
            status: "active",
            invitedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
          },
          {
            id: "adm_staff_2",
            name: "Platform Operations Lead",
            email: "developer.alikend@gmail.com",
            role: "Store Manager",
            status: "active",
            invitedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          },
          {
            id: "adm_staff_3",
            name: "QC & Seller Verification Desk",
            email: "admin234@gmail.com",
            role: "Catalog Editor",
            status: "active",
            invitedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          },
        ],
      },
      roles_permissions: {
        roleMatrix: [
          {
            role: "Store Manager",
            description: "Super Admin & Directorate: Full control over sellers, products, payouts, and system settings",
            canManageProducts: true,
            canManageOrders: true,
            canViewFinance: true,
            canWithdrawFunds: true,
            canManageSettings: true,
          },
          {
            role: "Catalog Editor",
            description: "Product Moderator & QC: Review seller product submissions, categories, and media",
            canManageProducts: true,
            canManageOrders: false,
            canViewFinance: false,
            canWithdrawFunds: false,
            canManageSettings: false,
          },
          {
            role: "Order Fulfillment",
            description: "Dispatch & Fleet Controller: Manage express orders, riders, and return disputes",
            canManageProducts: false,
            canManageOrders: true,
            canViewFinance: false,
            canWithdrawFunds: false,
            canManageSettings: false,
          },
          {
            role: "Finance Viewer",
            description: "Treasury & Settlement Auditor: Audit seller payouts, platform commissions, and GST ledgers",
            canManageProducts: false,
            canManageOrders: false,
            canViewFinance: true,
            canWithdrawFunds: true,
            canManageSettings: false,
          },
        ],
      },
      login_security: {
        twoFactorEnabled: true,
        loginAlertEmail: true,
        sessionTimeoutMinutes: 60,
        requirePasswordForBankEdit: true,
        lastLoginAt: new Date().toISOString(),
      },
      email_mobile: {
        email: "developer.alikend@gmail.com",
        mobileNumber: "+91 98000 12345",
        emailVerified: true,
        mobileVerified: true,
        secondaryNotificationEmail: "safety-response@alikend.com",
      },
    },
    chat: {
      quick_replies: {
        templates: [
          {
            id: "adm_qr_1",
            title: "Seller Verification Approved",
            shortcut: "/kyc-approved",
            message: "Your NID and Face Verification request has been manually reviewed and approved by the Admin Desk.",
            active: true,
          },
          {
            id: "adm_qr_2",
            title: "Product QC Guidelines",
            shortcut: "/qc-help",
            message: "Please ensure at least 3 high-resolution images and valid HSN/GST details are included for instant QC approval.",
            active: true,
          },
          {
            id: "adm_qr_3",
            title: "Payout Settlement Notice",
            shortcut: "/payout-info",
            message: "Your withdrawal request has been queued for NEFT/IMPS settlement to your verified bank account.",
            active: true,
          },
        ],
      },
      automated_replies: {
        welcomeAutoReplyEnabled: true,
        welcomeMessage:
          "Welcome to ALIKE-ND Central Support Desk. A specialist will review your ticket shortly.",
        afterHoursAutoReplyEnabled: true,
        afterHoursMessage:
          "Emergency safety & order dispatch lines are active 24/7. Standard seller verification tickets are reviewed 09:00 AM – 09:00 PM IST.",
        workingHoursStart: "09:00",
        workingHoursEnd: "21:00",
      },
      chat_notifications: {
        desktopSoundAlert: true,
        browserPushNotification: true,
        slaWarningMinutes: 10,
        emailEscalationOnMissedChat: true,
      },
      chat_keyword_tags: {
        tags: [
          { id: "adm_tag_1", label: "#SellerKYC", color: "blue", keywords: "nid, verification, kyc, badge" },
          { id: "adm_tag_2", label: "#PayoutSettlement", color: "emerald", keywords: "payout, bank, withdrawal, commission" },
          { id: "adm_tag_3", label: "#DisputeEscalation", color: "amber", keywords: "dispute, refund, fake, damaged" },
          { id: "adm_tag_4", label: "#IPInfringement", color: "purple", keywords: "copyright, trademark, counterfeit, brand" },
        ],
      },
      customer_support_integration: {
        enableDirectTicketCreation: true,
        whatsappConciergeNumber: "+91 98000 12345",
        supportEscalationEmail: "safety-response@alikend.com",
        targetResponseSlaMinutes: 10,
      },
    },
    system: {
      notification_preferences: {
        orderAlerts: true,
        payoutAlerts: true,
        verificationAlerts: true,
        lowStockAlerts: true,
        marketingEmails: true,
        securityAlerts: true,
      },
      email_sms_notifications: {
        emailNewOrder: true,
        smsUrgentDispatch: true,
        dailySummaryDigest: true,
        digestDeliveryTime: "21:00",
      },
      language_regional: {
        language: "en",
        secondaryScript: "bn",
        currency: "INR (₹)",
        timezone: "Asia/Kolkata (IST UTC+05:30)",
        dateFormat: "DD/MM/YYYY",
      },
      privacy_security: {
        maskCustomerPhoneAfterDelivery: true,
        exportAuditWatermark: true,
        dataRetentionConsent: true,
      },
    },
    other: {
      ip_complaints: {
        complaints: [
          {
            id: "IPC-ADM-901",
            type: "Counterfeit / Trademark Audit",
            targetProductOrUrl: "Seller #sel_2 — Luxury Watch Listing Audit",
            status: "Resolved",
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            resolutionNote: "Verified serial authenticity certificate with brand distributor.",
          },
        ],
      },
      product_store_policy: {
        storePolicy:
          "All marketplace sellers must maintain genuine inventory, transparent pricing, and manual NID/Face identity verification for Verified Badge eligibility.",
        shippingPolicy:
          "20-Minute Express Delivery orders must be packed within 8 minutes of confirmation. Standard orders must ship within 24 hours.",
        returnPolicyText:
          "Customers are protected by the 7-Day ALIKE-ND Buyer Protection & Return Policy.",
        counterfeitZeroToleranceAccepted: true,
      },
      contact_support: {
        recentRequests: [],
      },
    },
  };
  return flattenAdminSettingsHub(nested);
}

router.get("/settings-hub", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    let commissionRate = memoryStore.platformSettings?.commissionRate ?? 5;
    let savedHub: any = cachedAdminSettingsHub;

    if (isMongoConnected()) {
      try {
        const commDoc = await PlatformSetting.findOne({ key: "commission_settings" }).lean();
        if (commDoc && typeof commDoc.commissionRate === "number") {
          commissionRate = commDoc.commissionRate;
        }
        const hubDoc = await PlatformSetting.findOne({ key: "admin_settings_hub" }).lean();
        if (hubDoc?.data && typeof hubDoc.data === "object") {
          savedHub = hubDoc.data;
          cachedAdminSettingsHub = savedHub;
        }
      } catch {}
    }

    const baseHub = getDefaultAdminSettingsHub(commissionRate);
    const mergedNested = savedHub
      ? {
          business_info: {
            seller_profile: { ...baseHub.business_info.seller_profile, ...(savedHub.business_info?.seller_profile || savedHub.seller_profile || {}) },
            business_information: { ...baseHub.business_info.business_information, ...(savedHub.business_info?.business_information || savedHub.business_information || {}) },
            store_information: { ...baseHub.business_info.store_information, ...(savedHub.business_info?.store_information || savedHub.store_information || {}) },
            account_settings: { ...baseHub.business_info.account_settings, ...(savedHub.business_info?.account_settings || savedHub.account_settings || {}) },
          },
          finance: {
            ...baseHub.finance,
            ...(savedHub.finance || {}),
            bank_account: { ...baseHub.finance.bank_account, ...(savedHub.finance?.bank_account || savedHub.bank_account || {}) },
            commission_settings: {
              ...baseHub.finance.commission_settings,
              ...(savedHub.finance?.commission_settings || savedHub.commission_settings || {}),
              assignedCommissionRate: commissionRate,
            },
            tax_invoice_info: { ...baseHub.finance.tax_invoice_info, ...(savedHub.finance?.tax_invoice_info || savedHub.tax_invoice_info || {}) },
          },
          logistics: {
            ...baseHub.logistics,
            ...(savedHub.logistics || {}),
            warehouse_pickup: { ...baseHub.logistics.warehouse_pickup, ...(savedHub.logistics?.warehouse_pickup || savedHub.warehouse_pickup || {}) },
            delivery_service: { ...baseHub.logistics.delivery_service, ...(savedHub.logistics?.delivery_service || savedHub.delivery_service || {}) },
            shipping_provider: { ...baseHub.logistics.shipping_provider, ...(savedHub.logistics?.shipping_provider || savedHub.shipping_provider || {}) },
            shipping_charge_settings: { ...baseHub.logistics.shipping_charge_settings, ...(savedHub.logistics?.shipping_charge_settings || savedHub.shipping_charge_settings || {}) },
            package_weight_dimensions: { ...baseHub.logistics.package_weight_dimensions, ...(savedHub.logistics?.package_weight_dimensions || savedHub.package_weight_dimensions || {}) },
            invoice_number_settings: { ...baseHub.logistics.invoice_number_settings, ...(savedHub.logistics?.invoice_number_settings || savedHub.invoice_number_settings || {}) },
          },
          user_management: {
            ...baseHub.user_management,
            ...(savedHub.user_management || {}),
            manage_users: { ...baseHub.user_management.manage_users, ...(savedHub.user_management?.manage_users || savedHub.manage_users || {}) },
            roles_permissions: { ...baseHub.user_management.roles_permissions, ...(savedHub.user_management?.roles_permissions || savedHub.roles_permissions || {}) },
            login_security: { ...baseHub.user_management.login_security, ...(savedHub.user_management?.login_security || savedHub.login_security || {}) },
            email_mobile: { ...baseHub.user_management.email_mobile, ...(savedHub.user_management?.email_mobile || savedHub.email_mobile || {}) },
          },
          chat: {
            ...baseHub.chat,
            ...(savedHub.chat || {}),
            quick_replies: { ...baseHub.chat.quick_replies, ...(savedHub.chat?.quick_replies || savedHub.quick_replies || {}) },
            automated_replies: { ...baseHub.chat.automated_replies, ...(savedHub.chat?.automated_replies || savedHub.automated_replies || {}) },
            chat_notifications: { ...baseHub.chat.chat_notifications, ...(savedHub.chat?.chat_notifications || savedHub.chat_notifications || {}) },
            chat_keyword_tags: { ...baseHub.chat.chat_keyword_tags, ...(savedHub.chat?.chat_keyword_tags || savedHub.chat_keyword_tags || {}) },
            customer_support_integration: { ...baseHub.chat.customer_support_integration, ...(savedHub.chat?.customer_support_integration || savedHub.customer_support_integration || {}) },
          },
          system: {
            ...baseHub.system,
            ...(savedHub.system || {}),
            notification_preferences: { ...baseHub.system.notification_preferences, ...(savedHub.system?.notification_preferences || savedHub.notification_preferences || {}) },
            email_sms_notifications: { ...baseHub.system.email_sms_notifications, ...(savedHub.system?.email_sms_notifications || savedHub.email_sms_notifications || {}) },
            language_regional: { ...baseHub.system.language_regional, ...(savedHub.system?.language_regional || savedHub.language_regional || {}) },
            privacy_security: { ...baseHub.system.privacy_security, ...(savedHub.system?.privacy_security || savedHub.privacy_security || {}) },
          },
          other: {
            ...baseHub.other,
            ...(savedHub.other || {}),
            ip_complaints: { ...baseHub.other.ip_complaints, ...(savedHub.other?.ip_complaints || savedHub.ip_complaints || {}) },
            product_store_policy: { ...baseHub.other.product_store_policy, ...(savedHub.other?.product_store_policy || savedHub.product_store_policy || {}) },
            contact_support: { ...baseHub.other.contact_support, ...(savedHub.other?.contact_support || savedHub.contact_support || {}) },
          },
        }
      : baseHub;

    const mergedHub = flattenAdminSettingsHub(mergedNested);

    // Gather platform finance summary
    let withdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawals = await SellerWithdrawal.find().sort({ createdAt: -1 }).limit(30).lean();
      } catch {}
    }
    if (withdrawals.length === 0) {
      withdrawals = ((memoryStore as any).sellerWithdrawals || []).slice(0, 30);
    }

    let recentOrders: any[] = [];
    if (isMongoConnected()) {
      try {
        recentOrders = await Order.find().sort({ createdAt: -1 }).limit(25).lean();
      } catch {}
    }
    if (recentOrders.length === 0) {
      recentOrders = (memoryStore.orders || []).slice(0, 25);
    }

    const transactions = recentOrders.map((ord: any) => {
      const gross = Number(ord.total || 0);
      const fee = Number(ord.commissionAmount ?? Math.round((gross * commissionRate) / 100));
      const net = Math.max(0, gross - fee);
      return {
        id: ord.orderNumber || String(ord._id),
        type: "Platform Order Commission",
        grossAmount: gross,
        commissionFee: fee,
        netAmount: net,
        status: ord.status || "processing",
        date: ord.createdAt || new Date().toISOString(),
      };
    });

    let activityHistory: any[] = [];
    if (isMongoConnected()) {
      try {
        activityHistory = await ActivityLog.find().sort({ timestamp: -1 }).limit(30).lean();
      } catch {}
    }
    if (activityHistory.length === 0) {
      activityHistory = centralAuditLogs.slice(0, 30).map((a) => ({
        eventType: a.action,
        userName: a.adminRole,
        email: a.adminEmail,
        details: a.details,
        ipAddress: a.ipAddress || "127.0.0.1",
        timestamp: a.timestamp,
      }));
    }

    return res.json({
      success: true,
      role: "admin",
      settingsHub: mergedHub,
      financeSummary: {
        walletBalance: Number(memoryStore.platformSettings?.platformBalance || 148500),
        totalEarnings: Number(memoryStore.platformSettings?.totalCommissionEarned || 482900),
        pendingWithdrawals: withdrawals
          .filter((w: any) => w.status === "pending")
          .reduce((s: number, w: any) => s + Number(w.amount || 0), 0),
        commissionRate,
        withdrawals,
        transactions,
      },
      activityHistory,
      approvalRequiredFields: platformApprovalRequiredFields,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load admin settings hub" });
  }
});

// Admin Document Upload for Settings Hub
router.post("/settings-hub/upload-document", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const { dataUrl, fileName, mimeType, fileSize } = req.body || {};
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({ error: "Document file payload is required." });
    }
    const allowedMime = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    const detectedMime = String(mimeType || "").toLowerCase();
    if (detectedMime && !allowedMime.some((m) => detectedMime.includes(m.split("/")[1]))) {
      return res.status(400).json({ error: "Unsupported file format. Only JPG, PNG, WebP, and PDF are allowed." });
    }
    const maxBytes = 5 * 1024 * 1024;
    if (Number(fileSize || 0) > maxBytes || dataUrl.length > maxBytes * 1.45) {
      return res.status(400).json({ error: "File exceeds maximum allowed size of 5 MB." });
    }
    return res.json({
      success: true,
      fileUrl: dataUrl,
      fileName: String(fileName || "admin-document"),
      uploadedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to upload document" });
  }
});

// Admin OTP for Login Email / Phone modification
router.post("/settings-hub/send-contact-otp", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const adminId = String((req as any).admin?._id || (req as any).admin?.email || "admin");
    const field = req.body?.field === "mobileNumber" ? "mobileNumber" : "email";
    const targetValue = String(req.body?.targetValue || "").trim();
    if (!targetValue) {
      return res.status(400).json({ error: "Please enter a valid new email or phone number." });
    }
    const otpCode = String(crypto.randomInt(100000, 999999));
    adminPendingContactOtps.set(`${adminId}:${field}`, {
      field,
      targetValue,
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
    return res.json({
      success: true,
      message: `Verification OTP sent to ${targetValue}.`,
      demoOtpHint: otpCode,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send verification OTP" });
  }
});

router.post("/settings-hub/verify-contact-otp", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const adminId = String((req as any).admin?._id || (req as any).admin?.email || "admin");
    const field = req.body?.field === "mobileNumber" ? "mobileNumber" : "email";
    const otpCode = String(req.body?.otpCode || "").trim();
    const record = adminPendingContactOtps.get(`${adminId}:${field}`);
    if (!record || Date.now() > record.expiresAt) {
      return res.status(400).json({ error: "OTP expired or not found. Please request a new code." });
    }
    if (record.code !== otpCode) {
      return res.status(400).json({ error: "Invalid OTP code. Please check and try again." });
    }
    adminPendingContactOtps.delete(`${adminId}:${field}`);

    const commissionRate = memoryStore.platformSettings?.commissionRate ?? 5;
    const currentHub = cachedAdminSettingsHub || getDefaultAdminSettingsHub(commissionRate);
    if (field === "email") {
      currentHub.user_management.email_mobile.email = record.targetValue;
      currentHub.business_info.account_settings.loginEmail = record.targetValue;
    } else {
      currentHub.user_management.email_mobile.mobileNumber = record.targetValue;
      currentHub.business_info.account_settings.loginPhone = record.targetValue;
    }
    cachedAdminSettingsHub = flattenAdminSettingsHub(currentHub);
    recordAudit(req, "VERIFY_ADMIN_CONTACT_OTP", "security", field, `Updated admin ${field} via OTP verification`);

    return res.json({
      success: true,
      message: `${field === "email" ? "Login Email" : "Login Phone Number"} verified and updated.`,
      updatedValue: record.targetValue,
      settingsHub: cachedAdminSettingsHub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify OTP" });
  }
});

router.post("/settings-hub/revoke-other-sessions", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const commissionRate = memoryStore.platformSettings?.commissionRate ?? 5;
    const currentHub = cachedAdminSettingsHub || getDefaultAdminSettingsHub(commissionRate);
    const currentSession = [
      {
        id: `adm_sess_${Date.now()}`,
        device: "Admin Governance Console (Current Session)",
        ipAddress: String(req.ip || "127.0.0.1"),
        location: "Primary Operations Desk",
        lastActive: new Date().toISOString(),
        isCurrent: true,
      },
    ];
    currentHub.business_info.account_settings.activeSessions = currentSession;
    cachedAdminSettingsHub = flattenAdminSettingsHub(currentHub);
    recordAudit(req, "REVOKE_OTHER_ADMIN_SESSIONS", "security", "sessions", "Signed out of all other admin sessions");
    return res.json({
      success: true,
      message: "Signed out of all other active sessions.",
      activeSessions: currentSession,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to revoke sessions" });
  }
});

router.put("/settings-hub/:cardId", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const cardId = String(req.params.cardId || "").trim();
    const rawBody = req.body || {};
    const payload =
      rawBody && typeof rawBody.data === "object" && rawBody.data !== null && !Array.isArray(rawBody.data)
        ? rawBody.data
        : rawBody;

    let commissionRate = memoryStore.platformSettings?.commissionRate ?? 5;
    const currentHub = cachedAdminSettingsHub || getDefaultAdminSettingsHub(commissionRate);

    if (cardId === "seller_profile") {
      const safeProfile = { ...payload };
      delete safeProfile.sellerId; // Read-only ID
      currentHub.business_info.seller_profile = {
        ...currentHub.business_info.seller_profile,
        ...safeProfile,
        sellerId: currentHub.business_info.seller_profile.sellerId || "ADM-HQ-0001",
        updatedAt: new Date().toISOString(),
      };
    } else if (cardId === "business_information") {
      const rawNid = String(payload.nationalIdNumber || currentHub.business_info.business_information.nationalIdNumber || "").trim();
      currentHub.business_info.business_information = {
        ...currentHub.business_info.business_information,
        ...payload,
        nationalIdNumber: rawNid,
        maskedNationalIdNumber: rawNid.length >= 4 ? `••••••••${rawNid.slice(-4)}` : "••••••••",
        updatedAt: new Date().toISOString(),
      };
    } else if (cardId === "store_information") {
      currentHub.business_info.store_information = {
        ...currentHub.business_info.store_information,
        ...payload,
      };
    } else if (cardId === "account_settings") {
      currentHub.business_info.account_settings = {
        ...currentHub.business_info.account_settings,
        ...payload,
      };
    } else if (cardId === "bank_account") {
      const rawAcc = String(payload.bankAccountNumber || currentHub.finance.bank_account.bankAccountNumber || "").trim();
      currentHub.finance.bank_account = {
        ...currentHub.finance.bank_account,
        ...payload,
        bankAccountNumber: rawAcc,
        maskedAccountNumber: rawAcc.length >= 4 ? `•••• •••• ${rawAcc.slice(-4)}` : "••••",
      };
    } else if (cardId === "commission_settings") {
      const nextRate = Math.max(0, Math.min(50, Number(payload.assignedCommissionRate ?? commissionRate)));
      commissionRate = nextRate;
      currentHub.finance.commission_settings = {
        ...currentHub.finance.commission_settings,
        ...payload,
        assignedCommissionRate: nextRate,
      };
      if (memoryStore.platformSettings) {
        memoryStore.platformSettings.commissionRate = nextRate;
      }
      if (isMongoConnected()) {
        try {
          await PlatformSetting.findOneAndUpdate(
            { key: "commission_settings" },
            { $set: { commissionRate: nextRate } },
            { upsert: true }
          );
        } catch {}
      }
    } else if (cardId === "tax_invoice_info") {
      currentHub.finance.tax_invoice_info = {
        ...currentHub.finance.tax_invoice_info,
        ...payload,
      };
    } else if (cardId === "warehouse_pickup") {
      currentHub.logistics.warehouse_pickup = {
        ...currentHub.logistics.warehouse_pickup,
        ...payload,
      };
    } else if (cardId === "delivery_service") {
      currentHub.logistics.delivery_service = {
        ...currentHub.logistics.delivery_service,
        ...payload,
      };
      centralConfig.serviceAvailability.deliveryGloballyEnabled = Boolean(payload.quickDeliveryEnabled);
      centralConfig.deliveryTimeSettings.defaultPrepTimeMinutes = Number(payload.prepTimeMin ?? 20);
      centralConfig.deliveryPricingRules.maxBroadcastRadiusKm = Number(payload.deliveryRadiusKm ?? 8);
    } else if (cardId === "shipping_provider") {
      currentHub.logistics.shipping_provider = {
        ...currentHub.logistics.shipping_provider,
        ...payload,
      };
    } else if (cardId === "shipping_charge_settings") {
      currentHub.logistics.shipping_charge_settings = {
        ...currentHub.logistics.shipping_charge_settings,
        ...payload,
      };
      centralConfig.deliveryPricingRules.baseFare = Number(payload.standardLocalFee ?? 30);
    } else if (cardId === "package_weight_dimensions") {
      currentHub.logistics.package_weight_dimensions = {
        ...currentHub.logistics.package_weight_dimensions,
        ...payload,
      };
    } else if (cardId === "invoice_number_settings") {
      currentHub.logistics.invoice_number_settings = {
        ...currentHub.logistics.invoice_number_settings,
        ...payload,
      };
    } else if (cardId === "manage_users") {
      currentHub.user_management.manage_users = {
        ...currentHub.user_management.manage_users,
        ...payload,
      };
    } else if (cardId === "roles_permissions") {
      currentHub.user_management.roles_permissions = {
        ...currentHub.user_management.roles_permissions,
        ...payload,
      };
    } else if (cardId === "login_security") {
      currentHub.user_management.login_security = {
        ...currentHub.user_management.login_security,
        ...payload,
      };
    } else if (cardId === "email_mobile") {
      currentHub.user_management.email_mobile = {
        ...currentHub.user_management.email_mobile,
        ...payload,
      };
    } else if (cardId === "quick_replies") {
      currentHub.chat.quick_replies = {
        ...currentHub.chat.quick_replies,
        ...payload,
      };
    } else if (cardId === "automated_replies") {
      currentHub.chat.automated_replies = {
        ...currentHub.chat.automated_replies,
        ...payload,
      };
    } else if (cardId === "chat_notifications") {
      currentHub.chat.chat_notifications = {
        ...currentHub.chat.chat_notifications,
        ...payload,
      };
    } else if (cardId === "chat_keyword_tags") {
      currentHub.chat.chat_keyword_tags = {
        ...currentHub.chat.chat_keyword_tags,
        ...payload,
      };
    } else if (cardId === "customer_support_integration") {
      currentHub.chat.customer_support_integration = {
        ...currentHub.chat.customer_support_integration,
        ...payload,
      };
    } else if (cardId === "notification_preferences") {
      currentHub.system.notification_preferences = {
        ...currentHub.system.notification_preferences,
        ...payload,
      };
    } else if (cardId === "email_sms_notifications") {
      currentHub.system.email_sms_notifications = {
        ...currentHub.system.email_sms_notifications,
        ...payload,
      };
    } else if (cardId === "language_regional") {
      currentHub.system.language_regional = {
        ...currentHub.system.language_regional,
        ...payload,
      };
    } else if (cardId === "privacy_security") {
      currentHub.system.privacy_security = {
        ...currentHub.system.privacy_security,
        ...payload,
      };
    } else if (cardId === "ip_complaints") {
      currentHub.other.ip_complaints = {
        ...currentHub.other.ip_complaints,
        ...payload,
      };
    } else if (cardId === "product_store_policy") {
      currentHub.other.product_store_policy = {
        ...currentHub.other.product_store_policy,
        ...payload,
      };
    } else if (cardId === "contact_support") {
      currentHub.other.contact_support = {
        ...currentHub.other.contact_support,
        ...payload,
      };
    }

    const flattenedHub = flattenAdminSettingsHub(currentHub);
    cachedAdminSettingsHub = flattenedHub;

    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "admin_settings_hub" },
          {
            $set: {
              key: "admin_settings_hub",
              data: flattenedHub,
              updatedBy: (req as any).admin?.email || "admin@alikend.com",
            },
          },
          { upsert: true }
        );
      } catch (e) {
        console.warn("MongoDB save admin_settings_hub warning:", e);
      }
    }

    recordAudit(
      req,
      "UPDATE_PLATFORM_SETTINGS_HUB",
      "config",
      cardId,
      `Admin updated platform settings card [${cardId}]`
    );

    return res.json({
      success: true,
      message: "Platform settings updated and recorded in audit log.",
      settingsHub: flattenedHub,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update platform settings" });
  }
});

// -------------------------------------------------------------
// 9. ADMIN SELLER VERIFICATION & PROFILE CHANGE REVIEW DESK
// -------------------------------------------------------------
function canAdminViewSensitiveIdentityDocs(req: AuthedRequest): boolean {
  const admin = (req as any).admin || {};
  const role = resolveAdminRole(admin.role, admin.email);
  return (
    isSuperAdminRole(admin) ||
    role === "superadmin" ||
    role === "main_admin" ||
    role === "seller_admin" ||
    role === "admin"
  );
}

function getAllSellersUnified(): Promise<any[]> {
  return (async () => {
    const map = new Map<string, any>();
    const memSellers = ((memoryStore as any).sellers || []) as any[];
    for (const s of memSellers) {
      const id = String(s._id || s.sellerId || s.email);
      map.set(id, s);
    }
    if (isMongoConnected()) {
      try {
        const dbSellers = await Seller.find().sort({ updatedAt: -1 }).lean();
        for (const s of dbSellers) {
          const id = String(s._id);
          const memMatch = map.get(id);
          map.set(id, { ...(memMatch || {}), ...s });
        }
      } catch {}
    }
    return Array.from(map.values());
  })();
}

router.get("/seller-reviews", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const statusFilter = String(req.query.status || "all").trim().toLowerCase();
    const dateFrom = req.query.dateFrom ? new Date(String(req.query.dateFrom)).getTime() : 0;
    const dateTo = req.query.dateTo ? new Date(String(req.query.dateTo)).getTime() + 86400000 : 0;

    const canViewSensitiveDocs = canAdminViewSensitiveIdentityDocs(req);
    const allSellers = await getAllSellersUnified();

    const formatted = allSellers
      .map((s: any) => {
        const rawId = String(s._id || "");
        const sellerId =
          s.sellerId ||
          s.settingsHub?.seller_profile?.sellerId ||
          s.settingsHub?.business_info?.seller_profile?.sellerId ||
          `SEL-${rawId.slice(-6).toUpperCase() || "1001"}`;

        const hubBiz =
          s.settingsHub?.business_information ||
          s.settingsHub?.business_info?.business_information ||
          {};
        const hubProf =
          s.settingsHub?.seller_profile ||
          s.settingsHub?.business_info?.seller_profile ||
          {};

        const rawNid = String(
          s.identityVerification?.nidNumber ||
            hubBiz.nationalIdNumber ||
            s.aadhaarNumber ||
            ""
        ).trim();
        const maskedNid =
          rawNid.length >= 4 ? `${"•".repeat(Math.max(4, rawNid.length - 4))}${rawNid.slice(-4)}` : "Not Provided";

        const vStatus =
          s.verificationStatus ||
          s.identityVerification?.verificationStatus ||
          hubBiz.verificationStatus ||
          (s.verifiedBadge ? "approved" : "not_submitted");

        const pendingChanges = s.pendingProfileChanges || null;
        const submittedAt =
          pendingChanges?.submittedAt ||
          s.identityVerification?.submittedAt ||
          s.updatedAt ||
          s.createdAt ||
          new Date().toISOString();

        return {
          _id: rawId,
          sellerId,
          shopName: s.shopName || hubProf.displayName || "Unnamed Store",
          ownerName: s.ownerName || `${hubProf.firstName || ""} ${hubProf.lastName || ""}`.trim() || "Seller",
          email: s.email || hubProf.internalContactEmail || "",
          mobileNumber: s.mobileNumber || hubProf.phoneNumber || "",
          status: s.status || "pending",
          verificationStatus: vStatus,
          verifiedBadge: Boolean(s.verifiedBadge),
          submittedAt,
          createdAt: s.createdAt || new Date().toISOString(),
          sellerProfile: {
            sellerId,
            firstName: hubProf.firstName || String(s.ownerName || "").split(" ")[0] || "",
            lastName: hubProf.lastName || String(s.ownerName || "").split(" ").slice(1).join(" ") || "",
            internalContactEmail: hubProf.internalContactEmail || s.email || "",
            phoneNumber: hubProf.phoneNumber || s.mobileNumber || "",
            displayName: hubProf.displayName || s.shopName || "",
            shopLogo: hubProf.shopLogo || s.logo || "",
            holidayMode: Boolean(hubProf.holidayMode ?? s.holidayMode),
            holidayStartDate: hubProf.holidayStartDate || "",
            holidayEndDate: hubProf.holidayEndDate || "",
          },
          businessInformation: {
            sellerType: hubBiz.sellerType || (s.businessType === "Individual / Sole Proprietor" ? "Individual" : "Business"),
            legalEntityName: hubBiz.legalEntityName || s.shopName || "",
            legalForm: hubBiz.legalForm || s.businessType || "Individual / Sole Proprietor",
            businessRegistrationNumber: hubBiz.businessRegistrationNumber || s.gstNumber || "",
            registeredAddress: hubBiz.registeredAddress || s.businessAddress || "",
            city: hubBiz.city || s.city || "",
            district: hubBiz.district || s.state || "",
            postalCode: hubBiz.postalCode || s.pincode || "",
            countryRegion: hubBiz.countryRegion || "Bangladesh / India",
            personInChargeName: hubBiz.personInChargeName || s.ownerName || "",
            contactEmail: hubBiz.contactEmail || s.email || "",
            contactPhone: hubBiz.contactPhone || s.mobileNumber || "",
            identityDocType: hubBiz.identityDocType || "National ID (NID)",
            maskedNationalIdNumber: maskedNid,
            nationalIdNumber: canViewSensitiveDocs ? rawNid : maskedNid,
            nidFrontImageUrl: canViewSensitiveDocs
              ? hubBiz.nidFrontImageUrl || s.identityVerification?.nidFrontImageUrl || ""
              : "",
            nidBackImageUrl: canViewSensitiveDocs
              ? hubBiz.nidBackImageUrl || s.identityVerification?.nidBackImageUrl || ""
              : "",
            supportingDocUrl: canViewSensitiveDocs ? hubBiz.supportingDocUrl || "" : "",
            supportingDocName: hubBiz.supportingDocName || "Business / Tax Supporting Document",
          },
          pendingProfileChanges: pendingChanges,
          rejectionReason: s.rejectionReason || s.identityVerification?.rejectionReason || "",
          resubmissionInstructions:
            s.resubmissionInstructions || s.identityVerification?.resubmissionInstructions || "",
          adminReviewNotes: Array.isArray(s.adminReviewNotes) ? s.adminReviewNotes : [],
          verificationHistory: Array.isArray(s.verificationHistory) ? s.verificationHistory : [],
          settingsAuditHistory: Array.isArray(s.settingsAuditHistory) ? s.settingsAuditHistory.slice(0, 30) : [],
          canViewSensitiveDocs,
        };
      })
      .filter((item) => {
        if (q) {
          const hay = `${item.shopName} ${item.ownerName} ${item.sellerId} ${item.email} ${item.mobileNumber}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (statusFilter && statusFilter !== "all") {
          if (statusFilter === "has_pending_changes") {
            if (!item.pendingProfileChanges) return false;
          } else if (
            item.verificationStatus.toLowerCase() !== statusFilter &&
            item.status.toLowerCase() !== statusFilter
          ) {
            return false;
          }
        }
        if (dateFrom || dateTo) {
          const ts = new Date(item.submittedAt).getTime();
          if (dateFrom && ts < dateFrom) return false;
          if (dateTo && ts > dateTo) return false;
        }
        return true;
      });

    return res.json({
      success: true,
      sellers: formatted,
      approvalRequiredFields: platformApprovalRequiredFields,
      canViewSensitiveDocs,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch seller review queue" });
  }
});

router.post("/seller-reviews/:sellerId/decision", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const targetId = String(req.params.sellerId || "").trim();
    const { action, reason, instructions, privateNote } = req.body || {};
    const adminUser = (req as any).admin || {};
    const reviewerEmail = adminUser.email || "admin@alikend.com";
    const reviewerRole = resolveAdminRole(adminUser.role, reviewerEmail);
    const nowIso = new Date().toISOString();

    const memSellers = ((memoryStore as any).sellers || []) as any[];
    let sellerObj = memSellers.find(
      (s: any) =>
        String(s._id) === targetId ||
        String(s.sellerId || "").toLowerCase() === targetId.toLowerCase()
    );

    let mongoDoc: any = null;
    if (isMongoConnected()) {
      try {
        mongoDoc = await Seller.findOne({
          $or: [{ _id: targetId.match(/^[0-9a-fA-F]{24}$/) ? targetId : undefined }, { email: targetId }].filter(
            Boolean
          ) as any,
        });
      } catch {}
    }

    if (!sellerObj && !mongoDoc) {
      return res.status(404).json({ error: "Seller record not found." });
    }

    const targetSeller = sellerObj || mongoDoc.toObject();
    if (!Array.isArray(targetSeller.verificationHistory)) targetSeller.verificationHistory = [];
    if (!Array.isArray(targetSeller.adminReviewNotes)) targetSeller.adminReviewNotes = [];
    if (!Array.isArray(targetSeller.notifications)) targetSeller.notifications = [];
    if (!Array.isArray(targetSeller.settingsAuditHistory)) targetSeller.settingsAuditHistory = [];

    if (privateNote && String(privateNote).trim()) {
      targetSeller.adminReviewNotes.unshift({
        id: `note_${Date.now()}`,
        note: String(privateNote).trim(),
        reviewerEmail,
        reviewerRole,
        timestamp: nowIso,
      });
    }

    if (action === "add_note") {
      if (!privateNote || !String(privateNote).trim()) {
        return res.status(400).json({ error: "Please enter a review note." });
      }
    } else if (action === "approve") {
      // Apply any pendingProfileChanges to live seller fields
      const pending = targetSeller.pendingProfileChanges;
      if (pending && Array.isArray(pending.diffs)) {
        if (!targetSeller.settingsHub) targetSeller.settingsHub = {};
        const sectionKey = pending.cardId === "seller_profile" ? "seller_profile" : "business_information";
        targetSeller.settingsHub[sectionKey] = {
          ...(targetSeller.settingsHub[sectionKey] || {}),
          ...(pending.proposedData || {}),
          verificationStatus: "approved",
          approvalStatus: "approved",
          verifiedBadge: true,
        };
        if (pending.proposedData?.displayName || pending.proposedData?.shopName) {
          targetSeller.shopName = pending.proposedData.displayName || pending.proposedData.shopName;
        }
        if (pending.proposedData?.legalEntityName) {
          targetSeller.legalEntityName = pending.proposedData.legalEntityName;
        }
        if (pending.proposedData?.registeredAddress) {
          targetSeller.businessAddress = pending.proposedData.registeredAddress;
        }
        if (pending.proposedData?.businessRegistrationNumber) {
          targetSeller.gstNumber = pending.proposedData.businessRegistrationNumber;
        }
      }
      targetSeller.pendingProfileChanges = null;
      targetSeller.verificationStatus = "approved";
      targetSeller.verifiedBadge = true;
      if (targetSeller.status === "pending") targetSeller.status = "approved";
      targetSeller.rejectionReason = "";
      targetSeller.resubmissionInstructions = "";
      if (targetSeller.identityVerification) {
        targetSeller.identityVerification.verificationStatus = "approved";
        targetSeller.identityVerification.reviewedAt = nowIso;
        targetSeller.identityVerification.reviewedBy = reviewerEmail;
      }
      targetSeller.verificationHistory.unshift({
        id: `vh_${Date.now()}`,
        action: "Approved & Verified",
        status: "approved",
        reviewerEmail,
        reviewerRole,
        note: reason || "Business & profile verification approved by Admin.",
        timestamp: nowIso,
      });
      targetSeller.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: "verification_approved",
        title: "Account & Business Information Verified",
        message: "Your Seller Profile and Business Information have been verified and approved by the Admin Desk.",
        read: false,
        createdAt: nowIso,
      });
    } else if (action === "reject") {
      if (!reason || !String(reason).trim()) {
        return res.status(400).json({ error: "A clear rejection reason is required when rejecting verification." });
      }
      targetSeller.verificationStatus = "rejected";
      targetSeller.verifiedBadge = false;
      targetSeller.rejectionReason = String(reason).trim();
      if (targetSeller.pendingProfileChanges) {
        targetSeller.pendingProfileChanges.status = "rejected";
        targetSeller.pendingProfileChanges.rejectionReason = String(reason).trim();
      }
      if (targetSeller.identityVerification) {
        targetSeller.identityVerification.verificationStatus = "rejected";
        targetSeller.identityVerification.rejectionReason = String(reason).trim();
        targetSeller.identityVerification.reviewedAt = nowIso;
        targetSeller.identityVerification.reviewedBy = reviewerEmail;
      }
      targetSeller.verificationHistory.unshift({
        id: `vh_${Date.now()}`,
        action: "Verification Rejected",
        status: "rejected",
        reviewerEmail,
        reviewerRole,
        reason: String(reason).trim(),
        timestamp: nowIso,
      });
      targetSeller.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: "verification_rejected",
        title: "Verification Rejected — Action Required",
        message: `Your verification submission was rejected. Reason: ${String(reason).trim()}`,
        read: false,
        createdAt: nowIso,
      });
    } else if (action === "request_more_info") {
      const msg = String(instructions || reason || "").trim();
      if (!msg) {
        return res.status(400).json({ error: "Please specify what additional information or document is required." });
      }
      targetSeller.verificationStatus = "resubmission_required";
      targetSeller.resubmissionInstructions = msg;
      if (targetSeller.pendingProfileChanges) {
        targetSeller.pendingProfileChanges.status = "resubmission_required";
        targetSeller.pendingProfileChanges.resubmissionInstructions = msg;
      }
      if (targetSeller.identityVerification) {
        targetSeller.identityVerification.verificationStatus = "resubmission_required";
        targetSeller.identityVerification.resubmissionInstructions = msg;
        targetSeller.identityVerification.reviewedAt = nowIso;
        targetSeller.identityVerification.reviewedBy = reviewerEmail;
      }
      targetSeller.verificationHistory.unshift({
        id: `vh_${Date.now()}`,
        action: "More Information Required",
        status: "resubmission_required",
        reviewerEmail,
        reviewerRole,
        reason: msg,
        timestamp: nowIso,
      });
      targetSeller.notifications.unshift({
        id: `notif_${Date.now()}`,
        type: "verification_more_info",
        title: "More Information Required for Verification",
        message: `Admin requested additional details: ${msg}`,
        read: false,
        createdAt: nowIso,
      });
    } else if (action === "under_verification") {
      targetSeller.verificationStatus = "under_verification";
      targetSeller.verificationHistory.unshift({
        id: `vh_${Date.now()}`,
        action: "Marked Under Verification",
        status: "under_verification",
        reviewerEmail,
        reviewerRole,
        timestamp: nowIso,
      });
    } else if (action === "toggle_suspension") {
      const nextStatus = targetSeller.status === "suspended" ? "approved" : "suspended";
      targetSeller.status = nextStatus;
      targetSeller.verificationHistory.unshift({
        id: `vh_${Date.now()}`,
        action: nextStatus === "suspended" ? "Seller Account Suspended" : "Seller Account Reactivated",
        status: nextStatus,
        reviewerEmail,
        reviewerRole,
        reason: String(reason || "Administrative status change"),
        timestamp: nowIso,
      });
    } else {
      return res.status(400).json({ error: "Unsupported review action." });
    }

    targetSeller.settingsAuditHistory.unshift({
      id: `aud_${Date.now()}`,
      cardId: "admin_verification_review",
      action: `Admin Review Action: ${action.toUpperCase()}`,
      actorEmail: reviewerEmail,
      actorRole: reviewerRole,
      timestamp: nowIso,
    });

    // Save back to memoryStore
    if (sellerObj) {
      Object.assign(sellerObj, targetSeller);
    } else {
      memSellers.push(targetSeller);
    }

    // Save to MongoDB if connected
    if (isMongoConnected()) {
      try {
        await Seller.findByIdAndUpdate(targetSeller._id, {
          $set: {
            shopName: targetSeller.shopName,
            status: targetSeller.status,
            verificationStatus: targetSeller.verificationStatus,
            verifiedBadge: targetSeller.verifiedBadge,
            rejectionReason: targetSeller.rejectionReason,
            resubmissionInstructions: targetSeller.resubmissionInstructions,
            pendingProfileChanges: targetSeller.pendingProfileChanges,
            adminReviewNotes: targetSeller.adminReviewNotes,
            verificationHistory: targetSeller.verificationHistory,
            settingsAuditHistory: targetSeller.settingsAuditHistory,
            notifications: targetSeller.notifications,
            settingsHub: targetSeller.settingsHub,
            identityVerification: targetSeller.identityVerification,
          },
        });
      } catch {}
    }

    recordAudit(
      req,
      `SELLER_REVIEW_${String(action).toUpperCase()}`,
      "seller",
      String(targetSeller.sellerId || targetSeller._id),
      `Admin ${reviewerEmail} executed [${action}] on seller ${targetSeller.shopName}`
    );

    return res.json({
      success: true,
      message: `Seller review decision (${action}) saved and recorded in audit history.`,
      seller: targetSeller,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to process seller review decision" });
  }
});

router.put("/approval-rules", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    const fields = Array.isArray(req.body?.fields) ? req.body.fields : [];
    const updated = setPlatformApprovalRequiredFields(fields);
    recordAudit(
      req,
      "UPDATE_SELLER_APPROVAL_RULES",
      "config",
      "approval_required_fields",
      `Updated seller fields requiring Admin approval: ${updated.join(", ")}`
    );
    return res.json({
      success: true,
      message: "Seller field approval rules updated.",
      approvalRequiredFields: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update approval rules" });
  }
});

// ============================================================================
// SECTION 9: ADMIN GLOBAL BANK DIRECTORY MANAGEMENT (500+ INSTITUTIONS)
// ============================================================================
router.get("/bank-directory", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    await ensureBankDirectorySeeded();
    const q = String(req.query.q || "");
    const country = String(req.query.country || "");
    const region = String(req.query.region || "");
    const category = String(req.query.category || "");
    const institutionType = (req.query.institutionType as any) || "all";
    const payoutEligibleOnly = req.query.payoutEligibleOnly === "true";
    const verifiedOnly = req.query.verifiedOnly === "true";
    const activeOnly = req.query.activeOnly === "true";
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);

    const result = queryBankDirectory({
      q,
      country,
      region,
      category,
      institutionType,
      payoutEligibleOnly,
      verifiedOnly,
      activeOnly,
      page,
      limit,
    });

    const stats = getBankDirectorySummaryStats();
    return res.json({
      success: true,
      ...result,
      stats,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load Admin Global Bank Directory" });
  }
});

router.post("/bank-directory", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    await ensureBankDirectorySeeded();
    const { record } = await addOrUpdateBankInstitution(req.body || {});
    recordAudit(
      req,
      "ADD_BANK_DIRECTORY_INSTITUTION",
      "config",
      record.institutionId,
      `Added financial institution "${record.officialName}" (${record.country} • ${record.category})`
    );
    const stats = getBankDirectorySummaryStats();
    return res.status(201).json({
      success: true,
      message: `Added "${record.officialName}" (${record.country}) to the Global Bank Directory.`,
      institution: record,
      stats,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to add financial institution" });
  }
});

router.put("/bank-directory/:institutionId", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    await ensureBankDirectorySeeded();
    const institutionId = String(req.params.institutionId || "").trim();
    const { record } = await addOrUpdateBankInstitution(req.body || {}, institutionId);
    recordAudit(
      req,
      "UPDATE_BANK_DIRECTORY_INSTITUTION",
      "config",
      record.institutionId,
      `Updated "${record.officialName}" (${record.country}) — Verified: ${record.verified}, PayoutEligible: ${record.payoutEligible}, Active: ${record.active}`
    );
    const stats = getBankDirectorySummaryStats();
    return res.json({
      success: true,
      message: `Updated "${record.officialName}" (${record.country}).`,
      institution: record,
      stats,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to update financial institution" });
  }
});

router.post("/bank-directory/import", requireAdmin as any, async (req: AuthedRequest, res: Response) => {
  try {
    await ensureBankDirectorySeeded();
    const format = req.body?.format === "csv" ? "csv" : "json";
    const content = req.body?.content ?? req.body?.institutions ?? "";
    const summary = await bulkImportBankInstitutions(format, content);
    recordAudit(
      req,
      "IMPORT_BANK_DIRECTORY_RECORDS",
      "config",
      "global_bank_directory",
      `Imported ${summary.importedCount} new institution(s) via ${format.toUpperCase()} (${summary.skippedDuplicates} duplicates skipped). Total unique: ${summary.totalDirectoryCount}.`
    );
    const stats = getBankDirectorySummaryStats();
    return res.json({
      success: true,
      message: `Imported ${summary.importedCount} new institution(s). Skipped ${summary.skippedDuplicates} duplicate record(s).`,
      summary,
      stats,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "Failed to import bank records" });
  }
});

export default router;


