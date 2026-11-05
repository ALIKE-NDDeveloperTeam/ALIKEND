export interface DeliveryPartnerProfile {
  partnerId: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  city: string;
  operatingZone: string;
  dob?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship?: string;
  };
  vehicle: {
    type: "bicycle" | "ebike" | "scooter" | "motorcycle";
    model?: string;
    registrationNumber?: string;
    rcDocUrl?: string;
  };
  identity: {
    type: "aadhaar" | "pan" | "voter_id";
    numberMasked: string;
    documentUrl?: string;
    drivingLicenseNumberMasked?: string;
    drivingLicenseExpiry?: string;
    drivingLicenseUrl?: string;
    verificationStatus: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  };
  payout: {
    accountHolderName: string;
    accountNumberMasked: string;
    ifsc: string;
    bankName?: string;
    upiId?: string;
  };
  status: "pending_approval" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  isOnline: boolean;
  isOnBreak: boolean;
  breakUntil?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    heading?: number;
    accuracy?: number;
    lastUpdated?: string;
  };
  rating: number;
  totalDeliveries: number;
  earningsToday: number;
  activeTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomingOrderRequest {
  requestId: string;
  serviceType: string;
  storeName: string;
  storeAddress: string;
  storeDistanceKm: number;
  customerName: string;
  customerAddress: string;
  customerDistanceKm: number;
  totalDistanceKm: number;
  itemCount: number;
  itemsSummary: string;
  payoutAmount: number;
  surgeBonus: number;
  totalPayout: number;
  estimatedMinutes: number;
  expiresAt: number;
}

const DP_TOKEN_KEY = "alike_dp_token";
const DP_PROFILE_KEY = "alike_dp_profile";

class DeliveryPartnerApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem(DP_TOKEN_KEY);
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem(DP_TOKEN_KEY);
    }
    return this.token;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem(DP_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(DP_TOKEN_KEY);
      localStorage.removeItem(DP_PROFILE_KEY);
    }
  }

  public getSavedProfile(): DeliveryPartnerProfile | null {
    try {
      const data = localStorage.getItem(DP_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public saveProfile(profile: DeliveryPartnerProfile) {
    try {
      localStorage.setItem(DP_PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not save profile to localStorage:", e);
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  // 1. Send Registration OTP
  public async sendRegisterOtp(phone: string) {
    const res = await fetch("/api/delivery-partner/register/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send registration OTP");
    return data;
  }

  // 2. Submit Partner Registration
  public async registerPartner(payload: any) {
    const res = await fetch("/api/delivery-partner/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit partner application");
    if (data.token) this.setToken(data.token);
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 3. Send Login OTP
  public async sendLoginOtp(phone: string) {
    const res = await fetch("/api/delivery-partner/login/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send login OTP");
    return data;
  }

  // 4. Verify Login OTP
  public async verifyLoginOtp(phone: string, otp: string) {
    const res = await fetch("/api/delivery-partner/login/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to verify login OTP");
    if (data.token) this.setToken(data.token);
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 5. Login with Password
  public async loginWithPassword(phone: string, password: string) {
    const res = await fetch("/api/delivery-partner/login/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login with password failed");
    if (data.token) this.setToken(data.token);
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 6. Get Partner Profile
  public async getProfile(): Promise<DeliveryPartnerProfile> {
    const res = await fetch("/api/delivery-partner/me", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch partner profile");
    if (data.partner) this.saveProfile(data.partner);
    return data.partner;
  }

  // 7. Update Profile
  public async updateProfile(payload: Partial<DeliveryPartnerProfile>) {
    const res = await fetch("/api/delivery-partner/me", {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update profile");
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 8. Toggle Availability (Go Online / Go Offline)
  public async setAvailability(isOnline: boolean) {
    const res = await fetch("/api/delivery-partner/availability", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ isOnline }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to toggle availability");
    return data;
  }

  // 9. Take Break
  public async takeBreak(durationMinutes: number) {
    const res = await fetch("/api/delivery-partner/break", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ durationMinutes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to take break");
    return data;
  }

  // 10. Update Location Heartbeat
  public async updateLocation(lat: number, lng: number, heading = 0, accuracy = 10) {
    const res = await fetch("/api/delivery-partner/location", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ lat, lng, heading, accuracy }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update location");
    return data;
  }

  // 11. Fetch Incoming Orders or Active Task
  public async getIncomingOrders(): Promise<{
    isOnline: boolean;
    isOnBreak?: boolean;
    incomingOrder: IncomingOrderRequest | null;
    activeDelivery: any | null;
  }> {
    const res = await fetch("/api/delivery-partner/orders/incoming", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch incoming orders");
    return data;
  }

  // 12. Accept Order
  public async acceptOrder(taskId: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/accept`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to accept order");
    return data;
  }

  // 13. Reject Order
  public async rejectOrder(taskId: string, reason?: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/reject`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to reject order");
    return data;
  }

  // 14. Confirm Arrival at Store
  public async confirmArrivalAtStore(taskId: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/arrived-store`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to confirm store arrival");
    return data;
  }

  // 15. Verify Store Pickup Code
  public async verifyPickup(taskId: string, pickupCode: string, notes?: string, photoProof?: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/verify-pickup`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ pickupCode, notes, photoProof }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to verify pickup code");
    return data;
  }

  // 16. Report Pickup Issue (Store Delay, Missing Items, Damaged)
  public async reportPickupIssue(taskId: string, issueType: string, delayMinutes?: number, details?: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/report-pickup-issue`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ issueType, delayMinutes, details }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to report pickup issue");
    return data;
  }

  // 17. Confirm Arrival at Customer Doorstep
  public async confirmArrivalAtCustomer(taskId: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/arrived-customer`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to confirm doorstep arrival");
    return data;
  }

  // 18. Verify Doorstep Delivery OTP
  public async verifyDeliveryOtp(taskId: string, deliveryOtp: string, photoProof?: string, notes?: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/verify-delivery-otp`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ deliveryOtp, photoProof, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to verify delivery OTP");
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 19. Report Failed Delivery / Customer Unavailable
  public async reportFailedDelivery(taskId: string, reason: string, notes?: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/report-failed-delivery`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reason, notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to report failed delivery");
    return data;
  }

  // 20. Confirm Return to Store
  public async confirmReturnToStore(taskId: string) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/confirm-return`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to confirm return to store");
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // 21. Demo fast-track approval
  public async adminFastTrackDemo() {
    const res = await fetch("/api/delivery-partner/admin/fast-track-demo", {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Fast-track approval failed");
    if (data.partner) this.saveProfile(data.partner);
    return data;
  }

  // ==========================================
  // MODULE 1F: EARNINGS & PAYOUT RECORDS
  // ==========================================
  public async getEarningsSummary() {
    const res = await fetch("/api/delivery-partner/earnings/summary", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load earnings summary");
    return data;
  }

  public async getEarningsHistory(status = "all", range = "all") {
    const query = new URLSearchParams({ status, range }).toString();
    const res = await fetch(`/api/delivery-partner/earnings/history?${query}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load earnings history");
    return data;
  }

  public async estimateEarnings(payload: {
    distanceKm: number;
    weightKg?: number;
    waitingMinutes?: number;
    serviceType?: string;
    isPeakHour?: boolean;
    tips?: number;
  }) {
    const res = await fetch("/api/delivery-partner/earnings/estimate", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to estimate earnings");
    return data;
  }

  public async getPayouts() {
    const res = await fetch("/api/delivery-partner/payouts", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load payouts");
    return data;
  }

  public async requestPayout(amount: number, method: "bank_transfer" | "upi") {
    const res = await fetch("/api/delivery-partner/payouts/request", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ amount, method }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to process withdrawal");
    return data;
  }

  public async getAdjustments() {
    const res = await fetch("/api/delivery-partner/adjustments", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load adjustments");
    return data;
  }

  // ==========================================
  // MODULE 1G: SAFETY & SUPPORT
  // ==========================================
  public async triggerEmergencySos(payload: {
    lat?: number;
    lng?: number;
    address?: string;
    taskId?: string;
  }) {
    const res = await fetch("/api/delivery-partner/safety/sos", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to trigger SOS");
    return data;
  }

  public async reportIncident(payload: {
    type: string;
    severity: string;
    description: string;
    lat?: number;
    lng?: number;
    address?: string;
    needMedical?: boolean;
    needReplacementRider?: boolean;
    photos?: string[];
  }) {
    const res = await fetch("/api/delivery-partner/safety/incident", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to report incident");
    return data;
  }

  public async getIncidents() {
    const res = await fetch("/api/delivery-partner/safety/incidents", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load incidents");
    return data;
  }

  public async submitComplaint(payload: {
    targetType: "store" | "customer";
    targetName?: string;
    orderNumber?: string;
    complaintReason: string;
    details: string;
  }) {
    const res = await fetch("/api/delivery-partner/safety/complaint", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit complaint");
    return data;
  }

  public async cancelOrder(taskId: string, payload: { reason: string; category?: string }) {
    const res = await fetch(`/api/delivery-partner/orders/${taskId}/cancel`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to cancel order");
    return data;
  }

  public async getDisputes() {
    const res = await fetch("/api/delivery-partner/disputes", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load disputes");
    return data;
  }

  public async submitDispute(payload: {
    orderNumber: string;
    category: string;
    claimedAmount: number;
    description: string;
  }) {
    const res = await fetch("/api/delivery-partner/disputes", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit dispute");
    return data;
  }

  public async getPerformance() {
    const res = await fetch("/api/delivery-partner/performance", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load performance metrics");
    return data;
  }

  public async getReviews() {
    const res = await fetch("/api/delivery-partner/reviews", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load reviews");
    return data;
  }

  public async getAnnouncements() {
    const res = await fetch("/api/delivery-partner/announcements", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load announcements");
    return data;
  }

  public async markAnnouncementRead(id: string) {
    const res = await fetch(`/api/delivery-partner/announcements/${id}/read`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to mark announcement read");
    return data;
  }

  public async getPrivacySettings() {
    const res = await fetch("/api/delivery-partner/privacy-settings", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load privacy settings");
    return data;
  }

  public async updatePrivacySettings(settings: {
    locationSharingMode?: string;
    maskPhoneToCustomer?: boolean;
    hideLiveCoordsWhenIdle?: boolean;
    emergencyShareLiveGps?: boolean;
  }) {
    const res = await fetch("/api/delivery-partner/privacy-settings", {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update privacy settings");
    return data;
  }

  public async getSupportChat() {
    const res = await fetch("/api/delivery-partner/support/chat", {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load support chat");
    return data;
  }

  public async sendSupportChat(text: string) {
    const res = await fetch("/api/delivery-partner/support/chat", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send support message");
    return data;
  }

  // 22. Logout
  public logout() {
    this.setToken(null);
  }
}

export const deliveryPartnerApi = new DeliveryPartnerApiService();
