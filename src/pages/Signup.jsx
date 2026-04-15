import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

export default function Signup() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.trim(),
          display_name: username.trim(),
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      showToast('Account created! Welcome to ShelfTalk!', 'success')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--on-surface)] dark:text-[var(--on-surface)] text-center mb-2">Create Account</h1>
        <p className="text-[var(--on-surface-variant)] dark:text-[var(--on-surface-variant)] text-center mb-8">Join ShelfTalk and start your reading journey</p>

        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] dark:text-[var(--on-surface)] mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] dark:bg-[var(--surface-container-high)] text-[var(--on-surface)] dark:text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none placeholder-[var(--on-surface-variant)]"
              placeholder="BookLover123"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] dark:text-[var(--on-surface)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] dark:bg-[var(--surface-container-high)] text-[var(--on-surface)] dark:text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none placeholder-[var(--on-surface-variant)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--on-surface)] dark:text-[var(--on-surface)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] dark:bg-[var(--surface-container-high)] text-[var(--on-surface)] dark:text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none placeholder-[var(--on-surface-variant)]"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3 rounded-xl hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--on-surface-variant)] dark:text-[var(--on-surface-variant)] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--secondary)] dark:text-[var(--secondary)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
