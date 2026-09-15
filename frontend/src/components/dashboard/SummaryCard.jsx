const tones = {
  primary: { bg: "bg-primary-50", text: "text-primary-700", icon: "text-primary-600" },
  success: { bg: "bg-success-50", text: "text-success-700", icon: "text-success-600" },
  danger: { bg: "bg-danger-50", text: "text-danger-700", icon: "text-danger-600" },
  warning: { bg: "bg-warning-50", text: "text-warning-700", icon: "text-warning-600" },
}

export default function SummaryCard({ label, value, icon: Icon, tone = "primary", hint }) {
  const t = tones[tone]
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-1.5 ${t.text}`}>
          Rs. {Number(value ?? 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className={`h-11 w-11 rounded-xl ${t.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${t.icon}`} />
        </div>
      )}
    </div>
  )
}
