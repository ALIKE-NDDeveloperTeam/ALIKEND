import React, { useState, useEffect } from "react";
import {
  LifeBuoy,
  PhoneCall,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Headphones,
} from "lucide-react";
import { adminApi } from "../../../pages/adminApi";
import CareDashboard from "./CareDashboard";
import HotlineManagement from "./HotlineManagement";
import TicketCenter from "./TicketCenter";
import CustomerDirectory from "./CustomerDirectory";
import SupportTeam from "./SupportTeam";
import KnowledgeBaseManager from "./KnowledgeBaseManager";
import CareReports from "./CareReports";
import CareSettings from "./CareSettings";
import CommunicationCenter from "./CommunicationCenter";

export type CareTab =
  | "dashboard"
  | "hotlines"
  | "tickets"
  | "customers"
  | "communication"
  | "team"
  | "knowledgeBase"
  | "reports"
  | "settings";

interface CustomerCareModuleProps {
  isSuperAdmin?: boolean;
  onFlashSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function CustomerCareModule({
  isSuperAdmin = false,
  onFlashSuccess,
  onError,
}: CustomerCareModuleProps) {
  const [activeTab, setActiveTab] = useState<CareTab>("dashboard");
  const [loading, setLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [hotlines, setHotlines] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [cannedTemplates, setCannedTemplates] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [careSettings, setCareSettings] = useState<any>(null);

  // Local Toast Notification
  const [toastMsg, setToastMsg] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToastMsg({ msg, type });
    if (type === "success" && onFlashSuccess) onFlashSuccess(msg);
    if (type === "error" && onError) onError(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Load all initial Customer Care data
  const loadAllCareData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        hotlinesRes,
        ticketsRes,
        customersRes,
        agentsRes,
        articlesRes,
        templatesRes,
        reportsRes,
        settingsRes,
      ] = await Promise.allSettled([
        adminApi.getCustomerCareStats(),
        adminApi.getHotlines(),
        adminApi.getCareTickets(),
        adminApi.getCareCustomers(),
        adminApi.getCareAgents(),
        adminApi.getCareKnowledgeBase(),
        adminApi.getCareCannedTemplates(),
        adminApi.getCareReports(),
        adminApi.getCareSettings(),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value);
      if (hotlinesRes.status === "fulfilled") setHotlines(hotlinesRes.value || []);
      if (ticketsRes.status === "fulfilled") setTickets(ticketsRes.value || []);
      if (customersRes.status === "fulfilled") setCustomers(customersRes.value || []);
      if (agentsRes.status === "fulfilled") setAgents(agentsRes.value || []);
      if (articlesRes.status === "fulfilled") setArticles(articlesRes.value || []);
      if (templatesRes.status === "fulfilled") setCannedTemplates(templatesRes.value || []);
      if (reportsRes.status === "fulfilled") setReportsData(reportsRes.value);
      if (settingsRes.status === "fulfilled") setCareSettings(settingsRes.value);
    } catch (err: any) {
      console.warn("Care data fetch warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCareData();
  }, []);

  // Hotline CRUD handlers
  const handleCreateHotline = async (data: any) => {
    const created = await adminApi.createHotline(data);
    setHotlines((prev) => [...prev, created]);
    const updatedStats = await adminApi.getCustomerCareStats().catch(() => null);
    if (updatedStats) setStats(updatedStats);
  };

  const handleUpdateHotline = async (id: string, data: any) => {
    const updated = await adminApi.updateHotline(id, data);
    setHotlines((prev) => prev.map((h) => (h._id === id ? updated : h)));
  };

  const handleToggleHotline = async (id: string) => {
    const res = await adminApi.toggleHotline(id);
    setHotlines((prev) =>
      prev.map((h) => (h._id === id ? { ...h, isActive: res.isActive } : h))
    );
    showToast(
      res.isActive ? "Hotline activated in public directory." : "Hotline disabled.",
      "info"
    );
  };

  const handleDeleteHotline = async (id: string) => {
    if (!confirm("Are you sure you want to remove this hotline?")) return;
    await adminApi.deleteHotline(id);
    setHotlines((prev) => prev.filter((h) => h._id !== id));
    showToast("Hotline removed from directory.", "success");
  };

  const handleTrackCall = async (id: string) => {
    await adminApi.trackHotlineCall(id).catch(() => {});
    setHotlines((prev) =>
      prev.map((h) =>
        h._id === id ? { ...h, callClickCount: (h.callClickCount || 0) + 1 } : h
      )
    );
  };

  // Ticket CRUD handlers
  const handleCreateTicket = async (data: any) => {
    const created = await adminApi.createCareTicket(data);
    setTickets((prev) => [created, ...prev]);
    const updatedStats = await adminApi.getCustomerCareStats().catch(() => null);
    if (updatedStats) setStats(updatedStats);
  };

  const handleSendTicketReply = async (ticketId: string, message: string, isInternalNote: boolean) => {
    const res = await adminApi.replyCareTicket(ticketId, { message, isInternalNote });
    if (res?.ticket) {
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === ticketId || t._id === ticketId ? res.ticket : t))
      );
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    const updated = await adminApi.updateCareTicket(ticketId, { status });
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId || t._id === ticketId ? updated : t))
    );
    showToast(`Ticket status transitioned to "${status}".`, "success");
  };

  const handleAssignAgent = async (ticketId: string, agentId: string, agentName: string) => {
    const updated = await adminApi.updateCareTicket(ticketId, {
      assignedAgentId: agentId,
      assignedAgentName: agentName,
    });
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId || t._id === ticketId ? updated : t))
    );
    showToast(`Ticket assigned to ${agentName}.`, "success");
  };

  const handleEscalateTicket = async (ticketId: string, reason: string, targetDept: string) => {
    const res = await adminApi.escalateCareTicket(ticketId, { reason, targetDepartment: targetDept });
    if (res?.ticket) {
      setTickets((prev) =>
        prev.map((t) => (t.ticketId === ticketId || t._id === ticketId ? res.ticket : t))
      );
    }
  };

  // Customer timeline handler
  const handleFetchCustomerTimeline = async (email: string) => {
    return adminApi.getCareCustomerTimeline(email);
  };

  // Agent handlers
  const handleCreateAgent = async (data: any) => {
    const created = await adminApi.createCareAgent(data);
    setAgents((prev) => [...prev, created]);
  };

  const handleUpdateAgent = async (id: string, data: any) => {
    const updated = await adminApi.updateCareAgent(id, data);
    setAgents((prev) => prev.map((a) => (a._id === id ? updated : a)));
  };

  const handleDeleteAgent = async (id: string) => {
    if (!confirm("Are you sure you want to remove this support agent?")) return;
    await adminApi.deleteCareAgent(id);
    setAgents((prev) => prev.filter((a) => a._id !== id));
    showToast("Support staff account removed.", "success");
  };

  // Knowledge base handlers
  const handleCreateArticle = async (data: any) => {
    const created = await adminApi.createKnowledgeArticle(data);
    setArticles((prev) => [created, ...prev]);
  };

  const handleUpdateArticle = async (id: string, data: any) => {
    const updated = await adminApi.updateKnowledgeArticle(id, data);
    setArticles((prev) => prev.map((a) => (a._id === id ? updated : a)));
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ article?")) return;
    await adminApi.deleteKnowledgeArticle(id);
    setArticles((prev) => prev.filter((a) => a._id !== id));
    showToast("Article deleted.", "success");
  };

  // Settings handler
  const handleUpdateCareSettings = async (data: any) => {
    const updated = await adminApi.updateCareSettings(data);
    setCareSettings(updated);
  };

  // Sub-navigation tabs list
  const navTabs = [
    { id: "dashboard", label: "Dashboard", icon: LifeBuoy },
    { id: "hotlines", label: "Hotline Directory", icon: PhoneCall, badge: `${hotlines.length}` },
    { id: "tickets", label: "Ticket Center", icon: Headphones, badge: `${tickets.filter(t => t.status !== "Resolved" && t.status !== "Closed").length}` },
    { id: "customers", label: "Customer History", icon: Users },
    { id: "communication", label: "Communication Center", icon: MessageSquare },
    { id: "team", label: "Support Team", icon: ShieldCheck },
    { id: "knowledgeBase", label: "Knowledge Base", icon: BookOpen },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner if present */}
      {toastMsg && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-fadeIn ${
            toastMsg.type === "error"
              ? "bg-rose-950 border border-rose-500 text-rose-200"
              : "bg-emerald-950 border border-emerald-500 text-emerald-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg.msg}</span>
        </div>
      )}

      {/* Sub-Navigation Ribbon (Responsive Light & Dark Glass) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto scrollbar-none shadow-sm">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CareTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/20"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-amber-300 border border-neutral-200/60 dark:border-neutral-700"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "dashboard" && (
        <CareDashboard
          stats={stats}
          onNavigateTab={(t) => setActiveTab(t as CareTab)}
          onOpenCreateTicket={() => setActiveTab("tickets")}
          onOpenCreateHotline={() => setActiveTab("hotlines")}
        />
      )}

      {activeTab === "hotlines" && (
        <HotlineManagement
          hotlines={hotlines}
          loading={loading}
          onRefresh={loadAllCareData}
          onCreate={handleCreateHotline}
          onUpdate={handleUpdateHotline}
          onToggle={handleToggleHotline}
          onDelete={handleDeleteHotline}
          onTrackCall={handleTrackCall}
          onShowToast={showToast}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {activeTab === "tickets" && (
        <TicketCenter
          tickets={tickets}
          agents={agents}
          cannedTemplates={cannedTemplates}
          loading={loading}
          onRefresh={loadAllCareData}
          onCreateTicket={handleCreateTicket}
          onSendReply={handleSendTicketReply}
          onUpdateStatus={handleUpdateTicketStatus}
          onAssignAgent={handleAssignAgent}
          onEscalate={handleEscalateTicket}
          onShowToast={showToast}
        />
      )}

      {activeTab === "customers" && (
        <CustomerDirectory
          customers={customers}
          loading={loading}
          onRefresh={loadAllCareData}
          onFetchTimeline={handleFetchCustomerTimeline}
          onShowToast={showToast}
        />
      )}

      {activeTab === "communication" && (
        <CommunicationCenter
          cannedTemplates={cannedTemplates}
          hotlines={hotlines}
          onShowToast={showToast}
        />
      )}

      {activeTab === "team" && (
        <SupportTeam
          agents={agents}
          loading={loading}
          onRefresh={loadAllCareData}
          onCreateAgent={handleCreateAgent}
          onUpdateAgent={handleUpdateAgent}
          onDeleteAgent={handleDeleteAgent}
          onShowToast={showToast}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {activeTab === "knowledgeBase" && (
        <KnowledgeBaseManager
          articles={articles}
          loading={loading}
          onRefresh={loadAllCareData}
          onCreateArticle={handleCreateArticle}
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          onShowToast={showToast}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {activeTab === "reports" && (
        <CareReports
          reportsData={reportsData}
          loading={loading}
          onRefresh={loadAllCareData}
          onShowToast={showToast}
        />
      )}

      {activeTab === "settings" && (
        <CareSettings
          settings={careSettings}
          loading={loading}
          onUpdate={handleUpdateCareSettings}
          onShowToast={showToast}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  );
}
