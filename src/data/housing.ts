import type { HousingDetails, HousingTier } from '@/types/game';

export const HOUSING_TIERS: Record<HousingTier, HousingDetails> = {
  student_room: {
    tier: 'student_room',
    title: 'Single Hustler Quarters',
    hausaTitle: 'Dakin Matasa',
    description: 'Compact room with cement floor, single foam bed, ceiling fan, and plastic jerrycan.',
    upgradeCost: 0,
    weeklyRent: 6500,
    locationId: 'fud_campus',
    prestigeBonus: 0,
  },
  town_flat: {
    tier: 'town_flat',
    title: 'Modern Town Self-Contain',
    hausaTitle: 'Gidan Gari Mai Faci',
    description: 'Tiled two-tone floor, standing solar fan, wooden workstation, and TV console in central Dutse.',
    upgradeCost: 280000,
    weeklyRent: 22000,
    locationId: 'dutse_secretariat',
    prestigeBonus: 12,
  },
  savanna_villa: {
    tier: 'savanna_villa',
    title: 'Royal Savanna Villa',
    hausaTitle: 'Katon Gidan Sarauta',
    description: 'Expansive private compound with decorated mud arches, solar array, leather armchairs, and horse paddock.',
    upgradeCost: 1850000,
    weeklyRent: 65000,
    locationId: 'ringim_palace',
    prestigeBonus: 35,
  },
};
