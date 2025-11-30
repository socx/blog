import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, updatePost, listCategories, listTags, setPostCategories, setPostTags } from '../api/posts.js';

export default function PostEditor(){
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    let mounted = true;
    getPost(id).then(r=>{ if(mounted) setPost(r.data); }).catch(e=> setError(e.message));
    listCategories().then(r=>{ if(mounted) setCategories(r.data); });
    listTags().then(r=>{ if(mounted) setTags(r.data); });
    return ()=> mounted = false;
  },[id]);

  async function saveBasic(e){
    e.preventDefault();
    setSaving(true); setError(null); setMessage(null);
    try {
      const updated = await updatePost(id, { title: post.title, excerpt: post.excerpt, featured: !!post.featured });
      setPost(updated.data);
      setMessage('Saved');
    } catch(err){ setError(err.message); } finally { setSaving(false); }
  }

  async function saveTaxonomy(e){
    e.preventDefault();
    setSaving(true); setError(null); setMessage(null);
    try {
      await setPostCategories(id, selectedCategories);
      await setPostTags(id, selectedTags);
      setMessage('Taxonomy saved');
    } catch(err){ setError(err.message); } finally { setSaving(false); }
  }

  if(error) return <div className="text-red-600">{error}</div>;
  if(!post) return <div>Loading post...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <h2 className="text-lg font-semibold">Edit Post: {post.title}</h2>
      {message && <div className="text-green-600 text-sm">{message}</div>}

      <form onSubmit={saveBasic} className="space-y-4 border p-4 rounded bg-white">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="border px-2 py-1 w-full" value={post.title} onChange={e=> setPost({...post, title: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea className="border px-2 py-1 w-full" rows={3} value={post.excerpt || ''} onChange={e=> setPost({...post, excerpt: e.target.value})} />
        </div>
        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={!!post.featured} onChange={e=> setPost({...post, featured: e.target.checked})} />
          <label htmlFor="featured" className="text-sm">Featured</label>
        </div>
        <button disabled={saving} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
      </form>

      <form onSubmit={saveTaxonomy} className="space-y-4 border p-4 rounded bg-white">
        <h3 className="font-medium">Taxonomy</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <div className="space-y-1 max-h-48 overflow-auto border p-2">
              {categories.map(c => (
                <label key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={c.id} checked={selectedCategories.includes(c.id)} onChange={e=> {
                    const idNum = c.id;
                    setSelectedCategories(sel => e.target.checked ? [...sel, idNum] : sel.filter(x=>x!==idNum));
                  }} /> {c.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="space-y-1 max-h-48 overflow-auto border p-2">
              {tags.map(t => (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" value={t.id} checked={selectedTags.includes(t.id)} onChange={e=> {
                    const idNum = t.id;
                    setSelectedTags(sel => e.target.checked ? [...sel, idNum] : sel.filter(x=>x!==idNum));
                  }} /> {t.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <button disabled={saving} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save Taxonomy'}</button>
      </form>
    </div>
  );
}
