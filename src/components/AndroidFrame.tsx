import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  isPhoneFrame,
  onToggleFrame,
}) => {
  return (
    <div className="h-full h-[100dvh] w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center relative selection:bg-emerald-500 selection:text-slate-950 font-sans overflow-hidden">
      {/* Top Desktop bar with Device Frame Switcher */}
      <div className="w-full max-w-5xl px-4 py-2 hidden lg:flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 bg-slate-950/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            RDIO-GO
          </span>
          <span className="text-slate-600">/</span>
          <span>Android Live Radio & Offline Recording Studio</span>
        </div>

        <button
          onClick={onToggleFrame}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
          title="Toggle between Android phone frame and wide layout"
        >
          {isPhoneFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-400" />
              <span>Expand to Full Width</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`w-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
          isPhoneFrame ? 'p-0 sm:py-4 sm:px-4' : 'p-0'
        }`}
      >
        {isPhoneFrame ? (
          /* Android Chassis Wrapper */
          <div className="relative w-full max-w-[440px] h-full sm:h-[860px] sm:max-h-[96vh] bg-slate-950 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 shadow-2xl flex flex-col overflow-hidden">
            {/* Front Camera Punch-hole (Android Camera) */}
            <div className="hidden sm:block absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full border border-slate-800 z-50 pointer-events-none" />

            {/* Inner Android App Container */}
            <div className="w-full h-full flex flex-col overflow-hidden relative bg-slate-950">
              {children}
            </div>
          </div>
        ) : (
          /* Full Wide Responsive Layout */
          <div className="w-full flex-1 min-h-0 h-full flex flex-col max-w-4xl bg-slate-950 border-x border-slate-900/60 relative overflow-hidden">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
