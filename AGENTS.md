# Agent Guidance — PSB SecureWealth

## Project overview
- Frontend: React 19 + Vite 8 + TypeScript + Tailwind CSS v4 in `client/`.
- Backend: Node.js + Express + SQLite (`better-sqlite3`) in `backend/`.
- Admin dashboard is under `/admin` and uses a base64 Bearer token (`ADMIN_ID:ADMIN_PASSWORD`) for API routes.

## Fraud Intelligence Center
- All fraud case data shown in the admin **Fraud Intel** tab is **synthetic by design**.
- No real account numbers, PAN, Aadhaar, or PII are generated or stored.
- Backend schema lives in `backend/services/database.js` (`fraud_cases`, `fraud_hops`, `fraud_accounts`, `fraud_notes`, `fraud_rules`).
- Backend routes are in `backend/routes/fraud.js`, mounted at `/api/v1/fraud`.
- Frontend code lives in `client/src/features/admin/components/FraudIntelligenceCenter.tsx` and siblings.
- Exports (Excel/CSV) are generated server-side with `exceljs`; PDF summaries are generated client-side with `jspdf`.
- Live simulation endpoints: `POST /api/v1/fraud/simulate` and `GET /api/v1/fraud/live` generate/poll recently created mock traces.
- If the backend Fraud API is unavailable, the frontend automatically falls back to a client-side synthetic generator (`client/src/features/admin/lib/fraudDataGenerator.ts`) so the map/explorer still render demo data.
- Admin login also has an offline/demo fallback: if `/admin/login` is unreachable, the portal logs in with a demo token and serves demo account holders + synthetic fraud data until the backend is deployed.

## Adding new admin features
1. Add backend schema + `fraudDb` methods in `services/database.js`.
2. Add routes in `routes/*.js` and mount them in `server.js`.
3. Add frontend service wrappers in `client/src/features/admin/services/`.
4. Add types in `client/src/features/admin/lib/fraudTypes.ts`.
5. Add i18n keys to both `en` and `hi` in `client/src/shared/i18n/translations.ts`.
6. Add Jest backend tests in `backend/tests/`.

## Commands
- Client build/test: `cd client && npm run build && npm run test:run`
- Backend test: `cd backend && npm test -- tests/fraud.test.js`
- Seed synthetic fraud data: `cd backend && npm run seed:fraud [count]`

## Data policy
- Never commit real user data or real bank account details.
- Mask sensitive identifiers in any generated demo content.
- Log admin actions to `audit_logs` for compliance.
