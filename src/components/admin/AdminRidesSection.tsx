import React, { useState, useEffect } from "react";
import {
  Car,
  Bike,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Clock,
  DollarSign,
  MapPin,
  TrendingUp,
  Settings,
  Filter,
  Check,
  Power,
  User,
  Zap,
  Users,
  Award,
  AlertTriangle,
  FileText,
  ShieldAlert,
  UserCheck,
  PackageSearch,
  ExternalLink,
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";

interface DriverItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel?: string;
  seatingCapacity?: number;
  licenseNumberMasked?: string;
  licenseNumber?: string;
  licenseStatus?: string;
  licenseExpiryDate?: string;
  aadhaarNumberMasked?: string;
  identityStatus?: string;
  rcNumber?: string;
  rcStatus?: string;
  insurancePolicyNumber?: string;
  insuranceStatus?: string;
  permitStatus?: string;
  bankDetails?: {
    accountNumberMasked?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
  };
  status: "pending" | "approved" | "suspended" | "rejected";
  isOnline: boolean;
  rating: number;
  totalRides: number;
  earningsToday: number;
  totalEarnings: number;
  createdAt: string;
}

interface RideItem {
  _id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  pickup: { address: string; lat?: number; lng?: number };
  destination: { address: string; lat?: number; lng?: number };
  distanceKm: number;
  fare: { totalFare: number };
  status: string;
  rideOtp: string;
  driver?: {
    driverId?: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    vehicleModel?: string;
  };
  createdAt: string;
}

interface CategoryConfig {
  key: string;
  name: string;
  tagline: string;
  capacity: number;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  enabled: boolean;
  legalNote?: string;
}

interface DisputeItem {
  disputeId: string;
  bookingId: string;
  customerName?: string;
  customerPhone?: string;
  serviceType?: string;
  totalFare?: number;
  reason: string;
  comments?: string;
  claimedAmount?: number;
  refundAmount?: number;
  status: "under_review" | "resolved" | "rejected";
  resolutionNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface SafetyIncidentItem {
  incidentId: string;
  type: "sos" | "accident" | "complaint" | "lost_item";
  rideId: string;
  customerName?: string;
  customerPhone?: string;
  driverName?: string;
  driverPhone?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export const AdminRidesSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"drivers" | "rides" | "categories" | "disputes" | "safety">("drivers");
  const [driverFilter, setDriverFilter] = useState<"all" | "pending" | "approved" | "suspended">("all");
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [rides, setRides] = useState<RideItem[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [safetyIncidents, setSafetyIncidents] = useState<SafetyIncidentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Dispute resolution state
  const [resolvingDispute, setResolvingDispute] = useState<DisputeItem | null>(null);
  const [refundAmountInput, setRefundAmountInput] = useState<number>(0);
  const [adjustmentNotesInput, setAdjustmentNotesInput] = useState<string>("");

  // Inspect Driver Documents state
  const [inspectingDriver, setInspectingDriver] = useState<DriverItem | null>(null);

  // Manual Driver Assignment state
  const [assigningRide, setAssigningRide] = useState<RideItem | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Fetch Drivers
  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const qs = driverFilter !== "all" ? `?status=${driverFilter}` : "";
      const res = await fetch(`/api/admin/rides/drivers${qs}`, {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
      }
    } catch (e) {
      console.error("Failed to load drivers:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Rides
  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rides/list", {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRides(data.rides || []);
      }
    } catch (e) {
      console.error("Failed to load rides:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rides/categories", {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Disputes
  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rides/disputes", {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDisputes(data.disputes || []);
      }
    } catch (e) {
      console.error("Failed to load disputes:", e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Safety Incidents
  const fetchSafetyIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/rides/safety-incidents", {
        headers: { Authorization: `Bearer ${adminApi.getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSafetyIncidents(data.incidents || []);
      }
    } catch (e) {
      console.error("Failed to load safety incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "drivers") {
      fetchDrivers();
    } else if (activeTab === "rides") {
      fetchRides();
    } else if (activeTab === "categories") {
      fetchCategories();
    } else if (activeTab === "disputes") {
      fetchDisputes();
    } else if (activeTab === "safety") {
      fetchSafetyIncidents();
    }
  }, [activeTab, driverFilter]);

  // Update Driver Status (Approve / Suspend / Reject)
  const handleUpdateDriverStatus = async (driverId: string, targetStatus: string) => {
    setActionLoadingId(driverId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rides/drivers/${driverId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update driver status");

      setDrivers((prev) =>
        prev.map((d) => (d._id === driverId ? { ...d, status: targetStatus as any } : d))
      );
      setMessage({ text: `Driver successfully marked as ${targetStatus}.`, type: "success" });
      if (inspectingDriver && inspectingDriver._id === driverId) {
        setInspectingDriver((prev) => (prev ? { ...prev, status: targetStatus as any } : null));
      }
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update driver status", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle Category Availability
  const handleToggleCategory = async (key: string, currentEnabled: boolean) => {
    setActionLoadingId(key);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rides/categories/${key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle category");

      setCategories((prev) =>
        prev.map((cat) => (cat.key === key ? { ...cat, enabled: !currentEnabled } : cat))
      );
      setMessage({
        text: `Vehicle category ${key} ${!currentEnabled ? "enabled" : "disabled"}.`,
        type: "success",
      });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to toggle category", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update Category Fares
  const handleSaveCategoryFares = async (cat: CategoryConfig) => {
    setActionLoadingId(cat.key);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rides/categories/${cat.key}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({
          baseFare: cat.baseFare,
          perKmRate: cat.perKmRate,
          perMinuteRate: cat.perMinuteRate,
          minimumFare: cat.minimumFare,
          enabled: cat.enabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category fares");

      setMessage({ text: `Fares updated for ${cat.name}!`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update fares", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async (status: "resolved" | "rejected") => {
    if (!resolvingDispute) return;
    setActionLoadingId(resolvingDispute.disputeId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rides/disputes/${resolvingDispute.disputeId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({
          status,
          refundAmount: status === "resolved" ? refundAmountInput : 0,
          adjustmentNotes: adjustmentNotesInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve dispute");

      setDisputes((prev) =>
        prev.map((d) =>
          d.disputeId === resolvingDispute.disputeId
            ? {
                ...d,
                status,
                refundAmount: status === "resolved" ? refundAmountInput : 0,
                resolutionNotes: adjustmentNotesInput,
                resolvedAt: new Date().toISOString(),
              }
            : d
        )
      );
      setMessage({
        text: `Dispute ${resolvingDispute.disputeId} marked as ${status}.`,
        type: "success",
      });
      setResolvingDispute(null);
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to resolve dispute", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Resolve Safety Incident (Module 2I.10)
  const handleResolveIncident = async (incidentId: string) => {
    setActionLoadingId(incidentId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/rides/safety-incidents/${incidentId}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({ status: "resolved", resolutionNotes: "Audited and resolved by Admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve incident");

      setSafetyIncidents((prev) =>
        prev.map((i) => (i.incidentId === incidentId ? { ...i, status: "resolved" } : i))
      );
      setMessage({ text: `Safety incident ${incidentId} marked as resolved.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to resolve incident", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manual Driver Assignment (Module 2F.7)
  const handleManualAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRide || !selectedDriverId) return;
    setActionLoadingId(assigningRide.bookingId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/rides/${assigningRide.bookingId}/assign-driver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminApi.getToken()}`,
        },
        body: JSON.stringify({ driverId: selectedDriverId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to assign driver");

      setRides((prev) =>
        prev.map((r) =>
          r.bookingId === assigningRide.bookingId ? { ...r, status: "arriving", driver: data.ride?.driver } : r
        )
      );
      setMessage({ text: `Driver assigned to ride ${assigningRide.bookingId} successfully!`, type: "success" });
      setAssigningRide(null);
      setSelectedDriverId("");
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to assign driver", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = drivers.filter((d) => d.status === "pending").length;
  const underReviewDisputesCount = disputes.filter((d) => d.status === "under_review").length;
  const activeIncidentsCount = safetyIncidents.filter((i) => i.status === "active" || i.status === "open").length;

  const filteredDrivers = drivers.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.vehicleNumber.toLowerCase().includes(q) ||
      d.vehicleType.toLowerCase().includes(q)
    );
  });

  const getVehicleIcon = (key: string) => {
    switch (key) {
      case "bike":
        return <Bike className="w-5 h-5 text-amber-400" />;
      case "auto":
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case "car_suv":
        return <Users className="w-5 h-5 text-purple-400" />;
      case "car_premium":
        return <Award className="w-5 h-5 text-amber-300" />;
      case "car_xl":
        return <Users className="w-5 h-5 text-blue-400" />;
      case "car_green":
        return <Zap className="w-5 h-5 text-teal-400" />;
      default:
        return <Car className="w-5 h-5 text-neutral-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Alike Rides & Captain Operations</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono uppercase font-bold border border-emerald-500/30">
                Phase 6 Active
              </span>
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Captain Verifications • Manual Dispatch • Live Tracking • SOS Safety Desk
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black border border-neutral-800 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("drivers")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "drivers"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Captains</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[9px] font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rides")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "rides"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("safety")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "safety"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Safety Desk</span>
            {activeIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                {activeIncidentsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "categories"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Fares</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("disputes")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "disputes"
                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Disputes</span>
            {underReviewDisputesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                {underReviewDisputesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-neutral-400 hover:text-white cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: DRIVERS / CAPTAINS (Module 2E) */}
      {activeTab === "drivers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search captain by name, phone, plate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono text-white placeholder-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {(["all", "pending", "approved", "suspended"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setDriverFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase font-mono transition-all cursor-pointer ${
                    driverFilter === filter
                      ? "bg-white text-black font-bold shadow"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button
                onClick={fetchDrivers}
                disabled={loading}
                className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Refresh Drivers"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Captain Details</th>
                    <th className="py-3.5 px-4 font-bold">Vehicle Class</th>
                    <th className="py-3.5 px-4 font-bold">Verification Status</th>
                    <th className="py-3.5 px-4 font-bold">Duty Status</th>
                    <th className="py-3.5 px-4 font-bold">Performance</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        Loading captain partners...
                      </td>
                    </tr>
                  ) : filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-500">
                        No captains matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <tr key={driver._id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-black text-white text-xs">{driver.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">{driver.phone}</div>
                          {driver.licenseNumberMasked && (
                            <div className="text-[10px] text-neutral-500 font-mono">
                              DL: {driver.licenseNumberMasked}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-300">
                              {driver.vehicleType}
                            </span>
                            <span className="font-mono font-bold text-white text-[11px]">
                              {driver.vehicleNumber}
                            </span>
                          </div>
                          {driver.vehicleModel && (
                            <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                              {driver.vehicleModel} ({driver.seatingCapacity || 4} seats)
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                driver.status === "approved"
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                  : driver.status === "pending"
                                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                  : driver.status === "suspended"
                                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                                  : "bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              {driver.status === "approved" && <Check className="w-3 h-3" />}
                              {driver.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => setInspectingDriver(driver)}
                              className="text-[10px] font-mono text-neutral-400 hover:text-white block underline cursor-pointer"
                            >
                              Inspect Docs
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                driver.isOnline ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"
                              }`}
                            />
                            <span className="text-[11px] text-neutral-300 font-bold">
                              {driver.isOnline ? "On Duty" : "Offline"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            ★ {(driver.rating || 4.9).toFixed(1)}
                            <span className="text-neutral-500 font-normal">
                              ({driver.totalRides || 0} rides)
                            </span>
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            ₹{driver.totalEarnings || 0} total
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {driver.status === "pending" && (
                              <button
                                onClick={() => handleUpdateDriverStatus(driver._id, "approved")}
                                disabled={actionLoadingId === driver._id}
                                className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-sm transition-all"
                              >
                                Approve
                              </button>
                            )}
                            {driver.status === "approved" && (
                              <button
                                onClick={() => handleUpdateDriverStatus(driver._id, "suspended")}
                                disabled={actionLoadingId === driver._id}
                                className="px-3 py-1 rounded-xl bg-neutral-900 hover:bg-rose-950 border border-neutral-800 hover:border-rose-800 text-rose-400 font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                              >
                                Suspend
                              </button>
                            )}
                            {driver.status === "suspended" && (
                              <button
                                onClick={() => handleUpdateDriverStatus(driver._id, "approved")}
                                disabled={actionLoadingId === driver._id}
                                className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[10px] uppercase tracking-wider cursor-pointer hover:bg-emerald-500/30 transition-all"
                              >
                                Reinstate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RIDE BOOKINGS & MANUAL DISPATCH (Module 2F.7) */}
      {activeTab === "rides" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div>
              <h3 className="text-sm font-black text-white">Live Customer Ride Bookings & Dispatch</h3>
              <p className="text-xs text-neutral-400">Auto-matching and manual driver assignment controls.</p>
            </div>
            <button
              onClick={fetchRides}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Booking ID</th>
                    <th className="py-3.5 px-4 font-bold">Passenger</th>
                    <th className="py-3.5 px-4 font-bold">Vehicle Class</th>
                    <th className="py-3.5 px-4 font-bold">Route</th>
                    <th className="py-3.5 px-4 font-bold">Distance & Fare</th>
                    <th className="py-3.5 px-4 font-bold">OTP</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Assigned Driver</th>
                    <th className="py-3.5 px-4 font-bold text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-500">
                        Loading rides...
                      </td>
                    </tr>
                  ) : rides.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-500">
                        No ride bookings placed yet.
                      </td>
                    </tr>
                  ) : (
                    rides.map((r) => (
                      <tr key={r._id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{r.bookingId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{r.customerName}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{r.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {r.serviceType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-neutral-400">
                          {r.pickup?.address} → {r.destination?.address}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-emerald-400">₹{r.fare?.totalFare}</span>
                          <span className="text-[10px] text-neutral-500 block">{r.distanceKm} km</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-amber-400 tracking-wider">
                          {r.rideOtp || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px]">
                          {r.driver?.name ? (
                            <div>
                              <div className="font-bold text-white">{r.driver.name}</div>
                              <div className="font-mono text-[10px] text-neutral-500">
                                {r.driver.vehicleNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-500 font-mono">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {["requested", "no_driver_found", "searching"].includes(r.status) && (
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningRide(r);
                                const available = drivers.find((d) => d.status === "approved" && d.isOnline);
                                if (available) setSelectedDriverId(available._id);
                              }}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase font-mono cursor-pointer transition-all"
                            >
                              Assign Driver
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY DESK & SOS INCIDENTS (Module 2I.10) */}
      {activeTab === "safety" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Central Safety Desk & Emergency Alarms</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Audited records of SOS triggers, vehicle breakdowns/accidents, passenger complaints, and lost-item tickets.
              </p>
            </div>
            <button
              onClick={fetchSafetyIncidents}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Incident ID</th>
                    <th className="py-3.5 px-4 font-bold">Type</th>
                    <th className="py-3.5 px-4 font-bold">Ride Ref</th>
                    <th className="py-3.5 px-4 font-bold">Parties Involved</th>
                    <th className="py-3.5 px-4 font-bold">Details / Notes</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        Loading safety alerts...
                      </td>
                    </tr>
                  ) : safetyIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500">
                        No critical safety incidents or SOS alarms logged.
                      </td>
                    </tr>
                  ) : (
                    safetyIncidents.map((incident) => (
                      <tr key={incident.incidentId} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{incident.incidentId}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                              incident.type === "sos"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                                : incident.type === "accident"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                                : incident.type === "lost_item"
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                                : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                            }`}
                          >
                            {incident.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{incident.rideId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{incident.customerName || "Customer"}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">Captain: {incident.driverName || "Assigned"}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-neutral-300 text-xs">
                          {incident.notes || "Emergency reported"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              incident.status === "resolved" || incident.status === "closed"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                            }`}
                          >
                            {incident.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {incident.status !== "resolved" && incident.status !== "closed" && (
                            <button
                              type="button"
                              onClick={() => handleResolveIncident(incident.incidentId)}
                              disabled={actionLoadingId === incident.incidentId}
                              className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase cursor-pointer transition-all"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VEHICLE CATEGORIES & DYNAMIC PRICING (Module 2A & 2C) */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>8 Vehicle Classes & Fare Parameters</span>
                </h3>
                <p className="text-xs text-neutral-400">
                  Configure local category availability and rate matrices. Rates are calculated server-side.
                </p>
              </div>
              <button
                onClick={fetchCategories}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Reload</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.key}
                className={`p-5 rounded-3xl border transition-all space-y-4 ${
                  cat.enabled
                    ? "bg-neutral-950 border-neutral-800 shadow-lg shadow-black/40"
                    : "bg-neutral-950/60 border-neutral-900 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                      {getVehicleIcon(cat.key)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-white text-sm">{cat.name}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400">
                          {cat.capacity} {cat.capacity === 1 ? "seat" : "seats"}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">{cat.tagline}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCategory(cat.key, cat.enabled)}
                    disabled={actionLoadingId === cat.key}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer transition-all ${
                      cat.enabled
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-neutral-900 border border-neutral-800 text-neutral-500 hover:text-white"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{cat.enabled ? "Active" : "Disabled"}</span>
                  </button>
                </div>

                {cat.legalNote && (
                  <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
                    ⚠️ {cat.legalNote}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-neutral-900">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                      Base (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={cat.baseFare}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCategories((prev) =>
                          prev.map((c) => (c.key === cat.key ? { ...c, baseFare: val } : c))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                      Per KM (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={cat.perKmRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCategories((prev) =>
                          prev.map((c) => (c.key === cat.key ? { ...c, perKmRate: val } : c))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                      Per Min (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={cat.perMinuteRate}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCategories((prev) =>
                          prev.map((c) => (c.key === cat.key ? { ...c, perMinuteRate: val } : c))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-neutral-400 uppercase font-mono">
                      Min Fare (₹)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={cat.minimumFare}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCategories((prev) =>
                          prev.map((c) => (c.key === cat.key ? { ...c, minimumFare: val } : c))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveCategoryFares(cat)}
                  disabled={actionLoadingId === cat.key}
                  className="w-full py-2 rounded-xl bg-neutral-900 hover:bg-emerald-500 hover:text-black border border-neutral-800 text-white font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all disabled:opacity-50"
                >
                  {actionLoadingId === cat.key ? "Saving..." : `Update ${cat.name} Fares`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FARE DISPUTES & ADJUSTMENTS */}
      {activeTab === "disputes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div>
              <h3 className="text-sm font-black text-white">Ride Fare Disputes & Adjustments</h3>
              <p className="text-xs text-neutral-400">
                Audited GPS records, passenger route contestations, and approved refund settlements.
              </p>
            </div>
            <button
              onClick={fetchDisputes}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Dispute ID</th>
                    <th className="py-3.5 px-4 font-bold">Booking Ref</th>
                    <th className="py-3.5 px-4 font-bold">Passenger Details</th>
                    <th className="py-3.5 px-4 font-bold">Reason & Comments</th>
                    <th className="py-3.5 px-4 font-bold">Total Fare</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold">Resolution</th>
                    <th className="py-3.5 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 font-sans">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        Loading disputes...
                      </td>
                    </tr>
                  ) : disputes.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-neutral-500">
                        No fare disputes filed yet. All rides settled normally.
                      </td>
                    </tr>
                  ) : (
                    disputes.map((d) => (
                      <tr key={d.disputeId} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{d.disputeId}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{d.bookingId}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-xs">{d.customerName || "Customer"}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{d.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-bold text-white capitalize text-xs">
                            {d.reason?.replace(/_/g, " ")}
                          </div>
                          {d.comments && (
                            <div className="text-[10px] text-neutral-400 italic mt-0.5 line-clamp-2">
                              "{d.comments}"
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ₹{d.totalFare || d.claimedAmount || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              d.status === "resolved"
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                : d.status === "rejected"
                                ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                                : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[11px] max-w-xs">
                          {d.status === "resolved" ? (
                            <div>
                              <span className="font-mono font-bold text-emerald-400">
                                Refund: ₹{d.refundAmount || 0}
                              </span>
                              {d.resolutionNotes && (
                                <p className="text-[10px] text-neutral-400">{d.resolutionNotes}</p>
                              )}
                            </div>
                          ) : d.status === "rejected" ? (
                            <span className="text-neutral-500 font-mono text-[10px]">Claim Denied</span>
                          ) : (
                            <span className="text-amber-400 font-mono text-[10px]">Awaiting Audit</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {d.status === "under_review" && (
                            <button
                              onClick={() => {
                                setResolvingDispute(d);
                                setRefundAmountInput(d.totalFare ? Math.min(d.totalFare, 50) : 0);
                                setAdjustmentNotesInput("Fare adjusted based on GPS route inspection.");
                              }}
                              className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider cursor-pointer transition-all"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT DRIVER DOCUMENTS MODAL */}
      {inspectingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Captain Verification Dossier</span>
              </h3>
              <button onClick={() => setInspectingDriver(null)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-neutral-900 space-y-1">
                <div className="flex justify-between"><span className="text-neutral-400">Captain Name:</span><span className="text-white font-bold">{inspectingDriver.name}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Mobile Phone:</span><span className="text-white">{inspectingDriver.phone}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Vehicle Class:</span><span className="text-emerald-400 uppercase font-bold">{inspectingDriver.vehicleType}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Plate Number:</span><span className="text-white font-bold">{inspectingDriver.vehicleNumber}</span></div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900 space-y-1.5">
                <div className="flex justify-between"><span className="text-neutral-400">Driving Licence:</span><span className="text-white">{inspectingDriver.licenseNumber || inspectingDriver.licenseNumberMasked}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Licence Status:</span><span className="text-emerald-400 uppercase">{inspectingDriver.licenseStatus || 'verified'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Aadhaar ID:</span><span className="text-white">{inspectingDriver.aadhaarNumberMasked || 'XXXX-XXXX-8821'}</span></div>
                <div className="flex justify-between"><span className="text-neutral-400">Insurance Status:</span><span className="text-emerald-400 uppercase">{inspectingDriver.insuranceStatus || 'valid'}</span></div>
              </div>

              {inspectingDriver.bankDetails && (
                <div className="p-3 rounded-2xl bg-neutral-900 space-y-1">
                  <div className="flex justify-between"><span className="text-neutral-400">Bank Account:</span><span className="text-white">{inspectingDriver.bankDetails.accountNumberMasked || '*****9012'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">IFSC Code:</span><span className="text-white">{inspectingDriver.bankDetails.ifscCode || 'HDFC0001234'}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-400">Instant UPI:</span><span className="text-emerald-400 font-bold">{inspectingDriver.bankDetails.upiId || 'driver@upi'}</span></div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleUpdateDriverStatus(inspectingDriver._id, "suspended")}
                className="py-2.5 rounded-xl bg-neutral-900 hover:bg-rose-950 border border-neutral-800 text-rose-400 font-black text-xs uppercase"
              >
                Suspend Captain
              </button>
              <button
                type="button"
                onClick={() => handleUpdateDriverStatus(inspectingDriver._id, "approved")}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase shadow-lg shadow-emerald-500/20"
              >
                Approve & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DRIVER ASSIGNMENT MODAL (Module 2F.7) */}
      {assigningRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleManualAssign} className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Manual Captain Assignment</span>
              </h3>
              <button type="button" onClick={() => setAssigningRide(null)} className="text-neutral-500 hover:text-white">✕</button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900 text-xs font-mono space-y-1">
              <div className="flex justify-between"><span className="text-neutral-400">Ride Booking:</span><span className="text-white font-bold">{assigningRide.bookingId}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Service Category:</span><span className="text-emerald-400 uppercase font-bold">{assigningRide.serviceType}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Pickup:</span><span className="text-white truncate max-w-[200px]">{assigningRide.pickup?.address}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">Select Available Captain</label>
              <select
                required
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Approved Captain --</option>
                {drivers
                  .filter((d) => d.status === "approved")
                  .map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.vehicleType.toUpperCase()} - {d.vehicleNumber}) {d.isOnline ? "• ONLINE" : "• OFFLINE"}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAssigningRide(null)}
                className="py-2.5 rounded-xl bg-neutral-800 text-neutral-300 font-bold text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoadingId === assigningRide.bookingId || !selectedDriverId}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20"
              >
                Assign Captain Now
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-black text-white">
                  Resolve Dispute: {resolvingDispute.disputeId}
                </h3>
              </div>
              <button
                onClick={() => setResolvingDispute(null)}
                className="text-neutral-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-400">Ride Booking:</span>
                <span className="text-white font-bold">{resolvingDispute.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reason:</span>
                <span className="text-amber-400 font-bold capitalize">
                  {resolvingDispute.reason?.replace(/_/g, " ")}
                </span>
              </div>
              {resolvingDispute.totalFare && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Billed:</span>
                  <span className="text-white font-bold">₹{resolvingDispute.totalFare}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">
                  Refund / Credit Adjustment (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  max={resolvingDispute.totalFare || 9999}
                  value={refundAmountInput}
                  onChange={(e) => setRefundAmountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs font-mono font-bold text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-400 uppercase font-mono">
                  Resolution Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={adjustmentNotesInput}
                  onChange={(e) => setAdjustmentNotesInput(e.target.value)}
                  placeholder="Reason for adjustment or decision..."
                  className="w-full px-3 py-2 rounded-xl bg-black border border-neutral-800 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleResolveDispute("rejected")}
                disabled={actionLoadingId === resolvingDispute.disputeId}
                className="py-2.5 rounded-xl bg-neutral-900 hover:bg-rose-950 border border-neutral-800 hover:border-rose-800 text-rose-400 font-black text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleResolveDispute("resolved")}
                disabled={actionLoadingId === resolvingDispute.disputeId}
                className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
              >
                Approve & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRidesSection;
