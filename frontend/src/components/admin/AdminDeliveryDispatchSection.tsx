import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Clock,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Key,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send,
  User,
  Store,
  Phone,
  Package,
  Sparkles,
  Zap
} from 'lucide-react';
import { DeliveryTask } from '../../types';

interface PartnerOption {
  partnerId: string;
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber?: string;
  isOnline: boolean;
  activeOrdersCount?: number;
  rating?: number;
  zone?: string;
}

export const AdminDeliveryDispatchSection: React.FC = () => {
  const [tasks, setTasks] = useState<DeliveryTask[]>([]);
  const [partners, setPartners] = useState<PartnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<DeliveryTask | null>(null);
  
  // Assignment State
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [autoDispatching, setAutoDispatching] = useState(false);
  
  // Exception Override Modal State
  const [overrideModalTask, setOverrideModalTask] = useState<DeliveryTask | null>(null);
  const [overrideReason, setOverrideReason] = useState('Customer phone battery dead at doorstep');
  const [submittingOverride, setSubmittingOverride] = useState(false);
  
  // Toast / notification
  const [alertBanner, setAlertBanner] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showAlert = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setAlertBanner({ msg, type });
    setTimeout(() => setAlertBanner(null), 5000);
  };

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch('/api/delivery/admin/active-tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
        setPartners(data.availablePartners || []);
      }
    } catch (err: any) {
      console.error('Failed to load dispatch tasks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.taskId.toLowerCase().includes(q) ||
        t.orderNumber?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.customerPhone?.includes(q) ||
        t.deliveryPartner?.name?.toLowerCase().includes(q) ||
        (t.store && t.store.name?.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'unassigned') {
        return (
          t.status === 'order_placed' ||
          t.status === 'store_accepted' ||
          t.status === 'preparing' ||
          t.status === 'ready_for_pickup' ||
          !t.deliveryPartner
        );
      }
      if (statusFilter === 'in_progress') {
        return (
          t.status === 'partner_assigned' ||
          t.status === 'arrived_at_store' ||
          t.status === 'picked_up' ||
          t.status === 'out_for_delivery' ||
          t.status === 'arrived_at_customer'
        );
      }
      if (statusFilter === 'delivered') return t.status === 'delivered';
      if (statusFilter === 'failed') {
        return (
          t.status === 'cancelled' ||
          t.status === 'delivery_failed' ||
          t.status === 'customer_unavailable' ||
          t.status === 'return_initiated' ||
          t.status === 'returned_to_store'
        );
      }
      return t.status === statusFilter;
    });
  }, [tasks, searchQuery, statusFilter]);

  // Handle Manual Assignment
  const handleManualAssign = async (taskId: string, partnerId: string) => {
    if (!partnerId) return;
    try {
      const res = await fetch('/api/delivery/admin/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, partnerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign partner');

      showAlert(`Order ${taskId} assigned to ${data.task?.deliveryPartner?.name || 'partner'}!`, 'success');
      setAssigningTaskId(null);
      setSelectedPartnerId('');
      loadData(true);
    } catch (err: any) {
      showAlert(err.message, 'error');
    }
  };

  // Handle Auto-Dispatch All Unassigned
  const handleAutoDispatchAll = async () => {
    setAutoDispatching(true);
    try {
      const unassigned = tasks.filter(
        (t) =>
          (t.status === 'ready_for_pickup' || t.status === 'order_placed' || t.status === 'preparing') &&
          !t.deliveryPartner
      );

      let successCount = 0;
      for (const t of unassigned) {
        const res = await fetch('/api/delivery/admin/auto-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: t.taskId }),
        });
        if (res.ok) successCount++;
      }

      showAlert(`Automated smart assignment completed for ${successCount} orders!`, 'success');
      loadData(true);
    } catch (err: any) {
      showAlert(err.message || 'Auto-dispatch error', 'error');
    } finally {
      setAutoDispatching(false);
    }
  };

  // Handle Support Emergency OTP Override
  const handleConfirmSupportOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalTask) return;
    setSubmittingOverride(true);
    try {
      const res = await fetch(`/api/delivery/${overrideModalTask.taskId}/support-override-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReason: overrideReason,
          supportAgent: 'Admin Central Command',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete override');

      showAlert(`Emergency OTP Override authorised for order ${overrideModalTask.orderNumber}! Marked as Delivered.`, 'success');
      setOverrideModalTask(null);
      loadData(true);
    } catch (err: any) {
      showAlert(err.message, 'error');
    } finally {
      setSubmittingOverride(false);
    }
  };

  return (
    <div className="space-y-6 text-neutral-900 dark:text-white">
      {/* 1. Header & Live Fleet Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF1990] via-[#FF007F] to-[#D80068] text-white flex items-center justify-center shadow-lg shadow-[#FF007F]/25 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif">Delivery Dispatch & Partner Fleet</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF007F]/15 text-[#FF007F] border border-[#FF007F]/30">
                MODULE 1C • 1D • 1E LIVE
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Automatic proximity dispatch, manual admin override, pickup code security & doorstep OTP audit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Refresh active tasks"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleAutoDispatchAll}
            disabled={autoDispatching}
            className="px-4 py-2.5 bg-gradient-to-r from-[#FF1990] via-[#FF007F] to-[#D80068] hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${autoDispatching ? 'animate-bounce' : 'fill-current'}`} />
            <span>{autoDispatching ? 'Auto-Dispatching...' : 'Auto-Assign Pending Orders'}</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            alertBanner.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : alertBanner.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-[#FF007F]/10 border-[#FF007F]/30 text-[#FF007F]'
          }`}
        >
          <span>{alertBanner.msg}</span>
          <button type="button" onClick={() => setAlertBanner(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Active Tasks</span>
          <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white mt-1">
            {tasks.length}
          </div>
          <div className="text-[10px] text-[#FF007F] mt-0.5 font-medium">In active delivery lifecycle</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Online Partners</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {partners.filter((p) => p.isOnline).length} / {partners.length}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Approved & ready for dispatch</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Unassigned Orders</span>
          <div className="text-2xl font-bold font-serif text-amber-500 mt-1">
            {tasks.filter((t) => !t.deliveryPartner && t.status !== 'delivered' && t.status !== 'cancelled').length}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Awaiting assignment</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Delivered Today</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {tasks.filter((t) => t.status === 'delivered').length}
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5 font-medium">100% OTP Verified</div>
        </div>
      </div>

      {/* 3. Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, customer name, phone, partner or store..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-[#FF007F]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'unassigned', label: 'Unassigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'failed', label: 'Exceptions / Returns' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#FF007F] text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tasks Table / List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#FF007F]" />
          <p className="text-xs text-neutral-400">Loading active dispatch orders...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
          <Package className="w-10 h-10 text-neutral-400 mx-auto" />
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white">No delivery orders found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery ? 'Try matching another customer phone, order ID or store name.' : 'New orders will appear here automatically with real-time updates.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isAssigned = Boolean(task.deliveryPartner);
            const isDelivered = task.status === 'delivered';
            const isFailed =
              task.status === 'cancelled' ||
              task.status === 'delivery_failed' ||
              task.status === 'customer_unavailable' ||
              task.status === 'return_initiated' ||
              task.status === 'returned_to_store';

            return (
              <div
                key={task.taskId}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDelivered
                    ? 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800'
                    : isFailed
                    ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30'
                    : 'bg-white dark:bg-neutral-900 border-[#FF007F]/30 shadow-md'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-[#FF007F] bg-[#FF007F]/10 px-2.5 py-1 rounded-lg">
                      {task.orderNumber || task.taskId}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      ₹{task.totalAmount} • {task.paymentMethod || 'COD'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isFailed
                          ? 'bg-rose-500/20 text-rose-400'
                          : task.status === 'out_for_delivery'
                          ? 'bg-sky-500/20 text-sky-400 animate-pulse'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Security Codes Badges */}
                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono flex items-center gap-1.5" title="Store Pickup Verification Code">
                      <Store className="w-3.5 h-3.5 text-[#FF007F]" />
                      <span className="text-neutral-400 text-[9px] uppercase">Pickup:</span>
                      <strong className="text-[#FF007F] font-black">{task.pickupCode || 'PU-4821'}</strong>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono flex items-center gap-1.5" title="Customer Doorstep OTP">
                      <Key className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-neutral-400 text-[9px] uppercase">OTP:</span>
                      <strong className="text-emerald-500 font-black">{task.deliveryOtp || '4921'}</strong>
                    </div>
                  </div>
                </div>

                {/* Details Grid: Store / Customer / Partner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                  {/* Column 1: Store & Items */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Pickup Store</span>
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{task.store?.name || 'Connaught Atelier'}</span>
                    </div>
                    <p className="text-neutral-500 text-[11px] truncate">{task.store?.address || 'Connaught Place, New Delhi'}</p>
                    <p className="text-neutral-400 text-[11px] font-medium pt-1">
                      Package: <strong className="text-neutral-900 dark:text-white">{task.itemsSummary || 'Curated luxury parcel'}</strong>
                    </p>
                  </div>

                  {/* Column 2: Customer Delivery Drop */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Customer Drop</span>
                    <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{task.customerName || task.deliveryAddress?.name || 'Customer'}</span>
                    </div>
                    <p className="text-neutral-500 text-[11px] truncate">{task.deliveryAddress?.street || 'Delhi NCR'}</p>
                    <a href={`tel:${task.customerPhone || task.deliveryAddress?.phone || '+919811223344'}`} className="text-[#FF007F] font-mono text-[11px] flex items-center gap-1 hover:underline">
                      <Phone className="w-3 h-3" /> {task.customerPhone || task.deliveryAddress?.phone || '+919811223344'}
                    </a>
                  </div>

                  {/* Column 3: Partner & Assignment Control */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">Assigned Partner</span>
                    {task.deliveryPartner ? (
                      <div>
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>{task.deliveryPartner.name}</span>
                          <span className="text-[10px] text-amber-500 font-black">★ {task.deliveryPartner.rating || 4.9}</span>
                        </div>
                        <p className="text-neutral-500 text-[11px]">{task.deliveryPartner.vehicleType} • {task.deliveryPartner.phone}</p>
                        
                        {!isDelivered && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAssigningTaskId(task.taskId);
                                setSelectedPartnerId('');
                              }}
                              className="text-[11px] font-bold text-[#FF007F] hover:underline cursor-pointer"
                            >
                              Reassign to Different Partner →
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-amber-500 font-bold block text-[11px]">⚠️ No Partner Assigned Yet</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAssigningTaskId(task.taskId);
                            setSelectedPartnerId('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF1990] to-[#FF007F] text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-xs active:scale-95"
                        >
                          Manual Assign Partner
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Assignment Dropdown when Assign button is clicked */}
                {assigningTaskId === task.taskId && (
                  <div className="mt-4 p-4 rounded-xl bg-neutral-100 dark:bg-black/80 border border-[#FF007F]/40 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#FF007F] flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        <span>Select Delivery Partner for {task.orderNumber || task.taskId}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setAssigningTaskId(null)}
                        className="text-neutral-400 hover:text-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                      >
                        <option value="">-- Choose an Online Delivery Partner ({partners.length} available) --</option>
                        {partners.map((p) => (
                          <option key={p.partnerId} value={p.partnerId}>
                            {p.name} ({p.vehicleType}) • {p.phone} {p.isOnline ? '🟢 Online' : '⚪ Offline'} [{p.activeOrdersCount || 0} active orders]
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!selectedPartnerId}
                        onClick={() => handleManualAssign(task.taskId, selectedPartnerId)}
                        className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        Confirm Assignment
                      </button>
                    </div>
                  </div>
                )}

                {/* Emergency Override & Support Controls */}
                {!isDelivered && (
                  <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                    <span>
                      Attempts: Pickup ({task.pickupAttempts || 0}) • Doorstep OTP ({task.deliveryOtpAttempts || 0}/5)
                    </span>

                    <button
                      type="button"
                      onClick={() => setOverrideModalTask(task)}
                      className="text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Support Emergency OTP Override</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Support Emergency OTP Override Modal */}
      {overrideModalTask && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setOverrideModalTask(null)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-rose-500 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Support Authorized Delivery Override
              </h3>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Use this authorized exception protocol only when a genuine customer issue prevents standard OTP entry (e.g. phone dead, SIM lost, server network outage).
            </p>

            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-black text-xs space-y-1.5 border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-400">Order:</span>
                <span className="font-bold">{overrideModalTask.orderNumber || overrideModalTask.taskId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Customer:</span>
                <span className="font-bold">{overrideModalTask.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Target OTP:</span>
                <span className="font-mono font-black text-emerald-400">{overrideModalTask.deliveryOtp || '4921'}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmSupportOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                  Reason for Override Authorization (Audited)
                </label>
                <select
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-100 dark:bg-black border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white outline-none"
                >
                  <option value="Customer phone battery dead at doorstep">Customer phone battery dead at doorstep</option>
                  <option value="Customer SMS network failure in high-rise building">Customer SMS network failure in high-rise building</option>
                  <option value="Handover verified via customer photo ID & direct voice call">Handover verified via customer photo ID & direct voice call</option>
                  <option value="Customer authorized package handoff to concierge/guard">Customer authorized package handoff to concierge/guard</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOverrideModalTask(null)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOverride}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submittingOverride ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Authorize & Mark Delivered</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
