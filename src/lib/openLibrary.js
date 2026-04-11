const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org'

const headers = {
  'User-Agent': 'ShelfTalk (shelftalk-app)',
}

export async function searchBooks(query, page = 1) {
  const params = new URLSearchParams({
    q: query,
    page: page,
    limit: 20,
    fields: 'key,title,author_name,cover_i,first_publish_year,isbn,subject,edition_count',
  })

  const res = await fetch(`${BASE_URL}/search.json?${params}`, { headers })
  if (!res.ok) throw new Error('Failed to search books')

  const data = await res.json()
  return {
    total: data.numFound,
    books: (data.docs || []).map(formatSearchResult),
  }
}

export async function getBookDetails(workId) {
  const res = await fetch(`${BASE_URL}/works/${workId}.json`, { headers })
  if (!res.ok) throw new Error('Failed to fetch book details')

  const data = await res.json()
  return formatBookDetails(data, workId)
}

export function getCoverUrl(coverId, size = 'M') {
  if (!coverId) return null
  return `${COVERS_URL}/b/id/${coverId}-${size}.jpg`
}

function fixHttpUrl(url) {
  if (!url) return null
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  return url
}

function formatSearchResult(doc) {
  return {
    key: doc.key,
    workId: doc.key.replace('/works/', ''),
    title: doc.title || 'Unknown Title',
    authors: doc.author_name || [],
    coverId: doc.cover_i || null,
    coverUrl: fixHttpUrl(getCoverUrl(doc.cover_i)),
    publishYear: doc.first_publish_year || null,
    isbn: doc.isbn?.[0] || null,
    subjects: (doc.subject || []).slice(0, 5),
    editionCount: doc.edition_count || 0,
  }
}

function formatBookDetails(data, workId) {
  const description = typeof data.description === 'string'
    ? data.description
    : data.description?.value || null

  const subjects = data.subjects || []

  return {
    workId,
    key: data.key,
    title: data.title || 'Unknown Title',
    authors: data.authors?.map(a => a.author?.key) || [],
    coverId: data.covers?.[0] || null,
    coverUrl: fixHttpUrl(getCoverUrl(data.covers?.[0], 'L')),
    description,
    subjects: subjects.slice(0, 10),
    publishYear: data.first_publish_date || null,
    isbn: data.isbn_10?.[0] || data.isbn_13?.[0] || null,
  }
}
