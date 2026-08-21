'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gift, ArrowLeft, TrendingUp, Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLoyaltyBalance, useLoyaltyTransactions } from '@/hooks/useLoyalty'
import { formatDate } from '@/lib/utils'
import type { LoyaltyTransaction } from '@/types'

const TIERS = [
  { name: 'Silver', min: 0, color: 'bg-gray-200' },
  { name: 'Gold', min: 500, color: 'bg-yellow-400' },
  { name: 'Platinum', min: 1000, color: 'bg-blue-500' },
]

const TRANSACTION_LABELS: Record<LoyaltyTransaction['transaction_type'], string> = {
  earned_purchase: 'Purchase Reward',
  earned_appointment: 'Appointment Reward',
  earned_referral: 'Referral Bonus',
  redeemed: 'Redeemed',
  manual_adjustment: 'Manual Adjustment',
}

export default function LoyaltyPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { data: balance, isLoading: balanceLoading } = useLoyaltyBalance()
  const { data: transactions, isLoading: transactionsLoading } = useLoyaltyTransactions()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account/loyalty')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const totalPoints = balance?.balance ?? 0
  const nextTier = TIERS.find((t) => totalPoints < t.min)
  const currentTier = [...TIERS].reverse().find((t) => totalPoints >= t.min) ?? TIERS[0]
  const progress = nextTier ? Math.min((totalPoints / nextTier.min) * 100, 100) : 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Points</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-1">Available Points</p>
              <p className="text-5xl font-bold">{balanceLoading ? '—' : totalPoints}</p>
              <p className="text-blue-200 text-sm mt-1">
                ≈ LKR {(balance?.redeemable_value ?? 0).toLocaleString()} value
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Gift className="h-7 w-7" />
            </div>
          </div>

          {/* Tier progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                <span className="text-sm font-semibold">{currentTier.name} Member</span>
              </div>
              {nextTier && (
                <span className="text-blue-200 text-xs">
                  {totalPoints} / {nextTier.min} pts to {nextTier.name}
                </span>
              )}
            </div>
            <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {nextTier && (
              <p className="text-blue-200 text-xs mt-1.5">
                Earn {nextTier.min - totalPoints} more points to reach {nextTier.name} tier
              </p>
            )}
          </div>
        </div>

        {/* Tiers info */}
        <div className="grid grid-cols-3 gap-4">
          {TIERS.map(({ name, min, color }) => (
            <div
              key={name}
              className={`bg-white rounded-2xl border shadow-sm p-4 text-center ${
                currentTier.name === name ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-100'
              }`}
            >
              <div className={`w-8 h-2 ${color} rounded-full mx-auto mb-2`} />
              <p className="font-bold text-gray-900 text-sm">{name}</p>
              <p className="text-xs text-gray-500">{min}+ pts</p>
              {currentTier.name === name && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                  Current
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Earn info */}
        <div className="bg-blue-50 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-700" />
            <h3 className="font-semibold text-gray-900">How to Earn Points</h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-1 ml-7">
            <li>• Earn 1 point per LKR {balance?.earn_rate ?? 100} spent on orders</li>
            <li>• Earn 5 points for every eye test appointment you book</li>
            <li>• Redeem points at LKR {(balance?.redeem_rate ?? 0.1).toFixed(2)} per point at checkout</li>
          </ul>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Transaction History</h3>
          </div>
          {transactionsLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <p className="text-sm text-gray-500 p-5">No transactions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(t.created_at)}</td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {t.description || TRANSACTION_LABELS[t.transaction_type]}
                      </td>
                      <td className={`px-5 py-3.5 font-bold text-right whitespace-nowrap ${
                        t.points >= 0 ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {t.points >= 0 ? '+' : ''}{t.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
