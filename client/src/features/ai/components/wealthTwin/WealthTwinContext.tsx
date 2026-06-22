import { createContext, useContext, type ReactNode } from 'react';
import { useWealthTwinData, type TwinTab } from './useWealthTwinData';

export type { TwinTab };

type WealthTwinContextValue = ReturnType<typeof useWealthTwinData> & {
  activeTab: TwinTab;
  setActiveTab: (tab: TwinTab) => void;
};

const WealthTwinContext = createContext<WealthTwinContextValue | null>(null);

export function WealthTwinProvider({
  children,
  activeTab,
  setActiveTab,
}: {
  children: ReactNode;
  activeTab: TwinTab;
  setActiveTab: (tab: TwinTab) => void;
}) {
  const data = useWealthTwinData();
  return <WealthTwinContext.Provider value={{ ...data, activeTab, setActiveTab }}>{children}</WealthTwinContext.Provider>;
}

export function useTwinContext() {
  const ctx = useContext(WealthTwinContext);
  if (!ctx) throw new Error('useTwinContext must be used within WealthTwinProvider');
  return ctx;
}
