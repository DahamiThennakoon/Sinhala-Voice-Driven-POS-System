export default function Card({ children, className = "", padding = "p-5" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-gray-100 ${padding} ${className}`}>
      {children}
    </div>
  )
}
