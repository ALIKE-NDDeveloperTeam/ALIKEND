import React from "react";
import {
  LifeBuoy,
  PhoneCall,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  HelpCircle,
  FileText,
} from "lucide-react";

interface CareDashboardProps {
  stats: any;
  onNavigateTab: (tab: string) => void;
  onOpenCreateTicket: () => void;
  onOpenCreateHotline: () => void;
}

export default function CareDashboard({
  stats,
  onNavigateTab,
  onOpenCreateTicket,
  onOpenCreateHotline,
}: CareDashboardProps) {
  const kpis = [
    {
      title: "Total Inquiries Logged",
      value: stats?.totalInquiries ?? 0,
      sub: "All time customer contacts",
      icon: LifeBuoy,
      color: "amber",
      tab: "tickets",
    },
    {
      title: "Open & Active Inquiries",
      value: (stats?.newTickets ?? 0) + (stats?.openTickets ?? 0) + (stats?.inProgressTickets ?? 0),
      sub: `${stats?.newTickets ?? 0} new · ${stats?.inProgressTickets ?? 0} in progress`,
      icon: Clock,
      color: "blue",
      tab: "tickets",
    },
    {
      title: "Unanswered Requests",
      value: stats?.unansweredRequests ?? 0,
      sub: "Needs urgent first response",
      icon: AlertTriangle,
      color: "rose",
      tab: "tickets",
    },
    {
      title: "Resolved Inquiries",
      value: stats?.resolvedTickets ?? 0,
      sub: "Successfully completed",
      icon: CheckCircle2,
      color: "emerald",
      tab: "tickets",
    },
    {
      title: "Active Hotlines",
      value: stats?.activeHotlinesCount ?? 6,
      sub: `${stats?.totalCallClicks ?? 0} calls tracked`,
      icon: PhoneCall,
      color: "amber",
      tab: "hotlines",
    },
    {
      title: "Customer Satisfaction",
      value: `${stats?.avgCsat ?? 4.9} / 5`,
      sub: "Verified CSAT rating",
      icon: Star,
      color: "amber",
      tab: "reports",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Welcome & Quick Launch */}
      <div className="relative bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/30 border border-neutral-800 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CENTRAL CUSTOMER CARE COMMAND</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Concierge, Hotline & Ticket Operations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
            Manage authorized hotlines, track priority SLAs, resolve inquiries across departments,
            and monitor customer satisfaction in real-time.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={onOpenCreateTicket}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>New Support Ticket</span>
            </button>

            <button
              onClick={onOpenCreateHotline}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border border-neutral-700"
            >
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Add Hotline Number</span>
            </button>

            <button
              onClick={() => onNavigateTab("knowledgeBase")}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all border border-neutral-800"
            >
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>Knowledge Base</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className="bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-5 shadow-sm transition-all hover:translate-y-[-2px] cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-400">{kpi.title}</span>
                <div
                  className={`p-2 rounded-xl ${
                    kpi.color === "rose"
                      ? "bg-rose-500/10 text-rose-400"
                      : kpi.color === "emerald"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : kpi.color === "blue"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-black text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              <div className="mt-1 text-[11px] text-neutral-500">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Detailed Diagnostics: Priority Distribution & Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Priority Breakdown Card */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Priority Support Statistics</span>
            </h3>
            <button
              onClick={() => onNavigateTab("tickets")}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              Filter Queue
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Urgent Escalations
                </span>
                <span className="font-mono font-bold text-white">
                  {stats?.priorityStats?.urgent ?? 0}
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.priorityStats?.urgent ?? 0) / (stats?.totalInquiries || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-bold">High Priority</span>
                <span className="font-mono font-bold text-white">
                  {stats?.priorityStats?.high ?? 0}
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.priorityStats?.high ?? 0) / (stats?.totalInquiries || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sky-400 font-medium">Normal Queue</span>
                <span className="font-mono font-bold text-white">
                  {stats?.priorityStats?.normal ?? 0}
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.priorityStats?.normal ?? 0) / (stats?.totalInquiries || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-400 font-medium">Low Inquiries</span>
                <span className="font-mono font-bold text-white">
                  {stats?.priorityStats?.low ?? 0}
                </span>
              </div>
              <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-600 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats?.priorityStats?.low ?? 0) / (stats?.totalInquiries || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-neutral-950 rounded-xl">
              <div className="text-[11px] text-neutral-400">Avg First Response</div>
              <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
                {stats?.avgResponseTime || "14 mins"}
              </div>
            </div>
            <div className="p-3 bg-neutral-950 rounded-xl">
              <div className="text-[11px] text-neutral-400">Avg Resolution SLA</div>
              <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                {stats?.avgResolutionTime || "4.2 hrs"}
              </div>
            </div>
          </div>
        </div>

        {/* Live Customer Activity Stream */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Recent Customer Care Audit Stream</span>
              </h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                LIVE AUDIT
              </span>
            </div>

            <div className="space-y-3">
              {(stats?.recentActivities || []).slice(0, 5).map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-xl text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-white truncate">{log.action}</span>
                      <span className="text-[10px] text-neutral-500 whitespace-nowrap font-mono">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{log.details}</p>
                    <div className="text-[10px] text-neutral-500 mt-1 font-mono">
                      By: <span className="text-neutral-300">{log.performedBy}</span> · Target: {log.targetId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-500">
              Audit trails are persisted with IP & actor attribution.
            </span>
            <button
              onClick={() => onNavigateTab("tickets")}
              className="text-amber-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All Inquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
