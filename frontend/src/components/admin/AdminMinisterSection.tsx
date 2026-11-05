import React, { useState, useMemo } from "react";
import {
  Crown,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Briefcase,
  Package,
  Tag,
  Store,
  DollarSign,
  Headphones,
  Key,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Building
} from "lucide-react";
import { AdminAccount, AdminMinisterRole } from "../../pages/adminTypes";
import { adminApi } from "../../pages/adminApi";

export interface RoleDefinition {
  id: AdminMinisterRole;
  nameBn: string;
  nameEn: string;
  badgeLabel: string;
  shortTag: string;
  badgeClass: string;
  borderClass: string;
  iconBgClass: string;
  icon: React.ComponentType<{ className?: string }>;
  descriptionBn: string;
  descriptionEn: string;
  scopeSummaryBn: string;
  scopeSummaryEn: string;
  keyPermissions: string[];
}

export const ADMIN_MINISTER_ROLES: RoleDefinition[] = [
  {
    id: "superadmin",
    nameBn: "হেড এডমিন (সর্বোচ্চ নিয়ন্ত্রণ)",
    nameEn: "Head Admin (Supreme Super Admin)",
    badgeLabel: "👑 হেড এডমিন",
    shortTag: "HEAD ADMIN",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
    borderClass: "border-purple-500",
    iconBgClass: "bg-purple-600 text-white",
    icon: Crown,
    descriptionBn: "ওয়েবসাইটের সর্বোচ্চ ক্ষমতা ও রুট নিয়ন্ত্রণ। সকল ডাটাবেজ, এডমিন পরিচালনা, সিস্টেম কনফিগ ও আর্থিক ক্ষমতা সম্পন্ন।",
    descriptionEn: "Unrestricted root authority across databases, admin accounts provisioning, financial ledgers, and system settings.",
    scopeSummaryBn: "রুট এক্সেস + নতুন এডমিন তৈরি + ডাটাবেজ হাব + কমিশন ও আর্থিক নিয়ন্ত্রণ",
    scopeSummaryEn: "Root Access + Admin Provisioning + Database Hub + Platform Financials",
    keyPermissions: ["Full Database & System Control", "Add / Revoke Any Admin", "Commission & Ledger Wallet", "Customer Blocking & Deletion"],
  },
  {
    id: "main_admin",
    nameBn: "মেইন এডমিন (প্রধান অপারেশন)",
    nameEn: "Main Admin (Chief Operations Director)",
    badgeLabel: "🏛️ মেইন এডমিন",
    shortTag: "MAIN ADMIN",
    badgeClass: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
    borderClass: "border-emerald-500",
    iconBgClass: "bg-emerald-600 text-white",
    icon: ShieldCheck,
    descriptionBn: "সাইটের প্রধান অপারেশনাল দায়িত্বপ্রাপ্ত। পণ্য, অর্ডার, সেলার, কাস্টমার ও প্রমোশনের সামগ্রিক তদারকি।",
    descriptionEn: "Chief operating director managing products catalog, orders dispatch, seller KYC review, and operational growth.",
    scopeSummaryBn: "ক্যাটালগ + অর্ডার ডেলিভারি + সেলার ভেরিফিকেশন + কাস্টমার ম্যানেজমেন্ট",
    scopeSummaryEn: "Catalog + Orders Dispatch + Seller Approvals + Customer Operations",
    keyPermissions: ["Catalog & Products CRUD", "Order Processing & Shipping", "Seller KYC Review", "Customer Support & Tiers"],
  },
  {
    id: "sub_admin",
    nameBn: "সাব এডমিন (সহকারী এডমিন)",
    nameEn: "Sub Admin (Operations Assistant)",
    badgeLabel: "⚡ সাব এডমিন",
    shortTag: "SUB ADMIN",
    badgeClass: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800",
    borderClass: "border-sky-500",
    iconBgClass: "bg-sky-600 text-white",
    icon: Briefcase,
    descriptionBn: "দৈনন্দিন কাজের সহকারী এডমিন। অর্ডার স্ট্যাটাস আপডেট, প্রাথমিক পণ্য যাচাই ও দৈনন্দিন অপারেশন তদারকি।",
    descriptionEn: "Operational assistant responsible for daily order fulfillment, product queue validation, and status updates.",
    scopeSummaryBn: "অর্ডার ডেলিভারি আপডেট + পণ্য স্টক চেক + দৈনন্দিন মনিটরিং",
    scopeSummaryEn: "Daily Orders Tracking + Product Stock Checks + Activity Monitoring",
    keyPermissions: ["Update Order Status", "Verify Stock Units", "Monitor Activity Logs", "Customer Order Inquiry View"],
  },
  {
    id: "user_admin",
    nameBn: "ইউজার এডমিন (কাস্টমার ও একাউন্ট)",
    nameEn: "User Admin (Customer & Account Directorate)",
    badgeLabel: "👥 ইউজার এডমিন",
    shortTag: "USER ADMIN",
    badgeClass: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-900/40 dark:text-violet-300 dark:border-violet-800",
    borderClass: "border-violet-500",
    iconBgClass: "bg-violet-600 text-white",
    icon: Users,
    descriptionBn: "গ্রাহকদের একাউন্ট, কেওয়াইসি, লয়্যালটি টায়ার, সিকিউরিটি এবং ব্যবহারকারী সুরক্ষা নিশ্চিতকারী এডমিন।",
    descriptionEn: "Dedicated customer affairs administrator managing user security, loyalty tiers, KYC profiles, and dispute resolutions.",
    scopeSummaryBn: "কাস্টমার প্রোফাইল + ভিআইপি টায়ার + গ্রাহক সুরক্ষা ও অভিযোগ সমাধান",
    scopeSummaryEn: "Customer Directory + VIP Tier Tags + Account Verification & Support",
    keyPermissions: ["Customer Directory & Profiles", "VIP / Loyalty Tier Assignment", "Account Verification", "Customer Inquiries Resolution"],
  },
  {
    id: "order_admin",
    nameBn: "অর্ডার ও লজিস্টিকস এডমিন",
    nameEn: "Order & Logistics Admin",
    badgeLabel: "📦 অর্ডার এডমিন",
    shortTag: "ORDER ADMIN",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
    borderClass: "border-blue-500",
    iconBgClass: "bg-blue-600 text-white",
    icon: Package,
    descriptionBn: "অর্ডার শিডিউলিং, এক্সপ্রেস ডেলিভারি, শিপিং চালান, রিটার্ন ও ডেলিভারি পার্টনার সমন্বয়কারী এডমিন।",
    descriptionEn: "Logistics specialist overseeing customer shipments, express delivery dispatch, tracking numbers, and returns.",
    scopeSummaryBn: "অর্ডার প্রসেসিং + চালান জেনারেটর + এক্সপ্রেস ডেলিভারি ট্র্যাকিং",
    scopeSummaryEn: "Order Dispatch + Invoices & Slips + Express Delivery Logistics",
    keyPermissions: ["Orders Full Lifecycle", "Shipping Slip Downloads", "Delivery Status Transitions", "Return / Cancellation Processing"],
  },
  {
    id: "catalog_admin",
    nameBn: "প্রোডাক্ট ও ক্যাটালগ এডমিন",
    nameEn: "Product & Catalog Admin",
    badgeLabel: "🏷️ প্রোডাক্ট এডমিন",
    shortTag: "CATALOG ADMIN",
    badgeClass: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-800",
    borderClass: "border-teal-500",
    iconBgClass: "bg-teal-600 text-white",
    icon: Tag,
    descriptionBn: "নতুন পণ্য সংযোজন, মূল্য ও ডিসকাউন্ট নির্ধারণ, ফ্ল্যাশ সেল ও ক্যাটাগরি ক্যারোজেল সাজানোর দায়িত্বপ্রাপ্ত।",
    descriptionEn: "Merchandise catalog manager handling product additions, flash sale listings, category hierarchies, and stocks.",
    scopeSummaryBn: "পণ্য আপলোড + ক্যাটাগরি ম্যানেজমেন্ট + ফ্ল্যাশ সেল শিডিউল",
    scopeSummaryEn: "Product Catalog CRUD + Categories Tree + Flash Sale Deals",
    keyPermissions: ["Add / Edit / Remove Products", "Stock Units Adjustment", "Flash Sale Hours Setting", "Category Tree Management"],
  },
  {
    id: "seller_admin",
    nameBn: "সেলার ও ভেন্ডর এডমিন",
    nameEn: "Seller & Merchant Admin",
    badgeLabel: "🏪 সেলার এডমিন",
    shortTag: "SELLER ADMIN",
    badgeClass: "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800",
    borderClass: "border-indigo-500",
    iconBgClass: "bg-indigo-600 text-white",
    icon: Store,
    descriptionBn: "মার্কেটপ্লেস সেলার আবেদন যাচাই, শপ অনুমোদন, ব্যাংক ও প্যান কেওয়াইসি অডিট এবং মার্চেন্ট তদারকি।",
    descriptionEn: "Merchant director handling vendor onboarding, bank details & PAN KYC audits, storefront approvals, and suspensions.",
    scopeSummaryBn: "সেলার অনুমোদন + কেওয়াইসি ভেরিফিকেশন + স্টোরফ্রন্ট তদারকি",
    scopeSummaryEn: "Seller Onboarding + Bank/PAN Audits + Shop Status & Sanctions",
    keyPermissions: ["Approve / Reject Sellers", "Verify Seller Bank & PAN", "Storefront Listings Audit", "Vendor Compliance Support"],
  },
  {
    id: "finance_admin",
    nameBn: "ফাইন্যান্স ও কমিশন এডমিন",
    nameEn: "Finance & Commission Admin",
    badgeLabel: "💰 ফাইন্যান্স এডমিন",
    shortTag: "FINANCE ADMIN",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
    borderClass: "border-amber-500",
    iconBgClass: "bg-amber-600 text-white",
    icon: DollarSign,
    descriptionBn: "প্লাটফর্ম কমিশন রেট, রাজস্ব বিশ্লেষণ, সেলার পেআউট ট্র্যাকিং এবং আর্থিক রিপোর্ট বিশ্লেষক।",
    descriptionEn: "Treasury specialist tracking platform commission wallets, revenue projections, payout disbursements, and financial ledgers.",
    scopeSummaryBn: "কমিশন ওয়ালেট + রাজস্ব অ্যানালিটিক্স + এক্সেল রিপোর্ট এক্সপোর্ট",
    scopeSummaryEn: "Commission Wallet + Revenue Analytics + Multi-Sheet Financial Export",
    keyPermissions: ["Commission Rate & Wallet", "Revenue Reports Generation", "Excel Multi-Sheet Exports", "Seller Payout Auditing"],
  },
  {
    id: "support_admin",
    nameBn: "সাপোর্ট ও কমিউনিকেশন এডমিন",
    nameEn: "Support & Helpdesk Admin",
    badgeLabel: "🎧 সাপোর্ট এডমিন",
    shortTag: "SUPPORT ADMIN",
    badgeClass: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800",
    borderClass: "border-rose-500",
    iconBgClass: "bg-rose-600 text-white",
    icon: Headphones,
    descriptionBn: "গ্রাহক মেসেঞ্জার, ইনকোয়ারি সমাধান, ব্যানার নোটিফিকেশন ও যোগাযোগ পরিচালনাকারী এডমিন।",
    descriptionEn: "Customer communications lead managing live messenger dialogues, announcements, hero promo banners, and tickets.",
    scopeSummaryBn: "লাইভ মেসেঞ্জার + হিরো ব্যানার প্রচার + গ্রাহক ইনকোয়ারি সমাধান",
    scopeSummaryEn: "Live Messenger Support + Promo Banners + Customer Service Tickets",
    keyPermissions: ["Live Messenger Interaction", "Hero Banner Announcements", "Customer Inquiries Resolution", "Storefront Broadcast Messages"],
  },
];

export function getRoleDefinition(role: string): RoleDefinition {
  const matched = ADMIN_MINISTER_ROLES.find((r) => r.id === role);
  if (matched) return matched;
  return {
    id: role,
    nameBn: "জেনারেল এডমিন (অপারেশন)",
    nameEn: "General Operations Admin",
    badgeLabel: "💼 জেনারেল এডমিন",
    shortTag: "OPERATIONS",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    borderClass: "border-slate-500",
    iconBgClass: "bg-slate-600 text-white",
    icon: UserCheck,
    descriptionBn: "সাধারণ প্রশাসনিক দায়িত্বপ্রাপ্ত কর্মী। পণ্য ও অর্ডার তালিকা তদারকিকারী।",
    descriptionEn: "General administrator handling day-to-day catalog and order operations.",
    scopeSummaryBn: "পণ্য ও অর্ডার তালিকা তদারকি",
    scopeSummaryEn: "Products & Orders Operations",
    keyPermissions: ["Catalog Operations", "Orders Processing"],
  };
}

interface AdminMinisterSectionProps {
  adminUsers: AdminAccount[];
  isSuperAdmin: boolean;
  currentAdminEmail?: string;
  onRefresh: () => Promise<void> | void;
  onFlashSuccess: (msg: string) => void;
  openCreateModalDirectly?: boolean;
  onCloseCreateModalDirectly?: () => void;
}

export default function AdminMinisterSection({
  adminUsers,
  isSuperAdmin,
  currentAdminEmail = "",
  onRefresh,
  onFlashSuccess,
  openCreateModalDirectly = false,
  onCloseCreateModalDirectly,
}: AdminMinisterSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form State for Adding New Admin
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminMinisterRole>("sub_admin");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  // Password Reset Modal
  const [resetTargetAdmin, setResetTargetAdmin] = useState<AdminAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Delete / Revoke Confirmation Modal
  const [deleteTargetAdmin, setDeleteTargetAdmin] = useState<AdminAccount | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync with prop if opened externally
  React.useEffect(() => {
    if (openCreateModalDirectly) {
      setIsCreateModalOpen(true);
    }
  }, [openCreateModalDirectly]);

  // Protected root accounts check
  const isProtectedRoot = (adminEmail: string = "") => {
    const e = adminEmail.toLowerCase().trim();
    return (
      e === "noyondey176@gmail.com" ||
      e === "developer.alikend@gmail.com" ||
      e === "admin@system" ||
      e === currentAdminEmail.toLowerCase().trim()
    );
  };

  // Helper: Generate Secure Password
  const generateSecurePassword = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let generated = "";
    for (let i = 0; i < 14; i++) {
      generated += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(generated);
    setShowPassword(true);
    setFormError("");
  };

  // Filtered List
  const filteredAdmins = useMemo(() => {
    return (adminUsers || []).filter((admin) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (admin.name && admin.name.toLowerCase().includes(q)) ||
        (admin.email && admin.email.toLowerCase().includes(q)) ||
        (admin.department && admin.department.toLowerCase().includes(q)) ||
        (admin.phone && admin.phone.toLowerCase().includes(q)) ||
        (admin.role && admin.role.toLowerCase().includes(q));

      const matchesRole =
        selectedRoleFilter === "all" || admin.role === selectedRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [adminUsers, searchTerm, selectedRoleFilter]);

  // Handle Create Admin
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanName || !cleanPass) {
      setFormError("এডমিন নাম, অফিসিয়াল ইমেইল এবং পাসওয়ার্ড আবশ্যক।");
      return;
    }

    if (cleanPass.length < 10) {
      setFormError("পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে (নিরাপত্তার স্বার্থে)।");
      return;
    }

    setCreating(true);
    try {
      await adminApi.createAdminUser({
        name: cleanName,
        email: cleanEmail,
        password: cleanPass,
        role: selectedRole,
        phone: phone.trim(),
        department: department.trim(),
      });

      onFlashSuccess(`✨ নতুন ${getRoleDefinition(selectedRole).nameBn} একাউন্ট সফলভাবে সক্রিয় করা হয়েছে: ${cleanEmail}`);
      setIsCreateModalOpen(false);
      if (onCloseCreateModalDirectly) onCloseCreateModalDirectly();

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setSelectedRole("sub_admin");
      setDepartment("");
      setPhone("");
      setShowPassword(false);

      if (onRefresh) await onRefresh();
    } catch (err: any) {
      setFormError(err.message || "নতুন এডমিন একাউন্ট তৈরিতে ব্যর্থ হয়েছে।");
    } finally {
      setCreating(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetAdmin) return;
    setResetError("");

    if (newPasswordInput.trim().length < 10) {
      setResetError("নতুন পাসওয়ার্ড কমপক্ষে ১০ অক্ষরের হতে হবে।");
      return;
    }

    setResetLoading(true);
    try {
      await adminApi.resetAdminPassword(resetTargetAdmin._id, newPasswordInput.trim());
      onFlashSuccess(`এডমিন ${resetTargetAdmin.email} এর পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে।`);
      setResetTargetAdmin(null);
      setNewPasswordInput("");
    } catch (err: any) {
      setResetError(err.message || "পাসওয়ার্ড রিসেট করা সম্ভব হয়নি।");
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Delete / Revoke Submit
  const handleDeleteAdmin = async () => {
    if (!deleteTargetAdmin) return;
    if (deleteConfirmInput !== deleteTargetAdmin.email) {
      alert("সঠিক ইমেইল এড্রেস নিশ্চিতকরণ বক্সে টাইপ করুন।");
      return;
    }

    setDeleteLoading(true);
    try {
      await adminApi.deleteAdminUser(deleteTargetAdmin._id);
      onFlashSuccess(`এডমিন একাউন্ট ${deleteTargetAdmin.email} এর এক্সেস সফলভাবে বাতিল করা হয়েছে।`);
      setDeleteTargetAdmin(null);
      setDeleteConfirmInput("");
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      alert(err.message || "এডমিন বাতিলকরণ ব্যর্থ হয়েছে।");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Counts summary
  const totalCount = adminUsers.length;
  const headCount = adminUsers.filter((a) => a.role === "superadmin").length;
  const mainCount = adminUsers.filter((a) => a.role === "main_admin").length;
  const subCount = adminUsers.filter((a) => a.role === "sub_admin").length;
  const userCount = adminUsers.filter((a) => a.role === "user_admin").length;
  const specializedCount = adminUsers.filter(
    (a) => !["superadmin", "main_admin", "sub_admin", "user_admin", "admin"].includes(a.role)
  ).length;

  return (
    <div className="space-y-6">
      {/* SECTION BANNER / TOP HEADER */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-7 border border-neutral-200/90 dark:border-neutral-800 shadow-sm relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-500/5 via-amber-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30">
                <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                এডমিন মিনিস্টার (Admin Minister)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Ministry Directory
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 dark:text-white tracking-tight">
              এডমিন মিনিস্টার — Sovereign Administration Directorate
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
              সাইটের সকল প্রশাসনিক দায়িত্ব ও দায়িত্বপ্রাপ্ত কর্মকর্তাদের পূর্ণাঙ্গ মন্ত্রণালয়। এখান থেকে হেড এডমিন, মেইন এডমিন, সাব এডমিন, ইউজার এডমিনসহ সকল ডিপার্টমেন্টের জন্য নতুন এডমিন যোগ করা এবং পরিচালনা করা যায়।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 shadow-md shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ নতুন এডমিন যোগ করুন (Add Admin)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onRefresh && onRefresh()}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              title="রিফ্রেশ করুন (Refresh Directorate)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS STRIP - Clean, High Contrast, No Text Clipping */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400 font-bold leading-tight">
                মোট এডমিন
              </span>
              <Users className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 dark:text-white">{totalCount}</span>
              <span className="text-[11px] text-neutral-500 font-medium">একাউন্ট</span>
            </div>
          </div>

          <div className="bg-purple-50/80 dark:bg-purple-950/30 p-3 sm:p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/60 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono text-purple-800 dark:text-purple-300 font-bold leading-tight">
                👑 হেড এডমিন
              </span>
              <Crown className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-purple-900 dark:text-purple-200">{headCount}</span>
              <span className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">রুট চিফ</span>
            </div>
          </div>

          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3 sm:p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono text-emerald-800 dark:text-emerald-300 font-bold leading-tight">
                🏛️ মেইন এডমিন
              </span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-900 dark:text-emerald-200">{mainCount}</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">অপারেশন</span>
            </div>
          </div>

          <div className="bg-sky-50/80 dark:bg-sky-950/30 p-3 sm:p-3.5 rounded-xl border border-sky-200 dark:border-sky-800/60 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono text-sky-800 dark:text-sky-300 font-bold leading-tight">
                ⚡ সাব ও ইউজার
              </span>
              <Briefcase className="w-3.5 h-3.5 text-sky-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-sky-900 dark:text-sky-200">{subCount + userCount}</span>
              <span className="text-[11px] text-sky-700 dark:text-sky-400 font-medium">অপারেশনাল</span>
            </div>
          </div>

          <div className="bg-amber-50/80 dark:bg-amber-950/30 p-3 sm:p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/60 col-span-2 sm:col-span-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-mono text-amber-800 dark:text-amber-300 font-bold leading-tight">
                🏷️ স্পেশালাইজড
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-amber-900 dark:text-amber-200">{specializedCount}</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">ডিপার্টমেন্ট</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="এডমিন নাম, ইমেইল, ডিপার্টমেন্ট বা মোবাইল দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 shrink-0 font-medium">
            <span>ফলাফল: <strong className="text-neutral-900 dark:text-white font-bold">{filteredAdmins.length}</strong> / {totalCount}</span>
          </div>
        </div>

        {/* Role Filter Pills with horizontal scroll on mobile to prevent clumsy wrapping */}
        <div className="overflow-x-auto no-scrollbar pb-1.5 flex items-center gap-1.5 flex-nowrap sm:flex-wrap text-xs pt-1">
          <button
            type="button"
            onClick={() => setSelectedRoleFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-medium shrink-0 whitespace-nowrap transition-all cursor-pointer ${
              selectedRoleFilter === "all"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xs"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/60"
            }`}
          >
            সব এডমিন ({totalCount})
          </button>

          {ADMIN_MINISTER_ROLES.map((role) => {
            const count = adminUsers.filter((a) => a.role === role.id).length;
            const isSelected = selectedRoleFilter === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleFilter(role.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-600 text-white font-bold shadow-xs"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700/60"
                }`}
              >
                <span>{role.badgeLabel}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isSelected ? 'bg-white/20 text-white font-bold' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* DIRECTORY LISTING - MOBILE CARDS VIEW (< md)             */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-3">
        {filteredAdmins.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 text-center text-neutral-500">
            <Shield className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="font-medium text-neutral-800 dark:text-neutral-200 text-sm">কোনো এডমিন একাউন্ট পাওয়া যায়নি</p>
            <p className="text-xs text-neutral-500 mt-1">বর্তমান ফিল্টার বা সার্চ দিয়ে কোনো এডমিন পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const roleDef = getRoleDefinition(admin.role);
            const Icon = roleDef.icon;
            const isRoot = isProtectedRoot(admin.email);
            const initial = admin.name ? admin.name.charAt(0).toUpperCase() : "A";

            return (
              <div
                key={admin._id || admin.email}
                className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-3"
              >
                {/* Header: Avatar, Name, Root, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${roleDef.iconBgClass}`}>
                      {initial}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                        <span className="truncate">{admin.name || "এডমিন কর্মকর্তা"}</span>
                        {isRoot && (
                          <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded shrink-0">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{admin.department || roleDef.shortTag}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>সক্রিয়</span>
                  </span>
                </div>

                {/* Role and Scope */}
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${roleDef.badgeClass}`}>
                      <Icon className="w-3 h-3 shrink-0" />
                      <span>{roleDef.badgeLabel}</span>
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">{roleDef.nameEn}</span>
                  </div>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">
                    {roleDef.scopeSummaryBn}
                  </p>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-mono break-all">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{admin.email}</span>
                  </div>
                  {admin.phone && (
                    <div className="flex items-center gap-2 text-neutral-500 font-mono">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{admin.phone}</span>
                    </div>
                  )}
                </div>

                {/* Mobile Actions */}
                {isSuperAdmin && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                    {isRoot ? (
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 w-full text-center">
                        🛡️ সিস্টেম সংরক্ষিত রুট একাউন্ট
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setResetTargetAdmin(admin);
                            setNewPasswordInput("");
                            setResetError("");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>পাসওয়ার্ড রিসেট</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTargetAdmin(admin);
                            setDeleteConfirmInput("");
                          }}
                          className="flex-1 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>এক্সেস বাতিল</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* DIRECTORY TABLE - DESKTOP VIEW (>= md)                   */}
      {/* ======================================================== */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto relative">
          <table className="w-full text-left border-collapse min-w-[880px]">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400">
                <th className="py-3.5 px-4 font-bold min-w-[200px]">এডমিন মিনিস্টার / নাম</th>
                <th className="py-3.5 px-4 font-bold min-w-[190px]">অফিসিয়াল ইমেইল ও যোগাযোগ</th>
                <th className="py-3.5 px-4 font-bold min-w-[170px]">মন্ত্রণালয় ও দায়িত্ব (Role)</th>
                <th className="py-3.5 px-4 font-bold min-w-[230px]">ক্ষমতা ও পারমিশন (Permissions)</th>
                <th className="py-3.5 px-4 font-bold min-w-[110px]">স্ট্যাটাস</th>
                {/* Sticky Action Column Header */}
                <th className="py-3.5 px-4 font-bold text-center w-[120px] sticky right-0 bg-neutral-50 dark:bg-neutral-800 z-20 shadow-[-6px_0_12px_rgba(0,0,0,0.08)] border-l border-neutral-200 dark:border-neutral-800">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Shield className="w-8 h-8 text-neutral-400 mx-auto" />
                      <p className="font-medium text-neutral-800 dark:text-neutral-200">কোনো এডমিন একাউন্ট পাওয়া যায়নি</p>
                      <p className="text-[11px] text-neutral-500">
                        বর্তমান ফিল্টার বা সার্চ দিয়ে কোনো এডমিন পাওয়া যায়নি।
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const roleDef = getRoleDefinition(admin.role);
                  const Icon = roleDef.icon;
                  const isRoot = isProtectedRoot(admin.email);
                  const initial = admin.name ? admin.name.charAt(0).toUpperCase() : "A";

                  return (
                    <tr
                      key={admin._id || admin.email}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-850/50 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${roleDef.iconBgClass}`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                              <span>{admin.name || "এডমিন কর্মকর্তা"}</span>
                              {isRoot && (
                                <span className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded" title="সিস্টেম সংরক্ষিত রুট একাউন্ট">
                                  ROOT
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3 text-neutral-400" />
                              <span>{admin.department || roleDef.shortTag}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Contact */}
                      <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300 min-w-[190px]">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-900 dark:text-neutral-100 font-medium break-all">
                            <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                            <span>{admin.email}</span>
                          </div>
                          {admin.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                              <span>{admin.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Badge - Full English subtitle without truncating ellipsis */}
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${roleDef.badgeClass}`}>
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span>{roleDef.badgeLabel}</span>
                          </span>
                          <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium">
                            {roleDef.nameEn}
                          </div>
                        </div>
                      </td>

                      {/* Scope Summary */}
                      <td className="py-3.5 px-4 min-w-[230px] max-w-xs">
                        <div className="space-y-1">
                          <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium leading-snug">
                            {roleDef.scopeSummaryBn}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-mono leading-tight">
                            {roleDef.scopeSummaryEn}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 min-w-[110px]">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>সক্রিয় (Active)</span>
                        </span>
                      </td>

                      {/* Actions - STICKY RIGHT COLUMN PERMANENTLY VISIBLE */}
                      <td className="py-3.5 px-4 text-center sticky right-0 bg-white dark:bg-neutral-900 z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.08)] border-l border-neutral-200 dark:border-neutral-800">
                        {isSuperAdmin ? (
                          <div className="inline-flex items-center justify-center gap-1.5">
                            {/* Reset Password Button */}
                            {!isRoot && (
                              <button
                                type="button"
                                onClick={() => {
                                  setResetTargetAdmin(admin);
                                  setNewPasswordInput("");
                                  setResetError("");
                                }}
                                className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 cursor-pointer transition-colors shadow-xs"
                                title={`পাসওয়ার্ড রিসেট করুন: ${admin.email}`}
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Revoke / Delete Button */}
                            {isRoot ? (
                              <span className="text-[9px] font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded border border-purple-200 dark:border-purple-800" title="সিস্টেম সংরক্ষিত রুট একাউন্ট">
                                সুরক্ষিত
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTargetAdmin(admin);
                                  setDeleteConfirmInput("");
                                }}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer transition-colors shadow-xs"
                                title="এডমিন এক্সেস বাতিল করুন (Revoke Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono text-neutral-400">ডিরেক্টরি</span>
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

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / ADD ADMIN MODAL WITH ALL ROLES OPTIONS */}
      {/* ======================================================== */}
      {isCreateModalOpen && isSuperAdmin && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => {
            setIsCreateModalOpen(false);
            if (onCloseCreateModalDirectly) onCloseCreateModalDirectly();
          }}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-2xl w-full my-auto shadow-2xl p-5 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>এডমিন মিনিস্টার — নতুন এডমিন যোগ করুন</span>
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Add New Administrator to the Sovereign Ministry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  if (onCloseCreateModalDirectly) onCloseCreateModalDirectly();
                }}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-5">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    এডমিন নাম (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: নোয়ন দে / সুজন শিকদার"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    অফিসিয়াল ইমেইল (Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="admin.ops@alikend.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    বিভাগ / দপ্তর (Department / Division)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: Operations / Customer Care / Finance"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    মোবাইল নম্বর (Official Phone)
                  </label>
                  <input
                    type="text"
                    placeholder="+880 1700-000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Password Field with Generator & Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono">
                    লগইন পাসওয়ার্ড (min 10 chars) <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>শক্তিশালী পাসওয়ার্ড জেনারেট করুন</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="পাসওয়ার্ড লিখুন (কমপক্ষে ১০ অক্ষর)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-mono"
                    required
                    minLength={10}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ROLE SELECTION CARDS (ALL ADMIN ROLES AS REQUESTED) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono">
                    মন্ত্রণালয় ও এডমিন পদবী নির্বাচন করুন (Choose Admin Ministry Role) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {ADMIN_MINISTER_ROLES.length} টি ভূমিকা উপলব্ধ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {ADMIN_MINISTER_ROLES.map((role) => {
                    const isSelected = selectedRole === role.id;
                    const Icon = role.icon;

                    return (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                          isSelected
                            ? `${role.borderClass} bg-amber-50/40 dark:bg-neutral-800 ring-2 ring-amber-500/20 shadow-sm`
                            : "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700"
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${role.badgeClass}`}>
                              <Icon className="w-3 h-3" />
                              {role.badgeLabel}
                            </span>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="font-bold text-xs text-neutral-900 dark:text-white leading-tight">
                            {role.nameBn}
                          </div>
                          <div className="text-[10px] text-neutral-500 leading-tight">
                            {role.nameEn}
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400 font-mono line-clamp-1">
                          {role.scopeSummaryBn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVE ROLE PERMISSION SUMMARY BOX */}
              {(() => {
                const currentRoleDef = getRoleDefinition(selectedRole);
                const CurrentIcon = currentRoleDef.icon;
                return (
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-neutral-800/60 border border-amber-200 dark:border-neutral-700 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <CurrentIcon className="w-4 h-4 text-amber-600" />
                      <span>নির্বাচিত ভূমিকা: {currentRoleDef.nameBn}</span>
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      {currentRoleDef.descriptionBn}
                    </p>
                    <div className="pt-2 border-t border-amber-200/50 dark:border-neutral-700/60">
                      <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 dark:text-neutral-400 block mb-1">
                        নির্ধারিত মূল পারমিশনসমূহ:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentRoleDef.keyPermissions.map((perm, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 font-medium"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    if (onCloseCreateModalDirectly) onCloseCreateModalDirectly();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>🛡️ এডমিন নিশ্চিত করুন ও একাউন্ট তৈরি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RESET PASSWORD MODAL */}
      {/* ======================================================== */}
      {resetTargetAdmin && isSuperAdmin && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setResetTargetAdmin(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full my-auto shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  এডমিন পাসওয়ার্ড রিসেট করুন
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setResetTargetAdmin(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              এডমিন <strong>{resetTargetAdmin.name}</strong> ({resetTargetAdmin.email}) এর জন্য নতুন সিকিউর পাসওয়ার্ড সেট করুন।
            </p>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  নতুন পাসওয়ার্ড (min 10 chars)
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
                  required
                  minLength={10}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetAdmin(null)}
                  className="px-3.5 py-1.5 text-xs rounded-xl text-neutral-600 hover:bg-neutral-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {resetLoading ? "রিসেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE / REVOKE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deleteTargetAdmin && isSuperAdmin && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setDeleteTargetAdmin(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full my-auto shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  এডমিন এক্সেস বাতিল নিশ্চিতকরণ
                </h3>
                <p className="text-[11px] text-neutral-500">Revoke Administrative Credentials</p>
              </div>
            </div>

            <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
              আপনি <strong>{deleteTargetAdmin.name}</strong> ({deleteTargetAdmin.email}) একাউন্টের প্রশাসনিক ক্ষমতা স্থায়ীভাবে বাতিল করতে চলেছেন।
            </p>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-800 dark:text-rose-300">
              নিশ্চিত করতে নিচে হুবহু এই ইমেইলটি টাইপ করুন: <br />
              <code className="font-mono font-bold">{deleteTargetAdmin.email}</code>
            </div>

            <input
              type="text"
              placeholder={deleteTargetAdmin.email}
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 font-mono"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetAdmin(null)}
                className="px-3.5 py-1.5 text-xs rounded-xl text-neutral-600 hover:bg-neutral-100"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={deleteLoading || deleteConfirmInput !== deleteTargetAdmin.email}
                onClick={handleDeleteAdmin}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white"
              >
                {deleteLoading ? "বাতিল হচ্ছে..." : "স্থায়ীভাবে এক্সেস বাতিল করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
