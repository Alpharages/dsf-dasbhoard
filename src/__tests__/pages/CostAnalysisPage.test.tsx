import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import CostAnalysisPage from '@/pages/CostAnalysisPage';

describe('CostAnalysisPage', () => {
    afterEach(() => {
        document.title = '';
    });

    it('renders the page heading without crashing', () => {
        render(<CostAnalysisPage />);
        expect(screen.getByRole('heading', { name: 'Cost Analysis' })).toBeInTheDocument();
    });

    it('sets document.title to "Cost Analysis — DSF"', () => {
        render(<CostAnalysisPage />);
        expect(document.title).toBe('Cost Analysis — DSF');
    });

    it('renders all four stat card labels', () => {
        render(<CostAnalysisPage />);
        expect(screen.getByText('Monthly Burn')).toBeInTheDocument();
        expect(screen.getByText('AI Token Cost')).toBeInTheDocument();
        expect(screen.getByText('Infrastructure')).toBeInTheDocument();
        expect(screen.getByText('Budget Cap')).toBeInTheDocument();
    });
});
