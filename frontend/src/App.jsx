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
            {/* Accessible icon-only toggle switch */}
            <button
              role="switch"
              aria-checked={dark}
              onClick={toggleDark}
              aria-label={dark ? 'Activate light mode' : 'Activate dark mode'}
              className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${dark ? 'bg-lime-500' : 'bg-slate-200'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-1'}`}
                aria-hidden="true"
              >
                {/* decorative icon inside knob */}
                <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {dark ? (
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
                  ) : (
                    <path d="M12 4.75V3m0 18v-1.75M4.75 12H3m18 0h-1.75M5.64 5.64L4.22 4.22m15.56 15.56l-1.41-1.41M18.36 5.64l1.41-1.41M4.22 19.78l1.41-1.41M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" fill="currentColor" />
                  )}
                </svg>
              </span>
              <span className="sr-only">Toggle dark mode</span>
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
