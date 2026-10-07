'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { GameHud } from '@/components/game/GameHud';
import { PhoneModal } from '@/components/game/PhoneModal';
import { ShopModal } from '@/components/game/ShopModal';
import { MapInfoCard } from '@/components/game/MapInfoCard';
import { EventModal } from '@/components/EventModal';
import { CharacterCard } from '@/components/CharacterCard';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic import with SSR disabled for Three.js WebGL Canvas
const GameViewport = dynamic(
  () => import('@/components/game/GameViewport').then((mod) => mod.GameViewport),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#0c121e] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-xl animate-pulse mb-3">
          JL
        </div>
        <p className="text-sm font-bold text-emerald-400">Loading 3D Jigawa World...</p>
        <p className="text-xs text-white/50 mt-1">Initializing isometric renderer & shaders</p>
      </div>
    ),
  }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'map'>('home');
  const [isPhoneOpen, setIsPhoneOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);

  const { selectedBackground, floatingNotices, travel, addNotice } = useGameStore();
  const { playClick, playCash } = useSoundFX();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0c121e] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#064E3B] text-[#F5E6CA] flex items-center justify-center font-black text-xl mx-auto mb-3 shadow-md">
            JL
          </div>
          <h2 className="text-base font-bold text-emerald-400">Loading Jigawa Lifestyle...</h2>
          <p className="text-xs text-white/50 mt-1">Preparing local markets and trade routes.</p>
        </div>
      </div>
    );
  }

  // 1. Initial State: Background selection fallback if ever reset
  if (!selectedBackground) {
    return (
      <div className="min-h-screen bg-[#0c121e] text-[#FAF7F2] flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              3D Life Simulation · Jigawa State
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
              JIGAWA LIFESTYLE
            </h1>
            <p className="text-sm text-white/70 max-w-md mx-auto mt-2">
              Step into Dutse, Hadejia, Ringim, and Kazaure. Build wealth, preserve Mutunci, and furnish your home.
            </p>
          </div>
          <CharacterCard />
        </div>
      </div>
    );
  }

  // 2. Full-Screen 3D Game World (Matching lagoslife.app)
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D Isometric Viewport (Room / City Map) */}
      <GameViewport
        viewMode={viewMode}
        onPinClick={(locationId) => {
          setSelectedPinId(locationId);
          playClick();
        }}
      />

      {/* Retro-Modern HUD & Dock Overlay */}
      <GameHud
        viewMode={viewMode}
        setViewMode={(mode) => {
          setViewMode(mode);
          if (mode === 'home') setSelectedPinId(null);
        }}
        openPhone={() => setIsPhoneOpen(true)}
        openShop={() => setIsShopOpen(true)}
      />

      {/* Interactive 3D Map Pin Details Card */}
      {viewMode === 'map' && (
        <MapInfoCard
          selectedPinId={selectedPinId}
          onClose={() => setSelectedPinId(null)}
          onOpenJobsForLocation={() => {
            setIsPhoneOpen(true);
          }}
        />
      )}

      {/* Floating Notices / Micro-Interactions */}
      <div className="fixed top-20 right-4 z-40 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {floatingNotices.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 border pointer-events-auto backdrop-blur-md ${
                n.type === 'positive'
                  ? 'bg-emerald-900/90 text-white border-emerald-500/40'
                  : n.type === 'negative'
                  ? 'bg-rose-900/90 text-white border-rose-500/40'
                  : 'bg-gray-900/90 text-white border-white/20'
              }`}
            >
              {n.type === 'positive' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              ) : n.type === 'negative' ? (
                <AlertCircle className="w-4 h-4 text-rose-300" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{n.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Phone Smartphone Modal Overlay */}
      <PhoneModal
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        onSelectMapLocation={(locId) => {
          setViewMode('map');
          setSelectedPinId(locId);
          setIsPhoneOpen(false);
        }}
      />

      {/* Shop Emporium Modal Overlay */}
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />

      {/* Random Event Dilemma & Game-Over Modal */}
      <EventModal />
    </div>
  );
}
