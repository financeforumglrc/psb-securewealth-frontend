# PSB SecureWealth – Project Manual

> One-stop handoff doc for anyone continuing this project in a fresh session.  
> Last updated: 13 June 2026

---

## 1. What is this project?

**PSB SecureWealth** is an AI-powered, security-first internet-banking demo built for the PSB Hackathon 2026. It showcases:

- A React + Vite + Tailwind CSS v4 frontend
- A Node.js / Express backend with SQLite
- Browser-native security primitives (ML-KEM-768 via `mlkem`, WebAuthn passkeys, behavioral biometrics, fraud engine, browser threat monitor, secure enclave checks, DID, transaction traps, honeytokens, blockchain audit)
- Admin dashboard with live security ops, audit logs, and architecture diagrams

There are **two frontend codebases** on this machine:

| Location | Type | Status |
|----------|------|--------|
| `/tmp/psb-securewealth-frontend/client` | React 19 + Vite + Tailwind v4 | **Active / deployed** |
| `/e/DS_Financial/surge_deploy` & `/e/DS_Financial/deploy` | Older static HTML/JS | Legacy / not currently deployed |

The live site is served from the **React build**.

---

## 2. Repositories & branches

### Frontend (React)
- **Local path:** `/tmp/psb-securewealth-frontend/client`
- **Repo:** `https://github.com/financeforumglrc/psb-securewealth-frontend.git`
- **Branch:** `hackathon-v3`
- **Open MR/PR:** MR #2 / PR against `main`

### Backend
- **Local path:** `/e/DS_Financial/backend`
- **Repo:** `https://github.com/financeforumglrc/psb-banking-backend.git`
- **Branch:** `main`
- **Deployed at:** `https://psb-banking-backend.onrender.com/api/v1`

---

## 3. Tech stack

### Frontend
- React 19.2.5, TypeScript, Vite 6
- Tailwind CSS v4 (`@theme` tokens in `src/index.css`)
- Framer Motion, Recharts, Lucide icons
- State: Zustand (`wealthStore`), React Context (`SecurityContext`)
- Crypto: `mlkem@2.7.0`, Web Crypto API, WebAuthn

### Backend
- Node.js + Express
- SQLite (`better-sqlite3`)
- JWT auth, CORS, Helmet, Morgan, Winston
- Admin status page (`/admin/status`) + JWT API (`/admin/*`)

---

## 4. Local development

### Frontend
```bash
cd /tmp/psb-securewealth-frontend/client
npm install        # only if node_modules missing
npm run dev        # http://localhost:5173
npm run build      # produces dist/
npm run preview    # serve dist locally
```

### Backend
```bash
cd /e/DS_Financial/backend
npm install        # only if node_modules missing
npm run dev        # nodemon on port 5000
# or
npm start          # node server.js on port 5000
```

Backend health/status page:  
`http://localhost:5000/admin/status`

---

## 5. Important files & where to change things

### Frontend (React)
| What you want to change | File |
|------------------------|------|
| Global theme / dark mode / shared classes | `src/index.css`, `tailwind.config.js` |
| App shell, routing, providers | `src/App.tsx` |
| Admin dashboard UI & tabs | `src/components/admin/AdminDashboard.tsx` |
| Security state (trust score, traps, honeytokens) | `src/context/SecurityContext.tsx` |
| Architecture diagram | `src/components/architecture/SystemArchitecture.tsx` |
| Features cosmos / catalog | `src/components/architecture/FeaturesUniverse.tsx` |
| Backend API base URL | `src/lib/backendApi.ts` (defaults to Render backend) |
| Security components | `src/components/security/*.tsx` |
| Dashboard widgets | `src/components/dashboard/*.tsx` |
| Payment widgets | `src/components/payments/*.tsx` |
| Demo account data | `src/data/userProfiles.ts`, `src/data/demoAccounts.ts` |

### Backend
| What you want to change | File |
|------------------------|------|
| Server entry, middleware, routes mount | `server.js` |
| Admin login / users / stats / status | `routes/admin.js` |
| API routes | `routes/*.js` |
| Database / models | `services/database.js`, `models/*.js` |
| Environment config | `.env` |

---

## 6. Credentials & keys

> **Never commit `.env` files.** The values below are the current dev/demo values used locally and on Render. Rotate before any real production release.

### Admin portal login
- **Admin ID:** `TEAM EXCELLENT MINDS`
- **Admin Password:** `123456@#Dd`
- **API token format:** Base64 of `TEAM EXCELLENT MINDS:123456@#Dd`
- **Login route:** `POST /api/v1/admin/login`

### Backend `.env` (`/e/DS_Financial/backend/.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/ds_financial.db
JWT_SECRET=ds-financial-dev-secret-key-2024-secure
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENCRYPTION_KEY=ds-financial-32char-encryption-key
FRONTEND_URL=http://localhost:5500
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

Optional keys (currently empty – add only if you enable those features):
- `KIMI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- `GSTN_CLIENT_ID`, `GSTN_CLIENT_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

### Frontend `.env` (`/tmp/psb-securewealth-frontend/client/.env`)
```env
VITE_SUPABASE_URL=https://placeholder.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...placeholder
```

**Note:** Supabase is currently a placeholder. To enable real auth / OTP, replace these with values from your Supabase project settings → API.

### Surge deployment
- **Domain:** `psb-securewealth-2026-new.surge.sh`
- **Surge account (on this machine):** `sw-deploy-32902@tmpmail.org`
- Surge is already authenticated on this machine (`surge whoami` should match the account above).

---

## 7. Deployment workflow

### Deploy the React frontend
```bash
cd /tmp/psb-securewealth-frontend/client
npm run build
surge dist psb-securewealth-2026-new.surge.sh
```

After deploy, access with a cache-busting query param. Bump the version each deploy:
```
https://psb-securewealth-2026-new.surge.sh/?v=31
```

### Deploy the backend
The backend is deployed on Render from `financeforumglrc/psb-banking-backend:main`.  
Push to `main` and Render auto-deploys:
```bash
cd /e/DS_Financial/backend
git add -A
git commit -m "describe change"
git push origin main
```

If CORS errors appear after a frontend deploy, make sure the backend `CORS_ORIGINS` / `FRONTEND_URL` includes the Surge domain.

---

## 8. Common gotchas

1. **Admin panel crashes / white screen**  
   `AdminDashboard` uses `useSecurity()`. It must be rendered inside `SecurityProvider`. The fix is already in `App.tsx` (admin route wraps `AdminDashboard` with its own `SecurityProvider`).

2. **Admin dashboard shows `0` for a few seconds**  
   This was fixed by setting demo stats synchronously in `loadData()` before the backend fetch. Demo data always renders instantly; backend data merges when it arrives.

3. **CORS errors in local preview**  
   The preview runs on `localhost:4xxx` but points to the Render backend. Either run the backend locally and set `VITE_BACKEND_URL=http://localhost:5000/api/v1`, or expect CORS from Render for local testing.

4. **NSE India CORS errors**  
   Pre-existing; the market view uses `allorigins.win` proxy which is sometimes blocked. Not related to your changes.

5. **Dynamic Tailwind classes**  
   Tailwind v4 does not interpolate class names like `bg-${color}-500`. Any new component with color variants must use a static map (see `BehavioralEngine.tsx`, `PredictiveShieldBadge.tsx`, etc.).

---

## 9. Quick verification checklist after changes

- [ ] `npm run build` passes with no new errors
- [ ] `npm run preview` loads homepage
- [ ] Clicking **Admin Portal** opens the admin login
- [ ] Admin login with credentials above reaches Control Center
- [ ] Dashboard stats are non-zero immediately
- [ ] Security Ops tab shows trust score and feature tiles
- [ ] Deployed Surge URL with `?v=XX` loads correctly

---

## 10. Contact / ownership

- Project: Punjab & Sind Bank SecureWealth (PSB Hackathon 2026)
- Team: Excellent Minds
- Frontend repo: `financeforumglrc/psb-securewealth-frontend`
- Backend repo: `financeforumglrc/psb-banking-backend`
