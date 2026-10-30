import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Radio,
  Globe,
  Activity,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  History,
  Clock,
  X,
} from 'lucide-react';
import { RadioStation, StationCategory } from '../types/radio';
import { StationCard } from './StationCard';
import { CountryItem, getFlagEmoji } from '../data/countriesList';
import { useRecentSearches } from '../utils/recentSearches';

interface StationsListViewProps {
  stations: RadioStation[];
  globalStations: RadioStation[];
  isGlobalLoading: boolean;
  hasMoreGlobal: boolean;
  onLoadMoreGlobal: () => void;
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  favorites: string[];
  offlineStationIds: Set<string>;
  selectedCategory: StationCategory;
  selectedCountry: CountryItem;
  catalogMode: 'curated' | 'global';
  onSelectCategory: (cat: StationCategory) => void;
  onSelectCountry: (country: CountryItem) => void;
  onSelectStation: (station: RadioStation) => void;
  onPlayPauseStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onToggleCatalogMode: (mode: 'curated' | 'global') => void;
  onOpenCountryModal: () => void;
  onRunIntegrityScan: () => void;
  isScanningIntegrity?: boolean;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
}

export const StationsListView: React.FC<StationsListViewProps> = ({
  stations,
  globalStations,
  isGlobalLoading,
  hasMoreGlobal,
  onLoadMoreGlobal,
  currentStation,
  isPlaying,
  isLoading,
  favorites,
  offlineStationIds,
  selectedCategory,
  selectedCountry,
  catalogMode,
  onSelectCategory,
  onSelectCountry,
  onSelectStation,
  onPlayPauseStation,
  onToggleFavorite,
  onToggleCatalogMode,
  onOpenCountryModal,
  onRunIntegrityScan,
  isScanningIntegrity,
  searchQuery,
  onSearchQueryChange,
  onScrollDirectionChange,
}) => {
  const [onlyOnline, setOnlyOnline] = useState<boolean>(true);
  const { recentSearches, clearSearches } = useRecentSearches();
  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 10) {
      onScrollDirectionChange?.(diff > 0 && currentY > 40);
      lastScrollY.current = currentY;
    }
  };

  const categories: { id: StationCategory; label: string }[] = [
    { id: 'all', label: 'All Stations' },
    { id: 'chill', label: 'Chill & Lo-Fi' },
    { id: 'jazz', label: 'Jazz & Swing' },
    { id: 'electronic', label: 'Electronic & Dance' },
    { id: 'hiphop', label: 'Hip-Hop & R&B' },
    { id: 'rock', label: 'Rock & Indie' },
    { id: 'metal', label: 'Metal & Heavy' },
    { id: 'blues', label: 'Blues & Soul' },
    { id: 'reggae', label: 'Reggae & Dub' },
    { id: 'country', label: 'Country & Folk' },
    { id: 'latin', label: 'Latin & Salsa' },
    { id: 'retro', label: '70s & 80s Retro' },
    { id: 'classical', label: 'Classical & Symphony' },
    { id: 'soundtrack', label: 'Cinema & OST' },
    { id: 'world', label: 'World & Cultural' },
    { id: 'news', label: 'News & Talk' },
    { id: 'pop', label: 'Pop & Top 40' },
  ];

  const activeStationPool = catalogMode === 'curated' ? stations : (globalStations.length > 0 ? globalStations : stations);

  const filteredStations = useMemo(() => {
    return activeStationPool.filter((station) => {
      // Filter out offline/inaccessible stations
      if (onlyOnline && offlineStationIds.has(station.id)) {
        return false;
      }

      // In curated mode, filter by category client-side (in global mode, API already filtered)
      if (catalogMode === 'curated' && selectedCategory !== 'all') {
        if (station.category !== selectedCategory) {
          return false;
        }
      }

      // Country filter if in curated mode and country selected
      if (catalogMode === 'curated' && selectedCountry.code) {
        if (station.countryCode.toUpperCase() !== selectedCountry.code.toUpperCase()) {
          return false;
        }
      }

      // Client-side text filter only applies in curated mode (in global mode, API searched 40,000+ stations)
      if (catalogMode === 'curated' && searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          station.name.toLowerCase().includes(q) ||
          station.subgenre.toLowerCase().includes(q) ||
          station.country.toLowerCase().includes(q) ||
          station.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [
    activeStationPool,
    selectedCategory,
    selectedCountry,
    catalogMode,
    searchQuery,
    onlyOnline,
    offlineStationIds,
  ]);

  const hiddenOfflineCount = useMemo(() => {
    if (!onlyOnline) return 0;
    return activeStationPool.filter((s) => offlineStationIds.has(s.id)).length;
  }, [activeStationPool, onlyOnline, offlineStationIds]);

  return (
    <div
      onScroll={handleScroll}
      className="flex-1 min-h-0 overflow-y-auto px-4 py-3 pb-44 scroll-smooth touch-pan-y"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Top Controls: Catalog Mode Switcher & Country Selector */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Curated vs Worldwide Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-0.5">
          <button
            onClick={() => onToggleCatalogMode('curated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              catalogMode === 'curated'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured</span>
          </button>
          <button
            onClick={() => onToggleCatalogMode('global')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              catalogMode === 'global'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>World 40,000+</span>
          </button>
        </div>

        {/* Country Selector Button */}
        <button
          onClick={onOpenCountryModal}
          className="px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs font-medium text-slate-200 flex items-center gap-1.5 max-w-[170px] truncate transition-colors"
          title="Select Country"
        >
          <span className="text-sm shrink-0">{selectedCountry.flag || '🌐'}</span>
          <span className="truncate">{selectedCountry.name || 'Worldwide'}</span>
          <ChevronDown className="w-3 h-3 text-slate-500 shrink-0" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Search 40,000+ worldwide stations (e.g. talk, BBC, jazz, sport)..."
          className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        {isGlobalLoading ? (
          <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3 top-3" />
        ) : searchQuery ? (
          <button
            onClick={() => onSearchQueryChange('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Recent Searches row */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 pl-1">
            <History className="w-3 h-3 text-emerald-400" />
            <span>Recent:</span>
          </span>
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => onSearchQueryChange(term)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] transition-colors shrink-0 shadow-xs border ${
                searchQuery.toLowerCase() === term.toLowerCase()
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title={`Search for "${term}"`}
            >
              <Clock className="w-2.5 h-2.5 text-slate-500" />
              <span>{term}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={clearSearches}
            className="text-[10px] text-slate-500 hover:text-rose-400 px-1 py-0.5 transition-colors shrink-0 ml-1"
            title="Clear recent searches"
          >
            Clear
          </button>
        </div>
      )}

      {/* Horizontal Category Segmented Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] flex items-center ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Subheader with Status, Online Only filter, and Broadcast Health Scanner */}
      <div className="flex items-center justify-between mb-3 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-300">
            {filteredStations.length} {selectedCategory !== 'all' ? selectedCategory : 'active'} stations{selectedCountry.code && catalogMode === 'global' ? ` · ${selectedCountry.flag || '🌐'} ${selectedCountry.name}` : ''}
          </span>

          {/* Online Only Filter Toggle */}
          <button
            onClick={() => setOnlyOnline(!onlyOnline)}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors border ${
              onlyOnline
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Filter out inaccessible or unbroadcasting streams"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlyOnline ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            <span>Active Streams Only</span>
          </button>
        </div>

        {/* Scan Streams button */}
        <button
          onClick={onRunIntegrityScan}
          disabled={isScanningIntegrity}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-colors"
          title="Verify broadcast signal accessibility"
        >
          {isScanningIntegrity ? (
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
          ) : (
            <Activity className="w-3 h-3 text-emerald-400" />
          )}
          <span>{isScanningIntegrity ? 'Scanning...' : 'Scan Signals'}</span>
        </button>
      </div>

      {/* Notice if any offline stations were filtered out */}
      {hiddenOfflineCount > 0 && (
        <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{hiddenOfflineCount} inactive/dead stream{hiddenOfflineCount > 1 ? 's' : ''} filtered out.</span>
          </div>
          <button
            onClick={() => setOnlyOnline(false)}
            className="text-emerald-400 hover:underline font-medium text-[11px]"
          >
            Show Hidden
          </button>
        </div>
      )}

      {/* Loading state for global stations */}
      {isGlobalLoading && filteredStations.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          <span className="text-xs font-medium">Connecting to international radio directory...</span>
        </div>
      )}

      {/* Station Cards List */}
      <div className="space-y-2.5">
        {filteredStations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            isCurrentStation={currentStation?.id === station.id}
            isPlaying={isPlaying}
            isLoading={isLoading}
            isFavorite={favorites.includes(station.id)}
            onSelect={() => onSelectStation(station)}
            onPlayPause={() => onPlayPauseStation(station)}
            onToggleFavorite={(e) => {
              e.stopPropagation();
              onToggleFavorite(station);
            }}
          />
        ))}

        {/* Global Catalog "Load More" Button */}
        {catalogMode === 'global' && hasMoreGlobal && !isGlobalLoading && (
          <div className="pt-2 text-center">
            <button
              onClick={onLoadMoreGlobal}
              className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Load More Stations</span>
            </button>
          </div>
        )}

        {catalogMode === 'global' && isGlobalLoading && filteredStations.length > 0 && (
          <div className="py-4 text-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400 mx-auto" />
          </div>
        )}

        {/* Empty state */}
        {!isGlobalLoading && filteredStations.length === 0 && (
          <div className="py-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/40 p-6">
            <Radio className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-300">
              No active stations found matching your criteria.
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Try switching country, changing genre, or checking all active broadcasts.
            </p>
            {catalogMode === 'curated' && (
              <button
                onClick={() => onToggleCatalogMode('global')}
                className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
              >
                Search 40,000+ Global Catalog
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
