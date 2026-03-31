import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  return (
    <Link
      to={`/book/${book.workId}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
    >
      <div className="aspect-[2/3] bg-gray-100 overflow-hidden">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {book.authors.join(', ') || 'Unknown Author'}
        </p>
        {book.publishYear && (
          <p className="text-xs text-gray-400 mt-1">{book.publishYear}</p>
        )}
      </div>
    </Link>
  )
}
