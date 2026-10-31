import React, { useState } from 'react';
import { Smartphone, Download, ExternalLink, X, Check, Copy, Sparkles, CheckCircle2, Info, Share2, ShieldCheck, Layers } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const MANIFEST_JSON_STRING = JSON.stringify(
  {
    id: 'com.cuveyapps.rdiogo',
    name: 'RDIO-GO Live Radio',
    short_name: 'RDIO-GO',
    description: 'RDIO-GO is an Android live radio streaming app featuring 40,000+ categorized stations worldwide, real-time audio visualizer, sleep timer, and offline broadcast recording.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    theme_color: '#131318',
    background_color: '#020617',
    lang: 'en',
    dir: 'ltr',
    categories: ['music', 'entertainment', 'news'],
    prefer_related_applications: false,
    related_applications: [],
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Radio Stations',
        short_name: 'Radio',
        description: 'Browse 40,000+ live categorized radio stations',
        url: '/?tab=stations',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Offline Recordings',
        short_name: 'Recordings',
        description: 'Listen to saved offline radio broadcasts',
        url: '/?tab=recordings',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
    ],
    screenshots: [
      {
        src: '/screenshot-mobile.png',
        sizes: '720x1280',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'RDIO-GO Radio Station Player',
      },
      {
        src: '/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'RDIO-GO Radio Station Player Wide',
      },
    ],
  },
  null,
  2
);

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPwa,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(MANIFEST_JSON_STRING);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownloadManifest = () => {
    const blob = new Blob([MANIFEST_JSON_STRING], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const pwaActionItems = [
    { title: 'Service Worker', desc: 'Active at /sw.js with offline shell caching & background stream support', status: 'Implemented' },
    { title: 'App Description', desc: 'Added comprehensive 40,000+ stations & offline recording description', status: 'Implemented' },
    { title: 'Background Color', desc: 'Configured deep slate #020617 for seamless launch splash screens', status: 'Implemented' },
    { title: 'Screenshots', desc: 'Added 720x1280 narrow mobile and 1280x720 wide screenshots', status: 'Implemented' },
    { title: 'Title Bar Theme Color', desc: 'Configured native dark theme_color #131318 for Android status bars', status: 'Implemented' },
    { title: 'Device Orientation', desc: 'Locked to portrait for native Android handheld experience', status: 'Implemented' },
    { title: 'Application ID', desc: 'Set unique Android identifier com.cuveyapps.rdiogo', status: 'Implemented' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android Install & PWA Package Guide</h3>
              <p className="text-xs text-slate-400">Install directly on phone or package with PWABuilder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Direct Android 1-Tap Install (WebAPK) */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
              Fastest: 1-Tap Android Install (No PWABuilder Needed)
            </h4>
          </div>
          <p className="text-xs text-slate-300 mb-2 leading-relaxed">
            Android Chrome natively compiles and installs an official Android <strong>WebAPK</strong> directly to your phone&apos;s home screen and app drawer in seconds:
          </p>

          <div className="text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 mb-3">
            <div>1. Open this app link in <strong>Google Chrome</strong> on your Android phone:</div>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-2.5 py-1.5 text-[11px] font-mono bg-slate-900 border border-slate-800 rounded-lg text-emerald-300 truncate"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shrink-0 flex items-center gap-1 transition-colors"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="pt-1.5">
              2. Tap Chrome’s top-right menu <strong>⋮ (3 dots)</strong> &gt; tap <strong>&quot;Install app&quot;</strong> (or &quot;Add to Home screen&quot;).
            </div>
            <div>
              3. Android installs <strong>RDIO-GO</strong> with full lockscreen controls, notification player, and offline vault!
            </div>
          </div>

          {deferredPrompt && (
            <button
              onClick={onInstallPwa}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Install Directly Now</span>
            </button>
          )}
        </div>

        {/* Action Items Status Overview */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              PWABuilder Action Items: All 7 Resolved
            </h4>
          </div>
          <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            All 7 items flagged by PWABuilder are now fully configured in the app codebase:
          </p>

          <div className="space-y-1.5">
            {pwaActionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px]"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-200">{item.title}: </span>
                    <span className="text-slate-400">{item.desc}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Why PWABuilder Showed Warnings & How to Paste into PWABuilder */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Why did PWABuilder show warnings for your URL?
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            AI Studio preview URLs are password/Google Account-protected. When the automated PWABuilder bot tests the URL, it gets redirected to Google sign-in instead of reading your manifest, which causes it to show a blank template.
          </p>
          <div className="text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1 mb-3">
            <div className="font-semibold text-emerald-400">To get 100/100 on PWABuilder:</div>
            <div>1. Click <strong>&quot;Copy Manifest JSON&quot;</strong> below.</div>
            <div>2. On PWABuilder.com, click the <strong>&quot;Edit Manifest&quot;</strong> / <strong>&quot;Manifest Options&quot;</strong> tab.</div>
            <div>3. Paste this JSON and click <strong>&quot;Save&quot;</strong> &gt; click <strong>&quot;Package for Android&quot;</strong> to download your APK!</div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={handleCopyJson}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJson ? 'Manifest Copied!' : 'Copy Manifest JSON'}</span>
            </button>
            <button
              onClick={handleDownloadManifest}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
              title="Download manifest.json file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download manifest.json</span>
            </button>
          </div>
        </div>

        {/* GitHub Actions 1-Click APK Builder */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-purple-400" />
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wide">
              GitHub Actions Cloud APK Builder (Automated)
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            A turnkey GitHub Actions workflow is now pre-configured at <code className="text-emerald-400 text-[11px]">.github/workflows/build-apk.yml</code>. You can compile the native Android APK in the cloud without installing Android Studio or Java locally:
          </p>
          <div className="text-[11px] text-slate-300 bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
            <div>1. Push or sync this repository to your <strong>GitHub</strong> account.</div>
            <div>2. Open your repository on GitHub and click the <strong>&quot;Actions&quot;</strong> tab.</div>
            <div>3. Click <strong>&quot;Build Android APK&quot;</strong> and hit <strong>&quot;Run workflow&quot;</strong>.</div>
            <div>4. When finished (~2 minutes), download the <strong>RDIO-GO-Android-APK</strong> file directly from the summary page to install on your phone!</div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
