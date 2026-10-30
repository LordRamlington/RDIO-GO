import { RadioStation, StationCategory } from '../types/radio';
import { COUNTRIES_CATALOG, CountryItem, getFlagEmoji } from '../data/countriesList';

// Stable Radio Browser mirrors with automatic failover
const API_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

interface RawApiStation {
  stationuuid: string;
  name: string;
  url_resolved: string;
  url: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  bitrate: number;
  codec: string;
  votes: number;
  clickcount: number;
}

export function mapTagsToCategory(tags: string): StationCategory {
  const t = (tags || '').toLowerCase();
  if (t.includes('metal') || t.includes('heavy') || t.includes('death') || t.includes('thrash') || t.includes('hard rock')) {
    return 'metal';
  }
  if (t.includes('hiphop') || t.includes('hip hop') || t.includes('rap') || t.includes('trap') || t.includes('r&b') || t.includes('urban')) {
    return 'hiphop';
  }
  if (t.includes('reggae') || t.includes('dub') || t.includes('ska') || t.includes('dancehall')) {
    return 'reggae';
  }
  if (t.includes('country') || t.includes('bluegrass') || t.includes('americana') || t.includes('nashville')) {
    return 'country';
  }
  if (t.includes('latin') || t.includes('salsa') || t.includes('bachata') || t.includes('reggaeton') || t.includes('cumbia')) {
    return 'latin';
  }
  if (t.includes('blues') || t.includes('soul') || t.includes('funk') || t.includes('motown')) {
    return 'blues';
  }
  if (t.includes('retro') || t.includes('80s') || t.includes('70s') || t.includes('60s') || t.includes('oldies') || t.includes('vintage') || t.includes('nostalgia') || t.includes('disco')) {
    return 'retro';
  }
  if (t.includes('soundtrack') || t.includes('ost') || t.includes('film') || t.includes('score') || t.includes('game') || t.includes('anime')) {
    return 'soundtrack';
  }
  if (t.includes('chill') || t.includes('ambient') || t.includes('lofi') || t.includes('lounge') || t.includes('relax') || t.includes('sleep') || t.includes('meditation') || t.includes('downtempo')) {
    return 'chill';
  }
  if (t.includes('jazz') || t.includes('swing') || t.includes('bop') || t.includes('smooth jazz')) {
    return 'jazz';
  }
  if (t.includes('electro') || t.includes('techno') || t.includes('dance') || t.includes('house') || t.includes('trance') || t.includes('edm') || t.includes('dnb') || t.includes('bass') || t.includes('synthwave')) {
    return 'electronic';
  }
  if (t.includes('classic') || t.includes('opera') || t.includes('symphon') || t.includes('baroque') || t.includes('orchestr')) {
    return 'classical';
  }
  if (t.includes('news') || t.includes('talk') || t.includes('info') || t.includes('sport') || t.includes('podcast') || t.includes('politics')) {
    return 'news';
  }
  if (t.includes('rock') || t.includes('punk') || t.includes('indie') || t.includes('alt') || t.includes('grunge')) {
    return 'rock';
  }
  if (t.includes('world') || t.includes('folk') || t.includes('celtic') || t.includes('afro') || t.includes('traditional')) {
    return 'world';
  }
  return 'pop';
}

export function getColorForCategory(category: StationCategory): string {
  switch (category) {
    case 'chill': return '#10b981';
    case 'jazz': return '#f59e0b';
    case 'electronic': return '#06b6d4';
    case 'classical': return '#eab308';
    case 'news': return '#ef4444';
    case 'rock': return '#f97316';
    case 'metal': return '#dc2626';
    case 'hiphop': return '#eab308';
    case 'reggae': return '#22c55e';
    case 'country': return '#b45309';
    case 'latin': return '#f43f5e';
    case 'blues': return '#3b82f6';
    case 'retro': return '#8b5cf6';
    case 'soundtrack': return '#14b8a6';
    case 'world': return '#a855f7';
    case 'pop': return '#ec4899';
    default: return '#6366f1';
  }
}

function sanitizeStation(st: RawApiStation): RadioStation {
  const category = mapTagsToCategory(st.tags || '');
  const parsedTags = (st.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);

  const countryCode = (st.countrycode || 'WW').toUpperCase();
  const countryName = st.country || 'Global';

  return {
    id: `rb-${st.stationuuid}`,
    name: st.name.trim(),
    category,
    subgenre: parsedTags[0] || category.toUpperCase(),
    streamUrl: st.url_resolved || st.url,
    bitrate: st.bitrate || 128,
    codec: (st.codec || 'MP3').toUpperCase(),
    country: countryName,
    countryCode,
    description: `${getFlagEmoji(countryCode)} ${countryName} · ${st.codec || 'Live stream'} · ${st.bitrate ? st.bitrate + ' kbps' : '128 kbps'}`,
    accentColor: getColorForCategory(category),
    tags: parsedTags.length > 0 ? parsedTags : [category],
    homepage: st.homepage,
    favicon: st.favicon || undefined,
  };
}

export const CATEGORY_SEARCH_TAGS: Record<StationCategory, string> = {
  all: '',
  chill: 'chill',
  jazz: 'jazz',
  electronic: 'electronic',
  hiphop: 'hiphop',
  rock: 'rock',
  metal: 'metal',
  blues: 'blues',
  reggae: 'reggae',
  country: 'country',
  latin: 'latin',
  retro: '80s',
  classical: 'classical',
  soundtrack: 'soundtrack',
  world: 'world',
  news: 'news',
  pop: 'pop',
};

export interface SearchStationParams {
  query?: string;
  tag?: string;
  category?: StationCategory;
  countryCode?: string;
  limit?: number;
  offset?: number;
  order?: 'clickcount' | 'votes' | 'recentchange' | 'bitrate';
}

/**
 * Searches the worldwide 40,000+ radio catalog
 */
export async function searchGlobalStations(params: SearchStationParams): Promise<RadioStation[]> {
  const limit = params.limit || 60;
  const offset = params.offset || 0;
  const order = params.order || 'clickcount';
  const query = params.query?.trim();

  const searchParams = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    hidebroken: 'true',
    order,
    reverse: 'true',
  });

  // Determine tag from explicit tag or category mapping
  let activeTag = params.tag?.trim();
  if (!activeTag && params.category && params.category !== 'all') {
    activeTag = CATEGORY_SEARCH_TAGS[params.category] || params.category;
  }

  if (activeTag) {
    searchParams.set('tag', activeTag);
  }

  if (query) {
    searchParams.set('name', query);
  }

  if (params.countryCode?.trim()) {
    searchParams.set('countrycode', params.countryCode.trim().toUpperCase());
  }

  for (const mirror of API_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6500);

      const url = `${mirror}/json/stations/search?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'RDIO-GO/2.0' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const rawData: RawApiStation[] = await response.json();
        let stations = rawData
          .filter((st) => {
            const stream = st.url_resolved || st.url;
            return (
              stream &&
              (stream.startsWith('http://') || stream.startsWith('https://')) &&
              st.name &&
              st.name.trim().length > 0
            );
          })
          .map((st) => {
            const station = sanitizeStation(st);
            if (params.category && params.category !== 'all') {
              station.category = params.category;
              station.accentColor = getColorForCategory(params.category);
            }
            return station;
          });

        // If query is a genre/topic word like "talk", "jazz", "news", also fetch by tag to include top genre stations
        if (query && !query.includes(' ') && query.length >= 3 && stations.length < limit) {
          try {
            const tagParams = new URLSearchParams(searchParams);
            tagParams.delete('name');
            tagParams.set('tag', query.toLowerCase());
            tagParams.set('limit', String(Math.min(30, limit - stations.length)));

            const tagUrl = `${mirror}/json/stations/search?${tagParams.toString()}`;
            const tagRes = await fetch(tagUrl, {
              headers: { 'User-Agent': 'RDIO-GO/2.0' },
              signal: AbortSignal.timeout(4000),
            });
            if (tagRes.ok) {
              const tagData: RawApiStation[] = await tagRes.json();
              const existingIds = new Set(stations.map((s) => s.id));
              const tagStations = tagData
                .filter((st) => {
                  const stream = st.url_resolved || st.url;
                  return (
                    stream &&
                    (stream.startsWith('http://') || stream.startsWith('https://')) &&
                    !existingIds.has(`rb-${st.stationuuid}`)
                  );
                })
                .map(sanitizeStation);
              stations = [...stations, ...tagStations];
            }
          } catch {
            // Optional tag fallback
          }
        }

        return stations;
      }
    } catch (e) {
      console.warn(`Mirror ${mirror} failed, trying next...`, e);
    }
  }

  return [];
}

/**
 * Fetch dynamic list of countries with real-time station counts
 */
export async function fetchLiveCountriesList(): Promise<CountryItem[]> {
  for (const mirror of API_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const url = `${mirror}/json/countries`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'RDIO-GO/2.0' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: Array<{ name: string; iso_3166_1: string; stationcount: number }> = await response.json();
        const countMap = new Map<string, number>();
        for (const item of data) {
          if (item.iso_3166_1) {
            countMap.set(item.iso_3166_1.toUpperCase(), item.stationcount);
          }
        }

        // Merge live station counts into our curated catalog
        return COUNTRIES_CATALOG.map((c) => {
          if (!c.code) return c;
          const liveCount = countMap.get(c.code.toUpperCase());
          return {
            ...c,
            stationCount: liveCount !== undefined ? liveCount : c.stationCount,
          };
        });
      }
    } catch (e) {
      console.warn(`Countries fetch mirror ${mirror} failed:`, e);
    }
  }

  return COUNTRIES_CATALOG;
}
