import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationListWidget } from '@/components/conversations/ConversationListWidget';
import { searchConversations } from '@/api/conversations';

vi.mock('@/api/conversations', () => ({
  searchConversations: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('ConversationListWidget', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(searchConversations).mockResolvedValue({
      conversations: [],
      total: 0,
      limit: 5,
      offset: 0,
      hasMore: false,
    });
  });

  it('dedupes recent conversation search under StrictMode', async () => {
    render(
      <StrictMode>
        <ConversationListWidget onConversationClick={vi.fn()} onViewAll={vi.fn()} />
      </StrictMode>,
      { wrapper },
    );

    await waitFor(() => {
      expect(searchConversations).toHaveBeenCalledWith({ limit: 5, offset: 0 });
    });

    expect(searchConversations).toHaveBeenCalledTimes(1);
  });
});
