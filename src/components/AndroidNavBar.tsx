import React from 'react';
import { Radio, Heart, Disc, Sliders, Globe } from 'lucide-react';

export type AppTab = 'stations' | 'search' | 'favorites' | 'recordings' | 'equalizer';

interface AndroidNavBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  favoritesCount: number;
  recordingsCount: number;
  isRecording: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount,
  recordingsCount,
  isRecording,
}) => {
  const tabs = [
    {
      id: 'stations' as AppTab,
      label: 'Radio',
      icon: Radio,
    },
    {
      id: 'search' as AppTab,
      label: 'Explore',
      icon: Globe,
    },
    {
      id: 'favorites' as AppTab,
      label: 'Favorites',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'recordings' as AppTab,
      label: 'Recordings',
      icon: Disc,
      badge: recordingsCount > 0 ? recordingsCount : null,
      pulseBadge: isRecording,
    },
    {
      id: 'equalizer' as AppTab,
      label: 'Audio FX',
      icon: Sliders,
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1 flex items-center justify-around z-40 shrink-0"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 min-h-[44px] py-0.5 flex flex-col items-center justify-center relative group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
          >
            {/* Material 3 Active Pill Container */}
            <div
              className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />

              {/* Badge indicator */}
              {tab.badge !== null && tab.badge !== undefined && (
                <span
                  className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center leading-tight ${
                    tab.pulseBadge
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </div>

            <span
              className={`text-[11px] font-medium tracking-tight mt-1 transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
