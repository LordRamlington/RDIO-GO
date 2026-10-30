import React from 'react';

export const AndroidGestureBar: React.FC = () => {
  return (
    <div className="h-4 w-full bg-slate-950 flex items-center justify-center select-none">
      {/* Android bottom navigation home indicator pill */}
      <div className="w-28 h-1 bg-slate-600/70 hover:bg-slate-400 rounded-full transition-colors" />
    </div>
  );
};
