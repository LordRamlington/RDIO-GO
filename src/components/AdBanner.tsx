import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

interface AdBannerProps {
  publisherId?: string;
  adSlotId?: string;
  isTestMode?: boolean;
  onOpenMonetizationModal?: () => void;
  onRemoveAds?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  publisherId = '',
  adSlotId = '',
  isTestMode = true,
  onOpenMonetizationModal,
  onRemoveAds,
}) => {
  const [adIndex, setAdIndex] = useState(0);
  const [impressionCount, setImpressionCount] = useState(1);
  const [hasAdError, setHasAdError] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const adPushedRef = useRef(false);

  // Sample compliant test ads following Google AdMob standard formats
  const sampleAds = [
    {
      title: 'SoundCraft Pro Headphones',
      description: 'Studio-grade acoustics & 40h battery. Special 25% Off.',
      cta: 'Shop Now',
      color: '#3b82f6',
      badge: 'Sponsored',
      tag: 'Tech',
      url: 'https://google.com',
    },
    {
      title: 'StreamMaster Cloud Studio',
      description: 'Launch your 24/7 internet radio station in under 5 minutes.',
      cta: 'Try Free',
      color: '#10b981',
      badge: 'Ad',
      tag: 'Software',
      url: 'https://google.com',
    },
    {
      title: 'Hi-Fi Audio Masterclass',
      description: 'Discover modern mastering & DSP audio equalizers.',
      cta: 'Learn More',
      color: '#8b5cf6',
      badge: 'Ad',
      tag: 'Education',
      url: 'https://google.com',
    },
    {
      title: 'Protect Your Online Privacy',
      description: 'Encrypted VPN for fast, safe streaming on Android.',
      cta: 'Install Now',
      color: '#f59e0b',
      badge: 'Sponsored',
      tag: 'Utility',
      url: 'https://google.com',
    },
  ];

  // Rotate test ads every 30 seconds (standard AdMob refresh rate)
  useEffect(() => {
    if (!isTestMode && !hasAdError) return;
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % sampleAds.length);
      setImpressionCount((prev) => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [isTestMode, hasAdError, sampleAds.length]);

  // Normalize AdMob formats (handles "ca-app-pub-XXXX/YYYY" or "ca-app-pub-XXXX")
  let normalizedClient = publisherId.trim();
  let normalizedSlot = adSlotId.trim();
  if (normalizedClient.includes('/')) {
    const parts = normalizedClient.split('/');
    normalizedClient = parts[0];
    if (!normalizedSlot && parts[1]) {
      normalizedSlot = parts[1];
    }
  }
  normalizedClient = normalizedClient.replace('ca-app-pub-', 'ca-pub-');

  // Load real Google AdSense / AdMob script if Publisher ID is provided and not in test mode
  useEffect(() => {
    if (isTestMode || !normalizedClient || !normalizedSlot || typeof window === 'undefined') {
      return;
    }

    try {
      const scriptId = 'google-adsense-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${normalizedClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    } catch (e) {
      console.warn('AdMob script injection notice:', e);
    }

    // Safely wait for container layout before calling adsbygoogle.push
    let attempts = 0;
    const maxAttempts = 20;

    const tryPushAd = () => {
      if (adPushedRef.current) return;
      attempts++;

      const el = adRef.current;
      // Ensure element is in DOM and parent container has positive availableWidth
      const containerWidth = el?.parentElement?.offsetWidth || el?.offsetWidth || 0;

      if (el && containerWidth > 0) {
        try {
          adPushedRef.current = true;
          ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
          console.warn('AdMob push safely handled:', err);
          setHasAdError(true);
        }
      } else if (attempts < maxAttempts) {
        requestAnimationFrame(() => {
          setTimeout(tryPushAd, 100);
        });
      } else {
        // Fallback to compliant banner card if width unavailable
        setHasAdError(true);
      }
    };

    const timer = setTimeout(tryPushAd, 150);
    return () => {
      clearTimeout(timer);
    };
  }, [normalizedClient, normalizedSlot, isTestMode]);

  const currentAd = sampleAds[adIndex];

  return (
    <div className="w-full bg-slate-950/98 border-t border-slate-900/80 py-1 px-2.5 z-20 flex items-center justify-center shrink-0">
      {/* 320x50 Standard Mobile Banner Dimension Box */}
      <div className="w-full max-w-[340px] h-[50px] min-h-[50px] max-h-[50px] bg-slate-900/90 border border-slate-800/80 rounded-xl px-2 py-1 flex items-center justify-between shadow-sm relative overflow-hidden shrink-0 group">
        {/* Subtle accent border indicator */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors duration-500"
          style={{ backgroundColor: currentAd.color }}
        />

        {/* Real Google AdMob Container if active, configured, and error-free */}
        {!isTestMode && normalizedClient && normalizedSlot && !hasAdError ? (
          <div className="w-full min-w-[320px] h-[50px] max-h-[50px] flex items-center justify-center overflow-hidden shrink-0">
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{
                display: 'inline-block',
                width: '320px',
                minWidth: '320px',
                height: '50px',
                minHeight: '50px',
                maxHeight: '50px',
                overflow: 'hidden',
              }}
              data-ad-client={normalizedClient}
              data-ad-slot={normalizedSlot}
            />
          </div>
        ) : (
          /* Compliant Mobile Banner Ad Content */
          <div className="flex items-center justify-between w-full pl-1.5 gap-2">
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                {/* Mandatory "Ad" / "Sponsored" badge required by Google Play policy */}
                <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-sm leading-tight">
                  {currentAd.badge}
                </span>

                {isTestMode && (
                  <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1 rounded-sm">
                    Test Mode
                  </span>
                )}

                <h5 className="text-xs font-semibold text-slate-100 truncate">
                  {currentAd.title}
                </h5>
              </div>

              <p className="text-[10px] text-slate-400 truncate leading-tight">
                {currentAd.description}
              </p>
            </div>

            {/* CTA & Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={currentAd.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-950 shadow-xs transition-transform active:scale-95 flex items-center gap-1"
                style={{ backgroundColor: currentAd.color }}
              >
                <span>{currentAd.cta}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
