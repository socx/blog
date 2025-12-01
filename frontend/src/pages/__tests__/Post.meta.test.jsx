import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, beforeEach, afterEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock the API module
const mockPost = {
  id: 123,
  slug: 'test-post-meta',
  title: 'Test Post Meta',
  excerpt: 'This is a test excerpt for meta tags.',
  body: 'Full body',
  featured_media_url: 'http://example.com/img.png',
  published_at: new Date().toISOString(),
}

vi.mock('../../api/posts', () => ({
  getPost: vi.fn(() => Promise.resolve({ data: mockPost }))
}))

import Post from '../Post'

describe('Post SEO meta', () => {
  beforeEach(() => {
    // clean head before each test
    document.title = 'App'
    ;[...document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], link[rel="canonical"]')].forEach(n => n.remove())
  })

  afterEach(() => {
    // cleanup
    document.title = 'App'
    ;[...document.head.querySelectorAll('meta[name="description"], meta[property^="og:"], link[rel="canonical"]')].forEach(n => n.remove())
  })

  it('sets title, description, canonical and og tags when post loads', async () => {
    render(
      <MemoryRouter initialEntries={[`/posts/${mockPost.slug}`]}>
        <Routes>
          <Route path="/posts/:id" element={<Post/>} />
        </Routes>
      </MemoryRouter>
    )

    // wait for title to update by waiting for the post title to appear
    const heading = await screen.findByText(mockPost.title)
    expect(heading).toBeTruthy()

    expect(document.title).toContain(mockPost.title)

    const metaDesc = document.head.querySelector('meta[name="description"]')
    expect(metaDesc).toBeTruthy()
    expect(metaDesc.content).toBe(mockPost.excerpt)

    const linkCanon = document.head.querySelector('link[rel="canonical"]')
    expect(linkCanon).toBeTruthy()
    expect(linkCanon.href).toContain(`/posts/${mockPost.slug}`)

    const ogTitle = document.head.querySelector('meta[property="og:title"]')
    expect(ogTitle).toBeTruthy()
    expect(ogTitle.content).toBe(mockPost.title)

    const ogImage = document.head.querySelector('meta[property="og:image"]')
    expect(ogImage).toBeTruthy()
    expect(ogImage.content).toBe(mockPost.featured_media_url)
  })
})
