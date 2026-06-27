import DashboardWidget from '@/features/dashboard/components/DashboardWidget';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { TwinTab } from './useWealthTwinData';

interface ExplainablePanelProps {
  activeTab: TwinTab;
}

const REASONING: Record<TwinTab, { titleKey: string; pointKeys: string[]; modelKey: string }> = {
  overview: {
    titleKey: 'explainableOverviewTitle',
    pointKeys: [
      'explainableOverviewPoint1',
      'explainableOverviewPoint2',
      'explainableOverviewPoint3',
      'explainableOverviewPoint4',
    ],
    modelKey: 'explainableOverviewModel',
  },
  goals: {
    titleKey: 'explainableGoalsTitle',
    pointKeys: [
      'explainableGoalsPoint1',
      'explainableGoalsPoint2',
      'explainableGoalsPoint3',
      'explainableGoalsPoint4',
    ],
    modelKey: 'explainableGoalsModel',
  },
  tax: {
    titleKey: 'explainableTaxTitle',
    pointKeys: [
      'explainableTaxPoint1',
      'explainableTaxPoint2',
      'explainableTaxPoint3',
      'explainableTaxPoint4',
    ],
    modelKey: 'explainableTaxModel',
  },
  rebalance: {
    titleKey: 'explainableRebalanceTitle',
    pointKeys: [
      'explainableRebalancePoint1',
      'explainableRebalancePoint2',
      'explainableRebalancePoint3',
      'explainableRebalancePoint4',
    ],
    modelKey: 'explainableRebalanceModel',
  },
  whatif: {
    titleKey: 'explainableWhatIfTitle',
    pointKeys: [
      'explainableWhatIfPoint1',
      'explainableWhatIfPoint2',
      'explainableWhatIfPoint3',
      'explainableWhatIfPoint4',
    ],
    modelKey: 'explainableWhatIfModel',
  },
  retirement: {
    titleKey: 'explainableRetirementTitle',
    pointKeys: [
      'explainableRetirementPoint1',
      'explainableRetirementPoint2',
      'explainableRetirementPoint3',
      'explainableRetirementPoint4',
    ],
    modelKey: 'explainableRetirementModel',
  },
  macroshock: {
    titleKey: 'explainableMacroShockTitle',
    pointKeys: [
      'explainableMacroShockPoint1',
      'explainableMacroShockPoint2',
      'explainableMacroShockPoint3',
      'explainableMacroShockPoint4',
    ],
    modelKey: 'explainableMacroShockModel',
  },
  macrosignal: {
    titleKey: 'explainableMacroSignalTitle',
    pointKeys: [
      'explainableMacroSignalPoint1',
      'explainableMacroSignalPoint2',
      'explainableMacroSignalPoint3',
      'explainableMacroSignalPoint4',
    ],
    modelKey: 'explainableMacroSignalModel',
  },
};

export default function ExplainablePanel({ activeTab }: ExplainablePanelProps) {
  const { t } = useTranslation();
  const { titleKey, pointKeys, modelKey } = REASONING[activeTab];
  return (
    <DashboardWidget title={t('explainableTitle')} icon="fa-microchip" className="h-full">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">{t(titleKey)}</p>
          <ul className="space-y-2">
            {pointKeys.map((key, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <i className="fas fa-check text-primary mt-0.5 text-[10px]" aria-hidden="true" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-800/20">
          <p className="text-[10px] font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wide mb-1">{t('explainableModelUsedLabel')}</p>
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{t(modelKey)}</p>
        </div>
        <p className="text-[10px] text-slate-400">
          <i className="fas fa-lock mr-1" aria-hidden="true" />
          {t('explainablePrivacyNote')}
        </p>
      </div>
    </DashboardWidget>
  );
}
