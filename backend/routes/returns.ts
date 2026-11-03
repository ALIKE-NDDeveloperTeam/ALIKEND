import { Router } from "express";
import crypto from "crypto";
import ReturnRequest, { IReturnRequest, ReturnStatus } from "../models/ReturnRequest";
import ReturnPolicy from "../models/ReturnPolicy";
import Order from "../models/Order";
import Product from "../models/Product";
import User from "../models/User";
import { requireAdmin } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";

const router = Router();

// Helper to get staff info
function getStaffInfo(req: any) {
  return {
    email: req.admin?.email || req.user?.email || "admin@alike-nd.com",
    name: req.admin?.name || req.user?.name || "Support Staff",
  };
}

// =========================================================================
// 1. GET /api/admin/returns/stats - Summary counts for KPI cards
// =========================================================================
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    let requests: any[] = [];
    if (isMongoConnected()) {
      try {
        requests = await ReturnRequest.find().lean();
      } catch (e) {
        console.warn("MongoDB return stats fallback to memory:", e);
        requests = memoryStore.returnRequests || [];
      }
    } else {
      requests = memoryStore.returnRequests || [];
    }

    const total = requests.length;
    const requested = requests.filter((r) => r.status === "Requested" || r.status === "Under Review").length;
    const approved = requests.filter((r) => r.status === "Approved").length;
    const rejected = requests.filter((r) => r.status === "Rejected").length;
    const pickupScheduled = requests.filter((r) => r.status === "Pickup Scheduled").length;
    const inTransit = requests.filter((r) => r.status === "Picked Up" || r.status === "In Transit").length;
    const received = requests.filter((r) => r.status === "Received" || r.status === "Inspection in Progress").length;
    const refundPending = requests.filter((r) => r.status === "Refund Pending" && r.refundStatus !== "processed").length;
    const completed = requests.filter((r) => r.status === "Completed").length;

    return res.json({
      total,
      requested,
      approved,
      rejected,
      pickupScheduled,
      inTransit,
      received,
      refundPending,
      completed,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load return stats" });
  }
});

// =========================================================================
// 2. GET /api/admin/returns/policy - Return Policy Settings
// =========================================================================
router.get("/policy", async (_req, res) => {
  try {
    if (isMongoConnected()) {
      try {
        let policy = await ReturnPolicy.findOne({ key: "default_policy" }).lean();
        if (!policy) {
          policy = (await ReturnPolicy.create(memoryStore.returnPolicy)).toObject();
        }
        return res.json(policy);
      } catch (e) {
        console.warn("MongoDB policy read fallback:", e);
      }
    }
    return res.json(memoryStore.returnPolicy);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch return policy" });
  }
});

// =========================================================================
// 3. PUT /api/admin/returns/policy - Update Policy Settings (Admin)
// =========================================================================
router.put("/policy", requireAdmin, async (req, res) => {
  try {
    const staff = getStaffInfo(req);
    const updates = {
      ...req.body,
      updatedBy: staff.name,
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      const policy = await ReturnPolicy.findOneAndUpdate(
        { key: "default_policy" },
        { $set: updates },
        { upsert: true, new: true }
      );
      return res.json({ success: true, policy });
    }

    Object.assign(memoryStore.returnPolicy, updates);
    return res.json({ success: true, policy: memoryStore.returnPolicy });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update return policy" });
  }
});

// =========================================================================
// 4. GET /api/admin/returns - List return requests with search and filters
// =========================================================================
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { status, search, resolution } = req.query;

    let items: any[] = [];
    if (isMongoConnected()) {
      try {
        items = await ReturnRequest.find().sort({ createdAt: -1 }).lean();
      } catch (e) {
        items = memoryStore.returnRequests || [];
      }
    } else {
      items = memoryStore.returnRequests || [];
    }

    let filtered = [...items];

    if (status && status !== "all") {
      filtered = filtered.filter((r) => r.status.toLowerCase() === String(status).toLowerCase());
    }

    if (resolution && resolution !== "all") {
      filtered = filtered.filter(
        (r) => r.requestedResolution?.toLowerCase() === String(resolution).toLowerCase()
      );
    }

    if (search && String(search).trim()) {
      const q = String(search).toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.returnId?.toLowerCase().includes(q) ||
          r.orderNumber?.toLowerCase().includes(q) ||
          r.customerName?.toLowerCase().includes(q) ||
          r.customerEmail?.toLowerCase().includes(q) ||
          r.productName?.toLowerCase().includes(q)
      );
    }

    return res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch return requests" });
  }
});

// =========================================================================
// 5. GET /api/admin/returns/:id - Single Return Request Details
// =========================================================================
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    let retDoc: any = null;
    let orderDoc: any = null;

    if (isMongoConnected()) {
      try {
        retDoc = await ReturnRequest.findById(id).lean();
        if (!retDoc) retDoc = await ReturnRequest.findOne({ returnId: id }).lean();
        if (retDoc && retDoc.orderNumber) {
          orderDoc = await Order.findOne({ orderNumber: retDoc.orderNumber }).lean();
        }
      } catch (e) {}
    }

    if (!retDoc) {
      retDoc = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
      if (retDoc && retDoc.orderNumber) {
        orderDoc = (memoryStore.orders || []).find((o) => o.orderNumber === retDoc.orderNumber);
      }
    }

    if (!retDoc) {
      return res.status(404).json({ error: "Return request not found" });
    }

    return res.json({
      returnRequest: retDoc,
      originalOrder: orderDoc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch return request details" });
  }
});

// =========================================================================
// 6. POST /api/admin/returns/:id/review - Approve or Reject Return
// =========================================================================
router.post("/:id/review", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason, notes } = req.body; // decision: "approve" | "reject"

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ error: "Decision must be either 'approve' or 'reject'." });
    }

    const staff = getStaffInfo(req);
    const newStatus: ReturnStatus = decision === "approve" ? "Approved" : "Rejected";

    const auditEntry = {
      action: decision === "approve" ? "RETURN_APPROVED" : "RETURN_REJECTED",
      performedBy: `${staff.name} (${staff.email})`,
      timestamp: new Date(),
      notes: notes || reason || (decision === "approve" ? "Return request approved by staff." : "Return request rejected."),
    };

    if (isMongoConnected()) {
      const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
      if (ret) {
        ret.status = newStatus;
        if (decision === "reject") ret.rejectionReason = reason || "Does not meet return policy criteria.";
        ret.auditLog = ret.auditLog || [];
        ret.auditLog.unshift(auditEntry);
        await ret.save();

        return res.json({ success: true, message: `Return request ${decision}d.`, returnRequest: ret });
      }
    }

    // In-memory fallback
    const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    if (memRet) {
      memRet.status = newStatus;
      if (decision === "reject") memRet.rejectionReason = reason || "Does not meet return policy criteria.";
      memRet.auditLog = memRet.auditLog || [];
      memRet.auditLog.unshift(auditEntry);

      return res.json({ success: true, message: `Return request ${decision}d.`, returnRequest: memRet });
    }

    return res.status(404).json({ error: "Return request not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process review decision" });
  }
});

// =========================================================================
// 7. PATCH /api/admin/returns/:id/status - Update Status & Courier Logistics
// =========================================================================
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber, pickupScheduledDate, pickupCompletedDate, notes } = req.body;

    const staff = getStaffInfo(req);
    const auditEntry = {
      action: `STATUS_UPDATED_${String(status).toUpperCase()}`,
      performedBy: `${staff.name} (${staff.email})`,
      timestamp: new Date(),
      notes: notes || `Status changed to ${status}`,
    };

    const updateFields: any = { status };
    if (courierName) updateFields.courierName = courierName;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;
    if (pickupScheduledDate) updateFields.pickupScheduledDate = new Date(pickupScheduledDate);
    if (pickupCompletedDate) updateFields.pickupCompletedDate = new Date(pickupCompletedDate);

    if (isMongoConnected()) {
      const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
      if (ret) {
        Object.assign(ret, updateFields);
        ret.auditLog = ret.auditLog || [];
        ret.auditLog.unshift(auditEntry);
        await ret.save();

        return res.json({ success: true, message: `Status updated to ${status}.`, returnRequest: ret });
      }
    }

    const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    if (memRet) {
      Object.assign(memRet, updateFields);
      memRet.auditLog = memRet.auditLog || [];
      memRet.auditLog.unshift(auditEntry);

      return res.json({ success: true, message: `Status updated to ${status}.`, returnRequest: memRet });
    }

    return res.status(404).json({ error: "Return request not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update return status" });
  }
});

// =========================================================================
// 8. POST /api/admin/returns/:id/inspection - Record Inspection & Restock
// =========================================================================
router.post("/:id/inspection", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { inspectionResult, inspectionNotes, restock } = req.body;

    if (!["resalable", "damaged", "defective", "pending"].includes(inspectionResult)) {
      return res.status(400).json({ error: "Invalid inspection result value." });
    }

    const staff = getStaffInfo(req);

    // If item is resalable and restock requested, increment stock
    let restockedCount = 0;
    if (restock && inspectionResult === "resalable") {
      // Find return doc to get product info
      let retProduct: any = null;
      if (isMongoConnected()) {
        const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
        if (ret && ret.productId) {
          try {
            await Product.findByIdAndUpdate(ret.productId, { $inc: { stock: ret.quantity || 1 } });
            restockedCount = ret.quantity || 1;
          } catch (e) {}
        }
      } else {
        const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
        if (memRet && memRet.productId) {
          const p = (memoryStore.products || []).find((it) => it._id === memRet.productId || it.id === memRet.productId);
          if (p) {
            p.stock += memRet.quantity || 1;
            restockedCount = memRet.quantity || 1;
          }
        }
      }
    }

    const auditEntry = {
      action: "INSPECTION_RECORDED",
      performedBy: `${staff.name} (${staff.email})`,
      timestamp: new Date(),
      notes: `Inspection completed: ${inspectionResult}. ${restock ? `Restocked ${restockedCount} units.` : "No restock."} Note: ${inspectionNotes || "None"}`,
    };

    const updateFields = {
      inspectionResult,
      inspectionNotes: inspectionNotes || "",
      restocked: Boolean(restock && inspectionResult === "resalable"),
      status: "Refund Pending" as ReturnStatus,
    };

    if (isMongoConnected()) {
      const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
      if (ret) {
        Object.assign(ret, updateFields);
        ret.auditLog = ret.auditLog || [];
        ret.auditLog.unshift(auditEntry);
        await ret.save();

        return res.json({ success: true, message: "Inspection results recorded.", returnRequest: ret });
      }
    }

    const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    if (memRet) {
      Object.assign(memRet, updateFields);
      memRet.auditLog = memRet.auditLog || [];
      memRet.auditLog.unshift(auditEntry);

      return res.json({ success: true, message: "Inspection results recorded.", returnRequest: memRet });
    }

    return res.status(404).json({ error: "Return request not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to record inspection outcome" });
  }
});

// =========================================================================
// 9. POST /api/admin/returns/:id/refund - Process Refund with Wallet / Gateway
// =========================================================================
router.post("/:id/refund", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { refundMethod = "wallet", refundAmount, refundDeduction = 0, refundDeductionReason = "" } = req.body;

    const staff = getStaffInfo(req);

    // Retrieve return doc
    let retDoc: any = null;
    if (isMongoConnected()) {
      retDoc = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
    } else {
      retDoc = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    }

    if (!retDoc) {
      return res.status(404).json({ error: "Return request not found" });
    }

    // Prevent duplicate refunds
    if (retDoc.refundStatus === "processed") {
      return res.status(400).json({
        error: `Refund has already been processed for this return request (${retDoc.refundTransactionRef}). Duplicate refunds are prevented.`,
      });
    }

    const netRefund = Math.max(0, Number(refundAmount ?? retDoc.refundAmount ?? retDoc.unitPrice * retDoc.quantity) - Number(refundDeduction || 0));
    const refId = `REF-${Date.now().toString().slice(-6)}${crypto.randomInt(100, 999)}`;

    const auditEntry = {
      action: "REFUND_PROCESSED",
      performedBy: `${staff.name} (${staff.email})`,
      timestamp: new Date(),
      notes: `Net refund of ₹${netRefund} processed via ${refundMethod}. Ref: ${refId}. Deductions: ₹${refundDeduction} (${refundDeductionReason || "None"}).`,
    };

    const updateFields = {
      refundMethod,
      refundAmount: netRefund,
      refundDeduction: Number(refundDeduction || 0),
      refundDeductionReason,
      refundTransactionRef: refId,
      refundStatus: "processed",
      status: "Completed",
    };

    if (isMongoConnected()) {
      Object.assign(retDoc, updateFields);
      retDoc.auditLog = retDoc.auditLog || [];
      retDoc.auditLog.unshift(auditEntry);
      await retDoc.save();
    } else {
      Object.assign(retDoc, updateFields);
      retDoc.auditLog = retDoc.auditLog || [];
      retDoc.auditLog.unshift(auditEntry);
    }

    return res.json({
      success: true,
      message: `Refund of ₹${netRefund.toLocaleString("en-IN")} successfully processed (${refId}).`,
      refundTransactionRef: refId,
      netRefund,
      returnRequest: retDoc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to process refund" });
  }
});

// =========================================================================
// 10. POST /api/admin/returns/:id/notes - Add internal staff note
// =========================================================================
router.post("/:id/notes", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    if (!note || !String(note).trim()) {
      return res.status(400).json({ error: "Note content is required." });
    }

    const staff = getStaffInfo(req);
    const noteEntry = {
      id: `note_${Date.now()}`,
      author: `${staff.name} (${staff.email})`,
      note: String(note).trim(),
      createdAt: new Date(),
    };

    if (isMongoConnected()) {
      const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
      if (ret) {
        ret.internalNotes = ret.internalNotes || [];
        ret.internalNotes.unshift(noteEntry);
        await ret.save();
        return res.json({ success: true, notes: ret.internalNotes });
      }
    }

    const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    if (memRet) {
      memRet.internalNotes = memRet.internalNotes || [];
      memRet.internalNotes.unshift(noteEntry);
      return res.json({ success: true, notes: memRet.internalNotes });
    }

    return res.status(404).json({ error: "Return request not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add internal note" });
  }
});

// =========================================================================
// 11. POST /api/admin/returns/:id/assign - Assign staff member
// =========================================================================
router.post("/:id/assign", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, staffName, staffEmail } = req.body;

    const assignedStaff = {
      id: staffId || "staff_1",
      name: staffName || "Support Specialist",
      email: staffEmail || "support@alike-nd.com",
    };

    if (isMongoConnected()) {
      const ret = await ReturnRequest.findOne({ $or: [{ _id: id }, { returnId: id }] });
      if (ret) {
        ret.assignedStaff = assignedStaff;
        await ret.save();
        return res.json({ success: true, assignedStaff: ret.assignedStaff });
      }
    }

    const memRet = (memoryStore.returnRequests || []).find((r) => r._id === id || r.returnId === id);
    if (memRet) {
      memRet.assignedStaff = assignedStaff;
      return res.json({ success: true, assignedStaff: memRet.assignedStaff });
    }

    return res.status(404).json({ error: "Return request not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to assign staff" });
  }
});

// =========================================================================
// 12. Customer-Facing: POST /api/returns - Submit Customer Return Request
// =========================================================================
router.post("/", async (req, res) => {
  try {
    const {
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      productId,
      productName,
      productImage,
      variant,
      size,
      color,
      unitPrice,
      quantity = 1,
      returnReason,
      customerDescription,
      evidenceImages = [],
      requestedResolution = "refund",
    } = req.body;

    if (!orderNumber || !customerEmail || !productName || !returnReason) {
      return res.status(400).json({
        error: "orderNumber, customerEmail, productName, and returnReason are required fields.",
      });
    }

    const cleanEmail = String(customerEmail).trim().toLowerCase();

    // Backend restriction enforcement: Check if user has return_block or refund_block!
    let userDoc: any = null;
    if (isMongoConnected()) {
      userDoc = await User.findOne({ email: cleanEmail }).lean();
    } else {
      userDoc = (memoryStore.users || []).find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (userDoc) {
      const restrictions = userDoc.restrictions || {};
      if (restrictions.return_block?.enabled) {
        return res.status(403).json({
          error: `Return requests are currently restricted on this account. Reason: ${restrictions.return_block.reason || "Policy violation"}. Please contact Customer Care.`,
        });
      }
      if (requestedResolution === "refund" && restrictions.refund_block?.enabled) {
        return res.status(403).json({
          error: `Refund requests are currently disabled for this account. Reason: ${restrictions.refund_block.reason || "Administrative restriction"}.`,
        });
      }
    }

    const returnId = `RET-${Date.now().toString().slice(-4)}${crypto.randomInt(100, 999)}`;
    const calcPrice = Number(unitPrice || 0);
    const calcQty = Math.max(1, Number(quantity || 1));
    const refundTotal = calcPrice * calcQty;

    const returnData = {
      returnId,
      orderNumber,
      customerId: userDoc ? String(userDoc._id) : undefined,
      customerName: customerName || userDoc?.fullName || "Valued Customer",
      customerEmail: cleanEmail,
      customerPhone: customerPhone || userDoc?.phone || "",
      productId,
      productName,
      productImage: productImage || "",
      variant: variant || "",
      size: size || "",
      color: color || "",
      unitPrice: calcPrice,
      quantity: calcQty,
      purchaseDate: new Date(Date.now() - 86400000 * 3),
      deliveryDate: new Date(Date.now() - 86400000 * 1),
      returnReason,
      customerDescription: customerDescription || "",
      evidenceImages: Array.isArray(evidenceImages) ? evidenceImages : [],
      requestedResolution,
      status: "Requested" as ReturnStatus,
      refundMethod: "wallet" as const,
      refundAmount: refundTotal,
      refundDeduction: 0,
      refundStatus: "pending" as const,
      internalNotes: [],
      auditLog: [
        {
          action: "RETURN_CREATED_BY_CUSTOMER",
          performedBy: `${customerName || cleanEmail} (Customer)`,
          timestamp: new Date(),
          notes: "Customer self-service return request submitted via portal.",
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isMongoConnected()) {
      try {
        const created = await ReturnRequest.create(returnData);
        return res.status(201).json({
          success: true,
          message: "Return request submitted successfully. A customer care agent will review it shortly.",
          returnRequest: created,
        });
      } catch (e: any) {
        console.warn("MongoDB return creation error, fallback to memory:", e);
      }
    }

    const memItem: any = {
      _id: `ret_${Date.now()}`,
      restocked: false,
      ...returnData,
    };
    memoryStore.returnRequests = memoryStore.returnRequests || [];
    memoryStore.returnRequests.unshift(memItem);

    return res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      returnRequest: memItem,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to submit return request" });
  }
});

// =========================================================================
// 13. Customer-Facing: GET /api/returns/my-returns - Customer returns list
// =========================================================================
router.get("/my-returns", async (req, res) => {
  try {
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ error: "Customer email parameter is required." });
    }

    let items: any[] = [];
    if (isMongoConnected()) {
      try {
        items = await ReturnRequest.find({ customerEmail: email }).sort({ createdAt: -1 }).lean();
      } catch (e) {
        items = (memoryStore.returnRequests || []).filter((r) => r.customerEmail?.toLowerCase() === email);
      }
    } else {
      items = (memoryStore.returnRequests || []).filter((r) => r.customerEmail?.toLowerCase() === email);
    }

    return res.json(items);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch customer returns" });
  }
});

export default router;
