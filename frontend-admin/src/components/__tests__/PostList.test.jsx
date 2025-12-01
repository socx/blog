import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, expect, describe, test } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);
import PostList from '../PostList';
import { MemoryRouter } from 'react-router-dom';

// mock the api module used by PostList
vi.mock('../../api/posts.js', () => {
  return {
    listPosts: vi.fn((opts = {}) => {
      const nowIso = new Date().toISOString();
      const futureIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const nowPost = { id: 1, title: 'Now Post', slug: 'now-post', status: 'published', published_at: nowIso, featured: false };
      const futurePost = { id: 2, title: 'Future Post', slug: 'future-post', status: 'published', published_at: futureIso, featured: false };
      if (opts && opts.scheduled) return Promise.resolve({ data: [futurePost], meta: {} });
      return Promise.resolve({ data: [futurePost, nowPost], meta: {} });
    }),
    publishPost: vi.fn(),
    unpublishPost: vi.fn(),
  };
});

describe('PostList (admin) scheduled filter', () => {
  test('toggles scheduled-only and requests scheduled items from API', async () => {
    render(
      <MemoryRouter>
        <PostList />
      </MemoryRouter>
    );

    // initially both posts (future + now) should be rendered
    await waitFor(() => expect(screen.getByText('Future Post')).toBeInTheDocument());
    expect(screen.getByText('Now Post')).toBeInTheDocument();

    // toggle checkbox to show scheduled only
    const checkbox = screen.getByRole('checkbox', { name: /Show scheduled only/i });
    fireEvent.click(checkbox);

    // after toggle, only Future Post should remain
    await waitFor(() => expect(screen.getByText('Future Post')).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Now Post')).not.toBeInTheDocument());
  });
});
