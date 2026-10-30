import React, { useState, useMemo } from 'react';
import { Search, Globe, X, Check } from 'lucide-react';
import { CountryItem, COUNTRIES_CATALOG } from '../data/countriesList';

interface CountryPickerModalProps {
  isOpen: boolean;
  selectedCountryCode: string;
  countries?: CountryItem[];
  onSelectCountry: (country: CountryItem) => void;
  onClose: () => void;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  isOpen,
  selectedCountryCode,
  countries = COUNTRIES_CATALOG,
  onSelectCountry,
  onClose,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = ['All', 'Europe', 'Americas', 'Asia', 'Africa', 'Middle East', 'Oceania'];

  const filtered = useMemo(() => {
    return countries.filter((c) => {
      // Region filter
      if (selectedRegion !== 'All' && c.region !== selectedRegion && c.code !== '') {
        return false;
      }

      if (!search.trim()) return true;

      const q = search.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    });
  }, [countries, selectedRegion, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
      <div className="w-full max-w-lg max-h-[85vh] h-full sm:h-auto bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Select Broadcast Country</h3>
              <p className="text-[11px] text-slate-400">
                100+ countries with thousands of local radio streams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 pb-2 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country by name or code (e.g. United Kingdom, JP, Brazil)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRegion === reg
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Country List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 divide-y divide-slate-800/40">
          {filtered.map((item) => {
            const isSelected = selectedCountryCode.toUpperCase() === item.code.toUpperCase();
            return (
              <button
                key={item.code || 'worldwide'}
                onClick={() => {
                  onSelectCountry(item);
                  onClose();
                }}
                className={`w-full py-2.5 px-3 rounded-2xl flex items-center justify-between text-left transition-colors min-h-[44px] ${
                  isSelected
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'hover:bg-slate-800/60 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl shrink-0">{item.flag}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.code && (
                        <span className="text-[10px] text-slate-500 font-mono">({item.code})</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{item.region}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.stationCount ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                      {item.stationCount.toLocaleString()}+ stations
                    </span>
                  ) : null}
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No country found matching "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
