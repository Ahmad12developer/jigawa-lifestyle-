'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import {
  Home,
  ShoppingBag,
  Map,
  Smartphone,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Coins,
  Sparkles,
  Briefcase,
  Eye,
  EyeOff,
  Flame,
  Zap,
  MessageCircle,
  Heart,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameHudProps {
  viewMode: 'home' | 'map';
  setViewMode: (mode: 'home' | 'map') => void;
  openPhone: () => void;
  openShop: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({
  viewMode,
  setViewMode,
  openPhone,
  openShop,
}) => {
  const {
    naira,
    mutunci,
    energy,
    health,
    day,
    hour,
    season,
    selectedBackground,
  } = useGameStore();

  const { playClick } = useSoundFX();
  const [cleanScreen, setCleanScreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Time formatting (e.g., "Day 1 · 09:15 AM")
  const hour12 = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const timeString = `${hour12}:00 ${ampm}`;

  // Mood state
  const moodText =
    mutunci >= 75 ? 'Very Happy' : mutunci >= 50 ? 'Content' : mutunci >= 30 ? 'Uneasy' : 'Stressed';
  const moodEmoji =
    mutunci >= 75 ? '😊' : mutunci >= 50 ? '🙂' : mutunci >= 30 ? '😐' : '😟';

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* 1. TOP HEADER BAR */}
      <AnimatePresence>
        {!cleanScreen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2 pointer-events-auto w-full"
          >
            {/* Top Status Capsule */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827]/90 text-white backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-xl max-w-4xl w-full">
              {/* Day & Time */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                {hour >= 6 && hour < 18 ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Day {day} · {timeString}</span>
                <span className="text-white/30 hidden sm:inline">|</span>
                <span className="text-xs text-[#F5E6CA] hidden sm:inline">{season}</span>
              </div>

              {/* Mood indicator */}
              <div className="flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                <span>{moodEmoji}</span>
                <span className="font-semibold text-white/90">{moodText}</span>
              </div>

              {/* Online counter */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-white/70">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>135k online</span>
              </div>

              {/* Sound & Wallet */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSoundOn(!soundOn);
                    playClick();
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 transition"
                  title="Toggle Sound"
                >
                  {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                {/* Money Pill */}
                <div className="flex items-center gap-1.5 bg-[#064E3B] text-emerald-100 font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full border border-emerald-500/40 shadow-inner">
                  <span>₦{naira.toLocaleString()}</span>
                  <button
                    onClick={openShop}
                    className="w-4 h-4 rounded-full bg-emerald-500 text-[#064E3B] flex items-center justify-center hover:scale-110 transition ml-0.5"
                    title="Add Funds / Shop"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Central Alert Pill (like "💡 NEPA took light" in lagoslife) */}
            <div className="bg-[#1f2937]/90 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-md">
              <span>💡</span>
              <span>NEPA took light · Dutse rock generator running</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. LEFT SIDE QUESTS / BADGES */}
      <div className="flex flex-col gap-2.5 items-start mt-2 pointer-events-auto">
        <AnimatePresence>
          {!cleanScreen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              {/* Quest 1 */}
              <button
                onClick={openPhone}
                className="flex items-center gap-2.5 bg-[#111827]/85 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 hover:border-emerald-500/50 shadow-lg text-left transition group"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-400 group-hover:underline">
                    Find a Hustle
                  </span>
                  <span className="block text-[10px] text-white/60">Open Phone → Jobs</span>
                </div>
              </button>

              {/* Quest 2 */}
              <div className="flex items-center gap-2.5 bg-[#111827]/85 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg text-left">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-blue-300">Daily Harvest Hunt</span>
                  <span className="block text-[10px] text-white/60">Sesame bags found · Next ₦3,000</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean Screen Toggle Button */}
        <button
          onClick={() => setCleanScreen(!cleanScreen)}
          className="bg-[#111827]/80 text-white/80 hover:text-white px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-semibold flex items-center gap-1.5 transition shadow"
        >
          {cleanScreen ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          <span>{cleanScreen ? 'Show HUD' : 'Clean screen'}</span>
        </button>
      </div>

      {/* 3. BOTTOM AREA: CHARACTER STATUS & FLOATING NAV DOCK */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-auto w-full">
        {/* Bottom Left Character Avatar & Needs (exactly like lagoslife bottom-left) */}
        <div className="flex items-center gap-3 bg-[#111827]/90 text-white backdrop-blur-md p-2.5 rounded-3xl border border-white/10 shadow-2xl">
          {/* Circular Portrait */}
          <div className="w-12 h-12 rounded-full bg-amber-700 border-2 border-amber-400 flex items-center justify-center text-xl shadow-inner font-bold text-white shrink-0">
            👳🏽‍♂️
          </div>

          {/* 4 Needs Bars */}
          <div className="flex flex-col gap-1.5 pr-2">
            {/* Hunger */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]">🍲</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]">⚡</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${energy}%` }}
                />
              </div>
            </div>

            {/* Mood / Mutunci */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]">💬</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-400 rounded-full transition-all"
                  style={{ width: `${mutunci}%` }}
                />
              </div>
            </div>

            {/* Health */}
            <div className="flex items-center gap-2">
              <span className="text-[10px]">❤️</span>
              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all"
                  style={{ width: `${health}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Centered Nav Dock (Home, Buy, Map, Phone) */}
        <div className="mx-auto flex items-center gap-1 bg-[#111827]/95 text-white backdrop-blur-lg p-1.5 rounded-full border border-white/15 shadow-2xl">
          {/* Home */}
          <button
            onClick={() => {
              playClick();
              setViewMode('home');
            }}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition ${
              viewMode === 'home'
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* Buy */}
          <button
            onClick={() => {
              playClick();
              openShop();
            }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Buy</span>
          </button>

          {/* Map */}
          <button
            onClick={() => {
              playClick();
              setViewMode('map');
            }}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-full transition ${
              viewMode === 'map'
                ? 'bg-white/20 text-white font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Map</span>
          </button>

          {/* Phone */}
          <button
            onClick={() => {
              playClick();
              openPhone();
            }}
            className="flex flex-col items-center justify-center w-14 h-12 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Phone</span>
          </button>
        </div>
      </div>
    </div>
  );
};
