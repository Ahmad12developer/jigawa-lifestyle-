/**
 * JIGAWA LIFESTYLE — GAME CONFIGURATION & BALANCING CONSTANTS
 * Central authoritative source for balancing, costs, limits, and rules.
 */

export const GAME_CONFIG = {
  // Player Stat Boundaries
  STATS: {
    MAX_ENERGY: 100,
    MIN_ENERGY: 0,
    MAX_HEALTH: 100,
    MIN_HEALTH: 0,
    MAX_MUTUNCI: 100,
    MIN_MUTUNCI: 0,
    MIN_NAIRA: 0, // In standard state; debt handled via distress loans
  },

  // Time & Calendar Rules
  TIME: {
    START_DAY: 1,
    START_HOUR: 8, // 8:00 AM
    WAKE_UP_HOUR: 6, // 6:00 AM after sleep
    HOURS_PER_DAY: 24,
    SEASON_CYCLE_DAYS: 30, // 1-10 Harmattan, 11-20 Dry, 21-30 Rainy
  },

  // Routine & Living Upkeep
  UPKEEP: {
    REST_LODGING_COST: 1500, // Naira deducted for lodging on rest (if affordable)
    REST_ENERGY_RESTORE: 100, // Energy replenished to full
    REST_HEALTH_RESTORE: 20, // Health point increase on sleep
    BUKKA_MEAL_COST: 800, // Quick bukka meal fee
    BUKKA_HEALTH_RESTORE: 15,
    BUKKA_ENERGY_RESTORE: 10,
    PRAYER_MUTUNCI_BONUS: 3, // Reflection & Mutunci boost
  },

  // Origin Background Perks
  PERKS: {
    AGRO_MARKET_PAYOUT_BONUS: 0.15, // +15% payout on Hadejia market gigs
    CIVIL_SERVANT_MUTUNCI_INTERVAL_DAYS: 7, // Days between auto-tenure bonus
    CIVIL_SERVANT_MUTUNCI_BONUS: 5, // +5 Mutunci every 7 days
    TECH_ENERGY_COST_FACTOR: 0.9, // 10% lower energy drain on FUD campus gigs
    ROYAL_MUTUNCI_PENALTY_MULTIPLIER: 2, // 2x Mutunci loss for unethical choices
  },

  // Emergency & Bankruptcy
  DISTRESS: {
    MICROFINANCE_LOAN_AMOUNT: 75000,
    LOAN_MUTUNCI_PENALTY: 15,
    RECOVERY_HEALTH: 80,
    RECOVERY_ENERGY: 90,
  },

  // Event Engine Probabilities & Balancing
  EVENTS: {
    TRIGGER_CHANCES: {
      afterJob: 0.25, // 25% chance after working a gig
      afterTravel: 0.35, // 35% chance after regional road travel
      afterRest: 0.20, // 20% chance upon waking up
      startOfDay: 0.30, // 30% chance of morning life event
      endOfDay: 0.15, // 15% chance of evening situation
      manual: 1.0, // 100% for forced/manual triggers
    },
    DEFAULT_COOLDOWN_DAYS: 3, // Minimum days before same event can recur
    DEFAULT_WEIGHT: 50,
  },

  // Persistence Versioning
  SAVE: {
    VERSION: 1,
    STORAGE_KEY: 'jigawa-lifestyle-save-v1',
  },
} as const;
