# 🌱 EcoQuest — Gamified Personal Sustainability Platform

EcoQuest is a gamified personal sustainability platform that transforms real-world eco-friendly activities into repeatable game quests, verified proof submissions, Eco Points (EcoXP), character levels, titles, streaks, and achievement badges.

---

## 🎯 Key Features & Rules

1. **Separation of Concerns**: Completely decoupled `/frontend` (React + Vite + React Router DOM + Modular CSS) and `/backend` (Node.js + Express.js + SQLite + REST Services).
2. **No Authentication / Direct Entry**: Starts directly in Demo Profile Setup (`/setup`) or redirects to the Game Dashboard (`/dashboard`) if a profile exists.
3. **Deterministic Carbon Calculation**: Baseline carbon footprint is calculated **strictly deterministically** using structured lifestyle data and central emission factors (`emissionFactors.js`). AI is never used for carbon calculations.
4. **4 Permanent Repeatable Quests**:
   - **Public Transport**: Route calculation ➔ Multi-step journey proof ➔ Geo-location validation.
   - **Cycling**: Bicycle photo proof ➔ Distance calculation ➔ AI visual consistency verification.
   - **Electricity Saver**: Electricity bill upload ➔ OCR/AI month extraction ➔ Duplicate billing period protection ➔ Energy reduction reward bonus.
   - **Plant Care**: Photo proof of plant care action ➔ Cooldown window check ➔ Verified EcoXP.
5. **Idempotent EcoXP Ledger**: Point transactions recorded in `eco_point_transactions` with database-enforced `UNIQUE(submission_id)` constraint.
6. **Progression System**: XP thresholds drive automatic Level increases (Level 1–6) and Title updates (`Eco Starter` to `Eco Guardian`).

---

## 📁 Repository Structure

```
d:\ANUSHA\EcoQuest/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── emissionFactors.js
│   │   │   ├── gameConfig.js
│   │   │   ├── questConfig.js
│   │   │   └── avatarConfig.js
│   │   ├── database/
│   │   │   ├── db.js
│   │   │   ├── schema.sql
│   │   │   └── seed.js
│   │   ├── services/
│   │   │   ├── profileService.js
│   │   │   ├── carbonService.js
│   │   │   ├── questService.js
│   │   │   ├── submissionService.js
│   │   │   ├── verificationService.js
│   │   │   ├── ecoPointService.js
│   │   │   ├── levelService.js
│   │   │   ├── badgeService.js
│   │   │   ├── streakService.js
│   │   │   ├── progressionService.js
│   │   │   └── impactService.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── uploads/
│   │   └── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/avatars/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## 🚀 How to Run Locally

### 1. Start the Backend API (Port 5000)

```bash
cd backend
npm install
npm start
```

### 2. Start the Frontend Development Server (Port 3000)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🔬 Deterministic Carbon Formulas

- **Transport**: `(daily_distance_km × travel_days_per_week × 4.33) × transport_factor`
- **Electricity**: `(monthly_bill / 8.0 / household_size) × 0.82 kg CO2e/kWh`
- **Food**: `daily_factor (vegetarian: 0.9, mixed: 1.6, non_vegetarian: 2.5) × 30 days`
- **Shopping**: `minimal: 20, moderate: 60, frequent: 120 kg CO2e/month`
- **Waste**: `segregated: 5, partially_segregated: 15, unsegregated: 30 kg CO2e/month`

---

## 🛡️ License

ISC License — Prototype for Hackathon & Production Architecture.
