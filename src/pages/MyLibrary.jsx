import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'
import ReadingGoal from '../components/ReadingGoal'
import LibraryItemSkeleton from '../components/LibraryItemSkeleton'

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
]

const STATUS_LABELS = {
  want_to_read: 'Want to Read',
  reading: 'Reading',
  completed: 'Completed',
  dropped: 'Dropped',
}

export default function MyLibrary() {
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [editingNotes, setEditingNotes] = useState(null)
  const [notesText, setNotesText] = useState('')

  useEffect(() => {
    if (!user) return
    fetchLibrary()
  }, [user, activeTab])

  async function fetchLibrary() {
    setLoading(true)

    let query = supabase
      .from('user_library')
      .select('*, books(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (activeTab !== 'all') {
      query = query.eq('status', activeTab)
    }

    const { data } = await query
    setBooks(data || [])
    setLoading(false)
  }

  async function handleStatusChange(bookId, newStatus) {
    const updates = { status: newStatus, updated_at: new Date().toISOString() }

    if (newStatus === 'reading') {
      updates.started_at = new Date().toISOString()
    }
    if (newStatus === 'completed') {
      updates.finished_at = new Date().toISOString()
    }

    await supabase
      .from('user_library')
      .update(updates)
      .eq('user_id', user.id)
      .eq('book_id', bookId)

    showToast('Status updated!', 'success')
    fetchLibrary()
  }

  async function handleRemove(bookId) {
    await supabase
      .from('user_library')
      .delete()
      .eq('user_id', user.id)
      .eq('book_id', bookId)

    showToast('Book removed from library', 'success')
    fetchLibrary()
  }

  async function handleSaveNotes(bookId) {
    await supabase
      .from('user_library')
      .update({ notes: notesText, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('book_id', bookId)

    setEditingNotes(null)
    showToast('Notes saved!', 'success')
    fetchLibrary()
  }

  function startEditingNotes(item) {
    setEditingNotes(item.id)
    setNotesText(item.notes || '')
  }

  if (!authLoading && !user) {
    return <Navigate to="/login" />
  }

  if (authLoading) {
    return (
      <div className="w-full px-4 py-12">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LibraryItemSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Library</h1>

      {/* Reading Goal */}
      <ReadingGoal />

      {/* Tabs */}
      <div className="flex gap-1 mb-8 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <LibraryItemSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            {activeTab === 'all' ? 'Your library is empty' : `No "${STATUS_LABELS[activeTab]}" books`}
          </p>
          <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
            Search for books to add
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-700 transition">
              <div className="flex gap-4 p-4">
                <Link to={`/book/${item.books.open_library_key}`} className="flex-shrink-0">
                  {item.books.cover_url ? (
                    <img
                      src={item.books.cover_url}
                      alt={item.books.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/book/${item.books.open_library_key}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition truncate">
                      {item.books.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{item.books.author || 'Unknown Author'}</p>

                  <div className="flex items-center gap-3 mt-3 flex-wrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.book_id, e.target.value)}
                      className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {STATUS_TABS.filter(t => t.value !== 'all').map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => startEditingNotes(item)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {item.notes ? 'Edit Notes' : 'Add Notes'}
                    </button>
                    <button
                      onClick={() => handleRemove(item.book_id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Notes Display */}
                  {item.notes && editingNotes !== item.id && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-xs text-gray-400 dark:text-gray-500 block mb-1">Notes:</span>
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Editor */}
              {editingNotes === item.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <textarea
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder="Add your personal notes about this book..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSaveNotes(item.book_id)}
                      className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNotes(null)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
