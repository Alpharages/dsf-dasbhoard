import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import CostAnalysisPage from '@/pages/CostAnalysisPage';

describe('CostAnalysisPage', () => {
    it('renders the page heading without crashing', () => {
        render(<CostAnalysisPage />);
        expect(screen.getByRole('heading', { name: 'Cost Analysis' })).toBeInTheDocument();
    });

    it('renders all four stat card labels', () => {
        render(<CostAnalysisPage />);
        expect(screen.getByText('Monthly Burn')).toBeInTheDocument();
        expect(screen.getByText('AI Token Cost')).toBeInTheDocument();
        expect(screen.getByText('Infrastructure')).toBeInTheDocument();
        expect(screen.getByText('Budget Cap')).toBeInTheDocument();
    });
});
