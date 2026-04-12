import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  const bookId = book.id || book.workId
  const coverUrl = book.coverUrl
  const authors = Array.isArray(book.authors) ? book.authors.join(', ') : book.authors || 'Unknown Author'

  return (
    <Link
      to={`/book/${bookId}`}
      className="card-cozy rounded-xl overflow-hidden group block"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-rose-100 dark:from-amber-900/30 dark:to-rose-900/30 flex items-center justify-center">
            <svg className="w-14 h-14 text-amber-300/60 dark:text-amber-600/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        
        {book.averageRating && (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#B85C38] text-xs font-semibold flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {book.averageRating.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="p-3.5">
        <h3 className="font-semibold text-[#2C1810] dark:text-[#F5EDE4] text-sm leading-snug mb-1.5 line-clamp-2 group-hover:text-[#B85C38] dark:group-hover:text-[#D4A574] transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-[#8B7355] dark:text-[#8A7B6D] line-clamp-1">
          {authors}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {book.publishYear && (
            <span className="text-xs text-[#8B7355]/70 dark:text-[#8A7B6D]/70">{book.publishYear}</span>
          )}
          {book.categories?.length > 0 && (
            <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
              {book.categories[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}