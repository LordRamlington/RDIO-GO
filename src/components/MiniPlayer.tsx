import React from 'react';
import { Play, Pause, Loader2, Circle, Radio, ChevronUp } from 'lucide-react';
import { RadioStation, PlaybackStatus } from '../types/radio';
import { StationArtwork } from './StationArtwork';

interface MiniPlayerProps {
  station: RadioStation | null;
  status: PlaybackStatus;
  isRecording: boolean;
  recordingSeconds: number;
  onPlayPause: () => void;
  onToggleRecord: () => void;
  onOpenExpandedPlayer: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  station,
  status,
  isRecording,
  recordingSeconds,
  onPlayPause,
  onToggleRecord,
  onOpenExpandedPlayer,
}) => {
  if (!station) return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  const formatRecTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="mx-2.5 mb-1 bg-slate-900/98 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-xl shadow-black/50 overflow-hidden transition-all duration-200 z-30 shrink-0">
      {/* Mini top recording banner if active */}
      {isRecording && (
        <div className="bg-rose-950/90 border-b border-rose-800/50 px-3 py-0.5 flex items-center justify-between text-[10px] text-rose-300">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>Recording live broadcast</span>
          </div>
          <span className="font-mono tabular-nums font-bold text-rose-200">
            {formatRecTime(recordingSeconds)}
          </span>
        </div>
      )}

      <div className="px-2.5 py-1.5 flex items-center justify-between gap-2.5">
        {/* Left: Artwork + Station Title (Tap to expand) */}
        <button
          onClick={onOpenExpandedPlayer}
          className="flex items-center gap-2.5 flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg group"
        >
          <StationArtwork station={station} size="sm" isPlaying={isPlaying} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                {station.name}
              </h4>
              <span className="text-[9px] text-emerald-400 font-mono shrink-0 flex items-center gap-0.5">
                <Radio className="w-2.5 h-2.5" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              <span>{station.subgenre}</span>
              <span className="mx-1 opacity-50">·</span>
              <span className="font-mono text-[10px]">{station.bitrate}k {station.codec}</span>
            </p>
          </div>
        </button>

        {/* Right Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Quick Record Button */}
          <button
            onClick={onToggleRecord}
            title={isRecording ? 'Stop & Save Recording' : 'Record Broadcast'}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
            }`}
          >
            <Circle className={`w-3.5 h-3.5 ${isRecording ? 'fill-rose-500 text-rose-500' : 'fill-transparent'}`} />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 shadow-md shadow-emerald-500/20"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-slate-950" />
            ) : (
              <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
            )}
          </button>

          {/* Expand sheet arrow */}
          <button
            onClick={onOpenExpandedPlayer}
            title="Expand Full Player"
            className="w-6 h-9 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
