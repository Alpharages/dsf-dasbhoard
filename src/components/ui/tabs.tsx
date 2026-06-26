import * as React from "react"

interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

interface TabsContextType {
    value: string;
    setValue: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs provider");
    }
    return context;
};

const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className }) => {
    const [value, setValue] = React.useState(defaultValue);
    return (
        <TabsContext.Provider value={{ value, setValue }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className || ''}`}>
            {children}
        </div>
    );
};

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
    const { value: selectedValue, setValue } = useTabs();
    const isSelected = selectedValue === value;

    return (
        <button
            onClick={() => setValue(value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
            } ${className || ''}`}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
    const { value: selectedValue } = useTabs();

    if (selectedValue !== value) return null;

    return (
        <div className={`mt-2 focus-visible:outline-none ${className || ''}`}>
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
