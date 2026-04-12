import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchBySubject, searchByAuthor } from '../lib/bookService'
import BookCard from '../components/BookCard'
import BookCardSkeleton from '../components/BookCardSkeleton'

const CATEGORIES = [
  { name: 'Fiction', query: 'fiction', icon: '📖' },
  { name: 'Mystery & Thriller', query: 'mystery', icon: '🔍' },
  { name: 'Romance', query: 'romance', icon: '💕' },
  { name: 'Science Fiction', query: 'science fiction', icon: '🚀' },
  { name: 'Fantasy', query: 'fantasy', icon: '🐉' },
  { name: 'Horror', query: 'horror', icon: '👻' },
  { name: 'Historical Fiction', query: 'historical fiction', icon: '🏛️' },
  { name: 'Biography', query: 'biography', icon: '👤' },
  { name: 'Self-Help', query: 'self-help', icon: '💪' },
  { name: 'Business', query: 'business', icon: '💼' },
  { name: 'History', query: 'history', icon: '📜' },
  { name: 'Science', query: 'science', icon: '🔬' },
  { name: 'Young Adult', query: 'young adult', icon: '📚' },
  { name: "Children's Books", query: 'juvenile fiction', icon: '🧒' },
  { name: 'Poetry', query: 'poetry', icon: '✍️' },
  { name: 'Comics & Graphic Novels', query: 'comics', icon: '💥' },
  { name: 'Cooking', query: 'cooking', icon: '🍳' },
  { name: 'Travel', query: 'travel', icon: '✈️' },
  { name: 'Psychology', query: 'psychology', icon: '🧠' },
  { name: 'Technology', query: 'computers', icon: '💻' },
]

const POPULAR_AUTHORS = [
  { name: 'Stephen King', photo: null },
  { name: 'J.K. Rowling', photo: null },
  { name: 'Agatha Christie', photo: null },
  { name: 'James Patterson', photo: null },
  { name: 'Nora Roberts', photo: null },
  { name: 'Dan Brown', photo: null },
  { name: 'John Grisham', photo: null },
  { name: 'Colleen Hoover', photo: null },
  { name: 'Toni Morrison', photo: null },
  { name: 'George R.R. Martin', photo: null },
  { name: 'Neil Gaiman', photo: null },
  { name: 'Margaret Atwood', photo: null },
]

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

export default function Browse() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState(null)
  const [categoryBooks, setCategoryBooks] = useState([])
  const [loading, setLoading] = useState(false)

  const [activeAuthor, setActiveAuthor] = useState(null)
  const [authorBooks, setAuthorBooks] = useState([])
  const [loadingAuthor, setLoadingAuthor] = useState(false)

  const [language, setLanguage] = useState('')

  useEffect(() => {
    if (!activeCategory) return
    setLoading(true)
    searchBySubject(activeCategory.query, 1, { language })
      .then(data => setCategoryBooks(data.books))
      .catch(() => setCategoryBooks([]))
      .finally(() => setLoading(false))
  }, [activeCategory, language])

  useEffect(() => {
    if (!activeAuthor) return
    setLoadingAuthor(true)
    searchByAuthor(activeAuthor.name, 1, { language })
      .then(data => setAuthorBooks(data.books))
      .catch(() => setAuthorBooks([]))
      .finally(() => setLoadingAuthor(false))
  }, [activeAuthor, language])

  return (
    <div className="w-full px-6 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif italic text-blue-900 dark:text-blue-100 mb-2">Browse Books</h1>
          <p className="text-stone-500 dark:text-stone-400">Explore books by genre or author</p>
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.name} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>

      {/* Categories Section */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setActiveCategory(activeCategory?.name === cat.name ? null : cat)
                setActiveAuthor(null)
              }}
              className={`p-4 rounded-xl border transition text-left ${
                activeCategory?.name === cat.name
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <span className="text-2xl mb-2 block">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Category Books */}
        {activeCategory && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                {activeCategory.icon} {activeCategory.name}
              </h3>
              <Link
                to={`/search?subject=${encodeURIComponent(activeCategory.query)}`}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all →
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : categoryBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categoryBooks.slice(0, 5).map((book) => (
                  <BookCard key={book.id || book.workId} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No books found in this category.</p>
            )}
          </div>
        )}
      </div>

      {/* Popular Authors Section */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Authors</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {POPULAR_AUTHORS.map((author) => (
            <button
              key={author.name}
              onClick={() => {
                setActiveAuthor(activeAuthor?.name === author.name ? null : author)
                setActiveCategory(null)
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeAuthor?.name === author.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {author.name}
            </button>
          ))}
        </div>

        {/* Author Books */}
        {activeAuthor && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Books by {activeAuthor.name}
              </h3>
              <Link
                to={`/search?author=${encodeURIComponent(activeAuthor.name)}`}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all →
              </Link>
            </div>
            {loadingAuthor ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))}
              </div>
            ) : authorBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {authorBooks.slice(0, 5).map((book) => (
                  <BookCard key={book.id || book.workId} book={book} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No books found for this author.</p>
            )}
          </div>
        )}
      </div>

      {/* Browse by Language */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browse by Language</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.filter(l => l.code).map((lang) => (
            <Link
              key={lang.code}
              to={`/search?language=${lang.code}`}
              className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {lang.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
