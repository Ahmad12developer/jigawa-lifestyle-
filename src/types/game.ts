/**
 * JIGAWA LIFESTYLE — CORE DOMAIN TYPE SYSTEM
 * Foundations for Player, Economy, Mutunci, Locations, Gigs, Events, Skills, and Relationships.
 */

export type Season = 'Dry' | 'Harmattan' | 'Rainy';

export type BackgroundId =
  | 'agro_entrepreneur'
  | 'dutse_civil_servant'
  | 'tech_pos_hustler'
  | 'royal_heritage';

export interface StartingStats {
  naira: number;
  mutunci: number;
  energy: number;
  health: number;
}

export interface PlayerBackground {
  id: BackgroundId;
  title: string;
  description: string;
  startingStats: StartingStats;
  perks: string;
  homeLocation: LocationId;
}

export type LocationId =
  | 'dutse_secretariat'
  | 'hadejia_market'
  | 'fud_campus'
  | 'ringim_palace'
  | 'kazaure_agro_tech';

export interface GameLocation {
  id: LocationId;
  name: string;
  hausaName?: string;
  zone: string;
  description: string;
  travelCost: number;
  unlockedByDefault: boolean;
  availableJobIds: string[];
  economicSpecialty?: string;
  coordinates?: [number, number, number];
}

export interface Job {
  id: string;
  title: string;
  locationId: LocationId;
  energyCost: number;
  timeHours: number;
  payoutNaira: number;
  mutunciChange: number;
  description: string;
}

export interface EventChoice {
  text: string;
  consequence: string;
  statChanges: {
    naira?: number;
    mutunci?: number;
    energy?: number;
    health?: number;
  };
}

export interface RandomEvent {
  id: string;
  title: string;
  hausaTitle?: string;
  description: string;
  contextLocation?: LocationId;
  choiceA: EventChoice;
  choiceB: EventChoice;
}

export interface GameLog {
  id: string;
  day: number;
  hour: number;
  season: Season;
  message: string;
  type: 'job' | 'rest' | 'travel' | 'event' | 'lifestyle' | 'warning' | 'info';
  nairaChange?: number;
  mutunciChange?: number;
  energyChange?: number;
}

export interface FloatingNotice {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

// --- EXTENSIBILITY FOUNDATIONS FOR PILLARS 2, 3, 4 (Social Capital, Relationships & Skills) ---

export type RelationshipTier = 'stranger' | 'acquaintance' | 'friend' | 'business_partner' | 'mentor' | 'rival';

export interface NPCRelationship {
  npcId: string;
  name: string;
  role: string;
  locationId: LocationId;
  trust: number;        // 0 - 100
  mutunciRespect: number; // 0 - 100
  tier: RelationshipTier;
  lastInteractionDay?: number;
}

export type SkillCategory = 'business' | 'agriculture' | 'technology' | 'social';

export interface PlayerSkill {
  id: string;
  name: string;
  category: SkillCategory;
  level: number; // 1 - 10
  xp: number;
}

// --- CENTRAL GAME STATE INTERFACE ---

export interface GameState {
  // Primary Player Stats
  naira: number;
  mutunci: number; // 0 - 100
  energy: number;  // 0 - 100
  health: number;  // 0 - 100

  // Calendar & Clock
  day: number;
  hour: number;    // 0 - 23
  season: Season;

  // Navigation & Character Identity
  currentLocation: LocationId;
  selectedBackground: BackgroundId | null;
  activeEvent: RandomEvent | null;
  logs: GameLog[];
  floatingNotices: FloatingNotice[];

  // Extensibility Reservoirs (Prepared for Phase 2+)
  relationships: Record<string, NPCRelationship>;
  skills: Record<string, PlayerSkill>;

  // Game Status
  isGameOver: boolean;
  gameOverReason: string | null;

  // Core Game Actions
  chooseBackground: (pathId: BackgroundId) => void;
  performJob: (job: string | Job) => { success: boolean; message: string };
  rest: () => void;
  eatBukka: () => { success: boolean; message: string };
  pray: () => { success: boolean; message: string };
  travel: (location: LocationId | GameLocation) => { success: boolean; message: string };
  triggerRandomEvent: (event?: RandomEvent) => void;
  resolveEvent: (choice: 'A' | 'B') => void;
  handleEventChoice: (choice: 'A' | 'B') => void;
  dismissEvent: () => void;
  addLog: (log: Omit<GameLog, 'id' | 'day' | 'hour' | 'season'>) => void;
  addNotice: (text: string, type?: 'positive' | 'negative' | 'neutral') => void;
  removeNotice: (id: string) => void;
  borrowLoan: () => void;
  resetGame: () => void;
}
