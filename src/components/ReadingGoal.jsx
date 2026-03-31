import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import supabase from '../lib/supabase'

export default function ReadingGoal() {
  const { user } = useAuth()
  const [goal, setGoal] = useState(null)
  const [completed, setCompleted] = useState(0)
  const [editing, setEditing] = useState(false)
  const [targetInput, setTargetInput] = useState('')
  const [saving, setSaving] = useState(false)

  const currentYear = new Date().getFullYear()

  useEffect(() => {
    if (!user) return
    fetchGoal()
    fetchCompletedCount()
  }, [user])

  async function fetchGoal() {
    const { data } = await supabase
      .from('reading_goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .single()

    if (data) {
      setGoal(data)
      setTargetInput(data.target.toString())
    }
  }

  async function fetchCompletedCount() {
    const { count } = await supabase
      .from('user_library')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('updated_at', `${currentYear}-01-01`)
      .lt('updated_at', `${currentYear + 1}-01-01`)

    setCompleted(count || 0)
  }

  async function handleSave(e) {
    e.preventDefault()
    const target = parseInt(targetInput)
    if (!target || target < 1) return
    setSaving(true)

    if (goal) {
      await supabase
        .from('reading_goals')
        .update({ target, updated_at: new Date().toISOString() })
        .eq('id', goal.id)
    } else {
      await supabase
        .from('reading_goals')
        .insert({ user_id: user.id, year: currentYear, target })
    }

    setEditing(false)
    fetchGoal()
    setSaving(false)
  }

  async function handleDelete() {
    if (!goal) return
    await supabase.from('reading_goals').delete().eq('id', goal.id)
    setGoal(null)
    setTargetInput('')
  }

  const percentage = goal ? Math.min(100, Math.round((completed / goal.target) * 100)) : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          {currentYear} Reading Goal
        </h3>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {goal ? 'Edit' : 'Set Goal'}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Read</span>
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              min="1"
              max="365"
              className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">books in {currentYear}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={saving || !targetInput}
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setTargetInput(goal?.target?.toString() || '')
              }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            {goal && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Remove Goal
              </button>
            )}
          </div>
        </form>
      ) : goal ? (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {completed} of {goal.target} books
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {percentage >= 100 && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
              Goal reached! Great job!
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Set a reading goal to track your progress this year.
        </p>
      )}
    </div>
  )
}
