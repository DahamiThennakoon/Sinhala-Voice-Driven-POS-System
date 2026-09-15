export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>}
      <input
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400
          focus-ring transition-colors
          ${error ? "border-danger-400 focus-visible:ring-danger-500" : "border-gray-300"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger-600 mt-1 block">{error}</span>}
    </label>
  )
}
