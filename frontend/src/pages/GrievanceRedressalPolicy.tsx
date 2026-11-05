import React, { useState } from 'react';
import { CONTACT_PHONE } from '../config/constants';
import { 
  Scale, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  FileText, 
  UserCheck, 
  Building2, 
  ExternalLink,
  ChevronRight,
  Headphones
} from 'lucide-react';

interface GrievanceRedressalPolicyProps {
  onNavigate: (view: string) => void;
  isLightMode?: boolean;
}

export const GrievanceRedressalPolicy: React.FC<GrievanceRedressalPolicyProps> = ({
  onNavigate,
  isLightMode = true
}) => {
  const [activeSection, setActiveSection] = useState<string>('framework');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = [
    { id: 'framework', label: '1. Statutory Framework & Scope' },
    { id: 'officers', label: '2. Grievance & Nodal Officers' },
    { id: 'sla-timelines', label: '3. 48-Hour & 1-Month Resolution SLA' },
    { id: 'filing-steps', label: '4. How to File a Formal Grievance' },
    { id: 'inapp-messenger', label: '5. In-App Messenger & Live Support' },
    { id: 'escalation-matrix', label: '6. Consumer Commission Escalation' },
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
          <span className="text-[#F5A623] font-bold">Grievance Redressal Mechanism</span>
        </div>

        {/* Hero Banner Header */}
        <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F5A623]/30 text-[#0F1A3C] shadow-2xs">
            <Scale className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black">
              Consumer Protection (E-Commerce) Rules, 2020 Mandated
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1A3C] uppercase tracking-wide">
            Grievance Redressal <span className="text-[#F5A623]">Policy</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Dedicated customer grievance mechanism, appointed Nodal Officers, ticket escalation workflows, and dispute resolution timeframes for <strong>ALIKE ND</strong>.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" /> Last Updated: September 24, 2026
            </span>
            <span>•</span>
            <span>Unakoti, Tripura, India</span>
          </div>

          <div className="absolute top-0 left-0 w-40 h-40 bg-[#F5A623]/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0F1A3C]/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Live Support Fast-Track Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#0F1A3C]/20 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#F5A623] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                Looking for Real-Time Order Assistance?
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                For instant resolutions regarding live orders, chat directly with our support team in the in-app Messenger.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('messenger')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F1A3C] hover:bg-[#1a2d61] text-[#F5A623] font-bold text-xs uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            Launch Support Messenger <ChevronRight className="w-3.5 h-3.5" />
          </button>
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

        {/* Main Content */}
        <div className="space-y-8 text-sm leading-relaxed">
          
          {/* SECTION 1: Statutory Framework */}
          <section id="framework" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/30">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  1. Statutory Framework & Scope of Redressal
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Compliance with Rule 4(4) and Rule 4(5) of E-Commerce Rules, 2020</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                In strict conformity with the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong> notified under the Consumer Protection Act, 2019, ALIKE ND maintains a robust, transparent, and multi-tier consumer grievance redressal mechanism designed to safeguard consumer rights and ensure rapid remediation of grievances relating to goods, digital services, or merchant fulfillment.
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                This mechanism applies to all registered consumers, guest buyers, verified sellers, and delivery partners interacting with the ALIKE ND marketplace, mobile web platform, and hyper-local delivery services operating from Kumarghat, Tripura.
              </p>
            </div>
          </section>

          {/* SECTION 2: Appointed Officers */}
          <section id="officers" className="p-6 sm:p-8 rounded-2xl border-2 border-[#F5A623]/50 bg-gradient-to-br from-white via-amber-50/20 to-white dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-[#0F1A3C] text-[#F5A623]">
                <UserCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  2. Designated Grievance Officer & Nodal Contact Person
                </h2>
                <p className="text-xs text-[#F5A623] font-bold">Statutory Appointees with Escalation Powers</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p>
                ALIKE ND has appointed qualified resident officers in India responsible for 24x7 coordination with law enforcement agencies and prompt consumer grievance resolution:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Officer 1: Grievance Officer */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                      Consumer Grievances
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                    Resident Grievance Officer
                  </h4>
                  <div className="text-xs space-y-1 pt-1 font-medium">
                    <p className="text-neutral-500">Name:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS: Name of Grievance Officer, ALIKE ND]
                    </p>
                    <p className="text-neutral-500 pt-1">Direct Grievance Email:</p>
                    <a href="mailto:grievance@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline block truncate">
                      grievance@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                    </a>
                    <p className="text-neutral-500 pt-1">Direct Helpline:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      {CONTACT_PHONE}
                    </p>
                  </div>
                </div>

                {/* Officer 2: Nodal Contact Person */}
                <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                      Regulatory & Police Liaison
                    </span>
                    <Building2 className="w-4 h-4 text-[#F5A623]" />
                  </div>
                  <h4 className="text-sm font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                    Nodal Contact Person
                  </h4>
                  <div className="text-xs space-y-1 pt-1 font-medium">
                    <p className="text-neutral-500">Name:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS: Name of Nodal Officer, ALIKE ND]
                    </p>
                    <p className="text-neutral-500 pt-1">Direct Nodal Email:</p>
                    <a href="mailto:nodal@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline block truncate">
                      nodal@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                    </a>
                    <p className="text-neutral-500 pt-1">Law Enforcement Contact:</p>
                    <p className="font-mono font-bold text-[#0F1A3C] dark:text-white">
                      {CONTACT_PHONE}
                    </p>
                  </div>
                </div>

              </div>

              {/* Physical Office Address */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F1A3C] dark:text-white">Registered Corporate Office for Physical Notices:</span>
                  <p className="text-neutral-600 dark:text-neutral-400 font-mono mt-0.5">
                    ALIKE ND Enterprise, Kumarghat Main Road, Near Municipal Council, Unakoti District, Tripura - 799264, India [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: 48-Hour & 1-Month SLA */}
          <section id="sla-timelines" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  3. Statutory SLA: 48-Hour Acknowledgment & 1-Month Resolution
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Legally Binding Timeframes under E-Commerce Rules</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              {/* Highlight Box */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" />
                  Statutory Binding Guarantee:
                </div>
                <p className="text-xs font-bold text-[#0F1A3C] dark:text-neutral-200 leading-relaxed">
                  ALIKE ND guarantees that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
                  <li><strong>48-Hour Acknowledgment:</strong> Every consumer grievance received by our Grievance Officer is formally acknowledged via automated and manual email/SMS within <strong>48 hours</strong> of receipt, accompanied by a unique Grievance Tracking Ticket Number.</li>
                  <li><strong>One-Month Resolution (30 Days):</strong> The complaint is redressed, investigated, and conclusively disposed of within <strong>one month (30 calendar days)</strong> from the date of initial receipt.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850">
                  <div className="font-mono text-lg font-black text-[#0F1A3C] dark:text-[#F5A623]">0 - 48 Hrs</div>
                  <div className="font-bold text-[#0F1A3C] dark:text-white mt-1">Ticket Issuance</div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Formal ticket generation and assignment to specialist resolution team.</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850">
                  <div className="font-mono text-lg font-black text-[#0F1A3C] dark:text-[#F5A623]">3 - 7 Days</div>
                  <div className="font-bold text-[#0F1A3C] dark:text-white mt-1">Merchant / Courier Audit</div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Physical inspection and reconciliation of telemetry, CCTV, or weight logs.</p>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850">
                  <div className="font-mono text-lg font-black text-[#0F1A3C] dark:text-[#F5A623]">≤ 30 Days</div>
                  <div className="font-bold text-[#0F1A3C] dark:text-white mt-1">Conclusive Redressal</div>
                  <p className="text-[11px] text-neutral-500 mt-0.5">Refund disbursement, replacement delivery, or written closure explanation.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: Filing Steps */}
          <section id="filing-steps" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  4. Step-by-Step Process for Filing a Formal Grievance
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Standardized Intake Channels</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                When submitting an escalated grievance, consumers are requested to furnish the following particulars to expedite investigation:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <li><strong className="text-[#0F1A3C] dark:text-white">Order Reference Number:</strong> The 8-to-12 digit alphanumeric identifier located in your digital invoice and order confirmation SMS.</li>
                <li><strong className="text-[#0F1A3C] dark:text-white">Registered Mobile Number:</strong> The mobile phone number registered on ALIKE ND where OTPs are received.</li>
                <li><strong className="text-[#0F1A3C] dark:text-white">Factual Narrative:</strong> A concise description of the defect, discrepancy, delivery lapse, or billing variation encountered.</li>
                <li><strong className="text-[#0F1A3C] dark:text-white">Documentary Evidence:</strong> High-resolution photographs or unboxing video footage illustrating the damaged item or incorrect consignment, if applicable.</li>
              </ol>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs">
                <strong>Submission Channels:</strong> Send via email directly to <a href="mailto:grievance@alikend.com" className="text-[#F5A623] font-mono font-bold hover:underline">grievance@alikend.com [PLACEHOLDER]</a>, or submit a certified written post to our Kumarghat corporate office.
              </div>
            </div>
          </section>

          {/* SECTION 5: In-App Messenger */}
          <section id="inapp-messenger" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-500/30">
                <MessageSquare className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  5. In-App Messenger & Live Support Resolution
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Fast Frontline Triage</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                For regular order inquiries, return status checks, address corrections, or courier contact details, you do not need to initiate a formal statutory grievance filing. Our integrated <strong>In-App Messenger</strong> provides direct, encrypted interaction with our customer service team.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('messenger')}
                  className="px-4 py-2 rounded-xl bg-[#0F1A3C] text-[#F5A623] font-bold hover:bg-[#1a2d61] transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> Open In-App Support Chat
                </button>
              </div>
            </div>
          </section>

          {/* SECTION 6: Escalation Matrix */}
          <section id="escalation-matrix" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  6. External Statutory Escalation Avenues
                </h2>
                <p className="text-xs text-neutral-500 font-medium">National Consumer Helpline & e-Daakhil Portals</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                In the rare circumstance that your grievance is not resolved to your complete satisfaction within the statutory 30-day timeline, you hold the legal right to escalate the matter before government consumer protection bodies:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">National Consumer Helpline (NCH):</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Toll-Free Helpline: <strong>1915</strong> or <strong>1800-11-4000</strong></p>
                  <p className="text-[11px] text-neutral-500">Government Portal: consumerhelpline.gov.in</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">e-Daakhil Consumer Commission:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Online filing for District, State, and National Consumer Disputes Redressal Commissions (NCDRC).</p>
                  <p className="text-[11px] text-neutral-500">Portal: edaakhil.nic.in</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Bottom CTA / Return Button */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-neutral-500">
            Learn more about our operational policies and user agreements
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

export default GrievanceRedressalPolicy;
