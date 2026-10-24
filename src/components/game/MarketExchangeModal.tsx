'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import { COMMODITIES, VEHICLES } from '@/data/commodities';
import locationsRaw from '@/data/locations.json';
import {
  X,
  TrendingUp,
  Package,
  Truck,
  ArrowRightLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { CommodityId, GameLocation } from '@/types/game';

interface MarketExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShopForVehicle?: () => void;
}

export const MarketExchangeModal: React.FC<MarketExchangeModalProps> = ({
  isOpen,
  onClose,
  onOpenShopForVehicle,
}) => {
  const {
    naira,
    currentLocation,
    commoditiesInventory,
    equippedVehicle,
    buyCommodity,
    sellCommodity,
    getCommodityMarketPrice,
    getEmirateTitle,
  } = useGameStore();

  const { playClick, playCash, playWarning } = useSoundFX();

  const [selectedCommodityId, setSelectedCommodityId] = useState<CommodityId>('sesame_grain');
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);
  const [tradeMode, setTradeMode] = useState<'buy' | 'sell'>('buy');

  if (!isOpen) return null;

  const locations = locationsRaw as GameLocation[];
  const curLoc = locations.find((l) => l.id === currentLocation) || locations[0];
  const vehicle = VEHICLES[equippedVehicle] || VEHICLES.none;
  const title = getEmirateTitle();

  const selectedCommodity =
    COMMODITIES.find((c) => c.id === selectedCommodityId) || COMMODITIES[0];

  const currentUnitPrice = getCommodityMarketPrice(selectedCommodity.id, currentLocation);
  const currentStock = commoditiesInventory[selectedCommodity.id] || 0;

  // Calculate current cargo usage
  const totalCargoUsed = Object.values(commoditiesInventory).reduce((acc, count) => acc + count, 0);
  const remainingCargo = Math.max(0, vehicle.cargoCapacity - totalCargoUsed);

  // Maximum buyable units
  const maxBuyableUnits = Math.min(
    Math.floor(naira / currentUnitPrice),
    remainingCargo
  );

  const totalCostOrPayout = currentUnitPrice * tradeQuantity;

  const handleExecuteTrade = () => {
    if (tradeMode === 'buy') {
      const res = buyCommodity(selectedCommodity.id, tradeQuantity);
      if (res.success) {
        playCash();
      } else {
        playWarning();
      }
    } else {
      const res = sellCommodity(selectedCommodity.id, tradeQuantity);
      if (res.success) {
        playCash();
      } else {
        playWarning();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md font-sans">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-[#0c121e] border-2 border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden max-h-[92vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#064E3B]/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide text-white">
                  REGIONAL COMMODITY EXCHANGE
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {curLoc.name} Market
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Buy low at harvest source, transport, and sell high across Jigawa districts.
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

        {/* Transport Cargo Capacity Bar */}
        <div className="px-5 py-3 bg-[#111827] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-xl">{vehicle.icon}</span>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>{vehicle.name}</span>
                <span className="text-white/40">·</span>
                <span className="text-emerald-400 font-mono">
                  {totalCargoUsed} / {vehicle.cargoCapacity} units loaded
                </span>
              </div>
              <div className="w-36 sm:w-48 h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalCargoUsed >= vehicle.cargoCapacity ? 'bg-rose-500' : 'bg-emerald-400'
                  }`}
                  style={{
                    width: `${Math.min(100, (totalCargoUsed / vehicle.cargoCapacity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {vehicle.id === 'none' && onOpenShopForVehicle && (
              <button
                onClick={() => {
                  playClick();
                  onOpenShopForVehicle();
                }}
                className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1"
              >
                <Truck className="w-3 h-3" />
                <span>Buy Motorcycle/Truck</span>
              </button>
            )}
            <div className="bg-emerald-950/70 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono font-bold text-emerald-300">
              ₦{naira.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Column: Commodities List (5 cols) */}
          <div className="md:col-span-5 space-y-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/50 block mb-1">
              Savannah Commodities
            </span>
            {COMMODITIES.map((commodity) => {
              const price = getCommodityMarketPrice(commodity.id, currentLocation);
              const isSelected = selectedCommodityId === commodity.id;
              const inventoryCount = commoditiesInventory[commodity.id] || 0;
              const isOrigin = commodity.baseLocation === currentLocation;

              return (
                <button
                  key={commodity.id}
                  onClick={() => {
                    playClick();
                    setSelectedCommodityId(commodity.id);
                    setTradeQuantity(1);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg'
                      : 'bg-[#151e2e] border-white/10 text-white/70 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{commodity.icon}</span>
                    <div>
                      <span className="block text-xs font-bold text-white">{commodity.name}</span>
                      <span className="block text-[10px] text-white/50">{commodity.hausaName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-mono font-bold text-emerald-300">
                      ₦{price.toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-white/40">
                      Owned: {inventoryCount} {commodity.unit}s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Terminal & Order Form (7 cols) */}
          <div className="md:col-span-7 bg-[#151e2e] border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              {/* Active Commodity Details */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl">
                    {selectedCommodity.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{selectedCommodity.name}</h3>
                    <p className="text-[11px] text-white/50">{selectedCommodity.description}</p>
                  </div>
                </div>
              </div>

              {/* Trade Mode Toggle (Buy vs Sell) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    playClick();
                    setTradeMode('buy');
                    setTradeQuantity(1);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    tradeMode === 'buy'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span>Buy (Stock Up)</span>
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setTradeMode('sell');
                    setTradeQuantity(Math.min(1, currentStock));
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    tradeMode === 'sell'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  <span>Sell (Cash Out)</span>
                </button>
              </div>

              {/* Price & Profit Information */}
              <div className="bg-black/30 rounded-xl p-3 space-y-2 text-xs border border-white/5 mb-4 font-mono">
                <div className="flex justify-between text-white/70">
                  <span>Unit Price in {curLoc.name}:</span>
                  <span className="font-bold text-white">₦{currentUnitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>In Your Cargo:</span>
                  <span className="font-bold text-emerald-400">
                    {currentStock} {selectedCommodity.unit}s
                  </span>
                </div>
                {title.id !== 'talaka' && tradeMode === 'sell' && (
                  <div className="flex justify-between text-emerald-400 text-[11px]">
                    <span>Emirate Title Merchant Bonus:</span>
                    <span className="font-bold">+5% Payout</span>
                  </div>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs font-bold text-white/80">
                  <span>Quantity ({selectedCommodity.unit}s)</span>
                  <div className="flex gap-1.5">
                    {[1, 5, 10].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => {
                          playClick();
                          setTradeQuantity(qty);
                        }}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white/80"
                      >
                        +{qty}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        playClick();
                        setTradeQuantity(tradeMode === 'buy' ? Math.max(1, maxBuyableUnits) : currentStock);
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playClick();
                      setTradeQuantity(Math.max(1, tradeQuantity - 1));
                    }}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-black/40 border border-white/20 rounded-xl py-2 px-3 text-center font-mono font-bold text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => {
                      playClick();
                      setTradeQuantity(tradeQuantity + 1);
                    }}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total & Action Button */}
            <div className="border-t border-white/10 pt-3 mt-2">
              <div className="flex justify-between items-center text-xs mb-3 font-mono">
                <span className="text-white/60">Total {tradeMode === 'buy' ? 'Investment' : 'Proceeds'}:</span>
                <span className="text-base font-black text-emerald-400">
                  ₦{totalCostOrPayout.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleExecuteTrade}
                disabled={
                  tradeMode === 'buy'
                    ? naira < totalCostOrPayout || tradeQuantity > remainingCargo || tradeQuantity <= 0
                    : currentStock < tradeQuantity || tradeQuantity <= 0
                }
                className={`w-full py-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 shadow-lg ${
                  tradeMode === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-[#064E3B] disabled:bg-gray-700 disabled:text-white/40'
                    : 'bg-amber-500 hover:bg-amber-400 text-black disabled:bg-gray-700 disabled:text-white/40'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  {tradeMode === 'buy'
                    ? `Confirm Purchase (${tradeQuantity} ${selectedCommodity.unit}s)`
                    : `Finalize Sale (+₦${totalCostOrPayout.toLocaleString()})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
