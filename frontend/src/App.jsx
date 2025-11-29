import React from 'react'
import Home from './pages/Home'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <header className="site-header">
        <div className="container px-4 py-4">
          <h1 className="text-2xl font-semibold">My Blog</h1>
        </div>
      </header>
      <main className="container px-4 py-8 flex-1">
        <Home />
      </main>
      <footer className="site-footer">
        <div className="container px-4">© {new Date().getFullYear()} My Blog</div>
      </footer>
    </div>
  )
}
