'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import backgroundsData from '@/data/backgrounds.json';
import locationsData from '@/data/locations.json';
import { User, Sparkles, MapPin, ShieldCheck, Check } from 'lucide-react';
import type { BackgroundId } from '@/types/game';

export const CharacterCard: React.FC = () => {
  const { selectedBackground, chooseBackground, currentLocation } = useGameStore();

  const currentBg = backgroundsData.find((b) => b.id === selectedBackground);
  const currentLoc = locationsData.find((l) => l.id === currentLocation);

  if (!selectedBackground) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8D0A8] shadow-md">
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-[#064E3B]/10 text-[#064E3B] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Start Your Jigawa Journey
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#064E3B] tracking-tight">
            Choose Your Origin Path
          </h2>
          <p className="text-sm text-[#1C1917]/70 mt-1.5">
            Your background shapes your starting capital, social standing (Mutunci), and unique trade advantages across the state.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {backgroundsData.map((bg) => {
            const home = locationsData.find((l) => l.id === bg.homeLocation);
            return (
              <div
                key={bg.id}
                className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#E8D0A8] hover:border-[#064E3B] transition-all hover:shadow-lg flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-[#064E3B] group-hover:text-[#047857] transition">
                        {bg.title}
                      </h3>
                      <p className="text-xs text-[#C2593F] font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>Base: {home?.name}</span>
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#E8D0A8]/50 text-[#1C1917] px-2.5 py-1 rounded-lg">
                      ₦{bg.startingStats.naira.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-[#1C1917]/75 leading-relaxed mb-4">
                    {bg.description}
                  </p>

                  {/* Starting stats badge */}
                  <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-2.5 border border-[#E8D0A8]/60 text-center mb-3">
                    <div>
                      <span className="block text-[10px] uppercase text-[#1C1917]/50 font-semibold">Mutunci</span>
                      <span className="text-xs font-bold text-[#C2593F]">{bg.startingStats.mutunci}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#1C1917]/50 font-semibold">Energy</span>
                      <span className="text-xs font-bold text-amber-600">{bg.startingStats.energy}%</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#1C1917]/50 font-semibold">Health</span>
                      <span className="text-xs font-bold text-rose-600">{bg.startingStats.health}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] bg-[#064E3B]/5 border border-[#064E3B]/10 rounded-lg p-2 text-[#064E3B] font-medium flex items-start gap-1.5 mb-4">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#064E3B] shrink-0 mt-0.5" />
                    <span>{bg.perks}</span>
                  </div>
                </div>

                <button
                  onClick={() => chooseBackground(bg.id as BackgroundId)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#064E3B] hover:bg-[#047857] text-white shadow-sm transition flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                >
                  <span>Select {bg.title}</span>
                  <Check className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8D0A8] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8D0A8]/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-[#064E3B] text-[#F5E6CA] flex items-center justify-center text-xl font-black shadow-inner p-3">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-[#064E3B]">
                {currentBg?.title}
              </h2>
              <span className="text-[11px] font-bold bg-[#C2593F]/10 text-[#C2593F] px-2.5 py-0.5 rounded-full border border-[#C2593F]/20">
                Active Path
              </span>
            </div>
            <p className="text-xs text-[#1C1917]/70 mt-0.5 flex items-center gap-2">
              <span>Home: <strong>{locationsData.find((l) => l.id === currentBg?.homeLocation)?.name}</strong></span>
              <span>·</span>
              <span className="text-[#C2593F] font-medium">Current: {currentLoc?.name}</span>
            </p>
          </div>
        </div>

        <div className="bg-[#FAF7F2] px-3.5 py-2 rounded-xl border border-[#E8D0A8] text-right sm:text-right">
          <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 block">Origin Specialization</span>
          <span className="text-xs font-semibold text-[#064E3B]">{currentBg?.perks}</span>
        </div>
      </div>

      <div className="pt-4 text-xs text-[#1C1917]/80 leading-relaxed">
        {currentBg?.description}
      </div>
    </div>
  );
};
