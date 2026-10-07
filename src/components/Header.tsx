'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { Sun, CloudFog, CloudRain, Clock, MapPin, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import locationsData from '@/data/locations.json';

export const Header: React.FC = () => {
  const { day, hour, season, currentLocation, resetGame } = useGameStore();
  const { playClick, playWarning } = useSoundFX();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentLoc = locationsData.find((l) => l.id === currentLocation);

  // Format in-game clock: e.g. "14:00"
  const formattedTime = `${hour.toString().padStart(2, '0')}:00`;

  const getSeasonIcon = () => {
    switch (season) {
      case 'Harmattan':
        return <CloudFog className="w-4 h-4 text-[#C2593F]" />;
      case 'Rainy':
        return <CloudRain className="w-4 h-4 text-[#10B981]" />;
      case 'Dry':
      default:
        return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <header className="w-full bg-[#064E3B] text-[#F5E6CA] border-b border-[#065F46] shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & State Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#F5E6CA] text-[#064E3B] flex items-center justify-center font-black text-lg shadow-inner">
            JL
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Jigawa Lifestyle
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#047857] text-[#F5E6CA] px-2 py-0.5 rounded-full border border-[#10B981]/30">
                Simulation
              </span>
            </h1>
            <p className="text-xs text-[#F5E6CA]/80 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C2593F]" />
              <span className="font-medium text-white">{currentLoc?.name || 'Jigawa'}</span>
              <span className="text-[#F5E6CA]/50">·</span>
              <span className="text-[11px] text-[#F5E6CA]/70">{currentLoc?.zone}</span>
            </p>
          </div>
        </div>

        {/* In-Game Calendar & Clock Tracker */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#063F30] px-3.5 py-1.5 rounded-xl border border-[#065F46]">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white">
            <span className="text-[#C2593F]">Day {day}</span>
            <span className="text-[#F5E6CA]/40">·</span>
            <span className="flex items-center gap-1">
              {getSeasonIcon()}
              <span className="text-xs text-[#F5E6CA]/90">{season}</span>
            </span>
          </div>

          <div className="h-4 w-px bg-[#065F46]" />

          <div className="flex items-center gap-1 text-xs sm:text-sm font-mono font-bold text-[#F5E6CA]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Right actions: Audio Toggle & Reset Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!soundEnabled) playClick();
              setSoundEnabled(!soundEnabled);
            }}
            className="p-1.5 rounded-lg text-[#F5E6CA]/80 hover:text-white hover:bg-[#065F46]/50 transition"
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>

          <button
            onClick={() => {
              playWarning();
              if (confirm('Restart game from beginning? All current progress will reset.')) {
                resetGame();
              }
            }}
            className="text-xs flex items-center gap-1 text-[#F5E6CA]/70 hover:text-white px-2.5 py-1 rounded-lg hover:bg-[#065F46]/50 transition"
            title="Restart Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
