import { Router } from "express";
import Seller, {
  SellerStatus,
  SellerStoreStatus,
  SellerVerificationStatus,
  SellerIdentityVerification,
  SellerNotificationEntry,
} from "../models/Seller";
import Product from "../models/Product";
import Order from "../models/Order";
import SellerWithdrawal from "../models/SellerWithdrawal";
import Admin, { AdminSellerManagementPermissions } from "../models/Admin";
import OtpVerification from "../models/OtpVerification";
import ActivityLog from "../models/ActivityLog";
import { SupportTicket } from "../models/CustomerCare";
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";
import { sendOtpEmail } from "../services/mailer";
import { sellerOtpStore } from "./sellerPortal";

const router = Router();
router.use(requireAdmin);

const DEFAULT_ADMIN_SELLER_PERMISSIONS: AdminSellerManagementPermissions = {
  viewSellers: true,
  approveSellers: true,
  editSellerProfiles: true,
  suspendSellers: true,
  manageSellerProducts: true,
  viewSellerOrders: true,
  manageRefunds: true,
  viewFinancialReports: true,
  managePayouts: true,
  manageSellerSupport: true,
};

// Check if the authenticated admin has a specific Seller Management permission
async function checkAdminSellerPermission(
  req: AuthedRequest,
  permKey: keyof AdminSellerManagementPermissions
): Promise<boolean> {
  if (!req.admin) return false;
  if (req.admin.role === "superadmin") return true;

  if (isMongoConnected() && req.admin.adminId) {
    try {
      const adminDoc = await Admin.findById(req.admin.adminId).lean();
      if (adminDoc && adminDoc.sellerManagementPermissions) {
        return Boolean(adminDoc.sellerManagementPermissions[permKey]);
      }
    } catch {}
  }

  const memAdmin = ((memoryStore as any).admins || []).find(
    (a: any) =>
      String(a._id || a.id) === String(req.admin?.adminId) ||
      (a.email && req.admin?.email && a.email.toLowerCase() === req.admin.email.toLowerCase())
  );
  if (memAdmin && memAdmin.sellerManagementPermissions) {
    return Boolean(memAdmin.sellerManagementPermissions[permKey]);
  }

  return true;
}

// Helper to mask sensitive bank and PAN data and never expose passwords
function maskSensitiveSeller(s: any, isSuperAdmin: boolean = false, includeVerificationDocs: boolean = false) {
  const doc = s && typeof s.toObject === "function" ? s.toObject() : { ...s };
  delete doc.password;
  delete doc.passwordHash;

  if (!doc._id && doc.id) {
    doc._id = String(doc.id);
  } else if (doc._id) {
    doc._id = String(doc._id);
  }

  doc.storeStatus = doc.storeStatus || "active";
  doc.storePolicy = doc.storePolicy || "";
  doc.rejectionReason = doc.rejectionReason || "";
  doc.infoRequestMessage = doc.infoRequestMessage || "";
  doc.tokenVersion = Number(doc.tokenVersion) || 1;
  doc.adminNotes = Array.isArray(doc.adminNotes) ? doc.adminNotes : [];
  doc.applicationHistory = Array.isArray(doc.applicationHistory) ? doc.applicationHistory : [];
  doc.notifications = Array.isArray(doc.notifications) ? doc.notifications : [];

  const rawVerificationStatus: SellerVerificationStatus =
    doc.verificationStatus || doc.identityVerification?.status || "not_submitted";
  const isVerifiedBadge =
    Boolean(doc.verifiedBadge || doc.identityVerification?.verifiedBadge) &&
    rawVerificationStatus === "approved";

  doc.verificationStatus = rawVerificationStatus;
  doc.verifiedBadge = isVerifiedBadge;

  if (doc.identityVerification) {
    doc.identityVerification = {
      ...doc.identityVerification,
      status: rawVerificationStatus,
      verifiedBadge: isVerifiedBadge,
      history: Array.isArray(doc.identityVerification.history) ? doc.identityVerification.history : [],
    };
    if (!includeVerificationDocs && !isSuperAdmin) {
      // Mask NID number in general listing if admin doesn't have verification doc view
      const nid = String(doc.identityVerification.nidNumber || "");
      doc.identityVerification.nidNumber =
        nid.length > 4 ? `${nid.slice(0, 2)}••••••${nid.slice(-2)}` : nid ? "••••" : "";
    }
  } else {
    doc.identityVerification = {
      status: rawVerificationStatus,
      verifiedBadge: isVerifiedBadge,
      nidNumber: "",
      nidFullName: "",
      nidDateOfBirth: "",
      nidAddress: "",
      nidFrontImage: "",
      nidBackImage: "",
      facePhotoImage: "",
      consentGiven: false,
      history: [],
    };
  }

  doc.permissions = {
    canAddProducts: true,
    canEditProducts: true,
    canManageOrders: true,
    canWithdrawPayouts: true,
    canMakeNewSales: true,
    ...(doc.permissions || {}),
  };

  if (!isSuperAdmin) {
    if (doc.bankAccountNumber) {
      const acc = String(doc.bankAccountNumber);
      doc.bankAccountNumber = acc.length > 4 ? `••••••••${acc.slice(-4)}` : "••••";
    }
    if (doc.panNumber) {
      const pan = String(doc.panNumber);
      doc.panNumber = pan.length > 4 ? `${pan.slice(0, 2)}••••••${pan.slice(-2)}` : "••••";
    }
  }
  return doc;
}

async function getAllSellersRaw(): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      const sellers = await Seller.find().select("-password").sort({ createdAt: -1 }).lean();
      if (sellers && sellers.length > 0) return sellers;
    } catch (err) {
      console.warn("MongoDB fetch sellers failed, using in-memory store:", err);
    }
  }
  return memoryStore.sellers || [];
}

async function getAllProductsRaw(): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      if (products && products.length > 0) return products;
    } catch {}
  }
  return memoryStore.products || [];
}

async function getAllOrdersRaw(): Promise<any[]> {
  if (isMongoConnected()) {
    try {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      if (orders && orders.length > 0) return orders;
    } catch {}
  }
  return memoryStore.orders || [];
}

// ==========================================
// 1. GET /api/admin/sellers — List all sellers
// ==========================================
router.get("/", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "viewSellers");
    if (!allowed) {
      return res.status(403).json({ success: false, error: "Permission denied: Cannot view sellers." });
    }
    const isSuper = req.admin?.role === "superadmin";
    const sellers = await getAllSellersRaw();
    return res.json({
      success: true,
      sellers: sellers.map((s) => maskSensitiveSeller(s, isSuper)),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch sellers" });
  }
});

// ==========================================
// 2. GET /api/admin/sellers/overview — Real DB Statistics
// ==========================================
router.get("/overview", async (req: AuthedRequest, res) => {
  try {
    const [sellers, products, orders] = await Promise.all([
      getAllSellersRaw(),
      getAllProductsRaw(),
      getAllOrdersRaw(),
    ]);

    let withdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawals = await SellerWithdrawal.find().sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (withdrawals.length === 0) {
      withdrawals = (memoryStore as any).sellerWithdrawals || [];
    }

    let supportTickets: any[] = [];
    if (isMongoConnected()) {
      try {
        supportTickets = await SupportTicket.find({
          $or: [
            { assignedDepartment: "Seller Relations" },
            { tags: "seller" },
            { subject: { $regex: /seller|store|merchant/i } },
          ],
        }).lean();
      } catch {}
    }
    if (supportTickets.length === 0) {
      supportTickets = ((memoryStore as any).supportTickets || []).filter(
        (t: any) =>
          t.assignedDepartment === "Seller Relations" ||
          (Array.isArray(t.tags) && t.tags.includes("seller"))
      );
    }

    const totalSellers = sellers.length;
    const pendingApplications = sellers.filter((s) => s.status === "pending" || s.status === "review").length;
    const approvedSellers = sellers.filter((s) => s.status === "approved").length;
    const rejectedApplications = sellers.filter((s) => s.status === "rejected").length;
    const suspendedSellers = sellers.filter((s) => s.status === "suspended").length;
    const underReviewSellers = sellers.filter((s) => s.status === "review").length;

    const activeStores = sellers.filter(
      (s) => s.status === "approved" && (s.storeStatus || "active") === "active"
    ).length;
    const temporarilyDisabledStores = sellers.filter(
      (s) => s.storeStatus === "temporarily_disabled"
    ).length;
    const closedStores = sellers.filter((s) => s.storeStatus === "closed").length;

    const sellerIds = new Set(sellers.map((s) => String(s._id || s.id)));
    const sellerProducts = products.filter(
      (p) => p.sellerId || p.sellerShopName || (p.sellerId && sellerIds.has(String(p.sellerId)))
    );
    const totalSellerProducts = sellerProducts.length || products.length;
    const pendingModerationProducts = products.filter((p) => p.moderationStatus === "pending").length;
    const outOfStockProducts = products.filter((p) => !p.inStock || Number(p.stockQuantity ?? 1) <= 0).length;

    let grossSellerSales = 0;
    let platformCommission = 0;
    let netSellerEarnings = 0;
    let refundedOrCancelledAmount = 0;
    let totalSellerOrders = 0;

    for (const order of orders) {
      const orderTotal = Number(order.total) || 0;
      const isCancelled = order.status === "cancelled";
      totalSellerOrders += 1;
      if (isCancelled) {
        refundedOrCancelledAmount += orderTotal;
      } else {
        grossSellerSales += orderTotal;
        const comm = Number(order.commissionAmount) || Math.round(orderTotal * 0.1);
        platformCommission += comm;
        netSellerEarnings += Math.max(0, orderTotal - comm);
      }
    }

    const pendingPayoutsAmount = withdrawals
      .filter((w) => w.status === "pending")
      .reduce((acc, w) => acc + (Number(w.amount) || 0), 0);

    const pendingVerificationRequests = sellers.filter((s) => {
      const vStatus = s.verificationStatus || s.identityVerification?.status || "not_submitted";
      return vStatus === "pending_admin_review" || vStatus === "under_review";
    }).length;

    const verifiedBadgeSellers = sellers.filter((s) => {
      const vStatus = s.verificationStatus || s.identityVerification?.status || "not_submitted";
      return Boolean(s.verifiedBadge || s.identityVerification?.verifiedBadge) && vStatus === "approved";
    }).length;

    return res.json({
      success: true,
      stats: {
        totalSellers,
        pendingApplications,
        approvedSellers,
        rejectedApplications,
        suspendedSellers,
        underReviewSellers,
        activeStores,
        temporarilyDisabledStores,
        closedStores,
        totalSellerProducts,
        pendingModerationProducts,
        outOfStockProducts,
        totalSellerOrders,
        grossSellerSales,
        platformCommission,
        netSellerEarnings,
        refundedOrCancelledAmount,
        pendingPayoutsAmount,
        sellerSupportTicketsCount: supportTickets.length,
        pendingVerificationRequests,
        verifiedBadgeSellers,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to compute seller overview" });
  }
});

// ==========================================
// 3. GET /api/admin/sellers/finance/summary — Sales, Commission & Payouts
// ==========================================
router.get("/finance/summary", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "viewFinancialReports");
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You do not have access to Seller Financial Reports.",
      });
    }

    const [sellers, products, orders] = await Promise.all([
      getAllSellersRaw(),
      getAllProductsRaw(),
      getAllOrdersRaw(),
    ]);

    let withdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawals = await SellerWithdrawal.find().sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (withdrawals.length === 0) {
      withdrawals = (memoryStore as any).sellerWithdrawals || [];
    }

    // Build product -> sellerId lookup
    const productSellerMap = new Map<string, string>();
    for (const p of products) {
      if (p.sellerId) {
        productSellerMap.set(String(p._id || p.id), String(p.sellerId));
        if (p.name) productSellerMap.set(String(p.name).toLowerCase(), String(p.sellerId));
      }
    }

    const sellerSalesReports = sellers.map((seller) => {
      const sId = String(seller._id || seller.id);
      const sName = seller.shopName || seller.storefront || "Seller Store";

      let grossSales = 0;
      let commission = 0;
      let netSales = 0;
      let refundsAndCancellations = 0;
      let orderCount = 0;

      for (const order of orders) {
        const orderSellerId = order.sellerId ? String(order.sellerId) : null;
        const items = Array.isArray(order.items) ? order.items : [];
        let matchedAmount = 0;

        if (orderSellerId === sId) {
          matchedAmount = Number(order.total) || 0;
        } else {
          for (const item of items) {
            const itemSellerId =
              item.sellerId ||
              productSellerMap.get(String(item.productId || item.id)) ||
              (item.name ? productSellerMap.get(String(item.name).toLowerCase()) : undefined);
            if (itemSellerId && String(itemSellerId) === sId) {
              matchedAmount += (Number(item.price) || 0) * (Number(item.qty || item.quantity) || 1);
            }
          }
        }

        if (matchedAmount > 0) {
          orderCount += 1;
          if (order.status === "cancelled") {
            refundsAndCancellations += matchedAmount;
          } else {
            grossSales += matchedAmount;
            const comm = Math.round(matchedAmount * 0.1);
            commission += comm;
            netSales += Math.max(0, matchedAmount - comm);
          }
        }
      }

      const sellerWithdrawals = withdrawals.filter((w) => String(w.sellerId) === sId);
      const paidOutTotal = sellerWithdrawals
        .filter((w) => w.status === "approved")
        .reduce((acc, w) => acc + (Number(w.amount) || 0), 0);
      const pendingPayoutTotal = sellerWithdrawals
        .filter((w) => w.status === "pending")
        .reduce((acc, w) => acc + (Number(w.amount) || 0), 0);

      const currentWalletBalance =
        Number(seller.walletBalance) || Math.max(0, netSales - paidOutTotal - pendingPayoutTotal);

      return {
        sellerId: sId,
        shopName: sName,
        ownerName: seller.ownerName || "Merchant",
        email: seller.email || seller.ownerEmail || "",
        status: seller.status || "pending",
        storeStatus: seller.storeStatus || "active",
        orderCount,
        grossSales,
        commission,
        refundsAndCancellations,
        netSales,
        paidOutTotal,
        pendingPayoutTotal,
        walletBalance: currentWalletBalance,
      };
    });

    return res.json({
      success: true,
      sellerReports: sellerSalesReports,
      withdrawals: withdrawals.map((w) => ({
        ...w,
        _id: String(w._id || w.id),
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to load seller finance summary" });
  }
});

// ==========================================
// 4. PATCH /api/admin/sellers/finance/withdrawals/:withdrawalId — Process Payout
// ==========================================
router.patch("/finance/withdrawals/:withdrawalId", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "managePayouts");
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You do not have permission to process seller payouts.",
      });
    }

    const { withdrawalId } = req.params;
    const { status, rejectionReason, transactionReference, note } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, error: "Invalid withdrawal status." });
    }

    let updatedWithdrawal: any = null;
    const updatePayload: any = {
      status,
      processedAt: new Date(),
      processedByAdminEmail: req.admin?.email || "admin",
    };
    if (rejectionReason !== undefined) updatePayload.rejectionReason = String(rejectionReason).trim();
    if (transactionReference || note) {
      updatePayload.note = [note, transactionReference ? `Ref: ${transactionReference}` : ""]
        .filter(Boolean)
        .join(" | ");
    }

    if (isMongoConnected()) {
      try {
        updatedWithdrawal = await SellerWithdrawal.findByIdAndUpdate(
          withdrawalId,
          { $set: updatePayload },
          { new: true }
        ).lean();
      } catch {}
    }

    const memList: any[] = (memoryStore as any).sellerWithdrawals || [];
    const memIdx = memList.findIndex((w) => String(w._id || w.id) === String(withdrawalId));
    if (memIdx !== -1) {
      memList[memIdx] = { ...memList[memIdx], ...updatePayload };
      if (!updatedWithdrawal) updatedWithdrawal = memList[memIdx];
    }

    if (!updatedWithdrawal) {
      return res.status(404).json({ success: false, error: "Withdrawal record not found." });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) updated payout #${withdrawalId} for "${updatedWithdrawal.sellerShopName}" to ${status.toUpperCase()}`,
    });

    return res.json({ success: true, withdrawal: updatedWithdrawal });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller payout" });
  }
});

// ==========================================
// 5. PATCH /api/admin/sellers/products/:productId/moderation — Seller Product Moderation
// ==========================================
router.patch("/products/:productId/moderation", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "manageSellerProducts");
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You cannot moderate seller products.",
      });
    }

    const { productId } = req.params;
    const { action, note } = req.body;
    // Supported actions: approve, reject, publish, unpublish, archive
    const validActions = ["approve", "reject", "publish", "unpublish", "archive"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Invalid moderation action. Expected approve, reject, publish, unpublish, or archive.",
      });
    }

    const historyEntry = {
      action: `Admin ${action.toUpperCase()}`,
      actedBy: `${req.admin?.name || "Admin"} (${req.admin?.email || "staff"})`,
      note: String(note || "").trim(),
      createdAt: new Date(),
    };

    const setFields: Record<string, any> = {};
    if (action === "approve") {
      setFields.moderationStatus = "approved";
      setFields.isPublished = true;
      setFields.isHidden = false;
    } else if (action === "reject") {
      setFields.moderationStatus = "rejected";
      setFields.isPublished = false;
    } else if (action === "publish") {
      setFields.isPublished = true;
      setFields.isHidden = false;
      setFields.moderationStatus = "approved";
    } else if (action === "unpublish") {
      setFields.isPublished = false;
      setFields.isHidden = true;
    } else if (action === "archive") {
      setFields.moderationStatus = "archived";
      setFields.isPublished = false;
      setFields.isHidden = true;
    }
    if (note !== undefined) {
      setFields.moderationNote = String(note).trim();
    }

    let updatedProduct: any = null;
    if (isMongoConnected()) {
      try {
        updatedProduct = await Product.findByIdAndUpdate(
          productId,
          {
            $set: setFields,
            $push: { changeHistory: historyEntry },
          },
          { new: true }
        ).lean();
      } catch {}
    }

    const pIndex = (memoryStore.products || []).findIndex(
      (p) => String(p._id || (p as any).id) === String(productId)
    );
    if (pIndex !== -1) {
      const target = memoryStore.products[pIndex] as any;
      Object.assign(target, setFields);
      target.changeHistory = [historyEntry, ...(Array.isArray(target.changeHistory) ? target.changeHistory : [])];
      if (!updatedProduct) updatedProduct = target;
    }

    if (!updatedProduct) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) performed "${action.toUpperCase()}" on product "${updatedProduct.name}"${note ? ` — Note: ${note}` : ""}`,
    });

    return res.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to moderate seller product" });
  }
});

// ==========================================
// 6. Seller Support & Complaints Integration (/api/admin/sellers/support/tickets)
// ==========================================
router.get("/support/tickets", async (req: AuthedRequest, res) => {
  try {
    let tickets: any[] = [];
    if (isMongoConnected()) {
      try {
        tickets = await SupportTicket.find({
          $or: [
            { assignedDepartment: "Seller Relations" },
            { tags: "seller" },
            { subject: { $regex: /seller|store|merchant|payout|listing/i } },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();
      } catch {}
    }

    const memTickets = ((memoryStore as any).supportTickets || []).filter(
      (t: any) =>
        t.assignedDepartment === "Seller Relations" ||
        (Array.isArray(t.tags) && t.tags.includes("seller"))
    );

    const combined = [...tickets, ...memTickets];
    const seen = new Set<string>();
    const deduped = combined.filter((t) => {
      const key = String(t._id || t.ticketNumber);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return res.json({ success: true, tickets: deduped });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch seller support tickets" });
  }
});

router.post("/support/tickets", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "manageSellerSupport");
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You cannot create or manage seller support tickets.",
      });
    }

    const {
      sellerId,
      sellerName,
      sellerEmail,
      sellerPhone,
      shopName,
      category = "other",
      priority = "medium",
      subject,
      description,
      orderNumber,
      escalateToCustomerCare,
    } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: "Subject and description are required to open a seller support/complaint ticket.",
      });
    }

    const ticketNumber = `SLR-${Date.now().toString().slice(-6)}`;
    const ticketPayload: any = {
      ticketNumber,
      customerId: sellerId ? String(sellerId) : undefined,
      customerName: sellerName || shopName || "Seller Partner",
      customerEmail: (sellerEmail || "seller@alike.com").toLowerCase().trim(),
      customerPhone: sellerPhone || "",
      orderNumber: orderNumber || undefined,
      category: ["order_issue", "delivery_delay", "return_refund", "payment_issue", "product_quality", "account_help", "other"].includes(category)
        ? category
        : "other",
      priority: ["low", "medium", "high", "urgent"].includes(priority) ? priority : "medium",
      status: escalateToCustomerCare ? "escalated" : "open",
      subject: `[${shopName || "Seller"}] ${String(subject).trim()}`,
      description: String(description).trim(),
      assignedAgentName: req.admin?.name || "Seller Relations Desk",
      assignedDepartment: escalateToCustomerCare ? "Escalations" : "Seller Relations",
      tags: ["seller", shopName ? String(shopName).toLowerCase() : "marketplace"].filter(Boolean),
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderRole: "agent",
          senderName: req.admin?.name || "Admin",
          senderEmail: req.admin?.email || "admin",
          message: String(description).trim(),
          isInternalNote: false,
          createdAt: new Date(),
        },
      ],
    };

    let createdTicket: any = null;
    if (isMongoConnected()) {
      try {
        createdTicket = await SupportTicket.create(ticketPayload);
      } catch {}
    }

    if (!createdTicket) {
      createdTicket = { _id: `st_${Date.now()}`, ...ticketPayload, createdAt: new Date(), updatedAt: new Date() };
    }
    if (!(memoryStore as any).supportTickets) (memoryStore as any).supportTickets = [];
    (memoryStore as any).supportTickets.unshift(createdTicket);

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin opened seller support ticket ${ticketNumber} for "${shopName || sellerEmail}"`,
    });

    return res.status(201).json({ success: true, ticket: createdTicket });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to create seller support ticket" });
  }
});

router.patch("/support/tickets/:ticketId", async (req: AuthedRequest, res) => {
  try {
    const allowed = await checkAdminSellerPermission(req, "manageSellerSupport");
    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You cannot update seller support tickets.",
      });
    }

    const { ticketId } = req.params;
    const { status, priority, assignedAgentName, assignedDepartment, replyMessage, isInternalNote, resolutionSummary } =
      req.body;

    const updateSet: Record<string, any> = {};
    if (status) updateSet.status = status;
    if (priority) updateSet.priority = priority;
    if (assignedAgentName !== undefined) updateSet.assignedAgentName = assignedAgentName;
    if (assignedDepartment !== undefined) updateSet.assignedDepartment = assignedDepartment;
    if (resolutionSummary !== undefined) updateSet.resolutionSummary = resolutionSummary;
    if (status === "resolved") updateSet.resolvedAt = new Date();

    const newMessage = replyMessage
      ? {
          id: `msg_${Date.now()}`,
          senderRole: "agent" as const,
          senderName: req.admin?.name || "Admin Support",
          senderEmail: req.admin?.email || "admin",
          message: String(replyMessage).trim(),
          isInternalNote: Boolean(isInternalNote),
          createdAt: new Date(),
        }
      : null;

    let updatedTicket: any = null;
    if (isMongoConnected()) {
      try {
        const updateQuery: any = { $set: updateSet };
        if (newMessage) {
          updateQuery.$push = { messages: newMessage };
        }
        updatedTicket = await SupportTicket.findByIdAndUpdate(ticketId, updateQuery, { new: true }).lean();
      } catch {}
    }

    const memTickets: any[] = (memoryStore as any).supportTickets || [];
    const idx = memTickets.findIndex(
      (t) => String(t._id) === String(ticketId) || String(t.ticketNumber) === String(ticketId)
    );
    if (idx !== -1) {
      Object.assign(memTickets[idx], updateSet);
      if (newMessage) {
        memTickets[idx].messages = [...(memTickets[idx].messages || []), newMessage];
      }
      if (!updatedTicket) updatedTicket = memTickets[idx];
    }

    if (!updatedTicket) {
      return res.status(404).json({ success: false, error: "Support ticket not found." });
    }

    return res.json({ success: true, ticket: updatedTicket });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update support ticket" });
  }
});

// ==========================================
// 7. Admin Staff Role-Based Seller Permissions (/api/admin/sellers/admin-permissions)
// ==========================================
router.get("/admin-permissions", async (_req: AuthedRequest, res) => {
  try {
    let admins: any[] = [];
    if (isMongoConnected()) {
      try {
        admins = await Admin.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (admins.length === 0) {
      admins = ((memoryStore as any).admins || []).map((a: any) => {
        const { passwordHash, ...rest } = a;
        return rest;
      });
    }

    const normalized = admins.map((a) => ({
      _id: String(a._id || a.id),
      name: a.name || "Admin Staff",
      email: a.email,
      role: a.role || "staff",
      sellerManagementPermissions: {
        ...DEFAULT_ADMIN_SELLER_PERMISSIONS,
        ...(a.sellerManagementPermissions || {}),
      },
    }));

    return res.json({ success: true, admins: normalized });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to load admin permissions" });
  }
});

router.patch("/admin-permissions/:adminId", async (req: AuthedRequest, res) => {
  try {
    if (req.admin?.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        error: "Only a Super Admin can modify admin staff Seller Management permissions.",
      });
    }

    const { adminId } = req.params;
    const { sellerManagementPermissions } = req.body;
    if (!sellerManagementPermissions || typeof sellerManagementPermissions !== "object") {
      return res.status(400).json({ success: false, error: "sellerManagementPermissions object is required." });
    }

    const sanitizedPerms: AdminSellerManagementPermissions = {
      viewSellers: Boolean(sellerManagementPermissions.viewSellers),
      approveSellers: Boolean(sellerManagementPermissions.approveSellers),
      editSellerProfiles: Boolean(sellerManagementPermissions.editSellerProfiles),
      suspendSellers: Boolean(sellerManagementPermissions.suspendSellers),
      manageSellerProducts: Boolean(sellerManagementPermissions.manageSellerProducts),
      viewSellerOrders: Boolean(sellerManagementPermissions.viewSellerOrders),
      manageRefunds: Boolean(sellerManagementPermissions.manageRefunds),
      viewFinancialReports: Boolean(sellerManagementPermissions.viewFinancialReports),
      managePayouts: Boolean(sellerManagementPermissions.managePayouts),
      manageSellerSupport: Boolean(sellerManagementPermissions.manageSellerSupport),
    };

    let updatedAdmin: any = null;
    if (isMongoConnected()) {
      try {
        updatedAdmin = await Admin.findByIdAndUpdate(
          adminId,
          { $set: { sellerManagementPermissions: sanitizedPerms } },
          { new: true }
        )
          .select("-passwordHash")
          .lean();
      } catch {}
    }

    const memAdmins: any[] = (memoryStore as any).admins || [];
    const idx = memAdmins.findIndex((a) => String(a._id || a.id) === String(adminId));
    if (idx !== -1) {
      memAdmins[idx].sellerManagementPermissions = sanitizedPerms;
      if (!updatedAdmin) {
        const { passwordHash, ...rest } = memAdmins[idx];
        updatedAdmin = rest;
      }
    }

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, error: "Admin account not found." });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Super Admin",
      email: req.admin?.email || "admin",
      status: "success",
      req,
      details: `Super Admin updated Seller Management permissions for staff "${updatedAdmin.email}"`,
    });

    return res.json({ success: true, admin: updatedAdmin });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update admin permissions" });
  }
});

// ==========================================
// 8. GET /api/admin/sellers/:id/details — Complete Seller Dossier
// ==========================================
router.get("/:id/details", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const isSuper = req.admin?.role === "superadmin";

    let sellerDoc: any = null;
    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller.findById(id).select("-password").lean();
      } catch {}
    }
    if (!sellerDoc) {
      sellerDoc = (memoryStore.sellers || []).find((s) => String(s._id) === String(id));
    }
    if (!sellerDoc) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    const sellerIdStr = String(sellerDoc._id);
    const sellerEmail = (sellerDoc.email || sellerDoc.ownerEmail || "").toLowerCase().trim();

    // Fetch seller's products
    let sellerProducts: any[] = [];
    if (isMongoConnected()) {
      try {
        sellerProducts = await Product.find({ sellerId: sellerIdStr }).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (sellerProducts.length === 0) {
      sellerProducts = (memoryStore.products || []).filter((p) => String(p.sellerId) === sellerIdStr);
    }

    // Fetch seller's orders
    const allOrders = await getAllOrdersRaw();
    const productIds = new Set(sellerProducts.map((p) => String(p._id || p.id)));
    const sellerOrders = allOrders.filter((o) => {
      if (o.sellerId && String(o.sellerId) === sellerIdStr) return true;
      if (Array.isArray(o.items)) {
        return o.items.some(
          (it: any) =>
            (it.sellerId && String(it.sellerId) === sellerIdStr) ||
            (it.productId && productIds.has(String(it.productId)))
        );
      }
      return false;
    });

    // Fetch seller's withdrawals
    let sellerWithdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        sellerWithdrawals = await SellerWithdrawal.find({ sellerId: sellerIdStr }).sort({ createdAt: -1 }).lean();
      } catch {}
    }
    if (sellerWithdrawals.length === 0) {
      sellerWithdrawals = ((memoryStore as any).sellerWithdrawals || []).filter(
        (w: any) => String(w.sellerId) === sellerIdStr
      );
    }

    // Fetch seller's activity & audit logs
    let sellerLogs: any[] = [];
    if (isMongoConnected() && sellerEmail) {
      try {
        sellerLogs = await ActivityLog.find({
          $or: [
            { email: sellerEmail },
            { details: { $regex: new RegExp(sellerDoc.shopName || sellerEmail, "i") } },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(40)
          .lean();
      } catch {}
    }
    if (sellerLogs.length === 0) {
      sellerLogs = (memoryStore.activityLogs || [])
        .filter(
          (l: any) =>
            (sellerEmail && l.email?.toLowerCase() === sellerEmail) ||
            (sellerDoc.shopName && l.details?.toLowerCase().includes(String(sellerDoc.shopName).toLowerCase()))
        )
        .slice(0, 40);
    }

    return res.json({
      success: true,
      seller: maskSensitiveSeller(sellerDoc, isSuper),
      products: sellerProducts,
      orders: sellerOrders,
      withdrawals: sellerWithdrawals,
      activityLogs: sellerLogs,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to fetch seller details" });
  }
});

// ==========================================
// 9. PATCH /api/admin/sellers/:id/status — Approve, Reject, Suspend, Reactivate, Request Info
// ==========================================
router.patch("/:id/status", async (req: AuthedRequest, res) => {
  try {
    const { status, reason, infoRequestMessage } = req.body;
    const { id } = req.params;
    const allowed = ["pending", "approved", "review", "suspended", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status value. Must be pending, approved, review, suspended, or rejected.",
      });
    }

    // Check role-based permission
    if (status === "suspended") {
      const canSuspend = await checkAdminSellerPermission(req, "suspendSellers");
      if (!canSuspend) {
        return res.status(403).json({
          success: false,
          error: "Permission denied: You are not authorized to suspend seller accounts.",
        });
      }
    } else {
      const canApprove = await checkAdminSellerPermission(req, "approveSellers");
      if (!canApprove) {
        return res.status(403).json({
          success: false,
          error: "Permission denied: You are not authorized to approve or reject seller applications.",
        });
      }
    }

    // Find current status for audit trail
    let previousStatus = "pending";
    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      previousStatus = memoryStore.sellers[memIndex].status || "pending";
    } else if (isMongoConnected()) {
      try {
        const existing = await Seller.findById(id).select("status").lean();
        if (existing) previousStatus = existing.status;
      } catch {}
    }

    const cleanReason = reason !== undefined ? String(reason).trim() : undefined;
    const cleanInfoReq = infoRequestMessage !== undefined ? String(infoRequestMessage).trim() : undefined;

    const historyEntry = {
      id: `hist_${Date.now()}`,
      action:
        status === "approved"
          ? "Application / Account Approved"
          : status === "rejected"
            ? "Application Rejected"
            : status === "suspended"
              ? "Seller Account Suspended"
              : status === "review"
                ? cleanInfoReq
                  ? "Requested Additional Information"
                  : "Placed Under Review"
                : "Moved to Pending",
      previousStatus,
      newStatus: status,
      reason: cleanReason || cleanInfoReq || "",
      actedBy: req.admin?.name || "Administrator",
      actedByEmail: req.admin?.email || "admin",
      createdAt: new Date(),
    };

    const setUpdate: Record<string, any> = { status };
    if (status === "rejected" && cleanReason !== undefined) {
      setUpdate.rejectionReason = cleanReason;
    }
    if (status === "approved") {
      setUpdate.rejectionReason = "";
    }
    if (cleanInfoReq !== undefined) {
      setUpdate.infoRequestMessage = cleanInfoReq;
    }

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(
          id,
          {
            $set: setUpdate,
            $push: { applicationHistory: historyEntry },
          },
          { new: true }
        ).select("-password");
        if (seller) updatedSeller = seller;
      } catch (err) {
        console.warn("MongoDB update seller status failed, checking in-memory store:", err);
      }
    }

    if (memIndex !== -1) {
      const target = memoryStore.sellers[memIndex] as any;
      Object.assign(target, setUpdate);
      target.applicationHistory = [
        historyEntry,
        ...(Array.isArray(target.applicationHistory) ? target.applicationHistory : []),
      ];
      if (!updatedSeller) {
        const { passwordHash, ...safe } = target;
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) changed seller "${updatedSeller.shopName}" status from "${previousStatus.toUpperCase()}" to "${status.toUpperCase()}"${cleanReason ? ` (Reason: ${cleanReason})` : ""}`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
      status: updatedSeller.status,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller status" });
  }
});

// ==========================================
// 10. PUT /api/admin/sellers/:id/profile — Edit Permitted Seller Profile & Store Info
// ==========================================
router.put("/:id/profile", async (req: AuthedRequest, res) => {
  try {
    const canEdit = await checkAdminSellerPermission(req, "editSellerProfiles");
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: You are not authorized to edit seller profiles.",
      });
    }

    const { id } = req.params;
    const {
      shopName,
      ownerName,
      email,
      mobileNumber,
      category,
      businessAddress,
      shopAddress,
      panNumber,
      gstin,
      bankName,
      bankAccountHolderName,
      bankIFSC,
      storePolicy,
      prepTimeMin,
      deliveryRadiusKm,
      emailVerified,
    } = req.body;

    const updates: Record<string, any> = {};
    if (shopName !== undefined && String(shopName).trim()) {
      updates.shopName = String(shopName).trim();
      updates.storefront = String(shopName).trim();
    }
    if (ownerName !== undefined && String(ownerName).trim()) {
      updates.ownerName = String(ownerName).trim();
    }
    if (email !== undefined && String(email).trim()) {
      updates.email = String(email).trim().toLowerCase();
      updates.ownerEmail = String(email).trim().toLowerCase();
    }
    if (mobileNumber !== undefined) updates.mobileNumber = String(mobileNumber).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (businessAddress !== undefined) updates.businessAddress = String(businessAddress).trim();
    if (shopAddress !== undefined) updates.shopAddress = String(shopAddress).trim();
    if (panNumber !== undefined && !String(panNumber).includes("•")) {
      updates.panNumber = String(panNumber).trim().toUpperCase();
    }
    if (gstin !== undefined) updates.gstin = String(gstin).trim().toUpperCase();
    if (bankName !== undefined) updates.bankName = String(bankName).trim();
    if (bankAccountHolderName !== undefined) {
      updates.bankAccountHolderName = String(bankAccountHolderName).trim();
    }
    if (bankIFSC !== undefined) updates.bankIFSC = String(bankIFSC).trim().toUpperCase();
    if (storePolicy !== undefined) updates.storePolicy = String(storePolicy).trim();
    if (prepTimeMin !== undefined) updates.prepTimeMin = Number(prepTimeMin) || 7;
    if (deliveryRadiusKm !== undefined) updates.deliveryRadiusKm = Number(deliveryRadiusKm) || 5;
    if (emailVerified !== undefined) updates.emailVerified = Boolean(emailVerified);

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password");
      } catch (err) {
        console.warn("MongoDB update seller profile error:", err);
      }
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      Object.assign(memoryStore.sellers[memIndex], updates);
      if (!updatedSeller) {
        const { passwordHash, ...safe } = memoryStore.sellers[memIndex];
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) edited profile/store details for seller "${updatedSeller.shopName}"`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller profile" });
  }
});

// ==========================================
// 11. PATCH /api/admin/sellers/:id/store-status — Activate, Temporarily Disable, or Close Store
// ==========================================
router.patch("/:id/store-status", async (req: AuthedRequest, res) => {
  try {
    const canEdit = await checkAdminSellerPermission(req, "editSellerProfiles");
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: Cannot change seller store status.",
      });
    }

    const { id } = req.params;
    const { storeStatus, storePolicy, reason } = req.body;
    const allowedStoreStatus: SellerStoreStatus[] = ["active", "temporarily_disabled", "closed"];
    if (storeStatus && !allowedStoreStatus.includes(storeStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid storeStatus. Must be active, temporarily_disabled, or closed.",
      });
    }

    const updates: Record<string, any> = {};
    if (storeStatus) {
      updates.storeStatus = storeStatus;
      updates.isOpen = storeStatus === "active";
    }
    if (storePolicy !== undefined) {
      updates.storePolicy = String(storePolicy).trim();
    }

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findByIdAndUpdate(id, { $set: updates }, { new: true }).select("-password");
      } catch {}
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      Object.assign(memoryStore.sellers[memIndex], updates);
      if (!updatedSeller) {
        const { passwordHash, ...safe } = memoryStore.sellers[memIndex];
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) set store status for "${updatedSeller.shopName}" to "${(storeStatus || updatedSeller.storeStatus || "active").toUpperCase()}"${reason ? ` (${reason})` : ""}`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update store status" });
  }
});

// ==========================================
// 12. PATCH /api/admin/sellers/:id/verify-kyc — Verify / Revoke KYC
// ==========================================
router.patch("/:id/verify-kyc", async (req: AuthedRequest, res) => {
  try {
    const { kycVerified } = req.body;
    const { id } = req.params;
    const verified = Boolean(kycVerified);

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(id, { kycVerified: verified }, { new: true }).select("-password");
        if (seller) updatedSeller = seller;
      } catch (err) {
        console.warn("MongoDB update seller kycVerified failed, checking in-memory store:", err);
      }
    }

    const index = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (index !== -1) {
      memoryStore.sellers[index].kycVerified = verified;
      if (!updatedSeller) {
        const { passwordHash, ...safe } = memoryStore.sellers[index];
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) ${verified ? "verified" : "revoked"} KYC for seller "${updatedSeller.shopName}"`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
      kycVerified: updatedSeller.kycVerified,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to update seller KYC verification status",
    });
  }
});

// ==========================================
// 13. PATCH /api/admin/sellers/:id/permissions — Granular Seller Capabilities
// ==========================================
router.patch("/:id/permissions", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { canAddProducts, canEditProducts, canManageOrders, canWithdrawPayouts, canMakeNewSales } = req.body;

    let currentPermissions = {
      canAddProducts: true,
      canEditProducts: true,
      canManageOrders: true,
      canWithdrawPayouts: true,
      canMakeNewSales: true,
    };

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1 && (memoryStore.sellers[memIndex] as any).permissions) {
      currentPermissions = { ...currentPermissions, ...(memoryStore.sellers[memIndex] as any).permissions };
    } else if (isMongoConnected()) {
      try {
        const doc = await Seller.findById(id).select("permissions").lean();
        if (doc && doc.permissions) {
          currentPermissions = { ...currentPermissions, ...doc.permissions };
        }
      } catch {}
    }

    const nextPermissions = {
      canAddProducts: canAddProducts !== undefined ? Boolean(canAddProducts) : currentPermissions.canAddProducts,
      canEditProducts: canEditProducts !== undefined ? Boolean(canEditProducts) : currentPermissions.canEditProducts,
      canManageOrders: canManageOrders !== undefined ? Boolean(canManageOrders) : currentPermissions.canManageOrders,
      canWithdrawPayouts:
        canWithdrawPayouts !== undefined ? Boolean(canWithdrawPayouts) : currentPermissions.canWithdrawPayouts,
      canMakeNewSales: canMakeNewSales !== undefined ? Boolean(canMakeNewSales) : currentPermissions.canMakeNewSales,
    };

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        const seller = await Seller.findByIdAndUpdate(
          id,
          { $set: { permissions: nextPermissions } },
          { new: true }
        ).select("-password");
        if (seller) updatedSeller = seller;
      } catch (err) {
        console.warn("MongoDB update seller permissions failed:", err);
      }
    }

    if (memIndex !== -1) {
      (memoryStore.sellers[memIndex] as any).permissions = nextPermissions;
      if (!updatedSeller) {
        const { passwordHash, ...safe } = memoryStore.sellers[memIndex];
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) updated granular feature permissions for seller "${updatedSeller.shopName}"`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
      permissions: nextPermissions,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to update seller permissions" });
  }
});

// ==========================================
// 14. POST /api/admin/sellers/:id/notes — Private Internal Admin Notes
// ==========================================
router.post("/:id/notes", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const cleanNote = String(note || "").trim();
    if (!cleanNote) {
      return res.status(400).json({ success: false, error: "Admin note content is required." });
    }

    const noteEntry = {
      id: `note_${Date.now()}`,
      note: cleanNote,
      authorName: req.admin?.name || "Administrator",
      authorEmail: req.admin?.email || "admin",
      createdAt: new Date(),
    };

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findByIdAndUpdate(
          id,
          { $push: { adminNotes: noteEntry } },
          { new: true }
        ).select("-password");
      } catch {}
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      const target = memoryStore.sellers[memIndex] as any;
      target.adminNotes = [noteEntry, ...(Array.isArray(target.adminNotes) ? target.adminNotes : [])];
      if (!updatedSeller) {
        const { passwordHash, ...safe } = target;
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) added private internal note on seller "${updatedSeller.shopName}"`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
      note: noteEntry,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to add private admin note" });
  }
});

// ==========================================
// 15. POST /api/admin/sellers/:id/revoke-sessions — Revoke Active Seller Sessions
// ==========================================
router.post("/:id/revoke-sessions", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    let updatedSeller: any = null;

    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findByIdAndUpdate(
          id,
          { $inc: { tokenVersion: 1 } },
          { new: true }
        ).select("-password");
      } catch {}
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      const target = memoryStore.sellers[memIndex] as any;
      target.tokenVersion = (Number(target.tokenVersion) || 1) + 1;
      if (!updatedSeller) {
        const { passwordHash, ...safe } = target;
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    await logActivity({
      eventType: "Logout",
      userName: req.admin?.name || "Administrator",
      email: updatedSeller.email || req.admin?.email || "admin",
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) revoked all active sessions for seller "${updatedSeller.shopName}" (TokenVersion -> ${updatedSeller.tokenVersion || 2})`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      message: `All active sessions for "${updatedSeller.shopName}" have been revoked immediately.`,
      seller: maskSensitiveSeller(updatedSeller, isSuper),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to revoke seller sessions" });
  }
});

// ==========================================
// 16. POST /api/admin/sellers/:id/trigger-password-reset — Secure Password Reset Flow
// ==========================================
router.post("/:id/trigger-password-reset", async (req: AuthedRequest, res) => {
  try {
    const { id } = req.params;
    let sellerDoc: any = null;
    if (isMongoConnected()) {
      try {
        sellerDoc = await Seller.findById(id).select("-password").lean();
      } catch {}
    }
    if (!sellerDoc) {
      sellerDoc = (memoryStore.sellers || []).find((s) => String(s._id) === String(id));
    }
    if (!sellerDoc) {
      return res.status(404).json({ success: false, error: "Seller not found" });
    }

    const targetEmail = (sellerDoc.email || sellerDoc.ownerEmail || "").toLowerCase().trim();
    if (!targetEmail) {
      return res.status(400).json({ success: false, error: "Seller does not have a valid email address on file." });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 15 * 60 * 1000;

    sellerOtpStore.set(targetEmail, {
      otp,
      expiresAt,
      purpose: "reset_password",
    });

    if (isMongoConnected()) {
      try {
        await OtpVerification.findOneAndUpdate(
          { email: `seller_reset_${targetEmail}` },
          { email: `seller_reset_${targetEmail}`, otp, expiresAt: new Date(expiresAt) },
          { upsert: true }
        );
        await Seller.findByIdAndUpdate(id, { $set: { lastPasswordResetAt: new Date() } });
      } catch {}
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      (memoryStore.sellers[memIndex] as any).lastPasswordResetAt = new Date();
    }

    let emailSent = false;
    try {
      const mailRes = await sendOtpEmail(targetEmail, otp, sellerDoc.ownerName || sellerDoc.shopName);
      emailSent = Boolean(mailRes?.sent);
    } catch {}

    await logActivity({
      eventType: "Login",
      userName: req.admin?.name || "Administrator",
      email: targetEmail,
      status: "success",
      req,
      details: `Admin (${req.admin?.email || "staff"}) triggered secure password reset OTP for seller "${sellerDoc.shopName}"`,
    });

    return res.json({
      success: true,
      emailSent,
      message: `A secure 6-digit password reset code has been dispatched to ${targetEmail}. The seller can complete recovery at /seller/forgot-password.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || "Failed to trigger seller password reset" });
  }
});

// ==========================================
// 17. GET /api/admin/sellers/verification-requests — Admin-Reviewed Seller NID & Face Verification List
// Strictly protected: Only authorized administrators can access private NID & Face documents
// ==========================================
router.get("/verification-requests", async (req: AuthedRequest, res) => {
  try {
    const canApprove = await checkAdminSellerPermission(req, "approveSellers");
    if (!canApprove) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: Only authorized administrators with verification review permissions can access private NID and biometric documents.",
      });
    }

    const isSuper = req.admin?.role === "superadmin";
    const sellers = await getAllSellersRaw();

    const formatted = sellers.map((s) => maskSensitiveSeller(s, isSuper, true));

    return res.json({
      success: true,
      requests: formatted,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to load seller verification requests",
    });
  }
});

// ==========================================
// 18. POST /api/admin/sellers/:id/verification/review — Admin Manual Review Decision
// Actions: "start_review" | "approve" | "reject" | "request_resubmission" | "revoke" | "purge_documents"
// ==========================================
router.post("/:id/verification/review", async (req: AuthedRequest, res) => {
  try {
    const canApprove = await checkAdminSellerPermission(req, "approveSellers");
    if (!canApprove) {
      return res.status(403).json({
        success: false,
        error: "Permission denied: Only authorized administrators can make Seller NID & Face verification decisions.",
      });
    }

    const { id } = req.params;
    const { action, reason } = req.body;
    const validActions = [
      "start_review",
      "approve",
      "reject",
      "request_resubmission",
      "revoke",
      "purge_documents",
    ];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid verification action. Expected start_review, approve, reject, request_resubmission, revoke, or purge_documents.",
      });
    }

    const cleanReason = String(reason || "").trim();
    if ((action === "reject" || action === "request_resubmission" || action === "revoke") && !cleanReason) {
      return res.status(400).json({
        success: false,
        error: `Please provide a clear reason/instructions when choosing '${action.replace("_", " ")}'.`,
      });
    }

    // Fetch existing seller
    let existingSeller: any = null;
    if (isMongoConnected()) {
      try {
        existingSeller = await Seller.findById(id).lean();
      } catch {}
    }
    if (!existingSeller) {
      existingSeller = (memoryStore.sellers || []).find((s) => String(s._id) === String(id));
    }
    if (!existingSeller) {
      return res.status(404).json({ success: false, error: "Seller record not found." });
    }

    const now = new Date();
    const adminId = String(req.admin?.adminId || "admin_root");
    const adminName = req.admin?.name || "Platform Administrator";
    const adminEmail = req.admin?.email || "admin@alike.com";

    const currentIdentity: SellerIdentityVerification = existingSeller.identityVerification || {
      status: existingSeller.verificationStatus || "not_submitted",
      verifiedBadge: Boolean(existingSeller.verifiedBadge),
      nidNumber: "",
      nidFullName: "",
      nidDateOfBirth: "",
      nidAddress: "",
      nidFrontImage: "",
      nidBackImage: "",
      facePhotoImage: "",
      consentGiven: false,
      history: [],
    };

    let nextStatus: SellerVerificationStatus = currentIdentity.status || "not_submitted";
    let nextVerifiedBadge = false;
    let nextKycVerified = Boolean(existingSeller.kycVerified);
    let actionLabel = "";
    let notifTitle = "";
    let notifMessage = "";

    if (action === "start_review") {
      nextStatus = "under_review";
      nextVerifiedBadge = false;
      actionLabel = "Admin Opened Verification for Manual Review";
      notifTitle = "NID & Face Verification Under Admin Review";
      notifMessage = `An administrator (${adminName}) is now reviewing your submitted NID documents and face selfie.`;
    } else if (action === "approve") {
      nextStatus = "approved";
      nextVerifiedBadge = true;
      nextKycVerified = true;
      actionLabel = "Admin Approved NID & Face Verification — Verified Badge Granted";
      notifTitle = "Verification Approved — Verified Seller Badge Awarded!";
      notifMessage = `Congratulations! Your NID & Face Verification has been manually reviewed and approved by ${adminName}. The official Verified Seller badge is now active on your store and product pages.${cleanReason ? ` Admin note: ${cleanReason}` : ""}`;
    } else if (action === "reject") {
      nextStatus = "rejected";
      nextVerifiedBadge = false;
      nextKycVerified = false;
      actionLabel = "Admin Rejected NID & Face Verification";
      notifTitle = "NID & Face Verification Request Rejected";
      notifMessage = `Your verification request was not approved after manual review. Reason: ${cleanReason}`;
    } else if (action === "request_resubmission") {
      nextStatus = "resubmission_required";
      nextVerifiedBadge = false;
      nextKycVerified = false;
      actionLabel = "Admin Requested Document Resubmission";
      notifTitle = "Action Required: Resubmit NID / Face Verification Documents";
      notifMessage = `An administrator reviewed your verification request and requested clearer or corrected documents. Instructions: ${cleanReason}`;
    } else if (action === "revoke") {
      nextStatus = "rejected";
      nextVerifiedBadge = false;
      nextKycVerified = false;
      actionLabel = "Admin Revoked Seller Verification & Verified Badge";
      notifTitle = "Verified Seller Status Revoked by Administration";
      notifMessage = `Your Verified Seller badge and identity verification status have been revoked by an administrator. Reason: ${cleanReason}`;
    } else if (action === "purge_documents") {
      nextStatus = currentIdentity.status === "approved" ? "approved" : "not_submitted";
      nextVerifiedBadge = currentIdentity.status === "approved" && Boolean(existingSeller.verifiedBadge);
      actionLabel = "Admin Purged Stored Biometric & NID Images (Retention Policy)";
      notifTitle = "Biometric & NID Document Files Purged per Retention Policy";
      notifMessage =
        "Your raw NID and selfie image files were purged from storage in accordance with the platform privacy and data retention policy.";
    }

    const historyEntry = {
      status: nextStatus,
      action: actionLabel,
      note: cleanReason || `Decision recorded by ${adminName} (${adminEmail})`,
      actedBy: `${adminName} (${adminEmail})`,
      actedByAdminId: adminId,
      createdAt: now,
    };

    const existingHistory = Array.isArray(currentIdentity.history) ? currentIdentity.history : [];

    const nextIdentityVerification: SellerIdentityVerification = {
      ...currentIdentity,
      status: nextStatus,
      verifiedBadge: nextVerifiedBadge,
      nidFrontImage: action === "purge_documents" ? "" : currentIdentity.nidFrontImage || "",
      nidBackImage: action === "purge_documents" ? "" : currentIdentity.nidBackImage || "",
      facePhotoImage: action === "purge_documents" ? "" : currentIdentity.facePhotoImage || "",
      reviewedAt: now,
      reviewedByAdminId: adminId,
      reviewedByAdminName: adminName,
      reviewedByAdminEmail: adminEmail,
      decisionReason: cleanReason,
      history: [historyEntry, ...existingHistory],
    };

    const notificationEntry: SellerNotificationEntry = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "verification",
      title: notifTitle,
      message: notifMessage,
      status: nextStatus,
      read: false,
      createdAt: now,
    };

    const existingNotifications = Array.isArray(existingSeller.notifications)
      ? existingSeller.notifications
      : [];
    const nextNotifications = [notificationEntry, ...existingNotifications].slice(0, 50);

    // Also record in applicationHistory for unified Seller Management audit trail
    const appHistoryEntry = {
      status: existingSeller.status || "approved",
      action: actionLabel,
      note: cleanReason || `Verification status set to ${nextStatus}`,
      actedBy: `${adminName} (${adminEmail})`,
      createdAt: now,
    };
    const existingAppHistory = Array.isArray(existingSeller.applicationHistory)
      ? existingSeller.applicationHistory
      : [];

    const updateSet: Record<string, any> = {
      verificationStatus: nextStatus,
      verifiedBadge: nextVerifiedBadge,
      kycVerified: nextKycVerified,
      identityVerification: nextIdentityVerification,
      notifications: nextNotifications,
      applicationHistory: [appHistoryEntry, ...existingAppHistory],
    };

    let updatedSeller: any = null;
    if (isMongoConnected()) {
      try {
        updatedSeller = await Seller.findByIdAndUpdate(
          id,
          { $set: updateSet },
          { new: true }
        ).select("-password");
      } catch (err) {
        console.warn("MongoDB seller verification review update notice:", err);
      }
    }

    const memIndex = (memoryStore.sellers || []).findIndex((s) => String(s._id) === String(id));
    if (memIndex !== -1) {
      Object.assign(memoryStore.sellers[memIndex], updateSet);
      if (!updatedSeller) {
        const { passwordHash, ...safe } = memoryStore.sellers[memIndex];
        updatedSeller = safe;
      }
    }

    if (!updatedSeller) {
      updatedSeller = { ...existingSeller, ...updateSet };
    }

    await logActivity({
      eventType: "Login",
      userName: adminName,
      email: existingSeller.email || adminEmail,
      status: "success",
      req,
      details: `Admin (${adminEmail}) performed "${action.toUpperCase()}" on NID & Face Verification for seller "${existingSeller.shopName}" (Status -> ${nextStatus}, VerifiedBadge -> ${nextVerifiedBadge})${cleanReason ? ` — Reason: ${cleanReason}` : ""}`,
    });

    const isSuper = req.admin?.role === "superadmin";
    return res.json({
      success: true,
      message: `${actionLabel} for "${existingSeller.shopName}".`,
      seller: maskSensitiveSeller(updatedSeller, isSuper, true),
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to process seller verification review decision",
    });
  }
});

export default router;
