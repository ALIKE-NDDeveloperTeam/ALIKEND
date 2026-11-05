import { SellerProfile } from "../types";

const API_BASE = "/api/sellers";

export interface RegisterSellerPayload {
  shopName: string;
  ownerName: string;
  mobileNumber: string;
  email: string;
  password: string;
  confirmPassword?: string;
  agreedToTerms: boolean;
  businessAddress?: string;
  panNumber?: string;
  gstin?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankName?: string;
}

export interface SellerProductPayload {
  name: string;
  brand?: string;
  price: number;
  mrp: number;
  category?: string;
  subCategory?: string;
  eligibleFor20MinDelivery?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  stock?: number;
  stockStatus?: string;
  specifications?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  hsnCode?: string;
  gstRate?: number;
  countryOfOrigin?: string;
  manufacturerDetails?: string;
  packInfo?: string;
  isPublished?: boolean;
  deliveryCharge?: number;
  moderationStatus?: 'draft' | 'approved' | 'pending' | 'rejected' | 'archived';
  [key: string]: any;
}

function getToken(): string | null {
  try {
    return (
      localStorage.getItem("alike_seller_token") ||
      sessionStorage.getItem("alike_seller_token") ||
      localStorage.getItem("seller_token") ||
      sessionStorage.getItem("seller_token")
    );
  } catch {
    return null;
  }
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || body.message || `Request failed (${res.status})`);
  }
  return body;
}

export const sellerApi = {
  getToken,
  setToken: (token: string, rememberMe: boolean = true) => {
    try {
      if (rememberMe) {
        localStorage.setItem("alike_seller_token", token);
        localStorage.setItem("seller_token", token);
        sessionStorage.removeItem("alike_seller_token");
        sessionStorage.removeItem("seller_token");
      } else {
        sessionStorage.setItem("alike_seller_token", token);
        sessionStorage.setItem("seller_token", token);
        localStorage.removeItem("alike_seller_token");
        localStorage.removeItem("seller_token");
      }
    } catch {}
  },
  clearToken: () => {
    try {
      localStorage.removeItem("alike_seller_token");
      localStorage.removeItem("seller_token");
      sessionStorage.removeItem("alike_seller_token");
      sessionStorage.removeItem("seller_token");
      localStorage.removeItem("alike_seller_profile");
    } catch {}
  },
  getStoredProfile: (): SellerProfile | null => {
    try {
      const raw = localStorage.getItem("alike_seller_profile");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setStoredProfile: (profile: SellerProfile) => {
    try {
      localStorage.setItem("alike_seller_profile", JSON.stringify(profile));
    } catch {}
  },

  register: async (payload: RegisterSellerPayload) => {
    const res = await request("/register", { method: "POST", body: JSON.stringify(payload) });
    if (res.token) {
      sellerApi.setToken(res.token, true);
    }
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  login: async (identifier: string, password: string, rememberMe: boolean = true) => {
    const res = await request("/login", {
      method: "POST",
      body: JSON.stringify({ identifier, email: identifier, password, rememberMe }),
    });
    if (res.token) {
      sellerApi.setToken(res.token, rememberMe);
    }
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  forgotPassword: (identifier: string) =>
    request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ identifier }),
    }),

  resetPassword: (data: {
    identifier: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    request("/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  sendVerificationOtp: () =>
    request("/send-verification-otp", {
      method: "POST",
    }),

  verifyEmail: (otp: string) =>
    request("/verify-email", {
      method: "POST",
      body: JSON.stringify({ otp }),
    }),

  demoLogin: async () => {
    const res = await request("/demo-login", {
      method: "POST",
    });
    if (res.token) {
      sellerApi.setToken(res.token, true);
    }
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  getMe: () => request("/me"),

  updateProfile: async (data: Partial<SellerProfile>) => {
    const res = await request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword?: string }) =>
    request("/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyProducts: () => request("/products"),

  createProduct: (product: SellerProductPayload | Record<string, any>) =>
    request("/products", { method: "POST", body: JSON.stringify(product) }),

  updateProduct: (id: number | string, product: Partial<SellerProductPayload> | Record<string, any>) =>
    request(`/products/${id}`, { method: "PUT", body: JSON.stringify(product) }),

  deleteProduct: (id: number | string) =>
    request(`/products/${id}`, { method: "DELETE" }),

  uploadProductMedia: (data: { dataUrl: string; fileName?: string; mimeType?: string; mediaType?: "image" | "video" }) =>
    request("/products/upload-media", { method: "POST", body: JSON.stringify(data) }),

  adjustProductStock: (id: number | string, data: { adjustment?: number; newStock?: number; reason: string }) =>
    request(`/products/${id}/adjust-stock`, { method: "POST", body: JSON.stringify(data) }),

  bulkUpdateProducts: (data: {
    productIds: Array<string | number>;
    action: "publish" | "unpublish" | "archive" | "restore" | "submit_review" | "update_stock" | "apply_discount" | "delete";
    value?: number;
    stock?: number;
    discountPercent?: number;
  }) =>
    request("/products/bulk", {
      method: "POST",
      body: JSON.stringify({
        ...data,
        value: data.value ?? data.stock ?? data.discountPercent,
      }),
    }),

  duplicateProduct: (id: number | string) =>
    request(`/products/${id}/duplicate`, { method: "POST" }),

  importProductsCsv: (items: Array<Record<string, any>>) =>
    request("/products/import-csv", { method: "POST", body: JSON.stringify({ items }) }),

  getSellerOrders: () => request("/orders"),

  updateSellerOrderStatus: (
    id: string,
    statusOrPayload: string | { status: string; trackingNumber?: string; courierName?: string; courierPartner?: string },
    extra?: { trackingNumber?: string; courierName?: string; courierPartner?: string }
  ) => {
    const payload =
      typeof statusOrPayload === "string"
        ? { status: statusOrPayload, ...(extra || {}) }
        : statusOrPayload;
    return request(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) });
  },

  bulkUpdateOrderStatus: (data: { orderIds: string[]; status: string; courierName?: string; courierPartner?: string }) =>
    request("/orders/bulk-status", { method: "POST", body: JSON.stringify(data) }),

  getSellerReturns: () => request("/returns"),

  updateSellerReturn: (id: string, data: { inspectionResult?: string; sellerNote?: string; status?: string }) =>
    request(`/returns/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getMarketingData: () => request("/marketing"),

  createStoreCoupon: (data: {
    code: string;
    title: string;
    discountType: "percentage" | "flat";
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    expiresAt?: string;
  }) => request("/marketing/coupons", { method: "POST", body: JSON.stringify(data) }),

  deleteStoreCoupon: (couponId: string) =>
    request(`/marketing/coupons/${couponId}`, { method: "DELETE" }),

  createBundleOffer: (data: { title: string; minQty: number; discountPercent: number }) =>
    request("/marketing/bundles", { method: "POST", body: JSON.stringify(data) }),

  deleteBundleOffer: (bundleId: string) =>
    request(`/marketing/bundles/${bundleId}`, { method: "DELETE" }),

  nominateForCampaign: (data: {
    campaignName: string;
    campaignType: "campaign" | "flash_deal" | "featured_product";
    productId: string | number;
    productName: string;
    proposedPrice: number;
    mrp: number;
  }) => request("/marketing/nominate", { method: "POST", body: JSON.stringify(data) }),

  addWarehouse: (data: {
    id?: string;
    warehouseCode?: string;
    name: string;
    contactPerson?: string;
    countryCode?: string;
    phone?: string;
    contactPhone?: string;
    email?: string;
    countryRegion?: string;
    city?: string;
    address?: string;
    addressLine?: string;
    pincode?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
    mapPinLabel?: string;
    isPrimary?: boolean;
    isDefaultPickup?: boolean;
    isReturnAddress?: boolean;
    holidayMode?: boolean;
    holidayStartDate?: string;
    holidayEndDate?: string;
    holidayDateStatus?: string;
  }) => request("/warehouses", { method: "POST", body: JSON.stringify(data) }),

  updateWarehouse: (
    warehouseId: string,
    data: {
      warehouseCode?: string;
      name?: string;
      contactPerson?: string;
      countryCode?: string;
      phone?: string;
      contactPhone?: string;
      email?: string;
      countryRegion?: string;
      city?: string;
      address?: string;
      addressLine?: string;
      pincode?: string;
      postalCode?: string;
      lat?: number;
      lng?: number;
      mapPinLabel?: string;
      isPrimary?: boolean;
      isDefaultPickup?: boolean;
      isReturnAddress?: boolean;
      holidayMode?: boolean;
      holidayStartDate?: string;
      holidayEndDate?: string;
      holidayDateStatus?: string;
    }
  ) => request(`/warehouses/${encodeURIComponent(warehouseId)}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteWarehouse: (warehouseId: string) =>
    request(`/warehouses/${encodeURIComponent(warehouseId)}`, { method: "DELETE" }),

  replyProductReview: (data: {
    productId: string | number;
    productName?: string;
    reviewerName: string;
    replyText: string;
  }) => request("/reviews/reply", { method: "POST", body: JSON.stringify(data) }),

  inviteStaffMember: (data: { name: string; email: string; role: string }) =>
    request("/staff", { method: "POST", body: JSON.stringify(data) }),

  removeStaffMember: (staffId: string) =>
    request(`/staff/${staffId}`, { method: "DELETE" }),

  requestAccountClosure: (reason: string) =>
    request("/account/closure-request", { method: "POST", body: JSON.stringify({ reason }) }),

  getSupportTickets: () => request("/support"),

  createSupportTicket: (data: {
    subject: string;
    description: string;
    category?: string;
    priority?: "Low" | "Normal" | "High" | "Urgent";
  }) => request("/support/tickets", { method: "POST", body: JSON.stringify(data) }),

  replySupportTicket: (ticketId: string, message: string) =>
    request(`/support/tickets/${ticketId}/reply`, { method: "POST", body: JSON.stringify({ message }) }),

  getSecurityActivity: () => request("/security-activity"),

  getLocation: () => request("/profile/location"),

  updateLocation: (data: {
    lat?: number;
    lng?: number;
    shopAddress?: string;
    isOpen?: boolean;
    quickDeliveryEnabled?: boolean;
    prepTimeMin?: number;
    deliveryRadiusKm?: number;
  }) => request("/profile/location", { method: "PATCH", body: JSON.stringify(data) }),

  getWallet: () => request("/wallet"),

  getCommissionDetails: () => request("/commission"),

  requestWithdrawal: (data: { amount: number; payoutDetails?: string; note?: string }) =>
    request("/wallet/withdraw", { method: "POST", body: JSON.stringify(data) }),

  getWalletWithdrawals: () => request("/wallet/withdrawals"),

  getVerificationStatus: () => request("/verification"),

  submitVerificationRequest: async (data: {
    nidNumber: string;
    nidFullName: string;
    nidDateOfBirth?: string;
    nidAddress?: string;
    nidFrontImage: string;
    nidBackImage: string;
    facePhotoImage: string;
    consentGiven: boolean;
  }) => {
    const res = await request("/verification/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  deleteVerificationDocuments: async () => {
    const res = await request("/verification/documents", {
      method: "DELETE",
    });
    if (res.seller) {
      sellerApi.setStoredProfile(res.seller);
    }
    return res;
  },

  markNotificationsRead: (notificationId?: string) =>
    request("/notifications/read", {
      method: "PATCH",
      body: JSON.stringify({ notificationId }),
    }),

  // Settings Hub & Dedicated Seller Panel Module Endpoints
  getSettingsHub: () => request("/settings-hub"),

  updateSettingsHubCard: (cardId: string, data: Record<string, any>) =>
    request(`/settings-hub/${encodeURIComponent(cardId)}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    }),

  getDeliveryServices: () => request("/delivery-services"),

  updateDeliveryServices: (data: {
    shopLevelServices?: any[];
    warehouseLevelServices?: any[];
    [key: string]: any;
  }) =>
    request("/delivery-services", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getShippingProviders: () => request("/shipping-providers"),

  updateShippingProviders: (data: {
    providerMappings?: any[];
    providerHistory?: any[];
  }) =>
    request("/shipping-providers", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getInvoiceSettings: () => request("/invoice-settings"),

  updateInvoiceSettings: (data: Record<string, any>) =>
    request("/invoice-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getRbacData: () => request("/rbac"),

  updateSubAccounts: (subAccounts: any[]) =>
    request("/rbac/sub-accounts", {
      method: "PUT",
      body: JSON.stringify({ subAccounts }),
    }),

  updateRbacRoles: (roles: any[]) =>
    request("/rbac/roles", {
      method: "PUT",
      body: JSON.stringify({ roles }),
    }),

  getChatSettings: () => request("/chat-settings"),

  updateChatSettings: (data: Record<string, any>) =>
    request("/chat-settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  submitChatSettingsFeedback: (data: { rating?: number; comment: string }) =>
    request("/chat-settings/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getStoreBuilder: () => request("/store-builder"),

  updateStoreBuilder: (data: {
    pages?: any[];
    storeCategories?: any[];
    darazStoreProfile?: Record<string, any>;
  }) =>
    request("/store-builder", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateDarazStoreProfile: (data: Record<string, any>) =>
    request("/store-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  submitStoreBuilderFeedback: (data: { rating?: number; comment: string }) =>
    request("/store-builder/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

