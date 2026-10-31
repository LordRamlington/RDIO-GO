import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CURATED_STATIONS } from './data/curatedStations';
import {
  RadioStation,
  StationCategory,
  PlaybackStatus,
  OfflineRecording,
  EqualizerSettings,
} from './types/radio';
import { audioEngine } from './services/audioEngine';
import {
  saveRecordingToDb,
  getAllRecordingsFromDb,
} from './services/recordingsDb';
import {
  searchGlobalStations,
  fetchLiveCountriesList,
} from './services/radioBrowserApi';
import {
  isFirstTimeScanNeeded,
  verifyStationBatch,
  getCachedOfflineStationUrls,
} from './services/stationVerifier';
import { CountryItem, COUNTRIES_CATALOG } from './data/countriesList';

import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidAppBar } from './components/AndroidAppBar';
import { AndroidNavBar, AppTab } from './components/AndroidNavBar';
import { AndroidGestureBar } from './components/AndroidGestureBar';
import { AndroidFrame } from './components/AndroidFrame';
import { MiniPlayer } from './components/MiniPlayer';
import { NowPlayingSheet } from './components/NowPlayingSheet';
import { StationsListView } from './components/StationsListView';
import { FavoritesView } from './components/FavoritesView';
import { RecordingsVault } from './components/RecordingsVault';
import { SearchGlobalStations } from './components/SearchGlobalStations';
import { EqualizerModal } from './components/EqualizerModal';
import { InstallModal } from './components/InstallModal';
import { CountryPickerModal } from './components/CountryPickerModal';
import { FirstTimeCheckModal } from './components/FirstTimeCheckModal';
import { AdBanner } from './components/AdBanner';
import { MonetizationModal } from './components/MonetizationModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { AD_CONFIG, getAdMobPublisherId, getAdMobSlotId } from './config/adConfig';
import { saveRecentSearch } from './utils/recentSearches';
import { AlertCircle, CheckCircle2, WifiOff } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'rdiogo_favorites';
const CUSTOM_STATIONS_KEY = 'rdiogo_custom_stations';

export default function App() {
  // Station State
  const [curatedStations, setCuratedStations] = useState<RadioStation[]>(CURATED_STATIONS);
  const [globalStations, setGlobalStations] = useState<RadioStation[]>([]);
  const [catalogMode, setCatalogMode] = useState<'curated' | 'global'>('global');
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(COUNTRIES_CATALOG[0]);
  const [selectedCategory, setSelectedCategory] = useState<StationCategory>('all');
  const [stationSearchQuery, setStationSearchQuery] = useState<string>('');
  const [countries, setCountries] = useState<CountryItem[]>(COUNTRIES_CATALOG);

  // Global catalog pagination
  const [isGlobalLoading, setIsGlobalLoading] = useState<boolean>(false);
  const [hasMoreGlobal, setHasMoreGlobal] = useState<boolean>(true);
  const [globalOffset, setGlobalOffset] = useState<number>(0);

  // Current playing station
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(CURATED_STATIONS[0]);
  const [activeTab, setActiveTab] = useState<AppTab>('stations');

  // Playback & Audio State
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offlineStationIds, setOfflineStationIds] = useState<Set<string>>(() => {
    // Check local cached offline streams
    const offlineUrls = getCachedOfflineStationUrls();
    const ids = new Set<string>();
    for (const st of CURATED_STATIONS) {
      if (offlineUrls.has(st.streamUrl)) {
        ids.add(st.id);
      }
    }
    return ids;
  });

  // First-Time Station Check state
  const [isFirstTimeScanOpen, setIsFirstTimeScanOpen] = useState<boolean>(() => isFirstTimeScanNeeded());
  const [isScanningIntegrity, setIsScanningIntegrity] = useState<boolean>(false);
  const [isScrollingDown, setIsScrollingDown] = useState<boolean>(false);

  // Modals
  const [isCountryModalOpen, setIsCountryModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [isEqualizerSheetOpen, setIsEqualizerSheetOpen] = useState(false);
  const [isExpandedPlayer, setIsExpandedPlayer] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Monetization & Ad State
  const [isAdsEnabled, setIsAdsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rdiogo_ads_enabled');
      return saved !== null ? saved !== 'false' : AD_CONFIG.IS_BANNER_ENABLED;
    } catch {
      return AD_CONFIG.IS_BANNER_ENABLED;
    }
  });
  const [adPublisherId, setAdPublisherId] = useState<string>(() => {
    try {
      return localStorage.getItem('rdiogo_ad_pub_id') || getAdMobPublisherId();
    } catch {
      return getAdMobPublisherId();
    }
  });
  const [adSlotId, setAdSlotId] = useState<string>(() => {
    try {
      return localStorage.getItem('rdiogo_ad_slot_id') || getAdMobSlotId();
    } catch {
      return getAdMobSlotId();
    }
  });
  const [isAdTestMode, setIsAdTestMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('rdiogo_ad_test_mode');
      return saved !== null ? saved !== 'false' : AD_CONFIG.IS_TEST_MODE;
    } catch {
      return AD_CONFIG.IS_TEST_MODE;
    }
  });
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Equalizer & Sleep Timer
  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>({
    bass: 0,
    mid: 0,
    treble: 0,
    preset: 'flat',
  });
  const [sleepTimerEndsAt, setSleepTimerEndsAt] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.filter((id) => !id.startsWith('somafm-') && id !== 'swiss-jazz');
          return migrated.length > 0 ? migrated : ['rp-mellow', 'tsf-jazz'];
        }
      }
      return ['rp-mellow', 'tsf-jazz'];
    } catch {
      return ['rp-mellow', 'tsf-jazz'];
    }
  });

  // Offline Recordings State
  const [recordings, setRecordings] = useState<OfflineRecording[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live country counts on launch
  useEffect(() => {
    fetchLiveCountriesList().then((list) => {
      if (list && list.length > 0) {
        setCountries(list);
      }
    });
  }, []);

  // Fetch Global Catalog stations when in global mode, search query, or filters change
  const fetchGlobalStationsData = useCallback(
    async (resetPage = true, queryOverride?: string) => {
      setIsGlobalLoading(true);
      const curOffset = resetPage ? 0 : globalOffset;
      const q = queryOverride !== undefined ? queryOverride : stationSearchQuery;
      const trimmedQ = q?.trim() || '';

      if (trimmedQ.length >= 2) {
        saveRecentSearch(trimmedQ);
      }

      // When a country is selected, fetch all associated stations (up to 1000) so the list is fully populated.
      // In worldwide mode, fetch 200 stations per page.
      const pageSize = selectedCountry.code ? 1000 : 200;

      const data = await searchGlobalStations({
        query: trimmedQ ? trimmedQ : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        countryCode: selectedCountry.code || undefined,
        limit: pageSize,
        offset: curOffset,
        order: 'clickcount',
      });

      if (resetPage) {
        setGlobalStations(data);
        setGlobalOffset(pageSize);
      } else {
        setGlobalStations((prev) => [...prev, ...data]);
        setGlobalOffset((prev) => prev + pageSize);
      }

      setHasMoreGlobal(data.length >= pageSize);
      setIsGlobalLoading(false);
    },
    [stationSearchQuery, selectedCategory, selectedCountry, globalOffset]
  );

  // Debounced live fetch when user switches mode, searches, or switches category/country
  useEffect(() => {
    if (catalogMode === 'global') {
      const timer = setTimeout(() => {
        fetchGlobalStationsData(true);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [catalogMode, stationSearchQuery, selectedCategory, selectedCountry]);

  // Capture PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          showToast('RDIO-GO installed to Android home screen!');
        }
      } catch (err) {
        console.warn('Install prompt notice:', err);
      } finally {
        setDeferredPrompt(null);
        setIsInstallModalOpen(false);
      }
    } else {
      setIsInstallModalOpen(true);
    }
  };

  // Hard Refresh Handler
  const handleHardRefresh = async () => {
    try {
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
        }
      }
    } finally {
      window.location.reload();
    }
  };

  // Load custom stations
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_STATIONS_KEY);
      if (savedCustom) {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCuratedStations([...CURATED_STATIONS, ...parsed]);
        }
      }
    } catch (e) {
      console.warn('Failed loading custom stations:', e);
    }
  }, []);

  // Load recordings
  const refreshRecordings = useCallback(async () => {
    try {
      const list = await getAllRecordingsFromDb();
      setRecordings(list);
    } catch (err) {
      console.warn('IndexedDB recordings load notice:', err);
    }
  }, []);

  useEffect(() => {
    refreshRecordings();
  }, [refreshRecordings]);

  // Subscribe to Audio Engine status
  useEffect(() => {
    const unsubscribe = audioEngine.subscribeStatus((newStatus, errorMsg) => {
      setStatus(newStatus);
      if (errorMsg) {
        setErrorMessage(errorMsg);
        setTimeout(() => setErrorMessage(null), 5000);
        if (currentStation) {
          setOfflineStationIds((prev) => new Set(prev).add(currentStation.id));
        }
      }
    });
    return () => unsubscribe();
  }, [currentStation]);

  // Sleep Timer countdown ticker
  useEffect(() => {
    if (!sleepTimerEndsAt) {
      setSleepTimerRemaining(null);
      return;
    }

    const checkTimer = () => {
      const remainingMs = sleepTimerEndsAt - Date.now();
      if (remainingMs <= 0) {
        audioEngine.pause();
        setSleepTimerEndsAt(null);
        setSleepTimerRemaining(null);
        showToast('Sleep timer reached. Broadcast paused.');
      } else {
        setSleepTimerRemaining(Math.round(remainingMs / 1000));
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEndsAt]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Run Station Integrity Diagnostics on demand
  const handleRunIntegrityScan = async () => {
    setIsScanningIntegrity(true);
    showToast('Scanning broadcast signals for dead links...');

    const currentList = catalogMode === 'curated' ? curatedStations : globalStations;
    const { activeStations, offlineStationIds: newOfflineIds } = await verifyStationBatch(
      currentList,
      3
    );

    setOfflineStationIds((prev) => {
      const merged = new Set(prev);
      newOfflineIds.forEach((id) => merged.add(id));
      return merged;
    });

    setIsScanningIntegrity(false);
    showToast(
      `Broadcast scan finished: ${activeStations.length} active streams online, ${newOfflineIds.size} offline excluded.`
    );
  };

  // Play / Pause handler
  const handlePlayPause = () => {
    if (isOfflineMode) {
      showToast('Offline Mode is active. Switch to Online to stream live radio.');
      return;
    }

    if (!currentStation) return;

    if (status === 'playing') {
      audioEngine.pause();
    } else if (status === 'paused') {
      audioEngine.resume();
    } else {
      audioEngine.playStream(currentStation.streamUrl, currentStation);
    }
  };

  // Synchronize station if user skipped tracks via Android notification / lock screen / Bluetooth
  useEffect(() => {
    const unsub = audioEngine.subscribeStationChange((newStation) => {
      setCurrentStation(newStation);
    });
    return () => unsub();
  }, []);

  // Next / Previous Station handlers (MediaSession & Android pull-down notification controls)
  const handleNextStation = useCallback(() => {
    if (isOfflineMode) return;
    const nextSt = audioEngine.playNextStation();
    if (nextSt) {
      setCurrentStation(nextSt);
    }
  }, [isOfflineMode]);

  const handlePrevStation = useCallback(() => {
    if (isOfflineMode) return;
    const prevSt = audioEngine.playPreviousStation();
    if (prevSt) {
      setCurrentStation(prevSt);
    }
  }, [isOfflineMode]);

  // Connect Android MediaSession callbacks (Pull-down notification controls & lock screen)
  useEffect(() => {
    audioEngine.setMediaSessionCallbacks({
      onPlay: () => {
        if (!currentStation) return;
        if (status === 'paused') {
          audioEngine.resume();
        } else {
          audioEngine.playStream(currentStation.streamUrl, currentStation);
        }
      },
      onPause: () => {
        audioEngine.pause();
      },
      onNext: handleNextStation,
      onPrevious: handlePrevStation,
    });
  }, [currentStation, status, handleNextStation, handlePrevStation]);

  // Select station banner click:
  // Tapping the currently active station banner opens the visualizer!
  // Tapping any other station switches to and plays that station
  const handleSelectStation = (station: RadioStation) => {
    if (isOfflineMode) {
      showToast('Offline Mode is active. Switch to Online to stream live radio.');
      return;
    }

    if (currentStation?.id === station.id) {
      setIsExpandedPlayer(true);
      return;
    }

    setCurrentStation(station);
    audioEngine.playStream(station.streamUrl, station);
  };

  // Dedicated Play/Pause button on station cards:
  // Plays or pauses audio directly - NEVER opens the visualizer
  const handleStationPlayPause = (station: RadioStation) => {
    if (isOfflineMode) {
      showToast('Offline Mode is active. Switch to Online to stream live radio.');
      return;
    }

    if (currentStation?.id === station.id) {
      if (status === 'playing') {
        audioEngine.pause();
      } else {
        audioEngine.resume();
      }
    } else {
      setCurrentStation(station);
      audioEngine.playStream(station.streamUrl, station);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (station: RadioStation) => {
    setFavorites((prev) => {
      const exists = prev.includes(station.id);
      const updated = exists ? prev.filter((id) => id !== station.id) : [...prev, station.id];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage failed:', e);
      }
      showToast(exists ? `Removed ${station.name} from Favorites` : `Added ${station.name} to Favorites`);
      return updated;
    });
  };

  // Recording handler
  const handleToggleRecord = async () => {
    if (!currentStation) return;

    if (!isRecording) {
      if (status !== 'playing') {
        audioEngine.playStream(currentStation.streamUrl);
      }

      const started = audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordingSeconds(0);
        showToast(`Recording started for ${currentStation.name}`);

        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      } else {
        showToast('Could not start recorder.');
      }
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);

      const capturedDuration = Math.max(1, recordingSeconds);
      const { blob, mimeType } = await audioEngine.stopRecording();

      const newRecording: OfflineRecording = {
        id: `rec_${Date.now()}`,
        stationId: currentStation.id,
        stationName: currentStation.name,
        category: currentStation.category,
        accentColor: currentStation.accentColor,
        title: `${currentStation.name} Broadcast`,
        notes: `Recorded on ${new Date().toLocaleDateString()}`,
        timestamp: Date.now(),
        durationSec: capturedDuration,
        fileSizeBytes: blob.size || capturedDuration * 16000,
        audioMimeType: mimeType || 'audio/webm',
        blob,
      };

      await saveRecordingToDb(newRecording);
      await refreshRecordings();
      showToast('Saved broadcast to your Offline Vault!');
    }
  };

  // Volume
  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.8);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  // Equalizer
  const handleUpdateEqualizer = (newSettings: EqualizerSettings) => {
    setEqualizerSettings(newSettings);
    audioEngine.applyEqualizer(newSettings);
  };

  // Sleep Timer
  const handleSetSleepTimer = (minutes: number | null) => {
    if (!minutes) {
      setSleepTimerEndsAt(null);
      setSleepTimerRemaining(null);
      showToast('Sleep timer cancelled');
    } else {
      const endsAt = Date.now() + minutes * 60 * 1000;
      setSleepTimerEndsAt(endsAt);
      setSleepTimerRemaining(minutes * 60);
      showToast(`Sleep timer set for ${minutes} minutes`);
    }
  };

  // Add custom station
  const handleAddCustomStation = (newStation: RadioStation) => {
    setCuratedStations((prev) => {
      const updated = [newStation, ...prev];
      const customOnly = updated.filter((s) => s.isCustom);
      try {
        localStorage.setItem(CUSTOM_STATIONS_KEY, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Failed saving custom station:', e);
      }
      return updated;
    });
    showToast(`Added custom station: ${newStation.name}`);
  };

  // Ad & Monetization Handlers
  const handleToggleAds = (enabled: boolean) => {
    setIsAdsEnabled(enabled);
    try {
      localStorage.setItem('rdiogo_ads_enabled', String(enabled));
    } catch (e) {
      console.warn('Storage notice:', e);
    }
    showToast(enabled ? 'Ad banner enabled' : 'Ad banner hidden (Pro Mode)');
  };

  const handleUpdateAdConfig = (pubId: string, slotId: string, testMode: boolean) => {
    setAdPublisherId(pubId);
    setAdSlotId(slotId);
    setIsAdTestMode(testMode);
    try {
      localStorage.setItem('rdiogo_ad_pub_id', pubId);
      localStorage.setItem('rdiogo_ad_slot_id', slotId);
      localStorage.setItem('rdiogo_ad_test_mode', String(testMode));
    } catch (e) {
      console.warn('Storage notice:', e);
    }
    showToast('Monetization settings saved!');
  };

  const allActivePool = catalogMode === 'curated' ? curatedStations : globalStations;
  const favoriteStationsList = [
    ...curatedStations,
    ...globalStations,
  ].filter((s, idx, self) => favorites.includes(s.id) && self.findIndex((x) => x.id === s.id) === idx);

  // Keep audioEngine playlist updated so background controls always know the full list of stations
  useEffect(() => {
    const pool =
      activeTab === 'favorites' && favoriteStationsList.length > 0
        ? favoriteStationsList
        : catalogMode === 'curated'
        ? curatedStations
        : globalStations.length > 0
        ? globalStations
        : curatedStations;

    audioEngine.setPlaylist(pool);
  }, [activeTab, catalogMode, curatedStations, globalStations, favoriteStationsList]);

  return (
    <AndroidFrame
      isPhoneFrame={isPhoneFrame}
      onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
    >
      {/* 1. Android Top System Status Bar */}
      <AndroidStatusBar
        isPlaying={status === 'playing'}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        isOfflineMode={isOfflineMode}
      />

      {/* 2. Android App Top Bar */}
      <AndroidAppBar
        activeTab={activeTab}
        isPlaying={status === 'playing'}
        isRecording={isRecording}
        recordingSeconds={recordingSeconds}
        isOfflineMode={isOfflineMode}
        isScanningIntegrity={isScanningIntegrity}
        onOpenEqualizer={() => setIsEqualizerSheetOpen(true)}
        onToggleRecord={handleToggleRecord}
        onHardRefresh={handleHardRefresh}
        onOpenIntegrityCheck={() => setIsFirstTimeScanOpen(true)}
        onOpenMonetization={() => setIsMonetizationModalOpen(true)}
      />

      {/* Offline Mode Alert banner if active */}
      {isOfflineMode && (
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Offline Mode Active · Playing from IndexedDB</span>
          </div>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="text-[11px] font-semibold text-amber-300 underline hover:text-white"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-rose-950/90 border border-rose-800/80 text-xs text-rose-200 flex items-center gap-2 z-40">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="flex-1">{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Success / Info Toast */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-900 border border-emerald-500/50 shadow-xl text-xs font-medium text-emerald-300 flex items-center gap-2 z-50">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 3. Main View Switcher */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
        {activeTab === 'stations' && (
          <StationsListView
            stations={curatedStations}
            globalStations={globalStations}
            isGlobalLoading={isGlobalLoading}
            hasMoreGlobal={hasMoreGlobal}
            onLoadMoreGlobal={() => fetchGlobalStationsData(false)}
            currentStation={currentStation}
            isPlaying={status === 'playing'}
            isLoading={status === 'loading'}
            favorites={favorites}
            offlineStationIds={offlineStationIds}
            selectedCategory={selectedCategory}
            selectedCountry={selectedCountry}
            catalogMode={catalogMode}
            onSelectCategory={setSelectedCategory}
            onSelectCountry={(country) => {
              setSelectedCountry(country);
              if (catalogMode === 'curated') {
                setCatalogMode('global');
              }
            }}
            onSelectStation={handleSelectStation}
            onPlayPauseStation={handleStationPlayPause}
            onToggleFavorite={handleToggleFavorite}
            onToggleCatalogMode={setCatalogMode}
            onOpenCountryModal={() => setIsCountryModalOpen(true)}
            onRunIntegrityScan={handleRunIntegrityScan}
            isScanningIntegrity={isScanningIntegrity}
            searchQuery={stationSearchQuery}
            onSearchQueryChange={setStationSearchQuery}
            onScrollDirectionChange={setIsScrollingDown}
          />
        )}

        {activeTab === 'search' && (
          <SearchGlobalStations
            currentStation={currentStation}
            isPlaying={status === 'playing'}
            isLoading={status === 'loading'}
            favorites={favorites}
            offlineStationIds={offlineStationIds}
            onSelectStation={handleSelectStation}
            onPlayPauseStation={handleStationPlayPause}
            onToggleFavorite={handleToggleFavorite}
            onAddCustomStation={handleAddCustomStation}
            onScrollDirectionChange={setIsScrollingDown}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favoriteStations={favoriteStationsList}
            currentStation={currentStation}
            isPlaying={status === 'playing'}
            isLoading={status === 'loading'}
            onSelectStation={handleSelectStation}
            onPlayPauseStation={handleStationPlayPause}
            onToggleFavorite={handleToggleFavorite}
            onGoToStations={() => setActiveTab('stations')}
            onScrollDirectionChange={setIsScrollingDown}
          />
        )}

        {activeTab === 'recordings' && (
          <RecordingsVault
            recordings={recordings}
            onRefreshRecordings={refreshRecordings}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
            onGoToRadio={() => setActiveTab('stations')}
          />
        )}

        {activeTab === 'equalizer' && (
          <EqualizerModal
            settings={equalizerSettings}
            sleepTimerRemaining={sleepTimerRemaining}
            onUpdateSettings={handleUpdateEqualizer}
            onSetSleepTimer={handleSetSleepTimer}
            onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
            isSheet={false}
          />
        )}
      </main>

      {/* 5. Expanded Now Playing Full Sheet */}
      {isExpandedPlayer && currentStation && (
        <NowPlayingSheet
          station={currentStation}
          status={status}
          isFavorite={favorites.includes(currentStation.id)}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          volume={volume}
          isMuted={isMuted}
          sleepTimerRemaining={sleepTimerRemaining}
          onClose={() => setIsExpandedPlayer(false)}
          onPlayPause={handlePlayPause}
          onNextStation={handleNextStation}
          onPreviousStation={handlePrevStation}
          onToggleFavorite={() => handleToggleFavorite(currentStation)}
          onToggleRecord={handleToggleRecord}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onOpenEqualizer={() => setIsEqualizerSheetOpen(true)}
          onOpenSleepTimer={() => setIsEqualizerSheetOpen(true)}
        />
      )}

      {/* Equalizer Quick Sheet */}
      {isEqualizerSheetOpen && (
        <EqualizerModal
          settings={equalizerSettings}
          sleepTimerRemaining={sleepTimerRemaining}
          onUpdateSettings={handleUpdateEqualizer}
          onSetSleepTimer={handleSetSleepTimer}
          onOpenPrivacyPolicy={() => {
            setIsEqualizerSheetOpen(false);
            setIsPrivacyModalOpen(true);
          }}
          onClose={() => setIsEqualizerSheetOpen(false)}
          isSheet={true}
        />
      )}

      {/* Privacy Policy & Google Play Disclosures Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      {/* Install & APK Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      {/* Country Selection Modal */}
      <CountryPickerModal
        isOpen={isCountryModalOpen}
        selectedCountryCode={selectedCountry.code}
        countries={countries}
        onSelectCountry={(country) => {
          setSelectedCountry(country);
          if (catalogMode === 'curated') {
            setCatalogMode('global');
          }
        }}
        onClose={() => setIsCountryModalOpen(false)}
      />

      {/* First-Time Install Station Integrity Check Modal */}
      <FirstTimeCheckModal
        isOpen={isFirstTimeScanOpen}
        stationsToCheck={CURATED_STATIONS.slice(0, 100)}
        onComplete={(activeStations, offlineIds) => {
          setOfflineStationIds(offlineIds);
          if (activeStations.length > 0 && currentStation && offlineIds.has(currentStation.id)) {
            setCurrentStation(activeStations[0]);
          }
          showToast(`Integrity check complete: ${activeStations.length} of 100 active streams verified!`);
        }}
        onClose={() => setIsFirstTimeScanOpen(false)}
      />

      {/* Monetization & Google AdMob Setup Modal */}
      <MonetizationModal
        isOpen={isMonetizationModalOpen}
        isAdsEnabled={isAdsEnabled}
        publisherId={adPublisherId}
        adSlotId={adSlotId}
        isTestMode={isAdTestMode}
        onToggleAds={handleToggleAds}
        onUpdateConfig={handleUpdateAdConfig}
        onClose={() => setIsMonetizationModalOpen(false)}
      />

      {/* Docked Bottom Bar: Mini Player + AdMob Banner + Bottom Navigation */}
      <div className="shrink-0 z-30 flex flex-col bg-slate-950/98 backdrop-blur-md border-t border-slate-900/80 shadow-2xl">
        {/* 4. Mini Player (Firmly docked directly above Ad Banner & Nav, always visible at bottom of screen) */}
        {currentStation && (
          <div className="transition-transform duration-200">
            <MiniPlayer
              station={currentStation}
              status={status}
              isRecording={isRecording}
              recordingSeconds={recordingSeconds}
              onPlayPause={handlePlayPause}
              onNextStation={handleNextStation}
              onPreviousStation={handlePrevStation}
              onToggleRecord={handleToggleRecord}
              onOpenExpandedPlayer={() => setIsExpandedPlayer(true)}
            />
          </div>
        )}

        {/* 5. Mobile Advertising Banner (Always visible and cleanly docked above nav bar) */}
        {isAdsEnabled && (
          <div className="overflow-hidden">
            <AdBanner
              publisherId={adPublisherId}
              adSlotId={adSlotId}
              isTestMode={isAdTestMode}
              onOpenMonetizationModal={() => setIsMonetizationModalOpen(true)}
              onRemoveAds={() => handleToggleAds(false)}
            />
          </div>
        )}

        {/* 6. Material 3 Bottom Navigation Bar */}
        <AndroidNavBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          favoritesCount={favorites.length}
          recordingsCount={recordings.length}
          isRecording={isRecording}
        />
      </div>

      {/* 7. Native Android Gesture Pill Handle */}
      <AndroidGestureBar />
    </AndroidFrame>
  );
}
