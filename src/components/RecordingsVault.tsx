import React, { useState, useRef, useEffect } from 'react';
import {
  Disc,
  Play,
  Pause,
  Trash2,
  Download,
  Edit2,
  Check,
  X,
  Clock,
  HardDrive,
  RotateCcw,
  RotateCw,
  WifiOff,
  Radio,
  FileAudio,
} from 'lucide-react';
import { OfflineRecording } from '../types/radio';
import {
  deleteRecordingFromDb,
  updateRecordingTitleInDb,
  clearAllRecordingsFromDb,
} from '../services/recordingsDb';

interface RecordingsVaultProps {
  recordings: OfflineRecording[];
  onRefreshRecordings: () => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onGoToRadio: () => void;
}

export const RecordingsVault: React.FC<RecordingsVaultProps> = ({
  recordings,
  onRefreshRecordings,
  isOfflineMode,
  onToggleOfflineMode,
  onGoToRadio,
}) => {
  const [activeRecordingId, setActiveRecordingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const activeRecording = recordings.find((r) => r.id === activeRecordingId);

  const handlePlayRecording = (rec: OfflineRecording) => {
    if (activeRecordingId === rec.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(rec.blobUrl || URL.createObjectURL(rec.blob));
    audio.playbackRate = playbackSpeed;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((err) => {
      console.warn('Offline audio play error:', err);
    });

    audioRef.current = audio;
    setActiveRecordingId(rec.id);
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const target = Math.max(0, Math.min(audioRef.current.duration || 9999, audioRef.current.currentTime + seconds));
      audioRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleChangeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleDelete = async (id: string) => {
    if (activeRecordingId === id && audioRef.current) {
      audioRef.current.pause();
      setActiveRecordingId(null);
      setIsPlaying(false);
    }
    await deleteRecordingFromDb(id);
    onRefreshRecordings();
  };

  const handleStartRename = (rec: OfflineRecording) => {
    setEditingId(rec.id);
    setEditTitle(rec.title);
  };

  const handleSaveRename = async (id: string) => {
    if (editTitle.trim()) {
      await updateRecordingTitleInDb(id, editTitle.trim());
      onRefreshRecordings();
    }
    setEditingId(null);
  };

  const handleDownload = (rec: OfflineRecording) => {
    const url = rec.blobUrl || URL.createObjectURL(rec.blob);
    const a = document.createElement('a');
    a.href = url;
    const ext = rec.audioMimeType.includes('ogg') ? 'ogg' : 'webm';
    a.download = `${rec.title.replace(/\s+/g, '_')}_${new Date(rec.timestamp).toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all offline recordings from IndexedDB?')) {
      if (audioRef.current) {
        audioRef.current.pause();
        setActiveRecordingId(null);
        setIsPlaying(false);
      }
      await clearAllRecordingsFromDb();
      onRefreshRecordings();
    }
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalDuration = recordings.reduce((acc, r) => acc + r.durationSec, 0);
  const totalBytes = recordings.reduce((acc, r) => acc + r.fileSizeBytes, 0);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 pb-44 scroll-smooth">
      {/* Top Banner: Offline Mode Simulator & Status */}
      <div className="mb-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isOfflineMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-200">
              {isOfflineMode ? 'Simulating Offline Mode' : 'Online / Live Ready'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Recordings are saved to local IndexedDB and play 100% offline.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleOfflineMode}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
            isOfflineMode
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
        </button>
      </div>

      {/* Vault Statistics Strip */}
      {recordings.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Broadcasts</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">{recordings.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Playtime</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">{formatSec(totalDuration)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Storage</span>
            <span className="text-base font-bold text-slate-100 font-mono tabular-nums">{formatBytes(totalBytes)}</span>
          </div>
        </div>
      )}

      {/* Active Dedicated Offline Audio Player if a recording is selected */}
      {activeRecording && (
        <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <h4 className="text-sm font-semibold text-white truncate">{activeRecording.title}</h4>
            </div>
            <button
              onClick={handleChangeSpeed}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors"
            >
              {playbackSpeed}x
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Source: {activeRecording.stationName} · Recorded {new Date(activeRecording.timestamp).toLocaleDateString()}
          </p>

          {/* Scrubber slider */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3">
            <span className="tabular-nums min-w-[32px]">{formatSec(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={activeRecording.durationSec || (audioRef.current?.duration || 100)}
              step="0.5"
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="tabular-nums min-w-[32px] text-right">
              {formatSec(activeRecording.durationSec)}
            </span>
          </div>

          {/* Controls: Skip -10s, Play/Pause, Skip +10s */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleSkip(-10)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Skip back 10 seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handlePlayRecording(activeRecording)}
              className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center hover:bg-emerald-400 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkip(10)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
              title="Skip forward 10 seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-slate-200">
          Saved Broadcasts ({recordings.length})
        </h3>
        {recordings.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Empty State */}
      {recordings.length === 0 ? (
        <div className="py-16 text-center px-4 rounded-2xl bg-slate-900/30 border border-slate-800/60 my-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Disc className="w-7 h-7" />
          </div>
          <h4 className="text-base font-semibold text-slate-100">No Offline Recordings Yet</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-5">
            Capture any live stream by tapping the record button. Recordings are kept in your offline vault so you can listen anywhere without internet.
          </p>
          <button
            onClick={onGoToRadio}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-medium text-xs hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <Radio className="w-4 h-4" />
            <span>Tune Into Radio Stations</span>
          </button>
        </div>
      ) : (
        /* List of Saved Recordings */
        <div className="space-y-2.5">
          {recordings.map((rec) => {
            const isActive = activeRecordingId === rec.id;
            const isEditing = editingId === rec.id;

            return (
              <div
                key={rec.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-slate-900/90 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/40 hover:bg-slate-900/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Play Button Trigger */}
                  <button
                    onClick={() => handlePlayRecording(rec)}
                    className={`min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive && isPlaying
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <Pause className="w-4 h-4 fill-slate-950" />
                    ) : (
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    )}
                  </button>

                  {/* Title and details */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 my-0.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(rec.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-slate-100 truncate">
                          {rec.title}
                        </h4>
                        <button
                          onClick={() => handleStartRename(rec)}
                          className="text-slate-500 hover:text-slate-300 p-0.5 transition-colors"
                          title="Rename recording"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 truncate">
                      <span className="text-slate-300">{rec.stationName}</span>
                      <span className="opacity-40">·</span>
                      <span className="font-mono">{formatSec(rec.durationSec)}</span>
                      <span className="opacity-40">·</span>
                      <span className="font-mono">{formatBytes(rec.fileSizeBytes)}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 font-mono">
                      {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(rec.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Right Actions: Download & Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleDownload(rec)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      title="Download audio file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
