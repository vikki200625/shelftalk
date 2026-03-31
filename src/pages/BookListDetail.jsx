import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'

export default function BookListDetail() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const { showToast } = useToast()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [libraryBooks, setLibraryBooks] = useState([])
  const [showAddBook, setShowAddBook] = useState(false)

  useEffect(() => {
    if (!user) return
    fetchList()
    fetchItems()
    fetchLibraryBooks()
  }, [user, id])

  async function fetchList() {
    const { data } = await supabase
      .from('book_lists')
      .select('*')
      .eq('id', id)
      .single()

    setList(data)
  }

  async function fetchItems() {
    setLoading(true)
    const { data } = await supabase
      .from('book_list_items')
      .select('*, books(*)')
      .eq('list_id', id)
      .order('added_at', { ascending: false })

    setItems(data || [])
    setLoading(false)
  }

  async function fetchLibraryBooks() {
    const { data } = await supabase
      .from('user_library')
      .select('*, books(*)')
      .eq('user_id', user.id)

    setLibraryBooks(data || [])
  }

  async function handleAddBook(bookId) {
    await supabase
      .from('book_list_items')
      .insert({ list_id: id, book_id: bookId })

    setShowAddBook(false)
    fetchItems()
    showToast('Book added to list!', 'success')
  }

  async function handleRemoveBook(itemId) {
    await supabase.from('book_list_items').delete().eq('id', itemId)
    fetchItems()
    showToast('Book removed from list', 'success')
  }

  if (!authLoading && !user) {
    return <Navigate to="/login" />
  }

  if (!list && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-500 dark:text-gray-400">List not found.</p>
        <Link to="/lists" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
          Back to lists
        </Link>
      </div>
    )
  }

  const addedBookIds = new Set(items.map(item => item.book_id))
  const availableBooks = libraryBooks.filter(book => !addedBookIds.has(book.book_id))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/lists" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to lists
      </Link>

      {list && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{list.title}</h1>
              {list.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{list.description}</p>
              )}
            </div>
            {availableBooks.length > 0 && (
              <button
                onClick={() => setShowAddBook(!showAddBook)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                {showAddBook ? 'Cancel' : '+ Add Book'}
              </button>
            )}
          </div>

          {/* Add Book Picker */}
          {showAddBook && availableBooks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Select a book from your library:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                {availableBooks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddBook(item.book_id)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                  >
                    {item.books.cover_url ? (
                      <img src={item.books.cover_url} alt="" className="w-8 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-8 h-12 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0"></div>
                    )}
                    <span className="text-sm text-gray-900 dark:text-white line-clamp-2">{item.books.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 mb-2">This list is empty</p>
              {availableBooks.length > 0 ? (
                <button
                  onClick={() => setShowAddBook(true)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  Add books from your library
                </button>
              ) : (
                <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm">
                  Add books to your library first
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <Link to={`/book/${item.books.open_library_key}`} className="flex-shrink-0">
                    {item.books.cover_url ? (
                      <img src={item.books.cover_url} alt={item.books.title} className="w-16 h-24 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link to={`/book/${item.books.open_library_key}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        {item.books.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.books.author || 'Unknown Author'}</p>
                    <button
                      onClick={() => handleRemoveBook(item.id)}
                      className="text-sm text-red-600 dark:text-red-400 hover:underline mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
