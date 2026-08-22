'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle,
  FileText,
  Gift,
  Package,
  ArrowRight,
  ChevronRight,
  Glasses,
  Plus,
} from 'lucide-react'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useLoyaltyBalance } from '@/hooks/useLoyalty'
import { useActivePrescription } from '@/hooks/usePrescriptions'
import { formatPrice } from '@/lib/utils'
import Input from '@/components/ui/Input'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'

type Step = 1 | 2 | 3 | 'success'

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [step, setStep] = useState<Step>(1)
  const [deliveryData, setDeliveryData] = useState<CheckoutFormData | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [placeError, setPlaceError] = useState('')

  const { items, totalPrice, clearCart } = useCartStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && items.length === 0 && step !== 'success') {
      router.replace('/cart')
    }
  }, [isAuthenticated, items.length, step, router])

  const { data: loyaltyBalance } = useLoyaltyBalance()
  const { data: activePrescription } = useActivePrescription()

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const subtotal = totalPrice()
  const deliveryFee = subtotal >= 5000 ? 0 : 350
  const redeemRate = loyaltyBalance?.redeem_rate ?? 0.1
  const pointsValue = Number(loyaltyPoints) * redeemRate
  const total = Math.max(0, subtotal + deliveryFee - pointsValue)

  const availablePoints = loyaltyBalance?.balance ?? 0

  const placeOrder = async () => {
    if (!deliveryData) return
    setIsPlacing(true)
    setPlaceError('')
    try {
      // The backend builds the order from the server-side cart, not from
      // the request body — sync the local cart to it first.
      await api.delete('/api/cart/')
      for (const item of items) {
        await api.post('/api/cart/', { variant_id: item.variantId, quantity: item.quantity })
      }

      const formData = new FormData()
      formData.append('delivery_name', deliveryData.delivery_name)
      formData.append('delivery_address', deliveryData.delivery_address)
      formData.append('delivery_city', deliveryData.delivery_city)
      formData.append('delivery_phone', deliveryData.delivery_phone)
      formData.append('use_loyalty_points', String(Number(loyaltyPoints) || 0))
      if (activePrescription) {
        formData.append('prescription_id', String(activePrescription.id))
      }

      const { data } = await api.post('/api/orders/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setOrderRef(data.order_reference)
      clearCart()
      setStep('success')
    } catch (err: unknown) {
      setPlaceError(getErrorMessage(err, 'Failed to place your order. Please try again.'))
    } finally {
      setIsPlacing(false)
    }
  }

  if (!isAuthenticated || (items.length === 0 && step !== 'success')) {
    return null
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {([1, 2, 3] as const).map((s, i) => (
        <div key={s} className="flex items-center">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm border-2 transition-all ${
              step === s
                ? 'bg-blue-700 border-blue-700 text-white'
                : (step === 'success' || (typeof step === 'number' && step > s))
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-300 text-gray-400'
            }`}
          >
            {(step === 'success' || (typeof step === 'number' && step > s))
              ? <CheckCircle className="h-5 w-5" />
              : s}
          </div>
          {i < 2 && (
            <div
              className={`h-0.5 w-16 sm:w-24 mx-1 transition-all ${
                (step === 'success' || (typeof step === 'number' && step > s + 1))
                  ? 'bg-green-500'
                  : step > s
                  ? 'bg-blue-700'
                  : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  // Order success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full p-5 inline-flex mb-5">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-500 mb-5">
            Thank you for your order. We&apos;ll contact you to arrange payment and delivery.
          </p>
          <div className="bg-blue-50 rounded-xl px-6 py-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order Reference</p>
            <p className="text-2xl font-bold text-blue-700">{orderRef}</p>
          </div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            View My Orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Checkout</h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            {step === 1 ? 'Delivery Details' : step === 2 ? 'Prescription & Points' : 'Confirm Order'}
          </p>
          <StepIndicator />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-700" />
              Delivery Details
            </h2>
            <form
              onSubmit={form.handleSubmit((data) => {
                setDeliveryData(data)
                setStep(2)
              })}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                placeholder="e.g. Chamara Perera"
                {...form.register('delivery_name')}
                error={form.formState.errors.delivery_name?.message}
              />
              <Input
                label="Delivery Address"
                placeholder="e.g. 45 Galle Road, Colombo 03"
                {...form.register('delivery_address')}
                error={form.formState.errors.delivery_address?.message}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="e.g. Colombo"
                  {...form.register('delivery_city')}
                  error={form.formState.errors.delivery_city?.message}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. 0712345678"
                  {...form.register('delivery_phone')}
                  error={form.formState.errors.delivery_phone?.message}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Prescription */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                Prescription
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Only required for prescription spectacles. Skip if not applicable.
              </p>

              {activePrescription ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                  <Glasses className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-green-800">
                      {activePrescription.recommended_lens_types?.join(', ') ?? 'Prescription'} will be attached to this order
                    </p>
                    <p className="text-sm text-green-600 mt-0.5">
                      From {activePrescription.original_filename ?? 'your manual entry'}
                    </p>
                  </div>
                  <Link
                    href="/account/prescriptions"
                    className="text-sm font-medium text-blue-700 hover:text-blue-800 flex-shrink-0"
                  >
                    Change
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <FileText className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">No prescription on file</p>
                    <p className="text-sm text-gray-500 mt-0.5">Add one if you&apos;re ordering prescription lenses</p>
                  </div>
                  <Link
                    href="/prescription"
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 flex-shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Link>
                </div>
              )}
            </div>

            {/* Loyalty points */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-700" />
                Loyalty Points
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                You have <span className="font-semibold text-blue-700">{availablePoints} points</span> available
                (worth {formatPrice(availablePoints * redeemRate)})
              </p>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    label="Points to redeem"
                    type="number"
                    placeholder="0"
                    value={loyaltyPoints}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), availablePoints)
                      setLoyaltyPoints(v > 0 ? String(v) : '')
                    }}
                  />
                </div>
                {Number(loyaltyPoints) > 0 && (
                  <div className="bg-green-50 rounded-xl px-4 py-3 text-sm text-green-700 font-medium mt-6">
                    -{formatPrice(pointsValue)} discount
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && deliveryData && (
          <div className="space-y-5">
            {/* Delivery summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Delivery Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">{deliveryData.delivery_name}</p>
                <p>{deliveryData.delivery_address}</p>
                <p>{deliveryData.delivery_city}</p>
                <p>{deliveryData.delivery_phone}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 items-center">
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.lensType} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                    {deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}
                  </span>
                </div>
                {Number(loyaltyPoints) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Discount</span><span>-{formatPrice(pointsValue)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-blue-700">{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                💳 Payment is collected in-store. No online payment required.
              </p>
            </div>

            {placeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {placeError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={placeOrder}
                disabled={isPlacing}
                className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isPlacing ? 'Placing Order...' : 'Place Order'}
                {!isPlacing && <CheckCircle className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
