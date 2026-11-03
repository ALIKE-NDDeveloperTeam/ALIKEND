import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Plus,
  Shield,
  Star,
  Clock,
  CheckCircle2,
  Edit3,
  Trash2,
  Mail,
  Phone,
  Layers,
  Sparkles,
  X,
} from "lucide-react";

export interface SupportAgentItem {
  _id: string;
  name: string;
  email: string;
  role: "Support Agent" | "Support Manager" | "Head of Care" | "Admin";
  department: string;
  status: "Active" | "Away" | "Offline";
  assignedTicketsCount: number;
  resolvedTicketsCount: number;
  avgCsat: number;
  phone?: string;
  createdAt: string | Date;
}

interface SupportTeamProps {
  agents: SupportAgentItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreateAgent: (data: any) => Promise<void>;
  onUpdateAgent: (id: string, data: any) => Promise<void>;
  onDeleteAgent: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

const DEPARTMENTS = [
  "Executive Concierge",
  "Order Support",
  "Technical & IT",
  "Billing & Refunds",
  "VIP & High Value",
  "General Inquiries",
];

const ROLES: Array<SupportAgentItem["role"]> = [
  "Support Agent",
  "Support Manager",
  "Head of Care",
  "Admin",
];

export default function SupportTeam({
  agents,
  loading,
  onRefresh,
  onCreateAgent,
  onUpdateAgent,
  onDeleteAgent,
  onShowToast,
  isSuperAdmin,
}: SupportTeamProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<SupportAgentItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Support Agent" as SupportAgentItem["role"],
    department: "Order Support",
    status: "Active" as SupportAgentItem["status"],
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [modalOpen]);

  const handleOpenAdd = () => {
    setEditingAgent(null);
    setFormData({
      name: "",
      email: "",
      role: "Support Agent",
      department: "Order Support",
      status: "Active",
      phone: "",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (a: SupportAgentItem) => {
    setEditingAgent(a);
    setFormData({
      name: a.name,
      email: a.email,
      role: a.role,
      department: a.department,
      status: a.status,
      phone: a.phone || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      onShowToast("Name and email are required.", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (editingAgent) {
        await onUpdateAgent(editingAgent._id, formData);
        onShowToast(`Agent ${formData.name} updated successfully.`, "success");
      } else {
        await onCreateAgent(formData);
        onShowToast(`Support agent ${formData.name} registered.`, "success");
      }
      setModalOpen(false);
    } catch (err: any) {
      onShowToast(err.message || "Failed to save agent.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Support Team & Workload Allocations
              </h2>
              <p className="text-xs text-neutral-400">
                Manage support staff roles, assigned queues, active ticket loads, and customer satisfaction metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
          >
            Refresh Team
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Support Staff</span>
          </button>
        </div>
      </div>

      {/* Agents Cards */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
          Loading support team roster...
        </div>
      ) : agents.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-neutral-300 font-semibold text-sm">No support staff configured</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-neutral-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-sm">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">{agent.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                      <span className="text-amber-400/90 font-medium">{agent.role}</span>
                      <span>·</span>
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          agent.status === "Active"
                            ? "bg-emerald-400"
                            : agent.status === "Away"
                            ? "bg-amber-400"
                            : "bg-neutral-500"
                        }`}
                      />
                      <span className="text-[11px] text-neutral-500">{agent.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(agent)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {isSuperAdmin && (
                    <button
                      onClick={() => onDeleteAgent(agent._id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Department & Contact */}
              <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{agent.department}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span>{agent.phone}</span>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-neutral-800/60">
                <div className="p-2 bg-neutral-950/40 rounded-lg">
                  <div className="text-[10px] text-neutral-500 font-medium uppercase">Active Queue</div>
                  <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                    {agent.assignedTicketsCount || 0}
                  </div>
                </div>

                <div className="p-2 bg-neutral-950/40 rounded-lg">
                  <div className="text-[10px] text-neutral-500 font-medium uppercase">Resolved</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {agent.resolvedTicketsCount || 0}
                  </div>
                </div>

                <div className="p-2 bg-neutral-950/40 rounded-lg">
                  <div className="text-[10px] text-neutral-500 font-medium uppercase">Avg CSAT</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{agent.avgCsat || 5.0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Agent Modal */}
      {modalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{editingAgent ? "Update Support Staff" : "Add Support Staff Account"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg text-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Zara Ahmed"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="agent@alike-nd.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Role & Permission *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-neutral-900 text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} className="bg-neutral-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Work Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Away">Away</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                    Direct Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1700-000000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingAgent ? "Update Account" : "Register Agent"}
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
