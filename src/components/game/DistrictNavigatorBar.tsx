'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Landmark,
  GraduationCap,
  ShoppingBag,
  Crown,
  Mountain,
  HeartPulse,
  BookOpen,
  Briefcase,
  Building2,
  Moon,
  Plane,
  Flag,
  Trophy,
  Home,
  Compass,
} from 'lucide-react';
import locationsData from '@/data/locations.json';
import { LocationId } from '@/types/game';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';

interface DistrictNavigatorBarProps {
  selectedPinId: string | null;
  onSelectLocation: (locId: LocationId) => void;
}

type DistrictCategory = 'all' | 'civic_royal' | 'commerce' | 'edu_health' | 'sports_spiritual';

const LOCATION_CATEGORIES: Record<string, DistrictCategory> = {
  dutse_secretariat: 'civic_royal',
  ringim_palace: 'civic_royal',
  aminu_kano_triangle: 'civic_royal',
  dutse_job_center: 'civic_royal',
  hadejia_market: 'commerce',
  takur_commercial: 'commerce',
  kazaure_agro_tech: 'commerce',
  fud_campus: 'edu_health',
  dutse_school: 'edu_health',
  dutse_hospital: 'edu_health',
  dutse_mosque: 'sports_spiritual',
  dutse_airport: 'sports_spiritual',
  dutse_stadium: 'sports_spiritual',
  takur_estate: 'sports_spiritual',
};

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  dutse_secretariat: <Landmark className="w-4 h-4 text-emerald-400" />,
  fud_campus: <GraduationCap className="w-4 h-4 text-sky-400" />,
  hadejia_market: <ShoppingBag className="w-4 h-4 text-amber-400" />,
  ringim_palace: <Crown className="w-4 h-4 text-yellow-400" />,
  kazaure_agro_tech: <Mountain className="w-4 h-4 text-orange-400" />,
  dutse_hospital: <HeartPulse className="w-4 h-4 text-rose-400" />,
  dutse_school: <BookOpen className="w-4 h-4 text-teal-400" />,
  dutse_job_center: <Briefcase className="w-4 h-4 text-blue-400" />,
  takur_commercial: <Building2 className="w-4 h-4 text-purple-400" />,
  dutse_mosque: <Moon className="w-4 h-4 text-emerald-300" />,
  dutse_airport: <Plane className="w-4 h-4 text-cyan-400" />,
  aminu_kano_triangle: <Flag className="w-4 h-4 text-amber-300" />,
  dutse_stadium: <Trophy className="w-4 h-4 text-yellow-300" />,
  takur_estate: <Home className="w-4 h-4 text-green-400" />,
};

export const DistrictNavigatorBar: React.FC<DistrictNavigatorBarProps> = ({
  selectedPinId,
  onSelectLocation,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DistrictCategory>('all');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { currentLocation } = useGameStore();
  const { playClick } = useSoundFX();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredLocations = locationsData.filter((loc) => {
    if (activeCategory === 'all') return true;
    return LOCATION_CATEGORIES[loc.id] === activeCategory;
  });

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 w-[96vw] max-w-5xl pointer-events-auto">
      <div className="bg-gray-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2.5 transition-all duration-300 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 px-2 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                Dutse Capital Navigator
              </span>
              <span className="text-[10px] font-semibold text-white/50 bg-white/5 px-2 py-0.5 rounded-full">
                14 / 14 Landmarks
              </span>
            </div>
          </div>

          {/* Filter Categories */}
          {!isCollapsed && (
            <div className="hidden md:flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/5 text-[10px]">
              <button
                onClick={() => {
                  playClick();
                  setActiveCategory('all');
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                All (14)
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveCategory('civic_royal');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'civic_royal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Civic & Royal
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveCategory('commerce');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'commerce'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Commerce
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveCategory('edu_health');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'edu_health'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Campus & Health
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActiveCategory('sports_spiritual');
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  activeCategory === 'sports_spiritual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Spiritual & Aero
              </button>
            </div>
          )}

          {/* Controls: Scroll & Collapse */}
          <div className="flex items-center gap-1">
            {!isCollapsed && (
              <>
                <button
                  onClick={() => handleScroll('left')}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                  title="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                  title="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              onClick={() => {
                playClick();
                setIsCollapsed(!isCollapsed);
              }}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition flex items-center gap-1 text-[10px] font-bold px-2"
              title={isCollapsed ? 'Expand districts' : 'Minimize districts'}
            >
              <span>{isCollapsed ? 'View Landmarks' : 'Hide'}</span>
              {isCollapsed ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Landmark Carousel */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-2"
            >
              <div
                ref={scrollContainerRef}
                className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredLocations.map((loc) => {
                  const isCurrent = currentLocation === loc.id;
                  const isSelected = selectedPinId === loc.id;

                  return (
                    <motion.button
                      key={loc.id}
                      onClick={() => {
                        playClick();
                        onSelectLocation(loc.id as LocationId);
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex-shrink-0 relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-emerald-950/90 border-emerald-400 shadow-lg shadow-emerald-900/40'
                          : isCurrent
                          ? 'bg-gray-900/90 border-emerald-500/50 hover:border-emerald-400'
                          : 'bg-black/40 border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                    >
                      {/* Icon Circle */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-emerald-800/60 border-emerald-400'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        {LOCATION_ICONS[loc.id] || (
                          <MapPin className="w-4 h-4 text-emerald-400" />
                        )}
                      </div>

                      {/* Labels */}
                      <div className="flex flex-col min-w-[130px] max-w-[175px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate leading-tight">
                            {loc.name.split('(')[0].trim()}
                          </span>
                        </div>
                        <span className="text-[9px] font-medium text-emerald-400/90 truncate leading-tight mt-0.5">
                          {loc.hausaName}
                        </span>
                        <span className="text-[8px] text-white/40 truncate leading-tight">
                          {loc.zone}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isCurrent && (
                        <div className="flex flex-col items-end shrink-0 pl-1">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            Here
                          </span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
