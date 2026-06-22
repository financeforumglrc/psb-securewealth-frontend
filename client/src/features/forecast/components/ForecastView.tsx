import ScenarioSimulator from '@/features/forecast/components/ScenarioSimulator';
import WhatIfSimulator from '@/features/forecast/components/WhatIfSimulator';
import DashboardWidget from '@/features/dashboard/components/DashboardWidget';

export default function ForecastView() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-wand-magic-sparkles text-primary" />
              Forecast & Scenarios
            </h1>
            <span className="text-[10px] px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-extrabold border border-violet-200">
              AI-POWERED
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Stress-test your wealth against market cycles and life decisions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ScenarioSimulator />
        </div>
        <div className="lg:col-span-1">
          <DashboardWidget title="Quick What-If" icon="fa-calculator" subtitle="Instant projection">
            <WhatIfSimulator />
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
}
