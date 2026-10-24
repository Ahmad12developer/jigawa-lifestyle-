import type {
  GameState,
  GameEvent,
  EventChoice,
  EventTrigger,
  EventEffects,
  EventResolution,
  EventHistoryEntry,
} from '@/types/game';
import { GAME_CONFIG } from '@/config/gameConfig';

/**
 * JIGAWA LIFESTYLE — DYNAMIC LIFE EVENT ENGINE
 * Pure, deterministic, and testable domain engine.
 * 
 * Responsibilities:
 * - Eligibility evaluation (Conditions, Cooldowns, Triggers)
 * - Choice validation (Requirements: money, mutunci, energy, health)
 * - Controlled weighted selection
 * - Safe state resolution & invariant enforcement
 * - Cooldown & history entry creation
 */

/**
 * Evaluates whether an event meets all prerequisites for the given game state.
 */
export function isEventEligible(
  event: GameEvent,
  state: Pick<
    GameState,
    | 'currentLocation'
    | 'selectedBackground'
    | 'season'
    | 'day'
    | 'naira'
    | 'mutunci'
    | 'energy'
    | 'health'
    | 'eventCooldowns'
  >,
  trigger?: EventTrigger
): boolean {
  // 1. Trigger compatibility
  if (trigger && trigger !== 'manual' && !event.triggers.includes(trigger)) {
    return false;
  }

  // 2. Cooldown check: prevent rapid re-occurrence
  if (state.eventCooldowns) {
    const cooldownUntil = state.eventCooldowns[event.id];
    if (cooldownUntil !== undefined && state.day < cooldownUntil) {
      return false;
    }
  }

  // 3. Contextual Conditions
  const cond = event.conditions;
  if (!cond) return true;

  if (cond.locationId && cond.locationId !== state.currentLocation) {
    return false;
  }

  if (cond.background && cond.background !== state.selectedBackground) {
    return false;
  }

  if (cond.season && cond.season !== state.season) {
    return false;
  }

  if (cond.minDay !== undefined && state.day < cond.minDay) {
    return false;
  }

  if (cond.maxDay !== undefined && state.day > cond.maxDay) {
    return false;
  }

  if (cond.minNaira !== undefined && state.naira < cond.minNaira) {
    return false;
  }

  if (cond.maxNaira !== undefined && state.naira > cond.maxNaira) {
    return false;
  }

  if (cond.minMutunci !== undefined && state.mutunci < cond.minMutunci) {
    return false;
  }

  if (cond.maxMutunci !== undefined && state.mutunci > cond.maxMutunci) {
    return false;
  }

  if (cond.minEnergy !== undefined && state.energy < cond.minEnergy) {
    return false;
  }

  if (cond.minHealth !== undefined && state.health < cond.minHealth) {
    return false;
  }

  return true;
}

/**
 * Filters a pool of events to only those eligible under the current state and trigger.
 */
export function getEligibleEvents(
  events: GameEvent[],
  state: GameState,
  trigger: EventTrigger
): GameEvent[] {
  return events.filter((ev) => isEventEligible(ev, state, trigger));
}

/**
 * Validates whether the player satisfies all requirements for a specific choice.
 */
export function canSelectChoice(
  choice: EventChoice,
  state: Pick<GameState, 'naira' | 'mutunci' | 'energy' | 'health' | 'currentLocation' | 'selectedBackground'>
): { canSelect: boolean; reason?: string } {
  if (!choice.requirements || choice.requirements.length === 0) {
    return { canSelect: true };
  }

  for (const req of choice.requirements) {
    switch (req.type) {
      case 'minNaira': {
        const cost = Number(req.value);
        if (state.naira < cost) {
          return {
            canSelect: false,
            reason: req.description || `Insufficient funds: Requires ₦${cost.toLocaleString()} (you have ₦${state.naira.toLocaleString()})`,
          };
        }
        break;
      }
      case 'minMutunci': {
        const threshold = Number(req.value);
        if (state.mutunci < threshold) {
          return {
            canSelect: false,
            reason: req.description || `Requires Mutunci ≥ ${threshold} (you have ${state.mutunci})`,
          };
        }
        break;
      }
      case 'minEnergy': {
        const energyReq = Number(req.value);
        if (state.energy < energyReq) {
          return {
            canSelect: false,
            reason: req.description || `Exhausted: Requires Energy ≥ ${energyReq} (you have ${state.energy})`,
          };
        }
        break;
      }
      case 'minHealth': {
        const healthReq = Number(req.value);
        if (state.health < healthReq) {
          return {
            canSelect: false,
            reason: req.description || `Failing health: Requires Health ≥ ${healthReq} (you have ${state.health})`,
          };
        }
        break;
      }
      case 'location': {
        if (state.currentLocation !== req.value) {
          return {
            canSelect: false,
            reason: req.description || `Must be at ${req.value}`,
          };
        }
        break;
      }
      case 'background': {
        if (state.selectedBackground !== req.value) {
          return {
            canSelect: false,
            reason: req.description || `Requires background ${req.value}`,
          };
        }
        break;
      }
    }
  }

  return { canSelect: true };
}

/**
 * Rolls for an event using weighted selection and trigger probability.
 */
export function rollForEvent(
  state: GameState,
  trigger: EventTrigger,
  events: GameEvent[],
  rng: () => number = Math.random
): GameEvent | null {
  // If an event is already unresolved or game is over, do not spawn another
  if (state.activeEvent !== null || state.isGameOver) {
    return null;
  }

  // 1. Trigger probability check
  if (trigger !== 'manual') {
    const triggerChance = GAME_CONFIG.EVENTS.TRIGGER_CHANCES[trigger] ?? 0.25;
    if (rng() > triggerChance) {
      return null;
    }
  }

  // 2. Filter eligible events
  const eligible = getEligibleEvents(events, state, trigger);
  if (eligible.length === 0) {
    return null;
  }

  // 3. Weighted Random Selection
  const totalWeight = eligible.reduce(
    (acc, ev) => acc + (ev.weight || GAME_CONFIG.EVENTS.DEFAULT_WEIGHT),
    0
  );

  let roll = rng() * totalWeight;
  for (const ev of eligible) {
    const weight = ev.weight || GAME_CONFIG.EVENTS.DEFAULT_WEIGHT;
    if (roll <= weight) {
      return ev;
    }
    roll -= weight;
  }

  return eligible[eligible.length - 1];
}

/**
 * Resolves a choice within an active event, validating requirements and calculating applied effects.
 */
export function resolveEventChoice(
  state: GameState,
  event: GameEvent,
  choiceIdentifier: string
): EventResolution {
  // Locate choice by ID or fallback 'A'/'B' index
  let choice: EventChoice | undefined;
  if (choiceIdentifier === 'A') {
    choice = event.choices[0] || event.choiceA;
  } else if (choiceIdentifier === 'B') {
    choice = event.choices[1] || event.choiceB;
  } else {
    choice = event.choices.find((c) => c.id === choiceIdentifier);
  }

  if (!choice) {
    return {
      eventId: event.id,
      choiceId: choiceIdentifier,
      effectsApplied: {},
      success: false,
      message: 'Specified event choice not found.',
    };
  }

  // Validate choice requirements against current player state
  const validation = canSelectChoice(choice, state);
  if (!validation.canSelect) {
    return {
      eventId: event.id,
      choiceId: choice.id,
      effectsApplied: {},
      success: false,
      message: validation.reason || 'Requirements not met for this choice.',
    };
  }

  // Extract stat impacts (supporting both new effects and legacy statChanges)
  let nairaChange = choice.effects.naira ?? choice.statChanges?.naira ?? 0;
  let mutunciChange = choice.effects.mutunci ?? choice.statChanges?.mutunci ?? 0;
  let energyChange = choice.effects.energy ?? choice.statChanges?.energy ?? 0;
  let healthChange = choice.effects.health ?? choice.statChanges?.health ?? 0;

  // Background Perk: Royal Heritage double Mutunci penalty for negative choices
  if (state.selectedBackground === 'royal_heritage' && mutunciChange < 0) {
    mutunciChange = mutunciChange * GAME_CONFIG.PERKS.ROYAL_MUTUNCI_PENALTY_MULTIPLIER;
  }

  const effectsApplied: EventEffects = {
    naira: nairaChange,
    mutunci: mutunciChange,
    energy: energyChange,
    health: healthChange,
    message: choice.consequence,
    followUpEvents: choice.followUpEvents,
  };

  return {
    eventId: event.id,
    choiceId: choice.id,
    effectsApplied,
    success: true,
    message: choice.consequence,
  };
}

/**
 * Calculates cooldown expiration day for a resolved event.
 */
export function calculateCooldownExpiration(
  event: GameEvent,
  currentDay: number
): number {
  const cooldownDays = event.cooldownDays ?? GAME_CONFIG.EVENTS.DEFAULT_COOLDOWN_DAYS;
  return currentDay + cooldownDays;
}

/**
 * Creates an immutable EventHistoryEntry for the resolved event.
 */
export function createEventHistoryEntry(
  event: GameEvent,
  choice: EventChoice,
  state: GameState,
  effectsApplied: EventEffects
): EventHistoryEntry {
  return {
    id: `ev-hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventId: event.id,
    eventTitle: event.title,
    choiceId: choice.id,
    choiceLabel: choice.label || choice.text || 'Selected Choice',
    day: state.day,
    hour: state.hour,
    season: state.season,
    locationId: state.currentLocation,
    effectsApplied,
    timestamp: Date.now(),
  };
}
