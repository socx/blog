import React, {useEffect, useState} from 'react'
import FeaturedCarousel from '../components/FeaturedCarousel'
import PostList from '../components/PostList'
import {fetchPosts} from '../api/posts'

export default function Home(){
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(()=>{
    let mounted = true
    setLoadingFeatured(true)
    fetchPosts({featured: true, limit: 6})
      .then(r=>{
        if(!mounted) return
        setFeatured(r.rows || r || [])
      })
      .catch(err=>{
        console.error('Failed to load featured posts', err)
      })
      .finally(()=> mounted && setLoadingFeatured(false))

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
        <PostList />
      </section>
    </div>
  )
}
