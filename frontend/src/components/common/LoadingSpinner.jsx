export default function LoadingSpinner({ label = "Loading...", full = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-gray-400 ${full ? "min-h-[50vh]" : "py-10"}`}>
      <div className="h-8 w-8 rounded-full border-[3px] border-gray-200 border-t-primary-600 animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
