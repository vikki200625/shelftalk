import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function BookClubs() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [clubs, setClubs] = useState([])
  const [myClubs, setMyClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    cover_type: 'fantasy'
  })

  const COVER_TYPES = [
    { id: 'fantasy', label: 'Fantasy', emoji: '🐲' },
    { id: 'mystery', label: 'Mystery', emoji: '🔍' },
    { id: 'romance', label: 'Romance', emoji: '💕' },
    { id: 'scifi', label: 'Sci-Fi', emoji: '🚀' },
    { id: 'classic', label: 'Classics', emoji: '📚' },
    { id: 'thriller', label: 'Thriller', emoji: '😱' },
  ]

  useEffect(() => {
    if (user) {
      fetchClubs()
    }
  }, [user])

  async function fetchClubs() {
    setLoading(true)
    
    const [allClubsRes, myClubsRes] = await Promise.all([
      supabase.from('book_clubs').select('*').order('created_at', { ascending: false }),
      supabase.from('book_club_members')
        .select('*, club:book_clubs(*)')
        .eq('user_id', user.id)
    ])

    setClubs(allClubsRes.data || [])
    setMyClubs(myClubsRes.data?.map(m => m.club).filter(Boolean) || [])
    setLoading(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)

    console.log('Creating club with:', { name: newClub.name, description: newClub.description, cover_type: newClub.cover_type, created_by: user.id })

    const { data, error } = await supabase
      .from('book_clubs')
      .insert({
        name: newClub.name,
        description: newClub.description || null,
        cover_type: newClub.cover_type,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Club error:', error)
      console.error('Error details:', JSON.stringify(error))
      showToast(error.message || 'Error creating club', 'error')
      setCreating(false)
      return
    }

    console.log('Club created:', data) else {
      await supabase
        .from('book_club_members')
        .insert({
          club_id: data.id,
          user_id: user.id,
          role: 'admin'
        })

      showToast('Club created! 🎉', 'success')
      setShowCreate(false)
      fetchClubs()
    }
    setCreating(false)
  }

  async function joinClub(clubId) {
    const { error } = await supabase
      .from('book_club_members')
      .insert({
        club_id: clubId,
        user_id: user.id,
        role: 'member'
      })

    if (!error) {
      showToast('Joined club! 📚', 'success')
      fetchClubs()
    }
  }

  async function leaveClub(clubId) {
    const { error } = await supabase
      .from('book_club_members')
      .delete()
      .eq('club_id', clubId)
      .eq('user_id', user.id)

    if (!error) {
      showToast('Left club', 'info')
      fetchClubs()
    }
  }

  if (!user) return <Navigate to="/login" />

  const isMember = (clubId) => myClubs.some(c => c.id === clubId)

  return (
    <div className="w-full px-6 py-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif italic text-blue-900 dark:text-blue-100 mb-2">
            📖 Book Clubs
          </h1>
          <p className="text-stone-500 dark:text-stone-400">
            Join reading groups and read together!
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-6 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
        >
          {showCreate ? 'Cancel' : '+ Create Club'}
        </button>
      </div>

      {/* Create Club Form */}
      {showCreate && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Create a Book Club
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Club Name
              </label>
              <input
                type="text"
                value={newClub.name}
                onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                placeholder="e.g., Fantasy Lovers"
                required
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Description
              </label>
              <textarea
                value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                placeholder="What will your club read?"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Genre/Vibe
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {COVER_TYPES.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNewClub({ ...newClub, cover_type: type.id })}
                    className={`p-3 rounded-lg text-center ${
                      newClub.cover_type === type.id
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                        : 'bg-stone-100 dark:bg-stone-700 border-2 border-transparent'
                    }`}
                  >
                    <div className="text-2xl">{type.emoji}</div>
                    <div className="text-xs">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Club'}
            </button>
          </form>
        </div>
      )}

      {/* My Clubs */}
      {myClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
            🏠 My Clubs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myClubs.map(club => (
              <ClubCard 
                key={club.id} 
                club={club} 
                isMember={true}
                onJoin={() => {}}
                onLeave={() => leaveClub(club.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Clubs */}
      <div>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
          🔍 Discover Clubs
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-40 bg-stone-200 dark:bg-stone-700 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : clubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map(club => (
              <ClubCard 
                key={club.id} 
                club={club} 
                isMember={isMember(club.id)}
                onJoin={() => joinClub(club.id)}
                onLeave={() => leaveClub(club.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-stone-500 py-12">
            No clubs yet. Be the first to create one! 🎉
          </p>
        )}
      </div>
    </div>
  )
}

function ClubCard({ club, isMember, onJoin, onLeave }) {
  const getCover = (type) => {
    const covers = {
      fantasy: '🐲 Fantasy Realm',
      mystery: '🔍 Mystery Readers',
      romance: '💕 Love Books',
      scifi: '🚀 Sci-Fi Squad',
      classic: '📚 Classic Club',
      thriller: '😱 Chill Seekers',
    }
    return covers[type] || '📖 Book Club'
  }

  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm">
      <div className={`h-24 flex items-center justify-center ${
        club.cover_type === 'fantasy' ? 'bg-gradient-to-r from-purple-600 to-blue-600' :
        club.cover_type === 'mystery' ? 'bg-gradient-to-r from-gray-600 to-slate-600' :
        club.cover_type === 'romance' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
        club.cover_type === 'scifi' ? 'bg-gradient-to-r from-cyan-600 to-blue-600' :
        club.cover_type === 'classic' ? 'bg-gradient-to-r from-amber-600 to-yellow-600' :
        'bg-gradient-to-r from-red-600 to-orange-600'
      }`}>
        <span className="text-white text-xl font-semibold px-4 text-center">
          {getCover(club.cover_type)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">
          {club.name}
        </h3>
        <p className="text-sm text-stone-500 mb-3 line-clamp-2">
          {club.description || 'No description yet'}
        </p>
        {isMember ? (
          <button
            onClick={onLeave}
            className="w-full py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600"
          >
            Leave Club
          </button>
        ) : (
          <button
            onClick={onJoin}
            className="w-full py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            Join Club
          </button>
        )}
      </div>
    </div>
  )
}