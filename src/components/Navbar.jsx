import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'

export default function Navbar() {
  const { user } = useAuth()
  const { dark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowSearch(true)
        setTimeout(() => searchRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setShowSearch(false)
        setSearchQuery('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    showToast('Logged out', 'info')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav className="sticky top-0 z-50 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md docked">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-serif italic text-blue-900 dark:text-blue-100">
              ShelfTalk
            </Link>
            <div className="hidden md:flex gap-6 items-center">
              {[
                { path: '/', label: 'Home' },
                { path: '/browse', label: 'Browse' },
                { path: '/search', label: 'Search' },
              ].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`uppercase tracking-wider text-xs transition-colors duration-300 ${
                    isActive(link.path)
                      ? 'text-blue-800 dark:text-blue-200 font-semibold'
                      : 'text-stone-500 dark:text-stone-400 hover:text-blue-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden md:flex gap-6 items-center">
                {[
                  { path: '/library', label: 'Library' },
                  { path: '/lists', label: 'Lists' },
                  { path: '/chat', label: 'Chat' },
                ].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="uppercase tracking-wider text-xs text-stone-500 dark:text-stone-400 hover:text-blue-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
            
            <button
              onClick={() => { setShowSearch(!showSearch); setTimeout(() => searchRef.current?.focus(), 100) }}
              className="p-2 text-stone-500 dark:text-stone-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-stone-500 dark:text-stone-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <>
                <Link to="/profile" className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                  {(user.email || 'U')[0].toUpperCase()}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-stone-500 dark:text-stone-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h1a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-blue-700 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-5 py-2 text-sm font-semibold rounded-full bg-blue-800 text-white hover:bg-blue-900 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author, or ISBN... (ESC to close)"
                  className="w-full px-5 py-3 pr-12 rounded-full border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-700/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </nav>
    </>
  )
}