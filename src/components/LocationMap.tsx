'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import locationsData from '@/data/locations.json';
import jobsData from '@/data/jobs.json';
import { MapPin, Navigation, Coins, Check, ArrowRight, Briefcase } from 'lucide-react';
import type { LocationId } from '@/types/game';
import { motion } from 'framer-motion';

export const LocationMap: React.FC = () => {
  const { currentLocation, naira, travel } = useGameStore();
  const { playTravel } = useSoundFX();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8D0A8] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8D0A8]/60 pb-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-[#064E3B] flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#C2593F]" />
            <span>Jigawa State Transit & Commercial Map</span>
          </h3>
          <p className="text-xs text-[#1C1917]/70 mt-0.5">
            Board regional commercial transport along the state highway network. Travel consumes fare and advances time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locationsData.map((loc) => {
          const isHere = currentLocation === loc.id;
          const canAfford = naira >= loc.travelCost;
          const jobsCount = jobsData.filter((j) => j.locationId === loc.id).length;

          return (
            <motion.div
              key={loc.id}
              whileHover={{ y: -2 }}
              className={`rounded-2xl p-5 border transition flex flex-col justify-between ${
                isHere
                  ? 'bg-[#064E3B]/5 border-[#064E3B] shadow-sm ring-1 ring-[#064E3B]/20'
                  : 'bg-[#FAF7F2] border-[#E8D0A8] hover:border-[#064E3B]/60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C2593F] tracking-wider block">
                      {loc.zone}
                    </span>
                    <h4 className="text-sm font-bold text-[#064E3B]">{loc.name}</h4>
                  </div>
                  {isHere ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#064E3B] text-white px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                      <span>Here</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-[#1C1917]/80 bg-white border border-[#E8D0A8] px-2 py-0.5 rounded-lg">
                      ₦{loc.travelCost.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#1C1917]/70 leading-relaxed mb-4">
                  {loc.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#1C1917]/60 bg-white rounded-xl p-2 border border-[#E8D0A8]/60 mb-4">
                  <Briefcase className="w-3.5 h-3.5 text-[#064E3B]" />
                  <span>{jobsCount} active occupations available</span>
                </div>
              </div>

              {isHere ? (
                <div className="w-full py-2.5 px-3 bg-[#064E3B]/10 text-[#064E3B] text-xs font-bold rounded-xl text-center border border-[#064E3B]/20">
                  Currently Stationed Here
                </div>
              ) : (
                <button
                  onClick={() => {
                    playTravel();
                    travel(loc.id as LocationId);
                  }}
                  disabled={!canAfford}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 ${
                    canAfford
                      ? 'bg-[#064E3B] hover:bg-[#047857] text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{canAfford ? `Travel to ${loc.name}` : `Cannot Afford Fare (₦${loc.travelCost.toLocaleString()})`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
