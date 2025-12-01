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
  const res = await fetchJson(url)
  // Normalize response shapes for callers: always return { rows, count }
  if (!res) return { rows: [], count: 0 }
  if (Array.isArray(res)) return { rows: res, count: res.length }
  if (res.data) {
    const rows = Array.isArray(res.data) ? res.data : []
    const count = res.meta && (res.meta.count || res.meta.total) ? (res.meta.count || res.meta.total) : rows.length
    return { rows, count }
  }
  return { rows: [], count: 0 }
}

export async function fetchFeatured(limit = 6){
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  const url = `${API_BASE}/api/v1/featured?${params.toString()}`;
  const res = await fetchJson(url);
  if (!res) return { rows: [], count: 0 };
  if (Array.isArray(res)) return { rows: res, count: res.length };
  if (res.data) {
    const rows = Array.isArray(res.data) ? res.data : [];
    const count = res.meta && (res.meta.count || res.meta.total) ? (res.meta.count || res.meta.total) : rows.length;
    return { rows, count };
  }
  return { rows: [], count: 0 };
}

export async function fetchCategories(){
  const url = `${API_BASE}/api/v1/categories`;
  const res = await fetchJson(url);
  if (!res) return [];
  // support { data: [...] } shape
  if (Array.isArray(res)) return res;
  return res.data || [];
}

export async function fetchTags(){
  const url = `${API_BASE}/api/v1/tags`;
  const res = await fetchJson(url);
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data || [];
}

export async function getPost(id){
  if(!id) throw new Error('missing id')
  const url = `${API_BASE}/api/v1/posts/${encodeURIComponent(id)}`
  return fetchJson(url)
}
