import React, {useEffect, useState} from 'react'
import {fetchPosts} from '../api/posts'

export default function PostList(){
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    fetchPosts({page, limit})
      .then(r=>{
        if(!mounted) return
        // API shape: {rows, count} or array - handle both
        if(Array.isArray(r)){
          setPosts(r)
          setTotal(r.length)
        } else {
          setPosts(r.rows || [])
          setTotal(r.count || (r.rows ? r.rows.length : 0))
        }
      })
      .catch(err=> console.error('Failed to load posts', err))
      .finally(()=> mounted && setLoading(false))

    return ()=> mounted = false
  },[page, limit])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="post-list">
      {loading ? <div>Loading posts...</div> : (
        <ul>
          {posts.map(p=> (
            <li key={p.id} className="border-b border-slate-200 py-4">
              <a href={`/posts/${p.id}`} className="block">
                <h3 className="text-lg font-medium">{p.title}</h3>
              </a>
              <p className="text-sm text-slate-600">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

  <nav className="flex items-center gap-2 mt-4">
        <button className="px-3 py-1 bg-slate-100 rounded" onClick={()=>setPage(1)} disabled={page===1}>First</button>
        <button className="px-3 py-1 bg-slate-100 rounded" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <button className="px-3 py-1 bg-slate-100 rounded" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button>
        <button className="px-3 py-1 bg-slate-100 rounded" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Last</button>
      </nav>
    </div>
  )
}
