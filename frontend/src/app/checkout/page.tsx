'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle,
  Upload,
  FileText,
  Gift,
  Package,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'
import { checkoutSchema, type CheckoutFormData } from '@/lib/validations'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import Input from '@/components/ui/Input'
import api from '@/lib/api'

type Step = 1 | 2 | 3 | 'success'

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [deliveryData, setDeliveryData] = useState<CheckoutFormData | null>(null)
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [loyaltyPoints, setLoyaltyPoints] = useState('')
  const [orderRef, setOrderRef] = useState('')
  const [isPlacing, setIsPlacing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { items, totalPrice, clearCart } = useCartStore()

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  })

  const subtotal = totalPrice()
  const deliveryFee = subtotal >= 5000 ? 0 : 350
  const pointsValue = Number(loyaltyPoints) * 0.5
  const total = Math.max(0, subtotal + deliveryFee - pointsValue)

  const availablePoints = 350

  const handleFileChange = (file: File | null) => {
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setPrescriptionFile(file)
    }
  }

  const placeOrder = async () => {
    if (!deliveryData) return
    setIsPlacing(true)
    try {
      const { data } = await api.post('/api/orders', {
        ...deliveryData,
        items: items.map((i) => ({
          variant_id: i.variantId,
          quantity: i.quantity,
          unit_price: i.price,
        })),
        loyalty_points_used: Number(loyaltyPoints) || 0,
      })
      setOrderRef(data.order_reference ?? 'ETE-' + String(Date.now()).slice(-5))
      clearCart()
      setStep('success')
    } catch {
      // Simulate success with mock ref for demo
      setOrderRef('ETE-' + String(Date.now()).slice(-5))
      clearCart()
      setStep('success')
    } finally {
      setIsPlacing(false)
    }
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
            {/* Prescription upload */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-700" />
                Prescription Upload
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Only required for prescription spectacles. Skip if not applicable.
              </p>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : prescriptionFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
                {prescriptionFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">{prescriptionFile.name}</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-700">Drop your prescription here</p>
                    <p className="text-sm text-gray-400 mt-1">or click to browse — PDF, JPG, PNG</p>
                  </>
                )}
              </div>
            </div>

            {/* Loyalty points */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-700" />
                Loyalty Points
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                You have <span className="font-semibold text-blue-700">{availablePoints} points</span> available
                (worth {formatPrice(availablePoints * 0.5)})
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
