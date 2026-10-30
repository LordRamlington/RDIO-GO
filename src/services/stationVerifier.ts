import { RadioStation } from '../types/radio';

const HEALTH_CACHE_KEY = 'rdiogo_station_health_v2';
const FIRST_TIME_CHECK_KEY = 'rdiogo_first_time_scan_done';

interface CachedHealth {
  status: 'online' | 'offline';
  timestamp: number;
}

// 24-hour cache validity
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getHealthCache(): Record<string, CachedHealth> {
  try {
    const raw = localStorage.getItem(HEALTH_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveHealthCache(cache: Record<string, CachedHealth>) {
  try {
    localStorage.setItem(HEALTH_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed saving health cache:', e);
  }
}

/**
 * Checks if first-time install broadcast scan has been executed
 */
export function isFirstTimeScanNeeded(): boolean {
  try {
    return localStorage.getItem(FIRST_TIME_CHECK_KEY) !== 'true';
  } catch {
    return false;
  }
}

export function markFirstTimeScanComplete(): void {
  try {
    localStorage.setItem(FIRST_TIME_CHECK_KEY, 'true');
  } catch (e) {
    console.warn('Failed marking scan complete:', e);
  }
}

/**
 * Probe a single audio stream URL to verify if it is active, reachable, and audio can be loaded
 */
export function probeStationAccessibility(
  streamUrl: string,
  timeoutMs: number = 3200
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    // 1. Basic URL sanity check
    if (!streamUrl || typeof streamUrl !== 'string') {
      resolve(false);
      return;
    }

    // In HTTPS contexts, insecure HTTP streams are blocked by browsers (Mixed Content)
    if (window.location.protocol === 'https:' && streamUrl.startsWith('http://')) {
      resolve(false);
      return;
    }

    // 2. Check cached result if fresh
    const cache = getHealthCache();
    const cached = cache[streamUrl];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      resolve(cached.status === 'online');
      return;
    }

    // 3. Perform lightweight probe using headless Audio element
    let settled = false;
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.muted = true;

    const cleanup = (isOnline: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      audio.onerror = null;
      audio.onloadedmetadata = null;
      audio.oncanplay = null;
      audio.onprogress = null;
      audio.onplaying = null;
      try {
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      } catch {
        // ignore cleanup error
      }

      // Update cache
      const curCache = getHealthCache();
      curCache[streamUrl] = {
        status: isOnline ? 'online' : 'offline',
        timestamp: Date.now(),
      };
      saveHealthCache(curCache);

      resolve(isOnline);
    };

    const timer = setTimeout(() => {
      // Check if we received any audio frame data or readyState
      if (audio.readyState >= 1 || (audio.buffered && audio.buffered.length > 0)) {
        cleanup(true);
      } else {
        cleanup(false);
      }
    }, timeoutMs);

    audio.onloadedmetadata = () => cleanup(true);
    audio.oncanplay = () => cleanup(true);
    audio.onplaying = () => cleanup(true);
    audio.onprogress = () => {
      if (audio.buffered && audio.buffered.length > 0) {
        cleanup(true);
      }
    };

    audio.onerror = () => {
      // Stream error encountered (e.g. 404, 503, connection refused, unsupported codec)
      cleanup(false);
    };

    try {
      audio.src = streamUrl;
    } catch {
      cleanup(false);
    }
  });
}

export interface VerificationProgress {
  scanned: number;
  total: number;
  onlineCount: number;
  offlineCount: number;
  currentStationName: string;
}

/**
 * Verify a list of stations in parallel batches.
 * Returns only the active broadcasting stations and a set of offline IDs.
 */
export async function verifyStationBatch(
  stations: RadioStation[],
  concurrency = 3,
  onProgress?: (progress: VerificationProgress) => void
): Promise<{
  activeStations: RadioStation[];
  offlineStationIds: Set<string>;
}> {
  const offlineIds = new Set<string>();
  const activeStations: RadioStation[] = [];
  let scanned = 0;
  let onlineCount = 0;
  let offlineCount = 0;

  // Process in small concurrency chunks to respect mobile network sockets
  for (let i = 0; i < stations.length; i += concurrency) {
    const chunk = stations.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (station) => {
        onProgress?.({
          scanned,
          total: stations.length,
          onlineCount,
          offlineCount,
          currentStationName: station.name,
        });

        const isAlive = await probeStationAccessibility(station.streamUrl, 3000);
        scanned += 1;

        if (isAlive) {
          onlineCount += 1;
          activeStations.push(station);
        } else {
          offlineCount += 1;
          offlineIds.add(station.id);
        }

        onProgress?.({
          scanned,
          total: stations.length,
          onlineCount,
          offlineCount,
          currentStationName: station.name,
        });
      })
    );
  }

  return {
    activeStations,
    offlineStationIds: offlineIds,
  };
}

/**
 * Get all known offline station IDs from persistent cache
 */
export function getCachedOfflineStationUrls(): Set<string> {
  const cache = getHealthCache();
  const offlineUrls = new Set<string>();
  for (const [url, item] of Object.entries(cache)) {
    if (item.status === 'offline') {
      offlineUrls.add(url);
    }
  }
  return offlineUrls;
}

/**
 * Clear cached health checks
 */
export function resetHealthCache(): void {
  try {
    localStorage.removeItem(HEALTH_CACHE_KEY);
    localStorage.removeItem(FIRST_TIME_CHECK_KEY);
  } catch (e) {
    console.warn('Failed clearing health cache:', e);
  }
}
