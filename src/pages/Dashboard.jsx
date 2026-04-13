import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'
import { Link } from 'react-router-dom'

const ACHIEVEMENTS = [
  { name: 'First Book', icon: '📖', desc: 'Completed your first book' },
  { name: 'Bookworm', icon: '📚', desc: 'Completed 10 books' },
  { name: 'Bibliophile', icon: '🏛️', desc: 'Completed 50 books' },
  { name: 'Page Turner', icon: '📄', desc: 'Read 100 pages' },
  { name: 'Streak Starter', icon: '🔥', desc: '3 day streak' },
  { name: 'On Fire', icon: '🔥', desc: '7 day streak' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    completedThisYear: 0,
    pagesRead: 0,
    currentStreak: 0,
    longestStreak: 0,
    reviews: 0,
    discussions: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [yearlyGoal] = useState(20)

  useEffect(() => {
    if (!user) return
    fetchDashboardData()
  }, [user])

  async function fetchDashboardData() {
    setLoading(true)

    const [
      libraryRes,
      pagesRes,
      streakRes,
      reviewsRes,
      discussionsRes,
      activityRes,
    ] = await Promise.all([
      supabase.from('user_library').select('id, status').eq('user_id', user.id),
      supabase.from('user_library').select('pages_read').eq('user_id', user.id),
      supabase.from('reading_streaks').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('reviews').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('discussions').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('user_library')
        .select('*, books(*)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

    const library = libraryRes.data || []
    const totalPages = (pagesRes.data || []).reduce((sum, b) => sum + (b.pages_read || 0), 0)
    const streak = streakRes.data

    setStats({
      totalBooks: library.length,
      completedThisYear: library.filter(b => b.status === 'completed').length,
      pagesRead: totalPages ?? 0,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      reviews: reviewsRes.count || 0,
      discussions: discussionsRes.count || 0,
    })

    setRecentActivity(activityRes.data || [])
    setLoading(false)
  }

  const progressPercent = Math.min((stats.completedThisYear / yearlyGoal) * 100, 100)

  if (loading) {
    return (
      <div className="w-full px-6 py-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-stone-200 dark:bg-stone-700 rounded-xl" />
            ))}
          </div>
          <div className="h-32 bg-stone-200 dark:bg-stone-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif italic text-blue-900 dark:text-blue-100 mb-2">
        Your Reading Dashboard
      </h1>
      <p className="text-stone-500 dark:text-stone-400 mb-8">Track your literary journey</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="📚"
          label="Total Books"
          value={stats.totalBooks}
        />
        <StatCard
          icon="✅"
          label="Completed This Year"
          value={stats.completedThisYear}
        />
        <StatCard
          icon="📖"
          label="Pages Read"
          value={(stats.pagesRead || 0).toLocaleString()}
        />
        <StatCard
          icon="🔥"
          label="Current Streak"
          value={`${stats.currentStreak} days`}
        />
      </div>

      {/* Yearly Goal Progress */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
            📖 Reading Goal {new Date().getFullYear()}
          </h2>
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            {stats.completedThisYear} / {yearlyGoal} books
          </span>
        </div>
        <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-800 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-stone-500 mt-2">
          {progressPercent >= 100
            ? '🎉 Goal achieved! Amazing! 🎉'
            : `${yearlyGoal - stats.completedThisYear} more books to reach your goal`
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Achievements Preview */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              🏆 Achievements
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {ACHIEVEMENTS.slice(0, 6).map((achievement, i) => (
              <div
                key={i}
                className={`text-center p-3 rounded-xl ${
                  i < Math.min(stats.completedThisYear, 6)
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'bg-stone-100 dark:bg-stone-700 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                  {achievement.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              📊 Recent Activity
            </h2>
            <Link to="/library" className="text-sm text-blue-600 hover:underline">
              View library
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50 dark:bg-stone-700">
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0">
                    {item.books?.cover_url ? (
                      <img src={item.books.cover_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-300 dark:bg-stone-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                      {item.books?.title || 'Unknown'}
                    </p>
                    <p className="text-xs capitalize text-stone-500">
                      {item.status?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">
              No recent activity. Start reading! 📚
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <QuickStat label="Reviews" value={stats.reviews} />
        <QuickStat label="Discussions" value={stats.discussions} />
        <QuickStat label="Longest Streak" value={`${stats.longestStreak} days`} />
        <QuickStat label="Reading Level" value={getReadingLevel(stats.completedThisYear)} />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl p-4 shadow-sm">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
    </div>
  )
}

function QuickStat({ label, value }) {
  return (
    <div className="text-center p-4 bg-stone-50 dark:bg-stone-800 rounded-xl">
      <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
    </div>
  )
}

function getReadingLevel(books) {
  if (books >= 100) return '📚 Master'
  if (books >= 50) return '🏛️ Expert'
  if (books >= 20) return '📖 Avid Reader'
  if (books >= 10) return '📕 Regular'
  if (books >= 5) return '📗 Growing'
  return '📙 Beginner'
}