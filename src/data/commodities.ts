import type { Commodity, CommodityId, LocationId, Vehicle, VehicleId } from '@/types/game';

export const COMMODITIES: Commodity[] = [
  {
    id: 'sesame_grain',
    name: 'White Sesame Grain',
    hausaName: 'Ridi (Farar Ridi)',
    unit: 'bag',
    basePrice: 12500,
    baseLocation: 'hadejia_market',
    description: 'Export-grade cleaned white sesame seeds harvested from Hadejia river valley.',
    icon: '🌾',
  },
  {
    id: 'sorted_rice',
    name: 'Fadama Milled Rice',
    hausaName: 'Shinkafar Fadama',
    unit: 'bag',
    basePrice: 34000,
    baseLocation: 'hadejia_market',
    description: 'Parboiled long-grain rice produced across irrigated Hadejia wetlands.',
    icon: '🍚',
  },
  {
    id: 'smoked_fish',
    name: 'Smoked River Catfish',
    hausaName: 'Banda / Kifin Hadejia',
    unit: 'carton',
    basePrice: 8500,
    baseLocation: 'hadejia_market',
    description: 'Freshly caught river catfish smoked with desert acacia wood.',
    icon: '🐟',
  },
  {
    id: 'sahel_livestock',
    name: 'Red Sokoto Breeding Goat',
    hausaName: 'Bunsuru / Akuya',
    unit: 'head',
    basePrice: 26000,
    baseLocation: 'hadejia_market', // Also traded heavily at border markets
    description: 'Resilient Sahelian livestock prized for high-grade leather and meat.',
    icon: '🐐',
  },
  {
    id: 'kazaure_dates',
    name: 'Fresh Dabino Dates & Honey',
    hausaName: 'Dabino & Zuma',
    unit: 'carton',
    basePrice: 7200,
    baseLocation: 'kazaure_agro_tech',
    description: 'Sweet golden dates and pure wild honey harvested from Kazaure oasis groves.',
    icon: '🍯',
  },
];

// Regional Demand Multipliers: How much each district pays relative to base price
export const REGIONAL_DEMAND_FACTORS: Record<LocationId, Record<CommodityId, number>> = {
  // Dutse: Administrative capital with high disposable income, pays premium on all agricultural products
  dutse_secretariat: {
    sesame_grain: 1.45,
    sorted_rice: 1.35,
    smoked_fish: 1.55,
    sahel_livestock: 1.4,
    kazaure_dates: 1.38,
  },
  // Hadejia: The primary producer of grains and fish (cheapest to buy here, lower markup)
  hadejia_market: {
    sesame_grain: 1.0,
    sorted_rice: 1.0,
    smoked_fish: 1.0,
    sahel_livestock: 1.15,
    kazaure_dates: 1.25,
  },
  // FUD Campus: Students and professors demand cheap food, rice, and dates
  fud_campus: {
    sesame_grain: 1.25,
    sorted_rice: 1.2,
    smoked_fish: 1.3,
    sahel_livestock: 1.2,
    kazaure_dates: 1.3,
  },
  // Ringim: Royal court & cultural district, high value on livestock and ceremonial feasts
  ringim_palace: {
    sesame_grain: 1.3,
    sorted_rice: 1.3,
    smoked_fish: 1.4,
    sahel_livestock: 1.5,
    kazaure_dates: 1.45,
  },
  // Kazaure: Producer of dates and honey, high demand for Hadejia rice and fish
  kazaure_agro_tech: {
    sesame_grain: 1.2,
    sorted_rice: 1.35,
    smoked_fish: 1.45,
    sahel_livestock: 1.25,
    kazaure_dates: 1.0,
  },
  // Teaching Hospital: Medical staff & patients needing nourishing rice, fish, dates
  dutse_hospital: {
    sesame_grain: 1.25,
    sorted_rice: 1.3,
    smoked_fish: 1.35,
    sahel_livestock: 1.3,
    kazaure_dates: 1.4,
  },
  // School & Academy: Boarding house food supply & student canteen demands
  dutse_school: {
    sesame_grain: 1.15,
    sorted_rice: 1.2,
    smoked_fish: 1.25,
    sahel_livestock: 1.2,
    kazaure_dates: 1.25,
  },
  // Job Center & MDI: Trainee catering & youth cooperative wholesale
  dutse_job_center: {
    sesame_grain: 1.2,
    sorted_rice: 1.25,
    smoked_fish: 1.3,
    sahel_livestock: 1.25,
    kazaure_dates: 1.3,
  },
  // Takur Commercial Plaza: Affluent merchants, bankers & retail consumers
  takur_commercial: {
    sesame_grain: 1.4,
    sorted_rice: 1.35,
    smoked_fish: 1.5,
    sahel_livestock: 1.45,
    kazaure_dates: 1.4,
  },
};

export const VEHICLES: Record<VehicleId, Vehicle> = {
  none: {
    id: 'none',
    name: 'On Foot / Public Transit',
    price: 0,
    cargoCapacity: 5,
    travelDiscount: 0,
    description: 'Carry goods in pocket satchels. High physical fatigue.',
    icon: '🚶🏽‍♂️',
  },
  bajaj_motorcycle: {
    id: 'bajaj_motorcycle',
    name: 'Bajaj Boxer Motorcycle',
    price: 380000,
    cargoCapacity: 25,
    travelDiscount: 0.35, // 35% cheaper and less fatigue
    description: 'Rugged two-wheeler with side panniers for quick inter-city trade runs.',
    icon: '🏍️',
  },
  toyota_pickup: {
    id: 'toyota_pickup',
    name: 'Toyota Hilux Commercial Pickup',
    price: 2400000,
    cargoCapacity: 100,
    travelDiscount: 0.6, // 60% cheaper travel per unit
    description: 'Heavy-duty savannah transporter capable of moving bulk tons across the Sahel.',
    icon: '🛻',
  },
};
