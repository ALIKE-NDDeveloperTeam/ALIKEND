import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  RotateCcw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  Tag,
  Copy,
  Sliders,
  Send,
  Lock,
  ArrowRight,
  ClipboardList,
  Camera,
  Boxes,
  Percent,
  Settings,
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";

export type ReturnStatus =
  | "Requested"
  | "Under Review"
  | "Approved"
  | "Pickup Scheduled"
  | "Picked Up"
  | "In Transit"
  | "Received"
  | "Inspection in Progress"
  | "Refund Pending"
  | "Completed"
  | "Rejected"
  | "Cancelled";

export interface ReturnRequestItem {
  _id: string;
  returnId: string;
  orderNumber: string;
  orderId?: any;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productId?: any;
  productName: string;
  productImage?: string;
  variant?: string;
  size?: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  purchaseDate?: string | Date;
  deliveryDate?: string | Date;
  returnReason: string;
  customerDescription: string;
  evidenceImages: string[];
  requestedResolution: "refund" | "replacement" | "exchange";
  status: ReturnStatus;
  assignedStaff?: {
    id?: string;
    name?: string;
    email?: string;
  };
  courierName?: string;
  trackingNumber?: string;
  pickupScheduledDate?: string | Date;
  pickupCompletedDate?: string | Date;
  inspectionResult?: "pending" | "resalable" | "damaged" | "defective";
  inspectionNotes?: string;
  restocked: boolean;
  refundMethod?: "original_payment" | "wallet" | "cod_manual";
  refundAmount: number;
  refundDeduction: number;
  refundDeductionReason?: string;
  refundTransactionRef?: string;
  refundStatus: "pending" | "processed" | "failed" | "not_applicable";
  rejectionReason?: string;
  internalNotes: Array<{
    id: string;
    author: string;
    note: string;
    createdAt: string | Date;
  }>;
  auditLog: Array<{
    action: string;
    performedBy: string;
    timestamp: string | Date;
    notes?: string;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ReturnStats {
  total: number;
  requested: number;
  approved: number;
  rejected: number;
  pickupScheduled: number;
  inTransit: number;
  received: number;
  refundPending: number;
  completed: number;
}

interface ReturnOrdersManagementProps {
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

const STATUS_COLOR_MAP: Record<ReturnStatus, { bg: string; text: string; border: string }> = {
  Requested: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  "Under Review": { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  Approved: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  "Pickup Scheduled": { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  "Picked Up": { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  "In Transit": { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  Received: { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  "Inspection in Progress": { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  "Refund Pending": { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  Completed: { bg: "bg-emerald-600/15", text: "text-emerald-400 font-bold", border: "border-emerald-600/30" },
  Rejected: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/20" },
  Cancelled: { bg: "bg-neutral-500/10", text: "text-neutral-400", border: "border-neutral-500/20" },
};

export default function ReturnOrdersManagement({
  onShowToast,
  isSuperAdmin,
}: ReturnOrdersManagementProps) {
  // Main state
  const [returnsList, setReturnsList] = useState<ReturnRequestItem[]>([]);
  const [stats, setStats] = useState<ReturnStats>({
    total: 0,
    requested: 0,
    approved: 0,
    rejected: 0,
    pickupScheduled: 0,
    inTransit: 0,
    received: 0,
    refundPending: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedResolution, setSelectedResolution] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Active Return Detail Modal
  const [activeReturn, setActiveReturn] = useState<ReturnRequestItem | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "inspection" | "refund" | "notes" | "audit">("details");

  // Review / Decision Modal (Approve or Reject)
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<"approve" | "reject">("approve");
  const [reviewReason, setReviewReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ReturnStatus>("Under Review");
  const [statusCourier, setStatusCourier] = useState("");
  const [statusTracking, setStatusTracking] = useState("");
  const [statusPickupDate, setStatusPickupDate] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Inspection Modal
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);
  const [inspectionOutcome, setInspectionOutcome] = useState<"resalable" | "damaged" | "defective">("resalable");
  const [inspectionNotesText, setInspectionNotesText] = useState("");
  const [restockStockCheck, setRestockStockCheck] = useState(true);
  const [submittingInspection, setSubmittingInspection] = useState(false);

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundMethodType, setRefundMethodType] = useState<"wallet" | "original_payment" | "cod_manual">("wallet");
  const [refundDeductionAmt, setRefundDeductionAmt] = useState<number>(0);
  const [refundDeductionReason, setRefundDeductionReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Internal Note form
  const [newInternalNote, setNewInternalNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Return Policy Settings Modal
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [policyData, setPolicyData] = useState<any>({
    eligibilityDays: 7,
    autoApprovalEnabled: false,
    requireEvidenceImages: true,
    inspectionRequiredForRefund: true,
    allowReturnForDiscountedItems: false,
    eligibleCategories: ["Fashion & Apparel", "Luxury Watches", "Fine Jewelry", "Leather Goods", "Footwear", "Accessories"],
    ineligibleCategories: ["Underwear & Intimates", "Fragrances & Perfumes", "Custom Engraved Items", "Clearance Items"],
    defaultRestockFeePercent: 0,
    acceptedReasons: [
      "Damaged on Delivery",
      "Defective or Not Working",
      "Wrong Item Delivered",
      "Item Does Not Match Description",
      "Size / Fit Issue",
      "Quality Not as Expected",
      "Changed Mind / Buyer Remorse",
    ],
  });
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Body scroll lock on modal open
  useEffect(() => {
    const isAnyModalOpen =
      Boolean(activeReturn) ||
      reviewModalOpen ||
      statusModalOpen ||
      inspectionModalOpen ||
      refundModalOpen ||
      policyModalOpen;

    if (isAnyModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [
    activeReturn,
    reviewModalOpen,
    statusModalOpen,
    inspectionModalOpen,
    refundModalOpen,
    policyModalOpen,
  ]);

  // Load returns and stats from backend
  const loadData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [statsRes, returnsRes] = await Promise.all([
        adminApi.getReturnStats().catch(() => null),
        adminApi
          .getReturns({
            status: selectedStatus,
            resolution: selectedResolution,
            search: searchQuery,
          })
          .catch(() => []),
      ]);

      if (statsRes) {
        setStats(statsRes);
      }
      setReturnsList(Array.isArray(returnsRes) ? returnsRes : returnsRes?.items || []);
    } catch (err: any) {
      console.error("Failed to load return orders:", err);
      onShowToast(err.message || "Failed to load returns list", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedResolution]);

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Policy
  const handleOpenPolicyModal = async () => {
    try {
      const res = await adminApi.getReturnPolicy().catch(() => null);
      if (res) {
        setPolicyData(res);
      }
      setPolicyModalOpen(true);
    } catch (err: any) {
      onShowToast(err.message || "Failed to load policy", "error");
    }
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPolicy(true);
      await adminApi.updateReturnPolicy(policyData);
      onShowToast("Return Policy configuration saved successfully.", "success");
      setPolicyModalOpen(false);
    } catch (err: any) {
      onShowToast(err.message || "Failed to save return policy", "error");
    } finally {
      setSavingPolicy(false);
    }
  };

  // Open Full Detail Modal
  const handleOpenDetail = async (ret: ReturnRequestItem) => {
    try {
      const full = await adminApi.getReturnDetail(ret._id || ret.returnId).catch(() => ret);
      setActiveReturn(full || ret);
      setActiveTab("details");
    } catch {
      setActiveReturn(ret);
      setActiveTab("details");
    }
  };

  // Review (Approve/Reject)
  const handleOpenReviewModal = (ret: ReturnRequestItem, decision: "approve" | "reject") => {
    setActiveReturn(ret);
    setReviewDecision(decision);
    setReviewReason("");
    setReviewNotes("");
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn) return;

    try {
      setSubmittingReview(true);
      const res = await adminApi.reviewReturn(activeReturn._id || activeReturn.returnId, {
        decision: reviewDecision,
        reason: reviewReason,
        notes: reviewNotes,
      });

      onShowToast(
        reviewDecision === "approve"
          ? `Return ${activeReturn.returnId} approved successfully.`
          : `Return ${activeReturn.returnId} rejected with reason logged.`,
        "success"
      );
      setReviewModalOpen(false);
      loadData(true);
      if (res?.returnRequest) {
        setActiveReturn(res.returnRequest);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to submit review decision", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Status Change Workflow
  const handleOpenStatusModal = (ret: ReturnRequestItem) => {
    setActiveReturn(ret);
    setNewStatus(ret.status);
    setStatusCourier(ret.courierName || "DHL Express Luxury Courier");
    setStatusTracking(ret.trackingNumber || "");
    setStatusPickupDate(
      ret.pickupScheduledDate
        ? new Date(ret.pickupScheduledDate).toISOString().slice(0, 10)
        : new Date(Date.now() + 86400000).toISOString().slice(0, 10)
    );
    setStatusNotes("");
    setStatusModalOpen(true);
  };

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn) return;

    try {
      setSubmittingStatus(true);
      const res = await adminApi.updateReturnStatus(activeReturn._id || activeReturn.returnId, {
        status: newStatus,
        courierName: statusCourier,
        trackingNumber: statusTracking,
        pickupScheduledDate: statusPickupDate,
        notes: statusNotes,
      });

      onShowToast(`Status transitioned to "${newStatus}" successfully.`, "success");
      setStatusModalOpen(false);
      loadData(true);
      if (res?.returnRequest) {
        setActiveReturn(res.returnRequest);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to update return workflow status", "error");
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Inspection
  const handleOpenInspectionModal = (ret: ReturnRequestItem) => {
    setActiveReturn(ret);
    setInspectionOutcome(ret.inspectionResult === "pending" || !ret.inspectionResult ? "resalable" : (ret.inspectionResult as any));
    setInspectionNotesText(ret.inspectionNotes || "Verified authentic, seals intact, luxury packaging unaltered.");
    setRestockStockCheck(true);
    setInspectionModalOpen(true);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn) return;

    try {
      setSubmittingInspection(true);
      const res = await adminApi.recordInspection(activeReturn._id || activeReturn.returnId, {
        inspectionResult: inspectionOutcome,
        inspectionNotes: inspectionNotesText,
        restock: restockStockCheck && inspectionOutcome === "resalable",
      });

      onShowToast(
        `Inspection outcome "${inspectionOutcome}" recorded.${
          restockStockCheck && inspectionOutcome === "resalable" ? " Inventory restocked in catalog." : ""
        }`,
        "success"
      );
      setInspectionModalOpen(false);
      loadData(true);
      if (res?.returnRequest) {
        setActiveReturn(res.returnRequest);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to record item inspection", "error");
    } finally {
      setSubmittingInspection(false);
    }
  };

  // Refund
  const handleOpenRefundModal = (ret: ReturnRequestItem) => {
    setActiveReturn(ret);
    setRefundMethodType(ret.refundMethod || (ret.orderNumber.startsWith("COD") ? "cod_manual" : "wallet"));
    setRefundDeductionAmt(ret.refundDeduction || 0);
    setRefundDeductionReason(ret.refundDeductionReason || "");
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn) return;

    try {
      setSubmittingRefund(true);
      const res = await adminApi.processReturnRefund(activeReturn._id || activeReturn.returnId, {
        refundMethod: refundMethodType,
        refundDeduction: Number(refundDeductionAmt) || 0,
        refundDeductionReason,
      });

      onShowToast(
        `Refund of ₹${(res?.refundAmount || activeReturn.refundAmount).toLocaleString("en-IN")} processed via ${
          refundMethodType === "wallet" ? "Store Wallet" : refundMethodType === "cod_manual" ? "COD Direct Refund" : "Original Payment Method"
        }.`,
        "success"
      );
      setRefundModalOpen(false);
      loadData(true);
      if (res?.returnRequest) {
        setActiveReturn(res.returnRequest);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to process refund", "error");
    } finally {
      setSubmittingRefund(false);
    }
  };

  // Add Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn || !newInternalNote.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await adminApi.addReturnNote(activeReturn._id || activeReturn.returnId, newInternalNote.trim());
      onShowToast("Internal note appended to return dossier.", "success");
      setNewInternalNote("");
      if (res?.notes) {
        setActiveReturn({
          ...activeReturn,
          internalNotes: res.notes,
        });
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to append internal note", "error");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(returnsList.length / pageSize) || 1;
  const paginatedReturns = useMemo(() => {
    const start = (page - 1) * pageSize;
    return returnsList.slice(start, start + pageSize);
  }, [returnsList, page]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ========================================================================= */}
      {/* 1. HEADER & TOP CONTROLS */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#141B2D] p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>রিটার্ন অর্ডার ম্যানেজমেন্ট (Return Orders)</span>
                <span className="text-[10px] font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  ENTERPRISE RMA
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                End-to-end Reverse Logistics, Inspection Verification, Inventory Restock & Payment Refunds
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleOpenPolicyModal}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-neutral-700"
          >
            <Settings className="w-4 h-4 text-amber-500" />
            <span>Return Policy Settings</span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUMMARY CARDS (KPIs) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Returns */}
        <div
          onClick={() => {
            setSelectedStatus("all");
            setPage(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/30"
              : "bg-white dark:bg-[#141B2D] border-neutral-200 dark:border-neutral-800 hover:border-slate-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-500 dark:text-neutral-400">Total Returns</span>
            <Boxes className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black">{stats.total}</div>
          <div className="text-[10px] mt-1 text-slate-400">All submitted requests</div>
        </div>

        {/* New / Under Review */}
        <div
          onClick={() => {
            setSelectedStatus("Requested");
            setPage(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === "Requested"
              ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-500/30 font-black"
              : "bg-white dark:bg-[#141B2D] border-neutral-200 dark:border-neutral-800 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Awaiting Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.requested}</div>
          <div className="text-[10px] mt-1 text-slate-400">Requires triage action</div>
        </div>

        {/* Approved Returns */}
        <div
          onClick={() => {
            setSelectedStatus("Approved");
            setPage(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === "Approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30"
              : "bg-white dark:bg-[#141B2D] border-neutral-200 dark:border-neutral-800 hover:border-emerald-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Approved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.approved}</div>
          <div className="text-[10px] mt-1 text-slate-400">Ready for pickup</div>
        </div>

        {/* In Transit / Pickup */}
        <div
          onClick={() => {
            setSelectedStatus("In Transit");
            setPage(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === "In Transit"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30"
              : "bg-white dark:bg-[#141B2D] border-neutral-200 dark:border-neutral-800 hover:border-indigo-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-indigo-500">In Transit & Courier</span>
            <Truck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-500">{stats.inTransit + stats.pickupScheduled}</div>
          <div className="text-[10px] mt-1 text-slate-400">En route to warehouse</div>
        </div>

        {/* Received / Inspection */}
        <div
          onClick={() => {
            setSelectedStatus("Received");
            setPage(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedStatus === "Received"
              ? "bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/30"
              : "bg-white dark:bg-[#141B2D] border-neutral-200 dark:border-neutral-800 hover:border-teal-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-teal-500">Inspection Pending</span>
            <ClipboardList className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-500">{stats.received}</div>
          <div className="text-[10px] mt-1 text-slate-400">At inspection station</div>
        </div>
      </div>

      {/* Second row of quick KPI mini-indicators */}
      <div className="grid grid-cols-3 gap-3.5">
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-yellow-800 dark:text-yellow-400 uppercase font-mono">
              Pending Refunds
            </div>
            <div className="text-lg font-black text-yellow-900 dark:text-yellow-300">{stats.refundPending} Orders</div>
          </div>
          <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase font-mono">
              Completed & Settled
            </div>
            <div className="text-lg font-black text-emerald-900 dark:text-emerald-300">{stats.completed} Returns</div>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-800 dark:text-rose-400 uppercase font-mono">
              Rejected Requests
            </div>
            <div className="text-lg font-black text-rose-900 dark:text-rose-300">{stats.rejected} Declined</div>
          </div>
          <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR & FILTERS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#141B2D] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Return ID (RET-), Order #, Customer Name, Email, or Product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 pr-8"
              >
                <option value="all">All Statuses</option>
                <option value="Requested">Requested</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Pickup Scheduled">Pickup Scheduled</option>
                <option value="Picked Up">Picked Up</option>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received</option>
                <option value="Inspection in Progress">Inspection in Progress</option>
                <option value="Refund Pending">Refund Pending</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Resolution Filter */}
            <div className="relative">
              <select
                value={selectedResolution}
                onChange={(e) => {
                  setSelectedResolution(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 pr-8"
              >
                <option value="all">All Resolutions</option>
                <option value="refund">Refund</option>
                <option value="replacement">Replacement</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RETURNS TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#141B2D] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-slate-50/75 dark:bg-neutral-900/50 text-slate-600 dark:text-neutral-400 font-mono uppercase text-[11px]">
                <th className="py-3.5 px-4 font-bold">Return ID & Order</th>
                <th className="py-3.5 px-4 font-bold">Customer</th>
                <th className="py-3.5 px-4 font-bold">Product & Reason</th>
                <th className="py-3.5 px-4 font-bold text-center">Resolution</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Amount</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                    <span>Loading return requests database...</span>
                  </td>
                </tr>
              ) : paginatedReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
                    <div className="font-semibold text-slate-700 dark:text-neutral-300">No return requests found</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      {searchQuery || selectedStatus !== "all"
                        ? "Try adjusting your search filters"
                        : "When customers request returns, they will appear here."}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((r) => {
                  const statusConfig = STATUS_COLOR_MAP[r.status] || {
                    bg: "bg-neutral-500/10",
                    text: "text-neutral-400",
                    border: "border-neutral-500/20",
                  };

                  return (
                    <tr
                      key={r._id || r.returnId}
                      className="hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      {/* Return ID & Order */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 dark:text-white">
                          <span>{r.returnId}</span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(r.returnId);
                              onShowToast("Return ID copied to clipboard", "info");
                            }}
                            className="text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200 cursor-pointer"
                            title="Copy ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-neutral-400 font-mono mt-0.5">
                          Order: <span className="text-amber-600 dark:text-amber-400 font-semibold">{r.orderNumber}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{r.customerName}</div>
                        <div className="text-[11px] text-neutral-500 font-mono">{r.customerEmail}</div>
                        {r.customerPhone && (
                          <div className="text-[10px] text-neutral-400 font-mono">{r.customerPhone}</div>
                        )}
                      </td>

                      {/* Product & Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          {r.productImage ? (
                            <img
                              src={r.productImage}
                              alt={r.productName}
                              className="w-9 h-9 rounded-lg object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-neutral-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 dark:text-neutral-200 truncate" title={r.productName}>
                              {r.productName}
                            </div>
                            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">
                              Reason: {r.returnReason}
                            </div>
                            {(r.variant || r.size || r.color) && (
                              <div className="text-[10px] text-neutral-400">
                                Variant: {r.size || r.color || r.variant} (Qty: {r.quantity})
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Requested Resolution */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            r.requestedResolution === "refund"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : r.requestedResolution === "replacement"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                              : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
                          }`}
                        >
                          {r.requestedResolution}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{r.status}</span>
                        </span>
                        {r.assignedStaff?.name && (
                          <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{r.assignedStaff.name}</span>
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{((r.unitPrice || 0) * (r.quantity || 1)).toLocaleString("en-IN")}
                        </div>
                        {r.refundStatus === "processed" ? (
                          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Refunded
                          </div>
                        ) : r.refundStatus === "pending" ? (
                          <div className="text-[10px] text-amber-500">Refund Pending</div>
                        ) : null}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(r)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                            title="View Full Return Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>

                          {/* Quick Decision if Requested */}
                          {(r.status === "Requested" || r.status === "Under Review") && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReviewModal(r, "approve")}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 cursor-pointer"
                                title="Approve Return"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenReviewModal(r, "reject")}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 cursor-pointer"
                                title="Reject Return"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {/* Workflow button */}
                          <button
                            type="button"
                            onClick={() => handleOpenStatusModal(r)}
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 dark:text-indigo-300 cursor-pointer"
                            title="Update Status / Courier"
                          >
                            <Truck className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 text-xs text-slate-500">
            <div>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, returnsList.length)} of{" "}
              {returnsList.length} returns
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-mono font-bold text-slate-900 dark:text-white">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. FULL RETURN DOSSIER MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {activeReturn && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setActiveReturn(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Return Request {activeReturn.returnId}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        STATUS_COLOR_MAP[activeReturn.status]?.bg || ""
                      } ${STATUS_COLOR_MAP[activeReturn.status]?.text || ""} ${
                        STATUS_COLOR_MAP[activeReturn.status]?.border || ""
                      }`}
                    >
                      {activeReturn.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 font-mono">
                    Order Ref: #{activeReturn.orderNumber} • Submitted on{" "}
                    {new Date(activeReturn.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReturn(null)}
                  className="p-2 rounded-xl text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Ribbon */}
            <div className="bg-slate-100 dark:bg-neutral-800/80 px-5 py-2.5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-600 dark:text-neutral-300">Quick Actions:</span>
                {(activeReturn.status === "Requested" || activeReturn.status === "Under Review") && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(activeReturn, "approve")}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Check className="w-3 h-3" /> Approve Request
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(activeReturn, "reject")}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Reject Request
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenStatusModal(activeReturn)}
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Truck className="w-3 h-3" /> Update Status & Courier
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenInspectionModal(activeReturn)}
                  className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <ClipboardList className="w-3 h-3" /> Inspect & Restock
                </button>

                {activeReturn.status !== "Rejected" && activeReturn.refundStatus !== "processed" && (
                  <button
                    type="button"
                    onClick={() => handleOpenRefundModal(activeReturn)}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <DollarSign className="w-3 h-3" /> Process Refund
                  </button>
                )}
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800 px-5 gap-4 bg-white dark:bg-neutral-900 text-xs font-bold">
              {[
                { id: "details", label: "Return Overview", icon: Eye },
                { id: "inspection", label: "Item Inspection", icon: ClipboardList },
                { id: "refund", label: "Financial Settlement", icon: DollarSign },
                { id: "notes", label: `Staff Notes (${activeReturn.internalNotes?.length || 0})`, icon: FileText },
                { id: "audit", label: `Audit Trail (${activeReturn.auditLog?.length || 0})`, icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "border-rose-500 text-rose-600 dark:text-rose-400 font-black"
                        : "border-transparent text-neutral-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Two column layout: Item info vs Customer info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Item Information Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-neutral-400">
                        Item For Return
                      </div>
                      <div className="flex items-start gap-3">
                        {activeReturn.productImage ? (
                          <img
                            src={activeReturn.productImage}
                            alt={activeReturn.productName}
                            className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                            <Package className="w-8 h-8 text-neutral-400" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {activeReturn.productName}
                          </h4>
                          <div className="text-neutral-500 mt-1 font-mono">
                            Qty: <span className="font-bold text-slate-900 dark:text-white">{activeReturn.quantity}</span> • Unit Price:{" "}
                            <span className="font-bold text-slate-900 dark:text-white">
                              ₹{(activeReturn.unitPrice || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          {(activeReturn.size || activeReturn.color || activeReturn.variant) && (
                            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                              Variant/Size: {activeReturn.size || activeReturn.color || activeReturn.variant}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-neutral-400">Total Item Value:</span>
                          <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                            ₹{((activeReturn.unitPrice || 0) * (activeReturn.quantity || 1)).toLocaleString("en-IN")}
                          </div>
                        </div>
                        <div>
                          <span className="text-neutral-400">Requested Resolution:</span>
                          <div className="font-bold text-rose-600 dark:text-rose-400 uppercase font-mono">
                            {activeReturn.requestedResolution}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="text-[11px] font-mono font-bold uppercase text-slate-500 dark:text-neutral-400">
                        Customer Account Details
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {activeReturn.customerName}
                        </div>
                        <div className="text-neutral-500 font-mono">{activeReturn.customerEmail}</div>
                        {activeReturn.customerPhone && (
                          <div className="text-neutral-500 font-mono">{activeReturn.customerPhone}</div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-400">Original Order:</span>
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                            #{activeReturn.orderNumber}
                          </span>
                        </div>
                        {activeReturn.deliveryDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Delivered On:</span>
                            <span className="font-mono">
                              {new Date(activeReturn.deliveryDate).toLocaleDateString("en-IN")}
                            </span>
                          </div>
                        )}
                        {activeReturn.assignedStaff?.name && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-400">Assigned Agent:</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {activeReturn.assignedStaff.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Return Reason & Customer Description */}
                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200/80 dark:border-rose-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 dark:text-rose-400 uppercase font-mono text-[11px]">
                        Stated Return Reason
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                        {activeReturn.returnReason}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-rose-100 dark:border-rose-950 text-slate-800 dark:text-neutral-200 leading-relaxed text-xs">
                      {activeReturn.customerDescription || "No additional description provided by customer."}
                    </div>
                  </div>

                  {/* Uploaded Evidence Gallery */}
                  <div>
                    <h5 className="font-mono font-bold text-slate-600 dark:text-neutral-400 uppercase text-[11px] mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-amber-500" />
                      <span>Customer Uploaded Evidence / Photos ({activeReturn.evidenceImages?.length || 0})</span>
                    </h5>

                    {activeReturn.evidenceImages && activeReturn.evidenceImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {activeReturn.evidenceImages.map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-square block bg-neutral-100"
                          >
                            <img
                              src={img}
                              alt={`Evidence photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <ExternalLink className="w-5 h-5" />
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center text-neutral-400 text-xs">
                        No photographic evidence uploaded with this request.
                      </div>
                    )}
                  </div>

                  {/* Courier & Tracking Details */}
                  {(activeReturn.courierName || activeReturn.trackingNumber || activeReturn.pickupScheduledDate) && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
                      <div className="font-bold text-indigo-900 dark:text-indigo-400 uppercase font-mono text-[11px] flex items-center gap-1.5">
                        <Truck className="w-4 h-4" />
                        <span>Reverse Logistics Courier & Tracking</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Carrier / Courier:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {activeReturn.courierName || "Standard Dispatch"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Waybill / Tracking:</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {activeReturn.trackingNumber || "Pending generation"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[10px]">Pickup Date:</span>
                          <span className="font-mono">
                            {activeReturn.pickupScheduledDate
                              ? new Date(activeReturn.pickupScheduledDate).toLocaleDateString("en-IN")
                              : "Not scheduled yet"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INSPECTION & INVENTORY RESTOCK */}
              {activeTab === "inspection" && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-teal-500" />
                        <span>Warehouse Inspection Assessment</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleOpenInspectionModal(activeReturn)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
                      >
                        Record / Update Inspection
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Inspection Result</span>
                        <div className="font-bold text-sm capitalize mt-1 text-slate-900 dark:text-white">
                          {activeReturn.inspectionResult || "Pending Arrival"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Catalog Stock Restock</span>
                        <div className="font-bold text-sm mt-1">
                          {activeReturn.restocked ? (
                            <span className="text-emerald-500 flex items-center gap-1">
                              <Check className="w-4 h-4" /> Restocked into sellable inventory
                            </span>
                          ) : (
                            <span className="text-neutral-400">Not restocked (Damaged/Defective or Pending)</span>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Assessor</span>
                        <div className="font-bold text-sm mt-1 text-slate-900 dark:text-white">
                          {activeReturn.assignedStaff?.name || "QC Specialist"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 text-[10px] uppercase font-mono block mb-1">
                        Inspection Notes & Physical Audit Log:
                      </span>
                      <div className="p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 text-xs leading-relaxed">
                        {activeReturn.inspectionNotes || "Item has not undergone physical inspection yet."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FINANCIAL SETTLEMENT & REFUND */}
              {activeTab === "refund" && (
                <div className="space-y-5">
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-500" />
                        <span>Refund & Payment Reconciliation</span>
                      </h4>
                      {activeReturn.refundStatus !== "processed" && (
                        <button
                          type="button"
                          onClick={() => handleOpenRefundModal(activeReturn)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Process Refund Now
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Item Gross Value</span>
                        <div className="font-black text-sm font-mono mt-1 text-slate-900 dark:text-white">
                          ₹{((activeReturn.unitPrice || 0) * (activeReturn.quantity || 1)).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Permitted Deduction</span>
                        <div className="font-black text-sm font-mono mt-1 text-rose-500">
                          - ₹{(activeReturn.refundDeduction || 0).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Net Approved Refund</span>
                        <div className="font-black text-sm font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                          ₹{(activeReturn.refundAmount || ((activeReturn.unitPrice || 0) * (activeReturn.quantity || 1) - (activeReturn.refundDeduction || 0))).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-neutral-400 text-[10px] uppercase font-mono block">Refund Status</span>
                        <div className="font-bold text-sm mt-1 capitalize">
                          {activeReturn.refundStatus === "processed" ? (
                            <span className="text-emerald-500 font-black">Processed</span>
                          ) : (
                            <span className="text-amber-500 font-black">{activeReturn.refundStatus || "Pending"}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {activeReturn.refundDeductionReason && (
                      <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 p-3 rounded-xl border border-rose-200 dark:border-rose-900/40">
                        <strong>Deduction Reason:</strong> {activeReturn.refundDeductionReason}
                      </div>
                    )}

                    {activeReturn.refundTransactionRef && (
                      <div className="text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                        <strong>Transaction Reference:</strong> {activeReturn.refundTransactionRef}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: INTERNAL NOTES */}
              {activeTab === "notes" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddNote} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono">
                      Add Staff Confidential Internal Note
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Customer provided video proof of damaged zip via WhatsApp, approved priority pickup."
                        value={newInternalNote}
                        onChange={(e) => setNewInternalNote(e.target.value)}
                        className="flex-1 bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={submittingNote || !newInternalNote.trim()}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Note</span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2 pt-2">
                    {activeReturn.internalNotes && activeReturn.internalNotes.length > 0 ? (
                      activeReturn.internalNotes.map((n, i) => (
                        <div
                          key={n.id || i}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-neutral-400">
                            <span className="font-bold text-slate-700 dark:text-neutral-300">{n.author}</span>
                            <span className="font-mono">
                              {new Date(n.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <p className="text-slate-800 dark:text-neutral-200 text-xs leading-relaxed">{n.note}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-400 text-xs">No internal notes posted yet.</div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: AUDIT TRAIL */}
              {activeTab === "audit" && (
                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase font-bold">
                    Immutable System & Staff Event Log
                  </div>
                  <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 ml-3 space-y-4 pl-4 py-1">
                    {activeReturn.auditLog && activeReturn.auditLog.length > 0 ? (
                      activeReturn.auditLog.map((log, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-neutral-900" />
                          <div className="font-bold text-slate-900 dark:text-white text-xs">{log.action}</div>
                          <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            By: <span className="text-slate-700 dark:text-neutral-300 font-bold">{log.performedBy}</span> •{" "}
                            {new Date(log.timestamp).toLocaleString("en-IN")}
                          </div>
                          {log.notes && (
                            <div className="text-[11px] text-neutral-500 mt-1 bg-slate-50 dark:bg-neutral-950 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800/60">
                              {log.notes}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-neutral-400 text-xs">No audit logs recorded.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 flex items-center justify-between">
              <div className="text-[11px] text-neutral-400 font-mono">
                RMA ID: {activeReturn.returnId} • Security Verified
              </div>
              <button
                type="button"
                onClick={() => setActiveReturn(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 6. REVIEW DECISION MODAL (APPROVE / REJECT) */}
      {/* ========================================================================= */}
      {reviewModalOpen && activeReturn && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setReviewModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {reviewDecision === "approve" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>Approve Return Request</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-500" />
                    <span>Reject Return Request</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {reviewDecision === "approve"
                ? `You are about to authorize return request ${activeReturn.returnId} for product "${activeReturn.productName}". The customer will receive an authorization notice and reverse logistics pickup scheduling.`
                : `You are rejecting return request ${activeReturn.returnId}. Please supply the official documented policy rejection reason that will be visible to the customer.`}
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {reviewDecision === "reject" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Rejection Reason (Customer Visible) *
                  </label>
                  <select
                    required
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white mb-2"
                  >
                    <option value="">-- Select Rejection Policy --</option>
                    <option value="Return period expired beyond policy window (7 days)">
                      Return period expired beyond policy window (7 days)
                    </option>
                    <option value="Item category ineligible for hygienic / safety reasons">
                      Item category ineligible for hygienic / safety reasons
                    </option>
                    <option value="Tags, warranty seals, or original box missing or altered">
                      Tags, warranty seals, or original box missing or altered
                    </option>
                    <option value="Item shows evidence of external damage, wear, or user misuse">
                      Item shows evidence of external damage, wear, or user misuse
                    </option>
                    <option value="Serial number mismatch with dispatched unit">
                      Serial number mismatch with dispatched unit
                    </option>
                    <option value="Other Policy Reason">Other Policy Reason</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Internal Staff Audit Note
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Additional justification recorded in permanent audit trail..."
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || (reviewDecision === "reject" && !reviewReason)}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs ${
                    reviewDecision === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  } disabled:opacity-50`}
                >
                  {submittingReview
                    ? "Recording..."
                    : reviewDecision === "approve"
                    ? "Confirm Approval"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 7. STATUS & LOGISTICS UPDATE MODAL */}
      {/* ========================================================================= */}
      {statusModalOpen && activeReturn && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setStatusModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-500" />
                <span>Workflow & Reverse Logistics Update</span>
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Transition Return Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReturnStatus)}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="Requested">1. Requested</option>
                  <option value="Under Review">2. Under Review</option>
                  <option value="Approved">3. Approved</option>
                  <option value="Pickup Scheduled">4. Pickup Scheduled</option>
                  <option value="Picked Up">5. Picked Up</option>
                  <option value="In Transit">6. In Transit (Reverse Logistics)</option>
                  <option value="Received">7. Received (At Central Hub)</option>
                  <option value="Inspection in Progress">8. Inspection in Progress</option>
                  <option value="Refund Pending">9. Refund Pending</option>
                  <option value="Completed">10. Completed & Settled</option>
                  <option value="Rejected">11. Rejected</option>
                  <option value="Cancelled">12. Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={statusCourier}
                    onChange={(e) => setStatusCourier(e.target.value)}
                    placeholder="e.g. DHL Express Reverse"
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Tracking / Waybill #
                  </label>
                  <input
                    type="text"
                    value={statusTracking}
                    onChange={(e) => setStatusTracking(e.target.value)}
                    placeholder="e.g. REV-8392104-BD"
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Scheduled Pickup Date
                </label>
                <input
                  type="date"
                  value={statusPickupDate}
                  onChange={(e) => setStatusPickupDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Status Transition Note
                </label>
                <textarea
                  rows={2}
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="e.g. Package collected by rider, verified security seal number."
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStatus}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {submittingStatus ? "Updating..." : "Update Workflow Status"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 8. INSPECTION & RESTOCK MODAL */}
      {/* ========================================================================= */}
      {inspectionModalOpen && activeReturn && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setInspectionModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-500" />
                <span>Physical Quality & Inventory Inspection</span>
              </h3>
              <button
                type="button"
                onClick={() => setInspectionModalOpen(false)}
                className="text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-2">
                  Condition & Resalability Classification *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "resalable", label: "Resalable", desc: "Factory pristine", color: "emerald" },
                    { key: "damaged", label: "Damaged", desc: "Wear / Broken", color: "rose" },
                    { key: "defective", label: "Defective", desc: "Mfg flaw", color: "amber" },
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      onClick={() => setInspectionOutcome(opt.key as any)}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                        inspectionOutcome === opt.key
                          ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      <div className="text-xs font-black">{opt.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Inspection Notes & Physical Audit Findings *
                </label>
                <textarea
                  rows={3}
                  required
                  value={inspectionNotesText}
                  onChange={(e) => setInspectionNotesText(e.target.value)}
                  placeholder="Detail package condition, seals, accessories, and functioning status..."
                  className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {inspectionOutcome === "resalable" && (
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={restockStockCheck}
                    onChange={(e) => setRestockStockCheck(e.target.checked)}
                    className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                      Restock into live product inventory (+{activeReturn.quantity} units)
                    </span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">
                      Safely updates catalog stock count in real-time. Prevents duplicate counting.
                    </span>
                  </div>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setInspectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInspection}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {submittingInspection ? "Saving..." : "Confirm Inspection"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 9. REFUND PROCESSING MODAL */}
      {/* ========================================================================= */}
      {refundModalOpen && activeReturn && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setRefundModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span>Process Financial Refund</span>
              </h3>
              <button
                type="button"
                onClick={() => setRefundModalOpen(false)}
                className="text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Approved Refund Channel / Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "wallet", label: "Store Credit / Wallet", desc: "Instant Credit" },
                    { key: "original_payment", label: "Original Gateway", desc: "Card / Banking" },
                    { key: "cod_manual", label: "COD Manual Settlement", desc: "Direct / Bank Wire" },
                  ].map((m) => (
                    <div
                      key={m.key}
                      onClick={() => setRefundMethodType(m.key as any)}
                      className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                        refundMethodType === m.key
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-neutral-400"
                      }`}
                    >
                      <div className="text-xs font-black">{m.label}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gross Return Value:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{((activeReturn.unitPrice || 0) * (activeReturn.quantity || 1)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-500">Permitted Deduction (₹):</span>
                  <input
                    type="number"
                    min="0"
                    max={(activeReturn.unitPrice || 0) * (activeReturn.quantity || 1)}
                    value={refundDeductionAmt}
                    onChange={(e) => setRefundDeductionAmt(Number(e.target.value) || 0)}
                    className="w-28 text-right bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2 py-1 text-xs font-bold text-rose-500"
                  />
                </div>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between font-bold text-sm">
                  <span className="text-slate-800 dark:text-white">Net Refund Disbursed:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ₹{Math.max(
                      0,
                      (activeReturn.unitPrice || 0) * (activeReturn.quantity || 1) - (Number(refundDeductionAmt) || 0)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {Number(refundDeductionAmt) > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Documented Deduction Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={refundDeductionReason}
                    onChange={(e) => setRefundDeductionReason(e.target.value)}
                    placeholder="e.g. Reverse courier pickup deduction or missing luxury dust bag."
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {submittingRefund ? "Disbursing..." : "Confirm & Disburse Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 10. RETURN POLICY CONFIGURATION MODAL */}
      {/* ========================================================================= */}
      {policyModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setPolicyModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-500" />
                <span>Enterprise Return Policy Rules & SLA</span>
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModalOpen(false)}
                className="text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Return Window Eligibility (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="90"
                    value={policyData.eligibilityDays || 7}
                    onChange={(e) =>
                      setPolicyData({ ...policyData, eligibilityDays: Number(e.target.value) || 7 })
                    }
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Days after delivery within which customer can file return
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Default Restocking Fee (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={policyData.defaultRestockFeePercent || 0}
                    onChange={(e) =>
                      setPolicyData({ ...policyData, defaultRestockFeePercent: Number(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Nominal reverse logistics deduction on buyer remorse
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={policyData.autoApprovalEnabled || false}
                    onChange={(e) =>
                      setPolicyData({ ...policyData, autoApprovalEnabled: e.target.checked })
                    }
                    className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                    Enable Automated Triage Approval (for VIP Guild Customers & Transit Damaged Items)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={policyData.requireEvidenceImages ?? true}
                    onChange={(e) =>
                      setPolicyData({ ...policyData, requireEvidenceImages: e.target.checked })
                    }
                    className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                    Mandatory Photographic Evidence (at least 1 photo for damaged/defective claims)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={policyData.inspectionRequiredForRefund ?? true}
                    onChange={(e) =>
                      setPolicyData({ ...policyData, inspectionRequiredForRefund: e.target.checked })
                    }
                    className="rounded border-neutral-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">
                    Inspection Mandatory Before Disbursing Cash/Card Refund
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPolicyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPolicy}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {savingPolicy ? "Saving Policy..." : "Save Return Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
