'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { X, ShoppingBag, Coffee, Armchair, Sparkles, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'food' | 'decor' | 'wellness';
  price: number;
  description: string;
  icon: string;
  effects: {
    energy?: number;
    health?: number;
    mutunci?: number;
  };
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'fura_da_nono',
    name: 'Fura da Nono (Chilled)',
    category: 'food',
    price: 1200,
    description: 'Refreshing millet balls crushed with thick curdled milk. Revitalizing in the dry heat.',
    icon: '🥛',
    effects: { energy: 25, health: 10 },
  },
  {
    id: 'kilishi_pack',
    name: 'Spicy Beef Kilishi Pack',
    category: 'food',
    price: 3500,
    description: 'Crispy sun-dried spiced beef cuts from Hadejia meat masters. Pure energy boost.',
    icon: '🥩',
    effects: { energy: 35, health: 5 },
  },
  {
    id: 'tuwo_miyan_kuka',
    name: 'Tuwo Shinkafa & Miyan Kuka',
    category: 'food',
    price: 2000,
    description: 'Steaming pounded rice with baobab leaf soup. Traditional, hearty, and satisfying.',
    icon: '🍲',
    effects: { energy: 40, health: 15 },
  },
  {
    id: 'persian_rug',
    name: 'Emirate Floor Rug',
    category: 'decor',
    price: 25000,
    description: 'Handwoven patterned rug for your isometric bedroom floor. Elevates home prestige.',
    icon: '🧶',
    effects: { mutunci: 8 },
  },
  {
    id: 'rechargeable_fan',
    name: 'Solar Rechargeable Fan',
    category: 'decor',
    price: 38000,
    description: 'High-speed standing fan that stays spinning even when Dutse NEPA goes off.',
    icon: '🌀',
    effects: { mutunci: 5, health: 10 },
  },
  {
    id: 'zobo_drink',
    name: 'Zobo & Ginger Pitcher',
    category: 'wellness',
    price: 800,
    description: 'Chilled hibiscus brew spiked with fresh ginger and cloves.',
    icon: '🧃',
    effects: { energy: 15, health: 10 },
  },
  {
    id: 'moringa_tea',
    name: 'Organic Jigawa Moringa Blend',
    category: 'wellness',
    price: 4500,
    description: 'Potent miracle tree leaves picked along Hadejia valley farms.',
    icon: '🍵',
    effects: { health: 30 },
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'decor' | 'wellness'>('all');
  const { naira, addNotice, addLog } = useGameStore();
  const { playCash, playClick, playWarning } = useSoundFX();

  if (!isOpen) return null;

  const filteredItems =
    activeCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const buyItem = (item: ShopItem) => {
    if (naira < item.price) {
      playWarning();
      addNotice('Not enough Naira in wallet!', 'negative');
      return;
    }

    useGameStore.setState((state) => ({
      naira: state.naira - item.price,
      energy: Math.min(100, state.energy + (item.effects.energy || 0)),
      health: Math.min(100, state.health + (item.effects.health || 0)),
      mutunci: Math.min(100, state.mutunci + (item.effects.mutunci || 0)),
    }));

    playCash();
    addNotice(`Purchased ${item.name}!`, 'positive');
    addLog({
      message: `Purchased ${item.name} for ₦${item.price.toLocaleString()}.`,
      type: 'lifestyle',
      nairaChange: -item.price,
      energyChange: item.effects.energy,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        className="w-full max-w-xl max-h-[85vh] bg-[#111827] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-white font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Jigawa Emporium & Bukka</h2>
              <p className="text-xs text-white/50">
                Wallet Balance: <span className="text-emerald-400 font-bold font-mono">₦{naira.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Tab */}
        <div className="flex gap-2 px-4 sm:px-5 py-3 border-b border-white/5 bg-black/20 overflow-x-auto text-xs">
          {(['all', 'food', 'decor', 'wellness'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClick();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-full capitalize font-semibold transition ${
                activeCategory === cat
                  ? 'bg-emerald-500 text-black font-bold shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const canAfford = naira >= item.price;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-emerald-500/40 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl p-1 bg-white/5 rounded-xl">{item.icon}</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mt-2">{item.name}</h3>
                  <p className="text-[11px] text-white/60 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                    {item.effects.energy && (
                      <span className="text-yellow-400">+{item.effects.energy}⚡</span>
                    )}
                    {item.effects.health && (
                      <span className="text-rose-400">+{item.effects.health}❤️</span>
                    )}
                    {item.effects.mutunci && (
                      <span className="text-purple-400">+{item.effects.mutunci}👑</span>
                    )}
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => buyItem(item)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      canAfford
                        ? 'bg-[#064E3B] hover:bg-[#047857] text-white shadow-md'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
