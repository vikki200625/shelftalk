import * as googleBooks from './googleBooks'
import * as openLibrary from './openLibrary'

export async function searchBooks(query, page = 1) {
  try {
    const results = await googleBooks.searchBooks(query, page)
    if (results.books.length > 0) return results
  } catch (err) {
    console.warn('Google Books search failed, trying Open Library:', err.message)
  }

  return openLibrary.searchBooks(query, page)
}

export async function getBookDetails(id) {
  const isGoogleId = /^[a-zA-Z0-9_-]{12}$/.test(id) && !id.startsWith('OL')

  if (isGoogleId) {
    try {
      return await googleBooks.getBookDetails(id)
    } catch (err) {
      console.warn('Google Books details failed, trying Open Library:', err.message)
    }
  }

  try {
    return await openLibrary.getBookDetails(id)
  } catch (err) {
    if (!isGoogleId) {
      throw err
    }
    return googleBooks.getBookDetails(id)
  }
}
