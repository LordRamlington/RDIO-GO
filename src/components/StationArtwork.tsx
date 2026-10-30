import React from 'react';
import { RadioStation, StationCategory } from '../types/radio';
import {
  Coffee,
  Music,
  Zap,
  Newspaper,
  Flame,
  Globe,
  Radio,
  Sparkles,
  Headphones,
  Skull,
  Mic2,
  Disc,
  Clapperboard,
  Sun,
  Guitar,
  Film,
  History,
} from 'lucide-react';

interface StationArtworkProps {
  station: Pick<RadioStation, 'category' | 'name' | 'accentColor'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isPlaying?: boolean;
}

export const StationArtwork: React.FC<StationArtworkProps> = ({
  station,
  size = 'md',
  isPlaying = false,
}) => {
  const getCategoryTheme = (category: StationCategory) => {
    switch (category) {
      case 'chill':
        return {
          gradient: 'from-emerald-950 via-teal-900 to-slate-900',
          iconColor: 'text-emerald-400',
          borderColor: 'border-emerald-500/30',
          Icon: Coffee,
        };
      case 'jazz':
        return {
          gradient: 'from-amber-950 via-yellow-900/60 to-slate-900',
          iconColor: 'text-amber-400',
          borderColor: 'border-amber-500/30',
          Icon: Music,
        };
      case 'electronic':
        return {
          gradient: 'from-cyan-950 via-blue-900/70 to-slate-900',
          iconColor: 'text-cyan-400',
          borderColor: 'border-cyan-500/30',
          Icon: Zap,
        };
      case 'news':
        return {
          gradient: 'from-rose-950 via-red-900/60 to-slate-900',
          iconColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          Icon: Newspaper,
        };
      case 'classical':
        return {
          gradient: 'from-yellow-950 via-amber-900/50 to-slate-900',
          iconColor: 'text-yellow-400',
          borderColor: 'border-yellow-500/30',
          Icon: Music,
        };
      case 'rock':
        return {
          gradient: 'from-orange-950 via-red-950 to-slate-900',
          iconColor: 'text-orange-400',
          borderColor: 'border-orange-500/30',
          Icon: Flame,
        };
      case 'metal':
        return {
          gradient: 'from-red-950 via-zinc-900 to-slate-950',
          iconColor: 'text-red-500',
          borderColor: 'border-red-600/40',
          Icon: Skull,
        };
      case 'hiphop':
        return {
          gradient: 'from-amber-950 via-orange-900/60 to-slate-900',
          iconColor: 'text-amber-300',
          borderColor: 'border-amber-500/30',
          Icon: Mic2,
        };
      case 'reggae':
        return {
          gradient: 'from-emerald-950 via-lime-900/50 to-slate-900',
          iconColor: 'text-lime-400',
          borderColor: 'border-lime-500/30',
          Icon: Sun,
        };
      case 'country':
        return {
          gradient: 'from-amber-950 via-stone-900 to-slate-900',
          iconColor: 'text-amber-500',
          borderColor: 'border-amber-700/40',
          Icon: Guitar,
        };
      case 'latin':
        return {
          gradient: 'from-rose-950 via-pink-900/60 to-slate-900',
          iconColor: 'text-rose-400',
          borderColor: 'border-rose-500/30',
          Icon: Flame,
        };
      case 'blues':
        return {
          gradient: 'from-blue-950 via-indigo-900/60 to-slate-900',
          iconColor: 'text-blue-400',
          borderColor: 'border-blue-500/30',
          Icon: Music,
        };
      case 'retro':
        return {
          gradient: 'from-purple-950 via-indigo-900/60 to-slate-900',
          iconColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          Icon: History,
        };
      case 'soundtrack':
        return {
          gradient: 'from-teal-950 via-slate-900 to-slate-950',
          iconColor: 'text-teal-400',
          borderColor: 'border-teal-500/30',
          Icon: Clapperboard,
        };
      case 'world':
        return {
          gradient: 'from-purple-950 via-violet-900/60 to-slate-900',
          iconColor: 'text-purple-400',
          borderColor: 'border-purple-500/30',
          Icon: Globe,
        };
      case 'pop':
        return {
          gradient: 'from-pink-950 via-rose-900/60 to-slate-900',
          iconColor: 'text-pink-400',
          borderColor: 'border-pink-500/30',
          Icon: Sparkles,
        };
      default:
        return {
          gradient: 'from-indigo-950 via-slate-900 to-slate-950',
          iconColor: 'text-indigo-400',
          borderColor: 'border-indigo-500/30',
          Icon: Headphones,
        };
    }
  };

  const theme = getCategoryTheme(station.category);
  const Icon = theme.Icon;

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg text-xs',
    md: 'w-14 h-14 rounded-xl text-sm',
    lg: 'w-24 h-24 rounded-2xl text-base',
    xl: 'w-48 h-48 sm:w-56 sm:h-56 rounded-3xl text-xl shadow-2xl',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-20 h-20',
  }[size];

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-br ${theme.gradient} border ${theme.borderColor} ${sizeClasses} select-none transition-all duration-300`}
      style={{
        boxShadow: isPlaying ? `0 0 24px -4px ${station.accentColor}33` : undefined,
      }}
    >
      {/* Decorative vinyl/antenna background rings */}
      <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
        <div className="w-[140%] h-[140%] rounded-full border border-white/20" />
        <div className="w-[90%] h-[90%] rounded-full border border-white/20 absolute" />
        <div className="w-[50%] h-[50%] rounded-full border border-white/20 absolute" />
      </div>

      {/* Main Genre Icon */}
      <div className={`relative z-10 ${theme.iconColor} transition-transform ${isPlaying ? 'scale-105' : ''}`}>
        <Icon className={iconSizes} strokeWidth={1.75} />
      </div>

      {/* Active Equalizer animation badge */}
      {isPlaying && (
        <div className="absolute bottom-1.5 right-1.5 z-20 flex items-end gap-0.5 bg-black/60 backdrop-blur-xs px-1.5 py-1 rounded-sm border border-white/10">
          <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-3" />
          <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite] h-4" />
          <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.9s_ease-in-out_0.4s_infinite] h-2" />
        </div>
      )}
    </div>
  );
};
