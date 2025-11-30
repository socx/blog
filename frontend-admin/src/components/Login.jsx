import React, { useState } from 'react';
import { login } from '../api/auth.js';

export default function Login({ onAuth }){
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('changeme');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await login(email, password);
      if(onAuth) onAuth();
    } catch (err){
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-lg font-semibold mb-4">Admin Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="border px-2 py-1 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" className="border px-2 py-1 w-full" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
