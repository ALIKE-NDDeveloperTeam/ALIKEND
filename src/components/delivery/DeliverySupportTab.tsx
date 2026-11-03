import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Send,
  Loader2,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Check,
  Info
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface DeliverySupportTabProps {
  partner: any;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliverySupportTab: React.FC<DeliverySupportTabProps> = ({
  partner,
  showToast,
  isLightMode = false,
}) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState<boolean>(true);

  // Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState<boolean>(true);
  const [chatInput, setChatInput] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnnouncements();
    loadChat();
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const res = await deliveryPartnerApi.getAnnouncements();
      setAnnouncements(res.announcements || []);
    } catch (err: any) {
      console.warn('Failed to load announcements:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const loadChat = async () => {
    try {
      setLoadingChat(true);
      const res = await deliveryPartnerApi.getSupportChat();
      setChatMessages(res.messages || []);
    } catch (err: any) {
      console.warn('Failed to load chat:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await deliveryPartnerApi.markAnnouncementRead(id);
      setAnnouncements((prev) =>
        prev.map((a) => (a.announcementId === id ? { ...a, isRead: true } : a))
      );
      showToast?.('Announcement marked as read.', 'info');
    } catch (err: any) {
      console.warn('Failed to mark read:', err);
    }
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    try {
      setSendingChat(true);
      setChatInput('');
      const res = await deliveryPartnerApi.sendSupportChat(text);
      setChatMessages(res.messages || []);
    } catch (err: any) {
      showToast?.(err.message || 'Failed to send message', 'error');
    } finally {
      setSendingChat(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Helplines & Direct Phone Calling Strip */}
      <div
        className={`p-5 rounded-3xl border shadow-lg ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider">Direct Support Helplines</h3>
            <p className="text-xs text-neutral-400">Immediate telephone assistance for on-duty riders</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Support Line Online</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="tel:+911140007233"
            className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 hover:border-amber-500/60 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">ALIKE Partner Hotline</span>
              <span className="text-[11px] text-amber-400 font-mono">+91 11-4000-SAFE</span>
              <span className="text-[9px] text-neutral-500 block">Toll-Free Priority</span>
            </div>
          </a>

          <a
            href="tel:112"
            className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 hover:border-red-500/60 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">Police Emergency</span>
              <span className="text-[11px] text-red-400 font-mono">Dial 112</span>
              <span className="text-[9px] text-neutral-500 block">National Emergency</span>
            </div>
          </a>

          <a
            href="tel:108"
            className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 hover:border-blue-500/60 flex items-center gap-3 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black text-white block">Ambulance Emergency</span>
              <span className="text-[11px] text-blue-400 font-mono">Dial 108</span>
              <span className="text-[9px] text-neutral-500 block">Medical Dispatch</span>
            </div>
          </a>
        </div>
      </div>

      {/* 2. Notification & Announcement Centre (Rule 9) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#FF007F]" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Announcements & Incentive Schemes
              </h3>
              <p className="text-xs text-neutral-400">Official operations notices and sprint bonuses</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadAnnouncements}
            className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {loadingAnnouncements && (
          <div className="py-6 text-center text-xs text-neutral-400">Loading notices...</div>
        )}

        {!loadingAnnouncements && announcements.length === 0 && (
          <div className="py-6 text-center text-xs text-neutral-500">No active announcements.</div>
        )}

        {!loadingAnnouncements && announcements.length > 0 && (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.announcementId}
                className={`p-4 rounded-2xl border transition-all ${
                  ann.isRead
                    ? 'bg-black/20 border-neutral-800/60 opacity-80'
                    : 'bg-black/40 border-neutral-700 ring-1 ring-[#FF007F]/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {ann.badge && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF007F]/20 text-[#FF007F]">
                          {ann.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 font-semibold capitalize">
                        {ann.category}
                      </span>
                      {!ann.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF007F] animate-ping" />
                      )}
                    </div>

                    <h4 className="text-xs font-black text-white">{ann.title}</h4>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{ann.content}</p>
                  </div>

                  <div className="sm:self-end pt-2 sm:pt-0">
                    {!ann.isRead ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(ann.announcementId)}
                        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[10px] font-bold text-neutral-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        <span>Read</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. In-App 24x7 Partner Live Chat (Rule 2) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">In-App Live Support Chat</h3>
              <p className="text-xs text-neutral-400">Direct channel to Dispatch & Operational Desk</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            Average Response: &lt;1 min
          </span>
        </div>

        {/* Quick Issue Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {[
            'Store closed / denied dispatch',
            'Customer not picking up phone',
            'Payout query / wallet status',
            'Accident assistance needed',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendChat(chip)}
              className="px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 whitespace-nowrap cursor-pointer transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="h-64 overflow-y-auto p-4 rounded-2xl bg-black/40 border border-neutral-800 space-y-3">
          {loadingChat && (
            <div className="py-12 text-center text-xs text-neutral-500">Connecting to Support Desk...</div>
          )}

          {!loadingChat &&
            chatMessages.map((msg) => {
              const isPartner = msg.sender === 'partner';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isPartner ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[9px] text-neutral-500 mb-0.5 px-1 font-semibold">
                    {isPartner ? 'You' : 'ALIKE Support Desk'}
                  </span>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isPartner
                        ? 'bg-[#FF007F] text-white rounded-tr-none'
                        : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-neutral-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-neutral-500 mt-0.5 px-1">{msg.time || 'Just now'}</span>
                </div>
              );
            })}
          <div ref={chatScrollRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type your message to operations..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FF007F]"
          />
          <button
            type="submit"
            disabled={sendingChat || !chatInput.trim()}
            className="px-5 py-2.5 bg-[#FF007F] hover:bg-[#FF007F]/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-[#FF007F]/20"
          >
            {sendingChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
