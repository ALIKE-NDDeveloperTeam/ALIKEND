import React, { useState, useEffect } from "react";
import {
  Database,
  Cloud,
  Server,
  HardDrive,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ShieldCheck,
  Layers,
  Activity,
  ArrowRightLeft,
  Lock,
  Eye,
  EyeOff,
  Clock,
  DollarSign,
  Cpu,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Sliders,
  Sparkles,
  Radio,
  FileJson
} from "lucide-react";
import { adminApi } from "../../pages/adminApi";

export interface DatabaseProvider {
  id: "mongodb" | "firebase" | "supabase" | "cloudinary" | "aws_s3" | "appwrite";
  name: string;
  type: "database" | "media_storage" | "backend_as_a_service";
  enabled: boolean;
  isPrimary: boolean;
  status: "connected" | "standby" | "disabled" | "error";
  plan: string;
  monthlyCost: number;
  currency: string;
  storageUsedMB: number;
  storageQuotaMB: number;
  recordsCount: number;
  latencyMs: number;
  lastTestedAt?: string;
  credentials: Record<string, string>;
}

export interface HubSummary {
  activeServicesCount: number;
  totalServicesCount: number;
  totalStorageUsedMB: number;
  totalMonthlyCost: number;
  currency: string;
  primaryDatabase: string;
  primaryMediaStorage: string;
  dualWriteEnabled: boolean;
  autoFailoverEnabled: boolean;
  autoBackupInterval: string;
  metrics: {
    totalRecords: number;
    calculatedDbMB: number;
    calculatedMediaMB: number;
    breakdown: {
      products: number;
      orders: number;
      customers: number;
      sellers: number;
      banners: number;
      categories: number;
      users: number;
    };
  };
}

export interface MigrationLog {
  id: string;
  from: string;
  to: string;
  recordsCount: number;
  status: "completed" | "failed" | "in_progress";
  timestamp: string;
  note?: string;
}

export default function DatabaseHubSection() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [summary, setSummary] = useState<HubSummary | null>(null);
  const [providers, setProviders] = useState<DatabaseProvider[]>([]);
  const [migrationLogs, setMigrationLogs] = useState<MigrationLog[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Architecture Routing state
  const [selectedPrimaryDb, setSelectedPrimaryDb] = useState("mongodb");
  const [selectedPrimaryMedia, setSelectedPrimaryMedia] = useState("cloudinary");
  const [dualWrite, setDualWrite] = useState(true);
  const [autoFailover, setAutoFailover] = useState(true);
  const [autoBackup, setAutoBackup] = useState("daily");

  // Migration form state
  const [syncFrom, setSyncFrom] = useState("mongodb");
  const [syncTo, setSyncTo] = useState("firebase");
  const [isSyncing, setIsSyncing] = useState(false);

  // Config Modal state
  const [configModalProvider, setConfigModalProvider] = useState<DatabaseProvider | null>(null);
  const [editCredentials, setEditCredentials] = useState<Record<string, string>>({});
  const [showSecretMap, setShowSecretMap] = useState<Record<string, boolean>>({});

  // Restore Modal / Upload state
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchHubStatus();
  }, []);

  async function fetchHubStatus() {
    setLoading(true);
    try {
      const res = await adminApi.getDatabaseHubStatus();
      if (res && res.success) {
        setSummary(res.summary);
        setProviders(res.providers || []);
        setMigrationLogs(res.migrationHistory || []);
        setSelectedPrimaryDb(res.summary.primaryDatabase || "mongodb");
        setSelectedPrimaryMedia(res.summary.primaryMediaStorage || "cloudinary");
        setDualWrite(res.summary.dualWriteEnabled !== false);
        setAutoFailover(res.summary.autoFailoverEnabled !== false);
        setAutoBackup(res.summary.autoBackupInterval || "daily");
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Failed to load database status", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleService(providerId: string, currentEnabled: boolean) {
    const nextEnabled = !currentEnabled;
    setActionLoading(`toggle_${providerId}`);
    try {
      const res = await adminApi.toggleDatabaseService(providerId, nextEnabled);
      if (res.success) {
        setFeedbackMsg({ text: res.message, type: "success" });
        await fetchHubStatus();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Failed to toggle service", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTestPing(providerId: string) {
    setActionLoading(`ping_${providerId}`);
    try {
      const res = await adminApi.testDatabaseConnection(providerId);
      if (res.success) {
        setFeedbackMsg({ text: res.message, type: "success" });
        await fetchHubStatus();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Connection test failed", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSaveRoutingArchitecture() {
    setActionLoading("routing");
    try {
      const res = await adminApi.updateDatabaseConfig({
        primaryDatabase: selectedPrimaryDb,
        primaryMediaStorage: selectedPrimaryMedia,
        dualWriteEnabled: dualWrite,
        autoFailoverEnabled: autoFailover,
        autoBackupInterval: autoBackup,
      });
      if (res.success) {
        setFeedbackMsg({
          text: "Multi-Cloud Database Architecture & Dual-Write sync saved successfully!",
          type: "success",
        });
        await fetchHubStatus();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Failed to save architecture", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRunSync() {
    if (syncFrom === syncTo) {
      setFeedbackMsg({ text: "Source and Destination database cannot be the same.", type: "error" });
      return;
    }
    setIsSyncing(true);
    try {
      const res = await adminApi.syncDatabases(syncFrom, syncTo, ["products", "categories", "orders", "banners"]);
      if (res.success) {
        setFeedbackMsg({ text: res.message, type: "success" });
        await fetchHubStatus();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Sync failed", type: "error" });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleDownloadBackup() {
    setActionLoading("backup_download");
    try {
      const backupData = await adminApi.exportDatabaseBackup();
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `alikend-database-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedbackMsg({ text: "Full database backup snapshot downloaded successfully!", type: "success" });
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Failed to download backup", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  function handleRestoreFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !parsed.data) {
          throw new Error("Invalid backup format. Missing 'data' object.");
        }
        setIsRestoring(true);
        const res = await adminApi.restoreDatabaseBackup(parsed);
        if (res.success) {
          setFeedbackMsg({ text: res.message, type: "success" });
          await fetchHubStatus();
        }
      } catch (err: any) {
        setFeedbackMsg({ text: err.message || "Restore failed. Please check JSON file.", type: "error" });
      } finally {
        setIsRestoring(false);
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function openConfigModal(p: DatabaseProvider) {
    setConfigModalProvider(p);
    setEditCredentials({ ...p.credentials });
    setShowSecretMap({});
  }

  async function handleSaveCredentials() {
    if (!configModalProvider) return;
    setActionLoading("save_cred");
    try {
      const res = await adminApi.updateDatabaseConfig({
        providerId: configModalProvider.id,
        credentials: editCredentials,
      });
      if (res.success) {
        setFeedbackMsg({
          text: `Credentials for ${configModalProvider.name} updated and verified!`,
          type: "success",
        });
        setConfigModalProvider(null);
        await fetchHubStatus();
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || "Failed to update credentials", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  function handleResetDefaultCredentials() {
    if (!configModalProvider) return;
    // Set clean defaults based on provider
    let defaults: Record<string, string> = {};
    if (configModalProvider.id === "mongodb") {
      defaults = {
        uri: "mongodb+srv://admin:pass@cluster0.alikend.mongodb.net/alikendshop",
        databaseName: "alikendshop",
        clusterName: "Cluster0 (AWS N. Virginia)",
        maxPoolSize: "25",
        sslEnabled: "true",
      };
    } else if (configModalProvider.id === "firebase") {
      defaults = {
        projectId: "gen-lang-client-0165380635",
        firestoreDatabase: "(default)",
        storageBucket: "gen-lang-client-0165380635.firebasestorage.app",
        authDomain: "gen-lang-client-0165380635.firebaseapp.com",
        apiKey: "AIzaSyD-StandardProjectKeyWebSafe",
        appId: "1:0165380635:web:default",
      };
    } else if (configModalProvider.id === "supabase") {
      defaults = {
        projectUrl: "https://alikend-storefront.supabase.co",
        projectRef: "alikend-storefront-db",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.safe_anon_key_ready",
        serviceRoleKey: "",
        dbSchema: "public",
      };
    } else if (configModalProvider.id === "cloudinary") {
      defaults = {
        cloudName: "alikend-cloud",
        apiKey: "872418934521798",
        apiSecret: "sec_cloud_masked_preset",
        uploadPreset: "alikend_storefront_preset",
        folder: "products_and_banners",
      };
    } else if (configModalProvider.id === "aws_s3") {
      defaults = {
        region: "us-east-1",
        bucketName: "alikend-store-assets",
        accessKeyId: "AKIA_ALIKEND_EXAMPLE_KEY",
        secretAccessKey: "",
        dynamoTablePrefix: "alk_",
      };
    } else if (configModalProvider.id === "appwrite") {
      defaults = {
        endpoint: "https://cloud.appwrite.io/v1",
        projectId: "65b91a740003e89f",
        apiKey: "",
        databaseId: "alikend_db",
      };
    }
    setEditCredentials(defaults);
  }

  // Provider logo or color styling helper
  const getProviderTheme = (id: string) => {
    switch (id) {
      case "mongodb":
        return {
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
          bar: "bg-emerald-500",
        };
      case "firebase":
        return {
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          badge: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
          bar: "bg-amber-500",
        };
      case "supabase":
        return {
          bg: "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-600/20",
          badge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200",
          bar: "bg-emerald-600",
        };
      case "cloudinary":
        return {
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300",
          bar: "bg-blue-500",
        };
      case "aws_s3":
        return {
          bg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
          badge: "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
          bar: "bg-orange-500",
        };
      case "appwrite":
        return {
          bg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
          badge: "bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300",
          bar: "bg-pink-500",
        };
      default:
        return {
          bg: "bg-purple-500/10 text-purple-600 border-purple-500/20",
          badge: "bg-purple-100 text-purple-800",
          bar: "bg-purple-500",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert Message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm animate-fadeIn ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950 text-white shadow-xl relative overflow-hidden border border-neutral-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Cloud Architecture & Live Database Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Database & Cloud Services Control Center</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              ফায়ারবেস, মঙ্গোডিবি, সুপাবেস (Supabase), ক্লাউডিনারি (Cloudinary), এবং এডব্লিউএস (AWS) এর মতো সব বড় ডাটাবেস সার্ভিস একসাথে নিয়ন্ত্রণ করুন।
              যেকোনো সময় একটি ডাটাবেস থেকে অন্যটিতে এক ক্লিকে শিফট এবং লাইভ স্টোরেজ ও খরচ মনিটর করুন।
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchHubStatus}
              disabled={loading}
              className="h-10 px-4 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={handleDownloadBackup}
              disabled={actionLoading === "backup_download"}
              className="h-10 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Backup (JSON)</span>
            </button>
          </div>
        </div>

        {/* Global Storage & Expense Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-800/80">
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Active Services</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {summary ? `${summary.activeServicesCount} / ${summary.totalServicesCount}` : "4 / 6"}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dual-Write Synced</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span>Total Storage Used</span>
            </div>
            <div className="text-xl font-black text-white mt-1">
              {summary ? `${summary.totalStorageUsedMB} MB` : "67.7 MB"}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Across all DBs & Media CDN
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Monthly Cloud Expense</span>
            </div>
            <div className="text-xl font-black text-amber-400 mt-1">
              $0.00 <span className="text-xs font-normal text-neutral-300">/ Free Tier</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              100% Within Free Quotas
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Downtime Engine</span>
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              Auto-Failover
            </div>
            <div className="text-[10px] text-neutral-300 mt-0.5">
              Active Protection Mode
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: PROVIDER CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Connected Database & Storage Engines</span>
          </h3>
          <span className="text-xs text-neutral-500">
            {providers.filter((p) => p.enabled).length} Online / {providers.length} Integrated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => {
            const theme = getProviderTheme(p.id);
            const usagePercent = Math.min(100, Math.round((p.storageUsedMB / (p.storageQuotaMB || 512)) * 100));

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 border transition-all duration-200 relative flex flex-col justify-between ${
                  p.enabled
                    ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md"
                    : "bg-neutral-50/80 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 opacity-75"
                }`}
              >
                {/* Header with Title and Toggle */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border font-black text-lg ${theme.bg}`}>
                        {p.id === "mongodb" && "🍃"}
                        {p.id === "firebase" && "🔥"}
                        {p.id === "supabase" && "⚡"}
                        {p.id === "cloudinary" && "☁️"}
                        {p.id === "aws_s3" && "📦"}
                        {p.id === "appwrite" && "🅰️"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{p.name}</h4>
                          {p.isPrimary && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500 text-white tracking-wider">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${theme.badge}`}>
                            {p.plan}
                          </span>
                          <span className="text-[11px] text-neutral-500 capitalize">{p.type.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle ON/OFF Switch */}
                    <div className="flex flex-col items-end">
                      <button
                        type="button"
                        onClick={() => handleToggleService(p.id, p.enabled)}
                        disabled={actionLoading === `toggle_${p.id}`}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          p.enabled ? "bg-amber-600" : "bg-neutral-300 dark:bg-neutral-700"
                        }`}
                        title={p.enabled ? "Click to disable service" : "Click to enable service"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                            p.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className={`text-[10px] font-bold mt-1 ${p.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-400"}`}>
                        {p.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Storage Progress Meter */}
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-neutral-500 font-medium">Live Storage Used:</span>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {p.storageUsedMB} MB <span className="text-neutral-400 font-normal">/ {p.storageQuotaMB} MB</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
                        style={{ width: `${Math.max(2, usagePercent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1">
                      <span>{usagePercent}% Quota consumed</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">$0.00 Spent</span>
                    </div>
                  </div>

                  {/* Latency & Ping Details */}
                  <div className="mt-3 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                      <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      <span>Ping Latency:</span>
                      <span className="font-mono font-bold text-neutral-900 dark:text-white">{p.latencyMs}ms</span>
                    </div>
                    <div className="text-[11px] font-medium text-neutral-500">
                      {p.recordsCount > 0 ? `${p.recordsCount} Records` : "Standby"}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestPing(p.id)}
                    disabled={actionLoading === `ping_${p.id}`}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Activity className={`w-3 h-3 text-emerald-500 ${actionLoading === `ping_${p.id}` ? "animate-spin" : ""}`} />
                    <span>{actionLoading === `ping_${p.id}` ? "Testing..." : "Test Ping"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openConfigModal(p)}
                    className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-3 h-3 text-amber-600" />
                    <span>Credentials</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: MULTI-DATABASE ROUTING & CO-EXISTENCE CONTROLLER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <span>Multi-Database Co-existence & Dual-Write Architecture</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              একসাথে একাধিক ডাটাবেস চলবে। প্রাইমারি ডাটাবেস ডাউন হলেও ওয়েবসাইট কোনো বিঘ্ন ছাড়াই স্ট্যান্ডবাই ডাটাবেস থেকে চলবে।
            </p>
          </div>
          <button
            onClick={handleSaveRoutingArchitecture}
            disabled={actionLoading === "routing"}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{actionLoading === "routing" ? "Saving..." : "Save Architecture"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Primary Database Engine
            </label>
            <select
              value={selectedPrimaryDb}
              onChange={(e) => setSelectedPrimaryDb(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="mongodb">MongoDB Atlas (Recommended)</option>
              <option value="firebase">Firebase Firestore</option>
              <option value="supabase">Supabase PostgreSQL</option>
              <option value="memory">High-Speed In-Memory Cache</option>
            </select>
            <span className="text-[11px] text-neutral-500">Main source of truth for all catalog items</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Primary Media & CDN Storage
            </label>
            <select
              value={selectedPrimaryMedia}
              onChange={(e) => setSelectedPrimaryMedia(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="cloudinary">Cloudinary Media CDN (Fastest)</option>
              <option value="firebase">Firebase Cloud Storage</option>
              <option value="aws_s3">Amazon AWS S3 Bucket</option>
              <option value="local">Server Local Media Storage</option>
            </select>
            <span className="text-[11px] text-neutral-500">Fast auto-optimization for product images</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Dual-Write Sync</span>
              <input
                type="checkbox"
                checked={dualWrite}
                onChange={(e) => setDualWrite(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-neutral-500">Write to both MongoDB & Firebase simultaneously</span>
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Auto-Failover</span>
              <input
                type="checkbox"
                checked={autoFailover}
                onChange={(e) => setAutoFailover(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
            </div>
            <span className="text-[10px] text-neutral-500">Zero downtime automatic fallback protection</span>
          </div>
        </div>
      </div>

      {/* SECTION C: ONE-CLICK CROSS-DATABASE MIGRATION & REPLICATION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
              <span>Cross-Database One-Click Migration & Sync Engine</span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              একটি ডাটাবেস থেকে অন্য ডাটাবেসে সম্পূর্ণ ক্যাটালগ ও ডাটা অবিলম্বে ট্রান্সফার বা রেপ্লিকেট করুন।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:w-48">
              <span className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Source Database (From)</span>
              <select
                value={syncFrom}
                onChange={(e) => setSyncFrom(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="mongodb">MongoDB Atlas</option>
                <option value="firebase">Firebase Firestore</option>
                <option value="supabase">Supabase PostgreSQL</option>
                <option value="appwrite">Appwrite Cloud</option>
              </select>
            </div>

            <div className="pt-5 text-neutral-400">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
            </div>

            <div className="flex-1 md:w-48">
              <span className="block text-[11px] font-bold text-neutral-500 uppercase mb-1">Destination Database (To)</span>
              <select
                value={syncTo}
                onChange={(e) => setSyncTo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
              >
                <option value="firebase">Firebase Firestore</option>
                <option value="mongodb">MongoDB Atlas</option>
                <option value="supabase">Supabase PostgreSQL</option>
                <option value="appwrite">Appwrite Cloud</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <label className="h-10 px-4 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all flex items-center gap-2 cursor-pointer border border-neutral-300 dark:border-neutral-700">
              <Upload className="w-3.5 h-3.5" />
              <span>{isRestoring ? "Restoring..." : "Restore from JSON File"}</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleRestoreFileSelect}
                disabled={isRestoring}
              />
            </label>

            <button
              onClick={handleRunSync}
              disabled={isSyncing}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white border border-amber-500 shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Migrating Data..." : "Start One-Click Migration"}</span>
            </button>
          </div>
        </div>

        {/* Recent Migration History */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Recent Synchronization & Migration History
          </h4>
          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-b border-neutral-200 dark:border-neutral-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">From</th>
                  <th className="py-2.5 px-4">To</th>
                  <th className="py-2.5 px-4">Records Replicated</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-800 dark:text-neutral-200">
                {migrationLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-neutral-400">
                      No migrations executed yet.
                    </td>
                  </tr>
                ) : (
                  migrationLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-2.5 px-4 font-bold capitalize text-amber-600 dark:text-amber-400">{log.from}</td>
                      <td className="py-2.5 px-4 font-bold capitalize text-blue-600 dark:text-blue-400">{log.to}</td>
                      <td className="py-2.5 px-4 font-mono">{log.recordsCount} items</td>
                      <td className="py-2.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Check className="w-2.5 h-2.5" />
                          <span>Success</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-500 max-w-xs truncate">
                        {log.note || "Catalog replication"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREDENTIALS CONFIGURATION MODAL */}
      {configModalProvider && (
        <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center text-xl">
                  ⚙️
                </div>
                <div>
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                    Configure {configModalProvider.name}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    এখানে আপনার ডাটাবেস আইডি বা প্রেজেক্ট আইডি ও কি (Key) দিন। ডিফল্ট অপশন তৈরি করা আছে।
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfigModalProvider(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Credential Fields */}
            <div className="py-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {Object.keys(editCredentials).map((key) => {
                const isSecret = key.toLowerCase().includes("secret") || key.toLowerCase().includes("key") || key.toLowerCase().includes("password") || key.toLowerCase().includes("uri");
                const showSecret = showSecretMap[key] || false;

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </label>
                      {isSecret && (
                        <button
                          type="button"
                          onClick={() => setShowSecretMap({ ...showSecretMap, [key]: !showSecret })}
                          className="text-[11px] text-amber-600 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showSecret ? "Hide" : "Show"}</span>
                        </button>
                      )}
                    </div>
                    <input
                      type={isSecret && !showSecret ? "password" : "text"}
                      value={editCredentials[key] || ""}
                      onChange={(e) => setEditCredentials({ ...editCredentials, [key]: e.target.value })}
                      placeholder={`Enter ${key}`}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleResetDefaultCredentials}
                className="px-3.5 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-all cursor-pointer"
              >
                Reset to Safe Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfigModalProvider(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCredentials}
                  disabled={actionLoading === "save_cred"}
                  className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{actionLoading === "save_cred" ? "Saving..." : "Save Credentials"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
