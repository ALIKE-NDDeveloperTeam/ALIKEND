import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  Key,
  Mail,
  Phone,
  Clock,
  Calendar,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Crown,
  FileText,
  UserCheck,
  UserX,
  Lock,
  MessageSquare,
  Star,
  Award,
  Wallet,
  Tag,
  Copy,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  Sliders,
  DollarSign,
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";

export interface CustomerItem {
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  phone?: string;
  country?: string;
  mobileNumber?: string;
  avatar?: string;
  tier: "VIP" | "Normal" | "Silver" | "Gold" | "Platinum";
  isBlocked: boolean;
  verified: boolean;
  ordersCount: number;
  lifetimeSpend: number;
  activeRestrictionsCount?: number;
  restrictions?: Record<string, any>;
  adminNotes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

interface AdvancedCustomerManagementProps {
  customers: CustomerItem[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

// 12 Feature Restrictions Definition
const RESTRICTION_CONFIGS = [
  { key: "login_block", label: "Account Login Block", desc: "Prevents customer from logging in across web and mobile", icon: Lock, superAdminOnly: true, color: "rose" },
  { key: "discount_card_block", label: "Discount Card Usage Block", desc: "Suspends VIP and Atelier discount cards on checkout", icon: CreditCard, superAdminOnly: false, color: "amber" },
  { key: "coupon_block", label: "Coupon & Promo Codes Block", desc: "Disallows promotional voucher and coupon redemptions", icon: Tag, superAdminOnly: false, color: "orange" },
  { key: "order_block", label: "New Order Placement Block", desc: "Blocks placing any new purchases across all channels", icon: ShoppingBag, superAdminOnly: false, color: "rose" },
  { key: "cod_block", label: "Cash on Delivery (COD) Block", desc: "Restricts COD payment option due to excessive rejections", icon: DollarSign, superAdminOnly: false, color: "purple" },
  { key: "online_payment_block", label: "Online Payment Block", desc: "Suspends card, gateway, and mobile banking checkouts", icon: CreditCard, superAdminOnly: false, color: "blue" },
  { key: "refund_block", label: "Refund Request Block", desc: "Restricts automated and self-service refund requests", icon: RotateCcw, superAdminOnly: false, color: "red" },
  { key: "return_block", label: "Return & Exchange Block", desc: "Prevents customer from initiating product returns", icon: RotateCcw, superAdminOnly: false, color: "amber" },
  { key: "review_block", label: "Review & Rating Submission Block", desc: "Mutes product feedback, stars, and verified buyer reviews", icon: Star, superAdminOnly: false, color: "yellow" },
  { key: "messaging_block", label: "Comment or Messaging Block", desc: "Restricts live chat concierge, seller messaging, and forums", icon: MessageSquare, superAdminOnly: false, color: "indigo" },
  { key: "loyalty_block", label: "Reward Points & Loyalty Block", desc: "Freezes points accumulation, tier upgrades, and redemption", icon: Award, superAdminOnly: false, color: "emerald" },
  { key: "other_feature_block", label: "Other Feature Restrictions", desc: "General custom restrictions for account audits", icon: Sliders, superAdminOnly: false, color: "neutral" },
];

export default function AdvancedCustomerManagement({
  customers,
  onRefresh,
  onShowToast,
  isSuperAdmin,
}: AdvancedCustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Selected customer for View / Dossier Modal
  const [viewCustomer, setViewCustomer] = useState<CustomerItem | null>(null);
  const [dossierData, setDossierData] = useState<any>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Direct Edit Profile Modal
  const [editCustomer, setEditCustomer] = useState<CustomerItem | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "",
    mobileNumber: "",
    country: "+880",
    phone: "",
    tier: "Normal",
    adminNotes: "",
    verified: true,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Email / Phone / Password sub-dialogs
  const [emailModalUser, setEmailModalUser] = useState<CustomerItem | null>(null);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [emailChangeReason, setEmailChangeReason] = useState("");
  const [submittingEmail, setSubmittingEmail] = useState(false);

  const [phoneModalUser, setPhoneModalUser] = useState<CustomerItem | null>(null);
  const [newPhoneInput, setNewPhoneInput] = useState("");
  const [countryCodeInput, setCountryCodeInput] = useState("+880");
  const [phoneChangeReason, setPhoneChangeReason] = useState("");
  const [submittingPhone, setSubmittingPhone] = useState(false);

  const [passwordModalUser, setPasswordModalUser] = useState<CustomerItem | null>(null);
  const [passwordMode, setPasswordMode] = useState<"link" | "temporary">("link");
  const [passwordReason, setPasswordReason] = useState("");
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Restriction Action Modal
  const [restrictionModalUser, setRestrictionModalUser] = useState<CustomerItem | null>(null);
  const [targetRestriction, setTargetRestriction] = useState<any>(null);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [restrictionAdminNote, setRestrictionAdminNote] = useState("");
  const [restrictionExpiry, setRestrictionExpiry] = useState("");
  const [submittingRestriction, setSubmittingRestriction] = useState(false);

  // Admin Preview Mode Modal
  const [previewUser, setPreviewUser] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Lock body scroll when modal is open
  const isAnyModalOpen =
    Boolean(viewCustomer) ||
    Boolean(editCustomer) ||
    Boolean(emailModalUser) ||
    Boolean(phoneModalUser) ||
    Boolean(passwordModalUser) ||
    Boolean(targetRestriction) ||
    Boolean(previewUser);

  useEffect(() => {
    if (isAnyModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isAnyModalOpen]);

  // Load Dossier when viewCustomer changes
  useEffect(() => {
    if (viewCustomer) {
      loadDossier(viewCustomer._id);
      setEditForm({
        fullName: viewCustomer.fullName || viewCustomer.name || "",
        mobileNumber: viewCustomer.mobileNumber || "",
        country: viewCustomer.country || "+880",
        phone: viewCustomer.phone || "",
        tier: viewCustomer.tier || "Normal",
        adminNotes: viewCustomer.adminNotes || "",
        verified: viewCustomer.verified !== false,
      });
    } else {
      setDossierData(null);
    }
  }, [viewCustomer]);

  const loadDossier = async (id: string) => {
    try {
      setLoadingDossier(true);
      const res = await adminApi.getCustomerDossier(id);
      if (res && res.customer) {
        setDossierData(res);
        setEditForm({
          fullName: res.customer.fullName || res.customer.name || "",
          mobileNumber: res.customer.mobileNumber || "",
          country: res.customer.country || "+880",
          phone: res.customer.phone || "",
          tier: res.customer.tier || "Normal",
          adminNotes: res.customer.adminNotes || "",
          verified: res.customer.verified !== false,
        });
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to load detailed customer dossier", "error");
    } finally {
      setLoadingDossier(false);
    }
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.fullName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c._id?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.mobileNumber?.toLowerCase().includes(q);

      const isVip = c.tier === "VIP" || c.tier === "Platinum" || (c.ordersCount || 0) > 10;
      const matchesTier =
        tierFilter === "all" ||
        (tierFilter === "VIP" && isVip) ||
        (tierFilter === "Normal" && !isVip);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "blocked" && c.isBlocked) ||
        (statusFilter === "active" && !c.isBlocked) ||
        (statusFilter === "restricted" && (c.activeRestrictionsCount || 0) > 0);

      return matchesSearch && matchesTier && matchesStatus;
    });
  }, [customers, searchTerm, tierFilter, statusFilter]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Open Edit Profile
  const handleOpenEdit = (c: CustomerItem) => {
    setEditCustomer(c);
    setEditForm({
      fullName: c.fullName || c.name || "",
      mobileNumber: c.mobileNumber || "",
      country: c.country || "+880",
      phone: c.phone || "",
      tier: c.tier || "Normal",
      adminNotes: c.adminNotes || "",
      verified: c.verified !== false,
    });
  };

  // Submit Profile Edit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = editCustomer || viewCustomer;
    if (!target) return;

    try {
      setSavingProfile(true);
      await adminApi.updateCustomerProfile(target._id, editForm);
      onShowToast("Customer profile details updated successfully.", "success");
      setEditCustomer(null);
      onRefresh();
      if (viewCustomer && viewCustomer._id === target._id) {
        loadDossier(target._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to save profile changes", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Quick Block / Unblock Toggle
  const handleToggleBlock = async (c: CustomerItem) => {
    if (!isSuperAdmin) {
      onShowToast("Account login blocking is reserved for Super Administrators.", "error");
      return;
    }

    const nextState = !c.isBlocked;
    const confirmMsg = nextState
      ? `Are you sure you want to block login for "${c.name || c.email}"?`
      : `Restore account login access for "${c.name || c.email}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      await adminApi.updateCustomerRestriction(c._id, {
        restrictionKey: "login_block",
        enabled: nextState,
        reason: nextState ? "Administrative direct login block" : "Access restored by Super Admin",
      });
      onShowToast(`Account ${nextState ? "blocked" : "unblocked"} successfully.`, "success");
      onRefresh();
      if (viewCustomer && viewCustomer._id === c._id) {
        loadDossier(c._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to update block status", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open Restriction Modal
  const handleOpenRestriction = (c: CustomerItem, rConfig: any, currentState: boolean) => {
    if (rConfig.superAdminOnly && !isSuperAdmin) {
      onShowToast(`${rConfig.label} requires Super Administrator privileges.`, "error");
      return;
    }
    setRestrictionModalUser(c);
    setTargetRestriction({ ...rConfig, currentState });
    setRestrictionReason("");
    setRestrictionAdminNote("");
    setRestrictionExpiry("");
  };

  // Submit Restriction Toggle
  const handleSubmitRestriction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restrictionModalUser || !targetRestriction) return;

    try {
      setSubmittingRestriction(true);
      const nextState = !targetRestriction.currentState;

      await adminApi.updateCustomerRestriction(restrictionModalUser._id, {
        restrictionKey: targetRestriction.key,
        enabled: nextState,
        reason: restrictionReason.trim() || (nextState ? "Administrative policy block" : "Restriction lifted"),
        adminNote: restrictionAdminNote.trim(),
        expiresAt: restrictionExpiry ? restrictionExpiry : undefined,
      });

      onShowToast(
        `Restriction "${targetRestriction.label}" ${nextState ? "applied" : "removed"}.`,
        "success"
      );
      setTargetRestriction(null);
      setRestrictionModalUser(null);
      onRefresh();
      if (viewCustomer && viewCustomer._id === restrictionModalUser._id) {
        loadDossier(restrictionModalUser._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to update restriction", "error");
    } finally {
      setSubmittingRestriction(false);
    }
  };

  // Open Change Email
  const handleOpenEmail = (c: CustomerItem) => {
    setEmailModalUser(c);
    setNewEmailInput("");
    setEmailChangeReason("");
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailModalUser) return;

    try {
      setSubmittingEmail(true);
      const res = await adminApi.changeCustomerEmail(emailModalUser._id, {
        newEmail: newEmailInput.trim().toLowerCase(),
        reason: emailChangeReason.trim(),
      });
      onShowToast(res?.message || "Email updated successfully.", "success");
      setEmailModalUser(null);
      onRefresh();
      if (viewCustomer && viewCustomer._id === emailModalUser._id) {
        loadDossier(emailModalUser._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to change email address", "error");
    } finally {
      setSubmittingEmail(false);
    }
  };

  // Open Change Phone
  const handleOpenPhone = (c: CustomerItem) => {
    setPhoneModalUser(c);
    setNewPhoneInput(c.mobileNumber || "");
    setCountryCodeInput(c.country || "+880");
    setPhoneChangeReason("");
  };

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModalUser) return;

    try {
      setSubmittingPhone(true);
      const res = await adminApi.changeCustomerPhone(phoneModalUser._id, {
        newMobileNumber: newPhoneInput.trim(),
        country: countryCodeInput.trim(),
        reason: phoneChangeReason.trim(),
      });
      onShowToast(res?.message || "Mobile number updated successfully.", "success");
      setPhoneModalUser(null);
      onRefresh();
      if (viewCustomer && viewCustomer._id === phoneModalUser._id) {
        loadDossier(phoneModalUser._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to update mobile number", "error");
    } finally {
      setSubmittingPhone(false);
    }
  };

  // Open Password Reset Modal
  const handleOpenPassword = (c: CustomerItem) => {
    setPasswordModalUser(c);
    setPasswordMode("link");
    setPasswordReason("");
    setTempPasswordResult(null);
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;

    try {
      setSubmittingPassword(true);
      const res = await adminApi.resetCustomerPassword(passwordModalUser._id, {
        mode: passwordMode,
        reason: passwordReason.trim(),
      });

      if (passwordMode === "temporary" && res?.tempPassword) {
        setTempPasswordResult(res.tempPassword);
        onShowToast("Temporary password generated securely.", "success");
      } else {
        onShowToast(res?.message || "Password reset link triggered.", "success");
        setPasswordModalUser(null);
      }
      onRefresh();
      if (viewCustomer && viewCustomer._id === passwordModalUser._id) {
        loadDossier(passwordModalUser._id);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to initiate password reset", "error");
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Launch Admin Preview Mode
  const handleLaunchPreview = async (c: CustomerItem) => {
    try {
      setLoadingPreview(true);
      const res = await adminApi.getCustomerPreviewData(c._id);
      if (res && res.previewUser) {
        setPreviewUser(res);
      }
    } catch (err: any) {
      onShowToast(err.message || "Failed to load account preview", "error");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141B2D] p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Advanced Customer & User Management</span>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  {customers.length} Registered Users
                </span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Full-fidelity customer dossier, granular 12-point restrictions, email/mobile updates, and security audit log
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh customer registry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync Registry</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#141B2D] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by customer name, email, mobile number, or User ID..."
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-9 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier Filter */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
            <button
              onClick={() => { setTierFilter("all"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tierFilter === "all" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs" : "text-neutral-500"
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => { setTierFilter("VIP"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                tierFilter === "VIP" ? "bg-amber-500 text-neutral-950 shadow-xs font-black" : "text-neutral-500 hover:text-amber-500"
              }`}
            >
              <Crown className="w-3 h-3 text-amber-500" />
              <span>VIP</span>
            </button>
            <button
              onClick={() => { setTierFilter("Normal"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tierFilter === "Normal" ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs" : "text-neutral-500"
              }`}
            >
              Normal
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
          >
            <option value="all">All Account States</option>
            <option value="active">Active Only</option>
            <option value="blocked">Login Blocked</option>
            <option value="restricted">Feature Restricted</option>
          </select>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white dark:bg-[#141B2D] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/75 dark:bg-neutral-900/60 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Customer / User ID</th>
                <th className="py-3.5 px-4 font-bold">Contact Details</th>
                <th className="py-3.5 px-4 font-bold">Orders & Spend</th>
                <th className="py-3.5 px-4 font-bold">VIP Status</th>
                <th className="py-3.5 px-4 font-bold">Account State</th>
                <th className="py-3.5 px-4 font-bold">Restrictions</th>
                <th className="py-3.5 px-4 font-bold text-right sticky right-0 bg-neutral-50/95 dark:bg-neutral-900/95 shadow-sm">
                  Management Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Users className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="font-medium text-xs">No registered customers found matching current filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const isVip = c.tier === "VIP" || c.tier === "Platinum" || (c.ordersCount || 0) > 10;
                  const activeBlocksCount = c.activeRestrictionsCount || Object.values(c.restrictions || {}).filter((r: any) => r?.enabled).length;

                  return (
                    <tr
                      key={c._id}
                      className="hover:bg-amber-50/30 dark:hover:bg-neutral-800/40 transition-colors group"
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold flex items-center justify-center shrink-0 uppercase">
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              (c.name || c.email).slice(0, 2)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{c.fullName || c.name || "Customer"}</span>
                              {c.verified && (
                                <span title="Verified Member">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-neutral-400 mt-0.5 truncate">
                              ID: {c._id.length > 12 ? `${c._id.slice(0, 6)}...${c._id.slice(-4)}` : c._id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-neutral-800 dark:text-neutral-200 text-xs truncate max-w-[200px]" title={c.email}>
                          {c.email}
                        </div>
                        <div className="font-mono text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{c.phone || c.mobileNumber || "No mobile"}</span>
                        </div>
                      </td>

                      {/* Orders & Spend */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white">
                          {c.ordersCount || 0} Orders
                        </div>
                        <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
                          ₹{(c.lifetimeSpend || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      {/* VIP Status */}
                      <td className="py-3 px-4">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Crown className="w-3 h-3 text-amber-500" />
                            <span>VIP Guild</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            <UserCheck className="w-3 h-3 text-neutral-400" />
                            <span>Standard</span>
                          </span>
                        )}
                      </td>

                      {/* Account State */}
                      <td className="py-3 px-4">
                        {c.isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                            <Ban className="w-3 h-3" />
                            <span>Blocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Restrictions Badge */}
                      <td className="py-3 px-4">
                        {activeBlocksCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setViewCustomer(c);
                              setActiveTab("restrictions");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 cursor-pointer transition-colors"
                          >
                            <ShieldAlert className="w-3 h-3 text-amber-600" />
                            <span>{activeBlocksCount} Restricted</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Clean</span>
                          </span>
                        )}
                      </td>

                      {/* Actions Column (Sticky on right) */}
                      <td className="py-3 px-4 text-right sticky right-0 bg-white/95 dark:bg-[#141B2D]/95 backdrop-blur-sm shadow-xs">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setViewCustomer(c);
                              setActiveTab("overview");
                            }}
                            title="View Customer Dossier"
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
                            <span>View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            title="Edit Customer Profile"
                            className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock Button */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(c)}
                              title={c.isBlocked ? "Unblock Login Access" : "Block Account Login"}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                c.isBlocked
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                              }`}
                            >
                              {c.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* Preview Mode Button */}
                          <button
                            type="button"
                            onClick={() => handleLaunchPreview(c)}
                            title="Open Authorized Customer Account Preview"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        {filteredCustomers.length > pageSize && (
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredCustomers.length)} of {filteredCustomers.length} customers
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 font-mono font-bold text-neutral-900 dark:text-white">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 disabled:opacity-40 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW CUSTOMER ACCOUNT DOSSIER MODAL (10 TABS + PORTAL) */}
      {/* ========================================================================= */}
      {viewCustomer && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setViewCustomer(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-900 dark:text-white">
                      {dossierData?.customer?.name || viewCustomer.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                      {dossierData?.customer?.tier || viewCustomer.tier}
                    </span>
                    {dossierData?.customer?.isBlocked && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/30">
                        Login Blocked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 font-mono">
                    ID: {viewCustomer._id} • {viewCustomer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLaunchPreview(viewCustomer)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewCustomer(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs Navigation (10 Distinct Tabs) */}
            <div className="flex items-center gap-1 px-6 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto bg-neutral-50/30 dark:bg-neutral-900/50 shrink-0 text-xs font-semibold scrollbar-none">
              {[
                { id: "overview", label: "Overview", icon: Users },
                { id: "profile", label: "Profile Info", icon: Edit3 },
                { id: "orders", label: `Orders (${dossierData?.orders?.length || viewCustomer.ordersCount || 0})`, icon: ShoppingBag },
                { id: "addresses", label: "Addresses", icon: FileText },
                { id: "discountCards", label: "Discount Cards", icon: CreditCard },
                { id: "payments", label: "Payment & COD", icon: Wallet },
                { id: "restrictions", label: "Restrictions & Blocks", icon: ShieldAlert },
                { id: "tickets", label: `Support (${dossierData?.tickets?.length || 0})`, icon: MessageSquare },
                { id: "security", label: "Security & Changes", icon: Key },
                { id: "history", label: "Activity History", icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-3.5 border-b-2 font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                      active
                        ? "border-amber-500 text-amber-600 dark:text-amber-400 font-bold bg-white/50 dark:bg-neutral-800/50"
                        : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDossier ? (
                <div className="py-20 text-center text-neutral-500">
                  <RefreshCw className="w-7 h-7 mx-auto animate-spin text-amber-500 mb-2" />
                  <p className="text-xs">Loading complete customer record...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {activeTab === "overview" && (
                    <div className="space-y-6">
                      {/* Metric Summary Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">Total Orders</span>
                          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                            {dossierData?.orders?.length || viewCustomer.ordersCount || 0}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">Lifetime Spend</span>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                            ₹{(dossierData?.customer?.lifetimeSpend || viewCustomer.lifetimeSpend || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">VIP Loyalty Tier</span>
                          <p className="text-base font-bold text-amber-500 mt-1 flex items-center gap-1">
                            <Crown className="w-4 h-4" />
                            <span>{dossierData?.customer?.tier || viewCustomer.tier}</span>
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                          <span className="text-[10px] font-mono text-neutral-500 uppercase">Account State</span>
                          <p className="text-base font-bold text-neutral-900 dark:text-white mt-1">
                            {dossierData?.customer?.isBlocked ? (
                              <span className="text-rose-600 flex items-center gap-1"><Ban className="w-4 h-4" /> Blocked</span>
                            ) : (
                              <span className="text-emerald-600 flex items-center gap-1"><Check className="w-4 h-4" /> Good Standing</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Active Restrictions Banner if any */}
                      {Object.values(dossierData?.customer?.restrictions || {}).some((r: any) => r?.enabled) && (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1 text-xs">
                            <h4 className="font-bold text-amber-900 dark:text-amber-200">Active Account Restrictions</h4>
                            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                              This customer has active restrictions on specific features. Check the "Restrictions & Blocks" tab to manage individual controls.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTab("restrictions")}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      )}

                      {/* Contact & Registration Info Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                          <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                            Contact Information
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                              <span className="text-neutral-500">Full Name</span>
                              <span className="font-bold text-neutral-900 dark:text-white">{dossierData?.customer?.fullName || viewCustomer.name}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                              <span className="text-neutral-500">Email Address</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-neutral-900 dark:text-white">{dossierData?.customer?.email || viewCustomer.email}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmail(viewCustomer)}
                                  className="text-amber-600 text-[11px] font-bold hover:underline"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-900">
                              <span className="text-neutral-500">Mobile Number</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-neutral-900 dark:text-white">{dossierData?.customer?.phone || viewCustomer.phone || "None"}</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPhone(viewCustomer)}
                                  className="text-amber-600 text-[11px] font-bold hover:underline"
                                >
                                  Change
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between py-1">
                              <span className="text-neutral-500">Verification</span>
                              <span className="font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Internal Admin Notes */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                              Internal Staff Notes
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(viewCustomer)}
                              className="text-amber-600 text-xs font-bold hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" /> Edit
                            </button>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-800 italic">
                            {dossierData?.customer?.adminNotes || "No staff notes recorded for this customer yet."}
                          </p>
                          <div className="pt-2 text-[11px] text-neutral-400 font-mono">
                            Registered on: {new Date(viewCustomer.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROFILE INFORMATION */}
                  {activeTab === "profile" && (
                    <div className="space-y-4 max-w-2xl">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          Editable Customer Profile Information
                        </h4>
                        <span className="text-[11px] text-neutral-400">
                          Clear distinction between editable and read-only account data
                        </span>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                              Full Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                              Loyalty Tier
                            </label>
                            <select
                              value={editForm.tier}
                              onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                              className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                            >
                              <option value="Normal">Normal Member</option>
                              <option value="VIP">VIP Guild</option>
                              <option value="Silver">Silver Tier</option>
                              <option value="Gold">Gold Tier</option>
                              <option value="Platinum">Platinum Atelier</option>
                            </select>
                          </div>
                        </div>

                        {/* Read-Only Credentials Section */}
                        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                          <span className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider">
                            Read-Only Account Credentials (Managed via Security Actions)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-neutral-400 block text-[11px]">Email Address</span>
                              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{viewCustomer.email}</span>
                            </div>
                            <div>
                              <span className="text-neutral-400 block text-[11px]">User ID</span>
                              <span className="font-mono text-neutral-600 dark:text-neutral-400">{viewCustomer._id}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                            Internal Staff Note
                          </label>
                          <textarea
                            rows={3}
                            value={editForm.adminNotes}
                            onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                            placeholder="Add VIP preferences, payment terms, or customer care history notes..."
                            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                          >
                            {savingProfile ? "Saving..." : "Save Profile Information"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: ORDERS */}
                  {activeTab === "orders" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                          Customer Order History ({dossierData?.orders?.length || 0})
                        </h4>
                        <span className="text-xs font-mono font-bold text-emerald-600">
                          Total Value: ₹{(dossierData?.customer?.lifetimeSpend || 0).toLocaleString("en-IN")}
                        </span>
                      </div>

                      {(!dossierData?.orders || dossierData.orders.length === 0) ? (
                        <div className="py-12 text-center text-neutral-500 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                          <ShoppingBag className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                          <p className="text-xs font-medium">No order records placed by this user yet.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 dark:bg-neutral-950 font-mono text-[10px] text-neutral-500 uppercase">
                              <tr>
                                <th className="p-3">Order #</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Items</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                              {dossierData.orders.map((ord: any) => (
                                <tr key={ord._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                  <td className="p-3 font-mono font-bold text-amber-600">{ord.orderNumber}</td>
                                  <td className="p-3 text-neutral-500">{new Date(ord.createdAt).toLocaleDateString()}</td>
                                  <td className="p-3 text-neutral-700 dark:text-neutral-300">{ord.items?.length || 1} items</td>
                                  <td className="p-3 font-mono font-bold">₹{Number(ord.total || 0).toLocaleString("en-IN")}</td>
                                  <td className="p-3 font-mono text-[11px] text-neutral-500">{ord.paymentMethod || "CARD"}</td>
                                  <td className="p-3">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                      {ord.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: ADDRESSES */}
                  {activeTab === "addresses" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Saved Shipping & Billing Addresses
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {(dossierData?.customer?.addresses || []).map((addr: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 relative space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-neutral-900 dark:text-white">{addr.name || "Recipient"}</span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                              {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                            </p>
                            <div className="font-mono text-[11px] text-neutral-400">
                              Phone: {addr.phone || "Not specified"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: DISCOUNT CARDS & COUPONS */}
                  {activeTab === "discountCards" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Available Discount Cards & Active Promos
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {(dossierData?.discountCards || []).map((card: any) => (
                          <div
                            key={card.id}
                            className="p-5 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border border-amber-500/30 shadow-lg relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-serif font-bold text-amber-400 flex items-center gap-1.5">
                                <Crown className="w-4 h-4" /> {card.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                card.active ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                              }`}>
                                {card.active ? "Active" : "Blocked by Admin"}
                              </span>
                            </div>
                            <div className="font-mono text-xl font-bold tracking-wider text-white mt-3">
                              {card.code}
                            </div>
                            <div className="flex items-center justify-between mt-3 text-[11px] text-neutral-400">
                              <span>Benefit: {card.discountPercent}% Instant Off</span>
                              <span>Valid: {card.expiry}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 6: PAYMENT & COD */}
                  {activeTab === "payments" && (
                    <div className="space-y-4 max-w-xl">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Payment Methods & Cash on Delivery (COD) Rules
                      </h4>
                      <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-neutral-200 dark:border-neutral-900">
                          <span className="text-neutral-500">Cash on Delivery (COD)</span>
                          <span className={`font-bold ${dossierData?.paymentStats?.codAllowed ? "text-emerald-600" : "text-rose-600"}`}>
                            {dossierData?.paymentStats?.codAllowed ? "Permitted" : "Blocked"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-neutral-200 dark:border-neutral-900">
                          <span className="text-neutral-500">Online Gateways (Cards/bKash/Nagad)</span>
                          <span className={`font-bold ${dossierData?.paymentStats?.onlinePaymentAllowed ? "text-emerald-600" : "text-rose-600"}`}>
                            {dossierData?.paymentStats?.onlinePaymentAllowed ? "Permitted" : "Blocked"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-neutral-500">Refund Capability</span>
                          <span className={`font-bold ${dossierData?.paymentStats?.refundsAllowed ? "text-emerald-600" : "text-rose-600"}`}>
                            {dossierData?.paymentStats?.refundsAllowed ? "Active" : "Restricted"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 7: RESTRICTIONS & BLOCKS (THE 12 INDEPENDENT CONTROLS) */}
                  {activeTab === "restrictions" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <span>12-Point Independent Feature Restrictions</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/30">
                              Granular Enforcement
                            </span>
                          </h4>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Each restriction operates independently without disabling unrelated user functionality.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {RESTRICTION_CONFIGS.map((r) => {
                          const Icon = r.icon;
                          const currentRestriction = dossierData?.customer?.restrictions?.[r.key];
                          const isRestricted = Boolean(currentRestriction?.enabled);

                          return (
                            <div
                              key={r.key}
                              className={`p-4 rounded-2xl border transition-all ${
                                isRestricted
                                  ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60"
                                  : "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <div className={`p-2 rounded-xl mt-0.5 ${
                                    isRestricted ? "bg-rose-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-neutral-900 dark:text-white">{r.label}</span>
                                      {r.superAdminOnly && (
                                        <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                          SUPER ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-neutral-500 mt-0.5">{r.desc}</p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleOpenRestriction(viewCustomer, r, isRestricted)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    isRestricted
                                      ? "bg-rose-600 hover:bg-rose-500 text-white"
                                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200"
                                  }`}
                                >
                                  {isRestricted ? "Restricted (Unblock)" : "Enable Block"}
                                </button>
                              </div>

                              {isRestricted && currentRestriction && (
                                <div className="mt-3 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 text-[11px] space-y-1 text-rose-800 dark:text-rose-300">
                                  <div>
                                    <strong>Reason:</strong> {currentRestriction.reason || "Administrative block"}
                                  </div>
                                  <div className="text-neutral-500 font-mono text-[10px]">
                                    Applied by {currentRestriction.appliedBy || "Admin"} on{" "}
                                    {new Date(currentRestriction.appliedAt || Date.now()).toLocaleString()}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Restriction Audit History */}
                      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                          Restriction Modification Audit Log
                        </h5>
                        {(!dossierData?.customer?.restrictionAuditLog || dossierData.customer.restrictionAuditLog.length === 0) ? (
                          <p className="text-xs text-neutral-400 italic">No restrictions have been modified for this customer.</p>
                        ) : (
                          <div className="space-y-2">
                            {dossierData.customer.restrictionAuditLog.map((log: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-neutral-900 dark:text-white capitalize">
                                    {log.restrictionKey?.replace("_", " ")} {log.action}
                                  </span>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">
                                    Reason: {log.reason} • By: {log.performedBy}
                                  </p>
                                </div>
                                <span className="font-mono text-[10px] text-neutral-400">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 8: SUPPORT TICKETS */}
                  {activeTab === "tickets" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Customer Care Inquiries & Tickets ({dossierData?.tickets?.length || 0})
                      </h4>
                      {(!dossierData?.tickets || dossierData.tickets.length === 0) ? (
                        <div className="py-12 text-center text-neutral-500 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                          <MessageSquare className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                          <p className="text-xs font-medium">No customer care tickets registered for this user.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dossierData.tickets.map((t: any) => (
                            <div
                              key={t._id}
                              className="p-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                            >
                              <div>
                                <span className="font-mono text-[10px] font-bold text-amber-600">{t.ticketId}</span>
                                <h5 className="font-bold text-xs text-neutral-900 dark:text-white mt-0.5">{t.subject}</h5>
                                <p className="text-[11px] text-neutral-500 mt-0.5">
                                  Category: {t.category} • Priority: {t.priority}
                                </p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                {t.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 9: SECURITY & ACCOUNT CHANGES */}
                  {activeTab === "security" && (
                    <div className="space-y-6 max-w-2xl">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Sensitive Security Operations
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => handleOpenEmail(viewCustomer)}
                          className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-left transition-colors cursor-pointer"
                        >
                          <Mail className="w-5 h-5 text-amber-500 mb-2" />
                          <div className="font-bold text-xs text-neutral-900 dark:text-white">Change Email</div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Validate and replace email address</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPhone(viewCustomer)}
                          className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-left transition-colors cursor-pointer"
                        >
                          <Phone className="w-5 h-5 text-amber-500 mb-2" />
                          <div className="font-bold text-xs text-neutral-900 dark:text-white">Change Mobile</div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Update mobile & country code</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenPassword(viewCustomer)}
                          className="p-4 rounded-2xl bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-950 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-left transition-colors cursor-pointer"
                        >
                          <Key className="w-5 h-5 text-amber-500 mb-2" />
                          <div className="font-bold text-xs text-neutral-900 dark:text-white">Reset Password</div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">Trigger link or temporary pass</p>
                        </button>
                      </div>

                      {/* Security Audit Log */}
                      <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-500 font-mono">
                          Security & Account Changes Audit Log
                        </h5>
                        {(!dossierData?.customer?.securityAuditLog || dossierData.customer.securityAuditLog.length === 0) ? (
                          <p className="text-xs text-neutral-400 italic">No security actions recorded for this customer.</p>
                        ) : (
                          <div className="space-y-2">
                            {dossierData.customer.securityAuditLog.map((log: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs flex items-center justify-between"
                              >
                                <div>
                                  <span className="font-bold text-neutral-900 dark:text-white">{log.action}</span>
                                  <p className="text-[11px] text-neutral-500 mt-0.5">
                                    {log.details} • By: {log.performedBy}
                                  </p>
                                </div>
                                <span className="font-mono text-[10px] text-neutral-400">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 10: ACTIVITY HISTORY */}
                  {activeTab === "history" && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                        Customer Activity Timeline
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs">
                          <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-neutral-900 dark:text-white">Account Registration Verified</span>
                            <p className="text-[11px] text-neutral-500 mt-0.5">Customer enrolled in platform database.</p>
                            <span className="font-mono text-[10px] text-neutral-400">{new Date(viewCustomer.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-neutral-400">
                Authorized Admin Console • All changes securely logged
              </span>
              <button
                type="button"
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 2. DIRECT EDIT PROFILE MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {editCustomer && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setEditCustomer(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-500" />
                <span>Edit Customer Profile</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditCustomer(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={editForm.mobileNumber}
                    onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  VIP / Loyalty Tier
                </label>
                <select
                  value={editForm.tier}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white"
                >
                  <option value="Normal">Normal Member</option>
                  <option value="VIP">VIP Guild</option>
                  <option value="Silver">Silver Tier</option>
                  <option value="Gold">Gold Tier</option>
                  <option value="Platinum">Platinum Atelier</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.adminNotes}
                  onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditCustomer(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 3. RESTRICTION TOGGLE CONFIRMATION MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {targetRestriction && restrictionModalUser && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setTargetRestriction(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  {targetRestriction.currentState ? "Lift Restriction" : "Apply Restriction"}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">{targetRestriction.label}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Target Customer: <strong>{restrictionModalUser.name}</strong> ({restrictionModalUser.email}).
            </p>

            <form onSubmit={handleSubmitRestriction} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Reason for Action *
                </label>
                <input
                  type="text"
                  required
                  value={restrictionReason}
                  onChange={(e) => setRestrictionReason(e.target.value)}
                  placeholder="e.g. Excessive COD cancellations, suspicious return claims, customer request..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Internal Staff Note (Optional)
                </label>
                <input
                  type="text"
                  value={restrictionAdminNote}
                  onChange={(e) => setRestrictionAdminNote(e.target.value)}
                  placeholder="Private internal guidance for customer care..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Optional Expiration Date
                </label>
                <input
                  type="date"
                  value={restrictionExpiry}
                  onChange={(e) => setRestrictionExpiry(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setTargetRestriction(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRestriction}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs ${
                    targetRestriction.currentState ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {submittingRestriction ? "Saving..." : targetRestriction.currentState ? "Lift Restriction" : "Confirm Block"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 4. CHANGE EMAIL MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {emailModalUser && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setEmailModalUser(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Mail className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Change Email Address</h3>
            </div>

            <p className="text-xs text-neutral-500">
              Current Email: <strong className="text-neutral-900 dark:text-white">{emailModalUser.email}</strong>
            </p>

            <form onSubmit={handleSubmitEmail} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  New Verified Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  placeholder="client@newdomain.com"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Reason for Email Change
                </label>
                <input
                  type="text"
                  value={emailChangeReason}
                  onChange={(e) => setEmailChangeReason(e.target.value)}
                  placeholder="Customer ticket #TKT-1049 requested corporate domain update..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEmailModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEmail}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  {submittingEmail ? "Updating..." : "Update Email"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 5. CHANGE MOBILE NUMBER MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {phoneModalUser && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setPhoneModalUser(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Phone className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Change Mobile Number</h3>
            </div>

            <p className="text-xs text-neutral-500">
              Current Mobile: <strong className="text-neutral-900 dark:text-white">{phoneModalUser.phone || phoneModalUser.mobileNumber || "None"}</strong>
            </p>

            <form onSubmit={handleSubmitPhone} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Country Code
                  </label>
                  <input
                    type="text"
                    value={countryCodeInput}
                    onChange={(e) => setCountryCodeInput(e.target.value)}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    New Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    placeholder="1711223344"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Reason for Update
                </label>
                <input
                  type="text"
                  value={phoneChangeReason}
                  onChange={(e) => setPhoneChangeReason(e.target.value)}
                  placeholder="Primary contact number SIM lost/replaced..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setPhoneModalUser(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPhone}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  {submittingPhone ? "Updating..." : "Update Mobile"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 6. PASSWORD RESET MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {passwordModalUser && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setPasswordModalUser(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">Customer Password Management</h3>
            </div>

            <p className="text-xs text-neutral-500">
              Customer: <strong className="text-neutral-900 dark:text-white">{passwordModalUser.name}</strong> ({passwordModalUser.email})
            </p>

            {tempPasswordResult ? (
              <div className="space-y-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Temporary Password Generated Successfully!</span>
                </div>
                <div className="p-3 bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-700 rounded-xl font-mono text-center text-sm font-bold text-emerald-600 select-all">
                  {tempPasswordResult}
                </div>
                <p className="text-neutral-500 text-[11px] leading-relaxed">
                  Provide this one-time credential to the customer securely. They will be required to change it upon first login. Plaintext passwords are never stored.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(tempPasswordResult);
                    onShowToast("Temporary password copied to clipboard!", "success");
                    setPasswordModalUser(null);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Copy Password & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1.5">
                    Select Workflow Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPasswordMode("link")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        passwordMode === "link"
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 font-bold text-amber-700 dark:text-amber-300"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <div className="font-bold">Send Reset Link</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Email secure reset token</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPasswordMode("temporary")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        passwordMode === "temporary"
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 font-bold text-amber-700 dark:text-amber-300"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      <div className="font-bold">One-Time Temp Pass</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Direct emergency override</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    Administrative Reason *
                  </label>
                  <input
                    type="text"
                    required
                    value={passwordReason}
                    onChange={(e) => setPasswordReason(e.target.value)}
                    placeholder="Customer verification call, lockout recovery..."
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setPasswordModalUser(null)}
                    className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                  >
                    {submittingPassword ? "Processing..." : passwordMode === "temporary" ? "Generate Temporary Password" : "Send Password Reset Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* 7. AUTHORIZED ADMIN PREVIEW MODE MODAL (PORTAL) */}
      {/* ========================================================================= */}
      {previewUser && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
          onClick={() => setPreviewUser(null)}
        >
          <div
            className="bg-neutral-900 border border-amber-500/40 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-white animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Banner */}
            <div className="px-6 py-3 bg-amber-500 text-neutral-950 flex items-center justify-between shrink-0 font-bold text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Authorized Administrator Customer Account Preview Mode (Read-Only)</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-neutral-950/20 px-2 py-0.5 rounded">
                Zero-Impersonation • Passwords Protected
              </span>
            </div>

            {/* Profile Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-lg flex items-center justify-center">
                  {(previewUser.previewUser?.name || "C").slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{previewUser.previewUser?.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {previewUser.previewUser?.tier}
                    </span>
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    {previewUser.previewUser?.email} • {previewUser.previewUser?.phone || "No phone"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewUser(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Preview Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Account Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Member Account Status</span>
                  <p className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Active Sovereign Member
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">Orders Placed</span>
                  <p className="text-base font-bold text-white font-mono mt-1">
                    {previewUser.orders?.length || 0} Orders
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono">VIP Discount Access</span>
                  <p className="text-base font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> 15% VIP Atelier Benefit
                  </p>
                </div>
              </div>

              {/* Order History Preview */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-mono">
                  Recent Orders in Customer View
                </h4>
                {(!previewUser.orders || previewUser.orders.length === 0) ? (
                  <p className="text-neutral-500 italic">No orders recorded in customer view.</p>
                ) : (
                  <div className="space-y-2">
                    {previewUser.orders.map((ord: any) => (
                      <div
                        key={ord._id}
                        className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-amber-400">{ord.orderNumber}</span>
                          <span className="text-neutral-500 ml-2">({new Date(ord.createdAt).toLocaleDateString()})</span>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {ord.items?.length || 1} items • Method: {ord.paymentMethod || "CARD"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-white">₹{Number(ord.total || 0).toLocaleString("en-IN")}</div>
                          <span className="text-[10px] font-bold uppercase text-amber-400">{ord.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
              <span>Admin Preview Mode operates securely without generating user session tokens.</span>
              <button
                type="button"
                onClick={() => setPreviewUser(null)}
                className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
