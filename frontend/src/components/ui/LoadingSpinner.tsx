import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-blue-200 border-t-blue-700',
        sizes[size],
        className
      )}
    />
  )
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-64 w-full" />
      <div className="p-4 space-y-3">
        <div className="bg-gray-200 h-3 w-1/3 rounded" />
        <div className="bg-gray-200 h-5 w-2/3 rounded" />
        <div className="bg-gray-200 h-4 w-1/4 rounded" />
      </div>
    </div>
  )
}
