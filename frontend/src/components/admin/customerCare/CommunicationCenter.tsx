import React, { useState } from "react";
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  Copy,
  Check,
} from "lucide-react";

interface CommunicationCenterProps {
  cannedTemplates: Array<{ id: string; title: string; category: string; body: string }>;
  hotlines: any[];
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function CommunicationCenter({
  cannedTemplates,
  hotlines,
  onShowToast,
}: CommunicationCenterProps) {
  const [waNumber, setWaNumber] = useState("+880 1700-000000");
  const [waMessage, setWaMessage] = useState("");
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  const handleOpenWhatsApp = () => {
    const cleanDigits = waNumber.replace(/\D/g, "");
    if (cleanDigits.length < 8) {
      onShowToast("Please enter a valid phone number with country code.", "error");
      return;
    }
    const encoded = encodeURIComponent(waMessage);
    const url = `https://wa.me/${cleanDigits}?text=${encoded}`;
    window.open(url, "_blank");
    onShowToast("WhatsApp direct chat window opened.", "success");
  };

  const handleCopyTemplate = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedTemplateId(id);
    onShowToast("Message template copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const setCopiedId = (val: string | null) => setCopiedTemplateId(val);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Unified Customer Communication Center
              </h2>
              <p className="text-xs text-neutral-400">
                Official WhatsApp client bridge, verified outbound notification channels, and high-conversion message templates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Outbound Gateways Active</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* WhatsApp Direct Messaging Composer */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Official WhatsApp Concierge Dispatch</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded">
              DIRECT API LINK
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            Send instant WhatsApp dispatch notifications, address queries, or VIP concierge introductions
            directly through the customer's phone link without storing personal WhatsApp cookies.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                Recipient Customer Mobile * (With Country Code)
              </label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="+880 1711223344"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-300 uppercase mb-1">
                Message Content *
              </label>
              <textarea
                rows={5}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                placeholder="Greetings from ALIKE-ND! Regarding your inquiry..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              onClick={handleOpenWhatsApp}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Launch Official WhatsApp Chat</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Message Templates & Canned Quick Responses */}
        <div className="lg:col-span-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Verified Canned Message Templates</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded">
                QUICK INSERT
              </span>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              Click "Insert into WhatsApp" to quickly prefill or copy response to clipboard for ticket replies.
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {cannedTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{tpl.title}</span>
                    <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{tpl.body}</p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopyTemplate(tpl.id, tpl.body)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedTemplateId === tpl.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-amber-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setWaMessage(tpl.body);
                        onShowToast("Inserted template into WhatsApp composer.", "success");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Insert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-500">
            Canned responses enforce consistent customer service voice across all agents.
          </div>
        </div>
      </div>
    </div>
  );
}
