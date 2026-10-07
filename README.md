# Jigawa Lifestyle (Rayuwar Jigawa) 🇳🇬🌾

An authentic, fast-loading browser life simulation game set in **Jigawa State, Nigeria**.

Inspired by retro-modern life simulation classics and regional cultural hubs, **Jigawa Lifestyle** lets you navigate the hustle, prestige (*Mutunci*), agriculture, and commerce across Dutse, Hadejia, Ringim, and Kazaure.

---

## 🎮 Core Game Mechanics

* **Primary Stats**:
  * **Naira Balance (₦)**: Liquid pocket cash for transactions, travel fares, and food.
  * **Mutunci (0–100)**: Social respect and community dignity. Essential for unlocking prestigious opportunities and traditional emirate roles.
  * **Stamina & Energy (0–100%)**: Drains during work shifts and travel; restored by resting overnight.
  * **Health (0–100%)**: Vitality impacted by fatigue, harsh Harmattan dust, or poor nutrition; restored by meals and sleep.
* **In-Game Calendar & Environment**:
  * Real-time 24-hour clock cycle.
  * Day counter with seasonal cycles: **Harmattan**, **Dry Season**, and **Rainy Season**.
* **4 Unique Origin Backgrounds**:
  * **Agro-Entrepreneur**: Rooted in Hadejia. High grain reserves & trade potential; +15% payout bonus on agricultural trade jobs.
  * **Dutse Civil Servant**: Stationed at the State Secretariat. High starting Mutunci; +5 Mutunci tenure bonus every 7 days.
  * **Tech & POS Hustler**: Based around the FUD Campus Hub. Fast-moving; 10% lower energy drain on campus tech gigs.
  * **Royal & Elite Heritage**: Historic emirate lineage. High starting capital (₦850,000) and Mutunci (90); double Mutunci penalty on unethical actions.
* **5 Authentic Regional Locations**:
  * **Dutse State Secretariat**: Administrative heart, rocky hills, and ministerial ministries.
  * **Hadejia Grain & Livestock Market**: Epicenter of sesame, rice, and smoked river fish wholesale.
  * **Federal University Dutse (FUD) Hub**: Vibrant student avenue, POS agents, tech freelancers, and cafeterias.
  * **Ringim Historic & Cultural District**: Durbar festival logistics, equestrian crafts, and palace heritage.
  * **Kazaure Innovation & Farming Hub**: Automated dam irrigation, solar technicians, and date processing.
* **12 Detailed Occupations**: From mobile POS handling and thesis binding to bulk sesame trading, cattle auctions, and solar maintenance.
* **Random Cultural Events Engine**: Dynamic dilemma modals with Hausa cultural context, dual-branching choices, and stat consequences.
* **Sound & Micro-Interactions**: Native Web Audio API synth feedback (happy coin chimes, motor travel sounds, sleep lullabies, event chimes) with audio mute/unmute toggle.
* **Bankruptcy & Distress Recovery**: Distress micro-finance loans or clean restarts when facing bankruptcy.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 14+ / 16](https://nextjs.org/) (App Router, React 19)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a Northern Nigerian cultural palette (Warm Sand `#F5E6CA`, Deep Emerald Green `#064E3B`, Terrazzo Clay `#C2593F`)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware (saves state automatically to browser `localStorage`)
* **Audio FX**: Native Web Audio API (zero external assets required)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Directory Architecture

```plaintext
jigawa-lifestyle/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── StatGrid.tsx
│   │   ├── CharacterCard.tsx
│   │   ├── ActionPanel.tsx
│   │   ├── LocationMap.tsx
│   │   ├── EventModal.tsx
│   │   └── LogFeed.tsx
│   ├── hooks/
│   │   ├── useRandomEvents.ts
│   │   └── useSoundFX.ts
│   ├── store/
│   │   └── useGameStore.ts
│   ├── types/
│   │   └── game.ts
│   └── data/
│       ├── backgrounds.json
│       ├── locations.json
│       ├── jobs.json
│       └── randomEvents.json
└── package.json
```

---

## 📜 License
MIT License. Created by [Ahmad12developer](https://github.com/Ahmad12developer).
