import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders 404 heading, requested URL, and dashboard CTA link', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route?source=test']}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '404 — Page Not Found' })).toBeInTheDocument();
    expect(screen.getByText('/unknown-route?source=test')).toBeInTheDocument();

    const ctaLink = screen.getByRole('link', { name: /go to dashboard/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', '/');
  });

});
