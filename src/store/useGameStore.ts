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

import { GAME_CONFIG } from '@/config/gameConfig';

import backgroundsRaw from '@/data/backgrounds.json';
import locationsRaw from '@/data/locations.json';
import jobsRaw from '@/data/jobs.json';
import randomEventsRaw from '@/data/randomEvents.json';

const backgroundsData = backgroundsRaw as PlayerBackground[];
const locationsData = locationsRaw as GameLocation[];
const jobsData = jobsRaw as Job[];
const randomEventsData = randomEventsRaw as RandomEvent[];

function calculateSeason(day: number): Season {
  const cycle = ((day - 1) % GAME_CONFIG.TIME.SEASON_CYCLE_DAYS) + 1;
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
    day: GAME_CONFIG.TIME.START_DAY,
    hour: GAME_CONFIG.TIME.START_HOUR,
    season: 'Harmattan',
    message: 'Sannu da zuwa! Welcome to Jigawa State. Build your wealth, preserve Mutunci, and make your mark across the savannah.',
    type: 'info',
  },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Primary Player Stats
      naira: 150000,
      mutunci: 60,
      energy: GAME_CONFIG.STATS.MAX_ENERGY,
      health: GAME_CONFIG.STATS.MAX_HEALTH,

      // Calendar & Time
      day: GAME_CONFIG.TIME.START_DAY,
      hour: GAME_CONFIG.TIME.START_HOUR,
      season: 'Harmattan',

      // Navigation & Identity
      currentLocation: 'dutse_secretariat',
      selectedBackground: 'dutse_civil_servant',
      activeEvent: null,
      logs: INITIAL_LOGS,
      floatingNotices: [],

      // Extended Pillars (Prepared for Phase 2+)
      relationships: {},
      skills: {},

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
          mutunci: clamp(bg.startingStats.mutunci, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
          energy: clamp(bg.startingStats.energy, GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY),
          health: clamp(bg.startingStats.health, GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH),
          currentLocation: bg.homeLocation,
          day: GAME_CONFIG.TIME.START_DAY,
          hour: GAME_CONFIG.TIME.START_HOUR,
          season: 'Harmattan',
          isGameOver: false,
          gameOverReason: null,
        });

        get().addLog({
          message: `Embarking on life path: ${bg.title}. ${bg.perks}`,
          type: 'info',
          nairaChange: bg.startingStats.naira,
          mutunciChange: bg.startingStats.mutunci,
        });

        get().addNotice(`Path Chosen: ${bg.title}`, 'positive');
      },

      performJob: (jobInput: string | Job) => {
        const state = get();
        if (state.isGameOver) {
          return { success: false, message: 'Game over! Settle distress debts first.' };
        }

        const job =
          typeof jobInput === 'string'
            ? jobsData.find((j) => j.id === jobInput)
            : jobInput;

        if (!job) {
          return { success: false, message: 'Invalid or unlisted occupation in this district.' };
        }

        // Location Check
        if (job.locationId !== state.currentLocation) {
          const locName = locationsData.find((l) => l.id === job.locationId)?.name || job.locationId;
          return {
            success: false,
            message: `This gig is located in ${locName}. You must travel there first!`,
          };
        }

        // Perk: Tech & POS Hustler energy drain 10% slower on FUD campus jobs
        let energyCost = job.energyCost;
        if (state.selectedBackground === 'tech_pos_hustler' && job.locationId === 'fud_campus') {
          energyCost = Math.round(energyCost * GAME_CONFIG.PERKS.TECH_ENERGY_COST_FACTOR);
        }

        if (state.energy < energyCost) {
          get().addNotice('Not enough Energy! Rest or visit a Bukka.', 'negative');
          return {
            success: false,
            message: `Too exhausted! You need ${energyCost} Energy, but currently have ${state.energy}%.`,
          };
        }

        // Perk: Agro-Entrepreneur +15% payout on agricultural / market jobs
        let payout = job.payoutNaira;
        if (state.selectedBackground === 'agro_entrepreneur' && job.locationId === 'hadejia_market') {
          payout = Math.round(payout * (1 + GAME_CONFIG.PERKS.AGRO_MARKET_PAYOUT_BONUS));
        }

        const newEnergy = clamp(state.energy - energyCost, GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY);
        const newMutunci = clamp(state.mutunci + (job.mutunciChange || 0), GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI);
        const newNaira = Math.max(0, state.naira + payout);

        // Advance hours
        let newHour = state.hour + job.timeHours;
        let newDay = state.day;
        if (newHour >= GAME_CONFIG.TIME.HOURS_PER_DAY) {
          newDay += Math.floor(newHour / GAME_CONFIG.TIME.HOURS_PER_DAY);
          newHour = newHour % GAME_CONFIG.TIME.HOURS_PER_DAY;
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

        // Chance of triggering random regional event
        if (Math.random() <= GAME_CONFIG.EVENTS.DEFAULT_JOB_EVENT_CHANCE) {
          get().triggerRandomEvent();
        }

        return { success: true, message: `Completed ${job.title} successfully!` };
      },

      rest: () => {
        const state = get();
        if (state.isGameOver) return;

        const nextDay = state.day + 1;
        const newSeason = calculateSeason(nextDay);

        // Lodging upkeep: Costs configured lodging fee if player has money
        const restCost = state.naira >= GAME_CONFIG.UPKEEP.REST_LODGING_COST ? GAME_CONFIG.UPKEEP.REST_LODGING_COST : 0;
        const newNaira = Math.max(0, state.naira - restCost);

        // Perk: Dutse Civil Servant gains +5 Mutunci automatically every 7 days
        let mutunciBonus = 0;
        if (
          state.selectedBackground === 'dutse_civil_servant' &&
          nextDay % GAME_CONFIG.PERKS.CIVIL_SERVANT_MUTUNCI_INTERVAL_DAYS === 0
        ) {
          mutunciBonus = GAME_CONFIG.PERKS.CIVIL_SERVANT_MUTUNCI_BONUS;
        }

        const restoredEnergy = GAME_CONFIG.STATS.MAX_ENERGY;
        const restoredHealth = clamp(state.health + GAME_CONFIG.UPKEEP.REST_HEALTH_RESTORE, GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH);
        const newMutunci = clamp(state.mutunci + mutunciBonus, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI);

        set({
          day: nextDay,
          hour: GAME_CONFIG.TIME.WAKE_UP_HOUR, // Morning wake up at 6:00 AM
          energy: restoredEnergy,
          health: restoredHealth,
          mutunci: newMutunci,
          naira: newNaira,
          season: newSeason,
        });

        get().addLog({
          message: `Rested overnight. Woke up refreshed at 6:00 AM on Day ${nextDay}. Energy restored to 100%, +${GAME_CONFIG.UPKEEP.REST_HEALTH_RESTORE} Health${restCost > 0 ? ` (-₦${restCost.toLocaleString()} lodging/room)` : ''}.${mutunciBonus ? ' Civil service tenure reputation bonus: +5 Mutunci!' : ''}`,
          type: 'rest',
          energyChange: restoredEnergy - state.energy,
          nairaChange: restCost > 0 ? -restCost : undefined,
          mutunciChange: mutunciBonus || undefined,
        });

        get().addNotice(`Day ${nextDay}: Fully Rested!`, 'positive');
      },

      eatBukka: () => {
        const state = get();
        if (state.isGameOver) return { success: false, message: 'Game over! Settle distress debts first.' };

        const mealCost = GAME_CONFIG.UPKEEP.BUKKA_MEAL_COST;
        if (state.naira < mealCost) {
          get().addNotice(`Not enough Naira for Bukka meal (Costs ₦${mealCost.toLocaleString()})`, 'negative');
          return { success: false, message: `Need ₦${mealCost.toLocaleString()} for a proper meal.` };
        }

        const newNaira = state.naira - mealCost;
        const newHealth = clamp(state.health + GAME_CONFIG.UPKEEP.BUKKA_HEALTH_RESTORE, GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH);
        const newEnergy = clamp(state.energy + GAME_CONFIG.UPKEEP.BUKKA_ENERGY_RESTORE, GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY);

        set({
          naira: newNaira,
          health: newHealth,
          energy: newEnergy,
        });

        get().addLog({
          message: `Ate hot Tuwo & Miyan Kuka at local bukka (-₦${mealCost.toLocaleString()}, +${GAME_CONFIG.UPKEEP.BUKKA_HEALTH_RESTORE} Health, +${GAME_CONFIG.UPKEEP.BUKKA_ENERGY_RESTORE} Energy).`,
          type: 'lifestyle',
          nairaChange: -mealCost,
          energyChange: GAME_CONFIG.UPKEEP.BUKKA_ENERGY_RESTORE,
        });

        get().addNotice(`+${GAME_CONFIG.UPKEEP.BUKKA_HEALTH_RESTORE} Health | -₦${mealCost.toLocaleString()}`, 'positive');
        return { success: true, message: 'Ate hot Tuwo at the local Bukka!' };
      },

      pray: () => {
        const state = get();
        if (state.isGameOver) return { success: false, message: 'Game over! Settle distress debts first.' };

        const newMutunci = clamp(state.mutunci + GAME_CONFIG.UPKEEP.PRAYER_MUTUNCI_BONUS, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI);

        set({ mutunci: newMutunci });

        get().addLog({
          message: `Offered prayer & community reflection (+${GAME_CONFIG.UPKEEP.PRAYER_MUTUNCI_BONUS} Mutunci).`,
          type: 'lifestyle',
          mutunciChange: GAME_CONFIG.UPKEEP.PRAYER_MUTUNCI_BONUS,
        });

        get().addNotice(`+${GAME_CONFIG.UPKEEP.PRAYER_MUTUNCI_BONUS} Mutunci (Social Respect)`, 'positive');
        return { success: true, message: 'Prayed and greeted community members.' };
      },

      travel: (locInput: LocationId | GameLocation) => {
        const state = get();
        if (state.isGameOver) return { success: false, message: 'Game over! Settle distress debts first.' };

        const locId = typeof locInput === 'string' ? locInput : locInput.id;
        const target = locationsData.find((l) => l.id === locId);

        if (!target) {
          return { success: false, message: 'Target destination not found on the Jigawa transit chart.' };
        }

        if (state.currentLocation === target.id) {
          return { success: false, message: `You are already in ${target.name}.` };
        }

        if (state.naira < target.travelCost) {
          get().addNotice(`Insufficient fare! Needs ₦${target.travelCost.toLocaleString()}`, 'negative');
          return {
            success: false,
            message: `Cannot afford road transit to ${target.name}. Fare is ₦${target.travelCost.toLocaleString()}, but you have ₦${state.naira.toLocaleString()}.`,
          };
        }

        // Travel time and energy consumption
        const travelTimeHours = 2;
        const travelEnergyCost = 10;

        let newHour = state.hour + travelTimeHours;
        let newDay = state.day;
        if (newHour >= GAME_CONFIG.TIME.HOURS_PER_DAY) {
          newDay += Math.floor(newHour / GAME_CONFIG.TIME.HOURS_PER_DAY);
          newHour = newHour % GAME_CONFIG.TIME.HOURS_PER_DAY;
        }

        const newNaira = state.naira - target.travelCost;
        const newEnergy = clamp(state.energy - travelEnergyCost, GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY);
        const newSeason = calculateSeason(newDay);

        set({
          currentLocation: target.id,
          naira: newNaira,
          energy: newEnergy,
          hour: newHour,
          day: newDay,
          season: newSeason,
        });

        get().addLog({
          message: `Traveled via commercial transport to ${target.name} (${target.zone}). Fare: -₦${target.travelCost.toLocaleString()}, -${travelEnergyCost} Energy, +${travelTimeHours} hrs.`,
          type: 'travel',
          nairaChange: -target.travelCost,
          energyChange: -travelEnergyCost,
        });

        get().addNotice(`Arrived: ${target.name}`, 'positive');
        return { success: true, message: `Arrived in ${target.name}!` };
      },

      triggerRandomEvent: (forcedEvent?: RandomEvent) => {
        let selected = forcedEvent;
        if (!selected) {
          const pool = randomEventsData;
          if (pool.length === 0) return;
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
        const { naira = 0, energy = 0, health = 0 } = choice.statChanges;
        let { mutunci = 0 } = choice.statChanges;

        // Perk: Royal Heritage double Mutunci penalty for negative choices
        if (state.selectedBackground === 'royal_heritage' && mutunci < 0) {
          mutunci = mutunci * GAME_CONFIG.PERKS.ROYAL_MUTUNCI_PENALTY_MULTIPLIER;
        }

        const newNaira = Math.max(0, state.naira + naira);
        const newMutunci = clamp(state.mutunci + mutunci, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI);
        const newEnergy = clamp(state.energy + energy, GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY);
        const newHealth = clamp(state.health + health, GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH);

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

        get().addNotice(`Event Resolved: "${choice.text}"`, 'neutral');

        // Check Bankruptcy / Critical Exhaustion
        if (newHealth <= 0 || (newNaira <= 0 && newEnergy <= 0)) {
          set({
            isGameOver: true,
            gameOverReason:
              newHealth <= 0
                ? 'Fatal health collapse due to untreated illness and severe fatigue in the Harmattan dust.'
                : 'Complete economic insolvency: ₦0 cash and 0% energy remaining. Unable to hustle or eat.',
          });
          get().addNotice('Game Over! Settle distress debts to restart.', 'negative');
        }
      },

      handleEventChoice: (choice: 'A' | 'B') => {
        get().resolveEvent(choice);
      },

      dismissEvent: () => {
        set({ activeEvent: null });
      },

      borrowLoan: () => {
        const state = get();
        const loanAmount = GAME_CONFIG.DISTRESS.MICROFINANCE_LOAN_AMOUNT;
        set({
          naira: state.naira + loanAmount,
          mutunci: clamp(state.mutunci - GAME_CONFIG.DISTRESS.LOAN_MUTUNCI_PENALTY, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
          health: GAME_CONFIG.DISTRESS.RECOVERY_HEALTH,
          energy: GAME_CONFIG.DISTRESS.RECOVERY_ENERGY,
          isGameOver: false,
          gameOverReason: null,
        });

        get().addLog({
          message: `Secured emergency micro-finance loan of ₦${loanAmount.toLocaleString()} (-${GAME_CONFIG.DISTRESS.LOAN_MUTUNCI_PENALTY} Mutunci for taking distress debt). Restored to active life!`,
          type: 'warning',
          nairaChange: loanAmount,
          mutunciChange: -GAME_CONFIG.DISTRESS.LOAN_MUTUNCI_PENALTY,
        });

        get().addNotice(`Loan Granted: +₦${loanAmount.toLocaleString()}`, 'neutral');
      },

      resetGame: () => {
        set({
          naira: 150000,
          mutunci: 60,
          energy: GAME_CONFIG.STATS.MAX_ENERGY,
          health: GAME_CONFIG.STATS.MAX_HEALTH,
          day: GAME_CONFIG.TIME.START_DAY,
          hour: GAME_CONFIG.TIME.START_HOUR,
          season: 'Harmattan',
          currentLocation: 'dutse_secretariat',
          selectedBackground: 'dutse_civil_servant',
          activeEvent: null,
          logs: INITIAL_LOGS,
          floatingNotices: [],
          relationships: {},
          skills: {},
          isGameOver: false,
          gameOverReason: null,
        });
        get().addNotice('Game Reset to New Life!', 'neutral');
      },
    }),
    {
      name: GAME_CONFIG.SAVE.STORAGE_KEY,
      version: GAME_CONFIG.SAVE.VERSION,
      // Partialize: Isolate persistent game domain from ephemeral UI state
      partialize: (state) => ({
        naira: state.naira,
        mutunci: state.mutunci,
        energy: state.energy,
        health: state.health,
        day: state.day,
        hour: state.hour,
        season: state.season,
        currentLocation: state.currentLocation,
        selectedBackground: state.selectedBackground,
        logs: state.logs,
        relationships: state.relationships,
        skills: state.skills,
        isGameOver: state.isGameOver,
        gameOverReason: state.gameOverReason,
      }),
    }
  )
);
