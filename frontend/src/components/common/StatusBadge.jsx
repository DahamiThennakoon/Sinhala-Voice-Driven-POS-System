const styles = {
  "In Stock": "bg-success-50 text-success-700 ring-1 ring-success-600/20",
  "Low Stock": "bg-warning-50 text-warning-700 ring-1 ring-warning-600/20",
  "Out of Stock": "bg-danger-50 text-danger-700 ring-1 ring-danger-600/20",
  Paid: "bg-success-50 text-success-700 ring-1 ring-success-600/20",
  Pending: "bg-warning-50 text-warning-700 ring-1 ring-warning-600/20",
  Cash: "bg-primary-50 text-primary-700 ring-1 ring-primary-600/20",
  Card: "bg-gray-100 text-gray-700 ring-1 ring-gray-400/20",
  Other: "bg-gray-100 text-gray-700 ring-1 ring-gray-400/20",
}

export default function StatusBadge({ label }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[label] || "bg-gray-100 text-gray-700"}`}>
      {label}
    </span>
  )
}
