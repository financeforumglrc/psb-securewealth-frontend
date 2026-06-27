import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CosmosCard from '@/shared/components/ui/CosmosCard';
import { formatCurrency } from '@/shared/utils/demoMode';

export default function LoanImpactSimulator() {
  const [msmes, setMsmes] = useState(1000);
  const [avgTicket, setAvgTicket] = useState(875000);
  const [womenPct, setWomenPct] = useState(38);
  const [ruralPct, setRuralPct] = useState(44);
  const [jobsPerMsme, setJobsPerMsme] = useState(5);
  const [gdpMultiplier, setGdpMultiplier] = useState(2.5);

  const totalCredit = useMemo(() => msmes * avgTicket, [msmes, avgTicket]);
  const womenLed = useMemo(() => Math.round(msmes * (womenPct / 100)), [msmes, womenPct]);
  const rural = useMemo(() => Math.round(msmes * (ruralPct / 100)), [msmes, ruralPct]);
  const jobsSupported = useMemo(() => msmes * jobsPerMsme, [msmes, jobsPerMsme]);
  const gdpImpact = useMemo(() => totalCredit * gdpMultiplier, [totalCredit, gdpMultiplier]);
  const cgtmseCover = useMemo(() => totalCredit * 0.85, [totalCredit]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-psb-bg min-h-screen dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-700 to-primary text-white p-6 md:p-8"
      >
        <h1 className="text-2xl md:text-4xl font-extrabold mb-2">MSME Credit Impact Simulator</h1>
        <p className="max-w-3xl text-white/90 text-sm md:text-base">
          Estimate the real-economy impact of disbursing collateral-free MSME credit at scale —
          jobs supported, GDP multiplier, gender/rural inclusion and CGTMSE guarantee cover.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <CosmosCard variant="elevated" className="lg:col-span-1" header={{ title: 'Assumptions', icon: 'fa-sliders' }}>
          <div className="space-y-5">
            <Slider label="MSMEs financed" value={msmes} min={100} max={100000} step={100} unit="" onChange={setMsmes} />
            <Slider label="Average ticket size" value={avgTicket} min={50000} max={5000000} step={50000} unit="₹" onChange={setAvgTicket} />
            <Slider label="Women-led MSMEs" value={womenPct} min={0} max={100} step={1} unit="%" onChange={setWomenPct} />
            <Slider label="Rural MSMEs" value={ruralPct} min={0} max={100} step={1} unit="%" onChange={setRuralPct} />
            <Slider label="Jobs per MSME" value={jobsPerMsme} min={1} max={20} step={1} unit="" onChange={setJobsPerMsme} />
            <Slider label="GDP multiplier" value={gdpMultiplier} min={1} max={5} step={0.1} unit="x" onChange={setGdpMultiplier} />
          </div>
        </CosmosCard>

        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ImpactTile label="Total Credit Disbursed" value={formatCurrency(totalCredit)} icon="fa-sack-dollar" />
            <ImpactTile label="CGTMSE Cover (85%)" value={formatCurrency(cgtmseCover)} icon="fa-shield-heart" />
            <ImpactTile label="Jobs Supported" value={jobsSupported.toLocaleString('en-IN')} icon="fa-briefcase" />
            <ImpactTile label="GDP Impact" value={formatCurrency(gdpImpact)} icon="fa-chart-line" />
            <ImpactTile label="Women-led MSMEs" value={womenLed.toLocaleString('en-IN')} icon="fa-venus" />
            <ImpactTile label="Rural MSMEs" value={rural.toLocaleString('en-IN')} icon="fa-map-location-dot" />
          </div>

          <CosmosCard variant="default" header={{ title: 'What the numbers mean', icon: 'fa-circle-info' }}>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <li><strong>Total Credit Disbursed:</strong> Gross loan principal flowing to MSMEs through CreditBridge AI.</li>
              <li><strong>CGTMSE Cover:</strong> Collateral-free guarantee coverage under the Credit Guarantee Fund Trust for Micro & Small Enterprises.</li>
              <li><strong>Jobs Supported:</strong> Estimated direct employment sustained/created at the assumed jobs-per-MSME rate.</li>
              <li><strong>GDP Impact:</strong> Estimated downstream economic activity using an MSME credit multiplier.</li>
              <li><strong>Women-led / Rural:</strong> Count of traditionally underserved borrowers reached.</li>
            </ul>
          </CosmosCard>

          <CosmosCard variant="glass" header={{ title: 'Macro Context', icon: 'fa-globe' }}>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              McKinsey estimates roughly <strong>$300 billion</strong> of unmet credit demand among women, rural workers and informal earners in India.
              Closing even a fraction of this gap through explainable, accountable MSME lending can add millions of jobs,
              deepen financial inclusion and accelerate GDP growth — while keeping banks and NBFCs protected via CGTMSE.
            </p>
          </CosmosCard>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  const display = unit === '₹' ? formatCurrency(value) : `${value.toLocaleString('en-IN')}${unit}`;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  );
}

function ImpactTile({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <CosmosCard variant="stat" className="text-center">
      <i className={`fas ${icon} text-2xl text-primary mb-2`} />
      <p className="text-lg font-black text-slate-800 dark:text-slate-100">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
    </CosmosCard>
  );
}
