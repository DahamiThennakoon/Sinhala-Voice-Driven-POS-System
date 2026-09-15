import { Search } from "lucide-react"
import ProductCard from "./ProductCard"
import EmptyState from "../common/EmptyState"

export default function ProductSearch({ items, query, setQuery, category, setCategory, categories, onAdd }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items... (භාණ්ඩ සොයන්න)"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus-ring"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-gray-300 px-3.5 py-3 text-sm bg-white focus-ring sm:w-48"
        >
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={Search} title="No items found" description="Try a different search term or category." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((item) => <ProductCard key={item.id} item={item} onAdd={onAdd} />)}
        </div>
      )}
    </div>
  )
}
