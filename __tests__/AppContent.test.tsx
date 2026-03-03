import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import App from '../src/App';
import * as contexts from '@/contexts';

// Mock AuthProvider (passthrough) and useAuth to avoid real auth side effects
vi.mock('@/contexts', async () => {
  const actual = await vi.importActual('@/contexts');
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  };
});

// Mock SocketProvider to avoid WebSocket connection attempts during tests
vi.mock('@/contexts/SocketContext', () => ({
  SocketProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('AppContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders null when auth is loading', () => {
    (contexts.useAuth as any).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    // App uses useMatches which requires a Data Router
    const router = createMemoryRouter([
      {
        path: '/',
        element: <App />,
      },
    ]);

    const { container } = render(<RouterProvider router={router} />);

    // AppContent returns null during isLoading — no spinner, no content
    expect(container.firstChild).toBeNull();
  });
});
