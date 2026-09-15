const variants = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20",
  success: "bg-success-600 text-white hover:bg-success-700 shadow-sm shadow-success-600/20",
  danger: "bg-danger-600 text-white hover:bg-danger-700 shadow-sm shadow-danger-600/20",
  outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
  ghost: "text-gray-600 hover:bg-gray-100",
}
const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-base",
  xl: "px-6 py-4 text-lg",
}

export default function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight = false,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        focus-ring ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {Icon && !iconRight && <Icon className="h-4 w-4" />}
          {children}
          {Icon && iconRight && <Icon className="h-4 w-4" />}
        </>
      )}
    </button>
  )
}
