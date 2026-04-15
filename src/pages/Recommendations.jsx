import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { searchBooks } from '../lib/bookService'
import supabase from '../lib/supabase'
import BookCard from '../components/BookCard'
import { Link } from 'react-router-dom'

export default function Recommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState([])
  const [basedOn, setBasedOn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mood, setMood] = useState(null)

  const MOODS = [
    { id: 'adventurous', label: '🌟 Adventurous', desc: 'Epic journeys & fantasies' },
    { id: 'mysterious', label: '🔍 Mysterious', desc: 'Thrillers & puzzles' },
    { id: 'romantic', label: '💕 Romantic', desc: 'Love stories & drama' },
    { id: 'thoughtful', label: '🧠 Thoughtful', desc: 'Philosophy & classics' },
    { id: 'exciting', label: '⚡ Exciting', desc: 'Action & adventure' },
    { id: 'cozy', label: '☕ Cozy', desc: 'Comfort reads & escapes' },
  ]

  useEffect(() => {
    if (user) {
      fetchUserPreferences()
    }
  }, [user])

  useEffect(() => {
    if (mood) {
      fetchRecommendationsByMood(mood)
    }
  }, [mood])

  async function fetchUserPreferences() {
    setLoading(true)
    
    const { data: library } = await supabase
      .from('user_library')
      .select('*, books(categories)')
      .eq('user_id', user.id)

    if (library?.length > 0) {
      const genres = {}
      library.forEach(item => {
        const cats = item.books?.categories || []
        cats.forEach(cat => {
          genres[cat] = (genres[cat] || 0) + 1
        })
      })

      const topGenre = Object.keys(genres).reduce((a, b) => 
        genres[a] > genres[b] ? a : b, Object.keys(genres)[0])

      setBasedOn(topGenre)
      fetchRecommendationsByGenre(topGenre)
    } else {
      setBasedOn('popular')
      fetchRecommendationsByGenre('bestseller')
    }
  }

  async function fetchRecommendationsByGenre(genre) {
    try {
      const result = await searchBooks('', 1, { subject: genre })
      setRecommendations(result.books?.slice(0, 8) || [])
    } catch (err) {
      setRecommendations([])
    }
    setLoading(false)
  }

  async function fetchRecommendationsByMood(moodId) {
    setLoading(true)
    const moodSubjects = {
      adventurous: ['fantasy', 'adventure'],
      mysterious: ['thriller', 'mystery'],
      romantic: ['romance', 'young adult'],
      thoughtful: ['philosophy', 'classics'],
      exciting: ['action', 'adventure'],
      cozy: ['cozy mystery', 'humor'],
    }

    const subjects = moodSubjects[moodId] || ['fiction']
    
    try {
      const results = await Promise.all(
        subjects.slice(0, 2).map(subj => searchBooks('', 1, { subject: subj }))
      )
      
      const allBooks = results.flatMap(r => r.books || [])
      const unique = [...new Map(allBooks.map(b => [b.id, b])).values()]
      setRecommendations(unique.slice(0, 8))
    } catch (err) {
      setRecommendations([])
    }
    setLoading(false)
  }

  const moodBased = mood !== null

  return (
    <div className="w-full px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif italic text-[var(--old-oak)] dark:text-[var(--on-surface)] mb-2">
        📚 Recommendations
      </h1>
      <p className="text-stone-500 dark:text-stone-400 mb-8">
        {basedOn 
          ? `Because you read ${basedOn} books` 
          : 'Discover your next great read'
        }
      </p>

      {/* Mood Selector */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          How are you feeling today? 🎭
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                mood === m.id 
                  ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500' 
                  : 'bg-stone-50 dark:bg-stone-700 border-2 border-transparent hover:border-blue-300'
              }`}
            >
              <div className="font-medium text-stone-900 dark:text-stone-100">{m.label}</div>
              <div className="text-sm text-stone-500">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* For You Section */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {moodBased ? '🎭 Matches Your Mood' : '📖 Recommended For You'}
          </h2>
          <Link 
            to="/browse" 
            className="text-sm text-blue-600 hover:underline"
          >
            Browse all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-stone-200 dark:bg-stone-700 rounded-lg mb-2"></div>
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone-500 py-8">
            No recommendations yet. Browse some books first! 📚
          </p>
        )}
      </div>

      {/* More Suggestions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">
            🔥 Trending Now
          </h3>
          <div className="space-y-2">
            {['bestseller', 'new releases', 'award winners'].map(term => (
              <Link 
                key={term}
                to={`/search?q=${term}`}
                className="block p-3 bg-stone-50 dark:bg-stone-700 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                {term.charAt(0).toUpperCase() + term.slice(1)}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-4">
            🎯 Categories You Love
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Thriller'].map(cat => (
              <Link
                key={cat}
                to={`/search?q=&subject=${cat.toLowerCase()}`}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900/70"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}