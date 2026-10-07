'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Coins, Award, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatGrid: React.FC = () => {
  const { naira, mutunci, energy, health } = useGameStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Naira Balance */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8D0A8] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917]/70 mb-1">
          <span className="uppercase tracking-wider">Naira Balance</span>
          <div className="w-7 h-7 rounded-lg bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <motion.div
          key={naira}
          initial={{ scale: 0.95, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-xl sm:text-2xl font-black tracking-tight text-[#064E3B]"
        >
          ₦{naira.toLocaleString()}
        </motion.div>
        <div className="text-[11px] text-[#1C1917]/50 mt-1 flex items-center gap-1">
          <span>Liquid funds in pocket</span>
        </div>
      </div>

      {/* 2. Mutunci (Social Respect) with meter bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8D0A8] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917]/70 mb-1">
          <span className="uppercase tracking-wider">Mutunci (Respect)</span>
          <div className="w-7 h-7 rounded-lg bg-[#C2593F]/10 text-[#C2593F] flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#C2593F]">
            {mutunci}<span className="text-sm font-semibold text-[#1C1917]/40">/100</span>
          </span>
          <span className="text-[11px] font-semibold text-[#C2593F]">
            {mutunci >= 80 ? 'Eminent' : mutunci >= 50 ? 'Respected' : mutunci >= 30 ? 'Ordinary' : 'Low Trust'}
          </span>
        </div>
        {/* Animated Progress bar */}
        <div className="w-full bg-[#FAF7F2] rounded-full h-2 border border-[#E8D0A8]/60 mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#C2593F] to-[#D97706] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(mutunci, 0), 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 3. Energy % */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8D0A8] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917]/70 mb-1">
          <span className="uppercase tracking-wider">Stamina & Energy</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-600">
            {energy}<span className="text-sm font-semibold text-[#1C1917]/40">%</span>
          </span>
          <span className="text-[11px] font-medium text-[#1C1917]/50">
            {energy > 60 ? 'Full Vitality' : energy > 25 ? 'Weary' : 'Exhausted'}
          </span>
        </div>
        {/* Animated Progress bar */}
        <div className="w-full bg-[#FAF7F2] rounded-full h-2 border border-[#E8D0A8]/60 mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(energy, 0), 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* 4. Health % */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8D0A8] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917]/70 mb-1">
          <span className="uppercase tracking-wider">Health Status</span>
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-rose-600">
            {health}<span className="text-sm font-semibold text-[#1C1917]/40">%</span>
          </span>
          <span className="text-[11px] font-medium text-[#1C1917]/50">
            {health > 70 ? 'Strong' : health > 35 ? 'Ailing' : 'Critical'}
          </span>
        </div>
        {/* Animated Progress bar */}
        <div className="w-full bg-[#FAF7F2] rounded-full h-2 border border-[#E8D0A8]/60 mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(health, 0), 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
};
