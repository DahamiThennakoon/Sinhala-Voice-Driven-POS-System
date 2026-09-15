import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"
import Header from "../components/layout/Header"
import ProductSearch from "../components/pos/ProductSearch"
import Cart from "../components/pos/Cart"
import VoiceButton from "../components/pos/VoiceButton"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { fetchItems, createSale } from "../api"
import { useToast } from "../components/common/Toast"

export default function POS() {
  const { openMobileNav } = useOutletContext()
  const { push } = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const [cart, setCart] = useState([])

  const [discount, setDiscount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [completing, setCompleting] = useState(false)

  // Load products

  const load = async () => {
    setLoading(true)

    try {
      const data = await fetchItems()

      console.log("Products loaded:", data)

      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load products:", error)
      push("Products load කිරීමට නොහැකි විය.", "error")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Categories

  const categories = useMemo(() => {
    return [
      ...new Set(
        items
          .map((item) => item.category)
          .filter(Boolean)
      ),
    ]
  }, [items])

  // Search / filter

  const filtered = useMemo(() => {
    const searchText = query.toLowerCase().trim()

    return items.filter((item) => {
      const matchesCategory =
        category === "all" ||
        item.category === category

      const matchesSearch =
        !searchText ||
        String(item.name || "")
          .toLowerCase()
          .includes(searchText)

      return matchesCategory && matchesSearch
    })
  }, [items, query, category])

  // Add normal product to cart
  const addToCart = (item, qty = 1) => {
    if (!item) {
      console.error("addToCart received empty item")
      return
    }

    const quantity = Number(qty) || 1

    setCart((currentCart) => {
      const existing = currentCart.find(
        (line) => String(line.id) === String(item.id)
      )

      if (existing) {
        return currentCart.map((line) =>
          String(line.id) === String(item.id)
            ? {
                ...line,
                qty: Number(line.qty) + quantity,
              }
            : line
        )
      }

      return [
        ...currentCart,
        {
          ...item,
          qty: quantity,
        },
      ]
    })
  }

  // Voice result - Cart
  // IMPORTANT:
  // Backend returns result.items[]

  const addVoiceResultToCart = (voiceResult) => {
    console.log("VOICE RESULT RECEIVED:", voiceResult)

    if (!voiceResult) {
      push("Voice result එකක් ලැබුණේ නැහැ.", "error")
      return
    }

    const voiceItems = Array.isArray(voiceResult.items)
      ? voiceResult.items
      : []

    console.log("VOICE ITEMS:", voiceItems)

    if (voiceItems.length === 0) {
      push(
        "Voice එකෙන් කිසිම product එකක් හඳුනාගැනීමට නොහැකි විය.",
        "error"
      )
      return
    }

    let addedCount = 0

    voiceItems.forEach((voiceItem) => {
      if (!voiceItem) {
        return
      }

      const voiceItemName = String(
        voiceItem.item || ""
      ).trim()

      if (!voiceItemName) {
        console.warn("Voice item has no name:", voiceItem)
        return
      }

      const quantity =
        Number(voiceItem.quantity) || 1

      // Find same product from frontend items
      // First exact match
      // Then trimmed match

      let matchedItem = items.find(
        (item) =>
          String(item.name || "") === voiceItemName
      )

      if (!matchedItem) {
        matchedItem = items.find(
          (item) =>
            String(item.name || "").trim() ===
            voiceItemName.trim()
        )
      }

      // If backend name has tabs / spaces

      if (!matchedItem) {
        const cleanVoiceName =
          voiceItemName
            .replace(/\s+/g, " ")
            .trim()

        matchedItem = items.find((item) => {
          const cleanItemName =
            String(item.name || "")
              .replace(/\s+/g, " ")
              .trim()

          return cleanItemName === cleanVoiceName
        })
      }

      if (!matchedItem) {
        console.warn(
          "Product not found in frontend items:",
          voiceItemName
        )

        push(
          `"${voiceItemName}" product list එකේ නැහැ.`,
          "error"
        )

        return
      }

      // Add to existing cart

      addToCart(matchedItem, quantity)

      addedCount++

      console.log(
        "Added voice item:",
        matchedItem.name,
        quantity
      )
    })

    // Final message

    if (addedCount > 0) {
      push(
        `${addedCount} product${addedCount > 1 ? "s" : ""} cart එකට එකතු කළා.`,
        "success"
      )
    }
  }

  // Increase quantity

  const inc = (id) => {
    setCart((currentCart) =>
      currentCart.map((line) =>
        String(line.id) === String(id)
          ? {
              ...line,
              qty: Number(line.qty) + 1,
            }
          : line
      )
    )
  }

  // Decrease quantity

  const dec = (id) => {
    setCart((currentCart) =>
      currentCart.map((line) =>
        String(line.id) === String(id)
          ? {
              ...line,
              qty: Math.max(Number(line.qty) - 1, 1),
            }
          : line
      )
    )
  }

  // Remove item

  const remove = (id) => {
    setCart((currentCart) =>
      currentCart.filter(
        (line) => String(line.id) !== String(id)
      )
    )
  }

  // Complete sale

  const completeSale = async () => {
    if (cart.length === 0) {
      push("Cart එක හිස්.", "error")
      return
    }

    setCompleting(true)

    try {
      for (const line of cart) {
        await createSale({
          item: line.name,
          quantity: Number(line.qty),
          price: Number(line.sellingPrice),
          paymentMethod,
        })
      }

      const subtotal = cart.reduce(
        (sum, line) =>
          sum +
          Number(line.qty) *
            Number(line.sellingPrice),
        0
      )

      const discountAmount =
        Number(discount) || 0

      const finalTotal = Math.max(
        subtotal - discountAmount,
        0
      )

      push(
        `Sale completed — Rs. ${finalTotal.toLocaleString()}`,
        "success"
      )

      setCart([])
      setDiscount("")

      await load()
    } catch (error) {
      console.error(
        "Complete sale error:",
        error
      )

      push(
        "Sale complete කිරීමට නොහැකි විය.",
        "error"
      )
    } finally {
      setCompleting(false)
    }
  }

  // Render

  return (
    <>
      <Header
        title="New Sale"
        subtitle="සිංහල හඬෙන් හෝ ටච් කර විකුණුම් එකතු කරන්න"
        onMenuClick={openMobileNav}
      />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {loading ? (
          <LoadingSpinner
            full
            label="Loading products..."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:h-[calc(100vh-6.5rem)]">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 flex flex-col min-h-0 space-y-5">

              {/* VOICE */}
              <VoiceButton
                onAddToCart={addVoiceResultToCart}
              />

              {/* PRODUCTS */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <ProductSearch
                  items={filtered}
                  query={query}
                  setQuery={setQuery}
                  category={category}
                  setCategory={setCategory}
                  categories={categories}
                  onAdd={addToCart}
                />
              </div>

            </div>

            {/* RIGHT SIDE - CART */}
            <div className="lg:col-span-1 lg:h-full">
              <Cart
                cart={cart}
                onInc={inc}
                onDec={dec}
                onRemove={remove}
                discount={discount}
                setDiscount={setDiscount}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onComplete={completeSale}
                completing={completing}
              />
            </div>

          </div>
        )}
      </main>
    </>
  )
}