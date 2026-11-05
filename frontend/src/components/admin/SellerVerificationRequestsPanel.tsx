import React, { useState, useMemo } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
  UserCheck,
  Search,
  RefreshCw,
  Trash2,
  Lock,
  X,
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";
import { SellerVerificationStatus } from "../../types";

interface SellerVerificationRequestsPanelProps {
  sellers: any[];
  verificationRequests: any[];
  onRefresh: () => Promise<void> | void;
  showToast: (msg: string, isError?: boolean) => void;
}

const STATUS_BADGES: Record<
  SellerVerificationStatus,
  { label: string; style: string }
> = {
  not_submitted: {
    label: "Not Submitted",
    style: "bg-zinc-800 text-zinc-400 border-zinc-700",
  },
  pending_admin_review: {
    label: "Pending Admin Review",
    style: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  },
  under_review: {
    label: "Under Review",
    style: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  },
  resubmission_required: {
    label: "Resubmission Required",
    style: "bg-orange-500/15 text-orange-300 border-orange-500/40",
  },
  approved: {
    label: "Approved / Verified",
    style: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  },
  rejected: {
    label: "Rejected",
    style: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  },
};

export const SellerVerificationRequestsPanel: React.FC<
  SellerVerificationRequestsPanelProps
> = ({ sellers, verificationRequests, onRefresh, showToast }) => {
  const [statusFilter, setStatusFilter] = useState<string>("all_submitted");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reviewingSeller, setReviewingSeller] = useState<any | null>(null);
  const [decisionReason, setDecisionReason] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<string | null>(null);

  // Merge verificationRequests (which include full private NID/face images for authorized admins) with sellers fallback
  const records = useMemo(() => {
    const source =
      Array.isArray(verificationRequests) && verificationRequests.length > 0
        ? verificationRequests
        : sellers;

    return source.map((s) => {
      const idv = s.identityVerification || {};
      const vStatus: SellerVerificationStatus =
        s.verificationStatus || idv.status || "not_submitted";
      const isVerifiedBadge =
        Boolean(s.verifiedBadge || idv.verifiedBadge) && vStatus === "approved";
      return {
        ...s,
        verificationStatus: vStatus,
        verifiedBadge: isVerifiedBadge,
        identityVerification: {
          ...idv,
          status: vStatus,
          verifiedBadge: isVerifiedBadge,
        },
      };
    });
  }, [verificationRequests, sellers]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const vStatus: SellerVerificationStatus = r.verificationStatus || "not_submitted";
      if (statusFilter === "all_submitted") {
        // Show all sellers who have submitted or have a verification status, plus allow seeing all if none match
        const hasAnySubmitted = records.some((x) => x.verificationStatus !== "not_submitted");
        if (hasAnySubmitted && vStatus === "not_submitted") return false;
      } else if (statusFilter !== "all" && vStatus !== statusFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = String(r.ownerName || "").toLowerCase().includes(q);
        const matchShop = String(r.shopName || "").toLowerCase().includes(q);
        const matchId = String(r._id || "").toLowerCase().includes(q);
        const matchNid = String(r.identityVerification?.nidNumber || "")
          .toLowerCase()
          .includes(q);
        const matchEmail = String(r.email || "").toLowerCase().includes(q);
        if (!matchName && !matchShop && !matchId && !matchNid && !matchEmail) {
          return false;
        }
      }
      return true;
    });
  }, [records, statusFilter, searchQuery]);

  const handleOpenReviewModal = async (seller: any) => {
    setReviewingSeller(seller);
    setDecisionReason(seller.identityVerification?.decisionReason || "");

    // If status is currently pending_admin_review, transition to under_review when Admin opens Review
    if (seller.verificationStatus === "pending_admin_review") {
      try {
        const res = await adminApi.reviewSellerVerification(String(seller._id), {
          action: "start_review",
        });
        if (res?.seller) {
          setReviewingSeller(res.seller);
        }
        await onRefresh();
      } catch {}
    }
  };

  const handleExecuteDecision = async (
    seller: any,
    action:
      | "approve"
      | "reject"
      | "request_resubmission"
      | "revoke"
      | "purge_documents",
    customReason?: string
  ) => {
    const finalReason = (customReason !== undefined ? customReason : decisionReason).trim();

    if (
      (action === "reject" || action === "request_resubmission" || action === "revoke") &&
      !finalReason
    ) {
      showToast(
        `Please enter a reason or instructions before choosing '${action.replace(/_/g, " ")}'.`,
        true
      );
      return;
    }

    setSubmittingAction(action);
    try {
      const res = await adminApi.reviewSellerVerification(String(seller._id), {
        action,
        reason: finalReason,
      });
      showToast(
        res?.message ||
          `Verification ${action.replace(/_/g, " ")} recorded for ${seller.shopName}`
      );
      if (res?.seller && reviewingSeller && String(reviewingSeller._id) === String(seller._id)) {
        setReviewingSeller(res.seller);
      }
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || "Failed to process verification decision", true);
    } finally {
      setSubmittingAction(null);
    }
  };

  const renderVerificationBadge = (status: SellerVerificationStatus) => {
    const meta = STATUS_BADGES[status] || STATUS_BADGES.not_submitted;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold border rounded ${meta.style}`}
      >
        {status === "approved" && <ShieldCheck className="w-3 h-3" />}
        {(status === "pending_admin_review" || status === "under_review") && (
          <Clock className="w-3 h-3" />
        )}
        {status === "resubmission_required" && <AlertTriangle className="w-3 h-3" />}
        {status === "rejected" && <XCircle className="w-3 h-3" />}
        {meta.label}
      </span>
    );
  };

  const counts = useMemo(() => {
    return {
      pending: records.filter(
        (r) =>
          r.verificationStatus === "pending_admin_review" ||
          r.verificationStatus === "under_review"
      ).length,
      resubmission: records.filter(
        (r) => r.verificationStatus === "resubmission_required"
      ).length,
      approved: records.filter(
        (r) => r.verificationStatus === "approved" && r.verifiedBadge
      ).length,
      rejected: records.filter((r) => r.verificationStatus === "rejected").length,
    };
  }, [records]);

  return (
    <div className="space-y-5">
      {/* Header & Summary Strip */}
      <div className="bg-zinc-900 border border-zinc-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-medium text-zinc-100">
                Seller NID & Face Verification Requests (Manual Admin Review)
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Sellers are never automatically approved upon uploading NID or face images. Only an authorized administrator can inspect private NID & selfie documents and grant or revoke the official{" "}
              <span className="text-emerald-400 font-semibold">Verified Seller</span> badge.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 px-3 py-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Private Biometric & NID Vault • Admin-Only Access</span>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all_submitted", label: "Submitted Requests" },
              {
                id: "pending_admin_review",
                label: `Pending Admin Review (${counts.pending})`,
              },
              { id: "under_review", label: "Under Review" },
              {
                id: "resubmission_required",
                label: `Resubmission Required (${counts.resubmission})`,
              },
              { id: "approved", label: `Approved / Verified (${counts.approved})` },
              { id: "rejected", label: `Rejected (${counts.rejected})` },
              { id: "all", label: `All Sellers (${records.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-amber-400 text-zinc-950 border-amber-400 font-semibold"
                    : "bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seller name, ID, store, or NID..."
              className="w-full bg-zinc-950 border border-zinc-800 pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Verification Requests Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
              <th className="py-3.5 px-4">Seller Name & Seller ID</th>
              <th className="py-3.5 px-4">Store Name</th>
              <th className="py-3.5 px-4">NID Verification Documents</th>
              <th className="py-3.5 px-4">Submitted Face Photo</th>
              <th className="py-3.5 px-4">Submission Date</th>
              <th className="py-3.5 px-4">Current Verification Status</th>
              <th className="py-3.5 px-4 text-right">Admin Review Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 text-xs">
            {filteredRecords.map((s) => {
              const idv = s.identityVerification || {};
              const vStatus: SellerVerificationStatus =
                s.verificationStatus || idv.status || "not_submitted";
              const isVerifiedBadge =
                Boolean(s.verifiedBadge || idv.verifiedBadge) && vStatus === "approved";

              return (
                <tr key={s._id} className="hover:bg-zinc-800/30 transition-colors">
                  {/* Seller Name & ID */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-zinc-100">
                      {idv.nidFullName || s.ownerName || "Merchant"}
                    </div>
                    <div className="text-[11px] font-mono text-amber-400/90 mt-0.5">
                      ID: {String(s._id)}
                    </div>
                    <div className="text-[11px] text-zinc-400">{s.email}</div>
                  </td>

                  {/* Store Name */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-zinc-100">{s.shopName}</div>
                    <div className="text-[11px] text-zinc-400">
                      {s.category || "Boutique & Retail"}
                    </div>
                    {isVerifiedBadge ? (
                      <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified Seller Badge
                      </span>
                    ) : (
                      <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">
                        No Verified Badge
                      </span>
                    )}
                  </td>

                  {/* NID Verification Documents */}
                  <td className="py-4 px-4">
                    <div className="text-[11px] font-mono text-zinc-200 mb-1.5">
                      NID: <span className="text-amber-300">{idv.nidNumber || "Not submitted"}</span>
                    </div>
                    {idv.nidFrontImage || idv.nidBackImage ? (
                      <div className="flex items-center gap-2">
                        {idv.nidFrontImage && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(s)}
                            className="group relative w-16 h-11 rounded overflow-hidden border border-zinc-700 bg-zinc-950 cursor-pointer"
                            title="Click to inspect NID Front"
                          >
                            <img
                              src={idv.nidFrontImage}
                              alt="NID Front"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-center text-zinc-200">
                              Front
                            </span>
                          </button>
                        )}
                        {idv.nidBackImage && (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(s)}
                            className="group relative w-16 h-11 rounded overflow-hidden border border-zinc-700 bg-zinc-950 cursor-pointer"
                            title="Click to inspect NID Back"
                          >
                            <img
                              src={idv.nidBackImage}
                              alt="NID Back"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-center text-zinc-200">
                              Back
                            </span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-zinc-500">No NID images uploaded</span>
                    )}
                  </td>

                  {/* Submitted Face Photo */}
                  <td className="py-4 px-4">
                    {idv.facePhotoImage ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(s)}
                        className="group relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 bg-zinc-950 cursor-pointer"
                        title="Click to inspect Face Photo / Selfie"
                      >
                        <img
                          src={idv.facePhotoImage}
                          alt="Seller Face Photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500">No selfie uploaded</span>
                    )}
                  </td>

                  {/* Submission Date */}
                  <td className="py-4 px-4 text-zinc-300">
                    {idv.submittedAt ? (
                      <div>
                        <div>{new Date(idv.submittedAt).toLocaleDateString("en-IN")}</div>
                        <div className="text-[11px] text-zinc-500">
                          {new Date(idv.submittedAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {idv.consentGiven && (
                          <div className="text-[10px] text-emerald-400 mt-0.5">
                            ✓ Biometric Consent Given
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>

                  {/* Current Verification Status */}
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      {renderVerificationBadge(vStatus)}
                      {idv.reviewedByAdminName && (
                        <div className="text-[11px] text-zinc-400">
                          By: {idv.reviewedByAdminName}
                        </div>
                      )}
                      {idv.decisionReason && (
                        <div
                          className="text-[11px] text-zinc-400 max-w-[200px] truncate"
                          title={idv.decisionReason}
                        >
                          Note: {idv.decisionReason}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons: Review, Approve, Reject, Request Resubmission, Revoke */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(s)}
                        className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        Review
                      </button>

                      {vStatus !== "approved" && (
                        <button
                          type="button"
                          disabled={submittingAction !== null}
                          onClick={() =>
                            handleExecuteDecision(
                              s,
                              "approve",
                              "NID documents and face photo manually verified by administrator."
                            )
                          }
                          className="px-2.5 py-1.5 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {vStatus !== "resubmission_required" && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingSeller(s);
                            setDecisionReason(
                              "Please upload a clearer, uncropped NID front/back scan and well-lit face selfie."
                            );
                          }}
                          className="px-2.5 py-1.5 text-xs bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 border border-orange-500/30 transition-colors cursor-pointer"
                        >
                          Request Resubmission
                        </button>
                      )}

                      {vStatus !== "rejected" && vStatus !== "approved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingSeller(s);
                            setDecisionReason(
                              "NID document details or face photo did not pass manual verification."
                            );
                          }}
                          className="px-2.5 py-1.5 text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      {vStatus === "approved" && (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewingSeller(s);
                            setDecisionReason(
                              "Verified Seller status revoked by administrator pending updated compliance check."
                            );
                          }}
                          className="px-2.5 py-1.5 text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Revoke Badge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500 text-sm">
                  No seller verification requests match the current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Complete Verification Request Review Modal */}
      {reviewingSeller && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-serif text-zinc-100">
                    NID & Face Verification Review — {reviewingSeller.shopName}
                  </h3>
                  {renderVerificationBadge(
                    reviewingSeller.verificationStatus ||
                      reviewingSeller.identityVerification?.status ||
                      "not_submitted"
                  )}
                  {reviewingSeller.verifiedBadge &&
                    reviewingSeller.verificationStatus === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Verified Seller Badge Active
                      </span>
                    )}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Seller: <strong className="text-zinc-200">{reviewingSeller.ownerName}</strong> •
                  Seller ID: <span className="font-mono text-amber-400">{reviewingSeller._id}</span>{" "}
                  • {reviewingSeller.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setReviewingSeller(null)}
                className="p-1.5 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* NID Metadata & Consent Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-950 border border-zinc-800 p-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    NID Number
                  </div>
                  <div className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                    {reviewingSeller.identityVerification?.nidNumber || "Not submitted"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Full Name on NID
                  </div>
                  <div className="text-sm font-medium text-zinc-100 mt-0.5">
                    {reviewingSeller.identityVerification?.nidFullName ||
                      reviewingSeller.ownerName ||
                      "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Date of Birth & Address
                  </div>
                  <div className="text-zinc-200 mt-0.5">
                    DOB: {reviewingSeller.identityVerification?.nidDateOfBirth || "—"}
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate">
                    {reviewingSeller.identityVerification?.nidAddress ||
                      reviewingSeller.businessAddress ||
                      "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                    Consent & Submission
                  </div>
                  <div className="text-emerald-400 font-medium mt-0.5">
                    {reviewingSeller.identityVerification?.consentGiven
                      ? "✓ Explicit Consent Verified"
                      : "Consent Not Recorded"}
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {reviewingSeller.identityVerification?.submittedAt
                      ? new Date(
                          reviewingSeller.identityVerification.submittedAt
                        ).toLocaleString("en-IN")
                      : "—"}
                  </div>
                </div>
              </div>

              {/* Side-by-Side Document & Biometric Inspection */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* NID Front */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                      1. NID Front Document
                    </span>
                    {reviewingSeller.identityVerification?.nidFrontImage && (
                      <a
                        href={reviewingSeller.identityVerification.nidFrontImage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Open Full Size ↗
                      </a>
                    )}
                  </div>
                  {reviewingSeller.identityVerification?.nidFrontImage ? (
                    <img
                      src={reviewingSeller.identityVerification.nidFrontImage}
                      alt="NID Front"
                      className="w-full h-52 object-cover rounded border border-zinc-800"
                    />
                  ) : (
                    <div className="h-52 border border-dashed border-zinc-800 flex items-center justify-center text-zinc-500">
                      No NID Front Image Submitted
                    </div>
                  )}
                </div>

                {/* NID Back */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                      2. NID Back Document
                    </span>
                    {reviewingSeller.identityVerification?.nidBackImage && (
                      <a
                        href={reviewingSeller.identityVerification.nidBackImage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Open Full Size ↗
                      </a>
                    )}
                  </div>
                  {reviewingSeller.identityVerification?.nidBackImage ? (
                    <img
                      src={reviewingSeller.identityVerification.nidBackImage}
                      alt="NID Back"
                      className="w-full h-52 object-cover rounded border border-zinc-800"
                    />
                  ) : (
                    <div className="h-52 border border-dashed border-zinc-800 flex items-center justify-center text-zinc-500">
                      No NID Back Image Submitted
                    </div>
                  )}
                </div>

                {/* Submitted Face Photo / Selfie */}
                <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 uppercase tracking-wider text-[11px]">
                      3. Submitted Face Photo / Selfie
                    </span>
                    {reviewingSeller.identityVerification?.facePhotoImage && (
                      <a
                        href={reviewingSeller.identityVerification.facePhotoImage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Open Full Size ↗
                      </a>
                    )}
                  </div>
                  {reviewingSeller.identityVerification?.facePhotoImage ? (
                    <img
                      src={reviewingSeller.identityVerification.facePhotoImage}
                      alt="Submitted Face Selfie"
                      className="w-full h-52 object-cover rounded border border-amber-500/40"
                    />
                  ) : (
                    <div className="h-52 border border-dashed border-zinc-800 flex items-center justify-center text-zinc-500">
                      No Face Photo Submitted
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Decision Reason / Resubmission Note */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Admin Review Decision Note / Rejection Reason / Resubmission Instructions
                </label>
                <textarea
                  rows={2}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Enter approval note, rejection reason, or resubmission instructions for the seller..."
                  className="w-full bg-zinc-900 border border-zinc-700 p-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={submittingAction !== null}
                      onClick={() => handleExecuteDecision(reviewingSeller, "approve")}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Grant Verified Seller Badge
                    </button>

                    <button
                      type="button"
                      disabled={submittingAction !== null}
                      onClick={() =>
                        handleExecuteDecision(reviewingSeller, "request_resubmission")
                      }
                      className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Request Resubmission
                    </button>

                    <button
                      type="button"
                      disabled={submittingAction !== null}
                      onClick={() => handleExecuteDecision(reviewingSeller, "reject")}
                      className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>

                    {reviewingSeller.verificationStatus === "approved" && (
                      <button
                        type="button"
                        disabled={submittingAction !== null}
                        onClick={() => handleExecuteDecision(reviewingSeller, "revoke")}
                        className="px-4 py-2 bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Revoke Verification & Remove Badge
                      </button>
                    )}
                  </div>

                  {(reviewingSeller.identityVerification?.nidFrontImage ||
                    reviewingSeller.identityVerification?.facePhotoImage) && (
                    <button
                      type="button"
                      disabled={submittingAction !== null}
                      onClick={() =>
                        handleExecuteDecision(
                          reviewingSeller,
                          "purge_documents",
                          "Biometric & NID files purged per data retention policy"
                        )
                      }
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      Purge Stored Images (Retention Policy)
                    </button>
                  )}
                </div>
              </div>

              {/* Verification History Log */}
              {Array.isArray(reviewingSeller.identityVerification?.history) &&
                reviewingSeller.identityVerification.history.length > 0 && (
                  <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                      Verification Decision History (Reviewer Admin ID & Timestamps)
                    </div>
                    <div className="space-y-2">
                      {reviewingSeller.identityVerification.history.map(
                        (h: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-semibold text-zinc-100">{h.action}</span>
                              {h.note && (
                                <p className="text-[11px] text-zinc-400 mt-0.5">{h.note}</p>
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-500 text-right shrink-0">
                              <div>
                                {h.actedBy}{" "}
                                {h.actedByAdminId ? `(ID: ${h.actedByAdminId})` : ""}
                              </div>
                              <div>
                                {h.createdAt
                                  ? new Date(h.createdAt).toLocaleString("en-IN")
                                  : ""}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
