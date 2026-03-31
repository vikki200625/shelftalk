export default function ProgressBar({ current, total, showLabel = true }) {
  if (!total || total <= 0) return null

  const percentage = Math.min(100, Math.round((current / total) * 100))
  const isComplete = current >= total

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {current} / {total} pages
          </span>
          <span className={`text-xs font-medium ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isComplete ? 'bg-green-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {isComplete && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
          Finished reading!
        </p>
      )}
    </div>
  )
}
