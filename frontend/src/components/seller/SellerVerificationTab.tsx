import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Upload,
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Trash2,
  RefreshCw,
  Eye,
  Lock,
  Sparkles,
} from "lucide-react";
import { SellerProfile, SellerVerificationStatus } from "../../types";
import { sellerApi } from "../../services/sellerApi";
import { SellerMenuSectionId } from "./SellerCenterSidebar";

interface SellerVerificationTabProps {
  sellerProfile: SellerProfile | null;
  onProfileUpdated: (updated: SellerProfile) => void;
  activeSection?: SellerMenuSectionId;
  onSelectSection?: (sec: SellerMenuSectionId) => void;
}

export const VERIFICATION_STATUS_META: Record<
  SellerVerificationStatus,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    description: string;
  }
> = {
  not_submitted: {
    label: "Not Submitted",
    badgeBg: "bg-slate-800",
    badgeText: "text-slate-300",
    border: "border-slate-700",
    description:
      "Submit your National ID (NID) documents and a live face photo for manual administrator review to earn the Verified Seller badge.",
  },
  pending_admin_review: {
    label: "Pending Admin Review",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
    border: "border-amber-500/40",
    description:
      "Your NID documents and face photo have been received and are waiting for manual review by an authorized administrator. The Verified Seller badge will only be granted after Admin approval.",
  },
  under_review: {
    label: "Under Review",
    badgeBg: "bg-sky-500/15",
    badgeText: "text-sky-300",
    border: "border-sky-500/40",
    description:
      "An authorized administrator is currently reviewing your NID documents and face selfie.",
  },
  resubmission_required: {
    label: "Resubmission Required",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-300",
    border: "border-orange-500/40",
    description:
      "The administrator requested clearer or corrected NID/face documents. Please review the instructions below and submit updated files.",
  },
  approved: {
    label: "Approved / Verified",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    border: "border-emerald-500/40",
    description:
      "Your identity has been manually verified by an administrator. The official Verified Seller badge is active on your store and product pages.",
  },
  rejected: {
    label: "Rejected",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
    border: "border-rose-500/40",
    description:
      "Your verification request was not approved by the administrator. Review the reason below; you may submit corrected documents if applicable.",
  },
};

export const SellerVerificationTab: React.FC<SellerVerificationTabProps> = ({
  sellerProfile,
  onProfileUpdated,
  activeSection = "nid_verification",
  onSelectSection,
}) => {
  const identity = sellerProfile?.identityVerification;
  const currentStatus: SellerVerificationStatus =
    sellerProfile?.verificationStatus || identity?.status || "not_submitted";
  const hasVerifiedBadge =
    Boolean(sellerProfile?.verifiedBadge || identity?.verifiedBadge) &&
    currentStatus === "approved";

  const [nidNumber, setNidNumber] = useState(identity?.nidNumber || "");
  const [nidFullName, setNidFullName] = useState(
    identity?.nidFullName || sellerProfile?.ownerName || ""
  );
  const [nidDateOfBirth, setNidDateOfBirth] = useState(identity?.nidDateOfBirth || "");
  const [nidAddress, setNidAddress] = useState(
    identity?.nidAddress || sellerProfile?.businessAddress || ""
  );
  const [nidFrontImage, setNidFrontImage] = useState(identity?.nidFrontImage || "");
  const [nidBackImage, setNidBackImage] = useState(identity?.nidBackImage || "");
  const [facePhotoImage, setFacePhotoImage] = useState(identity?.facePhotoImage || "");
  const [consentGiven, setConsentGiven] = useState(Boolean(identity?.consentGiven));

  const [submitting, setSubmitting] = useState(false);
  const [deletingDocs, setDeletingDocs] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Webcam state for live selfie capture
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (identity) {
      if (identity.nidNumber) setNidNumber(identity.nidNumber);
      if (identity.nidFullName) setNidFullName(identity.nidFullName);
      if (identity.nidDateOfBirth) setNidDateOfBirth(identity.nidDateOfBirth);
      if (identity.nidAddress) setNidAddress(identity.nidAddress);
      if (identity.nidFrontImage) setNidFrontImage(identity.nidFrontImage);
      if (identity.nidBackImage) setNidBackImage(identity.nidBackImage);
      if (identity.facePhotoImage) setFacePhotoImage(identity.facePhotoImage);
      if (identity.consentGiven !== undefined) setConsentGiven(Boolean(identity.consentGiven));
    }
  }, [sellerProfile]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setFeedback({
        type: "error",
        text: "Image file is too large. Please select an image under 4 MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setter(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startWebcam = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      setCameraError(
        "Camera access was denied or is unavailable in this browser frame. You can upload a selfie image file or use a photo URL below."
      );
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureSelfie = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setFacePhotoImage(dataUrl);
      stopWebcam();
    }
  };

  const fillSampleVerificationData = () => {
    setNidNumber("1992384756102");
    setNidFullName(sellerProfile?.ownerName || "Aarav Mehta");
    setNidDateOfBirth("1992-07-19");
    setNidAddress(
      sellerProfile?.businessAddress || "42 Connaught Place, Block B, New Delhi 110001"
    );
    setNidFrontImage(
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80"
    );
    setNidBackImage(
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80"
    );
    setFacePhotoImage(
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"
    );
    setConsentGiven(true);
    setFeedback({
      type: "success",
      text: "Sample NID details, front/back document scans, and face photo loaded. Click 'Submit Verification Request to Admin' below.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!nidNumber.trim() || nidNumber.trim().length < 6) {
      setFeedback({
        type: "error",
        text: "Please enter a valid National ID (NID) number (at least 6 digits/characters).",
      });
      return;
    }
    if (!nidFullName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your full legal name exactly as shown on your NID.",
      });
      return;
    }
    if (!nidFrontImage.trim() || !nidBackImage.trim()) {
      setFeedback({
        type: "error",
        text: "Both NID Front and NID Back document images are required.",
      });
      return;
    }
    if (!facePhotoImage.trim()) {
      setFeedback({
        type: "error",
        text: "Please upload or capture a live face photo / selfie.",
      });
      return;
    }
    if (!consentGiven) {
      setFeedback({
        type: "error",
        text: "You must check the consent box authorizing manual administrator review of your NID and face photo.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await sellerApi.submitVerificationRequest({
        nidNumber: nidNumber.trim(),
        nidFullName: nidFullName.trim(),
        nidDateOfBirth: nidDateOfBirth.trim(),
        nidAddress: nidAddress.trim(),
        nidFrontImage: nidFrontImage.trim(),
        nidBackImage: nidBackImage.trim(),
        facePhotoImage: facePhotoImage.trim(),
        consentGiven: true,
      });
      if (res.seller) {
        onProfileUpdated(res.seller);
      }
      setFeedback({
        type: "success",
        text:
          res.message ||
          "Verification request submitted! Status is now Pending Admin Review. An administrator will manually inspect your NID and face photo.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Failed to submit verification request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocuments = async () => {
    setDeletingDocs(true);
    setFeedback(null);
    try {
      const res = await sellerApi.deleteVerificationDocuments();
      if (res.seller) {
        onProfileUpdated(res.seller);
      }
      setNidFrontImage("");
      setNidBackImage("");
      setFacePhotoImage("");
      setConsentGiven(false);
      setFeedback({
        type: "success",
        text: "Your stored NID and face photo documents have been permanently deleted.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Failed to delete stored documents.",
      });
    } finally {
      setDeletingDocs(false);
    }
  };

  const meta = VERIFICATION_STATUS_META[currentStatus] || VERIFICATION_STATUS_META.not_submitted;

  const verificationTabs: { id: SellerMenuSectionId; label: string }[] = [
    { id: "nid_verification", label: "NID Verification Request" },
    { id: "face_verification", label: "Face Verification Request" },
    { id: "verification_status", label: "Verification Status" },
    { id: "admin_review_result", label: "Admin Review Result" },
    { id: "resubmission_option", label: "Resubmission Option" },
    { id: "verified_badge_status", label: "Verified Badge Status" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sub-Navigation Bar */}
      {onSelectSection && (
        <div className="flex items-center gap-1.5 flex-wrap bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          {verificationTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === tab.id
                  ? "bg-[#F5A623] text-black shadow-xs"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Status Banner Card */}
      <div className={`rounded-2xl border p-6 bg-slate-900/90 ${meta.border}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                NID & Biometric Verification Status
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${meta.badgeBg} ${meta.badgeText} ${meta.border}`}
              >
                {currentStatus === "approved" && <ShieldCheck className="w-3.5 h-3.5" />}
                {(currentStatus === "pending_admin_review" ||
                  currentStatus === "under_review") && <Clock className="w-3.5 h-3.5" />}
                {currentStatus === "resubmission_required" && (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                {currentStatus === "rejected" && <XCircle className="w-3.5 h-3.5" />}
                {meta.label}
              </span>

              {hasVerifiedBadge ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Verified Seller Badge Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                  Verified Seller Badge Not Active
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white">
              Admin-Reviewed Seller NID & Face Verification
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl">{meta.description}</p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
            {identity?.submittedAt && (
              <div className="text-xs text-slate-400">
                Submitted:{" "}
                <span className="text-slate-200 font-medium">
                  {new Date(identity.submittedAt).toLocaleString()}
                </span>
              </div>
            )}
            {identity?.reviewedAt && (
              <div className="text-xs text-slate-400">
                Last Reviewed:{" "}
                <span className="text-slate-200 font-medium">
                  {new Date(identity.reviewedAt).toLocaleString()}
                </span>
              </div>
            )}
            {identity?.reviewedByAdminName && (
              <div className="text-xs text-slate-400">
                Reviewer:{" "}
                <span className="text-amber-300 font-medium">
                  {identity.reviewedByAdminName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Admin Decision / Resubmission / Rejection Feedback Box */}
        {identity?.decisionReason && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              currentStatus === "approved"
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                : currentStatus === "resubmission_required"
                ? "bg-orange-950/40 border-orange-500/40 text-orange-200"
                : "bg-rose-950/40 border-rose-500/40 text-rose-200"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-1">
              Administrator Review Note / Instructions:
            </div>
            <p className="text-sm">{identity.decisionReason}</p>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/50 border-rose-500/40 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Verification Request Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              {currentStatus === "not_submitted"
                ? "Submit NID & Face Verification Request"
                : "Update / Resubmit Verification Documents"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All documents are encrypted and accessible strictly to authorized platform verification administrators.
            </p>
          </div>

          <button
            type="button"
            onClick={fillSampleVerificationData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample NID & Selfie
          </button>
        </div>

        {/* Step 1: NID Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              National ID (NID) Number *
            </label>
            <input
              type="text"
              required
              value={nidNumber}
              onChange={(e) => setNidNumber(e.target.value)}
              placeholder="e.g., 1992384756102"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Legal Name (As on NID) *
            </label>
            <input
              type="text"
              required
              value={nidFullName}
              onChange={(e) => setNidFullName(e.target.value)}
              placeholder="Enter full name exactly as printed on NID"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Date of Birth (As on NID)
            </label>
            <input
              type="date"
              value={nidDateOfBirth}
              onChange={(e) => setNidDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Permanent / Registered Address on NID
            </label>
            <input
              type="text"
              value={nidAddress}
              onChange={(e) => setNidAddress(e.target.value)}
              placeholder="Registered address printed on back of NID"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Step 2: NID Document Images & Live Face Photo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* NID Front */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  1. NID Front Side *
                </span>
                {nidFrontImage && (
                  <span className="text-[11px] text-emerald-400 font-semibold">Attached</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Clear color image showing your NID number, photo, and full name.
              </p>

              {nidFrontImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 h-40 bg-slate-900 mb-3">
                  <img
                    src={nidFrontImage}
                    alt="NID Front Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-800 h-40 flex flex-col items-center justify-center text-slate-500 text-xs mb-3">
                  <FileText className="w-7 h-7 mb-1.5 opacity-50" />
                  No NID Front image selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                Upload NID Front File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setNidFrontImage)}
                />
              </label>
              <input
                type="text"
                value={nidFrontImage}
                onChange={(e) => setNidFrontImage(e.target.value)}
                placeholder="Or paste NID Front image URL..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* NID Back */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  2. NID Back Side *
                </span>
                {nidBackImage && (
                  <span className="text-[11px] text-emerald-400 font-semibold">Attached</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Clear image of the back of your NID showing address and barcode.
              </p>

              {nidBackImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 h-40 bg-slate-900 mb-3">
                  <img
                    src={nidBackImage}
                    alt="NID Back Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-800 h-40 flex flex-col items-center justify-center text-slate-500 text-xs mb-3">
                  <FileText className="w-7 h-7 mb-1.5 opacity-50" />
                  No NID Back image selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                Upload NID Back File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, setNidBackImage)}
                />
              </label>
              <input
                type="text"
                value={nidBackImage}
                onChange={(e) => setNidBackImage(e.target.value)}
                placeholder="Or paste NID Back image URL..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Face Photo / Selfie */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3. Live Face Photo / Selfie *
                </span>
                {facePhotoImage && (
                  <span className="text-[11px] text-emerald-400 font-semibold">Attached</span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Well-lit front-facing photo of your face for manual comparison with your NID.
              </p>

              {cameraActive ? (
                <div className="relative rounded-lg overflow-hidden border border-amber-500/50 h-40 bg-black mb-3">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <div className="absolute bottom-2 inset-x-2 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow"
                    >
                      Capture Selfie
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : facePhotoImage ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-700 h-40 bg-slate-900 mb-3">
                  <img
                    src={facePhotoImage}
                    alt="Face Selfie Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-800 h-40 flex flex-col items-center justify-center text-slate-500 text-xs mb-3">
                  <UserCheck className="w-7 h-7 mb-1.5 opacity-50" />
                  No face photo / selfie selected
                </div>
              )}

              {cameraError && (
                <p className="text-[11px] text-amber-300 mb-2">{cameraError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Selfie
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setFacePhotoImage)}
                  />
                </label>
                <button
                  type="button"
                  onClick={cameraActive ? stopWebcam : startWebcam}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                >
                  <Camera className="w-3.5 h-3.5" />
                  {cameraActive ? "Close Camera" : "Take Selfie"}
                </button>
              </div>
              <input
                type="text"
                value={facePhotoImage}
                onChange={(e) => setFacePhotoImage(e.target.value)}
                placeholder="Or paste Face / Selfie image URL..."
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Explicit Consent & Privacy Policy Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <input
              id="nid-consent-checkbox"
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
            />
            <label
              htmlFor="nid-consent-checkbox"
              className="text-xs text-slate-300 leading-relaxed cursor-pointer"
            >
              <span className="font-bold text-white">
                Explicit Identity & Biometric Review Consent:
              </span>{" "}
              I hereby consent to submit my National ID (NID) documents and live face photograph
              to ALIKE-ND Administration solely for manual identity verification. I understand that:
              (1) uploading documents does <span className="underline">not</span> automatically
              approve my account or grant the Verified Seller badge; (2) my private NID and face
              images are never shared with customers or other sellers; and (3) my biometric images
              are retained for up to 90 days for compliance audit or can be permanently purged upon
              request.
            </label>
          </div>
        </div>

        {/* Submit & Privacy Deletion Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Private Admin-Only Storage • Manual Review Required</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(identity?.nidFrontImage || identity?.facePhotoImage) && (
              <button
                type="button"
                disabled={deletingDocs}
                onClick={handleDeleteDocuments}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border border-rose-500/30 text-xs font-semibold transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deletingDocs ? "Purging Documents..." : "Delete Stored NID & Face Data"}
              </button>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Submitting for Admin Review...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  {currentStatus === "not_submitted"
                    ? "Submit Verification Request"
                    : "Submit Updated Verification Request"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Verification Audit & Review History */}
      {Array.isArray(identity?.history) && identity!.history!.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Verification Request History & Audit Trail
          </h3>
          <div className="space-y-3">
            {identity!.history!.map((entry, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{entry.action}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {VERIFICATION_STATUS_META[entry.status]?.label || entry.status}
                    </span>
                  </div>
                  {entry.note && <p className="text-xs text-slate-400 mt-1">{entry.note}</p>}
                </div>
                <div className="text-[11px] text-slate-500 shrink-0 text-right">
                  <div>{entry.actedBy}</div>
                  <div>{new Date(entry.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
