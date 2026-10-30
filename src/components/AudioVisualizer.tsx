import React, { useEffect, useRef, useState } from 'react';
import { audioEngine, AudioAnalysisData } from '../services/audioEngine';
import { Activity, BarChart3, Disc, Waves, Sparkles } from 'lucide-react';

export type VisualizerMode = 'bars' | 'wave' | 'mirror' | 'radial';

interface AudioVisualizerProps {
  isPlaying: boolean;
  accentColor?: string;
  height?: number;
  showControls?: boolean;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  accentColor = '#10b981',
  height = 96,
  showControls = true,
}) => {
  const [mode, setMode] = useState<VisualizerMode>('bars');
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [metrics, setMetrics] = useState({
    db: -60,
    peak: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Peak hold array for falling dots
  const peakHoldRef = useRef<{ val: number; age: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateCanvasSize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.floor(rect.width) || 320;
      canvas.width = w * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize peak hold
    if (peakHoldRef.current.length === 0) {
      peakHoldRef.current = Array.from({ length: 48 }, () => ({ val: 0, age: 0 }));
    }

    let frameCount = 0;

    const unsubscribe = audioEngine.subscribeVisualizer((data: AudioAnalysisData) => {
      frameCount++;
      // Update react metrics state at throttled rate (every 3 frames) to keep UI lightweight
      if (frameCount % 3 === 0) {
        setMetrics({
          db: isPlaying ? data.volumeDb : -60,
          peak: isPlaying ? data.peak : 0,
          bass: isPlaying ? data.bassEnergy : 0,
          mid: isPlaying ? data.midEnergy : 0,
          treble: isPlaying ? data.trebleEnergy : 0,
        });
      }

      if (!canvas) return;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.clearRect(0, 0, w, h);

      const freqData = data.frequencyData;
      const timeData = data.timeDomainData;

      if (mode === 'bars') {
        renderBars(ctx, freqData, w, h, accentColor, sensitivity, isPlaying);
      } else if (mode === 'wave') {
        renderWaveform(ctx, timeData, w, h, accentColor, sensitivity, isPlaying);
      } else if (mode === 'mirror') {
        renderMirror(ctx, freqData, w, h, accentColor, sensitivity, isPlaying);
      } else if (mode === 'radial') {
        renderRadial(ctx, freqData, w, h, accentColor, sensitivity, isPlaying);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [mode, sensitivity, accentColor, height, isPlaying]);

  // --- RENDERER 1: BARS WITH PEAK DROPS ---
  const renderBars = (
    ctx: CanvasRenderingContext2D,
    freq: Uint8Array,
    width: number,
    height: number,
    color: string,
    mult: number,
    playing: boolean
  ) => {
    const barsCount = 36;
    const gap = 3;
    const barWidth = Math.max(3, (width - (barsCount - 1) * gap) / barsCount);

    if (peakHoldRef.current.length !== barsCount) {
      peakHoldRef.current = Array.from({ length: barsCount }, () => ({ val: 0, age: 0 }));
    }

    for (let i = 0; i < barsCount; i++) {
      const freqIdx = Math.min(freq.length - 1, Math.floor((i / barsCount) * freq.length));
      const raw = playing ? freq[freqIdx] : 4;
      const normalized = Math.min(1, (raw / 255) * mult);
      const barHeight = Math.max(3, normalized * (height - 8));

      const x = i * (barWidth + gap);
      const y = height - barHeight;

      // Update Peak Hold
      const peak = peakHoldRef.current[i];
      if (barHeight >= peak.val) {
        peak.val = barHeight;
        peak.age = 0;
      } else {
        peak.age++;
        if (peak.age > 4) {
          peak.val = Math.max(3, peak.val - 1.2); // gravity drop
        }
      }

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, height);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, `${color}bb`);
      grad.addColorStop(1, `${color}22`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
      ctx.fill();

      // Peak Cap
      if (playing && peak.val > 4) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const peakY = Math.max(2, height - peak.val - 2);
        ctx.roundRect(x, peakY, barWidth, 2, [1, 1, 1, 1]);
        ctx.fill();
      }
    }
  };

  // --- RENDERER 2: SMOOTH WAVEFORM OSCILLOSCOPE ---
  const renderWaveform = (
    ctx: CanvasRenderingContext2D,
    time: Uint8Array,
    width: number,
    height: number,
    color: string,
    mult: number,
    playing: boolean
  ) => {
    const midY = height / 2;

    // Draw baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.shadowBlur = playing ? 8 : 0;
    ctx.shadowColor = color;

    ctx.beginPath();
    const sliceWidth = width / (time.length - 1);
    let x = 0;

    for (let i = 0; i < time.length; i++) {
      const v = (time[i] - 128) / 128; // -1 to +1
      const amp = playing ? v * (height * 0.45) * mult : 0;
      const y = midY + amp;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  };

  // --- RENDERER 3: BILATERAL MIRROR ANALYZER ---
  const renderMirror = (
    ctx: CanvasRenderingContext2D,
    freq: Uint8Array,
    width: number,
    height: number,
    color: string,
    mult: number,
    playing: boolean
  ) => {
    const halfBars = 20;
    const midX = width / 2;
    const gap = 3;
    const barWidth = Math.max(2, (midX - halfBars * gap) / halfBars);

    for (let i = 0; i < halfBars; i++) {
      const freqIdx = Math.min(freq.length - 1, Math.floor((i / halfBars) * freq.length));
      const raw = playing ? freq[freqIdx] : 4;
      const normalized = Math.min(1, (raw / 255) * mult);
      const barHeight = Math.max(3, normalized * (height * 0.9));

      const y = (height - barHeight) / 2;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, '#ffffff');
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;

      // Right bar
      const rightX = midX + i * (barWidth + gap);
      ctx.beginPath();
      ctx.roundRect(rightX, y, barWidth, barHeight, [2, 2, 2, 2]);
      ctx.fill();

      // Left bar
      const leftX = midX - (i + 1) * (barWidth + gap);
      ctx.beginPath();
      ctx.roundRect(leftX, y, barWidth, barHeight, [2, 2, 2, 2]);
      ctx.fill();
    }
  };

  // --- RENDERER 4: RADIAL SOUND RADAR ---
  const renderRadial = (
    ctx: CanvasRenderingContext2D,
    freq: Uint8Array,
    width: number,
    height: number,
    color: string,
    mult: number,
    playing: boolean
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(centerX, centerY) * 0.35;
    const rays = 32;

    // Center pulsating ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < rays; i++) {
      const angle = (i / rays) * Math.PI * 2;
      const freqIdx = Math.min(freq.length - 1, Math.floor((i / rays) * freq.length));
      const raw = playing ? freq[freqIdx] : 4;
      const normalized = Math.min(1, (raw / 255) * mult);
      const rayLen = Math.max(3, normalized * (Math.min(centerX, centerY) * 0.6));

      const x1 = centerX + Math.cos(angle) * (baseRadius + 2);
      const y1 = centerY + Math.sin(angle) * (baseRadius + 2);
      const x2 = centerX + Math.cos(angle) * (baseRadius + 2 + rayLen);
      const y2 = centerY + Math.sin(angle) * (baseRadius + 2 + rayLen);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  const modes: { id: VisualizerMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'bars', label: 'Bars', icon: BarChart3 },
    { id: 'wave', label: 'Wave', icon: Waves },
    { id: 'mirror', label: 'Mirror', icon: Activity },
    { id: 'radial', label: 'Radial', icon: Disc },
  ];

  return (
    <div className="w-full flex flex-col p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner">
      {/* Visualizer Canvas Container */}
      <div ref={containerRef} className="w-full relative flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ height: `${height}px` }}
          className="w-full rounded-xl transition-all"
        />

        {/* Live Audio Inactive notice if not playing */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs rounded-xl">
            <span className="text-[11px] font-mono text-slate-400">TUNE INTO STREAM FOR LIVE SPECTRUM</span>
          </div>
        )}
      </div>

      {/* Live Audio Frequency Meter & Energy Bands HUD */}
      {showControls && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/70 space-y-2">
          {/* Energy Bands (Low/Mid/High) + dB Meter */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {/* Bass Band */}
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>BASS</span>
                <span className="text-emerald-400 font-semibold">{Math.round(metrics.bass * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ width: `${Math.round(metrics.bass * 100)}%` }}
                />
              </div>
            </div>

            {/* Mid Band */}
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>MID</span>
                <span className="text-cyan-400 font-semibold">{Math.round(metrics.mid * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-75"
                  style={{ width: `${Math.round(metrics.mid * 100)}%` }}
                />
              </div>
            </div>

            {/* Treble Band */}
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>HIGH</span>
                <span className="text-purple-400 font-semibold">{Math.round(metrics.treble * 100)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all duration-75"
                  style={{ width: `${Math.round(metrics.treble * 100)}%` }}
                />
              </div>
            </div>

            {/* Real-time Decibel & Peak */}
            <div className="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1">
                <span>LEVEL</span>
                <span className={`font-semibold tabular-nums ${metrics.db > -6 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {metrics.db > -60 ? `${metrics.db} dB` : '-inf'}
                </span>
              </div>
              <div className="flex items-center gap-0.5 h-1">
                <span className={`flex-1 h-full rounded-xs ${metrics.db > -30 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
                <span className={`flex-1 h-full rounded-xs ${metrics.db > -18 ? 'bg-emerald-400' : 'bg-slate-800'}`} />
                <span className={`flex-1 h-full rounded-xs ${metrics.db > -10 ? 'bg-amber-400' : 'bg-slate-800'}`} />
                <span className={`flex-1 h-full rounded-xs ${metrics.db > -4 ? 'bg-rose-500' : 'bg-slate-800'}`} />
              </div>
            </div>
          </div>

          {/* Interactive Mode Selectors */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800/80">
              {modes.map((m) => {
                const Icon = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-slate-800 text-emerald-400 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sensitivity button */}
            <button
              onClick={() => {
                const levels = [0.8, 1.2, 1.8];
                const nextIdx = (levels.indexOf(sensitivity) + 1) % levels.length;
                setSensitivity(levels[nextIdx]);
              }}
              className="text-[10px] font-mono text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 transition-colors"
              title="Adjust Visualizer Gain"
            >
              GAIN: {sensitivity}x
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
