import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'

const ACHIEVEMENTS_LIST = [
  { name: 'First Book', icon: '📖', desc: 'Complete your first book', requirement: 1, type: 'books' },
  { name: 'Bookworm', icon: '📚', desc: 'Complete 10 books', requirement: 10, type: 'books' },
  { name: 'Bibliophile', icon: '🏛️', desc: 'Complete 50 books', requirement: 50, type: 'books' },
  { name: 'Book Master', icon: '👑', desc: 'Complete 100 books', requirement: 100, type: 'books' },
  { name: 'Page Turner', icon: '📄', desc: 'Read 100 pages', requirement: 100, type: 'pages' },
  { name: 'Chapter Champion', icon: '📑', desc: 'Read 1000 pages', requirement: 1000, type: 'pages' },
  { name: 'Page Master', icon: '📖', desc: 'Read 10000 pages', requirement: 10000, type: 'pages' },
  { name: 'Streak Starter', icon: '🔥', desc: '3 day reading streak', requirement: 3, type: 'streak' },
  { name: 'On Fire', icon: '🔥🔥', desc: '7 day reading streak', requirement: 7, type: 'streak' },
  { name: 'Unstoppable', icon: '🔥🔥🔥', desc: '30 day reading streak', requirement: 30, type: 'streak' },
  { name: 'First Review', icon: '✍️', desc: 'Write your first review', requirement: 1, type: 'reviews' },
  { name: 'Critic', icon: '📝', desc: 'Write 10 reviews', requirement: 10, type: 'reviews' },
  { name: 'Discussion Starter', icon: '💬', desc: 'Start 5 discussions', requirement: 5, type: 'discussions' },
  { name: 'Social Butterfly', icon: '🦋', desc: 'Add 10 friends', requirement: 10, type: 'friends' },
  { name: 'Club Founder', icon: '🏠', desc: 'Create your first book club', requirement: 1, type: 'clubs' },
]

export default function Achievements() {
  const { user } = useAuth()
  const [earnedIds, setEarnedIds] = useState([])
  const [stats, setStats] = useState({
    booksCompleted: 0,
    pagesRead: 0,
    currentStreak: 0,
    reviewsCount: 0,
    discussionsCount: 0,
    friendsCount: 0,
    clubsCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    
    const [
      libraryRes,
      pagesRes,
      streakRes,
      reviewsRes,
      discussionsRes,
      friendsRes,
      clubsRes,
      earnedRes
    ] = await Promise.all([
      supabase.from('user_library').select('id').eq('user_id', user.id).eq('status', 'completed'),
      supabase.from('user_library').select('pages_read').eq('user_id', user.id),
      supabase.from('reading_streaks').select('current_streak').eq('user_id', user.id).single(),
      supabase.from('reviews').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('discussions').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('user_follows').select('id', { count: 'exact' }).eq('follower_id', user.id),
      supabase.from('book_club_members').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id),
    ])

    const totalPages = pagesRes.data?.reduce((sum, b) => sum + (b.pages_read || 0), 0) || 0
    const streak = streakRes.data

    setStats({
      booksCompleted: libraryRes.data?.length || 0,
      pagesRead: totalPages,
      currentStreak: streak?.current_streak || 0,
      reviewsCount: reviewsRes.count || 0,
      discussionsCount: discussionsRes.count || 0,
      friendsCount: friendsRes.count || 0,
      clubsCount: clubsRes.count || 0,
    })

    setEarnedIds(earnedRes.data?.map(a => a.achievement_id) || [])
    setLoading(false)
  }

  function getProgress(achievement) {
    switch (achievement.type) {
      case 'books': return Math.min((stats.booksCompleted / achievement.requirement) * 100, 100)
      case 'pages': return Math.min((stats.pagesRead / achievement.requirement) * 100, 100)
      case 'streak': return Math.min((stats.currentStreak / achievement.requirement) * 100, 100)
      case 'reviews': return Math.min((stats.reviewsCount / achievement.requirement) * 100, 100)
      case 'discussions': return Math.min((stats.discussionsCount / achievement.requirement) * 100, 100)
      case 'friends': return Math.min((stats.friendsCount / achievement.requirement) * 100, 100)
      case 'clubs': return Math.min((stats.clubsCount / achievement.requirement) * 100, 100)
      default: return 0
    }
  }

  function isEarned(achievement, index) {
    const progress = getProgress(achievement)
    return progress >= 100 || earnedIds.includes(index + 1)
  }

  const earnedCount = ACHIEVEMENTS_LIST.filter((a, i) => isEarned(a, i)).length

  if (loading) {
    return (
      <div className="w-full px-6 py-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-stone-200 dark:bg-stone-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-serif italic text-blue-900 dark:text-blue-100">
          🏆 Achievements
        </h1>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          {earnedCount} / {ACHIEVEMENTS_LIST.length}
        </span>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox icon="📚" label="Books" value={stats.booksCompleted} />
        <StatBox icon="📖" label="Pages" value={stats.pagesRead.toLocaleString()} />
        <StatBox icon="🔥" label="Streak" value={`${stats.currentStreak} days`} />
        <StatBox icon="✍️" label="Reviews" value={stats.reviewsCount} />
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ACHIEVEMENTS_LIST.map((achievement, index) => {
          const earned = isEarned(achievement, index)
          const progress = getProgress(achievement)
          
          return (
            <div
              key={index}
              className={`relative p-5 rounded-2xl border-2 transition-all ${
                earned
                  ? 'bg-gradient-to-br from-blue-50 to-amber-50 dark:from-blue-900/30 dark:to-amber-900/30 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700'
              }`}
            >
              {/* Lock overlay */}
              {!earned && (
                <div className="absolute inset-0 bg-white/50 dark:bg-stone-800/50 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl opacity-30">🔒</span>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <h3 className={`font-semibold text-sm mb-1 ${earned ? 'text-blue-900 dark:text-blue-100' : 'text-stone-600 dark:text-stone-400'}`}>
                  {achievement.name}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                  {achievement.desc}
                </p>
                
                {/* Progress bar */}
                <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${earned ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {Math.round(progress)}%
                </p>
              </div>

              {/* Earned badge */}
              {earned && (
                <div className="absolute -top-2 -right-2 text-2xl">✅</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Motivational Message */}
      <div className="mt-12 text-center p-6 bg-gradient-to-r from-blue-50 to-amber-50 dark:from-blue-900/20 dark:to-amber-900/20 rounded-2xl">
        <p className="text-lg text-stone-700 dark:text-stone-300">
          {earnedCount === ACHIEVEMENTS_LIST.length
            ? '🎉 Amazing! You\'ve earned ALL achievements! You are a true book master!'
            : earnedCount >= 10
            ? '🚀 Great progress! You\'re on your way to becoming a book legend!'
            : '💪 Keep reading! Every book brings you closer to the next achievement!'
          }
        </p>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value }) {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl p-4 text-center shadow-sm">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
    </div>
  )
}