import { Router } from "express";
import Order from "../models/Order";
<<<<<<< HEAD
import Product from "../models/Product";
import Seller from "../models/Seller";
import PlatformSetting from "../models/PlatformSetting";
import PlatformWithdrawal from "../models/PlatformWithdrawal";
import { CommissionRule } from "../models/CommissionManagement";
import { requireAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";
import {
  ensureCommissionRulesSeeded,
  getCommissionConfig,
  updateCommissionConfig,
  recordCommissionAudit,
  getCommissionAuditLogs,
  resolveApplicableCommissionRule,
  reconcileOrderCommissionOnStatusChange,
  CommissionRuleRecord,
} from "../services/commissionEngine";
=======
import PlatformSetting from "../models/PlatformSetting";
import PlatformWithdrawal from "../models/PlatformWithdrawal";
import { requireAdmin, requireSuperAdmin, AuthedRequest } from "../middleware/auth";
import { isMongoConnected, memoryStore } from "../store";
import { logActivity } from "../utils/activityLogger";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

const router = Router();

// Helper to get active commission rate
export async function getActiveCommissionRate(): Promise<number> {
<<<<<<< HEAD
  const cfg = await getCommissionConfig();
  return cfg.globalDefaultRate ?? 5;
}

// Helper to build comprehensive order & item commission analytics
async function buildCommissionAnalytics(queryFilters?: {
  period?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  sellerId?: string;
  status?: string;
}) {
  const [rules, config] = await Promise.all([
    ensureCommissionRulesSeeded(),
    getCommissionConfig(),
  ]);

  let ordersList: any[] = [];
  let productsList: any[] = [];
  let sellersList: any[] = [];

  if (isMongoConnected()) {
    try {
      [ordersList, productsList, sellersList] = await Promise.all([
        Order.find().sort({ createdAt: -1 }).lean(),
        Product.find().select("_id id name category subCategory price sellerId sellerShopName").lean(),
        Seller.find().select("_id shopName storefront email commissionRate").lean(),
      ]);
    } catch (err) {
      ordersList = memoryStore.orders || [];
      productsList = memoryStore.products || [];
      sellersList = memoryStore.sellers || [];
    }
  } else {
    ordersList = memoryStore.orders || [];
    productsList = memoryStore.products || [];
    sellersList = memoryStore.sellers || [];
  }

  const productMap = new Map<string, any>();
  for (const p of productsList) {
    if (p._id) productMap.set(String(p._id), p);
    if (p.id !== undefined && p.id !== null) productMap.set(String(p.id), p);
  }
  for (const p of memoryStore.products || []) {
    if (p._id && !productMap.has(String(p._id))) productMap.set(String(p._id), p);
    if (p.id !== undefined && p.id !== null && !productMap.has(String(p.id))) {
      productMap.set(String(p.id), p);
    }
  }

  const sellerMap = new Map<string, any>();
  for (const s of sellersList) {
    if (s._id) sellerMap.set(String(s._id), s);
  }
  for (const s of memoryStore.sellers || []) {
    if (s._id && !sellerMap.has(String(s._id))) sellerMap.set(String(s._id), s);
  }

  // Date filter window
  const now = new Date();
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  const period = queryFilters?.period || "all";

  if (period === "daily") {
    minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  } else if (period === "weekly") {
    minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === "monthly") {
    minDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  } else if (period === "custom") {
    if (queryFilters?.startDate) {
      const d = new Date(queryFilters.startDate);
      if (!isNaN(d.getTime())) minDate = d;
    }
    if (queryFilters?.endDate) {
      const d = new Date(queryFilters.endDate);
      d.setHours(23, 59, 59, 999);
      if (!isNaN(d.getTime())) maxDate = d;
    }
  }

  let totalCommissionEarned = 0;
  let totalSellerEarnings = 0;
  let settledCommissionTotal = 0;
  let pendingCommissionTotal = 0;
  let refundedOrReversedCommissionTotal = 0;

  const categoryAgg: Record<
    string,
    {
      categoryId: string;
      categoryName: string;
      ordersCount: number;
      itemsSold: number;
      grossSales: number;
      eligibleSales: number;
      commissionAmount: number;
      sellerEarnings: number;
      avgCommissionRate: number;
    }
  > = {};

  const sellerAgg: Record<
    string,
    {
      sellerId: string;
      sellerShopName: string;
      ordersCount: number;
      itemsSold: number;
      grossSales: number;
      commissionAmount: number;
      sellerEarnings: number;
      refundedCommission: number;
    }
  > = {};

  const productAgg: Record<
    string,
    {
      productId: string;
      productName: string;
      category: string;
      subCategory: string;
      sellerShopName: string;
      unitsSold: number;
      sellingPrice: number;
      appliedRate: number;
      grossSales: number;
      commissionAmount: number;
      sellerEarnings: number;
    }
  > = {};

  const ledger: any[] = [];

  for (const ord of ordersList) {
    const ordDate = ord.createdAt ? new Date(ord.createdAt) : new Date();
    if (minDate && ordDate < minDate) continue;
    if (maxDate && ordDate > maxDate) continue;

    const orderStatus = String(ord.status || "processing").toLowerCase();
    const isCancelledOrRejected = orderStatus === "cancelled" || orderStatus === "rejected";

    // Determine effective commission status
    let effectiveCommStatus:
      | "settled"
      | "credited"
      | "pending"
      | "reversed"
      | "refunded"
      | "partially_refunded" = ord.commissionStatus || "credited";

    if (isCancelledOrRejected) {
      effectiveCommStatus = "reversed";
    } else if (orderStatus === "delivered" && effectiveCommStatus === "pending") {
      effectiveCommStatus = "settled";
    }

    if (
      queryFilters?.status &&
      queryFilters.status !== "all" &&
      effectiveCommStatus !== queryFilters.status
    ) {
      continue;
    }

    const orderTotal = Number(ord.total) || 0;
    const orderDiscount = Number(ord.discount) || 0;
    const orderTax = Number(ord.tax) || 0;
    const orderDelivery = Number(ord.delivery) || 0;
    const orderSubtotal =
      Number(ord.subtotal) || Math.max(0, orderTotal - orderTax - orderDelivery + orderDiscount);

    // Use preserved snapshot if available, otherwise compute from items using order's historical rate or category rule
    const rawItems = Array.isArray(ord.items) ? ord.items : [];
    const savedBreakdown = Array.isArray(ord.commissionBreakdown) && ord.commissionBreakdown.length > 0
      ? ord.commissionBreakdown
      : null;

    const itemBreakdowns: any[] = [];
    let orderEligibleSum = 0;
    let orderCommSum = 0;
    let orderSellerNetSum = 0;

    if (savedBreakdown) {
      for (const b of savedBreakdown) {
        orderEligibleSum += Number(b.eligibleAmount) || 0;
        orderCommSum += Number(b.commissionAmount) || 0;
        orderSellerNetSum += Number(b.sellerNetAmount) || 0;
        itemBreakdowns.push(b);
      }
    } else if (rawItems.length > 0) {
      const safeSub = Math.max(
        1,
        rawItems.reduce((s: number, it: any) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
      );
      for (const it of rawItems) {
        const prod = productMap.get(String(it.productId));
        const sellerId = String(it.sellerId || prod?.sellerId || "s1");
        const seller = sellerMap.get(sellerId);
        const category = String(it.category || prod?.category || "luxury");
        const subCategory = String(it.subCategory || prod?.subCategory || "");
        const sellingPrice = Number(it.price) || Number(prod?.price) || 0;
        const qty = Math.max(1, Number(it.qty) || 1);
        const grossItemAmount = sellingPrice * qty;
        const share = grossItemAmount / safeSub;
        const discountShare = Math.round(orderDiscount * share);
        const eligibleAmount = Math.max(0, grossItemAmount - discountShare);

        // Preserve historical order commissionRate if explicitly stored, otherwise resolve category rule
        const matchedRule = resolveApplicableCommissionRule({
          productId: it.productId,
          sellerId,
          category,
          subCategory,
          rules,
          config,
        });
        const appliedRate =
          typeof ord.commissionRate === "number" && ord.commissionRate > 0
            ? ord.commissionRate
            : matchedRule.rate;

        const commAmt = Math.round((eligibleAmount * appliedRate) / 100);
        const sellerNet = Math.max(0, eligibleAmount - commAmt);

        orderEligibleSum += eligibleAmount;
        orderCommSum += commAmt;
        orderSellerNetSum += sellerNet;

        itemBreakdowns.push({
          productId: it.productId,
          productName: it.name || prod?.name || "Catalog Item",
          category,
          subCategory,
          sellerId,
          sellerShopName:
            seller?.shopName ||
            seller?.storefront ||
            prod?.sellerShopName ||
            "Marketplace Seller",
          qty,
          sellingPrice,
          grossItemAmount,
          discountShare,
          eligibleAmount,
          commissionRate: appliedRate,
          appliedRuleType: matchedRule.ruleType,
          appliedRuleId: matchedRule.ruleId,
          appliedRuleLabel: matchedRule.ruleLabel,
          commissionAmount: commAmt,
          sellerNetAmount: sellerNet,
        });
      }
    } else {
      // Order without itemized array
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : config.globalDefaultRate;
      const eligible = orderSubtotal > 0 ? orderSubtotal : orderTotal;
      const commAmt =
        typeof ord.commissionAmount === "number" && ord.commissionAmount > 0
          ? ord.commissionAmount
          : Math.round((eligible * rate) / 100);
      const sellerNet = Math.max(0, eligible - commAmt);
      orderEligibleSum = eligible;
      orderCommSum = commAmt;
      orderSellerNetSum = sellerNet;
      itemBreakdowns.push({
        productId: "ord_summary",
        productName: `Order ${ord.orderNumber} Package`,
        category: "luxury",
        subCategory: "",
        sellerId: "s1",
        sellerShopName: "Verified Partner Store",
        qty: 1,
        sellingPrice: eligible,
        grossItemAmount: eligible,
        discountShare: orderDiscount,
        eligibleAmount: eligible,
        commissionRate: rate,
        appliedRuleType: "category",
        appliedRuleId: "cat_luxury",
        appliedRuleLabel: "Order Snapshot Rate",
        commissionAmount: commAmt,
        sellerNetAmount: sellerNet,
      });
    }

    const refundedComm = Number(ord.refundedCommissionAmount) || (isCancelledOrRejected ? orderCommSum : 0);
    const netActiveCommission = isCancelledOrRejected
      ? 0
      : Math.max(0, orderCommSum - refundedComm);
    const netActiveSellerPayout = isCancelledOrRejected ? 0 : orderSellerNetSum;

    if (!isCancelledOrRejected) {
      totalCommissionEarned += netActiveCommission;
      totalSellerEarnings += netActiveSellerPayout;

      if (effectiveCommStatus === "settled" || effectiveCommStatus === "credited" || orderStatus === "delivered") {
        settledCommissionTotal += netActiveCommission;
      } else if (effectiveCommStatus === "pending") {
        pendingCommissionTotal += netActiveCommission;
      }
    }
    if (
      isCancelledOrRejected ||
      effectiveCommStatus === "reversed" ||
      effectiveCommStatus === "refunded" ||
      effectiveCommStatus === "partially_refunded"
    ) {
      refundedOrReversedCommissionTotal += refundedComm || orderCommSum;
    }

    // Aggregate per-item metrics for Category, Seller, and Product reports (excluding cancelled/rejected orders from active sales)
    if (!isCancelledOrRejected) {
      for (const item of itemBreakdowns) {
        const catKey = String(item.category || "general").toLowerCase();
        if (!categoryAgg[catKey]) {
          const matchedCatRule = rules.find(
            (r) => r.ruleType === "category" && r.categoryId.toLowerCase() === catKey
          );
          categoryAgg[catKey] = {
            categoryId: catKey,
            categoryName: matchedCatRule?.categoryName || item.category || "General",
            ordersCount: 0,
            itemsSold: 0,
            grossSales: 0,
            eligibleSales: 0,
            commissionAmount: 0,
            sellerEarnings: 0,
            avgCommissionRate: matchedCatRule?.commissionRate || item.commissionRate || config.globalDefaultRate,
          };
        }
        categoryAgg[catKey].ordersCount += 1;
        categoryAgg[catKey].itemsSold += Number(item.qty) || 1;
        categoryAgg[catKey].grossSales += Number(item.grossItemAmount) || 0;
        categoryAgg[catKey].eligibleSales += Number(item.eligibleAmount) || 0;
        categoryAgg[catKey].commissionAmount += Number(item.commissionAmount) || 0;
        categoryAgg[catKey].sellerEarnings += Number(item.sellerNetAmount) || 0;

        const sKey = String(item.sellerId || "platform");
        if (!sellerAgg[sKey]) {
          sellerAgg[sKey] = {
            sellerId: sKey,
            sellerShopName: item.sellerShopName || "Marketplace Store",
            ordersCount: 0,
            itemsSold: 0,
            grossSales: 0,
            commissionAmount: 0,
            sellerEarnings: 0,
            refundedCommission: 0,
          };
        }
        sellerAgg[sKey].ordersCount += 1;
        sellerAgg[sKey].itemsSold += Number(item.qty) || 1;
        sellerAgg[sKey].grossSales += Number(item.grossItemAmount) || 0;
        sellerAgg[sKey].commissionAmount += Number(item.commissionAmount) || 0;
        sellerAgg[sKey].sellerEarnings += Number(item.sellerNetAmount) || 0;

        const pKey = String(item.productId || item.productName);
        if (!productAgg[pKey]) {
          productAgg[pKey] = {
            productId: pKey,
            productName: item.productName || "Product",
            category: item.category || "General",
            subCategory: item.subCategory || "",
            sellerShopName: item.sellerShopName || "Marketplace Store",
            unitsSold: 0,
            sellingPrice: Number(item.sellingPrice) || 0,
            appliedRate: Number(item.commissionRate) || config.globalDefaultRate,
            grossSales: 0,
            commissionAmount: 0,
            sellerEarnings: 0,
          };
        }
        productAgg[pKey].unitsSold += Number(item.qty) || 1;
        productAgg[pKey].grossSales += Number(item.grossItemAmount) || 0;
        productAgg[pKey].commissionAmount += Number(item.commissionAmount) || 0;
        productAgg[pKey].sellerEarnings += Number(item.sellerNetAmount) || 0;
      }
    }

    const avgOrderRate =
      typeof ord.commissionRate === "number"
        ? ord.commissionRate
        : orderEligibleSum > 0
        ? Math.round((orderCommSum / orderEligibleSum) * 10000) / 100
        : config.globalDefaultRate;

    ledger.push({
      _id: String(ord._id || ord.orderNumber),
      orderNumber: ord.orderNumber || "AN-UNKNOWN",
      date: ordDate.toISOString(),
      memberName: ord.memberName || "Valued Client",
      memberEmail: ord.memberEmail || "",
      subtotal: orderSubtotal,
      discount: orderDiscount,
      tax: orderTax,
      delivery: orderDelivery,
      eligibleAmount: orderEligibleSum,
      total: orderTotal,
      commissionRate: avgOrderRate,
      commissionAmount: netActiveCommission,
      originalCommissionAmount: orderCommSum,
      refundedCommissionAmount: refundedComm,
      sellerPayout: netActiveSellerPayout,
      paymentMethod: ord.paymentMethod || "CARD",
      status: ord.status || "processing",
      commissionStatus: effectiveCommStatus,
      items: itemBreakdowns,
    });
  }

  return {
    rules,
    config,
    totalCommissionEarned,
    totalSellerEarnings,
    settledCommissionTotal,
    pendingCommissionTotal,
    refundedOrReversedCommissionTotal,
    categoryBreakdown: Object.values(categoryAgg).sort(
      (a, b) => b.commissionAmount - a.commissionAmount
    ),
    sellerBreakdown: Object.values(sellerAgg).sort(
      (a, b) => b.commissionAmount - a.commissionAmount
    ),
    productBreakdown: Object.values(productAgg).sort(
      (a, b) => b.commissionAmount - a.commissionAmount
    ),
    ledger,
  };
}

// ============================================================================
// 1. GET /api/admin/commission - Full Commission Management Dashboard Payload
// ============================================================================
router.get("/", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const analytics = await buildCommissionAnalytics({
      period: String(req.query.period || "all"),
      startDate: req.query.startDate ? String(req.query.startDate) : undefined,
      endDate: req.query.endDate ? String(req.query.endDate) : undefined,
      status: req.query.status ? String(req.query.status) : undefined,
    });

    const auditLogs = await getCommissionAuditLogs(150);

    // Fetch platform withdrawals
=======
  if (isMongoConnected()) {
    try {
      const setting = await PlatformSetting.findOne({ key: "commission_settings" });
      if (setting && typeof setting.commissionRate === "number") {
        return setting.commissionRate;
      }
    } catch (err) {
      console.warn("MongoDB commission rate query notice:", err);
    }
  }
  return memoryStore.platformSettings?.commissionRate ?? 5;
}

// GET /api/admin/commission - Fetch platform earnings, commission wallet balance, orders ledger & withdrawal history
router.get("/", requireAdmin, requireSuperAdmin, async (_req: AuthedRequest, res) => {
  try {
    const activeRate = await getActiveCommissionRate();
    let ordersList: any[] = [];

    if (isMongoConnected()) {
      try {
        ordersList = await Order.find().sort({ createdAt: -1 }).lean();
      } catch (err) {
        console.warn("MongoDB order query error in commission route, using memoryStore:", err);
        ordersList = memoryStore.orders || [];
      }
    } else {
      ordersList = memoryStore.orders || [];
    }

    // Process all orders to compute real commission values
    let calculatedTotalCommission = 0;
    const ledger = ordersList.map((ord) => {
      const orderTotal = Number(ord.total) || 0;
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : activeRate;
      const commissionAmount =
        typeof ord.commissionAmount === "number" && ord.commissionAmount > 0
          ? ord.commissionAmount
          : Math.round((orderTotal * rate) / 100);
      const sellerPayout =
        typeof ord.sellerPayout === "number" && ord.sellerPayout > 0
          ? ord.sellerPayout
          : Math.max(0, orderTotal - commissionAmount);

      calculatedTotalCommission += commissionAmount;

      return {
        _id: String(ord._id || ord.orderNumber),
        orderNumber: ord.orderNumber || "AN-UNKNOWN",
        date: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
        memberName: ord.memberName || "Valued Client",
        memberEmail: ord.memberEmail || "",
        total: orderTotal,
        commissionRate: rate,
        commissionAmount,
        sellerPayout,
        paymentMethod: ord.paymentMethod || "CARD",
        status: ord.status || "pending",
        commissionStatus: ord.commissionStatus || "credited",
      };
    });

    // Fetch withdrawals from MongoDB or memoryStore
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    let withdrawalsList: any[] = [];
    if (isMongoConnected()) {
      try {
        withdrawalsList = await PlatformWithdrawal.find().sort({ date: -1 }).lean();
      } catch (err) {
<<<<<<< HEAD
=======
        console.warn("MongoDB withdrawal query error, using memoryStore:", err);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
        withdrawalsList = memoryStore.platformWithdrawals || [];
      }
    } else {
      withdrawalsList = memoryStore.platformWithdrawals || [];
    }

<<<<<<< HEAD
=======
    // Merge memory withdrawals if any weren't in Mongo
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    const mongoIds = new Set(withdrawalsList.map((w) => String(w._id)));
    for (const memW of memoryStore.platformWithdrawals || []) {
      if (!mongoIds.has(String(memW._id))) {
        withdrawalsList.push(memW);
      }
    }
<<<<<<< HEAD
    withdrawalsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalWithdrawn = withdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
    const runningBalance = Math.max(0, analytics.totalCommissionEarned - totalWithdrawn);
=======

    // Sort withdrawals newest first
    withdrawalsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalWithdrawn = withdrawalsList.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

    // Running balance is the total commission earned in the platform wallet minus internal withdrawals
    const runningBalance = Math.max(0, calculatedTotalCommission - totalWithdrawn);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

    const formattedWithdrawals = withdrawalsList.map((w) => ({
      _id: String(w._id),
      amount: Number(w.amount) || 0,
      note: w.note || "",
      adminEmail: w.adminEmail || "superadmin@alikend.com",
      adminName: w.adminName || "Super Admin",
      date: w.date ? new Date(w.date).toISOString() : new Date().toISOString(),
      status: w.status || "Completed",
    }));

    return res.json({
      success: true,
<<<<<<< HEAD
      commissionRate: analytics.config.globalDefaultRate,
      config: analytics.config,
      rules: analytics.rules,
      auditLogs,
      totalCommissionEarned: analytics.totalCommissionEarned,
      totalSellerEarnings: analytics.totalSellerEarnings,
      settledCommissionTotal: analytics.settledCommissionTotal,
      pendingCommissionTotal: analytics.pendingCommissionTotal,
      refundedOrReversedCommissionTotal: analytics.refundedOrReversedCommissionTotal,
      runningBalance,
      totalWithdrawn,
      totalOrdersCount: analytics.ledger.length,
      categoryBreakdown: analytics.categoryBreakdown,
      sellerBreakdown: analytics.sellerBreakdown,
      productBreakdown: analytics.productBreakdown,
      orders: analytics.ledger,
=======
      commissionRate: activeRate,
      totalCommissionEarned: calculatedTotalCommission,
      runningBalance,
      totalWithdrawn,
      totalOrdersCount: ledger.length,
      orders: ledger,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      withdrawals: formattedWithdrawals,
    });
  } catch (err: any) {
    console.error("Commission fetch error:", err);
<<<<<<< HEAD
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to load commission data" });
  }
});

// ============================================================================
// 2. GET /api/admin/commission/rules - Fetch all hierarchical commission rules
// ============================================================================
router.get("/rules", requireAdmin, async (_req: AuthedRequest, res) => {
  try {
    const [rules, config] = await Promise.all([
      ensureCommissionRulesSeeded(),
      getCommissionConfig(),
    ]);
    return res.json({ success: true, rules, config });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to load commission rules" });
  }
});

// ============================================================================
// 3. POST /api/admin/commission/rules - Add new category/subcategory/override rule
// ============================================================================
router.post("/rules", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const {
      ruleType = "category",
      categoryId,
      categoryName,
      categoryNameBn = "",
      parentCategoryId = null,
      parentCategoryName = null,
      targetId = null,
      targetName = null,
      commissionRate,
      minCommissionAmount = 0,
      maxCommissionAmount = 0,
      effectiveStartDate = "",
      effectiveEndDate = "",
      isActive = true,
      notes = "",
      reason = "Created new commission rule",
    } = req.body;

    const rateNum = Number(commissionRate);
    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return res.status(400).json({
        success: false,
        error: "Commission percentage must be between 0% and 100%.",
      });
    }

    if (!categoryName || !String(categoryName).trim()) {
      return res.status(400).json({
        success: false,
        error: "Category / Subcategory / Rule name is required.",
      });
    }

    const rules = await ensureCommissionRulesSeeded();
    const cleanSlug =
      String(categoryId || categoryName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "") || `rule_${Date.now()}`;

    const level: 1 | 2 | 3 =
      ruleType === "category" ? 1 : ruleType === "subcategory" ? 2 : 3;

    const ruleId =
      ruleType === "category"
        ? `cat_${cleanSlug}`
        : ruleType === "subcategory"
        ? `sub_${parentCategoryId || "root"}_${cleanSlug}`
        : `ovr_${ruleType}_${targetId || cleanSlug}_${Date.now()}`;

    if (rules.some((r) => r.ruleId === ruleId)) {
      return res.status(400).json({
        success: false,
        error: `A commission rule for "${categoryName}" already exists. Use Edit to update its rate.`,
      });
    }

    const roundedRate = Math.round(rateNum * 100) / 100;
    const adminName = req.admin?.name || "Admin";
    const adminEmail = req.admin?.email || "admin@alikend.com";
    const nowIso = new Date().toISOString();

    const newRule: CommissionRuleRecord = {
      ruleId,
      ruleType,
      level,
      categoryId: cleanSlug,
      categoryName: String(categoryName).trim(),
      categoryNameBn: String(categoryNameBn || "").trim(),
      parentCategoryId: parentCategoryId ? String(parentCategoryId) : null,
      parentCategoryName: parentCategoryName ? String(parentCategoryName) : null,
      targetId: targetId ? String(targetId) : null,
      targetName: targetName ? String(targetName) : null,
      commissionRate: roundedRate,
      minCommissionAmount: Math.max(0, Number(minCommissionAmount) || 0),
      maxCommissionAmount: Math.max(0, Number(maxCommissionAmount) || 0),
      effectiveStartDate: String(effectiveStartDate || ""),
      effectiveEndDate: String(effectiveEndDate || ""),
      isActive: Boolean(isActive),
      updatedBy: adminName,
      notes: String(notes || ""),
      updatedAt: nowIso,
      createdAt: nowIso,
    };

    rules.push(newRule);

    if (isMongoConnected()) {
      try {
        await CommissionRule.create(newRule);
      } catch (err: any) {
        console.warn("CommissionRule MongoDB create notice:", err.message);
      }
    }

    await recordCommissionAudit({
      actionType: "rule_created",
      targetType:
        ruleType === "category"
          ? "category"
          : ruleType === "subcategory"
          ? "subcategory"
          : ruleType === "product_override"
          ? "product"
          : "seller",
      targetId: ruleId,
      targetName: newRule.targetName || newRule.categoryName,
      previousRate: null,
      newRate: roundedRate,
      reason: String(reason || "Created new commission rule"),
      adminName,
      adminEmail,
    });

    return res.status(201).json({
      success: true,
      message: `Commission rule "${newRule.categoryName}" (${roundedRate}%) created successfully.`,
      rule: newRule,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to create commission rule" });
  }
});

// ============================================================================
// 4. PUT /api/admin/commission/rules/:ruleId - Update commission rule & log audit
// ============================================================================
router.put("/rules/:ruleId", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { ruleId } = req.params;
    const {
      categoryName,
      categoryNameBn,
      commissionRate,
      minCommissionAmount,
      maxCommissionAmount,
      effectiveStartDate,
      effectiveEndDate,
      isActive,
      notes,
      reason = "Updated commission percentage",
    } = req.body;

    const rules = await ensureCommissionRulesSeeded();
    const idx = rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Commission rule not found." });
    }

    const existing = rules[idx];
    const previousRate = existing.commissionRate;

    let nextRate = existing.commissionRate;
    if (commissionRate !== undefined) {
      const rateNum = Number(commissionRate);
      if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
        return res.status(400).json({
          success: false,
          error: "Commission percentage must be between 0% and 100%.",
        });
      }
      nextRate = Math.round(rateNum * 100) / 100;
    }

    const adminName = req.admin?.name || "Admin";
    const adminEmail = req.admin?.email || "admin@alikend.com";
    const nowIso = new Date().toISOString();

    const updatedRule: CommissionRuleRecord = {
      ...existing,
      categoryName:
        categoryName !== undefined ? String(categoryName).trim() : existing.categoryName,
      categoryNameBn:
        categoryNameBn !== undefined ? String(categoryNameBn).trim() : existing.categoryNameBn,
      commissionRate: nextRate,
      minCommissionAmount:
        minCommissionAmount !== undefined
          ? Math.max(0, Number(minCommissionAmount) || 0)
          : existing.minCommissionAmount,
      maxCommissionAmount:
        maxCommissionAmount !== undefined
          ? Math.max(0, Number(maxCommissionAmount) || 0)
          : existing.maxCommissionAmount,
      effectiveStartDate:
        effectiveStartDate !== undefined
          ? String(effectiveStartDate)
          : existing.effectiveStartDate,
      effectiveEndDate:
        effectiveEndDate !== undefined ? String(effectiveEndDate) : existing.effectiveEndDate,
      isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      notes: notes !== undefined ? String(notes) : existing.notes,
      updatedBy: adminName,
      updatedAt: nowIso,
    };

    rules[idx] = updatedRule;

    if (isMongoConnected()) {
      try {
        await CommissionRule.findOneAndUpdate(
          { ruleId },
          { $set: updatedRule },
          { upsert: true, new: true }
        );
      } catch (err: any) {
        console.warn("CommissionRule MongoDB update notice:", err.message);
      }
    }

    await recordCommissionAudit({
      actionType: "rate_updated",
      targetType:
        existing.ruleType === "category"
          ? "category"
          : existing.ruleType === "subcategory"
          ? "subcategory"
          : existing.ruleType === "product_override"
          ? "product"
          : "seller",
      targetId: ruleId,
      targetName: updatedRule.targetName || updatedRule.categoryName,
      previousRate,
      newRate: nextRate,
      reason: String(reason || "Updated commission percentage"),
      adminName,
      adminEmail,
    });

    return res.json({
      success: true,
      message: `Updated "${updatedRule.categoryName}" commission from ${previousRate}% to ${nextRate}%.`,
      rule: updatedRule,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to update commission rule" });
  }
});

// ============================================================================
// 5. PATCH /api/admin/commission/rules/:ruleId/toggle - Activate/Deactivate rule
// ============================================================================
router.patch("/rules/:ruleId/toggle", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { ruleId } = req.params;
    const { reason } = req.body || {};

    const rules = await ensureCommissionRulesSeeded();
    const idx = rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Commission rule not found." });
    }

    const existing = rules[idx];
    const nextActive = !existing.isActive;
    const adminName = req.admin?.name || "Admin";
    const adminEmail = req.admin?.email || "admin@alikend.com";

    rules[idx] = {
      ...existing,
      isActive: nextActive,
      updatedBy: adminName,
      updatedAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      try {
        await CommissionRule.findOneAndUpdate(
          { ruleId },
          { $set: { isActive: nextActive, updatedBy: adminName, updatedAt: new Date() } }
        );
      } catch (err) {
        console.warn("CommissionRule toggle MongoDB notice:", err);
      }
    }

    await recordCommissionAudit({
      actionType: "status_toggled",
      targetType:
        existing.ruleType === "category"
          ? "category"
          : existing.ruleType === "subcategory"
          ? "subcategory"
          : existing.ruleType === "product_override"
          ? "product"
          : "seller",
      targetId: ruleId,
      targetName: existing.targetName || existing.categoryName,
      previousRate: existing.commissionRate,
      newRate: existing.commissionRate,
      reason:
        reason ||
        `${nextActive ? "Activated" : "Deactivated"} commission rule for ${existing.categoryName}`,
      adminName,
      adminEmail,
    });

    return res.json({
      success: true,
      isActive: nextActive,
      rule: rules[idx],
      message: `${existing.categoryName} commission rule ${nextActive ? "activated" : "deactivated"}.`,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to toggle rule status" });
  }
});

// ============================================================================
// 6. DELETE /api/admin/commission/rules/:ruleId - Delete commission rule
// ============================================================================
router.delete("/rules/:ruleId", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { ruleId } = req.params;
    const rules = await ensureCommissionRulesSeeded();
    const idx = rules.findIndex((r) => r.ruleId === ruleId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Commission rule not found." });
    }

    const removed = rules[idx];
    rules.splice(idx, 1);

    if (isMongoConnected()) {
      try {
        await CommissionRule.deleteOne({ ruleId });
      } catch (err) {
        console.warn("CommissionRule delete MongoDB notice:", err);
      }
    }

    await recordCommissionAudit({
      actionType: "rule_deleted",
      targetType:
        removed.ruleType === "category"
          ? "category"
          : removed.ruleType === "subcategory"
          ? "subcategory"
          : removed.ruleType === "product_override"
          ? "product"
          : "seller",
      targetId: ruleId,
      targetName: removed.targetName || removed.categoryName,
      previousRate: removed.commissionRate,
      newRate: null,
      reason: `Deleted commission rule for ${removed.categoryName}`,
      adminName: req.admin?.name || "Admin",
      adminEmail: req.admin?.email || "admin@alikend.com",
    });

    return res.json({
      success: true,
      message: `Deleted commission rule "${removed.categoryName}".`,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to delete commission rule" });
  }
});

// ============================================================================
// 7. PUT /api/admin/commission/config - Update Priority, Basis & Global Settings
// ============================================================================
router.put("/config", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const {
      globalDefaultRate,
      minCommissionPercent,
      maxCommissionPercent,
      sellerOverridePrecedence,
      priorityOrder,
      calculationBasis,
      reason = "Updated global commission configuration & priority rules",
    } = req.body;

    const updated = await updateCommissionConfig(
      {
        globalDefaultRate,
        minCommissionPercent,
        maxCommissionPercent,
        sellerOverridePrecedence,
        priorityOrder,
        calculationBasis,
      },
      {
        name: req.admin?.name || "Super Admin",
        email: req.admin?.email || "superadmin@alikend.com",
      },
      String(reason)
    );

    return res.json({
      success: true,
      config: updated,
      commissionRate: updated.globalDefaultRate,
      message: "Commission configuration & priority settings saved successfully.",
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to update commission config" });
  }
});

// ============================================================================
// 8. PATCH /api/admin/commission/settings - Legacy global rate update endpoint
// ============================================================================
router.patch("/settings", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { commissionRate, reason } = req.body;
=======
    return res.status(500).json({ success: false, error: err.message || "Failed to load commission data" });
  }
});

// PATCH /api/admin/commission/settings - Super Admin sets global commission rate
router.patch("/settings", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
  try {
    const { commissionRate } = req.body;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    const rateNum = Number(commissionRate);

    if (isNaN(rateNum) || rateNum < 0 || rateNum > 100) {
      return res.status(400).json({
        success: false,
        error: "Commission percentage must be a valid number between 0% and 100%",
      });
    }

<<<<<<< HEAD
    const updated = await updateCommissionConfig(
      { globalDefaultRate: rateNum },
      {
        name: req.admin?.name || "Super Admin",
        email: req.admin?.email || "superadmin@alikend.com",
      },
      reason || `Updated global default commission rate to ${rateNum}%`
    );

=======
    const roundedRate = Math.round(rateNum * 100) / 100;

    // Update in MongoDB
    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "commission_settings" },
          {
            commissionRate: roundedRate,
            updatedBy: req.admin?.email || "superadmin",
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
      } catch (dbErr: any) {
        console.warn("MongoDB commission update error:", dbErr.message);
      }
    }

    // Update in memoryStore
    if (!memoryStore.platformSettings) {
      memoryStore.platformSettings = {
        commissionRate: roundedRate,
        platformBalance: 0,
        totalCommissionEarned: 0,
        updatedAt: new Date(),
      };
    } else {
      memoryStore.platformSettings.commissionRate = roundedRate;
      memoryStore.platformSettings.updatedAt = new Date();
    }

    // Audit log
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: req.admin?.name || "Super Admin",
<<<<<<< HEAD
        email: req.admin?.email || "admin@system",
        details: `Updated Platform Global Commission Rate to ${updated.globalDefaultRate}%`,
=======
        email: req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system",
        details: `Updated Platform Global Commission Rate to ${roundedRate}%`,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      },
      req
    );

<<<<<<< HEAD
    return res.json({
      success: true,
      commissionRate: updated.globalDefaultRate,
      config: updated,
      message: `Global platform commission rate successfully updated to ${updated.globalDefaultRate}%`,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to update commission settings" });
  }
});

// ============================================================================
// 9. POST /api/admin/commission/orders/:orderId/adjust - Refund / Cancel Reversal
// ============================================================================
router.post("/orders/:orderId/adjust", requireAdmin, async (req: AuthedRequest, res) => {
  try {
    const { orderId } = req.params;
    const { action = "refunded", refundAmount, reason = "Admin commission adjustment" } = req.body;

    let orderDoc: any = null;
    if (isMongoConnected()) {
      try {
        orderDoc = await Order.findOne({
          $or: [
            { orderNumber: orderId },
            ...(orderId.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: orderId }] : []),
          ],
        });
      } catch {}
    }
    if (!orderDoc) {
      orderDoc = (memoryStore.orders || []).find(
        (o) => String(o._id) === String(orderId) || String(o.orderNumber) === String(orderId)
      );
    }

    if (!orderDoc) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const result = await reconcileOrderCommissionOnStatusChange({
      order: orderDoc,
      newStatus: action,
      refundAmount: refundAmount !== undefined ? Number(refundAmount) : undefined,
      adminOrActorName: req.admin?.name || "Admin",
      adminOrActorEmail: req.admin?.email || "admin@alikend.com",
      reason: String(reason),
    });

    return res.json({
      success: true,
      commissionStatus: result.commissionStatus,
      reversedCommissionAmount: result.reversedCommissionAmount,
      message: `Order commission updated to "${result.commissionStatus}" (Adjusted: ৳${result.reversedCommissionAmount}).`,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to adjust order commission" });
  }
});

// ============================================================================
// 10. POST /api/admin/commission/withdraw - Platform Wallet Withdrawal
// ============================================================================
router.post("/withdraw", requireAdmin, async (req: AuthedRequest, res) => {
=======
    console.log(`💰 [COMMISSION UPDATE] Global commission rate set to ${roundedRate}% by ${req.admin?.email}`);

    return res.json({
      success: true,
      commissionRate: roundedRate,
      message: `Global platform commission rate successfully updated to ${roundedRate}%`,
    });
  } catch (err: any) {
    console.error("Failed to update commission rate:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to update commission settings" });
  }
});

// POST /api/admin/commission/withdraw - Super Admin logs internal withdrawal from platform wallet balance
router.post("/withdraw", requireAdmin, requireSuperAdmin, async (req: AuthedRequest, res) => {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  try {
    const { amount, note } = req.body;
    const withdrawAmount = Math.round(Number(amount));

    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Withdrawal amount must be a positive number greater than 0",
      });
    }

<<<<<<< HEAD
    const analytics = await buildCommissionAnalytics();
    const calculatedTotalCommission = analytics.totalCommissionEarned;

=======
    // 1. Calculate lifetime commission earned across all orders
    let ordersList: any[] = [];
    if (isMongoConnected()) {
      try {
        ordersList = await Order.find().lean();
      } catch (err) {
        ordersList = memoryStore.orders || [];
      }
    } else {
      ordersList = memoryStore.orders || [];
    }

    const activeRate = await getActiveCommissionRate();
    let calculatedTotalCommission = 0;
    for (const ord of ordersList) {
      const orderTotal = Number(ord.total) || 0;
      const rate = typeof ord.commissionRate === "number" ? ord.commissionRate : activeRate;
      const commissionAmount =
        typeof ord.commissionAmount === "number" && ord.commissionAmount > 0
          ? ord.commissionAmount
          : Math.round((orderTotal * rate) / 100);
      calculatedTotalCommission += commissionAmount;
    }

    // 2. Calculate existing withdrawals
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    let existingWithdrawals: any[] = [];
    if (isMongoConnected()) {
      try {
        existingWithdrawals = await PlatformWithdrawal.find().lean();
      } catch (err) {
        existingWithdrawals = memoryStore.platformWithdrawals || [];
      }
    } else {
      existingWithdrawals = memoryStore.platformWithdrawals || [];
    }

<<<<<<< HEAD
=======
    // Include any in-memory records
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    const mongoIds = new Set(existingWithdrawals.map((w) => String(w._id)));
    for (const memW of memoryStore.platformWithdrawals || []) {
      if (!mongoIds.has(String(memW._id))) {
        existingWithdrawals.push(memW);
      }
    }

<<<<<<< HEAD
    const currentTotalWithdrawn = existingWithdrawals.reduce(
      (sum, w) => sum + (Number(w.amount) || 0),
      0
    );
=======
    const currentTotalWithdrawn = existingWithdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    const currentRunningBalance = Math.max(0, calculatedTotalCommission - currentTotalWithdrawn);

    if (withdrawAmount > currentRunningBalance) {
      return res.status(400).json({
        success: false,
        error: `Withdrawal amount (₹${withdrawAmount.toLocaleString("en-IN")}) cannot exceed current Platform Wallet Balance (₹${currentRunningBalance.toLocaleString("en-IN")})`,
      });
    }

    const adminEmail = req.admin?.email || process.env.SUPERADMIN_EMAIL || "admin@system";
    const adminName = req.admin?.name || "Super Admin";
    const newRecord = {
      _id: `pw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount: withdrawAmount,
      note: typeof note === "string" ? note.trim() : "",
      adminEmail,
      adminName,
      date: new Date(),
      status: "Completed",
    };

    if (isMongoConnected()) {
      try {
        const savedDoc = await PlatformWithdrawal.create({
          amount: withdrawAmount,
          note: newRecord.note,
          adminEmail,
          adminName,
          date: newRecord.date,
          status: "Completed",
        });
        newRecord._id = String(savedDoc._id);
      } catch (err: any) {
        console.warn("MongoDB PlatformWithdrawal create failed, using memoryStore:", err.message);
      }
    }

    if (!memoryStore.platformWithdrawals) {
      memoryStore.platformWithdrawals = [];
    }
    memoryStore.platformWithdrawals.unshift(newRecord);

    const newRunningBalance = currentRunningBalance - withdrawAmount;

<<<<<<< HEAD
=======
    // Log to activity logs
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    await logActivity(
      {
        eventType: "Login",
        status: "success",
        userName: adminName,
        email: adminEmail,
        details: `Platform Wallet Withdrawal logged: ₹${withdrawAmount.toLocaleString("en-IN")}${newRecord.note ? ` (Note: ${newRecord.note})` : ""}. New Platform Balance: ₹${newRunningBalance.toLocaleString("en-IN")}`,
      },
      req
    );

<<<<<<< HEAD
=======
    console.log(`💸 [PLATFORM WITHDRAWAL] ₹${withdrawAmount} withdrawn by ${adminEmail}. Note: ${newRecord.note || "None"}`);

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    return res.json({
      success: true,
      message: `Successfully logged withdrawal of ₹${withdrawAmount.toLocaleString("en-IN")}`,
      withdrawal: {
        ...newRecord,
        date: newRecord.date.toISOString(),
      },
      runningBalance: newRunningBalance,
      totalCommissionEarned: calculatedTotalCommission,
    });
  } catch (err: any) {
    console.error("Platform withdrawal error:", err);
<<<<<<< HEAD
    return res
      .status(500)
      .json({ success: false, error: err.message || "Failed to process withdrawal" });
=======
    return res.status(500).json({ success: false, error: err.message || "Failed to process withdrawal" });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  }
});

export default router;
