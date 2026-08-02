# Khata (SME Centre) – Demo Flowchart & Script

> Quick reference for the Khata business-ledger walkthrough during the PSB SecureWealth pitch.

---

## 1. Entry Flow

```text
+--------------------------------------------------+
|  Login Portal                                    |
|  Select: Dr. Neha Gupta (Dermatologist · ₹3.2Cr) |
+--------------------------------------------------+
                          |
                          v
+--------------------------------------------------+
|  Top Navigation:  Family & Lifestyle             |
+--------------------------------------------------+
                          |
                          v
+--------------------------------------------------+
|  Sub-nav / Mega-menu:  Khata                     |
+--------------------------------------------------+
```

---

## 2. Khata Tabs

```text
+-----------+----------------+------------------+----------------+-------------+-----------+------------------+
| Overview  | Cash Flow      | Working Capital  | Surplus        | GST         | Invoices  | Vendor Payments  |
+-----------+----------------+------------------+----------------+-------------+-----------+------------------+
```

Recommended demo flow:
1. **Overview** – the business snapshot in 10 seconds.
2. **Cash Flow** – tell the seasonality story.
3. **Working Capital** – show the diagnostic score.
4. **Surplus Advisor** – close with actionable deployment.
5. *(Optional)* **GST / Invoices / Vendor Payments** – for Q&A or deeper demos.

---

## 3. Overview – Demo Script

**What is on screen**
- Snapshot cards: Revenue YTD, Expenses YTD, Net Surplus, GST Liability.
- Quick Actions grid: Cash Flow, Working Capital, Surplus Advisor, GST Estimator, Invoices, Vendor Payments.
- Credit Health score (82/100) and payroll preview.

**What to say**
> "Khata is the business ledger for Dr. Neha Gupta's clinic. One glance shows revenue, expenses, surplus, and the next GST liability. You can drill into cash flow, working capital, or surplus deployment — or handle GST, invoices, and vendor payments. Everything a small business needs, without opening Excel."

---

## 4. Cash Flow Timeline – Demo Script

**What is on screen**
- 4 stat cards: Total Inflow, Total Outflow, Net Cashflow, Negative Months.
- 12-month composed chart:
  - Green bars = Inflow
  - Red bars = Outflow
  - Green/red net bars = month-wise surplus/shortage
  - Blue line = net trend

**What to say**
> "The Cash Flow Timeline shows the real story. ₹246.8L inflow, ₹225.8L outflow, net surplus ₹21.0L. But the red months — May and August — are where outflow exceeded inflow. The green months are surplus we can deploy."

---

## 5. Working Capital Health – Demo Script

**What is on screen**
- Working capital score (e.g., 78/100, Grade B+).
- Colour-coded ratio cards:
  - **Current Ratio** – green if ≥ 1.5, amber if 1.2–1.5, red if < 1.2
  - **Quick Ratio** – green if ≥ 1.0, amber if 0.8–1.0, red if < 0.8
- Receivable, payable, inventory, and cash-conversion days.

**What to say**
> "Working Capital Health gives a one-glance diagnostic. Score is 78/100, grade B+. The current ratio is green, so short-term obligations are covered. The quick ratio is amber — some liquidity is tied up in receivables or inventory. The colour codes let a non-finance owner know where to act."

---

## 6. Surplus Fund Advisor – Demo Script

**What is on screen**
- Current surplus amount (e.g., ₹5,50,000).
- Three ranked recommendations with projected value and risk:
  1. Sweep to 91-day Corporate FD — ₹3,00,000 at 7.4% → ₹3,05,550 (low risk)
  2. Liquid Mutual Fund — ₹1,50,000 at 6.8% → ₹1,52,550 (low risk)
  3. Prepay high-cost vendor credit — ₹1,00,000 at 14% saved → ₹1,14,000 (zero risk)

**What to say**
> "Surplus Fund Advisor turns idle cash into returns. Instead of letting ₹5.5L sit in a current account, the engine recommends a ladder: sweep to a 91-day corporate FD, keep liquidity in a liquid fund, and prepay 14% vendor credit."

---

## 7. GST Estimator – Demo Script (Optional / Deep-dive)

**What is on screen**
- Inputs: monthly taxable turnover, GST slab, input tax credit.
- Live net GST payable estimate.

**What to say**
> "GST Estimator gives an indicative liability before the actual filing. Pick the slab, enter turnover and credits, and see the net payable instantly."

---

## 8. Invoice Tracker – Demo Script (Optional / Deep-dive)

**What is on screen**
- Summary cards: Total Invoiced, Outstanding, Overdue, Collection Rate.
- Filterable invoice table with status badges (paid / pending / overdue).

**What to say**
> "Invoice Tracker shows who owes what. Two invoices are overdue — MediCare Pharmacy and Global Health Labs — so the clinic can follow up and improve cash conversion."

---

## 9. Vendor Payment Planner – Demo Script (Optional / Deep-dive)

**What is on screen**
- List of vendor bills with early-payment discount offers.
- Toggle selection, total savings calculation.

**What to say**
> "Vendor Payment Planner turns payables into profit. MedSupply India and DermaEquip offer 2% and 1.5% discounts for early payment. Khata highlights the savings so the clinic can decide in one click."

---

## 10. Demo Notes

| Item | Detail |
|------|--------|
| **Demo persona** | Dr. Neha Gupta — enterprise tier, business owner profile |
| **Entry path** | Login → Dr. Neha Gupta → Family & Lifestyle → Khata |
| **Tab order** | Overview → Cash Flow → Working Capital → Surplus Advisor → GST / Invoices / Vendor Payments |
| **Fallback data** | If the backend is cold/CORS-blocked, realistic demo data loads automatically so the walkthrough never breaks. |
| **Colour language** | Green = healthy/surplus, Amber = watch, Red = risk/shortage |
| **Export** | PDF export button on the top-right of Khata for report downloads. |

---

## 11. One-Liner Takeaway

> "Khata turns a small business's scattered finances into one visual ledger — red months tell you where to borrow, green months tell you where to invest, and every invoice, vendor bill, and GST estimate has a home."
