import React, { useState, useEffect } from 'react';
import { Wifi, Radio, Circle } from 'lucide-react';

interface AndroidStatusBarProps {
  isPlaying: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  isOfflineMode: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  isPlaying,
  isRecording,
  recordingSeconds,
  isOfflineMode,
}) => {
  const [timeStr, setTimeStr] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-8 px-4 flex items-center justify-between text-xs font-medium text-slate-300 select-none bg-slate-950/70 backdrop-blur-md border-b border-slate-900/60 z-30">
      {/* Left: Clock & Android Notification icons */}
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-tight text-slate-100">{timeStr}</span>
        {isPlaying && !isRecording && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="text-[10px] hidden sm:inline">LIVE</span>
          </span>
        )}
        {isRecording && (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/40 px-1.5 py-0.5 rounded-full">
            <Circle className="w-2 h-2 fill-rose-500 animate-ping" />
            <span>REC {formatRecTime(recordingSeconds)}</span>
          </span>
        )}
        {isOfflineMode && (
          <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-800/50 px-1.5 py-0.2 rounded">
            OFFLINE
          </span>
        )}
      </div>

      {/* Right: Connectivity and Battery */}
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[10px] font-mono tracking-tight text-slate-300">5G</span>
        <Wifi className="w-3.5 h-3.5 text-slate-200" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono tabular-nums text-slate-200">92%</span>
          <div className="w-4 h-2.5 rounded-xs border border-slate-400 p-0.5 flex items-center">
            <div className="h-full bg-emerald-400 rounded-xs w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
};
