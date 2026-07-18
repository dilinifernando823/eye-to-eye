'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export interface FilterState {
  priceMin: string
  priceMax: string
  brands: string[]
  gender: string
  frameShapes: string[]
  frameMaterials: string[]
  colours: string[]
  lensTypes: string[]
  materialTypes: string[]
}

const defaultFilters: FilterState = {
  priceMin: '',
  priceMax: '',
  brands: [],
  gender: 'all',
  frameShapes: [],
  frameMaterials: [],
  colours: [],
  lensTypes: [],
  materialTypes: [],
}

interface FilterSidebarProps {
  category: 'spectacles' | 'sunglasses' | 'contact_lenses'
  filters: FilterState
  onChange: (f: FilterState) => void
  onApply: () => void
  onClear: () => void
}

const BRANDS = ['RayBan', 'Oakley', 'Prada', 'Gucci', 'Local Brand']
const GENDERS = ['all', 'men', 'women', 'unisex']
const FRAME_SHAPES = ['Round', 'Square', 'Rectangle', 'Aviator', 'Cat-Eye', 'Oval']
const FRAME_MATERIALS = ['Metal', 'Acetate', 'Titanium', 'TR90']
const COLOURS = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Brown', hex: '#7C5C3C' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Blue', hex: '#1E40AF' },
  { name: 'Red', hex: '#DC2626' },
]
const LENS_TYPES = ['Frame Only', 'Single Vision', 'Crizal', 'Bifocal']
const MATERIAL_TYPES = ['Daily', 'Monthly', 'Yearly']

function CheckItem({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors">{label}</span>
    </label>
  )
}

function toggleArray(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]
}

export default function FilterSidebar({
  category, filters, onChange, onApply, onClear,
}: FilterSidebarProps) {
  const isContactLens = category === 'contact_lenses'

  const set = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial })

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-blue-700" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-blue-700 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range (LKR)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={(e) => set({ priceMin: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-400 flex-shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={(e) => set({ priceMax: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isContactLens ? (
        /* Contact lenses — material type only */
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Material Type</h3>
          <div className="space-y-2">
            {MATERIAL_TYPES.map((m) => (
              <CheckItem
                key={m}
                label={m}
                checked={filters.materialTypes.includes(m)}
                onChange={() => set({ materialTypes: toggleArray(filters.materialTypes, m) })}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Brand */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Brand</h3>
            <div className="space-y-2">
              {BRANDS.map((b) => (
                <CheckItem
                  key={b}
                  label={b}
                  checked={filters.brands.includes(b)}
                  onChange={() => set({ brands: toggleArray(filters.brands, b) })}
                />
              ))}
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Gender</h3>
            <div className="space-y-2">
              {GENDERS.map((g) => (
                <label key={g} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={filters.gender === g}
                    onChange={() => set({ gender: g })}
                    className="w-4 h-4 border-gray-300 text-blue-700 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 capitalize group-hover:text-blue-700 transition-colors">
                    {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Frame Shape */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Frame Shape</h3>
            <div className="space-y-2">
              {FRAME_SHAPES.map((s) => (
                <CheckItem
                  key={s}
                  label={s}
                  checked={filters.frameShapes.includes(s)}
                  onChange={() => set({ frameShapes: toggleArray(filters.frameShapes, s) })}
                />
              ))}
            </div>
          </div>

          {/* Frame Material */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Frame Material</h3>
            <div className="space-y-2">
              {FRAME_MATERIALS.map((m) => (
                <CheckItem
                  key={m}
                  label={m}
                  checked={filters.frameMaterials.includes(m)}
                  onChange={() => set({ frameMaterials: toggleArray(filters.frameMaterials, m) })}
                />
              ))}
            </div>
          </div>

          {/* Colour */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Colour</h3>
            <div className="flex flex-wrap gap-2">
              {COLOURS.map(({ name, hex }) => (
                <button
                  key={name}
                  onClick={() => set({ colours: toggleArray(filters.colours, name) })}
                  title={name}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                    filters.colours.includes(name)
                      ? 'border-blue-700 ring-2 ring-blue-400 ring-offset-1 scale-110'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: hex }}
                  aria-label={name}
                />
              ))}
            </div>
          </div>

          {/* Lens Type */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Lens Type</h3>
            <div className="space-y-2">
              {LENS_TYPES.map((l) => (
                <CheckItem
                  key={l}
                  label={l}
                  checked={filters.lensTypes.includes(l)}
                  onChange={() => set({ lensTypes: toggleArray(filters.lensTypes, l) })}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={onApply}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        Apply Filters
      </button>
    </aside>
  )
}

export { defaultFilters }
