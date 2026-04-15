import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'
import { useToast } from '../contexts/ToastContext'

export default function Login() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      showToast('Welcome back!', 'success')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-[var(--on-surface)] dark:text-[var(--on-surface)] text-center mb-2">Welcome Back</h1>
        <p className="text-[var(--on-surface-variant)] dark:text-[var(--on-surface-variant)] text-center mb-8">Sign in to your ShelfTalk account</p>

        {error && (
          <div className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-2 rounded-lg border border-[var(--outline-variant)] bg-[var(--surface)] dark:bg-[var(--surface-container-high)] text-[var(--on-surface)] dark:text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none placeholder-[var(--on-surface-variant)]"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient py-3 rounded-xl hover:opacity-90 transition font-medium disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--on-surface-variant)] dark:text-[var(--on-surface-variant)] mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[var(--secondary)] dark:text-[var(--secondary)] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
