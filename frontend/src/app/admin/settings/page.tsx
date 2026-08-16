'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { ArrowDown, ArrowUp, ImageIcon, Search, Star, Trash2, UploadCloud } from 'lucide-react'
import { useAdminProducts, useToggleProductFeatured } from '@/hooks/useAdminProducts'
import {
  useAdminSettings,
  useUpdateAdminSettings,
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useReorderBanners,
  useDeleteBanner,
} from '@/hooks/useAdminSettings'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { getPrimaryImage } from '@/lib/utils'
import type { Banner, SiteSettings } from '@/types/admin'

type Tab = 'featured' | 'banners' | 'store'

const MAX_FEATURED = 8

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('featured')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'featured', label: 'Featured Products' },
    { key: 'banners', label: 'Homepage Banners' },
    { key: 'store', label: 'Store Settings' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your storefront configuration</p>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#e94560] text-[#e94560]'
                : 'border-transparent text-gray-500 hover:text-[#1a1a2e]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'featured' && <FeaturedProductsTab />}
      {tab === 'banners' && <BannersTab />}
      {tab === 'store' && <StoreSettingsTab />}
    </div>
  )
}

function FeaturedProductsTab() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAdminProducts({ size: 100 })
  const toggleFeatured = useToggleProductFeatured()

  const products = data?.items ?? []
  const featured = products.filter((p) => p.is_featured)
  const searchResults = search
    ? products.filter(
        (p) =>
          !p.is_featured &&
          (p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.brand?.toLowerCase().includes(search.toLowerCase()))
      )
    : []

  const handleAdd = async (id: number) => {
    if (featured.length >= MAX_FEATURED) {
      toast.error(`Maximum ${MAX_FEATURED} featured products reached`)
      return
    }
    await toggleFeatured.mutateAsync(id)
    toast.success('Added to featured')
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1a1a2e]">
          Currently Featured ({featured.length}/{MAX_FEATURED})
        </h2>
      </div>

      {featured.length === 0 ? (
        <EmptyState icon={Star} title="No featured products yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {featured.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="relative aspect-square bg-gray-50">
                <Image
                  src={getPrimaryImage(product.images)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <div className="p-3">
                <p className="font-medium text-[#1a1a2e] text-sm line-clamp-1">{product.name}</p>
                <span className="inline-block mt-1 text-xs text-gray-400 capitalize">
                  {product.category.replace('_', ' ')}
                </span>
                <button
                  onClick={() => toggleFeatured.mutate(product.id)}
                  className="mt-2 w-full text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg py-1.5 transition-colors"
                >
                  Remove from Featured
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-bold text-[#1a1a2e] mb-3">Add Products</h2>
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products to feature..."
          className="w-full sm:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
        />
      </div>
      {search && (
        <div className="bg-white rounded-xl shadow-md divide-y divide-gray-50 max-w-md">
          {searchResults.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">No matching products</p>
          ) : (
            searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAdd(product.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={getPrimaryImage(product.images)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="text-sm font-medium text-[#1a1a2e]">{product.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function BannersTab() {
  const { data: banners, isLoading } = useAdminBanners()
  const createBanner = useCreateBanner()
  const updateBanner = useUpdateBanner()
  const reorderBanners = useReorderBanners()
  const deleteBanner = useDeleteBanner()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [form, setForm] = useState({ title: '', subtitle: '', cta_text: '', cta_link: '' })
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)

  const handleCreate = async () => {
    if (!pendingFile) {
      toast.error('Select an image first')
      return
    }
    try {
      await createBanner.mutateAsync({ file: pendingFile, ...form })
      toast.success('Banner added')
      setPendingFile(null)
      setForm({ title: '', subtitle: '', cta_text: '', cta_link: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch {
      toast.error('Failed to upload banner')
    }
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (!banners) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= banners.length) return

    const reordered = [...banners]
    ;[reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]]

    try {
      await reorderBanners.mutateAsync(
        reordered.map((banner, i) => ({ id: banner.id, display_order: i }))
      )
    } catch {
      toast.error('Failed to reorder banners')
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="font-bold text-[#1a1a2e] mb-4">Add Banner</h2>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-[#e94560] rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
          />
          <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-[#1a1a2e]">
            {pendingFile ? pendingFile.name : 'Click to select a banner image'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          <input
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            placeholder="Subtitle"
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          <input
            value={form.cta_text}
            onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
            placeholder="CTA Text (e.g. Shop Now)"
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          <input
            value={form.cta_link}
            onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
            placeholder="CTA Link (e.g. /spectacles)"
            className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={createBanner.isPending}
          className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
        >
          {createBanner.isPending ? 'Uploading...' : 'Save Banner'}
        </button>
      </div>

      {!banners || banners.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No banners yet" />
      ) : (
        <div className="space-y-3">
          {banners.map((banner, index) => (
            <div key={banner.id} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={banner.image_url} alt={banner.title ?? ''} fill className="object-cover" sizes="160px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a1a2e]">{banner.title || 'Untitled banner'}</p>
                <p className="text-sm text-gray-400">{banner.subtitle}</p>
                {banner.cta_text && (
                  <p className="text-xs text-gray-400 mt-1">
                    CTA: {banner.cta_text} → {banner.cta_link}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={banner.is_active}
                    onChange={() =>
                      updateBanner.mutate({ id: banner.id, is_active: !banner.is_active })
                    }
                    className="sr-only peer"
                  />
                  <span className="relative w-10 h-5 rounded-full bg-gray-200 peer-checked:bg-[#e94560] transition-colors">
                    <span className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                  </span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === banners.length - 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(banner)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete banner?"
        message="This banner will be permanently removed."
        confirmLabel="Delete"
        loading={deleteBanner.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteBanner.mutateAsync(deleteTarget.id)
            toast.success('Banner deleted')
          } catch {
            toast.error('Failed to delete banner')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}

function StoreSettingsTab() {
  const { data, isLoading } = useAdminSettings()
  const updateSettings = useUpdateAdminSettings()
  const [form, setForm] = useState<SiteSettings | null>(null)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  if (isLoading || !form) return <LoadingSpinner />

  const handleChange = (field: keyof SiteSettings, value: string) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [field]: field.includes('rate') || field.includes('slots') || field.includes('duration')
              ? Number(value)
              : value,
          }
        : prev
    )
  }

  const handleSave = async () => {
    if (!form) return
    try {
      await updateSettings.mutateAsync(form)
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name*</label>
          <input
            value={form.store_name}
            onChange={(e) => handleChange('store_name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Email*</label>
          <input
            value={form.store_email}
            onChange={(e) => handleChange('store_email', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Phone</label>
          <input
            value={form.store_phone}
            onChange={(e) => handleChange('store_phone', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Address</label>
          <textarea
            value={form.store_address}
            onChange={(e) => handleChange('store_address', e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-3">Loyalty Programme</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Points earned per LKR
            </label>
            <input
              type="number"
              value={form.loyalty_earn_rate}
              onChange={(e) => handleChange('loyalty_earn_rate', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">e.g. 100 means every LKR 100 = 1 point</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              LKR value per point
            </label>
            <input
              type="number"
              step="0.01"
              value={form.loyalty_redeem_rate}
              onChange={(e) => handleChange('loyalty_redeem_rate', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">e.g. 0.10 means 1 point = LKR 0.10</p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-bold text-[#1a1a2e] mb-3">Appointments</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Max slots per day
            </label>
            <input
              type="number"
              value={form.max_slots_per_day}
              onChange={(e) => handleChange('max_slots_per_day', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Appointment duration (minutes)
            </label>
            <input
              type="number"
              value={form.appointment_duration_minutes}
              onChange={(e) => handleChange('appointment_duration_minutes', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
