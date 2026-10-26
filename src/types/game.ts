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
  | 'kazaure_agro_tech'
  | 'dutse_hospital'
  | 'dutse_school'
  | 'dutse_job_center'
  | 'takur_commercial'
  | 'dutse_mosque'
  | 'dutse_airport'
  | 'aminu_kano_triangle'
  | 'dutse_stadium'
  | 'takur_estate';

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

// --- CHARACTER CUSTOMIZATION DOMAIN MODEL ---

export type GenderType = 'male' | 'female';
export type AttireType = 'babban_riga' | 'kaftan' | 'jalabiya' | 'tech_hoodie' | 'ankara_gown';
export type HeadwearType = 'zanna_bukar' | 'damanga' | 'rawani_turban' | 'hijab_gyale' | 'none';
export type FootwearType = 'kano_sandals' | 'babouche' | 'sneakers';

export interface AvatarCustomization {
  gender: GenderType;
  skinTone: string; // hex color e.g. '#5a3825'
  attire: AttireType;
  attireColor: string; // hex color
  headwear: HeadwearType;
  headwearColor: string; // hex color
  footwear: FootwearType;
}

// --- HOUSING & REAL ESTATE TIERS ---

export type HousingTier = 'student_room' | 'town_flat' | 'savanna_villa';

export interface HousingDetails {
  tier: HousingTier;
  title: string;
  hausaTitle: string;
  description: string;
  upgradeCost: number;
  weeklyRent: number;
  locationId: LocationId;
  prestigeBonus: number;
}

// --- REGIONAL COMMODITY ARBITRAGE SYSTEM ---

export type CommodityId =
  | 'sesame_grain'
  | 'sorted_rice'
  | 'smoked_fish'
  | 'sahel_livestock'
  | 'kazaure_dates';

export interface Commodity {
  id: CommodityId;
  name: string;
  hausaName: string;
  unit: string; // e.g. 'bag', 'carton', 'head'
  basePrice: number;
  baseLocation: LocationId;
  description: string;
  icon: string;
}

export type VehicleId = 'none' | 'bajaj_motorcycle' | 'toyota_pickup';

export interface Vehicle {
  id: VehicleId;
  name: string;
  price: number;
  cargoCapacity: number; // Max total commodity units
  travelDiscount: number; // 0 - 1 factor
  description: string;
  icon: string;
}

// --- EMIRATE PRESTIGE & ROYAL TITLES ---

export interface EmirateTitle {
  id: string;
  title: string;
  hausaTitle: string;
  minMutunci: number;
  minNaira: number;
  badge: string;
  perks: string;
}

// --- PHASE 2: DYNAMIC LIFE EVENT ENGINE DOMAIN MODEL ---

export type EventCategory =
  | 'economic'
  | 'social'
  | 'family'
  | 'career'
  | 'weather'
  | 'market'
  | 'travel'
  | 'community'
  | 'opportunity'
  | 'risk'
  | 'cultural';

export type EventTrigger =
  | 'afterJob'
  | 'afterTravel'
  | 'afterRest'
  | 'startOfDay'
  | 'endOfDay'
  | 'manual';

export interface EventConditions {
  locationId?: LocationId;
  background?: BackgroundId;
  season?: Season;
  minDay?: number;
  maxDay?: number;
  minNaira?: number;
  maxNaira?: number;
  minMutunci?: number;
  maxMutunci?: number;
  minEnergy?: number;
  minHealth?: number;
}

export type RequirementType =
  | 'minNaira'
  | 'minMutunci'
  | 'minEnergy'
  | 'minHealth'
  | 'location'
  | 'background';

export interface EventRequirement {
  type: RequirementType;
  value: number | string;
  description?: string;
}

export interface EventEffects {
  naira?: number;
  mutunci?: number;
  energy?: number;
  health?: number;
  message?: string;
  followUpEvents?: string[];
}

export interface EventChoice {
  id: string;
  label: string;
  description?: string;
  consequence: string;
  requirements?: EventRequirement[];
  effects: EventEffects;
  followUpEvents?: string[];

  // Backward compatibility with legacy UI components
  text: string;
  statChanges: {
    naira?: number;
    mutunci?: number;
    energy?: number;
    health?: number;
  };
}

export interface GameEvent {
  id: string;
  title: string;
  hausaTitle?: string;
  description: string;
  category: EventCategory;
  triggers: EventTrigger[];
  weight: number;
  cooldownDays?: number;
  conditions?: EventConditions;
  choices: EventChoice[];

  // Backward compatibility with legacy code
  contextLocation?: LocationId;
  choiceA: EventChoice;
  choiceB: EventChoice;
}

export type RandomEvent = GameEvent;

export interface EventHistoryEntry {
  id: string;
  eventId: string;
  eventTitle: string;
  choiceId: string;
  choiceLabel: string;
  day: number;
  hour: number;
  season: Season;
  locationId: LocationId;
  effectsApplied: EventEffects;
  timestamp: number;
}

export interface EventResolution {
  eventId: string;
  choiceId: string;
  effectsApplied: EventEffects;
  success: boolean;
  message: string;
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
  // Character Customization & Identity
  avatar: AvatarCustomization;
  housingTier: HousingTier;
  ownedFurnishings: string[];
  equippedVehicle: VehicleId;
  commoditiesInventory: Record<CommodityId, number>;

  // Phase 2: Event Engine State
  activeEvent: GameEvent | null;
  eventHistory: EventHistoryEntry[];
  eventCooldowns: Record<string, number>; // eventId -> day until which it is on cooldown
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
  setAvatarCustomization: (updates: Partial<AvatarCustomization>) => void;
  performJob: (job: string | Job) => { success: boolean; message: string };
  rest: () => void;
  eatBukka: () => { success: boolean; message: string };
  pray: () => { success: boolean; message: string };
  travel: (location: LocationId | GameLocation) => { success: boolean; message: string };
  buyCommodity: (commodityId: CommodityId, quantity: number) => { success: boolean; message: string };
  sellCommodity: (commodityId: CommodityId, quantity: number) => { success: boolean; message: string };
  getCommodityMarketPrice: (commodityId: CommodityId, locationId: LocationId) => number;
  buyShopItem: (item: { id: string; name: string; price: number; category: string; effects?: any }) => { success: boolean; message: string };
  upgradeHousing: (tier: HousingTier) => { success: boolean; message: string };
  getEmirateTitle: () => EmirateTitle;
  triggerRandomEvent: (event?: GameEvent) => void;
  evaluateTrigger: (trigger: EventTrigger) => GameEvent | null;
  resolveEvent: (choice: 'A' | 'B' | string) => EventResolution | null;
  handleEventChoice: (choice: 'A' | 'B') => void;
  canSelectEventChoice: (choice: EventChoice) => boolean;
  dismissEvent: () => void;
  addLog: (log: Omit<GameLog, 'id' | 'day' | 'hour' | 'season'>) => void;
  addNotice: (text: string, type?: 'positive' | 'negative' | 'neutral') => void;
  removeNotice: (id: string) => void;
  borrowLoan: () => void;
  resetGame: () => void;
  purgeAllData: () => void;
  exportSaveData: () => string;
  importSaveData: (jsonStr: string) => { success: boolean; message: string };
}
