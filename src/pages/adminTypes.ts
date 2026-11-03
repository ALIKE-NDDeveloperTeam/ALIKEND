export interface Product {
  _id: string;
  id?: number;
  name: string;
  brand?: string;
  category: string;
  subCategory?: string;
  eligibleFor20MinDelivery?: boolean;
  price: number;
  mrp?: number;
  rating?: number;
  reviewsCount?: number;
  stock: number;
  stockStatus?: string;
  badge?: string;
  isFlashSale?: boolean;
  image?: string;
  images?: string[];
  description?: string;
  specifications?: Record<string, string>;
  isWholesale?: boolean;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  colors?: string[];
  sizes?: string[];
  emoji?: string;
  sellerId?: string;
  sellerShopName?: string;
  flashEndsAt?: string;
  hsnCode?: string;
  gstRate?: number;
  countryOfOrigin?: string;
  manufacturerDetails?: string;
  packInfo?: string;
  audience?: string;
  sku?: string;
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  isPublished?: boolean;
  isHidden?: boolean;
  deliveryCharge?: number;
  packageWeightKg?: number;
  packageLengthCm?: number;
  packageWidthCm?: number;
  packageHeightCm?: number;
  localizedName?: string;
  nestedCategory?: string;
  productType?: "physical" | "digital" | "service" | string;
  condition?: "new" | "used" | "refurbished" | string;
  modelNumber?: string;
  internalProductId?: string;
  internalSearchTags?: string[];
  projectReference?: string;
  seoKeywords?: string[];
  whiteBgImage?: string;
  promoBannerImage?: string;
  costPrice?: number;
  saleStartDate?: string;
  saleEndDate?: string;
  minOrderQty?: number;
  maxOrderQty?: number;
  bundleInfo?: string;
  lowStockThreshold?: number;
  variants?: Array<{
    id: string;
    name: string;
    options: Record<string, string>;
    sku: string;
    price: number;
    specialPrice?: number;
    stock: number;
    lowStockThreshold?: number;
    available: boolean;
    image?: string;
    barcode?: string;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }>;
  variantOptionGroups?: Array<{
    name: string;
    values: string[];
  }>;
  customSpecifications?: Array<{
    id: string;
    key: string;
    value: string;
    fieldType: "text" | "number" | "dropdown" | "checkbox" | "multi-select" | string;
    options?: string[];
    required?: boolean;
  }>;
  highlights?: string[];
  benefitsUseCases?: string;
  technicalSummary?: string;
  whatsInTheBox?: string;
  careInstructions?: string;
  comparisonTable?: Array<{
    feature: string;
    thisProduct: string;
    standardProduct: string;
  }>;
  manualUrl?: string;
  badgesConfig?: {
    fastDelivery?: boolean;
    flashSale?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    featuredProduct?: boolean;
    verifiedSeller?: boolean;
    limitedStock?: boolean;
  };
  flashSaleConfig?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    discountType?: "percentage" | "flat" | string;
    discountValue?: number;
    stockLimit?: number;
  };
  shippingConfig?: {
    unit?: "cm_kg" | "in_lb" | string;
    volumetricWeightKg?: number;
    chargeMode?: "auto" | "manual" | string;
    customShippingFee?: number;
    chargeScope?: "per_order" | "per_product" | "per_quantity" | string;
    freeShipping?: boolean;
    handlingTimeDays?: string;
    estimatedDeliveryRange?: string;
    shippingRestrictions?: string;
    returnEligible?: boolean;
    returnWindowDays?: number;
    dangerousGoods?: "none" | "battery" | "flammable" | "liquid" | "fragile" | string;
  };
  warrantyConfig?: {
    warrantyType?: "manufacturer" | "seller" | "no_warranty" | string;
    warrantyDuration?: string;
    warrantyTerms?: string;
  };
  fulfilmentConfig?: {
    fulfilmentMethod?: "seller_fulfilled" | "platform_fulfilled" | string;
    warehouseId?: string;
    warehouseName?: string;
    dispatchPrepHours?: number;
    pickupOriginAddress?: string;
    handlingInstructions?: string;
    sellerSku?: string;
    returnDestinationAddress?: string;
  };
  inventoryHistory?: Array<{
    id: string;
    timestamp: string;
    adjustment: number;
    previousStock: number;
    newStock: number;
    reason: string;
    actor: string;
  }>;
  isDraft?: boolean;
  contentScore?: number;
  lastDraftSavedAt?: string;
  moderationStatus?: "approved" | "pending" | "rejected" | "archived" | "draft" | string;
  moderationNote?: string;
  changeHistory?: Array<{
    action: string;
    actedBy: string;
    note?: string;
    createdAt: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  _id: string;
  orderNumber: string;
  memberName: string;
  memberEmail?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export type SellerStatus = "pending" | "approved" | "review" | "suspended" | "rejected";

export interface Seller {
  _id: string;
  shopName?: string;
  storefront: string;
  ownerName: string;
  ownerEmail?: string;
  email?: string;
  mobileNumber?: string;
  businessAddress?: string;
  panNumber?: string;
  gstin?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIFSC?: string;
  bankName?: string;
  kycVerified?: boolean;
  listingsCount: number;
  status: SellerStatus;
  createdAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  mobileNumber?: string;
  tier: "VIP" | "Normal" | string;
  isBlocked?: boolean;
  verified?: boolean;
  ordersCount: number;
  lifetimeSpend: number;
  createdAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalSellers: number;
  ordersBreakdown: {
    pending: number;
    processing?: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export type AdminMinisterRole =
  | "superadmin"      // হেড এডমিন (Head Admin)
  | "main_admin"       // মেইন এডমিন (Main Admin)
  | "sub_admin"        // সাব এডমিন (Sub Admin)
  | "user_admin"       // ইউজার এডমিন (User Admin)
  | "order_admin"      // অর্ডার ও ডেলিভারি এডমিন (Order Admin)
  | "catalog_admin"    // প্রোডাক্ট ও ক্যাটালগ এডমিন (Catalog Admin)
  | "seller_admin"     // সেলার ও ভেন্ডর এডমিন (Seller Admin)
  | "finance_admin"    // ফাইন্যান্স ও কমিশন এডমিন (Finance Admin)
  | "support_admin"    // হেল্পডেস্ক ও সাপোর্ট এডমিন (Support Admin)
  | "admin"            // জেনারেল এডমিন (General Admin)
  | string;

export interface AdminProfile {
  _id: string;
  email: string;
  name: string;
  role: AdminMinisterRole;
}

export interface AdminAccount {
  _id: string;
  email: string;
  name: string;
  role: AdminMinisterRole;
  phone?: string;
  department?: string;
  designation?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface SalesReport {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  totalOrders?: number;
  totalMembersCount: number;
  revenueByTier: {
    Platinum: number;
    Gold: number;
    Silver: number;
  };
  monthlyTrend: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface ActivityLogEvent {
  _id: string;
  eventType: "Registration" | "Login" | "Failed Login";
  userName: string;
  email: string;
  status: "success" | "failed";
  ipAddress: string;
  deviceInfo: string;
  browser?: string;
  os?: string;
  details?: string;
  createdAt: string;
}

export interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  link?: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  isActive?: boolean;
  isCenterFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CommissionRuleItem {
  ruleId: string;
  ruleType: "category" | "subcategory" | "product_override" | "seller_override";
  level: 1 | 2 | 3;
  categoryId: string;
  categoryName: string;
  categoryNameBn?: string;
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  targetId?: string | null;
  targetName?: string | null;
  commissionRate: number;
  minCommissionAmount?: number;
  maxCommissionAmount?: number;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  isActive: boolean;
  updatedBy: string;
  notes?: string;
  updatedAt: string;
  createdAt?: string;
}

export interface CommissionConfigType {
  globalDefaultRate: number;
  minCommissionPercent: number;
  maxCommissionPercent: number;
  sellerOverridePrecedence: "before_category" | "after_category";
  priorityOrder: string[];
  calculationBasis: {
    deductDiscountBeforeCommission: boolean;
    includeShipping: boolean;
    includeTax: boolean;
  };
  updatedBy?: string;
  updatedAt?: string;
}

export interface CommissionAuditItem {
  auditId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  targetName: string;
  previousRate: number | null;
  newRate: number | null;
  reason: string;
  adminName: string;
  adminEmail: string;
  createdAt: string;
}

export interface CommissionOrderLog {
  _id: string;
  orderNumber: string;
  date: string;
  memberName: string;
  memberEmail?: string;
  subtotal?: number;
  discount?: number;
  tax?: number;
  delivery?: number;
  eligibleAmount?: number;
  total: number;
  commissionRate: number;
  commissionAmount: number;
  originalCommissionAmount?: number;
  refundedCommissionAmount?: number;
  sellerPayout: number;
  paymentMethod?: string;
  status: OrderStatus;
  commissionStatus?: string;
  items?: Array<{
    productId?: any;
    productName: string;
    category: string;
    subCategory?: string;
    sellerId?: string;
    sellerShopName?: string;
    qty: number;
    sellingPrice: number;
    grossItemAmount: number;
    discountShare: number;
    eligibleAmount: number;
    commissionRate: number;
    appliedRuleType: string;
    appliedRuleId: string;
    appliedRuleLabel: string;
    commissionAmount: number;
    sellerNetAmount: number;
  }>;
}

export interface PlatformWithdrawal {
  _id: string;
  amount: number;
  note?: string;
  adminEmail?: string;
  adminName?: string;
  date: string;
  status: string;
}

export interface CommissionData {
  commissionRate: number;
  config?: CommissionConfigType;
  rules?: CommissionRuleItem[];
  auditLogs?: CommissionAuditItem[];
  totalCommissionEarned: number;
  totalSellerEarnings?: number;
  settledCommissionTotal?: number;
  pendingCommissionTotal?: number;
  refundedOrReversedCommissionTotal?: number;
  runningBalance: number;
  totalWithdrawn?: number;
  totalOrdersCount: number;
  categoryBreakdown?: Array<{
    categoryId: string;
    categoryName: string;
    ordersCount: number;
    itemsSold: number;
    grossSales: number;
    eligibleSales: number;
    commissionAmount: number;
    sellerEarnings: number;
    avgCommissionRate: number;
  }>;
  sellerBreakdown?: Array<{
    sellerId: string;
    sellerShopName: string;
    ordersCount: number;
    itemsSold: number;
    grossSales: number;
    commissionAmount: number;
    sellerEarnings: number;
    refundedCommission: number;
  }>;
  productBreakdown?: Array<{
    productId: string;
    productName: string;
    category: string;
    subCategory: string;
    sellerShopName: string;
    unitsSold: number;
    sellingPrice: number;
    appliedRate: number;
    grossSales: number;
    commissionAmount: number;
    sellerEarnings: number;
  }>;
  orders: CommissionOrderLog[];
  withdrawals?: PlatformWithdrawal[];
}
