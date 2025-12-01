import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Categories from './pages/Categories'
import CategoryForm from './pages/CategoryForm'
import Sizes from './pages/Sizes'
import SizeForm from './pages/SizeForm'
import Colors from './pages/Colors'
import ColorForm from './pages/ColorForm'
import Orders from './pages/Orders'
import ContactMessages from './pages/ContactMessages'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <div className="flex-1 ml-64">
                  <Routes>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/new" element={<ProductForm />} />
                    <Route path="products/edit/:id" element={<ProductForm />} />
                    <Route path="categories" element={<Categories />} />
                    <Route path="categories/new" element={<CategoryForm />} />
                    <Route path="categories/edit/:id" element={<CategoryForm />} />
                    <Route path="sizes" element={<Sizes />} />
                    <Route path="sizes/new" element={<SizeForm />} />
                    <Route path="sizes/edit/:id" element={<SizeForm />} />
                    <Route path="colors" element={<Colors />} />
                    <Route path="colors/new" element={<ColorForm />} />
                    <Route path="colors/edit/:id" element={<ColorForm />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="contact-messages" element={<ContactMessages />} />
                    <Route path="settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

export default App

