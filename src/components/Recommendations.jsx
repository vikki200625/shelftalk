import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'
import { searchBooks } from '../lib/bookService'
import BookCard from './BookCard'

export default function Recommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchRecommendations()
  }, [user])

  async function fetchRecommendations() {
    setLoading(true)

    const { data: library } = await supabase
      .from('user_library')
      .select('books(subjects)')
      .eq('user_id', user.id)
      .limit(20)

    if (!library || library.length === 0) {
      setLoading(false)
      return
    }

    const allSubjects = library.flatMap(item => item.books?.subjects || [])
    const subjectCounts = {}
    allSubjects.forEach(s => {
      const clean = s.toLowerCase().trim()
      if (clean.length > 2) {
        subjectCounts[clean] = (subjectCounts[clean] || 0) + 1
      }
    })

    const topGenres = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre)

    if (topGenres.length === 0) {
      setLoading(false)
      return
    }

    const randomGenre = topGenres[Math.floor(Math.random() * topGenres.length)]
    setGenre(randomGenre)

    try {
      const results = await searchBooks(randomGenre, 1)

      const libraryBookKeys = new Set(
        library.map(item => item.books?.open_library_key).filter(Boolean)
      )

      const filtered = results.books
        .filter(book => !libraryBookKeys.has(book.id) && !libraryBookKeys.has(book.workId))
        .slice(0, 5)

      setRecommendations(filtered)
    } catch {
      setRecommendations([])
    }

    setLoading(false)
  }

  if (!user || (recommendations.length === 0 && !loading)) {
    return null
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h2>
        {genre && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Based on: {genre}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendations.map((book) => (
            <BookCard key={book.id || book.workId} book={book} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
