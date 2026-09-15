import { ShoppingCart } from "lucide-react"
import CartItem from "./CartItem"
import EmptyState from "../common/EmptyState"
import PaymentSection from "./PaymentSection"

export default function Cart({ cart, onInc, onDec, onRemove, discount, setDiscount, paymentMethod, setPaymentMethod, onComplete, completing }) {
  const subtotal = cart.reduce((s, l) => s + l.qty * l.sellingPrice, 0)
  const total = Math.max(subtotal - (Number(discount) || 0), 0)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col h-full">
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="h-4.5 w-4.5 text-gray-400" /> Cart
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 max-h-[40vh] lg:max-h-none">
        {cart.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Cart is empty" description="Tap an item on the left, or use the voice button, to start a sale." />
        ) : (
          cart.map((line) => <CartItem key={line.id} line={line} onInc={onInc} onDec={onDec} onRemove={onRemove} />)
        )}
      </div>

      <div className="p-5 border-t border-gray-100 space-y-3">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Discount</span>
          <input
            type="number" min="0" value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-24 text-right rounded-lg border border-gray-200 px-2 py-1 text-sm focus-ring"
            placeholder="0"
          />
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
          <span>Total</span><span>Rs. {total.toLocaleString()}</span>
        </div>

        <PaymentSection value={paymentMethod} onChange={setPaymentMethod} />

        <button
          onClick={onComplete}
          disabled={cart.length === 0 || completing}
          className="w-full py-4 rounded-xl bg-success-600 hover:bg-success-700 text-white font-bold text-base tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
        >
          {completing ? "SAVING..." : "COMPLETE SALE"}
        </button>
      </div>
    </div>
  )
}
