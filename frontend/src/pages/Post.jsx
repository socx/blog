import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPost } from '../api/posts'

export default function Post(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getPost(id)
      .then(raw => {
        if(!mounted) return
        const p = raw && raw.data ? raw.data : raw
        if(!p) {
          setError('Not found')
          return
        }
        // normalize content fields: backend stores `content`, UI expects `body`/`bodyHtml`
        if (p && !p.body && p.content) {
          // preserve raw content in `body` for older UI code
          p.body = p.content
        }
        if (p && !p.bodyHtml && (p.content_html || p.contentHtml)) {
          p.bodyHtml = p.content_html || p.contentHtml
        }
        setPost(p)
        // basic SEO meta updates (title, description, canonical, og tags)
        try{
          const siteBase = import.meta.env.VITE_SITE_BASE || window.location.origin
          const siteName = import.meta.env.VITE_SITE_NAME || 'My Blog'
          const prevTitle = document.title
          document.title = `${p.title} — ${siteName}`

          // description
          const desc = p.excerpt || (p.body ? String(p.body).slice(0,160) : '')
          let metaDesc = document.querySelector('meta[name="description"]')
          const prevDesc = metaDesc ? metaDesc.content : null
          if(!metaDesc){
            metaDesc = document.createElement('meta')
            metaDesc.name = 'description'
            document.head.appendChild(metaDesc)
          }
          metaDesc.content = desc || ''

          // canonical
          let linkCanon = document.querySelector('link[rel="canonical"]')
          const canonHref = `${siteBase.replace(/\/$/, '')}/posts/${encodeURIComponent(p.slug || p.id)}`
          const prevCanon = linkCanon ? linkCanon.href : null
          if(!linkCanon){
            linkCanon = document.createElement('link')
            linkCanon.rel = 'canonical'
            document.head.appendChild(linkCanon)
          }
          linkCanon.href = canonHref

          // Open Graph
          const setOG = (prop, content) => {
            let el = document.querySelector(`meta[property="${prop}"]`)
            if(!el){ el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
            el.content = content || ''
          }
          setOG('og:title', p.title)
          setOG('og:description', desc)
          setOG('og:url', canonHref)
          if(p.featured_media_url) setOG('og:image', p.featured_media_url)

          // cleanup on unmount: restore title/description/canonical if we created them
          const cleanup = () => {
            try{
              document.title = prevTitle
              if (metaDesc && prevDesc !== null) metaDesc.content = prevDesc
              if (linkCanon && prevCanon !== null) linkCanon.href = prevCanon
            }catch(e){}
          }
          // attach cleanup to element so we can call later
          document._postCleanup = cleanup
        }catch(e){/* ignore */}
      })
      .catch(err=>{
        console.error('Failed to load post', err)
        setError(err.message || 'Failed to load')
      })
      .finally(()=> mounted && setLoading(false))

    return ()=> mounted = false
  },[id])

  if(loading) return <div>Loading post...</div>
  if(error) return (
    <div className="py-8">
      <p className="text-red-600">{error}</p>
      <button className="mt-4 px-3 py-1 bg-slate-100 rounded" onClick={()=>navigate(-1)}>Go back</button>
    </div>
  )

  return (
    <article className="prose prose-sm md:prose lg:prose-lg mx-auto">
      <h1>{post.title}</h1>
      <p className="text-sm text-slate-500">{post.author} • {new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString()}</p>
      {post.bodyHtml ? (
        <section dangerouslySetInnerHTML={{__html: post.bodyHtml}} />
      ) : (
        <section>{post.body}</section>
      )}

      <div className="mt-6">
        <button className="px-3 py-1 bg-slate-100 rounded" onClick={() => window.history.length > 1 ? window.history.back() : null}>Go back</button>
      </div>
    </article>
  )
}
