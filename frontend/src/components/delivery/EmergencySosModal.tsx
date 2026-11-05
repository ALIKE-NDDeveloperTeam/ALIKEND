import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Phone,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  X,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { deliveryPartnerApi } from '../../services/deliveryPartnerApi';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
  activeTaskId?: string;
  showToast?: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  isLightMode?: boolean;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  partner,
  activeTaskId,
  showToast,
  isLightMode = false,
}) => {
  const [countdown, setCountdown] = useState<number>(3);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [dispatched, setDispatched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [incidentData, setIncidentData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setIsCountingDown(true);
      setDispatched(false);
      setLoading(false);
      return;
    }

    // Auto-countdown 3 seconds
    let timer: any = null;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      handleTriggerSos();
    }
    return () => clearTimeout(timer);
  }, [isOpen, countdown, isCountingDown]);

  const handleTriggerSos = async () => {
    try {
      setLoading(true);
      setIsCountingDown(false);

      // Attempt to acquire fresh GPS if available
      let lat = partner?.currentLocation?.lat || 28.6139;
      let lng = partner?.currentLocation?.lng || 77.209;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Fall back to saved coords
        }
      }

      const res = await deliveryPartnerApi.triggerEmergencySos({
        lat,
        lng,
        taskId: activeTaskId,
      });

      setIncidentData(res);
      setDispatched(true);
      showToast?.('🚨 EMERGENCY SOS DISPATCHED: Ops Desk and Emergency Services alerted!', 'error');
    } catch (err: any) {
      showToast?.(err.message || 'Failed to dispatch SOS', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
    onClose();
    showToast?.('Emergency SOS cancelled.', 'info');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl relative space-y-5 ${
          isLightMode
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-neutral-900 border-neutral-800 text-white'
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-800/50 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Pre-dispatch Countdown View */}
        {isCountingDown && (
          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 rounded-full bg-rose-600/20 text-rose-500 border-2 border-rose-500 flex items-center justify-center mx-auto animate-pulse">
              <span className="text-4xl font-black font-mono">{countdown}</span>
            </div>

            <div>
              <span className="text-xs uppercase font-black tracking-widest text-rose-500 block">
                EMERGENCY DISTRESS ACTIVATING
              </span>
              <h3 className="text-xl font-black text-rose-500 mt-1">
                Dispatching Emergency SOS...
              </h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto">
                Dispatches your live coordinates to ALIKE Safety Control Desk, police (112), and your emergency contacts.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelCountdown}
                className="flex-1 py-3 px-4 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Cancel / False Alarm
              </button>

              <button
                type="button"
                onClick={handleTriggerSos}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Trigger Immediately
              </button>
            </div>
          </div>
        )}

        {/* 2. Loading State */}
        {loading && (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
            <h4 className="text-sm font-black text-white">Transmitting Live GPS Telemetry...</h4>
            <p className="text-xs text-neutral-400">Alerting Central Ops & Emergency Response Unit</p>
          </div>
        )}

        {/* 3. Dispatched State & Quick Dial Buttons */}
        {dispatched && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-400">SOS Signal Live & Active</h4>
                <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                  Reference: <span className="font-mono font-bold text-white">{incidentData?.incidentId || 'SOS-ACTIVE'}</span>. Central operations team is monitoring your location.
                </p>
              </div>
            </div>

            {/* Quick Emergency Helplines */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-neutral-400 block">
                Instant 1-Tap Emergency Calling
              </span>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:112"
                  className="p-3 rounded-xl bg-red-600/20 border border-red-500/40 hover:bg-red-600/30 text-red-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-red-400" />
                  <div>
                    <span className="text-xs font-black block text-white">Call Police</span>
                    <span className="text-[10px] text-red-300">Dial 112</span>
                  </div>
                </a>

                <a
                  href="tel:108"
                  className="p-3 rounded-xl bg-amber-600/20 border border-amber-500/40 hover:bg-amber-600/30 text-amber-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-black block text-white">Call Ambulance</span>
                    <span className="text-[10px] text-amber-300">Dial 108</span>
                  </div>
                </a>

                <a
                  href="tel:+911140007233"
                  className="p-3 rounded-xl bg-blue-600/20 border border-blue-500/40 hover:bg-blue-600/30 text-blue-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-xs font-black block text-white">ALIKE Safety Desk</span>
                    <span className="text-[10px] text-blue-300">24x7 Priority Desk</span>
                  </div>
                </a>

                <a
                  href={`tel:${partner?.emergencyContact?.phone || '9876543210'}`}
                  className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-black block text-white">Emergency Contact</span>
                    <span className="text-[10px] text-emerald-300">
                      {partner?.emergencyContact?.name || 'Family Contact'}
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Safety Guidance */}
            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-300 space-y-1">
              <span className="font-bold text-neutral-200 block">Immediate Protocol:</span>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-400 text-[11px]">
                <li>Move to a safe, well-lit public area or commercial storefront.</li>
                <li>Keep your mobile phone volume on loud. Ops desk is initiating an outbound call.</li>
                <li>If injured, remain still and accept medical assistance upon ambulance arrival.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              I Am Safe Now / Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
