import SecurityStatusRail from './nav/SecurityStatusRail';
import GlobalHeader from './nav/GlobalHeader';
import CategoryNav from './nav/CategoryNav';

interface TopbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMobileSidebar: () => void;
}

export default function Topbar({ currentView, onNavigate, onOpenMobileSidebar }: TopbarProps) {
  return (
    <>
      <SecurityStatusRail />
      <GlobalHeader onOpenMobileSidebar={onOpenMobileSidebar} onNavigate={onNavigate} />
      <CategoryNav currentView={currentView} onNavigate={onNavigate} />
    </>
  );
}
