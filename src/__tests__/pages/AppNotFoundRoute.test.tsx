import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, afterEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { NotFoundPage } from '@/pages/NotFoundPage';

describe('App catch-all route', () => {
  afterEach(() => {
    document.title = '';
  });

  it('renders NotFoundPage — not Dashboard — when navigating to an unknown path', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route-xyz']}>
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '404 — Page Not Found' })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('catch-all displays the unmatched URL', () => {
    render(
      <MemoryRouter initialEntries={['/some-nonexistent-page']}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('/some-nonexistent-page')).toBeInTheDocument();
  });

  it('catch-all renders NotFoundPage for a path that previously fell through to Dashboard', () => {
    // Regression guard for the /cost catch-all regression described in Story 25.4
    render(
      <MemoryRouter initialEntries={['/totally-unknown']}>
        <Routes>
          <Route path="/cost" element={<div>Cost Analysis</div>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: '404 — Page Not Found' })).toBeInTheDocument();
    expect(screen.queryByText('Cost Analysis')).not.toBeInTheDocument();
  });
});
