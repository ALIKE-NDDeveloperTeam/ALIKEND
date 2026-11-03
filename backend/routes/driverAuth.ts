import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Driver, { IDriver, VehicleCategory } from "../models/Driver";
import RideBooking, { IRideBooking } from "../models/RideBooking";
import { isMongoConnected, memoryStore } from "../store";
import { getJwtSecret } from "../config/jwt";

const router = Router();

// Rate limiter for driver auth actions
const driverAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: "Too many authentication requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  keyGenerator: (req) => {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.trim()) {
      return xff.split(",")[0].trim();
    }
    return req.ip || "127.0.0.1";
  },
});

export interface DriverAuthedRequest extends Request {
  driverId?: string;
  driver?: any;
}

export const VALID_VEHICLE_CATEGORIES: VehicleCategory[] = [
  "bike",
  "auto",
  "cab",
  "car_mini",
  "car_sedan",
  "car_suv",
  "car_premium",
  "car_xl",
  "car_green",
];

export const DEFAULT_CAPACITY: Record<string, number> = {
  bike: 1,
  auto: 3,
  cab: 4,
  car_mini: 4,
  car_sedan: 4,
  car_green: 4,
  car_premium: 4,
  car_suv: 6,
  car_xl: 7,
};

// Mask license number for privacy (e.g. DL-*****1234)
export function maskLicense(license: string): string {
  if (!license) return "DL-*****";
  const clean = String(license).trim();
  if (clean.length <= 6) return clean.slice(0, 2) + "***" + clean.slice(-2);
  return clean.slice(0, 4) + "*****" + clean.slice(-4);
}

// Mask Aadhaar/ID number (e.g. XXXX-XXXX-1234)
export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar) return "";
  const clean = String(aadhaar).replace(/\D/g, "");
  if (clean.length < 4) return "XXXX-XXXX-****";
  return `XXXX-XXXX-${clean.slice(-4)}`;
}

// Mask bank account number (e.g. ********9876)
export function maskAccount(acc: string): string {
  if (!acc) return "";
  const clean = String(acc).trim();
  if (clean.length <= 4) return clean;
  return "*".repeat(clean.length - 4) + clean.slice(-4);
}

// Coordinate validation helper
export function isValidLat(lat: any): boolean {
  const n = Number(lat);
  return typeof n === "number" && !isNaN(n) && n >= -90 && n <= 90;
}

export function isValidLng(lng: any): boolean {
  const n = Number(lng);
  return typeof n === "number" && !isNaN(n) && n >= -180 && n <= 180;
}

// Compute document expiry alerts
export function computeDocumentExpiryAlerts(driver: any) {
  const alerts: Array<{
    docType: string;
    expiryDate: string;
    status: "expired" | "expiring_soon" | "valid";
    daysRemaining: number;
    message: string;
  }> = [];

  const now = Date.now();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const checkDoc = (label: string, dateVal?: string | Date) => {
    if (!dateVal) return;
    const expiry = new Date(dateVal).getTime();
    if (isNaN(expiry)) return;

    const diffDays = Math.ceil((expiry - now) / MS_PER_DAY);
    if (diffDays <= 0) {
      alerts.push({
        docType: label,
        expiryDate: new Date(dateVal).toISOString(),
        status: "expired",
        daysRemaining: diffDays,
        message: `${label} expired ${Math.abs(diffDays)} day(s) ago. Renew immediately to maintain active status.`,
      });
    } else if (diffDays <= 30) {
      alerts.push({
        docType: label,
        expiryDate: new Date(dateVal).toISOString(),
        status: "expiring_soon",
        daysRemaining: diffDays,
        message: `${label} expires in ${diffDays} day(s). Please submit renewal document soon.`,
      });
    } else {
      alerts.push({
        docType: label,
        expiryDate: new Date(dateVal).toISOString(),
        status: "valid",
        daysRemaining: diffDays,
        message: `${label} is valid.`,
      });
    }
  };

  checkDoc("Commercial Driving Licence", driver.licenseExpiryDate);
  checkDoc("Vehicle Insurance Policy", driver.insuranceExpiryDate);
  checkDoc("Commercial Permit / Fitness Certificate", driver.permitExpiryDate);

  return alerts;
}

// Sanitize driver doc for client return
function sanitizeDriver(d: any) {
  const obj = d && typeof d.toObject === "function" ? d.toObject() : { ...d };
  delete obj.passwordHash;
  delete obj.loginOtp;
  delete obj.loginOtpExpiresAt;

  return {
    ...obj,
    licenseNumberMasked: maskLicense(obj.licenseNumber),
    aadhaarNumberMasked: maskAadhaar(obj.aadhaarNumberMasked || ""),
    bankDetails: obj.bankDetails
      ? {
          accountNumberMasked: maskAccount(obj.bankDetails.accountNumberMasked || ""),
          ifscCode: obj.bankDetails.ifscCode || "",
          bankName: obj.bankDetails.bankName || "",
          upiId: obj.bankDetails.upiId || "",
        }
      : undefined,
    documentExpiryAlerts: computeDocumentExpiryAlerts(obj),
  };
}

// Require Driver Authentication middleware
export async function requireDriverAuth(req: DriverAuthedRequest, res: Response, next: NextFunction) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(503).json({ success: false, error: "Authentication service misconfigured" });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Authorization required: Missing Bearer token" });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, secret) as any;
    if (!payload || payload.role !== "driver" || !payload.driverId) {
      return res.status(403).json({ success: false, error: "Access denied: Driver credentials required." });
    }

    req.driverId = String(payload.driverId);

    // Look up in MongoDB or memoryStore
    let driverDoc: any = null;
    if (isMongoConnected()) {
      try {
        driverDoc = await Driver.findById(payload.driverId);
      } catch (e) {}
    }

    if (!driverDoc) {
      driverDoc = (memoryStore.drivers || []).find((d: any) => String(d._id) === String(payload.driverId));
    }

    if (!driverDoc) {
      return res.status(404).json({ success: false, error: "Driver account not found." });
    }

    if (driverDoc.status !== "approved") {
      return res.status(403).json({
        success: false,
        error: `Driver account is ${driverDoc.status}. Only admin-approved drivers may access this portal.`,
      });
    }

    req.driver = driverDoc;
    return next();
  } catch (err: any) {
    return res.status(401).json({ success: false, error: "Driver session expired or invalid. Please sign in again." });
  }
}

/**
 * 1. POST /api/driver/register
 * Driver registration - defaults to status 'pending' (requires Admin approval)
 */
router.post("/register", driverAuthLimiter, async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      vehicleType,
      vehicleNumber,
      vehicleModel,
      seatingCapacity,
      licenseNumber,
      licenseExpiryDate,
      licenseDocUrl,
      aadhaarNumber,
      aadhaarDocUrl,
      rcNumber,
      rcDocUrl,
      insurancePolicyNumber,
      insuranceExpiryDate,
      insuranceDocUrl,
      permitNumber,
      permitExpiryDate,
      permitDocUrl,
      photoUrl,
      bankDetails,
    } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: "Full name is required (min 2 characters)." });
    }

    const cleanPhone = String(phone || "").trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: "Valid 10+ digit phone number is required." });
    }

    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const vType = (vehicleType || "auto").toLowerCase();
    if (!VALID_VEHICLE_CATEGORIES.includes(vType as VehicleCategory)) {
      return res.status(400).json({
        error: `Vehicle type must be one of: ${VALID_VEHICLE_CATEGORIES.join(", ")}`,
      });
    }

    if (!vehicleNumber || !vehicleNumber.trim()) {
      return res.status(400).json({ error: "Vehicle registration plate number is required." });
    }

    if (!licenseNumber || !licenseNumber.trim()) {
      return res.status(400).json({ error: "Commercial driving license number is required." });
    }

    // Check existing phone
    if (isMongoConnected()) {
      try {
        const existing = await Driver.findOne({ phone: cleanPhone });
        if (existing) {
          return res.status(409).json({ error: "A driver account with this phone number already exists." });
        }
      } catch (e) {}
    }

    const memExisting = (memoryStore.drivers || []).find((d: any) => d.phone === cleanPhone);
    if (memExisting) {
      return res.status(409).json({ error: "A driver account with this phone number already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const capacity = Number(seatingCapacity) || DEFAULT_CAPACITY[vType] || 4;

    const newDriverData: any = {
      name: name.trim(),
      phone: cleanPhone,
      email: email ? String(email).trim().toLowerCase() : undefined,
      passwordHash,
      photoUrl: photoUrl || "",
      vehicleType: vType as VehicleCategory,
      vehicleNumber: vehicleNumber.trim().toUpperCase(),
      vehicleModel: vehicleModel ? String(vehicleModel).trim() : "",
      seatingCapacity: capacity,

      licenseNumber: licenseNumber.trim().toUpperCase(),
      licenseExpiryDate: licenseExpiryDate ? new Date(licenseExpiryDate) : undefined,
      licenseDocUrl: licenseDocUrl || "",
      licenseStatus: "pending",

      aadhaarNumberMasked: aadhaarNumber ? maskAadhaar(aadhaarNumber) : "",
      aadhaarDocUrl: aadhaarDocUrl || "",
      identityStatus: aadhaarNumber ? "pending" : "pending",

      rcNumber: rcNumber ? String(rcNumber).trim().toUpperCase() : vehicleNumber.trim().toUpperCase(),
      rcDocUrl: rcDocUrl || "",
      rcStatus: "pending",

      insurancePolicyNumber: insurancePolicyNumber ? String(insurancePolicyNumber).trim() : "",
      insuranceExpiryDate: insuranceExpiryDate ? new Date(insuranceExpiryDate) : undefined,
      insuranceDocUrl: insuranceDocUrl || "",
      insuranceStatus: insurancePolicyNumber ? "pending" : "pending",

      permitNumber: permitNumber ? String(permitNumber).trim() : "",
      permitExpiryDate: permitExpiryDate ? new Date(permitExpiryDate) : undefined,
      permitDocUrl: permitDocUrl || "",
      permitStatus: permitNumber ? "pending" : "pending",

      bankDetails: bankDetails
        ? {
            accountNumberMasked: bankDetails.accountNumber ? maskAccount(bankDetails.accountNumber) : "",
            ifscCode: bankDetails.ifscCode ? String(bankDetails.ifscCode).trim().toUpperCase() : "",
            bankName: bankDetails.bankName ? String(bankDetails.bankName).trim() : "",
            upiId: bankDetails.upiId ? String(bankDetails.upiId).trim().toLowerCase() : "",
          }
        : undefined,

      status: "pending" as const,
      isOnline: false,
      location: {
        type: "Point" as const,
        coordinates: [77.209, 28.6139] as [number, number],
      },
      locationUpdatedAt: new Date(),
      rating: 5.0,
      totalRides: 0,
      earningsToday: 0,
      totalEarnings: 0,
      createdAt: new Date(),
    };

    let createdDoc: any = null;
    if (isMongoConnected()) {
      try {
        createdDoc = await Driver.create(newDriverData);
      } catch (err: any) {}
    }

    const finalDriver = createdDoc ? createdDoc.toObject() : { ...newDriverData, _id: `drv_${Date.now()}` };
    memoryStore.drivers.unshift(finalDriver);

    return res.status(201).json({
      success: true,
      message: "Driver application submitted successfully! Your documents are currently under admin review.",
      driver: sanitizeDriver(finalDriver),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to register driver." });
  }
});

/**
 * 2. POST /api/driver/send-otp
 * Generates and sends a 6-digit login/verification OTP
 */
router.post("/send-otp", driverAuthLimiter, async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    const cleanPhone = String(phone || "").trim();

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: "Valid 10+ digit phone number is required." });
    }

    let driver: any = null;
    if (isMongoConnected()) {
      try {
        driver = await Driver.findOne({ phone: cleanPhone });
      } catch (e) {}
    }
    if (!driver) {
      driver = (memoryStore.drivers || []).find((d: any) => d.phone === cleanPhone);
    }

    if (!driver) {
      return res.status(404).json({ error: "No driver account found with this phone number." });
    }

    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (isMongoConnected()) {
      try {
        await Driver.findByIdAndUpdate(driver._id, {
          loginOtp: otp,
          loginOtpExpiresAt: expiresAt,
        });
      } catch (e) {}
    }

    const memIdx = (memoryStore.drivers || []).findIndex((d: any) => d.phone === cleanPhone);
    if (memIdx !== -1) {
      memoryStore.drivers[memIdx].loginOtp = otp;
      memoryStore.drivers[memIdx].loginOtpExpiresAt = expiresAt;
    }

    return res.json({
      success: true,
      message: "6-digit OTP sent to your registered mobile number.",
      debugOtp: otp, // In AI Studio test mode to allow seamless verification
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to send OTP." });
  }
});

/**
 * 3. POST /api/driver/verify-otp
 * Verifies 6-digit OTP and logs in driver
 */
router.post("/verify-otp", driverAuthLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = String(phone || "").trim();
    const cleanOtp = String(otp || "").trim();

    if (!cleanPhone || !cleanOtp) {
      return res.status(400).json({ error: "Phone number and 6-digit OTP are required." });
    }

    let driver: any = null;
    if (isMongoConnected()) {
      try {
        driver = await Driver.findOne({ phone: cleanPhone });
      } catch (e) {}
    }
    if (!driver) {
      driver = (memoryStore.drivers || []).find((d: any) => d.phone === cleanPhone);
    }

    if (!driver) {
      return res.status(404).json({ error: "Driver account not found." });
    }

    // Check OTP
    if (!driver.loginOtp || driver.loginOtp !== cleanOtp) {
      return res.status(400).json({ error: "Invalid OTP code. Please check and retry." });
    }

    if (driver.loginOtpExpiresAt && new Date(driver.loginOtpExpiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "OTP code has expired. Please request a new one." });
    }

    // Clear OTP
    if (isMongoConnected()) {
      try {
        await Driver.findByIdAndUpdate(driver._id, {
          $unset: { loginOtp: 1, loginOtpExpiresAt: 1 },
        });
      } catch (e) {}
    }
    const memIdx = (memoryStore.drivers || []).findIndex((d: any) => d.phone === cleanPhone);
    if (memIdx !== -1) {
      delete memoryStore.drivers[memIdx].loginOtp;
      delete memoryStore.drivers[memIdx].loginOtpExpiresAt;
    }

    // Must be approved by admin
    if (driver.status === "pending") {
      return res.status(403).json({
        error: "Your driver account is pending verification. You will be activated once documents are approved.",
        status: "pending",
      });
    }

    if (driver.status === "suspended" || driver.status === "rejected") {
      return res.status(403).json({
        error: `Your driver account has been ${driver.status}. Please contact ALIKE-ND Operations for assistance.`,
        status: driver.status,
      });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        driverId: String(driver._id),
        role: "driver",
        phone: driver.phone,
        vehicleType: driver.vehicleType,
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Driver login successful.",
      token,
      driver: sanitizeDriver(driver),
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
});

/**
 * 4. POST /api/driver/login
 * Driver password login - requires status 'approved'
 */
router.post("/login", driverAuthLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;

    const cleanPhone = String(phone || "").trim();
    if (!cleanPhone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    let driver: any = null;
    if (isMongoConnected()) {
      try {
        driver = await Driver.findOne({ phone: cleanPhone });
      } catch (e) {}
    }

    if (!driver) {
      driver = (memoryStore.drivers || []).find((d: any) => d.phone === cleanPhone);
    }

    if (!driver) {
      return res.status(401).json({ error: "No driver account found with this phone number." });
    }

    const isMatch = await bcrypt.compare(password, driver.passwordHash || "");
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials. Please verify your password." });
    }

    if (driver.status === "pending") {
      return res.status(403).json({
        error: "Your driver account is still pending admin approval. You will receive an SMS confirmation once approved.",
        status: "pending",
      });
    }

    if (driver.status === "suspended" || driver.status === "rejected") {
      return res.status(403).json({
        error: `Your driver account has been ${driver.status}. Please contact ALIKE-ND Operations for assistance.`,
        status: driver.status,
      });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        driverId: String(driver._id),
        role: "driver",
        phone: driver.phone,
        vehicleType: driver.vehicleType,
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      driver: sanitizeDriver(driver),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Login failed." });
  }
});

/**
 * 5. GET /api/driver/me
 * Retrieves authenticated driver profile, document expiry alerts, and current active ride
 */
router.get("/me", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const driver = req.driver;
    let activeRide: any = null;

    if (isMongoConnected()) {
      try {
        activeRide = await RideBooking.findOne({
          "driver.driverId": req.driverId,
          status: { $in: ["accepted", "arriving", "arrived", "started", "in_progress"] },
        }).lean();
      } catch (e) {}
    }

    if (!activeRide) {
      activeRide = (memoryStore.rides || []).find(
        (r: any) =>
          r.driver?.driverId === req.driverId &&
          ["accepted", "arriving", "arrived", "started", "in_progress"].includes(r.status)
      );
    }

    return res.json({
      success: true,
      driver: sanitizeDriver(driver),
      activeRide: activeRide || null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch driver profile." });
  }
});

/**
 * 6. PATCH /api/driver/profile
 * Updates driver profile photograph, banking details, or renewed documents
 */
router.patch("/profile", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const {
      photoUrl,
      vehicleModel,
      bankDetails,
      licenseExpiryDate,
      licenseDocUrl,
      insurancePolicyNumber,
      insuranceExpiryDate,
      insuranceDocUrl,
      permitNumber,
      permitExpiryDate,
      permitDocUrl,
    } = req.body;

    const updates: any = {};
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (vehicleModel !== undefined) updates.vehicleModel = vehicleModel;
    if (bankDetails) {
      updates.bankDetails = {
        accountNumberMasked: bankDetails.accountNumber ? maskAccount(bankDetails.accountNumber) : undefined,
        ifscCode: bankDetails.ifscCode ? String(bankDetails.ifscCode).toUpperCase() : undefined,
        bankName: bankDetails.bankName,
        upiId: bankDetails.upiId ? String(bankDetails.upiId).toLowerCase() : undefined,
      };
    }
    if (licenseExpiryDate) updates.licenseExpiryDate = new Date(licenseExpiryDate);
    if (licenseDocUrl) updates.licenseDocUrl = licenseDocUrl;
    if (insurancePolicyNumber) updates.insurancePolicyNumber = insurancePolicyNumber;
    if (insuranceExpiryDate) updates.insuranceExpiryDate = new Date(insuranceExpiryDate);
    if (insuranceDocUrl) updates.insuranceDocUrl = insuranceDocUrl;
    if (permitNumber) updates.permitNumber = permitNumber;
    if (permitExpiryDate) updates.permitExpiryDate = new Date(permitExpiryDate);
    if (permitDocUrl) updates.permitDocUrl = permitDocUrl;

    let updatedDoc: any = null;
    if (isMongoConnected()) {
      try {
        updatedDoc = await Driver.findByIdAndUpdate(req.driverId, { $set: updates }, { new: true }).lean();
      } catch (e) {}
    }

    const memIdx = (memoryStore.drivers || []).findIndex((d: any) => String(d._id) === String(req.driverId));
    if (memIdx !== -1) {
      memoryStore.drivers[memIdx] = { ...memoryStore.drivers[memIdx], ...updates };
      if (!updatedDoc) updatedDoc = memoryStore.drivers[memIdx];
    }

    return res.json({
      success: true,
      message: "Driver profile updated successfully.",
      driver: sanitizeDriver(updatedDoc || req.driver),
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update profile." });
  }
});

/**
 * 7. PATCH /api/driver/status
 * Toggle driver Go Online / Go Offline duty status
 */
router.patch("/status", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    if (typeof isOnline !== "boolean") {
      return res.status(400).json({ error: "'isOnline' must be a boolean." });
    }

    const updateFields: any = {
      isOnline,
      dutyStartTime: isOnline ? new Date() : null,
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await Driver.findByIdAndUpdate(req.driverId, updateFields);
      } catch (e) {}
    }

    const memIdx = (memoryStore.drivers || []).findIndex((d: any) => String(d._id) === String(req.driverId));
    if (memIdx !== -1) {
      memoryStore.drivers[memIdx] = {
        ...memoryStore.drivers[memIdx],
        ...updateFields,
      };
    }

    return res.json({
      success: true,
      isOnline,
      message: isOnline ? "You are now online and ready to receive rides!" : "You are now offline.",
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update online status." });
  }
});

/**
 * 8. PATCH /api/driver/location
 * Updates live GPS coordinates with strict validation (-90..90, -180..180)
 */
router.patch("/location", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { lat, lng } = req.body;

    if (!isValidLat(lat) || !isValidLng(lng)) {
      return res.status(400).json({
        error: "Invalid coordinates. Latitude must be between -90 and 90, Longitude between -180 and 180.",
      });
    }

    const nLat = Number(lat);
    const nLng = Number(lng);

    const locDoc = {
      type: "Point" as const,
      coordinates: [nLng, nLat] as [number, number],
    };

    if (isMongoConnected()) {
      try {
        await Driver.findByIdAndUpdate(req.driverId, {
          location: locDoc,
          locationUpdatedAt: new Date(),
        });
      } catch (e) {}
    }

    const memIdx = (memoryStore.drivers || []).findIndex((d: any) => String(d._id) === String(req.driverId));
    if (memIdx !== -1) {
      memoryStore.drivers[memIdx].location = locDoc;
      memoryStore.drivers[memIdx].locationUpdatedAt = new Date();
    }

    // Also sync location to active ride so customer sees live tracking
    if (isMongoConnected()) {
      try {
        await RideBooking.updateMany(
          {
            "driver.driverId": req.driverId,
            status: { $in: ["accepted", "arriving", "arrived", "started", "in_progress"] },
          },
          {
            "driver.lat": nLat,
            "driver.lng": nLng,
            "driver.locationUpdatedAt": new Date(),
          }
        );
      } catch (e) {}
    }

    (memoryStore.rides || []).forEach((r: any) => {
      if (
        r.driver?.driverId === req.driverId &&
        ["accepted", "arriving", "arrived", "started", "in_progress"].includes(r.status)
      ) {
        if (!r.driver) r.driver = {};
        r.driver.lat = nLat;
        r.driver.lng = nLng;
        r.driver.locationUpdatedAt = new Date();
      }
    });

    return res.json({ success: true, message: "Location updated." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update location." });
  }
});

/**
 * 9. GET /api/driver/offers
 * Nearby ride dispatch offers for the driver
 */
router.get("/offers", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const driver = req.driver;
    if (!driver.isOnline) {
      return res.json({ hasOffer: false, offer: null, secondsRemaining: 0 });
    }

    let activeRide: any = null;
    if (isMongoConnected()) {
      try {
        activeRide = await RideBooking.findOne({
          "driver.driverId": req.driverId,
          status: { $in: ["accepted", "arriving", "arrived", "started", "in_progress"] },
        }).lean();
      } catch (e) {}
    }
    if (!activeRide) {
      activeRide = (memoryStore.rides || []).find(
        (r: any) =>
          r.driver?.driverId === req.driverId &&
          ["accepted", "arriving", "arrived", "started", "in_progress"].includes(r.status)
      );
    }

    if (activeRide) {
      return res.json({ hasOffer: false, offer: null, activeRide, secondsRemaining: 0 });
    }

    // Check for targeted offers
    let offerRide: any = null;
    const now = Date.now();

    if (isMongoConnected()) {
      try {
        offerRide = await RideBooking.findOne({
          status: "requested",
          $or: [
            { currentOfferDriverId: req.driverId, offerExpiresAt: { $gt: new Date(now) } },
            { currentOfferDriverId: null, serviceType: driver.vehicleType },
          ],
        }).lean();
      } catch (e) {}
    }

    if (!offerRide) {
      offerRide = (memoryStore.rides || []).find(
        (r: any) =>
          r.status === "requested" &&
          ((r.currentOfferDriverId === req.driverId &&
            r.offerExpiresAt &&
            new Date(r.offerExpiresAt).getTime() > now) ||
            (!r.currentOfferDriverId && r.serviceType === driver.vehicleType))
      );
    }

    if (!offerRide) {
      return res.json({ hasOffer: false, offer: null, secondsRemaining: 0 });
    }

    let secondsRemaining = 30;
    if (offerRide.offerExpiresAt) {
      secondsRemaining = Math.max(0, Math.round((new Date(offerRide.offerExpiresAt).getTime() - now) / 1000));
    }

    return res.json({
      hasOffer: true,
      offer: {
        bookingId: offerRide.bookingId,
        _id: offerRide._id,
        serviceType: offerRide.serviceType,
        pickup: offerRide.pickup,
        destination: offerRide.destination,
        distanceKm: offerRide.distanceKm,
        fare: offerRide.fare,
        paymentMethod: offerRide.paymentMethod,
        customerName: offerRide.customerName,
        customerPhone: offerRide.customerPhone,
      },
      secondsRemaining,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to poll offers." });
  }
});

/**
 * 10. POST /api/driver/rides/:id/accept
 * Driver accepts the assigned ride offer
 */
router.post("/rides/:id/accept", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const driver = req.driver;

    let ride: any = null;
    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOne({ $or: [{ bookingId: id }, { _id: id }] });
      } catch (e) {}
    }
    if (!ride) {
      ride = (memoryStore.rides || []).find((r: any) => r.bookingId === id || String(r._id) === id);
    }

    if (!ride) {
      return res.status(404).json({ error: "Ride booking not found." });
    }

    if (["cancelled", "completed"].includes(ride.status)) {
      return res.status(400).json({ error: `Cannot accept ride with status '${ride.status}'.` });
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

    if (isMongoConnected()) {
      try {
        ride.driver = driverPayload;
        ride.status = "arriving";
        ride.acceptedAt = new Date();
        await ride.save();
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
      ride = memoryStore.rides[memIdx];
    }

    return res.json({
      success: true,
      message: "Ride accepted! Navigate to passenger pickup location.",
      ride: typeof ride.toObject === "function" ? ride.toObject() : ride,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to accept ride." });
  }
});

/**
 * 11. POST /api/driver/rides/:id/reject
 * Driver explicitly rejects the ride request
 */
router.post("/rides/:id/reject", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      try {
        await RideBooking.updateOne(
          { $or: [{ bookingId: id }, { _id: id }] },
          {
            currentOfferDriverId: null,
            offerExpiresAt: null,
          }
        );
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx].currentOfferDriverId = null;
      memoryStore.rides[memIdx].offerExpiresAt = null;
    }

    return res.json({ success: true, message: "Ride offer declined." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to reject ride." });
  }
});

/**
 * 12. POST /api/driver/rides/:id/arrived
 * Driver reaches pickup point
 */
router.post("/rides/:id/arrived", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;

    let ride: any = null;
    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOne({ $or: [{ bookingId: id }, { _id: id }] });
      } catch (e) {}
    }
    if (!ride) {
      ride = (memoryStore.rides || []).find((r: any) => r.bookingId === id || String(r._id) === id);
    }

    if (!ride) {
      return res.status(404).json({ error: "Ride booking not found." });
    }

    if (isMongoConnected()) {
      try {
        ride.status = "arrived";
        ride.arrivedAt = new Date();
        await ride.save();
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        status: "arrived",
        arrivedAt: new Date(),
      };
      ride = memoryStore.rides[memIdx];
    }

    return res.json({
      success: true,
      message: "Arrival recorded. Passenger notified to share 4-digit ride OTP.",
      ride: typeof ride.toObject === "function" ? ride.toObject() : ride,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to mark arrival." });
  }
});

/**
 * 13. POST /api/driver/rides/:id/start
 * Driver enters 4-digit Ride OTP. Strictly verified before starting ride.
 */
router.post("/rides/:id/start", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { otp, lat, lng } = req.body;

    if (!otp || String(otp).trim().length !== 4) {
      return res.status(400).json({ error: "Valid 4-digit ride verification OTP is required." });
    }

    let ride: any = null;
    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOne({ $or: [{ bookingId: id }, { _id: id }] });
      } catch (e) {}
    }
    if (!ride) {
      ride = (memoryStore.rides || []).find((r: any) => r.bookingId === id || String(r._id) === id);
    }

    if (!ride) {
      return res.status(404).json({ error: "Ride booking not found." });
    }

    // Strict OTP check
    if (String(ride.rideOtp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        error: "Incorrect OTP. Please ask the passenger for the 4-digit OTP shown on their screen.",
      });
    }

    const startLoc = {
      lat: isValidLat(lat) ? Number(lat) : ride.pickup?.lat || 28.6139,
      lng: isValidLng(lng) ? Number(lng) : ride.pickup?.lng || 77.209,
    };

    if (isMongoConnected()) {
      try {
        ride.status = "in_progress";
        ride.startedAt = new Date();
        ride.startLocation = startLoc;
        await ride.save();
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        status: "in_progress",
        startedAt: new Date(),
        startLocation: startLoc,
      };
      ride = memoryStore.rides[memIdx];
    }

    return res.json({
      success: true,
      message: "OTP verified successfully! Trip has started. Drive safely to destination.",
      ride: typeof ride.toObject === "function" ? ride.toObject() : ride,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to verify OTP." });
  }
});

/**
 * 14. POST /api/driver/rides/:id/complete
 * Driver completes ride and settles earnings
 */
router.post("/rides/:id/complete", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { actualDistanceKm, actualDurationMinutes } = req.body;

    let ride: any = null;
    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOne({ $or: [{ bookingId: id }, { _id: id }] });
      } catch (e) {}
    }
    if (!ride) {
      ride = (memoryStore.rides || []).find((r: any) => r.bookingId === id || String(r._id) === id);
    }

    if (!ride) {
      return res.status(404).json({ error: "Ride booking not found." });
    }

    const totalFare = ride.fare?.totalFare || 100;
    const driverEarnings = Math.round(totalFare * 0.85); // 85% payout

    if (isMongoConnected()) {
      try {
        ride.status = "completed";
        ride.completedAt = new Date();
        ride.actualDistanceKm = actualDistanceKm || ride.distanceKm;
        ride.actualDurationMinutes = actualDurationMinutes || ride.durationMinutes;
        if (!ride.fare) ride.fare = {};
        ride.fare.driverEarnings = driverEarnings;
        await ride.save();

        // Increment driver stats
        await Driver.findByIdAndUpdate(req.driverId, {
          $inc: {
            totalRides: 1,
            earningsToday: driverEarnings,
            totalEarnings: driverEarnings,
          },
        });
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        status: "completed",
        completedAt: new Date(),
        fare: {
          ...memoryStore.rides[memIdx].fare,
          driverEarnings,
        },
      };
      ride = memoryStore.rides[memIdx];
    }

    const driverMemIdx = (memoryStore.drivers || []).findIndex(
      (d: any) => String(d._id) === String(req.driverId)
    );
    if (driverMemIdx !== -1) {
      memoryStore.drivers[driverMemIdx].totalRides = (memoryStore.drivers[driverMemIdx].totalRides || 0) + 1;
      memoryStore.drivers[driverMemIdx].earningsToday =
        (memoryStore.drivers[driverMemIdx].earningsToday || 0) + driverEarnings;
      memoryStore.drivers[driverMemIdx].totalEarnings =
        (memoryStore.drivers[driverMemIdx].totalEarnings || 0) + driverEarnings;
    }

    return res.json({
      success: true,
      message: `Trip completed! Earnings of ₹${driverEarnings} credited to your driver wallet.`,
      ride: typeof ride.toObject === "function" ? ride.toObject() : ride,
      driverEarnings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to complete trip." });
  }
});

/**
 * 15. POST /api/driver/rides/:id/cancel
 * Driver cancels ride with mandatory reason
 */
router.post("/rides/:id/cancel", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Cancellation reason is required." });
    }

    let ride: any = null;
    if (isMongoConnected()) {
      try {
        ride = await RideBooking.findOneAndUpdate(
          { $or: [{ bookingId: id }, { _id: id }] },
          {
            status: "cancelled",
            cancelledBy: "driver",
            cancellationReason: reason.trim(),
            updatedAt: new Date(),
          },
          { new: true }
        );
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx] = {
        ...memoryStore.rides[memIdx],
        status: "cancelled",
        cancelledBy: "driver",
        cancellationReason: reason.trim(),
      };
      ride = memoryStore.rides[memIdx];
    }

    return res.json({
      success: true,
      message: "Ride cancelled.",
      ride: typeof ride?.toObject === "function" ? ride.toObject() : ride,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to cancel ride." });
  }
});

/**
 * 16. POST /api/driver/rides/:id/sos
 * Driver triggers Emergency SOS
 */
router.post("/rides/:id/sos", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lat, lng, notes } = req.body;

    const sosIncident = {
      incidentId: `SOS-${Date.now().toString(36).toUpperCase()}`,
      rideId: id,
      triggeredBy: "driver",
      driverId: req.driverId,
      driverName: req.driver?.name,
      location: {
        lat: isValidLat(lat) ? Number(lat) : req.driver?.location?.coordinates?.[1] || 28.6139,
        lng: isValidLng(lng) ? Number(lng) : req.driver?.location?.coordinates?.[0] || 77.209,
      },
      status: "active",
      notes: notes || "Emergency SOS triggered by Captain",
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      try {
        await RideBooking.updateOne(
          { $or: [{ bookingId: id }, { _id: id }] },
          {
            sosAlert: {
              triggeredBy: "driver",
              triggeredAt: new Date(),
              location: sosIncident.location,
              status: "active",
              notes: sosIncident.notes,
            },
          }
        );
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx].sosAlert = {
        triggeredBy: "driver",
        triggeredAt: new Date(),
        location: sosIncident.location,
        status: "active",
        notes: sosIncident.notes,
      };
    }

    if (!memoryStore.safetyIncidents) memoryStore.safetyIncidents = [];
    memoryStore.safetyIncidents.unshift(sosIncident);

    return res.json({
      success: true,
      message: "EMERGENCY SOS BROADCASTED! Safety Control Team notified. Dial 112 if immediate police assistance is required.",
      incident: sosIncident,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to trigger SOS." });
  }
});

/**
 * 17. POST /api/driver/rides/:id/accident
 * Driver reports vehicle breakdown or accident
 */
router.post("/rides/:id/accident", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { severity, description } = req.body;

    const accidentDoc = {
      incidentId: `ACC-${Date.now().toString(36).toUpperCase()}`,
      rideId: id,
      severity: ["minor", "moderate", "critical"].includes(severity) ? severity : "minor",
      description: description || "Vehicle accident or breakdown reported",
      reportedBy: "driver",
      driverId: req.driverId,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      try {
        await RideBooking.updateOne(
          { $or: [{ bookingId: id }, { _id: id }] },
          {
            accidentReport: {
              severity: accidentDoc.severity as any,
              description: accidentDoc.description,
              reportedBy: "driver",
              reportedAt: new Date(),
              status: "open",
            },
          }
        );
      } catch (e) {}
    }

    if (!memoryStore.safetyIncidents) memoryStore.safetyIncidents = [];
    memoryStore.safetyIncidents.unshift(accidentDoc);

    return res.json({
      success: true,
      message: "Incident report filed. Dispatch support team assigned.",
      accident: accidentDoc,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to report accident." });
  }
});

/**
 * 18. POST /api/driver/rides/:id/rate-passenger
 * Driver rates passenger (1-5 stars)
 */
router.post("/rides/:id/rate-passenger", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback, tags } = req.body;

    const rNum = Number(rating);
    if (!rNum || rNum < 1 || rNum > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5." });
    }

    const ratingDoc = {
      rating: rNum,
      tags: Array.isArray(tags) ? tags : [],
      feedback: feedback ? String(feedback).trim() : "",
      ratedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await RideBooking.updateOne(
          { $or: [{ bookingId: id }, { _id: id }] },
          { passengerRating: ratingDoc }
        );
      } catch (e) {}
    }

    const memIdx = (memoryStore.rides || []).findIndex((r: any) => r.bookingId === id || String(r._id) === id);
    if (memIdx !== -1) {
      memoryStore.rides[memIdx].passengerRating = ratingDoc;
    }

    return res.json({
      success: true,
      message: "Passenger rating recorded. Thank you for your feedback!",
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to record passenger rating." });
  }
});

/**
 * 19. GET /api/driver/history
 * Driver's completed/cancelled ride history
 */
router.get("/history", requireDriverAuth, async (req: DriverAuthedRequest, res: Response) => {
  try {
    let list: any[] = [];
    if (isMongoConnected()) {
      try {
        list = await RideBooking.find({
          "driver.driverId": req.driverId,
        })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
      } catch (e) {}
    }

    if (list.length === 0) {
      list = (memoryStore.rides || []).filter(
        (r: any) => r.driver?.driverId === req.driverId
      );
    }

    return res.json({ success: true, count: list.length, rides: list });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch driver ride history." });
  }
});

export default router;
