export default function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="card-psb animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-gray-200 rounded-lg" />
          <div className="flex-1">
            <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-2 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-4 w-12 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}
