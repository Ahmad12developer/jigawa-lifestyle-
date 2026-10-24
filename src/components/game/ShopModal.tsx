'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { X, ShoppingBag, Check, Zap, Truck, Sparkles, Utensils, Home } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  category: 'food' | 'decor' | 'tech' | 'vehicles';
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
  // --- FOOD & NOURISHMENT ---
  {
    id: 'fura_da_nono',
    name: 'Fura da Nono (Chilled Bowl)',
    category: 'food',
    price: 850,
    description: 'Refreshing pounded millet spheres crushed into cold curdled cow milk. Immediate thirst and hunger relief.',
    icon: '🥛',
    effects: { energy: 25, health: 15 },
  },
  {
    id: 'kilishi_pack',
    name: 'Spicy Beef Kilishi Pack',
    category: 'food',
    price: 2500,
    description: 'Thin sun-dried beef wafers infused with pepper, ginger, and peanut paste from Hadejia butchers.',
    icon: '🥩',
    effects: { energy: 35, health: 5 },
  },
  {
    id: 'tuwo_miyan_kuka',
    name: 'Tuwo Shinkafa & Miyan Kuka',
    category: 'food',
    price: 1500,
    description: 'Hearty northern pounded rice paired with baobab leaf soup and tender beef chunks.',
    icon: '🍲',
    effects: { energy: 45, health: 20 },
  },
  {
    id: 'masa_taushe',
    name: 'Hot Masa & Miyan Taushe',
    category: 'food',
    price: 1200,
    description: 'Golden fermented rice cakes served with spiced pumpkin and groundnut vegetable soup.',
    icon: '🥞',
    effects: { energy: 30, health: 10, mutunci: 2 },
  },
  {
    id: 'zobo_drink',
    name: 'Zobo & Ginger Pitcher',
    category: 'food',
    price: 600,
    description: 'Tart hibiscus flower iced infusion steeped with cloves and hot northern ginger.',
    icon: '🧃',
    effects: { energy: 15, health: 15 },
  },

  // --- HOME FURNISHINGS (3D ROOM) ---
  {
    id: 'persian_rug',
    name: 'Emirate Woven Floor Rug',
    category: 'decor',
    price: 45000,
    description: 'Handcrafted crimson and gold geometric floor carpet. Renders directly in your 3D bedroom.',
    icon: '🧶',
    effects: { mutunci: 12 },
  },
  {
    id: 'rechargeable_fan',
    name: 'Solar Rechargeable Standing Fan',
    category: 'decor',
    price: 32000,
    description: 'High-speed standing fan that keeps air moving even during Dutse power cuts. Renders in 3D.',
    icon: '🌀',
    effects: { mutunci: 6, health: 10 },
  },

  // --- TECH & ENERGY ---
  {
    id: 'solar_inverter',
    name: 'Hybrid Solar Inverter Unit',
    category: 'tech',
    price: 165000,
    description: 'Wall-mounted lithium solar inverter. Provides continuous electricity for home tech gigs. Renders in 3D.',
    icon: '⚡',
    effects: { mutunci: 18, health: 10 },
  },

  // --- MOBILITY & COMMERCE VEHICLES ---
  {
    id: 'bajaj_motorcycle',
    name: 'Bajaj Boxer 150cc Motorcycle',
    category: 'vehicles',
    price: 380000,
    description: 'Reliable two-wheeler equipped with side cargo panniers. Boosts commodity capacity to 25 units and cuts travel fatigue. Renders in courtyard!',
    icon: '🏍️',
    effects: { mutunci: 15 },
  },
  {
    id: 'toyota_pickup',
    name: 'Toyota Hilux Commercial Pickup',
    category: 'vehicles',
    price: 2400000,
    description: 'Heavy-duty savannah transporter with 100-bag commodity capacity. The ultimate grain trader vehicle.',
    icon: '🛻',
    effects: { mutunci: 35 },
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'food' | 'decor' | 'tech' | 'vehicles'>('all');
  const { naira, ownedFurnishings, equippedVehicle, buyShopItem } = useGameStore();
  const { playCash, playClick, playWarning } = useSoundFX();

  if (!isOpen) return null;

  const filteredItems =
    activeCategory === 'all'
      ? SHOP_ITEMS
      : SHOP_ITEMS.filter((item) => item.category === activeCategory);

  const handleBuy = (item: ShopItem) => {
    const res = buyShopItem(item);
    if (res.success) {
      playCash();
    } else {
      playWarning();
    }
  };

  const isItemOwned = (item: ShopItem) => {
    if (item.category === 'vehicles') {
      return equippedVehicle === item.id;
    }
    if (item.category === 'decor' || item.category === 'tech') {
      return ownedFurnishings.includes(item.id);
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md font-sans">
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="relative w-full max-w-xl bg-[#0c121e] border-2 border-amber-500/30 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-[#064E3B]/30 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">JIGAWA EMPORIUM & SUK</h2>
              <p className="text-xs text-white/60">
                Wallet Balance:{' '}
                <span className="text-emerald-400 font-mono font-bold">
                  ₦{naira.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10 text-xs font-bold bg-black/30 overflow-x-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'food', label: 'Food & Bukka' },
            { id: 'decor', label: 'Furnishings' },
            { id: 'tech', label: 'Solar & Tech' },
            { id: 'vehicles', label: 'Transport' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playClick();
                setActiveCategory(tab.id as any);
              }}
              className={`py-3 px-4 border-b-2 whitespace-nowrap transition ${
                activeCategory === tab.id
                  ? 'border-amber-400 text-amber-300 bg-amber-950/20'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Catalog Items List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filteredItems.map((item) => {
            const owned = isItemOwned(item);
            const canAfford = naira >= item.price;

            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  owned
                    ? 'bg-[#151e2e]/60 border-white/5 opacity-75'
                    : 'bg-[#151e2e] border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white">{item.name}</h3>
                      {owned && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Owned
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/50 max-w-sm mt-0.5 leading-snug">
                      {item.description}
                    </p>
                    {/* Stat Badges */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-bold">
                      {item.effects.energy && (
                        <span className="text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                          +{item.effects.energy} Energy
                        </span>
                      )}
                      {item.effects.health && (
                        <span className="text-rose-400 bg-rose-400/10 px-1.5 py-0.5 rounded">
                          +{item.effects.health} Health
                        </span>
                      )}
                      {item.effects.mutunci && (
                        <span className="text-purple-300 bg-purple-400/10 px-1.5 py-0.5 rounded">
                          +{item.effects.mutunci} Mutunci
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price & Buy Action */}
                <div className="text-right shrink-0">
                  <span className="block text-xs sm:text-sm font-mono font-bold text-emerald-300 mb-1">
                    ₦{item.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={owned || !canAfford}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                      owned
                        ? 'bg-white/10 text-white/40 cursor-not-allowed'
                        : canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {owned ? 'In Room' : canAfford ? 'Buy' : 'Need Cash'}
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
