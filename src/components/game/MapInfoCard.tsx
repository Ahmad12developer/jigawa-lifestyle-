'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import locationsDataRaw from '@/data/locations.json';
import jobsDataRaw from '@/data/jobs.json';
import {
  MapPin,
  Compass,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Coins,
  Building2,
  GraduationCap,
  Wheat,
  Crown,
  Lightbulb,
} from 'lucide-react';
import type { GameLocation, Job } from '@/types/game';

interface MapInfoCardProps {
  selectedPinId: string | null;
  onClose: () => void;
  onOpenJobsForLocation: (locId: string) => void;
}

const LOCATION_ICONS: Record<string, React.ReactNode> = {
  dutse_secretariat: <Building2 className="w-5 h-5 text-emerald-400" />,
  fud_campus: <GraduationCap className="w-5 h-5 text-amber-400" />,
  hadejia_market: <Wheat className="w-5 h-5 text-sky-400" />,
  ringim_palace: <Crown className="w-5 h-5 text-rose-400" />,
  kazaure_agro_tech: <Lightbulb className="w-5 h-5 text-emerald-300" />,
};

export const MapInfoCard: React.FC<MapInfoCardProps> = ({
  selectedPinId,
  onClose,
  onOpenJobsForLocation,
}) => {
  const { currentLocation, travel, naira } = useGameStore();
  const { playCash, playWarning, playClick } = useSoundFX();

  const locations = locationsDataRaw as GameLocation[];
  const jobs = jobsDataRaw as Job[];

  if (!selectedPinId) return null;

  const loc = locations.find((l) => l.id === selectedPinId);
  if (!loc) return null;

  const isHere = currentLocation === loc.id;
  const canAfford = naira >= loc.travelCost;
  const locJobs = jobs.filter((j) => j.locationId === loc.id);

  return (
    <div className="absolute top-20 right-4 sm:right-6 z-30 max-w-sm w-full pointer-events-auto">
      <div className="bg-[#111827]/95 text-white backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              {LOCATION_ICONS[loc.id] || <MapPin className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{loc.name}</h3>
                {isHere && (
                  <span className="text-[10px] bg-emerald-500 text-black font-extrabold px-2 py-0.5 rounded-full">
                    Current Location
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                {loc.hausaName || loc.zone}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center text-xs transition"
          >
            ✕
          </button>
        </div>

        {/* Description & Economic Specialty */}
        <div className="space-y-2 text-xs">
          <p className="text-white/70 leading-relaxed">{loc.description}</p>
          {loc.economicSpecialty && (
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-emerald-200 text-[11px]">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Regional Hub Focus:</strong> {loc.economicSpecialty}
              </span>
            </div>
          )}
        </div>

        {/* Available Gigs Summary */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-white/80">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Local Hustles</span>
          </div>
          <span className="font-bold text-white">
            {locJobs.length} Gigs Available
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 pt-1">
          {isHere ? (
            <button
              onClick={() => onOpenJobsForLocation(loc.id)}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              <span>View Local Hustles in District</span>
            </button>
          ) : (
            <button
              disabled={!canAfford}
              onClick={() => {
                const res = travel(loc);
                if (res.success) {
                  playCash();
                } else {
                  playWarning();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                canAfford
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <span>Travel Here (Fare: ₦{loc.travelCost.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
