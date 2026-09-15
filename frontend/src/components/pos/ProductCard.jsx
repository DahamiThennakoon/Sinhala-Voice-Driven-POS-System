export default function ProductCard({ item, onAdd }) {
  const outOfStock = item.stock <= 0
  return (
    <button
      onClick={() => !outOfStock && onAdd(item)}
      disabled={outOfStock}
      className={`text-left bg-white rounded-2xl border p-4 transition-all shadow-card
        ${outOfStock ? "opacity-50 cursor-not-allowed border-gray-100" : "border-gray-100 hover:border-primary-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"}`}
    >
      <div className="h-16 w-16 rounded-xl bg-primary-50 flex items-center justify-center text-2xl font-sinhala font-bold text-primary-600 mb-3">
        {item.name?.[0]}
      </div>
      <p className="font-sinhala font-semibold text-gray-900 truncate">{item.name}</p>
      <p className="text-primary-700 font-bold mt-0.5">Rs. {item.sellingPrice} <span className="text-xs font-normal text-gray-400">/ {item.unit}</span></p>
      <p className={`text-xs mt-1 ${outOfStock ? "text-danger-600 font-medium" : "text-gray-400"}`}>
        {outOfStock ? "Out of stock" : `Stock: ${item.stock} ${item.unit}`}
      </p>
    </button>
  )
}
