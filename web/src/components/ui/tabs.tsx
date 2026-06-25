import * as React from 'react';
import { cn } from '@/lib/utils';

// --- Konteks ---

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within a <Tabs> parent.');
  }
  return context;
}

// --- Tab Utama ---

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, className, children, ...props }, ref) => (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn(className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  ),
);
Tabs.displayName = 'Tabs';

// --- Daftar Tab ---

const TabList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn('flex gap-1 border-b border-border pb-px', className)}
      {...props}
    />
  ),
);
TabList.displayName = 'TabList';

// --- Tab ---

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: activeValue, onValueChange } = useTabsContext();
    const isActive = activeValue === value;

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onValueChange(value)}
        className={cn(
          'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
          'text-foreground-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          isActive && 'text-primary border-b-2 border-primary',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Tab.displayName = 'Tab';

// --- Panel Tab ---

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: activeValue } = useTabsContext();

    if (activeValue !== value) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn('py-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
TabPanel.displayName = 'TabPanel';

export { Tabs, TabList, Tab, TabPanel };
