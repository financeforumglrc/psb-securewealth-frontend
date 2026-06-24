# PSB SecureWealth Twin — Clean Project

> Punjab & Sind Bank — Internet Banking Portal (PSB Hackathon 2026)

---

## 📁 Folder Structure

```
PSB-Website-Clean/
├── client/              ← SOURCE CODE (Edit yahan karo)
│   ├── src/             ← React components (App.tsx, components/, etc.)
│   ├── public/          ← Static assets (favicon, icons)
│   ├── dist/            ← Built files (Auto-generated)
│   ├── package.json     ← Dependencies
│   └── vite.config.ts   ← Build config
│
└── dist/                ← PUBLISH KE LIYE (Surge yahan se deploy karo)
    ├── index.html
    ├── 200.html
    └── assets/          ← JS/CSS bundles
```

---

## ✏️ EDIT Karna (Changes karna)

**Source code yahan hai:**
- `client/src/App.tsx` — Main app
- `client/src/components/` — All UI components (Dashboard, Login, etc.)
- `client/src/index.css` — Global styles
- `client/src/store/` — State management

**Example:**
```bash
cd client
npm install          # Pehli baar ya dependencies update ho toh
npm run dev          # Local server chalu (http://localhost:5173)
```

Changes karo → Browser mein auto-refresh hoga.

---

## 🔨 BUILD Karna (Publish ke liye)

```bash
cd client
npm run build
```

Yeh `client/dist/` folder banayega. Uske baad:

**Option A:** Root `dist/` copy kar lo (already updated hai)
**Option B:** `client/dist/` ko directly deploy karo

---

## 🚀 PUBLISH Karna (Surge pe deploy)

```bash
cd dist               # Root dist folder mein jao
surge .               # Domain daal ke deploy
```

Ya agar CNAME file hai toh:
```bash
cd dist
surge . --domain psb-securewealth-2026-new.surge.sh
```

---

## 📦 SHARE Karna (Folder bhejna)

Bas `PSB-Website-Clean` folder zip karo aur bhej do.
- **Size:** ~12 MB (node_modules nahi hai, woh `npm install` se mil jayega)
- **Kya chahiye:** Node.js installed hona chahiye

---

## 🎨 PSB Features Included

- ✅ Punjab & Sind Bank branding (Green/Yellow theme)
- ✅ Internet Banking Portal login
- ✅ Biometric lock screen
- ✅ AI Recommendations
- ✅ Account Aggregator (RBI AA)
- ✅ Live Pulse dashboard
- ✅ Security Beast, Privacy, Tax, Calculators
- ✅ All 15+ innovation features
# Auto-deploy enabled
# Deployed with live backend


## 🛡️ Fraud Intelligence Center (Admin)

The admin portal includes a comprehensive **Fraud Intelligence Center** under the **Fraud Intel** tab:

- **Case Explorer** — filterable table of synthetic fraud cases with status, priority, category, risk score, amount, and country route.
- **Cross-Border Map** — Leaflet map rendering origin → intermediate → destination money trails with sanctioned/high-risk markers.
- **Trace Network** — SVG network graph of accounts, mules, shell companies, and final destinations.
- **Timeline** — chronological view of every money hop.
- **Risk Explainer** — risk-score breakdown and top risk factors across the dataset.
- **Rules & Alerts** — create thresholds that auto-flag or escalate cases.
- **Reports** — download **Excel (.xlsx)**, **CSV (.csv)**, and **PDF summary** exports.
- **Live Simulation** — toggle a live mock feed that injects new cross-border traces every few seconds, or simulate a burst of cases for load testing.

> ⚠️ All fraud data is **synthetic and anonymized**. No real PII or bank account details are used. The architecture is API-ready to plug in an authorized real data source later.

### Seed synthetic fraud data

```bash
cd backend
npm install
npm run seed:fraud 500
```

### Backend fraud routes

Mounted at `/api/v1/fraud` and protected by admin Bearer token:

- `GET /fraud/cases` — list/filter/paginate cases
- `GET /fraud/cases/:id` — full case with hops, accounts, notes
- `POST /fraud/cases/:id/actions` — acknowledge / investigate / escalate / close / false-positive
- `GET /fraud/export/cases?format=xlsx|csv` — export workbook
- `GET /fraud/stats/summary` — KPIs
- `GET|POST|PATCH|DELETE /fraud/rules` — alerting rules engine
