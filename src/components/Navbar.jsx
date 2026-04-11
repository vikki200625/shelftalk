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

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/search', label: 'Search' },
  ]

  const userLinks = [
    { path: '/library', label: 'Library' },
    { path: '/lists', label: 'Lists' },
    { path: '/chat', label: 'Chat' },
    { path: '/profile', label: 'Profile' },
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[var(--bg-cream)]/95 dark:bg-[var(--bg-cream)]/95 backdrop-blur-xl border-b border-[var(--border-warm)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-rust)] to-[var(--accent-gold)] flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
                S
              </div>
              <span className="text-xl font-bold font-[var(--font-display)] text-[var(--text-richer)] hidden sm:block">
                ShelfTalk
              </span>
            </Link>

            {/* Center Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'text-[var(--accent-rust)] bg-[var(--accent-rust)]/10'
                      : 'text-[var(--text-warm)] hover:text-[var(--accent-rust)] hover:bg-[var(--accent-rust)]/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => { setShowSearch(!showSearch); setTimeout(() => searchRef.current?.focus(), 100) }}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-rust)] hover:bg-[var(--accent-rust)]/5 transition-all"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {user ? (
                <>
                  <div className="hidden lg:flex items-center gap-1">
                    {userLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive(link.path)
                            ? 'text-[var(--accent-rust)] bg-[var(--accent-rust)]/10'
                            : 'text-[var(--text-warm)] hover:text-[var(--accent-rust)] hover:bg-[var(--accent-rust)]/5'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                  
                  {/* User Avatar */}
                  <Link to="/profile" className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-rust)] flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow">
                    {(user.email || 'U')[0].toUpperCase()}
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 transition-all"
                    aria-label="Logout"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h1a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-[var(--text-warm)] hover:text-[var(--accent-rust)] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-[var(--accent-rust)] to-[var(--accent-deep)] text-white shadow-md hover:shadow-lg hover:shadow-[var(--accent-rust)]/20 transition-all hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-rust)] hover:bg-[var(--accent-rust)]/5 transition-all"
                aria-label="Toggle theme"
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

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg text-[var(--text-warm)]"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar Expand */}
        <div className={`overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books by title, author, or ISBN... (ESC to close)"
                  className="w-full px-5 py-3 pr-12 rounded-xl border border-[var(--border-warm)] bg-[var(--bg-card)] text-[var(--text-richer)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-rust)] focus:ring-2 focus:ring-[var(--accent-rust)]/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[var(--accent-rust)] text-white hover:bg-[var(--accent-deep)] transition-colors"
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