'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { HOUSING_TIERS } from '@/data/housing';
import { VEHICLES } from '@/data/commodities';
import backgroundsRaw from '@/data/backgrounds.json';
import {
  X,
  Share2,
  Copy,
  Check,
  Crown,
  Sparkles,
  ExternalLink,
  Shield,
  Home,
  Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerBackground } from '@/types/game';

interface StatusCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StatusCardModal: React.FC<StatusCardModalProps> = ({ isOpen, onClose }) => {
  const {
    naira,
    mutunci,
    day,
    season,
    avatar,
    housingTier,
    equippedVehicle,
    selectedBackground,
    getEmirateTitle,
  } = useGameStore();

  const { playClick, playCash } = useSoundFX();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const backgrounds = backgroundsRaw as PlayerBackground[];
  const bg = backgrounds.find((b) => b.id === selectedBackground) || backgrounds[0];
  const title = getEmirateTitle();
  const housing = HOUSING_TIERS[housingTier];
  const vehicle = VEHICLES[equippedVehicle] || VEHICLES.none;

  const mutunciRating =
    mutunci >= 90
      ? 'Revered Dignitary'
      : mutunci >= 75
      ? 'Trusted Community Elder'
      : mutunci >= 50
      ? 'Respected Citizen'
      : mutunci >= 30
      ? 'Struggling Hustler'
      : 'Disgraced Commoner';

  const shareText = `🌾 Day ${day} in Jigawa Lifestyle (Rayuwar Jigawa):
👑 Title: ${title.title} (${title.hausaTitle})
💰 Net Worth: ₦${naira.toLocaleString()}
⭐ Mutunci (Honor): ${mutunci}/100 (${mutunciRating})
🏡 Home: ${housing.title}
🛻 Transport: ${vehicle.name}

Can you out-hustle me in the Sahel? Play browser-free! #JigawaLifestyle #LagosLife`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    playCash();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareX = () => {
    playClick();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    playClick();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 25 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 25 }}
        className="relative w-full max-w-md bg-[#0c121e] border-2 border-amber-500/30 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-emerald-950/30 to-transparent">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
              STATUS & PRESTIGE CARD
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Branded Viral Card Container */}
        <div className="p-5">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#162032] to-[#0c121e] p-5 border-2 border-emerald-500/40 shadow-2xl overflow-hidden">
            {/* Watermark Logo Accent */}
            <div className="absolute top-2 right-3 text-[9px] font-black tracking-widest text-emerald-400/40 uppercase">
              JIGAWA LIFESTYLE 🇳🇬
            </div>

            {/* Character & Title Block */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-2xl border-2 border-amber-400/60 shadow-xl flex items-center justify-center text-3xl shrink-0"
                style={{ backgroundColor: avatar.attireColor }}
              >
                {avatar.gender === 'female' ? '🧕🏽' : '👳🏽‍♂️'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{title.badge}</span>
                  <h3 className="text-base font-black text-white leading-tight">
                    {title.title}
                  </h3>
                </div>
                <span className="block text-xs font-medium text-amber-300">
                  {title.hausaTitle}
                </span>
                <span className="block text-[10px] text-white/50 mt-0.5">
                  Origin: {bg.title} · Day {day} ({season})
                </span>
              </div>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4 font-mono">
              <div className="bg-black/40 border border-emerald-500/30 rounded-xl p-3">
                <span className="block text-[10px] text-white/50 uppercase font-sans font-bold">
                  Net Worth (Naira)
                </span>
                <span className="text-base font-black text-emerald-400">
                  ₦{naira.toLocaleString()}
                </span>
              </div>

              <div className="bg-black/40 border border-purple-500/30 rounded-xl p-3">
                <span className="block text-[10px] text-white/50 uppercase font-sans font-bold">
                  Mutunci (Dignity)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-black text-purple-300">{mutunci}</span>
                  <span className="text-[10px] text-white/50">/ 100</span>
                </div>
                <span className="block text-[9px] text-purple-200 truncate font-sans font-semibold">
                  {mutunciRating}
                </span>
              </div>
            </div>

            {/* Secondary Assets List */}
            <div className="bg-white/5 rounded-xl p-3 space-y-1.5 text-xs text-white/80 border border-white/5 font-sans">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Home className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Residence:</span>
                </div>
                <span className="font-bold text-white text-[11px]">{housing.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Transport:</span>
                </div>
                <span className="font-bold text-white text-[11px]">{vehicle.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span>Emirate Perk:</span>
                </div>
                <span className="font-bold text-emerald-300 text-[10px] truncate max-w-[170px]">
                  {title.perks}
                </span>
              </div>
            </div>

            {/* Bottom Tagline */}
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
              <span>Rayuwar Jigawa · Browser Life Sim</span>
              <span className="text-emerald-400 font-bold">jigawalifestyle.app</span>
            </div>
          </div>

          {/* Viral Social Share Buttons */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareX}
                className="py-2.5 px-3 rounded-xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow"
              >
                <span>𝕏</span>
                <span>Share to X</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs flex items-center justify-center gap-2 transition shadow"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Summary Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white/70" />
                  <span>Copy Status Summary Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
