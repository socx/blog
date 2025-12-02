import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPost, updatePost, listCategories, listTags, setPostCategories, setPostTags, publishPost, unpublishPost, createCategory, createTag, uploadMedia } from '../api/posts.js';

export default function PostEditor(){
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedAtInput, setPublishedAtInput] = useState('')
  const [uploading, setUploading] = useState(false);

  useEffect(()=>{
    let mounted = true;
    getPost(id).then(r=>{ if(mounted) {
      const p = r && r.data ? r.data : r;
      setPost(p);
      // initialize selected taxonomy if provided by API
      if (Array.isArray(p.category_ids)) setSelectedCategories(p.category_ids.slice());
      if (Array.isArray(p.tag_ids)) setSelectedTags(p.tag_ids.slice());
    }}).catch(e=> setError(e.message));
    // initialize published_at input when post loads
    // initialize published_at input when post loads
    getPost(id).then(r => {
      const p = r && r.data ? r.data : r
      if (!p) return
      if (p.published_at) {
        // convert to local datetime-local value
        const d = new Date(p.published_at)
        const tzOffsetMin = d.getTimezoneOffset()
        d.setMinutes(d.getMinutes() - tzOffsetMin)
        setPublishedAtInput(d.toISOString().slice(0,16))
      } else {
        setPublishedAtInput('')
      }
    }).catch(()=>{})
    listCategories().then(r=>{ if(mounted) setCategories(r.data); });
    listTags().then(r=>{ if(mounted) setTags(r.data); });
    return ()=> mounted = false;
  },[id]);

  async function saveBasic(e){
    e.preventDefault();
    setSaving(true); setError(null); setMessage(null);
    try {
      const payload = { title: post.title, excerpt: post.excerpt, featured: !!post.featured };
      if (publishedAtInput) {
        // convert local input back to ISO
        const d = new Date(publishedAtInput)
        payload.published_at = d.toISOString()
      } else if (post.published_at === null) {
        payload.published_at = null
      }
      if (post && post.featured_media_id) payload.featured_media_id = post.featured_media_id;
      const updated = await updatePost(id, payload);
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

  async function doPublish(){
    setPublishing(true); setError(null); setMessage(null);
    try {
      const r = await publishPost(id);
      setPost(r.data);
      setMessage('Published');
    } catch(err){ setError(err.message); } finally { setPublishing(false); }
  }

  async function doUnpublish(){
    setPublishing(true); setError(null); setMessage(null);
    try {
      const r = await unpublishPost(id);
      setPost(r.data);
      setMessage('Unpublished');
    } catch(err){ setError(err.message); } finally { setPublishing(false); }
  }

  if(error) return <div className="text-red-600">{error}</div>;
  if(!post) return <div>Loading post...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Post: {post.title}</h2>
        <div className="flex items-center gap-3">
          {(() => {
            const isScheduled = post && post.published_at && new Date(post.published_at) > new Date();
            return (
              <span className={`text-xs px-2 py-0.5 rounded border ${isScheduled ? 'bg-blue-50 text-blue-700 border-blue-200' : (post.status==='published' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200')}`}>
                {isScheduled ? `Scheduled • ${new Date(post.published_at).toLocaleString()}` : `${post.status || 'draft'}${post.published_at && new Date(post.published_at) <= new Date() ? ` • ${new Date(post.published_at).toLocaleString()}` : ''}`}
              </span>
            )
          })()}
          {post.status === 'published' ? (
            <button onClick={doUnpublish} disabled={publishing} className="bg-amber-600 text-white px-3 py-1 rounded disabled:opacity-50">
              {publishing ? 'Working...' : 'Unpublish'}
            </button>
          ) : (
            <button onClick={doPublish} disabled={publishing} className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50">
              {publishing ? 'Working...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
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
        <div>
          <label className="block text-sm font-medium">Publish Date (optional)</label>
          <input type="datetime-local" className="border px-2 py-1 w-full" value={publishedAtInput} onChange={e=> setPublishedAtInput(e.target.value)} />
          <p className="text-xs text-slate-500 mt-1">Set a future date to schedule publishing.</p>
        </div>
        <div className="flex items-center gap-2">
          <input id="featured" type="checkbox" checked={!!post.featured} onChange={e=> setPost({...post, featured: e.target.checked})} />
          <label htmlFor="featured" className="text-sm">Featured</label>
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium mb-1">Featured media</label>
          {post.featured_media_url ? (
            <div className="mb-2">
              <img src={`${(import.meta.env.VITE_API_BASE || '')}${post.featured_media_url}`} alt="Featured" style={{maxWidth: '200px', maxHeight: '150px'}} />
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if(!file) return;
              setUploading(true); setError(null);
              try {
                const res = await uploadMedia(file);
                const created = res && res.data ? res.data : res;
                if (created) {
                  setPost(p => ({ ...p, featured_media_id: created.id, featured_media_url: created.url }));
                }
              } catch (err) {
                setError(err.message || String(err));
              } finally { setUploading(false); }
            }} />
            {uploading ? <span className="text-sm">Uploading...</span> : null}
          </div>
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
              <div className="mt-2 flex gap-2">
                <input className="border px-2 py-1 flex-1" placeholder="New category name" value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} />
                <button type="button" className="px-3 py-1 bg-slate-100 rounded" onClick={async ()=>{
                  if(!newCategoryName || !newCategoryName.trim()) return;
                  try{
                    const slug = newCategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
                    const res = await createCategory({ name: newCategoryName.trim(), slug });
                    const created = res && res.data ? res.data : res;
                    if(created){
                      setCategories(prev=>[...prev, created]);
                      setSelectedCategories(prev=>[...prev, created.id]);
                      setNewCategoryName('');
                    }
                  }catch(err){ setError(err.message || String(err)); }
                }}>Add</button>
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
              <div className="mt-2 flex gap-2">
                <input className="border px-2 py-1 flex-1" placeholder="New tag name" value={newTagName} onChange={e=>setNewTagName(e.target.value)} />
                <button type="button" className="px-3 py-1 bg-slate-100 rounded" onClick={async ()=>{
                  if(!newTagName || !newTagName.trim()) return;
                  try{
                    const slug = newTagName.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
                    const res = await createTag({ name: newTagName.trim(), slug });
                    const created = res && res.data ? res.data : res;
                    if(created){
                      setTags(prev=>[...prev, created]);
                      setSelectedTags(prev=>[...prev, created.id]);
                      setNewTagName('');
                    }
                  }catch(err){ setError(err.message || String(err)); }
                }}>Add</button>
              </div>
          </div>
        </div>
        <button disabled={saving} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save Taxonomy'}</button>
      </form>
    </div>
  );
}
