import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  id?: number;
  name: string;
  brand?: string;
  category: string;
  subCategory?: string;
  audience?: string;
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
  // Indian Marketplace Compliance Fields
  hsnCode?: string;
  gstRate: number;
  countryOfOrigin: string;
  manufacturerDetails?: string;
  packInfo?: string;
  isPublished?: boolean;
  isHidden?: boolean;
  deliveryCharge?: number;
  sku?: string;
  videoUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
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
    timestamp: Date | string;
    adjustment: number;
    previousStock: number;
    newStock: number;
    reason: string;
    actor: string;
  }>;
    isDraft?: boolean;
  contentScore?: number;
  lastDraftSavedAt?: Date | string;
  scheduledPublishAt?: string;
  moderationStatus?: "approved" | "pending" | "rejected" | "archived" | "draft";
  approvalStatus?: "approved" | "pending" | "rejected" | "archived" | "draft";
  moderationNote?: string;
  rejectionReason?: string;
  changeHistory?: Array<{
    action: string;
    actedBy: string;
    note?: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    id: { type: Number },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: "Alike Sovereign" },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, default: "", trim: true },
    audience: { type: String, default: "unisex", trim: true, lowercase: true },
    eligibleFor20MinDelivery: { type: Boolean, default: false },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, default: 0 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 120 },
    stock: { type: Number, required: true, min: 0, default: 10 },
    stockStatus: { type: String, default: "In Stock" },
    badge: { type: String, default: "" },
    isFlashSale: { type: Boolean, default: false },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    description: { type: String, default: "" },
    specifications: { type: Schema.Types.Mixed, default: {} },
    isWholesale: { type: Boolean, default: false },
    wholesalePrice: { type: Number, default: 0 },
    wholesaleMinQty: { type: Number, default: 1 },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    emoji: { type: String, default: "📦" },
    sellerId: { type: String, default: "admin", index: true },
    sellerShopName: { type: String, default: "ALIKE-ND Official" },
    // Indian Marketplace Compliance Fields (Rule 6, Consumer Protection E-Commerce Rules, 2020)
    hsnCode: { type: String, default: "", trim: true },
    gstRate: { type: Number, default: 18 },
    countryOfOrigin: { type: String, default: "India", trim: true },
    manufacturerDetails: { type: String, default: "", trim: true },
    packInfo: { type: String, default: "", trim: true },
    isPublished: { type: Boolean, default: true, index: true },
    isHidden: { type: Boolean, default: false, index: true },
    deliveryCharge: { type: Number, default: 0 },
    sku: { type: String, default: "", trim: true },
    videoUrl: { type: String, default: "", trim: true },
    seoTitle: { type: String, default: "", trim: true },
    seoDescription: { type: String, default: "", trim: true },
    tags: { type: [String], default: [] },
    packageWeightKg: { type: Number, default: 0.5 },
    packageLengthCm: { type: Number, default: 20 },
    packageWidthCm: { type: Number, default: 15 },
    packageHeightCm: { type: Number, default: 10 },
    localizedName: { type: String, default: "", trim: true },
    nestedCategory: { type: String, default: "", trim: true },
    productType: { type: String, default: "physical" },
    condition: { type: String, default: "new" },
    modelNumber: { type: String, default: "", trim: true },
    internalProductId: { type: String, default: "", trim: true },
    internalSearchTags: { type: [String], default: [] },
    projectReference: { type: String, default: "", trim: true },
    seoKeywords: { type: [String], default: [] },
    whiteBgImage: { type: String, default: "" },
    promoBannerImage: { type: String, default: "" },
    costPrice: { type: Number, default: 0 },
    saleStartDate: { type: String, default: "" },
    saleEndDate: { type: String, default: "" },
    minOrderQty: { type: Number, default: 1 },
    maxOrderQty: { type: Number, default: 50 },
    bundleInfo: { type: String, default: "" },
    lowStockThreshold: { type: Number, default: 5 },
    variants: { type: Schema.Types.Mixed, default: [] },
    variantOptionGroups: { type: Schema.Types.Mixed, default: [] },
    customSpecifications: { type: Schema.Types.Mixed, default: [] },
    highlights: { type: [String], default: [] },
    benefitsUseCases: { type: String, default: "" },
    technicalSummary: { type: String, default: "" },
    whatsInTheBox: { type: String, default: "" },
    careInstructions: { type: String, default: "" },
    comparisonTable: { type: Schema.Types.Mixed, default: [] },
    manualUrl: { type: String, default: "" },
    badgesConfig: { type: Schema.Types.Mixed, default: {} },
    flashSaleConfig: { type: Schema.Types.Mixed, default: {} },
    shippingConfig: { type: Schema.Types.Mixed, default: {} },
    warrantyConfig: { type: Schema.Types.Mixed, default: {} },
    fulfilmentConfig: { type: Schema.Types.Mixed, default: {} },
    inventoryHistory: { type: Schema.Types.Mixed, default: [] },
    isDraft: { type: Boolean, default: false, index: true },
    contentScore: { type: Number, default: 0 },
    lastDraftSavedAt: { type: Date },
    scheduledPublishAt: { type: String, default: "" },
    moderationStatus: {
      type: String,
      enum: ["approved", "pending", "rejected", "archived", "draft"],
      default: "approved",
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected", "archived", "draft"],
      default: "approved",
    },
    moderationNote: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    changeHistory: {
      type: [
        {
          action: { type: String },
          actedBy: { type: String },
          note: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true, collection: "products" }
);

export default mongoose.model<IProduct>("Product", ProductSchema);

