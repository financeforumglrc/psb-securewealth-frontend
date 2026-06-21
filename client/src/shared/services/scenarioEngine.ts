export interface ScenarioOption {
  id: string;
  label: string;
  impactMonthly: number;
  impactOneTime: number;
  impactIncome: number;
  durationMonths: number;
  narrativeTemplate: string;
}

export interface ScenarioResult {
  option: ScenarioOption;
  baseProjection: number;
  newProjection: number;
  delta: number;
  goalImpact: string;
  narrative: string;
  yearsToGoalChange: number;
}

export const SCENARIO_OPTIONS: ScenarioOption[] = [
  {
    id: 'sip-10k',
    label: 'Start a ₹10,000/month SIP',
    impactMonthly: -10000,
    impactOneTime: 0,
    impactIncome: 0,
    durationMonths: 120,
    narrativeTemplate:
      'Adding ₹10,000 monthly to your investments could grow to approximately ₹{futureValue} in 10 years at 12% returns. Your retirement timeline improves by {years} years, but your monthly discretionary budget tightens.',
  },
  {
    id: 'car-5l',
    label: 'Buy a ₹5,00,000 car (EMI)',
    impactMonthly: -12000,
    impactOneTime: -500000,
    impactIncome: 0,
    durationMonths: 60,
    narrativeTemplate:
      'A ₹5L car with EMI shifts ₹12,000/month from wealth-building to depreciation. Over 5 years, this delays your home goal by approximately {years} years. Consider a used car to reduce the wealth drag.',
  },
  {
    id: 'unpaid-leave',
    label: 'Take 3-month unpaid leave',
    impactMonthly: 0,
    impactOneTime: 0,
    impactIncome: -125000,
    durationMonths: 3,
    narrativeTemplate:
      'Three months without income drains ₹3,75,000 from your liquid reserves. If your emergency fund covers this, the long-term goal impact is minimal (~{years} year delay). If not, it is risky.',
  },
  {
    id: 'freelance-50k',
    label: 'Start freelancing (+₹50k/month)',
    impactMonthly: -50000,
    impactOneTime: 0,
    impactIncome: 50000,
    durationMonths: 60,
    narrativeTemplate:
      'Extra ₹50,000/month income, if invested fully, could accelerate your retirement goal by {years} years. This is your "parallel future" where compound interest works harder for you.',
  },
];

export async function runScenario(option: ScenarioOption, currentSavings: number, currentIncome: number): Promise<ScenarioResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rate = 0.12;
      const years = option.durationMonths / 12;

      const baseProjection = projectedFutureValue(currentSavings, currentIncome * 0.22, years, rate);
      const newMonthly = currentSavings + option.impactMonthly + (option.impactIncome * 0.22);
      const newProjection = projectedFutureValue(
        Math.max(0, currentSavings + option.impactOneTime),
        Math.max(0, newMonthly),
        years,
        rate
      );

      const delta = newProjection - baseProjection;
      const yearsToGoalChange = Math.abs(delta / (currentIncome * 12 * 0.05));

      const futureValue = formatCr(newProjection);
      const narrative = option.narrativeTemplate
        .replace('{futureValue}', futureValue)
        .replace('{years}', yearsToGoalChange.toFixed(1));

      resolve({
        option,
        baseProjection,
        newProjection,
        delta,
        goalImpact: delta >= 0 ? 'Positive' : 'Negative',
        narrative,
        yearsToGoalChange,
      });
    }, 800);
  });
}

function projectedFutureValue(principal: number, monthly: number, years: number, rate: number): number {
  const n = years * 12;
  const r = rate / 12;
  const fvPrincipal = principal * Math.pow(1 + r, n);
  const fvMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
  return fvPrincipal + fvMonthly;
}

function formatCr(val: number): string {
  if (val >= 1e7) return `₹${(val / 1e7).toFixed(2)}Cr`;
  if (val >= 1e5) return `₹${(val / 1e5).toFixed(2)}L`;
  return `₹${Math.round(val).toLocaleString()}`;
}
