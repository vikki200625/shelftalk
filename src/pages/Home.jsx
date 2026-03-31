import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecentlyViewed, clearRecentlyViewed } from '../lib/recentlyViewed'
import BookCard from '../components/BookCard'

export default function Home() {
  const [query, setQuery] = useState('')
  const [recentlyViewed, setRecentlyViewed] = useState([])
  const navigate = useNavigate()

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Your Next{' '}
          <span className="text-indigo-600 dark:text-indigo-400">Great Read</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          Search millions of books, track your reading, write reviews, and join discussions with fellow book lovers.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full px-5 py-4 pr-14 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recently Viewed</h2>
            <button
              onClick={handleClearRecent}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentlyViewed.map((book) => (
              <BookCard key={book.id || book.workId} book={book} />
            ))}
          </div>
        </div>
      )}

      {/* Features */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto ${recentlyViewed.length > 0 ? 'mt-16' : 'mt-20'}`}>
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Discover Books</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Search millions of titles from Google Books.</p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Track Your Reading</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Build your personal library and track reading progress.</p>
        </div>

        <div className="text-center p-6">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Join Discussions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Share reviews and discuss books with the community.</p>
        </div>
      </div>
    </div>
  )
}
