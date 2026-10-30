import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2, Lock } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Privacy Policy & Compliance
              </h3>
              <p className="text-[11px] text-slate-400">
                Google Play Developer Policy Disclosure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs mb-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Personal Data Collection</span>
            </div>
            <p className="text-[11px] text-slate-400">
              RDIO-GO does not require user accounts, passwords, or personal identity information. We do not sell, rent, or monetize your personal data.
            </p>
          </div>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs">1. Audio Streams & Playback</h4>
            <p className="text-[11px] text-slate-400">
              Audio streams are delivered directly from legitimate public radio broadcasters via secure HTTPS connections. No audio data from your microphone is ever recorded or transmitted.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs">2. Local Storage & Offline Recordings</h4>
            <p className="text-[11px] text-slate-400">
              Station favorites, equalizer presets, and offline recorded radio broadcasts are stored exclusively on your device using client-side IndexedDB and HTML5 localStorage. They are never uploaded to remote servers.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs">3. Advertising Disclosures (Google AdMob / AdSense)</h4>
            <p className="text-[11px] text-slate-400">
              This app may display third-party advertisements via Google AdMob or Google AdSense. Google and its advertising partners may use device identifiers and non-personal diagnostic data to serve contextual ads in accordance with Google Play's Developer Advertising Policies.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs">4. Children's Privacy (COPPA / GDPR-K)</h4>
            <p className="text-[11px] text-slate-400">
              RDIO-GO is a general-audience radio streaming utility. We do not knowingly collect personal information from children under 13 years of age.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-bold text-slate-100 text-xs">5. Permissions Disclosure</h4>
            <p className="text-[11px] text-slate-400">
              RDIO-GO uses standard network access (<code className="text-emerald-400">INTERNET</code>) to stream live radio, and foreground media playback (<code className="text-emerald-400">FOREGROUND_SERVICE_MEDIA_PLAYBACK</code>) to enable lock screen controls and background playback.
            </p>
          </section>

          <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
            Last Updated: October 2026 · RDIO-GO Community Edition
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
