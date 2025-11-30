import { authHeaders } from './auth.js';
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function json(res){
  if(!res.ok){
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function listPosts(page=1, limit=20){
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/v1/admin/posts?${params}`, { headers: { ...authHeaders() } });
  return json(res);
}

export async function getPost(id){
  const res = await fetch(`${API_BASE}/api/v1/admin/posts/${id}`, { headers: { ...authHeaders() } });
  return json(res);
}

export async function updatePost(id, data){
  const res = await fetch(`${API_BASE}/api/v1/admin/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data)
  });
  return json(res);
}

export async function setPostCategories(id, categoryIds){
  const res = await fetch(`${API_BASE}/api/v1/admin/posts/${id}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ categories: categoryIds })
  });
  return json(res);
}

export async function setPostTags(id, tagIds){
  const res = await fetch(`${API_BASE}/api/v1/admin/posts/${id}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ tags: tagIds })
  });
  return json(res);
}

export async function listCategories(){
  const res = await fetch(`${API_BASE}/api/v1/categories`);
  return json(res);
}

export async function listTags(){
  const res = await fetch(`${API_BASE}/api/v1/tags`);
  return json(res);
}
