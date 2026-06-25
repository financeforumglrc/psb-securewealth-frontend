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

## 🗄️ Database Migration (SQLite → PostgreSQL)

The backend ships with a one-line DB adapter:

```bash
# Copy the example environment
cp backend/.env.example backend/.env

# Hackathon / demo — SQLite (default)
DB_TYPE=sqlite

# Production — provision a Postgres instance, then:
DB_TYPE=postgres
DATABASE_URL=postgresql://user:pass@host:5432/psb_securewealth
```

The adapter layer lives in `backend/services/db/index.js`. All existing route code continues to work unchanged; only the active adapter switches.

> Note: The PostgreSQL adapter is currently a stub for demonstration. Migrating production data would require porting the 30-table SQLite schema to Postgres and updating the adapter implementation.
