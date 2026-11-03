import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Plus,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Copy,
  Check,
  Eye,
  ThumbsUp,
  Tag,
  Sparkles,
  X,
} from "lucide-react";

export interface KnowledgeArticleItem {
  _id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  status: "published" | "draft" | "archived";
  viewsCount: number;
  helpfulCount: number;
  tags: string[];
  author: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface KnowledgeBaseManagerProps {
  articles: KnowledgeArticleItem[];
  loading: boolean;
  onRefresh: () => void;
  onCreateArticle: (data: any) => Promise<void>;
  onUpdateArticle: (id: string, data: any) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

const FAQ_CATEGORIES = [
  "All Categories",
  "Orders & Delivery",
  "Payments & Refunds",
  "Account & Security",
  "Seller Guidelines",
  "Returns Policy",
  "Troubleshooting",
];

export default function KnowledgeBaseManager({
  articles,
  loading,
  onRefresh,
  onCreateArticle,
  onUpdateArticle,
  onDeleteArticle,
  onShowToast,
  isSuperAdmin,
}: KnowledgeBaseManagerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<KnowledgeArticleItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Orders & Delivery",
    summary: "",
    content: "",
    status: "published" as const,
    tags: "",
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
    setEditingArticle(null);
    setFormData({
      title: "",
      category: "Orders & Delivery",
      summary: "",
      content: "",
      status: "published",
      tags: "Fulfillment, Tracking",
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (a: KnowledgeArticleItem) => {
    setEditingArticle(a);
    setFormData({
      title: a.title,
      category: a.category,
      summary: a.summary,
      content: a.content,
      status: a.status as any,
      tags: (a.tags || []).join(", "),
    });
    setModalOpen(true);
  };

  const handleCopySolution = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    onShowToast("Solution copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      onShowToast("Title and content are required.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingArticle) {
        await onUpdateArticle(editingArticle._id, payload);
        onShowToast(`Article "${formData.title}" updated.`, "success");
      } else {
        await onCreateArticle(payload);
        onShowToast(`Article "${formData.title}" published.`, "success");
      }
      setModalOpen(false);
    } catch (err: any) {
      onShowToast(err.message || "Failed to save article.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = articles.filter((a) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(term) ||
      a.summary.toLowerCase().includes(term) ||
      a.content.toLowerCase().includes(term);

    const matchesCat = categoryFilter === "All Categories" || a.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 rounded-xl text-amber-700 dark:text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-wide">
                Knowledge Base & FAQ Management
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Customer self-help guides, verified policies, troubleshooting instructions, and instant ticket response solutions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Refresh Articles
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles by title, summary, keywords..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="md:col-span-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer transition-colors"
          >
            {FAQ_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center text-neutral-500 text-sm animate-pulse">
          Loading knowledge base articles...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-8 shadow-sm">
          <HelpCircle className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-neutral-800 dark:text-neutral-200 font-semibold text-sm">No articles found</h3>
          <p className="text-neutral-500 text-xs mt-1">Click "Create Article" to write approved FAQs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article) => (
            <div
              key={article._id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400">
                      {article.category}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        article.status === "published"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                          : article.status === "draft"
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                          : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400"
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(article)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Edit Article"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => onDeleteArticle(article._id)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:text-neutral-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Article Title - Crystal Clear in Light & Dark Mode */}
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight leading-snug">
                  {article.title}
                </h3>
                
                {/* Summary / Subtitle */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                  {article.summary}
                </p>

                {/* Article Content / Solution Box - High Contrast, Perfectly Readable */}
                <div className="mt-3 p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
                  {article.content}
                </div>
              </div>

              {/* Bottom Footer with Copy Solution Button and Stats */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{article.viewsCount || 0} views</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{article.helpfulCount || 0} helpful</span>
                  </span>
                </div>

                <button
                  onClick={() => handleCopySolution(article._id, article.content)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedId === article._id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Copy Solution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Article Modal Portal */}
      {modalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>{editingArticle ? "FAQ তথ্য সম্পাদনা করুন (Edit Article)" : "নতুন FAQ আর্টিকেল তৈরি করুন (Create Article)"}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    {editingArticle ? `Editing ID: ${editingArticle._id.slice(-8)}` : "Knowledge Base & Customer Self-Help Registry"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  Article Title (প্রশ্ন বা শিরোনাম) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="যেমন: How do I track my order or exchange an item?"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    ক্যাটাগরি (Category) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer font-medium"
                  >
                    {FAQ_CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                      <option key={c} value={c} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                    পাবলিশ স্ট্যাটাস (Publish Status)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 cursor-pointer font-medium"
                  >
                    <option value="published">Published (সবার জন্য উন্মুক্ত)</option>
                    <option value="draft">Draft (ড্রাফট মোড)</option>
                    <option value="archived">Archived (আর্কাইভ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  সংক্ষিপ্ত সারাংশ (Summary / Teaser)
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Short 1-line overview for customer search results..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  বিস্তারিত সমাধান ও ধাপসমূহ (Article Body & Instructions) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="ধাপ ১: ...&#10;ধাপ ২: ...&#10;Provide detailed step-by-step instructions, policy details, or troubleshooting steps..."
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 resize-none font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase font-mono mb-1">
                  কীওয়ার্ড / ট্যাগ (Keywords / Tags)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Tracking, Refund, bKash, Courier, Escrow"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  বাতিল (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-amber-600/25 cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {submitting ? (
                    "সংরক্ষণ হচ্ছে..."
                  ) : editingArticle ? (
                    "আপডেট সম্পন্ন করুন (Update Article)"
                  ) : (
                    "আর্টিকেল প্রকাশ করুন (Publish Article)"
                  )}
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
