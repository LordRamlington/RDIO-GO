import React from 'react';
import { Radio, Sliders, WifiOff, Disc, Circle, RefreshCw, Activity } from 'lucide-react';
import { AppTab } from './AndroidNavBar';

interface AndroidAppBarProps {
  activeTab: AppTab;
  isPlaying: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  isOfflineMode: boolean;
  isScanningIntegrity?: boolean;
  onOpenEqualizer: () => void;
  onToggleRecord: () => void;
  onHardRefresh: () => void;
  onOpenIntegrityCheck: () => void;
  onOpenMonetization?: () => void;
}

export const AndroidAppBar: React.FC<AndroidAppBarProps> = ({
  activeTab,
  isPlaying,
  isRecording,
  recordingSeconds,
  isOfflineMode,
  isScanningIntegrity = false,
  onOpenEqualizer,
  onToggleRecord,
  onHardRefresh,
  onOpenIntegrityCheck,
  onOpenMonetization,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'stations':
        return 'RDIO-GO';
      case 'search':
        return '40,000+ World Catalog';
      case 'favorites':
        return 'Favorites';
      case 'recordings':
        return 'Offline Vault';
      case 'equalizer':
        return 'Audio Settings';
    }
  };

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <header className="h-14 px-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-900/80 flex items-center justify-between shrink-0 z-30 select-none">
      {/* Brand & Wordmark */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
          <Radio className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-tight leading-none">
            {getTabTitle()}
          </h1>
          <span className="text-[10px] text-slate-500 font-mono leading-none">
            {isOfflineMode ? 'OFFLINE RECORDER' : 'LIVE BROADCASTS'}
          </span>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-1">
        {/* Quick Top Record Indicator / Button if playing */}
        {isPlaying && (
          <button
            onClick={onToggleRecord}
            className={`min-h-[36px] px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
            }`}
            title={isRecording ? 'Stop & Save Recording' : 'Start Recording'}
          >
            <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span className="font-mono text-[11px]">
              {isRecording ? formatRecTime(recordingSeconds) : 'REC'}
            </span>
          </button>
        )}

        {/* Signal Scanner / Stream Integrity Check Button */}
        <button
          onClick={onOpenIntegrityCheck}
          className={`min-h-[36px] px-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors ${
            isScanningIntegrity
              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/50 animate-pulse'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
          }`}
          title="Station Health Scan (Filters offline stations)"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold">SCAN</span>
        </button>

        <button
          onClick={onHardRefresh}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
          title="Reload & Clear Cache"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onOpenEqualizer}
          className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Audio Equalizer & Settings"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
