import React from 'react';
import {
  ChevronDown,
  Heart,
  Play,
  Pause,
  Loader2,
  Volume2,
  VolumeX,
  Circle,
  Radio,
  Timer,
  Sliders,
  CheckCircle2,
  Square,
  Globe,
} from 'lucide-react';
import { RadioStation, PlaybackStatus } from '../types/radio';
import { StationArtwork } from './StationArtwork';
import { AudioVisualizer } from './AudioVisualizer';

interface NowPlayingSheetProps {
  station: RadioStation | null;
  status: PlaybackStatus;
  isFavorite: boolean;
  isRecording: boolean;
  recordingSeconds: number;
  volume: number;
  isMuted: boolean;
  sleepTimerRemaining: number | null;
  onClose: () => void;
  onPlayPause: () => void;
  onToggleFavorite: () => void;
  onToggleRecord: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onOpenEqualizer: () => void;
  onOpenSleepTimer: () => void;
}

export const NowPlayingSheet: React.FC<NowPlayingSheetProps> = ({
  station,
  status,
  isFavorite,
  isRecording,
  recordingSeconds,
  volume,
  isMuted,
  sleepTimerRemaining,
  onClose,
  onPlayPause,
  onToggleFavorite,
  onToggleRecord,
  onVolumeChange,
  onToggleMute,
  onOpenEqualizer,
  onOpenSleepTimer,
}) => {
  if (!station) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const estimatedKb = Math.round(recordingSeconds * 16); // ~16KB/s at 128kbps

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md transition-opacity">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Bottom Sheet Container */}
      <div className="relative w-full max-h-[92vh] overflow-y-auto bg-slate-950 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col p-6 z-10 transition-transform">
        {/* Android Sheet Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-700 hover:bg-slate-500 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />

        {/* Top Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Minimize"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-semibold text-emerald-400 tracking-wider flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              BROADCASTING LIVE
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSleepTimer}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                sleepTimerRemaining
                  ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
              title="Sleep Timer"
            >
              <Timer className="w-5 h-5" />
            </button>

            <button
              onClick={onToggleFavorite}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
                isFavorite
                  ? 'text-rose-500 bg-rose-950/40'
                  : 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
              }`}
              title={isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Center Artwork */}
        <div className="flex justify-center my-2">
          <StationArtwork station={station} size="xl" isPlaying={isPlaying} />
        </div>

        {/* Station Metadata */}
        <div className="text-center mt-4 mb-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">{station.name}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-1">
            <span>{station.subgenre}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>{station.country}</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-mono mt-2">
            <span>{station.bitrate} kbps</span>
            <span>/</span>
            <span>{station.codec}</span>
            <span>/</span>
            <span className="text-emerald-400">Low Latency</span>
          </div>
        </div>

        {/* Live Web Audio API Frequency Spectrum Visualizer */}
        <div className="my-3 w-full">
          <AudioVisualizer
            isPlaying={isPlaying}
            accentColor={station.accentColor}
            height={80}
            showControls={true}
          />
        </div>

        {/* --- RECORDING CONTROL SECTION --- */}
        <div className="my-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-rose-500 text-rose-500 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-xs font-semibold text-slate-200">
                {isRecording ? 'LIVE RECORDING IN PROGRESS' : 'OFFLINE BROADCAST RECORDER'}
              </span>
            </div>
            {isRecording ? (
              <span className="text-xs font-mono font-bold text-rose-400 tabular-nums bg-rose-950/80 border border-rose-800/50 px-2 py-0.5 rounded-full">
                {formatRecTime(recordingSeconds)} · ~{estimatedKb} KB
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Saves to Offline Vault</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleRecord}
              className={`flex-1 min-h-[48px] px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 active:scale-[0.98]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop & Save to Offline Vault</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Record This Broadcast</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Playback Controls */}
        <div className="flex items-center justify-around my-2">
          {/* Audio Equalizer Quick Trigger */}
          <button
            onClick={onOpenEqualizer}
            className="min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Audio FX Equalizer"
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] text-slate-400 mt-1 font-medium">Equalizer</span>
          </button>

          {/* Large Play/Pause FAB */}
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className="w-18 h-18 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/25 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30"
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-slate-950" />
            ) : (
              <Play className="w-8 h-8 fill-slate-950 translate-x-1" />
            )}
          </button>

          {/* Sleep Timer Indicator */}
          <button
            onClick={onOpenSleepTimer}
            className="min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors"
            title="Sleep Timer"
          >
            <Timer className={`w-5 h-5 ${sleepTimerRemaining ? 'text-amber-400' : ''}`} />
            <span className="text-[10px] text-slate-400 mt-1 font-medium font-mono">
              {sleepTimerRemaining ? `${Math.ceil(sleepTimerRemaining / 60)}m` : 'Sleep'}
            </span>
          </button>
        </div>

        {/* Volume Slider Bar */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-900">
          <button
            onClick={onToggleMute}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-xs font-mono text-slate-400 tabular-nums min-w-[32px] text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
};
