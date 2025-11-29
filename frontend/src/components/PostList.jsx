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
            <li key={p.id} className="post-item">
              <a href={`/posts/${p.id}`}>
                <h3>{p.title}</h3>
              </a>
              <p className="excerpt">{p.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      <nav className="pagination">
        <button onClick={()=>setPage(1)} disabled={page===1}>First</button>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button>
        <button onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Last</button>
      </nav>
    </div>
  )
}
