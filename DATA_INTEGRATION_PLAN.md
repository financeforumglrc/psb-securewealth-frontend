# SecureWealth Twin — Comprehensive Data Integration Plan

> Goal: Populate login accounts, transactions, admin portal, fraud map, market signals, and wealth recommendations with 450–500 realistic synthetic records + reference real public data sources, so the demo feels live and the team can say "our data sources are many."

---

## 1. Data Sources We Will Reference

### Real / Public APIs (quoted in pitch, used as fallback/simulation)
| Source | What it gives | Where used |
|--------|---------------|------------|
| **RBI Official** (rbi.org.in, DBIE) | Repo rate, CPI inflation, USD/INR reference | Macro signals, Wealth Twin rebalance logic |
| **NSE India** (nseindia.com) | NIFTY 50, sectoral indices, P/E | Market view, portfolio rebalancing |
| **MCX India** | Gold price (₹/10g) | Asset valuation, macro radar |
| **Kaggle — Bank Transaction Fraud Detection** | Synthetic fraud-labeled transactions | Fraud model training, protection layer demo |
| **Kaggle — Indian Personal Finance & Spending Habits** | 20k Indian income/expense records | Spending pattern simulation, persona generation |
| **Kaggle — NIFTY 50 Historical** | 2007–2024 index data | Market chart backfill |
| **Yahoo Finance API** (via backend proxy) | Live/close-to-live quotes | Market summary endpoint |

### Synthetic Sources (what actually ships in the demo)
| Source | Records | Purpose |
|--------|---------|---------|
| `seeds/synthetic_users.js` | 8 users | Login accounts, demo profiles |
| `seeds/synthetic_accounts.js` | ~24 accounts | Bank accounts, balances, IFSC |
| `seeds/synthetic_transactions.js` | ~500 transactions | Transaction history, fraud examples |
| `seeds/synthetic_fraud_events.js` | ~60 events | Admin fraud map, audit logs |
| `seeds/synthetic_market_snapshot.js` | 1 snapshot | Macro signals, market view |
| `seeds/synthetic_assets_goals.js` | ~30 assets + 18 goals | Wealth Twin net worth, goal tracker |

---

## 2. Data Model & Record Counts

### Users (8 demo login accounts)
- Deepanshu Sharma (Ultra HNI)
- Dr. Neha Gupta (Dermatologist)
- Meera Krishnan (Architect)
- Ishita Anand (Business Owner)
- Mrigesh Mohanty (Tech Lead)
- Balbir Singh (Retired Army)
- Rikshita Barua (Marketing Strategist)
- Admin-only account

Fields: `id, email, password_hash, name, phone, pan, aadhar, role, risk_profile, monthly_income, monthly_expenses, monthly_savings, tax_bracket, created_at`

### Bank Accounts (~24)
- 3 accounts per user (Savings, Current, FD)
- Fields: `id, user_id, account_number, account_type, balance, ifsc, branch, status`

### Transactions (~500)
- Mix of credit/debit/transfer/UPI/NEFT/IMPS
- 8–12% flagged as HIGH risk for demo
- Some with device/location/OTP retry anomalies
- Fields: `id, user_id, from_account, to_account, type, amount, description, status, risk_level, risk_reason, reference_id, created_at`

### Fraud Events (~60)
- Used in admin portal fraud map + audit log
- Types: new device, rushed action, unusual amount, OTP retry, first-time invest, abnormal behavior
- Fields: `id, user_id, action, risk_score, risk_level, signals, ip_address, city, country, created_at`

### Assets + Goals (~30 + 18)
- Per user: bank, mutual fund, stock, gold, property, vehicle
- Goals: emergency, car, travel, education, home, retirement

### Market Snapshot (1)
- NIFTY P/E, repo rate, inflation, gold price, USD/INR, FD rate
- Signals + recommendations arrays

---

## 3. Where Data Will Appear

### Frontend
| Feature | Data source |
|---------|-------------|
| Login demo profiles | `users` seed |
| Dashboard net worth / savings | `accounts` + `assets` aggregates |
| Transaction history | `transactions` seed |
| Wealth Twin projections | `assets`, `goals`, `market_snapshot` |
| Goal tracker | `goals` seed |
| Protection layer demo | `transactions` risk flags |
| Market view | `market_snapshot` + NSE proxy |
| Fraud map | `fraud_events` seed (admin) |

### Backend
| Endpoint | Data |
|----------|------|
| `GET /banking/accounts` | seeded accounts |
| `GET /banking/transactions` | seeded transactions |
| `POST /banking/transactions` | creates new tx, applies risk scoring |
| `GET /banking/goals` | seeded goals |
| `GET /banking/assets` | seeded assets |
| `GET /market/macro-signals` | seeded + live proxy |
| `GET /admin/fraud-events` | seeded fraud events |
| `GET /admin/audit-logs` | seeded audit logs |

### Admin Portal
| Tab | Data |
|-----|------|
| Security Ops | fraud events, trust score, risk trends |
| Fraud Map | city/country aggregated fraud events |
| Audit Log | transaction + login audit entries |

---

## 4. Implementation Steps

### Phase A — Backend Seeds (this is the foundation)
1. Create `backend/seeds/syntheticData.js` generator using `faker` or deterministic functions.
2. Create seed runner `backend/scripts/seedDatabase.js` that:
   - Clears existing demo data safely
   - Inserts users → accounts → goals → assets → transactions → fraud events → audit logs
3. Add `npm run seed` script to `backend/package.json`.
4. Call seed runner on server startup if `NODE_ENV=demo` or `SEED_ON_START=true`.

### Phase B — Transaction Risk Scoring
1. Enhance `timingCheck.js` or create `services/risk-scorer.js`.
2. On `POST /banking/transactions`, compute:
   - Device trust (new vs trusted)
   - Login-to-action speed
   - Amount vs historical average
   - OTP retry pattern
   - First-time investment flag
   - Behavioral consistency
3. Return `wealthProtection` object in response.

### Phase C — Admin Endpoints
1. Ensure `GET /admin/fraud-events` returns seeded fraud events with geolocation.
2. Ensure `GET /admin/audit-logs` returns seeded audit logs.
3. Add optional query filters (`userId`, `riskLevel`, `limit`).

### Phase D — Frontend Wiring
1. Update `userProfiles.ts` to match seeded users.
2. In `LoginPortal.tsx`, demo-login should call backend `/auth/demo-login` which returns user + token.
3. Dashboard should fetch real seeded data from backend instead of local mock.
4. Add fallback to local mock if backend is cold/down.

### Phase E — Deployment
1. Push backend changes to `psb-banking-backend` repo (Render source).
2. Trigger Render deploy hook.
3. Push frontend changes to `psb-securewealth-frontend` repo.
4. Verify live URLs.

---

## 5. Files to Modify / Create

### New backend files
- `backend/seeds/syntheticData.js`
- `backend/seeds/index.js`
- `backend/scripts/seedDatabase.js`
- `backend/services/risk-scorer.js`

### Modify backend files
- `backend/server.js` — add seed-on-start logic
- `backend/package.json` — add `seed` script, add `faker` dep
- `backend/routes/banking.js` — integrate risk scorer
- `backend/routes/auth.js` — add demo-login endpoint
- `backend/routes/admin.js` — ensure fraud-events/audit-logs endpoints
- `backend/services/database.js` — seed helper methods if needed

### New frontend files
- `client/src/shared/data/seededPersonas.ts` (optional, mirrors backend)

### Modify frontend files
- `client/src/shared/data/userProfiles.ts`
- `client/src/features/auth/components/LoginPortal.tsx`
- `client/src/shared/store/wealthStore.ts` — fetch seeded data on login
- `client/src/features/protection/components/FraudDetectionEngine.tsx`
- `client/src/features/admin/components/AdminDashboard.tsx` fraud map tab

---

## 6. Pitch Line After This

> "SecureWealth Twin ingests multi-source intelligence: RBI macro indicators, NSE market data, simulated Account Aggregator consents, and a synthesized transaction graph of 500+ records to train our protection layer — all while keeping PII safe through synthetic data and on-device decisioning."

---

## 7. Success Checklist

- [ ] 8 demo users can log in
- [ ] Each user sees 3+ accounts
- [ ] ~500 transactions load with pagination
- [ ] 8–12% transactions flagged HIGH risk
- [ ] Admin fraud map shows 50+ pins
- [ ] Admin audit log shows 100+ entries
- [ ] Market view shows NIFTY, gold, inflation, repo
- [ ] Goal tracker shows 18 goals
- [ ] Wealth Twin shows net worth from assets
- [ ] No console 404s on dashboard load
- [ ] Deployed on Render without errors

---

## 8. Notes

- All data is **synthetic/demo-only** — no real customer PII.
- Passwords for demo accounts will be simple hashed values or plain demo passwords.
- Keep the existing local mock fallback so the app works offline.
- For hackathon demo, emphasize "simulated integrations" not live bank APIs.
