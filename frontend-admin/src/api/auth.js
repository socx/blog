const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function login(email, password){
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if(!res.ok){
    throw new Error('Login failed');
  }
  const data = await res.json();
  localStorage.setItem('admin_token', data.token);
  window.dispatchEvent(new CustomEvent('auth:changed'));
  return data;
}

export function getStoredToken(){
  return localStorage.getItem('admin_token');
}

export function authHeaders(){
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function logout(){
  localStorage.removeItem('admin_token');
  window.dispatchEvent(new CustomEvent('auth:changed'));
}
