import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin";
import User from "./models/User";
import Customer from "./models/Customer";
import Product from "./models/Product";
import ActivityLog from "./models/ActivityLog";
import Banner from "./models/Banner";
import Category from "./models/Category";
import PlatformSetting from "./models/PlatformSetting";
<<<<<<< HEAD
import Seller from "./models/Seller";
import Order from "./models/Order";
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58

export interface InMemoryStore {
  admins: Array<{
    _id?: string;
    email: string;
    passwordHash: string;
    name: string;
    role: string;
    phone?: string;
    department?: string;
    designation?: string;
    isActive?: boolean;
    createdAt?: Date;
  }>;
  users: Array<{
    _id: string;
    fullName: string;
    username?: string;
    email: string;
    country: string;
    mobileNumber: string;
    phone?: string;
    passwordHash: string;
<<<<<<< HEAD
    tier: "Silver" | "Gold" | "Platinum" | "VIP" | "Normal";
    verified: boolean;
    isBlocked?: boolean;
    avatar?: string;
    addresses?: Array<{
      name?: string;
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      phone?: string;
      isDefault?: boolean;
    }>;
    adminNotes?: string;
    restrictions?: Record<string, {
      enabled: boolean;
      reason?: string;
      adminNote?: string;
      appliedBy?: string;
      appliedAt?: Date;
      expiresAt?: Date | null;
    }>;
    restrictionAuditLog?: Array<{
      restrictionKey: string;
      action: "enabled" | "disabled";
      reason?: string;
      adminNote?: string;
      performedBy: string;
      timestamp: Date;
    }>;
    securityAuditLog?: Array<{
      action: string;
      performedBy: string;
      details: string;
      timestamp: Date;
    }>;
=======
    tier: "Silver" | "Gold" | "Platinum";
    verified: boolean;
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    createdAt: Date;
  }>;
  products: Array<{
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
    hsnCode?: string;
    gstRate?: number;
    countryOfOrigin?: string;
    manufacturerDetails?: string;
    packInfo?: string;
    createdAt: Date;
    updatedAt?: Date;
  }>;
  orders: Array<{
    _id: string;
    orderNumber: string;
    memberName: string;
    memberEmail?: string;
<<<<<<< HEAD
    userId?: string;
    total: number;
    status:
      | "pending"
      | "confirmed"
      | "processing"
      | "ready_for_pickup"
      | "ready_for_shipment"
      | "shipped"
      | "out_for_delivery"
      | "delivered"
      | "cancelled"
      | "rejected";
=======
    total: number;
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    commissionRate?: number;
    commissionAmount?: number;
    sellerPayout?: number;
    commissionStatus?: "credited" | "pending";
    paymentMethod?: string;
    walletCredited?: boolean;
    deliveredAt?: Date;
    items?: Array<any>;
<<<<<<< HEAD
    address?: any;
    deliveryLocation?: {
      lat: number;
      lng: number;
      address?: string;
    };
    trackingStep?: number;
    liveTracking?: {
      customer?: { lat: number; lng: number; accuracy?: number; updatedAt: Date; sharing: boolean };
      seller?: { lat: number; lng: number; updatedAt: Date; sharing: boolean };
      expiresAt?: Date;
    };
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    createdAt: Date;
  }>;
  sellers: Array<{
    _id: string;
    shopName?: string;
    storefront: string;
    ownerName: string;
    ownerEmail?: string;
    email: string;
    mobileNumber?: string;
    businessAddress?: string;
    panNumber?: string;
    gstin?: string;
    bankAccountHolderName?: string;
    bankAccountNumber?: string;
    bankIFSC?: string;
    bankName?: string;
    kycVerified?: boolean;
    passwordHash?: string;
    listingsCount: number;
    walletBalance?: number;
    totalEarnings?: number;
    pendingWithdrawals?: number;
<<<<<<< HEAD
    shopAddress?: string;
    location?: {
      type: "Point";
      coordinates: [number, number]; // [lng, lat]
    };
    isOpen?: boolean;
    quickDeliveryEnabled?: boolean;
    prepTimeMin?: number;
    deliveryRadiusKm?: number;
    category?: string;
    logo?: string;
    rating?: number;
    verificationStatus?: "not_submitted" | "pending_admin_review" | "under_review" | "resubmission_required" | "approved" | "rejected";
    verifiedBadge?: boolean;
    identityVerification?: any;
    notifications?: Array<any>;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    status: "pending" | "approved" | "review" | "suspended" | "rejected";
    createdAt: Date;
  }>;
  customers: Array<{ _id: string; name: string; email: string; tier: "Silver" | "Gold" | "Platinum"; ordersCount: number; lifetimeSpend: number; createdAt: Date }>;
  activityLogs: Array<{
    _id: string;
<<<<<<< HEAD
    eventType: string;
=======
    eventType: "Registration" | "Login" | "Failed Login";
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    userName: string;
    email: string;
    status: "success" | "failed";
    ipAddress: string;
    deviceInfo: string;
    browser?: string;
    os?: string;
    details?: string;
    createdAt: Date;
  }>;
  banners: Array<{
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
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  categories: Array<{
    _id: string;
    titleEn: string;
    titleBn: string;
    imageUrl: string;
    badgeText?: string;
    badgeColor?: string;
    redirectUrl: string;
    order: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
  otps: Array<{
    email: string;
    otp: string;
    purpose: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  platformSettings: {
    commissionRate: number;
    platformBalance: number;
    totalCommissionEarned: number;
    updatedAt: Date;
  };
  platformWithdrawals: Array<{
    _id: string;
    amount: number;
    note: string;
    adminEmail: string;
    adminName: string;
    date: Date;
    status: string;
  }>;
  sellerWithdrawals: Array<{
    _id: string;
    sellerId: string;
    sellerEmail: string;
    sellerShopName: string;
    amount: number;
    payoutDetails?: string;
    note?: string;
    status: "pending" | "approved" | "rejected";
    rejectionReason?: string;
    requestedAt: Date;
    processedAt?: Date;
    processedByAdminEmail?: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  flashSaleConfig?: {
    title: string;
    subtitle: string;
    bannerText: string;
    targetEndTime: Date;
    activeProducts: Array<{
      productId: string | number;
      flashPrice?: number;
      discountPercent?: number;
      isFeatured?: boolean;
      order?: number;
    }>;
    updatedAt: Date;
  };
  hotlines: Array<{
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
    createdAt: Date;
    updatedAt: Date;
  }>;
  tickets: Array<{
    _id: string;
    ticketId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerId?: string;
    subject: string;
    description: string;
    category: string;
    subcategory?: string;
    priority: "Low" | "Normal" | "High" | "Urgent";
    status: "New" | "Open" | "In Progress" | "Waiting for Customer" | "Escalated" | "Resolved" | "Closed";
    assignedAgentId?: string;
    assignedAgentName?: string;
    assignedDepartment: string;
    replies: Array<{
      id: string;
      authorType: "staff" | "customer";
      authorName: string;
      authorEmail: string;
      message: string;
      attachments?: Array<{
        name: string;
        url: string;
        size: number;
        mimeType: string;
      }>;
      isInternalNote: boolean;
      createdAt: Date;
    }>;
    tags: string[];
    csatRating?: number;
    csatFeedback?: string;
    resolvedAt?: Date;
    closedAt?: Date;
    slaDeadline?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
  knowledgeArticles: Array<{
    _id: string;
    title: string;
    category: string;
    summary: string;
    content: string;
    status: "published" | "draft" | "archived";
    viewsCount: number;
    helpfulCount: number;
    tags: string[];
    author: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  supportAgents: Array<{
    _id: string;
    name: string;
    email: string;
    role: "Support Agent" | "Support Manager" | "Head of Care" | "Admin";
    department: string;
    status: "Active" | "Away" | "Offline";
    assignedTicketsCount: number;
    resolvedTicketsCount: number;
    avgCsat: number;
    phone?: string;
    createdAt: Date;
  }>;
  customerCareAuditLogs: Array<{
    _id: string;
    action: string;
    targetId: string;
    targetType: "hotline" | "ticket" | "agent" | "faq" | "settings";
    performedBy: string;
    details: string;
    ip: string;
    createdAt: Date;
  }>;
  customerCareSettings: {
    autoResponderEnabled: boolean;
    autoResponderMessage: string;
    workingHoursNotice: string;
    emergencyBannerText: string;
    emergencyBannerActive: boolean;
    whatsappChatEnabled: boolean;
    emailNotificationsEnabled: boolean;
    defaultSlaHours: number;
    updatedAt: Date;
  };
<<<<<<< HEAD
  returnRequests: Array<{
    _id: string;
    returnId: string;
    orderNumber: string;
    orderId?: any;
    customerId?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    productId?: any;
    productName: string;
    productImage?: string;
    variant?: string;
    size?: string;
    color?: string;
    unitPrice: number;
    quantity: number;
    purchaseDate?: Date;
    deliveryDate?: Date;
    returnReason: string;
    customerDescription: string;
    evidenceImages: string[];
    requestedResolution: "refund" | "replacement" | "exchange";
    status: string;
    assignedStaff?: {
      id?: string;
      name?: string;
      email?: string;
    };
    courierName?: string;
    trackingNumber?: string;
    pickupScheduledDate?: Date;
    pickupCompletedDate?: Date;
    inspectionResult?: "pending" | "resalable" | "damaged" | "defective";
    inspectionNotes?: string;
    restocked: boolean;
    refundMethod?: "original_payment" | "wallet" | "cod_manual";
    refundAmount: number;
    refundDeduction: number;
    refundDeductionReason?: string;
    refundTransactionRef?: string;
    refundStatus: "pending" | "processed" | "failed" | "not_applicable";
    rejectionReason?: string;
    internalNotes: Array<{
      id: string;
      author: string;
      note: string;
      createdAt: Date;
    }>;
    auditLog: Array<{
      action: string;
      performedBy: string;
      timestamp: Date;
      notes?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  returnPolicy: {
    key: string;
    eligibilityDays: number;
    returnFee: number;
    requireEvidence: boolean;
    eligibleCategories: string[];
    nonReturnableCategories: string[];
    reasons: string[];
    pickupEnabled: boolean;
    autoApproveVip: boolean;
    updatedBy?: string;
    updatedAt: Date;
  };
  advertisements: Array<any>;
  rides: Array<any>;
  drivers: Array<any>;
  rideSettings?: any;
  savedPlaces?: Array<any>;
  rideDisputes?: Array<any>;
  safetyIncidents?: Array<any>;
  deliveryTasks: Array<any>;
  deliveryPartners: Array<any>;
  deliveryEarnings: Array<any>;
  deliveryPayouts: Array<any>;
  deliveryAdjustments: Array<any>;
  deliveryIncidents: Array<any>;
  deliveryDisputes: Array<any>;
  deliveryAnnouncements: Array<any>;
  deliveryReviews: Array<any>;
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
}

// Initial seed hash and credentials derived from environment variables
export const INITIAL_ADMIN_SEED_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || process.env.ADMIN_SEED_PASSWORD || "";
export const INITIAL_ADMIN_SEED_HASH = INITIAL_ADMIN_SEED_PASSWORD ? bcrypt.hashSync(INITIAL_ADMIN_SEED_PASSWORD, 10) : "";
export const INITIAL_SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase() || "developer.alikend@gmail.com";
export const INITIAL_SUPERADMIN_NAME = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";
export const INITIAL_STAFF_EMAIL = process.env.STAFF_ADMIN_EMAIL?.trim().toLowerCase() || "admin234@gmail.com";

export const INITIAL_BANNERS_SEED = [
  {
    imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Smart Shopping Experience",
    subtitle: "DEMAND PERFECTION. THE NEW GOLD STANDARD.",
    description: "Plunge into our curated catalog of ultra-premium electronics, handcrafted jewellery, and high-net-worth designer apparel.",
    buttonText: "Shop Now",
    link: "category_search",
    order: 1,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Guaranteed Fast Delivery",
    subtitle: "EXPRESS URBAN LUXURY AT YOUR DOORSTEP",
    description: "Why wait for premium? Direct courier delivery to your sector with fast dispatch.",
    buttonText: "See Speed Deals",
    link: "category_search",
    order: 2,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1600&auto=format&fit=crop&q=80",
    title: "B2B Volume Wholesale Deals",
    subtitle: "DIRECT BULK IMPORTS FROM ATELIER LEADERS",
    description: "Secure Persian saffron lots, bulk fast-charger boxes, and designer satin wraps directly. Save up to 45% with our transparent tier grids.",
    buttonText: "Browse Wholesale",
    link: "category_search",
    order: 3,
    active: true,
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&auto=format&fit=crop&q=75&fm=webp",
    title: "Exclusive Sovereign Atelier",
    subtitle: "HAND-CRAFTED BESPOKE COUTURE",
    description: "Immerse yourself in our limited-edition autumn lookbook and royal designer wear.",
    buttonText: "Explore Atelier",
    link: "category_search",
    order: 4,
    active: true,
  },
];

export const INITIAL_PRODUCTS_SEED = [
  {
    _id: "prod_1",
    id: 1,
    name: "Aurelia Royal Gold Chronograph Watch",
    brand: "Aurelia Genf",
    price: 18499,
    mrp: 29999,
    rating: 4.8,
    reviewsCount: 312,
    stock: 14,
    stockStatus: "In Stock",
    category: "luxury",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Crafted in Switzerland, the Aurelia Chronograph boasts an 18-karat yellow gold case, hand-stitched alligator strap, and automatic precision movement.",
    specifications: { "Case Material": "18k Yellow Gold", "Movement": "Swiss Automatic Chronograph" },
    emoji: "⌚",
    createdAt: new Date(),
  },
  {
    _id: "prod_2",
    id: 2,
    name: "Alike-Pro Soundmaster Gold Edition",
    brand: "Alike Audio",
    price: 3499,
    mrp: 6999,
    rating: 4.6,
    reviewsCount: 148,
    stock: 8,
    stockStatus: "In Stock",
    category: "electronics",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600"
    ],
    description: "Immersive active noise-cancelling headphones tuned to golden standard. Features gold brushed metal plating and 40-hour battery capacity.",
    specifications: { "Driver Unit": "40mm Dynamic", "ANC Support": "Active Hybrid ANC" },
    emoji: "🎧",
    createdAt: new Date(),
  },
  {
    _id: "prod_3",
    id: 3,
    name: "18K Gold plated Venetian Chain Necklace",
    brand: "Venezia Jewels",
    price: 5999,
    mrp: 11999,
    rating: 4.9,
    reviewsCount: 220,
    stock: 12,
    stockStatus: "In Stock",
    category: "jewellery",
    badge: "TRENDING",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600"],
    description: "An elegant Italian-crafted Venetian chain dipped in authentic 18-karat gold with precision linkage.",
    specifications: { "Chain Length": "22 Inches", "Metal": "18k Gold on Sterling Silver" },
    emoji: "💍",
    createdAt: new Date(),
  },
  {
    _id: "prod_4",
    id: 4,
    name: "Alike-Book Master Pro 16",
    brand: "Alike-ND Computing",
    price: 89999,
    mrp: 124999,
    rating: 4.9,
    reviewsCount: 96,
    stock: 5,
    stockStatus: "In Stock",
    category: "laptops",
    badge: "LIMITED",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600"],
    description: "Powered by the stellar M4 Alike SuperChip, featuring 32GB unified RAM, 1TB premium high-speed flash storage.",
    specifications: { "Processor": "Alike M4 Gen2 Max", "RAM": "32GB Unified" },
    emoji: "💻",
    createdAt: new Date(),
  },
  {
    _id: "prod_5",
    id: 5,
    name: "Midnight Silk Evening Gown",
    brand: "Aura Couture",
    price: 7999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 88,
    stock: 6,
    stockStatus: "In Stock",
    category: "fashion",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=600"],
    description: "Flowing beautifully, this mulberry silk evening gown is tailored precisely for VIP cocktail galas.",
    specifications: { "Fabric": "100% Organic Mulberry Silk", "Stitch": "Handcrafted Atelier" },
    emoji: "👗",
    createdAt: new Date(),
  },
  {
    _id: "prod_6",
    id: 6,
    name: "Alike-Phon Gold-Titanium 15 Ultra",
    brand: "Alike Mobiles",
    price: 64999,
    mrp: 89999,
    rating: 4.8,
    reviewsCount: 450,
    stock: 9,
    stockStatus: "In Stock",
    category: "mobiles",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600"],
    description: "The crown jewel of modern smartphones. Crafted out of grade-5 gold titanium with 200MP Triple Golden-Eye Lens.",
    specifications: { "Chassis": "Tier-5 Titanium Gold Alloy", "Camera": "200MP Triple Lens" },
    emoji: "📱",
    createdAt: new Date(),
  },
  {
    _id: "prod_7",
    id: 7,
    name: "Luxury Gold Trim Espresso Machine",
    brand: "Barista Royale",
    price: 18999,
    mrp: 29999,
    rating: 4.5,
    reviewsCount: 110,
    stock: 4,
    stockStatus: "In Stock",
    category: "furniture",
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600"],
    description: "Premium professional grade espresso pump embellished with authentic polished brass gold trims.",
    specifications: { "Pressure": "19-Bar Italian Pump", "Finish": "Gold Lustre Metallic Trims" },
    emoji: "☕",
    createdAt: new Date(),
  },
  {
    _id: "prod_8",
    id: 8,
    name: "Wholesale Premium Organic Saffron Bulks (100g)",
    brand: "Persian Royal Wholesales",
    price: 14500,
    mrp: 25000,
    rating: 4.9,
    reviewsCount: 310,
    stock: 20,
    stockStatus: "In Stock",
    category: "wholesale",
    badge: "SALE",
    isFlashSale: true,
    isWholesale: true,
    wholesaleMinQty: 5,
    wholesalePrice: 12500,
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600"],
    description: "Direct premium grade-A saffron threads collected of royal fields. Highly aromatic, purely tested.",
    specifications: { "Grade": "Super Negin AAA Quality", "Origin": "Khorasan Fields" },
    emoji: "🌿",
    createdAt: new Date(),
  },
  {
    _id: "prod_9",
    id: 9,
    name: "Wholesale Alike Type-C Fast Chargers [Bulk Pack 50pcs]",
    brand: "Alike Hardware",
    price: 4999,
    mrp: 14999,
    rating: 4.7,
    reviewsCount: 65,
    stock: 15,
    stockStatus: "In Stock",
    category: "wholesale",
    badge: "HOT",
    isFlashSale: false,
    isWholesale: true,
    wholesaleMinQty: 2,
    wholesalePrice: 4499,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600"],
    description: "Industrial wholesale supply of 50 high-durability fast chargers. Perfect for retailers and suppliers.",
    specifications: { "Output": "33W Power Delivery 3.0", "Box Quantity": "50 Pieces" },
    emoji: "🔌",
    createdAt: new Date(),
  },
  {
    _id: "prod_10",
    id: 10,
    name: "Alike RGB-Onyx Gaming Keyboard",
    brand: "Alike Gaming",
    price: 1999,
    mrp: 3999,
    rating: 4.5,
    reviewsCount: 194,
    stock: 18,
    stockStatus: "In Stock",
    category: "gaming",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600"],
    description: "Sleek tactical mechanical keyboard fitted with gold-plated switches for instant response, gorgeous backlit layouts.",
    specifications: { "Key Switch": "Gold Contact Blue Clicky", "Chassis": "Aircraft Aluminum" },
    emoji: "⌨️",
    createdAt: new Date(),
  },
  {
    _id: "prod_11",
    id: 11,
    name: "Premium Gold Glow Facial Extract Glow Serum",
    brand: "Glow & Co",
    price: 1299,
    mrp: 2499,
    rating: 4.4,
    reviewsCount: 82,
    stock: 25,
    stockStatus: "In Stock",
    category: "beauty",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1608248597481-496100c8c836?auto=format&fit=crop&q=80&w=600"],
    description: "Enriched with real micro gold leaf flakes and organic hyaluronic essence for deep moisturization.",
    specifications: { "Ingredients": "24k Gold Extract, Vitamin E", "Volume": "50ml Luxury Dropper" },
    emoji: "✨",
    createdAt: new Date(),
  },
  {
    _id: "prod_12",
    id: 12,
    name: "Sleek Chrome Finish Professional Tool Kit (Fast Delivery)",
    brand: "Apex Hardware",
    price: 2499,
    mrp: 4999,
    rating: 4.6,
    reviewsCount: 54,
    stock: 2,
    stockStatus: "Only 2 left!",
    category: "hardware",
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=600"],
    description: "Complete premium rust-resistant vanadium steel toolkit housed in a gold-accented protective hardcase.",
    specifications: { "Piece Count": "48 Professional Tools", "Material": "Chrome-Vanadium Grade" },
    emoji: "🔧",
    createdAt: new Date(),
  },
  {
    _id: "prod_13",
    id: 13,
    name: "Luxury Gold Velvet Ottoman Sofa Chair",
    brand: "Amore Living",
    price: 12499,
    mrp: 19999,
    rating: 4.3,
    reviewsCount: 42,
    stock: 3,
    stockStatus: "Only 2 left!",
    category: "furniture",
    badge: "TRENDING",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600"],
    description: "Make a bold luxury statement. Ultra cozy golden premium velvet upholstery backed on sturdy gold frames.",
    specifications: { "Upholstery": "Luxe Velvet Gold Fibre", "Frame": "Stainless Gold-PVD Steel" },
    emoji: "🛋️",
    createdAt: new Date(),
  },
  {
    _id: "prod_14",
    id: 14,
    name: "Alike Ultra-Premium Organic Caviar Shield (Fast Delivery)",
    brand: "Royal Caspian",
    price: 4500,
    mrp: 7500,
    rating: 4.9,
    reviewsCount: 30,
    stock: 5,
    stockStatus: "20-Min Express",
    category: "delivery",
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600"],
    description: "Direct elite food-gourmet collection delivered at cold temperature straight to your doorway.",
    specifications: { "Standard Grade": "Beluga Royal Golden Reserve", "Chill Seal": "Yes, dry-ice insulated" },
    emoji: "🍣",
    eligibleFor20MinDelivery: true,
    createdAt: new Date(),
  },
  {
    _id: "prod_15",
    id: 15,
    name: "Alike Gold plated Pro Gaming Controller",
    brand: "Alike Gaming",
    price: 4999,
    mrp: 7999,
    rating: 4.7,
    reviewsCount: 162,
    stock: 11,
    stockStatus: "In Stock",
    category: "gaming",
    badge: "SALE",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1600080972464-8e5f358024ae?auto=format&fit=crop&q=80&w=600"],
    description: "Custom metallic gold plated grips, tactile mechanical paddles, hall-effect anti-drift triggers.",
    specifications: { "Triggers": "Hall Effect Magnetic", "Latency": "1ms Ultra-Fast Wireless" },
    emoji: "🎮",
    createdAt: new Date(),
  },
  {
    _id: "prod_16",
    id: 16,
    name: "Royal Gir Cow Organic A2 Pure Bilona Ghee (1L)",
    brand: "Vedic Organics",
    price: 1850,
    mrp: 2400,
    rating: 4.9,
    reviewsCount: 284,
    stock: 35,
    stockStatus: "20-Min Express",
    category: "grocery",
    subCategory: "Oil & Ghee",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&q=80&w=600"],
    description: "Authentic Vedic churned Gir cow A2 cultured bilona ghee in luxury glass jar. Freshly packed, rich aroma, and high nutritional purity.",
    specifications: { "Volume": "1000ml (1 Litre)", "Process": "Traditional Wooden Churned Bilona", "Certification": "FSSAI Organic Certified" },
    emoji: "🧈",
    createdAt: new Date(),
  },
  {
    _id: "prod_17",
    id: 17,
    name: "Royal Dum Biryani Feast with Mirchi Ka Salan & Raita",
    brand: "Nawabi Dastarkhwan",
    price: 499,
    mrp: 699,
    rating: 4.9,
    reviewsCount: 420,
    stock: 20,
    stockStatus: "20-Min Express",
    category: "food_delivery",
    subCategory: "Biryani",
    eligibleFor20MinDelivery: true,
    badge: "HOT",
    isFlashSale: true,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"],
    description: "Slow-cooked saffron-infused fragrant basmati rice layered with rich marinated spices, caramelized onions, and royal herbs. Dispatched piping hot with fast delivery.",
    specifications: { "Portion": "Serves 1-2 Persons", "Packaging": "Hot Insulated Luxury Box", "Delivery Speed": "Fast Delivery" },
    emoji: "🍛",
    createdAt: new Date(),
  },
  {
    _id: "prod_18",
    id: 18,
    name: "Artisanal Wood-Fired Truffle Margherita Pizza (12-inch)",
    brand: "Atelier Pizza Roma",
    price: 649,
    mrp: 899,
    rating: 4.8,
    reviewsCount: 195,
    stock: 15,
    stockStatus: "20-Min Express",
    category: "food_delivery",
    subCategory: "Pizza",
    eligibleFor20MinDelivery: true,
    badge: "SALE",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"],
    description: "Sourdough crust baked in oak-fired ovens at 450°C. San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil, and Italian black truffle oil.",
    specifications: { "Size": "12 Inch Round", "Crust": "48-Hour Fermented Sourdough", "Cheese": "100% Buffalo Mozzarella" },
    emoji: "🍕",
    createdAt: new Date(),
  },
  {
    _id: "prod_19",
    id: 19,
    name: "Exotic California Jumbo Almonds & Walnuts Combo (1kg)",
    brand: "Alike Gourmet Harvest",
    price: 1399,
    mrp: 2199,
    rating: 4.8,
    reviewsCount: 160,
    stock: 40,
    stockStatus: "20-Min Express",
    category: "grocery",
    subCategory: "Dry Fruits & Nuts",
    eligibleFor20MinDelivery: true,
    badge: "NEW",
    isFlashSale: false,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600",
    images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&q=80&w=600"],
    description: "Vacuum nitrogen sealed premium crunchy California almonds and light-halves Kashmiri walnuts. Rich in plant protein, antioxidants, and essential healthy fats.",
    specifications: { "Net Weight": "500g Almonds + 500g Walnuts", "Grade": "King Jumbo Selection", "Origin": "California / Kashmir" },
    emoji: "🥜",
    createdAt: new Date(),
  },
];

export const INITIAL_CATEGORIES_SEED = [
  {
    titleEn: "Luxury Atelier",
    titleBn: "বিলাসবহুল সংগ্রহ",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "HOT",
    badgeColor: "#EF4444",
    redirectUrl: "category_search",
    order: 1,
    isActive: true,
  },
  {
    titleEn: "VIP Membership",
    titleBn: "ভিআইপি মেম্বারশিপ",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "EXCLUSIVE",
    badgeColor: "#8B5CF6",
    redirectUrl: "category_search",
    order: 2,
    isActive: true,
  },
  {
    titleEn: "Flagship Mobiles",
    titleBn: "ফ্ল্যাগশিপ মোবাইল",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "NEW",
    badgeColor: "#3B82F6",
    redirectUrl: "category_search",
    order: 3,
    isActive: true,
  },
  {
    titleEn: "Performance Laptops",
    titleBn: "ল্যাপটপ ও গ্যাজেট",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "GEAR",
    badgeColor: "#10B981",
    redirectUrl: "category_search",
    order: 4,
    isActive: true,
  },
  {
    titleEn: "Haute Couture Fashion",
    titleBn: "ফ্যাশন পোশাক",
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "TRENDING",
    badgeColor: "#EC4899",
    redirectUrl: "category_search",
    order: 5,
    isActive: true,
  },
  {
    titleEn: "Artisan Fine Jewellery",
    titleBn: "আভিজাত্য জুয়েলারি",
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "HOT",
    badgeColor: "#F59E0B",
    redirectUrl: "category_search",
    order: 6,
    isActive: true,
  },
  {
    titleEn: "Pro Tier Gaming",
    titleBn: "প্রো গেমিং গিয়ার",
    imageUrl: "https://images.unsplash.com/photo-1612287233219-c90a18413a96?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "GEAR",
    badgeColor: "#6366F1",
    redirectUrl: "category_search",
    order: 7,
    isActive: true,
  },
  {
    titleEn: "20-Min Express",
    titleBn: "দ্রুত ডেলিভারি",
    imageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "ACTIVE",
    badgeColor: "#10B981",
    redirectUrl: "category_search",
    order: 8,
    isActive: true,
  },
  {
    titleEn: "Curated Living & Decor",
    titleBn: "ফার্নিচার ও সাজসজ্জা",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "TRENDING",
    badgeColor: "#14B8A6",
    redirectUrl: "category_search",
    order: 9,
    isActive: true,
  },
  {
    titleEn: "Prestige Beauty",
    titleBn: "সৌন্দর্য ও প্রসাধন",
    imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "NEW",
    badgeColor: "#F43F5E",
    redirectUrl: "category_search",
    order: 10,
    isActive: true,
  },
  {
    titleEn: "Industrial Hardware",
    titleBn: "হার্ডওয়্যার ও টুলস",
    imageUrl: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "ACTIVE",
    badgeColor: "#F97316",
    redirectUrl: "category_search",
    order: 11,
    isActive: true,
  },
  {
    titleEn: "Fresh Gourmet Grocery",
    titleBn: "মুদি ও গ্রোসারি",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&fm=webp",
    badgeText: "ACTIVE",
    badgeColor: "#84CC16",
    redirectUrl: "category_search",
    order: 12,
    isActive: true,
  },
];

export const memoryStore: InMemoryStore = {
  // Master Superadmin AND Regular Staff Admin accounts
  admins: [
    {
      _id: "admin_super_1",
      email: INITIAL_SUPERADMIN_EMAIL,
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: INITIAL_SUPERADMIN_NAME,
      role: "superadmin",
      isActive: true,
      createdAt: new Date(),
    },
    {
      _id: "admin_staff_1",
      email: INITIAL_STAFF_EMAIL,
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      name: "Regular Staff Admin",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
    },
  ],
  users: [
    {
      _id: "user_superadmin_init",
      fullName: INITIAL_SUPERADMIN_NAME,
      email: INITIAL_SUPERADMIN_EMAIL,
      country: "+880",
      mobileNumber: "1700000000",
      phone: "+880 1700000000",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Platinum",
      verified: true,
<<<<<<< HEAD
      isBlocked: false,
      adminNotes: "Platform super administrator account.",
      addresses: [
        {
          name: INITIAL_SUPERADMIN_NAME,
          street: "74 Gulshan Avenue, Tower 3",
          city: "Dhaka",
          state: "Dhaka Division",
          zip: "1212",
          phone: "+880 1700000000",
          isDefault: true,
        },
      ],
      restrictions: {},
      restrictionAuditLog: [],
      securityAuditLog: [
        {
          action: "ACCOUNT_INITIALIZED",
          performedBy: "SYSTEM",
          details: "Master root super administrator verified",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
    {
      _id: "cust_1",
      fullName: "Vikram Malhotra",
      email: "vikram@example.com",
      country: "+880",
      mobileNumber: "1711223344",
      phone: "+880 1711223344",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "VIP",
      verified: true,
      isBlocked: false,
      adminNotes: "VIP Concierge client. Prefers express evening deliveries.",
      addresses: [
        {
          name: "Vikram Malhotra",
          street: "Road 11, House 42, Banani",
          city: "Dhaka",
          state: "Dhaka Division",
          zip: "1213",
          phone: "+880 1711223344",
          isDefault: true,
        },
      ],
      restrictions: {
        cod_block: {
          enabled: false,
          reason: "",
          appliedBy: "",
          appliedAt: new Date(),
        },
      },
      restrictionAuditLog: [],
      securityAuditLog: [],
      createdAt: new Date(Date.now() - 86400000 * 45),
    },
    {
      _id: "cust_2",
      fullName: "Amara Okafor",
      email: "amara@example.com",
      country: "+880",
      mobileNumber: "1822334455",
      phone: "+880 1822334455",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Silver",
      verified: true,
      isBlocked: false,
      adminNotes: "Recent customer. Inquired about return exchange policy.",
      addresses: [
        {
          name: "Amara Okafor",
          street: "Block D, Road 4, Bashundhara R/A",
          city: "Dhaka",
          state: "Dhaka Division",
          zip: "1229",
          phone: "+880 1822334455",
          isDefault: true,
        },
      ],
      restrictions: {},
      restrictionAuditLog: [],
      securityAuditLog: [],
      createdAt: new Date(Date.now() - 86400000 * 20),
    },
    {
      _id: "cust_3",
      fullName: "Elena Rostova",
      email: "elena@example.com",
      country: "+880",
      mobileNumber: "1933445566",
      phone: "+880 1933445566",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Platinum",
      verified: true,
      isBlocked: false,
      adminNotes: "High-value luxury buyer. Verified corporate billing.",
      addresses: [
        {
          name: "Elena Rostova",
          street: "Lotus Kamal Tower, Gulshan North",
          city: "Dhaka",
          state: "Dhaka Division",
          zip: "1212",
          phone: "+880 1933445566",
          isDefault: true,
        },
      ],
      restrictions: {},
      restrictionAuditLog: [],
      securityAuditLog: [],
      createdAt: new Date(Date.now() - 86400000 * 60),
    },
    {
      _id: "cust_4",
      fullName: "Julian Vance",
      email: "julian@example.com",
      country: "+880",
      mobileNumber: "1644556677",
      phone: "+880 1644556677",
      passwordHash: INITIAL_ADMIN_SEED_HASH,
      tier: "Gold",
      verified: true,
      isBlocked: false,
      adminNotes: "Watch collector. Often purchases flash sale accessories.",
      addresses: [
        {
          name: "Julian Vance",
          street: "Sector 7, Road 18, Uttara",
          city: "Dhaka",
          state: "Dhaka Division",
          zip: "1230",
          phone: "+880 1644556677",
          isDefault: true,
        },
      ],
      restrictions: {},
      restrictionAuditLog: [],
      securityAuditLog: [],
      createdAt: new Date(Date.now() - 86400000 * 15),
    },
  ],
  products: INITIAL_PRODUCTS_SEED.map((p, idx) => {
    // Distribute products across geo-located sellers so nearby search, quick delivery badges,
    // and multi-seller checkout rules work out of the box.
    if (p.eligibleFor20MinDelivery || idx % 3 === 0) {
      return {
        ...p,
        sellerId: idx % 2 === 0 ? "sel_1" : "sel_5",
        sellerShopName: idx % 2 === 0 ? "Maison Argent" : "Alike Express Hub",
      };
    }
    if (idx % 3 === 1) {
      return {
        ...p,
        sellerId: "sel_6",
        sellerShopName: "South Delhi Luxury Vault",
      };
    }
    return {
      ...p,
      sellerId: idx % 2 === 0 ? "sel_3" : "sel_4",
      sellerShopName: idx % 2 === 0 ? "Atelier Vesper" : "Royal Heritage Boutiques",
    };
  }),
=======
      createdAt: new Date(),
    },
  ],
  products: INITIAL_PRODUCTS_SEED.map((p) => ({
    ...p,
    sellerId: "admin",
    sellerShopName: "ALIKE-ND Official",
  })),
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  orders: [
    {
      _id: "ord_1",
      orderNumber: "AN-5201",
      memberName: "Vikram Malhotra",
      memberEmail: "vikram@example.com",
      total: 2400,
      status: "pending",
      commissionRate: 5,
      commissionAmount: 120,
      sellerPayout: 2280,
      commissionStatus: "credited",
      paymentMethod: "UPI (PHONEPE)",
      createdAt: new Date(),
    },
    {
      _id: "ord_2",
      orderNumber: "AN-5200",
      memberName: "Sara Whitfield",
      memberEmail: "sara@example.com",
      total: 1250,
      status: "shipped",
      commissionRate: 5,
      commissionAmount: 63,
      sellerPayout: 1187,
      commissionStatus: "credited",
      paymentMethod: "VISA CARD",
      createdAt: new Date(Date.now() - 86400000),
    },
    {
      _id: "ord_3",
      orderNumber: "AN-5199",
      memberName: "Elena Rostova",
      memberEmail: "elena@example.com",
      total: 4200,
      status: "delivered",
      commissionRate: 5,
      commissionAmount: 210,
      sellerPayout: 3990,
      commissionStatus: "credited",
      paymentMethod: "MASTERCARD",
      createdAt: new Date(Date.now() - 172800000),
    },
  ],
  sellers: [
    {
      _id: "sel_1",
      shopName: "Maison Argent",
      storefront: "Maison Argent",
      ownerName: "Sara Whitfield",
      ownerEmail: "sara@example.com",
      email: "sara@example.com",
      mobileNumber: "+91 98765 43210",
<<<<<<< HEAD
      businessAddress: "42 Connaught Place, New Delhi",
      shopAddress: "Block B, Inner Circle, Connaught Place, New Delhi 110001",
      location: {
        type: "Point",
        coordinates: [77.2167, 28.6315], // [lng, lat]
      },
      isOpen: true,
      quickDeliveryEnabled: true,
      prepTimeMin: 7,
      deliveryRadiusKm: 5,
      category: "Jewellery & Watches",
      logo: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80",
      rating: 4.9,
      listingsCount: 34,
      kycVerified: true,
      verificationStatus: "approved",
      verifiedBadge: true,
      identityVerification: {
        status: "approved",
        verifiedBadge: true,
        nidNumber: "1991269482019",
        nidFullName: "Sara Whitfield",
        nidDateOfBirth: "1991-04-14",
        nidAddress: "42 Connaught Place, New Delhi 110001",
        nidFrontImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
        nidBackImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80",
        facePhotoImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        consentGiven: true,
        consentTimestamp: new Date(Date.now() - 86400000 * 5),
        consentPolicyVersion: "v1.0-NID-BIOMETRIC",
        submittedAt: new Date(Date.now() - 86400000 * 5),
        reviewedAt: new Date(Date.now() - 86400000 * 4),
        reviewedByAdminId: "admin_super_1",
        reviewedByAdminName: "Super Admin",
        reviewedByAdminEmail: "developer.alikend@gmail.com",
        decisionReason: "NID front/back and live face selfie matched. Verified Seller badge granted.",
        retentionExpiresAt: new Date(Date.now() + 86400000 * 85),
        history: [
          {
            status: "approved",
            action: "Admin Approved NID & Face Verification — Verified Badge Granted",
            note: "NID front/back and live face selfie matched. Verified Seller badge granted.",
            actedBy: "Super Admin (developer.alikend@gmail.com)",
            actedByAdminId: "admin_super_1",
            createdAt: new Date(Date.now() - 86400000 * 4),
          },
          {
            status: "pending_admin_review",
            action: "Seller Submitted NID & Face Verification",
            note: "NID and live face selfie submitted with explicit biometric review consent.",
            actedBy: "Sara Whitfield (Maison Argent)",
            actedByAdminId: "",
            createdAt: new Date(Date.now() - 86400000 * 5),
          },
        ],
      },
      notifications: [
        {
          id: "notif_seed_1",
          type: "verification",
          title: "Verification Approved — Verified Seller Badge Awarded!",
          message: "Congratulations! Your NID & Face Verification has been manually reviewed and approved by Super Admin. The official Verified Seller badge is now active on your store and product pages.",
          status: "approved",
          read: false,
          createdAt: new Date(Date.now() - 86400000 * 4),
        },
      ],
      status: "approved",
      createdAt: new Date(),
    },
    {
      _id: "sel_5",
      shopName: "Alike Express Hub",
      storefront: "Alike Express Hub",
      ownerName: "Kabir Sen",
      ownerEmail: "kabir@example.com",
      email: "kabir@example.com",
      mobileNumber: "+91 98765 43215",
      businessAddress: "18 Janpath Market, New Delhi",
      shopAddress: "18 Janpath Road, Near Windsor Place, New Delhi 110001",
      location: {
        type: "Point",
        coordinates: [77.2185, 28.6219], // [lng, lat] ~1.1 km from New Delhi center
      },
      isOpen: true,
      quickDeliveryEnabled: true,
      prepTimeMin: 6,
      deliveryRadiusKm: 5,
      category: "20-Min Express & Gourmet",
      logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
      rating: 4.85,
      listingsCount: 24,
      kycVerified: false,
      verificationStatus: "pending_admin_review",
      verifiedBadge: false,
      identityVerification: {
        status: "pending_admin_review",
        verifiedBadge: false,
        nidNumber: "1988451092834",
        nidFullName: "Kabir Sen",
        nidDateOfBirth: "1988-09-22",
        nidAddress: "18 Janpath Road, Near Windsor Place, New Delhi 110001",
        nidFrontImage: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
        nidBackImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80",
        facePhotoImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
        consentGiven: true,
        consentTimestamp: new Date(Date.now() - 3600000 * 5),
        consentPolicyVersion: "v1.0-NID-BIOMETRIC",
        submittedAt: new Date(Date.now() - 3600000 * 5),
        retentionExpiresAt: new Date(Date.now() + 86400000 * 90),
        history: [
          {
            status: "pending_admin_review",
            action: "Seller Submitted NID & Face Verification",
            note: "NID (198•••34) and live face selfie submitted with explicit biometric review consent.",
            actedBy: "Kabir Sen (Alike Express Hub)",
            actedByAdminId: "",
            createdAt: new Date(Date.now() - 3600000 * 5),
          },
        ],
      },
      notifications: [
        {
          id: "notif_seed_2",
          type: "verification",
          title: "Verification Request Submitted — Pending Admin Review",
          message: "Your NID documents and face selfie have been securely submitted to the Admin Panel. An authorized administrator will manually review your request before granting the Verified Seller badge.",
          status: "pending_admin_review",
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 5),
        },
      ],
      status: "approved",
      createdAt: new Date(),
    },
    {
      _id: "sel_6",
      shopName: "South Delhi Luxury Vault",
      storefront: "South Delhi Luxury Vault",
      ownerName: "Meera Nair",
      ownerEmail: "meera@example.com",
      email: "meera@example.com",
      mobileNumber: "+91 98765 43216",
      businessAddress: "24 Hauz Khas Village, New Delhi",
      shopAddress: "24 Hauz Khas Village, Deer Park, New Delhi 110016",
      location: {
        type: "Point",
        coordinates: [77.1945, 28.5535], // [lng, lat] ~6.8 km from New Delhi center (Standard delivery)
      },
      isOpen: true,
      quickDeliveryEnabled: false,
      prepTimeMin: 15,
      deliveryRadiusKm: 15,
      category: "Electronics & Collectibles",
      logo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80",
      rating: 4.75,
      listingsCount: 18,
      kycVerified: false,
      verificationStatus: "resubmission_required",
      verifiedBadge: false,
      identityVerification: {
        status: "resubmission_required",
        verifiedBadge: false,
        nidNumber: "1993778120491",
        nidFullName: "Meera Nair",
        nidDateOfBirth: "1993-11-05",
        nidAddress: "24 Hauz Khas Village, New Delhi 110016",
        nidFrontImage: "https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80",
        nidBackImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80",
        facePhotoImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
        consentGiven: true,
        consentTimestamp: new Date(Date.now() - 86400000 * 2),
        consentPolicyVersion: "v1.0-NID-BIOMETRIC",
        submittedAt: new Date(Date.now() - 86400000 * 2),
        reviewedAt: new Date(Date.now() - 86400000 * 1),
        reviewedByAdminId: "admin_super_1",
        reviewedByAdminName: "Super Admin",
        reviewedByAdminEmail: "developer.alikend@gmail.com",
        decisionReason: "Please upload a clearer, uncropped photo of the NID back side where the barcode and address are legible.",
        retentionExpiresAt: new Date(Date.now() + 86400000 * 88),
        history: [
          {
            status: "resubmission_required",
            action: "Admin Requested Document Resubmission",
            note: "Please upload a clearer, uncropped photo of the NID back side where the barcode and address are legible.",
            actedBy: "Super Admin (developer.alikend@gmail.com)",
            actedByAdminId: "admin_super_1",
            createdAt: new Date(Date.now() - 86400000 * 1),
          },
        ],
      },
=======
      businessAddress: "42 Rue de la Paix, Paris",
      listingsCount: 34,
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      status: "approved",
      createdAt: new Date(),
    },
    {
      _id: "sel_2",
      shopName: "Noir & Gold Atelier",
      storefront: "Noir & Gold Atelier",
      ownerName: "Daniel Cho",
      ownerEmail: "daniel@example.com",
      email: "daniel@example.com",
      mobileNumber: "+91 98765 43211",
      businessAddress: "15 Gangnam-daero, Seoul",
      listingsCount: 12,
<<<<<<< HEAD
      kycVerified: false,
      verificationStatus: "pending_admin_review",
      verifiedBadge: false,
      identityVerification: {
        status: "pending_admin_review",
        verifiedBadge: false,
        nidNumber: "1990562319842",
        nidFullName: "Daniel Cho",
        nidDateOfBirth: "1990-02-18",
        nidAddress: "15 Gangnam-daero, Seoul / Central Hub",
        nidFrontImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80",
        nidBackImage: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&auto=format&fit=crop&q=80",
        facePhotoImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
        consentGiven: true,
        consentTimestamp: new Date(Date.now() - 3600000 * 2),
        consentPolicyVersion: "v1.0-NID-BIOMETRIC",
        submittedAt: new Date(Date.now() - 3600000 * 2),
        retentionExpiresAt: new Date(Date.now() + 86400000 * 90),
        history: [
          {
            status: "pending_admin_review",
            action: "Seller Submitted NID & Face Verification",
            note: "NID (199•••42) and live face selfie submitted with explicit biometric review consent.",
            actedBy: "Daniel Cho (Noir & Gold Atelier)",
            actedByAdminId: "",
            createdAt: new Date(Date.now() - 3600000 * 2),
          },
        ],
      },
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      status: "pending",
      createdAt: new Date(),
    },
    {
      _id: "sel_3",
      shopName: "Atelier Vesper",
      storefront: "Atelier Vesper",
      ownerName: "Claire Dupont",
      ownerEmail: "claire@example.com",
      email: "claire@example.com",
      mobileNumber: "+91 98765 43212",
<<<<<<< HEAD
      businessAddress: "88 Linking Road, Bandra West, Mumbai",
      shopAddress: "88 Linking Road, Near National College, Bandra West, Mumbai 400050",
      location: {
        type: "Point",
        coordinates: [72.8335, 19.0607], // [lng, lat]
      },
      isOpen: true,
      quickDeliveryEnabled: true,
      prepTimeMin: 8,
      deliveryRadiusKm: 6,
      category: "Luxury Fashion & Silk",
      logo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80",
      rating: 4.8,
=======
      businessAddress: "88 Kensington High St, London",
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      listingsCount: 19,
      status: "approved",
      createdAt: new Date(),
    },
<<<<<<< HEAD
    {
      _id: "sel_4",
      shopName: "Royal Heritage Boutiques",
      storefront: "Royal Heritage Boutiques",
      ownerName: "Arjun Verma",
      ownerEmail: "arjun@example.com",
      email: "arjun@example.com",
      mobileNumber: "+91 98765 43214",
      businessAddress: "12 100 Feet Road, Indiranagar, Bengaluru",
      shopAddress: "12 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru 560038",
      location: {
        type: "Point",
        coordinates: [77.6408, 12.9784], // [lng, lat]
      },
      isOpen: true,
      quickDeliveryEnabled: true,
      prepTimeMin: 10,
      deliveryRadiusKm: 5,
      category: "Heritage Couture",
      logo: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&auto=format&fit=crop&q=80",
      rating: 4.95,
      listingsCount: 28,
      status: "approved",
      createdAt: new Date(),
    },
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
  ],
  customers: [
    { _id: "cust_1", name: "Vikram Malhotra", email: "vikram@example.com", tier: "Platinum", ordersCount: 14, lifetimeSpend: 28400, createdAt: new Date() },
    { _id: "cust_2", name: "Amara Okafor", email: "amara@example.com", tier: "Silver", ordersCount: 3, lifetimeSpend: 3120, createdAt: new Date() },
    { _id: "cust_3", name: "Elena Rostova", email: "elena@example.com", tier: "Platinum", ordersCount: 22, lifetimeSpend: 47900, createdAt: new Date() },
    { _id: "cust_4", name: "Julian Vance", email: "julian@example.com", tier: "Gold", ordersCount: 7, lifetimeSpend: 11800, createdAt: new Date() },
  ],
  activityLogs: [
    {
      _id: "act_init_1",
      eventType: "Login",
      userName: INITIAL_SUPERADMIN_NAME,
      email: INITIAL_SUPERADMIN_EMAIL,
      status: "success",
      ipAddress: "157.240.199.35",
      deviceInfo: "Chrome 128 on macOS",
      browser: "Chrome",
      os: "macOS",
      details: "Super Admin Console authentication verified",
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
    },
    {
      _id: "act_init_2",
      eventType: "Registration",
      userName: "Vikram Malhotra",
      email: "vikram@example.com",
      status: "success",
      ipAddress: "103.21.244.0",
      deviceInfo: "Safari on iOS (iPhone)",
      browser: "Safari",
      os: "iOS (iPhone)",
      details: "New customer registered via Web Form",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
    },
    {
      _id: "act_init_3",
      eventType: "Login",
      userName: "Elena Rostova",
      email: "elena@example.com",
      status: "success",
      ipAddress: "185.220.101.5",
      deviceInfo: "Chrome on Windows 11",
      browser: "Chrome",
      os: "Windows 11",
      details: "Password authentication verified against alikendshop.users",
      createdAt: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      _id: "act_init_4",
      eventType: "Failed Login",
      userName: "Unknown",
      email: "intruder@suspicious.net",
      status: "failed",
      ipAddress: "45.154.255.89",
      deviceInfo: "Firefox on Linux",
      browser: "Firefox",
      os: "Linux",
      details: "No account found in alikendshop.users",
      createdAt: new Date(Date.now() - 1000 * 60 * 240),
    },
  ],
  banners: INITIAL_BANNERS_SEED.map((b, i) => ({
    ...b,
    _id: `ban_seed_${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  categories: INITIAL_CATEGORIES_SEED.map((c, i) => ({
    ...c,
    _id: `cat_seed_${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
  platformSettings: {
    commissionRate: 5,
    platformBalance: 393,
    totalCommissionEarned: 393,
    updatedAt: new Date(),
  },
  platformWithdrawals: [],
  sellerWithdrawals: [],
  otps: [],
  flashSaleConfig: {
    title: "FLASH PREMIUM HOURS",
    subtitle: "Uncompromised pricing on luxury gear",
    bannerText: "⚡ Deals Refresh Every 24 Hours — Don't Miss Out!",
    targetEndTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    activeProducts: [
      { productId: "prod_2", flashPrice: 89999, discountPercent: 44, isFeatured: true, order: 1 },
      { productId: "prod_7", flashPrice: 19999, discountPercent: 43, isFeatured: true, order: 2 },
      { productId: "prod_9", flashPrice: 17999, discountPercent: 38, isFeatured: false, order: 3 },
      { productId: "prod_10", flashPrice: 12999, discountPercent: 35, isFeatured: false, order: 4 },
      { productId: "prod_11", flashPrice: 1299, discountPercent: 48, isFeatured: false, order: 5 },
    ],
    updatedAt: new Date(),
  },
  hotlines: [
    {
      _id: "htl_1",
      name: "Master Executive Concierge",
      phoneNumber: "+880 1800-254-536",
      extension: "Ext 101",
      department: "Executive Concierge",
      description: "Direct priority line for high-net-worth orders, custom commissions & executive inquiries.",
      operatingHours: "24/7 Round the Clock",
      whatsappNumber: "+880 1800-254-536",
      emailAddress: "concierge@alike-nd.com",
      isEmergency: false,
      isPriority: true,
      isActive: true,
      displayOrder: 1,
      callClickCount: 184,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "htl_2",
      name: "Order Tracking & Delivery Helpline",
      phoneNumber: "+880 1800-254-537",
      extension: "Ext 202",
      department: "Order Support",
      description: "Real-time courier dispatch status, address modifications, and 20-min express tracking.",
      operatingHours: "08:00 AM - 11:00 PM Daily",
      whatsappNumber: "+880 1800-254-537",
      emailAddress: "orders@alike-nd.com",
      isEmergency: false,
      isPriority: false,
      isActive: true,
      displayOrder: 2,
      callClickCount: 412,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "htl_3",
      name: "Technical Support & Warranty Claims",
      phoneNumber: "+880 1800-254-538",
      extension: "Ext 303",
      department: "Technical & IT",
      description: "App troubleshooting, payment gateway assistance, digital receipts & device warranty claims.",
      operatingHours: "09:00 AM - 08:00 PM (Sat-Thu)",
      whatsappNumber: "+880 1800-254-538",
      emailAddress: "tech@alike-nd.com",
      isEmergency: false,
      isPriority: false,
      isActive: true,
      displayOrder: 3,
      callClickCount: 96,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "htl_4",
      name: "VIP Platinum Private Desk",
      phoneNumber: "+880 1800-254-539",
      extension: "Ext 777",
      department: "VIP & High Value",
      description: "Reserved exclusively for verified Platinum members with dedicated personal care managers.",
      operatingHours: "24/7 Dedicated Line",
      whatsappNumber: "+880 1800-254-539",
      emailAddress: "vip@alike-nd.com",
      isEmergency: false,
      isPriority: true,
      isActive: true,
      displayOrder: 4,
      callClickCount: 145,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "htl_5",
      name: "24/7 Security & Fraud Escalation",
      phoneNumber: "+880 1800-254-999",
      extension: "Urgent",
      department: "General Inquiries",
      description: "Instant response for unauthorized account access, payment anomalies, and urgent fraud flags.",
      operatingHours: "24/7 Immediate Escalation",
      whatsappNumber: "+880 1800-254-999",
      emailAddress: "security@alike-nd.com",
      isEmergency: true,
      isPriority: true,
      isActive: true,
      displayOrder: 5,
      callClickCount: 52,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "htl_6",
      name: "Billing, Escrow & Refund Helpline",
      phoneNumber: "+880 1800-254-540",
      extension: "Ext 404",
      department: "Billing & Refunds",
      description: "Queries regarding card chargebacks, bKash/Nagad reversals, tax invoices, and refunds.",
      operatingHours: "09:00 AM - 06:00 PM Daily",
      whatsappNumber: "+880 1800-254-540",
      emailAddress: "billing@alike-nd.com",
      isEmergency: false,
      isPriority: false,
      isActive: true,
      displayOrder: 6,
      callClickCount: 219,
      createdBy: "Super Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  tickets: [
    {
      _id: "tkt_seed_1",
      ticketId: "TKT-2026-1042",
      customerName: "Vikram Malhotra",
      customerEmail: "vikram@example.com",
      customerPhone: "+880 1711-223344",
      customerId: "cust_1",
      subject: "Expedited delivery request for Royal Chronograph",
      description: "I placed order AN-5201 for the Royal Chronograph. Need delivery expedited before Friday for an anniversary gift.",
      category: "Order Tracking",
      subcategory: "Express Courier Request",
      priority: "High",
      status: "In Progress",
      assignedAgentId: "agt_1",
      assignedAgentName: "Zara Ahmed",
      assignedDepartment: "Order Support",
      replies: [
        {
          id: "rep_101",
          authorType: "customer",
          authorName: "Vikram Malhotra",
          authorEmail: "vikram@example.com",
          message: "Could you please confirm if this can be dispatched with the 20-min express courier team?",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 5),
        },
        {
          id: "rep_102",
          authorType: "staff",
          authorName: "Zara Ahmed (Support Agent)",
          authorEmail: "zara.care@alike-nd.com",
          message: "Greetings Mr. Malhotra! We have prioritized your order AN-5201 with the premium warehouse courier team. Expected dispatch window is tomorrow 10:00 AM.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
        {
          id: "rep_103",
          authorType: "staff",
          authorName: "Zara Ahmed (Support Agent)",
          authorEmail: "zara.care@alike-nd.com",
          message: "Internal Note: Contacted hub manager to double-bubble wrap and provide VIP gift seal.",
          isInternalNote: true,
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      ],
      tags: ["VIP", "Order AN-5201", "FastTrack"],
      slaDeadline: new Date(Date.now() + 3600000 * 8),
      createdAt: new Date(Date.now() - 3600000 * 6),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: "tkt_seed_2",
      ticketId: "TKT-2026-1043",
      customerName: "Nusrat Jahan",
      customerEmail: "nusrat@example.com",
      customerPhone: "+880 1722-334455",
      customerId: "cust_2",
      subject: "Shipping address update prior to dispatch",
      description: "Please update the apartment number from Apt 4B to Penthouse 12A for order AN-5202.",
      category: "Order Tracking",
      subcategory: "Address Correction",
      priority: "Normal",
      status: "Open",
      assignedAgentId: "agt_2",
      assignedAgentName: "Fahim Rahman",
      assignedDepartment: "Order Support",
      replies: [
        {
          id: "rep_201",
          authorType: "customer",
          authorName: "Nusrat Jahan",
          authorEmail: "nusrat@example.com",
          message: "Please ensure the delivery rider has the updated apartment buzzer code.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      ],
      tags: ["Address Change", "Pending Action"],
      slaDeadline: new Date(Date.now() + 3600000 * 12),
      createdAt: new Date(Date.now() - 3600000 * 2),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: "tkt_seed_3",
      ticketId: "TKT-2026-1044",
      customerName: "Tanvir Ahmed",
      customerEmail: "tanvir@example.com",
      customerPhone: "+880 1733-445566",
      customerId: "cust_3",
      subject: "Package arrived with damaged outer luxury box",
      description: "The exterior courier box had a dent which penetrated the audio equipment presentation carton. Requesting swift replacement unit.",
      category: "Defective / Damaged Product",
      subcategory: "Courier Transit Damage",
      priority: "Urgent",
      status: "Escalated",
      assignedAgentId: "agt_3",
      assignedAgentName: "Imran Hossain",
      assignedDepartment: "Technical & IT",
      replies: [
        {
          id: "rep_301",
          authorType: "customer",
          authorName: "Tanvir Ahmed",
          authorEmail: "tanvir@example.com",
          message: "Attaching photos of the unboxing. Equipment is untouched but box is crushed.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 8),
        },
        {
          id: "rep_302",
          authorType: "staff",
          authorName: "Imran Hossain (Support Manager)",
          authorEmail: "imran.manager@alike-nd.com",
          message: "Internal Note: Escalated directly to logistics quality auditor. Replacement unit placed on hold for immediate swap dispatch upon customer pickup.",
          isInternalNote: true,
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          id: "rep_303",
          authorType: "staff",
          authorName: "Imran Hossain (Support Manager)",
          authorEmail: "imran.manager@alike-nd.com",
          message: "Dear Mr. Tanvir, our apologies for the transit issue. Our executive courier will arrive at your door today with a brand-new factory-sealed replacement and collect the damaged carton at zero charge.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
      ],
      tags: ["Damage Claim", "Courier Escalation", "Swap"],
      slaDeadline: new Date(Date.now() + 3600000 * 2),
      createdAt: new Date(Date.now() - 3600000 * 8),
      updatedAt: new Date(Date.now() - 3600000 * 3),
    },
    {
      _id: "tkt_seed_4",
      ticketId: "TKT-2026-1045",
      customerName: "Ayesha Siddiqua",
      customerEmail: "ayesha@example.com",
      customerPhone: "+880 1744-556677",
      customerId: "cust_4",
      subject: "Platinum membership private concierge activation",
      description: "I recently reached Platinum status and would like information on how to schedule a private stylist consultation.",
      category: "General Inquiry",
      subcategory: "VIP Concierge",
      priority: "Normal",
      status: "Resolved",
      assignedAgentId: "agt_4",
      assignedAgentName: "Sarah Jenkins",
      assignedDepartment: "Executive Concierge",
      replies: [
        {
          id: "rep_401",
          authorType: "staff",
          authorName: "Sarah Jenkins (Head of Care)",
          authorEmail: "sarah.lead@alike-nd.com",
          message: "Welcome to ALIKE-ND Platinum! Your private concierge desk is now active on WhatsApp (+880 1800-254-539). We have assigned your personal stylist for bespoke consultation.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 18),
        },
      ],
      tags: ["VIP", "Platinum", "Onboarding"],
      csatRating: 5,
      csatFeedback: "Superb and fast response from the concierge team!",
      resolvedAt: new Date(Date.now() - 3600000 * 16),
      closedAt: new Date(Date.now() - 3600000 * 16),
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 16),
    },
    {
      _id: "tkt_seed_5",
      ticketId: "TKT-2026-1046",
      customerName: "Rahim Chowdhury",
      customerEmail: "rahim@example.com",
      customerPhone: "+880 1755-667788",
      customerId: "cust_5",
      subject: "Refund status for returned Italian leather folio",
      description: "Returned item was received at your hub 2 days ago. Inquiring about credit reversal timeline to my original Visa card.",
      category: "Refund & Return",
      subcategory: "Card Reversal",
      priority: "High",
      status: "Waiting for Customer",
      assignedAgentId: "agt_1",
      assignedAgentName: "Zara Ahmed",
      assignedDepartment: "Billing & Refunds",
      replies: [
        {
          id: "rep_501",
          authorType: "staff",
          authorName: "Zara Ahmed (Support Agent)",
          authorEmail: "zara.care@alike-nd.com",
          message: "Dear Mr. Rahim, our quality inspection approved your return. Please confirm the last 4 digits of your payment card so our billing team can cross-verify the bank transaction.",
          isInternalNote: false,
          createdAt: new Date(Date.now() - 3600000 * 7),
        },
      ],
      tags: ["Refund", "Billing"],
      slaDeadline: new Date(Date.now() + 3600000 * 14),
      createdAt: new Date(Date.now() - 3600000 * 14),
      updatedAt: new Date(Date.now() - 3600000 * 7),
    },
  ],
  knowledgeArticles: [
    {
      _id: "faq_1",
      title: "How do I track my luxury courier dispatch?",
      category: "Orders & Delivery",
      summary: "Step-by-step instructions for real-time tracking, SMS PIN verification, and 20-min express fulfillment.",
      content: "All orders placed on ALIKE-ND are assigned a tracked luxury dispatch number. Once packed at our climate-controlled fulfillment hub, an encrypted live-tracking SMS and email link is automatically dispatched to you. For 20-Minute Express eligible zones in central metro sectors, you can watch rider approach in real-time.",
      status: "published",
      viewsCount: 1420,
      helpfulCount: 388,
      tags: ["Tracking", "Courier", "Fulfillment"],
      author: "Logistics Desk",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "faq_2",
      title: "Authenticity Certificate & 100% Buyer Protection Guarantee",
      category: "Troubleshooting",
      summary: "Details about serial verification, tamper-evident seals, and manufacturer escrow protection.",
      content: "Every timepiece, premium electronics unit, and designer leather accessory undergoes rigorous physical inspection by certified master appraisers before shipment. Items include a serialized digital certificate of authenticity backed by our 100% money-back escrow guarantee.",
      status: "published",
      viewsCount: 940,
      helpfulCount: 260,
      tags: ["Authenticity", "Warranty", "Escrow"],
      author: "Quality Council",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "faq_3",
      title: "Refund Timeline for Cards, bKash & Bank Transfers",
      category: "Payments & Refunds",
      summary: "Standard processing timeframes for mobile financial services, credit cards, and instant store wallet credit.",
      content: "Approved refunds are released instantly to your ALIKE-ND Store Balance. For original payment reversal: bKash/Nagad transactions settle within 2 to 24 hours. Visa/Mastercard bank reversals depend on your issuing bank and take 3 to 7 business banking days.",
      status: "published",
      viewsCount: 1110,
      helpfulCount: 305,
      tags: ["Refund", "bKash", "Card"],
      author: "Billing Support",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "faq_4",
      title: "Platinum & VIP Concierge Services Overview",
      category: "Account & Security",
      summary: "Privileges of high-tier membership including dedicated private stylists, prioritized queues, and unlisted inventory access.",
      content: "Members attaining Platinum tier unlock the 24/7 dedicated private hotline (+880 1800-254-539), private WhatsApp concierge line, zero delivery fees across all orders, and bespoke white-glove unboxing.",
      status: "published",
      viewsCount: 680,
      helpfulCount: 195,
      tags: ["VIP", "Platinum", "Concierge"],
      author: "Executive Office",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: "faq_5",
      title: "Hassle-Free 7-Day Return & Replacement Guidelines",
      category: "Returns Policy",
      summary: "How to lodge an immediate replacement request with free courier doorstep pickup.",
      content: "If an item does not meet expectations or arrived defective, open a claim within 7 calendar days of receipt. Our concierge courier will collect the package directly from your home address at no charge.",
      status: "published",
      viewsCount: 1250,
      helpfulCount: 410,
      tags: ["Returns", "Replacement", "Doorstep Pickup"],
      author: "Customer Rights",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  supportAgents: [
    {
      _id: "agt_1",
      name: "Zara Ahmed",
      email: "zara.care@alike-nd.com",
      role: "Support Agent",
      department: "Order Support",
      status: "Active",
      assignedTicketsCount: 8,
      resolvedTicketsCount: 42,
      avgCsat: 4.9,
      phone: "+880 1700-112233",
      createdAt: new Date(),
    },
    {
      _id: "agt_2",
      name: "Fahim Rahman",
      email: "fahim.care@alike-nd.com",
      role: "Support Agent",
      department: "Order Support",
      status: "Active",
      assignedTicketsCount: 6,
      resolvedTicketsCount: 38,
      avgCsat: 4.8,
      phone: "+880 1700-223344",
      createdAt: new Date(),
    },
    {
      _id: "agt_3",
      name: "Imran Hossain",
      email: "imran.manager@alike-nd.com",
      role: "Support Manager",
      department: "Technical & IT",
      status: "Active",
      assignedTicketsCount: 4,
      resolvedTicketsCount: 65,
      avgCsat: 5.0,
      phone: "+880 1700-334455",
      createdAt: new Date(),
    },
    {
      _id: "agt_4",
      name: "Sarah Jenkins",
      email: "sarah.lead@alike-nd.com",
      role: "Head of Care",
      department: "Executive Concierge",
      status: "Active",
      assignedTicketsCount: 3,
      resolvedTicketsCount: 90,
      avgCsat: 5.0,
      phone: "+880 1700-445566",
      createdAt: new Date(),
    },
  ],
  customerCareAuditLogs: [
    {
      _id: "cc_log_1",
      action: "HOTLINE_VERIFIED",
      targetId: "htl_1",
      targetType: "hotline",
      performedBy: "Super Admin",
      details: "Master Executive Concierge hotline verified and activated on central portal.",
      ip: "127.0.0.1",
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
    {
      _id: "cc_log_2",
      action: "TICKET_ESCALATED",
      targetId: "TKT-2026-1044",
      targetType: "ticket",
      performedBy: "Zara Ahmed",
      details: "Transit damage claim escalated to Support Manager Imran Hossain.",
      ip: "127.0.0.1",
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
    {
      _id: "cc_log_3",
      action: "HOTLINE_CREATED",
      targetId: "htl_5",
      targetType: "hotline",
      performedBy: "Super Admin",
      details: "24/7 Security & Fraud Escalation line created and given priority routing.",
      ip: "127.0.0.1",
      createdAt: new Date(Date.now() - 3600000 * 48),
    },
  ],
  customerCareSettings: {
    autoResponderEnabled: true,
    autoResponderMessage: "Thank you for reaching ALIKE-ND Customer Care. An authorized concierge representative will review your request within 15 minutes.",
    workingHoursNotice: "Live phone hotlines are operational 24/7 for Executive & Emergency lines. Standard departments operate 08:00 AM to 11:00 PM.",
    emergencyBannerText: "⚡ 24/7 Emergency Line is actively monitoring transit, payment security, and priority concierge requests.",
    emergencyBannerActive: true,
    whatsappChatEnabled: true,
    emailNotificationsEnabled: true,
    defaultSlaHours: 12,
    updatedAt: new Date(),
  },
<<<<<<< HEAD
  returnRequests: [
    {
      _id: "ret_seed_1",
      returnId: "RET-2026-9041",
      orderNumber: "AN-5199",
      orderId: "ord_3",
      customerId: "cust_3",
      customerName: "Elena Rostova",
      customerEmail: "elena@example.com",
      customerPhone: "+880 1933-445566",
      productId: 3,
      productName: "Signature Cashmere Trench Coat",
      productImage: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400",
      variant: "Camel Tan / Size 40",
      size: "40",
      color: "Camel Tan",
      unitPrice: 4200,
      quantity: 1,
      purchaseDate: new Date(Date.now() - 86400000 * 5),
      deliveryDate: new Date(Date.now() - 86400000 * 2),
      returnReason: "Size Does Not Fit",
      customerDescription: "Trench coat fits slightly snug around shoulders. Requesting replacement in Size 42 if available, otherwise store credit refund.",
      evidenceImages: [
        "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=600",
      ],
      requestedResolution: "replacement",
      status: "Requested",
      assignedStaff: {
        id: "admin_staff_1",
        name: "Regular Staff Admin",
        email: "admin234@gmail.com",
      },
      courierName: "Alike Express Courier",
      trackingNumber: "",
      inspectionResult: "pending",
      inspectionNotes: "",
      restocked: false,
      refundMethod: "wallet",
      refundAmount: 4200,
      refundDeduction: 0,
      refundDeductionReason: "",
      refundTransactionRef: "",
      refundStatus: "pending",
      rejectionReason: "",
      internalNotes: [
        {
          id: "ret_note_1",
          author: "Regular Staff Admin",
          note: "Customer verified VIP buyer. Check warehouse for Size 42 before approving refund.",
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
      ],
      auditLog: [
        {
          action: "RETURN_CREATED",
          performedBy: "Elena Rostova (Customer)",
          timestamp: new Date(Date.now() - 3600000 * 5),
          notes: "Customer self-service request submitted online.",
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5),
      updatedAt: new Date(Date.now() - 3600000 * 3),
    },
    {
      _id: "ret_seed_2",
      returnId: "RET-2026-9042",
      orderNumber: "AN-5200",
      orderId: "ord_2",
      customerId: "cust_2",
      customerName: "Sara Whitfield",
      customerEmail: "sara@example.com",
      customerPhone: "+91 98765 43210",
      productId: 2,
      productName: "Heritage Leather Weekend Duffle",
      productImage: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400",
      variant: "Cognac Brown",
      size: "Standard",
      color: "Cognac Brown",
      unitPrice: 1250,
      quantity: 1,
      purchaseDate: new Date(Date.now() - 86400000 * 8),
      deliveryDate: new Date(Date.now() - 86400000 * 4),
      returnReason: "Damaged / Defective on Arrival",
      customerDescription: "Brass zipper on left side pocket jammed during initial unboxing.",
      evidenceImages: [
        "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=600",
      ],
      requestedResolution: "refund",
      status: "Pickup Scheduled",
      assignedStaff: {
        id: "admin_super_1",
        name: "Super Admin",
        email: "developer.alikend@gmail.com",
      },
      courierName: "DHL Express Luxury",
      trackingNumber: "DHL-RET-7729104",
      pickupScheduledDate: new Date(Date.now() + 86400000 * 1),
      inspectionResult: "pending",
      inspectionNotes: "",
      restocked: false,
      refundMethod: "original_payment",
      refundAmount: 1250,
      refundDeduction: 0,
      refundDeductionReason: "",
      refundTransactionRef: "",
      refundStatus: "pending",
      rejectionReason: "",
      internalNotes: [],
      auditLog: [
        {
          action: "RETURN_APPROVED",
          performedBy: "Super Admin",
          timestamp: new Date(Date.now() - 3600000 * 12),
          notes: "Hardware fault confirmed from photo. Doorstep pickup arranged.",
        },
        {
          action: "PICKUP_SCHEDULED",
          performedBy: "Super Admin",
          timestamp: new Date(Date.now() - 3600000 * 2),
          notes: "Scheduled via DHL Express with tracking DHL-RET-7729104",
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      _id: "ret_seed_3",
      returnId: "RET-2026-9043",
      orderNumber: "AN-5188",
      orderId: "ord_prev_1",
      customerId: "cust_1",
      customerName: "Vikram Malhotra",
      customerEmail: "vikram@example.com",
      customerPhone: "+880 1711-223344",
      productId: 1,
      productName: "Obsidian Chronograph Watch",
      productImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400",
      variant: "42mm Sapphire",
      size: "42mm",
      color: "Obsidian Black",
      unitPrice: 2400,
      quantity: 1,
      purchaseDate: new Date(Date.now() - 86400000 * 14),
      deliveryDate: new Date(Date.now() - 86400000 * 10),
      returnReason: "Quality Did Not Meet Expectations",
      customerDescription: "Strap finish slightly darker than display photograph.",
      evidenceImages: [],
      requestedResolution: "refund",
      status: "Completed",
      assignedStaff: {
        id: "admin_super_1",
        name: "Super Admin",
        email: "developer.alikend@gmail.com",
      },
      courierName: "Alike Express Courier",
      trackingNumber: "ALK-RET-992144",
      pickupScheduledDate: new Date(Date.now() - 86400000 * 5),
      pickupCompletedDate: new Date(Date.now() - 86400000 * 4),
      inspectionResult: "resalable",
      inspectionNotes: "Item in pristine factory packaging with original seal intact.",
      restocked: true,
      refundMethod: "wallet",
      refundAmount: 2400,
      refundDeduction: 0,
      refundDeductionReason: "",
      refundTransactionRef: "WAL-REF-884920",
      refundStatus: "processed",
      rejectionReason: "",
      internalNotes: [],
      auditLog: [
        {
          action: "INSPECTION_COMPLETED",
          performedBy: "Quality Hub Inspector",
          timestamp: new Date(Date.now() - 86400000 * 3),
          notes: "Passed Swiss grade appraisal. Returned to live sellable inventory.",
        },
        {
          action: "REFUND_PROCESSED",
          performedBy: "Super Admin",
          timestamp: new Date(Date.now() - 86400000 * 2),
          notes: "2400 credited directly to customer wallet.",
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 9),
      updatedAt: new Date(Date.now() - 86400000 * 2),
    },
  ],
  returnPolicy: {
    key: "default_policy",
    eligibilityDays: 7,
    returnFee: 0,
    requireEvidence: true,
    eligibleCategories: [
      "Electronics & Gadgets",
      "Fashion & Apparel",
      "Home & Living",
      "Watches & Accessories",
      "Footwear",
    ],
    nonReturnableCategories: [
      "Intimates & Swimwear",
      "Custom / Bespoke Atelier Items",
      "Perishable Goods",
    ],
    reasons: [
      "Damaged / Defective on Arrival",
      "Size Does Not Fit",
      "Item Different from Photos / Description",
      "Incorrect Item Delivered",
      "Quality Did Not Meet Expectations",
      "Changed Mind / No Longer Needed",
    ],
    pickupEnabled: true,
    autoApproveVip: false,
    updatedBy: "Super Admin",
    updatedAt: new Date(),
  },
  advertisements: [],
  rides: [],
  drivers: [
    {
      _id: "drv_bike_1",
      name: "Rahul Sharma",
      phone: "+91 98765 43210",
      email: "rahul.driver@example.com",
      passwordHash: INITIAL_ADMIN_SEED_HASH || "$2a$10$wN/a7R61p0u1fVqP2n.z0.wK8Q9sZ9N1F7M4v4c8z1p0u1fVqP2n.",
      vehicleType: "bike",
      vehicleNumber: "DL 03 AK 7821",
      vehicleModel: "Hero Splendor Plus (Black)",
      licenseNumber: "DL-1420110012345",
      status: "approved",
      isOnline: true,
      location: {
        type: "Point",
        coordinates: [77.2185, 28.6325], // Near Connaught Place
      },
      locationUpdatedAt: new Date(),
      rating: 4.88,
      totalRides: 842,
      earningsToday: 760,
      totalEarnings: 34200,
      createdAt: new Date(),
    },
    {
      _id: "drv_auto_1",
      name: "Rameshwar Yadav",
      phone: "+91 98112 55678",
      email: "rameshwar.driver@example.com",
      passwordHash: INITIAL_ADMIN_SEED_HASH || "$2a$10$wN/a7R61p0u1fVqP2n.z0.wK8Q9sZ9N1F7M4v4c8z1p0u1fVqP2n.",
      vehicleType: "auto",
      vehicleNumber: "DL 1R AA 4920",
      vehicleModel: "Bajaj Compact RE (Green/Yellow)",
      licenseNumber: "DL-0420090098765",
      status: "approved",
      isOnline: true,
      location: {
        type: "Point",
        coordinates: [77.2145, 28.6310], // Near Connaught Place
      },
      locationUpdatedAt: new Date(),
      rating: 4.85,
      totalRides: 3120,
      earningsToday: 1120,
      totalEarnings: 98400,
      createdAt: new Date(),
    },
    {
      _id: "drv_cab_1",
      name: "Vikramjeet Singh",
      phone: "+91 99990 88776",
      email: "vikram.cab@example.com",
      passwordHash: INITIAL_ADMIN_SEED_HASH || "$2a$10$wN/a7R61p0u1fVqP2n.z0.wK8Q9sZ9N1F7M4v4c8z1p0u1fVqP2n.",
      vehicleType: "cab",
      vehicleNumber: "DL 1Y DZ 9001",
      vehicleModel: "Honda City V (Pearl White)",
      licenseNumber: "DL-0820150045678",
      status: "approved",
      isOnline: true,
      location: {
        type: "Point",
        coordinates: [77.2198, 28.6340], // Near Connaught Place
      },
      locationUpdatedAt: new Date(),
      rating: 4.96,
      totalRides: 4200,
      earningsToday: 2450,
      totalEarnings: 184500,
      createdAt: new Date(),
    },
  ],
  rideSettings: {
    bike: { baseFare: 25, perKmRate: 9, minimumFare: 30 },
    auto: { baseFare: 35, perKmRate: 12, minimumFare: 45 },
    cab: { baseFare: 60, perKmRate: 16, minimumFare: 80 },
    emergencyNumber: "112",
    updatedAt: new Date(),
  },
  savedPlaces: [],
  rideDisputes: [],
  safetyIncidents: [],
  deliveryTasks: [],
  deliveryPartners: [],
  deliveryEarnings: [],
  deliveryPayouts: [],
  deliveryAdjustments: [],
  deliveryIncidents: [],
  deliveryDisputes: [],
  deliveryAnnouncements: [],
  deliveryReviews: [],
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
};

let lastConnectionError: string | null = null;
let lastMaskedUri: string | null = null;
let isConnecting = false;
let authFailed = false;

// Serverless connection promise cache: prevents concurrent cold-start race conditions
let cachedPromise: Promise<typeof mongoose | null> | null = null;

// Attach persistent mongoose event listeners to prevent unhandled error crashes
mongoose.connection.on("error", (err) => {
  const rawMsg = err?.message || String(err);
  if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("tlsv1 alert internal error")) {
    lastConnectionError = "MongoDB Atlas rejected the TLS handshake (SSL alert 80). Operating in automatic sync fallback mode.";
    console.log("ℹ️ [MONGODB ATLAS NOTICE] IP Whitelist needed in Atlas (0.0.0.0/0). In-memory fallback active.");
  } else if (rawMsg.toLowerCase().includes("auth failed") || rawMsg.toLowerCase().includes("authentication failed") || rawMsg.includes("bad auth")) {
    authFailed = true;
    lastConnectionError = "MongoDB Atlas authentication failed: invalid credentials in MONGO_URI. Operating in automatic in-memory mode.";
    console.log("ℹ️ [MONGODB ATLAS NOTICE] Database credentials authentication failed. Operating in automatic in-memory mode.");
  } else {
    lastConnectionError = rawMsg;
    console.log("ℹ️ [MONGODB NOTICE]:", rawMsg);
  }
});

mongoose.connection.on("disconnected", () => {
  console.log("ℹ️ [MONGODB STATUS] Connection dropped or inactive. Falling back to in-memory store.");
});

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getMongoDbInfo() {
  return {
    connected: isMongoConnected(),
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || (isMongoConnected() ? "alikendshop" : "offline_in_memory"),
    host: mongoose.connection.host || "none",
    connectionError: lastConnectionError,
    maskedUri: lastMaskedUri,
  };
}

/**
 * Resilient, serverless-optimized MongoDB connection with:
 * - Connection reuse across warm serverless invocations
 * - In-flight promise caching to avoid cold-start race conditions
 * - Calibrated serverless timeouts (15s serverSelection/connect) to accommodate TLS & SRV lookup
 * - Serverless connection pooling (maxPoolSize: 5, minPoolSize: 0, maxIdleTimeMS: 15s)
 * - Automatic single retry with 1000ms backoff on transient connection timeouts
 */
export async function connectMongoDB(force = false): Promise<typeof mongoose | null> {
  // 1. Connection reuse: if already connected (readyState 1), return immediately
  if (isMongoConnected() && !force) {
    return mongoose;
  }

  // 2. Race condition protection: if connection is already in-flight, await the same promise
  if (cachedPromise && !force) {
    return await cachedPromise;
  }

  // 3. Fast failure: if previous attempt failed permanently due to invalid credentials, do not hammer Atlas
  if (authFailed && !force) {
    return null;
  }

  if (force) {
    authFailed = false;
    cachedPromise = null;
  }

  const rawUri = process.env.MONGO_URI;

  if (!rawUri || !rawUri.trim() || rawUri.includes("xxxxx") || rawUri.includes("<password>")) {
    lastConnectionError = "MongoDB URI not configured or contains placeholder credentials. Operating in automatic in-memory mode.";
    lastMaskedUri = rawUri ? rawUri.replace(/\/\/[^:]+:([^@]+)@/, (m, p1) => m.replace(p1, "****")) : "unconfigured";
    console.log("ℹ️ [MONGODB NOTICE] MONGO_URI not configured with live credentials. In-memory data store active.");
    return null;
  }

  const uri = rawUri.trim();
  lastMaskedUri = uri.replace(/\/\/[^:]+:([^@]+)@/, (m, p1) => m.replace(p1, "****"));

  // Create the connection execution promise and cache it
  cachedPromise = (async () => {
    isConnecting = true;
    const maxRetries = 1; // 1 automatic retry on transient cold start failures
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      try {
        mongoose.set("bufferCommands", false);
        console.log(`🔌 [MONGODB CONNECTING] Attempt ${attempt}/${maxRetries + 1} to ${lastMaskedUri}... Target DB: 'alikendshop'`);

        await mongoose.connect(uri, {
          dbName: "alikendshop",
          // 15s server selection: Gives serverless cold starts sufficient time for DNS/TLS/SDAM
          serverSelectionTimeoutMS: 15000,
          // 15s initial TCP connect timeout
          connectTimeoutMS: 15000,
          // 45s socket timeout: Prevents premature termination during slower queries
          socketTimeoutMS: 45000,
          // Serverless connection pool: Low max to prevent Atlas M0/M2/M10 connection exhaustion across Lambdas
          maxPoolSize: 5,
          // minPoolSize: 0 ensures cold/frozen serverless containers do not hold open idle sockets
          minPoolSize: 0,
          // Drop idle sockets after 15 seconds to free Atlas resources
          maxIdleTimeMS: 15000,
        });

        lastConnectionError = null;
        console.log(`✅ [MONGODB CONNECTED] Connected successfully! Database: "${mongoose.connection.name}", Host: ${mongoose.connection.host}`);
        break; // Successfully connected, break out of retry loop
      } catch (err: any) {
        const rawMsg = err?.message || String(err);
        const isAuthError = rawMsg.toLowerCase().includes("auth failed") || rawMsg.toLowerCase().includes("authentication failed") || rawMsg.includes("bad auth");
        const isTransient = rawMsg.includes("Server selection timed out") || rawMsg.includes("ETIMEDOUT") || rawMsg.includes("ECONNRESET") || rawMsg.includes("ENOTFOUND");

        // Do not retry fatal authentication errors
        if (isAuthError) {
          authFailed = true;
          lastConnectionError = "MongoDB Atlas authentication failed: invalid credentials in MONGO_URI. Operating in automatic in-memory mode.";
          console.log("ℹ️ [MONGODB ATLAS NOTICE] Database credentials authentication failed. In-memory fallback active.");
          throw err;
        }

        // If we still have a retry left and the error is transient, wait 1s before retrying
        if (attempt <= maxRetries && isTransient) {
          console.warn(`⚠️ [MONGODB RETRY] Transient cold-start error on attempt ${attempt}: "${rawMsg}". Retrying in 1000ms...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        // Final failure handling
        if (rawMsg.includes("SSL alert number 80") || rawMsg.includes("IP that isn't whitelisted")) {
          lastConnectionError = "MongoDB Atlas requires IP Whitelist (0.0.0.0/0). Running in automatic in-memory sync mode.";
          console.log("ℹ️ [MONGODB ATLAS NOTICE] IP Whitelist needed in Atlas (0.0.0.0/0). In-memory fallback active.");
        } else {
          lastConnectionError = rawMsg;
          console.log("ℹ️ [MONGODB NOTICE]:", rawMsg);
        }
        throw err;
      }
    }

    return mongoose;
  })()
    .catch((err) => {
      // Clear cached promise on failure so future invocations can re-attempt
      cachedPromise = null;
      return null;
    })
    .finally(() => {
      isConnecting = false;
      // If after execution we are still not connected, clear cached promise
      if (!isMongoConnected()) {
        cachedPromise = null;
      }
    });

  const result = await cachedPromise;
  if (!result || !isMongoConnected()) {
    return null;
  }

    // ADMIN MANAGEMENT & SEEDING in alikendshop.admins
    try {
      // 1. Ensure Superadmin exists with role "superadmin"
      const existingSuper = await Admin.findOne({ email: INITIAL_SUPERADMIN_EMAIL });
      if (!existingSuper) {
        if (INITIAL_ADMIN_SEED_HASH) {
          await Admin.create({
            email: INITIAL_SUPERADMIN_EMAIL,
            passwordHash: INITIAL_ADMIN_SEED_HASH,
            name: INITIAL_SUPERADMIN_NAME,
            role: "superadmin",
            isActive: true,
          });
          console.log(`✨ [MONGODB SEED] Super Admin account created in alikendshop.admins: ${INITIAL_SUPERADMIN_EMAIL}`);
        } else {
          console.warn("⚠️ No superadmin account exists and INITIAL_ADMIN_PASSWORD is not set — set this environment variable in Vercel and redeploy to create the initial superadmin account securely.");
        }
      } else {
        // Dynamic preservation: Initialize passwordHash if empty in MongoDB only if seed hash is configured
        if ((!existingSuper.passwordHash || existingSuper.passwordHash === "") && INITIAL_ADMIN_SEED_HASH) {
          existingSuper.passwordHash = INITIAL_ADMIN_SEED_HASH;
        }
        if (existingSuper.role !== "superadmin" || !existingSuper.isActive) {
          existingSuper.role = "superadmin";
          existingSuper.isActive = true;
        }
        await existingSuper.save();

        // Sync real MongoDB passwordHash into memoryStore.admins fallback
        if (existingSuper.passwordHash) {
          const memSuper = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === INITIAL_SUPERADMIN_EMAIL);
          if (memSuper) {
            memSuper.passwordHash = existingSuper.passwordHash;
          }
        }
      }

      // 2. Ensure initial regular Admin exists with role "admin"
      const existingStaff = await Admin.findOne({ email: INITIAL_STAFF_EMAIL });
      if (!existingStaff) {
        if (INITIAL_ADMIN_SEED_HASH) {
          await Admin.create({
            email: INITIAL_STAFF_EMAIL,
            passwordHash: INITIAL_ADMIN_SEED_HASH,
            name: "Regular Staff Admin",
            role: "admin",
            isActive: true,
          });
          console.log(`✨ [MONGODB SEED] Initial Regular Admin created in alikendshop.admins: ${INITIAL_STAFF_EMAIL}`);
        }
      } else {
        // Dynamic preservation: Initialize passwordHash if empty in MongoDB only if seed hash is configured
        if ((!existingStaff.passwordHash || existingStaff.passwordHash === "") && INITIAL_ADMIN_SEED_HASH) {
          existingStaff.passwordHash = INITIAL_ADMIN_SEED_HASH;
        }
        if (!existingStaff.isActive) {
          existingStaff.isActive = true;
        }
        await existingStaff.save();

        // Sync real MongoDB passwordHash into memoryStore.admins fallback
        if (existingStaff.passwordHash) {
          const memStaff = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === INITIAL_STAFF_EMAIL);
          if (memStaff) {
            memStaff.passwordHash = existingStaff.passwordHash;
          }
        }
      }

      // 3. Dynamic Admin Accounts: Sync any other live MongoDB admin passwordHashes to memoryStore.admins
      const liveAdmins = await Admin.find().lean();
      for (const liveAdmin of liveAdmins) {
        if (liveAdmin.email && liveAdmin.passwordHash) {
          const cleanEmail = liveAdmin.email.toLowerCase().trim();
          const targetMem = (memoryStore.admins || []).find((a) => a.email.toLowerCase() === cleanEmail);
          if (targetMem) {
            targetMem.passwordHash = liveAdmin.passwordHash;
          }
        }
      }

      // 4. Seed Products if empty or sync products
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        console.log("📦 [MONGODB SEED] Seeding full catalog items into alikendshop.products...");
        for (const p of INITIAL_PRODUCTS_SEED) {
          const { _id, ...pData } = p;
          await Product.create(pData);
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${INITIAL_PRODUCTS_SEED.length} products in alikendshop.products`);
      }

      const totalAdmins = await Admin.countDocuments();
      console.log(`🔒 [ADMIN AUDIT] Total admin accounts in 'alikendshop.admins': ${totalAdmins}`);

      // 5. Seed Hero Carousel Banners if empty in alikendshop.banners
      const bannerCount = await Banner.countDocuments();
      if (bannerCount === 0) {
        console.log("🎨 [MONGODB SEED] Seeding initial hero slides into alikendshop.banners...");
        for (const b of INITIAL_BANNERS_SEED) {
          await Banner.create(b);
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${INITIAL_BANNERS_SEED.length} banners in alikendshop.banners`);
      }

      // 6. Seed Categories if empty in alikendshop.categories
      const catCount = await Category.countDocuments();
      if (catCount === 0) {
        console.log("🏷️ [MONGODB SEED] Seeding initial category cards into alikendshop.categories...");
        for (const c of INITIAL_CATEGORIES_SEED) {
          await Category.create(c);
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${INITIAL_CATEGORIES_SEED.length} categories in alikendshop.categories`);
      }

      // Seed Superadmin user in alikendshop.users
      const existingUserNoyon = await User.findOne({ email: INITIAL_SUPERADMIN_EMAIL });
      if (!existingUserNoyon && INITIAL_ADMIN_SEED_HASH) {
        await User.create({
          fullName: INITIAL_SUPERADMIN_NAME,
          email: INITIAL_SUPERADMIN_EMAIL,
          country: "+880",
          mobileNumber: "1700000000",
          phone: "+880 1700000000",
          passwordHash: INITIAL_ADMIN_SEED_HASH,
          tier: "Platinum",
          verified: true,
        });
      }

<<<<<<< HEAD
      // 7. Seed Initial Approved Sellers if empty in alikendshop.sellers
      const sellerCount = await Seller.countDocuments();
      if (sellerCount === 0 && memoryStore.sellers && memoryStore.sellers.length > 0) {
        console.log("🏪 [MONGODB SEED] Seeding approved sellers into alikendshop.sellers...");
        for (const s of memoryStore.sellers) {
          const { _id, ...sData } = s as any;
          await Seller.create({
            ...sData,
            status: sData.status || "approved",
          }).catch((err) => console.warn(`Failed to seed seller ${sData.shopName}:`, err?.message));
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${memoryStore.sellers.length} sellers in alikendshop.sellers`);
      }

      // 8. Seed Initial Orders if empty in alikendshop.orders
      const orderCount = await Order.countDocuments();
      if (orderCount === 0 && memoryStore.orders && memoryStore.orders.length > 0) {
        console.log("📋 [MONGODB SEED] Seeding demo orders into alikendshop.orders...");
        for (const o of memoryStore.orders) {
          const { _id, ...oData } = o as any;
          await Order.create({
            ...oData,
            status: oData.status || "processing",
          }).catch((err) => console.warn(`Failed to seed order ${oData.orderNumber}:`, err?.message));
        }
        console.log(`✨ [MONGODB SEED] Successfully seeded ${memoryStore.orders.length} orders in alikendshop.orders`);
      }

      // 9. Ensure Platform Settings exist in alikendshop.platform_settings
=======
      // 5. Ensure Platform Settings exist in alikendshop.platform_settings
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
      const existingSetting = await PlatformSetting.findOne({ key: "commission_settings" });
      if (!existingSetting) {
        await PlatformSetting.create({
          key: "commission_settings",
          commissionRate: 5,
          platformBalance: 0,
          totalCommissionEarned: 0,
          updatedBy: "superadmin",
        });
        console.log("💰 [MONGODB SEED] Platform Commission settings initialized with default 5% rate in alikendshop.platform_settings");
      }
<<<<<<< HEAD

      // 10. Perform bidirectional sync so memoryStore matches live MongoDB state
      await syncDatabaseWithMemory();
=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
    } catch (e: any) {
      console.warn("⚠️ [MONGODB SEED NOTICE]:", e?.message || e);
    }

    return mongoose;
}

<<<<<<< HEAD
/**
 * Bidirectional Database <-> InMemory Synchronization
 * Ensures MongoDB is the primary source of truth while keeping
 * memoryStore warm and synchronized across restarts and redeployments.
 */
export async function syncDatabaseWithMemory(): Promise<{
  synced: boolean;
  counts: {
    users: number;
    products: number;
    orders: number;
    sellers: number;
    categories: number;
    banners: number;
  };
}> {
  if (!isMongoConnected()) {
    return {
      synced: false,
      counts: {
        users: memoryStore.users.length,
        products: memoryStore.products.length,
        orders: memoryStore.orders.length,
        sellers: memoryStore.sellers.length,
        categories: memoryStore.categories.length,
        banners: memoryStore.banners.length,
      },
    };
  }

  try {
    // 1. Sync Users from MongoDB to memoryStore
    const mongoUsers = await User.find().lean();
    if (mongoUsers && mongoUsers.length > 0) {
      memoryStore.users = mongoUsers.map((u: any) => ({
        ...u,
        _id: String(u._id),
      }));
    }

    // 2. Sync Sellers from MongoDB to memoryStore
    const mongoSellers = await Seller.find().lean();
    if (mongoSellers && mongoSellers.length > 0) {
      memoryStore.sellers = mongoSellers.map((s: any) => ({
        ...s,
        _id: String(s._id),
      }));
    }

    // 3. Sync Products from MongoDB to memoryStore
    const mongoProducts = await Product.find().lean();
    if (mongoProducts && mongoProducts.length > 0) {
      memoryStore.products = mongoProducts.map((p: any) => ({
        ...p,
        _id: String(p._id),
      }));
    }

    // 4. Sync Orders from MongoDB to memoryStore (most recent 300)
    const mongoOrders = await Order.find().sort({ createdAt: -1 }).limit(300).lean();
    if (mongoOrders && mongoOrders.length > 0) {
      memoryStore.orders = mongoOrders.map((o: any) => ({
        ...o,
        _id: String(o._id),
      }));
    }

    // 5. Sync Categories from MongoDB to memoryStore
    const mongoCategories = await Category.find().lean();
    if (mongoCategories && mongoCategories.length > 0) {
      memoryStore.categories = mongoCategories.map((c: any) => ({
        ...c,
        _id: String(c._id),
      }));
    }

    // 6. Sync Banners from MongoDB to memoryStore
    const mongoBanners = await Banner.find().sort({ order: 1, createdAt: 1 }).lean();
    if (mongoBanners && mongoBanners.length > 0) {
      memoryStore.banners = mongoBanners.map((b: any) => ({
        ...b,
        _id: String(b._id),
      }));
    }

    console.log(
      `🔄 [DB SYNC] Live MongoDB state mirrored to in-memory store: ${memoryStore.products.length} products, ${memoryStore.orders.length} orders, ${memoryStore.users.length} users, ${memoryStore.sellers.length} sellers.`
    );

    return {
      synced: true,
      counts: {
        users: memoryStore.users.length,
        products: memoryStore.products.length,
        orders: memoryStore.orders.length,
        sellers: memoryStore.sellers.length,
        categories: memoryStore.categories.length,
        banners: memoryStore.banners.length,
      },
    };
  } catch (err: any) {
    console.warn("⚠️ [DB SYNC NOTICE]:", err?.message || err);
    return {
      synced: false,
      counts: {
        users: memoryStore.users.length,
        products: memoryStore.products.length,
        orders: memoryStore.orders.length,
        sellers: memoryStore.sellers.length,
        categories: memoryStore.categories.length,
        banners: memoryStore.banners.length,
      },
    };
  }
}

=======
>>>>>>> e49d630f26038015b7a40f2bf00fed3f99b5ec58
// Background auto-reconnect interval (every 30 seconds if disconnected)
setInterval(() => {
  if (!isMongoConnected() && mongoose.connection.readyState !== 2 && !isConnecting && !authFailed) {
    connectMongoDB().catch(() => {});
  }
}, 30000);

