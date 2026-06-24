import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useTwinContext } from './WealthTwinContext';

export default function WhatIfTab() {
  const {
    user,
    whatIfSavings,
    setWhatIfSavings,
    whatIfReturns,
    setWhatIfReturns,
    whatIfYears,
    setWhatIfYears,
    whatIfExpense,
    setWhatIfExpense,
    whatIfData,
    formatCr,
  } = useTwinContext();
  const { t } = useTranslation();

  const projectedYear = new Date().getFullYear() + whatIfYears;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
              <i className="fas fa-sliders text-primary mr-2" aria-hidden="true" />
              {t('twinWhatIfAdjustParameters')}
            </h3>
            <div className="space-y-4">
              <RangeInput
                label={t('twinWhatIfLabelMonthlySavings')}
                value={whatIfSavings}
                min={0}
                max={user.monthlyIncome}
                step={1000}
                prefix="₹"
                onChange={setWhatIfSavings}
              />
              <RangeInput
                label={t('twinWhatIfLabelExpectedReturns')}
                value={whatIfReturns}
                min={5}
                max={20}
                step={0.5}
                suffix="%"
                onChange={setWhatIfReturns}
              />
              <RangeInput
                label={t('twinWhatIfLabelProjectionYears')}
                value={whatIfYears}
                min={5}
                max={30}
                step={1}
                suffix={` ${t('twinWhatIfYearsSuffix')}`}
                onChange={setWhatIfYears}
              />
              <RangeInput
                label={t('twinWhatIfLabelOneTimeExpense')}
                value={whatIfExpense}
                min={0}
                max={5000000}
                step={100000}
                prefix="₹"
                onChange={setWhatIfExpense}
              />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-emerald-50 to-primary/5 dark:from-emerald-900/10 dark:to-primary/10 border border-emerald-100 dark:border-emerald-800/20">
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t('twinWhatIfProjectedWealth')}</h4>
            <p className="text-2xl font-black text-emerald-600">
              {formatCr(whatIfData[whatIfData.length - 1].netWorth)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{t('twinWhatIfAfterYears').replace('{years}', String(whatIfYears))}</p>
            {whatIfData[whatIfData.length - 1].netWorth >= 1e7 && (
              <p className="text-xs font-bold text-primary mt-2">
                <i className="fas fa-trophy mr-1" aria-hidden="true" />{' '}
                {t('twinWhatIfCrorepatiBy').replace('{year}', String(projectedYear))}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">{t('twinWhatIfInteractiveTitle')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={whatIfData}>
                <defs>
                  <linearGradient id="whatIfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={(v) => `₹${(Number(v) / 1e7).toFixed(1)}Cr`} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  name={t('twinWhatIfProjectedNetWorth')}
                  stroke="#0f766e"
                  strokeWidth={2}
                  fill="url(#whatIfGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function RangeInput({
  label,
  value,
  min,
  max,
  step,
  prefix,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-bold text-primary">
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}
