import React, { useState } from 'react';
import { CONTACT_PHONE } from '../config/constants';
import { 
  FileText, 
  ShieldCheck, 
  Scale, 
  Truck, 
  CreditCard, 
  AlertTriangle, 
  RotateCcw, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Building2,
  ChevronRight
} from 'lucide-react';

interface TermsAndConditionsProps {
  onNavigate: (view: string) => void;
  isLightMode?: boolean;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  onNavigate,
  isLightMode = true
}) => {
  const [activeSection, setActiveSection] = useState<string>('user-agreement');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = [
    { id: 'user-agreement', label: '1. Platform Terms & Agreement' },
    { id: 'transaction-logistics', label: '2. Transactions & Cancellations' },
    { id: 'seller-terms', label: '3. Merchant & Seller Rules' },
    { id: 'payments', label: '4. Payment Gateways & EMI' },
    { id: 'consumer-protection', label: '5. Fair Trade & Anti-Drip Pricing' },
    { id: 'fraud-mitigation', label: '6. Risk & Fraud Mitigation' },
    { id: 'grievance-redressal', label: '7. Nodal Officer & Redressal' },
    { id: 'general-legal', label: '8. Jurisdiction & General Terms' },
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
          <span className="text-[#F5A623] font-bold">Terms & Conditions</span>
        </div>

        {/* Hero Banner Header */}
        <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F5A623]/30 text-[#0F1A3C] shadow-2xs">
            <Scale className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black">
              Consumer Protection (E-Commerce) Rules, 2020 Aligned
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1A3C] uppercase tracking-wide">
            Terms & <span className="text-[#F5A623]">Conditions</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Legally-binding user agreement, marketplace standards, cancellation parity, and statutory protections governing the <strong>ALIKE ND</strong> multi-vertical ecosystem in Kumarghat, Tripura, India.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" /> Last Updated: September 24, 2026
            </span>
            <span>•</span>
            <span>Applicable across India</span>
          </div>

          <div className="absolute top-0 left-0 w-40 h-40 bg-[#F5A623]/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0F1A3C]/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F1A3C] dark:text-[#F5A623] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Quick Table of Contents
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

        {/* Main Terms Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          {/* SECTION 1 */}
          <section id="user-agreement" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  1. Platform Terms & User Agreement
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Scope, Acceptable Use, and Account Obligations</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                Welcome to <strong>ALIKE ND</strong> (operated by Alike ND Enterprise, having its registered operational office in Kumarghat, Unakoti District, Tripura - 799264, India). This document governs your access to and utilization of our digital multi-vertical marketplace, which encompasses retail e-commerce, express grocery and essentials delivery, local chef/food delivery, and future planned ride-hailing and financial technology aggregations.
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <h4 className="text-xs font-bold text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                  Core User Eligibility & Conduct Rules:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <li><strong>Legal Capacity:</strong> You must be at least 18 years of age or accessing under the supervision of a parent or legal guardian capable of forming legally-enforceable contracts under the Indian Contract Act, 1872.</li>
                  <li><strong>Account Integrity:</strong> You agree to provide accurate, true, and up-to-date phone credentials and delivery addresses. You are responsible for safeguarding your login OTPs and account access.</li>
                  <li><strong>Prohibited Conduct:</strong> You agree not to engage in web scraping, unauthorized API interception, denial-of-service disruptions, false order submissions, abusive communications with support staff or delivery riders, or infringement of intellectual property.</li>
                  <li><strong>Marketplace Facilitator Role:</strong> ALIKE ND operates as an electronic marketplace platform facilitating transactions between independent sellers/merchants, logistics delivery contractors, and end-consumers.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section id="transaction-logistics" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/30">
                <Truck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  2. Transaction, Delivery & Cancellation Parity
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Logistics Protocols & Rule 6(4) Cancellation Guarantee</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p>
                Orders placed through ALIKE ND constitute a binding purchase offer. Delivery timelines indicated on product pages or during checkout (including our 20-minute express courier delivery where available) are estimates formulated based on vendor preparation time, transit conditions, and local Tripura weather/topography.
              </p>

              {/* STATUTORY CANCELLATION PARITY CLAUSE */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-[#F5A623] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#F5A623]" />
                  Statutory Non-Imposition of Unilateral Cancellation Charges:
                </div>
                <p className="text-xs font-semibold text-[#0F1A3C] dark:text-neutral-200 leading-relaxed">
                  In strict compliance with <strong>Rule 6(4) of the Consumer Protection (E-Commerce) Rules, 2020</strong>: ALIKE ND shall NOT impose any cancellation charges on any consumer who cancels an order, unless similar cancellation charges are contractually borne and paid by ALIKE ND if the platform or merchant unilaterally cancels the order without consumer consent.
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Consumers may cancel non-perishable orders freely prior to vendor parcel dispatch. For quick-commerce and instant food preparation orders, cancellation is permissible prior to the merchant accepting and initiating kitchen or warehouse packing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800">
                  <h5 className="font-bold text-[#0F1A3C] dark:text-white pb-1">Returns & Replacements:</h5>
                  <p className="text-neutral-600 dark:text-neutral-400">Eligible products may be returned within the designated return window (typically 7 days for lifestyle and electronics, subject to unopened seal and original packaging). Defective or transit-damaged items must be reported within 24 hours.</p>
                </div>
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800">
                  <h5 className="font-bold text-[#0F1A3C] dark:text-white pb-1">Refund Processing Timeframes:</h5>
                  <p className="text-neutral-600 dark:text-neutral-400">Approved refunds are credited to the original payment source within 5 to 7 banking days following physical warehouse quality verification of returned inventory.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3 */}
          <section id="seller-terms" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  3. Merchant, Artisan & Seller Rules of Engagement
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Onboarding KYC, Commissions & Mandatory Disclosures</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                Merchants and brand owners listing goods or services on ALIKE ND are subject to our verified <strong>Seller Portal Onboarding & KYC Framework</strong>. Sellers must hold active GSTIN credentials, verifiable bank accounts, and requisite regulatory food safety (FSSAI) or trade certifications where applicable.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li><strong>Commission Agreements:</strong> Sellers agree to clear, published commission tiering and settlement cycles as specified in their merchant agreements. No retroactive deductions are applied without mutual written consent.</li>
                <li><strong>Prohibition of Counterfeits:</strong> Sellers warrant that all merchandise offered is authentic, original, free from liens, and compliant with the Legal Metrology (Packaged Commodities) Rules, 2011.</li>
                <li><strong>Statutory Product Disclosures:</strong> Sellers must disclose exact country of origin, importer information, maximum retail price (MRP), net quantity, and expiry dates on product display pages.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 4 */}
          <section id="payments" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-500/30">
                <CreditCard className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  4. Payment Processing, Gateways & EMI
                </h2>
                <p className="text-xs text-neutral-500 font-medium">RBI Tokenization & Escrow Routing</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                All digital transactions on ALIKE ND are processed through Reserve Bank of India (RBI) authorized third-party Payment Aggregators (such as Razorpay, Cashfree, or PayU) employing 256-bit SSL encryption and full PCI-DSS Level 1 tokenized processing.
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                ALIKE ND never stores full credit/debit card numbers, CVVs, or Netbanking passwords on internal servers. Equated Monthly Installment (EMI) options and Buy-Now-Pay-Later (BNPL) facilities are extended directly by partner banking institutions and are subject to their respective credit terms, interest schedules, and late-fee policies.
              </p>
            </div>
          </section>

          {/* SECTION 5 */}
          <section id="consumer-protection" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  5. Fair Trade, Anti-Drip Pricing & Search Transparency
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Fair Dealing Guarantees under E-Commerce Rules, 2020</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                In accordance with Indian consumer welfare guidelines and fair competition jurisprudence, ALIKE ND makes the following transparent operational commitments:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Zero Drip Pricing:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">We do not practice drip pricing. All mandatory taxes, GST levies, packaging charges, or delivery fees are disclosed upfront before transaction confirmation.</p>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Algorithmic Neutrality:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Search rankings reflect genuine relevance, customer ratings, price, and logistics availability. We do not deceptively manipulate search results to favor captive sellers.</p>
                </div>
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">No Predatory Sales:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Promotions and Flash Premium Hours reflect legitimate retail discounts agreed with brand partners, without artificial price inflation or fabricated scarcity countdowns.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 6 */}
          <section id="fraud-mitigation" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  6. Risk, Abuse & Account Suspension Framework
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Mitigation of Transit Loss & Unlawful Chargebacks</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                ALIKE ND retains the explicit right to suspend, freeze, or terminate customer or seller accounts found engaging in fraudulent or abusive practices, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                <li>Repeated, systematic cancellation of orders upon physical delivery arrival at consumer doorsteps without legitimate defect.</li>
                <li>Tampering with delivered items or substituting genuine articles with counterfeit or used units during returns.</li>
                <li>Creating multiple unauthorized or automated accounts to hoard flash-deal inventory or abuse new-user promo credits.</li>
              </ul>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                <strong>Handling of Damaged/Lost Goods:</strong> Items demonstrably lost or damaged during courier transit will be promptly re-dispatched or refunded in full at no additional cost to the buyer upon courier telemetry confirmation.
              </p>
            </div>
          </section>

          {/* SECTION 7 - GRIEVANCE REDRESSAL */}
          <section id="grievance-redressal" className="p-6 sm:p-8 rounded-2xl border-2 border-[#F5A623]/50 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-[#0F1A3C] text-[#F5A623]">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  7. Grievance Redressal & Nodal Contact Mechanism
                </h2>
                <p className="text-xs text-[#F5A623] font-bold">Statutory 48-Hour Acknowledgment & 1-Month Resolution Mandate</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                Per <strong>Rule 4(4) and Rule 5(3)(e) of the Consumer Protection (E-Commerce) Rules, 2020</strong>, ALIKE ND has appointed a designated Grievance Officer and a Nodal Contact Person for 24x7 liaison with regulatory authorities.
              </p>

              {/* Statutory Timelines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-amber-500/10 border border-[#F5A623]/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F1A3C] text-[#F5A623] flex items-center justify-center font-black text-sm shrink-0">
                    48H
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#0F1A3C] dark:text-white">Ticket Acknowledgment</h5>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">All consumer complaints acknowledged within 48 hours of electronic receipt.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F1A3C] text-[#F5A623] flex items-center justify-center font-black text-sm shrink-0">
                    30D
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#0F1A3C] dark:text-white">Final Dispute Resolution</h5>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400">Complete redressal and investigation completed within one calendar month.</p>
                  </div>
                </div>
              </div>

              {/* Grievance Details Box with Placeholders */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1A3C] dark:text-white">
                  Officer Contact Details:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-neutral-500 font-semibold">Designated Grievance Officer:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS: Grievance Officer, ALIKE ND]
                    </p>
                    <p className="text-neutral-500 text-[11px]">Direct Support Email:</p>
                    <a href="mailto:grievance@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline">
                      grievance@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                    </a>
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-500 font-semibold">Nodal Compliance Officer:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS: Nodal Contact Person]
                    </p>
                    <p className="text-neutral-500 text-[11px]">Official Telephone:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      {CONTACT_PHONE}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 text-xs">
                  <p className="text-neutral-500">Registered Office Address for Service of Notices:</p>
                  <p className="font-medium text-[#0F1A3C] dark:text-neutral-300">
                    ALIKE ND Headquarters, Main Road, Kumarghat, Unakoti District, Tripura - 799264, India [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8 */}
          <section id="general-legal" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  8. Governing Law, Tripura Jurisdiction & Amendments
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Dispute Resolution & Intellectual Property</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                <strong>Governing Law & Exclusive Jurisdiction:</strong> These Terms and any associated purchase orders shall be governed exclusively by the substantive laws of the Republic of India. In the event of any legal dispute arising from transactions on this platform, the courts of competent jurisdiction located in <strong>Tripura, India</strong> shall have sole and exclusive jurisdiction.
              </p>
              <p>
                <strong>Intellectual Property:</strong> All trademarks, visual trade dress, graphics, logos, and UI components featuring "ALIKE ND" are the proprietary assets of Alike ND Enterprise. Unauthorized reproduction is strictly prohibited.
              </p>
              <p>
                <strong>Changes to Terms:</strong> ALIKE ND reserves the right to amend these Terms to reflect legislative changes, platform feature updates, or regulatory orders. Material modifications will be published on this URL with an updated "Last Updated" revision timestamp. Continued usage following modification indicates unconditional acceptance.
              </p>
            </div>
          </section>

        </div>

        {/* Bottom CTA / Return Button */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-neutral-500">
            Have questions regarding our legal or platform policies?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('privacy_policy')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#F5A623] hover:text-[#0F1A3C] transition-colors cursor-pointer"
            >
              View Privacy Policy →
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0F1A3C] hover:bg-[#1a2d61] text-[#F5A623] transition-colors cursor-pointer shadow-md"
            >
              Return to Galleria Home
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TermsAndConditions;
