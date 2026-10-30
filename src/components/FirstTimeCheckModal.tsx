import React, { useEffect, useState } from 'react';
import { Radio, ShieldCheck, CheckCircle2, AlertTriangle, Activity, Wifi } from 'lucide-react';
import { RadioStation } from '../types/radio';
import {
  verifyStationBatch,
  markFirstTimeScanComplete,
  VerificationProgress,
} from '../services/stationVerifier';

interface FirstTimeCheckModalProps {
  isOpen: boolean;
  stationsToCheck: RadioStation[];
  onComplete: (activeStations: RadioStation[], offlineIds: Set<string>) => void;
  onClose: () => void;
}

export const FirstTimeCheckModal: React.FC<FirstTimeCheckModalProps> = ({
  isOpen,
  stationsToCheck,
  onComplete,
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState<VerificationProgress>({
    scanned: 0,
    total: stationsToCheck.length,
    onlineCount: 0,
    offlineCount: 0,
    currentStationName: 'Preparing broadcast stream diagnostics...',
  });

  const [activeResults, setActiveResults] = useState<RadioStation[]>([]);
  const [offlineResults, setOfflineResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || isScanning || isDone) return;

    let isMounted = true;
    setIsScanning(true);

    verifyStationBatch(stationsToCheck, 6, (p) => {
      if (isMounted) {
        setProgress(p);
      }
    }).then(({ activeStations, offlineStationIds }) => {
      if (!isMounted) return;
      setActiveResults(activeStations);
      setOfflineResults(offlineStationIds);
      setIsScanning(false);
      setIsDone(true);
      markFirstTimeScanComplete();
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, stationsToCheck]);

  if (!isOpen) return null;

  const percent = progress.total > 0 ? Math.round((progress.scanned / progress.total) * 100) : 0;

  const handleFinish = () => {
    markFirstTimeScanComplete();
    onComplete(activeResults, offlineResults);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Subtle accent glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 shrink-0">
            {isDone ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300 uppercase tracking-wider mb-1">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>Initial Setup Verification</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isDone ? 'Broadcast Signal Check Complete' : 'First-Time Station Signal Check'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {isDone
                ? 'All broadcast feeds have been verified. Any unavailable or dead stations have been automatically filtered out.'
                : 'Probing live audio streams to filter out non-broadcasting or unreachable stations before playback.'}
            </p>
          </div>
        </div>

        {/* Progress Bar & Details */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 truncate max-w-[220px]">
              {isDone ? 'Integrity scan verified' : progress.currentStationName}
            </span>
            <span className="text-emerald-400 font-bold shrink-0">{percent}%</span>
          </div>

          {/* Progress track */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Stat Badges */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-emerald-400 font-medium">Active & Online</div>
                <div className="text-sm font-bold text-slate-100">{progress.onlineCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Filtered Offline</div>
                <div className="text-sm font-bold text-slate-100">{progress.offlineCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="text-xs text-slate-400 mb-5 leading-normal flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            {isDone
              ? `${progress.onlineCount} broadcasting stations are ready with zero dead links.`
              : 'Testing stream reachability, HTTP headers, and audio frames...'}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2">
          {isScanning && (
            <button
              onClick={() => {
                markFirstTimeScanComplete();
                onClose();
              }}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Continue in background
            </button>
          )}

          <button
            onClick={handleFinish}
            disabled={isScanning}
            className={`w-full py-2.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              isDone
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-400 cursor-wait'
            }`}
          >
            {isDone ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Listening ({progress.onlineCount} Verified)</span>
              </>
            ) : (
              <span>Scanning Broadcasts ({progress.scanned}/{progress.total})...</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
