import React, {useEffect, useState} from 'react'
import FeaturedCarousel from '../components/FeaturedCarousel'
import PostList from '../components/PostList'
import { fetchCategories, fetchTags } from '../api/posts'

export default function Home(){
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  useEffect(()=>{
    let mounted = true
    setLoadingFeatured(true)
    import('../api/posts').then(mod => mod.fetchFeatured(6))
      .then(r=>{
        if(!mounted) return
        setFeatured((r && r.rows) || [])
      })
      .catch(err=>{
        console.error('Failed to load featured posts', err)
      })
      .finally(()=> mounted && setLoadingFeatured(false))

    return ()=> mounted = false
  },[])

  useEffect(()=>{
    let mounted = true
    fetchCategories().then(list => { if(mounted) setCategories(list || []) }).catch(()=>{})
    fetchTags().then(list => { if(mounted) setTags(list || []) }).catch(()=>{})
    return ()=> mounted = false
  },[])

  return (
    <div className="home-page space-y-8">
      <section className="featured-section">
        <h2 className="text-xl font-semibold mb-3">Featured</h2>
        {loadingFeatured ? <div>Loading featured...</div> : <FeaturedCarousel posts={featured} />}
      </section>

      <section className="list-section">
        <h2 className="text-xl font-semibold mb-3">Recent posts</h2>
        <div className="mb-4 flex gap-3 items-center">
          <label className="text-sm">Category:
            <select className="ml-2 border px-2 py-1" value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)}>
              <option value="">All</option>
              {categories.map(c=> <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Tag:
            <select className="ml-2 border px-2 py-1" value={selectedTag} onChange={e=>setSelectedTag(e.target.value)}>
              <option value="">All</option>
              {tags.map(t=> <option key={t.id} value={t.slug}>{t.name}</option>)}
            </select>
          </label>
        </div>
        <PostList category={selectedCategory || undefined} tag={selectedTag || undefined} />
      </section>
    </div>
  )
}
