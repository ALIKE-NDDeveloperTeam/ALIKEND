import mongoose, { Schema, Document } from "mongoose";

export type InstitutionCategory =
  | "Commercial Bank"
  | "Islamic Bank"
  | "State-Owned / Development Bank"
  | "Central Bank / Regulator"
  | "Regional / Cooperative Bank"
  | "Digital / Neobank"
  | "Mobile Financial Service (MFS)"
  | "Payment Service Provider";

export type RegulatoryVerificationStatus =
  | "Verified Licensed"
  | "Central Bank / Regulator — Non-Payout"
  | "Under Review"
  | "Unverified";

export interface IBankInstitution extends Document {
  institutionId: string;
  officialName: string;
  aliases: string[];
  country: string;
  countriesOfOperation: string[];
  region:
    | "Bangladesh"
    | "South Asia"
    | "Asia-Pacific"
    | "United Kingdom & Europe"
    | "North America"
    | "Middle East"
    | "Africa"
    | "Latin America & South America"
    | "Oceania"
    | "Global Multi-Region";
  category: InstitutionCategory;
  isTraditionalBank: boolean;
  officialWebsite: string;
  supportedCurrencies: string[];
  swiftBicCode?: string;
  routingCodeType?: string;
  verificationSource: string;
  verificationSourceUrl?: string;
  regulatoryStatus: RegulatoryVerificationStatus;
  verified: boolean;
  payoutEligible: boolean;
  payoutSupportedCountries: string[];
  supportedPayoutRails: string[];
  active: boolean;
  lastVerifiedDate: string;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BankInstitutionSchema = new Schema<IBankInstitution>(
  {
    institutionId: { type: String, required: true, unique: true, index: true },
    officialName: { type: String, required: true, index: true },
    aliases: { type: [String], default: [] },
    country: { type: String, required: true, index: true },
    countriesOfOperation: { type: [String], default: [] },
    region: {
      type: String,
      enum: [
        "Bangladesh",
        "South Asia",
        "Asia-Pacific",
        "United Kingdom & Europe",
        "North America",
        "Middle East",
        "Africa",
        "Latin America & South America",
        "Oceania",
        "Global Multi-Region",
      ],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "Commercial Bank",
        "Islamic Bank",
        "State-Owned / Development Bank",
        "Central Bank / Regulator",
        "Regional / Cooperative Bank",
        "Digital / Neobank",
        "Mobile Financial Service (MFS)",
        "Payment Service Provider",
      ],
      required: true,
      index: true,
    },
    isTraditionalBank: { type: Boolean, default: true },
    officialWebsite: { type: String, default: "" },
    supportedCurrencies: { type: [String], default: [] },
    swiftBicCode: { type: String, default: "" },
    routingCodeType: { type: String, default: "SWIFT / Routing / IFSC" },
    verificationSource: { type: String, required: true },
    verificationSourceUrl: { type: String, default: "" },
    regulatoryStatus: {
      type: String,
      enum: [
        "Verified Licensed",
        "Central Bank / Regulator — Non-Payout",
        "Under Review",
        "Unverified",
      ],
      default: "Verified Licensed",
    },
    verified: { type: Boolean, default: true, index: true },
    payoutEligible: { type: Boolean, default: false, index: true },
    payoutSupportedCountries: { type: [String], default: [] },
    supportedPayoutRails: { type: [String], default: [] },
    active: { type: Boolean, default: true, index: true },
    lastVerifiedDate: { type: String, default: "2025-02-15" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const BankInstitution =
  mongoose.models.BankInstitution ||
  mongoose.model<IBankInstitution>("BankInstitution", BankInstitutionSchema);

export default BankInstitution;
