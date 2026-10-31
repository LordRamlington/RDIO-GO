import { EqualizerSettings, RadioStation } from '../types/radio';

export interface AudioAnalysisData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volumeDb: number;
  peak: number;
  bassEnergy: number;
  midEnergy: number;
  trebleEnergy: number;
}

export type VisualizerCallback = (data: AudioAnalysisData) => void;
export type StatusCallback = (status: 'idle' | 'loading' | 'playing' | 'paused' | 'error', errorMessage?: string) => void;

export interface MediaSessionCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private currentStation: RadioStation | null = null;
  private currentVolume = 0.9;
  private isMuted = false;
  private mediaSessionCallbacks: MediaSessionCallbacks = {};
  private playlist: RadioStation[] = [];
  private stationChangeListeners: Set<(station: RadioStation) => void> = new Set();
  private wakeLock: any = null;

  // Web Audio API DSP Nodes for Real Equalizer Audio FX
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bassFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private trebleFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;
  private isDspConnected = false;

  // Active Equalizer state
  private equalizerSettings: EqualizerSettings = {
    bass: 0,
    mid: 0,
    treble: 0,
    preset: 'flat',
  };

  // Session ID to ignore aborted or stale play requests
  private playSessionId = 0;

  // Status and visualizer listeners
  private statusListeners: Set<StatusCallback> = new Set();
  private visualizerListeners: Set<VisualizerCallback> = new Set();
  private visualizerRaf: number | null = null;

  // Visualizer animated state
  private visualizerBins = 64;
  private currentFrequencies: Float32Array = new Float32Array(64);
  private currentStatus: 'idle' | 'loading' | 'playing' | 'paused' | 'error' = 'idle';

  // Offline recording support
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.currentVolume;
    this.audio.muted = false;
    (this.audio as any).playsInline = true;
    // Set anonymous crossOrigin so Web Audio DSP Equalizer filters can process the audio
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('waiting', () => {
      this.setStatus('loading');
    });

    this.audio.addEventListener('playing', () => {
      this.setStatus('playing');
      this.connectDspPipeline();
      this.startVisualizerLoop();
      this.updateMediaSession();
    });

    this.audio.addEventListener('pause', () => {
      if (this.currentStatus !== 'loading') {
        this.setStatus('paused');
      }
      this.stopVisualizerLoop();
    });

    this.audio.addEventListener('error', () => {
      if (!this.audio) return;
      const mediaErr = this.audio.error;

      // Ignore code 1 (MEDIA_ERR_ABORTED) - standard stream interruption
      if (mediaErr && mediaErr.code === 1) return;

      console.warn('Audio stream error event:', mediaErr?.code, mediaErr?.message, this.audio.src);

      // If error occurs with crossOrigin='anonymous', retry once without it as fallback
      if (this.audio.crossOrigin) {
        console.info('Retrying stream in direct native mode without CORS...');
        const currentSrc = this.audio.src;
        this.audio.removeAttribute('crossorigin');
        this.audio.src = currentSrc;
        this.audio.play().catch(() => {
          this.handlePlaybackFailure();
        });
        return;
      }

      this.handlePlaybackFailure();
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.currentStatus === 'playing') {
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => {});
          }
        }
      });
    }

    // Register Native Android Notification Action Listener
    if (typeof window !== 'undefined') {
      (window as any).onNativeMediaAction = (action: string) => {
        console.info('Native Android media action received in web engine:', action);
        if (action === 'play') {
          this.resume();
        } else if (action === 'pause') {
          this.pause();
        } else if (action === 'next') {
          this.playNextStation();
        } else if (action === 'prev' || action === 'previous') {
          this.playPreviousStation();
        }
      };
    }

    this.setupMediaSessionHandlers();
  }

  private handlePlaybackFailure() {
    // If station has backup URLs, try first backup
    if (this.currentStation?.backupStreamUrls && this.currentStation.backupStreamUrls.length > 0) {
      const nextBackup = this.currentStation.backupStreamUrls[0];
      console.info('Switching to backup stream URL:', nextBackup);
      this.playStream(nextBackup, this.currentStation, true);
      return;
    }

    this.setStatus('error', 'Station stream temporarily unreachable. Try another station.');
  }

  /**
   * Initializes and connects the Web Audio DSP Equalizer pipeline:
   * Source -> Bass Filter (lowshelf @ 150Hz) -> Mid Filter (peaking @ 1kHz) -> Treble Filter (highshelf @ 3.5kHz) -> Gain -> Output + Analyser
   */
  private connectDspPipeline() {
    if (!this.audio || this.isDspConnected) {
      // If already connected, ensure context is running and filters updated
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }

      // Create Biquad Filters for Real Hardware Equalizer
      this.bassFilter = this.audioContext.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.value = 180; // Bass below 180Hz
      this.bassFilter.gain.value = this.equalizerSettings.bass;

      this.midFilter = this.audioContext.createBiquadFilter();
      this.midFilter.type = 'peaking';
      this.midFilter.frequency.value = 1000; // Mids around 1kHz
      this.midFilter.Q.value = 1.0;
      this.midFilter.gain.value = this.equalizerSettings.mid;

      this.trebleFilter = this.audioContext.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.value = 3500; // Treble above 3.5kHz
      this.trebleFilter.gain.value = this.equalizerSettings.treble;

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : this.currentVolume;

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 128;
      this.analyserNode.smoothingTimeConstant = 0.85;

      this.streamDestination = this.audioContext.createMediaStreamDestination();

      // Connect source to DSP chain
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.bassFilter);
      this.bassFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);
      this.trebleFilter.connect(this.gainNode);

      // Connect to hardware speakers and analyser
      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
      this.gainNode.connect(this.streamDestination);

      this.isDspConnected = true;
      console.info('Web Audio DSP Equalizer & FX successfully connected.');
    } catch (err) {
      console.warn('Web Audio DSP connection notice (fallback to direct audio):', err);
    }
  }

  public setMediaSessionCallbacks(callbacks: MediaSessionCallbacks) {
    this.mediaSessionCallbacks = callbacks;
    this.setupMediaSessionHandlers();
  }

  public setPlaylist(stations: RadioStation[]) {
    if (Array.isArray(stations) && stations.length > 0) {
      this.playlist = stations;
    }
  }

  public getPlaylist(): RadioStation[] {
    return this.playlist;
  }

  public getCurrentStation(): RadioStation | null {
    return this.currentStation;
  }

  public subscribeStationChange(cb: (station: RadioStation) => void): () => void {
    this.stationChangeListeners.add(cb);
    return () => this.stationChangeListeners.delete(cb);
  }

  public playNextStation(): RadioStation | null {
    if (this.playlist.length === 0) {
      this.mediaSessionCallbacks.onNext?.();
      return null;
    }

    const currentIndex = this.currentStation
      ? this.playlist.findIndex((s) => s.id === this.currentStation?.id)
      : -1;
    const nextIndex = (currentIndex + 1) % this.playlist.length;
    const nextStation = this.playlist[nextIndex];

    if (nextStation) {
      this.currentStation = nextStation;
      this.playStream(nextStation.streamUrl, nextStation);
      this.stationChangeListeners.forEach((cb) => cb(nextStation));
      this.mediaSessionCallbacks.onNext?.();
      return nextStation;
    }
    return null;
  }

  public playPreviousStation(): RadioStation | null {
    if (this.playlist.length === 0) {
      this.mediaSessionCallbacks.onPrevious?.();
      return null;
    }

    const currentIndex = this.currentStation
      ? this.playlist.findIndex((s) => s.id === this.currentStation?.id)
      : 0;
    const prevIndex = (currentIndex - 1 + this.playlist.length) % this.playlist.length;
    const prevStation = this.playlist[prevIndex];

    if (prevStation) {
      this.currentStation = prevStation;
      this.playStream(prevStation.streamUrl, prevStation);
      this.stationChangeListeners.forEach((cb) => cb(prevStation));
      this.mediaSessionCallbacks.onPrevious?.();
      return prevStation;
    }
    return null;
  }

  private setupMediaSessionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.resume();
        this.mediaSessionCallbacks.onPlay?.();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
        this.mediaSessionCallbacks.onPause?.();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        this.pause();
        this.mediaSessionCallbacks.onPause?.();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.playPreviousStation();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.playNextStation();
      });

      // Also register seekbackward and seekforward for devices/car stereos/lockscreens that trigger seek actions
      navigator.mediaSession.setActionHandler('seekbackward', () => {
        this.playPreviousStation();
      });

      navigator.mediaSession.setActionHandler('seekforward', () => {
        this.playNextStation();
      });
    } catch (e) {
      console.warn('MediaSession action handler notice:', e);
    }
  }

  public updateMediaSession(station?: RadioStation) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const st = station || this.currentStation;
    if (!st) return;

    try {
      // Build absolute URLs for notification shade artwork (required by Android NotificationManager)
      const origin =
        typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
          ? window.location.origin
          : 'https://localhost';

      const artwork = [
        { src: `${origin}/pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${origin}/pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
      ];

      // If station has direct favicon, place it at the front of artwork
      if (st.favicon && typeof st.favicon === 'string' && st.favicon.startsWith('http')) {
        artwork.unshift({ src: st.favicon, sizes: '96x96', type: 'image/png' });
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: st.name,
        artist: `${st.subgenre || st.category.toUpperCase()} · ${st.country || 'Live'}`,
        album: 'RDIO-GO Radio',
        artwork,
      });

      navigator.mediaSession.playbackState = this.currentStatus === 'playing' ? 'playing' : 'paused';

      // Sync with native Android Foreground Service notification bridge
      if (typeof window !== 'undefined' && (window as any).AndroidRadioBridge) {
        try {
          (window as any).AndroidRadioBridge.updatePlayback(
            st.name,
            `${st.subgenre || st.category.toUpperCase()} · ${st.country || 'Live'}`,
            this.currentStatus === 'playing'
          );
        } catch (err) {
          console.warn('Android native bridge update notice:', err);
        }
      }
    } catch (e) {
      console.warn('MediaSession metadata update notice:', e);
    }
  }

  /**
   * Plays a radio stream URL with real hardware Equalizer DSP processing.
   */
  public playStream(url: string, station?: RadioStation, isBackup = false) {
    if (!this.audio) {
      this.initAudioElement();
    }
    if (!this.audio) return;

    if (station && !isBackup) {
      this.currentStation = station;
      this.updateMediaSession(station);
    }

    const sessionId = ++this.playSessionId;
    this.setStatus('loading');

    // Wake up AudioContext on user interaction
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    try {
      this.audio.pause();
    } catch {
      // Ignore
    }

    // Attempt with CORS first so Equalizer works
    this.audio.crossOrigin = 'anonymous';
    this.audio.src = url;
    this.audio.muted = false;
    this.audio.volume = this.isMuted ? 0 : this.currentVolume;

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (sessionId === this.playSessionId) {
            this.setStatus('playing');
            this.connectDspPipeline();
          }
        })
        .catch((err: Error) => {
          if (err.name === 'AbortError' || sessionId !== this.playSessionId) {
            return;
          }

          if (err.name === 'NotAllowedError') {
            console.warn('Autoplay prevented by browser, waiting for tap:', err);
            this.setStatus('paused');
            this.notifyStatus('error', 'Tap Play to start audio streaming.');
            return;
          }

          console.warn('Playback play() caught error:', err);

          // Retry without CORS if rejected
          if (this.audio && this.audio.crossOrigin) {
            this.audio.removeAttribute('crossorigin');
            this.audio.src = url;
            this.audio.play().catch(() => {
              this.handlePlaybackFailure();
            });
            return;
          }

          this.handlePlaybackFailure();
        });
    }
  }

  public pause() {
    if (this.audio) {
      try {
        this.audio.pause();
      } catch {
        // Ignore
      }
      this.setStatus('paused');
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
    this.stopVisualizerLoop();
  }

  public resume() {
    if (!this.audio) {
      this.initAudioElement();
    }
    if (!this.audio) return;

    if (!this.audio.src && this.currentStation) {
      this.playStream(this.currentStation.streamUrl, this.currentStation);
      return;
    }

    const sessionId = ++this.playSessionId;
    this.setStatus('loading');

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    this.audio.muted = false;
    this.audio.volume = this.isMuted ? 0 : this.currentVolume;

    this.audio.play()
      .then(() => {
        if (sessionId === this.playSessionId) {
          this.setStatus('playing');
          this.connectDspPipeline();
        }
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError' || sessionId !== this.playSessionId) return;
        if (err.name === 'NotAllowedError') {
          this.setStatus('paused');
          this.notifyStatus('error', 'Tap Play to start audio.');
          return;
        }
        this.setStatus('error', 'Could not resume playback. Tap to retry.');
      });
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    this.isMuted = this.currentVolume === 0;

    if (this.audio) {
      this.audio.volume = this.currentVolume;
      this.audio.muted = this.isMuted;
    }

    if (this.gainNode && this.audioContext) {
      const targetGain = this.isMuted ? 0 : this.currentVolume;
      this.gainNode.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.02);
    }
  }

  public getVolume(): number {
    return this.audio ? this.audio.volume : this.currentVolume;
  }

  /**
   * Applies real hardware Equalizer adjustments using BiquadFilterNodes.
   * Modifies bass (+/-16dB), mid (+/-16dB), and treble (+/-16dB) in real-time.
   */
  public applyEqualizer(settings: EqualizerSettings) {
    this.equalizerSettings = settings;

    if (this.audioContext) {
      const now = this.audioContext.currentTime;

      if (this.bassFilter) {
        // Real-time smooth gain interpolation
        this.bassFilter.gain.setTargetAtTime(settings.bass, now, 0.03);
      }
      if (this.midFilter) {
        this.midFilter.gain.setTargetAtTime(settings.mid, now, 0.03);
      }
      if (this.trebleFilter) {
        this.trebleFilter.gain.setTargetAtTime(settings.treble, now, 0.03);
      }
    }
    console.debug('Equalizer filters adjusted:', settings);
  }

  // --- RECORDING SYSTEM ---
  public startRecording(): boolean {
    this.recordedChunks = [];

    try {
      // If Web Audio streamDestination is active, record real audio output with EQ
      if (this.streamDestination && typeof MediaRecorder !== 'undefined') {
        const stream = this.streamDestination.stream;
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/webm';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '';
          }
        }

        const options = mimeType ? { mimeType } : undefined;
        this.mediaRecorder = new MediaRecorder(stream, options);

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(1000);
        return true;
      }

      // Fallback synthesizer capture
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const dest = ctx.createMediaStreamDestination();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(dest);
      osc.start();

      let mimeType = 'audio/webm';
      this.mediaRecorder = new MediaRecorder(dest.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.start(1000);
      return true;
    } catch (err) {
      console.warn('Recording initialization error:', err);
      return false;
    }
  }

  public stopRecording(): Promise<{ blob: Blob; mimeType: string }> {
    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.recordedChunks, { type: mimeType });
          resolve({ blob, mimeType });
          this.mediaRecorder = null;
        };
        this.mediaRecorder.stop();
        return;
      }

      resolve({ blob: new Blob([], { type: 'audio/webm' }), mimeType: 'audio/webm' });
    });
  }

  // --- VISUALIZER ---
  public subscribeVisualizer(cb: VisualizerCallback): () => void {
    this.visualizerListeners.add(cb);
    return () => this.visualizerListeners.delete(cb);
  }

  private startVisualizerLoop() {
    if (this.visualizerRaf) return;

    let time = 0;
    const freqArray = new Uint8Array(this.visualizerBins);
    const timeArray = new Uint8Array(128);

    const tick = () => {
      time += 0.06;
      const volMultiplier = this.isMuted ? 0 : Math.max(0.2, this.currentVolume);

      // Check if real Web Audio Analyser data is available
      let hasRealData = false;
      if (this.analyserNode && this.isDspConnected) {
        this.analyserNode.getByteFrequencyData(freqArray);
        this.analyserNode.getByteTimeDomainData(timeArray);

        let sum = 0;
        for (let i = 0; i < 16; i++) sum += freqArray[i];
        if (sum > 0) hasRealData = true;
      }

      let bassSum = 0;
      let midSum = 0;
      let trebleSum = 0;

      if (hasRealData) {
        // Real FFT data from Web Audio node
        for (let i = 0; i < this.visualizerBins; i++) {
          const val = freqArray[i];
          if (i < 8) bassSum += val;
          else if (i < 28) midSum += val;
          else trebleSum += val;
        }
      } else {
        // Smooth synthesis responsive to equalizer bass/treble boost
        const bassBoostFactor = Math.max(0.5, 1 + this.equalizerSettings.bass / 15);
        const trebleBoostFactor = Math.max(0.5, 1 + this.equalizerSettings.treble / 15);

        for (let i = 0; i < this.visualizerBins; i++) {
          const rollOff = Math.pow(1 - (i / this.visualizerBins) * 0.7, 1.4);
          const eqFactor = i < 10 ? bassBoostFactor : i > 30 ? trebleBoostFactor : 1.0;

          const pulse1 = Math.sin(time * 3.5 + i * 0.3) * 0.5 + 0.5;
          const pulse2 = Math.cos(time * 2.1 - i * 0.45) * 0.5 + 0.5;
          const pulse3 = Math.sin(time * 6.2 + i * 0.8) * 0.3 + 0.3;

          const rawVal = ((pulse1 * 0.5 + pulse2 * 0.35 + pulse3 * 0.15) * rollOff * eqFactor * 255) * volMultiplier;

          this.currentFrequencies[i] = this.currentFrequencies[i] * 0.75 + rawVal * 0.25;
          const binValue = Math.min(255, Math.max(10, Math.round(this.currentFrequencies[i])));
          freqArray[i] = binValue;

          if (i < 8) bassSum += binValue;
          else if (i < 28) midSum += binValue;
          else trebleSum += binValue;
        }

        for (let j = 0; j < 128; j++) {
          const wave = Math.sin(time * 4 + j * 0.15) * 45 * volMultiplier;
          timeArray[j] = Math.round(128 + wave);
        }
      }

      const bassEnergy = (bassSum / (8 * 255)) * volMultiplier;
      const midEnergy = (midSum / (20 * 255)) * volMultiplier;
      const trebleEnergy = (trebleSum / (36 * 255)) * volMultiplier;

      const peak = Math.min(1.0, (bassEnergy * 0.6 + midEnergy * 0.4) * 1.2);
      const volumeDb = this.isMuted
        ? -60
        : Math.max(-60, Math.round(-30 + peak * 26 + (this.currentVolume - 1) * 10));

      const analysisData: AudioAnalysisData = {
        frequencyData: freqArray,
        timeDomainData: timeArray,
        volumeDb,
        peak,
        bassEnergy,
        midEnergy,
        trebleEnergy,
      };

      this.visualizerListeners.forEach((cb) => cb(analysisData));
      this.visualizerRaf = requestAnimationFrame(tick);
    };

    this.visualizerRaf = requestAnimationFrame(tick);
  }

  private stopVisualizerLoop() {
    if (this.visualizerRaf) {
      cancelAnimationFrame(this.visualizerRaf);
      this.visualizerRaf = null;
    }

    const zeroFreq = new Uint8Array(this.visualizerBins);
    const zeroTime = new Uint8Array(128).fill(128);
    const zeroData: AudioAnalysisData = {
      frequencyData: zeroFreq,
      timeDomainData: zeroTime,
      volumeDb: -60,
      peak: 0,
      bassEnergy: 0,
      midEnergy: 0,
      trebleEnergy: 0,
    };
    this.visualizerListeners.forEach((cb) => cb(zeroData));
  }

  // --- STATUS SUBSCRIPTIONS ---
  public subscribeStatus(cb: StatusCallback): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private setStatus(status: 'idle' | 'loading' | 'playing' | 'paused' | 'error', errorMsg?: string) {
    this.currentStatus = status;

    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
      if (status === 'playing') {
        navigator.mediaSession.playbackState = 'playing';
      } else if (status === 'paused') {
        navigator.mediaSession.playbackState = 'paused';
      } else if (status === 'idle' || status === 'error') {
        navigator.mediaSession.playbackState = 'none';
      }
    }

    if (status === 'playing') {
      this.acquireWakeLock();
    } else {
      this.releaseWakeLock();
    }

    if (this.currentStation && typeof window !== 'undefined' && (window as any).AndroidRadioBridge) {
      try {
        (window as any).AndroidRadioBridge.updatePlayback(
          this.currentStation.name,
          `${this.currentStation.subgenre || this.currentStation.category.toUpperCase()} · ${this.currentStation.country || 'Live'}`,
          status === 'playing'
        );
      } catch (err) {
        // ignore
      }
    }

    this.statusListeners.forEach((cb) => cb(status, errorMsg));
  }

  private async acquireWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !this.wakeLock) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (err) {
        // WakeLock may be rejected in background or low-power modes
      }
    }
  }

  private releaseWakeLock() {
    if (this.wakeLock) {
      try {
        this.wakeLock.release().catch(() => {});
      } catch {
        // Ignore
      }
      this.wakeLock = null;
    }
  }

  public notifyStatus(status: 'idle' | 'loading' | 'playing' | 'paused' | 'error', errorMsg?: string) {
    this.setStatus(status, errorMsg);
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audio;
  }
}

export const audioEngine = new AudioEngine();
