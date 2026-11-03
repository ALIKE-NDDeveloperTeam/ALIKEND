import React, { useState } from 'react';
import { CONTACT_PHONE } from '../config/constants';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Database, 
  UserCheck, 
  Baby, 
  CreditCard, 
  Trash2, 
  Mail, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Server,
  EyeOff,
  Scale
} from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (view: string) => void;
  isLightMode?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  onNavigate,
  isLightMode = true
}) => {
  const [activeSection, setActiveSection] = useState<string>('collection');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = [
    { id: 'collection', label: '1. Personal Data Collected' },
    { id: 'otp-security', label: '2. OTP & Authentication' },
    { id: 'retention-consent', label: '3. Explicit Consent & Retention' },
    { id: 'children-data', label: "4. Children's Data Protection" },
    { id: 'payment-tokenization', label: '5. Payment Tokenization' },
    { id: 'dpdp-rights', label: '6. Your DPDP Act Rights' },
    { id: 'data-deletion', label: '7. Data & Account Erasure' },
    { id: 'security-contact', label: '8. Security & Privacy Contact' },
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
          <span className="text-[#F5A623] font-bold">Privacy Policy</span>
        </div>

        {/* Hero Banner Header */}
        <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F5A623]/30 text-[#0F1A3C] shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black">
              Digital Personal Data Protection (DPDP) Act, 2023 Compliant
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1A3C] uppercase tracking-wide">
            Privacy <span className="text-[#F5A623]">Policy</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            How <strong>ALIKE ND</strong> processes, secures, and honors your personal data rights across our multi-vertical marketplace and logistics network in Kumarghat, Tripura, India.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" /> Last Updated: September 24, 2026
            </span>
            <span>•</span>
            <span>Data Fiduciary: ALIKE ND Enterprise</span>
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

        {/* Main Privacy Policy Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          {/* SECTION 1 */}
          <section id="collection" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <Database className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  1. Personal Data Collected at Registration & Checkout
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Clear Data Inventory & Necessary Processing Scope</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                In our capacity as a <strong>Data Fiduciary</strong> under India's Digital Personal Data Protection (DPDP) Act, 2023, ALIKE ND collects only personal data strictly required to deliver our e-commerce, express grocery, food preparation, and local logistics services:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Full Name & Mobile Number:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Used for customer identification, account issuance, real-time dispatch alerts, and SMS/WhatsApp delivery coordination.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Email Address:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Used for GST-compliant tax invoices, digital receipts, account recovery, and essential service updates.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Delivery Address & PIN Code:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Precise geographic address details for routing couriers, calculating logistics zones, and fulfilling doorstep delivery.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Location Permissions (Optional):</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Device GPS coordinates requested on-demand solely to estimate 20-minute delivery feasibility and pinpoint hyper-local drop-off points.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2 */}
          <section id="otp-security" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/30">
                <KeyRound className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  2. OTP-Based Verification & Passwordless Authentication
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Zero Permanent Passwords, Cryptographic One-Time Codes</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                To safeguard our users from credential stuffing and password leak vulnerabilities, ALIKE ND enforces an <strong>OTP (One-Time Password) Verification Architecture</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <li>Account registration, login authentication, and critical security modifications trigger a cryptographically randomized 6-digit numeric OTP delivered directly to your registered mobile device.</li>
                <li>OTPs expire automatically after 5 minutes and become invalid immediately upon first consumption or 3 failed entry attempts.</li>
                <li>We do not store static user passwords in our database, eliminating the risk of plaintext or hash table database breaches.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 3 */}
          <section id="retention-consent" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  3. Unbundled Consent Architecture & Retained Records
                </h2>
                <p className="text-xs text-neutral-500 font-medium">DPDP Act Mandate: No Pre-Ticked Boxes, Granular Consent Logs</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              {/* DPDP ACT ZERO PRE-TICKED BOXES GUARANTEE */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-[#F5A623] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#F5A623]" />
                  Statutory Non-Bundled Consent Guarantee (DPDP Act, 2023):
                </div>
                <p className="text-xs font-semibold text-[#0F1A3C] dark:text-neutral-200 leading-relaxed">
                  ALIKE ND guarantees that user consent is collected freely, specifically, informed, and unconditionally. In strict compliance with the Digital Personal Data Protection Act, 2023: <strong>Consent is NEVER collected via pre-ticked, default-checked checkboxes, bundled terms, or coercive UI dark patterns.</strong>
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                  Every consent record is digitally time-stamped, linked to the user account, and stored in an immutable audit log reflecting the exact wording presented at the time of affirmative user action.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <h4 className="text-xs font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                  What Information is Retained:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
                  <li><strong>Order History:</strong> Product catalog itemizations, purchase timestamps, and delivery telemetry.</li>
                  <li><strong>Return & Refund Records:</strong> Reversal logs, inspection notes, and refund transaction references (mandated for statutory Indian tax/accounting audits for up to 7 financial years).</li>
                  <li><strong>Consent Records:</strong> Proof of affirmative consent and cookie preference states.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 4 - CHILDREN'S DATA */}
          <section id="children-data" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-500/30">
                <Baby className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  4. Protection of Children's & Minors' Data
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Verifiable Parental Consent & Prohibition of Behavioral Tracking</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                In strict adherence to Section 9 of the DPDP Act, 2023 concerning the processing of personal data belonging to children (defined as individuals under 18 years of age):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Parental Consent Mandate:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">ALIKE ND does not knowingly enroll or process personal data of minors without verifiable consent from their parent or lawful legal guardian.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Zero Behavioral Tracking:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">ALIKE ND strictly prohibits behavioral tracking, psychographic profiling, and targeted advertising directed at children or minors across all platform interfaces.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5 */}
          <section id="payment-tokenization" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <CreditCard className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  5. Payment Credentials Security & Gateway Tokenization
                </h2>
                <p className="text-xs text-neutral-500 font-medium">PCI-DSS Level 1 Encrypted Channels & RBI Directives</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                <strong>Zero Storage of Raw Payment Credentials:</strong> ALIKE ND explicitly does NOT store, log, or maintain sensitive payment credentials (such as 16-digit card PAN numbers, CVVs, card expiration dates, UPI PINs, or net banking passwords) on our application servers or databases.
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Payment authorizations occur directly through RBI-compliant, PCI-DSS Level 1 certified payment aggregator software development kits (SDKs). Saved payment methods utilize tokenized surrogate keys (CoFT - Card-on-File Tokenization) authorized directly by the issuing banking networks (Visa, Mastercard, RuPay).
              </p>
            </div>
          </section>

          {/* SECTION 6 */}
          <section id="dpdp-rights" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  6. Your Statutory Rights under DPDP Act, 2023
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Data Principal Rights Recognized by Law</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                As a Data Principal under Indian law, you are endowed with the following irrevocable rights regarding personal data processed by ALIKE ND:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Right to Access Summary:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">You may request a readable summary of personal data held, processing activities undertaken, and identities of all third parties with whom data was shared.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Right to Correction & Updating:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">You may update, correct, or complete inaccurate or obsolete personal details directly via your Profile or through privacy support.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Right of Nomination:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">You hold the right to nominate another individual who shall exercise your personal data rights in the unfortunate event of death or incapacity.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Right to Regulatory Escalation:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">If internal redressal is unsatisfactory, you may lodge a formal complaint before the <strong>Data Protection Board of India (DPBI)</strong>.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 7 */}
          <section id="data-deletion" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <Trash2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  7. Right to Erasure & Account Deletion Protocol
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Permanent Account Removal & Statutory Data Retention Exceptions</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                You may request the complete deletion of your account and erasure of associated personal data at any time:
              </p>
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-2">
                <h4 className="text-xs font-bold text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                  How to Submit an Erasure / Account Deletion Request:
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Send an email from your registered email address to <a href="mailto:privacy@alikend.com" className="text-[#F5A623] font-bold hover:underline font-mono">privacy@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]</a> with the subject line <em>"Data Erasure Request - [Your Mobile Number]"</em>. Alternatively, navigate to your Profile page settings to initiate an account closure review.
                </p>
                <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-750 text-[11px] text-neutral-500">
                  <strong>Statutory Retention Note:</strong> Certain transaction and invoice records will be retained in encrypted, non-queryable cold storage strictly to satisfy statutory requirements under the Goods and Services Tax (GST) Act and Prevention of Money Laundering Act (PMLA), after which they are irreversibly expunged.
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 8 - SECURITY & CONTACT */}
          <section id="security-contact" className="p-6 sm:p-8 rounded-2xl border-2 border-[#F5A623]/50 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-[#0F1A3C] text-[#F5A623]">
                <Lock className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  8. Data Protection Officer & Privacy Inquiries
                </h2>
                <p className="text-xs text-[#F5A623] font-bold">Contact Channel for Data Principal Inquiries</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                ALIKE ND has appointed a dedicated <strong>Data Protection Officer (DPO)</strong> responsible for overseeing compliance with the DPDP Act, 2023, and processing data principal requests.
              </p>

              {/* DPO Details Box with Placeholders */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1A3C] dark:text-white">
                  Data Protection Contact Details:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-neutral-500 font-semibold">Data Protection Officer:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS: Data Protection Officer, ALIKE ND]
                    </p>
                    <p className="text-neutral-500 text-[11px]">Direct Privacy Email:</p>
                    <a href="mailto:privacy@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline">
                      privacy@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                    </a>
                  </div>

                  <div className="space-y-1">
                    <p className="text-neutral-500 font-semibold">Security Operations Line:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      {CONTACT_PHONE}
                    </p>
                    <p className="text-neutral-500 text-[11px]">Primary Headquarters:</p>
                    <p className="font-medium text-[#0F1A3C] dark:text-neutral-300">
                      Kumarghat, Unakoti District, Tripura - 799264, India [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-500 pt-1">
                <strong>Third-Party Sharing Scope:</strong> We do NOT sell, rent, or trade your personal data to marketing brokers. Personal data is shared solely with licensed logistics couriers for delivery fulfillment and payment aggregators for clearing orders.
              </p>
            </div>
          </section>

        </div>

        {/* Bottom CTA / Return Button */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-neutral-500">
            Learn more about our platform rules and consumer guarantees
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('terms_conditions')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#F5A623] hover:text-[#0F1A3C] transition-colors cursor-pointer"
            >
              View Terms & Conditions →
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

export default PrivacyPolicy;
