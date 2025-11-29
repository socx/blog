import React, { useEffect, useState } from 'react'
import Home from './pages/Home'

export default function App(){
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    // initialize from localStorage or system preference
    const saved = localStorage.getItem('theme')
    if(saved === 'dark'){
      document.documentElement.classList.add('dark')
      setDark(true)
    } else if(saved === 'light'){
      document.documentElement.classList.remove('dark')
      setDark(false)
    } else {
      // no preference saved — use system
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      if(prefersDark){
        document.documentElement.classList.add('dark')
        setDark(true)
      }
    }
  },[])

  function toggleDark(){
    const next = !dark
    setDark(next)
    if(next){
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme','dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme','light')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="site-header">
        <div className="container px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Blog</h1>
          <div>
            <button
              onClick={toggleDark}
              className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sm"
              aria-pressed={dark}
              aria-label="Toggle dark mode"
            >
              {dark ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
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
