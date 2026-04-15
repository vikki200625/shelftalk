import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Notes() {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState({ content: '', page_number: '', is_highlight: false })
  const [selectedBook, setSelectedBook] = useState(null)
  const [myBooks, setMyBooks] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchNotes()
  }, [user, filter])

  async function fetchNotes() {
    setLoading(true)
    
    let query = supabase
      .from('book_notes')
      .select('*, books(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (filter === 'highlights') {
      query = query.eq('is_highlight', true)
    } else if (filter === 'notes') {
      query = query.eq('is_highlight', false)
    }

    const { data } = await query
    setNotes(data || [])
    setLoading(false)
  }

  async function fetchMyBooks() {
    const { data } = await supabase
      .from('user_library')
      .select('*, books(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    return data || []
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!selectedBook) {
      showToast('Select a book first', 'error')
      return
    }

    setSaving(true)
    
    const bookId = selectedBook.books?.id
    if (!bookId) {
      showToast('Book not found in database', 'error')
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from('book_notes')
      .insert({
        user_id: user.id,
        book_id: bookId,
        content: newNote.content,
        page_number: newNote.page_number ? parseInt(newNote.page_number) : null,
        is_highlight: newNote.is_highlight
      })

    if (error) {
      showToast('Error saving note', 'error')
    } else {
      showToast(newNote.is_highlight ? 'Highlight saved! ✨' : 'Note saved! 📝', 'success')
      setShowAddNote(false)
      setNewNote({ content: '', page_number: '', is_highlight: false })
      setSelectedBook(null)
      fetchNotes()
    }
    setSaving(false)
  }

  async function deleteNote(noteId) {
    await supabase.from('book_notes').delete().eq('id', noteId)
    showToast('Deleted', 'info')
    fetchNotes()
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Sign in to see your notes</h2>
        <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
      </div>
    )
  }

  return (
    <div className="w-full px-6 py-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-serif italic text-[var(--old-oak)] dark:text-[var(--on-surface)] mb-2">
            📝 My Notes & Highlights
          </h1>
          <p className="text-[var(--on-surface-variant)]">
            Your thoughts and favorite quotes
          </p>
        </div>
        <button
          onClick={async () => {
            setShowAddNote(true)
            const books = await fetchMyBooks()
            setMyBooks(books)
            if (books.length > 0) setSelectedBook(books[0])
          }}
          className="px-6 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
        >
          + Add Note
        </button>
      </div>

      {/* Add Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-4">Add Note or Highlight</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Book</label>
              <select
                value={selectedBook?.id || ''}
                onChange={(e) => {
                  const book = myBooks.find(b => b.id === e.target.value)
                  setSelectedBook(book)
                }}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
              >
                <option value="">Choose a book...</option>
                {myBooks.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.books?.title || 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                {newNote.is_highlight ? 'Quote / Highlight' : 'Your Note'}
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder={newNote.is_highlight ? '"Paste your favorite quote..."' : 'Write your thoughts...'}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Page (optional)</label>
              <input
                type="number"
                value={newNote.page_number}
                onChange={(e) => setNewNote({ ...newNote, page_number: e.target.value })}
                placeholder="Page number"
                className="w-full px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newNote.is_highlight}
                  onChange={(e) => setNewNote({ ...newNote, is_highlight: e.target.checked })}
                  className="w-5 h-5"
                />
                <span>⭐ This is a highlight/quote</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddNote(false)}
                className="flex-1 py-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={saving || !selectedBook}
                className="flex-1 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'highlights', 'notes'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm ${
              filter === f 
                ? 'bg-blue-700 text-white' 
                : 'bg-stone-200 dark:bg-stone-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notes List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-stone-200 dark:bg-stone-700 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map(note => (
            <div 
              key={note.id} 
              className={`p-4 rounded-xl ${
                note.is_highlight 
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500' 
                  : 'bg-white dark:bg-stone-800'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Link 
                  to={`/book/${note.books?.open_library_key || note.book_id}`}
                  className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
                >
                  {note.books?.title || 'Unknown Book'}
                </Link>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-stone-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              
              <p className={`mb-2 ${note.is_highlight ? 'italic text-lg' : ''}`}>
                {note.is_highlight && '"'}
                {note.content}
                {note.is_highlight && '"'}
              </p>
              
              <div className="flex items-center gap-3 text-sm text-stone-500">
                {note.page_number && <span>Page {note.page_number}</span>}
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-stone-500 mb-4">No notes yet</p>
          <button
            onClick={() => setShowAddNote(true)}
            className="px-6 py-2 bg-blue-700 text-white rounded-full"
          >
            Add your first note!
          </button>
        </div>
      )}
    </div>
  )
}