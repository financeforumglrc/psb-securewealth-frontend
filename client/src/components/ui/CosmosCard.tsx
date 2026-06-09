import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════════
   COSMOS CARD — Unified Design System Component
   Supports: default | glass | elevated | gradient | stat | ghost
   Auto dark-mode via Tailwind dark: prefix
   ═══════════════════════════════════════════════════════════════ */

export type CosmosCardVariant =
  | 'default'
  | 'glass'
  | 'elevated'
  | 'gradient'
  | 'stat'
  | 'ghost';

export interface CosmosCardProps {
  children: ReactNode;
  variant?: CosmosCardVariant;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  header?: {
    icon?: string;
    iconColor?: string;
    title: string;
    subtitle?: string;
    action?: ReactNode;
  };
  footer?: ReactNode;
  onClick?: () => void;
  animate?: boolean;
  delay?: number;
}

const variantStyles: Record<CosmosCardVariant, string> = {
  default:
    'bg-white dark:bg-slate-800/80 ' +
    'border border-slate-200/60 dark:border-slate-700/60 ' +
    'shadow-sm dark:shadow-none',

  glass:
    'bg-white/70 dark:bg-slate-800/60 ' +
    'backdrop-blur-xl ' +
    'border border-white/30 dark:border-white/10 ' +
    'shadow-lg shadow-slate-900/5 dark:shadow-black/20',

  elevated:
    'bg-white dark:bg-slate-800 ' +
    'border border-slate-100 dark:border-slate-700 ' +
    'shadow-md shadow-slate-900/5 dark:shadow-black/30',

  gradient:
    'bg-white dark:bg-slate-800 ' +
    'relative overflow-hidden ' +
    'border border-slate-200 dark:border-slate-700',

  stat:
    'bg-white dark:bg-slate-800/50 ' +
    'border border-slate-100 dark:border-slate-700/50 ' +
    'shadow-sm',

  ghost:
    'bg-transparent ' +
    'border border-transparent dark:border-slate-700/30',
};

const hoverStyles: Record<CosmosCardVariant, string> = {
  default:
    'hover:shadow-lg hover:shadow-slate-900/6 dark:hover:shadow-black/20 ' +
    'hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600',

  glass:
    'hover:shadow-xl hover:shadow-slate-900/10 dark:hover:shadow-black/30 ' +
    'hover:-translate-y-0.5 hover:bg-white/80 dark:hover:bg-slate-800/70',

  elevated:
    'hover:shadow-xl hover:shadow-slate-900/8 dark:hover:shadow-black/30 ' +
    'hover:-translate-y-1',

  gradient:
    'hover:-translate-y-0.5',

  stat:
    'hover:shadow-md hover:-translate-y-0.5 ' +
    'hover:border-slate-200 dark:hover:border-slate-600',

  ghost:
    'hover:bg-slate-50 dark:hover:bg-slate-800/40 ' +
    'hover:border-slate-200 dark:hover:border-slate-700/50',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const radiusStyles = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  xl: 'rounded-3xl',
};

export default function CosmosCard({
  children,
  variant = 'default',
  className = '',
  hover = true,
  glow = false,
  glowColor,
  padding = 'md',
  radius = 'lg',
  header,
  footer,
  onClick,
  animate = true,
  delay = 0,
}: CosmosCardProps) {
  const baseClasses = [
    'relative overflow-hidden transition-all duration-300',
    radiusStyles[radius],
    paddingStyles[padding],
    variantStyles[variant],
    hover && !onClick ? hoverStyles[variant] : '',
    onClick ? 'cursor-pointer active:scale-[0.98]' : '',
    className,
  ].join(' ');

  const glowStyle = glow
    ? {
        boxShadow: glowColor
          ? `0 0 30px ${glowColor}25, 0 0 60px ${glowColor}10`
          : '0 0 30px rgba(255,215,0,0.1), 0 0 60px rgba(255,215,0,0.05)',
      }
    : undefined;

  const content = (
    <>
      {/* Gradient variant overlay */}
      {variant === 'gradient' && (
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(27,94,32,0.08) 0%, rgba(255,215,0,0.06) 50%, rgba(21,101,192,0.08) 100%)',
          }}
        />
      )}

      {/* Stat variant top accent */}
      {variant === 'stat' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/40 via-accent/40 to-primary/40 opacity-60" />
      )}

      {/* Header */}
      {header && (
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            {header.icon && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: header.iconColor
                    ? `${header.iconColor}15`
                    : 'rgba(15, 118, 110, 0.1)',
                  color: header.iconColor || '#0f766e',
                }}
              >
                <i className={`fas ${header.icon}`} />
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                {header.title}
              </h3>
              {header.subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {header.subtitle}
                </p>
              )}
            </div>
          </div>
          {header.action && <div className="flex-shrink-0">{header.action}</div>}
        </div>
      )}

      {/* Body */}
      <div className="relative z-10">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 relative z-10">
          {footer}
        </div>
      )}
    </>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={baseClasses}
        style={glowStyle}
        onClick={onClick}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} style={glowStyle} onClick={onClick}>
      {content}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMOS CARD GRID — Pre-built layout helper
   ═══════════════════════════════════════════════════════════════ */

export function CosmosCardGrid({
  children,
  cols = 3,
  gap = 4,
  className = '',
}: {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMOS EMPTY STATE — Premium empty state component
   ═══════════════════════════════════════════════════════════════ */

export function CosmosEmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mb-4">
        <i className={`fas ${icon} text-2xl text-slate-400 dark:text-slate-500`} />
      </div>
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMOS SKELETON — Content-matching skeleton loader
   ═══════════════════════════════════════════════════════════════ */

export function CosmosSkeleton({
  lines = 3,
  avatar = false,
  className = '',
}: {
  lines?: number;
  avatar?: boolean;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COSMOS BADGE — Unified badge component
   ═══════════════════════════════════════════════════════════════ */

export function CosmosBadge({
  children,
  color = 'primary',
  size = 'sm',
  pulse = false,
}: {
  children: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
}) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    accent: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const sizeMap = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${colorMap[color]} ${sizeMap[size]} ${pulse ? 'animate-pulse' : ''}`}
    >
      {children}
    </span>
  );
}
