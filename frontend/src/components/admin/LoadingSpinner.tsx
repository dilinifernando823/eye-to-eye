export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        className="h-8 w-8 rounded-full border-4 border-gray-200 animate-spin"
        style={{ borderTopColor: '#e94560' }}
      />
    </div>
  )
}

export function SkeletonRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-3" />
      <div className="h-7 w-32 bg-gray-100 rounded animate-pulse" />
    </div>
  )
}
