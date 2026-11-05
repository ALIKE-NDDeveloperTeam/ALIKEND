// API Client for Central ALIKE ND Admin Panel (Module 3)

const BASE_URL = "/api/admin/central";

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface CentralSummary {
  delivery: {
    totalOrders: number;
    pending: number;
    activeDispatch: number;
    completed: number;
    cancelled: number;
    revenue: number;
    codCollected: number;
    onlineCollected: number;
    activePartners: number;
    totalPartners: number;
    pendingPartnerApprovals: number;
  };
  rides: {
    totalBookings: number;
    activeRides: number;
    completedRides: number;
    cancelledRides: number;
    revenue: number;
    cashCollected: number;
    onlineCollected: number;
    driverEarnings: number;
    platformCommission: number;
    onlineDrivers: number;
    totalDrivers: number;
    pendingDriverApprovals: number;
    activeSosAlerts: number;
  };
  merchants: {
    total: number;
    approved: number;
    pending: number;
  };
  customers: {
    total: number;
  };
  serviceAvailability: {
    deliveryGloballyEnabled: boolean;
    ridesGloballyEnabled: boolean;
    emergencyLockdown: boolean;
    lockdownReason?: string;
  };
}

export interface ServiceAreaZone {
  id: string;
  name: string;
  code: string;
  coordinates: { lat: number; lng: number };
  radiusKm: number;
  deliveryActive: boolean;
  ridesActive: boolean;
  baseDeliveryFee: number;
  nightSurgeMultiplier: number;
  surgeActive: boolean;
}

export interface CentralSystemConfig {
  serviceAvailability: {
    deliveryGloballyEnabled: boolean;
    ridesGloballyEnabled: boolean;
    emergencyLockdown: boolean;
    lockdownReason?: string;
  };
  otpRules: {
    expirySeconds: number;
    maxAttempts: number;
    cooldownSeconds: number;
    lockoutDurationMinutes: number;
  };
  deliveryPricingRules: {
    baseFare: number;
    baseDistanceKm: number;
    perKmRate: number;
    minDeliveryPay: number;
    heavyPackageSurcharge: number;
    waitingTimeRatePerMin: number;
    peakHourMultiplier: number;
    maxBroadcastRadiusKm: number;
    autoAssignEnabled: boolean;
  };
  rideVehicleCategories: {
    type: string;
    label: string;
    seatingCapacity: number;
    baseFare: number;
    perKmRate: number;
    perMinRate: number;
    minFare: number;
    platformCommissionPercent: number;
    active: boolean;
  }[];
  emergencyContacts: {
    police: string;
    ambulance: string;
    womenHelpline: string;
    trafficControl: string;
    safetyDeskHotline: string;
    safetyEmail: string;
  };
  deliveryTimeSettings: {
    defaultPrepTimeMinutes: number;
    transitBufferMinutes: number;
    maxDeliveryWindowMinutes: number;
  };
}

export interface UnifiedDispatchData {
  deliveries: any[];
  rides: any[];
  fleet: {
    deliveryPartners: any[];
    rideDrivers: any[];
  };
  serviceAreas: ServiceAreaZone[];
}

export interface CrossServiceReport {
  period: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  metrics: {
    totalCombinedRevenue: number;
    netPlatformCommission: number;
    totalRefunds: number;
  };
  deliveryBreakdown: {
    totalOrdersCount: number;
    completedCount: number;
    cancelledCount: number;
    grossSales: number;
    codCollected: number;
    onlineCollected: number;
    partnerPayouts: number;
    refunds: number;
  };
  rideBreakdown: {
    totalBookingsCount: number;
    completedCount: number;
    cancelledCount: number;
    grossFares: number;
    cashCollected: number;
    onlineCollected: number;
    driverEarnings: number;
    platformCommission: number;
  };
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  adminId: string;
  adminEmail: string;
  adminRole: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress?: string;
}

export const adminCentralApi = {
  async getSummary(): Promise<CentralSummary> {
    const res = await fetch(`${BASE_URL}/summary`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch summary");
    return json.data;
  },

  async getUnifiedDispatch(): Promise<UnifiedDispatchData> {
    const res = await fetch(`${BASE_URL}/unified-dispatch`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch unified dispatch");
    return json;
  },

  async overrideWorkflow(payload: {
    entityType: "delivery" | "ride";
    entityId: string;
    targetStatus: string;
    reason: string;
    bypassValidation?: boolean;
  }): Promise<any> {
    const res = await fetch(`${BASE_URL}/workflow/override`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to override workflow");
    return json;
  },

  async getCrossServiceReport(period: "daily" | "weekly" | "monthly" = "daily"): Promise<CrossServiceReport> {
    const res = await fetch(`${BASE_URL}/reports/cross-service?period=${period}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch report");
    return json.report;
  },

  downloadCrossServiceCsv(period: "daily" | "weekly" | "monthly" = "daily") {
    const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
    const url = `${BASE_URL}/reports/cross-service?period=${period}&format=csv`;
    fetch(url, { headers: { ...getAuthHeader() } })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `alike_nd_${period}_financial_report_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => {
        console.error("CSV download error:", err);
      });
  },

  async getConfig(): Promise<{ config: CentralSystemConfig; serviceAreas: ServiceAreaZone[] }> {
    const res = await fetch(`${BASE_URL}/config`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch config");
    return { config: json.config, serviceAreas: json.serviceAreas };
  },

  async updateConfig(payload: Partial<CentralSystemConfig>): Promise<{ config: CentralSystemConfig }> {
    const res = await fetch(`${BASE_URL}/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update config");
    return json;
  },

  async addServiceArea(zone: Omit<ServiceAreaZone, "id" | "surgeActive">): Promise<ServiceAreaZone[]> {
    const res = await fetch(`${BASE_URL}/service-areas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(zone),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add service area");
    return json.serviceAreas;
  },

  async updateServiceArea(id: string, zone: Partial<ServiceAreaZone>): Promise<ServiceAreaZone[]> {
    const res = await fetch(`${BASE_URL}/service-areas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(zone),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update service area");
    return json.serviceAreas;
  },

  async deleteServiceArea(id: string): Promise<ServiceAreaZone[]> {
    const res = await fetch(`${BASE_URL}/service-areas/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to delete service area");
    return json.serviceAreas;
  },

  async getAuditLogs(params?: { action?: string; entityType?: string; limit?: number }): Promise<AuditLogItem[]> {
    const query = new URLSearchParams();
    if (params?.action) query.set("action", params.action);
    if (params?.entityType) query.set("entityType", params.entityType);
    if (params?.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${BASE_URL}/audit-logs?${query.toString()}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch audit logs");
    return json.logs || [];
  },
};
