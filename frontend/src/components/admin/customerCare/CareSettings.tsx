import React, { useState } from "react";
import {
  Settings,
  Save,
  Clock,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  Bell,
  Sparkles,
} from "lucide-react";

interface CareSettingsProps {
  settings: any;
  loading: boolean;
  onUpdate: (data: any) => Promise<void>;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
  isSuperAdmin: boolean;
}

export default function CareSettings({
  settings,
  loading,
  onUpdate,
  onShowToast,
  isSuperAdmin,
}: CareSettingsProps) {
  const [formData, setFormData] = useState({
    autoResponderEnabled: settings?.autoResponderEnabled ?? true,
    autoResponderMessage:
      settings?.autoResponderMessage ||
      "Thank you for contacting ALIKE-ND Customer Care. An authorized representative will assist you within 15 minutes.",
    workingHoursNotice:
      settings?.workingHoursNotice ||
      "Live phone hotlines are operational 24/7 for Executive & Emergency lines. Standard departments operate 08:00 AM to 11:00 PM.",
    emergencyBannerText:
      settings?.emergencyBannerText ||
      "⚡ 24/7 Emergency Line is actively monitoring transit, payment security, and priority concierge requests.",
    emergencyBannerActive: settings?.emergencyBannerActive ?? true,
    whatsappChatEnabled: settings?.whatsappChatEnabled ?? true,
    emailNotificationsEnabled: settings?.emailNotificationsEnabled ?? true,
    defaultSlaHours: settings?.defaultSlaHours || 12,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdate(formData);
      onShowToast("Customer Care global settings saved successfully.", "success");
    } catch (err: any) {
      onShowToast(err.message || "Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Customer Care Operations & Notice Settings
              </h2>
              <p className="text-xs text-neutral-400">
                Configure auto-responder greeting banners, emergency ticker alerts, operating hour disclosures, and default SLA targets.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Auto Responder Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Automated First-Contact Responder</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoResponderEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, autoResponderEnabled: e.target.checked })
                }
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="text-xs text-neutral-300 font-medium">Auto-reply Enabled</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
              Auto-Responder Confirmation Message
            </label>
            <textarea
              rows={3}
              value={formData.autoResponderMessage}
              onChange={(e) =>
                setFormData({ ...formData, autoResponderMessage: e.target.value })
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Sent immediately to customers upon registering an inquiry or order tracking ticket.
            </p>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Emergency Broadcast Notice</h3>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emergencyBannerActive}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyBannerActive: e.target.checked })
                }
                className="rounded text-rose-500 focus:ring-rose-400"
              />
              <span className="text-xs text-neutral-300 font-medium">Broadcast Active</span>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
              Emergency Notice Banner Text
            </label>
            <input
              type="text"
              value={formData.emergencyBannerText}
              onChange={(e) =>
                setFormData({ ...formData, emergencyBannerText: e.target.value })
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Operating Hours & SLA */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Operating Disclosures & SLA Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
                Published Operating Hours Notice
              </label>
              <textarea
                rows={2}
                value={formData.workingHoursNotice}
                onChange={(e) =>
                  setFormData({ ...formData, workingHoursNotice: e.target.value })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase mb-1">
                Default Ticket SLA (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={72}
                value={formData.defaultSlaHours}
                onChange={(e) =>
                  setFormData({ ...formData, defaultSlaHours: Number(e.target.value) || 12 })
                }
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Tickets unaddressed past this duration flag an SLA breach warning.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
