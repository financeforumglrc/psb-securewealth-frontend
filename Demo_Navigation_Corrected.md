# Corrected Demo Navigation Cheat Sheet

Verified live on: https://psb-securewealth-frontend.onrender.com/
Profile to use: **Dr. Neha Gupta** (Dermatologist, ₹3.20 Cr portfolio)

---

## 1. Login & Onboarding
**Path:** Login page → Click **Dr. Neha Gupta** → Account Aggregator animation → Dashboard

- Works. AA animation shows "AA service unreachable — showing demo aggregation" then loads dashboard.

---

## 2. Dashboard Highlights
**Path:** Dashboard → Net Worth card → Asset Allocation / Wealth Overview → AI Autonomous Actions

- Net Worth: **₹3.20Cr**
- Asset Allocation chart renders (pie + net-worth growth line).
- AI Autonomous Actions card shows "1-tap execution drafted by Wealth Twin".

---

## 3. Smart Sweep & Macro Signals
**Path:** Dashboard → Smart Sweep action card → Macro Signal Tower card

- Smart Sweep card: "Move ₹40,000 from Savings Account (4.0%) to Sweep FD (7.2%)".
- Macro Signal Tower card is on dashboard; clicking it navigates to Wealth Twin.

---

## 4. Security Features *(updated path)*
**Path:** Navigation **Pay & Protect** → **Security Beast**

- Shows 10-layer security: TPM attestation, Honeytoken/Passkey, Post-Quantum Crypto, Behavioral Biometrics, Decentralized ID, Transaction Trap, Secure Enclave, Blockchain Audit.

**For Rakshak AI / Deepfake Voice:**
- These are part of the **Payments** flow and trigger automatically on a flagged/suspicious transaction (not directly accessible from Security Beast).
- Demo tip: Use **Pay Now** → enter a high-risk UPI ID / amount → Rakshak AI chat + Deepfake liveness challenge should appear.

**For Ghost Mode / Decoy:**
- **Innovation → Innovation Lab → Ghost Mode** → click STANDBY / Simulate Call.

---

## 5. Khata (Business Ledger)
**Path:** Navigation **Family & Lifestyle** → **Khata**

Tabs verified:
1. **Overview** — business snapshot with revenue, expenses, surplus, GST liability, credit health, and quick actions.
2. **Cash Flow Timeline** — chart renders (Apr–Mar cash flow).
3. **Working Capital Health** — score **78/100**, Grade B+.
4. **Surplus Fund Advisor** — shows current idle surplus ₹5,50,000.
5. **GST Estimator** — live net GST payable estimate.
6. **Invoices** — invoice table with paid / pending / overdue statuses.
7. **Vendor Payments** — early-payment discount optimizer.
8. **Export PDF** — downloads a Khata report.

---

## 6. Wealth Twin & BHAVISHYA *(updated path)*
**Path:** Navigation **Wealth Intelligence** → **Wealth Twin**

Verified tabs:
- **Overview & DNA** — Monte Carlo area chart + Life Event line chart render.
- **Rebalancing** — current & target pie charts render.
- **What-If** — area chart renders.
- **FIRE Plan** — retirement trajectory area chart renders.
- **AI Goal Planner** — goal cards populated.

**For Life-Shock / Generational projections:**
- **Innovation → Innovation Lab → BHAVISHYA AI**
  - **Future Self** tab — net-worth trajectory chart renders.
  - **Emotions** tab — radar chart renders.
  - **Generations** tab — generational wealth chart renders.

---

## 7. CreditBridge AI
**Path:** Navigation **Pay & Protect** → **CreditBridge AI** (or use ⌘K search)

- Click **Generate CreditBridge Score**.
- Verified output: **Score 765**, **Prime**, high confidence 85%, with lender offers populated.

---

## 8. Pitch Deck / Closing Slides *(updated titles)*
**Path:** Navigation **Innovation** → **Pitch Deck**

Actual slide sections:
1. Why SecureWealth Twin Wins
2. PSB DNA: NRI Guardian Mode
3. DPDP Act 2023 Compliance
4. CFO / ROI Perspective
5. Bharat vs India Accessibility
6. 60-Second Closing Script

---

## Known Non-Blocking Issues
- Backend `/api/v1/health`, `/api/v1/aa/sync`, `/api/v1/aa/fetch` return CORS errors on localhost preview. On Render live domain the AA endpoints return 404 because the backend service is not fully wired. The UI falls back to demo data automatically, so the demo flow is not blocked.

## Recent Fixes Applied
- **Wealth Twin auto-seed:** Commits `f7b60e6` + `002cb24` — charts and data now populate on direct navigation/refresh.
- **BHAVISHYA charts:** Commit `f7b60e6` — Future Self, Emotions, and Generations charts render correctly.
