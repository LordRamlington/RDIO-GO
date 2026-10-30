import React, { useState, useRef } from 'react';
import {
  Search,
  Loader2,
  Globe,
  Radio,
  Plus,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  History,
  Clock,
  X,
} from 'lucide-react';
import { RadioStation } from '../types/radio';
import { searchGlobalStations } from '../services/radioBrowserApi';
import { COUNTRIES_CATALOG, CountryItem } from '../data/countriesList';
import { StationCard } from './StationCard';
import { CountryPickerModal } from './CountryPickerModal';
import { useRecentSearches } from '../utils/recentSearches';

interface SearchGlobalStationsProps {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  favorites: string[];
  offlineStationIds: Set<string>;
  onSelectStation: (station: RadioStation) => void;
  onPlayPauseStation?: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onAddCustomStation: (station: RadioStation) => void;
  onScrollDirectionChange?: (isScrollingDown: boolean) => void;
}

export const SearchGlobalStations: React.FC<SearchGlobalStationsProps> = ({
  currentStation,
  isPlaying,
  isLoading,
  favorites,
  offlineStationIds,
  onSelectStation,
  onPlayPauseStation,
  onToggleFavorite,
  onAddCustomStation,
  onScrollDirectionChange,
}) => {
  const [query, setQuery] = useState('');
  const lastScrollY = useRef(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentY = e.currentTarget.scrollTop;
    const diff = currentY - lastScrollY.current;
    if (Math.abs(diff) > 10) {
      onScrollDirectionChange?.(diff > 0 && currentY > 40);
      lastScrollY.current = currentY;
    }
  };
  const [selectedTag, setSelectedTag] = useState<string>('jazz');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES_CATALOG[0]);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [results, setResults] = useState<RadioStation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [order, setOrder] = useState<'clickcount' | 'votes' | 'recentchange'>('clickcount');

  // Custom Stream Modal / Collapsible
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customGenre, setCustomGenre] = useState('');

  const quickTags = [
    { id: 'jazz', label: 'Jazz' },
    { id: 'lofi', label: 'Lo-Fi' },
    { id: 'chillout', label: 'Chillout' },
    { id: 'ambient', label: 'Ambient' },
    { id: 'electronic', label: 'Electronic' },
    { id: 'synthwave', label: 'Synthwave' },
    { id: 'house', label: 'House' },
    { id: 'techno', label: 'Techno' },
    { id: 'trance', label: 'Trance' },
    { id: 'hiphop', label: 'Hip-Hop' },
    { id: 'rap', label: 'Rap & Trap' },
    { id: 'r&b', label: 'R&B & Urban' },
    { id: 'rock', label: 'Rock' },
    { id: 'metal', label: 'Heavy Metal' },
    { id: 'indie', label: 'Indie' },
    { id: 'blues', label: 'Blues' },
    { id: 'soul', label: 'Soul & Motown' },
    { id: 'reggae', label: 'Reggae' },
    { id: 'dub', label: 'Dub' },
    { id: 'country', label: 'Country' },
    { id: 'bluegrass', label: 'Bluegrass' },
    { id: 'latin', label: 'Latin' },
    { id: 'salsa', label: 'Salsa & Bachata' },
    { id: 'classical', label: 'Classical' },
    { id: 'soundtrack', label: 'Soundtrack & OST' },
    { id: '80s', label: '80s Retro' },
    { id: '70s', label: '70s Disco' },
    { id: '90s', label: '90s Dance' },
    { id: 'news', label: 'News & Talk' },
    { id: 'world', label: 'World & Folk' },
  ];

  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches();

  const handleSearch = async (
    tagOverride?: string,
    countryOverride?: CountryItem,
    resetPage = true,
    queryOverride?: string
  ) => {
    setIsSearching(true);
    setHasSearched(true);
    const tagToUse = tagOverride !== undefined ? tagOverride : selectedTag;
    const countryToUse = countryOverride !== undefined ? countryOverride : selectedCountry;
    const queryToUse = queryOverride !== undefined ? queryOverride : query;
    const curOffset = resetPage ? 0 : offset;

    const trimmedQuery = queryToUse.trim();
    if (trimmedQuery) {
      addSearch(trimmedQuery);
    }

    const data = await searchGlobalStations({
      query: trimmedQuery || undefined,
      tag: tagToUse || undefined,
      countryCode: countryToUse.code || undefined,
      limit: 30,
      offset: curOffset,
      order,
    });

    if (resetPage) {
      setResults(data);
      setOffset(30);
    } else {
      setResults((prev) => [...prev, ...data]);
      setOffset((prev) => prev + 30);
    }

    setHasMore(data.length >= 30);
    setIsSearching(false);
  };

  const handleSelectRecentSearch = (term: string) => {
    setQuery(term);
    handleSearch(undefined, undefined, true, term);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    handleSearch(tag, undefined, true);
  };

  const handleSelectCountry = (country: CountryItem) => {
    setSelectedCountry(country);
    handleSearch(undefined, country, true);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newStation: RadioStation = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: 'pop',
      subgenre: customGenre.trim() || 'Direct Stream',
      streamUrl: customUrl.trim(),
      bitrate: 128,
      codec: 'LIVE',
      country: selectedCountry.name || 'Custom',
      countryCode: selectedCountry.code || 'WW',
      description: 'User added direct audio feed',
      accentColor: '#10b981',
      tags: ['Custom', 'Stream'],
      isCustom: true,
    };

    onAddCustomStation(newStation);
    onSelectStation(newStation);
    setCustomName('');
    setCustomUrl('');
    setCustomGenre('');
    setShowCustomForm(false);
  };

  // Filter out any stations that were verified as offline
  const visibleResults = results.filter((st) => !offlineStationIds.has(st.id));

  return (
    <div onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-44 scroll-smooth">
      {/* Search Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Worldwide 40,000+ Directory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access the complete international community radio registry across 100+ countries.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar Input */}
      <div className="relative mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(undefined, undefined, true)}
          placeholder="Search 40,000+ stations by name, city, or artist..."
          className="w-full pl-10 pr-28 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-20 top-3 text-slate-400 hover:text-white transition-colors p-0.5"
            title="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => handleSearch(undefined, undefined, true)}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Recent Searches (Last 5 searches saved to localStorage) */}
      {recentSearches.length > 0 && (
        <div className="mb-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2.5 shadow-sm">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recent Searches</span>
              <span className="text-[10px] text-slate-500 font-mono">({recentSearches.length}/5)</span>
            </div>
            <button
              type="button"
              onClick={clearSearches}
              className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
              title="Clear all recent searches"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {recentSearches.map((term) => (
              <div
                key={term}
                className="group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-xs text-slate-200 transition-all shrink-0 shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => handleSelectRecentSearch(term)}
                  className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors text-left"
                  title={`Search for "${term}"`}
                >
                  <Clock className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                  <span className="font-medium max-w-[140px] truncate">{term}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSearch(term);
                  }}
                  className="w-4 h-4 rounded-md flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors ml-0.5"
                  title={`Remove "${term}" from history`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tag Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
        {quickTags.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTagClick(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedTag === t.id
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Country Filter Selector & Sort / Custom URL toggle */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* Country Picker Trigger */}
        <button
          onClick={() => setIsCountryModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl px-3 py-1.5 text-xs text-slate-200 transition-colors max-w-[200px] truncate"
        >
          <span className="text-base shrink-0">{selectedCountry.flag || '🌐'}</span>
          <span className="truncate">{selectedCountry.name || 'Worldwide'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        </button>

        {/* Sort order */}
        <div className="flex items-center gap-1">
          <select
            value={order}
            onChange={(e) => {
              const val = e.target.value as any;
              setOrder(val);
              handleSearch(undefined, undefined, true);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="clickcount">Most Popular</option>
            <option value="votes">Top Voted</option>
            <option value="recentchange">Recently Active</option>
          </select>

          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom URL</span>
          </button>
        </div>
      </div>

      {/* Custom Stream Form */}
      {showCustomForm && (
        <form
          onSubmit={handleAddCustom}
          className="mb-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3"
        >
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>Add Direct Stream URL</span>
          </h4>
          <input
            type="text"
            required
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Station Name (e.g. My College Radio)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="url"
            required
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Stream URL (https://...)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            placeholder="Genre (optional, e.g. Rock, Talk)"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400"
            >
              Tune & Save
            </button>
          </div>
        </form>
      )}

      {/* Results Header / Loading */}
      {isSearching && results.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Searching 40,000+ worldwide stations...</span>
        </div>
      )}

      {!isSearching && visibleResults.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>
              Found {visibleResults.length} stations in {selectedCountry.name || 'Worldwide'}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Broadcasts verified active</span>
            </span>
          </div>

          {visibleResults.map((st) => (
            <StationCard
              key={st.id}
              station={st}
              isCurrentStation={currentStation?.id === st.id}
              isPlaying={isPlaying}
              isLoading={isLoading}
              isFavorite={favorites.includes(st.id)}
              onSelect={() => onSelectStation(st)}
              onPlayPause={() => onPlayPauseStation?.(st)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(st);
              }}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-2 text-center">
              <button
                onClick={() => handleSearch(undefined, undefined, false)}
                disabled={isSearching}
                className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-emerald-400 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Load More Stations (+30)</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {!isSearching && hasSearched && visibleResults.length === 0 && (
        <div className="py-12 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/40 p-6">
          <Radio className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <p className="text-xs">No active stations found matching your search.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Try choosing another country or searching by general genre.
          </p>
        </div>
      )}

      {!hasSearched && !isSearching && (
        <div className="py-8 text-center text-slate-400 bg-slate-900/30 rounded-2xl border border-slate-800/50 p-6">
          <Globe className="w-8 h-8 mx-auto text-emerald-400/80 mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">Global Live Radio Index</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-4 leading-relaxed">
            Over 40,000 live radio streams from 100+ countries. Tap any genre or pick your favorite country to listen now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleSearch('jazz', undefined, true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-medium transition-colors"
            >
              Popular Jazz
            </button>
            <button
              onClick={() => handleSearch('chillout', undefined, true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-medium transition-colors"
            >
              Lo-Fi & Chill
            </button>
            <button
              onClick={() => handleSearch('rock', undefined, true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-medium transition-colors"
            >
              Rock Anthems
            </button>
            <button
              onClick={() => handleSearch('electronic', undefined, true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-medium transition-colors"
            >
              EDM & Dance
            </button>
          </div>
        </div>
      )}

      {/* Country Picker Modal */}
      <CountryPickerModal
        isOpen={isCountryModalOpen}
        selectedCountryCode={selectedCountry.code}
        onSelectCountry={handleSelectCountry}
        onClose={() => setIsCountryModalOpen(false)}
      />
    </div>
  );
};
