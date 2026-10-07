'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { X, ShoppingBag } from 'lucide-react';
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '86vh',
          backgroundColor: '#111827',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>Jigawa Emporium & Bukka</h2>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', margin: '2px 0 0 0' }}>
                Wallet Balance:{' '}
                <span style={{ color: '#34d399', fontWeight: 'bold', fontFamily: 'monospace' }}>
                  ₦{naira.toLocaleString()}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Categories Tab */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          {(['all', 'food', 'decor', 'wellness'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playClick();
                setActiveCategory(cat);
              }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                textTransform: 'capitalize',
                fontSize: '0.75rem',
                fontWeight: activeCategory === cat ? 800 : 600,
                backgroundColor: activeCategory === cat ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                color: activeCategory === cat ? '#000000' : 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {filteredItems.map((item) => {
            const canAfford = naira >= item.price;
            return (
              <div
                key={item.id}
                style={{
                  padding: '0.85rem',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        padding: '0.25rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '10px',
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 800, color: '#fcd34d' }}>
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0.5rem 0 0 0' }}>{item.name}</h3>
                  <p
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      margin: '0.25rem 0 0 0',
                      lineHeight: 1.35,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.35rem', fontSize: '0.65rem', fontWeight: 700 }}>
                    {item.effects.energy && <span style={{ color: '#facc15' }}>+{item.effects.energy}⚡</span>}
                    {item.effects.health && <span style={{ color: '#fb7185' }}>+{item.effects.health}❤️</span>}
                    {item.effects.mutunci && <span style={{ color: '#c084fc' }}>+{item.effects.mutunci}👑</span>}
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => buyItem(item)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: canAfford ? '#064e3b' : 'rgba(255, 255, 255, 0.08)',
                      color: canAfford ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      transition: 'background 0.2s',
                    }}
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
