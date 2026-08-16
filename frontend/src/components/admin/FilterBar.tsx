interface FilterOption {
  label: string
  value: string
}

interface FilterDropdown {
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

interface FilterBarProps {
  filters: FilterDropdown[]
}

export default function FilterBar({ filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <select
          key={filter.label}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm text-[#1a1a2e]"
          aria-label={filter.label}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
