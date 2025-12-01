import React, { useEffect, useState } from 'react';
import { listPosts, publishPost, unpublishPost } from '../api/posts.js';
import { Link } from 'react-router-dom';

export default function PostList(){
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    listPosts().then(r=>{
      if(!mounted) return;
      setPosts(r.data || []);
    }).catch(err=>{
      if(!mounted) return; setError(err.message);
    }).finally(()=> mounted && setLoading(false));
    return ()=> mounted = false;
  },[]);

  if(loading) return <div>Loading posts...</div>;
  if(error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Posts</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Featured</th>
            <th className="p-2">Actions</th></tr>
        </thead>
        <tbody>
          {posts.map(p=> (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.title}</td>
              <td className="p-2">{p.status}</td>
              <td className="p-2">{p.featured ? 'Yes' : 'No'}</td>
              <td className="p-2 flex items-center gap-2">
                <Link className="text-indigo-600" to={`/posts/${p.id}`}>Edit</Link>
                {p.status === 'published' ? (
                  <button onClick={async ()=>{
                    try {
                      await unpublishPost(p.id);
                      setPosts(prev => prev.map(x => x.id===p.id ? {...x, status: 'draft', published_at: null} : x));
                    } catch (err) { setError(err.message || String(err)); }
                  }} className="text-sm px-2 py-0.5 bg-amber-600 text-white rounded">Unpublish</button>
                ) : (
                  <button onClick={async ()=>{
                    try {
                      await publishPost(p.id);
                      setPosts(prev => prev.map(x => x.id===p.id ? {...x, status: 'published', published_at: new Date().toISOString()} : x));
                    } catch (err) { setError(err.message || String(err)); }
                  }} className="text-sm px-2 py-0.5 bg-emerald-600 text-white rounded">Publish</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
