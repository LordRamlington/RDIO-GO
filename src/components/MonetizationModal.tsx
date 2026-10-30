import React, { useState } from 'react';
import {
  DollarSign,
  X,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  HelpCircle,
  Smartphone,
  ExternalLink,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

interface MonetizationModalProps {
  isOpen: boolean;
  isAdsEnabled: boolean;
  publisherId: string;
  adSlotId: string;
  isTestMode: boolean;
  onToggleAds: (enabled: boolean) => void;
  onUpdateConfig: (publisherId: string, adSlotId: string, isTestMode: boolean) => void;
  onClose: () => void;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  isAdsEnabled,
  publisherId,
  adSlotId,
  isTestMode,
  onToggleAds,
  onUpdateConfig,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'setup' | 'settings'>('setup');
  const [inputPubId, setInputPubId] = useState(publisherId);
  const [inputSlotId, setInputSlotId] = useState(adSlotId);
  const [testMode, setTestMode] = useState(isTestMode);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let pub = inputPubId.trim();
    let slot = inputSlotId.trim();

    // Auto-parse if user pasted full AdMob string "ca-app-pub-1234567890123456/9876543210"
    if (pub.includes('/')) {
      const parts = pub.split('/');
      pub = parts[0].replace('ca-app-pub-', 'ca-pub-');
      if (!slot && parts[1]) {
        slot = parts[1];
      }
    } else {
      pub = pub.replace('ca-app-pub-', 'ca-pub-');
    }

    setInputPubId(pub);
    setInputSlotId(slot);

    onUpdateConfig(pub, slot, testMode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                App Monetization & AdMob Setup
              </h3>
              <p className="text-[11px] text-slate-400">
                Google Play Store Ad Revenue & Banner Configuration
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

        {/* Tab Switcher */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-800/80 flex items-center gap-1.5 shrink-0 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>How to Monetize</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Revenue Model</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ad Unit Settings</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: HOW TO MONETIZE */}
          {activeTab === 'setup' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                <h4 className="text-sm font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>How Google Play App Monetization Works</span>
                </h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  When users listen to radio stations in your app, the bottom advertising bar continuously displays relevant sponsor ads. You earn money for every 1,000 ad views (<strong>CPM</strong>) and every time an interested user taps an ad (<strong>CPC</strong>).
                </p>
              </div>

              {/* Step-by-Step Guide */}
              <div className="space-y-2.5">
                <h5 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider text-slate-400">
                  4 Steps to Start Earning Real Money:
                </h5>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>Create a Free Google AdMob / AdSense Account</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Go to <a href="https://admob.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">admob.google.com</a> or <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">adsense.google.com</a> and sign in with your Google account.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>Register "RDIO-GO" as an Android App</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    In your AdMob console, click <em>Apps &rarr; Add App &rarr; Android</em>. Select whether it is already live on Google Play or if you are preparing to publish the APK.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>Create a Banner Ad Unit</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Select <strong>Banner</strong> (Standard 320x50). AdMob will generate your unique Publisher ID (<code className="text-emerald-300">ca-pub-XXXXXXXXXX</code>) and Ad Unit ID (<code className="text-emerald-300">ca-app-pub-XXXXXXXX/YYYYYYYY</code>).
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span>Receive Direct Bank Payouts</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-7">
                    Google automatically deposits your accumulated ad earnings directly into your bank account around the 21st of every month once your balance reaches the $100 threshold.
                  </p>
                </div>
              </div>

              {/* Policy Warning */}
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-[11px] text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Important Google Play Policy:</strong> Never click your own live ads! Google strictly penalizes artificial or accidental clicks. Keep <strong>Test Mode</strong> enabled while testing your app.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: REVENUE MODEL */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Average Radio App eCPM</div>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">$2.80 - $4.50</div>
                  <p className="text-[10px] text-slate-500 mt-1">Per 1,000 ad impressions in US/UK/EU</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="text-[10px] text-slate-400 font-medium">Listening Session Duration</div>
                  <div className="text-lg font-bold text-slate-100 mt-0.5">38+ Minutes</div>
                  <p className="text-[10px] text-slate-500 mt-1">High dwell time = steady ad rotations</p>
                </div>
              </div>

              {/* Revenue projection table */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h5 className="font-semibold text-slate-200 text-xs">Estimated Monthly Ad Earnings:</h5>
                <div className="space-y-1.5 divide-y divide-slate-800 text-[11px]">
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">1,000 daily active listeners:</span>
                    <span className="font-bold text-emerald-400">~$120 - $250 / month</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">5,000 daily active listeners:</span>
                    <span className="font-bold text-emerald-400">~$600 - $1,400 / month</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">25,000 daily active listeners:</span>
                    <span className="font-bold text-emerald-400">~$3,000 - $7,000 / month</span>
                  </div>
                </div>
              </div>

              {/* Additional Monetization channels */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>Other Popular Monetization Channels</span>
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
                  <li><strong className="text-slate-200">Freemium "Pro Pass":</strong> Offer a $2.99 one-time in-app purchase to remove banner ads and unlock unlimited offline recording.</li>
                  <li><strong className="text-slate-200">Audio Sponsor Shoutouts:</strong> Partner with independent podcast networks or boutique audio equipment brands.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: SETTINGS & ID INPUT */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Enable / Disable Ad Banner */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-100">Display Bottom Ad Banner</div>
                  <div className="text-[10px] text-slate-400">
                    Show standard 320x50 banner above the navigation bar
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAds(!isAdsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isAdsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      isAdsEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Test Mode Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-100">Test Ad Mode</div>
                  <div className="text-[10px] text-slate-400">
                    Display simulated test ads to test UI safely without ad policy violations
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestMode(!testMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    testMode ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      testMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Publisher ID Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Google AdSense / AdMob Publisher ID:
                </label>
                <input
                  type="text"
                  value={inputPubId}
                  onChange={(e) => setInputPubId(e.target.value)}
                  placeholder="e.g. ca-pub-1234567890123456"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  Found on your AdMob / AdSense Account &rarr; Settings page.
                </span>
              </div>

              {/* Ad Slot ID Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Ad Unit Slot ID:
                </label>
                <input
                  type="text"
                  value={inputSlotId}
                  onChange={(e) => setInputSlotId(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <span className="text-[10px] text-slate-500">
                  The specific Ad Unit identifier generated for your banner.
                </span>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between pt-2">
                {savedSuccess ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Configuration saved!</span>
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-md"
                >
                  Save Ad Settings
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Ad Status: {isAdsEnabled ? (testMode ? 'Active (Test Mode)' : 'Active (Live Ads)') : 'Disabled'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
