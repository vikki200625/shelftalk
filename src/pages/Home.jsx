import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getRecentlyViewed, clearRecentlyViewed } from '../lib/recentlyViewed'
import { useAuth } from '../contexts/AuthContext'
import BookCard from '../components/BookCard'

export default function Home() {
  const [query, setQuery] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed())
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleClearRecent = () => {
    clearRecentlyViewed()
    setRecentlyViewed([])
  }

  return (
    <main className="flex-grow">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl italic text-[var(--old-oak)] dark:text-[var(--on-surface)] leading-tight tracking-tight mb-8">
            Discover Your Next <br/> Great Read
          </h1>
          
          <div className="w-full max-w-2xl relative mb-12">
            <form onSubmit={handleSearch} className="bg-[var(--surface-container-high)] dark:bg-[var(--surface-container-high)] rounded-full px-6 py-4 flex items-center shadow-sm group focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition-all border border-[var(--outline-variant)]">
              <svg className="w-5 h-5 text-[var(--on-surface-variant)] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="bg-transparent border-none focus:ring-0 w-full text-[var(--on-surface)] dark:text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] font-body"
              />
              <button type="submit" className="p-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--old-oak)] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={() => navigate(user ? '/library' : '/signup')}
              className="px-10 py-4 bg-[var(--primary)] text-white rounded-full font-medium hover:scale-95 transition-all shadow-lg hover:bg-[var(--old-oak)]"
            >
              {user ? 'Go to My Library' : 'Join the Community'}
            </button>
            <Link 
              to="/browse"
              className="px-10 py-4 text-[var(--primary)] font-medium hover:bg-[var(--surface-container-low)] dark:hover:bg-[var(--surface-container-high)] rounded-full transition-all border border-[var(--primary)]"
            >
              Browse Books
            </Link>
          </div>
        </div>
        
        {/* Asymmetric background elements */}
        <div className="absolute -right-20 top-20 w-96 h-96 bg-[var(--surface-container-low)] dark:bg-[var(--surface-container-high)] rounded-full blur-3xl -z-0"></div>
        <div className="absolute -left-20 bottom-0 w-80 h-80 bg-[var(--vintage-rose)]/20 dark:bg-[var(--vintage-rose)]/10 rounded-full blur-3xl -z-0"></div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="py-20 bg-[var(--surface-container-low)] dark:bg-[var(--surface-container)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="uppercase tracking-widest text-xs text-[var(--on-surface-variant)] font-semibold mb-2 block">Your History</span>
                <h2 className="font-serif text-4xl text-[var(--on-surface)] dark:text-[var(--on-surface)]">Recently Viewed</h2>
              </div>
              <button
                onClick={handleClearRecent}
                className="text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] dark:hover:text-[var(--on-surface)] transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="flex gap-8 overflow-x-auto pb-8 snap-x" style={{ scrollbarWidth: 'none' }}>
              {recentlyViewed.map((book) => (
                <div key={book.id || book.workId} className="flex-none w-48 snap-start">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Discover', desc: 'Search millions of books from Google Books & Open Library' },
              { icon: '📚', title: 'Track', desc: 'Build your library and track reading progress' },
              { icon: '💬', title: 'Connect', desc: 'Join discussions and follow fellow readers' }
            ].map((feature, i) => (
              <div key={i} className="text-center p-8 border border-[var(--outline-variant)] rounded-2xl bg-[var(--surface)]">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-serif text-xl text-[var(--on-surface)] dark:text-[var(--on-surface)] mb-2">{feature.title}</h3>
                <p className="text-[var(--on-surface-variant)] dark:text-[var(--on-surface-variant)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}