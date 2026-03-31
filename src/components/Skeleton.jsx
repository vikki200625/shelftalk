export default function Skeleton({ width, height, rounded = 'rounded', className = '' }) {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  )
}
