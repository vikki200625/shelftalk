import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="glass-warm border-t border-[#E8DDD0] dark:border-[#3D3028] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-[var(--font-display)] text-gradient-warm">ShelfTalk</span>
            <span className="text-[#8B7355] dark:text-[#8A7B6D]">•</span>
            <span className="text-sm text-[#8B7355] dark:text-[#8A7B6D]">For book lovers</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-[#8B7355] dark:text-[#8A7B6D]">
            <Link to="/browse" className="hover:text-[#B85C38] dark:hover:text-[#D4A574] transition-colors">Browse</Link>
            <Link to="/search" className="hover:text-[#B85C38] dark:hover:text-[#D4A574] transition-colors">Search</Link>
            <a 
              href="https://github.com/vikki200625/shelftalk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#B85C38] dark:hover:text-[#D4A574] transition-colors"
            >
              GitHub
            </a>
          </div>
          
          <p className="text-sm text-[#8B7355] dark:text-[#8A7B6D]">
            &copy; {new Date().getFullYear()} ShelfTalk
          </p>
        </div>
      </div>
    </footer>
  )
}