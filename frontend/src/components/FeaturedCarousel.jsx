import React, {useState} from 'react'

export default function FeaturedCarousel({posts=[]}){
  const [index, setIndex] = useState(0)
  if(!posts || posts.length === 0) return <div className="text-sm text-slate-500">No featured posts</div>

  const prev = ()=> setIndex(i => (i - 1 + posts.length) % posts.length)
  const next = ()=> setIndex(i => (i + 1) % posts.length)

  const p = posts[index]
  return (
    <div className="relative bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="carousel-inner">
        <article className="flex flex-col md:flex-row">
          {p.featured_media_url ? (
            <img src={p.featured_media_url} alt={p.title} className="w-full md:w-1/3 h-56 object-cover" />
          ) : null}
          <div className="p-4 md:p-6">
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{p.excerpt || ''}</p>
            <a className="inline-block mt-3 text-sm text-indigo-600" href={`/posts/${p.id}`}>Read</a>
          </div>
        </article>
      </div>
      <button className="carousel-prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="carousel-next" onClick={next} aria-label="Next">›</button>
    </div>
  )
}
