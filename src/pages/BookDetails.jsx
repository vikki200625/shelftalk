import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBookDetails } from '../lib/bookService'
import { addToRecentlyViewed } from '../lib/recentlyViewed'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import supabase from '../lib/supabase'
import StarRating from '../components/StarRating'
import ProgressBar from '../components/ProgressBar'

const STATUS_OPTIONS = [
  { value: 'want_to_read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'dropped', label: 'Dropped' },
]

export default function BookDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [libraryStatus, setLibraryStatus] = useState(null)
  const [dbBookId, setDbBookId] = useState(null)

  const [reviews, setReviews] = useState([])
  const [userReview, setUserReview] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewBody, setReviewBody] = useState('')
  const [editingReview, setEditingReview] = useState(false)

  const [discussions, setDiscussions] = useState([])
  const [showNewDiscussion, setShowNewDiscussion] = useState(false)
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('')
  const [newDiscussionBody, setNewDiscussionBody] = useState('')
  const [activeDiscussion, setActiveDiscussion] = useState(null)
  const [replies, setReplies] = useState([])
  const [replyBody, setReplyBody] = useState('')

  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [editingProgress, setEditingProgress] = useState(false)
  const [progressInput, setProgressInput] = useState('')

  const bookKey = book?.id || book?.workId || id

  useEffect(() => {
    setLoading(true)
    setError(null)
    setLibraryStatus(null)
    setUserReview(null)
    setDiscussions([])
    setActiveDiscussion(null)

    getBookDetails(id)
      .then((data) => {
        setBook(data)
        addToRecentlyViewed(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!book) return
    ensureBookInDb()
  }, [book, user])

  async function ensureBookInDb() {
    const { data: existing } = await supabase
      .from('books')
      .select('id')
      .eq('open_library_key', bookKey)
      .single()

    if (existing) {
      setDbBookId(existing.id)
      if (user) {
        fetchLibraryStatus(existing.id)
        fetchUserReview(existing.id)
      }
      fetchReviews(existing.id)
      fetchDiscussions(existing.id)
    } else {
      const { data: inserted } = await supabase
        .from('books')
        .insert({
          open_library_key: bookKey,
          title: book.title + (book.subtitle ? `: ${book.subtitle}` : ''),
          author: book.authors.join(', '),
          isbn: book.isbn13 || book.isbn10 || book.isbn,
          description: book.description,
          cover_url: book.coverUrl,
          publish_year: book.publishYear ? parseInt(book.publishYear) : null,
          subjects: book.categories || book.subjects || [],
          page_count: book.pageCount || null,
        })
        .select('id')
        .single()

      if (inserted) {
        setDbBookId(inserted.id)
      }
    }
  }

  async function fetchLibraryStatus(bookId) {
    const { data } = await supabase
      .from('user_library')
      .select('status, current_page')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single()

    if (data) {
      setLibraryStatus(data.status)
      setCurrentPage(data.current_page || 0)
    }
  }

  async function fetchUserReview(bookId) {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single()

    if (data) {
      setUserReview(data)
      setReviewRating(data.rating)
      setReviewBody(data.body || '')
    }
  }

  async function fetchReviews(bookId) {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(display_name)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    setReviews(data || [])
  }

  async function fetchDiscussions(bookId) {
    const { data } = await supabase
      .from('discussions')
      .select('*, profiles(display_name)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })

    setDiscussions(data || [])
  }

  async function fetchReplies(discussionId) {
    const { data } = await supabase
      .from('discussion_replies')
      .select('*, profiles(display_name)')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })

    setReplies(data || [])
  }

  async function handleAddToLibrary(status) {
    if (!user || !dbBookId) return
    setSaving(true)

    const updates = {
      user_id: user.id,
      book_id: dbBookId,
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'reading') {
      updates.started_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('user_library')
      .upsert(updates)

    if (!error) {
      setLibraryStatus(status)
      showToast('Book added to library!', 'success')
    } else {
      showToast('Failed to add book', 'error')
    }
    setSaving(false)
  }

  async function handleRemoveFromLibrary() {
    if (!user || !dbBookId) return
    setSaving(true)

    await supabase
      .from('user_library')
      .delete()
      .eq('user_id', user.id)
      .eq('book_id', dbBookId)

    setLibraryStatus(null)
    setCurrentPage(0)
    showToast('Book removed from library', 'success')
    setSaving(false)
  }

  async function handleSaveProgress() {
    if (!user || !dbBookId) return
    const page = parseInt(progressInput)
    if (isNaN(page) || page < 0) return
    setSaving(true)

    const totalPages = book?.pageCount
    const updates = {
      current_page: page,
      updated_at: new Date().toISOString(),
    }

    if (totalPages && page >= totalPages) {
      updates.status = 'completed'
      updates.finished_at = new Date().toISOString()
    }

    await supabase
      .from('user_library')
      .update(updates)
      .eq('user_id', user.id)
      .eq('book_id', dbBookId)

    setCurrentPage(page)
    if (totalPages && page >= totalPages) {
      setLibraryStatus('completed')
      showToast('Congratulations! Book completed!', 'success')
    } else {
      showToast('Progress updated!', 'success')
    }
    setEditingProgress(false)
    setSaving(false)
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    if (!user || !dbBookId || reviewRating === 0) return
    setSaving(true)

    if (userReview && editingReview) {
      await supabase
        .from('reviews')
        .update({ rating: reviewRating, body: reviewBody, updated_at: new Date().toISOString() })
        .eq('id', userReview.id)
      showToast('Review updated!', 'success')
    } else {
      await supabase
        .from('reviews')
        .insert({ user_id: user.id, book_id: dbBookId, rating: reviewRating, body: reviewBody })
      showToast('Review posted!', 'success')
    }

    setEditingReview(false)
    fetchReviews(dbBookId)
    fetchUserReview(dbBookId)
    setSaving(false)
  }

  async function handleDeleteReview() {
    if (!userReview) return
    setSaving(true)

    await supabase.from('reviews').delete().eq('id', userReview.id)
    setUserReview(null)
    setReviewRating(0)
    setReviewBody('')
    fetchReviews(dbBookId)
    showToast('Review deleted', 'info')
    setSaving(false)
  }

  async function handleCreateDiscussion(e) {
    e.preventDefault()
    if (!user || !dbBookId || !newDiscussionTitle.trim()) return
    setSaving(true)

    await supabase
      .from('discussions')
      .insert({
        user_id: user.id,
        book_id: dbBookId,
        title: newDiscussionTitle.trim(),
        body: newDiscussionBody.trim(),
      })

    setNewDiscussionTitle('')
    setNewDiscussionBody('')
    setShowNewDiscussion(false)
    fetchDiscussions(dbBookId)
    showToast('Discussion posted!', 'success')
    setSaving(false)
  }

  async function handleOpenDiscussion(discussion) {
    setActiveDiscussion(discussion)
    fetchReplies(discussion.id)
  }

  async function handlePostReply(e) {
    e.preventDefault()
    if (!user || !activeDiscussion || !replyBody.trim()) return
    setSaving(true)

    await supabase
      .from('discussion_replies')
      .insert({
        discussion_id: activeDiscussion.id,
        user_id: user.id,
        body: replyBody.trim(),
      })

    setReplyBody('')
    fetchReplies(activeDiscussion.id)
    showToast('Reply posted!', 'success')
    setSaving(false)
  }

  async function handleDeleteDiscussion(discussionId) {
    await supabase.from('discussions').delete().eq('id', discussionId)
    setActiveDiscussion(null)
    fetchDiscussions(dbBookId)
    showToast('Discussion deleted', 'info')
  }

  async function handleDeleteReply(replyId) {
    await supabase.from('discussion_replies').delete().eq('id', replyId)
    fetchReplies(activeDiscussion.id)
    showToast('Reply deleted', 'info')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse flex gap-8">
          <div className="w-48 h-72 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
          <div className="flex-1">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  if (!book) return null

  const tags = book.categories || book.subjects || []
  const authorsText = book.authors.join(', ') || 'Unknown Author'
  const amazonSearchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(book.title + ' ' + book.authors.join(' '))}&i=stripbooks`

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Book Info */}
      <div className="flex gap-8 mb-10 flex-col sm:flex-row">
        <div className="w-48 flex-shrink-0 mx-auto sm:mx-0">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full rounded-lg shadow-md" />
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{book.title}</h1>
          {book.subtitle && (
            <p className="text-gray-500 dark:text-gray-400 mb-2">{book.subtitle}</p>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-1">by {authorsText}</p>

          {book.averageRating && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating value={Math.round(book.averageRating)} readOnly size="sm" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {book.averageRating.toFixed(1)} ({book.ratingsCount} ratings)
              </span>
            </div>
          )}

          {book.publishYear && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Published: {book.publishYear}</p>
          )}
          {book.publisher && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Publisher: {book.publisher}</p>
          )}
          {book.pageCount && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{book.pageCount} pages</p>
          )}
          {(book.isbn13 || book.isbn10 || book.isbn) && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">ISBN: {book.isbn13 || book.isbn10 || book.isbn}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 mb-4">
              {tags.slice(0, 5).map((s, i) => (
                <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Library Controls */}
          {user && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {libraryStatus ? (
                  <>
                    <select
                      value={libraryStatus}
                      onChange={(e) => handleAddToLibrary(e.target.value)}
                      disabled={saving}
                      className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleRemoveFromLibrary}
                      disabled={saving}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleAddToLibrary('want_to_read')}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm"
                  >
                    + Add to Library
                  </button>
                )}
              </div>

              {/* Reading Progress */}
              {libraryStatus === 'reading' && (
                <div className="max-w-xs">
                  {book.pageCount ? (
                    <>
                      {!editingProgress ? (
                        <div>
                          <ProgressBar
                            current={currentPage}
                            total={book.pageCount}
                          />
                          <button
                            onClick={() => {
                              setEditingProgress(true)
                              setProgressInput(currentPage.toString())
                            }}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                          >
                            Update Progress
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <input
                              type="number"
                              value={progressInput}
                              onChange={(e) => setProgressInput(e.target.value)}
                              min="0"
                              max={book.pageCount}
                              className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400">/ {book.pageCount} pages</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveProgress}
                              disabled={saving}
                              className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingProgress(false)}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">Page count not available for this book</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!user && (
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Login</Link> to add this book to your library.
            </p>
          )}

          {/* Amazon Link */}
          <a
            href={amazonSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition text-sm"
          >
            Buy on Amazon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Description */}
      {book.description && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h2>
          <div
            className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: book.description }}
          />
        </div>
      )}

      {/* Reviews Section */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reviews</h2>

        {/* Write/Edit Review */}
        {user && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            {userReview && !editingReview ? (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your review:</p>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating value={userReview.rating} readOnly />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{userReview.rating}/5</span>
                </div>
                {userReview.body && <p className="text-gray-700 dark:text-gray-300 mb-3">{userReview.body}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingReview(true)}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {editingReview ? 'Edit your review:' : 'Write a review:'}
                </p>
                <div className="mb-3">
                  <StarRating value={reviewRating} onChange={setReviewRating} />
                </div>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    disabled={saving || reviewRating === 0}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm disabled:opacity-50"
                  >
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  {editingReview && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReview(false)
                        setReviewRating(userReview.rating)
                        setReviewBody(userReview.body || '')
                      }}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {/* All Reviews */}
        {reviews.filter(r => !user || r.user_id !== user.id).length === 0 && !userReview ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet. Be the first to review this book!</p>
        ) : (
          <div className="space-y-4">
            {reviews
              .filter(r => !user || r.user_id !== user.id)
              .map((review) => (
                <div key={review.id} className="border-b border-gray-100 dark:border-gray-700 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {review.profiles?.display_name || 'Anonymous'}
                    </span>
                    <StarRating value={review.rating} readOnly size="sm" />
                  </div>
                  {review.body && <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{review.body}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Discussions Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Discussions</h2>
          {user && !activeDiscussion && (
            <button
              onClick={() => setShowNewDiscussion(!showNewDiscussion)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {showNewDiscussion ? 'Cancel' : '+ New Discussion'}
            </button>
          )}
        </div>

        {/* New Discussion Form */}
        {showNewDiscussion && user && (
          <form onSubmit={handleCreateDiscussion} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <input
              type="text"
              value={newDiscussionTitle}
              onChange={(e) => setNewDiscussionTitle(e.target.value)}
              placeholder="Discussion title..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm mb-3 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <textarea
              value={newDiscussionBody}
              onChange={(e) => setNewDiscussionBody(e.target.value)}
              placeholder="What's on your mind? (optional)"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm mb-3 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={saving || !newDiscussionTitle.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm disabled:opacity-50"
            >
              Post Discussion
            </button>
          </form>
        )}

        {/* Discussion Thread View */}
        {activeDiscussion ? (
          <div>
            <button
              onClick={() => { setActiveDiscussion(null); setReplies([]) }}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to discussions
            </button>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">{activeDiscussion.title}</h3>
                {user && user.id === activeDiscussion.user_id && (
                  <button
                    onClick={() => handleDeleteDiscussion(activeDiscussion.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              {activeDiscussion.body && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{activeDiscussion.body}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                <span>{activeDiscussion.profiles?.display_name || 'Anonymous'}</span>
                <span>&middot;</span>
                <span>{new Date(activeDiscussion.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-3 ml-4 mb-4">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-900 dark:text-white">
                      {reply.profiles?.display_name || 'Anonymous'}
                    </span>
                    {user && user.id === reply.user_id && (
                      <button
                        onClick={() => handleDeleteReply(reply.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{reply.body}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(reply.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {user ? (
              <form onSubmit={handlePostReply} className="flex gap-2 ml-4">
                <input
                  type="text"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={saving || !replyBody.trim()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm disabled:opacity-50"
                >
                  Reply
                </button>
              </form>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Login</Link> to reply.
              </p>
            )}
          </div>
        ) : (
          /* Discussion List */
          discussions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No discussions yet. Start one!</p>
          ) : (
            <div className="space-y-3">
              {discussions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleOpenDiscussion(d)}
                  className="w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{d.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 dark:text-gray-500">
                    <span>{d.profiles?.display_name || 'Anonymous'}</span>
                    <span>&middot;</span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
