'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Header } from '@/components/Header';
import { StatGrid } from '@/components/StatGrid';
import { CharacterCard } from '@/components/CharacterCard';
import { ActionPanel } from '@/components/ActionPanel';
import { LocationMap } from '@/components/LocationMap';
import { LogFeed } from '@/components/LogFeed';
import { EventModal } from '@/components/EventModal';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'travel'>('overview');
  const { selectedBackground, floatingNotices } = useGameStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#064E3B] text-[#F5E6CA] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
            JL
          </div>
          <h2 className="text-lg font-bold text-[#064E3B]">Loading Jigawa Lifestyle...</h2>
          <p className="text-xs text-[#1C1917]/50 mt-1">Preparing local markets and trade routes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans">
      {/* 1. Header Bar */}
      <Header />

      {/* Floating Notices / Micro-Interactions with Framer Motion */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {floatingNotices.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 border pointer-events-auto ${
                n.type === 'positive'
                  ? 'bg-[#064E3B] text-white border-[#065F46]'
                  : n.type === 'negative'
                  ? 'bg-rose-700 text-white border-rose-800'
                  : 'bg-white text-[#1C1917] border-[#E8D0A8]'
              }`}
            >
              {n.type === 'positive' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : n.type === 'negative' ? (
                <AlertCircle className="w-4 h-4 text-rose-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#C2593F]" />
              )}
              <span>{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* If no background chosen, focus exclusively on Character Choice */}
        {!selectedBackground ? (
          <CharacterCard />
        ) : (
          <>
            {/* 2. Stat Grid (Top) */}
            <StatGrid />

            {/* Character Info Card */}
            <CharacterCard />

            {/* 3. Main Control Area & Live Event Log */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Central Column: Main Control Area */}
              <div className="lg:col-span-8 space-y-6">
                {activeTab === 'travel' ? (
                  <LocationMap />
                ) : (
                  <ActionPanel activeTab={activeTab} setActiveTab={setActiveTab} />
                )}
              </div>

              {/* Right Column: Live Event Log */}
              <div className="lg:col-span-4 sticky top-20">
                <LogFeed />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full bg-white border-t border-[#E8D0A8]/60 py-4 px-4 text-center text-xs text-[#1C1917]/50 mt-auto">
        <p>Jigawa Lifestyle Simulation · Built for high-speed browser play · Dutse, Hadejia, Ringim & Kazaure</p>
      </footer>

      {/* Event Modal / Game Over Modal */}
      <EventModal />
    </div>
  );
}
