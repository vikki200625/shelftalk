import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-surface-container-low dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif italic text-blue-900 dark:text-blue-100">ShelfTalk</span>
            <span className="text-stone-400">•</span>
            <span className="text-sm text-stone-500 dark:text-stone-400">For book lovers</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-stone-500 dark:text-stone-400">
            <Link to="/browse" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Browse</Link>
            <Link to="/search" className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Search</Link>
            <a 
              href="https://github.com/vikki200625/shelftalk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              GitHub
            </a>
          </div>
          
          <p className="text-sm text-stone-500 dark:text-stone-400">
            &copy; {new Date().getFullYear()} ShelfTalk
          </p>
        </div>
      </div>
    </footer>
  )
}