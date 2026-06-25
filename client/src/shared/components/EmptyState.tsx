import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
}

export default function EmptyState({ icon: Icon, title, subtitle, action, compact }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900/60 border border-dashed border-psb-border dark:border-slate-700 rounded-2xl ${compact ? 'py-8 px-4' : 'py-12 px-6'}`}
    >
      <div className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center`}>
        <Icon className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-slate-400`} />
      </div>
      <h3 className={`font-bold text-slate-700 dark:text-slate-200 ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
      {subtitle && <p className={`text-slate-500 dark:text-slate-400 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
