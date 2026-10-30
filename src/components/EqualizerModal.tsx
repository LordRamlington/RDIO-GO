import React from 'react';
import { Sliders, Timer, Sparkles, X, Volume2, RotateCcw } from 'lucide-react';
import { EqualizerSettings } from '../types/radio';

interface EqualizerModalProps {
  settings: EqualizerSettings;
  sleepTimerRemaining: number | null;
  onUpdateSettings: (settings: EqualizerSettings) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onOpenPrivacyPolicy?: () => void;
  onClose?: () => void;
  isSheet?: boolean;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  settings,
  sleepTimerRemaining,
  onUpdateSettings,
  onSetSleepTimer,
  onOpenPrivacyPolicy,
  onClose,
  isSheet = false,
}) => {
  const presets: { id: EqualizerSettings['preset']; label: string; bass: number; mid: number; treble: number }[] = [
    { id: 'flat', label: 'Flat', bass: 0, mid: 0, treble: 0 },
    { id: 'bass-boost', label: 'Bass Boost', bass: 7, mid: 0, treble: 2 },
    { id: 'vocal', label: 'Vocal Clarity', bass: -2, mid: 6, treble: 3 },
    { id: 'rock', label: 'Rock', bass: 5, mid: 1, treble: 5 },
    { id: 'electronic', label: 'Electronic', bass: 6, mid: 2, treble: 4 },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    onUpdateSettings({
      preset: preset.id,
      bass: preset.bass,
      mid: preset.mid,
      treble: preset.treble,
    });
  };

  const handleSliderChange = (band: 'bass' | 'mid' | 'treble', value: number) => {
    onUpdateSettings({
      ...settings,
      [band]: value,
      preset: 'flat', // custom
    });
  };

  const timerOptions = [15, 30, 45, 60];

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const content = (
    <div className="space-y-6">
      {/* Equalizer Section */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">3-Band Equalizer</h3>
          </div>
          <button
            onClick={() => handleApplyPreset(presets[0])}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            title="Reset to Flat"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Quick Presets (Functional segmented filter controls) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          {presets.map((p) => {
            const isSelected = settings.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap text-center ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Sliders: Bass, Mid, Treble */}
        <div className="space-y-4">
          {/* Bass */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Bass (150 Hz)</span>
              <span className="font-mono text-emerald-400 tabular-nums">
                {settings.bass > 0 ? `+${settings.bass}` : settings.bass} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={settings.bass}
              onChange={(e) => handleSliderChange('bass', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Mid */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Mid (1000 Hz)</span>
              <span className="font-mono text-emerald-400 tabular-nums">
                {settings.mid > 0 ? `+${settings.mid}` : settings.mid} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={settings.mid}
              onChange={(e) => handleSliderChange('mid', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Treble */}
          <div>
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-slate-300">Treble (4000 Hz)</span>
              <span className="font-mono text-emerald-400 tabular-nums">
                {settings.treble > 0 ? `+${settings.treble}` : settings.treble} dB
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={settings.treble}
              onChange={(e) => handleSliderChange('treble', parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Sleep Timer Section */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Broadcast Sleep Timer</h3>
          </div>
          {sleepTimerRemaining && (
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full">
              Ends in {formatTimer(sleepTimerRemaining)}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Automatically fade out and pause radio playback after a set time.
        </p>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {timerOptions.map((min) => (
            <button
              key={min}
              onClick={() => onSetSleepTimer(min)}
              className="min-h-[44px] rounded-xl text-xs font-medium border border-slate-800 bg-slate-800/70 text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
            >
              {min} min
            </button>
          ))}
        </div>

        {sleepTimerRemaining && (
          <button
            onClick={() => onSetSleepTimer(null)}
            className="w-full py-2 rounded-xl text-xs font-medium bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 transition-colors"
          >
            Cancel Active Sleep Timer
          </button>
        )}
      </div>

      {onOpenPrivacyPolicy && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenPrivacyPolicy}
            className="text-[11px] text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            Privacy Policy & Google Play Disclosures
          </button>
        </div>
      )}
    </div>
  );

  if (isSheet) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />
        <div className="relative w-full max-h-[85vh] overflow-y-auto bg-slate-950 border-t border-slate-800 rounded-t-3xl p-6 z-10">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Audio Settings & FX</h2>
            {onClose && (
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Audio FX & Sleep Timer</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time Web Audio API equalization and broadcast timers.
          </p>
        </div>
        {content}
      </div>
    </div>
  );
};
