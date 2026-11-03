import { Request } from "express";
import ActivityLog, { IActivityLog } from "../models/ActivityLog";
import { isMongoConnected, memoryStore } from "../store";

export interface LogActivityParams {
  eventType: string;
  userName: string;
  email: string;
  status?: "success" | "failed";
  ipAddress?: string;
  deviceInfo?: string;
  browser?: string;
  os?: string;
  details?: string;
}

export function parseClientInfo(req: Request) {
  // 1. IP extraction
  const forwarded = req.headers["x-forwarded-for"];
  let ip = "127.0.0.1";
  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded[0]) {
    ip = forwarded[0].trim();
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  } else if (req.ip) {
    ip = req.ip;
  }
  if (ip === "::1" || ip === "::ffff:127.0.0.1") ip = "127.0.0.1";

  // 2. User Agent / Device extraction
  const ua = req.headers["user-agent"] || "Unknown Browser";
  let browser = "Chrome";
  let os = "Desktop";

  if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Microsoft Edge";
  else if (ua.includes("Safari/") && !ua.includes("Chrome/")) browser = "Safari";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Opera/") || ua.includes("OPR/")) browser = "Opera";
  else if (ua.includes("curl") || ua.includes("Postman")) browser = "API Client";

  if (ua.includes("iPhone")) os = "iOS (iPhone)";
  else if (ua.includes("iPad")) os = "iOS (iPad)";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "macOS";
  else if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Linux")) os = "Linux";

  const deviceInfo = `${browser} on ${os}`;

  return { ip, browser, os, deviceInfo, rawUserAgent: ua };
}

export async function logActivity(
  params: LogActivityParams,
  req?: Request
): Promise<any> {
  try {
    let ip = params.ipAddress;
    let browser = params.browser;
    let os = params.os;
    let deviceInfo = params.deviceInfo;

    if (req) {
      const parsed = parseClientInfo(req);
      if (!ip) ip = parsed.ip;
      if (!browser) browser = parsed.browser;
      if (!os) os = parsed.os;
      if (!deviceInfo) deviceInfo = parsed.deviceInfo;
    }

    const payload = {
      eventType: params.eventType,
      userName: params.userName || (params.email.includes("@") ? params.email.split("@")[0] : "User"),
      email: params.email.toLowerCase().trim(),
      status: params.status || (params.eventType === "Failed Login" ? "failed" : "success"),
      ipAddress: ip || "127.0.0.1",
      deviceInfo: deviceInfo || "Web Browser",
      browser: browser || "Web Browser",
      os: os || "Desktop",
      details: params.details || "",
      createdAt: new Date(),
    };

    if (payload.eventType === "Failed Login") {
      console.log(`📋 [ACTIVITY AUDIT] Auth evaluation: ${payload.email} - IP: ${payload.ipAddress}`);
    } else {
      console.log(`📋 [ACTIVITY LOG] ${payload.eventType} | User: ${payload.email} | IP: ${payload.ipAddress}`);
    }

    // Always push to in-memory store for instant zero-latency retrieval
    if (!memoryStore.activityLogs) {
      memoryStore.activityLogs = [];
    }
    const memEntry = {
      _id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...payload,
    };
    memoryStore.activityLogs.unshift(memEntry);
    // Keep max 500 in memory
    if (memoryStore.activityLogs.length > 500) {
      memoryStore.activityLogs.pop();
    }

    // If MongoDB is connected, persist directly to MongoDB collection 'alikendshop.activity_logs'
    if (isMongoConnected()) {
      try {
        const mongoLog = await ActivityLog.create(payload);
        console.log(`💾 [ACTIVITY LOG MONGODB] Persisted to MongoDB 'alikendshop.activity_logs' with ID: ${mongoLog._id}`);
        return mongoLog;
      } catch (dbErr: any) {
        console.warn("⚠️ [ACTIVITY LOG MONGODB WARNING] Could not write to MongoDB:", dbErr.message);
      }
    }

    return memEntry;
  } catch (err: any) {
    console.error("❌ [ACTIVITY LOG ERROR]:", err);
    return null;
  }
}
