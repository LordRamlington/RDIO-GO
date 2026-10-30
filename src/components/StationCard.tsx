import React from 'react';
import { Play, Pause, Heart, Loader2, Globe } from 'lucide-react';
import { RadioStation } from '../types/radio';
import { StationArtwork } from './StationArtwork';

interface StationCardProps {
  station: RadioStation;
  isCurrentStation: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onPlayPause?: (e: React.MouseEvent) => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isCurrentStation,
  isPlaying,
  isLoading,
  isFavorite,
  onSelect,
  onPlayPause,
  onToggleFavorite,
}) => {
  const isThisPlaying = isCurrentStation && isPlaying;
  const isThisLoading = isCurrentStation && isLoading;

  return (
    <div
      onClick={onSelect}
      className={`group w-full p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 text-left ${
        isCurrentStation
          ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-black/20 ring-1 ring-emerald-500/20'
          : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Left: Station Avatar */}
      <div className="shrink-0 relative">
        <StationArtwork station={station} size="md" isPlaying={isThisPlaying} />
      </div>

      {/* Center: Metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`text-sm font-semibold truncate transition-colors ${
              isCurrentStation ? 'text-emerald-400' : 'text-slate-100 group-hover:text-emerald-300'
            }`}
          >
            {station.name}
          </h3>
          {isThisPlaying && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-1.5 py-0.2 rounded shrink-0">
              PLAYING
            </span>
          )}
        </div>

        {/* Clean unboxed metadata with separators per design constitution */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 truncate">
          <span className="truncate">{station.subgenre}</span>
          <span className="opacity-40" aria-hidden="true">·</span>
          <span className="flex items-center gap-1 shrink-0">
            <Globe className="w-3 h-3 text-slate-500" />
            <span>{station.country}</span>
          </span>
          <span className="opacity-40" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] text-slate-400 shrink-0">{station.bitrate}k {station.codec}</span>
        </div>

        {station.description && (
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
            {station.description}
          </p>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onToggleFavorite}
          className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors ${
            isFavorite
              ? 'text-rose-500 bg-rose-950/30'
              : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800/60'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPlayPause) {
              onPlayPause(e);
            } else {
              onSelect();
            }
          }}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all ${
            isThisPlaying
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
          }`}
          title={isThisPlaying ? 'Pause' : 'Play'}
        >
          {isThisLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          ) : isThisPlaying ? (
            <Pause className="w-4 h-4 fill-slate-950" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
