import CosmosCard from '@/shared/components/ui/CosmosCard';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}

export default function DashboardWidget({ title, subtitle, icon, action, children, className = '' }: DashboardWidgetProps) {
  const actionNode = action ? (
    <button onClick={action.onClick} className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors">
      {action.label} <i className="fas fa-chevron-right text-[8px]" />
    </button>
  ) : undefined;

  return (
    <CosmosCard
      variant="default"
      padding="sm"
      className={className}
      header={{
        icon,
        iconColor: '#1B5E20',
        title,
        subtitle,
        action: actionNode,
      }}
    >
      {children}
    </CosmosCard>
  );
}
