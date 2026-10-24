import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GameState,
  BackgroundId,
  LocationId,
  GameEvent,
  EventChoice,
  EventTrigger,
  Season,
  GameLog,
  FloatingNotice,
  PlayerBackground,
  GameLocation,
  Job,
  AvatarCustomization,
  HousingTier,
  CommodityId,
  VehicleId,
  EmirateTitle,
} from '@/types/game';

import { GAME_CONFIG } from '@/config/gameConfig';
import {
  canSelectChoice,
  rollForEvent,
  resolveEventChoice,
  calculateCooldownExpiration,
  createEventHistoryEntry,
} from '@/engine/eventEngine';
import { GAME_EVENTS } from '@/data/events';
import { COMMODITIES, REGIONAL_DEMAND_FACTORS, VEHICLES } from '@/data/commodities';
import { EMIRATE_TITLES } from '@/data/titles';
import { HOUSING_TIERS } from '@/data/housing';

import backgroundsRaw from '@/data/backgrounds.json';
import locationsRaw from '@/data/locations.json';
import jobsRaw from '@/data/jobs.json';

const backgroundsData = backgroundsRaw as PlayerBackground[];
const locationsData = locationsRaw as GameLocation[];
const jobsData = jobsRaw as Job[];

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

      // Character Customization & Identity
      avatar: {
        gender: 'male',
        skinTone: '#5a3825',
        attire: 'kaftan',
        attireColor: '#0284c7',
        headwear: 'zanna_bukar',
        headwearColor: '#f1f5f9',
        footwear: 'kano_sandals',
      },
      housingTier: 'student_room',
      ownedFurnishings: ['wooden_bed', 'nightstand', 'work_table'],
      equippedVehicle: 'none',
      commoditiesInventory: {
        sesame_grain: 0,
        sorted_rice: 0,
        smoked_fish: 0,
        sahel_livestock: 0,
        kazaure_dates: 0,
      },
      activeEvent: null,
      eventHistory: [],
      eventCooldowns: {},
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
        if (state.activeEvent) {
          return { success: false, message: 'You must resolve the current life event before taking other actions.' };
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

        // Evaluate dynamic life event trigger
        get().evaluateTrigger('afterJob');

        return { success: true, message: `Completed ${job.title} successfully!` };
      },

      rest: () => {
        const state = get();
        if (state.isGameOver || state.activeEvent) return;

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

        // Evaluate morning life event trigger upon waking up
        get().evaluateTrigger('startOfDay');
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
        if (state.activeEvent) return { success: false, message: 'You must resolve the current life event before traveling.' };

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

        // Evaluate regional travel life event trigger
        get().evaluateTrigger('afterTravel');

        return { success: true, message: `Arrived in ${target.name}!` };
      },

      triggerRandomEvent: (forcedEvent?: GameEvent) => {
        const state = get();
        if (state.isGameOver || state.activeEvent) return;
        const selected = forcedEvent || rollForEvent(state, 'manual', GAME_EVENTS, () => 0);
        if (selected) {
          set({ activeEvent: selected });
          get().addLog({
            message: `[Event Triggered] ${selected.title} (${selected.category})`,
            type: 'event',
          });
          get().addNotice(`Life Event: ${selected.title}`, 'neutral');
        }
      },

      evaluateTrigger: (trigger: EventTrigger) => {
        const state = get();
        if (state.isGameOver || state.activeEvent) return null;
        const selected = rollForEvent(state, trigger, GAME_EVENTS);
        if (selected) {
          set({ activeEvent: selected });
          get().addLog({
            message: `[Life Event Encountered] ${selected.title} (${selected.category}): ${selected.description}`,
            type: 'event',
          });
          get().addNotice(`Event: ${selected.title}`, 'neutral');
          return selected;
        }
        return null;
      },

      canSelectEventChoice: (choice: EventChoice) => {
        return canSelectChoice(choice, get()).canSelect;
      },

      resolveEvent: (choiceIdentifier: 'A' | 'B' | string) => {
        const state = get();
        const event = state.activeEvent;
        if (!event) return null;

        const resolution = resolveEventChoice(state, event, choiceIdentifier);
        if (!resolution.success) {
          get().addNotice(resolution.message, 'negative');
          return resolution;
        }

        const { effectsApplied } = resolution;
        const newNaira = Math.max(0, state.naira + (effectsApplied.naira || 0));
        const newMutunci = clamp(state.mutunci + (effectsApplied.mutunci || 0), GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI);
        const newEnergy = clamp(state.energy + (effectsApplied.energy || 0), GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY);
        const newHealth = clamp(state.health + (effectsApplied.health || 0), GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH);

        // Calculate cooldown expiration day
        const nextCooldownDay = calculateCooldownExpiration(event, state.day);
        const updatedCooldowns = { ...state.eventCooldowns, [event.id]: nextCooldownDay };

        // Locate selected choice for history record
        let chosenChoice: EventChoice | undefined;
        if (choiceIdentifier === 'A') chosenChoice = event.choices[0] || event.choiceA;
        else if (choiceIdentifier === 'B') chosenChoice = event.choices[1] || event.choiceB;
        else chosenChoice = event.choices.find((c) => c.id === choiceIdentifier);

        const choiceToRecord: EventChoice = chosenChoice || {
          id: choiceIdentifier,
          label: 'Selected Decision',
          text: 'Selected Decision',
          consequence: resolution.message,
          effects: effectsApplied,
          statChanges: {
            naira: effectsApplied.naira,
            mutunci: effectsApplied.mutunci,
            energy: effectsApplied.energy,
            health: effectsApplied.health,
          },
        };

        const historyEntry = createEventHistoryEntry(event, choiceToRecord, state, effectsApplied);
        const updatedHistory = [historyEntry, ...state.eventHistory.slice(0, 49)];

        set({
          naira: newNaira,
          mutunci: newMutunci,
          energy: newEnergy,
          health: newHealth,
          eventCooldowns: updatedCooldowns,
          eventHistory: updatedHistory,
          activeEvent: null,
        });

        const choiceTitle = choiceToRecord.label || choiceToRecord.text || 'Decision';
        get().addLog({
          message: `[Event: ${event.title}] Chose: "${choiceTitle}". ${resolution.message}`,
          type: 'event',
          nairaChange: effectsApplied.naira || undefined,
          mutunciChange: effectsApplied.mutunci || undefined,
          energyChange: effectsApplied.energy || undefined,
        });

        get().addNotice(`Event Resolved: "${choiceTitle}"`, 'neutral');

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

        return resolution;
      },

      handleEventChoice: (choice: 'A' | 'B') => {
        get().resolveEvent(choice);
      },

      setAvatarCustomization: (updates: Partial<AvatarCustomization>) => {
        set((state) => ({
          avatar: { ...state.avatar, ...updates },
        }));
        get().addNotice('Wardrobe & Style updated!', 'positive');
      },

      getEmirateTitle: (): EmirateTitle => {
        const { mutunci, naira } = get();
        // Check from highest to lowest tier
        for (let i = EMIRATE_TITLES.length - 1; i >= 0; i--) {
          const t = EMIRATE_TITLES[i];
          if (mutunci >= t.minMutunci && naira >= t.minNaira) {
            return t;
          }
        }
        return EMIRATE_TITLES[0];
      },

      getCommodityMarketPrice: (commodityId: CommodityId, locationId: LocationId): number => {
        const commodity = COMMODITIES.find((c) => c.id === commodityId);
        if (!commodity) return 10000;
        const demandFactor = REGIONAL_DEMAND_FACTORS[locationId]?.[commodityId] ?? 1.0;
        return Math.round(commodity.basePrice * demandFactor);
      },

      buyCommodity: (commodityId: CommodityId, quantity: number) => {
        const state = get();
        if (quantity <= 0) return { success: false, message: 'Invalid quantity.' };

        const unitPrice = state.getCommodityMarketPrice(commodityId, state.currentLocation);
        const totalCost = unitPrice * quantity;

        if (state.naira < totalCost) {
          get().addNotice('Insufficient Naira for this wholesale trade.', 'negative');
          return { success: false, message: 'Insufficient funds.' };
        }

        // Check vehicle cargo capacity
        const vehicle = VEHICLES[state.equippedVehicle] || VEHICLES.none;
        const currentLoad = Object.values(state.commoditiesInventory).reduce((acc, count) => acc + count, 0);
        if (currentLoad + quantity > vehicle.cargoCapacity) {
          get().addNotice(
            `Exceeds transport cargo limit (${vehicle.cargoCapacity} units). Upgrade your vehicle!`,
            'negative'
          );
          return { success: false, message: 'Exceeds cargo capacity.' };
        }

        const commodity = COMMODITIES.find((c) => c.id === commodityId)!;
        set({
          naira: state.naira - totalCost,
          commoditiesInventory: {
            ...state.commoditiesInventory,
            [commodityId]: (state.commoditiesInventory[commodityId] || 0) + quantity,
          },
        });

        get().addLog({
          message: `Bought ${quantity} ${commodity.unit}(s) of ${commodity.name} at ₦${unitPrice.toLocaleString()} each (-₦${totalCost.toLocaleString()}).`,
          type: 'lifestyle',
          nairaChange: -totalCost,
        });

        get().addNotice(`Trade Stocked: +${quantity} ${commodity.name}`, 'positive');
        return { success: true, message: 'Commodity stocked successfully.' };
      },

      sellCommodity: (commodityId: CommodityId, quantity: number) => {
        const state = get();
        if (quantity <= 0) return { success: false, message: 'Invalid quantity.' };

        const currentStock = state.commoditiesInventory[commodityId] || 0;
        if (currentStock < quantity) {
          get().addNotice('Not enough units in stock to complete this sale.', 'negative');
          return { success: false, message: 'Not enough stock.' };
        }

        const unitPrice = state.getCommodityMarketPrice(commodityId, state.currentLocation);
        const title = state.getEmirateTitle();
        // Dan Amana or higher gets 5% merchant selling bonus
        const merchantBonus = title.id !== 'talaka' ? 1.05 : 1.0;
        const finalPayout = Math.round(unitPrice * quantity * merchantBonus);

        const commodity = COMMODITIES.find((c) => c.id === commodityId)!;
        set({
          naira: state.naira + finalPayout,
          mutunci: clamp(state.mutunci + 2, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
          commoditiesInventory: {
            ...state.commoditiesInventory,
            [commodityId]: currentStock - quantity,
          },
        });

        get().addLog({
          message: `Sold ${quantity} ${commodity.unit}(s) of ${commodity.name} in ${state.currentLocation} for +₦${finalPayout.toLocaleString()} (+2 Mutunci).`,
          type: 'lifestyle',
          nairaChange: finalPayout,
          mutunciChange: 2,
        });

        get().addNotice(`Sale Finalized: +₦${finalPayout.toLocaleString()}`, 'positive');
        return { success: true, message: 'Commodity sold successfully.' };
      },

      buyShopItem: (item: { id: string; name: string; price: number; category: string; effects?: any }) => {
        const state = get();
        if (state.naira < item.price) {
          get().addNotice('Insufficient funds to purchase this item.', 'negative');
          return { success: false, message: 'Insufficient funds.' };
        }

        // Check if vehicle
        if (item.id === 'bajaj_motorcycle' || item.id === 'toyota_pickup') {
          if (state.equippedVehicle === item.id) {
            get().addNotice('You already own this vehicle!', 'neutral');
            return { success: false, message: 'Already owned.' };
          }
          set({
            naira: state.naira - item.price,
            equippedVehicle: item.id as VehicleId,
            mutunci: clamp(state.mutunci + 15, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
          });
          get().addLog({
            message: `Purchased ${item.name}! Upgraded cargo capacity and inter-city travel speed (+15 Mutunci).`,
            type: 'lifestyle',
            nairaChange: -item.price,
            mutunciChange: 15,
          });
          get().addNotice(`Vehicle Acquired: ${item.name}!`, 'positive');
          return { success: true, message: 'Vehicle acquired.' };
        }

        // Check if decor/furniture
        if (item.category === 'decor') {
          if (state.ownedFurnishings.includes(item.id)) {
            get().addNotice('This interior furnishing is already placed in your room.', 'neutral');
            return { success: false, message: 'Already owned.' };
          }
          set({
            naira: state.naira - item.price,
            ownedFurnishings: [...state.ownedFurnishings, item.id],
            mutunci: clamp(state.mutunci + (item.effects?.mutunci || 5), GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
          });
          get().addLog({
            message: `Furnished room with ${item.name} (-₦${item.price.toLocaleString()}, +${item.effects?.mutunci || 5} Mutunci).`,
            type: 'lifestyle',
            nairaChange: -item.price,
            mutunciChange: item.effects?.mutunci || 5,
          });
          get().addNotice(`Room Furnished: ${item.name}!`, 'positive');
          return { success: true, message: 'Furnishing placed.' };
        }

        // Consumables (Food, Wellness, Fuel)
        set({
          naira: state.naira - item.price,
          energy: clamp(state.energy + (item.effects?.energy || 0), GAME_CONFIG.STATS.MIN_ENERGY, GAME_CONFIG.STATS.MAX_ENERGY),
          health: clamp(state.health + (item.effects?.health || 0), GAME_CONFIG.STATS.MIN_HEALTH, GAME_CONFIG.STATS.MAX_HEALTH),
          mutunci: clamp(state.mutunci + (item.effects?.mutunci || 0), GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
        });

        get().addLog({
          message: `Consumed ${item.name} (-₦${item.price.toLocaleString()}). Restored vitality!`,
          type: 'lifestyle',
          nairaChange: -item.price,
          energyChange: item.effects?.energy || undefined,
        });

        get().addNotice(`Enjoyed ${item.name}!`, 'positive');
        return { success: true, message: 'Purchased successfully.' };
      },

      upgradeHousing: (tier: HousingTier) => {
        const state = get();
        if (state.housingTier === tier) {
          get().addNotice('You already reside in this housing tier.', 'neutral');
          return { success: false, message: 'Already current tier.' };
        }

        const housing = HOUSING_TIERS[tier];
        if (state.naira < housing.upgradeCost) {
          get().addNotice(`Requires ₦${housing.upgradeCost.toLocaleString()} to move into ${housing.title}.`, 'negative');
          return { success: false, message: 'Insufficient funds.' };
        }

        set({
          naira: state.naira - housing.upgradeCost,
          housingTier: tier,
          mutunci: clamp(state.mutunci + housing.prestigeBonus, GAME_CONFIG.STATS.MIN_MUTUNCI, GAME_CONFIG.STATS.MAX_MUTUNCI),
        });

        get().addLog({
          message: `Relocated to ${housing.title}! Upgraded residence quality (+${housing.prestigeBonus} Mutunci).`,
          type: 'lifestyle',
          nairaChange: -housing.upgradeCost,
          mutunciChange: housing.prestigeBonus,
        });

        get().addNotice(`Relocated to ${housing.title}!`, 'positive');
        return { success: true, message: 'Housing upgraded.' };
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
          avatar: {
            gender: 'male',
            skinTone: '#5a3825',
            attire: 'kaftan',
            attireColor: '#0284c7',
            headwear: 'zanna_bukar',
            headwearColor: '#f1f5f9',
            footwear: 'kano_sandals',
          },
          housingTier: 'student_room',
          ownedFurnishings: ['wooden_bed', 'nightstand', 'work_table'],
          equippedVehicle: 'none',
          commoditiesInventory: {
            sesame_grain: 0,
            sorted_rice: 0,
            smoked_fish: 0,
            sahel_livestock: 0,
            kazaure_dates: 0,
          },
          activeEvent: null,
          eventHistory: [],
          eventCooldowns: {},
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
        avatar: state.avatar,
        housingTier: state.housingTier,
        ownedFurnishings: state.ownedFurnishings,
        equippedVehicle: state.equippedVehicle,
        commoditiesInventory: state.commoditiesInventory,
        activeEvent: state.activeEvent,
        eventHistory: state.eventHistory,
        eventCooldowns: state.eventCooldowns,
        logs: state.logs,
        relationships: state.relationships,
        skills: state.skills,
        isGameOver: state.isGameOver,
        gameOverReason: state.gameOverReason,
      }),
    }
  )
);

