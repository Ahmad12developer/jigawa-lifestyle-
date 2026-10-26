'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSoundFX } from '@/hooks/useSoundFX';
import locationsDataRaw from '@/data/locations.json';
import jobsDataRaw from '@/data/jobs.json';
import { COMMODITIES } from '@/data/commodities';
import {
  X,
  Briefcase,
  Wallet,
  Navigation,
  Bed,
  Utensils,
  Battery,
  Clock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Radio,
  Sun,
  TrendingUp,
  Send,
  Smartphone,
  Wifi,
  PhoneCall,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  User,
  Hash,
  Award,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameLocation, Job } from '@/types/game';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMapLocation?: (locId: string) => void;
  openDataProtection?: () => void;
}

type PhoneApp =
  | 'home'
  | 'wallet'
  | 'chat'
  | 'jobs'
  | 'market'
  | 'travel'
  | 'weather'
  | 'radio'
  | 'lifestyle'
  | 'settings';

type Wallpaper = 'sunset' | 'durbar' | 'savanna' | 'cyber';

interface ChatMessage {
  id: string;
  sender: 'npc' | 'player';
  text: string;
  time: string;
}

interface NPCContact {
  id: string;
  name: string;
  role: string;
  avatarEmoji: string;
  status: string;
  online: boolean;
  initialMessage: string;
  responses: {
    label: string;
    reply: string;
    rewardType?: 'money' | 'mutunci' | 'health' | 'energy' | 'tip';
    rewardVal?: number;
    tipMsg?: string;
  }[];
}

const NPC_CONTACTS: NPCContact[] = [
  {
    id: 'bello',
    name: 'Alhaji Bello',
    role: 'Sesame & Grain Merchant · Kasuwar Dutse',
    avatarEmoji: '🌾',
    status: 'At Kasuwar Dutse grain depot',
    online: true,
    initialMessage:
      'Sannu aboki! Prices for sesame seed are rising with buyers arriving from Kano. Check the market board before you sell!',
    responses: [
      {
        label: 'Nagode Alhaji! What about the sorghum harvest?',
        reply: 'Sorghum is abundant this season. Buy low now at Kasuwar Dutse and transport it when regional demand peaks!',
        rewardType: 'mutunci',
        rewardVal: 6,
      },
      {
        label: 'Can I invest in your export shipment?',
        reply: 'Masha Allah! Your business mindset is sharp. Here is a small commission advance for your partnership.',
        rewardType: 'money',
        rewardVal: 15000,
      },
    ],
  },
  {
    id: 'amina',
    name: 'Dr. Amina Shekoni',
    role: 'Chief Medical Officer · RSFUTH Teaching Hospital',
    avatarEmoji: '🏥',
    status: 'In Consultation · Surgery Ward',
    online: true,
    initialMessage:
      'Good day! The Harmattan dust haze is heavy today. Keep hydrated with herbal ginger tea and take plenty of rest.',
    responses: [
      {
        label: 'Thank you doctor! Scheduling a wellness checkup.',
        reply: 'Wonderful! Prevention is better than cure. Drink clean water and stay energetic in the Sahel sun.',
        rewardType: 'health',
        rewardVal: 20,
      },
      {
        label: 'Are clinical assistants needed at the hospital?',
        reply: 'Yes! We have open clinical records and pharmacy dispensary slots. Apply directly through the Hustles app!',
        rewardType: 'energy',
        rewardVal: 15,
      },
    ],
  },
  {
    id: 'kabir',
    name: 'Mallam Kabir',
    role: 'FUD Lecturer & Tech Lead · ICT Innovation Hub',
    avatarEmoji: '🎓',
    status: 'Running Python & Solar Workshop',
    online: true,
    initialMessage:
      'Salaam! Jigawa ICT Hub has opened remote digital transcription and coding gigs. You can work them straight from your phone!',
    responses: [
      {
        label: 'I am ready for remote digital tasks!',
        reply: 'Excellent! Here is a freelance data-entry stipend to keep your 5G data bundle running.',
        rewardType: 'money',
        rewardVal: 12000,
      },
      {
        label: 'Any advice for university students?',
        reply: 'Consistency and honesty (Amana) are key. Learn a digital skill and maintain your Mutunci everywhere you go.',
        rewardType: 'mutunci',
        rewardVal: 8,
      },
    ],
  },
  {
    id: 'balarabe',
    name: 'Balarabe Dan-Keke',
    role: 'Tricycle Union Rep · Takur Roundabout',
    avatarEmoji: '🛺',
    status: 'Cruising Kiyawa Road · Dual Horn Ready',
    online: true,
    initialMessage:
      'Aboki! Sani Abacha Way is smooth today, no traffic delays. Peep-peep! Hit me up whenever you need quick transport.',
    responses: [
      {
        label: 'Save me a front seat on your Keke!',
        reply: 'Haha! Done! I gave you a 50% discount coupon for your next transit trip across Dutse.',
        rewardType: 'energy',
        rewardVal: 20,
      },
      {
        label: 'Any royal gossip from the Emir\'s Palace?',
        reply: 'The Palace royal horsemen are preparing for the upcoming Durbar celebration. The city will be magnificent!',
        rewardType: 'mutunci',
        rewardVal: 5,
      },
    ],
  },
];

export const PhoneModal: React.FC<PhoneModalProps> = ({
  isOpen,
  onClose,
  onSelectMapLocation,
  openDataProtection,
}) => {
  const [activeApp, setActiveApp] = useState<PhoneApp>('home');
  const [wallpaper, setWallpaper] = useState<Wallpaper>('sunset');
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedContact, setSelectedContact] = useState<NPCContact>(NPC_CONTACTS[0]);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({
    bello: [
      {
        id: '1',
        sender: 'npc',
        text: NPC_CONTACTS[0].initialMessage,
        time: '10:15 AM',
      },
    ],
    amina: [
      {
        id: '2',
        sender: 'npc',
        text: NPC_CONTACTS[1].initialMessage,
        time: '09:40 AM',
      },
    ],
    kabir: [
      {
        id: '3',
        sender: 'npc',
        text: NPC_CONTACTS[2].initialMessage,
        time: '11:05 AM',
      },
    ],
    balarabe: [
      {
        id: '4',
        sender: 'npc',
        text: NPC_CONTACTS[3].initialMessage,
        time: '08:20 AM',
      },
    ],
  });
  const [ussdInput, setUssdInput] = useState('');
  const [ussdFeedback, setUssdFeedback] = useState<string | null>(null);

  const {
    naira,
    mutunci,
    energy,
    health,
    day,
    hour,
    season,
    currentLocation,
    performJob,
    travel,
    rest,
    eatBukka,
    pray,
    logs,
    addNotice,
    addLog,
  } = useGameStore();

  const {
    playClick,
    playCash,
    playRest,
    playWarning,
    playSuccess,
    playMessageChime,
    playPhoneDial,
  } = useSoundFX();

  const locations = locationsDataRaw as GameLocation[];
  const jobs = jobsDataRaw as Job[];
  const curLoc = locations.find((l) => l.id === currentLocation) || locations[0];

  // Jobs available in current district
  const availableJobs = jobs.filter((j) => j.locationId === currentLocation);

  // Dynamic Island message
  const dynamicIslandText = `🎵 Radio Dutse 95.3 FM · ${season} Season`;

  // Remote digital freelance gigs (playable anywhere via 5G)
  const remoteGigs = [
    {
      id: 'remote_transcribe',
      title: 'Hausa & English Audio Transcription',
      company: 'Jigawa ICT Innovation Hub',
      payout: 16500,
      energyCost: 15,
      timeHours: 2,
      desc: 'Transcribe agricultural market radio broadcasts for international research datasets.',
    },
    {
      id: 'remote_data_entry',
      title: 'Kiyawa Agro-Census Data Verification',
      company: 'Ministry of Agriculture Digital Registry',
      payout: 14000,
      energyCost: 12,
      timeHours: 2,
      desc: 'Verify farmer cooperative crop returns and warehouse grain inventory entries.',
    },
    {
      id: 'remote_ecommerce_agent',
      title: 'Online Kasuwa WhatsApp Customer Agent',
      company: 'Dutse Commercial Plaza Group',
      payout: 18500,
      energyCost: 18,
      timeHours: 3,
      desc: 'Coordinate buyer deliveries for textile fabrics, solar power banks, and spices.',
    },
  ];

  const handleSendChatResponse = (
    contactId: string,
    replyText: string,
    rewardType?: string,
    rewardVal?: number
  ) => {
    playMessageChime();

    // Add player message
    const playerMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'player',
      text: replyText,
      time: `${hour.toString().padStart(2, '0')}:${Math.floor(Math.random() * 50 + 10)}`,
    };

    setChatHistory((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), playerMsg],
    }));

    // Grant reward if any
    if (rewardType === 'money' && rewardVal) {
      useGameStore.setState((s) => ({ naira: s.naira + rewardVal }));
      addNotice(`+₦${rewardVal.toLocaleString()} received via Kazaure Pay!`, 'positive');
      addLog({
        message: `DutseChat transfer from ${selectedContact.name}: +₦${rewardVal.toLocaleString()}`,
        type: 'event',
      });
      playCash();
    } else if (rewardType === 'mutunci' && rewardVal) {
      useGameStore.setState((s) => ({ mutunci: Math.min(100, s.mutunci + rewardVal) }));
      addNotice(`+${rewardVal} Mutunci gained from wise conversation!`, 'positive');
    } else if (rewardType === 'health' && rewardVal) {
      useGameStore.setState((s) => ({ health: Math.min(100, s.health + rewardVal) }));
      addNotice(`+${rewardVal}% Health restored via medical advice!`, 'positive');
    } else if (rewardType === 'energy' && rewardVal) {
      useGameStore.setState((s) => ({ energy: Math.min(100, s.energy + rewardVal) }));
      addNotice(`+${rewardVal}% Energy boosted!`, 'positive');
    }
  };

  const handleBuyAirtime = (amount: number, energyBoost: number) => {
    if (naira < amount) {
      playWarning();
      addNotice(`Insufficient funds for ₦${amount.toLocaleString()} airtime.`, 'negative');
      return;
    }
    playCash();
    useGameStore.setState((s) => ({
      naira: s.naira - amount,
      energy: Math.min(100, s.energy + energyBoost),
    }));
    addNotice(`Recharged ₦${amount.toLocaleString()} 5G bundle! +${energyBoost}% Energy`, 'positive');
    addLog({
      message: `Recharged MTN 5G Data Pack: -₦${amount.toLocaleString()}, +${energyBoost}% Energy`,
      type: 'info',
    });
  };

  const handleSendCharityMoney = (recipientName: string, amount: number, mutunciBoost: number) => {
    if (naira < amount) {
      playWarning();
      addNotice(`Insufficient funds to transfer ₦${amount.toLocaleString()}.`, 'negative');
      return;
    }
    playCash();
    useGameStore.setState((s) => ({
      naira: s.naira - amount,
      mutunci: Math.min(100, s.mutunci + mutunciBoost),
    }));
    addNotice(`Transferred ₦${amount.toLocaleString()} to ${recipientName}. +${mutunciBoost} Mutunci!`, 'positive');
    addLog({
      message: `Kazaure Pay instant transfer to ${recipientName}: -₦${amount.toLocaleString()} (+${mutunciBoost} Mutunci)`,
      type: 'info',
    });
  };

  const handleExecuteUSSD = (code: string) => {
    playPhoneDial();
    if (code === '*966#' || code === '*556#') {
      setUssdFeedback(`[KAZAURE MFB] Acct: 012894721 · Bal: ₦${naira.toLocaleString()} · Mutunci: ${mutunci}/100. Dial *894*99# for overdraft.`);
    } else if (code === '*312#') {
      setUssdFeedback(`[MTN JIGAWA 5G] Active Data: 8.4GB High-Speed 5G remaining · Valid 30 days.`);
    } else if (code === '*894*99#') {
      if (naira < 15000) {
        useGameStore.setState((s) => ({ naira: s.naira + 25000 }));
        playCash();
        setUssdFeedback(`[LOAN APPROVED] ₦25,000 emergency overdraft credited to your virtual wallet!`);
        addNotice('+₦25,000 emergency micro-loan credited!', 'positive');
      } else {
        setUssdFeedback(`[KAZAURE MFB] Your current liquidity is healthy (₦${naira.toLocaleString()}). No emergency overdraft needed.`);
      }
    } else {
      setUssdFeedback(`Invalid USSD code: "${code}". Try *966# (Bank), *312# (Data), or *894*99# (Overdraft).`);
    }
  };

  if (!isOpen) return null;

  // Background styling based on active wallpaper
  const wallpaperClass =
    wallpaper === 'sunset'
      ? 'from-[#3b122d] via-[#1a0b2e] to-[#0a0518]'
      : wallpaper === 'durbar'
      ? 'from-[#450a0a] via-[#1f0707] to-[#0c0303]'
      : wallpaper === 'savanna'
      ? 'from-[#064e3b] via-[#022c22] to-[#04130f]'
      : 'from-[#030712] via-[#0f172a] to-[#020617]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.88, y: 40, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.88, y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="relative w-full max-w-[390px] h-[720px] max-h-[94vh] bg-[#030712] rounded-[48px] border-[7px] border-[#334155] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.9),0_0_0_2px_rgba(255,255,255,0.1)] overflow-hidden flex flex-col text-white font-sans select-none"
      >
        {/* Phone Side Buttons Illusion */}
        <div className="absolute -left-[9px] top-28 w-[3px] h-10 bg-slate-600 rounded-l-sm" />
        <div className="absolute -left-[9px] top-42 w-[3px] h-10 bg-slate-600 rounded-l-sm" />
        <div className="absolute -right-[9px] top-32 w-[3px] h-14 bg-slate-600 rounded-r-sm" />

        {/* 1. TOP NOTCH & INTERACTIVE DYNAMIC ISLAND */}
        <div className="relative pt-3 pb-2 px-6 flex items-center justify-between text-xs text-white/80 border-b border-white/5 bg-black/40">
          <span className="font-mono text-[12px] font-bold tracking-tight">
            {hour.toString().padStart(2, '0')}:00
          </span>

          {/* Dynamic Island Capsule */}
          <div
            onClick={() => {
              playClick();
              setIsDynamicIslandExpanded(!isDynamicIslandExpanded);
            }}
            className="cursor-pointer px-3 py-1 bg-black rounded-full border border-white/10 flex items-center gap-2 hover:border-emerald-500/40 transition shadow-inner"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-300 max-w-[130px] truncate">
              {dynamicIslandExpandedText(activeApp, season, curLoc.name)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Wifi className="w-3.5 h-3.5 text-white/80" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] font-mono text-white/60">{energy}%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Expandable Dynamic Island Modal Strip */}
        <AnimatePresence>
          {isDynamicIslandExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-black/90 border-b border-white/10 px-4 py-2.5 flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
                <div>
                  <div className="font-bold text-white">Radio Dutse 95.3 FM</div>
                  <div className="text-[10px] text-white/50">{season} Sahel Vibes · 320kbps</div>
                </div>
              </div>
              <button
                onClick={() => {
                  playClick();
                  setActiveApp('radio');
                  setIsDynamicIslandExpanded(false);
                }}
                className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold hover:bg-emerald-500/30 text-[10px]"
              >
                Open Player
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2. APP HEADER BAR */}
        <div className="px-5 py-2.5 flex items-center justify-between border-b border-white/5 bg-white/[0.03]">
          <div className="flex items-center gap-2">
            {activeApp !== 'home' ? (
              <button
                onClick={() => {
                  playClick();
                  setActiveApp('home');
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full"
              >
                ← Home
              </button>
            ) : (
              <span className="text-xs font-black tracking-wider uppercase text-white/90 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Dutse Smart Pro
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/50">JigawaOS 3.0</span>
            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition"
              title="Close Phone"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. PHONE CONTENT SCREEN (SCROLLABLE APPS) */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b ${wallpaperClass}`}>
          <AnimatePresence mode="wait">
            {/* === 1. HOME SCREEN === */}
            {activeApp === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Hausa Time & Greeting Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      {getHausaGreeting(hour)}!
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Day {day} · {season}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-white/50 block">Liquid Wealth</span>
                      <div className="text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                        {hideBalance ? '₦••••••••' : `₦${naira.toLocaleString()}`}
                        <button
                          onClick={() => {
                            playClick();
                            setHideBalance(!hideBalance);
                          }}
                          className="text-[10px] text-white/40 hover:text-white"
                        >
                          {hideBalance ? 'Show' : 'Hide'}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/50 block">Current Hub</span>
                      <span className="text-xs font-bold text-amber-300 max-w-[120px] truncate block">
                        {curLoc.name.split(' ')[0]} {curLoc.name.split(' ')[1] || ''}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Gauges */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                    <div className="bg-white/5 rounded-2xl p-1.5">
                      <span className="text-[9px] text-white/50 block">Mutunci</span>
                      <span className="font-bold text-amber-300 text-xs">{mutunci}/100</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-1.5">
                      <span className="text-[9px] text-white/50 block">Energy</span>
                      <span className="font-bold text-emerald-300 text-xs">{energy}%</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-1.5">
                      <span className="text-[9px] text-white/50 block">Health</span>
                      <span className="font-bold text-rose-300 text-xs">{health}%</span>
                    </div>
                  </div>
                </div>

                {/* 8 Flagship Apps Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                      Applications
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">8 Installed</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    {/* App 1: Kazaure Pay */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('wallet');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">KazaurePay</span>
                    </button>

                    {/* App 2: DutseChat */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('chat');
                      }}
                      className="flex flex-col items-center gap-1 group relative"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-green-950/50 group-hover:scale-105 transition">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div className="absolute top-0 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border-2 border-black">
                        3
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">DutseChat</span>
                    </button>

                    {/* App 3: Hustles & Gigs */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('jobs');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-950/50 group-hover:scale-105 transition">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">Hustles</span>
                    </button>

                    {/* App 4: KasuwaPulse Market */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('market');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-950/50 group-hover:scale-105 transition">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">KasuwaPulse</span>
                    </button>

                    {/* App 5: Transit & Commute */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('travel');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/50 group-hover:scale-105 transition">
                        <Navigation className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">Transit</span>
                    </button>

                    {/* App 6: Prayer & Weather */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('weather');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-sky-950/50 group-hover:scale-105 transition">
                        <Sun className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">Weather</span>
                    </button>

                    {/* App 7: Sahel Radio */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('radio');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50 group-hover:scale-105 transition">
                        <Radio className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">Radio</span>
                    </button>

                    {/* App 8: Rest & Lodging */}
                    <button
                      onClick={() => {
                        playClick();
                        setActiveApp('lifestyle');
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-950/50 group-hover:scale-105 transition">
                        <Bed className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold text-white/90">Lodging</span>
                    </button>
                  </div>
                </div>

                {/* Quick Street Actions */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                    Quick Street Actions
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const res = eatBukka();
                        if (res.success) playCash();
                        else playWarning();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2.5 text-left transition"
                    >
                      <Utensils className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Eat Bukka</div>
                        <div className="text-[10px] text-white/50">-₦800 · +15 Hlt</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const res = pray();
                        if (res.success) playClick();
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2.5 text-left transition"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-white">Pray & Reflect</div>
                        <div className="text-[10px] text-white/50">+3 Mutunci</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Privacy & Wallpaper Switcher Bar */}
                <div className="flex items-center justify-between pt-1 px-1">
                  <div className="flex items-center gap-1 text-[10px] text-white/50">
                    <span>Wallpaper:</span>
                    {(['sunset', 'durbar', 'savanna', 'cyber'] as Wallpaper[]).map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          playClick();
                          setWallpaper(w);
                        }}
                        className={`capitalize px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          wallpaper === w ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      playClick();
                      onClose();
                      openDataProtection?.();
                    }}
                    className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    NDPA 2023
                  </button>
                </div>
              </motion.div>
            )}

            {/* === 2. WALLET & KAZAURE PAY APP === */}
            {activeApp === 'wallet' && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Virtual Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-emerald-800 via-teal-900 to-slate-900 border border-emerald-400/30 text-white shadow-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                      Kazaure Microfinance Bank (Dutse Branch)
                    </span>
                    <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-emerald-300">
                      Tier 3 Verified
                    </span>
                  </div>
                  <div className="text-3xl font-mono font-black my-1">
                    ₦{naira.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-200/80 pt-2 border-t border-emerald-500/20">
                    <span>Acct: 0128947219</span>
                    <span>Daily Yield: +0.2%</span>
                  </div>
                </div>

                {/* Quick Transfer & Airtime Buttons */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                    Mobile Banking Actions
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleBuyAirtime(1000, 20)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
                    >
                      <Zap className="w-4 h-4 text-emerald-400 mb-1" />
                      <div className="text-xs font-bold text-white">Buy 5G Airtime</div>
                      <div className="text-[10px] text-white/50">-₦1,000 · +20% Energy</div>
                    </button>

                    <button
                      onClick={() => handleSendCharityMoney('Dutse Orphanage & Hospital Charity', 5000, 12)}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
                    >
                      <ArrowUpRight className="w-4 h-4 text-amber-400 mb-1" />
                      <div className="text-xs font-bold text-white">Hospital Charity</div>
                      <div className="text-[10px] text-white/50">-₦5,000 · +12 Mutunci</div>
                    </button>
                  </div>
                </div>

                {/* USSD Simulator */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      USSD Banking Dialpad
                    </span>
                    <span className="text-[10px] text-white/40">*966# or *894*99#</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. *966# or *894*99#"
                      value={ussdInput}
                      onChange={(e) => setUssdInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleExecuteUSSD(ussdInput)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-black"
                    >
                      Dial
                    </button>
                  </div>

                  {ussdFeedback && (
                    <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-200 font-mono">
                      {ussdFeedback}
                    </div>
                  )}
                </div>

                {/* Statement Log */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                    Recent Statement Log
                  </span>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {logs.slice(0, 12).map((log) => (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium text-white/90 line-clamp-1">{log.message}</div>
                          <div className="text-[10px] text-white/40">
                            Day {log.day} · {log.hour}:00
                          </div>
                        </div>
                        {log.nairaChange !== undefined && log.nairaChange !== 0 && (
                          <span
                            className={`font-mono font-bold text-xs shrink-0 ${
                              log.nairaChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {log.nairaChange > 0 ? '+' : ''}₦{log.nairaChange.toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === 3. DUTSECHAT MESSENGER APP === */}
            {activeApp === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {/* Contact Selector Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {NPC_CONTACTS.map((c) => {
                    const isSel = selectedContact.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          playClick();
                          setSelectedContact(c);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                          isSel
                            ? 'bg-emerald-500 text-black shadow-md'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        <span>{c.avatarEmoji}</span>
                        <span>{c.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Chat Header */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
                      {selectedContact.avatarEmoji}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{selectedContact.name}</div>
                      <div className="text-[10px] text-emerald-400">{selectedContact.role}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
                </div>

                {/* Chat Messages Stream */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {(chatHistory[selectedContact.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'player' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'player'
                            ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                            : 'bg-[#182234] text-white/90 border border-white/10 rounded-bl-none shadow-md'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-white/40 mt-0.5 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Dialogue Choices */}
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                    Suggested Replies:
                  </span>
                  <div className="space-y-1.5">
                    {selectedContact.responses.map((resp, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleSendChatResponse(
                            selectedContact.id,
                            resp.label,
                            resp.rewardType,
                            resp.rewardVal
                          )
                        }
                        className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 text-xs text-white/90 transition flex items-center justify-between group"
                      >
                        <span className="line-clamp-1">{resp.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-400 opacity-60 group-hover:opacity-100 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === 4. HUSTLES & GIGS APP === */}
            {activeApp === 'jobs' && (
              <motion.div
                key="jobs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-sm font-black text-white">Gigs in {curLoc.name}</h3>
                    <p className="text-[10px] text-white/50">{availableJobs.length} local opportunities</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Energy: {energy}%
                  </span>
                </div>

                {/* Local District Jobs */}
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {availableJobs.map((job) => {
                    const canAfford = energy >= job.energyCost;
                    return (
                      <div
                        key={job.id}
                        className="p-3 rounded-2xl bg-[#141d2d] border border-white/10 hover:border-emerald-500/40 transition space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-white">{job.title}</h4>
                            <p className="text-[10px] text-white/60 line-clamp-1">{job.description}</p>
                          </div>
                          <span className="font-mono font-black text-xs text-emerald-400 shrink-0">
                            +₦{job.payoutNaira.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                          <div className="flex items-center gap-2.5 text-white/60 text-[10px]">
                            <span className="text-yellow-400">-{job.energyCost}% Nrg</span>
                            <span className="text-sky-300">+{job.timeHours}h</span>
                            {job.mutunciChange !== 0 && (
                              <span className={job.mutunciChange > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                {job.mutunciChange > 0 ? '+' : ''}{job.mutunciChange} Mut
                              </span>
                            )}
                          </div>

                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              const result = performJob(job);
                              if (result.success) playCash();
                              else playWarning();
                            }}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                              canAfford
                                ? 'bg-[#064E3B] hover:bg-[#047857] text-emerald-100 shadow-md'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            Work Gig
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Remote Digital Gigs Section */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[10px] font-bold text-white/60 uppercase tracking-wider px-1">
                    <span>Remote 5G Tech Tasks</span>
                    <span className="text-emerald-400 font-bold">Anywhere in Jigawa</span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {remoteGigs.map((rg) => (
                      <div
                        key={rg.id}
                        className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{rg.title}</div>
                          <div className="text-[10px] text-indigo-300/80">{rg.company}</div>
                          <div className="text-[10px] text-white/50">-{rg.energyCost}% Nrg · +{rg.timeHours}h</div>
                        </div>

                        <button
                          disabled={energy < rg.energyCost}
                          onClick={() => {
                            if (energy >= rg.energyCost) {
                              useGameStore.setState((s) => ({
                                naira: s.naira + rg.payout,
                                energy: Math.max(0, s.energy - rg.energyCost),
                                hour: (s.hour + rg.timeHours) % 24,
                              }));
                              playCash();
                              addNotice(`Completed ${rg.title}! +₦${rg.payout.toLocaleString()}`, 'positive');
                              addLog({
                                message: `Remote 5G Gig completed: ${rg.title} (+₦${rg.payout.toLocaleString()})`,
                                type: 'job',
                              });
                            } else {
                              playWarning();
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                            energy >= rg.energyCost
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                              : 'bg-white/10 text-white/30 cursor-not-allowed'
                          }`}
                        >
                          +₦{rg.payout.toLocaleString()}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* === 5. KASUWAPULSE COMMODITY MARKET APP === */}
            {activeApp === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-sm font-black text-white">KasuwaPulse Market Ticker</h3>
                    <p className="text-[10px] text-white/50">Live regional commodity arbitrage prices</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Live Rates
                  </span>
                </div>

                {/* Parallel FX Card */}
                <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-around text-center text-xs">
                  <div>
                    <span className="text-[9px] text-white/40 block">USD / NGN</span>
                    <span className="font-mono font-bold text-emerald-400">₦1,580 ▲</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <span className="text-[9px] text-white/40 block">EUR / NGN</span>
                    <span className="font-mono font-bold text-sky-400">₦1,720 ▲</span>
                  </div>
                  <div className="w-px h-6 bg-white/10" />
                  <div>
                    <span className="text-[9px] text-white/40 block">CFA / NGN</span>
                    <span className="font-mono font-bold text-amber-400">₦2.62 ▼</span>
                  </div>
                </div>

                {/* Commodity Tickers */}
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {COMMODITIES.map((c) => {
                    const priceInCur = useGameStore
                      .getState()
                      .getCommodityMarketPrice(c.id, currentLocation);
                    const diff = priceInCur - c.basePrice;
                    const pct = ((diff / c.basePrice) * 100).toFixed(1);

                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-[#141d2d] border border-white/10 hover:border-white/20 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{c.icon}</span>
                            <div>
                              <div className="text-xs font-bold text-white">{c.name}</div>
                              <div className="text-[10px] text-white/50">{c.hausaName} · per {c.unit}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-mono font-black text-xs text-white">
                              ₦{priceInCur.toLocaleString()}
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {diff >= 0 ? '▲ +' : '▼ '}
                              {pct}%
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-white/60 bg-white/5 p-2 rounded-xl">
                          💡 <span className="font-bold text-white/80">Arbitrage Tip:</span> {c.description}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* === 6. TRANSIT & COMMUTE APP === */}
            {activeApp === 'travel' && (
              <motion.div
                key="travel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-sm font-black text-white">Dutse Metro Transit</h3>
                    <p className="text-[10px] text-white/50">Current Station: {curLoc.name}</p>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {locations.length} Hubs
                  </span>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {locations.map((loc) => {
                    const isHere = loc.id === currentLocation;
                    const canAfford = naira >= loc.travelCost;
                    return (
                      <div
                        key={loc.id}
                        className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                          isHere
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                            : 'bg-[#141d2d] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{loc.name}</span>
                            {isHere && (
                              <span className="text-[9px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.2 rounded-full">
                                Here
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/50">{loc.zone}</div>
                        </div>

                        {!isHere && (
                          <button
                            disabled={!canAfford}
                            onClick={() => {
                              const res = travel(loc);
                              if (res.success) {
                                playCash();
                                onSelectMapLocation?.(loc.id);
                              } else {
                                playWarning();
                              }
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 shrink-0 ${
                              canAfford
                                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                                : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }`}
                          >
                            <span>₦{loc.travelCost.toLocaleString()}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* === 7. PRAYER & WEATHER APP === */}
            {activeApp === 'weather' && (
              <motion.div
                key="weather"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {/* Weather Forecast Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-tr from-sky-900 to-indigo-900 border border-sky-400/30 text-white space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-sky-200">
                      Sahelian Meteorology · Dutse Station
                    </span>
                    <span className="text-[10px] bg-sky-500/20 px-2 py-0.5 rounded-full font-bold text-sky-300">
                      {season} Season
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-black font-mono">
                        {season === 'Harmattan' ? '24°C' : season === 'Dry' ? '38°C' : '29°C'}
                      </div>
                      <div className="text-xs text-sky-200">
                        {season === 'Harmattan'
                          ? 'Golden Harmattan Dust Haze'
                          : season === 'Dry'
                          ? 'Bright Savanna Sun'
                          : 'Refreshing Monsoon Downpour'}
                      </div>
                    </div>
                    <Sun className="w-10 h-10 text-yellow-400 animate-spin" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-sky-400/20 text-[10px] text-sky-200/80 text-center">
                    <div>Humidity: {season === 'Rainy' ? '74%' : '22%'}</div>
                    <div>Wind: NE 16 km/h</div>
                    <div>UV Index: 8 High</div>
                  </div>
                </div>

                {/* Islamic Prayer Timetable */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white px-1">
                    <span>Islamic Prayer Timetable</span>
                    <span className="text-[10px] text-emerald-400">Dutse Central Time</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                    {[
                      { name: 'Fajr', time: '05:12', done: hour >= 5 },
                      { name: 'Dhuhr', time: '12:28', done: hour >= 12 },
                      { name: 'Asr', time: '15:45', done: hour >= 16 },
                      { name: 'Maghrib', time: '18:18', done: hour >= 18 },
                      { name: 'Isha', time: '19:30', done: hour >= 20 },
                    ].map((p) => (
                      <div
                        key={p.name}
                        className={`p-2 rounded-2xl border transition ${
                          p.done
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-white/5 border-white/10 text-white/60'
                        }`}
                      >
                        <div className="font-bold text-[11px]">{p.name}</div>
                        <div className="text-[9px] font-mono mt-0.5">{p.time}</div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const res = pray();
                      if (res.success) playClick();
                    }}
                    className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-black shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Perform Prayer & Supplication (+3 Mutunci)
                  </button>
                </div>
              </motion.div>
            )}

            {/* === 8. SAHEL LOFI RADIO APP === */}
            {activeApp === 'radio' && (
              <motion.div
                key="radio"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-rose-950 via-slate-900 to-indigo-950 border border-rose-500/30 text-white text-center space-y-3 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black">Radio Dutse 95.3 FM</h3>
                    <p className="text-xs text-rose-200/80">Sahel Chill & Hausa Lofi Beats</p>
                  </div>

                  {/* Equalizer Waveform Bars Animation */}
                  <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                    {[16, 28, 40, 22, 34, 18, 26, 38, 20, 30].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [8, h, 12, h * 0.8, 8] }}
                        transition={{ repeat: Infinity, duration: 1.2 + (i % 3) * 0.2 }}
                        className="w-1.5 bg-gradient-to-t from-rose-500 to-amber-300 rounded-full"
                      />
                    ))}
                  </div>

                  <div className="text-[11px] text-white/50 pt-2 border-t border-white/10">
                    Station playing live in game audio engine. Enjoy authentic Kakaki horns, Kalangu talking drums, and chill guitar chords.
                  </div>
                </div>
              </motion.div>
            )}

            {/* === 9. REST & LODGING APP === */}
            {activeApp === 'lifestyle' && (
              <motion.div
                key="lifestyle"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="p-5 rounded-3xl bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 text-white text-center space-y-3 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-300">
                    <Bed className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black">Rest & Sleep Overnight</h3>
                  <p className="text-xs text-purple-200/80 leading-relaxed max-w-xs mx-auto">
                    Resting advances time to 6:00 AM tomorrow, replenishes 100% Energy, and cures +20 Health.
                    Night lodging & upkeep costs ₦1,500.
                  </p>
                  <button
                    onClick={() => {
                      playRest();
                      rest();
                    }}
                    className="mt-2 w-full py-3.5 px-4 rounded-2xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-950 transition"
                  >
                    Sleep Now (Pay ₦1,500)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. SMARTPHONE HOME INDICATOR BAR */}
        <div className="py-2.5 flex justify-center bg-black/60 border-t border-white/5">
          <button
            onClick={() => {
              playClick();
              setActiveApp('home');
            }}
            className="w-32 h-1 bg-white/40 hover:bg-white/80 rounded-full transition"
            title="Return Home"
          />
        </div>
      </motion.div>
    </div>
  );
};

// Helper for dynamic Hausa greetings
function getHausaGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Ina Kwana (Good Morning)';
  if (hour >= 12 && hour < 17) return 'Ina Wuni (Good Afternoon)';
  return 'Barka da Yamma (Good Evening)';
}

function dynamicIslandExpandedText(app: PhoneApp, season: string, locName: string): string {
  switch (app) {
    case 'wallet':
      return 'KazaurePay · Secure Banking';
    case 'chat':
      return 'DutseChat · 4 Contacts Active';
    case 'jobs':
      return `Gigs · ${locName}`;
    case 'market':
      return 'KasuwaPulse · Live Ticker';
    case 'travel':
      return 'Dutse Transit · 9 Hubs';
    case 'weather':
      return `${season} Season · 24°C`;
    case 'radio':
      return 'Radio Dutse 95.3 FM · Live';
    default:
      return `${locName.split(' ')[0]} · 5G Online`;
  }
}
