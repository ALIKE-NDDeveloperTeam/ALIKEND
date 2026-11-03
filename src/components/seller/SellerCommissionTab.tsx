import React, { useState, useEffect, useMemo } from "react";
import {
  Percent,
  Search,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Info,
  Layers,
  Package,
  FileSpreadsheet,
  RotateCcw,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Calendar,
} from "lucide-react";
import { sellerApi } from "../../services/sellerApi";
import { SellerProfile } from "../../types";

interface SellerCommissionTabProps {
  sellerProfile: SellerProfile | null;
  showToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
}

interface OrderCommissionRecord {
  orderId: string;
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  commissionStatus: string;
  commissionReversed?: boolean;
  productId: string;
  productName: string;
  categoryName: string;
  subcategoryName?: string;
  quantity: number;
  unitPrice: number;
  grossAmount: number;
  discountAmount: number;
  eligibleAmount: number;
  commissionRate: number;
  ruleApplied: string;
  ruleLabel: string;
  commissionAmount: number;
  netSellerEarning: number;
}

interface ProductCommissionPreview {
  productId: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  applicableCommissionRate: number;
  ruleType: string;
  ruleLabel: string;
  estimatedCommissionAmount: number;
  estimatedNetEarning: number;
}

interface CategoryRuleRow {
  ruleId: string;
  level: number;
  categoryId: string;
  categoryName: string;
  categoryNameBn?: string;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  commissionRate: number;
  updatedAt?: string;
}

function formatBDT(n: number): string {
  return `৳${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function SellerCommissionTab({
  sellerProfile,
  showToast,
}: SellerCommissionTabProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<"orders" | "products" | "schedule">("orders");

  const [notice, setNotice] = useState(
    "Commission rates are controlled by Platform Administration. Sellers have read-only access to commission rates and itemized deductions."
  );
  const [summary, setSummary] = useState({
    totalOrdersCount: 0,
    totalGrossSales: 0,
    totalDiscountDeducted: 0,
    totalPlatformCommission: 0,
    totalReversedCommission: 0,
    totalNetSellerEarnings: 0,
    globalDefaultRate: 5,
    sellerSpecificOverrideRate: null as number | null,
    deductDiscountBeforeCommission: true,
  });

  const [records, setRecords] = useState<OrderCommissionRecord[]>([]);
  const [productRates, setProductRates] = useState<ProductCommissionPreview[]>([]);
  const [categorySchedule, setCategorySchedule] = useState<CategoryRuleRow[]>([]);

  // Order filters
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "reversed">("all");
  const [dateRangePreset, setDateRangePreset] = useState<"all" | "daily" | "weekly" | "monthly" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Schedule filters
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  // Product preview filter
  const [productSearch, setProductSearch] = useState("");

  const fetchCommissionDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      const res = await sellerApi.getCommissionDetails();
      if (res?.notice) setNotice(res.notice);
      if (res?.summary) setSummary(res.summary);
      if (Array.isArray(res?.orderCommissionRecords)) {
        setRecords(res.orderCommissionRecords);
      }
      if (Array.isArray(res?.productCommissionSchedule)) {
        setProductRates(res.productCommissionSchedule);
      }
      if (Array.isArray(res?.categoryCommissionSchedule)) {
        setCategorySchedule(res.categoryCommissionSchedule);
        const initExpanded: Record<string, boolean> = {};
        res.categoryCommissionSchedule
          .filter((r: CategoryRuleRow) => r.level === 1)
          .slice(0, 4)
          .forEach((r: CategoryRuleRow) => {
            initExpanded[r.categoryId] = true;
          });
        setExpandedParents((prev) => (Object.keys(prev).length > 0 ? prev : initExpanded));
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to load commission breakdown.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommissionDetails();
  }, []);

  const filteredRecords = useMemo(() => {
    const now = Date.now();
    return records.filter((rec) => {
      if (statusFilter === "active" && (rec.commissionReversed || rec.commissionStatus === "reversed")) {
        return false;
      }
      if (statusFilter === "reversed" && !rec.commissionReversed && rec.commissionStatus !== "reversed") {
        return false;
      }

      if (orderSearch.trim()) {
        const q = orderSearch.trim().toLowerCase();
        const matches =
          rec.orderNumber.toLowerCase().includes(q) ||
          rec.productName.toLowerCase().includes(q) ||
          rec.categoryName.toLowerCase().includes(q) ||
          (rec.subcategoryName || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (dateRangePreset !== "all") {
        const ts = new Date(rec.orderDate).getTime();
        if (Number.isNaN(ts)) return true;
        if (dateRangePreset === "daily" && now - ts > 24 * 60 * 60 * 1000) return false;
        if (dateRangePreset === "weekly" && now - ts > 7 * 24 * 60 * 60 * 1000) return false;
        if (dateRangePreset === "monthly" && now - ts > 30 * 24 * 60 * 60 * 1000) return false;
        if (dateRangePreset === "custom") {
          if (customStartDate && ts < new Date(customStartDate).getTime()) return false;
          if (customEndDate && ts > new Date(customEndDate + "T23:59:59").getTime()) return false;
        }
      }

      return true;
    });
  }, [records, statusFilter, orderSearch, dateRangePreset, customStartDate, customEndDate]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return productRates;
    const q = productSearch.trim().toLowerCase();
    return productRates.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory || "").toLowerCase().includes(q)
    );
  }, [productRates, productSearch]);

  const scheduleTree = useMemo(() => {
    const parents = categorySchedule
      .filter((r) => r.level === 1)
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    const subMap: Record<string, CategoryRuleRow[]> = {};
    categorySchedule
      .filter((r) => r.level === 2)
      .forEach((sub) => {
        const pId = sub.parentCategoryId || "";
        if (!subMap[pId]) subMap[pId] = [];
        subMap[pId].push(sub);
      });

    if (!scheduleSearch.trim()) {
      return parents.map((parent) => ({
        parent,
        subcategories: (subMap[parent.categoryId] || []).sort((a, b) =>
          a.categoryName.localeCompare(b.categoryName)
        ),
      }));
    }

    const q = scheduleSearch.trim().toLowerCase();
    return parents
      .map((parent) => {
        const subs = (subMap[parent.categoryId] || []).filter(
          (s) =>
            s.categoryName.toLowerCase().includes(q) ||
            (s.categoryNameBn || "").toLowerCase().includes(q)
        );
        const parentMatches =
          parent.categoryName.toLowerCase().includes(q) ||
          (parent.categoryNameBn || "").toLowerCase().includes(q);
        if (!parentMatches && subs.length === 0) return null;
        return {
          parent,
          subcategories: parentMatches ? subMap[parent.categoryId] || [] : subs,
        };
      })
      .filter(Boolean) as Array<{ parent: CategoryRuleRow; subcategories: CategoryRuleRow[] }>;
  }, [categorySchedule, scheduleSearch]);

  const exportSellerCommissionCsv = () => {
    const headers = [
      "Order ID",
      "Order Date",
      "Product Name",
      "Category",
      "Subcategory",
      "Quantity",
      "Selling Price (BDT)",
      "Discount Amount (BDT)",
      "Eligible Amount (BDT)",
      "Commission (%)",
      "Rule Applied",
      "Commission Amount (BDT)",
      "Net Seller Earnings (BDT)",
      "Order Status",
      "Commission Status",
    ];
    const rows = filteredRecords.map((r) => [
      `"${r.orderNumber}"`,
      `"${r.orderDate ? new Date(r.orderDate).toISOString().slice(0, 10) : ""}"`,
      `"${(r.productName || "").replace(/"/g, '""')}"`,
      `"${(r.categoryName || "").replace(/"/g, '""')}"`,
      `"${(r.subcategoryName || "").replace(/"/g, '""')}"`,
      r.quantity,
      r.grossAmount,
      r.discountAmount,
      r.eligibleAmount,
      r.commissionRate,
      `"${(r.ruleLabel || r.ruleApplied || "").replace(/"/g, '""')}"`,
      r.commissionAmount,
      r.netSellerEarning,
      `"${r.orderStatus}"`,
      `"${r.commissionReversed ? "reversed" : r.commissionStatus}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `seller-commission-statement-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Administration Governance Notice */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
              <span>Seller Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Finance</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Commission Details</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2.5">
              <Percent className="w-6 h-6 text-orange-500" />
              Platform Commission & Fee Statement
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Transparent item-by-item breakdown of platform commission rates, promotional discount deductions, reversals, and net store earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={exportSellerCommissionCsv}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Statement (CSV)
            </button>
            <button
              type="button"
              onClick={() => fetchCommissionDetails(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Mandatory Read-Only Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <span className="font-semibold">Administration Controlled Rates: </span>
            {notice}{" "}
            {summary.sellerSpecificOverrideRate !== null && (
              <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                Special Store Override Active: {summary.sellerSpecificOverrideRate}%
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveView("orders")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "orders"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Order Commission Breakdown ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("products")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "products"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Package className="w-4 h-4" />
            My Products Rate Calculator ({productRates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("schedule")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === "schedule"
                ? "bg-orange-500 text-white shadow-xs"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Layers className="w-4 h-4" />
            Category Commission Schedule ({categorySchedule.length})
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Gross Product Sales
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1 font-mono">
            {formatBDT(summary.totalGrossSales)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Across {summary.totalOrdersCount} seller orders
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Promotional Discounts
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            -{formatBDT(summary.totalDiscountDeducted)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            {summary.deductDiscountBeforeCommission
              ? "Deducted before commission"
              : "Gross price basis"}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Platform Commission
          </div>
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1 font-mono">
            {formatBDT(summary.totalPlatformCommission)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Based on category & override rules
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Reversed on Returns/Cancels
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {formatBDT(summary.totalReversedCommission)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Auto-reversed on cancelled orders
          </div>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Net Seller Earnings
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
            {formatBDT(summary.totalNetSellerEarnings)}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
            Credited to Seller Wallet
          </div>
        </div>
      </div>

      {/* =====================================================================
          VIEW 1: ORDER COMMISSION BREAKDOWN TABLE
         ===================================================================== */}
      {activeView === "orders" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, Product Name, or Category..."
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/90 text-zinc-900 dark:text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">All Commission Status</option>
                  <option value="active">Active / Credited Only</option>
                  <option value="reversed">Reversed / Cancelled Only</option>
                </select>

                <select
                  value={dateRangePreset}
                  onChange={(e) => setDateRangePreset(e.target.value as any)}
                  className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                >
                  <option value="all">All Time</option>
                  <option value="daily">Today (24h)</option>
                  <option value="weekly">Last 7 Days</option>
                  <option value="monthly">Last 30 Days</option>
                  <option value="custom">Custom Date Range</option>
                </select>

                {dateRangePreset === "custom" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    />
                    <span className="text-xs text-zinc-400">to</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                )}

                {(orderSearch || statusFilter !== "all" || dateRangePreset !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearch("");
                      setStatusFilter("all");
                      setDateRangePreset("all");
                      setCustomStartDate("");
                      setCustomEndDate("");
                    }}
                    className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Product Category</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Discount</th>
                  <th className="py-3.5 px-4 text-center">Applicable Commission %</th>
                  <th className="py-3.5 px-4 text-right">Commission Amount</th>
                  <th className="py-3.5 px-4 text-right">Net Seller Earnings</th>
                  <th className="py-3.5 px-4 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      Loading your commission statement...
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No order commission records match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec, idx) => {
                    const isReversed =
                      rec.commissionReversed || rec.commissionStatus === "reversed";
                    return (
                      <tr
                        key={`${rec.orderId}_${rec.productId}_${idx}`}
                        className={`transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${
                          isReversed ? "opacity-60" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-xs text-zinc-900 dark:text-white">
                            {rec.orderNumber}
                          </div>
                          <div className="text-[11px] text-zinc-500 mt-0.5">
                            {rec.orderDate
                              ? new Date(rec.orderDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-zinc-900 dark:text-white line-clamp-1">
                            {rec.productName}
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            Qty: {rec.quantity} × {formatBDT(rec.unitPrice)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {rec.categoryName}
                          </div>
                          {rec.subcategoryName && (
                            <div className="text-[11px] text-zinc-500">
                              ↳ {rec.subcategoryName}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-zinc-800 dark:text-zinc-200">
                          {formatBDT(rec.grossAmount)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-600 dark:text-amber-400">
                          {rec.discountAmount > 0 ? `-${formatBDT(rec.discountAmount)}` : "৳0"}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            {rec.commissionRate}%
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-[140px] mx-auto">
                            {rec.ruleLabel || rec.ruleApplied}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-orange-600 dark:text-orange-400">
                          {isReversed ? (
                            <span className="line-through text-rose-500">
                              {formatBDT(rec.commissionAmount)}
                            </span>
                          ) : (
                            formatBDT(rec.commissionAmount)
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {isReversed ? (
                            <span className="line-through text-zinc-400">
                              {formatBDT(rec.netSellerEarning)}
                            </span>
                          ) : (
                            formatBDT(rec.netSellerEarning)
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isReversed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400">
                              Reversed ({rec.orderStatus})
                            </span>
                          ) : rec.orderStatus === "delivered" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Settled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" />
                              Pending ({rec.orderStatus})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: MY PRODUCTS RATE CALCULATOR (READ-ONLY)
         ===================================================================== */}
      {activeView === "products" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                My Listed Products — Applicable Commission Preview
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Real-time preview of the exact commission rule, fee deduction, and net payout per unit for each of your products.
              </p>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search your products..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category & Subcategory</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-center">Applicable Commission (%)</th>
                  <th className="py-3.5 px-4">Active Priority Rule</th>
                  <th className="py-3.5 px-4 text-right">Est. Commission / Unit</th>
                  <th className="py-3.5 px-4 text-right">Est. Net Earnings / Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      No products found in your catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr
                      key={prod.productId}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-white">
                        {prod.name}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-300">
                        <div>{prod.category}</div>
                        {prod.subcategory && (
                          <div className="text-[11px] text-zinc-400">↳ {prod.subcategory}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-zinc-900 dark:text-white">
                        {formatBDT(prod.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-orange-500/15 text-orange-600 dark:text-orange-400">
                          {prod.applicableCommissionRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-300">
                        {prod.ruleLabel}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-orange-600 dark:text-orange-400">
                        -{formatBDT(prod.estimatedCommissionAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatBDT(prod.estimatedNetEarning)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 3: PLATFORM CATEGORY COMMISSION SCHEDULE (READ-ONLY)
         ===================================================================== */}
      {activeView === "schedule" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Platform Category & Subcategory Commission Schedule (Read-Only)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Standard marketplace commission percentages across all product categories and subcategories.
              </p>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                placeholder="Search category or subcategory..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4 w-28">Level</th>
                  <th className="py-3.5 px-4">Category Name</th>
                  <th className="py-3.5 px-4 text-center">Standard Commission (%)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {scheduleTree.map(({ parent, subcategories }) => {
                  const isExpanded = Boolean(
                    expandedParents[parent.categoryId] || scheduleSearch.trim()
                  );
                  return (
                    <React.Fragment key={parent.ruleId}>
                      <tr className="bg-zinc-50/40 dark:bg-zinc-800/30 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-zinc-200/80 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                            Level 1
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedParents((prev) => ({
                                ...prev,
                                [parent.categoryId]: !prev[parent.categoryId],
                              }))
                            }
                            className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white cursor-pointer"
                          >
                            {subcategories.length > 0 ? (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-orange-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-zinc-400" />
                              )
                            ) : (
                              <span className="w-4 h-4 inline-block" />
                            )}
                            <span>{parent.categoryName}</span>
                            {parent.categoryNameBn && (
                              <span className="text-xs text-zinc-400 font-normal">
                                ({parent.categoryNameBn})
                              </span>
                            )}
                            {subcategories.length > 0 && (
                              <span className="text-[11px] text-zinc-400 font-normal">
                                · {subcategories.length} subcategories
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-orange-500/15 text-orange-600 dark:text-orange-400">
                            {parent.commissionRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-zinc-500">
                          {parent.updatedAt
                            ? new Date(parent.updatedAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>

                      {isExpanded &&
                        subcategories.map((sub) => (
                          <tr
                            key={sub.ruleId}
                            className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-2.5 px-4 pl-7">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                Level 2
                              </span>
                            </td>
                            <td className="py-2.5 px-4 pl-10 text-zinc-700 dark:text-zinc-300">
                              <div className="flex items-center gap-2">
                                <span className="text-zinc-400">↳</span>
                                <span className="font-medium">{sub.categoryName}</span>
                                {sub.categoryNameBn && (
                                  <span className="text-xs text-zinc-400">
                                    ({sub.categoryNameBn})
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                {sub.commissionRate}%
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                Active
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right text-xs text-zinc-500">
                              {sub.updatedAt
                                ? new Date(sub.updatedAt).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
