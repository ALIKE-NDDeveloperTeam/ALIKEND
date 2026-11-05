import React, { useState, useEffect, useMemo, FormEvent } from "react";
import {
  Wallet,
  TrendingUp,
  RefreshCw,
  Check,
  Copy,
  Search,
  BadgePercent,
  BarChart3,
  ShieldCheck,
  ArrowDownToLine,
  Sliders,
  AlertCircle,
  Clock,
  History,
  CheckCircle2,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Layers,
  Store,
  Package,
  Calculator,
  Calendar,
  ArrowUpDown,
  X,
} from "lucide-react";
import GlassCloseButton from "../../components/GlassCloseButton";
import {
  CommissionData,
  CommissionRuleItem,
  CommissionConfigType,
  Product,
  Seller,
} from "../adminTypes";
import { adminApi } from "../adminApi";
import { exportDataToExcel, formatCommissionForExcel } from "../../utils/exportToExcel";

interface CommissionWalletProps {
  data: CommissionData | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  onUpdateRate: (newRate: number) => Promise<void>;
  isUpdatingRate: boolean;
  products?: Product[];
  sellers?: Seller[];
}

type ActiveSubTab = "categories" | "settings" | "overrides" | "reports" | "audit";
type ReportSubView = "ledger" | "by_category" | "by_seller" | "by_product";

export const CommissionWallet: React.FC<CommissionWalletProps> = ({
  data,
  loading,
  onRefresh,
  isUpdatingRate,
  products = [],
  sellers = [],
}) => {
  const [activeTab, setActiveTab] = useState<ActiveSubTab>("categories");

  // Local synced state for rules & config
  const [rules, setRules] = useState<CommissionRuleItem[]>(data?.rules || []);
  const [config, setConfig] = useState<CommissionConfigType>(
    data?.config || {
      globalDefaultRate: data?.commissionRate ?? 5,
      minCommissionPercent: 0,
      maxCommissionPercent: 50,
      sellerOverridePrecedence: "before_category",
      priorityOrder: [
        "product_override",
        "seller_override",
        "subcategory",
        "category",
        "global_default",
      ],
      calculationBasis: {
        deductDiscountBeforeCommission: true,
        includeShipping: false,
        includeTax: false,
      },
    }
  );

  useEffect(() => {
    if (Array.isArray(data?.rules)) {
      setRules(data.rules);
    }
    if (data?.config) {
      setConfig(data.config);
    }
  }, [data]);

  // Expand/collapse state for Level 1 categories
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<string, boolean>>({
    electronics: true,
    fashion: true,
    mobiles: true,
    grocery: true,
  });

  // Category & Subcategory Table Filters & Sorting
  const [catSearch, setCatSearch] = useState("");
  const [selectedParentCat, setSelectedParentCat] = useState("all");
  const [selectedSubCat, setSelectedSubCat] = useState("all");
  const [ruleStatusFilter, setRuleStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [minRateFilter, setMinRateFilter] = useState<string>("");
  const [maxRateFilter, setMaxRateFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name_asc" | "name_desc" | "rate_asc" | "rate_desc" | "date_desc"
  >("name_asc");

  // Feedback banner
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Add / Edit Rule Modal state
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRuleItem | null>(null);
  const [formRuleType, setFormRuleType] = useState<
    "category" | "subcategory" | "product_override" | "seller_override"
  >("category");
  const [formCategoryName, setFormCategoryName] = useState("");
  const [formCategoryNameBn, setFormCategoryNameBn] = useState("");
  const [formParentCategoryId, setFormParentCategoryId] = useState("");
  const [formTargetId, setFormTargetId] = useState("");
  const [formTargetName, setFormTargetName] = useState("");
  const [formRate, setFormRate] = useState<number>(8);
  const [formMinAmount, setFormMinAmount] = useState<number>(0);
  const [formMaxAmount, setFormMaxAmount] = useState<number>(0);
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [formReason, setFormReason] = useState("");
  const [savingRule, setSavingRule] = useState(false);

  // Settings Tab state
  const [savingConfig, setSavingConfig] = useState(false);
  const [configReason, setConfigReason] = useState("Updated global commission & priority policy");

  // Interactive Calculator state
  const [calcSellingPrice, setCalcSellingPrice] = useState<number>(1000);
  const [calcDiscount, setCalcDiscount] = useState<number>(0);
  const [calcShipping, setCalcShipping] = useState<number>(80);
  const [calcTax, setCalcTax] = useState<number>(0);
  const [calcSelectedRuleId, setCalcSelectedRuleId] = useState<string>("cat_electronics");

  // Reports Tab state
  const [reportSubView, setReportSubView] = useState<ReportSubView>("ledger");
  const [reportPeriod, setReportPeriod] = useState<
    "all" | "daily" | "weekly" | "monthly" | "custom"
  >("all");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("all");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedOrderRowId, setExpandedOrderRowId] = useState<string | null>(null);

  // Order Refund / Cancellation Commission Adjustment Modal
  const [adjustModalOrder, setAdjustModalOrder] = useState<any | null>(null);
  const [adjustAction, setAdjustAction] = useState<
    "cancelled" | "refunded" | "partially_refunded" | "delivered"
  >("refunded");
  const [adjustRefundAmount, setAdjustRefundAmount] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState<string>("Customer return / refund approved");
  const [submittingAdjust, setSubmittingAdjust] = useState(false);

  // Platform Wallet Withdrawal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>("");
  const [withdrawNote, setWithdrawNote] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState<boolean>(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // Derived category & subcategory lists
  const parentCategories = useMemo(
    () => rules.filter((r) => r.ruleType === "category"),
    [rules]
  );
  const subCategories = useMemo(
    () => rules.filter((r) => r.ruleType === "subcategory"),
    [rules]
  );
  const overrideRules = useMemo(
    () =>
      rules.filter(
        (r) => r.ruleType === "product_override" || r.ruleType === "seller_override"
      ),
    [rules]
  );

  // Filtered & sorted hierarchical category tree
  const filteredCategoryTree = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    const minR = minRateFilter !== "" ? Number(minRateFilter) : null;
    const maxR = maxRateFilter !== "" ? Number(maxRateFilter) : null;

    const matchesFilters = (r: CommissionRuleItem) => {
      if (ruleStatusFilter === "active" && !r.isActive) return false;
      if (ruleStatusFilter === "inactive" && r.isActive) return false;
      if (minR !== null && !isNaN(minR) && r.commissionRate < minR) return false;
      if (maxR !== null && !isNaN(maxR) && r.commissionRate > maxR) return false;
      return true;
    };

    const result: Array<{
      parent: CommissionRuleItem;
      children: CommissionRuleItem[];
    }> = [];

    for (const parent of parentCategories) {
      if (selectedParentCat !== "all" && parent.categoryId !== selectedParentCat) {
        continue;
      }

      const rawChildren = subCategories.filter(
        (sub) => sub.parentCategoryId === parent.categoryId
      );

      const matchingChildren = rawChildren.filter((sub) => {
        if (selectedSubCat !== "all" && sub.categoryId !== selectedSubCat) return false;
        if (!matchesFilters(sub)) return false;
        if (q) {
          const inSub =
            sub.categoryName.toLowerCase().includes(q) ||
            sub.categoryId.toLowerCase().includes(q);
          const inParent =
            parent.categoryName.toLowerCase().includes(q) ||
            (parent.categoryNameBn || "").toLowerCase().includes(q);
          return inSub || inParent;
        }
        return true;
      });

      const parentMatchesSelf =
        selectedSubCat === "all" &&
        matchesFilters(parent) &&
        (!q ||
          parent.categoryName.toLowerCase().includes(q) ||
          (parent.categoryNameBn || "").toLowerCase().includes(q) ||
          parent.categoryId.toLowerCase().includes(q));

      if (parentMatchesSelf || matchingChildren.length > 0) {
        const sortedChildren = [...matchingChildren].sort((a, b) => {
          if (sortBy === "name_asc") return a.categoryName.localeCompare(b.categoryName);
          if (sortBy === "name_desc") return b.categoryName.localeCompare(a.categoryName);
          if (sortBy === "rate_asc") return a.commissionRate - b.commissionRate;
          if (sortBy === "rate_desc") return b.commissionRate - a.commissionRate;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        result.push({ parent, children: sortedChildren });
      }
    }

    result.sort((a, b) => {
      if (sortBy === "name_asc") return a.parent.categoryName.localeCompare(b.parent.categoryName);
      if (sortBy === "name_desc") return b.parent.categoryName.localeCompare(a.parent.categoryName);
      if (sortBy === "rate_asc") return a.parent.commissionRate - b.parent.commissionRate;
      if (sortBy === "rate_desc") return b.parent.commissionRate - a.parent.commissionRate;
      return new Date(b.parent.updatedAt).getTime() - new Date(a.parent.updatedAt).getTime();
    });

    return result;
  }, [
    parentCategories,
    subCategories,
    catSearch,
    selectedParentCat,
    selectedSubCat,
    ruleStatusFilter,
    minRateFilter,
    maxRateFilter,
    sortBy,
  ]);

  const toggleExpandCategory = (categoryId: string) => {
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const expandAllCategories = () => {
    const next: Record<string, boolean> = {};
    for (const c of parentCategories) next[c.categoryId] = true;
    setExpandedCategoryIds(next);
  };

  const collapseAllCategories = () => {
    setExpandedCategoryIds({});
  };

  const resetCategoryFilters = () => {
    setCatSearch("");
    setSelectedParentCat("all");
    setSelectedSubCat("all");
    setRuleStatusFilter("all");
    setMinRateFilter("");
    setMaxRateFilter("");
    setSortBy("name_asc");
  };

  // Open Modal to Create or Edit a Rule
  const openCreateRuleModal = (
    type: "category" | "subcategory" | "product_override" | "seller_override",
    presetParentId?: string
  ) => {
    setEditingRule(null);
    setFormRuleType(type);
    setFormCategoryName("");
    setFormCategoryNameBn("");
    setFormParentCategoryId(presetParentId || parentCategories[0]?.categoryId || "electronics");
    setFormTargetId("");
    setFormTargetName("");
    setFormRate(config.globalDefaultRate || 8);
    setFormMinAmount(0);
    setFormMaxAmount(0);
    setFormStartDate("");
    setFormEndDate("");
    setFormIsActive(true);
    setFormReason("Added new commission rule");
    setRuleModalOpen(true);
  };

  const openEditRuleModal = (rule: CommissionRuleItem) => {
    setEditingRule(rule);
    setFormRuleType(rule.ruleType);
    setFormCategoryName(rule.categoryName);
    setFormCategoryNameBn(rule.categoryNameBn || "");
    setFormParentCategoryId(rule.parentCategoryId || "");
    setFormTargetId(rule.targetId || "");
    setFormTargetName(rule.targetName || "");
    setFormRate(rule.commissionRate);
    setFormMinAmount(rule.minCommissionAmount || 0);
    setFormMaxAmount(rule.maxCommissionAmount || 0);
    setFormStartDate(rule.effectiveStartDate || "");
    setFormEndDate(rule.effectiveEndDate || "");
    setFormIsActive(rule.isActive);
    setFormReason("");
    setRuleModalOpen(true);
  };

  const handleSaveRuleForm = async (e: FormEvent) => {
    e.preventDefault();
    if (formRate < 0 || formRate > 100) {
      showFeedback("Commission percentage must be between 0% and 100%.", "error");
      return;
    }

    setSavingRule(true);
    try {
      if (editingRule) {
        const res = await adminApi.updateCommissionRule(editingRule.ruleId, {
          categoryName: formCategoryName,
          categoryNameBn: formCategoryNameBn,
          commissionRate: formRate,
          minCommissionAmount: formMinAmount,
          maxCommissionAmount: formMaxAmount,
          effectiveStartDate: formStartDate,
          effectiveEndDate: formEndDate,
          isActive: formIsActive,
          reason: formReason.trim() || `Updated ${formCategoryName} rate to ${formRate}%`,
        });
        if (res?.success) {
          showFeedback(res.message || "Commission rule updated.");
          setRuleModalOpen(false);
          await onRefresh();
        }
      } else {
        const parentObj = parentCategories.find((p) => p.categoryId === formParentCategoryId);
        const res = await adminApi.createCommissionRule({
          ruleType: formRuleType,
          categoryName:
            formRuleType === "product_override" || formRuleType === "seller_override"
              ? formTargetName || formCategoryName
              : formCategoryName,
          categoryNameBn: formCategoryNameBn,
          parentCategoryId: formRuleType === "subcategory" ? formParentCategoryId : null,
          parentCategoryName:
            formRuleType === "subcategory" ? parentObj?.categoryName || formParentCategoryId : null,
          targetId:
            formRuleType === "product_override" || formRuleType === "seller_override"
              ? formTargetId
              : null,
          targetName:
            formRuleType === "product_override" || formRuleType === "seller_override"
              ? formTargetName || formCategoryName
              : null,
          commissionRate: formRate,
          minCommissionAmount: formMinAmount,
          maxCommissionAmount: formMaxAmount,
          effectiveStartDate: formStartDate,
          effectiveEndDate: formEndDate,
          isActive: formIsActive,
          reason: formReason.trim() || `Created new ${formRuleType} commission rule`,
        });
        if (res?.success) {
          showFeedback(res.message || "Created new commission rule.");
          if (formRuleType === "subcategory" && formParentCategoryId) {
            setExpandedCategoryIds((prev) => ({ ...prev, [formParentCategoryId]: true }));
          }
          setRuleModalOpen(false);
          await onRefresh();
        }
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to save commission rule", "error");
    } finally {
      setSavingRule(false);
    }
  };

  const handleToggleRuleStatus = async (rule: CommissionRuleItem) => {
    try {
      const res = await adminApi.toggleCommissionRule(
        rule.ruleId,
        `${rule.isActive ? "Deactivated" : "Activated"} ${rule.categoryName} commission rule`
      );
      if (res?.success) {
        showFeedback(res.message || "Rule status updated.");
        await onRefresh();
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to toggle rule status", "error");
    }
  };

  const handleDeleteRule = async (rule: CommissionRuleItem) => {
    try {
      const res = await adminApi.deleteCommissionRule(rule.ruleId);
      if (res?.success) {
        showFeedback(res.message || "Commission rule deleted.");
        await onRefresh();
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to delete rule", "error");
    }
  };

  const handleSaveConfig = async (e: FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await adminApi.updateCommissionConfig({
        ...config,
        reason: configReason.trim() || "Updated commission configuration & priority settings",
      });
      if (res?.success) {
        showFeedback(res.message || "Global commission settings saved.");
        await onRefresh();
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to save commission settings", "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAdjustOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adjustModalOrder) return;
    setSubmittingAdjust(true);
    try {
      const res = await adminApi.adjustOrderCommission(adjustModalOrder.orderNumber, {
        action: adjustAction,
        refundAmount: adjustRefundAmount ? Number(adjustRefundAmount) : undefined,
        reason: adjustReason,
      });
      if (res?.success) {
        showFeedback(res.message || "Order commission adjusted.");
        setAdjustModalOrder(null);
        await onRefresh();
      }
    } catch (err: any) {
      showFeedback(err?.message || "Failed to adjust order commission", "error");
    } finally {
      setSubmittingAdjust(false);
    }
  };

  // Interactive Calculator result
  const calculatorPreview = useMemo(() => {
    const selectedRule =
      rules.find((r) => r.ruleId === calcSelectedRuleId) || parentCategories[0];
    const rate = selectedRule ? selectedRule.commissionRate : config.globalDefaultRate;
    let eligible = Math.max(0, calcSellingPrice);
    if (config.calculationBasis.deductDiscountBeforeCommission) {
      eligible = Math.max(0, eligible - calcDiscount);
    }
    if (config.calculationBasis.includeShipping) {
      eligible += calcShipping;
    }
    if (config.calculationBasis.includeTax) {
      eligible += calcTax;
    }
    const platformCommission = Math.round((eligible * rate) / 100);
    const netSellerAmount = Math.max(0, calcSellingPrice - calcDiscount - platformCommission);
    return {
      ruleName: selectedRule?.categoryName || "Global Default",
      rate,
      eligible,
      platformCommission,
      netSellerAmount,
    };
  }, [
    rules,
    parentCategories,
    calcSelectedRuleId,
    calcSellingPrice,
    calcDiscount,
    calcShipping,
    calcTax,
    config,
  ]);

  // Orders & Report filtering
  const orders = data?.orders || [];
  const withdrawals = data?.withdrawals || [];
  const auditLogs = data?.auditLogs || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const sellerBreakdown = data?.sellerBreakdown || [];
  const productBreakdown = data?.productBreakdown || [];

  const totalCommission =
    data?.totalCommissionEarned ??
    orders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const totalSellerEarnings =
    data?.totalSellerEarnings ??
    orders.reduce((sum, o) => sum + (o.sellerPayout || 0), 0);
  const settledCommission = data?.settledCommissionTotal ?? totalCommission;
  const pendingCommission = data?.pendingCommissionTotal ?? 0;
  const refundedCommission = data?.refundedOrReversedCommissionTotal ?? 0;
  const totalWithdrawn =
    data?.totalWithdrawn ??
    withdrawals.reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const runningBalance = data?.runningBalance ?? Math.max(0, totalCommission - totalWithdrawn);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let minD: Date | null = null;
    let maxD: Date | null = null;
    if (reportPeriod === "daily") {
      minD = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (reportPeriod === "weekly") {
      minD = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (reportPeriod === "monthly") {
      minD = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (reportPeriod === "custom") {
      if (reportStartDate) minD = new Date(reportStartDate);
      if (reportEndDate) {
        maxD = new Date(reportEndDate);
        maxD.setHours(23, 59, 59, 999);
      }
    }

    return orders.filter((ord) => {
      const ordDate = ord.date ? new Date(ord.date) : new Date();
      if (minD && ordDate < minD) return false;
      if (maxD && ordDate > maxD) return false;

      const q = ledgerSearch.trim().toLowerCase();
      if (q) {
        const matchOrder = ord.orderNumber.toLowerCase().includes(q);
        const matchCust = ord.memberName.toLowerCase().includes(q);
        const matchItem = (ord.items || []).some(
          (it) =>
            it.productName?.toLowerCase().includes(q) ||
            it.category?.toLowerCase().includes(q) ||
            it.sellerShopName?.toLowerCase().includes(q)
        );
        if (!matchOrder && !matchCust && !matchItem) return false;
      }

      if (reportStatusFilter !== "all") {
        const cStat = ord.commissionStatus || "credited";
        if (reportStatusFilter === "settled" && cStat !== "settled" && cStat !== "credited") {
          return false;
        }
        if (reportStatusFilter === "pending" && cStat !== "pending") return false;
        if (
          reportStatusFilter === "reversed" &&
          cStat !== "reversed" &&
          cStat !== "refunded" &&
          cStat !== "partially_refunded" &&
          ord.status !== "cancelled"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, reportPeriod, reportStartDate, reportEndDate, ledgerSearch, reportStatusFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCategoryRulesCSV = () => {
    const headers = [
      "Level",
      "Rule Type",
      "Category / Subcategory Name",
      "Parent Category",
      "Commission (%)",
      "Status",
      "Effective Start",
      "Effective End",
      "Last Updated",
      "Updated By",
    ];
    const rows = rules.map((r) => [
      `Level ${r.level}`,
      r.ruleType,
      `"${r.categoryName.replace(/"/g, '""')}"`,
      `"${(r.parentCategoryName || "Root Category").replace(/"/g, '""')}"`,
      `${r.commissionRate}%`,
      r.isActive ? "Active" : "Inactive",
      r.effectiveStartDate || "-",
      r.effectiveEndDate || "-",
      new Date(r.updatedAt).toISOString().slice(0, 10),
      `"${(r.updatedBy || "Admin").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Category_Commission_Rules_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenWithdrawModal = () => {
    setWithdrawAmountInput(String(runningBalance));
    setWithdrawNote("");
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);
    setIsWithdrawModalOpen(true);
  };

  const handleSubmitWithdrawal = async (e: FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Please enter a valid withdrawal amount greater than 0");
      return;
    }
    if (amountNum > runningBalance) {
      setWithdrawError(
        `Withdrawal amount (৳${amountNum.toLocaleString("en-IN")}) cannot exceed current balance (৳${runningBalance.toLocaleString("en-IN")})`
      );
      return;
    }

    setIsSubmittingWithdraw(true);
    setWithdrawError(null);
    try {
      const res = await adminApi.withdrawPlatformFunds(amountNum, withdrawNote.trim());
      if (res?.success) {
        setWithdrawSuccessMsg(
          `৳${amountNum.toLocaleString("en-IN")} deducted from Platform Wallet Balance.`
        );
        await onRefresh();
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawSuccessMsg(null);
        }, 1200);
      } else {
        setWithdrawError(res?.error || "Failed to process withdrawal");
      }
    } catch (err: any) {
      setWithdrawError(err?.message || "Failed to process withdrawal");
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50/80 border border-blue-200 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800">
            <BadgePercent className="w-4 h-4 text-blue-600" />
            <span>Marketplace Financial Governance</span>
            <span>·</span>
            <span>Global Default: {config.globalDefaultRate}%</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Commission Management System
          </h2>
          <p className="text-xs text-slate-600 max-w-3xl">
            Configure hierarchical category &amp; subcategory commission percentages, priority
            rules, product/seller overrides, automatic order commission calculations, refund
            reversals, and full audit history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => openCreateRuleModal("category")}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category Rule</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateRuleModal("subcategory")}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subcategory Rule</span>
          </button>
          <button
            type="button"
            onClick={() => onRefresh()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {toastMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            toastMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border border-blue-200 border-l-4 border-l-blue-600 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-blue-800">Total Categories</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{parentCategories.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {subCategories.length} Subcategories
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-600 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-emerald-800">Active Rules</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {rules.filter((r) => r.isActive).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            of {rules.length} configured rules
          </div>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 border-l-4 border-l-indigo-600 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-indigo-800">
            Platform Commission
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-1">
            ৳{totalCommission.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Settled: ৳{settledCommission.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-teal-200 border-l-4 border-l-teal-600 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-teal-800">Seller Net Earnings</div>
          <div className="text-2xl font-bold text-teal-800 mt-1">
            ৳{totalSellerEarnings.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Before other deductions</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase text-amber-900">
            Refunded / Reversed
          </div>
          <div className="text-2xl font-bold text-amber-800 mt-1">
            ৳{refundedCommission.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Pending: ৳{pendingCommission.toLocaleString("en-IN")}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-purple-200 border-l-4 border-l-purple-600 bg-white shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-purple-800">Wallet Balance</span>
            <button
              type="button"
              onClick={handleOpenWithdrawModal}
              disabled={runningBalance <= 0}
              className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold disabled:opacity-40 cursor-pointer"
            >
              Withdraw
            </button>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            ৳{runningBalance.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Audit Logs: {auditLogs.length}
          </div>
        </div>
      </div>

      {/* Main Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 border border-slate-200 rounded-xl">
        {[
          {
            id: "categories",
            label: "1. Category & Subcategory Commissions",
            icon: Layers,
            count: parentCategories.length + subCategories.length,
          },
          {
            id: "settings",
            label: "2. Commission Settings & Priority",
            icon: Sliders,
          },
          {
            id: "overrides",
            label: "3. Product & Seller Overrides",
            icon: Store,
            count: overrideRules.length,
          },
          {
            id: "reports",
            label: "4. Commission Reports & Ledger",
            icon: BarChart3,
            count: orders.length,
          },
          {
            id: "audit",
            label: "5. Change History & Wallet",
            icon: History,
            count: auditLogs.length,
          },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as ActiveSubTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-white hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    isActive ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: DARAZ-INSPIRED EXPANDABLE CATEGORY & SUBCATEGORY COMMISSION TABLE
         ===================================================================== */}
      {activeTab === "categories" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Search, Filter & Sort Toolbar */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
              {/* Search by name */}
              <div className="lg:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder="Search category or subcategory name..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              {/* Filter by Category */}
              <select
                value={selectedParentCat}
                onChange={(e) => {
                  setSelectedParentCat(e.target.value);
                  setSelectedSubCat("all");
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                <option value="all">All Categories ({parentCategories.length})</option>
                {parentCategories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.categoryName} ({c.commissionRate}%)
                  </option>
                ))}
              </select>

              {/* Filter by Subcategory */}
              <select
                value={selectedSubCat}
                onChange={(e) => setSelectedSubCat(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                <option value="all">All Subcategories ({subCategories.length})</option>
                {subCategories
                  .filter(
                    (s) =>
                      selectedParentCat === "all" || s.parentCategoryId === selectedParentCat
                  )
                  .map((s) => (
                    <option key={s.ruleId} value={s.categoryId}>
                      {s.categoryName} ({s.commissionRate}%)
                    </option>
                  ))}
              </select>

              {/* Filter by Status */}
              <select
                value={ruleStatusFilter}
                onChange={(e) => setRuleStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                <option value="all">Status: All Rules</option>
                <option value="active">Active Rules Only</option>
                <option value="inactive">Inactive Rules Only</option>
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              >
                <option value="name_asc">Sort: Category Name (A–Z)</option>
                <option value="name_desc">Sort: Category Name (Z–A)</option>
                <option value="rate_asc">Sort: Commission % (Low → High)</option>
                <option value="rate_desc">Sort: Commission % (High → Low)</option>
                <option value="date_desc">Sort: Recently Updated</option>
              </select>
            </div>

            {/* Second Toolbar Row: Commission % Range + Expand/Collapse + Reset + Export */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-600">Commission Range (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min %"
                  value={minRateFilter}
                  onChange={(e) => setMinRateFilter(e.target.value)}
                  className="w-20 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                />
                <span className="text-slate-400">–</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max %"
                  value={maxRateFilter}
                  onChange={(e) => setMaxRateFilter(e.target.value)}
                  className="w-20 px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                />

                <button
                  type="button"
                  onClick={resetCategoryFilters}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={expandAllCategories}
                  className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAllCategories}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                >
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={handleExportCategoryRulesCSV}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Rules CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* 6-Column Expandable Category & Subcategory Commission Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-44">1. Level</th>
                  <th className="py-3.5 px-4">2. Category Name</th>
                  <th className="py-3.5 px-4 text-center">3. Commission (%)</th>
                  <th className="py-3.5 px-4 text-center">4. Status</th>
                  <th className="py-3.5 px-4">5. Last Updated</th>
                  <th className="py-3.5 px-4 text-right">6. Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCategoryTree.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No categories or subcategories match your current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCategoryTree.map(({ parent, children }) => {
                    const isExpanded = Boolean(expandedCategoryIds[parent.categoryId]);
                    return (
                      <React.Fragment key={parent.ruleId}>
                        {/* Parent Category Row (Level 1) */}
                        <tr className="bg-white hover:bg-blue-50/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => toggleExpandCategory(parent.categoryId)}
                              className="inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
                            >
                              <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </span>
                              <span>Level 1 · Category</span>
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <div
                              onClick={() => toggleExpandCategory(parent.categoryId)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <span className="font-bold text-sm text-slate-900">
                                {parent.categoryName}
                              </span>
                              {parent.categoryNameBn && (
                                <span className="text-xs text-slate-500">
                                  ({parent.categoryNameBn})
                                </span>
                              )}
                              <span className="text-[11px] text-blue-700 font-semibold">
                                · {children.length} subcategories
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-sm">
                              {parent.commissionRate}%
                            </span>
                            {(parent.effectiveStartDate || parent.effectiveEndDate) && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {parent.effectiveStartDate || "Now"} →{" "}
                                {parent.effectiveEndDate || "Ongoing"}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRuleStatus(parent)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold border cursor-pointer transition-colors ${
                                parent.isActive
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                                  : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {parent.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-mono text-[11px] text-slate-800">
                              {new Date(parent.updatedAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              by {parent.updatedBy || "Super Admin"}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openCreateRuleModal("subcategory", parent.categoryId)
                                }
                                className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                title="Add Subcategory under this Category"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Subcategory</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditRuleModal(parent)}
                                className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Subcategory Rows (Level 2) */}
                        {isExpanded &&
                          children.map((sub) => (
                            <tr
                              key={sub.ruleId}
                              className="bg-slate-50/70 hover:bg-indigo-50/40 transition-colors"
                            >
                              <td className="py-2.5 pl-10 pr-4 text-slate-600 font-medium">
                                <span className="inline-flex items-center gap-1.5 text-[11px] text-indigo-700 font-semibold">
                                  <span>↳ Level 2 · Sub</span>
                                </span>
                              </td>

                              <td className="py-2.5 px-4">
                                <div className="pl-4 border-l-2 border-indigo-300">
                                  <div className="font-semibold text-slate-800">
                                    {sub.categoryName}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    Parent: {parent.categoryName}
                                  </div>
                                </div>
                              </td>

                              <td className="py-2.5 px-4 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold text-xs">
                                  {sub.commissionRate}%
                                </span>
                              </td>

                              <td className="py-2.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleRuleStatus(sub)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border cursor-pointer ${
                                    sub.isActive
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                      : "bg-slate-100 border-slate-300 text-slate-600"
                                  }`}
                                >
                                  {sub.isActive ? "Active" : "Inactive"}
                                </button>
                              </td>

                              <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                                {new Date(sub.updatedAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>

                              <td className="py-2.5 px-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditRuleModal(sub)}
                                    className="px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRule(sub)}
                                    className="p-1 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 cursor-pointer"
                                    title="Delete Subcategory Rule"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: COMMISSION SETTINGS, PRIORITY ORDER & LIVE CALCULATOR
         ===================================================================== */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Global Commission Settings & Priority Form */}
          <form
            onSubmit={handleSaveConfig}
            className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5"
          >
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Global Commission Policy &amp; Calculation Rules
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure fallback rates, percentage guardrails, rule precedence, and eligible
                order amount calculation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Global Default Commission (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.globalDefaultRate}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      globalDefaultRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Minimum Allowed Limit (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.minCommissionPercent}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      minCommissionPercent: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maximum Allowed Limit (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={config.maxCommissionPercent}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      maxCommissionPercent: parseFloat(e.target.value) || 100,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Commission Priority Configuration */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    Single-Rule Commission Priority Hierarchy
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Only the single highest-priority active rule is applied per product item.
                    Multiple rules are never stacked.
                  </p>
                </div>

                <select
                  value={config.sellerOverridePrecedence}
                  onChange={(e) => {
                    const mode = e.target.value as "before_category" | "after_category";
                    setConfig((prev) => ({
                      ...prev,
                      sellerOverridePrecedence: mode,
                      priorityOrder:
                        mode === "before_category"
                          ? [
                              "product_override",
                              "seller_override",
                              "subcategory",
                              "category",
                              "global_default",
                            ]
                          : [
                              "product_override",
                              "subcategory",
                              "category",
                              "seller_override",
                              "global_default",
                            ],
                    }));
                  }}
                  className="px-3 py-1.5 rounded-lg border border-blue-300 bg-white text-xs font-semibold text-blue-900"
                >
                  <option value="before_category">
                    Seller Override takes precedence over Category
                  </option>
                  <option value="after_category">
                    Category / Subcategory takes precedence over Seller
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                {(config.priorityOrder || []).map((step, idx) => {
                  const labels: Record<string, string> = {
                    product_override: "Product Override",
                    seller_override: "Seller Override",
                    subcategory: "Subcategory Rate",
                    category: "Parent Category",
                    global_default: "Global Default",
                  };
                  return (
                    <div
                      key={step}
                      className="p-2.5 rounded-lg bg-white border border-blue-200 text-center"
                    >
                      <div className="text-[10px] font-bold text-blue-600 uppercase">
                        Priority #{idx + 1}
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-0.5">
                        {labels[step] || step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Eligible Order Amount Basis Toggles */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Eligible Commission Calculation Basis
              </h4>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.calculationBasis.deductDiscountBeforeCommission}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      calculationBasis: {
                        ...prev.calculationBasis,
                        deductDiscountBeforeCommission: e.target.checked,
                      },
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Deduct Product Discounts Before Calculating Commission (Recommended)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Calculates commission on net product selling price after promotional discounts.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.calculationBasis.includeShipping}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      calculationBasis: {
                        ...prev.calculationBasis,
                        includeShipping: e.target.checked,
                      },
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Include Delivery / Shipping Charges in Commission Base
                  </div>
                  <div className="text-[11px] text-slate-500">
                    When unchecked (default), shipping fees are excluded from seller commission.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.calculationBasis.includeTax}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      calculationBasis: {
                        ...prev.calculationBasis,
                        includeTax: e.target.checked,
                      },
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Include Tax / VAT in Commission Base
                  </div>
                  <div className="text-[11px] text-slate-500">
                    When unchecked (default), statutory tax is excluded from commission calculation.
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Reason for Change
              </label>
              <input
                type="text"
                value={configReason}
                onChange={(e) => setConfigReason(e.target.value)}
                placeholder="Reason recorded in Commission Change History..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingConfig || isUpdatingRate}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{savingConfig ? "Saving Policy..." : "Save Commission Settings"}</span>
              </button>
            </div>
          </form>

          {/* Right 5 Cols: Interactive Commission Calculation Simulator */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Automatic Commission Calculator Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Test how order amounts and category rules calculate net seller payout.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Category / Subcategory Rule
                </label>
                <select
                  value={calcSelectedRuleId}
                  onChange={(e) => setCalcSelectedRuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900"
                >
                  {rules
                    .filter((r) => r.isActive)
                    .map((r) => (
                      <option key={r.ruleId} value={r.ruleId}>
                        {r.ruleType === "subcategory" ? `↳ ${r.categoryName}` : r.categoryName} (
                        {r.commissionRate}%)
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Selling Price (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calcSellingPrice}
                    onChange={(e) => setCalcSellingPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Amount (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calcDiscount}
                    onChange={(e) => setCalcDiscount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Product Selling Price:</span>
                  <strong className="font-mono text-slate-900">
                    ৳{calcSellingPrice.toLocaleString("en-IN")}
                  </strong>
                </div>
                {calcDiscount > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Promotional Discount:</span>
                    <strong className="font-mono text-rose-600">
                      -৳{calcDiscount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Eligible Commission Base:</span>
                  <strong className="font-mono text-slate-900">
                    ৳{calculatorPreview.eligible.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="flex justify-between text-blue-800">
                  <span>Applicable Commission Rate ({calculatorPreview.ruleName}):</span>
                  <strong className="font-mono">{calculatorPreview.rate}%</strong>
                </div>
                <div className="border-t border-emerald-200 pt-2 flex justify-between text-rose-700 font-bold">
                  <span>Platform Commission:</span>
                  <span className="font-mono">
                    ৳{calculatorPreview.platformCommission.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-900 font-bold text-sm">
                  <span>Seller Amount (Before Other Deductions):</span>
                  <span className="font-mono">
                    ৳{calculatorPreview.netSellerAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: PRODUCT-SPECIFIC & SELLER-SPECIFIC COMMISSION OVERRIDES
         ===================================================================== */}
      {activeTab === "overrides" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Product-Specific &amp; Seller-Specific Commission Overrides
              </h3>
              <p className="text-xs text-slate-500">
                Configure custom commission overrides for specific products or partner sellers with
                optional effective date windows.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openCreateRuleModal("product_override")}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-3.5 h-3.5" />
                <span>+ Product Override</span>
              </button>
              <button
                type="button"
                onClick={() => openCreateRuleModal("seller_override")}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>+ Seller Override</span>
              </button>
            </div>
          </div>

          {overrideRules.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs space-y-2">
              <Store className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">
                No Product or Seller Overrides Configured
              </div>
              <p className="max-w-md mx-auto">
                All products and sellers currently follow the standard Category and Subcategory
                commission hierarchy. Click <strong>+ Product Override</strong> or{" "}
                <strong>+ Seller Override</strong> above to add custom rates.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Override Type</th>
                    <th className="py-3 px-4">Target Product / Seller</th>
                    <th className="py-3 px-4 text-center">Commission (%)</th>
                    <th className="py-3 px-4">Effective Window</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {overrideRules.map((ovr) => (
                    <tr key={ovr.ruleId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {ovr.ruleType === "product_override"
                          ? "Priority #1 · Product Override"
                          : "Priority #2 · Seller Override"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {ovr.targetName || ovr.categoryName}
                        </div>
                        {ovr.targetId && (
                          <div className="text-[11px] font-mono text-slate-500">
                            ID: {ovr.targetId}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-mono font-bold">
                          {ovr.commissionRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {ovr.effectiveStartDate || "Immediate"} →{" "}
                        {ovr.effectiveEndDate || "No Expiry"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRuleStatus(ovr)}
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold border cursor-pointer ${
                            ovr.isActive
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-slate-100 border-slate-300 text-slate-600"
                          }`}
                        >
                          {ovr.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRuleModal(ovr)}
                            className="px-2.5 py-1 rounded border border-blue-200 bg-blue-50 text-blue-700 font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(ovr)}
                            className="p-1.5 rounded border border-rose-200 bg-rose-50 text-rose-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 4: COMMISSION REPORTS, BREAKDOWNS & REFUND/CANCELLATION LEDGER
         ===================================================================== */}
      {activeTab === "reports" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
          {/* Sub-view selector & Date Range Filter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ledger", label: "Order Transaction Ledger" },
                { id: "by_category", label: "Commission by Category" },
                { id: "by_seller", label: "Commission by Seller" },
                { id: "by_product", label: "Commission by Product" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setReportSubView(v.id as ReportSubView)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    reportSubView === v.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(["all", "daily", "weekly", "monthly", "custom"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReportPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer capitalize ${
                    reportPeriod === p
                      ? "bg-blue-50 border-blue-300 text-blue-800"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {p === "all" ? "All Time" : p}
                </button>
              ))}

              {reportPeriod === "custom" && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs"
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="px-2 py-1 rounded border border-slate-300 text-xs"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  const dataToExport = filteredOrders.length > 0 ? filteredOrders : orders;
                  exportDataToExcel(
                    formatCommissionForExcel(dataToExport),
                    "Commission_Analytics_Report",
                    "Commission Ledger"
                  );
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Sub-view 1: Detailed Order Transaction Ledger */}
          {reportSubView === "ledger" && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder="Search Order ID, product, seller..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>

                <select
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800"
                >
                  <option value="all">All Commission Statuses</option>
                  <option value="settled">Settled / Paid</option>
                  <option value="pending">Pending Settlement</option>
                  <option value="reversed">Cancelled / Refunded / Reversed</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-3">Order ID &amp; Date</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3 text-right">Eligible Base</th>
                      <th className="py-3 px-3 text-center">Applied Rate</th>
                      <th className="py-3 px-3 text-right">Platform Commission</th>
                      <th className="py-3 px-3 text-right">Seller Net Earnings</th>
                      <th className="py-3 px-3 text-center">Order &amp; Comm Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredOrders.map((ord) => {
                      const isExpanded = expandedOrderRowId === ord._id;
                      const isReversed =
                        ord.status === "cancelled" ||
                        ord.commissionStatus === "reversed" ||
                        ord.commissionStatus === "refunded";
                      return (
                        <React.Fragment key={ord._id}>
                          <tr className="hover:bg-slate-50">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedOrderRowId(isExpanded ? null : ord._id)
                                  }
                                  className="text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  )}
                                  <span>{ord.orderNumber}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(ord.orderNumber, ord._id)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                  {copiedId === ord._id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {new Date(ord.date).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-900">{ord.memberName}</div>
                              <div className="text-[10px] text-slate-500">
                                Bill Total: ৳{(ord.total || 0).toLocaleString("en-IN")}
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono text-slate-800">
                              ৳{(ord.eligibleAmount ?? ord.total ?? 0).toLocaleString("en-IN")}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold text-[11px]">
                                {ord.commissionRate}%
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold">
                              {isReversed ? (
                                <span className="text-rose-600 line-through">
                                  ৳
                                  {(
                                    ord.originalCommissionAmount ||
                                    ord.commissionAmount ||
                                    0
                                  ).toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-emerald-700">
                                  +৳{(ord.commissionAmount || 0).toLocaleString("en-IN")}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                              ৳{(ord.sellerPayout || 0).toLocaleString("en-IN")}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                  isReversed
                                    ? "bg-rose-50 border-rose-200 text-rose-800"
                                    : ord.commissionStatus === "pending"
                                    ? "bg-amber-50 border-amber-200 text-amber-800"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-800"
                                }`}
                              >
                                {ord.status === "cancelled"
                                  ? "Cancelled / Reversed"
                                  : ord.commissionStatus || "Settled"}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustModalOrder(ord);
                                  setAdjustAction("refunded");
                                  setAdjustRefundAmount(String(ord.total || 0));
                                }}
                                className="px-2.5 py-1 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] cursor-pointer"
                              >
                                Refund / Adjust
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Per-Item Commission Breakdown */}
                          {isExpanded && Array.isArray(ord.items) && ord.items.length > 0 && (
                            <tr className="bg-slate-50">
                              <td colSpan={8} className="p-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                  <div className="text-[11px] font-bold uppercase text-slate-600">
                                    Itemized Commission Snapshot (Preserved at Order Confirmation)
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {ord.items.map((item, i) => (
                                      <div
                                        key={i}
                                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 text-[11px] space-y-1"
                                      >
                                        <div className="font-bold text-slate-900">
                                          {item.productName} (×{item.qty})
                                        </div>
                                        <div className="text-slate-500">
                                          {item.category}
                                          {item.subCategory ? ` / ${item.subCategory}` : ""} ·{" "}
                                          {item.sellerShopName}
                                        </div>
                                        <div className="flex justify-between font-mono pt-1 border-t border-slate-200">
                                          <span>
                                            Rule: {item.appliedRuleLabel} ({item.commissionRate}%)
                                          </span>
                                          <strong className="text-emerald-700">
                                            Comm: ৳{item.commissionAmount}
                                          </strong>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-view 2: Commission by Category */}
          {reportSubView === "by_category" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Items Sold</th>
                    <th className="py-3 px-4 text-right">Gross Sales</th>
                    <th className="py-3 px-4 text-center">Avg Rate</th>
                    <th className="py-3 px-4 text-right">Platform Commission</th>
                    <th className="py-3 px-4 text-right">Seller Net Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categoryBreakdown.map((c) => (
                    <tr key={c.categoryId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.categoryName}</td>
                      <td className="py-3 px-4 text-center font-mono">{c.itemsSold}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        ৳{c.grossSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                        {c.avgCommissionRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ৳{c.commissionAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        ৳{c.sellerEarnings.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-view 3: Commission by Seller */}
          {reportSubView === "by_seller" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Seller Storefront</th>
                    <th className="py-3 px-4 text-center">Items Sold</th>
                    <th className="py-3 px-4 text-right">Gross Product Sales</th>
                    <th className="py-3 px-4 text-right">Platform Commission</th>
                    <th className="py-3 px-4 text-right">Seller Net Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sellerBreakdown.map((s) => (
                    <tr key={s.sellerId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.sellerShopName}</td>
                      <td className="py-3 px-4 text-center font-mono">{s.itemsSold}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        ৳{s.grossSales.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ৳{s.commissionAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ৳{s.sellerEarnings.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sub-view 4: Commission by Product */}
          {reportSubView === "by_product" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-center">Applied Rate</th>
                    <th className="py-3 px-4 text-right">Platform Commission</th>
                    <th className="py-3 px-4 text-right">Seller Net Earnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {productBreakdown.map((p) => (
                    <tr key={p.productId} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.productName}</td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 text-slate-600">{p.sellerShopName}</td>
                      <td className="py-3 px-4 text-center font-mono">{p.unitsSold}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-blue-700">
                        {p.appliedRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                        ৳{p.commissionAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-800">
                        ৳{p.sellerEarnings.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 5: COMMISSION CHANGE AUDIT HISTORY & PLATFORM WALLET WITHDRAWALS
         ===================================================================== */}
      {activeTab === "audit" && (
        <div className="space-y-6">
          {/* Immutable Commission Change History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Immutable Commission Change Audit History
              </h3>
              <p className="text-xs text-slate-500">
                Every commission rule creation, percentage update, status toggle, or refund
                adjustment is permanently recorded with admin identity and reason.
              </p>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No commission rate modifications recorded yet. Edit any category or subcategory
                commission rate to generate an audit record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-4">Date &amp; Time</th>
                      <th className="py-3 px-4">Admin</th>
                      <th className="py-3 px-4">Affected Category / Target</th>
                      <th className="py-3 px-4 text-center">Previous %</th>
                      <th className="py-3 px-4 text-center">New %</th>
                      <th className="py-3 px-4">Reason for Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {auditLogs.map((log) => (
                      <tr key={log.auditId} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          {new Date(log.createdAt).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{log.adminName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {log.adminEmail}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900">{log.targetName}</span>
                          <span className="ml-1.5 text-[10px] uppercase text-blue-700 font-semibold">
                            ({log.targetType})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-slate-500">
                          {log.previousRate !== null ? `${log.previousRate}%` : "—"}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                          {log.newRate !== null ? `${log.newRate}%` : "Deleted"}
                        </td>
                        <td className="py-3 px-4 text-slate-700">{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Platform Withdrawal History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Platform Wallet Withdrawal History
                </h3>
                <p className="text-xs text-slate-500">
                  Total Disbursed: ৳{totalWithdrawn.toLocaleString("en-IN")} · Available Wallet
                  Balance: ৳{runningBalance.toLocaleString("en-IN")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenWithdrawModal}
                disabled={runningBalance <= 0}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <ArrowDownToLine className="w-3.5 h-3.5" />
                <span>Withdraw Platform Funds</span>
              </button>
            </div>

            {withdrawals.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No platform wallet withdrawals recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4">Purpose / Note</th>
                      <th className="py-3 px-4">Authorized By</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {withdrawals.map((w) => (
                      <tr key={w._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {new Date(w.date).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                          -৳{Number(w.amount).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {w.note || "Platform commission disbursement"}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {w.adminName} ({w.adminEmail})
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                            {w.status || "Completed"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: CREATE / EDIT COMMISSION RULE
         ===================================================================== */}
      {ruleModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => !savingRule && setRuleModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingRule
                    ? `Edit Commission Rule: ${editingRule.categoryName}`
                    : `Create New Commission Rule`}
                </h3>
                <p className="text-xs text-slate-500">
                  Changes are logged in the Commission Change Audit History.
                </p>
              </div>
              <GlassCloseButton onClick={() => setRuleModalOpen(false)} size="sm" />
            </div>

            <form onSubmit={handleSaveRuleForm} className="space-y-3.5 text-xs">
              {!editingRule && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rule Type</label>
                  <select
                    value={formRuleType}
                    onChange={(e) => setFormRuleType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="category">Level 1 · Parent Category Commission</option>
                    <option value="subcategory">Level 2 · Subcategory Commission</option>
                    <option value="product_override">Priority #1 · Product-Specific Override</option>
                    <option value="seller_override">Priority #2 · Seller-Specific Override</option>
                  </select>
                </div>
              )}

              {formRuleType === "subcategory" && !editingRule && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parent Category *</label>
                  <select
                    value={formParentCategoryId}
                    onChange={(e) => setFormParentCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    required
                  >
                    {parentCategories.map((p) => (
                      <option key={p.categoryId} value={p.categoryId}>
                        {p.categoryName} ({p.commissionRate}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formRuleType === "product_override" && !editingRule && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Product *</label>
                  {products.length > 0 ? (
                    <select
                      value={formTargetId}
                      onChange={(e) => {
                        const p = products.find(
                          (item) => String(item._id || item.id) === e.target.value
                        );
                        setFormTargetId(e.target.value);
                        if (p) setFormTargetName(p.name);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                      required
                    >
                      <option value="">-- Choose a product --</option>
                      {products.slice(0, 100).map((p) => (
                        <option key={String(p._id || p.id)} value={String(p._id || p.id)}>
                          {p.name} (৳{p.price})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formTargetName}
                      onChange={(e) => {
                        setFormTargetName(e.target.value);
                        setFormTargetId(e.target.value);
                      }}
                      placeholder="Enter Product ID or Name"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      required
                    />
                  )}
                </div>
              )}

              {formRuleType === "seller_override" && !editingRule && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Seller *</label>
                  {sellers.length > 0 ? (
                    <select
                      value={formTargetId}
                      onChange={(e) => {
                        const s = sellers.find((item) => String(item._id) === e.target.value);
                        setFormTargetId(e.target.value);
                        if (s) setFormTargetName(s.shopName || s.storefront);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                      required
                    >
                      <option value="">-- Choose a seller --</option>
                      {sellers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.shopName || s.storefront} ({s.ownerName})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formTargetName}
                      onChange={(e) => {
                        setFormTargetName(e.target.value);
                        setFormTargetId(e.target.value);
                      }}
                      placeholder="Enter Seller Shop Name or ID"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                      required
                    />
                  )}
                </div>
              )}

              {(formRuleType === "category" || formRuleType === "subcategory" || editingRule) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category / Subcategory Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formCategoryName}
                      onChange={(e) => setFormCategoryName(e.target.value)}
                      placeholder="e.g. Smartphones & Tablets"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Bengali Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={formCategoryNameBn}
                      onChange={(e) => setFormCategoryNameBn(e.target.value)}
                      placeholder="যেমন: স্মার্টফোন ও ট্যাবলেট"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Commission Rate (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    value={formRate}
                    onChange={(e) => setFormRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-blue-400 bg-blue-50/30 font-mono font-bold text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Cap (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinAmount}
                    onChange={(e) => setFormMinAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Max Cap (৳, 0=None)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formMaxAmount}
                    onChange={(e) => setFormMaxAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Effective Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Effective End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Change (Audit Log) *
                </label>
                <input
                  type="text"
                  required
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  placeholder="e.g. Seasonal rate adjustment approved by Finance Admin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <label className="inline-flex items-center gap-2 font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <span>Rule is Active</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRule}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingRule ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 2: ORDER REFUND / CANCELLATION COMMISSION ADJUSTMENT
         ===================================================================== */}
      {adjustModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => !submittingAdjust && setAdjustModalOrder(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Order Commission Reconciliation
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{adjustModalOrder.orderNumber} · Original Commission: ৳
                  {adjustModalOrder.originalCommissionAmount || adjustModalOrder.commissionAmount}
                </p>
              </div>
              <GlassCloseButton onClick={() => setAdjustModalOrder(null)} size="sm" />
            </div>

            <form onSubmit={handleAdjustOrderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Financial Event / Resolution
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                >
                  <option value="refunded">Full Return / Full Refund (Reverse 100% Commission)</option>
                  <option value="partially_refunded">
                    Partial Refund (Proportional Commission Reversal)
                  </option>
                  <option value="cancelled">
                    Order Cancelled / Rejected (Reverse Commission)
                  </option>
                  <option value="delivered">Mark Delivered &amp; Settled</option>
                </select>
              </div>

              {adjustAction === "partially_refunded" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Refunded Order Amount (৳) — Order Total: ৳{adjustModalOrder.total}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={adjustModalOrder.total}
                    required
                    value={adjustRefundAmount}
                    onChange={(e) => setAdjustRefundAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Reason *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalOrder(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdjust}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {submittingAdjust ? "Processing..." : "Apply Commission Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 3: PLATFORM WALLET WITHDRAWAL MODAL
         ===================================================================== */}
      {isWithdrawModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => !isSubmittingWithdraw && setIsWithdrawModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Withdraw Platform Funds</h3>
                <p className="text-xs text-slate-500">
                  Available Balance: ৳{runningBalance.toLocaleString("en-IN")}
                </p>
              </div>
              <GlassCloseButton onClick={() => setIsWithdrawModalOpen(false)} size="sm" />
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amount to Withdraw (৳) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={runningBalance}
                  required
                  value={withdrawAmountInput}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Note / Purpose</label>
                <input
                  type="text"
                  value={withdrawNote}
                  onChange={(e) => setWithdrawNote(e.target.value)}
                  placeholder="e.g. Monthly treasury transfer"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
              {withdrawError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {withdrawError}
                </div>
              )}
              {withdrawSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {withdrawSuccessMsg}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {isSubmittingWithdraw ? "Processing..." : "Confirm Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionWallet;
