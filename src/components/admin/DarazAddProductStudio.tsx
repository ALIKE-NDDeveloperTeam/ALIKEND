import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  Sparkles,
  Eye,
  Save,
  Send,
  ArrowLeft,
  Search,
  Tag,
  Layers,
  Sliders,
  DollarSign,
  FileText,
  Award,
  Truck,
  Store,
  ShieldCheck,
  Lock,
  Info,
  X,
  MoveLeft,
  MoveRight,
  Star,
  Flame,
  Clock,
  Box,
  RefreshCw,
  HelpCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link as LinkIcon,
  Table as TableIcon,
  Check,
  History,
  FileDown,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Product, Seller } from "../../pages/adminTypes";
import { adminApi } from "../../pages/adminApi";
import { sellerApi } from "../../services/sellerApi";

interface DarazAddProductStudioProps {
  initialProduct?: Product | null;
  sellers?: Seller[];
  existingProducts: Product[];
  onBack: () => void;
  onSaved: (savedProduct: Product, isDraft: boolean) => void;
  mode?: "admin" | "seller";
  sellerProfile?: any;
}

interface CategoryNode {
  id: string;
  label: string;
  subCategories: {
    id: string;
    label: string;
    nested: string[];
  }[];
  presetSpecs: { key: string; required: boolean; fieldType?: string; options?: string[]; placeholder?: string }[];
  presetVariantGroups: string[];
}

const HIERARCHICAL_CATEGORIES: CategoryNode[] = [
  {
    id: "fashion",
    label: "Fashion & Apparel",
    subCategories: [
      { id: "mens_wear", label: "Men's Clothing", nested: ["T-Shirts & Polos", "Formal Shirts", "Jackets & Blazers", "Ethnic Sherwanis", "Trousers & Jeans"] },
      { id: "womens_wear", label: "Women's Clothing", nested: ["Designer Sarees", "Kurtis & Suits", "Evening Gowns", "Tops & Tunics", "Winter Outerwear"] },
      { id: "footwear", label: "Luxury Footwear", nested: ["Sneakers & Trainers", "Formal Leather Shoes", "Heels & Sandals", "Loafers & Boots"] },
      { id: "watches_accessories", label: "Watches & Accessories", nested: ["Chronograph Watches", "Handbags & Clutches", "Sunglasses", "Belts & Wallets"] },
    ],
    presetSpecs: [
      { key: "Material / Fabric", required: true, placeholder: "e.g., 100% Egyptian Cotton / Mulberry Silk" },
      { key: "Fit Type", required: true, fieldType: "dropdown", options: ["Regular Fit", "Slim Fit", "Tailored Fit", "Relaxed / Oversized", "Free Size"] },
      { key: "Pattern", required: false, fieldType: "dropdown", options: ["Solid", "Embroidered", "Printed", "Woven", "Textured", "Striped"] },
      { key: "Care Instructions", required: false, placeholder: "e.g., Dry Clean Only or Gentle Machine Wash" },
      { key: "Occasion", required: false, fieldType: "dropdown", options: ["Casual", "Formal / Office", "Festive / Wedding", "Party / Evening", "Sports"] },
    ],
    presetVariantGroups: ["Size", "Color"],
  },
  {
    id: "electronics",
    label: "Electronics & Gadgets",
    subCategories: [
      { id: "smartphones", label: "Smartphones & Tablets", nested: ["Flagship 5G Phones", "Foldable Smartphones", "Tablets & iPads", "Mobile Accessories"] },
      { id: "laptops_computing", label: "Laptops & Computing", nested: ["Ultrabooks", "Gaming Laptops", "Monitors & Displays", "Storage & SSDs"] },
      { id: "audio_headphones", label: "Audio & Headphones", nested: ["ANC Wireless Headphones", "TWS Earbuds", "Home Theatre Soundbars", "Studio Microphones"] },
      { id: "smart_wearables", label: "Smartwatches & Wearables", nested: ["AMOLED Smartwatches", "Fitness Bands", "Smart Rings", "VR Headsets"] },
    ],
    presetSpecs: [
      { key: "Processor / Chipset", required: true, placeholder: "e.g., Octa-Core Flagship / Apple M3" },
      { key: "RAM & Storage", required: true, placeholder: "e.g., 12GB RAM / 256GB NVMe" },
      { key: "Battery Capacity", required: true, placeholder: "e.g., 5000 mAh / Up to 36 Hours" },
      { key: "Display / Screen Size", required: false, placeholder: "e.g., 6.7-inch 120Hz AMOLED" },
      { key: "Connectivity", required: false, placeholder: "e.g., 5G, Wi-Fi 6E, Bluetooth 5.3, USB-C" },
      { key: "Operating Voltage", required: false, placeholder: "e.g., 100-240V AC, 50/60Hz" },
    ],
    presetVariantGroups: ["Color", "Storage"],
  },
  {
    id: "jewellery",
    label: "Fine Jewellery & Precious Stones",
    subCategories: [
      { id: "necklaces", label: "Necklaces & Pendants", nested: ["Gold Chains", "Diamond Pendants", "Kundan & Polki Sets", "Pearl Chokers"] },
      { id: "rings_earrings", label: "Rings & Earrings", nested: ["Solitaire Rings", "Jhumkas & Studs", "Platinum Bands", "Cocktail Rings"] },
      { id: "bracelets_bangles", label: "Bracelets & Bangles", nested: ["Gold Bangles", "Tennis Bracelets", "Charm Bracelets"] },
    ],
    presetSpecs: [
      { key: "Metal Purity / Base Metal", required: true, placeholder: "e.g., 22K Gold Plated / 925 Sterling Silver" },
      { key: "Stone / Gem Type", required: true, placeholder: "e.g., Certified Swarovski Crystal / Cubic Zirconia" },
      { key: "Hallmark / Certification", required: false, placeholder: "e.g., BIS Hallmarked / Authenticity Certificate" },
      { key: "Plating & Finish", required: false, placeholder: "e.g., Rhodium / 18K Rose Gold Finish" },
    ],
    presetVariantGroups: ["Size", "Color"],
  },
  {
    id: "beauty",
    label: "Beauty, Skincare & Perfumes",
    subCategories: [
      { id: "fragrances", label: "Luxury Perfumes & Oud", nested: ["Eau De Parfum (EDP)", "Artisanal Attar & Oud", "Body Mists", "Gift Discovery Sets"] },
      { id: "skincare", label: "Clinical Skincare", nested: ["Face Serums & Oils", "Moisturizers & SPF", "Cleansers & Toners", "Night Repair Creams"] },
      { id: "makeup", label: "High-Definition Makeup", nested: ["Velvet Lipsticks", "Foundations & Primers", "Eyeshadow Palettes"] },
    ],
    presetSpecs: [
      { key: "Skin Type", required: true, fieldType: "dropdown", options: ["All Skin Types", "Dry Skin", "Oily / Combination", "Sensitive Skin", "Normal Skin"] },
      { key: "Net Volume / Weight", required: true, placeholder: "e.g., 100 ml / 3.4 fl. oz." },
      { key: "Key Ingredients", required: true, placeholder: "e.g., Niacinamide, Hyaluronic Acid, Bulgarian Rose" },
      { key: "Shelf Life", required: false, placeholder: "e.g., 24 Months from Mfg" },
      { key: "Formulation", required: false, fieldType: "dropdown", options: ["Liquid / Spray", "Serum", "Cream / Gel", "Pressed Powder", "Oil"] },
    ],
    presetVariantGroups: ["Size", "Color"],
  },
  {
    id: "grocery",
    label: "Grocery, Gourmet & Daily Essentials",
    subCategories: [
      { id: "dry_fruits_spices", label: "Dry Fruits, Saffron & Spices", nested: ["Kashmiri Mongra Saffron", "California Almonds & Cashews", "Organic Whole Spices"] },
      { id: "oils_ghee", label: "A2 Bilona Ghee & Cold-Pressed Oils", nested: ["A2 Gir Cow Ghee", "Extra Virgin Olive Oil", "Organic Wild Honey"] },
      { id: "beverages_tea", label: "Artisanal Tea & Coffee", nested: ["Darjeeling First Flush", "Single-Origin Arabica", "Matcha & Herbal Infusions"] },
    ],
    presetSpecs: [
      { key: "Net Quantity / Weight", required: true, placeholder: "e.g., 500 g / 1 Litre" },
      { key: "Shelf Life", required: true, placeholder: "e.g., 12 Months" },
      { key: "Dietary Preference", required: true, fieldType: "dropdown", options: ["100% Vegetarian", "Vegan", "Organic Certified", "Gluten-Free"] },
      { key: "Storage Instructions", required: false, placeholder: "e.g., Store in a cool, dry place away from sunlight" },
      { key: "FSSAI / Quality Standard", required: false, placeholder: "e.g., FSSAI Certified Grade-A" },
    ],
    presetVariantGroups: ["Weight / Pack"],
  },
  {
    id: "home",
    label: "Home Decor, Kitchen & Living",
    subCategories: [
      { id: "decor_lighting", label: "Luxury Decor & Lighting", nested: ["Crystal Chandeliers", "Wall Art & Mirrors", "Handwoven Rugs", "Aroma Diffusers"] },
      { id: "kitchen_dining", label: "Kitchen & Fine Dining", nested: ["Bone China Dinnerware", "Espresso Machines", "Tri-Ply Cookware", "Crystal Glassware"] },
      { id: "bedding_bath", label: "Bedding & Bath Linen", nested: ["600 TC Cotton Bedsheets", "Memory Foam Pillows", "Plush Bath Towels"] },
    ],
    presetSpecs: [
      { key: "Primary Material", required: true, placeholder: "e.g., Solid Teak Wood / Borosilicate Glass / Brass" },
      { key: "Product Dimensions", required: true, placeholder: "e.g., 45 cm x 30 cm x 15 cm" },
      { key: "Assembly Required", required: false, fieldType: "dropdown", options: ["No Assembly Required", "DIY Basic Assembly", "Professional Assembly Included"] },
      { key: "Finish / Coating", required: false, placeholder: "e.g., Matte Antique Brass / Food-Grade Non-Stick" },
    ],
    presetVariantGroups: ["Color", "Size"],
  },
];

const CURATED_MEDIA_GALLERY = [
  { label: "Luxury Chronograph Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" },
  { label: "Flagship Wireless Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800" },
  { label: "Signature Eau De Parfum", url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" },
  { label: "Designer Leather Sneakers", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" },
  { label: "Artisanal Skincare Serum", url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" },
  { label: "Minimalist Smart Gadget", url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800" },
];

const APPROVED_BRANDS = [
  "Alike Sovereign",
  "ALIKE-ND Official",
  "Royal Atelier",
  "Vanguard Tech",
  "Maison Lumière",
  "Aura Botanics",
  "Kashmir Heritage",
  "No Brand / Generic",
];

export const DarazAddProductStudio: React.FC<DarazAddProductStudioProps> = ({
  initialProduct,
  sellers = [],
  existingProducts,
  onBack,
  onSaved,
  mode = "admin",
  sellerProfile,
}) => {
  const isSellerMode = mode === "seller";
  const isEditMode = Boolean(initialProduct && (initialProduct._id || initialProduct.id));
  const draftStorageKey = isEditMode
    ? `alikend_daraz_draft_${mode}_${initialProduct?._id || initialProduct?.id}`
    : `alikend_daraz_draft_${mode}_new`;

  // Section A — Basic Information
  const [name, setName] = useState(initialProduct?.name || "");
  const [localizedName, setLocalizedName] = useState(initialProduct?.localizedName || "");
  const [category, setCategory] = useState(initialProduct?.category || "fashion");
  const [subCategory, setSubCategory] = useState(initialProduct?.subCategory || "");
  const [nestedCategory, setNestedCategory] = useState(initialProduct?.nestedCategory || "");
  const [categorySearch, setCategorySearch] = useState("");
  const [brand, setBrand] = useState(initialProduct?.brand || "Alike Sovereign");
  const [customBrandInput, setCustomBrandInput] = useState("");
  const [productType, setProductType] = useState<string>(initialProduct?.productType || "physical");
  const [condition, setCondition] = useState<string>(initialProduct?.condition || "new");
  const [audience, setAudience] = useState<string>(initialProduct?.audience || "unisex");
  const [manufacturerDetails, setManufacturerDetails] = useState(initialProduct?.manufacturerDetails || "");
  const [modelNumber, setModelNumber] = useState(initialProduct?.modelNumber || "");
  const [internalProductId, setInternalProductId] = useState(
    initialProduct?.internalProductId || `ALK-PRD-${Date.now().toString().slice(-6)}`
  );
  // Private Admin-Only Fields
  const [internalSearchTags, setInternalSearchTags] = useState<string[]>(
    initialProduct?.internalSearchTags || []
  );
  const [internalTagInput, setInternalTagInput] = useState("");
  const [projectReference, setProjectReference] = useState(initialProduct?.projectReference || "");
  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoDescription || "");
  const [seoKeywords, setSeoKeywords] = useState<string[]>(
    initialProduct?.seoKeywords || initialProduct?.tags || []
  );
  const [seoKeywordInput, setSeoKeywordInput] = useState("");

  // Section B — Product Images & Media Center
  const [images, setImages] = useState<string[]>(() => {
    if (initialProduct?.images && initialProduct.images.length > 0) return initialProduct.images;
    if (initialProduct?.image) return [initialProduct.image];
    return [];
  });
  const [whiteBgImage, setWhiteBgImage] = useState(initialProduct?.whiteBgImage || "");
  const [promoBannerImage, setPromoBannerImage] = useState(initialProduct?.promoBannerImage || "");
  const [videoUrl, setVideoUrl] = useState(initialProduct?.videoUrl || "");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaError, setMediaError] = useState("");
  const [showMediaCenter, setShowMediaCenter] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Section C — Specifications
  const [specifications, setSpecifications] = useState<Record<string, string>>(
    initialProduct?.specifications || {}
  );
  const [customSpecifications, setCustomSpecifications] = useState<
    Array<{
      id: string;
      key: string;
      value: string;
      fieldType: string;
      options?: string[];
      required?: boolean;
    }>
  >(initialProduct?.customSpecifications || []);
  const [hsnCode, setHsnCode] = useState(initialProduct?.hsnCode || "6203");
  const [gstRate, setGstRate] = useState<number>(initialProduct?.gstRate ?? 18);
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialProduct?.countryOfOrigin || "India");
  const [packInfo, setPackInfo] = useState(initialProduct?.packInfo || "Pack of 1");
  const [newSpecKey, setNewSpecKey] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");
  const [newSpecType, setNewSpecType] = useState("text");
  const [newSpecOptions, setNewSpecOptions] = useState("");

  // Section D — Price, Stock & Variants
  const [mrp, setMrp] = useState<number>(initialProduct?.mrp || initialProduct?.price || 2499);
  const [price, setPrice] = useState<number>(initialProduct?.price || 1899);
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPrice || 1100);
  const [saleStartDate, setSaleStartDate] = useState(initialProduct?.saleStartDate || "");
  const [saleEndDate, setSaleEndDate] = useState(initialProduct?.saleEndDate || "");
  const [minOrderQty, setMinOrderQty] = useState<number>(initialProduct?.minOrderQty || 1);
  const [maxOrderQty, setMaxOrderQty] = useState<number>(initialProduct?.maxOrderQty || 50);
  const [bundleInfo, setBundleInfo] = useState(initialProduct?.bundleInfo || "");
  const [isWholesale, setIsWholesale] = useState<boolean>(Boolean(initialProduct?.isWholesale));
  const [wholesalePrice, setWholesalePrice] = useState<number>(initialProduct?.wholesalePrice || 0);
  const [wholesaleMinQty, setWholesaleMinQty] = useState<number>(initialProduct?.wholesaleMinQty || 5);
  const [stock, setStock] = useState<number>(initialProduct?.stock ?? 25);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(initialProduct?.lowStockThreshold || 5);
  const [sku, setSku] = useState(
    initialProduct?.sku || `SKU-${Date.now().toString().slice(-6)}`
  );

  // Variants Matrix
  const [hasVariants, setHasVariants] = useState<boolean>(
    Boolean(initialProduct?.variants && initialProduct.variants.length > 0)
  );
  const [variantOptionGroups, setVariantOptionGroups] = useState<
    Array<{ name: string; values: string[] }>
  >(
    initialProduct?.variantOptionGroups && initialProduct.variantOptionGroups.length > 0
      ? initialProduct.variantOptionGroups
      : [
          { name: "Color", values: initialProduct?.colors?.length ? initialProduct.colors : ["Onyx Black", "Royal Gold"] },
          { name: "Size", values: initialProduct?.sizes?.length ? initialProduct.sizes : ["M", "L", "XL"] },
        ]
  );
  const [newOptionGroupName, setNewOptionGroupName] = useState("");
  const [optionValueInputs, setOptionValueInputs] = useState<Record<string, string>>({});
  const [variants, setVariants] = useState<
    Array<{
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
    }>
  >(initialProduct?.variants || []);
  // Bulk variant apply states
  const [bulkVarPrice, setBulkVarPrice] = useState<string>("");
  const [bulkVarSpecialPrice, setBulkVarSpecialPrice] = useState<string>("");
  const [bulkVarStock, setBulkVarStock] = useState<string>("");
  const [bulkVarSkuPrefix, setBulkVarSkuPrefix] = useState<string>("");

  // Inventory adjustment log state
  const [inventoryHistory, setInventoryHistory] = useState<
    Array<{
      id: string;
      timestamp: string;
      adjustment: number;
      previousStock: number;
      newStock: number;
      reason: string;
      actor: string;
    }>
  >(initialProduct?.inventoryHistory || []);
  const [stockAdjustDelta, setStockAdjustDelta] = useState<string>("");
  const [stockAdjustReason, setStockAdjustReason] = useState<string>("Warehouse restock");
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Section E — Description & Highlights
  const [description, setDescription] = useState(
    initialProduct?.description || ""
  );
  const [showDescPreview, setShowDescPreview] = useState(false);
  const [highlights, setHighlights] = useState<string[]>(
    initialProduct?.highlights && initialProduct.highlights.length > 0
      ? initialProduct.highlights
      : ["", "", "", ""]
  );
  const [benefitsUseCases, setBenefitsUseCases] = useState(initialProduct?.benefitsUseCases || "");
  const [technicalSummary, setTechnicalSummary] = useState(initialProduct?.technicalSummary || "");
  const [whatsInTheBox, setWhatsInTheBox] = useState(
    initialProduct?.whatsInTheBox || "1x Main Product Unit, 1x Authenticity & Warranty Card, 1x User Guide"
  );
  const [careInstructions, setCareInstructions] = useState(initialProduct?.careInstructions || "");
  const [comparisonTable, setComparisonTable] = useState<
    Array<{ feature: string; thisProduct: string; standardProduct: string }>
  >(
    initialProduct?.comparisonTable && initialProduct.comparisonTable.length > 0
      ? initialProduct.comparisonTable
      : [
          { feature: "Build & Material Grade", thisProduct: "Sovereign Grade A+", standardProduct: "Standard Commercial" },
          { feature: "Quality Inspection", thisProduct: "Multi-Point Certified", standardProduct: "Basic Check" },
        ]
  );
  const [manualUrl, setManualUrl] = useState(initialProduct?.manualUrl || "");
  const descTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Section F — Product Badges & Promotions
  const [badgesConfig, setBadgesConfig] = useState<{
    fastDelivery: boolean;
    flashSale: boolean;
    bestSeller: boolean;
    newArrival: boolean;
    featuredProduct: boolean;
    verifiedSeller: boolean;
    limitedStock: boolean;
  }>({
    fastDelivery: Boolean(initialProduct?.badgesConfig?.fastDelivery ?? initialProduct?.eligibleFor20MinDelivery),
    flashSale: Boolean(initialProduct?.badgesConfig?.flashSale ?? initialProduct?.isFlashSale),
    bestSeller: Boolean(initialProduct?.badgesConfig?.bestSeller ?? initialProduct?.badge === "HOT"),
    newArrival: Boolean(initialProduct?.badgesConfig?.newArrival ?? initialProduct?.badge === "NEW"),
    featuredProduct: Boolean(initialProduct?.badgesConfig?.featuredProduct ?? initialProduct?.badge === "TRENDING"),
    verifiedSeller: Boolean(initialProduct?.badgesConfig?.verifiedSeller ?? true),
    limitedStock: Boolean(initialProduct?.badgesConfig?.limitedStock ?? initialProduct?.badge === "LIMITED"),
  });
  const [primaryBadge, setPrimaryBadge] = useState<string>(initialProduct?.badge || "");
  const [flashSaleConfig, setFlashSaleConfig] = useState<{
    enabled: boolean;
    startTime: string;
    endTime: string;
    discountType: string;
    discountValue: number;
    stockLimit: number;
  }>({
    enabled: Boolean(initialProduct?.flashSaleConfig?.enabled ?? initialProduct?.isFlashSale),
    startTime: initialProduct?.flashSaleConfig?.startTime || new Date().toISOString().slice(0, 16),
    endTime:
      initialProduct?.flashSaleConfig?.endTime ||
      new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
    discountType: initialProduct?.flashSaleConfig?.discountType || "percentage",
    discountValue: initialProduct?.flashSaleConfig?.discountValue || 20,
    stockLimit: initialProduct?.flashSaleConfig?.stockLimit || 15,
  });

  // Section G — Shipping, Package & Warranty
  const [packageWeightKg, setPackageWeightKg] = useState<number>(initialProduct?.packageWeightKg || 0.5);
  const [packageLengthCm, setPackageLengthCm] = useState<number>(initialProduct?.packageLengthCm || 22);
  const [packageWidthCm, setPackageWidthCm] = useState<number>(initialProduct?.packageWidthCm || 16);
  const [packageHeightCm, setPackageHeightCm] = useState<number>(initialProduct?.packageHeightCm || 10);
  const [shippingConfig, setShippingConfig] = useState<{
    unit: string;
    shippingClass: string;
    chargeMode: string;
    customShippingFee: number;
    chargeScope: string;
    freeShipping: boolean;
    handlingTimeDays: string;
    estimatedDeliveryRange: string;
    shippingRestrictions: string;
    returnEligible: boolean;
    returnWindowDays: number;
    dangerousGoods: string;
  }>({
    unit: initialProduct?.shippingConfig?.unit || "cm_kg",
    shippingClass: initialProduct?.shippingConfig?.shippingClass || "Standard Parcel",
    chargeMode: initialProduct?.shippingConfig?.chargeMode || "auto",
    customShippingFee: initialProduct?.shippingConfig?.customShippingFee ?? initialProduct?.deliveryCharge ?? 0,
    chargeScope: initialProduct?.shippingConfig?.chargeScope || "per_order",
    freeShipping: Boolean(initialProduct?.shippingConfig?.freeShipping ?? (initialProduct?.deliveryCharge === 0)),
    handlingTimeDays: initialProduct?.shippingConfig?.handlingTimeDays || "1-2 Business Days",
    estimatedDeliveryRange: initialProduct?.shippingConfig?.estimatedDeliveryRange || "2-4 Business Days",
    shippingRestrictions: initialProduct?.shippingConfig?.shippingRestrictions || "Pan-India Serviceable Pincodes",
    returnEligible: initialProduct?.shippingConfig?.returnEligible ?? true,
    returnWindowDays: initialProduct?.shippingConfig?.returnWindowDays || 7,
    dangerousGoods: initialProduct?.shippingConfig?.dangerousGoods || "none",
  });
  const [warrantyConfig, setWarrantyConfig] = useState<{
    warrantyType: string;
    warrantyDuration: string;
    warrantyTerms: string;
  }>({
    warrantyType: initialProduct?.warrantyConfig?.warrantyType || "manufacturer",
    warrantyDuration: initialProduct?.warrantyConfig?.warrantyDuration || "1 Year",
    warrantyTerms:
      initialProduct?.warrantyConfig?.warrantyTerms ||
      "Covers manufacturing defects. Physical or liquid damage is excluded.",
  });

  // Section H — Seller & Fulfilment Settings
  const [sellerId, setSellerId] = useState<string>(
    isSellerMode
      ? String(sellerProfile?._id || initialProduct?.sellerId || "")
      : initialProduct?.sellerId || "admin"
  );
  const [sellerShopName, setSellerShopName] = useState<string>(
    isSellerMode
      ? sellerProfile?.shopName || sellerProfile?.storefront || initialProduct?.sellerShopName || "Seller Store"
      : initialProduct?.sellerShopName || "ALIKE-ND Official"
  );
  const [fulfilmentConfig, setFulfilmentConfig] = useState<{
    fulfilmentMethod: string;
    warehouseId: string;
    warehouseName: string;
    dispatchPrepHours: number;
    pickupOriginAddress: string;
    handlingInstructions: string;
    sellerSku: string;
    returnDestinationAddress: string;
  }>({
    fulfilmentMethod:
      initialProduct?.fulfilmentConfig?.fulfilmentMethod ||
      (isSellerMode ? "seller_fulfilled" : "platform_fulfilled"),
    warehouseId: initialProduct?.fulfilmentConfig?.warehouseId || "WH-DEL-01",
    warehouseName:
      initialProduct?.fulfilmentConfig?.warehouseName ||
      (isSellerMode
        ? `${sellerProfile?.shopName || "Seller"} Primary Fulfilment Hub`
        : "ALIKE-ND Central Sovereign Hub (New Delhi)"),
    dispatchPrepHours: initialProduct?.fulfilmentConfig?.dispatchPrepHours || 24,
    pickupOriginAddress:
      initialProduct?.fulfilmentConfig?.pickupOriginAddress ||
      sellerProfile?.shopAddress ||
      sellerProfile?.businessAddress ||
      "Plot 14, Sovereign Logistics Park, New Delhi - 110001",
    handlingInstructions:
      initialProduct?.fulfilmentConfig?.handlingInstructions || "Handle with care. Keep dry.",
    sellerSku: initialProduct?.fulfilmentConfig?.sellerSku || initialProduct?.sku || "",
    returnDestinationAddress:
      initialProduct?.fulfilmentConfig?.returnDestinationAddress ||
      sellerProfile?.shopAddress ||
      "Returns Processing Center, Sector 18, Gurugram",
  });
  const [isPublished, setIsPublished] = useState<boolean>(initialProduct?.isPublished !== false);
  const [isHidden, setIsHidden] = useState<boolean>(Boolean(initialProduct?.isHidden));
  const [moderationStatus, setModerationStatus] = useState<string>(
    initialProduct?.moderationStatus || "approved"
  );
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string>(
    initialProduct?.scheduledPublishAt || ""
  );

  // Studio UI states
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    initialProduct?.lastDraftSavedAt
      ? new Date(initialProduct.lastDraftSavedAt).toLocaleTimeString()
      : null
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
  const [showUnsavedConfirmModal, setShowUnsavedConfirmModal] = useState(false);
  const [studioBannerMsg, setStudioBannerMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasLocalDraftBackup, setHasLocalDraftBackup] = useState(false);

  // Check if local draft backup exists on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved && !isEditMode) {
        setHasLocalDraftBackup(true);
      }
    } catch {}
  }, [draftStorageKey, isEditMode]);

  const restoreLocalDraft = () => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.name) setName(d.name);
      if (d.localizedName) setLocalizedName(d.localizedName);
      if (d.category) setCategory(d.category);
      if (d.subCategory) setSubCategory(d.subCategory);
      if (d.nestedCategory) setNestedCategory(d.nestedCategory);
      if (d.brand) setBrand(d.brand);
      if (d.price) setPrice(Number(d.price));
      if (d.mrp) setMrp(Number(d.mrp));
      if (d.stock !== undefined) setStock(Number(d.stock));
      if (Array.isArray(d.images)) setImages(d.images);
      if (d.description) setDescription(d.description);
      if (Array.isArray(d.highlights)) setHighlights(d.highlights);
      if (d.specifications) setSpecifications(d.specifications);
      setHasLocalDraftBackup(false);
      setStudioBannerMsg({ type: "success", text: "Recovered unsaved local draft from browser storage." });
    } catch {}
  };

  // Track unsaved changes and persist lightweight backup
  useEffect(() => {
    setHasUnsavedChanges(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            name,
            localizedName,
            category,
            subCategory,
            nestedCategory,
            brand,
            price,
            mrp,
            stock,
            images,
            description,
            highlights,
            specifications,
            savedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }, 1200);
    return () => clearTimeout(timer);
  }, [name, localizedName, category, subCategory, nestedCategory, brand, price, mrp, stock, images, description, highlights, specifications, draftStorageKey]);

  // Active Category Node
  const activeCategoryNode = useMemo(() => {
    return (
      HIERARCHICAL_CATEGORIES.find((c) => c.id.toLowerCase() === category.toLowerCase()) ||
      HIERARCHICAL_CATEGORIES[0]
    );
  }, [category]);

  // Load category preset specifications when user clicks "Apply Category Preset" or changes category on empty specs
  const applyCategoryPresets = (targetCatId: string) => {
    const node = HIERARCHICAL_CATEGORIES.find((c) => c.id === targetCatId);
    if (!node) return;
    const nextSpecs = { ...specifications };
    node.presetSpecs.forEach((ps) => {
      if (!(ps.key in nextSpecs)) {
        nextSpecs[ps.key] = "";
      }
    });
    setSpecifications(nextSpecs);
  };

  // Check if selected seller is verified
  const isAssignedSellerVerified = useMemo(() => {
    if (isSellerMode) {
      return Boolean(sellerProfile?.verifiedBadge && sellerProfile?.verificationStatus === "approved");
    }
    if (sellerId === "admin") return true;
    const found = sellers.find((s) => String(s._id) === String(sellerId));
    return Boolean(found && (found.kycVerified || found.status === "approved"));
  }, [isSellerMode, sellerProfile, sellerId, sellers]);

  // Effective Total Stock
  const effectiveStock = useMemo(() => {
    if (hasVariants && variants.length > 0) {
      return variants.reduce((sum, v) => sum + (v.available ? Math.max(0, Number(v.stock) || 0) : 0), 0);
    }
    return Math.max(0, Number(stock) || 0);
  }, [hasVariants, variants, stock]);

  // Volumetric Weight Calculation (L * W * H / 5000)
  const volumetricWeightKg = useMemo(() => {
    const l = Math.max(1, Number(packageLengthCm) || 0);
    const w = Math.max(1, Number(packageWidthCm) || 0);
    const h = Math.max(1, Number(packageHeightCm) || 0);
    return Number(((l * w * h) / 5000).toFixed(2));
  }, [packageLengthCm, packageWidthCm, packageHeightCm]);

  const chargeableWeightKg = useMemo(() => {
    return Math.max(Number(packageWeightKg) || 0, volumetricWeightKg);
  }, [packageWeightKg, volumetricWeightKg]);

  // Discount & Margin Metrics
  const discountAmount = Math.max(0, (Number(mrp) || 0) - (Number(price) || 0));
  const discountPercent =
    mrp > 0 && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const unitProfit = (Number(price) || 0) - (Number(costPrice) || 0);
  const profitMarginPercent =
    price > 0 && costPrice > 0 ? Math.round(((price - costPrice) / price) * 100) : 0;

  // Live Product Content Score (0 - 100) & Checklist
  const contentEvaluation = useMemo(() => {
    const items: Array<{
      id: string;
      sectionId: string;
      label: string;
      points: number;
      earned: number;
      passed: boolean;
      hint: string;
    }> = [];

    // 1. Product Name (15 pts)
    const nameLen = name.trim().length;
    const namePts = nameLen >= 25 ? 15 : nameLen >= 10 ? 10 : nameLen > 0 ? 5 : 0;
    items.push({
      id: "name",
      sectionId: "sec-basic",
      label: "Product Title Quality",
      points: 15,
      earned: namePts,
      passed: nameLen >= 20,
      hint: nameLen < 20 ? "Use at least 20 characters including Brand + Model + Key Feature" : "Clear descriptive title",
    });

    // 2. Category Hierarchy (10 pts)
    const catPts = category && subCategory ? 10 : category ? 6 : 0;
    items.push({
      id: "category",
      sectionId: "sec-basic",
      label: "Category & Subcategory Tree",
      points: 10,
      earned: catPts,
      passed: Boolean(category && subCategory),
      hint: !subCategory ? "Select both primary category and subcategory" : "Category path configured",
    });

    // 3. Product Images (15 pts)
    const imgCount = images.filter(Boolean).length;
    const imgPts = imgCount >= 3 ? 15 : imgCount === 2 ? 10 : imgCount === 1 ? 5 : 0;
    items.push({
      id: "images",
      sectionId: "sec-media",
      label: "Product Gallery (3+ Images)",
      points: 15,
      earned: imgPts,
      passed: imgCount >= 3,
      hint: imgCount < 3 ? `Uploaded ${imgCount}/3 recommended gallery images` : `${imgCount} high-res images ready`,
    });

    // 4. Specifications Completion (15 pts)
    const filledStandardSpecs = Object.values(specifications).filter((v) => String(v || "").trim().length > 0).length;
    const filledCustomSpecs = customSpecifications.filter((s) => String(s.value || "").trim().length > 0).length;
    const totalSpecs = filledStandardSpecs + filledCustomSpecs + (hsnCode ? 1 : 0);
    const specPts = totalSpecs >= 4 ? 15 : totalSpecs >= 2 ? 10 : totalSpecs >= 1 ? 5 : 0;
    items.push({
      id: "specs",
      sectionId: "sec-specs",
      label: "Technical Specifications (4+ attributes)",
      points: 15,
      earned: specPts,
      passed: totalSpecs >= 4,
      hint: totalSpecs < 4 ? `Fill at least ${4 - totalSpecs} more specification field(s)` : `${totalSpecs} specifications completed`,
    });

    // 5. Price & Stock Validity (15 pts)
    const validPricing = price > 0 && mrp >= price && effectiveStock >= 0;
    const pricePts = validPricing ? 15 : price > 0 ? 8 : 0;
    items.push({
      id: "pricing",
      sectionId: "sec-pricing",
      label: "Pricing, MRP & Stock Inventory",
      points: 15,
      earned: pricePts,
      passed: validPricing,
      hint: !validPricing ? "Set valid Price > 0 and MRP ≥ Selling Price" : `₹${price.toLocaleString("en-IN")} (${effectiveStock} units)`,
    });

    // 6. Rich Description & Key Highlights (15 pts)
    const plainDescLen = description.replace(/<[^>]*>/g, "").trim().length;
    const validHighlights = highlights.filter((h) => h.trim().length > 3).length;
    const descPts =
      plainDescLen >= 100 && validHighlights >= 3 && whatsInTheBox.trim().length > 0
        ? 15
        : plainDescLen >= 40 || validHighlights >= 2
        ? 9
        : plainDescLen > 0
        ? 4
        : 0;
    items.push({
      id: "description",
      sectionId: "sec-description",
      label: "Rich Description, 3+ Highlights & Box Info",
      points: 15,
      earned: descPts,
      passed: descPts === 15,
      hint:
        descPts < 15
          ? `Add ${plainDescLen < 100 ? "100+ chars description, " : ""}${validHighlights < 3 ? "3+ key highlights" : ""}`
          : "Comprehensive description & highlights",
    });

    // 7. Shipping, Package Dimensions & Warranty (10 pts)
    const validShipping =
      packageWeightKg > 0 &&
      packageLengthCm > 0 &&
      packageWidthCm > 0 &&
      packageHeightCm > 0 &&
      Boolean(warrantyConfig.warrantyType);
    items.push({
      id: "shipping",
      sectionId: "sec-shipping",
      label: "Package Weight, Dimensions & Warranty",
      points: 10,
      earned: validShipping ? 10 : 5,
      passed: validShipping,
      hint: validShipping
        ? `${packageWeightKg}kg (${packageLengthCm}×${packageWidthCm}×${packageHeightCm}cm)`
        : "Complete package dimensions & warranty",
    });

    // 8. SEO Metadata (5 pts)
    const hasSeo = Boolean(seoTitle.trim() && seoDescription.trim() && seoKeywords.length > 0);
    items.push({
      id: "seo",
      sectionId: "sec-basic",
      label: "SEO Title, Meta Description & Keywords",
      points: 5,
      earned: hasSeo ? 5 : seoTitle.trim() || seoKeywords.length > 0 ? 3 : 0,
      passed: hasSeo,
      hint: hasSeo ? "Search engine metadata optimized" : "Add SEO title, meta description & keywords",
    });

    const totalScore = items.reduce((acc, item) => acc + item.earned, 0);
    return { totalScore, items };
  }, [
    name,
    category,
    subCategory,
    images,
    specifications,
    customSpecifications,
    hsnCode,
    price,
    mrp,
    effectiveStock,
    description,
    highlights,
    whatsInTheBox,
    packageWeightKg,
    packageLengthCm,
    packageWidthCm,
    packageHeightCm,
    warrantyConfig,
    seoTitle,
    seoDescription,
    seoKeywords,
  ]);

  const scrollToSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: false }));
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Media Upload Handler (Drag & Drop or File Input)
  const handleFileUpload = async (
    files: FileList | null,
    target: "gallery" | "whiteBg" | "promoBanner" | "video"
  ) => {
    if (!files || files.length === 0) return;
    setMediaError("");
    setUploadingMedia(true);
    setUploadProgress(15);

    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const isVideo = target === "video" || file.type.startsWith("video/");
        const allowedImg = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        const allowedVid = ["video/mp4", "video/webm", "video/ogg"];

        if (!isVideo && !allowedImg.includes(file.type)) {
          throw new Error(`Unsupported file "${file.name}". Please upload JPG, PNG, or WebP images.`);
        }
        if (isVideo && !allowedVid.includes(file.type)) {
          throw new Error(`Unsupported video "${file.name}". Please upload MP4 or WebM video.`);
        }
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 8MB size limit.`);
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(file);
        });

        setUploadProgress(Math.round(((i + 0.5) / fileArray.length) * 100));

        // Validate via backend media endpoint
        const uploadFn = isSellerMode ? sellerApi.uploadProductMedia : adminApi.uploadProductMedia;
        const res = await uploadFn({
          dataUrl,
          fileName: file.name,
          mimeType: file.type,
          mediaType: isVideo ? "video" : "image",
        });

        const finalUrl = res?.url || dataUrl;
        if (target === "gallery") {
          setImages((prev) => (prev.length < 8 ? [...prev, finalUrl] : prev));
        } else if (target === "whiteBg") {
          setWhiteBgImage(finalUrl);
        } else if (target === "promoBanner") {
          setPromoBannerImage(finalUrl);
        } else if (target === "video") {
          setVideoUrl(finalUrl);
        }
        setUploadProgress(Math.round(((i + 1) / fileArray.length) * 100));
      }
    } catch (err: any) {
      setMediaError(err.message || "Media upload failed");
    } finally {
      setTimeout(() => {
        setUploadingMedia(false);
        setUploadProgress(0);
      }, 350);
    }
  };

  // Cartesian Variant Generator
  const generateVariantMatrix = () => {
    const activeGroups = variantOptionGroups.filter((g) => g.name.trim() && g.values.length > 0);
    if (activeGroups.length === 0) return;

    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])),
        [[]]
      );
    };

    const valueLists = activeGroups.map((g) => g.values);
    const combos = cartesian(valueLists);

    const existingMap = new Map(variants.map((v) => [v.name.toLowerCase(), v]));
    const nextVariants = combos.map((combo, idx) => {
      const comboName = combo.join(" / ");
      const existing = existingMap.get(comboName.toLowerCase());
      if (existing) return existing;

      const optionsMap: Record<string, string> = {};
      activeGroups.forEach((g, gIdx) => {
        optionsMap[g.name] = combo[gIdx];
      });

      const cleanCode = combo
        .map((c) => c.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase())
        .join("-");

      return {
        id: `var_${Date.now()}_${idx}`,
        name: comboName,
        options: optionsMap,
        sku: `${sku || "SKU"}-${cleanCode}`,
        price: Number(mrp) || Number(price) || 1999,
        specialPrice: Number(price) || undefined,
        stock: Math.max(1, Math.floor((Number(stock) || 20) / Math.max(1, combos.length))),
        lowStockThreshold: 3,
        available: true,
        image: images[0] || "",
        barcode: "",
        weightKg: packageWeightKg,
      };
    });

    setVariants(nextVariants);
  };

  const handleBulkApplyToVariants = () => {
    setVariants((prev) =>
      prev.map((v, idx) => ({
        ...v,
        price: bulkVarPrice !== "" ? Math.max(0, Number(bulkVarPrice)) : v.price,
        specialPrice:
          bulkVarSpecialPrice !== "" ? Math.max(0, Number(bulkVarSpecialPrice)) : v.specialPrice,
        stock: bulkVarStock !== "" ? Math.max(0, Math.floor(Number(bulkVarStock))) : v.stock,
        sku:
          bulkVarSkuPrefix.trim() !== ""
            ? `${bulkVarSkuPrefix.trim()}-${idx + 1}`
            : v.sku,
      }))
    );
    setStudioBannerMsg({ type: "success", text: "Bulk values applied across all variants." });
  };

  // Rich Text Formatting Helper
  const insertRichTag = (openTag: string, closeTag: string, sampleText: string) => {
    const el = descTextareaRef.current;
    if (!el) {
      setDescription((prev) => `${prev}\n${openTag}${sampleText}${closeTag}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = description.slice(start, end) || sampleText;
    const updated =
      description.slice(0, start) + openTag + selected + closeTag + description.slice(end);
    setDescription(updated);
  };

  // Manual Stock Adjustment Handler
  const handleManualStockAdjustment = async () => {
    const delta = parseInt(stockAdjustDelta, 10);
    if (isNaN(delta) || delta === 0) return;

    if (isEditMode && initialProduct?._id) {
      setIsAdjustingStock(true);
      try {
        const adjustFn = isSellerMode ? sellerApi.adjustProductStock : adminApi.adjustProductStock;
        const res = await adjustFn(initialProduct._id, {
          adjustment: delta,
          reason: stockAdjustReason || "Manual studio stock update",
        });
        if (res && res.stock !== undefined) {
          setStock(res.stock);
          if (res.logItem) {
            setInventoryHistory((prev) => [res.logItem, ...prev]);
          }
          setStockAdjustDelta("");
          setStudioBannerMsg({
            type: "success",
            text: `Stock updated to ${res.stock} units (${delta > 0 ? `+${delta}` : delta}).`,
          });
        }
      } catch (err: any) {
        setStudioBannerMsg({ type: "error", text: err.message || "Failed to adjust stock" });
      } finally {
        setIsAdjustingStock(false);
      }
    } else {
      const prev = Number(stock) || 0;
      const next = Math.max(0, prev + delta);
      setStock(next);
      setInventoryHistory((prevLogs) => [
        {
          id: `inv_${Date.now()}`,
          timestamp: new Date().toISOString(),
          adjustment: next - prev,
          previousStock: prev,
          newStock: next,
          reason: stockAdjustReason || "Manual adjustment",
          actor: "Admin",
        },
        ...prevLogs,
      ]);
      setStockAdjustDelta("");
    }
  };

  // Build Complete Payload
  const buildProductPayload = (asDraft: boolean): Omit<Product, "_id"> => {
    const resolvedBrand =
      brand === "__custom__" ? customBrandInput.trim() || "Alike Sovereign" : brand;

    const colorGroup = variantOptionGroups.find((g) => g.name.toLowerCase().includes("color"));
    const sizeGroup = variantOptionGroups.find((g) => g.name.toLowerCase().includes("size"));

    // Determine primary badge string for legacy storefront compatibility
    let computedBadge = primaryBadge;
    if (!computedBadge) {
      if (badgesConfig.flashSale || flashSaleConfig.enabled) computedBadge = "SALE";
      else if (badgesConfig.bestSeller) computedBadge = "HOT";
      else if (badgesConfig.newArrival) computedBadge = "NEW";
      else if (badgesConfig.featuredProduct) computedBadge = "TRENDING";
      else if (badgesConfig.limitedStock && effectiveStock <= lowStockThreshold) computedBadge = "LIMITED";
    }

    const effectiveDeliveryCharge = shippingConfig.freeShipping
      ? 0
      : shippingConfig.chargeMode === "manual"
      ? Number(shippingConfig.customShippingFee) || 0
      : Math.round(chargeableWeightKg * 40);

    return {
      name: name.trim() || (asDraft ? "Untitled Draft Product" : ""),
      localizedName: localizedName.trim(),
      brand: resolvedBrand,
      category: category.trim(),
      subCategory: subCategory.trim(),
      nestedCategory: nestedCategory.trim(),
      audience,
      productType,
      condition,
      modelNumber: modelNumber.trim(),
      internalProductId: internalProductId.trim(),
      internalSearchTags,
      projectReference: projectReference.trim(),
      seoTitle: seoTitle.trim() || name.trim(),
      seoDescription: seoDescription.trim() || description.replace(/<[^>]*>/g, "").slice(0, 155),
      seoKeywords,
      tags: seoKeywords,
      eligibleFor20MinDelivery: Boolean(badgesConfig.fastDelivery),
      price: Number(price) || 0,
      mrp: Number(mrp) >= Number(price) ? Number(mrp) : Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      saleStartDate,
      saleEndDate,
      minOrderQty: Number(minOrderQty) || 1,
      maxOrderQty: Number(maxOrderQty) || 50,
      bundleInfo: bundleInfo.trim(),
      lowStockThreshold: Number(lowStockThreshold) || 5,
      stock: effectiveStock,
      stockStatus:
        effectiveStock <= 0
          ? "Out of Stock"
          : effectiveStock <= lowStockThreshold
          ? `Only ${effectiveStock} left!`
          : "In Stock",
      badge: computedBadge,
      isFlashSale: Boolean(badgesConfig.flashSale || flashSaleConfig.enabled),
      image: images[0] || whiteBgImage || "",
      images: images.length > 0 ? images : whiteBgImage ? [whiteBgImage] : [],
      whiteBgImage,
      promoBannerImage,
      videoUrl: videoUrl.trim(),
      description,
      highlights: highlights.map((h) => h.trim()).filter(Boolean),
      benefitsUseCases,
      technicalSummary: technicalSummary.trim(),
      whatsInTheBox: whatsInTheBox.trim(),
      careInstructions: careInstructions.trim(),
      comparisonTable: comparisonTable.filter((r) => r.feature.trim()),
      manualUrl: manualUrl.trim(),
      specifications,
      customSpecifications,
      variants: hasVariants ? variants : [],
      variantOptionGroups: hasVariants ? variantOptionGroups : [],
      colors: colorGroup ? colorGroup.values : initialProduct?.colors || [],
      sizes: sizeGroup ? sizeGroup.values : initialProduct?.sizes || [],
      isWholesale,
      wholesalePrice: Number(wholesalePrice) || 0,
      wholesaleMinQty: Number(wholesaleMinQty) || 1,
      sellerId,
      sellerShopName,
      hsnCode: hsnCode.trim(),
      gstRate: Number(gstRate) ?? 18,
      countryOfOrigin: countryOfOrigin.trim() || "India",
      manufacturerDetails: manufacturerDetails.trim(),
      packInfo: packInfo.trim(),
      sku: sku.trim(),
      deliveryCharge: effectiveDeliveryCharge,
      packageWeightKg: Number(packageWeightKg) || 0.5,
      packageLengthCm: Number(packageLengthCm) || 20,
      packageWidthCm: Number(packageWidthCm) || 15,
      packageHeightCm: Number(packageHeightCm) || 10,
      badgesConfig: {
        ...badgesConfig,
        verifiedSeller: Boolean(badgesConfig.verifiedSeller && isAssignedSellerVerified),
        limitedStock: Boolean(badgesConfig.limitedStock && effectiveStock <= lowStockThreshold),
      },
      flashSaleConfig,
      shippingConfig: {
        ...shippingConfig,
        volumetricWeightKg,
      },
      warrantyConfig,
      fulfilmentConfig,
      inventoryHistory,
      isDraft: asDraft,
      isPublished: asDraft ? false : isPublished,
      isHidden: asDraft ? true : isHidden,
      scheduledPublishAt: scheduledPublishAt || "",
      moderationStatus: asDraft ? "draft" : moderationStatus,
      approvalStatus: asDraft ? "draft" : moderationStatus === "pending" ? "pending" : "approved",
      contentScore: contentEvaluation.totalScore,
    };
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (isSavingDraft || isPublishing) return;
    setIsSavingDraft(true);
    setStudioBannerMsg(null);
    try {
      const payload = buildProductPayload(true);
      let saved: Product;
      if (isEditMode && initialProduct) {
        const targetId = initialProduct._id || String(initialProduct.id);
        saved = isSellerMode
          ? await sellerApi.updateProduct(targetId, payload)
          : await adminApi.updateProduct(targetId, payload);
      } else {
        saved = isSellerMode
          ? await sellerApi.createProduct(payload)
          : await adminApi.createProduct(payload);
      }
      const nowStr = new Date().toLocaleTimeString();
      setLastSavedTime(nowStr);
      setHasUnsavedChanges(false);
      setStudioBannerMsg({
        type: "success",
        text: `Draft "${saved.name || name}" saved at ${nowStr}. Customers will not see this product until published.`,
      });
      onSaved(saved, true);
    } catch (err: any) {
      setStudioBannerMsg({
        type: "error",
        text: err.message || "Failed to save draft",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Submit for Approval Action (Seller QC or Admin Review Queue)
  const handleSubmitForApproval = async () => {
    const validationErr = validateForPublish();
    if (validationErr) {
      setStudioBannerMsg({ type: "error", text: validationErr });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (isPublishing || isSavingDraft) return;
    setIsPublishing(true);
    setStudioBannerMsg(null);
    try {
      const payload = {
        ...buildProductPayload(false),
        submitForApproval: true,
        isPublished: false,
        isHidden: true,
        moderationStatus: "pending",
        approvalStatus: "pending",
      };
      let saved: Product;
      if (isEditMode && initialProduct) {
        const targetId = initialProduct._id || String(initialProduct.id);
        saved = isSellerMode
          ? await sellerApi.updateProduct(targetId, payload)
          : await adminApi.updateProduct(targetId, payload);
      } else {
        saved = isSellerMode
          ? await sellerApi.createProduct(payload)
          : await adminApi.createProduct(payload);
      }
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}
      setHasUnsavedChanges(false);
      onSaved(saved, false);
    } catch (err: any) {
      setStudioBannerMsg({
        type: "error",
        text: err.message || "Failed to submit product for approval",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSafeBack = () => {
    if (hasUnsavedChanges && name.trim().length > 0) {
      setShowUnsavedConfirmModal(true);
    } else {
      onBack();
    }
  };

  // Validate before Publish
  const validateForPublish = (): string | null => {
    if (!name.trim()) return "Product Name is required in Section A (Basic Information).";
    if (!category.trim()) return "Primary Category is required in Section A.";
    if (images.length === 0 && !whiteBgImage) {
      return "At least 1 product image is required in Section B (Product Images).";
    }
    if (Number(price) <= 0) {
      return "Selling Price must be greater than ₹0 in Section D (Price, Stock & Variants).";
    }
    if (Number(mrp) < Number(price)) {
      return "Regular Price (MRP) must be greater than or equal to Selling Price in Section D.";
    }
    if (hasVariants && variants.length > 0) {
      for (const v of variants) {
        if (Number(v.price) <= 0) {
          return `Variant "${v.name}" must have a regular price greater than ₹0.`;
        }
        if (v.specialPrice && Number(v.specialPrice) > Number(v.price)) {
          return `Variant "${v.name}" special price cannot exceed its regular price.`;
        }
      }
    }
    return null;
  };

  const handleTriggerPublish = () => {
    const validationErr = validateForPublish();
    if (validationErr) {
      setStudioBannerMsg({ type: "error", text: validationErr });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setShowPublishConfirmModal(true);
  };

  const handleConfirmPublish = async () => {
    if (isPublishing || isSavingDraft) return;
    setIsPublishing(true);
    setStudioBannerMsg(null);
    try {
      const payload = buildProductPayload(false);
      let saved: Product;
      if (isEditMode && initialProduct) {
        const targetId = initialProduct._id || String(initialProduct.id);
        saved = isSellerMode
          ? await sellerApi.updateProduct(targetId, payload)
          : await adminApi.updateProduct(targetId, payload);
      } else {
        saved = isSellerMode
          ? await sellerApi.createProduct(payload)
          : await adminApi.createProduct(payload);
      }
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}
      setShowPublishConfirmModal(false);
      setHasUnsavedChanges(false);
      onSaved(saved, false);
    } catch (err: any) {
      setStudioBannerMsg({
        type: "error",
        text: err.message || "Failed to publish product",
      });
      setShowPublishConfirmModal(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const plainDescriptionText = description.replace(/<[^>]*>/g, "");
  const descWordCount = plainDescriptionText.trim()
    ? plainDescriptionText.trim().split(/\s+/).length
    : 0;

  return (
    <div className="daraz-studio-root min-h-screen bg-slate-50/80 pb-28 text-slate-900">
      {/* Top Studio Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-4 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            {/* Breadcrumbs: 14–15px */}
            <nav className="mkt-breadcrumb flex items-center gap-1.5 text-slate-500 mb-1.5">
              <button
                type="button"
                onClick={handleSafeBack}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                {isSellerMode ? "Seller Center" : "Admin Dashboard"}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={handleSafeBack}
                className="hover:text-slate-900 transition-colors cursor-pointer"
              >
                {isSellerMode ? "Manage Products" : "Products"}
              </button>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-rose-600 font-semibold">
                {isEditMode ? `Edit Product (${initialProduct?.name?.slice(0, 28)}...)` : "Add New Product"}
              </span>
            </nav>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleSafeBack}
                className="mkt-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </button>
              <h1 className="mkt-page-title text-slate-900">
                {isEditMode
                  ? `Edit Product — ${isSellerMode ? sellerShopName : "Admin Catalog"}`
                  : `Add New Product — ${isSellerMode ? `${sellerShopName} Seller Studio` : "Seller Center Studio"}`}
              </h1>
              {initialProduct?.isDraft && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold">
                  Draft Mode
                </span>
              )}
              {lastSavedTime && (
                <span className="mkt-helper text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Last saved: {lastSavedTime}
                </span>
              )}
            </div>
          </div>

          {/* Quick Jump Section Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {[
              { id: "sec-basic", label: "A. Basic Info" },
              { id: "sec-media", label: "B. Media Center" },
              { id: "sec-specs", label: "C. Specifications" },
              { id: "sec-pricing", label: "D. Price & Variants" },
              { id: "sec-description", label: "E. Description" },
              { id: "sec-badges", label: "F. Badges" },
              { id: "sec-shipping", label: "G. Shipping & Warranty" },
              { id: "sec-fulfilment", label: "H. Fulfilment" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => scrollToSection(tab.id)}
                className="mkt-btn px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200/80 transition-colors whitespace-nowrap cursor-pointer"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recovery Banner or Status Alert */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-4 space-y-3">
        {hasLocalDraftBackup && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                An unsaved product draft was found in your browser session. Would you like to restore your previous work?
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={restoreLocalDraft}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
              >
                Restore Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(draftStorageKey);
                  setHasLocalDraftBackup(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {studioBannerMsg && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
              studioBannerMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {studioBannerMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{studioBannerMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStudioBannerMsg(null)}
              className="p-1 rounded hover:bg-black/5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main 2-Column Workspace Grid */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Form Sections A - H (8 cols on desktop) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* =====================================================================
              SECTION A — BASIC INFORMATION
             ===================================================================== */}
          <section
            id="sec-basic"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-basic")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  A
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Basic Information</h2>
                  <p className="mkt-helper text-slate-500">
                    Product title, Bengali/localized name, category hierarchy, brand, internal IDs, and SEO metadata
                  </p>
                </div>
              </div>
              {collapsedSections["sec-basic"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-basic"] && (
              <div className="p-6 space-y-5">
                {/* Product Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="mkt-form-label text-slate-800">
                      Product Name (English) <span className="text-rose-600">*</span>
                    </label>
                    <span
                      className={`mkt-helper tabular-nums ${
                        name.length > 200 ? "text-amber-600 font-semibold" : "text-slate-400"
                      }`}
                    >
                      {name.length} / 255 characters
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={255}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Alike Sovereign Chronograph Watch - 42mm Sapphire Crystal & Rose Gold Case"
                    className="mkt-input w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-rose-500 focus:outline-none"
                  />
                  <p className="mkt-helper text-slate-500 mt-1">
                    Recommended formula: Brand + Model + Key Specification + Material/Color (25–120 characters).
                  </p>
                </div>

                {/* Localized Name & Internal Product ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mkt-form-label block text-slate-700 mb-1.5">
                      Bengali / Localized Product Name (বাংলা নাম — Optional)
                    </label>
                    <input
                      type="text"
                      lang="bn"
                      value={localizedName}
                      onChange={(e) => setLocalizedName(e.target.value)}
                      placeholder="যেমন: আলাইক প্রিমিয়াম ক্রোনোগ্রাফ ঘড়ি"
                      className="font-bengali mkt-input w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mkt-form-label block text-slate-700 mb-1.5">
                      Internal Product ID (System Assigned)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={internalProductId}
                        onChange={(e) => setInternalProductId(e.target.value)}
                        className="mkt-input w-full px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => setInternalProductId(`ALK-PRD-${Date.now().toString().slice(-6)}`)}
                        className="mkt-btn px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shrink-0"
                        title="Regenerate Internal ID"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hierarchical Searchable Category Tree */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="mkt-card-heading text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-rose-600" />
                        <span>Hierarchical Category Selection</span>
                        <span className="text-rose-600">*</span>
                      </h3>
                      <p className="mkt-helper text-slate-500">
                        Select Primary Category → Subcategory → Nested Category to unlock category-specific attributes
                      </p>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Quick search category..."
                        className="mkt-input w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Quick Search Matches if searching */}
                  {categorySearch.trim() && (
                    <div className="bg-white rounded-lg border border-slate-200 p-2 max-h-40 overflow-y-auto space-y-1">
                      {HIERARCHICAL_CATEGORIES.flatMap((c) =>
                        c.subCategories.flatMap((s) =>
                          s.nested
                            .filter(
                              (n) =>
                                c.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                                s.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                                n.toLowerCase().includes(categorySearch.toLowerCase())
                            )
                            .map((n) => ({ c, s, n }))
                        )
                      ).map(({ c, s, n }, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCategory(c.id);
                            setSubCategory(s.label);
                            setNestedCategory(n);
                            setCategorySearch("");
                            applyCategoryPresets(c.id);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-50 text-xs flex items-center justify-between cursor-pointer"
                        >
                          <span>
                            <strong className="text-slate-900">{c.label}</strong> → {s.label} →{" "}
                            <span className="text-rose-600 font-semibold">{n}</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Select
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        1. Primary Category <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => {
                          const nextCat = e.target.value;
                          setCategory(nextCat);
                          const node = HIERARCHICAL_CATEGORIES.find((c) => c.id === nextCat);
                          const firstSub = node?.subCategories?.[0];
                          setSubCategory(firstSub?.label || "");
                          setNestedCategory(firstSub?.nested?.[0] || "");
                          applyCategoryPresets(nextCat);
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        {HIERARCHICAL_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label} ({c.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        2. Subcategory
                      </label>
                      <select
                        value={subCategory}
                        onChange={(e) => {
                          const nextSub = e.target.value;
                          setSubCategory(nextSub);
                          const subObj = activeCategoryNode.subCategories.find(
                            (s) => s.label === nextSub || s.id === nextSub
                          );
                          setNestedCategory(subObj?.nested?.[0] || "");
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="">Select Subcategory...</option>
                        {activeCategoryNode.subCategories.map((s) => (
                          <option key={s.id} value={s.label}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        3. Nested Leaf Category
                      </label>
                      <select
                        value={nestedCategory}
                        onChange={(e) => setNestedCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="">Select Nested Category...</option>
                        {(
                          activeCategoryNode.subCategories.find((s) => s.label === subCategory)?.nested ||
                          activeCategoryNode.subCategories[0]?.nested ||
                          []
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Path Pill */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="font-semibold text-slate-500">Selected Path:</span>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800">
                        {activeCategoryNode.label}
                      </span>
                      {subCategory && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-800">
                            {subCategory}
                          </span>
                        </>
                      )}
                      {nestedCategory && (
                        <>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 font-bold text-rose-700">
                            {nestedCategory}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Brand, Product Type, Condition, Audience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Brand <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={APPROVED_BRANDS.includes(brand) ? brand : "__custom__"}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setBrand("__custom__");
                        } else {
                          setBrand(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                    >
                      {APPROVED_BRANDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                      <option value="__custom__">+ Enter Custom Brand...</option>
                    </select>
                    {brand === "__custom__" && (
                      <input
                        type="text"
                        value={customBrandInput}
                        onChange={(e) => setCustomBrandInput(e.target.value)}
                        placeholder="Type brand name..."
                        className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Product Type
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="physical">Physical Product</option>
                      <option value="digital">Digital / Voucher</option>
                      <option value="service">Service / Installation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Product Condition
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="new">Brand New (Sealed)</option>
                      <option value="refurbished">Certified Refurbished</option>
                      <option value="used">Pre-Owned / Vintage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Target Audience
                    </label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                    >
                      <option value="unisex">Unisex / All</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="kids">Kids</option>
                      <option value="boys">Boys</option>
                      <option value="girls">Girls</option>
                    </select>
                  </div>
                </div>

                {/* Manufacturer & Model Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Manufacturer / Importer / Supplier
                    </label>
                    <input
                      type="text"
                      value={manufacturerDetails}
                      onChange={(e) => setManufacturerDetails(e.target.value)}
                      placeholder="e.g., Alike Sovereign Craft Pvt. Ltd., New Delhi"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Model Number / Style Code
                    </label>
                    <input
                      type="text"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      placeholder="e.g., SOV-CHR-2025-RG"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Private Admin-Only Fields (Never Exposed to Customers) */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                        Internal Admin-Only Metadata
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 font-mono text-[10px] font-bold">
                      PRIVATE • STRIPPED FROM PUBLIC API
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Internal Sourcing / Project Reference
                      </label>
                      <input
                        type="text"
                        value={projectReference}
                        onChange={(e) => setProjectReference(e.target.value)}
                        placeholder="e.g., BATCH-Q4-IMPORT-LOT9"
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Internal Admin Search Tags
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={internalTagInput}
                          onChange={(e) => setInternalTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && internalTagInput.trim()) {
                              e.preventDefault();
                              setInternalSearchTags((prev) =>
                                Array.from(new Set([...prev, internalTagInput.trim()]))
                              );
                              setInternalTagInput("");
                            }
                          }}
                          placeholder="Add private tag + Enter..."
                          className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (internalTagInput.trim()) {
                              setInternalSearchTags((prev) =>
                                Array.from(new Set([...prev, internalTagInput.trim()]))
                              );
                              setInternalTagInput("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                      {internalSearchTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {internalSearchTags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-mono"
                            >
                              {t}
                              <button
                                type="button"
                                onClick={() =>
                                  setInternalSearchTags((prev) => prev.filter((x) => x !== t))
                                }
                                className="hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* SEO & Search Discoverability */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-rose-600" />
                      <span>SEO & Storefront Search Metadata</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSeoTitle(`${name || "Product"} | Buy Online at Best Price on ALIKE-ND`);
                        setSeoDescription(
                          `Shop ${name || "authentic products"} by ${brand} on ALIKE-ND. ${
                            highlights.filter(Boolean).slice(0, 2).join(". ") ||
                            "Fast delivery, genuine warranty, and easy returns."
                          }`.slice(0, 160)
                        );
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Auto-Generate from Title
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        SEO Meta Title
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="SEO Title (60-70 chars recommended)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Search Keywords / Public Tags
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={seoKeywordInput}
                          onChange={(e) => setSeoKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && seoKeywordInput.trim()) {
                              e.preventDefault();
                              setSeoKeywords((prev) =>
                                Array.from(new Set([...prev, seoKeywordInput.trim()]))
                              );
                              setSeoKeywordInput("");
                            }
                          }}
                          placeholder="Add keyword + Enter..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (seoKeywordInput.trim()) {
                              setSeoKeywords((prev) =>
                                Array.from(new Set([...prev, seoKeywordInput.trim()]))
                              );
                              setSeoKeywordInput("");
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      SEO Meta Description
                    </label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Summarize key product benefits for search engine snippets (up to 160 chars)..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>

                  {seoKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {seoKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 text-[11px]"
                        >
                          #{kw}
                          <button
                            type="button"
                            onClick={() => setSeoKeywords((prev) => prev.filter((k) => k !== kw))}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION B — PRODUCT IMAGES & MEDIA CENTER
             ===================================================================== */}
          <section
            id="sec-media"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-media")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  B
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Product Images & Media Center</h2>
                  <p className="mkt-helper text-slate-500">
                    Main cover image, multi-angle gallery (up to 8), white-background image, promo banner & product video
                  </p>
                </div>
              </div>
              {collapsedSections["sec-media"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-media"] && (
              <div className="p-6 space-y-6">
                {mediaError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                    <span>{mediaError}</span>
                    <button type="button" onClick={() => setMediaError("")}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {uploadingMedia && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-600">
                      <span>Validating & uploading media...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-rose-600 transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Gallery Grid (Up to 8 slots) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Product Gallery Images ({images.length} / 8) <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMediaCenter(!showMediaCenter)}
                      className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{showMediaCenter ? "Hide Media Center" : "Browse Media Center Presets"}</span>
                    </button>
                  </div>

                  {/* Media Center Drawer */}
                  {showMediaCenter && (
                    <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-700 mb-2">
                        Click any studio-grade image to add to your gallery:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                        {CURATED_MEDIA_GALLERY.map((item) => (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => {
                              if (images.length < 8 && !images.includes(item.url)) {
                                setImages((prev) => [...prev, item.url]);
                              }
                            }}
                            className="group relative rounded-lg overflow-hidden border border-slate-200 bg-white hover:border-rose-500 transition-all cursor-pointer text-left"
                          >
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-20 object-cover"
                            />
                            <div className="p-1.5 text-[10px] font-medium text-slate-700 truncate">
                              {item.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div
                        key={`${imgUrl}_${idx}`}
                        className={`relative group rounded-xl overflow-hidden border-2 bg-slate-50 aspect-square flex flex-col justify-between ${
                          idx === 0 ? "border-rose-600 ring-2 ring-rose-500/20" : "border-slate-200"
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Product ${idx + 1}`}
                          onClick={() => setLightboxImage(imgUrl)}
                          className="w-full h-full object-cover cursor-zoom-in"
                        />
                        {idx === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold shadow-xs">
                            MAIN COVER
                          </span>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...images];
                                  const temp = next[idx - 1];
                                  next[idx - 1] = next[idx];
                                  next[idx] = temp;
                                  setImages(next);
                                }}
                                className="p-1 rounded bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                                title="Move Left"
                              >
                                <MoveLeft className="w-3 h-3" />
                              </button>
                            )}
                            {idx < images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...images];
                                  const temp = next[idx + 1];
                                  next[idx + 1] = next[idx];
                                  next[idx] = temp;
                                  setImages(next);
                                }}
                                className="p-1 rounded bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                                title="Move Right"
                              >
                                <MoveRight className="w-3 h-3" />
                              </button>
                            )}
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const chosen = images[idx];
                                  const rest = images.filter((_, i) => i !== idx);
                                  setImages([chosen, ...rest]);
                                }}
                                className="px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold text-[10px] cursor-pointer"
                                title="Set as Cover"
                              >
                                Cover
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Drag and drop Upload Tile */}
                    {images.length < 8 && (
                      <label
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleFileUpload(e.dataTransfer.files, "gallery");
                        }}
                        className="rounded-xl border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50/60 hover:bg-rose-50/30 aspect-square flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 text-rose-600 mb-1.5" />
                        <span className="text-xs font-bold text-slate-700">Upload / Drop</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files, "gallery")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Paste Image URL bar */}
                  <div className="flex gap-2 mt-3">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                      className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (imageUrlInput.trim() && images.length < 8) {
                          setImages((prev) => [...prev, imageUrlInput.trim()]);
                          setImageUrlInput("");
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0"
                    >
                      + Add URL
                    </button>
                  </div>
                </div>

                {/* Specialized Media Slots: White-BG Image, Promo Banner, Product Video */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200">
                  {/* White Background Slot */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">White-Background Image</span>
                      <span className="text-[10px] font-mono text-slate-500">Recommended 1:1</span>
                    </div>
                    {whiteBgImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-white">
                        <img src={whiteBgImage} alt="White BG" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => setWhiteBgImage("")}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-rose-600 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="h-28 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-xs text-slate-500 hover:border-rose-500 cursor-pointer">
                        <Upload className="w-4 h-4 mb-1 text-slate-400" />
                        <span>Upload Pure White-BG</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e.target.files, "whiteBg")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Promotional Banner Slot */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">Promotional Banner</span>
                      <span className="text-[10px] font-mono text-slate-500">Campaign 16:9</span>
                    </div>
                    {promoBannerImage ? (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 h-28 bg-white">
                        <img src={promoBannerImage} alt="Promo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPromoBannerImage("")}
                          className="absolute top-1.5 right-1.5 p-1 rounded bg-rose-600 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="h-28 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-xs text-slate-500 hover:border-rose-500 cursor-pointer">
                        <Upload className="w-4 h-4 mb-1 text-slate-400" />
                        <span>Upload Promo Graphic</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => handleFileUpload(e.target.files, "promoBanner")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Product Video Slot */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-rose-600" />
                        <span>Product Video</span>
                      </span>
                      <label className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer">
                        Upload MP4
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          onChange={(e) => handleFileUpload(e.target.files, "video")}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Paste MP4 or YouTube video URL..."
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Max 30–60s demonstration video. Boosts conversion by up to 28%.
                    </p>
                  </div>
                </div>

                {/* Image Guidelines Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3 text-xs text-blue-950">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold">Seller Center Image Quality Guidelines</div>
                    <ul className="list-disc list-inside text-[11px] text-blue-900/80 space-y-0.5">
                      <li>Minimum resolution: 800 × 800 px (1:1 square aspect ratio recommended for zoom).</li>
                      <li>Product should occupy at least 75% of the canvas without watermarks or promotional borders on the cover image.</li>
                      <li>Upload at least 3 angles (Front, Side/Detail, In-Use or Packaging).</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION C — PRODUCT SPECIFICATIONS
             ===================================================================== */}
          <section
            id="sec-specs"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-specs")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  C
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Product Specifications</h2>
                  <p className="mkt-helper text-slate-500">
                    Category-specific attributes, tax/compliance codes (HSN/GST), and custom specification builder
                  </p>
                </div>
              </div>
              {collapsedSections["sec-specs"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-specs"] && (
              <div className="p-6 space-y-6">
                {/* Category Preset Attributes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="mkt-card-heading text-slate-800">
                        Category Attributes ({activeCategoryNode.label})
                      </h3>
                      <p className="mkt-helper text-slate-500">
                        Filling required & recommended attributes improves search filter ranking
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => applyCategoryPresets(category)}
                      className="mkt-btn px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                    >
                      + Load {activeCategoryNode.label} Presets
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCategoryNode.presetSpecs.map((ps) => (
                      <div key={ps.key}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {ps.key} {ps.required && <span className="text-rose-600">*</span>}
                        </label>
                        {ps.fieldType === "dropdown" && ps.options ? (
                          <select
                            value={specifications[ps.key] || ""}
                            onChange={(e) =>
                              setSpecifications((prev) => ({ ...prev, [ps.key]: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                          >
                            <option value="">Select {ps.key}...</option>
                            {ps.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={specifications[ps.key] || ""}
                            onChange={(e) =>
                              setSpecifications((prev) => ({ ...prev, [ps.key]: e.target.value }))
                            }
                            placeholder={ps.placeholder || `Enter ${ps.key}...`}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Compliance Fields */}
                <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      HSN / SAC Code <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={hsnCode}
                      onChange={(e) => setHsnCode(e.target.value)}
                      placeholder="e.g., 6203 / 8517"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      GST Rate (%) <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold"
                    >
                      {[0, 5, 12, 18, 28].map((r) => (
                        <option key={r} value={r}>
                          {r}% GST
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Country of Origin
                    </label>
                    <input
                      type="text"
                      value={countryOfOrigin}
                      onChange={(e) => setCountryOfOrigin(e.target.value)}
                      placeholder="India"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Net Pack Info
                    </label>
                    <input
                      type="text"
                      value={packInfo}
                      onChange={(e) => setPackInfo(e.target.value)}
                      placeholder="e.g., Pack of 1 / Net 500g"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Additional Key-Value Specifications */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Custom Specification Builder (Text, Number, Dropdown, Checkbox, Multi-Select)
                  </h3>

                  {/* Existing Standard & Custom Specs List */}
                  <div className="space-y-2">
                    {Object.entries(specifications)
                      .filter(([k]) => !activeCategoryNode.presetSpecs.some((p) => p.key === k))
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={k}
                            readOnly
                            className="w-1/3 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            value={v}
                            onChange={(e) =>
                              setSpecifications((prev) => ({ ...prev, [k]: e.target.value }))
                            }
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...specifications };
                              delete next[k];
                              setSpecifications(next);
                            }}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                    {customSpecifications.map((cs, idx) => (
                      <div key={cs.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] uppercase">
                          {cs.fieldType}
                        </span>
                        <input
                          type="text"
                          value={cs.key}
                          onChange={(e) => {
                            const next = [...customSpecifications];
                            next[idx].key = e.target.value;
                            setCustomSpecifications(next);
                          }}
                          className="w-1/3 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs font-semibold"
                        />
                        {cs.fieldType === "dropdown" && cs.options && cs.options.length > 0 ? (
                          <select
                            value={cs.value}
                            onChange={(e) => {
                              const next = [...customSpecifications];
                              next[idx].value = e.target.value;
                              setCustomSpecifications(next);
                            }}
                            className="flex-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs"
                          >
                            {cs.options.map((o) => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : cs.fieldType === "checkbox" ? (
                          <label className="flex-1 flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={cs.value === "Yes" || cs.value === "true"}
                              onChange={(e) => {
                                const next = [...customSpecifications];
                                next[idx].value = e.target.checked ? "Yes" : "No";
                                setCustomSpecifications(next);
                              }}
                            />
                            <span>{cs.value === "Yes" ? "Yes / Included" : "No"}</span>
                          </label>
                        ) : (
                          <input
                            type={cs.fieldType === "number" ? "number" : "text"}
                            value={cs.value}
                            onChange={(e) => {
                              const next = [...customSpecifications];
                              next[idx].value = e.target.value;
                              setCustomSpecifications(next);
                            }}
                            className="flex-1 px-2.5 py-1 rounded border border-slate-300 bg-white text-xs"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setCustomSpecifications((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Custom Spec Row */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Field Type
                      </label>
                      <select
                        value={newSpecType}
                        onChange={(e) => setNewSpecType(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="checkbox">Checkbox (Yes/No)</option>
                        <option value="multi-select">Multi-Select</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        Attribute Name
                      </label>
                      <input
                        type="text"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        placeholder="e.g., Water Resistance"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        {newSpecType === "dropdown" ? "Options (comma-separated)" : "Attribute Value"}
                      </label>
                      <input
                        type="text"
                        value={newSpecType === "dropdown" ? newSpecOptions : newSpecValue}
                        onChange={(e) =>
                          newSpecType === "dropdown"
                            ? setNewSpecOptions(e.target.value)
                            : setNewSpecValue(e.target.value)
                        }
                        placeholder={
                          newSpecType === "dropdown" ? "e.g., 30m, 50m, 100m" : "e.g., 50 Meters / 5 ATM"
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSpecKey.trim()) return;
                          const opts =
                            newSpecType === "dropdown"
                              ? newSpecOptions
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              : undefined;
                          const val =
                            newSpecType === "dropdown"
                              ? opts?.[0] || ""
                              : newSpecType === "checkbox"
                              ? "Yes"
                              : newSpecValue.trim();

                          setCustomSpecifications((prev) => [
                            ...prev,
                            {
                              id: `cs_${Date.now()}`,
                              key: newSpecKey.trim(),
                              value: val,
                              fieldType: newSpecType,
                              options: opts,
                            },
                          ]);
                          setSpecifications((prev) => ({ ...prev, [newSpecKey.trim()]: val }));
                          setNewSpecKey("");
                          setNewSpecValue("");
                          setNewSpecOptions("");
                        }}
                        className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                      >
                        + Add Spec
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION D — PRICE, STOCK & VARIANTS MATRIX
             ===================================================================== */}
          <section
            id="sec-pricing"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-pricing")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  D
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Price, Stock & Variants Matrix</h2>
                  <p className="mkt-helper text-slate-500">
                    MRP, special sale pricing, private cost margin, multi-variant SKU matrix & stock history
                  </p>
                </div>
              </div>
              {collapsedSections["sec-pricing"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-pricing"] && (
              <div className="p-6 space-y-6">
                {/* Primary Pricing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="mkt-form-label block text-slate-700 mb-1">
                      Regular Price (MRP ₹) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={mrp}
                      onChange={(e) => setMrp(Math.max(0, Number(e.target.value)))}
                      className="mkt-price w-full px-3.5 py-2 rounded-lg border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="mkt-form-label block text-slate-700 mb-1">
                      Selling / Special Price (₹) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                      className="mkt-price w-full px-3.5 py-2 rounded-lg border border-rose-400 bg-rose-50/20 text-rose-700"
                    />
                  </div>

                  <div>
                    <label className="mkt-form-label block text-amber-800 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cost Price (Private ₹)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={costPrice}
                      onChange={(e) => setCostPrice(Math.max(0, Number(e.target.value)))}
                      className="mkt-price w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50/40 text-amber-950"
                    />
                  </div>

                  {/* Live Calculated Discount & Profit Pill */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-center">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Customer Discount:</span>
                      <span className="mkt-price text-emerald-700">
                        ₹{discountAmount.toLocaleString("en-IN")} ({discountPercent}% OFF)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-slate-500">Est. Gross Margin:</span>
                      <span
                        className={`mkt-price ${
                          unitProfit >= 0 ? "text-slate-900" : "text-rose-600"
                        }`}
                      >
                        ₹{unitProfit.toLocaleString("en-IN")} ({profitMarginPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sale Schedule, Order Qty Limits, Bundle Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Special Sale Start Date
                    </label>
                    <input
                      type="date"
                      value={saleStartDate}
                      onChange={(e) => setSaleStartDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Special Sale End Date
                    </label>
                    <input
                      type="date"
                      value={saleEndDate}
                      onChange={(e) => setSaleEndDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Min / Max Order Qty
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={minOrderQty}
                        onChange={(e) => setMinOrderQty(Math.max(1, Number(e.target.value)))}
                        className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                        title="Minimum Order Quantity"
                      />
                      <span className="text-slate-400">to</span>
                      <input
                        type="number"
                        min={1}
                        value={maxOrderQty}
                        onChange={(e) => setMaxOrderQty(Math.max(1, Number(e.target.value)))}
                        className="w-1/2 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                        title="Maximum Order Quantity"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Free Item / Bundle Offer Text
                    </label>
                    <input
                      type="text"
                      value={bundleInfo}
                      onChange={(e) => setBundleInfo(e.target.value)}
                      placeholder="e.g., Free Velvet Gift Box Included"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Primary Inventory & SKU Row */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Master SKU <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {hasVariants ? "Total Variant Stock (Auto)" : "Available Stock Units"}
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={hasVariants && variants.length > 0}
                      value={effectiveStock}
                      onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value))))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs font-bold disabled:bg-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Low-Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs"
                    />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 mb-1">Live Inventory State</div>
                    <div
                      className={`px-3 py-2 rounded-lg font-mono text-xs font-bold text-center border ${
                        effectiveStock <= 0
                          ? "bg-rose-100 border-rose-300 text-rose-800"
                          : effectiveStock <= lowStockThreshold
                          ? "bg-amber-100 border-amber-300 text-amber-900"
                          : "bg-emerald-100 border-emerald-300 text-emerald-900"
                      }`}
                    >
                      {effectiveStock <= 0
                        ? "OUT OF STOCK (0)"
                        : effectiveStock <= lowStockThreshold
                        ? `LOW STOCK (${effectiveStock} LEFT)`
                        : `IN STOCK (${effectiveStock} UNITS)`}
                    </div>
                  </div>
                </div>

                {/* Multi-Variant Matrix Builder Toggle */}
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="mkt-card-heading text-slate-900">
                        Product Variants & SKU Combinations (Size, Color, Storage, Custom)
                      </h3>
                      <p className="mkt-helper text-slate-500">
                        Enable if this product comes in multiple options with individual prices, SKUs, or stock levels
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => setHasVariants(e.target.checked)}
                        className="w-4 h-4 accent-rose-600 rounded"
                      />
                      <span className="mkt-form-label text-slate-800">Enable Multi-Variant Matrix</span>
                    </label>
                  </div>

                  {hasVariants && (
                    <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      {/* Option Groups Builder */}
                      <div className="space-y-3">
                        {variantOptionGroups.map((group, gIdx) => (
                          <div
                            key={group.name + gIdx}
                            className="p-3 rounded-lg bg-white border border-slate-200 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 uppercase font-mono">
                                Option Group {gIdx + 1}: {group.name}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVariantOptionGroups((prev) => prev.filter((_, i) => i !== gIdx))
                                }
                                className="text-xs text-rose-600 hover:underline cursor-pointer"
                              >
                                Remove Group
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {group.values.map((val) => (
                                <span
                                  key={val}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800"
                                >
                                  {val}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...variantOptionGroups];
                                      next[gIdx].values = next[gIdx].values.filter((v) => v !== val);
                                      setVariantOptionGroups(next);
                                    }}
                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}

                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={optionValueInputs[group.name] || ""}
                                  onChange={(e) =>
                                    setOptionValueInputs((prev) => ({
                                      ...prev,
                                      [group.name]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const val = (optionValueInputs[group.name] || "").trim();
                                      if (val && !group.values.includes(val)) {
                                        const next = [...variantOptionGroups];
                                        next[gIdx].values.push(val);
                                        setVariantOptionGroups(next);
                                        setOptionValueInputs((prev) => ({ ...prev, [group.name]: "" }));
                                      }
                                    }
                                  }}
                                  placeholder={`Add ${group.name} value...`}
                                  className="px-2.5 py-1 rounded border border-slate-300 text-xs w-36"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = (optionValueInputs[group.name] || "").trim();
                                    if (val && !group.values.includes(val)) {
                                      const next = [...variantOptionGroups];
                                      next[gIdx].values.push(val);
                                      setVariantOptionGroups(next);
                                      setOptionValueInputs((prev) => ({ ...prev, [group.name]: "" }));
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newOptionGroupName}
                              onChange={(e) => setNewOptionGroupName(e.target.value)}
                              placeholder="New option group (e.g., Storage, Material)..."
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newOptionGroupName.trim()) {
                                  setVariantOptionGroups((prev) => [
                                    ...prev,
                                    { name: newOptionGroupName.trim(), values: [] },
                                  ]);
                                  setNewOptionGroupName("");
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                            >
                              + Add Option Group
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={generateVariantMatrix}
                            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate Variant Combinations ({variantOptionGroups.reduce((acc, g) => acc * Math.max(1, g.values.length), 1)})</span>
                          </button>
                        </div>
                      </div>

                      {/* Bulk Apply Row */}
                      {variants.length > 0 && (
                        <div className="p-3 rounded-lg bg-white border border-slate-200 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 mr-1">Bulk Apply to All:</span>
                          <input
                            type="number"
                            placeholder="MRP ₹"
                            value={bulkVarPrice}
                            onChange={(e) => setBulkVarPrice(e.target.value)}
                            className="w-24 px-2.5 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <input
                            type="number"
                            placeholder="Sale ₹"
                            value={bulkVarSpecialPrice}
                            onChange={(e) => setBulkVarSpecialPrice(e.target.value)}
                            className="w-24 px-2.5 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <input
                            type="number"
                            placeholder="Stock"
                            value={bulkVarStock}
                            onChange={(e) => setBulkVarStock(e.target.value)}
                            className="w-20 px-2.5 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <input
                            type="text"
                            placeholder="SKU Prefix"
                            value={bulkVarSkuPrefix}
                            onChange={(e) => setBulkVarSkuPrefix(e.target.value)}
                            className="w-28 px-2.5 py-1 rounded border border-slate-300 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleBulkApplyToVariants}
                            className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                          >
                            Apply to All
                          </button>
                        </div>
                      )}

                      {/* Variants Table */}
                      {variants.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                                <th className="py-2.5 px-3">Variant</th>
                                <th className="py-2.5 px-3">Image</th>
                                <th className="py-2.5 px-3">SKU</th>
                                <th className="py-2.5 px-3">Regular ₹</th>
                                <th className="py-2.5 px-3">Special ₹</th>
                                <th className="py-2.5 px-3">Stock</th>
                                <th className="py-2.5 px-3">Wt (kg)</th>
                                <th className="py-2.5 px-3">Barcode/EAN</th>
                                <th className="py-2.5 px-3 text-center">Available</th>
                                <th className="py-2.5 px-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {variants.map((v, vIdx) => (
                                <tr key={v.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">
                                    {v.name}
                                  </td>
                                  <td className="py-2 px-3">
                                    <div className="flex items-center gap-1.5">
                                      {v.image || images[0] ? (
                                        <img
                                          src={v.image || images[0]}
                                          alt={v.name}
                                          className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0"
                                        />
                                      ) : null}
                                      <select
                                        value={v.image || ""}
                                        onChange={(e) => {
                                          const next = [...variants];
                                          next[vIdx].image = e.target.value;
                                          setVariants(next);
                                        }}
                                        className="w-24 px-1.5 py-1 rounded border border-slate-300 text-[11px] bg-white"
                                      >
                                        <option value="">Default Img</option>
                                        {images.map((imgUrl, imgI) => (
                                          <option key={imgI} value={imgUrl}>
                                            Gallery #{imgI + 1}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={v.sku}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].sku = e.target.value;
                                        setVariants(next);
                                      }}
                                      className="w-28 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].price = Math.max(0, Number(e.target.value));
                                        setVariants(next);
                                      }}
                                      className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      value={v.specialPrice ?? ""}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].specialPrice = e.target.value
                                          ? Math.max(0, Number(e.target.value))
                                          : undefined;
                                        setVariants(next);
                                      }}
                                      className="w-20 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      value={v.stock}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].stock = Math.max(0, Math.floor(Number(e.target.value)));
                                        setVariants(next);
                                      }}
                                      className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-xs font-bold"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={v.weightKg ?? packageWeightKg}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].weightKg = Math.max(0.05, Number(e.target.value));
                                        setVariants(next);
                                      }}
                                      className="w-16 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={v.barcode || ""}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].barcode = e.target.value;
                                        setVariants(next);
                                      }}
                                      placeholder="EAN / UPC"
                                      className="w-24 px-2 py-1 rounded border border-slate-300 font-mono text-xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={v.available}
                                      onChange={(e) => {
                                        const next = [...variants];
                                        next[vIdx].available = e.target.checked;
                                        setVariants(next);
                                      }}
                                      className="accent-emerald-600 w-4 h-4"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setVariants((prev) => prev.filter((_, i) => i !== vIdx))
                                      }
                                      className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock Adjustment Logger & Inventory History */}
                <div className="border-t border-slate-200 pt-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-rose-600" />
                    <span>Inventory Adjustment Log & Audit Trail</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      value={stockAdjustDelta}
                      onChange={(e) => setStockAdjustDelta(e.target.value)}
                      placeholder="e.g., +20 or -5"
                      className="w-36 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                    />
                    <input
                      type="text"
                      value={stockAdjustReason}
                      onChange={(e) => setStockAdjustReason(e.target.value)}
                      placeholder="Reason (e.g., New shipment received / Damaged unit)"
                      className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <button
                      type="button"
                      disabled={isAdjustingStock || !stockAdjustDelta}
                      onClick={handleManualStockAdjustment}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {isAdjustingStock ? "Logging..." : "Log Stock Adjustment"}
                    </button>
                  </div>

                  {inventoryHistory.length > 0 && (
                    <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 divide-y divide-slate-200 text-xs">
                      {inventoryHistory.slice(0, 8).map((log) => (
                        <div key={log.id} className="px-3 py-2 flex items-center justify-between">
                          <div>
                            <span
                              className={`font-mono font-bold mr-2 ${
                                log.adjustment >= 0 ? "text-emerald-700" : "text-rose-600"
                              }`}
                            >
                              {log.adjustment >= 0 ? `+${log.adjustment}` : log.adjustment} units
                            </span>
                            <span className="text-slate-700 font-medium">{log.reason}</span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {log.previousStock} → <strong>{log.newStock}</strong> • {log.actor} •{" "}
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION E — PRODUCT DESCRIPTION & HIGHLIGHTS
             ===================================================================== */}
          <section
            id="sec-description"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-description")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  E
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Product Description & Highlights</h2>
                  <p className="mkt-helper text-slate-500">
                    Sanitized rich-text editor, key bullet highlights, What's in the Box, care instructions & comparison matrix
                  </p>
                </div>
              </div>
              {collapsedSections["sec-description"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-description"] && (
              <div className="p-6 space-y-6">
                {/* Key Highlights Bullet Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Key Product Highlights (3–6 Bullet Points Recommended) <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => [...prev, ""])}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      + Add Highlight Bullet
                    </button>
                  </div>
                  <div className="space-y-2">
                    {highlights.map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={hl}
                          onChange={(e) => {
                            const next = [...highlights];
                            next[idx] = e.target.value;
                            setHighlights(next);
                          }}
                          placeholder={`Highlight #${idx + 1} (e.g., Scratch-resistant sapphire crystal glass with anti-reflective coating)`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                        {highlights.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setHighlights((prev) => prev.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rich Text Description Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Main Rich-Text Product Description <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-500">
                        {plainDescriptionText.length} chars • {descWordCount} words
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDescPreview(!showDescPreview)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                      >
                        {showDescPreview ? "Edit Source" : "Live HTML Preview"}
                      </button>
                    </div>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 rounded-t-xl bg-slate-100 border border-b-0 border-slate-300">
                    <button
                      type="button"
                      onClick={() => insertRichTag("<h3>", "</h3>", "Section Heading")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs font-bold cursor-pointer"
                      title="Heading"
                    >
                      <Heading2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertRichTag("<strong>", "</strong>", "Bold Text")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs font-bold cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertRichTag("<em>", "</em>", "Italic Text")}
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichTag("<ul>\n  <li>", "</li>\n  <li>Feature 2</li>\n</ul>", "Feature 1")
                      }
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichTag("<ol>\n  <li>", "</li>\n  <li>Step 2</li>\n</ol>", "Step 1")
                      }
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs cursor-pointer"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertRichTag(
                          '<table><thead><tr><th>Attribute</th><th>Detail</th></tr></thead><tbody><tr><td>',
                          "</td><td>Specification Value</td></tr></tbody></table>",
                          "Material"
                        )
                      }
                      className="p-1.5 rounded hover:bg-white text-slate-700 text-xs cursor-pointer"
                      title="Insert Table"
                    >
                      <TableIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetImg =
                          images[0] ||
                          whiteBgImage ||
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800";
                        insertRichTag(
                          `<img src="${targetImg}" alt="`,
                          `" style="max-width:100%;border-radius:12px;margin:10px 0;" />`,
                          name || "Product Showcase"
                        );
                      }}
                      className="px-2 py-1 rounded hover:bg-white text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      title="Insert Product Image into Description"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                      <span>Insert Image</span>
                    </button>
                    <span className="ml-auto text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      XSS & Script Sanitized
                    </span>
                  </div>

                  {showDescPreview ? (
                    <div
                      className="p-4 rounded-b-xl border border-slate-300 bg-slate-50 min-h-[160px] prose prose-sm max-w-none text-xs text-slate-800"
                      dangerouslySetInnerHTML={{
                        __html:
                          description
                            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
                            .replace(/\son\w+\s*=/gi, "") || "<p class='text-slate-400'>No description entered yet.</p>",
                      }}
                    />
                  ) : (
                    <textarea
                      ref={descTextareaRef}
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Write a detailed, customer-friendly description covering craftsmanship, materials, performance, and ideal usage..."
                      className="w-full p-3.5 rounded-b-xl border border-slate-300 text-xs leading-relaxed focus:border-rose-500 focus:outline-none"
                    />
                  )}
                </div>

                {/* What's in the Box, Care Instructions, Benefits, Manual URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      What's in the Box <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={whatsInTheBox}
                      onChange={(e) => setWhatsInTheBox(e.target.value)}
                      placeholder="e.g., 1x Main Unit, 1x Power Adapter, 1x User Manual, 1x Warranty Card"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Care & Maintenance Instructions
                    </label>
                    <input
                      type="text"
                      value={careInstructions}
                      onChange={(e) => setCareInstructions(e.target.value)}
                      placeholder="e.g., Wipe with clean microfiber cloth; avoid harsh chemicals"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Benefits & Ideal Use Cases
                    </label>
                    <input
                      type="text"
                      value={benefitsUseCases}
                      onChange={(e) => setBenefitsUseCases(e.target.value)}
                      placeholder="e.g., Ideal for executive formal wear, gifting, and daily precision use"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Downloadable Product Manual / PDF Guide URL
                    </label>
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION F — PRODUCT BADGES & PROMOTIONS
             ===================================================================== */}
          <section
            id="sec-badges"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-badges")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  F
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Product Badges & Promotions</h2>
                  <p className="mkt-helper text-slate-500">
                    Storefront merchandising badges, Flash Sale scheduling, and rule-verified trust indicators
                  </p>
                </div>
              </div>
              {collapsedSections["sec-badges"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-badges"] && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: "fastDelivery", label: "20-Min / Fast Delivery", desc: "Express dispatch badge" },
                    { key: "flashSale", label: "Flash Sale Deal", desc: "Countdown timer & deal tag" },
                    { key: "bestSeller", label: "Best Seller (HOT)", desc: "High-demand catalog badge" },
                    { key: "newArrival", label: "New Arrival (NEW)", desc: "Fresh launch highlight" },
                    { key: "featuredProduct", label: "Featured / Trending", desc: "Curated spotlight placement" },
                    {
                      key: "verifiedSeller",
                      label: "Verified Seller Badge",
                      desc: isAssignedSellerVerified
                        ? "Seller KYC is approved"
                        : "Requires KYC-verified seller",
                      disabled: !isAssignedSellerVerified,
                    },
                    {
                      key: "limitedStock",
                      label: "Limited Stock Alert",
                      desc:
                        effectiveStock <= lowStockThreshold
                          ? "Active (Stock ≤ Threshold)"
                          : `Requires stock ≤ ${lowStockThreshold}`,
                      disabled: effectiveStock > lowStockThreshold,
                    },
                  ].map((b) => {
                    const checked = Boolean((badgesConfig as any)[b.key]);
                    return (
                      <label
                        key={b.key}
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          b.disabled
                            ? "opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed"
                            : checked
                            ? "bg-rose-50/60 border-rose-400"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={b.disabled}
                          checked={checked && !b.disabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setBadgesConfig((prev) => ({ ...prev, [b.key]: val }));
                            if (b.key === "flashSale") {
                              setFlashSaleConfig((prev) => ({ ...prev, enabled: val }));
                            }
                          }}
                          className="mt-0.5 accent-rose-600"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{b.label}</div>
                          <div className="text-[10px] text-slate-500">{b.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Flash Sale Campaign Config */}
                {(badgesConfig.flashSale || flashSaleConfig.enabled) && (
                  <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span>Flash Sale Campaign Rules</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-orange-900 mb-1">
                          Flash Start Time
                        </label>
                        <input
                          type="datetime-local"
                          value={flashSaleConfig.startTime}
                          onChange={(e) =>
                            setFlashSaleConfig((prev) => ({ ...prev, startTime: e.target.value }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-orange-900 mb-1">
                          Flash End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={flashSaleConfig.endTime}
                          onChange={(e) =>
                            setFlashSaleConfig((prev) => ({ ...prev, endTime: e.target.value }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-orange-900 mb-1">
                          Campaign Stock Allocation
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={flashSaleConfig.stockLimit}
                          onChange={(e) =>
                            setFlashSaleConfig((prev) => ({
                              ...prev,
                              stockLimit: Math.max(1, Number(e.target.value)),
                            }))
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-orange-300 bg-white text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION G — SHIPPING, PACKAGE & WARRANTY
             ===================================================================== */}
          <section
            id="sec-shipping"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-shipping")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  G
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Shipping, Package & Warranty</h2>
                  <p className="mkt-helper text-slate-500">
                    Package weight & dimensions, volumetric weight, shipping fee rules, return policy, warranty & hazmat
                  </p>
                </div>
              </div>
              {collapsedSections["sec-shipping"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-shipping"] && (
              <div className="p-6 space-y-6">
                {/* Package Weight & Dimensions */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Package Weight (kg) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min={0.05}
                      value={packageWeightKg}
                      onChange={(e) => setPackageWeightKg(Math.max(0.05, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Length (cm) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={packageLengthCm}
                      onChange={(e) => setPackageLengthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Width (cm) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={packageWidthCm}
                      onChange={(e) => setPackageWidthCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Height (cm) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={packageHeightCm}
                      onChange={(e) => setPackageHeightCm(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Volumetric Wt</span>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {volumetricWeightKg} kg
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Chargeable: {chargeableWeightKg} kg
                    </span>
                  </div>
                </div>

                {/* Shipping Fee Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Shipping Class
                    </label>
                    <select
                      value={shippingConfig.shippingClass || "Standard Parcel"}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({ ...prev, shippingClass: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="Standard Parcel">Standard Parcel</option>
                      <option value="Express Air">Express Air (20-Min / Next-Day)</option>
                      <option value="Heavy / Bulky Cargo">Heavy / Bulky Cargo</option>
                      <option value="Fragile / High-Value">Fragile / High-Value Sovereign</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Shipping Fee Mode
                    </label>
                    <select
                      value={shippingConfig.chargeMode}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({ ...prev, chargeMode: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="auto">Auto-Calculate by Weight</option>
                      <option value="manual">Custom Flat Shipping Fee</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Custom Shipping Fee (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      disabled={shippingConfig.freeShipping}
                      value={shippingConfig.freeShipping ? 0 : shippingConfig.customShippingFee}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({
                          ...prev,
                          customShippingFee: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs disabled:bg-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Delivery SLA
                    </label>
                    <input
                      type="text"
                      value={shippingConfig.estimatedDeliveryRange}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({
                          ...prev,
                          estimatedDeliveryRange: e.target.value,
                        }))
                      }
                      placeholder="2-4 Business Days"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 w-full">
                      <input
                        type="checkbox"
                        checked={shippingConfig.freeShipping}
                        onChange={(e) =>
                          setShippingConfig((prev) => ({ ...prev, freeShipping: e.target.checked }))
                        }
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-emerald-900">
                        Free Shipping Eligible
                      </span>
                    </label>
                  </div>
                </div>

                {/* Warranty, Returns & Dangerous Goods */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Warranty Type
                    </label>
                    <select
                      value={warrantyConfig.warrantyType}
                      onChange={(e) =>
                        setWarrantyConfig((prev) => ({ ...prev, warrantyType: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="manufacturer">Brand / Manufacturer Warranty</option>
                      <option value="seller">Seller Store Warranty</option>
                      <option value="no_warranty">No Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Warranty Period
                    </label>
                    <select
                      value={warrantyConfig.warrantyDuration}
                      onChange={(e) =>
                        setWarrantyConfig((prev) => ({ ...prev, warrantyDuration: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="No Warranty">N/A</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="Lifetime">Lifetime Limited</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Return Policy Window
                    </label>
                    <select
                      value={shippingConfig.returnWindowDays}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({
                          ...prev,
                          returnEligible: Number(e.target.value) > 0,
                          returnWindowDays: Number(e.target.value),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value={7}>7 Days Easy Return</option>
                      <option value={10}>10 Days Return</option>
                      <option value={14}>14 Days Return</option>
                      <option value={30}>30 Days Return</option>
                      <option value={0}>Non-Returnable Item</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dangerous Goods / Hazmat
                    </label>
                    <select
                      value={shippingConfig.dangerousGoods}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({ ...prev, dangerousGoods: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="none">None (Standard Safe Cargo)</option>
                      <option value="battery">Contains Lithium Battery</option>
                      <option value="liquid">Liquid / Aerosol / Perfume</option>
                      <option value="fragile">Fragile Glass / Ceramic</option>
                      <option value="flammable">Flammable Material</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* =====================================================================
              SECTION H — SELLER & FULFILMENT SETTINGS
             ===================================================================== */}
          <section
            id="sec-fulfilment"
            className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-24"
          >
            <div
              onClick={() => toggleSection("sec-fulfilment")}
              className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-rose-600 text-white text-sm font-semibold flex items-center justify-center">
                  H
                </span>
                <div>
                  <h2 className="mkt-section-heading text-slate-900">Seller & Fulfilment Settings</h2>
                  <p className="mkt-helper text-slate-500">
                    Storefront assignment, fulfilment warehouse, dispatch SLA, return address & catalog visibility
                  </p>
                </div>
              </div>
              {collapsedSections["sec-fulfilment"] ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {!collapsedSections["sec-fulfilment"] && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assigned Seller / Storefront
                    </label>
                    {isSellerMode ? (
                      <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>{sellerShopName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Your Store
                        </span>
                      </div>
                    ) : (
                      <select
                        value={sellerId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setSellerId(nextId);
                          if (nextId === "admin") {
                            setSellerShopName("ALIKE-ND Official");
                          } else {
                            const found = sellers.find((s) => String(s._id) === nextId);
                            if (found) {
                              setSellerShopName(found.shopName || found.storefront || "Seller Atelier");
                            }
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      >
                        <option value="admin">ALIKE-ND Official (Platform Flagship)</option>
                        {sellers.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.shopName || s.storefront} — {s.ownerName} ({s.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Fulfilment Method
                    </label>
                    <select
                      value={fulfilmentConfig.fulfilmentMethod}
                      onChange={(e) =>
                        setFulfilmentConfig((prev) => ({
                          ...prev,
                          fulfilmentMethod: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    >
                      <option value="platform_fulfilled">Fulfilled by ALIKE-ND Hub (Central Warehouse)</option>
                      <option value="seller_fulfilled">Seller Self-Fulfilled (Direct Dropship)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Dispatch Preparation Time (Hours)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={fulfilmentConfig.dispatchPrepHours}
                      onChange={(e) =>
                        setFulfilmentConfig((prev) => ({
                          ...prev,
                          dispatchPrepHours: Math.max(1, Number(e.target.value)),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pickup / Shipping Origin Address
                    </label>
                    <input
                      type="text"
                      value={fulfilmentConfig.pickupOriginAddress}
                      onChange={(e) =>
                        setFulfilmentConfig((prev) => ({
                          ...prev,
                          pickupOriginAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Return Destination Address
                    </label>
                    <input
                      type="text"
                      value={fulfilmentConfig.returnDestinationAddress}
                      onChange={(e) =>
                        setFulfilmentConfig((prev) => ({
                          ...prev,
                          returnDestinationAddress: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Visibility, Scheduled Publication & Moderation Status */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublished && !isHidden}
                        onChange={(e) => {
                          setIsPublished(e.target.checked);
                          setIsHidden(!e.target.checked);
                        }}
                        className="accent-emerald-600 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Visible on Public Storefront Upon Publish
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Schedule Publication (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledPublishAt}
                      onChange={(e) => setScheduledPublishAt(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Publishing / QC Status
                    </label>
                    <select
                      value={moderationStatus}
                      onChange={(e) => setModerationStatus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold"
                    >
                      <option value="approved">Approved & Live Immediately</option>
                      <option value="pending">Submit for Admin Quality Review</option>
                      <option value="archived">Archived / Offline</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: STICKY PRODUCT CONTENT SCORE (0-100) & CHECKLIST
           ===================================================================== */}
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="mkt-helper text-rose-600 font-semibold block">
                  Publishing Readiness
                </span>
                <h3 className="mkt-card-heading text-slate-900">Product Content Score</h3>
              </div>
              <div
                className={`px-3 py-1.5 rounded-xl mkt-price border ${
                  contentEvaluation.totalScore >= 80
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : contentEvaluation.totalScore >= 55
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-rose-50 border-rose-300 text-rose-700"
                }`}
              >
                {contentEvaluation.totalScore}
                <span className="text-xs font-normal opacity-75">/100</span>
              </div>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1">
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    contentEvaluation.totalScore >= 80
                      ? "bg-emerald-600"
                      : contentEvaluation.totalScore >= 55
                      ? "bg-amber-500"
                      : "bg-rose-600"
                  }`}
                  style={{ width: `${contentEvaluation.totalScore}%` }}
                />
              </div>
              <div className="flex justify-between mkt-helper text-slate-500">
                <span>
                  {contentEvaluation.totalScore >= 80
                    ? "Excellent — High Search Ranking"
                    : contentEvaluation.totalScore >= 55
                    ? "Good — Ready to Publish"
                    : "Needs Improvement"}
                </span>
                <span className="tabular-nums">
                  {contentEvaluation.items.filter((i) => i.passed).length}/
                  {contentEvaluation.items.length} passed
                </span>
              </div>
            </div>

            {/* Interactive Checklist Items */}
            <div className="divide-y divide-slate-100">
              {contentEvaluation.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.sectionId)}
                  className="w-full py-2.5 text-left flex items-start gap-2.5 hover:bg-slate-50 rounded-lg px-1.5 transition-colors cursor-pointer group"
                >
                  {item.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-800 group-hover:text-rose-600">
                      <span className="truncate">{item.label}</span>
                      <span className="mkt-helper text-slate-400 ml-1 shrink-0 tabular-nums">
                        +{item.earned}/{item.points}
                      </span>
                    </div>
                    <p className="mkt-helper text-slate-500 truncate">{item.hint}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Live Card Mini Summary */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="mkt-helper text-slate-500 font-semibold">
                Storefront Card Snapshot
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {images[0] || whiteBgImage ? (
                    <img
                      src={images[0] || whiteBgImage}
                      alt="Thumb"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {name || "Untitled Product"}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="mkt-price text-rose-600">
                      ₹{(Number(price) || 0).toLocaleString("en-IN")}
                    </span>
                    {mrp > price && (
                      <span className="mkt-helper text-slate-400 line-through tabular-nums">
                        ₹{mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="mkt-helper font-semibold text-emerald-700 tabular-nums">
                        -{discountPercent}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* =====================================================================
          SECTION J — STICKY BOTTOM ACTION BAR
         ===================================================================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 sm:px-6 py-3 shadow-lg">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSafeBack}
              className="mkt-btn px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 mkt-helper text-slate-500">
              Score: <strong className="text-slate-900 tabular-nums">{contentEvaluation.totalScore}/100</strong> •{" "}
              {hasUnsavedChanges ? "Unsaved edits active" : "All changes saved"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isSavingDraft || isPublishing}
              onClick={handleSaveDraft}
              className="mkt-btn px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>{isSavingDraft ? "Saving Draft..." : "Save as Draft"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="mkt-btn px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Preview Product</span>
            </button>

            <button
              type="button"
              disabled={isPublishing || isSavingDraft}
              onClick={handleSubmitForApproval}
              className="mkt-btn px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Submit for Approval</span>
            </button>

            <button
              type="button"
              disabled={isPublishing || isSavingDraft}
              onClick={handleTriggerPublish}
              className="mkt-btn px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isPublishing
                  ? "Publishing..."
                  : scheduledPublishAt
                  ? "Schedule & Publish"
                  : isEditMode
                  ? "Update & Publish Now"
                  : "Publish Now"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          CUSTOMER PREVIEW MODAL
         ===================================================================== */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="sticky top-0 z-10 bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">
                  Customer Storefront Live Preview (Private Admin Fields Hidden)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Gallery */}
              <div className="space-y-3">
                <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                  {images[0] || whiteBgImage ? (
                    <img
                      src={images[0] || whiteBgImage}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No Cover Image</span>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Product Info */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {badgesConfig.fastDelivery && (
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      ⚡ EXPRESS DELIVERY
                    </span>
                  )}
                  {(badgesConfig.flashSale || flashSaleConfig.enabled) && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-mono text-[10px] font-bold">
                      🔥 FLASH DEAL
                    </span>
                  )}
                  {badgesConfig.verifiedSeller && isAssignedSellerVerified && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                      ✓ VERIFIED SELLER
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-slate-500 font-bold">
                    {brand} • {activeCategoryNode.label}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                    {name || "Untitled Product"}
                  </h2>
                  {localizedName && (
                    <div className="text-xs text-slate-500 mt-0.5">{localizedName}</div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline gap-3">
                  <span className="text-2xl font-mono font-black text-rose-600">
                    ₹{(Number(price) || 0).toLocaleString("en-IN")}
                  </span>
                  {mrp > price && (
                    <>
                      <span className="text-sm font-mono text-slate-400 line-through">
                        ₹{mrp.toLocaleString("en-IN")}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>

                {/* Key Highlights */}
                {highlights.filter(Boolean).length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-800 uppercase">Key Highlights</div>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                      {highlights.filter(Boolean).map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Shipping & Warranty */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Sold By</span>
                    <strong className="text-slate-800">{sellerShopName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Warranty</span>
                    <strong className="text-slate-800">
                      {warrantyConfig.warrantyDuration} ({warrantyConfig.warrantyType})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Delivery</span>
                    <strong className="text-slate-800">
                      {shippingConfig.freeShipping
                        ? "FREE Delivery"
                        : `₹${shippingConfig.customShippingFee}`}{" "}
                      ({shippingConfig.estimatedDeliveryRange})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">In the Box</span>
                    <strong className="text-slate-800 truncate block">{whatsInTheBox}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          PUBLISH CONFIRMATION MODAL
         ===================================================================== */}
      {showPublishConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEditMode ? "Confirm Product Update" : "Confirm Product Publishing"}
                </h3>
                <p className="text-xs text-slate-500">
                  Content Score: <strong>{contentEvaluation.totalScore}/100</strong> •{" "}
                  {effectiveStock} units in stock
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Product Title:</span>
                <span className="font-bold text-slate-900 truncate max-w-[220px]">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">
                  {category} {subCategory ? `→ ${subCategory}` : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selling Price / MRP:</span>
                <span className="font-mono font-bold text-rose-600">
                  ₹{price.toLocaleString("en-IN")} (MRP ₹{mrp.toLocaleString("en-IN")})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Variants Configured:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {hasVariants ? `${variants.length} SKUs` : "Single Standard SKU"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Back to Edit
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={handleConfirmPublish}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? "Publishing Live..." : "Confirm & Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Unsaved Product Changes</h3>
                <p className="text-xs text-slate-500">
                  You have unsaved edits in the Product Studio. Would you like to save as a draft before leaving?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnsavedConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUnsavedConfirmModal(false);
                  onBack();
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 cursor-pointer"
              >
                Discard & Leave
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowUnsavedConfirmModal(false);
                  await handleSaveDraft();
                  onBack();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Save Draft & Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={lightboxImage}
            alt="Zoomed preview"
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default DarazAddProductStudio;
