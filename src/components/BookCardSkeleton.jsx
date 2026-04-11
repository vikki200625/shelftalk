export default function BookCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer w-1/4" />
      </div>
    </div>
  )
}