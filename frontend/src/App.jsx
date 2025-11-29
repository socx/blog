import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Post from './pages/Post'
import ThemeToggle from './components/ThemeToggle'

export default function App(){
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <header className="site-header">
          <div className="container px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold"><Link to="/">My Blog</Link></h1>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container px-4 py-8 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts/:id" element={<Post />} />
          </Routes>
        </main>
        <footer className="site-footer">
          <div className="container px-4">© {new Date().getFullYear()} My Blog</div>
        </footer>
      </div>
    </Router>
  )
}
