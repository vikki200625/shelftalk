import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'

export default function Profile() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ library: 0, reviews: 0, discussions: 0, followers: 0, following: 0 })
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchProfile()
    fetchStats()
  }, [user])

  async function fetchProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setDisplayName(data.display_name || '')
    }
    setLoading(false)
  }

  async function fetchStats() {
    const [libraryRes, reviewsRes, discussionsRes, followersRes, followingRes] = await Promise.all([
      supabase.from('user_library').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('reviews').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('discussions').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('user_follows').select('id', { count: 'exact' }).eq('following_id', user.id),
      supabase.from('user_follows').select('id', { count: 'exact' }).eq('follower_id', user.id),
    ])

    setStats({
      library: libraryRes.count || 0,
      reviews: reviewsRes.count || 0,
      discussions: discussionsRes.count || 0,
      followers: followersRes.count || 0,
      following: followingRes.count || 0,
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq('id', user.id)

    setEditing(false)
    fetchProfile()
    setSaving(false)
    showToast('Profile updated!', 'success')
  }

  if (!authLoading && !user) {
    return <Navigate to="/login" />
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-card rounded-2xl p-8 text-center">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">
            {(profile?.display_name || user.email)?.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Name */}
        {editing ? (
          <form onSubmit={handleSave} className="mb-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-xl font-semibold text-center w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-[var(--on-surface)] focus:ring-2 focus:ring-purple-500 outline-none mb-3"
              placeholder="Your display name"
            />
            <div className="flex justify-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-gradient px-4 py-2 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setDisplayName(profile?.display_name || '') }}
                className="text-sm text-[var(--on-surface-variant)] hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-[var(--on-surface)] mb-1">
              {profile?.display_name || 'User'}
            </h1>
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline mb-4"
            >
              Edit name
            </button>
          </>
        )}

        <p className="text-[var(--on-surface-variant)] text-sm mb-6">{user.email}</p>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
          <div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.library}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Books</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.reviews}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.discussions}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Posts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.followers}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Followers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--on-surface)]">{stats.following}</p>
            <p className="text-xs text-[var(--on-surface-variant)]">Following</p>
          </div>
        </div>

        {/* Join date */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
          Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  )
}
