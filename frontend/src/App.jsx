import React from 'react'
import Home from './pages/Home'

export default function App(){
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="container">
          <h1>My Blog</h1>
        </div>
      </header>
      <main className="container">
        <Home />
      </main>
      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} My Blog</div>
      </footer>
    </div>
  )
}
