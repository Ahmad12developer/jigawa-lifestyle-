import type { GameEvent } from '@/types/game';

/**
 * JIGAWA LIFESTYLE — DYNAMIC LIFE EVENT LIBRARY (PHASE 2)
 * Authentic socioeconomic, cultural, and environmental encounters across Jigawa State.
 * 
 * Each event provides:
 * - Specific triggers (afterJob, afterTravel, afterRest, startOfDay)
 * - Controlled weights (Everyday: 60-80, Uncommon: 30-50, Rare: 10-25)
 * - Cooldown days to prevent immediate repetition
 * - Contextual conditions (location, season, background, minimum stats)
 * - Granular choice requirements & validated stat consequences
 * - Backward-compatible adapters (choiceA, choiceB, text, statChanges)
 */

type RawEventDefinition = Omit<GameEvent, 'choiceA' | 'choiceB'>;

const RAW_EVENTS: RawEventDefinition[] = [
  // 1. ECONOMIC / MARKET (Hadejia Grain Hub)
  {
    id: 'event-sesame-surge',
    title: 'Sesame Harvest Price Surge',
    hausaTitle: 'Tashin Farashin Ridi a Kasuwar Hadejia',
    description: 'Commercial grain merchants from Kano and Lagos pull into Hadejia Market with cash-loaded trucks, igniting an aggressive bidding war for cleaned sesame bags.',
    category: 'economic',
    triggers: ['afterJob', 'afterTravel'],
    weight: 60,
    cooldownDays: 4,
    conditions: {
      locationId: 'hadejia_market',
    },
    choices: [
      {
        id: 'sesame_liquidate_now',
        label: 'Liquidate Stored Sesame Stock',
        text: 'Liquidate stored stock immediately to lock in cash profits',
        consequence: 'You trade your accumulated bags swiftly and pocket substantial cash revenue.',
        requirements: [{ type: 'minEnergy', value: 10, description: 'Requires 10 Energy to haul bags' }],
        effects: { naira: 45000, energy: -10, mutunci: 5 },
        statChanges: { naira: 45000, energy: -10, mutunci: 5 },
      },
      {
        id: 'sesame_negotiate_bulk',
        label: 'Hold & Negotiate Bulk Exporter Contract',
        text: 'Hold inventory and negotiate with international consortium',
        consequence: 'You spend hours haggling in the union office. The deal pays less instant cash, but elders respect your business acumen.',
        requirements: [
          { type: 'minMutunci', value: 20, description: 'Requires Mutunci ≥ 20 for elders to grant audience' },
          { type: 'minEnergy', value: 15, description: 'Requires 15 Energy' },
        ],
        effects: { naira: 22000, mutunci: 15, energy: -15 },
        statChanges: { naira: 22000, mutunci: 15, energy: -15 },
      },
      {
        id: 'sesame_connect_farmers',
        label: 'Broker Deals for Local Smallholders',
        text: 'Connect struggling village farmers to buyers for a modest commission',
        consequence: 'Farmers from Auyo and Kirikasamma bless your honesty. You take a fair broker fee and earn lasting community respect.',
        requirements: [{ type: 'minEnergy', value: 10, description: 'Requires 10 Energy' }],
        effects: { naira: 15000, mutunci: 20, energy: -10 },
        statChanges: { naira: 15000, mutunci: 20, energy: -10 },
      },
    ],
  },

  // 2. WEATHER / ENVIRONMENTAL (Harmattan Dust Storm)
  {
    id: 'event-harmattan-haze',
    title: 'Severe Harmattan Dust Storm',
    hausaTitle: 'Buguwar Kakar Hunturu da Kura',
    description: 'A dense Saharan dust storm blankets the Sudan savannah plains. The sun is reduced to a dull silver disc, and biting chilly winds parch throats and sting eyes.',
    category: 'weather',
    triggers: ['startOfDay', 'afterRest', 'afterTravel'],
    weight: 50,
    cooldownDays: 3,
    conditions: {
      season: 'Harmattan',
    },
    choices: [
      {
        id: 'harmattan_shelter_tea',
        label: 'Shelter Indoors with Hot Ginger Tea (Shayi)',
        text: 'Stay sheltered indoors, drink hot ginger tea & recuperate',
        consequence: 'You sip steaming ginger-clove shayi, safeguarding your lungs and recovering vitality.',
        requirements: [{ type: 'minNaira', value: 1200, description: 'Costs ₦1,200 for tea & firewood' }],
        effects: { naira: -1200, energy: 20, health: 10 },
        statChanges: { naira: -1200, energy: 20, health: 10 },
      },
      {
        id: 'harmattan_brave_elements',
        label: 'Wrap Rawani Headscarf & Keep Hustling',
        text: 'Wrap traditional headscarf tight and push through daily work',
        consequence: 'You earn extra income filling shifts others abandoned, but the harsh dry chill drains your physical stamina.',
        requirements: [{ type: 'minEnergy', value: 25, description: 'Requires 25 Energy' }],
        effects: { naira: 14000, energy: -25, health: -10 },
        statChanges: { naira: 14000, energy: -25, health: -10 },
      },
      {
        id: 'harmattan_distribute_masks',
        label: 'Distribute Dust Masks to Street Porters',
        text: 'Buy a carton of protective dust masks and share with street laborers',
        consequence: 'Cart pushers and wheelbarrow porters commend your empathy. Your Mutunci rises noticeably.',
        requirements: [
          { type: 'minNaira', value: 6000, description: 'Costs ₦6,000 for mask carton' },
          { type: 'minEnergy', value: 5, description: 'Requires 5 Energy' },
        ],
        effects: { naira: -6000, mutunci: 18, energy: -5 },
        statChanges: { naira: -6000, mutunci: 18, energy: -5 },
      },
    ],
  },

  // 3. SOCIAL / FAMILY (Prominent Wedding Fatiha)
  {
    id: 'event-wedding-fatiha',
    title: 'Prominent Wedding Fatiha Contribution',
    hausaTitle: 'Gudunmawar Dauren Aure',
    description: 'An influential family patriarch invites you to a major wedding solemnization taking place after Friday prayers at Dutse Central Mosque.',
    category: 'social',
    triggers: ['startOfDay', 'afterRest', 'afterJob'],
    weight: 55,
    cooldownDays: 5,
    conditions: {},
    choices: [
      {
        id: 'wedding_generous_gift',
        label: 'Sponsor Generous Gift & Fabric (₦25,000)',
        text: 'Donate generous cash gift (₦25,000) & present traditional fabric',
        consequence: 'Your generous contribution is acknowledged before the gathering. Your name gains prestige among state dignitaries.',
        requirements: [{ type: 'minNaira', value: 25000, description: 'Requires ₦25,000 cash' }],
        effects: { naira: -25000, mutunci: 22, energy: -5 },
        statChanges: { naira: -25000, mutunci: 22, energy: -5 },
      },
      {
        id: 'wedding_modest_gift',
        label: 'Present Modest Contribution (₦5,000)',
        text: 'Offer humble prayer, modest gift of ₦5,000, and assist with logistics',
        consequence: 'You fulfill social protocol honorably while shielding your personal reserves.',
        requirements: [{ type: 'minNaira', value: 5000, description: 'Requires ₦5,000 cash' }],
        effects: { naira: -5000, mutunci: 6, energy: -10 },
        statChanges: { naira: -5000, mutunci: 6, energy: -10 },
      },
      {
        id: 'wedding_prayers_only',
        label: 'Send Sincere Congratulations & Prayers Only',
        text: 'Politely decline attendance with respectful prayers and excuses',
        consequence: 'You spend nothing, but rumors circulate that you are becoming distant from community traditions.',
        effects: { naira: 0, mutunci: -6, energy: 5 },
        statChanges: { naira: 0, mutunci: -6, energy: 5 },
      },
    ],
  },

  // 4. OPPORTUNITY / TECH & POS (Campus Cash Crunch)
  {
    id: 'event-campus-pos-crunch',
    title: 'University ATM Cash Drought',
    hausaTitle: 'Karancin Kudi a Bankunan FUD',
    description: 'All Automated Teller Machines around Federal University Dutse (FUD) run dry on cash. Crowds of stranded students and junior lecturers throng merchant stalls.',
    category: 'opportunity',
    triggers: ['afterJob', 'afterTravel'],
    weight: 45,
    cooldownDays: 4,
    conditions: {
      locationId: 'fud_campus',
    },
    choices: [
      {
        id: 'pos_surge_fees',
        label: 'Charge Premium Surge Convenience Fees',
        text: 'Hike POS withdrawal fee to ₦500 per thousand to capitalize on desperation',
        consequence: 'You reap huge short-term cash margins, but students grumble bitterly about extortion.',
        requirements: [
          { type: 'minNaira', value: 15000, description: 'Requires ₦15,000 cash float' },
          { type: 'minEnergy', value: 15, description: 'Requires 15 Energy' },
        ],
        effects: { naira: 35000, mutunci: -10, energy: -15 },
        statChanges: { naira: 35000, mutunci: -10, energy: -15 },
      },
      {
        id: 'pos_standard_ethical',
        label: 'Maintain Ethical Regulated Rates',
        text: 'Keep fair standard charges and dispense maximum ₦10,000 per person',
        consequence: 'Grateful campus staff commend your upright character. Word spreads of your integrity.',
        requirements: [
          { type: 'minNaira', value: 15000, description: 'Requires ₦15,000 cash float' },
          { type: 'minEnergy', value: 15, description: 'Requires 15 Energy' },
        ],
        effects: { naira: 18000, mutunci: 14, energy: -15 },
        statChanges: { naira: 18000, mutunci: 14, energy: -15 },
      },
      {
        id: 'pos_refer_town_bank',
        label: 'Direct Crowds to Town Branches Without Trading',
        text: 'Direct people to commercial bank branches in central Dutse town',
        consequence: 'You avoid the operational headache and preserve your energy.',
        effects: { naira: 0, mutunci: 2, energy: 0 },
        statChanges: { naira: 0, mutunci: 2, energy: 0 },
      },
    ],
  },

  // 5. CULTURAL / TRADITION (Ringim Palace Durbar)
  {
    id: 'event-ringim-durbar',
    title: 'Ringim Royal Durbar Procession',
    hausaTitle: 'Hawan Sallah a Fadar Ringim',
    description: 'The ancient Emirate of Ringim celebrates its annual royal procession. Trumpeters (Kakaki) sound resonant fanfares as costumed cavalry gallop past the palace archway.',
    category: 'cultural',
    triggers: ['afterTravel', 'startOfDay'],
    weight: 40,
    cooldownDays: 6,
    conditions: {
      locationId: 'ringim_palace',
    },
    choices: [
      {
        id: 'durbar_sponsor_refreshments',
        label: 'Sponsor Traditional Drinks for Palace Guards',
        text: 'Sponsor cooling Zobo and fura refreshments for palace guard corps (₦15,000)',
        consequence: 'Palace officials register your loyalty and benevolence with warm regards.',
        requirements: [{ type: 'minNaira', value: 15000, description: 'Requires ₦15,000' }],
        effects: { naira: -15000, mutunci: 24, energy: -5 },
        statChanges: { naira: -15000, mutunci: 24, energy: -5 },
      },
      {
        id: 'durbar_hawk_refreshments',
        label: 'Hawk Sachet Water & Snacks to Festive Crowds',
        text: 'Rent a vendor tray and hawk cold refreshments among the spectators',
        consequence: 'You hustle through the crowd, making good sales under the festive heat.',
        requirements: [{ type: 'minEnergy', value: 20, description: 'Requires 20 Energy' }],
        effects: { naira: 12000, mutunci: 3, energy: -20 },
        statChanges: { naira: 12000, mutunci: 3, energy: -20 },
      },
      {
        id: 'durbar_spectate_respectfully',
        label: 'Witness the Procession & Offer Blessings',
        text: 'Stand respectfully among the crowd and absorb the cultural heritage',
        consequence: 'You enjoy the rich historic pageantry without expense.',
        effects: { naira: 0, mutunci: 6, energy: -5 },
        statChanges: { naira: 0, mutunci: 6, energy: -5 },
      },
    ],
  },

  // 6. CAREER / INNOVATION (Kazaure Agro-Tech Grant)
  {
    id: 'event-kazaure-tech-pitch',
    title: 'Kazaure Smart Irrigation Pitch',
    hausaTitle: 'Tallafin Fasahar Noma a Kazaure',
    description: 'A renewable agriculture foundation visiting Kazaure Dam hosts a pitch forum seeking local operators for drip-irrigation sensor installations.',
    category: 'career',
    triggers: ['afterJob', 'startOfDay'],
    weight: 35,
    cooldownDays: 5,
    conditions: {
      locationId: 'kazaure_agro_tech',
    },
    choices: [
      {
        id: 'kazaure_present_proposal',
        label: 'Present Comprehensive Irrigation Proposal',
        text: 'Pitch a solar-powered reservoir distribution proposal to the panel',
        consequence: 'The panel awards you a competitive pilot grant and lauds your forward-looking mindset.',
        requirements: [
          { type: 'minMutunci', value: 25, description: 'Requires Mutunci ≥ 25' },
          { type: 'minEnergy', value: 25, description: 'Requires 25 Energy' },
        ],
        effects: { naira: 50000, mutunci: 16, energy: -25 },
        statChanges: { naira: 50000, mutunci: 16, energy: -25 },
      },
      {
        id: 'kazaure_attend_networking',
        label: 'Participate as an Observer & Network',
        text: 'Sit through technical sessions, ask questions, and collect business cards',
        consequence: 'You gain valuable industry contacts and a modest transport stipend.',
        requirements: [{ type: 'minEnergy', value: 10, description: 'Requires 10 Energy' }],
        effects: { naira: 5000, mutunci: 8, energy: -10 },
        statChanges: { naira: 5000, mutunci: 8, energy: -10 },
      },
      {
        id: 'kazaure_skip_pitch',
        label: 'Focus on Day-to-Day Farm Chores',
        text: 'Decline to attend and finish routine local errands',
        consequence: 'You avoid the intellectual strain and preserve your stamina.',
        effects: { naira: 0, mutunci: 0, energy: 0 },
        statChanges: { naira: 0, mutunci: 0, energy: 0 },
      },
    ],
  },

  // 7. TRAVEL / HIGHWAY (Expressway Transit Puncture)
  {
    id: 'event-highway-transit-puncture',
    title: 'Expressway Transit Breakdown',
    hausaTitle: 'Lalacewar Motar Kasuwa a Hanya',
    description: 'Your commuter Peugeot station wagon suffers a tire blowout along the sunbaked highway. The elderly driver is struggling with a rusted tire iron.',
    category: 'travel',
    triggers: ['afterTravel'],
    weight: 50,
    cooldownDays: 3,
    conditions: {},
    choices: [
      {
        id: 'travel_help_jack_tire',
        label: 'Help the Elderly Driver Change the Tire',
        text: 'Roll up your sleeves in the dust and assist in changing the heavy tire',
        consequence: 'Passengers and driver praise your humility and teamwork. You get back on the road safely.',
        requirements: [{ type: 'minEnergy', value: 20, description: 'Requires 20 Energy' }],
        effects: { naira: 0, mutunci: 15, energy: -20 },
        statChanges: { naira: 0, mutunci: 15, energy: -20 },
      },
      {
        id: 'travel_charter_achaba',
        label: 'Charter Passing Motorcycle (Achaba)',
        text: 'Flag down a passing commercial motorcyclist to finish the journey briskly',
        consequence: 'You arrive at your destination in rapid time, though your pocket takes a minor dent.',
        requirements: [{ type: 'minNaira', value: 2500, description: 'Requires ₦2,500 bike fare' }],
        effects: { naira: -2500, mutunci: 0, energy: -5 },
        statChanges: { naira: -2500, mutunci: 0, energy: -5 },
      },
      {
        id: 'travel_wait_acacia_shade',
        label: 'Wait Patiently Under Acacia Shade',
        text: 'Sit quietly under a shady tree while the transport crew sort out the wheel',
        consequence: 'You lose an hour of daylight but conserve your physical strength.',
        effects: { naira: 0, mutunci: 1, energy: -5 },
        statChanges: { naira: 0, mutunci: 1, energy: -5 },
      },
    ],
  },

  // 8. CAREER / BUREAUCRACY (Secretariat Audit Verification)
  {
    id: 'event-secretariat-audit',
    title: 'Secretariat Personnel Verification',
    hausaTitle: 'Tantance Ma\'aikata a Sakatariyar Dutse',
    description: 'A surprise task force from the State Civil Service Commission arrives at Dutse Central Secretariat to review staff records, timebooks, and project vouchers.',
    category: 'career',
    triggers: ['afterJob', 'startOfDay'],
    weight: 40,
    cooldownDays: 5,
    conditions: {
      locationId: 'dutse_secretariat',
    },
    choices: [
      {
        id: 'audit_impeccable_dossier',
        label: 'Submit Impeccable Files & Stay Overtime',
        text: 'Present orderly records and assist the inspection panel until evening',
        consequence: 'The commission notes your diligence in their official memo. You receive an overtime honorarium.',
        requirements: [{ type: 'minEnergy', value: 20, description: 'Requires 20 Energy' }],
        effects: { naira: 16000, mutunci: 20, energy: -20 },
        statChanges: { naira: 16000, mutunci: 20, energy: -20 },
      },
      {
        id: 'audit_sign_routine_register',
        label: 'Sign Standard Attendance Registry',
        text: 'Queue peacefully, sign your credentials, and return to your desk',
        consequence: 'Your status is certified without issue or fanfare.',
        requirements: [{ type: 'minEnergy', value: 5, description: 'Requires 5 Energy' }],
        effects: { naira: 0, mutunci: 5, energy: -5 },
        statChanges: { naira: 0, mutunci: 5, energy: -5 },
      },
      {
        id: 'audit_slip_away_early',
        label: 'Leave Early to Dodge Bureaucratic Questioning',
        text: 'Slip past the security gate early to avoid grilling by examiners',
        consequence: 'Your desk is marked unattended by inspectors. Whispers damage your standing.',
        effects: { naira: 0, mutunci: -12, energy: 10 },
        statChanges: { naira: 0, mutunci: -12, energy: 10 },
      },
    ],
  },

  // 9. COMMUNITY (Neighborhood Borehole Repair)
  {
    id: 'event-borehole-breakdown',
    title: 'Community Borehole Mechanical Failure',
    hausaTitle: 'Lalacewar Famfon Tuka-Tuka',
    description: 'The sole public water borehole in the neighborhood snaps its handpump rod. Women and children queue with empty yellow jerrycans under the afternoon sun.',
    category: 'community',
    triggers: ['startOfDay', 'afterRest', 'afterTravel'],
    weight: 50,
    cooldownDays: 4,
    conditions: {},
    choices: [
      {
        id: 'borehole_finance_repair',
        label: 'Fund Pump Replacement & Mechanic (₦12,000)',
        text: 'Call a known water technician and pay for replacement brass components',
        consequence: 'Clean water flows again within an hour. The Ward Head (Mai Unguwa) publicly prays for your prosperity.',
        requirements: [{ type: 'minNaira', value: 12000, description: 'Requires ₦12,000' }],
        effects: { naira: -12000, mutunci: 26, energy: -5 },
        statChanges: { naira: -12000, mutunci: 26, energy: -5 },
      },
      {
        id: 'borehole_organize_collection',
        label: 'Contribute ₦3,000 & Mobilize Youth Drive',
        text: 'Contribute ₦3,000 cash and organize youths to collect neighbor tokens',
        consequence: 'The community pools together the remaining funds. Your civic initiative is commended.',
        requirements: [
          { type: 'minNaira', value: 3000, description: 'Requires ₦3,000' },
          { type: 'minEnergy', value: 15, description: 'Requires 15 Energy' },
        ],
        effects: { naira: -3000, mutunci: 14, energy: -15 },
        statChanges: { naira: -3000, mutunci: 14, energy: -15 },
      },
      {
        id: 'borehole_walk_past',
        label: 'Offer Sympathies & Walk On',
        text: 'Mutter that the local government should fix it and continue walking',
        consequence: 'Neighbors notice you turned a blind eye to public hardship.',
        effects: { naira: 0, mutunci: -5, energy: 0 },
        statChanges: { naira: 0, mutunci: -5, energy: 0 },
      },
    ],
  },

  // 10. ECONOMIC / AGRICULTURE (Subsidized Fertilizer Voucher)
  {
    id: 'event-fertilizer-allocation',
    title: 'State Subsidized Fertilizer Allocation',
    hausaTitle: 'Rabon Takin Zamani na Gwamnati',
    description: 'A consignment of government-subsidized NPK fertilizer arrives at the agricultural depot. Scalpers are already hovering around the depot gate.',
    category: 'economic',
    triggers: ['afterJob', 'afterTravel'],
    weight: 45,
    cooldownDays: 5,
    conditions: {},
    choices: [
      {
        id: 'fertilizer_buy_quota',
        label: 'Purchase Legitimate Quota (₦20,000)',
        text: 'Queue legally and buy your allocated quota of 2 bags at subsidized rate',
        consequence: 'You secure high-value farming inputs that save you enormous market purchase costs later.',
        requirements: [
          { type: 'minNaira', value: 20000, description: 'Requires ₦20,000' },
          { type: 'minEnergy', value: 15, description: 'Requires 15 Energy' },
        ],
        effects: { naira: -20000, mutunci: 8, energy: -15 },
        statChanges: { naira: -20000, mutunci: 8, energy: -15 },
      },
      {
        id: 'fertilizer_report_racketeers',
        label: 'Report Black-Market Scalpers to Depot Chairman',
        text: 'Alert the monitoring committee of illegal resale syndicates outside',
        consequence: 'The committee impounds the hoarders\' truck. Genuine farmers applaud your courage.',
        requirements: [{ type: 'minMutunci', value: 15, description: 'Requires Mutunci ≥ 15' }],
        effects: { naira: 0, mutunci: 18, energy: -10 },
        statChanges: { naira: 0, mutunci: 18, energy: -10 },
      },
      {
        id: 'fertilizer_ignore_crowd',
        label: 'Ignore the Agitation & Move Along',
        text: 'Leave the crowded warehouse premises without getting involved',
        consequence: 'You avoid the chaos entirely.',
        effects: { naira: 0, mutunci: 0, energy: 0 },
        statChanges: { naira: 0, mutunci: 0, energy: 0 },
      },
    ],
  },

  // 11. SOCIAL / INTEGRITY (Found Motor Park Wallet)
  {
    id: 'event-lost-wallet-transit',
    title: 'Misplaced Cash Wallet at Motor Park',
    hausaTitle: 'Tsinciyar Kudi a Tashar Mota',
    description: 'While resting on a bench at the regional motor park, you spot a leather pouch containing ₦35,000 cash and an identification card forgotten by a traveler.',
    category: 'social',
    triggers: ['afterTravel', 'afterJob'],
    weight: 40,
    cooldownDays: 6,
    conditions: {},
    choices: [
      {
        id: 'wallet_return_station_union',
        label: 'Hand Over to the National Union (NURTW) Chairman',
        text: 'Hand the pouch to park union elders to broadcast and trace the owner',
        consequence: 'The owner is located via phone. Drivers and elders salute your incorruptible honesty.',
        effects: { naira: 0, mutunci: 25, energy: -5 },
        statChanges: { naira: 0, mutunci: 25, energy: -5 },
      },
      {
        id: 'wallet_wait_owner_call',
        label: 'Wait & Personally Return to Owner',
        text: 'Answer the owner\'s frantic incoming phone call and return the cash in person',
        consequence: 'The tearful merchant rewards you with ₦8,000 gratitude token and hearty prayers.',
        requirements: [{ type: 'minEnergy', value: 10, description: 'Requires 10 Energy' }],
        effects: { naira: 8000, mutunci: 20, energy: -10 },
        statChanges: { naira: 8000, mutunci: 20, energy: -10 },
      },
      {
        id: 'wallet_pocket_cash',
        label: 'Quietly Pocket the Cash & Leave',
        text: 'Conceal the money in your pocket and swiftly walk out of the station',
        consequence: 'You gain instant money, but a prickling guilt and wary glances dog your footsteps.',
        effects: { naira: 35000, mutunci: -25, energy: 0 },
        statChanges: { naira: 35000, mutunci: -25, energy: 0 },
      },
    ],
  },

  // 12. CULTURAL / RELIGIOUS (Friday Jum\'ah Charity Sadaqah)
  {
    id: 'event-jumah-charity-sadaqah',
    title: 'Friday Jum\'ah Sadaqah Feeding',
    hausaTitle: 'Ciyarwa Ranar Juma\'a a Babban Masallaci',
    description: 'It is Friday in Dutse. Large crowds assemble outside the Grand Mosque after afternoon prayers, including elderly disabled persons and travelers.',
    category: 'cultural',
    triggers: ['startOfDay', 'afterJob'],
    weight: 55,
    cooldownDays: 4,
    conditions: {},
    choices: [
      {
        id: 'jumah_sponsor_food_pots',
        label: 'Sponsor Food Trays & Cold Water (₦10,000)',
        text: 'Pay a local bukka to prepare large trays of food and cold sachet water',
        consequence: 'Dozens eat to their fill and pray fervently for your good fortune and health.',
        requirements: [{ type: 'minNaira', value: 10000, description: 'Requires ₦10,000' }],
        effects: { naira: -10000, mutunci: 22, health: 5 },
        statChanges: { naira: -10000, mutunci: 22, health: 5 },
      },
      {
        id: 'jumah_give_small_alms',
        label: 'Distribute Small Naira Notes (₦2,000)',
        text: 'Hand out small currency notes to elderly people waiting by the gates',
        consequence: 'You discharge your religious duty conscientiously.',
        requirements: [{ type: 'minNaira', value: 2000, description: 'Requires ₦2,000' }],
        effects: { naira: -2000, mutunci: 8, energy: 0 },
        statChanges: { naira: -2000, mutunci: 8, energy: 0 },
      },
      {
        id: 'jumah_pray_only',
        label: 'Perform Prayers & Offer Good Wishes',
        text: 'Say your prayers respectfully and depart quietly without monetary alms',
        consequence: 'Your mind feels tranquil after prayer.',
        effects: { naira: 0, mutunci: 3, energy: 5 },
        statChanges: { naira: 0, mutunci: 3, energy: 5 },
      },
    ],
  },

  // 13. RISK / EMERGENCY (Generator Fire Outbreak)
  {
    id: 'event-market-fire-scare',
    title: 'Market Generator Spark Emergency',
    hausaTitle: 'Hatsarin Wutar Lantarki a Kasuwa',
    description: 'Black smoke suddenly billows from a faulty generator behind a textile stall. Dry straw mats catch fire and flames begin licking nearby wooden roof beams.',
    category: 'risk',
    triggers: ['afterJob', 'afterTravel'],
    weight: 35,
    cooldownDays: 5,
    conditions: {},
    choices: [
      {
        id: 'fire_haul_sand_buckets',
        label: 'Haul Sand Buckets & Fight the Fire',
        text: 'Lead neighboring youths in tossing heavy buckets of sand and foam on the flames',
        consequence: 'You smother the blaze before it engulfs the lane. Traders hail you as a selfless savior.',
        requirements: [
          { type: 'minEnergy', value: 30, description: 'Requires 30 Energy' },
          { type: 'minHealth', value: 20, description: 'Requires Health ≥ 20' },
        ],
        effects: { naira: 0, mutunci: 28, energy: -30, health: -5 },
        statChanges: { naira: 0, mutunci: 28, energy: -30, health: -5 },
      },
      {
        id: 'fire_secure_own_valuables',
        label: 'Secure Your Personal Belongings & Evacuate',
        text: 'Grab your own money pouch and retreat across the street to safety',
        consequence: 'You escape unscathed while others battle the heat.',
        effects: { naira: 0, mutunci: -4, energy: 0 },
        statChanges: { naira: 0, mutunci: -4, energy: 0 },
      },
      {
        id: 'fire_alert_emergency_corps',
        label: 'Call State Fire Service & Direct Water Vendors',
        text: 'Dial emergency lines and organize commercial water tankers nearby',
        consequence: 'Your quick organizational thinking helps contain the destruction.',
        requirements: [{ type: 'minEnergy', value: 10, description: 'Requires 10 Energy' }],
        effects: { naira: 0, mutunci: 14, energy: -10 },
        statChanges: { naira: 0, mutunci: 14, energy: -10 },
      },
    ],
  },

  // 14. FAMILY / WELFARE (Hospital Medical Emergency)
  {
    id: 'event-family-medical-call',
    title: 'Urgent Family Medical Emergency',
    hausaTitle: 'Jinyar Dan\'uwa a Asibiti',
    description: 'A frantic distress call comes in: your maternal cousin has contracted acute malaria and typhoid and has been admitted at Rasheed Shekoni Specialist Hospital in Dutse.',
    category: 'family',
    triggers: ['startOfDay', 'afterRest'],
    weight: 45,
    cooldownDays: 5,
    conditions: {},
    choices: [
      {
        id: 'hospital_settle_full_bill',
        label: 'Settle Full Admission & Pharmacy Bill (₦20,000)',
        text: 'Transfer funds immediately to clear the ward admission, drips, and antibiotics',
        consequence: 'Your cousin recovers swiftly. Family elders send emotional voice notes of gratitude.',
        requirements: [{ type: 'minNaira', value: 20000, description: 'Requires ₦20,000' }],
        effects: { naira: -20000, mutunci: 24, health: 0 },
        statChanges: { naira: -20000, mutunci: 24, health: 0 },
      },
      {
        id: 'hospital_send_partial_relief',
        label: 'Send Emergency Partial Assistance (₦5,000)',
        text: 'Send ₦5,000 cash for preliminary testing while looking for other relatives',
        consequence: 'You provide vital first aid assistance within your realistic means.',
        requirements: [{ type: 'minNaira', value: 5000, description: 'Requires ₦5,000' }],
        effects: { naira: -5000, mutunci: 8, energy: -5 },
        statChanges: { naira: -5000, mutunci: 8, energy: -5 },
      },
      {
        id: 'hospital_promise_prayers_only',
        label: 'Explain You Are Broke & Offer Prayers',
        text: 'Lament that your finances are completely drained and pray for speedy recovery',
        consequence: 'Relatives are dismayed, whispering that you turned your back on kin.',
        effects: { naira: 0, mutunci: -12, energy: 0 },
        statChanges: { naira: 0, mutunci: -12, energy: 0 },
      },
    ],
  },

  // 15. WEATHER / RAINY (River Basin Flash Flooding)
  {
    id: 'event-river-basin-flood',
    title: 'Hadejia Riverbank Flash Flooding',
    hausaTitle: 'Ambaliyar Ruwa a Kogin Hadejia',
    description: 'Upstream dams release excess water during consecutive downpours. The Hadejia riverbank overflows, swamping market access roads and mud huts.',
    category: 'weather',
    triggers: ['afterJob', 'afterTravel'],
    weight: 40,
    cooldownDays: 5,
    conditions: {
      season: 'Rainy',
    },
    choices: [
      {
        id: 'flood_pile_sandbags',
        label: 'Join Youth Sandbag Embankment Taskforce',
        text: 'Work through the muddy water to erect protective sandbag dikes',
        consequence: 'Your physical labor keeps market stalls dry. Community leadership lauds your heroism.',
        requirements: [
          { type: 'minEnergy', value: 25, description: 'Requires 25 Energy' },
          { type: 'minHealth', value: 15, description: 'Requires Health ≥ 15' },
        ],
        effects: { naira: 0, mutunci: 22, energy: -25, health: -5 },
        statChanges: { naira: 0, mutunci: 22, energy: -25, health: -5 },
      },
      {
        id: 'flood_hire_handcart_evac',
        label: 'Hire Handcart (Kura) to Evacuate Stock (₦3,500)',
        text: 'Pay local handcart pushers to move your gear to upland warehouses',
        consequence: 'Your goods stay dry without exhausting your physical stamina.',
        requirements: [{ type: 'minNaira', value: 3500, description: 'Requires ₦3,500' }],
        effects: { naira: -3500, mutunci: 0, energy: -5 },
        statChanges: { naira: -3500, mutunci: 0, energy: -5 },
      },
      {
        id: 'flood_seek_highland_shelter',
        label: 'Retreat to Dry Highland Concrete Quarters',
        text: 'Head to town highlands and stay dry until floodwaters recede',
        consequence: 'You stay safe, though missing market business.',
        effects: { naira: 0, mutunci: -2, energy: 5 },
        statChanges: { naira: 0, mutunci: -2, energy: 5 },
      },
    ],
  },

  // 16. RISK / CRIME (Suspicious POS Withdrawal Customer)
  {
    id: 'event-suspicious-pos-transfer',
    title: 'Suspicious High-Value Account Request',
    hausaTitle: 'Zargin Zamba a Harkar POS',
    description: 'A slick, anxious customer in dark sunglasses offers a ₦15,000 tip if you quickly withdraw ₦300,000 without demanding government ID or bank verification.',
    category: 'risk',
    triggers: ['afterJob'],
    weight: 35,
    cooldownDays: 5,
    conditions: {},
    choices: [
      {
        id: 'pos_reject_alert_police',
        label: 'Refuse Transaction & Demand Official BVN ID',
        text: 'Firmly decline the shady cash request and alert nearby market security',
        consequence: 'The suspect flees in haste. Neighboring shopkeepers respect your strict principles.',
        effects: { naira: 0, mutunci: 18, energy: -5 },
        statChanges: { naira: 0, mutunci: 18, energy: -5 },
      },
      {
        id: 'pos_accept_lucrative_bribe',
        label: 'Take the Cash Tip & Process Withdrawal',
        text: 'Pocket the lucrative ₦15,000 cash tip and dispense the money without questions',
        consequence: 'You make fast cash, but bank compliance freezes your terminal hours later under investigation.',
        effects: { naira: 15000, mutunci: -24, energy: -10 },
        statChanges: { naira: 15000, mutunci: -24, energy: -10 },
      },
      {
        id: 'pos_feign_network_failure',
        label: 'Pretend the Network is Down',
        text: 'Politely apologize and claim the bank network server is unreachable',
        consequence: 'The customer wanders away peacefully without risk or reward.',
        effects: { naira: 0, mutunci: 2, energy: 0 },
        statChanges: { naira: 0, mutunci: 2, energy: 0 },
      },
    ],
  },

  // 17. SOCIAL (Evening Suya Spot Price Dispute)
  {
    id: 'event-suya-spot-dispute',
    title: 'Evening Suya Stand Heated Quarrel',
    hausaTitle: 'Jayayya a Shagon Mai Suya',
    description: 'At a bustling evening grilled-meat stall, a furious quarrel erupts between the popular butcher (Mai Suya) and an aggressive customer over counterfeit change.',
    category: 'social',
    triggers: ['afterJob', 'afterRest'],
    weight: 50,
    cooldownDays: 3,
    conditions: {},
    choices: [
      {
        id: 'suya_mediate_peacefully',
        label: 'Step In as Respectful Community Mediator',
        text: 'Use your diplomatic stature to calm both parties and audit the banknotes',
        consequence: 'Your calm reasoning resolves the deadlock peacefully. The grateful butcher slips you extra suya skewers.',
        requirements: [{ type: 'minMutunci', value: 20, description: 'Requires Mutunci ≥ 20 to command respect' }],
        effects: { naira: 0, mutunci: 14, energy: 5, health: 5 },
        statChanges: { naira: 0, mutunci: 14, energy: 5, health: 5 },
      },
      {
        id: 'suya_pay_difference',
        label: 'Pay Disputed ₦1,000 Deficit (₦1,000)',
        text: 'Drop ₦1,000 on the counter to settle the argument on the spot',
        consequence: 'Both men shake hands and thank you for saving the night from violence.',
        requirements: [{ type: 'minNaira', value: 1000, description: 'Requires ₦1,000' }],
        effects: { naira: -1000, mutunci: 10, energy: 0 },
        statChanges: { naira: -1000, mutunci: 10, energy: 0 },
      },
      {
        id: 'suya_ignore_dispute',
        label: 'Mind Your Business & Eat Silently',
        text: 'Look down at your plate and let them shout it out between themselves',
        consequence: 'You finish your dinner without involvement.',
        effects: { naira: 0, mutunci: -2, energy: 0 },
        statChanges: { naira: 0, mutunci: -2, energy: 0 },
      },
    ],
  },

  // 18. OPPORTUNITY / REPUTATION (Traditional Chieftaincy Recognition)
  {
    id: 'event-emirate-title-prospect',
    title: 'Emirate Council Recognition Whispers',
    hausaTitle: 'Kishin-Kishin din Sarauta a Masarauta',
    description: 'Palace aides intimate that your rising Mutunci and community service have reached the Emir\'s traditional council for consideration of an honorary title.',
    category: 'opportunity',
    triggers: ['startOfDay', 'afterTravel'],
    weight: 25,
    cooldownDays: 7,
    conditions: {
      minMutunci: 45,
    },
    choices: [
      {
        id: 'title_commission_regalia',
        label: 'Commission Regal Robes & Pay Palace Homage (₦30,000)',
        text: 'Order custom embroidered robes (babban riga) and present greetings to senior councilors',
        consequence: 'The Waziri receives you cordially. Your reputation ascends to regional prominence.',
        requirements: [
          { type: 'minNaira', value: 30000, description: 'Requires ₦30,000 for formal gift & attire' },
          { type: 'minMutunci', value: 45, description: 'Requires Mutunci ≥ 45' },
        ],
        effects: { naira: -30000, mutunci: 28, energy: -10 },
        statChanges: { naira: -30000, mutunci: 28, energy: -10 },
      },
      {
        id: 'title_humble_acknowledgement',
        label: 'Acknowledge Emissaries with Sincere Humility',
        text: 'Express deep gratitude without engaging in lavish displays or lobbying',
        consequence: 'Elders praise your grounded modesty. True honor is recognized without purchase.',
        effects: { naira: 0, mutunci: 15, energy: 0 },
        statChanges: { naira: 0, mutunci: 15, energy: 0 },
      },
      {
        id: 'title_keep_low_profile',
        label: 'Keep a Low Profile to Avoid Political Envy',
        text: 'Distance yourself subtly to prevent rivalry from ambitious local elites',
        consequence: 'You avoid unnecessary court friction and retain your quiet autonomy.',
        effects: { naira: 0, mutunci: 4, energy: 5 },
        statChanges: { naira: 0, mutunci: 4, energy: 5 },
      },
    ],
  },
];

// Export strongly-typed GAME_EVENTS with choiceA and choiceB populated
export const GAME_EVENTS: GameEvent[] = RAW_EVENTS.map((ev) => ({
  ...ev,
  category: ev.category as GameEvent['category'],
  triggers: ev.triggers as GameEvent['triggers'],
  choiceA: ev.choices[0],
  choiceB: ev.choices[1],
  contextLocation: ev.conditions?.locationId,
}));

