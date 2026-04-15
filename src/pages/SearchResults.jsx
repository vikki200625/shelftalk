import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchBooks } from '../lib/bookService'
import BookCard from '../components/BookCard'
import BookCardSkeleton from '../components/BookCardSkeleton'

const TAGS = [
  { name: 'All', query: '' },
  { name: 'Fiction', query: 'fiction' },
  { name: 'Mystery', query: 'mystery' },
  { name: 'Thriller', query: 'thriller' },
  { name: 'Romance', query: 'romance' },
  { name: 'Sci-Fi', query: 'science fiction' },
  { name: 'Fantasy', query: 'fantasy' },
  { name: 'Horror', query: 'horror' },
  { name: 'Biography', query: 'biography' },
  { name: 'Self-Help', query: 'self-help' },
  { name: 'Business', query: 'business' },
  { name: 'History', query: 'history' },
  { name: 'Science', query: 'science' },
  { name: 'Young Adult', query: 'young adult' },
  { name: "Children", query: 'juvenile fiction' },
  { name: 'Poetry', query: 'poetry' },
  { name: 'Comics', query: 'comics' },
  { name: 'Cooking', query: 'cooking' },
  { name: 'Travel', query: 'travel' },
  { name: 'Psychology', query: 'psychology' },
  { name: 'Religion', query: 'religion' },
  { name: 'Philosophy', query: 'philosophy' },
  { name: 'Sports', query: 'sports' },
  { name: 'Art', query: 'art' },
  { name: 'Music', query: 'music' },
  { name: 'Health', query: 'health' },
  { name: 'Politics', query: 'political science' },
  { name: 'Law', query: 'law' },
  { name: 'Education', query: 'education' },
  { name: 'Nature', query: 'nature' },
  { name: 'Gardening', query: 'gardening' },
]

const CATEGORIES = TAGS

const LANGUAGES = [
  { code: '', name: 'All Languages' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
]

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const subjectParam = searchParams.get('subject') || ''
  const authorParam = searchParams.get('author') || ''
  const languageParam = searchParams.get('language') || ''
  const orderByParam = searchParams.get('orderBy') || 'relevance'

  const [results, setResults] = useState({ total: 0, books: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState(query)
  const [showFilters, setShowFilters] = useState(false)

  const [subject, setSubject] = useState(subjectParam)
  const [author, setAuthor] = useState(authorParam)
  const [language, setLanguage] = useState(languageParam)
  const [orderBy, setOrderBy] = useState(orderByParam)

  useEffect(() => {
    setSubject(subjectParam)
    setAuthor(authorParam)
    setLanguage(languageParam)
    setOrderBy(orderByParam)
    setSearchInput(query)
  }, [subjectParam, authorParam, languageParam, orderByParam, query])

  useEffect(() => {
    if (!query && !subject && !author && !language) return

    setLoading(true)
    setError(null)

    const filters = {}
    if (subject) filters.subject = subject
    if (author) filters.author = author
    if (language) filters.language = language
    if (orderBy) filters.orderBy = orderBy

    searchBooks(query, page, filters)
      .then(setResults)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [query, page, subject, author, language, orderBy])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchInput.trim()) params.q = searchInput.trim()
    if (subject) params.subject = subject
    if (author) params.author = author
    if (language) params.language = language
    if (orderBy && orderBy !== 'relevance') params.orderBy = orderBy
    params.page = '1'
    setSearchParams(params)
  }

  const handleFilterChange = (key, value) => {
    const params = {}
    if (searchInput.trim()) params.q = searchInput.trim()
    if (key === 'subject' ? value : subject) params.subject = key === 'subject' ? value : subject
    if (key === 'author' ? value : author) params.author = key === 'author' ? value : author
    if (key === 'language' ? value : language) params.language = key === 'language' ? value : language
    if (key === 'orderBy' ? value : orderBy !== 'relevance') params.orderBy = key === 'orderBy' ? value : orderBy
    params.page = '1'
    setSearchParams(params)
  }

  const handlePageChange = (newPage) => {
    const params = {}
    if (query) params.q = query
    if (subject) params.subject = subject
    if (author) params.author = author
    if (language) params.language = language
    if (orderBy && orderBy !== 'relevance') params.orderBy = orderBy
    params.page = newPage.toString()
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSubject('')
    setAuthor('')
    setLanguage('')
    setOrderBy('relevance')
    const params = {}
    if (query) params.q = query
    setSearchParams(params)
  }

  const hasFilters = subject || author || language || orderBy !== 'relevance'
  const totalPages = Math.ceil(results.total / 20)

  return (
    <div className="w-full px-6 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 max-w-2xl">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, author, or keyword..."
            className="w-full px-5 py-3 pr-14 rounded-lg border border-gray-300 dark:border-gray-600 bg-[var(--surface)] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 p-4 bg-[var(--surface-container-high)] rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Category</label>
            <select
              value={subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.query}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onBlur={(e) => handleFilterChange('author', e.target.value)}
              placeholder="Author name..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-blue-700/20 outline-none"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.name} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--on-surface-variant)] mb-1">Sort By</label>
            <select
              value={orderBy}
              onChange={(e) => handleFilterChange('orderBy', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Header */}
      {(query || subject || author) && (
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {loading ? 'Searching...' : (
            <>
              {query && `Results for "${query}"`}
              {subject && !query && `Books in ${CATEGORIES.find(c => c.query === subject)?.name || subject}`}
              {author && !query && !subject && `Books by ${author}`}
              {hasFilters && (
                <span className="text-sm text-[var(--on-surface-variant)] font-normal ml-2">
                  (filtered)
                </span>
              )}
              {!loading && results.total > 0 && (
                <span className="text-[var(--on-surface-variant)] font-normal text-base ml-2">
                  ({results.total.toLocaleString()} books found)
                </span>
              )}
            </>
          )}
        </h1>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.books.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.books.map((book) => (
              <BookCard key={book.id || book.workId} book={book} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && (query || subject || author) && results.books.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[var(--on-surface-variant)] text-lg">No books found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different search or adjust your filters</p>
        </div>
      )}

      {/* No Query State */}
      {!query && !subject && !author && !language && !loading && (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-[var(--on-surface-variant)] text-lg">Search for books</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Enter a search term or use filters to find books</p>
        </div>
      )}
    </div>
  )
}
