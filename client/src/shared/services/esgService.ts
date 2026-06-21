export interface ESGHolding {
  id: string;
  name: string;
  type: string;
  value: number;
  esgScore: number; // 0-100
  esgGrade: string;
  conflicts: string[];
  alternatives: string[];
}

export interface UserValues {
  lowCarbon: boolean;
  animalWelfare: boolean;
  tobaccoFree: boolean;
  fairLabor: boolean;
  genderEquality: boolean;
}

export const DEFAULT_VALUES: UserValues = {
  lowCarbon: true,
  animalWelfare: true,
  tobaccoFree: true,
  fairLabor: false,
  genderEquality: false,
};

const VALUES_KEY = 'sw_user_values';

export function getUserValues(): UserValues {
  try {
    return { ...DEFAULT_VALUES, ...JSON.parse(localStorage.getItem(VALUES_KEY) || '{}') };
  } catch {
    return DEFAULT_VALUES;
  }
}

export function setUserValues(values: UserValues) {
  localStorage.setItem(VALUES_KEY, JSON.stringify(values));
}

export const MOCK_HOLDINGS: ESGHolding[] = [
  {
    id: 'h1',
    name: 'Axis Bluechip Fund',
    type: 'mutualFund',
    value: 280000,
    esgScore: 72,
    esgGrade: 'B+',
    conflicts: ['animalWelfare'],
    alternatives: ['Axis ESG Equity Fund'],
  },
  {
    id: 'h2',
    name: 'Nifty 50 ETF',
    type: 'stock',
    value: 150000,
    esgScore: 65,
    esgGrade: 'B',
    conflicts: ['lowCarbon'],
    alternatives: ['Nifty 100 ESG Index Fund'],
  },
  {
    id: 'h3',
    name: 'SBI Magnum Equity',
    type: 'mutualFund',
    value: 0,
    esgScore: 78,
    esgGrade: 'B+',
    conflicts: [],
    alternatives: [],
  },
  {
    id: 'h4',
    name: 'ICICI Pru Technology',
    type: 'mutualFund',
    value: 0,
    esgScore: 58,
    esgGrade: 'C+',
    conflicts: ['fairLabor', 'genderEquality'],
    alternatives: ['Tata Digital India Fund'],
  },
  {
    id: 'h5',
    name: 'HDFC Index Fund',
    type: 'mutualFund',
    value: 0,
    esgScore: 82,
    esgGrade: 'A-',
    conflicts: [],
    alternatives: [],
  },
];

export function analyzePortfolioConflicts(
  portfolioValue: number,
  values: UserValues
): { conflictHoldings: ESGHolding[]; suggestion: string; conflictPercent: number } {
  const activeValues = Object.entries(values)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const conflictHoldings = MOCK_HOLDINGS.filter(
    (h) => h.value > 0 && h.conflicts.some((c) => activeValues.includes(c))
  );

  const conflictValue = conflictHoldings.reduce((s, h) => s + h.value, 0);
  const conflictPercent = portfolioValue > 0 ? Math.round((conflictValue / portfolioValue) * 100) : 0;

  const topConflict = conflictHoldings[0];
  let suggestion = '';
  if (topConflict) {
    const valueName = activeValues.includes('animalWelfare')
      ? 'Animal Welfare'
      : activeValues.includes('lowCarbon')
      ? 'Low Carbon'
      : activeValues.includes('tobaccoFree')
      ? 'Tobacco-Free'
      : activeValues.includes('fairLabor')
      ? 'Fair Labor'
      : 'Gender Equality';

    suggestion = `Your portfolio has ${conflictPercent}% in funds with low ESG ratings on '${valueName}'. Consider reallocating to ${topConflict.alternatives[0] || 'a greener alternative'}.`;
  } else {
    suggestion = 'Great job! Your current portfolio aligns well with your chosen values.';
  }

  return { conflictHoldings, suggestion, conflictPercent };
}
