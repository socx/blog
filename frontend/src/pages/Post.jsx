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
      .then(p=>{
        if(!mounted) return
        if(!p) {
          setError('Not found')
          return
        }
        setPost(p)
        // basic SEO meta updates
        try{
          document.title = `${p.title} — My Blog`
          const desc = p.excerpt || (p.body ? p.body.slice(0,160) : '')
          let meta = document.querySelector('meta[name="description"]')
          if(!meta){
            meta = document.createElement('meta')
            meta.name = 'description'
            document.head.appendChild(meta)
          }
          meta.content = desc
          // og tags
          const setTag = (prop, content)=>{
            let el = document.querySelector(`meta[property="${prop}"]`)
            if(!el){ el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el) }
            el.content = content || ''
          }
          setTag('og:title', p.title)
          setTag('og:description', desc)
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
    </article>
  )
}
