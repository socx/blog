import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts.js';

function slugify(str){
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g,'')
    .replace(/\s+/g,'-')
    .replace(/-+/g,'-')
}

export default function CreatePost(){
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState('draft');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function onTitleChange(e){
    const t = e.target.value;
    setTitle(t);
    if(!slug){
      setSlug(slugify(t));
    }
  }

  async function submit(e){
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      const payload = { title, slug: slug || slugify(title), excerpt, content, featured, status };
      const res = await createPost(payload);
      const id = res?.data?.id;
      if(id){
        navigate(`/posts/${id}`);
      }
    } catch(err){
      setError(err.message || 'Failed to create post');
    } finally { setSaving(false); }
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-lg font-semibold mb-4">Create New Post</h2>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <form onSubmit={submit} className="space-y-4 border p-4 rounded bg-white">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="border px-2 py-1 w-full" value={title} onChange={onTitleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input className="border px-2 py-1 w-full" value={slug} onChange={e=> setSlug(e.target.value)} required />
          <p className="text-xs text-gray-500 mt-1">Lowercase letters, numbers and hyphens only.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea className="border px-2 py-1 w-full" rows={3} value={excerpt} onChange={e=> setExcerpt(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea className="border px-2 py-1 w-full" rows={6} value={content} onChange={e=> setContent(e.target.value)} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input id="featured" type="checkbox" checked={featured} onChange={e=> setFeatured(e.target.checked)} />
            <label htmlFor="featured" className="text-sm">Featured</label>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Status</label>
            <select className="border px-2 py-1" value={status} onChange={e=> setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <button disabled={saving} className="bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50">
          {saving ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}
