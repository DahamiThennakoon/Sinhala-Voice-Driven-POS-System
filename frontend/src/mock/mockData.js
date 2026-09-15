// Mock data used as a fallback whenever the Flask backend doesn't yet
// implement an endpoint. Keeping this in one place (instead of scattering
// fake values through components) makes it obvious what's real and what's
// still a stand-in, and it's the only file you need to delete from once
// every endpoint below is implemented server-side.

export const mockItems = [
  { id: 1, name: "සහල්", category: "ධාන්‍ය", costPrice: 190, sellingPrice: 250, stock: 18, unit: "kg", lowStockThreshold: 10 },
  { id: 2, name: "පාන්", category: "බේකරි", costPrice: 40, sellingPrice: 60, stock: 25, unit: "piece", lowStockThreshold: 15 },
  { id: 3, name: "සීනි", category: "වියළි බඩු", costPrice: 150, sellingPrice: 180, stock: 8, unit: "kg", lowStockThreshold: 10 },
  { id: 4, name: "තේ", category: "පාන වර්ග", costPrice: 650, sellingPrice: 800, stock: 12, unit: "kg", lowStockThreshold: 5 },
  { id: 5, name: "පොල්", category: "එළවළු", costPrice: 60, sellingPrice: 80, stock: 30, unit: "piece", lowStockThreshold: 10 },
  { id: 6, name: "දෙහි", category: "එළවළු", costPrice: 10, sellingPrice: 15, stock: 4, unit: "piece", lowStockThreshold: 20 },
  { id: 7, name: "කිරි", category: "පාන වර්ග", costPrice: 100, sellingPrice: 120, stock: 0, unit: "liter", lowStockThreshold: 8 },
]

export const mockDashboard = {
  todayIncome: 25450.0,
  todayExpense: 8500.0,
  todayProfit: 16950.0,
  monthlyIncome: 485600.0,
  topSellers: [
    { item: "සහල්", quantity: 42, revenue: 10500 },
    { item: "සීනි", quantity: 30, revenue: 5400 },
    { item: "තේ", quantity: 12, revenue: 9600 },
    { item: "පාන්", quantity: 55, revenue: 3300 },
    { item: "පොල්", quantity: 20, revenue: 1600 },
  ],
  lowStock: [
    { item: "සීනි", quantity: 8, threshold: 10, unit: "kg" },
    { item: "දෙහි", quantity: 4, threshold: 20, unit: "piece" },
    { item: "කිරි", quantity: 0, threshold: 8, unit: "liter" },
  ],
  recentSales: [
    { id: 101, datetime: "2026-08-19 10:12", item: "සහල්", quantity: 2, total: 500, status: "Paid" },
    { id: 102, datetime: "2026-08-19 10:04", item: "තේ", quantity: 1, total: 800, status: "Paid" },
    { id: 103, datetime: "2026-08-19 09:47", item: "සීනි", quantity: 3, total: 540, status: "Pending" },
    { id: 104, datetime: "2026-08-19 09:30", item: "පාන්", quantity: 5, total: 300, status: "Paid" },
  ],
}

export const mockItemCategories = ["ධාන්‍ය", "බේකරි", "එළවළු", "පාන වර්ග", "වියළි බඩු", "කිරි නිෂ්පාදන", "සුලු ආහාර", "පිරිසිදුකරණ", "වෙනත්"]

export const mockExpenseCategories = ["බඩු මිලදී ගැනීම", "විදුලි බිල්", "ප්‍රවාහන වියදම්", "සේවක වැටුප්", "වෙනත්"]

export const mockExpenses = [
  { id: 1, category: "විදුලි බිල්", amount: 4500, note: "ජූලි මාසේ බිල", date: "2026-08-18" },
  { id: 2, category: "බඩු මිලදී ගැනීම", amount: 12000, note: "සහල් සහ සීනි stock", date: "2026-08-17" },
  { id: 3, category: "ප්‍රවාහන වියදම්", amount: 1500, note: "බඩු ගෙන්වීම", date: "2026-08-16" },
]

export const mockSalesHistory = [
  { id: 101, date: "2026-08-19", item: "සහල්", quantity: 2, total: 500, paymentMethod: "Cash", status: "Paid" },
  { id: 102, date: "2026-08-19", item: "තේ", quantity: 1, total: 800, paymentMethod: "Card", status: "Paid" },
  { id: 103, date: "2026-08-18", item: "සීනි", quantity: 3, total: 540, paymentMethod: "Cash", status: "Pending" },
  { id: 104, date: "2026-08-18", item: "පාන්", quantity: 5, total: 300, paymentMethod: "Cash", status: "Paid" },
  { id: 105, date: "2026-08-17", item: "පොල්", quantity: 4, total: 320, paymentMethod: "Other", status: "Paid" },
]

export const mockReports = {
  dailySales: [
    { day: "Mon", sales: 18000, expenses: 6000 },
    { day: "Tue", sales: 22000, expenses: 5200 },
    { day: "Wed", sales: 19500, expenses: 7100 },
    { day: "Thu", sales: 25450, expenses: 8500 },
    { day: "Fri", sales: 21000, expenses: 4800 },
    { day: "Sat", sales: 31000, expenses: 9200 },
    { day: "Sun", sales: 27500, expenses: 6100 },
  ],
  monthlySummary: { income: 485600, expenses: 142300, profit: 343300 },
}
