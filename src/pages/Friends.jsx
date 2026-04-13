import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function Friends() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFriends()
      fetchRequests()
    }
  }, [user])

  async function fetchFriends() {
    const { data } = await supabase
      .from('user_follows')
      .select(`
        *,
        follower:profiles!user_follows_follower_id_fkey(id, display_name, avatar_url),
        following:profiles!user_follows_following_id_fkey(id, display_name, avatar_url)
      `)
      .eq('follower_id', user.id)

    setFriends(data || [])
    setLoading(false)
  }

  async function fetchRequests() {
    const { data, error } = await supabase
      .from('friend_requests_with_profiles')
      .select('*')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    console.log('requests data:', data)
    console.log('requests error:', error)

    setRequests(data || [])
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .ilike('display_name', `%${searchQuery}%`)
      .neq('id', user.id)
      .limit(10)

    setSearchResults(data || [])
    setSearching(false)
  }

  async function sendFriendRequest(profileId) {
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: user.id,
        receiver_id: profileId,
        status: 'pending'
      })

    if (error) {
      console.error('Error sending friend request:', error)
      showToast('Failed to send request: ' + error.message, 'error')
      return
    }

    showToast('Friend request sent!', 'success')
    setSearchResults(prev => prev.filter(p => p.id !== profileId))
  }

  async function acceptRequest(requestId, senderId) {
    await Promise.all([
      supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId),
      supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: senderId
        }),
      supabase
        .from('user_follows')
        .insert({
          follower_id: senderId,
          following_id: user.id
        })
    ])

    showToast('Friend added! 🎉', 'success')
    fetchFriends()
    fetchRequests()
  }

  async function declineRequest(requestId) {
    await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)

    fetchRequests()
  }

  if (!user) return <Navigate to="/login" />

  return (
    <div className="w-full px-6 py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-serif italic text-blue-900 dark:text-blue-100 mb-2">
        Friends
      </h1>
      <p className="text-stone-500 dark:text-stone-400 mb-8">Connect with fellow readers</p>

      {/* Search Users */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          🔍 Find Friends
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name..."
            className="flex-1 px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map(profile => (
              <div key={profile.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold">
                    {(profile.display_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {profile.display_name || 'Anonymous'}
                  </span>
                </div>
                <button
                  onClick={() => sendFriendRequest(profile.id)}
                  className="px-4 py-1 text-sm bg-blue-700 text-white rounded-full hover:bg-blue-800"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            📩 Friend Requests ({requests.length})
          </h2>
          <div className="space-y-2">
            {requests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-700 flex items-center justify-center text-white font-bold">
                    {(req.sender_display_name || '?')[0].toUpperCase()}
                  </div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">
                    {req.sender_display_name || 'Anonymous'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequest(req.id, req.sender_id)}
                    className="px-4 py-1 text-sm bg-green-700 text-white rounded-full hover:bg-green-800"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => declineRequest(req.id)}
                    className="px-4 py-1 text-sm bg-stone-500 text-white rounded-full hover:bg-stone-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
          👥 Your Friends ({friends.length})
        </h2>
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {friends.map(friend => {
              const friendProfile = friend.following || friend.follower
              return (
                <div 
                  key={friend.id} 
                  className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-700 rounded-lg"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg">
                    {(friendProfile?.display_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {friendProfile?.display_name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-stone-500">Friend</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-stone-500 py-8">
            No friends yet. Search for someone to add! 🔍
          </p>
        )}
      </div>
    </div>
  )
}