import React, { useRef } from 'react';
import { Printer, Download, ShieldCheck, Heart } from 'lucide-react';
import { Order } from '../types';
import Logo from './Logo';
import GlassCloseButton from './GlassCloseButton';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function InvoiceModal({ order, onClose, showToast }: InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const formattedDate = order?.date 
    ? new Date(order.date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const address = order.address || {
    name: 'Valued Customer',
    street: 'Standard Atelier Delivery Address',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
    phone: '9876543210',
  };

  const handleDownloadPdf = async () => {
    try {
      if (showToast) showToast('Generating high-resolution A4 Tax Invoice PDF...', 'info');

      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const autoTable = (autoTableModule as any).default || autoTableModule;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const invoiceNum = order.id.startsWith('INV-') ? order.id : `INV-${order.id}`;

      // 1. Top Header Banner
      doc.setFillColor(15, 26, 60); // #0F1A3C Dark Navy
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(245, 166, 35); // #F5A623 Gold
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('ALIKE-ND ATELIER', 14, 12);

      doc.setTextColor(210, 220, 240);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('ALIKE-ND Platform India Pvt Ltd. | Nariman Point, Mumbai - 400021', 14, 18);
      doc.text('GSTIN: 27AAACA1234A1ZP | PAN: AAACA1234A', 14, 23);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL TAX INVOICE', 196, 12, { align: 'right' });

      doc.setTextColor(245, 166, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`#${invoiceNum}`, 196, 18, { align: 'right' });

      doc.setTextColor(210, 220, 240);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Date: ${formattedDate} | PAID & VERIFIED`, 196, 23, { align: 'right' });

      // 2. Billing & Shipping Info Cards
      doc.setFillColor(248, 249, 252);
      doc.roundedRect(14, 33, 88, 30, 2, 2, 'F');
      doc.roundedRect(108, 33, 88, 30, 2, 2, 'F');

      doc.setTextColor(15, 26, 60);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO / DELIVERY DESTINATION:', 18, 39);
      doc.text('ORDER & PAYMENT METADATA:', 112, 39);

      doc.setTextColor(30, 30, 30);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(address.name || 'Valued Customer', 18, 45);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(address.street || 'Standard Address', 18, 50);
      doc.text(`${address.city || 'Mumbai'}, ${address.state || 'MH'} - ${address.zip || '400001'}`, 18, 55);
      doc.text(`Mobile: +91 ${address.phone || '9876543210'}`, 18, 60);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(`Payment: ${(order.paymentMethod || 'Online Verified').toUpperCase()}`, 112, 45);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text('Place of Supply: Maharashtra (27)', 112, 50);
      doc.text('Dispatch: Atelier Hub Mumbai', 112, 55);
      doc.text('Currency: Indian Rupee (INR / Rs.)', 112, 60);

      // 3. Items Table
      const orderItems = order.items && order.items.length > 0 ? order.items : [];
      const tableRows = orderItems.map((item: any, idx: number) => {
        const name = item.product?.name || item.name || 'Luxury Item';
        const sku = item.product?.id || item.product?._id || item.productId || item.id || `SKU-${idx + 1}`;
        const category = item.product?.category || item.category || 'Atelier Collection';
        const unitPrice = Number(item.product?.price ?? item.price ?? 0);
        const quantity = Number(item.quantity ?? item.qty ?? 1);
        const lineSubtotal = unitPrice * quantity;
        const lineGst = Math.round(lineSubtotal * 0.18);
        const lineTotal = lineSubtotal + lineGst;

        return [
          String(idx + 1),
          `${name}\nSKU: ${sku} | ${category}`,
          String(quantity),
          `Rs. ${unitPrice.toLocaleString('en-IN')}`,
          `Rs. ${lineGst.toLocaleString('en-IN')}`,
          `Rs. ${lineTotal.toLocaleString('en-IN')}`,
        ];
      });

      autoTable(doc, {
        startY: 68,
        head: [['#', 'Item Description', 'Qty', 'Unit Price', 'GST (18%)', 'Total']],
        body: tableRows.length > 0 ? tableRows : [['1', 'Luxury Goods Purchase', '1', `Rs. ${order.subtotal.toLocaleString('en-IN')}`, `Rs. ${order.tax.toLocaleString('en-IN')}`, `Rs. ${order.total.toLocaleString('en-IN')}`]],
        theme: 'grid',
        headStyles: {
          fillColor: [15, 26, 60],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'left',
        },
        styles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 76 },
          2: { cellWidth: 14, halign: 'center' },
          3: { cellWidth: 26, halign: 'right' },
          4: { cellWidth: 26, halign: 'right' },
          5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
      });

      // @ts-ignore - jspdf-autotable augments doc
      const finalY = ((doc as any).lastAutoTable?.finalY || 120) + 6;

      // 4. Terms & Breakdown Section
      doc.setFillColor(254, 251, 240); // Amber tint
      doc.roundedRect(14, finalY, 100, 36, 2, 2, 'F');
      doc.setDrawColor(245, 166, 35);
      doc.roundedRect(14, finalY, 100, 36, 2, 2, 'D');

      doc.setTextColor(15, 26, 60);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TERMS & AUTHENTICITY ASSURANCE:', 18, finalY + 6);

      doc.setTextColor(70, 70, 70);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('1. Goods carry 100% authenticity and quality certificates.', 18, finalY + 13);
      doc.text('2. 7-day verified luxury return & exchange guarantee.', 18, finalY + 19);
      doc.text('3. Preserves original tax invoice & unbroken security tags.', 18, finalY + 25);
      doc.text('4. Subject to Mumbai, Maharashtra Jurisdiction.', 18, finalY + 31);

      // Financial Summary on Right
      doc.setFillColor(248, 249, 252);
      doc.roundedRect(120, finalY, 76, 36, 2, 2, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.roundedRect(120, finalY, 76, 36, 2, 2, 'D');

      doc.setFontSize(7.5);
      doc.setTextColor(70, 70, 70);
      doc.text('Items Subtotal:', 124, finalY + 6);
      doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, 192, finalY + 6, { align: 'right' });

      if (order.discount > 0) {
        doc.setTextColor(20, 130, 60);
        doc.text('Coupon Discount:', 124, finalY + 11);
        doc.text(`-Rs. ${order.discount.toLocaleString('en-IN')}`, 192, finalY + 11, { align: 'right' });
      }

      doc.setTextColor(70, 70, 70);
      doc.text('GST Total (18% Included):', 124, finalY + 16);
      doc.text(`Rs. ${order.tax.toLocaleString('en-IN')}`, 192, finalY + 16, { align: 'right' });

      doc.text('Insured Delivery:', 124, finalY + 21);
      doc.text(order.delivery === 0 ? 'FREE' : `Rs. ${order.delivery.toLocaleString('en-IN')}`, 192, finalY + 21, { align: 'right' });

      // Total Paid Dark Banner
      doc.setFillColor(15, 26, 60);
      doc.rect(120, finalY + 25, 76, 11, 'F');
      doc.setTextColor(245, 166, 35);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL AMOUNT PAID:', 124, finalY + 32);
      doc.text(`Rs. ${order.total.toLocaleString('en-IN')}`, 192, finalY + 32, { align: 'right' });

      // 5. Signature Section
      const sigY = finalY + 44;
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(18, sigY + 12, 70, sigY + 12);
      doc.line(130, sigY + 12, 192, sigY + 12);
      doc.setLineDashPattern([], 0);

      doc.setTextColor(15, 26, 60);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text('For ALIKE-ND PLATFORM INC.', 18, sigY + 4);
      doc.text('CUSTOMER ACKNOWLEDGMENT', 130, sigY + 4);

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Authorized Signatory & Stamp', 18, sigY + 16);
      doc.text('Received in Good Condition', 130, sigY + 16);

      // 6. Concierge Footer
      doc.setTextColor(140, 140, 140);
      doc.setFontSize(6.5);
      doc.text('This is a computer-generated tax invoice issued by ALIKE-ND Platform Inc. under GST Rules. No physical signature required.', 105, 286, { align: 'center' });
      doc.text('Website: www.alike-nd.com | Concierge: support@alike-nd.com | Hotline: +91 1800-254-5363', 105, 290, { align: 'center' });

      // Save PDF file to client
      doc.save(`Tax_Invoice_${order.id}.pdf`);

      if (showToast) showToast(`Downloaded Tax_Invoice_${order.id}.pdf successfully!`, 'success');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      if (showToast) showToast('Failed to generate PDF invoice. Try printing instead.', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl max-w-4xl w-full h-[92vh] max-h-[92vh] flex flex-col shadow-2xl border border-solid border-[#F5A623]/50 overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Action Toolbar */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-[#0F1A3C] text-white flex justify-between items-center border-b border-solid border-neutral-800 shrink-0 z-20">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#F5A623] shrink-0" />
            <div>
              <span className="font-serif font-black tracking-wider text-xs sm:text-sm uppercase text-[#F5A623] block leading-tight">
                Official Tax Invoice
              </span>
              <span className="text-[10px] text-neutral-300 font-mono hidden sm:inline">
                Invoice #{order.id.startsWith('INV-') ? order.id : `INV-${order.id}`}
              </span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              Verified
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-neutral-700 hover:scale-105 active:scale-95"
              title="Print Invoice"
              aria-label="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 bg-[#F5A623] hover:bg-[#d98f18] text-[#0F1A3C] rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              aria-label="Download PDF Invoice"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <GlassCloseButton
              onClick={onClose}
              className="ml-1"
              size="md"
              title="Close Modal"
              aria-label="Close Modal"
            />
          </div>
        </div>

        {/* Printable Invoice Document Body with Dedicated Smooth Scroll */}
        <div 
          ref={scrollContainerRef}
          className="overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 bg-neutral-100 dark:bg-neutral-950 flex-1 min-h-0 invoice-modal-scroll"
        >
          <div
            ref={invoiceRef}
            id="printable-invoice-page"
            className="bg-white text-neutral-900 p-6 sm:p-8 md:p-10 max-w-[210mm] w-full mx-auto rounded-2xl shadow-xl border border-solid border-neutral-200 text-xs font-sans space-y-6 select-text mb-4"
          >
            {/* Header Stripe & Brand */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-solid border-[#0F1A3C] pb-6 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Logo size="md" isLightMode={true} />
                </div>
                <div className="text-[10px] text-neutral-600 leading-relaxed font-medium pt-1">
                  <p className="font-bold text-neutral-800">ALIKE-ND Platform India Pvt Ltd.</p>
                  <p>12th Floor, Express Towers, Nariman Point</p>
                  <p>Mumbai, Maharashtra — 400021</p>
                  <p className="font-bold text-[#0F1A3C]">GSTIN: 27AAACA1234A1ZP | PAN: AAACA1234A</p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <span className="inline-block px-3 py-1 bg-[#0F1A3C] text-[#F5A623] font-serif font-black text-sm uppercase tracking-wider rounded">
                  TAX INVOICE
                </span>
                <p className="font-mono font-bold text-sm text-[#0F1A3C] pt-1">
                  #{order.id.startsWith('INV-') ? order.id : `INV-${order.id}`}
                </p>
                <p className="text-neutral-600 font-medium text-[11px]">Date: <strong>{formattedDate}</strong></p>
                <p className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  ✓ PAYMENT VERIFIED
                </p>
              </div>
            </div>

            {/* Billing & Dispatch Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-neutral-50 p-4 rounded-xl border border-solid border-neutral-200">
              <div className="space-y-1">
                <p className="font-black uppercase tracking-wider text-[10px] text-[#0F1A3C]">
                  Bill To / Delivery Destination:
                </p>
                <p className="font-bold text-sm text-[#0F1A3C]">{address.name}</p>
                <p className="text-neutral-700 font-medium leading-relaxed">{address.street}</p>
                <p className="text-neutral-600">
                  {address.city}, {address.state} — {address.zip}
                </p>
                <p className="text-neutral-600 font-mono">Mobile: +91 {address.phone}</p>
              </div>

              <div className="space-y-1 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-neutral-200 pt-3 sm:pt-0 sm:pl-6">
                <p className="font-black uppercase tracking-wider text-[10px] text-[#0F1A3C]">
                  Payment Metadata:
                </p>
                <p className="font-extrabold text-[#0F1A3C] uppercase">{order.paymentMethod || 'Online Verified'}</p>
                <p className="text-neutral-600 font-medium">Place of Supply: Maharashtra (27)</p>
                <p className="text-neutral-600 font-medium">Dispatch Terminal: Atelier Hub Mumbai</p>
                <p className="text-neutral-600 font-mono text-[10px]">Currency: INR (₹)</p>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-lg border border-neutral-300">
              <table className="w-full border-collapse text-left min-w-[500px]">
                <thead>
                  <tr className="bg-[#0F1A3C] text-white uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="p-3 border-r border-neutral-700 w-10 text-center">#</th>
                    <th className="p-3 border-r border-neutral-700">Item Description</th>
                    <th className="p-3 border-r border-neutral-700 text-center w-16">Qty</th>
                    <th className="p-3 border-r border-neutral-700 text-right w-24">Unit Price</th>
                    <th className="p-3 border-r border-neutral-700 text-right w-24">GST (18%)</th>
                    <th className="p-3 text-right w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-solid divide-neutral-200">
                  {order.items.map((item: any, idx) => {
                    const name = item.product?.name || item.name || 'Luxury Item';
                    const sku = item.product?.id || item.product?._id || item.productId || item.id || `SKU-${idx + 1}`;
                    const category = item.product?.category || item.category || 'Atelier Collection';
                    const unitPrice = Number(item.product?.price ?? item.price ?? 0);
                    const quantity = Number(item.quantity ?? item.qty ?? 1);
                    const lineSubtotal = unitPrice * quantity;
                    const lineGst = Math.round(lineSubtotal * 0.18);
                    const lineTotal = lineSubtotal + lineGst;

                    return (
                      <tr key={idx} className="hover:bg-neutral-50 font-medium text-neutral-800">
                        <td className="p-3 border-r border-neutral-200 font-mono text-center">{idx + 1}</td>
                        <td className="p-3 border-r border-neutral-200">
                          <p className="font-bold text-[#0F1A3C]">{name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">
                            SKU: {String(sku).toUpperCase()} | {category}
                          </p>
                        </td>
                        <td className="p-3 border-r border-neutral-200 text-center font-extrabold font-mono">
                          {quantity}
                        </td>
                        <td className="p-3 border-r border-neutral-200 text-right font-mono">
                          ₹{unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 border-r border-neutral-200 text-right font-mono text-neutral-600">
                          ₹{lineGst.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#0F1A3C]">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Summary Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
              <div className="flex-1 space-y-2 text-[11px] text-neutral-600 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                <p className="font-bold text-[#0F1A3C] uppercase text-[10px] tracking-wider">
                  Terms & Authenticity Assurance:
                </p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li>Goods once sold carry 100% authenticity certificates.</li>
                  <li>In case of exchange, preserve original tax invoice & intact tag.</li>
                  <li>Subject to Mumbai Jurisdiction.</li>
                </ul>
              </div>

              <div className="w-full sm:w-72 bg-neutral-50 p-4 rounded-xl border border-solid border-neutral-300 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount:</span>
                    <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600">
                  <span>GST Total (18% Included):</span>
                  <span className="font-mono font-bold">₹{order.tax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Insured Delivery:</span>
                  <span className="font-mono font-bold">
                    {order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}
                  </span>
                </div>
                <div className="border-t border-solid border-neutral-300 pt-2 flex justify-between items-center bg-[#0F1A3C] text-white p-2.5 rounded-lg">
                  <span className="font-extrabold uppercase text-[11px] text-[#F5A623]">Total Paid:</span>
                  <span className="font-mono font-black text-base text-[#F5A623]">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Custom Thank You Note under Invoice Bill */}
                <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-center flex items-center justify-center space-x-1.5 shadow-xs">
                  <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
                  <p className="text-[10px] font-semibold text-amber-900 leading-tight">
                    ALIKE ND te shopping korar jonno Thanks, abar asben shopping korte!
                  </p>
                </div>
              </div>
            </div>

            {/* Required Signature Section (2-Columns) */}
            <div className="pt-8 grid grid-cols-2 gap-8 border-t border-solid border-neutral-300">
              {/* Left Column: Platform Signature */}
              <div className="space-y-6 text-center sm:text-left">
                <p className="font-bold text-[10px] uppercase tracking-wider text-[#0F1A3C]">
                  For ALIKE-ND Platform Inc.
                </p>
                <div className="h-10 border-b-2 border-dashed border-neutral-400 w-48 relative flex items-end justify-center">
                  <span className="font-serif italic font-extrabold text-neutral-500 text-sm tracking-widest opacity-60">
                    AlikeND Signatory
                  </span>
                </div>
                <p className="text-[10px] font-extrabold text-neutral-600 uppercase">
                  Authorized Signatory & Stamp
                </p>
              </div>

              {/* Right Column: Customer Receipt Signature */}
              <div className="space-y-6 text-center sm:text-right flex flex-col items-end">
                <p className="font-bold text-[10px] uppercase tracking-wider text-[#0F1A3C]">
                  Customer Acknowledgment
                </p>
                <div className="h-10 border-b-2 border-dashed border-neutral-400 w-48"></div>
                <p className="text-[10px] font-extrabold text-neutral-600 uppercase">
                  Received in Good Condition
                </p>
              </div>
            </div>

            {/* Bottom System Note */}
            <div className="text-center text-[9px] text-neutral-500 border-t border-solid border-neutral-200 pt-4 space-y-0.5">
              <p className="font-medium">
                This is a computer-generated tax invoice issued by ALIKE-ND Platform Inc. No physical signature required.
              </p>
              <p className="font-mono text-neutral-400">
                Website: www.alike-nd.com | Client Concierge: support@alike-nd.com | Hotline: +91 1800-254-5363
              </p>
            </div>
          </div>

          {/* Bottom End Navigation Bar inside Scroll View */}
          <div className="max-w-[210mm] mx-auto flex items-center justify-end py-3 px-2 text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 bg-[#0F1A3C] text-white hover:bg-neutral-800 rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Save PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

