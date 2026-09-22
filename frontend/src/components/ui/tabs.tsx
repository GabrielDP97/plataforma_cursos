import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
}

interface TabListProps {
  children: ReactNode;
}

interface TabTriggerProps {
  value: string;
  children: ReactNode;
}

interface TabContentProps {
  value: string;
  children: ReactNode;
}

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({ activeTab: '', setActiveTab: () => {} });

export function Tabs({ defaultValue, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children }: TabListProps) {
  return (
    <div className="flex border-b border-gray-200">
      {children}
    </div>
  );
}

export function TabTrigger({ value, children }: TabTriggerProps) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

export function TabContent({ value, children }: TabContentProps) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className="py-4">{children}</div>;
}
