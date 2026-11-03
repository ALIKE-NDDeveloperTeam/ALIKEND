import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Shield,
  User,
  Star,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import TicketDetailModal, { TicketItem } from "./TicketDetailModal";

interface TicketCenterProps {
  tickets: TicketItem[];
  agents: Array<{ _id: string; name: string; role: string; department: string }>;
  cannedTemplates: Array<{ id: string; title: string; category: string; body: string }>;
  loading: boolean;
  onRefresh: () => void;
  onCreateTicket: (data: any) => Promise<void>;
  onSendReply: (ticketId: string, message: string, isInternalNote: boolean) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: string) => Promise<void>;
  onAssignAgent: (ticketId: string, agentId: string, agentName: string) => Promise<void>;
  onEscalate: (ticketId: string, reason: string, targetDept: string) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

const TICKET_CATEGORIES = [
  "All Categories",
  "Order Tracking",
  "Payment & Billing",
  "Refund & Return",
  "Defective / Damaged Product",
  "Account & Security",
  "Seller Complaint",
  "General Inquiry",
];

const TICKET_STATUSES = [
  "all",
  "New",
  "Open",
  "In Progress",
  "Waiting for Customer",
  "Escalated",
  "Resolved",
  "Closed",
];

export default function TicketCenter({
  tickets,
  agents,
  cannedTemplates,
  loading,
  onRefresh,
  onCreateTicket,
  onSendReply,
  onUpdateStatus,
  onAssignAgent,
  onEscalate,
  onShowToast,
}: TicketCenterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  // New Ticket Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    subject: "",
    description: "",
    category: "Order Tracking",
    priority: "Normal" as const,
    assignedDepartment: "Order Support",
    assignedAgentId: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (createModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [createModalOpen]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerEmail || !formData.subject || !formData.description) {
      onShowToast("Please fill all required ticket fields.", "error");
      return;
    }

    try {
      setCreating(true);
      const selectedAgent = agents.find((a) => a._id === formData.assignedAgentId);
      await onCreateTicket({
        ...formData,
        assignedAgentName: selectedAgent ? selectedAgent.name : undefined,
      });
      setCreateModalOpen(false);
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        subject: "",
        description: "",
        category: "Order Tracking",
        priority: "Normal",
        assignedDepartment: "Order Support",
        assignedAgentId: "",
      });
      onShowToast("New customer support ticket created.", "success");
    } catch (err: any) {
      onShowToast(err.message || "Failed to create ticket.", "error");
    } finally {
      setCreating(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      t.ticketId.toLowerCase().includes(term) ||
      t.customerName.toLowerCase().includes(term) ||
      t.customerEmail.toLowerCase().includes(term) ||
      t.subject.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesCategory =
      categoryFilter === "All Categories" || t.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Customer Support Ticket System
              </h2>
              <p className="text-xs text-neutral-400">
                End-to-end inquiry lifecycle: priority SLAs, agent routing, private staff notes, and resolution tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ticket ID, customer name, email, subject..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
          >
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-neutral-900 text-neutral-200">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer capitalize"
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s} className="bg-neutral-900 text-neutral-200">
                {s === "all" ? "All Statuses" : s}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets Table / List */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
          Loading support tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8">
          <LifeBuoy className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-neutral-300 font-semibold text-sm">No support tickets found</h3>
          <p className="text-neutral-500 text-xs mt-1">
            There are currently no tickets matching your active filters.
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject & Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filteredTickets.map((t) => (
                  <tr
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {t.ticketId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{t.customerName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{t.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-white line-clamp-1">{t.subject}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-amber-400/90">{t.category}</span>
                        <span>·</span>
                        <span>{(t.replies || []).length} replies</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.priority === "Urgent"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : t.priority === "High"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : t.priority === "Normal"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-neutral-800 text-neutral-300 border-neutral-700"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === "Resolved" || t.status === "Closed"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : t.status === "Escalated"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                            : t.status === "In Progress"
                            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                            : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {t.assignedAgentName ? (
                        <div className="flex items-center gap-1.5 text-neutral-200">
                          <User className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.assignedAgentName}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-500 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-neutral-400">
                      {new Date(t.updatedAt || t.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(t);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Open Thread</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Detail Drawer Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          agents={agents}
          cannedTemplates={cannedTemplates}
          onClose={() => setSelectedTicket(null)}
          onSendReply={async (id, msg, isNote) => {
            await onSendReply(id, msg, isNote);
            // Refresh local selected state
            const updated = tickets.find((t) => t.ticketId === id || t._id === id);
            if (updated) setSelectedTicket(updated);
          }}
          onUpdateStatus={async (id, status) => {
            await onUpdateStatus(id, status);
            const updated = tickets.find((t) => t.ticketId === id || t._id === id);
            if (updated) setSelectedTicket(updated);
          }}
          onAssignAgent={async (id, agentId, agentName) => {
            await onAssignAgent(id, agentId, agentName);
            const updated = tickets.find((t) => t.ticketId === id || t._id === id);
            if (updated) setSelectedTicket(updated);
          }}
          onEscalate={async (id, reason, dept) => {
            await onEscalate(id, reason, dept);
            const updated = tickets.find((t) => t.ticketId === id || t._id === id);
            if (updated) setSelectedTicket(updated);
          }}
          onShowToast={onShowToast}
        />
      )}

      {/* Create New Ticket Modal */}
      {createModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setCreateModalOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-amber-400" />
                <span>Create New Support Ticket</span>
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg text-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Customer Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {TICKET_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c} className="bg-neutral-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Assign Agent (Optional)
                  </label>
                  <select
                    value={formData.assignedAgentId}
                    onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Auto-route / Unassigned</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id} className="bg-neutral-900 text-white">
                        {a.name} ({a.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Ticket Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief summary of customer issue..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Detailed Issue Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide full issue context, order number if applicable, or customer remarks..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {creating ? "Submitting..." : "Generate Support Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
