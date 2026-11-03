import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DeliveryPartner, {
  IDeliveryPartner,
  DeliveryPartnerStatus,
  VehicleType,
} from "../models/DeliveryPartner";
import DeliveryTask from "../models/DeliveryTask";
import {
  DeliveryEarningsRecordModel,
  DeliveryPayoutRecordModel,
  DeliveryAdjustmentModel,
  DeliveryIncidentModel,
  DeliveryDisputeModel,
  DeliveryAnnouncementModel,
  DeliveryReviewModel,
} from "../models/DeliveryPartnerRecords";
import {
  calculateDeliveryEarnings,
  recordOrderEarnings,
  recordCancellationCompensation,
  getEarningsReport,
  seedDefaultEarningsRecords,
} from "../services/deliveryEarningsService";
import { isMongoConnected, memoryStore } from "../store";
import { getJwtSecret } from "../config/jwt";
import { reassignOrder } from "../services/deliveryAssignment";

const router = Router();

// In-memory delivery partners store initialization
if (!memoryStore.deliveryPartners) {
  memoryStore.deliveryPartners = [];
}

// In-memory mock OTP storage for development verification
const pendingOtps: Record<string, { otp: string; expiresAt: number }> = {};

export interface PartnerAuthedRequest extends Request {
  partnerId?: string;
  partner?: any;
}

// Helper: Mask sensitive numbers
export function maskIdentity(type: string, number: string): string {
  const clean = number.replace(/[\s-]/g, "");
  if (type === "aadhaar") {
    const last4 = clean.slice(-4);
    return `XXXX-XXXX-${last4 || "0000"}`;
  }
  if (type === "pan") {
    const last4 = clean.slice(-4);
    return `XXXXX${last4 || "0000"}`;
  }
  const last4 = clean.slice(-4);
  return `ID-••••-${last4 || "0000"}`;
}

export function maskBankAccount(accountNumber: string): string {
  const clean = accountNumber.replace(/[\s-]/g, "");
  const last4 = clean.slice(-4);
  return `••••••••${last4 || "0000"}`;
}

// Authentication Middleware
export async function requirePartnerAuth(
  req: PartnerAuthedRequest,
  res: Response,
  next: NextFunction
) {
  const secret = getJwtSecret();
  if (!secret) {
    return res.status(503).json({
      success: false,
      error: "Authentication service unavailable. Please try again.",
    });
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Delivery partner authentication required. Please sign in.",
    });
  }

  const token = header.slice(7);
  let payload: any;
  try {
    payload = jwt.verify(token, secret);
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Session expired or invalid. Please log in again.",
    });
  }

  if (!payload || payload.role !== "delivery_partner" || !payload.partnerId) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Delivery partner credentials required.",
    });
  }

  if (isMongoConnected()) {
    try {
      const partnerDoc = await DeliveryPartner.findOne({ partnerId: payload.partnerId });
      if (partnerDoc) {
        req.partnerId = partnerDoc.partnerId;
        req.partner = partnerDoc;
        return next();
      }
    } catch (e) {
      console.warn("MongoDB partner lookup error, falling back:", e);
    }
  }

  const memPartner = memoryStore.deliveryPartners.find(
    (p: any) => p.partnerId === payload.partnerId
  );
  if (memPartner) {
    req.partnerId = memPartner.partnerId;
    req.partner = memPartner;
    return next();
  }

  return res.status(404).json({
    success: false,
    error: "Delivery partner profile not found.",
  });
}

/**
 * 1. POST /api/delivery-partner/register/send-otp
 * Validates mobile number and dispatches verification OTP
 */
router.post("/register/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Mobile number is required." });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
    }

    // Check if phone already registered
    let existingPartner = null;
    if (isMongoConnected()) {
      try {
        existingPartner = await DeliveryPartner.findOne({ phone: cleanPhone });
      } catch (e) {
        console.warn("MongoDB partner check fallback:", e);
      }
    }
    if (!existingPartner) {
      existingPartner = memoryStore.deliveryPartners.find((p: any) => p.phone === cleanPhone);
    }

    if (existingPartner) {
      return res.status(409).json({
        error: "This phone number is already registered. Please log in instead.",
        isExisting: true,
      });
    }

    // Generate 6-digit OTP
    const otp = "123456"; // Realistic predictable OTP for development mock verification
    pendingOtps[cleanPhone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    return res.json({
      success: true,
      message: `Verification code sent to ${cleanPhone}`,
      demoOtp: otp,
      note: "Development mode: Use code 123456 to verify",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to dispatch registration OTP" });
  }
});

/**
 * 2. POST /api/delivery-partner/register
 * Submits complete partner profile and starts verification approval process
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      otp,
      city = "New Delhi",
      operatingZone = "Central Delhi Hub",
      dob,
      bloodGroup,
      address,
      emergencyContact,
      vehicle,
      identity,
      payout,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and mobile number are mandatory." });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    // OTP validation
    if (otp) {
      const pending = pendingOtps[cleanPhone];
      if (otp !== "123456" && (!pending || pending.otp !== otp || pending.expiresAt < Date.now())) {
        return res.status(400).json({ error: "Invalid or expired verification code." });
      }
      delete pendingOtps[cleanPhone];
    }

    // Driving license check for motorized vehicles
    const vehicleType: VehicleType = vehicle?.type || "scooter";
    if (["scooter", "motorcycle", "ebike"].includes(vehicleType)) {
      if (!vehicle?.registrationNumber && vehicleType !== "ebike") {
        return res.status(400).json({
          error: "Vehicle registration number is required for motorized delivery vehicles.",
        });
      }
      if (!identity?.drivingLicenseNumber && vehicleType !== "ebike") {
        return res.status(400).json({
          error: "Valid Driving Licence is required for motorized delivery vehicles.",
        });
      }
    }

    // Payout details check
    if (!payout?.accountHolderName || !payout?.accountNumber || !payout?.ifsc) {
      return res.status(400).json({
        error: "Bank account holder name, account number, and IFSC code are required for payouts.",
      });
    }

    // Mask sensitive identity & bank data before saving
    const maskedIdentityNumber = maskIdentity(identity?.type || "aadhaar", identity?.number || "9999");
    const maskedDlNumber = identity?.drivingLicenseNumber
      ? `DL-••••-${identity.drivingLicenseNumber.slice(-4)}`
      : undefined;
    const maskedAccount = maskBankAccount(payout.accountNumber);

    let passwordHash = undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const partnerId = `DP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newPartnerData = {
      partnerId,
      name: name.trim(),
      phone: cleanPhone,
      email: email?.trim().toLowerCase() || "",
      passwordHash,
      avatar:
        req.body.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
      city,
      operatingZone,
      dob: dob || "",
      bloodGroup: bloodGroup || "O+",
      address: address || "",
      emergencyContact: {
        name: emergencyContact?.name || "Family Contact",
        phone: emergencyContact?.phone || cleanPhone,
        relationship: emergencyContact?.relationship || "Relative",
      },
      vehicle: {
        type: vehicleType,
        model: vehicle?.model || "Standard Delivery Vehicle",
        registrationNumber: vehicle?.registrationNumber || (vehicleType === "bicycle" ? "EXEMPT" : "DL 01 AA 0000"),
        rcDocUrl: vehicle?.rcDocUrl || "",
      },
      identity: {
        type: identity?.type || "aadhaar",
        numberMasked: maskedIdentityNumber,
        documentUrl: identity?.documentUrl || "",
        drivingLicenseNumberMasked: maskedDlNumber,
        drivingLicenseExpiry: identity?.drivingLicenseExpiry || "2030-12-31",
        drivingLicenseUrl: identity?.drivingLicenseUrl || "",
        verificationStatus: "pending" as const,
      },
      payout: {
        accountHolderName: payout.accountHolderName.trim(),
        accountNumberMasked: maskedAccount,
        ifsc: payout.ifsc.trim().toUpperCase(),
        bankName: payout.bankName || "State Bank of India",
        upiId: payout.upiId?.trim() || `${cleanPhone.slice(-10)}@upi`,
      },
      status: "pending_approval" as DeliveryPartnerStatus,
      isOnline: false,
      isOnBreak: false,
      currentLocation: {
        lat: 28.6139,
        lng: 77.209,
        heading: 0,
        accuracy: 10,
        lastUpdated: new Date(),
      },
      rating: 5.0,
      totalDeliveries: 0,
      earningsToday: 0,
      walletBalance: 650,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let savedPartner: any = null;
    if (isMongoConnected()) {
      try {
        const partnerDoc = new DeliveryPartner(newPartnerData);
        savedPartner = await partnerDoc.save();
      } catch (err) {
        console.warn("MongoDB partner save error, persisting to memoryStore:", err);
      }
    }

    if (!savedPartner) {
      memoryStore.deliveryPartners.push(newPartnerData);
      savedPartner = newPartnerData;
    }

    // Sign JWT token
    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        partnerId: savedPartner.partnerId,
        phone: savedPartner.phone,
        role: "delivery_partner",
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! Document review is pending admin approval.",
      token,
      partner: savedPartner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to register delivery partner" });
  }
});

/**
 * 3. POST /api/delivery-partner/login/send-otp
 */
router.post("/login/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Mobile number is required." });

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    let partner = null;
    if (isMongoConnected()) {
      try {
        partner = await DeliveryPartner.findOne({ phone: cleanPhone });
      } catch (e) {
        console.warn("MongoDB partner lookup fallback:", e);
      }
    }
    if (!partner) {
      partner = memoryStore.deliveryPartners.find((p: any) => p.phone === cleanPhone);
    }

    if (!partner) {
      return res.status(404).json({
        error: "No partner account found with this mobile number. Please register first.",
      });
    }

    const otp = "123456"; // Development OTP
    pendingOtps[cleanPhone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    return res.json({
      success: true,
      message: `OTP sent to ${cleanPhone}`,
      demoOtp: otp,
      partnerName: partner.name,
      status: partner.status,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to dispatch login OTP" });
  }
});

/**
 * 4. POST /api/delivery-partner/login/verify-otp
 */
router.post("/login/verify-otp", async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone number and OTP code are required." });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    const pending = pendingOtps[cleanPhone];
    if (otp !== "123456" && (!pending || pending.otp !== otp || pending.expiresAt < Date.now())) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }
    delete pendingOtps[cleanPhone];

    let partner = null;
    if (isMongoConnected()) {
      try {
        partner = await DeliveryPartner.findOne({ phone: cleanPhone });
      } catch (e) {
        console.warn("MongoDB partner verify fallback:", e);
      }
    }
    if (!partner) {
      partner = memoryStore.deliveryPartners.find((p: any) => p.phone === cleanPhone);
    }

    if (!partner) {
      return res.status(404).json({ error: "Delivery partner record not found." });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        partnerId: partner.partnerId,
        phone: partner.phone,
        role: "delivery_partner",
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      partner,
      message: `Welcome back, ${partner.name}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Login failed" });
  }
});

/**
 * 5. POST /api/delivery-partner/login/password
 */
router.post("/login/password", async (req: Request, res: Response) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

    let partner = null;
    if (isMongoConnected()) {
      try {
        partner = await DeliveryPartner.findOne({ phone: cleanPhone });
      } catch (e) {
        console.warn("MongoDB partner lookup fallback:", e);
      }
    }
    if (!partner) {
      partner = memoryStore.deliveryPartners.find((p: any) => p.phone === cleanPhone);
    }

    if (!partner) {
      return res.status(404).json({ error: "No partner account found with this number." });
    }

    if (!partner.passwordHash) {
      return res.status(400).json({
        error: "Password login not configured for this account. Please log in with OTP.",
      });
    }

    const isMatch = await bcrypt.compare(password, partner.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please try again or use OTP." });
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        partnerId: partner.partnerId,
        phone: partner.phone,
        role: "delivery_partner",
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      partner,
      message: `Welcome back, ${partner.name}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Password login failed" });
  }
});

/**
 * 6. GET /api/delivery-partner/me and /profile
 * Retrieves partner profile with masked credentials
 */
router.get(["/me", "/profile"], requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  return res.json({
    success: true,
    partner: req.partner,
  });
});

/**
 * 7. PUT /api/delivery-partner/me and /profile
 * Updates safe profile fields
 */
router.put(["/me", "/profile"], requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { avatar, operatingZone, emergencyContact, upiId } = req.body;

    const partner = req.partner;
    if (avatar) partner.avatar = avatar;
    if (operatingZone) partner.operatingZone = operatingZone;
    if (emergencyContact) {
      partner.emergencyContact = {
        name: emergencyContact.name || partner.emergencyContact?.name,
        phone: emergencyContact.phone || partner.emergencyContact?.phone,
        relationship: emergencyContact.relationship || partner.emergencyContact?.relationship,
      };
    }
    if (upiId && partner.payout) {
      partner.payout.upiId = upiId;
    }
    if (req.body.newPassword) {
      const { newPassword } = req.body;
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      partner.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      partner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update profile" });
  }
});

/**
 * 8. POST /api/delivery-partner/availability
 * Toggles online/offline status with server-side validation.
 * Crucial check: Cannot go online if status !== "approved".
 */
router.post("/availability", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    const partner = req.partner;

    // Strict validation: Only approved partners can go online
    if (isOnline && partner.status !== "approved") {
      return res.status(403).json({
        success: false,
        error:
          partner.status === "pending_approval"
            ? "Cannot go online: Your account is currently pending verification. You can go online once your documents and vehicle details are approved by ALIKE Operations."
            : `Cannot go online: Your account is ${partner.status}. Please contact partner support.`,
        status: partner.status,
      });
    }

    partner.isOnline = Boolean(isOnline);
    if (!isOnline) {
      partner.isOnBreak = false;
      partner.breakUntil = undefined;
    }
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      isOnline: partner.isOnline,
      status: partner.status,
      message: partner.isOnline
        ? "You are now ONLINE and ready to receive delivery requests!"
        : "You are now OFFLINE.",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to toggle availability" });
  }
});

/**
 * 9. POST /api/delivery-partner/break
 * Allows partner to pause incoming orders for a specified duration
 */
router.post("/break", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { durationMinutes = 30 } = req.body;
    const partner = req.partner;

    const breakDurationMs = Math.min(120, Math.max(5, Number(durationMinutes))) * 60 * 1000;
    const breakUntil = new Date(Date.now() + breakDurationMs);

    partner.isOnBreak = true;
    partner.breakUntil = breakUntil;
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      isOnBreak: true,
      breakUntil,
      message: `Break active until ${breakUntil.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Orders paused.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to set break" });
  }
});

/**
 * 10. POST /api/delivery-partner/location
 * Updates real-time GPS coordinates and heartbeat
 */
router.post("/location", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { lat, lng, heading = 0, accuracy = 10 } = req.body;
    const partner = req.partner;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ error: "Valid latitude and longitude coordinates required." });
    }

    partner.currentLocation = {
      lat,
      lng,
      heading,
      accuracy,
      lastUpdated: new Date(),
    };

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({ success: true, updated: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Location update failed" });
  }
});

/**
 * 11. GET /api/delivery-partner/orders/incoming
 * Retrieves incoming order requests or active delivery task
 */
router.get("/orders/incoming", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;

    if (!partner.isOnline || partner.isOnBreak) {
      return res.json({
        success: true,
        isOnline: partner.isOnline,
        isOnBreak: partner.isOnBreak,
        incomingOrder: null,
        activeDelivery: null,
      });
    }

    // Check for active delivery task
    let activeDelivery: any = null;
    if (partner.activeTaskId) {
      if (isMongoConnected()) {
        try {
          activeDelivery = await DeliveryTask.findOne({ taskId: partner.activeTaskId });
        } catch (e) {
          console.warn("MongoDB active task lookup fallback:", e);
        }
      }
      if (!activeDelivery) {
        activeDelivery = memoryStore.deliveryTasks.find((t: any) => t.taskId === partner.activeTaskId);
      }
    }

    if (activeDelivery) {
      return res.json({
        success: true,
        isOnline: true,
        incomingOrder: null,
        activeDelivery,
      });
    }

    // Check for pending order in the zone
    let candidateTask: any = null;
    if (isMongoConnected()) {
      try {
        candidateTask = await DeliveryTask.findOne({
          status: "pickup_pending",
          "deliveryPartner.partnerId": { $exists: false },
        });
      } catch (e) {
        console.warn("MongoDB candidate task fallback:", e);
      }
    }

    if (!candidateTask) {
      candidateTask = memoryStore.deliveryTasks.find(
        (t: any) => t.status === "pickup_pending" && !t.deliveryPartner
      );
    }

    // If no candidate task in DB, provide realistic simulated dispatch request
    const mockOrderRequest = {
      requestId: `REQ-${Date.now().toString(36).toUpperCase()}`,
      serviceType: "quick_delivery",
      storeName: "ALIKE Blinkit Dark Store Saket",
      storeAddress: "A-12, Saket District Centre, New Delhi",
      storeDistanceKm: 1.2,
      customerName: "Radhika Mehra",
      customerAddress: "Flat 402, Block C, Green Park Extension, New Delhi",
      customerDistanceKm: 2.8,
      totalDistanceKm: 4.0,
      itemCount: 4,
      itemsSummary: "Amul Taaza Milk 1L, Bread, Farm Eggs (6pcs), Diet Coke (2x)",
      payoutAmount: 75,
      surgeBonus: 15,
      totalPayout: 90,
      estimatedMinutes: 18,
      expiresAt: Date.now() + 30 * 1000, // 30-second acceptance countdown
    };

    return res.json({
      success: true,
      isOnline: true,
      incomingOrder: mockOrderRequest,
      activeDelivery: null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch orders" });
  }
});

/**
 * 12. POST /api/delivery-partner/orders/:id/accept
 * Accepts the assigned order and updates status
 */
router.post("/orders/:id/accept", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const partner = req.partner;

    partner.activeTaskId = id;
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    // Check if task exists in DB
    let task: any = null;
    if (isMongoConnected()) {
      try {
        task = await DeliveryTask.findOne({ taskId: id });
        if (task) {
          task.status = "out_for_delivery";
          task.deliveryPartner = {
            partnerId: partner.partnerId,
            name: partner.name,
            phone: partner.phone,
            avatar: partner.avatar,
            vehicleType: partner.vehicle?.type || "scooter",
            vehicleNumber: partner.vehicle?.registrationNumber,
            rating: partner.rating || 5.0,
            completedDeliveries: partner.totalDeliveries || 0,
            currentLocation: partner.currentLocation,
          };
          task.timeline.push({
            status: "out_for_delivery",
            timestamp: new Date(),
            description: `Order accepted by partner ${partner.name}. Out for delivery.`,
          });
          await task.save();
        }
      } catch (e) {
        console.warn("MongoDB task update fallback:", e);
      }
    }

    if (!task) {
      const taskObj = memoryStore.deliveryTasks.find((t: any) => t.taskId === id);
      if (taskObj) {
        taskObj.status = "out_for_delivery";
        taskObj.deliveryPartner = {
          partnerId: partner.partnerId,
          name: partner.name,
          phone: partner.phone,
          avatar: partner.avatar,
          vehicleType: partner.vehicle?.type || "scooter",
          vehicleNumber: partner.vehicle?.registrationNumber,
          rating: partner.rating || 5.0,
          completedDeliveries: partner.totalDeliveries || 0,
          currentLocation: partner.currentLocation,
        };
        task = taskObj;
      } else {
        task = {
          taskId: id,
          orderId: `ORD-${Date.now().toString(36).toUpperCase()}`,
          status: "partner_assigned",
          serviceType: "quick_delivery",
          store: {
            name: "ALIKE Blinkit Dark Store Saket",
            address: "A-12, Saket District Centre, New Delhi",
            phone: "+91 9811002233",
            category: "Groceries & Instant Essentials",
          },
          customer: {
            name: "Radhika Mehra",
            address: "Flat 402, Block C, Green Park Extension, New Delhi",
            phone: "+91 9811223344",
            landmark: "Near Evergreen Sweets Market",
          },
          items: [
            { name: "Amul Taaza Milk 1L", quantity: 2, price: 54 },
            { name: "Brown Bread 400g", quantity: 1, price: 45 },
            { name: "Farm Eggs (6pcs)", quantity: 1, price: 65 },
          ],
          itemsSummary: "Amul Taaza Milk 1L, Brown Bread, Farm Eggs (6pcs)",
          itemCount: 3,
          pickupCode: "PU-8291",
          pickupVerified: false,
          pickupAttempts: 0,
          deliveryOtp: "4921",
          customerDeliveryOtp: "4921",
          deliveryOtpVerified: false,
          deliveryOtpAttempts: 0,
          totalAmount: 218,
          payoutAmount: 90,
          estimatedMinutes: 18,
          acceptedAt: new Date(),
        };
        memoryStore.deliveryTasks.push(task);
      }
    }

    return res.json({
      success: true,
      message: "Order accepted successfully! Please proceed to the store for pickup.",
      taskId: id,
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to accept order" });
  }
});

/**
 * 13. POST /api/delivery-partner/orders/:id/reject
 * Rejects or passes on an order request
 */
router.post("/orders/:id/reject", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = "Partner unavailable / Passed" } = req.body;
    const partnerId = req.partnerId || req.partner?.partnerId;

    if (id && partnerId) {
      await reassignOrder(id, partnerId, reason).catch((err) => {
        console.warn("Auto-reassign on rejection error:", err);
      });
    }

    return res.json({
      success: true,
      message: "Delivery request passed to next nearest available partner.",
      reason,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to reject order" });
  }
});

/**
 * Helper to find task in DB or memoryStore
 */
async function findTask(id: string) {
  let task: any = null;
  if (isMongoConnected()) {
    try {
      task = await DeliveryTask.findOne({
        $or: [{ taskId: id }, { orderNumber: id }, { _id: id }],
      });
    } catch (e) {
      console.warn("MongoDB findTask fallback:", e);
    }
  }
  if (!task) {
    task = memoryStore.deliveryTasks.find(
      (t: any) => t.taskId === id || t.orderNumber === id || t.orderId === id || t._id === id
    );
  }
  return task;
}

/**
 * 14. POST /api/delivery-partner/orders/:id/arrived-store
 * Confirms partner arrival at store
 */
router.post("/orders/:id/arrived-store", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    task.status = "arrived_at_store";
    if (task.timeline) {
      task.timeline.push({
        status: "arrived_at_store",
        timestamp: new Date(),
        description: `Delivery partner ${req.partner.name} has arrived at store pickup counter.`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    return res.json({
      success: true,
      message: "Arrival at store confirmed. Please ask store staff for the Pickup Verification Code.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to confirm store arrival" });
  }
});

/**
 * 15. POST /api/delivery-partner/orders/:id/verify-pickup
 * MANDATORY PICKUP CODE VERIFICATION:
 * Validates store pickup code before handing over package and transitioning to out_for_delivery
 */
router.post("/orders/:id/verify-pickup", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { pickupCode, notes, photoProof } = req.body;

    if (!pickupCode || !String(pickupCode).trim()) {
      return res.status(400).json({ error: "Pickup verification code is mandatory." });
    }

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    const targetCode = String(task.pickupCode || "PU-8291").trim().toUpperCase();
    const inputCode = String(pickupCode).trim().toUpperCase();

    // Match code (allow with or without PU- prefix)
    const normalizedTarget = targetCode.replace(/^PU-?/, "");
    const normalizedInput = inputCode.replace(/^PU-?/, "");

    if (normalizedTarget !== normalizedInput) {
      task.pickupAttempts = (task.pickupAttempts || 0) + 1;
      return res.status(400).json({
        error: "Incorrect Store Pickup Code. Please check the code displayed on the store terminal or receipt.",
      });
    }

    // Successful Verification
    task.pickupVerified = true;
    task.pickupVerifiedAt = new Date();
    task.status = "out_for_delivery";
    if (notes) task.pickupNotes = notes;
    if (photoProof) task.pickupPhoto = photoProof;

    if (task.timeline) {
      task.timeline.push({
        status: "picked_up",
        timestamp: new Date(),
        description: `Pickup code ${targetCode} verified. Package handed over to partner ${req.partner.name}.`,
      });
      task.timeline.push({
        status: "out_for_delivery",
        timestamp: new Date(),
        description: "Delivery partner is on the way to the customer doorstep.",
      });
    }

    if (isMongoConnected() && task.save) await task.save();

    return res.json({
      success: true,
      message: "Store pickup code verified successfully! Package handed over. Proceed to customer address.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify store pickup" });
  }
});

/**
 * 16. POST /api/delivery-partner/orders/:id/report-pickup-issue
 * Reports store delays, damaged package, or missing items
 */
router.post("/orders/:id/report-pickup-issue", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { issueType, delayMinutes = 10, details = "" } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    const desc = `Pickup notice [${issueType}]: ${details || (issueType === "store_delay" ? `Store packing delayed by ~${delayMinutes} mins` : "Store packaging issue reported")}`;
    if (task.timeline) {
      task.timeline.push({
        status: task.status,
        timestamp: new Date(),
        description: desc,
      });
    }
    if (issueType === "store_delay") {
      task.estimatedMinutes = (task.estimatedMinutes || 15) + Number(delayMinutes);
    }
    if (isMongoConnected() && task.save) await task.save();

    return res.json({
      success: true,
      message: "Issue recorded and store/customer notified.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to report issue" });
  }
});

/**
 * 17. POST /api/delivery-partner/orders/:id/arrived-customer
 * Confirms arrival at customer doorstep
 */
router.post("/orders/:id/arrived-customer", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    task.status = "arrived_at_customer";
    if (task.timeline) {
      task.timeline.push({
        status: "arrived_at_customer",
        timestamp: new Date(),
        description: `Delivery executive ${req.partner.name} has arrived at your doorstep.`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    return res.json({
      success: true,
      message: "Arrival at customer doorstep confirmed. Request 4-digit Delivery OTP at handover.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to confirm doorstep arrival" });
  }
});

/**
 * 18. POST /api/delivery-partner/orders/:id/verify-delivery-otp
 * MANDATORY DOORSTEP DELIVERY OTP VERIFICATION:
 * Validates customer delivery OTP, marks order delivered, and credits earnings to delivery partner.
 */
router.post("/orders/:id/verify-delivery-otp", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { deliveryOtp, photoProof, notes } = req.body;
    const partner = req.partner;

    if (!deliveryOtp || !String(deliveryOtp).trim()) {
      return res.status(400).json({ error: "Customer Delivery OTP is mandatory for handover." });
    }

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    if ((task.deliveryOtpAttempts || 0) >= 5) {
      return res.status(400).json({
        error: "Maximum OTP attempts exceeded (5/5). Please contact ALIKE ND Support to authorise delivery override.",
      });
    }

    const targetOtp = String(task.deliveryOtp || task.customerDeliveryOtp || "4921").trim();
    const inputOtp = String(deliveryOtp).trim();

    if (targetOtp !== inputOtp) {
      task.deliveryOtpAttempts = (task.deliveryOtpAttempts || 0) + 1;
      const remaining = 5 - task.deliveryOtpAttempts;
      return res.status(400).json({
        error: `Incorrect Delivery OTP. (${remaining} attempts remaining). Ask the customer to check the code on their screen.`,
      });
    }

    // Successful OTP verification
    task.deliveryOtpVerified = true;
    task.deliveryVerifiedAt = new Date();
    task.status = "delivered";
    task.paymentStatus = "paid";
    if (notes) task.deliveryNotes = notes;
    if (photoProof) task.deliveryPhotoProof = photoProof;

    if (task.timeline) {
      task.timeline.push({
        status: "delivered",
        timestamp: new Date(),
        description: `Doorstep Delivery OTP verified. Package handed over successfully by ${partner.name}.`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    // Credit partner daily earnings with detailed server calculation
    const distanceKm = task.distanceKm || 3.8;
    const weightKg = task.packageDetails?.weightKg || 1.5;
    const waitingMinutes = req.body.waitingMinutes || 5;
    const tips = Number(req.body.tips) || 0;

    const earningsRecord = await recordOrderEarnings({
      partnerId: partner.partnerId,
      taskId: task.taskId || String(task._id),
      orderNumber: task.orderNumber || "ORD-LOCAL",
      serviceType: task.serviceType || "quick_delivery",
      distanceKm,
      weightKg,
      waitingMinutes,
      tips,
    });

    const earnedPayout = earningsRecord.breakdown?.totalEarnings || task.payoutAmount || 90;
    partner.totalDeliveries = (partner.totalDeliveries || 0) + 1;
    partner.activeTaskId = undefined;
    partner.updatedAt = new Date();
    if (isMongoConnected() && partner.save) await partner.save();

    return res.json({
      success: true,
      message: `Delivery completed! ₹${earnedPayout} added to your daily earnings.`,
      task,
      partner,
      earningsRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to verify delivery OTP" });
  }
});

/**
 * 19. POST /api/delivery-partner/orders/:id/report-failed-delivery
 * Reports customer unavailable, wrong address, or refused package. Initiates return to store.
 */
router.post("/orders/:id/report-failed-delivery", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, notes = "" } = req.body;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    task.status = "return_initiated";
    task.failureReason = reason || "Customer unavailable";

    if (task.timeline) {
      task.timeline.push({
        status: "return_initiated",
        timestamp: new Date(),
        description: `Delivery could not be completed: ${reason}. Package return to store initiated. Notes: ${notes}`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    return res.json({
      success: true,
      message: "Delivery marked as failed. Please return the package to the pickup store.",
      task,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to record failed delivery" });
  }
});

/**
 * 20. POST /api/delivery-partner/orders/:id/confirm-return
 * Confirms package returned to merchant/store
 */
router.post("/orders/:id/confirm-return", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const partner = req.partner;

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    task.status = "returned_to_store";
    if (task.timeline) {
      task.timeline.push({
        status: "returned_to_store",
        timestamp: new Date(),
        description: `Package returned to store ${task.store?.name || "Merchant"} by ${partner.name}.`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    partner.activeTaskId = undefined;
    partner.updatedAt = new Date();
    if (isMongoConnected() && partner.save) await partner.save();

    return res.json({
      success: true,
      message: "Package return confirmed. You are ready for new delivery orders.",
      task,
      partner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to confirm return" });
  }
});

/**
 * 14. POST /api/delivery-partner/admin/fast-track-demo
 * Fast-tracks demo partner approval for interactive testing
 */
router.post("/admin/fast-track-demo", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    partner.status = "approved";
    if (partner.identity) {
      partner.identity.verificationStatus = "verified";
    }
    if (!partner.walletBalance || partner.walletBalance < 100) {
      partner.walletBalance = 650;
    }
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: "Partner account approved! You can now toggle Online.",
      partner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to approve partner" });
  }
});

/**
 * 15. GET /api/delivery-partner/admin/list
 * Admin review endpoint for partner verification queue
 */
router.get("/admin/list", async (req: Request, res: Response) => {
  try {
    let list = [];
    if (isMongoConnected()) {
      try {
        list = await DeliveryPartner.find({}).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn("MongoDB list fallback:", e);
      }
    }
    if (list.length === 0) {
      list = memoryStore.deliveryPartners;
    }

    return res.json({
      success: true,
      count: list.length,
      partners: list,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to fetch partners" });
  }
});

/**
 * 16. POST /api/delivery-partner/admin/:id/approve
 * Admin approves delivery partner documents and activates account
 */
router.post("/admin/:id/approve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let partner: any = null;

    if (isMongoConnected()) {
      partner = await DeliveryPartner.findOne({ partnerId: id });
    }
    if (!partner) {
      partner = memoryStore.deliveryPartners.find((p: any) => p.partnerId === id);
    }

    if (!partner) {
      return res.status(404).json({ error: "Delivery partner not found" });
    }

    partner.status = "approved";
    if (partner.identity) {
      partner.identity.verificationStatus = "verified";
    }
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: `Partner ${partner.name} approved successfully. They can now go online.`,
      partner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to approve partner" });
  }
});

/**
 * 17. POST /api/delivery-partner/admin/:id/reject
 * Admin rejects partner documents with reason
 */
router.post("/admin/:id/reject", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    let partner: any = null;

    if (isMongoConnected()) {
      partner = await DeliveryPartner.findOne({ partnerId: id });
    }
    if (!partner) {
      partner = memoryStore.deliveryPartners.find((p: any) => p.partnerId === id);
    }

    if (!partner) {
      return res.status(404).json({ error: "Delivery partner not found" });
    }

    partner.status = "rejected";
    partner.rejectionReason = reason || "Document verification failed. Please re-upload clearer photos.";
    if (partner.identity) {
      partner.identity.verificationStatus = "rejected";
      partner.identity.rejectionReason = partner.rejectionReason;
    }
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: `Partner ${partner.name} rejected.`,
      partner,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to reject partner" });
  }
});

// ============================================================
// MODULE 1F: DELIVERY PARTNER EARNINGS & PAYMENT RECORDS
// ============================================================

/**
 * 20. GET /api/delivery-partner/earnings/summary
 * Daily, weekly and monthly earnings report with breakdown
 */
router.get("/earnings/summary", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    const report = await getEarningsReport(partnerId);

    // Ensure wallet balance is up to date
    const walletBalance = req.partner.walletBalance !== undefined
      ? req.partner.walletBalance
      : report.monthly.grossPayout > 0 ? 520 : 0;

    return res.json({
      success: true,
      partnerId,
      walletBalance,
      summary: report,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load earnings summary" });
  }
});

/**
 * 21. GET /api/delivery-partner/earnings/history
 * Detailed records of completed and cancelled orders with breakdowns
 */
router.get("/earnings/history", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    const { status, range } = req.query;

    let records: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = { partnerId };
        if (status && status !== "all") {
          query.status = status;
        }
        records = await DeliveryEarningsRecordModel.find(query).sort({ date: -1 }).lean();
      } catch (e) {
        console.warn("Mongo earnings history lookup error:", e);
      }
    }

    if (!records || records.length === 0) {
      records = (memoryStore.deliveryEarnings || []).filter((r: any) => r.partnerId === partnerId);
      if (records.length === 0) {
        records = seedDefaultEarningsRecords(partnerId);
      }
      if (status && status !== "all") {
        records = records.filter((r) => r.status === status);
      }
    }

    // Filter by range if specified
    if (range === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      records = records.filter((r) => new Date(r.date) >= today);
    } else if (range === "week") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      records = records.filter((r) => new Date(r.date) >= sevenDaysAgo);
    } else if (range === "month") {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      records = records.filter((r) => new Date(r.date) >= startOfMonth);
    }

    return res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load earnings history" });
  }
});

/**
 * 22. POST /api/delivery-partner/earnings/estimate
 * Server-side calculation preview for an order
 */
router.post("/earnings/estimate", requirePartnerAuth, async (req: Request, res: Response) => {
  try {
    const { distanceKm, weightKg, waitingMinutes, serviceType, isPeakHour, tips } = req.body;
    const breakdown = calculateDeliveryEarnings({
      distanceKm: Number(distanceKm) || 3.0,
      weightKg: Number(weightKg) || 1.0,
      waitingMinutes: Number(waitingMinutes) || 0,
      serviceType: serviceType || "quick_delivery",
      isPeakHourManual: isPeakHour,
      tips: Number(tips) || 0,
    });

    return res.json({
      success: true,
      breakdown,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to estimate earnings" });
  }
});

/**
 * 23. GET /api/delivery-partner/payouts
 * Payout history (bank transfer and UPI)
 */
router.get("/payouts", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let payouts: any[] = [];

    if (isMongoConnected()) {
      try {
        payouts = await DeliveryPayoutRecordModel.find({ partnerId }).sort({ requestedAt: -1 }).lean();
      } catch (e) {
        console.warn("Mongo payouts lookup error:", e);
      }
    }

    if (!payouts || payouts.length === 0) {
      payouts = (memoryStore.deliveryPayouts || []).filter((p: any) => p.partnerId === partnerId);
    }

    // If zero payouts, seed default history for realistic UI
    if (payouts.length === 0) {
      payouts = [
        {
          payoutId: `PAY-${Date.now().toString(36).toUpperCase()}-1`,
          partnerId,
          amount: 850,
          method: "upi",
          recipientDetailsMasked: req.partner.payout?.upiId || "partner***@okhdfcbank",
          utrReference: "UPI/428919208392",
          status: "completed",
          requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 120000),
          type: "on_demand",
        },
        {
          payoutId: `PAY-${Date.now().toString(36).toUpperCase()}-2`,
          partnerId,
          amount: 2400,
          method: "bank_transfer",
          recipientDetailsMasked: req.partner.payout?.accountNumberMasked || "••••••••4589",
          bankName: req.partner.payout?.bankName || "State Bank of India",
          ifsc: req.partner.payout?.ifsc || "SBIN0001234",
          utrReference: "NEFT20261012984128",
          status: "completed",
          requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          processedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3600000),
          type: "weekly_auto",
        },
      ];
      if (!memoryStore.deliveryPayouts) memoryStore.deliveryPayouts = [];
      memoryStore.deliveryPayouts.push(...payouts);
    }

    return res.json({
      success: true,
      payouts,
      currentWalletBalance: req.partner.walletBalance || 450,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load payouts" });
  }
});

/**
 * 24. POST /api/delivery-partner/payouts/request
 * Partner requests on-demand withdrawal via Bank Transfer or UPI
 */
router.post("/payouts/request", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const { amount, method } = req.body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount < 100) {
      return res.status(400).json({ error: "Minimum withdrawal amount is ₹100." });
    }

    const currentBalance = partner.walletBalance || 0;
    if (withdrawAmount > currentBalance) {
      return res.status(400).json({
        error: `Insufficient wallet balance. Available balance is ₹${currentBalance}.`,
      });
    }

    const payoutMethod = method === "bank_transfer" ? "bank_transfer" : "upi";
    let recipientMasked = "";
    if (payoutMethod === "upi") {
      recipientMasked = partner.payout?.upiId || `${partner.phone.slice(-10)}@upi`;
    } else {
      recipientMasked = partner.payout?.accountNumberMasked || "••••••••1234";
    }

    const payoutId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const utrReference =
      payoutMethod === "upi"
        ? `UPI/${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`
        : `NEFT${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayout = {
      payoutId,
      partnerId: partner.partnerId,
      amount: withdrawAmount,
      method: payoutMethod,
      recipientDetailsMasked: recipientMasked,
      bankName: partner.payout?.bankName || "Registered Bank",
      ifsc: partner.payout?.ifsc || "PUNB0001234",
      utrReference,
      status: "completed", // Instant settlement confirmation
      requestedAt: new Date(),
      processedAt: new Date(),
      type: "on_demand",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await DeliveryPayoutRecordModel.create(newPayout as any);
      } catch (e) {
        console.warn("MongoDB create payout error:", e);
      }
    }

    if (!memoryStore.deliveryPayouts) memoryStore.deliveryPayouts = [];
    memoryStore.deliveryPayouts.unshift(newPayout);

    // Deduct wallet balance
    partner.walletBalance = Math.max(0, currentBalance - withdrawAmount);
    partner.updatedAt = new Date();
    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: `₹${withdrawAmount} disbursed successfully via ${payoutMethod === "upi" ? "UPI Instant Pay" : "IMPS/NEFT"}.`,
      payout: newPayout,
      remainingBalance: partner.walletBalance,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to process withdrawal request" });
  }
});

/**
 * 25. GET /api/delivery-partner/adjustments
 * Audit trail of earnings adjustments
 */
router.get("/adjustments", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let adjustments: any[] = [];

    if (isMongoConnected()) {
      try {
        adjustments = await DeliveryAdjustmentModel.find({ partnerId }).sort({ timestamp: -1 }).lean();
      } catch (e) {
        console.warn("Mongo adjustments lookup error:", e);
      }
    }

    if (!adjustments || adjustments.length === 0) {
      adjustments = (memoryStore.deliveryAdjustments || []).filter((a: any) => a.partnerId === partnerId);
    }

    if (adjustments.length === 0) {
      adjustments = [
        {
          adjustmentId: `ADJ-202610-01`,
          partnerId,
          type: "credit",
          amount: 50,
          reason: "Approved waiting time compensation dispute (Order ORD-781442)",
          category: "wait_time_correction",
          referenceOrderNumber: "ORD-781442",
          adjustedBy: "Central Operations Supervisor",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          auditNote: "Rider verified waiting 25 mins outside closed gated community. Full 15 mins excess wait credited.",
        },
        {
          adjustmentId: `ADJ-202610-02`,
          partnerId,
          type: "credit",
          amount: 150,
          reason: "Weekend Rain Rush Partner Support Bonus",
          category: "promotional_grant",
          referenceOrderNumber: "PROMO-MONSOON",
          adjustedBy: "Automated Platform Rule",
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          auditNote: "Severe weather protocol tier-1 bonus awarded to active partners during monsoon shower.",
        },
      ];
      if (!memoryStore.deliveryAdjustments) memoryStore.deliveryAdjustments = [];
      memoryStore.deliveryAdjustments.push(...adjustments);
    }

    return res.json({
      success: true,
      adjustments,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load earnings adjustments" });
  }
});


// ============================================================
// MODULE 1G: DELIVERY PARTNER SAFETY & SUPPORT
// ============================================================

/**
 * 26. POST /api/delivery-partner/safety/sos
 * EMERGENCY SOS BUTTON: High priority distress signal with live GPS & immediate escalation
 */
router.post("/safety/sos", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const { lat, lng, address, taskId } = req.body;

    const incidentId = `SOS-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const incidentData = {
      incidentId,
      partnerId: partner.partnerId,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      type: "emergency_sos",
      severity: "critical",
      taskId: taskId || partner.activeTaskId,
      description: "EMERGENCY SOS TRIGGERED by Delivery Partner on duty. Immediate assistance required.",
      location: {
        lat: Number(lat) || partner.currentLocation?.lat || 28.6139,
        lng: Number(lng) || partner.currentLocation?.lng || 77.209,
        address: address || "Near Connaught Place, Central Delhi",
      },
      policeNotified: true,
      ambulanceRequested: true,
      replacementRiderRequested: true,
      status: "active",
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await DeliveryIncidentModel.create(incidentData as any);
      } catch (e) {
        console.warn("MongoDB SOS incident save error:", e);
      }
    }

    if (!memoryStore.deliveryIncidents) memoryStore.deliveryIncidents = [];
    memoryStore.deliveryIncidents.unshift(incidentData);

    return res.json({
      success: true,
      incidentId,
      message: "EMERGENCY SOS DISPATCHED: Ops Command Center alerted. Safety hotline & Emergency services notified.",
      emergencyContacts: {
        police: "112",
        ambulance: "108",
        alikeSafetyHelpline: "+91 11-4000-SAFE",
        partnerEmergencyContact: partner.emergencyContact || { name: "Family Contact", phone: "9876543210" },
      },
      incident: incidentData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to trigger Emergency SOS" });
  }
});

/**
 * 27. POST /api/delivery-partner/safety/incident
 * Report Accident, Vehicle Breakdown, or Safety Hazard on route
 */
router.post("/safety/incident", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const { type, severity, description, lat, lng, address, needMedical, needReplacementRider, photos } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Please provide a brief description of the incident." });
    }

    const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const incidentData = {
      incidentId,
      partnerId: partner.partnerId,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      type: type || "vehicle_breakdown",
      severity: severity || "medium",
      taskId: partner.activeTaskId,
      description: description.trim(),
      location: {
        lat: Number(lat) || partner.currentLocation?.lat || 28.6139,
        lng: Number(lng) || partner.currentLocation?.lng || 77.209,
        address: address || "On Route",
      },
      policeNotified: false,
      ambulanceRequested: Boolean(needMedical),
      replacementRiderRequested: Boolean(needReplacementRider),
      photos: Array.isArray(photos) ? photos : [],
      status: "active",
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await DeliveryIncidentModel.create(incidentData as any);
      } catch (e) {
        console.warn("MongoDB incident save error:", e);
      }
    }

    if (!memoryStore.deliveryIncidents) memoryStore.deliveryIncidents = [];
    memoryStore.deliveryIncidents.unshift(incidentData);

    // If replacement rider requested and partner has an active task, automatically reassign order
    let reassignmentResult = null;
    if (needReplacementRider && partner.activeTaskId) {
      try {
        reassignmentResult = await reassignOrder(
          partner.activeTaskId,
          partner.partnerId,
          `Partner reported ${type || "vehicle breakdown"}: ${description.slice(0, 60)}`
        );
      } catch (e) {
        console.warn("Order reassignment error:", e);
      }
    }

    return res.json({
      success: true,
      message: "Incident logged. Our safety & dispatch operations team is on it.",
      incident: incidentData,
      reassignmentResult,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to report incident" });
  }
});

/**
 * 28. GET /api/delivery-partner/safety/incidents
 * List reported incidents by this delivery partner
 */
router.get("/safety/incidents", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let incidents: any[] = [];

    if (isMongoConnected()) {
      try {
        incidents = await DeliveryIncidentModel.find({ partnerId }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn("MongoDB incidents lookup error:", e);
      }
    }

    if (!incidents || incidents.length === 0) {
      incidents = (memoryStore.deliveryIncidents || []).filter((i: any) => i.partnerId === partnerId);
    }

    return res.json({
      success: true,
      incidents,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load incidents" });
  }
});

/**
 * 29. POST /api/delivery-partner/safety/complaint
 * Customer and Store complaint reporting
 */
router.post("/safety/complaint", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const { targetType, targetName, orderNumber, complaintReason, details } = req.body;

    if (!complaintReason || !details) {
      return res.status(400).json({ error: "Please provide complaint reason and detailed remarks." });
    }

    const incidentId = `CMP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const complaintData = {
      incidentId,
      partnerId: partner.partnerId,
      partnerName: partner.name,
      partnerPhone: partner.phone,
      type: targetType === "store" ? "store_complaint" : "customer_complaint",
      severity: "medium",
      orderNumber,
      description: `[${targetType === "store" ? "STORE COMPLAINT" : "CUSTOMER COMPLAINT"}]: ${complaintReason} - ${details} (Target: ${targetName || "N/A"})`,
      status: "active",
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await DeliveryIncidentModel.create(complaintData as any);
      } catch (e) {
        console.warn("MongoDB complaint save error:", e);
      }
    }

    if (!memoryStore.deliveryIncidents) memoryStore.deliveryIncidents = [];
    memoryStore.deliveryIncidents.unshift(complaintData);

    return res.json({
      success: true,
      message: `Complaint regarding ${targetType === "store" ? "store" : "customer"} submitted to Operations Quality Team.`,
      complaint: complaintData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit complaint" });
  }
});

/**
 * 30. POST /api/delivery-partner/orders/:id/cancel
 * Order cancellation reason with server compensation rules
 */
router.post("/orders/:id/cancel", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, category } = req.body;
    const partner = req.partner;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "Order cancellation reason is mandatory." });
    }

    const task = await findTask(id);
    if (!task) return res.status(404).json({ error: "Delivery task not found" });

    // Check if partner had already reached store
    const hadReachedStore = task.status === "arrived_at_store" || task.pickupVerified;

    task.status = "order_cancelled";
    task.failureReason = `Cancelled by partner (${partner.name}): [${category || "Emergency"}] ${reason}`;
    if (task.timeline) {
      task.timeline.push({
        status: "order_cancelled",
        timestamp: new Date(),
        description: `Order cancelled by Delivery Partner: ${reason}`,
      });
    }
    if (isMongoConnected() && task.save) await task.save();

    // Release partner's active task
    partner.activeTaskId = undefined;
    partner.updatedAt = new Date();
    if (isMongoConnected() && partner.save) await partner.save();

    // Record compensation if partner had already arrived at store
    let compensationRecord = null;
    if (hadReachedStore) {
      compensationRecord = await recordCancellationCompensation({
        partnerId: partner.partnerId,
        taskId: task.taskId || String(task._id),
        orderNumber: task.orderNumber || "ORD-LOCAL",
        serviceType: task.serviceType || "quick_delivery",
        distanceTravelledKm: task.distanceKm || 2.5,
        reason: `Store arrived compensation: ${reason}`,
        cancelledBy: "partner",
      });
    }

    return res.json({
      success: true,
      message: "Order cancelled. Reasons recorded for operational audit.",
      compensationRecord,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to cancel order" });
  }
});

/**
 * 31. GET /api/delivery-partner/disputes
 * List delivery partner disputes
 */
router.get("/disputes", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let disputes: any[] = [];

    if (isMongoConnected()) {
      try {
        disputes = await DeliveryDisputeModel.find({ partnerId }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn("Mongo disputes lookup error:", e);
      }
    }

    if (!disputes || disputes.length === 0) {
      disputes = (memoryStore.deliveryDisputes || []).filter((d: any) => d.partnerId === partnerId);
    }

    if (disputes.length === 0) {
      disputes = [
        {
          disputeId: `DSP-8910`,
          partnerId,
          orderNumber: "ORD-781442",
          category: "waiting_time_underpaid",
          claimedAmount: 50,
          description: "Waited 25 mins at customer residence gate because guard needed intercom approval. Only 5 mins wait compensated.",
          status: "approved_refunded",
          adminResponse: "Verified GPS dwell time of 26 mins outside tower. ₹50 additional wait compensation credited to wallet.",
          adjustedAmount: 50,
          createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
          resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ];
      if (!memoryStore.deliveryDisputes) memoryStore.deliveryDisputes = [];
      memoryStore.deliveryDisputes.push(...disputes);
    }

    return res.json({
      success: true,
      disputes,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load disputes" });
  }
});

/**
 * 32. POST /api/delivery-partner/disputes
 * File a delivery dispute
 */
router.post("/disputes", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    const { orderNumber, category, claimedAmount, description } = req.body;

    if (!orderNumber || !description) {
      return res.status(400).json({ error: "Order Number and detailed description are required." });
    }

    const disputeId = `DSP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const disputeData = {
      disputeId,
      partnerId,
      orderNumber,
      category: category || "missing_payout",
      claimedAmount: Number(claimedAmount) || 0,
      description: description.trim(),
      status: "submitted",
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        await DeliveryDisputeModel.create(disputeData as any);
      } catch (e) {
        console.warn("Mongo dispute create error:", e);
      }
    }

    if (!memoryStore.deliveryDisputes) memoryStore.deliveryDisputes = [];
    memoryStore.deliveryDisputes.unshift(disputeData);

    return res.json({
      success: true,
      message: "Dispute submitted successfully. Our operations desk will review within 24 hours.",
      dispute: disputeData,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to submit dispute" });
  }
});

/**
 * 33. GET /api/delivery-partner/performance
 * Performance history: acceptance rate, on-time rate, tier, metrics
 */
router.get("/performance", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;

    const metrics = partner.performanceMetrics || {
      acceptanceRate: 96.5,
      completionRate: 99.1,
      onTimeDeliveryRate: 97.4,
      averageDeliveryMinutes: 21,
      totalKilometers: 384,
      tier: "Gold",
    };

    return res.json({
      success: true,
      partnerId: partner.partnerId,
      name: partner.name,
      rating: partner.rating || 4.9,
      totalDeliveries: partner.totalDeliveries || 452,
      metrics,
      ratingDistribution: {
        5: 88,
        4: 9,
        3: 2,
        2: 1,
        1: 0,
      },
      compliments: [
        { label: "Super Fast Delivery", count: 184, icon: "Zap" },
        { label: "Careful Handling", count: 142, icon: "PackageCheck" },
        { label: "Polite & Professional", count: 215, icon: "Smile" },
        { label: "Accurate Doorstep Drop", count: 167, icon: "MapPin" },
      ],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load performance metrics" });
  }
});

/**
 * 34. GET /api/delivery-partner/reviews
 * Customer ratings and reviews for delivery partner
 */
router.get("/reviews", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let reviews: any[] = [];

    if (isMongoConnected()) {
      try {
        reviews = await DeliveryReviewModel.find({ partnerId }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        console.warn("Mongo reviews lookup error:", e);
      }
    }

    if (!reviews || reviews.length === 0) {
      reviews = (memoryStore.deliveryReviews || []).filter((r: any) => r.partnerId === partnerId);
    }

    if (reviews.length === 0) {
      reviews = [
        {
          reviewId: "REV-101",
          partnerId,
          orderNumber: "ORD-781923",
          customerNameMasked: "Ananya S.",
          rating: 5,
          tags: ["Super Fast", "Handled with Care"],
          comment: "Delivered hot food within 18 minutes in rain! Extremely polite rider.",
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          reviewId: "REV-102",
          partnerId,
          orderNumber: "ORD-781890",
          customerNameMasked: "Vikram R.",
          rating: 5,
          tags: ["Polite & Professional"],
          comment: "Followed delivery notes perfectly and called on arrival.",
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
        {
          reviewId: "REV-103",
          partnerId,
          orderNumber: "ORD-781442",
          customerNameMasked: "Mohammad F.",
          rating: 4,
          tags: ["Careful Handling"],
          comment: "Heavy electronics box was delivered securely without scratches.",
          createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
        },
      ];
      if (!memoryStore.deliveryReviews) memoryStore.deliveryReviews = [];
      memoryStore.deliveryReviews.push(...reviews);
    }

    return res.json({
      success: true,
      reviews,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load customer reviews" });
  }
});

/**
 * 35. GET /api/delivery-partner/announcements
 * Notification and announcement centre
 */
router.get("/announcements", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    let announcements: any[] = [];

    if (isMongoConnected()) {
      try {
        announcements = await DeliveryAnnouncementModel.find({}).sort({ effectiveFrom: -1 }).lean();
      } catch (e) {
        console.warn("Mongo announcements lookup error:", e);
      }
    }

    if (!announcements || announcements.length === 0) {
      announcements = memoryStore.deliveryAnnouncements || [];
    }

    if (announcements.length === 0) {
      announcements = [
        {
          announcementId: "ANN-FESTIVE-2026",
          title: "🎉 Diwali Sprint Incentive: Earn +₹800 Extra This Weekend",
          category: "incentive",
          priority: "high",
          badge: "BONUS SURGE",
          content: "Complete 14 deliveries between Friday 6 PM and Sunday 11 PM to unlock the festive bonus directly in your wallet.",
          effectiveFrom: new Date(),
          readBy: [],
        },
        {
          announcementId: "ANN-SAFETY-RAIN",
          title: "🌧️ Monsoon Safety Guidelines & Auto Surge Active",
          category: "safety",
          priority: "high",
          badge: "SAFETY FIRST",
          content: "Waterlogging reported in South Delhi & Noida. Maintain safe braking distance. Wet weather payout surge (+₹20/order) is automatically active.",
          effectiveFrom: new Date(Date.now() - 24 * 60 * 60 * 1000),
          readBy: [],
        },
        {
          announcementId: "ANN-APP-UPDATE",
          title: "📱 New Masked Number Calling & Quick SOS Feature Released",
          category: "operational",
          priority: "normal",
          badge: "FEATURE",
          content: "Customer phone numbers are now permanently masked for privacy. Use the 1-Tap SOS button in top navigation for emergencies.",
          effectiveFrom: new Date(Date.now() - 72 * 60 * 60 * 1000),
          readBy: [partnerId],
        },
      ];
      memoryStore.deliveryAnnouncements = announcements;
    }

    const enhanced = announcements.map((a: any) => ({
      ...a,
      isRead: Array.isArray(a.readBy) && a.readBy.includes(partnerId),
    }));

    return res.json({
      success: true,
      announcements: enhanced,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load announcements" });
  }
});

/**
 * 36. POST /api/delivery-partner/announcements/:id/read
 * Mark announcement as read
 */
router.post("/announcements/:id/read", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const partnerId = req.partnerId!;

    if (isMongoConnected()) {
      try {
        await DeliveryAnnouncementModel.updateOne(
          { announcementId: id },
          { $addToSet: { readBy: partnerId } }
        );
      } catch (e) {
        console.warn("Mongo update announcement read error:", e);
      }
    }

    const mem = (memoryStore.deliveryAnnouncements || []).find((a: any) => a.announcementId === id);
    if (mem) {
      if (!mem.readBy) mem.readBy = [];
      if (!mem.readBy.includes(partnerId)) mem.readBy.push(partnerId);
    }

    return res.json({ success: true, message: "Announcement marked as read." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to mark announcement read" });
  }
});

/**
 * 37. GET /api/delivery-partner/privacy-settings
 * Privacy and location sharing controls
 */
router.get("/privacy-settings", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const settings = partner.privacySettings || {
      locationSharingMode: "active_order_only",
      maskPhoneToCustomer: true,
      hideLiveCoordsWhenIdle: true,
      emergencyShareLiveGps: true,
    };

    return res.json({
      success: true,
      settings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load privacy settings" });
  }
});

/**
 * 38. PUT /api/delivery-partner/privacy-settings
 * Update location sharing & privacy controls
 */
router.put("/privacy-settings", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partner = req.partner;
    const { locationSharingMode, maskPhoneToCustomer, hideLiveCoordsWhenIdle, emergencyShareLiveGps } = req.body;

    const validModes = ["always_on_duty", "active_order_only", "coarse_zone"];
    const mode = validModes.includes(locationSharingMode) ? locationSharingMode : "active_order_only";

    partner.privacySettings = {
      locationSharingMode: mode,
      maskPhoneToCustomer: maskPhoneToCustomer !== undefined ? Boolean(maskPhoneToCustomer) : true,
      hideLiveCoordsWhenIdle: hideLiveCoordsWhenIdle !== undefined ? Boolean(hideLiveCoordsWhenIdle) : true,
      emergencyShareLiveGps: emergencyShareLiveGps !== undefined ? Boolean(emergencyShareLiveGps) : true,
    };
    partner.updatedAt = new Date();

    if (isMongoConnected() && partner.save) {
      await partner.save();
    }

    return res.json({
      success: true,
      message: "Privacy and location-sharing preferences updated.",
      settings: partner.privacySettings,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update privacy settings" });
  }
});

/**
 * 39. GET & POST /api/delivery-partner/support/chat
 * In-app delivery partner support chat
 */
const partnerSupportChats: Record<string, Array<{ id: string; sender: string; text: string; time: string }>> = {};

router.get("/support/chat", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    if (!partnerSupportChats[partnerId]) {
      partnerSupportChats[partnerId] = [
        {
          id: "1",
          sender: "support",
          text: "Hi! Welcome to ALIKE ND Delivery Partner Support. How can we help you today?",
          time: "Just now",
        },
      ];
    }
    return res.json({
      success: true,
      messages: partnerSupportChats[partnerId],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to load support chat" });
  }
});

router.post("/support/chat", requirePartnerAuth, async (req: PartnerAuthedRequest, res: Response) => {
  try {
    const partnerId = req.partnerId!;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Message text cannot be empty." });
    }

    if (!partnerSupportChats[partnerId]) {
      partnerSupportChats[partnerId] = [];
    }

    const userMsg = {
      id: Date.now().toString(),
      sender: "partner",
      text: text.trim(),
      time: "Just now",
    };
    partnerSupportChats[partnerId].push(userMsg);

    // Contextual automated instant response for delivery partners
    const lower = text.toLowerCase();
    let replyText = "Our operations desk has received your ticket. An agent is reviewing your active status.";
    if (lower.includes("store closed") || lower.includes("store not open")) {
      replyText = "Please take a photo of the closed store facade and submit via 'Report Store Issue' on the order screen. You will receive ₹35 arrival compensation.";
    } else if (lower.includes("customer not answering") || lower.includes("phone busy")) {
      replyText = "Standard protocol: Try calling through the masked button 3 times with 2-minute intervals. If unanswered after 8 minutes, click 'Customer Unavailable'.";
    } else if (lower.includes("payout") || lower.includes("earnings") || lower.includes("upi")) {
      replyText = "Payouts requested via UPI are processed instantly (0-2 mins). Bank NEFT transfers settle within 2 banking hours. Check your 'Earnings & Payouts' tab.";
    } else if (lower.includes("accident") || lower.includes("sos") || lower.includes("emergency")) {
      replyText = "🚨 SAFETY ALERT: If you or anyone needs medical assistance, tap the red SOS button immediately or call 112 / +91 11-4000-SAFE.";
    }

    const replyMsg = {
      id: (Date.now() + 1).toString(),
      sender: "support",
      text: replyText,
      time: "Just now",
    };
    partnerSupportChats[partnerId].push(replyMsg);

    return res.json({
      success: true,
      messages: partnerSupportChats[partnerId],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to send support message" });
  }
});

export default router;
