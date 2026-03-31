const STORAGE_KEY = 'shelftalk-recently-viewed'
const MAX_ITEMS = 10

export function getRecentlyViewed() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addToRecentlyViewed(book) {
  const items = getRecentlyViewed()

  const existingIndex = items.findIndex(
    item => item.id === book.id || item.workId === book.workId
  )

  if (existingIndex > -1) {
    items.splice(existingIndex, 1)
  }

  items.unshift({
    id: book.id || null,
    workId: book.workId || null,
    title: book.title,
    authors: book.authors || [],
    coverUrl: book.coverUrl || null,
    viewedAt: new Date().toISOString(),
  })

  if (items.length > MAX_ITEMS) {
    items.length = MAX_ITEMS
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function clearRecentlyViewed() {
  localStorage.removeItem(STORAGE_KEY)
}
