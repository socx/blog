const API_BASE = import.meta.env.VITE_API_BASE || ''

async function fetchJson(url, opts){
  const res = await fetch(url, opts)
  if(!res.ok){
    const text = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${text}`)
  }
  return res.json().catch(()=> null)
}

export async function fetchPosts({page, limit, featured} = {}){
  const params = new URLSearchParams()
  if(page) params.set('page', page)
  if(limit) params.set('limit', limit)
  if(typeof featured !== 'undefined') params.set('featured', String(featured))

  const url = `${API_BASE}/api/v1/posts?${params.toString()}`
  return fetchJson(url)
}
