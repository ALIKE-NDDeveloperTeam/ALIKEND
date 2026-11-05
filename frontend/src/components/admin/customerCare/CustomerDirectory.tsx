import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  Star,
  Clock,
  LifeBuoy,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Lock,
} from "lucide-react";

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  tier: "Silver" | "Gold" | "Platinum";
  ordersCount: number;
  lifetimeSpend: number;
  totalTickets?: number;
  openTicketsCount?: number;
  satisfactionRating?: number;
  latestTicket?: any;
  createdAt: string | Date;
}

interface CustomerDirectoryProps {
  customers: CustomerProfile[];
  loading: boolean;
  onRefresh: () => void;
  onFetchTimeline: (email: string) => Promise<any>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function CustomerDirectory({
  customers,
  loading,
  onRefresh,
  onFetchTimeline,
  onShowToast,
}: CustomerDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");

  // Customer Detail Drawer State
  const [activeCustomer, setActiveCustomer] = useState<CustomerProfile | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (activeCustomer) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [activeCustomer]);

  const handleOpenCustomer = async (c: CustomerProfile) => {
    setActiveCustomer(c);
    try {
      setLoadingTimeline(true);
      const res = await onFetchTimeline(c.email);
      setTimelineData(res?.timeline || []);
    } catch (err: any) {
      onShowToast("Failed to load customer timeline.", "error");
    } finally {
      setLoadingTimeline(false);
    }
  };

  const filtered = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
    const matchesTier = tierFilter === "all" || c.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

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
                Customer Database & Interaction History
              </h2>
              <p className="text-xs text-neutral-400">
                Member profiles, order spending tiers, past tickets, satisfaction CSAT ratings, and unified interaction timeline.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          Refresh Directory
        </button>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or email..."
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500/60 cursor-pointer"
          >
            <option value="all">All Membership Tiers</option>
            <option value="Platinum">Platinum Tier</option>
            <option value="Gold">Gold Tier</option>
            <option value="Silver">Silver Tier</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
          Loading customer directory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-8">
          <Users className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-neutral-300 font-semibold text-sm">No customers found</h3>
          <p className="text-neutral-500 text-xs mt-1">Adjust search parameters to view customer profiles.</p>
        </div>
      ) : (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Profile</th>
                  <th className="py-3 px-4">Tier Status</th>
                  <th className="py-3 px-4">Lifetime Orders</th>
                  <th className="py-3 px-4">Total Inquiries</th>
                  <th className="py-3 px-4">Open Support Tickets</th>
                  <th className="py-3 px-4">CSAT Rating</th>
                  <th className="py-3 px-4 text-right">Interaction Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
                {filtered.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => handleOpenCustomer(c)}
                    className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{c.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.tier === "Platinum"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : c.tier === "Gold"
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                        }`}
                      >
                        {c.tier} Member
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium">
                      <div>{c.ordersCount || 0} orders</div>
                      <div className="text-[11px] text-neutral-500">
                        ৳{(c.lifetimeSpend || 0).toLocaleString()} spend
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {c.totalTickets || 0}
                    </td>

                    <td className="py-3.5 px-4">
                      {(c.openTicketsCount || 0) > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {c.openTicketsCount} Active
                        </span>
                      ) : (
                        <span className="text-neutral-500">None active</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{c.satisfactionRating || 5.0}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCustomer(c);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View Timeline</span>
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

      {/* Customer Interaction History Drawer Modal */}
      {activeCustomer && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setActiveCustomer(null)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-neutral-800 bg-neutral-950/70 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-white">{activeCustomer.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeCustomer.tier} Member
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-400">
                  <span className="font-mono">{activeCustomer.email}</span>
                  <span>·</span>
                  <span>{activeCustomer.ordersCount || 0} lifetime orders</span>
                  <span>·</span>
                  <span>৳{(activeCustomer.lifetimeSpend || 0).toLocaleString()} volume</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCustomer(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timeline Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-neutral-950/40 to-neutral-950/80">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                Unified Interaction Chronology (Tickets, Orders, Notes)
              </h4>

              {loadingTimeline ? (
                <div className="py-12 text-center text-neutral-500 text-xs animate-pulse">
                  Loading customer history...
                </div>
              ) : timelineData.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No interaction history recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {timelineData.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-start gap-3 text-xs shadow-sm"
                    >
                      <div
                        className={`p-2 rounded-xl mt-0.5 ${
                          item.type === "ticket"
                            ? "bg-amber-500/10 text-amber-400"
                            : item.type === "order"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {item.type === "ticket" ? (
                          <LifeBuoy className="w-4 h-4" />
                        ) : item.type === "order" ? (
                          <ShoppingBag className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{item.title}</span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {new Date(item.date).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Staff Customer Note Box */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">
                  Add Private Customer Care Note
                </span>
                <span className="text-[10px] text-neutral-500">
                  (Internal reference for all support agents)
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="e.g. VIP client prefers WhatsApp communications for dispatch alerts..."
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newNote.trim()) return;
                    setTimelineData([
                      {
                        id: `note_${Date.now()}`,
                        type: "note",
                        title: "Internal Staff Customer Note",
                        description: newNote.trim(),
                        date: new Date(),
                      },
                      ...timelineData,
                    ]);
                    setNewNote("");
                    onShowToast("Internal note attached to customer profile.", "success");
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
