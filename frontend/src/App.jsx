import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ToastProvider } from "./components/common/Toast"
import LoadingSpinner from "./components/common/LoadingSpinner"

import Login from "./pages/Login"
import Register from "./pages/Register"
import AppLayout from "./pages/AppLayout"
import Dashboard from "./pages/Dashboard"
import POS from "./pages/POS"
import Items from "./pages/Items"
import Stock from "./pages/Stock"
import Expenses from "./pages/Expenses"
import SalesHistory from "./pages/SalesHistory"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"

function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth()
  if (!ready) return <LoadingSpinner full label="Loading..." />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/pos" replace />
  return children
}

function AuthRoute({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <LoadingSpinner full label="Loading..." />
  return children
}

function RootRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return <LoadingSpinner full label="Loading..." />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ProtectedRoute roles={["owner"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/pos" element={<POS />} />
              <Route path="/items" element={<ProtectedRoute roles={["owner"]}><Items /></ProtectedRoute>} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/sales-history" element={<SalesHistory />} />
              <Route path="/reports" element={<ProtectedRoute roles={["owner"]}><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute roles={["owner"]}><Settings /></ProtectedRoute>} />
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  )
}
