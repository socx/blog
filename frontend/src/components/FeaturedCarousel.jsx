import React, { useState } from 'react'

export default function FeaturedCarousel({ posts = [] }) {
  const [index, setIndex] = useState(0)

  if (!posts || posts.length === 0) return <div className="text-sm text-slate-500">No featured posts</div>

  const prev = () => setIndex(i => (i - 1 + posts.length) % posts.length)
  const next = () => setIndex(i => (i + 1) % posts.length)

  const p = posts[index]

  return (
    <div className="relative bg-white border border-slate-200 rounded-md overflow-hidden">
      <article className="flex flex-col md:flex-row">
        {p.featured_media_url ? (
          <img
            src={p.featured_media_url}
            alt={p.title}
            className="w-full md:w-1/3 h-56 object-cover"
          />
        ) : null}
        <div className="p-4 md:p-6 prose">
          <h3 className="text-lg font-semibold">{p.title}</h3>
          <p className="text-sm text-slate-600 mt-2">{p.excerpt || ''}</p>
          <a className="inline-block mt-3 text-sm text-indigo-600" href={`/posts/${p.id}`}>Read</a>
        </div>
      </article>

      <button
        className="absolute top-1/2 -translate-y-1/2 left-2 bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center"
        onClick={prev}
        aria-label="Previous"
      >
        ‹
      </button>

      <button
        className="absolute top-1/2 -translate-y-1/2 right-2 left-auto bg-black bg-opacity-40 text-white rounded-full w-9 h-9 flex items-center justify-center"
        onClick={next}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  )
}
