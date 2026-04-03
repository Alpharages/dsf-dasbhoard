import { render, screen } from '@testing-library/react';
import { EscalationAnalyticsPage } from '@/components/architecture-review/EscalationAnalyticsPage';
import { vi, describe, it, expect } from 'vitest';
import { useEscalationMetrics } from '@/hooks/useAdrQueue';

// Mock the hook
vi.mock('@/hooks/useAdrQueue', () => ({
    useEscalationMetrics: vi.fn()
}));

// Mock Recharts
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Pie: () => <div>Pie Chart</div>,
    Cell: () => null,
    Tooltip: () => null,
    Legend: () => null
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Loader2: () => <span data-testid="loader-icon" />,
    TrendingUp: () => <span data-testid="trending-up-icon" />,
    AlertTriangle: () => <span data-testid="alert-triangle-icon" />,
    Clock: () => <span data-testid="clock-icon" />,
    Users: () => <span data-testid="users-icon" />,
    PieChart: () => <span data-testid="pie-chart-icon" />
}));

const mockMetrics = {
    totalEscalations: 15,
    escalationRate: 5.2,
    topReasons: [
        { reason: 'LOW_CONFIDENCE', count: 8 },
        { reason: 'MISSING_CONTEXT', count: 4 },
        { reason: 'SECURITY_CONCERN', count: 3 }
    ],
    avgResolutionTimeMinutes: 45,
    delegationRate: 20
};

describe('EscalationAnalyticsPage', () => {
    it('renders loading state', () => {
        (useEscalationMetrics as any).mockReturnValue({
            isLoading: true,
            data: null,
            error: null
        });

        render(<EscalationAnalyticsPage />);
        expect(screen.getByTestId('loader-icon')).toBeTruthy();
    });

    it('renders error state', () => {
        (useEscalationMetrics as any).mockReturnValue({
            isLoading: false,
            data: null,
            error: new Error('Failed to load')
        });

        render(<EscalationAnalyticsPage />);
        expect(screen.getByText(/Failed to load metrics/)).toBeTruthy();
    });

    it('renders metrics correctly', () => {
        (useEscalationMetrics as any).mockReturnValue({
            isLoading: false,
            data: mockMetrics,
            error: null
        });

        render(<EscalationAnalyticsPage />);
        expect(screen.getByText('15')).toBeTruthy(); // Total
        expect(screen.getByText('5.2%')).toBeTruthy(); // Rate
        expect(screen.getByText('45m')).toBeTruthy(); // Time
        expect(screen.getByText('20%')).toBeTruthy(); // Delegation
        expect(screen.getByText('LOW CONFIDENCE')).toBeTruthy(); // Reason reformatted
    });
});
