'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { Sparkles, AlertTriangle, ArrowRight, RotateCcw, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { canSelectChoice } from '@/engine/eventEngine';

export const EventModal: React.FC = () => {
  const { activeEvent, resolveEvent, isGameOver, gameOverReason, borrowLoan, resetGame } = useGameStore();
  const { playEventPopup, playWarning, playClick, playCash } = useSoundFX();

  useEffect(() => {
    if (activeEvent) {
      playEventPopup();
    } else if (isGameOver) {
      playWarning();
    }
  }, [activeEvent, isGameOver, playEventPopup, playWarning]);

  // If Game Over / Bankruptcy triggered
  if (isGameOver) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-rose-500 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-center text-[#1C1917] tracking-tight mb-2">
            Jigawa Lifestyle Reset
          </h2>

          <p className="text-xs sm:text-sm text-center text-[#1C1917]/70 leading-relaxed mb-6">
            {gameOverReason || 'Your character has suffered bankruptcy or fatal physical exhaustion.'}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                playCash();
                borrowLoan();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#064E3B] hover:bg-[#047857] text-white shadow-md transition flex items-center justify-center gap-2"
            >
              <Landmark className="w-4 h-4" />
              <span>Borrow Distress Loan (+₦75,000, -15 Mutunci)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                resetGame();
              }}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-[#1C1917] transition flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Over (New Life in Jigawa)</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Random Event Modal
  if (!activeEvent) return null;

  const choicesToRender = activeEvent.choices && activeEvent.choices.length > 0
    ? activeEvent.choices
    : [activeEvent.choiceA, activeEvent.choiceB].filter(Boolean);

  const renderStatImpacts = (effects: { naira?: number; mutunci?: number; energy?: number; health?: number }) => {
    const list: string[] = [];
    if (effects.naira) list.push(`${effects.naira > 0 ? '+' : ''}₦${effects.naira.toLocaleString()}`);
    if (effects.mutunci) list.push(`${effects.mutunci > 0 ? '+' : ''}${effects.mutunci} Mutunci`);
    if (effects.energy) list.push(`${effects.energy > 0 ? '+' : ''}${effects.energy} Energy`);
    if (effects.health) list.push(`${effects.health > 0 ? '+' : ''}${effects.health} Health`);

    if (list.length === 0) return <span className="text-[#1C1917]/50 text-[11px]">No immediate stat impact</span>;

    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {list.map((item, idx) => (
          <span
            key={idx}
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              item.includes('+') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E8D0A8] shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C2593F] mb-1">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>Regional Dilemma · {activeEvent.hausaTitle || 'Jigawa Chronicle'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#064E3B] tracking-tight mb-2">
            {activeEvent.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#1C1917]/80 leading-relaxed mb-6 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8D0A8]/60">
            {activeEvent.description}
          </p>

          <div className="space-y-3">
            {choicesToRender.map((choice, index) => {
              const validation = canSelectChoice(choice, {
                naira: useGameStore.getState().naira,
                mutunci: useGameStore.getState().mutunci,
                energy: useGameStore.getState().energy,
                health: useGameStore.getState().health,
                currentLocation: useGameStore.getState().currentLocation,
                selectedBackground: useGameStore.getState().selectedBackground,
              });

              const effects = choice.effects || choice.statChanges || {};

              return (
                <motion.button
                  key={choice.id || index}
                  whileHover={validation.canSelect ? { scale: 1.01 } : {}}
                  whileTap={validation.canSelect ? { scale: 0.99 } : {}}
                  disabled={!validation.canSelect}
                  onClick={() => {
                    playClick();
                    resolveEvent(choice.id || (index === 0 ? 'A' : 'B'));
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition group ${
                    validation.canSelect
                      ? 'border-[#E8D0A8] hover:border-[#064E3B] hover:bg-[#FAF7F2] cursor-pointer'
                      : 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-bold text-xs sm:text-sm ${
                        validation.canSelect
                          ? 'text-[#064E3B] group-hover:text-[#047857]'
                          : 'text-stone-500'
                      }`}
                    >
                      {choice.label || choice.text}
                    </span>
                    {validation.canSelect ? (
                      <ArrowRight className="w-4 h-4 text-[#064E3B] shrink-0 ml-2 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {validation.reason || 'Locked'}
                      </span>
                    )}
                  </div>
                  {renderStatImpacts(effects)}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
