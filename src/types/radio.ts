export type StationCategory =
  | 'all'
  | 'chill'
  | 'jazz'
  | 'electronic'
  | 'classical'
  | 'news'
  | 'rock'
  | 'metal'
  | 'hiphop'
  | 'reggae'
  | 'country'
  | 'latin'
  | 'blues'
  | 'retro'
  | 'soundtrack'
  | 'world'
  | 'pop';

export interface RadioStation {
  id: string;
  name: string;
  category: StationCategory;
  subgenre: string;
  streamUrl: string;
  backupStreamUrls?: string[];
  bitrate: number;
  codec: string;
  country: string;
  countryCode: string;
  description: string;
  accentColor: string;
  tags: string[];
  homepage?: string;
  favicon?: string;
  isCustom?: boolean;
}

export interface OfflineRecording {
  id: string;
  stationId: string;
  stationName: string;
  category: StationCategory;
  accentColor: string;
  title: string;
  notes?: string;
  timestamp: number; // Date.now()
  durationSec: number;
  fileSizeBytes: number;
  audioMimeType: string;
  blob: Blob;
  blobUrl?: string; // transient ObjectURL
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface EqualizerSettings {
  bass: number; // -12dB to +12dB
  mid: number;  // -12dB to +12dB
  treble: number; // -12dB to +12dB
  preset: 'flat' | 'bass-boost' | 'vocal' | 'rock' | 'electronic';
}

export interface SleepTimerState {
  isActive: boolean;
  endsAt: number | null; // timestamp
  remainingSeconds: number;
}
