'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import locationsDataRaw from '@/data/locations.json';
import jobsDataRaw from '@/data/jobs.json';
import {
  X,
  Briefcase,
  Wallet,
  Navigation,
  Bed,
  Utensils,
  Sun,
  Battery,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameLocation, Job, LocationId } from '@/types/game';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMapLocation?: (locId: string) => void;
}

type PhoneApp = 'home' | 'jobs' | 'wallet' | 'travel' | 'lifestyle';

export const PhoneModal: React.FC<PhoneModalProps> = ({
  isOpen,
  onClose,
  onSelectMapLocation,
}) => {
  const [activeApp, setActiveApp] = useState<PhoneApp>('home');
  const {
    naira,
    mutunci,
    energy,
    health,
    day,
    hour,
    season,
    currentLocation,
    performJob,
    travel,
    rest,
    eatBukka,
    pray,
    logs,
  } = useGameStore();

  const { playClick, playCash, playRest, playWarning } = useSoundFX();

  const locations = locationsDataRaw as GameLocation[];
  const jobs = jobsDataRaw as Job[];
  const curLoc = locations.find((l) => l.id === currentLocation) || locations[0];

  // Jobs available in the current location
  const availableJobs = jobs.filter((j) => j.locationId === currentLocation);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-sm sm:max-w-md h-[680px] max-h-[92vh] bg-[#0c121e] rounded-[42px] border-[6px] border-[#222f3e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-white font-sans"
      >
        {/* Smartphone Speaker & Camera Notch */}
        <div className="relative pt-3 pb-2 px-6 flex items-center justify-between text-xs text-white/70 select-none border-b border-white/5">
          <span className="font-mono text-[11px] font-semibold">
            {hour.toString().padStart(2, '0')}:00
          </span>
          <div className="w-20 h-4 bg-black/80 rounded-full flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
            <div className="w-2.5 h-1 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>5G</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* Header / App Bar */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            {activeApp !== 'home' ? (
              <button
                onClick={() => {
                  playClick();
                  setActiveApp('home');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                ← Back
              </button>
            ) : (
              <span className="text-xs font-bold text-white/80 tracking-wide uppercase">
                JigawaOS v2.4
              </span>
            )}
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence mode="wait">
            {/* 1. HOME APP GRID */}
            {activeApp === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* User Snapshot Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#064E3B]/80 to-[#022c22]/90 border border-emerald-500/30 shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-emerald-200">
                      {curLoc.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Sim
                    </span>
                  </div>
                  <div className="text-2xl font-black font-mono tracking-tight text-white">
                    ₦{naira.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-emerald-500/20 text-xs">
                    <div>
                      <span className="text-white/50 text-[10px] block">Mutunci</span>
                      <span className="font-bold text-amber-300">{mutunci} / 100</span>
                    </div>
                    <div className="h-6 w-px bg-emerald-500/20" />
                    <div>
                      <span className="text-white/50 text-[10px] block">Energy</span>
                      <span className="font-bold text-emerald-300">{energy}%</span>
                    </div>
                    <div className="h-6 w-px bg-emerald-500/20" />
                    <div>
                      <span className="text-white/50 text-[10px] block">Health</span>
                      <span className="font-bold text-rose-300">{health}%</span>
                    </div>
                  </div>
                </div>

                {/* App Icons Grid (4 Main Apps) */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  {/* Hustles / Jobs */}
                  <button
                    onClick={() => {
                      playClick();
                      setActiveApp('jobs');
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90">Hustles</span>
                  </button>

                  {/* Wallet / Bank */}
                  <button
                    onClick={() => {
                      playClick();
                      setActiveApp('wallet');
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 group-hover:scale-105 transition">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90">Wallet</span>
                  </button>

                  {/* Travel & Commute */}
                  <button
                    onClick={() => {
                      playClick();
                      setActiveApp('travel');
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-yellow-900/40 group-hover:scale-105 transition">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90">Travel</span>
                  </button>

                  {/* Wellbeing / Rest */}
                  <button
                    onClick={() => {
                      playClick();
                      setActiveApp('lifestyle');
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/40 group-hover:scale-105 transition">
                      <Bed className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-white/90">Rest</span>
                  </button>
                </div>

                {/* Quick Shortcuts */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider px-1">
                    Quick Local Actions
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const res = eatBukka();
                        if (res.success) playCash();
                        else playWarning();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2.5 text-left transition"
                    >
                      <Utensils className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Eat Bukka</div>
                        <div className="text-[10px] text-white/50">-₦800 · +15 Hlt</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const res = pray();
                        if (res.success) playClick();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2.5 text-left transition"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">Pray & Reflect</div>
                        <div className="text-[10px] text-white/50">+3 Mutunci</div>
                      </div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. JOBS / HUSTLES APP */}
            {activeApp === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-sm font-black text-white">
                    Available in {curLoc.name}
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {availableJobs.length} Gigs
                  </span>
                </div>

                {availableJobs.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/10 text-white/60 text-xs">
                    No active job listings in this district. Travel to another hub to find gigs!
                  </div>
                ) : (
                  availableJobs.map((job) => {
                    const canAffordEnergy = energy >= job.energyCost;
                    return (
                      <div
                        key={job.id}
                        className="p-3.5 rounded-2xl bg-[#141d2d] border border-white/10 hover:border-emerald-500/40 transition space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">{job.title}</h4>
                            <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5">
                              {job.description}
                            </p>
                          </div>
                          <span className="font-mono font-black text-xs text-emerald-400 shrink-0">
                            +₦{job.payoutNaira.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-white/70">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Battery className="w-3 h-3" />
                              -{job.energyCost}%
                            </span>
                            <span className="flex items-center gap-1 text-blue-300">
                              <Clock className="w-3 h-3" />
                              +{job.timeHours}h
                            </span>
                            {job.mutunciChange !== 0 && (
                              <span
                                className={
                                  job.mutunciChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                                }
                              >
                                {job.mutunciChange > 0 ? '+' : ''}
                                {job.mutunciChange} Mut
                              </span>
                            )}
                          </div>

                          <button
                            disabled={!canAffordEnergy}
                            onClick={() => {
                              const result = performJob(job);
                              if (result.success) {
                                playCash();
                              } else {
                                playWarning();
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                              canAffordEnergy
                                ? 'bg-[#064E3B] hover:bg-[#047857] text-emerald-100 shadow-md'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            Work Gig
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* 3. WALLET / TRANSACTIONS APP */}
            {activeApp === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-indigo-900 to-indigo-700 border border-indigo-400/30 text-white shadow-xl">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-200">
                    Kazaure Microfinance Virtual Account
                  </span>
                  <div className="text-3xl font-mono font-black mt-1 mb-2">
                    ₦{naira.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-indigo-200/80">
                    Day {day} · Mutunci Rating: <span className="font-bold text-white">{mutunci}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider px-1">
                    Recent Statement Log
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {logs.slice(0, 15).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium text-white/90 line-clamp-1">
                            {log.message}
                          </div>
                          <div className="text-[10px] text-white/40">
                            Day {log.day} · {log.hour}:00
                          </div>
                        </div>
                        {log.nairaChange !== undefined && log.nairaChange !== 0 && (
                          <span
                            className={`font-mono font-bold text-xs shrink-0 ${
                              log.nairaChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {log.nairaChange > 0 ? '+' : ''}₦{log.nairaChange.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. TRAVEL / COMMUTE APP */}
            {activeApp === 'travel' && (
              <motion.div
                key="travel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1">
                  <h3 className="text-sm font-black text-white">Transit Routes</h3>
                  <span className="text-[10px] text-white/50">Current: {curLoc.name}</span>
                </div>

                <div className="space-y-2">
                  {locations.map((loc) => {
                    const isHere = loc.id === currentLocation;
                    const canAfford = naira >= loc.travelCost;
                    return (
                      <div
                        key={loc.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isHere
                            ? 'bg-emerald-950/40 border-emerald-500/50'
                            : 'bg-[#141d2d] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{loc.name}</span>
                            {isHere && (
                              <span className="text-[9px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                                Here
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/50">{loc.zone}</div>
                        </div>

                        {!isHere && (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              const res = travel(loc);
                              if (res.success) {
                                playCash();
                                onSelectMapLocation?.(loc.id);
                              } else {
                                playWarning();
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                              canAfford
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            <span>₦{loc.travelCost.toLocaleString()}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 5. LIFESTYLE / SLEEP APP */}
            {activeApp === 'lifestyle' && (
              <motion.div
                key="lifestyle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-500/30 text-white text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-purple-300">
                    <Bed className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black">Rest & Sleep Overnight</h3>
                  <p className="text-xs text-purple-200/80 leading-relaxed max-w-xs mx-auto">
                    Resting advances time to 6:00 AM tomorrow, replenishes 100% Energy, and cures +20 Health.
                    Night lodging & upkeep costs ₦1,500.
                  </p>
                  <button
                    onClick={() => {
                      playRest();
                      rest();
                    }}
                    className="mt-3 w-full py-3 px-4 rounded-2xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-950 transition"
                  >
                    Sleep Now (Pay ₦1,500)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Smartphone Home Indicator Bar */}
        <div className="py-2.5 flex justify-center bg-black/40 border-t border-white/5">
          <button
            onClick={() => {
              playClick();
              setActiveApp('home');
            }}
            className="w-28 h-1 bg-white/40 hover:bg-white/80 rounded-full transition"
          />
        </div>
      </motion.div>
    </div>
  );
};
