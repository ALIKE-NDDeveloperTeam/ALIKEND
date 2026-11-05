import React, { useState } from 'react';
import { 
  RotateCcw, 
  Truck, 
  CreditCard, 
  XCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  FileText, 
  Package, 
  ShieldCheck, 
  ShoppingBag,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface ReturnRefundPolicyProps {
  onNavigate: (view: string) => void;
  isLightMode?: boolean;
}

export const ReturnRefundPolicy: React.FC<ReturnRefundPolicyProps> = ({
  onNavigate,
  isLightMode = true
}) => {
  const [activeSection, setActiveSection] = useState<string>('shipping-delivery');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tableOfContents = [
    { id: 'shipping-delivery', label: '1. Shipping & Logistics Policy' },
    { id: 'cancellation-parity', label: '2. Cancellation Parity (Rule 6(4))' },
    { id: 'return-eligibility', label: '3. Return Window & Eligibility' },
    { id: 'non-returnable', label: '4. Non-Returnable Categories' },
    { id: 'refund-timeline', label: '5. Refund Methods & Timelines' },
    { id: 'how-to-initiate', label: '6. How to Initiate a Return' },
    { id: 'damaged-transit', label: '7. Damaged or Defective Items' },
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
          <span className="text-[#F5A623] font-bold">Returns & Refunds Policy</span>
        </div>

        {/* Hero Banner Header */}
        <div className="border border-solid border-[#F5A623]/40 rounded-2xl p-6 sm:p-8 bg-gradient-to-tr from-[#F5F2EB] via-[#E9E9E7] to-[#FAF8F5] text-center space-y-3 relative overflow-hidden shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#F5A623]/30 text-[#0F1A3C] shadow-2xs">
            <RotateCcw className="w-3.5 h-3.5 text-[#F5A623]" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-black">
              Consumer Protection (E-Commerce) Rules, 2020 Aligned
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0F1A3C] uppercase tracking-wide">
            Returns, Refunds & <span className="text-[#F5A623]">Cancellations</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Transparent shipping protocols, statutory cancellation parity, inspection timelines, and wallet reimbursement guarantees across the <strong>ALIKE ND</strong> platform in Kumarghat, Tripura, India.
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] font-mono font-bold text-neutral-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#F5A623]" /> Last Updated: September 24, 2026
            </span>
            <span>•</span>
            <span>Customer First Guarantee</span>
          </div>

          <div className="absolute top-0 left-0 w-40 h-40 bg-[#F5A623]/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#0F1A3C]/10 blur-3xl rounded-full pointer-events-none" />
        </div>

        {/* Quick Action Box: Ready to Return? */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-[#F5A623]/60 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/50 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A3C] text-[#F5A623] flex items-center justify-center shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                Need to Return an Delivered Order?
              </h4>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400">
                You can submit a one-click return or exchange request directly from your Order History panel.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F1A3C] hover:bg-[#1a2d61] text-[#F5A623] font-bold text-xs uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer shadow-md hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
          >
            Go to My Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Jump Navigation Bar */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F1A3C] dark:text-[#F5A623] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Policy Navigation
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
          
          {/* SECTION 1: Shipping & Delivery */}
          <section id="shipping-delivery" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-500/30">
                <Truck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  1. Shipping, Dispatch & Hyper-Local Delivery Policy
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Fulfillment Channels Across Tripura and Pan-India</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                ALIKE ND operates a hybrid logistics architecture accommodating hyper-local instant fulfillment within Kumarghat and surrounding municipal sectors, alongside regional surface logistics across Northeast India and nationwide courier transit.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Hyper-Local Express (20-Minute Delivery):</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Available exclusively for items tagged with the lightning bolt indicator within participating Kumarghat PIN codes. Dispatched immediately via dedicated two-wheeler courier partners.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Standard Regional & National Shipping:</div>
                  <p className="text-neutral-600 dark:text-neutral-400">General marketplace merchandise ships within 24 to 48 business hours of order placement. Typical transit duration ranges between 2 to 5 business days depending on delivery PIN code.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-500">
                Live consignment tracking is accessible in real-time through your Account Dashboard, and SMS notifications are broadcast upon dispatch, transit node clearance, and final delivery out-for-delivery states.
              </p>
            </div>
          </section>

          {/* SECTION 2: Cancellation Parity */}
          <section id="cancellation-parity" className="p-6 sm:p-8 rounded-2xl border-2 border-[#F5A623]/50 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <XCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  2. Cancellation Policy & Statutory Cancellation Parity
                </h2>
                <p className="text-xs text-[#F5A623] font-bold">Rule 6(4) of Consumer Protection (E-Commerce) Rules, 2020</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              {/* STATUTORY HIGHLIGHT BOX */}
              <div className="p-4 rounded-xl bg-amber-500/10 border-2 border-[#F5A623] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#0F1A3C] dark:text-[#F5A623] uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-[#F5A623]" />
                  Statutory Rule 6(4) Guarantee:
                </div>
                <p className="text-xs font-bold text-[#0F1A3C] dark:text-neutral-200 leading-relaxed">
                  In strict compliance with Rule 6(4) of the Consumer Protection (E-Commerce) Rules, 2020: <strong>ALIKE ND does NOT impose any cancellation charges or penalties on a consumer who chooses to cancel an order, unless equivalent cancellation charges are contractually borne and paid by ALIKE ND in the event that the platform or merchant unilaterally cancels an accepted order without consumer consent.</strong>
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-[#0F1A3C] dark:text-white uppercase tracking-wider">
                  Cancellation Eligibility Windows:
                </h4>
                <ul className="list-disc list-inside space-y-1 text-neutral-600 dark:text-neutral-400">
                  <li><strong>Standard Marketplace Orders:</strong> Can be canceled freely by the consumer at any point prior to the shipment status transitioning to "Dispatched / Out for Delivery" via the Order Details screen.</li>
                  <li><strong>Quick-Commerce & Food Preparation Orders:</strong> Can be canceled within 60 seconds of order placement or prior to the merchant kitchen/store accepting the ticket for cooking or packing.</li>
                  <li><strong>Prepaid Cancellations:</strong> 100% of the transaction amount is refunded immediately without any deduction or handling fees.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 3: Return Window & Eligibility */}
          <section id="return-eligibility" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                <RotateCcw className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  3. Return Window & Eligibility Criteria
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Standard 7-Day Window [PLACEHOLDER — ADJUSTABLE BY CATEGORY]</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                Customers are entitled to initiate a return request within the designated return window specified on the product description page at the time of purchase:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Lifestyle, Apparel & Shoes:</div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">7 Days from Delivery</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Must be unworn, unwashed, with original brand tags attached and undamaged box packaging.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Electronics & Gadgets:</div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">7 Days Replacement</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Includes replacement in case of manufacturing defects or hardware malfunction upon verification.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850 space-y-1">
                  <div className="font-bold text-[#0F1A3C] dark:text-[#F5A623]">Luxury & Timepieces:</div>
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">48 Hours Notice</div>
                  <p className="text-neutral-600 dark:text-neutral-400">Requires intact serialized security holographic seal and unaltered certificate of authenticity.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-500">
                <strong>Important Note:</strong> Return pickup is free of cost for defective, incorrect, or transit-damaged items. For buyer remorse returns on selected bulk items, nominal reverse logistics fees may apply if clearly disclosed prior to checkout.
              </div>
            </div>
          </section>

          {/* SECTION 4: Non-Returnable Categories */}
          <section id="non-returnable" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  4. Non-Returnable Item Categories
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Health, Hygiene & Perishable Safeguards</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <p>
                In alignment with hygiene standards and product safety guidelines, the following categories are strictly <strong>non-returnable</strong> once successfully delivered, unless received in a damaged, expired, or spoiled condition:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F1A3C] dark:text-white">Perishable Foods & Prepared Meals:</span>
                    <p className="text-neutral-600 dark:text-neutral-400">Fresh dairy, fresh produce, restaurant meals, hot kitchen foods, and temperature-sensitive baked confectioneries.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F1A3C] dark:text-white">Opened Personal Care & Cosmetics:</span>
                    <p className="text-neutral-600 dark:text-neutral-400">Perfumes, moisturizers, skincare serums, lipsticks, and intimate hygiene products with broken protective foil seals.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F1A3C] dark:text-white">Intimate Apparel & Swimwear:</span>
                    <p className="text-neutral-600 dark:text-neutral-400">Undergarments, lingerie, socks, and face masks due to statutory health and sanitation regulations.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-800 flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#0F1A3C] dark:text-white">Customized & Engraved Articles:</span>
                    <p className="text-neutral-600 dark:text-neutral-400">Articles customized with bespoke monograms, personal name engravings, or tailored sizing.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5: Refund Methods & Timelines */}
          <section id="refund-timeline" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-500/30">
                <CreditCard className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  5. Refund Processing Timeline & Disbursement Methods
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Fast Reversal Protocols & ALIKE ND Wallet Option</p>
              </div>
            </div>

            <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
              <p>
                Once returned merchandise arrives at the merchant atelier or fulfillment hub and clears the physical quality inspection check (typically completed within 24 to 48 hours), refunds are triggered automatically according to the following channels:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-neutral-200 dark:border-neutral-750 rounded-xl overflow-hidden">
                  <thead className="bg-[#0F1A3C] text-white uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Original Payment Mode</th>
                      <th className="p-3">Refund Destination</th>
                      <th className="p-3 text-right">Settlement Timeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    <tr className="bg-white dark:bg-neutral-900">
                      <td className="p-3 font-semibold text-[#0F1A3C] dark:text-white">UPI (PhonePe, GPay, Paytm)</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">Direct credit to linked Bank VPA</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">24 to 48 Hours</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-850">
                      <td className="p-3 font-semibold text-[#0F1A3C] dark:text-white">Credit / Debit Card</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">Original Issuing Card Account</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">3 to 7 Banking Days</td>
                    </tr>
                    <tr className="bg-white dark:bg-neutral-900">
                      <td className="p-3 font-semibold text-[#0F1A3C] dark:text-white">Net Banking (IMPS / NEFT)</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">Source Bank Account</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">3 to 5 Banking Days</td>
                    </tr>
                    <tr className="bg-neutral-50 dark:bg-neutral-850">
                      <td className="p-3 font-semibold text-[#0F1A3C] dark:text-white">Cash on Delivery (COD)</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">NEFT Bank Transfer or ALIKE ND Wallet</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-600">2 to 4 Business Days</td>
                    </tr>
                    <tr className="bg-amber-50/50 dark:bg-neutral-900 border-t-2 border-[#F5A623]/30">
                      <td className="p-3 font-black text-[#0F1A3C] dark:text-[#F5A623]">ALIKE ND Wallet Credit (Optional)</td>
                      <td className="p-3 text-neutral-600 dark:text-neutral-400">Instant In-App Wallet Credit</td>
                      <td className="p-3 text-right font-mono font-black text-[#F5A623]">Instant (Real-Time)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* SECTION 6: How to Initiate */}
          <section id="how-to-initiate" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#F5A623] border border-[#F5A623]/30">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  6. Step-by-Step Guide: How to Initiate a Return or Exchange
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Seamless In-App Workflow</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
              <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                <li>
                  <strong className="text-[#0F1A3C] dark:text-white">Navigate to Orders:</strong> Click on your Profile icon or tap <em>"Orders"</em> in the header navigation bar to open your active purchase history.
                </li>
                <li>
                  <strong className="text-[#0F1A3C] dark:text-white">Select the Delivered Item:</strong> Locate the specific order and click <em>"Return / Exchange Item"</em>.
                </li>
                <li>
                  <strong className="text-[#0F1A3C] dark:text-white">Provide Reason & Photos:</strong> Select the relevant reason (e.g. size mismatch, manufacturing defect, damaged box) and upload 1 to 2 clear photographs of the product and serial tags.
                </li>
                <li>
                  <strong className="text-[#0F1A3C] dark:text-white">Schedule Free Doorstep Pickup:</strong> Confirm your pickup address and preferred time slot. Our courier will inspect the outer condition and issue a digital handover receipt.
                </li>
                <li>
                  <strong className="text-[#0F1A3C] dark:text-white">Instant Tracking:</strong> Track the transit and inspection status live from your returns ticket.
                </li>
              </ol>
            </div>
          </section>

          {/* SECTION 7: Damaged / Transit Issues */}
          <section id="damaged-transit" className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <span className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-[#0F1A3C] dark:text-white uppercase tracking-wide">
                  7. Damaged, Defective or Transit-Lost Consignments
                </h2>
                <p className="text-xs text-neutral-500 font-medium">Prompt Re-Dispatch & 24-Hour Notice Guideline</p>
              </div>
            </div>

            <div className="space-y-3 text-neutral-700 dark:text-neutral-300 text-xs">
              <p>
                If your parcel arrives with visibly tampered outer packaging or broken security seals, we recommend refusing delivery and noting the observation on the courier docket.
              </p>
              <p>
                In the event that an item is discovered damaged or missing upon unboxing, please report the incident within <strong>24 hours</strong> of delivery through our in-app Messenger or by emailing <a href="mailto:grievance@alikend.com" className="text-[#F5A623] font-bold hover:underline font-mono">grievance@alikend.com [PLACEHOLDER — REPLACE WITH ACTUAL DETAILS]</a>. An expedited replacement or full refund will be processed promptly upon courier telemetry verification.
              </p>
            </div>
          </section>

        </div>

        {/* Bottom CTA / Return Button */}
        <div className="text-center pt-4 pb-8 space-y-3">
          <p className="text-xs text-neutral-500">
            Have questions regarding a specific order or refund?
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('messenger')}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:border-[#F5A623] hover:text-[#0F1A3C] transition-colors cursor-pointer"
            >
              Contact Support Desk →
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

export default ReturnRefundPolicy;
