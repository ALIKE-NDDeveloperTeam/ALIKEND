import { Router, Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import RideBooking, { IRideBooking, RideServiceType, RideStatus } from "../models/RideBooking";
import Driver, { IDriver } from "../models/Driver";
import PlatformSetting from "../models/PlatformSetting";
import SavedRidePlace from "../models/SavedRidePlace";
import { isMongoConnected, memoryStore } from "../store";
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { maskLicense, isValidLat, isValidLng } from "./driverAuth";
import {
  APPROVED_VEHICLE_CATEGORIES,
  VALID_PROMO_CODES,
  calculateRideFare,
  VehicleCategoryConfig,
} from "../services/ridePricingService";

const router = Router();

// In-memory initialization
if (!memoryStore.rides) {
  memoryStore.rides = [];
}
if (!memoryStore.savedPlaces) {
  memoryStore.savedPlaces = [];
}
if (!memoryStore.rideDisputes) {
  memoryStore.rideDisputes = [];
}

// Backward compatibility export
export const DEFAULT_VEHICLE_CONFIGS = APPROVED_VEHICLE_CATEGORIES;

/**
 * Helper: Haversine distance in kilometers
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Helper: Retrieve active pricing settings (MongoDB PlatformSetting or memory fallback)
 */
async function getActiveRideSettings(): Promise<{
  pricing: Record<string, { baseFare: number; perKmRate: number; perMinuteRate?: number; minimumFare: number }>;
  categoriesConfig: Record<string, { enabled: boolean }>;
}> {
  if (isMongoConnected()) {
    try {
      const doc = await PlatformSetting.findOne({ key: "ride_settings" }).lean();
      if (doc && (doc as any).pricing) {
        return {
          pricing: (doc as any).pricing,
          categoriesConfig: (doc as any).categories || {},
        };
      }
    } catch (e) {
      console.warn("MongoDB ride settings lookup fallback:", e);
    }
  }

  if (memoryStore.rideSettings) {
    return {
      pricing: memoryStore.rideSettings.pricing || memoryStore.rideSettings,
      categoriesConfig: memoryStore.rideSettings.categories || {},
    };
  }

  const defaultPricing: Record<string, any> = {};
  for (const [key, val] of Object.entries(APPROVED_VEHICLE_CATEGORIES)) {
    defaultPricing[key] = {
      baseFare: val.baseFare,
      perKmRate: val.perKmRate,
      perMinuteRate: val.perMinuteRate,
      minimumFare: val.minimumFare,
    };
  }

  return { pricing: defaultPricing, categoriesConfig: {} };
}

/**
 * Helper: Advance dispatch candidate if current offer has expired
 * Serverless-compatible: Evaluated on read/poll requests
 */
async function progressDispatchIfNeeded(ride: any): Promise<any> {
  if (!ride || ride.status !== "requested") return ride;

  const now = Date.now();
  const expiresAtMs = ride.offerExpiresAt ? new Date(ride.offerExpiresAt).getTime() : 0;

  if (expiresAtMs > 0 && now > expiresAtMs) {
    const candidates: string[] = ride.candidateDriverIds || [];
    const nextIdx = (ride.candidateIndex || 0) + 1;

    if (nextIdx < candidates.length) {
      ride.candidateIndex = nextIdx;
      ride.currentOfferDriverId = candidates[nextIdx];
      ride.offerExpiresAt = new Date(now + 20000); // 20s window
    } else {
      ride.status = "no_driver_found";
      ride.currentOfferDriverId = null;
      ride.offerExpiresAt = null;
    }

    if (typeof ride.save === "function") {
      await ride.save();
    }

    const memIdx = (memoryStore.rides || []).findIndex(
      (r: any) => r.bookingId === ride.bookingId || r._id === ride._id
    );
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        status: ride.status,
        candidateIndex: ride.candidateIndex,
        currentOfferDriverId: ride.currentOfferDriverId,
        offerExpiresAt: ride.offerExpiresAt,
      };
    }
  }

  return ride;
}

// =====================================================================
// MODULE 2A: RIDE BOOKING OPTIONS & VEHICLE CATEGORIES
// =====================================================================

/**
 * 1. GET /api/rides/categories
 * Returns all 8 approved vehicle categories with dynamic pricing, capacities, and active driver availability
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;
    const { pricing, categoriesConfig } = await getActiveRideSettings();

    // Query online drivers to compute availability counts
    let onlineDrivers: any[] = [];
    if (isMongoConnected()) {
      try {
        onlineDrivers = await Driver.find({ status: "approved", isOnline: true })
          .select("vehicleType location")
          .lean();
      } catch (e) {}
    }
    if (onlineDrivers.length === 0) {
      onlineDrivers = (memoryStore.drivers || []).filter(
        (d: any) => d.status === "approved" && d.isOnline === true
      );
    }

    const clientLat = isValidLat(lat) ? Number(lat) : 28.6139;
    const clientLng = isValidLng(lng) ? Number(lng) : 77.209;

    const categoriesList = Object.entries(APPROVED_VEHICLE_CATEGORIES)
      .filter(([key]) => key !== "cab") // Skip legacy alias from main list
      .map(([key, config]) => {
        const customRates = pricing[key] || {
          baseFare: config.baseFare,
          perKmRate: config.perKmRate,
          perMinuteRate: config.perMinuteRate,
          minimumFare: config.minimumFare,
        };

        const isEnabled = categoriesConfig[key]?.enabled ?? config.enabled;

        // Filter drivers near customer
        const matchingDrivers = onlineDrivers.filter((d: any) => {
          if (d.vehicleType !== key && !(key === "car_sedan" && d.vehicleType === "cab")) return false;
          const dLng = d.location?.coordinates?.[0] || 77.209;
          const dLat = d.location?.coordinates?.[1] || 28.6139;
          const dist = calculateHaversineKm(clientLat, clientLng, dLat, dLng);
          return dist <= 8.0; // Within 8 km
        });

        const availableCount = matchingDrivers.length;
        const etaArrivalMin = availableCount > 0 ? Math.max(2, Math.floor(Math.random() * 4) + 2) : 6;

        return {
          ...config,
          baseFare: customRates.baseFare,
          perKmRate: customRates.perKmRate,
          perMinuteRate: customRates.perMinuteRate || config.perMinuteRate,
          minimumFare: customRates.minimumFare,
          enabled: isEnabled,
          availableCount,
          etaArrivalMin,
          isAvailableNearby: availableCount > 0,
        };
      });

    return res.json({
      success: true,
      categories: categoriesList,
      totalCategories: categoriesList.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load ride categories." });
  }
});

/**
 * 2. GET /api/rides/online-types
 * Returns quick summary for storefront top banner
 */
router.get("/online-types", async (_req: Request, res: Response) => {
  try {
    let onlineDrivers: any[] = [];
    if (isMongoConnected()) {
      try {
        onlineDrivers = await Driver.find({ status: "approved", isOnline: true })
          .select("vehicleType")
          .lean();
      } catch (e) {}
    }
    if (onlineDrivers.length === 0) {
      onlineDrivers = (memoryStore.drivers || []).filter(
        (d: any) => d.status === "approved" && d.isOnline === true
      );
    }

    const availableTypes = Array.from(new Set(onlineDrivers.map((d: any) => d.vehicleType)));

    return res.json({
      success: true,
      availableTypes,
      totalOnline: onlineDrivers.length,
      bannerText:
        availableTypes.length > 0
          ? availableTypes.map((t) => t.toUpperCase().replace("CAR_", "")).join(" • ")
          : "BIKE • AUTO • CAB",
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch online ride types." });
  }
});

// =====================================================================
// MODULE 2B & 2C: CUSTOMER FARE ESTIMATE, PROMO & BOOKING
// =====================================================================

/**
 * 3. POST /api/rides/promo/validate
 * Validates promo coupon codes
 */
router.post("/promo/validate", (req: Request, res: Response) => {
  try {
    const { code, fareAmount, serviceType } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ error: "Promo coupon code is required." });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const promo = VALID_PROMO_CODES[cleanCode];

    if (!promo) {
      return res.status(400).json({
        valid: false,
        error: `Coupon '${cleanCode}' is invalid or has expired.`,
      });
    }

    const fare = Number(fareAmount) || 0;
    if (fare > 0 && fare < promo.minFare) {
      return res.status(400).json({
        valid: false,
        error: `Coupon '${cleanCode}' requires a minimum fare of ₹${promo.minFare}.`,
      });
    }

    if (promo.applicableServices && serviceType) {
      const norm = serviceType === "cab" ? "car_sedan" : serviceType;
      if (!promo.applicableServices.includes(serviceType) && !promo.applicableServices.includes(norm)) {
        return res.status(400).json({
          valid: false,
          error: `Coupon '${cleanCode}' is not applicable to ${serviceType}.`,
        });
      }
    }

    let estimatedDiscount = promo.amount;
    if (promo.discountType === "percentage") {
      estimatedDiscount = Math.round((fare * promo.amount) / 100);
      if (promo.maxDiscount) estimatedDiscount = Math.min(estimatedDiscount, promo.maxDiscount);
    }

    return res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      amount: promo.amount,
      estimatedDiscount,
      description: promo.description,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to validate coupon code." });
  }
});

/**
 * 4. POST /api/rides/estimate
 * Calculates distance, duration, taxes, and itemized fares for all active vehicle categories
 */
router.post("/estimate", async (req: Request, res: Response) => {
  try {
    const { pickup, destination, distanceKm: customDist, promoCode } = req.body;

    if (!pickup?.address || !destination?.address) {
      return res.status(400).json({ error: "Both pickup and destination locations are required." });
    }

    let distance = Number(customDist);

    if (
      isValidLat(pickup?.lat) &&
      isValidLng(pickup?.lng) &&
      isValidLat(destination?.lat) &&
      isValidLng(destination?.lng)
    ) {
      const computed = calculateHaversineKm(
        Number(pickup.lat),
        Number(pickup.lng),
        Number(destination.lat),
        Number(destination.lng)
      );
      if (computed > 0) {
        distance = computed;
      }
    }

    if (!distance || isNaN(distance) || distance <= 0) {
      distance = 6.4; // Default city distance
    }

    const { pricing, categoriesConfig } = await getActiveRideSettings();

    const currentHour = new Date().getHours();
    const isRushHour =
      (currentHour >= 8 && currentHour <= 10) ||
      (currentHour >= 18 && currentHour <= 21);

    const vehicleKeys = [
      "bike",
      "auto",
      "car_mini",
      "car_sedan",
      "car_suv",
      "car_premium",
      "car_xl",
      "car_green",
    ];

    const estimates = vehicleKeys.map((type) => {
      const cfg = APPROVED_VEHICLE_CATEGORIES[type];
      const customRates = pricing[type];
      const isEnabled = categoriesConfig[type]?.enabled ?? cfg.enabled;

      const calc = calculateRideFare({
        serviceType: type,
        distanceKm: distance,
        pickupAddress: pickup.address,
        destinationAddress: destination.address,
        promoCode,
        customPricing: customRates,
        isRushHour,
      });

      const etaArrivalMin = Math.max(2, Math.floor(Math.random() * 4) + 2);

      return {
        serviceType: type,
        name: cfg.name,
        category: cfg.category,
        capacity: cfg.capacity,
        description: cfg.description,
        icon: cfg.icon,
        badge: cfg.badge,
        enabled: isEnabled,
        distanceKm: distance,
        estimatedDurationMin: calc.estimatedDurationMin,
        etaArrivalMin,
        fare: {
          baseFare: calc.baseFare,
          distanceFare: calc.distanceFare,
          timeFare: calc.timeFare,
          waitingFare: calc.waitingFare,
          surgeMultiplier: calc.surgeMultiplier,
          tollCharges: calc.tollCharges,
          airportCharges: calc.airportCharges,
          subtotal: calc.subtotal,
          discountAmount: calc.discountAmount,
          promoCodeApplied: calc.promoCodeApplied,
          tax: calc.tax,
          safetyFee: calc.safetyFee,
          totalFare: calc.totalFare,
          driverEarnings: calc.driverEarnings,
          platformCommission: calc.platformCommission,
        },
      };
    });

    return res.json({
      success: true,
      pickup,
      destination,
      distanceKm: distance,
      isRushHour,
      surgeMultiplier: isRushHour ? 1.2 : 1.0,
      estimates,
    });
  } catch (err: any) {
    console.error("Fare estimate error:", err);
    return res.status(500).json({ error: "Failed to calculate fare estimates." });
  }
});

/**
 * 5. POST /api/rides & POST /api/rides/book
 * Books a ride (Now or Scheduled) with complete server-side calculation and 20s driver candidate dispatching
 */
router.post(["/", "/book"], async (req: Request, res: Response) => {
  try {
    const {
      serviceType: rawType = "auto",
      pickup,
      destination,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod = "cash",
      promoCode,
      isScheduled,
      scheduledFor,
      idempotencyKey,
    } = req.body;

    if (!pickup?.address || !destination?.address) {
      return res.status(400).json({ error: "Pickup and destination addresses are required." });
    }

    if (!customerPhone || !String(customerPhone).trim()) {
      return res.status(400).json({ error: "Customer mobile number is required." });
    }

    let sType = String(rawType).toLowerCase();
    if (sType === "cab") sType = "car_sedan";
    if (!APPROVED_VEHICLE_CATEGORIES[sType]) {
      sType = "auto";
    }

    const pickupLat = isValidLat(pickup.lat) ? Number(pickup.lat) : 28.6139;
    const pickupLng = isValidLng(pickup.lng) ? Number(pickup.lng) : 77.209;
    const dropLat = isValidLat(destination.lat) ? Number(destination.lat) : 28.5355;
    const dropLng = isValidLng(destination.lng) ? Number(destination.lng) : 77.391;

    let distanceKm = calculateHaversineKm(pickupLat, pickupLng, dropLat, dropLng);
    if (distanceKm <= 0) distanceKm = 6.4;

    const { pricing } = await getActiveRideSettings();

    // Server recalculated fare (never trust client)
    const calc = calculateRideFare({
      serviceType: sType,
      distanceKm,
      pickupAddress: pickup.address,
      destinationAddress: destination.address,
      promoCode,
      customPricing: pricing[sType],
    });

    // Idempotency prevention
    if (idempotencyKey) {
      if (isMongoConnected()) {
        try {
          const existing = await RideBooking.findOne({ idempotencyKey }).lean();
          if (existing) {
            return res.json({ success: true, ride: existing, isDuplicatePrevented: true });
          }
        } catch (e) {}
      }
      const memExisting = (memoryStore.rides || []).find((r: any) => r.idempotencyKey === idempotencyKey);
      if (memExisting) {
        return res.json({ success: true, ride: memExisting, isDuplicatePrevented: true });
      }
    }

    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const bookingId = `RIDE-${randomDigits}`;
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${randomDigits}`;

    // Cryptographically secure 4-digit Ride OTP
    const rideOtp = String(crypto.randomInt(1000, 9999));

    // Handle Scheduled Ride
    if (isScheduled && scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      const scheduledRideData: any = {
        bookingId,
        invoiceNumber,
        customerName: customerName ? String(customerName).trim() : "Valued Customer",
        customerPhone: String(customerPhone).trim(),
        customerEmail: customerEmail ? String(customerEmail).trim().toLowerCase() : "",
        serviceType: sType as RideServiceType,
        pickup: { address: pickup.address, landmark: pickup.landmark || "", lat: pickupLat, lng: pickupLng },
        destination: { address: destination.address, landmark: destination.landmark || "", lat: dropLat, lng: dropLng },
        distanceKm,
        estimatedDurationMin: calc.estimatedDurationMin,
        fare: {
          baseFare: calc.baseFare,
          distanceFare: calc.distanceFare,
          timeFare: calc.timeFare,
          waitingFare: calc.waitingFare,
          surgeMultiplier: calc.surgeMultiplier,
          tollCharges: calc.tollCharges,
          airportCharges: calc.airportCharges,
          discountAmount: calc.discountAmount,
          promoCode: calc.promoCodeApplied,
          tax: calc.tax,
          totalFare: calc.totalFare,
          driverEarnings: calc.driverEarnings,
          platformCommission: calc.platformCommission,
        },
        status: "requested",
        isScheduled: true,
        scheduledFor: scheduledDate,
        rideOtp,
        paymentMethod: ["cash", "upi", "wallet", "card"].includes(paymentMethod) ? paymentMethod : "cash",
        paymentStatus: "pending",
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isMongoConnected()) {
        try {
          await RideBooking.create(scheduledRideData);
        } catch (e) {}
      }
      memoryStore.rides.unshift(scheduledRideData);

      return res.status(201).json({
        success: true,
        message: `Ride scheduled successfully for ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${scheduledDate.toLocaleDateString()}. Driver will be assigned 15 minutes prior.`,
        ride: scheduledRideData,
        isScheduled: true,
      });
    }

    // Find nearest online & approved drivers (<5 km)
    let nearbyDrivers: any[] = [];
    if (isMongoConnected()) {
      try {
        nearbyDrivers = await Driver.find({
          status: "approved",
          isOnline: true,
          vehicleType: { $in: [sType, sType === "car_sedan" ? "cab" : sType] } as any,
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [pickupLng, pickupLat],
              },
              $maxDistance: 6000,
            },
          },
        })
          .limit(5)
          .lean();
      } catch (dbErr) {
        console.warn("MongoDB $near query fallback:", dbErr);
      }
    }

    if (nearbyDrivers.length === 0) {
      const candidates = (memoryStore.drivers || []).filter(
        (d: any) =>
          d.status === "approved" &&
          d.isOnline === true &&
          (d.vehicleType === sType || (sType === "car_sedan" && d.vehicleType === "cab"))
      );

      nearbyDrivers = candidates
        .map((d: any) => {
          const dLng = d.location?.coordinates?.[0] || 77.209;
          const dLat = d.location?.coordinates?.[1] || 28.6139;
          const dist = calculateHaversineKm(pickupLat, pickupLng, dLat, dLng);
          return { ...d, distKm: dist };
        })
        .filter((d: any) => d.distKm <= 6.0)
        .sort((a: any, b: any) => a.distKm - b.distKm)
        .slice(0, 5);
    }

    const candidateIds = nearbyDrivers.map((d: any) => String(d._id));
    const firstDriverId = candidateIds.length > 0 ? candidateIds[0] : null;
    const initialStatus: RideStatus = firstDriverId ? "requested" : "no_driver_found";
    const offerExpiresAt = firstDriverId ? new Date(Date.now() + 20000) : null;

    const newRideData: any = {
      bookingId,
      invoiceNumber,
      customerName: customerName ? String(customerName).trim() : "Valued Customer",
      customerPhone: String(customerPhone).trim(),
      customerEmail: customerEmail ? String(customerEmail).trim().toLowerCase() : "",
      serviceType: sType as RideServiceType,
      pickup: {
        address: pickup.address,
        landmark: pickup.landmark || "",
        lat: pickupLat,
        lng: pickupLng,
      },
      destination: {
        address: destination.address,
        landmark: destination.landmark || "",
        lat: dropLat,
        lng: dropLng,
      },
      distanceKm,
      estimatedDurationMin: calc.estimatedDurationMin,
      fare: {
        baseFare: calc.baseFare,
        distanceFare: calc.distanceFare,
        timeFare: calc.timeFare,
        waitingFare: calc.waitingFare,
        surgeMultiplier: calc.surgeMultiplier,
        tollCharges: calc.tollCharges,
        airportCharges: calc.airportCharges,
        discountAmount: calc.discountAmount,
        promoCode: calc.promoCodeApplied,
        tax: calc.tax,
        totalFare: calc.totalFare,
        driverEarnings: calc.driverEarnings,
        platformCommission: calc.platformCommission,
      },
      status: initialStatus,
      rideOtp,
      candidateDriverIds: candidateIds,
      candidateIndex: 0,
      currentOfferDriverId: firstDriverId || undefined,
      offerExpiresAt: offerExpiresAt || undefined,
      paymentMethod: ["cash", "upi", "wallet", "card"].includes(paymentMethod) ? paymentMethod : "cash",
      paymentStatus: "pending",
      idempotencyKey: idempotencyKey || crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await RideBooking.create(newRideData);
      } catch (e) {
        console.warn("MongoDB create ride fallback:", e);
      }
    }

    const finalRide = createdDoc?.toObject ? createdDoc.toObject() : { ...newRideData, _id: `ride_mem_${Date.now()}` };
    memoryStore.rides.unshift(finalRide);

    return res.status(201).json({
      success: true,
      message: firstDriverId
        ? "Finding your nearest driver partner... Dispatching ride request."
        : "All driver partners in your area are currently engaged. Please try again in 1-2 minutes.",
      ride: finalRide,
      nearbyDriversFound: candidateIds.length,
    });
  } catch (err: any) {
    console.error("Ride booking error:", err);
    return res.status(500).json({ error: err.message || "Failed to book ride." });
  }
});

// =====================================================================
// SAVED PLACES & USER HISTORY (Registered before /:id)
// =====================================================================

/**
 * GET /api/rides/saved-places
 */
router.get("/saved-places", async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone ? String(req.query.phone).trim() : "";
    let places: any[] = [];

    if (isMongoConnected()) {
      try {
        const query: any = phone ? { phone } : {};
        places = await SavedRidePlace.find(query).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    if (places.length === 0) {
      places = (memoryStore.savedPlaces || []).filter((p: any) => (phone ? p.phone === phone : true));
    }

    if (places.length === 0) {
      places = [
        {
          placeId: "PLC-HOME",
          phone,
          label: "home",
          customName: "Home",
          address: "B-4/28, Safdarjung Enclave, New Delhi",
          lat: 28.5672,
          lng: 77.1983,
        },
        {
          placeId: "PLC-WORK",
          phone,
          label: "work",
          customName: "Office / Work",
          address: "Cyber City, Tower B, Sector 24, Gurugram",
          lat: 28.4952,
          lng: 77.0891,
        },
        {
          placeId: "PLC-AIRPORT",
          phone,
          label: "airport",
          customName: "IGI Airport (T3)",
          address: "Terminal 3, New Delhi Int. Airport",
          lat: 28.5562,
          lng: 77.0999,
        },
      ];
      memoryStore.savedPlaces = places;
    }

    return res.json({ success: true, places });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load saved places." });
  }
});

/**
 * POST /api/rides/saved-places
 */
router.post("/saved-places", async (req: Request, res: Response) => {
  try {
    const { customName, address, label = "favorite", landmark, lat, lng, phone } = req.body;

    if (!customName || !address) {
      return res.status(400).json({ error: "Place label name and address are required." });
    }

    const placeId = `PLC-${Date.now().toString(36).toUpperCase()}`;
    const newPlace = {
      placeId,
      phone: phone || "",
      label,
      customName: customName.trim(),
      address: address.trim(),
      landmark: landmark ? landmark.trim() : "",
      lat: Number(lat) || 28.6139,
      lng: Number(lng) || 77.209,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await SavedRidePlace.create(newPlace);
      } catch (e) {}
    }

    if (!memoryStore.savedPlaces) memoryStore.savedPlaces = [];
    memoryStore.savedPlaces.unshift(newPlace);

    return res.status(201).json({ success: true, place: newPlace });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to save place." });
  }
});

/**
 * DELETE /api/rides/saved-places/:id
 */
router.delete("/saved-places/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (isMongoConnected()) {
      try {
        await SavedRidePlace.deleteOne({ placeId: id });
      } catch (e) {}
    }
    memoryStore.savedPlaces = (memoryStore.savedPlaces || []).filter((p: any) => p.placeId !== id);
    return res.json({ success: true, message: "Saved place removed." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete saved place." });
  }
});

/**
 * GET /api/rides/history/user
 */
router.get("/history/user", async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone ? String(req.query.phone).trim() : "";
    const email = req.query.email ? String(req.query.email).trim() : "";

    let list: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (phone) query.customerPhone = phone;
        else if (email) query.customerEmail = email;

        list = await RideBooking.find(query).sort({ createdAt: -1 }).limit(30).lean();
      } catch (e) {}
    }

    if (list.length === 0) {
      list = (memoryStore.rides || []).filter((r: any) => {
        if (phone && r.customerPhone === phone) return true;
        if (email && r.customerEmail === email) return true;
        return !phone && !email;
      });
    }

    return res.json({ success: true, count: list.length, rides: list });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch ride history." });
  }
});

// =====================================================================
// ADMIN PANEL ENDPOINTS (Registered before /:id to prevent parameter capture)
// =====================================================================

router.get(["/admin/categories", "/categories/all"], requireAdmin, async (_req: AuthedRequest, res: Response) => {
  try {
    const { pricing, categoriesConfig } = await getActiveRideSettings();
    const categories = Object.entries(APPROVED_VEHICLE_CATEGORIES).map(([key, cfg]) => ({
      ...cfg,
      baseFare: pricing[key]?.baseFare ?? cfg.baseFare,
      perKmRate: pricing[key]?.perKmRate ?? cfg.perKmRate,
      perMinuteRate: pricing[key]?.perMinuteRate ?? cfg.perMinuteRate,
      minimumFare: pricing[key]?.minimumFare ?? cfg.minimumFare,
      enabled: categoriesConfig[key]?.enabled ?? cfg.enabled,
    }));
    return res.json({ success: true, categories });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load admin categories." });
  }
});

router.patch(["/admin/categories/:key", "/categories/:key"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { key } = req.params;
    const { enabled, baseFare, perKmRate, perMinuteRate, minimumFare } = req.body;

    const { pricing, categoriesConfig } = await getActiveRideSettings();

    if (pricing[key]) {
      if (baseFare !== undefined) pricing[key].baseFare = Number(baseFare);
      if (perKmRate !== undefined) pricing[key].perKmRate = Number(perKmRate);
      if (perMinuteRate !== undefined) pricing[key].perMinuteRate = Number(perMinuteRate);
      if (minimumFare !== undefined) pricing[key].minimumFare = Number(minimumFare);
    }
    if (!categoriesConfig[key]) categoriesConfig[key] = { enabled: true };
    if (enabled !== undefined) categoriesConfig[key].enabled = Boolean(enabled);

    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "ride_settings" },
          { key: "ride_settings", pricing, categories: categoriesConfig, updatedAt: new Date() },
          { upsert: true }
        );
      } catch (e) {}
    }

    memoryStore.rideSettings = { pricing, categories: categoriesConfig };

    return res.json({ success: true, message: `Category ${key} configuration updated.` });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update category." });
  }
});

router.get(["/admin/drivers", "/drivers"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { status } = req.query;
    let drivers: any[] = [];

    if (isMongoConnected()) {
      try {
        const filter: any = {};
        if (status && status !== "all") {
          filter.status = status;
        }
        drivers = await Driver.find(filter).sort({ createdAt: -1 }).lean();
      } catch (e) {}
    }

    if (drivers.length === 0 && memoryStore.drivers) {
      drivers = memoryStore.drivers;
      if (status && status !== "all") {
        drivers = drivers.filter((d: any) => d.status === status);
      }
    }

    return res.json({ success: true, count: drivers.length, drivers });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch drivers." });
  }
});

router.patch(["/admin/drivers/:id/status", "/drivers/:id/status"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "suspended", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid driver status." });
    }

    let updatedDriver: any = null;

    if (isMongoConnected()) {
      try {
        if (mongoose.isValidObjectId(id)) {
          updatedDriver = await Driver.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
          ).lean();
        }
      } catch (e) {}
    }

    // Memory store fallback
    if (memoryStore.drivers) {
      const idx = memoryStore.drivers.findIndex((d: any) => d._id?.toString() === id || d.phone === id);
      if (idx !== -1) {
        memoryStore.drivers[idx].status = status;
        if (!updatedDriver) updatedDriver = memoryStore.drivers[idx];
      }
    }

    if (!updatedDriver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    return res.json({
      success: true,
      message: `Driver status successfully updated to ${status}.`,
      driver: updatedDriver,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update driver status." });
  }
});

router.get(["/admin/disputes", "/disputes"], requireAdmin, async (_req: AuthedRequest, res: Response) => {
  try {
    let disputes: any[] = [];

    // From memoryStore
    if (memoryStore.rideDisputes) {
      disputes = [...memoryStore.rideDisputes];
    }

    // From MongoDB
    if (isMongoConnected()) {
      try {
        const ridesWithDisputes = await RideBooking.find({ "dispute.disputeId": { $exists: true } })
          .sort({ "dispute.createdAt": -1 })
          .lean();
        
        for (const ride of ridesWithDisputes) {
          if (ride.dispute && !disputes.some(d => d.disputeId === ride.dispute?.disputeId)) {
            disputes.push({
              ...ride.dispute,
              bookingId: ride.bookingId,
              customerName: ride.customerName,
              customerPhone: ride.customerPhone,
              totalFare: ride.fare?.totalFare,
              serviceType: ride.serviceType,
            });
          }
        }
      } catch (e) {}
    }

    return res.json({ success: true, count: disputes.length, disputes });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch ride disputes." });
  }
});

router.patch(["/admin/disputes/:disputeId/resolve", "/disputes/:disputeId/resolve"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { disputeId } = req.params;
    const { status, refundAmount, adjustmentNotes } = req.body;

    if (!["resolved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'resolved' or 'rejected'." });
    }

    let matchedDispute: any = null;

    // Update memoryStore
    if (memoryStore.rideDisputes) {
      const idx = memoryStore.rideDisputes.findIndex((d: any) => d.disputeId === disputeId);
      if (idx !== -1) {
        memoryStore.rideDisputes[idx].status = status;
        memoryStore.rideDisputes[idx].resolvedAt = new Date().toISOString();
        memoryStore.rideDisputes[idx].refundAmount = Number(refundAmount || 0);
        memoryStore.rideDisputes[idx].resolutionNotes = adjustmentNotes || "";
        matchedDispute = memoryStore.rideDisputes[idx];
      }
    }

    // Update in MongoDB
    if (isMongoConnected()) {
      try {
        const ride = await RideBooking.findOne({ "dispute.disputeId": disputeId });
        if (ride) {
          ride.dispute = {
            ...ride.dispute,
            disputeId,
            status,
            resolvedAt: new Date(),
            refundAmount: Number(refundAmount || 0),
            resolutionNotes: adjustmentNotes || "",
          } as any;
          await ride.save();
          if (!matchedDispute) matchedDispute = ride.dispute;
        }
      } catch (e) {}
    }

    if (!matchedDispute) {
      return res.status(404).json({ error: "Dispute not found." });
    }

    return res.json({
      success: true,
      message: `Dispute ${disputeId} marked as ${status}.`,
      dispute: matchedDispute,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to resolve dispute." });
  }
});

router.get(["/admin/list", "/list"], requireAdmin, async (_req: AuthedRequest, res: Response) => {
  try {
    let rides: any[] = [];
    if (isMongoConnected()) {
      try {
        rides = await RideBooking.find().sort({ createdAt: -1 }).limit(100).lean();
      } catch (e) {}
    }
    if (rides.length === 0) rides = memoryStore.rides || [];
    return res.json({ success: true, count: rides.length, rides });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch ride bookings." });
  }
});

router.get(["/admin/settings", "/settings"], requireAdmin, async (_req: AuthedRequest, res: Response) => {
  try {
    const settings = await getActiveRideSettings();
    return res.json({ success: true, pricing: settings.pricing });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch fare settings." });
  }
});

router.patch(["/admin/settings", "/settings"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { pricing } = req.body;
    if (!pricing || typeof pricing !== "object") {
      return res.status(400).json({ error: "Pricing configuration object is required." });
    }

    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "ride_settings" },
          { key: "ride_settings", pricing, updatedAt: new Date() },
          { upsert: true }
        );
      } catch (e) {}
    }

    memoryStore.rideSettings = { pricing, categories: {} };

    return res.json({ success: true, message: "Ride fare settings updated successfully.", pricing });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update fare settings." });
  }
});

/**
 * PUBLIC/TRUSTED CONTACT TRACKING ENDPOINT
 * GET /api/rides/track/:token
 */
router.get("/track/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    let ride: any = null;

    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOne({
          $or: [{ shareableTripToken: token }, { bookingId: token }],
        }).lean();
      } catch (e) {}
    }

    if (!ride) {
      ride = (memoryStore.rides || []).find(
        (r: any) => r.shareableTripToken === token || r.bookingId === token
      );
    }

    if (!ride) {
      return res.status(404).json({ error: "Trip tracking link is invalid or expired." });
    }

    // Mask customer details for privacy
    const firstName = (ride.customerName || "Passenger").split(" ")[0];

    return res.json({
      success: true,
      trip: {
        bookingId: ride.bookingId,
        passengerName: firstName,
        status: ride.status,
        serviceType: ride.serviceType,
        pickup: { address: ride.pickup?.address },
        destination: { address: ride.destination?.address },
        distanceKm: ride.distanceKm,
        startedAt: ride.startedAt,
        driver: ride.driver
          ? {
              name: ride.driver.name,
              vehicleNumber: ride.driver.vehicleNumber,
              vehicleModel: ride.driver.vehicleModel,
              vehicleType: ride.driver.vehicleType,
              rating: ride.driver.rating || 4.9,
              lat: ride.driver.lat,
              lng: ride.driver.lng,
              locationUpdatedAt: ride.driver.locationUpdatedAt,
            }
          : null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to track trip." });
  }
});

// ADMIN: Safety Incidents List (SOS, Accidents, Complaints, Lost Items)
router.get(["/admin/safety-incidents", "/safety-incidents"], requireAdmin, async (_req: AuthedRequest, res: Response) => {
  try {
    let incidents: any[] = [];
    if (memoryStore.safetyIncidents) {
      incidents = [...memoryStore.safetyIncidents];
    }

    // Collect from MongoDB ride_bookings as well
    if (isMongoConnected()) {
      try {
        const ridesWithSafety = await RideBooking.find({
          $or: [
            { "sosAlert.status": { $exists: true } },
            { "complaint.status": { $exists: true } },
            { "lostItemReport.status": { $exists: true } },
            { "accidentReport.status": { $exists: true } },
          ],
        }).sort({ updatedAt: -1 }).limit(50).lean();

        for (const r of ridesWithSafety) {
          if (r.sosAlert && !incidents.some(i => i.rideId === r.bookingId && i.type === "sos")) {
            incidents.push({
              incidentId: `SOS-${r.bookingId}`,
              type: "sos",
              rideId: r.bookingId,
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              driverName: r.driver?.name,
              status: r.sosAlert.status,
              notes: r.sosAlert.notes,
              createdAt: r.sosAlert.triggeredAt || r.updatedAt,
            });
          }
          if (r.complaint && !incidents.some(i => i.rideId === r.bookingId && i.type === "complaint")) {
            incidents.push({
              incidentId: `CMP-${r.bookingId}`,
              type: "complaint",
              rideId: r.bookingId,
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              driverName: r.driver?.name,
              status: r.complaint.status,
              notes: `${r.complaint.category}: ${r.complaint.description}`,
              createdAt: r.complaint.filedAt || r.updatedAt,
            });
          }
          if (r.lostItemReport && !incidents.some(i => i.rideId === r.bookingId && i.type === "lost_item")) {
            incidents.push({
              incidentId: `LST-${r.bookingId}`,
              type: "lost_item",
              rideId: r.bookingId,
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              driverName: r.driver?.name,
              status: r.lostItemReport.status,
              notes: `${r.lostItemReport.itemCategory}: ${r.lostItemReport.description}`,
              createdAt: r.lostItemReport.reportedAt || r.updatedAt,
            });
          }
          if (r.accidentReport && !incidents.some(i => i.rideId === r.bookingId && i.type === "accident")) {
            incidents.push({
              incidentId: `ACC-${r.bookingId}`,
              type: "accident",
              rideId: r.bookingId,
              customerName: r.customerName,
              driverName: r.driver?.name,
              status: r.accidentReport.status,
              notes: `Severity ${r.accidentReport.severity}: ${r.accidentReport.description}`,
              createdAt: r.accidentReport.reportedAt || r.updatedAt,
            });
          }
        }
      } catch (e) {}
    }

    return res.json({ success: true, count: incidents.length, incidents });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load safety incidents." });
  }
});

// ADMIN: Resolve Safety Incident
router.patch(["/admin/safety-incidents/:id/resolve", "/safety-incidents/:id/resolve"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status = "resolved", resolutionNotes } = req.body;

    if (memoryStore.safetyIncidents) {
      const idx = memoryStore.safetyIncidents.findIndex(i => i.incidentId === id || i.rideId === id);
      if (idx !== -1) {
        memoryStore.safetyIncidents[idx].status = status;
        memoryStore.safetyIncidents[idx].resolutionNotes = resolutionNotes || "Reviewed and closed by Admin";
        memoryStore.safetyIncidents[idx].resolvedAt = new Date().toISOString();
      }
    }

    if (isMongoConnected()) {
      try {
        await RideBooking.updateMany(
          { $or: [{ bookingId: id }, { "sosAlert.status": "active" }] },
          {
            $set: {
              "sosAlert.status": status,
              "complaint.status": status,
              "lostItemReport.status": status === "resolved" ? "closed" : status,
              "accidentReport.status": status,
            },
          }
        );
      } catch (e) {}
    }

    return res.json({ success: true, message: `Safety incident ${id} marked as ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to resolve safety incident." });
  }
});

// ADMIN: Manual Driver Assignment / Reassignment
router.post(["/admin/rides/:id/assign-driver", "/:id/assign-driver"], requireAdmin, async (req: AuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({ error: "Driver ID is required for assignment." });
    }

    let driver: any = null;
    if (isMongoConnected()) {
      try {
        driver = await Driver.findById(driverId);
      } catch (e) {}
    }
    if (!driver) {
      driver = (memoryStore.drivers || []).find((d: any) => String(d._id) === String(driverId) || d.phone === driverId);
    }

    if (!driver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    const driverPayload = {
      driverId: String(driver._id),
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehicleNumber: driver.vehicleNumber,
      vehicleModel: driver.vehicleModel || "",
      rating: driver.rating || 5.0,
      photoUrl: driver.photoUrl || "",
      lat: driver.location?.coordinates?.[1] || 28.6139,
      lng: driver.location?.coordinates?.[0] || 77.209,
      locationUpdatedAt: new Date(),
    };

    let updatedRide: any = null;
    if (isMongoConnected()) {
      try {
        updatedRide = await RideBooking.findOneAndUpdate(
          { $or: [{ bookingId: id }, { _id: id }] },
          {
            driver: driverPayload,
            status: "arriving",
            acceptedAt: new Date(),
            updatedAt: new Date(),
          },
          { new: true }
        ).lean();
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        driver: driverPayload,
        status: "arriving",
        acceptedAt: new Date(),
      };
      if (!updatedRide) updatedRide = memoryStore.rides[memIdx];
    }

    return res.json({
      success: true,
      message: `Driver ${driver.name} assigned to ride ${id}.`,
      ride: updatedRide,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to assign driver." });
  }
});

/**
 * 6. GET /api/rides/:id
 * Polls active ride status, driver location, OTP, and progresses dispatch timeouts
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let ride = await findRide(id);

    if (!ride) {
      return res.status(404).json({ error: "Ride booking not found." });
    }

    ride = await progressDispatchIfNeeded(ride);

    const docObj = ride && typeof ride.toObject === "function" ? ride.toObject() : { ...ride };

    if (docObj.driver?.licenseNumber) {
      docObj.driver.licenseNumber = maskLicense(docObj.driver.licenseNumber);
    }

    return res.json({
      success: true,
      ride: docObj,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch ride status." });
  }
});

// =====================================================================
// MODULE 2D: RIDE WORKFLOW & STATUS TRANSITIONS
// =====================================================================

/**
 * Helper to update ride across Mongo and memory
 */

function buildRideLookupFilter(id: string): any {
  if (mongoose.isValidObjectId(id)) {
    return { $or: [{ bookingId: id }, { _id: id }] };
  }
  return { bookingId: id };
}

async function findRide(id: string): Promise<any> {
  if (isMongoConnected()) {
    try {
      const filter = buildRideLookupFilter(id);
      const doc = await RideBooking.findOne(filter);
      if (doc) return doc;
    } catch (e) {}
  }
  return (memoryStore.rides || []).find((r: any) => r.bookingId === id || r._id === id || String(r._id) === id) || null;
}

async function saveRideUpdates(id: string, updates: Partial<any>): Promise<any> {
  let updated: any = null;
  if (isMongoConnected()) {
    try {
      updated = await RideBooking.findOneAndUpdate(
        buildRideLookupFilter(id),
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
    } catch (e) {}
  }

  const memIdx = (memoryStore.rides || []).findIndex(
    (r: any) => r.bookingId === id || r._id === id
  );
  if (memIdx !== -1) {
    memoryStore.rides[memIdx] = {
      ...memoryStore.rides[memIdx],
      ...updates,
      updatedAt: new Date(),
    };
    if (!updated) updated = memoryStore.rides[memIdx];
  }

  return updated;
}

/**
 * 7. POST /api/rides/:id/driver-accept
 * Driver accepts the ride -> status becomes "accepted" and "arriving"
 */
router.post("/:id/driver-accept", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { driverId, driverName, driverPhone, vehicleNumber, vehicleModel, rating } = req.body;

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (!["requested", "no_driver_found", "searching"].includes(ride.status)) {
      return res.status(400).json({ error: `Cannot accept ride in '${ride.status}' status.` });
    }

    const assignedDriver = {
      driverId: driverId || `DRV-${Date.now().toString(36).toUpperCase()}`,
      name: driverName || "Rajesh Kumar",
      phone: driverPhone || "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      vehicleNumber: vehicleNumber || "DL 01 AB 4321",
      vehicleModel: vehicleModel || "Maruti Suzuki Dzire",
      rating: Number(rating) || 4.9,
      totalRides: 840,
      currentLocation: {
        lat: (ride.pickup?.lat || 28.6139) + 0.005,
        lng: (ride.pickup?.lng || 77.209) + 0.005,
      },
    };

    const updated = await saveRideUpdates(id, {
      status: "arriving",
      driver: assignedDriver,
      acceptedAt: new Date(),
      currentOfferDriverId: null,
      offerExpiresAt: null,
    });

    return res.json({
      success: true,
      message: "Ride accepted. Driver is arriving at pickup location.",
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to accept ride." });
  }
});

/**
 * 8. POST /api/rides/:id/driver-arrive
 * Driver arrives at pickup location -> status becomes "arrived"
 */
router.post("/:id/driver-arrive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (!["arriving", "accepted", "requested"].includes(ride.status)) {
      return res.status(400).json({ error: `Cannot mark arrival for ride in '${ride.status}' status.` });
    }

    const updated = await saveRideUpdates(id, {
      status: "arrived",
      arrivedAt: new Date(),
    });

    return res.json({
      success: true,
      message: "Driver has arrived at your pickup spot. Please share the 4-digit Ride OTP to start.",
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to mark arrival." });
  }
});

/**
 * 9. POST /api/rides/:id/verify-otp
 * Validates 4-digit ride OTP and transitions ride to "started" / "in_progress"
 */
router.post("/:id/verify-otp", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ error: "Ride verification OTP is required." });
    }

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (String(otp).trim() !== String(ride.rideOtp).trim()) {
      return res.status(400).json({ error: "Invalid Ride OTP. Please verify with passenger." });
    }

    const updated = await saveRideUpdates(id, {
      status: "in_progress",
      startedAt: new Date(),
    });

    return res.json({
      success: true,
      message: "Ride OTP verified successfully. Trip started!",
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
});

/**
 * 10. POST /api/rides/:id/arrive-destination
 * Driver marks arrival at destination
 */
router.post("/:id/arrive-destination", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    return res.json({
      success: true,
      message: "Arrived at destination. You can now complete the trip.",
      ride,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to mark destination arrival." });
  }
});

/**
 * 11. POST /api/rides/:id/complete
 * Completes ride, calculates actual distance, duration & waiting charges, generates final invoice
 */
router.post("/:id/complete", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actualDistanceKm, actualDurationMin, waitingMinutes = 0 } = req.body;

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    const finalDistance = Math.max(0.1, Number(actualDistanceKm) || ride.distanceKm || 6.4);
    const finalDuration = Math.max(5, Number(actualDurationMin) || ride.estimatedDurationMin || 18);
    const finalWait = Math.max(0, Number(waitingMinutes) || 0);

    const { pricing } = await getActiveRideSettings();

    const finalCalc = calculateRideFare({
      serviceType: ride.serviceType,
      distanceKm: finalDistance,
      actualDurationMin: finalDuration,
      waitingMinutes: finalWait,
      pickupAddress: ride.pickup?.address,
      destinationAddress: ride.destination?.address,
      promoCode: ride.fare?.promoCode,
      customPricing: pricing[ride.serviceType],
    });

    const updated = await saveRideUpdates(id, {
      status: "completed",
      paymentStatus: "pending",
      actualDistanceKm: finalDistance,
      actualDurationMin: finalDuration,
      waitingMinutes: finalWait,
      completedAt: new Date(),
      fare: {
        baseFare: finalCalc.baseFare,
        distanceFare: finalCalc.distanceFare,
        timeFare: finalCalc.timeFare,
        waitingFare: finalCalc.waitingFare,
        surgeMultiplier: finalCalc.surgeMultiplier,
        tollCharges: finalCalc.tollCharges,
        airportCharges: finalCalc.airportCharges,
        discountAmount: finalCalc.discountAmount,
        promoCode: finalCalc.promoCodeApplied,
        tax: finalCalc.tax,
        totalFare: finalCalc.totalFare,
        driverEarnings: finalCalc.driverEarnings,
        platformCommission: finalCalc.platformCommission,
      },
    });

    return res.json({
      success: true,
      message: "Trip completed successfully. Final invoice generated.",
      ride: updated,
      finalFare: finalCalc.totalFare,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to complete ride." });
  }
});

/**
 * 12. POST /api/rides/:id/pay
 * Payment settlement: Cash to driver, UPI Instant Pay (with generated UTR), Wallet, or Card
 */
router.post("/:id/pay", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethod = "cash", upiId } = req.body;

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    const validMethods = ["cash", "upi", "wallet", "card"];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : "cash";

    const upiReference =
      chosenMethod === "upi"
        ? `UPI/${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;

    const updated = await saveRideUpdates(id, {
      paymentStatus: "completed",
      paymentMethod: chosenMethod,
      upiReference,
      paidAt: new Date(),
    });

    // Credit driver earnings if driver registered
    if (ride.driver?.driverId) {
      if (isMongoConnected()) {
        try {
          await Driver.findByIdAndUpdate(ride.driver.driverId, {
            $inc: {
              earningsToday: ride.fare?.driverEarnings || 120,
              totalEarnings: ride.fare?.driverEarnings || 120,
              totalRides: 1,
            },
          });
        } catch (e) {}
      }
    }

    return res.json({
      success: true,
      message:
        chosenMethod === "cash"
          ? "Payment received by driver partner in cash."
          : `₹${ride.fare?.totalFare} paid successfully via ${chosenMethod.toUpperCase()}.`,
      ride: updated,
      upiReference,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to process ride payment." });
  }
});

/**
 * 13. GET /api/rides/:id/receipt
 * Digital receipt generation with tax invoice breakdown
 */
router.get("/:id/receipt", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    const receipt = {
      invoiceNumber: ride.invoiceNumber || `INV-${ride.bookingId}`,
      bookingId: ride.bookingId,
      date: ride.completedAt || ride.createdAt,
      customer: {
        name: ride.customerName,
        phone: ride.customerPhone,
        email: ride.customerEmail,
      },
      driver: {
        name: ride.driver?.name || "Driver Partner",
        vehicleNumber: ride.driver?.vehicleNumber || "DL 01 AB 1234",
        vehicleModel: ride.driver?.vehicleModel || "Standard City Cab",
        serviceType: ride.serviceType,
      },
      trip: {
        pickup: ride.pickup?.address,
        destination: ride.destination?.address,
        distanceKm: ride.actualDistanceKm || ride.distanceKm,
        durationMinutes: ride.actualDurationMin || ride.estimatedDurationMin,
        waitingMinutes: ride.waitingMinutes || 0,
      },
      breakdown: {
        baseFare: ride.fare?.baseFare || 50,
        distanceFare: ride.fare?.distanceFare || 80,
        timeFare: ride.fare?.timeFare || 25,
        waitingFare: ride.fare?.waitingFare || 0,
        surgeMultiplier: ride.fare?.surgeMultiplier || 1.0,
        tollCharges: ride.fare?.tollCharges || 0,
        airportCharges: ride.fare?.airportCharges || 0,
        discountAmount: ride.fare?.discountAmount || 0,
        promoCode: ride.fare?.promoCode,
        gstRate: "5% IGST",
        gstAmount: ride.fare?.tax || 8,
        safetyFee: 5,
        totalFare: ride.fare?.totalFare || 160,
      },
      payment: {
        method: ride.paymentMethod || "cash",
        status: ride.paymentStatus || "completed",
        reference: ride.upiReference,
        paidAt: ride.paidAt || ride.completedAt,
      },
      platform: {
        name: "ALIKE-ND Rides",
        gstin: "07AAACA1234E1Z5",
        supportHelpline: "+91 11-4000-RIDE",
        website: "https://alike.nd/rides",
      },
    };

    return res.json({ success: true, receipt });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate receipt." });
  }
});

/**
 * 14. POST /api/rides/:id/cancel
 * Cancel ride with categorized reason
 */
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = "Customer requested cancellation", cancelledBy = "customer" } = req.body;

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (["completed", "cancelled"].includes(ride.status)) {
      return res.status(400).json({ error: `Cannot cancel ride in '${ride.status}' status.` });
    }

    const updated = await saveRideUpdates(id, {
      status: "cancelled",
      cancellationReason: reason,
      cancelledBy: ["customer", "driver", "system"].includes(cancelledBy) ? cancelledBy : "customer",
    });

    return res.json({
      success: true,
      message: "Ride booking cancelled successfully.",
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to cancel ride." });
  }
});

/**
 * 15. POST /api/rides/:id/passenger-no-show
 * Driver marks passenger no show
 */
router.post("/:id/passenger-no-show", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    const updated = await saveRideUpdates(id, {
      status: "passenger_no_show",
      passengerNoShowTime: new Date(),
      cancellationReason: "Passenger did not arrive after 5 minutes at pickup point.",
    });

    return res.json({
      success: true,
      message: "Passenger no-show recorded. Ride released.",
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to record passenger no show." });
  }
});

/**
 * 16. POST /api/rides/:id/dispute
 * Customer or driver files fare dispute
 */
router.post("/:id/dispute", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, claimedRefund, notes } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Dispute reason is required." });
    }

    const disputeRecord = {
      disputeId: `DSP-${Date.now().toString(36).toUpperCase()}`,
      bookingId: id,
      status: "submitted",
      reason: String(reason).trim(),
      claimedRefund: Number(claimedRefund) || 0,
      notes: notes ? String(notes).trim() : "",
      submittedAt: new Date(),
    };

    await saveRideUpdates(id, {
      dispute: disputeRecord,
    });

    memoryStore.rideDisputes.unshift(disputeRecord);

    return res.json({
      success: true,
      message: "Fare dispute submitted. Our resolution team will audit the GPS route within 24 hours.",
      dispute: disputeRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to submit dispute." });
  }
});

/**
 * 17. GET /api/rides/:id/dispute
 * Checks dispute status
 */
router.get("/:id/dispute", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    return res.json({
      success: true,
      dispute: ride.dispute || { status: "none" },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch dispute." });
  }
});

/**
 * 18. POST /api/rides/:id/support
 * Customer support escalation for ride
 */
router.post("/:id/support", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { issue } = req.body;

    const ticket = {
      id: `SUP-${Date.now().toString(36).toUpperCase()}`,
      issue: issue || "General customer ride inquiry",
      status: "open",
      createdAt: new Date(),
    };

    const updated = await saveRideUpdates(id, {
      status: "support_required",
      supportTicket: ticket,
    });

    return res.json({
      success: true,
      message: "Support ticket created. Safety & customer desk notified.",
      ticket,
      ride: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to request support." });
  }
});

/**
 * 19. POST /api/rides/:id/rate
 * Rate completed ride
 */
router.post("/:id/rate", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5 stars." });
    }

    const updated = await saveRideUpdates(id, {
      rating: numRating,
      feedback: feedback ? String(feedback).trim() : "",
    });

    return res.json({ success: true, message: "Thank you for rating your driver partner!", ride: updated });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to submit rating." });
  }
});

/**
 * 20. POST /api/rides/:id/progress
 * Interactive helper to advance simulation states
 */
router.post("/:id/progress", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { targetStatus } = req.body;

    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    const nextMap: Record<string, RideStatus> = {
      requested: "arriving",
      searching: "arriving",
      driver_assigned: "arriving",
      accepted: "arrived",
      arriving: "arrived",
      arrived: "in_progress",
      started: "in_progress",
      in_progress: "completed",
    };

    const nextState: RideStatus = targetStatus || nextMap[ride.status] || "completed";

    // If assigning driver
    let driverData = ride.driver;
    if (!driverData && ["arriving", "arrived", "in_progress"].includes(nextState)) {
      driverData = {
        driverId: "DRV-TEST-99",
        name: "Suresh Sharma",
        phone: "+91 98112 34567",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
        vehicleNumber: "DL 02 CD 8821",
        vehicleModel: "Hyundai Aura / WagonR",
        rating: 4.85,
        totalRides: 412,
        currentLocation: {
          lat: (ride.pickup?.lat || 28.6139) + 0.002,
          lng: (ride.pickup?.lng || 77.209) + 0.002,
        },
      };
    }

    const updated = await saveRideUpdates(id, {
      status: nextState,
      driver: driverData,
      ...(nextState === "completed" ? { completedAt: new Date(), paymentStatus: "pending" } : {}),
    });

    return res.json({ success: true, ride: updated });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to progress ride." });
  }
});

/**
 * 21. POST /api/rides/:id/sos
 * Passenger triggers Emergency SOS
 */
router.post("/:id/sos", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng, notes } = req.body;

    const ride = await findRide(id);
    if (!ride) return res.status(404).json({ error: "Ride booking not found." });

    const sosIncident = {
      incidentId: `SOS-${Date.now().toString(36).toUpperCase()}`,
      rideId: ride.bookingId,
      type: "sos",
      triggeredBy: "customer",
      customerName: ride.customerName,
      customerPhone: ride.customerPhone,
      driverName: ride.driver?.name,
      driverPhone: ride.driver?.phone,
      vehicleNumber: ride.driver?.vehicleNumber,
      location: {
        lat: isValidLat(lat) ? Number(lat) : ride.driver?.lat || ride.pickup?.lat || 28.6139,
        lng: isValidLng(lng) ? Number(lng) : ride.driver?.lng || ride.pickup?.lng || 77.209,
      },
      status: "active",
      notes: notes || "Passenger triggered Emergency SOS from in-app safety button",
      createdAt: new Date().toISOString(),
    };

    await saveRideUpdates(id, {
      sosAlert: {
        triggeredBy: "customer",
        triggeredAt: new Date(),
        location: sosIncident.location,
        status: "active",
        notes: sosIncident.notes,
      },
    });

    if (!memoryStore.safetyIncidents) memoryStore.safetyIncidents = [];
    memoryStore.safetyIncidents.unshift(sosIncident);

    return res.json({
      success: true,
      message: "EMERGENCY SOS BROADCASTED! Safety Control Team notified. Dial 112 if immediate police assistance is required.",
      incident: sosIncident,
      emergencyContacts: {
        police: "112",
        ambulance: "102",
        womenHelpline: "1091",
        alikeSafetyDesk: "+91 11-4000-RIDE",
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to trigger SOS." });
  }
});

/**
 * 22. POST /api/rides/:id/share
 * Generates secure shareable trip link and preview details for trusted contacts
 */
router.post("/:id/share", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ride = await findRide(id);

    if (!ride) return res.status(404).json({ error: "Ride not found." });

    let token = ride.shareableTripToken;
    if (!token) {
      token = `TRIP-${ride.bookingId}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      await saveRideUpdates(id, { shareableTripToken: token });
    }

    const shareUrl = `${req.protocol}://${req.get("host")}/rides/track/${token}`;
    const message = `I am on an Alike Ride in ${ride.driver?.vehicleModel || ride.serviceType} (${ride.driver?.vehicleNumber || "Assigned Vehicle"}). Track my live trip safely here: ${shareUrl}`;

    return res.json({
      success: true,
      token,
      shareUrl,
      whatsappText: encodeURIComponent(message),
      message,
      driverName: ride.driver?.name || "Captain Assigned",
      vehicleNumber: ride.driver?.vehicleNumber || "Pending",
      destination: ride.destination?.address,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate share link." });
  }
});

/**
 * 23. POST /api/rides/:id/complaint
 * Passenger files a formal ride or safety complaint
 */
router.post("/:id/complaint", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;

    const ride = await findRide(id);
    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Please provide details about the issue." });
    }

    const complaintDoc = {
      incidentId: `CMP-${Date.now().toString(36).toUpperCase()}`,
      rideId: ride.bookingId,
      type: "complaint",
      category: category || "general",
      description: description.trim(),
      customerName: ride.customerName,
      customerPhone: ride.customerPhone,
      driverName: ride.driver?.name,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    await saveRideUpdates(id, {
      complaint: {
        category: complaintDoc.category,
        description: complaintDoc.description,
        filedAt: new Date(),
        filedBy: "customer",
        status: "open",
      },
    });

    if (!memoryStore.safetyIncidents) memoryStore.safetyIncidents = [];
    memoryStore.safetyIncidents.unshift(complaintDoc);

    return res.json({
      success: true,
      message: "Complaint registered. Our safety and driver relations team will audit within 24 hours.",
      complaint: complaintDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to register complaint." });
  }
});

/**
 * 24. POST /api/rides/:id/lost-item
 * Passenger reports a lost item left behind in the vehicle
 */
router.post("/:id/lost-item", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itemCategory, description, contactPhone } = req.body;

    const ride = await findRide(id);
    if (!ride) return res.status(404).json({ error: "Ride not found." });

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Please provide a description of the lost item." });
    }

    const lostItemDoc = {
      incidentId: `LST-${Date.now().toString(36).toUpperCase()}`,
      rideId: ride.bookingId,
      type: "lost_item",
      itemCategory: itemCategory || "Personal Item",
      description: description.trim(),
      contactPhone: contactPhone || ride.customerPhone,
      customerName: ride.customerName,
      driverName: ride.driver?.name,
      driverPhone: ride.driver?.phone,
      status: "reported",
      createdAt: new Date().toISOString(),
    };

    await saveRideUpdates(id, {
      lostItemReport: {
        itemCategory: lostItemDoc.itemCategory,
        description: lostItemDoc.description,
        contactPhone: lostItemDoc.contactPhone,
        reportedAt: new Date(),
        status: "reported",
      },
    });

    if (!memoryStore.safetyIncidents) memoryStore.safetyIncidents = [];
    memoryStore.safetyIncidents.unshift(lostItemDoc);

    return res.json({
      success: true,
      message: "Lost item report registered. We have notified Captain to check vehicle.",
      lostItem: lostItemDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to file lost item report." });
  }
});

export default router;
