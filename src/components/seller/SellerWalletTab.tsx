import { useState, useEffect } from 'react';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  CreditCard,
  Building,
  X,
  ShieldCheck,
  Download,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { sellerApi } from '../../services/sellerApi';
import { SellerProfile } from '../../types';
import { SellerMenuSectionId } from './SellerCenterSidebar';

interface SellerWalletTabProps {
  sellerProfile: SellerProfile | null;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  activeSection?: SellerMenuSectionId;
  onSelectSection?: (sec: SellerMenuSectionId) => void;
  orders?: any[];
  returnsList?: any[];
}

export default function SellerWalletTab({
  sellerProfile,
  showToast,
  activeSection = 'sales_overview',
  onSelectSection,
  orders = [],
  returnsList = [],
}: SellerWalletTabProps) {
  const [walletBalance, setWalletBalance] = useState<number>(sellerProfile?.walletBalance ?? 28450);
  const [totalEarnings, setTotalEarnings] = useState<number>(sellerProfile?.totalEarnings ?? 142600);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<number>(sellerProfile?.pendingWithdrawals ?? 0);
  const [ledger, setLedger] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [payoutDetailsInput, setPayoutDetailsInput] = useState(
    sellerProfile?.bankAccountNumber
      ? `${sellerProfile.bankName || 'Bank'} A/C: ••••${sellerProfile.bankAccountNumber.slice(-4)} (${sellerProfile.bankIFSC || ''})`
      : 'merchant.upi@hdfcbank'
  );
  const [noteInput, setNoteInput] = useState('');
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, withRes] = await Promise.allSettled([
        sellerApi.getWallet(),
        sellerApi.getWalletWithdrawals(),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value) {
        const data = walletRes.value;
        if (data.walletBalance !== undefined) setWalletBalance(data.walletBalance);
        if (data.totalEarnings !== undefined) setTotalEarnings(data.totalEarnings);
        if (data.pendingWithdrawals !== undefined) setPendingWithdrawals(data.pendingWithdrawals);
        if (Array.isArray(data.ledger)) setLedger(data.ledger);
      }

      if (withRes.status === 'fulfilled' && withRes.value) {
        if (Array.isArray(withRes.value.withdrawals)) {
          setWithdrawals(withRes.value.withdrawals);
        }
      }
    } catch (err: any) {
      console.warn('Could not load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleDownloadStatementCsv = () => {
    const headers = ['Order Number', 'Delivered Date', 'Customer', 'Gross Sales (INR)', 'Commission (5%)', 'Net Credited (INR)', 'Status'];
    const rows = ledger.map((r) => [
      r.orderNumber,
      new Date(r.deliveredAt || r.orderDate || Date.now()).toISOString().slice(0, 10),
      `"${String(r.memberName || 'Buyer').replace(/"/g, '""')}"`,
      r.sellerGross || 0,
      r.commissionDeducted || 0,
      r.sellerPayout || 0,
      r.walletCredited ? 'Settled' : 'Pending Settlement',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(sellerProfile?.shopName || 'Seller').replace(/\s+/g, '_')}_Financial_Statement.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Financial statement CSV downloaded.', 'success');
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amountInput);
    if (isNaN(num) || num <= 0) {
      showToast('Please enter a valid payout amount.', 'error');
      return;
    }
    if (num > walletBalance) {
      showToast(`Requested amount exceeds available balance (₹${walletBalance.toLocaleString('en-IN')}).`, 'error');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const res = await sellerApi.requestWithdrawal({
        amount: num,
        payoutDetails: payoutDetailsInput.trim(),
        note: noteInput.trim(),
      });

      if (res && res.success) {
        showToast(`Withdrawal request of ₹${num.toLocaleString('en-IN')} submitted successfully!`, 'success');
        setWithdrawModalOpen(false);
        setAmountInput('');
        loadWalletData();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit withdrawal request', 'error');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const financeTabs: { id: SellerMenuSectionId; label: string }[] = [
    { id: 'sales_overview', label: 'Sales Overview' },
    { id: 'earnings', label: 'Total Earnings' },
    { id: 'available_balance', label: 'Available Balance' },
    { id: 'pending_balance', label: 'Pending Balance' },
    { id: 'payout_requests', label: 'Payout Requests' },
    { id: 'transaction_history', label: 'Transaction History' },
    { id: 'refund_deductions', label: 'Refund Deductions' },
    { id: 'financial_reports', label: 'Financial Reports' },
    { id: 'platform_commission', label: 'Platform Commission' },
  ];

  const cancelledOrRefundedOrders = orders.filter(
    (o) => o.status === 'Cancelled' || o.status === 'Rejected'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Finance Sub-Navigation Bar */}
      {onSelectSection && (
        <div className="flex items-center gap-1.5 flex-wrap bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
          {financeTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelectSection(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === t.id
                  ? 'bg-[#F5A623] text-black shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Wallet Summary Card Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 border border-amber-500/30">
                Merchant Settlement Wallet
              </span>
              <span className="text-xs text-slate-500 font-mono">T+1 Daily Cycle</span>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500 font-bold tracking-wider">Available Balance</p>
              <h1 className="text-3xl sm:text-4xl font-mono font-black text-[#F5A623] mt-0.5">
                ₹{walletBalance.toLocaleString('en-IN')}
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Net settlement credited automatically after delivered orders with transparent {sellerProfile?.commissionRate ?? 5}% platform fee deducted.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
            <button
              type="button"
              onClick={loadWalletData}
              disabled={loading}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Refresh Wallet"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleDownloadStatementCsv}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#F5A623]" />
              <span>Download Financial CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              disabled={walletBalance <= 0}
              className="flex-1 md:flex-initial px-6 py-3 bg-[#F5A623] hover:bg-[#e09612] text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
              <span>Request Payout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectSection?.('earnings')}
          className={`p-5 bg-white border rounded-2xl shadow-xs cursor-pointer transition-all ${
            activeSection === 'earnings' || activeSection === 'sales_overview'
              ? 'border-[#F5A623] ring-1 ring-[#F5A623]/30'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Lifetime Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            ₹{totalEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            Cumulative store orders fulfilled
          </p>
        </div>

        <div
          onClick={() => onSelectSection?.('pending_balance')}
          className={`p-5 bg-white border rounded-2xl shadow-xs cursor-pointer transition-all ${
            activeSection === 'pending_balance' || activeSection === 'payout_requests'
              ? 'border-[#F5A623] ring-1 ring-[#F5A623]/30'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In-Processing Payouts</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            ₹{pendingWithdrawals.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under verification by finance desk</p>
        </div>

        <div
          onClick={() => onSelectSection?.('platform_commission')}
          className="p-5 bg-white border border-slate-200 hover:border-[#F5A623]/50 rounded-2xl shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Marketplace Fee</span>
            <Percent className="w-4 h-4 text-[#FF007F]" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-2">
            {sellerProfile?.commissionRate ?? 5}.0% flat
          </div>
          <p className="text-[11px] text-[#F5A623] font-semibold mt-1">Click to open Fee Calculator →</p>
        </div>
      </div>

      {/* Dedicated View: Refund & Return Deductions */}
      {activeSection === 'refund_deductions' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>Refund & Return Deductions Ledger</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Adjustments for approved customer return requests and cancelled prepaid orders
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {returnsList.length + cancelledOrRefundedOrders.length} Records
            </span>
          </div>

          {returnsList.length === 0 && cancelledOrRefundedOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs space-y-1">
              <CheckCircle2 className="w-7 h-7 mx-auto text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800">Zero Refund Deductions!</p>
              <p>Your store currently has no RMA deductions or disputed chargebacks.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-5">Reference ID</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Reason / Customer</th>
                    <th className="p-3.5 text-right">Adjustment</th>
                    <th className="p-3.5 pr-5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {returnsList.map((ret: any, idx: number) => (
                    <tr key={ret._id || idx} className="hover:bg-slate-50">
                      <td className="p-3.5 pl-5 font-bold text-rose-600">{ret.orderNumber || ret.id || `RMA-${idx + 101}`}</td>
                      <td className="p-3.5 font-sans text-slate-700">Customer Return</td>
                      <td className="p-3.5 font-sans text-slate-600">{ret.reason || 'Defective / Size Exchange'}</td>
                      <td className="p-3.5 text-right font-bold text-rose-600">
                        -₹{Number(ret.refundAmount || ret.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 pr-5 text-center font-sans">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-700">
                          {ret.status || 'Under Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {cancelledOrRefundedOrders.map((ord: any, idx: number) => (
                    <tr key={ord.id || idx} className="hover:bg-slate-50">
                      <td className="p-3.5 pl-5 font-bold text-slate-800">{ord.id}</td>
                      <td className="p-3.5 font-sans text-slate-700">Order Cancellation</td>
                      <td className="p-3.5 font-sans text-slate-600">{ord.customer || 'Buyer'}</td>
                      <td className="p-3.5 text-right font-bold text-slate-500">
                        ₹{Number(ord.sellerTotal ?? ord.total ?? 0).toLocaleString('en-IN')} (Reversed)
                      </td>
                      <td className="p-3.5 pr-5 text-center font-sans">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/15 text-rose-600">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dedicated View: Financial Reports & Tax Statements */}
      {activeSection === 'financial_reports' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Seller Financial & GST Tax Reports Center
              </h3>
              <p className="text-xs text-slate-500">
                Export itemized order settlement ledgers, commission invoices, and payout audit statements
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadStatementCsv}
              className="px-4 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black text-xs font-extrabold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Complete CSV Ledger</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-600">Monthly Settlement Report</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">Order-Level Payout CSV</h4>
                <p className="text-slate-500 text-[11px] mt-1">
                  Full breakdown of gross order value, marketplace commission fee, and net credited amount.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadStatementCsv}
                className="w-full py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-800 cursor-pointer mt-3"
              >
                Download CSV
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600">GST Tax Summary</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">GSTR-1 Ready Sales Summary</h4>
                <p className="text-slate-500 text-[11px] mt-1">
                  HSN-wise summary of fulfilled seller orders for GST filing ({sellerProfile?.gstin || 'GSTIN Configured'}).
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadStatementCsv}
                className="w-full py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-800 cursor-pointer mt-3"
              >
                Download GST Summary
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600">Payout Audit Log</span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">Bank Remittance Advice</h4>
                <p className="text-slate-500 text-[11px] mt-1">
                  Complete log of {withdrawals.length} bank/UPI withdrawal requests and settlement timestamps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(true)}
                className="w-full py-2 rounded-lg bg-[#F5A623]/15 border border-[#F5A623]/30 hover:bg-[#F5A623]/25 font-bold text-amber-900 cursor-pointer mt-3"
              >
                New Payout Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Financial Ledger of Completed Orders */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Delivered Orders Settlement Ledger
            </h3>
            <p className="text-[11px] text-slate-500">Itemized gross order sales, fee deductions, and net payout credits</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">{ledger.length} Settlements</span>
        </div>

        {ledger.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
            <p className="font-semibold text-slate-700">No fulfilled orders settled yet.</p>
            <p className="text-[11px] text-slate-500">Delivered orders will appear here automatically with marketplace fee calculations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5 pl-5">Order #</th>
                  <th className="p-3.5">Delivered Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5 text-right">Gross Sales</th>
                  <th className="p-3.5 text-right">Fee</th>
                  <th className="p-3.5 text-right font-black">Net Credited</th>
                  <th className="p-3.5 pr-5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {ledger.map((row, i) => (
                  <tr key={row._id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 pl-5 font-bold text-[#FF007F]">{row.orderNumber}</td>
                    <td className="p-3.5 text-slate-500 font-sans text-[11px]">
                      {new Date(row.deliveredAt || row.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 font-sans font-medium text-slate-800">
                      {row.memberName}
                    </td>
                    <td className="p-3.5 text-right font-medium">₹{row.sellerGross?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right text-rose-500 font-medium">-₹{row.commissionDeducted?.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">
                      +₹{row.sellerPayout?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 pr-5 text-center font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Credited
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Payout & Withdrawal History
            </h3>
            <p className="text-[11px] text-slate-500">Track bank & UPI payout transfers from your available balance</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500">{withdrawals.length} Requests</span>
            <button
              type="button"
              onClick={() => setWithdrawModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black text-xs font-bold cursor-pointer"
            >
              + Request Payout
            </button>
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No withdrawal requests logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold border-b border-slate-200 font-sans">
                <tr>
                  <th className="p-3.5 pl-5">Date</th>
                  <th className="p-3.5">Destination Details</th>
                  <th className="p-3.5 text-right font-bold">Amount</th>
                  <th className="p-3.5 pr-5 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {withdrawals.map((w, i) => (
                  <tr key={w._id || i} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5 text-slate-500 text-[11px] font-sans">
                      {new Date(w.requestedAt || w.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3.5 font-sans font-medium text-slate-800 truncate max-w-xs">
                      {w.payoutDetails || 'Bank Transfer'}
                    </td>
                    <td className="p-3.5 text-right font-bold text-amber-600">
                      ₹{w.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 pr-5 text-center font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          w.status === 'completed' || w.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/15 text-rose-700 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
                        }`}
                      >
                        {w.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {withdrawModalOpen && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setWithdrawModalOpen(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 relative shadow-2xl space-y-4 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-amber-500 stroke-[3]" />
                <h3 className="font-bold text-sm text-slate-900">
                  Request Merchant Wallet Payout
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-600">Withdrawal Amount (₹)</label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Available: ₹{walletBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  min={100}
                  max={walletBalance}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-amber-600 font-mono font-black text-base outline-none focus:border-amber-500"
                />
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setAmountInput(String(Math.floor((walletBalance * pct) / 100)))}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-slate-100 text-[10px] font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Destination Payout Details (UPI ID / Bank A/C)
                </label>
                <input
                  type="text"
                  required
                  value={payoutDetailsInput}
                  onChange={(e) => setPayoutDetailsInput(e.target.value)}
                  placeholder="e.g. merchant@okaxis or HDFC A/C: 1234567890 (HDFC0001234)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Settlement Note (Optional)</label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Weekly batch settlement"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal}
                  className="flex-1 py-2.5 bg-[#F5A623] hover:bg-[#e09612] text-black font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submittingWithdrawal ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

