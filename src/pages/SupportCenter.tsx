import React, { useState, useEffect, useMemo } from "react";
import {
  Headphones,
  LifeBuoy,
  Search,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  Send,
  Plus,
  RefreshCw,
  X,
  FileText,
  Upload,
  User,
  Shield,
  ChevronRight,
  ThumbsUp,
  Sparkles,
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Tag,
  Paperclip,
} from "lucide-react";
import {
  supportApi,
  SupportTicketItem,
  SupportHotlineItem,
  SupportArticleItem,
  CreateTicketPayload,
} from "../services/supportApi";

interface SupportCenterProps {
  user: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    tier?: string;
  } | null;
  onNavigate: (view: string, subView?: string) => void;
  onOpenAuthModal?: () => void;
  showToast: (msg: string, type?: "success" | "warning" | "info" | "error") => void;
  isLightMode?: boolean;
}

type SupportTab = "home" | "assistant" | "tickets" | "hotlines";

export default function SupportCenter({
  user,
  onNavigate,
  onOpenAuthModal,
  showToast,
  isLightMode = false,
}: SupportCenterProps) {
  const [activeTab, setActiveTab] = useState<SupportTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Data states
  const [articles, setArticles] = useState<SupportArticleItem[]>([]);
  const [hotlines, setHotlines] = useState<SupportHotlineItem[]>([]);
  const [myTickets, setMyTickets] = useState<SupportTicketItem[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [loadingHotlines, setLoadingHotlines] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Selected Article Modal for full reading
  const [viewingArticle, setViewingArticle] = useState<SupportArticleItem | null>(null);
  const [copiedArticleId, setCopiedArticleId] = useState<string | null>(null);

  // Selected Ticket for conversation drawer
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenInput, setShowReopenInput] = useState(false);
  const [reopening, setReopening] = useState(false);

  // Create Ticket Modal
  const [createTicketModalOpen, setCreateTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Orders & Delivery");
  const [ticketPriority, setTicketPriority] = useState<"Low" | "Normal" | "High" | "Urgent">("Normal");
  const [ticketContactMethod, setTicketContactMethod] = useState<"Email" | "Phone" | "WhatsApp">("Email");
  const [ticketPhone, setTicketPhone] = useState(user?.phone || "");
  const [ticketAttachments, setTicketAttachments] = useState<
    Array<{ name: string; url: string; size: number; mimeType: string }>
  >([]);
  const [attachmentInput, setAttachmentInput] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Intelligent Assistant State
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{
      id: string;
      sender: "assistant" | "user";
      text: string;
      options?: string[];
      articles?: SupportArticleItem[];
      isResolutionPrompt?: boolean;
      timestamp: Date;
    }>
  >([
    {
      id: "msg_init",
      sender: "assistant",
      text: `Hello ${user?.name ? user.name.split(" ")[0] : "Valued Client"}! I am your ALIKE-ND Intelligent Support Concierge. How can I assist you with your luxury order, account, or transaction today?`,
      options: [
        "Track My Order Dispatch",
        "Returns & Refund Policy",
        "Payment Verification & bKash",
        "Account Security & Credentials",
        "Contact Human Agent",
      ],
      timestamp: new Date(),
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantThinking, setAssistantThinking] = useState(false);
  const [troubleshootingSteps, setTroubleshootingSteps] = useState<
    Array<{ title: string; query: string; attempt: string; resolved: boolean }>
  >([]);

  // Load knowledge articles & hotlines on mount
  useEffect(() => {
    loadKnowledgeBase();
    loadHotlines();
  }, []);

  // Load user tickets when user changes or on tickets tab
  useEffect(() => {
    if (user?.email) {
      loadUserTickets();
    }
  }, [user?.email]);

  const loadKnowledgeBase = async () => {
    try {
      setLoadingArticles(true);
      const data = await supportApi.getKnowledgeBase();
      setArticles(data || []);
    } catch (err: any) {
      console.warn("Failed to load knowledge base:", err);
    } finally {
      setLoadingArticles(false);
    }
  };

  const loadHotlines = async () => {
    try {
      setLoadingHotlines(true);
      const data = await supportApi.getHotlines();
      setHotlines(data || []);
    } catch (err: any) {
      console.warn("Failed to load hotlines:", err);
    } finally {
      setLoadingHotlines(false);
    }
  };

  const loadUserTickets = async () => {
    if (!user?.email) return;
    try {
      setLoadingTickets(true);
      const data = await supportApi.getMyTickets(user.email);
      setMyTickets(data || []);
    } catch (err: any) {
      console.warn("Failed to load user tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Filtered knowledge articles
  const categoriesList = [
    "All Categories",
    "Orders & Delivery",
    "Payments & Refunds",
    "Account & Security",
    "Returns Policy",
    "Troubleshooting",
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchCat =
        selectedCategory === "All Categories" || art.category === selectedCategory;
      const term = searchQuery.toLowerCase().trim();
      const matchSearch =
        !term ||
        art.title.toLowerCase().includes(term) ||
        art.summary.toLowerCase().includes(term) ||
        art.content.toLowerCase().includes(term) ||
        (art.tags || []).some((t) => t.toLowerCase().includes(term));
      return matchCat && matchSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Handle Mark Article Helpful
  const handleMarkHelpful = async (artId: string) => {
    try {
      const res = await supportApi.markHelpful(artId);
      setArticles((prev) =>
        prev.map((a) => (a._id === artId ? { ...a, helpfulCount: res.helpfulCount } : a))
      );
      if (viewingArticle?._id === artId) {
        setViewingArticle((prev) => (prev ? { ...prev, helpfulCount: res.helpfulCount } : null));
      }
      showToast("Thank you for your feedback!", "success");
    } catch {}
  };

  // Handle Copy Article Solution
  const handleCopySolution = (id: string, content: string) => {
    navigator.clipboard?.writeText(content);
    setCopiedArticleId(id);
    showToast("Solution copied to clipboard!", "success");
    setTimeout(() => setCopiedArticleId(null), 2500);
  };

  // Handle Hotline Call Click
  const handleHotlineCall = (hotline: SupportHotlineItem) => {
    supportApi.trackCall(hotline.id);
  };

  // Intelligent Assistant: User sends message or clicks option
  const handleAssistantSend = async (messageText: string) => {
    const text = messageText.trim();
    if (!text) return;

    // Add user message
    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: "user" as const,
      text,
      timestamp: new Date(),
    };
    setAssistantMessages((prev) => [...prev, userMsg]);
    setAssistantInput("");
    setAssistantThinking(true);

    // Record step for troubleshooting history
    const currentStep = {
      title: text,
      query: text,
      attempt: "Assistant Knowledge & FAQ Search",
      resolved: false,
    };

    setTimeout(() => {
      setAssistantThinking(false);
      const lower = text.toLowerCase();

      // Escalation request
      if (
        lower.includes("human") ||
        lower.includes("agent") ||
        lower.includes("representative") ||
        lower.includes("ticket") ||
        lower.includes("escalate")
      ) {
        setAssistantMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: "I can immediately connect you with our Customer Care Management Desk. You can submit a support ticket or call our live executive hotline.",
            options: [
              "Create Support Ticket Now",
              "View Active Customer Care Hotlines",
              "Search Knowledge Base Again",
            ],
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Find matching articles from knowledge base
      const matched = articles.filter((art) => {
        const artText = (art.title + " " + art.summary + " " + art.content + " " + (art.tags || []).join(" ")).toLowerCase();
        const keywords = lower.split(" ").filter((k) => k.length > 3);
        return keywords.some((k) => artText.includes(k));
      });

      if (matched.length > 0) {
        const topMatch = matched[0];
        setTroubleshootingSteps((prev) => [
          ...prev,
          { ...currentStep, attempt: `Provided FAQ: "${topMatch.title}"` },
        ]);

        setAssistantMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: `Based on your request regarding "${text}", here are the verified guidelines from our Knowledge Base:\n\n📌 **${topMatch.title}**\n${topMatch.content}`,
            articles: matched.slice(0, 3),
            isResolutionPrompt: true,
            options: ["Yes, my issue is resolved", "No, I still need help"],
            timestamp: new Date(),
          },
        ]);
      } else {
        // Fallback guidance based on intent
        let advice = "Our automated system did not find an exact article matching your specific query.";
        if (lower.includes("order") || lower.includes("track") || lower.includes("delivery")) {
          advice = "For real-time delivery tracking, consignments are dispatched with encrypted PINs. Metro Express deliveries arrive within 20 minutes, while luxury standard shipping arrives in 24-48 hours with real-time SMS alerts.";
        } else if (lower.includes("refund") || lower.includes("payment") || lower.includes("bkash")) {
          advice = "Refunds to your ALIKE-ND wallet are instantaneous upon inspection approval. For bank cards or bKash reversals, processing typically settles between 2 to 24 hours.";
        } else if (lower.includes("return") || lower.includes("exchange") || lower.includes("broken")) {
          advice = "You have 7 days from delivery to request a doorstep exchange. Please keep original packaging and barcode tags intact.";
        }

        setTroubleshootingSteps((prev) => [
          ...prev,
          { ...currentStep, attempt: advice },
        ]);

        setAssistantMessages((prev) => [
          ...prev,
          {
            id: `asst_${Date.now()}`,
            sender: "assistant",
            text: `${advice}\n\nDid this troubleshooting information resolve your question?`,
            isResolutionPrompt: true,
            options: ["Yes, my issue is resolved", "No, I still need help"],
            timestamp: new Date(),
          },
        ]);
      }
    }, 600);
  };

  // Handle Assistant Resolution Decision
  const handleResolutionDecision = (decision: "resolved" | "unresolved") => {
    if (decision === "resolved") {
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          sender: "assistant",
          text: "🎉 Splendid! I am delighted that we could resolve your problem quickly. If you ever require additional guidance, our Concierge Center is always at your service.",
          options: ["Ask Another Question", "Explore FAQs", "My Orders Tracker"],
          timestamp: new Date(),
        },
      ]);
      showToast("Issue marked as resolved!", "success");
    } else {
      setAssistantMessages((prev) => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          sender: "assistant",
          text: "I understand your issue requires direct human assistance. Let's escalate your inquiry to our Customer Care staff now. I have preserved your troubleshooting history so the agent will have full context.",
          options: [
            "Create Support Ticket Now",
            "Call Customer Care Hotline",
          ],
          timestamp: new Date(),
        },
      ]);
      // Open Create Ticket Modal with troubleshooting transcript
      openCreateTicketWithAssistantContext();
    }
  };

  // Open Create Ticket Modal with pre-filled context
  const openCreateTicketWithAssistantContext = () => {
    if (!user) {
      showToast("Please sign in to submit a personalized support ticket.", "warning");
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    const lastUserMsg = [...assistantMessages].reverse().find((m) => m.sender === "user");
    setTicketSubject(lastUserMsg?.text || "Customer Care Assistance Required");
    setTicketDescription(
      lastUserMsg?.text
        ? `Issue details: ${lastUserMsg.text}\n\nTroubleshooting was attempted with the automated assistant but could not resolve the matter.`
        : "Assistance requested regarding luxury account or order operations."
    );
    setCreateTicketModalOpen(true);
  };

  // Handle Create Ticket Form Submit
  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      showToast("Please provide both a subject and detailed description.", "warning");
      return;
    }

    if (!user?.email) {
      showToast("Please sign in to lodge an authenticated support request.", "error");
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      setSubmittingTicket(true);
      const payload: CreateTicketPayload = {
        subject: ticketSubject.trim(),
        description: ticketDescription.trim(),
        category: ticketCategory,
        priority: ticketPriority,
        customerName: user.name || "Client",
        customerEmail: user.email,
        customerPhone: ticketPhone || user.phone,
        customerId: user._id,
        preferredContactMethod: ticketContactMethod,
        attachments: ticketAttachments,
        troubleshootingContext: troubleshootingSteps,
      };

      const res = await supportApi.createTicket(payload);
      showToast(res.message, "success");
      setCreateTicketModalOpen(false);

      // Reset form
      setTicketSubject("");
      setTicketDescription("");
      setTicketAttachments([]);
      setTroubleshootingSteps([]);

      // Reload user tickets and switch to tickets tab
      await loadUserTickets();
      setActiveTab("tickets");
    } catch (err: any) {
      showToast(err.message || "Failed to create support ticket.", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Handle Customer Reply to Active Ticket
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    try {
      setSendingReply(true);
      const res = await supportApi.replyTicket(
        selectedTicket.ticketId || selectedTicket._id,
        replyText.trim(),
        [],
        user?.email
      );
      showToast("Your response was delivered to Customer Care.", "success");
      setReplyText("");
      setSelectedTicket(res.ticket);
      setMyTickets((prev) =>
        prev.map((t) => (t.ticketId === res.ticket.ticketId ? res.ticket : t))
      );
    } catch (err: any) {
      showToast(err.message || "Failed to deliver message.", "error");
    } finally {
      setSendingReply(false);
    }
  };

  // Handle Reopen Ticket
  const handleReopenTicket = async () => {
    if (!selectedTicket) return;
    try {
      setReopening(true);
      const res = await supportApi.reopenTicket(
        selectedTicket.ticketId || selectedTicket._id,
        reopenReason.trim() || "Customer requested issue reopening",
        user?.email
      );
      showToast(res.message, "success");
      setShowReopenInput(false);
      setReopenReason("");
      setSelectedTicket(res.ticket);
      setMyTickets((prev) =>
        prev.map((t) => (t.ticketId === res.ticket.ticketId ? res.ticket : t))
      );
    } catch (err: any) {
      showToast(err.message || "Failed to reopen ticket.", "error");
    } finally {
      setReopening(false);
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors ${
      isLightMode ? "bg-neutral-50 text-neutral-900" : "bg-neutral-950 text-neutral-100"
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ======================================================== */}
        {/* 1. HERO HEADER WITH HOW CAN WE HELP YOU SEARCH BAR */}
        {/* ======================================================== */}
        <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all ${
          isLightMode
            ? "bg-gradient-to-br from-white via-amber-50/40 to-neutral-100 border-neutral-200/90 shadow-sm"
            : "bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 border-neutral-800 shadow-xl"
        }`}>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Headphones className="w-3.5 h-3.5" />
                <span>Customer Care & Support Concierge</span>
              </span>
              {user && (
                <span className="text-xs text-neutral-500 font-mono hidden sm:inline">
                  Client ID: {user.email}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              How can we assist you today?
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
              Explore approved guidelines, chat with our Intelligent Troubleshooting Concierge, or connect directly with our Customer Care management desk.
            </p>

            {/* Main Problem Search Bar */}
            <div className="mt-6 relative">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe your issue (e.g. track express delivery, bKash refund timeline, return courier)..."
                className={`w-full pl-12 pr-28 py-3.5 rounded-2xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                  isLightMode
                    ? "bg-white border border-neutral-300 text-neutral-900 shadow-sm placeholder-neutral-400 focus:border-amber-500"
                    : "bg-neutral-950/80 border border-neutral-800 text-white placeholder-neutral-500 focus:border-amber-500"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-24 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white text-xs cursor-pointer px-2 py-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {
                  if (searchQuery.trim()) {
                    handleAssistantSend(searchQuery.trim());
                    setActiveTab("assistant");
                  }
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SUB-NAVIGATION TABS */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "home"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : isLightMode
                  ? "text-neutral-700 hover:bg-neutral-200/60"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Knowledge Base & FAQs</span>
            </button>

            <button
              onClick={() => setActiveTab("assistant")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "assistant"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : isLightMode
                  ? "text-neutral-700 hover:bg-neutral-200/60"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Intelligent Assistant</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  showToast("Please sign in to track your personal support requests.", "info");
                  if (onOpenAuthModal) onOpenAuthModal();
                  return;
                }
                setActiveTab("tickets");
                loadUserTickets();
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                activeTab === "tickets"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : isLightMode
                  ? "text-neutral-700 hover:bg-neutral-200/60"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <LifeBuoy className="w-4 h-4" />
              <span>My Support Requests</span>
              {myTickets.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                  {myTickets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("hotlines")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "hotlines"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                  : isLightMode
                  ? "text-neutral-700 hover:bg-neutral-200/60"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Direct Hotlines ({hotlines.length})</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (!user) {
                showToast("Please sign in to lodge an authenticated support request.", "warning");
                if (onOpenAuthModal) onOpenAuthModal();
                return;
              }
              setCreateTicketModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Contact Customer Care</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: KNOWLEDGE BASE & APPROVED FAQS */}
        {/* ======================================================== */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : isLightMode
                      ? "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100"
                      : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:bg-neutral-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Articles Grid */}
            {loadingArticles ? (
              <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
                Loading verified knowledge base articles...
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className={`p-10 rounded-2xl text-center border ${
                isLightMode ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
              }`}>
                <HelpCircle className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base">No articles matched your search</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Try adjusting your keywords or describe your question to the Intelligent Assistant.
                </p>
                <button
                  onClick={() => setActiveTab("assistant")}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  Ask Intelligent Concierge
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredArticles.map((article) => (
                  <div
                    key={article._id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-md ${
                      isLightMode
                        ? "bg-white border-neutral-200/90 hover:border-neutral-300"
                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {article.category}
                        </span>
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>3 min read</span>
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug tracking-tight">
                        {article.title}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>

                      <div className={`mt-3 p-3 rounded-xl text-xs font-mono line-clamp-3 leading-relaxed ${
                        isLightMode ? "bg-neutral-50 text-neutral-700 border border-neutral-200" : "bg-neutral-950 text-neutral-300 border border-neutral-800"
                      }`}>
                        {article.content}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
                        <button
                          onClick={() => handleMarkHelpful(article._id)}
                          className="flex items-center gap-1 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Was this helpful?"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{article.helpfulCount || 0}</span>
                        </button>
                        <span>·</span>
                        <span>{article.viewsCount || 0} views</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopySolution(article._id, article.content)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                            isLightMode ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200" : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700"
                          }`}
                          title="Copy Solution"
                        >
                          {copiedArticleId === article._id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-amber-500" />
                          )}
                        </button>
                        <button
                          onClick={() => setViewingArticle(article)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Read Full</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Hotline Concierge Banner at bottom of FAQs */}
            <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isLightMode ? "bg-neutral-100 border-neutral-200" : "bg-neutral-900 border-neutral-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Need immediate human concierge support?
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Our verified executive lines and 24/7 emergency desks are standing by.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("hotlines")}
                className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
              >
                View Hotline Directory
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INTELLIGENT PROBLEM-SOLVING ASSISTANT */}
        {/* ======================================================== */}
        {activeTab === "assistant" && (
          <div className={`rounded-3xl border overflow-hidden flex flex-col h-[76vh] max-h-[820px] shadow-lg ${
            isLightMode ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
          }`}>
            {/* Assistant Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
              isLightMode ? "bg-neutral-50 border-neutral-200" : "bg-neutral-950 border-neutral-800"
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Intelligent Support Concierge
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      LIVE AI ASSISTANT
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Approved FAQ & Knowledge Base Reasoning Engine
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setAssistantMessages([
                      {
                        id: `msg_${Date.now()}`,
                        sender: "assistant",
                        text: `Session refreshed. How can I assist you with your luxury order or account today?`,
                        options: [
                          "Track My Order Dispatch",
                          "Returns & Refund Policy",
                          "Payment Verification & bKash",
                          "Contact Human Agent",
                        ],
                        timestamp: new Date(),
                      },
                    ]);
                    setTroubleshootingSteps([]);
                  }}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={openCreateTicketWithAssistantContext}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
                >
                  Connect to Human Agent
                </button>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${
              isLightMode ? "bg-neutral-50/50" : "bg-neutral-950/60"
            }`}>
              {assistantMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      msg.sender === "user"
                        ? "bg-amber-600 text-white rounded-tr-none"
                        : isLightMode
                        ? "bg-white text-neutral-800 border border-neutral-200 rounded-tl-none"
                        : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}

                    {/* Matched Articles Cards inside Assistant */}
                    {msg.articles && msg.articles.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Recommended Knowledge Base Guides:
                        </span>
                        {msg.articles.map((art) => (
                          <div
                            key={art._id}
                            onClick={() => setViewingArticle(art)}
                            className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500 cursor-pointer transition-colors"
                          >
                            <div className="font-bold text-xs text-neutral-900 dark:text-white flex items-center justify-between">
                              <span>{art.title}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                            </div>
                            <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                              {art.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resolution Prompt Buttons */}
                  {msg.isResolutionPrompt && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => handleResolutionDecision("resolved")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Yes, my issue is resolved</span>
                      </button>
                      <button
                        onClick={() => handleResolutionDecision("unresolved")}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>No, I still need help</span>
                      </button>
                    </div>
                  )}

                  {/* Options Chips */}
                  {msg.options && !msg.isResolutionPrompt && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            if (opt === "Create Support Ticket Now") {
                              openCreateTicketWithAssistantContext();
                            } else if (opt === "View Active Customer Care Hotlines" || opt === "Call Customer Care Hotline") {
                              setActiveTab("hotlines");
                            } else if (opt === "My Orders Tracker") {
                              onNavigate("profile");
                            } else {
                              handleAssistantSend(opt);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                            isLightMode
                              ? "bg-white hover:bg-neutral-100 text-neutral-800 border-neutral-300"
                              : "bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}

              {assistantThinking && (
                <div className="flex items-center gap-2 text-xs text-neutral-500 animate-pulse">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Assistant is analyzing approved knowledge base...</span>
                </div>
              )}
            </div>

            {/* Input Footer */}
            <div className={`p-3.5 border-t flex items-center gap-2 ${
              isLightMode ? "bg-white border-neutral-200" : "bg-neutral-950 border-neutral-800"
            }`}>
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAssistantSend(assistantInput);
                  }
                }}
                placeholder="Describe your issue or ask a question..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  isLightMode
                    ? "bg-neutral-100 border border-neutral-300 text-neutral-900"
                    : "bg-neutral-900 border border-neutral-800 text-white"
                }`}
              />
              <button
                onClick={() => handleAssistantSend(assistantInput)}
                disabled={!assistantInput.trim() || assistantThinking}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MY SUPPORT REQUESTS (USER TICKET TRACKING) */}
        {/* ======================================================== */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
                  My Support Requests
                </h2>
                <p className="text-xs text-neutral-500">
                  Track customer service investigations, review replies from human agents, and respond directly.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadUserTickets}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isLightMode ? "bg-white border-neutral-300 hover:bg-neutral-100 text-neutral-800" : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-200"
                  }`}
                  title="Refresh tickets"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setCreateTicketModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Request</span>
                </button>
              </div>
            </div>

            {loadingTickets ? (
              <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
                Fetching your support tickets...
              </div>
            ) : myTickets.length === 0 ? (
              <div className={`p-12 rounded-3xl text-center border ${
                isLightMode ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
              }`}>
                <LifeBuoy className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base text-neutral-900 dark:text-white">
                  No support requests yet
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  When you submit an inquiry to our Customer Care team, your ticket ID and real-time conversation timeline will appear here.
                </p>
                <button
                  onClick={() => setCreateTicketModalOpen(true)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Support Request</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTickets.map((ticket) => {
                  const statusColors: Record<string, string> = {
                    New: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                    Open: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                    "In Progress": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
                    "Waiting for Customer": "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30",
                    Escalated: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                    Resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    Closed: "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20",
                  };

                  return (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-amber-500/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isLightMode
                          ? "bg-white border-neutral-200 hover:shadow-md"
                          : "bg-neutral-900 border-neutral-800 hover:bg-neutral-850"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700">
                            {ticket.ticketId}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            statusColors[ticket.status] || "bg-neutral-500/10 text-neutral-400 border-neutral-700"
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            {ticket.category}
                          </span>
                          {ticket.priority === "Urgent" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              URGENT
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                          {ticket.subject}
                        </h3>

                        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-800">
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <span>View Conversation ({ticket.replies?.length || 1})</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: DIRECT CUSTOMER CARE HOTLINES (CONNECTED TO ADMIN) */}
        {/* ======================================================== */}
        {activeTab === "hotlines" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-serif font-bold text-neutral-900 dark:text-white">
                Live Customer Care Hotlines & Desks
              </h2>
              <p className="text-xs text-neutral-500">
                Direct phone and digital communication channels managed in real-time by the Executive Concierge Directorate.
              </p>
            </div>

            {loadingHotlines ? (
              <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
                Loading customer care directories...
              </div>
            ) : hotlines.length === 0 ? (
              <div className={`p-10 rounded-2xl text-center border ${
                isLightMode ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
              }`}>
                <PhoneCall className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-serif font-bold text-base">No active hotlines published</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Please submit a support ticket above, and our staff will reply directly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotlines.map((hotline) => (
                  <div
                    key={hotline.id}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-xs ${
                      isLightMode ? "bg-white border-neutral-200" : "bg-neutral-900 border-neutral-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {hotline.department}
                        </span>
                        {hotline.isEmergency ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            24/7 EMERGENCY
                          </span>
                        ) : hotline.isPriority ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            VIP PRIORITY
                          </span>
                        ) : null}
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                        {hotline.name}
                      </h3>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                        {hotline.description || "Direct communication channel for customer orders and verification."}
                      </p>

                      <div className="mt-4 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 space-y-1.5 text-xs font-mono">
                        <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold text-sm">
                          <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>{hotline.phoneNumber}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1 font-sans">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{hotline.operatingHours}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2">
                      <a
                        href={`tel:${hotline.phoneNumber.replace(/\s+/g, "")}`}
                        onClick={() => handleHotlineCall(hotline)}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer text-center"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call Now</span>
                      </a>

                      {hotline.whatsappNumber && (
                        <a
                          href={`https://wa.me/${hotline.whatsappNumber.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                          title="Open WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: VIEW FULL KNOWLEDGE ARTICLE MODAL */}
      {/* ======================================================== */}
      {viewingArticle && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setViewingArticle(null)}
        >
          <div
            className={`rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-auto border animate-in fade-in zoom-in-95 duration-200 ${
              isLightMode ? "bg-white border-neutral-200 text-neutral-900" : "bg-neutral-900 border-neutral-800 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {viewingArticle.category}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {viewingArticle.helpfulCount || 0} found this helpful
                </span>
              </div>
              <button
                onClick={() => setViewingArticle(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-serif font-bold tracking-tight">
              {viewingArticle.title}
            </h2>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed italic border-l-2 border-amber-500 pl-3">
              {viewingArticle.summary}
            </p>

            <div className={`p-5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
              isLightMode ? "bg-neutral-50 text-neutral-800 border border-neutral-200" : "bg-neutral-950 text-neutral-200 border border-neutral-800"
            }`}>
              {viewingArticle.content}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => handleCopySolution(viewingArticle._id, viewingArticle.content)}
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                {copiedArticleId === viewingArticle._id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Copy Instructions</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleMarkHelpful(viewingArticle._id)}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({viewingArticle.helpfulCount || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: USER TICKET CONVERSATION DRAWER */}
      {/* ======================================================== */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className={`rounded-3xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden my-auto border animate-in fade-in zoom-in-95 duration-200 ${
              isLightMode ? "bg-white border-neutral-200 text-neutral-900" : "bg-neutral-900 border-neutral-800 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-5 border-b flex items-start justify-between gap-4 ${
              isLightMode ? "bg-neutral-50 border-neutral-200" : "bg-neutral-950 border-neutral-800"
            }`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    {selectedTicket.ticketId}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                    Status: {selectedTicket.status}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="text-base font-bold tracking-tight">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conversation Messages Thread */}
            <div className={`flex-1 overflow-y-auto p-5 space-y-4 ${
              isLightMode ? "bg-neutral-50/50" : "bg-neutral-950/70"
            }`}>
              <div className="text-center">
                <span className="text-[11px] font-mono text-neutral-400 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                  Ticket opened on {new Date(selectedTicket.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {(selectedTicket.replies || []).map((reply, idx) => (
                <div
                  key={reply.id || idx}
                  className={`flex flex-col ${
                    reply.authorType === "customer" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-bold text-neutral-500">
                      {reply.authorType === "customer" ? "You" : reply.authorName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(reply.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      reply.authorType === "customer"
                        ? "bg-amber-600 text-white rounded-tr-none"
                        : isLightMode
                        ? "bg-white text-neutral-800 border border-neutral-200 rounded-tl-none"
                        : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tl-none"
                    }`}
                  >
                    {reply.message}

                    {reply.attachments && reply.attachments.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/20 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                          Attachments:
                        </span>
                        {reply.attachments.map((att, aIdx) => (
                          <div key={aIdx} className="text-xs flex items-center gap-1.5 underline">
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reopen Box (if resolved/closed) */}
            {(selectedTicket.status === "Resolved" || selectedTicket.status === "Closed") && (
              <div className="p-3 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    This inquiry was marked as {selectedTicket.status}.
                  </span>
                  <p className="text-[11px] text-neutral-500">
                    Still need help with this specific matter? You can reopen the active investigation.
                  </p>
                </div>
                {!showReopenInput ? (
                  <button
                    onClick={() => setShowReopenInput(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer shrink-0"
                  >
                    Reopen Request
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      placeholder="Reason for reopening..."
                      className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                    />
                    <button
                      onClick={handleReopenTicket}
                      disabled={reopening}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold cursor-pointer"
                    >
                      {reopening ? "Reopening..." : "Confirm"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Reply Input Box */}
            <div className={`p-4 border-t flex items-center gap-2 ${
              isLightMode ? "bg-white border-neutral-200" : "bg-neutral-950 border-neutral-800"
            }`}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                placeholder="Type your response to Customer Care..."
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  isLightMode
                    ? "bg-neutral-100 border border-neutral-300 text-neutral-900"
                    : "bg-neutral-900 border border-neutral-800 text-white"
                }`}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sendingReply}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Reply</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE NEW SUPPORT TICKET MODAL */}
      {/* ======================================================== */}
      {createTicketModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setCreateTicketModalOpen(false)}
        >
          <div
            className={`rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-auto border animate-in fade-in zoom-in-95 duration-200 ${
              isLightMode ? "bg-white border-neutral-200 text-neutral-900" : "bg-neutral-900 border-neutral-800 text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold">
                    Lodge Customer Care Request
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Direct integration with Admin Customer Care System
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateTicketModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1 text-neutral-700 dark:text-neutral-300">
                  Issue Title / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Brief summary (e.g. Courier delivery delay for order AN-5201)..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                    isLightMode ? "bg-neutral-50 border border-neutral-300 text-neutral-900" : "bg-neutral-950 border border-neutral-800 text-white"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase font-mono mb-1 text-neutral-700 dark:text-neutral-300">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      isLightMode ? "bg-neutral-50 border border-neutral-300 text-neutral-900" : "bg-neutral-950 border border-neutral-800 text-white"
                    }`}
                  >
                    <option value="Orders & Delivery">Orders & Delivery</option>
                    <option value="Payments & Refunds">Payments & Refunds</option>
                    <option value="Account & Security">Account & Security</option>
                    <option value="Returns Policy">Returns Policy</option>
                    <option value="Technical Issues">Technical Issues</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono mb-1 text-neutral-700 dark:text-neutral-300">
                    Priority Level
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      isLightMode ? "bg-neutral-50 border border-neutral-300 text-neutral-900" : "bg-neutral-950 border border-neutral-800 text-white"
                    }`}
                  >
                    <option value="Low">Low (General guidance)</option>
                    <option value="Normal">Normal (Standard priority)</option>
                    <option value="High">High (Impending delivery/order)</option>
                    <option value="Urgent">Urgent (Payment or fraud flag)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase font-mono mb-1 text-neutral-700 dark:text-neutral-300">
                    Preferred Contact
                  </label>
                  <select
                    value={ticketContactMethod}
                    onChange={(e) => setTicketContactMethod(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      isLightMode ? "bg-neutral-50 border border-neutral-300 text-neutral-900" : "bg-neutral-950 border border-neutral-800 text-white"
                    }`}
                  >
                    <option value="Email">Email Message</option>
                    <option value="Phone">Direct Phone Call</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase font-mono mb-1 text-neutral-700 dark:text-neutral-300">
                  Detailed Problem Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Provide full description of your issue, related order number, or relevant circumstances..."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed ${
                    isLightMode ? "bg-neutral-50 border border-neutral-300 text-neutral-900" : "bg-neutral-950 border border-neutral-800 text-white"
                  }`}
                />
              </div>

              {/* Troubleshooting Context Notice if present */}
              {troubleshootingSteps.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    🤖 Assistant Troubleshooting Context Attached:
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Your {troubleshootingSteps.length} previous troubleshooting step(s) will be automatically provided to the Customer Care staff so they can assist you faster without asking duplicate questions.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCreateTicketModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/25 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {submittingTicket ? "Submitting Request..." : "Submit Support Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
