import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Wrench,
  AlertTriangle,
  FileQuestion,
  Phone,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Loader2,
  X,
  MessageSquare,
  Building,
  User,
  ShieldCheck,
  Camera
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';
import { EmergencySosModal } from './EmergencySosModal';

interface DeliverySafetyTabProps {
  partner: any;
  activeTaskId?: string;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliverySafetyTab: React.FC<DeliverySafetyTabProps> = ({
  partner,
  activeTaskId,
  showToast,
  isLightMode = false,
}) => {
  const [sosModalOpen, setSosModalOpen] = useState<boolean>(false);
  const [incidentModalOpen, setIncidentModalOpen] = useState<boolean>(false);
  const [complaintModalOpen, setComplaintModalOpen] = useState<boolean>(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState<boolean>(false);

  // Incidents
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState<boolean>(false);

  // Disputes
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loadingDisputes, setLoadingDisputes] = useState<boolean>(false);

  // Accident / Breakdown form
  const [incidentType, setIncidentType] = useState<string>('vehicle_breakdown');
  const [incidentSeverity, setIncidentSeverity] = useState<string>('medium');
  const [incidentDesc, setIncidentDesc] = useState<string>('');
  const [needMedical, setNeedMedical] = useState<boolean>(false);
  const [needReplacement, setNeedReplacement] = useState<boolean>(true);
  const [submittingIncident, setSubmittingIncident] = useState<boolean>(false);

  // Complaint form
  const [complaintTarget, setComplaintTarget] = useState<'store' | 'customer'>('store');
  const [complaintTargetName, setComplaintTargetName] = useState<string>('');
  const [complaintOrderNum, setComplaintOrderNum] = useState<string>('');
  const [complaintReason, setComplaintReason] = useState<string>('Excessive preparation delay (>25 mins)');
  const [complaintDetails, setComplaintDetails] = useState<string>('');
  const [submittingComplaint, setSubmittingComplaint] = useState<boolean>(false);

  // Dispute form
  const [disputeOrderNum, setDisputeOrderNum] = useState<string>('');
  const [disputeCategory, setDisputeCategory] = useState<string>('waiting_time_underpaid');
  const [disputeClaimedAmt, setDisputeClaimedAmt] = useState<string>('50');
  const [disputeDesc, setDisputeDesc] = useState<string>('');
  const [submittingDispute, setSubmittingDispute] = useState<boolean>(false);

  useEffect(() => {
    loadIncidents();
    loadDisputes();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoadingIncidents(true);
      const res = await deliveryPartnerApi.getIncidents();
      setIncidents(res.incidents || []);
    } catch (err: any) {
      console.warn('Failed to load incidents:', err);
    } finally {
      setLoadingIncidents(false);
    }
  };

  const loadDisputes = async () => {
    try {
      setLoadingDisputes(true);
      const res = await deliveryPartnerApi.getDisputes();
      setDisputes(res.disputes || []);
    } catch (err: any) {
      console.warn('Failed to load disputes:', err);
    } finally {
      setLoadingDisputes(false);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDesc.trim()) {
      showToast?.('Please describe what happened.', 'warning');
      return;
    }

    try {
      setSubmittingIncident(true);
      const res = await deliveryPartnerApi.reportIncident({
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDesc.trim(),
        needMedical,
        needReplacementRider: needReplacement,
      });

      showToast?.(res.message || 'Incident logged. Operations is handling.', 'success');
      setIncidentModalOpen(false);
      setIncidentDesc('');
      loadIncidents();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to report incident', 'error');
    } finally {
      setSubmittingIncident(false);
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDetails.trim()) {
      showToast?.('Please write detailed remarks.', 'warning');
      return;
    }

    try {
      setSubmittingComplaint(true);
      const res = await deliveryPartnerApi.submitComplaint({
        targetType: complaintTarget,
        targetName: complaintTargetName,
        orderNumber: complaintOrderNum,
        complaintReason,
        details: complaintDetails.trim(),
      });

      showToast?.(res.message || 'Complaint submitted for audit.', 'success');
      setComplaintModalOpen(false);
      setComplaintDetails('');
      loadIncidents();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrderNum.trim() || !disputeDesc.trim()) {
      showToast?.('Order number and dispute description are required.', 'warning');
      return;
    }

    try {
      setSubmittingDispute(true);
      const res = await deliveryPartnerApi.submitDispute({
        orderNumber: disputeOrderNum.trim(),
        category: disputeCategory,
        claimedAmount: Number(disputeClaimedAmt) || 0,
        description: disputeDesc.trim(),
      });

      showToast?.(res.message || 'Dispute submitted. Will review in 24 hours.', 'success');
      setDisputeModalOpen(false);
      setDisputeOrderNum('');
      setDisputeDesc('');
      loadDisputes();
    } catch (err: any) {
      showToast?.(err.message || 'Failed to submit dispute', 'error');
    } finally {
      setSubmittingDispute(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. High-Priority Emergency SOS Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/60 via-red-900/40 to-neutral-900 border-2 border-rose-600 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/40 animate-pulse">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-rose-400">
                  RIDER SAFETY & SOS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  24x7 Active
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">Emergency SOS Hotline</h2>
              <p className="text-xs text-neutral-300 mt-1 max-w-md">
                In distress or facing danger? Trigger the SOS button to transmit your live GPS to Central Ops & Emergency Response.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSosModalOpen(true)}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-rose-600/40 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <AlertOctagon className="w-5 h-5" />
              <span>Trigger SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Incident Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card A: Accident / Breakdown */}
        <div
          onClick={() => setIncidentModalOpen(true)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-amber-400'
              : 'bg-neutral-900 border-neutral-800 hover:border-amber-500/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
            <Wrench className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-white">Report Breakdown / Accident</h4>
          <p className="text-xs text-neutral-400 mt-1">
            Puncture, engine fault, or road accident. Request replacement rider to avoid order delay.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 mt-3">
            <span>Log Report</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Card B: Customer or Store Complaint */}
        <div
          onClick={() => setComplaintModalOpen(true)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-blue-400'
              : 'bg-neutral-900 border-neutral-800 hover:border-blue-500/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-white">Report Store or Customer</h4>
          <p className="text-xs text-neutral-400 mt-1">
            Excessive merchant wait time, rude behavior, wrong delivery address, or safety concerns.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 mt-3">
            <span>Submit Complaint</span>
            <span>&rarr;</span>
          </span>
        </div>

        {/* Card C: Delivery Dispute */}
        <div
          onClick={() => setDisputeModalOpen(true)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
            isLightMode
              ? 'bg-white border-neutral-200 hover:border-purple-400'
              : 'bg-neutral-900 border-neutral-800 hover:border-purple-500/60'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
            <FileQuestion className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-white">Delivery Dispute Center</h4>
          <p className="text-xs text-neutral-400 mt-1">
            Missing payout, incorrect distance recorded, uncompensated heavy item, or penalty contest.
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 mt-3">
            <span>File Dispute</span>
            <span>&rarr;</span>
          </span>
        </div>
      </div>

      {/* 3. Delivery Disputes Table / List (Rule 6) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-black">Active Disputes & Resolutions</h3>
            <p className="text-xs text-neutral-400">Transparent ticketing for earnings or rating grievances</p>
          </div>
          <button
            type="button"
            onClick={loadDisputes}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingDisputes && (
          <div className="py-6 text-center text-xs text-neutral-400">Loading disputes...</div>
        )}

        {!loadingDisputes && disputes.length === 0 && (
          <div className="py-6 text-center text-xs text-neutral-500">No filed disputes.</div>
        )}

        {!loadingDisputes && disputes.length > 0 && (
          <div className="space-y-3">
            {disputes.map((dsp) => {
              const isResolved = dsp.status === 'approved_refunded';
              const isRejected = dsp.status === 'rejected';

              return (
                <div
                  key={dsp.disputeId}
                  className="p-4 rounded-2xl bg-black/30 border border-neutral-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{dsp.orderNumber}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isResolved
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isRejected
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isResolved ? 'Approved & Refunded' : isRejected ? 'Rejected' : 'Under Review'}
                      </span>
                    </div>

                    {dsp.claimedAmount > 0 && (
                      <span className="font-bold text-neutral-300">
                        Claimed: <strong className="text-white">₹{dsp.claimedAmount}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-neutral-300 text-[11px]">{dsp.description}</p>

                  {dsp.adminResponse && (
                    <div className="p-2.5 rounded-xl bg-black/60 border border-neutral-700/60 space-y-1 text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolution by Operations Desk:</span>
                      </span>
                      <p className="text-neutral-300">{dsp.adminResponse}</p>
                      {dsp.adjustedAmount > 0 && (
                        <span className="text-emerald-400 font-bold block">
                          Adjusted Payout: +₹{dsp.adjustedAmount} credited to wallet
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-[10px] text-neutral-500 pt-1">
                    Submitted on:{' '}
                    {new Date(dsp.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Safety Incidents & Complaints History Log */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div>
            <h3 className="text-base font-black">Reported Incidents & Operational Audits</h3>
            <p className="text-xs text-neutral-400">Breakdown, safety hazard, and merchant delay logs</p>
          </div>
          <button
            type="button"
            onClick={loadIncidents}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingIncidents && (
          <div className="py-6 text-center text-xs text-neutral-400">Loading incident history...</div>
        )}

        {!loadingIncidents && incidents.length === 0 && (
          <div className="py-6 text-center text-xs text-neutral-500">No incident records reported.</div>
        )}

        {!loadingIncidents && incidents.length > 0 && (
          <div className="space-y-2.5">
            {incidents.map((inc) => (
              <div
                key={inc.incidentId}
                className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        inc.type === 'emergency_sos'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : inc.type.includes('breakdown') || inc.type.includes('accident')
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {inc.type.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-neutral-400 text-[10px]">{inc.incidentId}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold ${
                      inc.status === 'active' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {inc.status === 'active' ? 'Open / Under Action' : 'Resolved'}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-300">{inc.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/60">
                  <span>
                    Location: {inc.location?.address || `${inc.location?.lat?.toFixed(3)}, ${inc.location?.lng?.toFixed(3)}`}
                  </span>
                  <span>
                    {new Date(inc.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Emergency SOS Modal */}
      <EmergencySosModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
        partner={partner}
        activeTaskId={activeTaskId}
        showToast={showToast}
        isLightMode={isLightMode}
      />

      {/* MODAL 2: Report Accident / Breakdown */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative space-y-4 ${
              isLightMode
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setIncidentModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Report Incident or Breakdown</h3>
                <p className="text-xs text-neutral-400">Immediate operational assistance</p>
              </div>
            </div>

            <form onSubmit={handleReportIncident} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Incident Category</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="vehicle_breakdown">🛵 Vehicle Breakdown (Puncture / Chain / Engine)</option>
                  <option value="accident">🚑 Road Accident</option>
                  <option value="medical_emergency">🩺 Personal Medical Distress</option>
                  <option value="safety_hazard">⚠️ Route Hazard / Blockade</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`py-2 rounded-xl border text-xs font-bold capitalize cursor-pointer ${
                        incidentSeverity === sev
                          ? 'border-amber-500 bg-amber-500/20 text-amber-400'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  What happened? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Describe your current status and exact location landmarks..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needMedical}
                    onChange={(e) => setNeedMedical(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 rounded"
                  />
                  <span className="font-bold text-neutral-200">Request Medical / Ambulance Help</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needReplacement}
                    onChange={(e) => setNeedReplacement(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span className="font-bold text-neutral-200">
                    Dispatch Replacement Rider for Active Order
                  </span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIncidentModalOpen(false)}
                  disabled={submittingIncident}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingIncident}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingIncident ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Submit Incident</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Customer / Store Complaint */}
      {complaintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative space-y-4 ${
              isLightMode
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setComplaintModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Report Customer or Store Issue</h3>
                <p className="text-xs text-neutral-400">Strictly reviewed by Operational Quality</p>
              </div>
            </div>

            <form onSubmit={handleSubmitComplaint} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">Target Entity</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setComplaintTarget('store')}
                    className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                      complaintTarget === 'store'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Merchant Store</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setComplaintTarget('customer')}
                    className={`py-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold cursor-pointer ${
                      complaintTarget === 'customer'
                        ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Customer</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Order Number (Optional)</label>
                <input
                  type="text"
                  value={complaintOrderNum}
                  onChange={(e) => setComplaintOrderNum(e.target.value)}
                  placeholder="e.g. ORD-781923"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Primary Reason</label>
                <select
                  value={complaintReason}
                  onChange={(e) => setComplaintReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-blue-500"
                >
                  {complaintTarget === 'store' ? (
                    <>
                      <option value="Excessive preparation delay (>25 mins)">
                        Excessive preparation delay (&gt;25 mins)
                      </option>
                      <option value="Store staff rude / uncooperative">Store staff rude / uncooperative</option>
                      <option value="Store handed damaged packaging">Store handed damaged packaging</option>
                      <option value="Store closed / denied dispatch">Store closed / denied dispatch</option>
                    </>
                  ) : (
                    <>
                      <option value="Customer refused Cash on Delivery (COD)">
                        Customer refused Cash on Delivery (COD)
                      </option>
                      <option value="Customer unreachable at doorstep">Customer unreachable at doorstep</option>
                      <option value="Rude behavior or harassment">Rude behavior or harassment</option>
                      <option value="Extremely inaccurate delivery address">
                        Extremely inaccurate delivery address
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  Specific Remarks & Evidence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  placeholder="Detail the issue factually..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComplaintModalOpen(false)}
                  disabled={submittingComplaint}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingComplaint}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingComplaint ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Submit to Quality</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: File Delivery Dispute */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative space-y-4 ${
              isLightMode
                ? 'bg-white border-neutral-200 text-neutral-900'
                : 'bg-neutral-900 border-neutral-800 text-white'
            }`}
          >
            <button
              type="button"
              onClick={() => setDisputeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <FileQuestion className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">File Delivery Dispute</h3>
                <p className="text-xs text-neutral-400">Resolution guaranteed within 24 operational hours</p>
              </div>
            </div>

            <form onSubmit={handleSubmitDispute} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  Order Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={disputeOrderNum}
                  onChange={(e) => setDisputeOrderNum(e.target.value)}
                  placeholder="e.g. ORD-781923"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Dispute Reason</label>
                <select
                  value={disputeCategory}
                  onChange={(e) => setDisputeCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="waiting_time_underpaid">⏳ Waiting Time Underpaid (&gt;15 mins wait)</option>
                  <option value="missing_payout">💸 Order Completed but Payout Missing</option>
                  <option value="incorrect_distance">🗺️ Recorded GPS Distance Lower than Actual Route</option>
                  <option value="heavy_item_compensation">📦 Heavy Package Bonus Missing (&gt;5kg)</option>
                  <option value="unfair_cancellation_penalty">⚠️ Unfair Cancellation Penalty Deducted</option>
                  <option value="customer_rating_dispute">⭐ Unfair 1-Star Customer Rating Review</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">Claimed Compensation (₹)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={disputeClaimedAmt}
                  onChange={(e) => setDisputeClaimedAmt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1">
                  Detailed Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={disputeDesc}
                  onChange={(e) => setDisputeDesc(e.target.value)}
                  placeholder="Explain why the payout or rating was incorrect..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalOpen(false)}
                  disabled={submittingDispute}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  {submittingDispute ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Submit Dispute</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
