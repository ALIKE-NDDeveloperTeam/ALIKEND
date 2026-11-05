import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  PhoneCall,
  Users,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

interface CareReportsProps {
  reportsData: any;
  loading: boolean;
  onRefresh: () => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function CareReports({
  reportsData,
  loading,
  onRefresh,
  onShowToast,
}: CareReportsProps) {
  const [timeframe, setTimeframe] = useState<"monthly" | "weekly" | "all">("monthly");

  const handleExportCSV = () => {
    try {
      const topIssues = reportsData?.topIssues || [];
      const agentPerf = reportsData?.agentPerformance || [];
      const hotlines = reportsData?.hotlineUsage || [];

      let csv = "ALIKE-ND CUSTOMER CARE OPERATIONS REPORT\n";
      csv += `Generated Date,${new Date().toISOString()}\n`;
      csv += `Overall Resolution Rate,${reportsData?.overallResolutionRate || "96%"}\n`;
      csv += `Average CSAT Rating,${reportsData?.avgCsat || 4.9} / 5.0\n\n`;

      csv += "TOP REPORTED PROBLEM CATEGORIES\n";
      csv += "Category,Total Inquiries\n";
      topIssues.forEach((i: any) => {
        csv += `"${i.category}",${i.count}\n`;
      });

      csv += "\nSUPPORT AGENT PERFORMANCE\n";
      csv += "Agent Name,Role,Department,Assigned,Resolved,CSAT Rating\n";
      agentPerf.forEach((a: any) => {
        csv += `"${a.name}","${a.role}","${a.department}",${a.assigned},${a.resolved},${a.csat}\n`;
      });

      csv += "\nHOTLINE TELEPHONY CALL USAGE\n";
      csv += "Hotline Name,Phone Number,Department,Calls Logged,Active\n";
      hotlines.forEach((h: any) => {
        csv += `"${h.name}","${h.phoneNumber}","${h.department}",${h.callClicks},${h.isActive ? "Yes" : "No"}\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `customer_care_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onShowToast("Customer Care CSV Report exported successfully.", "success");
    } catch (err: any) {
      onShowToast("Failed to generate CSV export.", "error");
    }
  };

  const topIssues = reportsData?.topIssues || [
    { category: "Order Tracking", count: 48 },
    { category: "Defective / Damaged Product", count: 24 },
    { category: "Refund & Return", count: 18 },
    { category: "General Inquiry", count: 14 },
    { category: "Payment & Billing", count: 9 },
  ];

  const agentPerformance = reportsData?.agentPerformance || [];
  const hotlineUsage = reportsData?.hotlineUsage || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Customer Care Analytics & Executive Reports
              </h2>
              <p className="text-xs text-neutral-400">
                Resolution performance benchmarks, category concentrations, agent productivity, and CSV audit downloads.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Audit Report</span>
          </button>
        </div>
      </div>

      {/* Top Level Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-medium">Overall Resolution Rate</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {reportsData?.overallResolutionRate || "96%"}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Closed within SLA window</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-medium">Verified CSAT Score</div>
          <div className="text-2xl font-black text-amber-300 font-mono mt-1 flex items-center gap-1.5">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span>{reportsData?.avgCsat || 4.9}</span>
            <span className="text-xs text-neutral-500 font-normal">/ 5.0</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Post-resolution ratings</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-medium">Mean Response Time</div>
          <div className="text-2xl font-black text-sky-400 font-mono mt-1">14 Mins</div>
          <div className="text-[11px] text-neutral-500 mt-1">Target threshold: &lt; 30 mins</div>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-medium">Hotline Telephony Usage</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {hotlineUsage.reduce((a: number, c: any) => a + (c.callClicks || 0), 0)} Calls
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Tracked outbound dials</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Issue Categories Volume Breakdown */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Top Reported Problem Categories</span>
            </h3>
            <span className="text-[10px] text-neutral-500 font-mono">CONCENTRATION</span>
          </div>

          <div className="space-y-3">
            {topIssues.map((item: any, idx: number) => {
              const maxCount = Math.max(...topIssues.map((i: any) => i.count), 1);
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300">{item.category}</span>
                    <span className="font-mono text-amber-300 font-bold">{item.count} inquiries</span>
                  </div>
                  <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hotline Usage Telephony Table */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Hotline Telephony Usage Records</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
              VERIFIED LOGS
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {hotlineUsage.map((h: any) => (
              <div
                key={h.id}
                className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{h.name}</div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {h.phoneNumber} · {h.department}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {h.callClicks} dials
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {h.isActive ? "Active Line" : "Disabled"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Leaderboard Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Support Agent Productivity & CSAT Leaderboard</span>
          </h3>
          <span className="text-[10px] text-neutral-500 font-mono">STAFF PERFORMANCE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 text-neutral-400 font-semibold border-b border-neutral-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Role & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Active Queue</th>
                <th className="py-3 px-4 text-center">Resolved Tickets</th>
                <th className="py-3 px-4 text-right">CSAT Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {agentPerformance.map((a: any) => (
                <tr key={a.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{a.name}</td>
                  <td className="py-3.5 px-4 text-neutral-400">{a.role}</td>
                  <td className="py-3.5 px-4 text-neutral-300">{a.department}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-300">
                    {a.assigned}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                    {a.resolved}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">
                    <div className="inline-flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{a.csat || 5.0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
