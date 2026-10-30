import React, { useRef } from 'react';
import { Heart, Radio } from 'lucide-react';
import { RadioStation } from '../types/radio';
import { StationCard } from './StationCard';

interface FavoritesViewProps {
  favoriteStations: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  onSelectStation: (station: RadioStation) => void;
  onPlayPauseStation?: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onGoToStations: () => void;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteStations,
  currentStation,
  isPlaying,
  isLoading,
  onSelectStation,
  onPlayPauseStation,
  onToggleFavorite,
  onGoToStations,
  onScrollDirectionChange,
}) => {
  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 8) {
      onScrollDirectionChange?.(diff > 0 && currentY > 30);
      lastScrollY.current = currentY;
    }
  };

  return (
    <div onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-44 scroll-smooth">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span>Favorite Stations ({favoriteStations.length})</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Your bookmarked stations for instant one-tap tuning.
        </p>
      </div>

      {favoriteStations.length === 0 ? (
        <div className="py-16 text-center px-4 rounded-2xl bg-slate-900/30 border border-slate-800/60 my-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 text-rose-400 mx-auto flex items-center justify-center mb-3 border border-rose-800/30">
            <Heart className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-100">No Favorites Saved Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-5">
            Tap the heart icon on any radio station to pin it to this quick access list.
          </p>
          <button
            onClick={onGoToStations}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <Radio className="w-4 h-4" />
            <span>Discover Radio Stations</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {favoriteStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              isCurrentStation={currentStation?.id === station.id}
              isPlaying={isPlaying}
              isLoading={isLoading}
              isFavorite={true}
              onSelect={() => onSelectStation(station)}
              onPlayPause={() => onPlayPauseStation?.(station)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(station);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
