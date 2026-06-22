import { useState } from 'react';
import { useWealthStore } from '@/shared/store/wealthStore';
import CommandPalette from '@/shared/components/ui/CommandPalette';
import WealthTwinAssistant from './WealthTwinAssistant';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import Page from './Page';

interface AppShellProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function AppShell({ children, currentView, onNavigate }: AppShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const darkMode = useWealthStore((s) => s.darkMode);
  const accessibilityMode = useWealthStore((s) => s.accessibilityMode);
  const seniorMode = useWealthStore((s) => s.seniorMode);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? 'bg-slate-950 text-white' : 'bg-psb-bg text-psb-text'
      } ${accessibilityMode ? 'a11y-mode' : ''} ${seniorMode ? 'senior-mode' : ''}`}
    >
      <Topbar
        currentView={currentView}
        onNavigate={onNavigate}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentView={currentView}
          onNavigate={onNavigate}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <Page view={currentView}>{children}</Page>
      </div>

      <CommandPalette />
      <WealthTwinAssistant />
    </div>
  );
}
