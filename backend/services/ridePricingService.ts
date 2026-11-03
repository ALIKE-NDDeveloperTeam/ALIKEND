/**
 * Ride Pricing & Vehicle Category Engine
 * Implements Module 2A, 2C, and 2D fare calculation rules
 */

export interface VehicleCategoryConfig {
  key: string;
  name: string;
  category: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  etaMultiplier: number;
  description: string;
  icon: "bike" | "auto" | "car_mini" | "car_sedan" | "car_suv" | "car_premium" | "car_xl" | "car_green";
  badge?: string;
  enabled: boolean;
}

export const APPROVED_VEHICLE_CATEGORIES: Record<string, VehicleCategoryConfig> = {
  bike: {
    key: "bike",
    name: "Alike Bike Taxi",
    category: "Moto Taxi",
    capacity: 1,
    baseFare: 25,
    perKmRate: 9,
    perMinuteRate: 1.5,
    minimumFare: 30,
    etaMultiplier: 2.0,
    description: "Fastest way through city traffic. Sanitized helmet provided.",
    icon: "bike",
    badge: "FASTEST",
    enabled: true,
  },
  auto: {
    key: "auto",
    name: "Alike Auto",
    category: "Auto Rickshaw",
    capacity: 3,
    baseFare: 35,
    perKmRate: 12,
    perMinuteRate: 2.0,
    minimumFare: 45,
    etaMultiplier: 2.6,
    description: "Affordable iconic 3-wheeler with direct doorstep pickup.",
    icon: "auto",
    badge: "POPULAR",
    enabled: true,
  },
  car_mini: {
    key: "car_mini",
    name: "Alike Mini",
    category: "AC Hatchback",
    capacity: 4,
    baseFare: 55,
    perKmRate: 15,
    perMinuteRate: 2.2,
    minimumFare: 75,
    etaMultiplier: 3.0,
    description: "Compact air-conditioned car for pocket-friendly everyday city rides.",
    icon: "car_mini",
    badge: "VALUE",
    enabled: true,
  },
  car_sedan: {
    key: "car_sedan",
    name: "Alike Prime Sedan",
    category: "Executive Sedan",
    capacity: 4,
    baseFare: 75,
    perKmRate: 19,
    perMinuteRate: 2.8,
    minimumFare: 95,
    etaMultiplier: 3.0,
    description: "Spacious top-rated sedans (Dzire, Etios) with extra luggage boot space.",
    icon: "car_sedan",
    badge: "COMFORT",
    enabled: true,
  },
  car_suv: {
    key: "car_suv",
    name: "Alike Prime SUV",
    category: "Spacious 6-Seater",
    capacity: 6,
    baseFare: 110,
    perKmRate: 24,
    perMinuteRate: 3.5,
    minimumFare: 140,
    etaMultiplier: 3.2,
    description: "Powerful 6-seater SUVs (Ertiga, Carens) with ample legroom for group travel.",
    icon: "car_suv",
    badge: "6 SEATER",
    enabled: true,
  },
  car_premium: {
    key: "car_premium",
    name: "Alike Luxury / Executive",
    category: "Luxury Sedan",
    capacity: 4,
    baseFare: 175,
    perKmRate: 32,
    perMinuteRate: 4.5,
    minimumFare: 220,
    etaMultiplier: 3.2,
    description: "Chauffeured premium sedans with top 1% rated captains & in-car amenities.",
    icon: "car_premium",
    badge: "PREMIUM",
    enabled: true,
  },
  car_xl: {
    key: "car_xl",
    name: "Alike XL (7-Seater)",
    category: "Family Van / XL",
    capacity: 7,
    baseFare: 140,
    perKmRate: 28,
    perMinuteRate: 4.0,
    minimumFare: 180,
    etaMultiplier: 3.4,
    description: "Roomy 7-seater (Innova Crysta) designed for family outings and airport luggage.",
    icon: "car_xl",
    badge: "7 SEATER",
    enabled: true,
  },
  car_green: {
    key: "car_green",
    name: "Alike Green (EV Cab)",
    category: "100% Electric",
    capacity: 4,
    baseFare: 65,
    perKmRate: 17,
    perMinuteRate: 2.4,
    minimumFare: 85,
    etaMultiplier: 3.0,
    description: "Zero emission, whisper-quiet electric car ride for a sustainable city.",
    icon: "car_green",
    badge: "ECO FRIENDLY",
    enabled: true,
  },
  // Backward compatibility alias: "cab" maps to car_sedan
  cab: {
    key: "cab",
    name: "Alike Cab / Sedan",
    category: "AC Cab",
    capacity: 4,
    baseFare: 65,
    perKmRate: 18,
    perMinuteRate: 2.5,
    minimumFare: 90,
    etaMultiplier: 3.0,
    description: "Comfortable air-conditioned private car.",
    icon: "car_sedan",
    enabled: true,
  },
};

export interface PromoCodeDefinition {
  code: string;
  discountType: "flat" | "percentage";
  amount: number;
  maxDiscount?: number;
  minFare: number;
  description: string;
  applicableServices?: string[];
}

export const VALID_PROMO_CODES: Record<string, PromoCodeDefinition> = {
  ALIKE50: {
    code: "ALIKE50",
    discountType: "flat",
    amount: 50,
    minFare: 100,
    description: "₹50 flat discount on rides above ₹100",
  },
  FIRSTFREE: {
    code: "FIRSTFREE",
    discountType: "flat",
    amount: 75,
    minFare: 75,
    description: "₹75 off on your inaugural Alike Ride",
  },
  FESTIVE100: {
    code: "FESTIVE100",
    discountType: "flat",
    amount: 100,
    minFare: 200,
    applicableServices: ["car_sedan", "car_suv", "car_premium", "car_xl", "cab"],
    description: "₹100 festive festival discount on Sedan, SUV and Premium rides",
  },
  METRO20: {
    code: "METRO20",
    discountType: "percentage",
    amount: 20,
    maxDiscount: 40,
    minFare: 50,
    applicableServices: ["bike", "auto"],
    description: "20% off up to ₹40 on first & last-mile Bike and Auto commutes",
  },
};

export interface FareCalculationInput {
  serviceType: string;
  distanceKm: number;
  estimatedMinutes?: number;
  actualDurationMin?: number;
  waitingMinutes?: number;
  pickupAddress?: string;
  destinationAddress?: string;
  promoCode?: string;
  customPricing?: {
    baseFare?: number;
    perKmRate?: number;
    perMinuteRate?: number;
    minimumFare?: number;
  };
  isRushHour?: boolean;
}

export interface FareCalculationResult {
  serviceType: string;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  waitingFare: number;
  surgeMultiplier: number;
  tollCharges: number;
  airportCharges: number;
  subtotal: number;
  discountAmount: number;
  promoCodeApplied?: string;
  tax: number;
  safetyFee: number;
  totalFare: number;
  driverEarnings: number;
  platformCommission: number;
  estimatedDurationMin: number;
}

/**
 * Calculates complete itemized fare with full breakdown
 */
export function calculateRideFare(input: FareCalculationInput): FareCalculationResult {
  const normType = input.serviceType === "cab" ? "car_sedan" : input.serviceType;
  const cfg = APPROVED_VEHICLE_CATEGORIES[normType] || APPROVED_VEHICLE_CATEGORIES.auto;

  const baseFare = input.customPricing?.baseFare ?? cfg.baseFare;
  const perKmRate = input.customPricing?.perKmRate ?? cfg.perKmRate;
  const perMinuteRate = input.customPricing?.perMinuteRate ?? cfg.perMinuteRate;
  const minimumFare = input.customPricing?.minimumFare ?? cfg.minimumFare;

  const distance = Math.max(0.1, Number(input.distanceKm) || 5.0);
  const durationMin = input.actualDurationMin ?? Math.max(5, Math.round(distance * cfg.etaMultiplier));

  // Distance Fare
  const distanceFare = Math.round(distance * perKmRate);

  // Time-based fare (travel time pricing)
  const timeFare = Math.round(durationMin * perMinuteRate);

  // Waiting-time charges: 3 minutes grace period free; then ₹2.50/min
  const waitMin = Math.max(0, Number(input.waitingMinutes) || 0);
  const billableWait = Math.max(0, waitMin - 3);
  const waitingFare = Math.round(billableWait * 2.5);

  // Peak-demand pricing (Rush hours: 8-10 AM and 6-9 PM)
  let isRush = Boolean(input.isRushHour);
  if (input.isRushHour === undefined) {
    const hour = new Date().getHours();
    isRush = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21);
  }
  const surgeMultiplier = isRush ? 1.2 : 1.0;

  // Toll and Airport Surcharges
  let tollCharges = 0;
  let airportCharges = 0;

  const addressesJoined = `${input.pickupAddress || ""} ${input.destinationAddress || ""}`.toLowerCase();
  if (addressesJoined.includes("airport") || addressesJoined.includes("terminal 3") || addressesJoined.includes("t3") || addressesJoined.includes("t1")) {
    airportCharges = 80; // Standard NCR airport commercial vehicle entry / toll
  }
  if (addressesJoined.includes("toll") || addressesJoined.includes("expressway") || addressesJoined.includes("dnd") || addressesJoined.includes("eastern peripheral")) {
    tollCharges = 50; // Standard expressway toll pass-through
  }

  // Calculate gross before discount and tax
  const rideCoreFare = Math.round((baseFare + distanceFare + timeFare) * surgeMultiplier) + waitingFare;
  const subtotalBeforeMin = rideCoreFare + tollCharges + airportCharges;
  const subtotal = Math.max(minimumFare, subtotalBeforeMin);

  // Promo discount calculation
  let discountAmount = 0;
  let promoCodeApplied: string | undefined = undefined;

  if (input.promoCode) {
    const cleanCode = input.promoCode.trim().toUpperCase();
    const promo = VALID_PROMO_CODES[cleanCode];
    if (promo && subtotal >= promo.minFare) {
      if (!promo.applicableServices || promo.applicableServices.includes(input.serviceType) || promo.applicableServices.includes(normType)) {
        if (promo.discountType === "flat") {
          discountAmount = Math.min(subtotal - 30, promo.amount); // Keep minimum ₹30 payable
        } else if (promo.discountType === "percentage") {
          const rawPct = Math.round((subtotal * promo.amount) / 100);
          discountAmount = Math.min(rawPct, promo.maxDiscount || rawPct);
        }
        promoCodeApplied = cleanCode;
      }
    }
  }

  const fareAfterDiscount = Math.max(30, subtotal - discountAmount);

  // Applicable taxes: 5% GST on passenger transport + ₹5 platform safety fee
  const tax = Math.round(fareAfterDiscount * 0.05);
  const safetyFee = 5;
  const totalFare = fareAfterDiscount + tax + safetyFee;

  // Driver Earnings: Driver receives 85% of core ride fare + 100% of tolls & airport charges
  const driverEarnings = Math.round(rideCoreFare * 0.85) + tollCharges + airportCharges;
  const platformCommission = Math.max(0, totalFare - driverEarnings - tax);

  return {
    serviceType: input.serviceType,
    baseFare,
    distanceFare,
    timeFare,
    waitingFare,
    surgeMultiplier,
    tollCharges,
    airportCharges,
    subtotal,
    discountAmount,
    promoCodeApplied,
    tax,
    safetyFee,
    totalFare,
    driverEarnings,
    platformCommission,
    estimatedDurationMin: durationMin,
  };
}
