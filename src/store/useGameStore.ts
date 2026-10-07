import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  BackgroundId,
  LocationId,
  RandomEvent,
  Season,
  GameLog,
  FloatingNotice,
  PlayerBackground,
  GameLocation,
  Job,
} from '@/types/game';

import backgroundsRaw from '@/data/backgrounds.json';
import locationsRaw from '@/data/locations.json';
import jobsRaw from '@/data/jobs.json';
import randomEventsRaw from '@/data/randomEvents.json';

const backgroundsData = backgroundsRaw as PlayerBackground[];
const locationsData = locationsRaw as GameLocation[];
const jobsData = jobsRaw as Job[];
const randomEventsData = randomEventsRaw as RandomEvent[];

function calculateSeason(day: number): Season {
  const cycle = day % 30;
  if (cycle >= 1 && cycle <= 10) return 'Harmattan';
  if (cycle >= 11 && cycle <= 20) return 'Dry';
  return 'Rainy';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const INITIAL_LOGS: GameLog[] = [
  {
    id: 'log-init-1',
    day: 1,
    hour: 8,
    season: 'Harmattan',
    message: 'Sannu da zuwa! Welcome to Jigawa State. Choose your origin background to begin your lifestyle journey.',
    type: 'info',
  },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Primary Stats
      naira: 150000,
      mutunci: 60,
      energy: 100,
      health: 100,

      // Calendar & Time
      day: 1,
      hour: 8,
      season: 'Harmattan',

      // Navigation & Identity
      currentLocation: 'dutse_secretariat',
      selectedBackground: null,
      activeEvent: null,
      logs: INITIAL_LOGS,
      floatingNotices: [],

      // Game status
      isGameOver: false,
      gameOverReason: null,

      addNotice: (text: string, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
        const id = 'notice-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        const notice: FloatingNotice = { id, text, type };
        set((state) => ({
          floatingNotices: [...state.floatingNotices.slice(-4), notice],
        }));
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            get().removeNotice(id);
          }, 3200);
        }
      },

      removeNotice: (id: string) => {
        set((state) => ({
          floatingNotices: state.floatingNotices.filter((n) => n.id !== id),
        }));
      },

      addLog: (entry) => {
        const { day, hour, season } = get();
        const id = 'log-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
        set((state) => ({
          logs: [
            {
              ...entry,
              id,
              day,
              hour,
              season,
            },
            ...state.logs,
          ].slice(0, 50),
        }));
      },

      chooseBackground: (pathId: BackgroundId) => {
        const bg = backgroundsData.find((b) => b.id === pathId);
        if (!bg) return;

        set({
          selectedBackground: pathId,
          naira: bg.startingStats.naira,
          mutunci: bg.startingStats.mutunci,
          energy: bg.startingStats.energy,
          health: bg.startingStats.health,
          currentLocation: bg.homeLocation,
          day: 1,
          hour: 8,
          season: 'Harmattan',
          isGameOver: false,
          gameOverReason: null,
          logs: [
            {
              id: 'log-start-' + Date.now(),
              day: 1,
              hour: 8,
              season: 'Harmattan',
              message: `Origin Selected: ${bg.title}. Began in ${bg.homeLocation.replace('_', ' ').toUpperCase()} with ₦${bg.startingStats.naira.toLocaleString()} and Mutunci: ${bg.startingStats.mutunci}. Perk: ${bg.perks}`,
              type: 'info',
            },
          ],
        });

        get().addNotice(`Path activated: ${bg.title}`, 'positive');
      },

      performJob: (jobArg: string | Job) => {
        const state = get();
        if (state.isGameOver) {
          return { success: false, message: 'Game Over. Please restart or borrow from a micro-finance agent.' };
        }

        const jobId = typeof jobArg === 'string' ? jobArg : jobArg.id;
        const job = jobsData.find((j) => j.id === jobId) || (typeof jobArg === 'object' ? jobArg : null);
        if (!job) {
          return { success: false, message: 'Job not found.' };
        }

        // Perk: Tech & POS Hustler energy drain 10% slower on FUD campus jobs
        let energyCost = job.energyCost;
        if (state.selectedBackground === 'tech_pos_hustler' && job.locationId === 'fud_campus') {
          energyCost = Math.round(energyCost * 0.9);
        }

        if (state.energy < energyCost) {
          get().addNotice('Not enough Energy! Rest or visit a Bukka.', 'negative');
          return {
            success: false,
            message: `Too exhausted! You need ${energyCost} Energy, but currently have ${state.energy}.`,
          };
        }

        // Perk: Agro-Entrepreneur +15% payout on agricultural / market jobs
        let payout = job.payoutNaira;
        if (state.selectedBackground === 'agro_entrepreneur' && job.locationId === 'hadejia_market') {
          payout = Math.round(payout * 1.15);
        }

        const newEnergy = clamp(state.energy - energyCost, 0, 100);
        const newMutunci = clamp(state.mutunci + (job.mutunciChange || 0), 0, 100);
        const newNaira = state.naira + payout;

        // Advance hours
        let newHour = state.hour + job.timeHours;
        let newDay = state.day;
        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;
        }

        const newSeason = calculateSeason(newDay);

        set({
          energy: newEnergy,
          mutunci: newMutunci,
          naira: newNaira,
          hour: newHour,
          day: newDay,
          season: newSeason,
        });

        get().addLog({
          message: `Completed "${job.title}". Earned ₦${payout.toLocaleString()} (-${energyCost} Energy, +${job.timeHours} hrs).`,
          type: 'job',
          nairaChange: payout,
          energyChange: -energyCost,
          mutunciChange: job.mutunciChange,
        });

        get().addNotice(`+₦${payout.toLocaleString()} | -${energyCost} Energy`, 'positive');

        // 15% chance of triggering random regional event
        if (Math.random() <= 0.15) {
          get().triggerRandomEvent();
        }

        return { success: true, message: `Completed ${job.title} successfully!` };
      },

      rest: () => {
        const state = get();
        if (state.isGameOver) return;

        const nextDay = state.day + 1;
        const newSeason = calculateSeason(nextDay);

        // Lodging upkeep: Costs ₦1,500 if player has money
        const restCost = state.naira >= 1500 ? 1500 : 0;
        const newNaira = state.naira - restCost;

        // Perk: Dutse Civil Servant gains +5 Mutunci automatically every 7 days
        let mutunciBonus = 0;
        if (state.selectedBackground === 'dutse_civil_servant' && nextDay % 7 === 0) {
          mutunciBonus = 5;
        }

        const restoredEnergy = 100;
        const restoredHealth = clamp(state.health + 20, 0, 100);
        const newMutunci = clamp(state.mutunci + mutunciBonus, 0, 100);

        set({
          day: nextDay,
          hour: 6, // Morning wake up at 6:00 AM
          energy: restoredEnergy,
          health: restoredHealth,
          mutunci: newMutunci,
          naira: newNaira,
          season: newSeason,
        });

        get().addLog({
          message: `Rested overnight. Woke up refreshed at 6:00 AM on Day ${nextDay}. Energy restored to 100%, +20 Health${restCost > 0 ? ` (-₦${restCost.toLocaleString()} lodging/room)` : ''}.${mutunciBonus ? ' Civil service tenure reputation bonus: +5 Mutunci!' : ''}`,
          type: 'rest',
          energyChange: 100 - state.energy,
          nairaChange: restCost > 0 ? -restCost : undefined,
          mutunciChange: mutunciBonus || undefined,
        });

        get().addNotice(`Day ${nextDay} begun! Energy (100%) & Health (+20)`, 'positive');
      },

      eatBukka: () => {
        const state = get();
        const cost = 2000;
        if (state.naira < cost) {
          get().addNotice('Cannot afford Bukka meal!', 'negative');
          return { success: false, message: 'Cannot afford a meal at the Bukka.' };
        }

        const newNaira = state.naira - cost;
        const newEnergy = clamp(state.energy + 25, 0, 100);
        const newHealth = clamp(state.health + 8, 0, 100);
        const newHour = (state.hour + 1) % 24;

        set({
          naira: newNaira,
          energy: newEnergy,
          health: newHealth,
          hour: newHour,
        });

        get().addLog({
          message: `Enjoyed Tuwon Shinkafa & Miyar Kuka at the Bukka (-₦${cost.toLocaleString()}, +25 Energy, +8 Health).`,
          type: 'lifestyle',
          nairaChange: -cost,
          energyChange: 25,
        });

        get().addNotice('+25 Energy | -₦2,000', 'neutral');
        return { success: true, message: 'Warm meal enjoyed at local Bukka.' };
      },

      pray: () => {
        const state = get();
        if (state.energy < 5) {
          get().addNotice('Too weak to stand for prayer!', 'negative');
          return { success: false, message: 'Too exhausted to stand for prayer.' };
        }

        const newMutunci = clamp(state.mutunci + 3, 0, 100);
        const newEnergy = clamp(state.energy - 5, 0, 100);
        const newHour = (state.hour + 1) % 24;

        set({
          mutunci: newMutunci,
          energy: newEnergy,
          hour: newHour,
        });

        get().addLog({
          message: 'Performed daily prayer at community mosque (+3 Mutunci, -5 Energy).',
          type: 'lifestyle',
          mutunciChange: 3,
          energyChange: -5,
        });

        get().addNotice('+3 Mutunci | Inner Peace', 'positive');
        return { success: true, message: 'Spirit refreshed.' };
      },

      travel: (locArg: LocationId | GameLocation) => {
        const state = get();
        const locationId = typeof locArg === 'string' ? locArg : locArg.id;

        if (state.currentLocation === locationId) {
          return { success: false, message: 'Already at this location.' };
        }

        const targetLoc = locationsData.find((l) => l.id === locationId) || (typeof locArg === 'object' ? locArg : null);
        if (!targetLoc) return { success: false, message: 'Invalid destination.' };

        if (state.naira < targetLoc.travelCost) {
          get().addNotice('Insufficient fare for commercial vehicle!', 'negative');
          return {
            success: false,
            message: `Travel to ${targetLoc.name} costs ₦${targetLoc.travelCost.toLocaleString()}.`,
          };
        }

        const newNaira = state.naira - targetLoc.travelCost;
        const newEnergy = clamp(state.energy - 12, 0, 100);

        let newHour = state.hour + 2;
        let newDay = state.day;
        if (newHour >= 24) {
          newDay += Math.floor(newHour / 24);
          newHour = newHour % 24;
        }

        set({
          currentLocation: locationId,
          naira: newNaira,
          energy: newEnergy,
          hour: newHour,
          day: newDay,
          season: calculateSeason(newDay),
        });

        get().addLog({
          message: `Boarded commercial transport to ${targetLoc.name} (${targetLoc.zone}) for ₦${targetLoc.travelCost.toLocaleString()} (-12 Energy, +2 hrs).`,
          type: 'travel',
          nairaChange: -targetLoc.travelCost,
          energyChange: -12,
        });

        get().addNotice(`Arrived at ${targetLoc.name}!`, 'neutral');

        if (Math.random() <= 0.15) {
          get().triggerRandomEvent();
        }

        return { success: true, message: `Safely arrived at ${targetLoc.name}.` };
      },

      triggerRandomEvent: (presetEvent?: RandomEvent) => {
        const state = get();
        if (state.activeEvent) return;

        let selected: RandomEvent;
        if (presetEvent) {
          selected = presetEvent;
        } else {
          const candidates = randomEventsData.filter(
            (e) => !e.contextLocation || e.contextLocation === state.currentLocation
          );
          const pool = candidates.length > 0 ? candidates : randomEventsData;
          const index = Math.floor(Math.random() * pool.length);
          selected = pool[index];
        }

        set({ activeEvent: selected });
      },

      resolveEvent: (choiceKey: 'A' | 'B') => {
        const state = get();
        const event = state.activeEvent;
        if (!event) return;

        const choice = choiceKey === 'A' ? event.choiceA : event.choiceB;
        let { naira = 0, mutunci = 0, energy = 0, health = 0 } = choice.statChanges;

        // Perk: Royal Heritage double Mutunci penalty for negative choices
        if (state.selectedBackground === 'royal_heritage' && mutunci < 0) {
          mutunci = mutunci * 2;
        }

        const newNaira = state.naira + naira;
        const newMutunci = clamp(state.mutunci + mutunci, 0, 100);
        const newEnergy = clamp(state.energy + energy, 0, 100);
        const newHealth = clamp(state.health + health, 0, 100);

        set({
          naira: newNaira,
          mutunci: newMutunci,
          energy: newEnergy,
          health: newHealth,
          activeEvent: null,
        });

        get().addLog({
          message: `[Event: ${event.title}] Chose: "${choice.text}". ${choice.consequence}`,
          type: 'event',
          nairaChange: naira || undefined,
          mutunciChange: mutunci || undefined,
          energyChange: energy || undefined,
        });

        const noticeSummary = [
          naira ? `${naira > 0 ? '+' : ''}₦${naira.toLocaleString()}` : '',
          mutunci ? `${mutunci > 0 ? '+' : ''}${mutunci} Mutunci` : '',
          energy ? `${energy > 0 ? '+' : ''}${energy} Energy` : '',
        ]
          .filter(Boolean)
          .join(' | ');

        if (noticeSummary) {
          get().addNotice(noticeSummary, naira >= 0 ? 'positive' : 'negative');
        }

        if (newHealth <= 0) {
          set({
            isGameOver: true,
            gameOverReason: 'Your Health dropped to zero due to severe illness or exhaustion.',
          });
        } else if (newNaira < -100000) {
          set({
            isGameOver: true,
            gameOverReason: 'Your debts exceeded -₦100,000 without collateral. Bankruptcy declared in Jigawa.',
          });
        }
      },

      handleEventChoice: (choiceKey: 'A' | 'B') => {
        get().resolveEvent(choiceKey);
      },

      dismissEvent: () => {
        set({ activeEvent: null });
      },

      borrowLoan: () => {
        const state = get();
        const loanAmount = 75000;
        set({
          naira: state.naira + loanAmount,
          mutunci: clamp(state.mutunci - 15, 0, 100),
          health: 80,
          energy: 90,
          isGameOver: false,
          gameOverReason: null,
        });

        get().addLog({
          message: `Secured emergency micro-finance loan of ₦${loanAmount.toLocaleString()} (-15 Mutunci for taking distress debt). Restored to active life!`,
          type: 'warning',
          nairaChange: loanAmount,
          mutunciChange: -15,
        });

        get().addNotice(`Loan Granted: +₦${loanAmount.toLocaleString()}`, 'neutral');
      },

      resetGame: () => {
        set({
          naira: 150000,
          mutunci: 60,
          energy: 100,
          health: 100,
          day: 1,
          hour: 8,
          season: 'Harmattan',
          currentLocation: 'dutse_secretariat',
          selectedBackground: null,
          activeEvent: null,
          logs: INITIAL_LOGS,
          floatingNotices: [],
          isGameOver: false,
          gameOverReason: null,
        });
      },
    }),
    {
      name: 'jigawa-lifestyle-save-v1',
    }
  )
);
