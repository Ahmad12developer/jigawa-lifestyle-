'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import locationsDataRaw from '@/data/locations.json';
import {
  MapPin,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  DollarSign,
  Coffee,
  CheckCircle2,
  X,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameLocation } from '@/types/game';

interface DistrictActivityModalProps {
  locationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityItem {
  id: string;
  title: string;
  hausaTitle?: string;
  description: string;
  icon: string;
  costNaira?: number;
  rewardNaira?: number;
  energyChange: number;
  mutunciChange: number;
  actionText: string;
  cooldownKey: string;
}

const DISTRICT_ACTIVITIES: Record<string, ActivityItem[]> = {
  hadejia_market: [
    {
      id: 'market_suya',
      title: 'Taste Hot Spicy Kilishi & Suya',
      hausaTitle: 'Cin Suya da Kilishi Mai Zafi',
      description: 'Savor freshly grilled, thinly sliced spiced beef seasoned with authentic northern Yaji pepper.',
      icon: '🍢',
      costNaira: 1500,
      energyChange: 28,
      mutunciChange: 3,
      actionText: 'Buy Suya (₦1,500)',
      cooldownKey: 'suya',
    },
    {
      id: 'market_haggling',
      title: 'Wholesale Grain Haggling Hustle',
      hausaTitle: 'Cinikin Hatsi da Alhaji Gambo',
      description: 'Negotiate bulk bags of sesame and sorted rice with local merchants using sharp market diplomacy.',
      icon: '🌾',
      rewardNaira: 7500,
      energyChange: -12,
      mutunciChange: 6,
      actionText: 'Negotiate & Earn ₦7,500',
      cooldownKey: 'haggle',
    },
    {
      id: 'market_pos',
      title: 'Run Mobile POS Cash Desk',
      hausaTitle: 'Hustle din POS a Kasuwa',
      description: 'Disburse physical cash to incoming traders and charge quick transaction commission fees.',
      icon: '📱',
      rewardNaira: 5000,
      energyChange: -10,
      mutunciChange: 4,
      actionText: 'Run POS Desk (+₦5,000)',
      cooldownKey: 'pos',
    },
  ],
  ringim_palace: [
    {
      id: 'palace_gaisuwa',
      title: 'Pay Royal Homage (Gaisuwa) to the Emir',
      hausaTitle: 'Gaisuwa ga Mai Martaba Sarki',
      description: 'Present traditional ceremonial respect in the royal audience chamber. Receive the Emir’s blessing.',
      icon: '👑',
      costNaira: 2500,
      energyChange: 10,
      mutunciChange: 22,
      actionText: 'Present Homage (₦2,500)',
      cooldownKey: 'gaisuwa',
    },
    {
      id: 'palace_durbar_practice',
      title: 'Durbar Royal Equestrian Riding Practice',
      hausaTitle: 'Koyon Hawan Doki a Fada',
      description: 'Mount a caparisoned white stallion alongside the royal cavalry pageantry in the palace courtyard.',
      icon: '🏇',
      energyChange: -15,
      mutunciChange: 16,
      actionText: 'Ride with Cavalry (+16 Mutunci)',
      cooldownKey: 'durbar',
    },
    {
      id: 'palace_history',
      title: 'Consult Ancient Zaure Manuscripts',
      hausaTitle: 'Karatun Tarihin Masarautar Garu',
      description: 'Learn the sacred history of Dutse and Garu ancient walls with the royal palace scribes.',
      icon: '📜',
      energyChange: -5,
      mutunciChange: 12,
      actionText: 'Study Heritage (+12 Mutunci)',
      cooldownKey: 'zaure',
    },
  ],
  kazaure_agro_tech: [
    {
      id: 'summit_hike',
      title: 'Hike to Dutse Rock Lookout Peak',
      hausaTitle: 'Hawa Dutsen Dutse',
      description: 'Climb the carved stone stairs up to the summit observation deck. Breathtaking views over all of Jigawa.',
      icon: '🧗',
      energyChange: 20,
      mutunciChange: 15,
      actionText: 'Hike Peak (+15 Mutunci, +20 Energy)',
      cooldownKey: 'hike',
    },
    {
      id: 'tech_grant',
      title: 'Galaxy Backbone Tech Grant Application',
      hausaTitle: 'Neman Tallafin Fasaha na Jigawa',
      description: 'Pitch an agricultural drone or fintech software solution to the state tech hub committee.',
      icon: '💻',
      rewardNaira: 18000,
      energyChange: -18,
      mutunciChange: 8,
      actionText: 'Submit Tech Pitch (+₦18,000)',
      cooldownKey: 'tech_grant',
    },
  ],
  fud_campus: [
    {
      id: 'fud_cafeteria',
      title: 'Student Cafeteria (Tuwon Shinkafa)',
      hausaTitle: 'Cin Abinci a Cafeteria FUD',
      description: 'A hearty steaming plate of Tuwon Shinkafa with savory Miyan Kuka and tender beef.',
      icon: '🍲',
      costNaira: 1000,
      energyChange: 25,
      mutunciChange: 2,
      actionText: 'Eat Meal (₦1,000)',
      cooldownKey: 'tuwo',
    },
    {
      id: 'fud_freelance',
      title: 'Student Web & Design Sprint',
      hausaTitle: 'Aikin Freelance a FUD',
      description: 'Build an e-commerce website prototype for a campus student entrepreneur.',
      icon: '🎨',
      rewardNaira: 9500,
      energyChange: -14,
      mutunciChange: 6,
      actionText: 'Complete Gig (+₦9,500)',
      cooldownKey: 'freelance',
    },
    {
      id: 'fud_debate',
      title: 'Attend Senate Hall Policy Symposium',
      hausaTitle: 'Halartar Muhawarar Ilimi',
      description: 'Participate in an intellectual student symposium on Northern economic revitalization.',
      icon: '🎓',
      energyChange: -8,
      mutunciChange: 14,
      actionText: 'Join Debate (+14 Mutunci)',
      cooldownKey: 'symposium',
    },
  ],
  dutse_secretariat: [
    {
      id: 'sec_protocol',
      title: 'Attend Executive Council Protocol Assembly',
      hausaTitle: 'Taron Diflomasiyya a Sakatariya',
      description: 'Network with state ministry permanent secretaries and international development partners.',
      icon: '🏛️',
      energyChange: -10,
      mutunciChange: 18,
      actionText: 'Attend Assembly (+18 Mutunci)',
      cooldownKey: 'protocol',
    },
    {
      id: 'sec_tender',
      title: 'Submit Ministry Procurement Bid',
      hausaTitle: 'Neman Kwangilar Gwamnati',
      description: 'Review official ministerial tender bulletins and submit your verified business bid.',
      icon: '📑',
      rewardNaira: 22000,
      energyChange: -16,
      mutunciChange: 10,
      actionText: 'Submit Bid (+₦22,000)',
      cooldownKey: 'tender',
    },
  ],
};

export const DistrictActivityModal: React.FC<DistrictActivityModalProps> = ({
  locationId,
  isOpen,
  onClose,
}) => {
  const { naira, mutunci, energy, health, addNotice, addLog } = useGameStore();
  const { playClick, playCash, playSuccess, playWarning } = useSoundFX();
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});

  if (!isOpen || !locationId) return null;

  const locations = locationsDataRaw as GameLocation[];
  const loc = locations.find((l) => l.id === locationId);
  const activities = DISTRICT_ACTIVITIES[locationId] || [];

  const handleExecute = (act: ActivityItem) => {
    // Financial validation
    if (act.costNaira && naira < act.costNaira) {
      playWarning();
      addNotice(`Insufficient Naira! Needs ₦${act.costNaira.toLocaleString()}`, 'negative');
      return;
    }

    // Energy validation if negative
    if (act.energyChange < 0 && energy < Math.abs(act.energyChange)) {
      playWarning();
      addNotice(`Too exhausted! Needs ${Math.abs(act.energyChange)}% Energy. Rest first!`, 'negative');
      return;
    }

    // Execute state changes
    if (act.costNaira) {
      useGameStore.setState((s) => ({
        naira: Math.max(0, s.naira - act.costNaira!),
        energy: Math.min(100, Math.max(0, s.energy + act.energyChange)),
        mutunci: Math.min(100, Math.max(0, s.mutunci + act.mutunciChange)),
      }));
      playCash();
    } else if (act.rewardNaira) {
      useGameStore.setState((s) => ({
        naira: s.naira + act.rewardNaira!,
        energy: Math.min(100, Math.max(0, s.energy + act.energyChange)),
        mutunci: Math.min(100, Math.max(0, s.mutunci + act.mutunciChange)),
      }));
      playSuccess();
    } else {
      useGameStore.setState((s) => ({
        energy: Math.min(100, Math.max(0, s.energy + act.energyChange)),
        mutunci: Math.min(100, Math.max(0, s.mutunci + act.mutunciChange)),
      }));
      playSuccess();
    }

    addNotice(
      `${act.title}: ${act.rewardNaira ? `+₦${act.rewardNaira.toLocaleString()}` : ''} ${
        act.mutunciChange > 0 ? `+${act.mutunciChange} Mutunci` : ''
      }`,
      'positive'
    );

    addLog({
      message: `Engaged in "${act.title}" at ${loc?.name || locationId}.`,
      type: 'lifestyle',
      nairaChange: act.rewardNaira ? act.rewardNaira : act.costNaira ? -act.costNaira : 0,
      mutunciChange: act.mutunciChange,
    });

    setCompletedActivities((prev) => ({ ...prev, [act.id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="bg-[#111827] text-white rounded-3xl border border-white/15 max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-500" />

        {/* Close Button */}
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Landmark Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
            <MapPin className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Dutse City Landmark Activities
            </span>
            <h2 className="text-lg font-black text-white">{loc?.name || 'Landmark Hub'}</h2>
            <p className="text-xs text-white/60">{loc?.hausaName || loc?.zone}</p>
          </div>
        </div>

        {/* District Activity Cards */}
        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-white/50 text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-white/30" />
              <span>Explore this landmark by walking around and talking to residents.</span>
            </div>
          ) : (
            activities.map((act) => {
              const done = completedActivities[act.id];
              return (
                <div
                  key={act.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{act.icon}</span>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{act.title}</span>
                          {done && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </span>
                          )}
                        </h4>
                        {act.hausaTitle && (
                          <span className="text-[11px] text-amber-300 font-medium">
                            {act.hausaTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">{act.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                    {/* Stat Badges */}
                    <div className="flex items-center gap-2 text-[11px]">
                      {act.energyChange !== 0 && (
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md ${
                            act.energyChange > 0
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          ⚡ {act.energyChange > 0 ? `+${act.energyChange}` : act.energyChange}% Energy
                        </span>
                      )}
                      {act.mutunciChange > 0 && (
                        <span className="bg-purple-500/20 text-purple-300 font-semibold px-2 py-0.5 rounded-md">
                          💬 +{act.mutunciChange} Mutunci
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleExecute(act)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1.5 ${
                        done
                          ? 'bg-white/10 text-white/80 hover:bg-white/20'
                          : act.rewardNaira
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                          : 'bg-amber-500 hover:bg-amber-400 text-black'
                      }`}
                    >
                      <span>{act.actionText}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>Active in Dutse, Jigawa State</span>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="text-white/70 hover:text-white underline font-semibold"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
