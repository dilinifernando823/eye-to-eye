'use client'

import Link from 'next/link'
import { Gift, ArrowLeft, TrendingUp, Star } from 'lucide-react'
import type { LoyaltyTransaction } from '@/types'
import { formatDate } from '@/lib/utils'

const mockTransactions: LoyaltyTransaction[] = [
  { id: 1, user_id: 1, transaction_type: 'earn', points: 120, description: 'Order ETE-00041', created_at: '2024-03-15T10:00:00Z' },
  { id: 2, user_id: 1, transaction_type: 'earn', points: 55, description: 'Order ETE-00038', created_at: '2024-03-20T10:00:00Z' },
  { id: 3, user_id: 1, transaction_type: 'redeem', points: -50, description: 'Redeemed on Order ETE-00033', created_at: '2024-02-28T10:00:00Z' },
  { id: 4, user_id: 1, transaction_type: 'earn', points: 25, description: 'Birthday bonus', created_at: '2024-02-01T10:00:00Z' },
  { id: 5, user_id: 1, transaction_type: 'earn', points: 200, description: 'Order ETE-00020', created_at: '2024-01-10T10:00:00Z' },
]

const totalPoints = 350
const nextTierAt = 500
const progress = Math.min((totalPoints / nextTierAt) * 100, 100)

const tiers = [
  { name: 'Silver', min: 0, color: 'bg-gray-200' },
  { name: 'Gold', min: 500, color: 'bg-yellow-400' },
  { name: 'Platinum', min: 1000, color: 'bg-blue-500' },
]

const currentTier = tiers.reduce((acc, t) => (totalPoints >= t.min ? t : acc))

export default function LoyaltyPage() {
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
              <p className="text-5xl font-bold">{totalPoints}</p>
              <p className="text-blue-200 text-sm mt-1">≈ LKR {(totalPoints * 0.5).toLocaleString()} value</p>
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
              <span className="text-blue-200 text-xs">{totalPoints} / {nextTierAt} pts to Gold</span>
            </div>
            <div className="bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-yellow-300 h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-blue-200 text-xs mt-1.5">
              Earn {nextTierAt - totalPoints} more points to reach Gold tier
            </p>
          </div>
        </div>

        {/* Tiers info */}
        <div className="grid grid-cols-3 gap-4">
          {tiers.map(({ name, min, color }) => (
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
            <li>• Earn 1 point per LKR 100 spent on orders</li>
            <li>• Redeem 2 points = LKR 1 discount</li>
            <li>• Bonus points on your birthday month</li>
          </ul>
        </div>

        {/* Transaction history */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Transaction History</h3>
          </div>
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
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(t.created_at)}</td>
                    <td className="px-5 py-3.5 text-gray-700">{t.description}</td>
                    <td className={`px-5 py-3.5 font-bold text-right whitespace-nowrap ${
                      t.transaction_type === 'earn' ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {t.transaction_type === 'earn' ? '+' : ''}{t.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
