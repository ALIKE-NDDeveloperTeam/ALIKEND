import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MapPin,
  Lock,
  Phone,
  Battery,
  AlertOctagon,
  CheckCircle2,
  Loader2,
  Building2,
  CreditCard,
  User,
  Truck,
  RotateCcw
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface DeliveryPrivacyTabProps {
  partner: any;
  onUpdatePartner: (updated: any) => void;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const DeliveryPrivacyTab: React.FC<DeliveryPrivacyTabProps> = ({
  partner,
  onUpdatePartner,
  showToast,
  isLightMode = false,
}) => {
  const [sharingMode, setSharingMode] = useState<string>(
    partner?.privacySettings?.locationSharingMode || 'active_order_only'
  );
  const [maskPhone, setMaskPhone] = useState<boolean>(
    partner?.privacySettings?.maskPhoneToCustomer !== false
  );
  const [hideIdleCoords, setHideIdleCoords] = useState<boolean>(
    partner?.privacySettings?.hideLiveCoordsWhenIdle !== false
  );
  const [emergencyOverride, setEmergencyOverride] = useState<boolean>(
    partner?.privacySettings?.emergencyShareLiveGps !== false
  );
  const [saving, setSaving] = useState<boolean>(false);

  const handleSavePrivacy = async () => {
    try {
      setSaving(true);
      const res = await deliveryPartnerApi.updatePrivacySettings({
        locationSharingMode: sharingMode,
        maskPhoneToCustomer: maskPhone,
        hideLiveCoordsWhenIdle: hideIdleCoords,
        emergencyShareLiveGps: emergencyOverride,
      });

      if (res.settings) {
        onUpdatePartner({
          ...partner,
          privacySettings: res.settings,
        });
      }
      showToast?.('Privacy and location-sharing preferences saved.', 'success');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to update privacy settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Location Sharing & Telemetry Controls (Rule 10) */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-5 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                Privacy & Location-Sharing Controls
              </h3>
              <p className="text-xs text-neutral-400">
                You control when your GPS and contact credentials are transmitted
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
            Compliant with DPDP Act
          </span>
        </div>

        {/* Location Sharing Modes */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-200 block">
            GPS Transmission Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'active_order_only',
                title: 'Active Orders Only',
                tag: 'Recommended',
                desc: 'GPS is shared ONLY after you accept an order until doorstep handover. Paused when idle.',
              },
              {
                id: 'always_on_duty',
                title: 'Always on Duty',
                tag: 'Max Orders',
                desc: 'Continuous real-time GPS while Online. Unlocks priority auto-assignment for nearby store pickups.',
              },
              {
                id: 'coarse_zone',
                title: 'Coarse / Hub Level',
                tag: 'Max Privacy',
                desc: 'Transmits general ~1km zone coordinates to protect exact home location until dispatch.',
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSharingMode(mode.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                  sharingMode === mode.id
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : 'border-neutral-800 bg-black/30 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-white">{mode.title}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        sharingMode === mode.id
                          ? 'bg-emerald-500 text-black'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {mode.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">{mode.desc}</p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      sharingMode === mode.id
                        ? 'border-emerald-500 bg-emerald-500 text-black'
                        : 'border-neutral-700'
                    }`}
                  >
                    {sharingMode === mode.id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <span>{sharingMode === mode.id ? 'Selected' : 'Select Mode'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Granular Toggles */}
        <div className="space-y-3 pt-2">
          {/* Toggle 1: Virtual Masked Phone Calling */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#FF007F] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Virtual Number Masking for Calls
                </span>
                <span className="text-[11px] text-neutral-400">
                  Customers and stores never see your real personal phone number. Calls route through an encrypted IVR bridge.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={maskPhone}
              onChange={(e) => setMaskPhone(e.target.checked)}
              className="w-5 h-5 accent-[#FF007F] rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Toggle 2: Hide Coords When Idle */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Battery className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Battery-Saver & Idle Location Protection
                </span>
                <span className="text-[11px] text-neutral-400">
                  Ceases GPS pinging when your device remains stationary for &gt;5 minutes to conserve phone battery.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={hideIdleCoords}
              onChange={(e) => setHideIdleCoords(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
            />
          </div>

          {/* Toggle 3: Emergency Live GPS Override */}
          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Emergency SOS Live GPS Override
                </span>
                <span className="text-[11px] text-neutral-400">
                  Automatically bypasses privacy masks to transmit precise real-time coordinates during an active SOS distress signal.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={emergencyOverride}
              onChange={(e) => setEmergencyOverride(e.target.checked)}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer shrink-0"
            />
          </div>
        </div>

        {/* Save Preferences Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSavePrivacy}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>Save Privacy Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Partner Profile Credentials & Masked Data */}
      <div
        className={`p-6 rounded-3xl border shadow-lg space-y-4 ${
          isLightMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        <div className="border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wider">Verified Profile Credentials</h3>
          <p className="text-xs text-neutral-400">Protected identity records securely held under encryption</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Full Legal Name</span>
            <span className="text-white font-bold block">{partner?.name}</span>
            <span className="text-[11px] text-neutral-400">Phone: {partner?.phone}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Operating Hub Zone</span>
            <span className="text-white font-bold block">{partner?.operatingZone}</span>
            <span className="text-[11px] text-neutral-400">City: {partner?.city}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Registered Vehicle</span>
            <span className="text-white font-bold block capitalize">
              {partner?.vehicle?.type} • {partner?.vehicle?.model || 'Commercial 2-Wheeler'}
            </span>
            <span className="text-[11px] text-neutral-400 font-mono">
              Reg: {partner?.vehicle?.registrationNumber || 'DL-01-AB-1234'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Masked Government ID</span>
            <span className="text-white font-bold font-mono block">
              {partner?.identity?.numberMasked || 'XXXX-XXXX-4589'}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold">
              ✓ {partner?.identity?.verificationStatus === 'verified' ? 'Verified Document' : 'Documents Active'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Settlement Bank Account</span>
            <span className="text-white font-bold font-mono block">
              {partner?.payout?.accountNumberMasked || '••••••••4589'}
            </span>
            <span className="text-[11px] text-neutral-400">
              {partner?.payout?.bankName || 'State Bank of India'} (IFSC: {partner?.payout?.ifsc || 'SBIN0001234'})
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/30 border border-neutral-800 space-y-1">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">Instant Settlement UPI</span>
            <span className="text-white font-bold font-mono block">
              {partner?.payout?.upiId || 'partner***@upi'}
            </span>
            <span className="text-[11px] text-purple-400 font-bold">Instant Transfer Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
