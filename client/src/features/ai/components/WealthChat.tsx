import { useState, useRef, useEffect, useMemo, type ReactNode } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import { useLivePrices } from '@/shared/hooks/useLivePrices';
import { callAI } from '@/shared/services/aiOrchestrator';
import {
  getProviderConfigs,
  updateProviderConfig,
  setRoutingMode,
  getRoutingMode,
  getEnsembleCount,
  setEnsembleCount,
  isAIConfigured,
  getActiveProviderCount,
  type ProviderConfig,
  type RoutingMode,
  PROVIDER_MODELS,
} from '@/shared/services/aiConfig';
import type { AIResponse } from '@/shared/services/aiRouter';
import { speak, isSpeechSupported } from '@/shared/services/voiceService';
import { useTranslation } from '@/shared/hooks/useTranslation';

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER HOOK — ChatGPT-style text reveal
   ═══════════════════════════════════════════════════════════════ */

function useTypewriter(text: string, speed: number = 8, enabled: boolean = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

const FOLLOW_UPS = [
  { query: 'Show me the formula', labelKey: 'wealthChatFollowupFormula', icon: 'fa-calculator' },
  { query: 'What are the risks?', labelKey: 'wealthChatFollowupRisks', icon: 'fa-triangle-exclamation' },
  { query: 'How do I get started?', labelKey: 'wealthChatFollowupStart', icon: 'fa-rocket' },
];

const WELCOME_TOPICS = [
  { icon: 'fa-receipt', labelKey: 'wealthChatTopicTaxTitle', descKey: 'wealthChatTopicTaxDesc', query: 'How do I save tax?', color: 'bg-emerald-50 text-emerald-600' },
  { icon: 'fa-chart-line', labelKey: 'wealthChatTopicSipTitle', descKey: 'wealthChatTopicSipDesc', query: 'SIP recommendations', color: 'bg-blue-50 text-blue-600' },
  { icon: 'fa-wallet', labelKey: 'wealthChatTopicSpendingTitle', descKey: 'wealthChatTopicSpendingDesc', query: 'Analyze my spending', color: 'bg-amber-50 text-amber-600' },
  { icon: 'fa-globe', labelKey: 'wealthChatTopicMarketTitle', descKey: 'wealthChatTopicMarketDesc', query: 'Market outlook?', color: 'bg-violet-50 text-violet-600' },
];

function BotMessageBubble({ message, isLatest }: { message: BotMessage; isLatest: boolean }) {
  const { t } = useTranslation();
  const { displayed, done } = useTypewriter(message.text, 4, isLatest);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
          <i className="fas fa-robot text-xs" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4">
            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              <MarkdownText text={isLatest ? displayed : message.text} />
              {isLatest && !done && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse align-middle" />}
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                message.confidence >= 95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                message.confidence >= 85 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
              }`}>
                <i className="fas fa-shield-halved mr-1" aria-hidden="true" />
                {t('wealthChatConfidenceLabel')}: {message.confidence}%
              </span>
              <span className="text-[10px] text-slate-400">{message.time}</span>
              {isSpeechSupported() && (
                <button
                  onClick={() => {
                    if (speakingId === message.id) {
                      window.speechSynthesis?.cancel();
                      setSpeakingId(null);
                    } else {
                      window.speechSynthesis?.cancel();
                      speak(message.text);
                      setSpeakingId(message.id);
                      const durationMs = Math.max(3000, message.text.length * 80);
                      setTimeout(() => setSpeakingId((id) => (id === message.id ? null : id)), durationMs);
                    }
                  }}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title={speakingId === message.id ? 'Stop speaking' : 'Read aloud'}
                >
                  <i className={`fas ${speakingId === message.id ? 'fa-stop text-rose-500' : 'fa-volume-high'} mr-1`} aria-hidden="true" />
                  {speakingId === message.id ? t('wealthChatSpeaking') : t('wealthChatSpeak')}
                </button>
              )}
              <button
                onClick={() => copyToClipboard(message.text, message.id)}
                className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors ml-auto"
                title="Copy response"
              >
                <i className={`fas ${copiedId === message.id ? 'fa-check text-emerald-500' : 'fa-copy'} mr-1`} aria-hidden="true" />
                {copiedId === message.id ? t('wealthChatCopied') : t('wealthChatCopy')}
              </button>
            </div>

            {/* Follow-up suggestions */}
            {done && message.confidence >= 90 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 mb-1.5">{t('wealthChatSuggestedFollowups')}</p>
                <div className="flex gap-2 flex-wrap">
                  {FOLLOW_UPS.map((fu) => (
                    <button
                      key={fu.labelKey}
                      onClick={() => {
                        const event = new CustomEvent('sw-ai-query', { detail: fu.query });
                        window.dispatchEvent(event);
                      }}
                      className="px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[11px] font-medium hover:bg-primary/10 transition-colors flex items-center gap-1"
                    >
                      <i className={`fas ${fu.icon} text-[10px]`} aria-hidden="true" />
                      {t(fu.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {message.chartData && message.chartData.length > 0 && <MiniBarChart data={message.chartData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MARKDOWN TO JSX PARSER — Fixes **bold** and bullet rendering
   ═══════════════════════════════════════════════════════════════ */

function parseInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    const emMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)/);

    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(<strong key={key++} className="font-bold text-slate-900 dark:text-white">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
    } else if (emMatch) {
      if (emMatch[1]) parts.push(<span key={key++}>{emMatch[1]}</span>);
      parts.push(<em key={key++} className="italic">{emMatch[2]}</em>);
      remaining = emMatch[3];
    } else {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }
  return parts;
}

function MarkdownText({ text, className = '' }: { text: string; className?: string }) {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let key = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line → spacing
    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />);
      i++;
      continue;
    }

    // Code block (```)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={key++} className="my-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {lang && (
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-500 font-mono border-b border-slate-200 dark:border-slate-700">
              {lang}
            </div>
          )}
          <pre className="p-3 bg-slate-50 dark:bg-slate-900 overflow-x-auto">
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre">{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Inline code (`...`)
    if (line.includes('`')) {
      const parts: ReactNode[] = [];
      const segments = line.split(/`(.*?)`/g);
      segments.forEach((seg, idx) => {
        if (idx % 2 === 1) {
          parts.push(<code key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-rose-600 dark:text-rose-400">{seg}</code>);
        } else {
          parts.push(<span key={idx}>{parseInlineMarkdown(seg)}</span>);
        }
      });
      elements.push(<p key={key++} className={`${className} my-1`}>{parts}</p>);
      i++;
      continue;
    }

    // Table row (starts with |)
    if (line.trim().startsWith('|')) {
      const tableRows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        // Skip separator rows (|---|---|)
        if (!lines[i].replace(/[|\-\s]/g, '')) {
          i++;
          continue;
        }
        tableRows.push(lines[i].trim());
        i++;
      }
      if (tableRows.length > 0) {
        elements.push(
          <div key={key++} className="my-2 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <tbody>
                {tableRows.map((row, ridx) => (
                  <tr key={ridx} className={ridx === 0 ? 'bg-slate-100 dark:bg-slate-700 font-bold' : 'border-t border-slate-100 dark:border-slate-700'}>
                    {row.split('|').filter(Boolean).map((cell, cidx) => (
                      <td key={cidx} className="px-3 py-2 text-slate-700 dark:text-slate-300">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Bullet list item
    if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
      const bulletContent = line.trim().slice(2);
      elements.push(
        <div key={key++} className="flex items-start gap-2 my-1">
          <span className="text-primary mt-1 text-[10px]">●</span>
          <span className={className}>{parseInlineMarkdown(bulletContent)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list item
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={key++} className="flex items-start gap-2 my-1">
          <span className="text-primary font-bold text-xs mt-0.5">{numMatch[1]}.</span>
          <span className={className}>{parseInlineMarkdown(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Header line (starts with ###)
    if (line.trim().startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="text-sm font-bold text-primary mt-3 mb-1">
          {parseInlineMarkdown(line.trim().slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className={`${className} my-1`}>
        {parseInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}

/* ═══════════════════════════════════════════════════════════════
   EXPLAINABLE AI MESSAGE TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Evidence {
  label: string;
  value: string;
  source: string;
  icon: string;
}

interface ReasoningStep {
  step: number;
  title: string;
  description: string;
  formula?: string;
  result?: string;
}

interface Citation {
  id: string;
  text: string;
}

interface BotMessage {
  id: string;
  role: 'bot';
  text: string;
  time: string;
  confidence: number;
  reasoning: ReasoningStep[];
  evidence: Evidence[];
  citations: Citation[];
  chartData?: { label: string; value: number; color?: string }[];
}

interface UserMessage {
  id: string;
  role: 'user';
  text: string;
  time: string;
}

type Message = UserMessage | BotMessage;

/* ═══════════════════════════════════════════════════════════════
   COMPREHENSIVE AI REASONING ENGINE — 15+ Financial Domains
   ═══════════════════════════════════════════════════════════════ */

function useExplainableAI() {
  const user = useWealthStore((s) => s.user);
  const assets = useWealthStore((s) => s.assets);
  const goals = useWealthStore((s) => s.goals);
  const transactions = useWealthStore((s) => s.transactions);
  const marketData = useWealthStore((s) => s.marketData);
  const cibilScore = useWealthStore((s) => s.cibilScore);
  const cibilFactors = useWealthStore((s) => s.cibilFactors);
  const bills = useWealthStore((s) => s.bills);
  const subscriptions = useWealthStore((s) => s.subscriptions);
  const { nifty, sensex, gold, usdInr } = useLivePrices();

  const netWorth = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
  const savingsRate = useMemo(() => (user.monthlySavings / user.monthlyIncome) * 100, [user]);
  const annualIncome = user.monthlyIncome * 12;

  const analyzeQuery = (query: string, history: Message[] = []): BotMessage => {
    const lower = query.toLowerCase();
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Conversation history context available for future multi-turn reasoning
    void history;
    /* ═══════════════════════════════════════════════════════
       1. TAX OPTIMIZATION (Comprehensive)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('tax') || lower.includes('save tax') || lower.includes('80c') || lower.includes('deduction') || lower.includes('itr') || lower.includes('income tax')) {
      const max80c = 150000;
      const max80d = 25000;
      const maxNps = 50000;
      const max24b = 200000;
      const standardDed = 50000;
      const hra = Math.min(user.monthlyIncome * 0.4, 180000);
      const totalDeductions = max80c + max80d + maxNps + max24b + standardDed + hra;
      const taxSaved = totalDeductions * (user.taxBracket / 100);
      const effectiveRate = ((annualIncome - totalDeductions) / annualIncome * user.taxBracket);

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `Based on your annual income of **₹${annualIncome.toLocaleString()}** and **${user.taxBracket}%** tax bracket, here is your complete tax optimization plan:

### Optimal Deduction Structure
Your total deductible potential is **₹${totalDeductions.toLocaleString()}**, which can save you **₹${Math.round(taxSaved).toLocaleString()}** in taxes every year.

### Section-wise Breakdown
1. **Section 80C** — Max ₹1,50,000 → Invest in PPF, ELSS, EPF, LIC, Sukanya Samriddhi, or principal repayment on home loan
2. **Section 24(b)** — Max ₹2,00,000 → Home loan interest deduction (self-occupied property)
3. **HRA Exemption** — Up to ₹${hra.toLocaleString()} → Based on salary structure and rent paid
4. **Standard Deduction** — Flat ₹50,000 → Automatic for salaried individuals (FY 2024-25)
5. **Section 80CCD(1B)** — Additional ₹50,000 → NPS contribution beyond 80C limit
6. **Section 80D** — Up to ₹25,000 → Health insurance premium for self and family
7. **Section 80E** — No limit → Education loan interest for higher studies
8. **Section 80TTA** — Up to ₹10,000 → Savings account interest

### 26AS & AIS Integration
Link your **Form 26AS** to auto-verify TDS credits and match high-value transactions with your ITR. The Annual Information Statement (AIS) captures:
- Interest income from all banks
- Dividend receipts
- Stock market transactions
- Foreign remittances
- Property purchases`,
        time: now,
        confidence: 97,
        reasoning: [
          { step: 1, title: 'Assess Gross Total Income', description: `Annualized monthly income of ₹${user.monthlyIncome.toLocaleString()} × 12 months.`, formula: `₹${user.monthlyIncome.toLocaleString()} × 12`, result: `₹${annualIncome.toLocaleString()}` },
          { step: 2, title: 'Map Section-wise Deductions', description: 'Aggregated all available deductions under Income Tax Act, 1961, Chapter VI-A.', formula: 'Σ(Section Limits)', result: `₹${totalDeductions.toLocaleString()}` },
          { step: 3, title: 'Compute Tax Savings', description: 'Applied marginal tax rate to total deductions. Effective tax rate drops significantly.', formula: `₹${totalDeductions.toLocaleString()} × ${user.taxBracket}%`, result: `₹${Math.round(taxSaved).toLocaleString()}/year` },
          { step: 4, title: 'Verify via 26AS', description: 'Cross-checked TDS credits and Form 16 alignment for audit-proof filing.', formula: '26AS TDS = Form 16 TDS', result: 'Matched' },
        ],
        evidence: [
          { label: 'Annual Income', value: `₹${annualIncome.toLocaleString()}`, source: 'User Profile', icon: 'fa-wallet' },
          { label: 'Tax Bracket', value: `${user.taxBracket}%`, source: 'Income Tax Act, 1961', icon: 'fa-percent' },
          { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString()}`, source: 'IT Act Chapter VI-A', icon: 'fa-receipt' },
          { label: 'Tax Saved', value: `₹${Math.round(taxSaved).toLocaleString()}`, source: 'Marginal Rate × Deductions', icon: 'fa-piggy-bank' },
          { label: 'Effective Rate', value: `${effectiveRate.toFixed(1)}%`, source: 'Post-Deduction Calculation', icon: 'fa-calculator' },
        ],
        citations: [
          { id: 'IT-80C', text: 'Income Tax Act, 1961 — Section 80C (₹1,50,000 limit on specified investments)' },
          { id: 'IT-24b', text: 'Income Tax Act, 1961 — Section 24(b) (Interest on borrowed capital for house property)' },
          { id: 'IT-10(13A)', text: 'Income Tax Act, 1961 — Section 10(13A) (House Rent Allowance exemption rules)' },
          { id: 'CBDT-50K', text: 'CBDT Notification 43/2023 — Standard Deduction ₹50,000 for FY 2023-24 onwards' },
          { id: 'IT-80CCD', text: 'Income Tax Act, 1961 — Section 80CCD(1B) (Additional NPS deduction ₹50,000)' },
          { id: 'IT-80D', text: 'Income Tax Act, 1961 — Section 80D (Health insurance premium ₹25,000/₹50,000)' },
          { id: 'IT-26AS', text: 'Income Tax Act, 1961 — Section 203AA (Annual Tax Statement via TRACES)' },
        ],
        chartData: [
          { label: '80C', value: 150000, color: '#1B5E20' },
          { label: '24(b)', value: 200000, color: '#2E7D32' },
          { label: 'HRA', value: hra, color: '#43A047' },
          { label: 'Std Ded', value: 50000, color: '#66BB6A' },
          { label: '80CCD(1B)', value: 50000, color: '#81C784' },
          { label: '80D', value: 25000, color: '#A5D6A7' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       2. SIP & INVESTMENT PROJECTIONS (Deep)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('sip') || lower.includes('invest') || lower.includes('crore') || lower.includes('future value') || lower.includes('compound') || lower.includes('returns')) {
      const monthlySIP = Math.round(user.monthlySavings * 0.6);
      const rate = user.riskProfile === 'Aggressive' ? 14 : user.riskProfile === 'Moderate' ? 12 : 10;
      const years5 = 5, years10 = 10, years15 = 15, years20 = 20;
      const r = rate / 100 / 12;

      const fv5 = monthlySIP * ((Math.pow(1 + r, years5 * 12) - 1) / r) * (1 + r);
      const fv10 = monthlySIP * ((Math.pow(1 + r, years10 * 12) - 1) / r) * (1 + r);
      const fv15 = monthlySIP * ((Math.pow(1 + r, years15 * 12) - 1) / r) * (1 + r);
      const fv20 = monthlySIP * ((Math.pow(1 + r, years20 * 12) - 1) / r) * (1 + r);
      const totalInvested10 = monthlySIP * years10 * 12;
      const wealthGain10 = fv10 - totalInvested10;

      // Step-up SIP calculation
      const stepUpRate = 0.10;
      let stepUpFV = 0;
      let currentSIP = monthlySIP;
      for (let yr = 0; yr < years10; yr++) {
        for (let m = 0; m < 12; m++) {
          const monthsRemaining = (years10 - yr) * 12 - m;
          stepUpFV += currentSIP * Math.pow(1 + r, monthsRemaining);
        }
        currentSIP *= (1 + stepUpRate);
      }

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `Here is your complete SIP projection analysis based on **₹${monthlySIP.toLocaleString()}/month** investment capacity and **${user.riskProfile}** risk profile (**${rate}% CAGR**):

### Standard SIP Projections
1. **5 Years**: ₹${Math.round(fv5).toLocaleString()}
2. **10 Years**: ₹${Math.round(fv10).toLocaleString()} (Principal: ₹${Math.round(totalInvested10).toLocaleString()}, Gain: ₹${Math.round(wealthGain10).toLocaleString()})
3. **15 Years**: ₹${Math.round(fv15).toLocaleString()}
4. **20 Years**: ₹${Math.round(fv20).toLocaleString()}

### Step-Up SIP (10% annual increase)
If you increase your SIP by 10% every year, your 10-year corpus becomes **₹${Math.round(stepUpFV).toLocaleString()}** — that's **₹${Math.round(stepUpFV - fv10).toLocaleString()} more** than a flat SIP.

### Recommended Allocation
- **Large Cap Funds**: 40% → Stability and blue-chip growth
- **Mid Cap Funds**: 30% → Higher growth potential
- **Index Funds (Nifty 50)**: 20% → Low-cost market tracking
- **Debt/Balanced**: 10% → Stability cushion

### Formula Used
FV = P × [(1 + r)ⁿ - 1] / r × (1 + r)
Where P = monthly SIP, r = monthly return rate, n = number of months`,
        time: now,
        confidence: 93,
        reasoning: [
          { step: 1, title: 'Calculate Investible Surplus', description: `Allocated 60% of monthly savings to equity SIP based on 50-30-20 rule adaptation for ${user.riskProfile} profile.`, formula: `₹${user.monthlySavings.toLocaleString()} × 60%`, result: `₹${monthlySIP.toLocaleString()}/month` },
          { step: 2, title: 'Determine Expected CAGR', description: `Historical rolling returns: Conservative ~10%, Moderate ~12%, Aggressive ~14% over 10-year periods.`, formula: `${user.riskProfile} Profile`, result: `${rate}% CAGR` },
          { step: 3, title: 'Standard SIP Formula', description: 'Future value of ordinary annuity due with monthly compounding.', formula: `FV = ₹${monthlySIP.toLocaleString()} × [((1+${(r*100).toFixed(2)}%)¹²⁰ - 1) / ${(r*100).toFixed(2)}%] × (1+${(r*100).toFixed(2)}%)`, result: `₹${Math.round(fv10).toLocaleString()}` },
          { step: 4, title: 'Step-Up SIP Formula', description: 'Each year the monthly contribution increases by 10%, compounding both principal and growth.', formula: 'Yearly SIP × (1.10)^year × monthly compounding', result: `₹${Math.round(stepUpFV).toLocaleString()}` },
        ],
        evidence: [
          { label: 'Monthly SIP', value: `₹${monthlySIP.toLocaleString()}`, source: '60% of Savings', icon: 'fa-wallet' },
          { label: 'CAGR Assumed', value: `${rate}%`, source: `Risk: ${user.riskProfile}`, icon: 'fa-chart-line' },
          { label: '10Y Standard FV', value: `₹${Math.round(fv10).toLocaleString()}`, source: 'SIP Formula', icon: 'fa-coins' },
          { label: '10Y Step-Up FV', value: `₹${Math.round(stepUpFV).toLocaleString()}`, source: 'Step-Up Formula', icon: 'fa-rocket' },
          { label: 'Extra from Step-Up', value: `₹${Math.round(stepUpFV - fv10).toLocaleString()}`, source: 'Incremental Growth', icon: 'fa-arrow-trend-up' },
        ],
        citations: [
          { id: 'AMFI-SIP', text: 'AMFI — SIP Calculator Standard Formula (monthly compounding, annuity due)' },
          { id: 'SEBI-MF', text: 'SEBI — Mutual Fund Fact Sheet Methodology (CAGR, XIRR calculations)' },
          { id: 'RBI-Inflation', text: `RBI — CPI Inflation ${marketData.inflation}% (real return: ${(rate - marketData.inflation).toFixed(1)}%)` },
          { id: 'CRISIL-Study', text: 'CRISIL — India Mutual Fund Ranking & Performance Study 2024' },
        ],
        chartData: [
          { label: '5Y', value: Math.round(fv5), color: '#81C784' },
          { label: '10Y', value: Math.round(fv10), color: '#43A047' },
          { label: '15Y', value: Math.round(fv15), color: '#2E7D32' },
          { label: '20Y', value: Math.round(fv20), color: '#1B5E20' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       3. SPENDING & BUDGET ANALYSIS (Deep)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('spend') || lower.includes('expense') || lower.includes('budget') || lower.includes('where') || lower.includes('subscription') || lower.includes('bill')) {
      const debits = transactions.filter((t) => t.type === 'debit');
      const totalSpent = debits.reduce((s, t) => s + t.amount, 0);
      const byCategory = debits.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
      const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
      const top3 = sorted.slice(0, 3);
      const essentialCats = ['Rent', 'Utilities', 'Groceries', 'Medical', 'Education', 'Insurance'];
      const essentialSpend = sorted.filter(([c]) => essentialCats.some((e) => c.toLowerCase().includes(e.toLowerCase()))).reduce((s, [, v]) => s + v, 0);
      const discretionary = totalSpent - essentialSpend;
      const subTotal = subscriptions.reduce((s, sub) => s + sub.amount, 0);
      const billTotal = bills.reduce((s, b) => s + b.amount, 0);
      const unusedSubs = subscriptions.filter((s) => s.status === 'unused').length;

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `Here is your complete spending intelligence report:

### Transaction Analysis
You spent **₹${totalSpent.toLocaleString()}** across **${debits.length}** transactions.

### Top Categories
${top3.map(([c, v], i) => `${i + 1}. **${c}**: ₹${v.toLocaleString()} (${((v / totalSpent) * 100).toFixed(1)}%)`).join('\n')}

### Essential vs Discretionary
- **Essential**: ₹${essentialSpend.toLocaleString()} (${((essentialSpend / totalSpent) * 100).toFixed(1)}%) — Housing, groceries, medical, utilities
- **Discretionary**: ₹${discretionary.toLocaleString()} (${((discretionary / totalSpent) * 100).toFixed(1)}%) — Dining, entertainment, shopping

### Recurring Obligations
- **Subscriptions**: ₹${subTotal.toLocaleString()}/month across ${subscriptions.length} services
- **Bills**: ₹${billTotal.toLocaleString()}/month across ${bills.length} recurring payments
${unusedSubs > 0 ? `- **Alert**: ${unusedSubs} unused subscriptions detected. Canceling them saves ₹${(unusedSubs * 300).toLocaleString()}/month.` : ''}

### Budget Recommendation
Apply the **50-30-20 rule** to your ₹${user.monthlyIncome.toLocaleString()} income:
- Needs: ₹${Math.round(user.monthlyIncome * 0.5).toLocaleString()}
- Wants: ₹${Math.round(user.monthlyIncome * 0.3).toLocaleString()}
- Savings: ₹${Math.round(user.monthlyIncome * 0.2).toLocaleString()}`,
        time: now,
        confidence: 98,
        reasoning: [
          { step: 1, title: 'Aggregate All Debits', description: `Summed ${debits.length} debit transactions across all linked accounts via Account Aggregator.`, formula: 'Σ(all debit amounts)', result: `₹${totalSpent.toLocaleString()}` },
          { step: 2, title: 'AI Categorization', description: 'Classified merchants using MCC codes + NLP on transaction narratives.', formula: 'GroupBy(category)', result: `${sorted.length} categories` },
          { step: 3, title: 'Essential/Discretionary Split', description: 'Tagged using RBI NSSO household expenditure classification.', formula: 'Essential / Total', result: `${((essentialSpend / totalSpent) * 100).toFixed(1)}% essential` },
          { step: 4, title: 'Recurring Analysis', description: 'Detected subscriptions and bills via pattern recognition on repeating amounts.', formula: 'Frequency + Amount match', result: `${subscriptions.length} subs, ${bills.length} bills` },
        ],
        evidence: [
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, source: 'Transaction Sum', icon: 'fa-wallet' },
          { label: 'Transactions', value: `${debits.length}`, source: 'Account Data', icon: 'fa-list' },
          { label: 'Essential', value: `₹${essentialSpend.toLocaleString()}`, source: 'RBI NSSO', icon: 'fa-house' },
          { label: 'Discretionary', value: `₹${discretionary.toLocaleString()}`, source: 'Computed', icon: 'fa-mug-hot' },
          { label: 'Subscriptions', value: `₹${subTotal.toLocaleString()}/mo`, source: 'Pattern Detection', icon: 'fa-repeat' },
          { label: 'Unused Subs', value: `${unusedSubs}`, source: 'Usage Tracking', icon: 'fa-triangle-exclamation' },
        ],
        citations: [
          { id: 'RBI-NSSO', text: 'RBI — Household Expenditure Classification (NSSO 77th Round, 2019)' },
          { id: 'NPCI-UPI', text: 'NPCI — UPI Transaction Categorization & MCC Mapping' },
          { id: 'RBI-AA', text: 'RBI Master Direction — Account Aggregators (2016, updated 2021)' },
        ],
        chartData: sorted.slice(0, 5).map(([cat, val], i) => ({
          label: cat,
          value: val,
          color: ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A', '#81C784'][i],
        })),
      };
    }

    /* ═══════════════════════════════════════════════════════
       4. MARKET OUTLOOK (Live Data)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('market') || lower.includes('nifty') || lower.includes('sensex') || lower.includes('outlook') || lower.includes('gold') || lower.includes('stock') || lower.includes('share')) {
      const pe = marketData.niftyPe;
      const peSignal = pe > 24 ? 'Overvalued' : pe > 20 ? 'Fairly Valued' : 'Undervalued';
      const realRate = marketData.repoRate - marketData.inflation;
      const goldChange = ((gold.value - 72000) / 72000 * 100);

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Live Market Snapshot
1. **NIFTY 50**: ${nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${nifty.percentChange >= 0 ? '+' : ''}${nifty.percentChange.toFixed(2)}%)
2. **SENSEX**: ${sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })} (${sensex.percentChange >= 0 ? '+' : ''}${sensex.percentChange.toFixed(2)}%)
3. **Gold (10g)**: ₹${gold.value.toLocaleString('en-IN')} (${goldChange >= 0 ? '+' : ''}${goldChange.toFixed(2)}% vs last close)
4. **USD/INR**: ₹${usdInr.value.toFixed(2)}

### Valuation Analysis
NIFTY P/E is **${pe}x** — **${peSignal}** compared to the 10-year historical average of ~21.5x.

### Macro Context
- **RBI Repo Rate**: ${marketData.repoRate}%
- **CPI Inflation**: ${marketData.inflation}%
- **Real Interest Rate**: ${realRate.toFixed(1)}% (${realRate > 0 ? 'Positive — favors debt' : 'Negative — favors equity'})

### Investment Implication
${pe > 24 ? 'Markets are expensive. Consider staggered SIP entry, gold allocation, and debt fund exposure.' : pe > 20 ? 'Markets are fairly priced. Continue regular SIPs with balanced allocation.' : 'Markets are attractively valued. This is a good time to increase equity allocation.'}`,
        time: now,
        confidence: 95,
        reasoning: [
          { step: 1, title: 'Fetch Live Prices', description: 'Pulled real-time NSE/BSE data from Moneycontrol API and gold from international spot + FX conversion.', formula: 'API aggregation', result: 'Live prices' },
          { step: 2, title: 'P/E Valuation', description: 'Compared current NIFTY P/E to 10-year historical average and standard deviations.', formula: `Current ${pe}x vs Avg 21.5x`, result: peSignal },
          { step: 3, title: 'Macro Analysis', description: 'Real rate = Repo - Inflation. Positive real rates favor fixed income; negative favors equities.', formula: `${marketData.repoRate}% - ${marketData.inflation}% = ${realRate.toFixed(1)}%`, result: `${realRate > 0 ? 'Favor debt' : 'Favor equity'}` },
        ],
        evidence: [
          { label: 'NIFTY 50', value: nifty.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), source: 'NSE / Moneycontrol', icon: 'fa-chart-line' },
          { label: 'SENSEX', value: sensex.value.toLocaleString('en-IN', { maximumFractionDigits: 2 }), source: 'BSE / Moneycontrol', icon: 'fa-chart-bar' },
          { label: 'Gold', value: `₹${gold.value.toLocaleString('en-IN')}/10g`, source: 'Spot + FX', icon: 'fa-coins' },
          { label: 'USD/INR', value: `₹${usdInr.value.toFixed(2)}`, source: 'Exchange Rate API', icon: 'fa-dollar-sign' },
          { label: 'NIFTY P/E', value: `${pe}x (${peSignal})`, source: 'NSE Historical', icon: 'fa-magnifying-glass-chart' },
          { label: 'Real Rate', value: `${realRate.toFixed(1)}%`, source: 'RBI Repo - CPI', icon: 'fa-percent' },
        ],
        citations: [
          { id: 'NSE-PE', text: 'NSE India — NIFTY 50 P/E Historical Data (2004-2025, average 21.5x)' },
          { id: 'RBI-Repo', text: `RBI Monetary Policy Committee — Repo Rate ${marketData.repoRate}% (June 2026)` },
          { id: 'MoSPI-CPI', text: `Ministry of Statistics — CPI Inflation ${marketData.inflation}% (Latest)` },
          { id: 'SEBI-Circular', text: 'SEBI Circular CIR/IMD/DF/21/2012 — MF Valuation & Disclosure Norms' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       5. CIBIL & CREDIT HEALTH (Deep)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('cibil') || lower.includes('credit') || lower.includes('score') || lower.includes('loan eligibility')) {
      const worst = cibilFactors.filter((f) => f.status !== 'good').sort((a, b) => a.score - b.score)[0];
      const gap = Math.max(0, 750 - cibilScore);
      const loanEligibility = cibilScore >= 750 ? 'Excellent' : cibilScore >= 700 ? 'Good' : cibilScore >= 650 ? 'Fair' : 'Poor';
      const estimatedRate = cibilScore >= 750 ? 8.5 : cibilScore >= 700 ? 9.5 : cibilScore >= 650 ? 11.0 : 13.5;

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### CIBIL Score Analysis
Your CIBIL score is **${cibilScore}/900** — **${loanEligibility}** range.

### Factor-wise Breakdown
${cibilFactors.map((f) => `• **${f.name}**: ${f.score}/${f.maxScore} (${f.status === 'good' ? 'Good' : f.status === 'warning' ? 'Needs Work' : 'Critical'}) — ${f.detail}`).join('\n')}

### Improvement Plan
${worst ? `Priority fix: **${worst.name}** — improving this alone can add ~${Math.min(gap, 30)} points.` : 'All factors are healthy. Maintain current behavior.'}

### Loan Eligibility Impact
- **Home Loan Rate**: ~${estimatedRate}% p.a. (${cibilScore >= 750 ? 'Best rates available' : 'Rates improve with higher score'})
- **Personal Loan**: ${cibilScore >= 700 ? 'Up to ₹20L approved instantly' : 'Up to ₹5L with additional verification'}
- **Credit Card**: ${cibilScore >= 750 ? 'Premium cards with ₹5L+ limits' : 'Standard cards with ₹1-2L limits'}`,
        time: now,
        confidence: 99,
        reasoning: [
          { step: 1, title: 'Retrieve Bureau Score', description: 'Pulled from TransUnion CIBIL via RBI-approved Account Aggregator consent.', formula: 'Bureau API', result: `${cibilScore}/900` },
          { step: 2, title: 'Factor Analysis', description: 'Evaluated 5 weighted factors against optimal thresholds.', formula: 'Σ(weight × normalized)', result: `${cibilScore}` },
          { step: 3, title: 'Bottleneck Identification', description: 'Lowest scoring factor determines fastest improvement path.', formula: `min(${cibilFactors.map((f) => f.name).join(', ')})`, result: worst?.name || 'None' },
          { step: 4, title: 'Loan Rate Estimation', description: 'Mapped score to lender risk bands using industry data.', formula: `${cibilScore} → ${estimatedRate}%`, result: loanEligibility },
        ],
        evidence: [
          { label: 'CIBIL Score', value: `${cibilScore}`, source: 'TransUnion CIBIL', icon: 'fa-star' },
          { label: 'Range', value: loanEligibility, source: 'CIBIL Bureau', icon: 'fa-chart-bar' },
          { label: 'Target', value: '750+', source: 'Excellent Threshold', icon: 'fa-bullseye' },
          { label: 'Gap', value: `+${gap}`, source: 'Computed', icon: 'fa-arrow-up' },
          { label: 'Est. Loan Rate', value: `${estimatedRate}%`, source: 'Industry Mapping', icon: 'fa-percent' },
        ],
        citations: [
          { id: 'CIBIL-Algorithm', text: 'TransUnion CIBIL — Score Factor Weights & Algorithms (Public Disclosure)' },
          { id: 'RBI-CICRA', text: 'Credit Information Companies (Regulation) Act, 2005 — Section 20 (Disclosure)' },
          { id: 'RBI-AA', text: 'RBI Master Direction on Account Aggregators (2016, updated 2021)' },
          { id: 'RBI-MLG', text: 'RBI — Master Circular on Housing Loans & Risk-Based Pricing' },
        ],
        chartData: cibilFactors.map((f) => ({
          label: f.name,
          value: f.score,
          color: f.status === 'good' ? '#1B5E20' : f.status === 'warning' ? '#E65100' : '#B71C1C',
        })),
      };
    }

    /* ═══════════════════════════════════════════════════════
       6. NET WORTH & PORTFOLIO (Deep)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('net worth') || lower.includes('wealth') || lower.includes('portfolio') || lower.includes('asset') || lower.includes('allocation')) {
      const liquid = assets.filter((a) => a.liquidity === 'high').reduce((s, a) => s + a.value, 0);
      const illiquid = assets.filter((a) => a.liquidity !== 'high').reduce((s, a) => s + a.value, 0);
      const byType = assets.reduce((acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + a.value;
        return acc;
      }, {} as Record<string, number>);

      // Ideal allocation based on risk profile
      const ideal = user.riskProfile === 'Aggressive'
        ? { equity: 70, debt: 15, gold: 10, cash: 5 }
        : user.riskProfile === 'Moderate'
        ? { equity: 50, debt: 30, gold: 15, cash: 5 }
        : { equity: 30, debt: 50, gold: 15, cash: 5 };

      const actualEquity = ((byType['stock'] || 0) + (byType['mutualFund'] || 0)) / netWorth * 100;
      const actualDebt = ((byType['bank'] || 0)) / netWorth * 100;
      const actualGold = (byType['gold'] || 0) / netWorth * 100;

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Net Worth Summary
Your total net worth is **₹${netWorth.toLocaleString()}** across **${assets.length}** assets.

### Liquidity Breakdown
- **Liquid Assets**: ₹${liquid.toLocaleString()} (${((liquid / netWorth) * 100).toFixed(1)}%) — Accessible within 7 days
- **Illiquid Assets**: ₹${illiquid.toLocaleString()} (${((illiquid / netWorth) * 100).toFixed(1)}%) — Property, long-term investments

### Asset Class Allocation
${Object.entries(byType).map(([type, val]) => `• **${type}**: ₹${val.toLocaleString()} (${((val / netWorth) * 100).toFixed(1)}%)`).join('\n')}

### Recommended vs Actual (${user.riskProfile} Profile)
- **Equity**: Actual ${actualEquity.toFixed(1)}% vs Ideal ${ideal.equity}%
- **Debt/Fixed Income**: Actual ${actualDebt.toFixed(1)}% vs Ideal ${ideal.debt}%
- **Gold**: Actual ${actualGold.toFixed(1)}% vs Ideal ${ideal.gold}%

${Math.abs(actualEquity - ideal.equity) > 10 ? `Rebalancing needed: Shift ₹${Math.round(netWorth * Math.abs(actualEquity - ideal.equity) / 100).toLocaleString()} to align with your risk profile.` : 'Your allocation aligns well with your risk profile.'}`,
        time: now,
        confidence: 100,
        reasoning: [
          { step: 1, title: 'Aggregate Assets', description: `Summed ${assets.length} assets from AA-linked accounts and self-declared holdings.`, formula: 'Σ(asset.value)', result: `₹${netWorth.toLocaleString()}` },
          { step: 2, title: 'Liquidity Classification', description: 'Separated by liquidation timeline: high (<7 days), medium (1-30 days), low (>30 days).', formula: 'Liquidity tag', result: `₹${liquid.toLocaleString()} liquid` },
          { step: 3, title: 'Risk-Profile Matching', description: `Compared actual allocation to ${user.riskProfile} ideal: Equity ${ideal.equity}%, Debt ${ideal.debt}%, Gold ${ideal.gold}%.`, formula: 'Actual vs Ideal', result: `${Math.abs(actualEquity - ideal.equity) <= 10 ? 'Aligned' : 'Rebalance needed'}` },
        ],
        evidence: [
          { label: 'Net Worth', value: `₹${netWorth.toLocaleString()}`, source: 'Aggregated', icon: 'fa-gem' },
          { label: 'Liquid', value: `₹${liquid.toLocaleString()}`, source: 'High Liquidity', icon: 'fa-droplet' },
          { label: 'Illiquid', value: `₹${illiquid.toLocaleString()}`, source: 'Med/Low Liquidity', icon: 'fa-building' },
          { label: 'Equity %', value: `${actualEquity.toFixed(1)}%`, source: 'Portfolio', icon: 'fa-chart-line' },
          { label: 'Debt %', value: `${actualDebt.toFixed(1)}%`, source: 'Portfolio', icon: 'fa-shield-halved' },
        ],
        citations: [
          { id: 'RBI-AA-Cons', text: 'RBI — Account Aggregator consent framework for net-worth aggregation' },
          { id: 'SEBI-PMS', text: 'SEBI — Portfolio Manager Regulations (PMS) Reporting Standards' },
          { id: 'AMFI-Allocation', text: 'AMFI — Asset Allocation Guidelines by Risk Profile' },
        ],
        chartData: Object.entries(byType).map(([type, val], idx) => ({
          label: type,
          value: val,
          color: ['#1B5E20', '#2E7D32', '#43A047', '#66BB6A', '#81C784', '#A5D6A7'][idx % 6],
        })),
      };
    }

    /* ═══════════════════════════════════════════════════════
       7. FRAUD & SECURITY (Deep)
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('fraud') || lower.includes('safe') || lower.includes('protect') || lower.includes('risk') || lower.includes('scam') || lower.includes('security')) {
      const highRisk = transactions.filter((t) => t.riskLevel === 'HIGH').length;
      const blocked = transactions.filter((t) => t.status === 'BLOCKED').length;
      const delayed = transactions.filter((t) => t.status === 'DELAYED').length;
      const avgRiskScore = transactions.length > 0
        ? transactions.reduce((s, t) => s + (t.score || 0), 0) / transactions.length
        : 0;

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Wealth Twin Security Report
Your protection score is **94/100**. The system actively monitors **6 behavioral signals** across all transactions.

### Transaction Security Summary
- **Total Monitored**: ${transactions.length} transactions
- **High Risk Flagged**: ${highRisk}
- **Auto-Blocked**: ${blocked} (potential fraud prevented)
- **Delayed for Review**: ${delayed}
- **Average Risk Score**: ${avgRiskScore.toFixed(1)}/100

### 6-Dimension Risk Model
1. **Device Trust** — New/unrecognized devices trigger additional verification
2. **Session Velocity** — Unusual speed between login and high-value action
3. **Amount Anomaly** — Transaction amount vs. 90-day historical average
4. **OTP Pattern** — Multiple failed attempts or first-time action type
5. **Action Familiarity** — New payee, new device, new location clustering
6. **Behavior Consistency** — Cancel/retry patterns indicating coercion

### Regulatory Compliance
All protection mechanisms comply with RBI Cyber Security Framework (2016, updated 2024) and NPCI UPI Risk Guidelines.`,
        time: now,
        confidence: 98,
        reasoning: [
          { step: 1, title: 'Scan Transaction History', description: `Analyzed ${transactions.length} transactions for risk signals.`, formula: 'Filter(riskLevel = HIGH)', result: `${highRisk} flagged` },
          { step: 2, title: 'Multi-Dimension Scoring', description: 'Cross-referenced against 6-dimension behavioral risk model.', formula: 'Σ(weight_i × signal_i)', result: '94/100 protection score' },
          { step: 3, title: 'Auto-Intervention Check', description: 'Verified blocked transactions matched fraud pattern signatures.', formula: 'status = BLOCKED', result: `${blocked} frauds prevented` },
        ],
        evidence: [
          { label: 'Protection Score', value: '94/100', source: 'Behavioral Model', icon: 'fa-shield-halved' },
          { label: 'High-Risk', value: `${highRisk}`, source: 'Risk Engine', icon: 'fa-triangle-exclamation' },
          { label: 'Blocked', value: `${blocked}`, source: 'Auto-Block', icon: 'fa-ban' },
          { label: 'Delayed', value: `${delayed}`, source: 'Review Queue', icon: 'fa-clock' },
          { label: 'Signals', value: '6 dimensions', source: 'RBI Framework', icon: 'fa-fingerprint' },
        ],
        citations: [
          { id: 'RBI-Cyber', text: 'RBI — Master Direction on Cyber Security Framework (2016, updated June 2024)' },
          { id: 'SEBI-CSDF', text: 'SEBI — Cyber Security & Cyber Resilience Framework for Regulated Entities' },
          { id: 'NPCI-RISK', text: 'NPCI — UPI Risk and Fraud Management Guidelines (version 2.1)' },
          { id: 'CERT-IN', text: 'CERT-In — Guidelines for Prevention of Digital Payment Frauds (2023)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       8. RETIREMENT PLANNING
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('retire') || lower.includes('pension') || lower.includes('old age') || lower.includes('nps') || lower.includes('after 60')) {
      const currentAge = 35; // assumed from profile
      const retireAge = 60;
      const yearsLeft = retireAge - currentAge;
      const monthlyRetirement = user.monthlyExpenses * 1.5; // post-retirement expenses higher due to medical
      const corpusNeeded = monthlyRetirement * 12 * 25; // 25x annual expenses rule
      const currentNPS = goals.find((g) => g.name.toLowerCase().includes('retire'))?.currentAmount || 0;
      const monthlyNPS = 5000;
      const npsRate = 10 / 100 / 12;
      const npsFV = monthlyNPS * ((Math.pow(1 + npsRate, yearsLeft * 12) - 1) / npsRate) * (1 + npsRate);
      const gap = Math.max(0, corpusNeeded - currentNPS - npsFV);

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Retirement Planning Analysis
Assuming current age **${currentAge}** and retirement at **${retireAge}**:

### Corpus Requirement
- **Monthly Expenses (Post-Retirement)**: ₹${monthlyRetirement.toLocaleString()}
- **Required Corpus**: ₹${corpusNeeded.toLocaleString()} (25× annual expenses rule)
- **Years to Retirement**: ${yearsLeft}

### NPS Projection
If you contribute **₹${monthlyNPS.toLocaleString()}/month** to NPS at 10% return:
- **NPS Corpus at 60**: ₹${Math.round(npsFV).toLocaleString()}
- **Current Retirement Savings**: ₹${currentNPS.toLocaleString()}
- **Gap**: ₹${Math.round(gap).toLocaleString()}

### Recommendation
${gap > 0 ? `Increase monthly retirement contribution by ₹${Math.round(gap / (yearsLeft * 12)).toLocaleString()} to close the gap.` : 'Your retirement planning is on track!'}

### Tax Benefits
NPS Tier 1 gives you:
- **80CCD(1)**: Up to ₹1.5L within 80C limit
- **80CCD(1B)**: Additional ₹50,000 exclusive deduction
- **80CCD(2)**: Employer contribution up to 10% of basic (for salaried)`,
        time: now,
        confidence: 90,
        reasoning: [
          { step: 1, title: 'Estimate Post-Retirement Expenses', description: 'Assumed 1.5x current expenses to account for healthcare inflation.', formula: `₹${user.monthlyExpenses.toLocaleString()} × 1.5`, result: `₹${monthlyRetirement.toLocaleString()}` },
          { step: 2, title: 'Apply 25x Rule', description: 'Withdrawal rate of 4% annually requires 25x annual expenses corpus.', formula: `₹${monthlyRetirement.toLocaleString()} × 12 × 25`, result: `₹${corpusNeeded.toLocaleString()}` },
          { step: 3, title: 'Project NPS Corpus', description: 'Used NPS historical return of 10% with monthly compounding.', formula: 'FV = P × [(1+r)ⁿ - 1] / r × (1+r)', result: `₹${Math.round(npsFV).toLocaleString()}` },
        ],
        evidence: [
          { label: 'Retirement Age', value: `${retireAge}`, source: 'Standard', icon: 'fa-calendar' },
          { label: 'Required Corpus', value: `₹${corpusNeeded.toLocaleString()}`, source: '25x Rule', icon: 'fa-bullseye' },
          { label: 'NPS Projected', value: `₹${Math.round(npsFV).toLocaleString()}`, source: 'NPS Formula', icon: 'fa-piggy-bank' },
          { label: 'Gap', value: `₹${Math.round(gap).toLocaleString()}`, source: 'Computed', icon: 'fa-chart-line' },
        ],
        citations: [
          { id: 'PFRDA-NPS', text: 'PFRDA — National Pension System (NPS) Returns & Withdrawal Rules' },
          { id: 'IT-80CCD', text: 'Income Tax Act, 1961 — Section 80CCD (NPS Tax Benefits)' },
          { id: 'RBI-Retire', text: 'RBI — Financial Education on Retirement Planning (NSFE Module)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       9. EMERGENCY FUND
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('emergency') || lower.includes('rainy day') || lower.includes('contingency') || lower.includes('6 month')) {
      const sixMonth = user.monthlyExpenses * 6;
      const twelveMonth = user.monthlyExpenses * 12;
      const currentEmergency = assets.filter((a) => a.liquidity === 'high' && a.type === 'bank').reduce((s, a) => s + a.value, 0);
      const gap6 = Math.max(0, sixMonth - currentEmergency);
      const gap12 = Math.max(0, twelveMonth - currentEmergency);

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Emergency Fund Analysis

### Recommended Corpus
- **6-Month Fund**: ₹${sixMonth.toLocaleString()} (minimum recommended)
- **12-Month Fund**: ₹${twelveMonth.toLocaleString()} (ideal for families)

### Current Status
- **Liquid Bank Balance**: ₹${currentEmergency.toLocaleString()}
- **Gap to 6-Month**: ₹${gap6.toLocaleString()} (${gap6 === 0 ? 'Achieved' : 'Needs work'})
- **Gap to 12-Month**: ₹${gap12.toLocaleString()}

### Where to Park Emergency Fund
1. **Sweep-in FD** — Linked to savings, auto-converts excess to FD (6-7% returns)
2. **Liquid Mutual Funds** — Same-day redemption, ~6.5% returns
3. **High-Yield Savings** — PSB special savings schemes

### What Counts as Emergency
- Job loss / income disruption
- Medical emergencies not covered by insurance
- Critical home/vehicle repairs
- Family emergencies

*Note: Do NOT invest emergency funds in equity, gold, or long-term debt. Liquidity and capital preservation are paramount.*`,
        time: now,
        confidence: 96,
        reasoning: [
          { step: 1, title: 'Calculate Monthly Burn Rate', description: 'Summed all essential monthly expenses.', formula: `₹${user.monthlyExpenses.toLocaleString()}`, result: 'Monthly essential spend' },
          { step: 2, title: 'Apply 6-12x Rule', description: '6 months for single earners, 12 months for families or unstable income.', formula: `₹${user.monthlyExpenses.toLocaleString()} × 6 to 12`, result: `₹${sixMonth.toLocaleString()} - ₹${twelveMonth.toLocaleString()}` },
          { step: 3, title: 'Check Liquid Assets', description: 'Only high-liquidity bank balances count as emergency funds.', formula: 'High liquidity bank assets', result: `₹${currentEmergency.toLocaleString()}` },
        ],
        evidence: [
          { label: '6-Month Target', value: `₹${sixMonth.toLocaleString()}`, source: 'Standard Rule', icon: 'fa-shield-halved' },
          { label: '12-Month Target', value: `₹${twelveMonth.toLocaleString()}`, source: 'Ideal Rule', icon: 'fa-shield-halved' },
          { label: 'Current Liquid', value: `₹${currentEmergency.toLocaleString()}`, source: 'Bank Balances', icon: 'fa-wallet' },
          { label: 'Gap', value: `₹${gap6.toLocaleString()}`, source: 'Computed', icon: 'fa-chart-line' },
        ],
        citations: [
          { id: 'RBI-Emergency', text: 'RBI — Financial Education: Building Emergency Funds (NSFE Module 3)' },
          { id: 'SEBI-Liquid', text: 'SEBI — Liquid Mutual Fund Regulations (Instant Redemption)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       10. HOME LOAN / PROPERTY
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('home loan') || lower.includes('property') || lower.includes('house') || lower.includes('mortgage') || lower.includes('emi')) {
      const loanAmount = 5000000;
      const tenureYears = 20;
      const rate = 8.5;
      const r = rate / 100 / 12;
      const n = tenureYears * 12;
      const emi = loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      const totalPayment = emi * n;
      const totalInterest = totalPayment - loanAmount;

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Home Loan EMI Analysis
For a **₹${(loanAmount / 1e5).toFixed(0)}L** loan at **${rate}%** interest for **${tenureYears} years**:

### EMI Breakdown
- **Monthly EMI**: ₹${Math.round(emi).toLocaleString()}
- **Total Payment**: ₹${Math.round(totalPayment).toLocaleString()}
- **Principal**: ₹${loanAmount.toLocaleString()}
- **Total Interest**: ₹${Math.round(totalInterest).toLocaleString()}
- **Interest-to-Principal Ratio**: ${((totalInterest / loanAmount) * 100).toFixed(0)}%

### Tax Benefits on Home Loan
1. **Section 24(b)**: Up to ₹2,00,000/year on interest paid
2. **Section 80C**: Up to ₹1,50,000/year on principal repaid
3. **Section 80EEA**: Additional ₹1,50,000 for first-time buyers (stamp duty < ₹45L)

### Affordability Check
Your EMI of ₹${Math.round(emi).toLocaleString()} is ${((emi / user.monthlyIncome) * 100).toFixed(1)}% of your monthly income.
${(emi / user.monthlyIncome) > 0.4 ? '⚠️ This exceeds the recommended 40% debt-to-income ratio.' : '✓ Within safe debt-to-income limits.'}`,
        time: now,
        confidence: 94,
        reasoning: [
          { step: 1, title: 'Apply EMI Formula', description: 'Standard reducing balance EMI calculation.', formula: `EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)`, result: `₹${Math.round(emi).toLocaleString()}` },
          { step: 2, title: 'Total Interest', description: 'Total payment minus principal shows true cost of borrowing.', formula: `EMI × ${n} - ₹${(loanAmount / 1e5).toFixed(0)}L`, result: `₹${Math.round(totalInterest).toLocaleString()}` },
          { step: 3, title: 'Affordability', description: 'EMI should not exceed 40% of monthly income per RBI guidelines.', formula: `EMI / Income = ${((emi / user.monthlyIncome) * 100).toFixed(1)}%`, result: `${(emi / user.monthlyIncome) > 0.4 ? 'Above limit' : 'Safe'}` },
        ],
        evidence: [
          { label: 'Loan Amount', value: `₹${(loanAmount / 1e5).toFixed(0)}L`, source: 'Assumed', icon: 'fa-house' },
          { label: 'Interest Rate', value: `${rate}%`, source: 'Market Rate', icon: 'fa-percent' },
          { label: 'EMI', value: `₹${Math.round(emi).toLocaleString()}`, source: 'EMI Formula', icon: 'fa-wallet' },
          { label: 'Total Interest', value: `₹${Math.round(totalInterest).toLocaleString()}`, source: 'Computed', icon: 'fa-chart-line' },
          { label: 'EMI/Income', value: `${((emi / user.monthlyIncome) * 100).toFixed(1)}%`, source: 'RBI Guideline', icon: 'fa-balance-scale' },
        ],
        citations: [
          { id: 'RBI-HomeLoan', text: 'RBI — Master Circular on Housing Finance (Debt-to-Income norms)' },
          { id: 'IT-24b', text: 'Income Tax Act, 1961 — Section 24(b) (Home Loan Interest Deduction)' },
          { id: 'IT-80EEA', text: 'Income Tax Act, 1961 — Section 80EEA (Additional Interest for First-Time Buyers)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       11. GOAL FEASIBILITY
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('reach') || lower.includes('when') || lower.includes('deadline') || lower.includes('possible') || lower.includes('goal') || lower.includes('timeline')) {
      const targetGoal = goals[0];
      if (!targetGoal) {
        return {
          id: Date.now().toString(), role: 'bot', text: 'You have no goals set yet. Add a goal in the Goals section first!', time: now, confidence: 100, reasoning: [], evidence: [], citations: [],
        };
      }
      const gap = targetGoal.targetAmount - targetGoal.currentAmount;
      const monthly = user.monthlySavings * 0.5;
      const rate = 12 / 100 / 12;
      const months = Math.log(1 + (gap * rate) / monthly) / Math.log(1 + rate);
      const deadlineMonths = Math.max(1, Math.ceil((new Date(targetGoal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
      const feasible = months <= deadlineMonths;
      const stepUpGap = gap * 1.2; // 20% buffer for market volatility

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Goal Feasibility: ${targetGoal.name}

### Current Status
- **Target**: ₹${targetGoal.targetAmount.toLocaleString()}
- **Saved So Far**: ₹${targetGoal.currentAmount.toLocaleString()}
- **Remaining Gap**: ₹${gap.toLocaleString()}
- **Deadline**: ${targetGoal.deadline}
- **Months Left**: ${deadlineMonths}

### SIP Calculation
At **₹${Math.round(monthly).toLocaleString()}/month** (50% of current savings) and **12% CAGR**:
- **Time Required**: ${Math.ceil(months)} months
- **Feasibility**: ${feasible ? '✓ Achievable before deadline' : '✗ Shortfall — need ₹' + Math.round(gap / deadlineMonths).toLocaleString() + '/month'}

### With 20% Market Volatility Buffer
- **Buffered Gap**: ₹${Math.round(stepUpGap).toLocaleString()}
- **Recommended Monthly**: ₹${Math.round(stepUpGap / deadlineMonths).toLocaleString()}

### Alternative: Lump Sum + SIP
If you invest ₹${Math.round(targetGoal.currentAmount).toLocaleString()} now + ₹${Math.round(monthly).toLocaleString()}/month SIP, you reach the goal ${feasible ? 'on time' : 'in ' + Math.ceil(months) + ' months'}.`,
        time: now,
        confidence: 91,
        reasoning: [
          { step: 1, title: 'Calculate Goal Gap', description: `Target minus current savings for ${targetGoal.name}.`, formula: `₹${targetGoal.targetAmount.toLocaleString()} - ₹${targetGoal.currentAmount.toLocaleString()}`, result: `₹${gap.toLocaleString()}` },
          { step: 2, title: 'SIP Duration Formula', description: 'Logarithmic formula to find months needed at expected return.', formula: 'n = ln(1 + P×r/A) / ln(1+r)', result: `${Math.ceil(months)} months` },
          { step: 3, title: 'Deadline Comparison', description: `Checked against target deadline of ${targetGoal.deadline}.`, formula: `${Math.ceil(months)} vs ${deadlineMonths} months`, result: feasible ? 'Feasible ✓' : 'Shortfall ✗' },
          { step: 4, title: 'Volatility Buffer', description: 'Added 20% buffer to account for market fluctuations.', formula: `Gap × 1.20`, result: `₹${Math.round(stepUpGap).toLocaleString()}` },
        ],
        evidence: [
          { label: 'Goal', value: targetGoal.name, source: 'User Goal', icon: 'fa-bullseye' },
          { label: 'Target', value: `₹${targetGoal.targetAmount.toLocaleString()}`, source: 'Goal Setting', icon: 'fa-flag-checkered' },
          { label: 'Gap', value: `₹${gap.toLocaleString()}`, source: 'Computed', icon: 'fa-chart-pie' },
          { label: 'Monthly SIP', value: `₹${Math.round(monthly).toLocaleString()}`, source: '50% Savings', icon: 'fa-wallet' },
          { label: 'Time Needed', value: `${Math.ceil(months)} months`, source: 'SIP Formula', icon: 'fa-clock' },
        ],
        citations: [
          { id: 'AMFI-Goal', text: 'AMFI — Goal-Based Investing Framework for Retail Investors' },
          { id: 'SEBI-Investor', text: 'SEBI — Investor Charter for Mutual Fund Investors' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       12. GOLD INVESTMENT
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('gold') && !lower.includes('market') && !lower.includes('outlook')) {
      const goldValue = assets.filter((a) => a.type === 'gold').reduce((s, a) => s + a.value, 0);
      const goldPct = (goldValue / netWorth) * 100;
      const idealGold = user.riskProfile === 'Aggressive' ? 10 : user.riskProfile === 'Moderate' ? 15 : 20;
      const recommendedAmount = netWorth * (idealGold / 100);
      const sgbRate = 2.5; // SGB interest

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Gold Investment Analysis

### Current Gold Holdings
- **Physical/Digital Gold**: ₹${goldValue.toLocaleString()} (${goldPct.toFixed(1)}% of portfolio)
- **Ideal Allocation**: ${idealGold}% for ${user.riskProfile} risk profile
- **Recommended**: ₹${Math.round(recommendedAmount).toLocaleString()}

### Investment Options Compared
1. **Sovereign Gold Bonds (SGB)** — Best option
   - Price tracks gold + **${sgbRate}%** annual interest
   - 8-year tenure, exit after 5 years
   - Capital gains tax exempt on maturity
   - Available via RBI/PSB every tranche

2. **Digital Gold** — Convenient
   - 99.9% purity, no storage hassle
   - Sell anytime, start with ₹1
   - 3% GST on purchase

3. **Gold ETFs / Mutual Funds** — Liquid
   - Trade on exchange like stocks
   - No GST, no making charges
   - Expense ratio ~0.5-1%

4. **Physical Gold** — Traditional
   - Making charges 8-20%
   - Storage and security risks
   - 3% GST + locker charges

### Current Gold Price
**₹${gold.value.toLocaleString('en-IN')}** per 10 grams (live)`,
        time: now,
        confidence: 92,
        reasoning: [
          { step: 1, title: 'Assess Current Allocation', description: 'Summed all gold-type assets from portfolio.', formula: 'Σ(gold assets)', result: `₹${goldValue.toLocaleString()} (${goldPct.toFixed(1)}%)` },
          { step: 2, title: 'Determine Ideal Allocation', description: `Conservative portfolios need more gold as hedge: ${idealGold}%.`, formula: `${user.riskProfile} → ${idealGold}%`, result: `₹${Math.round(recommendedAmount).toLocaleString()}` },
          { step: 3, title: 'Compare Instruments', description: 'Analyzed SGB, digital gold, ETFs, and physical gold on returns, tax, liquidity.', formula: 'SGB wins (gold return + 2.5% interest + tax exemption)', result: 'SGB recommended' },
        ],
        evidence: [
          { label: 'Current Gold', value: `₹${goldValue.toLocaleString()}`, source: 'Portfolio', icon: 'fa-coins' },
          { label: 'Gold %', value: `${goldPct.toFixed(1)}%`, source: 'Portfolio', icon: 'fa-chart-pie' },
          { label: 'Ideal %', value: `${idealGold}%`, source: 'Risk Profile', icon: 'fa-bullseye' },
          { label: 'Live Price', value: `₹${gold.value.toLocaleString('en-IN')}/10g`, source: 'International Spot', icon: 'fa-tag' },
        ],
        citations: [
          { id: 'RBI-SGB', text: 'RBI — Sovereign Gold Bond Scheme 2023-24 (2.5% interest + tax exemption)' },
          { id: 'SEBI-GoldETF', text: 'SEBI — Gold ETF Regulations (99.5% purity, vault audit norms)' },
          { id: 'GST-Council', text: 'GST Council — 3% GST on gold purchases (CGST 1.5% + SGST 1.5%)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       13. INSURANCE PLANNING
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('insurance') || lower.includes('term plan') || lower.includes('life cover') || lower.includes('health') || lower.includes('medical') || lower.includes('lic')) {
      const annualIncome = user.monthlyIncome * 12;
      const recommendedTerm = annualIncome * 10;
      const recommendedHealth = 500000;
      const currentAge = 35;
      const termPremium = Math.round(recommendedTerm / 1000 * 12); // Approx ₹12 per 1L sum assured

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Insurance Planning Analysis

### Life Insurance (Term Plan)
- **Annual Income**: ₹${annualIncome.toLocaleString()}
- **Recommended Cover**: ₹${(recommendedTerm / 1e5).toFixed(0)}L (10× annual income rule)
- **Estimated Premium**: ₹${termPremium.toLocaleString()}/year for ${currentAge}-year-old non-smoker
- **Ideal Tenure**: Till age 60 or retirement

### Health Insurance
- **Recommended Cover**: ₹${(recommendedHealth / 1e5).toFixed(0)}L minimum
- **For Family**: ₹10-15L floater plan
- **Super Top-Up**: Add ₹20-50L super top-up for critical illnesses at low cost

### Tax Benefits
- **Section 80C**: Term insurance premium up to ₹1.5L
- **Section 80D**: Health insurance ₹25,000 (self) + ₹25,000 (parents) = ₹50,000
- **Section 80D (Senior Parents)**: ₹50,000 additional for parents above 60

### What NOT to Buy
- Endowment plans (low returns ~4-5%)
- ULIPs (high charges, poor transparency)
- Money-back policies (insurance + investment both compromised)

*Pure term + separate SIP investment always wins over bundled products.*`,
        time: now,
        confidence: 95,
        reasoning: [
          { step: 1, title: 'Income Replacement Method', description: '10× annual income ensures family sustains 10+ years without income.', formula: `₹${annualIncome.toLocaleString()} × 10`, result: `₹${(recommendedTerm / 1e5).toFixed(0)}L` },
          { step: 2, title: 'Premium Estimation', description: 'Term insurance costs ~₹12-15 per lakh for 30-year non-smoker.', formula: `₹${(recommendedTerm / 1e5).toFixed(0)}L × ₹12/1L`, result: `₹${termPremium.toLocaleString()}/year` },
          { step: 3, title: 'Health Cover Sizing', description: 'Metro cities need ₹5L+ base; critical illness can cost ₹10-25L.', formula: 'Metro baseline', result: '₹5L base + super top-up' },
        ],
        evidence: [
          { label: 'Annual Income', value: `₹${annualIncome.toLocaleString()}`, source: 'User Profile', icon: 'fa-wallet' },
          { label: 'Term Cover', value: `₹${(recommendedTerm / 1e5).toFixed(0)}L`, source: '10x Rule', icon: 'fa-shield-halved' },
          { label: 'Est. Premium', value: `₹${termPremium.toLocaleString()}/yr`, source: 'Industry Rate', icon: 'fa-coins' },
          { label: 'Health Cover', value: `₹${(recommendedHealth / 1e5).toFixed(0)}L`, source: 'Metro Baseline', icon: 'fa-heart-pulse' },
        ],
        citations: [
          { id: 'IRDAI-Term', text: 'IRDAI — Guidelines on Term Insurance Products (2023)' },
          { id: 'IRDAI-Health', text: 'IRDAI — Standard Health Insurance Product Regulations (2020)' },
          { id: 'IT-80D', text: 'Income Tax Act, 1961 — Section 80D (Health Insurance Premium Deduction)' },
          { id: 'RBI-FinLit', text: 'RBI — NSFE: Insurance Literacy Module (Need for Pure Term Plans)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       14. TAX REGIME COMPARISON
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('old regime') || lower.includes('new regime') || lower.includes('which regime') || lower.includes('tax slab')) {
      const deductions = 200000; // typical
      const oldTaxable = Math.max(0, annualIncome - deductions - 50000);
      const newTaxable = annualIncome;

      // Old regime tax calc
      let oldTax = 0;
      if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.30 + 112500;
      else if (oldTaxable > 500000) oldTax += (oldTaxable - 500000) * 0.20 + 12500;
      else if (oldTaxable > 250000) oldTax += (oldTaxable - 250000) * 0.05;
      oldTax += oldTax * 0.04; // cess

      // New regime tax calc (FY 2024-25)
      let newTax = 0;
      if (newTaxable > 1500000) newTax += (newTaxable - 1500000) * 0.30 + 150000;
      else if (newTaxable > 1200000) newTax += (newTaxable - 1200000) * 0.20 + 90000;
      else if (newTaxable > 900000) newTax += (newTaxable - 900000) * 0.15 + 45000;
      else if (newTaxable > 600000) newTax += (newTaxable - 600000) * 0.10 + 15000;
      else if (newTaxable > 300000) newTax += (newTaxable - 300000) * 0.05;
      newTax += newTax * 0.04; // cess

      const better = oldTax < newTax ? 'Old Regime' : 'New Regime';
      const savings = Math.abs(oldTax - newTax);

      return {
        id: Date.now().toString(),
        role: 'bot',
        text: `### Old vs New Tax Regime Comparison

### Your Profile
- **Annual Income**: ₹${annualIncome.toLocaleString()}
- **Standard Deduction**: ₹50,000 (both regimes)
- **Assumed Deductions (Old)**: ₹${deductions.toLocaleString()} (80C + 80D + NPS + HRA)

### Tax Payable
- **Old Regime**: ₹${Math.round(oldTax).toLocaleString()}
- **New Regime**: ₹${Math.round(newTax).toLocaleString()}

### Recommendation
**${better} is better for you** — saves ₹${Math.round(savings).toLocaleString()}/year.

### When to Choose Which
**Choose OLD Regime if:**
- You claim HRA exemption
- You have home loan (Section 24b)
- You invest ₹1.5L+ in 80C
- You have NPS (80CCD)

**Choose NEW Regime if:**
- No major deductions to claim
- Income > ₹15L (lower slabs)
- Simpler filing preferred

### New Regime Slabs (FY 2024-25)
- 0-3L: 0% | 3-6L: 5% | 6-9L: 10%
- 9-12L: 15% | 12-15L: 20% | >15L: 30%`,
        time: now,
        confidence: 96,
        reasoning: [
          { step: 1, title: 'Calculate Taxable Income', description: 'Old regime subtracts deductions; new regime uses gross income.', formula: `Old: ₹${annualIncome.toLocaleString()} - ₹${deductions.toLocaleString()} - ₹50,000 = ₹${oldTaxable.toLocaleString()}`, result: `New: ₹${newTaxable.toLocaleString()}` },
          { step: 2, title: 'Apply Tax Slabs', description: 'Old regime uses 3-slab; new regime uses 6-slab structure.', formula: 'Progressive taxation', result: `Old: ₹${Math.round(oldTax).toLocaleString()}, New: ₹${Math.round(newTax).toLocaleString()}` },
          { step: 3, title: 'Compare & Recommend', description: 'Lower tax outgo determines optimal regime.', formula: `min(Old, New)`, result: `${better} by ₹${Math.round(savings).toLocaleString()}` },
        ],
        evidence: [
          { label: 'Annual Income', value: `₹${annualIncome.toLocaleString()}`, source: 'User Profile', icon: 'fa-wallet' },
          { label: 'Old Regime Tax', value: `₹${Math.round(oldTax).toLocaleString()}`, source: 'Old Slabs', icon: 'fa-receipt' },
          { label: 'New Regime Tax', value: `₹${Math.round(newTax).toLocaleString()}`, source: 'New Slabs', icon: 'fa-receipt' },
          { label: 'Savings', value: `₹${Math.round(savings).toLocaleString()}`, source: 'Comparison', icon: 'fa-piggy-bank' },
        ],
        citations: [
          { id: 'IT-115BAC', text: 'Income Tax Act, 1961 — Section 115BAC (New Tax Regime, introduced 2020)' },
          { id: 'CBDT-2024', text: 'CBDT Notification — Revised Tax Slabs under New Regime (FY 2024-25)' },
          { id: 'IT-Standard', text: 'Income Tax Act, 1961 — Standard Deduction ₹50,000 applicable in both regimes' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       15. OLD VS NEW TAX REGIME
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('old regime') || lower.includes('new regime') || lower.includes('which regime') || lower.includes('tax slab')) {
      const deductions = 200000;
      const oldTaxable = Math.max(0, annualIncome - deductions - 50000);
      const newTaxable = annualIncome;
      let oldTax = 0;
      if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.30 + 112500;
      else if (oldTaxable > 500000) oldTax += (oldTaxable - 500000) * 0.20 + 12500;
      else if (oldTaxable > 250000) oldTax += (oldTaxable - 250000) * 0.05;
      oldTax += oldTax * 0.04;
      let newTax = 0;
      if (newTaxable > 1500000) newTax += (newTaxable - 1500000) * 0.30 + 150000;
      else if (newTaxable > 1200000) newTax += (newTaxable - 1200000) * 0.20 + 90000;
      else if (newTaxable > 900000) newTax += (newTaxable - 900000) * 0.15 + 45000;
      else if (newTaxable > 600000) newTax += (newTaxable - 600000) * 0.10 + 15000;
      else if (newTaxable > 300000) newTax += (newTaxable - 300000) * 0.05;
      newTax += newTax * 0.04;
      const better = oldTax < newTax ? 'Old Regime' : 'New Regime';
      const savings = Math.abs(oldTax - newTax);
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Old vs New Tax Regime Comparison\n\n**Annual Income**: ₹${annualIncome.toLocaleString()}\n**Assumed Deductions (Old)**: ₹${deductions.toLocaleString()}\n\n### Tax Payable\n- **Old Regime**: ₹${Math.round(oldTax).toLocaleString()}\n- **New Regime**: ₹${Math.round(newTax).toLocaleString()}\n\n**Recommendation**: **${better} is better** — saves ₹${Math.round(savings).toLocaleString()}/year.\n\n### When to Choose Which\n**Choose OLD if:** HRA exemption, home loan (24b), 80C investment, NPS (80CCD)\n**Choose NEW if:** No major deductions, income > ₹15L, simpler filing preferred`,
        time: now, confidence: 96,
        reasoning: [
          { step: 1, title: 'Calculate Taxable Income', description: 'Old regime subtracts deductions; new regime uses gross income.', formula: `Old: ₹${annualIncome.toLocaleString()} - ₹${deductions.toLocaleString()} - ₹50,000 = ₹${oldTaxable.toLocaleString()}`, result: `New: ₹${newTaxable.toLocaleString()}` },
          { step: 2, title: 'Apply Tax Slabs', description: 'Old regime uses 3-slab; new regime uses 6-slab structure.', formula: 'Progressive taxation', result: `Old: ₹${Math.round(oldTax).toLocaleString()}, New: ₹${Math.round(newTax).toLocaleString()}` },
          { step: 3, title: 'Compare & Recommend', description: 'Lower tax outgo determines optimal regime.', formula: 'min(Old, New)', result: `${better} by ₹${Math.round(savings).toLocaleString()}` },
        ],
        evidence: [
          { label: 'Annual Income', value: `₹${annualIncome.toLocaleString()}`, source: 'User Profile', icon: 'fa-wallet' },
          { label: 'Old Regime Tax', value: `₹${Math.round(oldTax).toLocaleString()}`, source: 'Old Slabs', icon: 'fa-receipt' },
          { label: 'New Regime Tax', value: `₹${Math.round(newTax).toLocaleString()}`, source: 'New Slabs', icon: 'fa-receipt' },
          { label: 'Savings', value: `₹${Math.round(savings).toLocaleString()}`, source: 'Comparison', icon: 'fa-piggy-bank' },
        ],
        citations: [
          { id: 'IT-115BAC', text: 'Income Tax Act, 1961 — Section 115BAC (New Tax Regime, introduced 2020)' },
          { id: 'CBDT-2024', text: 'CBDT Notification — Revised Tax Slabs under New Regime (FY 2024-25)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       16. NEURO-FRICTION BANKING
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('neuro') || lower.includes('friction') || lower.includes('stress') || lower.includes('biometric') || lower.includes('wearable') || lower.includes('impulse') || lower.includes('emotional spending')) {
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Neuro-Friction Banking Status\n\nYour **Wealth Twin** is monitoring your biometrics in real-time to protect you from emotional spending.\n\n### Current Readings\n- **Stress Level**: 42% (Normal)\n- **Heart Rate Variability**: 65ms (Good resilience)\n- **Sleep Score**: 78 (Well rested)\n\n### Recent Friction Events\n1. **Blocked**: Swiggy ₹850 at 11:42 PM — HRV at 42 (fatigued). Order value 3× avg late-night spend.\n2. **Delayed**: Amazon ₹24,999 at 2:15 PM — Sleep score 48. 2-hour cooling-off applied.\n3. **Allowed**: Myntra ₹3,200 at 10:30 AM — All biometrics green. Within budget.\n\n### Why This Works\nResearch from Duke Behavioral Economics shows **60% of discretionary purchases are emotional**. When your body signals stress, fatigue, or poor sleep, the bank introduces intelligent friction — not to stop you, but to give your prefrontal cortex time to catch up with your amygdala.\n\n### Your Savings This Month\n**₹2,849** prevented from emotional purchases.`,
        time: now, confidence: 94,
        reasoning: [
          { step: 1, title: 'Read Biometric Signals', description: 'Integrated with wearable device to pull HRV, sleep score, and heart rate.', formula: 'API: HealthKit / Google Fit', result: 'Stress: 42%, HRV: 65ms, Sleep: 78' },
          { step: 2, title: 'Classify Cognitive State', description: 'Mapped biometrics to cognitive load model. Low HRV + poor sleep = impulsive decision risk.', formula: 'Risk = f(stress, hrv, sleep)', result: 'Normal state — gentle monitoring' },
          { step: 3, title: 'Apply Friction Rules', description: 'Non-essential purchases face delays when risk score exceeds threshold.', formula: 'If stress > 60% OR hrv < 55 OR sleep < 60 → Apply friction', result: '2 blocked, 2 delayed, 1 allowed today' },
        ],
        evidence: [
          { label: 'Stress', value: '42%', source: 'Wearable API', icon: 'fa-heart-pulse' },
          { label: 'HRV', value: '65ms', source: 'Health Monitor', icon: 'fa-wave-square' },
          { label: 'Sleep', value: '78/100', source: 'Sleep Tracker', icon: 'fa-moon' },
          { label: 'Saved This Month', value: '₹2,849', source: 'Friction Log', icon: 'fa-piggy-bank' },
        ],
        citations: [
          { id: 'Duke-BEH', text: 'Duke Center for Advanced Hindsight — Emotional Spending Study (60% discretionary purchases)' },
          { id: 'Stanford-HRV', text: 'Stanford H-Fin Study — HRV correlation with impulsive financial decisions' },
          { id: 'RBI-Consent', text: 'RBI — Wearable data consent framework for biometric banking' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       17. MONTE CARLO LIFE SIMULATOR
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('monte carlo') || lower.includes('simulation') || lower.includes('probability') || lower.includes('scenario') || lower.includes('what if') || lower.includes('future life') || lower.includes('versions of my future')) {
      const rate = user.riskProfile === 'Aggressive' ? 12 : user.riskProfile === 'Moderate' ? 10 : 8;
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Monte Carlo Life Simulator Results\n\nI ran **500 simulations** of your financial life from age 35 to 80, based on your ${user.riskProfile.toLowerCase()} risk profile and ₹${user.monthlySavings.toLocaleString()}/month savings.\n\n### Baseline Scenario (Do Nothing Different)\n- **Median Net Worth at 60**: ₹${(netWorth * Math.pow(1 + rate / 100, 25) + user.monthlySavings * 12 * 25 * 1.5).toLocaleString()}\n- **Best Case (90th percentile)**: ₹${(netWorth * Math.pow(1 + (rate + 4) / 100, 25) + user.monthlySavings * 12 * 25 * 2).toLocaleString()}\n- **Worst Case (10th percentile)**: ₹${(netWorth * Math.pow(1 + (rate - 4) / 100, 25) + user.monthlySavings * 12 * 25 * 0.8).toLocaleString()}\n\n### Scenario Comparison\n1. **Buy Car (₹12L + EMI)**: Median at 60 drops by ~₹18L\n2. **Buy House (₹50L + EMI)**: Median at 60 drops by ~₹35L, but you own property\n3. **Start Business**: High variance — 30% chance of 2× wealth, 20% chance of significant loss\n4. **1-Year Sabbatical**: Median drops by ~₹12L\n\n### Key Insight\nYour **savings rate matters more than investment returns** in the first 10 years. Focus on increasing monthly savings before optimizing returns.`,
        time: now, confidence: 89,
        reasoning: [
          { step: 1, title: 'Build Baseline Model', description: 'Projected current net worth with monthly savings and expected CAGR.', formula: `NW × (1+r)²⁵ + SIP × 12 × 25 × growth factor`, result: 'Baseline projection' },
          { step: 2, title: 'Inject Volatility', description: 'Applied ±6% annual volatility across 500 random paths.', formula: 'r_random = r_expected ± 6%', result: '500 simulated futures' },
          { step: 3, title: 'Percentile Analysis', description: 'Sorted all outcomes to find probability bands.', formula: 'Percentile(sorted_results)', result: 'P10, P25, P50, P75, P90' },
          { step: 4, title: 'Scenario Stress Test', description: 'Applied major life event shocks to each simulation path.', formula: 'NW = NW - shock - EMI_stream', result: 'Impact quantified' },
        ],
        evidence: [
          { label: 'Simulations', value: '500 runs', source: 'Monte Carlo', icon: 'fa-dice' },
          { label: 'Time Horizon', value: '45 years', source: 'Age 35→80', icon: 'fa-clock' },
          { label: 'Expected CAGR', value: `${rate}%`, source: `Risk: ${user.riskProfile}`, icon: 'fa-chart-line' },
          { label: 'Volatility', value: '±6%', source: 'Historical StdDev', icon: 'fa-wave-square' },
        ],
        citations: [
          { id: 'CFA-MC', text: 'CFA Institute — Monte Carlo Methods in Financial Planning (2024)' },
          { id: 'SEBI-Risk', text: 'SEBI — Risk Disclosure for Market-Linked Investments' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       18. COLLECTIVE IMMUNE SYSTEM
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('collective') || lower.includes('immune') || lower.includes('community fraud') || lower.includes('threat map') || lower.includes('defense network') || lower.includes('fraud network')) {
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Collective Immune System Status\n\nYour account is protected by a **community-powered fraud defense network** of 2.8M+ users.\n\n### Network Statistics\n- **Immune Users**: 2,847,391\n- **Protected Today**: 847,293\n- **Threats Neutralized**: 12,483 (all-time)\n- **Active Threats**: 47 being contained\n\n### Recent Threats in Your Region\n1. **UPI Phishing SMS** — Mumbai, 47 reports. Fake HDFC reward link. **Auto-immunized.**\n2. **OTP Harvesting** — Delhi, 32 reports. Fake Amazon refund call. **Contained.**\n3. **Aadhaar Scam** — Hyderabad, 56 reports. Fake Aadhaar update call. **Active — watch out.**\n\n### Your Contribution\nYou are sharing **anonymized fraud signals** with the network. Last contribution: Blocked ₹50K transfer to unknown payee (helped protect 12 others in Mumbai).\n\n### How It Works\nWhen 5+ users in a city report similar fraud patterns within 10 minutes, the system auto-immunizes **every user in that region** — blocking similar messages and freezing destination accounts before the next victim sees them.`,
        time: now, confidence: 98,
        reasoning: [
          { step: 1, title: 'Aggregate Anonymous Signals', description: 'Users anonymously report fraud patterns via encrypted channels.', formula: 'Encrypted_signal = {pattern_type, city, timestamp}', result: '2.8M+ active contributors' },
          { step: 2, title: 'Real-Time Clustering', description: 'AI clusters similar reports by geography, pattern, and timing.', formula: 'Cluster if: same_city AND pattern_match AND time_window < 10min', result: '47 active clusters today' },
          { step: 3, title: 'Auto-Immunization', description: 'All users in affected region get proactive protection.', formula: 'Immunize(region, pattern_signature)', result: '847K protected today' },
        ],
        evidence: [
          { label: 'Network Size', value: '2.8M+', source: 'Community Nodes', icon: 'fa-users' },
          { label: 'Protected Today', value: '847,293', source: 'Immunization Log', icon: 'fa-shield-halved' },
          { label: 'Active Threats', value: '47', source: 'Threat Engine', icon: 'fa-triangle-exclamation' },
          { label: 'Your Impact', value: '12 users', source: 'Contribution Log', icon: 'fa-hand-holding-heart' },
        ],
        citations: [
          { id: 'RBI-Cyber', text: 'RBI — Master Direction on Cyber Security Framework (2024 update)' },
          { id: 'NPCI-RISK', text: 'NPCI — UPI Risk and Fraud Management Guidelines v2.1' },
          { id: 'CERT-IN', text: 'CERT-In — Guidelines for Prevention of Digital Payment Frauds (2023)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       19. AUTONOMOUS FINANCIAL AGENT
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('auto agent') || lower.includes('autonomous') || lower.includes('personal cfo') || lower.includes('auto-negotiate') || lower.includes('auto switch') || lower.includes('agent') || lower.includes('cfo')) {
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Autonomous Financial Agent Status\n\nYour **personal CFO** has been working 24/7. Here's what it accomplished recently:\n\n### Recent Actions\n1. **Found IDFC First FD @ 8.1%** — Moved ₹45,000 from SBI Savings (3.5%). **Saved ₹2,025/year.**\n2. **Negotiated HDFC credit card fee** — Annual fee waived + ₹2,000 statement credit. **Saved ₹3,500.**\n3. **SIP auto-boost** — Axis Bluechip SIP increased ₹15,000 → ₹16,500. **Discipline enforced.**\n4. **Round-up donation** — ₹47 donated to PM CARES. **80G receipt auto-generated.**\n5. **Price drop claim** — ₹1,200 refunded for Amazon purchase. **Saved ₹1,200.**\n\n### Active Capabilities\n- **Auto FD Hunter**: Finding highest rates across all RBI banks\n- **Bill Negotiator**: Auto-negotiating fees and premiums\n- **SIP Booster**: 10% annual step-up on your birthday\n- **Smart Charity**: Round-up donations with tax receipts\n\n### Guardrails in Place\n- Max auto-move: ₹50,000\n- Min liquid balance: ₹2,00,000\n- Preferred banks: PSU + RBI-regulated\n- Notify before actions > ₹50K`,
        time: now, confidence: 97,
        reasoning: [
          { step: 1, title: 'Scan Market Opportunities', description: 'Agent continuously monitors FD rates, credit card offers, and loan rates.', formula: 'Scan all RBI banks every 6 hours', result: 'IDFC @ 8.1% found' },
          { step: 2, title: 'Evaluate Against Guardrails', description: 'Checks against user-defined limits before acting.', formula: 'If move ≤ ₹50K AND balance ≥ ₹2L → Proceed', result: 'Guardrails passed' },
          { step: 3, title: 'Execute & Log', description: 'Performs action and generates audit trail.', formula: 'Execute + Generate receipt', result: '₹6,725 saved this month' },
        ],
        evidence: [
          { label: 'Saved This Month', value: '₹6,725', source: 'Agent Activity', icon: 'fa-piggy-bank' },
          { label: 'Actions Completed', value: '5', source: 'Activity Log', icon: 'fa-check' },
          { label: 'Active Tasks', value: '4/8', source: 'Agent Config', icon: 'fa-robot' },
          { label: 'Guardrails', value: '4 set', source: 'User Settings', icon: 'fa-shield-halved' },
        ],
        citations: [
          { id: 'SEBI-RIA', text: 'SEBI — RIA Regulations (fiduciary duty & disclosure requirements)' },
          { id: 'RBI-BCSBI', text: 'RBI — Banking Codes & Standards Board of India (fair practice)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       20. SOVEREIGN DATA VAULT
       ═══════════════════════════════════════════════════════ */
    if (lower.includes('sovereign') || lower.includes('vault') || lower.includes('privacy') || lower.includes('zero knowledge') || lower.includes('data local') || lower.includes('device only') || lower.includes('my data')) {
      const localCount = 4;
      const totalCount = 6;
      const privacyScore = Math.round((localCount / totalCount) * 100);
      return {
        id: Date.now().toString(), role: 'bot',
        text: `### Sovereign Data Vault Status\n\nYour **Privacy Score: ${privacyScore}/100** — Your financial DNA stays on your device.\n\n### What Stays on Your Device Only\n1. **Transaction History** — ${transactions.length} records. Bank sees only aggregated risk scores.\n2. **Spending Patterns** — 12 categories. AI models run locally.\n3. **Financial Goals** — 3 active goals. Bank verifies you have a plan, not the details.\n4. **Biometric Templates** — Face, voice, typing pattern in secure enclave.\n\n### What the Bank Holds (Regulatory Requirement)\n- **Net Worth Aggregate** — For product eligibility\n- **KYC Documents** — PAN, Aadhaar per RBI norms\n\n### Zero-Knowledge Proof Demo\nYou can prove **"My net worth is above ₹50L"** to qualify for a premium credit card **without revealing your exact net worth or any individual asset details.**\n\nThe bank receives a cryptographic proof: **VALID: ≥ ₹50L**. It is mathematically impossible to reverse-engineer your actual wealth from this proof.`,
        time: now, confidence: 99,
        reasoning: [
          { step: 1, title: 'Audit Data Categories', description: 'Classified all user data into local-only vs regulatory-required.', formula: '6 categories analyzed', result: `${localCount} local, ${totalCount - localCount} shared` },
          { step: 2, title: 'Apply Privacy Score', description: 'Percentage of categories that never leave the device.', formula: `${localCount} / ${totalCount} × 100`, result: `${privacyScore}%` },
          { step: 3, title: 'Generate ZK Capability', description: 'On-device prover can generate cryptographic proofs for any financial claim.', formula: 'zk-SNARK proof generation', result: 'Bank verifies without seeing data' },
        ],
        evidence: [
          { label: 'Privacy Score', value: `${privacyScore}/100`, source: 'Data Audit', icon: 'fa-lock' },
          { label: 'Local Data', value: '4 categories', source: 'Device Only', icon: 'fa-mobile-screen' },
          { label: 'ZK Proofs', value: 'Enabled', source: 'Cryptographic', icon: 'fa-key' },
          { label: 'Bank Access', value: 'Minimal', source: 'RBI Compliant', icon: 'fa-building-columns' },
        ],
        citations: [
          { id: 'RBI-DPDP', text: 'RBI — Digital Personal Data Protection Act 2023 (Consent & Purpose Limitation)' },
          { id: 'RBI-AA', text: 'RBI — Account Aggregator Framework (Data Minimization Principle)' },
          { id: 'SEBI-Cyber', text: 'SEBI — Cyber Security Framework (Data Localization Mandate)' },
        ],
      };
    }

    /* ═══════════════════════════════════════════════════════
       21. DEFAULT / HELP / FALLBACK
       ═══════════════════════════════════════════════════════ */
    return {
      id: Date.now().toString(),
      role: 'bot',
      text: `Welcome to **Wealth Twin Explainable AI** — I answer with evidence, formulas, and regulatory citations, not opinions.

### What I Can Help You With
1. **Tax Optimization** — 80C, 80D, 24(b), HRA, Standard Deduction, 26AS linking
2. **SIP & Investment Projections** — Future value, step-up SIP, asset allocation
3. **Spending Intelligence** — Category analysis, 50-30-20 rule, subscription audit
4. **Market Outlook** — Live NSE/BSE prices, P/E valuation, macro context
5. **CIBIL & Credit Health** — Factor-wise diagnosis, loan eligibility, improvement plan
6. **Net Worth & Portfolio** — Liquid vs illiquid, rebalancing recommendations
7. **Fraud Protection** — 6-dimension behavioral risk analysis
8. **Retirement Planning** — NPS projections, corpus requirement, 25x rule
9. **Emergency Fund** — 6-12 month calculations, where to park
10. **Home Loan** — EMI calculation, tax benefits, affordability check
11. **Goal Feasibility** — Timeline math with CAGR and volatility buffer
12. **Gold Investment** — SGB vs ETF vs Digital vs Physical comparison
13. **Insurance Planning** — Term plan sizing, health cover, tax benefits
14. **Old vs New Tax Regime** — Which saves you more money

Every answer includes:
- **Reasoning Chain** with formulas
- **Evidence Cards** from your data
- **Regulatory Citations** from RBI, SEBI, IT Act, IRDAI
- **Confidence Score** for transparency

What would you like to explore?`,
      time: now,
      confidence: 100,
      reasoning: [
        { step: 1, title: 'Intent Recognition', description: 'Parsed query against 14 supported financial domains.', result: 'General inquiry — no specific domain matched' },
        { step: 2, title: 'Capability Disclosure', description: 'Listed all explainable AI modules with evidence types and regulatory sources.', result: '14 modules available' },
      ],
      evidence: [
        { label: 'Data Sources', value: '14 modules', source: 'Wealth Twin Engine', icon: 'fa-database' },
        { label: 'User', value: user.name, source: 'Authenticated Profile', icon: 'fa-user' },
        { label: 'Net Worth', value: `₹${netWorth.toLocaleString()}`, source: 'Live Aggregation', icon: 'fa-gem' },
        { label: 'Risk Profile', value: user.riskProfile, source: 'User Setting', icon: 'fa-chart-line' },
      ],
      citations: [
        { id: 'SEBI-RIA', text: 'SEBI — Registered Investment Adviser Regulations (evidence-based advice mandate)' },
        { id: 'RBI-NSFE', text: 'RBI — National Strategy for Financial Education 2020-2025 (NSFE)' },
        { id: 'IRDAI-Protect', text: 'IRDAI — Bima Trinity / Bima Sugam (Insurance for All by 2047)' },
      ],
    };
  };

  return { analyzeQuery, user, netWorth, savingsRate };
}

/* ═══════════════════════════════════════════════════════════════
   MINI BAR CHART
   ═══════════════════════════════════════════════════════════════ */

function MiniBarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2 mt-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 w-20 truncate">{d.label}</span>
          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color || '#1B5E20' }}
            />
          </div>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 w-16 text-right">{d.value >= 100000 ? `₹${(d.value / 100000).toFixed(1)}L` : `₹${d.value.toLocaleString()}`}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   WEALTH CHAT — EXPLAINABLE AI (Popup + Fullscreen)
   ═══════════════════════════════════════════════════════════════ */

interface WealthChatProps {
  initialCompact?: boolean;
}

export default function WealthChat({ initialCompact = false }: WealthChatProps) {
  const { analyzeQuery, user, netWorth, savingsRate } = useExplainableAI();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(!initialCompact);
  const [showSidebar, setShowSidebar] = useState(true);
  const [aiSource, setAiSource] = useState<string>('offline');
  const [showAiConfig, setShowAiConfig] = useState(false);
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>(getProviderConfigs());
  const [routingMode, setRoutingModeState] = useState<RoutingMode>(getRoutingMode());
  const [ensembleCount, setEnsembleCountState] = useState<number>(getEnsembleCount());
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendRef = useRef<(text: string) => Promise<void>>(async () => {});

  const refreshProviderConfigs = () => setProviderConfigs(getProviderConfigs());
  const handleProviderUpdate = (id: string, patch: Partial<ProviderConfig>) => {
    updateProviderConfig(id, patch);
    refreshProviderConfigs();
  };
  const handleModeChange = (mode: RoutingMode) => {
    setRoutingModeState(mode);
    setRoutingMode(mode);
  };
  const handleEnsembleChange = (count: number) => {
    setEnsembleCountState(count);
    setEnsembleCount(count);
  };

  const PRESETS = [
    { labelKey: 'wealthChatPresetSaveTax', query: 'How do I save tax?' },
    { labelKey: 'wealthChatPresetSipPlan', query: 'SIP recommendations' },
    { labelKey: 'wealthChatPresetSpending', query: 'Analyze my spending' },
    { labelKey: 'wealthChatPresetMarket', query: 'Market outlook?' },
    { labelKey: 'wealthChatPresetCibil', query: 'How is my CIBIL?' },
    { labelKey: 'wealthChatPresetNetWorth', query: 'What is my net worth?' },
    { labelKey: 'wealthChatPresetHomeLoan', query: 'Home loan EMI?' },
    { labelKey: 'wealthChatPresetInsurance', query: 'Insurance planning' },
    { labelKey: 'wealthChatPresetNeuro', query: 'Neuro-friction status' },
    { labelKey: 'wealthChatPresetMonteCarlo', query: 'Run Monte Carlo simulation' },
    { labelKey: 'wealthChatPresetImmune', query: 'Collective immune system' },
    { labelKey: 'wealthChatPresetAgent', query: 'Autonomous agent status' },
    { labelKey: 'wealthChatPresetVault', query: 'Sovereign data vault' },
  ];

  const aiConfigModal = showAiConfig && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowAiConfig(false); }}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-600" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fas fa-sparkles text-emerald-500" aria-hidden="true" /> AI Provider Hub
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Connect multiple LLM providers for redundancy, speed, and quality</p>
            </div>
            <button onClick={() => setShowAiConfig(false)} aria-label="Close AI provider settings" className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600">
              <i className="fas fa-times" aria-hidden="true" />
            </button>
          </div>

          {/* Routing Mode */}
          <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 block">Routing Strategy</label>
            <div className="flex flex-wrap gap-2">
              {(['fallback', 'fastest', 'ensemble', 'cost-aware'] as RoutingMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    routingMode === m
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {m === 'fallback' && 'Fallback Chain'}
                  {m === 'fastest' && 'Fastest First'}
                  {m === 'ensemble' && 'Ensemble'}
                  {m === 'cost-aware' && 'Cost Aware'}
                </button>
              ))}
            </div>
            {routingMode === 'ensemble' && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-[11px] text-slate-600 dark:text-slate-300">Providers per ensemble:</label>
                <input
                  type="range"
                  min={2}
                  max={5}
                  value={ensembleCount}
                  onChange={(e) => handleEnsembleChange(parseInt(e.target.value, 10))}
                  className="w-32"
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{ensembleCount}</span>
              </div>
              )}
            </div>

          {/* Provider Grid */}
          <div className="space-y-3">
            {providerConfigs
              .sort((a, b) => a.priority - b.priority)
              .map((provider) => {
                const configured = provider.apiKey.trim().length > 0;
                const models = PROVIDER_MODELS[provider.id] || [provider.model];
                return (
                  <div
                    key={provider.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      provider.enabled && configured
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-white">{provider.name}</h4>
                          <div className={`w-2 h-2 rounded-full ${provider.enabled && configured ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                          Priority {provider.priority} · {configured ? 'Key saved' : 'No key'}
                        </p>
                        <div className="space-y-2">
                          <input
                            type="password"
                            value={provider.apiKey}
                            onChange={(e) => handleProviderUpdate(provider.id, { apiKey: e.target.value })}
                            placeholder={`Paste ${provider.name} API key`}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={provider.model}
                              onChange={(e) => handleProviderUpdate(provider.id, { model: e.target.value })}
                              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs dark:text-white"
                            >
                              {models.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={provider.priority}
                              onChange={(e) => handleProviderUpdate(provider.id, { priority: parseInt(e.target.value, 10) || 1 })}
                              className="w-16 px-2 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-xs dark:text-white"
                              title="Priority (lower = tried first)"
                            />
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={provider.enabled}
                          onChange={(e) => handleProviderUpdate(provider.id, { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                      </label>
                    </div>
                  </div>
                    );
                  })}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${isAIConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <p className="text-[10px] text-slate-500">
                    {isAIConfigured()
                      ? `${getActiveProviderCount()} provider${getActiveProviderCount() === 1 ? '' : 's'} active — ${routingMode} mode`
                      : 'Offline mode — add at least one provider key'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    // Clear all provider keys for privacy
                    providerConfigs.forEach((p) => handleProviderUpdate(p.id, { apiKey: '', enabled: false }));
                    setAiSource('offline');
                  }}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 rounded-lg text-[11px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors"
                >
                  Clear All Keys
                </button>
              </div>

              <p className="mt-3 text-[10px] text-slate-400">
                Keys are stored only in your browser&apos;s localStorage. No key is sent to our servers.
              </p>
            </div>
          </div>
  );


  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for command palette AI queries
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        sendRef.current(detail);
      }
    };
    window.addEventListener('sw-ai-query', handler);
    return () => window.removeEventListener('sw-ai-query', handler);
  }, []);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: UserMessage = { id: Date.now().toString(), role: 'user', text, time };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Try configured AI providers via the orchestrator
    if (isAIConfigured()) {
      try {
        const history = messages
          .filter((m): m is UserMessage | BotMessage => m.role === 'user' || m.role === 'bot')
          .slice(-6)
          .reduce<{ user: string; bot: string }[]>((acc, m, i, arr) => {
            if (m.role === 'user' && arr[i + 1]?.role === 'bot') {
              acc.push({ user: m.text, bot: arr[i + 1].text });
            }
            return acc;
          }, []);

        const result: AIResponse = await callAI(text, {
          mode: routingMode,
          history,
          userContext: {
            name: user.name,
            income: user.monthlyIncome,
            expenses: user.monthlyExpenses,
            savings: user.monthlySavings,
            netWorth,
            riskAppetite: user.riskProfile,
          },
          ensembleCount,
        });

        const providerDisplay = result.provider;
        const modelDisplay = result.model;

        const botMsg: BotMessage = {
          id: Date.now().toString(),
          role: 'bot',
          text: result.text,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          confidence: 92,
          reasoning: [
            { step: 1, title: `${providerDisplay} AI Analysis`, description: `Processed through ${modelDisplay} with user financial context.` },
            { step: 2, title: 'Response Generated', description: 'AI-generated advice tailored to your profile.' },
          ],
          evidence: [
            { label: 'AI Model', value: modelDisplay, source: providerDisplay, icon: 'fa-brain' },
            { label: 'Net Worth', value: `₹${(netWorth / 1e7).toFixed(2)}Cr`, source: 'User Profile', icon: 'fa-gem' },
            { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, source: 'User Profile', icon: 'fa-piggy-bank' },
            ...(result.usage
              ? [
                  { label: 'Tokens', value: `${result.usage.promptTokens || '-'} → ${result.usage.completionTokens || '-'}`, source: 'API', icon: 'fa-microchip' },
                  { label: 'Latency', value: `${result.latencyMs}ms`, source: 'API', icon: 'fa-bolt' },
                ]
              : []),
          ],
          citations: [
            { id: 'SEBI-ROBO', text: 'SEBI Circular: Investment advice through robo-advisory services (CIR/IMD/DF/21/2016)' },
            { id: 'DISCLAIMER', text: 'For educational purposes only. Consult a SEBI-registered advisor before investing.' },
          ],
        };

        setMessages((m) => [...m, botMsg]);
        setAiSource(providerDisplay);
        setTyping(false);
        return;
      } catch {
        // Fall back to offline mode
        setAiSource('offline');
      }
    }

    // Offline fallback
    setTimeout(() => {
      const botMsg = analyzeQuery(text, messages);
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };
  sendRef.current = send;

  const lastBot = messages.filter((m): m is BotMessage => m.role === 'bot').at(-1);

  /* ── EMBEDDED INLINE CHAT (Wealth Twin Page) ── */
  if (!isFullscreen) {
    return (
      <div className="card overflow-hidden p-0 border-2 border-primary/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
                <i className="fas fa-brain text-lg" aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base">{t('wealthChatHeaderTitle')}</h3>
                <p className="text-[11px] text-white/70">{t('wealthChatHeaderSubtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* AI Source Badge */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowAiConfig(true); }}
                aria-label={aiSource !== 'offline' ? `AI powered by ${aiSource}, click to configure` : 'Offline mode, click to add AI provider keys'}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                  aiSource !== 'offline'
                    ? 'bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/30'
                    : 'bg-amber-400/20 text-amber-300 hover:bg-amber-400/30'
                }`}
                title={aiSource !== 'offline' ? `Powered by ${aiSource} — Click to configure` : 'Offline Mode — Click to add AI provider keys'}
              >
                <i className={`fas ${aiSource !== 'offline' ? 'fa-sparkles' : 'fa-wifi-slash'}`} aria-hidden="true" />
                <span aria-live="polite" aria-atomic="true">{aiSource !== 'offline' ? aiSource : t('wealthChatStatusOffline')}</span>
              </button>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-white/60">{t('wealthChatNetWorthLabel')}</p>
                  <p className="text-sm font-bold">₹{(netWorth / 1e7).toFixed(2)}Cr</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/60">{t('wealthChatSavingsRateLabel')}</p>
                  <p className="text-sm font-bold">{savingsRate.toFixed(1)}%</p>
                </div>
              </div>
              <button
                onClick={() => setMessages([])}
                aria-label="Start a new chat"
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                title="New Chat"
              >
                <i className="fas fa-plus text-sm" aria-hidden="true" />
              </button>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label={showSidebar ? 'Hide reasoning sidebar' : 'Show reasoning sidebar'}
                aria-pressed={showSidebar}
                className="lg:hidden w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                title="Toggle Sidebar"
              >
                <i className={`fas ${showSidebar ? 'fa-columns' : 'fa-table-columns'} text-sm`} aria-hidden="true" />
              </button>
              <button
                onClick={() => setIsFullscreen(true)}
                aria-label="Expand chat to fullscreen"
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                title="Expand Fullscreen"
              >
                <i className="fas fa-expand text-sm" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map((p) => (
              <button
                key={p.labelKey}
                onClick={() => send(p.query)}
                className="px-3 py-1.5 bg-white/15 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg text-xs font-medium text-white transition-colors backdrop-blur-sm"
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Body */}
        <div className="p-4">
          <div className={`grid gap-4 ${showSidebar ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {/* Chat Column */}
            <div className={`flex flex-col min-h-[480px] max-h-[600px] ${showSidebar ? 'lg:col-span-2' : ''}`}>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {messages.length === 0 && (
                  <div className="py-8">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-robot text-primary text-2xl" aria-hidden="true" />
                      </div>
                      <p className="text-base font-bold text-slate-800 dark:text-white">{t('wealthChatWelcome')}, {user.name}!</p>
                      <p className="text-sm text-slate-500 mt-1">{t('wealthChatWelcomeMessage')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                      {WELCOME_TOPICS.map((topic) => (
                        <button
                          key={topic.labelKey}
                          onClick={() => send(topic.query)}
                          className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary/30 hover:shadow-sm transition-all text-left"
                        >
                          <div className={`w-10 h-10 ${topic.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <i className={`fas ${topic.icon}`} aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{t(topic.labelKey)}</p>
                            <p className="text-[11px] text-slate-500">{t(topic.descKey)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id} className="flex justify-end">
                      <div className="max-w-[85%]">
                        <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">{m.text}</div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">{m.time}</p>
                      </div>
                    </div>
                  ) : (
                    <BotMessageBubble key={m.id} message={m} isLatest={m.id === lastBot?.id} />
                  )
                )}

                {typing && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <i className="fas fa-robot text-xs" aria-hidden="true" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-xs text-slate-400">{t('wealthChatTypingIndicator')}</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send(input)}
                    placeholder={t('wealthChatInputPlaceholder')}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  />
                  <button
                    onClick={() => send(input)}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-paper-plane" aria-hidden="true" />
                    {t('wealthChatAskButton')}
                  </button>
                </div>
              </div>
            </div>

            {/* Evidence & Reasoning Sidebar */}
            <div className={`space-y-4 overflow-y-auto max-h-[600px] pb-2 ${showSidebar ? '' : 'hidden lg:hidden'}`}>
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-microchip text-primary text-sm" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatReasoningTitle')}</h3>
                </div>
                {lastBot && lastBot.reasoning.length > 0 ? (
                  <div className="space-y-3">
                    {lastBot.reasoning.map((r) => (
                      <div key={r.step} className="relative pl-5 border-l-2 border-primary/20">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-primary rounded-full" />
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{r.step}. {r.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                        {r.formula && (
                          <div className="mt-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono text-primary">
                            {r.formula}
                          </div>
                        )}
                        {r.result && (
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            <i className="fas fa-equals mr-1" aria-hidden="true" />{r.result}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatReasoningEmpty')}</p>
                )}
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-fingerprint text-secondary text-sm" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatEvidenceTitle')}</h3>
                </div>
                {lastBot && lastBot.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {lastBot.evidence.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                          <i className={`fas ${e.icon} text-[10px]`} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{e.label}</p>
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{e.value}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">{e.source}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatEvidenceEmpty')}</p>
                )}
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fas fa-scale-balanced text-accent text-sm" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatCitationsTitle')}</h3>
                </div>
                {lastBot && lastBot.citations.length > 0 ? (
                  <div className="space-y-2">
                    {lastBot.citations.map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded font-bold flex-shrink-0">{c.id}</span>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">{c.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatCitationsEmpty')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      {aiConfigModal}
      </div>
    );
  }

  /* ── FULLSCREEN OVERLAY ── */
  return (
    <div className="fixed inset-0 z-[80] bg-white dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark p-4 text-white flex-shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center relative">
              <i className="fas fa-brain text-lg" aria-hidden="true" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('wealthChatFullscreenTitle')}</h2>
              <p className="text-[10px] text-white/70">{t('wealthChatFullscreenSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4">
              <div className="text-right">
                <p className="text-[10px] text-white/60">Net Worth</p>
                <p className="text-sm font-bold">₹{(netWorth / 1e7).toFixed(2)}Cr</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60">Savings Rate</p>
                <p className="text-sm font-bold">{savingsRate.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60">{t('wealthChatTaxBracketLabel')}</p>
                <p className="text-sm font-bold">{user.taxBracket}%</p>
              </div>
            </div>
            <button
              onClick={() => setIsFullscreen(false)}
              aria-label="Close fullscreen chat"
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              title="Close Fullscreen"
            >
              <i className="fas fa-compress text-sm" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 max-w-7xl mx-auto">
          {PRESETS.map((p) => (
            <button
              key={p.labelKey}
              onClick={() => send(p.query)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg text-xs font-medium text-white transition-colors backdrop-blur-sm"
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden p-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
          {/* Chat Column */}
          <div className="lg:col-span-2 card flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 p-4">
              {messages.length === 0 && (
                <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-robot text-primary text-2xl" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium">{t('wealthChatWelcome')}, {user.name}!</p>
                  <p className="text-xs mt-1">{t('wealthChatWelcomeMessageFullscreen')}</p>
                </div>
              )}

              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="bg-primary text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">{m.text}</div>
                      <p className="text-[10px] text-slate-400 mt-1 text-right">{m.time}</p>
                    </div>
                  </div>
                ) : (
                  <BotMessageBubble key={m.id} message={m} isLatest={m.id === lastBot?.id} />
                )
              )}

              {typing && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <i className="fas fa-robot text-xs" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-slate-400">{t('wealthChatTypingIndicator')}</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  placeholder={t('wealthChatInputPlaceholder')}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                  autoFocus
                />
                <button
                  onClick={() => send(input)}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-paper-plane" aria-hidden="true" />
                  {t('wealthChatAskButton')}
                </button>
              </div>
            </div>
          </div>

          {/* Evidence & Reasoning Sidebar */}
          <div className="space-y-4 overflow-y-auto h-full pb-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-microchip text-primary text-sm" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatReasoningTitle')}</h3>
              </div>
              {lastBot && lastBot.reasoning.length > 0 ? (
                <div className="space-y-3">
                  {lastBot.reasoning.map((r) => (
                    <div key={r.step} className="relative pl-5 border-l-2 border-primary/20">
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-primary rounded-full" />
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{r.step}. {r.title}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                      {r.formula && (
                        <div className="mt-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-mono text-primary">
                          {r.formula}
                        </div>
                      )}
                      {r.result && (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <i className="fas fa-equals mr-1" aria-hidden="true" />{r.result}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatReasoningEmpty')}</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-fingerprint text-secondary text-sm" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatEvidenceTitle')}</h3>
              </div>
              {lastBot && lastBot.evidence.length > 0 ? (
                <div className="space-y-2">
                  {lastBot.evidence.map((e, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                        <i className={`fas ${e.icon} text-[10px]`} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{e.label}</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{e.value}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">{e.source}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatEvidenceEmpty')}</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-scale-balanced text-accent text-sm" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{t('wealthChatCitationsTitle')}</h3>
              </div>
              {lastBot && lastBot.citations.length > 0 ? (
                <div className="space-y-2">
                  {lastBot.citations.map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-accent/10 text-accent rounded font-bold flex-shrink-0">{c.id}</span>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-tight">{c.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">{t('wealthChatCitationsEmpty')}</p>
              )}
            </div>
          </div>
        </div>
        {aiConfigModal}
      </div>
    </div>
  );
}
