import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'

export default function Navbar() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            ShelfTalk
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 transition">
              Home
            </Link>
            <Link to="/search" className="text-gray-600 hover:text-indigo-600 transition">
              Search
            </Link>

            {user ? (
              <>
                <Link to="/library" className="text-gray-600 hover:text-indigo-600 transition">
                  My Library
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
