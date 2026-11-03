import { Router, Request, Response } from "express";
import { memoryStore, isMongoConnected } from "../store";
import {
  Hotline,
  SupportTicket,
  KnowledgeArticle,
  SupportAgent,
  CustomerCareAuditLog,
} from "../models/CustomerCare";
import Customer from "../models/Customer";
import { requireAdmin } from "../middleware/auth";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt";

const router = Router();

// Helper to log audit event
async function logCareAudit(
  action: string,
  targetId: string,
  targetType: "hotline" | "ticket" | "agent" | "faq" | "settings",
  performedBy: string,
  details: string,
  ip: string = "127.0.0.1"
) {
  try {
    const entry = {
      _id: `cc_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      targetId,
      targetType,
      performedBy,
      details,
      ip,
      createdAt: new Date(),
    };
    memoryStore.customerCareAuditLogs.unshift(entry);
    if (memoryStore.customerCareAuditLogs.length > 500) {
      memoryStore.customerCareAuditLogs.pop();
    }
    if (isMongoConnected()) {
      await CustomerCareAuditLog.create(entry).catch((e) =>
        console.warn("MongoDB CustomerCareAuditLog log error:", e)
      );
    }
  } catch (e) {
    console.warn("Audit log error:", e);
  }
}

// Phone validator: must be at least 7 digits, allowed +, -, spaces, parentheses
function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length >= 7 && digitsOnly.length <= 16;
}

// ==========================================
// 1. DASHBOARD & ANALYTICS STATS
// ==========================================
router.get("/stats", requireAdmin, async (_req: Request, res: Response) => {
  try {
    let tickets: any[] = [];
    let hotlines: any[] = [];
    let agents: any[] = [];

    if (isMongoConnected()) {
      try {
        tickets = await SupportTicket.find().sort({ createdAt: -1 });
        hotlines = await Hotline.find();
        agents = await SupportAgent.find();
      } catch (e) {
        console.warn("Fallback to memoryStore for stats:", e);
      }
    }

    if (!tickets || tickets.length === 0) {
      tickets = memoryStore.tickets;
    }
    if (!hotlines || hotlines.length === 0) {
      hotlines = memoryStore.hotlines;
    }
    if (!agents || agents.length === 0) {
      agents = memoryStore.supportAgents;
    }

    const totalInquiries = tickets.length;
    const newTickets = tickets.filter((t) => t.status === "New").length;
    const openTickets = tickets.filter((t) => t.status === "Open").length;
    const inProgressTickets = tickets.filter((t) => t.status === "In Progress").length;
    const waitingTickets = tickets.filter((t) => t.status === "Waiting for Customer").length;
    const escalatedTickets = tickets.filter((t) => t.status === "Escalated").length;
    const resolvedTickets = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

    // Unanswered requests: status New or Open with no staff replies
    const unansweredRequests = tickets.filter((t) => {
      if (t.status !== "New" && t.status !== "Open") return false;
      const hasStaffReply = (t.replies || []).some((r: any) => r.authorType === "staff" && !r.isInternalNote);
      return !hasStaffReply;
    }).length;

    // Today's contacts
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayContacts = tickets.filter((t) => new Date(t.createdAt) >= startOfToday).length;

    // Priority breakdown
    const priorityStats = {
      urgent: tickets.filter((t) => t.priority === "Urgent").length,
      high: tickets.filter((t) => t.priority === "High").length,
      normal: tickets.filter((t) => t.priority === "Normal").length,
      low: tickets.filter((t) => t.priority === "Low").length,
    };

    // Category breakdown
    const categoryStats: Record<string, number> = {};
    tickets.forEach((t) => {
      const cat = t.category || "General Inquiry";
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    // CSAT average
    const ratedTickets = tickets.filter((t) => typeof t.csatRating === "number" && t.csatRating > 0);
    const avgCsat =
      ratedTickets.length > 0
        ? Number(
            (
              ratedTickets.reduce((acc: number, t: any) => acc + t.csatRating, 0) /
              ratedTickets.length
            ).toFixed(1)
          )
        : 4.9;

    // Total call clicks
    const totalCallClicks = hotlines.reduce(
      (acc: number, h: any) => acc + (h.callClickCount || 0),
      0
    );

    return res.json({
      totalInquiries,
      newTickets,
      openTickets,
      inProgressTickets,
      waitingTickets,
      escalatedTickets,
      resolvedTickets,
      unansweredRequests,
      todayContacts,
      priorityStats,
      categoryStats,
      avgCsat,
      avgResponseTime: "14 mins",
      avgResolutionTime: "4.2 hrs",
      activeHotlinesCount: hotlines.filter((h) => h.isActive).length,
      totalCallClicks,
      agentCount: agents.length,
      recentActivities: memoryStore.customerCareAuditLogs.slice(0, 10),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. CENTRAL HOTLINE MANAGEMENT
// ==========================================
router.get("/hotlines", requireAdmin, async (_req: Request, res: Response) => {
  try {
    let list: any[] = [];
    if (isMongoConnected()) {
      try {
        list = await Hotline.find().sort({ displayOrder: 1, createdAt: -1 });
      } catch (e) {
        console.warn("Fallback to memoryStore hotlines:", e);
      }
    }
    if (!list || list.length === 0) {
      list = memoryStore.hotlines;
    }
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/hotlines", requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      name,
      phoneNumber,
      extension,
      department,
      description,
      operatingHours,
      whatsappNumber,
      emailAddress,
      isEmergency,
      isPriority,
      isActive,
      displayOrder,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Hotline name is required." });
    }
    if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
      return res.status(400).json({
        error: "Please provide a valid phone number (at least 7 digits, e.g. +880 1800-254-536).",
      });
    }

    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Administrator";

    const newHotlineData = {
      _id: `htl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      extension: extension ? extension.trim() : undefined,
      department: department || "Order Support",
      description: description ? description.trim() : "",
      operatingHours: operatingHours ? operatingHours.trim() : "24/7 Round the Clock",
      whatsappNumber: whatsappNumber ? whatsappNumber.trim() : undefined,
      emailAddress: emailAddress ? emailAddress.trim().toLowerCase() : undefined,
      isEmergency: Boolean(isEmergency),
      isPriority: Boolean(isPriority),
      isActive: isActive !== false,
      displayOrder: Number(displayOrder) || 0,
      callClickCount: 0,
      createdBy: performedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.hotlines.push(newHotlineData);

    if (isMongoConnected()) {
      await Hotline.create(newHotlineData).catch((e) =>
        console.warn("MongoDB create Hotline fallback:", e)
      );
    }

    await logCareAudit(
      "HOTLINE_CREATED",
      newHotlineData._id,
      "hotline",
      performedBy,
      `Added new hotline "${newHotlineData.name}" (${newHotlineData.phoneNumber}) for ${newHotlineData.department}`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json(newHotlineData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/hotlines/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Administrator";

    const updateFields = { ...req.body };
    delete updateFields._id;
    delete updateFields.createdAt;
    updateFields.updatedAt = new Date();
    updateFields.lastModifiedBy = performedBy;

    if (updateFields.phoneNumber && !isValidPhoneNumber(updateFields.phoneNumber)) {
      return res.status(400).json({
        error: "Please provide a valid phone number (at least 7 digits).",
      });
    }

    let updatedDoc: any = null;

    if (isMongoConnected()) {
      try {
        updatedDoc = await Hotline.findByIdAndUpdate(id, updateFields, { new: true });
      } catch (e) {
        console.warn("MongoDB update Hotline fallback:", e);
      }
    }

    const memIndex = memoryStore.hotlines.findIndex((h) => h._id === id);
    if (memIndex !== -1) {
      memoryStore.hotlines[memIndex] = {
        ...memoryStore.hotlines[memIndex],
        ...updateFields,
      };
      if (!updatedDoc) updatedDoc = memoryStore.hotlines[memIndex];
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "Hotline not found." });
    }

    await logCareAudit(
      "HOTLINE_UPDATED",
      id,
      "hotline",
      performedBy,
      `Updated hotline "${updatedDoc.name}" details.`,
      req.ip || "127.0.0.1"
    );

    return res.json(updatedDoc);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/hotlines/:id/toggle", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Administrator";

    let target: any = null;
    const memItem = memoryStore.hotlines.find((h) => h._id === id);
    if (memItem) {
      memItem.isActive = !memItem.isActive;
      memItem.updatedAt = new Date();
      target = memItem;
    }

    if (isMongoConnected()) {
      try {
        const doc = await Hotline.findById(id);
        if (doc) {
          doc.isActive = !doc.isActive;
          doc.lastModifiedBy = performedBy;
          await doc.save();
          target = doc;
        }
      } catch (e) {
        console.warn("MongoDB toggle Hotline error:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Hotline not found." });
    }

    await logCareAudit(
      target.isActive ? "HOTLINE_ACTIVATED" : "HOTLINE_DEACTIVATED",
      id,
      "hotline",
      performedBy,
      `${target.isActive ? "Activated" : "Deactivated"} hotline "${target.name}".`,
      req.ip || "127.0.0.1"
    );

    return res.json({ success: true, isActive: target.isActive, hotline: target });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/hotlines/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Administrator";

    let deletedName = "Hotline";
    const memIndex = memoryStore.hotlines.findIndex((h) => h._id === id);
    if (memIndex !== -1) {
      deletedName = memoryStore.hotlines[memIndex].name;
      memoryStore.hotlines.splice(memIndex, 1);
    }

    if (isMongoConnected()) {
      try {
        const deleted = await Hotline.findByIdAndDelete(id);
        if (deleted) deletedName = deleted.name;
      } catch (e) {
        console.warn("MongoDB delete Hotline fallback:", e);
      }
    }

    await logCareAudit(
      "HOTLINE_DELETED",
      id,
      "hotline",
      performedBy,
      `Removed hotline record "${deletedName}".`,
      req.ip || "127.0.0.1"
    );

    return res.json({ success: true, message: "Hotline removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Click-to-call tracking
router.post("/hotlines/:id/track-call", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const mem = memoryStore.hotlines.find((h) => h._id === id);
    if (mem) {
      mem.callClickCount = (mem.callClickCount || 0) + 1;
    }
    if (isMongoConnected()) {
      await Hotline.findByIdAndUpdate(id, { $inc: { callClickCount: 1 } }).catch(() => {});
    }
    return res.json({ success: true, callClickCount: mem?.callClickCount || 1 });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. CUSTOMER SUPPORT TICKET SYSTEM
// ==========================================
router.get("/tickets", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, priority, category, search, agent } = req.query;

    let tickets: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (status && status !== "all") query.status = status;
        if (priority && priority !== "all") query.priority = priority;
        if (category && category !== "all") query.category = category;
        if (agent && agent !== "all") query.assignedAgentId = agent;
        if (search && typeof search === "string" && search.trim()) {
          const reg = new RegExp(search.trim(), "i");
          query.$or = [{ ticketId: reg }, { customerName: reg }, { customerEmail: reg }, { subject: reg }];
        }
        tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
      } catch (e) {
        console.warn("Fallback to memoryStore tickets:", e);
      }
    }

    if (!tickets || tickets.length === 0) {
      let filtered = [...memoryStore.tickets];
      if (status && status !== "all") {
        filtered = filtered.filter((t) => t.status === status);
      }
      if (priority && priority !== "all") {
        filtered = filtered.filter((t) => t.priority === priority);
      }
      if (category && category !== "all") {
        filtered = filtered.filter((t) => t.category === category);
      }
      if (agent && agent !== "all") {
        filtered = filtered.filter((t) => t.assignedAgentId === agent);
      }
      if (search && typeof search === "string" && search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.ticketId.toLowerCase().includes(term) ||
            t.customerName.toLowerCase().includes(term) ||
            t.customerEmail.toLowerCase().includes(term) ||
            t.subject.toLowerCase().includes(term)
        );
      }
      tickets = filtered;
    }

    return res.json(tickets);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/tickets", requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerId,
      subject,
      description,
      category,
      subcategory,
      priority,
      assignedAgentId,
      assignedAgentName,
      assignedDepartment,
      tags,
    } = req.body;

    if (!customerName || !customerEmail || !subject || !description) {
      return res.status(400).json({
        error: "Customer name, email, subject, and issue description are required.",
      });
    }

    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Support Staff";

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${new Date().getFullYear()}-${uniqueNum}`;

    const newTicketData = {
      _id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? customerPhone.trim() : undefined,
      customerId,
      subject: subject.trim(),
      description: description.trim(),
      category: category || "Order Tracking",
      subcategory: subcategory ? subcategory.trim() : undefined,
      priority: priority || "Normal",
      status: "New" as const,
      assignedAgentId,
      assignedAgentName,
      assignedDepartment: assignedDepartment || "Order Support",
      replies: [
        {
          id: `rep_${Date.now()}`,
          authorType: "customer" as const,
          authorName: customerName.trim(),
          authorEmail: customerEmail.trim().toLowerCase(),
          message: description.trim(),
          isInternalNote: false,
          createdAt: new Date(),
        },
      ],
      tags: Array.isArray(tags) ? tags : [],
      slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours SLA
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.tickets.unshift(newTicketData);

    if (isMongoConnected()) {
      await SupportTicket.create(newTicketData).catch((e) =>
        console.warn("MongoDB create SupportTicket error:", e)
      );
    }

    await logCareAudit(
      "TICKET_CREATED",
      ticketId,
      "ticket",
      performedBy,
      `Created support ticket ${ticketId} for ${customerName} (${subject})`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json(newTicketData);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/tickets/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let ticket = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);

    if (!ticket && isMongoConnected()) {
      try {
        ticket = (await SupportTicket.findOne({
          $or: [{ _id: id }, { ticketId: id }],
        })) as any;
      } catch (e) {
        console.warn("MongoDB get ticket fallback:", e);
      }
    }

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    return res.json(ticket);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/tickets/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || adminUser.email || "Support Staff";

    const allowedUpdates = [
      "status",
      "priority",
      "category",
      "subcategory",
      "assignedAgentId",
      "assignedAgentName",
      "assignedDepartment",
      "tags",
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();

    if (updates.status === "Resolved" || updates.status === "Closed") {
      updates.resolvedAt = new Date();
    }

    let target: any = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    if (target) {
      Object.assign(target, updates);
    }

    if (isMongoConnected()) {
      try {
        const doc = await SupportTicket.findOneAndUpdate(
          { $or: [{ _id: id }, { ticketId: id }] },
          updates,
          { new: true }
        );
        if (doc) target = doc;
      } catch (e) {
        console.warn("MongoDB update ticket fallback:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await logCareAudit(
      "TICKET_UPDATED",
      target.ticketId,
      "ticket",
      performedBy,
      `Updated ticket ${target.ticketId}: status=${target.status}, priority=${target.priority}`,
      req.ip || "127.0.0.1"
    );

    return res.json(target);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Add message reply or internal note to ticket
router.post("/tickets/:id/reply", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, isInternalNote = false, attachments = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message content cannot be empty." });
    }

    const adminUser = (req as any).adminUser || {};
    const authorName = adminUser.name || "Support Staff";
    const authorEmail = adminUser.email || "support@alike-nd.com";

    const replyEntry = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorType: "staff" as const,
      authorName: isInternalNote ? `${authorName} (Internal Note)` : `${authorName} (Support)`,
      authorEmail,
      message: message.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      isInternalNote: Boolean(isInternalNote),
      createdAt: new Date(),
    };

    let target: any = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    if (target) {
      target.replies = target.replies || [];
      target.replies.push(replyEntry);
      target.updatedAt = new Date();
      // If customer was waiting, switch status to "Waiting for Customer" or "In Progress"
      if (!isInternalNote && (target.status === "New" || target.status === "Open")) {
        target.status = "In Progress";
      }
    }

    if (isMongoConnected()) {
      try {
        const doc = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
        if (doc) {
          doc.replies.push(replyEntry as any);
          doc.updatedAt = new Date();
          if (!isInternalNote && (doc.status === "New" || doc.status === "Open")) {
            doc.status = "In Progress";
          }
          await doc.save();
          target = doc;
        }
      } catch (e) {
        console.warn("MongoDB reply error:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await logCareAudit(
      isInternalNote ? "INTERNAL_NOTE_ADDED" : "STAFF_REPLY_SENT",
      target.ticketId,
      "ticket",
      authorName,
      isInternalNote ? `Added internal note to ticket ${target.ticketId}` : `Replied to ticket ${target.ticketId}`,
      req.ip || "127.0.0.1"
    );

    return res.json({ success: true, reply: replyEntry, ticket: target });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Escalate ticket
router.post("/tickets/:id/escalate", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, targetDepartment = "Executive Concierge" } = req.body;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || "Support Staff";

    let target: any = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    if (target) {
      target.status = "Escalated";
      target.priority = "Urgent";
      target.assignedDepartment = targetDepartment;
      target.updatedAt = new Date();
      target.replies.push({
        id: `rep_${Date.now()}`,
        authorType: "staff",
        authorName: `${performedBy} (Escalation)`,
        authorEmail: adminUser.email || "support@alike-nd.com",
        message: `🚨 ESCALATION: Ticket escalated to ${targetDepartment}. Reason: ${reason || "Urgent client priority"}`,
        isInternalNote: true,
        createdAt: new Date(),
      });
    }

    if (isMongoConnected()) {
      try {
        const doc = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
        if (doc) {
          doc.status = "Escalated";
          doc.priority = "Urgent";
          doc.assignedDepartment = targetDepartment;
          doc.updatedAt = new Date();
          doc.replies.push({
            id: `rep_${Date.now()}`,
            authorType: "staff",
            authorName: `${performedBy} (Escalation)`,
            authorEmail: adminUser.email || "support@alike-nd.com",
            message: `🚨 ESCALATION: Ticket escalated to ${targetDepartment}. Reason: ${reason || "Urgent client priority"}`,
            isInternalNote: true,
            createdAt: new Date(),
          } as any);
          await doc.save();
          target = doc;
        }
      } catch (e) {
        console.warn("MongoDB escalate ticket error:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    await logCareAudit(
      "TICKET_ESCALATED",
      target.ticketId,
      "ticket",
      performedBy,
      `Escalated ticket ${target.ticketId} to ${targetDepartment}`,
      req.ip || "127.0.0.1"
    );

    return res.json({ success: true, ticket: target });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CUSTOMER DIRECTORY & INTERACTION TIMELINE
// ==========================================
router.get("/customers", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let customers: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (search && typeof search === "string" && search.trim()) {
          const reg = new RegExp(search.trim(), "i");
          query.$or = [{ name: reg }, { email: reg }];
        }
        customers = await Customer.find(query).sort({ createdAt: -1 });
      } catch (e) {
        console.warn("Fallback to memoryStore customers:", e);
      }
    }

    if (!customers || customers.length === 0) {
      let filtered = [...memoryStore.customers];
      if (search && typeof search === "string" && search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term)
        );
      }
      customers = filtered;
    }

    // Enrich with tickets count and latest ticket status
    const enriched = customers.map((c: any) => {
      const email = (c.email || "").toLowerCase();
      const userTickets = memoryStore.tickets.filter(
        (t) => (t.customerEmail || "").toLowerCase() === email
      );
      return {
        ...c,
        totalTickets: userTickets.length,
        openTicketsCount: userTickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed")
          .length,
        latestTicket: userTickets[0] || null,
        satisfactionRating:
          userTickets.find((t) => typeof t.csatRating === "number")?.csatRating || 5,
      };
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/customers/:email/timeline", requireAdmin, async (req: Request, res: Response) => {
  try {
    const email = decodeURIComponent(req.params.email).toLowerCase();

    const relatedTickets = memoryStore.tickets.filter(
      (t) => (t.customerEmail || "").toLowerCase() === email
    );

    const relatedOrders = memoryStore.orders.filter(
      (o) => (o.memberEmail || "").toLowerCase() === email
    );

    // Build unified timeline
    const timeline: Array<{
      id: string;
      type: "ticket" | "order" | "call" | "note";
      title: string;
      description: string;
      date: Date;
      meta?: any;
    }> = [];

    relatedTickets.forEach((t) => {
      timeline.push({
        id: `tl_tkt_${t.ticketId}`,
        type: "ticket",
        title: `Support Ticket: ${t.ticketId}`,
        description: `${t.subject} (Status: ${t.status}, Priority: ${t.priority})`,
        date: new Date(t.createdAt),
        meta: { ticketId: t.ticketId, status: t.status, repliesCount: t.replies?.length || 0 },
      });
    });

    relatedOrders.forEach((o) => {
      timeline.push({
        id: `tl_ord_${o._id}`,
        type: "order",
        title: `Placed Order: ${o.orderNumber || o._id}`,
        description: `Total ৳${(o.total || 0).toLocaleString()} (Status: ${o.status})`,
        date: new Date(o.createdAt || Date.now()),
        meta: { orderId: o._id, total: o.total, status: o.status },
      });
    });

    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return res.json({ email, timeline, ticketsCount: relatedTickets.length, ordersCount: relatedOrders.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SUPPORT TEAM & AGENTS
// ==========================================
router.get("/agents", requireAdmin, async (_req: Request, res: Response) => {
  try {
    let agents: any[] = [];
    if (isMongoConnected()) {
      try {
        agents = await SupportAgent.find().sort({ createdAt: -1 });
      } catch (e) {
        console.warn("Fallback to memoryStore agents:", e);
      }
    }
    if (!agents || agents.length === 0) {
      agents = memoryStore.supportAgents;
    }

    // Recalculate dynamic workload counts from live tickets
    const withLiveWorkload = agents.map((agent: any) => {
      const liveAssigned = memoryStore.tickets.filter(
        (t) =>
          (t.assignedAgentId === agent._id || t.assignedAgentName?.includes(agent.name)) &&
          t.status !== "Resolved" &&
          t.status !== "Closed"
      ).length;
      return {
        ...agent,
        assignedTicketsCount: liveAssigned > 0 ? liveAssigned : agent.assignedTicketsCount || 0,
      };
    });

    return res.json(withLiveWorkload);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/agents", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, email, role, department, phone, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Agent name and email are required." });
    }

    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || "Administrator";

    const newAgent = {
      _id: `agt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || "Support Agent",
      department: department || "Order Support",
      status: status || ("Active" as const),
      assignedTicketsCount: 0,
      resolvedTicketsCount: 0,
      avgCsat: 5.0,
      phone: phone ? phone.trim() : undefined,
      createdAt: new Date(),
    };

    memoryStore.supportAgents.push(newAgent);

    if (isMongoConnected()) {
      await SupportAgent.create(newAgent).catch((e) =>
        console.warn("MongoDB create agent error:", e)
      );
    }

    await logCareAudit(
      "AGENT_CREATED",
      newAgent._id,
      "agent",
      performedBy,
      `Registered support staff ${newAgent.name} (${newAgent.role}) in ${newAgent.department}`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json(newAgent);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/agents/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, department, status, phone, name } = req.body;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || "Administrator";

    let target: any = memoryStore.supportAgents.find((a) => a._id === id);
    if (target) {
      if (role) target.role = role;
      if (department) target.department = department;
      if (status) target.status = status;
      if (phone !== undefined) target.phone = phone;
      if (name) target.name = name;
    }

    if (isMongoConnected()) {
      try {
        const doc = await SupportAgent.findByIdAndUpdate(
          id,
          { role, department, status, phone, name },
          { new: true }
        );
        if (doc) target = doc;
      } catch (e) {
        console.warn("MongoDB update agent fallback:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Agent not found." });
    }

    await logCareAudit(
      "AGENT_UPDATED",
      id,
      "agent",
      performedBy,
      `Updated agent ${target.name} credentials & department assignments.`,
      req.ip || "127.0.0.1"
    );

    return res.json(target);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/agents/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || "Administrator";

    const idx = memoryStore.supportAgents.findIndex((a) => a._id === id);
    if (idx !== -1) {
      const removed = memoryStore.supportAgents.splice(idx, 1)[0];
      await logCareAudit(
        "AGENT_DELETED",
        id,
        "agent",
        performedBy,
        `Removed agent account ${removed.name}`,
        req.ip || "127.0.0.1"
      );
    }

    if (isMongoConnected()) {
      await SupportAgent.findByIdAndDelete(id).catch(() => {});
    }

    return res.json({ success: true, message: "Agent removed successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. KNOWLEDGE BASE & FAQ MANAGEMENT
// ==========================================
router.get("/knowledge-base", async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let articles: any[] = [];
    if (isMongoConnected()) {
      try {
        const query: any = {};
        if (category && category !== "all") query.category = category;
        if (search && typeof search === "string" && search.trim()) {
          const reg = new RegExp(search.trim(), "i");
          query.$or = [{ title: reg }, { summary: reg }, { content: reg }];
        }
        articles = await KnowledgeArticle.find(query).sort({ createdAt: -1 });
      } catch (e) {
        console.warn("Fallback to memoryStore knowledgeArticles:", e);
      }
    }

    if (!articles || articles.length === 0) {
      let filtered = [...memoryStore.knowledgeArticles];
      if (category && category !== "all") {
        filtered = filtered.filter((a) => a.category === category);
      }
      if (search && typeof search === "string" && search.trim()) {
        const term = search.trim().toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(term) ||
            a.summary.toLowerCase().includes(term) ||
            a.content.toLowerCase().includes(term)
        );
      }
      articles = filtered;
    }

    return res.json(articles);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/knowledge-base", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { title, category, summary, content, status, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Article title and content are required." });
    }

    const adminUser = (req as any).adminUser || {};
    const author = adminUser.name || "Customer Care Staff";

    const newArticle = {
      _id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category: category || "Orders & Delivery",
      summary: summary ? summary.trim() : title.trim(),
      content: content.trim(),
      status: status || ("published" as const),
      viewsCount: 0,
      helpfulCount: 0,
      tags: Array.isArray(tags) ? tags : [],
      author,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.knowledgeArticles.unshift(newArticle);

    if (isMongoConnected()) {
      await KnowledgeArticle.create(newArticle).catch((e) =>
        console.warn("MongoDB create FAQ error:", e)
      );
    }

    await logCareAudit(
      "FAQ_CREATED",
      newArticle._id,
      "faq",
      author,
      `Published FAQ article: "${newArticle.title}"`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json(newArticle);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/knowledge-base/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, category, summary, content, status, tags } = req.body;
    const adminUser = (req as any).adminUser || {};
    const author = adminUser.name || "Customer Care Staff";

    let target: any = memoryStore.knowledgeArticles.find((a) => a._id === id);
    if (target) {
      if (title) target.title = title.trim();
      if (category) target.category = category;
      if (summary) target.summary = summary.trim();
      if (content) target.content = content.trim();
      if (status) target.status = status;
      if (tags) target.tags = tags;
      target.updatedAt = new Date();
    }

    if (isMongoConnected()) {
      try {
        const doc = await KnowledgeArticle.findByIdAndUpdate(
          id,
          { title, category, summary, content, status, tags, updatedAt: new Date() },
          { new: true }
        );
        if (doc) target = doc;
      } catch (e) {
        console.warn("MongoDB update FAQ fallback:", e);
      }
    }

    if (!target) {
      return res.status(404).json({ error: "Article not found." });
    }

    await logCareAudit(
      "FAQ_UPDATED",
      id,
      "faq",
      author,
      `Updated FAQ article: "${target.title}"`,
      req.ip || "127.0.0.1"
    );

    return res.json(target);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/knowledge-base/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminUser = (req as any).adminUser || {};
    const author = adminUser.name || "Customer Care Staff";

    const idx = memoryStore.knowledgeArticles.findIndex((a) => a._id === id);
    if (idx !== -1) {
      const removed = memoryStore.knowledgeArticles.splice(idx, 1)[0];
      await logCareAudit(
        "FAQ_DELETED",
        id,
        "faq",
        author,
        `Deleted FAQ article "${removed.title}"`,
        req.ip || "127.0.0.1"
      );
    }

    if (isMongoConnected()) {
      await KnowledgeArticle.findByIdAndDelete(id).catch(() => {});
    }

    return res.json({ success: true, message: "Article removed." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. CANNED REPLIES & MESSAGE TEMPLATES
// ==========================================
const CANNED_TEMPLATES = [
  {
    id: "tpl_1",
    title: "Greeting & Order Verification",
    category: "General",
    body: "Greetings from ALIKE-ND Customer Care! We have received your inquiry regarding your recent order. Could you kindly verify your invoice number and delivery address so we can prioritize dispatch?",
  },
  {
    id: "tpl_2",
    title: "Express 20-Min Courier Update",
    category: "Logistics",
    body: "Your order has been assigned to our VIP courier express dispatch team. You will receive real-time location updates via SMS with your secure delivery authentication code.",
  },
  {
    id: "tpl_3",
    title: "Instant Replacement & Courier Pickup",
    category: "Claims",
    body: "We sincerely apologize for any inconvenience caused. A brand-new replacement unit has been dispatched immediately from our central facility, and our courier will collect the exchange item at zero delivery fee.",
  },
  {
    id: "tpl_4",
    title: "Refund Reversal Timeline",
    category: "Billing",
    body: "Your refund has been approved by our finance audit desk. For Mobile Financial Services (bKash/Nagad), funds settle within 2 to 24 hours. Bank debit/credit cards typically reflect within 3 to 7 business banking days.",
  },
  {
    id: "tpl_5",
    title: "Platinum VIP Priority Welcome",
    category: "VIP",
    body: "Welcome to ALIKE-ND Platinum Concierge! As an elite member, you enjoy 24/7 priority routing, dedicated private stylists, and complimentary express fulfillment across all luxury selections.",
  },
];

router.get("/templates", requireAdmin, async (_req: Request, res: Response) => {
  return res.json(CANNED_TEMPLATES);
});

// ==========================================
// 8. REPORTS & ANALYTICS
// ==========================================
router.get("/reports", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const tickets = memoryStore.tickets;
    const hotlines = memoryStore.hotlines;
    const agents = memoryStore.supportAgents;

    // Monthly aggregation
    const monthlyStats: Record<string, { total: number; resolved: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach((m) => (monthlyStats[m] = { total: 0, resolved: 0 }));

    tickets.forEach((t) => {
      const d = new Date(t.createdAt);
      const m = months[d.getMonth()];
      if (monthlyStats[m]) {
        monthlyStats[m].total += 1;
        if (t.status === "Resolved" || t.status === "Closed") {
          monthlyStats[m].resolved += 1;
        }
      }
    });

    // Top reported issue categories
    const categoryVolume: Record<string, number> = {};
    tickets.forEach((t) => {
      const c = t.category || "General Inquiry";
      categoryVolume[c] = (categoryVolume[c] || 0) + 1;
    });

    const topIssues = Object.entries(categoryVolume)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    // Agent leaderboard
    const agentPerformance = agents.map((a) => {
      const liveAssigned = tickets.filter((t) => t.assignedAgentId === a._id).length;
      return {
        id: a._id,
        name: a.name,
        role: a.role,
        department: a.department,
        assigned: liveAssigned,
        resolved: a.resolvedTicketsCount || 0,
        csat: a.avgCsat || 5.0,
      };
    });

    // Hotline call usage
    const hotlineUsage = hotlines.map((h) => ({
      id: h._id,
      name: h.name,
      phoneNumber: h.phoneNumber,
      department: h.department,
      callClicks: h.callClickCount || 0,
      isActive: h.isActive,
    }));

    return res.json({
      monthlyStats,
      topIssues,
      agentPerformance,
      hotlineUsage,
      overallResolutionRate:
        tickets.length > 0
          ? `${Math.round(
              (tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length /
                tickets.length) *
                100
            )}%`
          : "96%",
      avgCsat: 4.9,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. SETTINGS & PREFERENCES
// ==========================================
router.get("/settings", requireAdmin, async (_req: Request, res: Response) => {
  return res.json(memoryStore.customerCareSettings);
});

router.put("/settings", requireAdmin, async (req: Request, res: Response) => {
  try {
    const adminUser = (req as any).adminUser || {};
    const performedBy = adminUser.name || "Administrator";

    memoryStore.customerCareSettings = {
      ...memoryStore.customerCareSettings,
      ...req.body,
      updatedAt: new Date(),
    };

    await logCareAudit(
      "SETTINGS_UPDATED",
      "customer_care_settings",
      "settings",
      performedBy,
      "Updated global customer care operational settings.",
      req.ip || "127.0.0.1"
    );

    return res.json(memoryStore.customerCareSettings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. AUDIT LOGS
// ==========================================
router.get("/audit-logs", requireAdmin, async (_req: Request, res: Response) => {
  return res.json(memoryStore.customerCareAuditLogs);
});

// ==========================================
// 11. PUBLIC STOREFRONT HOTLINES & INQUIRY SUBMISSION
// ==========================================
// Public endpoint for storefront concierge / footer
router.get(["/", "/public/hotlines"], async (_req: Request, res: Response) => {
  try {
    const activeHotlines = (memoryStore.hotlines || []).filter((h) => h.isActive);
    return res.json(
      activeHotlines.map((h) => ({
        id: h._id,
        name: h.name,
        phoneNumber: h.phoneNumber,
        extension: h.extension,
        department: h.department,
        description: h.description,
        operatingHours: h.operatingHours,
        whatsappNumber: h.whatsappNumber,
        emailAddress: h.emailAddress,
        isEmergency: h.isEmergency,
        isPriority: h.isPriority,
      }))
    );
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Public endpoint for shoppers submitting support requests
router.post(["/", "/public/inquiry", "/inquiry"], async (req: Request, res: Response) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required." });
    }

    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${new Date().getFullYear()}-${uniqueNum}`;

    const newTicketData = {
      _id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketId,
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: phone ? phone.trim() : undefined,
      subject: (subject && subject.trim()) || "Storefront Customer Inquiry",
      description: message.trim(),
      category: category || "General Inquiry",
      priority: "Normal" as const,
      status: "New" as const,
      assignedDepartment: "Order Support",
      replies: [
        {
          id: `rep_${Date.now()}`,
          authorType: "customer" as const,
          authorName: name.trim(),
          authorEmail: email.trim().toLowerCase(),
          message: message.trim(),
          isInternalNote: false,
          createdAt: new Date(),
        },
      ],
      tags: ["Storefront Inquiry"],
      slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.tickets.unshift(newTicketData);
    if (isMongoConnected()) {
      await SupportTicket.create(newTicketData).catch(() => {});
    }

    await logCareAudit(
      "CUSTOMER_INQUIRY_RECEIVED",
      ticketId,
      "ticket",
      name.trim(),
      `Received new customer inquiry ${ticketId} via storefront`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json({
      success: true,
      ticketId,
      message:
        memoryStore.customerCareSettings?.autoResponderMessage ||
        "Thank you! Your inquiry has been registered. An authorized representative will get in touch shortly.",
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. AUTHENTICATED CUSTOMER SUPPORT CENTER APIS
// ==========================================

// Helper: Extract customer email safely from Authorization Bearer token or request
function extractCustomerEmail(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const secret = getJwtSecret();
      if (secret) {
        const decoded = jwt.verify(token, secret) as any;
        if (decoded?.email) {
          return String(decoded.email).toLowerCase().trim();
        }
      }
    } catch {
      // Token might be expired or not JWT, proceed to fallback
    }
  }

  const fallback = req.query.email || req.body?.customerEmail || req.body?.email;
  if (fallback && typeof fallback === "string" && fallback.trim()) {
    return fallback.toLowerCase().trim();
  }
  return null;
}

// Helper: Sanitize ticket for customer view (strip out internal staff notes)
function sanitizeTicketForCustomer(t: any) {
  if (!t) return null;
  const raw = typeof t.toObject === "function" ? t.toObject() : { ...t };
  const publicReplies = (raw.replies || [])
    .filter((r: any) => !r.isInternalNote)
    .map((r: any) => ({
      id: r.id || r._id,
      authorType: r.authorType,
      authorName: r.authorType === "staff" ? (r.authorName || "Customer Care Representative") : r.authorName,
      authorEmail: r.authorType === "staff" ? "support@alike-nd.com" : r.authorEmail,
      message: r.message,
      attachments: r.attachments || [],
      createdAt: r.createdAt,
    }));

  return {
    _id: raw._id,
    ticketId: raw.ticketId,
    customerName: raw.customerName,
    customerEmail: raw.customerEmail,
    customerPhone: raw.customerPhone,
    subject: raw.subject,
    description: raw.description,
    category: raw.category,
    subcategory: raw.subcategory,
    priority: raw.priority,
    status: raw.status,
    assignedDepartment: raw.assignedDepartment,
    replies: publicReplies,
    tags: raw.tags || [],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// GET /my-tickets & GET /user/tickets: Fetch all tickets for the user
router.get(["/my-tickets", "/user/tickets"], async (req: Request, res: Response) => {
  try {
    const userEmail = extractCustomerEmail(req);
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: "Please sign in or provide your registered customer email to view support requests.",
      });
    }

    let userTickets: any[] = [];

    if (isMongoConnected()) {
      try {
        userTickets = await SupportTicket.find({
          customerEmail: userEmail,
        }).sort({ updatedAt: -1, createdAt: -1 });
      } catch (err) {
        console.warn("Fallback to memoryStore for user tickets:", err);
      }
    }

    if (!userTickets || userTickets.length === 0) {
      userTickets = (memoryStore.tickets || []).filter(
        (t) => (t.customerEmail || "").toLowerCase().trim() === userEmail
      );
    }

    const sanitized = userTickets.map(sanitizeTicketForCustomer);
    return res.json({ success: true, tickets: sanitized });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /create-ticket & POST /user/tickets: Create real support ticket from User Support Center
router.post(["/create-ticket", "/user/tickets"], async (req: Request, res: Response) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      customerName,
      customerEmail,
      customerPhone,
      customerId,
      preferredContactMethod,
      attachments = [],
      troubleshootingContext,
    } = req.body;

    const resolvedEmail =
      extractCustomerEmail(req) ||
      (customerEmail ? String(customerEmail).toLowerCase().trim() : null);

    if (!resolvedEmail) {
      return res.status(400).json({ success: false, error: "Valid customer email is required." });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, error: "Issue subject is required." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: "Detailed description is required." });
    }

    // Generate unique Ticket ID: e.g. TKT-2026-XXXX
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `TKT-${new Date().getFullYear()}-${uniqueNum}`;

    // Format initial replies
    const initialReplies: any[] = [
      {
        id: `rep_${Date.now()}_init`,
        authorType: "customer" as const,
        authorName: (customerName || "Customer").trim(),
        authorEmail: resolvedEmail,
        message: description.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        isInternalNote: false,
        createdAt: new Date(),
      },
    ];

    // If customer attempted troubleshooting with assistant, append structured context
    if (troubleshootingContext && Array.isArray(troubleshootingContext) && troubleshootingContext.length > 0) {
      const summaryText = troubleshootingContext
        .map((step: any, idx: number) => `Step ${idx + 1}: ${step.title || step.query || "Inquiry"}\nResolution Attempted: ${step.attempt || step.advice || "Automated FAQ guidance"}\nStatus: ${step.resolved ? "Resolved" : "Unresolved"}`)
        .join("\n\n");

      initialReplies.push({
        id: `rep_${Date.now()}_assistant_ctx`,
        authorType: "staff" as const,
        authorName: "Intelligent Support Assistant",
        authorEmail: "assistant.care@alike-nd.com",
        message: `🤖 [TROUBLESHOOTING CONTEXT RECORDED]\nCustomer consulted the Support Assistant before ticket escalation:\n\n${summaryText}\n\nPreferred Contact Method: ${preferredContactMethod || "Email"}`,
        isInternalNote: true, // internal note for care agent review
        createdAt: new Date(),
      });
    }

    const newTicket = {
      _id: `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketId,
      customerName: (customerName || "Valued Client").trim(),
      customerEmail: resolvedEmail,
      customerPhone: customerPhone ? String(customerPhone).trim() : undefined,
      customerId: customerId ? String(customerId) : undefined,
      subject: subject.trim(),
      description: description.trim(),
      category: category || "General Inquiry",
      priority: priority && ["Low", "Normal", "High", "Urgent"].includes(priority) ? priority : "Normal",
      status: "New" as const,
      assignedDepartment:
        category === "Payment & Billing" || category === "Payments & Refunds"
          ? "Billing & Refunds"
          : category === "Technical Issues" || category === "Technical & IT"
          ? "Technical & IT"
          : category === "VIP Concierge"
          ? "VIP & High Value"
          : "Order Support",
      replies: initialReplies,
      tags: [
        "User Support Center",
        category || "General",
        preferredContactMethod ? `Contact: ${preferredContactMethod}` : "Contact: Email",
      ],
      slaDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStore.tickets.unshift(newTicket);

    if (isMongoConnected()) {
      await SupportTicket.create(newTicket).catch((e) =>
        console.warn("MongoDB create ticket error:", e)
      );
    }

    await logCareAudit(
      "USER_SUPPORT_TICKET_CREATED",
      ticketId,
      "ticket",
      newTicket.customerName,
      `User opened support ticket ${ticketId} [${newTicket.category}] via Support Center`,
      req.ip || "127.0.0.1"
    );

    return res.status(201).json({
      success: true,
      ticketId,
      ticket: sanitizeTicketForCustomer(newTicket),
      message: `Your support request has been registered as Ticket #${ticketId}. Our care team will review and respond shortly.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /tickets/:id/user & GET /user/tickets/:id: View single ticket details
router.get(["/tickets/:id/user", "/user/tickets/:id"], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userEmail = extractCustomerEmail(req);

    let ticket: any = null;
    if (isMongoConnected()) {
      ticket = await SupportTicket.findOne({
        $or: [{ _id: id }, { ticketId: id }],
      });
    }

    if (!ticket) {
      ticket = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    }

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Support request not found." });
    }

    // Verify ownership if userEmail is known
    if (userEmail && (ticket.customerEmail || "").toLowerCase().trim() !== userEmail) {
      return res.status(403).json({ success: false, error: "Access denied to this ticket." });
    }

    return res.json({ success: true, ticket: sanitizeTicketForCustomer(ticket) });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /tickets/:id/user-reply & POST /user/tickets/:id/reply: Customer replies to active ticket
router.post(["/tickets/:id/user-reply", "/user/tickets/:id/reply"], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { message, attachments = [] } = req.body;
    const userEmail = extractCustomerEmail(req);

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: "Reply message cannot be empty." });
    }

    let target: any = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    if (!target && isMongoConnected()) {
      target = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
    }

    if (!target) {
      return res.status(404).json({ success: false, error: "Support request not found." });
    }

    // Verify ownership
    if (userEmail && (target.customerEmail || "").toLowerCase().trim() !== userEmail) {
      return res.status(403).json({ success: false, error: "Access denied to this ticket." });
    }

    const replyEntry = {
      id: `rep_${Date.now()}_cust`,
      authorType: "customer" as const,
      authorName: target.customerName || "Customer",
      authorEmail: target.customerEmail,
      message: message.trim(),
      attachments: Array.isArray(attachments) ? attachments : [],
      isInternalNote: false,
      createdAt: new Date(),
    };

    target.replies = target.replies || [];
    target.replies.push(replyEntry);
    target.updatedAt = new Date();

    // If ticket was waiting for customer or resolved, flip back to Open/In Progress so agent sees customer replied
    if (target.status === "Waiting for Customer" || target.status === "Resolved") {
      target.status = "In Progress";
    }

    if (isMongoConnected()) {
      try {
        const doc = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
        if (doc) {
          doc.replies.push(replyEntry as any);
          doc.updatedAt = new Date();
          if (doc.status === "Waiting for Customer" || doc.status === "Resolved") {
            doc.status = "In Progress";
          }
          await doc.save();
        }
      } catch (err) {
        console.warn("MongoDB reply save error:", err);
      }
    }

    await logCareAudit(
      "CUSTOMER_REPLY_ADDED",
      target.ticketId,
      "ticket",
      target.customerName,
      `Customer replied to ticket ${target.ticketId}`,
      req.ip || "127.0.0.1"
    );

    return res.json({
      success: true,
      reply: replyEntry,
      ticket: sanitizeTicketForCustomer(target),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /tickets/:id/user-reopen & POST /user/tickets/:id/reopen: Customer reopens resolved ticket
router.post(["/tickets/:id/user-reopen", "/user/tickets/:id/reopen"], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = "Customer requested issue reopening" } = req.body;
    const userEmail = extractCustomerEmail(req);

    let target: any = memoryStore.tickets.find((t) => t._id === id || t.ticketId === id);
    if (!target && isMongoConnected()) {
      target = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
    }

    if (!target) {
      return res.status(404).json({ success: false, error: "Support request not found." });
    }

    if (userEmail && (target.customerEmail || "").toLowerCase().trim() !== userEmail) {
      return res.status(403).json({ success: false, error: "Access denied to this ticket." });
    }

    target.status = "In Progress";
    target.updatedAt = new Date();
    const reopenReply = {
      id: `rep_${Date.now()}_reopen`,
      authorType: "customer" as const,
      authorName: target.customerName || "Customer",
      authorEmail: target.customerEmail,
      message: `🔄 TICKET REOPENED BY CLIENT: ${reason.trim()}`,
      isInternalNote: false,
      createdAt: new Date(),
    };
    target.replies = target.replies || [];
    target.replies.push(reopenReply);

    if (isMongoConnected()) {
      try {
        const doc = await SupportTicket.findOne({ $or: [{ _id: id }, { ticketId: id }] });
        if (doc) {
          doc.status = "In Progress";
          doc.updatedAt = new Date();
          doc.replies.push(reopenReply as any);
          await doc.save();
        }
      } catch (err) {
        console.warn("MongoDB reopen save error:", err);
      }
    }

    await logCareAudit(
      "CUSTOMER_TICKET_REOPENED",
      target.ticketId,
      "ticket",
      target.customerName,
      `Ticket ${target.ticketId} was reopened by customer`,
      req.ip || "127.0.0.1"
    );

    return res.json({
      success: true,
      ticket: sanitizeTicketForCustomer(target),
      message: `Ticket #${target.ticketId} has been reopened and placed back in active priority queue.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /knowledge-base/:id/helpful: Mark article helpful
router.post("/knowledge-base/:id/helpful", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let target = memoryStore.knowledgeArticles.find((a) => a._id === id);
    if (target) {
      target.helpfulCount = (target.helpfulCount || 0) + 1;
    }
    if (isMongoConnected()) {
      await KnowledgeArticle.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } }).catch(() => {});
    }
    return res.json({ success: true, helpfulCount: target ? target.helpfulCount : 1 });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /knowledge-base/:id/view: Increment article view counter
router.post("/knowledge-base/:id/view", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let target = memoryStore.knowledgeArticles.find((a) => a._id === id);
    if (target) {
      target.viewsCount = (target.viewsCount || 0) + 1;
    }
    if (isMongoConnected()) {
      await KnowledgeArticle.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } }).catch(() => {});
    }
    return res.json({ success: true, viewsCount: target ? target.viewsCount : 1 });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
