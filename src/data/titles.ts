import type { EmirateTitle } from '@/types/game';

export const EMIRATE_TITLES: EmirateTitle[] = [
  {
    id: 'talaka',
    title: 'Respected Commoner',
    hausaTitle: 'Talaka Mai Mutunci',
    minMutunci: 0,
    minNaira: 0,
    badge: '🌱',
    perks: 'Everyday citizen navigating the savannah hustle.',
  },
  {
    id: 'dan_amana',
    title: 'The Trusted Merchant',
    hausaTitle: 'Dan Amana na Kasuwa',
    minMutunci: 75,
    minNaira: 350000,
    badge: '🤝',
    perks: '5% bonus on all commodity selling prices; traders extend credit without collateral.',
  },
  {
    id: 'wakilin_matasa',
    title: 'Youth & Tech Envoy',
    hausaTitle: 'Wakilin Matasa',
    minMutunci: 85,
    minNaira: 1200000,
    badge: '⚡',
    perks: 'Immunity to police roadblocks; 10% lower energy fatigue across all travel.',
  },
  {
    id: 'wakilin_kasuwa',
    title: 'Emirate Commerce Chief',
    hausaTitle: 'Wakilin Kasuwa',
    minMutunci: 92,
    minNaira: 3500000,
    badge: '👑',
    perks: 'Private audience at the Emir’s Palace; 15% wholesale arbitrage discount; royal procession honors.',
  },
];
