import React, { useState, useEffect } from 'react';
import { BatteryCharging, ShieldCheck, Zap, X, CheckCircle2, ArrowRight, Settings, ExternalLink } from 'lucide-react';

interface BatteryOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BatteryOptimizationModal: React.FC<BatteryOptimizationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isIgnored, setIsIgnored] = useState<boolean>(false);
  const [hasOpenedSettings, setHasOpenedSettings] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setHasOpenedSettings(false);
      return;
    }

    try {
      const bridge = (window as any).AndroidRadioBridge;
      if (bridge && typeof bridge.isBatteryOptimizationIgnored === 'function') {
        setIsIgnored(Boolean(bridge.isBatteryOptimizationIgnored()));
      }
    } catch {
      // Ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenBatterySettings = () => {
    setHasOpenedSettings(true);
    try {
      const bridge = (window as any).AndroidRadioBridge;
      if (bridge && typeof bridge.requestIgnoreBatteryOptimization === 'function') {
        bridge.requestIgnoreBatteryOptimization();
      } else if (bridge && typeof bridge.openAppDetailsSettings === 'function') {
        bridge.openAppDetailsSettings();
      }
    } catch (err) {
      console.warn('Battery optimization request notice:', err);
    }

    try {
      localStorage.setItem('rdiogo_battery_opt_prompted', 'true');
    } catch {
      // Ignore
    }

    onSuccess?.();
  };

  const handleOpenAppDetails = () => {
    try {
      const bridge = (window as any).AndroidRadioBridge;
      if (bridge && typeof bridge.openAppDetailsSettings === 'function') {
        bridge.openAppDetailsSettings();
      } else if (bridge && typeof bridge.requestIgnoreBatteryOptimization === 'function') {
        bridge.requestIgnoreBatteryOptimization();
      }
    } catch (err) {
      console.warn('App details settings open notice:', err);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('rdiogo_battery_opt_prompted', 'true');
    } catch {
      // Ignore
    }
    onClose();
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('rdiogo_battery_opt_prompted', 'true');
    } catch {
      // Ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <BatteryCharging className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-[10px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Deep Sleep Prevention</span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Continuous Background Audio
              </h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Android automatically puts radio streams to sleep after <span className="font-semibold text-amber-300">2 to 3 minutes</span> when the screen is locked to save battery.
        </p>

        {/* Mode Guide Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2.5 mb-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Required Android Battery Mode:
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-start gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 mt-1 shadow-sm shadow-emerald-400/50" />
            <div className="text-[11px]">
              <span className="font-bold text-emerald-300">Unrestricted (Select this): </span>
              <span className="text-slate-300">Allows RDIO-GO to stream 24/7 in the background without interruptions.</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 opacity-65">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 mt-1" />
            <div className="text-[10px]">
              <span className="font-semibold text-amber-300">Optimized (Default): </span>
              <span className="text-slate-400">Android cuts audio and network sockets after 2-3 minutes.</span>
            </div>
          </div>
        </div>

        {hasOpenedSettings && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs mb-4 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Opening Android Settings...</p>
              <p className="text-[11px] text-emerald-300 mt-0.5">
                If the screen opened, tap <strong className="text-white">Unrestricted</strong>. Then return here and tap Done.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleOpenBatterySettings}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>{hasOpenedSettings ? 'Re-open Battery Options Screen' : 'Open Android Battery Options'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenAppDetails}
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700/60"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Open via App Info Settings Page</span>
          </button>

          {hasOpenedSettings ? (
            <button
              onClick={handleComplete}
              className="w-full py-2.5 px-4 bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 rounded-xl transition-colors text-center mt-1"
            >
              Done & Return to RDIO-GO
            </button>
          ) : (
            <button
              onClick={handleDismiss}
              className="w-full py-2 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors text-center"
            >
              Not Now (Keep Default Battery Saver)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
