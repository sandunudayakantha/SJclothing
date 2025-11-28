import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import api from '../config/api'

const Navbar = () => {
  const [categories, setCategories] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { getCartCount } = useCart()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Silently fail - categories dropdown will just be empty
      // This prevents the app from breaking if backend is not available
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-accent">SJ Clothing</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-accent transition">
              Home
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-accent transition flex items-center">
                Categories
                <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="py-2">
                  {categories.map(category => (
                    <div key={category._id} className="px-4 py-2 hover:bg-gray-50">
                      <Link
                        to={`/products?category=${category._id}`}
                        className="block text-gray-700 hover:text-accent font-medium"
                      >
                        {category.name}
                      </Link>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <div className="mt-1 ml-4">
                          {category.subcategories.map(sub => (
                            <Link
                              key={sub._id}
                              to={`/products?category=${sub._id}`}
                              className="block text-sm text-gray-600 hover:text-accent py-1"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Link to="/products" className="text-gray-700 hover:text-accent transition">
              All Products
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-accent transition">
              Contact
            </Link>
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-accent transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {getCartCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <Link to="/" className="block py-2 text-gray-700 hover:text-accent">
              Home
            </Link>
            <Link to="/products" className="block py-2 text-gray-700 hover:text-accent">
              All Products
            </Link>
            {categories.map(category => (
              <div key={category._id} className="py-2">
                <Link
                  to={`/products?category=${category._id}`}
                  className="block text-gray-700 hover:text-accent font-medium"
                >
                  {category.name}
                </Link>
                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="ml-4 mt-1">
                    {category.subcategories.map(sub => (
                      <Link
                        key={sub._id}
                        to={`/products?category=${sub._id}`}
                        className="block text-sm text-gray-600 hover:text-accent py-1"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link to="/contact" className="block py-2 text-gray-700 hover:text-accent">
              Contact
            </Link>
            <Link to="/cart" className="block py-2 text-gray-700 hover:text-accent">
              Cart ({getCartCount()})
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

