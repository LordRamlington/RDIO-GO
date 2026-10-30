import React, { useState } from 'react';
import { Smartphone, Download, ExternalLink, X, Check, Copy, Sparkles, CheckCircle2, Info, Share2 } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const MANIFEST_JSON_STRING = JSON.stringify(
  {
    id: '/',
    name: 'RDIO-GO',
    short_name: 'RDIO-GO',
    description: 'Android live radio streaming with categorized stations, live audio visualizer, and offline broadcast recording.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'portrait',
    theme_color: '#131318',
    background_color: '#020617',
    lang: 'en',
    dir: 'ltr',
    categories: ['music', 'entertainment', 'audio'],
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
    ],
    shortcuts: [
      {
        name: 'Radio Stations',
        short_name: 'Radio',
        url: '/?tab=stations',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Offline Recordings',
        short_name: 'Recordings',
        url: '/?tab=recordings',
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Android Install & Setup Guide</h3>
              <p className="text-xs text-slate-400">Install directly on phone or build package</p>
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
            Android Chrome natively builds and installs an official Android <strong>WebAPK</strong> directly to your home screen and app drawer with one tap:
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
              2. Tap Chrome’s top-right menu <strong>⋮ (3 dots)</strong> &gt; tap <strong>"Install app"</strong> (or "Add to Home screen").
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

        {/* Why PWABuilder Showed "Manifest Not Found" Explanation */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Info className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Why did PWABuilder report "Manifest not found"?
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-2">
            PWABuilder is an external automated robot scanner. Because Google AI Studio development URLs require you to be signed in to your Google Account, external bots are blocked by Google's login gateway and receive a 404/redirect instead of your app.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The manifest and service worker ARE fully configured and active at <code className="text-emerald-400">/manifest.json</code> and <code className="text-emerald-400">/sw.js</code>. Your phone's Chrome browser reads them directly without issue.
          </p>

          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleCopyJson}
              className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedJson ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedJson ? 'Manifest Copied!' : 'Copy Manifest JSON'}</span>
            </button>
            <button
              onClick={handleDownloadManifest}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 transition-colors"
              title="Download manifest.json"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
