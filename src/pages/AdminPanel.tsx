import React, { useEffect, useState, FormEvent, useRef } from "react";
import { createPortal } from "react-dom";
import "../styles/AdminPanel.css";
import { adminApi } from "./adminApi";
import { 
  Product, 
  Order, 
  Seller, 
  Customer, 
  OrderStatus, 
  SellerStatus, 
  AdminStats, 
  AdminProfile, 
  ActivityLogEvent,
  AdminAccount,
  SalesReport,
  Banner,
  CommissionData
} from "./adminTypes";
import BannerManagement from "./admin/BannerManagement";
import CommissionWallet from "./admin/CommissionWallet";
import FlashSaleManagement from "./admin/FlashSaleManagement";
import AdminCategoryManager from "../components/AdminCategoryManager";
import DatabaseHubSection from "../components/admin/DatabaseHubSection";
import AdminMinisterSection from "../components/admin/AdminMinisterSection";
import CustomerCareModule from "../components/admin/customerCare/CustomerCareModule";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import AdvancedCustomerManagement from "../components/admin/AdvancedCustomerManagement";
import ReturnOrdersManagement from "../components/admin/ReturnOrdersManagement";
import { SellerManagementModule } from "../components/admin/SellerManagementModule";
import { DynamicCategory } from "../types";
import Logo from "../components/Logo";
import GlassIconButton from "../components/GlassIconButton";
import { useAdminEdit } from "../context/AdminEditContext";
<<<<<<< HEAD
=======
=======
import { DynamicCategory } from "../types";
import Logo from "../components/Logo";
import GlassIconButton from "../components/GlassIconButton";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { CATEGORIES } from "../data/mockData";
import { 
  ShieldCheck, 
  Package, 
  ShoppingBag, 
  Store, 
  Users, 
  BarChart3, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Ban, 
  Unlock, 
  Search, 
  RefreshCw, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Activity,
  UserPlus,
  LogIn,
  ShieldAlert,
  Clock,
  Laptop,
  Globe,
  Copy,
  Check,
  Filter,
  Menu,
  X,
  Sparkles,
  Home,
  Flame,
  Star,
  Tag,
  Briefcase,
  Layers,
  LayoutGrid,
  ArrowRight,
  Shield,
  Crown,
  UserCheck,
  Lock,
  Eye,
  Key,
  Phone,
  MapPin,
  Mail,
  Wallet,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  FileCheck,
  Landmark,
  Upload,
  Camera,
  ArrowLeft,
  Download,
  Database,
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  Headphones,
  RotateCcw,
  Truck,
  Car,
  Settings
<<<<<<< HEAD
=======
=======
  Headphones
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
} from "lucide-react";
import {
  exportDataToExcel,
  exportMultiSheetToExcel,
  formatOrdersForExcel,
  formatSellersForExcel,
  formatCustomersForExcel,
  formatProductsForExcel,
  formatCommissionForExcel,
  formatActivityLogsForExcel,
  formatBannersForExcel,
  formatAdminUsersForExcel
} from "../utils/exportToExcel";
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
import { AdminDeliveryDispatchSection } from "../components/admin/AdminDeliveryDispatchSection";
import { AdminRidesSection } from "../components/admin/AdminRidesSection";
import CentralAdminPanelModule from "../components/admin/CentralAdminPanelModule";
import DarazAddProductStudio from "../components/admin/DarazAddProductStudio";
import { MarketplaceSettingsDashboard } from "../components/settings/MarketplaceSettingsDashboard";

export type Section = "centralCommand" | "dashboard" | "products" | "addProductStudio" | "orders" | "returnOrders" | "deliveryDispatch" | "rides" | "sellers" | "customers" | "banners" | "categories" | "reports" | "adminUsers" | "activity" | "commission" | "flashSale" | "databaseHub" | "customerCare" | "settingsHub";
<<<<<<< HEAD
=======
=======

export type Section = "dashboard" | "products" | "orders" | "sellers" | "customers" | "banners" | "categories" | "reports" | "adminUsers" | "activity" | "commission" | "flashSale" | "databaseHub" | "customerCare";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

const SEAL_LABEL: Record<string, string> = {
  pending: "Pending Approval",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  approved: "Approved",
  review: "In Review",
  suspended: "Suspended",
  rejected: "Rejected",
  blocked: "Blocked",
  active: "Active",
};

function Seal({ status }: { status: string }) {
  const getBadgeClass = () => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "suspended":
        return "bg-neutral-200 text-neutral-800 border-neutral-400";
      case "review":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-300";
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getBadgeClass()}`}>
      {SEAL_LABEL[status] || status}
    </span>
  );
}

interface AdminPanelProps {
  onNavigateHome?: () => void;
  user?: { email?: string; name?: string; _id?: string; tier?: string } | null;
  onProductsChange?: (products: Product[]) => void;
  initialAdmin?: { _id?: string; name: string; email: string; role: string } | null;
}

export default function AdminPanel({
  onNavigateHome,
  user,
  onProductsChange,
  initialAdmin,
}: AdminPanelProps) {
<<<<<<< HEAD
  const { loginAdmin, logoutAdmin } = useAdminEdit();
=======
<<<<<<< HEAD
  const { loginAdmin, logoutAdmin } = useAdminEdit();
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [loggedIn, setLoggedIn] = useState(adminApi.hasToken() || !!initialAdmin);
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(
    initialAdmin
      ? {
          _id: initialAdmin._id || "admin_init",
          name: initialAdmin.name,
          email: initialAdmin.email,
          role: initialAdmin.role === "superadmin" ? "superadmin" : "admin",
        }
      : null
  );
  const [loginEmail, setLoginEmail] = useState(user?.email || "");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(true);

  const [section, setSection] = useState<Section>("dashboard");
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categoriesList, setCategoriesList] = useState<DynamicCategory[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogEvent[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminAccount[]>([]);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [isUpdatingCommissionRate, setIsUpdatingCommissionRate] = useState(false);

  // Search and Filter states
  const [prodSearch, setProdSearch] = useState("");
  const [prodCategory, setProdCategory] = useState("");
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [prodSellerFilter, setProdSellerFilter] = useState("");
  const [prodStockFilter, setProdStockFilter] = useState<"" | "in_stock" | "low_stock" | "out_of_stock">("");
  const [prodSortBy, setProdSortBy] = useState<"newest" | "price_asc" | "price_desc" | "stock_asc" | "score_desc">("newest");
  const [prodPage, setProdPage] = useState(1);
  const PROD_PAGE_SIZE = 15;
  const [prodFlashFilter, setProdFlashFilter] = useState<
    | "all"
    | "published"
    | "drafts"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "unpublished"
    | "out_of_stock"
    | "archived"
    | "flash"
    | "regular"
  >("all");
<<<<<<< HEAD
=======
=======
  const [prodFlashFilter, setProdFlashFilter] = useState<"all" | "flash" | "regular">("all");
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("");
  const [expandedKycSellerId, setExpandedKycSellerId] = useState<string | null>(null);
  const [custSearch, setCustSearch] = useState("");
  const [custTierFilter, setCustTierFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState<"all" | "registration" | "login" | "failed_login">("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Product modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);
  const [confirmProductNameInput, setConfirmProductNameInput] = useState("");
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [rejectingProduct, setRejectingProduct] = useState<Product | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");
  const [auditModalProduct, setAuditModalProduct] = useState<Product | null>(null);
  const [csvImportModalOpen, setCsvImportModalOpen] = useState(false);
  const [csvRawInput, setCsvRawInput] = useState("");
  const [isImportingCsv, setIsImportingCsv] = useState(false);
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  // Admin Accounts Management Modal State (Super Admin Only)
  const [createAdminModalOpen, setCreateAdminModalOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "superadmin">("admin");
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Admin Deletion with Type-To-Confirm
  const [adminToDelete, setAdminToDelete] = useState<AdminAccount | null>(null);
  const [confirmAdminEmailInput, setConfirmAdminEmailInput] = useState("");
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);

  // Self Password Change State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Super Admin Password Reset for Admin Account State
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<AdminAccount | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState("");

  const isSuperAdmin = Boolean(
    currentAdmin && currentAdmin.role === "superadmin"
  );

<<<<<<< HEAD
  // Strictly redirect away from superadmin-only sections (reports) if logged in as regular admin
  useEffect(() => {
    if (!isSuperAdmin && section === "reports") {
=======
<<<<<<< HEAD
  // Strictly redirect away from superadmin-only sections (reports) if logged in as regular admin
  useEffect(() => {
    if (!isSuperAdmin && section === "reports") {
=======
  // Strictly redirect away from superadmin-only sections (reports and commission) if logged in as regular admin
  useEffect(() => {
    if (!isSuperAdmin && (section === "commission" || section === "reports")) {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      setSection("dashboard");
    }
  }, [isSuperAdmin, section]);

  // Validate admin token or bridge from active user session against MongoDB alikendshop.admins on load
  useEffect(() => {
    let isMounted = true;

    async function authenticateAdmin() {
      setIsAutoChecking(true);
      setLoginError("");

      // 0. Use initialAdmin prop if supplied directly by parent view transition
      if (initialAdmin && isMounted) {
        const formattedAdmin: AdminProfile = {
          _id: initialAdmin._id || "admin_init",
          name: initialAdmin.name,
          email: initialAdmin.email,
          role: initialAdmin.role === "superadmin" ? "superadmin" : "admin",
        };
        setCurrentAdmin(formattedAdmin);
<<<<<<< HEAD
        loginAdmin(formattedAdmin);
=======
<<<<<<< HEAD
        loginAdmin(formattedAdmin);
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        setLoggedIn(true);
        setIsAutoChecking(false);
        loadAll(formattedAdmin);
        return;
      }

      // 1. Try existing admin token
      if (adminApi.hasToken()) {
        try {
          const res = await adminApi.getMe();
          if (res && res.valid && res.admin && isMounted) {
            setCurrentAdmin(res.admin);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            loginAdmin({
              _id: res.admin._id,
              name: res.admin.name || "Administrator",
              email: res.admin.email,
              role: res.admin.role || "admin",
            });
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            setLoggedIn(true);
            setIsAutoChecking(false);
            loadAll(res.admin);
            return;
          }
        } catch {
          console.warn("Existing admin token invalid or expired.");
          adminApi.clearToken();
        }
      }

      // 2. If user is currently authenticated in the app
      const userToken = localStorage.getItem("alike_user_token");
      const userStorage = localStorage.getItem("alike_user");
      let activeEmail = user?.email;
      if (!activeEmail && userStorage) {
        try { activeEmail = JSON.parse(userStorage)?.email; } catch {}
      }

      if (activeEmail || userToken) {
        try {
          const bridgeRes = await adminApi.bridgeLogin(userToken || undefined, activeEmail);
          if (bridgeRes && bridgeRes.success && bridgeRes.token && isMounted) {
            adminApi.setToken(bridgeRes.token);
            setCurrentAdmin(bridgeRes.admin);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            loginAdmin(
              {
                _id: bridgeRes.admin._id,
                name: bridgeRes.admin.name || "Administrator",
                email: bridgeRes.admin.email,
                role: bridgeRes.admin.role || "admin",
              },
              bridgeRes.token
            );
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            setLoggedIn(true);
            setIsAutoChecking(false);
            loadAll(bridgeRes.admin);
            return;
          }
        } catch (bridgeErr) {
          console.log("No automatic admin privileges for user:", activeEmail);
        }
      }

      if (isMounted) {
        if (activeEmail) setLoginEmail(activeEmail);
        setLoggedIn(false);
        setIsAutoChecking(false);
      }
    }

    authenticateAdmin();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function loadAll(activeAdmin?: AdminProfile | null) {
    setLoading(true);
    setError("");
    try {
      const [p, o, s, c, st, logs, bList, catList] = await Promise.all([
        adminApi.getProducts().catch(() => []),
        adminApi.getOrders().catch(() => []),
        adminApi.getSellers().catch(() => []),
        adminApi.getCustomers().catch(() => []),
        adminApi.getStats().catch(() => null),
        adminApi.getActivityLogs().catch(() => []),
        adminApi.getBanners().catch(() => []),
        adminApi.getCategories(true).catch(() => []),
      ]);
      setProducts(p || []);
      setOrders(o || []);
      setSellers(Array.isArray(s) ? s : ((s as any)?.sellers || []));
      setCustomers(c || []);
      setActivityLogs(logs || []);
      setBanners(bList || []);
      setCategoriesList(Array.isArray(catList) ? catList : ((catList as any)?.categories || []));
      if (st) setStats(st);

      // Always load Administrator Accounts directory so all logged-in administrators can view Admin & Super Admin rosters
      try {
        const adminsList = await adminApi.getAdminUsers();
        setAdminUsers(Array.isArray(adminsList) ? adminsList : ((adminsList as any)?.admins || []));
      } catch (e) {
        console.warn("Could not load admin users list:", e);
      }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      // Always load Commission Management data for all logged-in Admins
      try {
        const comm = await adminApi.getCommissionData();
        setCommissionData(comm);
      } catch (e) {
        console.warn("Could not load commission data:", e);
      }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      // Load SuperAdmin exclusive datasets ONLY if role is superadmin
      const effectiveAdmin = activeAdmin !== undefined ? activeAdmin : currentAdmin;
      const isSuper = effectiveAdmin?.role === "superadmin" || effectiveAdmin?.email?.toLowerCase() === "developer.alikend@gmail.com" || effectiveAdmin?.email?.toLowerCase() === "noyondey176@gmail.com";
      if (isSuper) {
        try {
          const rep = await adminApi.getSalesReport();
          setSalesReport(rep);
        } catch (e) {
          console.warn("Could not load sales report:", e);
        }
<<<<<<< HEAD
      } else {
        setSalesReport(null);
=======
<<<<<<< HEAD
      } else {
        setSalesReport(null);
=======
        try {
          const comm = await adminApi.getCommissionData();
          setCommissionData(comm);
        } catch (e) {
          console.warn("Could not load commission data:", e);
        }
      } else {
        // Clear reports and commission for non-superadmin
        setSalesReport(null);
        setCommissionData(null);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      }
    } catch (err: any) {
      setError(err.message || "Failed to load database records");
    } finally {
      setLoading(false);
    }
  }

  async function loadCommission() {
    try {
      const data = await adminApi.getCommissionData();
      if (data) {
        setCommissionData(data);
      }
    } catch (err: any) {
      console.warn("Failed to load commission data:", err);
    }
  }

  async function handleUpdateCommissionRate(newRate: number) {
    setIsUpdatingCommissionRate(true);
    try {
      const res = await adminApi.updateCommissionRate(newRate);
      flashSuccess(res?.message || `Platform commission rate updated to ${newRate}%`);
      await loadCommission();
    } catch (err: any) {
      setError(err?.message || "Failed to update commission rate");
    } finally {
      setIsUpdatingCommissionRate(false);
    }
  }

<<<<<<< HEAD
  // Load items when switching tabs if needed
=======
<<<<<<< HEAD
  // Load items when switching tabs if needed
=======
  // Load superadmin items when switching tabs if needed, and kick non-superadmin back to dashboard for reports and commission
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  useEffect(() => {
    if (loggedIn) {
      if (section === "adminUsers" && adminUsers.length === 0) {
        adminApi.getAdminUsers().then(res => setAdminUsers(res || [])).catch(() => {});
      }
<<<<<<< HEAD
      if (section === "commission") {
        loadCommission();
      }
=======
<<<<<<< HEAD
      if (section === "commission") {
        loadCommission();
      }
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
      if (isSuperAdmin) {
        if (section === "reports" && !salesReport) {
          adminApi.getSalesReport().then(res => setSalesReport(res)).catch(() => {});
        }
<<<<<<< HEAD
      } else {
        if (section === "reports") {
=======
<<<<<<< HEAD
      } else {
        if (section === "reports") {
=======
        if (section === "commission") {
          loadCommission();
        }
      } else {
        if (section === "reports" || section === "commission") {
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          setSection("dashboard");
        }
      }
    }
  }, [section, loggedIn, isSuperAdmin]);

  function flashSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  function flashError(msg: string) {
    setError(msg);
    setTimeout(() => setError(""), 5000);
  }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);
    try {
      const res = await adminApi.login(loginEmail, loginPassword);
      if (res.success && res.token) {
        adminApi.setToken(res.token);
        localStorage.setItem("alikend_admin_token", res.token);
        setCurrentAdmin(res.admin);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        loginAdmin(
          {
            _id: res.admin._id,
            name: res.admin.name || "Administrator",
            email: res.admin.email,
            role: res.admin.role || "admin",
          },
          res.token
        );
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
        setLoggedIn(true);
        setLoginPassword("");
        loadAll(res.admin);
      } else {
        setLoginError(res.error || "Admin authentication failed.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid admin email or password");
    } finally {
      setIsSubmittingLogin(false);
    }
  }

  function handleLogout() {
    adminApi.clearToken();
    localStorage.removeItem("alikend_admin_token");
<<<<<<< HEAD
    logoutAdmin();
=======
<<<<<<< HEAD
    logoutAdmin();
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    setCurrentAdmin(null);
    setLoggedIn(false);
  }

  // --- Products: Add, Edit, Delete ---
  async function handleSaveProduct(data: Omit<Product, "_id">) {
    try {
      let updatedList: Product[] = [];
      if (editingProduct) {
        const targetId = editingProduct._id || String(editingProduct.id);
        const updated = await adminApi.updateProduct(targetId, data);
        const resolvedUpdated = updated || { ...editingProduct, ...data, _id: targetId };
        updatedList = products.map((p) => {
          const pId = p._id || String(p.id);
          const uId = resolvedUpdated._id || String(resolvedUpdated.id);
          return (pId === targetId || pId === uId) ? { ...p, ...resolvedUpdated } : p;
        });
        setProducts(updatedList);
        flashSuccess(`Product "${resolvedUpdated.name}" updated successfully.`);
      } else {
        const created = await adminApi.createProduct(data);
        updatedList = [created, ...products];
        setProducts(updatedList);
        flashSuccess(`Product "${created.name}" created and synced to MongoDB.`);
      }
      setModalOpen(false);
      setEditingProduct(null);

      // Sync changes back to parent and Homepage state
      if (onProductsChange) {
        onProductsChange(updatedList);
      }
    } catch (err: any) {
      alert(err.message || "Failed to save product listing");
    }
  }

  function handleDeleteProduct(id: string, name: string) {
    setProductToDelete({ id, name });
    setConfirmProductNameInput("");
  }

  async function handleConfirmDeleteProduct() {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      await adminApi.deleteProduct(productToDelete.id);
      const updatedList = products.filter((p) => {
        const pId = p._id || String(p.id);
        return pId !== productToDelete.id;
      });
      setProducts(updatedList);
      flashSuccess(`Product "${productToDelete.name}" permanently deleted from catalog.`);
      if (onProductsChange) {
        onProductsChange(updatedList);
      }
      setProductToDelete(null);
      setConfirmProductNameInput("");
    } catch (err: any) {
<<<<<<< HEAD
      flashError(err.message || "Failed to remove product");
=======
<<<<<<< HEAD
      flashError(err.message || "Failed to remove product");
=======
      alert(err.message || "Failed to remove product");
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
    } finally {
      setIsDeletingProduct(false);
    }
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  async function handleDuplicateAdminProduct(prod: Product) {
    const targetId = prod._id || String(prod.id);
    setActionLoadingId(targetId);
    try {
      const res = await adminApi.duplicateProduct(targetId);
      const created = res?.product || res;
      if (created) {
        const updatedList = [created, ...products];
        setProducts(updatedList);
        flashSuccess(`Duplicated "${prod.name}" as a new draft copy.`);
      }
    } catch (err: any) {
      flashError(err.message || "Failed to duplicate product");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleAdminProductStatusAction(
    prod: Product,
    action: "approve" | "reject" | "archive" | "restore" | "publish" | "unpublish",
    rejectionReason?: string
  ) {
    const targetId = prod._id || String(prod.id);
    setActionLoadingId(targetId);
    try {
      const res = await adminApi.updateProductStatus(targetId, { action, rejectionReason });
      const updatedProd = res?.product || res;
      const updatedList = products.map((p) =>
        (p._id || String(p.id)) === targetId ? { ...p, ...updatedProd } : p
      );
      setProducts(updatedList);
      if (onProductsChange) {
        onProductsChange(
          updatedList.filter(
            (p) => !p.isDraft && !p.isHidden && p.isPublished !== false && p.moderationStatus !== "rejected" && p.moderationStatus !== "archived"
          )
        );
      }
      flashSuccess(`Product "${prod.name}" status updated (${action.toUpperCase()}).`);
      setRejectingProduct(null);
      setRejectionReasonInput("");
    } catch (err: any) {
      flashError(err.message || `Failed to ${action} product`);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleAdminCsvImport() {
    if (!csvRawInput.trim()) return;
    setIsImportingCsv(true);
    try {
      const lines = csvRawInput
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (lines.length < 2) {
        flashError("Please provide a header row and at least 1 product row.");
        setIsImportingCsv(false);
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const items = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => {
          obj[h] = cols[i] ?? "";
        });
        return {
          name: obj.name || obj.title || "Imported Catalog Item",
          brand: obj.brand || "Alike Sovereign",
          category: obj.category || "fashion",
          subCategory: obj.subcategory || "",
          sku: obj.sku || "",
          price: Number(obj.price) || 1499,
          mrp: Number(obj.mrp) || Number(obj.price) || 1999,
          stock: Number(obj.stock) ?? 20,
          image: obj.image || "",
          description: obj.description || "",
        };
      });
      const res = await adminApi.importProductsCsv(items);
      if (res?.products && Array.isArray(res.products)) {
        const updatedList = [...res.products, ...products];
        setProducts(updatedList);
        if (onProductsChange) {
          onProductsChange(updatedList.filter((p) => !p.isDraft && p.isPublished !== false));
        }
      }
      flashSuccess(res?.message || `Imported ${items.length} products into catalog.`);
      setCsvImportModalOpen(false);
      setCsvRawInput("");
    } catch (err: any) {
      flashError(err.message || "CSV Import failed");
    } finally {
      setIsImportingCsv(false);
    }
  }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  // --- Orders: Status Transitions ---
  async function handleOrderStatus(id: string, status: OrderStatus) {
    setActionLoadingId(id);
    try {
      const updated = await adminApi.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
      flashSuccess(`Order status updated to "${SEAL_LABEL[status]}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setActionLoadingId(null);
    }
  }

  // --- Sellers: Approve, Review, Suspend, Reject ---
  async function handleSellerStatus(id: string, status: SellerStatus) {
    setActionLoadingId(id);
    try {
      const updated = await adminApi.updateSellerStatus(id, status);
      setSellers((prev) => prev.map((s) => (s._id === id ? updated : s)));
      flashSuccess(`Seller storefront status set to "${SEAL_LABEL[status]}".`);
    } catch (err: any) {
      alert(err.message || "Failed to update seller status");
    } finally {
      setActionLoadingId(null);
    }
  }

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const [sellerDetailsMap, setSellerDetailsMap] = useState<
    Record<string, { products: Product[]; activityLogs: ActivityLogItem[]; loading?: boolean }>
  >({});

  async function handleToggleExpandSeller(sellerId: string, isCurrentlyExpanded: boolean) {
    if (isCurrentlyExpanded) {
      setExpandedKycSellerId(null);
      return;
    }
    setExpandedKycSellerId(sellerId);
    setSellerDetailsMap((prev) => ({
      ...prev,
      [sellerId]: { products: prev[sellerId]?.products || [], activityLogs: prev[sellerId]?.activityLogs || [], loading: true },
    }));
    try {
      const details = await adminApi.getSellerDetails(sellerId);
      if (details) {
        setSellerDetailsMap((prev) => ({
          ...prev,
          [sellerId]: {
            products: details.products || [],
            activityLogs: details.activityLogs || [],
            loading: false,
          },
        }));
      }
    } catch {
      setSellerDetailsMap((prev) => ({
        ...prev,
        [sellerId]: {
          products: prev[sellerId]?.products || [],
          activityLogs: prev[sellerId]?.activityLogs || [],
          loading: false,
        },
      }));
    }
  }

  async function handleUpdateSellerPermission(
    sellerId: string,
    permissionKey: "canAddProducts" | "canEditProducts" | "canManageOrders" | "canWithdrawPayouts",
    nextVal: boolean
  ) {
    setActionLoadingId(sellerId);
    try {
      const updated = await adminApi.updateSellerPermissions(sellerId, { [permissionKey]: nextVal });
      setSellers((prev) => prev.map((s) => (s._id === sellerId ? { ...s, ...updated } : s)));
      flashSuccess(`Seller permission "${permissionKey}" ${nextVal ? "enabled" : "disabled"}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update seller permissions");
    } finally {
      setActionLoadingId(null);
    }
  }

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  // --- Sellers: Verify / Unverify KYC ---
  async function handleToggleSellerKyc(id: string, currentVerified: boolean) {
    setActionLoadingId(id);
    try {
      const updated = await adminApi.verifySellerKyc(id, !currentVerified);
      setSellers((prev) => prev.map((s) => (s._id === id ? updated : s)));
      flashSuccess(!currentVerified ? "Seller KYC successfully verified!" : "Seller KYC marked as unverified.");
    } catch (err: any) {
      alert(err.message || "Failed to update seller KYC status");
    } finally {
      setActionLoadingId(null);
    }
  }

  // --- Users/Customers: Block/Unblock & Loyalty Tier (Super Admin Exclusive) ---
  async function handleToggleUserBlock(customer: Customer) {
    if (!isSuperAdmin) {
      alert("Permission Denied: Only Super Administrators can block or unblock customer accounts.");
      return;
    }
    const nextState = !customer.isBlocked;
    const confirmPrompt = nextState
      ? `Are you sure you want to BLOCK customer "${customer.name}" (${customer.email})?`
      : `Unblock customer "${customer.name}" (${customer.email}) and restore normal account access?`;

    if (!confirm(confirmPrompt)) return;

    setActionLoadingId(customer._id);
    try {
      const res = await adminApi.blockCustomer(customer._id, nextState);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, isBlocked: nextState } : c))
        );
        flashSuccess(res.message || `Customer account ${nextState ? "blocked" : "unblocked"}.`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to update customer account block status");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleUpdateTier(id: string, tier: string) {
    if (!isSuperAdmin) {
      alert("Permission Denied: Only Super Administrators can modify customer loyalty tiers.");
      return;
    }
    try {
      await adminApi.updateCustomerTier(id, tier);
      setCustomers((prev) =>
        prev.map((c) => (c._id === id ? { ...c, tier: tier as any } : c))
      );
      flashSuccess(`Customer tier updated to ${tier}.`);
    } catch (err: any) {
      alert(err.message || "Failed to update tier");
    }
  }

  // --- Admin Accounts Management (Super Admin Exclusive) ---
  async function handleCreateAdminAccount(e: FormEvent) {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminPassword.trim()) {
      alert("Email and password are required.");
      return;
    }
    if (newAdminPassword.trim().length < 10) {
      alert("Password must be at least 10 characters long.");
      return;
    }
    setCreatingAdmin(true);
    try {
      const created = await adminApi.createAdminUser({
        name: newAdminName.trim() || (newAdminRole === "superadmin" ? "Super Admin" : "Operations Admin"),
        email: newAdminEmail.trim().toLowerCase(),
        password: newAdminPassword.trim(),
        role: newAdminRole,
      });
      setAdminUsers((prev) => [created, ...prev]);
      flashSuccess(`New admin account created: ${created.email} [${created.role}]`);
      setCreateAdminModalOpen(false);
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminRole("admin");
    } catch (err: any) {
      alert(err.message || "Failed to create administrator account");
    } finally {
      setCreatingAdmin(false);
    }
  }

  function initiateDeleteAdmin(account: AdminAccount) {
    if (account.email.toLowerCase() === "developer.alikend@gmail.com" || account.email.toLowerCase() === "noyondey176@gmail.com") {
      alert("Master Super Administrator account is permanently protected and cannot be deleted.");
      return;
    }
    setAdminToDelete(account);
    setConfirmAdminEmailInput("");
  }

  async function handleConfirmDeleteAdmin() {
    if (!adminToDelete) return;
    if (adminToDelete.email.toLowerCase() === "developer.alikend@gmail.com" || adminToDelete.email.toLowerCase() === "noyondey176@gmail.com") {
      alert("Master Super Administrator account is permanently protected and cannot be deleted.");
      setAdminToDelete(null);
      return;
    }
    if (confirmAdminEmailInput.trim().toLowerCase() !== adminToDelete.email.trim().toLowerCase()) {
      alert("Entered email does not match the administrator account email.");
      return;
    }

    setIsDeletingAdmin(true);
    try {
      await adminApi.deleteAdminUser(adminToDelete._id);
      setAdminUsers((prev) => prev.filter((a) => a._id !== adminToDelete._id));
      flashSuccess(`Administrator account ${adminToDelete.email} revoked and removed.`);
      setAdminToDelete(null);
      setConfirmAdminEmailInput("");
    } catch (err: any) {
      alert(err.message || "Failed to delete admin account");
    } finally {
      setIsDeletingAdmin(false);
    }
  }

  // --- Password Management Handlers ---
  async function handleAdminChangePassword(e: FormEvent) {
    e.preventDefault();
    setChangePasswordError("");
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
      setChangePasswordError("All password fields are required.");
      return;
    }
    if (newPasswordInput.length < 10) {
      setChangePasswordError("New password must be at least 10 characters.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setChangePasswordError("New password and confirm password do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await adminApi.changePassword({
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput,
      });
      flashSuccess(res?.message || "Your administrator password has been updated successfully!");
      setChangePasswordModalOpen(false);
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
    } catch (err: any) {
      setChangePasswordError(err?.message || "Failed to change password. Please check your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSuperAdminResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetPasswordAdmin) return;
    setResetPasswordError("");
    if (!resetPasswordInput || resetPasswordInput.trim().length < 10) {
      setResetPasswordError("New password must be at least 10 characters long.");
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await adminApi.resetAdminPassword(resetPasswordAdmin._id, resetPasswordInput.trim());
      flashSuccess(res?.message || `Password reset successfully for ${resetPasswordAdmin.email}`);
      setResetPasswordAdmin(null);
      setResetPasswordInput("");
    } catch (err: any) {
      setResetPasswordError(err?.message || "Failed to reset administrator password.");
    } finally {
      setIsResettingPassword(false);
    }
  }

  function handleCopyEmail(email: string, id: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmailId(id);
    setTimeout(() => setCopiedEmailId(null), 2000);
  }

  // Seamless session validation loading state
  if (isAutoChecking && !loggedIn) {
    return (
      <div className="ap-root flex items-center justify-center min-h-[600px] p-6">
        <div className="bg-white/95 border border-purple-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-900 text-purple-200 flex items-center justify-center shadow-lg animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-neutral-900 tracking-wide">Administrator Portal</h2>
          <p className="text-xs text-neutral-600 font-medium">
            Verifying administrative credentials against alikendshop.admins...
          </p>
          <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full animate-pulse w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated Admin Login Screen
  if (!loggedIn) {
    return (
      <div className="ap-root">
        <div className="ap-login-wrap flex flex-col items-center justify-center p-4">
          <div className="ap-login-card shadow-2xl border border-white/10 w-full max-w-md bg-white text-neutral-900 rounded-2xl p-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-amber-400 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>

            <div className="ap-login-mark text-center text-2xl font-serif font-bold text-neutral-900">
              ALIKE ND
            </div>
            <div className="ap-login-sub text-center text-xs tracking-widest text-neutral-500 font-mono mt-1 mb-6">
              Administrative Control Console
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-6 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Database Authentication:</span>
                Authenticates strictly against <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">alikendshop.admins</code>. Supports both Super Admin and Regular Admin roles.
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Admin Email
                </label>
                <input
                  className="ap-input font-mono"
                  type="email"
                  placeholder="noyondey176@gmail.com or admin234@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5 font-mono">
                  Admin Password
                </label>
                <input
                  className="ap-input"
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button
                className="ap-btn ap-btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 font-medium tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
                type="submit"
                disabled={isSubmittingLogin}
              >
                {isSubmittingLogin ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" /> Sign In to Admin Console
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-neutral-200 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-neutral-600 hover:text-neutral-950 hover:underline cursor-pointer"
              >
                ← Return to Galleria Store
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter computations
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
  const filteredProducts = products
    .filter((p) => {
      const q = (prodSearch || "").trim().toLowerCase();
      const matchSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.localizedName || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.subCategory || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.internalProductId || "").toLowerCase().includes(q) ||
        String(p.id || p._id || "").toLowerCase().includes(q) ||
        (p.brand && (p.brand || "").toLowerCase().includes(q)) ||
        (p.sellerShopName && (p.sellerShopName || "").toLowerCase().includes(q)) ||
        (Array.isArray(p.internalSearchTags) && p.internalSearchTags.some((t) => t.toLowerCase().includes(q)));

      const matchCat = !prodCategory || p.category === prodCategory;
      const matchSeller =
        !prodSellerFilter ||
        (prodSellerFilter === "admin"
          ? !p.sellerId || p.sellerId === "admin"
          : String(p.sellerId) === String(prodSellerFilter));

      const threshold = Number(p.lowStockThreshold || 5);
      const matchStock =
        !prodStockFilter ||
        (prodStockFilter === "out_of_stock"
          ? (p.stock ?? 0) <= 0
          : prodStockFilter === "low_stock"
          ? (p.stock ?? 0) > 0 && (p.stock ?? 0) <= threshold
          : (p.stock ?? 0) > threshold);

      let matchTab = true;
      if (prodFlashFilter === "published") {
        matchTab = !p.isDraft && !p.isHidden && p.isPublished !== false && p.moderationStatus !== "archived" && p.moderationStatus !== "rejected";
      } else if (prodFlashFilter === "drafts") {
        matchTab = Boolean(p.isDraft || p.moderationStatus === "draft");
      } else if (prodFlashFilter === "pending_approval") {
        matchTab = p.moderationStatus === "pending" || p.approvalStatus === "pending";
      } else if (prodFlashFilter === "approved") {
        matchTab = (p.moderationStatus === "approved" || p.approvalStatus === "approved") && !p.isDraft;
      } else if (prodFlashFilter === "rejected") {
        matchTab = p.moderationStatus === "rejected" || p.approvalStatus === "rejected";
      } else if (prodFlashFilter === "unpublished") {
        matchTab = (p.isPublished === false || p.isHidden === true) && !p.isDraft && p.moderationStatus !== "archived";
      } else if (prodFlashFilter === "out_of_stock") {
        matchTab = (p.stock ?? 0) <= 0;
      } else if (prodFlashFilter === "archived") {
        matchTab = p.moderationStatus === "archived";
      } else if (prodFlashFilter === "flash") {
        matchTab = p.badge === "SALE" || p.isFlashSale === true || Boolean(p.badgesConfig?.flashSale);
      } else if (prodFlashFilter === "regular") {
        matchTab = p.badge !== "SALE" && !p.isFlashSale && !p.isDraft;
      }

      return matchSearch && matchCat && matchSeller && matchStock && matchTab;
    })
    .sort((a, b) => {
      if (prodSortBy === "price_asc") return (a.price || 0) - (b.price || 0);
      if (prodSortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      if (prodSortBy === "stock_asc") return (a.stock ?? 0) - (b.stock ?? 0);
      if (prodSortBy === "score_desc") return (b.contentScore ?? 80) - (a.contentScore ?? 80);
      const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : Number(a.id) || 0;
      const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : Number(b.id) || 0;
      return tB - tA;
    });

  const totalProdPages = Math.max(1, Math.ceil(filteredProducts.length / PROD_PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (prodPage - 1) * PROD_PAGE_SIZE,
    prodPage * PROD_PAGE_SIZE
  );
<<<<<<< HEAD
=======
=======
  const filteredProducts = products.filter((p) => {
    const q = (prodSearch || "").trim().toLowerCase();
    const matchSearch = !q || 
      (p.name || "").toLowerCase().includes(q) || 
      (p.category || "").toLowerCase().includes(q) ||
      (p.brand && (p.brand || "").toLowerCase().includes(q)) ||
      (p.description && (p.description || "").toLowerCase().includes(q));
    
    const matchCat = !prodCategory || p.category === prodCategory;

    let matchFlash = true;
    if (prodFlashFilter === "flash") {
      matchFlash = p.badge === "SALE" || p.isFlashSale === true;
    } else if (prodFlashFilter === "regular") {
      matchFlash = p.badge !== "SALE" && !p.isFlashSale;
    }

    return matchSearch && matchCat && matchFlash;
  });
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

  const filteredOrders = orders.filter((o) => {
    const q = (orderSearch || "").trim().toLowerCase();
    const matchSearch = !q ||
      (o.orderNumber || "").toLowerCase().includes(q) ||
      (o.memberName || "").toLowerCase().includes(q) ||
      (o.memberEmail && (o.memberEmail || "").toLowerCase().includes(q));
    return matchSearch && (!orderStatusFilter || o.status === orderStatusFilter);
  });

  const filteredSellers = sellers.filter((s) => {
    const q = sellerSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      (s.shopName && s.shopName.toLowerCase().includes(q)) ||
      (s.storefront && s.storefront.toLowerCase().includes(q)) ||
      (s.ownerName && s.ownerName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.ownerEmail && s.ownerEmail.toLowerCase().includes(q)) ||
      (s.mobileNumber && s.mobileNumber.toLowerCase().includes(q)) ||
      (s.businessAddress && s.businessAddress.toLowerCase().includes(q));

    const matchStatus = !sellerStatusFilter || s.status === sellerStatusFilter;
    return matchSearch && matchStatus;
  });

  const filteredCustomers = customers.filter((c) => {
    const isAutoVip = (c.ordersCount || 0) > 10;
    const isVip = c.tier === "VIP" || c.tier === "Platinum" || isAutoVip;
    const tier = isVip ? "VIP" : "Normal";

    const matchesSearch =
      !custSearch ||
      c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(custSearch.toLowerCase()) ||
      (c.phone && c.phone.toLowerCase().includes(custSearch.toLowerCase()));

    const matchesTier = !custTierFilter || tier === custTierFilter;

    return matchesSearch && matchesTier;
  });

  const filteredActivityLogs = activityLogs.filter((log) => {
    if (activityFilter === "registration" && log.eventType !== "Registration") return false;
    if (activityFilter === "login" && log.eventType !== "Login") return false;
    if (activityFilter === "failed_login" && log.eventType !== "Failed Login") return false;

    if (activitySearch && activitySearch.trim()) {
      const q = activitySearch.trim().toLowerCase();
      const matchName = log.userName?.toLowerCase().includes(q);
      const matchEmail = log.email?.toLowerCase().includes(q);
      const matchIp = log.ipAddress?.toLowerCase().includes(q);
      const matchDevice = log.deviceInfo?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchIp && !matchDevice && !matchDetails) return false;
    }
    return true;
  });

  const handleExportCurrentSection = () => {
    switch (section) {
      case "orders": {
        const dataList = filteredOrders.length > 0 ? filteredOrders : orders;
        exportDataToExcel(formatOrdersForExcel(dataList), "Orders_Report", "Orders");
        break;
      }
      case "sellers": {
        const dataList = filteredSellers.length > 0 ? filteredSellers : sellers;
        exportDataToExcel(formatSellersForExcel(dataList), "Sellers_Report", "Sellers");
        break;
      }
      case "customers": {
        const dataList = filteredCustomers.length > 0 ? filteredCustomers : customers;
        exportDataToExcel(formatCustomersForExcel(dataList), "Customers_Report", "Customers");
        break;
      }
      case "products": {
        const dataList = filteredProducts.length > 0 ? filteredProducts : products;
        exportDataToExcel(formatProductsForExcel(dataList), "Products_Report", "Products");
        break;
      }
      case "commission": {
        const dataList = commissionData?.orders && commissionData.orders.length > 0 ? commissionData.orders : [];
        if (dataList.length === 0) {
          alert("No platform commission records available to export.");
          return;
        }
        exportDataToExcel(formatCommissionForExcel(dataList), "Platform_Earnings_Report", "Commission Ledger");
        break;
      }
      case "reports": {
        if (!salesReport) {
          alert("No sales report data available to export.");
          return;
        }
        exportMultiSheetToExcel(
          [
            {
              sheetName: "Revenue Summary",
              data: [
                {
                  "Total Gross Revenue (₹)": salesReport.totalRevenue || 0,
                  "Average Order Value (₹)": salesReport.averageOrderValue || 0,
                  "Total Completed Orders": salesReport.totalOrdersCount || salesReport.totalOrders || 0,
                  "Total Registered Members": salesReport.totalMembersCount || 0,
                  "Platinum Tier Revenue (₹)": salesReport.revenueByTier?.Platinum || 0,
                  "Gold Tier Revenue (₹)": salesReport.revenueByTier?.Gold || 0,
                  "Silver Tier Revenue (₹)": salesReport.revenueByTier?.Silver || 0,
                },
              ],
            },
            {
              sheetName: "Monthly Trends",
              data: (salesReport.monthlyTrend || []).map((t) => ({
                "Month": t.month,
                "Revenue (₹)": t.revenue,
              })),
            },
          ],
          "Sales_Analytics_Report"
        );
        break;
      }
      case "banners": {
        exportDataToExcel(formatBannersForExcel(banners), "Hero_Banners_Report", "Banners");
        break;
      }
      case "adminUsers": {
        exportDataToExcel(formatAdminUsersForExcel(adminUsers), "Admin_Users_Report", "Administrators");
        break;
      }
      case "activity": {
        const dataList = filteredActivityLogs.length > 0 ? filteredActivityLogs : activityLogs;
        exportDataToExcel(formatActivityLogsForExcel(dataList), "Activity_Logs_Report", "Security Logs");
        break;
      }
      case "dashboard":
      default: {
        exportMultiSheetToExcel(
          [
            {
              sheetName: "Console Summary",
              data: [
                {
                  "Active Catalog Products": products.length,
                  "Flash Sale Products": products.filter((p) => p.badge === "SALE" || p.isFlashSale).length,
                  "Total Orders Count": orders.length,
                  "Pending Orders": orders.filter((o) => o.status === "pending").length,
                  "Delivered Orders": orders.filter((o) => o.status === "delivered").length,
                  "Registered Customers": customers.length,
                  "Platinum VIP Customers": customers.filter((c) => c.tier === "Platinum").length,
                  "Registered Sellers": sellers.length,
                  "Approved Ateliers": sellers.filter((s) => s.status === "approved").length,
                  "Hero Banners": banners.length,
                },
              ],
            },
            {
              sheetName: "Recent Orders",
              data: formatOrdersForExcel((orders || []).slice(0, 50)),
            },
            {
              sheetName: "Products Catalog",
              data: formatProductsForExcel((products || []).slice(0, 50)),
            },
          ],
          "Dashboard_Executive_Report"
        );
        break;
      }
    }
  };

  return (
    <div className="ap-root">
      {/* Top Role Indicator Banner */}
      <div className={`w-full px-6 py-2 flex items-center justify-between text-xs border-b ${
        isSuperAdmin
          ? 'bg-[#1e0a24] text-amber-300 border-amber-500/20'
          : 'bg-[#0f1d38] text-sky-300 border-sky-500/20'
      }`}>
        <div className="flex items-center gap-2 font-mono">
          {isSuperAdmin ? <Crown className="w-4 h-4 text-amber-400" /> : <Shield className="w-4 h-4 text-sky-400" />}
          <span className="font-bold uppercase tracking-wider">
            {isSuperAdmin ? "Super Admin Master Console" : "Operations Staff Admin Console"}
          </span>
          <span className="opacity-40">|</span>
          <span className="text-[11px] opacity-90">
            {currentAdmin?.name || currentAdmin?.email} ({currentAdmin?.role || "admin"})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
            isSuperAdmin ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
          }`}>
            {isSuperAdmin ? "Full Root Access" : "Limited Permissions"}
          </span>
        </div>
      </div>

      <div className="ap-app">
        {/* Mobile Backdrop */}
        <div
          className={`ap-sidebar-backdrop ${mobileSidebarOpen ? "active" : ""}`}
          onClick={() => setMobileSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside className={`ap-sidebar ${mobileSidebarOpen ? "open mobile-open" : ""}`}>
          <div className="ap-brand flex items-center justify-between">
            <div>
              <div className="ap-brand-row items-center gap-2">
                <Logo size="sm" isLightMode={false} />
              </div>
              <div className="ap-brand-sub">
                {isSuperAdmin ? "Super Administrator" : "Operations Admin"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close menu"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <div
              className={`ap-nav-item ${section === "dashboard" ? "active" : ""}`}
              onClick={() => { setSection("dashboard"); setMobileSidebarOpen(false); }}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </div>

            <div
              className={`ap-nav-item ${section === "products" ? "active" : ""}`}
              onClick={() => { setSection("products"); setMobileSidebarOpen(false); }}
            >
              <Package className="w-4 h-4" />
              <span>Products & Flash Sales</span>
            </div>

            <div
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              className={`ap-nav-item ${section === "addProductStudio" ? "active" : ""}`}
              onClick={() => {
                setEditingProduct(null);
                setSection("addProductStudio");
                setMobileSidebarOpen(false);
              }}
            >
              <Plus className="w-4 h-4 text-rose-400" />
              <span className="text-rose-200 font-bold">Add Product Studio</span>
              <span className="ml-auto text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">
                PRO
              </span>
            </div>

            <div
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              className={`ap-nav-item ${section === "orders" ? "active" : ""}`}
              onClick={() => { setSection("orders"); setMobileSidebarOpen(false); }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </div>

            <div
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              className={`ap-nav-item ${section === "returnOrders" ? "active" : ""}`}
              onClick={() => { setSection("returnOrders"); setMobileSidebarOpen(false); }}
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Return Orders</span>
              <span className="ml-auto text-[9px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">RMA</span>
            </div>

            {/* CENTRAL ALIKE ND COMMAND (MODULE 3) */}
            <div
              className={`ap-nav-item ${section === "centralCommand" ? "active" : ""}`}
              onClick={() => { setSection("centralCommand"); setMobileSidebarOpen(false); }}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 font-bold">কেন্দ্রীয় কমান্ড (Central Admin)</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">MODULE 3</span>
            </div>

            <div
              className={`ap-nav-item ${section === "deliveryDispatch" ? "active" : ""}`}
              onClick={() => { setSection("deliveryDispatch"); setMobileSidebarOpen(false); }}
            >
              <Truck className="w-4 h-4 text-[#FF007F]" />
              <span className="text-[#FF007F] font-bold">Delivery & Dispatch</span>
              <span className="ml-auto text-[9px] bg-[#FF007F]/20 text-[#FF007F] px-1.5 py-0.5 rounded font-mono font-bold">FLEET</span>
            </div>

            <div
              className={`ap-nav-item ${section === "rides" ? "active" : ""}`}
              onClick={() => { setSection("rides"); setMobileSidebarOpen(false); }}
            >
              <Car className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Alike Rides & Drivers</span>
              <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">RIDES</span>
            </div>

            <div
              className={`ap-nav-item ${section === "sellers" ? "active" : ""}`}
              onClick={() => { setSection("sellers"); setMobileSidebarOpen(false); }}
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">Seller Management</span>
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {sellers.length}
              </span>
<<<<<<< HEAD
=======
=======
              className={`ap-nav-item ${section === "sellers" ? "active" : ""}`}
              onClick={() => { setSection("sellers"); setMobileSidebarOpen(false); }}
            >
              <Store className="w-4 h-4" />
              <span>Sellers ({sellers.length})</span>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            </div>

            <div
              className={`ap-nav-item ${section === "customers" ? "active" : ""}`}
              onClick={() => { setSection("customers"); setMobileSidebarOpen(false); }}
            >
              <Users className="w-4 h-4" />
              <span>Customers ({customers.length})</span>
            </div>

            <div
              className={`ap-nav-item ${section === "banners" ? "active" : ""}`}
              onClick={() => { setSection("banners"); setMobileSidebarOpen(false); }}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-100 font-semibold">Hero Banners</span>
              <span className="ml-auto text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">{banners.length}</span>
            </div>

            <div
              className={`ap-nav-item ${section === "categories" ? "active" : ""}`}
              onClick={() => { setSection("categories"); setMobileSidebarOpen(false); }}
            >
              <LayoutGrid className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100 font-semibold">Categories</span>
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">{categoriesList.length}</span>
            </div>

            <div
              className={`ap-nav-item ${section === "flashSale" ? "active" : ""}`}
              onClick={() => { setSection("flashSale"); setMobileSidebarOpen(false); }}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-orange-100 font-semibold">Flash Premium Hours</span>
              <span className="ml-auto text-[9px] bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
            </div>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* ADMIN PANEL: Commission Management & Platform Wallet */}
            <div
              className={`ap-nav-item ${section === "commission" ? "active" : ""}`}
              onClick={() => { setSection("commission"); setMobileSidebarOpen(false); }}
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-200 font-semibold">Commission Management</span>
              <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                {commissionData ? `${commissionData.commissionRate}%` : "5%"}
              </span>
            </div>
<<<<<<< HEAD
=======
=======
            {/* SUPER ADMIN EXCLUSIVE: Platform Commission & Wallet */}
            {isSuperAdmin && (
              <div
                className={`ap-nav-item ${section === "commission" ? "active" : ""}`}
                onClick={() => { setSection("commission"); setMobileSidebarOpen(false); }}
              >
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-200 font-semibold">Platform Earnings</span>
                <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  {commissionData ? `${commissionData.commissionRate}%` : "5%"}
                </span>
              </div>
            )}
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

            {/* SUPER ADMIN EXCLUSIVE: Sales Reports */}
            {isSuperAdmin && (
              <div
                className={`ap-nav-item ${section === "reports" ? "active" : ""}`}
                onClick={() => { setSection("reports"); setMobileSidebarOpen(false); }}
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-semibold">Sales Reports</span>
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">SUPER</span>
              </div>
            )}

            {/* Administrator Accounts / Ministry Directorate */}
            <div
              className={`ap-nav-item ${section === "adminUsers" ? "active" : ""}`}
              onClick={() => { setSection("adminUsers"); setMobileSidebarOpen(false); }}
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 font-semibold">এডমিন মিনিস্টার (Admin Minister)</span>
              {isSuperAdmin ? (
                <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">MINISTER</span>
              ) : (
                <span className="ml-auto text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-mono font-bold">DIRECTORY</span>
              )}
            </div>

            <div
              className={`ap-nav-item ${section === "activity" ? "active" : ""}`}
              onClick={() => { setSection("activity"); setMobileSidebarOpen(false); }}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Logs</span>
            </div>

            {/* Customer Care & Central Hotline Management */}
            <div
              className={`ap-nav-item ${section === "customerCare" ? "active" : ""}`}
              onClick={() => { setSection("customerCare"); setMobileSidebarOpen(false); }}
            >
              <Headphones className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100 font-semibold">কাস্টমার কেয়ার ও হটলাইন</span>
              <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                CARE & HOTLINE
              </span>
            </div>

            {/* Database & Cloud Services Hub: Multi-DB, Live Storage, Costs, Migration & Backup */}
            <div
              className={`ap-nav-item ${section === "databaseHub" ? "active" : ""}`}
              onClick={() => { setSection("databaseHub"); setMobileSidebarOpen(false); }}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100 font-semibold">Database & Cloud Hub</span>
              <span className="ml-auto text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                6 CLOUD
              </span>
            </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

            {/* Daraz-Inspired Marketplace Settings Dashboard */}
            <div
              className={`ap-nav-item ${section === "settingsHub" ? "active" : ""}`}
              onClick={() => { setSection("settingsHub"); setMobileSidebarOpen(false); }}
            >
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-blue-100 font-semibold">Settings</span>
              <span className="ml-auto text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                35 MODULES
              </span>
            </div>
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          </nav>

          <div className="ap-sidebar-foot space-y-2">
            <button
              onClick={onNavigateHome}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Galleria Store</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="ap-main">
          {/* Topbar */}
          <header className="ap-topbar">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer flex items-center justify-center shadow-xs border border-neutral-200 dark:border-neutral-700"
                onClick={() => setMobileSidebarOpen(true)}
                title="Open Navigation Menu"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="ap-page-title capitalize">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                  {section === "settingsHub" ? "Settings · Platform Business, Finance, Logistics, RBAC & Governance" : section === "centralCommand" ? "কেন্দ্রীয় এডমিন প্যানেল · Central ALIKE ND Command (মডিউল ৩)" : section === "sellers" ? "Seller Management · Applications, Stores, Products, Orders & Payouts" : section === "rides" ? "Alike Rides & Driver Operations (রাইড ও ড্রাইভার অপারেশন)" : section === "deliveryDispatch" ? "ডেলিভারি ও ফ্লিট ডিসপ্যাচ (Delivery Dispatch & Fleet)" : section === "banners" ? "Hero Carousel Banners" : section === "flashSale" ? "Flash Premium Hours & Countdown" : section === "adminUsers" ? "এডমিন মিনিস্টার (Admin Minister)" : section === "reports" ? "Sales & Revenue Analytics" : section === "commission" ? "Commission Management · Categories, Subcategories, Rules & Reports" : section === "returnOrders" ? "রিটার্ন অর্ডার ম্যানেজমেন্ট (Return Orders)" : section === "customers" ? "গ্রাহক ও ব্যবহারকারী ব্যবস্থাপনা (Customers Management)" : section}
                </h1>
                <p className="ap-page-sub">
                  {section === "centralCommand"
                    ? "Central Sovereign Command · Unified Dispatch, Partner Compliance, Financials & Business Rules"
                    : section === "adminUsers"
<<<<<<< HEAD
=======
=======
                  {section === "banners" ? "Hero Carousel Banners" : section === "flashSale" ? "Flash Premium Hours & Countdown" : section === "adminUsers" ? "এডমিন মিনিস্টার (Admin Minister)" : section === "reports" ? "Sales & Revenue Analytics" : section === "commission" ? "Platform Earnings & Commission Wallet" : section}
                </h1>
                <p className="ap-page-sub">
                  {section === "adminUsers"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                    ? "Sovereign Administration Directorate · কেন্দ্রীয় প্রশাসনিক মন্ত্রণালয় ও পরিচালনা"
                    : isSuperAdmin
                    ? "Root Administrator Console · alikendshop database"
                    : "Operations Administrator Console · Product & Order Management"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              {/* Change Password Button */}
              <button
                type="button"
                id="admin-change-pass-btn"
                onClick={() => {
                  setChangePasswordModalOpen(true);
                  setChangePasswordError("");
                  setCurrentPasswordInput("");
                  setNewPasswordInput("");
                  setConfirmPasswordInput("");
                }}
                className="h-9 px-3 bg-white hover:bg-slate-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                title="Change your admin account password"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="hidden sm:inline">Change Password</span>
              </button>

              {/* Dynamic Excel Export Button */}
              <button
                type="button"
                id="admin-export-excel-btn"
                onClick={handleExportCurrentSection}
                className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl border border-emerald-500 shadow-xs shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                title={`Export ${section} data to Excel (.xlsx)`}
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Export to Excel</span>
              </button>

              {/* Sync DB Button */}
              <button
                type="button"
                onClick={() => loadAll()}
                disabled={loading}
                className="h-9 px-3 bg-white hover:bg-slate-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-neutral-700 shadow-xs transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                title="Refresh database records"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Sync DB</span>
              </button>

              {/* Add Product Button */}
              {section === "products" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
<<<<<<< HEAD
                    setSection("addProductStudio");
=======
<<<<<<< HEAD
                    setSection("addProductStudio");
=======
                    setModalOpen(true);
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                  }}
                  className="h-9 px-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl border border-rose-500/30 shadow-xs shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Add Product</span>
                </button>
              )}
            </div>
          </header>

          {/* Success Banner */}
          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-rose-600 hover:text-rose-950">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="ap-content">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* SECTION: CENTRAL COMMAND (MODULE 3) */}
            {section === "centralCommand" && (
              <CentralAdminPanelModule
                currentAdminEmail={currentAdmin?.email || "admin@alikend.com"}
                isSuperAdmin={isSuperAdmin}
              />
            )}

<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* SECTION 1: DASHBOARD */}
            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="ap-tag-row">
                  <div 
                    className="ap-vip-card cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group shadow-md"
                    onClick={() => {
                      setSection("products");
                      setProdSearch("");
                      setProdCategory("");
                      setProdFlashFilter("all");
                    }}
                    title="Click to view and manage all products"
                  >
                    <div className="flex items-center justify-between">
                      <div className="ap-tag-label">Active Products</div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="ap-tag-value">{products.length}</div>
                    <div className="ap-tag-delta">{products.filter(p => p.badge === 'SALE' || p.isFlashSale).length} Flash Sale Products</div>
                  </div>

                  <div 
                    className="ap-vip-card cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group shadow-md"
                    onClick={() => {
                      setSection("orders");
                      setOrderSearch("");
                      setOrderStatusFilter("");
                    }}
                    title="Click to view and manage all orders"
                  >
                    <div className="flex items-center justify-between">
                      <div className="ap-tag-label">Orders Count</div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="ap-tag-value">{orders.length}</div>
                    <div className="ap-tag-delta">{orders.filter(o => o.status === 'pending').length} Pending Fulfillment</div>
                  </div>

                  <div 
                    className="ap-vip-card cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group shadow-md"
                    onClick={() => {
                      setSection("customers");
                      setCustSearch("");
                      setCustTierFilter("");
                    }}
                    title="Click to view all customers"
                  >
                    <div className="flex items-center justify-between">
                      <div className="ap-tag-label">Verified Customers</div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="ap-tag-value">{customers.length}</div>
                    <div className="ap-tag-delta">{customers.filter(c => c.tier === 'Platinum').length} Platinum VIP Members</div>
                  </div>

                  <div 
                    className="ap-vip-card cursor-pointer hover:scale-[1.02] active:scale-[0.99] transition-all group shadow-md"
                    onClick={() => {
                      setSection("sellers");
                      setSellerSearch("");
                      setSellerStatusFilter("");
                    }}
                    title="Click to view all sellers"
                  >
                    <div className="flex items-center justify-between">
                      <div className="ap-tag-label">Active Sellers</div>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="ap-tag-value">{sellers.length}</div>
                    <div className="ap-tag-delta">{sellers.filter(s => s.status === 'approved').length} Approved Ateliers</div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="ap-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Products & Flash</span>
                      </h3>
                      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                        Configure product pricing, MRPs, flash timers, and live stock indicators.
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("products")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-purple-700 border-purple-200 hover:bg-purple-50 gap-1 w-full justify-between"
                    >
                      <span>Manage Products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Orders Queue</span>
                      </h3>
                      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                        Transition member orders across Pending, Processing, Shipped, and Delivered.
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("orders")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-emerald-700 border-emerald-200 hover:bg-emerald-50 gap-1 w-full justify-between"
                    >
                      <span>View Orders</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Store Categories</span>
                      </h3>
                      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                        Reorder, add, or toggle category carousels with real-time storefront preview.
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("categories")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-amber-700 border-amber-200 hover:bg-amber-50 gap-1 w-full justify-between"
                    >
                      <span>Manage Categories</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
                        <Store className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Seller Ateliers</span>
                      </h3>
                      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                        Review seller applications, approve boutiques, and audit vendor payouts.
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("sellers")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-blue-700 border-blue-200 hover:bg-blue-50 gap-1 w-full justify-between"
                    >
                      <span>Manage Sellers</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 mb-2.5 flex items-center gap-2">
                        <Database className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Database & Cloud Hub</span>
                      </h3>
                      <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
                        Control Firebase, MongoDB, Supabase, Cloudinary, live storage, and cross-DB backups.
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("databaseHub")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-amber-800 border-amber-300 hover:bg-amber-100/60 gap-1 w-full justify-between font-bold"
                    >
                      <span>Manage Cloud DBs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2.5 flex items-center gap-2">
                        <Crown className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>এডমিন মিনিস্টার</span>
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                        হেড এডমিন, মেইন এডমিন, সাব এডমিন ও ইউজার এডমিনসহ মন্ত্রণালয় পরিচালনা ও পদায়ন।
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("adminUsers")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700 hover:bg-purple-100/60 gap-1 w-full justify-between font-bold"
                    >
                      <span>এডমিন মিনিস্টার খুলুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="ap-card p-5 flex flex-col justify-between border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-500/10 to-transparent">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-2.5 flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>কাস্টমার কেয়ার ও সেন্ট্রাল হটলাইন</span>
                      </h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
                        সেন্ট্রাল হটলাইন ডিরেক্টরি, সাপোর্ট টিকিট ট্র্যাকিং, কাস্টমার হিস্ট্রি ও সার্বক্ষণিক কনসিয়ার্জ সেবা।
                      </p>
                    </div>
                    <button
                      onClick={() => setSection("customerCare")}
                      className="ap-btn ap-btn-ghost ap-btn-sm text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100/60 gap-1 w-full justify-between font-bold"
                    >
                      <span>Customer Care প্যানেল খুলুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* SECTION 2: DARAZ-STYLE ADMIN PRODUCT MANAGEMENT SYSTEM */}
            {section === "products" && (
              <div className="space-y-4">
                {/* KPI Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {[
                    {
                      key: "all",
                      label: "All Products",
                      count: products.length,
                      tone: "bg-slate-900 text-white",
                    },
                    {
                      key: "published",
                      label: "Published Live",
                      count: products.filter(
                        (p) =>
                          !p.isDraft &&
                          !p.isHidden &&
                          p.isPublished !== false &&
                          p.moderationStatus !== "archived" &&
                          p.moderationStatus !== "rejected"
                      ).length,
                      tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
                    },
                    {
                      key: "drafts",
                      label: "Drafts",
                      count: products.filter((p) => p.isDraft || p.moderationStatus === "draft").length,
                      tone: "bg-amber-50 text-amber-800 border-amber-200",
                    },
                    {
                      key: "pending_approval",
                      label: "Pending QC",
                      count: products.filter(
                        (p) => p.moderationStatus === "pending" || p.approvalStatus === "pending"
                      ).length,
                      tone: "bg-indigo-50 text-indigo-800 border-indigo-200",
                    },
                    {
                      key: "rejected",
                      label: "Rejected",
                      count: products.filter(
                        (p) => p.moderationStatus === "rejected" || p.approvalStatus === "rejected"
                      ).length,
                      tone: "bg-rose-50 text-rose-800 border-rose-200",
                    },
                    {
                      key: "unpublished",
                      label: "Unpublished",
                      count: products.filter(
                        (p) =>
                          (p.isPublished === false || p.isHidden === true) &&
                          !p.isDraft &&
                          p.moderationStatus !== "archived"
                      ).length,
                      tone: "bg-neutral-100 text-neutral-700 border-neutral-300",
                    },
                    {
                      key: "out_of_stock",
                      label: "Out of Stock",
                      count: products.filter((p) => (p.stock ?? 0) <= 0).length,
                      tone: "bg-red-50 text-red-700 border-red-200",
                    },
                    {
                      key: "archived",
                      label: "Archived",
                      count: products.filter((p) => p.moderationStatus === "archived").length,
                      tone: "bg-neutral-100 text-neutral-600 border-neutral-200",
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setProdFlashFilter(tab.key as any);
                        setProdPage(1);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        prodFlashFilter === tab.key
                          ? "ring-2 ring-rose-600 bg-white shadow-sm"
                          : "bg-white/90 hover:bg-white border-neutral-200"
                      }`}
                    >
                      <div className="mkt-helper uppercase tracking-wider text-neutral-500 font-semibold truncate">
                        {tab.label}
                      </div>
                      <div className="mkt-price font-semibold text-neutral-900 mt-0.5">
                        {tab.count}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Status Filter Bar + Actions */}
                <div className="ap-card p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: "all", label: "All Products" },
                        { id: "published", label: "Published" },
                        { id: "drafts", label: "Drafts" },
                        { id: "pending_approval", label: "Pending Approval" },
                        { id: "approved", label: "Approved" },
                        { id: "rejected", label: "Rejected" },
                        { id: "unpublished", label: "Unpublished" },
                        { id: "out_of_stock", label: "Out-of-Stock" },
                        { id: "archived", label: "Archived" },
                        { id: "flash", label: "🔥 Flash Deals" },
                      ].map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setProdFlashFilter(st.id as any);
                            setProdPage(1);
                          }}
                          className={`mkt-btn px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                            prodFlashFilter === st.id
                              ? "bg-rose-600 text-white shadow-2xs"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCsvImportModalOpen(true)}
                        className="mkt-btn h-9 px-3 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bulk CSV Import</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const exportRows = filteredProducts.map((p) => ({
                            "Product ID": p.internalProductId || p.id || p._id,
                            SKU: p.sku || "—",
                            "Product Name": p.name,
                            "Localized Name": p.localizedName || "",
                            Brand: p.brand || "Alike Sovereign",
                            Category: p.category,
                            Subcategory: p.subCategory || "",
                            Seller: p.sellerShopName || "ALIKE-ND Official",
                            "Selling Price (INR)": p.price,
                            "MRP (INR)": p.mrp || p.price,
                            Stock: p.stock ?? 0,
                            Variants: p.variants?.length || 0,
                            Status: p.isDraft ? "Draft" : p.isPublished === false ? "Unpublished" : "Published",
                            "Approval Status": p.moderationStatus || "approved",
                            "Content Score": p.contentScore ?? 85,
                          }));
                          exportDataToExcel(exportRows, "ALIKE_Catalog_Products", "Products");
                        }}
                        className="mkt-btn h-9 px-3 rounded-xl border border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export Excel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setSection("addProductStudio");
                        }}
                        className="mkt-btn h-9 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Multi-Filter Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                    <div className="relative lg:col-span-2">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search by Product Name, SKU, Product ID, Brand, Seller, or Internal Tags..."
                        value={prodSearch}
                        onChange={(e) => {
                          setProdSearch(e.target.value);
                          setProdPage(1);
                        }}
                        className="ap-input ap-input-search mkt-input !pl-10 h-9 w-full"
<<<<<<< HEAD
=======
=======
            {/* SECTION 2: PRODUCTS & FLASH HOURS */}
            {section === "products" && (
              <div className="space-y-4">
                {/* Search, Category, and Flash filter */}
                <div className="ap-toolbar-row">
                  <div className="flex flex-wrap gap-2 flex-1">
                    <div className="relative min-w-[200px] flex-1">
                      <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder="Search products by title, brand, or category..."
                        value={prodSearch}
                        onChange={(e) => setProdSearch(e.target.value)}
                        className="ap-input ap-input-search !pl-11 h-10 text-xs sm:text-sm"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                      />
                      {prodSearch && (
                        <button
                          type="button"
                          onClick={() => setProdSearch("")}
<<<<<<< HEAD
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
=======
<<<<<<< HEAD
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
=======
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5 rounded-full hover:bg-neutral-100"
                          title="Clear search"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <select
                      value={prodCategory}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                      onChange={(e) => {
                        setProdCategory(e.target.value);
                        setProdPage(1);
                      }}
                      className="ap-select mkt-select h-9"
<<<<<<< HEAD
=======
=======
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="ap-select w-auto min-w-[140px]"
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="capitalize">
                          {cat}
                        </option>
                      ))}
                    </select>

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                    <select
                      value={prodSellerFilter}
                      onChange={(e) => {
                        setProdSellerFilter(e.target.value);
                        setProdPage(1);
                      }}
                      className="ap-select mkt-select h-9"
                    >
                      <option value="">All Sellers & Platform</option>
                      <option value="admin">ALIKE-ND Official (Flagship)</option>
                      {sellers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.shopName || s.storefront} ({s.ownerName})
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <select
                        value={prodStockFilter}
                        onChange={(e) => {
                          setProdStockFilter(e.target.value as any);
                          setProdPage(1);
                        }}
                        className="ap-select mkt-select h-9 flex-1"
                      >
                        <option value="">All Stock</option>
                        <option value="in_stock">In Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock (0)</option>
                      </select>

                      <select
                        value={prodSortBy}
                        onChange={(e) => setProdSortBy(e.target.value as any)}
                        className="ap-select mkt-select h-9 flex-1"
                      >
                        <option value="newest">Sort: Latest</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="stock_asc">Stock: Low → High</option>
                        <option value="score_desc">Content Score</option>
                      </select>
                    </div>
                  </div>
<<<<<<< HEAD
=======
=======
                    <div className="flex rounded-lg border border-neutral-300 overflow-hidden bg-white">
                      <button
                        onClick={() => {
                          setProdFlashFilter("all");
                          setProdCategory("");
                          setProdSearch("");
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          prodFlashFilter === "all" && !prodCategory && !prodSearch ? "bg-purple-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                        title="Click to reset filters and view all products"
                      >
                        All ({products.length})
                      </button>
                      <button
                        onClick={() => setProdFlashFilter("flash")}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1 transition-colors ${
                          prodFlashFilter === "flash" ? "bg-amber-500 text-black font-black" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Flash Sales ({products.filter(p => p.badge === 'SALE' || p.isFlashSale).length})</span>
                      </button>
                      <button
                        onClick={() => setProdFlashFilter("regular")}
                        className={`px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                          prodFlashFilter === "regular" ? "bg-purple-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        Standard
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setModalOpen(true);
                    }}
                    className="h-10 px-4 bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-xs shadow-rose-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    <span>Add New Product</span>
                  </button>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                </div>

                {/* Products Table */}
                <div className="ap-card">
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                  <div className="p-3 bg-neutral-50/70 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Showing {paginatedProducts.length} of {filteredProducts.length} filtered products (Page {prodPage} of {totalProdPages})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={prodPage <= 1}
                        onClick={() => setProdPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Prev
                      </button>
                      <span className="font-mono text-xs font-bold text-neutral-800">
                        {prodPage} / {totalProdPages}
                      </span>
                      <button
                        type="button"
                        disabled={prodPage >= totalProdPages}
                        onClick={() => setProdPage((p) => Math.min(totalProdPages, p + 1))}
                        className="px-2.5 py-1 rounded border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-bold disabled:opacity-40 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>

<<<<<<< HEAD
=======
=======
                  <div className="p-3 bg-neutral-50/70 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Showing {filteredProducts.length} items • Scroll horizontally if needed to view all columns
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Actions column is pinned to the right
                    </span>
                  </div>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                          <th className="min-w-[250px]">Product & Content Score</th>
                          <th className="min-w-[140px]">Product ID & SKU</th>
                          <th className="min-w-[140px]">Category</th>
                          <th className="min-w-[150px]">Seller Store</th>
                          <th className="min-w-[130px]">Price & MRP</th>
                          <th className="min-w-[120px]">Stock & Variants</th>
                          <th className="min-w-[150px]">Status & QC Approval</th>
                          <th className="min-w-[110px]">Last Updated</th>
                          <th className="text-right min-w-[220px] ap-sticky-col-header font-bold text-neutral-800">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((p) => {
                          const targetId = p._id || String(p.id);
                          const mrp = p.mrp || p.price;
                          const discount = Math.max(0, Math.round(((mrp - p.price) / mrp) * 100));
                          const variantCount = Array.isArray(p.variants) ? p.variants.length : 0;
                          const score = p.contentScore ?? 85;
                          const modStatus = p.isDraft
                            ? "draft"
                            : p.moderationStatus || p.approvalStatus || "approved";
                          const isLive =
                            !p.isDraft &&
                            !p.isHidden &&
                            p.isPublished !== false &&
                            modStatus !== "rejected" &&
                            modStatus !== "archived" &&
                            modStatus !== "pending";

                          return (
                            <tr key={targetId}>
                              <td>
                                <div className="flex items-center gap-3 min-w-[230px]">
                                  <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 relative">
<<<<<<< HEAD
=======
=======
                          <th className="min-w-[240px]">Item</th>
                          <th className="min-w-[140px]">Brand</th>
                          <th className="min-w-[120px]">Category</th>
                          <th className="min-w-[130px]">Price & MRP</th>
                          <th className="min-w-[100px]">Discount</th>
                          <th className="min-w-[120px]">Stock & Status</th>
                          <th className="min-w-[120px]">Badge / Flash</th>
                          <th className="min-w-[100px]">Rating</th>
                          <th className="text-right min-w-[140px] ap-sticky-col-header font-bold text-neutral-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => {
                          const mrp = p.mrp || p.price;
                          const discount = Math.max(0, Math.round(((mrp - p.price) / mrp) * 100));
                          const isFlash = p.badge === "SALE" || p.isFlashSale === true;

                          return (
                            <tr key={p._id || p.id}>
                              <td>
                                <div className="flex items-center gap-3 min-w-[220px]">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                    {p.image ? (
                                      <img
                                        src={p.image}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                    )}
                                  </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-neutral-900 truncate">{p.name}</div>
                                    {p.localizedName && (
                                      <div className="mkt-helper font-bengali text-neutral-500 truncate" lang="bn">
                                        {p.localizedName}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="mkt-helper text-neutral-500">
                                        {p.brand || "Alike Sovereign"}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded text-[11px] font-semibold ${
                                          score >= 80
                                            ? "bg-emerald-50 text-emerald-700"
                                            : score >= 55
                                            ? "bg-amber-50 text-amber-700"
                                            : "bg-rose-50 text-rose-700"
                                        }`}
                                      >
                                        Score {score}/100
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td>
                                <div className="font-semibold text-neutral-800">
                                  {p.sku || `SKU-${String(p.id).slice(-5)}`}
                                </div>
                                <div className="mkt-helper text-neutral-400">
                                  ID: {p.internalProductId || String(p.id || p._id).slice(-8)}
                                </div>
                              </td>

                              <td>
                                <div className="capitalize font-medium text-neutral-800">
                                  {p.category}
                                </div>
                                {p.subCategory && (
                                  <div className="mkt-helper text-neutral-500 truncate">
                                    → {p.subCategory}
                                  </div>
                                )}
                              </td>

                              <td>
                                <div className="font-medium text-neutral-800">
                                  {p.sellerShopName || "ALIKE-ND Official"}
                                </div>
                                <div className="mkt-helper text-neutral-400">
                                  {!p.sellerId || p.sellerId === "admin" ? "Platform Flagship" : `Seller #${String(p.sellerId).slice(-5)}`}
                                </div>
                              </td>

                              <td>
                                <div className="mkt-price font-semibold text-neutral-900">
                                  ₹{(p.price ?? 0).toLocaleString("en-IN")}
                                </div>
                                {mrp > p.price && (
                                  <div className="flex items-center gap-1">
                                    <span className="mkt-helper text-neutral-400 line-through">
                                      ₹{mrp.toLocaleString("en-IN")}
                                    </span>
                                    <span className="mkt-helper font-semibold text-emerald-700">
                                      -{discount}%
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td>
                                <div className="flex flex-col gap-0.5">
                                  <span
                                    className={`mkt-numeric font-semibold ${
                                      (p.stock ?? 0) <= 0
                                        ? "text-rose-600"
                                        : (p.stock ?? 0) <= (p.lowStockThreshold || 5)
                                        ? "text-amber-600"
                                        : "text-neutral-900"
                                    }`}
                                  >
                                    {p.stock ?? 0} units
                                  </span>
                                  <span className="mkt-helper text-neutral-500">
                                    {variantCount > 0 ? `${variantCount} Variants` : "Single SKU"}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {p.isDraft || modStatus === "draft" ? (
                                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold uppercase">
                                        Draft
                                      </span>
                                    ) : isLive ? (
                                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">
                                        Published
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-700 text-[10px] font-mono font-bold uppercase">
                                        Unpublished
                                      </span>
                                    )}

                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                        modStatus === "approved"
                                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                                          : modStatus === "pending"
                                          ? "bg-indigo-100 text-indigo-800"
                                          : modStatus === "rejected"
                                          ? "bg-rose-100 text-rose-800"
                                          : modStatus === "archived"
                                          ? "bg-neutral-200 text-neutral-600"
                                          : "bg-amber-50 text-amber-700"
                                      }`}
                                    >
                                      QC: {modStatus}
                                    </span>
                                  </div>
                                  {(p.rejectionReason || p.moderationNote) && modStatus === "rejected" && (
                                    <div className="text-[10px] text-rose-600 font-medium truncate max-w-[160px]" title={p.rejectionReason || p.moderationNote}>
                                      Reason: {p.rejectionReason || p.moderationNote}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div className="text-xs text-neutral-700 font-mono">
                                  {p.updatedAt
                                    ? new Date(p.updatedAt).toLocaleDateString()
                                    : p.createdAt
                                    ? new Date(p.createdAt).toLocaleDateString()
                                    : "Recent"}
                                </div>
                                {p.scheduledPublishAt && (
                                  <div className="text-[10px] font-mono text-indigo-600">
                                    Sched: {new Date(p.scheduledPublishAt).toLocaleDateString()}
                                  </div>
                                )}
                              </td>

                              <td className="text-right ap-sticky-col-cell">
                                <div className="flex items-center justify-end gap-1 flex-wrap min-w-[200px]">
                                  <button
                                    type="button"
                                    onClick={() => setViewingProduct(p)}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 cursor-pointer"
                                    title="View Product Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>

<<<<<<< HEAD
=======
=======
                                  <div className="min-w-0">
                                    <div className="font-bold text-neutral-900 truncate">{p.name}</div>
                                    <div className="text-[11px] text-neutral-500 truncate">{p.description?.slice(0, 45)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="font-mono text-xs font-semibold text-neutral-700">{p.brand || "Alike Sovereign"}</td>
                              <td className="capitalize text-xs text-neutral-600">{p.category}</td>
                              <td>
                                <div className="font-bold text-neutral-900">₹{(p.price ?? 0).toLocaleString("en-IN")}</div>
                                {p.mrp && p.mrp > p.price && (
                                  <div className="text-[11px] text-neutral-400 line-through">₹{(p.mrp ?? 0).toLocaleString("en-IN")}</div>
                                )}
                              </td>
                              <td>
                                {discount > 0 ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black font-mono">
                                    {discount}% OFF
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400 font-mono">—</span>
                                )}
                              </td>
                              <td>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-bold text-neutral-800">{p.stock} units</span>
                                  <span className="text-[10px] text-neutral-500 font-medium">{(p.stockStatus === '20-Min Express' || p.stockStatus === '20 Min Express') ? 'Fast Express' : (p.stockStatus || "In Stock")}</span>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {p.badge && (
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                      p.badge === 'SALE' ? 'bg-amber-500 text-black' : p.badge === 'HOT' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'
                                    }`}>
                                      {p.badge}
                                    </span>
                                  )}
                                  {isFlash && (
                                    <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 text-[9px] font-black flex items-center gap-0.5">
                                      <Flame className="w-3 h-3 text-orange-600" /> Flash
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  <span className="font-bold">{p.rating?.toFixed(1) || "4.8"}</span>
                                  <span className="text-[10px] text-neutral-400">({p.reviewsCount || 0})</span>
                                </div>
                              </td>
                              <td className="text-right ap-sticky-col-cell">
                                <div className="flex items-center justify-end gap-1.5 min-w-[120px]">
                                  <button
                                    type="button"
                                    onClick={() => setViewingProduct(p)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    title="View Product Details"
                                    aria-label="View Product"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(p);
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                      setSection("addProductStudio");
                                    }}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer"
                                    title="Edit Product in Studio (Prefilled)"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={actionLoadingId === targetId}
                                    onClick={() => handleDuplicateAdminProduct(p)}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
                                    title="Duplicate Product as Draft"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>

                                  {modStatus !== "approved" && (
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === targetId}
                                      onClick={() => handleAdminProductStatusAction(p, "approve")}
                                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                                      title="Approve & Publish Product"
                                    >
                                      Approve
                                    </button>
                                  )}

                                  {modStatus !== "rejected" && (
                                    <button
                                      type="button"
                                      disabled={actionLoadingId === targetId}
                                      onClick={() => {
                                        setRejectingProduct(p);
                                        setRejectionReasonInput(p.rejectionReason || "");
                                      }}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold cursor-pointer"
                                      title="Reject Product with Reason"
                                    >
                                      Reject
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    disabled={actionLoadingId === targetId}
                                    onClick={() =>
                                      handleAdminProductStatusAction(p, isLive ? "unpublish" : "publish")
                                    }
                                    className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 text-[10px] font-bold cursor-pointer"
                                    title={isLive ? "Unpublish from Storefront" : "Publish to Storefront"}
                                  >
                                    {isLive ? "Unpublish" : "Publish"}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={actionLoadingId === targetId}
                                    onClick={() =>
                                      handleAdminProductStatusAction(
                                        p,
                                        modStatus === "archived" ? "restore" : "archive"
                                      )
                                    }
                                    className="px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-200 text-[10px] font-bold cursor-pointer"
                                    title={modStatus === "archived" ? "Restore Product" : "Archive Product"}
                                  >
                                    {modStatus === "archived" ? "Restore" : "Archive"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setAuditModalProduct(p)}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200 cursor-pointer"
                                    title="View Product Change & Inventory Audit Log"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(targetId, p.name)}
                                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
<<<<<<< HEAD
=======
=======
                                      setModalOpen(true);
                                    }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    title="Edit Product"
                                    aria-label="Edit Product"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p._id || String(p.id), p.name)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    title="Delete Product"
                                    aria-label="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredProducts.length === 0 && (
                          <tr>
                            <td colSpan={9} className="text-center py-12 text-neutral-500">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Package className="w-8 h-8 text-neutral-300" />
                                <p className="font-semibold text-sm">No products found matching the criteria</p>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                <p className="text-xs text-neutral-400">
                                  Try clearing filters or search terms to see all catalog items.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setProdSearch("");
                                    setProdCategory("");
                                    setProdSellerFilter("");
                                    setProdStockFilter("");
                                    setProdFlashFilter("all");
                                    setProdPage(1);
                                  }}
<<<<<<< HEAD
=======
=======
                                <p className="text-xs text-neutral-400">Try clearing filters or search terms to see all catalog items.</p>
                                <button
                                  type="button"
                                  onClick={() => { setProdSearch(""); setProdCategory(""); setProdFlashFilter("all"); }}
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
                                  className="mt-2 px-3.5 py-1.5 text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  Reset All Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

                {/* Reject Product Modal */}
                {rejectingProduct && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-neutral-900">
                          Reject Product — Quality Control
                        </h3>
                        <button
                          type="button"
                          onClick={() => setRejectingProduct(null)}
                          className="p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Specify the rejection reason for <strong>{rejectingProduct.name}</strong>. This reason will be shown to the seller in Seller Center so they can fix and resubmit.
                      </p>
                      <textarea
                        rows={3}
                        value={rejectionReasonInput}
                        onChange={(e) => setRejectionReasonInput(e.target.value)}
                        placeholder="e.g., Cover image contains watermarks, or specification table is incomplete..."
                        className="w-full p-3 rounded-xl border border-neutral-300 text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setRejectingProduct(null)}
                          className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleAdminProductStatusAction(
                              rejectingProduct,
                              "reject",
                              rejectionReasonInput.trim() || "Does not meet catalog quality guidelines"
                            )
                          }
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Change & Inventory Audit History Modal */}
                {auditModalProduct && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-neutral-200">
                      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                        <div>
                          <h3 className="text-base font-bold text-neutral-900">
                            Product Change & Stock Audit Trail
                          </h3>
                          <p className="text-xs text-neutral-500">
                            {auditModalProduct.name} ({auditModalProduct.sku || auditModalProduct.internalProductId})
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAuditModalProduct(null)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Catalog Change History
                        </h4>
                        {Array.isArray(auditModalProduct.changeHistory) &&
                        auditModalProduct.changeHistory.length > 0 ? (
                          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-neutral-50">
                            {auditModalProduct.changeHistory.map((ch) => (
                              <div key={ch.id} className="p-3 text-xs flex items-center justify-between gap-3">
                                <div>
                                  <span className="font-mono font-bold text-rose-600 uppercase mr-2">
                                    [{ch.action}]
                                  </span>
                                  <span className="text-neutral-800 font-medium">{ch.summary}</span>
                                </div>
                                <div className="text-[11px] font-mono text-neutral-500 shrink-0">
                                  {ch.actorName} ({ch.actorRole}) • {new Date(ch.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400">No change history recorded yet.</p>
                        )}
                      </div>

                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                          Inventory Stock Adjustment Log
                        </h4>
                        {Array.isArray(auditModalProduct.inventoryHistory) &&
                        auditModalProduct.inventoryHistory.length > 0 ? (
                          <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl bg-neutral-50">
                            {auditModalProduct.inventoryHistory.map((inv: any) => (
                              <div key={inv.id} className="p-3 text-xs flex items-center justify-between gap-3">
                                <div>
                                  <span className="font-mono font-bold text-emerald-700 mr-2">
                                    {inv.previousStock} → {inv.newStock} units
                                  </span>
                                  <span className="text-neutral-700">{inv.reason}</span>
                                </div>
                                <div className="text-[11px] font-mono text-neutral-500 shrink-0">
                                  {inv.actor} • {new Date(inv.timestamp).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400">No stock adjustments logged yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bulk CSV Import Modal */}
                {csvImportModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-neutral-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-neutral-900">
                          Bulk CSV Product Import
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCsvImportModalOpen(false)}
                          className="p-1 rounded-lg hover:bg-neutral-100 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-neutral-600">
                        Paste CSV rows below with headers: <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono">name,brand,category,subcategory,sku,price,mrp,stock,image,description</code>
                      </p>
                      <textarea
                        rows={6}
                        value={csvRawInput}
                        onChange={(e) => setCsvRawInput(e.target.value)}
                        placeholder={`name,brand,category,subcategory,sku,price,mrp,stock\nAlike Royal Chrono Watch,Alike Sovereign,fashion,Watches,SKU-901,4999,6999,25`}
                        className="w-full p-3 rounded-xl border border-neutral-300 font-mono text-xs"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCsvImportModalOpen(false)}
                          className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isImportingCsv || !csvRawInput.trim()}
                          onClick={handleAdminCsvImport}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                          {isImportingCsv ? "Importing..." : "Import Products"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION: DARAZ-STYLE ADD / EDIT PRODUCT STUDIO */}
            {section === "addProductStudio" && (
              <DarazAddProductStudio
                mode="admin"
                initialProduct={editingProduct}
                sellers={sellers}
                existingProducts={products}
                onBack={() => {
                  setEditingProduct(null);
                  setSection("products");
                }}
                onSaved={(savedProduct, isDraft) => {
                  const targetId = savedProduct._id || String(savedProduct.id);
                  const exists = products.some(
                    (p) => (p._id || String(p.id)) === targetId
                  );
                  const updatedList = exists
                    ? products.map((p) =>
                        (p._id || String(p.id)) === targetId ? { ...p, ...savedProduct } : p
                      )
                    : [savedProduct, ...products];
                  setProducts(updatedList);
                  if (onProductsChange) {
                    onProductsChange(updatedList.filter((p) => !p.isDraft && p.isPublished !== false));
                  }
                  if (!isDraft) {
                    flashSuccess(
                      `Product "${savedProduct.name}" published and synced to catalog.`
                    );
                    setEditingProduct(null);
                    setSection("products");
                  } else {
                    setEditingProduct(savedProduct);
                  }
                }}
              />
            )}

<<<<<<< HEAD
=======
=======
              </div>
            )}

>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* SECTION 3: ORDERS */}
            {section === "orders" && (
              <div className="space-y-4">
                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Search orders by number or member name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="ap-input ap-input-search !pl-11 h-10 text-xs sm:text-sm"
                    />
                    {orderSearch && (
                      <button
                        type="button"
                        onClick={() => setOrderSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5 rounded-full hover:bg-neutral-100"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="ap-select w-auto min-w-[140px]"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    type="button"
                    id="orders-table-export-excel-btn"
                    onClick={() => {
                      const dataList = filteredOrders.length > 0 ? filteredOrders : orders;
                      exportDataToExcel(formatOrdersForExcel(dataList), "Orders_Report", "Orders");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer border border-emerald-500 shrink-0"
                    title="Export Orders table to Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export to Excel</span>
                  </button>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Member</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th className="text-right">Update Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((o) => (
                          <tr key={o._id}>
                            <td className="font-mono font-bold text-xs">{o.orderNumber}</td>
                            <td>
                              <div className="font-medium text-neutral-900">{o.memberName}</div>
                              {o.memberEmail && <div className="text-[11px] text-neutral-400 font-mono">{o.memberEmail}</div>}
                            </td>
                            <td className="font-bold text-neutral-900">₹{o.total.toLocaleString("en-IN")}</td>
                            <td><Seal status={o.status} /></td>
                            <td className="text-xs text-neutral-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="text-right">
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatus(o._id, e.target.value as OrderStatus)}
                                disabled={actionLoadingId === o._id}
                                className="ap-select py-1 text-xs w-auto font-medium"
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            {/* SECTION 4: SELLER MANAGEMENT */}
            {section === "sellers" && (
              <SellerManagementModule
                sellers={sellers}
                products={products}
                orders={orders}
                activityLogs={activityLogs}
                currentAdmin={currentAdmin}
                onRefreshAll={() => loadAll(currentAdmin)}
                onEditProductModal={(prod) => {
                  setEditingProduct(prod);
                  setSection("addProductStudio");
                }}
                onUpdateOrderStatus={(orderId, nextStatus) =>
                  handleOrderStatus(orderId, nextStatus as OrderStatus)
                }
                onDownloadExcel={(rows, filename, sheetName) =>
                  exportDataToExcel(rows, filename, sheetName)
                }
                showToast={(msg, isErr) => {
                  if (isErr) flashError(msg);
                  else flashSuccess(msg);
                }}
              />
            )}

            {/* SECTION 5: ADVANCED CUSTOMER & USER MANAGEMENT */}
            {section === "customers" && (
              <AdvancedCustomerManagement
                customers={customers as any}
                onRefresh={() => loadAll(currentAdmin)}
                onShowToast={(msg, type) => {
                  if (type === "error") flashError(msg);
                  else flashSuccess(msg);
                }}
                isSuperAdmin={isSuperAdmin}
              />
            )}

            {/* SECTION: RETURN ORDERS MANAGEMENT */}
            {section === "returnOrders" && (
              <ReturnOrdersManagement
                onShowToast={(msg, type) => {
                  if (type === "error") flashError(msg);
                  else flashSuccess(msg);
                }}
                isSuperAdmin={isSuperAdmin}
              />
            )}

            {/* SECTION: DELIVERY DISPATCH & PARTNER FLEET */}
            {section === "deliveryDispatch" && (
              <AdminDeliveryDispatchSection />
            )}

            {/* SECTION: ALIKE RIDES & DRIVER OPERATIONS */}
            {section === "rides" && (
              <AdminRidesSection />
<<<<<<< HEAD
=======
=======
            {/* SECTION 4: SELLERS */}
            {section === "sellers" && (
              <div className="space-y-4">
                {/* Pending Applications Review Alert Banner */}
                {sellers.filter((s) => s.status === "pending").length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                        {sellers.filter((s) => s.status === "pending").length}
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          {sellers.filter((s) => s.status === "pending").length} Pending Seller Application{sellers.filter((s) => s.status === "pending").length > 1 ? "s" : ""}
                        </div>
                        <div className="text-xs text-amber-800">
                          Review merchant applications and approve verified businesses to enable their Seller Dashboard and catalog listing tools.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSellerStatusFilter(sellerStatusFilter === "pending" ? "" : "pending")}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
                    >
                      {sellerStatusFilter === "pending" ? "Show All Sellers" : "Review Pending Applications"}
                    </button>
                  </div>
                )}

                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Search by shop name, owner, phone, email, or address..."
                      value={sellerSearch}
                      onChange={(e) => setSellerSearch(e.target.value)}
                      className="ap-input ap-input-search !pl-11 h-10 text-xs sm:text-sm"
                    />
                    {sellerSearch && (
                      <button
                        type="button"
                        onClick={() => setSellerSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5 rounded-full hover:bg-neutral-100"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <select
                    value={sellerStatusFilter}
                    onChange={(e) => setSellerStatusFilter(e.target.value)}
                    className="ap-select w-auto min-w-[150px] font-medium"
                  >
                    <option value="">All Statuses ({sellers.length})</option>
                    <option value="pending">Pending Approval ({sellers.filter((s) => s.status === "pending").length})</option>
                    <option value="approved">Approved ({sellers.filter((s) => s.status === "approved").length})</option>
                    <option value="review">In Review</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Shop / Storefront</th>
                          <th>Owner & Contact</th>
                          <th>KYC / Tax & Bank</th>
                          <th>Catalog Listings</th>
                          <th>Status</th>
                          <th className="text-right">Admin Approval & Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSellers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-neutral-500 text-sm">
                              No sellers found matching the current search or status filter.
                            </td>
                          </tr>
                        ) : (
                          filteredSellers.map((s, sIdx) => {
                            const sellerId = String(s._id || (s as any).id || `seller-${sIdx}`);
                            const isPending = s.status === "pending";
                            const displayName = s.shopName || s.storefront || "Storefront";
                            const contactEmail = s.email || s.ownerEmail || "—";
                            const contactPhone = s.mobileNumber || "—";
                            const address = s.businessAddress || "—";
                            const isExpanded = expandedKycSellerId === sellerId;
                            const isKycVerified = Boolean(s.kycVerified);

                            return (
                              <React.Fragment key={sellerId}>
                                <tr className={isPending ? "bg-amber-50/40" : undefined}>
                                  <td>
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                                        <Store className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <div className="font-serif font-bold text-neutral-900">{displayName}</div>
                                        <div className="text-[11px] text-neutral-400 font-mono">
                                          ID: {sellerId ? sellerId.slice(-6) : "—"}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="font-medium text-neutral-900">{s.ownerName}</div>
                                    <div className="text-[11px] text-neutral-600 font-mono flex items-center gap-1 mt-0.5">
                                      <Mail className="w-3 h-3 text-neutral-400" />
                                      <span>{contactEmail}</span>
                                    </div>
                                    {contactPhone !== "—" && (
                                      <div className="text-[11px] text-neutral-600 font-mono flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3 text-neutral-400" />
                                        <span>{contactPhone}</span>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        {isKycVerified ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                            KYC Verified
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                            <Clock className="w-3 h-3 text-amber-600" />
                                            KYC Pending
                                          </span>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => setExpandedKycSellerId(isExpanded ? null : sellerId)}
                                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-0.5 transition-colors cursor-pointer"
                                        >
                                          {isExpanded ? (
                                            <>Hide Details <ChevronUp className="w-3 h-3" /></>
                                          ) : (
                                            <>View Details <ChevronDown className="w-3 h-3" /></>
                                          )}
                                        </button>
                                      </div>
                                      <div className="text-[11px] text-neutral-500 font-mono">
                                        PAN: {s.panNumber || "—"}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="font-bold text-xs">
                                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[11px]">
                                      {s.listingsCount || 0} items
                                    </span>
                                  </td>
                                  <td>
                                    <Seal status={s.status} />
                                  </td>
                                  <td className="text-right">
                                    <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleSellerKyc(sellerId, isKycVerified)}
                                        disabled={actionLoadingId === sellerId}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer ${
                                          isKycVerified
                                            ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300"
                                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300"
                                        }`}
                                        title={isKycVerified ? "Mark KYC as unverified" : "Approve and verify seller KYC"}
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        {isKycVerified ? "Revoke KYC" : "Verify KYC"}
                                      </button>

                                      {isPending ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleSellerStatus(sellerId, "approved")}
                                            disabled={actionLoadingId === sellerId}
                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                            title="Approve seller application"
                                          >
                                            <Check className="w-3.5 h-3.5" /> Approve
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSellerStatus(sellerId, "rejected")}
                                            disabled={actionLoadingId === sellerId}
                                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                            title="Reject seller application"
                                          >
                                            <X className="w-3.5 h-3.5" /> Reject
                                          </button>
                                        </>
                                      ) : (
                                        <select
                                          value={s.status}
                                          onChange={(e) => handleSellerStatus(sellerId, e.target.value as SellerStatus)}
                                          disabled={actionLoadingId === sellerId}
                                          className="ap-select py-1 text-xs w-auto font-medium"
                                        >
                                          <option value="approved">Approved</option>
                                          <option value="review">In Review</option>
                                          <option value="pending">Pending</option>
                                          <option value="suspended">Suspended</option>
                                          <option value="rejected">Rejected</option>
                                        </select>
                                      )}
                                    </div>
                                  </td>
                                </tr>

                                {isExpanded && (
                                  <tr className="bg-neutral-50/80 dark:bg-neutral-900/30">
                                    <td colSpan={6} className="p-4">
                                      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 text-xs shadow-xs space-y-4">
                                        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2.5">
                                          <div className="flex items-center gap-2">
                                            <FileCheck className="w-4 h-4 text-neutral-700" />
                                            <span className="font-bold text-neutral-900 uppercase tracking-wider text-xs">
                                              KYC & Banking Dossier: {displayName}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] text-neutral-500">KYC Status:</span>
                                            <span
                                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                isKycVerified
                                                  ? "bg-emerald-100 text-emerald-800"
                                                  : "bg-amber-100 text-amber-800"
                                              }`}
                                            >
                                              <ShieldCheck className="w-3 h-3" />
                                              {isKycVerified ? "Verified" : "Pending Verification"}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleToggleSellerKyc(sellerId, isKycVerified)}
                                              disabled={actionLoadingId === sellerId}
                                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                                isKycVerified
                                                  ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                                                  : "bg-emerald-600 text-white hover:bg-emerald-700"
                                              }`}
                                            >
                                              {isKycVerified ? "Revoke Verification" : "Mark as Verified"}
                                            </button>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* KYC & Identity Column */}
                                          <div className="space-y-2.5 bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            <div className="flex items-center gap-1.5 font-bold text-neutral-800 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                                              <CreditCard className="w-3.5 h-3.5 text-neutral-500" />
                                              <span>Identity & Tax Details</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">PAN Number:</span>
                                              <span className="col-span-2 font-mono font-bold text-neutral-900">
                                                {s.panNumber || <span className="text-neutral-400 font-normal">Not Provided</span>}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">GSTIN:</span>
                                              <span className="col-span-2 font-mono text-neutral-900">
                                                {s.gstin || <span className="text-neutral-400 font-normal">Not Provided / Unregistered</span>}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">Business Address:</span>
                                              <span className="col-span-2 text-neutral-800 leading-relaxed">
                                                {address}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Payout Bank Details Column */}
                                          <div className="space-y-2.5 bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                            <div className="flex items-center gap-1.5 font-bold text-neutral-800 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                                              <Landmark className="w-3.5 h-3.5 text-neutral-500" />
                                              <span>Settlement & Bank Details</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">Bank Name:</span>
                                              <span className="col-span-2 font-medium text-neutral-900">
                                                {s.bankName || <span className="text-neutral-400 font-normal">Not Provided</span>}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">Account Holder:</span>
                                              <span className="col-span-2 font-medium text-neutral-900">
                                                {s.bankAccountHolderName || <span className="text-neutral-400 font-normal">Not Provided</span>}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">Account Number:</span>
                                              <span className="col-span-2 font-mono font-bold text-neutral-900">
                                                {s.bankAccountNumber || <span className="text-neutral-400 font-normal">Not Provided</span>}
                                              </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-1">
                                              <span className="text-neutral-500">IFSC Code:</span>
                                              <span className="col-span-2 font-mono font-bold text-neutral-900">
                                                {s.bankIFSC || <span className="text-neutral-400 font-normal">Not Provided</span>}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: CUSTOMERS */}
            {section === "customers" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141B2D] p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Customers Management</span>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        {customers.length} Members
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      Auto-VIP tagging active for members with &gt; 10 orders
                    </p>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl gap-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCustTierFilter("")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        !custTierFilter ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
                      }`}
                    >
                      All Members
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustTierFilter("VIP")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                        custTierFilter === "VIP" ? "bg-amber-500 text-slate-950 shadow-xs font-black" : "text-slate-600 dark:text-neutral-400 hover:text-amber-500"
                      }`}
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>VIP Members</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustTierFilter("Normal")}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        custTierFilter === "Normal" ? "bg-white dark:bg-neutral-900 text-slate-900 dark:text-white shadow-xs" : "text-slate-600 dark:text-neutral-400 hover:text-slate-900"
                      }`}
                    >
                      Normal Members
                    </button>
                  </div>
                </div>

                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Search customers by name, email, or phone..."
                      value={custSearch}
                      onChange={(e) => setCustSearch(e.target.value)}
                      className="ap-input ap-input-search !pl-11 h-10 text-xs sm:text-sm"
                    />
                    {custSearch && (
                      <button
                        type="button"
                        onClick={() => setCustSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5 rounded-full hover:bg-neutral-100"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {!isSuperAdmin && (
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>Regular Admin Notice: Customer roster is view-only. Member blocking and loyalty tier adjustments are reserved for Super Administrators.</span>
                  </div>
                )}

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Member</th>
                          <th>Contact</th>
                          <th>Total Orders</th>
                          <th>Total Spend</th>
                          <th>VIP Tier Status</th>
                          <th>Account Status</th>
                          {isSuperAdmin && <th className="text-right">Super Admin Control</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.map((c) => (
                          <tr key={c._id}>
                            <td>
                              <div className="font-bold text-neutral-900 dark:text-white">{c.name}</div>
                              <div className="text-[11px] text-neutral-500 font-mono">{c.email}</div>
                            </td>
                            <td className="text-xs font-mono">{c.phone || c.mobileNumber || "—"}</td>
                            <td className="font-bold text-slate-800 dark:text-neutral-200 text-xs">
                              {c.ordersCount || 0} Orders
                            </td>
                            <td className="font-bold text-xs">₹{c.lifetimeSpend?.toLocaleString("en-IN") || 0}</td>
                            <td>
                              {(() => {
                                const isAutoVip = (c.ordersCount || 0) > 10;
                                const isVip = c.tier === "VIP" || c.tier === "Platinum" || isAutoVip;

                                return (
                                  <div className="flex items-center gap-2">
                                    {isVip ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] rounded-lg">
                                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <span>{isAutoVip ? "VIP (Auto-Tagged)" : "VIP"}</span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 font-semibold text-[11px] rounded-lg border border-slate-200 dark:border-neutral-700">
                                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>Normal</span>
                                      </span>
                                    )}

                                    {isSuperAdmin && (
                                      <select
                                        value={isVip ? "VIP" : "Normal"}
                                        onChange={(e) => handleUpdateTier(c._id, e.target.value)}
                                        className="ap-select py-1 px-2 text-[11px] w-auto font-bold ml-1"
                                        title="Manually override tier"
                                      >
                                        <option value="VIP">VIP</option>
                                        <option value="Normal">Normal</option>
                                      </select>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td>
                              {c.isBlocked ? (
                                <span className="ap-seal ap-seal-blocked">Blocked</span>
                              ) : (
                                <span className="ap-seal ap-seal-active">Active</span>
                              )}
                            </td>
                            {isSuperAdmin && (
                              <td className="text-right">
                                <button
                                  onClick={() => handleToggleUserBlock(c)}
                                  disabled={actionLoadingId === c._id}
                                  className={`ap-btn ap-btn-sm ${
                                    c.isBlocked
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "bg-rose-600 hover:bg-rose-700 text-white"
                                  }`}
                                >
                                  {c.isBlocked ? (
                                    <>
                                      <Unlock className="w-3.5 h-3.5 mr-1" /> Unblock
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="w-3.5 h-3.5 mr-1" /> Block
                                    </>
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
            )}

            {/* SECTION 6: SALES REPORTS (Super Admin Exclusive) */}
            {section === "reports" && isSuperAdmin && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="ap-card p-5 bg-gradient-to-br from-purple-900 to-indigo-950 text-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-purple-300 mb-1">Total Gross Revenue</div>
                    <div className="text-2xl font-bold font-serif text-white">₹{salesReport?.totalRevenue?.toLocaleString("en-IN") || "2,84,500"}</div>
                    <div className="text-[11px] text-purple-300 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> +18.4% this month
                    </div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Total Completed Orders</div>
                    <div className="text-2xl font-bold font-serif text-neutral-900">{salesReport?.totalOrders || orders.length}</div>
                    <div className="text-[11px] text-emerald-600 mt-2">100% verified fulfillment</div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Avg Order Value (AOV)</div>
                    <div className="text-2xl font-bold font-serif text-neutral-900">₹{salesReport?.averageOrderValue?.toLocaleString("en-IN") || "4,750"}</div>
                    <div className="text-[11px] text-neutral-500 mt-2">Luxury tier weighted</div>
                  </div>

                  <div className="ap-card p-5 bg-white">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1">Flash Sales Share</div>
                    <div className="text-2xl font-bold font-serif text-amber-600">42.8%</div>
                    <div className="text-[11px] text-amber-700 mt-2">Driven by Flash Premium Hours</div>
                  </div>
                </div>

                {/* Sales Breakdown by Category */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="ap-card p-5">
                    <h3 className="font-serif font-bold text-base text-neutral-900 mb-4">Department Revenue Distribution</h3>
                    <div className="space-y-3">
                      {[
                        { cat: "Luxury Watches & Jewelry", share: 45, rev: "₹1,28,000" },
                        { cat: "Audio & Gaming Hardware", share: 30, rev: "₹85,400" },
                        { cat: "Atelier Wholesale & Bulk", share: 15, rev: "₹42,600" },
                        { cat: "Beauty & Lifestyle Extr.", share: 10, rev: "₹28,500" },
                      ].map((d) => (
                        <div key={d.cat} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{d.cat}</span>
                            <span className="font-mono text-neutral-500">{d.rev} ({d.share}%)</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="bg-purple-700 h-full rounded-full" style={{ width: `${d.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="ap-card p-5">
                    <h3 className="font-serif font-bold text-base text-neutral-900 mb-4">VIP Loyalty Revenue Split</h3>
                    <div className="space-y-3">
                      {[
                        { tier: "Platinum Tier (Elite)", share: 62, rev: "₹1,76,390", color: "bg-purple-600" },
                        { tier: "Gold Tier (Preferred)", share: 26, rev: "₹73,970", color: "bg-amber-500" },
                        { tier: "Silver Tier (Member)", share: 12, rev: "₹34,140", color: "bg-neutral-400" },
                      ].map((t) => (
                        <div key={t.tier} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{t.tier}</span>
                            <span className="font-mono text-neutral-500">{t.rev} ({t.share}%)</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`${t.color} h-full rounded-full`} style={{ width: `${t.share}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 7: ADMIN MINISTER — SOVEREIGN ADMINISTRATION DIRECTORATE */}
            {section === "adminUsers" && (
              <AdminMinisterSection
                adminUsers={adminUsers}
                isSuperAdmin={isSuperAdmin}
                currentAdminEmail={currentAdmin?.email || ""}
                onRefresh={async () => {
                  try {
                    const adminsList = await adminApi.getAdminUsers();
                    setAdminUsers(Array.isArray(adminsList) ? adminsList : ((adminsList as any)?.admins || []));
                  } catch (e) {
                    console.warn("Could not reload admin users:", e);
                  }
                }}
                onFlashSuccess={(msg) => flashSuccess(msg)}
                openCreateModalDirectly={createAdminModalOpen}
                onCloseCreateModalDirectly={() => setCreateAdminModalOpen(false)}
              />
            )}

<<<<<<< HEAD
            {/* SECTION: COMMISSION MANAGEMENT & PLATFORM WALLET */}
            {section === "commission" && (
=======
<<<<<<< HEAD
            {/* SECTION: COMMISSION MANAGEMENT & PLATFORM WALLET */}
            {section === "commission" && (
=======
            {/* SECTION: PLATFORM COMMISSION & WALLET (Super Admin Exclusive) */}
            {section === "commission" && isSuperAdmin && (
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              <CommissionWallet
                data={commissionData}
                loading={loading}
                onRefresh={loadCommission}
                onUpdateRate={handleUpdateCommissionRate}
                isUpdatingRate={isUpdatingCommissionRate}
<<<<<<< HEAD
                products={products}
                sellers={sellers}
=======
<<<<<<< HEAD
                products={products}
                sellers={sellers}
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
              />
            )}

            {/* SECTION 8: ACTIVITY LOGS */}
            {section === "activity" && (
              <div className="space-y-4">
                <div className="ap-toolbar-row">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="text"
                      placeholder="Search logs by user, email, IP, or details..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="ap-input ap-input-search !pl-11 h-10 text-xs sm:text-sm"
                    />
                    {activitySearch && (
                      <button
                        type="button"
                        onClick={() => setActivitySearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5 rounded-full hover:bg-neutral-100"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <select
                    value={activityFilter}
                    onChange={(e) => setActivityFilter(e.target.value as any)}
                    className="ap-select w-auto min-w-[140px]"
                  >
                    <option value="all">All Events</option>
                    <option value="registration">Registrations</option>
                    <option value="login">Logins</option>
                    <option value="failed_login">Failed Logins</option>
                  </select>
                </div>

                <div className="ap-card">
                  <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Event Type</th>
                          <th>User / Email</th>
                          <th>Status</th>
                          <th>IP Address & Device</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivityLogs.map((log) => (
                          <tr key={log._id}>
                            <td className="text-xs font-mono text-neutral-500 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                log.eventType === 'Registration'
                                  ? 'bg-blue-100 text-blue-800'
                                  : log.eventType === 'Login'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {log.eventType}
                              </span>
                            </td>
                            <td>
                              <div className="font-bold text-neutral-900">{log.userName}</div>
                              <div className="text-[11px] font-mono text-neutral-500">{log.email}</div>
                            </td>
                            <td>
                              <span className={`ap-seal ap-seal-${log.status === 'success' ? 'active' : 'blocked'}`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="text-xs font-mono text-neutral-600">
                              <div>{log.ipAddress}</div>
                              <div className="text-[10px] text-neutral-400 truncate max-w-[180px]">{log.deviceInfo}</div>
                            </td>
                            <td className="text-xs text-neutral-700 max-w-[240px] truncate">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 9: HERO CAROUSEL BANNERS MANAGEMENT */}
            {section === "banners" && (
              <BannerManagement
                banners={banners}
                onBannersChange={setBanners}
                onFlashSuccess={flashSuccess}
                onError={setError}
                isSuperAdmin={isSuperAdmin}
              />
            )}

            {/* SECTION: CATEGORY CAROUSEL MANAGEMENT */}
            {section === "categories" && (
              <AdminCategoryManager
                categories={categoriesList}
                onCategoriesChange={setCategoriesList}
                onFlashSuccess={flashSuccess}
                onError={setError}
              />
            )}

            {/* SECTION 10: FLASH PREMIUM HOURS MANAGEMENT */}
            {section === "flashSale" && (
              <FlashSaleManagement
                products={products}
                onProductsRefresh={() => loadAll(currentAdmin)}
                onFlashSuccess={flashSuccess}
                onError={setError}
                isSuperAdmin={isSuperAdmin}
              />
            )}

            {/* SECTION 11: MULTI-DATABASE & CLOUD SERVICES HUB */}
            {section === "databaseHub" && (
              <DatabaseHubSection />
            )}

            {/* SECTION 12: CUSTOMER CARE & CENTRAL HOTLINE MANAGEMENT SYSTEM */}
            {section === "customerCare" && (
              <CustomerCareModule
                isSuperAdmin={isSuperAdmin}
                onFlashSuccess={flashSuccess}
                onError={setError}
              />
            )}
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995

            {/* SECTION: DARAZ-INSPIRED SETTINGS DASHBOARD */}
            {section === "settingsHub" && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <MarketplaceSettingsDashboard
                  mode="admin"
                  onRefreshParent={() => loadAll()}
                />
              </div>
            )}
<<<<<<< HEAD
=======
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
>>>>>>> 82ae98257bf40180a83b583faa71acfdf64bd995
          </div>
        </main>
      </div>

      {/* RICH PRODUCT MODAL (Super Admin & Admin) */}
      {modalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {/* READ-ONLY PRODUCT VIEW MODAL */}
      {viewingProduct && (
        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
          onEdit={() => {
            const prod = viewingProduct;
            setViewingProduct(null);
            setEditingProduct(prod);
            setModalOpen(true);
          }}
        />
      )}

      {/* PRODUCT DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <DeleteProductModal
          product={productToDelete}
          confirmInput={confirmProductNameInput}
          onChangeInput={setConfirmProductNameInput}
          isDeleting={isDeletingProduct}
          onClose={() => {
            setProductToDelete(null);
            setConfirmProductNameInput("");
          }}
          onConfirm={handleConfirmDeleteProduct}
        />
      )}

      {/* TYPE-TO-CONFIRM ADMIN DELETION MODAL (SUPER ADMIN ONLY) */}
      {adminToDelete && isSuperAdmin && (
        <DeleteAdminModal
          admin={adminToDelete}
          confirmInput={confirmAdminEmailInput}
          onChangeInput={setConfirmAdminEmailInput}
          isDeleting={isDeletingAdmin}
          onClose={() => {
            setAdminToDelete(null);
            setConfirmAdminEmailInput("");
          }}
          onConfirm={handleConfirmDeleteAdmin}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {changePasswordModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setChangePasswordModalOpen(false)}>
          <div className="ap-modal max-w-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white my-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <span>Change Administrator Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setChangePasswordModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Update password for <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{currentAdmin?.email || "Current Admin"}</strong>. The new password will take effect immediately.
            </p>

            {changePasswordError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{changePasswordError}</span>
              </div>
            )}

            <form onSubmit={handleAdminChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="ap-input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  New Password (min 10 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="ap-input pr-10"
                    required
                    minLength={10}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showNewPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="ap-input"
                  required
                  minLength={10}
                />
              </div>

              <div className="ap-modal-actions pt-2">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="ap-btn ap-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="ap-btn ap-btn-primary bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isChangingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* SUPER ADMIN RESET PASSWORD MODAL */}
      {resetPasswordAdmin && isSuperAdmin && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={() => setResetPasswordAdmin(null)}>
          <div className="ap-modal max-w-md bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white my-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <span>Reset Administrator Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setResetPasswordAdmin(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Enter a new secure password for <strong className="text-neutral-800 dark:text-neutral-200 font-mono">{resetPasswordAdmin.email}</strong>.
            </p>

            {resetPasswordError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleSuperAdminResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  New Password (min 10 characters)
                </label>
                <input
                  type="password"
                  placeholder="Enter new password for this admin"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="ap-input"
                  required
                  minLength={10}
                />
              </div>

              <div className="ap-modal-actions pt-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordAdmin(null)}
                  className="ap-btn ap-btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="ap-btn ap-btn-primary bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
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

// -------------------------------------------------------------
// COMPREHENSIVE PRODUCT MODAL COMPONENT (FULL ATTRIBUTES)
// -------------------------------------------------------------
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: (data: Omit<Product, "_id">) => void;
}

function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const [name, setName] = useState(product?.name || "");
  const [brand, setBrand] = useState(product?.brand || "Alike Audio");
  const [category, setCategory] = useState(product?.category || "electronics");
  const [subCategory, setSubCategory] = useState(product?.subCategory || "");
  const [eligibleFor20MinDelivery, setEligibleFor20MinDelivery] = useState<boolean>(
    product?.eligibleFor20MinDelivery ?? (category === 'delivery' || category === 'grocery' || category === 'food_delivery')
  );
  const [price, setPrice] = useState(product?.price !== undefined ? String(product.price) : "3499");
  const [mrp, setMrp] = useState(product?.mrp !== undefined ? String(product.mrp) : "6999");
  const [stock, setStock] = useState(product?.stock !== undefined ? String(product.stock) : "15");
  const [stockStatus, setStockStatus] = useState(product?.stockStatus || "In Stock");
  const [badge, setBadge] = useState(product?.badge || "SALE");
  const [isFlashSale, setIsFlashSale] = useState(product?.isFlashSale ?? (product?.badge === "SALE"));
  const [rating, setRating] = useState(product?.rating !== undefined ? String(product.rating) : "4.8");
  const [reviewsCount, setReviewsCount] = useState(product?.reviewsCount !== undefined ? String(product.reviewsCount) : "148");
  const initialImagesList: string[] = (product?.images && product.images.length > 0)
    ? product.images
    : product?.image
    ? [product.image]
    : ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"];

  const [images, setImages] = useState<string[]>(initialImagesList);
  const [image, setImage] = useState<string>(product?.image || initialImagesList[0]);
  const [urlInput, setUrlInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState(product?.description || "Immersive active noise-cancelling headphones tuned to golden standard.");
  const [isWholesale, setIsWholesale] = useState(product?.isWholesale || false);
  const [wholesalePrice, setWholesalePrice] = useState(product?.wholesalePrice ? String(product.wholesalePrice) : "2999");
  const [wholesaleMinQty, setWholesaleMinQty] = useState(product?.wholesaleMinQty ? String(product.wholesaleMinQty) : "5");

  // Indian Marketplace Statutory Compliance Fields
  const [hsnCode, setHsnCode] = useState(product?.hsnCode || "");
  const [gstRate, setGstRate] = useState<number>(product?.gstRate ?? 18);
  const [countryOfOrigin, setCountryOfOrigin] = useState(product?.countryOfOrigin || "India");
  const [manufacturerDetails, setManufacturerDetails] = useState(product?.manufacturerDetails || "");
  const [packInfo, setPackInfo] = useState(product?.packInfo || "");

  // Calculated live discount percentage
  const numPrice = Number(price) || 0;
  const numMrp = Number(mrp) || numPrice;
  const calculatedDiscount = numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;
  const stockUnits = Math.max(0, Number(stock) || 0);

  // File upload reader
  const handleFileUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setImages(prev => {
            const next = [...prev, result];
            if (!image) setImage(result);
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages(prev => [...prev, trimmed]);
    if (!image) setImage(trimmed);
    setUrlInput("");
  };

  const handleSetPrimary = (index: number) => {
    const selected = images[index];
    if (!selected) return;
    setImage(selected);
    setImages(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return [selected, ...filtered];
    });
  };

  const handleRemoveImage = (index: number) => {
    const removed = images[index];
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (removed === image) {
      setImage(newImages[0] || "");
    }
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      if (toIndex === 0) setImage(moved);
      return updated;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    const finalPrimary = image.trim() || images[0] || "";
    const finalImagesList = images.length > 0 ? images.filter(Boolean) : (finalPrimary ? [finalPrimary] : []);

    onSave({
      id: product?.id || Date.now(),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      subCategory: subCategory.trim() || undefined,
      eligibleFor20MinDelivery: Boolean(eligibleFor20MinDelivery || category === 'delivery' || category === 'grocery' || category === 'food_delivery'),
      price: numPrice,
      mrp: numMrp,
      stock: Number(stock) || 0,
      stockStatus: stockStatus.trim(),
      badge: badge.trim(),
      isFlashSale: Boolean(isFlashSale),
      rating: Number(rating) || 4.8,
      reviewsCount: Number(reviewsCount) || 120,
      image: finalPrimary,
      images: finalImagesList,
      description: description.trim(),
      isWholesale: Boolean(isWholesale),
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      hsnCode: hsnCode.trim(),
      gstRate: Number(gstRate) || 18,
      countryOfOrigin: countryOfOrigin.trim() || "India",
      manufacturerDetails: manufacturerDetails.trim(),
      packInfo: packInfo.trim(),
    });
  };

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[min(92vh,850px)] rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40 shadow-sm">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest font-mono">
                  {product ? "Edit Catalog Product" : "New Catalog Product"}
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {category || "Catalog"}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900 dark:text-white leading-tight mt-0.5">
                {product ? (name || "Edit Catalog Product") : "Create New Product"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-4 text-xs bg-white dark:bg-neutral-900">
            {/* Live Storefront Preview Card (Compact & Interactive) */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800 relative flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt={name || "Preview"}
                    className={`w-full h-full object-cover ${stockUnits === 0 ? "opacity-40 grayscale" : ""}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                ) : (
                  <Package className="w-8 h-8 text-slate-600" />
                )}
                {stockUnits === 0 && (
                  <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black uppercase text-rose-400">
                    Stock Out
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                    {brand || "BRAND ATELIER"}
                  </span>
                  {badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white">
                      {badge}
                    </span>
                  )}
                  {isFlashSale && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-slate-950 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-slate-950" /> Flash Deal
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white truncate font-serif">
                  {name || "Product Title Preview"}
                </h4>
                <div className="flex items-center justify-center sm:justify-start gap-2.5 text-xs font-mono">
                  <span className="text-base font-black text-amber-400">₹{numPrice.toLocaleString("en-IN")}</span>
                  {numMrp > numPrice && (
                    <span className="text-slate-400 line-through">₹{numMrp.toLocaleString("en-IN")}</span>
                  )}
                  {calculatedDiscount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                      {calculatedDiscount}% OFF
                    </span>
                  )}
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className={stockUnits > 0 ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>
                    {stockUnits > 0 ? `${stockUnits} in stock (${stockStatus})` : "Stock Out"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Section Header */}
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-2 mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase font-mono tracking-wider">
                Product Specification & Storefront Details
              </h4>
              <span className="text-[10px] text-neutral-500 font-mono">All fields sync automatically</span>
            </div>

            {/* Row 1: Title & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Product Title *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alike-Pro Soundmaster Gold Edition"
                  className="ap-input font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Brand Name *</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Alike Audio, Alike Gaming, Aurelia Genf"
                  className="ap-input font-medium"
                  required
                />
              </div>
            </div>

            {/* Row 2: Category, Sub-Category & Badge */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    setCategory(newCat);
                    setSubCategory('');
                    if (newCat === 'delivery' || newCat === 'grocery' || newCat === 'food_delivery') {
                      setEligibleFor20MinDelivery(true);
                      setStockStatus("Fast Express");
                    }
                  }}
                  className="ap-select font-medium"
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} {c.eligibleFor20MinDelivery ? '(⚡ Fast Delivery)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Sub-Category</label>
                {CATEGORIES.find(c => c.id === category)?.subCategories ? (
                  <select
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    className="ap-select font-medium"
                  >
                    <option value="">Select Sub-Category ({CATEGORIES.find(c => c.id === category)?.subCategories?.length} options)</option>
                    {CATEGORIES.find(c => c.id === category)?.subCategories?.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g. Biryani, Fresh Fruits, Atta"
                    className="ap-input font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Badge Tag</label>
                <select
                  value={badge}
                  onChange={(e) => {
                    setBadge(e.target.value);
                    if (e.target.value === "SALE") setIsFlashSale(true);
                  }}
                  className="ap-select font-bold"
                >
                  <option value="SALE">SALE (Flash Deal)</option>
                  <option value="HOT">HOT (Bestseller)</option>
                  <option value="NEW">NEW (Fresh Arrival)</option>
                  <option value="TRENDING">TRENDING (Viral)</option>
                  <option value="LIMITED">LIMITED (Exclusive Edition)</option>
                  <option value="">None</option>
                </select>
              </div>
            </div>

            {/* Row 3: Pricing, MRP, and Live Discount Calculation */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3499"
                    className="ap-input font-mono font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">List Price / MRP (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    placeholder="6999"
                    className="ap-input font-mono"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase font-mono mb-1">Calculated Discount</span>
                  <div className="px-3 py-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-black text-sm text-center">
                    {calculatedDiscount}% OFF
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Flash Sale Toggle, Fast Delivery & Stock Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="flashSaleCheck"
                  checked={isFlashSale}
                  onChange={(e) => setIsFlashSale(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                />
                <label htmlFor="flashSaleCheck" className="cursor-pointer font-medium text-amber-900">
                  <span className="font-bold block flex items-center gap-1 text-xs">
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                    Flash Deal
                  </span>
                  <span className="text-[10px] text-amber-800">Shows in flash section</span>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="twentyMinCheck"
                  checked={eligibleFor20MinDelivery}
                  onChange={(e) => setEligibleFor20MinDelivery(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
                <label htmlFor="twentyMinCheck" className="cursor-pointer font-medium text-rose-900">
                  <span className="font-bold block flex items-center gap-1 text-xs text-rose-950">
                    ⚡ Fast Delivery
                  </span>
                  <span className="text-[10px] text-rose-800">Express dispatch eligible</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Stock Status Badge</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="ap-select font-medium"
                >
                  <option value="In Stock">In Stock (Normal Supply)</option>
                  <option value="Only 2 left!">Only 2 left! (Low Stock Warning)</option>
                  <option value="Fast Express">Fast Express (Fast Delivery)</option>
                  {stockStatus === '20-Min Express' && <option value="20-Min Express">Fast Express (Legacy)</option>}
                  <option value="Out of Stock">Out of Stock (Sold Out)</option>
                  <option value="Pre-Order">Pre-Order (Upcoming)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Stock count, Rating & Reviews */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">INVENTORY STOCK UNITS</label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Enter stock count"
                  className="ap-input font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Star Rating (0 - 5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="4.8"
                  className="ap-input font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Reviews Count</label>
                <input
                  type="number"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  placeholder="148"
                  className="ap-input font-mono"
                />
              </div>
            </div>

            {/* Row 6: Multi-Image Upload & Management */}
            <div className="space-y-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-bold text-neutral-800 uppercase font-mono text-[11px]">
                    Product Photos ({images.length}) <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[10px] text-neutral-500">
                    Upload photos or paste URLs. The photo marked as &quot;Primary&quot; will be used across storefront listings.
                  </p>
                </div>
                {images.length > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold">
                    Primary: {image ? "Selected" : "Auto (1st)"}
                  </span>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isDragging
                    ? "border-pink-500 bg-pink-50/50 scale-[0.99]"
                    : "border-neutral-300 bg-white hover:border-pink-500 hover:bg-neutral-50/60"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files);
                      e.target.value = "";
                    }
                  }}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-neutral-800 block">
                    Click to browse or drag &amp; drop photos here
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Supports JPG, PNG, WEBP, GIF (multi-select enabled)
                  </span>
                </div>
              </div>

              {/* Direct URL Input */}
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="Or paste an image URL (https://...) and press Add"
                  className="ap-input font-mono flex-1 text-xs py-1.5"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-900 disabled:opacity-40 text-white font-mono font-bold text-xs cursor-pointer transition-colors shrink-0"
                >
                  + Add URL
                </button>
              </div>

              {/* Thumbnail Strip with Primary & Remove & Reorder Actions */}
              {images.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {images.map((src, idx) => {
                      const isPrimary = src === image || (idx === 0 && !images.includes(image));
                      return (
                        <div
                          key={`admin-img-${idx}`}
                          className={`relative rounded-xl overflow-hidden border-2 bg-neutral-100 group transition-all ${
                            isPrimary
                              ? "border-pink-500 shadow-md ring-2 ring-pink-500/20"
                              : "border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          <div className="aspect-square w-full overflow-hidden bg-neutral-900 flex items-center justify-center">
                            <img
                              src={src}
                              alt={`Product image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Primary Badge */}
                          {isPrimary && (
                            <div className="absolute top-1.5 left-1.5 bg-pink-600 text-white text-[9px] font-black font-mono px-1.5 py-0.5 rounded shadow-md flex items-center gap-1 z-10">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>PRIMARY</span>
                            </div>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5 z-20">
                            <div className="flex justify-between items-center">
                              {/* Reorder Left */}
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveImage(idx, idx - 1);
                                }}
                                className="p-1 rounded bg-black/70 hover:bg-black text-white disabled:opacity-30 cursor-pointer"
                                title="Move left"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(idx);
                                }}
                                className="p-1 rounded bg-rose-600/90 hover:bg-rose-700 text-white cursor-pointer"
                                title="Remove photo"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="flex justify-between items-center gap-1">
                              {!isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimary(idx);
                                  }}
                                  className="w-full py-0.5 px-1.5 rounded bg-pink-600 hover:bg-pink-700 text-white font-mono text-[9px] font-bold cursor-pointer text-center"
                                >
                                  Make Primary
                                </button>
                              )}
                              {/* Reorder Right */}
                              <button
                                type="button"
                                disabled={idx === images.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveImage(idx, idx + 1);
                                }}
                                className="p-1 rounded bg-black/70 hover:bg-black text-white disabled:opacity-30 cursor-pointer ml-auto"
                                title="Move right"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 font-mono bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚠️ At least one product image is recommended for storefront display.
                </p>
              )}
            </div>

            {/* Row 7: Description */}
            <div>
              <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">Product Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High quality description of the product..."
                className="ap-input text-xs"
              />
            </div>

            {/* Indian Statutory Listing Compliance (Consumer Protection E-Commerce Rules, 2020) */}
            <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50/50 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800 flex items-center gap-1.5 font-mono">
                  <span>🏛️</span> Indian Statutory Marketplace Compliance
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Rule 6, E-Commerce 2020</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* GST Slab */}
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">
                    GST Tax Slab <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(Number(e.target.value))}
                    className="ap-select font-medium"
                  >
                    <option value={0}>0% (Nil / Exempted)</option>
                    <option value={5}>5% (Essential Goods)</option>
                    <option value={12}>12% (Standard S-1)</option>
                    <option value={18}>18% (Standard Default)</option>
                    <option value={28}>28% (Luxury / Sin Goods)</option>
                  </select>
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6203, 8518, 2106"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    className="ap-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Country of Origin */}
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">
                    Country of Origin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India"
                    value={countryOfOrigin}
                    onChange={(e) => setCountryOfOrigin(e.target.value)}
                    className="ap-input font-medium"
                  />
                </div>

                {/* Pack / Net Quantity Info */}
                <div>
                  <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">
                    Pack / Net Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pack of 1, 500g, 100ml"
                    value={packInfo}
                    onChange={(e) => setPackInfo(e.target.value)}
                    className="ap-input font-medium"
                  />
                </div>
              </div>

              {/* Manufacturer / Importer Details */}
              <div>
                <label className="block font-bold text-neutral-700 uppercase font-mono mb-1">
                  Manufacturer / Importer Name & Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alike Ateliers Ltd, Plot 42, Kumarghat Industrial Area, Unakoti, Tripura - 799264"
                  value={manufacturerDetails}
                  onChange={(e) => setManufacturerDetails(e.target.value)}
                  className="ap-input text-xs"
                />
              </div>
            </div>

            {/* Row 8: Wholesale Toggle */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wholesaleCheck"
                  checked={isWholesale}
                  onChange={(e) => setIsWholesale(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                />
                <label htmlFor="wholesaleCheck" className="cursor-pointer font-bold text-purple-900">
                  Enable Wholesale Bulk Pricing Tier
                </label>
              </div>
              {isWholesale && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase font-mono mb-0.5">Wholesale Unit Price (₹)</label>
                    <input
                      type="number"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      className="ap-input font-mono py-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-purple-800 uppercase font-mono mb-0.5">Min Order Qty (MOQ)</label>
                    <input
                      type="number"
                      value={wholesaleMinQty}
                      onChange={(e) => setWholesaleMinQty(e.target.value)}
                      className="ap-input font-mono py-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer Action Bar */}
          <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              ← Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 shadow-md shadow-rose-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{product ? "Save & Publish Changes" : "Create Product"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------
// READ-ONLY PRODUCT VIEW MODAL
// -------------------------------------------------------------
interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
  onEdit: () => void;
}

function ProductViewModal({ product, onClose, onEdit }: ProductViewModalProps) {
  const [selectedImg, setSelectedImg] = useState(product.image || (product.images && product.images[0]) || "");
  const [copiedSku, setCopiedSku] = useState(false);
  const allImages = [product.image, ...(product.images || [])].filter((img, idx, arr) => img && arr.indexOf(img) === idx);
  
  const discount = product.mrp && product.price && product.mrp > product.price 
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100) 
    : 0;

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[min(90vh,760px)] rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200/90 dark:border-neutral-800 flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        style={{ maxWidth: "880px", width: "94vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-sm">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-mono">
                  Product Overview
                </span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {product.category || "Catalog"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const sku = String(product?._id || product?.id || "ITEM").slice(-8).toUpperCase();
                    navigator.clipboard?.writeText(sku);
                    setCopiedSku(true);
                    setTimeout(() => setCopiedSku(false), 2000);
                  }}
                  className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-0.5 rounded border border-neutral-200/60 dark:border-neutral-700/60 transition-colors"
                  title="Click to copy SKU"
                >
                  <span>SKU: {String(product?._id || product?.id || "ITEM").slice(-8).toUpperCase()}</span>
                  {copiedSku ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                </button>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-neutral-900 dark:text-white leading-tight mt-1">
                {product.name || "Untitled Product"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Edit product details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit Product</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer active:scale-95"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Left: Product Images */}
            <div className="md:col-span-5 space-y-3.5">
              <div className="aspect-square w-full rounded-2xl overflow-hidden bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/90 dark:border-neutral-700/80 shadow-sm flex items-center justify-center relative p-3 group">
                <img
                  src={selectedImg || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600"}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold font-mono text-xs shadow-md">
                    {discount}% OFF
                  </span>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImg === img
                          ? 'border-amber-500 scale-95 shadow-md ring-2 ring-amber-500/20'
                          : 'border-neutral-200 dark:border-neutral-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}

              {/* Status and Visibility Pills */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400 font-medium">Catalog Visibility:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live in Store
                </span>
              </div>
            </div>

            {/* Right: Specifications & Pricing */}
            <div className="md:col-span-7 space-y-4 text-xs">
              {/* Price & Discount Card */}
              <div className="p-4 sm:p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-200/90 dark:border-neutral-700/80 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white font-mono tracking-tight">
                    ₹{(product.price ?? 0).toLocaleString("en-IN")}
                  </span>
                  {product.mrp && product.price && product.mrp > product.price && (
                    <span className="text-sm sm:text-base text-neutral-400 dark:text-neutral-500 line-through font-mono">
                      ₹{(product.mrp ?? 0).toLocaleString("en-IN")}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold font-mono text-xs">
                      {discount}% OFF
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  Standard GST rate (18%) and luxury packaging included in listed price.
                </p>
              </div>

              {/* Badges & Inventory Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-mono block">Inventory Stock</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-extrabold text-neutral-900 dark:text-white">{product.stock || 0} Units</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                      {(product.stockStatus === '20-Min Express' || product.stockStatus === '20 Min Express') ? 'Fast Express' : (product.stockStatus || "In Stock")}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-mono block">Customer Rating</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-extrabold text-neutral-900 dark:text-white text-sm">{product.rating?.toFixed(1) || "4.8"}</span>
                    </div>
                    <span className="text-neutral-400 dark:text-neutral-500 font-medium">({product.reviewsCount || 0} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Flash Sale & Brand Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-white dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-mono block">Brand Atelier</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">{product.brand || "Alike Luxury"}</span>
                </div>

                <div className="p-3.5 bg-white dark:bg-neutral-800/80 border border-neutral-200/90 dark:border-neutral-700 rounded-xl space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-mono block">Flash Sale Program</span>
                  <div className="flex items-center gap-1.5">
                    {product.isFlashSale || product.badge === "SALE" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-600 dark:text-orange-400" /> Flash Premium Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">Standard Listing</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 font-mono block">Description</span>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 text-xs sm:text-sm">
                  {product.description || "Authentic high-grade signature luxury piece from the Alike-ND boutique catalog."}
                </p>
              </div>

              {/* Indian Statutory Marketplace Compliance Overview */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-800/40 pb-1.5">
                  <span className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase font-mono flex items-center gap-1.5">
                    <span>🏛️</span> Indian Statutory Listing Compliance
                  </span>
                  <span className="text-[9px] font-mono text-amber-700/80 dark:text-amber-400/80">Rule 6, E-Commerce 2020</span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">GST Rate:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{product.gstRate !== undefined ? `${product.gstRate}% GST (Included)` : '18% GST (Default)'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">HSN / SAC Code:</span>
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">{product.hsnCode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">Country of Origin:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{product.countryOfOrigin || 'India'}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">Pack / Net Qty:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">{product.packInfo || '1 Unit'}</span>
                  </div>
                </div>
                {product.manufacturerDetails && (
                  <div className="pt-1.5 border-t border-amber-200/40 dark:border-amber-800/30 text-[10px]">
                    <span className="text-neutral-400 dark:text-neutral-500 block">Manufacturer / Importer:</span>
                    <span className="text-neutral-800 dark:text-neutral-200 font-medium">{product.manufacturerDetails}</span>
                  </div>
                )}
              </div>

              {/* Wholesale Details if available */}
              {product.isWholesale && (
                <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-purple-900 dark:text-purple-300 uppercase font-mono block">Wholesale Bulk Terms</span>
                  <div className="flex justify-between items-center text-purple-950 dark:text-purple-200 font-medium text-xs">
                    <span>Unit Rate: <strong>₹{product.wholesalePrice?.toLocaleString("en-IN") || 0}</strong></span>
                    <span>Minimum Order: <strong>{product.wholesaleMinQty || 1} Units</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Footer Action Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-20">
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
            <span>Product ID:</span>
            <span className="text-neutral-700 dark:text-neutral-300 font-bold">{String(product._id || product.id)}</span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              Close Details
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit This Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------
// DELETE PRODUCT CONFIRMATION MODAL (WITH TYPE-TO-CONFIRM)
// -------------------------------------------------------------
interface DeleteProductModalProps {
  product: { id: string; name: string };
  confirmInput: string;
  onChangeInput: (val: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteProductModal({
  product,
  confirmInput,
  onChangeInput,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  const isMatch = 
    confirmInput.trim().toLowerCase() === (product?.name || "").trim().toLowerCase() ||
    confirmInput.trim().toUpperCase() === "DELETE" ||
    confirmInput.trim() === String(product?.id || "");

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="ap-modal max-w-md my-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-rose-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-900">Delete Product from Catalog</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs">
          <p className="text-neutral-700 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-neutral-900 font-semibold">{product.name}</strong> from the database?
          </p>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Warning: Permanent Action</span>
            </p>
            <p>
              This action permanently removes this item from <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">alikendshop.products</code> and customer catalogs.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
              <span>
                Type <span className="font-mono bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200">{product.name}</span> or <span className="font-mono bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">DELETE</span>:
              </span>
              <button
                type="button"
                onClick={() => onChangeInput(product.name)}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => onChangeInput(e.target.value)}
              placeholder="Type product name or DELETE to confirm..."
              className="ap-input font-mono text-xs w-full"
              autoFocus
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting || !isMatch}
            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-sm ${
              isMatch && !isDeleting
                ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-rose-600/30 hover:scale-[1.02] active:scale-95"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed border border-neutral-300/50"
            }`}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" /> Permanently Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// -------------------------------------------------------------
// TYPE-TO-CONFIRM ADMIN DELETION MODAL
// -------------------------------------------------------------
interface DeleteAdminModalProps {
  admin: AdminAccount;
  confirmInput: string;
  onChangeInput: (val: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteAdminModal({
  admin,
  confirmInput,
  onChangeInput,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteAdminModalProps) {
  const isMatch = confirmInput.trim().toLowerCase() === admin.email.trim().toLowerCase();
  const isProtected = admin.email.toLowerCase() === "developer.alikend@gmail.com" || admin.email.toLowerCase() === "noyondey176@gmail.com";

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="ap-modal max-w-md my-auto animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-900">Revoke Administrator Privileges</h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs">
          {isProtected ? (
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Protected Super Administrator</span>
              </p>
              <p className="text-[11px] leading-relaxed">
                The root Super Administrator account (<code>noyondey176@gmail.com</code>) is protected by core security protocols and cannot be deleted or revoked.
              </p>
            </div>
          ) : (
            <>
              <p className="text-neutral-700">
                You are about to revoke all administrative permissions for:
              </p>

              <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">{admin.name}</p>
                  <p className="font-mono text-[11px] text-neutral-600">{admin.email}</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase rounded bg-neutral-200 text-neutral-700">
                  {admin.role}
                </span>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-900 space-y-1">
                <p className="font-bold">Type to Confirm Deletion:</p>
                <p>
                  To prevent accidental removal, please type the administrator's exact email address <strong className="font-mono">{admin.email}</strong> below:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={admin.email}
                  value={confirmInput}
                  onChange={(e) => onChangeInput(e.target.value)}
                  className="ap-input font-mono text-xs w-full border-rose-300 focus:border-rose-600 focus:ring-rose-200"
                  autoFocus
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="ap-btn ap-btn-ghost text-xs"
          >
            Cancel
          </button>
          {!isProtected && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={!isMatch || isDeleting}
              className={`ap-btn text-xs gap-1.5 transition-all ${
                isMatch
                  ? "bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Revoking...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" /> Delete Administrator Account
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
