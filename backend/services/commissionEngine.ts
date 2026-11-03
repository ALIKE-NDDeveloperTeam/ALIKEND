import mongoose from "mongoose";
import Order from "../models/Order";
import Product from "../models/Product";
import Seller from "../models/Seller";
import PlatformSetting from "../models/PlatformSetting";
import {
  CommissionRule,
  CommissionAuditLog,
  CommissionRuleType,
} from "../models/CommissionManagement";
import { isMongoConnected, memoryStore } from "../store";

export interface CommissionCalculationConfig {
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
  updatedBy: string;
  updatedAt: string;
}

export interface CommissionRuleRecord {
  ruleId: string;
  ruleType: CommissionRuleType;
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

export interface ItemCommissionSnapshot {
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
}

// Initial platform category & subcategory commission structure matching existing store categories
const INITIAL_CATEGORY_COMMISSION_SEED: Array<{
  categoryId: string;
  categoryName: string;
  categoryNameBn: string;
  commissionRate: number;
  subCategories: Array<{ id: string; name: string; rate: number }>;
}> = [
  {
    categoryId: "electronics",
    categoryName: "Electronics & Gadgets",
    categoryNameBn: "ইলেকট্রনিক্স",
    commissionRate: 8,
    subCategories: [
      { id: "smartphones", name: "Smartphones & Tablets", rate: 6.5 },
      { id: "laptops_computing", name: "Laptops & Computing", rate: 6 },
      { id: "audio_headphones", name: "Audio & Headphones", rate: 9 },
      { id: "smart_wearables", name: "Smartwatches & Wearables", rate: 8.5 },
      { id: "cameras_optics", name: "Cameras & Optics", rate: 7.5 },
      { id: "television_video", name: "Televisions & Home Cinema", rate: 7 },
    ],
  },
  {
    categoryId: "mobiles",
    categoryName: "Mobiles & Accessories",
    categoryNameBn: "মোবাইল ফোন",
    commissionRate: 6.5,
    subCategories: [
      { id: "flagship_phones", name: "Flagship 5G Smartphones", rate: 5.5 },
      { id: "feature_phones", name: "Feature & Budget Phones", rate: 6 },
      { id: "mobile_cases_chargers", name: "Cases, Chargers & Cables", rate: 11 },
      { id: "power_banks", name: "Power Banks & Adapters", rate: 9.5 },
    ],
  },
  {
    categoryId: "laptops",
    categoryName: "Computers & Laptops",
    categoryNameBn: "ল্যাপটপ ও পিসি",
    commissionRate: 6,
    subCategories: [
      { id: "ultrabooks", name: "Ultrabooks & Business Laptops", rate: 5.5 },
      { id: "gaming_laptops", name: "Gaming Laptops & Workstations", rate: 6 },
      { id: "monitors_peripherals", name: "Monitors, Keyboards & Mice", rate: 8 },
      { id: "storage_components", name: "SSD, RAM & PC Components", rate: 7 },
    ],
  },
  {
    categoryId: "fashion",
    categoryName: "Fashion & Apparel",
    categoryNameBn: "ফ্যাশন কালেকশন",
    commissionRate: 12,
    subCategories: [
      { id: "mens_wear", name: "Men's Clothing", rate: 11 },
      { id: "womens_wear", name: "Women's Clothing", rate: 12.5 },
      { id: "footwear", name: "Luxury Footwear & Shoes", rate: 11.5 },
      { id: "watches_accessories", name: "Bags, Belts & Accessories", rate: 13 },
      { id: "ethnic_bridal", name: "Ethnic & Festive Wear", rate: 12 },
    ],
  },
  {
    categoryId: "jewellery",
    categoryName: "Jewellery & Watches",
    categoryNameBn: "অলংকার ও ঘড়ি",
    commissionRate: 10,
    subCategories: [
      { id: "fine_jewellery", name: "Gold, Diamond & Fine Jewellery", rate: 8 },
      { id: "luxury_watches", name: "Chronograph & Luxury Watches", rate: 9.5 },
      { id: "fashion_jewellery", name: "Silver & Artisan Jewellery", rate: 11 },
    ],
  },
  {
    categoryId: "beauty",
    categoryName: "Cosmetics & Beauty",
    categoryNameBn: "প্রসাধন ও রূপচর্চা",
    commissionRate: 11,
    subCategories: [
      { id: "face_makeup", name: "Foundation, Blush & Face Makeup", rate: 11 },
      { id: "lip_eye_makeup", name: "Lipstick, Mascara & Eye Makeup", rate: 11.5 },
      { id: "skincare_serums", name: "Skincare, Serums & Sunscreen", rate: 10.5 },
      { id: "hair_care", name: "Shampoo, Hair Oil & Styling", rate: 10 },
      { id: "beauty_tools", name: "Makeup Brushes & Beauty Tools", rate: 12 },
    ],
  },
  {
    categoryId: "perfumes",
    categoryName: "Perfumes & Fragrances",
    categoryNameBn: "সুগন্ধি ও পারফিউম",
    commissionRate: 11.5,
    subCategories: [
      { id: "mens_perfume", name: "Men's EDP & EDT Perfumes", rate: 11 },
      { id: "womens_perfume", name: "Women's Luxury Fragrances", rate: 11.5 },
      { id: "attar_oud", name: "Pure Attar, Oud & Bakhoor", rate: 10.5 },
      { id: "perfume_gift_sets", name: "Perfume Gift Sets & Combos", rate: 12 },
    ],
  },
  {
    categoryId: "grocery",
    categoryName: "Grocery & Kirana",
    categoryNameBn: "মুদি ও রসদ",
    commissionRate: 4.5,
    subCategories: [
      { id: "staples_rice_oil", name: "Rice, Dal, Atta & Cooking Oil", rate: 3.5 },
      { id: "spices_packaged", name: "Spices, Tea, Coffee & Snacks", rate: 5 },
      { id: "dairy_bakery", name: "Dairy, Milk, Eggs & Bakery", rate: 4 },
      { id: "fruits_vegetables", name: "Fresh Fruits & Vegetables", rate: 4 },
      { id: "household_cleaning", name: "Household & Laundry Care", rate: 5.5 },
    ],
  },
  {
    categoryId: "personal_care",
    categoryName: "Personal Care & Grooming",
    categoryNameBn: "ব্যক্তিগত যত্ন ও গ্রুমিং",
    commissionRate: 8.5,
    subCategories: [
      { id: "oral_bath_care", name: "Bathing Soaps & Oral Care", rate: 8 },
      { id: "mens_grooming", name: "Trimmers, Shaving & Beard Care", rate: 9 },
      { id: "hygiene_wellness", name: "Sanitizers & Personal Hygiene", rate: 7.5 },
    ],
  },
  {
    categoryId: "furniture",
    categoryName: "Home, Furniture & Decor",
    categoryNameBn: "আসবাবপত্র ও সজ্জা",
    commissionRate: 10,
    subCategories: [
      { id: "living_room_furniture", name: "Sofas, Tables & Living Room", rate: 9.5 },
      { id: "bedroom_mattress", name: "Beds, Wardrobes & Mattresses", rate: 9 },
      { id: "home_lighting_decor", name: "Lighting, Rugs & Home Decor", rate: 11 },
      { id: "kitchen_dining", name: "Kitchen Appliances & Cookware", rate: 9.5 },
    ],
  },
  {
    categoryId: "gaming",
    categoryName: "Gaming & Consoles",
    categoryNameBn: "গেমিং গিয়ার",
    commissionRate: 7.5,
    subCategories: [
      { id: "gaming_consoles", name: "PlayStation, Xbox & Consoles", rate: 6 },
      { id: "gaming_accessories", name: "Controllers, Headsets & Chairs", rate: 8.5 },
    ],
  },
  {
    categoryId: "hardware",
    categoryName: "Hardware & Power Tools",
    categoryNameBn: "হার্ডওয়্যার ও যন্ত্রাংশ",
    commissionRate: 8,
    subCategories: [
      { id: "power_hand_tools", name: "Drills, Kits & Power Tools", rate: 8 },
      { id: "electrical_fixtures", name: "Electricals & Smart Locks", rate: 8.5 },
    ],
  },
  {
    categoryId: "food_delivery",
    categoryName: "Food Delivery & Cloud Kitchen",
    categoryNameBn: "খাবার ডেলিভারি",
    commissionRate: 14,
    subCategories: [
      { id: "restaurants_biryani", name: "Restaurants, Biryani & Meals", rate: 14 },
      { id: "fast_food_snacks", name: "Pizza, Burger & Fast Food", rate: 15 },
      { id: "bakery_sweets", name: "Bakery, Cakes & Traditional Sweets", rate: 12 },
    ],
  },
  {
    categoryId: "wholesale",
    categoryName: "Wholesale & Bulk B2B",
    categoryNameBn: "পাইকারি বাজার",
    commissionRate: 3.5,
    subCategories: [
      { id: "wholesale_ cartons", name: "Bulk Carton Lots", rate: 3 },
      { id: "b2b_trade_supplies", name: "Merchant Trade Supplies", rate: 4 },
    ],
  },
  {
    categoryId: "luxury",
    categoryName: "Luxury & Designer Edition",
    categoryNameBn: "বিলাসবহুল পণ্য",
    commissionRate: 9,
    subCategories: [
      { id: "designer_collectibles", name: "Designer Collectibles & Limited Edition", rate: 9 },
      { id: "vip_selection", name: "VIP Curated Selection", rate: 8.5 },
    ],
  },
];

// In-memory fallback stores
let inMemoryCommissionRules: CommissionRuleRecord[] = [];
let inMemoryCommissionAuditLogs: Array<{
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
}> = [];

let inMemoryCommissionConfig: CommissionCalculationConfig = {
  globalDefaultRate: 5,
  minCommissionPercent: 0,
  maxCommissionPercent: 50,
  sellerOverridePrecedence: "before_category",
  priorityOrder: [
    "product_override",
    "seller_override",
    "subcategory",
    "category",
    "global_default",
  ],
  calculationBasis: {
    deductDiscountBeforeCommission: true,
    includeShipping: false,
    includeTax: false,
  },
  updatedBy: "Super Admin",
  updatedAt: new Date().toISOString(),
};

function buildDefaultRulesSeed(): CommissionRuleRecord[] {
  const nowIso = new Date().toISOString();
  const seeded: CommissionRuleRecord[] = [];

  for (const cat of INITIAL_CATEGORY_COMMISSION_SEED) {
    seeded.push({
      ruleId: `cat_${cat.categoryId}`,
      ruleType: "category",
      level: 1,
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      categoryNameBn: cat.categoryNameBn,
      parentCategoryId: null,
      parentCategoryName: null,
      targetId: null,
      targetName: null,
      commissionRate: cat.commissionRate,
      minCommissionAmount: 0,
      maxCommissionAmount: 0,
      effectiveStartDate: "",
      effectiveEndDate: "",
      isActive: true,
      updatedBy: "System Default",
      notes: `Standard category commission for ${cat.categoryName}`,
      updatedAt: nowIso,
      createdAt: nowIso,
    });

    for (const sub of cat.subCategories) {
      seeded.push({
        ruleId: `sub_${cat.categoryId}_${sub.id}`,
        ruleType: "subcategory",
        level: 2,
        categoryId: sub.id,
        categoryName: sub.name,
        categoryNameBn: "",
        parentCategoryId: cat.categoryId,
        parentCategoryName: cat.categoryName,
        targetId: null,
        targetName: null,
        commissionRate: sub.rate,
        minCommissionAmount: 0,
        maxCommissionAmount: 0,
        effectiveStartDate: "",
        effectiveEndDate: "",
        isActive: true,
        updatedBy: "System Default",
        notes: `Subcategory commission under ${cat.categoryName}`,
        updatedAt: nowIso,
        createdAt: nowIso,
      });
    }
  }

  return seeded;
}

export async function ensureCommissionRulesSeeded(): Promise<CommissionRuleRecord[]> {
  if (inMemoryCommissionRules.length === 0) {
    inMemoryCommissionRules = buildDefaultRulesSeed();
  }

  if (isMongoConnected()) {
    try {
      const count = await CommissionRule.countDocuments();
      if (count === 0) {
        await CommissionRule.insertMany(inMemoryCommissionRules, { ordered: false }).catch(
          () => {}
        );
      }
      const docs = await CommissionRule.find().sort({ level: 1, categoryName: 1 }).lean();
      if (docs && docs.length > 0) {
        inMemoryCommissionRules = docs.map((d: any) => ({
          ruleId: d.ruleId,
          ruleType: d.ruleType,
          level: d.level || (d.ruleType === "category" ? 1 : d.ruleType === "subcategory" ? 2 : 3),
          categoryId: d.categoryId,
          categoryName: d.categoryName,
          categoryNameBn: d.categoryNameBn || "",
          parentCategoryId: d.parentCategoryId || null,
          parentCategoryName: d.parentCategoryName || null,
          targetId: d.targetId || null,
          targetName: d.targetName || null,
          commissionRate: Number(d.commissionRate) || 0,
          minCommissionAmount: Number(d.minCommissionAmount) || 0,
          maxCommissionAmount: Number(d.maxCommissionAmount) || 0,
          effectiveStartDate: d.effectiveStartDate || "",
          effectiveEndDate: d.effectiveEndDate || "",
          isActive: d.isActive !== false,
          updatedBy: d.updatedBy || "Super Admin",
          notes: d.notes || "",
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("CommissionRule MongoDB seed/read notice:", err);
    }
  }

  return inMemoryCommissionRules;
}

export async function getCommissionConfig(): Promise<CommissionCalculationConfig> {
  if (isMongoConnected()) {
    try {
      const setting: any = await PlatformSetting.findOne({ key: "commission_settings" }).lean();
      if (setting) {
        if (typeof setting.commissionRate === "number") {
          inMemoryCommissionConfig.globalDefaultRate = setting.commissionRate;
        }
        if (setting.commissionConfig && typeof setting.commissionConfig === "object") {
          inMemoryCommissionConfig = {
            ...inMemoryCommissionConfig,
            ...setting.commissionConfig,
            globalDefaultRate:
              typeof setting.commissionRate === "number"
                ? setting.commissionRate
                : inMemoryCommissionConfig.globalDefaultRate,
          };
        }
      }
    } catch (err) {
      console.warn("getCommissionConfig MongoDB notice:", err);
    }
  } else if (memoryStore.platformSettings?.commissionRate !== undefined) {
    inMemoryCommissionConfig.globalDefaultRate = memoryStore.platformSettings.commissionRate;
  }

  return inMemoryCommissionConfig;
}

export async function updateCommissionConfig(
  updates: Partial<CommissionCalculationConfig>,
  adminInfo: { name: string; email: string },
  reason = "Updated platform commission configuration"
): Promise<CommissionCalculationConfig> {
  const current = await getCommissionConfig();
  const prevGlobalRate = current.globalDefaultRate;

  const nextGlobalRate =
    updates.globalDefaultRate !== undefined
      ? Math.max(0, Math.min(100, Math.round(Number(updates.globalDefaultRate) * 100) / 100))
      : current.globalDefaultRate;

  const sellerPrecedence =
    updates.sellerOverridePrecedence || current.sellerOverridePrecedence || "before_category";

  const priorityOrder =
    Array.isArray(updates.priorityOrder) && updates.priorityOrder.length > 0
      ? updates.priorityOrder
      : sellerPrecedence === "after_category"
      ? ["product_override", "subcategory", "category", "seller_override", "global_default"]
      : ["product_override", "seller_override", "subcategory", "category", "global_default"];

  const nextConfig: CommissionCalculationConfig = {
    globalDefaultRate: nextGlobalRate,
    minCommissionPercent:
      updates.minCommissionPercent !== undefined
        ? Math.max(0, Math.min(100, Number(updates.minCommissionPercent)))
        : current.minCommissionPercent,
    maxCommissionPercent:
      updates.maxCommissionPercent !== undefined
        ? Math.max(0, Math.min(100, Number(updates.maxCommissionPercent)))
        : current.maxCommissionPercent,
    sellerOverridePrecedence: sellerPrecedence,
    priorityOrder,
    calculationBasis: {
      deductDiscountBeforeCommission:
        updates.calculationBasis?.deductDiscountBeforeCommission ??
        current.calculationBasis.deductDiscountBeforeCommission,
      includeShipping:
        updates.calculationBasis?.includeShipping ?? current.calculationBasis.includeShipping,
      includeTax: updates.calculationBasis?.includeTax ?? current.calculationBasis.includeTax,
    },
    updatedBy: adminInfo.name || adminInfo.email || "Super Admin",
    updatedAt: new Date().toISOString(),
  };

  inMemoryCommissionConfig = nextConfig;
  if (memoryStore.platformSettings) {
    memoryStore.platformSettings.commissionRate = nextGlobalRate;
    memoryStore.platformSettings.updatedAt = new Date();
  }

  if (isMongoConnected()) {
    try {
      await PlatformSetting.findOneAndUpdate(
        { key: "commission_settings" },
        {
          $set: {
            commissionRate: nextGlobalRate,
            updatedBy: adminInfo.email || "superadmin",
            updatedAt: new Date(),
            commissionConfig: nextConfig,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.warn("updateCommissionConfig MongoDB notice:", err);
    }
  }

  await recordCommissionAudit({
    actionType: "config_updated",
    targetType: "global",
    targetId: "global_default",
    targetName: "Global Default Commission & Priority Settings",
    previousRate: prevGlobalRate,
    newRate: nextGlobalRate,
    reason,
    adminName: adminInfo.name || "Super Admin",
    adminEmail: adminInfo.email || "superadmin@alikend.com",
  });

  return nextConfig;
}

export async function recordCommissionAudit(entry: {
  actionType:
    | "rule_created"
    | "rate_updated"
    | "status_toggled"
    | "rule_deleted"
    | "config_updated"
    | "commission_reversed"
    | "commission_refunded";
  targetType: "global" | "category" | "subcategory" | "product" | "seller" | "order";
  targetId: string;
  targetName: string;
  previousRate: number | null;
  newRate: number | null;
  reason: string;
  adminName: string;
  adminEmail: string;
}): Promise<void> {
  const auditId = `caudit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nowIso = new Date().toISOString();

  const record = {
    auditId,
    ...entry,
    createdAt: nowIso,
  };

  inMemoryCommissionAuditLogs.unshift(record);

  if (isMongoConnected()) {
    try {
      await CommissionAuditLog.create({
        auditId,
        ...entry,
      });
    } catch (err) {
      console.warn("CommissionAuditLog MongoDB write notice:", err);
    }
  }
}

export async function getCommissionAuditLogs(limit = 200) {
  if (isMongoConnected()) {
    try {
      const docs = await CommissionAuditLog.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          auditId: d.auditId,
          actionType: d.actionType,
          targetType: d.targetType,
          targetId: d.targetId,
          targetName: d.targetName,
          previousRate: d.previousRate ?? null,
          newRate: d.newRate ?? null,
          reason: d.reason || "",
          adminName: d.adminName || "Super Admin",
          adminEmail: d.adminEmail || "",
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn("getCommissionAuditLogs MongoDB notice:", err);
    }
  }
  return inMemoryCommissionAuditLogs.slice(0, limit);
}

// Helper to check if a rule is currently active and within its effective date window
function isRuleCurrentlyEffective(rule: CommissionRuleRecord): boolean {
  if (!rule || !rule.isActive) return false;
  const now = new Date();
  if (rule.effectiveStartDate && rule.effectiveStartDate.trim()) {
    const start = new Date(rule.effectiveStartDate);
    if (!isNaN(start.getTime()) && now < start) return false;
  }
  if (rule.effectiveEndDate && rule.effectiveEndDate.trim()) {
    const end = new Date(rule.effectiveEndDate);
    // Include entire end date day
    end.setHours(23, 59, 59, 999);
    if (!isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

function normalizeSlug(val?: string | null): string {
  return String(val || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Resolves the single highest-priority applicable commission rule for a product sale.
 * Priority Order (configurable):
 * 1. Product-specific override
 * 2. Seller-specific override (if configured before category rules)
 * 3. Subcategory commission
 * 4. Parent category commission
 * 5. Global default commission
 *
 * Guarantees that multiple commission rules are NEVER stacked on the same item.
 */
export function resolveApplicableCommissionRule(params: {
  productId?: string | number | null;
  sellerId?: string | null;
  category?: string | null;
  subCategory?: string | null;
  sellerCustomRate?: number | null;
  rules: CommissionRuleRecord[];
  config: CommissionCalculationConfig;
}): {
  rate: number;
  ruleType: string;
  ruleId: string;
  ruleLabel: string;
  minCommissionAmount: number;
  maxCommissionAmount: number;
} {
  const { productId, sellerId, category, subCategory, sellerCustomRate, rules, config } = params;
  const effectiveRules = rules.filter(isRuleCurrentlyEffective);

  const prodIdStr = productId !== undefined && productId !== null ? String(productId) : "";
  const sellerIdStr = sellerId ? String(sellerId) : "";
  const catSlug = normalizeSlug(category);
  const subSlug = normalizeSlug(subCategory);

  const clampRate = (r: number) => {
    const minP = typeof config.minCommissionPercent === "number" ? config.minCommissionPercent : 0;
    const maxP = typeof config.maxCommissionPercent === "number" ? config.maxCommissionPercent : 100;
    return Math.max(minP, Math.min(maxP, Math.round(r * 100) / 100));
  };

  for (const step of config.priorityOrder) {
    if (step === "product_override" && prodIdStr) {
      const prodRule = effectiveRules.find(
        (r) =>
          r.ruleType === "product_override" &&
          (String(r.targetId) === prodIdStr || normalizeSlug(r.categoryId) === normalizeSlug(prodIdStr))
      );
      if (prodRule) {
        return {
          rate: clampRate(prodRule.commissionRate),
          ruleType: "product_override",
          ruleId: prodRule.ruleId,
          ruleLabel: `Product Override (${prodRule.targetName || prodRule.categoryName})`,
          minCommissionAmount: prodRule.minCommissionAmount || 0,
          maxCommissionAmount: prodRule.maxCommissionAmount || 0,
        };
      }
    }

    if (step === "seller_override" && sellerIdStr) {
      const sellerRule = effectiveRules.find(
        (r) =>
          r.ruleType === "seller_override" &&
          (String(r.targetId) === sellerIdStr ||
            normalizeSlug(r.categoryId) === normalizeSlug(sellerIdStr))
      );
      if (sellerRule) {
        return {
          rate: clampRate(sellerRule.commissionRate),
          ruleType: "seller_override",
          ruleId: sellerRule.ruleId,
          ruleLabel: `Seller Override (${sellerRule.targetName || sellerRule.categoryName})`,
          minCommissionAmount: sellerRule.minCommissionAmount || 0,
          maxCommissionAmount: sellerRule.maxCommissionAmount || 0,
        };
      }
      if (typeof sellerCustomRate === "number" && sellerCustomRate >= 0 && sellerCustomRate <= 100) {
        return {
          rate: clampRate(sellerCustomRate),
          ruleType: "seller_override",
          ruleId: `seller_profile_${sellerIdStr}`,
          ruleLabel: "Seller Account Commission Tier",
          minCommissionAmount: 0,
          maxCommissionAmount: 0,
        };
      }
    }

    if (step === "subcategory" && subSlug) {
      const subRule = effectiveRules.find(
        (r) =>
          r.ruleType === "subcategory" &&
          (normalizeSlug(r.categoryId) === subSlug ||
            normalizeSlug(r.categoryName) === subSlug ||
            normalizeSlug(r.categoryName).includes(subSlug) ||
            subSlug.includes(normalizeSlug(r.categoryId)))
      );
      if (subRule) {
        return {
          rate: clampRate(subRule.commissionRate),
          ruleType: "subcategory",
          ruleId: subRule.ruleId,
          ruleLabel: `Subcategory: ${subRule.categoryName}`,
          minCommissionAmount: subRule.minCommissionAmount || 0,
          maxCommissionAmount: subRule.maxCommissionAmount || 0,
        };
      }
    }

    if (step === "category" && catSlug) {
      const catRule = effectiveRules.find(
        (r) =>
          r.ruleType === "category" &&
          (normalizeSlug(r.categoryId) === catSlug ||
            normalizeSlug(r.categoryName) === catSlug ||
            normalizeSlug(r.categoryName).startsWith(catSlug) ||
            catSlug.startsWith(normalizeSlug(r.categoryId)))
      );
      if (catRule) {
        return {
          rate: clampRate(catRule.commissionRate),
          ruleType: "category",
          ruleId: catRule.ruleId,
          ruleLabel: `Category: ${catRule.categoryName}`,
          minCommissionAmount: catRule.minCommissionAmount || 0,
          maxCommissionAmount: catRule.maxCommissionAmount || 0,
        };
      }
    }

    if (step === "global_default") {
      return {
        rate: clampRate(config.globalDefaultRate),
        ruleType: "global_default",
        ruleId: "global_default",
        ruleLabel: "Global Default Commission",
        minCommissionAmount: 0,
        maxCommissionAmount: 0,
      };
    }
  }

  return {
    rate: clampRate(config.globalDefaultRate),
    ruleType: "global_default",
    ruleId: "global_default",
    ruleLabel: "Global Default Commission",
    minCommissionAmount: 0,
    maxCommissionAmount: 0,
  };
}

/**
 * Calculates the complete, immutable commission snapshot for an order at checkout or reconciliation.
 */
export async function calculateOrderCommissionSnapshot(params: {
  items: Array<{
    productId?: any;
    name: string;
    qty: number;
    price: number;
    sellerId?: string;
    category?: string;
    subCategory?: string;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  delivery: number;
  productLookupMap?: Map<string, any>;
  sellerLookupMap?: Map<string, any>;
}): Promise<{
  effectiveAverageRate: number;
  totalEligibleAmount: number;
  totalCommissionAmount: number;
  totalSellerPayout: number;
  breakdown: ItemCommissionSnapshot[];
}> {
  const [rules, config] = await Promise.all([
    ensureCommissionRulesSeeded(),
    getCommissionConfig(),
  ]);

  const {
    items,
    subtotal,
    discount = 0,
    tax = 0,
    delivery = 0,
    productLookupMap,
    sellerLookupMap,
  } = params;

  const safeSubtotal = Math.max(
    1,
    subtotal || items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 1), 0)
  );

  let totalEligibleAmount = 0;
  let totalCommissionAmount = 0;
  let totalSellerPayout = 0;
  const breakdown: ItemCommissionSnapshot[] = [];

  for (const it of items) {
    const prodDoc =
      productLookupMap?.get(String(it.productId)) ||
      (memoryStore.products || []).find(
        (p) => String(p._id) === String(it.productId) || String(p.id) === String(it.productId)
      );

    const resolvedSellerId = String(it.sellerId || prodDoc?.sellerId || "platform");
    const sellerDoc =
      sellerLookupMap?.get(resolvedSellerId) ||
      (memoryStore.sellers || []).find((s) => String(s._id) === resolvedSellerId);

    const category = String(it.category || prodDoc?.category || "general");
    const subCategory = String(it.subCategory || prodDoc?.subCategory || "");
    const sellingPrice = Number(it.price) || 0;
    const qty = Math.max(1, Number(it.qty) || 1);
    const grossItemAmount = sellingPrice * qty;

    const itemShareRatio = grossItemAmount / safeSubtotal;
    const discountShare = Math.round(discount * itemShareRatio);
    const taxShare = Math.round(tax * itemShareRatio);
    const shippingShare = Math.round(delivery * itemShareRatio);

    let eligibleAmount = grossItemAmount;
    if (config.calculationBasis.deductDiscountBeforeCommission) {
      eligibleAmount = Math.max(0, eligibleAmount - discountShare);
    }
    if (config.calculationBasis.includeTax) {
      eligibleAmount += taxShare;
    }
    if (config.calculationBasis.includeShipping) {
      eligibleAmount += shippingShare;
    }

    const matchedRule = resolveApplicableCommissionRule({
      productId: it.productId,
      sellerId: resolvedSellerId,
      category,
      subCategory,
      sellerCustomRate:
        typeof (sellerDoc as any)?.commissionRate === "number"
          ? (sellerDoc as any).commissionRate
          : null,
      rules,
      config,
    });

    let itemCommission = Math.round((eligibleAmount * matchedRule.rate) / 100);
    if (matchedRule.minCommissionAmount > 0 && eligibleAmount > 0) {
      itemCommission = Math.max(matchedRule.minCommissionAmount, itemCommission);
    }
    if (matchedRule.maxCommissionAmount > 0) {
      itemCommission = Math.min(matchedRule.maxCommissionAmount, itemCommission);
    }
    itemCommission = Math.min(eligibleAmount, Math.max(0, itemCommission));

    const sellerNetAmount = Math.max(0, grossItemAmount - discountShare - itemCommission);

    totalEligibleAmount += eligibleAmount;
    totalCommissionAmount += itemCommission;
    totalSellerPayout += sellerNetAmount;

    breakdown.push({
      productId: it.productId,
      productName: it.name || prodDoc?.name || "Product",
      category,
      subCategory,
      sellerId: resolvedSellerId,
      sellerShopName:
        sellerDoc?.shopName ||
        sellerDoc?.storefront ||
        prodDoc?.sellerShopName ||
        "Marketplace Store",
      qty,
      sellingPrice,
      grossItemAmount,
      discountShare,
      eligibleAmount,
      commissionRate: matchedRule.rate,
      appliedRuleType: matchedRule.ruleType,
      appliedRuleId: matchedRule.ruleId,
      appliedRuleLabel: matchedRule.ruleLabel,
      commissionAmount: itemCommission,
      sellerNetAmount,
    });
  }

  const effectiveAverageRate =
    totalEligibleAmount > 0
      ? Math.round((totalCommissionAmount / totalEligibleAmount) * 10000) / 100
      : config.globalDefaultRate;

  return {
    effectiveAverageRate,
    totalEligibleAmount,
    totalCommissionAmount,
    totalSellerPayout,
    breakdown,
  };
}

/**
 * Reconciles platform commission and seller wallet when an order is cancelled, rejected, returned, or refunded.
 * Prevents duplicate commission reversals.
 */
export async function reconcileOrderCommissionOnStatusChange(params: {
  order: any;
  newStatus: "cancelled" | "rejected" | "returned" | "partially_refunded" | "refunded" | "delivered";
  refundAmount?: number;
  adminOrActorName?: string;
  adminOrActorEmail?: string;
  reason?: string;
}): Promise<{
  commissionStatus:
    | "credited"
    | "pending"
    | "settled"
    | "reversed"
    | "refunded"
    | "partially_refunded";
  reversedCommissionAmount: number;
}> {
  const {
    order,
    newStatus,
    refundAmount,
    adminOrActorName = "System Reconciliation",
    adminOrActorEmail = "system@alikend.com",
    reason = "Order status transition",
  } = params;

  if (!order) {
    return { commissionStatus: "pending", reversedCommissionAmount: 0 };
  }

  const originalCommission = Number(order.commissionAmount) || 0;
  const orderTotal = Math.max(1, Number(order.total) || 1);
  const alreadyRefundedComm = Number(order.refundedCommissionAmount) || 0;

  if (newStatus === "delivered") {
    order.commissionStatus = "settled";
    return { commissionStatus: "settled", reversedCommissionAmount: 0 };
  }

  // Prevent duplicate full reversal
  if (order.commissionReversed && (newStatus === "cancelled" || newStatus === "rejected" || newStatus === "refunded")) {
    return {
      commissionStatus: order.commissionStatus || "reversed",
      reversedCommissionAmount: 0,
    };
  }

  let reversalToApply = 0;
  let nextCommissionStatus:
    | "reversed"
    | "refunded"
    | "partially_refunded" = "reversed";

  if (newStatus === "cancelled" || newStatus === "rejected") {
    reversalToApply = Math.max(0, originalCommission - alreadyRefundedComm);
    nextCommissionStatus = "reversed";
    order.commissionReversed = true;
  } else if (newStatus === "partially_refunded" && typeof refundAmount === "number" && refundAmount > 0) {
    const ratio = Math.min(1, refundAmount / orderTotal);
    const targetRefundedCommission = Math.round(originalCommission * ratio);
    reversalToApply = Math.max(0, targetRefundedCommission - alreadyRefundedComm);
    nextCommissionStatus = ratio >= 0.99 ? "refunded" : "partially_refunded";
    if (ratio >= 0.99) order.commissionReversed = true;
  } else {
    reversalToApply = Math.max(0, originalCommission - alreadyRefundedComm);
    nextCommissionStatus = "refunded";
    order.commissionReversed = true;
  }

  const nextRefundedCommissionTotal = alreadyRefundedComm + reversalToApply;
  order.refundedCommissionAmount = nextRefundedCommissionTotal;
  order.commissionStatus = nextCommissionStatus;

  if (reversalToApply > 0) {
    // Deduct reversed commission from platform wallet balance
    if (memoryStore.platformSettings) {
      memoryStore.platformSettings.platformBalance = Math.max(
        0,
        (memoryStore.platformSettings.platformBalance || 0) - reversalToApply
      );
      memoryStore.platformSettings.totalCommissionEarned = Math.max(
        0,
        (memoryStore.platformSettings.totalCommissionEarned || 0) - reversalToApply
      );
    }

    if (isMongoConnected()) {
      try {
        await PlatformSetting.findOneAndUpdate(
          { key: "commission_settings" },
          {
            $inc: {
              platformBalance: -reversalToApply,
              totalCommissionEarned: -reversalToApply,
            },
          }
        );
      } catch (err) {
        console.warn("PlatformSetting commission reversal notice:", err);
      }
    }

    // Persist on Order in MongoDB & memoryStore
    if (isMongoConnected() && order._id && mongoose.isValidObjectId(order._id)) {
      try {
        await Order.findByIdAndUpdate(order._id, {
          $set: {
            commissionStatus: nextCommissionStatus,
            refundedCommissionAmount: nextRefundedCommissionTotal,
            commissionReversed: Boolean(order.commissionReversed),
          },
        });
      } catch (err) {
        console.warn("Order commission reversal update notice:", err);
      }
    }

    const memOrder = (memoryStore.orders || []).find(
      (o) => String(o._id) === String(order._id) || o.orderNumber === order.orderNumber
    );
    if (memOrder) {
      (memOrder as any).commissionStatus = nextCommissionStatus;
      (memOrder as any).refundedCommissionAmount = nextRefundedCommissionTotal;
      (memOrder as any).commissionReversed = Boolean(order.commissionReversed);
    }

    await recordCommissionAudit({
      actionType: nextCommissionStatus === "reversed" ? "commission_reversed" : "commission_refunded",
      targetType: "order",
      targetId: String(order.orderNumber || order._id),
      targetName: `Order ${order.orderNumber || order._id}`,
      previousRate: order.commissionRate ?? null,
      newRate: 0,
      reason: `${reason} — Reversed ৳${reversalToApply} commission (${nextCommissionStatus})`,
      adminName: adminOrActorName,
      adminEmail: adminOrActorEmail,
    });
  }

  return {
    commissionStatus: nextCommissionStatus,
    reversedCommissionAmount: reversalToApply,
  };
}
