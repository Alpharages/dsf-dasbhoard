import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'Initial Title';
  });

  afterEach(() => {
    document.title = '';
  });

  it('sets document title on mount and update', () => {
    const { rerender } = renderHook(
      ({ title }) => {
        useDocumentTitle(title);
      },
      {
        initialProps: { title: 'Login — DSF' },
      },
    );

    expect(document.title).toBe('Login — DSF');

    rerender({ title: 'Profile — DSF' });
    expect(document.title).toBe('Profile — DSF');
  });

  it('restores DSF Dashboard on unmount', () => {
    const { unmount } = renderHook(() => {
      useDocumentTitle('Conversations — DSF');
    });

    expect(document.title).toBe('Conversations — DSF');

    unmount();
    expect(document.title).toBe('DSF Dashboard');
  });
});
