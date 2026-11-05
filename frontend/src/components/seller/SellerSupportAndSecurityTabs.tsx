import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Star,
  Headphones,
  MessageSquare,
  Send,
  Shield,
  Lock,
  Bell,
  Mail,
  Phone,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Product, SellerProfile } from '../../types';
import { sellerApi } from '../../services/sellerApi';
import { SellerMenuSectionId } from './SellerCenterSidebar';
import { DarazUserManagementManager } from './DarazUserManagementManager';
import { DarazChatSettingsManager } from './DarazChatSettingsManager';

interface SellerSupportAndSecurityProps {
  activeSection: SellerMenuSectionId;
  onSelectSection: (sec: SellerMenuSectionId) => void;
  sellerProfile: SellerProfile;
  products: Product[];
  orders: any[];
  returnsList: any[];
  onReloadReturns: () => Promise<void>;
  onProfileUpdated: (profile: SellerProfile) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const SellerSupportAndSecurityTabs: React.FC<SellerSupportAndSecurityProps> = ({
  activeSection,
  onSelectSection,
  sellerProfile,
  products,
  orders,
  returnsList,
  onReloadReturns,
  onProfileUpdated,
  showToast,
  isLightMode = false,
}) => {
  // Return Inspection State
  const [selectedReturnId, setSelectedReturnId] = useState<string | null>(null);
  const [inspectionResult, setInspectionResult] = useState<'resalable' | 'damaged' | 'defective'>('resalable');
  const [sellerReturnNote, setSellerReturnNote] = useState('');
  const [updatingReturn, setUpdatingReturn] = useState(false);

  // Support Tickets State
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Seller Account & Payouts');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Normal' | 'High' | 'Urgent'>('Normal');
  const [ticketDescription, setTicketDescription] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Security & Account State
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Personal Info Form
  const [ownerNameInput, setOwnerNameInput] = useState(sellerProfile.ownerName || '');
  const [businessAddressInput, setBusinessAddressInput] = useState(sellerProfile.businessAddress || '');
  const [panInput, setPanInput] = useState(sellerProfile.panNumber || '');
  const [gstinInput, setGstinInput] = useState(sellerProfile.gstin || '');
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);

  // Email OTP Verification
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devOtpPreview, setDevOtpPreview] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Notification Preferences
  const [notifPrefs, setNotifPrefs] = useState({
    orderAlerts: sellerProfile.notificationPreferences?.orderAlerts ?? true,
    payoutAlerts: sellerProfile.notificationPreferences?.payoutAlerts ?? true,
    verificationAlerts: sellerProfile.notificationPreferences?.verificationAlerts ?? true,
    lowStockAlerts: sellerProfile.notificationPreferences?.lowStockAlerts ?? true,
    marketingEmails: sellerProfile.notificationPreferences?.marketingEmails ?? false,
    securityAlerts: sellerProfile.notificationPreferences?.securityAlerts ?? true,
  });
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

  // Seller Review Response State
  const [replyingProductId, setReplyingProductId] = useState<string | null>(null);
  const [reviewBuyerName, setReviewBuyerName] = useState('Verified Buyer');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Authentic packaging and fast dispatch.');
  const [sellerResponseText, setSellerResponseText] = useState('');
  const [submittingReviewReply, setSubmittingReviewReply] = useState(false);

  // Store Staff RBAC State
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'catalog_editor' | 'order_manager' | 'finance_viewer' | 'support_agent'>('order_manager');
  const [invitingStaff, setInvitingStaff] = useState(false);

  // Account Closure Request State
  const [closureReason, setClosureReason] = useState('');
  const [requestingClosure, setRequestingClosure] = useState(false);

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await sellerApi.getSupportTickets();
      if (res.tickets) setTickets(res.tickets);
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadSecurity = async () => {
    try {
      setLoadingSecurity(true);
      const res = await sellerApi.getSecurityActivity();
      if (res.logs) setSecurityLogs(res.logs);
    } catch {
      // ignore
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    if (
      ['customer_messages', 'order_chat', 'support_tickets', 'complaints_disputes', 'contact_admin'].includes(
        activeSection
      )
    ) {
      loadTickets();
    }
    if (activeSection === 'security_activity') {
      loadSecurity();
    }
  }, [activeSection]);

  const cardClass = `rounded-2xl border p-5 ${
    isLightMode
      ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
      : 'bg-neutral-900/90 border-neutral-800 text-white'
  }`;

  // ==========================================
  // 1. RETURN & REFUND REQUESTS
  // ==========================================
  if (activeSection === 'return_requests') {
    const handleUpdateReturn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedReturnId) return;
      try {
        setUpdatingReturn(true);
        await sellerApi.updateSellerReturn(selectedReturnId, {
          inspectionResult,
          sellerNote: sellerReturnNote,
          status: 'Inspection in Progress',
        });
        await onReloadReturns();
        setSelectedReturnId(null);
        setSellerReturnNote('');
        showToast('Return inspection note recorded and synchronized with Admin Panel.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to update return request', 'error');
      } finally {
        setUpdatingReturn(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-neutral-800">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#F5A623]" />
                <span>Return, Replacement & Refund Requests ({returnsList.length})</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Inspect returned items and record your quality inspection findings. Final refund disbursement is protected by Admin oversight to prevent duplicate refunds.
              </p>
            </div>
            <button
              type="button"
              onClick={onReloadReturns}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {returnsList.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No return or refund requests have been filed for your store orders.
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {returnsList.map((ret: any) => {
                const rid = ret.returnId || ret._id;
                return (
                  <div
                    key={String(rid)}
                    className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-xs text-[#F5A623]">
                          {ret.returnId || rid}
                        </span>
                        <span className="text-xs text-neutral-400 ml-2">
                          · Order #{ret.orderNumber} · Buyer: {ret.customerName}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{ret.productName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-amber-400">{ret.status}</span>
                        <p className="text-[11px] font-mono text-neutral-400">
                          Refund Amount: ₹{Number(ret.refundAmount || ret.unitPrice || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-300 bg-neutral-900/80 p-3 rounded-lg border border-neutral-800/80">
                      <p>
                        <strong>Reason:</strong> {ret.returnReason} ({ret.requestedResolution || 'refund'})
                      </p>
                      {ret.customerDescription && (
                        <p className="text-neutral-400 mt-1">"{ret.customerDescription}"</p>
                      )}
                      {ret.inspectionNotes && (
                        <p className="text-emerald-400 mt-1">
                          <strong>Seller Inspection Note:</strong> {ret.inspectionNotes} (
                          {ret.inspectionResult || 'pending'})
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setSelectedReturnId(selectedReturnId === rid ? null : rid)}
                        className="px-3 py-1.5 rounded-lg bg-[#F5A623]/15 hover:bg-[#F5A623] text-[#F5A623] hover:text-black text-xs font-bold transition-all cursor-pointer"
                      >
                        {selectedReturnId === rid ? 'Cancel Inspection' : 'Record Return Inspection'}
                      </button>
                    </div>

                    {selectedReturnId === rid && (
                      <form
                        onSubmit={handleUpdateReturn}
                        className="pt-3 border-t border-neutral-800 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                              Physical Inspection Finding
                            </label>
                            <select
                              value={inspectionResult}
                              onChange={(e) => setInspectionResult(e.target.value as any)}
                              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                            >
                              <option value="resalable">Intact & Resalable Condition</option>
                              <option value="defective">Manufacturing Defect Confirmed</option>
                              <option value="damaged">Damaged in Transit / Customer Damage</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                              Inspection Note for Admin Refund Team
                            </label>
                            <input
                              type="text"
                              required
                              value={sellerReturnNote}
                              onChange={(e) => setSellerReturnNote(e.target.value)}
                              placeholder="Seal intact, original box verified..."
                              className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs text-white"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={updatingReturn}
                          className="px-4 py-2 rounded-xl bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
                        >
                          {updatingReturn ? 'Saving...' : 'Submit Inspection Finding'}
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. PRODUCT REVIEWS
  // ==========================================
  if (activeSection === 'product_reviews') {
    const avgRating =
      products.length > 0
        ? (
            products.reduce((sum, p) => sum + (Number(p.rating) || 4.8), 0) / products.length
          ).toFixed(2)
        : '4.80';

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">
              Average Store Rating
            </span>
            <p className="text-2xl font-black font-mono text-[#F5A623] mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-[#F5A623] text-[#F5A623]" />
              <span>{avgRating} / 5.0</span>
            </p>
          </div>
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">
              Total Reviewed Products
            </span>
            <p className="text-2xl font-black font-mono mt-1">{products.length}</p>
          </div>
          <div className={cardClass}>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase">
              Total Verified Reviews
            </span>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {products.reduce((sum, p) => sum + (Number(p.reviewsCount) || 1), 0)}
            </p>
          </div>
        </div>

        <div className={cardClass}>
          <h3 className="text-base font-bold mb-3">Product Rating & Review Summary</h3>
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={String(p._id || p.id)}
                className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <p className="text-[11px] text-neutral-400">{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{(p.rating || 4.8).toFixed(1)}</span>
                  <span className="text-neutral-400">({p.reviewsCount || 1} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. CUSTOMER CARE & SUPPORT TICKETS
  // ==========================================
  if (
    [
      'customer_messages',
      'order_chat',
      'support_tickets',
      'complaints_disputes',
      'contact_admin',
    ].includes(activeSection)
  ) {
    const handleCreateTicket = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!ticketSubject.trim() || !ticketDescription.trim()) {
        showToast('Please provide both subject and description.', 'warning');
        return;
      }
      try {
        setCreatingTicket(true);
        const res = await sellerApi.createSupportTicket({
          subject: ticketSubject,
          description: ticketDescription,
          category: ticketCategory,
          priority: ticketPriority,
        });
        setTicketSubject('');
        setTicketDescription('');
        await loadTickets();
        showToast(res.message || 'Support ticket submitted to Admin Seller Relations!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to submit support ticket', 'error');
      } finally {
        setCreatingTicket(false);
      }
    };

    const handleSendTicketReply = async (ticketId: string) => {
      if (!replyMessage.trim()) return;
      try {
        setSendingReply(true);
        await sellerApi.replySupportTicket(ticketId, replyMessage);
        setReplyMessage('');
        setReplyTicketId(null);
        await loadTickets();
        showToast('Reply sent to Admin Seller Relations.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Failed to send reply', 'error');
      } finally {
        setSendingReply(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Sub-nav */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'customer_messages', label: 'Customer Messages' },
            { id: 'order_chat', label: 'Order-Related Chat' },
            { id: 'support_tickets', label: 'Support Tickets' },
            { id: 'complaints_disputes', label: 'Complaints & Disputes' },
            { id: 'contact_admin', label: 'Contact Admin / Customer Care' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSection(tab.id as SellerMenuSectionId)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'bg-[#F5A623] text-black'
                  : isLightMode
                  ? 'bg-white border border-slate-200 text-slate-600'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(activeSection === 'customer_messages' || activeSection === 'order_chat') && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <DarazChatSettingsManager
              theme="light"
              initialTab={activeSection === 'order_chat' ? 'auto_reply' : 'user_management'}
              adminEmail={sellerProfile.email || 'mdhabiburmollah635@gmail.com'}
              showToast={showToast}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Raise Ticket / Contact Admin Form */}
          <form onSubmit={handleCreateTicket} className={`lg:col-span-5 space-y-4 ${cardClass}`}>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Headphones className="w-4 h-4 text-[#F5A623]" />
              <span>Contact Admin / Open Seller Support Ticket</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Tickets submitted here synchronize directly with the Admin Panel Seller Relations & Dispute Resolution desk.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              >
                <option value="Seller Account & Payouts">Seller Account & Payouts</option>
                <option value="Order Fulfillment & Courier">Order Fulfillment & Courier</option>
                <option value="Return / Refund Dispute">Return / Refund Dispute</option>
                <option value="Product Moderation Appeal">Product Moderation Appeal</option>
                <option value="NID & Face Verification Help">NID & Face Verification Help</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Priority
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="Order #ORD-948210 courier handover inquiry..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Message / Dispute Details *
              </label>
              <textarea
                rows={4}
                required
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                placeholder="Describe the order ID, product ID, or account issue in detail..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={creatingTicket}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs cursor-pointer"
            >
              {creatingTicket ? 'Submitting Ticket...' : 'Submit Ticket to Admin Desk'}
            </button>
          </form>

          {/* Active Tickets & Order Inquiries */}
          <div className={`lg:col-span-7 space-y-4 ${cardClass}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">
                Support Tickets, Order Chat & Dispute Threads ({tickets.length})
              </h3>
              <button
                type="button"
                onClick={loadTickets}
                className="text-xs text-[#F5A623] hover:underline font-bold cursor-pointer"
              >
                Refresh
              </button>
            </div>

            {loadingTickets ? (
              <div className="py-12 text-center text-xs text-neutral-400">Loading support threads...</div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                No support tickets or customer disputes open. Use the form on the left if you need assistance from Admin Seller Relations.
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((t: any) => (
                  <div
                    key={t.ticketId || t._id}
                    className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#F5A623]">
                          {t.ticketId}
                        </span>
                        <span className="text-xs text-neutral-400 ml-2">· {t.category}</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{t.subject}</h4>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">{t.status}</span>
                    </div>

                    {Array.isArray(t.replies) && t.replies.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                        {t.replies.map((rep: any) => (
                          <div
                            key={rep.id}
                            className={`p-2.5 rounded-lg text-xs ${
                              rep.authorType === 'staff'
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
                                : 'bg-neutral-900 text-neutral-300'
                            }`}
                          >
                            <div className="flex justify-between text-[10px] text-neutral-400 mb-1">
                              <span className="font-bold">{rep.authorName}</span>
                              <span>{new Date(rep.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                            <p>{rep.message}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={replyTicketId === t.ticketId ? replyMessage : ''}
                        onFocus={() => setReplyTicketId(t.ticketId)}
                        onChange={(e) => {
                          setReplyTicketId(t.ticketId);
                          setReplyMessage(e.target.value);
                        }}
                        placeholder="Write a follow-up reply..."
                        className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white"
                      />
                      <button
                        type="button"
                        disabled={sendingReply || replyTicketId !== t.ticketId || !replyMessage.trim()}
                        onClick={() => handleSendTicketReply(t.ticketId)}
                        className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 4. ACCOUNT & SECURITY MODULE
  // ==========================================
  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPersonalInfo(true);
      const res = await sellerApi.updateProfile({
        ownerName: ownerNameInput,
        businessAddress: businessAddressInput,
        panNumber: panInput,
        gstin: gstinInput,
      });
      if (res.seller) onProfileUpdated(res.seller);
      showToast('Personal & tax profile updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update personal information', 'error');
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'warning');
      return;
    }
    try {
      setChangingPassword(true);
      const res = await sellerApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast(res.message || 'Password updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveNotifPrefs = async () => {
    try {
      setSavingNotifPrefs(true);
      const res = await sellerApi.updateProfile({
        notificationPreferences: notifPrefs,
      } as any);
      if (res.seller) onProfileUpdated(res.seller);
      showToast('Notification preferences saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save preferences', 'error');
    } finally {
      setSavingNotifPrefs(false);
    }
  };

  const handleSendEmailOtp = async () => {
    try {
      const res = await sellerApi.sendVerificationOtp();
      setOtpSent(true);
      if (res.devOtpPreview) setDevOtpPreview(res.devOtpPreview);
      showToast(res.message || 'Verification code sent to your email.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP', 'error');
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setVerifyingOtp(true);
      const res = await sellerApi.verifyEmail(otpCode);
      const me = await sellerApi.getMe();
      if (me.seller) onProfileUpdated(me.seller);
      setOtpSent(false);
      showToast(res.message || 'Email verified!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'personal_info', label: 'Personal Information' },
          { id: 'email_mobile', label: 'Email & Mobile Number' },
          { id: 'change_password', label: 'Change Password' },
          { id: 'security_activity', label: 'Login & Security Activity' },
          { id: 'notification_preferences', label: 'Notification Preferences' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectSection(tab.id as SellerMenuSectionId)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#F5A623] text-black'
                : isLightMode
                ? 'bg-white border border-slate-200 text-slate-600'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSection === 'personal_info' && (
        <form onSubmit={handleSavePersonalInfo} className={`max-w-2xl space-y-4 ${cardClass}`}>
          <h3 className="text-base font-bold">Personal & Tax Compliance Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Full Legal Owner Name
              </label>
              <input
                type="text"
                required
                value={ownerNameInput}
                onChange={(e) => setOwnerNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                Seller Account ID
              </label>
              <input
                type="text"
                disabled
                value={sellerProfile._id}
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950/50 border border-neutral-800 text-xs font-mono text-neutral-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={panInput}
                onChange={(e) => setPanInput(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                GSTIN (15-Character)
              </label>
              <input
                type="text"
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value.toUpperCase())}
                placeholder="07ABCDE1234F1Z5"
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-white uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
              Registered Business Address
            </label>
            <textarea
              rows={2}
              value={businessAddressInput}
              onChange={(e) => setBusinessAddressInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            disabled={savingPersonalInfo}
            className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs cursor-pointer"
          >
            {savingPersonalInfo ? 'Saving...' : 'Save Personal Information'}
          </button>
        </form>
      )}

      {activeSection === 'email_mobile' && (
        <div className={`max-w-2xl space-y-4 ${cardClass}`}>
          <h3 className="text-base font-bold">Registered Email & Mobile Credentials</h3>
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-bold">Email Address</span>
              <p className="text-sm font-bold text-white mt-0.5">{sellerProfile.email}</p>
            </div>
            {sellerProfile.emailVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                className="px-3 py-1.5 rounded-lg bg-[#F5A623] text-black font-bold text-xs cursor-pointer"
              >
                Send Verification OTP
              </button>
            )}
          </div>

          {otpSent && !sellerProfile.emailVerified && (
            <form onSubmit={handleVerifyEmailOtp} className="p-4 rounded-xl bg-neutral-950 border border-amber-500/40 space-y-3">
              {devOtpPreview && (
                <p className="text-xs font-mono text-amber-300">
                  Sandbox OTP Preview: <strong>{devOtpPreview}</strong>
                </p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white"
                />
                <button
                  type="submit"
                  disabled={verifyingOtp}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold text-xs cursor-pointer"
                >
                  {verifyingOtp ? 'Verifying...' : 'Confirm OTP'}
                </button>
              </div>
            </form>
          )}

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase font-bold">Mobile Number</span>
              <p className="text-sm font-bold font-mono text-white mt-0.5">
                {sellerProfile.mobileNumber}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Active for Login
            </span>
          </div>
        </div>
      )}

      {activeSection === 'change_password' && (
        <form onSubmit={handlePasswordChange} className={`max-w-lg space-y-4 ${cardClass}`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F5A623]" />
            <span>Change Seller Account Password</span>
          </h3>
          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
              New Password (min. 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs cursor-pointer"
          >
            {changingPassword ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}

      {activeSection === 'security_activity' && (
        <div className="space-y-6">
          <div className={cardClass}>
            <h3 className="text-base font-bold mb-1">Login & Security Audit Activity</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Real authentication and verification events recorded for {sellerProfile.email}.
            </p>
            {loadingSecurity ? (
              <div className="py-10 text-center text-xs text-neutral-400">Loading security activity...</div>
            ) : securityLogs.length === 0 ? (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                Active session verified for <strong>{sellerProfile.email}</strong>.
              </div>
            ) : (
              <div className="space-y-2.5">
                {securityLogs.map((log: any, idx: number) => (
                  <div
                    key={log._id || idx}
                    className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{log.eventType || 'Security Event'}</span>
                      <p className="text-neutral-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <div className="text-right font-mono text-[11px] text-neutral-400 shrink-0">
                      <div>{log.ipAddress || 'Verified IP'}</div>
                      <div>{new Date(log.timestamp || log.createdAt || Date.now()).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daraz-Inspired Sub-Account and RBAC Permission System */}
          <div className={cardClass}>
            <DarazUserManagementManager
              theme={isLightMode ? 'light' : 'dark'}
              sellerProfile={sellerProfile}
              onNavigateBreadcrumb={(target) => {
                if (target === 'home') onSelectSection('overview');
                else onSelectSection('settings_users');
              }}
              showToast={showToast}
            />
          </div>

          {/* Store Staff Role-Based Access Control (RBAC) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!staffName.trim() || !staffEmail.trim()) return;
                try {
                  setInvitingStaff(true);
                  const res = await sellerApi.inviteStaffMember({
                    name: staffName.trim(),
                    email: staffEmail.trim(),
                    role: staffRole,
                  });
                  const me = await sellerApi.getMe();
                  if (me.seller) onProfileUpdated(me.seller);
                  setStaffName('');
                  setStaffEmail('');
                  showToast(res.message || 'Staff member invited with role permissions!', 'success');
                } catch (err: any) {
                  showToast(err.message || 'Failed to invite staff member', 'error');
                } finally {
                  setInvitingStaff(false);
                }
              }}
              className={`lg:col-span-5 space-y-3 ${cardClass}`}
            >
              <h3 className="text-base font-bold flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F5A623]" />
                <span>Invite Store Staff Member (RBAC)</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Delegate specific operational duties without sharing your master seller password.
              </p>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g., Priya Nair"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Staff Email *
                </label>
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="priya@storestaff.in"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Assigned Role & Permissions
                </label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                >
                  <option value="order_manager">Order Manager (Orders, Packing & Dispatch)</option>
                  <option value="catalog_editor">Catalog Editor (Products & Inventory Only)</option>
                  <option value="finance_viewer">Finance Viewer (Read-Only Statements)</option>
                  <option value="support_agent">Customer Support Agent (Reviews & Chat)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={invitingStaff}
                className="w-full py-2.5 rounded-xl bg-[#F5A623] text-black font-extrabold text-xs cursor-pointer"
              >
                {invitingStaff ? 'Granting Role Access...' : 'Add Store Staff Role'}
              </button>
            </form>

            <div className={`lg:col-span-7 space-y-4 ${cardClass}`}>
              <h3 className="text-base font-bold">
                Authorized Store Staff ({(sellerProfile.staffMembers || []).length})
              </h3>
              {(sellerProfile.staffMembers || []).length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No secondary staff members added yet. Only the primary store owner has access.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(sellerProfile.staffMembers || []).map((st) => (
                    <div
                      key={st.id}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{st.name}</p>
                        <p className="text-[11px] text-neutral-400">
                          {st.email} · Role:{' '}
                          <span className="text-[#F5A623] font-mono uppercase">{st.role}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await sellerApi.removeStaffMember(st.id);
                            const me = await sellerApi.getMe();
                            if (me.seller) onProfileUpdated(me.seller);
                            showToast('Staff access revoked.', 'info');
                          } catch (err: any) {
                            showToast(err.message || 'Failed to remove staff', 'error');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 text-xs font-bold cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Account Deactivation / Closure Request */}
              <div className="pt-4 border-t border-neutral-800 space-y-3">
                <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Account Deactivation / Closure Request</span>
                </h4>
                {sellerProfile.closureRequest?.requested ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                    Closure Request Status: <strong className="uppercase">{sellerProfile.closureRequest.status}</strong> — Reason: "{sellerProfile.closureRequest.reason}"
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={closureReason}
                      onChange={(e) => setClosureReason(e.target.value)}
                      placeholder="Reason for requesting store account closure..."
                      className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-white"
                    />
                    <button
                      type="button"
                      disabled={requestingClosure || !closureReason.trim()}
                      onClick={async () => {
                        try {
                          setRequestingClosure(true);
                          const res = await sellerApi.requestAccountClosure(closureReason.trim());
                          const me = await sellerApi.getMe();
                          if (me.seller) onProfileUpdated(me.seller);
                          setClosureReason('');
                          showToast(res.message || 'Closure request sent to Admin.', 'info');
                        } catch (err: any) {
                          showToast(err.message || 'Failed to request closure', 'error');
                        } finally {
                          setRequestingClosure(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      {requestingClosure ? 'Submitting...' : 'Request Closure'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'notification_preferences' && (
        <div className={`max-w-xl space-y-4 ${cardClass}`}>
          <h3 className="text-base font-bold">Notification & Alert Preferences</h3>
          <div className="space-y-3">
            {[
              { key: 'orderAlerts', label: 'New Order & Dispatch SLA Alerts' },
              { key: 'payoutAlerts', label: 'Payout & Withdrawal Settlement Updates' },
              { key: 'verificationAlerts', label: 'NID & Face Verification Admin Review Decisions' },
              { key: 'lowStockAlerts', label: 'Low Stock & Out-of-Stock Warnings' },
              { key: 'securityAlerts', label: 'Login & Password Security Alerts' },
              { key: 'marketingEmails', label: 'Platform Campaign & Flash Deal Invitations' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800 cursor-pointer"
              >
                <span className="text-xs font-semibold text-neutral-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={Boolean((notifPrefs as any)[item.key])}
                  onChange={(e) =>
                    setNotifPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#F5A623]"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            disabled={savingNotifPrefs}
            onClick={handleSaveNotifPrefs}
            className="px-5 py-2.5 rounded-xl bg-[#F5A623] hover:bg-[#e09612] text-black font-extrabold text-xs cursor-pointer"
          >
            {savingNotifPrefs ? 'Saving...' : 'Save Notification Preferences'}
          </button>
        </div>
      )}
    </div>
  );
};
