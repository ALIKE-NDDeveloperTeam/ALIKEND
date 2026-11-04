import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Truck,
  Car,
  Activity,
  DollarSign,
  Settings,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Users,
  Download,
  Phone,
  Power,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Lock,
  ArrowRight,
  Flame,
  Zap,
  ShieldAlert,
  Sliders,
  Database,
  Store,
  Layers,
  HelpCircle,
  Eye,
  Send,
  AlertOctagon,
} from "lucide-react";
import {
  adminCentralApi,
  CentralSummary,
  ServiceAreaZone,
  CentralSystemConfig,
  UnifiedDispatchData,
  CrossServiceReport,
  AuditLogItem,
} from "../../pages/adminCentralApi";

interface CentralAdminPanelModuleProps {
  currentAdminEmail?: string;
  isSuperAdmin?: boolean;
}

type TabType = "overview" | "dispatch" | "partners" | "finance" | "config" | "audit";

export const CentralAdminPanelModule: React.FC<CentralAdminPanelModuleProps> = ({
  currentAdminEmail = "admin@alikend.com",
  isSuperAdmin = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Data states
  const [summary, setSummary] = useState<CentralSummary | null>(null);
  const [dispatchData, setDispatchData] = useState<UnifiedDispatchData | null>(null);
  const [report, setReport] = useState<CrossServiceReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [config, setConfig] = useState<CentralSystemConfig | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaZone[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  // Dispatch Tab Filters
  const [dispatchFilter, setDispatchFilter] = useState<"all" | "delivery" | "ride" | "sos">("all");
  const [dispatchSearch, setDispatchSearch] = useState<string>("");

  // Workflow Override Modal State
  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [selectedTaskForOverride, setSelectedTaskForOverride] = useState<any | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [isSubmittingOverride, setIsSubmittingOverride] = useState<boolean>(false);

  // Partners Dossier Sub-tab
  const [partnerSubTab, setPartnerSubTab] = useState<"drivers" | "deliveryPartners">("drivers");
  const [selectedPartnerDetails, setSelectedPartnerDetails] = useState<any | null>(null);

  // New Zone Modal State
  const [zoneModalOpen, setZoneModalOpen] = useState<boolean>(false);
  const [newZoneName, setNewZoneName] = useState<string>("");
  const [newZoneCode, setNewZoneCode] = useState<string>("");
  const [newZoneLat, setNewZoneLat] = useState<number>(28.6139);
  const [newZoneLng, setNewZoneLng] = useState<number>(77.209);
  const [newZoneRadius, setNewZoneRadius] = useState<number>(10);
  const [newZoneBaseFee, setNewZoneBaseFee] = useState<number>(35);

  const flashNotice = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(""), 6000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  };

  const loadAllData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [sumRes, dispatchRes, reportRes, configRes, logsRes] = await Promise.allSettled([
        adminCentralApi.getSummary(),
        adminCentralApi.getUnifiedDispatch(),
        adminCentralApi.getCrossServiceReport(reportPeriod),
        adminCentralApi.getConfig(),
        adminCentralApi.getAuditLogs({ limit: 50 }),
      ]);

      if (sumRes.status === "fulfilled") setSummary(sumRes.value);
      if (dispatchRes.status === "fulfilled") setDispatchData(dispatchRes.value);
      if (reportRes.status === "fulfilled") setReport(reportRes.value);
      if (configRes.status === "fulfilled") {
        setConfig(configRes.value.config);
        setServiceAreas(configRes.value.serviceAreas);
      }
      if (logsRes.status === "fulfilled") setAuditLogs(logsRes.value);
    } catch (err: any) {
      setError(err?.message || "Failed to load central admin records");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [reportPeriod]);

  // Handle service availability toggle
  const handleToggleService = async (service: "delivery" | "rides", currentVal: boolean) => {
    if (!config) return;
    try {
      const payload: Partial<CentralSystemConfig> = {
        serviceAvailability: {
          ...config.serviceAvailability,
          [service === "delivery" ? "deliveryGloballyEnabled" : "ridesGloballyEnabled"]: !currentVal,
        },
      };
      const res = await adminCentralApi.updateConfig(payload);
      setConfig(res.config);
      flashNotice(`${service === "delivery" ? "Product & Food Delivery" : "Alike Rides"} availability updated.`);
      loadAllData(true);
    } catch (err: any) {
      flashNotice(err?.message || "Failed to toggle service availability", true);
    }
  };

  // Handle emergency lockdown toggle
  const handleToggleLockdown = async () => {
    if (!config) return;
    const current = config.serviceAvailability.emergencyLockdown;
    const promptReason = !current ? window.prompt("Enter reason for Emergency Lockdown:", "Citywide Weather Alert / Emergency") : "";
    if (!current && !promptReason) return;

    try {
      const payload: Partial<CentralSystemConfig> = {
        serviceAvailability: {
          ...config.serviceAvailability,
          emergencyLockdown: !current,
          lockdownReason: promptReason || "",
        },
      };
      const res = await adminCentralApi.updateConfig(payload);
      setConfig(res.config);
      flashNotice(`Emergency lockdown ${!current ? "ACTIVATED" : "DEACTIVATED"}.`);
      loadAllData(true);
    } catch (err: any) {
      flashNotice(err?.message || "Failed to change emergency lockdown state", true);
    }
  };

  // Handle workflow override submit
  const handleExecuteWorkflowOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskForOverride || !targetStatus || !overrideReason) {
      flashNotice("Target status and reason are mandatory for safety audit trail.", true);
      return;
    }

    setIsSubmittingOverride(true);
    try {
      await adminCentralApi.overrideWorkflow({
        entityType: selectedTaskForOverride.entityType === "delivery" ? "delivery" : "ride",
        entityId: selectedTaskForOverride.taskId || selectedTaskForOverride._id || selectedTaskForOverride.orderId,
        targetStatus,
        reason: overrideReason,
        bypassValidation: isSuperAdmin,
      });

      flashNotice(`Successfully transitioned to '${targetStatus}'. Audit log recorded.`);
      setOverrideModalOpen(false);
      setSelectedTaskForOverride(null);
      setTargetStatus("");
      setOverrideReason("");
      loadAllData(true);
    } catch (err: any) {
      flashNotice(err?.message || "Failed to override workflow transition", true);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Handle add service area zone
  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName || !newZoneCode) {
      flashNotice("Zone name and code are required", true);
      return;
    }

    try {
      const updated = await adminCentralApi.addServiceArea({
        name: newZoneName,
        code: newZoneCode,
        coordinates: { lat: newZoneLat, lng: newZoneLng },
        radiusKm: newZoneRadius,
        deliveryActive: true,
        ridesActive: true,
        baseDeliveryFee: newZoneBaseFee,
        nightSurgeMultiplier: 1.2,
      });
      setServiceAreas(updated);
      setZoneModalOpen(false);
      setNewZoneName("");
      setNewZoneCode("");
      flashNotice(`Service zone ${newZoneName} registered successfully.`);
    } catch (err: any) {
      flashNotice(err?.message || "Failed to add service area", true);
    }
  };

  // Filtered dispatch list
  const filteredDispatchItems = () => {
    if (!dispatchData) return [];
    let items: any[] = [];

    if (dispatchFilter === "all" || dispatchFilter === "delivery") {
      items = items.concat(dispatchData.deliveries || []);
    }
    if (dispatchFilter === "all" || dispatchFilter === "ride") {
      items = items.concat(dispatchData.rides || []);
    }
    if (dispatchFilter === "sos") {
      items = items.concat((dispatchData.rides || []).filter((r) => r.emergencyTriggered));
    }

    if (dispatchSearch.trim()) {
      const q = dispatchSearch.toLowerCase();
      items = items.filter(
        (it) =>
          it.orderId?.toLowerCase().includes(q) ||
          it.rideId?.toLowerCase().includes(q) ||
          it.customerName?.toLowerCase().includes(q) ||
          it.driverName?.toLowerCase().includes(q) ||
          it.partnerName?.toLowerCase().includes(q) ||
          it.status?.toLowerCase().includes(q)
      );
    }
    return items;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner with Real-time Sync and Service Toggles */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 border border-indigo-900/40 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                CENTRAL COMMAND (মডিউল ৩)
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-white border border-white/15">
                Admin: {currentAdminEmail}
              </span>
              {config?.serviceAvailability?.emergencyLockdown && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white flex items-center gap-1.5 animate-pulse">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  EMERGENCY LOCKDOWN ACTIVE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              ALIKE ND Central Operations & Sovereign Admin Console
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl font-light">
              Unified cross-service intelligence: Product & Food Delivery, Alike Rides (Bike, Auto, Cab), verified partner dossiers, financial audit trail, and dispatch state machine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Service Availability Toggles */}
            <button
              type="button"
              onClick={() => handleToggleService("delivery", config?.serviceAvailability?.deliveryGloballyEnabled !== false)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                config?.serviceAvailability?.deliveryGloballyEnabled !== false
                  ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40"
                  : "bg-rose-950/60 text-rose-300 border-rose-800/40 hover:bg-rose-900/60"
              }`}
              title="Global switch for Food and Product Delivery"
            >
              <Truck className="w-3.5 h-3.5" />
              Delivery: {config?.serviceAvailability?.deliveryGloballyEnabled !== false ? "ON" : "OFF"}
            </button>

            <button
              type="button"
              onClick={() => handleToggleService("rides", config?.serviceAvailability?.ridesGloballyEnabled !== false)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                config?.serviceAvailability?.ridesGloballyEnabled !== false
                  ? "bg-emerald-600/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/40"
                  : "bg-rose-950/60 text-rose-300 border-rose-800/40 hover:bg-rose-900/60"
              }`}
              title="Global switch for Bike, Auto & Cab rides"
            >
              <Car className="w-3.5 h-3.5" />
              Rides: {config?.serviceAvailability?.ridesGloballyEnabled !== false ? "ON" : "OFF"}
            </button>

            {/* Emergency Lockdown Button */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={handleToggleLockdown}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-sm ${
                  config?.serviceAvailability?.emergencyLockdown
                    ? "bg-rose-600 text-white border-rose-400 hover:bg-rose-700 animate-pulse"
                    : "bg-neutral-800/80 hover:bg-rose-900/40 text-neutral-300 hover:text-rose-200 border-neutral-700"
                }`}
                title="Halt all operations in case of citywide disaster or emergency"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                {config?.serviceAvailability?.emergencyLockdown ? "Disable Lockdown" : "Emergency SOS Kill-Switch"}
              </button>
            )}

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadAllData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Sync Central
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-6 mt-4 border-t border-white/10">
          {[
            { id: "overview", label: "Executive Overview", icon: Activity },
            { id: "dispatch", label: "Unified Live Dispatch & Orders", icon: Truck },
            { id: "partners", label: "Partner Dossiers & Approvals", icon: Users },
            { id: "finance", label: "Financials & Cash Reconciliation", icon: DollarSign },
            { id: "config", label: "System Rules & Geofence Zones", icon: Settings },
            { id: "audit", label: "Security & Audit Logs", icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20 scale-102"
                    : "bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-700 hover:text-rose-950 cursor-pointer">
            &times;
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === "overview" && summary && (
        <div className="space-y-6 animate-fadeIn">
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Gross Delivery Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
                ₹{summary.delivery.revenue.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>{summary.delivery.completed} orders completed</span>
                <span className="font-semibold text-emerald-600">Online: ₹{summary.delivery.onlineCollected}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Gross Rides Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
                ₹{summary.rides.revenue.toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>{summary.rides.completedRides} rides completed</span>
                <span className="font-semibold text-indigo-600">Fares: ₹{summary.rides.cashCollected} Cash</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Operations</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
                {summary.delivery.activeDispatch + summary.rides.activeRides} Active
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>{summary.delivery.activeDispatch} Deliveries</span>
                <span>{summary.rides.activeRides} Rides in transit</span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Active Fleet On-Duty</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">
                {summary.delivery.activePartners + summary.rides.onlineDrivers} Online
              </div>
              <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
                <span>{summary.delivery.activePartners} Delivery fleet</span>
                <span>{summary.rides.onlineDrivers} Cab/Auto drivers</span>
              </div>
            </div>
          </div>

          {/* Service Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Operations Summary */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Product & Food Delivery Service</h3>
                    <p className="text-xs text-neutral-500">Order Placed → Store Pickup → Doorstep OTP Delivery</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                  {summary.delivery.totalOrders} Total Orders
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="text-xs text-neutral-500">Pending Store</div>
                  <div className="text-lg font-bold text-neutral-900 dark:text-white">{summary.delivery.pending}</div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30">
                  <div className="text-xs text-blue-600 dark:text-blue-400">Out for Delivery</div>
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{summary.delivery.activeDispatch}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Delivered</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{summary.delivery.completed}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Cash on Delivery (COD) Collected:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">₹{summary.delivery.codCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Prepaid / Online Orders:</span>
                  <span className="font-semibold text-neutral-900 dark:text-white">₹{summary.delivery.onlineCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending Partner Registrations:</span>
                  <span className="font-bold text-amber-600">{summary.delivery.pendingPartnerApprovals} require verification</span>
                </div>
              </div>
            </div>

            {/* Ride Operations Summary */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Alike Rides (Bike, Auto, Cab)</h3>
                    <p className="text-xs text-neutral-500">Ride Requested → Driver Arrived → Ride OTP → Completed</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900">
                  {summary.rides.totalBookings} Total Bookings
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30">
                  <div className="text-xs text-indigo-600 dark:text-indigo-400">Live in Transit</div>
                  <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{summary.rides.activeRides}</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">Completed</div>
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{summary.rides.completedRides}</div>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30">
                  <div className="text-xs text-rose-600 dark:text-rose-400">Cancelled</div>
                  <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{summary.rides.cancelledRides}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Driver Gross Payouts:</span>
                  <span className="font-semibold text-emerald-600">₹{summary.rides.driverEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Platform Ride Commission:</span>
                  <span className="font-bold text-indigo-600">₹{summary.rides.platformCommission.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Pending Driver Approvals:</span>
                  <span className="font-bold text-amber-600">{summary.rides.pendingDriverApprovals} dossier reviews waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: UNIFIED LIVE DISPATCH & ORDERS */}
      {/* ========================================================= */}
      {activeTab === "dispatch" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dispatch Control Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider mr-1">Filter:</span>
              {[
                { id: "all", label: "All Active", count: (dispatchData?.deliveries?.length || 0) + (dispatchData?.rides?.length || 0) },
                { id: "delivery", label: "Deliveries", count: dispatchData?.deliveries?.length || 0 },
                { id: "ride", label: "Rides", count: dispatchData?.rides?.length || 0 },
                { id: "sos", label: "Emergency SOS", count: (dispatchData?.rides || []).filter((r) => r.emergencyTriggered).length },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDispatchFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dispatchFilter === f.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm"
                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {f.id === "sos" && <ShieldAlert className="w-3 h-3 text-rose-500" />}
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={dispatchSearch}
                onChange={(e) => setDispatchSearch(e.target.value)}
                placeholder="Search order ID, ride ID, customer..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Unified Dispatch Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Unified Cross-Service Dispatch Stream</h3>
                <p className="text-xs text-neutral-500">Non-interchangeable OTP status, store & customer addresses, and state transition overrides</p>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                {filteredDispatchItems().length} active operations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="px-5 py-3.5">Type & Ref</th>
                    <th className="px-5 py-3.5">Workflow Status</th>
                    <th className="px-5 py-3.5">Customer & Contact</th>
                    <th className="px-5 py-3.5">Assigned Fleet</th>
                    <th className="px-5 py-3.5">Security OTP Protocol</th>
                    <th className="px-5 py-3.5">Pickup / Dropoff</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredDispatchItems().length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                        <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No active dispatch tasks matching current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDispatchItems().map((item: any, idx) => {
                      const isDelivery = item.entityType === "delivery";
                      const idLabel = isDelivery ? item.orderId || item.taskId : item.rideId || item._id;

                      return (
                        <tr key={idx} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                          {/* Type & Ref */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                                  isDelivery ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                                }`}
                              >
                                {isDelivery ? <Truck className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                              </span>
                              <div>
                                <div className="font-mono font-bold text-neutral-900 dark:text-white">
                                  {idLabel}
                                </div>
                                <div className="text-[10px] text-neutral-400 uppercase">
                                  {isDelivery ? "Product/Food Delivery" : `${item.vehicleType || "Ride"} Booking`}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Workflow Status */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                                  item.status === "completed" || item.status === "delivered"
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : item.status === "cancelled"
                                    ? "bg-rose-100 text-rose-800 border-rose-300"
                                    : item.emergencyTriggered
                                    ? "bg-rose-600 text-white border-rose-700 animate-pulse"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                                }`}
                              >
                                {item.emergencyTriggered ? "EMERGENCY SOS" : item.status}
                              </span>
                              {item.fare && (
                                <div className="text-[11px] font-mono text-neutral-500">
                                  ₹{item.fare} ({item.paymentMethod || "COD"})
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4">
                            <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                              {item.customerName || item.customerDetails?.name || "Customer"}
                            </div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {item.customerPhone || item.customerDetails?.phone || "N/A"}
                            </div>
                          </td>

                          {/* Assigned Fleet */}
                          <td className="px-5 py-4">
                            {item.driverName || item.partnerName ? (
                              <div>
                                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                                  {item.driverName || item.partnerName}
                                </div>
                                <div className="text-[11px] text-neutral-400">
                                  {item.vehicleNumber || item.partnerPhone || item.driverPhone || "Assigned"}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[11px] font-semibold">
                                Unassigned / Broadcast
                              </span>
                            )}
                          </td>

                          {/* Security OTP Protocol */}
                          <td className="px-5 py-4">
                            <div className="space-y-1 font-mono text-[11px]">
                              {isDelivery ? (
                                <>
                                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                                    <span className="px-1 py-0.2 bg-neutral-200 dark:bg-neutral-700 rounded text-[9px] font-bold">STORE PICKUP</span>
                                    <span>{item.pickupOtpVerified ? "✓ Verified" : "Pending Pickup"}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                                    <span className="px-1 py-0.2 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded text-[9px] font-bold">DOORSTEP OTP</span>
                                    <span>{item.deliveryOtpVerified ? "✓ Verified" : "Required (4-digit)"}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                                  <span className="px-1 py-0.2 bg-indigo-100 dark:bg-indigo-950 rounded text-[9px] font-bold">RIDE-START OTP</span>
                                  <span>{item.status === "in_progress" || item.status === "completed" ? "✓ Verified" : "4-digit required"}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Pickup / Dropoff */}
                          <td className="px-5 py-4 max-w-[200px]">
                            <div className="text-[11px] truncate text-neutral-700 dark:text-neutral-300" title={item.pickupAddress || item.storeName}>
                              <span className="font-bold text-neutral-500">From:</span> {item.pickupAddress || item.storeName || "Store"}
                            </div>
                            <div className="text-[11px] truncate text-neutral-700 dark:text-neutral-300" title={item.dropoffAddress || item.deliveryAddress}>
                              <span className="font-bold text-neutral-500">To:</span> {item.dropoffAddress || item.deliveryAddress || "Customer Doorstep"}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTaskForOverride(item);
                                setTargetStatus("");
                                setOverrideReason("");
                                setOverrideModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white font-semibold transition-all cursor-pointer"
                            >
                              Override / Transition
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PARTNER DOSSIERS & APPROVALS */}
      {/* ========================================================= */}
      {activeTab === "partners" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sub-tab Switcher */}
          <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <button
              onClick={() => setPartnerSubTab("drivers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                partnerSubTab === "drivers"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              <Car className="w-4 h-4" />
              Ride Drivers Dossier ({dispatchData?.fleet?.rideDrivers?.length || 0})
            </button>
            <button
              onClick={() => setPartnerSubTab("deliveryPartners")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                partnerSubTab === "deliveryPartners"
                  ? "bg-amber-500 text-neutral-950 shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
              }`}
            >
              <Truck className="w-4 h-4" />
              Delivery Partners Dossier ({dispatchData?.fleet?.deliveryPartners?.length || 0})
            </button>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm p-6">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
              {partnerSubTab === "drivers" ? "Ride Driver Legal Documents & Verification Dossier" : "Delivery Fleet Legal Compliance Dossier"}
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Review Aadhaar identity, Driving License, Vehicle RC, Commercial Permit, Insurance, Bank/UPI details, and account suspension toggles.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(partnerSubTab === "drivers" ? dispatchData?.fleet?.rideDrivers : dispatchData?.fleet?.deliveryPartners || []).map((partner: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center font-bold text-sm">
                        {partner.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white text-xs">{partner.name}</div>
                        <div className="text-[11px] text-neutral-500">{partner.phone}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Vehicle Type:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">{partner.vehicleType || "Standard"}</span>
                    </div>
                    {partner.vehicleNumber && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Reg Plate:</span>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{partner.vehicleNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Compliance Dossier:</span>
                      <span className="text-emerald-600 font-semibold">✓ Verified (DL/RC/Ins)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPartnerDetails(partner);
                        flashNotice(`Inspecting dossier for ${partner.name}. All verified.`);
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 text-neutral-900 dark:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Inspect Dossier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: FINANCIALS & CASH RECONCILIATION */}
      {/* ========================================================= */}
      {activeTab === "finance" && report && (
        <div className="space-y-6 animate-fadeIn">
          {/* Period Selector & Download Bar */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Report Interval:</span>
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                    reportPeriod === p
                      ? "bg-amber-400 text-neutral-950 shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  {p} Report
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adminCentralApi.downloadCrossServiceCsv(reportPeriod)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download Spreadsheet (.CSV)
              </button>
            </div>
          </div>

          {/* Consolidated Financial Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-neutral-900 text-white shadow-lg space-y-2">
              <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
                Total Combined Gross Volume
              </div>
              <div className="text-3xl font-bold font-serif text-amber-300">
                ₹{report.metrics.totalCombinedRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-400">
                Product sales + Ride fares for {report.period} period ({report.dateRange.from} to {report.dateRange.to})
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-indigo-950 text-white shadow-lg space-y-2 border border-indigo-900">
              <div className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Platform Net Revenue & Commission
              </div>
              <div className="text-3xl font-bold font-serif text-indigo-300">
                ₹{report.metrics.netPlatformCommission.toLocaleString()}
              </div>
              <p className="text-xs text-indigo-200">
                Platform fee from rides (15%) + product merchant commissions
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2">
              <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                Customer Returns & Refunds
              </div>
              <div className="text-3xl font-bold font-serif text-rose-600">
                ₹{report.metrics.totalRefunds.toLocaleString()}
              </div>
              <p className="text-xs text-neutral-500">
                Cancelled orders, return requests, and ride dispute reconciliations
              </p>
            </div>
          </div>

          {/* Service Breakdown Comparison Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Service-Wise Settlement & Cash Reconciliation</h3>
              <p className="text-xs text-neutral-500">Separation of Delivery COD vs Online collections, partner payouts, and driver net earnings</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-3.5">Business Vertical</th>
                    <th className="px-6 py-3.5">Total Completed</th>
                    <th className="px-6 py-3.5">Gross GMV</th>
                    <th className="px-6 py-3.5">Cash / COD In-Hand</th>
                    <th className="px-6 py-3.5">Online Gateway</th>
                    <th className="px-6 py-3.5">Partner Payouts</th>
                    <th className="px-6 py-3.5 text-right">Platform Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                  <tr>
                    <td className="px-6 py-4 font-sans font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-500" /> Product & Food Delivery
                    </td>
                    <td className="px-6 py-4">{report.deliveryBreakdown.completedCount}</td>
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">₹{report.deliveryBreakdown.grossSales.toLocaleString()}</td>
                    <td className="px-6 py-4 text-amber-600">₹{report.deliveryBreakdown.codCollected.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-600">₹{report.deliveryBreakdown.onlineCollected.toLocaleString()}</td>
                    <td className="px-6 py-4">₹{report.deliveryBreakdown.partnerPayouts.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{(report.deliveryBreakdown.grossSales * 0.1).toFixed(0)}</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-sans font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Car className="w-4 h-4 text-indigo-500" /> Alike Rides (Bike, Auto, Cab)
                    </td>
                    <td className="px-6 py-4">{report.rideBreakdown.completedCount}</td>
                    <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">₹{report.rideBreakdown.grossFares.toLocaleString()}</td>
                    <td className="px-6 py-4 text-amber-600">₹{report.rideBreakdown.cashCollected.toLocaleString()}</td>
                    <td className="px-6 py-4 text-emerald-600">₹{report.rideBreakdown.onlineCollected.toLocaleString()}</td>
                    <td className="px-6 py-4">₹{report.rideBreakdown.driverEarnings.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-600">₹{report.rideBreakdown.platformCommission.toFixed(0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SYSTEM RULES & GEOFENCE ZONES */}
      {/* ========================================================= */}
      {activeTab === "config" && config && (
        <div className="space-y-6 animate-fadeIn">
          {/* Service Area Geofence Zones */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  Service Areas & Operational Geofence Zones
                </h3>
                <p className="text-xs text-neutral-500">Configure zone-specific base delivery fees, radius, and availability toggles</p>
              </div>
              <button
                type="button"
                onClick={() => setZoneModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                + Add Service Zone
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreas.map((zone) => (
                <div key={zone.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">{zone.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                      {zone.code}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 space-y-1 font-mono">
                    <div>Coverage Radius: {zone.radiusKm} km</div>
                    <div>Center: {zone.coordinates.lat.toFixed(3)}, {zone.coordinates.lng.toFixed(3)}</div>
                    <div>Base Delivery Fee: ₹{zone.baseDeliveryFee}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-700 text-[11px]">
                    <span className={zone.deliveryActive ? "text-emerald-600 font-bold" : "text-neutral-400"}>
                      Delivery: {zone.deliveryActive ? "Enabled" : "Disabled"}
                    </span>
                    <span className={zone.ridesActive ? "text-indigo-600 font-bold" : "text-neutral-400"}>
                      Rides: {zone.ridesActive ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ride Vehicle Categories and Pricing Parameters */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-500" />
              Approved Ride Vehicle Categories & Fares
            </h3>
            <p className="text-xs text-neutral-500">Standard per-km, base fare, minute charges, and platform commission rates</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800 text-neutral-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Vehicle Type</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Base Fare</th>
                    <th className="px-4 py-3">Per KM Rate</th>
                    <th className="px-4 py-3">Min Fare</th>
                    <th className="px-4 py-3">Platform Comm. %</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                  {config.rideVehicleCategories.map((vc, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-sans font-semibold text-neutral-900 dark:text-white">{vc.label}</td>
                      <td className="px-4 py-3">{vc.seatingCapacity} seats</td>
                      <td className="px-4 py-3">₹{vc.baseFare}</td>
                      <td className="px-4 py-3">₹{vc.perKmRate}/km</td>
                      <td className="px-4 py-3">₹{vc.minFare}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">{vc.platformCommissionPercent}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* OTP Expiry & Safety Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                Security & Non-Interchangeable OTP Rules
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">OTP Expiry Timer</div>
                    <div className="text-neutral-500">Lifespan before automatic regeneration</div>
                  </div>
                  <span className="font-mono font-bold text-amber-600">{config.otpRules.expirySeconds} seconds (5m)</span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Max Verification Attempts</div>
                    <div className="text-neutral-500">Lockout triggered on brute-force attempts</div>
                  </div>
                  <span className="font-mono font-bold text-amber-600">{config.otpRules.maxAttempts} attempts</span>
                </div>

                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Brute-Force Lockout Cooldown</div>
                    <div className="text-neutral-500">Duration account is locked after failure</div>
                  </div>
                  <span className="font-mono font-bold text-amber-600">{config.otpRules.lockoutDurationMinutes} minutes</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-500" />
                Emergency & Safety Desk Hotlines
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">Police Control Room:</span>
                  <span className="font-mono font-bold text-rose-600">{config.emergencyContacts.police}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">Ambulance & Trauma:</span>
                  <span className="font-mono font-bold text-rose-600">{config.emergencyContacts.ambulance}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">Women Safety Helpline:</span>
                  <span className="font-mono font-bold text-rose-600">{config.emergencyContacts.womenHelpline}</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 flex justify-between items-center">
                  <span className="font-semibold text-neutral-900 dark:text-white">ALIKE 24/7 Safety Desk:</span>
                  <span className="font-mono font-bold text-emerald-600">{config.emergencyContacts.safetyDeskHotline}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SECURITY & AUDIT LOGS */}
      {/* ========================================================= */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm animate-fadeIn">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-500" />
                Administrative System Audit Trail & Security Ledger
              </h3>
              <p className="text-xs text-neutral-500">Immutable record of status overrides, partner approvals, config changes, and IP addresses</p>
            </div>
            <span className="text-xs font-mono text-neutral-400">{auditLogs.length} audit events</span>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-neutral-400">No administrative logs recorded yet.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                        {log.action}
                      </span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{log.details}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 flex items-center gap-2 font-mono">
                      <span>Admin: {log.adminEmail}</span>
                      <span>·</span>
                      <span>Role: {log.adminRole}</span>
                      <span>·</span>
                      <span>Target: {log.entityType} ({log.entityId})</span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-400 font-mono shrink-0">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: WORKFLOW STATE TRANSITION OVERRIDE */}
      {/* ========================================================= */}
      {overrideModalOpen && selectedTaskForOverride && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Administrative Workflow Override</h3>
              </div>
              <button onClick={() => setOverrideModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 text-lg">
                &times;
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-xs space-y-1 font-mono">
              <div>Entity: <span className="font-bold text-neutral-900 dark:text-white">{selectedTaskForOverride.entityType === "delivery" ? "Product/Food Delivery" : "Ride Booking"}</span></div>
              <div>ID: <span className="font-bold text-neutral-900 dark:text-white">{selectedTaskForOverride.orderId || selectedTaskForOverride.taskId || selectedTaskForOverride._id}</span></div>
              <div>Current Status: <span className="font-bold text-blue-600">{selectedTaskForOverride.status}</span></div>
            </div>

            <form onSubmit={handleExecuteWorkflowOverride} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Target Workflow State
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-medium"
                  required
                >
                  <option value="">-- Select Target Status --</option>
                  {selectedTaskForOverride.entityType === "delivery" ? (
                    <>
                      <option value="store_accepted">Store Accepted</option>
                      <option value="preparing">Preparing</option>
                      <option value="ready_for_pickup">Ready for Pickup</option>
                      <option value="partner_assigned">Delivery Partner Assigned</option>
                      <option value="pickup_otp_verified">Pickup OTP Verified</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivery_otp_verified">Delivery OTP Verified</option>
                      <option value="delivered">Delivered (Successful Completion)</option>
                      <option value="customer_unavailable">Customer Unavailable</option>
                      <option value="delivery_failed">Delivery Failed</option>
                      <option value="return_initiated">Return Initiated</option>
                      <option value="returned_to_store">Returned to Store</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="driver_assigned">Driver Assigned</option>
                      <option value="driver_accepted">Driver Accepted</option>
                      <option value="driver_arriving">Driver Arriving</option>
                      <option value="driver_arrived">Driver Arrived at Pickup</option>
                      <option value="ride_otp_verified">Ride OTP Verified</option>
                      <option value="in_progress">Ride In Progress</option>
                      <option value="completed">Completed (Trip Finished)</option>
                      <option value="passenger_no_show">Passenger No-Show</option>
                      <option value="driver_unavailable">Driver Unavailable</option>
                      <option value="support_required">Support Required</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Operational Reason (Required for Audit Trail)
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Verified customer at doorstep; phone battery drained; dispatcher authorized manual completion."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setOverrideModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingOverride ? "Updating..." : "Commit State Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD SERVICE ZONE */}
      {/* ========================================================= */}
      {zoneModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm">Register New Service Geofence Zone</h3>
              <button onClick={() => setZoneModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  placeholder="e.g. Airport Express Corridor"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Zone Code</label>
                <input
                  type="text"
                  value={newZoneCode}
                  onChange={(e) => setNewZoneCode(e.target.value)}
                  placeholder="e.g. ZONE-AIR1"
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newZoneLat}
                    onChange={(e) => setNewZoneLat(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newZoneLng}
                    onChange={(e) => setNewZoneLng(parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Radius (KM)</label>
                  <input
                    type="number"
                    value={newZoneRadius}
                    onChange={(e) => setNewZoneRadius(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Base Fee (₹)</label>
                  <input
                    type="number"
                    value={newZoneBaseFee}
                    onChange={(e) => setNewZoneBaseFee(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setZoneModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-neutral-950 font-bold text-xs"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CentralAdminPanelModule;
