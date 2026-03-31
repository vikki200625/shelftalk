import { useState } from 'react'

export default function Spoiler({ children }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <span
      onClick={() => setRevealed(true)}
      className={`inline cursor-pointer transition-all duration-200 ${
        revealed
          ? 'text-gray-900 dark:text-white'
          : 'text-transparent bg-gray-400 dark:bg-gray-600 rounded select-none hover:bg-gray-500 dark:hover:bg-gray-500'
      }`}
      title={revealed ? '' : 'Click to reveal spoiler'}
    >
      {children}
    </span>
  )
}
