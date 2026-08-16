import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trendPct?: number
}

export default function StatCard({ label, value, icon: Icon, trendPct }: StatCardProps) {
  const isPositive = (trendPct ?? 0) >= 0

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="rounded-xl p-3" style={{ backgroundColor: '#f1f5f9' }}>
          <Icon className="h-5 w-5" style={{ color: '#1a1a2e' }} />
        </div>
        {trendPct !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              isPositive ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trendPct)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[#1a1a2e]">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
