'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ScrollText, Briefcase, Moon, Navigation, AlertTriangle, Sparkles, Info } from 'lucide-react';
import type { GameLog } from '@/types/game';

export const LogFeed: React.FC = () => {
  const { logs } = useGameStore();

  const getLogIcon = (type: GameLog['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-3.5 h-3.5 text-[#064E3B]" />;
      case 'rest':
        return <Moon className="w-3.5 h-3.5 text-indigo-600" />;
      case 'travel':
        return <Navigation className="w-3.5 h-3.5 text-[#C2593F]" />;
      case 'event':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      case 'warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'lifestyle':
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-[#047857]" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8D0A8] shadow-sm flex flex-col h-[480px]">
      <div className="flex items-center justify-between border-b border-[#E8D0A8]/60 pb-3 mb-3 shrink-0">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064E3B] flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-[#C2593F]" />
          <span>Live Action & Chronicle Log</span>
        </h3>
        <span className="text-[11px] font-mono text-[#1C1917]/50">
          {logs.length} entries
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8D0A8]/60 text-xs hover:border-[#064E3B]/40 transition"
          >
            <div className="flex items-center justify-between text-[10px] text-[#1C1917]/50 mb-1 font-semibold">
              <span className="flex items-center gap-1.5 text-[#064E3B]">
                {getLogIcon(log.type)}
                <span className="uppercase tracking-wider font-bold">{log.type}</span>
              </span>
              <span>
                Day {log.day} · {log.hour.toString().padStart(2, '0')}:00
              </span>
            </div>

            <p className="text-[#1C1917]/85 font-medium leading-relaxed">
              {log.message}
            </p>

            {/* Stat Pill changes if present */}
            {(log.nairaChange !== undefined || log.mutunciChange !== undefined || log.energyChange !== undefined) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {log.nairaChange !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      log.nairaChange >= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {log.nairaChange >= 0 ? '+' : ''}₦{log.nairaChange.toLocaleString()}
                  </span>
                )}
                {log.mutunciChange !== undefined && log.mutunciChange !== 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      log.mutunciChange > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {log.mutunciChange > 0 ? '+' : ''}{log.mutunciChange} Mutunci
                  </span>
                )}
                {log.energyChange !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      log.energyChange >= 0
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {log.energyChange >= 0 ? '+' : ''}{log.energyChange} Energy
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
