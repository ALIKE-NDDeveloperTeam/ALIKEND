import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";
import Customer from "../models/Customer";
import Seller from "../models/Seller";
import OtpVerification from "../models/OtpVerification";
import { sendOtpEmail } from "../services/mailer";
import { isMongoConnected, memoryStore, getMongoDbInfo, connectMongoDB, INITIAL_SUPERADMIN_EMAIL, INITIAL_STAFF_EMAIL } from "../store";
import { logActivity } from "../utils/activityLogger";
import { syncAdminPasswordToMemoryStore } from "./auth";
import { resolveAdminRole, timingSafePasswordEqual } from "../middleware/auth";
import { getJwtSecret } from "../config/jwt";
import { firebaseAuth } from "../utils/firebaseAdmin";
import { checkLoginRateLimit, recordFailedLoginAttempt, resetLoginAttempts } from "../utils/bruteForce";
<<<<<<< HEAD
import { isValidCoordinate } from "../services/geoService";
=======
<<<<<<< HEAD
import { isValidCoordinate } from "../services/geoService";
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

const router = Router();

// GET /api/auth/status - Check MongoDB connection status & target collection
router.get("/status", async (_req, res) => {
  const dbInfo = getMongoDbInfo();
  let userCount = 0;
  
  if (isMongoConnected()) {
    try {
      userCount = await User.countDocuments();
    } catch (e: any) {
      console.warn("Could not query user count:", e.message);
    }
  } else {
    userCount = memoryStore.users.length;
  }

  return res.json({
    ...dbInfo,
    targetDatabase: "alikendshop",
    targetCollection: "users",
    totalUsersCount: userCount,
  });
});

// POST /api/auth/reconnect - Trigger reconnection attempt to MongoDB Atlas
router.post("/reconnect", async (_req, res) => {
  console.log("🔄 [MONGODB RECONNECT] Received explicit reconnect request from client...");
  try {
    await connectMongoDB(true);
    const dbInfo = getMongoDbInfo();
    return res.json({
      success: dbInfo.connected,
      ...dbInfo,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || String(err),
    });
  }
});

// ==========================================
// OTP Endpoints (via Gmail SMTP / nodemailer)
// ==========================================

// POST /api/auth/otp/send - Generate 6-digit OTP, store with 10-min expiry, send via Gmail SMTP
router.post("/otp/send", async (req, res) => {
  try {
    const { email, purpose = "verification" } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({ error: "Email address is required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address format." });
    }

    // Generate cryptographically secure random 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    // Expiry: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save in MongoDB if connected
    if (isMongoConnected()) {
      try {
        await OtpVerification.deleteMany({ email: cleanEmail, purpose });
        await OtpVerification.create({
          email: cleanEmail,
          otp: otpCode,
          purpose,
          expiresAt,
        });
      } catch (dbErr: any) {
        console.warn("MongoDB OTP write warning:", dbErr.message);
      }
    }

    // Also store in memoryStore for reliability
    if (!memoryStore.otps) {
      memoryStore.otps = [];
    }
    memoryStore.otps = memoryStore.otps.filter(
      (o) => !(o.email === cleanEmail && o.purpose === purpose)
    );
    memoryStore.otps.push({
      email: cleanEmail,
      otp: otpCode,
      purpose,
      expiresAt,
      createdAt: new Date(),
    });

    // Respond immediately so user isn't waiting on SMTP round-trip; send email in background
    const otpGenTime = new Date().toISOString();
    sendOtpEmail(cleanEmail, otpCode, purpose)
      .then((mRes) => {
        console.log(`✅ [BG OTP DISPATCH COMPLETE at ${new Date().toISOString()}] To: ${cleanEmail} | Mode: ${mRes.mode}`);
      })
      .catch((err) => {
        console.error(`💥 [BG OTP DISPATCH FAILED] To: ${cleanEmail}:`, err.message || err);
      });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Valid for 10 minutes.`,
      email: cleanEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime,
    });
  } catch (err: any) {
    console.error("💥 [OTP SEND ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to dispatch verification code." });
  }
});

// POST /api/auth/otp/verify - Verify submitted 6-digit OTP
router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp, purpose = "verification" } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and 6-digit OTP code are required." });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const cleanOtp = String(otp).trim();
    const now = new Date();

    let isMatch = false;

    // Check MongoDB with attempt tracking
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          email: cleanEmail,
          expiresAt: { $gt: now },
        });

        if (record) {
          const currentAttempts = (record.attempts || 0) + 1;
          if (currentAttempts > 5) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(429).json({
              success: false,
              error: "Too many failed OTP verification attempts. This verification code has been invalidated for security. Please request a new one.",
            });
          }

          if (record.otp === cleanOtp) {
            isMatch = true;
            await OtpVerification.deleteOne({ _id: record._id });
          } else {
            await OtpVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
          }
        }
      } catch (dbErr: any) {
        console.warn("MongoDB OTP verify warning:", dbErr.message);
      }
    }

    // Check memoryStore fallback if not matched yet
    if (!isMatch && memoryStore.otps) {
      const rec = memoryStore.otps.find(
        (o) => o.email === cleanEmail && new Date(o.expiresAt) > now
      );
      if (rec) {
        (rec as any).attempts = ((rec as any).attempts || 0) + 1;
        if ((rec as any).attempts > 5) {
          memoryStore.otps = memoryStore.otps.filter((o) => o !== rec);
          return res.status(429).json({
            success: false,
            error: "Too many failed OTP verification attempts. Code invalidated. Please request a new one.",
          });
        }
        if (rec.otp === cleanOtp) {
          isMatch = true;
          memoryStore.otps = memoryStore.otps.filter((o) => o !== rec);
        }
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired verification code. Please check the code or request a new one.",
      });
    }

    return res.json({
      success: true,
      message: "Email verification successful.",
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error("💥 [OTP VERIFY ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify OTP code." });
  }
});

// POST /api/auth/forgot-password/send-otp - Send OTP for password recovery (Email Only)
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ error: "Please provide your registered email address." });
    }

    const cleanEmail = String(identifier).trim().toLowerCase();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: "Password reset is only available via email. Please provide a valid email address.",
      });
    }

    let userEmail: string | null = null;
    let userName = "Valued Customer";

    // Strictly find user by email (phone/mobile numbers cannot receive email OTPs)
    if (isMongoConnected()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          userEmail = user.email;
          userName = user.fullName || "Valued Customer";
        }
      } catch (e: any) {
        console.warn("Mongo find user for forgot-password warning:", e.message);
      }
    }

    if (!userEmail) {
      const memUser = (memoryStore.users || []).find(
        (u) => u.email && u.email.toLowerCase().trim() === cleanEmail
      );
      if (memUser) {
        userEmail = memUser.email;
        userName = memUser.fullName || "Valued Customer";
      }
    }

    if (!userEmail) {
      return res.status(404).json({
        error: "No account found with this email address, or this account was registered using a mobile number and does not support email-based password reset.",
      });
    }

    // Generate cryptographically secure random 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (isMongoConnected()) {
      try {
        await OtpVerification.deleteMany({ email: userEmail, purpose: "forgot_password" });
        await OtpVerification.create({
          email: userEmail,
          otp: otpCode,
          purpose: "forgot_password",
          expiresAt,
        });
      } catch (e: any) {
        console.warn("Mongo OTP create warning:", e.message);
      }
    }

    if (!memoryStore.otps) memoryStore.otps = [];
    memoryStore.otps = memoryStore.otps.filter(
      (o) => !(o.email === userEmail && o.purpose === "forgot_password")
    );
    memoryStore.otps.push({
      email: userEmail,
      otp: otpCode,
      purpose: "forgot_password",
      expiresAt,
      createdAt: new Date(),
    });

    // Respond immediately so user isn't waiting on SMTP round-trip; send email in background
    const otpGenTime = new Date().toISOString();
    sendOtpEmail(userEmail, otpCode, "forgot_password")
      .then((mRes) => {
        console.log(`✅ [BG FORGOT-PW OTP DISPATCH COMPLETE at ${new Date().toISOString()}] To: ${userEmail} | Mode: ${mRes.mode}`);
      })
      .catch((err) => {
        console.error(`💥 [BG FORGOT-PW OTP DISPATCH FAILED] To: ${userEmail}:`, err.message || err);
      });

    return res.json({
      success: true,
      message: `Verification code sent to ${userEmail}. Code valid for 10 minutes. Check your inbox and spam folder.`,
      email: userEmail,
      expiresInMinutes: 10,
      generatedAt: otpGenTime,
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD SEND OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to send reset code." });
  }
});

// POST /api/auth/forgot-password/verify-otp - Verify OTP before unlocking password fields
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and 6-digit OTP code are required." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const now = new Date();

    let isMatch = false;
    let verifiedEmail = cleanId;

    // Check MongoDB strictly matching email AND purpose
    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          email: cleanId,
          purpose: "forgot_password",
          expiresAt: { $gt: now },
        });

        if (record) {
          const currentAttempts = (record.attempts || 0) + 1;
          if (currentAttempts > 5) {
            await OtpVerification.deleteOne({ _id: record._id });
            return res.status(429).json({
              success: false,
              error: "Too many failed reset code attempts. This code has been invalidated for security. Please request a new code.",
            });
          }

          if (record.otp === cleanOtp) {
            isMatch = true;
            verifiedEmail = record.email;
          } else {
            await OtpVerification.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
          }
        }
      } catch (e: any) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }

    if (!isMatch && memoryStore.otps) {
      const found = memoryStore.otps.find(
        (o) =>
          o.email === cleanId &&
          o.purpose === "forgot_password" &&
          new Date(o.expiresAt) > now
      );
      if (found) {
        (found as any).attempts = ((found as any).attempts || 0) + 1;
        if ((found as any).attempts > 5) {
          memoryStore.otps = memoryStore.otps.filter((o) => o !== found);
          return res.status(429).json({
            success: false,
            error: "Too many failed reset code attempts. Code invalidated. Please request a new code.",
          });
        }
        if (found.otp === cleanOtp) {
          isMatch = true;
          verifiedEmail = found.email;
        }
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid or expired OTP code. Please enter the correct 6-digit code or request a new one.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: "OTP code verified successfully! You may now enter your new password.",
      email: verifiedEmail,
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD VERIFY OTP ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to verify reset code." });
  }
});

// POST /api/auth/forgot-password/reset - Verify OTP and update password
router.post("/forgot-password/reset", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    if (!identifier || !otp || !newPassword) {
      return res.status(400).json({ error: "Identifier, OTP code, and new password are required." });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const now = new Date();

    // Verify OTP strictly for this email and purpose
    let isMatch = false;
    let verifiedEmail = cleanId;

    if (isMongoConnected()) {
      try {
        const record = await OtpVerification.findOne({
          email: cleanId,
          otp: cleanOtp,
          purpose: "forgot_password",
          expiresAt: { $gt: now },
        });
        if (record) {
          isMatch = true;
          verifiedEmail = record.email;
          await OtpVerification.deleteOne({ _id: record._id });
        }
      } catch (e: any) {
        console.warn("Mongo verify forgot-password error:", e.message);
      }
    }

    if (!isMatch && memoryStore.otps) {
      const idx = memoryStore.otps.findIndex(
        (o) =>
          o.email === cleanId &&
          o.otp === cleanOtp &&
          o.purpose === "forgot_password" &&
          new Date(o.expiresAt) > now
      );
      if (idx >= 0) {
        isMatch = true;
        verifiedEmail = memoryStore.otps[idx].email;
        memoryStore.otps.splice(idx, 1);
      }
    }

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid or expired OTP code. Please request a new verification code.",
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password in Mongo
    if (isMongoConnected()) {
      try {
        await User.updateOne(
          {
            $or: [
              { email: verifiedEmail },
              { email: cleanId },
              { mobileNumber: cleanId },
              { phone: cleanId },
            ],
          },
          { $set: { passwordHash: newHash } }
        );
      } catch (e: any) {
        console.warn("Mongo update password error:", e.message);
      }
    }

    // Update in memoryStore
    const memIdx = memoryStore.users.findIndex(
      (u) =>
        u.email === verifiedEmail ||
        u.email === cleanId ||
        u.mobileNumber === cleanId ||
        u.phone === cleanId
    );
    if (memIdx >= 0) {
      memoryStore.users[memIdx].passwordHash = newHash;
    }

    // If this user is also an Admin, update Admin document in MongoDB and sync memoryStore.admins
    const targetAdminEmails = [verifiedEmail.toLowerCase().trim(), cleanId.toLowerCase().trim()];
    if (isMongoConnected()) {
      try {
        await Admin.updateMany(
          { email: { $in: targetAdminEmails } },
          { $set: { passwordHash: newHash } }
        );
      } catch (adminDbErr: any) {
        console.warn("Mongo update admin password error:", adminDbErr.message);
      }
    }
    for (const em of targetAdminEmails) {
      syncAdminPasswordToMemoryStore(em, newHash);
    }

    return res.json({
      success: true,
      message: "Password reset successful! You may now sign in with your new password.",
    });
  } catch (err: any) {
    console.error("💥 [FORGOT PASSWORD RESET ERROR]:", err);
    return res.status(500).json({ error: err.message || "Failed to reset password." });
  }
});


// POST /api/auth/register - Register new user directly into MongoDB
router.post("/register", async (req, res) => {
  console.log("==================================================");
  console.log("📝 [REGISTRATION INCOMING REQUEST]");
  console.log("Time:", new Date().toISOString());
  console.log("Payload:", {
    fullName: req.body?.fullName,
    email: req.body?.email,
    country: req.body?.country,
    mobileNumber: req.body?.mobileNumber,
    hasPassword: !!req.body?.password,
  });

  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const { fullName, email, country, mobileNumber, password, registrationMethod } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const cleanMobile = String(mobileNumber || "").trim();
    let cleanEmail = email ? String(email).toLowerCase().trim() : "";

    if (!cleanEmail && !cleanMobile) {
      return res.status(400).json({
        error: "Please provide either a mobile number or a Gmail/email address.",
      });
    }

    if (!cleanEmail && cleanMobile) {
      // Auto-assign clean internal identifier for mobile-only registrations
      const digits = cleanMobile.replace(/\D/g, "");
      cleanEmail = `${digits || Date.now()}@customer.alike.com`;
    }

    const cleanCountry = String(country || "Bangladesh").trim();
    const cleanName = String(fullName || cleanEmail.split("@")[0] || cleanMobile).trim();
    const phone = cleanMobile ? `${cleanCountry} ${cleanMobile}` : "";

    console.log(`🔍 [REGISTRATION CHECK] Checking if user exists (email: ${cleanEmail}, mobile: ${cleanMobile})...`);

    // 1. If MongoDB is connected, save directly to MongoDB 'users' collection in 'alikendshop' database
    if (isMongoConnected()) {
      try {
        const query: any[] = [{ email: cleanEmail }];
        if (cleanMobile) {
          query.push({ mobileNumber: cleanMobile });
          query.push({ phone: { $regex: cleanMobile.slice(-8) } });
        }
        const existingMongoUser = await User.findOne({ $or: query });
        if (existingMongoUser) {
          const isPhoneConflict = cleanMobile && existingMongoUser.mobileNumber === cleanMobile;
          const msg = isPhoneConflict
            ? "An account with this mobile number already exists."
            : "An account with this email address already exists.";
          console.warn(`⚠️ [REGISTRATION REJECTED] ${msg}`);
          await logActivity(
            {
              eventType: "Registration",
              status: "failed",
              userName: cleanName,
              email: cleanEmail,
              details: `Registration rejected: ${msg}`,
            },
            req
          );
          return res.status(400).json({ error: msg });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        console.log(`💾 [REGISTRATION MONGODB] Saving document to database 'alikendshop', collection 'users'...`);
        
        const newUser = await User.create({
          fullName: cleanName,
          email: cleanEmail,
          country: cleanCountry,
          mobileNumber: cleanMobile,
          phone: phone,
          passwordHash: passwordHash,
          tier: "Silver",
          verified: true,
        });

        console.log(`✅ [REGISTRATION MONGODB SUCCESS] User document created successfully! ID: ${newUser._id}`);

        // Sync with Customer overview for Admin Panel
        try {
          const existingCustomer = await Customer.findOne({ email: cleanEmail });
          if (!existingCustomer) {
            await Customer.create({
              name: cleanName,
              email: cleanEmail,
              tier: "Silver",
              ordersCount: 0,
              lifetimeSpend: 0,
            });
            console.log(`✨ [SYNC CUSTOMER] Added to customer roster for admin panel: ${cleanEmail}`);
          }
        } catch (cErr: any) {
          console.warn("Customer sync notice:", cErr?.message);
        }

        // Record Activity Log automatically
        await logActivity(
          {
            eventType: "Registration",
            status: "success",
            userName: newUser.fullName,
            email: newUser.email,
            details: "New account registered successfully in alikendshop.users",
          },
          req
        );

        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, secret, { expiresIn: "30d" });

        return res.status(201).json({
          success: true,
          message: "Registration successful and saved to MongoDB alikendshop.users",
          user: {
            _id: newUser._id,
            name: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone || `${newUser.country} ${newUser.mobileNumber}`,
            country: newUser.country,
            mobileNumber: newUser.mobileNumber,
            tier: newUser.tier,
          },
          token,
          storage: "mongodb",
          database: "alikendshop",
          collection: "users",
        });
      } catch (dbError: any) {
        console.error("❌ [REGISTRATION MONGODB ERROR]:", dbError);
        // If DB write failed, log and fallback to memory store while returning error details if needed
      }
    } else {
      console.warn("⚠️ [REGISTRATION NOTICE] MongoDB is not connected. MONGO_URI may be missing or invalid. Falling back to in-memory store.");
    }

    // 2. Fallback memory store if MongoDB is offline
    const existingMemUser = memoryStore.users.find((u) => u.email === cleanEmail);
    if (existingMemUser) {
      console.warn(`⚠️ [REGISTRATION REJECTED] Email ${cleanEmail} already exists in memory store.`);
      await logActivity(
        {
          eventType: "Registration",
          status: "failed",
          userName: cleanName,
          email: cleanEmail,
          details: "Registration rejected: Email already exists in memory store",
        },
        req
      );
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newMemUser = {
      _id: `user_${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      country: cleanCountry,
      mobileNumber: cleanMobile,
      phone: phone,
      passwordHash: passwordHash,
      tier: "Silver" as const,
      verified: true,
      createdAt: new Date(),
    };

    memoryStore.users.push(newMemUser);
    
    // Also push to memory customers
    const existingMemCust = memoryStore.customers.find((c) => c.email === cleanEmail);
    if (!existingMemCust) {
      memoryStore.customers.push({
        _id: `cust_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        tier: "Silver",
        ordersCount: 0,
        lifetimeSpend: 0,
        createdAt: new Date(),
      });
    }

    console.log(`ℹ️ [REGISTRATION MEMORY SUCCESS] Saved to in-memory store. Total in-memory users: ${memoryStore.users.length}`);

    await logActivity(
      {
        eventType: "Registration",
        status: "success",
        userName: newMemUser.fullName,
        email: newMemUser.email,
        details: "New account registered (in-memory mode)",
      },
      req
    );

    const token = jwt.sign({ userId: newMemUser._id, email: newMemUser.email }, secret, { expiresIn: "30d" });

    return res.status(201).json({
      success: true,
      message: "Registration completed (in-memory mode, MongoDB currently offline)",
      user: {
        _id: newMemUser._id,
        name: newMemUser.fullName,
        email: newMemUser.email,
        phone: newMemUser.phone,
        country: newMemUser.country,
        mobileNumber: newMemUser.mobileNumber,
        tier: newMemUser.tier,
      },
      token,
      storage: "in-memory-fallback",
      database: "alikendshop",
      collection: "users",
    });
  } catch (err: any) {
    console.error("💥 [REGISTRATION FATAL ERROR]:", err);
    return res.status(500).json({
      error: err.message || "Registration encountered an internal server error",
    });
  }
});

// POST /api/auth/login - User password authentication against MongoDB alikendshop.users with memoryStore fallback
router.post("/login", async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, error: "Email/Phone and password are required" });
    }

    const cleanId = String(identifier).toLowerCase().trim();
    const targetSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || INITIAL_SUPERADMIN_EMAIL || "developer.alikend@gmail.com").trim().toLowerCase();

    // Check brute-force rate limit (5 attempts within 15 minutes per IP / identifier)
    const rateLimit = await checkLoginRateLimit(req, cleanId);
    if (!rateLimit.allowed) {
      if (rateLimit.status === 503) {
        return res.status(503).json({ success: false, error: rateLimit.error });
      }
      res.setHeader("Retry-After", String(rateLimit.retryAfter || 900));
      return res.status(429).json({ success: false, error: "Too many attempts, try again later" });
    }

    const rawTrimmed = String(identifier).trim();
    const digitsOnly = rawTrimmed.replace(/\D/g, "");
    const isPotentialPhone = !rawTrimmed.includes("@") && digitsOnly.length >= 6;
    const phoneCandidates: string[] = isPotentialPhone
      ? Array.from(new Set([
          rawTrimmed,
          digitsOnly,
          digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly,
          digitsOnly.startsWith("880") ? digitsOnly.slice(3) : digitsOnly,
          digitsOnly.startsWith("8800") ? digitsOnly.slice(4) : digitsOnly,
          digitsOnly.length === 10 ? `0${digitsOnly}` : "",
          digitsOnly.length === 10 ? `+880 ${digitsOnly}` : "",
          digitsOnly.length === 10 ? `+880${digitsOnly}` : "",
        ])).filter((p) => p && p.length >= 6)
      : [];

    // 1. Query MongoDB alikendshop.users collection first if connected
    let user: any = null;
    let isFromMongo = false;

    if (!isMongoConnected()) {
      try {
        await connectMongoDB();
      } catch {}
    }

    if (isMongoConnected()) {
      try {
        const orConditions: any[] = [
          { email: cleanId },
          { username: cleanId },
        ];
        // Exact equality matching only for normalized phone candidates (no regex, no partial/suffix matching)
        for (const candidate of phoneCandidates) {
          orConditions.push({ mobileNumber: candidate });
          orConditions.push({ phone: candidate });
        }
        user = await User.findOne({ $or: orConditions });
        if (user) isFromMongo = true;
      } catch (dbErr: any) {
        console.warn("MongoDB user lookup warning:", dbErr?.message);
      }
    }

    // 2. Fallback to memoryStore.users if not found in MongoDB or MongoDB is offline
    // Matches ONLY by exact equality (no regex, no partial/suffix matching)
    if (!user) {
      user = (memoryStore.users || []).find(
        (u) =>
          u.email?.toLowerCase() === cleanId ||
          u.username?.toLowerCase() === cleanId ||
          phoneCandidates.some((candidate) => u.mobileNumber === candidate || u.phone === candidate)
      );
    }

    // 3. Fallback: If this is an administrator logging in via customer modal
    let matchedAdminDoc: any = null;
    if (isMongoConnected()) {
      try {
        matchedAdminDoc = await Admin.findOne({ email: cleanId });
      } catch {}
    }
    const isSuperAdminAccount = cleanId === targetSuperAdminEmail;

    if (!matchedAdminDoc && isSuperAdminAccount) {
      matchedAdminDoc = (memoryStore.admins || []).find(
        (a) => a.email?.toLowerCase() === cleanId
      ) || {
        _id: "admin_super_init",
        email: targetSuperAdminEmail,
        name: "Super Admin",
        role: "superadmin",
        isActive: true,
      };
    } else if (!matchedAdminDoc) {
      matchedAdminDoc = (memoryStore.admins || []).find(
        (a) => a.email?.toLowerCase() === cleanId
      );
    }

    // If this user is an admin and has an updated passwordHash in admin collection, keep user record updated
    if (matchedAdminDoc && user && matchedAdminDoc.passwordHash) {
      user.passwordHash = matchedAdminDoc.passwordHash;
    }

    if (!user && matchedAdminDoc && matchedAdminDoc.isActive !== false) {
        let isPassMatch = false;

        if (isSuperAdminAccount) {
          // The INITIAL_ADMIN_PASSWORD env variable is the source of truth for the superadmin account
          const rawEnvPassword = process.env.INITIAL_ADMIN_PASSWORD;
          const expectedPassword = rawEnvPassword ? rawEnvPassword.trim() : "";
          const trimmedSubmittedPassword = password ? String(password).trim() : "";

          const expectedByteLen = Buffer.byteLength(expectedPassword, "utf-8");
          const submittedByteLen = Buffer.byteLength(password, "utf-8");
          const trimmedByteLen = Buffer.byteLength(trimmedSubmittedPassword, "utf-8");

          // Guard: Check that buffers have equal length first (Buffer.byteLength comparison)
          // and return 401 immediately if lengths differ, instead of letting timingSafeEqual throw
          if (expectedByteLen === 0 || (submittedByteLen !== expectedByteLen && trimmedByteLen !== expectedByteLen)) {
            await recordFailedLoginAttempt(req, cleanId);
            return res.status(401).json({
              success: false,
              error: "Invalid credentials",
            });
          }

          if (
            expectedPassword &&
            (timingSafePasswordEqual(password, expectedPassword) || timingSafePasswordEqual(trimmedSubmittedPassword, expectedPassword))
          ) {
            isPassMatch = true;
            try {
              const freshHash = await bcrypt.hash(expectedPassword, 10);
              matchedAdminDoc.passwordHash = freshHash;
              syncAdminPasswordToMemoryStore(cleanId, freshHash, { role: "superadmin", isActive: true });
              if (isMongoConnected() && matchedAdminDoc.save) {
                await matchedAdminDoc.save().catch(() => null);
              }
            } catch {}
          } else {
            // If the submitted password does not match the env value, reject with 401 "Invalid credentials"
            isPassMatch = false;
          }
        } else {
          // Staff admins keep using their own stored hashes
          const hasAdminHash = Boolean(matchedAdminDoc.passwordHash && String(matchedAdminDoc.passwordHash).trim() !== "");
          if (hasAdminHash) {
            try {
              isPassMatch = await bcrypt.compare(password, matchedAdminDoc.passwordHash);
            } catch {
              isPassMatch = false;
            }
          }
        }

        if (isPassMatch) {
          user = {
            _id: String(matchedAdminDoc._id || `admin_user_${Date.now()}`),
            fullName: matchedAdminDoc.name || "Administrator",
            email: matchedAdminDoc.email,
            country: "+880",
            mobileNumber: "1700000000",
            phone: "+880 1700000000",
            passwordHash: matchedAdminDoc.passwordHash,
            tier: "Platinum",
            isBlocked: false,
          };
          // Also persist in memoryStore.users for session continuity
          const existingMem = (memoryStore.users || []).find((u) => u.email?.toLowerCase() === cleanId);
          if (!existingMem) {
            memoryStore.users.push({
              _id: user._id,
              fullName: user.fullName,
              email: user.email,
              country: user.country,
              mobileNumber: user.mobileNumber,
              phone: user.phone,
              passwordHash: matchedAdminDoc.passwordHash,
              tier: "Platinum",
              verified: true,
              createdAt: new Date(),
            });
          }
        } else {
          await recordFailedLoginAttempt(req, cleanId);
          return res.status(401).json({
            success: false,
            error: "Invalid credentials",
          });
        }
      }

    // 4. If no matching user document found anywhere, fail with generic 401
    if (!user) {
      await recordFailedLoginAttempt(req, cleanId);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: "Unregistered User",
          email: cleanId,
          details: "Login failed: Invalid credentials",
        },
        req
      );
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // 5. Check if user account is blocked by admin
    if (user.isBlocked) {
      await recordFailedLoginAttempt(req, cleanId);
      console.info(`[LOGIN] Blocked account attempted login: ${cleanId}`);
      await logActivity(
        {
          eventType: "Failed Login",
          status: "failed",
          userName: user.fullName,
          email: user.email,
          details: "Login blocked: Account has been suspended by administrator",
        },
        req
      );
      return res.status(403).json({
        success: false,
        error: "Your account has been suspended or blocked by an administrator. Please contact support.",
      });
    }

    // 6. Check password if not already validated via admin path
    if (!matchedAdminDoc) {
      const userEmailClean = user.email?.toLowerCase().trim();
      const isSuperAdminUser = cleanId === targetSuperAdminEmail || userEmailClean === targetSuperAdminEmail;

      const hasStoredHash = Boolean(user.passwordHash && String(user.passwordHash).trim() !== "");
      let isPasswordValid = false;

      if (isSuperAdminUser) {
        // The INITIAL_ADMIN_PASSWORD env variable is the source of truth for the superadmin account
        const rawEnvPassword = process.env.INITIAL_ADMIN_PASSWORD;
        const expectedPassword = rawEnvPassword ? rawEnvPassword.trim() : "";
        const trimmedSubmittedPassword = password ? String(password).trim() : "";

        const expectedByteLen = Buffer.byteLength(expectedPassword, "utf-8");
        const submittedByteLen = Buffer.byteLength(password, "utf-8");
        const trimmedByteLen = Buffer.byteLength(trimmedSubmittedPassword, "utf-8");

        // Guard: Check that buffers have equal length first (Buffer.byteLength comparison)
        // and return 401 immediately if lengths differ, instead of letting timingSafeEqual throw
        if (expectedByteLen === 0 || (submittedByteLen !== expectedByteLen && trimmedByteLen !== expectedByteLen)) {
          await recordFailedLoginAttempt(req, cleanId);
          await logActivity(
            {
              eventType: "Failed Login",
              status: "failed",
              userName: user.fullName,
              email: user.email,
              details: "Login failed: Invalid credentials",
            },
            req
          );
          return res.status(401).json({
            success: false,
            error: "Invalid credentials",
          });
        }

        if (
          expectedPassword &&
          (timingSafePasswordEqual(password, expectedPassword) || timingSafePasswordEqual(trimmedSubmittedPassword, expectedPassword))
        ) {
          isPasswordValid = true;
          try {
            const freshHash = await bcrypt.hash(expectedPassword, 10);
            user.passwordHash = freshHash;
            if (isFromMongo && typeof user.save === "function") {
              await user.save().catch(() => null);
            }
            if (isMongoConnected()) {
              await Admin.updateOne(
                { email: targetSuperAdminEmail },
                { $set: { passwordHash: freshHash, role: "superadmin", isActive: true } },
                { upsert: true }
              ).catch(() => null);
            }
            syncAdminPasswordToMemoryStore(targetSuperAdminEmail, freshHash, { role: "superadmin", isActive: true });
          } catch {}
        } else {
          // If the submitted password does not match the env value, reject with 401 "Invalid credentials"
          isPasswordValid = false;
        }
      } else {
        // Staff admins and customers keep using their own stored hashes
        if (hasStoredHash) {
          try {
            isPasswordValid = await bcrypt.compare(password, user.passwordHash);
          } catch {
            isPasswordValid = false;
          }
        }
      }

      if (!isPasswordValid) {
        await recordFailedLoginAttempt(req, cleanId);
        await logActivity(
          {
            eventType: "Failed Login",
            status: "failed",
            userName: user.fullName,
            email: user.email,
            details: "Login failed: Invalid credentials",
          },
          req
        );
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      } else if (!hasStoredHash) {
        try {
          const newHash = await bcrypt.hash(password, 10);
          user.passwordHash = newHash;
          if (isFromMongo && typeof user.save === "function") {
            await user.save();
          }
        } catch (_saveErr) {}
      }
    }

    // User authenticated successfully
    console.log(`✅ [LOGIN SUCCESS] User authenticated: ${user.email} (ID: ${user._id})`);
    
    // Reset brute-force counter for this identifier
    await resetLoginAttempts(cleanId, user.email, user.phone, user.mobileNumber);
    
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: user.fullName,
        email: user.email,
        details: "Password authentication verified",
      },
      req
    );

    const token = jwt.sign({ userId: user._id, email: user.email, role: "customer" }, secret, { expiresIn: "30d" });

    // Check if this user is also registered as an Administrator
    let adminToken: string | null = null;
    let isAdmin = false;
    let adminRole: "superadmin" | "admin" | null = null;

    try {
      let adminDoc = matchedAdminDoc;
      if (!adminDoc && isMongoConnected()) {
        adminDoc = await Admin.findOne({ email: user.email.toLowerCase().trim() });
      }
      if (!adminDoc && user.email.toLowerCase().trim() === targetSuperAdminEmail) {
        adminDoc = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === targetSuperAdminEmail) || {
          _id: user._id || "admin_super_init",
          email: targetSuperAdminEmail,
          name: user.fullName || "Super Admin",
          role: "superadmin",
          isActive: true,
        };
      } else if (!adminDoc && process.env.NODE_ENV !== "production") {
        adminDoc = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === user.email.toLowerCase().trim());
      }

      // Mint admin token ONLY if stored role is explicitly "superadmin" or "admin"
      if (adminDoc && adminDoc.isActive !== false && (adminDoc.role === "superadmin" || adminDoc.role === "admin")) {
        isAdmin = true;
        adminRole = adminDoc.role === "superadmin" ? "superadmin" : "admin";
        adminToken = jwt.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
          secret,
          { expiresIn: "7d" }
        );
        console.log(`👑 [ADMIN PRIVILEGE DETECTED] Auto-minted admin token on login for: ${user.email} [Role: ${adminRole}]`);
      }
    } catch (e) {
      console.warn("Admin check warning:", e);
    }

    // Check if this user is an approved Seller
    let isSeller = false;
    let sellerStatus: string | null = null;
    let sellerShopName: string | null = null;
    try {
      let sellerDoc: any = null;
      if (isMongoConnected()) {
        sellerDoc = await Seller.findOne({ email: user.email.toLowerCase().trim() });
      }
      if (!sellerDoc) {
        sellerDoc = (memoryStore.sellers || []).find((s) => s.email?.toLowerCase() === user.email.toLowerCase().trim());
      }
      if (sellerDoc) {
        sellerStatus = sellerDoc.status;
        isSeller = sellerDoc.status === "approved";
        sellerShopName = sellerDoc.shopName;
      }
    } catch (sErr) {
      console.warn("Seller status lookup warning:", sErr);
    }

    return res.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.fullName,
        email: user.email,
        phone: user.phone || `${user.country} ${user.mobileNumber}`,
        country: user.country,
        mobileNumber: user.mobileNumber,
        tier: user.tier || "Silver",
<<<<<<< HEAD
        savedLocation: user.savedLocation || null,
=======
<<<<<<< HEAD
        savedLocation: user.savedLocation || null,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      },
      token,
      isAdmin,
      adminRole: isAdmin ? adminRole : null,
      adminToken: isAdmin ? adminToken : null,
      isSeller,
      sellerStatus,
      sellerShopName,
    });
  } catch (err: any) {
    console.error("💥 [LOGIN ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Login failed due to an internal server error" });
  }
});

// POST /api/auth/google - Authenticate or verify Google account against MongoDB alikendshop.users
router.post("/google", async (req, res) => {
  try {
    const secret = getJwtSecret();
<<<<<<< HEAD

    const { idToken, email, fullName, name, photoURL, autoRegister = true } = req.body || {};

    let cleanEmail = "";
    let cleanName = "";
    let avatarUrl = typeof photoURL === "string" ? photoURL.trim() : "";

    // 1. Try verifying Google ID token via Firebase Admin SDK, with JWT decode fallback if project IDs differ
    if (idToken && typeof idToken === "string") {
      try {
        const decoded: any = await firebaseAuth.verifyIdToken(idToken);
        if (decoded && decoded.email) {
          cleanEmail = String(decoded.email).toLowerCase().trim();
        }
        if (decoded && decoded.name) {
          cleanName = String(decoded.name).trim();
        }
        if (!avatarUrl && decoded && decoded.picture) {
          avatarUrl = String(decoded.picture).trim();
        }
      } catch (verifyErr: any) {
        console.warn("🔍 [GOOGLE AUTH] verifyIdToken notice, falling back to token decode:", verifyErr?.message || verifyErr);
        try {
          const decodedPayload: any = jwt.decode(idToken);
          if (decodedPayload && typeof decodedPayload === "object") {
            if (decodedPayload.email) {
              cleanEmail = String(decodedPayload.email).toLowerCase().trim();
            }
            if (decodedPayload.name) {
              cleanName = String(decodedPayload.name).trim();
            }
            if (!avatarUrl && decodedPayload.picture) {
              avatarUrl = String(decodedPayload.picture).trim();
            }
          }
        } catch {}
      }
    }

    // 2. Fallback to client-provided verified Firebase popup user payload if needed
    if (!cleanEmail && typeof email === "string" && email.includes("@")) {
      cleanEmail = email.toLowerCase().trim();
    }

    if (!cleanName) {
      if (typeof fullName === "string" && fullName.trim()) {
        cleanName = fullName.trim();
      } else if (typeof name === "string" && name.trim()) {
        cleanName = name.trim();
      } else if (cleanEmail) {
        cleanName =
          cleanEmail
            .split("@")[0]
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()) || "Google Member";
      } else {
        cleanName = "Google Member";
      }
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        error: "Google account email is not available. Please sign in again.",
      });
    }

    console.log(`🔍 [GOOGLE AUTH] Processing Google authentication for: ${cleanEmail} (${cleanName})`);

    if (!isMongoConnected()) {
      try {
        await connectMongoDB();
      } catch {}
    }

=======
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const { idToken, autoRegister = true } = req.body;
    if (!idToken || typeof idToken !== "string") {
      return res.status(401).json({
        success: false,
        error: "Google authentication token (idToken) is required.",
      });
    }

    // Verify Google ID token cryptographically using Firebase Admin SDK
    let decoded: any;
    try {
      decoded = await firebaseAuth.verifyIdToken(idToken);
    } catch (verifyErr: any) {
      console.warn("Firebase verifyIdToken failed:", verifyErr?.message || verifyErr);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired Google authentication token. Please sign in again.",
      });
    }

    if (!decoded || !decoded.email || decoded.email_verified !== true) {
      return res.status(401).json({
        success: false,
        error: "Google account email is not verified or unavailable.",
      });
    }

    const cleanEmail = String(decoded.email).toLowerCase().trim();
    const cleanName = String(decoded.name || cleanEmail.split("@")[0] || "Google Member").trim();

    console.log(`🔍 [GOOGLE AUTH] Verified token for: ${cleanEmail}`);

>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    let existingUser: any = null;

    if (isMongoConnected()) {
      try {
        existingUser = await User.findOne({
          email: cleanEmail,
        });
      } catch (dbErr: any) {
        console.warn("MongoDB Google lookup error:", dbErr?.message);
      }
    }

    if (!existingUser) {
      existingUser = (memoryStore.users || []).find(
<<<<<<< HEAD
        (u) => u.email && u.email.toLowerCase().trim() === cleanEmail
      );
    }

    // Check if this user is an approved Seller
    let isSeller = false;
    let sellerStatus: string | null = null;
    let sellerShopName: string | null = null;
    try {
      let sellerDoc: any = null;
      if (isMongoConnected()) {
        sellerDoc = await Seller.findOne({ email: cleanEmail });
      }
      if (!sellerDoc) {
        sellerDoc = (memoryStore.sellers || []).find(
          (s) => s.email?.toLowerCase().trim() === cleanEmail
        );
      }
      if (sellerDoc) {
        sellerStatus = sellerDoc.status;
        isSeller = sellerDoc.status === "approved";
        sellerShopName = sellerDoc.shopName;
      }
    } catch {}

=======
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );
    }

>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    // 1. If user already exists in database, log them in directly
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({
          success: false,
          error: "Your account has been suspended or blocked by an administrator. Please contact support.",
        });
      }

      const token = jwt.sign(
        { userId: String(existingUser._id), email: existingUser.email, role: "customer" },
        secret,
        { expiresIn: "7d" }
      );

<<<<<<< HEAD
=======
      // Security directive: Never issue admin token from Google login route
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      await logActivity(
        {
          eventType: "Login",
          status: "success",
          userName: existingUser.fullName || cleanName,
          email: existingUser.email,
<<<<<<< HEAD
          details: "Google authentication verified via Firebase OAuth",
=======
          details: "Google authentication verified via Firebase ID Token",
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        },
        req
      );

      return res.json({
        success: true,
        isExisting: true,
        isNew: false,
        token,
<<<<<<< HEAD
        isSeller,
        sellerStatus,
        sellerShopName,
=======
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        user: {
          _id: String(existingUser._id),
          name: existingUser.fullName || cleanName,
          email: existingUser.email,
          phone: existingUser.phone || existingUser.mobileNumber || "",
          tier: existingUser.tier || "Silver",
          country: existingUser.country || "Bangladesh",
<<<<<<< HEAD
          avatar: existingUser.avatar || avatarUrl || undefined,
=======
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        },
      });
    }

    // 2. User does not exist in database
    if (autoRegister) {
      // Auto-register new Google user in database
      const randomPassword = `G_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      let newUser: any = null;

      if (isMongoConnected()) {
        try {
          const userDoc = new User({
            fullName: cleanName,
            email: cleanEmail,
            country: "Bangladesh",
            mobileNumber: "",
            phone: "",
            passwordHash,
            tier: "Silver",
            verified: true,
            isBlocked: false,
<<<<<<< HEAD
            avatar: avatarUrl || undefined,
          });
          await userDoc.save();
          newUser = userDoc;

          // Also sync to Customer collection for Admin overview
          try {
            const existingCustomer = await Customer.findOne({ email: cleanEmail });
            if (!existingCustomer) {
              await Customer.create({
                name: cleanName,
                email: cleanEmail,
                tier: "Silver",
                ordersCount: 0,
                lifetimeSpend: 0,
              });
            }
          } catch {}
        } catch (saveErr: any) {
          console.warn("MongoDB Google auto-register save error:", saveErr?.message);
=======
          });
          await userDoc.save();
          newUser = userDoc;
        } catch (saveErr: any) {
          console.warn("MongoDB auto-register save error:", saveErr?.message);
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        }
      }

      if (!newUser) {
        newUser = {
          _id: `user_g_${Date.now()}`,
          fullName: cleanName,
          email: cleanEmail,
          country: "Bangladesh",
          mobileNumber: "",
          phone: "",
          passwordHash,
          tier: "Silver",
          verified: true,
          isBlocked: false,
<<<<<<< HEAD
          avatar: avatarUrl || undefined,
          createdAt: new Date(),
        };
      }

      // Keep memoryStore synced
      const inMem = (memoryStore.users || []).find(
        (u) => u.email && u.email.toLowerCase().trim() === cleanEmail
      );
      if (!inMem) {
        memoryStore.users.push({
          _id: String(newUser._id),
          fullName: newUser.fullName || cleanName,
          email: newUser.email || cleanEmail,
          country: "Bangladesh",
          mobileNumber: "",
          phone: "",
          passwordHash,
          tier: "Silver",
          verified: true,
          isBlocked: false,
          avatar: avatarUrl || undefined,
          createdAt: new Date(),
        });
=======
          createdAt: new Date(),
        };
        memoryStore.users.push(newUser);
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      }

      const token = jwt.sign(
        { userId: String(newUser._id), email: newUser.email, role: "customer" },
        secret,
        { expiresIn: "7d" }
      );

      await logActivity(
        {
          eventType: "Registration",
          status: "success",
          userName: newUser.fullName,
          email: newUser.email,
<<<<<<< HEAD
          details: "New user registered via Google OAuth",
=======
          details: "New user registered via Google OAuth (Firebase ID Token verified)",
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        },
        req
      );

      return res.json({
        success: true,
        isExisting: false,
        isNew: true,
        token,
<<<<<<< HEAD
        isSeller,
        sellerStatus,
        sellerShopName,
=======
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        user: {
          _id: String(newUser._id),
          name: newUser.fullName,
          email: newUser.email,
          phone: "",
          tier: "Silver",
          country: "Bangladesh",
<<<<<<< HEAD
          avatar: avatarUrl || undefined,
=======
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        },
      });
    }

    // If not autoRegister, inform frontend that user is not yet registered
    return res.json({
      success: true,
      isExisting: false,
      isNew: true,
      message: "No account found in alikendshop.users. Registration required.",
    });
  } catch (err: any) {
    console.error("💥 [GOOGLE AUTH ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Google authentication failed" });
  }
});

// POST /api/auth/apple - Authenticate or register Apple account directly into MongoDB alikendshop.users
router.post("/apple", async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        success: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const { idToken, appleUser, email, fullName, autoRegister = true } = req.body;

    let cleanEmail = "";
    let cleanName = "";

    // 1. If an ID Token is provided, try verifying it via Firebase Admin
    if (idToken && typeof idToken === "string") {
      try {
        const decoded = await firebaseAuth.verifyIdToken(idToken);
        if (decoded && decoded.email) {
          cleanEmail = String(decoded.email).toLowerCase().trim();
        }
        if (decoded && decoded.name) {
          cleanName = String(decoded.name).trim();
        }
      } catch (verifyErr: any) {
        console.warn("🍎 [APPLE AUTH] Token verify fallback to client payload:", verifyErr?.message || verifyErr);
      }
    }

    // 2. Fallback to client-provided payload if token didn't yield an email
    if (!cleanEmail) {
      if (typeof email === "string" && email.includes("@")) {
        cleanEmail = email.toLowerCase().trim();
      } else if (appleUser && typeof appleUser.email === "string" && appleUser.email.includes("@")) {
        cleanEmail = appleUser.email.toLowerCase().trim();
      }
    }

    if (!cleanName) {
      if (typeof fullName === "string" && fullName.trim()) {
        cleanName = fullName.trim();
      } else if (appleUser && typeof appleUser.name === "string" && appleUser.name.trim()) {
        cleanName = appleUser.name.trim();
      } else if (cleanEmail) {
        cleanName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Apple Member";
      } else {
        cleanName = "Apple Member";
      }
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        error: "Valid Apple ID email address is required.",
      });
    }

    console.log(`🍎 [APPLE AUTH] Processing Apple authentication for: ${cleanEmail} (${cleanName})`);

    let existingUser: any = null;

    if (isMongoConnected()) {
      try {
        existingUser = await User.findOne({
          email: cleanEmail,
        });
      } catch (dbErr: any) {
        console.warn("MongoDB Apple lookup error:", dbErr?.message);
      }
    }

    if (!existingUser) {
      existingUser = (memoryStore.users || []).find(
        (u) => u.email.toLowerCase().trim() === cleanEmail
      );
    }

    // A. Existing user login
    if (existingUser) {
      if (existingUser.isBlocked) {
        return res.status(403).json({
          success: false,
          error: "Your account has been suspended or blocked by an administrator. Please contact support.",
        });
      }

      const token = jwt.sign(
        { userId: String(existingUser._id), email: existingUser.email, role: "customer" },
        secret,
        { expiresIn: "7d" }
      );

      await logActivity(
        {
          eventType: "Login",
          status: "success",
          userName: existingUser.fullName || cleanName,
          email: existingUser.email,
          details: "Apple authentication verified and logged into MongoDB alikendshop.users",
        },
        req
      );

      return res.json({
        success: true,
        isExisting: true,
        isNew: false,
        token,
        user: {
          _id: String(existingUser._id),
          name: existingUser.fullName || cleanName,
          email: existingUser.email,
          phone: existingUser.phone || existingUser.mobileNumber || "",
          tier: existingUser.tier || "Silver",
          country: existingUser.country || "Bangladesh",
        },
        database: "alikendshop",
        collection: "users",
      });
    }

    // B. New user registration in MongoDB
    if (autoRegister) {
      const randomPassword = `A_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      let newUser: any = null;

      if (isMongoConnected()) {
        try {
          const userDoc = new User({
            fullName: cleanName,
            email: cleanEmail,
            country: "Bangladesh",
            mobileNumber: "",
            phone: "",
            passwordHash,
            tier: "Silver",
            verified: true,
            isBlocked: false,
          });
          await userDoc.save();
          newUser = userDoc;
          console.log(`✅ [APPLE AUTH] Saved new Apple user to MongoDB: ${cleanEmail}`);

          // Also sync to Customer collection for analytics and admin panels
          try {
            const existingCustomer = await Customer.findOne({ email: cleanEmail });
            if (!existingCustomer) {
              await Customer.create({
                name: cleanName,
                email: cleanEmail,
                tier: "Silver",
                ordersCount: 0,
                lifetimeSpend: 0,
              });
            }
          } catch (custErr: any) {
            console.warn("Customer sync for Apple user notice:", custErr?.message);
          }
        } catch (saveErr: any) {
          console.warn("MongoDB Apple user save error:", saveErr?.message);
        }
      }

      if (!newUser) {
        newUser = {
          _id: `user_apple_${Date.now()}`,
          fullName: cleanName,
          email: cleanEmail,
          country: "Bangladesh",
          mobileNumber: "",
          phone: "",
          passwordHash,
          tier: "Silver",
          verified: true,
          isBlocked: false,
          createdAt: new Date(),
        };
        memoryStore.users.push(newUser);
      }

      const token = jwt.sign(
        { userId: String(newUser._id), email: newUser.email, role: "customer" },
        secret,
        { expiresIn: "7d" }
      );

      await logActivity(
        {
          eventType: "Registration",
          status: "success",
          userName: newUser.fullName,
          email: newUser.email,
          details: "New user registered via Apple ID directly into MongoDB alikendshop.users",
        },
        req
      );

      return res.json({
        success: true,
        isExisting: false,
        isNew: true,
        token,
        user: {
          _id: String(newUser._id),
          name: newUser.fullName,
          email: newUser.email,
          phone: "",
          tier: "Silver",
          country: "Bangladesh",
        },
        database: "alikendshop",
        collection: "users",
      });
    }

    return res.json({
      success: true,
      isExisting: false,
      isNew: true,
      message: "No account found in alikendshop.users. Registration required.",
    });
  } catch (err: any) {
    console.error("💥 [APPLE AUTH ERROR]:", err);
    res.status(500).json({ success: false, error: err.message || "Apple authentication failed" });
  }
});

// GET /api/auth/me - Verify current session against live MongoDB alikendshop.users
router.get("/me", async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({
        valid: false,
        error: "Authentication service is temporarily misconfigured. Please contact support.",
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ valid: false, error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ valid: false, error: "Invalid or expired token" });
    }

    let user: any = null;
    if (isMongoConnected()) {
      try {
        user = await User.findById(decoded.userId);
      } catch (e) {}
    }

    if (!user) {
      user = (memoryStore.users || []).find(
        (u) => String(u._id) === String(decoded.userId) || u.email?.toLowerCase() === (decoded.email || "").toLowerCase()
      );
    }

    if (!user) {
      const adminDoc = (memoryStore.admins || []).find(
        (a) => String(a._id) === String(decoded.userId) || a.email?.toLowerCase() === (decoded.email || "").toLowerCase()
      );
      if (adminDoc) {
        user = {
          _id: String(adminDoc._id),
          fullName: adminDoc.name || "Administrator",
          email: adminDoc.email,
          country: "+880",
          mobileNumber: "1700000000",
          phone: "+880 1700000000",
          tier: "Platinum",
          isBlocked: false,
        };
      }
    }

    if (!user) {
      return res.status(404).json({ valid: false, error: "User session no longer exists" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ valid: false, error: "Account has been suspended by an administrator." });
    }

    let adminToken: string | null = null;
    let isAdmin = false;
    let adminRole = "superadmin";
    try {
      let adminDoc: any = null;
      if (isMongoConnected()) {
        adminDoc = await Admin.findOne({ email: user.email.toLowerCase().trim() });
      }
      if (!adminDoc && process.env.NODE_ENV !== "production") {
        adminDoc = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === user.email.toLowerCase().trim());
      }
      if (adminDoc && adminDoc.isActive !== false && (adminDoc.role === "superadmin" || adminDoc.role === "admin")) {
        isAdmin = true;
        adminRole = adminDoc.role === "superadmin" ? "superadmin" : "admin";
        adminToken = jwt.sign(
          { adminId: String(adminDoc._id), email: adminDoc.email, name: adminDoc.name, role: adminRole },
          secret,
          { expiresIn: "7d" }
        );
      }
    } catch (e) {}

    let isSeller = false;
    let sellerStatus: string | null = null;
    let sellerShopName: string | null = null;
    try {
      let sellerDoc: any = null;
      if (isMongoConnected()) {
        sellerDoc = await Seller.findOne({ email: user.email.toLowerCase().trim() });
      }
      if (!sellerDoc) {
        sellerDoc = (memoryStore.sellers || []).find((s) => s.email?.toLowerCase() === user.email.toLowerCase().trim());
      }
      if (sellerDoc) {
        sellerStatus = sellerDoc.status;
        isSeller = sellerDoc.status === "approved";
        sellerShopName = sellerDoc.shopName;
      }
    } catch (sErr) {}

    return res.json({
      valid: true,
      user: {
        _id: String(user._id),
        name: user.fullName,
        email: user.email,
        phone: user.phone || `${user.country} ${user.mobileNumber}`,
        country: user.country,
        mobileNumber: user.mobileNumber,
        tier: user.tier,
<<<<<<< HEAD
        savedLocation: user.savedLocation || null,
=======
<<<<<<< HEAD
        savedLocation: user.savedLocation || null,
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      },
      isAdmin,
      adminToken,
      isSeller,
      sellerStatus,
      sellerShopName,
    });
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err.message });
  }
});

// POST /api/auth/change-password - Change password for logged in customer/user
router.post("/change-password", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userEmail: string | undefined;

    const secret = getJwtSecret();
    if (authHeader && authHeader.startsWith("Bearer ") && secret) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], secret) as any;
        userEmail = decoded.email;
      } catch (e) {}
    }

    const { email, currentPassword, newPassword } = req.body;
    const targetEmail = (userEmail || email || "").toLowerCase().trim();

    if (!targetEmail) {
      return res.status(401).json({ success: false, error: "Authentication required to change password" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Both current password and new password are required" });
    }

    if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return res.status(400).json({ success: false, error: "New password must be at least 6 characters long" });
    }

    let userDoc: any = null;
    if (isMongoConnected()) {
      try {
        userDoc = await User.findOne({ email: targetEmail });
      } catch (err: any) {
        console.warn("Mongo find user error:", err?.message);
      }
    }
    if (!userDoc) {
      userDoc = (memoryStore.users || []).find((u) => u.email?.toLowerCase() === targetEmail);
    }

    if (!userDoc) {
      return res.status(404).json({ success: false, error: "User account not found" });
    }

    let isCurrentValid = false;
    if (userDoc.passwordHash) {
      isCurrentValid = await bcrypt.compare(currentPassword, userDoc.passwordHash);
    }

    if (!isCurrentValid) {
      return res.status(400).json({ success: false, error: "Incorrect current password" });
    }

    const newHash = await bcrypt.hash(newPassword.trim(), 10);

    if (isMongoConnected()) {
      try {
        await User.updateOne({ email: targetEmail }, { $set: { passwordHash: newHash, updatedAt: new Date() } });
      } catch (err: any) {
        console.warn("Mongo update user password error:", err?.message);
      }
    }

    const memIdx = (memoryStore.users || []).findIndex((u) => u.email?.toLowerCase() === targetEmail);
    if (memIdx !== -1) {
      memoryStore.users[memIdx].passwordHash = newHash;
    }

    return res.json({ success: true, message: "Password updated successfully!" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update password" });
  }
});

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
// ==========================================
// PATCH /api/auth/profile/location & /api/auth/saved-location - Save or Clear Customer Location
// ==========================================
router.patch(["/profile/location", "/saved-location"], async (req, res) => {
  try {
    const secret = getJwtSecret();
    if (!secret) {
      return res.status(503).json({ error: "Auth service unavailable" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required to update saved location" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { location, clear, lat, lng, label } = req.body || {};
    let savedLocation: any = null;

    const rawLoc = location || (lat !== undefined && lng !== undefined && lat !== null && lng !== null ? { lat, lng, label } : null);

    if (!clear && rawLoc && rawLoc.lat !== null && rawLoc.lng !== null) {
      const nLat = Number(rawLoc.lat);
      const nLng = Number(rawLoc.lng);
      if (!isValidCoordinate(nLat, nLng)) {
        return res.status(400).json({
          error: "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.",
        });
      }
      savedLocation = {
        lat: nLat,
        lng: nLng,
        label: String(rawLoc.label || "Pinned Location").slice(0, 150),
        updatedAt: new Date(),
      };
    }

    // Update in MongoDB
    if (isMongoConnected()) {
      try {
        await User.findByIdAndUpdate(decoded.userId, { $set: { savedLocation } });
      } catch (err: any) {
        console.warn("MongoDB update user savedLocation error:", err?.message);
      }
    }

    // Update in memoryStore
    const memUser = (memoryStore.users || []).find(
      (u) => String(u._id) === String(decoded.userId) || u.email?.toLowerCase() === (decoded.email || "").toLowerCase()
    );
    if (memUser) {
      (memUser as any).savedLocation = savedLocation;
    }

    return res.json({
      success: true,
      message: savedLocation ? "Delivery location saved to your profile." : "Saved location cleared from profile.",
      savedLocation,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to update saved location" });
  }
});

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
export default router;
