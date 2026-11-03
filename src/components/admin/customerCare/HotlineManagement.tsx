import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Phone,
  PhoneCall,
  Plus,
  Search,
  Check,
  Copy,
  Edit3,
  Trash2,
  AlertTriangle,
  Clock,
  Mail,
  MessageCircle,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

export interface HotlineItem {
  _id: string;
  name: string;
  phoneNumber: string;
  extension?: string;
  department: string;
  description?: string;
  operatingHours: string;
  whatsappNumber?: string;
  emailAddress?: string;
  isEmergency: boolean;
  isPriority: boolean;
  isActive: boolean;
  displayOrder: number;
  callClickCount: number;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface HotlineManagementProps {
  hotlines: HotlineItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreate: (data: Partial<HotlineItem>) => Promise<void>;
  onUpdate: (id: string, data: Partial<HotlineItem>) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTrackCall: (id: string) => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

const DEPARTMENTS = [
  "All Departments",
  "Executive Concierge",
  "Order Support",
  "VIP & High Value",
  "Technical & IT",
  "Billing & Refunds",
  "Seller Relations",
  "General Inquiries",
];

export default function HotlineManagement({
  hotlines,
  loading,
  onRefresh,
  onCreate,
  onUpdate,
  onToggle,
  onDelete,
  onTrackCall,
  onShowToast,
  isSuperAdmin,
}: HotlineManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HotlineItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    extension: "",
    department: "Order Support",
    description: "",
    operatingHours: "24/7 Round the Clock",
    whatsappNumber: "",
    emailAddress: "",
    isEmergency: false,
    isPriority: false,
    isActive: true,
    displayOrder: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (modalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [modalOpen]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      phoneNumber: "",
      extension: "",
      department: "Order Support",
      description: "",
      operatingHours: "24/7 Round the Clock",
      whatsappNumber: "",
      emailAddress: "",
      isEmergency: false,
      isPriority: false,
      isActive: true,
      displayOrder: hotlines.length + 1,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item: HotlineItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      phoneNumber: item.phoneNumber,
      extension: item.extension || "",
      department: item.department,
      description: item.description || "",
      operatingHours: item.operatingHours || "24/7 Round the Clock",
      whatsappNumber: item.whatsappNumber || "",
      emailAddress: item.emailAddress || "",
      isEmergency: item.isEmergency,
      isPriority: item.isPriority,
      isActive: item.isActive,
      displayOrder: item.displayOrder || 1,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedId(id);
    onShowToast(`Hotline ${phone} copied to clipboard!`, "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePhoneClick = (id: string) => {
    onTrackCall(id);
  };

  const validatePhone = (p: string) => {
    const digits = p.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 16;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Please enter a name for this hotline.");
      return;
    }
    if (!validatePhone(formData.phoneNumber)) {
      setFormError("Please enter a valid phone number (at least 7 digits, e.g. +880 1800-254-536).");
      return;
    }

    try {
      setSubmitting(true);
      if (editingItem) {
        await onUpdate(editingItem._id, formData);
        onShowToast(`Hotline "${formData.name}" updated successfully.`, "success");
      } else {
        await onCreate(formData);
        onShowToast(`Hotline "${formData.name}" published to directory.`, "success");
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to save hotline record.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered hotlines
  const filteredHotlines = hotlines.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = deptFilter === "All Departments" || item.department === deptFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive);

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-wide">
                Central Hotline Directory & Concierge Lines
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Database-driven verified support hotlines across departments with click-to-call audit logging.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Refresh</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hotline</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search hotline by name, phone, or department..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer transition-colors"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <button
            onClick={() => setStatusFilter("all")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "all"
                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            }`}
          >
            All ({hotlines.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-emerald-600"
            }`}
          >
            Active ({hotlines.filter((h) => h.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === "inactive"
                ? "bg-rose-600 text-white font-bold shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-rose-600"
            }`}
          >
            Disabled ({hotlines.filter((h) => !h.isActive).length})
          </button>
        </div>
      </div>

      {/* Hotline Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
          Loading centralized hotline directory...
        </div>
      ) : filteredHotlines.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-8 shadow-sm">
          <Phone className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-sm">No hotlines found matching filters</h3>
          <p className="text-neutral-500 text-xs mt-1">
            Try adjusting your search query or department filter, or click "Add New Hotline" to register one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredHotlines.map((item) => (
            <div
              key={item._id}
              className={`relative bg-white dark:bg-neutral-900 border rounded-2xl p-5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm ${
                !item.isActive
                  ? "border-neutral-200 dark:border-neutral-800/50 opacity-70"
                  : item.isEmergency
                  ? "border-rose-300 dark:border-rose-500/30"
                  : item.isPriority
                  ? "border-amber-300 dark:border-amber-500/30"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">{item.name}</h3>
                    {item.isEmergency && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        EMERGENCY 24/7
                      </span>
                    )}
                    {item.isPriority && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        VIP PRIORITY
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                          : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
                      }`}
                    >
                      {item.isActive ? "Active in Directory" : "Deactivated"}
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{item.department}</span>
                    {item.extension && (
                      <span className="text-neutral-700 dark:text-neutral-300 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.2 rounded">
                        {item.extension}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    title="হটলাইন এডিট করুন (Edit Hotline)"
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-700 hover:bg-amber-50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggle(item._id)}
                    title={item.isActive ? "Deactivate" : "Activate"}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      item.isActive
                        ? "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                        : "text-neutral-400 hover:text-emerald-600 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => onDelete(item._id)}
                      title="Delete Hotline"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{item.description}</p>
              )}

              {/* Central Phone Number Box with Click-to-call and Copy */}
              <div className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <a
                      href={`tel:${item.phoneNumber}`}
                      onClick={() => handlePhoneClick(item._id)}
                      className="text-sm sm:text-base font-mono font-bold text-neutral-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-300 transition-colors tracking-wider block truncate"
                    >
                      {item.phoneNumber}
                    </a>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{item.operatingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyPhone(item._id, item.phoneNumber)}
                    title="Copy Phone Number"
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === item._id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`tel:${item.phoneNumber}`}
                    onClick={() => handlePhoneClick(item._id)}
                    title="Dial Number Directly"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Call</span>
                  </a>
                </div>
              </div>

              {/* Channels (WhatsApp / Email / Clicks) */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  {item.whatsappNumber && (
                    <a
                      href={`https://wa.me/${item.whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                  {item.emailAddress && (
                    <a
                      href={`mailto:${item.emailAddress}`}
                      className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 font-medium flex items-center gap-1 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{item.emailAddress}</span>
                    </a>
                  )}
                </div>

                <div className="text-neutral-500 font-mono text-[11px]">
                  Calls Tracked: <span className="text-neutral-900 dark:text-neutral-200 font-bold">{item.callClickCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ADD / EDIT HOTLINE MODAL (Z-9999, LUXURY & HIGH CONTRAST) */}
      {/* ======================================================== */}
      {modalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>{editingItem ? "হটলাইন তথ্য সম্পাদনা করুন (Edit Hotline)" : "নতুন কেন্দ্রীয় হটলাইন যোগ করুন (Add Hotline)"}</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure contact channels, operating hours, and priority routing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    হটলাইনের নাম (Hotline Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: Executive Concierge, Order Logistics Help"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    ফোন নম্বর (Phone Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+880 1800-254-536"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    এক্সটেনশন (Extension - Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.extension}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    placeholder="Ext 101"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    বিভাগ (Department) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer font-medium"
                  >
                    {DEPARTMENTS.filter((d) => d !== "All Departments").map((d) => (
                      <option key={d} value={d} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    অপারেটিং সময় (Operating Hours) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="24/7 Round the Clock অথবা 08:00 AM - 11:00 PM"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    হোয়াটসঅ্যাপ সাপোর্ট নম্বর (WhatsApp Number)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    placeholder="+880 1800-254-536"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    সাপোর্ট ইমেইল (Support Email Address)
                  </label>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    placeholder="concierge@alike-nd.com"
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    সহায়তার বিবরণ ও আওতা (Description & Scope)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="এই হটলাইনের মাধ্যমে গ্রাহক কী ধরনের সেবা পাবেন তা সংক্ষেপে লিখুন..."
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none"
                  />
                </div>

                {/* Priority & Status Toggle Flags */}
                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isPriority ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800'}`}>
                    <input
                      type="checkbox"
                      checked={formData.isPriority}
                      onChange={(e) => setFormData({ ...formData, isPriority: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>VIP Priority Line</span>
                    </span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isEmergency ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700/60' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800'}`}>
                    <input
                      type="checkbox"
                      checked={formData.isEmergency}
                      onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Emergency 24/7</span>
                    </span>
                  </label>

                  <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${formData.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700/60' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800'}`}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Active in Directory</span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? "সংরক্ষণ হচ্ছে..." : editingItem ? "হটলাইন আপডেট করুন (Update)" : "হটলাইন প্রকাশ করুন (Publish)"}
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
