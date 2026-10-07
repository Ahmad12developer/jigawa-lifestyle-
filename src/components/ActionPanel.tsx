'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import jobsData from '@/data/jobs.json';
import locationsData from '@/data/locations.json';
import {
  Moon,
  Utensils,
  Sparkles,
  Briefcase,
  Zap,
  Clock,
  Coins,
  Award,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionPanelProps {
  activeTab: 'overview' | 'jobs' | 'travel';
  setActiveTab: (tab: 'overview' | 'jobs' | 'travel') => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentLocation,
    energy,
    naira,
    rest,
    eatBukka,
    pray,
    performJob,
    selectedBackground,
  } = useGameStore();

  const { playClick, playCash, playRest } = useSoundFX();

  const currentLoc = locationsData.find((l) => l.id === currentLocation);
  const availableJobs = jobsData.filter((job) => job.locationId === currentLocation);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8D0A8] shadow-sm">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E8D0A8]/60 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            playClick();
            setActiveTab('overview');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-[#1C1917]/70 hover:bg-[#FAF7F2] hover:text-[#064E3B]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Daily Routine</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveTab('jobs');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'jobs'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-[#1C1917]/70 hover:bg-[#FAF7F2] hover:text-[#064E3B]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Local Hustles ({availableJobs.length})</span>
        </button>

        <button
          onClick={() => {
            playClick();
            setActiveTab('travel');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'travel'
              ? 'bg-[#064E3B] text-white shadow-sm'
              : 'text-[#1C1917]/70 hover:bg-[#FAF7F2] hover:text-[#064E3B]'
          }`}
        >
          <span>Map & Travel</span>
        </button>
      </div>

      {/* Tab 1: Overview / Quick Actions */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#064E3B] mb-1">
              Essential Daily Actions
            </h3>
            <p className="text-xs text-[#1C1917]/60">
              Manage your physical endurance, nutrition, and community relations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Quick Action 1: Rest Overnight */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8D0A8] flex flex-col justify-between hover:border-[#064E3B] transition"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#064E3B]">Overnight Rest</h4>
                <p className="text-xs text-[#1C1917]/70 mt-1 leading-relaxed">
                  Sleep until 6:00 AM the next morning. Restores 100% Energy + 20 Health (₦1,500 lodging).
                </p>
              </div>
              <button
                onClick={() => {
                  playRest();
                  rest();
                }}
                className="mt-4 w-full py-2.5 px-3 bg-[#064E3B] hover:bg-[#047857] text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                Sleep Till Morning (6 AM)
              </button>
            </motion.div>

            {/* Quick Action 2: Eat at Bukka */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8D0A8] flex flex-col justify-between hover:border-[#064E3B] transition"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#C2593F]/10 text-[#C2593F] flex items-center justify-center mb-3">
                  <Utensils className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#064E3B]">Eat at Bukka</h4>
                <p className="text-xs text-[#1C1917]/70 mt-1 leading-relaxed">
                  Tuwon Shinkafa & Miyar Kuka with tender meat. Costs ₦2,000. Restores +25 Energy & +8 Health.
                </p>
              </div>
              <button
                onClick={() => {
                  playClick();
                  eatBukka();
                }}
                disabled={naira < 2000}
                className={`mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-xl shadow-sm transition ${
                  naira >= 2000
                    ? 'bg-[#C2593F] hover:bg-[#A7452D] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Order Meal (₦2,000)
              </button>
            </motion.div>

            {/* Quick Action 3: Pray at Mosque */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8D0A8] flex flex-col justify-between hover:border-[#064E3B] transition"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#047857]/10 text-[#047857] flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-[#064E3B]">Community Prayer</h4>
                <p className="text-xs text-[#1C1917]/70 mt-1 leading-relaxed">
                  Join neighbors at the local mosque. Advances time by 1 hr. Grants +3 Mutunci (Respect).
                </p>
              </div>
              <button
                onClick={() => {
                  playClick();
                  pray();
                }}
                disabled={energy < 5}
                className={`mt-4 w-full py-2.5 px-3 text-xs font-bold rounded-xl shadow-sm transition ${
                  energy >= 5
                    ? 'bg-[#064E3B] hover:bg-[#047857] text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Pray (-5 Energy)
              </button>
            </motion.div>
          </div>

          {/* Quick Location Snapshot */}
          <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8D0A8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#1C1917]/50 block">Current Surroundings</span>
              <h4 className="text-sm font-bold text-[#064E3B]">{currentLoc?.name} ({currentLoc?.zone})</h4>
              <p className="text-xs text-[#1C1917]/70 mt-0.5">{currentLoc?.description}</p>
            </div>
            <button
              onClick={() => {
                playClick();
                setActiveTab('jobs');
              }}
              className="px-4 py-2 bg-white border border-[#E8D0A8] hover:border-[#064E3B] text-[#064E3B] rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore {availableJobs.length} Jobs Here</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Hustle / Jobs Grid */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#064E3B]">
                Available Occupations in {currentLoc?.name}
              </h3>
              <p className="text-xs text-[#1C1917]/60">
                Perform local contracts to earn Naira and build your reputation.
              </p>
            </div>
            {selectedBackground === 'agro_entrepreneur' && currentLocation === 'hadejia_market' && (
              <span className="text-[11px] font-bold text-[#064E3B] bg-[#064E3B]/10 px-2.5 py-1 rounded-full border border-[#064E3B]/20">
                ★ +15% Agro Trading Bonus Active
              </span>
            )}
            {selectedBackground === 'tech_pos_hustler' && currentLocation === 'fud_campus' && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                ★ 10% Slower Energy Drain Active
              </span>
            )}
          </div>

          {availableJobs.length === 0 ? (
            <div className="text-center py-10 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E8D0A8]">
              <AlertCircle className="w-8 h-8 text-[#C2593F] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#064E3B]">No jobs available in this location right now.</p>
              <p className="text-xs text-[#1C1917]/60 mt-1">Travel to other towns across Jigawa to find opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableJobs.map((job) => {
                const canAffordEnergy = energy >= job.energyCost;
                let displayPayout = job.payoutNaira;
                if (selectedBackground === 'agro_entrepreneur' && job.locationId === 'hadejia_market') {
                  displayPayout = Math.round(displayPayout * 1.15);
                }

                return (
                  <motion.div
                    key={job.id}
                    whileHover={{ y: -2 }}
                    className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8D0A8] flex flex-col justify-between hover:border-[#064E3B] transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="font-bold text-sm text-[#064E3B]">{job.title}</h4>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg shrink-0">
                          ₦{displayPayout.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#1C1917]/70 leading-relaxed mb-3">
                        {job.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-2 border border-[#E8D0A8]/60 text-center mb-4">
                        <div className="flex items-center justify-center gap-1 text-xs text-amber-600 font-semibold">
                          <Zap className="w-3.5 h-3.5" />
                          <span>-{job.energyCost} Nrg</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-[#1C1917]/70 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{job.timeHours} hrs</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-xs text-[#C2593F] font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          <span>+{job.mutunciChange} Mut</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const res = performJob(job.id);
                        if (res.success) {
                          playCash();
                        }
                      }}
                      disabled={!canAffordEnergy}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 ${
                        canAffordEnergy
                          ? 'bg-[#064E3B] hover:bg-[#047857] text-white active:scale-95'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{canAffordEnergy ? `Start Shift (${job.timeHours} hrs)` : 'Too Exhausted (Rest First)'}</span>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
