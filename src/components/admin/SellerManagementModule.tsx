import React, { useEffect, useMemo, useState } from "react";
import {
  Store,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Search,
  Download,
  Eye,
  Edit3,
  Lock,
  KeyRound,
  LogOut,
  Package,
  ShoppingBag,
  DollarSign,
  Headphones,
  Settings,
  AlertTriangle,
  Plus,
  RefreshCw,
  FileText,
  MessageSquare,
  ArrowUpRight,
  Sliders,
  History,
  Check,
  X,
  UserCheck,
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";
import { SellerVerificationRequestsPanel } from "./SellerVerificationRequestsPanel";
import { MarketplaceSettingsDashboard } from "../settings/MarketplaceSettingsDashboard";

export type SellerSubSection =
  | "all_sellers"
  | "pending_applications"
  | "verification_requests"
  | "approved_sellers"
  | "rejected_applications"
  | "suspended_sellers"
  | "login_status"
  | "seller_stores"
  | "seller_products"
  | "seller_orders"
  | "seller_sales"
  | "seller_support"
  | "seller_settings";

interface SellerManagementModuleProps {
  sellers: any[];
  products: any[];
  orders: any[];
  activityLogs: any[];
  currentAdmin?: { name?: string; email?: string; role?: string } | null;
  onRefreshAll: () => Promise<void> | void;
  onEditProductModal?: (product: any) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => Promise<void> | void;
  onDownloadExcel?: (rows: Record<string, any>[], filename: string, sheetName: string) => void;
  showToast: (msg: string, isError?: boolean) => void;
}

const SUB_SECTIONS: Array<{
  id: SellerSubSection;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "all_sellers", label: "All Sellers", shortLabel: "All Sellers", icon: Users },
  { id: "pending_applications", label: "Pending Applications", shortLabel: "Pending Apps", icon: Clock },
  { id: "verification_requests", label: "Verification Requests", shortLabel: "NID & Face Review", icon: UserCheck },
  { id: "approved_sellers", label: "Approved Sellers", shortLabel: "Approved", icon: CheckCircle2 },
  { id: "rejected_applications", label: "Rejected Applications", shortLabel: "Rejected", icon: XCircle },
  { id: "suspended_sellers", label: "Suspended Sellers", shortLabel: "Suspended", icon: ShieldAlert },
  { id: "login_status", label: "Seller Login & Account Status", shortLabel: "Login & Auth", icon: KeyRound },
  { id: "seller_stores", label: "Seller Stores", shortLabel: "Stores", icon: Store },
  { id: "seller_products", label: "Seller Products", shortLabel: "Products", icon: Package },
  { id: "seller_orders", label: "Seller Orders", shortLabel: "Orders", icon: ShoppingBag },
  { id: "seller_sales", label: "Seller Sales & Reports", shortLabel: "Sales & Payouts", icon: DollarSign },
  { id: "seller_support", label: "Seller Complaints & Support", shortLabel: "Complaints & Care", icon: Headphones },
  { id: "seller_settings", label: "Seller Settings & Permissions", shortLabel: "Permissions & Audit", icon: Settings },
];

const PERMISSION_LABELS: Array<{ key: string; label: string; desc: string }> = [
  { key: "viewSellers", label: "View Sellers", desc: "Inspect seller applications, profiles, and stores" },
  { key: "approveSellers", label: "Approve / Reject Sellers", desc: "Approve or reject onboarding applications" },
  { key: "editSellerProfiles", label: "Edit Seller Profiles & Stores", desc: "Modify permitted profile & store status" },
  { key: "suspendSellers", label: "Suspend / Reactivate Sellers", desc: "Suspend or restore seller accounts" },
  { key: "manageSellerProducts", label: "Manage Seller Products", desc: "Approve, reject, publish, or archive listings" },
  { key: "viewSellerOrders", label: "View Seller Orders", desc: "Inspect and filter marketplace seller orders" },
  { key: "manageRefunds", label: "Manage Disputes & Refunds", desc: "Escalate or resolve seller order disputes" },
  { key: "viewFinancialReports", label: "View Financial Reports", desc: "Access seller sales & commission analytics" },
  { key: "managePayouts", label: "Manage Seller Payouts", desc: "Approve or reject seller withdrawal requests" },
  { key: "manageSellerSupport", label: "Manage Seller Support", desc: "Respond to and escalate seller support tickets" },
];

export const SellerManagementModule: React.FC<SellerManagementModuleProps> = ({
  sellers,
  products,
  orders,
  activityLogs,
  currentAdmin,
  onRefreshAll,
  onEditProductModal,
  onUpdateOrderStatus,
  onDownloadExcel,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<SellerSubSection>("all_sellers");
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [financeData, setFinanceData] = useState<{ sellerReports: any[]; withdrawals: any[] }>({
    sellerReports: [],
    withdrawals: [],
  });
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [adminStaffList, setAdminStaffList] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [campaignNominations, setCampaignNominations] = useState<any[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  // Filters & search
  const [sellerSearch, setSellerSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [kycFilter, setKycFilter] = useState<"all" | "verified" | "unverified">("all");
  const [storeStatusFilter, setStoreStatusFilter] = useState<"all" | "active" | "temporarily_disabled" | "closed">(
    "all"
  );

  // Product filters
  const [productSearch, setProductSearch] = useState("");
  const [productSellerFilter, setProductSellerFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState<
    "all" | "approved" | "pending" | "rejected" | "archived" | "out_of_stock" | "duplicates"
  >("all");

  // Order filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderSellerFilter, setOrderSellerFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Support ticket filters
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("all");

  // Selected Seller Dossier Modal
  const [selectedSellerDossier, setSelectedSellerDossier] = useState<{
    seller: any;
    products: any[];
    orders: any[];
    withdrawals: any[];
    activityLogs: any[];
  } | null>(null);
  const [dossierTab, setDossierTab] = useState<
    "overview" | "edit_profile" | "permissions" | "products" | "orders" | "notes" | "history"
  >("overview");
  const [dossierLoading, setDossierLoading] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<Record<string, any>>({});
  const [newAdminNote, setNewAdminNote] = useState("");

  // Action Confirmation Modal (Reject, Request Info, Suspend, Store Status, Revoke Session, Password Reset)
  const [actionModal, setActionModal] = useState<{
    type:
      | "reject_seller"
      | "request_info"
      | "suspend_seller"
      | "store_status"
      | "revoke_sessions"
      | "password_reset"
      | "escalate_order";
    seller?: any;
    order?: any;
    targetStoreStatus?: "active" | "temporarily_disabled" | "closed";
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Product Change History / Moderation Modal
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<any | null>(null);
  const [moderationNote, setModerationNote] = useState("");

  // New Support Ticket Modal & Ticket Reply Modal
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    sellerId: "",
    shopName: "",
    sellerEmail: "",
    category: "account_help",
    priority: "medium",
    subject: "",
    description: "",
    orderNumber: "",
    escalateToCustomerCare: false,
  });
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState("");
  const [ticketReplyInternal, setTicketReplyInternal] = useState(false);

  // Payout modal state
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(null);
  const [withdrawalAction, setWithdrawalAction] = useState<"approved" | "rejected">("approved");
  const [withdrawalRef, setWithdrawalRef] = useState("");
  const [withdrawalReason, setWithdrawalReason] = useState("");

  const loadExtendedSellerData = async () => {
    setLoadingExtra(true);
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const [ovRes, finRes, supRes, permRes, verifRes, nomRes] = await Promise.all([
        adminApi.getSellerOverview().catch(() => null),
        adminApi.getSellerFinanceSummary().catch(() => null),
        adminApi.getSellerSupportTickets().catch(() => null),
        adminApi.getAdminSellerPermissions().catch(() => null),
        adminApi.getSellerVerificationRequests().catch(() => null),
        fetch("/api/sellers/admin/campaign-nominations", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      if (ovRes?.stats) setOverviewStats(ovRes.stats);
      if (finRes?.success) {
        setFinanceData({
          sellerReports: finRes.sellerReports || [],
          withdrawals: finRes.withdrawals || [],
        });
      }
      if (supRes?.tickets) setSupportTickets(supRes.tickets);
      if (permRes?.admins) setAdminStaffList(permRes.admins);
      if (verifRes?.requests) setVerificationRequests(verifRes.requests);
      if (nomRes?.nominations) setCampaignNominations(nomRes.nominations);
    } finally {
      setLoadingExtra(false);
    }
  };

  const handleReviewCampaignNomination = async (
    sellerId: string,
    nominationId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const res = await fetch(`/api/sellers/admin/campaign-nominations/${sellerId}/${nominationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update campaign nomination");
      showToast(`Campaign nomination ${status}`);
      await loadExtendedSellerData();
    } catch (e: any) {
      showToast(e?.message || "Failed to review nomination", true);
    }
  };

  useEffect(() => {
    loadExtendedSellerData();
  }, [sellers.length, products.length, orders.length]);

  const openSellerDossier = async (
    seller: any,
    initialTab: "overview" | "edit_profile" | "permissions" | "products" | "orders" | "notes" | "history" = "overview"
  ) => {
    setDossierTab(initialTab);
    setDossierLoading(true);
    setEditProfileForm({
      shopName: seller.shopName || "",
      ownerName: seller.ownerName || "",
      email: seller.email || "",
      mobileNumber: seller.mobileNumber || "",
      category: seller.category || "Boutique & Retail",
      businessAddress: seller.businessAddress || "",
      shopAddress: seller.shopAddress || seller.businessAddress || "",
      gstin: seller.gstin || "",
      bankName: seller.bankName || "",
      bankAccountHolderName: seller.bankAccountHolderName || "",
      bankIFSC: seller.bankIFSC || "",
      storePolicy: seller.storePolicy || "",
      prepTimeMin: seller.prepTimeMin ?? 7,
      deliveryRadiusKm: seller.deliveryRadiusKm ?? 5,
      emailVerified: Boolean(seller.emailVerified),
    });
    setSelectedSellerDossier({
      seller,
      products: products.filter((p) => String(p.sellerId) === String(seller._id)),
      orders: [],
      withdrawals: [],
      activityLogs: [],
    });
    try {
      const res = await adminApi.getSellerDetails(String(seller._id));
      if (res?.success) {
        setSelectedSellerDossier({
          seller: res.seller || seller,
          products: res.products || [],
          orders: res.orders || [],
          withdrawals: res.withdrawals || [],
          activityLogs: res.activityLogs || [],
        });
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load complete seller dossier", true);
    } finally {
      setDossierLoading(false);
    }
  };

  // Computed real KPI metrics
  const kpi = useMemo(() => {
    const totalSellers = sellers.length;
    const pendingApps = sellers.filter((s) => s.status === "pending" || s.status === "review").length;
    const approvedSellers = sellers.filter((s) => s.status === "approved").length;
    const rejectedApps = sellers.filter((s) => s.status === "rejected").length;
    const suspendedSellers = sellers.filter((s) => s.status === "suspended").length;
    const activeStores = sellers.filter(
      (s) => s.status === "approved" && (s.storeStatus || "active") === "active"
    ).length;

    const totalProducts = overviewStats?.totalSellerProducts ?? products.length;
    const totalOrders = overviewStats?.totalSellerOrders ?? orders.length;
    const grossSales =
      overviewStats?.grossSellerSales ??
      orders
        .filter((o) => o.status !== "cancelled")
        .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    const platformCommission = overviewStats?.platformCommission ?? Math.round(grossSales * 0.1);
    const netEarnings = overviewStats?.netSellerEarnings ?? Math.max(0, grossSales - platformCommission);

    return {
      totalSellers,
      pendingApps,
      approvedSellers,
      rejectedApps,
      suspendedSellers,
      activeStores,
      totalProducts,
      totalOrders,
      grossSales,
      platformCommission,
      netEarnings,
    };
  }, [sellers, products, orders, overviewStats]);

  // Seller lookup map by ID and shopName
  const sellerMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const s of sellers) {
      m.set(String(s._id), s);
    }
    return m;
  }, [sellers]);

  // Filtered Sellers for current tab
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (activeTab === "pending_applications" && s.status !== "pending" && s.status !== "review") {
        return false;
      }
      if (activeTab === "approved_sellers" && s.status !== "approved") {
        return false;
      }
      if (activeTab === "rejected_applications" && s.status !== "rejected") {
        return false;
      }
      if (activeTab === "suspended_sellers" && s.status !== "suspended") {
        return false;
      }

      if (categoryFilter !== "all" && (s.category || "Boutique & Retail") !== categoryFilter) {
        return false;
      }
      if (kycFilter === "verified" && !s.kycVerified) return false;
      if (kycFilter === "unverified" && s.kycVerified) return false;
      if (storeStatusFilter !== "all" && (s.storeStatus || "active") !== storeStatusFilter) {
        return false;
      }

      if (sellerSearch.trim()) {
        const q = sellerSearch.toLowerCase().trim();
        const matchShop = s.shopName?.toLowerCase().includes(q);
        const matchOwner = s.ownerName?.toLowerCase().includes(q);
        const matchEmail = s.email?.toLowerCase().includes(q);
        const matchPhone = s.mobileNumber?.toLowerCase().includes(q);
        const matchId = String(s._id || "").toLowerCase().includes(q);
        if (!matchShop && !matchOwner && !matchEmail && !matchPhone && !matchId) return false;
      }
      return true;
    });
  }, [sellers, activeTab, categoryFilter, kycFilter, storeStatusFilter, sellerSearch]);

  // Duplicate product name detection
  const duplicateProductNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = String(p.name || "").trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    const dupes = new Set<string>();
    counts.forEach((cnt, key) => {
      if (cnt > 1) dupes.add(key);
    });
    return dupes;
  }, [products]);

  // Filtered Seller Products
  const filteredSellerProducts = useMemo(() => {
    return products.filter((p) => {
      if (productSellerFilter !== "all") {
        if (String(p.sellerId || "") !== productSellerFilter) return false;
      }
      if (productCategoryFilter !== "all" && p.category !== productCategoryFilter) {
        return false;
      }
      const modStatus = p.moderationStatus || "approved";
      const isOutOfStock = !p.inStock || Number(p.stockQuantity ?? 1) <= 0;
      const isDupe = duplicateProductNames.has(String(p.name || "").trim().toLowerCase());

      if (productStatusFilter === "approved" && modStatus !== "approved") return false;
      if (productStatusFilter === "pending" && modStatus !== "pending") return false;
      if (productStatusFilter === "rejected" && modStatus !== "rejected") return false;
      if (productStatusFilter === "archived" && modStatus !== "archived") return false;
      if (productStatusFilter === "out_of_stock" && !isOutOfStock) return false;
      if (productStatusFilter === "duplicates" && !isDupe) return false;

      if (productSearch.trim()) {
        const q = productSearch.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        const matchShop = p.sellerShopName?.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchShop) return false;
      }
      return true;
    });
  }, [products, productSellerFilter, productCategoryFilter, productStatusFilter, productSearch, duplicateProductNames]);

  // Filtered Seller Orders
  const filteredSellerOrders = useMemo(() => {
    const prodSellerLookup = new Map<string, any>();
    for (const p of products) {
      if (p.sellerId) {
        const sellerObj = sellerMap.get(String(p.sellerId));
        prodSellerLookup.set(String(p._id || p.id), {
          sellerId: String(p.sellerId),
          shopName: p.sellerShopName || sellerObj?.shopName || "Seller Store",
        });
      }
    }

    return orders
      .map((o) => {
        let resolvedSellerId = o.sellerId ? String(o.sellerId) : "";
        let resolvedShopName = o.sellerShopName || "";
        if (!resolvedSellerId && Array.isArray(o.items)) {
          for (const it of o.items) {
            if (it.sellerId) {
              resolvedSellerId = String(it.sellerId);
              resolvedShopName = it.sellerShopName || sellerMap.get(resolvedSellerId)?.shopName || "";
              break;
            }
            const found = prodSellerLookup.get(String(it.productId || it.id));
            if (found) {
              resolvedSellerId = found.sellerId;
              resolvedShopName = found.shopName;
              break;
            }
          }
        }
        if (!resolvedShopName && resolvedSellerId) {
          resolvedShopName = sellerMap.get(resolvedSellerId)?.shopName || "Partner Seller";
        }
        return {
          ...o,
          resolvedSellerId: resolvedSellerId || (sellers[0]?._id ? String(sellers[0]._id) : ""),
          resolvedShopName: resolvedShopName || sellers[0]?.shopName || "Maison Argent Storefront",
        };
      })
      .filter((o) => {
        if (orderSellerFilter !== "all" && String(o.resolvedSellerId) !== orderSellerFilter) {
          return false;
        }
        if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) {
          return false;
        }
        if (orderSearch.trim()) {
          const q = orderSearch.toLowerCase().trim();
          const matchNum = o.orderNumber?.toLowerCase().includes(q);
          const matchName = o.customerName?.toLowerCase().includes(q);
          const matchEmail = o.customerEmail?.toLowerCase().includes(q);
          const matchShop = o.resolvedShopName?.toLowerCase().includes(q);
          if (!matchNum && !matchName && !matchEmail && !matchShop) return false;
        }
        return true;
      });
  }, [orders, products, sellers, sellerMap, orderSellerFilter, orderStatusFilter, orderSearch]);

  // Handlers
  const handleDirectStatusUpdate = async (
    seller: any,
    nextStatus: "approved" | "pending" | "review" | "suspended" | "rejected",
    options?: { reason?: string; infoRequestMessage?: string }
  ) => {
    try {
      const res = await adminApi.updateSellerStatus(String(seller._id), nextStatus, options);
      showToast(`Seller "${seller.shopName}" status updated to ${nextStatus.toUpperCase()}`);
      if (selectedSellerDossier && String(selectedSellerDossier.seller._id) === String(seller._id)) {
        setSelectedSellerDossier({
          ...selectedSellerDossier,
          seller: res.seller || { ...selectedSellerDossier.seller, status: nextStatus },
        });
      }
      await onRefreshAll();
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to update seller status", true);
    }
  };

  const handleConfirmActionModal = async () => {
    if (!actionModal) return;
    setActionSubmitting(true);
    try {
      const { type, seller, order, targetStoreStatus } = actionModal;
      if (type === "reject_seller" && seller) {
        if (!actionReason.trim()) {
          showToast("Please provide a rejection reason for audit records.", true);
          setActionSubmitting(false);
          return;
        }
        await handleDirectStatusUpdate(seller, "rejected", { reason: actionReason.trim() });
      } else if (type === "request_info" && seller) {
        if (!actionReason.trim()) {
          showToast("Please specify what additional information is required from the seller.", true);
          setActionSubmitting(false);
          return;
        }
        await handleDirectStatusUpdate(seller, "review", {
          infoRequestMessage: actionReason.trim(),
          reason: `Requested Info: ${actionReason.trim()}`,
        });
      } else if (type === "suspend_seller" && seller) {
        await handleDirectStatusUpdate(seller, "suspended", {
          reason: actionReason.trim() || "Administrative suspension",
        });
      } else if (type === "store_status" && seller && targetStoreStatus) {
        const res = await adminApi.updateSellerStoreStatus(String(seller._id), {
          storeStatus: targetStoreStatus,
          reason: actionReason.trim(),
        });
        showToast(
          `Store "${seller.shopName}" status set to ${targetStoreStatus.replace("_", " ").toUpperCase()}`
        );
        if (selectedSellerDossier && String(selectedSellerDossier.seller._id) === String(seller._id)) {
          setSelectedSellerDossier({
            ...selectedSellerDossier,
            seller: res.seller,
          });
        }
        await onRefreshAll();
        await loadExtendedSellerData();
      } else if (type === "revoke_sessions" && seller) {
        const res = await adminApi.revokeSellerSessions(String(seller._id));
        showToast(res.message || `Active sessions revoked for "${seller.shopName}"`);
        if (selectedSellerDossier && String(selectedSellerDossier.seller._id) === String(seller._id)) {
          setSelectedSellerDossier({
            ...selectedSellerDossier,
            seller: res.seller,
          });
        }
        await onRefreshAll();
      } else if (type === "password_reset" && seller) {
        const res = await adminApi.triggerSellerPasswordReset(String(seller._id));
        showToast(res.message || `Password reset OTP dispatched to ${seller.email}`);
        await onRefreshAll();
      } else if (type === "escalate_order" && order) {
        await adminApi.createSellerSupportTicket({
          sellerId: order.resolvedSellerId,
          shopName: order.resolvedShopName,
          sellerEmail: order.customerEmail || "customer@alike.com",
          category: "order_issue",
          priority: "high",
          subject: `Order Escalation #${order.orderNumber} (${order.resolvedShopName})`,
          description:
            actionReason.trim() ||
            `Admin escalated Seller Order #${order.orderNumber} for Customer Care investigation.`,
          orderNumber: order.orderNumber,
          escalateToCustomerCare: true,
        });
        showToast(`Order #${order.orderNumber} escalated to Customer Care & Seller Support!`);
        await loadExtendedSellerData();
      }
      setActionModal(null);
      setActionReason("");
    } catch (err: any) {
      showToast(err.message || "Operation failed", true);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleSaveSellerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerDossier) return;
    try {
      const res = await adminApi.updateSellerProfile(
        String(selectedSellerDossier.seller._id),
        editProfileForm
      );
      showToast(`Profile & Store details updated for "${editProfileForm.shopName}"`);
      setSelectedSellerDossier({
        ...selectedSellerDossier,
        seller: res.seller,
      });
      await onRefreshAll();
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to update seller profile", true);
    }
  };

  const handleToggleSellerPermission = async (seller: any, permKey: string, currentVal: boolean) => {
    try {
      const nextVal = !currentVal;
      const res = await adminApi.updateSellerPermissions(String(seller._id), {
        [permKey]: nextVal,
      });
      showToast(`Updated ${permKey} for "${seller.shopName}"`);
      if (selectedSellerDossier && String(selectedSellerDossier.seller._id) === String(seller._id)) {
        setSelectedSellerDossier({
          ...selectedSellerDossier,
          seller: res.seller,
        });
      }
      await onRefreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to update seller permission", true);
    }
  };

  const handleAddPrivateAdminNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerDossier || !newAdminNote.trim()) return;
    try {
      const res = await adminApi.addSellerAdminNote(
        String(selectedSellerDossier.seller._id),
        newAdminNote.trim()
      );
      showToast("Private internal admin note saved");
      setNewAdminNote("");
      setSelectedSellerDossier({
        ...selectedSellerDossier,
        seller: res.seller,
      });
      await onRefreshAll();
    } catch (err: any) {
      showToast(err.message || "Failed to save admin note", true);
    }
  };

  const handleModerateProduct = async (
    product: any,
    action: "approve" | "reject" | "publish" | "unpublish" | "archive",
    note?: string
  ) => {
    try {
      const res = await adminApi.moderateSellerProduct(
        String(product._id || product.id),
        action,
        note
      );
      showToast(`Product "${product.name}" — ${action.toUpperCase()} completed`);
      if (selectedProductForHistory && String(selectedProductForHistory._id || selectedProductForHistory.id) === String(product._id || product.id)) {
        setSelectedProductForHistory(res.product);
      }
      setModerationNote("");
      await onRefreshAll();
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Product moderation failed", true);
    }
  };

  const handleProcessWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;
    try {
      await adminApi.updateSellerWithdrawal(String(selectedWithdrawal._id), {
        status: withdrawalAction,
        transactionReference: withdrawalRef.trim(),
        rejectionReason: withdrawalReason.trim(),
        note: withdrawalRef.trim() ? `Ref: ${withdrawalRef.trim()}` : undefined,
      });
      showToast(`Seller payout marked as ${withdrawalAction.toUpperCase()}`);
      setSelectedWithdrawal(null);
      setWithdrawalRef("");
      setWithdrawalReason("");
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to update withdrawal", true);
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createSellerSupportTicket(newTicketForm);
      showToast("Seller support ticket created");
      setShowCreateTicketModal(false);
      setNewTicketForm({
        sellerId: "",
        shopName: "",
        sellerEmail: "",
        category: "account_help",
        priority: "medium",
        subject: "",
        description: "",
        orderNumber: "",
        escalateToCustomerCare: false,
      });
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to create ticket", true);
    }
  };

  const handleReplySupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    try {
      const res = await adminApi.updateSellerSupportTicket(String(selectedTicket._id), {
        replyMessage: ticketReplyText.trim(),
        isInternalNote: ticketReplyInternal,
      });
      showToast(ticketReplyInternal ? "Internal note added to ticket" : "Reply sent on ticket");
      setTicketReplyText("");
      setSelectedTicket(res.ticket);
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to reply to ticket", true);
    }
  };

  const handleUpdateTicketStatus = async (ticket: any, updates: Record<string, any>) => {
    try {
      const res = await adminApi.updateSellerSupportTicket(String(ticket._id), updates);
      showToast("Ticket updated");
      if (selectedTicket && String(selectedTicket._id) === String(ticket._id)) {
        setSelectedTicket(res.ticket);
      }
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Failed to update ticket", true);
    }
  };

  const handleToggleStaffPermission = async (adminUser: any, permKey: string) => {
    const currentPerms = adminUser.sellerManagementPermissions || {};
    const updatedPerms = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey],
    };
    try {
      await adminApi.updateAdminSellerPermissions(String(adminUser._id), updatedPerms);
      showToast(`Updated ${permKey} for ${adminUser.email}`);
      await loadExtendedSellerData();
    } catch (err: any) {
      showToast(err.message || "Only Super Admin can change staff permissions", true);
    }
  };

  const renderStatusBadge = (status: string) => {
    const st = (status || "pending").toLowerCase();
    const styles: Record<string, string> = {
      approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      review: "bg-sky-500/15 text-sky-300 border-sky-500/30",
      suspended: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      rejected: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 text-[10px] tracking-widest uppercase font-semibold border rounded ${
          styles[st] || styles.pending
        }`}
      >
        {st === "review" ? "UNDER REVIEW" : st}
      </span>
    );
  };

  const renderStoreStatusBadge = (storeStatus?: string) => {
    const st = storeStatus || "active";
    if (st === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active Store
        </span>
      );
    }
    if (st === "temporarily_disabled") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Temp Disabled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/25 rounded">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Closed
      </span>
    );
  };

  const renderSellerTable = () => (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={sellerSearch}
            onChange={(e) => setSellerSearch(e.target.value)}
            placeholder="Search by store name, seller name, email, mobile, or ID..."
            className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All KYC Status</option>
            <option value="verified">KYC Verified</option>
            <option value="unverified">KYC Pending</option>
          </select>
          <select
            value={storeStatusFilter}
            onChange={(e) => setStoreStatusFilter(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Store States</option>
            <option value="active">Active Stores</option>
            <option value="temporarily_disabled">Temporarily Disabled</option>
            <option value="closed">Closed Stores</option>
          </select>
          {onDownloadExcel && (
            <button
              onClick={() =>
                onDownloadExcel(
                  filteredSellers.map((s) => ({
                    "Seller ID": s._id,
                    "Store Name": s.shopName,
                    "Owner Name": s.ownerName,
                    Email: s.email,
                    "Mobile Number": s.mobileNumber || "N/A",
                    Category: s.category || "Boutique & Retail",
                    "Account Status": (s.status || "pending").toUpperCase(),
                    "Store Status": (s.storeStatus || "active").toUpperCase(),
                    "KYC Verified": s.kycVerified ? "Yes" : "No",
                    "Email Verified": s.emailVerified ? "Yes" : "No",
                    "Listings Count": s.listingsCount || 0,
                    "Wallet Balance (INR)": s.walletBalance || 0,
                    "Registered On": s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "",
                  })),
                  `ALIKE_Sellers_${activeTab}`,
                  "Sellers"
                )
              }
              className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3 py-2 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Excel
            </button>
          )}
        </div>
      </div>

      {/* Sellers Table */}
      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
              <th className="py-3.5 px-4">Store & Seller</th>
              <th className="py-3.5 px-4">Contact & Verification</th>
              <th className="py-3.5 px-4">KYC & Tax</th>
              <th className="py-3.5 px-4">Account & Store Status</th>
              <th className="py-3.5 px-4">Permissions</th>
              <th className="py-3.5 px-4 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 text-sm">
            {filteredSellers.map((s) => {
              const perms = s.permissions || {
                canAddProducts: true,
                canEditProducts: true,
                canManageOrders: true,
                canWithdrawPayouts: true,
                canMakeNewSales: true,
              };
              return (
                <tr key={s._id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium text-zinc-100 flex items-center gap-2">
                      <span>{s.shopName}</span>
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">Owner: {s.ownerName}</div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      {s.category || "Boutique & Retail"} • Joined{" "}
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN") : "Recently"}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="text-zinc-200">{s.email}</div>
                    <div className="text-zinc-400 mt-0.5">{s.mobileNumber || "No mobile"}</div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span
                        className={`px-1.5 py-0.5 text-[10px] rounded border ${
                          s.emailVerified
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {s.emailVerified ? "Email Verified" : "Email Unverified"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded border ${
                          s.kycVerified
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {s.kycVerified ? "KYC Verified" : "KYC Pending"}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            await adminApi.verifySellerKyc(String(s._id), !s.kycVerified);
                            showToast(`KYC ${!s.kycVerified ? "Verified" : "Revoked"} for ${s.shopName}`);
                            await onRefreshAll();
                          } catch (err: any) {
                            showToast(err.message || "Failed to update KYC", true);
                          }
                        }}
                        className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                      >
                        {s.kycVerified ? "Revoke" : "Verify"}
                      </button>
                    </div>
                    <div className="text-zinc-400">PAN: {s.panNumber || "—"}</div>
                    <div className="text-zinc-500">GST: {s.gstin || "—"}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      {renderStatusBadge(s.status)}
                      {renderStoreStatusBadge(s.storeStatus)}
                      {s.rejectionReason && s.status === "rejected" && (
                        <div className="text-[11px] text-rose-400 max-w-[200px] truncate" title={s.rejectionReason}>
                          Reason: {s.rejectionReason}
                        </div>
                      )}
                      {s.infoRequestMessage && s.status === "review" && (
                        <div className="text-[11px] text-sky-400 max-w-[200px] truncate" title={s.infoRequestMessage}>
                          Info Req: {s.infoRequestMessage}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[190px]">
                      {[
                        { k: "canAddProducts", l: "Add Prod" },
                        { k: "canEditProducts", l: "Edit Prod" },
                        { k: "canManageOrders", l: "Orders" },
                        { k: "canWithdrawPayouts", l: "Payouts" },
                        { k: "canMakeNewSales", l: "Sales" },
                      ].map((item) => {
                        const enabled = perms[item.k] !== false;
                        return (
                          <button
                            key={item.k}
                            onClick={() => handleToggleSellerPermission(s, item.k, enabled)}
                            title={`Click to ${enabled ? "restrict" : "restore"} ${item.l}`}
                            className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                              enabled
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25 line-through"
                            }`}
                          >
                            {item.l}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => openSellerDossier(s, "overview")}
                        className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" /> View / Manage
                      </button>
                      {s.status !== "approved" && (
                        <button
                          onClick={() => handleDirectStatusUpdate(s, "approved")}
                          className="px-2.5 py-1.5 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer"
                        >
                          {s.status === "suspended" ? "Reactivate" : "Approve"}
                        </button>
                      )}
                      {(s.status === "pending" || s.status === "review") && (
                        <>
                          <button
                            onClick={() => {
                              setActionReason("");
                              setActionModal({ type: "request_info", seller: s });
                            }}
                            className="px-2.5 py-1.5 text-xs bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 transition-colors cursor-pointer"
                          >
                            Request Info
                          </button>
                          <button
                            onClick={() => {
                              setActionReason("");
                              setActionModal({ type: "reject_seller", seller: s });
                            }}
                            className="px-2.5 py-1.5 text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {s.status === "approved" && (
                        <button
                          onClick={() => {
                            setActionReason("");
                            setActionModal({ type: "suspend_seller", seller: s });
                          }}
                          className="px-2.5 py-1.5 text-xs bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSellers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 text-sm">
                  No seller records match the selected view and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section 6: Seller Login & Authentication Controls
  const renderLoginAndAuthSection = () => (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" /> Seller Authentication & Session Security Controls
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Monitor seller login status, verify email/mobile credentials, revoke active JWT sessions immediately, or dispatch secure password-reset OTPs. Passwords are encrypted and never exposed.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                <th className="py-3 px-4">Seller & Store</th>
                <th className="py-3 px-4">Login Identifiers</th>
                <th className="py-3 px-4">Auth & Portal Access</th>
                <th className="py-3 px-4">Last Login & Session Version</th>
                <th className="py-3 px-4 text-right">Security Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {sellers.map((s) => (
                <tr key={s._id} className="hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-100">{s.shopName}</div>
                    <div className="text-zinc-400">{s.ownerName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-zinc-200">Email: {s.email}</div>
                    <div className="text-zinc-400 mt-0.5">Mobile: {s.mobileNumber || "Not set"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {renderStatusBadge(s.status)}
                      <span className="text-[11px] text-zinc-400">
                        {s.status === "approved" ? "Full Seller Portal Access" : "Restricted Portal Access"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <div>
                      Last Login:{" "}
                      {s.lastLoginAt
                        ? new Date(s.lastLoginAt).toLocaleString("en-IN")
                        : "No recorded session"}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Session Token Version: v{s.tokenVersion || 1}
                      {s.lastPasswordResetAt
                        ? ` • Reset: ${new Date(s.lastPasswordResetAt).toLocaleDateString("en-IN")}`
                        : ""}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setActionReason("");
                          setActionModal({ type: "password_reset", seller: s });
                        }}
                        className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Send Password Reset OTP
                      </button>
                      <button
                        onClick={() => {
                          setActionReason("");
                          setActionModal({ type: "revoke_sessions", seller: s });
                        }}
                        className="px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Revoke Sessions
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Section 7: Seller Stores Management
  const renderSellerStoresSection = () => (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" /> Seller Storefronts & Operational Status
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Inspect public store details, store policies, inventory counts, delivery radius, and activate, temporarily disable, or close seller stores without deleting historical records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sellers.map((s) => {
            const sellerProds = products.filter((p) => String(p.sellerId) === String(s._id));
            const sellerTickets = supportTickets.filter(
              (t) =>
                String(t.customerId) === String(s._id) ||
                t.subject?.toLowerCase().includes(String(s.shopName || "").toLowerCase())
            );
            return (
              <div
                key={s._id}
                className="bg-zinc-950 border border-zinc-800 p-4 flex flex-col justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-zinc-100 text-sm">{s.shopName}</h4>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {s.category || "Boutique & Retail"} • {s.ownerName}
                      </div>
                    </div>
                    {renderStoreStatusBadge(s.storeStatus)}
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Address:</span>{" "}
                      {s.shopAddress || s.businessAddress || "Address pending"}
                    </div>
                    <div>
                      <span className="text-zinc-500">Contact:</span> {s.email} • {s.mobileNumber || "N/A"}
                    </div>
                    <div>
                      <span className="text-zinc-500">Store Policy:</span>{" "}
                      {s.storePolicy || "Standard 7-Day Marketplace Return & Authenticity Guarantee"}
                    </div>
                    <div className="flex items-center gap-4 pt-1 text-[11px] text-zinc-400">
                      <span>Products: {sellerProds.length || s.listingsCount || 0}</span>
                      <span>Prep: {s.prepTimeMin ?? 7} mins</span>
                      <span>Radius: {s.deliveryRadiusKm ?? 5} km</span>
                      <span>Tickets: {sellerTickets.length}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => openSellerDossier(s, "edit_profile")}
                    className="px-2.5 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3 text-amber-400" /> Edit Store
                  </button>
                  <div className="flex items-center gap-1.5">
                    {(s.storeStatus || "active") !== "active" && (
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "store_status",
                            seller: s,
                            targetStoreStatus: "active",
                          })
                        }
                        className="px-2 py-1 text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                      >
                        Activate
                      </button>
                    )}
                    {(s.storeStatus || "active") !== "temporarily_disabled" && (
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "store_status",
                            seller: s,
                            targetStoreStatus: "temporarily_disabled",
                          })
                        }
                        className="px-2 py-1 text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer"
                      >
                        Temp Disable
                      </button>
                    )}
                    {(s.storeStatus || "active") !== "closed" && (
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "store_status",
                            seller: s,
                            targetStoreStatus: "closed",
                          })
                        }
                        className="px-2 py-1 text-[11px] bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                      >
                        Close Store
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Section 8: Seller Products Management
  const renderSellerProductsSection = () => {
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by title, seller store, or category..."
              className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={productSellerFilter}
              onChange={(e) => setProductSellerFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
            >
              <option value="all">All Sellers</option>
              {sellers.map((s) => (
                <option key={s._id} value={String(s._id)}>
                  {s.shopName}
                </option>
              ))}
            </select>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
            >
              <option value="all">All Listing States</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Moderation</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="duplicates">Duplicate Listings</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Seller Store</th>
                <th className="py-3.5 px-4">Price & Inventory</th>
                <th className="py-3.5 px-4">Moderation & Visibility</th>
                <th className="py-3.5 px-4 text-right">Product Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {filteredSellerProducts.map((p) => {
                const pid = String(p._id || p.id);
                const sellerObj = p.sellerId ? sellerMap.get(String(p.sellerId)) : null;
                const shopLabel = p.sellerShopName || sellerObj?.shopName || "Marketplace Seller";
                const modStatus = p.moderationStatus || "approved";
                const isDupe = duplicateProductNames.has(String(p.name || "").trim().toLowerCase());
                const isOutOfStock = !p.inStock || Number(p.stockQuantity ?? 1) <= 0;

                return (
                  <tr key={pid} className="hover:bg-zinc-800/30">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 object-cover border border-zinc-800 shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-medium text-zinc-100">{p.name}</div>
                          <div className="text-zinc-500 mt-0.5">{p.category}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {isDupe && (
                              <span className="px-1.5 py-0.5 text-[9px] uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                                Duplicate Title
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="px-1.5 py-0.5 text-[9px] uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200 font-medium">{shopLabel}</div>
                      {sellerObj && (
                        <div className="text-[11px] text-zinc-500">{sellerObj.email}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-amber-400 font-medium">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </div>
                      <div className="text-zinc-400 mt-0.5">
                        Stock: {p.stockQuantity ?? (p.inStock ? "In Stock" : 0)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded border ${
                            modStatus === "approved"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : modStatus === "pending"
                                ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                : modStatus === "rejected"
                                  ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                                  : "bg-zinc-700/40 text-zinc-300 border-zinc-600"
                          }`}
                        >
                          {modStatus}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {p.isPublished === false || p.isHidden ? "Unpublished / Hidden" : "Published Live"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {onEditProductModal && (
                          <button
                            onClick={() => onEditProductModal(p)}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                          >
                            Edit Product
                          </button>
                        )}
                        <button
                          onClick={() => handleModerateProduct(p, "approve")}
                          className="px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleModerateProduct(
                              p,
                              p.isPublished === false || p.isHidden ? "publish" : "unpublish"
                            )
                          }
                          className="px-2 py-1 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 cursor-pointer"
                        >
                          {p.isPublished === false || p.isHidden ? "Publish" : "Unpublish"}
                        </button>
                        <button
                          onClick={() => handleModerateProduct(p, "archive")}
                          className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 cursor-pointer"
                        >
                          Archive
                        </button>
                        <button
                          onClick={() => {
                            setModerationNote(p.moderationNote || "");
                            setSelectedProductForHistory(p);
                          }}
                          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer flex items-center gap-1"
                        >
                          <History className="w-3 h-3 text-amber-400" /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Section 9: Seller Orders & Customer Care Escalation
  const renderSellerOrdersSection = () => (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            placeholder="Search by order #, customer name, email, or store..."
            className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={orderSellerFilter}
            onChange={(e) => setOrderSellerFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
          >
            <option value="all">All Seller Stores</option>
            {sellers.map((s) => (
              <option key={s._id} value={String(s._id)}>
                {s.shopName}
              </option>
            ))}
          </select>
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled / Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
              <th className="py-3.5 px-4">Order & Date</th>
              <th className="py-3.5 px-4">Seller Store</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Items & Amount</th>
              <th className="py-3.5 px-4">Fulfillment & Payment</th>
              <th className="py-3.5 px-4 text-right">Order & Care Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70 text-xs">
            {filteredSellerOrders.map((o) => (
              <tr key={o._id} className="hover:bg-zinc-800/30">
                <td className="py-3.5 px-4">
                  <div className="font-mono text-amber-400 font-medium">#{o.orderNumber}</div>
                  <div className="text-zinc-500 mt-0.5">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : ""}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-zinc-200">{o.resolvedShopName}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-zinc-100">{o.customerName}</div>
                  <div className="text-zinc-500">{o.customerEmail}</div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="text-zinc-100 font-medium">
                    ₹{Number(o.total || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-zinc-500">
                    {Array.isArray(o.items) ? o.items.length : 1} item(s)
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    {onUpdateOrderStatus ? (
                      <select
                        value={o.status}
                        onChange={(e) => onUpdateOrderStatus(String(o._id), e.target.value)}
                        className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 text-xs text-zinc-200"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className="uppercase">{o.status}</span>
                    )}
                    <span className="text-[11px] text-zinc-400 uppercase">
                      ({o.paymentMethod || "Online"})
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => {
                      setActionReason("");
                      setActionModal({ type: "escalate_order", order: o });
                    }}
                    className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    <Headphones className="w-3.5 h-3.5" /> Escalate to Customer Care
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Section 10: Seller Sales, Commission & Payout Management
  const renderSellerSalesAndPayoutsSection = () => (
    <div className="space-y-6">
      {/* Per-Seller Sales & Commission Breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" /> Seller Sales, Platform Commission & Wallet Balances
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Real-time financial reconciliation calculated from marketplace orders, platform commission deductions, refunds, and seller payouts.
            </p>
          </div>
          {onDownloadExcel && (
            <button
              onClick={() =>
                onDownloadExcel(
                  financeData.sellerReports.map((r) => ({
                    "Seller Store": r.shopName,
                    Owner: r.ownerName,
                    Email: r.email,
                    Status: r.status,
                    Orders: r.orderCount,
                    "Gross Sales (INR)": r.grossSales,
                    "Platform Commission (INR)": r.commission,
                    "Refunds & Cancellations (INR)": r.refundsAndCancellations,
                    "Net Seller Earnings (INR)": r.netSales,
                    "Paid Out (INR)": r.paidOutTotal,
                    "Pending Payouts (INR)": r.pendingPayoutTotal,
                    "Available Wallet Balance (INR)": r.walletBalance,
                  })),
                  "ALIKE_Seller_Financial_Report",
                  "Seller_Finance"
                )
              }
              className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-3 py-2 text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Financial Report
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                <th className="py-3 px-4">Seller Store</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4">Commission (10%)</th>
                <th className="py-3 px-4">Refunds / Cancelled</th>
                <th className="py-3 px-4">Net Earnings</th>
                <th className="py-3 px-4">Pending Payout</th>
                <th className="py-3 px-4">Wallet Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {financeData.sellerReports.map((r) => (
                <tr key={r.sellerId} className="hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-100">{r.shopName}</div>
                    <div className="text-zinc-500">{r.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">{r.orderCount}</td>
                  <td className="py-3.5 px-4 text-zinc-100 font-medium">
                    ₹{Number(r.grossSales || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-amber-400">
                    ₹{Number(r.commission || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-rose-400">
                    ₹{Number(r.refundsAndCancellations || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-medium">
                    ₹{Number(r.netSales || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-sky-400">
                    ₹{Number(r.pendingPayoutTotal || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-100 font-semibold">
                    ₹{Number(r.walletBalance || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout / Withdrawal History & Approvals */}
      <div className="bg-zinc-900 border border-zinc-800 p-5">
        <h3 className="text-base font-medium text-zinc-100 mb-1">
          Seller Payout & Withdrawal Requests
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          Verify transaction references before marking seller payouts as completed or rejected.
        </p>

        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                <th className="py-3 px-4">Requested Date</th>
                <th className="py-3 px-4">Seller Store</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Bank / Payout Details & Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Payout Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {financeData.withdrawals.map((w) => (
                <tr key={w._id} className="hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4 text-zinc-400">
                    {w.requestedAt || w.createdAt
                      ? new Date(w.requestedAt || w.createdAt).toLocaleString("en-IN")
                      : "—"}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-100">{w.sellerShopName}</div>
                    <div className="text-zinc-500">{w.sellerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-amber-400">
                    ₹{Number(w.amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <div>{w.payoutDetails || "Registered Bank Account"}</div>
                    {w.note && <div className="text-[11px] text-zinc-500 mt-0.5">{w.note}</div>}
                    {w.rejectionReason && (
                      <div className="text-[11px] text-rose-400 mt-0.5">Reason: {w.rejectionReason}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">{renderStatusBadge(w.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    {w.status === "pending" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setWithdrawalAction("approved");
                            setWithdrawalRef("");
                            setWithdrawalReason("");
                          }}
                          className="px-2.5 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                        >
                          Approve & Verify Ref
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setWithdrawalAction("rejected");
                            setWithdrawalRef("");
                            setWithdrawalReason("");
                          }}
                          className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">
                        Processed by {w.processedByAdminEmail || "Admin"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {financeData.withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No seller withdrawal requests recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Section 11: Seller Complaints & Support
  const renderSellerSupportSection = () => {
    const filteredTickets = supportTickets.filter((t) => {
      if (ticketStatusFilter !== "all" && t.status !== ticketStatusFilter) return false;
      if (ticketPriorityFilter !== "all" && t.priority !== ticketPriorityFilter) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-amber-400" /> Seller Support Tickets & Customer Complaints
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage seller disputes, payout inquiries, verification issues, and customer complaints involving seller stores.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={ticketStatusFilter}
              onChange={(e) => setTicketStatusFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={ticketPriorityFilter}
              onChange={(e) => setTicketPriorityFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={() => setShowCreateTicketModal(true)}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Seller Ticket
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                <th className="py-3.5 px-4">Ticket #</th>
                <th className="py-3.5 px-4">Subject & Seller</th>
                <th className="py-3.5 px-4">Category & Priority</th>
                <th className="py-3.5 px-4">Assigned Staff</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 text-xs">
              {filteredTickets.map((t) => (
                <tr key={t._id || t.ticketNumber} className="hover:bg-zinc-800/30">
                  <td className="py-3.5 px-4 font-mono text-amber-400">{t.ticketNumber}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-zinc-100">{t.subject}</div>
                    <div className="text-zinc-400 mt-0.5">
                      {t.customerName} ({t.customerEmail})
                      {t.orderNumber ? ` • Order #${t.orderNumber}` : ""}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="uppercase text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded mr-1.5">
                      {String(t.category || "other").replace("_", " ")}
                    </span>
                    <span
                      className={`uppercase text-[10px] px-2 py-0.5 rounded ${
                        t.priority === "urgent" || t.priority === "high"
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    <div>{t.assignedAgentName || "Unassigned"}</div>
                    <div className="text-[11px] text-zinc-500">{t.assignedDepartment || "Seller Relations"}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateTicketStatus(t, { status: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-zinc-200"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="escalated">Escalated</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 cursor-pointer"
                      >
                        Replies & Notes ({Array.isArray(t.messages) ? t.messages.length : 0})
                      </button>
                      {t.status !== "escalated" && (
                        <button
                          onClick={() =>
                            handleUpdateTicketStatus(t, {
                              status: "escalated",
                              assignedDepartment: "Escalations",
                            })
                          }
                          className="px-2.5 py-1 bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                        >
                          Escalate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    No seller support or complaint tickets found. Click "New Seller Ticket" to log an issue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Section 12: Role-Based Admin Permissions & Seller Audit Logs
  const renderSettingsAndAuditSection = () => {
    const sellerAuditLogs = activityLogs.filter((l) => {
      const det = String(l.details || "").toLowerCase();
      return (
        det.includes("seller") ||
        det.includes("store") ||
        det.includes("kyc") ||
        det.includes("payout") ||
        det.includes("product")
      );
    });

    return (
      <div className="space-y-6">
        {/* Daraz-Inspired Marketplace Settings Dashboard (Admin Scope) */}
        <div className="rounded-xl overflow-hidden border border-zinc-800">
          <MarketplaceSettingsDashboard
            mode="admin"
            onRefreshParent={() => {
              onRefreshAll();
              loadExtendedSellerData();
            }}
          />
        </div>

        {/* Role-Based Admin Permissions Matrix */}
        <div className="bg-zinc-900 border border-zinc-800 p-5">
          <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-amber-400" /> Role-Based Admin Permissions for Seller Management
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Control which admin staff members can view sellers, approve applications, edit profiles, suspend accounts, moderate products, process refunds, and manage payouts.
          </p>

          <div className="overflow-x-auto border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] tracking-[0.15em] uppercase text-zinc-400 bg-zinc-950/60">
                  <th className="py-3 px-3">Admin Staff</th>
                  {PERMISSION_LABELS.map((p) => (
                    <th key={p.key} className="py-3 px-2 text-center" title={p.desc}>
                      {p.label.split(" ")[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-xs">
                {adminStaffList.map((adm) => {
                  const isSuper = adm.role === "superadmin";
                  const perms = adm.sellerManagementPermissions || {};
                  return (
                    <tr key={adm._id} className="hover:bg-zinc-800/30">
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-100">{adm.name}</div>
                        <div className="text-zinc-500 text-[11px]">
                          {adm.email} • <span className="uppercase text-amber-400">{adm.role}</span>
                        </div>
                      </td>
                      {PERMISSION_LABELS.map((p) => {
                        const checked = isSuper ? true : Boolean(perms[p.key]);
                        return (
                          <td key={p.key} className="py-3 px-2 text-center">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSuper || currentAdmin?.role !== "superadmin"}
                              onChange={() => handleToggleStaffPermission(adm, p.key)}
                              className="accent-amber-400 w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {adminStaffList.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-zinc-500">
                      Super Admin has full Seller Management permissions enabled by default.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller Management Audit Trail */}
        <div className="bg-zinc-900 border border-zinc-800 p-5">
          <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-amber-400" /> Seller Governance & Administrative Audit Trail
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Immutable audit log recording the acting admin, timestamp, affected seller/store, action taken, and status changes.
          </p>

          <div className="overflow-x-auto border border-zinc-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] tracking-[0.18em] uppercase text-zinc-400 bg-zinc-950/60">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Acting Admin / Actor</th>
                  <th className="py-3 px-4">Affected Account</th>
                  <th className="py-3 px-4">Action & Status Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70 text-xs">
                {sellerAuditLogs.slice(0, 50).map((log, i) => (
                  <tr key={log._id || i} className="hover:bg-zinc-800/30">
                    <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                      {log.createdAt || log.timestamp
                        ? new Date(log.createdAt || log.timestamp).toLocaleString("en-IN")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-200">{log.userName || "Administrator"}</td>
                    <td className="py-3 px-4 text-amber-400">{log.email || "—"}</td>
                    <td className="py-3 px-4 text-zinc-300">{log.details}</td>
                  </tr>
                ))}
                {sellerAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-zinc-500">
                      No seller audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller Campaign & Flash Deal Nominations Review */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-amber-400 font-semibold">
                MARKETPLACE CAMPAIGN GOVERNANCE
              </div>
              <h3 className="text-base font-serif text-zinc-100 mt-1">
                Seller Campaign, Flash Deal & Featured Product Nominations ({campaignNominations.length})
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500">
                  <th className="py-2.5 px-3">Store</th>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Promo Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {campaignNominations.map((nom: any) => (
                  <tr key={nom.id} className="hover:bg-zinc-800/40">
                    <td className="py-2.5 px-3 font-medium text-zinc-200">{nom.shopName}</td>
                    <td className="py-2.5 px-3 text-amber-400">{nom.campaignTitle}</td>
                    <td className="py-2.5 px-3 text-zinc-300">{nom.productName}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-semibold">
                      ₹{Number(nom.campaignPrice || 0).toLocaleString("en-IN")} (-{nom.discountPercent || 0}%)
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider border ${
                          nom.status === "approved"
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                            : nom.status === "rejected"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                            : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {nom.status || "pending"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1.5">
                      <button
                        onClick={() => handleReviewCampaignNomination(nom.sellerId, nom.id, "approved")}
                        className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewCampaignNomination(nom.sellerId, nom.id, "rejected")}
                        className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
                {campaignNominations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-zinc-500">
                      No seller campaign nominations submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller Account Closure Requests */}
        {sellers.some((s) => s.closureRequest?.status === "pending") && (
          <div className="bg-zinc-900 border border-rose-500/30 p-6">
            <div className="text-[10px] tracking-[0.2em] uppercase text-rose-400 font-semibold">
              ACCOUNT DEACTIVATION / CLOSURE REQUESTS
            </div>
            <h3 className="text-base font-serif text-zinc-100 mt-1 mb-4">
              Pending Seller Store Closure Requests
            </h3>
            <div className="space-y-2">
              {sellers
                .filter((s) => s.closureRequest?.status === "pending")
                .map((s) => (
                  <div
                    key={s._id}
                    className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/70 border border-zinc-800 p-3.5"
                  >
                    <div>
                      <div className="text-xs font-semibold text-zinc-100">
                        {s.shopName} ({s.email})
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Reason: {s.closureRequest?.reason || "Requested by seller"}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setActionModal({
                          type: "store_status",
                          seller: s,
                          targetStoreStatus: "closed",
                        })
                      }
                      className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[10px] uppercase tracking-wider font-semibold cursor-pointer"
                    >
                      Review & Close Storefront
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] tracking-[0.25em] uppercase text-amber-400 font-semibold">
            CENTRALIZED MARKETPLACE GOVERNANCE
          </div>
          <h2 className="text-xl font-serif tracking-wide text-zinc-100 mt-1">
            Seller Management & Storefront Control Center
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage seller applications, KYC, store operations, product moderation, seller orders, commissions, payouts, support tickets, and role-based permissions.
          </p>
        </div>
        <button
          onClick={async () => {
            await onRefreshAll();
            await loadExtendedSellerData();
            showToast("Seller metrics and records refreshed");
          }}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingExtra ? "animate-spin text-amber-400" : ""}`} />
          Refresh Real-Time Data
        </button>
      </div>

      {/* Real Database Statistics Grid (8 KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          {
            label: "Total Sellers",
            val: kpi.totalSellers,
            sub: `${kpi.rejectedApps} rejected`,
            tab: "all_sellers" as SellerSubSection,
            color: "text-zinc-100",
          },
          {
            label: "Pending Apps",
            val: kpi.pendingApps,
            sub: "Awaiting review",
            tab: "pending_applications" as SellerSubSection,
            color: "text-amber-400",
          },
          {
            label: "Approved Sellers",
            val: kpi.approvedSellers,
            sub: "Verified partners",
            tab: "approved_sellers" as SellerSubSection,
            color: "text-emerald-400",
          },
          {
            label: "Suspended",
            val: kpi.suspendedSellers,
            sub: "Restricted access",
            tab: "suspended_sellers" as SellerSubSection,
            color: "text-rose-400",
          },
          {
            label: "Active Stores",
            val: kpi.activeStores,
            sub: "Live storefronts",
            tab: "seller_stores" as SellerSubSection,
            color: "text-sky-400",
          },
          {
            label: "Seller Products",
            val: kpi.totalProducts,
            sub: "Catalog items",
            tab: "seller_products" as SellerSubSection,
            color: "text-zinc-100",
          },
          {
            label: "Seller Orders",
            val: kpi.totalOrders,
            sub: "Customer orders",
            tab: "seller_orders" as SellerSubSection,
            color: "text-zinc-100",
          },
          {
            label: "Gross Sales",
            val: `₹${Number(kpi.grossSales || 0).toLocaleString("en-IN")}`,
            sub: `Comm: ₹${Number(kpi.platformCommission || 0).toLocaleString("en-IN")}`,
            tab: "seller_sales" as SellerSubSection,
            color: "text-amber-400",
          },
        ].map((card) => (
          <button
            key={card.label}
            onClick={() => setActiveTab(card.tab)}
            className={`text-left bg-zinc-900 border p-3.5 transition-all cursor-pointer ${
              activeTab === card.tab
                ? "border-amber-400 bg-amber-400/5"
                : "border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="text-[10px] tracking-[0.16em] uppercase text-zinc-400 truncate">
              {card.label}
            </div>
            <div className={`text-lg font-semibold mt-1 truncate ${card.color}`}>{card.val}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 truncate">{card.sub}</div>
          </button>
        ))}
      </div>

      {/* 12 Sub-Navigation Pills */}
      <div className="bg-zinc-900 border border-zinc-800 p-2 flex flex-wrap gap-1.5">
        {SUB_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          let badgeCount: number | undefined;
          if (sec.id === "all_sellers") badgeCount = kpi.totalSellers;
          if (sec.id === "pending_applications") badgeCount = kpi.pendingApps;
          if (sec.id === "verification_requests") {
            badgeCount =
              overviewStats?.pendingVerificationRequests ??
              sellers.filter(
                (s) =>
                  s.verificationStatus === "pending_admin_review" ||
                  s.verificationStatus === "under_review"
              ).length;
          }
          if (sec.id === "approved_sellers") badgeCount = kpi.approvedSellers;
          if (sec.id === "rejected_applications") badgeCount = kpi.rejectedApps;
          if (sec.id === "suspended_sellers") badgeCount = kpi.suspendedSellers;
          if (sec.id === "seller_support") badgeCount = supportTickets.length;

          return (
            <button
              key={sec.id}
              onClick={() => setActiveTab(sec.id)}
              className={`px-3 py-2 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-zinc-950 font-semibold"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
              {badgeCount !== undefined && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                    isActive ? "bg-zinc-950/20 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Section Content */}
      {(activeTab === "all_sellers" ||
        activeTab === "pending_applications" ||
        activeTab === "approved_sellers" ||
        activeTab === "rejected_applications" ||
        activeTab === "suspended_sellers") &&
        renderSellerTable()}

      {activeTab === "verification_requests" && (
        <SellerVerificationRequestsPanel
          sellers={sellers}
          verificationRequests={verificationRequests}
          onRefresh={async () => {
            await onRefreshAll();
            await loadExtendedSellerData();
          }}
          showToast={showToast}
        />
      )}

      {activeTab === "login_status" && renderLoginAndAuthSection()}
      {activeTab === "seller_stores" && renderSellerStoresSection()}
      {activeTab === "seller_products" && renderSellerProductsSection()}
      {activeTab === "seller_orders" && renderSellerOrdersSection()}
      {activeTab === "seller_sales" && renderSellerSalesAndPayoutsSection()}
      {activeTab === "seller_support" && renderSellerSupportSection()}
      {activeTab === "seller_settings" && renderSettingsAndAuditSection()}

      {/* ================================================================= */}
      {/* MODAL 1: Comprehensive Seller Dossier & Profile / Store Editor    */}
      {/* ================================================================= */}
      {selectedSellerDossier && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-serif text-zinc-100">
                    {selectedSellerDossier.seller.shopName}
                  </h3>
                  {renderStatusBadge(selectedSellerDossier.seller.status)}
                  {renderStoreStatusBadge(selectedSellerDossier.seller.storeStatus)}
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Owner: {selectedSellerDossier.seller.ownerName} • {selectedSellerDossier.seller.email} •{" "}
                  {selectedSellerDossier.seller.mobileNumber || "No mobile"}
                </p>
              </div>
              <button
                onClick={() => setSelectedSellerDossier(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Sub-Tabs */}
            <div className="px-5 pt-3 border-b border-zinc-800 bg-zinc-950/60 flex flex-wrap gap-2">
              {[
                { id: "overview", label: "Application & Store Overview" },
                { id: "edit_profile", label: "Edit Profile & Store" },
                { id: "permissions", label: "Permissions & Auth Security" },
                { id: "products", label: `Products (${selectedSellerDossier.products.length})` },
                { id: "orders", label: `Orders (${selectedSellerDossier.orders.length})` },
                {
                  id: "notes",
                  label: `Private Admin Notes (${(selectedSellerDossier.seller.adminNotes || []).length})`,
                },
                { id: "history", label: "Application & Audit History" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDossierTab(t.id as any)}
                  className={`px-3 py-2 text-xs border-b-2 transition-colors cursor-pointer ${
                    dossierTab === t.id
                      ? "border-amber-400 text-amber-400 font-semibold"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Dossier Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {dossierLoading && (
                <div className="text-zinc-400 py-4">Loading complete seller records...</div>
              )}

              {dossierTab === "overview" && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                        Seller Identity & Contact
                      </div>
                      <div>
                        <span className="text-zinc-500">Full Name:</span>{" "}
                        <span className="text-zinc-100">{selectedSellerDossier.seller.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Email:</span>{" "}
                        <span className="text-zinc-100">{selectedSellerDossier.seller.email}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Mobile:</span>{" "}
                        <span className="text-zinc-100">
                          {selectedSellerDossier.seller.mobileNumber || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Registered Date:</span>{" "}
                        <span className="text-zinc-200">
                          {selectedSellerDossier.seller.createdAt
                            ? new Date(selectedSellerDossier.seller.createdAt).toLocaleString("en-IN")
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Business Address:</span>{" "}
                        <span className="text-zinc-200">
                          {selectedSellerDossier.seller.businessAddress || "Not provided"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-2">
                      <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                        KYC, Tax & Settlement Bank Details
                      </div>
                      <div>
                        <span className="text-zinc-500">PAN Number:</span>{" "}
                        <span className="text-zinc-100">{selectedSellerDossier.seller.panNumber || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">GSTIN:</span>{" "}
                        <span className="text-zinc-100">{selectedSellerDossier.seller.gstin || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Bank Name:</span>{" "}
                        <span className="text-zinc-100">{selectedSellerDossier.seller.bankName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Account Holder:</span>{" "}
                        <span className="text-zinc-100">
                          {selectedSellerDossier.seller.bankAccountHolderName || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500">Account / IFSC:</span>{" "}
                        <span className="text-zinc-100">
                          {selectedSellerDossier.seller.bankAccountNumber || "—"} /{" "}
                          {selectedSellerDossier.seller.bankIFSC || "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Application & Account Actions */}
                  <div className="bg-zinc-950 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-zinc-200">Application & Account Status Decision</div>
                      <div className="text-zinc-500 mt-0.5">
                        Suspending a seller preserves all historical products, orders, and payout records.
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleDirectStatusUpdate(selectedSellerDossier.seller, "approved")}
                        className="px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                      >
                        Approve / Reactivate Seller
                      </button>
                      <button
                        onClick={() => {
                          setActionReason("");
                          setActionModal({
                            type: "request_info",
                            seller: selectedSellerDossier.seller,
                          });
                        }}
                        className="px-3 py-1.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 cursor-pointer"
                      >
                        Request More Info
                      </button>
                      <button
                        onClick={() => {
                          setActionReason("");
                          setActionModal({
                            type: "reject_seller",
                            seller: selectedSellerDossier.seller,
                          });
                        }}
                        className="px-3 py-1.5 bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                      >
                        Reject Application
                      </button>
                      <button
                        onClick={() => {
                          setActionReason("");
                          setActionModal({
                            type: "suspend_seller",
                            seller: selectedSellerDossier.seller,
                          });
                        }}
                        className="px-3 py-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer"
                      >
                        Suspend Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {dossierTab === "edit_profile" && (
                <form onSubmit={handleSaveSellerProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1">Store / Shop Name</label>
                      <input
                        type="text"
                        value={editProfileForm.shopName || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, shopName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Owner Full Name</label>
                      <input
                        type="text"
                        value={editProfileForm.ownerName || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, ownerName: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Seller Email Address</label>
                      <input
                        type="email"
                        value={editProfileForm.email || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Mobile Number</label>
                      <input
                        type="text"
                        value={editProfileForm.mobileNumber || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, mobileNumber: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">Store Category</label>
                      <input
                        type="text"
                        value={editProfileForm.category || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, category: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">GSTIN</label>
                      <input
                        type="text"
                        value={editProfileForm.gstin || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, gstin: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-zinc-400 mb-1">Business / Pickup Address</label>
                      <input
                        type="text"
                        value={editProfileForm.businessAddress || ""}
                        onChange={(e) =>
                          setEditProfileForm({ ...editProfileForm, businessAddress: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-zinc-400 mb-1">Store Return & Shipping Policy</label>
                      <textarea
                        rows={2}
                        value={editProfileForm.storePolicy || ""}
                        onChange={(e) => setEditProfileForm({ ...editProfileForm, storePolicy: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold cursor-pointer"
                    >
                      Save Permitted Profile & Store Changes
                    </button>
                  </div>
                </form>
              )}

              {dossierTab === "permissions" && (
                <div className="space-y-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                    <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                      Granular Seller Feature Restrictions (Server-Enforced)
                    </div>
                    {[
                      {
                        k: "canAddProducts",
                        title: "Allow Adding New Products",
                        desc: "Seller can create and publish new product listings in their catalog.",
                      },
                      {
                        k: "canEditProducts",
                        title: "Allow Editing Existing Products",
                        desc: "Seller can modify product prices, stock quantities, and descriptions.",
                      },
                      {
                        k: "canManageOrders",
                        title: "Allow Order Fulfillment Management",
                        desc: "Seller can pack, ship, and update status on customer orders.",
                      },
                      {
                        k: "canWithdrawPayouts",
                        title: "Allow Payout Withdrawals",
                        desc: "Seller can request wallet withdrawals to their settlement bank account.",
                      },
                      {
                        k: "canMakeNewSales",
                        title: "Allow Store to Accept New Sales",
                        desc: "When disabled, the seller's items cannot be checked out for new orders.",
                      },
                    ].map((item) => {
                      const perms = selectedSellerDossier.seller.permissions || {};
                      const enabled = perms[item.k] !== false;
                      return (
                        <div
                          key={item.k}
                          className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0"
                        >
                          <div>
                            <div className="text-zinc-100 font-medium">{item.title}</div>
                            <div className="text-zinc-500 text-[11px]">{item.desc}</div>
                          </div>
                          <button
                            onClick={() =>
                              handleToggleSellerPermission(selectedSellerDossier.seller, item.k, enabled)
                            }
                            className={`px-3 py-1 text-xs border cursor-pointer ${
                              enabled
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {enabled ? "Permitted" : "Restricted"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {dossierTab === "products" && (
                <div className="space-y-2">
                  {selectedSellerDossier.products.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="bg-zinc-950 border border-zinc-800 p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-zinc-100 font-medium">{p.name}</div>
                        <div className="text-zinc-500">
                          {p.category} • ₹{Number(p.price || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleModerateProduct(p, "approve")}
                          className="px-2 py-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleModerateProduct(p, "archive")}
                          className="px-2 py-1 bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedSellerDossier.products.length === 0 && (
                    <div className="text-zinc-500 py-6 text-center">
                      No products listed by this seller yet.
                    </div>
                  )}
                </div>
              )}

              {dossierTab === "orders" && (
                <div className="space-y-2">
                  {selectedSellerDossier.orders.map((o) => (
                    <div
                      key={o._id}
                      className="bg-zinc-950 border border-zinc-800 p-3 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-amber-400">#{o.orderNumber}</div>
                        <div className="text-zinc-400">
                          {o.customerName} • ₹{Number(o.total || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <span className="uppercase px-2 py-0.5 bg-zinc-800 text-zinc-200 rounded">
                        {o.status}
                      </span>
                    </div>
                  ))}
                  {selectedSellerDossier.orders.length === 0 && (
                    <div className="text-zinc-500 py-6 text-center">
                      No orders found for this seller yet.
                    </div>
                  )}
                </div>
              )}

              {dossierTab === "notes" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddPrivateAdminNote} className="flex gap-2">
                    <input
                      type="text"
                      value={newAdminNote}
                      onChange={(e) => setNewAdminNote(e.target.value)}
                      placeholder="Write a private internal admin note (invisible to sellers & customers)..."
                      className="flex-1 bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-400 text-zinc-950 font-semibold cursor-pointer"
                    >
                      Add Private Note
                    </button>
                  </form>
                  <div className="space-y-2">
                    {(selectedSellerDossier.seller.adminNotes || []).map((n: any, idx: number) => (
                      <div key={n.id || idx} className="bg-zinc-950 border border-zinc-800 p-3">
                        <div className="text-zinc-200">{n.note}</div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          By {n.authorName || "Admin"} ({n.authorEmail || "staff"}) •{" "}
                          {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN") : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dossierTab === "history" && (
                <div className="space-y-3">
                  <div className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                    Application Status History
                  </div>
                  {(selectedSellerDossier.seller.applicationHistory || []).map((h: any, idx: number) => (
                    <div key={h.id || idx} className="bg-zinc-950 border border-zinc-800 p-3">
                      <div className="font-medium text-zinc-100">
                        {h.action} ({h.previousStatus || "—"} → {h.newStatus})
                      </div>
                      {h.reason && <div className="text-zinc-300 mt-0.5">Reason / Note: {h.reason}</div>}
                      <div className="text-[11px] text-zinc-500 mt-1">
                        Acted by {h.actedBy} ({h.actedByEmail}) •{" "}
                        {h.createdAt ? new Date(h.createdAt).toLocaleString("en-IN") : ""}
                      </div>
                    </div>
                  ))}
                  {(!selectedSellerDossier.seller.applicationHistory ||
                    selectedSellerDossier.seller.applicationHistory.length === 0) && (
                    <div className="text-zinc-500">No status changes recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: High-Impact Action Confirmation Modal                    */}
      {/* ================================================================= */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md p-6 space-y-4">
            <h3 className="text-base font-medium text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              {actionModal.type === "reject_seller" && "Reject Seller Application"}
              {actionModal.type === "request_info" && "Request Additional Seller Information"}
              {actionModal.type === "suspend_seller" && "Suspend Seller Account"}
              {actionModal.type === "store_status" && "Change Seller Store Operational Status"}
              {actionModal.type === "revoke_sessions" && "Revoke Active Seller Sessions"}
              {actionModal.type === "password_reset" && "Trigger Secure Seller Password Reset"}
              {actionModal.type === "escalate_order" && "Escalate Order to Customer Care"}
            </h3>

            <p className="text-xs text-zinc-400">
              {actionModal.type === "reject_seller" &&
                `Provide a clear rejection reason for "${actionModal.seller?.shopName}". The seller will remain blocked from restricted seller portal features.`}
              {actionModal.type === "request_info" &&
                `Specify the documents or details needed from "${actionModal.seller?.shopName}".`}
              {actionModal.type === "suspend_seller" &&
                `Suspending "${actionModal.seller?.shopName}" immediately restricts seller portal actions while preserving all products, orders, and payment history.`}
              {actionModal.type === "store_status" &&
                `Set store "${actionModal.seller?.shopName}" to ${actionModal.targetStoreStatus?.replace("_", " ").toUpperCase()}.`}
              {actionModal.type === "revoke_sessions" &&
                `This increments the server-side session token version for "${actionModal.seller?.shopName}", logging out all active devices immediately.`}
              {actionModal.type === "password_reset" &&
                `A 6-digit password recovery code will be sent to ${actionModal.seller?.email}. Plaintext passwords are never exposed.`}
              {actionModal.type === "escalate_order" &&
                `Create a high-priority Customer Care escalation ticket for Order #${actionModal.order?.orderNumber}.`}
            </p>

            {(actionModal.type === "reject_seller" ||
              actionModal.type === "request_info" ||
              actionModal.type === "suspend_seller" ||
              actionModal.type === "store_status" ||
              actionModal.type === "escalate_order") && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Reason / Instructions (Recorded in Audit Log)
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter reason or details..."
                  className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3.5 py-2 text-xs bg-zinc-800 text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionSubmitting}
                onClick={handleConfirmActionModal}
                className="px-4 py-2 text-xs bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold cursor-pointer"
              >
                {actionSubmitting ? "Processing..." : "Confirm Action"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 3: Product Change History & Moderation Note                 */}
      {/* ================================================================= */}
      {selectedProductForHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-zinc-100">
                Product Moderation & Change History — {selectedProductForHistory.name}
              </h3>
              <button
                onClick={() => setSelectedProductForHistory(null)}
                className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-zinc-400">Moderation / Policy Note</label>
              <input
                type="text"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="Optional note (e.g., duplicate listing, policy violation, verified)..."
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleModerateProduct(selectedProductForHistory, "approve", moderationNote)}
                  className="px-3 py-1.5 text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                >
                  Approve Listing
                </button>
                <button
                  onClick={() => handleModerateProduct(selectedProductForHistory, "reject", moderationNote)}
                  className="px-3 py-1.5 text-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 cursor-pointer"
                >
                  Reject Listing
                </button>
                <button
                  onClick={() => handleModerateProduct(selectedProductForHistory, "archive", moderationNote)}
                  className="px-3 py-1.5 text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-pointer"
                >
                  Archive Listing
                </button>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-3 max-h-60 overflow-y-auto space-y-2 text-xs">
              <div className="text-[10px] uppercase tracking-widest text-zinc-400">Recorded History</div>
              {(selectedProductForHistory.changeHistory || []).map((ch: any, i: number) => (
                <div key={i} className="bg-zinc-950 border border-zinc-800 p-2.5">
                  <div className="font-medium text-zinc-200">{ch.action}</div>
                  {ch.note && <div className="text-zinc-400">Note: {ch.note}</div>}
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {ch.actedBy} • {ch.createdAt ? new Date(ch.createdAt).toLocaleString("en-IN") : ""}
                  </div>
                </div>
              ))}
              {(!selectedProductForHistory.changeHistory ||
                selectedProductForHistory.changeHistory.length === 0) && (
                <div className="text-zinc-500">No moderation history entries yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 4: Payout Approval / Rejection Verification Modal           */}
      {/* ================================================================= */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleProcessWithdrawal}
            className="bg-zinc-900 border border-zinc-700 w-full max-w-md p-6 space-y-4 text-xs"
          >
            <h3 className="text-base font-medium text-zinc-100">
              {withdrawalAction === "approved"
                ? "Verify & Complete Seller Payout"
                : "Reject Seller Payout Request"}
            </h3>
            <div className="bg-zinc-950 border border-zinc-800 p-3 space-y-1">
              <div>
                Seller: <span className="text-zinc-100 font-medium">{selectedWithdrawal.sellerShopName}</span>
              </div>
              <div>
                Amount:{" "}
                <span className="text-amber-400 font-semibold">
                  ₹{Number(selectedWithdrawal.amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            {withdrawalAction === "approved" ? (
              <div>
                <label className="block text-zinc-400 mb-1">Bank NEFT / IMPS / UTR Transaction Reference</label>
                <input
                  type="text"
                  value={withdrawalRef}
                  onChange={(e) => setWithdrawalRef(e.target.value)}
                  placeholder="e.g. UTR98234120984"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-zinc-400 mb-1">Rejection Reason</label>
                <input
                  type="text"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="Reason for rejecting withdrawal..."
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-zinc-950 font-semibold cursor-pointer"
              >
                Confirm {withdrawalAction.toUpperCase()}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 5: Create Seller Support Ticket                             */}
      {/* ================================================================= */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSupportTicket}
            className="bg-zinc-900 border border-zinc-700 w-full max-w-lg p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-zinc-100">Open Seller Support / Complaint Ticket</h3>
              <button
                type="button"
                onClick={() => setShowCreateTicketModal(false)}
                className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1">Select Seller Store</label>
                <select
                  value={newTicketForm.sellerId}
                  onChange={(e) => {
                    const sel = sellers.find((s) => String(s._id) === e.target.value);
                    setNewTicketForm({
                      ...newTicketForm,
                      sellerId: e.target.value,
                      shopName: sel?.shopName || "",
                      sellerEmail: sel?.email || "",
                    });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                  required
                >
                  <option value="">Choose Seller...</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={String(s._id)}>
                      {s.shopName} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                >
                  <option value="account_help">Account / Verification Issue</option>
                  <option value="payment_issue">Payout / Settlement Dispute</option>
                  <option value="order_issue">Order Fulfillment Issue</option>
                  <option value="product_quality">Customer Complaint on Seller</option>
                  <option value="return_refund">Return / Refund Dispute</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Related Order # (Optional)</label>
                <input
                  type="text"
                  value={newTicketForm.orderNumber}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, orderNumber: e.target.value })}
                  placeholder="e.g. ORD-1024"
                  className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Subject</label>
              <input
                type="text"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                placeholder="Brief summary of the seller issue or complaint"
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Description</label>
              <textarea
                rows={3}
                value={newTicketForm.description}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100"
                required
              />
            </div>
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={newTicketForm.escalateToCustomerCare}
                onChange={(e) =>
                  setNewTicketForm({ ...newTicketForm, escalateToCustomerCare: e.target.checked })
                }
                className="accent-amber-400"
              />
              Immediately escalate to Central Customer Care Escalations Desk
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateTicketModal(false)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-400 text-zinc-950 font-semibold cursor-pointer"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 6: Ticket Conversation, Internal Notes & Resolution         */}
      {/* ================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 w-full max-w-xl p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="font-mono text-amber-400">{selectedTicket.ticketNumber}</span>
                <h3 className="text-base font-medium text-zinc-100 mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {(selectedTicket.messages || []).map((m: any, i: number) => (
                <div
                  key={m.id || i}
                  className={`p-3 border ${
                    m.isInternalNote
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-zinc-950 border-zinc-800 text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                    <span>
                      {m.senderName} ({m.senderRole}) {m.isInternalNote ? "• PRIVATE INTERNAL NOTE" : ""}
                    </span>
                    <span>{m.createdAt ? new Date(m.createdAt).toLocaleString("en-IN") : ""}</span>
                  </div>
                  <div>{m.message}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleReplySupportTicket} className="space-y-2 pt-2 border-t border-zinc-800">
              <textarea
                rows={2}
                value={ticketReplyText}
                onChange={(e) => setTicketReplyText(e.target.value)}
                placeholder="Write a reply or internal support note..."
                className="w-full bg-zinc-950 border border-zinc-800 p-2.5 text-zinc-100"
                required
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ticketReplyInternal}
                    onChange={(e) => setTicketReplyInternal(e.target.checked)}
                    className="accent-amber-400"
                  />
                  Save as Private Internal Admin Note
                </label>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-400 text-zinc-950 font-semibold cursor-pointer"
                >
                  Post Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
