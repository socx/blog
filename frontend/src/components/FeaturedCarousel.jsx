import React, {useState} from 'react'

export default function FeaturedCarousel({posts=[]}){
  const [index, setIndex] = useState(0)
  if(!posts || posts.length === 0) return <div className="no-featured">No featured posts</div>

  const prev = ()=> setIndex(i => (i - 1 + posts.length) % posts.length)
  const next = ()=> setIndex(i => (i + 1) % posts.length)

  const p = posts[index]
  return (
    <div className="carousel">
      <div className="carousel-inner">
        <article className="carousel-card">
          {p.featured_media_url ? (
            <img src={p.featured_media_url} alt={p.title} className="carousel-image" />
          ) : null}
          <div className="carousel-body">
            <h3>{p.title}</h3>
            <p>{p.excerpt || ''}</p>
            <a className="read-more" href={`/posts/${p.id}`}>Read</a>
          </div>
        </article>
      </div>
      <button className="carousel-prev" onClick={prev} aria-label="Previous">‹</button>
      <button className="carousel-next" onClick={next} aria-label="Next">›</button>
    </div>
  )
}
