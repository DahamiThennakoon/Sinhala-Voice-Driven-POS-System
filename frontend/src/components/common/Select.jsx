export default function Select({ label, className = "", children, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-gray-700 mb-1.5">{label}</span>}
      <select
        className={`w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 bg-white focus-ring ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}
