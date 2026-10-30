import React from 'react';
import { Wifi, WifiOff, Radio, Circle, Zap } from 'lucide-react';
import { useDeviceStatus } from '../hooks/useDeviceStatus';

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
  const {
    timeStr,
    isOnline,
    connectionType,
    cellularGeneration,
    signalBars,
    batteryLevel,
    isCharging,
  } = useDeviceStatus();

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-8 px-4 flex items-center justify-between text-xs font-medium text-slate-300 select-none bg-slate-950/80 backdrop-blur-md border-b border-slate-900/60 z-30 shrink-0">
      {/* Left: Real Local Device Clock & Active State */}
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-tight text-slate-100 text-[13px]">{timeStr}</span>

        {isPlaying && !isRecording && (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="text-[10px]">LIVE</span>
          </span>
        )}

        {isRecording && (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-950/60 border border-rose-800/40 px-1.5 py-0.5 rounded-full">
            <Circle className="w-2 h-2 fill-rose-500 animate-ping" />
            <span>REC {formatRecTime(recordingSeconds)}</span>
          </span>
        )}

        {(isOfflineMode || !isOnline) && (
          <span className="text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded-md">
            OFFLINE
          </span>
        )}
      </div>

      {/* Right: Real Cell Network, Wi-Fi Signal Strength & Battery */}
      <div className="flex items-center gap-2.5 text-slate-300">
        {/* Real Cellular Signal & Tech Generation Badge */}
        {isOnline && (
          <div className="flex items-center gap-1" title={`Cellular Network: ${cellularGeneration} (${signalBars}/4 bars)`}>
            <span className="text-[10px] font-mono font-bold tracking-tight text-emerald-400">
              {cellularGeneration}
            </span>

            {/* Real 4-Bar Stepped Cellular Signal Meter */}
            <div className="flex items-end gap-[1.5px] h-3 w-3.5 pb-0.5">
              <span
                className={`w-[2.5px] rounded-xs transition-colors ${
                  signalBars >= 1 ? 'h-1.5 bg-slate-100' : 'h-1.5 bg-slate-700'
                }`}
              />
              <span
                className={`w-[2.5px] rounded-xs transition-colors ${
                  signalBars >= 2 ? 'h-2 bg-slate-100' : 'h-2 bg-slate-700'
                }`}
              />
              <span
                className={`w-[2.5px] rounded-xs transition-colors ${
                  signalBars >= 3 ? 'h-2.5 bg-slate-100' : 'h-2.5 bg-slate-700'
                }`}
              />
              <span
                className={`w-[2.5px] rounded-xs transition-colors ${
                  signalBars >= 4 ? 'h-3 bg-slate-100' : 'h-3 bg-slate-700'
                }`}
              />
            </div>
          </div>
        )}

        {/* Real Wi-Fi Icon / Offline Disconnect */}
        {isOnline ? (
          <div
            className="flex items-center relative"
            title={`Wi-Fi: Connected (${connectionType === 'wifi' ? 'Active Wi-Fi' : 'Cellular Data'})`}
          >
            <Wifi
              className={`w-3.5 h-3.5 transition-colors ${
                connectionType === 'wifi' ? 'text-slate-100' : 'text-slate-400'
              }`}
            />
          </div>
        ) : (
          <div className="flex items-center text-rose-400" title="Disconnected">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Real Battery Indicator with Charging Detection */}
        <div
          className="flex items-center gap-1"
          title={`Battery: ${batteryLevel}% ${isCharging ? '(Charging ⚡)' : ''}`}
        >
          <span className="text-[11px] font-mono tabular-nums text-slate-200 font-semibold">
            {batteryLevel}%
          </span>

          <div className="relative flex items-center">
            {/* Battery Body Outline */}
            <div className="w-[18px] h-[9.5px] rounded-xs border border-slate-400/90 p-[1px] flex items-center bg-slate-900/60 relative">
              {/* Inner Battery Fill */}
              <div
                className={`h-full rounded-2xs transition-all duration-500 ${
                  batteryLevel <= 15
                    ? 'bg-rose-500'
                    : batteryLevel <= 30
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(8, Math.min(100, batteryLevel))}%` }}
              />

              {/* Charging Lightning Bolt Icon */}
              {isCharging && (
                <Zap className="w-2.5 h-2.5 text-amber-300 absolute inset-0 m-auto fill-amber-300 drop-shadow-xs" />
              )}
            </div>

            {/* Battery Positive Terminal Notch */}
            <div className="w-[1.5px] h-[4px] bg-slate-400 rounded-r-xs ml-[0.5px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
