import React, { useEffect, useState } from 'react';
import { listPosts, publishPost, unpublishPost } from '../api/posts.js';
import { Link } from 'react-router-dom';

export default function PostList(){
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduledOnly, setShowScheduledOnly] = useState(false);

  useEffect(()=>{
    let mounted = true;
    setLoading(true);
    listPosts({ scheduled: showScheduledOnly }).then(r=>{
      if(!mounted) return;
      setPosts(r.data || []);
    }).catch(err=>{
      if(!mounted) return; setError(err.message);
    }).finally(()=> mounted && setLoading(false));
    return ()=> mounted = false;
  },[showScheduledOnly]);

  if(loading) return <div>Loading posts...</div>;
  if(error) return <div className="text-red-600">{error}</div>;

  const visiblePosts = posts;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Posts</h2>
      <div className="flex items-center gap-3 mb-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showScheduledOnly} onChange={e=>setShowScheduledOnly(e.target.checked)} />
          <span>Show scheduled only</span>
        </label>
      </div>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Featured</th>
            <th className="p-2">Actions</th></tr>
        </thead>
        <tbody>
          {visiblePosts.map(p=> (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.title}</td>
              <td className="p-2">
                <div className="flex items-center gap-2">
                  <span>{p.status}</span>
                  {p.published_at && new Date(p.published_at) > new Date() ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Scheduled • {new Date(p.published_at).toLocaleString()}</span>
                  ) : null}
                </div>
              </td>
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
