const BASE_URL = 'https://www.googleapis.com/books/v1'
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

export async function searchBooks(query, page = 1, filters = {}) {
  const startIndex = (page - 1) * 20

  let q = query || ''

  if (filters.subject) {
    q = q ? `${q}+subject:${filters.subject}` : `subject:${filters.subject}`
  }

  if (filters.author) {
    q = q ? `${q}+inauthor:${filters.author}` : `inauthor:${filters.author}`
  }

  const params = new URLSearchParams({
    q,
    startIndex,
    maxResults: 20,
    printType: 'books',
    orderBy: filters.orderBy || 'relevance',
    key: API_KEY,
  })

  if (filters.language) {
    params.append('langRestrict', filters.language)
  }

  const res = await fetch(`${BASE_URL}/volumes?${params}`)
  if (!res.ok) throw new Error('Failed to search books')

  const data = await res.json()
  return {
    total: data.totalItems || 0,
    books: (data.items || []).map(formatSearchResult),
  }
}

export async function searchBySubject(subject, page = 1) {
  return searchBooks('', page, { subject })
}

export async function searchByAuthor(author, page = 1) {
  return searchBooks('', page, { author })
}

export async function getBookDetails(volumeId) {
  const res = await fetch(`${BASE_URL}/volumes/${volumeId}?key=${API_KEY}`)
  if (!res.ok) throw new Error('Failed to fetch book details')

  const data = await res.json()
  return formatBookDetails(data)
}

function formatSearchResult(item) {
  const info = item.volumeInfo || {}
  const imageLinks = info.imageLinks || {}

  return {
    id: item.id,
    title: info.title || 'Unknown Title',
    authors: info.authors || [],
    coverUrl: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
    publishYear: info.publishedDate?.split('-')[0] || null,
    isbn: getIsbn(info.industryIdentifiers),
    categories: info.categories || [],
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || 0,
    pageCount: info.pageCount || null,
  }
}

function formatBookDetails(item) {
  const info = item.volumeInfo || {}
  const imageLinks = info.imageLinks || {}
  const saleInfo = item.saleInfo || {}

  return {
    id: item.id,
    title: info.title || 'Unknown Title',
    subtitle: info.subtitle || null,
    authors: info.authors || [],
    coverUrl: imageLinks.large || imageLinks.medium || imageLinks.thumbnail || imageLinks.smallThumbnail || null,
    description: info.description || null,
    publishYear: info.publishedDate?.split('-')[0] || null,
    publisher: info.publisher || null,
    isbn: getIsbn(info.industryIdentifiers),
    isbn10: getIsbnByType(info.industryIdentifiers, 'ISBN_10'),
    isbn13: getIsbnByType(info.industryIdentifiers, 'ISBN_13'),
    categories: info.categories || [],
    pageCount: info.pageCount || null,
    language: info.language || null,
    averageRating: info.averageRating || null,
    ratingsCount: info.ratingsCount || 0,
    previewLink: info.previewLink || null,
    saleability: saleInfo.saleability || 'NOT_FOR_SALE',
    buyLink: saleInfo.buyLink || null,
  }
}

function getIsbn(identifiers) {
  if (!identifiers || identifiers.length === 0) return null
  const isbn13 = identifiers.find(i => i.type === 'ISBN_13')
  if (isbn13) return isbn13.identifier
  const isbn10 = identifiers.find(i => i.type === 'ISBN_10')
  if (isbn10) return isbn10.identifier
  return identifiers[0]?.identifier || null
}

function getIsbnByType(identifiers, type) {
  if (!identifiers) return null
  const found = identifiers.find(i => i.type === type)
  return found?.identifier || null
}
