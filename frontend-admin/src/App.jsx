import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login.jsx';
import PostList from './components/PostList.jsx';
import PostEditor from './components/PostEditor.jsx';
import { getStoredToken, logout } from './api/auth.js';

function RequireAuth({ children }){
  const token = getStoredToken();
  if(!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App(){
  const [token, setToken] = useState(getStoredToken());
  useEffect(()=>{
    const handler = ()=> setToken(getStoredToken());
    window.addEventListener('auth:changed', handler);
    return ()=> window.removeEventListener('auth:changed', handler);
  },[]);

  return (
    <Router>
      <div className="admin-app font-sans min-h-screen flex flex-col">
        <header className="border-b p-3 flex items-center gap-4 bg-gray-50">
          <h1 className="text-xl font-semibold"><Link to="/">Admin</Link></h1>
          <nav className="flex gap-3 text-sm">
            {token && <>
              <Link to="/posts">Posts</Link>
            </>}
          </nav>
          <div className="ml-auto">
            {token ? <button className="text-sm" onClick={()=>{ logout(); setToken(null); }}>Logout</button> : null}
          </div>
        </header>
        <main className="p-4 flex-1">
          <Routes>
            <Route path="/login" element={<Login onAuth={()=> setToken(getStoredToken())} />} />
            <Route path="/" element={<RequireAuth><PostList /></RequireAuth>} />
            <Route path="/posts" element={<RequireAuth><PostList /></RequireAuth>} />
            <Route path="/posts/:id" element={<RequireAuth><PostEditor /></RequireAuth>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
