import {
  mockItems,
  mockDashboard,
  mockExpenseCategories,
  mockExpenses,
  mockSalesHistory,
  mockReports,
} from "./mock/mockData"

const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })
  if (!res.ok) {
    const err = new Error(`Request failed: ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

// small helper: try the real call, log + fall back to mock on failure
async function withFallback(realCall, mockValue, label) {
  try {
    return await realCall()
  } catch (err) {
    console.warn(`[api] "${label}" not available yet, using mock data.`, err.message)
    return mockValue
  }
}

// For writes (create/update/delete). Unlike withFallback, this does NOT
// swallow failures — a silent "pretend it worked" on a mutation is worse
// than an error, because the UI shows success while nothing was actually
// saved/changed/deleted on the server. Callers should catch this and show
// a real error state.
async function mutate(realCall, label) {
  try {
    return await realCall()
  } catch (err) {
    console.error(`[api] "${label}" failed - the change was NOT saved.`, err.message)
    throw err
  }
}

// ---------------- Auth (fully mocked for MVP — backend has no auth yet) ----------------
// Accounts are kept in localStorage. This is intentionally simple and is
// NOT secure; swap for POST /api/register + POST /api/login once the
// backend implements real authentication and hashed passwords.

const USERS_KEY = "pos_users"
const SESSION_KEY = "pos_session"

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

export async function registerUser({ name, shopName, email, password, role }) {
  const users = readUsers()
  if (users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists.")
  }
  const user = { id: Date.now(), name, shopName, email, password, role }
  users.push(user)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  const session = { id: user.id, name, shopName, email, role }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export async function loginUser({ email, password }) {
  const users = readUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error("Invalid email or password.")
  const session = { id: user.id, name: user.name, shopName: user.shopName, email: user.email, role: user.role }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function updateUserRecord(id, updates) {
  const users = readUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates }
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY)
}

// ---------------- Dashboard ----------------
export async function fetchDashboard(date) {
  return withFallback(
    async () => {
      const [report, stock, topSellers, alerts] = await Promise.all([
        request(`/api/report${date ? `?date=${date}` : ""}`),
        request("/api/stock"),
        request("/api/top-sellers"),
        request("/api/alerts"),
      ])
      return {
        todayIncome: report.todayIncome,
        todayExpense: report.todayExpense,
        todayProfit: report.todayProfit,
        monthlyIncome: report.monthlyIncome,
        monthlyExpense: report.monthlyExpense,
        monthlyProfit: report.monthlyProfit,
        recentSales: report.sales || [],
        topSellers: topSellers.map((t) => ({ item: t.Item, quantity: t.TotalQuantity, revenue: t.TotalRevenue })),
        lowStock: stock
          .filter((s) => Number(s.Quantity) <= Number(s.Threshold))
          .map((s) => ({ item: s.Item, quantity: s.Quantity, threshold: s.Threshold, unit: "" })),
        alerts,
      }
    },
    { ...mockDashboard, monthlyIncome: mockDashboard.monthlyIncome, alerts: [] },
    "GET /api/dashboard"
  )
}

// ---------------- Items ----------------
export async function fetchItems() {
  return withFallback(
    () => request("/api/items"),
    mockItems,
    "GET /api/items"
  )
}

export async function createItem(item) {
  return mutate(
    () => request("/api/items", {
      method: "POST",
      body: JSON.stringify({
        name: item.name, category: item.category, costPrice: item.costPrice,
        sellingPrice: item.sellingPrice, unit: item.unit,
        stock: item.stock, lowStockThreshold: item.lowStockThreshold,
      }),
    }),
    "POST /api/items"
  )
}

export async function updateItem(id, item) {
  return mutate(
    () => request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(item) }),
    "PUT /api/items/:id"
  )
}

export async function deleteItem(id) {
  return mutate(
    () => request(`/api/items/${id}`, { method: "DELETE" }),
    "DELETE /api/items/:id"
  )
}

// ---------------- Sales ----------------
export async function fetchSalesHistory() {
  return withFallback(
    async () => {
      const sales = await request("/api/sales")
      return sales.map((s) => ({
        id: s.ID, date: s.Date, item: s.Item, quantity: s.Quantity,
        total: s.Total, paymentMethod: s.PaymentMethod || "Cash", status: "Paid",
      }))
    },
    mockSalesHistory,
    "GET /api/sales"
  )
}

export async function createSale(sale) {
  return mutate(
    () => request("/api/sales", { method: "POST", body: JSON.stringify(sale) }),
    "POST /api/sales"
  )
}

// ---------------- Stock ----------------
export async function fetchStock() {
  return withFallback(
    () => request("/api/stock"),
    mockItems.map((i) => ({ ID: i.id, Item: i.name, Quantity: i.stock, Threshold: i.lowStockThreshold })),
    "GET /api/stock"
  )
}

export async function updateStock(item, quantity, threshold) {
  return mutate(
    () => request("/api/stock", { method: "POST", body: JSON.stringify({ item, quantity, threshold }) }),
    "PUT /api/stock/:id"
  )
}

// ---------------- Expenses ----------------
export async function fetchExpenseCategories() {
  return mockExpenseCategories // static reference list, not backend-dependent
}

export async function fetchExpenses() {
  return withFallback(
    async () => {
      const rows = await request("/api/expenses")
      return rows.map((e) => ({
        id: e.ID, category: e.Category, amount: e.Amount, note: e.Note, date: e.Date,
      }))
    },
    mockExpenses,
    "GET /api/expenses"
  )
}

export async function createExpense(expense) {
  return mutate(
    () => request("/api/expenses", { method: "POST", body: JSON.stringify(expense) }),
    "POST /api/expenses"
  )
}

export async function updateExpense(id, expense) {
  return mutate(
    () => request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(expense) }),
    "PUT /api/expenses/:id"
  )
}

export async function deleteExpense(id) {
  return mutate(
    () => request(`/api/expenses/${id}`, { method: "DELETE" }),
    "DELETE /api/expenses/:id"
  )
}

// ---------------- Alerts ----------------
export async function fetchAlerts() {
  return withFallback(() => request("/api/alerts"), [], "GET /api/alerts")
}

export async function dismissAlert(id) {
  return mutate(() => request(`/api/alerts/${id}/seen`, { method: "POST" }), "POST /api/alerts/:id/seen")
}

// ---------------- Reports ----------------
export async function fetchReports() {
  return withFallback(async () => {
    const [report, weekly] = await Promise.all([
      request("/api/report"),
      request("/api/reports/weekly"),
    ])
    return {
      dailySales: weekly.map((w) => ({ day: w.day, sales: w.sales, expenses: w.expenses })),
      monthlySummary: {
        income: report.monthlyIncome,
        expenses: report.monthlyExpense,
        profit: report.monthlyProfit,
      },
    }
  }, mockReports, "GET /api/reports")
}

// ---------------- Settings ----------------
export async function fetchSettings() {
  return withFallback(
    () => request("/api/settings"),
    {
      shopName: "", ownerName: "", currency: "LKR (Rs.)",
      lowStockThreshold: 10, language: "Sinhala + English",
    },
    "GET /api/settings"
  )
}

export async function updateSettings(settings) {
  return mutate(
    () => request("/api/settings", { method: "POST", body: JSON.stringify(settings) }),
    "POST /api/settings"
  )
}

// ---------------- Voice ----------------
function mockVoiceResult() {
  const pool = mockItems.filter((i) => i.stock > 0)
  const item = pool[Math.floor(Math.random() * pool.length)]
  const quantity = 1 + Math.floor(Math.random() * 3)
  return {
    transcript: `${item.name} කිලෝ ${quantity}ක් විකුණුවා`,
    type: "sale",
    item: item.name,
    quantity,
    unit: item.unit,
    price: item.sellingPrice,
    total: item.sellingPrice * quantity,
  }
}

export async function transcribeVoice() {
  try {
    return await request("/api/voice", { method: "POST" })
  } catch (err) {
    console.warn('[api] "POST /api/voice" not available yet, using a mock transcription.', err.message)
    // small delay so the "processing" state in the UI is visible during testing
    await new Promise((r) => setTimeout(r, 900))
    return mockVoiceResult()
  }
}

export async function confirmVoiceSale(data) {
  return mutate(
    () => request("/api/sales", { method: "POST", body: JSON.stringify(data) }),
    "POST /api/sales (voice confirm)"
  )
}

// Legacy one-shot endpoint that IS implemented server-side today
// (records + transcribes + extracts + saves immediately, no confirm step).
export async function submitVoiceEntry() {
  return request("/api/voice_entry", { method: "POST" })
}