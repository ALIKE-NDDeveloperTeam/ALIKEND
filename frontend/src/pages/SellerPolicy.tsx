/**
 * SellerPolicy.tsx - ALIKE ND Marketplace Seller Terms & Merchant Code of Conduct
 * 
 * NOTE ON DATA MODEL ARCHITECTURE:
 * There is NO separate "SellerProfile" backend model/schema in this codebase.
 * The authoritative backend schema is the unified "Seller" model located at:
 * `backend/models/Seller.ts` (ISeller interface and SellerSchema in the 'sellers' collection).
 * (Note: `SellerProfile` in `src/types.ts` is purely a frontend TypeScript interface mapping to `Seller`).
 * 
 * Statutory KYC and banking verification fields defined on the Seller model:
 * - `panNumber`: string (uppercase, required PAN of proprietor/entity)
 * - `gstin`: string (uppercase, optional/statutory GST identification number)
 * - `bankAccountHolderName`: string (required payee name for settlement)
 * - `bankAccountNumber`: string (required bank account number)
 * - `bankIFSC`: string (uppercase, required IFSC code)
 * - `bankName`: string (required banking institution name)
 * - `kycVerified`: boolean (admin verification status flag, defaults to false)
 */

import React, { useState } from 'react';
import { CONTACT_PHONE } from '../config/constants';
import { 
  Store, 
  ShieldCheck, 
  FileCheck, 
  Landmark, 
  Percent, 
  AlertTriangle, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Building, 
  CreditCard, 
  DollarSign, 
  Package, 
  Ban, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Award,
  UserPlus,
  LayoutDashboard
} from 'lucide-react';

interface SellerPolicyProps {
  onNavigate: (view: string) => void;
  isLightMode?: boolean;
}

export const SellerPolicy: React.FC<SellerPolicyProps> = ({
  onNavigate,
  isLightMode = true
}) => {
  const [activeSection, setActiveSection] = useState<string>('kyc-onboarding');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = [
    { id: 'kyc-onboarding', label: '1. KYC & Verification Flow' },
    { id: 'commission-structure', label: '2. Commission Architecture' },
    { id: 'authenticity-prohibited', label: '3. Prohibited Goods & Authenticity' },
    { id: 'listing-fulfillment', label: '4. Listings, Packaging & SLAs' },
    { id: 'wallet-payouts', label: '5. Seller Wallet & Withdrawals' },
    { id: 'suspension-termination', label: '6. Suspension & Penalties' },
    { id: 'merchant-support', label: '7. Merchant Desk & Support' },
  ];

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors ${
      isLightMode ? 'bg-[#FAF8F5] text-neutral-800' : 'bg-[#0B1528] text-neutral-200'
    }`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 text-neutral-500 hover:text-[#0F1A3C] dark:hover:text-[#F5A623] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </button>
          <span className="text-neutral-400">/</span>
          <span className="text-[#F5A623] font-bold">Seller Policy & Merchant Terms</span>
        </div>

        {/* Hero Banner Header */}
        <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F5A623]/30 text-[#0F1A3C] shadow-2xs">
            <Store className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black">
              Merchant Code of Conduct & Marketplace Agreement
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1A3C] uppercase tracking-wide">
            Seller <span className="text-[#F5A623]">Policy</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Mandatory onboarding standards, KYC verification, commission transparency, authenticity guarantees, and wallet payout protocols for all vendors on <strong>ALIKE ND</strong>.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" /> Last Updated: September 24, 2026
            </span>
            <span>•</span>
            <span>Seller Operations Protocol</span>
          </div>

          <div className="absolute top-0 left-0 w-40 h-40 bg-[#F5A623]/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0F1A3C]/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Quick Merchant Portals Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#F5A623]/60 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden">
          <div className="flex items-center gap-3.5 text-left min-w-0 flex-1">
            <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-xl bg-[#0F1A3C] text-[#F5A623] flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs sm:text-sm font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                Ready to Sell or Manage Your Shop?
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                Register as a new merchant or log in to manage your inventory, orders, and wallet balance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap justify-start md:justify-end">
            <button
              type="button"
              onClick={() => onNavigate('seller_register')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#0F1A3C] hover:bg-[#1a2d61] text-[#F5A623] hover:text-[#ffbe4d] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 shrink-0" />
              <span>Become a Seller</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('seller_dashboard')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#F5A623] text-[#0F1A3C] dark:text-white hover:text-[#B48C28] dark:hover:text-[#F5A623] font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer bg-white hover:bg-amber-50/50 dark:bg-neutral-800 flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 shadow-2xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
              <span>Seller Dashboard</span>
            </button>
          </div>
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F1A3C] dark:text-[#F5A623] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Seller Policy Navigation
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {tableOfContents.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => scrollToSection(t.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeSection === t.id
                    ? 'bg-[#0F1A3C] text-white border-[#0F1A3C] shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-[#F5A623] hover:text-[#0F1A3C]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          {/* SECTION 1: KYC & Verification Flow */}
          <section id="kyc-onboarding" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/30">
                <FileCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  1. Seller Onboarding & Statutory KYC Verification Flow
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Compliance with Rule 5 of Consumer Protection (E-Commerce) Rules, 2020</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                To maintain consumer trust and fulfill statutory obligations under the Consumer Protection (E-Commerce) Rules, 2020, every vendor operating an online shop or catalog on ALIKE ND must complete mandatory electronic Know-Your-Customer (KYC) onboarding before publishing listings. All merchant credentials, tax identifiers, and banking details are recorded in the marketplace authoritative <strong>Seller model</strong> (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">backend/models/Seller.ts</code>):
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Shop Identity & Legal Entity:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Trade Shop Name (<code className="font-mono text-[10px]">shopName</code>), Storefront Handle (<code className="font-mono text-[10px]">storefront</code>), Registered Owner (<code className="font-mono text-[10px]">ownerName</code>), and Registered Business Address (<code className="font-mono text-[10px]">businessAddress</code>).</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">PAN & GSTIN Verification:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Mandatory Permanent Account Number (<code className="font-mono text-[10px]">panNumber</code>) of proprietor/entity and Goods and Services Tax Identification Number (<code className="font-mono text-[10px]">gstin</code>) validated against statutory tax records.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Verified Bank Account Details:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Account Payee Name (<code className="font-mono text-[10px]">bankAccountHolderName</code>), Account Number (<code className="font-mono text-[10px]">bankAccountNumber</code>), IFSC Code (<code className="font-mono text-[10px]">bankIFSC</code>), and Bank Institution Name (<code className="font-mono text-[10px]">bankName</code>) matching applicant tax credentials.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">KYC Verification & Account Status:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Statutory verification flag (<code className="font-mono text-[10px]">kycVerified: boolean</code>) and operational state (<code className="font-mono text-[10px]">status: pending | approved | rejected | suspended | review</code>) controlling listing publishing and withdrawal clearance.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-[#F5A623]/30 text-xs text-neutral-700 dark:text-neutral-300">
                <strong>Manual Admin Approval:</strong> All seller registrations remain in a <em>"pending"</em> state (<code className="font-mono text-[11px]">kycVerified: false</code>) until platform risk personnel independently verify document authenticity. Approval typically completes within <strong>24 to 48 business hours</strong>, setting <code className="font-mono text-[11px]">kycVerified: true</code> and status to <em>"approved"</em>.
              </div>
            </div>
          </section>

          {/* SECTION 2: Commission Structure */}
          <section id="commission-structure" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <Percent className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  2. Transparent Commission Architecture
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Category-Tiered Fee Schedules & Zero Hidden Deductions</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                ALIKE ND operates on a competitive, category-based marketplace commission model designed to empower regional Northeast entrepreneurs, local artisans, and brand distributors:
              </p>

              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li>Commission rates are determined by product category (e.g. Fresh Groceries, Electronics, Fashion & Apparel, Handloom, Home Care) and are formally agreed upon during onboarding.</li>
                <li>Commission is calculated strictly on the net sold merchandise value (excluding GST and applicable delivery shipping fees collected on behalf of logistics partners).</li>
                <li><strong>No Listing Fees:</strong> ALIKE ND charges zero upfront fees to list products or create a digital storefront.</li>
                <li>Any future adjustments to commission tiers are communicated with a minimum of <strong>30 calendar days written advance notice</strong>.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 3: Authenticity & Prohibited Goods */}
          <section id="authenticity-prohibited" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <Ban className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  3. Rules of Engagement: Product Authenticity & Prohibited Goods
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Strict Anti-Counterfeit Policy & Mandatory Declarations</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <div className="p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  Zero Tolerance for Counterfeit Merchandise:
                </div>
                <p className="text-xs font-semibold text-[#0F1A3C] dark:text-neutral-200 leading-relaxed">
                  Every seller contractually guarantees that all goods listed are 100% authentic, brand-authorized, and lawfully sourced. The listing of replica, imitation, unauthorized first-copy, or trademark-infringing merchandise results in immediate store suspension, forfeiture of accrued earnings, and referral to Indian IP enforcement authorities.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                  Strictly Prohibited Goods on ALIKE ND:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-400">
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
                    • Weapons, explosives, fireworks, or hazardous chemical substances
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
                    • Prescription drugs, narcotics, tobacco, and psychotropic substances
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
                    • Wildlife articles, animal ivory, or endangered species derivatives
                  </div>
                  <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750">
                    • Pirated software, unlicensed digital keys, or circumvention hardware
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Listings & Packaging SLAs */}
          <section id="listing-fulfillment" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-500/30">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  4. Listing Accuracy, Packaging Standards & Fulfillment SLAs
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Statutory Disclosure Compliance under Legal Metrology Act</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                Sellers are solely and directly responsible for the accuracy of listing metadata, images, and descriptions published under their shop banner:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-neutral-600 dark:text-neutral-400">
                <li><strong>Mandatory Metrology Disclosures:</strong> In compliance with the Legal Metrology (Packaged Commodities) Rules, every listing must clearly state the Maximum Retail Price (MRP), net quantity, country of origin, manufacturing/expiry date, and importer details where applicable.</li>
                <li><strong>Packaging Requirements:</strong> Merchandise must be securely packed in tamper-evident outer containers suitable for Northeast climatic conditions and courier transit.</li>
                <li><strong>Dispatch SLA (Service Level Agreement):</strong> Standard marketplace orders must be marked <em>"Ready for Pickup"</em> within <strong>24 hours</strong> of order assignment. Hyper-local grocery or hot-food tickets must be prepared within the agreed prep duration (typically 5 to 12 minutes).</li>
              </ul>
            </div>
          </section>

          {/* SECTION 5: Wallet & Withdrawals */}
          <section id="wallet-payouts" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <Landmark className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  5. Seller Wallet Architecture & Withdrawal Disbursals
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Integrated In-App Wallet & NEFT/IMPS Disbursals</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                ALIKE ND operates an automated <strong>Seller Wallet System</strong> embedded into your Seller Portal:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Escrow & Clearance:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Order funds are credited to your seller wallet once the customer return window lapses without active defect claims.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Withdrawal Requests:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Sellers can request withdrawals directly from their dashboard into their verified bank account (subject to minimum withdrawal limits).</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Settlement Cycle:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Approved withdrawals are transmitted via NEFT / IMPS within <strong>24 to 48 banking hours</strong> accompanied by automated GST settlement notes.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6: Account Suspension & Penalties */}
          <section id="suspension-termination" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  6. Grounds for Account Suspension or Termination
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Protecting Platform Integrity and Buyer Satisfaction</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                ALIKE ND reserves the right to issue formal warnings, temporarily freeze inventory listings, or permanently terminate merchant access under any of the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                <li>Repeated fulfillment cancellation of placed consumer orders exceeding 2% of total order volume.</li>
                <li>Customer return defect rate (damaged, expired, or incorrect goods) exceeding acceptable platform benchmarks.</li>
                <li>Attempting to divert marketplace consumers off-platform to avoid commissions or settle payments outside authorized payment channels.</li>
                <li>Submission of forged KYC, altered GST documents, or counterfeit inventory documentation.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 7: Merchant Support */}
          <section id="merchant-support" className="p-6 sm:p-8 rounded-2xl border-2 border-[#F5A623]/50 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-[#0F1A3C] text-[#F5A623]">
                <Store className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  7. Dedicated Merchant Desk & Seller Support
                </h2>
                <p className="text-xs text-[#F5A623] font-bold">Priority Operations Channel</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                For onboarding inquiries, bulk catalog uploads, API integration, or payout reconciliation:
              </p>
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-neutral-500 font-semibold">Seller Operations Email:</p>
                  <a href="mailto:sellers@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline">
                    sellers@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                  </a>
                </div>
                <div>
                  <p className="text-neutral-500 font-semibold">Merchant Hotline:</p>
                  <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                    {CONTACT_PHONE}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom CTA / Return Button */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-neutral-500">
            Have questions regarding seller policies or commercial contracts?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('seller_register')}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0F1A3C] hover:bg-[#1a2d61] text-[#F5A623] transition-colors cursor-pointer shadow-md"
            >
              Start Seller Registration →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#F5A623] hover:text-[#0F1A3C] transition-colors cursor-pointer"
            >
              Return to Galleria Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerPolicy;
