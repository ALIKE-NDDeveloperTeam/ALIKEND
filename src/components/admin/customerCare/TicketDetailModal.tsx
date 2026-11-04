import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LifeBuoy,
  X,
  Send,
  Lock,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Star,
  Paperclip,
  Bookmark,
  Share2,
  Sparkles,
} from "lucide-react";

export interface TicketReply {
  id: string;
  authorType: "staff" | "customer";
  authorName: string;
  authorEmail: string;
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  isInternalNote: boolean;
  createdAt: string | Date;
}

export interface TicketItem {
  _id: string;
  ticketId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerId?: string;
  subject: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: "Low" | "Normal" | "High" | "Urgent";
  status:
    | "New"
    | "Open"
    | "In Progress"
    | "Waiting for Customer"
    | "Escalated"
    | "Resolved"
    | "Closed";
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedDepartment: string;
  replies: TicketReply[];
  tags: string[];
  csatRating?: number;
  csatFeedback?: string;
  resolvedAt?: string | Date;
  closedAt?: string | Date;
  slaDeadline?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TicketDetailModalProps {
  ticket: TicketItem;
  agents: Array<{ _id: string; name: string; role: string; department: string }>;
  cannedTemplates: Array<{ id: string; title: string; category: string; body: string }>;
  onClose: () => void;
  onSendReply: (ticketId: string, message: string, isInternalNote: boolean) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: string) => Promise<void>;
  onAssignAgent: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
  onEscalate: (ticketId: string, reason: string, targetDept: string) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function TicketDetailModal({
  ticket,
  agents,
  cannedTemplates,
  onClose,
  onSendReply,
  onUpdateStatus,
  onAssignAgent,
  onEscalate,
  onShowToast,
}: TicketDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [escalateDept, setEscalateDept] = useState("Executive Concierge");

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const handleSend = async () => {
    if (!replyMessage.trim()) return;
    try {
      setSending(true);
      await onSendReply(ticket.ticketId || ticket._id, replyMessage.trim(), isInternalNote);
      setReplyMessage("");
      setIsInternalNote(false);
      onShowToast(
        isInternalNote ? "Private staff note appended." : "Customer response delivered.",
        "success"
      );
    } catch (err: any) {
      onShowToast(err.message || "Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleApplyTemplate = (body: string) => {
    setReplyMessage((prev) => (prev ? `${prev}\n\n${body}` : body));
    setShowTemplates(false);
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onEscalate(ticket.ticketId || ticket._id, escalateReason, escalateDept);
      setShowEscalateModal(false);
      onShowToast(`Ticket escalated to ${escalateDept}`, "success");
    } catch (err: any) {
      onShowToast(err.message || "Failed to escalate ticket.", "error");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                {ticket.ticketId}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-neutral-800 border-neutral-700 text-neutral-300">
                {ticket.category}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  ticket.priority === "Urgent"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : ticket.priority === "High"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                }`}
              >
                {ticket.priority} Priority
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  ticket.status === "Resolved" || ticket.status === "Closed"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : ticket.status === "Escalated"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                }`}
              >
                Status: {ticket.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-wide">{ticket.subject}</h2>
            <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
              <span>Customer: <strong className="text-neutral-200">{ticket.customerName}</strong></span>
              <span>·</span>
              <span className="font-mono text-neutral-400">{ticket.customerEmail}</span>
              {ticket.customerPhone && (
                <>
                  <span>·</span>
                  <span className="font-mono text-neutral-400">{ticket.customerPhone}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEscalateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalate</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="px-5 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 font-medium">Update Status:</span>
              <select
                value={ticket.status}
                onChange={(e) => onUpdateStatus(ticket.ticketId || ticket._id, e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting for Customer">Waiting for Customer</option>
                <option value="Escalated">Escalated</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Agent Assignee */}
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-500 font-medium">Assigned Agent:</span>
              <select
                value={ticket.assignedAgentId || ""}
                onChange={(e) => {
                  const agentId = e.target.value;
                  const found = agents.find((a) => a._id === agentId);
                  onAssignAgent(
                    ticket.ticketId || ticket._id,
                    agentId,
                    found ? found.name : "Unassigned"
                  );
                }}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} ({a.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CSAT Rating if resolved */}
          {typeof ticket.csatRating === "number" && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{ticket.csatRating}/5</span>
              <span className="text-neutral-400 text-[11px]">CSAT Rating</span>
            </div>
          )}
        </div>

        {/* Conversation Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-neutral-950/40 to-neutral-950/80">
          {/* Initial Ticket Description Banner */}
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold text-[10px]">
                  {ticket.customerName.charAt(0)}
                </div>
                <span className="font-bold text-neutral-200">{ticket.customerName}</span>
                <span className="text-neutral-500">(Initial Inward Request)</span>
              </div>
              <span className="text-[11px] text-neutral-500">
                {new Date(ticket.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
              {ticket.description}
            </p>
          </div>

          {/* Replies & Internal Notes */}
          {(ticket.replies || []).map((reply, index) => {
            if (index === 0 && reply.message === ticket.description) return null; // Avoid duplicating description

            if (reply.isInternalNote) {
              return (
                <div
                  key={reply.id || index}
                  className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{reply.authorName}</span>
                      <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">
                        PRIVATE STAFF NOTE
                      </span>
                    </div>
                    <span className="text-[11px] text-amber-400/60">
                      {new Date(reply.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed whitespace-pre-line">
                    {reply.message}
                  </p>
                </div>
              );
            }

            const isStaff = reply.authorType === "staff";
            return (
              <div
                key={reply.id || index}
                className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                    isStaff
                      ? "bg-neutral-800 border border-neutral-700 text-neutral-100 rounded-br-sm"
                      : "bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[11px] text-neutral-400 mb-1.5 pb-1 border-b border-white/5">
                    <span className="font-semibold text-neutral-300 flex items-center gap-1">
                      {isStaff && <Shield className="w-3 h-3 text-amber-400" />}
                      {reply.authorName}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(reply.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="whitespace-pre-line">{reply.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Composer Footer */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800">
          {/* Quick Actions (Canned templates, Internal Note Toggle) */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(!isInternalNote)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isInternalNote
                    ? "bg-amber-500 text-neutral-950 font-bold"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isInternalNote ? "Internal Note (Private)" : "Public Customer Reply"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Canned Templates</span>
              </button>
            </div>

            <div className="text-[11px] text-neutral-500">
              {isInternalNote ? (
                <span className="text-amber-400/90 font-medium">
                  Visible ONLY to authorized support staff
                </span>
              ) : (
                <span>Delivered directly to customer email & portal</span>
              )}
            </div>
          </div>

          {/* Canned Templates Popup */}
          {showTemplates && (
            <div className="mb-3 p-3 bg-neutral-950 border border-neutral-800 rounded-2xl space-y-2 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                <span>Select Quick Canned Response</span>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cannedTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => handleApplyTemplate(tpl.body)}
                    className="text-left p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800/80 transition-colors cursor-pointer"
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{tpl.title}</span>
                      <span className="text-[10px] text-amber-400 font-mono">{tpl.category}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 line-clamp-1 mt-1">{tpl.body}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Area and Send */}
          <div className="relative">
            <textarea
              rows={3}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={
                isInternalNote
                  ? "Type private internal staff note (e.g. contacted logistics hub manager for replacement authorization)..."
                  : "Type polite, professional customer response..."
              }
              className={`w-full rounded-2xl pl-4 pr-24 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none resize-none ${
                isInternalNote
                  ? "bg-amber-950/20 border border-amber-500/40 focus:border-amber-400"
                  : "bg-neutral-950 border border-neutral-800 focus:border-amber-500"
              }`}
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !replyMessage.trim()}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 shadow-lg ${
                  isInternalNote
                    ? "bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20"
                    : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10"
                }`}
              >
                <span>{sending ? "Sending..." : isInternalNote ? "Save Note" : "Send Reply"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Escalate Ticket Priority</h3>
            </div>
            <p className="text-xs text-neutral-400">
              Escalating marks this ticket as Urgent priority and transfers ownership directly to
              senior management or specialized triage desks.
            </p>
            <form onSubmit={handleEscalateSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Target Escalation Department
                </label>
                <select
                  value={escalateDept}
                  onChange={(e) => setEscalateDept(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Executive Concierge">Executive Concierge</option>
                  <option value="Technical & IT">Technical & IT</option>
                  <option value="Billing & Refunds">Billing & Refunds</option>
                  <option value="VIP & High Value">VIP & High Value</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Reason for Escalation *
                </label>
                <textarea
                  required
                  rows={2}
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="e.g. VIP client requested instant replacement unit; logistics transit damage claim..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-neutral-950 text-xs font-bold"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
